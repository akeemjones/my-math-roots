/**
 * Quiz stores — CUR and SCORES replacements.
 *
 * Replaces globals:
 *   declare let CUR: CurrentState
 *   declare const SCORES: ScoreEntry[]
 *
 * SCORES is persisted to localStorage (wb_sc5).
 * CUR is in-memory only — quiz state does not survive a full page reload
 * (matching the vanilla app's behaviour).
 *
 * Supabase sync: SCORES are pushed to quiz_scores table after each quiz
 * completion (wired in Phase 5).
 */

import { writable, derived } from 'svelte/store';
import { persisted } from './persist.js';
import { done } from './progress.js';
import type { CurrentState, ScoreEntry } from '$lib/types';

/** Current navigation + quiz state. In-memory only. */
export const cur = writable<CurrentState>({
  unitIdx: null,
  lessonIdx: null,
  quiz: null,
});

/**
 * All completed quiz scores.
 * Persisted to localStorage as 'wb_sc5' to match the vanilla app's key.
 *
 * NOTE: The vanilla app stores scores in a signed envelope { d, s }.
 * In Phase 5, a migration helper will unwrap that format on first load.
 * For now, new scores are stored as plain ScoreEntry objects.
 */
export const scores = persisted<ScoreEntry[]>('wb_sc5_v2', []);

/** Best score for a given quiz ID (0 if never attempted). */
export const bestScore = derived(scores, ($scores) => (qid: string): number => {
  const entries = $scores.filter((s) => s.qid === qid);
  return entries.length === 0 ? 0 : Math.max(...entries.map((s) => s.pct));
});

/** True if the student has passed the given quiz (≥80%).
 *  Also checks done_json flags for legacy data that may not have score rows. */
export const hasPassed = derived([scores, done], ([$scores, $done]) => (qid: string): boolean =>
  !!$done[qid] || $scores.some((s) => s.qid === qid && s.pct >= 80)
);
