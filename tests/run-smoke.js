const { spawnSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync, rmdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join } = require('node:path');

const cucumber = join(dirname(require.resolve('@cucumber/cucumber/package.json')), 'bin', 'cucumber.js');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'saucedemo-smoke-'));
const currentReport = join(temporaryDirectory, 'scenarios.json');

try {
  const { status, signal, error } = spawnSync(process.execPath, [
    cucumber, '--tags', '@smoke', ...process.argv.slice(2), '--format', `json:"${currentReport}"`
  ], { stdio: 'inherit' });
  if (error) throw error;
  if (signal) throw new Error(`Cucumber terminated with ${signal}.`);
  process.exitCode = status;

  if (status === 0) {
    const report = JSON.parse(readFileSync(currentReport, 'utf8'));
    const hasScenario = report.some(feature => feature.elements.some(element => element.type === 'scenario'));
    if (!hasScenario) {
      console.error('Smoke check failed: Cucumber collected no @smoke scenarios.');
      process.exitCode = 1;
    }
  }
} finally {
  rmSync(currentReport, { force: true });
  rmdirSync(temporaryDirectory);
}
