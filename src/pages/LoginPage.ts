import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { TestUser } from '../types';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly loginForm: Locator;
  private readonly loginLogo: Locator;

  constructor(page: Page, baseUrl?: string, timeout?: number) {
    super(page, baseUrl, timeout);
    this.usernameInput = this.getElementByTestId('username');
    this.passwordInput = this.getElementByTestId('password');
    this.loginButton = this.getElementByTestId('login-button');
    this.errorMessage = this.getElementByTestId('error');
    this.loginForm = this.page.locator('.login_wrapper');
    this.loginLogo = this.page.locator('.login_logo');
  }

  async login(user: TestUser): Promise<void> {
    await this.loginWithCredentials(user.username, user.password);
  }

  async loginWithCredentials(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectErrorMessage(expectedMessage: string): Promise<void> {
    await this.uiExpect(this.errorMessage).toHaveText(expectedMessage);
  }

  async expectToBeOnLoginPage(): Promise<void> {
    await this.uiExpect(this.page).toHaveURL(this.baseUrl);
    await this.uiExpect(this.loginForm).toBeVisible();
    await this.uiExpect(this.loginLogo).toBeVisible();
  }
}
