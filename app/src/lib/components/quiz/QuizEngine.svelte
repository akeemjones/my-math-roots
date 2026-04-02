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

<div class="sc" style="--color: {color}">
  <div class="sc-in">

    <!-- Progress bar -->
    <div class="qpb" role="progressbar" aria-valuenow={qz.idx} aria-valuemax={total}>
      <div class="qpbf" style="width: {progress * 100}%; background: {color}"></div>
    </div>

    <!-- Header: quit + label + score -->
    <div class="qhdr">
      <div class="qmeta">
        <span class="q-lbl">Q {qz.viewIdx + 1} of {total}</span>
        <span class="q-score" style="background: {color}22; color: {color}">{qz.score} correct</span>
        <button type="button" class="quiz-quit-btn" onclick={onQuit} aria-label="Quit quiz">✕ Quit</button>
      </div>
    </div>

    <!-- Question card -->
    <div class="qcard">
      <p class="q-text">{q?.t ?? ''}</p>

      {#if q?.s}
        <div class="q-visual" aria-hidden="true">{@html q.s}</div>
      {/if}

      {#if isReview}
        <p style="font-size:var(--fs-sm); color:var(--txt2); margin:0 0 10px">👁 Review — answer locked</p>
      {/if}

      <!-- Answer grid -->
      <div class="agrid" role="group" aria-label="Answer choices">
        {#each (isReview ? (pastAnswer?.opts ?? q?.o ?? []) : opts.map(o => o.text)) as optText, i}
          {@const origIdx = isReview ? i : opts[i]?.origIdx}
          {@const isCorrect = isReview
            ? optText === (pastAnswer?.opts?.[pastAnswer.correct] ?? q?.o[q.a])
            : origIdx === q?.a}
          {@const isChosen = isReview ? i === pastAnswer?.chosen : i === chosenIdx}
          {@const btnClass = !answered && !isReview ? '' : isCorrect ? 'correct' : isChosen ? 'wrong' : ''}

          <button
            type="button"
            class="abtn {btnClass}"
            onclick={() => pickAnswer(i)}
            disabled={answered || isReview}
            aria-label="Answer: {optText}"
            aria-pressed={isChosen}
          >
            {optText}
          </button>
        {/each}
      </div>

      <!-- Reveal panel -->
      {#if answered && !isReview}
        {@const wasCorrect = opts[chosenIdx ?? 0]?.origIdx === q?.a}
        <div class="reveal {wasCorrect ? 'ok' : 'no'}" role="status" aria-live="polite">
          <p class="rev-h {wasCorrect ? 'ok' : 'no'}">
            {wasCorrect ? '🎉 Correct! Great job!' : '😊 Not quite…'}
          </p>
          {#if !wasCorrect}
            <p class="rev-correct">✅ Correct answer: {correctText}</p>
          {/if}
          <p class="rev-exp">💡 {q?.e}</p>

          {#if !wasCorrect}
            {#if hintLoading}
              <p class="rev-time" aria-live="polite">🤔 Thinking…</p>
            {:else if hintText}
              <div class="rev-tip" role="note">
                <strong>✨ AI Hint</strong><br>{hintText}
              </div>
            {:else if hintError}
              <p class="rev-time" style="color:#e74c3c">{hintError}</p>
            {:else}
              <button type="button" class="hint-btn-legacy" onclick={fetchHint}>✨ Get a Hint</button>
            {/if}
          {/if}
        </div>
      {/if}

      <!-- Review reveal -->
      {#if isReview && pastAnswer}
        <div class="reveal {pastAnswer.ok ? 'ok' : 'no'}" role="status">
          <p class="rev-h {pastAnswer.ok ? 'ok' : 'no'}">
            {pastAnswer.ok ? '🎉 Correct!' : '😊 Not quite…'}
          </p>
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

    <!-- Navigation -->
    <div class="quiz-nav-row">
      {#if qz.viewIdx > 0}
        <button type="button" class="prev-btn" onclick={goBack}>← Back</button>
      {/if}

      {#if answered || isReview}
        <button
          type="button"
          class="next-btn"
          style="background: {color}"
          onclick={nextQuestion}
        >
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
