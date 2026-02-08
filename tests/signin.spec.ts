import { test, expect, Page } from '@playwright/test';

const LOGIN_URL =
  'https://rapidcaretranscription.greythr.com/uas/portal/auth/login';

// 🔁 Login with retry if dashboard loads slowly
async function loginWithRetry(page: Page, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    console.log(`Login attempt ${attempt}`);

    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

    await page.getByRole('textbox', { name: 'Login ID' }).fill(
      process.env.USERNAME!
    );
    await page.getByRole('textbox', { name: 'Password' }).fill(
      process.env.PASSWORD!
    );
    await page.getByRole('button', { name: 'Login' }).click();

    try {
      // ✅ Business signal: dashboard attendance Sign In button
      const dashboardSignInBtn = page
        .locator('gt-attendance-info')
        .getByRole('button', { name: 'Sign In' });

      await dashboardSignInBtn.waitFor({
        state: 'visible',
        timeout: 15000, // ⏳ max wait after login
      });

      console.log('Dashboard loaded successfully');
      return; // ✅ success
    } catch (error) {
      console.warn('Dashboard load timeout');

      await page.screenshot({
        path: `test-results/login-timeout-attempt-${attempt}.png`,
        fullPage: true,
      });

      if (attempt > maxRetries) {
        throw new Error('Login failed after multiple retries');
      }

      // 🔁 Reset session and retry
      await page.context().clearCookies();
      await page.reload();
    }
  }
}

test.describe('Auto Sign In safely with retry + screenshot', () => {
  test('Select Office in attendance popup', async ({ page }) => {
    // 1️⃣ Login (with retry if dashboard is slow)
    await loginWithRetry(page);

    // 2️⃣ Click dashboard Sign In (NOT popup one)
    const dashboardSignInBtn = page
      .locator('gt-attendance-info')
      .getByRole('button', { name: 'Sign In' });

    await expect(dashboardSignInBtn).toBeVisible();
    await dashboardSignInBtn.click();

    // 3️⃣ Target ONLY the attendance popup
    const popup = page
      .locator('gt-popup-modal')
      .filter({ hasText: 'You are not signed in yet' });

    await expect(popup).toBeVisible();

    // 4️⃣ Find dropdown when it shows "Select"
    const locationDropdown = popup
      .getByRole('button')
      .filter({ hasText: /^Select$/ });

    await expect(locationDropdown).toBeVisible();
    await locationDropdown.click();

    // 5️⃣ Select "Office"
    const officeOption = popup.getByText('Office', { exact: true });
    await expect(officeOption).toBeVisible();
    await officeOption.click();

    // 6️⃣ Verify dropdown value changed
    await expect(locationDropdown).toHaveText(/Office/i);

    // 📸 Screenshot after Office selection
    await popup.screenshot({
      path: 'test-results/popup-office-selected.png',
    });

    console.log('Office selected successfully — stopping before final Sign In');
  });
});
