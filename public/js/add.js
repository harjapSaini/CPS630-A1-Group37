document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("add-form");
  var errorEl = document.getElementById("form-error");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.style.display = "none";
    var body = {
      item: form.item.value.trim(), category: form.category.value,
      quantity: parseInt(form.quantity.value), price: parseFloat(form.price.value) || 0,
      store: form.store.value.trim(), addedBy: form.addedBy.value.trim(),
      priority: form.priority.value, notes: form.notes.value.trim()
    };
    if (!body.item || !body.category || !body.quantity) {
      errorEl.textContent = "Please fill in Item Name, Category, and Quantity.";
      errorEl.style.display = "block"; return;
    }
    fetch("/api/list", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (res) {
        if (res.ok) { window.location.href = "/list"; }
        else { res.json().then(function (err) { errorEl.textContent = err.error || "Failed to add item."; errorEl.style.display = "block"; }); }
      })
      .catch(function () { errorEl.textContent = "Network error. Please try again."; errorEl.style.display = "block"; });
  });
});
