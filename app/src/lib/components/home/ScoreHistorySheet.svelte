<script lang="ts">
  import { scores } from '$lib/stores';
  import type { ScoreEntry, QuizAnswer } from '$lib/types';

  let { onClose }: { onClose: () => void } = $props();

  type FilterType = 'all' | 'lesson' | 'unit';
  let histFilter = $state<FilterType>('all');
  let selected   = $state<ScoreEntry | null>(null);

  const filtered = $derived(
    histFilter === 'all'
      ? [...$scores]
      : [...$scores].filter(s => s.type === histFilter)
  );

  // Stats (always over all scores, not filtered — matches legacy)
  const total   = $derived($scores.length);
  const avg     = $derived(total ? Math.round($scores.reduce((a, b) => a + b.pct, 0) / total) : 0);
  const unitQ   = $derived($scores.filter(s => s.type === 'unit').length);
  const perfect = $derived($scores.filter(s => s.pct === 100).length);

  function pctColor(s: ScoreEntry): string {
    if (s.abandoned) return '#e67e22';
    if (s.quit)      return '#e74c3c';
    return s.pct >= 80 ? '#27ae60' : s.pct >= 60 ? '#e67e22' : '#e74c3c';
  }

  function cardAccent(s: ScoreEntry): string {
    if (s.abandoned) return '#e67e22';
    if (s.quit)      return '#e74c3c';
    return s.color || '#7f8c8d';
  }

  function displayStars(s: ScoreEntry): string {
    return (s.abandoned || s.quit) ? '' : s.stars;
  }

  function displayPct(s: ScoreEntry): string {
    return (s.abandoned || s.quit) ? 'DNF' : s.pct + '%';
  }

  function chosenText(a: QuizAnswer): string {
    return a.chosen !== null ? (a.opts?.[a.chosen] ?? '—') : 'No answer';
  }

  function correctText(a: QuizAnswer): string {
    return a.opts?.[a.correct] ?? '—';
  }

  function deleteEntry(e: MouseEvent | KeyboardEvent, entry: ScoreEntry) {
    e.stopPropagation();
    scores.update(s => s.filter(x => x.id !== entry.id));
    if (selected?.id === entry.id) selected = null;
  }
</script>

<!-- Full-screen sheet — matches #history-screen .sc -->
<div class="hs-screen">

  <!-- Top bar — matches .bar + history-screen .bar -->
  <div class="hs-bar">
    <button type="button" class="hs-back" onclick={onClose}>Home</button>
    <div class="hs-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">
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

  <!-- Body — matches #history-screen .sc-in -->
  <div class="hs-body">

    <!-- Stats — matches .stat-grid / .stat-tile -->
    <div class="stat-grid">
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

    <!-- Filter row — matches .filt-row / .filt -->
    <div class="filt-row">
      {#each (['all', 'lesson', 'unit'] as FilterType[]) as f}
        <button
          type="button"
          class="filt {histFilter === f ? 'on' : ''}"
          onclick={() => histFilter = f}
        >{{ all: 'All Quizzes', lesson: 'Lesson Quizzes', unit: 'Unit Quizzes' }[f]}</button>
      {/each}
    </div>

    <!-- Scroll box — matches .sc-scroll-box / .sc-list -->
    <div class="sc-scroll-box">
      <div class="sc-list">
        {#if filtered.length === 0}
          <div class="empty">📭 No scores yet! Take a quiz to see your results here.</div>
        {:else}
          {#each filtered as entry}
            {@const accent = cardAccent(entry)}
            <!-- svelte-ignore a11y_interactive_supports_focus -->
            <div
              class="sc-card"
              style="border-left:4px solid {accent}"
              role="button"
              tabindex="0"
              aria-label="{entry.name ?? 'Student'}, {(entry.abandoned||entry.quit) ? 'did not finish' : entry.pct+'%, '+entry.score+' of '+entry.total}, {entry.date}"
              onclick={() => selected = entry}
              onkeydown={(e) => e.key === 'Enter' && (selected = entry)}
            >
              <div class="sc-card-header">
                <div>
                  <div class="sc-name">{entry.name ?? 'Student'}</div>
                  <div class="sc-type">
                    {entry.label}
                    {#if entry.abandoned}<span style="color:#e67e22;font-size:var(--fs-sm);font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif">⚠️ Abandoned</span>{/if}
                    {#if entry.quit}<span style="color:#e74c3c;font-size:var(--fs-sm);font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif">🚫 Quit</span>{/if}
                  </div>
                  <div class="sc-date">{entry.date} · {entry.time}{entry.timeTaken ? ` · ⏱ ${entry.timeTaken} mins` : ''}</div>
                </div>
                <div style="text-align:center;flex-shrink:0">
                  <span class="sc-stars" aria-hidden="true">{displayStars(entry)}</span>
                  <div><span class="sc-grade" style="background:{accent}20;color:{accent}">{entry.score}/{entry.total}</span></div>
                  <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-base);color:{pctColor(entry)}">{displayPct(entry)}</div>
                </div>
                <div class="sc-chevron" aria-hidden="true">▸</div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

  </div><!-- .hs-body -->

</div><!-- .hs-screen -->

<!-- Score review lightbox — matches .sc-lightbox / .sc-lightbox-box -->
{#if selected}
  {@const s = selected}
  {@const accent = cardAccent(s)}
  {@const wrong = s.answers.filter(a => !a.ok)}
  {@const right = s.answers.filter(a => a.ok)}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="sc-lightbox open" onclick={() => selected = null}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="sc-lightbox-box" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">

      <div class="sc-lightbox-head">
        <button type="button" class="sc-lightbox-close" onclick={() => selected = null}>✕</button>
        <div class="sc-name" style="font-size:var(--fs-md)">{s.name ?? 'Student'}</div>
        <div class="sc-type">
          {s.label}
          {#if s.abandoned}<span style="color:#e67e22;font-size:var(--fs-sm);font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif">⚠️ Abandoned</span>{/if}
          {#if s.quit}<span style="color:#e74c3c;font-size:var(--fs-sm);font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif">🚫 Quit</span>{/if}
        </div>
        <div class="sc-date" style="margin-top:4px">{s.date} · {s.time}{s.timeTaken ? ` · ⏱ ${s.timeTaken} mins` : ''}</div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:12px">
          <span class="sc-stars" style="font-size:var(--fs-lg)">{s.abandoned ? '⚠️' : s.quit ? '🚫' : s.stars}</span>
          <span class="sc-grade" style="background:{accent}20;color:{accent}">{s.score}/{s.total}</span>
          <span style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);color:{pctColor(s)}">{displayPct(s)}</span>
        </div>
        <button
          type="button"
          class="sc-del"
          style="margin-top:12px"
          onclick={(e) => { deleteEntry(e, s); selected = null; }}
        >🗑 Delete This Score</button>
      </div>

      <div class="sc-lightbox-body">
        {#if s.answers.length === 0}
          <div style="color:var(--txt2);font-size:var(--fs-sm);padding:10px">No question detail available for this attempt.</div>
        {:else}
          {#if wrong.length}
            <div class="sc-rev-sec" style="color:#e74c3c">❌ Incorrect ({wrong.length})</div>
            {#each wrong as a}
              <div class="sc-rev-item sc-rev-wrong">
                <div class="sc-rev-q">{a.t}</div>
                <div class="sc-rev-your">Your answer: <span style="color:#e74c3c">{chosenText(a)}</span></div>
                <div class="sc-rev-correct">✅ Correct: <span style="color:#27ae60">{correctText(a)}</span></div>
                {#if a.timeSecs != null}<div class="sc-rev-time">⏱ {a.timeSecs}s</div>{/if}
              </div>
            {/each}
          {/if}
          {#if right.length}
            <div class="sc-rev-sec" style="color:#27ae60">✅ Correct ({right.length})</div>
            {#each right as a}
              <div class="sc-rev-item sc-rev-right">
                <div class="sc-rev-q">{a.t}</div>
                <div class="sc-rev-correct" style="color:#27ae60">✅ {correctText(a)}</div>
                {#if a.timeSecs != null}<div class="sc-rev-time">⏱ {a.timeSecs}s</div>{/if}
              </div>
            {/each}
          {/if}
        {/if}
      </div>

    </div>
  </div>
{/if}

<style>
  /* ── Full-screen sheet ── */
  .hs-screen {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: var(--bg, #e4eeff);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Top bar — matches .bar with green accent ── */
  .hs-bar {
    position: relative;
    display: flex;
    align-items: center;
    padding: 10px 14px;
    padding-top: calc(10px + env(safe-area-inset-top, 0px));
    background: var(--bg2, #fff);
    border-bottom: 1px solid var(--border, rgba(0,0,0,.11));
    flex-shrink: 0;
    min-height: 54px;
  }

  /* .bar-back with CSS chevron via ::before */
  .hs-back {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-md);
    padding: 8px 10px 8px 4px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #27ae60;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .hs-back::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-left: 2.5px solid currentColor;
    border-top: 2.5px solid currentColor;
    transform: rotate(-45deg);
    border-radius: 1px;
    flex-shrink: 0;
    margin-right: 1px;
  }
  .hs-back:hover { opacity: .6; }

  /* .bar-title — absolutely centred */
  .hs-title {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-xl);
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 43%;
    text-align: center;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--txt, #1a2535);
  }

  /* ── Body — matches #history-screen .sc-in ── */
  .hs-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    max-width: 780px;
    margin: 0 auto;
    width: 100%;
    padding: 32px 16px env(safe-area-inset-bottom, 16px);
    display: flex;
    flex-direction: column;
  }

  /* ── Stats grid — matches .stat-grid / .stat-tile ── */
  :global(.stat-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }
  :global(.stat-tile) {
    background: rgba(255,255,255,0.94);
    border: 1.5px solid rgba(255,255,255,0.82);
    border-radius: 18px;
    padding: 16px 12px;
    text-align: center;
    box-shadow: 0 4px 18px rgba(0,0,0,.10), inset 0 1px 0 rgba(255,255,255,0.92);
  }
  :global(.stat-num) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-2xl);
  }
  :global(.stat-lbl) {
    font-size: var(--fs-xs);
    color: #7f8c8d;
    font-weight: 800;
    margin-top: 3px;
  }

  /* ── Filter row — matches .filt-row / .filt ── */
  :global(.filt-row) {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  :global(.filt) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-sm);
    padding: 8px 18px;
    border-radius: 50px;
    border: 2.5px solid rgba(0,0,0,.1);
    background: #fff;
    cursor: pointer;
    transition: all .15s;
    color: #1a2535;
    -webkit-tap-highlight-color: transparent;
  }
  :global(.filt.on), :global(.filt:hover) {
    border-color: #27ae60;
    background: #27ae60;
    color: #fff;
  }

  /* ── Scroll box — matches .sc-scroll-box ── */
  :global(.sc-scroll-box) {
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    min-height: 0;
    max-height: 50dvh;
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,.25);
    background: rgba(255,255,255,.08);
    box-shadow: 0 8px 32px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.2);
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,.15) transparent;
    margin-bottom: 16px;
  }
  :global(.sc-scroll-box::-webkit-scrollbar) { width: 5px; }
  :global(.sc-scroll-box::-webkit-scrollbar-track) { background: transparent; }
  :global(.sc-scroll-box::-webkit-scrollbar-thumb) { background: rgba(0,0,0,.18); border-radius: 10px; }

  /* ── Score list — matches .sc-list ── */
  :global(.sc-list) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 12px;
  }

  /* ── Score card — matches .sc-card / .sc-card-header ── */
  :global(.sc-card) {
    background: rgba(255,255,255,0.94);
    border: 1.5px solid rgba(255,255,255,0.82);
    border-radius: 22px;
    margin-bottom: 0;
    box-shadow: 0 6px 24px rgba(0,0,0,.11), inset 0 1px 0 rgba(255,255,255,0.92);
    overflow: hidden;
    transition: box-shadow .15s;
    cursor: pointer;
  }
  :global(.sc-card:hover) { box-shadow: 0 6px 20px rgba(0,0,0,.14); }
  :global(.sc-card-header) {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    cursor: pointer;
    justify-content: space-between;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  :global(.sc-card-header:active) { background: var(--bg3, #eef3ff); }

  /* ── Card text elements ── */
  :global(.sc-name) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-base);
  }
  :global(.sc-type) {
    font-size: var(--fs-xs);
    color: var(--txt2, #5a7080);
    text-transform: uppercase;
    letter-spacing: .8px;
  }
  :global(.sc-date) {
    font-size: var(--fs-xs);
    color: var(--txt2, #5a7080);
    text-align: left;
  }
  :global(.sc-grade) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-md);
    padding: 5px 14px;
    border-radius: 50px;
  }
  :global(.sc-stars) {
    font-size: var(--fs-base);
    display: block;
    min-height: 1.4em;
  }
  :global(.sc-chevron) {
    font-size: var(--fs-lg);
    color: var(--txt2, #5a7080);
    flex-shrink: 0;
    transition: transform .2s;
  }

  /* ── Empty state ── */
  :global(.empty) {
    text-align: center;
    padding: 40px;
    color: #7f8c8d;
    font-size: var(--fs-base);
  }

  /* ── Lightbox — matches .sc-lightbox / .sc-lightbox-box ── */
  :global(.sc-lightbox) {
    position: fixed;
    inset: 0;
    background: transparent;
    z-index: 9500;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  :global(.sc-lightbox.open) { display: flex; }
  :global(.sc-lightbox-box) {
    background: linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(240,248,255,0.82) 55%, rgba(235,252,245,0.76) 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1.5px solid rgba(255,255,255,0.95);
    border-left: 1.5px solid rgba(255,255,255,0.75);
    border-right: 1.5px solid rgba(255,255,255,0.30);
    border-bottom: 1.5px solid rgba(255,255,255,0.20);
    border-radius: 28px;
    max-width: 520px;
    width: 100%;
    max-height: 82dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 56px rgba(60,120,200,0.14), 0 6px 18px rgba(0,0,0,0.09), inset 0 1.5px 0 rgba(255,255,255,0.98);
    animation: slideUp .25s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  :global(.sc-lightbox-head) {
    padding: 20px 20px 14px;
    border-bottom: 2px solid var(--border, rgba(0,0,0,.11));
    flex-shrink: 0;
  }
  :global(.sc-lightbox-body) {
    overflow-y: auto;
    padding: 14px 20px 20px;
    flex: 1;
    -webkit-overflow-scrolling: touch;
  }
  :global(.sc-lightbox-close) {
    float: right;
    font-size: var(--fs-xl);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--txt2, #5a7080);
    padding: 0 6px;
    line-height: 1;
    touch-action: manipulation;
  }
  :global(.sc-lightbox-close:hover) { color: var(--txt, #1a2535); }

  /* ── Delete button — matches .sc-del ── */
  :global(.sc-del) {
    background: rgba(231,76,60,.1);
    border: 1.5px solid rgba(231,76,60,.2);
    color: #e74c3c;
    border-radius: 8px;
    padding: 4px 10px;
    cursor: pointer;
    font-size: var(--fs-sm);
    transition: background .15s;
    font-family: 'Nunito', sans-serif;
  }
  :global(.sc-del:hover) { background: rgba(231,76,60,.22); }

  /* ── Review items — matches .sc-rev-* ── */
  :global(.sc-rev-sec) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-base);
    padding: 8px 0 4px;
    font-weight: 700;
  }
  :global(.sc-rev-item) {
    padding: 10px 12px;
    border-radius: 12px;
    margin-bottom: 8px;
  }
  :global(.sc-rev-wrong) { background: #fdecea; border-left: 3px solid #e74c3c; }
  :global(.sc-rev-right) { background: #eafaf1; border-left: 3px solid #27ae60; }
  :global(.sc-rev-q) {
    font-weight: 700;
    font-size: var(--fs-base);
    color: var(--txt, #1a2535);
    margin-bottom: 4px;
  }
  :global(.sc-rev-your) { font-size: var(--fs-sm); color: var(--txt2, #5a7080); }
  :global(.sc-rev-correct) { font-size: var(--fs-sm); margin-top: 3px; }
  :global(.sc-rev-time) { font-size: var(--fs-xs); color: var(--txt2, #5a7080); margin-top: 2px; }

  @keyframes -global-slideUp {
    from { opacity: 0; transform: translateY(40px) scale(.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  @media (max-width: 480px) {
    :global(.sc-lightbox-box) { max-height: 92dvh; }
    :global(.sc-lightbox-head) { padding: 10px 16px 8px; }
    :global(.sc-lightbox-body) { padding: 8px 16px 12px; }
  }
</style>
