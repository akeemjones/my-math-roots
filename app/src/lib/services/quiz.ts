/**
 * Quiz service — adaptive question sampling, mastery tracking, and scoring.
 *
 * Ported 1:1 from src/quiz.js + src/state.js _masteryWeightedSample,
 * _weightedSample, _qKey, _updateMastery, and the results-screen scoring logic.
 * All store writes happen here; components stay pure UI.
 */

import { get } from 'svelte/store';
import type { Question, QuizType, QuizState, QuizAnswer, ScoreEntry } from '$lib/types';
import { mastery, streak, done, scores, cur } from '$lib/stores';

// ─── Question key ─────────────────────────────────────────────────────────────

/** 31-hash of question text → base-36 string. Matches vanilla _qKey(). */
export function qKey(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

// ─── Difficulty targets ───────────────────────────────────────────────────────

const DIFF_TARGETS: Record<QuizType, { e: number; m: number; h: number }> = {
  lesson:   { e: 3,  m: 3,  h: 2  },
  unit:     { e: 8,  m: 10, h: 7  },
  final:    { e: 15, m: 20, h: 15 },
  practice: { e: 1,  m: 2,  h: 2  },
};

const QUIZ_SIZE: Record<QuizType, number> = {
  lesson:   8,
  unit:     25,
  final:    50,
  practice: 5,
};

// ─── Adaptive mastery-weighted sampler ───────────────────────────────────────

function masteryWeightedSample(bank: Question[], n: number): Question[] {
  const now = Date.now();
  const DAY = 86_400_000;
  const $mastery = get(mastery);

  const pool = bank.map((q) => {
    const m = $mastery[qKey(q.t)];
    let w: number;
    if (!m || m.attempts === 0) {
      w = 1.5; // never seen — moderate priority
    } else {
      const acc = m.correct / m.attempts;
      const daysSince = (now - m.lastSeen) / DAY;
      const decay = Math.min(daysSince / 7, 1) * 0.5;
      w = (1 - acc) * 2.0 + decay + 0.1;
    }
    return { q, w };
  });

  const result: Question[] = [];
  const remaining = [...pool];
  for (let i = 0; i < Math.min(n, remaining.length); i++) {
    const total = remaining.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    let pick = remaining.length - 1;
    for (let j = 0; j < remaining.length; j++) {
      r -= remaining[j].w;
      if (r <= 0) { pick = j; break; }
    }
    result.push(remaining[pick].q);
    remaining.splice(pick, 1);
  }
  return result;
}

/** Shuffle an array in-place (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Public sampler ───────────────────────────────────────────────────────────

/**
 * Sample N questions from bank using difficulty stratification + mastery weighting.
 * Falls back to flat mastery sampling when no questions have a `d` field.
 */
export function weightedSample(bank: Question[], type: QuizType): Question[] {
  const n = QUIZ_SIZE[type];

  // Backward compat: no difficulty tags → flat mastery sample
  if (!bank.some((q) => q.d)) {
    return masteryWeightedSample(bank, n);
  }

  const targets = { ...DIFF_TARGETS[type] };
  const tiers = {
    e: bank.filter((q) => q.d === 'e'),
    m: bank.filter((q) => q.d === 'm' || !q.d),
    h: bank.filter((q) => q.d === 'h'),
  };

  // Redistribute shortfall from under-sized tiers
  const draws = { ...targets };
  for (const d of ['e', 'm', 'h'] as const) {
    const shortage = Math.max(0, draws[d] - tiers[d].length);
    if (shortage > 0) {
      draws[d] = tiers[d].length;
      const others = (['e', 'm', 'h'] as const).filter((x) => x !== d);
      const otherTotal = others.reduce((s, x) => s + draws[x], 0);
      if (otherTotal > 0) {
        for (const x of others) draws[x] += Math.round(shortage * draws[x] / otherTotal);
      } else {
        for (const x of others) draws[x] += Math.ceil(shortage / 2);
      }
    }
  }

  // Clamp total to n
  let drawTotal = draws.e + draws.m + draws.h;
  while (drawTotal > n) {
    const biggest = (['e', 'm', 'h'] as const).reduce((a, b) => draws[a] >= draws[b] ? a : b);
    draws[biggest]--;
    drawTotal--;
  }

  return shuffle([
    ...masteryWeightedSample(tiers.e, draws.e),
    ...masteryWeightedSample(tiers.m, draws.m),
    ...masteryWeightedSample(tiers.h, draws.h),
  ]);
}

// ─── Quiz state builder ───────────────────────────────────────────────────────

/** Build a fresh QuizState and write it into the cur store. */
export function startQuiz(
  bank: Question[],
  qid: string,
  label: string,
  type: QuizType,
  unitIdx: number | null
): void {
  const questions = weightedSample(bank, type);
  const state: QuizState = {
    id: qid,
    label,
    type,
    unitIdx,
    questions,
    idx: 0,
    viewIdx: 0,
    score: 0,
    answers: [],
    startTime: Date.now(),
  };
  cur.update((c) => ({ ...c, unitIdx, quiz: state }));
}

// ─── Mastery update ───────────────────────────────────────────────────────────

/** Update the mastery store after a quiz completes. Matches vanilla _updateMastery(). */
export function updateMastery(answers: QuizAnswer[]): void {
  const now = Date.now();
  mastery.update(($m) => {
    const updated = { ...$m };
    for (const a of answers) {
      if (!a?.t) continue;
      const k = qKey(a.t);
      const entry = updated[k] ?? { attempts: 0, correct: 0, wrong: 0, lastSeen: 0 };
      updated[k] = {
        attempts: entry.attempts + 1,
        correct: entry.correct + (a.ok ? 1 : 0),
        wrong: entry.wrong + (a.ok ? 0 : 1),
        lastSeen: now,
      };
    }
    return updated;
  });
}

// ─── Streak update ────────────────────────────────────────────────────────────

/** Bump the daily streak if the student hasn't already logged activity today. */
export function touchStreak(): void {
  const today = new Date().toISOString().slice(0, 10);
  streak.update(($s) => {
    if ($s.lastDate === today) return $s;
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const current = $s.lastDate === yesterday ? $s.current + 1 : 1;
    return {
      current,
      longest: Math.max($s.longest ?? 0, current),
      lastDate: today,
    };
  });
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

/** Star rating matching vanilla results screen. */
export function calcStars(pct: number): string {
  if (pct === 100) return '⭐⭐⭐';
  if (pct >= 90)   return '⭐⭐⭐';
  if (pct >= 80)   return '⭐⭐';
  if (pct >= 60)   return '⭐';
  return '';
}

/** Emoji + message for the results screen. */
export function calcResultMessage(pct: number): { emoji: string; msg: string } {
  if (pct === 100) return { emoji: '🏆', msg: 'PERFECT SCORE! You are a math superstar!' };
  if (pct >= 90)   return { emoji: '🥇', msg: 'Outstanding! Almost perfect!' };
  if (pct >= 80)   return { emoji: '🎉', msg: 'Great job! You really know this material!' };
  if (pct >= 70)   return { emoji: '😊', msg: 'Good work! A little more practice will help!' };
  if (pct >= 60)   return { emoji: '💪', msg: 'Keep practicing — you are getting there!' };
  return           { emoji: '📚', msg: 'Keep reviewing — every attempt makes you stronger!' };
}

/**
 * Finalise a completed quiz:
 *  1. Persist the ScoreEntry to the scores store.
 *  2. Update mastery for all answered questions.
 *  3. Touch the daily streak if score ≥ 80%.
 *  4. Mark the quiz ID as done in the done store.
 *  5. Clear the active quiz from cur.
 *
 * Returns the persisted ScoreEntry for the results screen.
 */
export function finaliseQuiz(qz: QuizState, color: string): ScoreEntry {
  const total = qz.questions.length;
  const pct = total > 0 ? Math.floor((qz.score / total) * 100) : 0;
  const now = new Date();

  const entry: ScoreEntry = {
    id: Date.now(),
    qid: qz.id,
    label: qz.label,
    type: qz.type,
    unitIdx: qz.unitIdx,
    color,
    score: qz.score,
    total,
    pct,
    stars: calcStars(pct),
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    timeTaken: formatDuration(Math.round((Date.now() - qz.startTime) / 1000)),
    answers: qz.answers,
  };

  // 1. Persist score
  scores.update(($s) => [entry, ...$s]);

  // 2. Update per-question mastery
  updateMastery(qz.answers);

  // 3. Streak
  if (pct >= 80) touchStreak();

  // 4. Mark done
  if (pct >= 80) {
    done.update(($d) => ({ ...$d, [qz.id]: true }));
  }

  // 5. Clear quiz state
  cur.update(($c) => ({ ...$c, quiz: null }));

  return entry;
}

function formatDuration(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
  const s = (totalSecs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
