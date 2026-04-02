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

  import { unitsData, done, scores } from '$lib/stores';

  function lessonState(lessonId: string): 'pass' | 'attempt' | 'untouched' {
    if ($done[lessonId] || $done[`lq_${lessonId}`]) return 'pass';
    // Attempted = has a score entry for this lesson's quiz but not yet passed
    if ($scores.some(s => s.qid === lessonId || s.qid === `lq_${lessonId}`)) return 'attempt';
    return 'untouched';
  }

  function cellTitle(lessonId: string, title: string): string {
    const state = lessonState(lessonId);
    if (state === 'pass') return `${title} ✅ Passed`;
    return title;
  }
</script>

<div class="mg-card">
  {#if $unitsData.length === 0}
    <p class="mg-empty">Loading curriculum…</p>
  {:else}
    <div class="mg-grid">
      {#each $unitsData as unit}
        <div class="mg-row">
          <!-- Unit label -->
          <div class="mg-unit-label">
            <span class="mg-unit-ico">{unit.icon}</span>
            <span class="mg-unit-name" style="color: {unit.color}">{unit.id.toUpperCase()}</span>
          </div>

          <!-- Lesson cells -->
          <div class="mg-cells">
            {#each unit.lessons as lesson}
              {@const state = lessonState(lesson.id)}
              <div
                class="mg-cell {state}"
                title={cellTitle(lesson.id, lesson.title)}
                role="img"
                aria-label="{lesson.title}: {state}"
              >
                {#if state === 'pass'}
                  ✓
                {:else if state === 'attempt'}
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
    <div class="mg-legend">
      <span class="mg-legend-item"><span class="mg-dot pass"></span> Passed</span>
      <span class="mg-legend-item"><span class="mg-dot attempt"></span> Started</span>
      <span class="mg-legend-item"><span class="mg-dot untouched"></span> Not started</span>
    </div>
  {/if}
</div>

<style>
  .mg-empty {
    font-size: .9rem;
    color: #90a4ae;
    text-align: center;
    padding: 12px 0;
    margin: 0;
  }

  .mg-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mg-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mg-unit-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 36px;
    flex-shrink: 0;
  }

  .mg-unit-ico { font-size: 1.15rem; line-height: 1; }

  .mg-unit-name {
    font-size: .58rem;
    font-weight: 800;
    letter-spacing: .4px;
    text-transform: uppercase;
  }

  .mg-cells {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
  }

  .mg-cell {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .72rem;
    font-weight: 700;
  }

  .mg-cell.pass {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1.5px solid #a5d6a7;
  }

  .mg-cell.attempt {
    background: #fff8e1;
    color: #f57f17;
    border: 1.5px solid #ffe082;
    font-size: 1rem;
    line-height: 1;
  }

  .mg-cell.untouched {
    background: #f5f5f5;
    border: 1.5px solid #e0e0e0;
  }

  /* Legend */
  .mg-legend {
    display: flex;
    gap: 14px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .mg-legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: .72rem;
    color: #546e7a;
  }

  .mg-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .mg-dot.pass      { background: #a5d6a7; border: 1px solid #66bb6a; }
  .mg-dot.attempt   { background: #ffe082; border: 1px solid #ffca28; }
  .mg-dot.untouched { background: #e0e0e0; border: 1px solid #bdbdbd; }
</style>
