const express = require("express");
const router = express.Router();
const GroceryItem = require("../models/GroceryItem");
const User = require("../models/User");

// Get all users
router.get("/users", async function (req, res) {
  try {
    let users = await User.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to read users" });
  }
});


// Update a specific user's profile
router.patch("/users/:id", async function (req, res) {
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If the frontend sent a new name, update it
    if (req.body.name) {
      user.name = req.body.name;
    }
    
    // If the frontend sent a new password, update it
    if (req.body.password) {
      user.password = req.body.password; 
    }
    await user.save();
    
    // Send back the new name so the frontend can update the Navbar
    res.status(200).json({ name: user.name });

  } catch (err) {
    console.log("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// register a new user
router.post("/auth/register", async function (req, res) {
  try {
    let b = req.body;

    if (!b.name || !b.username || !b.password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (b.password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    let existingUser = await User.findOne({ username: b.username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    let newUser = new User({
      name: b.name.trim(),
      username: b.username.trim().toLowerCase(),
      password: b.password
    });

    await newUser.save();
    res.status(201).json(newUser);

  } catch (err) {
    console.log("Register error:", err);
    res.status(500).json({ error: "Failed to create account" });
  }
});


// Login an existing user
router.post("/auth/login", async function (req, res) {
  try {
    let b = req.body;

    if (!b.username || !b.password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    let user = await User.findOne({ username: b.username.toLowerCase() });

    if (!user || user.password !== b.password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.status(200).json({
      message: "Login successful",
      id: user._id,
      name: user.name,
      username: user.username,
      // TODO: We need to add the real JWT token here later
      token: "fake-jwt-token-for-now" 
    });

  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
});

// get all grocery items
router.get("/list", async function (req, res) {
  try {
    let data = await GroceryItem.find().lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// get a single item by id
router.get("/list/:id", async function (req, res) {
  try {
    let item = await GroceryItem.findOne({ id: parseInt(req.params.id) });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// add a new item
router.post("/list", async function (req, res) {
  try {
    let b = req.body;

    // make sure required fields are there
    if (!b.item || !b.category || !b.quantity) {
      return res.status(400).json({ error: "Missing required fields: item, category, quantity" });
    }

    // figure out the next available id
    let last = await GroceryItem.findOne().sort({ id: -1 });
    let nextId = last ? last.id + 1 : 1;

    let newItem = new GroceryItem({
      id: nextId,
      item: b.item.trim(),
      category: b.category,
      quantity: Number(b.quantity),
      price: Number(b.price) || 0,
      store: b.store ? b.store.trim() : "",
      addedBy: b.addedBy ? b.addedBy.trim() : "Anonymous",
      priority: b.priority || "Medium",
      status: b.status || "Needed",
      notes: b.notes ? b.notes.trim() : "",
      dateAdded: new Date().toISOString().split("T")[0]
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to save item" });
  }
});

// update an item (only update the fields that were actually sent)
router.patch("/list/:id", async function (req, res) {
  try {
    let item = await GroceryItem.findOne({ id: parseInt(req.params.id) });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // check each field individually and update if it was sent
    if (req.body.status !== undefined) item.status = req.body.status;
    if (req.body.priority !== undefined) item.priority = req.body.priority;
    if (req.body.notes !== undefined) item.notes = req.body.notes;
    if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
    if (req.body.price !== undefined) item.price = req.body.price;
    if (req.body.store !== undefined) item.store = req.body.store;
    if (req.body.addedBy !== undefined) item.addedBy = req.body.addedBy;
    if (req.body.category !== undefined) item.category = req.body.category;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

// delete an item
router.delete("/list/:id", async function (req, res) {
  try {
    let item = await GroceryItem.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item removed", item: item });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;