import React, { useState, useEffect } from "react";
import { Button, Container, Nav, Navbar, Offcanvas, Form, Image, Row, Col, Popover, OverlayTrigger, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaArrowDown, FaPlay, FaList, FaCog, FaSignOutAlt  } from "react-icons/fa";
import { BsRecordCircle, BsKeyboard } from "react-icons/bs";
import { CiEdit, CiCamera  } from "react-icons/ci";
import { FaFloppyDisk } from "react-icons/fa6";
import "./App.css";
import "./keyboard.css";

const App = () => {
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
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Clear localStorage on load
    localStorage.clear();
  
  }, []);

  const handleKeyPress = (key) => {
    setInputValue((prev) => prev + (prev ? " + " : "") + key);
  };
  const handleInputChange = (e) => {
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
    };

    setSelectedItem(prev => ({ ...prev, content: editedText }));

    setItems(updatedItems);
    
    localStorage.setItem(editedText, JSON.stringify(data));

    setIsEditing(false);
  };
  
  const captureScreenshot = () => {
    fetch("http://127.0.0.1:5000/capture_screenshot")
      .then((response) => response.json())
      .then((data) => {
        console.log("Screenshot Triggered:", data);
        fetchScreenshot(data.filename);
      })
      .catch((error) => console.error("Error:", error));
  };

  const fetchScreenshot = (filename) => {
    const imageUrl = `http://127.0.0.1:5000/get_screenshot/${filename}`;
  
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

  const showProperties = (item) => {
    setSelectedItem(item);
    setShowOffcanvas(true);
    const storedItem = localStorage.getItem(`${item.content}`); 
    if (storedItem) {
      const storedData = JSON.parse(storedItem);
      setAction(storedData.action);
      setScreenshot(storedData.image);
      setIsDisabled(false);
      setInputValue(storedData.keyboard);
    }else{
      setIsDisabled(true);
      setAction("");
      setScreenshot(null);
      setInputValue("");
    }
  };

  const addItem = () => {
    const newItem = { content: `Image ${items.length + 1}` };

    fetch("http://127.0.0.1:5000/api/items", {
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
      if (value) {
        try {
          const parsed = JSON.parse(value);
          imagePath = parsed.image || ""; 
          actionKey = parsed.action || "";

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
      };
    });
  
    console.log(JSON.stringify(orderedItems, null, 2));

    fetch("http://127.0.0.1:5000/Controls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderedItems),
    })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error("Error fetching items:", err));

  };

  const actionOnChange = (e) => {
    const actionValue = e.target.value;
    setAction(actionValue);

    const data = {
      action: actionValue,
      image: screenshot,
      keyboard: inputValue,
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

  return (
    <div className="App">
      <Navbar fixed="top" className="bg-topNav" >
        <Container fluid>
          <Navbar.Brand href="#home" className="topNav-text"> Bautomation Banywhere</Navbar.Brand>
         
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Nav.Link href="#features" className="topNav-text">Features</Nav.Link>
              <Nav.Link href="#pricing" className="topNav-text">Pricing</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* <Button variant="dark" className="sidebar-toggle mt-5" onClick={() => setSideBarToggle(true)}>
        <FaBars size={20} />
      </Button> */}

      <aside ref={sidebarRef} className={`sidebar ${sideBarToggle ? 'visible' : ""}`}>
        <h3>Controls</h3>
        <ul className="sidebar-menu">
          <li  onClick={addItem}><CiCamera  /> Capture</li>
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
              <Button variant="danger" onClick={runMain} className="top-buttons me-2"><FaPlay  /> Run</Button>
              <Button variant="success" onClick={addItem} className="top-buttons"><FaFloppyDisk  /> Save</Button>
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
                      <Draggable draggableId={item.id} index={index}>
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
                            }}play
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
          <Row className="mb-2"> 
              <Col>
                <Form.Select aria-label="ActionSelect" onChange={actionOnChange}>
                  <option selected={action === ""} disabled>Choose Action</option>
                  <option value="Click">Click</option>
                  <option value="keyStroke">Key Stroke</option>
                </Form.Select>
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
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default App;
