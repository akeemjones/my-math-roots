<script lang="ts">
  /**
   * /dashboard — Layout guard + student selector.
   * Header matches legacy dashboard.html exactly:
   *   "📊 Parent Dashboard"  [Sign Out]
   * Below header: "Viewing:" <select> dropdown of family profiles.
   * Below selector: student name (Boogaloo, centered).
   */

  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { familyProfiles, activeStudentId, activeStudent, authUser } from '$lib/core/stores';
  import { signOut as authSignOut } from '$lib/core/services/auth';
  import { navStack } from '$lib/ui/services/navStack';
  import { ICON_BARCHART } from '$lib/icons/dashboard';

  const { children } = $props();

  async function signOut() {
    try { await authSignOut(); } catch { /* ignore — clear stores regardless */ }
    authUser.set(null);
    activeStudentId.set(null);
    familyProfiles.set([]);
    navStack.clear();
    goto('/login', { replaceState: true });
  }

  function goToApp() {
    if (!$activeStudentId) return;
    navStack.clear();
    goto('/');
  }

  onMount(() => {
    navStack.clear();
    // Match body/html background to dash-shell so iOS overscroll bounce shows #f0f4f8 not white
    document.documentElement.style.backgroundColor = '#f0f4f8';
    document.body.style.backgroundColor = '#f0f4f8';
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  });
</script>

<div class="dash-shell">

  <!-- Header — matches legacy .db-header -->
  <header class="db-header">
    <div class="db-header-title">{@html ICON_BARCHART} Parent Dashboard</div>
    <div class="db-header-actions">
      {#if $activeStudentId}
        <button type="button" class="db-goto-app-btn" onclick={goToApp}>
          ▶ {$activeStudent?.display_name ?? 'Student'}'s App
        </button>
      {/if}
      <button type="button" class="db-signout-btn" onclick={signOut}>Sign Out</button>
    </div>
  </header>

  <!-- Student selector — matches legacy .db-selector-wrap -->
  {#if $familyProfiles.length > 0}
    <div class="db-selector-wrap">
      <label class="db-selector-label" for="db-student-select">Viewing:</label>
      <select
        id="db-student-select"
        class="db-selector"
        value={$activeStudentId ?? ''}
        onchange={(e) => activeStudentId.set((e.target as HTMLSelectElement).value)}
      >
        {#each $familyProfiles as p}
          <option value={p.id}>{p.display_name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- Student name — matches legacy .db-student-name -->
  {#if $activeStudent}
    <div class="db-student-name">{$activeStudent.display_name}</div>
  {/if}

  {@render children()}
</div>

<style>
  .dash-shell {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: #f0f4f8;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-overflow-scrolling: touch;
  }

  /* ── Header ── */
  .db-header {
    background: linear-gradient(135deg, #1565C0, #0d47a1);
    color: #fff;
    padding: 14px 16px;
    padding-top: calc(14px + env(safe-area-inset-top));
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 20;
    box-shadow: 0 2px 8px rgba(0,0,0,.2);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    will-change: transform;
  }

  .db-header-title {
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: .5px;
  }

  .db-signout-btn {
    background: rgba(255,255,255,.2);
    border: none;
    border-radius: 20px;
    color: #fff;
    padding: 6px 14px;
    font-size: .85rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background .15s;
  }
  .db-signout-btn:active { background: rgba(255,255,255,.32); }

  .db-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .db-goto-app-btn {
    background: rgba(255,255,255,.2);
    border: none;
    border-radius: 20px;
    color: #fff;
    padding: 6px 14px;
    font-size: .85rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background .15s;
    white-space: nowrap;
  }
  .db-goto-app-btn:active { background: rgba(255,255,255,.32); }

  /* ── Student selector ── */
  .db-selector-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
  }

  .db-selector-label {
    font-size: .85rem;
    color: #546e7a;
    font-weight: 600;
    white-space: nowrap;
  }

  .db-selector {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #cfd8dc;
    border-radius: 10px;
    font-size: .95rem;
    background: #f8f9fa;
    color: #263238;
    cursor: pointer;
    font-family: inherit;
  }

  /* ── Student name ── */
  .db-student-name {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 1.5rem;
    color: #1565C0;
    text-align: center;
    margin: 12px 0 4px;
  }
</style>
