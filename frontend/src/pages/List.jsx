import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lifecycle, statusConfig } from "../constants";
import { Toast, useToast } from "../components/Toast";

// Socket import
import io from "socket.io-client";

// shopping list page - full CRUD view
function List() {
  let [items, setItems] = useState([]);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(false);
  let [toastProps, showToast] = useToast();

  // fetch all items from the api
  function loadList() {
    let token = localStorage.getItem("shopperpet_token");
    fetch("/api/list", {headers: {"Authorization": "Bearer " + token}})
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        setItems(data);
        setLoading(false);
      })
      .catch(function () {
        setError(true);
        setLoading(false);
      });
  }

  useEffect(function () {
    loadList();

    // Socket code in this function to refresh

    let socket = io("http://localhost:8080"); // conn to backend

    socket.on("list-updated", function () {
      loadList(); // Re-fresh
    });

    // If user leaves the page, then disconnect it
    return function () {
      socket.disconnect();
    };

  }, []);

  // returns the css class for a given status
  function getStatusClass(status) {
    if (statusConfig[status]) return statusConfig[status].class;
    return "";
  }

  // changes the status of an item to the next one in lifecycle
  function toggleStatus(id, newStatus) {
    let token = localStorage.getItem("shopperpet_token");
    fetch("/api/list/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ status: newStatus })
    })
      .then(function () {
        showToast("Status changed to " + newStatus);
        loadList();
      })
      .catch(function () {
        alert("Failed to update status");
      });
  }

  // removes an item from the list
  function deleteItem(id) {
    if (!confirm("Remove this item from the list?")) return;
    let token = localStorage.getItem("shopperpet_token");
    fetch("/api/list/" + id, { method: "DELETE", headers: {"Authorization": "Bearer " + token} })
      .then(function (res) {
        if (res.ok) {
          showToast("Item removed");
          loadList();
        } else {
          alert("Failed to remove item");
        }
      })
      .catch(function () {
        alert("Failed to remove item");
      });
  }

  // downloads the shopping list as a text file
  function downloadList() {
    let token = localStorage.getItem("shopperpet_token");
    fetch("/api/list", {headers: {"Authorization": "Bearer " + token}})
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        let lines = [];
        for (let i = 0; i < data.length; i++) {
          if ((data[i].status === "In Cart") || (data[i].status === "Needed")) {
            let item = data[i];
            let line = (item.status === "In Cart" ? "[x]" : "[ ]") + " " + item.item + " (" + item.category + ") - Qty: " + item.quantity + ", $" + item.price.toFixed(2);
            if (item.store) line += ", " + item.store;
            if (item.notes) line += " | " + item.notes;
            lines.push(line);
          }
        }

        let text = "ShopperPet Shopping List\n============================\n[x] = In Cart\n[] = Not in Cart, so needed\n\n\n\n\n" + lines.join("\n") + "\n";
        let blob = new Blob([text], { type: "text/plain" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "grocery-list.txt";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(function () {
        alert("Failed to download list");
      });
  }

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1>Shopping List</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>All your grocery items in one place.</p>
        </div>
        <div className="btn-group">
          <Link to="/add" className="btn btn-primary">Add Item</Link>
          <button id="download-btn" className="btn btn-secondary" onClick={downloadList}>Download</button>
        </div>
      </div>
      <div className="grocery-list">
        {loading && (
          <div className="empty-state"><p>Loading...</p></div>
        )}
        {error && (
          <div className="empty-state"><p>Could not load list.</p></div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="empty-state"><p>Your list is empty. <Link to="/add">Add some items!</Link></p></div>
        )}
        {items.map(function (item) {
          let currentIndex = lifecycle.indexOf(item.status);
          let nextStatus = lifecycle[(currentIndex + 1) % lifecycle.length];
          let statusClass = getStatusClass(item.status);
          let storeText = item.store ? " · " + item.store : "";

          return (
            <div className={"grocery-item " + statusClass} key={item.id}>
              <div className="item-info">
                <Link to={"/item/" + item.id} className="item-name">{item.item}</Link>
                <div className="item-meta">{item.category} · Qty: {item.quantity} · ${item.price.toFixed(2)}{storeText}</div>
              </div>
              <span className={"badge badge-" + item.priority.toLowerCase()}>{item.priority}</span>
              <span className={"status-tag " + statusClass}>{item.status}</span>
              <div className="item-actions">
                <button className="btn btn-secondary btn-sm" onClick={function () { toggleStatus(item.id, nextStatus); }}>{nextStatus}</button>
                <button className="btn btn-danger btn-sm" onClick={function () { deleteItem(item.id); }}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>
      <Toast message={toastProps.message} visible={toastProps.visible} />
    </main>
  );
}

export default List;
