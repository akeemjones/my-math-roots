<script lang="ts">
  /**
   * InstallModal — shared "How to Install" popup.
   *
   * Used in two places:
   *  1. First-time onboarding flow (layout.svelte) — shown before tutorial if install_seen not set.
   *     Calls onClose which then fires the tutorial.
   *  2. Settings page — "How to Install" button opens it directly.
   *
   * Persists the install_seen flag to both localStorage AND a cookie so it
   * survives PWA reinstalls on the same device.
   */

  import { browser } from '$app/environment';
  import { markInstallSeen } from '$lib/ui/services/tour';

  const { onClose }: { onClose: () => void } = $props();

  // Auto-detect device on mount
  let installTab = $state<'iphone' | 'ipad'>('iphone');

  $effect(() => {
    if (!browser) return;
    const isIPad =
      /iPad/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    installTab = isIPad ? 'ipad' : 'iphone';
  });

  function close() {
    markInstallSeen();
    onClose();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="install-overlay" onclick={(e) => { if (e.target === e.currentTarget) close(); }}>
  <div class="install-box">
    <div style="text-align:center;margin-bottom:4px">
      <span style="font-size:2.2rem">📲</span>
    </div>
    <h2>Add to Home Screen</h2>
    <p class="sub">Works on <strong>iPhone &amp; iPad</strong> — must use <strong>Safari</strong><br />Takes less than a minute!</p>

    <!-- Device tabs -->
    <div style="display:flex;gap:8px;margin-bottom:18px">
      <button
        type="button"
        id="tab-iphone"
        class="tab-btn"
        class:tab-active={installTab === 'iphone'}
        onclick={() => installTab = 'iphone'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> iPhone
      </button>
      <button
        type="button"
        id="tab-ipad"
        class="tab-btn"
        class:tab-active={installTab === 'ipad'}
        onclick={() => installTab = 'ipad'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> iPad
      </button>
    </div>

    <!-- iPhone steps -->
    {#if installTab === 'iphone'}
      <div id="install-iphone">
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
      </div>
    {:else}
      <!-- iPad steps -->
      <div id="install-ipad">
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
      </div>
    {/if}

    <div style="background:#fff8e1;border:2px solid #f1c40f;border-radius:14px;padding:10px 14px;margin-top:14px;font-size:0.85rem;color:#7d6608;line-height:1.6">
      💡 <strong>Already installed but seeing an old version?</strong><br>
      Delete the app from your home screen, then clear Safari history &amp; website data in Settings → Safari, and reinstall.
    </div>

    <button type="button" class="install-close" onclick={close}>✅ Got it!</button>
    <div style="text-align:center;margin-top:10px;font-size:0.75rem;color:#7f8c8d">Tap outside this box to dismiss</div>
  </div>
</div>

<style>
  .install-overlay {
    position: fixed; inset: 0; z-index: 9800;
    display: flex; align-items: center; justify-content: center;
    padding: max(20px, env(safe-area-inset-top)) 20px max(20px, env(safe-area-inset-bottom));
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .install-box {
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1.5px solid rgba(255,255,255,0.55);
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
    font-size: 1.5rem; text-align: center; margin-bottom: 6px; color: var(--txt, #1a2535);
  }
  .sub {
    text-align: center; color: var(--txt2, #5a7080); font-size: 0.95rem; margin-bottom: 22px;
  }
  .install-step {
    display: flex; align-items: center; gap: 14px; padding: 13px 16px;
    background: var(--bg3, rgba(255,255,255,0.18)); border-radius: 14px; margin-bottom: 10px;
  }
  .install-step-num {
    width: 36px; height: 36px; border-radius: 50%; background: #4a90d9; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 1rem; flex-shrink: 0;
  }
  .install-step p { font-size: 0.95rem; font-weight: 800; color: var(--txt, #1a2535); line-height: 1.4; margin: 0 0 2px; }
  .install-step small { font-size: 0.82rem; color: var(--txt2, #5a7080); }
  .install-close {
    width: 100%; font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 1.1rem; padding: 15px; border-radius: 50px; border: none; cursor: pointer;
    background: linear-gradient(135deg,#4a90d9,#27ae60); color: #fff;
    box-shadow: 0 5px 0 rgba(0,0,0,.15); margin-top: 16px;
  }
  .tab-btn {
    flex: 1; font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 0.95rem; padding: 10px; border-radius: 12px;
    border: 2.5px solid rgba(0,0,0,0.12); background: transparent;
    color: var(--txt2, #5a7080); cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  }
  .tab-btn.tab-active {
    border-color: #4a90d9; background: #4a90d9; color: #fff;
  }
</style>
