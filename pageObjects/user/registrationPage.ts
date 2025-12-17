import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../basePage';

export class RegistrationPage extends BasePage {
  readonly registerLink: Locator;
  readonly pageHeading: Locator;
  readonly genderMaleRadio: Locator;
  readonly genderFemaleRadio: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly successMessage: Locator;
  readonly continueButton: Locator;
  readonly validationError: Locator;
  readonly errorMessage: Locator;
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    super(page);
    this.registerLink = page.locator('a.ico-register');
    this.pageHeading = page.locator('h1');
    this.genderMaleRadio = page.locator('#gender-male');
    this.genderFemaleRadio = page.locator('#gender-female');
    this.firstNameInput = page.locator('#FirstName');
    this.lastNameInput = page.locator('#LastName');
    this.emailInput = page.locator('#Email');
    this.passwordInput = page.locator('#Password');
    this.confirmPasswordInput = page.locator('#ConfirmPassword');
    this.registerButton = page.locator('#register-button');
    this.successMessage = page.locator('.result');
    this.continueButton = page.locator('.button-1.register-continue-button');
    this.validationError = page.locator('.field-validation-error');
    this.errorMessage = page.locator('.message-error');
    this.firstNameError = page.locator('span.field-validation-error[data-valmsg-for="FirstName"]');
    this.lastNameError = page.locator('span.field-validation-error[data-valmsg-for="LastName"]');
    this.emailError = page.locator('span.field-validation-error[data-valmsg-for="Email"]');
    this.passwordError = page.locator('span.field-validation-error[data-valmsg-for="Password"]');
  }

  async navigateToRegistrationPage() {
    await this.navigate('/');
    await this.registerLink.click();
  }

  async verifyOnRegistrationPage() {
    await expect(this.page).toHaveURL(/.*\/register/);
    await expect(this.pageHeading).toContainText('Register');
  }

  async selectGender(gender: 'male' | 'female') {
    if (gender === 'male') {
      await this.genderMaleRadio.check();
    } else {
      await this.genderFemaleRadio.check();
    }
  }

  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  async clickRegisterButton() {
    await this.registerButton.click();
  }

  async fillRegistrationForm(userData: { gender?: 'male' | 'female'; firstName?: string; lastName?: string; email?: string; password?: string; confirmPassword?: string }) {
    if (userData.gender) await this.selectGender(userData.gender);
    if (userData.firstName) await this.fillFirstName(userData.firstName);
    if (userData.lastName) await this.fillLastName(userData.lastName);
    if (userData.email) await this.fillEmail(userData.email);
    if (userData.password) await this.fillPassword(userData.password);
    if (userData.confirmPassword) await this.fillConfirmPassword(userData.confirmPassword);
  }

  async registerUser(userData: { gender: 'male' | 'female'; firstName: string; lastName: string; email: string; password: string; confirmPassword: string }) {
    await this.fillRegistrationForm(userData);
    await this.clickRegisterButton();
  }

  async verifySuccessfulRegistration() {
    await expect(this.page).toHaveURL(/.*\/registerresult/);
    await expect(this.successMessage).toContainText('Your registration completed');
    await expect(this.continueButton).toBeVisible();
  }

  async verifyValidationError(errorText: string) {
    await expect(this.validationError).toContainText(errorText);
    await expect(this.page).toHaveURL(/.*\/register/);
  }

  async verifyErrorMessage(errorText: string) {
    await expect(this.errorMessage).toContainText(errorText);
  }

  async verifyRequiredFieldErrors() {
    await expect(this.firstNameError).toContainText('First name is required');
    await expect(this.lastNameError).toContainText('Last name is required');
    await expect(this.emailError).toContainText('Email is required');
    await expect(this.passwordError).toContainText('Password is required');
    await expect(this.page).toHaveURL(/.*\/register/);
  }

  async verifyPasswordValidationError() {
    const passwordError = this.page.locator('.field-validation-error').filter({ hasText: /password/ });
    await expect(passwordError).toBeVisible();
    await expect(this.page).toHaveURL(/.*\/register/);
  }
}
