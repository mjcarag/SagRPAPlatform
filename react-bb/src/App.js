import React, { useState, useEffect } from "react";
import { Button, Container, Nav, Navbar, Offcanvas, Form, Image, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaArrowDown } from "react-icons/fa";
import { BsRecordCircle } from "react-icons/bs";
import { CiFloppyDisk, CiPlay1 } from "react-icons/ci";

const App = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [action, setAction] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  
  useEffect(() => {
    // Clear localStorage on load
    localStorage.clear();
  }, []);

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
    }else{
      setIsDisabled(true);
      setAction("");
      setScreenshot(null);
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

    // const paths = items
    // .map((item) => {
    //   const value = localStorage.getItem(item.content);
    //   if (value) {
    //     try {
    //       const parsed = JSON.parse(value);
    //       return parsed.image; // Extract only the image path
    //     } catch (err) {
    //       console.error("Error parsing localStorage value:", err);
    //       return null;
    //     }
    //   }
    //   return null;
    // })
    // .filter(Boolean);


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
    };

    localStorage.setItem(selectedItem.content, JSON.stringify(data));

    setItems((prevItems) =>
      prevItems.map((itm) =>
        itm.id === selectedItem.id ? { ...itm, action: ` >> ${actionValue}` } : itm
      )
    );

   
  }

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" fixed="top" >
        <Container fluid>
          <Navbar.Brand href="#home">Bautomation Banywhere</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#pricing">Pricing</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid="md" className="mt-5 pt-5">
        <Row>
          <Col>
            <Button variant="primary" onClick={addItem}>➕ Capture</Button>
          </Col>
          <Col>
            <Button variant="danger" onClick={runMain} className="me-2"><CiPlay1 /> Run</Button>
            <Button variant="success" onClick={addItem}><CiFloppyDisk /> Save</Button>
          </Col>
          
        </Row>

        
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} style={{ marginTop: "20px", padding: "10px", background: "#f8f9fa", borderRadius: "5px" }}>
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
                          }}
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

      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} scroll={true} backdrop={false} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Properties</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <div>
              <h5>{selectedItem.content}</h5>
            </div>
            <Row>
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
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default App;
