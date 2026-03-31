# Parent Controls — Full Dashboard Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every section of the `#parent-screen` from the learning app into the Parent Dashboard, backed by Supabase for remote access, while keeping a hidden local PIN escape hatch on the learning side.

**Architecture:** Supabase stores per-student settings (`unlock_settings`, `timer_settings`, `a11y_settings` JSONB on `student_profiles`) and parent PIN (`pin_hash` on `profiles`). The dashboard reads/writes via SECURITY DEFINER RPCs. The learning app fetches on auth and caches to localStorage. The parent screen is removed entirely from the learning app; PIN modals stay for the 600ms long-press escape hatch.

**Tech Stack:** Vanilla JS (ES5-compatible, matching existing codebase), Jest 29 for pure-function tests, Supabase (existing client `_supaDb` in `dashboard.js`, `_supa` in `auth.js`).

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| CREATE | `supabase/migrations/20260331_parent_controls.sql` | 4 columns + 8 RPCs |
| MODIFY | `dashboard/dashboard.js` | 8 new render sections + state + pure functions |
| MODIFY | `dashboard/dashboard.css` | Styles for all 8 new sections |
| MODIFY | `src/auth.js` | `_syncStudentSettings` + `_syncPinHash` on auth |
| MODIFY | `src/settings.js` | Update lock/timer/a11y reads; remove parent screen functions |
| MODIFY | `index.html` | Remove `#parent-screen`; remove parent controls button; add long-press handlers |
| MODIFY | `tests/dashboard.test.js` | Add tests for new pure functions |

---

## Task 1 — Supabase Migration File

**Files:**
- Create: `supabase/migrations/20260331_parent_controls.sql`

- [ ] Create the migration file with this exact content:

```sql
-- ══════════════════════════════════════════
--  Parent Controls — Full Dashboard Migration
--  2026-03-31
-- ══════════════════════════════════════════

-- 1. Per-student settings columns on student_profiles
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS unlock_settings JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS timer_settings  JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS a11y_settings   JSONB NOT NULL DEFAULT '{}';

-- 2. Parent-level PIN hash on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- ── Read RPCs (SECURITY DEFINER, anon + authenticated) ──────────────────

CREATE OR REPLACE FUNCTION get_unlock_settings(p_student_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(unlock_settings, '{}') FROM student_profiles WHERE id = p_student_id;
$$;
GRANT EXECUTE ON FUNCTION get_unlock_settings(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_unlock_settings(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION get_timer_settings(p_student_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(timer_settings, '{}') FROM student_profiles WHERE id = p_student_id;
$$;
GRANT EXECUTE ON FUNCTION get_timer_settings(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_timer_settings(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION get_a11y_settings(p_student_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(a11y_settings, '{}') FROM student_profiles WHERE id = p_student_id;
$$;
GRANT EXECUTE ON FUNCTION get_a11y_settings(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_a11y_settings(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION get_pin_hash(p_parent_id UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT pin_hash FROM profiles WHERE id = p_parent_id;
$$;
GRANT EXECUTE ON FUNCTION get_pin_hash(UUID) TO authenticated;

-- ── Write RPCs (authenticated only, ownership-checked) ──────────────────

CREATE OR REPLACE FUNCTION update_unlock_settings(p_student_id UUID, p_settings JSONB)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE student_profiles SET unlock_settings = p_settings, updated_at = now()
  WHERE id = p_student_id AND parent_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not_owner'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION update_unlock_settings(UUID, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION update_timer_settings(p_student_id UUID, p_settings JSONB)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE student_profiles SET timer_settings = p_settings, updated_at = now()
  WHERE id = p_student_id AND parent_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not_owner'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION update_timer_settings(UUID, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION update_a11y_settings(p_student_id UUID, p_settings JSONB)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE student_profiles SET a11y_settings = p_settings, updated_at = now()
  WHERE id = p_student_id AND parent_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not_owner'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION update_a11y_settings(UUID, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION update_pin_hash(p_hash TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE profiles SET pin_hash = p_hash WHERE id = auth.uid();
END; $$;
GRANT EXECUTE ON FUNCTION update_pin_hash(TEXT) TO authenticated;
```

- [ ] Apply the migration via Supabase MCP:
  ```
  mcp__799a913a-43cc-4d8a-b228-7aca5111f0bb__apply_migration
  name: "20260331_parent_controls"
  query: <content of the file above>
  ```
  Expected: migration applied successfully, no errors.

- [ ] `git add supabase/migrations/20260331_parent_controls.sql`
- [ ] `git commit -m "feat(db): add unlock/timer/a11y/pin_hash columns + 8 RPCs for parent controls dashboard"`

---

## Task 2 — Pure Functions + Tests

**Files:**
- Modify: `dashboard/dashboard.js` (add pure functions near top, after `_CATEGORY_LABELS`)
- Modify: `tests/dashboard.test.js` (add test suite)

These are pure, testable functions extracted from what the render sections will call.

- [ ] Open `tests/dashboard.test.js` and add these test suites after the existing `_computeReviewQueue` suite:

```javascript
// ── _parseUnlockSettings ──────────────────────────────────────────────────
describe('_parseUnlockSettings', () => {
  const { _parseUnlockSettings } = require('../dashboard/dashboard.js');

  test('returns defaults for empty object', () => {
    const r = _parseUnlockSettings({});
    expect(r.freeMode).toBe(false);
    expect(r.units).toEqual([]);
    expect(r.lessons).toEqual({});
  });

  test('returns defaults for null/undefined', () => {
    expect(_parseUnlockSettings(null).freeMode).toBe(false);
    expect(_parseUnlockSettings(undefined).units).toEqual([]);
  });

  test('parses freeMode, units, lessons from valid object', () => {
    const r = _parseUnlockSettings({ freeMode: true, units: [0,2], lessons: { '1_2': true } });
    expect(r.freeMode).toBe(true);
    expect(r.units).toEqual([0, 2]);
    expect(r.lessons['1_2']).toBe(true);
  });
});

// ── _parseTimerSettings ───────────────────────────────────────────────────
describe('_parseTimerSettings', () => {
  const { _parseTimerSettings } = require('../dashboard/dashboard.js');

  test('returns defaults for empty object', () => {
    const r = _parseTimerSettings({});
    expect(r.enabled).toBe(true);
    expect(r.lessonSecs).toBe(300);
    expect(r.unitSecs).toBe(600);
    expect(r.finalSecs).toBe(3600);
  });

  test('uses provided values when present', () => {
    const r = _parseTimerSettings({ enabled: false, lessonSecs: 120, unitSecs: 300, finalSecs: 1800 });
    expect(r.enabled).toBe(false);
    expect(r.lessonSecs).toBe(120);
    expect(r.unitSecs).toBe(300);
    expect(r.finalSecs).toBe(1800);
  });

  test('returns defaults for null/undefined', () => {
    expect(_parseTimerSettings(null).enabled).toBe(true);
  });
});

// ── _isUnitUnlockedInDraft ────────────────────────────────────────────────
describe('_isUnitUnlockedInDraft', () => {
  const { _isUnitUnlockedInDraft } = require('../dashboard/dashboard.js');

  test('returns true when freeMode is on', () => {
    expect(_isUnitUnlockedInDraft({ freeMode: true, units: [], lessons: {} }, 5)).toBe(true);
  });

  test('returns true when unitIdx is in units array', () => {
    expect(_isUnitUnlockedInDraft({ freeMode: false, units: [0, 2, 4], lessons: {} }, 2)).toBe(true);
  });

  test('returns false when unitIdx not in units array and freeMode off', () => {
    expect(_isUnitUnlockedInDraft({ freeMode: false, units: [0, 1], lessons: {} }, 3)).toBe(false);
  });
});

// ── _isLessonUnlockedInDraft ──────────────────────────────────────────────
describe('_isLessonUnlockedInDraft', () => {
  const { _isLessonUnlockedInDraft } = require('../dashboard/dashboard.js');

  test('returns true when freeMode is on', () => {
    expect(_isLessonUnlockedInDraft({ freeMode: true, units: [], lessons: {} }, 0, 3)).toBe(true);
  });

  test('returns true when lesson key exists in lessons', () => {
    expect(_isLessonUnlockedInDraft({ freeMode: false, units: [], lessons: { '2_1': true } }, 2, 1)).toBe(true);
  });

  test('returns false when lesson key absent', () => {
    expect(_isLessonUnlockedInDraft({ freeMode: false, units: [], lessons: {} }, 2, 1)).toBe(false);
  });
});
```

- [ ] Run: `npx jest tests/dashboard.test.js --verbose`
- [ ] Expected: **FAIL** — `_parseUnlockSettings is not a function` (module not exported yet)

- [ ] Now add these pure functions to `dashboard/dashboard.js` — insert them after the `getCategoryFromId` function and before `_computeOverallStats`:

```javascript
// ── Settings parsers (pure, testable) ────────────────────────────────────

function _parseUnlockSettings(raw) {
  if (!raw || typeof raw !== 'object') raw = {};
  return {
    freeMode: raw.freeMode === true,
    units:    Array.isArray(raw.units) ? raw.units.slice() : [],
    lessons:  (raw.lessons && typeof raw.lessons === 'object') ? Object.assign({}, raw.lessons) : {},
  };
}

function _parseTimerSettings(raw) {
  if (!raw || typeof raw !== 'object') raw = {};
  return {
    enabled:    raw.enabled !== false,
    lessonSecs: typeof raw.lessonSecs === 'number' ? raw.lessonSecs : 300,
    unitSecs:   typeof raw.unitSecs   === 'number' ? raw.unitSecs   : 600,
    finalSecs:  typeof raw.finalSecs  === 'number' ? raw.finalSecs  : 3600,
  };
}

function _parseA11ySettings(raw) {
  if (!raw || typeof raw !== 'object') raw = {};
  return {
    largeText:    raw.largeText    === true,
    highContrast: raw.highContrast === true,
  };
}

function _isUnitUnlockedInDraft(draft, unitIdx) {
  if (draft.freeMode) return true;
  return draft.units.indexOf(unitIdx) !== -1;
}

function _isLessonUnlockedInDraft(draft, unitIdx, lessonIdx) {
  if (draft.freeMode) return true;
  return !!draft.lessons[unitIdx + '_' + lessonIdx];
}
```

- [ ] Add to the Jest bridge at the bottom of `dashboard/dashboard.js`:

```javascript
if (typeof module !== 'undefined') {
  module.exports = {
    getCategoryFromId,
    _computeOverallStats,
    _computeSkillBreakdown,
    _computeWeakAreas,
    _computeActivityData,
    _computeReviewQueue,
    _parseUnlockSettings,
    _parseTimerSettings,
    _isUnitUnlockedInDraft,
    _isLessonUnlockedInDraft,
  };
}
```

- [ ] Run: `npx jest tests/dashboard.test.js --verbose`
- [ ] Expected: all tests PASS (27 existing + ~12 new = ~39 total), 0 failures

- [ ] `git add dashboard/dashboard.js tests/dashboard.test.js`
- [ ] `git commit -m "feat(dashboard): add settings parser pure functions + 12 new tests"`

---

## Task 3 — Dashboard State + Unit Metadata

**Files:**
- Modify: `dashboard/dashboard.js` (add state variables + `_UNITS_META` + load functions)

- [ ] Add this block to `dashboard/dashboard.js` immediately after the `var _supaDb = null;` line (around line 886):

```javascript
// ── Units metadata (for Access Controls lesson drawer) ────────────────────
var _UNITS_META = [
  { name: 'Basic Fact Strategies',    lessons: ['Count Up & Count Back','Doubles!','Make a 10','Number Families'] },
  { name: 'Place Value',              lessons: ['Big Numbers','Different Ways to Write Numbers','Bigger or Smaller?','Skip Counting'] },
  { name: 'Add & Subtract to 200',    lessons: ['Adding Bigger Numbers','Taking Away Bigger Numbers','Add Three Numbers','Math Stories'] },
  { name: 'Add & Subtract to 1,000',  lessons: ['Adding Really Big Numbers','Taking Away Really Big Numbers','Close Enough Counts!'] },
  { name: 'Money & Financial Literacy', lessons: ['All About Coins','Count Your Coins','Dollars and Cents','Save, Spend and Give'] },
  { name: 'Data Analysis',            lessons: ['Tally Marks','Bar Graphs','Picture Graphs','Line Plots'] },
  { name: 'Measurement & Time',       lessons: ['How Long Is It?','What Time Is It?','Hot, Cold and Full'] },
  { name: 'Fractions',                lessons: ['What is a Fraction?','Halves, Fourths and Eighths','Which Piece is Bigger?'] },
  { name: 'Geometry',                 lessons: ['Flat Shapes','Solid Shapes','Mirror Shapes'] },
  { name: 'Multiplication & Division', lessons: ['Equal Groups','Adding the Same Number','Sharing Equally'] },
];

// ── Parent controls draft state ───────────────────────────────────────────
var _unlockDraft      = _parseUnlockSettings({});
var _unlockDirty      = false;
var _activeDrawerUnit = -1;  // which unit's lesson drawer is open
var _timerDraft       = _parseTimerSettings({});
var _a11yDraft        = _parseA11ySettings({});
var _dbFbRating       = 0;
var _dbFbCategory     = '';

// ── Settings load functions ───────────────────────────────────────────────

async function _loadUnlockSettings(studentId) {
  if (!_supaDb || !studentId || studentId === 'local'
      || studentId === 'mock_1' || studentId === 'mock_2') {
    _unlockDraft = _parseUnlockSettings({});
    return;
  }
  try {
    var result = await _supaDb.rpc('get_unlock_settings', { p_student_id: studentId });
    _unlockDraft = _parseUnlockSettings(result.data || {});
  } catch(e) {
    _unlockDraft = _parseUnlockSettings({});
  }
  _unlockDirty = false;
}

async function _loadTimerSettings(studentId) {
  if (!_supaDb || !studentId || studentId === 'local'
      || studentId === 'mock_1' || studentId === 'mock_2') {
    _timerDraft = _parseTimerSettings({});
    return;
  }
  try {
    var result = await _supaDb.rpc('get_timer_settings', { p_student_id: studentId });
    _timerDraft = _parseTimerSettings(result.data || {});
  } catch(e) {
    _timerDraft = _parseTimerSettings({});
  }
}

async function _loadA11ySettings(studentId) {
  if (!_supaDb || !studentId || studentId === 'local'
      || studentId === 'mock_1' || studentId === 'mock_2') {
    _a11yDraft = _parseA11ySettings({});
    return;
  }
  try {
    var result = await _supaDb.rpc('get_a11y_settings', { p_student_id: studentId });
    _a11yDraft = _parseA11ySettings(result.data || {});
  } catch(e) {
    _a11yDraft = _parseA11ySettings({});
  }
}
```

- [ ] Update `switchStudent` function to also load settings for the new student:

Find the existing:
```javascript
function switchStudent(id) {
  _activeId = id;
  renderDashboard();
}
```

Replace with:
```javascript
function switchStudent(id) {
  if (_unlockDirty) {
    if (!confirm('You have unsaved unlock changes. Discard them?')) return;
  }
  _activeId    = id;
  _unlockDirty = false;
  _activeDrawerUnit = -1;
  Promise.all([
    _loadUnlockSettings(id),
    _loadTimerSettings(id),
    _loadA11ySettings(id),
  ]).then(function() { renderDashboard(); });
}
```

- [ ] `git add dashboard/dashboard.js`
- [ ] `git commit -m "feat(dashboard): add _UNITS_META, draft state, and settings load functions"`

---

## Task 4 — Dashboard Access Controls Section

**Files:**
- Modify: `dashboard/dashboard.js` (render + mutation functions)

- [ ] Add the following functions to `dashboard/dashboard.js` (before `renderDashboard`):

```javascript
// ── Access Controls — mutation helpers ───────────────────────────────────

function _dbToggleFreeMode() {
  _unlockDraft.freeMode = !_unlockDraft.freeMode;
  _unlockDirty = true;
  _reRenderUnlock();
}

function _dbToggleUnitUnlock(unitIdx) {
  var idx = _unlockDraft.units.indexOf(unitIdx);
  if (idx === -1) { _unlockDraft.units.push(unitIdx); }
  else { _unlockDraft.units.splice(idx, 1); }
  _unlockDirty = true;
  _reRenderUnlock();
}

function _dbToggleLessonUnlock(unitIdx, lessonIdx) {
  var key = unitIdx + '_' + lessonIdx;
  if (_unlockDraft.lessons[key]) { delete _unlockDraft.lessons[key]; }
  else { _unlockDraft.lessons[key] = true; }
  _unlockDirty = true;
  _reRenderUnlock();
}

function _dbToggleLessonDrawer(unitIdx) {
  _activeDrawerUnit = (_activeDrawerUnit === unitIdx) ? -1 : unitIdx;
  _reRenderUnlock();
}

function _reRenderUnlock() {
  var wrap = document.getElementById('db-unlock-wrap');
  if (wrap) wrap.innerHTML = _renderUnlockInner();
}

async function _dbSaveUnlock() {
  var btn  = document.getElementById('db-unlock-save-btn');
  var msg  = document.getElementById('db-unlock-msg');
  if (!_supaDb) { if (msg) msg.textContent = 'Not connected.'; return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  try {
    var result = await _supaDb.rpc('update_unlock_settings', {
      p_student_id: _activeId,
      p_settings:   _unlockDraft,
    });
    if (result.error) throw result.error;
    _unlockDirty = false;
    if (msg) { msg.style.color = '#2e7d32'; msg.textContent = '✅ Saved!'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) {
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '❌ Save failed — check connection.'; }
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
}

async function _dbRelockAll() {
  if (!confirm('Remove all unit and lesson unlocks for this student?')) return;
  _unlockDraft = _parseUnlockSettings({ freeMode: false, units: [], lessons: {} });
  _unlockDirty = false;
  _activeDrawerUnit = -1;
  if (!_supaDb) return;
  try {
    await _supaDb.rpc('update_unlock_settings', {
      p_student_id: _activeId,
      p_settings:   _unlockDraft,
    });
    var msg = document.getElementById('db-unlock-msg');
    if (msg) { msg.style.color = '#37474f'; msg.textContent = '🔒 All locks restored.'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) { /* silently ignore — draft was already reset */ }
  _reRenderUnlock();
}

async function _dbFullReset() {
  if (!confirm('DELETE all quiz scores, mastery data, and streak for this student? This cannot be undone.')) return;
  if (!_supaDb) return;
  var studentSupaId = _activeId;
  try {
    await Promise.all([
      _supaDb.from('quiz_scores').delete().eq('student_id', studentSupaId),
      _supaDb.from('user_mastery').delete().eq('student_id', studentSupaId),
    ]);
    var msg = document.getElementById('db-unlock-msg');
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '🗑 Student data cleared.'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 3000);
  } catch(e) {
    var msg = document.getElementById('db-unlock-msg');
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '❌ Reset failed.'; }
  }
}

// ── Access Controls — render ──────────────────────────────────────────────

function _renderUnlockInner() {
  var isMock = (_activeId === 'local' || _activeId === 'mock_1' || _activeId === 'mock_2');
  if (isMock) {
    return '<p class="db-empty">Unlock settings require a student profile connected to a parent account.</p>';
  }
  var fm = _unlockDraft.freeMode;
  var html = '';

  // Free Mode
  html += '<div class="db-toggle-row">'
    + '<div><strong>🌟 Free Mode</strong><br>'
    + '<span class="db-toggle-sub">Unlock all units and lessons at once</span></div>'
    + '<button class="db-toggle-btn' + (fm ? ' db-toggle-on' : '') + '" onclick="_dbToggleFreeMode()">'
    + (fm ? 'ON' : 'OFF') + '</button>'
    + '</div>';

  // Unit cards
  html += '<div class="db-unit-grid"' + (fm ? ' style="opacity:.5;pointer-events:none"' : '') + '>';
  _UNITS_META.forEach(function(u, i) {
    var unlocked = _isUnitUnlockedInDraft(_unlockDraft, i);
    html += '<div class="db-unit-card' + (unlocked ? ' db-unit-unlocked' : '') + '">'
      + '<div class="db-unit-card-top">'
      + '<span class="db-unit-num">Unit ' + (i+1) + '</span>'
      + '<button class="db-toggle-btn db-toggle-sm' + (unlocked ? ' db-toggle-on' : '') + '" onclick="_dbToggleUnitUnlock(' + i + ')">'
      + (unlocked ? 'ON' : 'OFF') + '</button>'
      + '</div>'
      + '<div class="db-unit-name">' + _esc(u.name) + '</div>'
      + '<button class="db-unit-lessons-link" onclick="_dbToggleLessonDrawer(' + i + ')">'
      + 'Manage lessons ' + (_activeDrawerUnit === i ? '▲' : '▼') + '</button>'
      + '</div>';

    // Lesson drawer — spans full row width, rendered after card
    if (_activeDrawerUnit === i) {
      html += '</div><div class="db-lesson-drawer">';
      u.lessons.forEach(function(lName, li) {
        var lu = _isLessonUnlockedInDraft(_unlockDraft, i, li);
        html += '<div class="db-lesson-row">'
          + '<span class="db-lesson-name">' + _esc(lName) + '</span>'
          + '<button class="db-toggle-btn db-toggle-sm' + (lu ? ' db-toggle-on' : '') + '" onclick="_dbToggleLessonUnlock(' + i + ',' + li + ')">'
          + (lu ? 'ON' : 'OFF') + '</button>'
          + '</div>';
      });
      html += '</div><div class="db-unit-grid" style="margin-top:0">';
    }
  });
  html += '</div>'; // close db-unit-grid

  // Save + Relock + Full Reset
  html += '<div id="db-unlock-msg" class="db-ctrl-msg"></div>'
    + '<div class="db-ctrl-btns">'
    + '<button id="db-unlock-save-btn" class="db-ctrl-save" onclick="_dbSaveUnlock()">Save Changes</button>'
    + '<button class="db-ctrl-relock" onclick="_dbRelockAll()">🔒 Re-lock All</button>'
    + '<button class="db-ctrl-reset" onclick="_dbFullReset()">🗑 Full Reset</button>'
    + '</div>';

  return html;
}

function _renderUnlockSection() {
  return '<section class="db-section" id="db-unlock-section">'
    + '<h2 class="db-sec-h">🔓 Access Controls</h2>'
    + '<div id="db-unlock-wrap">' + _renderUnlockInner() + '</div>'
    + '</section>';
}
```

- [ ] Add `_renderUnlockSection()` to `renderDashboard()` — append it at the end of `root.innerHTML`:

Find:
```javascript
    _renderReview(review) +
    _renderActivity(activity);
```

Replace with:
```javascript
    _renderReview(review) +
    _renderActivity(activity) +
    _renderUnlockSection() +
    _renderTimerSection() +
    _renderA11ySection() +
    _renderPinSection() +
    _renderRemindersSection() +
    _renderPasswordSection() +
    _renderFeedbackSection() +
    _renderChangelogSection();
```

> Note: `_renderTimerSection` through `_renderChangelogSection` are stubs added in Tasks 5–9. Add them as stubs now returning `''` so the page doesn't break:

```javascript
function _renderTimerSection()     { return ''; }
function _renderA11ySection()      { return ''; }
function _renderPinSection()       { return ''; }
function _renderRemindersSection() { return ''; }
function _renderPasswordSection()  { return ''; }
function _renderFeedbackSection()  { return ''; }
function _renderChangelogSection() { return ''; }
```

- [ ] Also update `initDashboard()` to load settings before first render. Find:

```javascript
function initDashboard() {
  if (!_checkAccess()) return;
  _students = getAllStudents();
  renderDashboard();
}
```

Replace with:
```javascript
function initDashboard() {
  if (!_checkAccess()) return;
  _students = getAllStudents();
  Promise.all([
    _loadUnlockSettings(_activeId),
    _loadTimerSettings(_activeId),
    _loadA11ySettings(_activeId),
  ]).then(function() { renderDashboard(); });
}
```

- [ ] `git add dashboard/dashboard.js`
- [ ] `git commit -m "feat(dashboard): add Access Controls section — unit cards, lesson drawer, relock, full reset"`

---

## Task 5 — Timer Settings Section

**Files:**
- Modify: `dashboard/dashboard.js`

- [ ] Replace the `_renderTimerSection` stub with this full implementation:

```javascript
async function _dbSaveTimer() {
  var msg = document.getElementById('db-timer-msg');
  if (!_supaDb) { if (msg) msg.textContent = 'Not connected.'; return; }
  try {
    var result = await _supaDb.rpc('update_timer_settings', {
      p_student_id: _activeId,
      p_settings:   _timerDraft,
    });
    if (result.error) throw result.error;
    if (msg) { msg.style.color = '#2e7d32'; msg.textContent = '✅ Saved!'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) {
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '❌ Save failed.'; }
  }
}

function _dbAdjustTimer(type, delta) {
  var key = type === 'final' ? 'finalSecs' : type === 'unit' ? 'unitSecs' : 'lessonSecs';
  var cur = _timerDraft[key];
  var maxV = type === 'final' ? 7200 : 7200;
  var newV;
  if (delta > 0) { newV = cur < 60 ? Math.min(60, cur + 1) : cur + 60; }
  else            { newV = cur <= 60 ? Math.max(1, cur - 1) : cur - 60; }
  _timerDraft[key] = Math.min(maxV, Math.max(1, newV));
  var el = document.getElementById('db-timer-' + type + '-val');
  if (el) el.textContent = _dbTimerLbl(_timerDraft[key]);
}

function _dbTimerLbl(s) {
  if (s < 60) return s + ' sec';
  var m = Math.floor(s / 60), r = s % 60;
  return r ? m + 'm ' + r + 's' : m + (m === 1 ? ' min' : ' mins');
}

function _dbToggleTimer() {
  _timerDraft.enabled = !_timerDraft.enabled;
  var el = document.getElementById('db-timer-toggle-btn');
  if (el) {
    el.textContent = _timerDraft.enabled ? 'ON' : 'OFF';
    el.className = 'db-toggle-btn' + (_timerDraft.enabled ? ' db-toggle-on' : '');
  }
  var controls = document.getElementById('db-timer-controls');
  if (controls) controls.style.display = _timerDraft.enabled ? '' : 'none';
}

function _renderTimerSection() {
  var isMock = (_activeId === 'local' || _activeId === 'mock_1' || _activeId === 'mock_2');
  var inner = isMock
    ? '<p class="db-empty">Timer settings require a connected student profile.</p>'
    : '<div class="db-toggle-row">'
        + '<div><strong>⏱ Quiz Timer</strong></div>'
        + '<button id="db-timer-toggle-btn" class="db-toggle-btn' + (_timerDraft.enabled ? ' db-toggle-on' : '') + '" onclick="_dbToggleTimer()">'
        + (_timerDraft.enabled ? 'ON' : 'OFF') + '</button>'
        + '</div>'
        + '<div id="db-timer-controls" style="' + (_timerDraft.enabled ? '' : 'display:none') + '">'
        + _timerRow('lesson', 'Lesson Quiz', _timerDraft.lessonSecs)
        + _timerRow('unit',   'Unit Quiz',   _timerDraft.unitSecs)
        + _timerRow('final',  'Final Test',  _timerDraft.finalSecs)
        + '</div>'
        + '<div id="db-timer-msg" class="db-ctrl-msg"></div>'
        + '<div class="db-ctrl-btns">'
        + '<button class="db-ctrl-save" onclick="_dbSaveTimer()">Save Timer Settings</button>'
        + '</div>';
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">⏱ Quiz Timer</h2>'
    + inner + '</section>';
}

function _timerRow(type, label, secs) {
  return '<div class="db-timer-row">'
    + '<span class="db-timer-lbl">' + label + '</span>'
    + '<div class="db-timer-adj">'
    + '<button class="db-adj-btn" onclick="_dbAdjustTimer(\'' + type + '\',-1)">−</button>'
    + '<span id="db-timer-' + type + '-val" class="db-timer-val">' + _dbTimerLbl(secs) + '</span>'
    + '<button class="db-adj-btn" onclick="_dbAdjustTimer(\'' + type + '\',1)">+</button>'
    + '</div></div>';
}
```

- [ ] `git add dashboard/dashboard.js`
- [ ] `git commit -m "feat(dashboard): add Timer Settings section"`

---

## Task 6 — Accessibility + Change PIN Sections

**Files:**
- Modify: `dashboard/dashboard.js`

- [ ] Replace the `_renderA11ySection` stub:

```javascript
async function _dbSaveA11y() {
  var msg = document.getElementById('db-a11y-msg');
  if (!_supaDb) { if (msg) msg.textContent = 'Not connected.'; return; }
  try {
    var result = await _supaDb.rpc('update_a11y_settings', {
      p_student_id: _activeId,
      p_settings:   _a11yDraft,
    });
    if (result.error) throw result.error;
    if (msg) { msg.style.color = '#2e7d32'; msg.textContent = '✅ Saved!'; }
    setTimeout(function() { if (msg) msg.textContent = ''; }, 2000);
  } catch(e) {
    if (msg) { msg.style.color = '#c62828'; msg.textContent = '❌ Save failed.'; }
  }
}

function _dbToggleA11y(key) {
  _a11yDraft[key] = !_a11yDraft[key];
  var btn = document.getElementById('db-a11y-' + key + '-btn');
  if (btn) {
    btn.textContent = _a11yDraft[key] ? 'ON' : 'OFF';
    btn.className = 'db-toggle-btn' + (_a11yDraft[key] ? ' db-toggle-on' : '');
  }
}

function _renderA11ySection() {
  var isMock = (_activeId === 'local' || _activeId === 'mock_1' || _activeId === 'mock_2');
  var inner = isMock
    ? '<p class="db-empty">Accessibility settings require a connected student profile.</p>'
    : '<div class="db-toggle-row">'
        + '<div><strong>Aa Large Text</strong><br><span class="db-toggle-sub">Increases font size for the student</span></div>'
        + '<button id="db-a11y-largeText-btn" class="db-toggle-btn' + (_a11yDraft.largeText ? ' db-toggle-on' : '') + '" onclick="_dbToggleA11y(\'largeText\')">'
        + (_a11yDraft.largeText ? 'ON' : 'OFF') + '</button>'
        + '</div>'
        + '<div class="db-toggle-row">'
        + '<div><strong>◑ High Contrast</strong><br><span class="db-toggle-sub">Increases color contrast for readability</span></div>'
        + '<button id="db-a11y-highContrast-btn" class="db-toggle-btn' + (_a11yDraft.highContrast ? ' db-toggle-on' : '') + '" onclick="_dbToggleA11y(\'highContrast\')">'
        + (_a11yDraft.highContrast ? 'ON' : 'OFF') + '</button>'
        + '</div>'
        + '<div id="db-a11y-msg" class="db-ctrl-msg"></div>'
        + '<div class="db-ctrl-btns"><button class="db-ctrl-save" onclick="_dbSaveA11y()">Save Accessibility</button></div>';
  return '<section class="db-section"><h2 class="db-sec-h">♿ Accessibility</h2>' + inner + '</section>';
}
```

- [ ] Replace the `_renderPinSection` stub. The dashboard PIN section uses PBKDF2 via WebCrypto (same algorithm as the existing `_savePin` in `src/settings.js`):

```javascript
async function _dbHashPin(pin) {
  var enc  = new TextEncoder();
  var key  = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  var salt = enc.encode('mymathroots_pin_v2');
  var bits = await crypto.subtle.deriveBits(
    { name:'PBKDF2', hash:'SHA-256', salt:salt, iterations:100000 }, key, 256
  );
  return Array.from(new Uint8Array(bits)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
}

async function _dbSavePin() {
  var inp1 = document.getElementById('db-pin-inp1');
  var inp2 = document.getElementById('db-pin-inp2');
  var msg  = document.getElementById('db-pin-msg');
  var newPin = inp1.value.trim();
  if (newPin.length < 4) { msg.style.color='#c62828'; msg.textContent='PIN must be at least 4 digits.'; return; }
  if (newPin !== inp2.value.trim()) { msg.style.color='#c62828'; msg.textContent='PINs do not match.'; return; }
  if (!_supaDb) { msg.textContent='Not connected.'; return; }
  msg.style.color='var(--txt2,#546e7a)'; msg.textContent='Saving…';
  try {
    var hash = await _dbHashPin(newPin);
    var result = await _supaDb.rpc('update_pin_hash', { p_hash: hash });
    if (result.error) throw result.error;
    inp1.value = ''; inp2.value = '';
    msg.style.color='#2e7d32'; msg.textContent='✅ PIN updated — takes effect on next device sync.';
    setTimeout(function(){ msg.textContent=''; }, 4000);
  } catch(e) {
    msg.style.color='#c62828'; msg.textContent='❌ Save failed — check connection.';
  }
}

function _renderPinSection() {
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">🔑 Change Parent PIN</h2>'
    + '<p class="db-sec-body">Your PIN is used as the local escape hatch on student devices. Changes sync to all devices on next sign-in.</p>'
    + '<div class="db-form-row"><label class="db-form-lbl">New PIN</label>'
    + '<input id="db-pin-inp1" type="password" inputmode="numeric" class="db-form-inp" placeholder="New PIN (min 4 digits)"></div>'
    + '<div class="db-form-row"><label class="db-form-lbl">Confirm PIN</label>'
    + '<input id="db-pin-inp2" type="password" inputmode="numeric" class="db-form-inp" placeholder="Repeat PIN"></div>'
    + '<div id="db-pin-msg" class="db-ctrl-msg"></div>'
    + '<div class="db-ctrl-btns"><button class="db-ctrl-save" onclick="_dbSavePin()">Update PIN</button></div>'
    + '</section>';
}
```

- [ ] `git add dashboard/dashboard.js`
- [ ] `git commit -m "feat(dashboard): add Accessibility and Change PIN sections"`

---

## Task 7 — Reminders + Change Password Sections

**Files:**
- Modify: `dashboard/dashboard.js`

- [ ] Replace the `_renderRemindersSection` stub:

```javascript
function _renderRemindersSection() {
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">🔔 Reminders</h2>'
    + '<p class="db-sec-body">Daily practice reminders for this device. Requires browser permission.</p>'
    + '<div class="db-toggle-row">'
    + '<div><strong>Push Notifications</strong><br><span class="db-toggle-sub">Applies to this device only</span></div>'
    + '<button id="db-push-btn" class="db-toggle-btn" onclick="_dbTogglePush()">Check…</button>'
    + '</div>'
    + '<div id="db-push-msg" class="db-ctrl-msg"></div>'
    + '</section>';
}

function _dbInitPushBtn() {
  var btn = document.getElementById('db-push-btn');
  if (!btn || !('PushManager' in window)) {
    if (btn) btn.textContent = 'Not supported';
    return;
  }
  Notification.requestPermission ? Notification.requestPermission().then(function(p) {
    btn.textContent = p === 'granted' ? 'ON' : 'OFF';
    if (p === 'granted') btn.classList.add('db-toggle-on');
  }) : null;
}

async function _dbTogglePush() {
  // Delegates to existing togglePushNotifications from the main app's push logic.
  // Dashboard re-implements a simple version: request permission → subscribe.
  var btn = document.getElementById('db-push-btn');
  var msg = document.getElementById('db-push-msg');
  if (!('Notification' in window)) {
    if (msg) msg.textContent = 'Push notifications not supported on this browser.';
    return;
  }
  var perm = await Notification.requestPermission();
  if (perm === 'granted') {
    if (btn) { btn.textContent = 'ON'; btn.classList.add('db-toggle-on'); }
    if (msg) { msg.style.color = '#2e7d32'; msg.textContent = '✅ Notifications enabled for this device.'; }
  } else {
    if (btn) { btn.textContent = 'OFF'; btn.classList.remove('db-toggle-on'); }
    if (msg) { msg.style.color = '#c62828'; msg.textContent = 'Permission denied — check browser settings.'; }
  }
  setTimeout(function() { if (msg) msg.textContent = ''; }, 3000);
}
```

- [ ] Replace the `_renderPasswordSection` stub:

```javascript
async function _dbSavePassword() {
  var inp = document.getElementById('db-pw-inp');
  var msg = document.getElementById('db-pw-msg');
  var pw  = inp.value;
  if (pw.length < 8) { msg.style.color='#c62828'; msg.textContent='Password must be at least 8 characters.'; return; }
  if (!_supaDb) { msg.textContent='Not connected.'; return; }
  msg.style.color='var(--txt2,#546e7a)'; msg.textContent='Saving…';
  var result = await _supaDb.auth.updateUser({ password: pw });
  if (result.error) { msg.style.color='#c62828'; msg.textContent='❌ ' + result.error.message; return; }
  inp.value = '';
  msg.style.color = '#2e7d32'; msg.textContent = '✅ Password changed!';
  setTimeout(function(){ msg.textContent=''; }, 2000);
}

function _renderPasswordSection() {
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">🔒 Change Password</h2>'
    + '<div class="db-form-row"><label class="db-form-lbl">New Password</label>'
    + '<input id="db-pw-inp" type="password" class="db-form-inp" placeholder="Min 8 characters" autocomplete="new-password"></div>'
    + '<div id="db-pw-msg" class="db-ctrl-msg"></div>'
    + '<div class="db-ctrl-btns"><button class="db-ctrl-save" onclick="_dbSavePassword()">Change Password</button></div>'
    + '</section>';
}
```

- [ ] `git add dashboard/dashboard.js`
- [ ] `git commit -m "feat(dashboard): add Reminders and Change Password sections"`

---

## Task 8 — Feedback + Changelog Sections

**Files:**
- Modify: `dashboard/dashboard.js`

- [ ] Replace the `_renderFeedbackSection` stub:

```javascript
function _dbSetFbRating(v) {
  if (v === _dbFbRating) v = 0;
  _dbFbRating = v;
  for (var i = 1; i <= 5; i++) {
    var s = document.getElementById('db-fb-star-' + i);
    if (s) { s.textContent = i <= v ? '★' : '☆'; s.style.color = i <= v ? '#f1c40f' : ''; }
  }
}

function _dbSetFbCat(cat) {
  if (cat === _dbFbCategory) { _dbFbCategory = ''; }
  else { _dbFbCategory = cat; }
  document.querySelectorAll('.db-fb-cat').forEach(function(b) {
    b.classList.toggle('active', b.dataset.cat === _dbFbCategory);
  });
}

async function _dbSubmitFeedback() {
  var msg = document.getElementById('db-fb-msg');
  if (!_dbFbRating) { msg.style.color='#c62828'; msg.textContent='Please select a star rating.'; return; }
  if (!_dbFbCategory) { msg.style.color='#c62828'; msg.textContent='Please select a category.'; return; }
  if (!_supaDb) { msg.textContent='Not connected.'; return; }
  var comment = (document.getElementById('db-fb-comment').value || '').slice(0, 500);
  msg.style.color='var(--txt2,#546e7a)'; msg.textContent='Sending…';
  try {
    var user = (await _supaDb.auth.getUser()).data.user;
    var result = await _supaDb.from('feedback').insert({
      rating: _dbFbRating, category: _dbFbCategory,
      comment: comment || null,
      user_id: user ? user.id : null,
    });
    if (result.error) throw result.error;
    _dbFbRating = 0; _dbFbCategory = '';
    document.getElementById('db-fb-comment').value = '';
    document.querySelectorAll('.db-fb-star').forEach(function(s){ s.textContent='☆'; s.style.color=''; });
    document.querySelectorAll('.db-fb-cat').forEach(function(b){ b.classList.remove('active'); });
    msg.style.color='#2e7d32'; msg.textContent='✅ Thank you for your feedback!';
    setTimeout(function(){ msg.textContent=''; }, 3000);
  } catch(e) {
    msg.style.color='#c62828'; msg.textContent='❌ Could not send — check connection.';
  }
}

function _renderFeedbackSection() {
  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += '<button id="db-fb-star-' + i + '" class="db-fb-star" onclick="_dbSetFbRating(' + i + ')">☆</button>';
  }
  var cats = ['General','Bug Report','Feature Request','Content Issue'];
  var catBtns = cats.map(function(c) {
    return '<button class="db-fb-cat" data-cat="' + _esc(c) + '" onclick="_dbSetFbCat(\'' + _esc(c) + '\')">' + _esc(c) + '</button>';
  }).join('');
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">💬 Send Feedback</h2>'
    + '<div class="db-fb-stars">' + stars + '</div>'
    + '<div class="db-fb-cats">' + catBtns + '</div>'
    + '<textarea id="db-fb-comment" class="db-fb-comment" maxlength="500" rows="3" placeholder="Comments (optional)"></textarea>'
    + '<div id="db-fb-msg" class="db-ctrl-msg"></div>'
    + '<div class="db-ctrl-btns"><button class="db-ctrl-save" onclick="_dbSubmitFeedback()">Send Feedback</button></div>'
    + '</section>';
}
```

- [ ] Replace the `_renderChangelogSection` stub. Copy the full changelog HTML from `index.html` lines 668–ending of the What's New section. Wrap it:

```javascript
function _renderChangelogSection() {
  return '<section class="db-section">'
    + '<h2 class="db-sec-h">📋 What\'s New</h2>'
    + '<div style="max-height:320px;overflow-y:auto" id="db-changelog">'
    + _changelogHtml()
    + '</div></section>';
}

function _changelogHtml() {
  // Copy the full content from index.html lines 674–end of What's New section
  // (the <div class="mb-14">...</div> blocks)
  // Paste verbatim here as a JS string — use _esc() is NOT needed since this is static trusted HTML
  return '<div class="mb-14"><div class="cl-version-brand">v5.33 — Current</div><ul class="list-body">'
    + '<li><strong>Parent Dashboard</strong> — All parent controls moved to the dashboard for remote management</li>'
    + '<li><strong>Balanced Final Test</strong> — New 50-question final test with guaranteed 5 questions per unit</li>'
    + '</ul></div>'
    + '<div class="mb-14"><div class="cl-version">v5.32</div><ul class="list-body">'
    + '<li><strong>Dark mode polish</strong> — Every popup and modal now uses the full frosted-glass dark look</li>'
    + '<li><strong>Faster repeat visits</strong> — JavaScript loaded as a separate cached file</li>'
    + '<li><strong>Security hardening</strong> — Service worker and third-party script improvements</li>'
    + '</ul></div>';
    // (Add remaining versions by copying from index.html — truncated here for brevity)
}
```

> **Implementer note:** Replace the `_changelogHtml()` body with the full content copied verbatim from `index.html` lines 674–end of the What's New `<div class="set-body">`. Each `<div class="mb-14">...</div>` block maps directly to a version entry. Keep as a raw string — no escaping needed.

- [ ] `git add dashboard/dashboard.js`
- [ ] `git commit -m "feat(dashboard): add Feedback and Changelog sections"`

---

## Task 9 — Dashboard CSS for New Sections

**Files:**
- Modify: `dashboard/dashboard.css`

- [ ] Append these styles to the end of `dashboard/dashboard.css`:

```css
/* ── Shared control styles ── */
.db-sec-body        { font-size:.85rem; color:#546e7a; margin-bottom:10px; }
.db-ctrl-msg        { font-size:.82rem; min-height:1.2rem; margin:6px 0; text-align:center; }
.db-ctrl-btns       { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
.db-ctrl-save       { flex:1; background:linear-gradient(135deg,#1565C0,#0d47a1); color:#fff; border:none;
                       border-radius:12px; padding:10px 16px; font-size:.9rem; font-weight:700; cursor:pointer;
                       box-shadow:0 3px 0 rgba(0,0,0,.15); min-width:120px; }
.db-ctrl-relock     { background:#e3f2fd; color:#1565C0; border:none; border-radius:12px;
                       padding:10px 14px; font-size:.85rem; font-weight:600; cursor:pointer; }
.db-ctrl-reset      { background:#fce4ec; color:#c62828; border:none; border-radius:12px;
                       padding:10px 14px; font-size:.85rem; font-weight:600; cursor:pointer; }

/* ── Toggle button ── */
.db-toggle-row      { display:flex; justify-content:space-between; align-items:center;
                       padding:10px 0; border-bottom:1px solid #f0f0f0; }
.db-toggle-row:last-of-type { border-bottom:none; }
.db-toggle-sub      { font-size:.75rem; color:#90a4ae; }
.db-toggle-btn      { background:#cfd8dc; color:#fff; border:none; border-radius:20px;
                       padding:6px 14px; font-size:.8rem; font-weight:700; cursor:pointer;
                       min-width:48px; transition:background .15s; }
.db-toggle-btn.db-toggle-on { background:#43a047; }
.db-toggle-sm       { padding:4px 10px; font-size:.72rem; }

/* ── Unit card grid ── */
.db-unit-grid       { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:10px 0; }
.db-unit-card       { background:#f5f5f5; border-radius:12px; padding:10px; border:2px solid transparent; }
.db-unit-card.db-unit-unlocked { background:#e8f5e9; border-color:#a5d6a7; }
.db-unit-card-top   { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
.db-unit-num        { font-size:.72rem; color:#90a4ae; font-weight:700; text-transform:uppercase; }
.db-unit-name       { font-size:.82rem; font-weight:600; color:#37474f; margin-bottom:6px; }
.db-unit-lessons-link { background:none; border:none; font-size:.75rem; color:#1565C0;
                         text-decoration:underline; cursor:pointer; padding:0; }

/* ── Lesson drawer ── */
.db-lesson-drawer   { grid-column:1 / -1; background:#fff; border:1px solid #e0e0e0;
                       border-radius:0 0 12px 12px; padding:8px 12px; margin-top:-4px; }
.db-lesson-row      { display:flex; justify-content:space-between; align-items:center;
                       padding:6px 0; border-bottom:1px solid #f5f5f5; }
.db-lesson-row:last-child { border-bottom:none; }
.db-lesson-name     { font-size:.82rem; color:#37474f; }

/* ── Timer section ── */
.db-timer-row       { display:flex; justify-content:space-between; align-items:center;
                       padding:8px 0; border-bottom:1px solid #f0f0f0; }
.db-timer-lbl       { font-size:.85rem; font-weight:600; color:#37474f; }
.db-timer-adj       { display:flex; align-items:center; gap:10px; }
.db-timer-val       { font-size:.9rem; font-weight:700; color:#1565C0; min-width:60px; text-align:center; }
.db-adj-btn         { background:#e3f2fd; color:#1565C0; border:none; border-radius:50%;
                       width:28px; height:28px; font-size:1rem; font-weight:700; cursor:pointer; }

/* ── Form inputs ── */
.db-form-row        { margin-bottom:10px; }
.db-form-lbl        { display:block; font-size:.78rem; color:#546e7a; margin-bottom:4px; font-weight:600; }
.db-form-inp        { width:100%; padding:10px 12px; border:1px solid #cfd8dc; border-radius:10px;
                       font-size:.9rem; background:#f8f9fa; color:#263238; box-sizing:border-box; }

/* ── Feedback ── */
.db-fb-stars        { display:flex; gap:6px; justify-content:center; margin-bottom:10px; }
.db-fb-star         { background:none; border:none; font-size:1.6rem; cursor:pointer; padding:0; }
.db-fb-cats         { display:flex; flex-wrap:wrap; gap:7px; justify-content:center; margin-bottom:10px; }
.db-fb-cat          { background:#f0f4f8; border:1px solid #cfd8dc; border-radius:20px;
                       padding:5px 12px; font-size:.78rem; cursor:pointer; color:#37474f; }
.db-fb-cat.active   { background:#e3f2fd; border-color:#1565C0; color:#1565C0; font-weight:700; }
.db-fb-comment      { width:100%; box-sizing:border-box; padding:10px 12px; border:1px solid #cfd8dc;
                       border-radius:10px; font-size:.85rem; resize:vertical; background:#f8f9fa; color:#263238; }

/* ── Changelog ── */
.mb-14              { margin-bottom:14px; }
.cl-version-brand   { font-weight:800; font-size:.82rem; color:#1565C0; margin-bottom:4px; }
.cl-version         { font-weight:700; font-size:.78rem; color:#546e7a; margin-bottom:4px; }
.list-body          { padding-left:16px; margin:0; }
.list-body li       { font-size:.78rem; color:#37474f; line-height:1.5; margin-bottom:4px; }
```

- [ ] `git add dashboard/dashboard.css`
- [ ] `git commit -m "style(dashboard): add CSS for all 8 parent control sections"`

---

## Task 10 — Learning App: Sync Functions

**Files:**
- Modify: `src/auth.js`

- [ ] Open `src/auth.js`. Find the function `_pullOnLogin` (or the `SIGNED_IN` auth event handler where `show('home')` is called).

- [ ] Add this function near the other `_pull*` functions in `src/auth.js`:

```javascript
async function _syncStudentSettings(studentId) {
  if (!_supa || !studentId || studentId === 'local') return;
  try {
    var results = await Promise.all([
      _supa.rpc('get_unlock_settings', { p_student_id: studentId }),
      _supa.rpc('get_timer_settings',  { p_student_id: studentId }),
      _supa.rpc('get_a11y_settings',   { p_student_id: studentId }),
    ]);
    if (results[0].data) localStorage.setItem('wb_unlock_' + studentId, JSON.stringify(results[0].data));
    if (results[1].data) localStorage.setItem('wb_timer_'  + studentId, JSON.stringify(results[1].data));
    if (results[2].data) localStorage.setItem('wb_a11y_'   + studentId, JSON.stringify(results[2].data));
  } catch(e) { /* offline — use cached values */ }
}

async function _syncPinHash() {
  if (!_supa || !_supaUser) return;
  try {
    var result = await _supa.rpc('get_pin_hash', { p_parent_id: _supaUser.id });
    if (result.data) localStorage.setItem('wb_parent_pin', result.data);
  } catch(e) { /* offline — keep existing local hash */ }
}
```

- [ ] Find where `_pullOnLogin()` is called (the `INITIAL_SESSION` branch) and add sync calls after it:

Find:
```javascript
      await _pullOnLogin();
      show('home');
```

Replace with:
```javascript
      await _pullOnLogin();
      var _syncSid = localStorage.getItem('mmr_active_student_id');
      _syncStudentSettings(_syncSid); // fire-and-forget
      _syncPinHash();                 // fire-and-forget
      show('home');
```

- [ ] Find the `SIGNED_IN` branch where `show('home'); buildHome();` is called:

Find:
```javascript
    show('home');
    buildHome();
    _installHistoryGuard();
```

Replace with:
```javascript
    var _syncSid2 = localStorage.getItem('mmr_active_student_id');
    _syncStudentSettings(_syncSid2); // fire-and-forget
    _syncPinHash();                  // fire-and-forget
    show('home');
    buildHome();
    _installHistoryGuard();
```

- [ ] `git add src/auth.js`
- [ ] `git commit -m "feat(auth): add _syncStudentSettings + _syncPinHash on sign-in"`

---

## Task 11 — Learning App: Update Lock + Timer + A11y Reads

**Files:**
- Modify: `src/settings.js`

### 11a — Add cache helper

- [ ] Find the existing constants in `src/settings.js` (around line 834, where `UNIT_UNLOCK_KEY` is defined). Add this helper function after the constants:

```javascript
function _studentIdForCache() {
  return localStorage.getItem('mmr_active_student_id') || 'local';
}

function _readUnlockCache() {
  var sid = _studentIdForCache();
  if (sid === 'local') return null;
  try {
    var raw = localStorage.getItem('wb_unlock_' + sid);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}
```

### 11b — Update `isUnitIndividuallyUnlocked` and `isLessonIndividuallyUnlocked`

- [ ] Find the existing functions (around line 839):

```javascript
function getUnitUnlocks(){ return safeLoadSigned(UNIT_UNLOCK_KEY, []); }
function saveUnitUnlocks(arr){ saveSigned(UNIT_UNLOCK_KEY, arr); }
function isUnitIndividuallyUnlocked(idx){ return getUnitUnlocks().includes(idx); }

function getLessonUnlocks(){ return safeLoadSigned(LESSON_UNLOCK_KEY, {}); }
function saveLessonUnlocks(obj){ saveSigned(LESSON_UNLOCK_KEY, obj); }
function isLessonIndividuallyUnlocked(unitIdx, lessonIdx){ return !!getLessonUnlocks()[unitIdx+'_'+lessonIdx]; }
```

Replace with:

```javascript
function getUnitUnlocks(){ return safeLoadSigned(UNIT_UNLOCK_KEY, []); }
function saveUnitUnlocks(arr){ saveSigned(UNIT_UNLOCK_KEY, arr); }
function getLessonUnlocks(){ return safeLoadSigned(LESSON_UNLOCK_KEY, {}); }
function saveLessonUnlocks(obj){ saveSigned(LESSON_UNLOCK_KEY, obj); }

function isUnitIndividuallyUnlocked(idx){
  var cache = _readUnlockCache();
  if (cache) {
    if (cache.freeMode === true) return true;
    return Array.isArray(cache.units) && cache.units.indexOf(idx) !== -1;
  }
  // One-time migration fallback
  return getUnitUnlocks().includes(idx);
}

function isLessonIndividuallyUnlocked(unitIdx, lessonIdx){
  var cache = _readUnlockCache();
  if (cache) {
    if (cache.freeMode === true) return true;
    return !!(cache.lessons && cache.lessons[unitIdx+'_'+lessonIdx]);
  }
  // One-time migration fallback
  return !!getLessonUnlocks()[unitIdx+'_'+lessonIdx];
}
```

### 11c — Update `checkUnitPinUnlock` and `checkLessonPinUnlock` to write new cache

- [ ] Find `checkUnitPinUnlock` (around line 1832). Inside it, find:

```javascript
  const unlocks = getUnitUnlocks();
  if(!unlocks.includes(_upmUnitIdx)){
    unlocks.push(_upmUnitIdx);
    saveUnitUnlocks(unlocks);
  }
```

Replace with:

```javascript
  // Write to new unlock cache (local 24h override)
  var _sid = _studentIdForCache();
  var _cacheKey = 'wb_unlock_' + _sid;
  var _cache = {};
  try { var _cr = localStorage.getItem(_cacheKey); if(_cr) _cache = JSON.parse(_cr); } catch(e){}
  if (!Array.isArray(_cache.units)) _cache.units = [];
  if (!_cache.units.includes(_upmUnitIdx)) _cache.units.push(_upmUnitIdx);
  _cache._localOverrideExpiry = Date.now() + 86400000; // 24h
  localStorage.setItem(_cacheKey, JSON.stringify(_cache));
  // Also write legacy key as fallback
  const unlocks = getUnitUnlocks();
  if(!unlocks.includes(_upmUnitIdx)){ unlocks.push(_upmUnitIdx); saveUnitUnlocks(unlocks); }
```

- [ ] Find `checkLessonPinUnlock` (around line 1780). Inside it, find:

```javascript
  const unlocks = getLessonUnlocks();
  unlocks[_lpmUnitIdx+'_'+_lpmLessonIdx] = true;
  saveLessonUnlocks(unlocks);
```

Replace with:

```javascript
  // Write to new unlock cache (local 24h override)
  var _sid2 = _studentIdForCache();
  var _cacheKey2 = 'wb_unlock_' + _sid2;
  var _cache2 = {};
  try { var _cr2 = localStorage.getItem(_cacheKey2); if(_cr2) _cache2 = JSON.parse(_cr2); } catch(e){}
  if (!_cache2.lessons) _cache2.lessons = {};
  _cache2.lessons[_lpmUnitIdx+'_'+_lpmLessonIdx] = true;
  _cache2._localOverrideExpiry = Date.now() + 86400000; // 24h
  localStorage.setItem(_cacheKey2, JSON.stringify(_cache2));
  // Also write legacy key as fallback
  const unlocks = getLessonUnlocks();
  unlocks[_lpmUnitIdx+'_'+_lpmLessonIdx] = true;
  saveLessonUnlocks(unlocks);
```

### 11d — Update timer reads to check new cache first

- [ ] Find the four existing timer functions in `src/settings.js` (lines ~814–831): `getLessonTimerSecs`, `getUnitTimerSecs`, `getFinalTimerSecs`, `isTimerEnabled`. Select the entire block from `function getLessonTimerSecs` through `function isTimerEnabled` and replace it all with:

```javascript
function _readTimerCache() {
  var sid = _studentIdForCache();
  if (sid === 'local') return null;
  try {
    var raw = localStorage.getItem('wb_timer_' + sid);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function getLessonTimerSecs(){
  var tc = _readTimerCache();
  if (tc && typeof tc.lessonSecs === 'number') return tc.lessonSecs;
  const v = localStorage.getItem(LESSON_TIMER_KEY);
  if(v) return parseInt(v);
  const old = localStorage.getItem('wb_lesson_timer_mins');
  return old ? parseInt(old)*60 : 300;
}

function getUnitTimerSecs(){
  var tc = _readTimerCache();
  if (tc && typeof tc.unitSecs === 'number') return tc.unitSecs;
  const v = localStorage.getItem(UNIT_TIMER_KEY);
  if(v) return parseInt(v);
  const old = localStorage.getItem('wb_unit_timer_mins');
  return old ? parseInt(old)*60 : 1800;
}

function getFinalTimerSecs(){
  var tc = _readTimerCache();
  if (tc && typeof tc.finalSecs === 'number') return tc.finalSecs;
  return parseInt(localStorage.getItem(FINAL_TIMER_KEY)||'3600');
}

function isTimerEnabled(){
  var tc = _readTimerCache();
  if (tc && typeof tc.enabled === 'boolean') return tc.enabled;
  return localStorage.getItem(TIMER_KEY) !== 'off';
}
```

> **Note:** Delete the existing `getUnitTimerSecs`, `getFinalTimerSecs`, and `isTimerEnabled` functions since they are replaced above.

- [ ] `git add src/settings.js`
- [ ] `git commit -m "feat(settings): update lock/timer reads to use Supabase-synced cache with legacy fallback"`

---

## Task 12 — Remove Parent Screen from Learning App

**Files:**
- Modify: `index.html`
- Modify: `src/settings.js`

### 12a — Remove `#parent-screen` from `index.html`

- [ ] In `index.html`, find and delete the entire `<div id="parent-screen" class="sc">` block — from line 526 (`<div id="parent-screen" class="sc">`) through its closing `</div>` (the one that closes the outer `sc` div for the parent screen).

- [ ] Find and delete the "Open Parent Controls" section in `#settings-screen` (around line 464):

```html
      <!-- Parent Controls — navigate to dedicated screen -->
      <div class="set-section">
        ...
        <button ... data-action="goParentControls">
          ... Open Parent Controls
        </button>
      </div>
```

Delete this entire `<div class="set-section">` block.

### 12b — Add long-press handler on locked unit cards in `index.html`

- [ ] Find the inline script block that handles events in `index.html`. Find where `openUnitPinUnlock` is defined or where the `_ACTIONS` map is defined. Add this long-press setup to the inline script:

```javascript
// Long-press (600ms) on locked unit/lesson cards reveals PIN escape hatch
(function(){
  var _lpt = null, _lpEl = null;
  document.addEventListener('pointerdown', function(e) {
    var card = e.target.closest('[data-locked-unit],[data-locked-lesson]');
    if (!card) return;
    _lpEl = card;
    _lpt = setTimeout(function() {
      _lpt = null;
      if (card.dataset.lockedUnit !== undefined) {
        openUnitPinUnlock(parseInt(card.dataset.lockedUnit));
      } else if (card.dataset.lockedLesson !== undefined) {
        var parts = card.dataset.lockedLesson.split('_');
        openLessonPinUnlock(parseInt(parts[0]), parseInt(parts[1]));
      }
    }, 600);
  });
  document.addEventListener('pointerup',     function(){ if(_lpt){ clearTimeout(_lpt); _lpt=null; } });
  document.addEventListener('pointermove',   function(){ if(_lpt){ clearTimeout(_lpt); _lpt=null; } });
  document.addEventListener('pointercancel', function(){ if(_lpt){ clearTimeout(_lpt); _lpt=null; } });
})();
```

- [ ] In `src/home.js`, find the locked unit card HTML (the `cs-lock-card` or the `.cs-pin-unlock-btn`). The existing `cs-pin-unlock-btn` button with `data-action="openUnitPinUnlock"` should be **removed** (this was the visible button). Replace it with a `data-locked-unit` attribute on the parent lock card so long-press targets it instead:

In `src/home.js`, find:
```javascript
        <button type="button" class="cs-pin-unlock-btn" data-action="openUnitPinUnlock" data-arg="${i}" title="Parent unlock"${_sr('aria-label="Parent unlock Unit '+(i+1)+'"')}>${_ICO.lock}</button>
```

Replace with:
```javascript
        <span class="cs-lock-hint" data-locked-unit="${i}">🔒</span>
```

Do this replacement in ALL occurrences in `src/home.js` (there are 2 instances — one in `buildHome`, one in `refreshHomeState`).

Similarly in `src/unit.js`, find the `lcard-pin-btn` lesson pin button:
```javascript
          <button type="button" class="lcard-pin-btn" onclick="event.stopPropagation();openLessonPinUnlock(${idx},${i})"
```

Replace with:
```javascript
          <span class="cs-lock-hint" data-locked-lesson="${idx}_${i}"
```
and close with `></span>` instead of the button's closing tag.

### 12c — Remove parent screen functions from `src/settings.js`

- [ ] Delete the `goParentControls` function and `_openFirstTimePinSetup` function from `src/settings.js` (around lines 1368–1397). Keep `_openParentAuth` — it is still used by other parts of the codebase.

- [ ] In `src/events.js`, find the `_ACTIONS` map entry `goParentControls` and delete that line.

- [ ] Run: `npx jest --verbose`
- [ ] Expected: all tests pass, 0 failures

- [ ] Run: `npm run build`
- [ ] Expected: build completes, `dist/` produced, no errors

- [ ] `git add src/settings.js src/auth.js src/home.js index.html`
- [ ] `git commit -m "feat: remove parent-screen from learning app; add long-press PIN escape hatch on locked cards"`

---

## Task 13 — Final Verification

### 13a — Tests
- [ ] Run: `npx jest --verbose`
- [ ] Expected: all tests pass (39+ tests)

### 13b — Build
- [ ] Run: `npm run build`
- [ ] Expected: `dist/` produced, `dist/dashboard/` present, no errors

### 13c — Smoke test: student flow
- [ ] Open `dist/index.html` in browser
- [ ] Sign in → home screen loads normally
- [ ] Settings screen: confirm "Open Parent Controls" button is gone
- [ ] No `#parent-screen` accessible at any URL in the learning app
- [ ] Long-press on a locked unit card for 600ms → PIN modal appears
- [ ] Correct PIN → unit unlocks, PIN modal closes

### 13d — Smoke test: parent dashboard flow
- [ ] Navigate to `/dashboard/dashboard.html`
- [ ] Sign in with parent account
- [ ] Scroll past analytics → Access Controls section visible
  - Unit cards show each of the 10 units with ON/OFF toggles
  - "Manage lessons →" expands inline drawer
  - Free Mode toggle dims all unit toggles
  - Save Changes → "✅ Saved!" toast
  - Re-lock All → confirmation → all units locked
- [ ] Timer Settings section: adjust lesson timer → Save → "✅ Saved!"
- [ ] Accessibility: toggle Large Text → Save → "✅ Saved!"
- [ ] Change PIN: enter new PIN + confirm → "✅ PIN updated"
- [ ] Reminders: push toggle works (or shows "Not supported" gracefully)
- [ ] Change Password: enter 8-char password → "✅ Password changed!"
- [ ] Feedback: select star + category + submit → "✅ Thank you!"
- [ ] What's New: changelog scrolls

### 13e — Cross-device sync test
- [ ] On dashboard: unlock Unit 3 for a student, Save
- [ ] Sign out of learning app and sign in again
- [ ] Open Unit 3 on the learning app → unit is accessible (loaded from Supabase cache)

### 13f — Final commit
- [ ] `git add -A`
- [ ] `git commit -m "feat: parent controls — full dashboard migration complete"`

---

## Notes for Implementer

- **`_studentIdForCache()`**: Returns `mmr_active_student_id` from localStorage. This is set in `src/auth.js` line 244 when a student profile is selected. For local-only users it will be `null` → function returns `'local'` → cache functions return `null` → fallback to legacy keys.

- **`_supaDb` vs `_supa`**: Dashboard uses `_supaDb`; learning app uses `_supa`. Don't mix them.

- **Timer defaults**: lessonSecs=300 (5min), unitSecs=600 (10min), finalSecs=3600 (1hr). These match existing app defaults.

- **Full Reset target tables**: `quiz_scores` and `user_mastery`. The `STREAK` is stored in `profiles.current_streak` — update `profiles SET current_streak=0, longest_streak=0` as part of full reset.

- **Changelog content**: Task 8 shows a stub. The implementer must copy the full `<div class="mb-14">` blocks from `index.html` lines 674–end of the What's New section into `_changelogHtml()` as a JS string. Add the v5.33 entry at the top noting the dashboard migration.

- **`lcard-pin-btn` in `src/unit.js`**: The lesson pin button in the unit screen is an `onclick=` attribute rather than `data-action`. It should be converted to a `data-locked-lesson` span as shown in Task 12b. Verify the exact surrounding HTML structure in `src/unit.js` before editing.
