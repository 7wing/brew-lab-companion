# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: community.spec.ts >> Community >> Community page loads with tabs
- Location: e2e/community.spec.ts:14:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: /Brew Logs|Troubleshooting|Tastings|Challenges/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button').filter({ hasText: /Brew Logs|Troubleshooting|Tastings|Challenges/i }).first()

```

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { createTestUser, loginAsTestUser } from './helpers';
  3  | 
  4  | test.describe('Community', () => {
  5  |   let email: string;
  6  |   let password: string;
  7  | 
  8  |   test.beforeAll(async () => {
  9  |     const result = await createTestUser('community-e2e');
  10 |     email = result.email;
  11 |     password = result.password;
  12 |   });
  13 | 
  14 |   test('Community page loads with tabs', async ({ page }) => {
  15 |     await loginAsTestUser(page, email, password);
  16 | 
  17 |     // Confirm we landed on the Brew Bench (index)
  18 |     await page.waitForURL('http://localhost:8080/', { timeout: 10000 });
  19 |     await page.waitForLoadState('networkidle');
  20 | 
  21 |     // Navigate to community
  22 |     await page.goto('/community');
  23 |     await page.waitForLoadState('networkidle');
  24 | 
  25 |     // Check tabs exist — Community.tsx renders plain <button> elements with
  26 |     // labels: "Brew Logs", "Troubleshooting", "Tastings", "Challenges"
  27 |     const tabs = page.locator('button').filter({
  28 |       hasText: /Brew Logs|Troubleshooting|Tastings|Challenges/i,
  29 |     });
> 30 |     await expect(tabs.first()).toBeVisible({ timeout: 10000 });
     |                                ^ Error: expect(locator).toBeVisible() failed
  31 |   });
  32 | 
  33 |   test('Follow a brewer from community', async ({ page }) => {
  34 |     await loginAsTestUser(page, email, password);
  35 |     await page.goto('/community');
  36 |     await page.waitForLoadState('networkidle');
  37 | 
  38 |     // Click on a user's profile link
  39 |     const userLink = page.locator('a[href^="/profile/"]').first();
  40 |     if (await userLink.isVisible({ timeout: 5000 })) {
  41 |       await userLink.click();
  42 |       await page.waitForLoadState('networkidle');
  43 | 
  44 |       // Follow button
  45 |       const followBtn = page.getByRole('button', { name: /follow/i }).first();
  46 |       if (await followBtn.isVisible({ timeout: 3000 })) {
  47 |         await followBtn.click();
  48 |         // Should change to "Following"
  49 |         await page.waitForTimeout(500);
  50 |       }
  51 |     }
  52 |   });
  53 | 
  54 |   test('Update profile settings', async ({ page }) => {
  55 |     await loginAsTestUser(page, email, password);
  56 | 
  57 |     // Confirm we landed on the Brew Bench (index)
  58 |     await page.waitForURL('http://localhost:8080/', { timeout: 10000 });
  59 |     await page.waitForLoadState('networkidle');
  60 | 
  61 |     await page.goto('/settings');
  62 |     await page.waitForLoadState('networkidle');
  63 | 
  64 |     // Settings page renders h1 immediately
  65 |     const heading = page.locator('h1').first();
  66 |     await expect(heading).toBeVisible({ timeout: 10000 });
  67 | 
  68 |     // Check Account section section heading is visible
  69 |     const accountSection = page.getByText('Account').first();
  70 |     await expect(accountSection).toBeVisible({ timeout: 5000 });
  71 |   });
  72 | });
```