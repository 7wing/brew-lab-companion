import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto('http://localhost:3456/auth');
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/auth-laptop.png', fullPage: true });
console.log('Screenshot saved to /tmp/auth-laptop.png');
await browser.close();
