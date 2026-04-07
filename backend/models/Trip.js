const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  tripId: {
    type: Number,
    required: [true, "Trip ID is required"],
    unique: true,
    min: [1, "Trip ID must be at least 1"]
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: [100, "Trip name too long"]
  },
  store: {
    type: String,
    trim: true,
    maxLength: [100, "Store name too long"],
    default: ""
  },
  plannedDate: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: props => `${props.value} is not a valid date format. Use YYYY-MM-DD`
    },
    default: ""
  },
  createdBy: {
    type: String,
    trim: true,
    default: "Anonymous"
  },
  assignedTo: {
    type: [String],
    default: []
  },
  itemIds: {
    type: [Number],
    default: []
  },
  budget: {
    type: Number,
    min: [0, "Budget cannot be negative"],
    max: [99999, "Budget too high"]
  },
  status: {
    type: String,
    enum: ["Planning", "Active", "Completed"],
    default: "Planning"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Trip", TripSchema);
