const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "grocery-data.json");

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Data Helpers ───────────────────────────────────────────
function readData() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function nextId(data) {
  if (data.length === 0) return 1;
  return Math.max(...data.map((item) => item.id)) + 1;
}

// ── REST API ───────────────────────────────────────────────

// GET all items
app.get("/api/list", (req, res) => {
  try {
    const data = readData();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// GET single item by id
app.get("/api/list/:id", (req, res) => {
  try {
    const data = readData();
    const item = data.find((i) => i.id === parseInt(req.params.id));
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// POST new item
app.post("/api/list", (req, res) => {
  try {
    const { item, category, quantity, price, store, addedBy, priority, notes } =
      req.body;

    // Validate required fields
    if (!item || !category || !quantity) {
      return res
        .status(400)
        .json({ error: "Missing required fields: item, category, quantity" });
    }

    const data = readData();
    const newItem = {
      id: nextId(data),
      item: item.trim(),
      category,
      quantity: Number(quantity),
      price: Number(price) || 0,
      store: (store || "").trim(),
      addedBy: (addedBy || "Anonymous").trim(),
      priority: priority || "Medium",
      status: "Pending",
      notes: (notes || "").trim(),
      dateAdded: new Date().toISOString().split("T")[0],
    };

    data.push(newItem);
    writeData(data);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to save item" });
  }
});

// PATCH update item (e.g. status toggle)
app.patch("/api/list/:id", (req, res) => {
  try {
    const data = readData();
    const index = data.findIndex((i) => i.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Merge only the provided fields
    const allowedFields = [
      "status",
      "priority",
      "notes",
      "quantity",
      "price",
      "store",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[index][field] = req.body[field];
      }
    });

    writeData(data);
    res.status(200).json(data[index]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

// DELETE item by id
app.delete("/api/list/:id", (req, res) => {
  try {
    const data = readData();
    const index = data.findIndex((i) => i.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    const removed = data.splice(index, 1)[0];
    writeData(data);
    res.status(200).json({ message: "Item removed", item: removed });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// ── HTML Page Routes ───────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/list", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "list.html"));
});

app.get("/add", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "add.html"));
});

app.get("/item", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "item.html"));
});

app.get("/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "analytics.html"));
});

// ── 404 Catch-All ──────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 — Not Found</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <nav class="navbar">
        <a href="/" class="nav-brand">🛒 ShopperPet</a>
        <div class="nav-links">
          <a href="/list">List</a>
          <a href="/add">Add</a>
          <a href="/analytics">Analytics</a>
        </div>
      </nav>
      <main class="container">
        <div class="error-page">
          <h1>404</h1>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" class="btn btn-primary">Go Home</a>
        </div>
      </main>
    </body>
    </html>
  `);
});

// ── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ShopperPet server running at http://localhost:${PORT}`);
});
