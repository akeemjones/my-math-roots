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
