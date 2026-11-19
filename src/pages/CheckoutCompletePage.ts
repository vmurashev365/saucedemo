import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';

export class CheckoutCompletePage extends BasePage {
  private readonly completeHeader: Locator;
  private readonly completeText: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page, baseUrl?: string, timeout?: number) {
    super(page, baseUrl, timeout);
    this.completeHeader = this.getElementByTestId('complete-header');
    this.completeText = this.getElementByTestId('complete-text');
    this.backHomeButton = this.getElementByTestId('back-to-products');
  }

  async expectToBeOnCheckoutCompletePage(): Promise<void> {
    await this.expectToBeAt('/checkout-complete.html');
    await this.expectTitle('Checkout: Complete!');
  }

  async clickBackHome(): Promise<void> {
    await this.backHomeButton.click();
  }

  async expectCompletionHeader(): Promise<void> {
    await this.uiExpect(this.completeHeader).toHaveText('Thank you for your order!');
  }

  async expectDispatchMessage(): Promise<void> {
    await this.uiExpect(this.completeText).toContainText('Your order has been dispatched');
  }

  async expectSuccessMessage(): Promise<void> {
    await this.expectCompletionHeader();
    await this.expectDispatchMessage();
  }
}
