import { Page, Browser, BrowserContext } from '@playwright/test';
import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { BrowserManager } from '../../src/utils/BrowserManager';
import { TestConfig } from '../../src/types';

// Page Objects
import { LoginPage } from '../../src/pages/LoginPage';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { CartPage } from '../../src/pages/CartPage';
import { CheckoutStepOnePage } from '../../src/pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../../src/pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../../src/pages/CheckoutCompletePage';

export class CustomWorld extends World {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public config!: TestConfig;
  public browserManager!: BrowserManager;

  // Page Objects
  public loginPage!: LoginPage;
  public inventoryPage!: InventoryPage;
  public cartPage!: CartPage;
  public checkoutStepOnePage!: CheckoutStepOnePage;
  public checkoutStepTwoPage!: CheckoutStepTwoPage;
  public checkoutCompletePage!: CheckoutCompletePage;

  // Test data storage
  public testData: { [key: string]: any } = {};

  constructor(options: IWorldOptions) {
    super(options);
    this.browserManager = new BrowserManager();
    this.initializeConfig();
  }

  private initializeConfig(): void {
    this.config = {
      browser: (this.parameters?.browser as 'chromium' | 'firefox' | 'webkit') || 'chromium',
      headed: this.parameters?.headed !== false,
      debug: this.parameters?.debug || false,
      baseUrl: this.parameters?.baseUrl || 'https://www.saucedemo.com',
      viewport: this.parameters?.viewport || '1920x1080',
      timeout: this.parameters?.timeout || 30000
    };
  }

  async init(): Promise<void> {
    this.browser = await this.browserManager.launchBrowser(this.config);
    this.context = await this.browserManager.createContext(this.browser, this.config);
    this.page = await this.browserManager.createPage(this.context, this.config);
    
    // Initialize page objects
    this.initializePageObjects();
  }

  private initializePageObjects(): void {
    const { baseUrl } = this.config;
    this.loginPage = new LoginPage(this.page, baseUrl);
    this.inventoryPage = new InventoryPage(this.page, baseUrl);
    this.cartPage = new CartPage(this.page, baseUrl);
    this.checkoutStepOnePage = new CheckoutStepOnePage(this.page, baseUrl);
    this.checkoutStepTwoPage = new CheckoutStepTwoPage(this.page, baseUrl);
    this.checkoutCompletePage = new CheckoutCompletePage(this.page, baseUrl);
  }

  async cleanup(): Promise<void> {
    await this.browserManager.closeBrowser();
  }

  // Helper methods for test data storage
  setTestData(key: string, value: any): void {
    this.testData[key] = value;
  }

  getTestData(key: string): any {
    return this.testData[key];
  }

  hasTestData(key: string): boolean {
    return key in this.testData;
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${name}-${timestamp}.png`;
    return this.page.screenshot({
      path: `screenshots/${fileName}`,
      fullPage: true
    });
  }

  // Navigation helpers
  async navigateToHomePage(): Promise<void> {
    await this.loginPage.navigateTo();
  }

  async navigateToInventoryPage(): Promise<void> {
    await this.inventoryPage.navigateTo('/inventory.html');
  }

  async navigateToCartPage(): Promise<void> {
    await this.cartPage.navigateTo('/cart.html');
  }
}

setWorldConstructor(CustomWorld);
