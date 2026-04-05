/**
 * Preferences stores — accessibility flags and app settings.
 *
 * Both stores use versioned persisted() with schema migration.
 * Settings absorbs the legacy compound migration (wb_theme, wb_sound,
 * timer keys, wb_settings_v1, wb_unit_unlocks) that was previously
 * in boot.ts migrateLegacy().
 */

import { browser } from '$app/environment';
import type { A11yPrefs, AppSettings } from '$lib/core/types';
import { DEFAULT_A11Y_PREFS, DEFAULT_APP_SETTINGS } from '$lib/core/types';
import { persisted, type StoreSchema } from './persist.js';

// ─── Settings schema ─────────────────────────────────────────────────────────

const settingsSchema: StoreSchema<AppSettings> = {
  version: 1,
  migrate(raw: any, fromVersion: number): AppSettings {
    let base: Partial<AppSettings> = {};

    if (typeof raw === 'object' && raw !== null) {
      base = { ...raw };
    }

    // Compound legacy migration: read scattered vanilla keys
    if (fromVersion === 0 && browser) {
      try {
        const legacyTheme = localStorage.getItem('wb_theme');
        if (legacyTheme === 'light' || legacyTheme === 'dark') {
          base.theme = base.theme ?? legacyTheme;
        }

        const legacySound = localStorage.getItem('wb_sound');
        if (legacySound === 'off') base.sound = base.sound ?? 'off';

        const legacyLessonSecs = localStorage.getItem('wb_lesson_timer_secs');
        if (legacyLessonSecs) {
          const mins = Math.round(parseInt(legacyLessonSecs, 10) / 60);
          if (mins > 0 && !base.lessonTimerMins) base.lessonTimerMins = mins;
        }

        const legacyUnitSecs = localStorage.getItem('wb_unit_timer_secs');
        if (legacyUnitSecs) {
          const mins = Math.round(parseInt(legacyUnitSecs, 10) / 60);
          if (mins > 0 && !base.unitTimerMins) base.unitTimerMins = mins;
        }

        const legacyFinalSecs = localStorage.getItem('wb_final_timer_secs');
        if (legacyFinalSecs) {
          const mins = Math.round(parseInt(legacyFinalSecs, 10) / 60);
          if (mins > 0 && !base.finalTimerMins) base.finalTimerMins = mins;
        }

        try {
          const v1Raw = localStorage.getItem('wb_settings_v1');
          if (v1Raw) {
            const v1 = JSON.parse(v1Raw);
            if (v1.studentName && !base.studentName) base.studentName = v1.studentName;
          }
        } catch { /* skip */ }

        try {
          const unlockRaw = localStorage.getItem('wb_unit_unlocks');
          if (unlockRaw) {
            const arr = JSON.parse(unlockRaw);
            if (Array.isArray(arr) && arr.length > 0 && !base.freeMode) base.freeMode = true;
          }
        } catch { /* skip */ }

        // Clean up legacy keys
        for (const k of [
          'wb_theme', 'wb_sound', 'wb_lesson_timer_secs', 'wb_unit_timer_secs',
          'wb_final_timer_secs', 'wb_settings_v1', 'wb_unit_unlocks', 'wb_lesson_unlocks',
        ]) {
          localStorage.removeItem(k);
        }
      } catch { /* best effort */ }
    }

    // Apply timer-defaults fix (0 → defaults)
    const merged = { ...DEFAULT_APP_SETTINGS, ...base };
    if (merged.lessonTimerMins === 0) merged.lessonTimerMins = DEFAULT_APP_SETTINGS.lessonTimerMins;
    if (merged.unitTimerMins === 0) merged.unitTimerMins = DEFAULT_APP_SETTINGS.unitTimerMins;
    if (merged.finalTimerMins === 0) merged.finalTimerMins = DEFAULT_APP_SETTINGS.finalTimerMins;

    // Strip the old inline _v — envelope handles versioning now
    if ('_v' in merged) delete (merged as any)._v;

    return merged;
  },
};

// ─── A11y schema ──────────────────────────────────────────────────────────────

const a11ySchema: StoreSchema<A11yPrefs> = {
  version: 1,
  migrate(raw: any, _fromVersion: number): A11yPrefs {
    if (typeof raw !== 'object' || raw === null) return DEFAULT_A11Y_PREFS;
    return { ...DEFAULT_A11Y_PREFS, ...raw };
  },
};

// ─── Stores ───────────────────────────────────────────────────────────────────

export const a11y = persisted<A11yPrefs>('wb_a11y', DEFAULT_A11Y_PREFS, a11ySchema);

export const settings = persisted<AppSettings>('wb_settings_v2', DEFAULT_APP_SETTINGS, settingsSchema);
