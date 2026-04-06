const User = require("./User");

const userData = [
  { 
    name: "Mom",
    username: "mom",
    password: "password123" 
  },
  { 
    name: "Dad", 
    username: "dad",
    password: "password123"
  },
  { 
    name: "Brother", 
    username: "bro",
    password: "password123"
  },
  { 
    name: "Sister", 
    username: "sis",
    password: "password123"
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