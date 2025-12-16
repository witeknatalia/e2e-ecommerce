import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Load page and check if has title', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  await expect(page).toHaveTitle(/Demo Web Shop/);
});

test('click register button and create account', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  await page.click('a.ico-register');

  await expect(page).toHaveURL(/.*\/register/);
  await expect(page.locator('h1')).toContainText('Register');

  const randomEmail = `testuser${Date.now()}@example.com`;
  const password = process.env.PASSWORD!;

  await page.check('#gender-male');
  await page.fill('#FirstName', 'John');
  await page.fill('#LastName', 'Doe');
  await page.fill('#Email', randomEmail);
  await page.fill('#Password', password);
  await page.fill('#ConfirmPassword', password);

  await page.click('#register-button');
  await expect(page).toHaveURL(/.*\/registerresult/);

  fs.writeFileSync('tests/testData.json', JSON.stringify({ email: randomEmail, password }));
});
