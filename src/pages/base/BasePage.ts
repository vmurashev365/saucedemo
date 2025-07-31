import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page, baseUrl: string = 'https://www.saucedemo.com') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  // Common actions following DRY principles
  async navigateTo(path: string = ''): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`);
    await this.waitForPageLoad();
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
    await expect(locator).toBeVisible();
  }

  async expectElementToHaveText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toHaveText(expectedText);
  }

  async expectElementToContainText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toContainText(expectedText);
  }

  async expectPageToHaveURL(expectedUrl: string): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  async expectPageToHaveTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
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
