const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080; //Used in lecture by prof

const apiRoutes = require("./routes/api");

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Api routes
app.use("/api", apiRoutes);


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
