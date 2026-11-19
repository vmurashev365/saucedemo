const { styleText } = require('node:util');

const reportDir = process.env.REPORT_DIR || 'reports';
const paths = ['tests/features/**/*.feature'];

// Known spec discrepancies have their own command, which verifies that they still reproduce.
const regressionTags = 'not @skip and not @known-spec-discrepancy';

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
  tags: process.env.TAGS || regressionTags,
  worldParameters: {
    // Cucumber's worker threads do not inherit the terminal's TTY stream.
    colorStepStatuses: styleText('green', 'PASS') !== 'PASS',
    browser: process.env.BROWSER || 'chromium',
    headed: process.env.HEADED === 'true',
    slowMo: Number(process.env.SLOW_MO) || 0,
    debug: process.env.DEBUG === 'true',
    baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
    viewport: process.env.VIEWPORT || '1920x1080',
    timeout: Number(process.env.TIMEOUT) || 30_000
  }
};

module.exports = {
  default: { ...common, paths },
  all: { ...common, paths, tags: process.env.TAGS || 'not @skip' },
  file: common
};
