const express = require("express");
const router = express.Router();
const { readData, writeData, findItem, getNextId } = require("../data/dataService");

// get all grocery items
router.get("/list", function (req, res) {
  try {
    let data = readData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// get a single item by id
router.get("/list/:id", function (req, res) {
  try {
    let data = readData();
    let idx = findItem(data, parseInt(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(data[idx]);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// add a new item
router.post("/list", function (req, res) {
  try {
    let b = req.body;

    // make sure required fields are there
    if (!b.item || !b.category || !b.quantity) {
      return res.status(400).json({ error: "Missing required fields: item, category, quantity" });
    }

    let data = readData();
    let newItem = {
      id: getNextId(data),
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
    };

    data.push(newItem);
    writeData(data);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to save item" });
  }
});

// update an item (only update the fields that were actually sent)
router.patch("/list/:id", function (req, res) {
  try {
    let data = readData();
    let idx = findItem(data, parseInt(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    // check each field individually and update if it was sent
    if (req.body.status !== undefined) data[idx].status = req.body.status;
    if (req.body.priority !== undefined) data[idx].priority = req.body.priority;
    if (req.body.notes !== undefined) data[idx].notes = req.body.notes;
    if (req.body.quantity !== undefined) data[idx].quantity = req.body.quantity;
    if (req.body.price !== undefined) data[idx].price = req.body.price;
    if (req.body.store !== undefined) data[idx].store = req.body.store;
    if (req.body.addedBy !== undefined) data[idx].addedBy = req.body.addedBy;
    if (req.body.category !== undefined) data[idx].category = req.body.category;

    writeData(data);
    res.json(data[idx]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

// delete an item
router.delete("/list/:id", function (req, res) {
  try {
    let data = readData();
    let idx = findItem(data, parseInt(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    // remove the item and save
    let removed = data.splice(idx, 1)[0];
    writeData(data);
    res.json({ message: "Item removed", item: removed });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;