<script lang="ts">
  /**
   * TutorialOverlay — first-launch 2-slide tutorial.
   * Ported from src/tour.js _startTutorial / _tutRender / tutNext / tutSkip.
   */

  import { TUT_SLIDES, isTutorialDone, markTutorialDone } from '$lib/services/tour';
  import { initialPullDone } from '$lib/stores';

  const { onDone, currentPath }: { onDone: () => void; currentPath: string } = $props();

  let idx = $state(0);
  let visible = $state(false);

  const slide = $derived(TUT_SLIDES[idx]);
  const isLast = $derived(idx === TUT_SLIDES.length - 1);

  // Swipe state for tutorial card
  let tx = 0;
  let dragging = false;

  // Only show the tutorial when the student reaches the home screen AND
  // the initial pull has completed (so cloud onboarding state is in localStorage).
  // Without this gate, re-adding the PWA clears localStorage and the tutorial
  // would fire before the cloud state is restored.
  $effect(() => {
    if (currentPath === '/' && $initialPullDone && !isTutorialDone() && !visible) {
      visible = true;
      document.body.classList.add('tut-active');
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
  });

  function next() {
    if (idx < TUT_SLIDES.length - 1) idx++;
    else skip();
  }

  function back() {
    if (idx > 0) idx--;
  }

  function skip() {
    markTutorialDone();
    visible = false;
    document.body.classList.remove('tut-active');
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    onDone();
  }

  function onCardTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    tx = e.touches[0].clientX;
    dragging = true;
  }

  function onCardTouchEnd(e: TouchEvent) {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next(); else back();
  }
</script>

{#if visible && slide}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="tut-overlay" id="tut-overlay">
    <div class="tut-card" id="tut-card"
         ontouchstart={onCardTouchStart}
         ontouchend={onCardTouchEnd}>
      <div class="tut-emoji" id="tut-emoji">{slide.emoji}</div>
      <div class="tut-title" id="tut-title">{slide.title}</div>
      <div class="tut-body" id="tut-body">{@html slide.body}</div>
      <div class="tut-dots" id="tut-dots">
        {#each TUT_SLIDES as _, i}
          <div class="tut-dot" class:active={i === idx}></div>
        {/each}
      </div>
      <div class="tut-btns">
        {#if !isLast}
          <button type="button" class="tut-skip-btn" onclick={skip}>Skip</button>
        {/if}
        <button type="button" class="tut-next-btn" onclick={next}>
          {isLast ? "Let's Go! 🚀" : 'Next →'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .tut-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .tut-card {
    background: rgba(255,255,255,0.14);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1.5px solid rgba(255,255,255,0.28);
    border-radius: 28px;
    padding: 28px 24px 22px;
    max-width: 340px;
    width: calc(100% - 48px);
    text-align: center;
    box-shadow: 0 24px 64px rgba(0,0,0,0.45), inset 0 1.5px 0 rgba(255,255,255,0.25);
    animation: tutPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes tutPop {
    from { transform: scale(0.85); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }

  .tut-emoji { font-size: 3rem; margin-bottom: 8px; }
  .tut-title {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 8px;
  }
  .tut-body {
    font-size: 0.92rem;
    color: rgba(255,255,255,0.88);
    line-height: 1.55;
    margin-bottom: 18px;
  }

  .tut-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 18px;
  }
  .tut-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: rgba(255,255,255,0.35);
    transition: all 0.2s;
  }
  .tut-dot.active {
    background: #fff;
    width: 22px;
    border-radius: 5px;
  }

  .tut-btns {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .tut-next-btn, .tut-skip-btn {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 1.05rem;
    border: none;
    border-radius: 50px;
    padding: 10px 28px;
    cursor: pointer;
    transition: transform 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .tut-next-btn {
    background: linear-gradient(135deg, #4a90d9, #357abd);
    color: #fff;
    box-shadow: 0 4px 0 rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.35);
  }
  .tut-skip-btn {
    background: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.8);
  }
  .tut-next-btn:active, .tut-skip-btn:active { transform: translateY(2px); }
</style>
