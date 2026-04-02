/**
 * Content store — UNITS_DATA replacement.
 *
 * Replaces the global: declare const UNITS_DATA: Unit[]
 *
 * Units are loaded lazily. The store starts with the 10 unit shells
 * (id, name, icon, svg, color, lessons[]) and each unit's _loaded flag
 * is false until loadUnit(idx) is called.
 *
 * Supabase sync: not applicable (content is static data files).
 * Offline: content is bundled — no network required after first load.
 */

import { writable, derived } from 'svelte/store';
import type { Unit } from '$lib/types';

/** All 10 unit shells. Populated once by boot.ts (Phase 3). */
export const unitsData = writable<Unit[]>([]);

/**
 * Returns the unit at the given index, or undefined.
 * Convenience for components that only need one unit.
 */
export const activeUnit = derived(
  unitsData,
  ($units) => (idx: number) => $units[idx] ?? null
);

/**
 * Mark a unit as loaded and merge in its full lesson content.
 * Called by the lazy-loader after the data file import resolves.
 */
export function mergeUnitContent(
  unitIdx: number,
  lessonContents: Unit['lessons'],
  unitQuiz?: Unit['unitQuiz'],
  testBank?: Unit['testBank']
): void {
  unitsData.update((units) => {
    const unit = units[unitIdx];
    if (!unit) return units;

    const updated = [...units];
    updated[unitIdx] = {
      ...unit,
      _loaded: true,
      unitQuiz: unitQuiz ?? unit.unitQuiz,
      testBank: testBank ?? unit.testBank,
      lessons: unit.lessons.map((shell, i) => ({
        ...shell,
        ...(lessonContents[i] ?? {}),
      })),
    };
    return updated;
  });
}
