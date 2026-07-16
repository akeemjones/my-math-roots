// ════════════════════════════════════════
//  APP CONFIG — central product configuration. Pure, Node-loadable.
//
//  Single source of truth for which product surfaces exist. The simplification
//  pivot disables major features CENTRALLY here instead of scattering
//  hardcoded conditions across the 24 concatenated src/ files.
//
//  This file is element 0 of SRC_FILES in build.js — it loads before every
//  consumer, including data/shared*.js and state.js (which derives its
//  localStorage keys at parse time). Nothing may be added above it.
//
//  BUILD MODE — the production/development boundary
//
//  build.js substitutes %%BUILD_MODE%% with 'dev' for `node build.js --dev` and
//  'prod' for a normal `node build.js`. That is the ONLY thing that authorizes
//  the dev flag overrides below, and it is baked into the artifact at build
//  time, so no client-controlled state (localStorage, query param, console) can
//  reach it. Fails closed: any value other than the literal 'dev' -- including
//  an unsubstituted placeholder, which is what Node sees when a test requires
//  this file straight from source -- is production.
//
//  RULES
//  1. Pure to require(). No DOM or localStorage access at parse time except the
//     single browser-only repair step at the bottom of this file, which is
//     guarded so `require()` from Jest stays clean. Every environment probe
//     lives inside a function behind a typeof guard.
//  2. Consumers call isFeatureOn('FLAG') — never read APP_CONFIG directly.
//     The accessor is where the legacy fallback and the dev override live.
//  3. Flags govern UI surfaces ONLY. A flag must never change what
//     _pushAll() sends to Supabase: mastery_json / streak / apptime_json are
//     wholesale last-write-wins server-side, so a client that stops computing
//     a synced field while still pushing would DESTROY that field for the
//     student. Hide the surface; keep the data pipeline byte-identical.
//
//  SIMPLIFIED_PRODUCT_MODE=false restores current-master behavior exactly via
//  _LEGACY_DEFAULTS. That is the escape hatch, and it is tested.
// ════════════════════════════════════════

// Substituted by build.js. 'dev' only for `node build.js --dev`.
var BUILD_MODE = '%%BUILD_MODE%%';

// Is this artifact an authorized development build? Fails closed.
function isDevBuild() {
  return BUILD_MODE === 'dev';
}

// ── Simplified product (the shipping configuration) ─────────────────────────
var APP_CONFIG = Object.freeze({
  // Master switch. false => every flag falls back to _LEGACY_DEFAULTS.
  SIMPLIFIED_PRODUCT_MODE: true,

  // Grades exposed to customers. K/1/2 are complete and validated; Grade 3 is
  // 8% built (89 of 97 lessons are empty shells); 4 and 5 do not exist.
  // Content state drives this list — see PIVOT_AUDIT.md sections 11-12.
  LAUNCH_GRADES: Object.freeze(['K', '1', '2']),

  // Limited Demo Mode replaces full guest mode (one grade, one unit).
  DEMO_MODE: true,

  // ── Disabled in the simplified product ──
  STREAK_CALENDAR: false,          // calendar modal, activity dot, month swipe
  ACTIVITY_REWARDS: false,         // milestone badges (the only reward mechanic)
  AI_PARENT_REPORT: false,         // Gemini report — sends child name off-site
  AI_HINTS: false,                 // never worked: _fetchAIHint is undefined
  PUSH_NOTIFICATIONS: false,       // real backend, no reachable UI
  REMINDERS: false,                // inert: writes wb_reminders, nothing reads it
  SOUND_CONTROLS: false,           // toggle exists, no audio system exists
  CUSTOM_QUIZ_LENGTHS: false,      // does not sync; breaks difficulty balancing
  QUIZ_TIMERS: false,              // see quiz.js elapsed-time note before enabling
  FINAL_TESTS: false,              // 50-Q test eagerly loads ~5.5MB
  HARD_PROGRESSION_LOCKS: false,   // replaced by Recommended/Ready/Review/Done
  ACCESS_CONTROL_GRIDS: false,     // parent per-unit/per-lesson unlock toggles
  INTERVENTION_OVERLAYS: false,    // replaced by inline targeted feedback
  LEGACY_DASHBOARD_SECTIONS: false // 9-section dashboard => 4 sections
});

// ── Legacy defaults: what master does TODAY ────────────────────────────────
// Fidelity matters more than aspiration here. AI_HINTS and PUSH_NOTIFICATIONS
// are false because those surfaces are unreachable on master (orphaned code),
// not because we disabled them.
var _LEGACY_DEFAULTS = Object.freeze({
  LAUNCH_GRADES: Object.freeze(['K', '1', '2', '3']),
  DEMO_MODE: false,                // master ships full guest mode
  STREAK_CALENDAR: true,
  ACTIVITY_REWARDS: true,
  AI_PARENT_REPORT: true,
  AI_HINTS: false,                 // orphaned on master: no caller exists
  PUSH_NOTIFICATIONS: false,       // orphaned on master: no UI renders it
  REMINDERS: true,                 // the inert toggle IS rendered on master
  SOUND_CONTROLS: true,
  CUSTOM_QUIZ_LENGTHS: true,
  QUIZ_TIMERS: true,
  FINAL_TESTS: true,
  HARD_PROGRESSION_LOCKS: true,
  ACCESS_CONTROL_GRIDS: true,
  INTERVENTION_OVERLAYS: true,
  LEGACY_DASHBOARD_SECTIONS: true
});

// Dev-only per-flag override. Returns true/false to force, or null when no
// override applies.
//
// Gated on the BUILD-TIME mode first, and only then on localhost. The build
// gate is the real boundary: a production artifact ignores these overrides
// wherever it runs, so a customer cannot unlock withdrawn content (e.g.
// unfinished Grade 3) by writing localStorage, and a production build proxied
// through a localhost hostname stays locked. The localhost check is a second,
// weaker convenience gate only -- it is not the security boundary, and UI
// hiding never is either: the write guards in switchGrade() and dbEditSave()
// enforce grade availability independently.
//
// Fails closed on every error path.
function _configDevOverride(name) {
  try {
    if (!isDevBuild()) return null;
    if (typeof location === 'undefined' || location.hostname !== 'localhost') return null;
    if (typeof localStorage === 'undefined' || !localStorage) return null;
    var v = localStorage.getItem('mmr_flag_' + name);
    if (v === '1') return true;
    if (v === '0') return false;
    return null;
  } catch (_e) {
    return null;
  }
}

// The only supported way to read a boolean product flag.
// Unknown flag names return false (fail closed).
function isFeatureOn(name) {
  var override = _configDevOverride(name);
  if (override !== null) return override;
  var source = APP_CONFIG.SIMPLIFIED_PRODUCT_MODE ? APP_CONFIG : _LEGACY_DEFAULTS;
  return source[name] === true;
}

// Normalizes any grade representation the app uses into a canonical launch
// token: 'K' | '1' | '2' | '3' | '4' | '5'. Returns null when unrecognized.
// Mirrors the accepted spellings in _gradeBand (dashboard.js) plus the raw
// values written to mmr_grade and student_profiles.grade.
function normalizeGradeToken(v) {
  if (v === null || v === undefined) return null;
  var s = String(v).trim().toLowerCase();
  if (s === 'k' || s === 'kindergarten' || s === '0') return 'K';
  var m = s.match(/^(?:g|grade)?\s*([1-5])$/);
  return m ? m[1] : null;
}

// Is this grade exposed to customers in the current configuration?
function isGradeLaunched(v) {
  var tok = normalizeGradeToken(v);
  if (!tok) return false;
  var override = _configDevOverride('GRADE_' + tok);
  if (override !== null) return override;
  var grades = APP_CONFIG.SIMPLIFIED_PRODUCT_MODE
    ? APP_CONFIG.LAUNCH_GRADES
    : _LEGACY_DEFAULTS.LAUNCH_GRADES;
  return grades.indexOf(tok) !== -1;
}

// The launch grade list for the current configuration (frozen).
function launchGrades() {
  return APP_CONFIG.SIMPLIFIED_PRODUCT_MODE
    ? APP_CONFIG.LAUNCH_GRADES
    : _LEGACY_DEFAULTS.LAUNCH_GRADES;
}

// The grade a student falls back to when their active grade is withdrawn.
var _FALLBACK_GRADE = '2';

// ── Active-grade repair ─────────────────────────────────────────────────────
//
// Moves the ACTIVE VIEW off a withdrawn grade. Needed because a production
// build does not ship the Grade 3 curriculum at all: leaving mmr_grade at '3'
// would leave the student pointed at content that is not in the bundle.
//
// What this does NOT do, and must never do:
//   - delete or rewrite any progress. wb_done5_3 / wb_sc5_3 / wb_mastery_3 /
//     mmr_mastery_v1_3 are untouched, and so is student_profiles.grade in
//     Supabase. Only the pointer moves; every byte of Grade 3 work survives and
//     comes back if the grade is ever relaunched.
//   - hide what happened. The previous grade is recorded in mmr_grade_prev, and
//     the parent dashboard shows an explicit notice (see
//     _dbUnsupportedGradeNotice) telling them the work is saved and asking them
//     to choose a supported grade.
//
// Runs at parse time from slot 0 of the bundle because state.js derives
// _ACTIVE_GRADE -- and every grade-namespaced storage key -- once, at parse
// time. Repairing after that point would leave Grade 2 content writing into
// Grade 3 progress keys, which would genuinely corrupt data.
//
// Pure: takes the storage, returns what it did, so it is directly testable.
function repairUnsupportedActiveGrade(storage) {
  var result = { repaired: false, from: null, to: null };
  try {
    if (!storage) return result;
    var active = storage.getItem('mmr_grade');
    if (!active) return result;                  // no grade set yet — nothing to repair
    if (isGradeLaunched(active)) return result;  // supported (or dev-enabled) — leave alone
    result.repaired = true;
    result.from = active;
    result.to = _FALLBACK_GRADE;
    storage.setItem('mmr_grade_prev', String(active));
    storage.setItem('mmr_grade', _FALLBACK_GRADE);
  } catch (_e) {
    return result;
  }
  return result;
}

// Node/Jest bridge — same pattern as quiz-config.js. Guarded so the browser
// bundle (no module object) is unaffected.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    APP_CONFIG,
    _LEGACY_DEFAULTS,
    BUILD_MODE,
    isDevBuild,
    isFeatureOn,
    isGradeLaunched,
    normalizeGradeToken,
    launchGrades,
    repairUnsupportedActiveGrade,
    _FALLBACK_GRADE,
  };
}

// Browser-only: repair before state.js parses. Guarded so `require()` from Node
// (where there is no localStorage) is a clean no-op and this file stays safe to
// import in tests.
if (typeof localStorage !== 'undefined') {
  (function _repairActiveGradeOnBoot() {
    var r = repairUnsupportedActiveGrade(localStorage);
    if (r.repaired && typeof console !== 'undefined') {
      console.warn('[grade] Grade ' + r.from + ' is not available in this build; '
        + 'active grade moved to ' + r.to + '. Grade ' + r.from
        + ' progress is preserved and untouched.');
    }
  })();
}
