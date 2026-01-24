import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./ThemeContext";
import { createRental } from "./api/api";

type RentalUI = {
  product_sn: string;
  start_date: Date;
  transaction_type: number;
  end_date: Date | null;
  qty: number;
  description: string;
};

const Outbound: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [newRental, setNewRental] = useState<Omit<RentalUI, "product_sn">>({
    start_date: new Date(),
    transaction_type: 2,
    end_date: new Date(),
    qty: 0,
    description: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRental((prevState) => ({
      ...prevState,
      [name]: name === "qty" ? parseFloat(value) : value,
    }));
  };

  const handleDateChange = (date: Date | null, field: "start_date" | "end_date") => {
    if (date) {
      setNewRental((prevState) => ({
        ...prevState,
        [field]: date,
      }));
    }
  };

  const handleAddRental = async () => {
    if (!productId) {
      toast.error("Product not found.");
      return;
    }

    if (!newRental.start_date || !newRental.qty) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      await createRental({
        product_sn: productId,
        start_date: moment(newRental.start_date).format("YYYY-MM-DD HH:mm:ss"),
        transaction_type: 2,
        end_date: newRental.end_date ? moment(newRental.end_date).format("YYYY-MM-DD HH:mm:ss") : null,
        qty: newRental.qty,
        description: newRental.description,
      });

      toast.success("Outbound record added successfully");
      setTimeout(() => navigate("/home"), 1200);
    } catch (error) {
      toast.error("Failed to add rental record");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <ToastContainer />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl font-bold mb-4">Add Outbound Record</h1>
        <ThemeToggle />
        <div className={`shadow-md rounded-lg p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="mt-2">
            <label htmlFor="new_rental_start_date" className="block text-sm font-medium">
              Start Date
            </label>
            <DatePicker
              selected={newRental.start_date}
              onChange={(date) => handleDateChange(date as Date, "start_date")}
              showTimeSelect
              dateFormat="Pp"
              popperClassName="react-datepicker-popper"
              className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${
                isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"
              } focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
            />

            <label htmlFor="new_rental_end_date" className="block text-sm font-medium">
              End Date
            </label>
            <DatePicker
              selected={newRental.end_date}
              onChange={(date) => handleDateChange(date as Date, "end_date")}
              showTimeSelect
              dateFormat="Pp"
              popperClassName="react-datepicker-popper"
              className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${
                isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"
              } focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
            />

            <label htmlFor="new_rental_qty" className="block text-sm font-medium">
              Quantity
            </label>
            <input
              id="new_rental_qty"
              name="qty"
              type="number"
              required
              value={newRental.qty}
              onChange={handleInputChange}
              className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${
                isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"
              } focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
            />

            <label htmlFor="new_rental_description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="new_rental_description"
              name="description"
              value={newRental.description}
              onChange={handleInputChange}
              className={`mt-1 block w-full p-1.5 border-0 ring-1 ring-inset ${
                isDarkMode ? "ring-gray-700 bg-gray-700 text-white" : "ring-gray-300"
              } focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
            ></textarea>
          </div>

          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
            <button
              onClick={handleAddRental}
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Add
            </button>
            <button
              onClick={() => navigate("/home")}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Outbound;