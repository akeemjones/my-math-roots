/**
 * boot.ts — App initializer.
 *
 * Call once from the root layout on mount. Populates the unitsData store
 * with the 10 unit shells so the home screen can render immediately.
 * Lesson content is lazy-loaded per unit on demand.
 *
 * All localStorage migration is handled by the versioned persisted() factory.
 * Importing the stores barrel ensures every store module evaluates at boot,
 * triggering eager migration before the UI renders.
 */

import { unitsData } from '$lib/stores/content';
import { UNIT_SHELLS } from '$lib/data/shared';
import type { Unit } from '$lib/types';

// Barrel import — ensures all store modules evaluate (triggers versioned migrations)
import '$lib/stores';

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
