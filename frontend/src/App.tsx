import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignUp from './SignUp';
import Login from './Login';
import Home from './Home';
import Inbound from './Inbound';
import Outbound from './Outbound';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <Router>
        <Routes>
          <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={isLoggedIn ? <Home setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />} />
          <Route path="/inbound/:productId" element={isLoggedIn ? <Inbound /> : <Navigate to="/" />} />
          <Route path="/outbound/:productId" element={isLoggedIn ? <Outbound /> : <Navigate to="/" />} />
        </Routes>
    </Router>
  );
}

export default App;
