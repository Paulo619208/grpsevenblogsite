const fs = require("fs");
const path = require("path");

function readJson(filePath, fallback) {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    if (!fileContents.trim()) {
      return fallback;
    }
    return JSON.parse(fileContents);
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getDataFilePath(fileName) {
  return path.join(__dirname, "..", "data", fileName);
}

module.exports = {
  readJson,
  writeJson,
  getDataFilePath
};
