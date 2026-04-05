/**
 * Progress stores — mastery, streak, done flags, app time.
 *
 * Replaces globals:
 *   declare const MASTERY: MasteryMap
 *   declare let STREAK: StreakState
 *   declare const DONE: DoneMap
 *   declare const APP_TIME: AppTimeState
 *
 * All four are persisted to localStorage using the same keys as the vanilla app
 * so that existing student data carries over when we cut over in Phase 8.
 *
 * Supabase sync (Phase 3+):
 *   - MASTERY  → mastery_json column on student_profiles
 *   - STREAK   → streak / longest_streak columns on student_profiles
 *   - DONE     → done_data table
 *   - APP_TIME → apptime_json column on student_profiles
 */

import { derived, writable } from 'svelte/store';
import { persisted } from './persist.js';
import type { StoreSchema } from './persist.js';
import type { MasteryMap, MasteryEntry, StreakState, DoneMap, AppTimeState } from '$lib/core/types';
import { DEFAULT_STREAK, DEFAULT_APP_TIME } from '$lib/core/types';

/**
 * Flag set to true after the first pullStudentData completes.
 * Used to gate the tutorial overlay so it waits for cloud onboarding
 * state before deciding whether to show.
 */
export const initialPullDone = writable(false);

// Re-export from dedicated module (avoids circular dep with persist.ts)
export { syncStatus } from './syncStatus.js';

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

/**
 * Per-question mastery scores.
 * Key: base-36 hash of the question text (matching vanilla's _qKey()).
 * Format: { attempts, correct, lastSeen } — same in both legacy and SvelteKit.
 */
export const mastery = persisted<MasteryMap>('wb_mastery', {}, masterySchema);

/** Daily streak tracking. Stored as wb_streak. */
export const streak = persisted<StreakState>('wb_streak', DEFAULT_STREAK, streakSchema);

/**
 * Lesson/quiz completion flags.
 * Key: quiz ID (e.g. "u1l1", "lq_u1l1", "u2_uq").
 * Stored as wb_done5 (matching vanilla key for data continuity).
 */
export const done = persisted<DoneMap>('wb_done5', {}, doneSchema);

/** Daily app time tracking. Stored as wb_apptime. */
export const appTime = persisted<AppTimeState>('wb_apptime', DEFAULT_APP_TIME, appTimeSchema);

/**
 * Activity dates — ISO date strings for days the student was active.
 * Matches legacy wb_act_dates. Used by the streak calendar.
 * Capped at 365 entries (rolling window).
 */
export const actDates = persisted<string[]>('wb_act_dates', [], actDatesSchema);

/** Parent-set unlock overrides synced from Supabase unlock_settings column. */
export const unlockSettings = persisted<{ freeMode: boolean; units: number[]; lessons: Record<string, boolean> }>(
  'wb_unlock_settings', { freeMode: false, units: [], lessons: {} }, unlockSettingsSchema
);

/**
 * Per-student AI progress report cache.
 * Key: student profile ID → { lastDate: ISO date string, text: report body }
 * Stored as wb_ai_report (new key — not in vanilla app).
 * 14-day cooldown enforced in AiReportCard.svelte.
 */
export const aiReports = persisted<Record<string, { lastDate: string; text: string }>>(
  'wb_ai_report', {}, aiReportsSchema
);

// ─── Derived helpers ──────────────────────────────────────────────────────────

/** True if the lesson or quiz with the given ID has been passed. */
export const isDone = derived(done, ($done) => (id: string) => !!$done[id]);

/** Total seconds active in the last N days (default 7). */
export const recentSecs = derived(appTime, ($at) => (days = 7): number => {
  const today = new Date();
  let total = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    total += $at.dailySecs[key] ?? 0;
  }
  return total;
});

/** Current streak count (convenience shorthand). */
export const currentStreak = derived(streak, ($s) => $s.current);
