/**
 * persisted() — a writable store that automatically syncs to localStorage.
 *
 * Usage (unversioned — backward compatible):
 *   export const guestMode = persisted<boolean>('mmr_guest_mode', false);
 *
 * Usage (versioned — with schema migration):
 *   export const mastery = persisted<MasteryMap>('wb_mastery', {}, {
 *     version: 1,
 *     migrate: (raw, fromVersion) => { ... return cleaned; },
 *   });
 *
 * Versioned stores wrap data in a Universal Envelope: { _v: number, data: T }.
 * On read, the factory detects the stored version, runs migrations if stale,
 * and re-envelopes. If migration fails, the key is wiped and the store
 * initializes with the default value.
 */

import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { syncStatus } from './syncStatus.js';

/** Schema definition for a versioned persisted store. */
export interface StoreSchema<T> {
  /** Current schema version. Monotonically increasing integer starting at 1. */
  version: number;
  /**
   * Transform data from fromVersion to current version.
   * Called when stored _v < version. Must handle fromVersion 0 (un-enveloped legacy data).
   */
  migrate: (raw: any, fromVersion: number) => T;
  /** Optional legacy localStorage key. If the primary key is empty, this key is checked and deleted after import. */
  legacyKey?: string;
}

/** The envelope shape stored in localStorage for versioned stores. */
interface Envelope<T> {
  _v: number;
  data: T;
}

/** Type guard: is this object shaped like { _v, data }? */
function isEnvelope(obj: any): obj is Envelope<unknown> {
  return obj !== null && typeof obj === 'object' && '_v' in obj && 'data' in obj;
}

export function persisted<T>(key: string, initialValue: T, schema?: StoreSchema<T>): Writable<T> {
  let initial = initialValue;

  if (browser) {
    if (schema) {
      initial = readVersioned(key, initialValue, schema);
    } else {
      // Unversioned path — original behavior
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) initial = JSON.parse(raw) as T;
      } catch (e) {
        console.error('[persist] Corrupted key "' + key + '":', e);
        localStorage.removeItem(key);
      }
    }
  }

  const store = writable<T>(initial);

  if (browser) {
    store.subscribe((value) => {
      try {
        if (schema) {
          // Always write the envelope for versioned stores
          const envelope: Envelope<T> = { _v: schema.version, data: value };
          localStorage.setItem(key, JSON.stringify(envelope));
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
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

/**
 * Read and migrate a versioned store from localStorage.
 * Returns the migrated value, or initialValue if nothing found / migration fails.
 */
function readVersioned<T>(key: string, initialValue: T, schema: StoreSchema<T>): T {
  try {
    let payload: any = undefined;
    let version = 0;

    // Step 1: Try to read the primary key
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);

      if (isEnvelope(parsed)) {
        // Universal envelope: { _v, data }
        version = parsed._v;
        payload = parsed.data;
      } else if (parsed !== null && typeof parsed === 'object' && '_v' in parsed) {
        // Inline legacy (settings): has _v but no data property
        version = parsed._v;
        const { _v, ...rest } = parsed;
        payload = rest;
      } else {
        // Un-enveloped legacy data
        version = 0;
        payload = parsed;
      }
    } else if (schema.legacyKey) {
      // Step 2: Primary key empty — check legacy key
      const legacyRaw = localStorage.getItem(schema.legacyKey);
      if (legacyRaw !== null) {
        payload = JSON.parse(legacyRaw);
        version = 0;
        localStorage.removeItem(schema.legacyKey);
      }
    }

    // Nothing found anywhere — use default
    if (payload === undefined) return initialValue;

    // Step 3: Run migration if needed
    let value: T;
    if (version < schema.version) {
      value = schema.migrate(payload, version);
    } else {
      value = payload as T;
    }

    // Step 4: Write back the envelope
    const envelope: Envelope<T> = { _v: schema.version, data: value };
    localStorage.setItem(key, JSON.stringify(envelope));

    return value;
  } catch (e) {
    console.warn(`[persist] Migration failed for "${key}", resetting to default:`, e);
    localStorage.removeItem(key);
    return initialValue;
  }
}
