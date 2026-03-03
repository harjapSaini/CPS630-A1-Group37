const mongoose = require("mongoose");

// list of allowed values for validation
const CATEGORIES = ["Produce", "Dairy", "Meat", "Bakery", "Frozen", "Beverages", "Snacks", "Household", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Needed", "In Cart", "Purchased", "Consumed"];

// schema for a grocery item with validation on every field
const groceryItemSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: [true, "Item ID is required"],
    unique: true,
    min: [1, "ID must be at least 1"]
  },
  item: {
    type: String,
    required: [true, "Item name is required"],
    trim: true,
    minlength: [1, "Item name cannot be empty"],
    maxlength: [100, "Item name cannot exceed 100 characters"]
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: {
      values: CATEGORIES,
      message: "Category must be one of: " + CATEGORIES.join(", ")
    }
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
    validate: {
      validator: function (val) {
        return Number.isInteger(val);
      },
      message: "Quantity must be a whole number"
    }
  },
  price: {
    type: Number,
    default: 0,
    min: [0, "Price cannot be negative"],
    max: [99999, "Price cannot exceed $99,999"]
  },
  store: {
    type: String,
    default: "",
    trim: true,
    maxlength: [100, "Store name cannot exceed 100 characters"]
  },
  addedBy: {
    type: String,
    default: "Anonymous",
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  priority: {
    type: String,
    default: "Medium",
    enum: {
      values: PRIORITIES,
      message: "Priority must be one of: " + PRIORITIES.join(", ")
    }
  },
  status: {
    type: String,
    default: "Needed",
    enum: {
      values: STATUSES,
      message: "Status must be one of: " + STATUSES.join(", ")
    }
  },
  notes: {
    type: String,
    default: "",
    trim: true,
    maxlength: [500, "Notes cannot exceed 500 characters"]
  },
  dateAdded: {
    type: String,
    default: function () {
      return new Date().toISOString().split("T")[0];
    },
    validate: {
      validator: function (val) {
        // must be in YYYY-MM-DD format
        return /^\d{4}-\d{2}-\d{2}$/.test(val);
      },
      message: "Date must be in YYYY-MM-DD format"
    }
  }
});

module.exports = mongoose.model("GroceryItem", groceryItemSchema);
