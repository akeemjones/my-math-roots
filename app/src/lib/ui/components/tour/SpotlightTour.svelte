<script lang="ts">
  /**
   * SpotlightTour — SVG mask-based spotlight overlay with positioned card.
   * Ported from src/tour.js SPOT_TOURS / _spotShowStep / _spotRender / _spotAdvance.
   */

  import { page } from '$app/stores';
  import {
    isScreenTourDone,
    markScreenTourDone,
    getScreenTourSteps,
    findTourElement,
    isTutorialDone,
    type SpotStep,
  } from '$lib/ui/services/tour';

  let active     = $state(false);
  let stepIdx    = $state(0);
  let currentPath = $state('');

  // Spotlight hole coords
  let hx = $state(0), hy = $state(0), hw = $state(0), hh = $state(0);
  // Card position
  let cardTop = $state(0), cardLeft = $state(0), cardW = $state(280);
  // Viewport
  let vw = $state(0), vh = $state(0);

  let steps: SpotStep[] = [];
  const step = $derived(steps[stepIdx] ?? null);
  const isLast = $derived(stepIdx >= steps.length - 1);
  const countLabel = $derived(`${stepIdx + 1} / ${steps.length}`);

  // Watch route changes
  $effect(() => {
    const path = $page.url.pathname;
    if (path !== currentPath) {
      currentPath = path;
      // Delay to let the page render before measuring elements
      setTimeout(() => checkScreen(path), 600);
    }
  });

  function checkScreen(path: string) {
    if (active) return;
    if (!isTutorialDone()) return;
    if (isScreenTourDone(path)) return;

    const tourSteps = getScreenTourSteps(path);
    if (!tourSteps.length) return;

    steps = tourSteps;
    stepIdx = 0;
    document.body.classList.add('spot-scroll-lock');
    showStep();
  }

  function showStep() {
    if (stepIdx >= steps.length) { done(); return; }

    const s = steps[stepIdx];
    const el = findTourElement(s.sel);
    if (!el) { stepIdx++; showStep(); return; }

    const rect = el.getBoundingClientRect();

    // Scroll into view if off-screen
    const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
    if (!inView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          active = true;
          render(el.getBoundingClientRect());
        }));
      }, 480);
      return;
    }

    active = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      render(el.getBoundingClientRect());
    }));
  }

  function render(rect: DOMRect) {
    vw = window.innerWidth;
    vh = window.innerHeight;

    const pad = 10;
    hx = Math.max(0, rect.left - pad);
    hy = Math.max(0, rect.top - pad);
    hw = Math.min(vw, rect.width + pad * 2);
    hh = Math.min(vh, rect.height + pad * 2);

    // Card positioning
    cardW = Math.min(280, vw - 40);
    cardLeft = Math.max(20, Math.min((vw - cardW) / 2, vw - cardW - 20));

    const cy = rect.top + rect.height / 2;
    const cardH = 210;
    const gap = 16;

    if (cy < vh * 0.55) {
      cardTop = hy + hh + gap;
    } else {
      cardTop = hy - cardH - gap;
    }
    cardTop = Math.max(12, Math.min(cardTop, vh - cardH - 16));
  }

  function advance() {
    if (!active) return;
    stepIdx++;
    if (stepIdx >= steps.length) {
      done();
    } else {
      active = false;
      setTimeout(() => showStep(), 160);
    }
  }

  function done() {
    active = false;
    document.body.classList.remove('spot-scroll-lock');
    markScreenTourDone(currentPath);
  }
</script>

{#if active && step}
  <!-- SVG spotlight mask -->
  <svg class="spot-svg"
       viewBox="0 0 {vw} {vh}"
       width={vw} height={vh}
       style="position:fixed;inset:0;z-index:9998;pointer-events:none">
    <defs>
      <mask id="spot-mask">
        <rect width={vw} height={vh} fill="white"/>
        <rect x={hx} y={hy} width={hw} height={hh} rx="16" fill="black"
              style="transition:all 0.35s cubic-bezier(0.4,0,0.2,1)"/>
      </mask>
    </defs>
    <!-- Dim overlay with hole cut out -->
    <rect width={vw} height={vh} fill="rgba(0,0,0,0.65)"
          mask="url(#spot-mask)" pointer-events="all"
          role="presentation"/>
    <!-- Glowing ring around hole -->
    <rect x={hx - 3} y={hy - 3} width={hw + 6} height={hh + 6}
          rx="19" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"
          style="transition:all 0.35s cubic-bezier(0.4,0,0.2,1)"/>
  </svg>

  <!-- Info card -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="spot-card"
       style="top:{cardTop}px;left:{cardLeft}px;width:{cardW}px"
       onclick={advance}>
    <div class="spot-emoji">{step.emoji}</div>
    <div class="spot-title">{step.title}</div>
    <div class="spot-tip">{step.tip}</div>
    <div class="spot-footer">
      <span class="spot-count">{countLabel}</span>
      <button type="button" class="spot-next-btn" onclick={advance}>
        {isLast ? '✓ Got it!' : 'Next →'}
      </button>
    </div>
  </div>
{/if}

<style>
  .spot-card {
    position: fixed;
    z-index: 9999;
    background: rgba(255,255,255,0.14);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1.5px solid rgba(255,255,255,0.28);
    border-radius: 20px;
    padding: 18px 18px 14px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2);
    animation: spotPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    transition: top 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes spotPop {
    from { transform: scale(0.9); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  .spot-emoji { font-size: 1.8rem; margin-bottom: 4px; }
  .spot-title {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 1.15rem;
    color: #fff;
    margin-bottom: 6px;
  }
  .spot-tip {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.85);
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .spot-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .spot-count {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.55);
    font-weight: 600;
  }
  .spot-next-btn {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 0.95rem;
    background: linear-gradient(135deg, #4a90d9, #357abd);
    color: #fff;
    border: none;
    border-radius: 50px;
    padding: 8px 22px;
    cursor: pointer;
    box-shadow: 0 3px 0 rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3);
    transition: transform 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .spot-next-btn:active { transform: translateY(2px); }
</style>
