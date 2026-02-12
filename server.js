var express = require("express");
var fs = require("fs");
var path = require("path");
var app = express();
var PORT = 3000;
var DATA_FILE = path.join(__dirname, "grocery-data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readData() { return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); }
function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8"); }
function findItem(data, id) {
  for (var i = 0; i < data.length; i++) { if (data[i].id === id) return i; }
  return -1;
}
function getNextId(data) {
  var maxId = 0;
  for (var i = 0; i < data.length; i++) { if (data[i].id > maxId) maxId = data[i].id; }
  return maxId + 1;
}

// GET all items
app.get("/api/list", function (req, res) {
  try { res.json(readData()); }
  catch (err) { res.status(500).json({ error: "Failed to read data" }); }
});

// GET single item
app.get("/api/list/:id", function (req, res) {
  try {
    var data = readData();
    var idx = findItem(data, parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Item not found" });
    res.json(data[idx]);
  } catch (err) { res.status(500).json({ error: "Failed to read data" }); }
});

// POST new item
app.post("/api/list", function (req, res) {
  try {
    var b = req.body;
    if (!b.item || !b.category || !b.quantity)
      return res.status(400).json({ error: "Missing required fields: item, category, quantity" });
    var data = readData();
    var newItem = {
      id: getNextId(data), item: b.item.trim(), category: b.category,
      quantity: Number(b.quantity), price: Number(b.price) || 0,
      store: b.store ? b.store.trim() : "", addedBy: b.addedBy ? b.addedBy.trim() : "Anonymous",
      priority: b.priority || "Medium", status: "Pending",
      notes: b.notes ? b.notes.trim() : "", dateAdded: new Date().toISOString().split("T")[0]
    };
    data.push(newItem);
    writeData(data);
    res.status(201).json(newItem);
  } catch (err) { res.status(500).json({ error: "Failed to save item" }); }
});

// PATCH update item
app.patch("/api/list/:id", function (req, res) {
  try {
    var data = readData();
    var idx = findItem(data, parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Item not found" });
    var fields = ["status", "priority", "notes", "quantity", "price", "store"];
    for (var i = 0; i < fields.length; i++) {
      if (req.body[fields[i]] !== undefined) data[idx][fields[i]] = req.body[fields[i]];
    }
    writeData(data);
    res.json(data[idx]);
  } catch (err) { res.status(500).json({ error: "Failed to update item" }); }
});

// DELETE item
app.delete("/api/list/:id", function (req, res) {
  try {
    var data = readData();
    var idx = findItem(data, parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Item not found" });
    var removed = data.splice(idx, 1)[0];
    writeData(data);
    res.json({ message: "Item removed", item: removed });
  } catch (err) { res.status(500).json({ error: "Failed to delete item" }); }
});

// HTML page routes
app.get("/", function (req, res) { res.sendFile(path.join(__dirname, "public", "index.html")); });
app.get("/list", function (req, res) { res.sendFile(path.join(__dirname, "public", "list.html")); });
app.get("/add", function (req, res) { res.sendFile(path.join(__dirname, "public", "add.html")); });
app.get("/item", function (req, res) { res.sendFile(path.join(__dirname, "public", "item.html")); });
app.get("/analytics", function (req, res) { res.sendFile(path.join(__dirname, "public", "analytics.html")); });

// 404
app.use(function (req, res) {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "API endpoint not found" });
  res.status(404).send('<!DOCTYPE html><html><head><title>404</title><link rel="stylesheet" href="/css/style.css"></head>' +
    '<body><nav class="navbar"><a href="/" class="nav-brand">🛒 ShopperPet</a>' +
    '<div class="nav-links"><a href="/list">List</a><a href="/add">Add</a><a href="/analytics">Analytics</a></div></nav>' +
    '<main class="container"><div class="error-page"><h1>404</h1><p>Page not found.</p>' +
    '<a href="/" class="btn btn-primary">Go Home</a></div></main></body></html>');
});

app.listen(PORT, function () { console.log("ShopperPet running at http://localhost:" + PORT); });
