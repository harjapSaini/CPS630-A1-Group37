const express = require("express");
const router = express.Router();

const {
  readData,
  writeData,
  findItem,
  getNextId
} = require("../data/dataService");

// GET all items
router.get("/list", function (req, res) {
  try { res.json(readData()); }
  catch (err) { res.status(500).json({ error: "Failed to read data" }); }
});

// GET single item
router.get("/list/:id", function (req, res) {
  try {
    const data = readData();
    let idx = findItem(data, parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Item not found" });
    res.json(data[idx]);
  } catch (err) { res.status(500).json({ error: "Failed to read data" }); }
});


// POST new item
router.post("/list", function (req, res) {
  try {
    const b = req.body;
    if (!b.item || !b.category || !b.quantity)
      return res.status(400).json({ error: "Missing required fields: item, category, quantity" });
    const data = readData();
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
  } catch (err) { res.status(500).json({ error: "Failed to save item" }); }
});

// PATCH update item
router.patch("/list/:id", function (req, res) {
  try {
    const data = readData();
    let idx = findItem(data, parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Item not found" });
    const fields = ["status", "priority", "notes", "quantity", "price", "store", "addedBy", "category"];
    for (let i = 0; i < fields.length; i++) {
      if (req.body[fields[i]] !== undefined) data[idx][fields[i]] = req.body[fields[i]];
    }
    writeData(data);
    res.json(data[idx]);
  } catch (err) { res.status(500).json({ error: "Failed to update item" }); }
});

// DELETE item
router.delete("/list/:id", function (req, res) {
  try {
    const data = readData();
    let idx = findItem(data, parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Item not found" });
    let removed = data.splice(idx, 1)[0];
    writeData(data);
    res.json({ message: "Item removed", item: removed });
  } catch (err) { res.status(500).json({ error: "Failed to delete item" }); }
});

module.exports = router;