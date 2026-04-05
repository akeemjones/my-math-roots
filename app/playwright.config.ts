import { defineConfig } from '@playwright/test';

const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
  'Version/18.2 Mobile/15E148 Safari/604.1';

/**
 * iPhone 16 Pro Max device preview config.
 * Run with: npx playwright test --config=playwright.config.ts
 *
 * First-time setup: npx playwright install chromium
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './tests/screenshots',
  reporter: [['html', { outputFolder: './tests/playwright-report', open: 'never' }]],

  use: {
    /* iPhone 16 Pro Max — 440×956 logical px, 3× scale, iOS 18 Safari UA */
    viewport: { width: 440, height: 956 },
    deviceScaleFactor: 3,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
      'Version/18.2 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    baseURL: 'http://localhost:5173',
    screenshot: 'on',
    /* Retina screenshots at device scale */
    launchOptions: { args: ['--force-device-scale-factor=3'] },
  },

  projects: [
    {
      name: 'iphone-16-pro-max',
      use: {
        /* Chromium with explicit iPhone 16 Pro Max settings — no WebKit needed */
        browserName: 'chromium',
        viewport: { width: 440, height: 956 },
        deviceScaleFactor: 3,
        userAgent: IOS_UA,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
