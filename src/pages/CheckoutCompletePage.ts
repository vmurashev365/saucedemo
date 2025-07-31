import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';

export class CheckoutCompletePage extends BasePage {
  // Success elements
  private readonly pageTitle: Locator;
  private readonly completeHeader: Locator;
  private readonly completeText: Locator;
  private readonly backHomeButton: Locator;
  private readonly successIcon: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = this.page.locator('.title');
    this.completeHeader = this.getElementByTestId('complete-header');
    this.completeText = this.getElementByTestId('complete-text');
    this.backHomeButton = this.getElementByTestId('back-to-products');
    this.successIcon = this.page.locator('.pony_express');
  }

  async isPageLoaded(): Promise<boolean> {
    return await this.isElementVisible(this.pageTitle) && 
           await this.isElementVisible(this.completeHeader);
  }

  async expectToBeOnCheckoutCompletePage(): Promise<void> {
    await this.expectPageToHaveURL(`${this.baseUrl}/checkout-complete.html`);
    await this.expectElementToHaveText(this.pageTitle, 'Checkout: Complete!');
  }

  async getCompleteHeader(): Promise<string> {
    return await this.getText(this.completeHeader);
  }

  async getCompleteText(): Promise<string> {
    return await this.getText(this.completeText);
  }

  async clickBackHome(): Promise<void> {
    await this.clickElement(this.backHomeButton);
  }

  async expectSuccessMessage(): Promise<void> {
    await this.expectElementToHaveText(this.completeHeader, 'Thank you for your order!');
    await this.expectElementToContainText(this.completeText, 'Your order has been dispatched');
  }

  async expectSuccessIconToBeVisible(): Promise<void> {
    await this.expectElementToBeVisible(this.successIcon);
  }

  async expectBackHomeButtonToBeVisible(): Promise<void> {
    await this.expectElementToBeVisible(this.backHomeButton);
  }
}
