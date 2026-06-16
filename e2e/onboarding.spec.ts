import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test.setTimeout(60000);

  const seedAccounts = [
    { email: 'hoppy.brewer@example.com', password: 'TestPass123!' },
    { email: 'kombucha.queen@example.com', password: 'TestPass123!' },
    { email: 'mead.master@example.com', password: 'TestPass123!' },
    { email: 'sourdough.sam@example.com', password: 'TestPass123!' },
    { email: 'cider.sid@example.com', password: 'TestPass123!' },
  ];

  for (const account of seedAccounts) {
    test(`Existing seed account login: ${account.email}`, async ({ page }) => {
      // 1. Go to auth page
      await page.goto('/auth');

      // 2. Make sure on Sign in tab
      const signInTab = page.getByRole('tab', { name: /sign in/i });
      if (await signInTab.isVisible().catch(() => false)) {
        await signInTab.click();
      }

      // 3. Fill credentials
      await page.locator('[name="email"]').fill(account.email);
      await page.locator('[name="password"]').fill(account.password);

      // 4. Click sign-in submit
      const submitButton = page.locator('form button[type="submit"]');
      await submitButton.click();

      // 5. Wait for redirect — should be /
      await page.waitForURL('http://localhost:8080/', { timeout: 15000 });
      await expect(page).toHaveURL('http://localhost:8080/');
    });
  }
});
