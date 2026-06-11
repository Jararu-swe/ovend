/**
 * E2E Test: Team Member Dashboard Access & Permission-Filtered Sidebar
 *
 * Prerequisites:
 *   1. Run `npm run dev` to start the dev server on port 3000
 *   2. Run `node scripts/e2e-setup-team-member.js` to seed test data
 *   3. Install Playwright: `npx playwright install chromium`
 *
 * Run: node scripts/e2e-team-member-flow.js
 *
 * What this tests:
 *   - Team member can log in with credentials (customer role)
 *   - JWT callback detects team membership and overrides the session
 *   - Sidebar shows "Team Dashboard" header (not "Vendor Dashboard")
 *   - Sidebar filters links based on team permissions (products: true only)
 *   - Orders, Discounts, Settings links are hidden from the sidebar
 *   - Home, Products, Team, Customize, Billing links remain visible
 */

const { chromium } = require('playwright');
const { expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';
const MEMBER_EMAIL = 'e2e-team-member@vendle.test';
const PASSWORD = 'test123456';

const VISIBLE_LINKS = ['Home', 'Products', 'Team', 'Customize', 'Billing'];
const HIDDEN_LINKS = ['Orders', 'Discounts', 'Settings'];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = { passed: 0, failed: 0, errors: [] };

  function pass(name) {
    console.log(`  ✅ ${name}`);
    results.passed++;
  }

  function fail(name, detail) {
    console.log(`  ❌ ${name}: ${detail}`);
    results.failed++;
    results.errors.push(`${name}: ${detail}`);
  }

  try {
    // ── Step 1: Navigate to login ──────────────────────────────
    console.log('\n📌 Step 1: Navigate to login page');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    const signInButton = page.locator('button[type="submit"]').first();

    const emailVisible = await emailInput.isVisible();
    const passwordVisible = await passwordInput.isVisible();
    const buttonVisible = await signInButton.isVisible();

    if (emailVisible && passwordVisible && buttonVisible) {
      pass('Login form is visible with email, password, and sign-in button');
    } else {
      fail('Login form elements', `email=${emailVisible} password=${passwordVisible} button=${buttonVisible}`);
    }

    // ── Step 2: Log in as team member ──────────────────────────
    console.log('\n📌 Step 2: Log in as team member');
    await emailInput.fill(MEMBER_EMAIL);
    await passwordInput.fill(PASSWORD);
    await signInButton.click();

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    pass(`Logged in as ${MEMBER_EMAIL} and redirected to /dashboard`);

    // ── Step 3: Check sidebar header ───────────────────────────
    console.log('\n📌 Step 3: Check sidebar shows "Team Dashboard"');
    const sidebarText = await page.locator('nav, aside, [class*="sidebar"], [class*="sidenav"]').first().textContent();
    const hasTeamDashboard = sidebarText.includes('Team Dashboard');
    const hasVendorDashboard = sidebarText.includes('Vendor Dashboard');

    if (hasTeamDashboard && !hasVendorDashboard) {
      pass('Sidebar header shows "Team Dashboard" (not "Vendor Dashboard")');
    } else {
      fail('Sidebar header text', `Team Dashboard: ${hasTeamDashboard}, Vendor Dashboard: ${hasVendorDashboard}`);
    }

    // ── Step 4: Check visible links ────────────────────────────
    console.log('\n📌 Step 4: Verify visible navigation links');
    for (const linkName of VISIBLE_LINKS) {
      const link = page.locator(`a:has-text("${linkName}")`).first();
      const visible = await link.isVisible();
      if (visible) {
        pass(`"${linkName}" link is visible in sidebar`);
      } else {
        fail(`"${linkName}" link`, 'not visible');
      }
    }

    // ── Step 5: Check hidden links ─────────────────────────────
    console.log('\n📌 Step 5: Verify hidden navigation links (permission-filtered)');
    for (const linkName of HIDDEN_LINKS) {
      const link = page.locator(`a:has-text("${linkName}")`).first();
      const visible = await link.isVisible().catch(() => false);
      if (!visible) {
        pass(`"${linkName}" link is correctly hidden`);
      } else {
        fail(`"${linkName}" link`, 'should be hidden but is visible');
      }
    }

    // ── Step 6: Verify direct URL access still works ───────────
    console.log('\n📌 Step 6: Verify direct URL access (server-side auth)');
    await page.goto(`${BASE_URL}/dashboard/products`, { waitUntil: 'networkidle' });
    const onProductsPage = page.url().includes('/dashboard/products');
    if (onProductsPage) {
      pass('Direct navigation to /dashboard/products works (no redirect)');
    } else {
      fail('Products page access', `Current URL: ${page.url()}`);
    }

  } catch (err) {
    fail('Unexpected error', err.message);
  } finally {
    // ── Summary ────────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Results: ${results.passed} passed, ${results.failed} failed`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (results.errors.length > 0) {
      console.log('Errors:');
      results.errors.forEach((e) => console.log(`  • ${e}`));
      console.log();
    }

    await browser.close();
    process.exit(results.failed > 0 ? 1 : 0);
  }
}

run();
