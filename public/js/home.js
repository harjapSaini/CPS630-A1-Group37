// home page - shows the 3 most recent items
document.addEventListener("DOMContentLoaded", function () {
  let container = document.getElementById("recent-items");

  // fetch all items from api
  fetch("/api/list")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      // sort newest first and grab top 3
      data.sort(function (a, b) {
        return b.id - a.id;
      });
      let recent = data.slice(0, 3);

      if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No items yet. <a href="/add">Add your first one!</a></p></div>';
        return;
      }

      // build the html for each item
      let html = "";
      for (let i = 0; i < recent.length; i++) {
        let item = recent[i];
        html += '<a href="/item?id=' + item.id + '" class="grocery-item" style="text-decoration:none;color:inherit;">';
        html += '<div class="item-info">';
        html += '<div class="item-name">' + item.item + '</div>';
        html += '<div class="item-meta">' + item.category + ' · Qty: ' + item.quantity + ' · $' + item.price.toFixed(2) + '</div>';
        html += '</div>';
        html += '<span class="badge badge-' + item.priority.toLowerCase() + '">' + item.priority + '</span>';
        html += '</a>';
      }
      container.innerHTML = html;
    })
    .catch(function () {
      container.innerHTML = '<div class="empty-state"><p>Could not load items.</p></div>';
    });
});
