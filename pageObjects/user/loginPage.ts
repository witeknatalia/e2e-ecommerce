import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../basePage';

export class LoginPage extends BasePage {
  readonly loginLink: Locator;
  readonly pageHeading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly logoutLink: Locator;
  readonly accountLink: Locator;
  readonly validationError: Locator;
  readonly validationSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.loginLink = page.locator('a.ico-login');
    this.pageHeading = page.locator('h1');
    this.emailInput = page.locator('#Email');
    this.passwordInput = page.locator('#Password');
    this.loginButton = page.locator('.login-button');
    this.rememberMeCheckbox = page.locator('#RememberMe');
    this.logoutLink = page.locator('a.ico-logout');
    this.accountLink = page.locator('a.account').first();
    this.validationError = page.locator('.field-validation-error');
    this.validationSummary = page.locator('.validation-summary-errors');
  }

  async navigateToLoginPage() {
    await this.navigate('/');
    await this.loginLink.click();
  }

  async verifyOnLoginPage() {
    await expect(this.page).toHaveURL(/.*\/login/);
    await expect(this.pageHeading).toContainText('Welcome, Please Sign In!');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async checkRememberMe() {
    await this.rememberMeCheckbox.check();
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async login(email: string, password: string, rememberMe: boolean = false) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    if (rememberMe) {
      await this.checkRememberMe();
    }
    await this.clickLoginButton();
  }

  async loginWithCredentials(credentials: { email: string; password: string }, rememberMe: boolean = false) {
    await this.login(credentials.email, credentials.password, rememberMe);
  }

  async logout() {
    await this.logoutLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoggedIn() {
    await expect(this.logoutLink).toBeVisible();
    await expect(this.accountLink).toBeVisible();
  }

  async verifyLoggedOut() {
    await expect(this.loginLink).toBeVisible();
    await expect(this.logoutLink).not.toBeVisible();
  }

  async verifyUserEmail(email: string) {
    await expect(this.accountLink).toContainText(email);
  }

  async verifyLoginError(errorText: string) {
    const errorLocator = this.validationSummary.locator('li, span').first();
    await expect(errorLocator).toContainText(errorText);
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await expect(this.logoutLink).toBeVisible({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async refreshPage() {
    await this.page.reload();
  }
}
