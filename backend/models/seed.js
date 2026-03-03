const GroceryItem = require("./GroceryItem");

// test data to seed the database with - same items from grocery-data.json
const testData = [
  {
    id: 1,
    item: "Chicken Breast",
    category: "Meat",
    quantity: 2,
    price: 12.99,
    store: "Walmart",
    addedBy: "Mom",
    priority: "Medium",
    status: "Consumed",
    notes: "Boneless, skinless",
    dateAdded: "2026-02-11"
  },
  {
    id: 2,
    item: "Sourdough Bread",
    category: "Bakery",
    quantity: 1,
    price: 1,
    store: "Whole Foods",
    addedBy: "Dad",
    priority: "Low",
    status: "Purchased",
    notes: "",
    dateAdded: "2026-02-11"
  },
  {
    id: 3,
    item: "Frozen Pizza",
    category: "Frozen",
    quantity: 4,
    price: 7.99,
    store: "Costco",
    addedBy: "Kids",
    priority: "Low",
    status: "In Cart",
    notes: "Pepperoni chicken preferred",
    dateAdded: "2026-02-11"
  },
  {
    id: 4,
    item: "2% Milk",
    category: "Dairy",
    quantity: 7,
    price: 0.02,
    store: "Walmart",
    addedBy: "Dad",
    priority: "Medium",
    status: "In Cart",
    notes: "test",
    dateAdded: "2026-02-12"
  },
  {
    id: 5,
    item: "Oranges",
    category: "Beverages",
    quantity: 1,
    price: 10.5,
    store: "No Frills",
    addedBy: "Dad",
    priority: "Medium",
    status: "Purchased",
    notes: "",
    dateAdded: "2026-02-13"
  },
  {
    id: 6,
    item: "Dish Washer",
    category: "Other",
    quantity: 3,
    price: 16.99,
    store: "Costco",
    addedBy: "Dad",
    priority: "High",
    status: "Purchased",
    notes: "It's in the 2nd aisle.",
    dateAdded: "2026-02-13"
  },
  {
    id: 7,
    item: "Milk",
    category: "Dairy",
    quantity: 1,
    price: 4.5,
    store: "Tesco",
    addedBy: "Mom",
    priority: "Medium",
    status: "In Cart",
    notes: "",
    dateAdded: "2026-02-13"
  },
  {
    id: 8,
    item: "Video Game",
    category: "Other",
    quantity: 1,
    price: 89.99,
    store: "Best Buy",
    addedBy: "Son",
    priority: "Medium",
    status: "Consumed",
    notes: "I really need it",
    dateAdded: "2026-02-14"
  }
];

// checks if the grocery collection is empty
// if it is, inserts the test data above
async function seedDatabase() {
  let count = await GroceryItem.countDocuments();

  if (count === 0) {
    await GroceryItem.insertMany(testData);
    console.log("Database seeded with " + testData.length + " test items");
  } else {
    console.log("Database already has " + count + " items, skipping seed");
  }
}

module.exports = { seedDatabase };
