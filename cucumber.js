module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['tests/step-definitions/**/*.ts', 'tests/hooks/**/*.ts'],
    format: [
      'progress-bar',
      '@cucumber/pretty-formatter', 
      'json:reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    publishQuiet: true,
    paths: ['tests/features/**/*.feature'],
    parallel: 1,
    retry: 0,
    tags: process.env.TAGS || 'not @skip',
    worldParameters: {
      browser: process.env.BROWSER || 'chromium',
      headed: process.env.HEADED === 'true',
      debug: process.env.DEBUG === 'true', 
      baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
      viewport: process.env.VIEWPORT || '1920x1080',
      timeout: parseInt(process.env.TIMEOUT) || 30000
    }
  }
};


