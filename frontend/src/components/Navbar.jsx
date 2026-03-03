import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        <span className="material-symbols-outlined nav-brand-icon">shopping_cart</span> ShopperPet
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} end>Home</NavLink>
        <NavLink to="/list" className={({ isActive }) => isActive ? "active" : ""}>List</NavLink>
        <NavLink to="/add" className={({ isActive }) => isActive ? "active" : ""}>Add</NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? "active" : ""}>Analytics</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
