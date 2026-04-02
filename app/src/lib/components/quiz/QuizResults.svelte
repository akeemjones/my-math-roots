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

<div class="sc" style="--color: {color}">
  <div class="sc-in">

    <!-- Score card -->
    <div class="rcard">
      <span class="r-emoji" role="img" aria-label="Result">{emoji}</span>
      <div class="r-score" style="color: {color}">{entry.pct}%</div>
      <div class="r-pct">{entry.score} / {entry.total} correct</div>
      <div class="r-stars" aria-label="Stars earned">{entry.stars || '⭐'}</div>
      <div class="r-msg">{msg}</div>

      <div class="rbtn-row">
        <button type="button" class="rbtn rbtn-retry" onclick={onRetry}>🔄 Try Again</button>
        <button type="button" class="rbtn rbtn-home" onclick={onHome}>🏠 Home</button>
      </div>
    </div>

    <!-- Stats strip -->
    <div class="r-stats-strip">
      <div class="r-stat">
        <span class="r-stat-val">{entry.score}/{entry.total}</span>
        <span class="r-stat-lbl">Correct</span>
      </div>
      <div class="r-stat">
        <span class="r-stat-val">{entry.timeTaken}</span>
        <span class="r-stat-lbl">Time</span>
      </div>
      <div class="r-stat">
        <span class="r-stat-val">{entry.total - entry.score}</span>
        <span class="r-stat-lbl">Missed</span>
      </div>
    </div>

    <!-- Pass / fail banner -->
    <div class="r-banner {passed ? 'pass' : 'fail'}" role="status">
      {#if passed}
        🔓 {entry.type === 'lesson' ? 'Next lesson unlocked!' : entry.type === 'unit' ? 'Next unit unlocked!' : 'Final Test passed — Math Master! 🎓'}
      {:else}
        🔒 Need 80%+ to unlock. You got {entry.pct}% — try again!
      {/if}
    </div>

    <!-- Missed questions -->
    {#if wrong.length > 0}
      <div class="r-missed">
        <h2>Missed Questions</h2>
        <div class="r-missed-list">
          {#each wrong as a}
            <div class="r-missed-item">
              <p class="r-missed-q">{a.t}</p>
              <p class="r-missed-correct">✅ {a.opts?.[a.correct] ?? ''}</p>
              {#if a.chosen !== null && a.opts}
                <p class="r-missed-chosen">✗ Your answer: {a.opts[a.chosen] ?? ''}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </div>
</div>
