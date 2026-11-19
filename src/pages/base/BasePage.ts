import { Page, Locator, expect } from '@playwright/test';
import { CartItem } from '../../types';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseUrl: string;
  protected readonly uiExpect: typeof expect;
  protected readonly pageTitle: Locator;

  constructor(page: Page, baseUrl: string = 'https://www.saucedemo.com', timeout = 30_000) {
    this.page = page;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.uiExpect = expect.configure({ timeout });
    this.pageTitle = page.locator('.title');
  }

  async navigateTo(path: string = ''): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  }

  async expectTitle(expectedTitle: string): Promise<void> {
    await this.uiExpect(this.pageTitle).toHaveText(expectedTitle);
  }

  protected async expectToBeAt(path: string): Promise<void> {
    await this.uiExpect(this.page).toHaveURL(`${this.baseUrl}${path}`);
  }

  protected async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return await locator.textContent() ?? '';
  }

  protected getElementByTestId(testId: string): Locator {
    return this.page.locator(`[data-test="${testId}"]`);
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
}
