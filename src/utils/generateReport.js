const reporter = require('cucumber-html-reporter');
const path = require('path');

const options = {
  theme: 'bootstrap',
  jsonFile: 'reports/cucumber-report.json',
  output: 'reports/cucumber-report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    "App Version": "1.0.0",
    "Test Environment": "LOCAL",
    "Browser": "Chrome",
    "Platform": "Windows",
    "Parallel": "Scenarios",
    "Executed": new Date().toLocaleString()
  },
  failedSummaryReport: true,
  brandTitle: 'SauceDemo Test Report',
  name: 'Playwright Cucumber Test Results'
};

try {
  console.log(' Generating HTML report...');
  reporter.generate(options);
  console.log(' HTML report generated successfully!');
  console.log(' Report location: reports/cucumber-report.html');
} catch (error) {
  console.error(' Error generating report:', error);
  process.exit(1);
}
