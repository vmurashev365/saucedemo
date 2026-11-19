import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/World';

// Cart contents
Then('I should see an empty cart', async function (this: CustomWorld) {
  await this.cartPage.expectCartToBeEmpty();
});

Then('I should see {string} in my cart', async function (this: CustomWorld, productName: string) {
  await this.cartPage.expectCartToContainItem(productName);
});

Then('I should see {int} item(s) in my cart', async function (this: CustomWorld, expectedCount: number) {
  await this.cartPage.expectCartToHaveItems(expectedCount);
});

Then('I should only see {string} in my cart', async function (this: CustomWorld, productName: string) {
  await this.cartPage.expectCartToHaveItems(1);
  await this.cartPage.expectCartToContainItem(productName);
});

Then('the cart should contain exactly the selected items, prices, and quantities', async function (this: CustomWorld) {
  await this.cartPage.expectSelectedItems(this.selection);
});

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

// Empty cart rules (TC-031)
Then('the empty cart badge should show no count or zero', async function (this: CustomWorld) {
  await this.cartPage.expectEmptyCartBadge();
});

Then('checkout should be unavailable with an empty cart', async function (this: CustomWorld) {
  await this.cartPage.expectCheckoutUnavailable();
});

Then('Continue Shopping should be enabled in the cart', async function (this: CustomWorld) {
  await this.cartPage.expectContinueShoppingButtonToBeEnabled();
});

// Cart actions
When('I remove {string} from the cart', async function (this: CustomWorld, productName: string) {
  // Remove the item through the page currently displaying it.
  if (new URL(this.page.url()).pathname.endsWith('/cart.html')) {
    await this.cartPage.removeItem(productName);
  } else {
    await this.inventoryPage.removeProductFromCart(productName);
  }
  this.forgetProduct(productName);
});

When('I click {string} button on cart page', async function (this: CustomWorld, buttonText: string) {
  switch (buttonText) {
    case 'Continue Shopping':
      await this.cartPage.clickContinueShopping();
      break;
    case 'Checkout':
      await this.cartPage.clickCheckout();
      break;
    default:
      throw new Error(`Cart button: expected "Continue Shopping" or "Checkout", actual "${buttonText}".`);
  }
});

Then('I should see {string} button', async function (this: CustomWorld, buttonText: string) {
  switch (buttonText) {
    case 'Continue Shopping':
      await this.cartPage.expectContinueShoppingButtonToBeVisible();
      break;
    case 'Checkout':
      await this.cartPage.expectCheckoutButtonToBeVisible();
      break;
    default:
      throw new Error(`Cart button: expected "Continue Shopping" or "Checkout", actual "${buttonText}".`);
  }
});

// Navigation results
Then('I should be taken back to the inventory page', async function (this: CustomWorld) {
  await this.inventoryPage.expectToBeOnInventoryPage();
});

Then('I should be taken to the checkout information page', async function (this: CustomWorld) {
  await this.checkoutStepOnePage.expectToBeOnCheckoutStepOnePage();
});
