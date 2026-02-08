import { test, expect } from '@playwright/test';

const LOGIN_URL =
  'https://rapidcaretranscription.greythr.com/uas/portal/auth/login';

test.describe('Auto Sign In with inline screenshots + retry', () => {
  test('Select Office in attendance popup', async ({ page }) => {
    // 1️⃣ Login page
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await page.screenshot({
      path: 'test-results/01-login-page.png',
      fullPage: true,
    });

    // 2️⃣ Credentials
    await page.getByRole('textbox', { name: 'Login ID' }).fill(
      process.env.USERNAME!
    );
    await page.getByRole('textbox', { name: 'Password' }).fill(
      process.env.PASSWORD!
    );
    await page.screenshot({
      path: 'test-results/02-credentials-filled.png',
      fullPage: true,
    });

    // 3️⃣ Login
    await page.getByRole('button', { name: 'Login' }).click();

    // 4️⃣ Dashboard Sign In (business signal)
    const dashboardSignInBtn = page
      .locator('gt-attendance-info')
      .getByRole('button', { name: 'Sign In' });

    await dashboardSignInBtn.waitFor({
      state: 'visible',
      timeout: 20000,
    });

    await page.screenshot({
      path: 'test-results/03-dashboard-loaded.png',
      fullPage: true,
    });

    // 5️⃣ Click dashboard Sign In
    await dashboardSignInBtn.click();

    // 6️⃣ WAIT for attendance popup to OPEN (not visible yet)
    const popup = page
      .locator('gt-popup-modal[open]')
      .filter({ hasText: 'You are not signed in yet' });

    await popup.waitFor({ state: 'attached', timeout: 10000 });

    // 7️⃣ NOW wait for dropdown inside popup (this is the real signal)
    const locationDropdown = popup
      .getByRole('button')
      .filter({ hasText: /^Select$/ });

    await locationDropdown.waitFor({
      state: 'visible',
      timeout: 10000,
    });

    await popup.screenshot({
      path: 'test-results/05-attendance-popup-ready.png',
    });

    // 8️⃣ Open dropdown
    await locationDropdown.click();
    await popup.screenshot({
      path: 'test-results/06-dropdown-opened.png',
    });

    // 9️⃣ Select Office
    await popup.getByText('Office', { exact: true }).click();
    await popup.screenshot({
      path: 'test-results/07-office-selected.png',
    });

    // 🔟 Verify update
    await expect(locationDropdown).toHaveText(/Office/i);
    await popup.screenshot({
      path: 'test-results/08-dropdown-updated.png',
    });

    console.log('Office selected successfully — stopping safely');
  });
});
