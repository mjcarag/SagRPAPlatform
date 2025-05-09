
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

const LandingRunner = () => {
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

  const triggerStartRecording = () => {
    sendAgentAction([
      {
        id: "start-rec-runner",
        actionType: "recording",
        action: "start",
        window: selectedWindow,
      },
    ]);
  };

  const triggerStopRecording = () => {
    sendAgentAction([
      {
        id: "stop-rec-runner",
        actionType: "recording",
        action: "stop",
        window: selectedWindow,
      },
    ]);
  };

  return (
    <div>
      <h4>Runner Panel</h4>
      <input
        type="text"
        value={selectedWindow}
        onChange={(e) => setSelectedWindow(e.target.value)}
        placeholder="Enter window title"
      />
      <Button onClick={triggerStartRecording}>Start Recording</Button>
      <Button onClick={triggerStopRecording}>Stop Recording</Button>
    </div>
  );
};

export default LandingRunner;
