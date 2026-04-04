<script lang="ts">
  /**
   * QuizEngine — 1:1 with legacy #quiz-screen.
   *
   * HTML structure from legacy index.html:
   *   .qhdr > .qmeta (.q-lbl, .q-score, .q-timer) + .qpb/.qpbf
   *   .quiz-top-row > .quiz-restart-btn + .quiz-scratch-btn + .quiz-quit-btn
   *   .qcard (question text, visual, answer grid, reveal)
   *   .quiz-nav-row > .prev-btn + .next-btn
   *
   * Added features: countdown timer, sound effects, confetti, scratch pad.
   */

  import { onMount } from 'svelte';
  import { getGeminiHint } from '$lib/services/hint';
  import { finaliseQuiz, saveAbandonedScore } from '$lib/services/quiz';
  import { playCorrect, playWrong, playPassQuiz } from '$lib/services/sound';
  import { settings } from '$lib/stores';
  import { stackNavigate } from '$lib/services/navStack';
  import { hasHtmlTags } from '$lib/utils';
  import type { QuizState, QuizAnswer, ScoreEntry } from '$lib/types';

  const { quizState, color, onComplete, onQuit }: {
    quizState: QuizState;
    color: string;
    onComplete: (entry: ScoreEntry) => void;
    onQuit: () => void;
  } = $props();

  // ── State ────────────────────────────────────────────────────────────────────

  let qz         = $state<QuizState>({ ...quizState, answers: [...quizState.answers] });
  let answered    = $state(false);
  let chosenIdx   = $state<number | null>(null);
  let selectedIdx = $state<number | null>(null);  // brief .selected state before reveal
  let revealReady = $state(false);                // false during 120ms delay
  let qStartedAt  = $state(Date.now());
  let opts        = $state<{ text: string; origIdx: number }[]>([]);
  let nextBtnEl   = $state<HTMLButtonElement | null>(null);

  /** AI hint */
  let hintLoading = $state(false);
  let hintText    = $state('');
  let hintError   = $state('');

  /** Nudge messages (wrong answers) — matches legacy */
  const NUDGES = [
    "Take a deep breath — you've got this! Read the tip and try the next one. 💪",
    "Mistakes help us learn! Check the tip above and keep going. 🌟",
    "Almost! Read the explanation and you'll get the next one. 🚀",
    "Don't give up — every wrong answer makes you smarter! 🧠",
    "You're still doing great! Read the tip and move on. ⭐"
  ];
  let nudgeIdx = $state(0);

  // ── Timer ────────────────────────────────────────────────────────────────────

  let secsLeft     = $state(0);
  let timerTotal   = $state(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  function timerMins(): number {
    if (quizState.type === 'lesson')  return $settings.lessonTimerMins ?? 0;
    if (quizState.type === 'unit')    return $settings.unitTimerMins   ?? 0;
    if (quizState.type === 'final')   return $settings.finalTimerMins  ?? 0;
    if (quizState.type === 'practice') return 0; // practice quizzes have no timer
    return 0;
  }

  let timerPaused = false;

  function startTimer() {
    const mins = timerMins();
    if (mins <= 0) return;
    secsLeft = timerTotal = mins * 60;
    timerPaused = false;
    timerInterval = setInterval(() => {
      if (!qz || timerPaused) return;
      secsLeft--;
      if (secsLeft <= 0) {
        clearInterval(timerInterval!);
        timerInterval = null;
        const entry = finaliseQuiz(qz, color);
        onComplete(entry);
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerPaused = false;
  }

  function pauseTimer()  { timerPaused = true; }
  function resumeTimer() { timerPaused = false; }

  function fmtTimer(s: number): string {
    return `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;
  }

  const showTimer  = $derived(timerTotal > 0);
  const timerPct   = $derived(timerTotal > 0 ? secsLeft / timerTotal : 1);
  const timerCls   = $derived(timerPct > 0.2 ? '' : timerPct > 0.1 ? 'warn' : 'danger');

  // ── Confirm modals ────────────────────────────────────────────────────────────

  let quitModalOpen    = $state(false);
  let restartModalOpen = $state(false);

  const PAUSE_KEY = 'wb_quiz_pause';

  function savePaused() {
    try {
      // Re-read immediately before write to minimise multi-tab race window
      const all = JSON.parse(localStorage.getItem(PAUSE_KEY) ?? '{}');
      all[qz.id] = {
        questions: qz.questions, idx: qz.idx, score: qz.score,
        answers: qz.answers, id: qz.id, label: qz.label, type: qz.type,
        unitIdx: qz.unitIdx, pausedAt: Date.now(),
      };
      localStorage.setItem(PAUSE_KEY, JSON.stringify(all));
    } catch (e) { console.warn('[quiz] Failed to save paused state:', e); }
  }

  function clearPaused() {
    try {
      // Re-read immediately before write to minimise multi-tab race window
      const all = JSON.parse(localStorage.getItem(PAUSE_KEY) ?? '{}');
      delete all[qz.id];
      localStorage.setItem(PAUSE_KEY, JSON.stringify(all));
    } catch (e) { console.warn('[quiz] Failed to clear paused state:', e); }
  }

  function showQuitConfirm()    { quitModalOpen = true;    pauseTimer(); }
  function cancelQuit()         { quitModalOpen = false;   resumeTimer(); }
  function confirmQuit()        { quitModalOpen = false; stopTimer(); savePaused(); onQuit(); }
  function showRestartConfirm() { restartModalOpen = true;  pauseTimer(); }
  function cancelRestart()      { restartModalOpen = false; resumeTimer(); }
  function confirmRestart()     {
    restartModalOpen = false;
    // Save current progress as "Abandoned" before resetting.
    // Uses saveAbandonedScore (NOT finaliseQuiz) because finaliseQuiz clears
    // cur.quiz which would unmount this component.
    if (qz.answers.length > 0) {
      saveAbandonedScore(qz, color);
    }
    // Reset quiz to question 0 (matches legacy retryQuiz / restartQuiz)
    qz = { ...qz, idx: 0, viewIdx: 0, score: 0, answers: [], startTime: Date.now() };
    answered = false; chosenIdx = null; selectedIdx = null; revealReady = false;
    shuffleOpts();
    qStartedAt = Date.now();
    stopTimer(); startTimer();
  }

  // ── Scratch pad ───────────────────────────────────────────────────────────────

  let scratchOpen  = $state(false);
  let scratchTool  = $state<'pen' | 'eraser'>('pen');
  let scratchColor = $state('#1a2535');
  let canvasEl     = $state<HTMLCanvasElement | null>(null);
  let drawing      = false;
  let lastX = 0, lastY = 0;

  function getCtx() { return canvasEl?.getContext('2d') ?? null; }

  // Sync canvas internal resolution with its CSS display size.
  // Uses ResizeObserver so orientation changes while open are handled.
  $effect(() => {
    if (!scratchOpen || !canvasEl) return;
    const wrap = canvasEl.parentElement;
    if (!wrap) return;
    const cv = canvasEl;
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  });

  function onScratchDown(x: number, y: number) { drawing = true; lastX = x; lastY = y; }
  function onScratchMove(x: number, y: number) {
    if (!drawing) return;
    const ctx = getCtx(); if (!ctx) return;
    ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y);
    ctx.strokeStyle = scratchTool === 'eraser' ? '#ffffff' : scratchColor;
    ctx.lineWidth   = scratchTool === 'eraser' ? 22 : 3;
    ctx.lineCap = 'round'; ctx.stroke();
    lastX = x; lastY = y;
  }
  function onScratchUp() { drawing = false; }

  function clearScratch() {
    const ctx = getCtx();
    if (ctx && canvasEl) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }

  function mouseDown(e: MouseEvent) { if (!canvasEl) return; const r = canvasEl.getBoundingClientRect(); onScratchDown(e.clientX-r.left, e.clientY-r.top); }
  function mouseMove(e: MouseEvent) { if (!canvasEl) return; const r = canvasEl.getBoundingClientRect(); onScratchMove(e.clientX-r.left, e.clientY-r.top); }
  function touchStart(e: TouchEvent) { e.preventDefault(); if (!canvasEl) return; const r=canvasEl.getBoundingClientRect(); const t=e.touches[0]; onScratchDown(t.clientX-r.left,t.clientY-r.top); }
  function touchMove(e: TouchEvent)  { e.preventDefault(); if (!canvasEl) return; const r=canvasEl.getBoundingClientRect(); const t=e.touches[0]; onScratchMove(t.clientX-r.left,t.clientY-r.top); }

  // ── Confetti ──────────────────────────────────────────────────────────────────

  function confetti(count = 32) {
    // Cleanup any stale confetti from throttled timers
    document.querySelectorAll('[data-confetti]').forEach(el => {
      if (el.getAnimations?.().length === 0) el.remove();
    });
    const colors = ['#e74c3c','#e67e22','#27ae60','#8e44ad','#f1c40f','#4a90d9','#ffffff'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.setAttribute('data-confetti', '');
      const size = 7 + Math.random() * 7;
      const left = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const dur   = 1.2 + Math.random() * 1.0;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const circle = Math.random() > 0.5;
      el.style.cssText = `position:fixed;top:-20px;left:${left}vw;width:${size}px;height:${size}px;background:${color};border-radius:${circle?'50%':'3px'};z-index:999;pointer-events:none;animation:cffall ${dur}s ${delay}s ease-in forwards;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), (dur + delay + 0.1) * 1000);
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const q           = $derived(qz.questions[qz.viewIdx]);
  const total       = $derived(qz.questions.length);
  const isReview    = $derived(qz.viewIdx < qz.idx);
  const progress    = $derived(qz.idx / total);
  const correctText = $derived(q ? q.o[q.a] : '');
  const pastAnswer  = $derived(isReview ? (qz.answers[qz.viewIdx] ?? null) : null);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function shuffleOpts() {
    if (!q) return;
    opts = q.o.map((text, origIdx) => ({ text, origIdx })).sort(() => Math.random() - 0.5);
  }

  function resetHint() { hintText = ''; hintError = ''; hintLoading = false; }

  // ── Navigation ────────────────────────────────────────────────────────────────

  function goBack() {
    if (qz.viewIdx > 0) {
      const wasLive = !isReview;
      qz = { ...qz, viewIdx: qz.viewIdx - 1 };
      // Entering review from live question — pause timer
      if (wasLive && showTimer) pauseTimer();
    }
  }

  /** Navigate forward during review, or advance to next question when active. */
  function goForward() {
    if (isReview) {
      // During review: move viewIdx forward, clamped to idx
      const next = Math.min(qz.viewIdx + 1, qz.idx);
      qz = { ...qz, viewIdx: next };
      // Returning to live question — resume timer
      if (next === qz.idx && showTimer) resumeTimer();
    } else {
      nextQuestion();
    }
  }

  // ── Answer handling (matches legacy _pickAnswer with 120ms delay) ────────────

  function pickAnswer(optIdx: number) {
    if (answered || isReview) return;

    const chosen   = opts[optIdx];
    const isOk     = chosen.origIdx === q.a;
    const timeSecs = Math.round((Date.now() - qStartedAt) / 1000);

    // Step 1: show .selected immediately, disable buttons
    answered     = true;
    selectedIdx  = optIdx;
    revealReady  = false;

    // Step 2: after brief delay, show correct/wrong + reveal panel (matches legacy)
    const ANSWER_REVEAL_MS = 120;
    setTimeout(() => {
      chosenIdx   = optIdx;
      selectedIdx = null;
      revealReady = true;

      // nudge by question index (matches legacy (qz.idx || 0) % _nudges.length)
      nudgeIdx = qz.idx % NUDGES.length;

      if (isOk) { playCorrect($settings.sound); confetti(16); }
      else       { playWrong($settings.sound); }

      const answer: QuizAnswer = {
        t: q.t, chosen: chosen.origIdx, correct: q.a,
        ok: isOk, exp: q.e,
        opts: opts.map(o => o.text),
        timeSecs,
      };
      const newAnswers = [...qz.answers];
      newAnswers[qz.idx] = answer;
      qz = { ...qz, score: qz.score + (isOk ? 1 : 0), answers: newAnswers };

      // Auto-scroll next button into view
      const SCROLL_DELAY_MS = 60;
      setTimeout(() => nextBtnEl?.scrollIntoView({ behavior: 'smooth', block: 'end' }), SCROLL_DELAY_MS);
    }, ANSWER_REVEAL_MS);
  }

  function nextQuestion() {
    if (!answered) return;
    resetHint();
    const nextIdx = qz.idx + 1;
    if (nextIdx >= total) {
      stopTimer();
      clearPaused();
      const pct = Math.floor(qz.score / total * 100);
      if (pct >= 80) { playPassQuiz($settings.sound); confetti(50); }
      const entry = finaliseQuiz(qz, color);
      onComplete(entry);
      return;
    }
    qz = { ...qz, idx: nextIdx, viewIdx: nextIdx };
    answered = false; chosenIdx = null; selectedIdx = null; revealReady = false;
    shuffleOpts();
    qStartedAt = Date.now();
  }

  async function fetchHint() {
    if (hintLoading || !answered || chosenIdx === null) return;
    const chosen = opts[chosenIdx];
    if (chosen?.origIdx === q.a) return;
    hintLoading = true; hintText = ''; hintError = '';
    try {
      const result = await getGeminiHint(q.t, chosen?.text ?? '');
      hintText  = result.hint  ?? '';
      hintError = result.error ?? '';
    } catch {
      hintError = 'Something went wrong. Please try again.';
    } finally {
      hintLoading = false;
    }
  }

  onMount(() => { shuffleOpts(); startTimer(); return () => stopTimer(); });
</script>

<!-- Confetti keyframe injected once globally -->
<svelte:head>
  <style>
    @keyframes cffall {
      0%   { opacity:1; transform:translateY(-10px) rotate(0deg); }
      100% { opacity:0; transform:translateY(105vh) rotate(720deg); }
    }
  </style>
</svelte:head>

<div class="sc" style="--color:{color}">
  <!-- Sticky bar (matches legacy .bar inside #quiz-screen) -->
  <div class="bar">
    <button type="button" class="bar-back" id="quiz-back" style="color:{color}" onclick={showQuitConfirm}>Back</button>
    <div class="bar-title" id="quiz-title">{qz.label ?? 'Quiz'}</div>
    <button type="button" class="bar-cog" aria-label="Settings" onclick={() => stackNavigate('/settings')}>
      <span class="cog-ico">⚙️</span>
    </button>
  </div>
  <div class="sc-in">

    <!-- Header (matches legacy .qhdr) -->
    <div class="qhdr">
      <div class="qmeta">
        <div class="q-lbl">Question {qz.viewIdx + 1} of {total}</div>
        <div class="q-score" style="background:{color}22;color:{color}">{qz.score} correct</div>
        {#if showTimer}
          <div class="q-timer {timerCls}" aria-label="Time remaining: {fmtTimer(secsLeft)}">⏱ {fmtTimer(secsLeft)}</div>
        {/if}
      </div>
      <div class="qpb">
        <div class="qpbf" style="width:{progress * 100}%;background:{color}"></div>
      </div>
    </div>

    <!-- Top action row (matches legacy .quiz-top-row) -->
    <div class="quiz-top-row">
      <button type="button" class="quiz-restart-btn" onclick={showRestartConfirm}>↩ Start Over</button>
      <button type="button" class="quiz-scratch-btn" aria-label="Toggle note pad" onclick={() => scratchOpen = !scratchOpen}>✏️ Note Pad</button>
      <button type="button" class="quiz-quit-btn" onclick={showQuitConfirm}>✕ Quit</button>
    </div>

    <!-- Question card -->
    <div class="qcard" id="qcard" data-no-swipe>
      <div class="q-num" style="color:{color}">Question {qz.viewIdx + 1}</div>
      <div class="q-text" role="heading" aria-level="2">
        {#if hasHtmlTags(q?.t)}
          {@html q.t}
        {:else}
          {q?.t ?? ''}
        {/if}
      </div>

      {#if q?.s}
        <div class="q-visual">{@html q.s}</div>
      {/if}

      {#if isReview}
        <p style="font-size:var(--fs-sm);color:var(--txt2);margin:0 0 10px">👁 Review — answer locked</p>
      {/if}

      <!-- Answer grid -->
      <div class="agrid" role="group" aria-label="Answer choices">
        {#each (isReview ? (pastAnswer?.opts ?? q?.o ?? []) : opts.map(o => o.text)) as optText, i}
          {@const origIdx   = isReview ? i : opts[i]?.origIdx}
          {@const isCorrect = isReview
            ? optText === (pastAnswer?.opts?.[pastAnswer.correct] ?? q?.o[q.a])
            : origIdx === q?.a}
          {@const isChosen  = isReview ? i === pastAnswer?.chosen : i === chosenIdx}
          {@const isSelected = !revealReady && selectedIdx === i}
          {@const btnClass  = isSelected ? 'selected'
            : !revealReady || !answered && !isReview ? ''
            : isCorrect ? 'correct' : isChosen ? 'wrong' : ''}

          <button type="button" class="abtn {btnClass}"
                  onclick={() => pickAnswer(i)}
                  disabled={answered || isReview}
                  aria-label="Answer: {optText}"
                  aria-pressed={isChosen}>
            {optText}
          </button>
        {/each}
      </div>

      <!-- Reveal panel (live question) — only shown after 120ms delay -->
      {#if revealReady && answered && !isReview}
        {@const wasCorrect = opts[chosenIdx ?? 0]?.origIdx === q?.a}
        <div class="reveal show {wasCorrect ? 'ok' : 'no'}" role="status" aria-live="polite">
          <p class="rev-h {wasCorrect ? 'ok' : 'no'}">
            {wasCorrect ? '🎉 Correct! Great job!' : `😊 ${NUDGES[nudgeIdx]}`}
          </p>
          {#if !wasCorrect}
            <p class="rev-correct">✅ Correct answer: {correctText}</p>
          {/if}
          <p class="rev-exp">💡 {q?.e}</p>
          {#if !wasCorrect}
            {#if hintLoading}
              <p class="rev-time" aria-live="polite">🤔 Thinking…</p>
            {:else if hintText}
              <div class="rev-tip" role="note"><strong>✨ AI Hint</strong><br>{hintText}</div>
            {:else if hintError}
              <p class="rev-time" style="color:#e74c3c">{hintError}</p>
            {:else}
              <button type="button" class="hint-btn-legacy" aria-label="Get an AI hint" onclick={fetchHint}>✨ Get a Hint</button>
            {/if}
          {/if}
        </div>
      {/if}

      <!-- Review reveal -->
      {#if isReview && pastAnswer}
        <div class="reveal show {pastAnswer.ok ? 'ok' : 'no'}" role="status">
          <p class="rev-h {pastAnswer.ok ? 'ok' : 'no'}">{pastAnswer.ok ? '🎉 Correct!' : '😊 Not quite…'}</p>
          {#if !pastAnswer.ok}
            <p class="rev-correct">✅ Correct answer: {pastAnswer.opts?.[pastAnswer.correct] ?? ''}</p>
          {/if}
          <p class="rev-exp">💡 {pastAnswer.exp}</p>
          {#if pastAnswer.timeSecs != null}
            <p class="rev-time">⏱ {pastAnswer.timeSecs}s on this question</p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Navigation (matches legacy .quiz-nav-row) -->
    <div class="quiz-nav-row">
      {#if qz.viewIdx > 0}
        <button type="button" class="prev-btn" style="display:block" onclick={goBack}>← Previous Question</button>
      {/if}
      {#if revealReady || isReview}
        <button type="button" class="next-btn" bind:this={nextBtnEl} style="display:block;background:{color}" onclick={isReview ? goForward : nextQuestion}>
          {#if isReview && qz.viewIdx < qz.idx - 1}
            Forward →
          {:else if isReview}
            Back to Current →
          {:else if qz.idx + 1 >= total}
            See Results 🏆
          {:else}
            Next Question →
          {/if}
        </button>
      {/if}
    </div>

  </div>
</div>

<!-- Quit confirmation modal -->
{#if quitModalOpen}
  <div class="restart-modal open" role="dialog" aria-modal="true">
    <div class="restart-modal-box">
      <h3>✕ Quit Quiz?</h3>
      <p>This will end the quiz immediately.<br>Your progress will be saved as <strong>Quit</strong> in your score history.</p>
      <div class="restart-modal-btns">
        <button type="button" class="restart-confirm-no" onclick={cancelQuit}>Keep Going</button>
        <button type="button" class="restart-confirm-yes" onclick={confirmQuit}>Quit</button>
      </div>
    </div>
  </div>
{/if}

<!-- Restart confirmation modal -->
{#if restartModalOpen}
  <div class="restart-modal open" role="dialog" aria-modal="true">
    <div class="restart-modal-box">
      <h3>↩ Start Over?</h3>
      <p>This will restart the quiz from the beginning.<br>Your current progress will be saved as <strong>Abandoned</strong> in your score history.</p>
      <div class="restart-modal-btns">
        <button type="button" class="restart-confirm-no" onclick={cancelRestart}>Keep Going</button>
        <button type="button" class="restart-confirm-yes" onclick={confirmRestart}>Start Over</button>
      </div>
    </div>
  </div>
{/if}

<!-- Scratch Pad (copied verbatim from legacy index.html #scratch-overlay) -->
{#if scratchOpen}
  <div class="scratch-overlay" id="scratch-overlay"
       role="dialog" aria-label="Note Pad"
       onclick={(e) => { if (e.target === e.currentTarget) scratchOpen = false; }}>
    <div class="scratch-box">
      <div class="scratch-toolbar">
        <span class="scratch-toolbar-title">✏️ Note Pad</span>
        <!-- Colors — matches legacy exactly: black, blue, red -->
        <button type="button" class="scratch-color-btn {scratchColor === '#222' && scratchTool === 'pen' ? 'active' : ''}" id="sc-col-black"
          style="background:#222" onclick={() => { scratchColor = '#222'; scratchTool = 'pen'; }} title="Black"></button>
        <button type="button" class="scratch-color-btn {scratchColor === '#4a90d9' && scratchTool === 'pen' ? 'active' : ''}" id="sc-col-blue"
          style="background:#4a90d9" onclick={() => { scratchColor = '#4a90d9'; scratchTool = 'pen'; }} title="Blue"></button>
        <button type="button" class="scratch-color-btn {scratchColor === '#e74c3c' && scratchTool === 'pen' ? 'active' : ''}" id="sc-col-red"
          style="background:#e74c3c" onclick={() => { scratchColor = '#e74c3c'; scratchTool = 'pen'; }} title="Red"></button>
        <!-- Tools -->
        <button type="button" class="scratch-tool-btn {scratchTool === 'pen' ? 'active' : ''}" id="sc-pen-btn"
          onclick={() => scratchTool = 'pen'}>✏️ Pen</button>
        <button type="button" class="scratch-tool-btn {scratchTool === 'eraser' ? 'active' : ''}" id="sc-erase-btn"
          onclick={() => scratchTool = 'eraser'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico" style="width:16px;height:16px;vertical-align:middle"><path d="M3 21l9-9"/><path d="M12.22 6.22L18 2l4 4-6.22 5.78c.06.74.08 1.49.04 2.22L22 18l-4 4-4.74-5.96A12 12 0 0 1 12 16c-.85 0-1.7-.1-2.54-.32L3 18l-1-4 5.32-1.46A11.93 11.93 0 0 1 7 10c0-1.38.37-2.68 1.02-3.8L12.22 6.22z"/></svg> Erase</button>
        <button type="button" class="scratch-tool-btn" onclick={clearScratch}
          style="color:#e74c3c;border-color:#e74c3c">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico" style="width:16px;height:16px;vertical-align:middle"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
        <button type="button" aria-label="Close note pad"
          style="font-size:var(--fs-lg);background:none;border:none;cursor:pointer;color:var(--txt2);padding:0 4px;line-height:1"
          onclick={() => scratchOpen = false}>×</button>
      </div>
      <div class="scratch-canvas-wrap" id="scratch-canvas-wrap">
        <canvas bind:this={canvasEl}
                style="display:block;width:100%;height:100%;cursor:crosshair;touch-action:none;"
                onmousedown={mouseDown} onmousemove={mouseMove} onmouseup={onScratchUp} onmouseleave={onScratchUp}
                ontouchstart={touchStart} ontouchmove={touchMove} ontouchend={onScratchUp}
        ></canvas>
      </div>
    </div>
  </div>
{/if}
