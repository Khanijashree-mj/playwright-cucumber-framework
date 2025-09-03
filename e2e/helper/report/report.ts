// Simple report generator
const report = require("multiple-cucumber-html-reporter");

report.generate({
  jsonDir: "test-results/",
  reportPath: "test-results/reports/",
  metadata: {
    browser: {
      name: "chrome",
      version: "latest"
    },
    device: "Local test machine",
    platform: {
      name: "mac",
      version: "Latest"
    }
  }
});

console.log("✅ Simple HTML report generated");
