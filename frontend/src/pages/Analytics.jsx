import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

// Need this for socket listening
import io from "socket.io-client";

// register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// analytics page - shows spending info and charts
function Analytics() {
  let [data, setData] = useState([]);
  let [users, setUsers] = useState([]);
  let [loading, setLoading] = useState(true);
  let [budget, setBudget] = useState("");
  let [budgetMsg, setBudgetMsg] = useState("Enter a budget to see your spending gauge.");
  let [budgetMsgColor, setBudgetMsgColor] = useState("gray");
  let [barWidth, setBarWidth] = useState("0%");
  let [barColor, setBarColor] = useState("green");

  function loadAnalyticsData() {
    Promise.all([
      fetch("/api/list").then(function (res) { return res.json(); }),
      fetch("/api/users").then(function (res) { return res.json(); })
    ])
      .then(function (results) {
        let items = results[0];
        let usersList = results[1];

        setData(items);
        setUsers(usersList);
        setLoading(false);

        // check for saved budget
        let saved = localStorage.getItem("shopperpet-budget");
        if (saved) {
          setBudget(saved);
          updateGauge(getTotalCost(items), parseFloat(saved));
        }
      })
      .catch(function (e) {
        console.log("Failed to load analytics", e);
        setLoading(false);
      });
  }

  useEffect(function () {
    loadAnalyticsData(); // Load initally

    let socket = io("http://localhost:8080");

    // Listen for any changes to the list and re-fresh data
    socket.on("list-updated", function () {
      loadAnalyticsData(); 
    });

    // Disconnect when user left page
    return function () {
      socket.disconnect();
    };


  }, []);

  // only count items that are in the cart for the total cost
  function getTotalCost(items) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === "In Cart") {
        total += items[i].price * items[i].quantity;
      }
    }
    return total;
  }

  // count how many items still need to be bought
  function getNeededCount(items) {
    let needed = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === "Needed") needed++;
    }
    return needed;
  }

  // find the most expensive item that was in cart
  function getMostExpensive(items) {
    let expensive = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === "In Cart") {
        if (!expensive || items[i].price > expensive.price) {
          expensive = items[i];
        }
      }
    }
    return expensive;
  }

  // updates the gauge bar color and message
  function updateGauge(cost, budgetVal) {
    let pct = Math.min((cost / budgetVal) * 100, 100);

    if (cost > budgetVal) {
      setBarColor("red");
      setBarWidth("100%");
      setBudgetMsg("You are $" + (cost - budgetVal).toFixed(2) + " over budget!");
      setBudgetMsgColor("crimson");
    } else if (pct >= 80) {
      setBarColor("yellow");
      setBarWidth(pct + "%");
      setBudgetMsg("Careful! Only $" + (budgetVal - cost).toFixed(2) + " left.");
      setBudgetMsgColor("chocolate");
    } else {
      setBarColor("green");
      setBarWidth(pct + "%");
      setBudgetMsg("You have $" + (budgetVal - cost).toFixed(2) + " left.");
      setBudgetMsgColor("green");
    }
  }

  function handleSetBudget() {
    let budgetVal = parseFloat(budget);
    if (!budgetVal || budgetVal <= 0) {
      setBudgetMsg("Please enter a valid budget.");
      setBudgetMsgColor("gray");
      return;
    }
    localStorage.setItem("shopperpet-budget", budgetVal);
    updateGauge(getTotalCost(data), budgetVal);
  }

  // build chart data for categories
  function getCategoryChartData() {
    let cats = {};
    for (let i = 0; i < data.length; i++) {
      if (data[i].status === "In Cart") {
        let cat = data[i].category;
        let cost = data[i].price * data[i].quantity;
        cats[cat] = (cats[cat] || 0) + cost;
      }
    }

    let labels = Object.keys(cats);
    let values = Object.values(cats);
    let colors = ["teal", "crimson", "chocolate", "darkslategray", "gold", "olive", "steelblue", "sienna", "purple", "navy"];

    return {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: "#fff"
      }]
    };
  }

  // build chart data for spenders
  function getSpenderChartData() {
    let spenders = {};
    for (let i = 0; i < data.length; i++) {
      if (data[i].status === "In Cart") {
        let addedById = data[i].addedBy;
        let name = "Anonymous";

        for (let j = 0; j < users.length; j++) {
          // Check against both ID and Name just in case there is old Assignment 2 data
          if (users[j]._id === addedById || users[j].name === addedById) {
            name = users[j].name;
            break;
          }
        }

        let cost = data[i].price * data[i].quantity;
        spenders[name] = (spenders[name] || 0) + cost;
      }
    }

    return {
      labels: Object.keys(spenders),
      datasets: [{
        label: "Total Cost ($)",
        data: Object.values(spenders),
        backgroundColor: "teal",
        borderRadius: 4
      }]
    };
  }

  if (loading) {
    return (
      <main className="container">
        <div className="empty-state"><p>Loading...</p></div>
      </main>
    );
  }

  let totalCost = getTotalCost(data);
  let neededCount = getNeededCount(data);
  let expensive = getMostExpensive(data);

  return (
    <main className="container">
      <h1>Spending Dashboard</h1>
      <p className="subtitle">Forecast your grocery spending and track your budget.</p>

      <div className="summary-cards" id="summary-cards">
        <div className="summary-card">
          <div className="card-value" id="total-forecast">{"$" + totalCost.toFixed(2)}</div>
          <div className="card-label">Total Forecast</div>
        </div>
        <div className="summary-card">
          <div className="card-value" id="item-count">{neededCount}</div>
          <div className="card-label">Needed To Buy</div>
        </div>
        <div className="summary-card">
          <div className="card-value" id="most-expensive">{expensive ? expensive.item + " ($" + expensive.price.toFixed(2) + ")" : "-"}</div>
          <div className="card-label">Most Expensive In Cart</div>
        </div>
      </div>

      <div className="budget-section card">
        <h2>Budget Gauge</h2>
        <div className="budget-input-row">
          <label htmlFor="budget-input" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Your budget: $</label>
          <input type="number" id="budget-input" min="0" step="1" placeholder="200" value={budget} onChange={function (e) { setBudget(e.target.value); }} />
          <button id="set-budget-btn" className="btn btn-primary btn-sm" onClick={handleSetBudget}>Set</button>
        </div>
        <div className="budget-bar-container">
          <div className={"budget-bar " + barColor} id="budget-bar" style={{ width: barWidth }}></div>
        </div>
        <div className="budget-message" id="budget-message" style={{ color: budgetMsgColor }}>{budgetMsg}</div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Cost by Category</h3>
          <Doughnut data={getCategoryChartData()} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
        </div>
        <div className="chart-card">
          <h3>Spender Leaderboard</h3>
          <Bar data={getSpenderChartData()} options={{ indexAxis: "y", responsive: true, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }} />
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <Link to="/" className="btn btn-secondary">Back Home</Link>
      </div>
    </main>
  );
}

export default Analytics;
