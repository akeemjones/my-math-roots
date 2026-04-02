<script lang="ts">
  /**
   * Root layout — auth guard.
   *
   * On every navigation:
   *  - Restores the Supabase session from storage.
   *  - If no parent is signed in and the route isn't public, redirects to /login.
   *  - If a parent is signed in but no student is selected and route isn't /select,
   *    redirects to /select.
   *
   * Public routes (no auth required): /login
   * Student-selection route: /select
   */

  import { onMount } from 'svelte';
  import { boot } from '$lib/boot';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabase';
  import { authUser, activeStudent, familyProfiles } from '$lib/stores';
  import { getStudentProfiles } from '$lib/services/auth';
  import { initPwa, pwaUpdateAvailable, applyUpdate } from '$lib/pwa';
  import type { AuthUser } from '$lib/types';

  let { children } = $props();

  const PUBLIC_ROUTES = ['/login'];
  const SELECT_ROUTE = '/select';

  onMount(() => {
    // Populate unitsData store with the 10 curriculum shells
    boot();

    // Wire up PWA update detection
    initPwa();

    // Restore existing session on first load
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session?.user) {
        const u = session.user;
        authUser.set({
          id: u.id,
          email: u.email ?? '',
        } satisfies AuthUser);

        // Pre-load student profiles into the store
        const { profiles } = await getStudentProfiles();
        familyProfiles.set(profiles);
      }
    });

    // Keep the store in sync as Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        authUser.set({
          id: u.id,
          email: u.email ?? '',
        } satisfies AuthUser);

        if (event === 'SIGNED_IN') {
          const { profiles } = await getStudentProfiles();
          familyProfiles.set(profiles);
        }
      } else {
        authUser.set(null);
        familyProfiles.set([]);
      }
    });

    return () => subscription.unsubscribe();
  });

  // Reactive guard: redirect when auth state changes
  $effect(() => {
    const currentPath = $page.url.pathname;
    const isPublic = PUBLIC_ROUTES.includes(currentPath);
    const isSelect = currentPath === SELECT_ROUTE;

    if (!$authUser && !isPublic) {
      goto('/login', { replaceState: true });
      return;
    }

    if ($authUser && !$activeStudent && !isSelect && !isPublic) {
      goto('/select', { replaceState: true });
    }
  });
</script>

{@render children()}

<!-- PWA update banner — shown when a new SW version is waiting -->
{#if $pwaUpdateAvailable}
  <div class="pwa-banner" role="alert">
    <span>📲 A new version is ready!</span>
    <button type="button" class="pwa-update-btn" onclick={applyUpdate}>
      Update now
    </button>
    <button
      type="button"
      class="pwa-dismiss-btn"
      aria-label="Dismiss update notification"
      onclick={() => pwaUpdateAvailable.set(false)}
    >
      ✕
    </button>
  </div>
{/if}

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--color-bg, #f0f2f5);
    color: var(--color-text, #2d3436);
    -webkit-font-smoothing: antialiased;
  }

  :global(:root) {
    --color-primary: #6c5ce7;
    --color-primary-light: #e8e3ff;
    --color-bg: #f0f2f5;
    --color-surface: #ffffff;
    --color-surface-alt: #f8f9fa;
    --color-text: #2d3436;
    --color-text-muted: #636e72;
    --color-border: #dfe6e9;
    --color-error: #d63031;
    --color-success: #00b894;
    /* Safe-area insets for notched iOS devices */
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left: env(safe-area-inset-left, 0px);
    --safe-right: env(safe-area-inset-right, 0px);
  }

  /* PWA update banner */
  .pwa-banner {
    position: fixed;
    bottom: calc(1rem + var(--safe-bottom));
    left: 1rem;
    right: 1rem;
    background: #2d3436;
    color: #fff;
    border-radius: 0.875rem;
    padding: 0.875rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    z-index: 9999;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .pwa-banner span { flex: 1; }

  .pwa-update-btn {
    background: #6c5ce7;
    color: #fff;
    border: none;
    border-radius: 0.5rem;
    padding: 0.4rem 0.875rem;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
  }

  .pwa-dismiss-btn {
    background: none;
    border: none;
    color: rgba(255,255,255,0.6);
    font-size: 1rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }
</style>
