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

<div class="dash-shell">

  <!-- Sticky header -->
  <header class="dash-hdr">
    <button type="button" class="dash-back-btn" onclick={() => goto('/select')}>← Students</button>
    <span class="dash-brand">🌱 My Math Roots</span>
  </header>

  <!-- Student switcher pills -->
  {#if $familyProfiles.length > 0}
    <nav class="dash-pill-row" aria-label="Switch student">
      {#each $familyProfiles as profile}
        <button
          type="button"
          class="dash-pill {$activeStudentId === profile.id ? 'active' : ''}"
          style="--pill-color: {profile.avatar_color_from}"
          onclick={() => activeStudentId.set(profile.id)}
        >
          <span class="dash-pill-emoji">{profile.avatar_emoji}</span>
          <span>{profile.display_name}</span>
        </button>
      {/each}
    </nav>
  {/if}

  <!-- Student banner -->
  {#if $activeStudent}
    <div
      class="dash-student-banner"
      style="background: linear-gradient(135deg, {$activeStudent.avatar_color_from}, {$activeStudent.avatar_color_to})"
    >
      <span class="dash-banner-emoji">{$activeStudent.avatar_emoji}</span>
      <div class="dash-banner-text">
        <span class="dash-banner-name">{$activeStudent.display_name}</span>
        <span class="dash-banner-age">Age {$activeStudent.age}</span>
      </div>
    </div>
  {/if}

  {@render children()}
</div>
