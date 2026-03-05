const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: 
  {
    type: String,
    required: true,
    trim: true
  },
  age: 
  {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  createdAt: 
  {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);