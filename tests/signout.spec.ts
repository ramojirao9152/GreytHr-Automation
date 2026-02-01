import { test } from '@playwright/test';

test.describe.configure({ retries: 2 });

test('Auto Sign Out', async ({ page }) => {
  await page.goto('https://rapidcaretranscription.greythr.com/');
  await page.click('button:has-text("Sign Out")');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `signout-proof.png`, fullPage: true });
});
