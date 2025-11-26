import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="container login-box">
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

      {/* EMAIL INPUT */}
          <input
            className="form-group"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => {
              handleChange(e);

              // HIDE email error while typing
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            onBlur={() => {
              if (form.email.length > 0 && !validateEmail(form.email)) {
                setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
              }
            }}
          />

          {/* Show EMAIL ERROR only when email has something & is invalid */}
          {form.email.length > 0 && errors.email && (
            <p style={{ color: "red", marginTop: "-10px" }}>{errors.email}</p>
          )}


        {/* PASSWORD INPUT */}
        <input
          className="form-group"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => {
            handleChange(e);

            // Hide error while typing
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          onBlur={handlePasswordBlur}
        />

        {/* Show NOTE only when password is empty */}
        {form.password.length === 0 && (
          <p
            style={{
              color: "#555",
              fontSize: "13px",
              marginTop: "5px",
              marginBottom: "5px"
            }}
          >
            Password must be at least <b>8 characters</b> and include:
            <br />• 1 uppercase letter (A–Z)
            <br />• 1 lowercase letter (a–z)
            <br />• 1 number (0–9)
            <br />• 1 special character (!@#$%)
          </p>
        )}

        {/* Show ERROR only if:  
            - Password is not empty  
            - Error exists  
            - User is NOT typing (because we clear error while typing) */}
        {form.password.length > 0 && errors.password && (
          <p style={{ color: "red", marginTop: "-10px" }}>{errors.password}</p>
        )}



        <input
          className="form-group"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}   // LIVE validation here
        />

        {errors.confirm && (
          <p style={{ color: "red", marginTop: "-10px" }}>{errors.confirm}</p>
        )}

        <button type="submit" disabled={isDisabled} style={{ opacity: isDisabled ? 0.6 : 1 }}>
          Create Account
        </button>
        <p style={{ marginTop: "15px", textAlign: "center" }}>
  Already have an account?{" "}
  <span
    onClick={() => navigate("/")}
    style={{ color: "#4a90e2", cursor: "pointer", fontWeight: "bold" }}
  >
    Login here
  </span>
</p>

      </form>
    </div>
  );
}

export default Register;
