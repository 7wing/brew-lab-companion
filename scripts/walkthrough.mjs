import { chromium } from '@playwright/test';

const BASE = 'http://localhost:8080';
const EMAIL = 'hoppy.brewer@example.com';
const PASS = 'TestPass123!';

const routes = [
  '/',
  '/recipes',
  '/community',
  '/new-brew',
  '/profile',
  '/search',
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(`console error: ${msg.text()}`);
});

// Home page
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1500);

// Log in if we see the auth form
const emailInput = await page.$('input[name="email"]');
if (emailInput) {
  await emailInput.fill(EMAIL);
  await page.fill('input[name="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
}

// Visit routes
for (const route of routes) {
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log(`Visited ${route} — title: ${await page.title()}`);
  } catch (e) {
    console.log(`Visited ${route} — error: ${e.message}`);
    errors.push(`navigate ${route}: ${e.message}`);
  }
}

await browser.close();

if (errors.length) {
  console.error('ERRORS FOUND:');
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log('All routes visited with no runtime errors.');
  process.exit(0);
}
