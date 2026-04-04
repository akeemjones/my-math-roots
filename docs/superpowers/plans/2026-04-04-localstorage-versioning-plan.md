# localStorage Schema Versioning — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add schema versioning and migration to all localStorage-backed stores, using a universal envelope format and eager boot-time migration.

**Architecture:** Extend the existing `persisted()` factory with an optional `StoreSchema<T>` parameter. Versioned stores wrap data in `{ _v, data }` envelopes. On read, the factory detects the stored version, runs migrations if needed, and re-envelopes. Legacy vanilla-app key migration is absorbed into `persisted()` via `legacyKey`, eliminating `migrateLegacy()` from `boot.ts`. The `mmr_pin_session` raw localStorage key is promoted to a proper store.

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, localStorage

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `app/src/lib/stores/persist.ts` | Modify | `StoreSchema<T>` interface + versioned `persisted()` with envelope/migration/legacyKey |
| `app/src/lib/stores/progress.ts` | Modify | Add schemas to `mastery`, `streak`, `done`, `appTime`, `actDates`, `unlockSettings`, `aiReports` |
| `app/src/lib/stores/quiz.ts` | Modify | Add schema to `scores` with `legacyKey: 'wb_sc5'` |
| `app/src/lib/stores/prefs.ts` | Modify | Delete `persistedMigrated()` + `migrateSettings()`. Add schemas to `settings`, `a11y` |
| `app/src/lib/stores/user.ts` | Modify | Add schemas to `authUser`, `familyProfiles`. Add `pinSession` store |
| `app/src/lib/stores/index.ts` | Modify | Add `pinSession` to barrel export |
| `app/src/lib/boot.ts` | Modify | Delete `migrateLegacy()`. Add barrel import |
| `app/src/lib/services/auth.ts` | Modify | Replace raw `localStorage` with `pinSession` store |
| `app/src/lib/services/sync.ts` | Modify | Replace `getPinSession()` with `pinSession` store import |
| `app/src/routes/+layout.svelte` | Modify | Replace raw `localStorage.getItem('mmr_pin_session')` with `$pinSession` |

---

### Task 1: Versioned `persisted()` Factory

**Files:**
- Modify: `app/src/lib/stores/persist.ts`

- [ ] **Step 1: Add `StoreSchema<T>` interface and rewrite `persisted()`**

Replace the entire contents of `app/src/lib/stores/persist.ts` with:

```typescript
/**
 * persisted() — a writable store that automatically syncs to localStorage.
 *
 * Usage (unversioned — backward compatible):
 *   export const guestMode = persisted<boolean>('mmr_guest_mode', false);
 *
 * Usage (versioned — with schema migration):
 *   export const mastery = persisted<MasteryMap>('wb_mastery', {}, {
 *     version: 1,
 *     migrate: (raw, fromVersion) => { ... return cleaned; },
 *   });
 *
 * Versioned stores wrap data in a Universal Envelope: { _v: number, data: T }.
 * On read, the factory detects the stored version, runs migrations if stale,
 * and re-envelopes. If migration fails, the key is wiped and the store
 * initializes with the default value.
 */

import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { syncStatus } from './syncStatus.js';

/** Schema definition for a versioned persisted store. */
export interface StoreSchema<T> {
  /** Current schema version. Monotonically increasing integer starting at 1. */
  version: number;
  /**
   * Transform data from fromVersion to current version.
   * Called when stored _v < version. Must handle fromVersion 0 (un-enveloped legacy data).
   */
  migrate: (raw: any, fromVersion: number) => T;
  /** Optional legacy localStorage key. If the primary key is empty, this key is checked and deleted after import. */
  legacyKey?: string;
}

/** The envelope shape stored in localStorage for versioned stores. */
interface Envelope<T> {
  _v: number;
  data: T;
}

/** Type guard: is this object shaped like { _v, data }? */
function isEnvelope(obj: any): obj is Envelope<unknown> {
  return obj !== null && typeof obj === 'object' && '_v' in obj && 'data' in obj;
}

export function persisted<T>(key: string, initialValue: T, schema?: StoreSchema<T>): Writable<T> {
  let initial = initialValue;

  if (browser) {
    if (schema) {
      initial = readVersioned(key, initialValue, schema);
    } else {
      // Unversioned path — original behavior
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) initial = JSON.parse(raw) as T;
      } catch (e) {
        console.error('[persist] Corrupted key "' + key + '":', e);
        localStorage.removeItem(key);
      }
    }
  }

  const store = writable<T>(initial);

  if (browser) {
    store.subscribe((value) => {
      try {
        if (schema) {
          // Always write the envelope for versioned stores
          const envelope: Envelope<T> = { _v: schema.version, data: value };
          localStorage.setItem(key, JSON.stringify(envelope));
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (e) {
        console.warn('[persist] localStorage write failed (quota exceeded?):', e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          syncStatus.set('error');
        }
      }
    });
  }

  return store;
}

/**
 * Read and migrate a versioned store from localStorage.
 * Returns the migrated value, or initialValue if nothing found / migration fails.
 */
function readVersioned<T>(key: string, initialValue: T, schema: StoreSchema<T>): T {
  try {
    let payload: any = undefined;
    let version = 0;

    // Step 1: Try to read the primary key
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);

      if (isEnvelope(parsed)) {
        // Universal envelope: { _v, data }
        version = parsed._v;
        payload = parsed.data;
      } else if (parsed !== null && typeof parsed === 'object' && '_v' in parsed) {
        // Inline legacy (settings): has _v but no data property
        version = parsed._v;
        const { _v, ...rest } = parsed;
        payload = rest;
      } else {
        // Un-enveloped legacy data
        version = 0;
        payload = parsed;
      }
    } else if (schema.legacyKey) {
      // Step 2: Primary key empty — check legacy key
      const legacyRaw = localStorage.getItem(schema.legacyKey);
      if (legacyRaw !== null) {
        payload = JSON.parse(legacyRaw);
        version = 0;
        localStorage.removeItem(schema.legacyKey);
      }
    }

    // Nothing found anywhere — use default
    if (payload === undefined) return initialValue;

    // Step 3: Run migration if needed
    let value: T;
    if (version < schema.version) {
      value = schema.migrate(payload, version);
    } else {
      value = payload as T;
    }

    // Step 4: Write back the envelope
    const envelope: Envelope<T> = { _v: schema.version, data: value };
    localStorage.setItem(key, JSON.stringify(envelope));

    return value;
  } catch (e) {
    console.warn(`[persist] Migration failed for "${key}", resetting to default:`, e);
    localStorage.removeItem(key);
    return initialValue;
  }
}
```

- [ ] **Step 2: Verify the app still builds**

Run: `cd app && npx svelte-check --threshold warning`
Expected: No new errors (existing stores still use unversioned `persisted()` — backward compatible).

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/stores/persist.ts
git commit -m "feat: add StoreSchema and versioned persisted() factory with universal envelope"
```

---

### Task 2: Progress Store Schemas

**Files:**
- Modify: `app/src/lib/stores/progress.ts`

- [ ] **Step 1: Add schemas to all 7 progress stores**

Add the following import at the top of `progress.ts` (after the existing imports):

```typescript
import type { StoreSchema } from './persist.js';
```

Then replace each store declaration with a schema version. Insert the schema objects before the store declarations (after the `initialPullDone` and `syncStatus` lines, before the mastery store):

```typescript
// ─── Schemas ──────────────────────────────────────────────────────────────────

const masterySchema: StoreSchema<MasteryMap> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): MasteryMap {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
    const cleaned: MasteryMap = {};
    for (const [key, val] of Object.entries(raw)) {
      if (
        val && typeof val === 'object' &&
        typeof (val as any).attempts === 'number' && (val as any).attempts >= 0 &&
        typeof (val as any).correct === 'number' && (val as any).correct >= 0 &&
        typeof (val as any).lastSeen === 'number'
      ) {
        cleaned[key] = val as MasteryEntry;
      }
    }
    return cleaned;
  },
};

const streakSchema: StoreSchema<StreakState> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): StreakState {
    if (typeof raw !== 'object' || raw === null) return DEFAULT_STREAK;
    return { ...DEFAULT_STREAK, ...raw };
  },
};

const doneSchema: StoreSchema<DoneMap> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): DoneMap {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
    const cleaned: DoneMap = {};
    for (const [key, val] of Object.entries(raw)) {
      if (typeof val === 'boolean') cleaned[key] = val;
    }
    return cleaned;
  },
};

const appTimeSchema: StoreSchema<AppTimeState> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): AppTimeState {
    if (typeof raw !== 'object' || raw === null) return DEFAULT_APP_TIME;
    const merged = { ...DEFAULT_APP_TIME, ...raw };
    if (typeof merged.totalSecs !== 'number' || merged.totalSecs < 0) merged.totalSecs = 0;
    if (typeof merged.sessions !== 'number' || merged.sessions < 0) merged.sessions = 0;
    if (typeof merged.dailySecs !== 'object' || merged.dailySecs === null) merged.dailySecs = {};
    return merged;
  },
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const actDatesSchema: StoreSchema<string[]> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): string[] {
    if (!Array.isArray(raw)) return [];
    const valid = raw.filter((d: any) => typeof d === 'string' && ISO_DATE_RE.test(d));
    return valid.slice(-365);
  },
};

const unlockSettingsSchema: StoreSchema<{ freeMode: boolean; units: number[]; lessons: Record<string, boolean> }> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): { freeMode: boolean; units: number[]; lessons: Record<string, boolean> } {
    if (typeof raw !== 'object' || raw === null) return { freeMode: false, units: [], lessons: {} };
    return {
      freeMode: typeof raw.freeMode === 'boolean' ? raw.freeMode : false,
      units: Array.isArray(raw.units) ? raw.units : [],
      lessons: typeof raw.lessons === 'object' && raw.lessons !== null ? raw.lessons : {},
    };
  },
};

const aiReportsSchema: StoreSchema<Record<string, { lastDate: string; text: string }>> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): Record<string, { lastDate: string; text: string }> {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
    const cleaned: Record<string, { lastDate: string; text: string }> = {};
    for (const [key, val] of Object.entries(raw)) {
      if (
        val && typeof val === 'object' &&
        typeof (val as any).lastDate === 'string' &&
        typeof (val as any).text === 'string'
      ) {
        cleaned[key] = val as { lastDate: string; text: string };
      }
    }
    return cleaned;
  },
};
```

Also add `MasteryEntry` to the type import:

```typescript
import type { MasteryMap, MasteryEntry, StreakState, DoneMap, AppTimeState } from '$lib/types';
```

Then update each store declaration to pass the schema as the third argument:

```typescript
export const mastery = persisted<MasteryMap>('wb_mastery', {}, masterySchema);
export const streak = persisted<StreakState>('wb_streak', DEFAULT_STREAK, streakSchema);
export const done = persisted<DoneMap>('wb_done5', {}, doneSchema);
export const appTime = persisted<AppTimeState>('wb_apptime', DEFAULT_APP_TIME, appTimeSchema);
export const actDates = persisted<string[]>('wb_act_dates', [], actDatesSchema);
export const unlockSettings = persisted<{ freeMode: boolean; units: number[]; lessons: Record<string, boolean> }>(
  'wb_unlock_settings', { freeMode: false, units: [], lessons: {} }, unlockSettingsSchema
);
export const aiReports = persisted<Record<string, { lastDate: string; text: string }>>(
  'wb_ai_report', {}, aiReportsSchema
);
```

- [ ] **Step 2: Verify build**

Run: `cd app && npx svelte-check --threshold warning`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/stores/progress.ts
git commit -m "feat: add v1 schemas to all progress stores (mastery, streak, done, appTime, actDates, unlockSettings, aiReports)"
```

---

### Task 3: Scores Store Schema with Legacy Key

**Files:**
- Modify: `app/src/lib/stores/quiz.ts`

- [ ] **Step 1: Add schema to `scores` with `legacyKey`**

Add import at the top of `quiz.ts`:

```typescript
import type { StoreSchema } from './persist.js';
```

Add the schema before the `scores` declaration:

```typescript
const scoresSchema: StoreSchema<ScoreEntry[]> = {
  version: 1,
  legacyKey: 'wb_sc5',
  migrate(raw: any, _fromVersion: number): ScoreEntry[] {
    // Legacy signed envelope format: { d: "JSON string", s: "hash" }
    let entries: any[];
    if (raw && typeof raw === 'object' && typeof raw.d === 'string') {
      try { entries = JSON.parse(raw.d); } catch { return []; }
    } else if (Array.isArray(raw)) {
      entries = raw;
    } else {
      return [];
    }

    if (!Array.isArray(entries)) return [];
    return entries.filter((e: any) =>
      e && typeof e === 'object' &&
      typeof e.qid === 'string' &&
      typeof e.pct === 'number' && e.pct >= 0 && e.pct <= 100 &&
      typeof e.score === 'number' && e.score >= 0 &&
      typeof e.total === 'number' && e.total > 0
    );
  },
};
```

Update the `scores` declaration:

```typescript
export const scores = persisted<ScoreEntry[]>('wb_sc5_v2', [], scoresSchema);
```

- [ ] **Step 2: Verify build**

Run: `cd app && npx svelte-check --threshold warning`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/stores/quiz.ts
git commit -m "feat: add v1 schema to scores store with legacyKey for vanilla migration"
```

---

### Task 4: Settings & A11y Schemas (prefs.ts Simplification)

**Files:**
- Modify: `app/src/lib/stores/prefs.ts`

- [ ] **Step 1: Replace `prefs.ts` with schema-based stores**

Replace the entire contents of `app/src/lib/stores/prefs.ts` with:

```typescript
/**
 * Preferences stores — accessibility flags and app settings.
 *
 * Both stores use versioned persisted() with schema migration.
 * Settings absorbs the legacy compound migration (wb_theme, wb_sound,
 * timer keys, wb_settings_v1, wb_unit_unlocks) that was previously
 * in boot.ts migrateLegacy().
 */

import { browser } from '$app/environment';
import type { A11yPrefs, AppSettings } from '$lib/types';
import { DEFAULT_A11Y_PREFS, DEFAULT_APP_SETTINGS } from '$lib/types';
import { persisted, type StoreSchema } from './persist.js';

// ─── Settings schema ─────────────────────────────────────────────────────────

const settingsSchema: StoreSchema<AppSettings> = {
  version: 1,
  migrate(raw: any, fromVersion: number): AppSettings {
    let base: Partial<AppSettings> = {};

    if (typeof raw === 'object' && raw !== null) {
      base = { ...raw };
    }

    // Compound legacy migration: read scattered vanilla keys
    if (fromVersion === 0 && browser) {
      try {
        const legacyTheme = localStorage.getItem('wb_theme');
        if (legacyTheme === 'light' || legacyTheme === 'dark') {
          base.theme = base.theme ?? legacyTheme;
        }

        const legacySound = localStorage.getItem('wb_sound');
        if (legacySound === 'off') base.sound = base.sound ?? 'off';

        const legacyLessonSecs = localStorage.getItem('wb_lesson_timer_secs');
        if (legacyLessonSecs) {
          const mins = Math.round(parseInt(legacyLessonSecs, 10) / 60);
          if (mins > 0 && !base.lessonTimerMins) base.lessonTimerMins = mins;
        }

        const legacyUnitSecs = localStorage.getItem('wb_unit_timer_secs');
        if (legacyUnitSecs) {
          const mins = Math.round(parseInt(legacyUnitSecs, 10) / 60);
          if (mins > 0 && !base.unitTimerMins) base.unitTimerMins = mins;
        }

        const legacyFinalSecs = localStorage.getItem('wb_final_timer_secs');
        if (legacyFinalSecs) {
          const mins = Math.round(parseInt(legacyFinalSecs, 10) / 60);
          if (mins > 0 && !base.finalTimerMins) base.finalTimerMins = mins;
        }

        try {
          const v1Raw = localStorage.getItem('wb_settings_v1');
          if (v1Raw) {
            const v1 = JSON.parse(v1Raw);
            if (v1.studentName && !base.studentName) base.studentName = v1.studentName;
          }
        } catch { /* skip */ }

        try {
          const unlockRaw = localStorage.getItem('wb_unit_unlocks');
          if (unlockRaw) {
            const arr = JSON.parse(unlockRaw);
            if (Array.isArray(arr) && arr.length > 0 && !base.freeMode) base.freeMode = true;
          }
        } catch { /* skip */ }

        // Clean up legacy keys
        for (const k of [
          'wb_theme', 'wb_sound', 'wb_lesson_timer_secs', 'wb_unit_timer_secs',
          'wb_final_timer_secs', 'wb_settings_v1', 'wb_unit_unlocks', 'wb_lesson_unlocks',
        ]) {
          localStorage.removeItem(k);
        }
      } catch { /* best effort */ }
    }

    // Apply timer-defaults fix (0 → defaults)
    const merged = { ...DEFAULT_APP_SETTINGS, ...base };
    if (merged.lessonTimerMins === 0) merged.lessonTimerMins = DEFAULT_APP_SETTINGS.lessonTimerMins;
    if (merged.unitTimerMins === 0) merged.unitTimerMins = DEFAULT_APP_SETTINGS.unitTimerMins;
    if (merged.finalTimerMins === 0) merged.finalTimerMins = DEFAULT_APP_SETTINGS.finalTimerMins;

    // Strip the old inline _v — envelope handles versioning now
    if ('_v' in merged) delete (merged as any)._v;

    return merged;
  },
};

// ─── A11y schema ──────────────────────────────────────────────────────────────

const a11ySchema: StoreSchema<A11yPrefs> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): A11yPrefs {
    if (typeof raw !== 'object' || raw === null) return DEFAULT_A11Y_PREFS;
    return { ...DEFAULT_A11Y_PREFS, ...raw };
  },
};

// ─── Stores ───────────────────────────────────────────────────────────────────

export const a11y = persisted<A11yPrefs>('wb_a11y', DEFAULT_A11Y_PREFS, a11ySchema);

export const settings = persisted<AppSettings>('wb_settings_v2', DEFAULT_APP_SETTINGS, settingsSchema);
```

- [ ] **Step 2: Verify build**

Run: `cd app && npx svelte-check --threshold warning`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/stores/prefs.ts
git commit -m "feat: replace persistedMigrated() with schema-based settings; absorb legacy key migration"
```

---

### Task 5: User Store Schemas + `pinSession` Store

**Files:**
- Modify: `app/src/lib/stores/user.ts`
- Modify: `app/src/lib/stores/index.ts`

- [ ] **Step 1: Add schemas and `pinSession` store to `user.ts`**

Add import at the top:

```typescript
import type { StoreSchema } from './persist.js';
```

Add the schemas before the store declarations (after the imports):

```typescript
// ─── Schemas ──────────────────────────────────────────────────────────────────

const authUserSchema: StoreSchema<AuthUser | null> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): AuthUser | null {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'object' && typeof raw.id === 'string' && raw.id) {
      return { id: raw.id, email: typeof raw.email === 'string' ? raw.email : '' };
    }
    return null;
  },
};

const familyProfilesSchema: StoreSchema<StudentProfile[]> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): StudentProfile[] {
    if (!Array.isArray(raw)) return [];
    return raw.filter((p: any) =>
      p && typeof p === 'object' &&
      typeof p.id === 'string' &&
      typeof p.display_name === 'string'
    );
  },
};

export interface PinSession {
  studentId: string;
  token: string;
}

const pinSessionSchema: StoreSchema<PinSession | null> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): PinSession | null {
    if (raw === null || raw === undefined) return null;
    if (
      typeof raw === 'object' &&
      typeof raw.studentId === 'string' && raw.studentId &&
      typeof raw.token === 'string' && raw.token
    ) {
      return { studentId: raw.studentId, token: raw.token };
    }
    return null;
  },
};
```

Update the store declarations to use schemas:

```typescript
export const authUser = persisted<AuthUser | null>('mmr_auth_user', null, authUserSchema);
export const familyProfiles = persisted<StudentProfile[]>('mmr_family_profiles', [], familyProfilesSchema);
```

Add the new `pinSession` store after `guestMode`:

```typescript
/**
 * PIN session token — set on successful PIN verification.
 * Contains studentId + server-issued session UUID.
 * Null when no PIN session is active.
 */
export const pinSession = persisted<PinSession | null>('mmr_pin_session', null, pinSessionSchema);
```

- [ ] **Step 2: Add `pinSession` to barrel export in `index.ts`**

In `app/src/lib/stores/index.ts`, update the user export line:

```typescript
export { authUser, familyProfiles, activeStudentId, activeStudent, isSignedIn, isStudentActive, guestMode, pinSession } from './user.js';
```

Also export the `PinSession` type:

```typescript
export type { PinSession } from './user.js';
```

- [ ] **Step 3: Verify build**

Run: `cd app && npx svelte-check --threshold warning`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add app/src/lib/stores/user.ts app/src/lib/stores/index.ts
git commit -m "feat: add schemas to user stores; add pinSession persisted store"
```

---

### Task 6: Delete `migrateLegacy()` from `boot.ts`

**Files:**
- Modify: `app/src/lib/boot.ts`

- [ ] **Step 1: Rewrite `boot.ts`**

Replace the entire contents of `app/src/lib/boot.ts` with:

```typescript
/**
 * boot.ts — App initializer.
 *
 * Call once from the root layout on mount. Populates the unitsData store
 * with the 10 unit shells so the home screen can render immediately.
 * Lesson content is lazy-loaded per unit on demand.
 *
 * All localStorage migration is handled by the versioned persisted() factory.
 * Importing the stores barrel ensures every store module evaluates at boot,
 * triggering eager migration before the UI renders.
 */

import { unitsData } from '$lib/stores/content';
import { UNIT_SHELLS } from '$lib/data/shared';
import type { Unit } from '$lib/types';

// Barrel import — ensures all store modules evaluate (triggers versioned migrations)
import '$lib/stores';

let booted = false;

export function boot(): void {
  if (booted) return;
  booted = true;

  const units: Unit[] = UNIT_SHELLS.map((shell) => ({
    ...shell,
    _loaded: false,
  }));

  unitsData.set(units);
}

/**
 * Lazy-load a unit's full lesson content.
 * Uses import.meta.glob so Vite statically discovers all unit data files
 * and creates proper chunks for each one.
 */
const unitLoaders = import.meta.glob('./data/u*.ts') as Record<string, () => Promise<any>>;

export async function loadUnit(unitId: string): Promise<void> {
  const idx = parseInt(unitId.replace('u', ''), 10) - 1;
  if (isNaN(idx) || idx < 0 || idx > 9) return;

  // Check if already loaded
  let alreadyLoaded = false;
  unitsData.update((units) => {
    alreadyLoaded = units[idx]?._loaded ?? false;
    return units;
  });
  if (alreadyLoaded) return;

  const loader = unitLoaders[`./data/u${idx + 1}.ts`];
  if (!loader) return;

  const mod = await loader();
  const { mergeUnitContent } = await import('$lib/stores/content');
  mergeUnitContent(idx, mod.lessons, mod.unitQuiz, mod.testBank);
}
```

- [ ] **Step 2: Verify build**

Run: `cd app && npx svelte-check --threshold warning`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/boot.ts
git commit -m "refactor: delete migrateLegacy() — absorbed into versioned persisted() schemas"
```

---

### Task 7: Replace raw `mmr_pin_session` localStorage in `auth.ts`

**Files:**
- Modify: `app/src/lib/services/auth.ts`

- [ ] **Step 1: Import `pinSession` store and update `verifyStudentPin`**

Add import at the top of `auth.ts` (after the existing imports):

```typescript
import { pinSession } from '$lib/stores';
```

In `verifyStudentPin()`, replace the localStorage write block (lines 263-271):

```typescript
    // Persist session token on success so sync RPCs can use it
    if (result.success && result.sessionToken) {
      try {
        localStorage.setItem('mmr_pin_session', JSON.stringify({
          studentId: studentId,
          token: result.sessionToken,
        }));
      } catch { /* quota exceeded — session still valid for this page load */ }
    }
```

With:

```typescript
    // Persist session token on success so sync RPCs can use it
    if (result.success && result.sessionToken) {
      pinSession.set({ studentId, token: result.sessionToken });
    }
```

- [ ] **Step 2: Update `signOut` to use store**

In `signOut()`, remove `'mmr_pin_session'` from the `keysToRemove` array (it's now managed by the store's subscriber). Also remove `'mmr_pending_scores'` since it's not a persisted store key — keep it in the array since it's still raw localStorage.

Actually, `mmr_pin_session` is now managed by the persisted store, so removing the key manually would be redundant (and the subscriber would immediately re-write it). Instead, set the store to null. Add after the for loop and before `return { error: null }`:

```typescript
  // Clear PIN session store (subscriber writes null to localStorage)
  pinSession.set(null);
```

And remove `'mmr_pin_session'` from the `keysToRemove` array so the for loop doesn't fight the subscriber.

- [ ] **Step 3: Verify build**

Run: `cd app && npx svelte-check --threshold warning`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add app/src/lib/services/auth.ts
git commit -m "refactor: use pinSession store instead of raw localStorage in auth.ts"
```

---

### Task 8: Replace raw `mmr_pin_session` localStorage in `sync.ts`

**Files:**
- Modify: `app/src/lib/services/sync.ts`

- [ ] **Step 1: Import `pinSession` and replace helpers**

Add to the import from `$lib/stores` (which already imports many stores):

```typescript
import {
  mastery, streak, done, appTime, actDates, scores,
  activeStudent, activeStudentId, a11y, settings, unlockSettings, initialPullDone,
  syncStatus, pinSession,
} from '$lib/stores';
```

Delete the `getPinSession()` helper function (lines 28-36):

```typescript
/** Read the PIN session token from localStorage. Returns null if missing/invalid. */
function getPinSession(): { studentId: string; token: string } | null {
  try {
    const raw = localStorage.getItem('mmr_pin_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.studentId && parsed?.token) return parsed;
  } catch { /* corrupted — treat as missing */ }
  return null;
}
```

Replace all calls to `getPinSession()` in the file with `get(pinSession)`. The `get` import from `svelte/store` is already present at line 14.

Update `handleSessionExpired()` (lines 42-46). Replace:

```typescript
function handleSessionExpired(): void {
  try { localStorage.removeItem('mmr_pin_session'); } catch {}
  try { localStorage.removeItem('mmr_pending_scores'); } catch {}
  activeStudentId.set(null);
}
```

With:

```typescript
function handleSessionExpired(): void {
  pinSession.set(null);
  try { localStorage.removeItem('mmr_pending_scores'); } catch {}
  activeStudentId.set(null);
}
```

- [ ] **Step 2: Verify build**

Run: `cd app && npx svelte-check --threshold warning`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/services/sync.ts
git commit -m "refactor: use pinSession store instead of raw localStorage in sync.ts"
```

---

### Task 9: Replace raw `mmr_pin_session` localStorage in `+layout.svelte`

**Files:**
- Modify: `app/src/routes/+layout.svelte`

- [ ] **Step 1: Import `pinSession` and simplify auth guard**

Add `pinSession` to the store import at line 22:

```typescript
import { authUser, activeStudent, activeStudentId, familyProfiles, settings, guestMode, initialPullDone, syncStatus, pinSession } from '$lib/stores';
```

Replace the PIN-only session hardening block (lines 192-211):

```typescript
    if (!$authUser && $activeStudentId && !$guestMode) {
      try {
        const raw = localStorage.getItem('mmr_pin_session');
        const session = raw ? JSON.parse(raw) : null;
        if (!session?.token || session.studentId !== $activeStudentId) {
          activeStudentId.set(null);
          localStorage.removeItem('mmr_pin_session');
          if (!isPublic) {
            navStack.clear();
            goto('/login', { replaceState: true });
          }
        }
      } catch {
        activeStudentId.set(null);
        if (!isPublic) {
          navStack.clear();
          goto('/login', { replaceState: true });
        }
      }
    }
```

With:

```typescript
    if (!$authUser && $activeStudentId && !$guestMode) {
      if (!$pinSession?.token || $pinSession.studentId !== $activeStudentId) {
        activeStudentId.set(null);
        pinSession.set(null);
        if (!isPublic) {
          navStack.clear();
          goto('/login', { replaceState: true });
        }
      }
    }
```

- [ ] **Step 2: Verify build**

Run: `cd app && npx svelte-check --threshold warning`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/routes/+layout.svelte
git commit -m "refactor: use pinSession store instead of raw localStorage in layout auth guard"
```

---

### Task 10: Remove `_v` from `AppSettings` Type

**Files:**
- Modify: `app/src/lib/types/user.ts`

- [ ] **Step 1: Remove inline `_v` from type and default**

The `_v` field on `AppSettings` was the old inline versioning. Now that the universal envelope handles versioning, this field is obsolete.

In `app/src/lib/types/user.ts`, remove line 65:

```typescript
  /** Internal migration version — used to upgrade persisted settings across releases. */
  _v?: number;
```

And remove `_v: 1,` from `DEFAULT_APP_SETTINGS` (line 89).

- [ ] **Step 2: Verify build**

Run: `cd app && npx svelte-check --threshold warning`
Expected: No new errors. The `settingsSchema.migrate()` in `prefs.ts` already does `delete merged._v` to strip it.

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/types/user.ts
git commit -m "refactor: remove inline _v from AppSettings — envelope handles versioning"
```

---

### Task 11: Full Build + Verification

**Files:** None (verification only)

- [ ] **Step 1: Full TypeScript build**

Run: `cd app && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify envelope format in dev**

Run: `cd app && npm run dev`

Open browser DevTools console and check localStorage keys:

```javascript
// All versioned stores should have { _v: 1, data: ... } format
JSON.parse(localStorage.getItem('wb_mastery'))
JSON.parse(localStorage.getItem('wb_streak'))
JSON.parse(localStorage.getItem('wb_done5'))
JSON.parse(localStorage.getItem('wb_apptime'))
JSON.parse(localStorage.getItem('wb_act_dates'))
JSON.parse(localStorage.getItem('wb_sc5_v2'))
JSON.parse(localStorage.getItem('wb_settings_v2'))
JSON.parse(localStorage.getItem('wb_a11y'))
JSON.parse(localStorage.getItem('wb_unlock_settings'))
JSON.parse(localStorage.getItem('wb_ai_report'))
JSON.parse(localStorage.getItem('mmr_auth_user'))
JSON.parse(localStorage.getItem('mmr_family_profiles'))
JSON.parse(localStorage.getItem('mmr_pin_session'))

// Unversioned stores should NOT have envelope
JSON.parse(localStorage.getItem('mmr_active_student'))
JSON.parse(localStorage.getItem('mmr_guest_mode'))
```

Each versioned key should show `{ _v: 1, data: <value> }`.
Each unversioned key should show the raw value (string or boolean).

- [ ] **Step 3: Test corruption recovery**

In DevTools console:

```javascript
localStorage.setItem('wb_mastery', '{{{garbage');
location.reload();
// After reload, check:
JSON.parse(localStorage.getItem('wb_mastery'))
// Should be: { _v: 1, data: {} }
```

- [ ] **Step 4: Test PIN session validation**

In DevTools console:

```javascript
localStorage.setItem('mmr_pin_session', JSON.stringify({ _v: 1, data: { studentId: '', token: '' } }));
location.reload();
// After reload:
JSON.parse(localStorage.getItem('mmr_pin_session'))
// Should be: { _v: 1, data: null }
```

- [ ] **Step 5: Commit any fixes**

If any issues were found and fixed in Steps 2-4, commit them:

```bash
git add -A
git commit -m "fix: address issues found during localStorage versioning verification"
```
