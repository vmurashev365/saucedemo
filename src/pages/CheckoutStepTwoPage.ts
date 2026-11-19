import { Locator, Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { SelectedItem } from '../types';
import { assertPrice, assertSelectedItems } from '../utils/CheckoutAssertions';

export class CheckoutStepTwoPage extends BasePage {
  private readonly pageTitle: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;
  private readonly cartItems: Locator;
  private readonly summarySubtotal: Locator;
  private readonly summaryTax: Locator;
  private readonly summaryTotal: Locator;

  constructor(page: Page, baseUrl?: string, timeout?: number) {
    super(page, baseUrl, timeout);
    this.pageTitle = this.page.locator('.title');
    this.finishButton = this.getElementByTestId('finish');
    this.cancelButton = this.getElementByTestId('cancel');
    this.cartItems = this.page.locator('.cart_item');
    this.summarySubtotal = this.getElementByTestId('subtotal-label');
    this.summaryTax = this.getElementByTestId('tax-label');
    this.summaryTotal = this.getElementByTestId('total-label');
  }

  async isPageLoaded(): Promise<boolean> {
    return await this.isElementVisible(this.pageTitle) &&
      await this.isElementVisible(this.finishButton);
  }

  async expectToBeOnCheckoutStepTwoPage(): Promise<void> {
    await this.expectPageToHaveURL(`${this.baseUrl}/checkout-step-two.html`);
    await this.expectElementToHaveText(this.pageTitle, 'Checkout: Overview');
  }

  async clickFinish(): Promise<void> {
    await this.clickElement(this.finishButton);
  }

  async clickCancel(): Promise<void> {
    await this.clickElement(this.cancelButton);
  }

  async expectSelectedItems(selection: readonly SelectedItem[]): Promise<void> {
    await this.expectToBeOnCheckoutStepTwoPage();
    assertSelectedItems('Checkout overview', selection, await this.readItemRows('Checkout overview', this.cartItems));
  }

  async expectActionsAvailable(): Promise<void> {
    await Promise.all([this.finishButton, this.cancelButton].map(async button => {
      await this.expectElementToBeVisible(button);
      await this.uiExpect(button).toBeEnabled();
    }));
  }

  async expectSubtotal(expectedCents: number): Promise<void> {
    const field = await this.getText(this.summarySubtotal);
    assertPrice('Subtotal', expectedCents, field.replace(/^Item total:\s*/, ''));
  }

  async expectTax(expectedCents: number): Promise<void> {
    const field = await this.getText(this.summaryTax);
    assertPrice('Tax', expectedCents, field.replace(/^Tax:\s*/, ''));
  }

  async expectTotal(expectedCents: number): Promise<void> {
    const field = await this.getText(this.summaryTotal);
    assertPrice('Total', expectedCents, field.replace(/^Total:\s*/, ''));
  }
}
