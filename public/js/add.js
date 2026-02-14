document.addEventListener("DOMContentLoaded", initAddPage);

function initAddPage() {
  const form = document.getElementById("add-form");
  const errorEl = document.getElementById("form-error");

  form.addEventListener("submit", (e) => handleSubmit(e, form, errorEl));
}

function buildRequestBody(form) {
  return {
    item: form.item.value.trim(),
    category: form.category.value,
    quantity: parseInt(form.quantity.value),
    price: parseFloat(form.price.value) || 0,
    store: form.store.value.trim(),
    addedBy: form.addedBy.value.trim(),
    priority: form.priority.value,
    notes: form.notes.value.trim(),
    status: lifecycle[0] // always start as "Needed"
  };
}

function validateItem(body) {
  return body.item && body.category && body.quantity;
}

function handleSubmit(e, form, errorEl) {
  e.preventDefault();
  errorEl.style.display = "none";

  const body = buildRequestBody(form);

  if (!validateItem(body)) {
    showFormError(errorEl, "Please fill in Item Name, Category, and Quantity.");
    return;
  }

  submitItem(body, errorEl);
}

// Network layer
function submitItem(body, errorEl) {
  fetch("/api/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
    .then(res => {
      if (res.ok) window.location.href = "/list";
      else res.json().then(err =>
        showFormError(errorEl, err.error || "Failed to add item.")
      );
    })
    .catch(() =>
      showFormError(errorEl, "Network error. Please try again.")
    );
}

