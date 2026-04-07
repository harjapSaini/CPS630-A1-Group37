import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import { tripLifecycle, statusConfig } from "../constants";

function Trips() {
  let [trips, setTrips] = useState([]);
  let [items, setItems] = useState([]);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(false);
  let [filter, setFilter] = useState("All");

  function loadData() {
    let token = localStorage.getItem("shopperpet_token");
    
    Promise.all([
      fetch("/api/trips", { headers: { "Authorization": "Bearer " + token } }).then(res => res.json()),
      fetch("/api/list", { headers: { "Authorization": "Bearer " + token } }).then(res => res.json())
    ])
    .then(function (results) {
      setTrips(results[0] || []);
      setItems(results[1] || []);
      setLoading(false);
    })
    .catch(function () {
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
  }, []);

  function getTripCost(trip) {
    let total = 0;
    if (trip.itemIds && trip.itemIds.length > 0) {
      for (let i = 0; i < trip.itemIds.length; i++) {
        let itemId = trip.itemIds[i];
        let item = items.find(function(it) { return it.id === itemId; });
        if (item) {
          total += (item.price * item.quantity);
        }
      }
    }
    return total;
  }

  let filteredTrips = trips;
  if (filter !== "All") {
    filteredTrips = trips.filter(function(t) { return t.status === filter; });
  }

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1>Grocery Trips</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>Plan your shopping trips and stay on budget.</p>
        </div>
        <div>
          <Link to="/trips/new" className="btn btn-primary">Plan New Trip</Link>
        </div>
      </div>

      <div className="btn-group" style={{ marginBottom: "1rem" }}>
        <button 
          className={filter === "All" ? "btn btn-primary" : "btn btn-secondary"} 
          onClick={function() { setFilter("All"); }}
        >
          All
        </button>
        {tripLifecycle.map(function(status) {
          return (
            <button 
              key={status} 
              className={filter === status ? "btn btn-primary" : "btn btn-secondary"} 
              onClick={function() { setFilter(status); }}
            >
              {status}
            </button>
          );
        })}
      </div>

      <div className="grocery-list">
        {loading && <div className="empty-state"><p>Loading trips...</p></div>}
        {error && <div className="empty-state"><p>Could not load trips.</p></div>}
        {!loading && !error && filteredTrips.length === 0 && (
          <div className="empty-state">
            <p>No trips found.</p>
          </div>
        )}

        {filteredTrips.map(function (trip) {
          let cost = getTripCost(trip);
          let itemCount = trip.itemIds ? trip.itemIds.length : 0;
          let statusClass = statusConfig[trip.status] ? statusConfig[trip.status].class : "";

          return (
            <div className="trip-item" key={trip.tripId}>
              <div className="trip-info">
                <Link to={"/trips/" + trip.tripId} className="item-name" style={{ fontSize: "16px" }}>
                  {trip.name}
                </Link>
                <div className="item-meta">
                  {trip.store && <span>At {trip.store} • </span>}
                  {trip.plannedDate && <span>Date: {trip.plannedDate} • </span>}
                  <span>{itemCount} item{itemCount !== 1 ? "s" : ""} • </span>
                  <span style={{ fontWeight: 600, color: "teal" }}>Est: ${cost.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <span className={"status-tag " + statusClass}>{trip.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default Trips;
