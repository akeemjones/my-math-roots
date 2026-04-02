<script lang="ts">
  /**
   * /quiz/[id] — Quiz launcher + engine + results.
   *
   * Supported id formats:
   *   lq_u1l1   → lesson quiz  (type='lesson',  bank = lesson.qBank)
   *   u1_uq     → unit quiz    (type='unit',    bank = unit.unitQuiz.qBank)
   *   final_test → final test  (type='final',   bank = all units' testBanks)
   *
   * Lifecycle:
   *   mount → load unit(s) → startQuiz() → QuizEngine → onComplete → QuizResults
   *   onRetry → startQuiz() again with same bank
   *   onQuit / onHome → navigate back
   */

  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { unitsData } from '$lib/stores';
  import { loadUnit } from '$lib/boot';
  import { startQuiz } from '$lib/services/quiz';
  import { cur } from '$lib/stores';
  import QuizEngine from '$lib/components/quiz/QuizEngine.svelte';
  import QuizResults from '$lib/components/quiz/QuizResults.svelte';
  import type { Question, QuizType, ScoreEntry } from '$lib/types';

  const quizId = $derived($page.params.id ?? '');

  // ── Result state ─────────────────────────────────────────────────────────────

  let resultEntry = $state<ScoreEntry | null>(null);
  let loadError = $state<string | null>(null);
  let quizColor = $state('#6c5ce7');

  // ── Bank resolution ───────────────────────────────────────────────────────────

  /**
   * Parse the quiz id and return the resolved bank, label, type, unitIdx, and color.
   * Must be called after the relevant unit(s) have been loaded.
   */
  function resolveQuiz(id: string): {
    bank: Question[];
    label: string;
    type: QuizType;
    unitIdx: number | null;
    color: string;
  } | null {
    const units = get(unitsData);

    // ── Lesson quiz: lq_u1l1 ────────────────────────────────────────────────
    if (id.startsWith('lq_')) {
      const lessonId = id.slice(3); // "u1l1"
      const unitId = lessonId.replace(/l\d+$/, ''); // "u1"
      const unitIdx = units.findIndex(u => u.id === unitId);
      const unit = units[unitIdx];
      if (!unit) return null;
      const lesson = unit.lessons.find(l => l.id === lessonId);
      if (!lesson) return null;
      const bank = lesson.qBank ?? lesson.quiz ?? [];
      return { bank, label: lesson.title, type: 'lesson', unitIdx, color: unit.color };
    }

    // ── Unit quiz: u1_uq ─────────────────────────────────────────────────────
    if (id.endsWith('_uq')) {
      const unitId = id.replace('_uq', ''); // "u1"
      const unitIdx = units.findIndex(u => u.id === unitId);
      const unit = units[unitIdx];
      if (!unit) return null;
      const bank = unit.unitQuiz?.qBank ?? [];
      return { bank, label: `${unit.name} Unit Quiz`, type: 'unit', unitIdx, color: unit.color };
    }

    // ── Final test ────────────────────────────────────────────────────────────
    if (id === 'final_test') {
      const bank: Question[] = units.flatMap(u => u.testBank ?? []);
      return { bank, label: 'Final Test', type: 'final', unitIdx: null, color: '#6c5ce7' };
    }

    return null;
  }

  /**
   * Load the relevant unit(s) for this quiz id, then start the quiz.
   */
  async function initQuiz(id: string): Promise<void> {
    loadError = null;
    resultEntry = null;

    try {
      if (id.startsWith('lq_')) {
        const lessonId = id.slice(3);
        const unitId = lessonId.replace(/l\d+$/, '');
        await loadUnit(unitId);
      } else if (id.endsWith('_uq')) {
        const unitId = id.replace('_uq', '');
        await loadUnit(unitId);
      } else if (id === 'final_test') {
        // Load all 10 units for the final test bank
        await Promise.all(
          ['u1','u2','u3','u4','u5','u6','u7','u8','u9','u10'].map(loadUnit)
        );
      }

      const resolved = resolveQuiz(id);
      if (!resolved || resolved.bank.length === 0) {
        loadError = 'No questions found for this quiz.';
        return;
      }

      quizColor = resolved.color;
      startQuiz(resolved.bank, id, resolved.label, resolved.type, resolved.unitIdx);

    } catch (err) {
      loadError = 'Failed to load quiz. Please go back and try again.';
    }
  }

  onMount(() => {
    initQuiz(quizId);
  });

  function handleComplete(entry: ScoreEntry) {
    resultEntry = entry;
  }

  function handleRetry() {
    initQuiz(quizId);
  }

  function handleQuit() {
    // Navigate back to unit or home
    if (quizId.startsWith('lq_')) {
      const lessonId = quizId.slice(3);
      const unitId = lessonId.replace(/l\d+$/, '');
      goto(`/unit/${unitId}`);
    } else if (quizId.endsWith('_uq')) {
      const unitId = quizId.replace('_uq', '');
      goto(`/unit/${unitId}`);
    } else {
      goto('/');
    }
  }

  function handleHome() {
    goto('/');
  }
</script>

{#if loadError}
  <main class="screen center">
    <p class="error">{loadError}</p>
    <button type="button" class="btn-back" onclick={handleQuit}>← Go Back</button>
  </main>

{:else if resultEntry}
  <QuizResults
    entry={resultEntry}
    color={quizColor}
    onRetry={handleRetry}
    onHome={handleHome}
  />

{:else if $cur.quiz}
  <QuizEngine
    quizState={$cur.quiz}
    color={quizColor}
    onComplete={handleComplete}
    onQuit={handleQuit}
  />

{:else}
  <!-- Loading state -->
  <main class="screen center" style="--color: {quizColor}">
    <div class="spinner"></div>
    <p>Loading quiz…</p>
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
    text-align: center;
  }

  .error {
    color: var(--color-error, #d63031);
    font-weight: 600;
    font-size: 0.95rem;
  }

  .btn-back {
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    border: 2px solid var(--color-border, #dfe6e9);
    background: var(--color-surface, #fff);
    color: var(--color-text, #2d3436);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-back:hover { opacity: 0.8; }

  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid var(--color-border, #dfe6e9);
    border-top-color: var(--color, #6c5ce7);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
