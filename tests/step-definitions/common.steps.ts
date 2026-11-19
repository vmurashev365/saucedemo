import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../hooks/World';
import { DataHelper } from '../../src/utils/DataHelper';

// Navigation and login
Given('I am on the SauceDemo login page', async function (this: CustomWorld) {
  await this.loginPage.navigateTo();
  await this.loginPage.expectToBeOnLoginPage();
});

Given('I am logged in as a standard user', async function (this: CustomWorld) {
  await this.loginPage.navigateTo();
  await this.loginPage.login(DataHelper.getValidUser());
  await this.inventoryPage.expectToBeOnInventoryPage();
});

Given('I am on the inventory page', async function (this: CustomWorld) {
  await this.inventoryPage.expectToBeOnInventoryPage();
});

Given('I am on the cart page', async function (this: CustomWorld) {
  await this.inventoryPage.clickShoppingCart();
  await this.cartPage.expectToBeOnCartPage();
});

When('I login with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  await this.loginPage.loginWithCredentials(username, password);
});

// Shared page assertions
Then('I should be redirected to the inventory page', async function (this: CustomWorld) {
  await this.inventoryPage.expectToBeOnInventoryPage();
});

Then('I should see the {string} page title', async function (this: CustomWorld, expectedTitle: string) {
  await this.expectPageTitle(expectedTitle);
});

Then('I should see the shopping cart icon', async function (this: CustomWorld) {
  await this.inventoryPage.expectShoppingCartLinkVisible();
});

Then('I should see the error message {string}', async function (this: CustomWorld, expectedMessage: string) {
  // Login and checkout forms render validation errors in the same data-test="error" element.
  await this.loginPage.expectErrorMessage(expectedMessage);
});

Then('I should be taken to the cart page', async function (this: CustomWorld) {
  await this.cartPage.expectToBeOnCartPage();
});

Then('I should remain on the login page', async function (this: CustomWorld) {
  await this.loginPage.expectToBeOnLoginPage();
});
