import { Page, Locator, expect } from '@playwright/test';
import { CartItem } from '../../types';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;
  protected readonly uiExpect: typeof expect;

  constructor(page: Page, baseUrl: string = 'https://www.saucedemo.com', timeout = 30_000) {
    this.page = page;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.uiExpect = expect.configure({ timeout });
  }

  // Common actions following DRY principles
  async navigateTo(path: string = ''): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async clickElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return await locator.textContent() ?? '';
  }

  async getElementCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  protected async readItemRows(surface: string, rows: Locator): Promise<CartItem[]> {
    const items: CartItem[] = [];
    for (const [index, row] of (await rows.all()).entries()) {
      const rowLabel = `${surface} row ${index + 1}`;
      const name = await this.readVisibleItemField(row.locator('.inventory_item_name'), `${rowLabel} name`);
      const itemLabel = `${rowLabel} (${name})`;
      const price = await this.readVisibleItemField(row.locator('.inventory_item_price'), `${itemLabel} price`);
      const quantityText = await this.readVisibleItemField(row.locator('.cart_quantity'), `${itemLabel} quantity`);
      items.push({ name, price, quantityText });
    }
    return items;
  }

  private async readVisibleItemField(field: Locator, label: string): Promise<string> {
    // Playwright's visibility filter includes zero-opacity elements.
    const values = await field.filter({ visible: true }).evaluateAll(elements => elements
      .filter(element => element.checkVisibility({ opacityProperty: true }))
      .map(element => (element as HTMLElement).innerText.trim()));

    if (values.length === 0) {
      const actual = await field.count() ? 'only hidden fields' : 'no matching field';
      throw new Error(`${label}: expected one visible field, actual ${actual}.`);
    }
    if (values.length > 1) {
      throw new Error(`${label}: expected one visible field, actual ${values.length} visible fields.`);
    }
    if (!values[0]) {
      throw new Error(`${label}: expected nonblank text, actual blank.`);
    }
    return values[0];
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isElementHidden(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'hidden', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  async expectElementToBeVisible(locator: Locator): Promise<void> {
    await this.uiExpect(locator).toBeVisible();
  }

  async expectElementToHaveText(locator: Locator, expectedText: string): Promise<void> {
    await this.uiExpect(locator).toHaveText(expectedText);
  }

  async expectElementToContainText(locator: Locator, expectedText: string): Promise<void> {
    await this.uiExpect(locator).toContainText(expectedText);
  }

  async expectPageToHaveURL(expectedUrl: string): Promise<void> {
    await this.uiExpect(this.page).toHaveURL(expectedUrl);
  }

  async expectPageToHaveTitle(expectedTitle: string): Promise<void> {
    await this.uiExpect(this.page).toHaveTitle(expectedTitle);
  }

  // Common selectors that might be used across pages
  protected getButtonByText(text: string): Locator {
    return this.page.locator(`button:has-text("${text}")`);
  }

  protected getLinkByText(text: string): Locator {
    return this.page.locator(`a:has-text("${text}")`);
  }

  protected getInputByPlaceholder(placeholder: string): Locator {
    return this.page.locator(`input[placeholder="${placeholder}"]`);
  }

  protected getElementByTestId(testId: string): Locator {
    return this.page.locator(`[data-test="${testId}"]`);
  }

  protected getElementById(id: string): Locator {
    return this.page.locator(`#${id}`);
  }

  protected getElementByClass(className: string): Locator {
    return this.page.locator(`.${className}`);
  }

  abstract isPageLoaded(): Promise<boolean>;
}
