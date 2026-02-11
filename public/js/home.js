// ── Home Page Logic ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('recent-items');

  try {
    const res = await fetch('/api/list');
    const data = await res.json();

    // Show 3 most recently added items (by dateAdded desc, then id desc)
    const recent = data
      .sort((a, b) => b.id - a.id)
      .slice(0, 3);

    if (recent.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>No items yet. <a href="/add">Add your first one!</a></p>
        </div>`;
      return;
    }

    container.innerHTML = recent.map(item => `
      <a href="/item?id=${item.id}" class="grocery-item" style="text-decoration:none;color:inherit;">
        <div class="item-info">
          <div class="item-name">${escapeHtml(item.item)}</div>
          <div class="item-meta">
            ${escapeHtml(item.category)} · Qty: ${item.quantity} · $${item.price.toFixed(2)}
          </div>
        </div>
        <span class="badge badge-${item.priority.toLowerCase()}">${item.priority}</span>
      </a>
    `).join('');

  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <p>Could not load items.</p>
      </div>`;
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
