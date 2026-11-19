import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/World';

// Cart viewing steps
Then('I should see an empty cart', async function (this: CustomWorld) {
  await this.cartPage.expectCartToBeEmpty();
});

Then('I should see {string} in my cart', async function (this: CustomWorld, productName: string) {
  await this.cartPage.expectCartToContainItem(productName);
});

Then('the empty cart badge should show no count or zero', async function (this: CustomWorld) {
  await this.cartPage.expectEmptyCartBadge();
});

Then('checkout should be unavailable with an empty cart', async function (this: CustomWorld) {
  await this.cartPage.expectCheckoutUnavailable();
});

Then('Continue Shopping should be enabled in the cart', async function (this: CustomWorld) {
  await this.cartPage.expectContinueShoppingButtonToBeEnabled();
});

Then('I should see {int} items in my cart', async function (this: CustomWorld, expectedCount: number) {
  await this.cartPage.expectCartToHaveItems(expectedCount);
});

Then('the cart should contain exactly the selected items, prices, and quantities', async function (this: CustomWorld) {
  await this.cartPage.expectSelectedItems(this.selection);
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
  // Remove the item through the page currently displaying it.
  const currentUrl = this.page.url();
  
  if (currentUrl.includes('/cart.html')) {
    await this.cartPage.removeItem(productName);
  } else {
    await this.inventoryPage.removeProductFromCart(productName);
  }
  
  this.forgetProduct(productName);
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
  await this.cartPage.expectToBeOnCartPage();
  expect(this.selection.length).toBeGreaterThan(0);
  await this.cartPage.expectSelectedItems(this.selection);
});

Then('the shopping cart should be empty', async function (this: CustomWorld) {
  await this.inventoryPage.expectCartBadgeToShow(0);
  await this.inventoryPage.clickShoppingCart();
  await this.cartPage.expectToBeOnCartPage();
  await this.cartPage.expectCartToBeEmpty();
});
