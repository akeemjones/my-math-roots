<script lang="ts">
  /**
   * /dashboard — Layout guard + student switcher header.
   *
   * Auth guard: parent must be signed in (isSignedIn).
   * No student session required — parents view any of their children.
   */

  import { goto } from '$app/navigation';
  import { isSignedIn, familyProfiles, activeStudentId, activeStudent } from '$lib/stores';

  const { children } = $props();

  // ── Auth guard ────────────────────────────────────────────────────────────────
  $effect(() => {
    if (!$isSignedIn) {
      goto('/login');
    }
  });
</script>

<div class="dashboard-shell">
  <!-- Top header -->
  <header class="dash-header">
    <button type="button" class="back-btn" onclick={() => goto('/select')}>
      ← Students
    </button>
    <span class="brand">📊 Progress</span>
  </header>

  <!-- Student switcher -->
  {#if $familyProfiles.length > 0}
    <nav class="student-switcher" aria-label="Switch student">
      {#each $familyProfiles as profile}
        <button
          type="button"
          class="student-pill"
          class:active={$activeStudentId === profile.id}
          style="--pill-color: {profile.avatar_color_from}"
          onclick={() => activeStudentId.set(profile.id)}
        >
          <span class="pill-avatar">{profile.avatar_emoji}</span>
          <span class="pill-name">{profile.display_name}</span>
        </button>
      {/each}
    </nav>
  {/if}

  <!-- Student banner -->
  {#if $activeStudent}
    <div
      class="student-banner"
      style="
        background: linear-gradient(135deg, {$activeStudent.avatar_color_from}, {$activeStudent.avatar_color_to});
      "
    >
      <span class="banner-emoji">{$activeStudent.avatar_emoji}</span>
      <div class="banner-text">
        <span class="banner-name">{$activeStudent.display_name}</span>
        <span class="banner-age">Age {$activeStudent.age}</span>
      </div>
    </div>
  {/if}

  <!-- Page content -->
  {@render children()}
</div>

<style>
  .dashboard-shell {
    min-height: 100dvh;
    background: var(--color-bg, #f0f2f5);
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .dash-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.25rem;
    background: var(--color-surface, #fff);
    border-bottom: 1px solid var(--color-border, #dfe6e9);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--color-primary, #6c5ce7);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.25rem 0;
  }

  .brand {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text, #2d3436);
  }

  /* Student switcher */
  .student-switcher {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    overflow-x: auto;
    background: var(--color-surface, #fff);
    border-bottom: 1px solid var(--color-border, #dfe6e9);
    scrollbar-width: none;
  }

  .student-switcher::-webkit-scrollbar { display: none; }

  .student-pill {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    border-radius: 2rem;
    border: 2px solid transparent;
    background: var(--color-bg, #f0f2f5);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
    color: var(--color-text, #2d3436);
  }

  .student-pill.active {
    background: color-mix(in srgb, var(--pill-color) 15%, #fff);
    border-color: var(--pill-color);
    color: var(--pill-color);
  }

  .pill-avatar { font-size: 1rem; }

  /* Student banner */
  .student-banner {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1rem 1.25rem;
    color: #fff;
  }

  .banner-emoji { font-size: 2.5rem; line-height: 1; }

  .banner-text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .banner-name {
    font-size: 1.2rem;
    font-weight: 700;
  }

  .banner-age {
    font-size: 0.8rem;
    opacity: 0.85;
  }
</style>
