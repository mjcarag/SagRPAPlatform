import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { FaUser, FaLock  } from "react-icons/fa";
import axios from 'axios';
import './css/Login.css';

const LoginForm = ({onLogin}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const serverIP = "http://localhost:5000/";
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/login', { username, password });
            if (res.data.success) {
            onLogin(res.data.user); // optional user data
            } else {
            setError(res.data.message);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        }
    };
    
    const addUser = () => {
        const newItem = { content: `UIElement`, actionType: "UIElement"  };
        fetch(serverIP + "api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        })
          .then((res) => res.json())
          .catch((err) => console.error("Error adding item:", err));
    
      };
  return (
    <div className="login-form">
        <div className="wrapper">
            {error && <Alert variant="danger">{error}</Alert>}
            <form method="post" onSubmit={handleLogin}>
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" placeholder="Username"  value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <FaUser className="icon"/>
                </div>
                <div className="input-box">
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <FaLock className="icon"/>
                </div>
                <div className="remember-forgot">
                    <label><input type="checkbox" /> Remember me</label>
                    <a href="#">Forgot password?</a>
                </div>
                <div className="input-box">
                    <button type="submit">Login</button>
                </div>
            </form><li onClick={addUser}> ngao </li>
        </div>
    </div>
  );
};

export default LoginForm;