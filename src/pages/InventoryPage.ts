import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { SortOption } from '../types';
import { parseUsdCents } from '../utils/CheckoutAssertions';

export class InventoryPage extends BasePage {
  private readonly shoppingCartLink: Locator;
  private readonly shoppingCartBadge: Locator;
  private readonly inventoryContainer: Locator;
  private readonly inventoryItems: Locator;
  private readonly sortDropdown: Locator;
  private readonly productNames: Locator;
  private readonly productPrices: Locator;
  private readonly productDetailsName: Locator;

  constructor(page: Page, baseUrl?: string, timeout?: number) {
    super(page, baseUrl, timeout);
    this.shoppingCartLink = this.getElementByTestId('shopping-cart-link');
    this.shoppingCartBadge = this.getElementByTestId('shopping-cart-badge');
    this.inventoryContainer = this.getElementByTestId('inventory-container');
    this.inventoryItems = this.page.locator('.inventory_item');
    this.sortDropdown = this.getElementByTestId('product-sort-container');
    this.productNames = this.page.locator('.inventory_item_name');
    this.productPrices = this.page.locator('.inventory_item_price');
    this.productDetailsName = this.getElementByTestId('inventory-item-name');
  }

  async expectToBeOnInventoryPage(): Promise<void> {
    await Promise.all([
      this.expectToBeAt('/inventory.html'),
      this.uiExpect(this.inventoryContainer).toBeVisible(),
      this.expectTitle('Products')
    ]);
  }

  // Header
  async clickShoppingCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  async expectShoppingCartLinkVisible(): Promise<void> {
    await this.uiExpect(this.shoppingCartLink).toBeVisible();
  }

  async expectCartBadgeToShow(count: number): Promise<void> {
    if (count === 0) {
      await this.uiExpect(this.shoppingCartBadge).toBeHidden();
    } else {
      await this.uiExpect(this.shoppingCartBadge).toHaveText(String(count));
    }
  }

  // Product list
  async expectProductCount(expectedCount: number): Promise<void> {
    await this.uiExpect(this.inventoryItems).toHaveCount(expectedCount);
  }

  async expectEveryProductComplete(): Promise<void> {
    for (const card of await this.inventoryItems.all()) {
      await this.uiExpect(card.locator('.inventory_item_name')).toHaveText(/\S/);
      await this.uiExpect(card.locator('.inventory_item_desc')).toHaveText(/\S/);
      await this.uiExpect(card.locator('.inventory_item_price')).toHaveText(/^\$\d+\.\d{2}$/);
      await this.uiExpect(card.locator('.inventory_item_img img')).toBeVisible();
      await this.uiExpect(card.locator('.inventory_item_img img')).toHaveAttribute('src', /\S/);
    }
  }

  async expectEveryProductButton(label: string): Promise<void> {
    for (const card of await this.inventoryItems.all()) {
      await this.uiExpect(card.getByRole('button', { name: label, exact: true })).toBeVisible();
    }
  }

  async getProductNames(): Promise<string[]> {
    return await this.productNames.allInnerTexts();
  }

  async getProductPrice(productName: string): Promise<string> {
    return this.getText(this.productCard(productName).locator('.inventory_item_price'));
  }

  async addProductToCart(productName: string): Promise<void> {
    await this.cardButton(productName, 'Add to cart').click();
  }

  async removeProductFromCart(productName: string): Promise<void> {
    await this.cardButton(productName, 'Remove').click();
  }

  async expectCardButton(productName: string, label: string): Promise<void> {
    await this.uiExpect(this.cardButton(productName, label)).toBeVisible();
  }

  private productCard(name: string): Locator {
    return this.inventoryItems.filter({
      has: this.page.locator('.inventory_item_name').and(this.page.getByText(name, { exact: true }))
    });
  }

  private cardButton(productName: string, label: string): Locator {
    return this.productCard(productName).getByRole('button', { name: label, exact: true });
  }

  // Sorting
  async sortProducts(sortOption: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(sortOption);
    await this.uiExpect(this.sortDropdown).toHaveValue(sortOption);
  }

  async expectProductsSortedBy(sortOption: SortOption): Promise<void> {
    if (sortOption === 'az' || sortOption === 'za') {
      const names = (await this.productNames.allInnerTexts()).sort();
      await this.uiExpect(this.productNames).toHaveText(sortOption === 'az' ? names : names.reverse());
      return;
    }

    const cents = (price: string): number => {
      const value = parseUsdCents(price);
      if (value === undefined) {
        throw new Error(`Product price: expected USD with two decimals, actual ${JSON.stringify(price)}.`);
      }
      return value;
    };
    const prices = await this.productPrices.allInnerTexts();
    prices.sort((a, b) => sortOption === 'lohi' ? cents(a) - cents(b) : cents(b) - cents(a));
    await this.uiExpect(this.productPrices).toHaveText(prices);
  }

  // Product details
  async clickProductName(productName: string): Promise<void> {
    await this.productCard(productName).locator('.inventory_item_name').click();
  }

  async expectToBeOnProductDetailsPage(): Promise<void> {
    await this.uiExpect(this.page).toHaveURL(/\/inventory-item\.html\?id=\d+$/);
  }

  async expectProductDetails(productName: string): Promise<void> {
    await this.uiExpect(this.productDetailsName).toHaveText(productName);
  }
}
