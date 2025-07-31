import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { Product, SortOption } from '../types';

export class InventoryPage extends BasePage {
  // Header elements
  private readonly appLogo: Locator;
  private readonly burgerMenuButton: Locator;
  private readonly shoppingCartLink: Locator;
  private readonly shoppingCartBadge: Locator;

  // Inventory elements
  private readonly inventoryContainer: Locator;
  private readonly inventoryList: Locator;
  private readonly inventoryItems: Locator;
  private readonly sortDropdown: Locator;
  private readonly pageTitle: Locator;

  // Product item selectors
  private readonly productNames: Locator;
  private readonly productDescriptions: Locator;
  private readonly productPrices: Locator;
  private readonly productImages: Locator;
  private readonly addToCartButtons: Locator;
  private readonly removeFromCartButtons: Locator;

  constructor(page: Page) {
    super(page);

    // Header elements
    this.appLogo = this.page.locator('.app_logo');
    this.burgerMenuButton = this.getElementByTestId('open-menu');
    this.shoppingCartLink = this.getElementByTestId('shopping-cart-link');
    this.shoppingCartBadge = this.getElementByTestId('shopping-cart-badge');

    // Inventory elements
    this.inventoryContainer = this.getElementByTestId('inventory-container');
    this.inventoryList = this.getElementByTestId('inventory-list');
    this.inventoryItems = this.page.locator('.inventory_item');
    this.sortDropdown = this.getElementByTestId('product-sort-container');
    this.pageTitle = this.page.locator('.title');

    // Product elements
    this.productNames = this.page.locator('.inventory_item_name');
    this.productDescriptions = this.page.locator('.inventory_item_desc');
    this.productPrices = this.page.locator('.inventory_item_price');
    this.productImages = this.page.locator('.inventory_item_img img');
    this.addToCartButtons = this.page.locator('button[id^="add-to-cart"]');
    this.removeFromCartButtons = this.page.locator('button[id^="remove"]');
  }

  async isPageLoaded(): Promise<boolean> {
    return await this.isElementVisible(this.inventoryContainer) && 
           await this.isElementVisible(this.pageTitle);
  }

  async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  async expectToBeOnInventoryPage(): Promise<void> {
    await this.expectPageToHaveURL(`${this.baseUrl}/inventory.html`);
    await this.expectElementToBeVisible(this.inventoryContainer);
    await this.expectElementToHaveText(this.pageTitle, 'Products');
  }

  // Cart methods
  async getCartItemCount(): Promise<number> {
    if (await this.isElementVisible(this.shoppingCartBadge)) {
      const countText = await this.getText(this.shoppingCartBadge);
      return parseInt(countText) || 0;
    }
    return 0;
  }

  async clickShoppingCart(): Promise<void> {
    await this.clickElement(this.shoppingCartLink);
  }

  // Product methods
  async getProductCount(): Promise<number> {
    return await this.getElementCount(this.inventoryItems);
  }

  async getProductNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.productNames.count();
    for (let i = 0; i < count; i++) {
      names.push(await this.productNames.nth(i).textContent() ?? '');
    }
    return names;
  }

  async getProductPrices(): Promise<string[]> {
    const prices: string[] = [];
    const count = await this.productPrices.count();
    for (let i = 0; i < count; i++) {
      prices.push(await this.productPrices.nth(i).textContent() ?? '');
    }
    return prices;
  }

  async addProductToCart(productName: string): Promise<void> {
    const productItem = this.page.locator('.inventory_item').filter({ hasText: productName });
    const addButton = productItem.locator('button[id^="add-to-cart"]');
    await this.clickElement(addButton);
  }

  async removeProductFromCart(productName: string): Promise<void> {
    const productItem = this.page.locator('.inventory_item').filter({ hasText: productName });
    const removeButton = productItem.locator('button[id^="remove"]');
    await this.clickElement(removeButton);
  }

  async addProductToCartByIndex(index: number): Promise<void> {
    const addButton = this.addToCartButtons.nth(index);
    await this.clickElement(addButton);
  }

  async removeProductFromCartByIndex(index: number): Promise<void> {
    const removeButton = this.removeFromCartButtons.nth(index);
    await this.clickElement(removeButton);
  }

  async addAllProductsToCart(): Promise<void> {
    const count = await this.addToCartButtons.count();
    for (let i = 0; i < count; i++) {
      await this.clickElement(this.addToCartButtons.nth(i));
      // Small delay to avoid overwhelming the UI
      await this.page.waitForTimeout(100);
    }
  }

  async removeAllProductsFromCart(): Promise<void> {
    const count = await this.removeFromCartButtons.count();
    for (let i = 0; i < count; i++) {
      await this.clickElement(this.removeFromCartButtons.nth(i));
      await this.page.waitForTimeout(100);
    }
  }

  async getProductByName(productName: string): Promise<Product | null> {
    const productItem = this.page.locator('.inventory_item').filter({ hasText: productName });
    
    if (await productItem.count() === 0) {
      return null;
    }

    const name = await productItem.locator('.inventory_item_name').textContent() ?? '';
    const description = await productItem.locator('.inventory_item_desc').textContent() ?? '';
    const price = await productItem.locator('.inventory_item_price').textContent() ?? '';
    const imageSrc = await productItem.locator('.inventory_item_img img').getAttribute('src') ?? '';
    const addButton = productItem.locator('button[id^="add-to-cart"]');
    const id = await addButton.getAttribute('id') ?? '';

    return {
      name,
      description,
      price,
      imageSrc,
      id: id.replace('add-to-cart-', '')
    };
  }

  async clickProductName(productName: string): Promise<void> {
    const productLink = this.page.locator('.inventory_item_name').filter({ hasText: productName });
    await this.clickElement(productLink);
  }

  async clickProductImage(productName: string): Promise<void> {
    const productItem = this.page.locator('.inventory_item').filter({ hasText: productName });
    const productImage = productItem.locator('.inventory_item_img img');
    await this.clickElement(productImage);
  }

  // Sorting methods
  async sortProducts(sortOption: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(sortOption);
    await this.waitForPageLoad();
  }

  async getCurrentSortOption(): Promise<string> {
    return await this.sortDropdown.inputValue();
  }

  async expectProductsToBeInAlphabeticalOrder(): Promise<void> {
    const names = await this.getProductNames();
    const sortedNames = [...names].sort();
    expect(names).toEqual(sortedNames);
  }

  async expectProductsToBeInReverseAlphabeticalOrder(): Promise<void> {
    const names = await this.getProductNames();
    const sortedNames = [...names].sort().reverse();
    expect(names).toEqual(sortedNames);
  }

  async expectProductsToBeInPriceOrderLowToHigh(): Promise<void> {
    const prices = await this.getProductPrices();
    const numericPrices = prices.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    expect(numericPrices).toEqual(sortedPrices);
  }

  async expectProductsToBeInPriceOrderHighToLow(): Promise<void> {
    const prices = await this.getProductPrices();
    const numericPrices = prices.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...numericPrices].sort((a, b) => b - a);
    expect(numericPrices).toEqual(sortedPrices);
  }

  // Menu methods
  async openBurgerMenu(): Promise<void> {
    await this.clickElement(this.burgerMenuButton);
  }

  async expectCartBadgeToShow(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.shoppingCartBadge).toBeHidden();
    } else {
      await this.expectElementToHaveText(this.shoppingCartBadge, count.toString());
    }
  }

  async expectAddToCartButtonToBeVisible(productName: string): Promise<void> {
    const productItem = this.page.locator('.inventory_item').filter({ hasText: productName });
    const addButton = productItem.locator('button[id^="add-to-cart"]');
    await this.expectElementToBeVisible(addButton);
  }

  async expectRemoveButtonToBeVisible(productName: string): Promise<void> {
    const productItem = this.page.locator('.inventory_item').filter({ hasText: productName });
    const removeButton = productItem.locator('button[id^="remove"]');
    await this.expectElementToBeVisible(removeButton);
  }
}
