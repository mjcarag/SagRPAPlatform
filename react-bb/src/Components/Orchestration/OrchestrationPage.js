import React, { useEffect, useState } from 'react';
import BotPerformance from './BotPerformance';
import ActivityLog from './ActivityLog';
import Container from 'react-bootstrap/Container';
import Layout  from '../Template';  
import '../css/orchestration.css'; // Import your CSS file

import { MdDashboard } from "react-icons/md";
import { FaCog, FaSignOutAlt } from "react-icons/fa";


const OrchestrationPage = () => {
  const [performance, setPerformance] = useState({});
  const [logs, setLogs] = useState([]);
   const [sideBarToggle, setSideBarToggle] = useState(true);
    const [sidebarRef, setSidebarRef] = useState(null);

  useEffect(() => {
    // Fetch orchestration data
    fetch('http://localhost:5000/api/orchestration')
      .then((res) => res.json())
      .then((data) => {
        setPerformance(data.performance);
        setLogs(data.logs);
      });
  }, []);

  return (
    <div className="app">
      <aside ref={sidebarRef} className={`sidebar ${sideBarToggle ? 'visible' : ""}`}>
        <ul className="sidebar-menu">
          <li  ><MdDashboard />Dashboard</li>
          <li><FaCog /> Settings</li>
          <li className="logout"><FaSignOutAlt /> Logout</li>
        </ul>
      </aside>

      <Layout>
        <main>  
          <Container fluid className="full-width-container">
            <h2>Orchestration Dashboard</h2>
            <BotPerformance performance={performance} />
            <ActivityLog logs={logs} />
          </Container>
        </main>
      </Layout>
    </div>
  );
};

export default OrchestrationPage;
