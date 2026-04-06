import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { lifecycle, categories } from "../constants";

// add item page - form to create a new grocery item
function Add() {
  let navigate = useNavigate();
  let [formError, setFormError] = useState("");

  // form state
  let [item, setItem] = useState("");
  let [category, setCategory] = useState("");
  let [quantity, setQuantity] = useState(1);
  let [price, setPrice] = useState("");
  let [store, setStore] = useState("");
  let [addedBy, setAddedBy] = useState("");
  let [priority, setPriority] = useState("Medium");
  let [notes, setNotes] = useState("");
  let [users, setUsers] = useState([]);

  useEffect(function () {
  fetch("/api/users")
    .then(function (res) 
    { 
      return res.json(); 
    })
    .then(function (data) 
    {
      setUsers(data);

      let currentUserId = localStorage.getItem("shopperpet_id");

      if (!addedBy && data.length > 0) {
        if (currentUserId) {
          setAddedBy(currentUserId);
        } else {
          setAddedBy(data[0]._id); // Fallback to first user's ID
        }
      }
    })
    .catch(function () 
    {
      console.log("Failed to load users");
    });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    // check required fields
    if (!item.trim() || !category || !quantity) {
      setFormError("Please fill in Item Name, Category, and Quantity.");
      return;
    }

    let body = {
      item: item.trim(),
      category: category,
      quantity: parseInt(quantity),
      price: parseFloat(price) || 0,
      store: store.trim(),
      addedBy: addedBy,
      priority: priority,
      notes: notes.trim(),
      status: lifecycle[0]
    };

    fetch("/api/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        if (res.ok) {
          navigate("/list");
        } else {
          res.json().then(function (err) {
            setFormError(err.error || "Failed to add item.");
          });
        }
      })
      .catch(function () {
        setFormError("Network error. Please try again.");
      });
  }

  return (
    <main className="container">
      <h1>Add New Item</h1>
      <p className="subtitle">Fill in the details to add a grocery item to your list.</p>
      <form className="card" style={{ marginTop: "0.5rem" }} onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="item">Item Name *</label>
            <input type="text" id="item" placeholder="e.g. Apples" required value={item} onChange={function (e) { setItem(e.target.value); }} />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select id="category" required value={category} onChange={function (e) { setCategory(e.target.value); }}>
              <option value="">Select...</option>
              {categories.map(function (cat) {
                return <option key={cat} value={cat}>{cat}</option>;
              })}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input type="number" id="quantity" min="1" required value={quantity} onChange={function (e) { setQuantity(e.target.value); }} />
          </div>
          <div className="form-group">
            <label htmlFor="price">Estimated Price ($)</label>
            <input type="number" id="price" step="0.01" min="0.01" placeholder="0.01" value={price} onChange={function (e) { setPrice(e.target.value); }} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="store">Store</label>
            <input type="text" id="store" placeholder="e.g. Walmart" value={store} onChange={function (e) { setStore(e.target.value); }} />
          </div>
          <div className="form-group">
            <label htmlFor="addedBy">Added By</label>
           <select
            id="addedBy"
            value={addedBy}
            onChange={function (e) { setAddedBy(e.target.value); }}
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
        </div>
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select id="priority" value={priority} onChange={function (e) { setPriority(e.target.value); }}>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" placeholder="e.g. Get the one with less salt..." value={notes} onChange={function (e) { setNotes(e.target.value); }}></textarea>
        </div>
        {formError && (
          <div style={{ color: "crimson", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{formError}</div>
        )}
        <div className="btn-group">
          <button type="submit" className="btn btn-primary">Add to List</button>
          <Link to="/" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </main>
  );
}

export default Add;
