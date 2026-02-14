// add item page
document.addEventListener("DOMContentLoaded", initAddPage);

function initAddPage() {
  let form = document.getElementById("add-form");
  let errorEl = document.getElementById("form-error");

  form.addEventListener("submit", function (e) {
    handleSubmit(e, form, errorEl);
  });
}

// grab all the form values and put them in an object
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

// check that the required fields arent empty
function validateItem(body) {
  return body.item && body.category && body.quantity;
}

function handleSubmit(e, form, errorEl) {
  e.preventDefault();
  errorEl.style.display = "none";

  let body = buildRequestBody(form);

  // check required fields
  if (!validateItem(body)) {
    showFormError(errorEl, "Please fill in Item Name, Category, and Quantity.");
    return;
  }

  // send data to the server
  submitItem(body, errorEl);
}

// show an error message on the form
function showFormError(errorEl, msg) {
  errorEl.textContent = msg;
  errorEl.style.display = "block";
}

// send the new item to the api
function submitItem(body, errorEl) {
  fetch("/api/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
    .then(function (res) {
      if (res.ok) {
        window.location.href = "/list";
      } else {
        res.json().then(function (err) {
          showFormError(errorEl, err.error || "Failed to add item.");
        });
      }
    })
    .catch(function () {
      showFormError(errorEl, "Network error. Please try again.");
    });
}
