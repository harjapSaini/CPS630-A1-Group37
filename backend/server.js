const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { seedDatabase } = require("./models/seed");
const { seedUsers } = require("./models/userseed");

const app = express();
const PORT = 8080; //Used in lecture by prof

// Needed and imported for socket.io
const http = require("http"); 
const { Server } = require("socket.io");


// Socket io codes below
const server = http.createServer(app);

// this lets React frontend to talk to it
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

app.set("io", io); //we can use io inside routes/api.js later



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
mongoose.connect("mongodb://127.0.0.1:27017/shopperpet")
  .then(function () {
    console.log("Connected to MongoDB");
    return seedUsers();
  })
  .then(function () {
    return seedDatabase();   
  })
  .then(function () {
    server.listen(PORT, function () {
      console.log("ShopperPet running at http://localhost:" + PORT);
    });
  })
  .catch(function (err) {
    console.log("Failed to connect to MongoDB:", err.message);
  });
