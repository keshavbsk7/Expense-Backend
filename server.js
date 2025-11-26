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
      "https://expense-frontend-5a63.onrender.com"
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

// BULK DELETE
app.post("/delete-multiple", async (req, res) => {
  try {
    const { ids } = req.body;  // array of _id values

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    await Expense.deleteMany({ _id: { $in: ids } });

    res.json({ message: "Selected expenses deleted successfully" });

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
const regression = require("regression");

// CATEGORY BASED PREDICTION (Linear Regression)
app.get("/category-prediction/:userId", async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.params.userId });

    if (expenses.length === 0) {
      return res.json({ message: "No expense data found" });
    }

    // Group by category
    const categoryMap = {};

    expenses.forEach((exp) => {
      const cat = exp.category;
      if (!categoryMap[cat]) categoryMap[cat] = [];

      categoryMap[cat].push([
        new Date(exp.date).getTime(), // X → timestamp
        exp.amount                     // Y → amount spent
      ]);
    });

    const predictionResults = {};

    // Perform regression for each category
    for (const category in categoryMap) {
      const dataPoints = categoryMap[category];

      if (dataPoints.length < 2) {
        predictionResults[category] = {
          message: "Not enough data for regression",
          predictedNext: 0,
          slope: 0
        };
        continue;
      }

      const result = regression.linear(dataPoints);

      const slope = result.equation[0];

      // Predict next 30 days from now
      const next30 = Date.now() + 30 * 24 * 60 * 60 * 1000;
      const predictedAmount = result.predict(next30)[1];

      predictionResults[category] = {
        slope,
        predictedAmount,
        dataPointsCount: dataPoints.length
      };
    }

    // Find category with highest slope (fastest growing)
    let topCategory = null;
    let highestSlope = -Infinity;

    for (const cat in predictionResults) {
      if (predictionResults[cat].slope > highestSlope) {
        highestSlope = predictionResults[cat].slope;
        topCategory = cat;
      }
    }

    res.json({
      mostGrowingCategory: topCategory,
      highestSlope,
      predictionDetails: predictionResults
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//const regression = require("regression");

app.get("/category-analysis/:userId", async (req, res) => {
  try {
    const result = await Expense.aggregate([
      { $match: { userId: req.params.userId } },

      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" }
        }
      },

      { $sort: { totalSpent: -1 } }
    ]);

    res.json(result);  // MUST return an ARRAY
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// MONTHLY TREND (SUM OF ALL EXPENSES PER MONTH)
app.get("/monthly-trend/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await Expense.aggregate([
      { $match: { userId } },

      {
        $group: {
          _id: {
            year: { $year: { $toDate: "$date" } },
            month: { $month: { $toDate: "$date" } }
          },
          totalSpent: { $sum: "$amount" }
        }
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const formatted = result.map(r => ({
      month: `${r._id.month}-${r._id.year}`,
      totalSpent: r.totalSpent
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

