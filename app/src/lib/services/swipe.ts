/**
 * Swipe-back gesture — iOS-style slide-out navigation.
 *
 * Ported from src/nav.js. Slide-out only (no peek of previous screen).
 * Uses the same physics constants as legacy.
 */

import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { cur } from '$lib/stores';

// ── Physics constants (from legacy src/nav.js) ──────────────────────────────
const COMMIT_V  = 0.4;   // px/ms velocity threshold for fast flick
const ANIM_MS   = 280;   // slide-out / snap-back animation duration
const DECIDE_PX = 8;     // min movement before deciding swipe vs scroll
const H_RATIO   = 0.8;   // dx must exceed dy * this to be treated as horizontal

/** Route → back destination. null means root (absorb gesture, no animation). */
function getBackTarget(path: string): string | null {
  if (path === '/' || path === '/login') return null; // root screens
  if (path === '/settings' || path === '/history' || path === '/dashboard') return '/';

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
  let targetEl: HTMLElement | null = null;
  let backDest: string | null = null;

  const W = () => window.innerWidth;

  function snapBack() {
    if (!targetEl) return;
    locked = true;
    targetEl.style.transition = `transform ${ANIM_MS}ms cubic-bezier(.25,.46,.45,.94)`;
    targetEl.style.transform = 'translateX(0px)';
    setTimeout(cleanup, ANIM_MS);
  }

  function cleanup() {
    document.body.classList.remove('swiping');
    if (targetEl) {
      targetEl.style.transition = '';
      targetEl.style.transform = '';
    }
    targetEl = null; backDest = null;
    intentDecided = false; swiping = false; absorbed = false; locked = false;
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

    // Find the .sc (screen container) element
    targetEl = document.querySelector('.sc') as HTMLElement | null;
    if (!targetEl) { backDest = null; return; }

    const t = e.touches[0];
    sx = t.clientX; sy = t.clientY; t0 = Date.now();
    intentDecided = false; swiping = false; absorbed = false;

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

    targetEl.style.transform = `translateX(${dx}px)`;
  }

  function onTouchEnd(e: TouchEvent) {
    if (absorbed) { cleanup(); return; }
    if (locked || !swiping || isModalOpen()) { cleanup(); return; }

    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const v = dx / (Date.now() - t0);
    const commit = dx >= W() * 0.5 || v >= COMMIT_V;

    if (commit && targetEl && backDest) {
      locked = true;
      const ease = `${ANIM_MS}ms cubic-bezier(.25,.46,.45,.94)`;
      targetEl.style.transition = `transform ${ease}`;
      targetEl.style.transform = `translateX(${W()}px)`;
      const dest = backDest;
      setTimeout(() => {
        goto(dest);
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
