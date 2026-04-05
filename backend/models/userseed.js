const User = require("./User");

const userData = [
  { 
    name: "Mom", 
    age: 50 
  },
  { 
    name: "Dad", 
    age: 52 
  },
  { 
    name: "Son", 
    age: 21 
  },
  { name: "Kids", 
    age: 10 
  }
];

async function seedUsers() {
  let count = await User.countDocuments();

  if (count === 0) {
    await User.insertMany(userData);
    console.log("Users seeded with " + userData.length + " users");
  } else {
    console.log("Users already exist, skipping seed");
  }
}

module.exports = { seedUsers };