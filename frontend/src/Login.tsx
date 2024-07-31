import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import eyeOpen from './assets/logo/eye-open.png';
import eyeClosed from './assets/logo/eye-closed.png';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './ThemeContext';

interface LoginProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

interface Errors {
  name?: string;
  password?: string;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const validateName = (name: string): boolean => /^[a-zA-Z0-9_ ]+$/.test(name);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let validationErrors: Errors = {};

    if (!validateName(name)) {
      validationErrors.name = t('login.nameError');
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post('http://localhost:8080/login', {
        name,
        password
      });
      toast.success(t('login.successMessage'));
      setIsLoggedIn(true);
      setTimeout(() => navigate('/home'), 1000);
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error(t('login.errorMessage'));
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${isDarkMode ? 'dark' : ''}`}>
      <ToastContainer />
      <div className="absolute top-4 left-4">
        <select onChange={(e) => changeLanguage(e.target.value)} defaultValue={i18n.language} className={`appearance-none ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} border border-gray-300 py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}>
          <option value="en">English</option>
          <option value="id">Indonesian</option>
          <option value="fr">French</option>
          <option value="zh">Chinese</option>
          <option value="ko">Korean</option>
          <option value="ja">Japanese</option>
          <option value="es">Spanish</option>
        </select>
      </div>
      <ThemeToggle />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center">
          <h2 className={`ml-2 text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('login.title')}</h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('login.name')}
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
                  {t('login.password')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
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
                <button
                  type="submit"
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'} hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-indigo-500' : 'focus:ring-indigo-500'}`}
                >
                  {t('login.button')}
                </button>
              </div>
            </form>
            <p className={`mt-2 text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('login.signupPrompt')}{' '}
              <Link to="/signup" className={`font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} hover:text-indigo-500`}>
                {t('login.signupLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
