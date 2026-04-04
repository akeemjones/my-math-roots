/**
 * navStack — DOM Snapshot navigation stack.
 *
 * Caches cloneNode snapshots of .sc elements on forward navigation.
 * The swipe service reveals these snapshots as peek backgrounds during
 * swipe-back gestures. SvelteKit routing stays intact.
 *
 * Max depth: 4 (home + unit + lesson + settings).
 * Home (/) is the stack floor — never evicted.
 */

import { writable, derived, get } from 'svelte/store';
import { goto } from '$app/navigation';

// ── Types ────────────────────────────────────────────────────────────────────

export interface StackEntry {
  path: string;
  snapshot: HTMLElement;
  scrollMap: Map<string, number>;
  key: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_DEPTH = 4;
const SCROLL_SELECTORS = ['.sc-in', '.carousel-wrap', '.sc-scroll-box'];

// ── Store ────────────────────────────────────────────────────────────────────

const _stack = writable<StackEntry[]>([]);

export const navStack = {
  subscribe: _stack.subscribe,

  /** Snapshot the current .sc and push onto the stack. */
  push(path: string): void {
    const sc = document.querySelector('.sc') as HTMLElement | null;
    if (!sc) return;

    // Record scroll positions
    const scrollMap = new Map<string, number>();
    // Save document/window scroll position
    const winScroll = window.scrollY || document.documentElement.scrollTop || 0;
    if (winScroll > 0) scrollMap.set('__window', winScroll);
    for (const sel of SCROLL_SELECTORS) {
      const el = sc.querySelector(sel) as HTMLElement | null;
      if (el && el.scrollTop > 0) {
        scrollMap.set(sel, el.scrollTop);
      }
    }

    // Clone the DOM tree
    const snapshot = sc.cloneNode(true) as HTMLElement;

    const entry: StackEntry = {
      path,
      snapshot,
      scrollMap,
      key: crypto.randomUUID(),
    };

    _stack.update((stack) => {
      const next = [...stack, entry];
      // Enforce max depth — evict oldest non-home entries
      while (next.length > MAX_DEPTH) {
        // Never evict the floor (index 0 if it's home)
        const evictIdx = next[0]?.path === '/' ? 1 : 0;
        next.splice(evictIdx, 1);
      }
      return next;
    });
  },

  /** Remove and return the top entry (for scroll restore after navigation). */
  pop(): StackEntry | undefined {
    let entry: StackEntry | undefined;
    _stack.update((stack) => {
      if (stack.length === 0) return stack;
      const next = [...stack];
      entry = next.pop();
      return next;
    });
    return entry;
  },

  /** Return the top entry without removing (for swipe peek preview). */
  peek(): StackEntry | undefined {
    const stack = get(_stack);
    return stack.length > 0 ? stack[stack.length - 1] : undefined;
  },

  /** Clear the entire stack. */
  clear(): void {
    _stack.set([]);
  },
};

export const navStackSize = derived(_stack, ($s) => $s.length);

// ── Scroll Restore Helper ────────────────────────────────────────────────────

/**
 * Restore scroll positions from a popped StackEntry onto the live DOM.
 * Call after goto() + tick() so the real page is rendered.
 */
export function restoreScroll(entry: StackEntry): void {
  for (const [selector, scrollTop] of entry.scrollMap) {
    if (selector === '__window') {
      window.scrollTo(0, scrollTop);
      continue;
    }
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
      el.scrollTop = scrollTop;
    } else {
      // Retry up to 5 times (50ms apart) for lazy-loaded content
      let attempts = 0;
      const tryRestore = () => {
        const retry = document.querySelector(selector) as HTMLElement | null;
        if (retry) { retry.scrollTop = scrollTop; }
        else if (++attempts < 5) { setTimeout(tryRestore, 50); }
      };
      requestAnimationFrame(tryRestore);
    }
  }
}

// ── Navigation Helper ────────────────────────────────────────────────────────

/**
 * Snapshot the current page and navigate forward.
 * Use this instead of goto() for stackable forward navigations.
 */
export async function stackNavigate(dest: string): Promise<void> {
  const currentPath = window.location.pathname;

  // Clear stack when navigating to non-learning routes
  if (dest === '/login' || dest === '/dashboard') {
    navStack.clear();
    return goto(dest);
  }

  // Tapping home (not swiping back) clears stack above home
  if (dest === '/' && currentPath !== '/settings') {
    navStack.clear();
    return goto(dest);
  }

  navStack.push(currentPath);
  return goto(dest);
}

/**
 * Pop the stack and navigate back (for in-app back buttons).
 * Discards the snapshot — the real page will render via goto().
 */
export async function stackBack(dest: string): Promise<void> {
  navStack.pop();
  return goto(dest);
}
