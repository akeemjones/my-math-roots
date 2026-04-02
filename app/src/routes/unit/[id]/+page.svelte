<script lang="ts">
  /**
   * /unit/[id] — Unit detail page. Direct port of legacy openUnit() in src/unit.js.
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { unitsData, scores, hasPassed, bestScore, settings } from '$lib/stores';
  import { loadUnit } from '$lib/boot';

  const LOCK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;

  const unitId = $derived($page.params.id);
  const unit   = $derived($unitsData.find(u => u.id === unitId) ?? null);

  let loading = $state(false);

  // ── Lesson unlock logic ─────────────────────────────────────────────────────
  function isLessonUnlocked(i: number): boolean {
    if ($settings.freeMode || i === 0) return true;
    return $hasPassed('lq_' + unit!.lessons[i - 1].id);
  }

  // ── Unit quiz state ─────────────────────────────────────────────────────────
  const uqUnlocked = $derived.by(() => {
    if (!unit) return false;
    if ($settings.freeMode) return true;
    return unit.lessons.every(l => $hasPassed('lq_' + l.id));
  });

  const uqBestPct = $derived(unit ? $bestScore(unit.id + '_uq') : 0);
  const uqPassed  = $derived(uqBestPct >= 80);

  const nextUnit = $derived.by(() => {
    if (!unit) return null;
    const idx = $unitsData.findIndex(u => u.id === unit!.id);
    return idx >= 0 && idx + 1 < $unitsData.length ? $unitsData[idx + 1] : null;
  });

  // ── Paused unit quiz ────────────────────────────────────────────────────────
  const PAUSE_KEY = 'wb_quiz_pause';
  let pausedUQ = $state<{ idx: number; score: number; questions: unknown[] } | null>(null);

  function refreshPaused() {
    if (!unit) return;
    try {
      const all = JSON.parse(localStorage.getItem(PAUSE_KEY) ?? '{}');
      pausedUQ = all[unit.id + '_uq'] ?? null;
    } catch { pausedUQ = null; }
  }

  $effect(() => { if (unit) refreshPaused(); });

  // ── Locked lesson bottom sheet ──────────────────────────────────────────────
  type LockedData = { lockedTitle: string; lockedIcon: string; prevTitle: string; prevIcon: string; prevId: string; prevPct: number };
  let lockedSheet = $state<LockedData | null>(null);

  function openLockedSheet(i: number) {
    if (!unit) return;
    const locked = unit.lessons[i];
    const prev   = unit.lessons[i - 1];
    const prevPct = $bestScore('lq_' + prev.id);
    lockedSheet = {
      lockedTitle: locked.title, lockedIcon: locked.icon ?? '',
      prevTitle: prev.title,   prevIcon: prev.icon ?? '',
      prevId: prev.id, prevPct,
    };
  }
  function closeLockedSheet() { lockedSheet = null; }

  function pctColor(pct: number)  { return pct >= 80 ? '#27ae60' : pct >= 50 ? '#e67e22' : '#e74c3c'; }
  function pctLabel(pct: number)  { return pct >= 80 ? '✅ You passed!' : pct > 0 ? `Your best: ${pct}%` : 'Not attempted yet'; }
  function encouragement(pct: number) {
    return pct >= 70 ? "You're so close! One more try and you've got it."
         : pct >= 50 ? "You're making great progress — keep going!"
         : "Review the lesson and try the quiz when you're ready!";
  }

  onMount(async () => {
    if (!unitId) return;
    loading = true;
    await loadUnit(unitId);
    loading = false;
    refreshPaused();
  });
</script>

{#if !unit}
  <main class="sc" style="display:flex;align-items:center;justify-content:center;min-height:100dvh">
    <p style="color:var(--txt2)">Unit not found.</p>
    <button type="button" class="bar-back" onclick={() => goto('/')} style="margin-left:8px">← Back</button>
  </main>
{:else}
  <div class="sc" id="unit-screen">

    <!-- Bar -->
    <div class="bar">
      <button type="button" class="bar-back" style="color:{unit.color}" onclick={() => goto('/')} aria-label="Back to home">Home</button>
      <span class="bar-title">{unit.name}</span>
    </div>

    <!-- TEKS strip -->
    <div class="les-teks-bar">{unit.teks}</div>

    <div class="sc-in">

      <!-- Unit banner — no progress bar (matches legacy) -->
      <div class="unit-banner" style="background:linear-gradient(135deg,{unit.color},{unit.color}cc)">
        <h2>
          {#if unit.svg}
            <span style="display:inline-block;width:1.5em;height:1.5em;vertical-align:middle" aria-hidden="true">{@html unit.svg}</span>
          {:else}
            <span style="display:inline-block;width:1.5em;height:1.5em;vertical-align:middle" aria-hidden="true">{unit.icon}</span>
          {/if}
          {unit.name}
        </h2>
        <p>{unit.lessons.length} lessons to explore</p>
        <div class="unit-teks">{unit.teks}</div>
      </div>

      <!-- Section label — outside lesson-glass-wrap, matches legacy index.html:260 -->
      <div class="sec-label">📖 Lessons</div>

      <!-- Lesson cards -->
      <div class="lesson-glass-wrap">
        {#if loading && !unit._loaded}
          <p style="color:var(--txt2);padding:8px">Loading lessons…</p>
        {:else}
          <div class="lcard-grid">
            {#each unit.lessons as lesson, i}
              {@const unlocked = isLessonUnlocked(i)}
              {@const lqBest   = $bestScore('lq_' + lesson.id)}
              {@const lqPassed = lqBest >= 80}
              {@const allAttempts = $scores.filter(s => s.qid === 'lq_' + lesson.id)}
              {@const avgPct = allAttempts.length
                ? Math.round(allAttempts.reduce((s, x) => s + x.pct, 0) / allAttempts.length)
                : null}

              {#if unlocked}
                <!-- Unlocked lesson card -->
                <div class="lcard"
                     role="button" tabindex="0"
                     style="--uc:{unit.color}"
                     aria-label="Lesson {i+1}, {lesson.title}{lqPassed ? ', completed' : lqBest > 0 ? ', best score ' + lqBest + '%' : ''}"
                     onclick={() => goto(`/lesson/${lesson.id}`)}
                     onkeydown={(e) => e.key === 'Enter' && goto(`/lesson/${lesson.id}`)}>
                  <div class="lcard-num" style="background:{unit.color}" aria-hidden="true">{i + 1}</div>
                  <div class="lcard-info">
                    <div class="lcard-title">{lesson.icon} {lesson.title}</div>
                    {#if lesson.desc}
                      <div class="lcard-desc">{lesson.desc}</div>
                    {/if}
                  </div>
                  <div class="lcard-badges">
                    {#if lqPassed}
                      <span class="badge badge-done">Passed ✅</span>
                    {:else if lqBest > 0}
                      <span class="badge" style="background:#fef9e7;color:#d4ac0d">Best: {lqBest}%</span>
                    {/if}
                    {#if avgPct !== null}
                      <span class="badge" style="background:{avgPct>=80?'#eafaf1':avgPct>=50?'#fef6ec':'#fef0f0'};color:{avgPct>=80?'#1e8449':avgPct>=50?'#d35400':'#c0392b'}">{avgPct}% avg</span>
                    {/if}
                  </div>
                </div>
              {:else}
                <!-- Locked lesson card -->
                <div class="lcard lcard-locked"
                     role="button" tabindex="0"
                     aria-label="Lesson {i+1}, {lesson.title}, locked"
                     onclick={() => openLockedSheet(i)}
                     onkeydown={(e) => e.key === 'Enter' && openLockedSheet(i)}>
                  <div class="lcard-num" style="background:#aab;color:#fff" aria-hidden="true">{i + 1}</div>
                  <div class="lcard-info">
                    <div class="lcard-title" style="color:var(--txt2)">
                      <span style="filter:grayscale(1);opacity:.45" aria-hidden="true">{lesson.icon}</span> {lesson.title}
                    </div>
                    <div class="lcard-desc">
                      {lqBest > 0 ? `Score 80%+ to unlock → Your best: ${lqBest}%` : `Score 80%+ on Lesson ${i+1} quiz to unlock`}
                    </div>
                  </div>
                  <div class="lcard-badges">
                    <span class="cs-lock-hint" aria-hidden="true">{@html LOCK_SVG}</span>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>

      <!-- Resume banner (shown above uq-btn when paused) -->
      {#if uqUnlocked && pausedUQ}
        <div id="uq-resume-area">
          <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
          <div class="resume-banner" style="margin-bottom:12px;cursor:pointer"
               onclick={() => goto(`/quiz/${unit.id}_uq`)}>
            <div>
              <div class="resume-banner-h">⏸ Unit Quiz In Progress</div>
              <div class="resume-banner-sub">
                Question {(pausedUQ as any).idx + 1} of {(pausedUQ as any).questions.length} · {(pausedUQ as any).score} correct so far
              </div>
            </div>
            <button type="button" class="resume-btn" onclick={(e) => { e.stopPropagation(); goto(`/quiz/${unit.id}_uq`); }}>▶ Resume</button>
          </div>
        </div>
      {:else if uqUnlocked && uqPassed && nextUnit}
        <!-- Passed state: retake link above next-unit button -->
        <div id="uq-resume-area">
          <div class="uq-retake">
            <button type="button" onclick={() => goto(`/quiz/${unit.id}_uq`)}>↩ Retake Unit Quiz</button>
          </div>
        </div>
      {:else}
        <div id="uq-resume-area"></div>
      {/if}

      <!-- Unit quiz button -->
      {#if uqUnlocked && !pausedUQ && uqPassed && nextUnit}
        <button type="button" class="uq-btn" style="--uc:{nextUnit.color}" onclick={() => goto(`/unit/${nextUnit.id}`)}>
          <div class="uq-btn-ico" aria-hidden="true">{nextUnit.icon}</div>
          <div class="uq-btn-left">
            <h3 style="color:{nextUnit.color}">Next Unit: {nextUnit.name} →</h3>
            <p>Unit quiz passed ✅ {uqBestPct}%</p>
          </div>
        </button>

      {:else if uqUnlocked && !pausedUQ}
        <button type="button" class="uq-btn" style="--uc:{unit.color}" onclick={() => goto(`/quiz/${unit.id}_uq`)}>
          <div class="uq-btn-ico" aria-hidden="true">{uqBestPct >= 80 ? '✅' : '▶️'}</div>
          <div class="uq-btn-left">
            <h3 style="color:{unit.color}">Unit Quiz — 25 Questions</h3>
            <p>{uqBestPct > 0 ? `Best score: ${uqBestPct}% — need 80%+ to unlock next unit` : 'Test everything you learned in this unit!'}</p>
          </div>
        </button>

      {:else if !pausedUQ}
        <!-- Locked -->
        <button type="button" class="uq-btn" style="--uc:#aab;opacity:.6;cursor:default" disabled>
          <div class="uq-btn-ico" aria-hidden="true">{@html LOCK_SVG}</div>
          <div class="uq-btn-left">
            <h3 style="color:#aab">Unit Quiz — 25 Questions</h3>
            <p>Complete all lessons with 80%+ to unlock</p>
          </div>
        </button>
      {/if}

    </div><!-- /.sc-in -->

  </div>
{/if}

<!-- Locked lesson action sheet -->
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
{#if lockedSheet}
  {@const s = lockedSheet}
  <div class="locked-sheet-overlay open" onclick={(e) => { if (e.target === e.currentTarget) closeLockedSheet(); }}>
    <div class="locked-sheet">
      <div class="locked-sheet-handle"></div>
      <div class="locked-sheet-lock" style="color:{unit?.color}">🔒</div>
      <div class="locked-sheet-title">{s.lockedIcon} {s.lockedTitle}</div>
      <div class="locked-sheet-sub">This lesson is locked</div>
      <div class="locked-sheet-req">
        To unlock, score <strong>80%+</strong> on the <strong>{s.prevIcon} {s.prevTitle}</strong> quiz
      </div>
      <div class="locked-sheet-score" style="color:{pctColor(s.prevPct)}">{pctLabel(s.prevPct)}</div>
      <div class="locked-sheet-enc">{encouragement(s.prevPct)}</div>
      <button
        type="button"
        class="locked-sheet-cta"
        style="background:{unit?.color}"
        onclick={() => { closeLockedSheet(); goto(`/lesson/${s.prevId}`); }}
      >
        {s.prevPct > 0 ? '🔄 Try That Quiz Again' : `📖 Go to ${s.prevTitle}`}
      </button>
      <button type="button" class="locked-sheet-dismiss" onclick={closeLockedSheet}>
        Come Back Later
      </button>
    </div>
  </div>
{/if}

<style>
  #unit-screen {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  #unit-screen :global(.sc-in) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 860px;
    margin: 0 auto;
    width: 100%;
    padding: 10px 16px calc(8px + env(safe-area-inset-bottom));
  }

  #unit-screen :global(.sc-in > *) {
    margin-bottom: 0;
  }

  #unit-screen :global(.lesson-glass-wrap) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    margin-bottom: 0;
    max-height: calc(100dvh - 340px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  }
</style>
