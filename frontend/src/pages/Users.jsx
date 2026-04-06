import { useState, useEffect } from "react";
import defaultAvatar from "/src/assets/default-avatar.png";

// users page - view all family members registered in the app
function Users() {
  let [users, setUsers] = useState([]);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(false);

  // fetch all users from the api
  function loadUsers() {
    fetch("/api/users")
      .then(function (res) {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(function (data) {
        setUsers(data);
        setLoading(false);
      })
      .catch(function () {
        setError(true);
        setLoading(false);
      });
  }

  useEffect(function () {
    loadUsers();
  }, []);

  // helper function to format the date from MongoDB into a readable string
  function formatDate(dateString) {
    if (!dateString) return "Unknown";
    let date = new Date(dateString);
    return date.toLocaleDateString(); 
  }

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1>Family Members</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>Everyone with access to the shared grocery list.</p>
        </div>
      </div>

      <div className="grocery-list">
        
        {loading && (
          <div className="empty-state"><p>Loading users...</p></div>
        )}
        
        {error && (
          <div className="empty-state"><p>Could not load users.</p></div>
        )}
        
        {!loading && !error && users.length === 0 && (
          <div className="empty-state"><p>No users found.</p></div>
        )}

        {users.map(function (user) {
          return (
            <div className="grocery-item" key={user._id}>
              
              <img 
                src={defaultAvatar} 
                alt="User Avatar" 
                className="user-avatar-img"
                width="50px"
              />

              <div className="item-info">
                <div className="item-name" style={{ textDecoration: "none", cursor: "default" }}>
                  {user.name}
                </div>
                <div className="item-meta">
                  @{user.username} | Joined: {formatDate(user.createdAt)}
                </div>
              </div>

              <span className="status-tag status-purchased">Active Member</span>
              
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default Users;