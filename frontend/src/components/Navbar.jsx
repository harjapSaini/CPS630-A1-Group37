import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  let currentUserName = localStorage.getItem("shopperpet_user") || "";


  const handleLogout = () => {

    localStorage.removeItem("shopperpet_token");
    localStorage.removeItem("shopperpet_user");

    console.log("User logged out");
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