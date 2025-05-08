import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Layout from '../Template';
import '../css/orchestration.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';

import { MdDashboard } from 'react-icons/md';
import { FaCog, FaSignOutAlt, FaPlay, FaPause, FaPlus } from 'react-icons/fa';

const FolderTree = ({ onProjectClick, onSubfolderClick }) => {
  const [openFolders, setOpenFolders] = useState({});
  const [folders, setFolders] = useState([
    { name: 'Project A', subfolders: ['SubFolder A'] },
  ]);

  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, type: '', parentFolder: '', folderName: '' });
  const [renameModal, setRenameModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState('');
  const [showAddSubfolderModal, setShowAddSubfolderModal] = useState(false);
  const [newSubfolderName, setNewSubfolderName] = useState('');

  const toggleFolder = (folderName) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));

    if (folderName === 'Project A') {
      onProjectClick();
    }
  };

  const handleAddFolder = () => {
    if (newFolderName.trim() && !folders.find(f => f.name === newFolderName.trim())) {
      setFolders([...folders, { name: newFolderName.trim(), subfolders: [] }]);
    }
    setNewFolderName('');
    setShowAddFolderModal(false);
  };

  const handleContextMenu = (e, type, folderName, parentFolder = '') => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      type, // 'main' or 'sub'
      folderName,
      parentFolder
    });
  };

  const handleRename = () => {
    const updated = folders.map(folder => {
      if (contextMenu.type === 'main' && folder.name === contextMenu.folderName) {
        return { ...folder, name: folderToRename };
      } else if (contextMenu.type === 'sub' && folder.name === contextMenu.parentFolder) {
        return {
          ...folder,
          subfolders: folder.subfolders.map(sf =>
            sf === contextMenu.folderName ? folderToRename : sf
          ),
        };
      }
      return folder;
    });

    setFolders(updated);
    setRenameModal(false);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleDelete = () => {
    const updated = folders.filter(folder =>
      !(contextMenu.type === 'main' && folder.name === contextMenu.folderName)
    ).map(folder => {
      if (contextMenu.type === 'sub' && folder.name === contextMenu.parentFolder) {
        return {
          ...folder,
          subfolders: folder.subfolders.filter(sf => sf !== contextMenu.folderName),
        };
      }
      return folder;
    });

    setFolders(updated);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleAddSubfolder = () => {
    const updated = folders.map(folder => {
      if (folder.name === contextMenu.folderName) {
        return {
          ...folder,
          subfolders: [...folder.subfolders, newSubfolderName.trim()],
        };
      }
      return folder;
    });

    setFolders(updated);
    setNewSubfolderName('');
    setShowAddSubfolderModal(false);
  };

  return (
    <div onClick={() => setContextMenu({ ...contextMenu, visible: false })}>
      <div className="d-flex justify-content-between align-items-center"  >
        <h5>Project Folders</h5>
        <Button
        style={{
          marginTop: '-8px',
        }}       
          size="sm"
          variant="outline-secondary"
          onClick={() => setShowAddFolderModal(true)}
          title="Add Folder"
        >
          <FaPlus />
        </Button>
      </div>

      <div style={{ marginTop: '30px' }}>
        {folders.map((folder, index) => (
          <div key={index}>
            <div
              onClick={() => toggleFolder(folder.name)}
              onContextMenu={(e) => handleContextMenu(e, 'main', folder.name)}
              style={{
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '12px',
                marginBottom: '15px',
                fontSize: '1rem',
                color: '#212529',
              }}
            >
              📁 {folder.name}
            </div>
            {openFolders[folder.name] && (
              <ul style={{ marginLeft: '1rem' }}>
                {folder.subfolders.map((subfolder, idx) => (
                  <li
                  key={idx}
                  onClick={() => onSubfolderClick(subfolder)}
                  onContextMenu={(e) => handleContextMenu(e, 'sub', subfolder, folder.name)}
                  style={{
                    cursor: 'pointer',
                    paddingLeft: '',
                    marginTop: '6px',
                    fontSize: '0.95rem',
                    color: '#495057',
                  }}
                >
                  📁 {subfolder}
                </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '5px',
            zIndex: 1000,
            width: '200px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          }}
        >
          {contextMenu.type === 'main' && (
            <>
              <div
                style={{ padding: '8px 12px', cursor: 'pointer', }}
                onClick={() => {
                  setShowAddSubfolderModal(true);
                  setContextMenu({ ...contextMenu, visible: false });
                }}
              >
                ➕ Create Subfolder
              </div>
            </>
          )}
          <div
            style={{ padding: '8px 12px', cursor: 'pointer' }}
            onClick={() => {
              setFolderToRename(contextMenu.folderName);
              setRenameModal(true);
              setContextMenu({ ...contextMenu, visible: false });
            }}
          >
            ✏️ Rename
          </div>
          <div
            style={{ padding: '8px 12px', cursor: 'pointer', color: 'red' }}
            onClick={handleDelete}
          >
            🗑️ Delete
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      <Modal show={showAddFolderModal} onHide={() => setShowAddFolderModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder="Enter folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddFolderModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddFolder}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Subfolder Modal */}
      <Modal show={showAddSubfolderModal} onHide={() => setShowAddSubfolderModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Subfolder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder="Subfolder name"
            value={newSubfolderName}
            onChange={(e) => setNewSubfolderName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddSubfolderModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSubfolder}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rename Folder Modal */}
      <Modal show={renameModal} onHide={() => setRenameModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rename {contextMenu.type === 'main' ? 'Folder' : 'Subfolder'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder="New name"
            value={folderToRename}
            onChange={(e) => setFolderToRename(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRenameModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRename}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};



const OrchestrationPage = () => {
  const [sideBarToggle, setSideBarToggle] = useState(true);
  const [sidebarRef, setSidebarRef] = useState(null);
  const [showContainer, setShowContainer] = useState(false);
  const [activeMenu, setActiveMenu] = useState('home');
  const [showFolderTree, setShowFolderTree] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [confirmAction, setConfirmAction] = useState({ show: false, index: null, type: '' });
  const [selectedSubfolder, setSelectedSubfolder] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, folderName: '' });
  const [renameModal, setRenameModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState('');
  const [tableData, setTableData] = useState([
    {
      name: 'COB Bot',
      version: 'vdi-1',
      status: 'Inactive',
      compatibility: 'Windows 10',
      description: 'Automates end-of-day processing tasks that are typically executed after business hours',
      isRunning: false,
    },
    {
      name: 'Duplicate Bot',
      version: 'vdi-2',
      status: 'Active',
      compatibility: 'Cross-platform',
      description: 'Identifies and flags duplicate entries across datasets, applications, or systems.',
      isRunning: true,
    },
    {
      name: 'External Pricing',
      version: 'vdi-3',
      status: 'Inactive',
      compatibility: 'Windows & Mac',
      description: 'Automates the retrieval of product or service pricing from external sources.',
      isRunning: false,
    },
  ]);

  const [newBot, setNewBot] = useState({});
  const [folderPath, setFolderPath] = useState('\\Bots\\');
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleRunState = (index) => {
    setTableData((prev) => {
      const newData = [...prev];
      newData[index].isRunning = !newData[index].isRunning;
      newData[index].status = newData[index].isRunning ? 'Active' : 'Inactive';
      return newData;
    });
  };

  const handleAddBot = () => {
    if (isSaving) return;

    if (!newBot.name || newBot.name.trim() === '') {
      alert('Bot name is required');
      return;
    }

    if (!newBot.version || newBot.version.trim() === '') {
      alert('VM selection is required');
      return;
    }

    setIsSaving(true);
    setShowModal(false);
    setProgress(0);

    let progressValue = 0;
    const progressInterval = setInterval(() => {
      progressValue += 10;
      setProgress(progressValue);

      if (progressValue >= 100) {
        clearInterval(progressInterval);
        setIsSaving(false);
        setShowSuccess(true);

        setTableData((old) => {
          const exists = old.some((bot) => bot.name === newBot.name);
          if (!exists) {
            return [
              ...old,
              { ...newBot, status: 'Inactive', isRunning: false },
            ];
          }
          return old;
        });

        setNewBot({});
      }
    }, 650);
  };

  const handleFolderSelect = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const fullPath = files[0].webkitRelativePath || files[0].name;
      const folderName = fullPath.split('/')[0];
      setFolderPath('\\' + folderName + '\\');
    }
  };

  return (
    <div className="app" style={{ fontFamily: 'Lexend, sans-serif' }}>
      <aside ref={sidebarRef} className={`sidebar ${sideBarToggle ? 'visible' : ''}`}>
        <ul className="sidebar-menu" style={{ marginTop: '30px' }}>
          <li className={activeMenu === 'home' ? 'active' : ''} onClick={() => {
            setActiveMenu('home');
            setShowContainer(false);
            setShowFolderTree(false);
          }}>
            <MdDashboard /> Home
          </li>
          <li className={activeMenu === 'orchestration' ? 'active' : ''} onClick={() => {
            setShowFolderTree(!showFolderTree);
            setActiveMenu('orchestration');
            setShowContainer(false);
          }}>
            <MdDashboard /> Control Room
          </li>
          <li><FaCog /> Settings</li>
          <li className="logout"><FaSignOutAlt /> Logout</li>
        </ul>
      </aside>

      <Layout>
        <Container fluid className="full-width-container" style={{ marginTop: '80px' }}>
          <div className="mx-auto" style={{ maxWidth: '1600px', display: 'flex' }}>
            {showFolderTree && (
              <div style={{ width: '220px', height: '1000px', marginLeft: '60px', marginRight: '10px', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                <FolderTree
                  onProjectClick={() => setShowContainer(false)}
                  onSubfolderClick={(name) => {
                    setSelectedSubfolder(name);
                    setShowContainer(true);
                    {contextMenu.visible && (
                      <div
                        style={{
                          position: 'absolute',
                          top: contextMenu.y,
                          left: contextMenu.x,
                          background: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          zIndex: 1000,
                          padding: '5px 0',
                          minWidth: '120px',
                        }}
                        onMouseLeave={() => setContextMenu({ ...contextMenu, visible: false })}
                      >
                        <div
                          style={{ padding: '8px 12px', cursor: 'pointer' }}
                          onClick={() => {
                            setFolderToRename(contextMenu.folderName);
                            setRenameModal(true);
                            setContextMenu({ ...contextMenu, visible: false });
                          }}
                        >
                          Rename
                        </div>
                        <div
                          style={{ padding: '8px 12px', cursor: 'pointer', color: 'red' }}
                          onClick={() => {
                            alert(`Deleting ${contextMenu.folderName}`); // You can replace this with real delete logic
                            setContextMenu({ ...contextMenu, visible: false });
                          }}
                        >
                          Delete
                        </div>
                      </div>
                    )}
                  }}
                  
                />
              </div>
            )}

            {activeMenu === 'home' && (
              <div style={{ flex: 1, marginTop: '30px' }}>
                <div style={{ padding: '2rem', background: '#f1f3f5', borderRadius: '12px', textAlign: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                  <h4>Welcome to the Control Room!</h4>
                  <Button style={{ backgroundColor: '#E1BB80', borderColor: '#E1BB80', color: '#000' }} onClick={() => setShowModal(true)}>
                    Deploy Bot
                  </Button>
                </div>
              </div>
            )}

            {showContainer && (
              <div style={{ flex: 1, marginTop: '30px', marginLeft: '30px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>{selectedSubfolder}</h5>
                  <Button style={{ backgroundColor: '#E1BB80', borderColor: '#E1BB80', color: '#000' }} onClick={() => setShowModal(true)}>
                     Deploy Bot
                  </Button>
                </div>

                {/* Filter Controls */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex">
                    <input
                      type="text"
                      className="form-control me-2"
                      placeholder="Search bots..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ maxWidth: '300px' }}
                    />
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ maxWidth: '160px' }}
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="custom-table-container table-responsive">
                  <table className="table table-hover table-bordered bg-white">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '40px' }}><input type="checkbox" /></th>
                        <th>Name & Description</th>
                        <th>VM</th>
                        <th>Status</th>
                        <th>Compatibility</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData
                        .filter((item) =>
                          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .filter((item) => statusFilter === 'All' || item.status === statusFilter)
                        .map((item, index) => (
                          <tr key={index}>
                            <td><input type="checkbox" /></td>
                            <td>
                              <strong>{item.name}</strong><br />
                              <small className="text-muted">{item.description}</small>
                            </td>
                            <td>{item.version}</td>
                            <td>
                              <span className="badge rounded-pill px-3 py-2 text-white" style={{ backgroundColor: item.status === 'Active' ? '#28a745' : '#6c757d' }}>
                                {item.status}
                              </span>
                            </td>
                            <td>{item.compatibility}</td>
                            <td className="text-center">
                              {item.isRunning ? (
                                <FaPause title="Pause Bot" style={{ cursor: 'pointer', color: '#dc3545', fontSize: '1.2rem' }} onClick={() => setConfirmAction({ show: true, index, type: 'pause' })} />
                              ) : (
                                <FaPlay title="Start Bot" style={{ cursor: 'pointer', color: '#0d6efd', fontSize: '1.2rem' }} onClick={() => setConfirmAction({ show: true, index, type: 'start' })} />
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Container>
      </Layout>

      {/* Confirm Start/Pause */}
      <Modal show={confirmAction.show} onHide={() => setConfirmAction({ show: false, index: null, type: '' })} centered>
        <Modal.Header closeButton>
          <Modal.Title>{confirmAction.type === 'start' ? 'Start Bot' : 'Pause Bot'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {confirmAction.type === 'start' ? 'start' : 'pause'} this bot?
        </Modal.Body>
        <Modal.Footer>
        <Button
              variant={confirmAction.type === 'start' ? 'primary' : 'danger'}
              onClick={() => {
                const index = confirmAction.index;
                setTableData((prev) => {
                  const newData = [...prev];
                  newData[index].isRunning = confirmAction.type === 'start';
                  newData[index].status = confirmAction.type === 'start' ? 'Active' : 'Inactive';
                  return newData;
                });
                setConfirmAction({ show: false, index: null, type: '' });
              }}
            >
              {confirmAction.type === 'start' ? 'Start' : 'Pause'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={renameModal} onHide={() => setRenameModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rename Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            placeholder="New folder name"
            value={folderToRename}
            onChange={(e) => setFolderToRename(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRenameModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            alert(`Renaming folder to ${folderToRename}`); // Implement actual rename logic
            setRenameModal(false);
          }}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Deploy New Bot</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="mb-3" style={{ width: '100%' }}>
      <label className="form-label">Bot Name</label>
      <input
        type="text"
        className="form-control w-100"
        value={newBot.name || ''}
        onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
      />
    </div>

    <div className="mb-3" style={{ width: '100%' }}>
      <label className="form-label">Version / VM</label>
      <select
        className="form-select w-100"
        value={newBot.version || ''}
        onChange={(e) => setNewBot({ ...newBot, version: e.target.value })}
      >
        <option value="">Select VM</option>
        <option value="vdi-1">vdi-1</option>
        <option value="vdi-2">vdi-2</option>
        <option value="vdi-3">vdi-3</option>
      </select>
    </div>

    <div className="mb-3" style={{ width: '100%' }}>
      <label className="form-label">Compatibility</label>
      <input
        type="text"
        className="form-control w-100"
        value={newBot.compatibility || ''}
        onChange={(e) => setNewBot({ ...newBot, compatibility: e.target.value })}
      />
    </div>

    <div className="mb-3" style={{ width: '100%' }}>
      <label className="form-label">Description</label>
      <textarea
        className="form-control w-100"
        rows="3"
        value={newBot.description || ''}
        onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
      />
    </div>

    <div className="mb-3" style={{ width: '100%' }}>
      <label className="form-label">Upload Bot File</label>
      <input
        type="file"
        className="form-control w-100"
        onChange={(e) => setNewBot({ ...newBot, file: e.target.files[0] })}
      />
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleAddBot}>
      Deploy
    </Button>
  </Modal.Footer>
</Modal>


      {/* Add/Edit/Success modals (unchanged) go below this line */}
      {/* ... */}
    </div>
  );
};

export default OrchestrationPage;
