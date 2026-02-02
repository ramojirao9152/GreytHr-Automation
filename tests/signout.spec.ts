import { test } from '@playwright/test';

test.describe.configure({ retries: 2 });

test('Auto Sign Out', async ({ page }) => {
  await page.goto('https://rapidcaretranscription.greythr.com/');

  // wait for login if redirected
  if (page.url().includes('login')) {
    await page.fill('#username', process.env.USERNAME!);
    await page.fill('#password', process.env.PASSWORD!);
    await page.click('button[type="submit"]');
  }

  await page.waitForLoadState('networkidle');

  // await page.click('button:has-text("Sign Out")');
});
