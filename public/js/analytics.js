// ── Analytics Page Logic ────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/list');
    const data = await res.json();

    renderSummaryCards(data);
    renderBudgetGauge(data);
    renderCategoryChart(data);
    renderSpenderChart(data);
  } catch (err) {
    console.error('Failed to load analytics data', err);
  }
});

// ── Summary Cards ───────────────────────────────────────
function renderSummaryCards(data) {
  const totalCost = data.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const pendingCount = data.filter(i => i.status === 'Pending').length;
  const mostExpensive = data.length > 0
    ? data.reduce((max, i) => i.price > max.price ? i : max, data[0])
    : null;

  document.getElementById('total-forecast').textContent = `$${totalCost.toFixed(2)}`;
  document.getElementById('item-count').textContent = pendingCount;
  document.getElementById('most-expensive').textContent = mostExpensive
    ? `${mostExpensive.item} ($${mostExpensive.price.toFixed(2)})`
    : '—';
}

// ── Budget Gauge ────────────────────────────────────────
function renderBudgetGauge(data) {
  const totalCost = data.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const budgetInput = document.getElementById('budget-input');
  const bar = document.getElementById('budget-bar');
  const message = document.getElementById('budget-message');
  const setBtn = document.getElementById('set-budget-btn');

  // Load saved budget
  const saved = localStorage.getItem('shopperpet-budget');
  if (saved) {
    budgetInput.value = saved;
    updateGauge(totalCost, parseFloat(saved));
  }

  setBtn.addEventListener('click', () => {
    const budget = parseFloat(budgetInput.value);
    if (!budget || budget <= 0) {
      message.textContent = 'Please enter a valid budget.';
      message.style.color = 'var(--text-muted)';
      return;
    }
    localStorage.setItem('shopperpet-budget', budget);
    updateGauge(totalCost, budget);
  });

  function updateGauge(cost, budget) {
    const pct = Math.min((cost / budget) * 100, 100);
    bar.style.width = pct + '%';

    bar.classList.remove('green', 'yellow', 'red');

    if (cost > budget) {
      bar.classList.add('red');
      bar.style.width = '100%';
      message.textContent = `🔴 You are $${(cost - budget).toFixed(2)} over budget!`;
      message.style.color = 'var(--danger)';
    } else if (pct >= 80) {
      bar.classList.add('yellow');
      message.textContent = `🟡 Careful! Only $${(budget - cost).toFixed(2)} left.`;
      message.style.color = '#e76f00';
    } else {
      bar.classList.add('green');
      message.textContent = `🟢 You have $${(budget - cost).toFixed(2)} left.`;
      message.style.color = 'var(--success)';
    }
  }
}

// ── Category Pie Chart ──────────────────────────────────
function renderCategoryChart(data) {
  const categories = {};
  data.forEach(item => {
    const cost = item.price * item.quantity;
    categories[item.category] = (categories[item.category] || 0) + cost;
  });

  const labels = Object.keys(categories);
  const values = Object.values(categories);

  const colors = [
    '#2a9d8f', '#e63946', '#f4a261', '#264653', '#e9c46a',
    '#606c38', '#457b9d', '#bc6c25', '#6a4c93', '#1d3557'
  ];

  const ctx = document.getElementById('category-chart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { family: 'Inter', size: 11 }, padding: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: $${ctx.parsed.toFixed(2)}`
          }
        }
      }
    }
  });
}

// ── Spender Bar Chart ───────────────────────────────────
function renderSpenderChart(data) {
  const spenders = {};
  data.forEach(item => {
    const cost = item.price * item.quantity;
    const name = item.addedBy || 'Anonymous';
    spenders[name] = (spenders[name] || 0) + cost;
  });

  // Sort descending
  const sorted = Object.entries(spenders).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(s => s[0]);
  const values = sorted.map(s => s[1]);

  const ctx = document.getElementById('spender-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Cost ($)',
        data: values,
        backgroundColor: '#2a9d8f',
        borderRadius: 4,
        barPercentage: 0.6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` $${ctx.parsed.x.toFixed(2)}`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: v => '$' + v,
            font: { family: 'Inter', size: 11 }
          },
          grid: { color: '#eee' }
        },
        y: {
          ticks: { font: { family: 'Inter', size: 12 } },
          grid: { display: false }
        }
      }
    }
  });
}
