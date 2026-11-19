import { DataTable, Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/World';
import { toSortOption } from '../../src/types';

// Product list
Then('I should see {int} products displayed', async function (this: CustomWorld, expectedCount: number) {
  await this.inventoryPage.expectProductCount(expectedCount);
});

Then('each product should have a name, description, price, and image', async function (this: CustomWorld) {
  await this.inventoryPage.expectEveryProductComplete();
});

Then('each product should have an {string} button', async function (this: CustomWorld, buttonText: string) {
  await this.inventoryPage.expectEveryProductButton(buttonText);
});

// Adding products
async function selectProduct(this: CustomWorld, name: string): Promise<void> {
  await this.selectProduct(name);
}

When('I add {string} to the cart', selectProduct);
Given('I have added {string} to the cart', selectProduct);

Given('I have added the following items to the cart:', async function (this: CustomWorld, dataTable: DataTable) {
  for (const name of dataTable.raw().flat()) {
    await this.selectProduct(name.trim());
  }
});

When('I add all products to the cart', async function (this: CustomWorld) {
  for (const name of await this.inventoryPage.getProductNames()) {
    await this.selectProduct(name);
  }
});

Given('I have no items in my cart', function (this: CustomWorld) {
  expect(this.selection).toHaveLength(0);
});

// Cart badge and buttons
Then('the shopping cart badge should (still )show {string}', async function (this: CustomWorld, expectedCount: string) {
  await this.inventoryPage.expectCartBadgeToShow(Number(expectedCount));
});

Then('the shopping cart badge should not be visible', async function (this: CustomWorld) {
  await this.inventoryPage.expectCartBadgeToShow(0);
});

Then('the {string} button should change to {string} for {string}', async function (this: CustomWorld, _from: string, to: string, productName: string) {
  await this.inventoryPage.expectCardButton(productName, to);
});

Then('all {string} buttons should be changed to {string}', async function (this: CustomWorld, _from: string, to: string) {
  await this.inventoryPage.expectEveryProductButton(to);
});

// Sorting
When('I sort products by {string}', async function (this: CustomWorld, sortOption: string) {
  await this.inventoryPage.sortProducts(toSortOption(sortOption));
});

Then('products should be sorted by {string}', async function (this: CustomWorld, sortOption: string) {
  await this.inventoryPage.expectProductsSortedBy(toSortOption(sortOption));
});

// Navigation
When('I click on {string} product name', async function (this: CustomWorld, productName: string) {
  await this.inventoryPage.clickProductName(productName);
});

Then('I should be taken to the product details page', async function (this: CustomWorld) {
  await this.inventoryPage.expectToBeOnProductDetailsPage();
});

Then('I should see detailed information about {string}', async function (this: CustomWorld, productName: string) {
  await this.inventoryPage.expectProductDetails(productName);
});

When('I click on the shopping cart icon', async function (this: CustomWorld) {
  await this.inventoryPage.clickShoppingCart();
});

When('I navigate to the cart page', async function (this: CustomWorld) {
  await this.inventoryPage.clickShoppingCart();
  await this.cartPage.expectToBeOnCartPage();
});
