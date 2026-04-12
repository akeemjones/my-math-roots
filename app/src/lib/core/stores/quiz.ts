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
import type { StoreSchema } from './persist.js';
import { done } from './progress.js';
import type { CurrentState, ScoreEntry } from '$lib/core/types';

/** Current navigation + quiz state. In-memory only. */
export const cur = writable<CurrentState>({
  unitIdx: null,
  lessonIdx: null,
  quiz: null,
});

/**
 * All completed quiz scores.
 * Persisted to localStorage as 'wb_sc5_v2'.
 * Migrates legacy data from 'wb_sc5' (vanilla app key), unwrapping the
 * signed envelope format { d, s } used by the old app.
 */
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

export const scores = persisted<ScoreEntry[]>('wb_sc5_v2', [], scoresSchema);

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
