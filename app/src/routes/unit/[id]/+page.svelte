<script lang="ts">
  /**
   * /unit/[id] — Unit detail page.
   *
   * Shows:
   *  - Unit header (icon, name, color, TEKS)
   *  - Lesson list (LessonRow × N)
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
  import LessonRow from '$lib/components/home/LessonRow.svelte';

  const unitId = $derived($page.params.id);

  const unit = $derived(
    $unitsData.find(u => u.id === unitId) ?? null
  );

  let loading = $state(false);

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
  <main class="screen center">
    <p>Unit not found.</p>
    <button type="button" onclick={goBack}>← Back</button>
  </main>
{:else}
  <main class="screen" style="--color: {unit.color}">
    <!-- Header -->
    <header class="unit-header">
      <button type="button" class="back" onclick={goBack} aria-label="Back to home">
        ←
      </button>
      <div class="header-content">
        <span class="unit-icon">{unit.icon}</span>
        <div class="header-text">
          <span class="unit-id">{unit.id.toUpperCase()}</span>
          <h1>{unit.name}</h1>
          <span class="teks">{unit.teks}</span>
        </div>
      </div>
    </header>

    <!-- Lesson list -->
    <section class="lessons">
      <h2>Lessons</h2>

      {#if loading && !unit._loaded}
        <p class="loading">Loading lessons…</p>
      {:else}
        <div class="lesson-list">
          {#each unit.lessons as lesson, i}
            <LessonRow
              icon={lesson.icon ?? '📖'}
              title={lesson.title}
              desc={lesson.desc ?? ''}
              color={unit.color}
              done={$isDone(lesson.id)}
              locked={false}
              onSelect={() => goto(`/lesson/${lesson.id}`)}
            />
          {/each}
        </div>
      {/if}
    </section>

    <!-- Unit Quiz -->
    {#if unit.unitQuiz}
      <section class="unit-quiz">
        <button
          type="button"
          class="quiz-btn"
          onclick={() => goto(`/quiz/${unit.id}_uq`)}
        >
          🏆 Unit Quiz
        </button>
      </section>
    {/if}
  </main>
{/if}

<style>
  .screen {
    min-height: 100dvh;
    background: linear-gradient(160deg, #f0f2f5 0%, color-mix(in srgb, var(--color) 8%, #f0f2f5) 100%);
    display: flex;
    flex-direction: column;
  }

  .screen.center {
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .unit-header {
    background: var(--color);
    color: #fff;
    padding: 1.25rem 1.25rem 1.5rem;
    position: relative;
  }

  .back {
    background: rgba(255,255,255,0.2);
    border: none;
    color: #fff;
    font-size: 1.1rem;
    padding: 0.4rem 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    margin-bottom: 0.75rem;
    display: inline-block;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .unit-icon {
    font-size: 3rem;
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .unit-id {
    font-size: 0.7rem;
    font-weight: 700;
    opacity: 0.8;
    letter-spacing: 0.08em;
  }

  h1 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .teks {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .lessons {
    padding: 1.25rem;
    flex: 1;
  }

  h2 {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-muted, #636e72);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .lesson-list {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .loading {
    color: var(--color-text-muted, #636e72);
    font-size: 0.9rem;
  }

  .unit-quiz {
    padding: 0 1.25rem 2rem;
  }

  .quiz-btn {
    width: 100%;
    padding: 1rem;
    border-radius: 1rem;
    border: none;
    background: var(--color);
    color: #fff;
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color) 40%, transparent);
  }

  .quiz-btn:hover {
    opacity: 0.9;
  }
</style>
