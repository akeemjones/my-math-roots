/**
 * u4l1 "Adding Really Big Numbers" — question-bank quality tests.
 *
 * Covers the two required examples from the lesson rebuild spec:
 *   1. The legacy weak-choice set for 427 + 396 (874/823/761/915) must FAIL
 *      validation with ones_digit_leakage — a student could identify 823 by
 *      solving only the ones column.
 *   2. 456 + 695 = 1,151 must be generated with regrouping in every column,
 *      four-digit misconception-derived distractors, and comma formatting.
 *
 * Also proves the committed src/data/u4.js lesson bank passes the full
 * lesson-specific audit (not just the visible examples).
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const lib = require('../scripts/lib/u4l1_addition.js');

const ROOT = path.resolve(__dirname, '..');

function loadCommittedBank() {
  const cap = {};
  const sandbox = { _mergeUnitData: (i, d) => { cap[i] = d; }, console };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', 'data', 'u4.js'), 'utf8'), sandbox, { filename: 'u4.js' });
  return cap[3];
}

// ─── Misconception simulation (fault-injected column addition) ───────────────

describe('misconception simulation', () => {
  test('456 + 695 reproduces the spec worked example', () => {
    expect(456 + 695).toBe(1151);
    expect(lib.simulateFault(456, 695, 'drop_ones_carry')).toBe(1141);   // forgot the regrouped ten
    expect(lib.simulateFault(456, 695, 'drop_tens_carry')).toBe(1051);   // forgot the regrouped hundred
    expect(lib.simulateFault(456, 695, 'drop_both_carries')).toBe(1041); // ignored both intermediate carries
    expect(lib.simulateFault(456, 695, 'ones_carry_to_hundreds')).toBe(1241); // carry to the wrong column
  });

  test('carry cascade: dropping the ones carry can also kill the tens carry', () => {
    // 107 + 199 = 306; tens only carry because of the incoming ten, so a
    // student who ignores "both" carries actually lands 10 short, not 110.
    expect(lib.simulateFault(107, 199, 'drop_both_carries')).toBe(296);
  });

  test('column slips propagate through regrouping boundaries exactly', () => {
    expect(lib.simulateFault(505, 595, 'tens_minus_one')).toBe(1090);  // 1,100 - 10
    expect(lib.simulateFault(455, 695, 'ones_minus_one')).toBe(1149);  // 1,150 - 1
  });

  test('carryProfile counts the thousands regroup as a regrouping operation', () => {
    expect(lib.carryProfile(456, 695)).toEqual({ ones: true, tens: true, hundreds: true, count: 3 });
    expect(lib.carryProfile(427, 396)).toEqual({ ones: true, tens: true, hundreds: false, count: 2 });
    expect(lib.carryProfile(321, 456).count).toBe(0);
  });
});

// ─── Required example 1: shortcut-leakage detection ──────────────────────────

describe('required example 1 — 427 + 396 legacy weak choices', () => {
  const weakLegacyQuestion = {
    t: 'What is 427 + 396?',
    o: [
      { val: '874', tag: 'err_over_count', patternTag: 'pattern_too_high' },
      { val: '823' },
      { val: '761', tag: 'err_under_count', patternTag: 'pattern_too_low' },
      { val: '915', tag: 'err_over_count', patternTag: 'pattern_too_high' },
    ],
    a: 1,
    e: 'Add ones: 7 + 6 = 13. Regroup. Tens: 2 + 9 + 1 = 12. Regroup. Hundreds: 4 + 3 + 1 = 8. The answer is 823.',
    d: 'm',
    h: 'Add column by column.',
    lessonId: 'u4l1',
  };

  test('fails validation with ones_digit_leakage', () => {
    const issues = lib.validateQuestion(weakLegacyQuestion);
    const types = issues.map((x) => x.type);
    expect(types).toContain('ones_digit_leakage'); // 823 is the only option ending in 3
  });

  test('legacy offsets are flagged as weak (not misconception-reproducible)', () => {
    const issues = lib.validateQuestion(weakLegacyQuestion);
    const weak = issues.filter((x) => x.type === 'weak_distractor');
    expect(weak.length).toBe(3); // 874, 761, 915 — none derivable from a real mistake model
  });

  test('replacement distractors survive the ones column', () => {
    const distractors = lib.deriveDistractors(427, 396, 1);
    // Every replacement wrong answer keeps the correct ones digit, so solving
    // only the ones column no longer identifies the answer.
    distractors.forEach((c) => expect(c.value % 10).toBe(823 % 10));
    // And each one is exactly what its labeled misconception produces.
    distractors.forEach((c) => {
      expect(lib.simulateFault(427, 396, lib.MISCONCEPTION_BY_CODE[c.code].fault)).toBe(c.value);
    });
  });
});

// ─── Required example 2: full "Adding Really Big Numbers" problem ────────────

describe('required example 2 — 456 + 695 = 1,151', () => {
  const bank = lib.generateBank();
  const q = bank.find((x) => x.t === 'What is 456 + 695?');

  test('is present in the generated bank', () => {
    expect(q).toBeDefined();
  });

  test('correct answer is comma-formatted 1,151 at the stored answer index', () => {
    expect(q.o[q.a].val).toBe('1,151');
    expect(q.o[q.a].tag).toBeUndefined();
  });

  test('all four choices are plausible four-digit values', () => {
    q.o.forEach((opt) => {
      const n = lib.parseNumber(opt.val);
      expect(n).toBeGreaterThanOrEqual(1000);
      expect(opt.val).toMatch(/^\d,\d{3}$/); // comma formatting throughout
    });
  });

  test('every distractor is produced by its labeled misconception', () => {
    q.o.forEach((opt, i) => {
      if (i === q.a) return;
      const model = lib.MISCONCEPTION_BY_CODE[opt.patternTag];
      expect(model).toBeDefined();
      expect(lib.formatNumber(lib.simulateFault(456, 695, model.fault))).toBe(opt.val);
      expect(opt.tag).toMatch(/^err_/);
      expect(typeof opt.me).toBe('string');
    });
  });

  test('no shortcut identifies the answer', () => {
    const issues = lib.validateQuestion(q);
    expect(issues).toEqual([]);
  });

  test('explanation walks the full regrouping chain into the thousands', () => {
    expect(q.e).toContain('Step 1: Add the ones. 6 + 5 = 11. Write 1 in the ones place and regroup 1 ten.');
    expect(q.e).toContain('Step 2: Add the tens. 5 + 9 + 1 = 15. Write 5 in the tens place and regroup 1 hundred.');
    expect(q.e).toContain('Step 3: Add the hundreds. 4 + 6 + 1 = 11. Write 1 in the hundreds place and 1 in the thousands place.');
    expect(q.e).toContain('The answer is 1,151.');
  });
});

// ─── Generator invariants ─────────────────────────────────────────────────────

describe('generator', () => {
  const bank = lib.generateBank();

  test('is deterministic', () => {
    expect(JSON.stringify(lib.generateBank())).toBe(JSON.stringify(bank));
  });

  test('produces 108 questions with the mandated composition', () => {
    const { stats, issues, flags } = lib.validateBank(bank);
    expect(issues).toEqual([]);
    expect(flags).toEqual([]);
    expect(stats.total).toBe(108);
    expect(stats.bothThreeDigit).toBe(108);
    expect(stats.multiRegroupPct).toBeGreaterThanOrEqual(70);
    expect(stats.fourDigitPct).toBeGreaterThanOrEqual(35);
    expect(stats.noRegroupPct).toBeLessThanOrEqual(15);
  });

  test('balances stored correct-answer positions across the bank', () => {
    const { stats } = lib.validateBank(bank);
    stats.correctPosition.forEach((n) => expect(n).toBe(27));
  });

  test('does not make the largest option systematically correct', () => {
    const { stats } = lib.validateBank(bank);
    expect(stats.correctIsLargest / stats.total).toBeLessThan(0.45);
  });

  test('populates every difficulty tier the stratified sampler draws from', () => {
    const byD = { e: 0, m: 0, h: 0 };
    bank.forEach((q) => { byD[q.d]++; });
    // Lesson quizzes draw 3 easy + 3 medium + 2 hard (src/quiz.js _DIFF_TARGETS).
    expect(byD.e).toBeGreaterThanOrEqual(8);
    expect(byD.m).toBeGreaterThanOrEqual(8);
    expect(byD.h).toBeGreaterThanOrEqual(8);
  });
});

// ─── Review-hardening invariants (regression guards) ─────────────────────────

describe('review-hardening invariants', () => {
  const bank = lib.generateBank();
  const ops = (q) => lib.parseOperands(q.t);

  test('difficulty label reflects the actual arithmetic, not the content tier', () => {
    // No single-regroup / sub-1,000 item may be labeled "hard" (assessment
    // validity: the h pool must not contain items easier than the m tier).
    bank.forEach((q) => {
      const [A, B] = ops(q);
      const S = A + B;
      const count = lib.carryProfile(A, B).count;
      expect(q.d).toBe(lib.difficultyFor(A, B));
      if (q.d === 'h') expect(S).toBeGreaterThanOrEqual(1000);
      if (q.d === 'm') { expect(S).toBeLessThan(1000); expect(count).toBe(2); }
      if (q.d === 'e') { expect(S).toBeLessThan(1000); expect(count).toBeLessThanOrEqual(1); }
    });
  });

  test('word problems exercise the full template, name, and item variety', () => {
    const wps = bank.filter((q) => !/^What is/.test(q.t));
    expect(wps.length).toBeGreaterThanOrEqual(12);
    // Distinct sentence skeletons (numbers stripped) — no aliasing to 2 stems.
    const skeletons = new Set(wps.map((q) => q.t.replace(/\d+/g, '#').replace(/\b[A-Z][a-z]+/g, 'N')));
    expect(skeletons.size).toBeGreaterThanOrEqual(6);
    const names = new Set();
    wps.forEach((q) => { const m = q.t.match(/^([A-Z][a-z]+)(?:’s)?\b/); if (m && m[1] !== 'A') names.add(m[1]); });
    expect(names.size).toBeGreaterThanOrEqual(6);
  });

  test('no off-objective ones-column ±1 distractor on a non-regrouping ones column', () => {
    bank.forEach((q) => {
      const [A, B] = ops(q);
      const onesRegroup = (A % 10 + B % 10) >= 10;
      q.o.forEach((o) => {
        if (o.patternTag === 'pattern_ones_column_high' || o.patternTag === 'pattern_ones_column_low') {
          expect(onesRegroup).toBe(true);
        }
      });
    });
  });

  test('the thousands-place hint cannot leak whether the sum is four digits', () => {
    let fourDigitWithHint = 0, threeDigitWithHint = 0, fourDigitNoHint = 0;
    bank.forEach((q) => {
      const [A, B] = ops(q);
      const S = A + B;
      const hasHint = /thousands place/.test(q.h);
      if (S >= 1000 && hasHint) fourDigitWithHint++;
      if (S < 1000 && hasHint) threeDigitWithHint++;
      if (S >= 1000 && !hasHint) fourDigitNoHint++;
    });
    // The hint appears on plenty of sub-1,000 problems too, and never omits a
    // four-digit one — so its presence carries no information about the answer.
    expect(threeDigitWithHint).toBeGreaterThan(0);
    expect(fourDigitNoHint).toBe(0);
    expect(fourDigitWithHint).toBeGreaterThan(0);
  });

  test('teaches "regroup" consistently — no "carry" in student-facing text', () => {
    bank.forEach((q) => {
      expect(/\bcarry\b/i.test(q.h)).toBe(false);
      expect(/\bcarry\b/i.test(q.e)).toBe(false);
      q.o.forEach((o) => { if (o.me) expect(/\bcarry\b/i.test(o.me)).toBe(false); });
    });
  });
});

// ─── Committed bank (src/data/u4.js) ─────────────────────────────────────────

describe('committed u4l1 bank in src/data/u4.js', () => {
  const u4 = loadCommittedBank();
  const bank = u4.lessons[0].qBank;

  test('matches the deterministic generator output exactly', () => {
    expect(JSON.stringify(bank)).toBe(JSON.stringify(lib.generateBank()));
  });

  test('passes the full lesson-specific audit (whole bank, not just examples)', () => {
    const { issues, flags } = lib.validateBank(bank);
    expect(issues).toEqual([]);
    expect(flags).toEqual([]);
  });

  test('honors the app data contract on every question', () => {
    bank.forEach((q) => {
      expect(q.lessonId).toBe('u4l1');
      expect(['e', 'm', 'h']).toContain(q.d);
      expect(q.o).toHaveLength(4);
      const vals = q.o.map((o) => o.val);
      expect(new Set(vals).size).toBe(4); // grading is text-equality — vals must be unique
      const untagged = q.o.filter((o) => !o.tag);
      expect(untagged).toHaveLength(1);
      expect(q.o[q.a].tag).toBeUndefined();
      q.o.forEach((o, i) => {
        if (i === q.a) return;
        expect(o.tag).toMatch(/^err_/);
        expect(o.patternTag).toMatch(/^pattern_/);
      });
    });
  });

  test('contains no emojis in student-facing text', () => {
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    bank.forEach((q) => {
      expect(emoji.test(q.t)).toBe(false);
      expect(emoji.test(q.e)).toBe(false);
      expect(emoji.test(q.h)).toBe(false);
      q.o.forEach((o) => { if (o.me) expect(emoji.test(o.me)).toBe(false); });
    });
  });

  test('leaves the sibling banks untouched by the rebuild (structure intact)', () => {
    expect(u4.lessons).toHaveLength(3);
    expect(u4.lessons[1].qBank.length).toBe(94);
    expect(u4.lessons[2].qBank.length).toBe(100);
    expect(u4.unitQuiz.length).toBe(70);
    expect(u4.testBank.length).toBe(160);
  });
});

// ─── Validator detection power (synthetic negatives) ─────────────────────────

describe('validator catches engineered defects', () => {
  const good = lib.generateBank().find((x) => x.t === 'What is 427 + 396?');

  test('reversed operand pairs', () => {
    const twin = JSON.parse(JSON.stringify(good));
    twin.t = 'What is 396 + 427?';
    const { stats } = lib.validateBank([good, twin]);
    expect(stats.issueCounts.reversed_operands).toBe(1);
  });

  test('digit-length leakage when the correct answer is the only four-digit option', () => {
    const q = {
      t: 'What is 456 + 695?',
      o: [{ val: '1,151' },
          { val: '941', tag: 'err_under_count', patternTag: 'pattern_too_low' },
          { val: '851', tag: 'err_under_count', patternTag: 'pattern_too_low' },
          { val: '961', tag: 'err_over_count', patternTag: 'pattern_too_high' }],
      a: 0, e: 'The answer is 1,151.', d: 'h', h: 'x', lessonId: 'u4l1',
    };
    expect(lib.validateQuestion(q).map((x) => x.type)).toContain('digit_length_leakage');
  });

  test('explanations with false regrouping steps', () => {
    const q = JSON.parse(JSON.stringify(good));
    q.e = 'Step 1: Add the ones. 7 + 6 = 12. Write 2 in the ones place and regroup 1 ten.\nThe answer is 823.';
    expect(lib.validateQuestion(q).map((x) => x.type)).toContain('explanation_mismatch');
  });

  test('duplicate answer choices', () => {
    const q = JSON.parse(JSON.stringify(good));
    q.o[0].val = q.o[1].val;
    expect(lib.validateQuestion(q).map((x) => x.type)).toContain('duplicate_choices');
  });

  test('mislabeled misconceptions', () => {
    const q = JSON.parse(JSON.stringify(good));
    const wrongIdx = q.a === 0 ? 1 : 0;
    q.o[wrongIdx].patternTag = q.o[wrongIdx].patternTag === 'pattern_forgot_ones_carry'
      ? 'pattern_forgot_tens_carry' : 'pattern_forgot_ones_carry';
    expect(lib.validateQuestion(q).map((x) => x.type)).toContain('mislabeled_misconception');
  });

  test('missing comma formatting on four-digit answers', () => {
    const bank = lib.generateBank();
    const q = JSON.parse(JSON.stringify(bank.find((x) => x.t === 'What is 456 + 695?')));
    q.o[q.a].val = '1151';
    expect(lib.validateQuestion(q).map((x) => x.type)).toContain('formatting');
  });
});
