/**
 * Quiz service — adaptive question sampling, mastery tracking, and scoring.
 *
 * Ported 1:1 from src/quiz.js + src/state.js _masteryWeightedSample,
 * _weightedSample, _qKey, _updateMastery, and the results-screen scoring logic.
 * All store writes happen here; components stay pure UI.
 */

import { get } from 'svelte/store';
import type { Question, QuizType, QuizState, QuizAnswer, ScoreEntry } from '$lib/types';
import { mastery, streak, done, scores, cur, activeStudent, appTime, actDates } from '$lib/stores';
import { supabase } from '$lib/supabase';
import { pushStudentData } from '$lib/services/sync';

// ─── Score buffering for PIN-only students ───────────────────────────────────

/**
 * Buffer a score entry in localStorage for the next pushStudentData() call.
 * Used by PIN-only students who can't insert directly into quiz_scores.
 */
function bufferPendingScore(entry: ScoreEntry): void {
  try {
    const raw = localStorage.getItem('mmr_pending_scores');
    const pending: any[] = raw ? JSON.parse(raw) : [];
    pending.push({
      local_id:     entry.id,
      qid:          entry.qid,
      label:        entry.label,
      type:         entry.type,
      score:        entry.score,
      total:        entry.total,
      pct:          entry.pct,
      stars:        entry.stars,
      unit_idx:     entry.unitIdx,
      color:        entry.color ?? '#6c5ce7',
      student_name: entry.name,
      time_taken:   entry.timeTaken,
      answers:      entry.answers,
      date_str:     entry.date,
      time_str:     entry.time,
      quit:         entry.quit ?? false,
      abandoned:    entry.abandoned ?? false,
    });
    localStorage.setItem('mmr_pending_scores', JSON.stringify(pending));
  } catch {
    console.warn('[quiz] Failed to buffer pending score');
  }
}

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

/** Shuffle an array (Fisher-Yates). Always returns a new copy. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

/** Start a quiz with a pre-built question list (used by Practice Weak Topics). */
export function startQuizDirect(
  questions: Question[],
  qid: string,
  label: string,
  type: QuizType,
  unitIdx: number | null
): void {
  const state: QuizState = {
    id: qid,
    label,
    type,
    unitIdx,
    questions: shuffle([...questions]),
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

/**
 * Bump the daily streak and record the activity date.
 *
 * @param quizId — pass the quiz ID when triggered by a quiz completion.
 *   The same quiz ID can only count once per day (prevents spamming the
 *   same quiz). Pass undefined when triggered by lesson engagement time.
 *
 * @returns true if the streak was actually incremented, false if skipped.
 */
export function touchStreak(quizId?: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  let incremented = false;

  streak.update(($s) => {
    const todayQuizIds = $s.todayQuizIds ?? [];

    // If triggered by a quiz, reject duplicate quiz IDs on the same day
    if (quizId) {
      // Reset todayQuizIds if it's a new day
      const isNewDay = $s.lastDate !== today;
      const activeIds = isNewDay ? [] : todayQuizIds;
      if (!isNewDay && activeIds.includes(quizId)) {
        // Same quiz already counted today — skip
        return $s;
      }
      // Mark this quiz as used today
      const newTodayIds = [...activeIds, quizId];

      if ($s.lastDate === today) {
        // Already have a streak entry for today — just record the quiz ID
        incremented = true;
        return { ...$s, todayQuizIds: newTodayIds };
      }

      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      const current = $s.lastDate === yesterday ? $s.current + 1 : 1;
      incremented = true;
      return {
        current,
        longest: Math.max($s.longest ?? 0, current),
        lastDate: today,
        todayQuizIds: newTodayIds,
      };
    }

    // Triggered by lesson engagement time — no quiz ID dedup needed
    if ($s.lastDate === today) return $s; // already counted today
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const current = $s.lastDate === yesterday ? $s.current + 1 : 1;
    incremented = true;
    return {
      current,
      longest: Math.max($s.longest ?? 0, current),
      lastDate: today,
      todayQuizIds: [],
    };
  });

  if (incremented) {
    // Record activity date (rolling 365-day window)
    actDates.update(($dates) => {
      if ($dates.includes(today)) return $dates;
      const updated = [...$dates, today];
      if (updated.length > 365) updated.shift();
      return updated;
    });
  }

  return incremented;
}

// ─── Lesson engagement streak timer ──────────────────────────────────────────
// Module-level so it accumulates across multiple lesson page navigations.

const STREAK_ENGAGE_SECS = 600; // 10 minutes
let _engageSecs = 0;
let _engageInterval: ReturnType<typeof setInterval> | null = null;
let _engageStreakDate: string | null = null; // date streak was already earned via engagement

function _resetEngageIfNewDay() {
  const today = new Date().toISOString().slice(0, 10);
  if (_engageStreakDate && _engageStreakDate !== today) {
    // New day — reset so the timer can fire again
    _engageSecs = 0;
    _engageStreakDate = null;
  }
}

/**
 * Call on any meaningful lesson interaction (example cycle, practice answer).
 * Starts the shared engagement timer if not already running.
 * After 10 cumulative minutes across any lesson pages, awards a streak day.
 */
export function recordLessonInteraction(): void {
  _resetEngageIfNewDay();
  const today = new Date().toISOString().slice(0, 10);

  // Already earned a streak today via lesson engagement — nothing to do
  if (_engageStreakDate === today) return;

  if (_engageInterval) return; // timer already running

  _engageInterval = setInterval(() => {
    // Don't count time when the tab is backgrounded
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    _resetEngageIfNewDay();
    const t = new Date().toISOString().slice(0, 10);
    if (_engageStreakDate === t) {
      // Already earned — stop
      clearInterval(_engageInterval!);
      _engageInterval = null;
      return;
    }
    _engageSecs++;
    if (_engageSecs >= STREAK_ENGAGE_SECS) {
      touchStreak(); // lesson engagement path — no quiz ID
      _engageStreakDate = t;
      clearInterval(_engageInterval!);
      _engageInterval = null;
    }
  }, 1000);
}

/**
 * Stop the engagement timer. Call from lesson page onDestroy.
 * The accumulated seconds are preserved — timer resumes on next interaction.
 */
export function pauseLessonEngageTimer(): void {
  if (_engageInterval) {
    clearInterval(_engageInterval);
    _engageInterval = null;
  }
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

/** Star rating matching vanilla results screen. */
export function calcStars(pct: number): string {
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
    name: get(activeStudent)?.display_name ?? 'Student',
    studentId: get(activeStudent)?.id ?? '',
  };

  // 1. Persist score
  scores.update(($s) => [entry, ...$s]);

  // Push score to Supabase.
  // Authenticated parents: direct insert into quiz_scores (RLS-protected).
  // PIN-only students: buffer to mmr_pending_scores for next pushStudentData() call.
  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) {
      // PIN-only student: buffer for push RPC
      bufferPendingScore(entry);
      return;
    }
    supabase.from('quiz_scores').insert({
      user_id:      data.user.id,
      student_id:   entry.studentId,
      local_id:     entry.id,
      qid:          entry.qid,
      label:        entry.label,
      type:         entry.type,
      score:        entry.score,
      total:        entry.total,
      pct:          entry.pct,
      stars:        entry.stars,
      unit_idx:     entry.unitIdx,
      color:        entry.color ?? '',
      student_name: entry.name,
      time_taken:   entry.timeTaken,
      answers:      entry.answers,
      date_str:     entry.date,
      time_str:     entry.time,
      quit:         entry.quit ?? false,
      abandoned:    entry.abandoned ?? false,
    }).then(({ error }) => {
      if (error) console.warn('[quiz] Supabase score push failed:', error.message);
    });
  }).catch((e) => console.warn('[quiz] Score sync failed:', e));

  // Sync all student progress data to Supabase (fire-and-forget)
  pushStudentData().catch((e) => console.warn('[quiz] Progress push failed:', e));

  // 2. Update per-question mastery
  updateMastery(qz.answers);

  // 3. Streak — pass quiz ID so the same quiz can't count more than once per day
  if (pct >= 80) touchStreak(qz.id);

  // 4. Mark done
  if (pct >= 80) {
    done.update(($d) => ({ ...$d, [qz.id]: true }));
  }

  // 5. Clear quiz state
  cur.update(($c) => ({ ...$c, quiz: null }));

  return entry;
}

/**
 * Save an abandoned score entry without clearing cur.quiz.
 * Used by confirmRestart() — the quiz continues running after this call,
 * so we must NOT call cur.update({ quiz: null }).
 */
export function saveAbandonedScore(qz: QuizState, color: string): void {
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
    name: get(activeStudent)?.display_name ?? 'Student',
    studentId: get(activeStudent)?.id ?? '',
    abandoned: true,
  };

  // Persist score locally
  scores.update(($s) => [entry, ...$s]);

  // Push to Supabase (fire-and-forget) — entry already has abandoned: true
  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) {
      bufferPendingScore(entry);
      return;
    }
    supabase.from('quiz_scores').insert({
      user_id:      data.user.id,
      student_id:   entry.studentId,
      local_id:     entry.id,
      qid:          entry.qid,
      label:        entry.label,
      type:         entry.type,
      score:        entry.score,
      total:        entry.total,
      pct:          entry.pct,
      stars:        entry.stars,
      unit_idx:     entry.unitIdx,
      color:        entry.color ?? '',
      student_name: entry.name,
      time_taken:   entry.timeTaken,
      answers:      entry.answers,
      date_str:     entry.date,
      time_str:     entry.time,
      quit:         false,
      abandoned:    true,
    }).then(({ error }) => {
      if (error) console.warn('[quiz] Supabase abandoned score push failed:', error.message);
    });
  }).catch((e) => console.warn('[quiz] Abandoned score sync failed:', e));

  // Sync aggregated progress
  pushStudentData().catch(() => {});
}

function formatDuration(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
  const s = (totalSecs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
