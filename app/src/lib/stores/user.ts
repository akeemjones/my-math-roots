/**
 * User stores — student profile and auth session.
 *
 * Replaces globals:
 *   declare let _supaUser: CurrentUser | null
 *   declare let _lsSelectedStudentId: string | null
 *   declare let _lsFamilyProfiles: StudentProfile[] | null
 *
 * Active student profile is persisted to localStorage.
 * Supabase auth session is in-memory only (re-established on load).
 *
 * Supabase sync: student profiles are pulled from student_profiles
 * table on login (Phase 3).
 */

import { writable, derived } from 'svelte/store';
import { persisted } from './persist.js';
import type { StudentProfile, AuthUser } from '$lib/types';

/** Supabase Auth user (parent/teacher). Null when signed out. In-memory only. */
export const authUser = writable<AuthUser | null>(null);

/**
 * All student profiles available to the current family.
 * Persisted so the profile list survives a page reload without re-fetching.
 * Key matches vanilla: mmr_family_profiles
 */
export const familyProfiles = persisted<StudentProfile[]>('mmr_family_profiles', []);

/**
 * ID of the currently active student.
 * Persisted so the selection survives a page reload.
 */
export const activeStudentId = persisted<string | null>('mmr_active_student', null);

/** The full profile object for the active student — derived, never stored twice. */
export const activeStudent = derived(
  [familyProfiles, activeStudentId],
  ([$profiles, $id]) => $profiles.find((p) => p.id === $id) ?? null
);

/** True when a parent/teacher is signed in. */
export const isSignedIn = derived(authUser, ($u) => $u !== null);

/** True when a student has been selected (PIN entered). */
export const isStudentActive = derived(activeStudent, ($s) => $s !== null);

/**
 * Guest mode — set when the user clicks "Continue without an account".
 * Bypasses auth guard so the app is usable without a Supabase session.
 * Cleared automatically when a parent/teacher signs in.
 */
export const guestMode = persisted<boolean>('mmr_guest_mode', false);
