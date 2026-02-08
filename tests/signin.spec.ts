import { test, expect, Page } from '@playwright/test';

const LOGIN_URL =
  'https://rapidcaretranscription.greythr.com/uas/portal/auth/login';

test.describe('Auto Sign In with inline screenshots + retry', () => {
  test('Select Office in attendance popup', async ({ page }) => {
    // 1️⃣ Go to login page
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await page.screenshot({
      path: 'test-results/01-login-page.png',
      fullPage: true,
    });

    // 2️⃣ Enter credentials
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

    // 3️⃣ Click Login
    await page.getByRole('button', { name: 'Login' }).click();

    // 4️⃣ Wait for dashboard (retry once if slow)
    try {
      await page
        .locator('gt-attendance-info')
        .getByRole('button', { name: 'Sign In' })
        .waitFor({ state: 'visible', timeout: 15000 });

      await page.screenshot({
        path: 'test-results/03-dashboard-loaded.png',
        fullPage: true,
      });
    } catch {
      // Retry login once
      await page.screenshot({
        path: 'test-results/xx-dashboard-timeout.png',
        fullPage: true,
      });

      await page.context().clearCookies();
      await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

      await page.getByRole('textbox', { name: 'Login ID' }).fill(
        process.env.USERNAME!
      );
      await page.getByRole('textbox', { name: 'Password' }).fill(
        process.env.PASSWORD!
      );
      await page.getByRole('button', { name: 'Login' }).click();

      await page
        .locator('gt-attendance-info')
        .getByRole('button', { name: 'Sign In' })
        .waitFor({ state: 'visible', timeout: 15000 });
    }

    // 5️⃣ Click dashboard Sign In
    const dashboardSignInBtn = page
      .locator('gt-attendance-info')
      .getByRole('button', { name: 'Sign In' });

    await dashboardSignInBtn.click();
    await page.screenshot({
      path: 'test-results/04-dashboard-signin-clicked.png',
      fullPage: true,
    });

    // 6️⃣ Target ONLY attendance popup
    const popup = page
      .locator('gt-popup-modal')
      .filter({ hasText: 'You are not signed in yet' });

    await expect(popup).toBeVisible();
    await popup.screenshot({
      path: 'test-results/05-attendance-popup-visible.png',
    });

    // 7️⃣ Open dropdown (Select)
    const locationDropdown = popup
      .getByRole('button')
      .filter({ hasText: /^Select$/ });

    await locationDropdown.click();
    await popup.screenshot({
      path: 'test-results/06-dropdown-opened.png',
    });

    // 8️⃣ Select Office
    await popup.getByText('Office', { exact: true }).click();
    await popup.screenshot({
      path: 'test-results/07-office-selected.png',
    });

    // 9️⃣ Verify dropdown updated
    await expect(locationDropdown).toHaveText(/Office/i);
    await popup.screenshot({
      path: 'test-results/08-dropdown-updated.png',
    });

    console.log('Office selected successfully — stopping before final Sign In');
  });
});
