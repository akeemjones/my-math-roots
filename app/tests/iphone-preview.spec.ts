/**
 * iPhone 16 Pro Max — Device Preview & UI Polish Verification
 *
 * Wraps the app in a pixel-accurate iOS shell (Dynamic Island, status bar,
 * home indicator) and verifies three post-sprint UI fixes:
 *
 *   1. Footer/background — gradient stays static behind scrolling content
 *   2. Settings cog      — visual icon size meets 44px HIG minimum
 *   3. Profile selector  — true glass effect, no dark overlay
 *
 * Run:
 *   npx playwright install chromium   ← first time only
 *   npx playwright test --config=playwright.config.ts
 *
 * Screenshots land in: tests/screenshots/
 */

import { test, expect, type Page } from '@playwright/test';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:5173';

/** iOS 18 Safari UA for iPhone 16 Pro Max */
const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
  'Version/18.2 Mobile/15E148 Safari/604.1';

/**
 * iPhone 16 Pro Max logical dimensions.
 * Physical: 1320×2868 px @ 3× scale.
 */
const DEVICE = { width: 440, height: 956, scale: 3 } as const;

/**
 * Dynamic Island geometry (logical px).
 * Pill: 126×37, top: 12, centered horizontally.
 * Safe-area-top (below pill): 59 px
 * Safe-area-bottom (above home bar): 34 px
 */
const ISLAND = { pillW: 126, pillH: 37, top: 12, safeTop: 59, safeBottom: 34 } as const;

/** iOS HIG minimum touch-target size */
const HIG_MIN_PX = 44;

// ─── Seed data ────────────────────────────────────────────────────────────────

/** Two mock student profiles — makes the profile-switcher button visible. */
const MOCK_PROFILES = [
  { id: 'student-1', name: 'Cameron', avatar: '🦁', pin: '1234', role: 'student' },
  { id: 'student-2', name: 'Jordan',  avatar: '🐯', pin: '5678', role: 'student' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Seed localStorage before the app boots so stores initialise
 * with two profiles and a valid (mock) PIN session.
 * Called via page.addInitScript — runs before any page JS.
 */
async function seedLocalStorage(page: Page) {
  await page.addInitScript(({ profiles }) => {
    // versioned stores: { _v, data }
    localStorage.setItem('mmr_family_profiles',
      JSON.stringify({ _v: 1, data: profiles }));
    localStorage.setItem('mmr_pin_session',
      JSON.stringify({ _v: 1, data: { studentId: 'student-1', token: 'dev-mock' } }));
    // unversioned stores: raw value
    localStorage.setItem('mmr_active_student', JSON.stringify('student-1'));
    localStorage.setItem('mmr_guest_mode',     JSON.stringify(false));
    // tour/install flags — exact keys from src/lib/services/tour.ts
    localStorage.setItem('install_seen',   '1');
    localStorage.setItem('wb_tutorial_v2', '1');
  }, { profiles: MOCK_PROFILES });
}

/**
 * Inject the iOS device shell overlay:
 *
 *  • body::after  — rounded-corner screen mask via box-shadow
 *  • #__ios-shell — Dynamic Island pill + status bar + home indicator
 *
 * The overlay is pointer-events:none so it never blocks interaction.
 */
async function injectDeviceShell(page: Page) {
  await page.addStyleTag({ content: `
    /* ── Rounded screen corners (box-shadow mask trick) ── */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      border-radius: 55px;
      box-shadow: 0 0 0 80px #000;
      pointer-events: none;
      z-index: 2147483646;
    }

    /* ── Simulate iOS safe-area-inset-top/bottom in Chromium ──
       env(safe-area-inset-top) is 0 in desktop Chromium; override the
       selectors that use it so content sits correctly under the island. */
    #home {
      padding-top:    ${ISLAND.safeTop}px   !important;
      padding-bottom: ${ISLAND.safeBottom}px !important;
    }
    .bar:not(#home .bar) {
      padding-top: calc(12px + ${ISLAND.safeTop}px) !important;
    }
  `});

  await page.evaluate(({ island }) => {
    document.getElementById('__ios-shell')?.remove();

    const shell = document.createElement('div');
    shell.id = '__ios-shell';
    shell.innerHTML = `
      <style>
        #__ios-shell {
          position: fixed; inset: 0;
          pointer-events: none;
          z-index: 2147483647;
          font-family: -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Dynamic Island pill ── */
        #__ios-island {
          position: absolute;
          top: ${island.top}px;
          left: 50%; transform: translateX(-50%);
          width: ${island.pillW}px; height: ${island.pillH}px;
          background: #000;
          border-radius: 20px;
        }

        /* ── Status bar: clock (left) ── */
        #__ios-time {
          position: absolute;
          top: 17px; left: 32px;
          font-size: 15px; font-weight: 600;
          color: #fff; letter-spacing: -0.2px;
        }

        /* ── Status bar: indicators (right) ── */
        #__ios-indicators {
          position: absolute;
          top: 20px; right: 28px;
          display: flex; align-items: center; gap: 6px;
        }
        #__ios-indicators svg { display: block; }

        /* ── Home indicator bar ── */
        #__ios-home-bar {
          position: absolute;
          bottom: 9px;
          left: 50%; transform: translateX(-50%);
          width: 134px; height: 5px;
          background: rgba(255,255,255,0.42);
          border-radius: 3px;
        }

        /* ── Safe-area reference lines (dev-only, semi-transparent) ── */
        #__ios-safe-top-line {
          position: absolute;
          top: ${island.safeTop}px; left: 0; right: 0;
          height: 1px;
          background: rgba(255,80,80,0.25);
        }
        #__ios-safe-bottom-line {
          position: absolute;
          bottom: ${island.safeBottom}px; left: 0; right: 0;
          height: 1px;
          background: rgba(255,80,80,0.25);
        }
      </style>

      <div id="__ios-island"></div>

      <!-- Clock -->
      <span id="__ios-time">9:41</span>

      <!-- Signal / Wi-Fi / Battery -->
      <div id="__ios-indicators">
        <!-- Cellular signal (4 bars) -->
        <svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0"    y="9"   width="3.5" height="4"    rx="1" fill="white"/>
          <rect x="4.75" y="6.5" width="3.5" height="6.5"  rx="1" fill="white"/>
          <rect x="9.5"  y="3.5" width="3.5" height="9.5"  rx="1" fill="white"/>
          <rect x="14.5" y="0"   width="3.5" height="13"   rx="1" fill="white"/>
        </svg>

        <!-- Wi-Fi -->
        <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="11.5" r="1.5" fill="white"/>
          <path d="M4.5 8.2a4.95 4.95 0 0 1 7 0"   stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
          <path d="M1.5 5.2a8.5 8.5 0 0 1 13 0"    stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        </svg>

        <!-- Battery (approx 80% full) -->
        <svg width="28" height="13" viewBox="0 0 28 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.75" y="1.5" width="23" height="10" rx="3.2" stroke="white" stroke-width="1.1"/>
          <rect x="2.25" y="3"   width="17" height="7"  rx="2"   fill="white"/>
          <path d="M25.5 4.5 C27 4.5 27 5.2 27 6.5 C27 7.8 27 8.5 25.5 8.5 Z" fill="white" opacity="0.4"/>
        </svg>
      </div>

      <!-- Home indicator -->
      <div id="__ios-home-bar"></div>

      <!-- Safe-area guidelines (faint red lines) -->
      <div id="__ios-safe-top-line"></div>
      <div id="__ios-safe-bottom-line"></div>
    `;

    document.body.appendChild(shell);
  }, { island: ISLAND });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('iPhone 16 Pro Max — UI Polish Sprint', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: DEVICE.width, height: DEVICE.height });
    await seedLocalStorage(page);
    await page.goto(BASE_URL);

    // Wait for the main content to appear (not the login or blank screen)
    await page.waitForSelector('.sc, #home, .bar', { timeout: 8000 }).catch(() => {});

    // Force-remove any install/tour overlay that slipped through
    await page.evaluate(() => {
      document.querySelectorAll<HTMLElement>(
        '.install-overlay, [class*="install-"], [id*="install"], [class*="tour"]'
      ).forEach(el => el.remove());
    });

    // If install modal is still present via Svelte binding, click its dismiss button
    const gotItBtn = page.locator('button:has-text("Got it"), button:has-text("✅")');
    if (await gotItBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await gotItBtn.click();
      await page.waitForTimeout(300);
    }

    await injectDeviceShell(page);
  });

  // ── 1. Home screen — header + footer visible ────────────────────────────

  test('home screen: header, cog, profile-btn, footer all visible', async ({ page }) => {
    await page.screenshot({ path: 'tests/screenshots/01-home-full.png', fullPage: false });

    // Profile switcher button should be in the DOM (2 profiles seeded)
    const profBtn = page.locator('#prof-btn');
    await expect(profBtn).toBeVisible();

    // Settings cog
    const cog = page.locator('.bar-cog');
    await expect(cog).toBeVisible();

    // HIG: both buttons must have a rendered size ≥ 44px
    const cogBox  = await cog.boundingBox();
    const profBox = await profBtn.boundingBox();
    expect(cogBox!.width,  'cog width ≥ 44px HIG').toBeGreaterThanOrEqual(HIG_MIN_PX);
    expect(cogBox!.height, 'cog height ≥ 44px HIG').toBeGreaterThanOrEqual(HIG_MIN_PX);
    expect(profBox!.width,  'prof-btn width ≥ 44px HIG').toBeGreaterThanOrEqual(HIG_MIN_PX);
    expect(profBox!.height, 'prof-btn height ≥ 44px HIG').toBeGreaterThanOrEqual(HIG_MIN_PX);
  });

  // ── 2. Cog icon visual size ─────────────────────────────────────────────

  test('cog icon: font-size renders the emoji visually large', async ({ page }) => {
    const fontSize = await page.locator('.bar-cog').evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize)
    );
    // 2rem @ 16px base = 32px; must be > 24px to be clearly visible
    expect(fontSize, 'cog font-size > 24px').toBeGreaterThan(24);
    await page.screenshot({ path: 'tests/screenshots/02-cog-closeup.png' });
  });

  // ── 3. Background gradient stays fixed while scrolling ──────────────────

  test('background: gradient on html root (extends into safe areas)', async ({ page }) => {
    // Background is applied to the root <html> element so it paints the full
    // viewport canvas including safe-area zones. Body must be transparent.
    const htmlBgImage = await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundImage
    );
    expect(htmlBgImage, 'html has background-image (SVG tile + gradient)').not.toBe('none');

    const bodyBgImage = await page.evaluate(
      () => getComputedStyle(document.body).backgroundImage
    );
    expect(bodyBgImage, 'body is transparent — html provides the canvas').toBe('none');

    const bodyBgColor = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor
    );
    expect(bodyBgColor, 'body background-color is transparent').toBe('rgba(0, 0, 0, 0)');

    // Scroll to bottom and screenshot — gradient should look identical to top
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.screenshot({ path: 'tests/screenshots/03-scrolled-bottom.png' });

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: 'tests/screenshots/04-scrolled-top.png' });
  });

  // ── 4. Profile switcher — true glass, no dark overlay ───────────────────

  test('profile switcher: glass morphism applied, overlay is transparent', async ({ page }) => {
    // Open the profile switcher
    await page.locator('#prof-btn').click();
    await page.waitForTimeout(400); // wait for slide-up animation

    await page.screenshot({ path: 'tests/screenshots/05-profile-switcher-open.png' });

    // Overlay must be transparent
    const overlayBg = await page.locator('.ps-overlay').evaluate(
      (el) => getComputedStyle(el).background
    );
    expect(overlayBg, 'overlay has no dark background').not.toContain('rgba(0, 0, 0, 0.');

    // Sheet must have backdrop-filter
    const sheetBdFilter = await page.evaluate(() => {
      // .ps-sheet is a global class — query from document
      const el = document.querySelector<HTMLElement>('.ps-sheet');
      if (!el) return '';
      const cs = getComputedStyle(el);
      return cs.backdropFilter || (cs as any).webkitBackdropFilter || '';
    });
    expect(sheetBdFilter, 'ps-sheet has backdrop-filter blur').toContain('blur(');

    // Sheet background must be semi-transparent (not solid)
    const sheetBg = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>('.ps-sheet');
      return el ? getComputedStyle(el).backgroundColor : '';
    });
    // rgba(255,255,255,0.4) — alpha < 1
    const alphaMatch = sheetBg.match(/rgba\([^)]+,\s*([\d.]+)\)/);
    const alpha = alphaMatch ? parseFloat(alphaMatch[1]) : 1;
    expect(alpha, 'ps-sheet background is semi-transparent').toBeLessThan(1);

    // Screenshot with shell overlay showing the glass against the bg
    await page.screenshot({ path: 'tests/screenshots/06-profile-glass-detail.png' });
  });

  // ── 5. Proximity to system UI — HIG clearance ───────────────────────────

  test('system UI clearance: buttons sit below Dynamic Island', async ({ page }) => {
    const cogBox  = await page.locator('.bar-cog').boundingBox();
    const profBox = await page.locator('#prof-btn').boundingBox();

    const islandBottom = ISLAND.top + ISLAND.pillH; // 12 + 37 = 49 px

    // With safe-area simulation injected, buttons should clear the island
    expect(cogBox!.y,  'cog clears Dynamic Island').toBeGreaterThanOrEqual(islandBottom);
    expect(profBox!.y, 'prof-btn clears Dynamic Island').toBeGreaterThanOrEqual(islandBottom);

    console.log('── HIG Measurements ────────────────────────────');
    console.log(`  Dynamic Island bottom : ${islandBottom}px`);
    console.log(`  Safe-area-top         : ${ISLAND.safeTop}px`);
    console.log(`  Cog    box            : x=${cogBox!.x} y=${cogBox!.y} w=${cogBox!.width} h=${cogBox!.height}`);
    console.log(`  ProfBtn box           : x=${profBox!.x} y=${profBox!.y} w=${profBox!.width} h=${profBox!.height}`);
    console.log('────────────────────────────────────────────────');

    await page.screenshot({ path: 'tests/screenshots/07-hig-clearance.png' });
  });

  // ── 6. Unit page — no full-page body scroll ──────────────────────────────

  test('unit page: body does not scroll (height:100dvh on #unit-screen)', async ({ page }) => {
    // Navigate directly — avoids needing "Let's Go" to be visible/scrolled to
    await page.goto(`${BASE_URL}/unit/u1`);
    await page.waitForURL(/\/unit\//);
    await injectDeviceShell(page); // re-inject shell after navigation

    await page.screenshot({ path: 'tests/screenshots/08-unit-page.png' });

    const unitScreenH = await page.locator('#unit-screen').evaluate(
      (el) => el.getBoundingClientRect().height
    );
    const viewportH = DEVICE.height;
    // #unit-screen should be exactly the viewport height (height:100dvh)
    expect(unitScreenH, '#unit-screen height = viewport height').toBeCloseTo(viewportH, -1);

    const bodyScrollHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(bodyScrollHeight, 'body is not scrollable beyond viewport')
      .toBeLessThanOrEqual(viewportH + 2);
  });

});
