import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import { useState } from "react";
import LogoutModal from "./LogoutModal";

function Navbar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);
const username = localStorage.getItem("name");

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  return (
    <>
      <nav className="navbar">
  <h3 className="logo">Expense Tracker</h3>

  <ul className="nav-links">
    <li><Link to="/home" className="nav-item-btn">Home</Link></li>
    <li><Link to="/add-expense" className="nav-item-btn">Add New Expense</Link></li>
    <li><Link to="/view-expenses" className="nav-item-btn">View Expense Details</Link></li>

    <li>
      <button className="logout-btn" onClick={openLogoutModal}>
        Logout
      </button>
    </li>
  </ul>
</nav>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
        username={username}
      />
    </>
  );
}

export default Navbar;
