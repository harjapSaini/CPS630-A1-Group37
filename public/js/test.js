'<div class="card">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;"><div>' +
      '<h1 style="margin-bottom:0.25rem;">Edit ' + currentItem.item + '</h1>' +
      '</div></div>' +
      '<div class="detail-grid">' +
      '<span class="detail-label">Category</span><span class="detail-value">' + '<label>Quantity</label>' +
      '<input id="edit-quantity" type="number" value="' + currentItem.quantity + '">' + +'</span>' +
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


'<h1>Edit Item</h1>' +

      '<label>Quantity</label>' +
      '<input id="edit-quantity" type="number" value="' + currentItem.quantity + '">' +

      '<label>Price</label>' +
      '<input id="edit-price" type="number" step="0.01" value="' + currentItem.price + '">' +

      '<label>Store</label>' +
      '<input id="edit-store" type="text" value="' + (currentItem.store || "") + '">' +

      '<label>Notes</label>' +
      '<textarea id="edit-notes">' + (currentItem.notes || "") + '</textarea>' +

      '<div class="btn-group" style="margin-top:1rem;">' +
      '<button class="btn btn-success" onclick="saveChanges()">💾 Save</button>' +
      '<button class="btn btn-secondary" onclick="toggleEdit()">Cancel</button>' +
      '</div></div>';






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