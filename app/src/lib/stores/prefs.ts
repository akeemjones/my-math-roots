/**
 * Preferences stores — accessibility flags and app settings.
 *
 * Replaces the vanilla: localStorage wb_a11y, wb_theme, wb_*_timer_mins, etc.
 *
 * Both stores are persisted. Settings changes take effect immediately
 * via Svelte's reactive subscriptions (no page reload needed).
 *
 * Supabase sync: a11y and timer settings are pushed to student_profiles
 * via the update_student_settings RPC (Phase 3).
 */

import { persisted } from './persist.js';
import type { A11yPrefs, AppSettings } from '$lib/types';
import { DEFAULT_A11Y_PREFS, DEFAULT_APP_SETTINGS } from '$lib/types';

/**
 * Accessibility preferences.
 * Stored as wb_a11y (matching vanilla key).
 */
export const a11y = persisted<A11yPrefs>('wb_a11y', DEFAULT_A11Y_PREFS);

/**
 * App-level settings (theme, timers, unlock mode).
 * Uses a new key wb_settings_v2 — the vanilla app split these across
 * multiple wb_* keys; a migration helper in Phase 3 will consolidate them.
 */
export const settings = persisted<AppSettings>('wb_settings_v2', DEFAULT_APP_SETTINGS);
