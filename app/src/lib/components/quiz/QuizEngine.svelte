<script lang="ts">
  /**
   * QuizEngine — the full adaptive quiz loop.
   *
   * Props:
   *   quizState  — the QuizState built by startQuiz()
   *   color      — unit brand color for UI accents
   *   onComplete — called with the finalised ScoreEntry when the quiz ends
   *   onQuit     — called when the student exits mid-quiz
   */

  import { getGeminiHint } from '$lib/services/hint';
  import { finaliseQuiz } from '$lib/services/quiz';
  import type { QuizState, QuizAnswer, ScoreEntry } from '$lib/types';

  const { quizState, color, onComplete, onQuit }: {
    quizState: QuizState;
    color: string;
    onComplete: (entry: ScoreEntry) => void;
    onQuit: () => void;
  } = $props();

  // ── Local state ──────────────────────────────────────────────────────────────

  /** Live mutable copy — we mutate this and then re-assign to trigger reactivity */
  let qz = $state<QuizState>({ ...quizState, answers: [...quizState.answers] });

  let answered = $state(false);
  let chosenIdx = $state<number | null>(null);   // index into shuffled opts
  let qStartedAt = $state(Date.now());

  /** Shuffled option objects: { text, origIdx } */
  let opts = $state<{ text: string; origIdx: number }[]>([]);

  /** AI hint UI */
  let hintLoading = $state(false);
  let hintText = $state('');
  let hintError = $state('');

  // ── Derived ──────────────────────────────────────────────────────────────────

  const q        = $derived(qz.questions[qz.viewIdx]);
  const total    = $derived(qz.questions.length);
  const isReview = $derived(qz.viewIdx < qz.idx);
  const pct      = $derived(total > 0 ? Math.floor(qz.score / total * 100) : 0);
  const progress = $derived(qz.idx / total);

  const correctText  = $derived(q ? q.o[q.a] : '');

  // The past answer for the currently-viewed question (review mode)
  const pastAnswer = $derived(
    isReview ? (qz.answers[qz.viewIdx] ?? null) : null
  );

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function shuffleOpts() {
    opts = q.o
      .map((text, origIdx) => ({ text, origIdx }))
      .sort(() => Math.random() - 0.5);
  }

  function resetHint() {
    hintText = '';
    hintError = '';
    hintLoading = false;
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  function advance() {
    if (qz.viewIdx < qz.idx - 1) {
      qz = { ...qz, viewIdx: qz.viewIdx + 1 };
      return;
    }
    // Back to current unanswered question
    qz = { ...qz, viewIdx: qz.idx };
    answered = false;
    chosenIdx = null;
    resetHint();
    shuffleOpts();
    qStartedAt = Date.now();
  }

  function goBack() {
    if (qz.viewIdx > 0) {
      qz = { ...qz, viewIdx: qz.viewIdx - 1 };
    }
  }

  // ── Answer handling ───────────────────────────────────────────────────────────

  function pickAnswer(optIdx: number) {
    if (answered || isReview) return;
    answered = true;
    chosenIdx = optIdx;

    const chosen = opts[optIdx];
    const isOk = chosen.origIdx === q.a;
    const timeSecs = Math.round((Date.now() - qStartedAt) / 1000);

    const answer: QuizAnswer = {
      t: q.t,
      chosen: chosen.origIdx,
      correct: q.a,
      ok: isOk,
      exp: q.e,
      opts: opts.map((o) => o.text),
      timeSecs,
    };

    const newAnswers = [...qz.answers];
    newAnswers[qz.idx] = answer;

    qz = {
      ...qz,
      score: qz.score + (isOk ? 1 : 0),
      answers: newAnswers,
    };
  }

  function nextQuestion() {
    if (!answered) return;
    resetHint();

    const nextIdx = qz.idx + 1;
    if (nextIdx >= total) {
      // Quiz complete
      const entry = finaliseQuiz(qz, color);
      onComplete(entry);
      return;
    }

    qz = { ...qz, idx: nextIdx, viewIdx: nextIdx };
    answered = false;
    chosenIdx = null;
    shuffleOpts();
    qStartedAt = Date.now();
  }

  // ── Hint ──────────────────────────────────────────────────────────────────────

  async function fetchHint() {
    if (hintLoading || !answered || !chosenIdx) return;
    const chosen = opts[chosenIdx];
    if (chosen?.origIdx === q.a) return; // no hint on correct answer
    hintLoading = true;
    hintText = '';
    hintError = '';
    const result = await getGeminiHint(q.t, chosen?.text ?? '');
    hintLoading = false;
    hintText = result.hint ?? '';
    hintError = result.error ?? '';
  }

  // ── Init ──────────────────────────────────────────────────────────────────────

  $effect(() => {
    shuffleOpts();
    qStartedAt = Date.now();
  });
</script>

<div class="engine" style="--color: {color}">
  <!-- Progress bar -->
  <div class="progress-bar" role="progressbar" aria-valuenow={qz.idx} aria-valuemax={total}>
    <div class="progress-fill" style="width: {progress * 100}%"></div>
  </div>

  <!-- Header -->
  <header class="quiz-header">
    <button type="button" class="quit-btn" onclick={onQuit} aria-label="Quit quiz">✕</button>
    <span class="q-label">Question {qz.viewIdx + 1} of {total}</span>
    <span class="score-chip">{qz.score} correct</span>
  </header>

  <!-- Question card -->
  <div class="q-card" role="main">
    <!-- Question text -->
    <p class="q-text" role="heading" aria-level="2">{q?.t ?? ''}</p>

    <!-- Inline SVG visual (geometry questions) -->
    {#if q?.s}
      <div class="q-visual" aria-hidden="true">{@html q.s}</div>
    {/if}

    <!-- Review mode indicator -->
    {#if isReview}
      <p class="review-badge">👁 Review — answer locked</p>
    {/if}

    <!-- Answer grid -->
    <div class="answer-grid" role="group" aria-label="Answer choices">
      {#each (isReview ? (pastAnswer?.opts ?? q?.o ?? []) : opts.map(o => o.text)) as optText, i}
        {@const origIdx = isReview ? i : opts[i]?.origIdx}
        {@const isCorrect = isReview
          ? optText === (pastAnswer?.opts?.[pastAnswer.correct] ?? q?.o[q.a])
          : origIdx === q?.a}
        {@const isChosen = isReview
          ? i === pastAnswer?.chosen
          : i === chosenIdx}
        {@const state = !answered && !isReview
          ? 'idle'
          : isCorrect ? 'correct'
          : isChosen ? 'wrong'
          : 'idle'}

        <button
          type="button"
          class="answer-btn {state}"
          onclick={() => pickAnswer(i)}
          disabled={answered || isReview}
          aria-label="Answer: {optText}"
          aria-pressed={isChosen}
        >
          {optText}
        </button>
      {/each}
    </div>

    <!-- Reveal panel (shown after answering) -->
    {#if answered && !isReview}
      {@const wasCorrect = opts[chosenIdx ?? 0]?.origIdx === q?.a}
      <div class="reveal {wasCorrect ? 'ok' : 'no'}" role="status" aria-live="polite">
        <p class="reveal-header {wasCorrect ? 'ok' : 'no'}">
          {wasCorrect ? '🎉 Correct! Great job!' : '😊 Not quite…'}
        </p>
        {#if !wasCorrect}
          <p class="reveal-correct">✅ Correct answer: {correctText}</p>
        {/if}
        <p class="reveal-exp">💡 {q?.e}</p>

        <!-- AI Hint button (only shown on wrong answers) -->
        {#if !wasCorrect}
          {#if hintLoading}
            <p class="hint-loading" aria-live="polite">🤔 Thinking…</p>
          {:else if hintText}
            <div class="hint-box" role="note">
              <p class="hint-label">✨ AI Hint</p>
              <p>{hintText}</p>
            </div>
          {:else if hintError}
            <p class="hint-error">{hintError}</p>
          {:else}
            <button type="button" class="hint-btn" onclick={fetchHint}>
              ✨ Get a Hint
            </button>
          {/if}
        {/if}
      </div>
    {/if}

    <!-- Review reveal -->
    {#if isReview && pastAnswer}
      <div class="reveal {pastAnswer.ok ? 'ok' : 'no'}" role="status">
        <p class="reveal-header {pastAnswer.ok ? 'ok' : 'no'}">
          {pastAnswer.ok ? '🎉 Correct!' : '😊 Not quite…'}
        </p>
        {#if !pastAnswer.ok}
          <p class="reveal-correct">✅ Correct answer: {pastAnswer.opts?.[pastAnswer.correct] ?? ''}</p>
        {/if}
        <p class="reveal-exp">💡 {pastAnswer.exp}</p>
        {#if pastAnswer.timeSecs != null}
          <p class="reveal-time">⏱ {pastAnswer.timeSecs}s on this question</p>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Navigation buttons -->
  <div class="nav-row">
    {#if qz.viewIdx > 0}
      <button type="button" class="nav-btn secondary" onclick={goBack}>← Back</button>
    {/if}

    {#if answered || isReview}
      <button type="button" class="nav-btn primary" onclick={nextQuestion}>
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

<style>
  .engine {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: var(--color-bg, #f0f2f5);
  }

  /* Progress */
  .progress-bar {
    height: 4px;
    background: color-mix(in srgb, var(--color) 20%, transparent);
  }
  .progress-fill {
    height: 100%;
    background: var(--color);
    transition: width 0.3s ease;
  }

  /* Header */
  .quiz-header {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--color-surface, #fff);
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    gap: 0.75rem;
  }
  .quit-btn {
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    color: var(--color-text-muted, #636e72);
    padding: 0.25rem;
  }
  .q-label {
    flex: 1;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text-muted, #636e72);
  }
  .score-chip {
    font-size: 0.8rem;
    font-weight: 700;
    background: color-mix(in srgb, var(--color) 15%, transparent);
    color: var(--color);
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
  }

  /* Question card */
  .q-card {
    flex: 1;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .q-text {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text, #2d3436);
    line-height: 1.4;
    margin: 0;
  }
  .q-visual :global(svg) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
  .review-badge {
    font-size: 0.8rem;
    color: var(--color-text-muted, #636e72);
    margin: 0;
  }

  /* Answer grid */
  .answer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
  }
  .answer-btn {
    padding: 0.75rem 0.5rem;
    border-radius: 0.875rem;
    border: 2px solid var(--color-border, #dfe6e9);
    background: var(--color-surface, #fff);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    text-align: center;
    line-height: 1.3;
  }
  .answer-btn:hover:not(:disabled) {
    border-color: var(--color);
    background: color-mix(in srgb, var(--color) 6%, var(--color-surface, #fff));
  }
  .answer-btn.correct {
    border-color: var(--color-success, #00b894);
    background: color-mix(in srgb, var(--color-success, #00b894) 12%, #fff);
    color: var(--color-success, #00b894);
    font-weight: 700;
  }
  .answer-btn.wrong {
    border-color: var(--color-error, #d63031);
    background: color-mix(in srgb, var(--color-error, #d63031) 10%, #fff);
    color: var(--color-error, #d63031);
  }

  /* Reveal */
  .reveal {
    border-radius: 1rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .reveal.ok { background: color-mix(in srgb, var(--color-success, #00b894) 10%, #fff); }
  .reveal.no { background: color-mix(in srgb, var(--color-error, #d63031) 8%, #fff); }
  .reveal-header {
    font-weight: 700;
    font-size: 1rem;
    margin: 0;
  }
  .reveal-header.ok { color: var(--color-success, #00b894); }
  .reveal-header.no { color: var(--color-error, #d63031); }
  .reveal-correct, .reveal-exp, .reveal-time {
    font-size: 0.875rem;
    color: var(--color-text, #2d3436);
    margin: 0;
  }

  /* Hint */
  .hint-btn {
    align-self: flex-start;
    background: none;
    border: 1.5px solid var(--color-primary, #6c5ce7);
    color: var(--color-primary, #6c5ce7);
    border-radius: 0.5rem;
    padding: 0.35rem 0.75rem;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
  }
  .hint-loading {
    font-size: 0.85rem;
    color: var(--color-text-muted, #636e72);
    margin: 0;
    font-style: italic;
  }
  .hint-box {
    background: color-mix(in srgb, var(--color-primary, #6c5ce7) 8%, #fff);
    border-radius: 0.75rem;
    padding: 0.75rem;
    font-size: 0.85rem;
    color: var(--color-text, #2d3436);
  }
  .hint-label {
    font-weight: 700;
    margin: 0 0 0.3rem;
    color: var(--color-primary, #6c5ce7);
  }
  .hint-box p { margin: 0; }
  .hint-error { font-size: 0.82rem; color: var(--color-error, #d63031); margin: 0; }

  /* Navigation */
  .nav-row {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 1.25rem 2rem;
    justify-content: flex-end;
  }
  .nav-btn {
    padding: 0.875rem 1.5rem;
    border-radius: 0.875rem;
    font-size: 1rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .nav-btn.primary {
    background: var(--color);
    color: #fff;
    flex: 1;
  }
  .nav-btn.secondary {
    background: var(--color-surface, #fff);
    color: var(--color-text, #2d3436);
    border: 2px solid var(--color-border, #dfe6e9);
  }
  .nav-btn:hover { opacity: 0.88; }
</style>
