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
 * Redirects the browser — call after user clicks "Sign in with Google".
 * The auth callback lands on /login?type=recovery or similar; Supabase handles the session.
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
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
 */
export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
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
  const { data, error } = await supabase
    .from('student_profiles')
    .select('id, display_name, age, avatar_emoji, avatar_color_from, avatar_color_to, pin_hash, family_code, parent_id, created_at')
    .order('created_at', { ascending: true });

  if (error) return { profiles: [], error: error.message };

  const profiles: StudentProfile[] = (data ?? []).map((row) => ({
    id: row.id,
    display_name: row.display_name,
    age: row.age ?? 0,
    avatar_emoji: row.avatar_emoji,
    avatar_color_from: row.avatar_color_from,
    avatar_color_to: row.avatar_color_to,
    pin_hash: row.pin_hash,
    family_code: row.family_code,
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
      pin_hash: data.pin_hash,
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
  const { data, error } = await supabase.rpc('verify_student_pin', {
    p_student_id: studentId,
    p_pin: pin,
  });

  if (error) return { success: false, attemptsLeft: null, error: error.message };

  return {
    success: data?.success ?? false,
    attemptsLeft: data?.attempts_left ?? null,
    error: null,
  };
}
