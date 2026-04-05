import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  // MOCK USER DATA: - need to link this to our Mongo DB later
  const currentUser = {
    name: "Mathavan",
    id: "user_123"
  };

  const handleLogout = () => {
    // TODO: Clear token/session later
    console.log("User logged out");
    navigate("/login"); 
  };

  return (
    <nav className="navbar">
      {/* Left Side: Logo */}
      <NavLink to="/" className="nav-brand">
        <span className="material-symbols-outlined nav-brand-icon">shopping_cart</span> 
        ShopperPet
      </NavLink>
      
      {/* Right Side: Nav links */}
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} end>Home</NavLink>
        <NavLink to="/list" className={({ isActive }) => isActive ? "active" : ""}>Groceries</NavLink>
        <NavLink to="/add" className={({ isActive }) => isActive ? "active" : ""}>Add Item</NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? "active" : ""}>Analytics</NavLink>
        <NavLink to="/users" className={({ isActive }) => isActive ? "active" : ""}>Users</NavLink>
        
        {/* User controls: Profile & Logout */}
        <div className="user-controls">
          <NavLink to="/profile" className={({ isActive }) => isActive ? "active profile-link" : "profile-link"}>
            <span>{currentUser.name}</span>
          </NavLink>
          
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;