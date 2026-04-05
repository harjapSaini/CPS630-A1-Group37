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

router.post("/users", async function (req, res) {
  try {
    let b = req.body;

    if (!b.name || !b.age) {
      return res.status(400).json({ error: "Missing required fields: name, age" });
    }

    let newUser = new User({
      name: b.name.trim(),
      age: Number(b.age)
    });

    await newUser.save();

    res.status(201).json(newUser);

  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
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