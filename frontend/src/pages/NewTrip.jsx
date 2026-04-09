import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Toast, useToast } from "../components/Toast";
import { categories } from "../constants";

function NewTrip() {
  let navigate = useNavigate();
  let location = useLocation();
  let [toastProps, showToast] = useToast();

  let state = location.state || {};

  let [name, setName] = useState(state.templateName || "");
  let [store, setStore] = useState(state.templateStore || "");
  let [plannedDate, setPlannedDate] = useState("");
  let [budget, setBudget] = useState(state.templateBudget || "");
  
  let [users, setUsers] = useState([]);
  let [items, setItems] = useState([]);
  
  let [selectedUsers, setSelectedUsers] = useState(state.templateUsers || []);
  let [selectedItems, setSelectedItems] = useState([]);

  let [formMessage, setFormMessage] = useState({ text: "", type: "" });

  useEffect(function () {
    let token = localStorage.getItem("shopperpet_token");
    let currentUserId = localStorage.getItem("shopperpet_id");
    
    // Load both users and grocery items at the same time
    Promise.all([
      fetch("/api/users", { headers: { "Authorization": "Bearer " + token } }).then(res => res.json()),
      fetch("/api/list", { headers: { "Authorization": "Bearer " + token } }).then(res => res.json())
    ])
    .then(function (results) {
      let usersData = results[0] || [];
      let itemsData = results[1] || [];
      
      setUsers(usersData);
      
      // only show needed items
      setItems(itemsData.filter(function(i) { return i.status === "Needed"; }));
      
      // pre-select current user
      if (currentUserId && usersData.some(function(u) { return String(u.userId) === currentUserId; })) {
        setSelectedUsers([currentUserId]);
      }
    })
    .catch(function () {
      setFormMessage({ text: "Failed to load data.", type: "error" });
    });
  }, []);

  function toggleUser(userId) {
    let idStr = String(userId);
    if (selectedUsers.includes(idStr)) {
      setSelectedUsers(selectedUsers.filter(function(id) { return id !== idStr; }));
    } else {
      setSelectedUsers([...selectedUsers, idStr]);
    }
  }

  function toggleItem(itemId) {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(function(id) { return id !== itemId; }));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormMessage({ text: "", type: "" });

    if (!name.trim()) {
      setFormMessage({ text: "Trip Name is required.", type: "error" });
      return;
    }

    let token = localStorage.getItem("shopperpet_token");
    let payload = {
      name: name,
      store: store,
      plannedDate: plannedDate,
      budget: budget ? Number(budget) : undefined,
      assignedTo: selectedUsers,
      itemIds: selectedItems,
      createdBy: localStorage.getItem("shopperpet_id")
    };

    // Send trip to backend
    fetch("/api/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(payload)
    })
    .then(function (res) {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(function (data) {
      showToast("Trip created!");
      // Go to trip details page after 1 second
      setTimeout(function () {
        navigate("/trips/" + data.tripId);
      }, 1000);
    })
    .catch(function () {
      setFormMessage({ text: "Failed to create trip.", type: "error" });
    });
  }

  return (
    <main className="container">
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>Plan New Trip</h1>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Trip Name *</label>
            <input type="text" id="name" required value={name} onChange={function(e) { setName(e.target.value); }} placeholder="e.g. Weekly Groceries" />
          </div>
          <div className="form-group">
            <label htmlFor="store">Store</label>
            <input type="text" id="store" value={store} onChange={function(e) { setStore(e.target.value); }} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="plannedDate">Planned Date</label>
            <input type="date" id="plannedDate" value={plannedDate} onChange={function(e) { setPlannedDate(e.target.value); }} />
          </div>
          <div className="form-group">
            <label htmlFor="budget">Budget ($)</label>
            <input type="number" id="budget" min="0" step="0.01" value={budget} onChange={function(e) { setBudget(e.target.value); }} placeholder="e.g. 150.00" />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: "24px", background: "#f9f9f9", padding: "16px", borderRadius: "8px", border: "1px solid #eee" }}>
          <label style={{ fontSize: "16px", color: "teal", borderBottom: "2px solid teal", paddingBottom: "6px", display: "inline-block", marginBottom: "12px" }}>Assign Members</label>
          <p className="subtitle" style={{ fontSize: "13px", marginBottom: "16px" }}>Select who is going on this trip:</p>
          <div className="user-checkbox-grid">
            {users.map(function(user) {
              let isChecked = selectedUsers.includes(String(user.userId));
              return (
                <div 
                  key={user.userId} 
                  className={"user-checkbox-item " + (isChecked ? "selected" : "")} 
                  onClick={function() { toggleUser(user.userId); }}
                >
                  <div className="checkbox-circle">{isChecked && "✓"}</div>
                  <span style={{ fontSize: "15px" }}>{user.name} <span style={{ color: "gray", fontSize: "12px", marginLeft: "4px" }}>({user.username})</span></span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-group" style={{ marginTop: "24px", background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #eee", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <label style={{ fontSize: "16px", color: "teal", borderBottom: "2px solid teal", paddingBottom: "6px", display: "inline-block", marginBottom: "12px" }}>Add Needed Items to Trip</label>
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 16px", background: "#f8f9fa", borderRadius: "8px" }}><p>No items currently marked as "Needed".</p></div>
          ) : (
            <div style={{ border: "1px solid lightgray", borderRadius: "8px", overflow: "hidden", maxHeight: "400px", overflowY: "auto" }}>
              {categories.map(function(cat) {
                let catItems = items.filter(function(i) { return i.category === cat; });
                if (catItems.length === 0) return null;
                
                return (
                  <div key={cat}>
                    <div style={{ background: "teal", padding: "8px 12px", fontSize: "13px", fontWeight: "bold", color: "white", letterSpacing: "1px", textTransform: "uppercase" }}>
                      {cat}
                    </div>
                    {catItems.map(function(item) {
                      let isChecked = selectedItems.includes(item.id);
                      return (
                        <div key={item.id} className={"checklist-item " + (isChecked ? "selected-item" : "")} style={{ borderRadius: 0, border: "none", borderBottom: "1px solid lightgray", transition: "all 0.2s" }} onClick={function() { toggleItem(item.id); }}>
                          <input type="checkbox" className="checklist-checkbox" checked={isChecked} readOnly style={{ accentColor: "teal", width: "20px", height: "20px" }} />
                          <div className="checklist-info" style={{ fontSize: "15px" }}>
                            <div className="item-name" style={{ fontWeight: 600, color: isChecked ? "darkcyan" : "black" }}>
                              {item.item}
                            </div>
                            <div className="item-meta" style={{ fontSize: "12px" }}>
                              Qty: {item.quantity} • {item.priority} Priority
                            </div>
                          </div>
                          <div className="checklist-price" style={{ color: isChecked ? "darkcyan" : "gray" }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {formMessage.text && (
          <div style={{ color: formMessage.type === "error" ? "crimson" : "teal", fontSize: "14px", marginBottom: "12px", textAlign: "center", fontWeight: "bold" }}>
            {formMessage.text}
          </div>
        )}

        <div className="btn-group" style={{ justifyContent: "center", marginTop: "24px" }}>
          <Link to="/trips" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" style={{ minWidth: "150px", justifyContent: "center" }}>Create Trip</button>
        </div>

      </form>
      
      <Toast message={toastProps.message} visible={toastProps.visible} />
    </main>
  );
}

export default NewTrip;
