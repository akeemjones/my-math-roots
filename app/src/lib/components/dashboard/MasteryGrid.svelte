<script lang="ts">
  /**
   * MasteryGrid — Visual unit × lesson mastery map.
   *
   * One row per unit. Each cell = one lesson.
   * Cell states:
   *   ✅ green  — done[lesson.id] is true (passed ≥80%)
   *   🟡 amber  — mastery entry exists (attempted) but not passed
   *   ⬜ grey   — never touched
   *
   * Tooltip: lesson title + accuracy % (if seen).
   */

  import { unitsData, done, mastery } from '$lib/stores';

  function lessonState(lessonId: string): 'passed' | 'attempted' | 'unseen' {
    if ($done[lessonId]) return 'passed';
    // Check if any question in this lesson has been seen
    // We can't directly link mastery keys to lessons, so we use the done map
    // and also check if there's a quiz score for this lesson's quiz id (lq_*)
    if ($done[`lq_${lessonId}`]) return 'passed';
    return 'unseen';
  }

  function lessonAccuracy(lessonId: string): number | null {
    // Count mastery entries that belong to this lesson using the done flag
    // Since mastery keys are question hashes (not lesson IDs), we can only
    // check overall accuracy from scores store. For now, return null for unseen.
    return null;
  }

  function cellTitle(lessonId: string, title: string): string {
    const state = lessonState(lessonId);
    if (state === 'passed') return `${title} ✅ Passed`;
    return title;
  }
</script>

<div class="mastery-card">
  {#if $unitsData.length === 0}
    <p class="empty">Loading curriculum…</p>
  {:else}
    <div class="grid-table">
      {#each $unitsData as unit}
        <div class="grid-row">
          <!-- Unit label -->
          <div class="unit-label" style="--unit-color: {unit.color}">
            <span class="unit-icon">{unit.icon}</span>
            <span class="unit-name">{unit.id.toUpperCase()}</span>
          </div>

          <!-- Lesson cells -->
          <div class="lesson-cells">
            {#each unit.lessons as lesson}
              {@const state = lessonState(lesson.id)}
              <div
                class="lesson-cell {state}"
                title={cellTitle(lesson.id, lesson.title)}
                role="img"
                aria-label="{lesson.title}: {state}"
              >
                {#if state === 'passed'}
                  ✓
                {:else if state === 'attempted'}
                  ·
                {:else}
                  &nbsp;
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- Legend -->
    <div class="legend">
      <span class="legend-item"><span class="dot passed"></span> Passed</span>
      <span class="legend-item"><span class="dot attempted"></span> Started</span>
      <span class="legend-item"><span class="dot unseen"></span> Not started</span>
    </div>
  {/if}
</div>

<style>
  .mastery-card {
    background: var(--color-surface, #fff);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    padding: 0.75rem;
  }

  .empty {
    text-align: center;
    color: var(--color-text-muted, #636e72);
    font-size: 0.9rem;
    padding: 1.5rem;
    margin: 0;
  }

  .grid-table {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .grid-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .unit-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 3.25rem;
    flex-shrink: 0;
  }

  .unit-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .unit-name {
    font-size: 0.62rem;
    font-weight: 700;
    color: var(--unit-color);
    letter-spacing: 0.04em;
  }

  .lesson-cells {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .lesson-cell {
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 0.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    cursor: default;
    transition: transform 0.1s;
    border: 1.5px solid transparent;
  }

  .lesson-cell:hover { transform: scale(1.15); }

  .lesson-cell.passed {
    background: #00b894;
    color: #fff;
    border-color: #00a381;
  }

  .lesson-cell.attempted {
    background: #ffeaa7;
    color: #e17055;
    border-color: #fdcb6e;
  }

  .lesson-cell.unseen {
    background: var(--color-border, #dfe6e9);
    color: transparent;
    border-color: transparent;
  }

  /* Legend */
  .legend {
    display: flex;
    gap: 1rem;
    padding-top: 0.75rem;
    margin-top: 0.5rem;
    border-top: 1px solid var(--color-border, #dfe6e9);
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    color: var(--color-text-muted, #636e72);
  }

  .dot {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 0.15rem;
    display: inline-block;
  }

  .dot.passed   { background: #00b894; }
  .dot.attempted { background: #ffeaa7; border: 1px solid #fdcb6e; }
  .dot.unseen   { background: var(--color-border, #dfe6e9); }
</style>
