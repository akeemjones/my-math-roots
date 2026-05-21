# Auth Login Layout + Carousel Transition Fix

**Date:** 2026-05-21
**Status:** Approved (design)
**Files in scope:** `src/styles.css`, `src/auth.js`
**No HTML changes**

---

## Problem

Three coupled defects on the login screen (`#login-screen`):

1. **Inner scrollbar inside the Parent / Teacher Create Account tab.**
   `.ls-carousel-outer` declares `overflow-x: hidden` with no `overflow-y`. Per the CSS Overflow spec, when one axis is `hidden`/`clip` and the other is `visible`, the visible axis computes to `auto`. Combined with `_lsAdaptHeight()` only running on `_lsCarouselGo` (never on tab switch), the outer keeps its stale pixel height when the Create Account tab grows the form, and the implicit `overflow-y: auto` paints a scrollbar inside the rounded card.

2. **Swipe between Family (Student) and Parent / Teacher cards feels flat.**
   `_lsInitCarousel`'s touchmove only translates `.ls-carousel-track`. Cards never change scale or opacity, so the transition reads as a single rigid sheet sliding.

3. **No height animation when switching Sign In ↔ Create Account.**
   `_lsSwitchTab` toggles `display: none/block` on the name row and consent row but never calls `_lsAdaptHeight`. The outer keeps its stale pixel height, content overflows, scrollbar appears (defect 1).

## Goals

- No internal scrollbar inside the auth card under any state.
- The outer carousel resizes naturally to fit the active card content.
- Swipe between Family and Parent / Teacher cards has a subtle scale/opacity transition that follows the finger and snaps smoothly.
- Sign In ↔ Create Account tab switch animates the card height instead of snapping.
- No silent clipping. If sizing ever fails, the failure is loud (body/page can scroll) — the auth card itself never traps content behind an internal scrollbar.
- Visually-complete swipe: both cards have visible content during drag (no empty ghost slide).

## Non-goals

- Restructuring the Student PIN keypad or the Parent form.
- Reworking which DOM element owns `#ls-form-shared` (still single-mount-shared, moved between mounts).
- Adding new analytics events.
- Touching the launch-gate / waitlist panel logic.

---

## Design

### Architecture

```
.ls-carousel-outer     ← measures + animates HEIGHT to active card
  └── .ls-carousel-track   ← x-translate for slide, gets inline transform during drag
        ├── .ls-card#ls-card-0 (.is-active when idx=0)   ← scale/opacity via CSS class + inline during drag
        └── .ls-card#ls-card-1 (.is-active when idx=1)
```

State drivers:
- `_lsCardIdx` (existing global) — 0 = Student, 1 = Parent.
- `.is-active` class on the active card — drives steady-state scale/opacity via CSS.
- Inline `transform` / `opacity` on cards during touchmove — drives finger-following lerp.

### CSS changes (`src/styles.css` ~2545–2570)

**`.ls-carousel-outer`:**
- Change `overflow-x: hidden` → `overflow: hidden`. Both axes clipped — kills the implicit `overflow-y: auto`.
- Add `transition: height .28s cubic-bezier(.22,.61,.36,1)` so JS-set height changes animate.
- Keep all other declarations (border-radius, background, border, shadow, backdrop-filter).

**`.ls-card`:**
- Add `transform: scale(.94)` + `opacity: .7` as default state (inactive).
- Add `transform-origin: center top` so the shrink reads as "pulling back" rather than "sinking."
- Add `transition: transform .28s cubic-bezier(.22,.61,.36,1), opacity .28s cubic-bezier(.22,.61,.36,1)`.
- Add `will-change: transform, opacity` (paired with `will-change` already on track).

**`.ls-card.is-active`:**
- `transform: scale(1); opacity: 1`.

**Safe-area + bottom padding:**
- Add `padding-bottom: max(22px, env(safe-area-inset-bottom))` to `.ls-card` so the submit button and waitlist panel never touch the rounded edge on iOS PWA / notched devices. Keep the existing `22px 24px` for the other sides.

**`@media (max-height: 860px)` block (existing):**
- Keep all rules. The 8px-padding compact mode still applies. Update only the `.ls-card` rule to preserve the safe-area bottom: `padding: 8px 24px max(8px, env(safe-area-inset-bottom));`.

### JS changes (`src/auth.js`)

#### Refactor `_lsCarouselGo` to separate state from animation

Current `_lsCarouselGo` does state-update **and** transform-set. That conflicts with the touch handler which uses `_snapTo` for the slide animation. Split:

```js
function _lsCarouselGo(idx) {
  idx = parseInt(idx, 10) || 0;
  _lsApplyCardState(idx);      // mount form, dots, is-active class, role, student-render, guest btn
  _lsAdaptHeight();            // measure active card + set outer height (CSS transitions it)
  _lsSnapTrack(idx, 0.28);     // animated translateX
}
```

- `_lsApplyCardState(idx)` does what `_lsCarouselGo` does today minus the transform set:
  moves `#ls-form-shared` to `ls-mount-{idx}`, updates dots, toggles `.is-active` on both cards, calls `_lsSetRole`, calls `_lsRenderStudentCard()` if idx=0, toggles guest button visibility.
- `_lsSnapTrack(idx, dur)` is the existing `_snapTo` extracted from inside `_lsInitCarousel` so the dot-click path can also use it.

The `data-action="_lsCarouselGo"` attribute on dots stays untouched — `_lsCarouselGo` now also animates the slide, matching prior visual behavior.

#### Rewrite `_lsAdaptHeight` to be reliable + defensive

```js
function _lsAdaptHeight() {
  var outer = document.querySelector('.ls-carousel-outer');
  var active = document.getElementById('ls-card-' + _lsCardIdx);
  if (!outer || !active) return;
  var h = active.scrollHeight;
  outer.style.height = h + 'px';
  // Defensive re-measure on next frame in case layout was still settling
  // (font load, image decode, async rendered content). If the real height
  // grew past what we set, update without animation jank — set it again.
  requestAnimationFrame(function () {
    var actual = active.scrollHeight;
    if (actual > h + 1) outer.style.height = actual + 'px';
  });
}
```

Why measure the **active** card instead of `max(card0, card1)`:
- `#ls-form-shared` is moved between mounts; the inactive mount is empty (parent role header only) or holds parked content (student card). The active card always reflects "what the user is looking at."
- Sizing to active means no whitespace gap below the shorter card.
- Tradeoff: during the 280ms snap animation, both cards are mid-translate. The outer height is the new active card's height while the old card may be taller. Mitigated by the simultaneous height transition — the outer animates from old height to new height over the same 280ms, so the visual is "card slides + box reshapes" in sync.

#### Install a `ResizeObserver` on the active card

Content inside a card can change after carousel-go (form validation messages, password strength bar, waitlist panel reveal, virtual keyboard, etc.). To keep outer height in sync without sprinkling `_lsAdaptHeight()` calls everywhere, observe the active card:

```js
var _lsCardResizeObserver = null;
function _lsObserveActiveCard() {
  if (typeof ResizeObserver === 'undefined') return;
  if (_lsCardResizeObserver) _lsCardResizeObserver.disconnect();
  var active = document.getElementById('ls-card-' + _lsCardIdx);
  if (!active) return;
  _lsCardResizeObserver = new ResizeObserver(function () { _lsAdaptHeight(); });
  _lsCardResizeObserver.observe(active);
}
```

Called from `_lsApplyCardState` after the active card switches. Disconnect-and-reattach pattern keeps it scoped to the current active card only.

#### Call `_lsAdaptHeight` from `_lsSwitchTab`

After `_lsSwitchTab` toggles row visibility, the form's natural height has changed. Re-measure on the next layout tick:

```js
function _lsSwitchTab(tab) {
  // ... existing body (no change) ...
  // NEW at end:
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { _lsAdaptHeight(); });
  });
}
```

Double-rAF guarantees the visibility toggles have laid out before we measure. The CSS `transition: height` on `.ls-carousel-outer` then animates the change.

#### Touch handler: scale/opacity lerp during drag

Update `_lsInitCarousel`:

```js
function _lerpScale(progress) { return 1 - 0.06 * progress; }   // 1 → 0.94
function _lerpOpacity(progress) { return 1 - 0.30 * progress; } // 1 → 0.70

track.addEventListener('touchstart', function (e) {
  // ... existing ...
  track.style.transition = 'none';
  // NEW: pause card CSS transitions so inline values follow finger smoothly
  var c0 = document.getElementById('ls-card-0');
  var c1 = document.getElementById('ls-card-1');
  if (c0) c0.style.transition = 'none';
  if (c1) c1.style.transition = 'none';
}, { passive: true });

track.addEventListener('touchmove', function (e) {
  // ... existing intent/horizontal detection ...
  if (!_isHoriz) return;
  var currentPx = _lsCardIdx * (-_outerW);
  var newPx     = Math.max(-_outerW, Math.min(0, currentPx + dx));
  track.style.transform = 'translateX(' + newPx + 'px)';
  // NEW: progress is 0 → 1 between cards (regardless of which card is active)
  var progress = Math.abs(newPx + (_lsCardIdx * _outerW)) / _outerW;  // 0 at rest, 1 at full drag
  var activeScale   = _lerpScale(progress);
  var inactiveScale = _lerpScale(1 - progress);
  var c0 = document.getElementById('ls-card-0');
  var c1 = document.getElementById('ls-card-1');
  if (_lsCardIdx === 0) {
    if (c0) { c0.style.transform = 'scale(' + activeScale   + ')'; c0.style.opacity = _lerpOpacity(progress); }
    if (c1) { c1.style.transform = 'scale(' + inactiveScale + ')'; c1.style.opacity = _lerpOpacity(1 - progress); }
  } else {
    if (c1) { c1.style.transform = 'scale(' + activeScale   + ')'; c1.style.opacity = _lerpOpacity(progress); }
    if (c0) { c0.style.transform = 'scale(' + inactiveScale + ')'; c0.style.opacity = _lerpOpacity(1 - progress); }
  }
}, { passive: true });

function _lsClearCardInlineStyles() {
  ['ls-card-0', 'ls-card-1'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.transition = '';   // revert to CSS rule (.28s ease)
    el.style.transform  = '';   // revert to class state (scale(1) on .is-active, scale(.94) otherwise)
    el.style.opacity    = '';
  });
}

track.addEventListener('touchend', function (e) {
  if (!_intentSet || !_isHoriz) {
    _lsSnapTrack(_lsCardIdx, 0.28);
    _lsClearCardInlineStyles();   // CSS class drives snap back to current scale
    return;
  }
  var dx        = e.changedTouches[0].clientX - _startX;
  var velocity  = Math.abs(dx) / Math.max(1, Date.now() - _startT);
  var isFast    = velocity > 0.3 && Math.abs(dx) > 20;
  var committed = Math.abs(dx) >= _outerW * 0.5 || isFast;
  var targetIdx = _lsCardIdx;
  if (committed) {
    if (dx < 0 && _lsCardIdx < 1) targetIdx = 1;
    else if (dx > 0 && _lsCardIdx > 0) targetIdx = 0;
  }
  if (targetIdx !== _lsCardIdx) {
    // Move form + adapt height NOW so the new card is visually complete during the slide.
    _lsApplyCardState(targetIdx);   // mounts form, sets is-active, dots, role, guest btn
    _lsAdaptHeight();
  }
  _lsSnapTrack(targetIdx, 0.28);
  _lsClearCardInlineStyles();
}, { passive: true });

track.addEventListener('touchcancel', function () {
  _lsSnapTrack(_lsCardIdx, 0.28);
  _lsClearCardInlineStyles();
}, { passive: true });
```

Key behavioral change vs current code:
- **Form moves on touchend (immediate)**, not after 280ms setTimeout. This means when the user releases mid-swipe, the new card is already populated with the form as the slide animates. No ghost card.
- **Card state updates fire as a single coherent unit** (`_lsApplyCardState`), so dots, role, guest button, and form mount all transition together.

### Trade-off acknowledgments

1. **Card scale during snap-back without commit.** If the user drags 40% then releases (no commit), inline scale was interpolating toward the inactive state. On touchend we clear inline styles and the CSS class for the still-active card snaps back from scale(.97-ish) to scale(1). Smooth via the `.28s` transition.

2. **Brief visual pop on form mount when committing.** When committing from Student → Parent, the form reparent happens instantly at touchend. The user may notice a 1-frame appearance of the form in the parent card just as the slide begins. This is preferable to the current behavior (empty parent card during the entire 280ms slide). If pop is noticeable in testing, we can crossfade by setting form opacity to 0 → 1 during the slide window — held in reserve.

3. **`overflow: hidden` could silently clip if our measurement is wrong.** Guarded by:
   - `_lsAdaptHeight` re-measures on next frame (defensive).
   - `ResizeObserver` on the active card catches any post-render content growth.
   - `_lsAdaptHeight` is called from every state change: `_lsApplyCardState`, `_lsSwitchTab`, post-resize-observer.
   - If a bug still slips through, the failure mode is "content not visible inside card." The fallback is that `#login-screen` (`.sc.on`) has `overflow-y: auto` (existing, line 362 of `styles.css`) — but that only helps if the card itself isn't trapping the content. We accept this trade-off because the measurement is direct (`scrollHeight` of a non-scrolling element). Risk is low.

## Data flow

Initial page load:
1. HTML: `#ls-form-shared` is inside `#ls-mount-1` (Parent card).
2. `_lsInitCarousel()` wires up touch handlers.
3. Boot calls `_lsCarouselGo(0)` (Student is default):
   - `_lsApplyCardState(0)`: moves form to `#ls-mount-0` (parked, outside carousel), toggles `.is-active` on card 0, renders student PIN UI, shows guest button (guest button is hidden only on the Parent card).
   - `_lsAdaptHeight()`: measures card 0 (student body) → sets outer height.
   - `_lsSnapTrack(0, 0.28)`: track at `translateX(0)`.
   - `_lsObserveActiveCard()`: watches card 0.

User swipes Student → Parent:
1. touchstart: pause track + card transitions.
2. touchmove: interpolate track translateX, card scales, card opacities.
3. touchend (commit):
   - `_lsApplyCardState(1)`: moves form to `#ls-mount-1`, toggles `.is-active` to card 1, hides guest button.
   - `_lsAdaptHeight()`: measures card 1 (now contains the form) → outer height transitions (CSS) from card 0 height to card 1 height over 280ms.
   - `_lsSnapTrack(1, 0.28)`: track animates to `translateX(-50%)`.
   - `_lsClearCardInlineStyles()`: CSS class drives snap (card 0 → scale .94, card 1 → scale 1).
   - All three animations run in parallel for 280ms.
   - ResizeObserver reattaches to card 1 (handled inside `_lsApplyCardState`).

User toggles Sign In → Create Account (already on Parent card):
1. `_lsSwitchTab('signup')` shows name + consent rows, hides forgot link, etc.
2. Double-rAF → `_lsAdaptHeight()`: re-measures card 1 with new content.
3. Outer height transitions to new measurement; submit button slides down with the card.

## Testing

Existing Jest suite (461 tests) is pure-Node and doesn't touch the DOM. No new Jest tests added for this change — DOM-level visual verification is more appropriate and is covered by preview-driven manual verification below.

Verification (live, in preview):
- iPhone-12-class mobile viewport (390 × 844): both Student card and Parent / Teacher card render correctly. Switch Sign In ↔ Create Account on Parent card — observe smooth height animation, no inner scrollbar, all fields + consent + privacy text + submit button visible inside the rounded card.
- Swipe Student → Parent: scale + opacity transition reads smoothly, no empty card during slide.
- Swipe Parent → Student: same.
- Tablet / desktop viewport (1024+ wide): no regression on the centered card layout. Heights still adapt correctly.
- Console logs: zero errors.
- Existing 461-test Jest suite still passes (regression guard for any helper functions touched).

Acceptance gates (from user, restated):
- ✅ Parent / Teacher Create Account tab has no internal scrollbar.
- ✅ Auth card expands to fit the create-account content.
- ✅ All fields, checkboxes, terms text, and buttons remain visible and inside the rounded card.
- ✅ Swiping between Family and Parent / Teacher cards has a smooth scale transition.
- ✅ No content is clipped.
- ✅ No new iPhone safe-area / bottom-gap regression.
- ✅ No ghost / empty card during swipe.
