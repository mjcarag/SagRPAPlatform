import React, { useEffect, useState } from "react";
import { FaFolderOpen } from "react-icons/fa";
import "./Dashboard.css"; // Import your CSS file

const FileExplorer = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const serverIP = "http://localhost:5000/";
  
  useEffect(() => {
    fetch(serverIP + "/api/list_projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);


  return (
    <div className="file-explorer">
      <h5 className="file-explorer-title">📁 Bots</h5>
      <ul className="file-list">
        {projects.map((project) => (
          <li
            key={project.projectId}
            className="file-item"
            onClick={() => onProjectSelect(project)}
          >
            <FaFolderOpen className="file-icon" />
            <span className="file-name">{project.projectName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileExplorer;
