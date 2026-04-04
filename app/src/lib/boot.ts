/**
 * boot.ts — App initializer.
 *
 * Call once from the root layout on mount. Populates the unitsData store
 * with the 10 unit shells so the home screen can render immediately.
 * Lesson content is lazy-loaded per unit on demand.
 *
 * Also runs a one-time migration of legacy localStorage keys so that
 * existing users' data (scores, settings, theme, sound, timers, unlocks)
 * carries over seamlessly from the vanilla build.
 */

import { browser } from '$app/environment';
import { unitsData } from '$lib/stores/content';
import { UNIT_SHELLS } from '$lib/data/shared';
import { scores } from '$lib/stores/quiz';
import { settings } from '$lib/stores/prefs';
import { get } from 'svelte/store';
import type { Unit, ScoreEntry, AppSettings } from '$lib/types';

let booted = false;

export function boot(): void {
  if (booted) return;
  booted = true;

  const units: Unit[] = UNIT_SHELLS.map((shell) => ({
    ...shell,
    _loaded: false,
  }));

  unitsData.set(units);

  if (browser) migrateLegacy();
}

// ── Legacy data migration ──────────────────────────────────────────────────

const MIGRATION_FLAG = 'mmr_migrated_v6';

/**
 * One-time migration of legacy localStorage keys from the vanilla build.
 * Runs only once — sets a flag so it never re-runs.
 *
 * Migrates:
 *  1. Scores: wb_sc5 (signed envelope {d,s}) → wb_sc5_v2 (plain array)
 *  2. Settings: wb_theme, wb_sound, wb_quiz_timer, timer keys → wb_settings_v2
 *  3. Unlocks: wb_unit_unlocks, wb_lesson_unlocks → wb_settings_v2.freeMode
 */
function migrateLegacy(): void {
  if (!browser) return;
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  let didMigrate = false;

  // ── 1. Scores: unwrap signed envelope ──────────────────────────────────
  try {
    const currentScores = get(scores);
    if (currentScores.length === 0) {
      const raw = localStorage.getItem('wb_sc5');
      if (raw) {
        const parsed = JSON.parse(raw);
        let legacyScores: ScoreEntry[] = [];

        if (parsed && typeof parsed.d === 'string') {
          // Signed format: { d: "JSON string", s: "hash" }
          legacyScores = JSON.parse(parsed.d);
        } else if (Array.isArray(parsed)) {
          // Plain array (very old format)
          legacyScores = parsed;
        }

        if (Array.isArray(legacyScores) && legacyScores.length > 0) {
          // Validate entries have required fields
          const valid = legacyScores.filter(
            (e: any) => e && typeof e === 'object' && 'qid' in e && 'pct' in e
          );
          if (valid.length > 0) {
            scores.set(valid);
            didMigrate = true;
          }
        }
      }
    }
  } catch { /* corrupted — skip */ }

  // ── 2. Settings: consolidate legacy split keys ─────────────────────────
  try {
    const currentSettings = get(settings);
    const patch: Partial<AppSettings> = {};

    // Theme
    const legacyTheme = localStorage.getItem('wb_theme');
    if (legacyTheme && (legacyTheme === 'light' || legacyTheme === 'dark')) {
      if (currentSettings.theme === 'auto') {
        patch.theme = legacyTheme;
        didMigrate = true;
      }
    }

    // Sound
    const legacySound = localStorage.getItem('wb_sound');
    if (legacySound === 'off' && currentSettings.sound === 'on') {
      patch.sound = 'off';
      didMigrate = true;
    }

    // Timer: lesson (legacy stores seconds, SvelteKit stores minutes)
    const legacyLessonSecs = localStorage.getItem('wb_lesson_timer_secs');
    if (legacyLessonSecs) {
      const mins = Math.round(parseInt(legacyLessonSecs, 10) / 60);
      if (mins > 0 && currentSettings.lessonTimerMins === 8) {
        patch.lessonTimerMins = mins;
        didMigrate = true;
      }
    }

    // Timer: unit
    const legacyUnitSecs = localStorage.getItem('wb_unit_timer_secs');
    if (legacyUnitSecs) {
      const mins = Math.round(parseInt(legacyUnitSecs, 10) / 60);
      if (mins > 0 && currentSettings.unitTimerMins === 30) {
        patch.unitTimerMins = mins;
        didMigrate = true;
      }
    }

    // Timer: final
    const legacyFinalSecs = localStorage.getItem('wb_final_timer_secs');
    if (legacyFinalSecs) {
      const mins = Math.round(parseInt(legacyFinalSecs, 10) / 60);
      if (mins > 0 && currentSettings.finalTimerMins === 60) {
        patch.finalTimerMins = mins;
        didMigrate = true;
      }
    }

    // Student name
    try {
      const legacySettingsV1 = localStorage.getItem('wb_settings_v1');
      if (legacySettingsV1) {
        const v1 = JSON.parse(legacySettingsV1);
        if (v1.studentName && !currentSettings.studentName) {
          patch.studentName = v1.studentName;
          didMigrate = true;
        }
      }
    } catch { /* skip */ }

    // Unlocks → freeMode
    try {
      const legacyUnitUnlocks = localStorage.getItem('wb_unit_unlocks');
      if (legacyUnitUnlocks) {
        const arr = JSON.parse(legacyUnitUnlocks);
        if (Array.isArray(arr) && arr.length > 0 && !currentSettings.freeMode) {
          patch.freeMode = true;
          didMigrate = true;
        }
      }
    } catch { /* skip */ }

    if (Object.keys(patch).length > 0) {
      settings.set({ ...currentSettings, ...patch });
    }
  } catch { /* corrupted — skip */ }

  // ── 3. Mark migration complete ─────────────────────────────────────────
  // Always set flag — even if nothing was migrated, we don't want to re-check
  localStorage.setItem(MIGRATION_FLAG, '1');

  if (didMigrate) {
    console.log('[boot] Legacy data migrated to SvelteKit stores');
  }
}

/**
 * Lazy-load a unit's full lesson content.
 * Uses import.meta.glob so Vite statically discovers all unit data files
 * and creates proper chunks for each one.
 */
const unitLoaders = import.meta.glob('./data/u*.ts') as Record<string, () => Promise<any>>;

export async function loadUnit(unitId: string): Promise<void> {
  const idx = parseInt(unitId.replace('u', ''), 10) - 1;
  if (isNaN(idx) || idx < 0 || idx > 9) return;

  // Check if already loaded
  let alreadyLoaded = false;
  unitsData.update((units) => {
    alreadyLoaded = units[idx]?._loaded ?? false;
    return units;
  });
  if (alreadyLoaded) return;

  const loader = unitLoaders[`./data/u${idx + 1}.ts`];
  if (!loader) return;

  const mod = await loader();
  const { mergeUnitContent } = await import('$lib/stores/content');
  mergeUnitContent(idx, mod.lessons, mod.unitQuiz, mod.testBank);
}
