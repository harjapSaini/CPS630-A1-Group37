// ── Add Item Page Logic ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-form');
  const errorEl = document.getElementById('form-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';

    const body = {
      item: form.item.value.trim(),
      category: form.category.value,
      quantity: parseInt(form.quantity.value, 10),
      price: parseFloat(form.price.value) || 0,
      store: form.store.value.trim(),
      addedBy: form.addedBy.value.trim(),
      priority: form.priority.value,
      notes: form.notes.value.trim()
    };

    // Client-side validation
    if (!body.item || !body.category || !body.quantity) {
      errorEl.textContent = 'Please fill in Item Name, Category, and Quantity.';
      errorEl.style.display = 'block';
      return;
    }

    try {
      const res = await fetch('/api/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        window.location.href = '/list';
      } else {
        const err = await res.json();
        errorEl.textContent = err.error || 'Failed to add item.';
        errorEl.style.display = 'block';
      }
    } catch (err) {
      errorEl.textContent = 'Network error. Please try again.';
      errorEl.style.display = 'block';
    }
  });
});
