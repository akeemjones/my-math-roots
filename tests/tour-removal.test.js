// tests/tour-removal.test.js
//
// Guard: the first-run tutorial / spotlight tour was removed from the app.
// If any file accidentally reintroduces tour code or rewires the auto-start
// hooks, these checks fire so it doesn't ship.
//
// We do NOT touch the leftover localStorage keys
// (mmr_spotlight_tour_seen_v1, wb_tutorial_v2, wb_spot_*) — those are
// inert for users who already had them set, and removing them touches
// unrelated user-data code paths.

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

function read(p) { return fs.readFileSync(p, 'utf8'); }
function exists(p) { return fs.existsSync(p); }

describe('tutorial / spotlight tour removal', () => {
  test('src/tour.js no longer exists', () => {
    expect(exists(path.join(SRC, 'tour.js'))).toBe(false);
  });

  test('build.js does not include tour.js in SRC_FILES', () => {
    const buildJs = read(path.join(ROOT, 'build.js'));
    expect(buildJs).not.toMatch(/['"]tour\.js['"]/);
  });

  test('boot.js does not register tour globals', () => {
    const bootJs = read(path.join(SRC, 'boot.js'));
    // None of the tour identifiers should appear in the global registry
    [
      'TUT_SLIDES', '_startTutorial', 'tutCheckAndShow',
      'tutNext', 'tutBack', 'tutSkip',
      'SPOT_TOURS', '_spotCheckScreen', '_spotShowStep',
      '_spotAdvance', '_spotDone', '_pendingTimerSecs',
    ].forEach(name => {
      expect(bootJs).not.toContain(name);
    });
  });

  test('auth.js does not auto-start the tour after login or guest entry', () => {
    const authJs = read(path.join(SRC, 'auth.js'));
    expect(authJs).not.toContain('tutCheckAndShow');
    expect(authJs).not.toContain('_hasSeenSpotlightTour');
    expect(authJs).not.toContain("'tut-active'");
    expect(authJs).not.toContain('_onboardingActive');
  });

  test('nav.js does not call _spotCheckScreen on screen change', () => {
    const navJs = read(path.join(SRC, 'nav.js'));
    expect(navJs).not.toContain('_spotCheckScreen');
    expect(navJs).not.toContain('_onboardingActive');
    expect(navJs).not.toContain('spot-scroll-lock');
  });

  test('events.js does not route data-action tutNext/tutSkip/_spotAdvance/_spotDone', () => {
    const eventsJs = read(path.join(SRC, 'events.js'));
    expect(eventsJs).not.toMatch(/\btutNext\b/);
    expect(eventsJs).not.toMatch(/\btutBack\b/);
    expect(eventsJs).not.toMatch(/\btutSkip\b/);
    expect(eventsJs).not.toMatch(/\b_spotAdvance\b/);
    expect(eventsJs).not.toMatch(/\b_spotDone\b/);
  });

  test('quiz.js starts the timer immediately (no spotlight deferral)', () => {
    const quizJs = read(path.join(SRC, 'quiz.js'));
    expect(quizJs).not.toContain('_pendingTimerSecs');
    expect(quizJs).not.toContain('_pendingTimerColor');
    expect(quizJs).not.toContain("wb_spot_quiz-screen");
  });

  test('settings.js closeInstall no longer launches tutorial or toggles tut-active', () => {
    const settingsJs = read(path.join(SRC, 'settings.js'));
    expect(settingsJs).not.toContain('_startTutorial');
    expect(settingsJs).not.toContain('_hasSeenSpotlightTour');
    expect(settingsJs).not.toContain('tut-active');
    expect(settingsJs).not.toContain('_onboardingActive');
  });

  test('index.html source has no tour DOM (tut-overlay, spot-overlay, etc.)', () => {
    const html = read(path.join(ROOT, 'index.html'));
    [
      'tut-overlay', 'tut-card', 'tut-emoji', 'tut-title', 'tut-body',
      'tut-dots', 'tut-next-btn', 'tut-skip-btn',
      'spot-overlay', 'spot-svg', 'spot-mask', 'spot-hole', 'spot-card',
      'spot-bg-rect', 'spot-dim-rect', 'spot-ring',
      'spot-emoji', 'spot-title', 'spot-tip', 'spot-count', 'spot-next-btn',
      'data-action="tutNext"', 'data-action="tutSkip"',
      'data-action="_spotAdvance"', 'data-action="_spotDone"',
    ].forEach(token => {
      expect(html).not.toContain(token);
    });
  });

  test('styles.css source has no tour-only selectors or z-index vars', () => {
    const css = read(path.join(SRC, 'styles.css'));
    [
      '.tut-overlay', '.tut-card', '.tut-emoji', '.tut-title', '.tut-body',
      '.tut-dots', '.tut-dot', '.tut-btn-next', '.tut-btn-skip', '.tut-skip-top',
      '.tut-feature-row', '.tut-feature-ico', '.tut-feature-txt',
      'body.tut-active', 'body.spot-scroll-lock',
      '#spot-overlay', '#spot-svg', '#spot-card',
      '.spot-card-emoji', '.spot-card-title', '.spot-card-tip',
      '.spot-card-row', '.spot-count', '.spot-next-btn', '.spot-skip-btn',
      '--z-tutorial', '--z-spot-bg', '--z-spot-card',
    ].forEach(token => {
      expect(css).not.toContain(token);
    });
  });

  test('parent dashboard does not advertise the removed Spotlight Tutorial', () => {
    const dashJs = read(path.join(SRC, 'dashboard.js'));
    expect(dashJs).not.toContain('Spotlight Tutorial');
  });

  test('if a built bundle exists, it has no tour symbols either', () => {
    const appJs = path.join(DIST, 'app.js');
    if (!exists(appJs)) {
      // No bundle present — skip; the source-level checks above cover this run.
      return;
    }
    const bundle = read(appJs);
    // Source identifiers; survive identifier-name mangling because tour code
    // is gone entirely (mangling renames variables, but string literals like
    // 'mmr_spotlight_tour_seen_v1' would persist if any tour code remained).
    [
      'mmr_spotlight_tour_seen_v1',
      'TUT_SLIDES',
      'SPOT_TOURS',
      'wb_spot_quiz-screen',
    ].forEach(token => {
      expect(bundle).not.toContain(token);
    });
  });
});
