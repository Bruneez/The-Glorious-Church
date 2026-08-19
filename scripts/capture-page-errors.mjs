import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const ROUTES = ['/creative-arts', '/ministries', '/schools', '/attendance', '/dashboard'];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(`[console] ${msg.text()}`);
  }
});
page.on('pageerror', (error) => {
  consoleErrors.push(`[pageerror] ${error.message}`);
});

for (const route of ROUTES) {
  consoleErrors.length = 0;
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 30000 }).catch((error) => {
    console.log(`${route}: navigation failed — ${error.message}`);
  });

  await page.waitForTimeout(2000);

  const bodyText = await page.locator('main').innerText().catch(() => '');
  const hasBoundary = bodyText.includes('Something went wrong') || bodyText.includes('could not be loaded');

  console.log(`\n=== ${route} ===`);
  console.log(`Boundary visible: ${hasBoundary}`);
  if (hasBoundary) {
    console.log(bodyText.slice(0, 400));
  }
  if (consoleErrors.length) {
    console.log('Errors:');
    consoleErrors.forEach((entry) => console.log(`  ${entry}`));
  } else {
    console.log('No console/page errors captured.');
  }
}

await browser.close();
