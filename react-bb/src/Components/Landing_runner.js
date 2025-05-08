import React, { useState, useEffect } from "react";
import { Button, Container, Navbar, Modal, Offcanvas, Form, Toast, Image, Row, Col, Popover, OverlayTrigger, InputGroup, FloatingLabel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from 'axios';

import { FaArrowDown, FaPlay, FaList, FaCog, FaSignOutAlt, FaDownload   } from "react-icons/fa";
import { BsRecordCircle, BsKeyboard,  } from "react-icons/bs";
import { CiEdit, CiCamera, CiGrid42  } from "react-icons/ci";
import { FaFloppyDisk, FaRegCircleStop } from "react-icons/fa6";
import { LuMousePointer2, LuMapPin} from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import BotStatusModal from './BotStatusModal';

import {BeatLoader } from "react-spinners";

import "../App.css";
import "./css/keyboard.css";
import Layout from "./Template";


const Main = () => {
    const [items, setItems] = useState(JSON.parse(localStorage.getItem("items")) || []);
    const [selectedItem, setSelectedItem] = useState({});
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [screenshot, setScreenshot] = useState(null);
    const [action, setAction] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);
    const [sideBarToggle, setSideBarToggle] = useState(true);
    const [sidebarRef, setSidebarRef] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(selectedItem.content);
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editedProject, setEditedProject] = useState("Project Name");
    const [inputValue, setInputValue] = useState("");
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedWindow, setSelectedWindow] = useState("");
    // const serverIP = "http://localhost:5000/";
    const serverIP = "https://sag-rpa-backend.onrender.com/";
    const [isRecording, setIsRecording] = useState(false);
    const [coord, setCoord] = useState({ x: 0, y: 0 });
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projectList, setProjectList] = useState([]);
    const [showToast, setShowToast] = useState(false);

    //Modal
    const [botRunning, setBotRunning] = useState(false);
    const [botMessage, setBotMessage] = useState("Starting automation...");
    const [botStatus, setBotStatus] = useState("running");

    

    const showPropertiesRecorder = (item) => {
    setSelectedItem(prev => ({ ...prev, content: item }));
    setSelectedAction(item);
    setShowOffcanvas(true);
    
    }

    const editProjectName = () => {
        setIsEditing(false);
    };
    const btnSave = () => {
      const generateProjectID = (name) => name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      const orderedItems = items.map((item, index) => {
        const value = localStorage.getItem(item.content);
        let imagePath = "";
        let actionKey = "";
        let appwindow = "";
        let keyboard = "";
        let actionType = "";
        let coordinates  = "";
        let action = "";
        if (value) {
          try {
            const parsed = JSON.parse(value);
            imagePath = parsed.image || ""; 
            actionKey = parsed.action || "";
            appwindow = parsed.window || "";
            keyboard = parsed.keyboard || "";
            actionType = parsed.actionType || "";
            coordinates = parsed.coord || "";
          } catch (err) {
            console.error("Error parsing localStorage value:", err);
          }
        } else {

          if (item.actionType === "UIElement") {
            actionKey = item.actionType;
            action = item.action; 
          } else if (item.actionType === "Coordinates" ) {
            console.log(item.actionType);
            actionKey = item.actionType;
            coordinates = { x: item.coordinates.x, y: item.coordinates.y };
            action = item.action;
          } else if (item.actionType === "keyStroke") {
            keyboard = item.key;
            actionKey = item.actionType;
          } else if (item.actionType === "capture") {
            actionKey = item.actionType;
          } else if (item.actionType === "window") {
            actionKey = item.actionType;
            appwindow = item.window;
          }
        }
      
        return {
          id: item.id,
          projectName: editedProject,
          content: item.content,
          action: action,
          actionType: actionKey,  
          order: index + 1,
          imagePath: imagePath,
          window: appwindow,
          keyboard: keyboard,
          coordinates: coordinates
        };
      });
      
      const finalDataStructure = {
        [generateProjectID(editedProject)]: orderedItems // Wrap the orderedItems inside an object with projectName as the key
      };
      
      console.log(JSON.stringify(finalDataStructure, null, 2));
  
      fetch(serverIP + "/api/save_Action_Json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalDataStructure),
      })
      .then((res) => res.json())
      .then((data) => {console.log(data);
        setShowToast(true);
      })
      .catch((err) => console.error("Error fetching items:", err));
  
      // fetch(serverIP + "/api/save_Project", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(finalDataStructure),
      // })
      // .then((res) => res.json())
      // .then((data) => console.log(data))
      // .catch((err) => console.error("Error fetching items:", err));
  
    };
    const loadProject = async () => {
        axios.post(serverIP + 'api/loadJson', { id: "Project_Name" })
        .then(res => {
            const projectData = res.data["Project Name"];
            const sortedItems = [...projectData].sort((a, b) => a.order - b.order);
            console.log(sortedItems);
            setItems(sortedItems); // Set your state

            sortedItems.forEach(item => {
            localStorage.setItem(item.content, JSON.stringify({
                action: item.action,
                actionType: item.actionType,
                image: item.imagePath,
                keyboard: item.keyboard,
                window: item.window,
                coord: {
                x: item.coord.x,
                y: item.coord.y
                }
            }));
            });
        })
        .catch(err => {
            console.error("Error loading project data:", err);
        });
    };

    const handleCloseModal = () => {
    setBotRunning(false);
    };
    const onDragEnd = (result) => {
        if (!result.destination) return;
            const reorderedItems = [...items];
            const [movedItem] = reorderedItems.splice(result.source.index, 1);
            reorderedItems.splice(result.destination.index, 0, movedItem);
            setItems(reorderedItems);
    };
    const showProperties = (item) => {
        setSelectedItem(item);
        setShowOffcanvas(true);
        const storedItem = localStorage.getItem(`${item.content}`); 
        console.log(item);
        setSelectedAction(item.actionType);
        setCoord({ x:  item.x, y: item.y });
    
        if (storedItem) {
          const storedData = JSON.parse(storedItem);
          setAction(storedData.action);
          setScreenshot(storedData.image);
          setIsDisabled(false);
          setInputValue(storedData.keyboard);
          setCoord(storedData.coord);
    
        }else{
          setIsDisabled(true);
          setAction("");
          setScreenshot(null);
          setInputValue("");
          setCoord({ x: 0, y: 0 });
        }
    };
    const deleteItem = (itemId) => {
        console.log(items);
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
        localStorage.removeItem(selectedItem.content); // Remove from localStorage
    
    };
    const handleTextChange = () => {
        const updatedItems = items.map(item =>
            item.id === selectedItem.id ? { ...item, content: editedText } : item
        );
        const data = {
          action: action,
          image: screenshot,
          keyboard: inputValue,
          window: selectedWindow,
        };
    
        setSelectedItem(prev => ({ ...prev, content: editedText }));
    
        setItems(updatedItems);
        
        localStorage.setItem(editedText, JSON.stringify(data));
    
        setIsEditing(false);
    };
 


 
    const toggleRecording = async () => {
      try {
        if (isRecording) {
          const response = await fetch(serverIP + "stop-recording", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
  
          const data = await response.json();
          console.log("Recording stopped:", data);
          if (data.status === "success") {
            const newItems = data.recording.map((action) => ({
              id: action.id,
              content: getActionContent(action),
              actionType: getActionType(action),
              action: action.button,
              window: action.window,
              ...(action.element && { automationID: action.element.automation_id }),
              coordinates: action.coord,
              key: action.key,
            }));
            setItems(prev => [...prev, ...newItems]);
          }
        } else {
          await fetch(serverIP + "start-recording", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        }
  
        setIsRecording(!isRecording);
      } catch (err) {
        console.error("Recording error:", err);
        alert(`Failed to ${isRecording ? 'stop' : 'start'} recording`);
      }
    };

    // Helper functions
    const getActionContent = (action) => {
      switch(action.action_type) {
        case 'click': return `Click on ${action.element?.name || "element"}`;
        case 'Coordinates': return `Click on ${action.coord.x}, ${action.coord.y}`;
        case 'keystroke': return `Keystroke: ${action.key}`;
        case 'activate_window': return `Activate window: ${action.window}`;
        default: return "Unknown action";
      }
    };
    
  const getActionType = (action) => {
    switch(action.action_type) {
      case 'click': return "UIElement";
      case 'Coordinates': return "Coordinates";
      case 'keystroke': return "keyStroke";
      case 'activate_window': return "window";
      default: return "unknown";
    }
  };

  const fetchProjectList = () => {
    axios.get(serverIP + 'api/list_projects')
      .then(res => {
        setProjectList(res.data);
        setShowProjectModal(true);
      })
      .catch(err => console.error("Failed to fetch project list:", err));
  };
  const handleProjectLoad = (projectId) => {
    axios.post(serverIP + 'api/loadJson', { id: projectId })
      .then(res => {
        const projectKey = Object.keys(res.data)[0];
        const projectData = res.data[projectKey];
        const sortedItems = [...projectData].sort((a, b) => a.order - b.order);
        setEditedProject(projectKey);
        setItems(sortedItems);
        sortedItems.forEach(item => {
          localStorage.setItem(item.content, JSON.stringify({
            action: item.action,
            actionType: item.actionType,
            image: item.imagePath,
            keyboard: item.keyboard,
            window: item.window,
            coord: { x: item.coord.x, y: item.coord.y }
          }));
        });
  
        setShowProjectModal(false);
      })
      .catch(err => {
        console.error("Error loading project:", err);
        setShowProjectModal(false);
      });
  };
    return (
    <div className="App">
      
     
      <aside ref={sidebarRef} className={`sidebar ${sideBarToggle ? 'visible' : ""}`}>
        <h3>Controls</h3>
        <ul className="sidebar-menu">
          <li  onClick={() => showPropertiesRecorder("Recorder")}><BsRecordCircle /> Recorder</li>
          <li><FaList /> Actions</li>
          <li><FaCog /> Settings</li>
          <li className="logout"><FaSignOutAlt /> Logout</li>
        </ul>
      </aside>
      {/* Main content */}

      <Layout>
        <main className="mt-5">  
        <Container fluid>
          <Row>
            <Col>
              <div className="editable-container">
                  {isEditingProject ? (
                      <input
                        type="text"
                        value={editedProject} // Bind the input value to `editedProject`
                        onChange={(e) => setEditedProject(e.target.value)} // Update state on change
                        onBlur={editProjectName} // Save when input loses focus
                        autoFocus
                        className="editable-input"
                      />
                  ) : (
                      <h5 className="editable-text">
                          {editedProject}
                      </h5>
                  )}
                  <CiEdit onClick={() => setIsEditingProject(true)} className="edit-icon" />
              </div>
            </Col>
            <Col className="text-end">
              <Button variant="success" onClick={btnSave} className="top-buttons"><FaFloppyDisk  /> Save</Button>
              <Button variant="success" onClick={fetchProjectList} className="top-buttons"><FaDownload   /> Load</Button>
              <BotStatusModal show={botRunning}  status={botStatus} message={botMessage} onClose={handleCloseModal} />
              <Modal show={showProjectModal} onHide={() => setShowProjectModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Select a Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {projectList.length === 0 ? (
                    <p>No projects found.</p>
                  ) : (
                    <ul className="list-group">
                      {projectList.map(project => (
                        <li
                          key={project.projectId}
                          className="list-group-item list-group-item-action"
                          onClick={() => handleProjectLoad(project.projectId)}
                          style={{ cursor: 'pointer' }}
                        >
                          {project.projectName}
                        </li>
                      ))}
                    </ul>
                  )}
                </Modal.Body>
              </Modal>
            </Col>
          </Row>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} 
                  style={{ marginTop: "20px", 
                    padding: "10px", 
                    background: "rgba(53, 34, 8, 0.1)", 
                    borderRadius: "5px", 
                    height: "75vh", 
                    overflowY: "auto", 
                    width: "100vh"}}>
                      
                  {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => showProperties(item)}
                            style={{
                              padding: 10, margin: "5px auto", background: "#fff",
                              borderRadius: "5px", boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                              textAlign: "center", cursor: "pointer", ...provided.draggableProps.style
                            }}play="true"
                          >
                            <div className="item-content">
                              <div className="item-center">
                                {item.content} {item.action}
                              </div>
                              <button className="delete-Item" onClick={() => deleteItem(item.id)}>
                                <IoClose />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                      {index < items.length - 1 && (
                        <div style={{ position: "relative", height: "30px", textAlign: "center" }}>
                          <FaArrowDown size={20} color="gray" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Container>
       <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="success"
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            minWidth: '200px'
          }}
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">Project saved successfully!</Toast.Body>
        </Toast>
      </main>      
      

      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} scroll={true} backdrop={false} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Properties</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="editable-container">
              {isEditing ? (
                  <input
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      onBlur={handleTextChange}
                      autoFocus
                      className="editable-input"
                  />
              ) : (
                  <h5 className="editable-text">
                      {selectedItem.content}
                  </h5>
              )}
              <CiEdit onClick={() => setIsEditing(true)} className="edit-icon" />
          </div>
         
             {selectedAction === "Recorder" && (
              <Row> 
                <Col>
                <Button 
                  variant={isRecording ? "danger" : "primary"}
                  onClick={toggleRecording}
                >
                  {isRecording ? (
                    <> <FaRegCircleStop /> Stop Recording </>
                  ) : (
                    <>
                      <BsRecordCircle /> Start Recording
                    </>
                  )}
                </Button>
                </Col>
              </Row>
             )}
             
        </Offcanvas.Body>
      </Offcanvas>
      </Layout>
    </div>
  );
};

export default Main;
