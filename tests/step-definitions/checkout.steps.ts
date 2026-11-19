import { DataTable, Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../hooks/World';
import { DataHelper } from '../../src/utils/DataHelper';
import { CheckoutInfo } from '../../src/types';
import { expectedAmounts } from '../../src/utils/CheckoutAssertions';

function checkoutInfo(dataTable: DataTable): CheckoutInfo {
  const { firstName = '', lastName = '', postalCode = '' } = dataTable.hashes()[0];
  return { firstName, lastName, postalCode };
}

// Checkout setup
When('I proceed from the cart to checkout', async function (this: CustomWorld) {
  await this.cartPage.clickCheckout();
  await this.checkoutStepOnePage.expectToBeOnCheckoutStepOnePage();
});

Given('I have filled in valid checkout information and proceeded to overview', async function (this: CustomWorld) {
  await this.checkoutStepOnePage.fillCheckoutInformation(DataHelper.getValidCheckoutInfo());
  await this.checkoutStepOnePage.clickContinue();
  await this.checkoutStepTwoPage.expectToBeOnCheckoutStepTwoPage();
});

Given('I have completed a successful checkout', async function (this: CustomWorld) {
  await this.checkoutStepOnePage.fillCheckoutInformation(DataHelper.getValidCheckoutInfo());
  await this.checkoutStepOnePage.clickContinue();
  await this.checkoutStepTwoPage.clickFinish();
  await this.checkoutCompletePage.expectToBeOnCheckoutCompletePage();
});

// Checkout information form
When('I fill in the checkout information with valid details:', async function (this: CustomWorld, dataTable: DataTable) {
  await this.checkoutStepOnePage.fillCheckoutInformation(checkoutInfo(dataTable));
});

When('I fill in the checkout information:', async function (this: CustomWorld, dataTable: DataTable) {
  await this.checkoutStepOnePage.fillCheckoutInformation(checkoutInfo(dataTable));
});

Then('I should remain on the checkout step one page', async function (this: CustomWorld) {
  await this.checkoutStepOnePage.expectToBeOnCheckoutStepOnePage();
});

// Checkout buttons
When('I click {string} on checkout page', async function (this: CustomWorld, buttonText: string) {
  switch (buttonText) {
    case 'Continue':
      await this.checkoutStepOnePage.clickContinue();
      break;
    case 'Finish':
      await this.checkoutStepTwoPage.clickFinish();
      break;
    case 'Back Home':
      await this.checkoutCompletePage.clickBackHome();
      break;
    default:
      throw new Error(`Checkout button: expected "Continue", "Finish" or "Back Home", actual "${buttonText}".`);
  }
});

When('I click {string} on the checkout step one page', async function (this: CustomWorld, buttonText: string) {
  switch (buttonText) {
    case 'Continue':
      await this.checkoutStepOnePage.clickContinue();
      break;
    case 'Cancel':
      await this.checkoutStepOnePage.clickCancel();
      break;
    default:
      throw new Error(`Checkout information button: expected "Continue" or "Cancel", actual "${buttonText}".`);
  }
});

When('I click {string} on the checkout overview page', async function (this: CustomWorld, buttonText: string) {
  switch (buttonText) {
    case 'Finish':
      await this.checkoutStepTwoPage.clickFinish();
      break;
    case 'Cancel':
      await this.checkoutStepTwoPage.clickCancel();
      break;
    default:
      throw new Error(`Checkout overview button: expected "Finish" or "Cancel", actual "${buttonText}".`);
  }
});

// Checkout overview
Then('I should be taken to the checkout overview page', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectToBeOnCheckoutStepTwoPage();
});

Then('the overview should contain exactly the selected items, prices, and quantities', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectSelectedItems(this.selection);
});

Then('Finish and Cancel should be available on the checkout overview', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectActionsAvailable();
});

Then('the subtotal should equal the sum of all item prices', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectSubtotal(expectedAmounts(this.selection).subtotal);
});

Then('the tax should equal 8% of the subtotal', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectTax(expectedAmounts(this.selection).tax);
});

Then('the total should equal subtotal plus tax', async function (this: CustomWorld) {
  await this.checkoutStepTwoPage.expectTotal(expectedAmounts(this.selection).total);
});

Then('I should be redirected to the cart page', async function (this: CustomWorld) {
  await this.cartPage.expectToBeOnCartPage();
});

// Order completion
Then('I should be taken to the checkout complete page', async function (this: CustomWorld) {
  await this.checkoutCompletePage.expectToBeOnCheckoutCompletePage();
});

Then('I should see the order completion confirmation', async function (this: CustomWorld) {
  await this.checkoutCompletePage.expectToBeOnCheckoutCompletePage();
  await this.checkoutCompletePage.expectSuccessMessage();
});

Then('I should see order completion confirmation message', async function (this: CustomWorld) {
  await this.checkoutCompletePage.expectCompletionHeader();
});

Then('I should see order dispatched confirmation message', async function (this: CustomWorld) {
  await this.checkoutCompletePage.expectDispatchMessage();
});
