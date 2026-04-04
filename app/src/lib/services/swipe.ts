/**
 * Swipe-back gesture — iOS-style slide-out navigation.
 *
 * Ported from src/nav.js. During swipe, reveals a cached DOM snapshot
 * of the previous page with parallax animation. Falls back to a
 * background div if no snapshot exists.
 *
 * Uses the same physics constants as legacy.
 */

import { goto } from '$app/navigation';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { cur } from '$lib/stores';
import { navStack, restoreScroll } from '$lib/services/navStack';
import type { StackEntry } from '$lib/services/navStack';

// ── Physics constants (from legacy src/nav.js) ──────────────────────────────
const COMMIT_V  = 0.4;   // px/ms velocity threshold for fast flick
const ANIM_MS   = 280;   // slide-out / snap-back animation duration
const DECIDE_PX = 5;     // min movement before deciding swipe vs scroll
const H_RATIO   = 0.8;   // dx must exceed dy * this to be treated as horizontal

/** Route → back destination. null means root (absorb gesture, no animation). */
function getBackTarget(path: string): string | null {
  if (path === '/' || path === '/login' || path === '/dashboard') return null; // root screens — no swipe-back
  if (path === '/settings' || path === '/history') return '/';

  // /unit/u1 → /
  if (path.startsWith('/unit/')) return '/';

  // /lesson/u1l1 → /unit/u1
  const lessonMatch = path.match(/^\/lesson\/(u\d+)/);
  if (lessonMatch) return `/unit/${lessonMatch[1]}`;

  // /quiz/* → don't allow swipe-back (quiz in progress)
  if (path.startsWith('/quiz/')) return null;

  // /select → null (no back from profile picker)
  if (path === '/select') return null;

  return '/'; // fallback
}

function isModalOpen(): boolean {
  return !!document.querySelector(
    '.modal-overlay, .restart-modal-box, .scratch-box, .sc-lightbox.open, .install-overlay'
  );
}

/**
 * Mount swipe-back gesture handlers on the document.
 * Returns a cleanup function to remove listeners.
 */
export function mountSwipeBack(): () => void {
  let sx = 0, sy = 0, t0 = 0;
  let intentDecided = false, swiping = false, absorbed = false, locked = false;
  let inScrollable = false;
  let targetEl: HTMLElement | null = null;
  let backDest: string | null = null;
  let peekEl: HTMLElement | null = null;
  let peekEntry: StackEntry | undefined = undefined;
  let fallbackPeek = false;

  const W = () => window.innerWidth;

  /** Insert the snapshot peek or fallback background behind the active page. */
  function showPeek() {
    if (peekEl) return;

    peekEntry = navStack.peek();
    if (peekEntry) {
      // Use the cached DOM snapshot
      peekEl = peekEntry.snapshot.cloneNode(true) as HTMLElement;
      peekEl.className = (peekEl.className || '') + ' swipe-peek-snapshot';
      // Restore scroll positions on the clone so it looks right
      for (const [selector, scrollTop] of peekEntry.scrollMap) {
        if (selector === '__window') continue; // handled below
        const el = peekEl.querySelector(selector) as HTMLElement | null;
        if (el) el.scrollTop = scrollTop;
      }
      fallbackPeek = false;
    } else {
      // No snapshot — use fallback background div
      peekEl = document.createElement('div');
      peekEl.className = 'swipe-peek-bg';
      fallbackPeek = true;
    }

    document.body.appendChild(peekEl);

    // Restore window-level scroll on the snapshot (overflow-y:auto in CSS)
    if (peekEl && peekEntry && !fallbackPeek) {
      const winScroll = peekEntry.scrollMap.get('__window');
      if (winScroll) {
        requestAnimationFrame(() => { if (peekEl) peekEl.scrollTop = winScroll; });
      }
    }
  }

  function hidePeek() {
    if (peekEl) { peekEl.remove(); peekEl = null; }
    peekEntry = undefined;
    fallbackPeek = false;
  }

  function snapBack() {
    if (!targetEl) return;
    locked = true;
    targetEl.style.transition = `transform ${ANIM_MS}ms cubic-bezier(.25,.46,.45,.94)`;
    targetEl.style.transform = 'translateX(0px)';

    // Animate peek back to -28% and fade out
    if (peekEl && !fallbackPeek) {
      peekEl.style.transition = `transform ${ANIM_MS}ms cubic-bezier(.25,.46,.45,.94), opacity ${ANIM_MS}ms ease`;
      peekEl.style.transform = 'translateX(-28%)';
      peekEl.style.opacity = '0.85';
    }

    setTimeout(cleanup, ANIM_MS);
  }

  function cleanup() {
    document.body.classList.remove('swiping');
    if (targetEl) {
      targetEl.style.transition = '';
      targetEl.style.transform = '';
    }
    hidePeek();
    targetEl = null; backDest = null;
    intentDecided = false; swiping = false; absorbed = false; locked = false;
    inScrollable = false;
  }

  function onTouchStart(e: TouchEvent) {
    if ((e.target as HTMLElement)?.closest?.('[data-no-swipe]')) return;
    if ((e.target as HTMLInputElement)?.type === 'range') return;
    if (locked || isModalOpen()) return;

    // Block during active quiz
    if (get(cur).quiz) return;

    // Block during spotlight tour
    if (document.body.classList.contains('spot-scroll-lock')) return;

    const path = window.location.pathname;
    backDest = getBackTarget(path);

    // Find the .sc (screen container) or .dash-shell element
    targetEl = (document.querySelector('.sc') ?? document.querySelector('.dash-shell')) as HTMLElement | null;
    if (!targetEl) { backDest = null; return; }

    const t = e.touches[0];
    sx = t.clientX; sy = t.clientY; t0 = Date.now();
    intentDecided = false; swiping = false; absorbed = false;
    inScrollable = !!(e.target as HTMLElement)?.closest?.(
      '.carousel-wrap, .sc-scroll-box, .lesson-glass-wrap'
    );

    // Prevent iOS native back gesture on left edge
    if (t.clientX < 30) e.preventDefault();
  }

  function onTouchMove(e: TouchEvent) {
    if (locked || !targetEl || isModalOpen() || document.body.classList.contains('spot-scroll-lock')) {
      if (swiping) snapBack();
      targetEl = null;
      return;
    }

    const t = e.touches[0];
    const dx = t.clientX - sx;
    const dy = Math.abs(t.clientY - sy);

    // Phase 1: decide intent
    if (!intentDecided) {
      // Fast bail-out: touch started inside a scrollable container and
      // movement is clearly vertical — skip the DECIDE_PX deadzone
      if (inScrollable && dy > 3 && dy > dx) {
        intentDecided = true;
        swiping = false;
        targetEl = null; backDest = null;
        return;
      }
      // Root screens: absorb horizontal movement immediately (no deadzone)
      // to prevent native back gesture from starting
      if (backDest === null && dx > 0) {
        intentDecided = true;
        absorbed = true;
        e.preventDefault();
        return;
      }
      if (Math.max(dx, dy) < DECIDE_PX) return;
      if (dx > 0 && dx >= dy * H_RATIO) {
        intentDecided = true;
        if (backDest === null) {
          // Root screen — absorb gesture
          absorbed = true;
        } else {
          swiping = true;
          document.body.classList.add('swiping');
          targetEl.style.transition = 'none';
          showPeek();
        }
      } else {
        // Vertical scroll — bail
        intentDecided = true;
        swiping = false;
        targetEl = null; backDest = null;
        return;
      }
    }

    if (absorbed) { e.preventDefault(); return; }
    if (!swiping) return;

    e.preventDefault();
    if (dx <= 0) { snapBack(); return; }

    // Move active page with finger
    targetEl.style.transform = `translateX(${dx}px)`;

    // Parallax the peek from -28% toward 0%
    if (peekEl && !fallbackPeek) {
      const progress = Math.min(dx / W(), 1);
      const peekX = -28 + (28 * progress);
      const peekOpacity = 0.85 + (0.15 * progress);
      peekEl.style.transition = 'none';
      peekEl.style.transform = `translateX(${peekX}%)`;
      peekEl.style.opacity = String(peekOpacity);
    }
  }

  function onTouchEnd(e: TouchEvent) {
    if (absorbed) { cleanup(); return; }
    if (locked || !swiping || isModalOpen()) { cleanup(); return; }

    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const dt = Math.max(Date.now() - t0, 1); // guard against zero-duration touch
    const v = dx / dt;
    const commit = dx >= W() * 0.5 || v >= COMMIT_V;

    if (commit && targetEl && backDest) {
      locked = true;
      const ease = `${ANIM_MS}ms cubic-bezier(.25,.46,.45,.94)`;

      // Slide active page off-screen
      targetEl.style.transition = `transform ${ease}`;
      targetEl.style.transform = `translateX(${W()}px)`;

      // Slide peek to final position
      if (peekEl && !fallbackPeek) {
        peekEl.style.transition = `transform ${ease}, opacity ${ease}`;
        peekEl.style.transform = 'translateX(0%)';
        peekEl.style.opacity = '1';
      }

      const dest = backDest;
      // Keep peek visible through navigation
      const _peek = peekEl;
      const _entry = navStack.pop();
      peekEl = null; // prevent cleanup() from removing it early

      setTimeout(async () => {
        await goto(dest, { noScroll: true });
        await tick();
        // Restore scroll positions on the real page
        if (_entry) restoreScroll(_entry);
        // Remove the snapshot peek now that the real page is rendered
        if (_peek) _peek.remove();
        cleanup();
      }, ANIM_MS);
    } else {
      snapBack();
    }
  }

  function onTouchCancel() {
    if (swiping) snapBack(); else cleanup();
  }

  document.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
  document.addEventListener('touchcancel', onTouchCancel);

  return () => {
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('touchcancel', onTouchCancel);
  };
}
