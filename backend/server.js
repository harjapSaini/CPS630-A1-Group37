const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { seedDatabase } = require("./models/seed");
const { seedUsers } = require("./models/userseed");

const app = express();
const PORT = 8080; //Used in lecture by prof

const apiRoutes = require("./routes/api");

// Middlewares
app.use(express.json());

// allow requests from the vite dev server
app.use(cors({ origin: "http://localhost:5173" }));

// api routes
app.use("/api", apiRoutes);

// if someone goes to a bad url show 404
app.use(function (req, res) {
  res.status(404).json({ error: "API endpoint not found" });
});

// connect to mongodb then start the server
mongoose.connect("mongodb://localhost:27017/shopperpet")
  .then(function () {
    console.log("Connected to MongoDB");
    return seedDatabase();
  })
  .then(function () {
    return seedUsers();   
  })
  .then(function () {
    app.listen(PORT, function () {
      console.log("ShopperPet running at http://localhost:" + PORT);
    });
  })
  .catch(function (err) {
    console.log("Failed to connect to MongoDB:", err.message);
  });
