import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import io from "socket.io-client"; // Used for live socket updates
import { Toast, useToast } from "../components/Toast";
import { statusConfig } from "../constants";

function TripDetail() {
   // Get trip id from URL
  let { id } = useParams();
  let navigate = useNavigate();
  let [toastProps, showToast] = useToast();

  let [trip, setTrip] = useState(null);
  let [items, setItems] = useState([]);
  let [users, setUsers] = useState([]);
  
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(false);

   // Load trip, item, and user data
  function loadData() {
    let token = localStorage.getItem("shopperpet_token");
    
    Promise.all([
      fetch("/api/trips/" + id, { headers: { "Authorization": "Bearer " + token } }).then(res => {
        if (!res.ok) throw new Error("Trip not found");
        return res.json();
      }),
      fetch("/api/list", { headers: { "Authorization": "Bearer " + token } }).then(res => res.json()),
      fetch("/api/users", { headers: { "Authorization": "Bearer " + token } }).then(res => res.json())
    ])
    .then(function (results) {
      setTrip(results[0]);
      setItems(results[1] || []);
      setUsers(results[2] || []);
      setLoading(false);
    })
    .catch(function (e) {
      console.error(e);
      setError(true);
      setLoading(false);
    });
  }

  useEffect(function () {
    loadData();

    let socket = io("http://localhost:8080");

    socket.on("trips-updated", function () {
      loadData();
    });

    socket.on("list-updated", function () {
      loadData();
    });

    return function () {
      socket.disconnect();
    };
  }, [id]);

  // Update trip status
  function updateTripStatus(newStatus) {
    let token = localStorage.getItem("shopperpet_token");
    fetch("/api/trips/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ status: newStatus })
    }).then(function(res) {
      if (res.ok) {
        showToast("Trip " + newStatus.toLowerCase() + "!");
        loadData(); // Re-fetch immediately in case socket is delayed
      }
    });
  }

   // Delete trip
  function deleteTrip() {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    
    let token = localStorage.getItem("shopperpet_token");
    fetch("/api/trips/" + id, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    }).then(function(res) {
      if (res.ok) {
        navigate("/trips");
      } else {
        alert("Failed to delete trip.");
      }
    });
  }
  // Toggle item between Needed and In Cart
  function toggleItemInCart(itemId, currentlyInCart) {
    let newStatus = currentlyInCart ? "Needed" : "In Cart";
    let token = localStorage.getItem("shopperpet_token");
    
    fetch("/api/list/" + itemId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ status: newStatus })
    }).then(function(res) {
      if (!res.ok) console.error("Failed to update item status");
    });
    // the UI will update when list-updated socket fires
  }

  function handleUseAsTemplate() {
    navigate("/trips/new", { 
      state: { 
        templateName: trip.name, 
        templateStore: trip.store, 
        templateBudget: trip.budget,
        templateUsers: trip.assignedTo
      } 
    });
  }

  if (loading) return <main className="container"><div className="empty-state"><p>Loading trip...</p></div></main>;
  // Error screen
  if (error || !trip) return <main className="container"><div className="empty-state"><p>Trip not found or error loading.</p></div></main>;

  // Resolve assigned members mapped from users list
  let assignedNames = trip.assignedTo.map(function(userId) {
    let u = users.find(function(user) { return String(user.userId) === userId; });
    return u ? u.name : "Unknown";
  }).join(", ");

  let tripItems = items.filter(function(it) { return trip.itemIds.includes(it.id); });

  // Mode: Planning
  if (trip.status === "Planning") {
    let estCost = tripItems.reduce(function(sum, it) { return sum + (it.price * it.quantity); }, 0);
    return (
      <main className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h1>{trip.name}</h1>
            <span className={"status-tag " + statusConfig[trip.status].class}>{trip.status}</span>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="detail-grid">
            <span className="detail-label">Store</span>
            <span className="detail-value">{trip.store || "-"}</span>
            <span className="detail-label">Planned Date</span>
            <span className="detail-value">{trip.plannedDate || "-"}</span>
            <span className="detail-label">Budget</span>
            <span className="detail-value">${trip.budget ? trip.budget.toFixed(2) : "-"}</span>
            <span className="detail-label">Assigned</span>
            <span className="detail-value">{assignedNames || "None"}</span>
            <span className="detail-label">Est. Total</span>
            <span className="detail-value" style={{ fontWeight: "bold", color: "teal" }}>${estCost.toFixed(2)}</span>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "20px" }}>
          <h2>Assigned Items ({tripItems.length})</h2>
          {tripItems.length === 0 ? (
            <p className="detail-label">No items assigned to this trip.</p>
          ) : (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {tripItems.map(function(it) {
                return (
                  <li key={it.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
                    {it.item} (x{it.quantity}) - ${it.price.toFixed(2)}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="btn-group" style={{ justifyContent: "center" }}>
          <button className="btn btn-secondary" onClick={deleteTrip}>Delete Trip</button>
          <button className="btn btn-primary" onClick={function() { updateTripStatus("Active"); }}>Start Trip</button>
        </div>
        
        <Toast message={toastProps.message} visible={toastProps.visible} />
      </main>
    );
  }

  // Mode: Active
  if (trip.status === "Active") {
    let checkedItems = tripItems.filter(function(it) { return it.status === "In Cart" || it.status === "Purchased" || it.status === "Consumed"; });
    let currentSpend = checkedItems.reduce(function(sum, it) { return sum + (it.price * it.quantity); }, 0);
    
    // Budget gauge variables
    let budgetVal = trip.budget || 0;
    let pct = budgetVal > 0 ? Math.min((currentSpend / budgetVal) * 100, 100) : 0;
    let barColor = "green";
    let msgColor = "green";
    let budgetMsg = "";

    if (budgetVal > 0) {
      if (currentSpend > budgetVal) {
        barColor = "red";
        pct = 100;
        budgetMsg = "Over budget by $" + (currentSpend - budgetVal).toFixed(2) + "!";
        msgColor = "crimson";
      } else if (pct >= 80) {
        barColor = "yellow";
        budgetMsg = "Careful! Only $" + (budgetVal - currentSpend).toFixed(2) + " left.";
        msgColor = "chocolate";
      } else {
        barColor = "green";
        budgetMsg = "$" + (budgetVal - currentSpend).toFixed(2) + " remaining under budget.";
        msgColor = "green";
      }
    }

    return (
      <main className="container" style={{ paddingBottom: "80px" }}>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h1 style={{ paddingBottom: "10px" }}>{trip.name}</h1>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "teal", marginBottom: "10px" }}>
            ${currentSpend.toFixed(2)}
          </div>
          
          {budgetVal > 0 && (
            <div className="budget-section" style={{ marginBottom: "20px" }}>
              <div className="budget-bar-container">
                <div className={"budget-bar " + barColor} style={{ width: pct + "%" }}></div>
              </div>
              <div className="budget-message" style={{ color: msgColor }}>{budgetMsg}</div>
            </div>
          )}
        </div>

        <div className="trip-checklist">
          {tripItems.length === 0 ? (
            <div className="empty-state"><p>No items assigned.</p></div>
          ) : (
            tripItems.map(function(it) {
              let isChecked = it.status === "In Cart" || it.status === "Purchased" || it.status === "Consumed";
              return (
                <div 
                  key={it.id} 
                  className={isChecked ? "checklist-item checked" : "checklist-item"} 
                  onClick={function() { toggleItemInCart(it.id, isChecked); }}
                >
                  <input type="checkbox" className="checklist-checkbox" checked={isChecked} readOnly />
                  <div className="checklist-info">
                    <div className="item-name" style={{ fontWeight: "bold" }}>{it.item} (x{it.quantity})</div>
                    <div className="item-meta" style={{ fontSize: "13px" }}>{it.category}</div>
                  </div>
                  <div className="checklist-price">
                    ${(it.price * it.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", padding: "16px", borderTop: "1px solid lightgray", textAlign: "center", zIndex: 50 }}>
          <button className="btn btn-primary" style={{ width: "100%", maxWidth: "400px", padding: "12px", fontSize: "18px" }} onClick={function() { updateTripStatus("Completed"); }}>
            Complete Trip
          </button>
        </div>

        <Toast message={toastProps.message} visible={toastProps.visible} />
      </main>
    );
  }

  // Mode: Completed
  if (trip.status === "Completed") {
    let checkedItems = tripItems.filter(function(it) { return it.status === "In Cart" || it.status === "Purchased" || it.status === "Consumed"; });
    let finalSpend = checkedItems.reduce(function(sum, it) { return sum + (it.price * it.quantity); }, 0);
    
    return (
      <main className="container">
        <div style={{ textAlign: "center" }}>
          <h1>Trip Completed!</h1>
          <p className="subtitle">Summary for {trip.name}</p>
        </div>

        <div className="summary-cards" style={{ marginTop: "20px" }}>
          <div className="summary-card">
            <div className="card-value">${finalSpend.toFixed(2)}</div>
            <div className="card-label">Total Spent</div>
          </div>
          <div className="summary-card">
            <div className="card-value">{checkedItems.length} / {tripItems.length}</div>
            <div className="card-label">Items Procured</div>
          </div>
          <div className="summary-card" style={{ gridColumn: "span 3" }}>
            <div className="card-label" style={{ marginBottom: "8px" }}>Assigned Members</div>
            <div className="card-value" style={{ fontSize: "16px" }}>{assignedNames || "None"}</div>
          </div>
        </div>

        <div className="btn-group" style={{ justifyContent: "center", marginTop: "20px" }}>
          <Link to="/trips" className="btn btn-secondary">Back to Trips</Link>
          <button className="btn btn-primary" onClick={handleUseAsTemplate}>Create a New Trip</button>
        </div>
        
        {/* Toast popup message */}
        <Toast message={toastProps.message} visible={toastProps.visible} />
      </main>
    );
  }

  return null;
}

export default TripDetail;
