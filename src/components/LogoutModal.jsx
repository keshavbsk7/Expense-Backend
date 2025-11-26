import { useState } from "react";
import "../CSS/LogoutModal.css";

function LogoutModal({ isOpen, onClose, onConfirm, username }) {
  const [showGoodbye, setShowGoodbye] = useState(false);

  if (!isOpen) return null;

  const handleLogoutClick = () => {
    setShowGoodbye(true); // Show goodbye message

    // Close popup + logout after 2 seconds
    setTimeout(() => {
      onConfirm();  
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        {!showGoodbye ? (
          <>
            <h2 className="logout-username">Hey, {username} 👋</h2>

           
            <p className="logout-text">
              Are you sure you want to logout? 😢  
            </p>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button className="confirm-btn" onClick={handleLogoutClick}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="logout-username">Goodbye, {username}! 👋</h2>
            <p className="goodbye-text">See you soon! 😊</p>
          </>
        )}

      </div>
    </div>
  );
}

export default LogoutModal;
