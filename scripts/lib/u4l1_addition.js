// scripts/lib/u4l1_addition.js
//
// Deterministic generator + validator for the Grade-2 u4l1 "Adding Really Big
// Numbers" question bank (TEKS 2.4B/C — three-digit addition with regrouping,
// stretched across 1,000 per the CBE assessment expectations).
//
// Every distractor is derived by SIMULATING the labeled misconception against
// the actual operands (fault-injected column addition), never by an arbitrary
// offset. The simulation is the single source of truth: the generator uses it
// to build wrong answers and the validator re-runs it to prove each distractor
// is reproducible from its patternTag.
//
// Used by: scripts/rebuild_u4l1_addition_bank.js (generation),
//          scripts/audit_u4l1_bank.js (CLI audit),
//          tests/u4l1-addition-bank.test.js (jest).
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Arithmetic helpers
// ─────────────────────────────────────────────────────────────────────────────

function digitsOf(n) {
  return { ones: n % 10, tens: Math.floor(n / 10) % 10, hundreds: Math.floor(n / 100) % 10 };
}

// True regrouping profile of A + B (both < 1000). `hundreds` means the sum
// crosses into a new thousands place — the third regrouping operation.
function carryProfile(A, B) {
  const a = digitsOf(A), b = digitsOf(B);
  const ones = a.ones + b.ones >= 10;
  const tens = a.tens + b.tens + (ones ? 1 : 0) >= 10;
  const hundreds = a.hundreds + b.hundreds + (tens ? 1 : 0) >= 10;
  return { ones, tens, hundreds, count: (ones ? 1 : 0) + (tens ? 1 : 0) + (hundreds ? 1 : 0) };
}

// Comma formatting for student-facing values (1,151 not 1151).
function formatNumber(n) {
  const s = String(n);
  return s.length > 3 ? s.slice(0, s.length - 3) + ',' + s.slice(s.length - 3) : s;
}

function parseNumber(v) {
  const m = String(v == null ? '' : v).replace(/,/g, '').match(/^\s*(\d+)\s*$/);
  return m ? Number(m[1]) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fault-injected column addition
// ─────────────────────────────────────────────────────────────────────────────
// Reproduces the answer a student gets when they make one specific procedural
// mistake. Carries use floor(sum/10) so fault-induced cascades stay exact.

function simulateFault(A, B, fault) {
  const a = digitsOf(A), b = digitsOf(B);

  let onesSum = a.ones + b.ones;
  if (fault === 'ones_plus_one') onesSum += 1;
  if (fault === 'ones_minus_one') onesSum -= 1;
  if (onesSum < 0) return null; // fault not meaningful for these operands
  const onesDigit = onesSum % 10;
  let carryToTens = Math.floor(onesSum / 10);
  let strayToHundreds = 0;
  if (fault === 'drop_ones_carry' || fault === 'drop_both_carries') carryToTens = 0;
  if (fault === 'ones_carry_to_hundreds' && carryToTens > 0) { strayToHundreds = carryToTens; carryToTens = 0; }
  if (fault === 'extra_ones_carry') carryToTens += 1;

  let tensSum = a.tens + b.tens + carryToTens;
  if (fault === 'tens_plus_one') tensSum += 1;
  if (fault === 'tens_minus_one') tensSum -= 1;
  if (tensSum < 0) return null;
  const tensDigit = tensSum % 10;
  let carryToHundreds = Math.floor(tensSum / 10);
  if (fault === 'drop_tens_carry' || fault === 'drop_both_carries') carryToHundreds = 0;
  if (fault === 'extra_tens_carry') carryToHundreds += 1;

  let hundredsSum = a.hundreds + b.hundreds + carryToHundreds + strayToHundreds;
  if (fault === 'hundreds_plus_one') hundredsSum += 1;
  if (fault === 'hundreds_minus_one') hundredsSum -= 1;
  if (hundredsSum < 0) return null;

  // Final column is written in full — no further place to regroup into.
  return hundredsSum * 100 + tensDigit * 10 + onesDigit;
}

// ─────────────────────────────────────────────────────────────────────────────
// Misconception catalog
// ─────────────────────────────────────────────────────────────────────────────
// code       — precise misconception model, stored as the option's patternTag.
// tag        — err_* from the established Grade-2 vocabulary (dashboard /
//              intervention mapped; validate_grade2_content.js KNOWN_ERR).
// applies    — whether this mistake is genuinely possible for these operands.
// me         — student-facing note shown in the intervention modal (quiz.js
//              reads q.o[selected].me).
// Catalog order is selection priority: regrouping misconceptions (the lesson
// objective) outrank generic column slips.

const MISCONCEPTIONS = [
  {
    code: 'pattern_forgot_ones_carry', tag: 'err_no_regroup', fault: 'drop_ones_carry',
    applies: (p) => p.ones,
    me: 'It looks like the regrouped ten from the ones column was left out. When the ones make 10 or more, add 1 to the tens column.',
  },
  {
    code: 'pattern_forgot_tens_carry', tag: 'err_no_regroup', fault: 'drop_tens_carry',
    applies: (p) => p.tens,
    me: 'It looks like the regrouped hundred from the tens column was left out. When the tens make 10 or more, add 1 to the hundreds column.',
  },
  {
    code: 'pattern_forgot_both_carries', tag: 'err_no_regroup', fault: 'drop_both_carries',
    applies: (p) => p.ones && p.tens,
    me: 'It looks like both regrouped values were left out. Every time a column makes 10 or more, regroup 1 to the next column.',
  },
  {
    code: 'pattern_carried_to_wrong_column', tag: 'err_place_value_confusion', fault: 'ones_carry_to_hundreds',
    applies: (p) => p.ones,
    me: 'It looks like the regrouped ten was added to the hundreds column. A ten regrouped from the ones belongs in the tens column.',
  },
  {
    code: 'pattern_extra_ones_carry', tag: 'err_extra_regroup', fault: 'extra_ones_carry',
    applies: (p) => !p.ones,
    me: 'It looks like a ten was regrouped even though the ones column makes less than 10. Only regroup when a column makes 10 or more.',
  },
  {
    code: 'pattern_extra_tens_carry', tag: 'err_extra_regroup', fault: 'extra_tens_carry',
    applies: (p) => !p.tens,
    me: 'It looks like a hundred was regrouped even though the tens column makes less than 10. Only regroup when a column makes 10 or more.',
  },
  {
    code: 'pattern_hundreds_column_high', tag: 'err_over_count', fault: 'hundreds_plus_one',
    applies: () => true,
    me: 'Check the hundreds column. This answer counts one hundred too many.',
  },
  {
    code: 'pattern_hundreds_column_low', tag: 'err_under_count', fault: 'hundreds_minus_one',
    // When the tens carry exists, S-100 is the forgot_tens_carry value — that
    // label wins (catalog order); this one only applies without a tens carry.
    applies: (p) => !p.tens,
    me: 'Check the hundreds column. This answer counts one hundred too few.',
  },
  {
    code: 'pattern_tens_column_high', tag: 'err_over_count', fault: 'tens_plus_one',
    applies: () => true,
    me: 'Check the tens column. This answer counts one ten too many.',
  },
  {
    code: 'pattern_tens_column_low', tag: 'err_under_count', fault: 'tens_minus_one',
    // With a ones carry, S-10 is the forgot_ones_carry value — that label wins.
    applies: (p, a, b) => !p.ones && a.tens + b.tens >= 1,
    me: 'Check the tens column. This answer counts one ten too few.',
  },
  // Ones-column ±1 slips are only offered when the ones column actually
  // regroups. On a non-regrouping ones column a ±1 distractor tests single-
  // digit addition rather than the regrouping objective, and produces a very
  // tight (sum±1) visual near-miss — off-target for this lesson.
  {
    code: 'pattern_ones_column_high', tag: 'err_off_by_one', fault: 'ones_plus_one',
    applies: (p) => p.ones,
    me: 'Check the ones column. This answer is off by one.',
  },
  {
    code: 'pattern_ones_column_low', tag: 'err_off_by_one', fault: 'ones_minus_one',
    applies: (p, a, b) => p.ones && a.ones + b.ones >= 1,
    me: 'Check the ones column. This answer is off by one.',
  },
];

const MISCONCEPTION_BY_CODE = {};
MISCONCEPTIONS.forEach((m) => { MISCONCEPTION_BY_CODE[m.code] = m; });

// All values any cataloged misconception produces for A + B (deduped, first
// applicable catalog entry wins the label).
function misconceptionCandidates(A, B) {
  const p = carryProfile(A, B), a = digitsOf(A), b = digitsOf(B), S = A + B;
  const seen = new Set();
  const out = [];
  for (const m of MISCONCEPTIONS) {
    if (!m.applies(p, a, b)) continue;
    const v = simulateFault(A, B, m.fault);
    if (v == null || v <= 0 || v === S || seen.has(v)) continue;
    seen.add(v);
    out.push({ value: v, code: m.code, tag: m.tag, me: m.me });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic PRNG (mulberry32) — fixed seed, no Date/Math.random anywhere.
// ─────────────────────────────────────────────────────────────────────────────

function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────────────────────
// Distractor selection
// ─────────────────────────────────────────────────────────────────────────────
// Picks 3 misconception-derived distractors honoring the anti-leakage rules:
//   - every distractor within ±120 of the true sum (no magnitude leakage)
//   - at least one distractor shares the correct ones digit (no ones leakage)
//   - at least one distractor shares the correct digit length; when the sum
//     has four digits, at least two distractors are also four-digit
//   - at most one ones-column slip per question (keeps the set carry-focused)
//   - aboveTarget rotates across the bank so the largest option is not
//     systematically the correct one.

function deriveDistractors(A, B, aboveTarget) {
  const S = A + B;
  const sameLen = (v) => String(v).length === String(S).length;
  const cands = misconceptionCandidates(A, B).filter((c) => Math.abs(c.value - S) <= 120);
  const isOnesSlip = (c) => c.code === 'pattern_ones_column_high' || c.code === 'pattern_ones_column_low';

  const below = cands.filter((c) => c.value < S);
  const above = cands.filter((c) => c.value > S);

  const chosen = [];
  const usable = (c) =>
    !chosen.some((x) => x.value === c.value) &&
    !(isOnesSlip(c) && chosen.some(isOnesSlip));

  function take(pool, n) {
    for (const c of pool) {
      if (chosen.length >= 3 || n <= 0) return;
      if (usable(c)) { chosen.push(c); n--; }
    }
  }

  // Honor the requested above/below split, then fill from whatever remains.
  take(above, Math.min(aboveTarget, 3));
  take(below, 3 - chosen.length);
  take(above, 3 - chosen.length);

  // Four-digit sums need at least two four-digit distractors.
  if (S >= 1000) {
    let fourDigit = chosen.filter((c) => c.value >= 1000).length;
    for (const c of cands) {
      if (fourDigit >= 2) break;
      if (c.value >= 1000 && usable(c)) {
        const idx = chosen.findIndex((x) => x.value < 1000);
        if (idx >= 0) { chosen.splice(idx, 1, c); fourDigit++; }
      }
    }
  }

  // At least one distractor must share the ones digit (kills the solve-the-
  // ones-column shortcut) and one must share the digit length.
  if (!chosen.some((c) => c.value % 10 === S % 10)) {
    const fix = cands.find((c) => c.value % 10 === S % 10 && usable(c));
    if (fix) chosen.splice(chosen.findIndex(isOnesSlip) >= 0 ? chosen.findIndex(isOnesSlip) : chosen.length - 1, 1, fix);
  }
  if (!chosen.some((c) => sameLen(c.value))) {
    const fix = cands.find((c) => sameLen(c.value) && usable(c));
    if (fix) chosen.splice(chosen.length - 1, 1, fix);
  }

  if (chosen.length !== 3) {
    throw new Error('could not derive 3 distractors for ' + A + ' + ' + B);
  }
  return chosen;
}

// ─────────────────────────────────────────────────────────────────────────────
// Student-facing text builders
// ─────────────────────────────────────────────────────────────────────────────

function buildExplanation(A, B, opts) {
  const word = opts && opts.word;
  const a = digitsOf(A), b = digitsOf(B), p = carryProfile(A, B), S = A + B;
  const lines = [];
  if (word) lines.push('Add ' + A + ' + ' + B + ' to find the total.');

  const onesSum = a.ones + b.ones;
  lines.push('Step 1: Add the ones. ' + a.ones + ' + ' + b.ones + ' = ' + onesSum + '. ' +
    (p.ones ? 'Write ' + (onesSum % 10) + ' in the ones place and regroup 1 ten.'
            : 'Write ' + onesSum + ' in the ones place.'));

  const tensSum = a.tens + b.tens + (p.ones ? 1 : 0);
  lines.push('Step 2: Add the tens. ' + a.tens + ' + ' + b.tens + (p.ones ? ' + 1' : '') + ' = ' + tensSum + '. ' +
    (p.tens ? 'Write ' + (tensSum % 10) + ' in the tens place and regroup 1 hundred.'
            : 'Write ' + tensSum + ' in the tens place.'));

  const hundredsSum = a.hundreds + b.hundreds + (p.tens ? 1 : 0);
  lines.push('Step 3: Add the hundreds. ' + a.hundreds + ' + ' + b.hundreds + (p.tens ? ' + 1' : '') + ' = ' + hundredsSum + '. ' +
    (p.hundreds ? 'Write ' + (hundredsSum % 10) + ' in the hundreds place and 1 in the thousands place.'
                : 'Write ' + hundredsSum + ' in the hundreds place.'));

  lines.push('The answer is ' + formatNumber(S) + '.');
  return lines.join('\n');
}

const HINTS = [
  'Line up the hundreds, tens, and ones. Start adding with the ones column.',
  'Add the ones first. If a column makes 10 or more, regroup 1 to the next column.',
  'Work right to left: ones, then tens, then hundreds. Regroup 1 whenever a column makes 10 or more.',
  'Stack the numbers by place value before you add. Watch for columns that make 10 or more.',
];
const HINT_NO_REGROUP = 'Add each column: ones first, then tens, then hundreds.';
// Conditional place-value reminder. Appended to EVERY regrouping question
// (not only those whose sum happens to reach 1,000) so its presence can never
// leak whether the answer is a four-digit number.
const HINT_THOUSANDS = ' If the hundreds make 10 or more, the answer needs a thousands place.';

function buildHint(A, B, i) {
  const p = carryProfile(A, B);
  if (p.count === 0) return HINT_NO_REGROUP;
  return HINTS[i % HINTS.length] + HINT_THOUSANDS;
}

// Word-problem templates. Constraints: no digits other than the two operands,
// join phrasing only ("in all"/"altogether" — classified as addition by the
// Grade-2 content validator), Grade-2 reading level. Templates and the
// name/item pools are indexed by a per-word-problem ordinal (see generateBank)
// so every template, name, and item is exercised rather than aliased away.
const WP_NAMES = [
  ['Maya', 'She'], ['Ben', 'He'], ['Ava', 'She'], ['Leo', 'He'], ['Kim', 'She'],
  ['Sam', 'He'], ['Mia', 'She'], ['Eli', 'He'], ['Zoe', 'She'], ['Rex', 'He'],
  ['Nina', 'She'], ['Cole', 'He'],
];
const WP_ITEMS = ['stickers', 'marbles', 'trading cards', 'beads', 'buttons', 'seashells', 'stamps', 'building blocks', 'pennies', 'crayons', 'bottle caps', 'game tokens'];
const WP_TEMPLATES = [
  (A, B, name, pron, items) => name + ' has ' + A + ' ' + items + '. ' + pron + ' gets ' + B + ' more ' + items + '. How many ' + items + ' does ' + name + ' have in all?',
  (A, B, name, pron, items) => name + ' collects ' + A + ' ' + items + '. Then ' + pron.toLowerCase() + ' collects ' + B + ' more. How many ' + items + ' does ' + name + ' have altogether?',
  (A, B) => 'A school library has ' + A + ' books on the shelves. The librarian adds ' + B + ' more books. How many books are there in all?',
  (A, B) => 'A farm picks ' + A + ' apples in the morning and ' + B + ' apples in the afternoon. How many apples does the farm pick in all?',
  (A, B) => 'A toy store sold ' + A + ' toys in June and ' + B + ' toys in July. How many toys did the store sell in all?',
  (A, B, name, pron) => name + '’s class read ' + A + ' pages one week and ' + B + ' pages the next week. How many pages did the class read in all?',
  (A, B) => 'A bakery made ' + A + ' muffins on Saturday and ' + B + ' muffins on Sunday. How many muffins did the bakery make in all?',
  (A, B, name, pron) => name + ' scored ' + A + ' points in the first game and ' + B + ' points in the second game. How many points did ' + name + ' score altogether?',
];

function buildPrompt(A, B, style, wordSeq) {
  if (style !== 'word') return 'What is ' + A + ' + ' + B + '?';
  const tpl = WP_TEMPLATES[wordSeq % WP_TEMPLATES.length];
  const nm = WP_NAMES[wordSeq % WP_NAMES.length];
  const items = WP_ITEMS[wordSeq % WP_ITEMS.length];
  return tpl(A, B, nm[0], nm[1], items);
}

// ─────────────────────────────────────────────────────────────────────────────
// Question assembly
// ─────────────────────────────────────────────────────────────────────────────

// App difficulty band ('e'/'m'/'h') for the stratified sampler (a lesson quiz
// draws 3 easy + 3 medium + 2 hard). This is assigned by the ACTUAL arithmetic
// load, not by the content tier — the content tier drives which OPERANDS are
// generated (variety), but the difficulty label must be honest so the sampler
// never mixes a single-regroup sub-1,000 sum into the same "hard" pool as a
// triple-regroup four-digit sum:
//   h — sum crosses 1,000 (a regrouped thousands place: the hardest cases)
//   m — sum < 1,000 with two regrouping operations
//   e — sum < 1,000 with at most one regrouping operation
function difficultyFor(A, B) {
  const S = A + B;
  if (S >= 1000) return 'h';
  return carryProfile(A, B).count === 2 ? 'm' : 'e';
}

function buildQuestion(spec) {
  const { A, B, style, correctPos, aboveTarget, wordSeq, hintSeq } = spec;
  const S = A + B;
  const distractors = deriveDistractors(A, B, aboveTarget);

  const options = [];
  distractors.forEach((c) => {
    options.push({ val: formatNumber(c.value), tag: c.tag, patternTag: c.code, me: c.me });
  });
  // Insert the correct option at its balanced position.
  options.splice(correctPos, 0, { val: formatNumber(S) });

  return {
    t: buildPrompt(A, B, style, wordSeq),
    o: options,
    a: correctPos,
    e: buildExplanation(A, B, { word: style === 'word' }),
    d: difficultyFor(A, B),
    h: buildHint(A, B, hintSeq),
    lessonId: 'u4l1',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Operand-pair generation per difficulty tier
// ─────────────────────────────────────────────────────────────────────────────
// Target composition (108 questions):
//   introductory 11 (10%)  — 4 no-regroup warm-ups + 7 single-regroup
//   developing   27 (25%)  — exactly two regroupings, sum < 1,000
//   proficient   49 (45%)  — sum >= 1,000 (31 triple-regroup, 18 double)
//   advanced     21 (20%)  — zeros in tens/ones, uneven operands, boundary sums

const SEED = 20260713;

function hasZeroTensOrOnes(n) {
  const d = digitsOf(n);
  return d.tens === 0 || d.ones === 0;
}

function unevenLooking(A, B) {
  return Math.abs(digitsOf(A).hundreds - digitsOf(B).hundreds) >= 4;
}

// Spec-mandated anchor problems (from the lesson brief), placed in their tiers.
const ANCHORS = {
  intro_none: [[321, 456]],
  intro_one: [],
  developing: [[427, 396], [358, 487], [276, 589], [234, 589]],
  proficient_triple: [[456, 695], [587, 746], [638, 485], [759, 684], [495, 507], [681, 329]],
  proficient_double: [],
  adv_zero_4d: [[506, 697], [408, 785], [609, 594]],
  adv_zero_3d: [],
  adv_uneven: [],
  adv_single_zero: [[372, 608]],
};

const BUCKETS = [
  { key: 'intro_none', tier: 'introductory', count: 4,
    fits: (A, B, p, S) => p.count === 0 && S < 1000 },
  { key: 'intro_one', tier: 'introductory', count: 7,
    fits: (A, B, p, S) => p.count === 1 && S < 1000 },
  { key: 'developing', tier: 'developing', count: 27,
    fits: (A, B, p, S) => p.count === 2 && S < 1000 },
  { key: 'proficient_triple', tier: 'proficient', count: 31,
    fits: (A, B, p, S) => p.count === 3 && S >= 1000 },
  { key: 'proficient_double', tier: 'proficient', count: 18,
    fits: (A, B, p, S) => p.count === 2 && S >= 1000 },
  { key: 'adv_zero_4d', tier: 'advanced', count: 8,
    fits: (A, B, p, S) => S >= 1000 && p.count >= 2 && (hasZeroTensOrOnes(A) || hasZeroTensOrOnes(B)) },
  { key: 'adv_zero_3d', tier: 'advanced', count: 5,
    fits: (A, B, p, S) => S < 1000 && p.count === 2 && (hasZeroTensOrOnes(A) || hasZeroTensOrOnes(B)) },
  { key: 'adv_uneven', tier: 'advanced', count: 5,
    fits: (A, B, p, S) => p.count >= 2 && unevenLooking(A, B) },
  { key: 'adv_single_zero', tier: 'advanced', count: 3,
    fits: (A, B, p, S) => p.count === 1 && (hasZeroTensOrOnes(A) || hasZeroTensOrOnes(B)) },
];

function generatePairs(rng) {
  const usedPairs = new Set();   // unordered "lo+hi" keys — also blocks reversed reuse
  const operandUse = new Map();  // each exact operand at most twice across the bank
  const onesPairUse = new Map(); // vary ones-digit combinations
  const sumUse = new Map();      // avoid many questions sharing one sum

  function pairKey(A, B) { return Math.min(A, B) + '+' + Math.max(A, B); }

  function acceptable(A, B) {
    if (A < 101 || A > 898 || B < 101 || B > 898) return false;
    if (A === B) return false;
    if (A % 100 === 0 || B % 100 === 0) return false;            // no round hundreds
    if (A % 10 === 0 && B % 10 === 0) return false;              // not both round tens
    const S = A + B;
    if (S > 1497) return false;                                  // grade ceiling
    if (usedPairs.has(pairKey(A, B))) return false;
    if ((operandUse.get(A) || 0) >= 2 || (operandUse.get(B) || 0) >= 2) return false;
    const ok = Math.min(A % 10, B % 10) + '/' + Math.max(A % 10, B % 10);
    if ((onesPairUse.get(ok) || 0) >= 5) return false;
    if ((sumUse.get(S) || 0) >= 3) return false;
    return true;
  }

  function register(A, B) {
    usedPairs.add(pairKey(A, B));
    operandUse.set(A, (operandUse.get(A) || 0) + 1);
    operandUse.set(B, (operandUse.get(B) || 0) + 1);
    const ok = Math.min(A % 10, B % 10) + '/' + Math.max(A % 10, B % 10);
    onesPairUse.set(ok, (onesPairUse.get(ok) || 0) + 1);
    sumUse.set(A + B, (sumUse.get(A + B) || 0) + 1);
  }

  const out = [];
  for (const bucket of BUCKETS) {
    const anchors = ANCHORS[bucket.key] || [];
    for (const [A, B] of anchors) {
      const p = carryProfile(A, B);
      if (!bucket.fits(A, B, p, A + B)) throw new Error('anchor ' + A + '+' + B + ' does not fit bucket ' + bucket.key);
      register(A, B);
      out.push({ A, B, tier: bucket.tier, bucket: bucket.key });
    }
    let need = bucket.count - anchors.length;
    let guard = 0;
    while (need > 0) {
      if (++guard > 200000) throw new Error('pair search exhausted for bucket ' + bucket.key);
      const A = 101 + Math.floor(rng() * 798);
      const B = 101 + Math.floor(rng() * 798);
      const p = carryProfile(A, B);
      if (!bucket.fits(A, B, p, A + B) || !acceptable(A, B)) continue;
      register(A, B);
      out.push({ A, B, tier: bucket.tier, bucket: bucket.key });
      need--;
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bank generation
// ─────────────────────────────────────────────────────────────────────────────

function generateBank(seed) {
  const rng = mulberry32(seed == null ? SEED : seed);
  const pairs = generatePairs(rng);
  const n = pairs.length;

  // Balanced stored position for the correct answer (runtime shuffles anyway).
  const positions = [];
  for (let i = 0; i < Math.ceil(n / 4); i++) positions.push(0, 1, 2, 3);
  positions.length = n;
  shuffleInPlace(positions, rng);

  // Rotate how many distractors sit ABOVE the true sum so the largest option
  // is not systematically correct (rank of correct answer varies).
  const aboveSeq = [];
  const aboveWeights = [[0, 32], [1, 38], [2, 27], [3, 11]];
  aboveWeights.forEach(([v, k]) => { for (let i = 0; i < k; i++) aboveSeq.push(v); });
  aboveSeq.length = n;
  shuffleInPlace(aboveSeq, rng);

  // Word-problem slots per tier (anchors stay bare computation).
  const WORD_QUOTA = { introductory: 2, developing: 5, proficient: 8, advanced: 3 };
  const wordQuota = Object.assign({}, WORD_QUOTA);
  const anchorKeys = new Set();
  Object.keys(ANCHORS).forEach((k) => ANCHORS[k].forEach(([A, B]) => anchorKeys.add(Math.min(A, B) + '+' + Math.max(A, B))));

  // A running per-word-problem ordinal indexes the template/name/item pools so
  // every template and name is used (rather than aliasing to a fixed few), and
  // a separate ordinal rotates the plain-computation hints.
  const styles = pairs.map((pr, i) => {
    const key = Math.min(pr.A, pr.B) + '+' + Math.max(pr.A, pr.B);
    if (anchorKeys.has(key)) return 'plain';
    // Deterministic spread: every 3rd eligible question in a tier becomes a
    // word problem until that tier's quota is used.
    if (wordQuota[pr.tier] > 0 && i % 3 === 2) { wordQuota[pr.tier]--; return 'word'; }
    return 'plain';
  });

  let wordSeq = 0;
  const bank = pairs.map((pr, i) => buildQuestion({
    A: pr.A, B: pr.B, style: styles[i],
    correctPos: positions[i], aboveTarget: aboveSeq[i],
    wordSeq: styles[i] === 'word' ? wordSeq++ : 0,
    hintSeq: i,
  }));

  return bank;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lesson-specific validation
// ─────────────────────────────────────────────────────────────────────────────

// Parse the two operands out of a stem. Returns null for non-computational
// prompts (counted separately by the audit).
function parseOperands(t) {
  const s = String(t || '');
  let m = s.match(/what is\s+(\d+)\s*\+\s*(\d+)\s*\?/i);
  if (m) return [Number(m[1]), Number(m[2])];
  const nums = s.match(/\d+/g);
  if (nums && nums.length === 2 && /(in all|altogether|in total)/i.test(s) && !/[−–\-]|take|left|fewer|gave|spent/i.test(s)) {
    return [Number(nums[0]), Number(nums[1])];
  }
  return null;
}

function correctIndexOf(q) {
  // The correct option is the untagged one; q.a must point at it.
  return typeof q.a === 'number' ? q.a : -1;
}

// Validate one question. Returns an array of issue objects {type, detail}.
function validateQuestion(q) {
  const issues = [];
  const push = (type, detail) => issues.push({ type, detail });
  const o = Array.isArray(q.o) ? q.o : [];
  const a = correctIndexOf(q);

  if (o.length !== 4) push('option_count', 'expected 4 options, found ' + o.length);
  if (a < 0 || a >= o.length) { push('missing_correct_answer', 'answer index ' + q.a + ' out of range'); return issues; }

  const vals = o.map((x) => String(x && x.val != null ? x.val : x));
  const valSet = new Set(vals.map((v) => v.trim()));
  if (valSet.size !== vals.length) push('duplicate_choices', vals.join(' | '));

  const untagged = o.filter((x) => !(x && x.tag));
  if (untagged.length === 0) push('missing_correct_answer', 'no untagged (correct) option');
  if (untagged.length > 1) push('multiple_correct_answers', untagged.length + ' untagged options');
  if (o[a] && o[a].tag) push('correct_option_tagged', 'correct option carries err tag ' + o[a].tag);

  const ops = parseOperands(q.t);
  if (!ops) { push('non_computational', String(q.t).slice(0, 60)); return issues; }
  const [A, B] = ops;
  const S = A + B;
  const p = carryProfile(A, B);

  if (!(A >= 100 && A <= 999 && B >= 100 && B <= 999)) push('operands_not_three_digit', A + ' + ' + B);

  const correctNum = parseNumber(vals[a]);
  if (correctNum == null) {
    // Options are not plain numbers (e.g. "which number sentence" prompts) —
    // not a full-calculation question, so arithmetic checks do not apply.
    push('non_computational', 'correct option "' + vals[a] + '" is not a number');
    return issues;
  }
  if (correctNum !== S) { push('incorrect_answer', 'key ' + vals[a] + ' but ' + A + ' + ' + B + ' = ' + S); return issues; }

  // Formatting: commas at 1,000+, none below.
  o.forEach((x, i) => {
    const v = String(x && x.val != null ? x.val : x);
    const num = parseNumber(v);
    if (num == null) { push('non_numeric_option', v); return; }
    if (num >= 1000 && formatNumber(num) !== v) push('formatting', 'option "' + v + '" should be "' + formatNumber(num) + '"');
    if (num < 1000 && v.indexOf(',') >= 0) push('formatting', 'option "' + v + '" has a comma below 1,000');
  });

  const distractorNums = o.filter((_, i) => i !== a).map((x) => parseNumber(x && x.val != null ? x.val : x)).filter((v) => v != null);

  // Shortcut leakage checks.
  if (!distractorNums.some((v) => v % 10 === S % 10)) push('ones_digit_leakage', 'only the correct answer ends in ' + (S % 10));
  if (!distractorNums.some((v) => String(v).length === String(S).length)) push('digit_length_leakage', 'only the correct answer has ' + String(S).length + ' digits');
  if (distractorNums.every((v) => Math.abs(v - S) > 150)) push('magnitude_leakage', 'all distractors more than 150 away from ' + S);
  if (S >= 1000 && distractorNums.filter((v) => v >= 1000).length === 0) push('digit_length_leakage', 'correct answer is the only four-digit option');

  // Misconception reproducibility: the labeled patternTag must regenerate the
  // value; any distractor no cataloged misconception can produce is weak.
  const candidates = misconceptionCandidates(A, B);
  const candidateVals = new Set(candidates.map((c) => c.value));
  o.forEach((x, i) => {
    if (i === a || !x || typeof x !== 'object') return;
    const v = parseNumber(x.val);
    if (v == null) return;
    if (!candidateVals.has(v)) push('weak_distractor', '"' + x.val + '" is not produced by any misconception model for ' + A + ' + ' + B);
    if (x.patternTag && MISCONCEPTION_BY_CODE[x.patternTag]) {
      const sim = simulateFault(A, B, MISCONCEPTION_BY_CODE[x.patternTag].fault);
      if (sim !== v) push('mislabeled_misconception', x.patternTag + ' produces ' + sim + ' for ' + A + ' + ' + B + ', not ' + x.val);
    }
  });

  // Explanation must match the exact arithmetic: every "x + y = z" and
  // "x + y + z = w" equation inside it must be true, and the formatted final
  // answer must appear.
  const expl = String(q.e || '');
  const eqRe = /(\d+)\s*\+\s*(\d+)(?:\s*\+\s*(\d+))?\s*=\s*([\d,]+)/g;
  let em;
  while ((em = eqRe.exec(expl)) !== null) {
    const lhs = Number(em[1]) + Number(em[2]) + (em[3] ? Number(em[3]) : 0);
    const rhs = Number(String(em[4]).replace(/,/g, ''));
    if (lhs !== rhs) push('explanation_mismatch', '"' + em[0] + '" is false');
  }
  if (expl.indexOf(formatNumber(S)) < 0) push('explanation_mismatch', 'explanation never states the answer ' + formatNumber(S));
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(expl)) push('explanation_emoji', 'explanation contains an emoji');

  // Difficulty must reflect the ACTUAL arithmetic load, matching difficultyFor:
  //   h  <=> sum >= 1,000     m  <=> sum < 1,000 and exactly 2 regroupings
  //   e  <=> sum < 1,000 and at most 1 regrouping
  if (q.d === 'e' && !(S < 1000 && p.count <= 1)) push('difficulty_mismatch', 'd=e but ' + p.count + ' regroupings, sum ' + S);
  if (q.d === 'm' && !(S < 1000 && p.count === 2)) push('difficulty_mismatch', 'd=m but ' + p.count + ' regroupings, sum ' + S);
  if (q.d === 'h' && !(S >= 1000)) push('difficulty_mismatch', 'd=h but sum ' + S + ' is below 1,000');

  if (q.lessonId !== 'u4l1') push('missing_lesson_id', 'lessonId "' + q.lessonId + '"');

  return issues;
}

// Validate the whole bank. Returns {stats, issues, flags, perQuestion}.
function validateBank(bank) {
  const issues = [];
  const perQuestion = [];
  const stats = {
    total: bank.length,
    computational: 0, nonComputational: 0, bothThreeDigit: 0,
    regroup0: 0, regroup1: 0, regroup2: 0, regroup3: 0,
    fourDigitSums: 0, wordProblems: 0,
    byD: { e: 0, m: 0, h: 0, other: 0 },
    correctPosition: [0, 0, 0, 0],
    correctIsLargest: 0, correctRank: [0, 0, 0, 0],
    issueCounts: {},
  };
  const pairKeys = new Map();
  const prompts = new Map();

  bank.forEach((q, i) => {
    const qIssues = validateQuestion(q);
    perQuestion.push(qIssues);
    qIssues.forEach((x) => {
      issues.push(Object.assign({ index: i, t: String(q.t).slice(0, 60) }, x));
      stats.issueCounts[x.type] = (stats.issueCounts[x.type] || 0) + 1;
    });

    if (q.d === 'e' || q.d === 'm' || q.d === 'h') stats.byD[q.d]++; else stats.byD.other++;
    if (typeof q.a === 'number' && q.a >= 0 && q.a < 4) stats.correctPosition[q.a]++;

    const pk = String(q.t).replace(/\s+/g, ' ').trim().toLowerCase();
    if (prompts.has(pk)) {
      issues.push({ index: i, t: String(q.t).slice(0, 60), type: 'duplicate_question', detail: 'same prompt as #' + prompts.get(pk) });
      stats.issueCounts.duplicate_question = (stats.issueCounts.duplicate_question || 0) + 1;
    } else prompts.set(pk, i);

    const ops = parseOperands(q.t);
    if (!ops) { stats.nonComputational++; return; }
    stats.computational++;
    const [A, B] = ops, S = A + B, p = carryProfile(A, B);
    if (A >= 100 && B >= 100 && A <= 999 && B <= 999) stats.bothThreeDigit++;
    stats['regroup' + Math.min(p.count, 3)]++;
    if (S >= 1000) stats.fourDigitSums++;
    if (!/^what is/i.test(String(q.t))) stats.wordProblems++;

    const key = Math.min(A, B) + '+' + Math.max(A, B);
    if (pairKeys.has(key)) {
      const other = pairKeys.get(key);
      const type = (other.A === B && other.B === A) ? 'reversed_operands' : 'duplicate_operands';
      issues.push({ index: i, t: String(q.t).slice(0, 60), type, detail: A + ' + ' + B + ' repeats #' + other.i });
      stats.issueCounts[type] = (stats.issueCounts[type] || 0) + 1;
    } else pairKeys.set(key, { i, A, B });

    // Rank of the correct answer among the options (1 = largest).
    const o = Array.isArray(q.o) ? q.o : [];
    const nums = o.map((x) => parseNumber(x && x.val != null ? x.val : x)).filter((v) => v != null);
    if (nums.length === 4 && typeof q.a === 'number' && o[q.a]) {
      const correct = parseNumber(o[q.a].val != null ? o[q.a].val : o[q.a]);
      const rank = nums.filter((v) => v > correct).length; // 0 = largest
      stats.correctRank[rank]++;
      if (rank === 0) stats.correctIsLargest++;
    }
  });

  const pct = (n) => stats.computational ? Math.round((n / stats.computational) * 1000) / 10 : 0;
  const multiRegroup = stats.regroup2 + stats.regroup3;
  stats.multiRegroupPct = pct(multiRegroup);
  stats.fourDigitPct = pct(stats.fourDigitSums);
  stats.noRegroupPct = pct(stats.regroup0);

  const flags = [];
  if (stats.multiRegroupPct < 70) flags.push('LESS_THAN_70PCT_MULTIPLE_REGROUPING (' + stats.multiRegroupPct + '%)');
  if (stats.fourDigitPct < 35) flags.push('LESS_THAN_35PCT_FOUR_DIGIT_SUMS (' + stats.fourDigitPct + '%)');
  if (stats.noRegroupPct > 15) flags.push('MORE_THAN_15PCT_NO_REGROUPING (' + stats.noRegroupPct + '%)');
  if (stats.issueCounts.reversed_operands) flags.push('REVERSED_OPERAND_PAIRS (' + stats.issueCounts.reversed_operands + ')');
  ['ones_digit_leakage', 'digit_length_leakage', 'magnitude_leakage', 'weak_distractor', 'mislabeled_misconception',
   'explanation_mismatch', 'incorrect_answer', 'duplicate_choices', 'missing_correct_answer', 'multiple_correct_answers',
   'duplicate_question', 'duplicate_operands', 'difficulty_mismatch'].forEach((k) => {
    if (stats.issueCounts[k]) flags.push(k.toUpperCase() + ' (' + stats.issueCounts[k] + ')');
  });
  const maxRank = Math.max.apply(null, stats.correctRank);
  if (stats.computational && maxRank / stats.computational > 0.45) {
    flags.push('CORRECT_ANSWER_RANK_IMBALANCE (one rank holds ' + Math.round((maxRank / stats.computational) * 100) + '%)');
  }

  return { stats, issues, flags, perQuestion };
}

module.exports = {
  SEED,
  digitsOf, carryProfile, formatNumber, parseNumber,
  simulateFault, MISCONCEPTIONS, MISCONCEPTION_BY_CODE, misconceptionCandidates,
  mulberry32, deriveDistractors, difficultyFor, buildExplanation, buildHint, buildPrompt, buildQuestion,
  generatePairs, generateBank,
  parseOperands, validateQuestion, validateBank,
};
