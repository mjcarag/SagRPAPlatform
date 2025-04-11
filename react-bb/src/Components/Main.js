import React, { useState, useEffect } from "react";
import { Button, Container, Navbar, Offcanvas, Form, Image, Row, Col, Popover, OverlayTrigger, InputGroup, FloatingLabel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from 'axios';

import { FaArrowDown, FaPlay, FaList, FaCog, FaSignOutAlt, FaDownload   } from "react-icons/fa";
import { BsRecordCircle, BsKeyboard,  } from "react-icons/bs";
import { CiEdit, CiCamera, CiGrid42  } from "react-icons/ci";
import { FaFloppyDisk, FaRegCircleStop } from "react-icons/fa6";
import { LuMousePointer2, LuMapPin} from "react-icons/lu";

import "../App.css";
import "./css/keyboard.css";

const Main = () => {
  const [items, setItems] = useState(JSON.parse(localStorage.getItem("items")) || []);
  const [selectedItem, setSelectedItem] = useState({});
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [automationID, setautomationID] = useState("");
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
  const [windowTitles, setWindowTitles] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState("");
  const serverIP = "http://localhost:5000/";
  const [isRecording, setIsRecording] = useState(false);
  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [listening, setListening] = useState(false);
  // Testing
  const [properties, setProperties] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    // Clear localStorage on load
    localStorage.clear();
    fetch(serverIP + "window-titles")
      .then((res) => res.json())
      .then((data) => setWindowTitles(data.titles))
      .catch((err) => console.error("Error fetching window titles:", err));

      
  }, []);

  const getCoords = async () => {
    setListening(true); 
    try {
      const res = await axios.get('http://localhost:5000/start-listen');
      if (res.data && res.data.x !== undefined && res.data.y !== undefined) {
        setCoord(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch coordinates', err);
    } finally {
      setListening(false); 
    }
  };

  const startCapture = async () => {
    setIsCapturing(true);
    const paramWindow = { window: selectedWindow };
    fetch(serverIP + "start-captureElement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paramWindow),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Screenshot Triggered:");
      })
      .catch((error) => {
        console.error("Error:", error)
        setIsCapturing(false);
      });


  };

  const fetchProperties = async () => {
    fetch(serverIP + "get-Elementproperties")
      .then((res) => res.json())
      .then((data) => {
        // setWindowTitles(data.titles)
        // if (data.status === "success") {
          setProperties(data);
          setautomationID(data.automation_id);
          console.log("AID:", data.automation_id);
          handleUISelector(data.automation_id);
        // } else {
        //     alert('No control captured yet. Please try again.');
        // }
      })
      .catch((err) => console.error("Error fetching window titles:", err));
    setIsCapturing(false);
  };

  const handleSelectChangeWindow = (event) => {
    fetch(serverIP + "window-titles")
      .then((res) => res.json())
      .then((data) => setWindowTitles(data.titles))
      .catch((err) => console.error("Error fetching window titles:", err));
    setSelectedWindow(event.target.value);
  };

  // const handleActionSelect = (e) => {
  //   if (e.target.value === "mouseClick"){
  //     setInputValue("");
      
  //   }else{
  //     setAction("");
  //   }
  //   const data = {
  //     action: action,
  //     image: screenshot,
  //     keyboard: inputValue,
  //     window: selectedWindow,
  //   };

  //   localStorage.setItem(selectedItem.content, JSON.stringify(data));

  //   setItems((prevItems) =>
  //     prevItems.map((itm) =>
  //       itm.id === selectedItem.id ? { ...itm, action: ` >> ${action}` } : itm
  //     )
  //   );
    
  //   setSelectedAction(e.target.value);
  // };

  const handleKeyPress = (key) => {
    setInputValue((prev) => prev + (prev ? " + " : "") + key);
  };

  const handleUISelector = (e) => {
    const data = {
      action: action,
      automationID: e,
      window: selectedWindow,
    };

    localStorage.setItem(selectedItem.content, JSON.stringify(data));

    setItems((prevItems) =>
      prevItems.map((itm) =>
        itm.id === selectedItem.id ? { ...itm, action: ` >> ${inputValue}` } : itm
      )
    );
  }

  const handleInputChange = (e) => {
      const data = {
        action: action,
        image: screenshot,
        keyboard: inputValue,
        window: selectedWindow,
      };

      localStorage.setItem(selectedItem.content, JSON.stringify(data));

      setItems((prevItems) =>
        prevItems.map((itm) =>
          itm.id === selectedItem.id ? { ...itm, action: ` >> ${inputValue}` } : itm
        )
      );
      
      // fetch( serverIP + "api/save_Action", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // })
      // .then(() => {
      //   console.log("Data saved successfully!");
      // })
      // .catch((error) => console.error("Error:", error));

      
    setInputValue(e.target.value);
  };
  const functionKeys = [
    "F1", "F2", "F3", "F4", "F5", "F6",
    "F7", "F8", "F9", "F10", "F11", "F12",
    "Esc", "Tab", "Caps", "Shift", "Ctrl", "Alt",
    "Insert", "Home", "Page Up", "Delete", "End", "Page Down",
    "Print", "Scroll", "Pause", "Enter", "Backspace", "Space",
    "Arrow Up", "Arrow Down", "Arrow Left", "Arrow Right",

  ];


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

  const editProjectName = () => {
    setIsEditing(false);
  };
  
  const captureScreenshot = () => {
    const paramWindow = { window: selectedWindow };

    fetch(serverIP + "capture_screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paramWindow),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Screenshot Triggered:", data);
        fetchScreenshot(data.filename);
      })
      .catch((error) => console.error("Error:", error));
  };

  const fetchScreenshot = (filename) => {
    const imageUrl = serverIP + `get_screenshot/${filename}`;
  
    const checkFileExists = () => {
      fetch(imageUrl, { method: "HEAD" }) 
        .then((response) => {
          if (response.ok) {
            setScreenshot(imageUrl); 
            setIsDisabled(false);
          } else {
            setTimeout(checkFileExists, 1000); 
          }
        })
        .catch((error) => console.error("Error checking file:", error));
    };
    
    checkFileExists(); 
  };
  

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItems = [...items];
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);
    setItems(reorderedItems);
  };
  const showPropertiesRecorder = (item) => {
    setSelectedItem(prev => ({ ...prev, content: item }));
    setSelectedAction(item);
    setShowOffcanvas(true);
    
  }
  const showProperties = (item) => {
    setSelectedItem(item);
    setShowOffcanvas(true);
    const storedItem = localStorage.getItem(`${item.content}`); 
    console.log(item);
    setSelectedAction(item.actionType);


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
    }
  };

  const addItem = () => {
    const newItem = { content: `Image ${items.length + 1}`, actionType: "capture" };

    fetch(serverIP + "api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
      .then((res) => res.json())
      .then((data) => setItems([...items, data]))
      .catch((err) => console.error("Error adding item:", err));

  };

  const addItemKeyStroke = () => {
    const newItem = { content: `KeyStroke ${items.length + 1}`, actionType: "keyStroke"  };

    fetch(serverIP + "api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
      .then((res) => res.json())
      .then((data) => setItems([...items, data]))
      .catch((err) => console.error("Error adding item:", err));

  };
  
  const addItemUI = () => {
    const newItem = { content: `UIElement ${items.length + 1}`, actionType: "UIElement"  };

    fetch(serverIP + "api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
      .then((res) => res.json())
      .then((data) => setItems([...items, data]))
      .catch((err) => console.error("Error adding item:", err));

  };

  const addItemCoords = () => {
    const newItem = { content: `Coordinates ${items.length + 1}`, actionType: "Coordinates"  };

    fetch(serverIP + "api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
      .then((res) => res.json())
      .then((data) => setItems([...items, data]))
      .catch((err) => console.error("Error adding item:", err));

  };


  const DeleteDB = () => {
    const newItem = { content: `UIElement ${items.length + 1}`, actionType: "UIElement"  };

    fetch(serverIP + "api/emptyDB", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
      .then((res) => res.json())
      .then((data) => setItems([...items, data]))
      .catch((err) => console.error("Error adding item:", err));

  };


  const runMain = () => {

    const orderedItems = items.map((item, index) => {
      const value = localStorage.getItem(item.content);
      let imagePath = "";
      let actionKey = "";
      let appwindow = "";
      let keyboard = "";
      let automationID = "";
      let coordinates  = "";
      
      if (value) {
        try {
          const parsed = JSON.parse(value);
          imagePath = parsed.image || ""; 
          actionKey = parsed.action || "";
          appwindow = parsed.window || "";
          keyboard = parsed.keyboard || "";
          automationID = parsed.automationID || "";
          coordinates = parsed.coord || "";
        } catch (err) {
          console.error("Error parsing localStorage value:", err);
        }
      }
    
      return {
        id: item.id,
        content: item.content,
        action: actionKey,
        order: index + 1,
        imagePath: imagePath,
        window: appwindow,
        keyboard: keyboard,
        automationID: automationID,
        coordinates: coordinates,
      };
    });
  
    console.log(JSON.stringify(orderedItems, null, 2));

    fetch(serverIP +  "/Controls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderedItems),
    })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error("Error fetching items:", err));

  };

  const btnSave = () => {

    const orderedItems = items.map((item, index) => {
      const value = localStorage.getItem(item.content);
      let imagePath = "";
      let actionKey = "";
      let appwindow = "";
      let keyboard = "";
      let actionType = "";
      if (value) {
        try {
          const parsed = JSON.parse(value);
          imagePath = parsed.image || ""; 
          actionKey = parsed.action || "";
          appwindow = parsed.window || "";
          keyboard = parsed.keyboard || "";
          actionType = parsed.actionType || "";
        } catch (err) {
          console.error("Error parsing localStorage value:", err);
        }
      }
    
      return {
        id: item.id,
        projectName: editedProject,
        content: item.content,
        action: actionKey,
        actionType: item.actionType,  
        order: index + 1,
        imagePath: imagePath,
        window: appwindow,
        keyboard: keyboard,
      };
    });
    const finalDataStructure = {
      [editedProject]: orderedItems // Wrap the orderedItems inside an object with projectName as the key
    };
    
    console.log(JSON.stringify(finalDataStructure, null, 2));

    fetch(serverIP + "/api/save_Project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalDataStructure),
    })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error("Error fetching items:", err));

  };

  const loadProject = async () => {
    axios.post(serverIP + 'api/load', { id: "3509dad3-4100-4d17-9eed-497bf984f839" })
    .then(res => {
      const projectData = res.data["Project Name"];
      const sortedItems = [...projectData].sort((a, b) => a.order - b.order);
      console.log(sortedItems);
      setItems(sortedItems); // Set your state
    })
    .catch(err => {
      console.error("Error loading project data:", err);
    });
  };

  const actionOnChange = (e) => {
    const actionValue = e.target.value;
    setAction(actionValue);

    const data = {
      action: actionValue,
      image: screenshot,
      keyboard: inputValue,
      window: selectedWindow,
      coord: coord,
    };

    localStorage.setItem(selectedItem.content, JSON.stringify(data));

    setItems((prevItems) =>
      prevItems.map((itm) =>
        itm.id === selectedItem.id ? { ...itm, action: ` >> ${actionValue}` } : itm
      )
    );
  }

  const popover = (
    <Popover id="popover-function-keys">
      <Popover.Body className="keyboard-container">
        {functionKeys.map((key) => (
          <Button key={key} variant="dark" className="key" onClick={() => handleKeyPress(key)}>
            {key}
          </Button>
        ))}
      </Popover.Body>
    </Popover>
  );
  

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        const response = await fetch(serverIP + "stop-recording", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        
        if (data.status === "success") {
          const newItems = data.recording.map((action) => ({
            id: action.id,
            content: getActionContent(action),
            actionType: getActionType(action),
            action: action.action_type,
            window: action.window,
            ...(action.element && { automationID: action.element.automation_id })
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
      case 'keystroke': return `Keystroke: ${action.key}`;
      case 'activate_window': return `Activate window: ${action.window}`;
      default: return "Unknown action";
    }
  };
  
  const getActionType = (action) => {
    switch(action.action_type) {
      case 'click': return "UIElement";
      case 'keystroke': return "keyStroke";
      case 'activate_window': return "window";
      default: return "unknown";
    }
  };

  return (
    <div className="App">
      <Navbar fixed="top" className="bg-topNav" >
        <Container fluid>
          <Navbar.Brand href="#home" className="topNav-text"> AI Copilot</Navbar.Brand>
         
          <Navbar.Toggle />
          {/* <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Nav.Link href="#features" className="topNav-text">Features</Nav.Link>
              <Nav.Link href="#pricing" className="topNav-text">Pricing</Nav.Link>
            </Nav>
          </Navbar.Collapse> */}
        </Container>
      </Navbar>
      {/* <Button variant="dark" className="sidebar-toggle mt-5" onClick={() => setSideBarToggle(true)}>
        <FaBars size={20} />
      </Button> */}

      <aside ref={sidebarRef} className={`sidebar ${sideBarToggle ? 'visible' : ""}`}>
        <h3>Controls</h3>
        <ul className="sidebar-menu">
          <li  onClick={addItem}><CiCamera  /> Capture</li>
          <li  onClick={addItemKeyStroke}><BsKeyboard  /> Key Stroke</li>
          <li  onClick={addItemUI}><CiGrid42   /> UI Element</li>
          <li  onClick={addItemCoords}><LuMapPin /> Coordinates</li>
          <li  onClick={() => showPropertiesRecorder("Recorder")}><BsRecordCircle /> Recorder</li>
          <li><FaList /> Actions</li>
          <li><FaCog /> Settings</li>
          <li className="logout"><FaSignOutAlt /> Logout</li>
        </ul>
      </aside>
      {/* Main content */}
      <main>  
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
              <Button variant="success" onClick={loadProject} className="top-buttons"><FaDownload   /> Load</Button>
              <Button variant="danger" onClick={runMain} className="top-buttons me-2"><FaPlay  /> Run</Button>
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
                            {item.content} {item.action}
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
         
          {selectedAction === "capture" && (
            <>  
          <Row className="mb-2">
            <Col>
              <Form.Select onChange={handleSelectChangeWindow} value={selectedWindow}>
                <option value="">Choose a window</option>
                {windowTitles.map((title, index) => (
                  <option key={index} value={title}>
                    {title}
                  </option>
                ))}
              </Form.Select>
              {/* {selectedWindow && <p>Selected Window: {selectedWindow}</p>} */}
            </Col>
          </Row>
              <Row className="mb-2"> 
                <Col>
                  <Form.Select aria-label="ActionSelect" onChange={actionOnChange} disabled={isDisabled}>
                    <option selected={action === ""} disabled>Choose Action</option>
                    <option value="Left Click">Left Click</option>
                    <option value="Right Click">Right Click</option>
                    <option value="Double Left Click">Double Left Click</option>
                    <option value="Double Right Click">Double Right Click</option>
                  </Form.Select>
                </Col>
              </Row>
            <Row className="mt-3">
              <Col>
                <Image src={screenshot} rounded alt="Screenshot" style={{ width: "100%", maxWidth: "500px" }}/>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="d-flex justify-content-end">
                <Button variant="danger" onClick={captureScreenshot}> <BsRecordCircle /> Capture</Button>
              </Col>
            </Row>
            </>
             )}
             {selectedAction === "keyStroke" && (
              <Row> 
                <Col>
                  <InputGroup className="mb-3">
                    <Form.Control
                      placeholder="Keyboard Input"
                      aria-label="Keyboard Input"
                      aria-describedby="btnKb"
                      value={inputValue}
                      onChange={handleInputChange}
                    />
                    <OverlayTrigger trigger="click" placement="auto" overlay={popover} rootClose>
                      <Button variant="outline-secondary" id="btnKb" className="keyboard-toggle-btn">
                        <BsKeyboard size={18} />
                      </Button>
                    </OverlayTrigger>
                  </InputGroup>
                </Col>
              </Row>
             )}
             {selectedAction === "UIElement" && (
              <>  
                <Row className="mb-2">
                  <Col>
                    <Form.Select onChange={handleSelectChangeWindow} value={selectedWindow}>
                      <option value="">Choose a window</option>
                      {windowTitles.map((title, index) => (
                        <option key={index} value={title}>
                          {title}
                        </option>
                      ))}
                    </Form.Select>
                    {/* {selectedWindow && <p>Selected Window: {selectedWindow}</p>} */}
                  </Col>
                </Row>
                <Row className="mb-2"> 
                  <Col>
                    <Form.Select aria-label="ActionSelect" onChange={actionOnChange} >
                      <option selected={action === ""} disabled>Choose Action</option>
                      <option value="Left Click">Left Click</option>
                      <option value="Right Click">Right Click</option>
                      <option value="Double Left Click">Double Left Click</option>
                      <option value="Double Right Click">Double Right Click</option>
                    </Form.Select>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                  {properties && (
                    <div>
                      <select className="form-select">
                        {Object.entries(properties).map(([key, value], index) => {
                          if (typeof value === "object" && value !== null) {
                            return Object.entries(value).map(([nestedKey, nestedValue], nestedIndex) => (
                              <option key={`${index}-${nestedIndex}`} value={nestedValue}>
                                {key}.{nestedKey}: {nestedValue}
                              </option>
                            ));
                          } else {
                            return (
                              <option key={index} value={value}>
                                {key}: {value}
                              </option>
                            );
                          }
                        })}
                      </select>
                    </div>
                  )}
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col className="d-flex justify-content-end">
                    
                    <Button className="me-2" 
                            variant="danger" 
                            onClick={async () => {
                              await startCapture(); 
                            }}
                        disabled={isCapturing}>
                        {isCapturing ? 'Capturing...' : 'Capture UI Element'}
                    </Button>
                    {isCapturing && <Button onClick={fetchProperties} >Get Properties</Button>}
                  </Col>
                </Row>
              </>
             )}
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
             {selectedAction === "Coordinates" && (
              <>  
              <Row className="mb-2"> 
                <Col>
                  <FloatingLabel controlId="floatingInputX" label="X Coordinate" className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="X Coordinate"
                      value={coord.x}
                    />
                  </FloatingLabel>
                </Col>
                <Col>
                  <FloatingLabel controlId="floatingInputY" label="Y Coordinate" className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Y Coordinate"
                      value={coord.y}
                    />
                  </FloatingLabel>
                </Col>
              </Row>

            
              <Row className="mb-3">
                <Col className="d-flex justify-content-end">
                  <Button onClick={getCoords}>
                  {listening ? "Listening..." :  
                  <>  
                  <LuMousePointer2 /> Get Coordinates
                  </>}
                 
                  </Button>
                  
                </Col>
              </Row>
              <Row className="mb-2"> 
                <Col>
                  <Form.Select aria-label="ActionSelect" onChange={actionOnChange} value={action}>
                    <option >Choose Action</option>
                    <option value="Left Click">Left Click</option>
                    <option value="Right Click">Right Click</option>
                    <option value="Double Left Click">Double Left Click</option>
                    <option value="Double Right Click">Double Right Click</option>
                  </Form.Select>
                </Col>
              </Row>
              </>
             )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Main;
