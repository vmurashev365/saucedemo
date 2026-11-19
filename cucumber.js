const { styleText } = require('node:util');

const reportDir = process.env.REPORT_DIR || 'reports';

const common = {
  requireModule: ['tsx/cjs'],
  require: ['tests/step-definitions/**/*.ts', 'tests/hooks/**/*.ts'],
  plugin: ['./tests/reporting/failed-scenario-steps.mts'],
  format: [
    'summary',
    `html:${reportDir}/cucumber-report.html`,
    `json:${reportDir}/cucumber-report.json`
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  parallel: 1,
  retry: 0,
  tags: process.env.TAGS || 'not @skip',
  worldParameters: {
    // Cucumber's worker threads do not inherit the terminal's TTY stream.
    colorStepStatuses: styleText('green', 'PASS') !== 'PASS',
    browser: process.env.BROWSER || 'chromium',
    headed: process.env.HEADED !== 'false',
    debug: process.env.DEBUG === 'true',
    baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
    viewport: process.env.VIEWPORT || '1920x1080',
    timeout: Number(process.env.TIMEOUT) || 30_000
  }
};

module.exports = {
  default: { ...common, paths: ['tests/features/**/*.feature'] },
  file: common
};


