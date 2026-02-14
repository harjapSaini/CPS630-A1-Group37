// shopping list page
document.addEventListener("DOMContentLoaded", function () {
  loadList();
  document.getElementById("download-btn").addEventListener("click", downloadList);
});

// returns the css class for a given status
function getStatusClass(status) {
  if (status === "Needed") return "status-needed";
  if (status === "In Cart") return "status-in-cart";
  if (status === "Purchased") return "status-purchased";
  if (status === "Consumed") return "status-consumed";
  return "";
}

// loads all items and builds the list
function loadList() {
  let container = document.getElementById("grocery-list");

  fetch("/api/list")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Your list is empty. <a href="/add">Add some items!</a></p></div>';
        return;
      }

      let html = "";
      let lifecycle = ["Needed", "In Cart", "Purchased", "Consumed"];

      // build each item row
      for (let i = 0; i < data.length; i++) {
        let item = data[i];

        // figure out the next status in the cycle
        let currentIndex = lifecycle.indexOf(item.status);
        let nextStatus = lifecycle[(currentIndex + 1) % lifecycle.length];
        let statusClass = getStatusClass(item.status);
        let storeText = item.store ? " · " + item.store : "";

        html += '<div class="grocery-item ' + statusClass + '">';
        html += '<div class="item-info">';
        html += '<a href="/item?id=' + item.id + '" class="item-name">' + item.item + '</a>';
        html += '<div class="item-meta">' + item.category + ' · Qty: ' + item.quantity + ' · $' + item.price.toFixed(2) + storeText + '</div>';
        html += '</div>';
        html += '<span class="badge badge-' + item.priority.toLowerCase() + '">' + item.priority + '</span>';
        html += '<span class="status-tag ' + statusClass + '" onclick="toggleStatus(' + item.id + ",'" + nextStatus + '\')" style="cursor:pointer;">' + item.status + '</span>';
        html += '<div class="item-actions">';
        html += '<button class="btn btn-secondary btn-sm" onclick="toggleStatus(' + item.id + ",'" + nextStatus + "')\"> " + nextStatus + '</button>';
        html += '<button class="btn btn-danger btn-sm" onclick="deleteItem(' + item.id + ')">Remove</button>';
        html += '</div></div>';
      }
      container.innerHTML = html;
    })
    .catch(function () {
      container.innerHTML = '<div class="empty-state"><p>Could not load list.</p></div>';
    });
}

// changes the status of an item to the next one
function toggleStatus(id, newStatus) {
  fetch("/api/list/" + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus })
  })
    .then(function () {
      showToast("Status changed to " + newStatus);
      loadList();
    })
    .catch(function () {
      alert("Failed to update status");
    });
}

// removes an item from the list
function deleteItem(id) {
  if (!confirm("Remove this item from the list?")) return;

  fetch("/api/list/" + id, { method: "DELETE" })
    .then(function (res) {
      if (res.ok) {
        showToast("Item removed");
        loadList();
      } else {
        alert("Failed to remove item");
      }
    })
    .catch(function () {
      alert("Failed to remove item");
    });
}

// downloads the shopping list as a text file
// only includes items that are needed or in cart
function downloadList() {
  fetch("/api/list")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      let lines = [];
      for (let i = 0; i < data.length; i++) {
        // only download needed or in-cart items
        if ((data[i].status === "In Cart") || ((data[i].status === "Needed"))) {
          let item = data[i];
          let line = (item.status === "In Cart" ? "[x]" : "[ ]") + " " + item.item + " (" + item.category + ") — Qty: " + item.quantity + ", $" + item.price.toFixed(2);
          if (item.store) line += ", " + item.store;
          if (item.notes) line += " | " + item.notes;
          lines.push(line);
        }
      }

      let text = "ShopperPet Shopping List\n============================\n[x] = In Cart\n[] = Not in Cart, so needed\n\n\n\n\n" + lines.join("\n") + "\n";
      let blob = new Blob([text], { type: "text/plain" });
      let url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = "grocery-list.txt";
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(function () {
      alert("Failed to download list");
    });
}