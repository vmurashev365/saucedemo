import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/World';
import { DataHelper } from '../../src/utils/DataHelper';

// Inventory viewing steps
Then('I should see {int} products displayed', async function (this: CustomWorld, expectedCount: number) {
  const actualCount = await this.inventoryPage.getProductCount();
  expect(actualCount).toBe(expectedCount);
});

Then('each product should have a name, description, price, and image', async function (this: CustomWorld) {
  const productCount = await this.inventoryPage.getProductCount();
  
  for (let i = 0; i < productCount; i++) {
    const productItem = this.page.locator('.inventory_item').nth(i);
    
    // Check name
    const nameElement = productItem.locator('.inventory_item_name');
    await expect(nameElement).toBeVisible();
    const name = await nameElement.textContent();
    expect(name).toBeTruthy();
    
    // Check description
    const descElement = productItem.locator('.inventory_item_desc');
    await expect(descElement).toBeVisible();
    const description = await descElement.textContent();
    expect(description).toBeTruthy();
    
    // Check price
    const priceElement = productItem.locator('.inventory_item_price');
    await expect(priceElement).toBeVisible();
    const price = await priceElement.textContent();
    expect(price).toMatch(/^\$\d+\.\d{2}$/);
    
    // Check image
    const imageElement = productItem.locator('.inventory_item_img img');
    await expect(imageElement).toBeVisible();
    const imageSrc = await imageElement.getAttribute('src');
    expect(imageSrc).toBeTruthy();
  }
});

Then('each product should have an {string} button', async function (this: CustomWorld, buttonText: string) {
  const productCount = await this.inventoryPage.getProductCount();
  
  for (let i = 0; i < productCount; i++) {
    const productItem = this.page.locator('.inventory_item').nth(i);
    const button = productItem.locator(`button:has-text("${buttonText}")`);
    await expect(button).toBeVisible();
  }
});

// Cart management steps
When('I add {string} to the cart', async function (this: CustomWorld, productName: string) {
  await this.inventoryPage.addProductToCart(productName);
  // Store added product for later use
  const addedProducts = this.getTestData('addedProducts') || [];
  addedProducts.push(productName);
  this.setTestData('addedProducts', addedProducts);
});

Given('I have added {string} to the cart', async function (this: CustomWorld, productName: string) {
  await this.inventoryPage.addProductToCart(productName);
  const addedProducts = this.getTestData('addedProducts') || [];
  addedProducts.push(productName);
  this.setTestData('addedProducts', addedProducts);
});

Given('I have added the following items to the cart:', async function (this: CustomWorld, dataTable) {
  const products = dataTable.raw().flat();
  for (const productName of products) {
    await this.inventoryPage.addProductToCart(productName);
  }
  this.setTestData('addedProducts', products);
});

Given('I have also added {string} to the cart', async function (this: CustomWorld, productName: string) {
  // Go back to inventory page if not already there
  const currentUrl = this.page.url();
  if (!currentUrl.includes('/inventory.html')) {
    await this.inventoryPage.navigateTo('/inventory.html');
  }
  
  await this.inventoryPage.addProductToCart(productName);
  const addedProducts = this.getTestData('addedProducts') || [];
  addedProducts.push(productName);
  this.setTestData('addedProducts', addedProducts);
});

When('I add all products to the cart', async function (this: CustomWorld) {
  // Получаем все названия продуктов для корректного обновления данных
  const productNames = await this.inventoryPage.getProductNames();
  
  // Добавляем товары по одному с небольшой задержкой
  for (const productName of productNames) {
    await this.inventoryPage.addProductToCart(productName);
    await this.page.waitForTimeout(100); // Небольшая задержка между добавлениями
  }
  
  this.setTestData('addedProducts', productNames);
});

Then('the shopping cart badge should show {string}', async function (this: CustomWorld, expectedCount: string) {
  await this.inventoryPage.expectCartBadgeToShow(parseInt(expectedCount));
});

Then('the shopping cart badge should not be visible', async function (this: CustomWorld) {
  await this.inventoryPage.expectCartBadgeToShow(0);
});

Then('the {string} button should change to {string} for {string}', async function (this: CustomWorld, fromButton: string, toButton: string, productName: string) {
  if (toButton === 'Remove') {
    await this.inventoryPage.expectRemoveButtonToBeVisible(productName);
  } else {
    await this.inventoryPage.expectAddToCartButtonToBeVisible(productName);
  }
});

Then('all {string} buttons should be changed to {string}', async function (this: CustomWorld, fromButton: string, toButton: string) {
  const productCount = await this.inventoryPage.getProductCount();
  
  for (let i = 0; i < productCount; i++) {
    const productItem = this.page.locator('.inventory_item').nth(i);
    const button = productItem.locator(`button:has-text("${toButton}")`);
    await expect(button).toBeVisible();
  }
});

// Sorting steps
When('I sort products by {string}', async function (this: CustomWorld, sortOption: string) {
  await this.inventoryPage.sortProducts(sortOption as any);
});

Then('products should be sorted by {string}', async function (this: CustomWorld, sortOption: string) {
  switch (sortOption) {
    case 'az':
      await this.inventoryPage.expectProductsToBeInAlphabeticalOrder();
      break;
    case 'za':
      await this.inventoryPage.expectProductsToBeInReverseAlphabeticalOrder();
      break;
    case 'lohi':
      await this.inventoryPage.expectProductsToBeInPriceOrderLowToHigh();
      break;
    case 'hilo':
      await this.inventoryPage.expectProductsToBeInPriceOrderHighToLow();
      break;
    default:
      throw new Error(`Unknown sort option: ${sortOption}`);
  }
});

// Product navigation steps
When('I click on {string} product name', async function (this: CustomWorld, productName: string) {
  await this.inventoryPage.clickProductName(productName);
});

Then('I should be taken to the product details page', async function (this: CustomWorld) {
  // Assuming product details page has specific URL pattern
  await expect(this.page).toHaveURL(/.*\/inventory-item\.html\?id=\d+/);
});

Then('I should see detailed information about {string}', async function (this: CustomWorld, productName: string) {
  const pageContent = await this.page.textContent('body');
  expect(pageContent).toContain(productName);
});

// Cart navigation steps
When('I click on the shopping cart icon', async function (this: CustomWorld) {
  await this.inventoryPage.clickShoppingCart();
});

// Empty cart state
Given('I have no items in my cart', async function (this: CustomWorld) {  
  // Just set test data - assume cart is empty initially
  this.setTestData('addedProducts', []);
});

When('I navigate to the cart page', async function (this: CustomWorld) {
  await this.inventoryPage.clickShoppingCart();
});
