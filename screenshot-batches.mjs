import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  // Navigate to auth page
  await page.goto('http://localhost:3457/auth');
  await page.waitForTimeout(2000);

  // Log in
  await page.locator('input[name="email"]').fill('mead.master@example.com');
  await page.locator('input[name="password"]').fill('TestPass123!');
  await page.locator('button[type="submit"]').click();

  // Wait for home page
  await page.waitForURL('http://localhost:3457/', { timeout: 10000 });
  await page.waitForTimeout(3000);

  // Screenshot: Home page (desktop)
  await page.screenshot({ path: '/project/workspace/.kimchi/docs/home-desktop.png', fullPage: true });
  console.log('Saved: home-desktop.png');

  // Screenshot: Home page (mobile)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/project/workspace/.kimchi/docs/home-mobile.png', fullPage: true });
  console.log('Saved: home-mobile.png');

  // Reset to desktop
  await page.setViewportSize({ width: 1440, height: 900 });

  const batches = [
    { id: '0684c8be-f6ad-4c9b-aa5b-a58bb7c4e697', name: 'Summer Saison', status: 'brew_day' },
    { id: 'f3f81bf4-f13d-4963-856a-bd449f8a5f5b', name: 'Citra IPA', status: 'fermenting' },
    { id: '01eda811-be14-4be7-8dd1-dc12ca26190a', name: 'Traditional Mead', status: 'fermenting' },
    { id: '65ed3c6a-5655-446f-a141-a30f7c276c9b', name: 'Dry-Hopped Pale Ale', status: 'conditioning' },
    { id: '52e6cbe8-1d9a-420f-ad35-2a6af5229661', name: 'Blackberry Cider', status: 'packaging' },
    { id: 'd564bd18-7de6-43b4-8622-8748572b2b6a', name: 'Oatmeal Stout', status: 'batch_shelf' },
  ];

  for (const batch of batches) {
    await page.goto(`http://localhost:3457/batch/${batch.id}`);
    await page.waitForTimeout(2000);

    const filename = `batch-${batch.status}.png`;
    await page.screenshot({ path: `/project/workspace/.kimchi/docs/${filename}`, fullPage: true });
    console.log(`Saved: ${filename} (${batch.name})`);
  }

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: '/project/workspace/.kimchi/docs/error.png', fullPage: true });
} finally {
  await browser.close();
}
