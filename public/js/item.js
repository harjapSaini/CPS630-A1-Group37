document.addEventListener("DOMContentLoaded", function () {

  const container = document.getElementById("item-detail");
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) { showNotFound(container); return; }

  let current_item = null;
  let isEditing = false;

  fetch("/api/list/" + id)
    .then(function (res) {
      if (!res.ok) { showNotFound(container); return; }
      return res.json();
    })
    .then(function (item) {
      if (!item) return;
      current_item = item;
      document.title = "ShopperPet — " + item.item;
      renderView();
    })
    .catch(function () {
      showNotFound(container);
    });

  function getStatusClass(status) {
    if (status === "Needed") return "status-needed";
    if (status === "In Cart") return "status-in-cart";
    if (status === "Purchased") return "status-purchased";
    if (status === "Consumed") return "status-consumed";
    return "";
  }

  // ================= VIEW =================

  function renderView() {

    const statusClass = getStatusClass(current_item.status);

    container.innerHTML =
      '<div style="margin-bottom:1rem;"><a href="/list" style="color:teal;text-decoration:none;font-size:0.9rem;">Back to List</a></div>' +
      '<div class="card">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;"><div>' +
      '<h1 style="margin-bottom:0.25rem;">' + current_item.item + '</h1>' +
      '<span class="badge badge-' + current_item.priority.toLowerCase() + '">' + current_item.priority + ' Priority</span>' +
      '<span class="status-tag ' + statusClass + '" style="margin-left:0.35rem;">' + current_item.status + '</span>' +
      '</div></div>' +
      '<div class="detail-grid">' +
      '<span class="detail-label">Category</span><span class="detail-value">' + current_item.category + '</span>' +
      '<span class="detail-label">Quantity</span><span class="detail-value">' + current_item.quantity + '</span>' +
      '<span class="detail-label">Price</span><span class="detail-value">$' + current_item.price.toFixed(2) + '</span>' +
      '<span class="detail-label">Store</span><span class="detail-value">' + (current_item.store || "—") + '</span>' +
      '<span class="detail-label">Added By</span><span class="detail-value">' + current_item.addedBy + '</span>' +
      '<span class="detail-label">Date Added</span><span class="detail-value">' + current_item.dateAdded + '</span>' +
      '<span class="detail-label">Notes</span><span class="detail-value">' + (current_item.notes || "—") + '</span>' +
      '</div>' +
      '<div class="btn-group" style="margin-top:1.25rem;">' +
      '<button id="edit-btn" class="btn btn-secondary">Edit</button>' +
      '<button id="delete-btn" class="btn btn-danger">Remove Item</button>' +
      '</div></div>';

    document.getElementById("edit-btn").addEventListener("click", toggleEdit);
    document.getElementById("delete-btn").addEventListener("click", function () {
      deleteItem(current_item.id);
    });
  }

  // ================= EDIT =================

  function renderEdit() {

    const statusClass = getStatusClass(current_item.status);

    container.innerHTML =
      '<div style="margin-bottom:1rem;"><a href="/list" style="color:teal;text-decoration:none;font-size:0.9rem;">Back to List</a></div>' +
      '<form id="edit-form" class="card">' +
      '<h1>Edit ' + current_item.item + '</h1>' +
      '<div class="detail-grid">' +
      '<span class="detail-label">Category</span>' +
      '<select id="edit-category" required>' +
      '<option value="Produce" ' + (current_item.category === "Produce" ? "selected" : "") + '>Produce</option>' +
      '<option value="Dairy" ' + (current_item.category === "Dairy" ? "selected" : "") + '>Dairy</option>' +
      '<option value="Meat" ' + (current_item.category === "Meat" ? "selected" : "") + '>Meat</option>' +
      '<option value="Bakery" ' + (current_item.category === "Bakery" ? "selected" : "") + '>Bakery</option>' +
      '<option value="Frozen" ' + (current_item.category === "Frozen" ? "selected" : "") + '>Frozen</option>' +
      '<option value="Beverages" ' + (current_item.category === "Beverages" ? "selected" : "") + '>Beverages</option>' +
      '<option value="Snacks" ' + (current_item.category === "Snacks" ? "selected" : "") + '>Snacks</option>' +
      '<option value="Household" ' + (current_item.category === "Household" ? "selected" : "") + '>Household</option>' +
      '<option value="Other" ' + (current_item.category === "Other" ? "selected" : "") + '>Other</option>' +
      '</select>' +
      '<span class="detail-label">Quantity</span>' +
      '<input id="edit-quantity" type="number" min="1" required value="' + current_item.quantity + '">' +
      '<span class="detail-label">Price</span>' +
      '<input id="edit-price" type="number" step="0.01" min="0.01" required value="' + current_item.price + '">' +
      '<span class="detail-label">Store</span>' +
      '<input id="edit-store" type="text" value="' + (current_item.store || "") + '">' +
      '<span class="detail-label">Added By</span>' +
      '<input id="edit-addedBy" type="text" value="' + current_item.addedBy + '">' +
      '<span class="detail-label">Notes</span>' +
      '<textarea id="edit-notes">' + (current_item.notes || "") + '</textarea>' +
      '</div>' +
      '<div class="btn-group" style="margin-top:1.25rem;">' +
      '<button type="submit" class="btn btn-primary">Save</button>' +
      '<button type="button" id="cancel-btn" class="btn btn-secondary">Cancel</button>' +
      '</div></form>';

    document.getElementById("edit-form").addEventListener("submit", function (e) {
      e.preventDefault();
      saveChanges();
    });

    document.getElementById("cancel-btn").addEventListener("click", toggleEdit);
  }

  function toggleEdit() {
    isEditing = !isEditing;
    if (isEditing) renderEdit();
    else renderView();
  }

  function saveChanges() {

    const updatedData = {
      category: document.getElementById("edit-category").value,
      quantity: Number(document.getElementById("edit-quantity").value),
      price: Number(document.getElementById("edit-price").value),
      store: document.getElementById("edit-store").value.trim(),
      addedBy: document.getElementById("edit-addedBy").value.trim(),
      notes: document.getElementById("edit-notes").value.trim()
    };

    fetch("/api/list/" + current_item.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    })
      .then(function (res) {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(function (updated) {
        current_item = updated;
        isEditing = false;
        renderView();
      })
      .catch(function () {
        alert("Failed to update item");
      });
  }

});

function showNotFound(c) {
  c.innerHTML = '<div class="error-page"><h1>404</h1><p>Item not found.</p><a href="/list" class="btn btn-primary">Back to List</a></div>';
}

function deleteItem(id) {
  if (!confirm("Remove this item from the list?")) return;
  fetch("/api/list/" + id, { method: "DELETE" })
    .then(function (res) {
      if (res.ok) window.location.href = "/list";
      else alert("Failed to remove item");
    })
    .catch(function () {
      alert("Failed to remove item");
    });
}
