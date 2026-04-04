# Navigation Stack Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a DOM Snapshot Hybrid navigation stack so swipe-back gestures reveal the previous page (as a cached clone) instead of a blank screen.

**Architecture:** On forward navigation, clone the current `.sc` element and store it in a bounded stack (max 4). During swipe-back, insert the clone behind the active page with parallax animation. After SvelteKit renders the real page, restore scroll positions and remove the clone. SvelteKit's file-based routing stays intact.

**Tech Stack:** SvelteKit 5, Svelte 5 runes, TypeScript, CSS

**Spec:** `docs/superpowers/specs/2026-04-02-nav-stack-router-design.md`

---

### Task 1: Create the Navigation Stack Store

**Files:**
- Create: `app/src/lib/services/navStack.ts`

- [ ] **Step 1: Create `navStack.ts` with the store and snapshot logic**

```typescript
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
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
      el.scrollTop = scrollTop;
    } else {
      // Retry once after a frame (lazy-loaded content may not be ready)
      requestAnimationFrame(() => {
        const retry = document.querySelector(selector) as HTMLElement | null;
        if (retry) retry.scrollTop = scrollTop;
      });
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
```

- [ ] **Step 2: Verify the file compiles**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx vite build 2>&1 | tail -5
```
Expected: Build succeeds (file is not imported anywhere yet, but syntax must be valid).

- [ ] **Step 3: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/lib/services/navStack.ts
git commit -m "feat: add navigation stack store for DOM snapshot swipe-back"
```

---

### Task 2: Add CSS for Snapshot Peek

**Files:**
- Modify: `app/src/app.css` (lines 17–24, swipe peek section)

- [ ] **Step 1: Add `.swipe-peek-snapshot` class and update z-index comment**

In `app/src/app.css`, replace the existing swipe peek section:

```css
/* ── SWIPE PEEK BACKGROUND ── */
.swipe-peek-bg {
  position: fixed; inset: 0; z-index: 5;
  background: var(--bg, #f5f5f5);
  pointer-events: none;
}
body.dark .swipe-peek-bg { background: var(--bg, #1a1a2e); }
body.swiping .sc { position: relative; z-index: 10; }
```

With:

```css
/* ── SWIPE PEEK ── */
.swipe-peek-snapshot {
  position: fixed; inset: 0; z-index: 1;
  pointer-events: none;
  transform: translateX(-28%);
  opacity: 0.85;
  will-change: transform, opacity;
}
.swipe-peek-bg {
  position: fixed; inset: 0; z-index: 1;
  background: var(--bg, #f5f5f5);
  pointer-events: none;
}
body.dark .swipe-peek-bg { background: var(--bg, #1a1a2e); }
body.swiping .sc { position: relative; z-index: 10; }
```

- [ ] **Step 2: Verify build**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx vite build 2>&1 | tail -3
```
Expected: `✓ built in` ... `✔ done`

- [ ] **Step 3: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/app.css
git commit -m "style: add swipe-peek-snapshot CSS for nav stack peek"
```

---

### Task 3: Update Swipe Service to Use Snapshots

**Files:**
- Modify: `app/src/lib/services/swipe.ts` (full rewrite of peek logic)

- [ ] **Step 1: Replace the full swipe.ts file**

Replace the entire contents of `app/src/lib/services/swipe.ts` with:

```typescript
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
const DECIDE_PX = 8;     // min movement before deciding swipe vs scroll
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
    const v = dx / (Date.now() - t0);
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
        await goto(dest);
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
```

- [ ] **Step 2: Verify build**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx vite build 2>&1 | tail -3
```
Expected: `✓ built in` ... `✔ done`

- [ ] **Step 3: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/lib/services/swipe.ts
git commit -m "feat: swipe-back reveals cached snapshot with parallax peek"
```

---

### Task 4: Wire UnitCard Forward Navigation

**Files:**
- Modify: `app/src/lib/components/home/UnitCard.svelte` (onSelect callback)
- Modify: `app/src/routes/+page.svelte` (where onSelect is called)

UnitCard receives `onSelect` as a prop from the home page. The home page defines what happens on click. We need to find where `onSelect` triggers navigation and use `stackNavigate` there.

- [ ] **Step 1: Find and update the onSelect handler in +page.svelte**

In `app/src/routes/+page.svelte`, find the `goto` call for unit navigation. The UnitCard's `onSelect` callback should use `stackNavigate`. Search for where UnitCard is rendered and the callback is defined.

The UnitCard component is rendered in +page.svelte with an `onSelect` prop. Find the callback that calls `goto('/unit/...')` and replace it with `stackNavigate('/unit/...')`.

Add the import at the top of the `<script>` block:
```typescript
import { stackNavigate } from '$lib/services/navStack';
```

Replace every `goto(`/unit/${...}`)` in the onSelect callback with `stackNavigate(`/unit/${...}`)`.

- [ ] **Step 2: Verify build**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx vite build 2>&1 | tail -3
```
Expected: `✓ built in` ... `✔ done`

- [ ] **Step 3: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/routes/+page.svelte
git commit -m "feat: home→unit navigation uses stackNavigate for snapshot cache"
```

---

### Task 5: Wire Unit Page Navigation (Forward + Back)

**Files:**
- Modify: `app/src/routes/unit/[id]/+page.svelte`

- [ ] **Step 1: Add imports**

Add to the top of the `<script>` block in `app/src/routes/unit/[id]/+page.svelte`:

```typescript
import { stackNavigate, stackBack } from '$lib/services/navStack';
```

- [ ] **Step 2: Update back buttons to use `stackBack`**

Replace the back button `goto('/')` calls:

**Line 92** (not-found back button):
```
onclick={() => goto('/')
```
→
```
onclick={() => stackBack('/')
```

**Line 99** (header back button):
```
onclick={() => goto('/')}
```
→
```
onclick={() => stackBack('/')}
```

- [ ] **Step 3: Update forward navigation to lessons to use `stackNavigate`**

**Line 146** (lesson card click):
```
onclick={() => goto(`/lesson/${lesson.id}`)}
```
→
```
onclick={() => stackNavigate(`/lesson/${lesson.id}`)}
```

**Line 147** (lesson card keyboard):
```
onkeydown={(e) => e.key === 'Enter' && goto(`/lesson/${lesson.id}`)}
```
→
```
onkeydown={(e) => e.key === 'Enter' && stackNavigate(`/lesson/${lesson.id}`)}
```

**Line 220** (next unit button):
```
onclick={() => goto(`/unit/${nextUnit.id}`)}
```
→
```
onclick={() => stackNavigate(`/unit/${nextUnit.id}`)}
```

**Line 272** (locked lesson sheet CTA — navigates to a lesson):
```
onclick={() => { closeLockedSheet(); goto(`/lesson/${s.prevId}`); }}
```
→
```
onclick={() => { closeLockedSheet(); stackNavigate(`/lesson/${s.prevId}`); }}
```

- [ ] **Step 4: Leave quiz navigations unchanged**

Lines 197, 204, 211, 229 navigate to `/quiz/...` — these stay as `goto()` because quiz routes block swipe-back and don't participate in the stack.

- [ ] **Step 5: Verify build**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx vite build 2>&1 | tail -3
```
Expected: `✓ built in` ... `✔ done`

- [ ] **Step 6: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/routes/unit/\[id\]/+page.svelte
git commit -m "feat: unit page uses stackNavigate/stackBack for nav stack"
```

---

### Task 6: Wire Lesson Page Back Button

**Files:**
- Modify: `app/src/routes/lesson/[id]/+page.svelte`

- [ ] **Step 1: Add import**

Add to the top of the `<script>` block:

```typescript
import { stackBack } from '$lib/services/navStack';
```

- [ ] **Step 2: Update `goBack` function**

**Line 117:**
```typescript
function goBack() { goto(`/unit/${unitId}`); }
```
→
```typescript
function goBack() { stackBack(`/unit/${unitId}`); }
```

- [ ] **Step 3: Leave other navigations unchanged**

`startQuiz()` (line 118) navigates to `/quiz/...` — stays as `goto()`.
`goNextLesson()` (lines 119–122) navigates forward to a lesson or back to unit. For `goNextLesson`, the lesson-to-lesson navigation is lateral (not truly back), so it stays as `goto()` — the stack doesn't need to cache the current lesson when moving to the next one.

- [ ] **Step 4: Verify build**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx vite build 2>&1 | tail -3
```
Expected: `✓ built in` ... `✔ done`

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/routes/lesson/\[id\]/+page.svelte
git commit -m "feat: lesson back button uses stackBack for nav stack sync"
```

---

### Task 7: Wire Root Layout (Settings Cog + Popstate Listener)

**Files:**
- Modify: `app/src/routes/+layout.svelte`

- [ ] **Step 1: Add imports**

Add near the existing imports in the `<script>` block:

```typescript
import { navStack, stackNavigate } from '$lib/services/navStack';
```

- [ ] **Step 2: Update settings cog to use `stackNavigate`**

**Line 187:**
```svelte
<button type="button" class="cog-btn" aria-label="Settings" onclick={() => goto('/settings')}>
```
→
```svelte
<button type="button" class="cog-btn" aria-label="Settings" onclick={() => stackNavigate('/settings')}>
```

- [ ] **Step 3: Add popstate listener in onMount**

Inside the `onMount` callback, after the `cleanupSwipe` line (line 81), add:

```typescript
    // Keep nav stack in sync when browser back/forward buttons are used
    function onPopState() {
      navStack.pop();
    }
    window.addEventListener('popstate', onPopState);
```

Update the cleanup return (line 124) from:
```typescript
    return () => { subscription.unsubscribe(); cleanupSwipe(); };
```
to:
```typescript
    return () => { subscription.unsubscribe(); cleanupSwipe(); window.removeEventListener('popstate', onPopState); };
```

- [ ] **Step 4: Add navStack.clear() to auth redirects**

On **line 116** (SIGNED_IN event navigates to dashboard), add a clear before goto:

```typescript
        if (event === 'SIGNED_IN') {
          guestMode.set(false);
          const { profiles } = await getStudentProfiles();
          familyProfiles.set(profiles);
          navStack.clear();
          goto('/dashboard');
        }
```

On **line 138** (auth guard redirect to login), add a clear before goto:

```typescript
    if (!$authUser && !$activeStudentId && !isPublic) {
      navStack.clear();
      goto('/login', { replaceState: true });
    }
```

- [ ] **Step 5: Verify build**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx vite build 2>&1 | tail -3
```
Expected: `✓ built in` ... `✔ done`

- [ ] **Step 6: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/routes/+layout.svelte
git commit -m "feat: settings cog uses stackNavigate; add popstate + auth stack clear"
```

---

### Task 8: Clear Stack on Login and Dashboard

**Files:**
- Modify: `app/src/routes/login/+page.svelte`
- Modify: `app/src/routes/dashboard/+layout.svelte`

- [ ] **Step 1: Add import and clear on login page**

In `app/src/routes/login/+page.svelte`, add import:

```typescript
import { navStack } from '$lib/services/navStack';
```

Add `navStack.clear()` before the two `goto('/')` calls in login success paths:

**Line 103–105** (guest mode):
```typescript
    showSoftGate = false;
    guestMode.set(true);
    navStack.clear();
    goto('/');
```

**Line 201–205** (student PIN success):
```typescript
    if (success) {
      localStorage.setItem('mmr_last_student_id', selectedStudentId);
      guestMode.set(false);
      activeStudentId.set(selectedStudentId);
      navStack.clear();
      goto('/', { replaceState: true });
    }
```

**Line 271** (parent login to dashboard):
```typescript
      else { navStack.clear(); goto('/dashboard'); }
```

- [ ] **Step 2: Add import and clear on dashboard layout**

In `app/src/routes/dashboard/+layout.svelte`, add import:

```typescript
import { navStack } from '$lib/services/navStack';
```

Add `navStack.clear()` in the `signOut` function before navigation:

```typescript
  async function signOut() {
    await authSignOut();
    authUser.set(null);
    navStack.clear();
    goto('/login', { replaceState: true });
  }
```

Also add an `onMount` to clear the stack when dashboard loads (in case user navigated here directly):

```typescript
import { onMount } from 'svelte';

onMount(() => {
  navStack.clear();
});
```

- [ ] **Step 3: Verify build**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx vite build 2>&1 | tail -3
```
Expected: `✓ built in` ... `✔ done`

- [ ] **Step 4: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/routes/login/+page.svelte app/src/routes/dashboard/+layout.svelte
git commit -m "feat: clear nav stack on login success and dashboard mount"
```

---

### Task 9: Integration Test — Full Build and Verify

- [ ] **Step 1: Full production build**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx vite build 2>&1
```
Expected: Build completes with `✔ done`, no errors.

- [ ] **Step 2: Verify no TypeScript errors**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx svelte-check 2>&1 | tail -20
```
Expected: No errors (warnings are acceptable).

- [ ] **Step 3: Verify dev server starts**

Run:
```bash
cd "E:\Cameron Jones\my-math-roots\app" && npx vite dev --port 5173 &
sleep 3
curl -s http://localhost:5173 | head -5
```
Expected: HTML response from dev server.

- [ ] **Step 4: Final commit if any files changed during verification**

```bash
cd "E:\Cameron Jones\my-math-roots"
git status
# If any fix-up changes: git add + git commit -m "fix: nav stack integration fixes"
```
