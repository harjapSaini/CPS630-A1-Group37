import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { statusConfig, categories } from "../constants";

// item detail page - shows one item and lets you edit/delete it
function Item() {
  let { id } = useParams();
  let navigate = useNavigate();
  let [item, setItem] = useState(null);
  let [notFound, setNotFound] = useState(false);
  let [isEditing, setIsEditing] = useState(false);
  let [users, setUsers] = useState([]);

  // edit form state
  let [editCategory, setEditCategory] = useState("");
  let [editQuantity, setEditQuantity] = useState("");
  let [editPrice, setEditPrice] = useState("");
  let [editStore, setEditStore] = useState("");
  let [editAddedBy, setEditAddedBy] = useState("");
  let [editNotes, setEditNotes] = useState("");

  useEffect(function () {
    fetch("/api/list/" + id)
      .then(function (res) {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        if (data) {
          setItem(data);
          document.title = "ShopperPet " + data.item;
        }
      })
      .catch(function () {
        setNotFound(true);
      });
  }, [id]);

  // Fetch all users in our DB for the drop-down
  useEffect(function () {
    fetch("/api/users")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        setUsers(data);
      })
      .catch(function () {
        console.log("Failed to load users");
      });
  }, []);

  // returns css class for item status
  function getStatusClass(status) {
    if (statusConfig[status]) return statusConfig[status].class;
    return "";
  }

  // populate edit form when switching to edit mode
  function startEdit() {
    setEditCategory(item.category);
    setEditQuantity(item.quantity);
    setEditPrice(item.price);
    setEditStore(item.store || "");
    setEditNotes(item.notes || "");
    setIsEditing(true);

    // the piece of code below ensure the addedby field pre-select the original user who added it.
    let matchedId = item.addedBy;
    for (let i = 0; i < users.length; i++) {
      if (users[i].name === item.addedBy || users[i]._id === item.addedBy) {
        matchedId = users[i]._id;
        break;
      }
    }
    setEditAddedBy(matchedId);
  }

  // save the edited fields to the server
  function saveChanges(e) {
    e.preventDefault();

    let updatedData = {
      category: editCategory,
      quantity: Number(editQuantity),
      price: Number(editPrice),
      store: editStore.trim(),
      addedBy: editAddedBy.trim(),
      notes: editNotes.trim()
    };

    fetch("/api/list/" + item.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    })
      .then(function (res) {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(function (updated) {
        setItem(updated);
        setIsEditing(false);
      })
      .catch(function () {
        alert("Failed to update item");
      });
  }

  // deletes an item after confirmation
  function deleteItem() {
    if (!confirm("Remove this item from the list?")) return;

    fetch("/api/list/" + item.id, { method: "DELETE" })
      .then(function (res) {
        if (res.ok) {
          navigate("/list");
        } else {
          alert("Failed to remove item");
        }
      })
      .catch(function () {
        alert("Failed to remove item");
      });
  }

  // 404 state
  if (notFound) {
    return (
      <main className="container">
        <div className="error-page">
          <h1>404</h1>
          <p>Item not found.</p>
          <Link to="/list" className="btn btn-primary">Back to List</Link>
        </div>
      </main>
    );
  }

  // loading state
  if (!item) {
    return (
      <main className="container">
        <div className="empty-state"><p>Loading...</p></div>
      </main>
    );
  }

  // edit mode
  if (isEditing) {
    return (
      <main className="container">
        <form className="card" onSubmit={saveChanges}>
          <h1>Edit {item.item}</h1>
          <div className="detail-grid">
            <span className="detail-label">Category</span>
            <select id="edit-category" required value={editCategory} onChange={function (e) { setEditCategory(e.target.value); }}>
              {categories.map(function (cat) {
                return <option key={cat} value={cat}>{cat}</option>;
              })}
            </select>

            <span className="detail-label">Quantity</span>
            <input id="edit-quantity" type="number" min="1" required value={editQuantity} onChange={function (e) { setEditQuantity(e.target.value); }} />

            <span className="detail-label">Price</span>
            <input id="edit-price" type="number" step="0.01" min="0.01" required value={editPrice} onChange={function (e) { setEditPrice(e.target.value); }} />

            <span className="detail-label">Store</span>
            <input id="edit-store" type="text" value={editStore} onChange={function (e) { setEditStore(e.target.value); }} />

            <span className="detail-label">Added By</span>
            <select
              id="edit-addedBy"
              value={editAddedBy}
              onChange={function (e) { setEditAddedBy(e.target.value); }}
            >
              <option value="">Select...</option>
              {users.map(function (u) {
                return (
                  <option key={u._id} value={u._id}>
                    {u.name} (@{u.username})
                  </option>
                );
              })}
            </select>

            <span className="detail-label">Notes</span>
            <textarea id="edit-notes" value={editNotes} onChange={function (e) { setEditNotes(e.target.value); }}></textarea>
          </div>
          <div className="btn-group" style={{ marginTop: "1.25rem" }}>
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={function () { setIsEditing(false); }}>Cancel</button>
            <Link to="/list" className="btn btn-secondary">Back to List</Link>
          </div>
        </form>
      </main>
    );
  }

  // view mode
  let statusClass = getStatusClass(item.status);

  let displayAddedByName = item.addedBy;
  for (let i = 0; i < users.length; i++) {
    if (users[i]._id === item.addedBy || users[i].name === item.addedBy) {
      displayAddedByName = users[i].name;
      break;
    }
  }

  return (
    <main className="container">
      <div className="card" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h1 style={{ marginBottom: "0.25rem" }}>{item.item}</h1>
            <span className={"badge badge-" + item.priority.toLowerCase()}>{item.priority} Priority</span>
            <span className={"status-tag " + statusClass} style={{ marginLeft: "0.35rem" }}>{item.status}</span>
          </div>
        </div>
        <div className="detail-grid">
          <span className="detail-label">Category</span><span className="detail-value">{item.category}</span>
          <span className="detail-label">Quantity</span><span className="detail-value">{item.quantity}</span>
          <span className="detail-label">Price</span><span className="detail-value">${item.price.toFixed(2)}</span>
          <span className="detail-label">Store</span><span className="detail-value">{item.store || "-"}</span>
          <span className="detail-label">Added By</span><span className="detail-value">{displayAddedByName}</span>          <span className="detail-label">Date Added</span><span className="detail-value">{item.dateAdded}</span>
          <span className="detail-label">Notes</span><span className="detail-value">{item.notes || "-"}</span>
        </div>
        <div className="btn-group" style={{ marginTop: "1.25rem" }}>
          <button id="edit-btn" className="btn btn-secondary" onClick={startEdit}>Edit</button>
          <button id="delete-btn" className="btn btn-danger" onClick={deleteItem}>Remove Item</button>
          <Link to="/list" className="btn btn-secondary">Back to List</Link>
        </div>
      </div>
    </main>
  );
}

export default Item;
