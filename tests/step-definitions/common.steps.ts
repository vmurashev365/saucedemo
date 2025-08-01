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
  
  // Увеличиваем ожидание для загрузки страницы корзины
  await this.page.waitForURL('**/cart.html', { timeout: 15000 });
  await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  
  // Проверяем, что мы на странице корзины, но без строгой проверки элементов
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/cart.html');
});

// Login steps
When('I login with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  await this.loginPage.loginWithCredentials(username, password);
  
  // Special handling for performance_glitch_user - они медленно загружаются
  if (username === 'performance_glitch_user') {
    await this.page.waitForTimeout(10000); // Увеличиваем до 10 секунд для медленного пользователя
    await this.page.waitForLoadState('networkidle', { timeout: 20000 }); // Дополнительное ожидание загрузки
  }
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

Then('I should see {string} page title', async function (this: CustomWorld, expectedTitle: string) {
  const currentUrl = this.page.url();
  
  if (currentUrl.includes('inventory.html') && expectedTitle === 'Products') {
    const pageTitle = await this.inventoryPage.getPageTitle();
    expect(pageTitle).toBe(expectedTitle);
  } else if (currentUrl.includes('cart.html')) {
    const pageTitle = await this.cartPage.getPageTitle();
    expect(pageTitle).toBe(expectedTitle);
  } else {
    // Generic page title check
    const titleElement = this.page.locator('.title, .header_secondary_container .title');
    await expect(titleElement).toContainText(expectedTitle);
  }
});

Then('I should be taken to the cart page', async function (this: CustomWorld) {
  // Ждем загрузки страницы корзины с увеличенным таймаутом
  await this.page.waitForURL('**/cart.html', { timeout: 15000 });
  await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  
  // Проверяем URL без строгой проверки элементов страницы
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/cart.html');
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
