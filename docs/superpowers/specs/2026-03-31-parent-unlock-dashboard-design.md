# Parent Controls — Full Dashboard Migration Design

**Date:** 2026-03-31
**Status:** Approved (expanded scope 2026-03-31)

---

## Goal

Move **all** parent controls out of the learning app (`index.html / #parent-screen`) and into the Parent Dashboard. The learning app becomes fully student-facing — no parent controls visible anywhere in the UI. Parents manage everything remotely via the dashboard.

---

## Architecture Overview

Three-layer system:

| Layer | Role |
|-------|------|
| **Supabase** | Source of truth for per-student settings (unlock, timer, a11y) and parent-level settings (PIN hash) |
| **Dashboard** (`dashboard.js`) | Writer — authenticated parent reads/writes all settings via RPCs |
| **Learning app** (`index.html`) | Reader + cache — fetches on auth, caches to localStorage, reads cache at runtime |

### Per-student settings (stored on `student_profiles`)

```json
{
  "unlock_settings": { "freeMode": false, "units": [0,1,2], "lessons": { "0_1": true } },
  "timer_settings":  { "enabled": true, "lessonSecs": 300, "unitSecs": 600, "finalSecs": 3600 },
  "a11y_settings":   { "largeText": false, "highContrast": false }
}
```

Each is stored as a separate JSONB column on `student_profiles`. All sync via the same fire-and-forget pattern on auth.

### Parent-level settings (stored on `profiles`)

- `pin_hash TEXT` — PBKDF2 hash of parent PIN (replaces device-local `wb_parent_pin`). Allows parent to change PIN from dashboard and have it take effect on all devices.

### Push notifications

Push subscriptions are device-local — they cannot be enabled on the student's device from a remote dashboard. The Reminders toggle in the dashboard applies to the device currently viewing the dashboard. This is a UI-only move; the underlying push logic stays the same.

---

## What Moves to Dashboard

| Section (current parent-screen) | Dashboard section | Sync mechanism |
|----------------------------------|-------------------|----------------|
| Access Controls (unlock/relock/free mode) | Access Controls | `unlock_settings` JSONB on `student_profiles` |
| Quiz Timer | Timer Settings | `timer_settings` JSONB on `student_profiles` |
| Change Parent PIN | Change PIN | `pin_hash` on `profiles` via RPC |
| Reminders (push notifications) | Reminders | Device-local (same logic, moved to dashboard UI) |
| Change Password | Change Password | Existing Supabase `auth.updateUser` |
| Send Feedback | Feedback | No change to logic, moved to dashboard |
| What's New / Changelog | What's New | Static HTML, moved to dashboard |
| Progress Report button | Removed | Dashboard analytics already covers this |
| Accessibility | Accessibility | `a11y_settings` JSONB on `student_profiles` |

---

## Section 1 — Supabase Migration

**File:** `supabase/migrations/20260331_parent_controls.sql`

### New columns on `student_profiles`

```sql
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS unlock_settings JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS timer_settings  JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS a11y_settings   JSONB NOT NULL DEFAULT '{}';
```

### New column on `profiles`

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pin_hash TEXT;
```

### Read RPCs (SECURITY DEFINER, anon + authenticated)

```sql
-- Unlock settings
CREATE OR REPLACE FUNCTION get_unlock_settings(p_student_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(unlock_settings, '{}') FROM student_profiles WHERE id = p_student_id;
$$;
GRANT EXECUTE ON FUNCTION get_unlock_settings(UUID) TO anon, authenticated;

-- Timer settings
CREATE OR REPLACE FUNCTION get_timer_settings(p_student_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(timer_settings, '{}') FROM student_profiles WHERE id = p_student_id;
$$;
GRANT EXECUTE ON FUNCTION get_timer_settings(UUID) TO anon, authenticated;

-- A11y settings
CREATE OR REPLACE FUNCTION get_a11y_settings(p_student_id UUID)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(a11y_settings, '{}') FROM student_profiles WHERE id = p_student_id;
$$;
GRANT EXECUTE ON FUNCTION get_a11y_settings(UUID) TO anon, authenticated;

-- PIN hash (parent reads their own)
CREATE OR REPLACE FUNCTION get_pin_hash(p_parent_id UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT pin_hash FROM profiles WHERE id = p_parent_id;
$$;
GRANT EXECUTE ON FUNCTION get_pin_hash(UUID) TO authenticated;
```

### Write RPCs (authenticated only, ownership-checked)

```sql
-- Unlock settings
CREATE OR REPLACE FUNCTION update_unlock_settings(p_student_id UUID, p_settings JSONB)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE student_profiles SET unlock_settings = p_settings, updated_at = now()
  WHERE id = p_student_id AND parent_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not_owner'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION update_unlock_settings(UUID, JSONB) TO authenticated;

-- Timer settings
CREATE OR REPLACE FUNCTION update_timer_settings(p_student_id UUID, p_settings JSONB)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE student_profiles SET timer_settings = p_settings, updated_at = now()
  WHERE id = p_student_id AND parent_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not_owner'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION update_timer_settings(UUID, JSONB) TO authenticated;

-- A11y settings
CREATE OR REPLACE FUNCTION update_a11y_settings(p_student_id UUID, p_settings JSONB)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE student_profiles SET a11y_settings = p_settings, updated_at = now()
  WHERE id = p_student_id AND parent_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'not_owner'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION update_a11y_settings(UUID, JSONB) TO authenticated;

-- PIN hash (parent updates their own)
CREATE OR REPLACE FUNCTION update_pin_hash(p_hash TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE profiles SET pin_hash = p_hash WHERE id = auth.uid();
END; $$;
GRANT EXECUTE ON FUNCTION update_pin_hash(TEXT) TO authenticated;
```

---

## Section 2 — Dashboard Sections

All sections appended after existing analytics. Refreshes on student selector change (per-student sections only).

### 2a — Access Controls (per student)

Combined unlock + relock. Layout: Unit Cards + Lesson Drawer (approved design).

- **Free Mode toggle** — top of section. ON disables all other toggles (greyed out).
- **Unit card grid** — 2 columns, 10 cards. Each: unit name, locked/unlocked badge, "Manage lessons →" link.
- **Lesson drawer** — inline expansion below card row, toggle per lesson.
- **Re-lock All button** — red destructive button at bottom. Shows confirmation prompt before clearing all unit/lesson unlocks (sets `units: [], lessons: {}, freeMode: false`).
- **Full Reset button** — clears all progress (SCORES, MASTERY, STREAK) from Supabase for the student. Separate confirmation. Does not affect unlock settings.
- **Save Changes button** — batches all unlock mutations; writes via `update_unlock_settings` RPC.

### 2b — Timer Settings (per student)

- Toggle: Quiz Timer on/off (`enabled` field)
- Three duration pickers: Lesson Quiz, Unit Quiz, Final Test
- Uses drum-roll picker style matching existing app (or simpler +/- buttons — dashboard doesn't need the drum picker)
- Dashboard uses +/- buttons with typed-value fallback (simpler than drum picker)
- Auto-saves on change (no Save button needed — each change fires `update_timer_settings`)

### 2c — Accessibility (per student)

- Large Text toggle → `largeText` bool
- High Contrast toggle → `highContrast` bool
- Auto-saves on change via `update_a11y_settings`

### 2d — Change Parent PIN (parent account level)

- Two inputs: New PIN + Confirm PIN (min 4 digits)
- Hashes with PBKDF2 (100k iterations, same as existing `_savePin` function) in dashboard JS
- Submits hash via `update_pin_hash` RPC
- On success: shows "PIN updated ✓" — takes effect on all devices on next sync

### 2e — Reminders (device-local, dashboard device)

- Push notification toggle (on/off)
- Calls existing `togglePushNotifications` logic (moved to `dashboard.js`)
- Note in UI: "Reminders apply to this device"

### 2f — Change Password (parent account level)

- Password input + save button
- Calls `supabase.auth.updateUser({ password })` directly — same as existing `_pcChangePassword`

### 2g — Send Feedback (parent account level)

- Star rating (1–5), category chips, comment textarea, submit button
- Same `_submitFeedback` logic as existing (moved to `dashboard.js`)

### 2h — What's New / Changelog

- Static scrollable list of version entries
- Copied from `index.html` — no logic required

---

## Section 3 — Learning App Changes

### Cache keys (localStorage)

| Key | Content | Written by |
|-----|---------|-----------|
| `wb_unlock_{studentId}` | unlock_settings JSONB | Sync on auth |
| `wb_timer_{studentId}` | timer_settings JSONB | Sync on auth |
| `wb_a11y_{studentId}` | a11y_settings JSONB | Sync on auth |
| `wb_pin_synced` | `1` once PIN synced from Supabase | Sync on auth |

### Sync trigger

On auth / student profile selection, fire-and-forget batch:
```javascript
async function _syncStudentSettings(studentId) {
  if (!_supa || !studentId || studentId === 'local') return;
  const [unlock, timer, a11y] = await Promise.all([
    _supa.rpc('get_unlock_settings', { p_student_id: studentId }),
    _supa.rpc('get_timer_settings',  { p_student_id: studentId }),
    _supa.rpc('get_a11y_settings',   { p_student_id: studentId }),
  ]);
  if (unlock.data) localStorage.setItem('wb_unlock_' + studentId, JSON.stringify(unlock.data));
  if (timer.data)  localStorage.setItem('wb_timer_'  + studentId, JSON.stringify(timer.data));
  if (a11y.data)   localStorage.setItem('wb_a11y_'   + studentId, JSON.stringify(a11y.data));
}
```

Also sync PIN hash on parent auth:
```javascript
async function _syncPinHash() {
  if (!_supa || !_supaUser) return;
  const { data } = await _supa.rpc('get_pin_hash', { p_parent_id: _supaUser.id });
  if (data) localStorage.setItem('wb_parent_pin', data); // replaces local hash
}
```

### Lock check updates (`src/settings.js`)

`isUnitIndividuallyUnlocked(idx)` — reads `wb_unlock_{studentId}`:
1. Parse cache; if `freeMode: true` → return `true`
2. Check `units` array contains `idx`
3. Fallback: if cache absent, read old `wb_unit_unlocks` signed blob (one-time migration)

`isLessonIndividuallyUnlocked(unitIdx, lessonIdx)` — reads `wb_unlock_{studentId}`:
1. Parse cache; if `freeMode: true` → return `true`
2. Check `lessons["{unitIdx}_{lessonIdx}"]`
3. Fallback: old `wb_lesson_unlocks` signed blob

Timer reads updated to read from `wb_timer_{studentId}` first, fallback to existing localStorage keys.

A11y reads updated to read from `wb_a11y_{studentId}` first, fallback to existing keys.

### One-time migration

On first load, if new cache keys absent but old keys present:
- `wb_unit_unlocks` + `wb_lesson_unlocks` → import into `wb_unlock_{studentId}`, delete old keys
- `wb_timer_*` keys → import into `wb_timer_{studentId}`, delete old keys
- `wb_parent_pin` (PBKDF2 hash) → keep as-is (Supabase sync overwrites it after first dashboard login)

### Locked item UI

Locked units/lessons show lock icon + "Ask a parent to unlock this." Long-press (600ms) on a locked card reveals the PIN modal. On correct PIN, writes to `wb_unlock_{studentId}` local cache only (24-hour local override, not synced to Supabase).

### Removed from learning app

- `#parent-screen` div and all its contents — removed from `index.html`
- "Open Parent Controls" button in `#settings-screen` — removed
- `parent-auth-modal` dialog — **kept** (used by long-press PIN escape hatch)
- `unit-pin-modal` dialog — **kept** (used by long-press PIN escape hatch)
- `goParentControls()` function — removed from `src/settings.js`
- `_openParentAuth()` function — kept (used by long-press trigger)
- Parent controls entry in settings screen — removed entirely (no pointer left behind)

---

## File Map

| Action | File | Change |
|--------|------|--------|
| CREATE | `supabase/migrations/20260331_parent_controls.sql` | 3 columns + 8 RPCs |
| MODIFY | `dashboard/dashboard.js` | 8 new sections + supporting functions |
| MODIFY | `dashboard/dashboard.css` | Styles for all 8 new sections |
| MODIFY | `src/settings.js` | Update lock checks + sync + remove parent screen functions |
| MODIFY | `src/auth.js` | Add `_syncStudentSettings` + `_syncPinHash` calls on auth |
| MODIFY | `index.html` | Remove `#parent-screen` + parent controls button; add long-press handlers |

---

## Edge Cases

| Scenario | Behavior |
|----------|---------|
| Local-only student (no Supabase profile) | Skip Supabase sync; use old localStorage keys as-is |
| Dashboard save fails | Draft preserved; toast shown; retry available |
| Student selector switches with unsaved Access Controls | Warning shown; draft preserved until confirmed |
| Free Mode ON + individual lesson locked | Free Mode wins |
| Long-press PIN unlock | Writes local cache only; 24h override; lost on next Supabase sync |
| Parent changes PIN on dashboard | `pin_hash` updated in Supabase; syncs to device on next auth |
| Push notification toggle in dashboard | Applies to the device running the dashboard only |
| Full Reset confirmation | Clears SCORES/MASTERY/STREAK from Supabase for student; does not clear unlock settings |

---

## Out of Scope

- Syncing local PIN overrides back to Supabase
- Unlock history / audit log
- Time-based unlocks
- Teacher multi-class management
- Remote push notification management (enable notifications on student's device from parent device)
