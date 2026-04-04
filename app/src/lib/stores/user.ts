/**
 * User stores — student profile and auth session.
 *
 * Replaces globals:
 *   declare let _supaUser: CurrentUser | null
 *   declare let _lsSelectedStudentId: string | null
 *   declare let _lsFamilyProfiles: StudentProfile[] | null
 *
 * Active student profile is persisted to localStorage.
 * Auth user is persisted to localStorage as a cache so the app doesn't
 * flash the login screen on iOS force-close before session restoration.
 *
 * Supabase sync: student profiles are pulled from student_profiles
 * table on login (Phase 3).
 */

import { derived } from 'svelte/store';
import { persisted } from './persist.js';
import type { StoreSchema } from './persist.js';
import type { StudentProfile, AuthUser } from '$lib/types';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const authUserSchema: StoreSchema<AuthUser | null> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): AuthUser | null {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'object' && typeof raw.id === 'string' && raw.id) {
      return { id: raw.id, email: typeof raw.email === 'string' ? raw.email : '' };
    }
    return null;
  },
};

const familyProfilesSchema: StoreSchema<StudentProfile[]> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): StudentProfile[] {
    if (!Array.isArray(raw)) return [];
    return raw.filter((p: any) =>
      p && typeof p === 'object' &&
      typeof p.id === 'string' &&
      typeof p.display_name === 'string'
    );
  },
};

export interface PinSession {
  studentId: string;
  token: string;
}

const pinSessionSchema: StoreSchema<PinSession | null> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): PinSession | null {
    if (raw === null || raw === undefined) return null;
    if (
      typeof raw === 'object' &&
      typeof raw.studentId === 'string' && raw.studentId &&
      typeof raw.token === 'string' && raw.token
    ) {
      return { studentId: raw.studentId, token: raw.token };
    }
    return null;
  },
};

/**
 * Supabase Auth user (parent/teacher). Null when signed out.
 * Persisted so the value survives iOS force-close (swipe-away) without
 * flashing the login screen while the Supabase session is restored.
 */
export const authUser = persisted<AuthUser | null>('mmr_auth_user', null, authUserSchema);

/**
 * All student profiles available to the current family.
 * Persisted so the profile list survives a page reload without re-fetching.
 * Key matches vanilla: mmr_family_profiles
 */
export const familyProfiles = persisted<StudentProfile[]>('mmr_family_profiles', [], familyProfilesSchema);

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

/**
 * PIN session token — set on successful PIN verification.
 * Contains studentId + server-issued session UUID.
 * Null when no PIN session is active.
 */
export const pinSession = persisted<PinSession | null>('mmr_pin_session', null, pinSessionSchema);
