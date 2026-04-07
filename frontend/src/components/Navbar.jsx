import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const navigate = useNavigate();

  let [currentUserName, setCurrentUserName] = useState(localStorage.getItem("shopperpet_user") || "User");


  useEffect(function() {

    // Listen for browser update on profile change
    function handleProfileUpdate() {
      let updatedName = localStorage.getItem("shopperpet_user") || "User";
      setCurrentUserName(updatedName);
    }

    window.addEventListener("profile-updated", handleProfileUpdate);

    // Cleanup the listener
    return function() {
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {

    localStorage.removeItem("shopperpet_token");
    localStorage.removeItem("shopperpet_user");
    localStorage.removeItem("shopperpet_id");

    navigate("/login"); 
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        <span className="material-symbols-outlined nav-brand-icon">shopping_cart</span> 
        ShopperPet
      </NavLink>
      
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} end>Home</NavLink>
        <NavLink to="/list" className={({ isActive }) => isActive ? "active" : ""}>Groceries</NavLink>
        <NavLink to="/add" className={({ isActive }) => isActive ? "active" : ""}>Add Item</NavLink>
        <NavLink to="/trips" className={({ isActive }) => isActive ? "active" : ""}>Trips</NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? "active" : ""}>Analytics</NavLink>
        <NavLink to="/users" className={({ isActive }) => isActive ? "active" : ""}>Users</NavLink>
        
        <div className="user-controls">
          <NavLink to="/profile" className={({ isActive }) => isActive ? "active profile-link" : "profile-link"}>
            <span>{currentUserName}</span>
          </NavLink>
          
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;