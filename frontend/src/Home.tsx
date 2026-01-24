import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import "./index.css";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./ThemeContext";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getRentals,
  updateRental,
  deleteRental,
} from "./api/api";
import type { Product as ApiProduct, Rental as ApiRental } from "./api/api";

type ProductUI = {
  product_sn: string;
  purchase_date: Date;
  name: string;
  price: number;
  vendor: string;
  description: string;
};

type RentalUI = {
  product_sn: string;
  start_date: Date;
  transaction_type: number;
  end_date: Date | null;
  qty: number;
  description: string;
};

interface HomeProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const generateProductSN = (): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomLetters = "";
  for (let i = 0; i < 5; i++) {
    randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const randomNumber = Math.floor(100 + Math.random() * 900);
  return `${randomLetters}${randomNumber}`;
};

const toApiProduct = (p: ProductUI): ApiProduct => {
  return {
    product_sn: p.product_sn,
    purchase_date: moment(p.purchase_date).format("YYYY-MM-DD HH:mm:ss"),
    name: p.name,
    price: p.price,
    vendor: p.vendor,
    description: p.description,
  };
};

const Home: React.FC<HomeProps> = ({ setIsLoggedIn }) => {
  const [products, setProducts] = useState<ProductUI[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductUI[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [descriptionToShow, setDescriptionToShow] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<ProductUI, "product_sn">>({
    purchase_date: new Date(),
    name: "",
    price: 0,
    vendor: "",
    description: "",
  });
  const [editProduct, setEditProduct] = useState<ProductUI | null>(null);
  const [showRentalsModal, setShowRentalsModal] = useState(false);
  const [showAddRentalOptionsModal, setShowAddRentalOptionsModal] = useState(false);
  const [selectedProductSN, setSelectedProductSN] = useState<string | null>(null);
  const [rentals, setRentals] = useState<RentalUI[]>([]);
  const [editRental, setEditRental] = useState<RentalUI | null>(null);

  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      const productsWithDates: ProductUI[] = data.map((product: ApiProduct) => ({
        ...product,
        purchase_date: moment(product.purchase_date).toDate(),
      }));
      setProducts(productsWithDates);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const fetchRentals = async (product_sn: string) => {
    try {
      const data = await getRentals(product_sn);
      const rentalsWithDates: RentalUI[] = data.map((rental: ApiRental) => ({
        ...rental,
        start_date: moment(rental.start_date).toDate(),
        end_date: rental.end_date ? moment(rental.end_date).toDate() : null,
      }));
      setRentals(rentalsWithDates);
    } catch (error) {
      toast.error("Failed to fetch rental records");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.product_sn.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.vendor || !newProduct.purchase_date) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      const generatedSN = generateProductSN();
      const newProductWithSN: ProductUI = {
        ...newProduct,
        product_sn: generatedSN,
      };

      await createProduct(toApiProduct(newProductWithSN));
      await fetchProducts();

      setShowAddProductModal(false);
      setNewProduct({
        purchase_date: new Date(),
        name: "",
        price: 0,
        vendor: "",
        description: "",
      });
      toast.success("Product added successfully");
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  const handleEditProduct = async () => {
    if (!editProduct) return;

    try {
      await updateProduct(editProduct.product_sn, toApiProduct(editProduct));
      await fetchProducts();
      setEditProduct(null);
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const handleEditProductClick = (product: ProductUI) => {
    setEditProduct({
      ...product,
      purchase_date: new Date(product.purchase_date),
    });
  };

  const handleDeleteProduct = async (product_sn: string) => {
    try {
      await deleteProduct(product_sn);
      await fetchProducts();
      toast.success("Product and related rentals deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setProduct: React.Dispatch<React.SetStateAction<Omit<ProductUI, "product_sn">>>
  ) => {
    const { name, value } = e.target;
    setProduct((prevState) => ({
      ...prevState,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditProduct((prevState) =>
      prevState
        ? {
            ...prevState,
            [name]: name === "price" ? parseFloat(value) : value,
          }
        : null
    );
  };

  const handleDateChange = (
    date: Date | null,
    setProduct: React.Dispatch<React.SetStateAction<Omit<ProductUI, "product_sn">>>
  ) => {
    if (date) {
      setProduct((prevState) => ({
        ...prevState,
        purchase_date: date,
      }));
    }
  };

  const handleEditDateChange = (date: Date | null) => {
    if (date) {
      setEditProduct((prevState) =>
        prevState
          ? {
              ...prevState,
              purchase_date: date,
            }
          : null
      );
    }
  };

  const handleRentalInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setRental: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const { name, value } = e.target;
    setRental((prevState: any) => ({
      ...prevState,
      [name]: name === "qty" || name === "transaction_type" ? parseFloat(value) : value,
    }));
  };

  const handleRentalDateChange = (
    date: Date | null,
    setRental: React.Dispatch<React.SetStateAction<any>>,
    field: "start_date" | "end_date"
  ) => {
    if (date) {
      setRental((prevState: any) => ({
        ...prevState,
        [field]: date,
      }));
    }
  };

  const handleEditRental = async () => {
    if (!editRental) return;

    try {
      await updateRental(editRental.product_sn, editRental.start_date, {
        transaction_type: editRental.transaction_type,
        end_date: editRental.end_date ? moment(editRental.end_date).format("YYYY-MM-DD HH:mm:ss") : null,
        qty: editRental.qty,
        description: editRental.description,
      });
      await fetchRentals(editRental.product_sn);
      setEditRental(null);
      toast.success("Rental record updated successfully");
    } catch (error) {
      toast.error("Failed to update rental record");
    }
  };

  const handleEditRentalClick = (rental: RentalUI) => {
    setEditRental({
      ...rental,
      start_date: new Date(rental.start_date),
      end_date: rental.end_date ? new Date(rental.end_date) : null,
    });
  };

  const handleDeleteRental = async (product_sn: string, start_date: Date) => {
    try {
      await deleteRental(product_sn, start_date);
      await fetchRentals(product_sn);
      toast.success("Rental record deleted successfully");
    } catch (error) {
      toast.error("Failed to delete rental record");
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const [showRentalDescriptionModal, setShowRentalDescriptionModal] = useState(false);
  const [rentalDescriptionToShow, setRentalDescriptionToShow] = useState<string | null>(null);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <ToastContainer />
      <div className={`fixed top-0 left-0 right-0 z-10 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow`}>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-20 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <div className="flex space-x-4 items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`border ${isDarkMode ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300"} rounded-md px-3 py-2 w-64`}
            />
            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Add Product
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="mt-24 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="overflow-x-auto">
          <table className={`min-w-full shadow-md rounded-lg overflow-hidden w-full ${isDarkMode ? "bg-gray-800 text-white" : "bg-white"}`}>
            <thead className={`sticky top-0 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
              <tr>
                <th className="px-4 py-2 border">Serial Number</th>
                <th className="px-4 py-2 border">Purchase Date</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Vendor</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Records</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.product_sn}>
                  <td className="px-4 py-2 border">{product.product_sn}</td>
                  <td className="px-4 py-2 border">{product.purchase_date.toLocaleString()}</td>
                  <td className="px-4 py-2 border">{product.name}</td>
                  <td className="px-4 py-2 border">{product.vendor}</td>
                  <td className="px-4 py-2 border">{product.price} KRW</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => {
                        setDescriptionToShow(product.description);
                        setShowDescriptionModal(true);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => {
                        setSelectedProductSN(product.product_sn);
                        setShowAddRentalOptionsModal(true);
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded-md text-sm mr-2"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProductSN(product.product_sn);
                        fetchRentals(product.product_sn);
                        setShowRentalsModal(true);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleEditProductClick(product)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.product_sn)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddProductModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
              <div className={`bg-white px-4 pt-5 sm:p-6 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
                <div>
                  <h3 className="text-lg leading-6 font-medium">Add Product</h3>
                  <div className="mt-2">
                    <label htmlFor="new_purchase_date" className="block text-sm font-medium">
                      Purchase Date
                    </label>
                    <DatePicker
                      selected={newProduct.purchase_date}
                      onChange={(date) => handleDateChange(date as Date, setNewProduct)}
                      showTimeSelect
                      dateFormat="Pp"
                      popperClassName="react-datepicker-popper"
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="new_name" className="block text-sm font-medium">
                      Name
                    </label>
                    <input
                      id="new_name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={newProduct.name}
                      onChange={(e) => handleInputChange(e, setNewProduct)}
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="new_price" className="block text-sm font-medium">
                      Price
                    </label>
                    <input
                      id="new_price"
                      name="price"
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => handleInputChange(e, setNewProduct)}
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="new_vendor" className="block text-sm font-medium">
                      Vendor
                    </label>
                    <input
                      id="new_vendor"
                      name="vendor"
                      type="text"
                      required
                      value={newProduct.vendor}
                      onChange={(e) => handleInputChange(e, setNewProduct)}
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="new_description" className="block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="new_description"
                      name="description"
                      required
                      value={newProduct.description}
                      onChange={(e) => handleInputChange(e, setNewProduct)}
                      className={`mt-1 block w-full p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <button
                  onClick={handleAddProduct}
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDescriptionModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
              <div className={`bg-white px-4 pt-5 sm:p-6 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
                <div>
                  <h3 className="text-lg leading-6 font-medium">Product Description</h3>
                  <div className="mt-2">
                    <p>{descriptionToShow}</p>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRentalsModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
              <div className={`bg-white px-4 pt-5 sm:p-6 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
                <div>
                  <h3 className="text-lg leading-6 font-medium">Rental Records</h3>
                  <div className="mt-2">
                    <table className={`min-w-full shadow-md rounded-lg overflow-hidden w-full ${isDarkMode ? "bg-gray-800 text-white" : "bg-white"}`}>
                      <thead className={`sticky top-0 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
                        <tr>
                          <th className="px-4 py-2 border">Start Date</th>
                          <th className="px-4 py-2 border">Transaction Type</th>
                          <th className="px-4 py-2 border">End Date</th>
                          <th className="px-4 py-2 border">Quantity</th>
                          <th className="px-4 py-2 border">Description</th>
                          <th className="px-4 py-2 border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rentals.map((rental) => (
                          <tr key={`${rental.product_sn}-${rental.start_date.toISOString()}`}>
                            <td className="px-4 py-2 border">{rental.start_date.toLocaleString()}</td>
                            <td className="px-4 py-2 border">{rental.transaction_type === 1 ? "Inbound" : "Outbound"}</td>
                            <td className="px-4 py-2 border">{rental.end_date ? rental.end_date.toLocaleString() : "N/A"}</td>
                            <td className="px-4 py-2 border">{rental.qty}</td>
                            <td className="px-4 py-2 border">
                              <button
                                onClick={() => {
                                  setRentalDescriptionToShow(rental.description);
                                  setShowRentalDescriptionModal(true);
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                              >
                                View
                              </button>
                            </td>
                            <td className="px-4 py-2 border">
                              <button
                                onClick={() => handleEditRentalClick(rental)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRental(rental.product_sn, rental.start_date)}
                                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <button
                  onClick={() => setShowRentalsModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRentalDescriptionModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
              <div className={`bg-white px-4 pt-5 sm:p-6 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
                <div>
                  <h3 className="text-lg leading-6 font-medium">Rental Description</h3>
                  <div className="mt-2">
                    <p>{rentalDescriptionToShow}</p>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <button
                  onClick={() => setShowRentalDescriptionModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddRentalOptionsModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
              <div className={`bg-white px-4 pt-5 sm:p-6 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
                <div>
                  <h3 className="text-lg leading-6 font-medium">Choose Transaction Type</h3>
                  <div className="mt-2 flex justify-start gap-x-4">
                    <button
                      onClick={() => navigate(`/inbound/${selectedProductSN}`)}
                      className="bg-green-500 text-white px-3 py-2 rounded-md text-sm"
                    >
                      Inbound
                    </button>
                    <button
                      onClick={() => navigate(`/outbound/${selectedProductSN}`)}
                      className="bg-red-500 text-white px-3 py-2 rounded-md text-sm"
                    >
                      Outbound
                    </button>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <button
                  onClick={() => setShowAddRentalOptionsModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editProduct && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
              <div className={`bg-white px-4 pt-5 sm:p-6 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
                <div>
                  <h3 className="text-lg leading-6 font-medium">Edit Product</h3>
                  <div className="mt-2">
                    <label htmlFor="edit_purchase_date" className="block text-sm font-medium">
                      Purchase Date
                    </label>
                    <DatePicker
                      selected={editProduct?.purchase_date}
                      onChange={handleEditDateChange}
                      showTimeSelect
                      dateFormat="Pp"
                      popperClassName="react-datepicker-popper"
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="edit_name" className="block text-sm font-medium">
                      Name
                    </label>
                    <input
                      id="edit_name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={editProduct.name}
                      onChange={handleEditInputChange}
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="edit_price" className="block text-sm font-medium">
                      Price
                    </label>
                    <input
                      id="edit_price"
                      name="price"
                      type="number"
                      required
                      value={editProduct.price}
                      onChange={handleEditInputChange}
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="edit_vendor" className="block text-sm font-medium">
                      Vendor
                    </label>
                    <input
                      id="edit_vendor"
                      name="vendor"
                      type="text"
                      required
                      value={editProduct.vendor}
                      onChange={handleEditInputChange}
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="edit_description" className="block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="edit_description"
                      name="description"
                      required
                      value={editProduct.description}
                      onChange={handleEditInputChange}
                      className={`mt-1 block w-full p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <button
                  onClick={handleEditProduct}
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditProduct(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editRental && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
              <div className={`bg-white px-4 pt-5 sm:p-6 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}>
                <div>
                  <h3 className="text-lg leading-6 font-medium">Edit Rental Record</h3>
                  <div className="mt-2">
                    <label htmlFor="edit_rental_start_date" className="block text-sm font-medium">
                      Start Date
                    </label>
                    <DatePicker
                      selected={editRental.start_date}
                      onChange={(date) => handleRentalDateChange(date as Date, setEditRental as any, "start_date")}
                      showTimeSelect
                      dateFormat="Pp"
                      popperClassName="react-datepicker-popper"
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="edit_rental_end_date" className="block text-sm font-medium">
                      End Date
                    </label>
                    <DatePicker
                      selected={editRental.end_date}
                      onChange={(date) => handleRentalDateChange(date as Date, setEditRental as any, "end_date")}
                      showTimeSelect
                      dateFormat="Pp"
                      popperClassName="react-datepicker-popper"
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="edit_rental_transaction_type" className="block text-sm font-medium">
                      Transaction Type
                    </label>
                    <input
                      id="edit_rental_transaction_type"
                      name="transaction_type"
                      type="number"
                      required
                      value={editRental.transaction_type}
                      onChange={(e) => handleRentalInputChange(e, setEditRental as any)}
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="edit_rental_qty" className="block text-sm font-medium">
                      Quantity
                    </label>
                    <input
                      id="edit_rental_qty"
                      name="qty"
                      type="number"
                      required
                      value={editRental.qty}
                      onChange={(e) => handleRentalInputChange(e, setEditRental as any)}
                      className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    />
                    <label htmlFor="edit_rental_description" className="block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="edit_rental_description"
                      name="description"
                      value={editRental.description}
                      onChange={(e) => handleRentalInputChange(e, setEditRental as any)}
                      className={`mt-1 block w-full p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <button
                  onClick={handleEditRental}
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditRental(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;