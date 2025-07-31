import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { CartItem } from '../types';

export class CheckoutStepTwoPage extends BasePage {
  // Header elements
  private readonly pageTitle: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;

  // Order summary elements
  private readonly cartItems: Locator;
  private readonly paymentInformation: Locator;
  private readonly shippingInformation: Locator;
  private readonly priceTotal: Locator;
  private readonly summarySubtotal: Locator;
  private readonly summaryTax: Locator;
  private readonly summaryTotal: Locator;

  // Item elements
  private readonly itemNames: Locator;
  private readonly itemDescriptions: Locator;
  private readonly itemPrices: Locator;
  private readonly itemQuantities: Locator;

  constructor(page: Page) {
    super(page);

    // Header elements
    this.pageTitle = this.page.locator('.title');
    this.finishButton = this.getElementByTestId('finish');
    this.cancelButton = this.getElementByTestId('cancel');

    // Order summary elements
    this.cartItems = this.page.locator('.cart_item');
    this.paymentInformation = this.getElementByTestId('payment-info-label');
    this.shippingInformation = this.getElementByTestId('shipping-info-label');
    this.priceTotal = this.getElementByTestId('total-info-label');
    this.summarySubtotal = this.getElementByTestId('subtotal-label');
    this.summaryTax = this.getElementByTestId('tax-label');
    this.summaryTotal = this.getElementByTestId('total-label');

    // Item elements
    this.itemNames = this.page.locator('.inventory_item_name');
    this.itemDescriptions = this.page.locator('.inventory_item_desc');
    this.itemPrices = this.page.locator('.inventory_item_price');
    this.itemQuantities = this.page.locator('.cart_quantity');
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

  // Order summary methods
  async getOrderItems(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    const count = await this.cartItems.count();

    for (let i = 0; i < count; i++) {
      const item = this.cartItems.nth(i);
      const name = await item.locator('.inventory_item_name').textContent() ?? '';
      const price = await item.locator('.inventory_item_price').textContent() ?? '';
      const quantityText = await item.locator('.cart_quantity').textContent() ?? '1';
      const quantity = parseInt(quantityText) || 1;

      items.push({ name, price, quantity });
    }

    return items;
  }

  async getOrderItemCount(): Promise<number> {
    return await this.getElementCount(this.cartItems);
  }

  async getSubtotal(): Promise<string> {
    return await this.getText(this.summarySubtotal);
  }

  async getTax(): Promise<string> {
    return await this.getText(this.summaryTax);
  }

  async getTotal(): Promise<string> {
    return await this.getText(this.summaryTotal);
  }

  async getPaymentInformation(): Promise<string> {
    return await this.getText(this.paymentInformation);
  }

  async getShippingInformation(): Promise<string> {
    return await this.getText(this.shippingInformation);
  }

  // Price calculation methods
  async calculateExpectedSubtotal(): Promise<number> {
    const items = await this.getOrderItems();
    let subtotal = 0;

    for (const item of items) {
      const price = parseFloat(item.price.replace('$', ''));
      subtotal += price * item.quantity;
    }

    return Math.round(subtotal * 100) / 100;
  }

  async calculateExpectedTax(taxRate: number = 0.08): Promise<number> {
    const subtotal = await this.calculateExpectedSubtotal();
    return Math.round(subtotal * taxRate * 100) / 100;
  }

  async calculateExpectedTotal(taxRate: number = 0.08): Promise<number> {
    const subtotal = await this.calculateExpectedSubtotal();
    const tax = await this.calculateExpectedTax(taxRate);
    return Math.round((subtotal + tax) * 100) / 100;
  }

  // Validation methods
  async expectOrderToContainItem(itemName: string): Promise<void> {
    const orderItem = this.page.locator('.cart_item').filter({ hasText: itemName });
    await this.expectElementToBeVisible(orderItem);
  }

  async expectSubtotalToBeCorrect(): Promise<void> {
    const expectedSubtotal = await this.calculateExpectedSubtotal();
    const actualSubtotalText = await this.getSubtotal();
    const actualSubtotal = parseFloat(actualSubtotalText.replace(/[^0-9.]/g, ''));
    
    expect(actualSubtotal).toBe(expectedSubtotal);
  }

  async expectTotalToBeCorrect(taxRate: number = 0.08): Promise<void> {
    const expectedTotal = await this.calculateExpectedTotal(taxRate);
    const actualTotalText = await this.getTotal();
    const actualTotal = parseFloat(actualTotalText.replace(/[^0-9.]/g, ''));
    
    expect(actualTotal).toBe(expectedTotal);
  }

  async expectFinishButtonToBeVisible(): Promise<void> {
    await this.expectElementToBeVisible(this.finishButton);
  }

  async expectCancelButtonToBeVisible(): Promise<void> {
    await this.expectElementToBeVisible(this.cancelButton);
  }

  async expectPaymentInformationToBeVisible(): Promise<void> {
    await this.expectElementToBeVisible(this.paymentInformation);
  }

  async expectShippingInformationToBeVisible(): Promise<void> {
    await this.expectElementToBeVisible(this.shippingInformation);
  }

  async expectOrderSummaryToBeCorrect(expectedItemCount: number): Promise<void> {
    const actualItemCount = await this.getOrderItemCount();
    expect(actualItemCount).toBe(expectedItemCount);
    
    await this.expectSubtotalToBeCorrect();
    await this.expectTotalToBeCorrect();
    await this.expectPaymentInformationToBeVisible();
    await this.expectShippingInformationToBeVisible();
  }
}
