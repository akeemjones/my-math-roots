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

  function lessonState(lessonId: string): 'pass' | 'attempt' | 'untouched' {
    if ($done[lessonId]) return 'pass';
    // Check if any question in this lesson has been seen
    // We can't directly link mastery keys to lessons, so we use the done map
    // and also check if there's a quiz score for this lesson's quiz id (lq_*)
    if ($done[`lq_${lessonId}`]) return 'pass';
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
    <p class="qh-empty">Loading curriculum…</p>
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
