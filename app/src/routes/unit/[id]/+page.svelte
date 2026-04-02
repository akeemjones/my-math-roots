<script lang="ts">
  /**
   * /unit/[id] — Unit detail page.
   *
   * Shows:
   *  - Unit header (icon, name, color, TEKS)
   *  - Lesson list (inline cards)
   *  - Unit Quiz button (once all lessons are done)
   *
   * Lazy-loads the unit data file on mount if not already loaded.
   * Phase 5 will replace the onSelect stub with actual lesson navigation.
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { unitsData, isDone } from '$lib/stores';
  import { loadUnit } from '$lib/boot';

  const unitId = $derived($page.params.id);

  const unit = $derived(
    $unitsData.find(u => u.id === unitId) ?? null
  );

  let loading = $state(false);

  const progressPct = $derived.by(() => {
    if (!unit) return 0;
    const doneCount = unit.lessons.filter(l => $isDone(l.id)).length;
    return unit.lessons.length > 0 ? (doneCount / unit.lessons.length) * 100 : 0;
  });

  onMount(async () => {
    if (!unitId) return;
    loading = true;
    await loadUnit(unitId);
    loading = false;
  });

  function goBack() {
    goto('/');
  }
</script>

{#if !unit}
  <main class="sc" style="display:flex; align-items:center; justify-content:center; min-height:100dvh">
    <p style="color:var(--txt2)">Unit not found.</p>
    <button type="button" class="bar-back" onclick={goBack} style="margin-left:8px">← Back</button>
  </main>
{:else}
  <div class="sc" id="unit-screen" style="--uc: {unit.color}">

    <!-- Sticky bar -->
    <div class="bar">
      <button type="button" class="bar-back" onclick={goBack} aria-label="Back to home">Home</button>
      <span class="bar-title">{unit.name}</span>
    </div>

    <!-- TEKS strip -->
    <div class="les-teks-bar">{unit.teks}</div>

    <!-- Unit banner -->
    <div class="unit-banner" style="background: {unit.color}; margin:14px 14px 0">
      <span class="unit-ico">{unit.icon}</span>
      <h2>{unit.name}</h2>
      <p>{unit.desc ?? ''}</p>
      <span class="unit-teks">{unit.teks}</span>
      <div class="uc-mini-pb">
        <div class="uc-mini-pbf" style="width: {Math.round(progressPct)}%; background: rgba(255,255,255,.7)"></div>
      </div>
    </div>

    <!-- Lesson cards -->
    <div class="lesson-glass-wrap" style="margin:14px 14px 0">
      {#if loading && !unit._loaded}
        <p style="color:var(--txt2); padding:8px">Loading lessons…</p>
      {:else}
        <div class="lcard-grid">
          {#each unit.lessons as lesson, i}
            <div
              class="lcard"
              role="button"
              tabindex="0"
              style="--uc: {unit.color}"
              onclick={() => goto(`/lesson/${lesson.id}`)}
              onkeydown={(e) => e.key === 'Enter' && goto(`/lesson/${lesson.id}`)}
            >
              <div class="lcard-num">{i + 1}</div>
              <div class="lcard-info">
                <div class="lcard-title">{lesson.title}</div>
                {#if lesson.desc}
                  <div class="lcard-desc">{lesson.desc}</div>
                {/if}
              </div>
              <div class="lcard-badges">
                {#if $isDone(lesson.id)}
                  <span class="badge badge-done">✓ Done</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Unit Quiz -->
    {#if unit.unitQuiz}
      <div class="unit-quiz-section">
        <button
          type="button"
          class="unit-quiz-btn"
          style="background: {unit.color}"
          onclick={() => goto(`/quiz/${unit.id}_uq`)}
        >
          🏆 Unit Quiz
        </button>
      </div>
    {/if}

  </div>
{/if}
