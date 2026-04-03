<script lang="ts">
  import '../app.css';

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
  import { authUser, activeStudent, activeStudentId, familyProfiles, settings, guestMode } from '$lib/stores';
  import { mountSwipeBack } from '$lib/services/swipe';
  import { navStack, stackNavigate } from '$lib/services/navStack';
  import { isTutorialDone } from '$lib/services/tour';
  import { pullStudentData, pushStudentData } from '$lib/services/sync';

  // Show cog on student-facing screens (hidden on settings, login, dashboard, parent)
  const showCog = $derived(
    $page.url.pathname === '/' ||
    $page.url.pathname.startsWith('/unit/') ||
    $page.url.pathname.startsWith('/lesson/') ||
    $page.url.pathname.startsWith('/quiz/') ||
    $page.url.pathname === '/history'
  );
  import { getStudentProfiles } from '$lib/services/auth';
  import { initPwa, pwaUpdateAvailable, applyUpdate } from '$lib/pwa';
  import ProfilePicker from '$lib/components/auth/ProfilePicker.svelte';
  import TutorialOverlay from '$lib/components/tour/TutorialOverlay.svelte';
  import SpotlightTour from '$lib/components/tour/SpotlightTour.svelte';
  import type { AuthUser } from '$lib/types';

  let spotlightReady = $state(false);
  function onTutorialDone() {
    // Small delay so home screen can render before spotlight tour starts
    document.body.classList.add('spot-scroll-lock');
    setTimeout(() => {
      document.body.classList.remove('spot-scroll-lock');
      spotlightReady = true;
    }, 350);
  }

  let { children } = $props();

  const PUBLIC_ROUTES = ['/login', '/settings', '/history', '/privacy', '/terms', '/dashboard'];

  /** Apply a11y body classes from persisted localStorage. */
  function applyA11yClasses() {
    try {
      const cfg = JSON.parse(localStorage.getItem('wb_a11y') ?? '{}');
      document.body.classList.toggle('a11y-large-text',    !!cfg.largeText);
      document.body.classList.toggle('a11y-high-contrast', !!cfg.highContrast);
      document.body.classList.toggle('a11y-colorblind',    !!cfg.colorblind);
      document.body.classList.toggle('a11y-reduce-motion', !!cfg.reduceMotion);
      document.body.classList.toggle('a11y-text-select',   !!cfg.textSelect);
      document.body.classList.toggle('a11y-focus',         !!cfg.focus);
      document.body.classList.toggle('a11y-screenreader',  !!cfg.screenreader);
    } catch { /* no stored prefs */ }
  }

  onMount(() => {
    // Populate unitsData store with the 10 curriculum shells
    boot();

    // Apply accessibility classes from saved preferences
    applyA11yClasses();

    // Wire up PWA update detection
    initPwa();

    // Mount iOS-style swipe-back gesture
    const cleanupSwipe = mountSwipeBack();

    // Keep nav stack in sync when browser back/forward buttons are used
    function onPopState() {
      navStack.pop();
    }
    window.addEventListener('popstate', onPopState);

    // If tutorial already done, enable spotlight tours immediately
    if (isTutorialDone()) spotlightReady = true;

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
          guestMode.set(false);
          const { profiles } = await getStudentProfiles();
          familyProfiles.set(profiles);
          // Parent just authenticated — send straight to the dashboard
          navStack.clear();
          goto('/dashboard');
        }
      } else {
        authUser.set(null);
        familyProfiles.set([]);
      }
    });

    return () => { subscription.unsubscribe(); cleanupSwipe(); window.removeEventListener('popstate', onPopState); };
  });

  // Reactive guard: redirect when auth state changes
  $effect(() => {
    const currentPath = $page.url.pathname;
    const isPublic = PUBLIC_ROUTES.includes(currentPath);

    // Guest mode bypasses both guards — user clicked "Continue without an account"
    if ($guestMode) return;

    // Not signed in, no student selected, and not on a public route → go to login
    // (Student PIN login sets activeStudentId without a Supabase auth session)
    if (!$authUser && !$activeStudentId && !isPublic) {
      navStack.clear();
      goto('/login', { replaceState: true });
    }
    // Signed in but no student → ProfilePicker overlay is rendered below (no redirect needed)
  });

  // Pull student data from Supabase when active student changes
  let lastPulledId: string | null = null;
  $effect(() => {
    const sid = $activeStudentId;
    if (sid && sid !== lastPulledId && $authUser) {
      lastPulledId = sid;
      pullStudentData(sid).catch(() => {});
    }
  });

  // Push student data to Supabase when app is backgrounded/closed
  $effect(() => {
    if (!$activeStudentId || !$authUser) return;
    const handleVisChange = () => {
      if (document.visibilityState === 'hidden') {
        pushStudentData().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisChange);
    return () => document.removeEventListener('visibilitychange', handleVisChange);
  });

  // Dark mode: sync body.dark class to settings store
  $effect(() => {
    const theme = $settings.theme;
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else if (theme === 'light') {
      document.body.classList.remove('dark');
    } else {
      // 'auto' — follow system preference
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      document.body.classList.toggle('dark', mq.matches);
      const handler = (e: MediaQueryListEvent) => document.body.classList.toggle('dark', e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  });
</script>

{@render children()}

<!-- Global cog button — fixed position, visible on all screens (matches legacy) -->
{#if showCog}
  <button type="button" class="cog-btn" aria-label="Settings" onclick={() => stackNavigate('/settings')}>
    <span class="cog-ico">⚙️</span>
  </button>
{/if}

<!-- Profile Picker overlay — shown when signed in but no student is selected -->
{#if $authUser && !$activeStudent && !$guestMode && !$page.url.pathname.startsWith('/dashboard')}
  <ProfilePicker />
{/if}

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

<!-- Tutorial overlay (first launch only) -->
<TutorialOverlay onDone={onTutorialDone} currentPath={$page.url.pathname} />

<!-- Spotlight tour (per-screen, after tutorial is complete) -->
{#if spotlightReady}
  <SpotlightTour />
{/if}

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: 'Nunito', sans-serif;
    font-size: 18px;
    background-color: #eafaf2;
    color: var(--txt, #1a2535);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  :global(:root) {
    /* ── Original design tokens (mirrors src/styles.css) ───────────── */
    --bg:    #e4eeff;
    --bg2:   #ffffff;
    --bg3:   #eef3ff;
    --bg4:   #f4f7ff;
    --txt:   #1a2535;
    --txt2:  #5a7080;
    --txt3:  #3d4f60;
    --border:  rgba(0,0,0,.11);
    --border2: rgba(0,0,0,.16);
    --inp-border: rgba(0,0,0,.13);

    /* Gradient background — matches production light mode exactly */
    --home-grad: linear-gradient(155deg,#f9fcff 0%,#eef7ff 45%,#eafaf2 100%);

    /* Tiled math-symbol pattern (420×420 SVG, rendered as CSS background-image) */
    --app-bg-svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='420'%3E%3Ccircle cx='30' cy='30' r='22' fill='%23e74c3c' opacity='.24'/%3E%3Ctext x='30' y='30' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='20' fill='%23e74c3c' opacity='.34'%3E%2B%3C/text%3E%3Ccircle cx='110' cy='20' r='16' fill='%23f1c40f' opacity='.24'/%3E%3Ctext x='110' y='20' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='16' fill='%23f1c40f' opacity='.34'%3E7%3C/text%3E%3Crect x='185' y='8' width='40' height='40' rx='10' fill='%234a90d9' opacity='.24'/%3E%3Ctext x='205' y='28' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='22' fill='%234a90d9' opacity='.34'%3E%C3%97%3C/text%3E%3Ccircle cx='295' cy='25' r='20' fill='%2327ae60' opacity='.24'/%3E%3Ctext x='295' y='25' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='14' fill='%2327ae60' opacity='.34'%3E12%3C/text%3E%3Ccircle cx='380' cy='35' r='18' fill='%238e44ad' opacity='.24'/%3E%3Ctext x='380' y='35' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='18' fill='%238e44ad' opacity='.34'%3E%C3%B7%3C/text%3E%3Ccircle cx='60' cy='105' r='18' fill='%23e67e22' opacity='.24'/%3E%3Ctext x='60' y='105' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='16' fill='%23e67e22' opacity='.34'%3E%C2%BD%3C/text%3E%3Ccircle cx='160' cy='95' r='22' fill='%231abc9c' opacity='.24'/%3E%3Ctext x='160' y='95' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='20' fill='%231abc9c' opacity='.34'%3E%3D%3C/text%3E%3Ccircle cx='250' cy='110' r='20' fill='%23e74c3c' opacity='.24'/%3E%3Ctext x='250' y='110' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='18' fill='%23e74c3c' opacity='.34'%3E5%3C/text%3E%3Crect x='320' y='88' width='38' height='38' rx='10' fill='%23f1c40f' opacity='.24'/%3E%3Ctext x='339' y='107' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='20' fill='%23f1c40f' opacity='.34'%3E%E2%98%85%3C/text%3E%3Ccircle cx='20' cy='195' r='20' fill='%234a90d9' opacity='.24'/%3E%3Ctext x='20' y='195' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='18' fill='%234a90d9' opacity='.34'%3E3%3C/text%3E%3Ccircle cx='120' cy='185' r='16' fill='%2327ae60' opacity='.24'/%3E%3Ctext x='120' y='185' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='16' fill='%2327ae60' opacity='.34'%3E%2B%3C/text%3E%3Ccircle cx='210' cy='200' r='22' fill='%238e44ad' opacity='.24'/%3E%3Ctext x='210' y='200' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='14' fill='%238e44ad' opacity='.34'%3E10%3C/text%3E%3Ccircle cx='310' cy='190' r='18' fill='%23e67e22' opacity='.24'/%3E%3Ctext x='310' y='190' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='18' fill='%23e67e22' opacity='.34'%3E%E2%88%92%3C/text%3E%3Ccircle cx='395' cy='200' r='16' fill='%231abc9c' opacity='.24'/%3E%3Ctext x='395' y='200' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='14' fill='%231abc9c' opacity='.34'%3E%C2%BC%3C/text%3E%3Ccircle cx='55' cy='290' r='20' fill='%23e74c3c' opacity='.24'/%3E%3Ctext x='55' y='290' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='18' fill='%23e74c3c' opacity='.34'%3E8%3C/text%3E%3Crect x='145' y='272' width='36' height='36' rx='9' fill='%234a90d9' opacity='.24'/%3E%3Ctext x='163' y='290' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='20' fill='%234a90d9' opacity='.34'%3E%C3%97%3C/text%3E%3Ccircle cx='255' cy='285' r='20' fill='%23f1c40f' opacity='.24'/%3E%3Ctext x='255' y='285' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='16' fill='%23f1c40f' opacity='.34'%3E6%3C/text%3E%3Ccircle cx='350' cy='295' r='18' fill='%2327ae60' opacity='.24'/%3E%3Ctext x='350' y='295' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='18' fill='%2327ae60' opacity='.34'%3E%3D%3C/text%3E%3Ccircle cx='30' cy='385' r='18' fill='%238e44ad' opacity='.24'/%3E%3Ctext x='30' y='385' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='16' fill='%238e44ad' opacity='.34'%3E9%3C/text%3E%3Ccircle cx='130' cy='378' r='22' fill='%23e67e22' opacity='.24'/%3E%3Ctext x='130' y='378' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='20' fill='%23e67e22' opacity='.34'%3E%C3%B7%3C/text%3E%3Ccircle cx='230' cy='390' r='16' fill='%231abc9c' opacity='.24'/%3E%3Ctext x='230' y='390' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='14' fill='%231abc9c' opacity='.34'%3E%C2%BD%3C/text%3E%3Ccircle cx='320' cy='380' r='20' fill='%23e74c3c' opacity='.24'/%3E%3Ctext x='320' y='380' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='18' fill='%23e74c3c' opacity='.34'%3E2%3C/text%3E%3Ccircle cx='400' cy='390' r='16' fill='%234a90d9' opacity='.24'/%3E%3Ctext x='400' y='390' text-anchor='middle' dominant-baseline='central' font-family='Arial' font-size='16' fill='%234a90d9' opacity='.34'%3E%2B%3C/text%3E%3C/svg%3E");

    /* ── Accent / brand colours ─────────────────────────────────────── */
    --color-primary: #4a90d9;
    --color-success: #27ae60;
    --color-error:   #e74c3c;

    /* ── Font-size scale (matches original --fs-* tokens) ───────────── */
    --fs-xs:   0.72rem;
    --fs-sm:   0.85rem;
    --fs-base: 0.95rem;
    --fs-md:   1.1rem;
    --fs-lg:   1.3rem;
    --fs-xl:   1.6rem;
    --fs-2xl:  2rem;
    --fs-3xl:  2.5rem;
    --fs-4xl:  3.2rem;
    --fs-5xl:  4.5rem;

    /* ── Safe-area insets for notched iOS devices ────────────────────── */
    --safe-top:    env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left:   env(safe-area-inset-left, 0px);
    --safe-right:  env(safe-area-inset-right, 0px);
  }

  /* Full-screen route background — math symbols tiled over gradient */
  :global(.sc) {
    min-height: 100dvh;
    background-image: var(--app-bg-svg), var(--home-grad);
    background-size: 420px 420px, 100% 100%;
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
