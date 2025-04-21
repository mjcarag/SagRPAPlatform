// src/Components/Layout.js
import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import './css/layout.css';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar fixed="top" className="bg-topNav">
        <Container fluid>
          <Navbar.Brand href="#home" className="topNav-text">AI Copilot</Navbar.Brand>
          <Navbar.Toggle />
        </Container>
      </Navbar>

     
        {children}
      
    </>
  );
};

export default Layout;
