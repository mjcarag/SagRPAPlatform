import React from "react";
import "./css/BotStatusModal.css";
import { RingLoader } from "react-spinners";
import { IoClose } from "react-icons/io5";
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";


const BotStatusModal = ({ show, message, onClose, status }) => {
  if (!show) return null;

  const renderContent = () => {
    if (status === "running") {
      return <RingLoader color="#e1bb80" size={40} />;
    } else if (status === "success") {
      return <IoCheckmarkCircleOutline color="#4CAF50" size={40} />;
    } else if (status === "error") {
      return <IoCloseCircleOutline color="#f44336" size={40} />;
    }
  };

  return (
    <div className="bot-status-modal">
      <div className="bot-status-content">
        <div className="modal-header">
            <button className="bot-status-close"  onClick={onClose}><IoClose /></button>
        </div>
        <div className="modal-body">
            <div className="bot-status-icon">
                {renderContent()}
            </div>
            <p >{message}</p>
        </div>
      </div>
    </div>
  );
};

export default BotStatusModal;
