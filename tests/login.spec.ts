import { test, expect } from '@playwright/test';
import fs from 'fs';

test('login with registered user credentials', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  await page.click('a.ico-login');

  await expect(page).toHaveURL(/.*\/login/);

  const testData = JSON.parse(fs.readFileSync('tests/testData.json', 'utf-8'));
  const email = testData.email;
  const password = testData.password;

  await page.fill('#Email', email);
  await page.fill('#Password', password);
  await page.click('.login-button');

  await expect(page).toHaveURL('https://demowebshop.tricentis.com/');
  await expect(page.locator('a.ico-logout')).toBeVisible();
});
