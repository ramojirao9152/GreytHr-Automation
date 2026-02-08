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

  // await page.screenshot({ path: 'test-results/01-after-login.png', fullPage: true });

  // 2️⃣ Click Sign In (first button)
  const signInBtn = page.getByRole('button', { name: 'Sign In' });
  await signInBtn.waitFor({ state: 'visible' });
  await signInBtn.click();

  // await page.screenshot({ path: 'test-results/02-after-signin-click.png', fullPage: true });

  // 3️⃣ Select Office
  // Open dropdown
// Select Office
// Scope to popup
// 1️⃣ Target ONLY the attendance popup
const popup = page.locator('gt-popup-modal').filter({ hasText: 'You are not signed in yet' });

await expect(popup).toBeVisible();

// 2️⃣ Find dropdown when it shows "Select"
const locationDropdown = popup
  .getByRole('button')
  .filter({ hasText: /^Select$/ });

await expect(locationDropdown).toBeVisible();
await locationDropdown.click();

// 3️⃣ Select "Office" (custom dropdown)
const officeOption = popup
  .locator('li, div')
  .filter({ hasText: /^Office$/ })
  .first();

await expect(officeOption).toBeVisible();
await officeOption.click();

// 4️⃣ Verify dropdown value changed
await expect(locationDropdown).not.toHaveText(/^Select$/);
await expect(locationDropdown).toHaveText(/Office/i);

// 5️⃣ Screenshot proof
await popup.screenshot({
  path: 'test-results/popup-office-selected.png',
});



// Get the Sign In button inside popup
// const popupSignInBtn = page.locator('gt-popup-modal').getByRole('button', { name: 'Sign In' });

// ✅ Wait until it becomes enabled
// await expect(popupSignInBtn).toBeEnabled();

// Now click safely
// await popupSignInBtn.click();

  await page.screenshot({ path: 'test-results/03-after-SignIn-clicked.png', fullPage: true });
  // ⛔ STOP HERE — do NOT confirm attendance
  console.log('Stopped before final Sign In confirmation to avoid attendance issue');

});
