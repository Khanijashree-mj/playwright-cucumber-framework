// Simple report initialization - just creates directories
import * as fs from "fs";
import * as path from "path";

const dirs = [
  "test-results",
  "test-results/screenshots",
  "test-results/videos",
  "test-results/reports",
  "test-results/traces"
];

console.log("🚀 Initializing test directories...");

dirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    } else {
      console.log(`✓ Exists: ${dir}`);
    }
  } catch (error) {
    console.error(`❌ Error creating ${dir}:`, error instanceof Error ? error.message : String(error));
  }
});

console.log("✅ Test directories initialized\n");   
