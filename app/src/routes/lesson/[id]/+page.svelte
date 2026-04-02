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
  <main class="sc" style="display:flex; align-items:center; justify-content:center; min-height:100dvh">
    <p style="color:var(--txt2)">Lesson not found.</p>
    <button type="button" class="bar-back" onclick={goBack} style="margin-left:8px">← Back</button>
  </main>
{:else if loading && !lesson?.points}
  <main class="sc" style="display:flex; align-items:center; justify-content:center; min-height:100dvh">
    <p style="color:var(--txt2)">Loading lesson…</p>
  </main>
{:else if lesson}
  <div class="sc" id="lesson-screen" style="--color: {unit?.color ?? '#4a90d9'}; --exc: {unit?.color ?? '#4a90d9'}">

    <!-- Sticky bar -->
    <div class="bar">
      <button type="button" class="bar-back" onclick={goBack} aria-label="Back to unit">
        {unit?.name ?? 'Back'}
      </button>
      <span class="bar-title">{lesson.title}</span>
      <span class="bar-badge">{lesson.icon ?? '📖'}</span>
    </div>

    <!-- TEKS strip -->
    <div class="les-teks-bar">{unit?.teks ?? ''}</div>

    <!-- Scrollable content -->
    <div class="lesson-content-wrap">

      <!-- Key Points -->
      {#if lesson.points && lesson.points.length > 0}
        <div class="lesson-glass-wrap">
          <div class="glass-section-hdr">📌 Key Points</div>
          <ul class="kp-list" style="list-style:none; padding:0; margin:0">
            {#each lesson.points as point}
              <li class="kp">
                <span class="kp-ico">•</span>
                <span>{point}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Worked Examples -->
      {#if lesson.examples && lesson.examples.length > 0}
        <div class="lesson-glass-wrap">
          <div class="glass-section-hdr">✏️ Examples</div>
          <div class="ex-list">
            {#each lesson.examples as ex}
              <div class="ex-card" style="--exc: {ex.c ?? unit?.color ?? '#4a90d9'}">
                <span class="ex-tag">{ex.tag}</span>
                <p class="ex-problem">{ex.p}</p>
                <div class="ex-steps">{@html ex.s}</div>
                <p class="ex-answer">{ex.a}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Practice Problems -->
      {#if lesson.practice && lesson.practice.length > 0}
        <div class="lesson-glass-wrap">
          <div class="glass-section-hdr">🏋️ Practice</div>
          <div class="prac-list">
            {#each lesson.practice as item, i}
              <div class="prac-item">
                <p class="prac-q">{item.q}</p>
                {#if revealed[i]}
                  <div class="prac-answer">
                    <div class="prac-answer-lbl">Answer:</div>
                    <div class="prac-answer-val">{item.a}</div>
                    {#if item.h}
                      <p class="prac-hint">💡 {item.h}</p>
                    {/if}
                    <p class="prac-encourage">{item.e}</p>
                  </div>
                {:else}
                  <button type="button" class="prac-reveal-btn" onclick={() => toggleReveal(i)}>
                    Show Answer
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

    </div>

    <!-- Quiz CTA footer -->
    <div class="lesson-footer">
      <button
        type="button"
        class="next-lesson-btn"
        style="background: {unit?.color ?? '#4a90d9'}; border-color: {unit?.color ?? '#4a90d9'}"
        onclick={startQuiz}
      >
        🎯 Start Lesson Quiz
      </button>
    </div>

  </div>
{/if}
