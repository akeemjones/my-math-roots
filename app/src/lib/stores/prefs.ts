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

import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { A11yPrefs, AppSettings } from '$lib/types';
import { DEFAULT_A11Y_PREFS, DEFAULT_APP_SETTINGS } from '$lib/types';
import { persisted } from './persist.js';

/**
 * Migrate stored AppSettings to the current schema version.
 * v0 → v1: timer mins were defaulted to 0 (no timer); should be 8/30/60.
 *           We only upgrade zeros — user-set non-zero values are preserved.
 */
function migrateSettings(stored: AppSettings): AppSettings {
  const migrated = { ...DEFAULT_APP_SETTINGS, ...stored };

  // v0 → v1: bump timer defaults from 0 to legacy defaults
  if (!stored._v || stored._v < 1) {
    if (migrated.lessonTimerMins === 0) migrated.lessonTimerMins = DEFAULT_APP_SETTINGS.lessonTimerMins;
    if (migrated.unitTimerMins   === 0) migrated.unitTimerMins   = DEFAULT_APP_SETTINGS.unitTimerMins;
    if (migrated.finalTimerMins  === 0) migrated.finalTimerMins  = DEFAULT_APP_SETTINGS.finalTimerMins;
    migrated._v = 1;
  }

  return migrated;
}

function persistedMigrated(key: string): Writable<AppSettings> {
  let initial = DEFAULT_APP_SETTINGS;

  if (browser) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        initial = migrateSettings(JSON.parse(raw) as AppSettings);
      }
    } catch {
      localStorage.removeItem(key);
    }
  }

  const store = writable<AppSettings>(initial);

  if (browser) {
    store.subscribe((value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage quota exceeded — silently skip.
      }
    });
  }

  return store;
}

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
export const settings = persistedMigrated('wb_settings_v2');
