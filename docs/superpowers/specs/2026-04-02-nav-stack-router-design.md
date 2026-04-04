# Navigation Stack Router — DOM Snapshot Hybrid

**Date:** 2026-04-02
**Status:** Approved
**Approach:** DOM Snapshot Hybrid — clone previous pages on forward navigation, reveal clones as peek during swipe-back gestures

---

## Problem

SvelteKit destroys the previous route's DOM on navigation. When a user swipes back, the current page slides away to reveal a blank screen. The legacy app kept previous screens visible underneath during the swipe gesture, creating a native-feeling iOS-style navigation experience.

## Solution

Snapshot the current page's `.sc` element (via `cloneNode(true)`) before each forward navigation. Store snapshots in a bounded stack. During swipe-back gestures, insert the snapshot behind the active page as a static peek with parallax animation. After the swipe commits and SvelteKit renders the real page, remove the snapshot and restore scroll positions.

SvelteKit's file-based routing stays completely intact. No route restructuring, no manual component management. The snapshots are visible for ~280ms during the swipe transition, then replaced by the live page.

---

## Architecture

Three components, all additive:

### 1. Navigation Stack Store (`navStack.ts`)

**Entry structure:**
```typescript
interface StackEntry {
  path: string;                    // e.g., '/unit/u3'
  snapshot: HTMLElement;           // cloneNode(true) of .sc
  scrollMap: Map<string, number>;  // selector → scrollTop
  key: string;                     // crypto.randomUUID()
}
```

**Scrollable selectors captured:**
- `.sc-in` — lesson and unit content area
- `.carousel-wrap` — home unit carousel
- `.sc-scroll-box` — generic scroll containers

**Store API:**
| Method | Behavior |
|--------|----------|
| `push(path)` | Snapshot current `.sc`, record scroll positions, push onto stack |
| `pop()` | Remove top entry, return it (for scroll restore after navigation) |
| `peek()` | Return top entry without removing (for swipe preview) |
| `clear()` | Empty the stack entirely |
| `size` | Derived count |

**Stack rules:**
- Home (`/`) is always the stack floor — never evicted
- Max depth: 4 entries (home + unit + lesson + settings)
- Forward navigation pushes; swipe-back pops
- Navigation to `/login` or `/dashboard` clears the entire stack
- Navigation to `/` via tap (not swipe) clears everything above home

### 2. Navigation Helper (`stackNavigate`)

Centralizes the snapshot + navigate pattern. Exported from `navStack.ts`:

```typescript
async function stackNavigate(dest: string) {
  const currentPath = window.location.pathname;

  if (dest === '/login' || dest === '/dashboard') {
    navStack.clear();
    return goto(dest);
  }

  if (dest === '/' && currentPath !== '/settings') {
    navStack.clear();
    return goto(dest);
  }

  navStack.push(currentPath);
  return goto(dest);
}
```

### 3. Updated Swipe Service (`swipe.ts`)

Existing physics unchanged:
- Commit: displacement >= 50% of screen width OR velocity >= 0.4 px/ms
- Deadzone: 8px before deciding horizontal vs vertical
- H_RATIO: 0.8 (horizontal distance must be 80% of total)
- Animation: 280ms cubic-bezier(.25,.46,.45,.94)

New visual behavior per phase:

| Phase | Active Page | Peek (Snapshot) |
|-------|------------|-----------------|
| Swipe start | `transition: none` | Inserted into DOM at `translateX(-28%)`, `opacity: 0.85`, `pointer-events: none` |
| Swipe move | `translateX(dx)` follows finger | Parallax: `translateX(-28% + (28% × dx/W))` |
| Commit | Slides to `translateX(100%)` over 280ms | Slides to `translateX(0)` + `opacity: 1` over 280ms |
| Cancel | Snaps to `translateX(0)` over 280ms | Fades out and removed from DOM |

**After commit completes (280ms):**
1. Call `navStack.pop()` to get scroll positions
2. Call `goto(dest)`
3. After SvelteKit renders: `await tick()`, restore scroll positions on real DOM
4. Remove snapshot from DOM

**Fallback:** If the stack is empty (e.g., deep-linked URL), fall back to the existing `.swipe-peek-bg` background div.

---

## Scroll Position Restore

After `goto()` resolves, the real page is in the DOM. Restore scroll positions:

```typescript
await goto(dest);
await tick();
for (const [selector, scrollTop] of entry.scrollMap) {
  const el = document.querySelector(selector);
  if (el) el.scrollTop = scrollTop;
}
```

If a selector doesn't exist yet (lazy-loaded data), retry once after `requestAnimationFrame`.

---

## Stack Participation

### Routes that push onto the stack (forward navigation):
| From | To | Push |
|------|----|------|
| `/` (home) | `/unit/[id]` | Push `/` |
| `/unit/[id]` | `/lesson/[id]` | Push `/unit/[id]` |
| Any page | `/settings` | Push current path |

### Routes that pop from the stack (swipe-back):
| From | To | Pop |
|------|----|-----|
| `/unit/[id]` | `/` | Pop unit entry |
| `/lesson/[id]` | `/unit/[id]` | Pop lesson entry |
| `/settings` | Previous page | Pop settings entry |

### Routes that clear the stack:
| Navigation | Reason |
|-----------|--------|
| → `/login` | New session |
| → `/dashboard` | Parent context, no swipe-back |
| Tap home (not swipe) | Reset to floor |

### Routes that don't participate:
- `/quiz/*` — swipe-back already blocked
- `/login` — root screen, no stack
- `/dashboard` — root screen, no stack
- `/select` — no swipe-back
- `/history` — not in learning flow stack

---

## Edge Cases

**1. Deep-linked URL (stack empty):**
Swipe-back falls back to `.swipe-peek-bg` background div. No snapshot, no parallax. Functional but not premium. This only affects users who paste a URL directly — not the normal app flow.

**2. Browser back button or in-app back button tap instead of swipe:**
Listen for `popstate` events in `+layout.svelte`. Call `navStack.pop()` (discard the snapshot) to keep the stack aligned with actual navigation state. In-app back buttons (e.g., the "←" in lesson/unit headers) should also call `navStack.pop()` before `goto(dest)` to discard the unused snapshot and keep the stack in sync.

**3. Settings from 3-deep (home → unit → lesson → settings):**
Stack holds 4 entries. Swiping back 4 times peels: settings → lesson → unit → home. Each swipe pops one. Correct behavior.

**4. Stale data in snapshot (e.g., quiz completed while viewing lesson):**
Snapshot shows pre-quiz state for ~280ms during swipe animation. Once SvelteKit renders the real page, updated state appears. Imperceptible to the user.

**5. Memory:**
4 entries max × ~15KB DOM nodes = ~60KB worst case. Negligible on any device.

---

## File Changes

### New Files
| File | Purpose |
|------|---------|
| `app/src/lib/services/navStack.ts` | Stack store, snapshot/restore logic, `stackNavigate()` helper |

### Modified Files
| File | Change |
|------|--------|
| `app/src/lib/services/swipe.ts` | Replace `.swipe-peek-bg` with snapshot peek; add parallax; pop stack on commit |
| `app/src/app.css` | Add `.swipe-peek-snapshot` styles; keep `.swipe-peek-bg` as fallback |
| `app/src/routes/+layout.svelte` | Settings cog uses `stackNavigate`; add `popstate` listener for stack sync |
| `app/src/lib/components/home/UnitCard.svelte` | Use `stackNavigate` instead of `goto` |
| `app/src/routes/unit/[id]/+page.svelte` | Lesson card clicks use `stackNavigate`; back button calls `navStack.pop()` before `goto` |
| `app/src/routes/lesson/[id]/+page.svelte` | Back button calls `navStack.pop()` before `goto` |
| `app/src/routes/login/+page.svelte` | Call `navStack.clear()` on successful login |
| `app/src/routes/dashboard/+layout.svelte` | Call `navStack.clear()` on mount |

### Files NOT Changed
- All page components keep `.sc` wrappers and SvelteKit routing
- `+layout.svelte` children rendering stays as `{@render children()}`
- Quiz pages — no stack interaction
- History page — not in stack flow

### CSS Classes
```css
.swipe-peek-snapshot {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  transform: translateX(-28%);
  opacity: 0.85;
  will-change: transform, opacity;
}

.swipe-peek-bg {
  /* existing styles unchanged — used as fallback when no snapshot exists */
}
```

---

## Data Flow

```
User taps "Unit 3" on home screen
  → stackNavigate('/unit/u3')
  → navStack.push('/') snapshots home .sc + scroll positions
  → goto('/unit/u3') — SvelteKit navigates normally, destroys home

User swipes back from unit page
  → touchstart: navStack.peek() → home snapshot exists
  → intent decided: insert snapshot into DOM at translateX(-28%)
  → touchmove: active page follows finger, snapshot parallaxes toward 0%
  → commit (50% or fast flick):
      active slides to translateX(100%) over 280ms
      snapshot slides to translateX(0) over 280ms
  → after 280ms:
      navStack.pop() → get scrollMap
      goto('/') → SvelteKit renders real home
      await tick() → restore scroll positions
      remove snapshot from DOM
```
