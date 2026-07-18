// ════════════════════════════════════════
//  QUIZ CONFIG — pure, Node-loadable
//
//  Single source of truth for configurable quiz lengths. Turns a stored
//  per-student setting ("default" | <positive int> | "all") into the actual
//  number of questions an attempt serves, and decides whether a unit quiz
//  keeps its NATIVE path (K quizBlueprint / G1 unitTest sampler / G2-3 default
//  25) or switches to the POOLED eligible-bank sampler.
//
//  Storage: per-student localStorage key `mmr_quiz_lengths_<sid>`, falling back
//  to `mmr_quiz_lengths_local` for guest/free/local mode. No DB / no cloud sync.
//
//  Pure functions — no DOM. load/save take an injected `storage` (defaults to
//  the global localStorage) so they are testable under Jest.
// ════════════════════════════════════════

var LESSON_QUIZ_DEFAULT = 8;
var UNIT_QUIZ_DEFAULT    = 25;

// Base difficulty ratios. Expressed as the native draw counts so the default
// length reproduces exactly today's mix, and any other length scales the same
// proportions:
//   lesson (8): 3 easy / 3 medium / 2 hard  = 37.5% / 37.5% / 25%
//   unit  (25): 8 easy / 10 medium / 7 hard = 32%   / 40%   / 28%
// Unit mastery checks keep their own ratio rather than borrowing the lesson mix.
var LESSON_DIFFICULTY_RATIO = { e: 3, m: 3, h: 2 };
var UNIT_DIFFICULTY_RATIO   = { e: 8, m: 10, h: 7 };

// Allocate `requested` questions across easy/medium/hard, scaling `ratio` to
// the requested size with a deterministic largest-remainder method, never
// exceeding what each tier has available, and redistributing any tier's
// shortfall to tiers that still have room.
//
//   requested : desired total (caller clamps to a sane count first)
//   available : { e, m, h } — questions on hand in each tier
//   ratio     : { e, m, h } — relative weights (defaults to the lesson mix)
//
// Guarantees:
//   - the returned counts sum to min(requested, e+m+h available)
//   - no tier is asked for more than it has
//   - the mix tracks `ratio`; leftover slots go to the largest fractional
//     remainders (ties broken e > m > h, matching the documented examples)
//   - fully deterministic and pure — no randomness, no globals
function allocateDifficulty(requested, available, ratio) {
  var avail = {
    e: _qcSize(available && available.e),
    m: _qcSize(available && available.m),
    h: _qcSize(available && available.h),
  };
  var availTotal = avail.e + avail.m + avail.h;
  var want = _qcSize(requested);
  var cap = Math.min(want, availTotal);
  if (cap <= 0) return { e: 0, m: 0, h: 0 };

  var r = ratio || LESSON_DIFFICULTY_RATIO;
  var rw = { e: Math.max(0, r.e || 0), m: Math.max(0, r.m || 0), h: Math.max(0, r.h || 0) };
  var rTotal = rw.e + rw.m + rw.h;
  if (rTotal <= 0) { rw = { e: 1, m: 1, h: 1 }; rTotal = 3; }

  var TIERS = ['e', 'm', 'h'];  // fixed order = e>m>h tie-break
  var exact = {}, draw = {}, frac = {};
  TIERS.forEach(function (t) {
    var ideal = cap * rw[t] / rTotal;
    var floored = Math.min(Math.floor(ideal), avail[t]);
    exact[t] = ideal;
    draw[t] = floored;
    frac[t] = ideal - Math.floor(ideal);
  });

  var assigned = draw.e + draw.m + draw.h;
  var remaining = cap - assigned;

  // Hand out leftover slots by largest fractional remainder, only to tiers with
  // spare capacity. Loop until placed or nobody can take more.
  while (remaining > 0) {
    var best = null;
    for (var i = 0; i < TIERS.length; i++) {
      var t = TIERS[i];
      if (draw[t] >= avail[t]) continue;            // tier is full
      if (best === null || frac[t] > frac[best]) best = t;  // strict > keeps e>m>h on ties
    }
    if (best === null) break;                        // no capacity anywhere
    draw[best]++;
    frac[best] = -1;                                 // spent this tier's remainder
    remaining--;
  }

  return { e: draw.e, m: draw.m, h: draw.h };
}

// Returns the value as a positive integer, or null if it isn't one.
// Accepts a number or a digits-only string ("15"); rejects 0, negatives,
// decimals ("10.5"), blanks, and non-numeric strings.
function _qcAsPosInt(v) {
  if (typeof v === 'number') {
    return (Number.isInteger(v) && v >= 1) ? v : null;
  }
  if (typeof v === 'string') {
    var t = v.trim();
    if (!/^\d+$/.test(t)) return null;
    var n = parseInt(t, 10);
    return n >= 1 ? n : null;
  }
  return null;
}

// True when a value is a valid custom count (positive integer). Used by the
// dashboard to gate the Save button on the Custom input.
function isValidCustom(v) {
  return _qcAsPosInt(v) !== null;
}

// Floor a bank/native/pooled size to a non-negative integer.
function _qcSize(v) {
  return (typeof v === 'number' && isFinite(v) && v > 0) ? Math.floor(v) : 0;
}

// Lesson quizzes always use the normal lesson sampler; only the count varies.
//   "default" / missing / invalid → min(8, bank)
//   <positive int>                → clamp(1..bank)
//   "all"                         → bank
// Never exceeds the bank; empty bank → 0 (caller hits the existing empty-state).
function resolveLessonCount(setting, bankSize) {
  var bank = _qcSize(bankSize);
  if (bank <= 0) return 0;
  if (setting === 'all') return bank;
  var n = _qcAsPosInt(setting);
  if (n != null) return Math.min(n, bank);
  return Math.min(LESSON_QUIZ_DEFAULT, bank);
}

// Unit quizzes preserve native behavior unless the parent explicitly chooses a
// length that differs from this unit's native size.
//   nativeSize = _unitQuizSize(u): K blueprint sum / G1 totalQuestions / G2-3 25
//   pooledSize = size of the eligible pool (testBank, else pooled lesson qBanks)
// Returns { mode: 'native'|'pooled', count }:
//   "default" / missing / invalid     → native, count = nativeSize
//   number === nativeSize             → native (does NOT bypass the blueprint)
//   "all"                             → pooled, count = pooledSize
//   number !== nativeSize             → pooled, count = clamp(1..pooledSize)
function resolveUnitDecision(setting, nativeSize, pooledSize) {
  var native = _qcSize(nativeSize);
  var pooled = _qcSize(pooledSize);
  if (setting === 'all') return { mode: 'pooled', count: pooled };
  var n = _qcAsPosInt(setting);
  if (n != null) {
    if (n === native) return { mode: 'native', count: native };
    return { mode: 'pooled', count: Math.min(n, pooled) };
  }
  return { mode: 'native', count: native };
}

// Per-student storage key. Guest/free/local mode (falsy sid or 'local') → local.
function quizLengthsKey(sid) {
  var id = (sid && typeof sid === 'string' && sid !== 'local') ? sid : 'local';
  return 'mmr_quiz_lengths_' + id;
}

// Normalize a stored/raw value to a valid setting: "all", a positive integer,
// or "default" (the catch-all for anything else).
function _qcNormValue(v) {
  if (v === 'all') return 'all';
  var n = _qcAsPosInt(v);
  if (n != null) return n;
  return 'default';
}

// The eligible question pool for a unit quiz. Mirrors the engine's idea of
// "all lesson-bank questions in this unit" (K-3). Prefers an existing testBank
// (G1/G2 already build it as the pooled lesson quizbanks); otherwise
// concatenates every lesson's qBank (or legacy `quiz`). Does NOT hand-author a
// separate bank — it only pools what already exists.
function unitEligibleBank(u) {
  if (!u) return [];
  if (Array.isArray(u.testBank) && u.testBank.length) return u.testBank;
  var out = [];
  var lessons = (u.lessons && u.lessons.length) ? u.lessons : [];
  for (var i = 0; i < lessons.length; i++) {
    var l = lessons[i] || {};
    var bank = l.qBank || l.quiz;
    if (Array.isArray(bank)) out = out.concat(bank);
  }
  return out;
}

function unitEligiblePoolSize(u) {
  return unitEligibleBank(u).length;
}

function _qcDefaultStorage() {
  try { return (typeof localStorage !== 'undefined') ? localStorage : null; }
  catch (_e) { return null; }
}

function loadQuizLengths(sid, storage) {
  var store = storage || _qcDefaultStorage();
  var fallback = { lesson: 'default', unit: 'default' };
  if (!store) return fallback;
  var raw;
  try { raw = store.getItem(quizLengthsKey(sid)); } catch (_e) { return fallback; }
  if (!raw) return fallback;
  var obj;
  try { obj = JSON.parse(raw); } catch (_e) { return fallback; }
  if (!obj || typeof obj !== 'object') return fallback;
  return { lesson: _qcNormValue(obj.lesson), unit: _qcNormValue(obj.unit) };
}

function saveQuizLengths(sid, cfg, storage) {
  var store = storage || _qcDefaultStorage();
  if (!store) return;
  var safe = {
    lesson: _qcNormValue(cfg && cfg.lesson),
    unit:   _qcNormValue(cfg && cfg.unit),
  };
  try { store.setItem(quizLengthsKey(sid), JSON.stringify(safe)); } catch (_e) {}
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LESSON_QUIZ_DEFAULT,
    UNIT_QUIZ_DEFAULT,
    LESSON_DIFFICULTY_RATIO,
    UNIT_DIFFICULTY_RATIO,
    allocateDifficulty,
    resolveLessonCount,
    resolveUnitDecision,
    isValidCustom,
    quizLengthsKey,
    loadQuizLengths,
    saveQuizLengths,
    unitEligibleBank,
    unitEligiblePoolSize,
  };
}
