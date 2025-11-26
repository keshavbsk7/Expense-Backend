import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Login({ setIsLoggedIn }) 
 {
  const [user, setUser] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // STEP 1 — Frontend Validation
    if (user.username.trim() === "" || user.password.trim() === "") {
      alert("Please enter username and password");
      return; // STOP here (don't call API)
    }

    // STEP 2 — Call backend
    try {
      const res = await fetch("https://expense-backend-rxqo.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();
        console.log("API Response:", data);
        console.log("Status:", res.status);
      // STEP 3 — Check backend response
      if (res.ok && data.userId) {
        // Save user details
       //alert("Login Successful! Navigating...");
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("name", data.name);
        setIsLoggedIn(true); 
        // STEP 4 — Navigate to Home page
        navigate("/home");
      } else {
        alert(data.message || "Invalid username or password");
      }

    } catch (error) {
      alert("Server not responding. Try again later.");
      console.error(error);
    }
  };

  return (
    <div className="container login-box">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Enter username"
            value={user.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={user.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: "20px" }}>
        New user?  <span
    onClick={() => navigate("/register")}
    style={{ color: "#4a90e2", cursor: "pointer", fontWeight: "bold" }}
  >
    Create an account
  </span>
      </p>
    </div>
  );
}

export default Login;
