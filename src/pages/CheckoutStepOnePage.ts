import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { CheckoutInfo } from '../types';

export class CheckoutStepOnePage extends BasePage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;
  private readonly checkoutForm: Locator;

  constructor(page: Page, baseUrl?: string, timeout?: number) {
    super(page, baseUrl, timeout);
    this.firstNameInput = this.getElementByTestId('firstName');
    this.lastNameInput = this.getElementByTestId('lastName');
    this.postalCodeInput = this.getElementByTestId('postalCode');
    this.continueButton = this.getElementByTestId('continue');
    this.cancelButton = this.getElementByTestId('cancel');
    this.checkoutForm = this.page.locator('.checkout_info');
  }

  async expectToBeOnCheckoutStepOnePage(): Promise<void> {
    await this.expectToBeAt('/checkout-step-one.html');
    await this.uiExpect(this.checkoutForm).toBeVisible();
    await this.expectTitle('Checkout: Your Information');
  }

  async fillCheckoutInformation(info: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
