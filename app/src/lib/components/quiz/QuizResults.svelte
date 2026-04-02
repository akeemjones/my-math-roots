<script lang="ts">
  /**
   * QuizResults — 1:1 with legacy #results-screen / _finishQuiz().
   *
   * Legacy HTML structure:
   *   .rcard (emoji, score/total, pct%, msg, stars, time, unlock/lock banner, remediation)
   *   #save-card (auto-saved confirmation)
   *   #res-review (collapsible review sections: wrong + correct)
   *   .rbtn-row (next, weak-practice, retry, back buttons)
   */

  import { scores, unitsData, settings } from '$lib/stores';
  import type { ScoreEntry } from '$lib/types';

  const { entry, color, onRetry, onPracticeWeak, onHome }: {
    entry: ScoreEntry;
    color: string;
    onRetry: () => void;
    onPracticeWeak: () => void;
    onHome: () => void;
  } = $props();

  // ── Score / result calc (from legacy _finishQuiz) ────────────────────────────
  const pct    = $derived(entry.pct);
  const passed = $derived(pct >= 80);

  const emoji = $derived(
    pct === 100 ? '🏆'
    : pct >= 90 ? '🥇'
    : pct >= 80 ? '🎉'
    : pct >= 70 ? '😊'
    : pct >= 60 ? '💪'
    : '📚'
  );
  const msg = $derived(
    pct === 100 ? 'PERFECT SCORE! You are a math superstar!'
    : pct >= 90 ? 'Outstanding! Almost perfect!'
    : pct >= 80 ? 'Great job! You really know this material!'
    : pct >= 70 ? 'Good work! A little more practice will help!'
    : pct >= 60 ? 'Keep practicing — you are getting there!'
    : "Let's review and try again! You can do it!"
  );

  // ── Unlock / lock banner (from legacy _finishQuiz) ───────────────────────────
  const unlockHtml = $derived((): string => {
    const units = $unitsData;
    const u = entry.unitIdx != null ? units[entry.unitIdx] : null;

    if (entry.type === 'lesson') {
      if (passed) {
        const lessonId = entry.qid.replace('lq_', '');
        const lessonIdx = u?.lessons.findIndex(l => l.id === lessonId) ?? -1;
        const nextIdx = lessonIdx + 1;
        if (u && nextIdx < u.lessons.length) {
          return `<div class="unlock-banner">🔓 Lesson ${nextIdx + 1} — ${u.lessons[nextIdx].title} — unlocked!</div>`;
        }
        return `<div class="unlock-banner">🔓 All lessons done! Unit Quiz now unlocked!</div>`;
      }
      return `<div class="lock-banner">🔒 Need 80%+ to unlock the next lesson — you got ${pct}%. Try again!</div>`;
    }

    if (entry.type === 'unit') {
      if (passed) {
        const nextUnitIdx = (entry.unitIdx ?? 0) + 1;
        if (nextUnitIdx < units.length) {
          return `<div class="unlock-banner">🔓 Unit ${nextUnitIdx + 1}: ${units[nextUnitIdx].name} unlocked!</div>`;
        }
        return `<div class="unlock-banner">🏆 You completed all units! Take the Final Test from the home screen!</div>`;
      }
      return `<div class="lock-banner">🔒 Need 80%+ to unlock the next unit. You got ${pct}% — keep trying!</div>`;
    }

    if (entry.type === 'final') {
      if (passed) return `<div class="unlock-banner">🎓 Congratulations! You passed the Final Test with ${pct}%! You are a Math Master!</div>`;
      return `<div class="lock-banner">📚 Need 80%+ to pass the Final Test. You got ${pct}% — keep reviewing and try again!</div>`;
    }

    return '';
  });

  // ── Guided remediation (from legacy _guidedRemediation) ──────────────────────
  const remHtml = $derived((): string => {
    if (passed) return '';
    const units = $unitsData;
    const u = entry.unitIdx != null ? units[entry.unitIdx] : null;

    if (entry.type === 'lesson') {
      const lessonId = entry.qid.replace('lq_', '');
      const l = u?.lessons.find(l => l.id === lessonId);
      return `<div class="rem-block">
        <div class="rem-head">📖 Recommended Review</div>
        <div class="rem-body">Re-read <strong>${l ? l.icon + ' ' + l.title : 'this lesson'}</strong> — focus on the Key Ideas and Worked Examples, then try again.</div>
      </div>`;
    }

    if (entry.type === 'unit' && u) {
      type WL = { title: string; icon: string; pct: number };
      let weakLesson: WL | null = null;
      let weakPct = 101;
      u.lessons.forEach(l => {
        const best = $scores.filter(s => s.qid === 'lq_' + l.id).sort((a, b) => b.pct - a.pct)[0];
        const lPct = best ? best.pct : 0;
        if (lPct < weakPct) { weakPct = lPct; weakLesson = { title: l.title, icon: l.icon, pct: lPct } as WL; }
      });
      if (weakLesson) {
        const wl = weakLesson as WL;
        const label = wl.pct > 0 ? `(your best: ${wl.pct}%)` : '(not yet passed)';
        return `<div class="rem-block">
          <div class="rem-head">📖 Focus Area</div>
          <div class="rem-body">Your weakest lesson is <strong>${wl.icon} ${wl.title}</strong> ${label}. Review it before retrying the unit quiz.</div>
        </div>`;
      }
    }

    if (entry.type === 'final') {
      type WU = { name: string; pct: number };
      let weakUnit: WU | null = null;
      let weakPct = 101;
      units.forEach(uu => {
        const best = $scores.filter(s => s.qid === uu.id + '_uq').sort((a, b) => b.pct - a.pct)[0];
        const uPct = best ? best.pct : 0;
        if (uPct < weakPct) { weakPct = uPct; weakUnit = { name: uu.name, pct: uPct } as WU; }
      });
      if (weakUnit) {
        const wu = weakUnit as WU;
        const label = wu.pct > 0 ? `(your best: ${wu.pct}%)` : '(not yet passed)';
        return `<div class="rem-block">
          <div class="rem-head">📖 Focus Area</div>
          <div class="rem-body">Your weakest unit is <strong>${wu.name}</strong> ${label}. Review it to boost your Final Test score.</div>
        </div>`;
      }
    }

    return '';
  });

  // ── Review sections ───────────────────────────────────────────────────────────
  const wrong   = $derived(entry.answers.filter(a => !a.ok));
  const correct = $derived(entry.answers.filter(a => a.ok));

  let wrongOpen   = $state(false);
  let correctOpen = $state(true);  // correct starts collapsed (legacy: collapsed=true)
</script>

<div class="sc" style="--color:{color}">
  <div class="bar">
    <button type="button" class="bar-back" style="color:{color}" onclick={onHome}>Done</button>
    <div class="bar-title">{entry.label} — Results</div>
  </div>
  <div class="sc-in">

    <!-- Main score card (.rcard) — matches legacy elCard.innerHTML exactly -->
    <div class="rcard" id="res-card">
      <span class="r-emoji" role="img" aria-label="Result">{emoji}</span>
      <div class="r-score" style="color:{color}">{entry.score} / {entry.total}</div>
      <div class="r-pct">{pct}%</div>
      <div class="r-msg">{msg}</div>
      <div class="r-stars" aria-label="Stars earned">{entry.stars}</div>
      <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-base);color:var(--txt2);margin-top:6px">⏱ {entry.timeTaken}</div>
      {@html unlockHtml()}
      {@html remHtml()}
    </div>

    <!-- Save card — matches legacy save-card "auto-saved" confirmation -->
    <div class="save-card" id="save-card">
      <p style="text-align:center;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-base);color:var(--txt2);margin:0">✅ Score auto-saved for <strong>{entry.name}</strong></p>
    </div>

    <!-- Review sections (#res-review) -->
    <div id="res-review">
      {#if wrong.length > 0}
        <div class="rev-section">
          <div class="rev-sec-head" style="color:#e74c3c" role="button" tabindex="0"
               onclick={() => wrongOpen = !wrongOpen}
               onkeydown={(e) => e.key === 'Enter' && (wrongOpen = !wrongOpen)}>
            ❌ Review These Questions ({wrong.length}) <span>{wrongOpen ? '▾' : '▸'}</span>
          </div>
          {#if wrongOpen}
            {#each wrong as a, i}
              <div class="rev-item">
                <div class="rinum" style="background:#e74c3c">{i + 1}</div>
                <div class="ribody">
                  <div class="ri-q">{#if a.t?.includes('<')}{@html a.t}{:else}{a.t}{/if}</div>
                  <div class="ri-a"><strong style="color:#e74c3c">Your answer:</strong> <span style="color:#7f8c8d">{a.chosen != null && a.opts ? a.opts[a.chosen] ?? '' : ''}</span></div>
                  <div class="ri-a"><strong style="color:#27ae60">Correct:</strong> {a.opts ? a.opts[a.correct] ?? '' : a.correct} ✅</div>
                  <div class="ri-e">💡 {a.exp}</div>
                  {#if a.timeSecs != null}
                    <div class="ri-e">⏱ {a.timeSecs}s on this question</div>
                  {/if}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      {/if}

      {#if correct.length > 0}
        <div class="rev-section">
          <div class="rev-sec-head" style="color:#27ae60" role="button" tabindex="0"
               onclick={() => correctOpen = !correctOpen}
               onkeydown={(e) => e.key === 'Enter' && (correctOpen = !correctOpen)}>
            ✅ Correct Answers ({correct.length}) <span>{correctOpen ? '▾' : '▸'}</span>
          </div>
          {#if correctOpen}
            {#each correct as a, i}
              <div class="rev-item">
                <div class="rinum" style="background:#27ae60">{i + 1}</div>
                <div class="ribody">
                  <div class="ri-q">{#if a.t?.includes('<')}{@html a.t}{:else}{a.t}{/if}</div>
                  <div class="ri-a" style="color:#27ae60">Your answer: {a.chosen != null && a.opts ? a.opts[a.chosen] ?? '' : ''} ✅</div>
                  <div class="ri-e">💡 {a.exp}</div>
                  {#if a.timeSecs != null}
                    <div class="ri-e">⏱ {a.timeSecs}s</div>
                  {/if}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <!-- Action buttons (.rbtn-row) — matches legacy elBtns.innerHTML -->
    <div class="rbtn-row" id="res-btns">
      {#if !passed && wrong.length > 0}
        <button type="button" class="rbtn" style="background:linear-gradient(135deg,#e67e22,#d35400)" onclick={onPracticeWeak}>
          Practice Weak Topics ({wrong.length} question{wrong.length === 1 ? '' : 's'}) →
        </button>
      {/if}
      <button type="button" class="rbtn" style="background:linear-gradient(135deg,{color},{color}aa)" onclick={onRetry}>Try Again 🔄</button>
      <button type="button" class="rbtn" style="background:linear-gradient(135deg,#7f8c8d,#636e72)" onclick={onHome}>
        {entry.type === 'final' ? 'Back to Home' : 'Back to Unit'}
      </button>
    </div>

    <div style="height:32px"></div>
  </div>
</div>
