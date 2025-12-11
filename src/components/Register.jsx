import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Register.css";
import RegisterIllustration from "../Assets/register.svg";
import SignupImage from "../Assets/signup.svg";
function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({
    password: "",
    confirm: "",
    email:""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    // LIVE confirm-password validation
    if (name === "confirmPassword") {
      if (value !== form.password) {
        setErrors((prev) => ({ ...prev, confirm: "Passwords do not match" }));
      } else {
        setErrors((prev) => ({ ...prev, confirm: "" }));
      }
    }
  };

  // PASSWORD VALIDATION — ONLY onBlur
  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*(),.?":{}|<>]/;

    if (!minLength.test(password))
      return "Password must be at least 8 characters long";
    if (!upper.test(password))
      return "Password must contain at least one uppercase letter";
    if (!lower.test(password))
      return "Password must contain at least one lowercase letter";
    if (!number.test(password))
      return "Password must contain at least one digit";
    if (!special.test(password))
      return "Password must contain at least one special character";

    return "";
  };
const validateEmail = (email) => {
  // Standard email validation pattern
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

  const handlePasswordBlur = () => {
    const err = validatePassword(form.password);
    setErrors((prev) => ({ ...prev, password: err }));

    // Also re-check confirm password instantly once password is validated
    if (form.confirmPassword && form.confirmPassword !== form.password) {
      setErrors((prev) => ({ ...prev, confirm: "Passwords do not match" }));
    } else {
      setErrors((prev) => ({ ...prev, confirm: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (errors.password || errors.confirm) return;

    const res = await fetch("https://expense-backend-rxqo.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    alert(data.message);

    if (data.message === "User registered successfully!") {
      navigate("/");
    }
  };

  const isDisabled =
    !form.name ||
    !form.username ||
    !form.email ||
    !form.password ||
    !form.confirmPassword ||
    errors.password !== "" ||
    errors.confirm !== ""||
    errors.email!=="";

  return (
  <div className="register-wrapper">

    {/* FLOATING SHAPES */}
    <div className="floating-shape shape1"></div>
    <div className="floating-shape shape2"></div>
    <div className="floating-shape shape3"></div>
<div className="floating-shape shape4"></div>
<div className="floating-shape shape5"></div>
    {/* BACKGROUND ILLUSTRATION */}
    <img
      src={RegisterIllustration}
      alt="illustration"
      className="center-illustration"
    />
     <img
      src={SignupImage}
      alt="illustration"
      className="right-illustration"
    />

    <div className="register-box">
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>

        <input
          className="form-group"
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
        />

        <input
          className="form-group"
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        {/* EMAIL */}
        <input
          className="form-group"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => {
            handleChange(e);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          onBlur={() => {
            if (form.email.length > 0 && !validateEmail(form.email)) {
              setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
            }
          }}
        />

        {form.email.length > 0 && errors.email && (
          <p className="error-text">{errors.email}</p>
        )}

        {/* PASSWORD */}
        <input
          className="form-group"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => {
            handleChange(e);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          onBlur={handlePasswordBlur}
        />

        {form.password.length === 0 && (
          <p className="note-text">
            Password must include:
            <br />• 8+ characters
            <br />• Uppercase, lowercase
            <br />• Number & special character
          </p>
        )}

        {form.password.length > 0 && errors.password && (
          <p className="error-text">{errors.password}</p>
        )}

        <input
          className="form-group"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
        />

        {errors.confirm && (
          <p className="error-text">{errors.confirm}</p>
        )}

        <button type="submit" disabled={isDisabled} className="register-btn">
          Create Account
        </button>

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Login here</span>
        </p>

      </form>
    </div>
  </div>
);

}

export default Register;
