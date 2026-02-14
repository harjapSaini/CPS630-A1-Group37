// analytics page - shows spending info and charts
document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/list")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      showSummaryCards(data);
      setupBudgetGauge(data);
      drawCategoryChart(data);
      drawSpenderChart(data);
    })
    .catch(function (e) {
      console.log("Failed to load analytics", e);
    });
});

// only count items that are in the cart for the total cost
function getTotalCost(data) {
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].status === "In Cart") {
      total += data[i].price * data[i].quantity;
    }
  }
  return total;
}

// fills in the summary cards at the top
function showSummaryCards(data) {
  let total = getTotalCost(data);

  // count how many items still need to be bought
  let needed = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].status === "Needed") needed++;
  }

  // find the most expensive item in cart
  let expensive = data.length > 0 ? data[0] : null;
  for (let i = 1; i < data.length; i++) {
    if ((data[i].status === "In Cart") && ((data[i].price > expensive.price))) {
      expensive = data[i];
    }
  }

  document.getElementById("total-forecast").textContent = "$" + total.toFixed(2);
  document.getElementById("item-count").textContent = needed;
  document.getElementById("most-expensive").textContent = expensive ? expensive.item + " ($" + expensive.price.toFixed(2) + ")" : "—";
}

// budget gauge - lets user set a budget and shows a bar
function setupBudgetGauge(data) {
  let totalCost = getTotalCost(data);
  let input = document.getElementById("budget-input");
  let bar = document.getElementById("budget-bar");
  let msg = document.getElementById("budget-message");

  // check if theres a saved budget in localStorage
  let saved = localStorage.getItem("shopperpet-budget");
  if (saved) {
    input.value = saved;
    updateGauge(totalCost, parseFloat(saved));
  }

  document.getElementById("set-budget-btn").addEventListener("click", function () {
    let budget = parseFloat(input.value);
    if (!budget || budget <= 0) {
      msg.textContent = "Please enter a valid budget.";
      msg.style.color = "gray";
      return;
    }
    localStorage.setItem("shopperpet-budget", budget);
    updateGauge(totalCost, budget);
  });

  // updates the gauge bar color and message
  function updateGauge(cost, budget) {
    let pct = Math.min((cost / budget) * 100, 100);
    bar.style.width = pct + "%";
    bar.classList.remove("green", "yellow", "red");

    // check if over budget
    if (cost > budget) {
      bar.classList.add("red");
      bar.style.width = "100%";
      msg.textContent = "You are $" + (cost - budget).toFixed(2) + " over budget!";
      msg.style.color = "crimson";
    } else if (pct >= 80) {
      bar.classList.add("yellow");
      msg.textContent = "Careful! Only $" + (budget - cost).toFixed(2) + " left.";
      msg.style.color = "chocolate";
    } else {
      bar.classList.add("green");
      msg.textContent = "You have $" + (budget - cost).toFixed(2) + " left.";
      msg.style.color = "green";
    }
  }
}

// group spending by category for the pie chart
function drawCategoryChart(data) {
  let categories = {};
  for (let i = 0; i < data.length; i++) {
    if (data[i].status === "In Cart") {
      let cat = data[i].category;
      let cost = data[i].price * data[i].quantity;
      categories[cat] = (categories[cat] || 0) + cost;
    }
  }

  let labels = Object.keys(categories);
  let values = Object.values(categories);
  let colors = ["teal", "crimson", "chocolate", "darkslategray", "gold", "olive", "steelblue", "sienna", "purple", "navy"];

  // create the doughnut chart
  new Chart(document.getElementById("category-chart").getContext("2d"), {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: "#fff"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// group spending by person for the bar chart
function drawSpenderChart(data) {
  let spenders = {};
  for (let i = 0; i < data.length; i++) {
    if (data[i].status === "In Cart") {
      let name = data[i].addedBy || "Anonymous";
      let cost = data[i].price * data[i].quantity;
      spenders[name] = (spenders[name] || 0) + cost;
    }
  }

  // create the horizontal bar chart
  new Chart(document.getElementById("spender-chart").getContext("2d"), {
    type: "bar",
    data: {
      labels: Object.keys(spenders),
      datasets: [{
        label: "Total Cost ($)",
        data: Object.values(spenders),
        backgroundColor: "teal",
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  });
}