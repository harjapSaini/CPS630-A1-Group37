document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("recent-items");
  fetch("/api/list").then(function (res) { return res.json(); }).then(function (data) {
    data.sort(function (a, b) { return b.id - a.id; });
    const recent = data.slice(0, 3);
    if (recent.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No items yet. <a href="/add">Add your first one!</a></p></div>';
      return;
    }
    let html = "";
    for (let i = 0; i < recent.length; i++) {
      let item = recent[i];
      html += '<a href="/item?id=' + item.id + '" class="grocery-item" style="text-decoration:none;color:inherit;">' +
        '<div class="item-info"><div class="item-name">' + item.item + '</div>' +
        '<div class="item-meta">' + item.category + ' · Qty: ' + item.quantity + ' · $' + item.price.toFixed(2) + '</div></div>' +
        '<span class="badge badge-' + item.priority.toLowerCase() + '">' + item.priority + '</span></a>';
    }
    container.innerHTML = html;
  }).catch(function () {
    container.innerHTML = '<div class="empty-state"><p>Could not load items.</p></div>';
  });
});
