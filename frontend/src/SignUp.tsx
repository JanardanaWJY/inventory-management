import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import eyeOpen from './assets/logo/eye-open.png';
import eyeClosed from './assets/logo/eye-closed.png';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './ThemeContext';

interface Errors {
  name?: string;
  password?: string;
  confirmPassword?: string;
}

function SignUp() {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z0-9_ ]+$/;
    return nameRegex.test(name);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^[a-zA-Z0-9_]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let validationErrors: Errors = {};

    if (!validateName(name)) {
      validationErrors.name = 'Name can only contain letters, numbers, spaces, and underscores.';
    }

    if (!validatePassword(password)) {
      validationErrors.password = 'Password must be at least 8 characters long and can contain letters, numbers, and underscores.';
    }

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post('http://localhost:8080/register', {
        password,
        name
      });
      navigate('/', { state: { message: 'User registered successfully' } });
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error('An error occurred');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${isDarkMode ? 'dark' : ''}`}>
      <ToastContainer />
      <ThemeToggle />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center">
          <h2 className={`ml-2 text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sign up</h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`mt-1 block w-full h-7 p-1.5 border-0 ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-300'} focus:ring-2 focus:ring-inset ${isDarkMode ? 'focus:ring-indigo-600' : 'focus:ring-indigo-600'} shadow-sm sm:text-sm rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
                {errors.name && <p className="mt-2 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`mt-1 block w-full h-7 p-1.5 pr-10 border-0 ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-300'} focus:ring-2 focus:ring-inset ${isDarkMode ? 'focus:ring-indigo-600' : 'focus:ring-indigo-600'} shadow-sm sm:text-sm rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 py-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <img
                      src={showPassword ? eyeOpen : eyeClosed}
                      alt={showPassword ? 'Hide password' : 'Show password'}
                      className="h-4 w-4"
                    />
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirm-password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`mt-1 block w-full h-7 p-1.5 pr-10 border-0 ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-300'} focus:ring-2 focus:ring-inset ${isDarkMode ? 'focus:ring-indigo-600' : 'focus:ring-indigo-600'} shadow-sm sm:text-sm rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 py-1"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <img
                      src={showConfirmPassword ? eyeOpen : eyeClosed}
                      alt={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="h-4 w-4"
                    />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'} hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-indigo-500' : 'focus:ring-indigo-500'}`}
                >
                  Sign Up
                </button>
              </div>
            </form>

            <p className={`mt-2 text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link to="/" className={`font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} hover:text-indigo-500`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
