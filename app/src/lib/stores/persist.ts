/**
 * persisted() — a writable store that automatically syncs to localStorage.
 *
 * Usage:
 *   export const scores = persisted<ScoreEntry[]>('wb_sc5', []);
 *
 * - On first load: reads from localStorage (falls back to initialValue).
 * - On every write: serialises to localStorage.
 * - SSR-safe: no localStorage access during server-side rendering.
 *
 * Supabase sync is intentionally NOT wired here. Each store that needs
 * cloud sync will have a dedicated pull/push function (Phase 3+).
 */

import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { syncStatus } from './syncStatus.js';

export function persisted<T>(key: string, initialValue: T): Writable<T> {
  let initial = initialValue;

  if (browser) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) initial = JSON.parse(raw) as T;
    } catch (e) {
      // Corrupted entry — start fresh.
      console.error('[persist] Corrupted key "' + key + '":', e);
      localStorage.removeItem(key);
    }
  }

  const store = writable<T>(initial);

  if (browser) {
    // Intentionally not capturing unsubscribe — stores are singletons that
    // live for the entire app lifetime. Minor HMR dev leak cleaned on reload.
    store.subscribe((value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('[persist] localStorage write failed (quota exceeded?):', e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          syncStatus.set('error');
        }
      }
    });
  }

  return store;
}
