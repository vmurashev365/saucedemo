import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { SelectedItem } from '../types';
import { assertSelectedItems } from '../utils/CheckoutAssertions';

export class CartPage extends BasePage {
  // Header elements
  private readonly pageTitle: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly checkoutButton: Locator;

  // Cart content elements
  private readonly cartContents: Locator;
  private readonly cartItems: Locator;
  private readonly cartBadge: Locator;

  // Item elements
  private readonly itemNames: Locator;
  private readonly itemDescriptions: Locator;
  private readonly itemPrices: Locator;
  private readonly itemQuantities: Locator;
  private readonly removeButtons: Locator;

  constructor(page: Page, baseUrl?: string, timeout?: number) {
    super(page, baseUrl, timeout);

    // Header elements
    this.pageTitle = this.page.locator('.title');
    this.continueShoppingButton = this.getElementByTestId('continue-shopping');
    this.checkoutButton = this.getElementByTestId('checkout');

    // Cart content
    this.cartContents = this.getElementByTestId('cart-contents-container');
    this.cartItems = this.page.locator('.cart_item');
    this.cartBadge = this.getElementByTestId('shopping-cart-badge');

    // Item elements
    this.itemNames = this.page.locator('.inventory_item_name');
    this.itemDescriptions = this.page.locator('.inventory_item_desc');
    this.itemPrices = this.page.locator('.inventory_item_price');
    this.itemQuantities = this.page.locator('.cart_quantity');
    this.removeButtons = this.page.locator('button[id^="remove"]');
  }

  async isPageLoaded(): Promise<boolean> {
    return await this.isElementVisible(this.pageTitle) && 
           await this.isElementVisible(this.cartContents);
  }

  async expectToBeOnCartPage(): Promise<void> {
    await this.expectPageToHaveURL(`${this.baseUrl}/cart.html`);
    await this.expectElementToBeVisible(this.cartContents);
    await this.expectElementToHaveText(this.pageTitle, 'Your Cart');
  }

  async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  // Cart item methods
  async getCartItemCount(): Promise<number> {
    return await this.getElementCount(this.cartItems);
  }

  async expectSelectedItems(selection: readonly SelectedItem[]): Promise<void> {
    assertSelectedItems('Cart', selection, await this.readItemRows(this.cartItems));
  }

  async getCartItemNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.itemNames.count();
    
    for (let i = 0; i < count; i++) {
      names.push(await this.itemNames.nth(i).textContent() ?? '');
    }
    
    return names;
  }

  async isCartEmpty(): Promise<boolean> {
    const itemCount = await this.getCartItemCount();
    return itemCount === 0;
  }

  async expectCartToBeEmpty(): Promise<void> {
    await this.expectCartToHaveItems(0);
  }

  async expectCartToHaveItems(expectedCount: number): Promise<void> {
    await this.uiExpect(this.cartItems).toHaveCount(expectedCount);
  }

  async expectCartToContainItem(itemName: string): Promise<void> {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: itemName });
    await this.expectElementToBeVisible(cartItem);
  }

  async expectCartToNotContainItem(itemName: string): Promise<void> {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: itemName });
    await this.uiExpect(cartItem).toBeHidden();
  }

  // Remove items methods
  async removeItem(itemName: string): Promise<void> {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: itemName });
    const removeButton = cartItem.locator('button[id^="remove"]');
    await this.clickElement(removeButton);
  }

  async removeItemByIndex(index: number): Promise<void> {
    const removeButton = this.removeButtons.nth(index);
    await this.clickElement(removeButton);
  }

  async removeAllItems(): Promise<void> {
    const count = await this.removeButtons.count();
    
    // Remove items one by one (removing from the end to avoid index shifting)
    for (let i = count - 1; i >= 0; i--) {
      await this.clickElement(this.removeButtons.nth(i));
      await this.page.waitForTimeout(100); // Small delay to let DOM update
    }
  }

  // Navigation methods
  async clickContinueShopping(): Promise<void> {
    await this.clickElement(this.continueShoppingButton);
  }

  async clickCheckout(): Promise<void> {
    await this.clickElement(this.checkoutButton);
  }

  // Validation methods
  async expectContinueShoppingButtonToBeVisible(): Promise<void> {
    await this.expectElementToBeVisible(this.continueShoppingButton);
  }

  async expectCheckoutButtonToBeVisible(): Promise<void> {
    await this.expectElementToBeVisible(this.checkoutButton);
  }

  async expectCheckoutButtonToBeEnabled(): Promise<void> {
    await this.uiExpect(this.checkoutButton).toBeEnabled();
  }

  async expectCheckoutUnavailable(): Promise<void> {
    if (await this.checkoutButton.isVisible() && await this.checkoutButton.isEnabled()) {
      throw new Error('Empty cart checkout: expected unavailable or disabled, actual enabled.');
    }
  }

  async expectEmptyCartBadge(): Promise<void> {
    if (await this.cartBadge.isVisible()) {
      await this.expectElementToHaveText(this.cartBadge, '0');
    }
  }

  async getItemDescription(itemName: string): Promise<string> {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: itemName });
    const descElement = cartItem.locator('.inventory_item_desc');
    return await this.getText(descElement);
  }
}
