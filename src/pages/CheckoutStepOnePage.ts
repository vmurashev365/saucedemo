import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { CheckoutInfo } from '../types';

export class CheckoutStepOnePage extends BasePage {
  // Form elements
  private readonly pageTitle: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;
  private readonly errorMessage: Locator;
  private readonly checkoutForm: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = this.page.locator('.title');
    this.firstNameInput = this.getElementByTestId('firstName');
    this.lastNameInput = this.getElementByTestId('lastName');
    this.postalCodeInput = this.getElementByTestId('postalCode');
    this.continueButton = this.getElementByTestId('continue');
    this.cancelButton = this.getElementByTestId('cancel');
    this.errorMessage = this.getElementByTestId('error');
    this.checkoutForm = this.page.locator('.checkout_info');
  }

  async isPageLoaded(): Promise<boolean> {
    return await this.isElementVisible(this.checkoutForm) && 
           await this.isElementVisible(this.pageTitle);
  }

  async expectToBeOnCheckoutStepOnePage(): Promise<void> {
    await this.expectPageToHaveURL(`${this.baseUrl}/checkout-step-one.html`);
    await this.expectElementToBeVisible(this.checkoutForm);
    await this.expectElementToHaveText(this.pageTitle, 'Checkout: Your Information');
  }

  async enterFirstName(firstName: string): Promise<void> {
    await this.fillInput(this.firstNameInput, firstName);
  }

  async enterLastName(lastName: string): Promise<void> {
    await this.fillInput(this.lastNameInput, lastName);
  }

  async enterPostalCode(postalCode: string): Promise<void> {
    await this.fillInput(this.postalCodeInput, postalCode);
  }

  async fillCheckoutInformation(info: CheckoutInfo): Promise<void> {
    await this.enterFirstName(info.firstName);
    await this.enterLastName(info.lastName);
    await this.enterPostalCode(info.postalCode);
  }

  async clickContinue(): Promise<void> {
    await this.clickElement(this.continueButton);
  }

  async clickCancel(): Promise<void> {
    await this.clickElement(this.cancelButton);
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

  async clearForm(): Promise<void> {
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.postalCodeInput.clear();
  }

  async getFirstNameValue(): Promise<string> {
    return await this.firstNameInput.inputValue();
  }

  async getLastNameValue(): Promise<string> {
    return await this.lastNameInput.inputValue();
  }

  async getPostalCodeValue(): Promise<string> {
    return await this.postalCodeInput.inputValue();
  }

  async expectContinueButtonToBeEnabled(): Promise<void> {
    expect(await this.continueButton.isEnabled()).toBe(true);
  }

  async expectCancelButtonToBeVisible(): Promise<void> {
    await this.expectElementToBeVisible(this.cancelButton);
  }
}
