'use strict';

// Same localStorage stub trick as dashboard.test.js — src/dashboard.js
// references localStorage at module load.
if (typeof globalThis.localStorage === 'undefined') {
  const _store = new Map();
  globalThis.localStorage = {
    getItem(k)    { return _store.has(k) ? _store.get(k) : null; },
    setItem(k, v) { _store.set(String(k), String(v)); },
    removeItem(k) { _store.delete(k); },
    clear()       { _store.clear(); },
  };
}

const { _deriveReportDiagnostics } = require('../src/dashboard.js');

const labelFn = (tag) => ({
  err_off_by_one: 'Counting by ones (off-by-one)',
  err_same:       'Reusing the same answer',
}[tag] || tag);

const helpFn = (tag) => ({
  err_off_by_one: 'May be miscounting by one when adding or counting up.',
}[tag] || null);

describe('_deriveReportDiagnostics', () => {
  test('returns empty diagnostics when no events and no mastery', () => {
    const out = _deriveReportDiagnostics([], {}, labelFn, helpFn);
    expect(out.topErrorTags).toEqual([]);
    expect(out.interventionSummary).toBeNull();
    expect(out.recoveryPatterns).toEqual([]);
    expect(out.repeatedMistakes).toEqual([]);
  });

  test('counts triggered events per tag and ranks by frequency', () => {
    const events = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_same' },
    ];
    const out = _deriveReportDiagnostics(events, {}, labelFn, helpFn);
    expect(out.topErrorTags).toEqual([
      { label: 'Counting by ones (off-by-one)', count: 3 },
      { label: 'Reusing the same answer',       count: 1 },
    ]);
  });

  test('computes overall and per-tag recovery rate', () => {
    const events = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: true },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: false },
    ];
    const out = _deriveReportDiagnostics(events, {}, labelFn, helpFn);
    expect(out.interventionSummary).toEqual({ total: 2, recoveryRate: 50 });
    expect(out.recoveryPatterns).toEqual([
      { label: 'Counting by ones (off-by-one)', attempts: 2, recoveryRate: 50 },
    ]);
  });

  test('includes misconception description only when helpFn returns one', () => {
    const events = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'triggered', errorTag: 'err_same' },
    ];
    const out = _deriveReportDiagnostics(events, {}, labelFn, helpFn);
    expect(out.misconceptionPatterns).toEqual([
      {
        label:       'Counting by ones (off-by-one)',
        description: 'May be miscounting by one when adding or counting up.',
      },
    ]);
  });

  test('reports repeatedMistakes from mastery (wrongCount >= 2)', () => {
    const mastery = {
      'qid_a': { attempts: 5, correct: 1 }, // 4 wrong
      'qid_b': { attempts: 3, correct: 2 }, // 1 wrong — excluded
      'qid_c': { attempts: 4, correct: 2 }, // 2 wrong
    };
    const out = _deriveReportDiagnostics([], mastery, labelFn, helpFn);
    expect(out.repeatedMistakes).toEqual([
      { label: 'qid_a', wrongCount: 4 },
      { label: 'qid_c', wrongCount: 2 },
    ]);
  });

  test('caps topErrorTags at 6 and recoveryPatterns at 6', () => {
    const events = [];
    for (let i = 0; i < 10; i++) {
      events.push({ type: 'triggered', errorTag: 'err_' + i });
      events.push({ type: 'triggered', errorTag: 'err_' + i });
    }
    const out = _deriveReportDiagnostics(events, {}, labelFn, helpFn);
    expect(out.topErrorTags.length).toBe(6);
    expect(out.recoveryPatterns.length).toBe(6);
  });

  test('dedupes topErrorTags by label and uses correct description for misconceptionPatterns', () => {
    // Two distinct err_* tags collapse to the same parent-friendly label.
    // Each tag has its own help-map entry — but the description used should
    // match the tag whose count is largest (the first to be deduped).
    const collidingLabel = (tag) => ({
      err_alpha: 'Same label',
      err_beta:  'Same label',
      err_solo:  'Solo label',
    }[tag] || tag);
    const collidingHelp = (tag) => ({
      err_alpha: 'Description from alpha tag.',
      err_beta:  'Description from beta tag.',
      err_solo:  'Description from solo tag.',
    }[tag] || null);
    const events = [
      // alpha gets 3 triggers, beta gets 1 → alpha is dominant
      { type: 'triggered', errorTag: 'err_alpha' },
      { type: 'triggered', errorTag: 'err_alpha' },
      { type: 'triggered', errorTag: 'err_alpha' },
      { type: 'triggered', errorTag: 'err_beta' },
      { type: 'triggered', errorTag: 'err_solo' },
    ];
    const out = _deriveReportDiagnostics(events, {}, collidingLabel, collidingHelp);
    // topErrorTags should have ONE 'Same label' entry (count 4 = 3 + 1) and the solo one
    expect(out.topErrorTags).toEqual([
      { label: 'Same label', count: 4 },
      { label: 'Solo label', count: 1 },
    ]);
    // misconceptionPatterns should use the description from err_alpha (dominant tag),
    // never from err_beta (which lost dedup)
    expect(out.misconceptionPatterns).toEqual([
      { label: 'Same label', description: 'Description from alpha tag.' },
      { label: 'Solo label', description: 'Description from solo tag.' },
    ]);
  });

  test('clamps recoveryRate to [0, 100] even with corrupt event counts', () => {
    // Synthetic corruption: 1 trigger but 5 resolved (would naively give 500%).
    const events = [
      { type: 'triggered', errorTag: 'err_off_by_one' },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: true },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: true },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: true },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: true },
      { type: 'resolved',  errorTag: 'err_off_by_one', resolvedCorrectly: true },
    ];
    const out = _deriveReportDiagnostics(events, {}, labelFn, helpFn);
    expect(out.interventionSummary.recoveryRate).toBeLessThanOrEqual(100);
    expect(out.interventionSummary.recoveryRate).toBeGreaterThanOrEqual(0);
    // recoveryPatterns only includes tags with ≥2 attempts — err_off_by_one has 1 trigger so it's excluded
    expect(out.recoveryPatterns).toEqual([]);
  });
});
