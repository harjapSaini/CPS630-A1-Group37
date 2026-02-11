// ── List Page Logic ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadList();

  document.getElementById('download-btn').addEventListener('click', downloadList);
});

async function loadList() {
  const container = document.getElementById('grocery-list');

  try {
    const res = await fetch('/api/list');
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>Your list is empty. <a href="/add">Add some items!</a></p>
        </div>`;
      return;
    }

    container.innerHTML = data.map(item => {
      const statusClass = item.status === 'In Cart' ? 'status-in-cart'
                        : item.status === 'Purchased' ? 'status-purchased' : '';

      const nextStatus = item.status === 'Pending' ? 'In Cart'
                       : item.status === 'In Cart' ? 'Purchased' : 'Pending';

      const statusIcon = item.status === 'Pending' ? '⬜'
                       : item.status === 'In Cart' ? '🛒' : '✅';

      return `
        <div class="grocery-item ${statusClass}">
          <div class="item-info">
            <a href="/item?id=${item.id}" class="item-name">${escapeHtml(item.item)}</a>
            <div class="item-meta">
              ${escapeHtml(item.category)} · Qty: ${item.quantity} · $${item.price.toFixed(2)}
              ${item.store ? ' · ' + escapeHtml(item.store) : ''}
            </div>
          </div>
          <span class="badge badge-${item.priority.toLowerCase()}">${item.priority}</span>
          <span class="status-tag status-${item.status.toLowerCase().replace(' ', '-')}">${statusIcon} ${item.status}</span>
          <div class="item-actions">
            <button class="btn btn-secondary btn-sm" onclick="toggleStatus(${item.id}, '${nextStatus}')" title="Mark as ${nextStatus}">
              ${nextStatus === 'In Cart' ? '🛒' : nextStatus === 'Purchased' ? '✅' : '↩'}
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})" title="Remove">✕</button>
          </div>
        </div>`;
    }).join('');

  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <p>Could not load list.</p>
      </div>`;
  }
}

async function toggleStatus(id, newStatus) {
  try {
    await fetch(`/api/list/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    loadList();
    showToast(`Status updated to "${newStatus}"`);
  } catch (err) {
    showToast('Failed to update status');
  }
}

async function deleteItem(id) {
  if (!confirm('Remove this item from the list?')) return;

  try {
    const res = await fetch(`/api/list/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadList();
      showToast('Item removed');
    } else {
      showToast('Failed to remove item');
    }
  } catch (err) {
    showToast('Failed to remove item');
  }
}

async function downloadList() {
  try {
    const res = await fetch('/api/list');
    const data = await res.json();

    const lines = data.map(item =>
      `${item.status === 'Purchased' ? '[x]' : '[ ]'} ${item.item} (${item.category}) — Qty: ${item.quantity}, $${item.price.toFixed(2)}${item.store ? ', ' + item.store : ''}${item.notes ? ' | ' + item.notes : ''}`
    );

    const text = `ShopperPet Shopping List\n${'='.repeat(30)}\n\n${lines.join('\n')}\n`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('List downloaded!');
  } catch (err) {
    showToast('Failed to download list');
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
