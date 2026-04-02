/**
 * Quiz types — current quiz state, answers, and score records.
 * Mirrors CUR, SCORES, and related structures from src/quiz.js.
 */

import type { Question } from './content.js';

export type QuizType = 'lesson' | 'unit' | 'final' | 'practice';

/** A student's response to one question. */
export interface QuizAnswer {
  /** Question text (snapshot). */
  t: string;
  /** Index of the option the student chose, or null if timed out. */
  chosen: number | null;
  /** Index of the correct answer. */
  correct: number;
  /** True if the student answered correctly. */
  ok: boolean;
  /** Explanation text shown after answering. */
  exp: string;
  /** Snapshot of the options presented. */
  opts: string[];
  /** Seconds spent on this question. */
  timeSecs: number;
}

/** Full state of an in-progress or completed quiz. */
export interface QuizState {
  /** Quiz identifier, e.g. "lq_u1l1", "u2_uq", "final_test". */
  id: string;
  /** Human-readable label, e.g. "Count Up & Count Back". */
  label: string;
  type: QuizType;
  /** Index of the unit this quiz belongs to (null for Final Test). */
  unitIdx: number | null;
  /** All questions selected for this quiz run. */
  questions: Question[];
  /** Current question index (0-based). */
  idx: number;
  /** Index currently displayed (may differ from idx during review mode). */
  viewIdx: number;
  /** Number of correct answers so far. */
  score: number;
  /** Recorded answers (parallel to questions). */
  answers: QuizAnswer[];
  /** Unix timestamp when the quiz started. */
  startTime: number;
}

/** The top-level navigation state — which screen/unit/lesson the student is on. */
export interface CurrentState {
  /** Index of the active unit (null = home screen). */
  unitIdx: number | null;
  /** Index of the active lesson within the unit (null = unit overview). */
  lessonIdx: number | null;
  /** Active quiz state, or null when not in a quiz. */
  quiz: QuizState | null;
}

/** A completed quiz result persisted to SCORES / Supabase. */
export interface ScoreEntry {
  /** Local ID — Date.now() at time of completion. */
  id: number;
  /** Quiz identifier matching QuizState.id. */
  qid: string;
  /** Human-readable quiz name. */
  label: string;
  type: QuizType;
  /** Unit index, or null for Final Test. */
  unitIdx: number | null;
  /** Unit brand colour (hex). */
  color: string;
  /** Correct answer count. */
  score: number;
  /** Total question count. */
  total: number;
  /** Percentage score (0–100). */
  pct: number;
  /** Star rating string, e.g. "⭐⭐⭐⭐". */
  stars: string;
  /** Human-readable date, e.g. "Apr 1, 2026". */
  date: string;
  /** Human-readable time, e.g. "02:34 PM". */
  time: string;
  /** Formatted duration, e.g. "03:22". */
  timeTaken: string;
  /** Full answer log. */
  answers: QuizAnswer[];
  /** HMAC signature for tamper detection (present when signed in). */
  _sig?: string;
}
