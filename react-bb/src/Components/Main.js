
import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";

const Main = () => {
  const [selectedWindow, setSelectedWindow] = useState("");
  const serverIP = "https://13.238.145.59:5000/";

  const sendAgentAction = (actionList) => {
    fetch(serverIP + "Controls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actionList),
    })
      .then((res) => res.json())
      .then((data) => console.log("Action sent to agent:", data))
      .catch((err) => console.error("Failed to send to agent:", err));
  };

  const triggerUICapture = () => {
    sendAgentAction([
      {
        id: "capture-ui-1",
        actionType: "captureElement",
        window: selectedWindow,
      },
    ]);
  };

  const triggerStartRecording = () => {
    sendAgentAction([
      {
        id: "start-rec-1",
        actionType: "recording",
        action: "start",
        window: selectedWindow,
      },
    ]);
  };

  const triggerStopRecording = () => {
    sendAgentAction([
      {
        id: "stop-rec-1",
        actionType: "recording",
        action: "stop",
        window: selectedWindow,
      },
    ]);
  };

  const triggerScreenshot = () => {
    sendAgentAction([
      {
        id: "screenshot-1",
        actionType: "screenshot",
        window: selectedWindow,
      },
    ]);
  };

  return (
    <div>
      <h4>Main Panel</h4>
      <input
        type="text"
        value={selectedWindow}
        onChange={(e) => setSelectedWindow(e.target.value)}
        placeholder="Enter window title"
      />
      <Button onClick={triggerUICapture}>Capture UI Element</Button>
      <Button onClick={triggerStartRecording}>Start Recording</Button>
      <Button onClick={triggerStopRecording}>Stop Recording</Button>
      <Button onClick={triggerScreenshot}>Screenshot</Button>
    </div>
  );
};

export default Main;
