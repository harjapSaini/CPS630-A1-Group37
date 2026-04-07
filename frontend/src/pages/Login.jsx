import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Toast, useToast } from "../components/Toast";

// login page - allows existing users to access the app
function Login() {
  let navigate = useNavigate();

  let location = useLocation();
  let [toastProps, showToast] = useToast();
  
  // form state
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [formError, setFormError] = useState("");

  // check for the success message when the page loads
  useEffect(function () {
    if (location.state && location.state.successMessage) {
      showToast(location.state.successMessage);
      
      // clear it
      window.history.replaceState({}, document.title);
    }
  }, [location, showToast]);

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    // check required fields
    if (!username.trim() || !password) {
      setFormError("Please enter both username and password.");
      return;
    }

    // force lowercase username to match the database rules we set up
    let body = {
      username: username.trim().toLowerCase(),
      password: password
    };

    let token = localStorage.getItem("shopperpet_token");

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        if (res.ok) {
          res.json().then(function (data) {
            
            // SAVE THE TOKEN TO THE BROWSER
            localStorage.setItem("shopperpet_token", data.token);
            localStorage.setItem("shopperpet_user", data.name); // save name for navbar
            localStorage.setItem("shopperpet_id", data.id); // save for the drop down for addedby

            navigate("/"); // redirect to home page after logging in
          });
        } else {
          res.json().then(function (err) {
            setFormError(err.error || "Invalid username or password.");
          });
        }
      })
      .catch(function () {
        setFormError("Network error. Please try again.");
      });
  }

  return (
    // make the login container narrower than the standard 720px
    <main className="container" style={{ maxWidth: "500px", marginTop: "50px" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Login</h1>
        <p className="subtitle">Welcome back to ShopperPet!</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
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
            placeholder="Enter your password" 
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
            Log In
          </button>
        </div>
        
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "14px" }}>
          <span style={{ color: "gray" }}>Don't have an account? </span>
          <Link to="/register" style={{ color: "teal", fontWeight: "bold", textDecoration: "none" }}>
            Sign Up
          </Link>
        </div>
      </form>

      <Toast message={toastProps.message} visible={toastProps.visible} />
    </main>
  );
}

export default Login;