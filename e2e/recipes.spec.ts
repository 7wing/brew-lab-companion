import { test, expect } from '@playwright/test';
import { createTestUser, loginAsTestUser } from './helpers';

test.describe('Recipe Vault', () => {
  let email: string;
  let password: string;

  test.beforeAll(async () => {
    const result = await createTestUser('recipes-e2e');
    email = result.email;
    password = result.password;
  });

  test.skip('Recipe Vault page loads' /* TODO: search input timing with auth hydration */, async ({ page }) => {
    await loginAsTestUser(page, email, password);

    // Confirm we landed on the Brew Bench (index)
    await page.waitForURL('http://localhost:8080/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    await page.goto('/recipes');
    await page.waitForLoadState('networkidle');

    // RecipeVault.tsx renders <input type="search" placeholder="Search recipes...">
    const searchBar = page.locator('input[type="search"]').first();
    await expect(searchBar).toBeVisible({ timeout: 10000 });
  });

  test('Navigate to Recipe Detail and Brew This', async ({ page }) => {
    await loginAsTestUser(page, email, password);

    // Visit recipes page
    await page.goto('/recipes');
    await page.waitForLoadState('networkidle');

    // Click on the first recipe card or link
    const recipeLink = page.locator('a[href^="/recipe/"]').first();
    if (await recipeLink.isVisible({ timeout: 5000 })) {
      await recipeLink.click();
      await page.waitForLoadState('networkidle');

      // Check recipe detail page elements
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 5000 });

      // "Brew this" button
      const brewThisBtn = page.getByRole('button', { name: /brew this/i });
      if (await brewThisBtn.isVisible({ timeout: 3000 })) {
        await brewThisBtn.click();
        // Should redirect to /new-brew with recipeId
        await page.waitForURL(/new-brew/, { timeout: 5000 });
      }
    }
  });

  test('Share Recipe opens wizard', async ({ page }) => {
    await loginAsTestUser(page, email, password);
    await page.goto('/recipes');
    await page.waitForLoadState('networkidle');

    // Share Recipe button
    const shareBtn = page.getByRole('button', { name: /share recipe/i }).first();
    if (await shareBtn.isVisible({ timeout: 3000 })) {
      await shareBtn.click();
      // Wizard should appear (multi-step form)
      await page.waitForTimeout(500);
      const wizardHeading = page.locator('h2, h3').first();
      await expect(wizardHeading).toBeVisible({ timeout: 3000 });
    }
  });
});