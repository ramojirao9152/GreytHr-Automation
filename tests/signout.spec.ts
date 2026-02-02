import { test, expect } from '@playwright/test';

test('Auto Sign Out', async ({ page }) => {
  await page.goto('https://rapidcaretranscription.greythr.com/');

  // Wait for redirect to login page
  await page.waitForURL(/login/);

  // Assert auto logout happened
  expect(page.url()).toContain('login');

  // Screenshot proof
  await page.screenshot({ path: 'test-results/auto-signout-proof.png', fullPage: true });
});
