document.addEventListener("DOMContentLoaded", function () {

  const container = document.getElementById("item-detail");
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) { showNotFound(container); return; }

  let currentItem = null;
  let isEditing = false;

  fetch("/api/list/" + id)
    .then(function (res) {
      if (!res.ok) { showNotFound(container); return; }
      return res.json();
    })
    .then(function (item) {
      if (!item) return;
      currentItem = item;
      document.title = "ShopperPet — " + item.item;
      renderView();
    })
    .catch(function () {
      showNotFound(container);
    });

  function renderView() {

    const statusIcon = statusConfig[currentItem.status]?.icon || "❓";
    const statusClass = statusConfig[currentItem.status]?.class || "";

    container.innerHTML =
      '<div style="margin-bottom:1rem;"><a href="/list" style="color:var(--accent);text-decoration:none;font-size:0.9rem;">← Back to List</a></div>' +
      '<div class="card">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;"><div>' +
      '<h1 style="margin-bottom:0.25rem;">' + currentItem.item + '</h1>' +
      '<span class="badge badge-' + currentItem.priority.toLowerCase() + '">' + currentItem.priority + ' Priority</span>' +
      '<span class="status-tag ' + statusClass + '" style="margin-left:0.35rem;">' + statusIcon + ' ' + currentItem.status + '</span>' +
      '</div></div>' +
      '<div class="detail-grid">' +
      '<span class="detail-label">Category</span><span class="detail-value">' + currentItem.category + '</span>' +
      '<span class="detail-label">Quantity</span><span class="detail-value">' + currentItem.quantity + '</span>' +
      '<span class="detail-label">Price</span><span class="detail-value">$' + currentItem.price.toFixed(2) + '</span>' +
      '<span class="detail-label">Store</span><span class="detail-value">' + (currentItem.store || "—") + '</span>' +
      '<span class="detail-label">Added By</span><span class="detail-value">' + currentItem.addedBy + '</span>' +
      '<span class="detail-label">Date Added</span><span class="detail-value">' + currentItem.dateAdded + '</span>' +
      '<span class="detail-label">Notes</span><span class="detail-value">' + (currentItem.notes || "—") + '</span>' +
      '</div>' +
      '<div class="btn-group" style="margin-top:1.25rem;">' +
      '<button class="btn btn-secondary" onclick="toggleEdit()">✏️ Edit</button>' +
      '<button class="btn btn-danger" onclick="deleteItem(' + currentItem.id + ')">🗑 Remove Item</button>' +
      '</div></div>';
  }

  function renderEdit() {

    const statusIcon = statusConfig[currentItem.status]?.icon || "❓";
    const statusClass = statusConfig[currentItem.status]?.class || "";

    container.innerHTML =
      '<div style="margin-bottom:1rem;"><a href="/list" style="color:var(--accent);text-decoration:none;font-size:0.9rem;">← Back to List</a></div>' +
      '<div class="card">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;"><div>' +
      '<h1>Edit ' + currentItem.item + '</h1>' +
      '<span class="badge badge-' + currentItem.priority.toLowerCase() + '">' + currentItem.priority + ' Priority</span>' +
      '<span class="status-tag ' + statusClass + '" style="margin-left:0.35rem;">' + statusIcon + ' ' + currentItem.status + '</span>' +
      '</div></div>' +
      '<div class="detail-grid">' +
      '<span class="detail-label">Category</span>' +
      '<select id="edit-category">' +
      '<option value="Produce" ' + (currentItem.category === "Produce" ? "selected" : "") + '>Produce</option>' +
      '<option value="Dairy" ' + (currentItem.category === "Dairy" ? "selected" : "") + '>Dairy</option>' +
      '<option value="Meat" ' + (currentItem.category === "Meat" ? "selected" : "") + '>Meat</option>' +
      '<option value="Bakery" ' + (currentItem.category === "Bakery" ? "selected" : "") + '>Bakery</option>' +
      '<option value="Frozen" ' + (currentItem.category === "Frozen" ? "selected" : "") + '>Frozen</option>' +
      '<option value="Beverages" ' + (currentItem.category === "Beverages" ? "selected" : "") + '>Beverages</option>' +
      '<option value="Snacks" ' + (currentItem.category === "Snacks" ? "selected" : "") + '>Snacks</option>' +
      '<option value="Household" ' + (currentItem.category === "Household" ? "selected" : "") + '>Household</option>' +
      '<option value="Other" ' + (currentItem.category === "Other" ? "selected" : "") + '>Other</option>' +
      '</select>' +
      '<span class="detail-label">Quantity</span>' + '<input id="edit-quantity" type="number" value="' + currentItem.quantity + '">' +
      '<span class="detail-label">Price</span>' + '<input id="edit-price" type="number" value="' + currentItem.price + '">' +
      '<span class="detail-label">Store</span>' + '<input id="edit-store" type="text" value="' + currentItem.store + '">' +
      '<span class="detail-label">Added By</span>' + '<input id="edit-addedBy" type="text" value="' + currentItem.addedBy + '">' +
      '<span class="detail-label">Notes</span>' + '<textarea id="edit-notes">' + (currentItem.notes || "") + '</textarea>' +
      '</div>' +
      '<div class="btn-group" style="margin-top:1.25rem;">' +
      '<button class="btn btn-primary" onclick="saveChanges()">💾 Save</button>' +
      '<button class="btn btn-secondary" onclick="toggleEdit()">Cancel</button>' +
      '</div></div></div>';
  }

  window.toggleEdit = function () {
    isEditing = !isEditing;
    if (isEditing) renderEdit();
    else renderView();
  };

  window.saveChanges = function () {

    const updatedData = {
      category: document.getElementById("edit-category").value,
      quantity: Number(document.getElementById("edit-quantity").value),
      price: Number(document.getElementById("edit-price").value),
      store: document.getElementById("edit-store").value.trim(),
      addedBy: document.getElementById("edit-addedBy").value.trim(),
      notes: document.getElementById("edit-notes").value.trim()
    };

    fetch("/api/list/" + currentItem.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    })
      .then(function (res) {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(function (updated) {
        currentItem = updated;
        isEditing = false;
        renderView();
        showToast("Item updated successfully");
      })
      .catch(function () {
        showToast("Failed to update item");
      });
  };

});

function showNotFound(c) {
  c.innerHTML = '<div class="error-page"><h1>404</h1><p>Item not found.</p><a href="/list" class="btn btn-primary">← Back to List</a></div>';
}

function deleteItem(id) {
  if (!confirm("Remove this item from the list?")) return;
  fetch("/api/list/" + id, { method: "DELETE" })
    .then(function (res) {
      if (res.ok) window.location.href = "/list";
      else showToast("Failed to remove item");
    })
    .catch(function () {
      showToast("Failed to remove item");
    });
}
