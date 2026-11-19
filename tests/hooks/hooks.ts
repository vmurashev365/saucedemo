import { After, AfterStep, Before, BeforeAll, BeforeStep, Status, formatterHelpers, setDefaultTimeout } from '@cucumber/cucumber';
import type { ITestStepHookParameter } from '@cucumber/cucumber';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { formatStepStatus } from '../reporting/failed-scenario-steps.mjs';
import { CustomWorld } from './World';

const actionTimeout = Number(process.env.TIMEOUT) || 30_000;
const reportDir = process.env.REPORT_DIR || 'reports';
const showGherkinProgress = process.env.SHOW_GHERKIN_PROGRESS?.toLowerCase() !== 'false';
const workerCount = Number(process.env.CUCUMBER_TOTAL_WORKERS);
const worker = Number(process.env.CUCUMBER_WORKER_ID) + 1;
const workerLabel = workerCount > 1 ? `[worker ${worker}/${workerCount}] ` : '';
let scenarioNumber = 0;
// Give Playwright time to report an action timeout before Cucumber ends the step.
setDefaultTimeout(actionTimeout + 1_000);

function printStepProgress({ gherkinDocument, pickleStep, result }: ITestStepHookParameter, color: boolean): void {
  const gherkinStepMap = formatterHelpers.GherkinDocumentParser.getGherkinStepMap(gherkinDocument);
  const keyword = formatterHelpers.PickleParser.getStepKeyword({ pickleStep, gherkinStepMap }).trim();
  const { status, duration } = result;
  const label = formatStepStatus(status, color);
  const milliseconds = Math.round(duration.seconds * 1000 + duration.nanos / 1_000_000);
  console.log(`  ${workerLabel}${label} · ${milliseconds} ms · ${keyword} ${pickleStep.text}`);
}

async function collect(world: CustomWorld, label: string, action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    world.log(`${label}: ${error}`);
  }
}

async function closeGroup(world: CustomWorld): Promise<void> {
  if (!world.traceGroupOpen) return;
  await world.context.tracing.groupEnd();
  world.traceGroupOpen = false;
}

BeforeAll(async function () {
  if (process.env.DEBUG === 'true') {
    await Promise.all(['videos', 'har'].map(dir => mkdir(dir, { recursive: true })));
  }
});

Before(function (this: CustomWorld, { pickle }) {
  if (showGherkinProgress) {
    scenarioNumber += 1;
    console.log(`\n${workerLabel}[${scenarioNumber}] Scenario: ${pickle.name}`);
  }
  return this.init();
});

BeforeStep(async function (this: CustomWorld, { pickleStep }) {
  if (!this.tracing) return;
  await collect(this, 'Could not start trace group', async () => {
    await this.context.tracing.group(pickleStep.text);
    this.traceGroupOpen = true;
  });
});

AfterStep(async function (this: CustomWorld, step) {
  if (showGherkinProgress) printStepProgress(step, this.parameters.colorStepStatuses === true);
  await collect(this, 'Could not close trace group', () => closeGroup(this));
});

After(async function (this: CustomWorld, { pickle, result, testCaseStartedId }) {
  const failed = result && result.status !== Status.PASSED && result.status !== Status.SKIPPED;
  // The Cucumber attempt ID distinguishes Examples rows, retries, and separate runs.
  const stem = `${pickle.name.replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 70)}-${testCaseStartedId}`;
  let screenshot: string | undefined;
  let trace: string | undefined;

  try {
    const page = this.browserManager.getPage();
    if (failed && page && !page.isClosed()) {
      await collect(this, 'Could not capture failure screenshot', async () => {
        await mkdir(join(reportDir, 'screenshots'), { recursive: true });
        const file = `screenshots/${stem}.png`;
        const image = await page.screenshot({ path: join(reportDir, file), fullPage: true });
        screenshot = file;
        this.attach(image, 'image/png');
      });
    }

    if (this.tracing) {
      await collect(this, 'Could not close remaining trace group', () => closeGroup(this));
      await collect(this, 'Could not stop Playwright tracing', async () => {
        if (failed) {
          await mkdir(join(reportDir, 'traces'), { recursive: true });
          const file = `traces/${stem}.zip`;
          await this.context.tracing.stop({ path: join(reportDir, file) });
          trace = file;
        } else {
          await this.context.tracing.stop();
        }
      });
    }

    if (failed) {
      this.attach(JSON.stringify({ url: page?.url(), screenshot, trace }, null, 2), 'application/json');
    }
  } finally {
    if (failed) {
      await collect(this, 'Could not close browser resources', () => this.cleanup());
    } else {
      await this.cleanup();
    }
  }
});
