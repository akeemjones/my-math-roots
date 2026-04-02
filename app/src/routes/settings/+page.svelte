<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { settings, isSignedIn, guestMode, activeStudent, authUser } from '$lib/stores';
  import { signOut as authSignOut } from '$lib/services/auth';

  // ── Derived with defaults for fields that may be missing in older persisted data ──
  const theme       = $derived($settings.theme       ?? 'auto');
  const sound       = $derived($settings.sound       ?? 'on');
  const studentName = $derived($settings.studentName ?? '');

  // ── Accessibility (mirrors src/settings.js getA11y / toggleA11y / applyA11y) ──
  const A11Y_KEY = 'wb_a11y';

  function getA11y(): Record<string, boolean> {
    try { return JSON.parse(localStorage.getItem(A11Y_KEY) ?? '{}'); } catch { return {}; }
  }

  let a11y = $state<Record<string, boolean>>({});

  function applyA11y(cfg: Record<string, boolean>) {
    document.body.classList.toggle('a11y-colorblind',    !!cfg.colorblind);
    document.body.classList.toggle('a11y-haptic',        !!cfg.haptic);
    document.body.classList.toggle('a11y-reduce-motion', !!cfg.reduceMotion);
    document.body.classList.toggle('a11y-text-select',   !!cfg.textSelect);
    document.body.classList.toggle('a11y-focus',         !!cfg.focus);
    document.body.classList.toggle('a11y-screenreader',  !!cfg.screenreader);
  }

  function toggleA11y(key: string) {
    const cfg = getA11y();
    if (cfg[key]) delete cfg[key]; else cfg[key] = true;
    localStorage.setItem(A11Y_KEY, JSON.stringify(cfg));
    a11y = { ...cfg };
    applyA11y(cfg);
  }

  onMount(() => {
    const cfg = getA11y();
    a11y = { ...cfg };
    applyA11y(cfg);
  });

  function setTheme(t: 'auto' | 'light' | 'dark') {
    settings.update($s => ({ ...$s, theme: t }));
  }

  function setSound(s: 'on' | 'off') {
    settings.update($s => ({ ...$s, sound: s }));
  }

  function saveStudentName(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    settings.update($s => ({ ...$s, studentName: v }));
  }

  async function signOut() {
    await authSignOut();
    authUser.set(null);
    guestMode.set(false);
    goto('/login', { replaceState: true });
  }

  // ── Accessibility modal ──────────────────────────────────────────────────────
  let showA11y = $state(false);

  // ── Install modal ────────────────────────────────────────────────────────────
  let showInstall  = $state(false);
  let installTab   = $state<'iphone' | 'ipad'>('iphone');
</script>

<div class="sc sett-sc" id="settings-screen">
  <!-- Bar -->
  <div class="bar">
    <button class="bar-back" style="color:#8e44ad" type="button" onclick={() => goto('/')}>Home</button>
    <div class="bar-title">⚙️ Settings</div>
  </div>

  <div class="sc-in">

    <!-- Student Info (guest only) -->
    {#if $guestMode}
      <div class="set-section">
        <div class="set-sec-head">
          <span class="set-sec-ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          </span> Student Info
        </div>
        <div class="set-body">
          <div class="set-row">
            <div class="set-lbl">Student Name <small>shown in score history</small></div>
            <input
              class="set-inp"
              type="text"
              placeholder="e.g. Emma"
              maxlength="30"
              value={studentName}
              oninput={saveStudentName}
            />
          </div>
        </div>
      </div>
    {/if}

    <!-- Appearance -->
    <div class="set-section">
      <div class="set-sec-head">
        <span class="set-sec-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
        </span> Appearance
      </div>
      <div class="set-body">
        <div class="set-lbl" style="margin-bottom:12px">Choose how the app looks</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button type="button" class="theme-btn" class:active={theme === 'auto'} onclick={() => setTheme('auto')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> Auto
          </button>
          <button type="button" class="theme-btn" class:active={theme === 'light'} onclick={() => setTheme('light')}>
            ☀️ Light Mode
          </button>
          <button type="button" class="theme-btn" class:active={theme === 'dark'} onclick={() => setTheme('dark')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark Mode
          </button>
        </div>
      </div>
    </div>

    <!-- Sound Effects -->
    <div class="set-section">
      <div class="set-sec-head">
        <span class="set-sec-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </span> Sound Effects
      </div>
      <div class="set-body">
        <div class="set-lbl" style="margin-bottom:12px">Quiz sounds &amp; navigation sounds</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button type="button" class="theme-btn" class:active={sound === 'on'} onclick={() => setSound('on')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Sound On
          </button>
          <button type="button" class="theme-btn" class:active={sound === 'off'} onclick={() => setSound('off')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg> Sound Off
          </button>
        </div>
      </div>
    </div>

    <!-- Accessibility -->
    <div class="set-section">
      <div class="set-sec-head">
        <span class="set-sec-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        </span> Accessibility
      </div>
      <div class="set-body">
        <p style="font-size:var(--fs-sm);margin-bottom:8px">Colorblind mode, reduce motion, screen reader support, and more.</p>
        <button type="button" class="set-save" style="background:linear-gradient(135deg,#8e44ad,#6c3483);box-shadow:0 4px 0 #4a235a;" onclick={() => showA11y = true}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg> Accessibility Options
        </button>
      </div>
    </div>

    <!-- Install App -->
    <div class="set-section">
      <div class="set-sec-head">
        <span class="set-sec-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </span> Install App on iPhone or iPad
      </div>
      <div class="set-body">
        <p style="font-size:var(--fs-sm);margin-bottom:8px">
          Add this app to your iPhone or iPad home screen for a full-screen, offline experience — no App Store needed.
        </p>
        <button
          type="button"
          class="set-save"
          style="background:linear-gradient(135deg,#4a90d9,#1a6fa8);box-shadow:0 4px 0 #0d4f7a;"
          onclick={() => showInstall = true}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> How to Install
        </button>
      </div>
    </div>

    <!-- Sign In / Sign Out -->
    {#if $isSignedIn}
      <div style="text-align:center;padding:4px 0 24px">
        <button type="button" class="auth-action-btn sign-out-btn" onclick={signOut}>Sign Out</button>
      </div>
    {:else}
      <div style="text-align:center;padding:4px 0 24px">
        <button type="button" class="auth-action-btn sign-in-btn" onclick={() => goto('/login')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ico"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l2 2"/></svg> Log In
        </button>
      </div>
    {/if}

    <!-- Legal links -->
    <div style="text-align:center;padding:0 0 28px;display:flex;justify-content:center;gap:20px">
      <a href="/privacy" class="legal-link">Privacy Policy</a>
      <a href="/terms" class="legal-link">Terms of Service</a>
    </div>

  </div>
</div>

<!-- Accessibility modal — mirrors legacy #a11y-modal -->
{#if showA11y}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="a11y-overlay" onclick={(e) => { if (e.target === e.currentTarget) showA11y = false; }}>
    <div class="modal-card a11y-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <div class="modal-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg> Accessibility
        </div>
        <button type="button" class="modal-close-x" onclick={() => showA11y = false} aria-label="Close">✕</button>
      </div>
      <div class="a11y-row">
        <div class="a11y-info">
          <div class="a11y-lbl">Colorblind-friendly answers</div>
          <div class="a11y-desc">Adds ✓/✗ symbols and border patterns to quiz answers (not just color)</div>
        </div>
        <button type="button" class="a11y-toggle" class:active={!!a11y.colorblind} aria-pressed={!!a11y.colorblind} onclick={() => toggleA11y('colorblind')}></button>
      </div>
      <div class="a11y-row">
        <div class="a11y-info">
          <div class="a11y-lbl">Reduce motion</div>
          <div class="a11y-desc">Turns off slide animations, bouncing, and transitions</div>
        </div>
        <button type="button" class="a11y-toggle" class:active={!!a11y.reduceMotion} aria-pressed={!!a11y.reduceMotion} onclick={() => toggleA11y('reduceMotion')}></button>
      </div>
      <div class="a11y-row">
        <div class="a11y-info">
          <div class="a11y-lbl">Text selection</div>
          <div class="a11y-desc">Allows selecting quiz question and answer text (helpful for dyslexia tools)</div>
        </div>
        <button type="button" class="a11y-toggle" class:active={!!a11y.textSelect} aria-pressed={!!a11y.textSelect} onclick={() => toggleA11y('textSelect')}></button>
      </div>
      <div class="a11y-row">
        <div class="a11y-info">
          <div class="a11y-lbl">Focus indicators</div>
          <div class="a11y-desc">Shows visible outlines when navigating with a keyboard</div>
        </div>
        <button type="button" class="a11y-toggle" class:active={!!a11y.focus} aria-pressed={!!a11y.focus} onclick={() => toggleA11y('focus')}></button>
      </div>
      <div class="a11y-row">
        <div class="a11y-info">
          <div class="a11y-lbl">Screen reader support</div>
          <div class="a11y-desc">Adds descriptive labels and live announcements for VoiceOver / TalkBack</div>
        </div>
        <button type="button" class="a11y-toggle" class:active={!!a11y.screenreader} aria-pressed={!!a11y.screenreader} onclick={() => toggleA11y('screenreader')}></button>
      </div>
    </div>
  </div>
{/if}

<!-- Install modal -->
{#if showInstall}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="install-overlay centered" onclick={(e) => { if (e.target === e.currentTarget) showInstall = false; }}>
    <div class="install-box">
      <div style="text-align:center;margin-bottom:4px">
        <span style="font-size:var(--fs-3xl)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </span>
      </div>
      <h2>Add to Home Screen</h2>
      <p class="sub">Works on <strong>iPhone &amp; iPad</strong> — must use <strong>Safari</strong><br />Takes less than a minute!</p>

      <!-- Device tabs -->
      <div style="display:flex;gap:8px;margin-bottom:18px">
        <button
          type="button"
          class="tab-btn"
          class:tab-active={installTab === 'iphone'}
          onclick={() => installTab = 'iphone'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> iPhone
        </button>
        <button
          type="button"
          class="tab-btn"
          class:tab-active={installTab === 'ipad'}
          onclick={() => installTab = 'ipad'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> iPad
        </button>
      </div>

      <!-- Steps -->
      {#if installTab === 'iphone'}
        <div class="install-step">
          <div class="install-step-num">1</div>
          <div><p>Open this page in <strong>Safari</strong></p><small>⚠️ Must be Safari — Chrome or other browsers won't work</small></div>
        </div>
        <div class="install-step">
          <div class="install-step-num">2</div>
          <div><p>Tap the <strong>Share</strong> button at the <strong>bottom</strong> of Safari</p><small>It looks like a box with an arrow pointing up (⬆) in the toolbar</small></div>
        </div>
        <div class="install-step">
          <div class="install-step-num">3</div>
          <div><p>Scroll down the Share menu and tap <strong>"Add to Home Screen"</strong></p><small>It has a + icon next to it</small></div>
        </div>
        <div class="install-step">
          <div class="install-step-num">4</div>
          <div><p>Tap <strong>Add</strong> in the top-right corner</p><small>The name will say "My Math Roots" — leave it as is</small></div>
        </div>
        <div class="install-step" style="background:#eafaf1;border:2px solid #27ae60">
          <div class="install-step-num" style="background:#27ae60">✓</div>
          <div><p style="color:#1a7a4a">App icon now on your home screen!</p><small>Opens full screen, works offline, no Safari bar</small></div>
        </div>
      {:else}
        <div class="install-step">
          <div class="install-step-num">1</div>
          <div><p>Open this page in <strong>Safari</strong></p><small>⚠️ Must be Safari — Chrome or other browsers won't work</small></div>
        </div>
        <div class="install-step">
          <div class="install-step-num">2</div>
          <div><p>Tap the <strong>Share</strong> button at the <strong>top</strong> of Safari</p><small>It's in the toolbar — looks like a box with an arrow pointing up (⬆)</small></div>
        </div>
        <div class="install-step">
          <div class="install-step-num">3</div>
          <div><p>Tap <strong>"Add to Home Screen"</strong> from the menu</p><small>You may need to scroll down in the Share sheet to find it</small></div>
        </div>
        <div class="install-step">
          <div class="install-step-num">4</div>
          <div><p>Tap <strong>Add</strong> in the top-right corner</p><small>The name will say "My Math Roots" — leave it as is</small></div>
        </div>
        <div class="install-step" style="background:#eafaf1;border:2px solid #27ae60">
          <div class="install-step-num" style="background:#27ae60">✓</div>
          <div><p style="color:#1a7a4a">App icon now on your home screen!</p><small>Opens full screen, works offline, no Safari address bar</small></div>
        </div>
      {/if}

      <div style="background:#fff8e1;border:2px solid #f1c40f;border-radius:14px;padding:10px 14px;margin-top:14px;font-size:var(--fs-sm);color:#7d6608;line-height:1.6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
        <strong>Already installed but seeing an old version?</strong><br>
        Delete the app from your home screen, then clear Safari history &amp; website data in Settings → Safari, and reinstall.
      </div>

      <button type="button" class="install-close" onclick={() => showInstall = false}>✅ Got it!</button>
      <div style="text-align:center;margin-top:10px;font-size:var(--fs-xs);color:#7f8c8d">Tap outside this box to dismiss</div>
    </div>
  </div>
{/if}

<style>
  /* ── Screen background — keep .sc math-symbol tile (same as home) ── */
  /* .sett-sc intentionally has no background override; .sc in layout provides it */

  /* ── sc-in content wrapper ── */
  :global(.sett-sc .sc-in) {
    max-width: 680px;
    margin: 0 auto;
    padding: 20px 16px env(safe-area-inset-bottom);
  }

  /* ── Bar ── */
  :global(.bar) {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    padding: 12px 16px;
    padding-top: calc(12px + env(safe-area-inset-top));
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    box-shadow: 0 2px 18px rgba(0,0,0,.08), inset 0 -1px 0 rgba(255,255,255,0.2);
    position: sticky;
    top: 0;
    z-index: 20;
  }
  :global(.bar-back) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-md);
    padding: 8px 10px 8px 4px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: opacity .15s;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  :global(.bar-back::before) {
    content: '';
    display: inline-block;
    width: 10px; height: 10px;
    border-left: 2.5px solid currentColor;
    border-top: 2.5px solid currentColor;
    transform: rotate(-45deg);
    border-radius: 1px;
    flex-shrink: 0;
    margin-right: 1px;
  }
  :global(.bar-back:hover) { opacity: .6; }
  :global(.bar-title) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-xl);
    position: absolute;
    left: 50%; transform: translateX(-50%);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    max-width: 55%; text-align: center; pointer-events: none;
  }

  /* ── Settings sections ── */
  :global(.set-section) {
    background: rgba(255,255,255,.30);
    border-radius: var(--rad, 20px);
    overflow: hidden; margin-bottom: 16px;
    border-top: 1.5px solid rgba(255,255,255,.80);
    border-left: 1.5px solid rgba(255,255,255,.55);
    border-right: 1.5px solid rgba(255,255,255,.22);
    border-bottom: 1.5px solid rgba(255,255,255,.14);
    box-shadow: 0 8px 28px rgba(0,0,0,.10), inset 0 1.5px 0 rgba(255,255,255,.85);
  }
  :global(.set-sec-head) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-md); color: var(--txt);
    padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,.22);
    background: rgba(255,255,255,.12);
    display: flex; align-items: center; gap: 10px;
  }
  :global(.set-sec-ico) { font-size: var(--fs-lg); }
  :global(.set-body) {
    padding: 18px 20px; display: flex; flex-direction: column; gap: 14px;
    background: transparent;
  }
  :global(.set-row) { display: flex; flex-direction: column; gap: 6px; }
  :global(.set-lbl) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-sm); color: var(--txt); font-weight: 700;
  }
  :global(.set-lbl small) {
    font-weight: 600; font-family: 'Nunito', sans-serif; color: var(--txt3);
    margin-left: 6px; font-size: var(--fs-sm);
  }
  :global(.set-body p) { color: var(--txt3); font-weight: 600; line-height: 1.6; }
  :global(.set-inp) {
    font-family: 'Nunito', sans-serif; font-size: var(--fs-base); font-weight: 800;
    padding: 12px 16px; border: 1.5px solid rgba(255,255,255,.35); border-radius: 14px;
    outline: none; transition: border-color .2s, box-shadow .2s; color: var(--txt); width: 100%;
    background: rgba(255,255,255,.45);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 2px 8px rgba(0,0,0,.06);
  }
  :global(.set-inp:focus) {
    border-color: #4a90d9;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 0 0 3px rgba(74,144,217,.2);
  }

  /* ── Theme / sound toggle buttons ── */
  .theme-btn {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-md); padding: 14px 28px;
    border-radius: 50px; border: 3px solid var(--border2);
    cursor: pointer; background: var(--bg3); color: var(--txt);
    transition: all .2s;
    box-shadow: 0 3px 10px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,0.55);
    border-top: 1.5px solid rgba(255,255,255,0.7);
    flex: 1; min-width: 140px;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .theme-btn.active {
    border-color: #4a90d9; background: #4a90d9; color: #fff;
    box-shadow: 0 4px 14px rgba(74,144,217,.4), inset 0 1px 0 rgba(255,255,255,0.35);
    border-top: 1.5px solid rgba(255,255,255,0.55);
  }
  .theme-btn:hover:not(.active) { border-color: #4a90d9; }

  /* ── Set save (install button) ── */
  :global(.set-save) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-md); padding: 13px 32px;
    border-radius: 50px; border: none; cursor: pointer; color: #fff;
    display: inline-flex; align-items: center; gap: 8px;
    touch-action: manipulation; -webkit-tap-highlight-color: transparent;
    transition: transform .15s;
  }
  :global(.set-save:hover) { transform: translateY(-2px); }

  /* ── Auth buttons ── */
  .auth-action-btn {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-base); padding: 10px 22px;
    border-radius: 50px; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  }
  .sign-in-btn  { border: 2px solid #4a90d9; background: transparent; color: #4a90d9; }
  .sign-out-btn { border: 2px solid #e74c3c; background: transparent; color: #e74c3c; }

  /* ── Legal links ── */
  .legal-link {
    font-size: var(--fs-sm); color: #aaa; text-decoration: none;
    border-bottom: 1px solid #ddd; padding-bottom: 1px;
  }

  /* ── SVG icons ── */
  :global(.ico) { width: 1em; height: 1em; flex-shrink: 0; vertical-align: middle; }

  /* ── Accessibility modal overlay ── */
  .a11y-overlay {
    position: fixed; inset: 0; z-index: 9800;
    display: flex; align-items: center; justify-content: center;
    padding: max(20px, env(safe-area-inset-top)) 20px max(20px, env(safe-area-inset-bottom));
    background: rgba(0,0,0,.45);
    backdrop-filter: blur(2px);
  }
  .a11y-card {
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1.5px solid rgba(255,255,255,0.75);
    border-radius: 24px;
    padding: 24px 22px 20px;
    width: 100%; max-width: 420px;
    box-shadow: 0 8px 32px rgba(60,120,200,0.14), 0 2px 10px rgba(0,0,0,0.08);
    max-height: 90dvh; overflow-y: auto;
    animation: slideUp .25s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .modal-title {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-lg); color: var(--txt);
    display: flex; align-items: center; gap: 8px;
  }
  .modal-close-x {
    background: rgba(0,0,0,.07); border: none;
    width: 34px; height: 34px; border-radius: 50%;
    font-size: var(--fs-md); cursor: pointer;
    color: var(--txt2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* ── Accessibility toggles (mirrors src/styles.css) ── */
  :global(.a11y-row) {
    display: flex; align-items: center; gap: 12px; padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  :global(.a11y-row:last-child) { border-bottom: none; }
  :global(.a11y-info) { flex: 1; }
  :global(.a11y-lbl) {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-base); color: var(--txt); font-weight: 700;
  }
  :global(.a11y-desc) { font-size: var(--fs-sm); color: var(--txt2); margin-top: 2px; line-height: 1.4; }
  :global(.a11y-toggle) {
    flex-shrink: 0;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-sm); font-weight: 700;
    padding: 7px 18px; border-radius: 50px;
    border: 2px solid var(--border2);
    background: var(--bg3); color: var(--txt2);
    cursor: pointer; touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: background .15s, border-color .15s, color .15s;
    min-width: 56px; text-align: center;
  }
  :global(.a11y-toggle.active) { background: #27ae60; border-color: #1e8449; color: #fff; }
  :global(.a11y-toggle::before) { content: 'Off'; }
  :global(.a11y-toggle.active::before) { content: 'On'; }

  /* ── Install modal overlay — no dim background, box floats over screen ── */
  .install-overlay {
    position: fixed; inset: 0; z-index: 9800;
    display: flex; align-items: center; justify-content: center;
    padding: max(20px, env(safe-area-inset-top)) 20px max(20px, env(safe-area-inset-bottom));
  }
  .install-box {
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1.5px solid rgba(255,255,255,0.55);
    border-top: 1.5px solid rgba(255,255,255,0.55);
    border-radius: 28px;
    padding: 28px 24px 40px;
    max-width: 540px; width: 100%;
    max-height: min(88vh, 680px); overflow-y: auto; -webkit-overflow-scrolling: touch;
    box-shadow: 0 -8px 40px rgba(0,0,0,.2), inset 0 1.5px 0 rgba(255,255,255,0.6);
    animation: slideUp .25s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .install-box h2 {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-xl); text-align: center; margin-bottom: 6px; color: var(--txt);
  }
  .sub {
    text-align: center; color: var(--txt2); font-size: var(--fs-base); margin-bottom: 22px;
  }
  .install-step {
    display: flex; align-items: center; gap: 14px; padding: 13px 16px;
    background: var(--bg3); border-radius: 14px; margin-bottom: 10px;
  }
  .install-step-num {
    width: 36px; height: 36px; border-radius: 50%; background: #4a90d9; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-base); flex-shrink: 0;
  }
  .install-step p  { font-size: var(--fs-base); font-weight: 800; color: var(--txt); line-height: 1.4; }
  .install-step small { font-size: var(--fs-sm); color: var(--txt2); }
  .install-close {
    width: 100%; font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-md); padding: 15px; border-radius: 50px; border: none; cursor: pointer;
    background: linear-gradient(135deg,#4a90d9,#27ae60); color: #fff;
    box-shadow: 0 5px 0 rgba(0,0,0,.15); margin-top: 16px;
  }
  .tab-btn {
    flex: 1; font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-base); padding: 10px; border-radius: 12px;
    border: 2.5px solid var(--border2); background: transparent;
    color: var(--txt2); cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  }
  .tab-btn.tab-active {
    border-color: #4a90d9; background: #4a90d9; color: #fff;
  }
</style>
