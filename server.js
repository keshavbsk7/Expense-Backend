const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
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
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY missing");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Expense Schema
const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  userId: { type: String, required: true },

  // NEW
  transactionType: {
    type: String,
    enum: ["credit", "debit"],
    required: true
  }
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

const passwordResetOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const PasswordResetOtp = mongoose.model(
  "PasswordResetOtp",
  passwordResetOtpSchema,
  "password_reset_otps"
);

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
app.get("/available-balance/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$transactionType",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let credit = 0;
    let debit = 0;

    result.forEach(r => {
      if (r._id === "credit") credit = r.total;
      if (r._id === "debit") debit = r.total;
    });

    res.json({
      availableBalance: credit - debit
    });

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

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always send same response (security)
    if (!user) {
      return res.json({ message: "If email exists, OTP has been sent" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Invalidate old OTPs
    await PasswordResetOtp.updateMany(
      { email, used: false },
      { used: true }
    );

    // Save OTP
    await PasswordResetOtp.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    });

    // Send Email
  await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });


    res.json({ message: "If email exists, OTP has been sent" });

  } catch (err) {
    
     console.error("Forgot password error:", err);
  res.status(500).json({ error: "Failed to send OTP" });
  }
});
app.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await User.findOneAndUpdate(
      { email },
      { password: newPassword }
    );

    if (!result) {
      return res.status(400).json({ message: "User not found" });
    }

    // Invalidate all OTPs
    await PasswordResetOtp.updateMany(
      { email },
      { used: true }
    );

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: "Password reset failed" });
  }
});
app.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find latest unused OTP for this email
    const otpRecord = await PasswordResetOtp.findOne({
      email,
      used: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  console.log("VERIFY OTP REQUEST");
  console.log("EMAIL FROM UI:", email);
  console.log("OTP FROM UI:", otp);
console.log("OTP RECORD FROM DB:", otpRecord);

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      otpRecord.used = true;
      await otpRecord.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    // Limit attempts (optional but recommended)
    if (otpRecord.attempts >= 5) {
      otpRecord.used = true;
      await otpRecord.save();
      return res.status(400).json({ message: "Too many wrong attempts" });
    }

    // Compare OTP (bcrypt)
    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid
    otpRecord.used = true;
    await otpRecord.save();

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error while verifying OTP" });
  }
});
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

