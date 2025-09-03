// Simple report initialization - just creates directories
const fs = require("fs-extra");

// Create test results directories
fs.ensureDirSync("./test-results");
fs.ensureDirSync("./test-results/screenshots");
fs.ensureDirSync("./test-results/videos");
fs.ensureDirSync("./test-results/reports");

console.log("✅ Test directories initialized");
