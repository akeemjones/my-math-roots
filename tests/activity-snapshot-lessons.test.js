'use strict';

// Tests for the Activity Snapshot "Lessons Last 7 Days" card and its
// clicked detail view. Before this fix, the card counted lesson-quiz
// scores while the detail view read from a different stream
// (mmr_activity_v1 page-view events), so the card could promise N
// lessons that the detail couldn't show. The fix introduces a shared
// _getLast7DaysLessonQuizScores helper used by both, plus a rewritten
// _renderSnapLessons that mirrors the card's count exactly.
//
// Time is locked via jest.spyOn(Date, 'now') so the 7-day boundary
// tests are deterministic.

// Pure data helpers relocated to parent-progress.js; _renderSnapLessons (the
// renderer) still lives in dashboard.js until the dashboard screen is removed.
const {
  _getLast7DaysLessonQuizScores,
  _last7DaysCutoffMs,
} = require('../src/parent-progress');
const { _renderSnapLessons } = require('../src/dashboard');

const DAY = 86400000;
const NOW = 1779400000000; // arbitrary fixed epoch ms
let dateNowSpy;

function mkScore(over) {
  return Object.assign({
    id:    NOW - 3 * DAY,
    qid:   'lq_u1l4',
    label: 'Unit 1 Lesson 4 Quiz',
    type:  'lesson',
    pct:   90,
    score: 9,
    total: 10,
    date:  '2026-05-20',
  }, over || {});
}

beforeAll(() => {
  dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterAll(() => {
  dateNowSpy.mockRestore();
});

// ── Shared cutoff helper ─────────────────────────────────────────────
describe('_last7DaysCutoffMs', () => {
  test('returns Date.now() - 7 days', () => {
    expect(_last7DaysCutoffMs()).toBe(NOW - 7 * DAY);
  });
});

// ── _getLast7DaysLessonQuizScores — the shared filter ───────────────
describe('_getLast7DaysLessonQuizScores (shared card + detail filter)', () => {
  test('card-style count and detail helper return the IDENTICAL filtered set', () => {
    const scores = [
      mkScore({ id: NOW - 1 * DAY }),
      mkScore({ id: NOW - 3 * DAY }),
      mkScore({ id: NOW - 6 * DAY }),
      mkScore({ id: NOW - 8 * DAY }), // outside window
      mkScore({ id: NOW - 30 * DAY }),
    ];
    const filtered = _getLast7DaysLessonQuizScores(scores);
    // Card's `weekLessons` = filtered.length; detail row count must equal this.
    expect(filtered.length).toBe(3);
    // Idempotent on stable Date.now()
    expect(_getLast7DaysLessonQuizScores(scores).length).toBe(3);
  });

  test('a lesson from 3 days ago appears', () => {
    expect(_getLast7DaysLessonQuizScores([mkScore({ id: NOW - 3 * DAY })])).toHaveLength(1);
  });

  test('a lesson from 8 days ago does NOT appear', () => {
    expect(_getLast7DaysLessonQuizScores([mkScore({ id: NOW - 8 * DAY })])).toHaveLength(0);
  });

  test('exact 7-day cutoff boundary IS included (>= cutoffMs)', () => {
    expect(_getLast7DaysLessonQuizScores([mkScore({ id: NOW - 7 * DAY })])).toHaveLength(1);
  });

  test('one millisecond past the cutoff is excluded', () => {
    expect(_getLast7DaysLessonQuizScores([mkScore({ id: NOW - 7 * DAY - 1 })])).toHaveLength(0);
  });

  test('only type === "lesson" rows are included', () => {
    const scores = [
      mkScore({ id: NOW - 1 * DAY, type: 'lesson' }),
      mkScore({ id: NOW - 1 * DAY, type: 'unit' }),
      mkScore({ id: NOW - 1 * DAY, type: 'final' }),
      mkScore({ id: NOW - 1 * DAY, type: 'review' }),
      mkScore({ id: NOW - 1 * DAY, type: undefined }),
      mkScore({ id: NOW - 1 * DAY, type: '' }),
    ];
    const filtered = _getLast7DaysLessonQuizScores(scores);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].type).toBe('lesson');
  });

  test('rows with null pct or non-positive total are excluded', () => {
    const scores = [
      mkScore({ id: NOW - 1 * DAY, pct: null }),
      mkScore({ id: NOW - 1 * DAY, pct: undefined }),
      mkScore({ id: NOW - 1 * DAY, total: 0 }),
      mkScore({ id: NOW - 1 * DAY, total: -1 }),
      mkScore({ id: NOW - 1 * DAY }), // valid
    ];
    expect(_getLast7DaysLessonQuizScores(scores)).toHaveLength(1);
  });

  test('rows with non-numeric id are excluded', () => {
    const scores = [
      mkScore({ id: 'not-a-number' }),
      mkScore({ id: null }),
      mkScore({ id: undefined }),
      mkScore({ id: NOW - 2 * DAY }), // valid
    ];
    expect(_getLast7DaysLessonQuizScores(scores)).toHaveLength(1);
  });

  test('different student score arrays remain isolated', () => {
    const studentA = [
      mkScore({ id: NOW - 1 * DAY }),
      mkScore({ id: NOW - 2 * DAY }),
    ];
    const studentB = [
      mkScore({ id: NOW - 1 * DAY }),
    ];
    expect(_getLast7DaysLessonQuizScores(studentA)).toHaveLength(2);
    expect(_getLast7DaysLessonQuizScores(studentB)).toHaveLength(1);
    // The helper does not mutate the input.
    expect(studentA).toHaveLength(2);
    expect(studentB).toHaveLength(1);
  });

  test('handles empty / null / non-array input gracefully', () => {
    expect(_getLast7DaysLessonQuizScores([])).toEqual([]);
    expect(_getLast7DaysLessonQuizScores(null)).toEqual([]);
    expect(_getLast7DaysLessonQuizScores(undefined)).toEqual([]);
    expect(_getLast7DaysLessonQuizScores('not an array')).toEqual([]);
  });

  test('null/undefined/non-object entries in the array are skipped', () => {
    const scores = [
      null,
      undefined,
      'not-an-object',
      mkScore({ id: NOW - 1 * DAY }), // valid
    ];
    expect(_getLast7DaysLessonQuizScores(scores)).toHaveLength(1);
  });
});

// ── _renderSnapLessons — the detail view ─────────────────────────────
describe('_renderSnapLessons (detail view)', () => {
  test('empty state appears when no lessons qualify', () => {
    const html = _renderSnapLessons([], []);
    expect(html).toBe('<p class="db-snap-detail-empty">No lessons completed in the last 7 days.</p>');
  });

  test('empty state when only old or wrong-type scores exist', () => {
    const html = _renderSnapLessons([
      mkScore({ id: NOW - 30 * DAY }),
      mkScore({ id: NOW - 1 * DAY, type: 'unit' }),
      mkScore({ id: NOW - 1 * DAY, type: 'final' }),
    ], []);
    expect(html).toContain('No lessons completed in the last 7 days');
  });

  test('rendered detail includes score percent and score/total fraction', () => {
    const html = _renderSnapLessons([
      mkScore({ id: NOW - 1 * DAY, pct: 85, score: 17, total: 20, label: 'My Lesson' }),
    ], []);
    expect(html).toContain('85%');
    expect(html).toContain('17/20');
    expect(html).toContain('My Lesson');
  });

  test('rendered detail uses date when available', () => {
    const html = _renderSnapLessons([
      mkScore({ id: NOW - 1 * DAY, date: '2026-05-21' }),
    ], []);
    expect(html).toContain('2026-05-21');
  });

  test('rendered detail omits date span when date is empty', () => {
    const html = _renderSnapLessons([
      mkScore({ id: NOW - 1 * DAY, date: '' }),
    ], []);
    // Row still rendered; no inline date span though.
    expect(html).toContain('db-snap-detail-row');
    expect(html).not.toMatch(/&middot;\s*<\/span>/);
  });

  test('rendered detail row count matches helper count', () => {
    const scores = [
      mkScore({ id: NOW - 1 * DAY }),
      mkScore({ id: NOW - 3 * DAY }),
      mkScore({ id: NOW - 6 * DAY }),
      mkScore({ id: NOW - 8 * DAY }), // outside window
    ];
    const html = _renderSnapLessons(scores, []);
    const helperCount = _getLast7DaysLessonQuizScores(scores).length;
    const renderedRows = (html.match(/db-snap-detail-row/g) || []).length;
    expect(helperCount).toBe(3);
    expect(renderedRows).toBe(helperCount);
  });

  test('escapes XSS in lesson label', () => {
    const html = _renderSnapLessons([
      mkScore({ id: NOW - 1 * DAY, label: '<script>alert(1)</script>' }),
    ], []);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script');
  });

  test('rows sorted newest-first by id', () => {
    const html = _renderSnapLessons([
      mkScore({ id: NOW - 6 * DAY, label: 'Oldest' }),
      mkScore({ id: NOW - 1 * DAY, label: 'Newest' }),
      mkScore({ id: NOW - 3 * DAY, label: 'Middle' }),
    ], []);
    const newestIdx = html.indexOf('Newest');
    const middleIdx = html.indexOf('Middle');
    const oldestIdx = html.indexOf('Oldest');
    expect(newestIdx).toBeGreaterThan(-1);
    expect(middleIdx).toBeGreaterThan(-1);
    expect(oldestIdx).toBeGreaterThan(-1);
    expect(newestIdx).toBeLessThan(middleIdx);
    expect(middleIdx).toBeLessThan(oldestIdx);
  });

  test('falls back to qid when label is missing', () => {
    const html = _renderSnapLessons([
      mkScore({ id: NOW - 1 * DAY, label: '', qid: 'lq_u2l3' }),
    ], []);
    expect(html).toContain('lq_u2l3');
  });

  test('falls back to "Lesson Quiz" when both label and qid are missing', () => {
    const html = _renderSnapLessons([
      mkScore({ id: NOW - 1 * DAY, label: '', qid: '' }),
    ], []);
    expect(html).toContain('Lesson Quiz');
  });

  test('color coding tracks score band (good/ok/bad)', () => {
    const goodHtml = _renderSnapLessons([mkScore({ id: NOW - 1 * DAY, pct: 95 })], []);
    expect(goodHtml).toContain('#2e7d32'); // green
    const okHtml = _renderSnapLessons([mkScore({ id: NOW - 1 * DAY, pct: 70 })], []);
    expect(okHtml).toContain('#e65100'); // orange
    const badHtml = _renderSnapLessons([mkScore({ id: NOW - 1 * DAY, pct: 30 })], []);
    expect(badHtml).toContain('#c62828'); // red
  });

  test('does NOT use the legacy activity-events detail empty-state copy', () => {
    // The pre-fix detail view would emit one of these messages when
    // activityEvents was empty. After the fix the detail reads scores
    // directly, so those messages must never appear.
    const html = _renderSnapLessons([], []);
    expect(html).not.toContain('No lesson reading recorded');
    expect(html).not.toContain('No lesson activity in the last 7 days');
  });

  test('activityEvents argument is ignored (signature stays uniform with dispatch)', () => {
    const scores = [mkScore({ id: NOW - 1 * DAY, label: 'L1' })];
    const withEvents    = _renderSnapLessons(scores, [{ lessonId: 'u9l9', ts: NOW }]);
    const withoutEvents = _renderSnapLessons(scores, []);
    expect(withEvents).toBe(withoutEvents);
  });
});

// ── Card count parity (the original bug) ─────────────────────────────
describe('snapshot card count ↔ detail row count parity (the original bug)', () => {
  test('whatever the card would show, the detail shows the same number of rows', () => {
    // The card computes `_getLast7DaysLessonQuizScores(scores).length`.
    // The detail renders one .db-snap-detail-row per element of that array.
    // This test asserts the contract directly.
    const scores = [
      mkScore({ id: NOW - 0 * DAY }),
      mkScore({ id: NOW - 1 * DAY }),
      mkScore({ id: NOW - 3 * DAY }),
      mkScore({ id: NOW - 4 * DAY }),
      mkScore({ id: NOW - 6 * DAY }),
      mkScore({ id: NOW - 6.5 * DAY }),
      mkScore({ id: NOW - 7 * DAY }), // boundary — included
      mkScore({ id: NOW - 7 * DAY - 1 }), // 1ms past — excluded
      mkScore({ id: NOW - 1 * DAY, type: 'unit' }),   // wrong type
      mkScore({ id: NOW - 1 * DAY, pct: null }),       // wrong shape
    ];
    const cardCount    = _getLast7DaysLessonQuizScores(scores).length;
    const detailHtml   = _renderSnapLessons(scores, []);
    const detailRows   = (detailHtml.match(/db-snap-detail-row/g) || []).length;
    expect(cardCount).toBe(7);
    expect(detailRows).toBe(cardCount);
  });
});
