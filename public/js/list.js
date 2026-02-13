document.addEventListener("DOMContentLoaded", function () {
  loadList();
  document.getElementById("download-btn").addEventListener("click", downloadList);
});

function loadList() {
  const container = document.getElementById("grocery-list");
  fetch("/api/list").then(function (res) { return res.json(); }).then(function (data) {
    if (data.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>Your list is empty. <a href="/add">Add some items!</a></p></div>';
      return;
    }
    let html = "";

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      const currentIndex = lifecycle.indexOf(item.status);
      const nextStatus = lifecycle[(currentIndex + 1) % lifecycle.length];

      const statusIcon = statusConfig[item.status]?.icon || "❓";
      const statusClass = statusConfig[item.status]?.class || "";
      const nextIcon = statusConfig[nextStatus]?.icon || "➡";

      const storeText = item.store ? " · " + item.store : "";
      html += '<div class="grocery-item ' + statusClass + '">' +
        '<div class="item-info"><a href="/item?id=' + item.id + '" class="item-name">' + item.item + '</a>' +
        '<div class="item-meta">' + item.category + ' · Qty: ' + item.quantity + ' · $' + item.price.toFixed(2) + storeText + '</div></div>' +
        '<span class="badge badge-' + item.priority.toLowerCase() + '">' + item.priority + '</span>' +
        '<span class="status-tag status-' + item.status.toLowerCase().replace(" ", "-") + '">' + statusIcon + ' ' + item.status + '</span>' +
        '<div class="item-actions">' +
        '<button class="btn btn-secondary btn-sm" onclick="toggleStatus(' + item.id + ",'" + nextStatus + "')\">" + nextIcon + '</button>' +
        '<button class="btn btn-danger btn-sm" onclick="deleteItem(' + item.id + ')">✕</button></div></div>';

    }
    container.innerHTML = html;
  }).catch(function () {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Could not load list.</p></div>';
  });
}

function toggleStatus(id, newStatus) {
  fetch("/api/list/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) })
    .then(function () { loadList(); showToast('Status updated to "' + newStatus + '"'); })
    .catch(function () { showToast("Failed to update status"); });
}

function deleteItem(id) {
  if (!confirm("Remove this item from the list?")) return;
  fetch("/api/list/" + id, { method: "DELETE" }).then(function (res) {
    if (res.ok) { loadList(); showToast("Item removed"); }
    else { showToast("Failed to remove item"); }
  }).catch(function () { showToast("Failed to remove item"); });
}

function downloadList() {
  fetch("/api/list").then(function (res) { return res.json(); }).then(function (data) {
    let lines = [];
    for (let i = 0; i < data.length; i++) {
      if ((data[i].status === "In Cart") || ((data[i].status === "Needed"))){
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
    a.href = url; a.download = "grocery-list.txt"; a.click();
    URL.revokeObjectURL(url);
    showToast("List downloaded!");
  }).catch(function () { showToast("Failed to download list"); });
}
