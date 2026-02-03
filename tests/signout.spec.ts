import { test, expect } from '@playwright/test';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

test.describe.configure({ retries: 2 });

test('Auto Sign In safely with screenshots', async ({ page }) => {

  // 1️⃣ Login page
  await page.goto('https://rapidcaretranscription.greythr.com/uas/portal/auth/login');

  await page.fill('input[name="username"]', USERNAME);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button:has-text("Login")');

  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: 'test-results/01-after-login.png', fullPage: true });

  // 2️⃣ Click Sign In (first button)
  const signInBtn = page.getByRole('button', { name: 'Sign Out' });
  await signInBtn.waitFor({ state: 'visible' });
  await signInBtn.click();

  await page.screenshot({ path: 'test-results/02-after-signin-click.png', fullPage: true });

  // 3️⃣ Select Office
  const officeBtn = page.getByText('Office');
  await officeBtn.waitFor({ state: 'visible' });
  await officeBtn.click();

  await page.screenshot({ path: 'test-results/03-after-office-selected.png', fullPage: true });
  await page.locator('gt-popup-modal').getByRole('button', { name: 'Sign Out' }).click();
  

  await page.screenshot({ path: 'test-results/03-after-SignOut-clicked.png', fullPage: true });
  // ⛔ STOP HERE — do NOT confirm attendance
  console.log('Stopped before final Sign In confirmation to avoid attendance issue');

});
