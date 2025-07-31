import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { CartItem } from '../types';

export class CartPage extends BasePage {
  // Header elements
  private readonly pageTitle: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly checkoutButton: Locator;

  // Cart content elements
  private readonly cartContents: Locator;
  private readonly cartItems: Locator;
  private readonly emptyCartMessage: Locator;

  // Item elements
  private readonly itemNames: Locator;
  private readonly itemDescriptions: Locator;
  private readonly itemPrices: Locator;
  private readonly itemQuantities: Locator;
  private readonly removeButtons: Locator;

  constructor(page: Page) {
    super(page);

    // Header elements
    this.pageTitle = this.page.locator('.title');
    this.continueShoppingButton = this.getElementByTestId('continue-shopping');
    this.checkoutButton = this.getElementByTestId('checkout');

    // Cart content
    this.cartContents = this.getElementByTestId('cart-contents');
    this.cartItems = this.page.locator('.cart_item');
    this.emptyCartMessage = this.page.locator('.cart_item:has-text("Your cart is empty")');

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

  async getCartItems(): Promise<CartItem[]> {
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
    const itemCount = await this.getCartItemCount();
    expect(itemCount).toBe(0);
  }

  async expectCartToHaveItems(expectedCount: number): Promise<void> {
    const itemCount = await this.getCartItemCount();
    expect(itemCount).toBe(expectedCount);
  }

  async expectCartToContainItem(itemName: string): Promise<void> {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: itemName });
    await this.expectElementToBeVisible(cartItem);
  }

  async expectCartToNotContainItem(itemName: string): Promise<void> {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: itemName });
    await expect(cartItem).toBeHidden();
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
    expect(await this.checkoutButton.isEnabled()).toBe(true);
  }

  async expectCheckoutButtonToBeDisabled(): Promise<void> {
    expect(await this.checkoutButton.isEnabled()).toBe(false);
  }

  // Get item details
  async getItemPrice(itemName: string): Promise<string> {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: itemName });
    const priceElement = cartItem.locator('.inventory_item_price');
    return await this.getText(priceElement);
  }

  async getItemDescription(itemName: string): Promise<string> {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: itemName });
    const descElement = cartItem.locator('.inventory_item_desc');
    return await this.getText(descElement);
  }

  async getItemQuantity(itemName: string): Promise<number> {
    const cartItem = this.page.locator('.cart_item').filter({ hasText: itemName });
    const quantityElement = cartItem.locator('.cart_quantity');
    const quantityText = await this.getText(quantityElement);
    return parseInt(quantityText) || 1;
  }

  // Calculate total (if needed for validation)
  async calculateTotalPrice(): Promise<number> {
    const items = await this.getCartItems();
    let total = 0;
    
    for (const item of items) {
      const price = parseFloat(item.price.replace('$', ''));
      total += price * item.quantity;
    }
    
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }
}
