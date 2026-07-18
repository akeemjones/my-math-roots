'use strict';

// =============================================================================
//  CONTINUE LEARNING — "what should I work on next?"
//
//  Exercises the PRODUCTION nextLearningTarget() / _lessonPassed() from
//  src/nav.js (not a mirror), so the "continue" target always agrees with the
//  pass predicate the rest of the app uses. nav.js only touches the DOM in its
//  parse-time swipe-back IIFE, so a minimal document/window stub lets it eval.
// =============================================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

// Eval src/nav.js in a sandbox and return it. UNITS_DATA / SCORES are set per
// test; the functions read them as globals.
function loadNav() {
  const noop = () => {};
  const el = { addEventListener: noop, removeEventListener: noop, classList: { contains: () => false }, style: {} };
  const sandbox = {
    console, Math, Array, Object, JSON, Date,
    // DOM surface the parse-time IIFE touches
    document: { addEventListener: noop, getElementById: () => el, querySelector: () => el, querySelectorAll: () => [] },
    requestAnimationFrame: noop,
    // globals nav.js closes over (only needed if those fns are called)
    UNITS_DATA: [], SCORES: [],
    isParentUnlocked: () => false,
    openLesson: null,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.addEventListener = noop;
  sandbox.removeEventListener = noop;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', 'nav.js'), 'utf8'), sandbox, { filename: 'src/nav.js' });
  return sandbox;
}

// A 3-unit / 2-lessons-each grade.
function units() {
  return [
    { name: 'Unit 1', lessons: [{ id: 'u1l1', title: 'A' }, { id: 'u1l2', title: 'B' }] },
    { name: 'Unit 2', lessons: [{ id: 'u2l1', title: 'C' }, { id: 'u2l2', title: 'D' }] },
    { name: 'Unit 3', lessons: [{ id: 'u3l1', title: 'E' }, { id: 'u3l2', title: 'F' }] },
  ];
}
const pass = (id) => ({ qid: 'lq_' + id, type: 'lesson', pct: 90 });
const fail = (id) => ({ qid: 'lq_' + id, type: 'lesson', pct: 50 });

describe('nextLearningTarget', () => {
  let nav;
  beforeEach(() => { nav = loadNav(); nav.UNITS_DATA = units(); });

  test('a brand-new student starts at the very first lesson', () => {
    nav.SCORES = [];
    expect(nav.nextLearningTarget()).toEqual({ unitIdx: 0, lessonIdx: 0, started: false, allDone: false });
  });

  test('after passing lesson 1, points at lesson 2', () => {
    nav.SCORES = [pass('u1l1')];
    expect(nav.nextLearningTarget()).toEqual({ unitIdx: 0, lessonIdx: 1, started: true, allDone: false });
  });

  test('rolls into the next unit when a unit is fully passed', () => {
    nav.SCORES = [pass('u1l1'), pass('u1l2')];
    expect(nav.nextLearningTarget()).toEqual({ unitIdx: 1, lessonIdx: 0, started: true, allDone: false });
  });

  test('a failed (<80%) attempt does not count as done', () => {
    nav.SCORES = [fail('u1l1')];
    const t = nav.nextLearningTarget();
    expect(t.unitIdx).toBe(0);
    expect(t.lessonIdx).toBe(0);
    expect(t.allDone).toBe(false);
  });

  test('returns the FIRST gap, skipping later completed lessons', () => {
    // Passed u1l1 and u2l1 but not u1l2 -> the gap is u1l2, not u2l2.
    nav.SCORES = [pass('u1l1'), pass('u2l1')];
    expect(nav.nextLearningTarget()).toEqual({ unitIdx: 0, lessonIdx: 1, started: true, allDone: false });
  });

  test('when everything is passed, allDone and points at the last lesson', () => {
    nav.SCORES = ['u1l1', 'u1l2', 'u2l1', 'u2l2', 'u3l1', 'u3l2'].map(pass);
    expect(nav.nextLearningTarget()).toEqual({ unitIdx: 2, lessonIdx: 1, started: true, allDone: true });
  });

  test('an empty curriculum does not throw', () => {
    nav.UNITS_DATA = [];
    expect(() => nav.nextLearningTarget()).not.toThrow();
    expect(nav.nextLearningTarget().allDone).toBe(false);
  });

  test('started flips to true only once a lesson is actually passed', () => {
    nav.SCORES = [];
    expect(nav.nextLearningTarget().started).toBe(false);
    nav.SCORES = [pass('u1l1')];
    expect(nav.nextLearningTarget().started).toBe(true);
  });
});

describe('_lessonPassed agrees with the app-wide pass predicate', () => {
  let nav;
  beforeEach(() => { nav = loadNav(); });

  test('80% and above passes; below does not', () => {
    nav.SCORES = [{ qid: 'lq_u1l1', pct: 80 }];
    expect(nav._lessonPassed('u1l1')).toBe(true);
    nav.SCORES = [{ qid: 'lq_u1l1', pct: 79 }];
    expect(nav._lessonPassed('u1l1')).toBe(false);
  });

  test('a practice attempt (different qid) never counts', () => {
    // Matches tests/practice-progression.test.js: practice uses practice_lq_*.
    nav.SCORES = [{ qid: 'practice_lq_u1l1', pct: 100 }];
    expect(nav._lessonPassed('u1l1')).toBe(false);
  });
});

describe('continueLearning opens the target lesson', () => {
  test('delegates to openLesson with the next target coordinates', () => {
    const nav = loadNav();
    nav.UNITS_DATA = units();
    nav.SCORES = [pass('u1l1')];
    const calls = [];
    nav.openLesson = (u, l) => calls.push([u, l]);
    nav.continueLearning();
    expect(calls).toEqual([[0, 1]]);
  });
});

describe('wiring', () => {
  const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

  test('the home card is gated on SIMPLIFIED_NAV', () => {
    const fn = read('src/home.js').match(/function _renderContinueCard\(\)\{[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/isFeatureOn\('SIMPLIFIED_NAV'\)/);
    expect(fn).toMatch(/card\.style\.display = 'none'/);
  });

  test('the card refreshes on both home renders', () => {
    const home = read('src/home.js');
    expect(home.match(/_renderContinueCard\(\)/g).length).toBeGreaterThanOrEqual(3); // def + 2 calls
  });

  test('the card markup and dispatcher action exist', () => {
    expect(read('index.html')).toContain('id="continue-card"');
    expect(read('src/events.js')).toMatch(/continueLearning:\s*\(\)/);
  });

  test('card text is escaped (lesson titles are content)', () => {
    const fn = read('src/home.js').match(/function _renderContinueCard\(\)\{[\s\S]*?\n}/)[0];
    expect(fn).toMatch(/_escHtml\(lesson\.title\)/);
    expect(fn).toMatch(/_escHtml\(unit\.name\)/);
  });
});
