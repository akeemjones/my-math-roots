/**
 * Progress types — mastery tracking, streaks, completion flags, app time.
 * Mirrors MASTERY, STREAK, DONE, APP_TIME from src/quiz.js and src/state.js.
 */

/**
 * Per-question mastery entry.
 * Keys in the MasteryMap are a base-36 hash of the question text.
 * Format is identical in both legacy and SvelteKit builds.
 */
export interface MasteryEntry {
  /** Total times this question has been seen (was 'q' in vanilla). */
  attempts: number;
  /** Times answered correctly (was 'c' in vanilla). */
  correct: number;
  /** Times answered incorrectly (was 'w' in vanilla). */
  wrong: number;
  /** Unix timestamp of last exposure — used for spaced-repetition decay. */
  lastSeen: number;
}

/** Map from question hash → mastery entry.  Stored in localStorage as wb_mastery. */
export type MasteryMap = Record<string, MasteryEntry>;

/** Daily/overall streak state.  Stored in localStorage as wb_streak. */
export interface StreakState {
  /** Consecutive days with at least one passing quiz (≥80%). */
  current: number;
  /** Historical maximum streak. */
  longest: number;
  /** ISO date string of the last passing quiz day, e.g. "2026-04-01". */
  lastDate: string | null;
}

/**
 * Completion flags — tracks which lessons and quizzes the student has passed.
 * Keys are quiz/lesson IDs (e.g. "u1l1", "lq_u1l1", "u2_uq").
 * Stored in localStorage as wb_done5.
 */
export type DoneMap = Record<string, boolean>;

/** App time tracking — how long the student has spent in the app per day. */
export interface AppTimeState {
  /** Cumulative seconds across all sessions. */
  totalSecs: number;
  /** Total session count. */
  sessions: number;
  /** Daily breakdown: ISO date → seconds. Stored in localStorage as wb_apptime. */
  dailySecs: Record<string, number>;
}

export const DEFAULT_STREAK: StreakState = {
  current: 0,
  longest: 0,
  lastDate: null,
};

export const DEFAULT_APP_TIME: AppTimeState = {
  totalSecs: 0,
  sessions: 0,
  dailySecs: {},
};
