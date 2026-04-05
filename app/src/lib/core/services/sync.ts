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
import { supabase } from '$lib/core/supabase';
import {
  mastery, streak, done, appTime, actDates, scores,
  activeStudent, activeStudentId, a11y, settings, unlockSettings, initialPullDone,
  syncStatus, pinSession,
} from '$lib/core/stores';
import type { ScoreEntry } from '$lib/core/types';
import { DEFAULT_STREAK, DEFAULT_APP_TIME } from '$lib/core/types';
import { applyCloudOnboarding, clearOnboardingLocal } from '$lib/ui/services/tour';

/**
 * Handle a session-expired error from an RPC.
 * Clears the PIN session and active student so the auth guard redirects to login.
 */
function handleSessionExpired(): void {
  pinSession.set(null);
  try { localStorage.removeItem('mmr_pending_scores'); } catch {}
  activeStudentId.set(null);
}

/** Check if an RPC error indicates an expired/invalid session. */
function isSessionError(errorMsg: string | undefined | null): boolean {
  if (!errorMsg) return false;
  return errorMsg.includes('invalid_session') || errorMsg.includes('session_expired');
}

/** Read pending scores buffer from localStorage. */
function getPendingScores(): any[] {
  try {
    const raw = localStorage.getItem('mmr_pending_scores');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

/** Clear pending scores buffer after successful push. */
function clearPendingScores(): void {
  try { localStorage.removeItem('mmr_pending_scores'); } catch {}
}

// ─── Push: local → Supabase ─────────────────────────────────────────────────

let _successTimer: ReturnType<typeof setTimeout> | null = null;

/** Internal push — returns true on success, false on failure. */
async function _doPush(): Promise<boolean> {
  const student = get(activeStudent);
  if (!student) return true; // nothing to push

  const _mastery   = get(mastery);
  const _streak    = get(streak);
  const _appTime   = get(appTime);
  const _done      = get(done);
  const _actDates  = get(actDates);
  const _settings  = get(settings);
  const _a11y      = get(a11y);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
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
    if (error) { console.warn('[sync] Push failed:', error.message); return false; }
  } else {
    // PIN-only student — use session-authenticated RPC
    const session = get(pinSession);
    if (!session || session.studentId !== student.id) {
      console.warn('[sync] Push failed: no valid PIN session');
      handleSessionExpired();
      return false;
    }

    const pendingScores = getPendingScores();

    const { data, error } = await supabase.rpc('push_student_progress', {
      p_student_id:       student.id,
      p_session_token:    session.token,
      p_mastery_json:     _mastery,
      p_streak_current:   _streak.current,
      p_streak_longest:   _streak.longest ?? 0,
      p_streak_last_date: _streak.lastDate ?? '',
      p_apptime_json:     _appTime,
      p_done_json:        _done,
      p_act_dates_json:   _actDates,
      p_settings_json:    _settings,
      p_a11y_json:        _a11y,
      p_scores:           pendingScores,
    });
    if (error) {
      console.warn('[sync] Push RPC failed:', error.message);
      if (isSessionError(error.message)) handleSessionExpired();
      return false;
    }
    // Check for validation errors in response
    if (data?.error) {
      console.warn('[sync] Push validation failed:', data.details ?? data.error);
      return false;
    }
    // Scores were accepted — clear the buffer
    if (pendingScores.length > 0) clearPendingScores();
  }
  return true;
}

/**
 * Push all student progress data to Supabase.
 * Updates syncStatus store so the UI can surface failures.
 * Retries once after 2 seconds on failure.
 */
export async function pushStudentData(): Promise<void> {
  const student = get(activeStudent);
  if (!student) return;

  if (_successTimer) { clearTimeout(_successTimer); _successTimer = null; }
  syncStatus.set('syncing');

  try {
    let ok = await _doPush();
    if (!ok) {
      // Retry once after 2 seconds
      await new Promise(r => setTimeout(r, 2000));
      ok = await _doPush();
    }
    if (ok) {
      syncStatus.set('success');
      _successTimer = setTimeout(() => syncStatus.set('idle'), 3000);
    } else {
      syncStatus.set('error');
    }
  } catch (e) {
    console.warn('[sync] Push threw:', e);
    syncStatus.set('error');
  }
}

// ─── Pull: Supabase → local ─────────────────────────────────────────────────

let pullInProgress: string | null = null;
let pullGeneration = 0;

/**
 * Pull all student progress data from Supabase and merge into local stores.
 * Called when a student is selected (PIN verified) or on app boot for
 * the previously active student.
 *
 * Strategy: cloud wins for aggregated data (mastery uses higher values,
 * scores are merged by local_id, done flags are OR-merged).
 *
 * Uses a generation counter to cancel stale pulls when students are switched
 * rapidly. If a newer pull starts while an older one is in-flight, the older
 * pull will bail out at the next await boundary without writing stores.
 */
export async function pullStudentData(studentId: string): Promise<void> {
  if (pullInProgress === studentId) return; // Already pulling this student
  pullInProgress = studentId;
  const myGen = ++pullGeneration;
  try {
  initialPullDone.set(false);
  // Reset all progress stores to defaults before pulling new student's data.
  // This prevents stale data from a previous student leaking through when
  // the new student has no cloud data for a given field.
  mastery.set({});
  streak.set(DEFAULT_STREAK);
  done.set({});
  appTime.set(DEFAULT_APP_TIME);
  actDates.set([]);
  scores.set([]);
  unlockSettings.set({ freeMode: false, units: [], lessons: {} });

  const { data: { user } } = await supabase.auth.getUser();
  if (myGen !== pullGeneration) return; // Stale pull — newer student selected

  let profile: any;
  let rpcScores: any[] | null = null;

  if (user) {
    // Parent signed in — direct table access via RLS
    const { data, error: profErr } = await supabase
      .from('student_profiles')
      .select('mastery_json, streak_current, streak_longest, streak_last_date, apptime_json, done_json, act_dates_json, settings_json, a11y_json, unlock_settings, onboarding_json')
      .eq('id', studentId)
      .single();

    if (profErr || !data) {
      console.warn('[sync] Pull profile failed:', profErr?.message);
      return;
    }
    profile = data;
  } else {
    // PIN-only student — use session-authenticated RPC
    const session = get(pinSession);
    if (!session || session.studentId !== studentId) {
      console.warn('[sync] Pull failed: no valid PIN session');
      handleSessionExpired();
      return;
    }

    const { data, error: rpcErr } = await supabase.rpc('pull_student_progress', {
      p_student_id: studentId,
      p_session_token: session.token,
    });

    if (rpcErr || !data || data.error) {
      console.warn('[sync] Pull RPC failed:', rpcErr?.message || data?.error);
      if (rpcErr && isSessionError(rpcErr.message)) handleSessionExpired();
      return;
    }
    profile = data.profile;
    rpcScores = data.scores;
  }

  if (myGen !== pullGeneration) return; // Stale pull — newer student selected

  // ── Merge mastery (keep higher attempts/correct per question) ─────────
  if (profile.mastery_json && typeof profile.mastery_json === 'object') {
    mastery.update(($local) => {
      const cloud = profile.mastery_json as Record<string, any>;
      const merged = { ...$local };
      for (const [k, v] of Object.entries(cloud)) {
        const local = merged[k];
        if (!local || v.attempts >= local.attempts) {
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
      const cloudMs = cloudDate ? new Date(cloudDate).getTime() : 0;
      const localMs = localDate ? new Date(localDate).getTime() : 0;
      if (cloudMs >= localMs) {
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
    done.update(($local) => ({ ...$local, ...(profile.done_json as Record<string, boolean>) }));
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

  // ── Apply onboarding state (account-level tutorial/spotlight flags) ────
  clearOnboardingLocal();
  applyCloudOnboarding(profile.onboarding_json as Record<string, boolean> | null);

  // ── Merge unlock settings (parent overrides — cloud wins) ─────────────
  if (profile.unlock_settings && typeof profile.unlock_settings === 'object') {
    const cloud = profile.unlock_settings as any;
    unlockSettings.set({
      freeMode: cloud.freeMode === true,
      units: Array.isArray(cloud.units) ? cloud.units : [],
      lessons: (cloud.lessons && typeof cloud.lessons === 'object') ? cloud.lessons : {},
    });
  }

  if (myGen !== pullGeneration) return; // Stale pull — newer student selected

  // ── Pull scores from quiz_scores table (or from RPC result) ───────────
  let cloudScores = rpcScores;
  if (!cloudScores && user) {
    const { data, error: scErr } = await supabase
      .from('quiz_scores')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(200);
    if (!scErr) cloudScores = data;
  }

  if (cloudScores && cloudScores.length > 0) {
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
  } finally {
    pullInProgress = null;
    // Always mark pull as done (even on failure) so tutorials/spotlights unblock.
    // On failure the stores simply stay at their defaults.
    initialPullDone.set(true);
  }
}

// ─── Realtime: live unlock_settings sync ────────────────────────────────────

/**
 * Subscribe to Realtime changes on the student's unlock_settings column.
 * When a parent toggles a unit unlock on the dashboard (different device),
 * the student app updates within seconds.
 * Returns an unsubscribe function.
 */
export function subscribeUnlockSettings(studentId: string): () => void {
  const channel = supabase
    .channel(`unlock-${studentId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'student_profiles',
      filter: `id=eq.${studentId}`,
    }, (payload) => {
      const cloud = payload.new.unlock_settings;
      if (cloud && typeof cloud === 'object') {
        unlockSettings.set({
          freeMode: cloud.freeMode === true,
          units: Array.isArray(cloud.units) ? cloud.units : [],
          lessons: (cloud.lessons && typeof cloud.lessons === 'object') ? cloud.lessons : {},
        });
        console.log('[sync] Realtime unlock_settings updated');
      }
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

/**
 * Lightweight fetch of just unlock_settings for the given student.
 * Used as a fallback on visibility-change (tab/app refocus) to catch
 * any changes missed while the Realtime connection was suspended.
 */
export async function refreshUnlockSettings(studentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  let cloud: any;

  if (user) {
    // Parent signed in — direct table access via RLS
    const { data } = await supabase
      .from('student_profiles')
      .select('unlock_settings')
      .eq('id', studentId)
      .single();
    cloud = data?.unlock_settings;
  } else {
    // PIN-only student — use session-authenticated RPC
    const session = get(pinSession);
    const { data, error } = await supabase.rpc('get_unlock_settings', {
      p_student_id: studentId,
      p_session_token: session?.token ?? null,
    });
    if (error && isSessionError(error.message)) handleSessionExpired();
    cloud = data;
  }

  if (cloud && typeof cloud === 'object') {
    unlockSettings.set({
      freeMode: cloud.freeMode === true,
      units: Array.isArray(cloud.units) ? cloud.units : [],
      lessons: (cloud.lessons && typeof cloud.lessons === 'object') ? cloud.lessons : {},
    });
  }
}
