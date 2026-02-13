document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/list").then(function (r) { return r.json(); }).then(function (data) {
    showSummaryCards(data);
    setupBudgetGauge(data);
    drawCategoryChart(data);
    drawSpenderChart(data);
  }).catch(function (e) { console.log("Failed to load analytics", e); });
});

function getTotalCost(data) {
  let t = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].status === "In Cart"){
      t += data[i].price * data[i].quantity;
    }
  };
  return t;
}

function showSummaryCards(data) {
  let total = getTotalCost(data);
  let needed = 0;
  for (let i = 0; i < data.length; i++) { if (data[i].status === lifecycle[0]) needed++; }
  let expensive = data.length > 0 ? data[0] : null;
  for (let i = 1; i < data.length; i++) { 
    if ((data[i].status === "In Cart") && ((data[i].price > expensive.price))){
      expensive = data[i]; 
    }
 
  }
  document.getElementById("total-forecast").textContent = "$" + total.toFixed(2);
  document.getElementById("item-count").textContent = needed;
  document.getElementById("most-expensive").textContent = expensive ? expensive.item + " ($" + expensive.price.toFixed(2) + ")" : "—";
}

function setupBudgetGauge(data) {
  let totalCost = getTotalCost(data);
  let input = document.getElementById("budget-input");
  let bar = document.getElementById("budget-bar");
  let msg = document.getElementById("budget-message");
  let saved = localStorage.getItem("shopperpet-budget");
  if (saved) { input.value = saved; updateGauge(totalCost, parseFloat(saved)); }
  document.getElementById("set-budget-btn").addEventListener("click", function () {
    let budget = parseFloat(input.value);
    if (!budget || budget <= 0) { msg.textContent = "Please enter a valid budget."; msg.style.color = "var(--text-muted)"; return; }
    localStorage.setItem("shopperpet-budget", budget);
    updateGauge(totalCost, budget);
  });
  function updateGauge(cost, budget) {
    let pct = Math.min((cost / budget) * 100, 100);
    bar.style.width = pct + "%";
    bar.classList.remove("green", "yellow", "red");
    if (cost > budget) {
      bar.classList.add("red"); bar.style.width = "100%";
      msg.textContent = "🔴 You are $" + (cost - budget).toFixed(2) + " over budget!"; msg.style.color = "var(--danger)";
    } else if (pct >= 80) {
      bar.classList.add("yellow");
      msg.textContent = "🟡 Careful! Only $" + (budget - cost).toFixed(2) + " left."; msg.style.color = "#e76f00";
    } else {
      bar.classList.add("green");
      msg.textContent = "🟢 You have $" + (budget - cost).toFixed(2) + " left."; msg.style.color = "var(--success)";
    }
  }
}

function drawCategoryChart(data) {
  let cats = {};
  for (let i = 0; i < data.length; i++) {
    if (data[i].status === "In Cart"){
      let c = data[i].category, cost = data[i].price * data[i].quantity;
      cats[c] = (cats[c] || 0) + cost;
    }
  }
  let labels = Object.keys(cats), values = Object.values(cats);
  new Chart(document.getElementById("category-chart").getContext("2d"), {
    type: "doughnut",
    data: { labels: labels, datasets: [{ data: values, backgroundColor: chartColors.slice(0, labels.length), borderWidth: 2, borderColor: "#fff" }] },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } }
  });
}

function drawSpenderChart(data) {
  let sp = {};
  for (let i = 0; i < data.length; i++) {
    if (data[i].status === "In Cart"){
      let name = data[i].addedBy || "Anonymous", cost = data[i].price * data[i].quantity;
      sp[name] = (sp[name] || 0) + cost;
    }
  }
  new Chart(document.getElementById("spender-chart").getContext("2d"), {
    type: "bar",
    data: { labels: Object.keys(sp), datasets: [{ label: "Total Cost ($)", data: Object.values(sp), backgroundColor: "#2a9d8f", borderRadius: 4 }] },
    options: { indexAxis: "y", responsive: true, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
  });
}
