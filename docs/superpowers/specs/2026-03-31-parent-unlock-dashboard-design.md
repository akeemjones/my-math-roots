# Parent Unlock Controls — Dashboard Migration Design

**Date:** 2026-03-31
**Status:** Approved

---

## Goal

Move parent unit/lesson unlock controls out of the learning app (`index.html`) and into the Parent Dashboard. Parents manage unlock state remotely via the dashboard (internet-connected). The learning app becomes read-only with respect to unlock state, staying clean for students.

---

## Architecture Overview

Three-layer system:

| Layer | Role |
|-------|------|
| **Supabase** | Source of truth — `unlock_settings JSONB` column on `student_profiles` |
| **Dashboard** (`dashboard.js`) | Writer — authenticated parent reads/writes via RPCs |
| **Learning app** (`index.html`) | Reader + cache — fetches on auth, caches to localStorage |

### Data Shape

```json
{
  "freeMode": false,
  "units": [0, 1, 2],
  "lessons": { "0_1": true, "0_2": true }
}
```

- `freeMode: true` overrides all locks globally
- `units`: array of unlocked unit indices (beyond normal sequential progression)
- `lessons`: object keyed `"{unitIdx}_{lessonIdx}"`, value `true`

### Unlock settings are per student profile

Each `student_profiles` row has its own `unlock_settings`. Switching the student selector in the dashboard loads that student's settings independently.

---

## Section 1 — Supabase Migration

**File:** `supabase/migrations/20260331_unlock_settings.sql`

### New column

```sql
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS unlock_settings JSONB NOT NULL DEFAULT '{}';
```

### Read RPC — `get_unlock_settings(student_id)`

- SECURITY DEFINER, callable by `anon` and `authenticated`
- Mirrors the existing `get_profiles_by_family_code` pattern
- Returns the JSONB blob for the given student ID

```sql
CREATE OR REPLACE FUNCTION get_unlock_settings(p_student_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(unlock_settings, '{}')
  FROM student_profiles
  WHERE id = p_student_id;
$$;

GRANT EXECUTE ON FUNCTION get_unlock_settings(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_unlock_settings(UUID) TO authenticated;
```

### Write RPC — `update_unlock_settings(student_id, settings)`

- Authenticated only
- Server-side ownership check: only the student's `parent_id` can write
- Raises `not_owner` if the caller does not own the profile

```sql
CREATE OR REPLACE FUNCTION update_unlock_settings(p_student_id UUID, p_settings JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE student_profiles
  SET unlock_settings = p_settings,
      updated_at = now()
  WHERE id = p_student_id
    AND parent_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_owner';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION update_unlock_settings(UUID, JSONB) TO authenticated;
```

---

## Section 2 — Dashboard Changes (`dashboard/dashboard.js` + `dashboard.css`)

### New section: "Unlock Settings"

Appended after existing analytics sections. Refreshes when the student selector changes.

### Layout: Unit Cards + Lesson Drawer

**Free Mode toggle** — pinned at top of section. When ON:
- All units/lessons treated as unlocked by the learning app
- Unit cards render but are visually dimmed with a "Free Mode active" badge
- Individual unit/lesson toggles disabled (greyed out)

**Unit grid** — 2-column card grid, one card per unit (10 units). Each card shows:
- Unit name and number
- Locked / Unlocked badge
- "Manage lessons →" link

**Lesson drawer** — tapping "Manage lessons →" expands an inline drawer below the card row listing that unit's lessons as toggle rows. No modal — in-page expansion.

**Save button** — single "Save Changes" button at the bottom of the section. Changes are batched in a `_unlockDraft` object. Nothing writes to Supabase until Save is tapped.

**Unsaved changes guard** — if the student selector changes with unsaved changes, a brief warning appears: "You have unsaved changes."

**Save flow:**
1. Call `supabase.rpc('update_unlock_settings', { p_student_id, p_settings: _unlockDraft })`
2. On success: commit draft, show "Saved ✓" toast
3. On error: show "Save failed — check connection" toast, keep draft

### New functions in `dashboard.js`

| Function | Purpose |
|----------|---------|
| `_loadUnlockSettings(studentId)` | Fetch from Supabase, populate `_unlockDraft` |
| `_renderUnlockSection()` | Returns HTML for the full unlock section |
| `_renderUnitCards()` | Returns HTML for the unit card grid |
| `_renderLessonDrawer(unitIdx)` | Returns HTML for the lesson drawer of a unit |
| `_saveUnlockSettings()` | Calls `update_unlock_settings` RPC, handles result |
| `_toggleUnitUnlock(unitIdx)` | Mutates `_unlockDraft.units` array |
| `_toggleLessonUnlock(unitIdx, lessonIdx)` | Mutates `_unlockDraft.lessons` object |
| `_toggleFreeMode()` | Mutates `_unlockDraft.freeMode` |

---

## Section 3 — Learning App Changes

### Cache key

`wb_unlock_{studentId}` — localStorage key storing the JSONB unlock settings for the active student. Written on sync, read on every lock check.

### Sync trigger

On auth state change (sign-in or student profile selection), the app calls `get_unlock_settings(studentId)` and writes the result to `wb_unlock_{studentId}`. Fire-and-forget — does not block app load. On failure (offline), the cached value is used silently.

### Lock check functions

`isUnitIndividuallyUnlocked(idx)` — updated to read from `wb_unlock_{studentId}`:
1. Parse cache; if `freeMode: true` → return `true`
2. Check `units` array contains `idx` → return result
3. If cache absent → return `false`

New `isLessonUnlocked(unitIdx, lessonIdx)` — same pattern, checks `lessons["{unitIdx}_{lessonIdx}"]`.

### One-time migration

On first load with the new code, if `wb_unlock_{studentId}` is absent but `wb_unit_unlocks` or `wb_lesson_unlocks` exist (old signed blobs):
1. Parse and import the old unlock state into the new JSONB format
2. Write to `wb_unlock_{studentId}`
3. Remove old keys `wb_unit_unlocks` and `wb_lesson_unlocks`

### Locked item UI

Locked units/lessons show:
- Lock icon
- Label: "Ask a parent to unlock this"
- No PIN prompt visible in normal flow

**Hidden PIN escape hatch:** A 600ms long-press on a locked unit/lesson card reveals the existing PIN entry modal. On correct PIN:
- Writes unlock state to `wb_unlock_{studentId}` local cache only (not Supabase)
- Grants a **24-hour local override** for that item
- Does not sync back to dashboard

### Removed from learning side

- Parent controls section removed from settings screen entirely (no pointer, no greyed entry)
- Parent settings gear/menu item removed from main navigation
- PIN modal no longer reachable from any menu or button — only via long-press on a locked item

---

## File Map

| Action | File | Change |
|--------|------|--------|
| CREATE | `supabase/migrations/20260331_unlock_settings.sql` | Column + 2 RPCs |
| MODIFY | `dashboard/dashboard.js` | New unlock section + 8 new functions |
| MODIFY | `dashboard/dashboard.css` | Unit card grid + lesson drawer styles |
| MODIFY | `src/settings.js` | Update `isUnitIndividuallyUnlocked`, add `isLessonUnlocked`, add sync call; remove parent controls section |
| MODIFY | `index.html` | Remove parent PIN modal from prominent flow; add long-press handler on locked cards |

---

## Edge Cases

| Scenario | Behavior |
|----------|---------|
| Student has no profile (local-only device) | `studentId = 'local'`; `get_unlock_settings` not called; lock checks fall back to old `wb_unit_unlocks` or return locked |
| Dashboard save fails mid-flight | Draft preserved; toast shown; user can retry |
| Student switches while draft unsaved | Warning shown; draft NOT discarded until user confirms |
| Free Mode ON + individual lesson locked | Free Mode wins — lesson accessible |
| Long-press PIN unlock + Supabase has it locked | Local 24h override wins until next sync |
| Next sync after local override | Supabase value overwrites local cache; local override lost |

---

## Out of Scope

- Syncing the local PIN override back to Supabase (PIN is intentionally local-only)
- Unlock history / audit log
- Time-based unlocks (e.g., "unlock Unit 3 on Monday")
- Teacher multi-class management (separate future feature)
