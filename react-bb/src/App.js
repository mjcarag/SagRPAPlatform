import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/LoginForm';
import Dashboard from './Components/Main'; // your main page after login
import LandingDev from './Components/Landing_dev';
import LandingRunner from './Components/Landing_runner';
import RoleBasedRedirect from './Components/RoleBasedRedirect';
import OrchestrationPage from './Components/Orchestration/OrchestrationPage';


function App() {
  const [user, setUser] = useState(null);
 
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <RoleBasedRedirect user={user} />
            ) : (
              // <Login onLogin={setUser} />
              <Dashboard></Dashboard>
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user && user.role === 'Developer' ? (
              <Dashboard user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/landing_runner"
          element={
            user && user.role === 'Runner' ? (
              <LandingRunner user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/orchestration" element={<OrchestrationPage />} />
      </Routes>
    </Router>
  );
}



{/* <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Dashboard user={user} />} /> */}
export default App;
