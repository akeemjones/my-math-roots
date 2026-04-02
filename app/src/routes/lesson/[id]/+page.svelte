<script lang="ts">
  /**
   * /lesson/[id] — Lesson screen, 1:1 with legacy _renderLesson().
   *
   * Structure (matches legacy exactly):
   *   Step 1: Key Ideas (.learn-card)
   *   Step 2: Worked Examples (.learn-card) — one at a time, ✨ New Examples cycling
   *   Step 3: Practice Drills (.practice-card) — qBank multiple-choice, ➕ More
   *   Step 4: Quiz launch (.lq-start-btn) + completion / next-lesson state
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { unitsData, scores, done } from '$lib/stores';
  import { loadUnit } from '$lib/boot';
  import { playCorrect, playWrong } from '$lib/services/sound';
  import { handleExampleAction } from '$lib/services/animations';
  import { settings } from '$lib/stores';
  import type { Question } from '$lib/types';

  const EMOJIS = ['🤔','💡','🧠','⭐','🎯','🔢','✏️','📐','🦁','🐯','🦊','🐸'];

  const lessonId = $derived($page.params.id ?? '');
  const unitId   = $derived(lessonId.replace(/l\d+$/, ''));

  const unit   = $derived($unitsData.find(u => u.id === unitId) ?? null);
  const lesson = $derived(unit?.lessons.find(l => l.id === lessonId) ?? null);

  let loading = $state(false);

  // ── Derived score state ──────────────────────────────────────────────────────
  const lqId       = $derived(`lq_${lessonId}`);
  const lqPassed   = $derived($done[lqId] === true);
  const lqBestPct  = $derived(
    ($scores.filter(s => s.qid === lqId).sort((a, b) => b.pct - a.pct)[0]?.pct) ?? 0
  );

  // Next lesson state
  const unitLessons    = $derived(unit?.lessons ?? []);
  const lessonIdx      = $derived(unitLessons.findIndex(l => l.id === lessonId));
  const nextLessonIdx  = $derived(lessonIdx + 1);
  const isLastLesson   = $derived(nextLessonIdx >= unitLessons.length);
  const nextLesson     = $derived(!isLastLesson ? unitLessons[nextLessonIdx] : null);

  // ── Example cycling ──────────────────────────────────────────────────────────
  let exIdx   = $state(0);
  let exFade  = $state(false);

  const currentEx = $derived(lesson?.examples?.[exIdx] ?? null);
  const exTotal   = $derived(lesson?.examples?.length ?? 0);

  function nextExample() {
    if (exTotal <= 1) return;
    exFade = true;
    setTimeout(() => {
      exIdx  = (exIdx + 1) % exTotal;
      exFade = false;
    }, 180);
  }

  // ── Practice drills (qBank multiple-choice) ──────────────────────────────────
  interface Drill {
    id: string;
    q: Question;
    opts: string[];          // shuffled option texts
    correctText: string;
    emoji: string;
    answered: boolean;
    chosenIdx: number | null;
    isOk: boolean;
  }

  let drills = $state<Drill[]>([]);

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildDrills() {
    const bank: Question[] = lesson?.qBank ?? (lesson as any)?.quiz ?? [];
    if (!bank.length) { drills = []; return; }
    const batch = shuffle(bank).slice(0, 3);
    const ts = Date.now();
    drills = batch.map((q, i) => ({
      id: `pq-${lessonId}-${ts}-${i}`,
      q,
      opts: shuffle([...q.o]),
      correctText: q.o[q.a],
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      answered: false,
      chosenIdx: null,
      isOk: false,
    }));
  }

  function pickPracticeAns(drillIdx: number, btnIdx: number) {
    const drill = drills[drillIdx];
    if (!drill || drill.answered) return;
    const chosenText = drill.opts[btnIdx];
    const isOk = chosenText === drill.correctText;
    drills[drillIdx] = { ...drill, answered: true, chosenIdx: btnIdx, isOk };
    if (isOk) playCorrect($settings.sound);
    else       playWrong($settings.sound);
  }

  function morePractice() {
    buildDrills();
  }

  // ── Navigation ────────────────────────────────────────────────────────────────
  function goBack()    { goto(`/unit/${unitId}`); }
  function startQuiz() { goto(`/quiz/lq_${lessonId}`); }
  function goNextLesson() {
    if (nextLesson) goto(`/lesson/${nextLesson.id}`);
    else goto(`/unit/${unitId}`);
  }

  onMount(async () => {
    if (!unitId) return;
    loading = true;
    await loadUnit(unitId);
    loading = false;
    exIdx  = 0;
    exFade = false;
    buildDrills();
  });
</script>

{#if !lesson && !loading}
  <main class="sc" style="display:flex;align-items:center;justify-content:center;min-height:100dvh">
    <p style="color:var(--txt2)">Lesson not found.</p>
    <button type="button" class="bar-back" onclick={goBack} style="margin-left:8px">← Back</button>
  </main>
{:else if loading && !lesson?.points}
  <main class="sc" style="display:flex;align-items:center;justify-content:center;min-height:100dvh">
    <p style="color:var(--txt2)">Loading lesson…</p>
  </main>
{:else if lesson}
  <div class="sc" id="lesson-screen" style="--ac:{unit?.color ?? '#4a90d9'};--color:{unit?.color ?? '#4a90d9'}">

    <!-- Sticky bar (matches legacy #lesson-screen .bar) -->
    <div class="bar" style="padding-right:76px">
      <button type="button" class="bar-back" style="color:{unit?.color ?? '#4a90d9'}"
              onclick={goBack} aria-label="Back to unit">
        {unit?.name ?? 'Back'}
      </button>
      <div class="bar-title">{lesson.icon} {lesson.title}</div>
      {#if lqPassed}
        <div class="bar-badge" style="background:#eafaf1;color:#27ae60;border-radius:50px;padding:5px 10px;font-size:1.1rem">✅</div>
      {/if}
    </div>

    <!-- TEKS strip -->
    <div class="les-teks-bar">{unit?.teks ?? ''}</div>

    <!-- Scrollable lesson body -->
    <div class="sc-in" id="les-body">

      <!-- STEP 1 — Key Ideas -->
      <p class="sec-tip">👇 <strong>Step 1:</strong> Read these key ideas first — they are the most important things to learn in this lesson.</p>
      <div class="learn-card">
        <h3 style="color:{unit?.color ?? '#4a90d9'}">💡 Key Ideas</h3>
        <div class="kp-list">
          {#each lesson.points ?? [] as point}
            <div class="kp">
              <span class="kp-ico">⭐</span>
              <span>{point}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- STEP 2 — Worked Examples -->
      {#if lesson.examples && lesson.examples.length > 0 && currentEx}
        <p class="sec-tip">👇 <strong>Step 2:</strong> Study these worked examples carefully — they show you exactly how to solve problems step by step. Tap <em>✨ New Examples</em> to see fresh ones!</p>
        <div class="learn-card" id="ex-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <h3 style="color:{unit?.color ?? '#4a90d9'};margin:0">📖 Worked Examples</h3>
            {#if exTotal > 1}
              <button type="button" class="new-ex-btn"
                      style="background:{unit?.color ?? '#4a90d9'}"
                      onclick={nextExample}>✨ New Examples</button>
            {/if}
          </div>
          <div class="ex-list" style="opacity:{exFade ? 0 : 1};transition:opacity .18s ease"
               onclick={handleExampleAction}>
            {#key exIdx}
            <div class="ex" style="--exc:{currentEx.c ?? unit?.color ?? '#4a90d9'};--exbg:{(currentEx.c ?? unit?.color ?? '#4a90d9')}0d">
              <div class="ex-tag">Example {exIdx + 1}: {currentEx.tag}</div>
              <div class="ex-problem">{currentEx.p}</div>
              <div class="ex-steps">{@html (currentEx.s ?? '').replace(/\n/g, '<br>')}</div>
              <div class="ex-answer">{currentEx.a}</div>
            </div>
            {/key}
          </div>
        </div>
      {/if}

      <!-- STEP 3 — Practice Drills -->
      {#if drills.length > 0}
        <p class="sec-tip">👇 <strong>Step 3:</strong> Try these practice problems! Pick your answer and get instant feedback — no score, no timer, just learning. Tap <em>➕ More</em> for fresh questions!</p>
        <div class="practice-card" id="practice-card-{lessonId}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <h3 style="color:{unit?.color ?? '#4a90d9'};margin:0">✏️ Practice Drills</h3>
            <button type="button" class="more-practice-btn"
                    style="background:{unit?.color ?? '#4a90d9'}"
                    onclick={morePractice}>➕ More</button>
          </div>

          {#each drills as drill, di}
            <div class="pq-drill" id={drill.id}>
              <div class="pq-q">
                <span class="pq-emo">{drill.emoji}</span>
                {#if drill.q.t?.includes('<')}
                  {@html drill.q.t}
                {:else}
                  {drill.q.t}
                {/if}
              </div>

              {#if drill.q.s}
                <div class="q-visual">{@html drill.q.s}</div>
              {/if}

              <div class="pq-choices">
                {#each drill.opts as optText, bi}
                  {@const isCorrect = optText === drill.correctText}
                  {@const isChosen  = drill.answered && drill.chosenIdx === bi}
                  <button type="button"
                          class="pq-choice"
                          class:pq-c-correct={drill.answered && isCorrect}
                          class:pq-c-wrong={isChosen && !isCorrect}
                          disabled={drill.answered}
                          onclick={() => pickPracticeAns(di, bi)}>
                    {optText}
                  </button>
                {/each}
              </div>

              {#if drill.answered}
                <div class="pq-drill-fb">
                  <div class="pq-drill-result {drill.isOk ? 'ok' : 'no'}">
                    <div class="pq-dr-h">{drill.isOk ? '🎉 Correct!' : '😊 Not quite...'}</div>
                    {#if !drill.isOk}
                      <div class="pq-dr-correct">✅ Answer: {drill.correctText}</div>
                    {/if}
                    <div class="pq-dr-exp">💡 {drill.q.e}</div>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <!-- STEP 4 — Quiz launch -->
      <p class="sec-tip">👇 <strong>Step 4 — Quiz Time!</strong> Answer 8 questions. You need <strong>80%</strong> to {isLastLesson ? 'unlock the <strong>Unit Quiz</strong>' : 'unlock the next lesson'}. Take your time — you can try again as many times as you need!</p>

      <button type="button" class="lq-banner lq-start-btn"
              style="background:linear-gradient(135deg,{unit?.color ?? '#4a90d9'},{unit?.color ?? '#4a90d9'}cc);width:100%;border:none;cursor:pointer;font-family:inherit;text-align:center;"
              onclick={startQuiz}>
        <div class="lq-start-label">{lqPassed ? '🔄 Retake Quiz' : '🚀 Start Quiz'}</div>
        <div class="lq-start-sub">{lqPassed ? 'Try to improve your score!' : 'Tap here to test what you learned — 8 questions!'}</div>
      </button>

      <!-- Completion / next-lesson state -->
      {#if lqPassed}
        <div class="done-card">
          <span class="done-ico">🏆</span>
          <div class="done-title">
            {isLastLesson ? 'Lesson Complete! All lessons done — take the Unit Quiz!' : 'Lesson Complete! Great job!'}
          </div>
          {#if !isLastLesson && nextLesson}
            <button type="button" class="next-lesson-btn"
                    style="border-color:{unit?.color ?? '#4a90d9'};color:{unit?.color ?? '#4a90d9'}"
                    onclick={goNextLesson}>
              Next: {nextLesson.icon} {nextLesson.title} →
            </button>
          {:else if isLastLesson}
            <button type="button" class="next-lesson-btn"
                    style="border-color:{unit?.color ?? '#4a90d9'};color:{unit?.color ?? '#4a90d9'}"
                    onclick={goBack}>
              Go to Unit Quiz →
            </button>
          {/if}
        </div>
      {:else if !isLastLesson && nextLesson}
        <button type="button" class="next-lesson-btn next-lesson-locked">
          🔒 Next: {nextLesson.icon} {nextLesson.title}
          <div style="font-size:.78rem;font-weight:400;opacity:.7;margin-top:3px">
            {lqBestPct > 0 ? `Best score: ${lqBestPct}% — need 80% to unlock` : 'Score 80% on the quiz to unlock'}
          </div>
        </button>
      {/if}

      <!-- Bottom padding -->
      <div style="height:32px"></div>
    </div>
  </div>
{/if}
