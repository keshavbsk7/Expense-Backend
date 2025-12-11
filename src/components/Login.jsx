import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";

import "../CSS/Login.css";
import FinanceImg from "../Assets/illustration.svg";
function Login({ setIsLoggedIn }) {
  const [user, setUser] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
if (localStorage.getItem("userId")) {
  return <Navigate to="/home" replace />;
}
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!user.username || !user.password) {
      alert("Please enter both fields");
      return;
    }

  
    try {
      const res = await fetch("https://expense-backend-rxqo.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (res.ok && data.userId) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("name", data.name);
        setIsLoggedIn(true);
        navigate("/home", { replace: true });
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (e) {
      alert("Server error");
    }
  };

  return (
    <div className="login-container">
      
      {/* LEFT SIDE ILLUSTRATION */}
  <div className="illustration">

  {/* FLOATING ANIMATED SHAPES */}
  <div className="floating-shape shape1"></div>
  <div className="floating-shape shape2"></div>
  <div className="floating-shape shape3"></div>

  {/* ILLUSTRATION IMAGE */}
  <img
    src={FinanceImg} 
    alt="illustration"
    className="side-illustration-img"
  />

  {/* GLASS CARD TEXT */}
  <div className="glass-box">
    <h1>Track Your Expenses Easily</h1>
    <p>Monitor, manage, and save — all in one place.</p>
  </div>

</div>

      {/* RIGHT SIDE LOGIN CARD */}
      <div className="login-section">
        <div className="login-box">
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to continue</p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={user.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={user.password}
                onChange={handleChange}
                required
              />

              <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                {!showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                    <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.77 21.77 0 0 1-5.06 5.94" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </span>
            </div>

            <button type="submit" className="login-btn">Login</button>
          </form>

          <p className="register">
            New user?
            <span onClick={() => navigate("/register")}> Create an account</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
