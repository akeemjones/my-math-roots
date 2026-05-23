// tests/build-output.test.js
//
// Verifies that the production build (no --dev) deletes cheat/debug
// artifacts that must never ship publicly:
//   - dist/unlock.html  (K-lessons "unlock everything" cheat page)
//   - dist/app.js.map   (de-obfuscatable source map)
//
// Strategy: plant both files in dist/ before the build, run `node build.js`
// without --dev, then assert both files are absent and dist/app.js is
// still present (sanity: build did succeed).
//
// This test runs a full production build, so it is slower than the rest
// of the suite (~30–60s on a warm box). Jest's per-hook timeout is
// raised below.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT     = path.resolve(__dirname, '..');
const DIST     = path.join(ROOT, 'dist');
const UNLOCK   = path.join(DIST, 'unlock.html');
const APP_MAP  = path.join(DIST, 'app.js.map');
const APP_JS   = path.join(DIST, 'app.js');

describe('production build cleanup of forbidden artifacts', () => {
  beforeAll(() => {
    if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
    // Plant both forbidden artifacts so we can prove the build removes them
    // even when they linger from an earlier dev build or hand placement.
    fs.writeFileSync(UNLOCK,  '<!-- planted by tests/build-output.test.js -->');
    fs.writeFileSync(APP_MAP, '{"planted":"tests/build-output.test.js"}');
    // Sanity: confirm the plants exist before the build runs.
    if (!fs.existsSync(UNLOCK))  throw new Error('test setup: unlock.html plant missing');
    if (!fs.existsSync(APP_MAP)) throw new Error('test setup: app.js.map plant missing');
    // Run prod build (no --dev). stdio:'pipe' keeps the noisy build log out
    // of the test output; if build.js fails the cleanup assertion, execSync
    // will throw and the test will fail with the assertion message.
    execSync('node build.js', { cwd: ROOT, stdio: 'pipe' });
  }, 180_000);

  test('dist/unlock.html is removed by production build', () => {
    expect(fs.existsSync(UNLOCK)).toBe(false);
  });

  test('dist/app.js.map is removed by production build', () => {
    expect(fs.existsSync(APP_MAP)).toBe(false);
  });

  test('dist/app.js still exists after build (sanity)', () => {
    expect(fs.existsSync(APP_JS)).toBe(true);
  });
});
