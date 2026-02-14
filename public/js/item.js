// item detail page - shows one item and lets you edit/delete it
document.addEventListener("DOMContentLoaded", function () {

  let container = document.getElementById("item-detail");

  // get the item id from the url
  let id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    showNotFound(container);
    return;
  }

  let current_item = null;
  let isEditing = false;

  // fetch the item from the api
  fetch("/api/list/" + id)
    .then(function (res) {
      if (!res.ok) {
        showNotFound(container);
        return;
      }
      return res.json();
    })
    .then(function (item) {
      if (!item) return;
      current_item = item;
      document.title = "ShopperPet " + item.item;
      renderView();
    })
    .catch(function () {
      showNotFound(container);
    });

  // returns css class for item status
  function getStatusClass(status) {
    if (status === "Needed") return "status-needed";
    if (status === "In Cart") return "status-in-cart";
    if (status === "Purchased") return "status-purchased";
    if (status === "Consumed") return "status-consumed";
    return "";
  }

  // show the item details
  function renderView() {
    let statusClass = getStatusClass(current_item.status);

    let html = '';
    html += '<div class="card" style="margin-top:1rem;">';

    // item name and badges
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;"><div>';
    html += '<h1 style="margin-bottom:0.25rem;">' + current_item.item + '</h1>';
    html += '<span class="badge badge-' + current_item.priority.toLowerCase() + '">' + current_item.priority + ' Priority</span>';
    html += '<span class="status-tag ' + statusClass + '" style="margin-left:0.35rem;">' + current_item.status + '</span>';
    html += '</div></div>';

    // item details grid
    html += '<div class="detail-grid">';
    html += '<span class="detail-label">Category</span><span class="detail-value">' + current_item.category + '</span>';
    html += '<span class="detail-label">Quantity</span><span class="detail-value">' + current_item.quantity + '</span>';
    html += '<span class="detail-label">Price</span><span class="detail-value">$' + current_item.price.toFixed(2) + '</span>';
    html += '<span class="detail-label">Store</span><span class="detail-value">' + (current_item.store || "—") + '</span>';
    html += '<span class="detail-label">Added By</span><span class="detail-value">' + current_item.addedBy + '</span>';
    html += '<span class="detail-label">Date Added</span><span class="detail-value">' + current_item.dateAdded + '</span>';
    html += '<span class="detail-label">Notes</span><span class="detail-value">' + (current_item.notes || "—") + '</span>';
    html += '</div>';

    // buttons
    html += '<div class="btn-group" style="margin-top:1.25rem;">';
    html += '<button id="edit-btn" class="btn btn-secondary">Edit</button>';
    html += '<button id="delete-btn" class="btn btn-danger">Remove Item</button>';
    html += '<a href="/list" class="btn btn-secondary">Back to List</a>';
    html += '</div></div>';

    container.innerHTML = html;

    document.getElementById("edit-btn").addEventListener("click", toggleEdit);
    document.getElementById("delete-btn").addEventListener("click", function () {
      deleteItem(current_item.id);
    });
  }

  // show the edit form
  function renderEdit() {
    let statusClass = getStatusClass(current_item.status);

    let html = '';
    html += '<form id="edit-form" class="card">';
    html += '<h1>Edit ' + current_item.item + '</h1>';

    // edit fields
    html += '<div class="detail-grid">';

    // category dropdown
    html += '<span class="detail-label">Category</span>';
    html += '<select id="edit-category" required>';
    let categories = ["Produce", "Dairy", "Meat", "Bakery", "Frozen", "Beverages", "Snacks", "Household", "Other"];
    for (let i = 0; i < categories.length; i++) {
      let selected = (current_item.category === categories[i]) ? " selected" : "";
      html += '<option value="' + categories[i] + '"' + selected + '>' + categories[i] + '</option>';
    }
    html += '</select>';

    html += '<span class="detail-label">Quantity</span>';
    html += '<input id="edit-quantity" type="number" min="1" required value="' + current_item.quantity + '">';
    html += '<span class="detail-label">Price</span>';
    html += '<input id="edit-price" type="number" step="0.01" min="0.01" required value="' + current_item.price + '">';
    html += '<span class="detail-label">Store</span>';
    html += '<input id="edit-store" type="text" value="' + (current_item.store || "") + '">';
    html += '<span class="detail-label">Added By</span>';
    html += '<input id="edit-addedBy" type="text" value="' + current_item.addedBy + '">';
    html += '<span class="detail-label">Notes</span>';
    html += '<textarea id="edit-notes">' + (current_item.notes || "") + '</textarea>';
    html += '</div>';

    // save and cancel buttons
    html += '<div class="btn-group" style="margin-top:1.25rem;">';
    html += '<button type="submit" class="btn btn-primary">Save</button>';
    html += '<button type="button" id="cancel-btn" class="btn btn-secondary">Cancel</button>';
    html += '<a href="/list" class="btn btn-secondary">Back to List</a>';
    html += '</div></form>';

    container.innerHTML = html;

    document.getElementById("edit-form").addEventListener("submit", function (e) {
      e.preventDefault();
      saveChanges();
    });
    document.getElementById("cancel-btn").addEventListener("click", toggleEdit);
  }

  // switch between view and edit mode
  function toggleEdit() {
    isEditing = !isEditing;
    if (isEditing) {
      renderEdit();
    } else {
      renderView();
    }
  }

  // save the edited fields to the server
  function saveChanges() {
    let updatedData = {
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

// shows a 404 message if the item doesnt exist
function showNotFound(c) {
  c.innerHTML = '<div class="error-page"><h1>404</h1><p>Item not found.</p><a href="/list" class="btn btn-primary">Back to List</a></div>';
}

// deletes an item after confirmation
function deleteItem(id) {
  if (!confirm("Remove this item from the list?")) return;

  fetch("/api/list/" + id, { method: "DELETE" })
    .then(function (res) {
      if (res.ok) {
        window.location.href = "/list";
      } else {
        alert("Failed to remove item");
      }
    })
    .catch(function () {
      alert("Failed to remove item");
    });
}
