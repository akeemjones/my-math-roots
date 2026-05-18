# Parent Dashboard — Grade-Scoped State

**Date:** 2026-05-18
**Status:** Design — pending user approval

## Problem

The Parent Dashboard currently conflates three concepts:

1. Student's enrolled grade (`profile.grade` in Supabase)
2. Student app's current grade (`localStorage.mmr_grade`)
3. Dashboard's view filter (does not exist — implicitly equals #2)

This causes three concrete bugs:

| Symptom | Cause |
|---|---|
| Free Mode unlocks all grades at once | Unlock settings shape is flat (no grade scoping) |
| Quiz history mixes attempts from every grade | Scores have no `grade` field; render uses `student.SCORES` unfiltered |
| Grade-switch in dashboard opens a profile-edit modal and changes the student's enrollment | "Change grade" link calls `openEditProfileSheet`, which updates `profile.grade` |

## Goal

Treat the dashboard's grade as a **view filter**. A parent can browse Grade 1 stats today and Grade 2 stats five seconds later without altering the student's profile or the student-app's current grade.

## Non-goals

- Multi-grade "all grades" view (explicitly out of scope)
- Cross-grade aggregates (averages, history, charts)
- Changing the student-app's grade switcher
- Modifying curriculum, question banks, or quiz logic

## Data shapes

### 1. Dashboard view grade

- **Key:** `localStorage['mmr_dash_view_grade_' + sid]`
- **Value:** `'k' | 'g1' | 'g2'` (lowercase grade-band token)
- **Per-student-id**, persisted across reloads
- Does **not** touch `profile.grade` or `mmr_grade`

### 2. Unlock settings — new shape (schema v2)

```js
{
  schemaVersion: 2,
  byGrade: {
    k:  { freeMode: false, units: [], lessons: {} },
    g1: { freeMode: false, units: [], lessons: {} },
    g2: { freeMode: false, units: [], lessons: {} }
  }
}
```

### 3. Quiz score record — new field

```js
{
  qid, label, type, score, total, pct, ...,
  grade: 'k' | 'g1' | 'g2'   // required on all NEW attempts going forward
}
```

Historical records (no `grade`) are inferred at read time (see Inference below).

## Backwards compatibility

### Unlock settings

| Input shape | Behavior |
|---|---|
| `{ schemaVersion:2, byGrade:{...} }` | Use as-is |
| `{ freeMode, units, lessons }` (legacy flat) | **Read-only fallback.** Reads still honor it. On first save in the new dashboard, it's discarded and replaced with the byGrade shape (the current view-grade's slot inherits the legacy values; other slots default off). |
| Empty / null | Default to empty byGrade with all three grades off |

### Quiz scores

| Input | Resolved grade |
|---|---|
| `score.grade === 'k' / 'g1' / 'g2'` | Use directly |
| No `grade` field, `qid` matches `^lq_g1` or `g1u\d_uq` | `g1` |
| No `grade` field, `qid` matches `^lq_(ku|k\d)` or `^ku\d_uq` | `k` |
| No `grade` field, `qid` matches `^lq_u\d` or `^u\d+_uq` (legacy G2 default) | `g2` |
| Otherwise | `legacy_unknown` — **excluded** from all grade-specific stats |

## Central helpers

All in `src/settings.js` (and mirrored where needed):

```js
// Maps any grade-ish input to canonical short token. Returns null if unknown.
function _gradeBand(v) {
  if (v == null) return null;
  var s = String(v).trim().toLowerCase();
  if (s === 'k' || s === 'kindergarten' || s === '0') return 'k';
  if (s === '1' || s === 'g1' || s === 'grade1' || s === 'grade 1') return 'g1';
  if (s === '2' || s === 'g2' || s === 'grade2' || s === 'grade 2') return 'g2';
  return null;
}

// Determine the grade band for a single score record. Returns 'k'|'g1'|'g2'|'legacy_unknown'.
function _inferScoreGrade(s) {
  if (!s) return 'legacy_unknown';
  if (s.grade) return _gradeBand(s.grade) || 'legacy_unknown';
  var probes = [s.qid, s.sourceLessonId, s.sourceUnitId].filter(Boolean);
  for (var i = 0; i < probes.length; i++) {
    var t = String(probes[i]).toLowerCase();
    if (/^(lq_)?g1/.test(t) || /^g1u\d/.test(t)) return 'g1';
    if (/^(lq_)?(ku|k\d)/.test(t) || /^ku\d/.test(t)) return 'k';
    if (/^(lq_)?u\d/.test(t) || /^u\d+_uq/.test(t)) return 'g2';
  }
  return 'legacy_unknown';
}
```

Dashboard-local in `src/dashboard.js` (and standalone copy):

```js
function _getDashboardViewGrade() {
  if (!_activeId || _activeId === 'local') return _gradeBand(localStorage.getItem('mmr_grade')) || 'g2';
  var saved = localStorage.getItem('mmr_dash_view_grade_' + _activeId);
  if (saved) return _gradeBand(saved) || 'g2';
  var profile = (_managedProfiles||[]).find(function(p){ return p.id === _activeId; });
  var fromProfile = _dbResolveProfileGrade(profile, _activeId);
  return _gradeBand(fromProfile) || 'g2';
}

function _setDashboardViewGrade(band) {
  var b = _gradeBand(band) || 'g2';
  if (_activeId && _activeId !== 'local') {
    try { localStorage.setItem('mmr_dash_view_grade_' + _activeId, b); } catch (_e) {}
  }
  renderDashboard();
}
```

## UI changes

### Replace "Change grade" link with dropdown

`src/dashboard.js:3783-3786` — the grade-context line under the student name:

**Before:**

```html
<p class="db-grade-context">
  Viewing <strong>Grade 2 results</strong> ·
  <button data-action="openEditProfileSheet" data-arg="<sid>">Change grade</button>
</p>
```

**After:**

```html
<div class="db-grade-context">
  <label for="db-view-grade-select">Viewing:</label>
  <select id="db-view-grade-select" class="db-view-grade-select" data-action="setDashboardViewGrade">
    <option value="k">Kindergarten</option>
    <option value="g1">Grade 1</option>
    <option value="g2">Grade 2</option>
  </select>
</div>
```

`change` events on `[data-action="setDashboardViewGrade"]` route to `_setDashboardViewGrade(e.target.value)`. The student's enrollment grade can still be edited via Profiles & Account → Edit Profile (existing flow, untouched).

## Dashboard rendering changes

In `renderDashboard()` (`src/dashboard.js:3704`):

1. Replace `var activeGrade = normalizeGrade(_dbResolveProfileGrade(...))` with:
   ```js
   var viewBand = _getDashboardViewGrade();             // 'k'|'g1'|'g2'
   var activeGrade = viewBand === 'k' ? 'K' : (viewBand === 'g1' ? '1' : '2');
   ```
2. **Remove** the `localStorage.setItem('mmr_grade', activeGrade)` mirror (don't leak into student app).
3. Filter `student.SCORES` by `_inferScoreGrade(s) === viewBand`. Exclude `legacy_unknown` from grade-specific stats.
4. Filter `student.ACTIVITY` similarly (existing logic, already uses `e.grade`).
5. Pass the filtered `scores` array to every downstream renderer (`_renderRecentQuizzes`, `_computeOverallStats`, `_computeWeakAreas`, mastery, charts, unit progress).

This single filter at the top of `renderDashboard` cascades to every grade-specific section because every downstream call already takes `scores` as an argument.

## Free Mode (grade-scoped)

In `src/dashboard.js`:

| Function | New behavior |
|---|---|
| `_parseUnlockSettings(raw)` | Returns `{schemaVersion:2, byGrade:{k,g1,g2}}`. Migrates legacy flat shape into current `viewBand` slot. |
| `_unlockDraft` | Holds the full byGrade object |
| `_dbToggleFreeMode()` | Toggles `_unlockDraft.byGrade[viewBand].freeMode` only |
| `_dbToggleUnitUnlock(idx)` | Toggles `_unlockDraft.byGrade[viewBand].units` only |
| `_dbToggleLessonUnlock(u,l)` | Toggles `_unlockDraft.byGrade[viewBand].lessons` only |
| `_dbSaveUnlock()` | Persists full `_unlockDraft` (byGrade) to Supabase + localStorage |
| `_dbRelockAll()` | Clears **only** `byGrade[viewBand]`, leaves the other grades' slots intact |
| `_renderUnlockInner()` | Renders only `byGrade[viewBand]`'s state |

Student-side reads in `src/settings.js`:

```js
function isUnitIndividuallyUnlocked(idx){
  var cache = _readUnlockCache();
  if (!cache) return getUnitUnlocks().includes(idx);
  var band = _gradeBand(localStorage.getItem('mmr_grade')) || 'g2';
  // New shape
  if (cache.byGrade) {
    var slot = cache.byGrade[band];
    if (!slot) return false;
    if (slot.freeMode === true) return true;
    return Array.isArray(slot.units) && slot.units.indexOf(idx) !== -1;
  }
  // Legacy flat shape — read-only fallback
  if (cache.freeMode === true) return true;
  return Array.isArray(cache.units) && cache.units.indexOf(idx) !== -1;
}
```

Same pattern for `isLessonIndividuallyUnlocked`.

## Quiz attempt grade tagging

In `src/quiz.js` around line 2213 (where `autoEntry` is built and `SCORES.unshift` is called), include:

```js
var autoEntry = {
  qid, score, total, pct, type, label, unitIdx, ...,
  grade: _gradeBand(localStorage.getItem('mmr_grade')) || null
};
```

Same change to any other point where score records are created locally.

For server-side push in `src/auth.js`, the per-record payload at ~line 1901 already includes a subset of fields; add `grade: s.grade || null`.

## Files changed

| File | Concern |
|---|---|
| `src/settings.js` | Add `_gradeBand`, `_inferScoreGrade`; update `isUnitIndividuallyUnlocked`/`isLessonIndividuallyUnlocked` for byGrade |
| `src/quiz.js` | Tag new score records with `grade` |
| `src/auth.js` | Pass `grade` field in score push payloads |
| `src/dashboard.js` | View-grade getter/setter; grade dropdown UI; filter scores in `renderDashboard`; byGrade-aware `_parseUnlockSettings`, `_unlockDraft`, toggle/save/relock |
| `dashboard/dashboard.js` | Mirror all of the above (standalone parent dashboard) |
| `tests/dashboard.test.js` | Tests for `_gradeBand`, `_inferScoreGrade`, byGrade parse/migrate, score filtering |

No curriculum, question-bank, K/G1/G2 content, or Unit Test sampling files are touched.

## Verification plan

1. `npm test` → all pass (new tests added).
2. `npm run build` → clean.
3. Preview: clear state, simulate signed-in parent + student with mixed-grade scores.
4. Dashboard view-grade dropdown updates view immediately.
5. Free Mode ON in Grade 1 view → Grade 1 unlocks in student app.
6. Switch student app to Grade 2 → Grade 2 still locked.
7. Switch dashboard to Grade 2 view → Free Mode state is independent.
8. Turn ON Grade 2 Free Mode → only Grade 2 unlocks; Grade 1 Free Mode unchanged.
9. Quiz history in Grade 1 view shows only `grade==='g1'` attempts.
10. Quiz history in Grade 2 view shows only `grade==='g2'` and inferred-g2 legacy attempts.
11. `legacy_unknown` attempts appear in NO grade view.
12. New score writes carry `grade` field.
13. Refresh page → dashboard view grade persists per active student.
14. Score-based unlock still works with Free Mode off (regression check).
15. No console errors throughout.
