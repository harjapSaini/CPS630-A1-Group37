document.addEventListener("DOMContentLoaded", function () {
  var container = document.getElementById("item-detail");
  var id = new URLSearchParams(window.location.search).get("id");
  if (!id) { showNotFound(container); return; }

  fetch("/api/list/" + id).then(function (res) {
    if (!res.ok) { showNotFound(container); return; }
    return res.json();
  }).then(function (item) {
    if (!item) return;
    document.title = "ShopperPet — " + item.item;
    var statusIcon = item.status === "In Cart" ? "🛒" : item.status === "Purchased" ? "✅" : "⬜";
    container.innerHTML =
      '<div style="margin-bottom:1rem;"><a href="/list" style="color:var(--accent);text-decoration:none;font-size:0.9rem;">← Back to List</a></div>' +
      '<div class="card">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;"><div>' +
      '<h1 style="margin-bottom:0.25rem;">' + item.item + '</h1>' +
      '<span class="badge badge-' + item.priority.toLowerCase() + '">' + item.priority + ' Priority</span>' +
      '<span class="status-tag status-' + item.status.toLowerCase().replace(" ", "-") + '" style="margin-left:0.35rem;">' + statusIcon + ' ' + item.status + '</span>' +
      '</div></div>' +
      '<div class="detail-grid">' +
      '<span class="detail-label">Category</span><span class="detail-value">' + item.category + '</span>' +
      '<span class="detail-label">Quantity</span><span class="detail-value">' + item.quantity + '</span>' +
      '<span class="detail-label">Price</span><span class="detail-value">$' + item.price.toFixed(2) + '</span>' +
      '<span class="detail-label">Store</span><span class="detail-value">' + (item.store || "—") + '</span>' +
      '<span class="detail-label">Added By</span><span class="detail-value">' + item.addedBy + '</span>' +
      '<span class="detail-label">Date Added</span><span class="detail-value">' + item.dateAdded + '</span>' +
      '<span class="detail-label">Notes</span><span class="detail-value">' + (item.notes || "—") + '</span>' +
      '</div>' +
      '<div class="btn-group" style="margin-top:1.25rem;">' +
      '<a href="/list" class="btn btn-secondary">← Back to List</a>' +
      '<button class="btn btn-danger" onclick="deleteItem(' + item.id + ')">🗑 Remove Item</button></div></div>';
  }).catch(function () { showNotFound(container); });
});

function showNotFound(c) {
  c.innerHTML = '<div class="error-page"><h1>404</h1><p>Item not found.</p><a href="/list" class="btn btn-primary">← Back to List</a></div>';
}

function deleteItem(id) {
  if (!confirm("Remove this item from the list?")) return;
  fetch("/api/list/" + id, { method: "DELETE" }).then(function (res) {
    if (res.ok) window.location.href = "/list";
    else showToast("Failed to remove item");
  }).catch(function () { showToast("Failed to remove item"); });
}

function showToast(msg) {
  var t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(function () { t.classList.remove("show"); }, 2500);
}
