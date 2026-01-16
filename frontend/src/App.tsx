import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignUp from './SignUp';
import Login from './Login';
import Home from './Home';
import Inbound from './Inbound';
import Outbound from './Outbound';

function DemoLogin({ onLogin }: { onLogin: (v: boolean) => void }) {
  useEffect(() => {
    onLogin(true);
  }, [onLogin]);

  return <Navigate to="/home" replace />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const setIsLoggedInPersist = useMemo(() => {
    return (value: boolean) => {
      setIsLoggedIn(value);
      localStorage.setItem('isLoggedIn', String(value));
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', String(isLoggedIn));
  }, [isLoggedIn]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedInPersist} />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/demo" element={<DemoLogin onLogin={setIsLoggedInPersist} />} />

        <Route
          path="/home"
          element={isLoggedIn ? <Home setIsLoggedIn={setIsLoggedInPersist} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/inbound/:productId"
          element={isLoggedIn ? <Inbound /> : <Navigate to="/" replace />}
        />
        <Route
          path="/outbound/:productId"
          element={isLoggedIn ? <Outbound /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
