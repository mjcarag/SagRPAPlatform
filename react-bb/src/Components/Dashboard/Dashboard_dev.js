import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col,  } from "react-bootstrap";
import Layout  from '../Template';  
import './Dashboard.css'; // Import your CSS file
import { useNavigate } from "react-router-dom";

import { MdDashboard } from "react-icons/md";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import FileExplorer from './FileExplorer'; // Import your FileNode component


const OrchestrationPage = () => {
    const navigate = useNavigate();
    
    const [sideBarToggle, setSideBarToggle] = useState(true);
    const [sidebarRef, setSidebarRef] = useState(null);
    const handleProjectSelect = (project) => {
    // You can now navigate, open control room, or load project data
    console.log("Selected Project:", project);
    // For example, navigate to control room page
    // navigate(`/control-room/${project.projectId}`);
    navigate(`/dashboard/${project.projectId}`);
  };
      
    useEffect(() => {
        
    }, []);

    return (
        <div className="app">
            <aside ref={sidebarRef} className={`sidebar ${sideBarToggle ? 'visible' : ""}`}>
                <ul className="sidebar-menu">
                <li  ><MdDashboard />Dashboard</li>
                <li  ><MdDashboard />Orchestration</li>
                <li><FaCog /> Settings</li>
                <li className="logout"><FaSignOutAlt /> Logout</li>
                </ul>
            </aside>
            
                <FileExplorer onProjectSelect={handleProjectSelect} />
           
            <Layout>
            <main className="main-content">  
                <Container fluid>
                <Row style={{ marginTop: '20px' }}> 
                    <Col>
                        ngao
                    </Col>
                </Row>
                <Row>
                    <Col>
                    
                    </Col>
                </Row>
                </Container>
        
            </main>   
            </Layout>
        </div>
    );
};

export default OrchestrationPage;
