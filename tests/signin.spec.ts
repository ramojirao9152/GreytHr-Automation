import { test, expect } from '@playwright/test';

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

  await dashboardSignInBtn.waitFor({
    state: 'visible',
    timeout: 20000,
  });

  // 🔁 Popup retry loop
  const MAX_POPUP_RETRIES = 3;
  let popupReady = false;

  for (let attempt = 1; attempt <= MAX_POPUP_RETRIES; attempt++) {
    console.log(`Popup attempt ${attempt}`);

    // 3️⃣ Click dashboard Sign In
    await dashboardSignInBtn.click();

    // 4️⃣ Locate attendance popup (open one)
    const popup = page
      .locator('gt-popup-modal[open]')
      .filter({ hasText: 'You are not signed in yet' });

    await popup.waitFor({ state: 'attached', timeout: 10000 });

    // 5️⃣ Try waiting for dropdown
    const locationDropdown = popup
      .getByRole('button')
      .filter({ hasText: /^Select$/ });

    const dropdownVisible = await locationDropdown
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (dropdownVisible) {
      console.log('Dropdown loaded successfully');

      await popup.screenshot({
        path: `test-results/popup-ready-attempt-${attempt}.png`,
      });

      // ✅ Select Office
      await locationDropdown.click();
      await popup.getByText('Office', { exact: true }).click();

      await popup.screenshot({
        path: `test-results/office-selected-attempt-${attempt}.png`,
      });

      popupReady = true;
      break;
    }

    // ❌ Dropdown not visible → close popup
    console.warn('Dropdown not loaded, closing popup');

    await popup.screenshot({
      path: `test-results/popup-no-dropdown-attempt-${attempt}.png`,
    });

    // Click ❌ (close icon)
    await popup
      .locator('button, i')
      .filter({ hasText: '' }) // cross icon has no text
      .first()
      .click();

    // Small pause to let UI settle
    await page.waitForTimeout(1000);
  }

  // 🚨 Fail if dropdown never appeared
  if (!popupReady) {
    throw new Error(
      'Work location dropdown did not load after multiple popup retries'
    );
  }

  console.log('Attendance popup handled successfully');
});
