<script lang="ts">
  /**
   * History screen — 1:1 port of legacy #history-screen.
   *
   * Legacy HTML structure (index.html):
   *   .bar (Home button + "Score History" title)
   *   .sc-in
   *     .stat-grid  (Total Quizzes, Avg Score, Unit Quizzes, Perfect Scores)
   *     .filt-row   (All / Lesson / Unit filter pills)
   *     .sc-scroll-box > .sc-list  (score cards)
   *
   * Clicking a card opens .sc-lightbox (bottom sheet) with full review.
   * Ported from buildHistory() + renderScList() + openScLightbox() in src/ui.js.
   */

  import { goto } from '$app/navigation';
  import { scores } from '$lib/stores';
  import type { ScoreEntry } from '$lib/types';

  let histFilter = $state<'all' | 'lesson' | 'unit'>('all');
  let lightboxEntry = $state<ScoreEntry | null>(null);

  // ── Stats (mirrors buildHistory() tile() calls) ──────────────────────────────
  const total        = $derived($scores.length);
  const avg          = $derived(total ? Math.round($scores.reduce((a, b) => a + b.pct, 0) / total) : 0);
  const unitQ        = $derived($scores.filter(s => s.type === 'unit').length);
  const perfect      = $derived($scores.filter(s => s.pct === 100).length);

  // ── Filtered list (mirrors renderScList histFilter logic) ────────────────────
  const filtered = $derived(
    histFilter === 'all' ? [...$scores].reverse()
    : [...$scores].filter(s => s.type === histFilter).reverse()
  );

  // ── Helpers (mirrors legacy pctColor / cardAccent inline logic) ──────────────
  function pctColor(s: ScoreEntry): string {
    if (s.abandoned) return '#e67e22';
    if (s.quit)      return '#e74c3c';
    return s.pct >= 80 ? '#27ae60' : s.pct >= 60 ? '#e67e22' : '#e74c3c';
  }

  function cardAccent(s: ScoreEntry): string {
    if (s.abandoned) return '#e67e22';
    if (s.quit)      return '#e74c3c';
    return s.color ?? '#7f8c8d';
  }
</script>

<div class="sc" id="history-screen">
  <!-- Bar — matches legacy .bar with position:relative so title can absolute-center -->
  <div class="bar" style="position:relative">
    <button class="bar-back" style="color:#27ae60" type="button" onclick={() => goto('/')}>Home</button>
    <div class="bar-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round"
           style="width:1em;height:1em;vertical-align:middle;margin-right:4px">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
      Score History
    </div>
  </div>

  <div class="sc-in">

    <!-- Stats grid (mirrors buildHistory tile() — 4 tiles) -->
    <div class="stat-grid" id="hist-stats">
      <div class="stat-tile">
        <div class="stat-num" style="color:#e74c3c">{total}</div>
        <div class="stat-lbl">Total Quizzes</div>
      </div>
      <div class="stat-tile">
        <div class="stat-num" style="color:#27ae60">{avg}%</div>
        <div class="stat-lbl">Average Score</div>
      </div>
      <div class="stat-tile">
        <div class="stat-num" style="color:#8e44ad">{unitQ}</div>
        <div class="stat-lbl">Unit Quizzes</div>
      </div>
      <div class="stat-tile">
        <div class="stat-num" style="color:#f1c40f">{perfect}</div>
        <div class="stat-lbl">Perfect Scores!</div>
      </div>
    </div>

    <!-- Filter pills (mirrors setFilt buttons) -->
    <div class="filt-row" id="hist-filt">
      <button type="button" class="filt {histFilter === 'all'    ? 'on' : ''}" onclick={() => histFilter = 'all'}>All Quizzes</button>
      <button type="button" class="filt {histFilter === 'lesson' ? 'on' : ''}" onclick={() => histFilter = 'lesson'}>Lesson Quizzes</button>
      <button type="button" class="filt {histFilter === 'unit'   ? 'on' : ''}" onclick={() => histFilter = 'unit'}>Unit Quizzes</button>
    </div>

    <!-- Score list (mirrors renderScList sc-card output) -->
    <div class="sc-scroll-box">
      <div class="sc-list" id="sc-list">
        {#if filtered.length === 0}
          <div class="empty">📭 No scores yet! Take a quiz to see your results here.</div>
        {:else}
          {#each filtered as s}
            {@const accent = cardAccent(s)}
            {@const color  = pctColor(s)}
            <div class="sc-card"
                 style="border-left:4px solid {accent}"
                 role="button"
                 tabindex="0"
                 aria-label="{s.name}, {s.abandoned || s.quit ? 'did not finish' : s.pct + '%, ' + s.score + ' of ' + s.total}, {s.date}"
                 onclick={() => lightboxEntry = s}
                 onkeydown={(e) => e.key === 'Enter' && (lightboxEntry = s)}>
              <div class="sc-card-header">
                <div>
                  <div class="sc-name">{s.name}</div>
                  <div class="sc-type">
                    {s.label}
                    {#if s.abandoned}<span style="color:#e67e22;font-size:var(--fs-sm);font-family:'Boogaloo',cursive"> ⚠️ Abandoned</span>{/if}
                    {#if s.quit}<span style="color:#e74c3c;font-size:var(--fs-sm);font-family:'Boogaloo',cursive"> 🚫 Quit</span>{/if}
                  </div>
                  <div class="sc-date">{s.date} · {s.time}{s.timeTaken ? ` · ⏱ ${s.timeTaken}` : ''}</div>
                </div>
                <div style="text-align:center;flex-shrink:0">
                  <span class="sc-stars" aria-hidden="true">{s.abandoned || s.quit ? '' : s.stars}</span>
                  <div><span class="sc-grade" style="background:{accent}20;color:{accent}">{s.score}/{s.total}</span></div>
                  <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-base);color:{color}">
                    {s.abandoned || s.quit ? 'DNF' : s.pct + '%'}
                  </div>
                </div>
                <div class="sc-chevron" aria-hidden="true">▸</div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

  </div>
</div>

<!-- Score detail lightbox (mirrors openScLightbox / _buildScReviewHtml) -->
{#if lightboxEntry}
  {@const s      = lightboxEntry}
  {@const accent = cardAccent(s)}
  {@const color  = pctColor(s)}
  {@const wrong  = s.answers?.filter(a => !a.ok) ?? []}
  {@const right  = s.answers?.filter(a =>  a.ok) ?? []}

  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="sc-lightbox open" onclick={(e) => { if (e.target === e.currentTarget) lightboxEntry = null; }}>
    <div class="sc-lightbox-box">

      <!-- Head — mirrors headHtml in _buildScReviewHtml -->
      <div class="sc-lightbox-head">
        <button type="button" class="sc-lightbox-close" onclick={() => lightboxEntry = null}>✕</button>
        <div class="sc-name" style="font-size:var(--fs-md)">{s.name}</div>
        <div class="sc-type">
          {s.label}
          {#if s.abandoned}<span style="color:#e67e22;font-size:var(--fs-sm);font-family:'Boogaloo',cursive"> ⚠️ Abandoned</span>{/if}
          {#if s.quit}<span style="color:#e74c3c;font-size:var(--fs-sm);font-family:'Boogaloo',cursive"> 🚫 Quit</span>{/if}
        </div>
        <div class="sc-date" style="margin-top:4px">{s.date} · {s.time}{s.timeTaken ? ` · ⏱ ${s.timeTaken}` : ''}</div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:12px">
          <span class="sc-stars" style="font-size:var(--fs-lg)">
            {s.abandoned ? '⚠️' : s.quit ? '🚫' : s.stars}
          </span>
          <span class="sc-grade" style="background:{accent}20;color:{accent}">{s.score}/{s.total}</span>
          <span style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);color:{color}">
            {s.abandoned || s.quit ? 'DNF' : s.pct + '%'}
          </span>
        </div>
      </div>

      <!-- Body — mirrors bodyHtml in _buildScReviewHtml -->
      <div class="sc-lightbox-body">
        {#if s.answers?.length}
          {#if wrong.length}
            <div class="sc-rev-sec" style="color:#e74c3c">❌ Incorrect ({wrong.length})</div>
            {#each wrong as a}
              <div class="sc-rev-item sc-rev-wrong">
                <div class="sc-rev-q">{#if a.t?.includes('<')}{@html a.t}{:else}{a.t}{/if}</div>
                <div class="sc-rev-your">Your answer: <span style="color:#e74c3c">{a.chosen != null && a.opts ? (a.opts[a.chosen] ?? '') : ''}</span></div>
                <div class="sc-rev-correct">✅ Correct: <span style="color:#27ae60">{a.opts ? (a.opts[a.correct] ?? '') : ''}</span></div>
                {#if a.timeSecs != null}<div class="sc-rev-time">⏱ {a.timeSecs}s</div>{/if}
              </div>
            {/each}
          {/if}
          {#if right.length}
            <div class="sc-rev-sec" style="color:#27ae60">✅ Correct ({right.length})</div>
            {#each right as a}
              <div class="sc-rev-item sc-rev-right">
                <div class="sc-rev-q">{#if a.t?.includes('<')}{@html a.t}{:else}{a.t}{/if}</div>
                <div class="sc-rev-correct" style="color:#27ae60">✅ {a.opts ? (a.opts[a.correct] ?? '') : ''}</div>
                {#if a.timeSecs != null}<div class="sc-rev-time">⏱ {a.timeSecs}s</div>{/if}
              </div>
            {/each}
          {/if}
        {:else}
          <div style="color:var(--txt2);font-size:var(--fs-sm);padding:10px">No question detail available for this attempt.</div>
        {/if}
      </div>

    </div>
  </div>
{/if}

<style>
  /* History screen layout — mirrors #history-screen.on flex column */
  #history-screen {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  #history-screen :global(.sc-in) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    max-width: 780px;
    margin: 0 auto;
    width: 100%;
    padding: 20px 16px env(safe-area-inset-bottom);
    display: flex;
    flex-direction: column;
  }
</style>
