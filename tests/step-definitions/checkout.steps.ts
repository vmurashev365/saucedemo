import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/World';
import { DataHelper } from '../../src/utils/DataHelper';

// Checkout setup steps
Given('I am on the checkout step one page', async function (this: CustomWorld) {
  await this.inventoryPage.clickShoppingCart();
  await this.cartPage.clickCheckout();
  await this.checkoutStepOnePage.expectToBeOnCheckoutStepOnePage();
});

Given('I have filled in valid checkout information and proceeded to overview', async function (this: CustomWorld) {
  const checkoutInfo = DataHelper.getValidCheckoutInfo();
  await this.checkoutStepOnePage.fillCheckoutInformation(checkoutInfo);
  await this.checkoutStepOnePage.clickContinue();
  await this.checkoutStepTwoPage.expectToBeOnCheckoutStepTwoPage();
});

Given('I have completed a successful checkout', async function (this: CustomWorld) {
  // Complete the full checkout process
  const checkoutInfo = DataHelper.getValidCheckoutInfo();
  await this.checkoutStepOnePage.fillCheckoutInformation(checkoutInfo);
  await this.checkoutStepOnePage.clickContinue();
  await this.checkoutStepTwoPage.clickFinish();
  await this.checkoutCompletePage.expectToBeOnCheckoutCompletePage();
});

Given('I have added multiple items with different prices to the cart', async function (this: CustomWorld) {
  const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];
  for (const product of products) {
    await this.inventoryPage.addProductToCart(product);
  }
  this.setTestData('addedProducts', products);
});

// Checkout form filling steps
When('I fill in the checkout information with valid details:', async function (this: CustomWorld, dataTable) {
  const data = dataTable.hashes()[0];
  const checkoutInfo = {
    firstName: data.firstName,
    lastName: data.lastName,
    postalCode: data.postalCode
  };
  
  await this.checkoutStepOnePage.fillCheckoutInformation(checkoutInfo);
  this.setTestData('checkoutInfo', checkoutInfo);
});

When('I fill in the checkout information:', async function (this: CustomWorld, dataTable) {
  const data = dataTable.hashes()[0];
  const checkoutInfo = {
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    postalCode: data.postalCode || ''
  };
  
  await this.checkoutStepOnePage.fillCheckoutInformation(checkoutInfo);
  this.setTestData('checkoutInfo', checkoutInfo);
});

// Checkout step one validation
Then('I should remain on the checkout step one page', async function (this: CustomWorld) {
  await this.checkoutStepOnePage.expectToBeOnCheckoutStepOnePage();
});

// Checkout overview validation
Then('I should see {string} in the order summary', async function (this: CustomWorld, productName: string) {
  await this.checkoutStepTwoPage.expectOrderToContainItem(productName);
});

Then('I should see the correct subtotal and total amounts', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectSubtotalToBeCorrect();
  await this.checkoutStepTwoPage.expectTotalToBeCorrect();
});

Then('I should see {int} items in the order summary', async function (this: CustomWorld, expectedCount: number) {
  const actualCount = await this.checkoutStepTwoPage.getOrderItemCount();
  expect(actualCount).toBe(expectedCount);
});

Then('I should see the correct total for multiple items', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectSubtotalToBeCorrect();
  await this.checkoutStepTwoPage.expectTotalToBeCorrect();
});

// Order completion validation
Then('I should see the order completion confirmation', async function (this: CustomWorld) {
  await this.checkoutCompletePage.expectToBeOnCheckoutCompletePage();
  await this.checkoutCompletePage.expectSuccessMessage();
});

Then('I should see order completion confirmation message', async function (this: CustomWorld) {
  const header = await this.checkoutCompletePage.getCompleteHeader();
  expect(header).toContain('Thank you for your order!');
});

Then('I should see order dispatched confirmation message', async function (this: CustomWorld) {
  const text = await this.checkoutCompletePage.getCompleteText();
  expect(text).toContain('Your order has been dispatched');
});

Then('I should be taken to the checkout overview page', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectToBeOnCheckoutStepTwoPage();
});

Then('I should be taken to the checkout complete page', async function (this: CustomWorld) {
  await this.checkoutCompletePage.expectToBeOnCheckoutCompletePage();
});

Then('I should see {string} message', async function (this: CustomWorld, expectedMessage: string) {
  if (expectedMessage.includes('Thank you')) {
    const header = await this.checkoutCompletePage.getCompleteHeader();
    expect(header).toContain('Thank you for your order!');
  } else if (expectedMessage.includes('dispatched')) {
    const text = await this.checkoutCompletePage.getCompleteText();
    expect(text).toContain('Your order has been dispatched');
  } else {
    // Generic message check
    const pageContent = await this.page.textContent('body');
    expect(pageContent).toContain(expectedMessage);
  }
});

// Cancel operations
When('I click {string} on the checkout step one page', async function (this: CustomWorld, buttonText: string) {
  if (buttonText.toLowerCase() === 'cancel') {
    await this.checkoutStepOnePage.clickCancel();
  } else {
    await this.checkoutStepOnePage.clickContinue();
  }
});

When('I click {string} on the checkout overview page', async function (this: CustomWorld, buttonText: string) {
  if (buttonText.toLowerCase() === 'cancel') {
    await this.checkoutStepTwoPage.clickCancel();
  } else {
    await this.checkoutStepTwoPage.clickFinish();
  }
});

Then('I should be redirected to the cart page', async function (this: CustomWorld) {
  await this.cartPage.expectToBeOnCartPage();
});

// Return to products
When('I click {string} on checkout page', async function (this: CustomWorld, buttonText: string) {
  switch (buttonText.toLowerCase()) {
    case 'continue':
      await this.checkoutStepOnePage.clickContinue();
      break;
    case 'finish':
      await this.checkoutStepTwoPage.clickFinish();
      break;
    case 'back home':
      await this.checkoutCompletePage.clickBackHome();
      break;
    case 'cancel':
      // Context-dependent cancel
      if (await this.checkoutStepOnePage.isPageLoaded()) {
        await this.checkoutStepOnePage.clickCancel();
      } else if (await this.checkoutStepTwoPage.isPageLoaded()) {
        await this.checkoutStepTwoPage.clickCancel();
      }
      break;
    default:
      const button = this.page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`);
      await button.click();
  }
});

// Price calculation validation
Then('the subtotal should equal the sum of all item prices', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectSubtotalToBeCorrect();
});

Then('the tax should be calculated correctly \\({int}% of subtotal)', async function (this: CustomWorld, taxPercentage: number) {
  const taxRate = taxPercentage / 100;
  await this.checkoutStepTwoPage.expectTotalToBeCorrect(taxRate);
});

Then('the total should equal subtotal plus tax', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectTotalToBeCorrect();
});

// Error message validation (reusing from common steps but context-specific)
Then('I should see the error message {string}', async function (this: CustomWorld, expectedMessage: string) {
  if (await this.checkoutStepOnePage.isPageLoaded()) {
    await this.checkoutStepOnePage.expectErrorMessage(expectedMessage);
  } else {
    // Generic error message check
    const errorElement = this.page.locator('[data-test="error"]');
    await expect(errorElement).toHaveText(expectedMessage);
  }
});

// Additional checkout validations
Then('I should see payment and shipping information', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectPaymentInformationToBeVisible();
  await this.checkoutStepTwoPage.expectShippingInformationToBeVisible();
});

Then('the order summary should be correct with {int} items', async function (this: CustomWorld, expectedItemCount: number) {
  await this.checkoutStepTwoPage.expectOrderSummaryToBeCorrect(expectedItemCount);
});
