import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// register page - allows new users to create an account
function Register() {
  let navigate = useNavigate();
  
  // form state
  let [name, setName] = useState("");
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [formError, setFormError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    // check required fields
    if (!name.trim() || !username.trim() || !password) {
      setFormError("Please fill in all fields.");
      return;
    }

    // basic validation to match our mongoose schema
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    let body = {
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: password
    };

    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        if (res.ok) {
          res.json().then(function () {
            console.log("Registration successful");
            // redirect them to login so they can sign in with their new account
            navigate("/login", { state: { successMessage: "Account created successfully! Please log in." } });
          });
        } else {
          res.json().then(function (err) {
            // grab the specific error from the backend
            setFormError(err.error || "Failed to register.");
          });
        }
      })
      .catch(function () {
        setFormError("Network error. Please try again.");
      });
  }

  return (
    <main className="container" style={{ maxWidth: "500px", marginTop: "50px" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Sign Up</h1>
        <p className="subtitle">Join your family on ShopperPet!</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Display Name</label>
          <input 
            type="text" 
            id="name" 
            placeholder="e.g. User" 
            required 
            value={name} 
            onChange={function (e) { setName(e.target.value); }} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            id="username" 
            placeholder="e.g. username" 
            required 
            value={username} 
            onChange={function (e) { setUsername(e.target.value); }} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            placeholder="At least 6 characters long" 
            required 
            value={password} 
            onChange={function (e) { setPassword(e.target.value); }} 
          />
        </div>

        {formError && (
          <div style={{ color: "crimson", fontSize: "0.85rem", marginBottom: "0.75rem", textAlign: "center" }}>
            {formError}
          </div>
        )}

        <div className="btn-group" style={{ justifyContent: "center", marginTop: "1rem" }}>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Create Account
          </button>
        </div>
        
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "14px" }}>
          <span style={{ color: "gray" }}>Already have an account? </span>
          <Link to="/login" style={{ color: "teal", fontWeight: "bold", textDecoration: "none" }}>
            Log In
          </Link>
        </div>
      </form>
    </main>
  );
}

export default Register;