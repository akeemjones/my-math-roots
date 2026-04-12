<script lang="ts">
  import '$lib/theme/theme.css';

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
  import { boot } from '$lib/core/boot';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { supabase } from '$lib/core/supabase';
  import { authUser, activeStudent, activeStudentId, familyProfiles, settings, guestMode, initialPullDone, syncStatus, pinSession } from '$lib/core/stores';
  import { mountSwipeBack } from '$lib/ui/services/swipe';
  import { navStack, stackNavigate } from '$lib/ui/services/navStack';
  import { isTutorialDone, isInstallSeen } from '$lib/ui/services/tour';
  import { pullStudentData, pushStudentData, subscribeUnlockSettings, refreshUnlockSettings } from '$lib/core/services/sync';

  import { getStudentProfiles } from '$lib/core/services/auth';
  import { initPwa, pwaUpdateAvailable, applyUpdate } from '$lib/core/pwa';
  import ProfilePicker from '$lib/ui/components/auth/ProfilePicker.svelte';
  import TutorialOverlay from '$lib/ui/components/tour/TutorialOverlay.svelte';
  import SpotlightTour from '$lib/ui/components/tour/SpotlightTour.svelte';
  import InstallModal from '$lib/ui/components/tour/InstallModal.svelte';
  import type { AuthUser } from '$lib/core/types';

  // ── Onboarding flow: install → tutorial → spotlight (matches legacy tutCheckAndShow) ──
  // showInstallModal: true when the install popup should show as part of onboarding
  let showInstallModal = $state(false);
  let spotlightReady = $state(false);

  // Check if we should show install modal on first home visit
  $effect(() => {
    if ($page.url.pathname === '/' && $initialPullDone && !isInstallSeen() && !showInstallModal) {
      showInstallModal = true;
    }
  });

  function onInstallClosed() {
    // Matches legacy closeInstall: if first time, fire tutorial next; else unlock body
    showInstallModal = false;
    // Tutorial will auto-fire via TutorialOverlay's $effect if not done yet
  }

  function onTutorialDone() {
    // Small delay so home screen can render before spotlight tour starts
    document.body.classList.add('spot-scroll-lock');
    setTimeout(() => {
      document.body.classList.remove('spot-scroll-lock');
      spotlightReady = true;
    }, 350);
  }

  let { children } = $props();

  /**
   * Session restoration gate — starts false, becomes true once onMount
   * has finished restoring the Supabase session (or failed/timed out).
   * The auth guard $effect skips redirect while this is false, preventing
   * the flash-to-login race on iOS force-close restart.
   */
  let sessionReady = $state(false);

  const PUBLIC_ROUTES = ['/login', '/settings', '/history', '/privacy', '/terms', '/dashboard'];

  /** Apply a11y body classes from persisted localStorage. */
  function applyA11yClasses() {
    try {
      const raw = JSON.parse(localStorage.getItem('wb_a11y') ?? '{}');
      // wb_a11y is stored as { _v, data: {...} } after Track 2B versioning
      const cfg = (raw?._v !== undefined && raw?.data) ? raw.data : raw;
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

    // If tutorial already done AND pull is complete, enable spotlight tours.
    // (Moved to $effect below so it reacts to initialPullDone changes.)

    // Restore existing session on first load.
    // Sets authUser synchronously from cached session — profiles are loaded
    // below via onAuthStateChange INITIAL_SESSION to avoid duplicate fetches.
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user) {
        const u = session.user;
        authUser.set({
          id: u.id,
          email: u.email ?? '',
        } satisfies AuthUser);
      } else {
        // No valid Supabase session — clear the cached auth user.
        // Do NOT clear familyProfiles here: PIN-only students have no
        // Supabase session but their profiles are persisted in localStorage.
        authUser.set(null);
      }
      sessionReady = true;
    }).catch(() => {
      // Network error (offline) — trust cached localStorage state.
      // authUser and familyProfiles remain from their persisted values.
      sessionReady = true;
    });

    // Track whether profiles have been fetched this session to avoid
    // duplicate network calls when both INITIAL_SESSION and SIGNED_IN fire
    // (e.g. Google OAuth redirect on iOS where the token exchange timing
    // causes both events to carry a valid session).
    let profilesFetched = false;

    // Keep the store in sync as Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        authUser.set({
          id: u.id,
          email: u.email ?? '',
        } satisfies AuthUser);

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (!profilesFetched) {
            profilesFetched = true;
            // Pass u.id directly to skip the extra supabase.auth.getUser()
            // network call inside getStudentProfiles() — saves one RTT on iOS.
            const { profiles } = await getStudentProfiles(u.id);
            familyProfiles.set(profiles);
          }
          if (event === 'SIGNED_IN') {
            // Parent just authenticated — send straight to the dashboard
            guestMode.set(false);
            navStack.clear();
            goto('/dashboard');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // Only clear on explicit sign-out, NOT on INITIAL_SESSION with null
        // session. PIN-only students never have a Supabase session, so
        // INITIAL_SESSION always arrives with session=null for them — blindly
        // clearing here would wipe their persisted familyProfiles.
        authUser.set(null);
        familyProfiles.set([]);
        profilesFetched = false;
      }
    });

    return () => { subscription.unsubscribe(); cleanupSwipe(); window.removeEventListener('popstate', onPopState); };
  });

  // Reactive guard: redirect when auth state changes.
  // Gated on sessionReady so we don't redirect before the Supabase session
  // has been restored from localStorage (prevents iOS force-close flash-to-login).
  $effect(() => {
    if (!sessionReady) return;

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

    // PIN-only session hardening: if activeStudentId is set but there's no
    // auth user and no valid PIN session token, clear the student and redirect.
    // This prevents the sibling bypass where editing mmr_active_student in
    // localStorage would grant access without knowing the PIN.
    if (!$authUser && $activeStudentId && !$guestMode) {
      if (!$pinSession?.token || $pinSession.studentId !== $activeStudentId) {
        activeStudentId.set(null);
        pinSession.set(null);
        if (!isPublic) {
          navStack.clear();
          goto('/login', { replaceState: true });
        }
      }
    }
    // Signed in but no student → ProfilePicker overlay is rendered below (no redirect needed)
  });

  // Pull student data + subscribe to Realtime unlock changes when active student changes
  let lastPulledId: string | null = null;
  $effect(() => {
    const sid = $activeStudentId;
    // Reset on sign-out so re-login triggers a fresh pull
    if (!sid) { lastPulledId = null; return; }
    if (sid === lastPulledId) return;
    lastPulledId = sid;
    pullStudentData(sid).catch(() => {});

    // Subscribe to live unlock_settings changes (parent toggles on dashboard)
    const unsubRealtime = subscribeUnlockSettings(sid);
    return () => { unsubRealtime(); };
  });

  // Push student data on background + refresh unlock_settings on foreground
  $effect(() => {
    const sid = $activeStudentId;
    if (!sid) return;
    const handleVisChange = () => {
      if (document.visibilityState === 'hidden') {
        pushStudentData().catch(() => {});
      } else if (document.visibilityState === 'visible') {
        // Catch up on any changes missed while Realtime was suspended
        refreshUnlockSettings(sid).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisChange);
    return () => document.removeEventListener('visibilitychange', handleVisChange);
  });

  // Enable spotlight tours once pull completes and both install + tutorial are done
  $effect(() => {
    if ($initialPullDone && isInstallSeen() && isTutorialDone() && !spotlightReady) {
      spotlightReady = true;
    }
  });

  // Dark mode: sync body.dark + html.dark class to settings store.
  // html.dark is needed so the root-element background (canvas) picks up the dark gradient.
  function setDark(dark: boolean) {
    document.body.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('dark', dark);
  }

  $effect(() => {
    const theme = $settings.theme;
    if (theme === 'dark') {
      setDark(true);
    } else if (theme === 'light') {
      setDark(false);
    } else {
      // 'auto' — follow system preference
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setDark(mq.matches);
      const handler = (e: MediaQueryListEvent) => setDark(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  });
</script>

{@render children()}

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

<!-- Sync error banner — shown when data failed to save to cloud -->
{#if $syncStatus === 'error'}
  <div class="sync-banner" role="alert">
    <span>Your progress may not be saved. Check your connection.</span>
    <button type="button" class="sync-retry-btn" onclick={() => pushStudentData().catch(() => {})}>
      Retry
    </button>
    <button
      type="button"
      class="pwa-dismiss-btn"
      aria-label="Dismiss sync error"
      onclick={() => syncStatus.set('idle')}
    >
      ✕
    </button>
  </div>
{/if}

<!-- Install modal — shown first time on home screen (legacy tutCheckAndShow flow) -->
{#if showInstallModal}
  <InstallModal onClose={onInstallClosed} />
{/if}

<!-- Tutorial overlay (first launch only, after install modal is dismissed) -->
{#if !showInstallModal}
  <TutorialOverlay onDone={onTutorialDone} currentPath={$page.url.pathname} />
{/if}

<!-- Spotlight tour (per-screen, after install + tutorial are complete) -->
{#if spotlightReady}
  <SpotlightTour />
{/if}

<style>
  /* ── Global rules moved to $lib/theme/ ──
     tokens.css    → :root custom properties
     backgrounds.css → html/body canvas + dark mode gradient
     layout.css    → .sc scroll container
     See theme/theme.css barrel for full list.
  */

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

  /* Sync error banner — same layout as PWA banner, amber accent */
  .sync-banner {
    position: fixed;
    bottom: calc(1rem + var(--safe-bottom));
    left: 1rem;
    right: 1rem;
    background: #7f1d1d;
    color: #fff;
    border-radius: 0.875rem;
    padding: 0.875rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    z-index: 9998;
    font-size: 0.82rem;
    font-weight: 600;
  }
  .sync-banner span { flex: 1; }
  .sync-retry-btn {
    background: #e74c3c;
    color: #fff;
    border: none;
    border-radius: 0.5rem;
    padding: 0.4rem 0.875rem;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
  }
</style>
