'use strict';

// =============================================================================
//  DETERMINISTIC PARENT SUMMARY
//
//  Replaces the Gemini-generated parent report. The guarantees that matter:
//    - no child data leaves the device
//    - the same inputs always produce the same words (no hallucination)
//    - it never states a figure drawn from the known-broken mastery source
//    - it says nothing rather than something hollow when data is thin
//
//  Runs against the PRODUCTION dashboard via the bundle harness.
// =============================================================================

const fs = require('fs');
const path = require('path');
const { loadDashboard, makeStorage } = require('./dashboard-harness.js');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const D = loadDashboard(makeStorage());
const { buildParentSummary, _topMistake } = D;

const payload = (over) => Object.assign({
  totalAttempts: 6,
  overallAvg: 74,
  period: 'Last 30 days',
  activeDaysInPeriod: 4,
  units: [
    { name: 'Place Value', avgPct: 92 },
    { name: 'Addition & Subtraction', avgPct: 58 },
  ],
}, over);

describe('no child data leaves the device', () => {
  test('the Gemini report call is gone from every client caller', () => {
    // There were two: dashboard.js and a shadowed copy in settings.js.
    expect(read('src/dashboard.js')).not.toContain("functions/gemini-report'");
    expect(read('src/settings.js')).not.toContain("functions/gemini-report'");
  });

  test("the student's name is no longer sent anywhere", () => {
    expect(read('src/dashboard.js')).not.toMatch(/studentName:\s*name,\s*reportData/);
    expect(read('src/settings.js')).not.toMatch(/_prStudentName,\s*reportData/);
  });

  test('the Gemini backends are removed', () => {
    expect(fs.existsSync(path.join(ROOT, 'netlify/functions/gemini-report.js'))).toBe(false);
    expect(fs.existsSync(path.join(ROOT, 'netlify/functions/gemini-hint.js'))).toBe(false);
  });

  test('the summary builder makes no network call at all', () => {
    const fn = read('src/dashboard.js').match(/function buildParentSummary[\s\S]*?\n}/)[0];
    expect(fn).not.toMatch(/fetch\(|XMLHttpRequest|sendBeacon/);
  });
});

describe('it is deterministic', () => {
  test('identical inputs produce identical output', () => {
    const a = buildParentSummary(payload(), { err_no_regroup: 3 }, 'Cameron');
    const b = buildParentSummary(payload(), { err_no_regroup: 3 }, 'Cameron');
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test('it is a pure function of its arguments', () => {
    const p = payload();
    const before = JSON.stringify(p);
    buildParentSummary(p, { err_no_regroup: 3 }, 'Cameron');
    expect(JSON.stringify(p)).toBe(before);   // inputs untouched
  });
});

describe('what the parent is told', () => {
  test('leads with what actually happened', () => {
    const s = buildParentSummary(payload(), {}, 'Cameron');
    expect(s.headline).toBe('Cameron completed 6 quizzes with 74% accuracy.');
  });

  test('names the strength and the gap', () => {
    const s = buildParentSummary(payload(), {}, 'Cameron');
    expect(s.lines).toEqual(expect.arrayContaining([
      'Strongest in Place Value (92%).',
      'Needs more practice in Addition & Subtraction (58%).',
    ]));
  });

  test('surfaces the most common mistake with a count', () => {
    const s = buildParentSummary(payload(), { err_no_regroup: 5, err_place_value: 2 }, 'Cameron');
    const line = s.lines.find((l) => l.startsWith('Most common mistake:'));
    expect(line).toBeTruthy();
    expect(line).toContain('5 times');
  });

  test('always ends with one recommended next step', () => {
    expect(buildParentSummary(payload(), {}, 'Cameron').nextStep).toBeTruthy();
    expect(buildParentSummary(payload({ units: [] }), {}, 'Cameron').nextStep).toBeTruthy();
  });

  test('grammar holds for a single quiz', () => {
    const s = buildParentSummary(payload({ totalAttempts: 1, activeDaysInPeriod: 1 }), {}, 'Ada');
    expect(s.headline).toBe('Ada completed 1 quiz with 74% accuracy.');
    expect(s.lines[0]).toBe('Practised on 1 day in last 30 days.');
  });
});

describe('it does not overstate', () => {
  // The audit found get_student_progress_by_pin reads mastery from a legacy
  // table filtered by parent with no student filter, so for managed students it
  // is empty or belongs to a sibling. A number a parent could act on must not
  // come from there.
  test('states no mastery percentage', () => {
    const fn = read('src/dashboard.js').match(/function buildParentSummary[\s\S]*?\n}/)[0];
    expect(fn).not.toMatch(/masteryStats|\bmastered\b|needsWork/);
  });

  test('says nothing when there is nothing to say', () => {
    const s = buildParentSummary(payload({ totalAttempts: 0 }), {}, 'Cameron');
    expect(s.headline).toBe('Cameron has not completed any quizzes in this period yet.');
    expect(s.lines).toEqual([]);
    expect(s.nextStep).toBe('Start with the recommended lesson on the home screen.');
  });

  test('claims no strength below 80% and no gap at or above 70%', () => {
    const s = buildParentSummary(
      payload({ units: [{ name: 'Place Value', avgPct: 79 }, { name: 'Geometry', avgPct: 72 }] }),
      {}, 'Cameron'
    );
    expect(s.lines.some((l) => l.startsWith('Strongest in'))).toBe(false);
    expect(s.lines.some((l) => l.startsWith('Needs more practice'))).toBe(false);
  });

  test('does not name one unit as both the strength and the gap', () => {
    const s = buildParentSummary(
      payload({ units: [{ name: 'Only Unit', avgPct: 95 }] }), {}, 'Cameron'
    );
    expect(s.lines.some((l) => l.startsWith('Needs more practice'))).toBe(false);
  });

  test('tolerates missing, empty and malformed inputs', () => {
    expect(() => buildParentSummary(null, null, null)).not.toThrow();
    expect(() => buildParentSummary({}, {}, '')).not.toThrow();
    expect(() => buildParentSummary(payload({ units: null }), 'nonsense', 'A')).not.toThrow();
    expect(buildParentSummary(null, null, null).headline).toContain('This student');
  });
});

describe('_topMistake', () => {
  test('picks the highest-frequency tag', () => {
    const t = _topMistake({ err_no_regroup: 5, err_place_value: 9, err_off_by_one: 1 });
    expect(t.tag).toBe('err_place_value');
    expect(t.count).toBe(9);
  });

  test('returns null when there are no mistakes', () => {
    expect(_topMistake({})).toBe(null);
    expect(_topMistake(null)).toBe(null);
    expect(_topMistake('nope')).toBe(null);
  });
});
