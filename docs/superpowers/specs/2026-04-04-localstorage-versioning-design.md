# Track 2B: localStorage Schema Versioning

**Date:** 2026-04-04
**Status:** Approved
**Prerequisite:** Track 1 (Security Hardening) — complete

## Problem

The app persists 15 stores to localStorage. Only one (`settings` via `prefs.ts`) has any schema versioning (`_v` field + `migrateSettings()`). The other 14 stores have no version tracking, no validation on read, and no migration path when their shape changes.

Additionally, the app has two competing migration systems:
1. `persisted()` factory — reads/writes localStorage, no versioning
2. `migrateLegacy()` in `boot.ts` — one-time vanilla-to-SvelteKit key migration (~120 lines)

These two systems interact by coincidence (legacy migration checks store values for "empty" signals) rather than by contract. This design is fragile and will silently corrupt data when store schemas evolve.

## Decision Record

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Migration timing | **Eager (on boot)** | Stores are interdependent. Lazy migration risks mid-session failures. `boot.ts` is the natural tollbooth. |
| Failure handling | **Reset to defaults** | Server is authoritative for authenticated/PIN users. Guest data is ephemeral by design. Backup keys add complexity with no practical recovery path. |
| Architecture | **Versioned `persisted()` factory** | Migration logic co-located with store definition. Single source of truth. No central registry to sync. |
| Storage format | **Universal Envelope** | All versioned stores use `{ _v: number, data: T }` regardless of whether T is object, array, or primitive. No mixed formats. |
| Legacy migration | **Absorb into `persisted()` via `legacyKey`** | Eliminates `migrateLegacy()` entirely. Single atomic pipeline. Old keys cleaned up on migration. |

## Design

### 1. `StoreSchema<T>` Interface

```typescript
interface StoreSchema<T> {
  version: number;
  migrate: (raw: any, fromVersion: number) => T;
  legacyKey?: string;
}
```

- `version`: Current schema version. Monotonically increasing integer starting at 1.
- `migrate(raw, fromVersion)`: Transforms data from `fromVersion` to current. Called when stored `_v < version`. Must handle `fromVersion: 0` (un-enveloped legacy data). Must be pure — no side effects beyond reading legacy keys in compound migrations (settings only).
- `legacyKey`: Optional. If the primary key is empty, `persisted()` checks this key for data from the vanilla app. If found, data is passed to `migrate(data, 0)` and the legacy key is deleted.

### 2. Updated `persisted()` Signature

```typescript
function persisted<T>(
  key: string,
  initialValue: T,
  schema?: StoreSchema<T>
): Writable<T>
```

Backward compatible: omitting `schema` preserves today's behavior exactly.

### 3. Universal Envelope Format

Every versioned store in localStorage is saved as:

```json
{ "_v": 1, "data": <T> }
```

This applies uniformly whether `T` is an object, array, primitive, or null.

### 4. `persisted()` Read Logic

```
persisted(key, initialValue, schema?)
  |
  +-- No schema? --> today's behavior (parse JSON or use default)
  |
  +-- Has schema:
      |
      +-- 1. Read `key` from localStorage, parse JSON
      |
      +-- 2. If found:
      |     +-- Has _v AND has data property --> envelope: version = _v, payload = data
      |     +-- Has _v but NO data property --> inline legacy (settings): version = _v, payload = raw (minus _v)
      |     +-- No _v at all --> version = 0, payload = raw value
      |
      +-- 3. If NOT found AND legacyKey is set:
      |     +-- Read legacyKey from localStorage
      |     +-- If found --> payload = parsed, version = 0, delete legacyKey
      |     +-- If not found --> use initialValue, done
      |
      +-- 4. If NOT found AND no legacyKey --> use initialValue, done
      |
      +-- 5. If version < schema.version:
      |     +-- migrated = schema.migrate(payload, version)
      |
      +-- 6. Write { _v: schema.version, data: migrated } back to key
      |
      +-- 7. Initialize writable store with migrated value
      |
      +-- ANY STEP THROWS:
            +-- console.warn('[persist] Migration failed for key, resetting')
            +-- Remove key from localStorage
            +-- Use initialValue
```

### 5. Store Inventory

#### Versioned Stores (get `StoreSchema`)

| Store | Key | Type | `_v` | `legacyKey` | v0->v1 Migration |
|-------|-----|------|------|-------------|------------------|
| `mastery` | `wb_mastery` | `MasteryMap` | 1 | - | Envelope wrap. Validate each entry has `attempts` (int >= 0), `correct` (int >= 0), `lastSeen` (number). Drop malformed entries. |
| `streak` | `wb_streak` | `StreakState` | 1 | - | Envelope wrap. Merge with `DEFAULT_STREAK` to fill missing fields (`current`, `longest`, `lastDate`). |
| `done` | `wb_done5` | `DoneMap` | 1 | - | Envelope wrap. Validate all values are booleans. Drop non-boolean entries. |
| `appTime` | `wb_apptime` | `AppTimeState` | 1 | - | Envelope wrap. Merge with `DEFAULT_APP_TIME`. Validate `totalSecs` >= 0, `sessions` >= 0. |
| `actDates` | `wb_act_dates` | `string[]` | 1 | - | Envelope wrap. Filter to valid ISO date strings (YYYY-MM-DD). Cap at 365 entries. |
| `scores` | `wb_sc5_v2` | `ScoreEntry[]` | 1 | `wb_sc5` | Envelope wrap. If legacy data is signed envelope `{d, s}`, unwrap `d`. Validate each entry has `qid` (string), `pct` (number 0-100), `score` (int >= 0), `total` (int > 0). Drop invalid entries. |
| `unlockSettings` | `wb_unlock_settings` | object | 1 | - | Envelope wrap. Merge with defaults (`freeMode: false, units: [], lessons: {}`). |
| `aiReports` | `wb_ai_report` | `Record<string, {lastDate, text}>` | 1 | - | Envelope wrap. Validate each value has `lastDate` (string) and `text` (string). Drop malformed entries. |
| `settings` | `wb_settings_v2` | `AppSettings` | 1 | - | **Compound migration.** If `fromVersion === 0`: read scattered legacy keys (`wb_theme`, `wb_sound`, `wb_lesson_timer_secs`, `wb_unit_timer_secs`, `wb_final_timer_secs`, `wb_settings_v1`, `wb_unit_unlocks`) from localStorage. Consolidate into `AppSettings`. Apply timer-defaults fix (0 -> 8/30/60). Delete all legacy keys. Merge with `DEFAULT_APP_SETTINGS`. If data has inline `_v` (from existing `prefs.ts` migration): treat as already at v1, envelope wrap only. |
| `a11y` | `wb_a11y` | `A11yPrefs` | 1 | - | Envelope wrap. Merge with `DEFAULT_A11Y_PREFS`. |
| `authUser` | `mmr_auth_user` | `AuthUser \| null` | 1 | - | Envelope wrap. Validate has `id` (non-empty string) and `email` (string), or is null. If invalid, return null. |
| `familyProfiles` | `mmr_family_profiles` | `StudentProfile[]` | 1 | - | Envelope wrap. Validate each entry has `id` (string) and `display_name` (string). Drop invalid entries. |
| `pinSession` | `mmr_pin_session` | `{studentId, token} \| null` | 1 | - | Envelope wrap. Validate has `studentId` (non-empty string) and `token` (non-empty string). If invalid, wipe and return null (forces re-login). |

#### Unversioned Stores (no schema, no change)

| Store | Key | Type | Rationale |
|-------|-----|------|-----------|
| `activeStudentId` | `mmr_active_student` | `string \| null` | Bare primitive. No schema to evolve. |
| `guestMode` | `mmr_guest_mode` | `boolean` | Bare primitive. No schema to evolve. |

### 6. `boot.ts` Changes

**Deleted:**
- `migrateLegacy()` function (~120 lines)
- `MIGRATION_FLAG` constant (`mmr_migrated_v6`)
- `if (browser) migrateLegacy()` call
- Imports: `scores`, `settings`, `get`, `ScoreEntry`, `AppSettings`

**Added:**
- `import '$lib/stores'` — barrel import ensures all store modules evaluate at boot, triggering eager migration in every `persisted()` constructor.

**Unchanged:**
- `booted` guard
- `unitsData.set(units)` (unit shell population)
- `loadUnit()` (lazy unit content loader)

**Why no explicit migration pass:** `persisted()` runs migration at module evaluation time (when the import resolves). By the time `boot()` executes, all stores have already read, migrated, and re-enveloped their data synchronously. The barrel import in `boot.ts` guarantees all modules evaluate before the UI renders.

### 7. `pinSession` Store Promotion

`mmr_pin_session` is currently read/written via raw `localStorage.getItem/setItem` in three files. It becomes a proper `persisted()` store in `user.ts`.

**Consumer changes:**

| File | Before | After |
|------|--------|-------|
| `auth.ts` (`verifyStudentPin`) | `localStorage.setItem('mmr_pin_session', JSON.stringify({...}))` | `pinSession.set({ studentId, token })` |
| `auth.ts` (`signOut`) | `'mmr_pin_session'` in `keysToRemove` array | Remove from array (store handles its own key). Call `pinSession.set(null)`. |
| `sync.ts` (`getPinSession`) | `localStorage.getItem('mmr_pin_session')` + JSON.parse | `get(pinSession)` — delete `getPinSession()` helper entirely |
| `sync.ts` (`handleSessionExpired`) | `localStorage.removeItem('mmr_pin_session')` | `pinSession.set(null)` |
| `+layout.svelte` (auth guard) | `localStorage.getItem('mmr_pin_session')` + JSON.parse + try/catch | `$pinSession` reactive read |

### 8. `prefs.ts` Simplification

**Deleted:**
- `persistedMigrated()` function (~28 lines) — was a one-off copy of `persisted()` with migration bolted on
- `migrateSettings()` function — logic absorbed into the `settings` schema's `migrate` function

**Changed:**
- `settings` declaration switches from `persistedMigrated('wb_settings_v2')` to `persisted<AppSettings>('wb_settings_v2', DEFAULT_APP_SETTINGS, settingsSchema)`
- `a11y` declaration adds schema parameter

## Files Changed

| File | Change | Lines |
|------|--------|-------|
| `app/src/lib/stores/persist.ts` | Add `StoreSchema<T>`, update `persisted()` with envelope/version/legacyKey | ~+60 |
| `app/src/lib/stores/progress.ts` | Add schemas to 7 stores | ~+70 |
| `app/src/lib/stores/quiz.ts` | Add schema to `scores` with `legacyKey: 'wb_sc5'` | ~+25 |
| `app/src/lib/stores/prefs.ts` | Delete `persistedMigrated()` + `migrateSettings()`. Add schemas to `settings` and `a11y`. | ~-28, +40 |
| `app/src/lib/stores/user.ts` | Add schemas to `authUser`, `familyProfiles`. Add `pinSession` store. | ~+35 |
| `app/src/lib/stores/index.ts` | Add `pinSession` to barrel export | ~+1 |
| `app/src/lib/boot.ts` | Delete `migrateLegacy()`. Add barrel import. | ~-120, +1 |
| `app/src/lib/services/auth.ts` | Replace raw localStorage with `pinSession` store | ~-10, +5 |
| `app/src/lib/services/sync.ts` | Replace `getPinSession()` with store import | ~-15, +5 |
| `app/src/routes/+layout.svelte` | Replace raw localStorage read with `$pinSession` | ~-8, +2 |

**Net:** ~-180 lines removed, ~+240 lines added. Net +60 lines, but replaces ~150 lines of ad-hoc migration/localStorage code with a systematic versioning framework.

## Verification Plan

1. **Fresh user** — No localStorage. Boot app. Confirm all versioned keys contain `{ _v: 1, data: <default> }`.
2. **Legacy vanilla user** — Populate `wb_sc5` (signed envelope `{d, s}`), `wb_theme`, `wb_sound`, `wb_*_timer_secs`, `wb_settings_v1`, `wb_unit_unlocks`. Boot app. Confirm `wb_sc5_v2` and `wb_settings_v2` contain migrated data in envelope format. Confirm all legacy keys are deleted.
3. **Current SvelteKit user** — Populate stores with un-enveloped data (current format). Boot app. Confirm data preserved and re-enveloped at `_v: 1`.
4. **Corrupted data** — Write `{{{garbage` to a store key. Boot app. Confirm store resets to default with console warning. No crash.
5. **PIN session validation** — Write `mmr_pin_session` with missing `token` field. Boot app. Confirm wipes to null (forces re-login).
6. **Build** — `cd app && npm run build` passes with zero TypeScript errors.

## Out of Scope

- **Track 2A: Dashboard decomposition** — separate spec
- **Track 2C: Quiz service decoupling** — separate spec
- **Track 2D: CSS cleanup** — backlog
- **Track 2E: DOM clone duplicate IDs** — backlog
