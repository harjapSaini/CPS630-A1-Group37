import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// home page - shows hero section and 3 most recent items
function Home() {
  let [items, setItems] = useState([]);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(false);

  useEffect(function () {
    fetch("/api/list")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        // sort newest first and grab top 3
        data.sort(function (a, b) {
          return b.id - a.id;
        });
        setItems(data.slice(0, 3));
        setLoading(false);
      })
      .catch(function () {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <h1>
          <span className="material-symbols-outlined title-icon">shopping_cart</span>ShopperPet
        </h1>
        <p className="subtitle">Your simple, smart grocery list manager.</p>
        <div className="btn-group">
          <Link to="/list" className="btn btn-primary">View List</Link>
          <Link to="/add" className="btn btn-primary">Add New</Link>
          <Link to="/add-user" className="btn btn-primary">Add User</Link>
          <Link to="/analytics" className="btn btn-secondary">Analytics</Link>
        </div>
      </section>
      <section>
        <h2>Recently Added</h2>
        <div className="grocery-list">
          {loading && (
            <div className="empty-state"><p>Loading...</p></div>
          )}
          {error && (
            <div className="empty-state"><p>Could not load items.</p></div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="empty-state"><p>No items yet. <Link to="/add">Add your first one!</Link></p></div>
          )}
          {items.map(function (item) {
            return (
              <Link to={"/item/" + item.id} className="grocery-item" style={{ textDecoration: "none", color: "inherit" }} key={item.id}>
                <div className="item-info">
                  <div className="item-name">{item.item}</div>
                  <div className="item-meta">{item.category} · Qty: {item.quantity} · ${item.price.toFixed(2)}</div>
                </div>
                <span className={"badge badge-" + item.priority.toLowerCase()}>{item.priority}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Home;
