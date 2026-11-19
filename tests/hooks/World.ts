import { Page, Browser, BrowserContext, expect } from '@playwright/test';
import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { BrowserManager } from '../../src/utils/BrowserManager';
import { SelectedItem, TestConfig } from '../../src/types';
import { assertPrice, referencePriceCents } from '../../src/utils/CheckoutAssertions';
import { DataHelper } from '../../src/utils/DataHelper';

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
  public config: TestConfig;
  public browserManager = new BrowserManager();
  public tracing = false;
  public traceGroupOpen = false;

  // Page Objects
  public loginPage!: LoginPage;
  public inventoryPage!: InventoryPage;
  public cartPage!: CartPage;
  public checkoutStepOnePage!: CheckoutStepOnePage;
  public checkoutStepTwoPage!: CheckoutStepTwoPage;
  public checkoutCompletePage!: CheckoutCompletePage;

  private readonly selectedItems = new Map<string, SelectedItem>();

  constructor(options: IWorldOptions) {
    super(options);
    this.config = {
      browser: this.parameters?.browser || 'chromium',
      headed: this.parameters?.headed === true,
      slowMo: this.parameters?.slowMo || 0,
      debug: this.parameters?.debug === true,
      baseUrl: this.parameters?.baseUrl || 'https://www.saucedemo.com',
      viewport: this.parameters?.viewport || '1920x1080',
      timeout: this.parameters?.timeout || 30_000
    };
  }

  async init(): Promise<void> {
    this.browser = await this.browserManager.launchBrowser(this.config);
    this.context = await this.browserManager.createContext(this.browser, this.config);
    try {
      await this.context.tracing.start({ screenshots: true, snapshots: true });
      this.tracing = true;
    } catch (error) {
      this.log(`Could not start Playwright tracing: ${error}`);
    }
    this.page = await this.browserManager.createPage(this.context, this.config);

    const { baseUrl, timeout } = this.config;
    this.loginPage = new LoginPage(this.page, baseUrl, timeout);
    this.inventoryPage = new InventoryPage(this.page, baseUrl, timeout);
    this.cartPage = new CartPage(this.page, baseUrl, timeout);
    this.checkoutStepOnePage = new CheckoutStepOnePage(this.page, baseUrl, timeout);
    this.checkoutStepTwoPage = new CheckoutStepTwoPage(this.page, baseUrl, timeout);
    this.checkoutCompletePage = new CheckoutCompletePage(this.page, baseUrl, timeout);
  }

  get selection(): readonly SelectedItem[] {
    return [...this.selectedItems.values()];
  }

  async selectProduct(name: string): Promise<void> {
    const reference = referencePriceCents(name, DataHelper.getReferencePrice(name));
    const displayedPrice = await this.inventoryPage.getProductPrice(name);
    const catalogPriceCents = assertPrice(`Catalog price for ${name}`, reference, displayedPrice);
    await this.inventoryPage.addProductToCart(name);
    this.selectedItems.set(name, { name, catalogPriceCents, expectedQuantity: 1 });
  }

  forgetProduct(name: string): void {
    this.selectedItems.delete(name);
  }

  async expectPageTitle(title: string): Promise<void> {
    // Every SauceDemo page after login renders its title in the shared header.
    await expect(this.page.locator('.title')).toHaveText(title, { timeout: this.config.timeout });
  }

  async cleanup(): Promise<void> {
    await this.browserManager.closeBrowser();
  }
}

setWorldConstructor(CustomWorld);
