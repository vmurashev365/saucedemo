import { Browser, Page, BrowserContext, chromium, firefox, webkit } from '@playwright/test';
import { TestConfig } from '../types';

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async launchBrowser(config: TestConfig): Promise<Browser> {
    const browserOptions = {
      headless: !config.headed, // Учитываем настройку headed из конфигурации
      slowMo: config.headed ? 300 : 0, // Замедление для видимого режима
      timeout: 60000,
      args: config.headed ? [
        '--no-sandbox',
        '--disable-dev-shm-usage', 
        '--disable-web-security',
        '--start-maximized', // Максимизированное окно для видимого режима
        '--window-size=1920,1080'
      ] : [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    };

    switch (config.browser) {
      case 'firefox':
        this.browser = await firefox.launch(browserOptions);
        break;
      case 'webkit':
        this.browser = await webkit.launch(browserOptions);
        break;
      default:
        this.browser = await chromium.launch(browserOptions);
    }

    return this.browser;
  }

  async createContext(browser: Browser, config: TestConfig): Promise<BrowserContext> {
    const [width, height] = config.viewport.split('x').map(Number);
    
    // Для headed режима используем null viewport (максимальный размер экрана)
    const viewportSettings = config.headed ? null : { width, height };
    
    this.context = await browser.newContext({
      viewport: viewportSettings,
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
      recordVideo: config.debug ? { dir: 'videos/' } : undefined,
      recordHar: config.debug ? { path: 'har/trace.har' } : undefined
    });

    return this.context;
  }

  async createPage(context: BrowserContext, config: TestConfig): Promise<Page> {
    this.page = await context.newPage();
    this.page.setDefaultTimeout(config.timeout);
    this.page.setDefaultNavigationTimeout(config.timeout);

    // Add console logging in debug mode
    if (config.debug) {
      this.page.on('console', msg => {
        console.log(`  Console ${msg.type()}: ${msg.text()}`);
      });

      this.page.on('pageerror', error => {
        console.error(` Page Error: ${error.message}`);
      });
    }

    return this.page;
  }

  async closeBrowser(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  getBrowser(): Browser | null {
    return this.browser;
  }

  getContext(): BrowserContext | null {
    return this.context;
  }

  getPage(): Page | null {
    return this.page;
  }
}
