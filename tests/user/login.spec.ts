import { test, expect } from '@playwright/test';
import fs from 'fs';
import { LoginPage } from '../../pageObjects/user/LoginPage';
import { RegistrationPage } from '../../pageObjects/user/registrationPage';

const generateUniqueEmail = () => `testuser${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;
const getTestCredentials = () => {
  try {
    return JSON.parse(fs.readFileSync('tests/testData.json', 'utf-8'));
  } catch {
    return null;
  }
};

test.describe('Login / Session Management', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    let credentials = getTestCredentials();

    if (!credentials) {
      const registrationPage = new RegistrationPage(page);
      const email = generateUniqueEmail();
      const password = process.env.PASSWORD!;

      await registrationPage.navigateToRegistrationPage();
      await registrationPage.registerUser({
        gender: 'male',
        firstName: 'Test',
        lastName: 'User',
        email: email,
        password: password,
        confirmPassword: password,
      });

      await registrationPage.verifySuccessfulRegistration();
      credentials = { email, password };
      fs.writeFileSync('tests/testData.json', JSON.stringify(credentials));

      await loginPage.navigate('/logout');
    }

    await loginPage.navigateToLoginPage();
    await loginPage.verifyOnLoginPage();
    await loginPage.loginWithCredentials(credentials);
    await loginPage.verifyLoggedIn();
    await loginPage.verifyUserEmail(credentials.email);
  });

  test('should maintain logged-in state and verify session persistence', async ({ page }) => {
    const credentials = getTestCredentials();

    if (!credentials) {
      test.skip();
    }

    await loginPage.navigateToLoginPage();
    await loginPage.loginWithCredentials(credentials!);
    await loginPage.verifyLoggedIn();
    await loginPage.refreshPage();
    await loginPage.verifyLoggedIn();
    await loginPage.verifyUserEmail(credentials!.email);
    await loginPage.navigate('/books');
    await loginPage.verifyLoggedIn();
    await loginPage.navigate('/computers');
    await loginPage.verifyLoggedIn();
  });

  test('should successfully logout and confirm logged-out state', async ({ page }) => {
    const credentials = getTestCredentials();

    if (!credentials) {
      test.skip();
    }

    await loginPage.navigateToLoginPage();
    await loginPage.loginWithCredentials(credentials!);
    await loginPage.verifyLoggedIn();
    await loginPage.logout();

    await loginPage.verifyLoggedOut();
  });

  test('should display error for invalid credentials', async ({ page }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.verifyOnLoginPage();

    await loginPage.login('invalid@email.com', 'wrongpassword');
    await loginPage.verifyLoginError('Login was unsuccessful');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should display validation error for empty credentials', async ({ page }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.verifyOnLoginPage();

    await loginPage.clickLoginButton();
    await loginPage.verifyLoginError('Login was unsuccessful');
  });

  test('should successfully login with remember me option', async ({ page }) => {
    const credentials = getTestCredentials();

    if (!credentials) {
      test.skip();
    }

    await loginPage.navigateToLoginPage();
    await loginPage.verifyOnLoginPage();

    await loginPage.loginWithCredentials(credentials!, true);
    await loginPage.verifyLoggedIn();
    await loginPage.refreshPage();
    await loginPage.verifyLoggedIn();
  });

  test('should prevent access and redirect to login for protected pages when logged out', async ({ page }) => {
    await loginPage.navigate('/');
    const isLoggedIn = await loginPage.isLoggedIn();

    if (isLoggedIn) {
      await loginPage.logout();
    }

    await loginPage.navigate('/customer/info');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
