const fs = require("fs");
const path = require("path");

// path to our grocery data file
const DATA_FILE = path.join(__dirname, "grocery-data.json");

// reads the json file and returns the data as an array
function readData() {
  let raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// saves data back to the json file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// find item by id, returns the index in the array
// returns -1 if not found
function findItem(data, id) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === id) {
      return i;
    }
  }
  return -1;
}

// figures out the next available id
function getNextId(data) {
  let maxId = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].id > maxId) {
      maxId = data[i].id;
    }
  }
  return maxId + 1;
}

module.exports = {
  readData,
  writeData,
  findItem,
  getNextId
};