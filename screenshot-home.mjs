import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  // Navigate to the app
  await page.goto('http://localhost:3457/auth');
  await page.waitForTimeout(2000);

  // The auth UI uses supabase auth-ui-react
  // Fill in email and password
  await page.locator('input[name="email"]').fill('mead.master@example.com');
  await page.locator('input[name="password"]').fill('TestPass123!');
  await page.locator('button[type="submit"]').click();

  // Wait for navigation to home page
  await page.waitForURL('http://localhost:3457/', { timeout: 10000 });
  await page.waitForTimeout(3000);

  // Take desktop screenshot
  await page.screenshot({ path: '/tmp/home-desktop.png', fullPage: true });
  console.log('Desktop screenshot saved to /tmp/home-desktop.png');

  // Take mobile screenshot
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/home-mobile.png', fullPage: true });
  console.log('Mobile screenshot saved to /tmp/home-mobile.png');

} catch (err) {
  console.error('Error:', err.message);
  // Save error screenshot for debugging
  await page.screenshot({ path: '/tmp/home-error.png', fullPage: true });
  console.log('Error screenshot saved to /tmp/home-error.png');
} finally {
  await browser.close();
}
