import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/World';
import { DataHelper } from '../../src/utils/DataHelper';

// Common navigation steps
Given('I am on the SauceDemo login page', async function (this: CustomWorld) {
  await this.loginPage.navigateTo();
  await this.loginPage.expectToBeOnLoginPage();
});

Given('I am logged in as a standard user', async function (this: CustomWorld) {
  await this.loginPage.navigateTo();
  const user = DataHelper.getValidUser();
  await this.loginPage.login(user);
  await this.inventoryPage.expectToBeOnInventoryPage();
});

Given('I am on the inventory page', async function (this: CustomWorld) {
  await this.inventoryPage.expectToBeOnInventoryPage();
});

Given('I am on the cart page', async function (this: CustomWorld) {
  await this.inventoryPage.clickShoppingCart();
  await this.cartPage.expectToBeOnCartPage();
});

// Login steps
When('I login with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  await this.loginPage.loginWithCredentials(username, password);
});

Then('I should be redirected to the inventory page', async function (this: CustomWorld) {
  await this.inventoryPage.expectToBeOnInventoryPage();
});

Then('I should see the {string} page title', async function (this: CustomWorld, expectedTitle: string) {
  const actualTitle = await this.inventoryPage.getPageTitle();
  expect(actualTitle).toBe(expectedTitle);
});

Then('I should see {string} as page title', async function (this: CustomWorld, expectedTitle: string) {
  // Check for checkout overview page
  if (expectedTitle.includes('Overview')) {
    const pageTitle = await this.page.locator('.title').textContent();
    expect(pageTitle).toBe(expectedTitle);
  } else {
    const actualTitle = await this.inventoryPage.getPageTitle();
    expect(actualTitle).toBe(expectedTitle);
  }
});

Then('I should see the shopping cart icon', async function (this: CustomWorld) {
  await this.inventoryPage.expectElementToBeVisible(this.page.locator('[data-test="shopping-cart-link"]'));
});

Then('I should see the error message {string}', async function (this: CustomWorld, expectedMessage: string) {
  await this.loginPage.expectErrorMessage(expectedMessage);
});

Then('I should remain on the login page', async function (this: CustomWorld) {
  await this.loginPage.expectToBeOnLoginPage();
});

// Generic verification steps
Then('I should see {string} message', async function (this: CustomWorld, message: string) {
  const pageContent = await this.page.textContent('body');
  expect(pageContent).toContain(message);
});

Then('I should be taken to the {string} page', async function (this: CustomWorld, pageName: string) {
  switch (pageName.toLowerCase()) {
    case 'inventory':
    case 'products':
      await this.inventoryPage.expectToBeOnInventoryPage();
      break;
    case 'cart':
      await this.cartPage.expectToBeOnCartPage();
      break;
    case 'checkout information':
    case 'checkout step one':
      await this.checkoutStepOnePage.expectToBeOnCheckoutStepOnePage();
      break;
    case 'checkout overview':
    case 'checkout step two':
      await this.checkoutStepTwoPage.expectToBeOnCheckoutStepTwoPage();
      break;
    case 'checkout complete':
      await this.checkoutCompletePage.expectToBeOnCheckoutCompletePage();
      break;
    default:
      throw new Error(`Unknown page: ${pageName}`);
  }
});

// Generic button click steps
When('I click {string}', async function (this: CustomWorld, buttonText: string) {
  const button = this.page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}"), [data-test*="${buttonText.toLowerCase().replace(/\s+/g, '-')}"]`);
  await button.first().click();
});

When('I click on the {string}', async function (this: CustomWorld, elementText: string) {
  const element = this.page.locator(`text="${elementText}"`).first();
  await element.click();
});

// Wait steps
When('I wait for {int} seconds', async function (this: CustomWorld, seconds: number) {
  await this.page.waitForTimeout(seconds * 1000);
});

// Generic element visibility checks
Then('I should see {string}', async function (this: CustomWorld, text: string) {
  const element = this.page.locator(`text="${text}"`).first();
  await expect(element).toBeVisible();
});

Then('I should not see {string}', async function (this: CustomWorld, text: string) {
  const element = this.page.locator(`text="${text}"`).first();
  await expect(element).not.toBeVisible();
});

// Generic element state checks
Then('the {string} button should be visible', async function (this: CustomWorld, buttonName: string) {
  const button = this.page.locator(`button:has-text("${buttonName}")`);
  await expect(button).toBeVisible();
});

Then('the {string} button should be enabled', async function (this: CustomWorld, buttonName: string) {
  const button = this.page.locator(`button:has-text("${buttonName}")`);
  await expect(button).toBeEnabled();
});

Then('the {string} button should be disabled', async function (this: CustomWorld, buttonName: string) {
  const button = this.page.locator(`button:has-text("${buttonName}")`);
  await expect(button).toBeDisabled();
});
