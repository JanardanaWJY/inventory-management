import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './ThemeContext';

interface Rental {
  product_sn: string;
  start_date: Date;
  transaction_type: number;
  end_date: Date | null;
  qty: number;
  description: string;
}

const Inbound: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [newRental, setNewRental] = useState<Omit<Rental, 'product_sn'>>({
    start_date: new Date(),
    transaction_type: 1, // Inbound
    end_date: new Date(),
    qty: 0,
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRental(prevState => ({
      ...prevState,
      [name]: name === 'qty' ? parseFloat(value) : value
    }));
  };

  const handleDateChange = (date: Date | null, field: 'start_date' | 'end_date') => {
    if (date) {
      setNewRental(prevState => ({
        ...prevState,
        [field]: date
      }));
    }
  };

  const handleAddRental = async () => {
    if (!newRental.start_date || !newRental.qty) {
      toast.error('Please fill out all required fields.');
      return;
    }

    try {
      console.log("Adding rental:", { ...newRental, product_sn: productId });
      await axios.post('http://localhost:8080/rentals', { ...newRental, product_sn: productId });
      toast.success('Inbound record added successfully');
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error) {
      console.error('Error adding rental record:', error);
      toast.error('Failed to add rental record');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <ToastContainer />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl font-bold mb-4">Add Inbound Record</h1>
        <ThemeToggle />
        <div className={`shadow-md rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="mt-2">
            <label htmlFor="new_rental_start_date" className="block text-sm font-medium">Start Date</label>
            <DatePicker
              selected={newRental.start_date}
              onChange={(date) => handleDateChange(date as Date, 'start_date')}
              showTimeSelect
              dateFormat="Pp"
              popperClassName="react-datepicker-popper"
              className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? 'ring-gray-700 bg-gray-700 text-white' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
            />
            <label htmlFor="new_rental_end_date" className="block text-sm font-medium">End Date</label>
            <DatePicker
              selected={newRental.end_date}
              onChange={(date) => handleDateChange(date as Date, 'end_date')}
              showTimeSelect
              dateFormat="Pp"
              popperClassName="react-datepicker-popper"
              className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? 'ring-gray-700 bg-gray-700 text-white' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
            />
            <label htmlFor="new_rental_qty" className="block text-sm font-medium">Quantity</label>
            <input
              id="new_rental_qty"
              name="qty"
              type="number"
              required
              value={newRental.qty}
              onChange={handleInputChange}
              className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? 'ring-gray-700 bg-gray-700 text-white' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
            />
            <label htmlFor="new_rental_description" className="block text-sm font-medium">Description</label>
            <textarea
              id="new_rental_description"
              name="description"
              value={newRental.description}
              onChange={handleInputChange}
              className={`mt-1 block w-full p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? 'ring-gray-700 bg-gray-700 text-white' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-indigo-600 shadow-sm sm:text-sm rounded-md`}
            ></textarea>
          </div>
          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <button
              onClick={handleAddRental}
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"}
            >
              Add
            </button>
            <button
              onClick={() => navigate('/home')}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbound;
