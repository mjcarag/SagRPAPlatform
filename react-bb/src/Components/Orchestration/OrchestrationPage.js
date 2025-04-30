import React, { useEffect, useState } from 'react';
import BotPerformance from './BotPerformance';
import ActivityLog from './ActivityLog';
import Container from 'react-bootstrap/Container';
import Layout from '../Template';
import '../css/orchestration.css';

import { MdDashboard } from 'react-icons/md';
import { FaCog, FaSignOutAlt, FaPlay, FaPause } from 'react-icons/fa';

const FolderTree = ({ onProjectClick }) => {
  const [openFolders, setOpenFolders] = useState({});

  const toggleFolder = (folderName) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));

    if (folderName === 'folder1') {
      onProjectClick();
    }
  };

  return (
    <div>
      <h5>Project Folders</h5>
      <div style={{ marginTop: '30px' }}>
        <div onClick={() => toggleFolder('folder1')} style={{ cursor: 'pointer', fontWeight: 'bold' }}>📁 Project A</div>
        {openFolders['folder1'] && (
          <ul style={{ marginLeft: '1rem' }}>
            <li>📁 SubFolder A</li>
          </ul>
        )}
      </div>
    </div>
  );
};

const OrchestrationPage = () => {
  const [performance, setPerformance] = useState({});
  const [logs, setLogs] = useState([]);
  const [sideBarToggle, setSideBarToggle] = useState(true);
  const [sidebarRef, setSidebarRef] = useState(null);
  const [showContainer, setShowContainer] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const [showFolderTree, setShowFolderTree] = useState(false);
  const [tableData, setTableData] = useState([
    {
      name: 'COB Bot',
      version: '1.0.0',
      status: 'Inactive',
      compatibility: 'Windows 10',
      description: 'Automates end-of-day processing tasks that are typically executed after business hours',
      isRunning: false
    },
    {
      name: 'Duplicate Bot',
      version: '2.5.3',
      status: 'Active',
      compatibility: 'Cross-platform',
      description: 'Identifies and flags duplicate entries across datasets, applications, or systems.',
      isRunning: true 
    },
    {
      name: 'External Pricing',
      version: '3.1.2',
      status: 'Inactive',
      compatibility: 'Windows & Mac',
      description: 'Automates the retrieval of product or service pricing from external sources.',
      isRunning: false
    },
  ]);

  useEffect(() => {
    fetch('http://localhost:5000/api/orchestration')
      .then((res) => res.json())
      .then((data) => {
        setPerformance(data.performance);
        setLogs(data.logs);
      });
  }, []);

  const toggleRunState = (index) => {
    console.log('Clicked play/pause for index:', index);
    setTableData((prev) => {
      const newData = [...prev];
      newData[index].isRunning = !newData[index].isRunning;
      newData[index].status = newData[index].isRunning ? 'Active' : 'Inactive';
      return newData;
    });
  };

  return (
    <div className="app" style={{ fontFamily: 'Lexend, sans-serif' }}>
      <aside ref={sidebarRef} className={`sidebar ${sideBarToggle ? 'visible' : ''}`}>
        <ul className="sidebar-menu" style={{ marginTop: '30px' }}>
          <li
            className={activeMenu === 'orchestration' ? 'active' : ''}
            onClick={() => {
              setShowFolderTree(!showFolderTree);
              setActiveMenu('orchestration');
              setShowContainer(false);
            }}
          >
            <MdDashboard /> Control Room
          </li>
          <li
            className={activeMenu === 'dashboard' ? 'active' : ''}
            onClick={() => {
              setShowContainer(false);
              setShowFolderTree(false);
              setActiveMenu('dashboard');
            }}
          >
            <MdDashboard /> Dashboard
          </li>
          <li><FaCog /> Settings</li>
          <li className="logout"><FaSignOutAlt /> Logout</li>
        </ul>
      </aside>

      <Layout>
        <Container fluid className="full-width-container" style={{ marginTop: '80px' }}>
          <div className="mx-auto" style={{ maxWidth: '1600px', display: 'flex' }}>

            {showFolderTree && (
              <div
                style={{
                  width: '220px',
                  height: '1000px',
                  marginLeft: '60px',
                  marginRight: '10px',
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                }}
              >
                <FolderTree onProjectClick={() => setShowContainer(!showContainer)} />
              </div>
            )}

            {showContainer && (
              <div style={{ flex: 1, marginTop: '30px' }}>
                <table className="table table-striped table-hover datatable table-bordered bg-white-op" id="tblEmpListBody">
                  <thead>
                    <tr>
                      <th data-field="cb" data-checkbox="true" className="cb">
                        <span className="custom-checkbox1 cb">
                          <input type="checkbox" id="selectAll" />
                          <label htmlFor="selectAll"></label>
                        </span>
                      </th>
                      <th data-field="Name">Name</th>
                      <th data-field="Version">Version</th>
                      <th data-field="Status">Status</th>
                      <th data-field="Compatibility">Compatibility</th>
                      <th data-field="Description">Description</th>
                      <th data-field="Button"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <input type="checkbox" id={`item-${index}`} />
                        </td>
                        <td>{item.name}</td>
                        <td>{item.version}</td>
                        <td style={{ backgroundColor: item.status === 'Active' ? '#d4edda' : '' }}>{item.status}</td>
                        <td>{item.compatibility}</td>
                        <td>{item.description}</td>
                        <td>
                          {item.isRunning ? (
                            <FaPause
                              style={{ cursor: 'pointer', color: '#dc3545' }}
                              onClick={() => {
                                console.log('Clicked:', index);
                                toggleRunState(index);
                              }}
                            />
                          ) : (
                            <FaPlay
                              style={{ cursor: 'pointer', color: '#0d6efd' }}
                              onClick={() => {
                                console.log('Clicked:', index);
                                toggleRunState(index);
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Container>
      </Layout>
    </div>
  );
};

export default OrchestrationPage;
