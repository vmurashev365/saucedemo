import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { stripVTControlCharacters } from 'node:util';

// Each documented discrepancy must still fail at the step and with the diagnostic recorded in
// test_documents/checkout-review.md. Any other outcome means SauceDemo or the suite changed.
const known = [
  {
    id: 'TC-031',
    scenario: 'Attempt checkout with empty cart',
    step: 'checkout should be unavailable with an empty cart',
    diagnostic: /Empty cart checkout: expected unavailable or disabled, actual enabled\./,
    observed: 'Checkout stays enabled with an empty cart'
  },
  {
    id: 'TC-046',
    scenario: 'Cancel checkout from overview page',
    step: 'I should be redirected to the cart page',
    diagnostic: /Received: "[^"]*\/inventory\.html"/,
    observed: 'Cancel on the checkout overview opens Products instead of the cart'
  }
];

interface ReportScenario {
  name: string;
  steps: { name?: string; result: { status: string; error_message?: string } }[];
}

const reportDir = process.env.REPORT_DIR || 'reports/known-discrepancies';
const cucumber = join(dirname(require.resolve('@cucumber/cucumber/package.json')), 'bin', 'cucumber.js');
const run = spawnSync(process.execPath, [cucumber], {
  stdio: 'inherit',
  env: {
    ...process.env,
    TAGS: '@known-spec-discrepancy and not @skip',
    REPORT_DIR: reportDir,
    // The overview discrepancy waits for a URL that never arrives, so keep the wait short.
    TIMEOUT: process.env.TIMEOUT || '10000'
  }
});
if (run.error) throw run.error;

const report: { elements: ReportScenario[] }[] = JSON.parse(readFileSync(join(reportDir, 'cucumber-report.json'), 'utf8'));
const scenarios = report.flatMap(feature => feature.elements);
const problems: string[] = [];
const rows: string[] = [];

for (const scenario of scenarios) {
  if (!known.some(item => item.scenario === scenario.name)) {
    problems.push(`"${scenario.name}" is tagged @known-spec-discrepancy but is not registered in ${__filename}.`);
  }
}

for (const item of known) {
  const scenario = scenarios.find(candidate => candidate.name === item.scenario);
  const failed = scenario?.steps.find(step => step.result.status === 'failed');
  const diagnostic = stripVTControlCharacters(failed?.result.error_message ?? '');
  let status = 'reproduced';

  if (!scenario) {
    status = 'not collected';
    problems.push(`${item.id}: scenario "${item.scenario}" was not collected.`);
  } else if (!failed) {
    status = 'no longer reproduces';
    problems.push(`${item.id}: "${item.scenario}" passed. SauceDemo may now meet the spec. `
      + 'Remove @known-spec-discrepancy and update test_documents/checkout-review.md.');
  } else if (failed.name !== item.step || !item.diagnostic.test(diagnostic)) {
    status = 'failed differently';
    problems.push(`${item.id}: expected "${item.step}" to fail with ${item.diagnostic}, `
      + `actual "${failed.name}" failed with: ${diagnostic.split(/\r?\n/, 1)[0]}`);
  }
  rows.push(`| ${item.id} | ${item.observed} | ${status} |`);
}

const summary = [
  '### Known spec discrepancies',
  '',
  '| Case | Observed SauceDemo behavior | Status |',
  '| --- | --- | --- |',
  ...rows,
  ''
].join('\n');

console.log(`\n${summary}`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);

if (problems.length) {
  console.error(problems.map(problem => `- ${problem}`).join('\n'));
  process.exitCode = 1;
} else if (run.status !== 1) {
  console.error(`Expected Cucumber exit code 1 for the reproduced discrepancies, actual ${run.status}.`);
  process.exitCode = 1;
} else {
  console.log(`All ${known.length} documented discrepancies reproduced as recorded.`);
}
