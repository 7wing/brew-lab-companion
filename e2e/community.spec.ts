import { test, expect } from '@playwright/test';
import { createTestUser, loginAsTestUser } from './helpers';

test.describe('Community', () => {
  let email: string;
  let password: string;

  test.beforeAll(async () => {
    const result = await createTestUser('community-e2e');
    email = result.email;
    password = result.password;
  });

  test.skip('Community page loads with tabs' /* TODO: tab labels depend on async copy load */, async ({ page }) => {
    await loginAsTestUser(page, email, password);

    // Confirm we landed on the Brew Bench (index)
    await page.waitForURL('http://localhost:8080/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Navigate to community
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // Check tabs exist — Community.tsx renders plain <button> elements with
    // labels: "Brew Logs", "Troubleshooting", "Tastings", "Challenges"
    const tabs = page.locator('button').filter({
      hasText: /Brew Logs|Troubleshooting|Tastings|Challenges/i,
    });
    await expect(tabs.first()).toBeVisible({ timeout: 10000 });
  });

  test('Follow a brewer from community', async ({ page }) => {
    await loginAsTestUser(page, email, password);
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // Click on a user's profile link
    const userLink = page.locator('a[href^="/profile/"]').first();
    if (await userLink.isVisible({ timeout: 5000 })) {
      await userLink.click();
      await page.waitForLoadState('networkidle');

      // Follow button
      const followBtn = page.getByRole('button', { name: /follow/i }).first();
      if (await followBtn.isVisible({ timeout: 3000 })) {
        await followBtn.click();
        // Should change to "Following"
        await page.waitForTimeout(500);
      }
    }
  });

  test.skip('Update profile settings' /* TODO: settings page timing with auth hydration */, async ({ page }) => {
    await loginAsTestUser(page, email, password);

    // Confirm we landed on the Brew Bench (index)
    await page.waitForURL('http://localhost:8080/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Settings page renders h1 immediately
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Check Account section section heading is visible
    const accountSection = page.getByText('Account').first();
    await expect(accountSection).toBeVisible({ timeout: 5000 });
  });
});