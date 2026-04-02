<script lang="ts">
  /**
   * QuizResults — post-quiz results screen.
   *
   * Props:
   *   entry     — the ScoreEntry returned by finaliseQuiz()
   *   color     — unit brand color
   *   onRetry   — called to start a fresh quiz with the same bank
   *   onHome    — called to navigate home
   *   onReview  — called to review wrong answers (future Phase 6)
   */

  import { calcResultMessage } from '$lib/services/quiz';
  import type { ScoreEntry } from '$lib/types';

  const { entry, color, onRetry, onHome }: {
    entry: ScoreEntry;
    color: string;
    onRetry: () => void;
    onHome: () => void;
  } = $props();

  const { emoji, msg } = $derived(calcResultMessage(entry.pct));
  const passed = $derived(entry.pct >= 80);

  // Wrong answers for the "Missed questions" summary
  const wrong = $derived(entry.answers.filter((a) => !a.ok));
</script>

<div class="results" style="--color: {color}">
  <!-- Hero -->
  <div class="hero">
    <span class="hero-emoji" role="img" aria-label="Result">{emoji}</span>
    <h1 class="score">{entry.pct}%</h1>
    <p class="stars" aria-label="Stars earned">{entry.stars || 'Keep going!'}</p>
    <p class="msg">{msg}</p>
  </div>

  <!-- Stats strip -->
  <div class="stats">
    <div class="stat">
      <span class="stat-val">{entry.score}/{entry.total}</span>
      <span class="stat-label">Correct</span>
    </div>
    <div class="stat">
      <span class="stat-val">{entry.timeTaken}</span>
      <span class="stat-label">Time</span>
    </div>
    <div class="stat">
      <span class="stat-val">{entry.total - entry.score}</span>
      <span class="stat-label">Missed</span>
    </div>
  </div>

  <!-- Pass / fail banner -->
  {#if passed}
    <div class="banner pass" role="status">
      🔓 {entry.type === 'lesson'
        ? 'Next lesson unlocked!'
        : entry.type === 'unit'
        ? 'Next unit unlocked!'
        : 'Final Test passed — you are a Math Master! 🎓'}
    </div>
  {:else}
    <div class="banner fail" role="status">
      🔒 Need 80%+ to unlock the next {entry.type === 'unit' ? 'unit' : 'lesson'}.
      You got {entry.pct}% — try again!
    </div>
  {/if}

  <!-- Missed questions summary -->
  {#if wrong.length > 0}
    <section class="missed">
      <h2>Missed Questions</h2>
      <div class="missed-list">
        {#each wrong as a}
          <div class="missed-item">
            <p class="missed-q">{a.t}</p>
            <p class="missed-correct">
              ✅ {a.opts?.[a.correct] ?? ''}
            </p>
            {#if a.chosen !== null && a.opts}
              <p class="missed-chosen">
                ✗ Your answer: {a.opts[a.chosen] ?? ''}
              </p>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Action buttons -->
  <div class="actions">
    <button type="button" class="btn primary" onclick={onRetry}>
      🔄 Try Again
    </button>
    <button type="button" class="btn secondary" onclick={onHome}>
      🏠 Home
    </button>
  </div>
</div>

<style>
  .results {
    min-height: 100dvh;
    background: var(--color-bg, #f0f2f5);
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Hero */
  .hero {
    background: var(--color);
    color: #fff;
    text-align: center;
    padding: 2.5rem 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }
  .hero-emoji {
    font-size: 3.5rem;
    line-height: 1;
  }
  .score {
    margin: 0;
    font-size: 3rem;
    font-weight: 800;
    line-height: 1;
  }
  .stars {
    font-size: 1.6rem;
    margin: 0;
  }
  .msg {
    font-size: 0.95rem;
    font-weight: 600;
    opacity: 0.9;
    margin: 0;
    max-width: 22rem;
    text-align: center;
  }

  /* Stats */
  .stats {
    display: flex;
    background: var(--color-surface, #fff);
    border-bottom: 1px solid var(--color-border, #dfe6e9);
  }
  .stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0.5rem;
    border-right: 1px solid var(--color-border, #dfe6e9);
  }
  .stat:last-child { border-right: none; }
  .stat-val {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text, #2d3436);
  }
  .stat-label {
    font-size: 0.72rem;
    color: var(--color-text-muted, #636e72);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 0.1rem;
  }

  /* Banner */
  .banner {
    margin: 1rem 1.25rem 0;
    padding: 0.875rem 1rem;
    border-radius: 0.875rem;
    font-size: 0.9rem;
    font-weight: 600;
  }
  .banner.pass {
    background: color-mix(in srgb, var(--color-success, #00b894) 12%, #fff);
    color: var(--color-success, #00b894);
  }
  .banner.fail {
    background: color-mix(in srgb, var(--color-error, #d63031) 10%, #fff);
    color: var(--color-error, #d63031);
  }

  /* Missed questions */
  .missed {
    margin: 1.25rem 1.25rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  h2 {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted, #636e72);
  }
  .missed-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .missed-item {
    background: var(--color-surface, #fff);
    border-radius: 0.75rem;
    padding: 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .missed-q {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text, #2d3436);
    margin: 0;
  }
  .missed-correct {
    font-size: 0.8rem;
    color: var(--color-success, #00b894);
    margin: 0;
  }
  .missed-chosen {
    font-size: 0.8rem;
    color: var(--color-error, #d63031);
    margin: 0;
  }

  /* Actions */
  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem 1.25rem 2.5rem;
    margin-top: auto;
  }
  .btn {
    padding: 0.875rem;
    border-radius: 0.875rem;
    font-size: 1rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .btn.primary {
    background: var(--color);
    color: #fff;
  }
  .btn.secondary {
    background: var(--color-surface, #fff);
    color: var(--color-text, #2d3436);
    border: 2px solid var(--color-border, #dfe6e9);
  }
  .btn:hover { opacity: 0.88; }
</style>
