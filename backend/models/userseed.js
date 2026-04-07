const User = require("./User");
const bcrypt = require("bcrypt");

const userData = [
  { 
    userId: 1,
    name: "Mom",
    username: "mom",
    password: "password123" 
  },
  { 
    userId: 2,
    name: "Dad", 
    username: "dad",
    password: "password123"
  },
  { 
    userId: 3,
    name: "Brother", 
    username: "bro",
    password: "password123"
  },
  { 
    userId: 4,
    name: "Sister", 
    username: "sis",
    password: "password123"
  }
];

async function seedUsers() {
  let count = await User.countDocuments();

  if (count === 0) {

    for (let i = 0; i < userData.length; i++) {
      userData[i].password = await bcrypt.hash(userData[i].password, 10);
    }

    await User.insertMany(userData);
    console.log("Users seeded with " + userData.length + " users");
  } else {
    console.log("Users already exist, skipping seed");
  }
}

module.exports = { seedUsers };