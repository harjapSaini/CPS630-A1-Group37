const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080; //Used in lecture by prof

const apiRoutes = require("./routes/api");

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// api routes
app.use("/api", apiRoutes);

// serve the html pages
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/list", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "list.html"));
});
app.get("/add", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "add.html"));
});
app.get("/item", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "item.html"));
});
app.get("/analytics", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "analytics.html"));
});

// if someone goes to a bad url show 404
app.use(function (req, res) {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.status(404).send("Page not found");
});

app.listen(PORT, function () {
  console.log("ShopperPet running at http://localhost:" + PORT);
});
