import { useState, useEffect } from "react";
import { Toast, useToast } from "../components/Toast";

// profile page - allows a user to update their display name and password
function Profile() {
  let [toastProps, showToast] = useToast();
  
  let [name, setName] = useState("");
  let [password, setPassword] = useState("");
  let [confirmPassword, setConfirmPassword] = useState("");
  let [formMessage, setFormMessage] = useState({ text: "", type: "" });

  // pre-fill their current name from localStorage
  useEffect(function () {
    let currentName = localStorage.getItem("shopperpet_user");
    if (currentName) {
      setName(currentName);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setFormMessage({ text: "", type: "" });

    // Basic Validation
    if (!name.trim()) {
      setFormMessage({ text: "Display name cannot be empty.", type: "error" });
      return;
    }

    // Only check password rules if they entered something...
    if (password) {
      if (password.length < 6) {
        setFormMessage({ text: "New password must be at least 6 characters.", type: "error" });
        return;
      }
      if (password !== confirmPassword) {
        setFormMessage({ text: "Passwords do not match.", type: "error" });
        return;
      }
    }

    // clean the data up
    let userId = localStorage.getItem("shopperpet_id");
    let body = {
      name: name.trim()
    };
    
    // Send the password to the backend if they typed a new one
    if (password) {
      body.password = password;
    }

    // Finally, send data to our new backend route
    fetch("/api/users/" + userId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        if (res.ok) {
          res.json().then(function (data) {
            // Update the browser storage so the navbar updates it
            localStorage.setItem("shopperpet_user", data.name);
            
            showToast("Profile updated successfully!");
            
            // clear the password boxes so they don't linger
            setPassword("");
            setConfirmPassword("");
            
          });
        } else {
          setFormMessage({ text: "Failed to update profile.", type: "error" });
        }
      })
      .catch(function () {
        setFormMessage({ text: "Network error. Please try again.", type: "error" });
      });
  }

  return (
    <main className="container" style={{ maxWidth: "400px", marginTop: "40px" }}>
      <div style={{ textAlign: "center" }}>
        <h1>My Profile</h1>
        <p className="subtitle">Update your display name or change your password.</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Display Name</label>
          <input 
            type="text" 
            id="name" 
            required 
            value={name} 
            onChange={function (e) { setName(e.target.value); }} 
          />
        </div>

        <hr style={{ margin: "1.5rem 0", border: "none", borderTop: "1px solid lightgray" }} />
        
        <p style={{ fontSize: "13px", color: "gray", marginBottom: "10px" }}>
          Leave passwords blank if you do not want to change it.
        </p>

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input 
            type="password" 
            id="password" 
            placeholder="At least 6 characters" 
            value={password} 
            onChange={function (e) { setPassword(e.target.value); }} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            placeholder="Retype new password" 
            value={confirmPassword} 
            onChange={function (e) { setConfirmPassword(e.target.value); }} 
          />
        </div>

        {formMessage.text && (
          <div style={{ 
            color: formMessage.type === "error" ? "crimson" : "teal", 
            fontSize: "0.85rem", 
            marginBottom: "0.75rem", 
            textAlign: "center",
            fontWeight: "bold"
          }}>
            {formMessage.text}
          </div>
        )}

        <div className="btn-group" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Save Changes
          </button>
        </div>
        
      </form>

      <Toast message={toastProps.message} visible={toastProps.visible} />
    </main>
  );
}

export default Profile;