/**
 * Auth service — thin wrapper around Supabase JS v2.
 *
 * Covers:
 *  - Parent email/password sign-in
 *  - Google OAuth sign-in
 *  - Sign-out
 *  - Fetch student profiles for a signed-in parent
 *  - Verify a student's PIN (server-side RPC with 5-attempt lockout)
 *  - Create a new student profile
 */

import { supabase } from '$lib/supabase';
import type { StudentProfile, AuthUser } from '$lib/types';

/**
 * Race a promise against a timeout. Rejects with Error('timeout') if ms elapses first.
 * Used to prevent Supabase network calls from hanging indefinitely after iOS force-close,
 * where the SDK queues API calls behind a stalled token refresh.
 */
function withTimeout<T>(ms: number, promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}

// ─── Types returned by this service ──────────────────────────────────────────

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

export interface ProfilesResult {
  profiles: StudentProfile[];
  error: string | null;
}

export interface PinResult {
  /** True if the PIN was correct. */
  success: boolean;
  /** Number of attempts remaining before lockout, or null if success. */
  attemptsLeft: number | null;
  /** Server-issued session token (UUID). Present only on success. */
  sessionToken: string | null;
  error: string | null;
}

// ─── Sign-in ─────────────────────────────────────────────────────────────────

/**
 * Sign in a parent with email + password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  const u = data.user;
  if (!u) return { user: null, error: 'No user returned' };
  return {
    user: { id: u.id, email: u.email ?? '' },
    error: null,
  };
}

/**
 * Initiate Google OAuth sign-in.
 *
 * On iOS standalone PWA, a redirect to accounts.google.com permanently
 * breaks fullscreen mode for that session. To avoid this, we detect
 * standalone mode and open a popup window instead.
 *
 * In regular browser tabs the redirect flow is used as before.
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;

  if (isStandalone) {
    // Popup flow — keeps the PWA in fullscreen
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
        skipBrowserRedirect: true,
      },
    });
    if (error) return { error: error.message };
    if (data?.url) {
      // Open Google auth in a child window; Supabase JS detects the
      // callback and resolves the session via onAuthStateChange.
      const popup = window.open(data.url, '_blank', 'width=500,height=600');
      // Poll for popup close — session will arrive via onAuthStateChange
      if (popup) {
        await new Promise<void>((resolve) => {
          const timer = setInterval(() => {
            if (popup.closed) { clearInterval(timer); resolve(); }
          }, 500);
        });
      }
    }
    return { error: null };
  }

  // Standard redirect flow for regular browser tabs
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login`,
    },
  });
  return { error: error?.message ?? null };
}

/**
 * Sign out the current parent session.
 * Clears all student-scoped localStorage data to prevent data leaking
 * to the next family that signs in on this device.
 */
export async function signOut(): Promise<{ error: string | null }> {
  // 5 s timeout prevents a stalled token refresh on iOS force-close from
  // blocking the sign-out indefinitely. localStorage is cleared regardless.
  try {
    await withTimeout(5000, supabase.auth.signOut());
  } catch { /* timed out or network error — clear localStorage anyway */ }

  // Clear all student/progress data from localStorage
  const keysToRemove = [
    'wb_sc5_v2', 'wb_mastery', 'wb_streak', 'wb_done5',
    'wb_apptime', 'wb_act_dates', 'wb_a11y', 'wb_settings_v2',
    'mmr_family_profiles', 'mmr_active_student', 'mmr_guest_mode',
    'mmr_auth_user', 'wb_unlock_settings', 'wb_quiz_pause',
    'mmr_pin_session', 'mmr_pending_scores',
  ];
  for (const key of keysToRemove) {
    try { localStorage.removeItem(key); } catch { /* SSR guard */ }
  }

  return { error: null };
}

// ─── Session ─────────────────────────────────────────────────────────────────

/**
 * Returns the currently signed-in user, or null if not authenticated.
 * Safe to call on page load.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return null;
  return { id: u.id, email: u.email ?? '' };
}

// ─── Student profiles ─────────────────────────────────────────────────────────

/**
 * Fetch all student profiles for the signed-in parent.
 * Calls the `get_profiles_by_family_code` RPC (see supabase_setup.sql).
 * Falls back to a direct table query if the RPC is unavailable.
 */
export async function getStudentProfiles(): Promise<ProfilesResult> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return { profiles: [], error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('student_profiles')
    .select('id, display_name, age, avatar_emoji, avatar_color_from, avatar_color_to, parent_id, created_at')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return { profiles: [], error: error.message };

  const profiles: StudentProfile[] = (data ?? []).map((row) => ({
    id: row.id,
    display_name: row.display_name,
    age: row.age ?? 0,
    avatar_emoji: row.avatar_emoji,
    avatar_color_from: row.avatar_color_from,
    avatar_color_to: row.avatar_color_to,
    parent_id: row.parent_id,
  }));

  return { profiles, error: null };
}

/**
 * Create a new student profile.
 * PIN hashing happens server-side in the `create_student_profile` RPC.
 */
export async function createStudentProfile(params: {
  display_name: string;
  avatar_emoji: string;
  avatar_color_from: string;
  avatar_color_to: string;
  age: number;
  pin: string;
}): Promise<{ profile: StudentProfile | null; error: string | null }> {
  const { data, error } = await supabase.rpc('create_student_profile', {
    p_display_name: params.display_name,
    p_avatar_emoji: params.avatar_emoji,
    p_avatar_color_from: params.avatar_color_from,
    p_avatar_color_to: params.avatar_color_to,
    p_age: params.age,
    p_pin: params.pin,
  });

  if (error) return { profile: null, error: error.message };

  return {
    profile: {
      id: data.id,
      display_name: data.display_name,
      age: data.age,
      avatar_emoji: data.avatar_emoji,
      avatar_color_from: data.avatar_color_from,
      avatar_color_to: data.avatar_color_to,
      parent_id: data.parent_id,
      family_code: data.family_code,
    },
    error: null,
  };
}

// ─── PIN verification ─────────────────────────────────────────────────────────

/**
 * Verify a student's 4-digit PIN via server-side RPC.
 *
 * The `verify_student_pin` RPC:
 *  - Compares bcrypt hash server-side (PIN never leaves the browser in plain text
 *    beyond the TLS connection)
 *  - Enforces a 5-attempt lockout per student per day
 *  - Returns { success: boolean, attempts_left: number }
 */
export async function verifyStudentPin(
  studentId: string,
  pin: string
): Promise<PinResult> {
  // 8 s timeout prevents the "Checking…" spinner from freezing after iOS
  // force-close when the Supabase SDK queues the RPC behind a stalled refresh.
  try {
    const { data, error } = await withTimeout(
      8000,
      supabase.rpc('verify_student_pin', {
        p_student_id: studentId,
        p_pin: pin,
      })
    );
    if (error) return { success: false, attemptsLeft: null, sessionToken: null, error: error.message };
    const result: PinResult = {
      success: data?.success ?? false,
      attemptsLeft: data?.attempts_left ?? null,
      sessionToken: data?.session_token ?? null,
      error: null,
    };
    // Persist session token on success so sync RPCs can use it
    if (result.success && result.sessionToken) {
      try {
        localStorage.setItem('mmr_pin_session', JSON.stringify({
          studentId: studentId,
          token: result.sessionToken,
        }));
      } catch { /* quota exceeded — session still valid for this page load */ }
    }
    return result;
  } catch {
    return { success: false, attemptsLeft: null, sessionToken: null, error: 'Network error. Please try again.' };
  }
}
