import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddUser() {

  let navigate = useNavigate();

  let [name, setName] = useState("");
  let [age, setAge] = useState("");
  let [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault(); // prevent reloading page
    setError("");

    if (!name.trim() || !age) 
    {
      setError("Please enter name and age.");
      return;
    }

    fetch("/api/users", 
    {
      method: "POST",
      headers: 
      {
        "Content-Type": "application/json"
      },
      body: JSON.stringify
      ({
        name: name.trim(),
        age: parseInt(age)
      })
    })
      .then(function(res) {
        if (res.ok) {
          navigate("/");
        } else {
          res.json().then(function(err){
            setError(err.error || "Failed to add user.");
          });
        }
      })
      .catch(function(){
        setError("Network error.");
      });
  }

  return (
    <main className="container">
      <h1>Add New User</h1>

      <form className="card" onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Name</label>
          <input
            value={name}
            onChange={function(e){ setName(e.target.value); }}
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            value={age}
            onChange={function(e){ setAge(e.target.value); }}
          />
        </div>

        {error && <p style={{color:"crimson"}}>{error}</p>}

        <button className="btn btn-primary">Add User</button>

      </form>
    </main>
  );
}

export default AddUser;