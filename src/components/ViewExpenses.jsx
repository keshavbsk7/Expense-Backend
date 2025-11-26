import { useEffect, useState, useRef } from "react";
import "../App.css";

function ViewExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [sortType, setSortType] = useState(null);

  // NEW STATES FOR DELETE FUNCTIONALITY
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const dropdownRef = useRef(null);
  const userId = localStorage.getItem("userId");

  const categories = [
    "Food", "Travel", "Shopping", "Bills", "Health",
    "Education", "Groceries", "Entertainment", "Fuel",
    "Rent", "EMI / Loans", "Other"
  ];

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const res = await fetch(`https://expense-backend-rxqo.onrender.com/expenses/${userId}`);
      const data = await res.json();
      setExpenses(data);
      setFilteredExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Toggle category filter
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const applyFilter = () => {
    if (selectedCategories.length === 0) {
      setFilteredExpenses(expenses);
    } else {
      const filtered = expenses.filter(exp =>
        selectedCategories.includes(exp.category)
      );
      setFilteredExpenses(filtered);
    }
  };

  const handleItemClick = (e, cat) => {
    e.stopPropagation();
    toggleCategory(cat);
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (showCategoryFilter) applyFilter();
        setShowCategoryFilter(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showCategoryFilter, selectedCategories, expenses]);

  // Sorting
  const sortByAmount = () => {
    let sorted;
    if (sortType === "amountAsc") {
      sorted = [...filteredExpenses].sort((a, b) => b.amount - a.amount);
      setSortType("amountDesc");
    } else {
      sorted = [...filteredExpenses].sort((a, b) => a.amount - b.amount);
      setSortType("amountAsc");
    }
    setFilteredExpenses(sorted);
  };

  const sortByDate = () => {
    let sorted;
    if (sortType === "dateAsc") {
      sorted = [...filteredExpenses].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setSortType("dateDesc");
    } else {
      sorted = [...filteredExpenses].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setSortType("dateAsc");
    }
    setFilteredExpenses(sorted);
  };

  // NEW: Toggle row selection
  const toggleRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(x => x !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // NEW: Select all rows
  const toggleSelectAll = () => {
    if (selectedRows.length === filteredExpenses.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredExpenses.map(exp => exp._id));
    }
  };

  // NEW: Delete selected rows
  const deleteSelected = async () => {
    try {
      const res = await fetch("https://expense-backend-rxqo.onrender.com/delete-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRows })
      });

      const data = await res.json();
      alert(data.message);

      setShowDeletePopup(false);
      setSelectedRows([]);
      fetchExpenses();
    } catch (err) {
      alert("Error deleting records");
    }
  };

  return (
    <div className="container">

      <h2>Expense Details</h2>

    {/* SMALL DELETE ICON BUTTON (visible only when rows selected) */}

<div className="table-wrapper" style={{ position: "relative" }}>
{selectedRows.length > 0 && (
  <span className="delete-icon-btn" onClick={() => setShowDeletePopup(true)}>
    🗑️
  </span>
)}

      <table className="expense-table">
        <thead>
          <tr>
            {/* Select All */}
            <th>
              <input
                type="checkbox"
                checked={selectedRows.length === filteredExpenses.length}
                onChange={toggleSelectAll}
              />
            </th>

            <th onClick={sortByAmount} style={{ cursor: "pointer" }}>
              Amount {sortType === "amountAsc" ? "↑" : sortType === "amountDesc" ? "↓" : ""}
            </th>

            <th onClick={sortByDate} style={{ cursor: "pointer" }}>
              Date {sortType === "dateAsc" ? "↑" : sortType === "dateDesc" ? "↓" : ""}
            </th>

            <th
              className="category-header"
              style={{ position: "relative", cursor: "pointer" }}
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              ref={dropdownRef}
            >
              Category ▾

              {showCategoryFilter && (
                <div className="category-dropdown">
                  <input
                    type="text"
                    className="category-search"
                    placeholder="Search..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />

                  {categories
                    .filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map((cat, index) => (
                      <div
                        key={index}
                        className="dropdown-item"
                        onClick={(e) => handleItemClick(e, cat)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          readOnly
                        />
                        <span>{cat}</span>
                      </div>
                    ))}
                </div>
              )}
            </th>

            <th>Description</th>
          </tr>
        </thead>

        <tbody>
          {filteredExpenses.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                No records found
              </td>
            </tr>
          ) : (
            filteredExpenses.map(exp => (
              <tr key={exp._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(exp._id)}
                    onChange={() => toggleRow(exp._id)}
                  />
                </td>
                <td>₹ {exp.amount}</td>
                <td>{exp.date}</td>
                <td>{exp.category}</td>
                <td>{exp.description}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
</div>
      {/* DELETE CONFIRMATION POPUP */}
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Delete Selected Items?</h3>
            <p>This action cannot be undone.</p>

            <div className="popup-actions">
              <button className="popup-cancel" onClick={() => setShowDeletePopup(false)}>
                Cancel
              </button>

              <button className="popup-delete" onClick={deleteSelected}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ViewExpenses;
