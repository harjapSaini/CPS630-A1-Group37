const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "grocery-data.json");

function readData() { 
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); 
}


function writeData(data) { 
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8"); 
}

function findItem(data, id) {
  for (let i = 0; i < data.length; i++) { if (data[i].id === id) return i; }
  return -1;
}

function getNextId(data) {
  let maxId = 0;
  for (let i = 0; i < data.length; i++) { if (data[i].id > maxId) maxId = data[i].id; }
  return maxId + 1;
}

module.exports = {
  readData,
  writeData,
  findItem,
  getNextId
};