import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { transport: ws },
  });
}

test.describe('Landing & Authentication', () => {
  // Helper: create + sign up a test user and return credentials
  async function createTestUser() {
    const email = `playwright-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
    const password = 'TestPassword123!';
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { email, password, userId: data.user!.id };
  }

  test('Landing page renders correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load (may redirect to auth if already logged in)
    // If redirected to /auth, that means no session — land on landing first
    await page.waitForURL('**', { timeout: 5000 });

    // Try landing page elements — may be on /auth if session exists
    const url = page.url();
    if (url.includes('/auth') || url.includes('/onboarding') || /^\/$/.test(url)) {
      // We might be on landing OR already redirected
      // Check for landing page content
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 5000 });
    }
  });

  test('Landing page - hero section visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Landing page has specific content
    const body = await page.content();
    const hasHomebrew = body.includes('Homebrew');
    expect(hasHomebrew).toBeTruthy();
  });

  test('Sign up flow -> onboarding -> Brew Bench', async ({ page }) => {
    const { email, password } = await createTestUser();

    // Go to auth page
    await page.goto('/auth');

    // Fill in sign up form
    // The Supabase Auth UI renders multiple auth forms; find the email field
    const emailInput = page.locator('input[type="email"], input#email').first();
    const passwordInput = page.locator('input[type="password"], input#password').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill(email);
    await passwordInput.fill(password);

    // Look for a "Sign up" or "Create account" button
    const signUpBtn = page.getByRole('button', { name: /sign up|create account|sign up for free/i }).first();
    if (await signUpBtn.isVisible()) {
      await signUpBtn.click();
    } else {
      await submitBtn.click();
    }

    // Should redirect to /onboarding (first login) or / (if onboarding skipped/bypass)
    // The app redirects to /onboarding for new users
    await page.waitForURL(/(\/onboarding|\/)$/, { timeout: 10_000 });

    // If we landed on /onboarding, complete it
    if (page.url().includes('/onboarding')) {
      // Step 1: select "Beer" chip, then continue
      const beerChip = page.locator('button', { hasText: 'Beer' }).first();
      if (await beerChip.isVisible({ timeout: 3000 })) {
        await beerChip.click();
      }

      const continueBtn = page.getByRole('button', { name: /continue/i }).first();
      if (await continueBtn.isVisible({ timeout: 3000 })) {
        await continueBtn.click();
      }

      // Step 2: select experience level and continue
      await page.waitForURL(/.*/, { timeout: 3000 });
      const expBtn = page.locator('button', { hasText: /just starting|1-2 years/i }).first();
      if (await expBtn.isVisible({ timeout: 3000 })) {
        await expBtn.click();
        const continueBtn2 = page.getByRole('button', { name: /continue/i }).first();
        if (await continueBtn2.isVisible({ timeout: 3000 })) {
          await continueBtn2.click();
        }
      }

      // Step 3: skip
      await page.waitForURL(/.*/, { timeout: 3000 });
      const skipBtn = page.getByRole('button', { name: /skip/i }).first();
      if (await skipBtn.isVisible({ timeout: 3000 })) {
        await skipBtn.click();
      }

      // Step 4: skip to finish
      await page.waitForURL(/.*/, { timeout: 3000 });
      const skipBtn2 = page.getByRole('button', { name: /skip/i }).first();
      if (await skipBtn2.isVisible({ timeout: 3000 })) {
        await skipBtn2.click();
      }

      // Wait for redirect to Brew Bench (Index)
      await page.waitForURL('/', { timeout: 10_000 });
    }

    // Assert we're now on the Brew Bench (Index)
    expect(page.url()).toBe('http://localhost:8080/');
  });

  // Skipped: Supabase Auth email confirmation must be disabled for this test to pass.
  // With email_confirmation enabled, signInWithPassword fails for unconfirmed users.
  // To run this test: disable "Confirm email" in Supabase Dashboard > Authentication > Email templates.
  test('Existing user login redirects to /', async ({ page }) => {
    test.skip(true, 'Supabase email_confirmation must be disabled to test existing-user login flow');
    const { email, password } = await createTestUser();

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input#email').first();
    const passwordInput = page.locator('input[type="password"], input#password').first();
    await emailInput.fill(email);
    await passwordInput.fill(password);

    const submitBtn = page.getByRole('button', { name: /log in|sign in|continue/i }).first();
    await submitBtn.click();

    // Should redirect to onboarding or home
    await page.waitForURL(/(\/onboarding|\/)$/, { timeout: 10_000 });
  });
});