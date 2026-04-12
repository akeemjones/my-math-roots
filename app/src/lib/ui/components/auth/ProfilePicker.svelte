<script lang="ts">
  import { tick } from 'svelte';
  import { familyProfiles, activeStudentId, authUser } from '$lib/core/stores';
  import { verifyStudentPin, signOut } from '$lib/core/services/auth';
  import { goto } from '$app/navigation';

  // ── State ───────────────────────────────────────────────────────────────────
  let selectedId  = $state<string | null>(null);
  let pinBuffer   = $state<string[]>([]);
  let pinError    = $state('');
  let pinLoading  = $state(false);
  let dotsEl      = $state<HTMLElement | null>(null);
  let pinInputEl  = $state<HTMLInputElement | null>(null);

  // Auto-focus PIN input when profile is selected (triggers iOS keyboard)
  $effect(() => {
    if (selectedId && pinInputEl) {
      tick().then(() => pinInputEl?.focus());
    }
  });

  const selected = $derived(
    selectedId ? ($familyProfiles.find(p => p.id === selectedId) ?? null) : null
  );

  // Auto-select first profile
  $effect(() => {
    if ($familyProfiles.length > 0 && !selectedId) {
      selectedId = $familyProfiles[0].id;
    }
  });

  // ── Avatar selection ─────────────────────────────────────────────────────────
  function selectAvatar(id: string) {
    selectedId = id;
    pinBuffer  = [];
    pinError   = '';
  }

  // ── PIN input (native invisible input overlay) ───────────────────────────────
  function handlePinInput(e: Event) {
    const inp = e.target as HTMLInputElement;
    const val = inp.value.replace(/\D/g, '').slice(0, 4);
    inp.value = val;
    pinBuffer = val.split('');
    if (pinBuffer.length === 4) {
      inp.value = '';
      submitPin();
    }
  }

  async function submitPin() {
    if (!selectedId || pinLoading) return;
    pinLoading = true;
    pinError   = '';
    const { success, attemptsLeft, error } = await verifyStudentPin(selectedId, pinBuffer.join(''));
    pinLoading = false;

    if (error) {
      pinError  = error;
      pinBuffer = [];
      return;
    }

    if (success) {
      activeStudentId.set(selectedId);
      // Layout guard will redirect to / automatically
    } else {
      pinBuffer = [];
      pinError  = attemptsLeft !== null && attemptsLeft > 0
        ? `Wrong PIN — ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left`
        : 'Account locked. Try again later.';
      shakeDots();
    }
  }

  function shakeDots() {
    if (!dotsEl) return;
    dotsEl.classList.remove('ls-pin-shake');
    void dotsEl.offsetWidth; // force reflow
    dotsEl.classList.add('ls-pin-shake');
    setTimeout(() => dotsEl?.classList.remove('ls-pin-shake'), 450);
  }

  // ── Sign out ─────────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await signOut();
    authUser.set(null);
    activeStudentId.set(null);
    familyProfiles.set([]);
    goto('/login', { replaceState: true });
  }
</script>

<!-- ═══════════════════════════════════════════════════════════════════════════
     Full-screen overlay — same dark bg as login screen
     ═══════════════════════════════════════════════════════════════════════════ -->
<div class="pp-screen">
  <div class="pp-wrap">

    <!-- App brand -->
    <div class="pp-brand">
      <span class="pp-brand-ico">🌱</span>
      <span class="pp-brand-name">My Math Roots</span>
      <div class="pp-brand-sub">K-5 Review</div>
    </div>

    <!-- Glass card -->
    <div class="pp-card">

      <!-- "Who's playing?" header -->
      <div class="pp-who-lbl">Who's playing?</div>

      {#if $familyProfiles.length === 0}
        <p class="pp-no-profiles">
          No student profiles found.<br>
          Ask your parent to set up a profile.
        </p>
      {:else}
        <!-- ── Horizontal avatar row ───────────────────────────────────────── -->
        <div class="ls-avatar-row" role="list" aria-label="Student profiles">
          {#each $familyProfiles as profile}
            {@const isSel = profile.id === selectedId}
            <div
              class="ls-avatar-item {isSel ? 'ls-avatar-selected' : ''}"
              role="button"
              tabindex="0"
              onclick={() => selectAvatar(profile.id)}
              onkeydown={(e) => e.key === 'Enter' && selectAvatar(profile.id)}
              aria-label="{profile.display_name}{isSel ? ' (selected)' : ''}"
            >
              <div
                class="ls-avatar-circle"
                style="background: linear-gradient(135deg, {profile.avatar_color_from}, {profile.avatar_color_to});
                       {isSel
                         ? 'border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 0 0 3px rgba(245,158,11,0.45),0 4px 12px rgba(0,0,0,0.3);opacity:1'
                         : 'border:2.5px solid rgba(255,255,255,0.25);box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:0.7'}"
              >
                {profile.avatar_emoji}
              </div>
              <div
                class="ls-avatar-name"
                style="color:{isSel ? '#fff' : 'rgba(255,255,255,0.65)'};font-weight:{isSel ? '700' : '600'}"
              >{profile.display_name}</div>
            </div>
          {/each}
        </div>

        <!-- ── PIN section (shown when a profile is selected) ─────────────── -->
        {#if selected}
          <div class="pp-pin-section">
            <div class="pp-pin-divider"></div>
            <div class="pp-pin-who">
              <span style="color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.06em;font-size:.68rem">
                {selected.display_name}'s PIN
              </span>
            </div>

            <!-- Dots + invisible native input overlay -->
            <div style="position:relative;cursor:pointer;padding-bottom:2px">
              <div
                bind:this={dotsEl}
                style="display:flex;gap:10px;justify-content:center;margin-bottom:10px"
                aria-live="polite"
                aria-label="{pinBuffer.length} of 4 digits entered"
              >
                {#each [0,1,2,3] as i}
                  <div class="ls-pin-dot {i < pinBuffer.length ? 'ls-pin-dot-filled' : 'ls-pin-dot-empty'}"></div>
                {/each}
              </div>

              <input
                bind:this={pinInputEl}
                type="tel"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="4"
                autocomplete="one-time-code"
                data-no-swipe
                value={pinBuffer.join('')}
                oninput={handlePinInput}
                disabled={pinLoading}
                aria-label="Enter 4-digit PIN"
                style="position:absolute;inset:0;opacity:0;width:100%;height:100%;font-size:16px;cursor:pointer;border:none;outline:none;background:transparent"
              />
            </div>

            <!-- Error / loading message -->
            <div class="pp-pin-msg">
              {#if pinLoading}
                <span style="color:rgba(255,255,255,0.6)">Checking…</span>
              {:else if pinError}
                <span style="color:#f87171">{pinError}</span>
                {#if pinError.includes('locked')}
                  <button type="button" class="pp-retry-btn" onclick={() => { selectedId = null; pinError = ''; pinBuffer = []; }}>
                    ← Choose a Different Profile
                  </button>
                {/if}
              {:else}
                &nbsp;
              {/if}
            </div>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Sign out link -->
    <button type="button" class="pp-signout-btn" onclick={handleSignOut}>
      Sign out
    </button>

  </div>
</div>

<style>
  /* ── Full-screen overlay ───────────────────────────────────────────────────── */
  .pp-screen {
    position: fixed;
    inset: 0;
    z-index: 9500;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Same background as login: math-symbol tile + dark blue-green gradient */
    background-image: var(--app-bg-svg), linear-gradient(155deg, #2563b0 0%, #1d7a49 100%);
    background-size: 420px 420px, 100% 100%;
    padding: 16px;
    padding-top: calc(16px + env(safe-area-inset-top));
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
    overflow-y: auto;
  }

  .pp-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 400px;
  }

  /* ── Brand ─────────────────────────────────────────────────────────────────── */
  .pp-brand {
    text-align: center;
  }

  .pp-brand-ico {
    font-size: 2.8rem;
    display: block;
    line-height: 1;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,.35));
    margin-bottom: 6px;
  }

  .pp-brand-name {
    display: block;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 2rem;
    color: #fff;
    font-weight: 400;
    letter-spacing: .5px;
    text-shadow: 0 2px 12px rgba(0,0,0,.45);
    line-height: 1.1;
  }

  .pp-brand-sub {
    font-size: .78rem;
    color: rgba(255,255,255,.65);
    text-transform: uppercase;
    letter-spacing: .12em;
    margin-top: 3px;
  }

  /* ── Glassmorphism card ────────────────────────────────────────────────────── */
  .pp-card {
    width: 100%;
    border-radius: 28px;
    background: rgba(255,255,255,0.13);
    border-top: 1.5px solid rgba(255,255,255,0.40);
    border-left: 1px solid rgba(255,255,255,0.22);
    border-right: 1px solid rgba(255,255,255,0.10);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    box-shadow:
      0 24px 64px rgba(0,0,0,0.45),
      0 4px 16px rgba(0,0,0,0.25),
      inset 0 1.5px 0 rgba(255,255,255,0.30);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    padding: 22px 24px 20px;
    box-sizing: border-box;
  }

  /* ── "Who's playing?" ──────────────────────────────────────────────────────── */
  .pp-who-lbl {
    text-align: center;
    font-size: .68rem;
    color: rgba(255,255,255,.55);
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 16px;
  }

  .pp-no-profiles {
    text-align: center;
    color: rgba(255,255,255,0.6);
    font-size: .88rem;
    line-height: 1.6;
    margin: 0;
    padding: 8px 0 4px;
  }

  /* ── Avatar row ────────────────────────────────────────────────────────────── */
  :global(.ls-avatar-row) {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
  }

  :global(.ls-avatar-item) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform .15s;
  }

  :global(.ls-avatar-item:active) {
    transform: scale(.93);
  }

  .ls-avatar-circle {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: opacity .15s, box-shadow .15s;
    box-sizing: border-box;
  }

  .ls-avatar-name {
    font-size: .72rem;
    margin-top: 5px;
    text-align: center;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    letter-spacing: .02em;
    max-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── PIN section ───────────────────────────────────────────────────────────── */
  .pp-pin-section {
    margin-top: 4px;
  }

  .pp-pin-divider {
    height: 1px;
    background: rgba(255,255,255,0.14);
    margin: 14px 0;
  }

  .pp-pin-who {
    text-align: center;
    margin-bottom: 12px;
  }

  /* ── PIN dots ──────────────────────────────────────────────────────────────── */
  :global(.ls-pin-dot) {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  :global(.ls-pin-dot-filled) {
    background: #f59e0b;
    box-shadow: 0 0 8px rgba(245,158,11,0.7);
  }

  :global(.ls-pin-dot-empty) {
    background: rgba(255,255,255,0.2);
    border: 1.5px solid rgba(255,255,255,0.35);
  }

  @keyframes ls-pin-shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }

  :global(.ls-pin-shake) {
    animation: ls-pin-shake .4s ease;
  }

  .pp-pin-msg {
    font-size: .75rem;
    text-align: center;
    min-height: 1.1rem;
    margin-bottom: 4px;
  }

  /* ── Lockout retry button ──────────────────────────────────────────────────── */
  .pp-retry-btn {
    display: block;
    margin: 8px auto 0;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 50px;
    color: rgba(255,255,255,.8);
    font-size: .78rem;
    padding: 6px 16px;
    cursor: pointer;
    transition: background .15s;
    -webkit-tap-highlight-color: transparent;
  }

  .pp-retry-btn:active {
    background: rgba(255,255,255,.22);
  }

  /* ── Sign out button ───────────────────────────────────────────────────────── */
  .pp-signout-btn {
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 50px;
    color: rgba(255,255,255,.7);
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: .88rem;
    padding: 8px 24px;
    cursor: pointer;
    transition: background .15s;
    -webkit-tap-highlight-color: transparent;
  }

  .pp-signout-btn:active {
    background: rgba(255,255,255,.22);
  }
</style>
