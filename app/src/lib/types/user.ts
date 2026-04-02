/**
 * User types — student profiles, accessibility preferences, app settings.
 * Mirrors data stored in Supabase (student_profiles) and localStorage (wb_* keys).
 */

/** A student profile — stored in Supabase and cached in localStorage. */
export interface StudentProfile {
  /** Supabase row ID. */
  id: string;
  /** Display name, e.g. "Alex". */
  display_name: string;
  /** Age in years. */
  age: number;
  /** Emoji avatar character, e.g. "🦁". */
  avatar_emoji: string;
  /** Gradient start colour (hex) for the avatar background. */
  avatar_color_from: string;
  /** Gradient end colour (hex) for the avatar background. */
  avatar_color_to: string;
  /** Hashed 4-digit PIN — never sent to client in v6+. */
  pin_hash: string;
  /** Optional family sync code, e.g. "MMR-0000". */
  family_code?: string;
  /** Supabase auth UID of the parent who owns this profile. */
  parent_id?: string;
}

/** Authenticated parent/teacher user from Supabase Auth. */
export interface AuthUser {
  id: string;
  email?: string;
  role?: 'student' | 'parent';
}

/** Accessibility preferences — stored in localStorage as wb_a11y. */
export interface A11yPrefs {
  colorblind: boolean;
  haptic: boolean;
  reduceMotion: boolean;
  textSelect: boolean;
  focus: boolean;
  screenreader: boolean;
}

/** App-level settings — stored across several wb_* localStorage keys. */
export interface AppSettings {
  theme: 'light' | 'dark';
  /** Lesson quiz timer in minutes (0 = no timer). */
  lessonTimerMins: number;
  /** Unit quiz timer in minutes (0 = no timer). */
  unitTimerMins: number;
  /** Final test timer in minutes (0 = no timer). */
  finalTimerMins: number;
  /** Whether all unit content is unlocked regardless of score. */
  freeMode: boolean;
  /** Number of times the app has been opened. */
  visitCount: number;
  /** True once the onboarding tutorial has been dismissed. */
  tutorialDone: boolean;
}

export const DEFAULT_A11Y_PREFS: A11yPrefs = {
  colorblind: false,
  haptic: true,
  reduceMotion: false,
  textSelect: false,
  focus: false,
  screenreader: false,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'light',
  lessonTimerMins: 0,
  unitTimerMins: 0,
  finalTimerMins: 0,
  freeMode: false,
  visitCount: 0,
  tutorialDone: false,
};
