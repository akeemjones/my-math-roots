<script lang="ts">
  /**
   * /lesson/[id] — Lesson view.
   *
   * Shows:
   *  - Lesson header (icon, title, unit back button)
   *  - Teaching points (bullet list)
   *  - Worked examples (with safe HTML rendering of the `s` solution field)
   *  - Practice problems (typed answer, show/hide)
   *  - "Start Quiz" button → /quiz/lq_{lessonId}
   *
   * Lazy-loads the parent unit on mount if not already loaded.
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { unitsData } from '$lib/stores';
  import { loadUnit } from '$lib/boot';
  import type { PracticeItem } from '$lib/types';

  const lessonId = $derived($page.params.id ?? '');
  // "u1l1" → "u1", "u10l3" → "u10"
  const unitId = $derived(lessonId.replace(/l\d+$/, ''));

  const unit = $derived($unitsData.find(u => u.id === unitId) ?? null);
  const lesson = $derived(unit?.lessons.find(l => l.id === lessonId) ?? null);

  let loading = $state(false);

  // Practice answers revealed per item index
  let revealed = $state<Record<number, boolean>>({});

  onMount(async () => {
    if (!unitId) return;
    loading = true;
    await loadUnit(unitId);
    loading = false;
  });

  function goBack() {
    goto(`/unit/${unitId}`);
  }

  function startQuiz() {
    goto(`/quiz/lq_${lessonId}`);
  }

  function toggleReveal(i: number) {
    revealed = { ...revealed, [i]: !revealed[i] };
  }
</script>

{#if !lesson && !loading}
  <main class="screen center">
    <p>Lesson not found.</p>
    <button type="button" onclick={goBack}>← Back</button>
  </main>
{:else if loading && !lesson?.points}
  <main class="screen center">
    <div class="spinner"></div>
    <p>Loading lesson…</p>
  </main>
{:else if lesson}
  <main class="screen" style="--color: {unit?.color ?? '#6c5ce7'}">

    <!-- Header -->
    <header class="lesson-header">
      <button type="button" class="back" onclick={goBack} aria-label="Back to unit">←</button>
      <div class="header-content">
        <span class="lesson-icon">{lesson.icon ?? '📖'}</span>
        <div class="header-text">
          <span class="lesson-id">{lessonId.toUpperCase()}</span>
          <h1>{lesson.title}</h1>
          {#if lesson.desc}
            <p class="lesson-desc">{lesson.desc}</p>
          {/if}
        </div>
      </div>
    </header>

    <div class="content">

      <!-- Teaching Points -->
      {#if lesson.points && lesson.points.length > 0}
        <section class="card">
          <h2>📌 Key Points</h2>
          <ul class="points">
            {#each lesson.points as point}
              <li>{point}</li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- Worked Examples -->
      {#if lesson.examples && lesson.examples.length > 0}
        <section class="card">
          <h2>✏️ Examples</h2>
          <div class="examples">
            {#each lesson.examples as ex}
              <div class="example" style="--ex-color: {ex.c}">
                <span class="ex-tag">{ex.tag}</span>
                <p class="ex-problem">{ex.p}</p>
                <div class="ex-solution">
                  <!-- ex.s may contain HTML/SVG markup — this is our own static data -->
                  {@html ex.s}
                </div>
                <p class="ex-answer">{ex.a}</p>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Practice Problems -->
      {#if lesson.practice && lesson.practice.length > 0}
        <section class="card">
          <h2>🏋️ Practice</h2>
          <div class="practice-list">
            {#each lesson.practice as item, i}
              <div class="practice-item">
                <p class="practice-q">{item.q}</p>
                {#if revealed[i]}
                  <div class="practice-answer">
                    <span class="answer-label">Answer:</span>
                    <span class="answer-val">{item.a}</span>
                    {#if item.h}
                      <p class="hint-text">💡 {item.h}</p>
                    {/if}
                    <p class="encourage">{item.e}</p>
                  </div>
                {:else}
                  <button
                    type="button"
                    class="reveal-btn"
                    onclick={() => toggleReveal(i)}
                  >
                    Show Answer
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </section>
      {/if}

    </div>

    <!-- Start Quiz CTA -->
    <div class="quiz-cta">
      <button type="button" class="quiz-btn" onclick={startQuiz}>
        🧠 Start Lesson Quiz
      </button>
    </div>

  </main>
{/if}

<style>
  .screen {
    min-height: 100dvh;
    background: var(--color-bg, #f0f2f5);
    display: flex;
    flex-direction: column;
  }

  .screen.center {
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
  }

  /* Header */
  .lesson-header {
    background: var(--color);
    color: #fff;
    padding: 1.25rem 1.25rem 1.5rem;
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

  .lesson-icon {
    font-size: 3rem;
    line-height: 1;
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .lesson-id {
    font-size: 0.7rem;
    font-weight: 700;
    opacity: 0.8;
    letter-spacing: 0.08em;
  }

  h1 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .lesson-desc {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.85;
  }

  /* Content area */
  .content {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
  }

  /* Cards */
  .card {
    background: var(--color-surface, #fff);
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  h2 {
    margin: 0 0 0.875rem;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted, #636e72);
  }

  /* Teaching points */
  .points {
    margin: 0;
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .points li {
    font-size: 0.9rem;
    color: var(--color-text, #2d3436);
    line-height: 1.5;
  }

  /* Examples */
  .examples {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .example {
    border-left: 3px solid var(--ex-color, var(--color));
    padding: 0.75rem 0.875rem;
    background: color-mix(in srgb, var(--ex-color, var(--color)) 6%, #fff);
    border-radius: 0 0.75rem 0.75rem 0;
  }

  .ex-tag {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ex-color, var(--color));
    margin-bottom: 0.35rem;
  }

  .ex-problem {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text, #2d3436);
  }

  .ex-solution {
    font-size: 0.9rem;
    color: var(--color-text, #2d3436);
    line-height: 1.6;
    margin-bottom: 0.35rem;
  }

  /* Inline SVG / HTML from data files */
  .ex-solution :global(svg) {
    max-width: 100%;
    height: auto;
  }

  .ex-answer {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-success, #00b894);
  }

  /* Practice */
  .practice-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .practice-item {
    border: 1px solid var(--color-border, #dfe6e9);
    border-radius: 0.75rem;
    padding: 0.875rem;
  }

  .practice-q {
    margin: 0 0 0.625rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text, #2d3436);
  }

  .reveal-btn {
    background: color-mix(in srgb, var(--color) 12%, #fff);
    color: var(--color);
    border: 1.5px solid var(--color);
    border-radius: 0.5rem;
    padding: 0.35rem 0.875rem;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .reveal-btn:hover { opacity: 0.8; }

  .practice-answer {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .answer-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted, #636e72);
  }

  .answer-val {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-success, #00b894);
  }

  .hint-text {
    margin: 0;
    font-size: 0.8rem;
    color: var(--color-text-muted, #636e72);
    font-style: italic;
  }

  .encourage {
    margin: 0;
    font-size: 0.8rem;
    color: var(--color, #6c5ce7);
    font-weight: 600;
  }

  /* Quiz CTA */
  .quiz-cta {
    padding: 1rem 1.25rem 2.5rem;
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
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color) 35%, transparent);
  }

  .quiz-btn:hover { opacity: 0.9; }

  /* Spinner */
  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid var(--color-border, #dfe6e9);
    border-top-color: var(--color-primary, #6c5ce7);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
