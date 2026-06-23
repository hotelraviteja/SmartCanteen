const fs = require('fs');
const path = require('path');

const results = [];
const logs = [];

module.exports = {
  init: () => {
    results.length = 0;
    logs.length = 0;
  },

  log: (message, level = 'info') => {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    logs.push(formatted);
    console.log(formatted);
  },

  addResult: (testName, passed, error = null) => {
    results.push({ testName, passed, error, timestamp: new Date().toISOString() });
  },

  generateAndPrint: async () => {
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    console.log('\n======================================');
    console.log('         E2E TEST REPORT              ');
    console.log('======================================');
    results.forEach((r, idx) => {
      const status = r.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${idx + 1}. ${r.testName}: ${status}`);
      if (r.error) {
        console.log(`   Error: ${r.error}`);
      }
    });
    console.log('======================================');
    console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log('======================================\n');

    // Write report to file
    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ results, logs, passed, failed }, null, 2));

    return { passed, failed };
  }
};
