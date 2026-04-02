<script lang="ts">
  /**
   * QuizHistory — Recent quiz attempts list for the parent dashboard.
   *
   * Shows last 20 attempts (newest first), with score badge, stars,
   * date, duration, and a delete button (localStorage only, stub for Supabase).
   */

  import { scores } from '$lib/stores';
  import type { ScoreEntry } from '$lib/types';

  // 20 most recent, newest first
  const recent = $derived(
    [...$scores].sort((a, b) => b.id - a.id).slice(0, 20)
  );

  function deleteEntry(entry: ScoreEntry) {
    scores.update(s => s.filter(e => e.id !== entry.id));
  }

  function pctColor(pct: number): string {
    if (pct >= 80) return '#00b894';
    if (pct >= 60) return '#fdcb6e';
    return '#e17055';
  }

  function typeLabel(type: ScoreEntry['type']): string {
    return { lesson: 'Lesson', unit: 'Unit', final: 'Final', practice: 'Practice' }[type] ?? type;
  }
</script>

<div class="qh-card">
  {#if recent.length === 0}
    <p class="qh-empty">No quizzes completed yet.</p>
  {:else}
    <ul class="qh-list">
      {#each recent as entry}
        <li class="qh-row">
          <!-- Type badge -->
          <span class="qh-type-badge">{typeLabel(entry.type)}</span>

          <!-- Quiz label + stars -->
          <div class="qh-main">
            <span class="qh-label">{entry.label}</span>
            <span class="qh-stars">{entry.stars}</span>
          </div>

          <!-- Meta row -->
          <div class="qh-meta">
            <span class="qh-pct" style="color: {pctColor(entry.pct)}">{entry.pct}%</span>
            <span>·</span>
            <span>{entry.score}/{entry.total} correct</span>
            <span>·</span>
            <span>⏱ {entry.timeTaken}</span>
          </div>

          <!-- Date + delete -->
          <div class="qh-footer">
            <span class="qh-date">{entry.date}</span>
            <button
              type="button"
              class="qh-del"
              onclick={() => deleteEntry(entry)}
              aria-label="Delete this result"
              title="Remove from history"
            >
              🗑
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
