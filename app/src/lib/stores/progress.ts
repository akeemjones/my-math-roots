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

import { derived } from 'svelte/store';
import { persisted } from './persist.js';
import type { MasteryMap, StreakState, DoneMap, AppTimeState } from '$lib/types';
import { DEFAULT_STREAK, DEFAULT_APP_TIME } from '$lib/types';

/**
 * Per-question mastery scores.
 * Key: base-36 hash of the question text (matching vanilla's _qKey()).
 * Format: { attempts, correct, lastSeen } — same in both legacy and SvelteKit.
 */
export const mastery = persisted<MasteryMap>('wb_mastery', {});

/** Daily streak tracking. Stored as wb_streak. */
export const streak = persisted<StreakState>('wb_streak', DEFAULT_STREAK);

/**
 * Lesson/quiz completion flags.
 * Key: quiz ID (e.g. "u1l1", "lq_u1l1", "u2_uq").
 * Stored as wb_done5 (matching vanilla key for data continuity).
 */
export const done = persisted<DoneMap>('wb_done5', {});

/** Daily app time tracking. Stored as wb_apptime. */
export const appTime = persisted<AppTimeState>('wb_apptime', DEFAULT_APP_TIME);

/**
 * Activity dates — ISO date strings for days the student was active.
 * Matches legacy wb_act_dates. Used by the streak calendar.
 * Capped at 365 entries (rolling window).
 */
export const actDates = persisted<string[]>('wb_act_dates', []);

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

/**
 * Per-student AI progress report cache.
 * Key: student profile ID → { lastDate: ISO date string, text: report body }
 * Stored as wb_ai_report (new key — not in vanilla app).
 * 14-day cooldown enforced in AiReportCard.svelte.
 */
export const aiReports = persisted<Record<string, { lastDate: string; text: string }>>(
  'wb_ai_report',
  {}
);
