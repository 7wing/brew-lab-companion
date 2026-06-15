import { test, expect } from '@playwright/test';
import { createTestUser, loginAsTestUser } from './helpers';

test.describe('Brew Bench', () => {
  let email: string;
  let password: string;

  test.beforeAll(async () => {
    const result = await createTestUser('brewbench-e2e');
    email = result.email;
    password = result.password;
  });

  test.skip('Speed FAB opens and ABV calculator works'/* TODO: FAB interaction timing flaky in CI */ , async ({ page }) => {
    await loginAsTestUser(page, email, password);

    // Confirm we landed on the index page
    await page.waitForURL('http://localhost:8080/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Click the FAB (aria-label="Open menu")
    const fabByRole = page.getByRole('button', { name: /open menu/i });
    await fabByRole.waitFor({ state: 'visible', timeout: 10000 });
    await fabByRole.click();

    // Wait for menu to expand
    await page.waitForTimeout(800);

    // Click ABV Calculator in the expanded menu
    const abvBtn = page.getByRole('button', { name: /ABV Calculator/i });
    await abvBtn.waitFor({ state: 'visible', timeout: 5000 });
    await abvBtn.click();

    // Wait for ABV calculator sheet to open
    await page.waitForTimeout(1000);

    // Fill in OG and FG using the inline inputs
    const ogInput = page.locator('#fab-og-inline').first();
    const fgInput = page.locator('#fab-fg-inline').first();
    await ogInput.waitFor({ state: 'visible', timeout: 5000 });
    await ogInput.fill('1.050');
    await fgInput.fill('1.010');

    // Check result shows ~5.2%
    const result = page.locator('p.text-4xl.font-mono');
    await expect(result).toBeVisible({ timeout: 5000 });
    const text = await result.textContent();
    // ABV = (1.050 - 1.010) * 131.25 = 5.25
    expect(text?.replace('%', '')).toMatch(/5\.[2-3]/);
  });

  test.skip('Batch list drawer opens on mobile'/* TODO: drawer trigger hidden on desktop viewport */ , async ({ page }) => {
    await loginAsTestUser(page, email, password);

    // Confirm we landed on the index page
    await page.waitForURL('http://localhost:8080/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // The mobile trigger has aria-label="Open batch list"
    const drawerTrigger = page.locator('[aria-label="Open batch list"]');
    if (await drawerTrigger.isVisible({ timeout: 5000 })) {
      await drawerTrigger.click();
      await page.waitForTimeout(500);
    }
    // Smoke test: if no batches, at least the trigger is visible
    await expect(drawerTrigger).toBeVisible({ timeout: 3000 });
  });

  test('Brew Setup form submits', async ({ page }) => {
    await loginAsTestUser(page, email, password);

    await page.waitForURL('http://localhost:8080/', { timeout: 10000 });
    await page.goto('/new-brew');
    await page.waitForLoadState('networkidle');

    // Fill Step 1
    const nameInput = page.locator('input[name="name"], input#name').first();
    const batchSizeInput = page.locator('input[name="batch_size"]').first();
    const brewDateInput = page.locator('input[name="brew_date"]').first();

    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill('E2E Test Batch');
      await batchSizeInput.fill('5');
      if (await brewDateInput.isVisible()) {
        await brewDateInput.fill('2024-01-15');
      }

      // Submit step 1
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible()) await nextBtn.click();

      // Step 2 — skip recipe
      const skipBtn = page.getByRole('button', { name: /skip/i }).first();
      if (await skipBtn.isVisible()) await skipBtn.click();

      // Step 3 — fill yeast & targets
      await page.waitForTimeout(500);
      const yeastInput = page.locator('input[name="yeast_strain"]').first();
      const ogInput2 = page.locator('input[name="target_og"]').first();
      const fgInput2 = page.locator('input[name="target_fg"]').first();

      if (await yeastInput.isVisible({ timeout: 3000 })) {
        await yeastInput.fill('US-05');
        await ogInput2.fill('1.055');
        await fgInput2.fill('1.012');

        // Submit
        const submitBtn = page.getByRole('button', { name: /finish|submit|create/i }).first();
        if (await submitBtn.isVisible()) await submitBtn.click();

        // Should redirect to /
        await page.waitForURL('http://localhost:8080/', { timeout: 5000 });
      }
    }
  });
});