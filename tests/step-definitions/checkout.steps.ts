import { DataTable, Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/World';
import { DataHelper } from '../../src/utils/DataHelper';
import { expectedAmounts } from '../../src/utils/CheckoutAssertions';

// Checkout setup steps
When('I proceed from the cart to checkout', async function (this: CustomWorld) {
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

// Checkout form filling steps
When('I fill in the checkout information with valid details:', async function (this: CustomWorld, dataTable: DataTable) {
  const data = dataTable.hashes()[0];
  const checkoutInfo = {
    firstName: data.firstName,
    lastName: data.lastName,
    postalCode: data.postalCode
  };
  
  await this.checkoutStepOnePage.fillCheckoutInformation(checkoutInfo);
});

When('I fill in the checkout information:', async function (this: CustomWorld, dataTable: DataTable) {
  const data = dataTable.hashes()[0];
  const checkoutInfo = {
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    postalCode: data.postalCode || ''
  };
  
  await this.checkoutStepOnePage.fillCheckoutInformation(checkoutInfo);
});

// Checkout step one validation
Then('I should remain on the checkout step one page', async function (this: CustomWorld) {
  await this.checkoutStepOnePage.expectToBeOnCheckoutStepOnePage();
});

// Checkout overview validation
Then('the overview should contain exactly the selected items, prices, and quantities', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectSelectedItems(this.selection);
});

Then('Finish and Cancel should be available on the checkout overview', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectActionsAvailable();
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
  await this.checkoutStepTwoPage.expectSubtotal(expectedAmounts(this.selection).subtotal);
});

Then('the tax should equal 8% of the subtotal', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectTax(expectedAmounts(this.selection).tax);
});

Then('the total should equal subtotal plus tax', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectTotal(expectedAmounts(this.selection).total);
});
