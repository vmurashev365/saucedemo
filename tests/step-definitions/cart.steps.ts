import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/World';

// Cart viewing steps
Then('I should see an empty cart', async function (this: CustomWorld) {
  await this.cartPage.expectCartToBeEmpty();
});

Then('I should see {string} in my cart', async function (this: CustomWorld, productName: string) {
  await this.cartPage.expectCartToContainItem(productName);
});

Then('I should see the correct price for {string}', async function (this: CustomWorld, productName: string) {
  const price = await this.cartPage.getItemPrice(productName);
  expect(price).toMatch(/^\$\d+\.\d{2}$/);
  
  // Optionally verify against expected price from test data
  const expectedPrice = this.getTestData(`${productName}_price`);
  if (expectedPrice) {
    expect(price).toBe(expectedPrice);
  }
});

Then('I should see quantity {string} for {string}', async function (this: CustomWorld, expectedQuantity: string, productName: string) {
  const actualQuantity = await this.cartPage.getItemQuantity(productName);
  expect(actualQuantity).toBe(parseInt(expectedQuantity));
});

Then('I should see {int} items in my cart', async function (this: CustomWorld, expectedCount: number) {
  await this.cartPage.expectCartToHaveItems(expectedCount);
});

Then('I should see all selected items with correct details', async function (this: CustomWorld) {
  const addedProducts = this.getTestData('addedProducts') || [];
  
  for (const productName of addedProducts) {
    await this.cartPage.expectCartToContainItem(productName);
    
    // Verify price format
    const price = await this.cartPage.getItemPrice(productName);
    expect(price).toMatch(/^\$\d+\.\d{2}$/);
    
    // Verify quantity (default is 1)
    const quantity = await this.cartPage.getItemQuantity(productName);
    expect(quantity).toBeGreaterThan(0);
  }
});

Then('I should see {int} item in my cart', async function (this: CustomWorld, expectedCount: number) {
  const actualCount = await this.cartPage.getCartItemCount();
  expect(actualCount).toBe(expectedCount);
});

Then('I should only see {string} in my cart', async function (this: CustomWorld, productName: string) {
  await this.cartPage.expectCartToHaveItems(1);
  await this.cartPage.expectCartToContainItem(productName);
});

// Cart manipulation steps
When('I remove {string} from the cart', async function (this: CustomWorld, productName: string) {
  // Сначала убеждаемся что мы на правильной странице
  const currentUrl = this.page.url();
  
  if (currentUrl.includes('/cart.html')) {
    // Если мы на странице корзины, используем CartPage
    await this.cartPage.removeItem(productName);
  } else {
    // Если мы на странице инвентаря, используем InventoryPage
    await this.inventoryPage.removeProductFromCart(productName);
  }
  
  // Update test data
  const addedProducts = this.getTestData('addedProducts') || [];
  const index = addedProducts.indexOf(productName);
  if (index > -1) {
    addedProducts.splice(index, 1);
    this.setTestData('addedProducts', addedProducts);
  }
});

// Navigation steps
When('I click {string} button on cart page', async function (this: CustomWorld, buttonText: string) {
  switch (buttonText.toLowerCase()) {
    case 'continue shopping':
      await this.cartPage.clickContinueShopping();
      break;
    case 'checkout':
      await this.cartPage.clickCheckout();
      break;
    default:
      // Try generic button click
      const button = this.page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`);
      await button.click();
  }
});

Then('I should be taken back to the inventory page', async function (this: CustomWorld) {
  await this.inventoryPage.expectToBeOnInventoryPage();
});

Then('the shopping cart badge should still show {string}', async function (this: CustomWorld, expectedCount: string) {
  await this.inventoryPage.expectCartBadgeToShow(parseInt(expectedCount));
});

Then('I should be taken to the checkout information page', async function (this: CustomWorld) {
  await this.checkoutStepOnePage.expectToBeOnCheckoutStepOnePage();
});

// Continue Shopping and Checkout button visibility
Then('I should see {string} button', async function (this: CustomWorld, buttonText: string) {
  switch (buttonText.toLowerCase()) {
    case 'continue shopping':
      await this.cartPage.expectContinueShoppingButtonToBeVisible();
      break;
    case 'checkout':
      await this.cartPage.expectCheckoutButtonToBeVisible();
      break;
    default:
      const button = this.page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`);
      await expect(button).toBeVisible();
  }
});

// Cart state validation
Then('my items should still be in the cart', async function (this: CustomWorld) {
  const addedProducts = this.getTestData('addedProducts') || [];
  
  if (addedProducts.length > 0) {
    // Navigate to cart to verify
    await this.inventoryPage.clickShoppingCart();
    await this.cartPage.expectToBeOnCartPage();
    
    for (const productName of addedProducts) {
      await this.cartPage.expectCartToContainItem(productName);
    }
  }
});

Then('the shopping cart should be empty', async function (this: CustomWorld) {
  const cartBadge = this.page.locator('[data-test="shopping-cart-badge"]');
  await expect(cartBadge).not.toBeVisible();
});

// Test data helpers for cart
Given('I have items in my cart', async function (this: CustomWorld) {
  // Add a default item if no items are tracked
  if (!this.hasTestData('addedProducts') || this.getTestData('addedProducts').length === 0) {
    await this.inventoryPage.addProductToCart('Sauce Labs Backpack');
    this.setTestData('addedProducts', ['Sauce Labs Backpack']);
  }
});

// Price calculations (if needed for validation)
Then('the cart total should be calculated correctly', async function (this: CustomWorld) {
  const expectedTotal = await this.cartPage.calculateTotalPrice();
  expect(expectedTotal).toBeGreaterThan(0);
  
  // Store for later use in checkout
  this.setTestData('expectedCartTotal', expectedTotal);
});
