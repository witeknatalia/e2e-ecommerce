import { test, expect } from '@playwright/test';
import fs from 'fs';
import { RegistrationPage } from '../../pageObjects/user/registrationPage';

const generateUniqueEmail = () => `testuser${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

test.describe('User Registration', () => {
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
    await registrationPage.navigateToRegistrationPage();
    await registrationPage.verifyOnRegistrationPage();
  });

  test('should successfully register a new user with valid credentials', async ({ page }) => {
    const randomEmail = generateUniqueEmail();
    const password = process.env.PASSWORD!;

    await registrationPage.registerUser({
      gender: 'male',
      firstName: 'John',
      lastName: 'Doe',
      email: randomEmail,
      password: password,
      confirmPassword: password,
    });

    await registrationPage.verifySuccessfulRegistration();
    fs.writeFileSync('tests/testData.json', JSON.stringify({ email: randomEmail, password }));
  });

  test('should show validation error for mismatched passwords', async ({ page }) => {
    const randomEmail = generateUniqueEmail();
    const password = process.env.PASSWORD!;
    const wrongConfirmPassword = 'IncorrectPass456!';

    await registrationPage.registerUser({
      gender: 'female',
      firstName: 'Jane',
      lastName: 'Smith',
      email: randomEmail,
      password: password,
      confirmPassword: wrongConfirmPassword,
    });

    await registrationPage.verifyValidationError('The password and confirmation password do not match');
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    const invalidEmail = 'notavalidemail';
    const password = process.env.PASSWORD!;

    await registrationPage.registerUser({
      gender: 'male',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: invalidEmail,
      password: password,
      confirmPassword: password,
    });

    await registrationPage.verifyValidationError('Wrong email');
  });

  test('should show validation error for empty required fields', async ({ page }) => {
    await registrationPage.clickRegisterButton();
    await registrationPage.verifyRequiredFieldErrors();
  });

  test('should show validation error for password that is too short', async ({ page }) => {
    const randomEmail = generateUniqueEmail();
    const shortPassword = '123';

    await registrationPage.registerUser({
      gender: 'male',
      firstName: 'Mike',
      lastName: 'Wilson',
      email: randomEmail,
      password: shortPassword,
      confirmPassword: shortPassword,
    });

    await registrationPage.verifyPasswordValidationError();
  });

  test('should show error when registering with already existing email', async ({ page }) => {
    const existingEmail = generateUniqueEmail();
    const password = process.env.PASSWORD!;

    await registrationPage.registerUser({
      gender: 'male',
      firstName: 'Test',
      lastName: 'User',
      email: existingEmail,
      password: password,
      confirmPassword: password,
    });

    await registrationPage.verifySuccessfulRegistration();

    await registrationPage.navigate('/register');
    await registrationPage.verifyOnRegistrationPage();

    await registrationPage.registerUser({
      gender: 'female',
      firstName: 'Another',
      lastName: 'Person',
      email: existingEmail,
      password: password,
      confirmPassword: password,
    });

    await registrationPage.verifyErrorMessage('The specified email already exists');
  });

  test('should successfully register with all optional fields filled', async ({ page }) => {
    const randomEmail = generateUniqueEmail();
    const password = process.env.PASSWORD!;

    await registrationPage.registerUser({
      gender: 'female',
      firstName: 'Sarah',
      lastName: 'Anderson',
      email: randomEmail,
      password: password,
      confirmPassword: password,
    });

    await registrationPage.verifySuccessfulRegistration();
  });
});
