import { Browser, Page, BrowserContext, chromium, firefox, webkit } from '@playwright/test';
import { TestConfig } from '../types';

const browserTypes = { chromium, firefox, webkit };

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async launchBrowser(config: TestConfig): Promise<Browser> {
    this.browser = await browserTypes[config.browser].launch({
      headless: !config.headed,
      slowMo: config.slowMo,
      timeout: config.timeout,
      // A headed Chromium window opens maximized; other engines use their default window.
      args: config.headed && config.browser === 'chromium' ? ['--start-maximized'] : []
    });
    return this.browser;
  }

  async createContext(browser: Browser, config: TestConfig): Promise<BrowserContext> {
    const [width, height] = config.viewport.split('x').map(Number);

    this.context = await browser.newContext({
      // Let a headed Chromium window use its native size.
      viewport: config.headed && config.browser === 'chromium' ? null : { width, height },
      recordVideo: config.debug ? { dir: 'videos/' } : undefined,
      recordHar: config.debug ? { path: 'har/trace.har' } : undefined
    });
    return this.context;
  }

  async createPage(context: BrowserContext, config: TestConfig): Promise<Page> {
    this.page = await context.newPage();
    this.page.setDefaultTimeout(config.timeout);
    this.page.setDefaultNavigationTimeout(config.timeout);

    if (config.debug) {
      this.page.on('console', msg => console.log(`  Console ${msg.type()}: ${msg.text()}`));
      this.page.on('pageerror', error => console.error(`  Page error: ${error.message}`));
    }
    return this.page;
  }

  async closeBrowser(): Promise<void> {
    // Closing the context closes its pages and flushes video and HAR files.
    const resources = [this.context, this.browser];
    this.page = null;
    this.context = null;
    this.browser = null;

    const errors: unknown[] = [];
    for (const resource of resources) {
      try {
        await resource?.close();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) throw new AggregateError(errors, 'Browser cleanup failed');
  }

  getPage(): Page | null {
    return this.page;
  }
}
