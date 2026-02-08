import { test } from '@playwright/test';

const LOGIN_URL =
  'https://rapidcaretranscription.greythr.com/uas/portal/auth/login';

test('Attendance Sign In with popup retry', async ({ page }) => {
  // 1️⃣ Login
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

  await page.getByRole('textbox', { name: 'Login ID' }).fill(
    process.env.USERNAME!
  );
  await page.getByRole('textbox', { name: 'Password' }).fill(
    process.env.PASSWORD!
  );
  await page.getByRole('button', { name: 'Login' }).click();

  // 2️⃣ Wait for dashboard Sign In
  const dashboardSignInBtn = page
    .locator('gt-attendance-info')
    .getByRole('button', { name: 'Sign In' });

  await dashboardSignInBtn.waitFor({ state: 'visible', timeout: 20000 });

  // 🔁 Popup retry loop
  const MAX_POPUP_RETRIES = 3;
  let popupReady = false;

  for (let attempt = 1; attempt <= MAX_POPUP_RETRIES; attempt++) {
    console.log(`Popup attempt ${attempt}`);

    await dashboardSignInBtn.click();

    const popup = page
      .locator('gt-popup-modal[open]')
      .filter({ hasText: 'You are not signed in yet' });

    await popup.waitFor({ state: 'attached', timeout: 10000 });

    const locationDropdown = popup
      .getByRole('button')
      .filter({ hasText: /^Select$/ });

    const dropdownVisible = await locationDropdown
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (dropdownVisible) {
      console.log('Dropdown loaded successfully');

      await page.screenshot({
        path: `test-results/attempt-${attempt}-popup-ready.png`,
        fullPage: true,
      });

      // Select Office
      await locationDropdown.click();
      await popup.getByText('Office', { exact: true }).click();

      await page.screenshot({
        path: `test-results/attempt-${attempt}-office-selected.png`,
        fullPage: true,
      });

      // 🔽 NEW PART: Click popup Sign In safely
      const popupSignInBtn = popup.getByRole('button', {
        name: 'Sign In',
      });

      // Wait until enabled
      await popupSignInBtn.waitFor({
        state: 'visible',
        timeout: 5000,
      });

      await popupSignInBtn.waitFor({
        state: 'attached',
      });

      // Extra guard: wait until not disabled
      await page.waitForFunction(
        (btn) => !btn.hasAttribute('disabled'),
        await popupSignInBtn.elementHandle()
      );

      await popupSignInBtn.click();

      await page.screenshot({
        path: `test-results/attempt-${attempt}-final-signin-clicked.png`,
        fullPage: true,
      });

      popupReady = true;
      break;
    }

    // ❌ Dropdown not visible → close popup safely
    console.warn('Dropdown not loaded, closing popup');

    await page.screenshot({
      path: `test-results/attempt-${attempt}-dropdown-missing.png`,
      fullPage: true,
    });

    const closeBtn = popup.locator('button:has(i), i').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }

    await page.waitForTimeout(1000);
  }

  if (!popupReady) {
    throw new Error(
      'Work location dropdown did not load after multiple popup retries'
    );
  }

  console.log('Attendance popup handled successfully');
});
