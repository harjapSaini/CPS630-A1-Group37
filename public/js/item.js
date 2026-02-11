// ── Item Detail Page Logic ──────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('item-detail');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showNotFound(container);
    return;
  }

  try {
    const res = await fetch(`/api/list/${id}`);

    if (!res.ok) {
      showNotFound(container);
      return;
    }

    const item = await res.json();

    document.title = `ShopperPet — ${item.item}`;

    container.innerHTML = `
      <div style="margin-bottom:1rem;">
        <a href="/list" style="color:var(--accent);text-decoration:none;font-size:0.9rem;">← Back to List</a>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
          <div>
            <h1 style="margin-bottom:0.25rem;">${escapeHtml(item.item)}</h1>
            <span class="badge badge-${item.priority.toLowerCase()}">${item.priority} Priority</span>
            <span class="status-tag status-${item.status.toLowerCase().replace(' ', '-')}" style="margin-left:0.35rem;">
              ${item.status === 'Pending' ? '⬜' : item.status === 'In Cart' ? '🛒' : '✅'} ${item.status}
            </span>
          </div>
        </div>

        <div class="detail-grid">
          <span class="detail-label">Category</span>
          <span class="detail-value">${escapeHtml(item.category)}</span>

          <span class="detail-label">Quantity</span>
          <span class="detail-value">${item.quantity}</span>

          <span class="detail-label">Price</span>
          <span class="detail-value">$${item.price.toFixed(2)}</span>

          <span class="detail-label">Store</span>
          <span class="detail-value">${escapeHtml(item.store) || '—'}</span>

          <span class="detail-label">Added By</span>
          <span class="detail-value">${escapeHtml(item.addedBy)}</span>

          <span class="detail-label">Date Added</span>
          <span class="detail-value">${item.dateAdded}</span>

          <span class="detail-label">Notes</span>
          <span class="detail-value">${escapeHtml(item.notes) || '—'}</span>
        </div>

        <div class="btn-group" style="margin-top:1.25rem;">
          <a href="/list" class="btn btn-secondary">← Back to List</a>
          <button class="btn btn-danger" onclick="deleteItem(${item.id})">🗑 Remove Item</button>
        </div>
      </div>
    `;

  } catch (err) {
    showNotFound(container);
  }
});

function showNotFound(container) {
  container.innerHTML = `
    <div class="error-page">
      <h1>404</h1>
      <p>Item not found.</p>
      <a href="/list" class="btn btn-primary">← Back to List</a>
    </div>`;
}

async function deleteItem(id) {
  if (!confirm('Remove this item from the list?')) return;

  try {
    const res = await fetch(`/api/list/${id}`, { method: 'DELETE' });
    if (res.ok) {
      window.location.href = '/list';
    } else {
      showToast('Failed to remove item');
    }
  } catch (err) {
    showToast('Failed to remove item');
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
  div.textContent = text || '';
  return div.innerHTML;
}
