const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-frontend.onrender.com"
    ],
  })
);
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Expense Schema
const expenseSchema = new mongoose.Schema({
  amount: Number,
  date: String,
  category: String,
  description: String,
  userId: String
});

const Expense = mongoose.model("Expense", expenseSchema);

const userSchema = new mongoose.Schema(
  {
    name: String,
    username: String,
    email: String,
    password: String
  },
  { collection: "user_details" } // 👈 VERY IMPORTANT
);

const User = mongoose.model("User", userSchema);


// Add Expense
app.post("/add-expense", async (req, res) => {
  try {
    const expense = new Expense(req.body); // includes userId
    await expense.save();
    res.json({ message: "Expense added successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Expenses
app.get("/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Expense
app.delete("/expense/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Expense
app.put("/expense/:id", async (req, res) => {
  try {
    await Expense.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Expense updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/expenses/:userId", async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const existing = await User.findOne({ username });

    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const user = new User({ name, username, email, password });
    await user.save();

    res.json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    res.json({
      message: "Login successful",
      userId: user._id,
      name: user.name
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
