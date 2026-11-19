import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { SelectedItem } from '../types';
import { assertSelectedItems } from '../utils/CheckoutAssertions';

export class CartPage extends BasePage {
  private readonly continueShoppingButton: Locator;
  private readonly checkoutButton: Locator;
  private readonly cartContents: Locator;
  private readonly cartItems: Locator;
  private readonly cartBadge: Locator;

  constructor(page: Page, baseUrl?: string, timeout?: number) {
    super(page, baseUrl, timeout);
    this.continueShoppingButton = this.getElementByTestId('continue-shopping');
    this.checkoutButton = this.getElementByTestId('checkout');
    this.cartContents = this.getElementByTestId('cart-contents-container');
    this.cartItems = this.page.locator('.cart_item');
    this.cartBadge = this.getElementByTestId('shopping-cart-badge');
  }

  async expectToBeOnCartPage(): Promise<void> {
    await this.expectToBeAt('/cart.html');
    await this.uiExpect(this.cartContents).toBeVisible();
    await this.expectTitle('Your Cart');
  }

  async expectSelectedItems(selection: readonly SelectedItem[]): Promise<void> {
    assertSelectedItems('Cart', selection, await this.readItemRows('Cart', this.cartItems));
  }

  async expectCartToBeEmpty(): Promise<void> {
    await this.expectCartToHaveItems(0);
  }

  async expectCartToHaveItems(expectedCount: number): Promise<void> {
    await this.uiExpect(this.cartItems).toHaveCount(expectedCount);
  }

  async expectCartToContainItem(itemName: string): Promise<void> {
    await this.uiExpect(this.cartItem(itemName)).toBeVisible();
  }

  async removeItem(itemName: string): Promise<void> {
    await this.cartItem(itemName).getByRole('button', { name: 'Remove', exact: true }).click();
  }

  async clickContinueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async clickCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async expectContinueShoppingButtonToBeVisible(): Promise<void> {
    await this.uiExpect(this.continueShoppingButton).toBeVisible();
  }

  async expectContinueShoppingButtonToBeEnabled(): Promise<void> {
    await this.uiExpect(this.continueShoppingButton).toBeEnabled();
  }

  async expectCheckoutButtonToBeVisible(): Promise<void> {
    await this.uiExpect(this.checkoutButton).toBeVisible();
  }

  async expectCheckoutUnavailable(): Promise<void> {
    if (await this.checkoutButton.isVisible() && await this.checkoutButton.isEnabled()) {
      throw new Error('Empty cart checkout: expected unavailable or disabled, actual enabled.');
    }
  }

  async expectEmptyCartBadge(): Promise<void> {
    if (await this.cartBadge.isVisible()) {
      await this.uiExpect(this.cartBadge).toHaveText('0');
    }
  }

  private cartItem(itemName: string): Locator {
    return this.cartItems.filter({ hasText: itemName });
  }
}
