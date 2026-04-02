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

<div class="history-card">
  {#if recent.length === 0}
    <p class="empty">No quizzes completed yet.</p>
  {:else}
    <ul class="history-list">
      {#each recent as entry}
        <li class="history-row">
          <!-- Type badge -->
          <span class="type-badge">{typeLabel(entry.type)}</span>

          <!-- Quiz label + stars -->
          <div class="row-main">
            <span class="row-label">{entry.label}</span>
            <span class="row-stars">{entry.stars}</span>
          </div>

          <!-- Meta row -->
          <div class="row-meta">
            <span class="pct-badge" style="color: {pctColor(entry.pct)}">{entry.pct}%</span>
            <span class="meta-sep">·</span>
            <span class="meta-text">{entry.score}/{entry.total} correct</span>
            <span class="meta-sep">·</span>
            <span class="meta-text">⏱ {entry.timeTaken}</span>
          </div>

          <!-- Date + delete -->
          <div class="row-footer">
            <span class="row-date">{entry.date}</span>
            <button
              type="button"
              class="delete-btn"
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

<style>
  .history-card {
    background: var(--color-surface, #fff);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .empty {
    padding: 2rem;
    text-align: center;
    color: var(--color-text-muted, #636e72);
    font-size: 0.9rem;
    margin: 0;
  }

  .history-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .history-row {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--color-border, #dfe6e9);
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .history-row:last-child { border-bottom: none; }

  .type-badge {
    display: inline-block;
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color, #6c5ce7);
    background: color-mix(in srgb, var(--color, #6c5ce7) 12%, #fff);
    padding: 0.1rem 0.45rem;
    border-radius: 0.3rem;
    width: fit-content;
  }

  .row-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .row-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text, #2d3436);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-stars {
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .row-meta {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
  }

  .pct-badge {
    font-weight: 700;
    font-size: 0.85rem;
  }

  .meta-sep {
    color: var(--color-text-muted, #b2bec3);
  }

  .meta-text {
    color: var(--color-text-muted, #636e72);
  }

  .row-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.1rem;
  }

  .row-date {
    font-size: 0.72rem;
    color: var(--color-text-muted, #b2bec3);
  }

  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    opacity: 0.4;
    transition: opacity 0.15s;
    padding: 0 0.25rem;
    line-height: 1;
  }

  .delete-btn:hover { opacity: 0.85; }
</style>
