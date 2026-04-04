/**
 * pwa.ts — PWA update detection helper.
 *
 * Uses the virtual module injected by vite-plugin-pwa to listen for
 * service worker update events and expose a reactive update-available flag.
 *
 * Usage:
 *   import { pwaUpdateAvailable, applyUpdate } from '$lib/pwa';
 *   // In layout: if ($pwaUpdateAvailable) show banner + call applyUpdate()
 */

import { writable } from 'svelte/store';

/** True when a new service worker version is waiting to activate. */
export const pwaUpdateAvailable = writable(false);

/** Trigger the SW update and reload. Populated after initPwa() runs. */
export let applyUpdate: () => Promise<void> = async () => {
  window.location.reload();
};

/**
 * Wire up the vite-plugin-pwa virtual module.
 * Call once from the root layout's onMount — safe to call multiple times.
 */
let registered = false;

export async function initPwa(): Promise<void> {
  if (registered || typeof window === 'undefined') return;
  registered = true;

  try {
    // vite-plugin-pwa injects this virtual module at build time.
    // In dev it's a no-op stub, so the dynamic import may not resolve —
    // that's expected and safely caught below.
    const { useRegisterSW } = await import('virtual:pwa-register/svelte');

    const { updateServiceWorker } = useRegisterSW({
      immediate: true,

      onRegistered(registration: ServiceWorkerRegistration | undefined) {
        // Periodically poll for updates every 60 minutes
        if (registration) {
          setInterval(() => registration.update(), 60 * 60 * 1000);

          // Also check on app resume (mobile may throttle background intervals).
          // Intentionally permanent — lives for the app lifetime alongside the SW registration.
          let lastCheck = Date.now();
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && Date.now() - lastCheck > 5 * 60 * 1000) {
              lastCheck = Date.now();
              registration.update();
            }
          });
        }
      },

      onNeedRefresh() {
        pwaUpdateAvailable.set(true);
      },

      onOfflineReady() {
        // App is ready for offline use — could surface a toast in Phase 8
      },
    });

    // Wire the store's update action to the plugin's update function
    applyUpdate = async () => {
      pwaUpdateAvailable.set(false);
      await updateServiceWorker(true);
    };

  } catch {
    // Dev mode: virtual module doesn't exist — silent no-op
  }
}
