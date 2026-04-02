<script lang="ts">
  import { goto } from '$app/navigation';
  import { unitsData, activeStudent, done, scores, streak, familyProfiles, activeStudentId, guestMode } from '$lib/stores';
  import { verifyStudentPin } from '$lib/services/auth';
  import UnitCard from '$lib/components/home/UnitCard.svelte';
  import StreakCalendar from '$lib/components/home/StreakCalendar.svelte';
  // ── Computed progress ────────────────────────────────────────────────────────

  // Per-unit lesson done count (80%+ on lesson quiz)
  function unitLessonsDone(u: typeof $unitsData[0]): number {
    return u.lessons.filter(l => $scores.some(s => s.qid === 'lq_' + l.id && s.pct >= 80)).length;
  }

  // Unit quiz passed?
  function unitQuizDone(u: typeof $unitsData[0]): boolean {
    return $scores.some(s => s.qid === u.id + '_uq' && s.pct >= 80);
  }

  // Is unit unlocked? (matches legacy isUnitUnlocked)
  function isUnitUnlocked(idx: number): boolean {
    if (idx === 0) return true;
    const prevUnit = $unitsData[idx - 1];
    if (!prevUnit) return false;
    return $scores.some(s => s.qid === prevUnit.id + '_uq' && s.pct >= 80);
  }

  // Find current unit index (matches legacy logic)
  const currentUnitIdx = $derived.by(() => {
    let cur = 0;
    $unitsData.forEach((u, i) => { if (isUnitUnlocked(i)) cur = i; });
    const u = $unitsData[cur];
    if (u) {
      const allDone = u.lessons.every(l => $scores.some(s => s.qid === 'lq_' + l.id && s.pct >= 80));
      const uqDone = $scores.some(s => s.qid === u.id + '_uq' && s.pct >= 80);
      if (allDone && uqDone && cur < $unitsData.length - 1) cur++;
    }
    return cur;
  });

  // Overall progress across all 10 units
  const completedCount = $derived(
    $unitsData.reduce((acc, u) => acc + unitLessonsDone(u), 0)
  );
  const totalLessons = $derived($unitsData.reduce((acc, u) => acc + u.lessons.length, 0));
  const progressPct  = $derived(totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0);

  // ── Profile switcher (inline bottom sheet) ───────────────────────────────────
  let showSwitcher   = $state(false);
  let switcherView   = $state<'list' | 'pin'>('list');
  let switchTarget   = $state<string | null>(null);
  let switchBuffer   = $state<number[]>([]);
  let switchError    = $state('');
  let switchLoading  = $state(false);

  const switchProfile = $derived(
    switchTarget ? ($familyProfiles.find(p => p.id === switchTarget) ?? null) : null
  );

  // Show prof-btn only when 2+ profiles exist
  const showProfBtn = $derived($familyProfiles.length >= 2);

  function openSwitcher() {
    switcherView  = 'list';
    switchTarget  = null;
    switchBuffer  = [];
    switchError   = '';
    showSwitcher  = true;
  }

  function selectForPin(id: string) {
    if (id === $activeStudentId) { showSwitcher = false; return; }
    switchTarget = id;
    switchBuffer = [];
    switchError  = '';
    switcherView = 'pin';
  }

  function handlePinInput(e: Event) {
    const inp = e.target as HTMLInputElement;
    const digits = inp.value.replace(/\D/g, '').slice(0, 4).split('').map(Number);
    switchBuffer = digits;
    inp.value = digits.join('');
    if (digits.length === 4) submitSwitch();
  }

  async function submitSwitch() {
    if (!switchTarget || switchLoading) return;
    switchLoading = true;
    switchError   = '';
    const { success, attemptsLeft, error } = await verifyStudentPin(switchTarget, switchBuffer.join(''));
    switchLoading = false;
    if (error) { switchError = error; switchBuffer = []; return; }
    if (success) {
      activeStudentId.set(switchTarget);
      showSwitcher = false;
    } else {
      switchBuffer = [];
      switchError  = attemptsLeft !== null && attemptsLeft > 0
        ? `Wrong PIN. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`
        : 'Account locked. Try again later.';
    }
  }

  // ── Streak calendar ──────────────────────────────────────────────────────────
  let showStreakCal = $state(false);

  // ── Settings / dashboard nav ─────────────────────────────────────────────────
  function goSettings() {
    goto('/settings');
  }

  // ── Fire SVG — inline helper for streak badge ─────────────────────────────
  function fireSvg(w: number, h: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 38" width="${w}" height="${h}" style="display:inline-block;vertical-align:middle"><defs><radialGradient id="hfg" cx="50%" cy="95%" r="55%"><stop offset="0%" stop-color="#ffb300" stop-opacity=".7"/><stop offset="100%" stop-color="#ff6600" stop-opacity="0"/></radialGradient><linearGradient id="hfo" x1="30%" y1="0%" x2="70%" y2="100%"><stop offset="0%" stop-color="#ff9500"/><stop offset="55%" stop-color="#ff5a00"/><stop offset="100%" stop-color="#e83200"/></linearGradient><linearGradient id="hfm" x1="30%" y1="0%" x2="70%" y2="100%"><stop offset="0%" stop-color="#ffcd3c"/><stop offset="100%" stop-color="#ff8c00"/></linearGradient><linearGradient id="hfi" x1="40%" y1="0%" x2="60%" y2="100%"><stop offset="0%" stop-color="#fffde7"/><stop offset="100%" stop-color="#ffe033"/></linearGradient></defs><ellipse cx="16" cy="36" rx="9" ry="2.5" fill="url(#hfg)"/><path d="M16,36 C9,33 5,27 5,20 C5,13.5 8.5,8.5 12,5.5 C11,9.5 11.5,13 13.5,15.5 C12,10.5 14,3 16,0 C16,0 18,7.5 16.5,13 C19,10.5 19.5,7 19,4.5 C22.5,7.5 27,13.5 27,20 C27,27 23,33 16,36Z" fill="url(#hfo)"/><path d="M16,32 C11,29.5 9,25.5 9,21.5 C9,17.5 11,14.5 13,12.5 C12.5,15.5 13,18 14.5,20 C14,16.5 14.5,13 16,11 C16,11 17.5,15 17,19 C18.5,17 19,14.5 18.5,12 C20.5,14 23,17.5 23,21.5 C23,25.5 21,29.5 16,32Z" fill="url(#hfm)"/><path d="M16,28 C13.5,26 12.5,23.5 12.5,21 C12.5,18.5 14,16.5 15,15 C15,17 15.5,18.5 16,20.5 C16.5,18.5 17,17 16,15 C17.5,16.5 19.5,18.5 19.5,21 C19.5,23.5 18.5,26 16,28Z" fill="url(#hfi)"/></svg>`;
  }
</script>

<!-- ── Fixed nav buttons (home-only: profile switcher) ──────────────────── -->
{#if showProfBtn && !$guestMode}
  <button
    id="prof-btn"
    type="button"
    class="prof-btn"
    aria-label="Switch profile: {$activeStudent?.display_name ?? ''}"
    onclick={openSwitcher}
  >
    <span style="line-height:1">{$activeStudent?.avatar_emoji ?? '👤'}</span>
  </button>
{/if}

<!-- ── Home screen ──────────────────────────────────────────────────────── -->
<div class="sc" id="home">
  <div class="home-in">

    <!-- Hero -->
    <div class="hero">
      <span class="hero-ico" style="display:block;width:72px;height:72px;margin:0 auto;filter:drop-shadow(0 3px 8px rgba(0,80,20,0.18))"><svg viewBox="0 0 310 300" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hi-l1" x1="5%" y1="5%" x2="95%" y2="95%"><stop offset="0%" stop-color="#ffd8a0"/><stop offset="38%" stop-color="#f5a020"/><stop offset="100%" stop-color="#c86c00"/></linearGradient><linearGradient id="hi-l2" x1="95%" y1="5%" x2="5%" y2="95%"><stop offset="0%" stop-color="#ffe4b0"/><stop offset="38%" stop-color="#ee9010"/><stop offset="100%" stop-color="#b85e00"/></linearGradient><linearGradient id="hi-ls" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3ada6e"/><stop offset="100%" stop-color="#14762e"/></linearGradient><linearGradient id="hi-lb" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#aeffc8"/><stop offset="100%" stop-color="#28c45c"/></linearGradient></defs><g stroke-linecap="round" fill="none"><path d="M154 284 Q100 278 72 292" stroke="#16763a" stroke-width="3.0"/><path d="M156 284 Q210 278 238 292" stroke="#16763a" stroke-width="3.0"/><path d="M154 283 Q112 270 92 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M156 283 Q198 270 218 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M154 283 Q128 266 116 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M156 283 Q182 266 194 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M154 282 Q142 266 138 260" stroke="#20a650" stroke-width="3.5"/><path d="M156 282 Q168 266 172 260" stroke="#20a650" stroke-width="3.5"/><path d="M154 283 Q105 276 76 289" stroke="#50de80" stroke-width="1.5" opacity="0.55"/><path d="M156 283 Q205 276 234 289" stroke="#50de80" stroke-width="1.5" opacity="0.55"/><path d="M154 282 Q130 268 118 270" stroke="#50de80" stroke-width="1.4" opacity="0.50"/><path d="M156 282 Q180 268 192 270" stroke="#50de80" stroke-width="1.4" opacity="0.50"/></g><path d="M155 278 Q152 234 154 190 Q156 155 155 118" stroke="url(#hi-ls)" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M154 194 C136 174,82 152,62 108 C50 78,74 50,104 70 C126 85,144 146,154 194Z" fill="url(#hi-l1)"/><ellipse cx="96" cy="110" rx="22" ry="12" fill="rgba(255,255,255,0.26)" transform="rotate(-35 96 110)"/><path d="M153 189 C130 166 88 128 68 100" stroke="rgba(255,255,255,0.42)" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M156 162 C176 142,228 120,248 76 C260 46,236 18,206 38 C184 54,164 112,156 162Z" fill="url(#hi-l2)"/><ellipse cx="212" cy="80" rx="21" ry="11" fill="rgba(255,255,255,0.24)" transform="rotate(34 212 80)"/><path d="M157 158 C178 134 210 94 228 68" stroke="rgba(255,255,255,0.38)" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M155 118 C147 100 145 74 155 56 C165 74 163 100 155 118Z" fill="url(#hi-lb)"/></svg></span>
      <h1 class="hero-h1">My Math Roots</h1>
      <div class="hero-sub">K-5 Review</div>
      <div class="hero-credit">Created by Akeem Jones</div>
      <span class="hero-tag">10 Units · Lesson Quizzes · Unit Tests</span>
    </div>

    <!-- Progress bar — wired to $done -->
    <div class="op">
      <div class="op-title">⭐ Your Progress</div>
      <div class="pb"><div class="pbf" style="width: {progressPct}%"></div></div>
      <div class="pb-lbl">{completedCount} of {totalLessons} lessons completed — {progressPct}%</div>
    </div>

    <!-- Streak badge — only visible when streak > 0 -->
    {#if $streak.current > 0}
      <div style="text-align:center;margin:6px 16px 0">
        <button
          type="button"
          id="streak-badge"
          class="streak-badge-btn"
          onclick={() => showStreakCal = true}
          aria-label="View streak calendar: {$streak.current}-day streak"
        >
          {@html fireSvg(22, 30)}
          <strong>{$streak.current}-day streak</strong>
          {#if $streak.longest > $streak.current}
            <span style="opacity:.65;font-weight:400"> · Best: {$streak.longest}</span>
          {/if}
        </button>
      </div>
    {/if}

    <!-- Scroll hint -->
    <div class="carousel-hint">📜 Scroll to browse all 10 units</div>

    <!-- Unit scroll box -->
    <div class="carousel-wrap">
      <div class="carousel-track">
        {#if $unitsData.length === 0}
          <p style="text-align:center; color:var(--txt2); padding: 2rem 0;">Loading curriculum…</p>
        {:else}
          {#each $unitsData as unit, i}
            {@const unlocked = isUnitUnlocked(i)}
            {@const dL = unitLessonsDone(unit)}
            {@const uqD = unitQuizDone(unit)}
            {@const isCurrent = i === currentUnitIdx}
            {@const isDone = unlocked && !isCurrent}
            <UnitCard
              id={unit.id}
              name={unit.name}
              icon={unit.icon}
              svg={unit.svg}
              color={unit.color}
              teks={unit.teks}
              locked={!unlocked}
              done={isDone}
              current={isCurrent}
              lessonsTotal={unit.lessons.length}
              lessonsDone={dL}
              uqDone={uqD}
              onSelect={() => goto(`/unit/${unit.id}`)}
            />
          {/each}
        {/if}
      </div>
    </div>

    <!-- Score history -->
    <div class="scores-link">
      <button
        type="button"
        class="big-btn"
        style="background: linear-gradient(135deg,#ffd700,#ff8c00); box-shadow: 0 5px 0 #c67000"
        onclick={() => goto('/history')}
      >
        🏆 Score History
      </button>
    </div>

  </div>
</div>

<!-- Streak Calendar modal -->
{#if showStreakCal}
  <StreakCalendar onClose={() => showStreakCal = false} />
{/if}

<!-- Profile Switcher bottom sheet -->
{#if showSwitcher}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="ps-overlay" onclick={() => showSwitcher = false}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="ps-sheet ps-sheet-open" onclick={(e) => e.stopPropagation()}>

      {#if switcherView === 'list'}
        <div class="ps-sheet-handle"></div>
        <div class="ps-title">Switch Profile</div>
        <div class="ps-profile-list">
          {#each $familyProfiles as profile}
            {@const isActive = profile.id === $activeStudentId}
            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
            <div
              class="ps-profile-item {isActive ? 'ps-profile-active' : ''}"
              onclick={() => selectForPin(profile.id)}
            >
              <div
                class="ps-av"
                style="background: linear-gradient(135deg, {profile.avatar_color_from}, {profile.avatar_color_to})"
              >{profile.avatar_emoji}</div>
              <div class="ps-item-name">{profile.display_name}</div>
              {#if isActive}<div class="ps-check" aria-label="Active">✓</div>{/if}
            </div>
          {/each}
        </div>
        <button type="button" class="ps-cancel-btn" onclick={() => showSwitcher = false}>Cancel</button>

      {:else if switcherView === 'pin' && switchProfile}
        <div class="ps-sheet-handle"></div>
        <button type="button" class="ps-back-btn" onclick={() => { switcherView = 'list'; switchBuffer = []; switchError = ''; }}>
          ← Back
        </button>
        <div
          class="ps-av-lg"
          style="background: linear-gradient(135deg, {switchProfile.avatar_color_from}, {switchProfile.avatar_color_to})"
        >{switchProfile.avatar_emoji}</div>
        <div class="ps-name-lg">{switchProfile.display_name}</div>
        <div class="ps-tap-hint">Tap to enter PIN</div>
        <div style="position:relative;padding:14px 0;cursor:pointer">
          <div style="display:flex;gap:12px;justify-content:center">
            {#each [0,1,2,3] as i}
              <div class="ls-pin-dot {i < switchBuffer.length ? 'ls-pin-dot-filled' : 'ls-pin-dot-empty'}"></div>
            {/each}
          </div>
          <input
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="4"
            autocomplete="one-time-code"
            value={switchBuffer.join('')}
            oninput={handlePinInput}
            style="position:absolute;inset:0;opacity:0;width:100%;height:100%;font-size:16px;cursor:pointer;border:none;outline:none;background:transparent"
            aria-label="Enter PIN"
          />
        </div>
        {#if switchLoading}
          <div class="ps-pin-msg" style="color:var(--txt2)">Checking…</div>
        {:else if switchError}
          <div class="ps-pin-msg" style="color:#e74c3c">{switchError}</div>
        {:else}
          <div class="ps-pin-msg">&nbsp;</div>
        {/if}
      {/if}

    </div>
  </div>
{/if}

<style>
  /* ── Fire SVG inline helper ── */
  /* (defined as a script function below the style block) */

  /* ── Nav buttons ── */
  :global(.prof-btn) {
    position: fixed;
    top: calc(14px + env(safe-area-inset-top));
    left: 16px;
    z-index: 80;
    width: 50px; height: 50px;
    border-radius: 50%;
    background: rgba(255,255,255,0.85);
    border: 1.5px solid rgba(255,255,255,0.82);
    box-shadow: 0 4px 18px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.95);
    cursor: pointer;
    font-size: var(--fs-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform .2s, box-shadow .2s;
    -webkit-tap-highlight-color: transparent;
  }
  :global(.prof-btn:active) { transform: scale(.93); }

  :global(.cog-btn) {
    position: fixed;
    top: calc(14px + env(safe-area-inset-top));
    right: 16px;
    z-index: 80;
    width: 50px; height: 50px;
    border-radius: 50%;
    background: rgba(255,255,255,0.85);
    border: 1.5px solid rgba(255,255,255,0.82);
    box-shadow: 0 4px 18px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.95);
    cursor: pointer;
    font-size: var(--fs-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform .3s, box-shadow .2s;
    -webkit-tap-highlight-color: transparent;
  }
  :global(.cog-btn:active) { transform: scale(.93); }
  :global(.cog-ico) { display: inline-block; transition: transform .35s ease; line-height: 1; }
  @media (hover: hover) {
    :global(.cog-btn:hover .cog-ico) { transform: rotate(60deg); }
    :global(.cog-btn:hover), :global(.prof-btn:hover) { box-shadow: 0 5px 20px rgba(0,0,0,.2); }
  }

  /* ── Hero icon ── */
  :global(.hero-ico) {
    font-size: var(--fs-4xl);
    display: block;
    animation: bob 2.5s ease-in-out infinite;
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }

  /* ── Streak badge button ── */
  .streak-badge-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--fs-md, 1.1rem);
    color: #e06000;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    letter-spacing: .3px;
    padding: 4px 14px;
    border-radius: 20px;
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1.5px solid rgba(255,150,0,0.55);
    box-shadow: 0 2px 8px rgba(255,100,0,0.10);
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease;
    animation: streak-pulse 3s ease-in-out infinite;
    -webkit-tap-highlight-color: transparent;
  }
  .streak-badge-btn:active {
    transform: scale(.93);
    box-shadow: 0 1px 4px rgba(255,100,0,0.18);
  }
  @keyframes streak-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.75; }
  }

  /* ── Profile switcher overlay ── */
  .ps-overlay {
    position: fixed;
    inset: 0;
    z-index: 9600;
    background: rgba(0,0,0,0.45);
    display: flex;
    align-items: flex-end;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  :global(.ps-sheet) {
    width: 100%;
    background: var(--bg, #fff);
    border-radius: 20px 20px 0 0;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
    transform: translateY(100%);
    transition: transform .3s cubic-bezier(.4,0,.2,1);
    max-height: 80vh;
    overflow-y: auto;
  }
  :global(.ps-sheet-open) { transform: translateY(0); }

  :global(.ps-sheet-handle) {
    width: 40px; height: 4px;
    background: var(--border2, #e0e0e0);
    border-radius: 2px;
    margin: 12px auto 16px;
  }
  :global(.ps-title) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-lg, 1.3rem);
    color: var(--txt, #222);
    text-align: center;
    margin-bottom: 14px;
  }
  :global(.ps-profile-list) { display: flex; flex-direction: column; gap: 4px; padding: 0 16px 8px; }
  :global(.ps-profile-item) {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 14px; border-radius: 14px;
    cursor: pointer; transition: background .15s;
    -webkit-tap-highlight-color: transparent;
  }
  :global(.ps-profile-item:active) { background: var(--bg2, #f5f5f5); }
  :global(.ps-profile-active)      { background: rgba(74,144,217,0.08); }
  :global(.ps-av) {
    width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; box-shadow: 0 2px 8px rgba(0,0,0,.18);
  }
  :global(.ps-item-name) {
    flex: 1;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-md, 1.1rem); color: var(--txt, #222); font-weight: 700;
  }
  :global(.ps-check) { color: #4a90d9; font-size: 1.2rem; font-weight: 800; }
  :global(.ps-cancel-btn) {
    display: block; width: calc(100% - 32px); margin: 8px 16px 0;
    padding: 13px; border-radius: 14px; border: none;
    background: var(--bg2, #f5f5f5); color: var(--txt2, #666);
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-base, 0.95rem); cursor: pointer;
  }
  :global(.ps-back-btn) {
    display: block; background: none; border: none; color: var(--txt2, #666);
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-sm, 0.85rem); padding: 0 16px 10px; cursor: pointer;
  }
  :global(.ps-av-lg) {
    width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem; box-shadow: 0 4px 16px rgba(0,0,0,.2);
  }
  :global(.ps-name-lg) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-xl, 1.6rem); color: var(--txt, #222);
    text-align: center; margin-bottom: 4px;
  }
  :global(.ps-tap-hint) {
    font-size: var(--fs-sm, 0.85rem); color: var(--txt2, #888);
    text-align: center; margin-bottom: 6px;
    font-family: 'Nunito', sans-serif;
  }
  :global(.ps-pin-msg) {
    font-size: .78rem; text-align: center; min-height: 1.2rem; margin-top: 4px; padding: 0 16px;
  }
</style>

