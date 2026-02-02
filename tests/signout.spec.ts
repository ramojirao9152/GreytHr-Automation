import { test } from '@playwright/test';

const USERNAME = process.env.USERNAME!;
const PASSWORD = process.env.PASSWORD!;

test.describe.configure({ retries: 2 });

test('Auto Sign In', async ({ page }) => {
  await page.goto('https://rapidcaretranscription.greythr.com/uas/portal/auth/login');
  await page.fill('input[name="username"]', USERNAME);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `signout-proof.png`, fullPage: true });
});
