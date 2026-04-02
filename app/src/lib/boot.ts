/**
 * boot.ts — App initializer.
 *
 * Call once from the root layout on mount. Populates the unitsData store
 * with the 10 unit shells so the home screen can render immediately.
 * Lesson content is lazy-loaded per unit on demand.
 */

import { unitsData } from '$lib/stores/content';
import { UNIT_SHELLS } from '$lib/data/shared';
import type { Unit } from '$lib/types';

let booted = false;

export function boot(): void {
  if (booted) return;
  booted = true;

  const units: Unit[] = UNIT_SHELLS.map((shell) => ({
    ...shell,
    _loaded: false,
  }));

  unitsData.set(units);
}

/**
 * Lazy-load a unit's full lesson content.
 * Imports the pre-converted TypeScript data file and merges it into the store.
 */
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

  // Dynamic import — Vite will code-split each unit file
  const mod = await import(`$lib/data/u${idx + 1}.ts`);

  const { mergeUnitContent } = await import('$lib/stores/content');
  mergeUnitContent(idx, mod.lessons, mod.unitQuiz, mod.testBank);
}
