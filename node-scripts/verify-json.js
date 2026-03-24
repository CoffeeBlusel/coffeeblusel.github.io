// validate-json.js
import fs from 'fs';

const filePath = './public/warframe_drops.json'; // make path relative

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) throw err;
  try {
    JSON.parse(data);
    console.log("JSON is valid!");
  } catch (e) {
    console.error("Invalid JSON:", e.message);
  }
});
