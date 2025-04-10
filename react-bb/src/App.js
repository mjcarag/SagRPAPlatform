import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/LoginForm';
import Dashboard from './Components/Main'; // your main page after login
import LandingDev from './Components/Landing_dev';
import LandingRunner from './Components/Landing_runner';
import RoleBasedRedirect from './Components/RoleBasedRedirect';
function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <RoleBasedRedirect user={user} /> : <Login onLogin={setUser} />} />
        {/* <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} /> */}
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Dashboard user={user} />} />
        <Route path="/landing_dev" element={user && user.role === 'developer' ? <LandingDev user={user} /> : <Navigate to="/" />} />
        <Route path="/landing_runner" element={user && user.role === 'runner' ? <LandingRunner user={user} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
