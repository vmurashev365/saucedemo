import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { TestUser } from '../types';

export class LoginPage extends BasePage {
  // Locators using data-test attributes for better reliability
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly loginForm: Locator;
  private readonly loginLogo: Locator;
  private readonly acceptedUsernames: Locator;
  private readonly passwordForAllUsers: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators using SauceDemo's data-test attributes
    this.usernameInput = this.getElementByTestId('username');
    this.passwordInput = this.getElementByTestId('password');
    this.loginButton = this.getElementByTestId('login-button');
    this.errorMessage = this.getElementByTestId('error');
    this.loginForm = this.page.locator('.login_wrapper');
    this.loginLogo = this.page.locator('.login_logo');
    this.acceptedUsernames = this.getElementById('login_credentials');
    this.passwordForAllUsers = this.page.locator('.login_password');
  }

  async isPageLoaded(): Promise<boolean> {
    return await this.isElementVisible(this.loginForm) && 
           await this.isElementVisible(this.loginLogo);
  }

  async enterUsername(username: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.fillInput(this.passwordInput, password);
  }

  async clickLoginButton(): Promise<void> {
    await this.clickElement(this.loginButton);
  }

  async login(user: TestUser): Promise<void> {
    await this.enterUsername(user.username);
    await this.enterPassword(user.password);
    await this.clickLoginButton();
  }

  async loginWithCredentials(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  async expectErrorMessage(expectedMessage: string): Promise<void> {
    await this.expectElementToHaveText(this.errorMessage, expectedMessage);
  }

  async clearUsername(): Promise<void> {
    await this.usernameInput.clear();
  }

  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  async clearForm(): Promise<void> {
    await this.clearUsername();
    await this.clearPassword();
  }

  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  async getAcceptedUsernames(): Promise<string> {
    return await this.getText(this.acceptedUsernames);
  }

  async getPasswordInfo(): Promise<string> {
    return await this.getText(this.passwordForAllUsers);
  }

  // Validation methods
  async expectToBeOnLoginPage(): Promise<void> {
    await this.expectPageToHaveURL(this.baseUrl);
    await this.expectElementToBeVisible(this.loginForm);
    await this.expectElementToBeVisible(this.loginLogo);
  }

  async expectUsernameFieldToBeEmpty(): Promise<void> {
    await this.expectElementToHaveText(this.usernameInput, '');
  }

  async expectPasswordFieldToBeEmpty(): Promise<void> {
    await this.expectElementToHaveText(this.passwordInput, '');
  }
}
