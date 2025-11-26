import { useEffect, useState } from "react";
import "../App.css";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend
} from "recharts";


// ====================== CATEGORY ICONS ==========================
const categoryIcons = {
  Food: "🍽️",
  Travel: "✈️",
  Shopping: "🛍️",
  Bills: "💡",
  Health: "🩺",
  Rent: "🏠",
  Fuel: "⛽",
  Groceries: "🛒",
  Entertainment: "🎬",
  Other: "📦",
};

// ====================== PIE LABEL LOGIC ==========================
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
  payload
}) => {
  if (percent < 0.05) return null; // hide very small slices

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;

  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const category = payload._id;                           // category name
  const icon = categoryIcons[category] || "📌";           // emoji

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: "12px", fontWeight: "bold" }}
    >
      {`${icon} ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

// ====================== ANIMATED NUMBER ==========================
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    let end = value;
    if (start === end) return;

    let duration = 1200;
    let stepTime = 10;
    const increment = (end - start) / (duration / stepTime);

    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplay(Math.floor(start));
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
};

// ====================== INSIGHTS ==========================
function generateInsights(categoryTotals, prediction, monthlyTrend) {
  let insights = [];

  const topCategory = [...categoryTotals].sort((a, b) => b.totalSpent - a.totalSpent)[0];
  if (topCategory) {
    insights.push(`You spend the most on ${topCategory._id} (₹${topCategory.totalSpent}).`);
  }

  if (prediction?.mostGrowingCategory) {
    insights.push(`${prediction.mostGrowingCategory} is your fastest growing expense category.`);
  }

  if (monthlyTrend.length >= 2) {
    const last = monthlyTrend[monthlyTrend.length - 1].totalSpent;
    const prev = monthlyTrend[monthlyTrend.length - 2].totalSpent;

    if (last > prev) {
      insights.push(`Your spending increased by ₹${(last - prev).toFixed(2)} last month.`);
    } else if (last < prev) {
      insights.push(`Your spending decreased by ₹${(prev - last).toFixed(2)} last month.`);
    }
  }

  return insights;
}


// ====================== MAIN HOME COMPONENT ==========================
function Home() {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  const userId = localStorage.getItem("userId");
  const name = localStorage.getItem("name") || "User";

  const COLORS = [
    "#4a90e2", "#f39c12", "#e74c3c", "#8e44ad",
    "#2ecc71", "#3498db", "#d35400"
  ];

  // Greeting message logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 17) return "Good Afternoon ☀️";
    return "Good Evening 🌙";
  };

  // Load data from backend
  useEffect(() => {
    const loadAll = async () => {
      try {
        const regRes = await fetch(`https://expense-backend-rxqo.onrender.com/category-prediction/${userId}`);
        setPrediction(await regRes.json());

        const totalsRes = await fetch(`https://expense-backend-rxqo.onrender.com/category-analysis/${userId}`);
        setCategoryTotals(await totalsRes.json());

        const monthlyRes = await fetch(`https://expense-backend-rxqo.onrender.com/monthly-trend/${userId}`);
        setMonthlyTrend(await monthlyRes.json());

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [userId]);

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading Dashboard...</h2>;

  // Summary card values
  const totalThisMonth = monthlyTrend.length
    ? monthlyTrend[monthlyTrend.length - 1].totalSpent
    : 0;

  const highestCategory = categoryTotals.length
    ? categoryTotals[0]._id
    : "N/A";

  const predictedNextMonth =
    prediction?.predictionDetails?.[highestCategory]?.predictedAmount || 0;

  const insights = generateInsights(categoryTotals, prediction, monthlyTrend);


  return (
    <div style={{ padding: "25px 40px" }}>


      {/* ================= GREETING CARD ===================== */}
      <div className="greeting-card fade-in">
        <h2 style={{ margin: 0, fontSize: "28px" }}>
          {getGreeting()}, <b>{name}</b> 👋
        </h2>
        <p style={{ marginTop: "10px", opacity: 0.9 }}>
          Welcome back! Expense Tracker helps you monitor, analyze, and improve your spending habits.
        </p>
        <h3 style={{ marginTop: "15px", fontWeight: "500" }}>
          Your expense analytics dashboard is ready 📊
        </h3>
      </div>

      {/* ================= SUMMARY CARDS ===================== */}
      <div className="summary-row fade-in">
        <div className="summary-card">
          <span className="summary-icon">💰</span>
          <div>
            <div>Total Spent This Month</div>
            <div className="summary-value">₹<AnimatedNumber value={totalThisMonth} /></div>
          </div>
        </div>

        <div className="summary-card">
          <span className="summary-icon">🏆</span>
          <div>
            <div>Highest Category</div>
            <div className="summary-value">{highestCategory}</div>
          </div>
        </div>

        <div className="summary-card">
          <span className="summary-icon">📈</span>
          <div>
            <div>Predicted Next Month</div>
            <div className="summary-value">
              ₹<AnimatedNumber value={Math.floor(predictedNextMonth)} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= INSIGHTS SECTION ===================== */}
      <div className="dashboard-card fade-in" style={{ marginBottom: "30px" }}>
        <h3>💡 Key Insights</h3>
        {insights.map((line, idx) => (
          <p key={idx} style={{ fontSize: "16px", marginTop: "10px" }}>• {line}</p>
        ))}
      </div>

      {/* ================= PIE + BAR ===================== */}
      <div className="dashboard-row fade-in">

        {/* PIE CHART */}
        <div className="dashboard-col dashboard-card">
          <h3>🍕 Category Spending Split</h3>
          <PieChart width={360} height={320}>
            <Pie
  data={categoryTotals}
  dataKey="totalSpent"
  nameKey="_id"
  cx="50%"
  cy="50%"
  outerRadius={120}
  labelLine={false}
  label={renderCustomizedLabel}
>
  {categoryTotals.map((entry, index) => (
    <Cell key={index} fill={COLORS[index % COLORS.length]} />
  ))}
</Pie>
            <Tooltip formatter={(v) => `₹${v}`} />
          </PieChart>
        </div>

        {/* BAR CHART */}
        <div className="dashboard-col dashboard-card">
          <h3>📦 Category-wise Spending</h3>
          <BarChart width={360} height={320} data={categoryTotals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip formatter={(v) => `₹${v}`} />
            <Legend />
            <Bar dataKey="totalSpent" fill="#4a90e2" />
          </BarChart>
        </div>
      </div>

      {/* ================= LINE CHART ===================== */}
      <div className="dashboard-card fade-in" style={{ marginBottom: "40px" }}>
        <h3>📆 Monthly Expense Trend</h3>

        <LineChart width={720} height={320} data={monthlyTrend}>
          <defs>
            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor="#e74c3c" stopOpacity={0.8} />
              <stop offset="90%" stopColor="#e74c3c" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(v) => `₹${v}`} />
          <Legend />

          <Line
            type="monotone"
            dataKey="totalSpent"
            stroke="#e74c3c"
            strokeWidth={2}
            fill="url(#colorSpend)"
            fillOpacity={1}
          />
        </LineChart>
      </div>

    </div>
  );
}

export default Home;
