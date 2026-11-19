import { After, Before, BeforeAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { mkdirSync } from 'node:fs';
import { CustomWorld } from './World';

const actionTimeout = Number(process.env.TIMEOUT) || 30_000;
// Let a timed-out Playwright action report its own error before Cucumber stops the step.
setDefaultTimeout(actionTimeout + 1_000);

BeforeAll(function () {
  for (const directory of ['screenshots', 'videos', 'har']) {
    mkdirSync(directory, { recursive: true });
  }
});

Before(function (this: CustomWorld) {
  return this.init();
});

After(async function (this: CustomWorld, scenario) {
  try {
    if (scenario.result?.status === Status.FAILED && this.page) {
      const name = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
      this.attach(await this.takeScreenshot(`FAILED-${name}`), 'image/png');

      const metadata = {
        url: this.page.url(),
        userAgent: await this.page.evaluate(() => navigator.userAgent).catch(() => 'unknown'),
        timestamp: new Date().toISOString()
      };
      this.attach(JSON.stringify(metadata, null, 2), 'application/json');
    }
  } finally {
    await this.cleanup();
  }
});
