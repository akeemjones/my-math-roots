/**
 * sync.ts — Bidirectional Supabase sync for all student data.
 *
 * Push: local stores → Supabase student_profiles (fire-and-forget after quiz)
 * Pull: Supabase → local stores (on student selection / login)
 *
 * Data synced per-student on student_profiles:
 *   mastery_json, streak_*, apptime_json, done_json, act_dates_json,
 *   settings_json, a11y_json
 *
 * Scores are synced separately via quiz_scores table (per-row inserts).
 */

import { get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import {
  mastery, streak, done, appTime, actDates, scores,
  activeStudent, a11y, settings,
} from '$lib/stores';
import type { ScoreEntry } from '$lib/types';

// ─── Push: local → Supabase ─────────────────────────────────────────────────

/**
 * Push all student progress data to Supabase.
 * Called after quiz completion and on app backgrounding.
 * Fire-and-forget — callers should .catch() to swallow errors.
 */
export async function pushStudentData(): Promise<void> {
  const student = get(activeStudent);
  if (!student) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const _mastery   = get(mastery);
  const _streak    = get(streak);
  const _appTime   = get(appTime);
  const _done      = get(done);
  const _actDates  = get(actDates);
  const _settings  = get(settings);
  const _a11y      = get(a11y);

  const { error } = await supabase.from('student_profiles').update({
    mastery_json:      _mastery,
    streak_current:    _streak.current,
    streak_longest:    _streak.longest ?? 0,
    streak_last_date:  _streak.lastDate ?? '',
    apptime_json:      _appTime,
    done_json:         _done,
    act_dates_json:    _actDates,
    settings_json:     _settings,
    a11y_json:         _a11y,
  }).eq('id', student.id);

  if (error) console.warn('[sync] Push failed:', error.message);
}

// ─── Pull: Supabase → local ─────────────────────────────────────────────────

/**
 * Pull all student progress data from Supabase and merge into local stores.
 * Called when a student is selected (PIN verified) or on app boot for
 * the previously active student.
 *
 * Strategy: cloud wins for aggregated data (mastery uses higher values,
 * scores are merged by local_id, done flags are OR-merged).
 */
export async function pullStudentData(studentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // ── Pull profile progress ─────────────────────────────────────────────
  const { data: profile, error: profErr } = await supabase
    .from('student_profiles')
    .select('mastery_json, streak_current, streak_longest, streak_last_date, apptime_json, done_json, act_dates_json, settings_json, a11y_json')
    .eq('id', studentId)
    .single();

  if (profErr || !profile) {
    console.warn('[sync] Pull profile failed:', profErr?.message);
    return;
  }

  // ── Merge mastery (keep higher attempts/correct per question) ─────────
  if (profile.mastery_json && typeof profile.mastery_json === 'object') {
    mastery.update(($local) => {
      const cloud = profile.mastery_json as Record<string, any>;
      const merged = { ...$local };
      for (const [k, v] of Object.entries(cloud)) {
        const local = merged[k];
        if (!local || v.attempts > local.attempts) {
          merged[k] = v;
        }
      }
      return merged;
    });
  }

  // ── Merge streak (keep whichever is more recent) ──────────────────────
  if (profile.streak_current !== undefined) {
    streak.update(($local) => {
      const cloudDate = profile.streak_last_date || '';
      const localDate = $local.lastDate || '';
      if (cloudDate >= localDate) {
        return {
          current: profile.streak_current,
          longest: Math.max(profile.streak_longest ?? 0, $local.longest ?? 0),
          lastDate: cloudDate || null,
        };
      }
      return {
        ...$local,
        longest: Math.max(profile.streak_longest ?? 0, $local.longest ?? 0),
      };
    });
  }

  // ── Merge app time (sum daily seconds, keep max) ──────────────────────
  if (profile.apptime_json && typeof profile.apptime_json === 'object') {
    appTime.update(($local) => {
      const cloud = profile.apptime_json as any;
      const mergedDaily = { ...$local.dailySecs };
      if (cloud.dailySecs) {
        for (const [day, secs] of Object.entries(cloud.dailySecs)) {
          mergedDaily[day] = Math.max(mergedDaily[day] ?? 0, secs as number);
        }
      }
      return {
        totalSecs: Math.max($local.totalSecs ?? 0, cloud.totalSecs ?? 0),
        sessions: Math.max($local.sessions ?? 0, cloud.sessions ?? 0),
        dailySecs: mergedDaily,
      };
    });
  }

  // ── Merge done flags (OR-merge — once done, always done) ──────────────
  if (profile.done_json && typeof profile.done_json === 'object') {
    done.update(($local) => ({ ...(profile.done_json as Record<string, boolean>), ...$local }));
  }

  // ── Merge activity dates (union of both sets) ─────────────────────────
  if (Array.isArray(profile.act_dates_json)) {
    actDates.update(($local) => {
      const merged = [...new Set([...(profile.act_dates_json as string[]), ...$local])];
      merged.sort();
      // Cap at 365
      return merged.length > 365 ? merged.slice(-365) : merged;
    });
  }

  // ── Settings & a11y (cloud wins if present, preserves local device prefs otherwise)
  if (profile.settings_json && typeof profile.settings_json === 'object') {
    const cloud = profile.settings_json as any;
    settings.update(($local) => ({
      ...$local,
      // Only pull cross-device settings; theme/sound stay local (device-specific)
      studentName: cloud.studentName || $local.studentName,
      lessonTimerMins: cloud.lessonTimerMins ?? $local.lessonTimerMins,
      unitTimerMins: cloud.unitTimerMins ?? $local.unitTimerMins,
      finalTimerMins: cloud.finalTimerMins ?? $local.finalTimerMins,
      freeMode: cloud.freeMode ?? $local.freeMode,
    }));
  }

  if (profile.a11y_json && typeof profile.a11y_json === 'object') {
    const cloud = profile.a11y_json as any;
    a11y.update(($local) => ({ ...$local, ...cloud }));
  }

  // ── Pull scores from quiz_scores table ────────────────────────────────
  const { data: cloudScores, error: scErr } = await supabase
    .from('quiz_scores')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (!scErr && cloudScores && cloudScores.length > 0) {
    scores.update(($local) => {
      const localIds = new Set($local.map((s) => s.id));
      const newEntries: ScoreEntry[] = [];

      for (const row of cloudScores) {
        if (localIds.has(row.local_id)) continue;
        newEntries.push({
          id: row.local_id,
          qid: row.qid,
          label: row.label ?? '',
          type: row.type ?? 'lesson',
          unitIdx: row.unit_idx,
          color: row.color ?? '#6c5ce7',
          score: row.score,
          total: row.total,
          pct: row.pct,
          stars: row.stars ?? '',
          date: row.date_str ?? '',
          time: row.time_str ?? '',
          timeTaken: row.time_taken ?? '',
          answers: row.answers ?? [],
          name: row.student_name ?? '',
          studentId: row.student_id ?? '',
          quit: row.quit ?? false,
          abandoned: row.abandoned ?? false,
        });
      }

      if (newEntries.length === 0) return $local;
      // Merge and sort by id (timestamp) descending, cap at 200
      const merged = [...$local, ...newEntries]
        .sort((a, b) => b.id - a.id)
        .slice(0, 200);
      return merged;
    });
  }

  console.log('[sync] Pulled student data from Supabase');
}
