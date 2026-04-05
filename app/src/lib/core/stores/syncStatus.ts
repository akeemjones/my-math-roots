/**
 * syncStatus — reactive store for surfacing sync/storage failures to the UI.
 *
 * Extracted into its own module to avoid circular dependencies:
 *   persist.ts → syncStatus.ts (no cycle)
 *   progress.ts → persist.ts (no cycle)
 *   Both can safely import syncStatus without creating a loop.
 */

import { writable } from 'svelte/store';

export const syncStatus = writable<'idle' | 'syncing' | 'success' | 'error'>('idle');
