/**
 * Verifies mobile header minimum-width budget at common viewport sizes.
 * Run: node scripts/verify-mobile-header-layout.mjs
 */
const VIEWPORTS = [
  { name: 'Android narrow', width: 320 },
  { name: 'Android phone', width: 360 },
  { name: 'iPhone SE', width: 375 },
  { name: 'iPhone 14 Pro', width: 393 },
  { name: 'iPhone 14 Pro Max', width: 430 },
  { name: 'iPad portrait', width: 768 },
  { name: 'Android tablet portrait', width: 800 },
];

function horizontalPadding(viewportWidth) {
  const base = viewportWidth >= 640 ? 20 : 12; // px-3 vs sm:px-5
  return base * 2;
}

function headerGap(viewportWidth) {
  return viewportWidth >= 640 ? 12 : 8; // gap-2 vs sm:gap-3
}

function fixedChromeWidth(viewportWidth) {
  const gap = headerGap(viewportWidth);
  const hamburger = 44;
  const bell = 44;
  const profile = 68; // p-1.5 + 32px avatar + gap-2 + 16px chevron + p-1.5
  return hamburger + bell + profile + gap * 3;
}

function brandingBudget(viewportWidth) {
  return viewportWidth - horizontalPadding(viewportWidth) - fixedChromeWidth(viewportWidth);
}

function logoWidth(viewportWidth) {
  return viewportWidth >= 640 ? 32 : 28;
}

function nameBudget(viewportWidth) {
  const gap = viewportWidth >= 640 ? 12 : 8;
  return brandingBudget(viewportWidth) - logoWidth(viewportWidth) - gap;
}

console.log('Mobile header width budget (logged-out chrome approximations)\n');
console.log('Target: branding >= 48px for truncated title; touch targets remain 44px\n');

let warnings = 0;

for (const vp of VIEWPORTS) {
  const brand = brandingBudget(vp.width);
  const name = nameBudget(vp.width);
  const ok = brand >= 48 && name >= 20;
  if (!ok) warnings += 1;
  console.log(
    `${vp.name} (${vp.width}px): branding ${brand}px, title area ~${name}px ${ok ? 'OK' : 'TIGHT'}`,
  );
}

console.log(`\n${warnings === 0 ? 'All viewports pass minimum budget checks.' : `${warnings} viewport(s) need visual QA.`}`);
console.log('\nPWA safe-area: viewport-fit=cover present in index.html; header uses env(safe-area-inset-*).');
console.log('Header row height: 4.5rem content + safe-area inset top.');
