const express = require("express");
const router = express.Router();
const GroceryItem = require("../models/GroceryItem");
const User = require("../models/User");

// Need these for encrypting password and jwt tokens
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Have to keep this in the .env file, but leaving it here for now.. (in future we can but for A3 its fine)
const JWT_SECRET = "shopperpet-super-secret-key-2026";


// Helper function to verify the JWT tokens
function verifyToken(req, res, next) {

  let authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  // Verify the token
  jwt.verify(token, JWT_SECRET, function(err, user) {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });

  
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    req.user = user;
    next(); // Let them through
  });
}


// Get all users
router.get("/users", verifyToken, async function (req, res) {
  try {
    let users = await User.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to read users" });
  }
});


// Update a specific user's profile
router.patch("/users/:id", verifyToken, async function (req, res) {
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If the frontend sent a new name, update it
    if (req.body.name) {
      user.name = req.body.name;
    }
    
    // If the frontend sent a new password, update it with HASH
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }
    await user.save();
    
    // Send back the new name so the frontend can update the Navbar
    res.status(200).json({ name: user.name });

  } catch (err) {
    //console.log("Profile update error:", err);
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

    // Hash the new password
    let passwordHashed = await bcrypt.hash(b.password, 10);

    let newUser = new User({
      name: b.name.trim(),
      username: b.username.trim().toLowerCase(),
      password: passwordHashed
    });

    await newUser.save();
    res.status(201).json(newUser);

  } catch (err) {
    //console.log("Register error:", err);
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

    // 1. Check user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid username" });
    }

    // 2. compare plain-text password with the hashed one in the DB
    let passwordMatch = await bcrypt.compare(b.password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // 3. Generate the real JWT token
    let token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" } // Token will expire after 24h...
    );

    res.status(200).json({
      message: "Login successful",
      id: user._id,
      name: user.name,
      username: user.username,
      token: token
    });

  } catch (err) {
    //console.log("Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
});

// get all grocery items
router.get("/list", verifyToken, async function (req, res) {
  try {
    let data = await GroceryItem.find().lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// get a single item by id
router.get("/list/:id", verifyToken, async function (req, res) {
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
router.post("/list", verifyToken, async function (req, res) {
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

    req.app.get("io").emit("list-updated"); // Socket to broadcast that list changed

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to save item" });
  }
});

// update an item (only update the fields that were actually sent)
router.patch("/list/:id", verifyToken, async function (req, res) {
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

    req.app.get("io").emit("list-updated"); // Socket broadcast that list updated

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

// delete an item
router.delete("/list/:id", verifyToken, async function (req, res) {
  try {
    let item = await GroceryItem.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    req.app.get("io").emit("list-updated"); // Socket broadcast list change/now removed

    res.json({ message: "Item removed", item: item });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;