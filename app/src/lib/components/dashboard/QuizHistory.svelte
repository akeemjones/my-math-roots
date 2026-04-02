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

<style>
  .qh-empty {
    font-size: .9rem;
    color: #90a4ae;
    text-align: center;
    padding: 16px 0 8px;
    margin: 0;
  }

  .qh-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .qh-row {
    background: rgba(0,0,0,.03);
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-left: 4px solid #4a90d9;
  }

  .qh-type-badge {
    display: inline-block;
    font-size: .68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: #1565c0;
    background: #e3f2fd;
    border-radius: 6px;
    padding: 2px 7px;
    width: fit-content;
  }

  .qh-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .qh-label {
    font-size: .9rem;
    font-weight: 600;
    color: #37474f;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .qh-stars {
    font-size: .9rem;
    flex-shrink: 0;
  }

  .qh-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: .75rem;
    color: #90a4ae;
    flex-wrap: wrap;
  }

  .qh-pct {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: .88rem;
    font-weight: 700;
  }

  .qh-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .qh-date {
    font-size: .72rem;
    color: #b0bec5;
  }

  .qh-del {
    background: none;
    border: none;
    font-size: .9rem;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 6px;
    opacity: .5;
    transition: opacity .15s;
    -webkit-tap-highlight-color: transparent;
  }
  .qh-del:hover { opacity: .85; }
  .qh-del:active { opacity: 1; }
</style>
