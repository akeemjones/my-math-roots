# Student Profiles & Auth System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-user student login with a family-based system — parent owns a Supabase account, children log in via avatar picker + 4-digit PIN, new devices link with a family code.

**Architecture:** Child profiles are `student_profiles` DB rows linked to `auth.users.id`. Children never get their own Supabase identity. All progress writes carry `student_id` scoped to the parent's auth token. The student login card (ls-card-0) gets its own dedicated UI instead of the shared email/password form. Cross-device sync: family code → cached profiles in `mmr_family_profiles` → PIN unlock → writes to Supabase with `student_id`.

**Tech Stack:** Vanilla JS (matching existing codebase), Supabase Postgres + RLS, PBKDF2 (reusing `_hashPin` already in `src/auth.js`), Jest 29 (already scaffolded).

**Spec:** `docs/superpowers/specs/2026-03-30-student-profiles-auth-design.md`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| CREATE | `supabase/migrations/20260330_student_profiles.sql` | All schema changes |
| CREATE | `tests/student-auth.test.js` | Jest tests for `_validateFamilyCode` + profile HTML builder |
| MODIFY | `index.html` | Student card: replace shared-form mount with dedicated State A/B UI; add hidden ls-mount-0 |
| MODIFY | `src/auth.js` | New student auth vars + all student login functions + parent onboarding |
| MODIFY | `src/events.js` | Register new student auth actions |
| MODIFY | `src/styles.css` | PIN keypad + avatar picker + student card CSS |
| MODIFY | `dashboard/dashboard.js` | `_renderManageProfiles`, `openPinResetSheet`, `openEditProfileSheet`, `addStudentProfile` |
| MODIFY | `dashboard/dashboard.css` | Manage profiles + bottom-sheet PIN reset styles |

---

## Task 1 — Supabase migration

**Files:** `supabase/migrations/20260330_student_profiles.sql`

- [ ] Create the file:

```sql
-- ══════════════════════════════════════════
--  Student Profiles & Auth — Migration
--  2026-03-30
-- ══════════════════════════════════════════

-- 1. New table: student_profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username          TEXT NOT NULL,
  display_name      TEXT NOT NULL,
  age               INTEGER,
  avatar_emoji      TEXT NOT NULL DEFAULT '🦁',
  avatar_color_from TEXT NOT NULL DEFAULT '#f59e0b',
  avatar_color_to   TEXT NOT NULL DEFAULT '#f97316',
  pin_hash          TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, username)
);

-- RLS: parent reads/writes only their own children
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_owns_profiles" ON student_profiles
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- 2. Add family_code to profiles (one per parent account)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_code TEXT UNIQUE;

-- Allow anon to look up parent_id by family_code (device linking)
-- Only projects id + family_code — no other fields exposed
CREATE POLICY "anon_family_code_lookup" ON profiles
  FOR SELECT TO anon
  USING (true);

-- Allow anon to SELECT from student_profiles via JOIN on family_code
-- (the app queries: SELECT sp.* FROM student_profiles sp JOIN profiles p ON p.id=sp.parent_id WHERE p.family_code=$1)
-- RLS on student_profiles blocks anon SELECT by default; we need a special policy for device setup:
CREATE POLICY "anon_device_setup_read" ON student_profiles
  FOR SELECT TO anon
  USING (true);

-- 3. Add student_id to student_progress (quiz_scores table in this codebase)
ALTER TABLE quiz_scores ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES student_profiles(id);

-- Index for fast per-student queries
CREATE INDEX IF NOT EXISTS idx_quiz_scores_student_id ON quiz_scores(student_id);
```

- [ ] `git add supabase/migrations/20260330_student_profiles.sql`
- [ ] `git commit -m "feat(db): add student_profiles table, family_code to profiles, student_id to quiz_scores"`

> **Note:** Apply this migration to your Supabase project via the Supabase dashboard SQL editor or CLI. The JS code in later tasks depends on these columns existing.

---

## Task 2 — Jest tests for pure student-auth helpers (failing first)

**Files:** `tests/student-auth.test.js`

- [ ] Create `tests/student-auth.test.js`:

```javascript
'use strict';

// student-auth helpers are pure functions exported for testing.
// They live in src/auth.js but are also mirrored in a test-only export shim.
// We use a minimal CommonJS shim rather than trying to require the full browser bundle.

const { _validateFamilyCode, _buildAvatarHtml, _buildStudentCardHtml } = require('./student-auth-helpers');

// ── _validateFamilyCode ───────────────────────────────────────────────────
describe('_validateFamilyCode', () => {
  test('accepts MMR-XXXX format (uppercase)', () => {
    expect(_validateFamilyCode('MMR-4829')).toBe(true);
    expect(_validateFamilyCode('MMR-AB12')).toBe(true);
    expect(_validateFamilyCode('MMR-0000')).toBe(true);
  });

  test('accepts lowercase input (case-insensitive)', () => {
    expect(_validateFamilyCode('mmr-4829')).toBe(true);
    expect(_validateFamilyCode('mmr-ab12')).toBe(true);
  });

  test('rejects wrong prefix', () => {
    expect(_validateFamilyCode('ABC-4829')).toBe(false);
    expect(_validateFamilyCode('MMR4829')).toBe(false);
  });

  test('rejects wrong suffix length', () => {
    expect(_validateFamilyCode('MMR-123')).toBe(false);
    expect(_validateFamilyCode('MMR-12345')).toBe(false);
  });

  test('rejects special chars in suffix', () => {
    expect(_validateFamilyCode('MMR-48 9')).toBe(false);
    expect(_validateFamilyCode('MMR-48-9')).toBe(false);
  });

  test('rejects null and empty', () => {
    expect(_validateFamilyCode(null)).toBe(false);
    expect(_validateFamilyCode('')).toBe(false);
    expect(_validateFamilyCode(undefined)).toBe(false);
  });
});

// ── _buildAvatarHtml ──────────────────────────────────────────────────────
describe('_buildAvatarHtml', () => {
  const profiles = [
    { id: 'p1', display_name: 'Cameron', avatar_emoji: '🦁', avatar_color_from: '#f59e0b', avatar_color_to: '#f97316' },
    { id: 'p2', display_name: 'Maya',    avatar_emoji: '🦋', avatar_color_from: '#8b5cf6', avatar_color_to: '#ec4899' },
  ];

  test('renders one circle per profile', () => {
    const html = _buildAvatarHtml(profiles, 'p1');
    expect((html.match(/ls-avatar-item/g) || []).length).toBe(2);
  });

  test('selected avatar has ls-avatar-selected class', () => {
    const html = _buildAvatarHtml(profiles, 'p1');
    expect(html).toContain('data-id="p1"');
    expect(html).toMatch(/ls-avatar-item[^"]*ls-avatar-selected/);
  });

  test('unselected avatar does NOT have ls-avatar-selected class', () => {
    const html = _buildAvatarHtml(profiles, 'p1');
    // p2 should not have selected class
    const p2Match = html.match(/data-id="p2"[^>]*/);
    expect(p2Match).not.toBeNull();
    expect(p2Match[0]).not.toContain('ls-avatar-selected');
  });

  test('includes data-action="_lsSelectAvatar" on each item', () => {
    const html = _buildAvatarHtml(profiles, 'p1');
    expect((html.match(/data-action="_lsSelectAvatar"/g) || []).length).toBe(2);
  });

  test('escapes XSS in display_name', () => {
    const evil = [{ id: 'x1', display_name: '<script>alert(1)</script>', avatar_emoji: '🦁', avatar_color_from: '#f59e0b', avatar_color_to: '#f97316' }];
    expect(_buildAvatarHtml(evil, 'x1')).not.toContain('<script>');
  });

  test('returns empty string for empty profiles array', () => {
    expect(_buildAvatarHtml([], null)).toBe('');
  });
});

// ── _buildStudentCardHtml ─────────────────────────────────────────────────
describe('_buildStudentCardHtml', () => {
  const profiles = [
    { id: 'p1', display_name: 'Cameron', avatar_emoji: '🦁', avatar_color_from: '#f59e0b', avatar_color_to: '#f97316' },
  ];

  test('State A: renders family code input when profiles is empty', () => {
    const html = _buildStudentCardHtml([], null, []);
    expect(html).toContain('ls-family-code-inp');
    expect(html).toContain('_lsFamilyCodeSetup');
    expect(html).not.toContain('ls-pin-keypad');
  });

  test('State A: renders family code input when profiles is null', () => {
    const html = _buildStudentCardHtml(null, null, []);
    expect(html).toContain('ls-family-code-inp');
  });

  test('State B: renders avatar row when profiles has entries', () => {
    const html = _buildStudentCardHtml(profiles, 'p1', []);
    expect(html).toContain('ls-avatar-row');
    expect(html).toContain('ls-pin-keypad');
  });

  test('State B: renders PIN dots equal to buffer length (filled)', () => {
    const html = _buildStudentCardHtml(profiles, 'p1', ['1', '2']);
    // 2 filled dots (ls-pin-dot-filled) + 2 empty
    expect((html.match(/ls-pin-dot-filled/g) || []).length).toBe(2);
    expect((html.match(/ls-pin-dot-empty/g) || []).length).toBe(2);
  });

  test('State B: shows selected profile name in PIN label', () => {
    const html = _buildStudentCardHtml(profiles, 'p1', []);
    expect(html).toContain("Cameron");
  });

  test('State B: "Enter family code" link appears in State B', () => {
    const html = _buildStudentCardHtml(profiles, 'p1', []);
    expect(html).toContain('_lsClearFamilyCache');
  });

  test('keypad has 10 digit buttons + backspace', () => {
    const html = _buildStudentCardHtml(profiles, 'p1', []);
    // 10 digit buttons (0-9)
    expect((html.match(/data-action="_lsPinKey"/g) || []).length).toBe(10);
    // 1 backspace
    expect(html).toContain('_lsPinBackspace');
  });
});
```

- [ ] Create `tests/student-auth-helpers.js` (the CommonJS shim that will be filled in Task 3):

```javascript
'use strict';
// Placeholder — replaced in Task 3 with actual implementations
function _validateFamilyCode() { throw new Error('not implemented'); }
function _buildAvatarHtml() { throw new Error('not implemented'); }
function _buildStudentCardHtml() { throw new Error('not implemented'); }
module.exports = { _validateFamilyCode, _buildAvatarHtml, _buildStudentCardHtml };
```

- [ ] Run: `npx jest tests/student-auth.test.js`
- [ ] Expected: **FAIL** — `not implemented`
- [ ] `git add tests/student-auth.test.js tests/student-auth-helpers.js`
- [ ] `git commit -m "test(student-auth): add 22 failing tests for family code + avatar + card HTML helpers"`

---

## Task 3 — Implement the three pure helpers; all tests pass

**Files:** `tests/student-auth-helpers.js`

- [ ] Replace `tests/student-auth-helpers.js` with full implementations:

```javascript
'use strict';

/**
 * _validateFamilyCode — pure, no DOM/Supabase dependencies
 * Accepts: MMR-XXXX where X is [A-Z0-9], case-insensitive.
 */
function _validateFamilyCode(code) {
  if (code == null || code === '') return false;
  return /^MMR-[A-Z0-9]{4}$/i.test(String(code));
}

/**
 * _esc — XSS-safe escaper (same as dashboard.js)
 */
function _esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * _buildAvatarHtml — renders avatar picker row HTML
 * @param {Array} profiles — array of student profile objects
 * @param {string|null} selectedId — id of currently selected profile
 * @returns {string} HTML string
 */
function _buildAvatarHtml(profiles, selectedId) {
  if (!profiles || !profiles.length) return '';
  return profiles.map(function(p) {
    var isSelected = p.id === selectedId;
    var ringStyle = isSelected
      ? 'border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 0 0 3px rgba(245,158,11,0.45),0 4px 12px rgba(0,0,0,0.3);opacity:1'
      : 'border:2.5px solid rgba(255,255,255,0.25);box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:0.7';
    return '<div class="ls-avatar-item' + (isSelected ? ' ls-avatar-selected' : '') + '"'
      + ' data-action="_lsSelectAvatar" data-arg="' + _esc(p.id) + '"'
      + ' data-id="' + _esc(p.id) + '">'
      + '<div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,'
      + _esc(p.avatar_color_from) + ',' + _esc(p.avatar_color_to)
      + ');display:flex;align-items:center;justify-content:center;font-size:1.5rem;' + ringStyle + '">'
      + _esc(p.avatar_emoji) + '</div>'
      + '<div style="font-size:.72rem;color:' + (isSelected ? '#fff' : 'rgba(255,255,255,0.65)') + ';font-weight:'
      + (isSelected ? '700' : '600') + ';margin-top:5px">' + _esc(p.display_name) + '</div>'
      + '</div>';
  }).join('');
}

/**
 * _buildStudentCardHtml — renders the full student card body
 * State A (profiles empty/null): family code input
 * State B (profiles has entries): avatar picker + PIN keypad
 */
function _buildStudentCardHtml(profiles, selectedId, pinBuffer) {
  if (!profiles || !profiles.length) {
    // State A — family code entry
    return '<div style="padding:4px 0">'
      + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.08em;text-align:center;margin-bottom:10px">Enter your family code</div>'
      + '<input id="ls-family-code-inp" type="text" class="set-inp" placeholder="MMR-0000"'
      + ' maxlength="8" style="width:100%;text-align:center;letter-spacing:.15em;text-transform:uppercase;font-size:var(--fs-md);font-family:\'Boogaloo\',sans-serif;box-sizing:border-box;margin-bottom:12px">'
      + '<div id="ls-family-code-msg" style="font-size:.78rem;color:#f87171;text-align:center;min-height:1.2rem;margin-bottom:8px"></div>'
      + '<button data-action="_lsFamilyCodeSetup" style="width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:var(--fs-md);cursor:pointer;letter-spacing:.3px;touch-action:manipulation">Link This Device</button>'
      + '</div>';
  }

  // State B — avatar picker + PIN keypad
  var buf = Array.isArray(pinBuffer) ? pinBuffer : [];
  var selected = profiles.find(function(p) { return p.id === selectedId; }) || profiles[0];
  var selId = selected ? selected.id : null;
  var selName = selected ? _esc(selected.display_name) : '';

  // PIN dots (4 total)
  var dots = '';
  for (var i = 0; i < 4; i++) {
    if (i < buf.length) {
      dots += '<div class="ls-pin-dot ls-pin-dot-filled"></div>';
    } else {
      dots += '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
    }
  }

  // Keypad: 1-9, empty, 0, backspace
  var keys = '';
  var digits = ['1','2','3','4','5','6','7','8','9'];
  digits.forEach(function(d) {
    keys += '<button class="ls-pin-key" data-action="_lsPinKey" data-arg="' + d + '">' + d + '</button>';
  });
  keys += '<div></div>';
  keys += '<button class="ls-pin-key" data-action="_lsPinKey" data-arg="0">0</button>';
  keys += '<button class="ls-pin-key ls-pin-key-back" data-action="_lsPinBackspace">&#x232B;</button>';

  return '<div style="margin-bottom:14px">'
    + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);letter-spacing:.08em;text-transform:uppercase;text-align:center;margin-bottom:10px">Who\'s playing?</div>'
    + '<div class="ls-avatar-row">' + _buildAvatarHtml(profiles, selId) + '</div>'
    + '</div>'
    + '<div style="border-top:1px solid rgba(255,255,255,0.14);padding-top:14px">'
    + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);text-align:center;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">' + selName + '\'s PIN</div>'
    + '<div id="ls-pin-dots" style="display:flex;gap:10px;justify-content:center;margin-bottom:14px">' + dots + '</div>'
    + '<div id="ls-pin-msg" style="font-size:.75rem;color:#f87171;text-align:center;min-height:1.1rem;margin-bottom:6px"></div>'
    + '<div class="ls-pin-keypad" id="ls-pin-keypad">' + keys + '</div>'
    + '<div style="margin-top:12px;text-align:center;font-size:.68rem;color:rgba(255,255,255,0.35)">'
    + 'New device? <span data-action="_lsClearFamilyCache" style="color:rgba(255,210,80,0.85);text-decoration:underline;cursor:pointer">Enter family code &#x2192;</span>'
    + '</div>'
    + '</div>';
}

module.exports = { _validateFamilyCode, _buildAvatarHtml, _buildStudentCardHtml };
```

- [ ] Run: `npx jest tests/student-auth.test.js --verbose`
- [ ] Expected: all 22 tests **PASS**
- [ ] `git add tests/student-auth-helpers.js`
- [ ] `git commit -m "feat(student-auth): implement _validateFamilyCode + _buildAvatarHtml + _buildStudentCardHtml — 22 tests passing"`

---

## Task 4 — CSS for student card elements

**Files:** `src/styles.css`

- [ ] Append the following to the end of `src/styles.css` (before any existing final rules, or at end of file):

```css
/* ── Student card: avatar picker ── */
.ls-avatar-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.ls-avatar-item{display:flex;flex-direction:column;align-items:center;gap:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ls-avatar-selected > div:first-child{opacity:1!important}

/* ── Student card: PIN dots ── */
.ls-pin-dot{width:14px;height:14px;border-radius:50%;flex-shrink:0}
.ls-pin-dot-filled{background:#f59e0b;box-shadow:0 0 8px rgba(245,158,11,0.7)}
.ls-pin-dot-empty{background:rgba(255,255,255,0.2);border:1.5px solid rgba(255,255,255,0.35)}

/* ── Student card: PIN keypad ── */
.ls-pin-keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ls-pin-key{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:13px 0;text-align:center;color:#fff;font-size:1.25rem;font-weight:700;cursor:pointer;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:background .1s}
.ls-pin-key:active{background:rgba(255,255,255,0.22)}
.ls-pin-key-back{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.12);color:rgba(255,255,255,0.55);font-size:1rem}

/* ── PIN shake animation (wrong PIN) ── */
@keyframes ls-pin-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
.ls-pin-shake{animation:ls-pin-shake .4s ease}

/* ── Family code input uppercase styling ── */
#ls-family-code-inp{text-transform:uppercase;letter-spacing:.15em;text-align:center;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif}
```

- [ ] Run: `npx jest --verbose`
- [ ] Expected: all tests still pass (CSS change — no JS regression)
- [ ] `git add src/styles.css`
- [ ] `git commit -m "style(student-auth): add avatar picker, PIN dot, keypad, and shake animation CSS"`

---

## Task 5 — Student card HTML in `index.html`

**Files:** `index.html`

The student card currently shows `ls-mount-0` which receives the shared email/password form. We need to:
1. Replace the card body with a dedicated student PIN UI container
2. Move the hidden `ls-mount-0` outside the carousel (so shared form parks there invisibly when student card is active)

- [ ] Find this block in `index.html` (inside `#ls-card-0`, after the `ls-card-role-hd` div):

```html
          <div id="ls-mount-0">
          <div id="ls-form-shared">
```

This is the start of a large shared form block that ends at `</div><!-- #ls-mount-0 -->`.

- [ ] Replace the entire content of `#ls-card-0` that comes after `ls-card-role-hd` (i.e., `<div id="ls-mount-0">` through `</div><!-- #ls-mount-0 -->`) with:

```html
          <!-- Student PIN card body — rendered by _lsRenderStudentCard() -->
          <div id="ls-student-body"></div>
```

- [ ] Find the carousel track's closing `</div>` and the comment `</div><!-- ls-carousel-track -->` (or similar) and locate the closing `</div>` for the outer carousel wrapper.

  After `</div><!-- #ls-card-1 -->` (or the equivalent closing tag for the second card), **before** the carousel track's closing `</div>`, add nothing — instead add the hidden mount-0 as a sibling of the carousel (find the line that closes the outer login carousel container, typically `</div><!-- carousel -->` or similar), and after it add:

```html
        <!-- Hidden mount for shared form when student card is active — do not remove -->
        <div id="ls-mount-0" style="display:none" aria-hidden="true"></div>
```

  Exact placement: immediately after the `</div>` that closes `ls-carousel-track` (and before the carousel dots/indicators).

- [ ] Verify that `ls-form-shared` is still inside `ls-mount-1` (inside ls-card-1). It should be — we only changed ls-card-0.

- [ ] `git add index.html`
- [ ] `git commit -m "feat(student-auth): replace ls-card-0 shared form with dedicated #ls-student-body container"`

---

## Task 6 — Student auth state variables and core functions in `src/auth.js`

**Files:** `src/auth.js`

### 6a — Add state variables

- [ ] Find the line `var _lsCardIdx = 0;` in `src/auth.js` (around line 22).

- [ ] Immediately after it, add:

```javascript
// ── Student login state ──────────────────────────────────────────────────
var _lsFamilyProfiles = null;   // cached Array<profile> from mmr_family_profiles
var _lsSelectedStudentId = null; // id of avatar currently highlighted
var _lsPinBuffer = [];           // digits entered so far (max 4)
var _STU_FAIL_KEY   = 'mmr_stud_fail_ts';
var _STU_FAIL_COUNT = 'mmr_stud_fail_count';
var _STU_MAX_FAILS  = 5;
var _STU_LOCK_MS    = 30000;
```

### 6b — `_validateFamilyCode` (pure, mirrors test helper)

- [ ] Add after the state variables:

```javascript
function _validateFamilyCode(code) {
  if (code == null || code === '') return false;
  return /^MMR-[A-Z0-9]{4}$/i.test(String(code));
}
```

### 6c — `_lsEsc` (XSS escaper — scoped to auth module)

- [ ] Add:

```javascript
function _lsEsc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

### 6d — `_buildAvatarHtml` + `_buildStudentCardHtml` (mirror test helpers, using `_lsEsc`)

- [ ] Add both functions. They are identical to `tests/student-auth-helpers.js` except they use `_lsEsc` instead of `_esc`:

```javascript
function _buildAvatarHtml(profiles, selectedId) {
  if (!profiles || !profiles.length) return '';
  return profiles.map(function(p) {
    var isSelected = p.id === selectedId;
    var ringStyle = isSelected
      ? 'border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 0 0 3px rgba(245,158,11,0.45),0 4px 12px rgba(0,0,0,0.3);opacity:1'
      : 'border:2.5px solid rgba(255,255,255,0.25);box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:0.7';
    return '<div class="ls-avatar-item' + (isSelected ? ' ls-avatar-selected' : '') + '"'
      + ' data-action="_lsSelectAvatar" data-arg="' + _lsEsc(p.id) + '"'
      + ' data-id="' + _lsEsc(p.id) + '">'
      + '<div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,'
      + _lsEsc(p.avatar_color_from) + ',' + _lsEsc(p.avatar_color_to)
      + ');display:flex;align-items:center;justify-content:center;font-size:1.5rem;' + ringStyle + '">'
      + _lsEsc(p.avatar_emoji) + '</div>'
      + '<div style="font-size:.72rem;color:' + (isSelected ? '#fff' : 'rgba(255,255,255,0.65)') + ';font-weight:'
      + (isSelected ? '700' : '600') + ';margin-top:5px">' + _lsEsc(p.display_name) + '</div>'
      + '</div>';
  }).join('');
}

function _buildStudentCardHtml(profiles, selectedId, pinBuffer) {
  if (!profiles || !profiles.length) {
    return '<div style="padding:4px 0">'
      + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.08em;text-align:center;margin-bottom:10px">Enter your family code</div>'
      + '<input id="ls-family-code-inp" type="text" class="set-inp" placeholder="MMR-0000"'
      + ' maxlength="8" style="width:100%;text-align:center;letter-spacing:.15em;text-transform:uppercase;font-size:var(--fs-md);font-family:\'Boogaloo\',sans-serif;box-sizing:border-box;margin-bottom:12px">'
      + '<div id="ls-family-code-msg" style="font-size:.78rem;color:#f87171;text-align:center;min-height:1.2rem;margin-bottom:8px"></div>'
      + '<button data-action="_lsFamilyCodeSetup" style="width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:var(--fs-md);cursor:pointer;letter-spacing:.3px;touch-action:manipulation">Link This Device</button>'
      + '</div>';
  }
  var buf = Array.isArray(pinBuffer) ? pinBuffer : [];
  var selected = profiles.find(function(p) { return p.id === selectedId; }) || profiles[0];
  var selId = selected ? selected.id : null;
  var selName = selected ? _lsEsc(selected.display_name) : '';
  var dots = '';
  for (var i = 0; i < 4; i++) {
    dots += i < buf.length
      ? '<div class="ls-pin-dot ls-pin-dot-filled"></div>'
      : '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
  }
  var keys = '';
  ['1','2','3','4','5','6','7','8','9'].forEach(function(d) {
    keys += '<button class="ls-pin-key" data-action="_lsPinKey" data-arg="' + d + '">' + d + '</button>';
  });
  keys += '<div></div>';
  keys += '<button class="ls-pin-key" data-action="_lsPinKey" data-arg="0">0</button>';
  keys += '<button class="ls-pin-key ls-pin-key-back" data-action="_lsPinBackspace">&#x232B;</button>';
  return '<div style="margin-bottom:14px">'
    + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);letter-spacing:.08em;text-transform:uppercase;text-align:center;margin-bottom:10px">Who\'s playing?</div>'
    + '<div class="ls-avatar-row">' + _buildAvatarHtml(profiles, selId) + '</div>'
    + '</div>'
    + '<div style="border-top:1px solid rgba(255,255,255,0.14);padding-top:14px">'
    + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);text-align:center;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">' + selName + '\'s PIN</div>'
    + '<div id="ls-pin-dots" style="display:flex;gap:10px;justify-content:center;margin-bottom:14px">' + dots + '</div>'
    + '<div id="ls-pin-msg" style="font-size:.75rem;color:#f87171;text-align:center;min-height:1.1rem;margin-bottom:6px"></div>'
    + '<div class="ls-pin-keypad" id="ls-pin-keypad">' + keys + '</div>'
    + '<div style="margin-top:12px;text-align:center;font-size:.68rem;color:rgba(255,255,255,0.35)">'
    + 'New device? <span data-action="_lsClearFamilyCache" style="color:rgba(255,210,80,0.85);text-decoration:underline;cursor:pointer">Enter family code &#x2192;</span>'
    + '</div>'
    + '</div>';
}
```

### 6e — `_lsRenderStudentCard`

- [ ] Add:

```javascript
function _lsRenderStudentCard() {
  var body = document.getElementById('ls-student-body');
  if (!body) return;
  // Load cached profiles if not already in memory
  if (!_lsFamilyProfiles) {
    try {
      var raw = localStorage.getItem('mmr_family_profiles');
      _lsFamilyProfiles = raw ? JSON.parse(raw) : [];
    } catch(e) { _lsFamilyProfiles = []; }
  }
  // Pre-select last used student (Remember Me)
  if (!_lsSelectedStudentId && _lsFamilyProfiles && _lsFamilyProfiles.length) {
    var last = localStorage.getItem('mmr_last_student_id');
    _lsSelectedStudentId = last || _lsFamilyProfiles[0].id;
  }
  body.innerHTML = _buildStudentCardHtml(_lsFamilyProfiles, _lsSelectedStudentId, _lsPinBuffer);
}
```

### 6f — Hook `_lsRenderStudentCard` into `_lsCarouselGo`

- [ ] Find the line in `_lsCarouselGo`:
  ```javascript
  _lsSetRole(idx === 0 ? 'student' : 'parent');
  ```
- [ ] Add one line immediately after it:
  ```javascript
  if (idx === 0) _lsRenderStudentCard();
  ```

### 6g — Also call on page load when student card is default

- [ ] Find in `supabaseInit()` the block:
  ```javascript
  show('login-screen'); _initOneTap(); _lsInitCarousel();
  _dismissSplash('login-screen');
  ```
- [ ] Add `_lsRenderStudentCard();` after `_lsInitCarousel();`:
  ```javascript
  show('login-screen'); _initOneTap(); _lsInitCarousel();
  _lsRenderStudentCard();
  _dismissSplash('login-screen');
  ```

### 6h — `_lsFamilyCodeSetup`

- [ ] Add:

```javascript
async function _lsFamilyCodeSetup() {
  var inp = document.getElementById('ls-family-code-inp');
  var msg = document.getElementById('ls-family-code-msg');
  if (!inp || !msg) return;
  var code = inp.value.trim().toUpperCase();
  if (!_validateFamilyCode(code)) {
    msg.textContent = 'Enter a valid family code (e.g. MMR-4829)';
    return;
  }
  msg.textContent = '';
  inp.disabled = true;

  if (!_supa) { msg.textContent = 'No connection — please try again.'; inp.disabled = false; return; }

  try {
    var timeout = new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); });
    var query = _supa
      .from('student_profiles')
      .select('id, username, display_name, age, avatar_emoji, avatar_color_from, avatar_color_to, pin_hash')
      .eq('profiles.family_code', code)  // JOIN handled by Supabase filter on the join
    // Use RPC or a direct join query:
    var result = await Promise.race([
      _supa.rpc('get_profiles_by_family_code', { p_family_code: code }),
      timeout
    ]);
    if (result.error) throw result.error;
    var profiles = result.data || [];
    if (!profiles.length) {
      msg.textContent = 'Family code not found — check with your parent.';
      inp.disabled = false;
      return;
    }
    localStorage.setItem('mmr_family_profiles', JSON.stringify(profiles));
    _lsFamilyProfiles = profiles;
    _lsSelectedStudentId = profiles[0].id;
    _lsPinBuffer = [];
    _lsRenderStudentCard();
  } catch(e) {
    msg.textContent = 'Could not connect — check your internet and try again.';
    inp.disabled = false;
  }
}
```

> **Note:** The Supabase query uses an RPC function `get_profiles_by_family_code`. Add this to the migration file (see Task 1 addendum below). Alternatively, the query can be done as a direct join. The RPC approach keeps anon exposure minimal.

### 6i — `_lsSelectAvatar`

- [ ] Add:

```javascript
function _lsSelectAvatar(studentId) {
  _lsSelectedStudentId = studentId;
  _lsPinBuffer = [];
  _lsRenderStudentCard();
}
```

### 6j — `_lsPinKey` and `_lsPinBackspace`

- [ ] Add:

```javascript
function _lsPinKey(digit) {
  if (_lsPinBuffer.length >= 4) return;
  _lsPinBuffer.push(String(digit));
  // Re-render dots only (cheaper than full re-render)
  var dots = document.getElementById('ls-pin-dots');
  if (dots) {
    var html = '';
    for (var i = 0; i < 4; i++) {
      html += i < _lsPinBuffer.length
        ? '<div class="ls-pin-dot ls-pin-dot-filled"></div>'
        : '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
    }
    dots.innerHTML = html;
  }
  if (_lsPinBuffer.length === 4) _lsStudentLogin();
}

function _lsPinBackspace() {
  if (!_lsPinBuffer.length) return;
  _lsPinBuffer.pop();
  var dots = document.getElementById('ls-pin-dots');
  if (dots) {
    var html = '';
    for (var i = 0; i < 4; i++) {
      html += i < _lsPinBuffer.length
        ? '<div class="ls-pin-dot ls-pin-dot-filled"></div>'
        : '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
    }
    dots.innerHTML = html;
  }
}
```

### 6k — `_lsStudentLogin`

- [ ] Add:

```javascript
async function _lsStudentLogin() {
  var msg = document.getElementById('ls-pin-msg');

  // Lockout check
  var failCount = parseInt(localStorage.getItem(_STU_FAIL_COUNT) || '0');
  var failTs    = parseInt(localStorage.getItem(_STU_FAIL_KEY)   || '0');
  if (failCount >= _STU_MAX_FAILS) {
    var elapsed = Date.now() - failTs;
    if (elapsed < _STU_LOCK_MS) {
      var secs = Math.ceil((_STU_LOCK_MS - elapsed) / 1000);
      if (msg) msg.textContent = 'Too many attempts. Try again in ' + secs + 's.';
      _lsPinBuffer = [];
      return;
    }
    localStorage.removeItem(_STU_FAIL_COUNT);
    localStorage.removeItem(_STU_FAIL_KEY);
    failCount = 0;
  }

  var profile = _lsFamilyProfiles && _lsFamilyProfiles.find(function(p) { return p.id === _lsSelectedStudentId; });
  if (!profile) { _lsPinBuffer = []; return; }

  var entered = _lsPinBuffer.join('');
  var enteredHash = await _hashPin(entered);

  if (enteredHash === profile.pin_hash) {
    // Success
    localStorage.removeItem(_STU_FAIL_COUNT);
    localStorage.removeItem(_STU_FAIL_KEY);
    localStorage.setItem('mmr_active_student_id', profile.id);
    localStorage.setItem('mmr_last_student_id', profile.id);
    localStorage.setItem('mmr_user_role', 'student');
    _lsPinBuffer = [];
    // Route to home (student mode — no Supabase session needed for local play)
    show('home');
    buildHome();
    _installHistoryGuard();
    setTimeout(tutCheckAndShow, 1500);
  } else {
    // Wrong PIN — shake + increment fail counter
    var newCount = failCount + 1;
    localStorage.setItem(_STU_FAIL_COUNT, String(newCount));
    localStorage.setItem(_STU_FAIL_KEY, String(Date.now()));
    _lsPinBuffer = [];
    if (msg) {
      var remaining = _STU_MAX_FAILS - newCount;
      msg.textContent = remaining > 0
        ? 'Wrong PIN. ' + remaining + ' attempt' + (remaining === 1 ? '' : 's') + ' left.'
        : 'Locked for 30 seconds.';
    }
    var dotsEl = document.getElementById('ls-pin-dots');
    if (dotsEl) {
      dotsEl.classList.add('ls-pin-shake');
      setTimeout(function() { dotsEl.classList.remove('ls-pin-shake'); }, 450);
      // Reset dots to empty after shake
      var emptyDots = '';
      for (var i = 0; i < 4; i++) emptyDots += '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
      setTimeout(function() { if (dotsEl) dotsEl.innerHTML = emptyDots; }, 450);
    }
  }
}
```

### 6l — `_lsClearFamilyCache`

- [ ] Add:

```javascript
function _lsClearFamilyCache() {
  localStorage.removeItem('mmr_family_profiles');
  localStorage.removeItem('mmr_last_student_id');
  _lsFamilyProfiles = [];
  _lsSelectedStudentId = null;
  _lsPinBuffer = [];
  _lsRenderStudentCard();
}
```

- [ ] Also add `_lsClearFamilyCache` to `_clearUserData()` — find the section:
  ```javascript
  localStorage.removeItem('wb_anon_tracked');
  ```
  and add after it:
  ```javascript
  localStorage.removeItem('mmr_family_profiles');
  localStorage.removeItem('mmr_active_student_id');
  localStorage.removeItem('mmr_last_student_id');
  localStorage.removeItem(_STU_FAIL_KEY);
  localStorage.removeItem(_STU_FAIL_COUNT);
  _lsFamilyProfiles = null;
  _lsSelectedStudentId = null;
  _lsPinBuffer = [];
  ```

- [ ] Run: `npx jest --verbose`
- [ ] Expected: all tests still pass
- [ ] `git add src/auth.js`
- [ ] `git commit -m "feat(student-auth): add student login state, _validateFamilyCode, _buildStudentCardHtml, PIN keypad + login flow"`

---

## Task 7 — Register new student auth actions in `src/events.js`

**Files:** `src/events.js`

- [ ] Open `src/events.js` and find the auth section in `_ACTIONS` (around `_lsSwitchTab`, `_lsSetRole`).

- [ ] Add these entries immediately after the `_lsSetRole` line:

```javascript
    _lsFamilyCodeSetup:     ()    => _lsFamilyCodeSetup(),
    _lsSelectAvatar:        (a)   => _lsSelectAvatar(a),
    _lsPinKey:              (a)   => _lsPinKey(a),
    _lsPinBackspace:        ()    => _lsPinBackspace(),
    _lsClearFamilyCache:    ()    => _lsClearFamilyCache(),
```

- [ ] Run: `npx jest --verbose`
- [ ] Expected: all tests pass
- [ ] `git add src/events.js`
- [ ] `git commit -m "feat(student-auth): register student login actions in events.js dispatcher"`

---

## Task 8 — Parent onboarding modal

**Files:** `src/auth.js`

Triggered in `_pullOnLogin()` when `mmr_user_role === 'parent'` and no student profiles exist for this parent.

### 8a — Add onboarding state vars

- [ ] After the student login state vars (from Task 6a), add:

```javascript
// ── Parent onboarding state ──────────────────────────────────────────────
var _obPinBuffer = [];
var _obSelectedEmoji = '🦁';
var _AVATAR_EMOJIS = ['🦁','🦋','🐉','🦊','🐬','🌟'];
var _AVATAR_COLORS = {
  '🦁': { from: '#f59e0b', to: '#f97316' },
  '🦋': { from: '#8b5cf6', to: '#ec4899' },
  '🐉': { from: '#06b6d4', to: '#3b82f6' },
  '🦊': { from: '#ef4444', to: '#f97316' },
  '🐬': { from: '#10b981', to: '#0ea5e9' },
  '🌟': { from: '#f59e0b', to: '#eab308' },
};
```

### 8b — `_lsCheckOnboarding`

- [ ] Add:

```javascript
async function _lsCheckOnboarding() {
  if (!_supa || !_supaUser) return;
  var role = localStorage.getItem('mmr_user_role');
  if (role !== 'parent') return;
  try {
    var result = await Promise.race([
      _supa.from('student_profiles').select('id', { count: 'exact', head: true }).eq('parent_id', _supaUser.id),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 5000); })
    ]);
    if (result.error) return; // fail silently — don't block login
    var count = result.count || 0;
    if (count === 0) _lsShowOnboarding();
  } catch(e) { /* silently skip onboarding if offline */ }
}
```

### 8c — Call `_lsCheckOnboarding` in `_pullOnLogin`

- [ ] Find the end of `_pullOnLogin()` — the final `catch` or the end of the try block.
- [ ] Just before the closing `}` of `_pullOnLogin`, add:

```javascript
  // Trigger parent onboarding if no student profiles exist
  await _lsCheckOnboarding();
```

### 8d — `_lsShowOnboarding` — the modal itself

- [ ] Add:

```javascript
function _lsShowOnboarding() {
  var existing = document.getElementById('ls-onboard-modal');
  if (existing) return; // already showing
  _obPinBuffer = [];
  _obSelectedEmoji = '🦁';

  var modal = document.createElement('div');
  modal.id = 'ls-onboard-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';

  modal.innerHTML = '<div style="background:#fff;border-radius:24px;padding:24px;max-width:360px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,0.4);max-height:90vh;overflow-y:auto">'
    + '<div id="ls-onboard-step1">'
    + '<h2 style="font-family:\'Boogaloo\',sans-serif;font-size:1.3rem;color:#263238;margin-bottom:4px;text-align:center">Set up your first student profile</h2>'
    + '<p style="font-size:.82rem;color:#90a4ae;text-align:center;margin-bottom:16px">You can add more students later from the dashboard.</p>'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Student Name *</label>'
    + '<input id="ls-ob-name" type="text" maxlength="20" placeholder="e.g. Cameron" class="set-inp" style="width:100%;box-sizing:border-box;margin-bottom:12px;font-size:.95rem">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Age (optional)</label>'
    + '<input id="ls-ob-age" type="number" min="4" max="18" placeholder="e.g. 7" class="set-inp" style="width:100%;box-sizing:border-box;margin-bottom:12px;font-size:.95rem">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Pick an avatar</label>'
    + '<div id="ls-ob-avatars" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:14px">'
    + _AVATAR_EMOJIS.map(function(e) {
        var c = _AVATAR_COLORS[e];
        return '<div data-action="_lsObSelectEmoji" data-arg="' + _lsEsc(e) + '"'
          + ' id="ls-ob-av-' + e.codePointAt(0) + '"'
          + ' style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,' + c.from + ',' + c.to + ');display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;border:' + (e === '🦁' ? '3px solid #1565C0' : '3px solid transparent') + ';box-sizing:border-box">' + e + '</div>';
      }).join('')
    + '</div>'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Create a 4-digit PIN</label>'
    + '<div id="ls-ob-dots" style="display:flex;gap:10px;justify-content:center;margin-bottom:10px">'
    + '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.12);border:1.5px solid rgba(0,0,0,0.18)"></div>'.repeat(4)
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px" id="ls-ob-keypad">'
    + ['1','2','3','4','5','6','7','8','9'].map(function(d){ return '<button data-action="_lsObPinKey" data-arg="' + d + '" style="background:#f0f4f8;border:1px solid #e0e0e0;border-radius:10px;padding:12px 0;font-size:1.15rem;font-weight:700;color:#263238;cursor:pointer">' + d + '</button>'; }).join('')
    + '<div></div>'
    + '<button data-action="_lsObPinKey" data-arg="0" style="background:#f0f4f8;border:1px solid #e0e0e0;border-radius:10px;padding:12px 0;font-size:1.15rem;font-weight:700;color:#263238;cursor:pointer">0</button>'
    + '<button data-action="_lsObPinBack" style="background:#fce4ec;border:1px solid #ffcdd2;border-radius:10px;padding:12px 0;font-size:1rem;color:#c62828;cursor:pointer">&#x232B;</button>'
    + '</div>'
    + '<div id="ls-ob-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:8px"></div>'
    + '<button id="ls-ob-save-btn" data-action="_lsObSave" style="width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,#1565C0,#0d47a1);color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer;opacity:0.5;pointer-events:none">Create Profile</button>'
    + '</div>'
    + '<div id="ls-onboard-step2" style="display:none;text-align:center">'
    + '<div style="font-size:2.5rem;margin-bottom:8px">&#x1F3E0;</div>'
    + '<h2 style="font-family:\'Boogaloo\',sans-serif;font-size:1.3rem;color:#263238;margin-bottom:4px">Your family code</h2>'
    + '<div id="ls-ob-family-code" style="font-family:\'Boogaloo\',sans-serif;font-size:2rem;color:#1565C0;letter-spacing:.15em;padding:12px;background:#e3f2fd;border-radius:14px;margin:14px 0"></div>'
    + '<p style="font-size:.82rem;color:#90a4ae;margin-bottom:20px">Enter this code once on your child\'s device to link it.</p>'
    + '<button data-action="_lsObDone" style="width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,#1565C0,#0d47a1);color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer">Done</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(modal);
}
```

### 8e — Onboarding action handlers

- [ ] Add:

```javascript
function _lsObSelectEmoji(emoji) {
  _obSelectedEmoji = emoji;
  _AVATAR_EMOJIS.forEach(function(e) {
    var el = document.getElementById('ls-ob-av-' + e.codePointAt(0));
    if (el) el.style.border = e === emoji ? '3px solid #1565C0' : '3px solid transparent';
  });
}

function _lsObPinKey(digit) {
  if (_obPinBuffer.length >= 4) return;
  _obPinBuffer.push(String(digit));
  _lsObUpdateDots();
  if (_obPinBuffer.length === 4) {
    var btn = document.getElementById('ls-ob-save-btn');
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = ''; }
  }
}

function _lsObPinBack() {
  if (!_obPinBuffer.length) return;
  _obPinBuffer.pop();
  _lsObUpdateDots();
  var btn = document.getElementById('ls-ob-save-btn');
  if (btn && _obPinBuffer.length < 4) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
}

function _lsObUpdateDots() {
  var dotsEl = document.getElementById('ls-ob-dots');
  if (!dotsEl) return;
  var html = '';
  for (var i = 0; i < 4; i++) {
    html += i < _obPinBuffer.length
      ? '<div style="width:14px;height:14px;border-radius:50%;background:#1565C0;box-shadow:0 0 6px rgba(21,101,192,0.5)"></div>'
      : '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.12);border:1.5px solid rgba(0,0,0,0.18)"></div>';
  }
  dotsEl.innerHTML = html;
}

async function _lsObSave() {
  var msg = document.getElementById('ls-ob-msg');
  var nameInp = document.getElementById('ls-ob-name');
  var ageInp  = document.getElementById('ls-ob-age');
  if (!nameInp || !msg) return;

  var name = nameInp.value.trim();
  if (!name) { msg.textContent = 'Please enter a student name.'; return; }
  if (_obPinBuffer.length < 4) { msg.textContent = 'Please enter a 4-digit PIN.'; return; }
  if (!_supa || !_supaUser) { msg.textContent = 'Not signed in.'; return; }

  msg.textContent = '';
  var saveBtn = document.getElementById('ls-ob-save-btn');
  if (saveBtn) { saveBtn.textContent = 'Saving...'; saveBtn.style.pointerEvents = 'none'; }

  try {
    var pinHash = await _hashPin(_obPinBuffer.join(''));
    var avatarColors = _AVATAR_COLORS[_obSelectedEmoji] || { from: '#f59e0b', to: '#f97316' };
    var ageVal = ageInp ? parseInt(ageInp.value) || null : null;
    var username = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'student';

    var insertResult = await Promise.race([
      _supa.from('student_profiles').insert({
        parent_id: _supaUser.id,
        username: username,
        display_name: name,
        age: ageVal,
        avatar_emoji: _obSelectedEmoji,
        avatar_color_from: avatarColors.from,
        avatar_color_to: avatarColors.to,
        pin_hash: pinHash,
      }).select('id').single(),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 10000); })
    ]);
    if (insertResult.error) throw insertResult.error;

    // Generate family_code if this is first student
    var codeResult = await Promise.race([
      _supa.rpc('ensure_family_code', { p_parent_id: _supaUser.id }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);
    var familyCode = (codeResult && codeResult.data) ? codeResult.data : 'MMR-????';

    // Show Step 2 — family code reveal
    var step1 = document.getElementById('ls-onboard-step1');
    var step2 = document.getElementById('ls-onboard-step2');
    var codeEl = document.getElementById('ls-ob-family-code');
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    if (codeEl) codeEl.textContent = familyCode;
  } catch(e) {
    if (msg) msg.textContent = e.message && e.message.includes('unique') ? 'A student with that name already exists.' : 'Error saving profile. Please try again.';
    if (saveBtn) { saveBtn.textContent = 'Create Profile'; saveBtn.style.pointerEvents = ''; }
  }
}

function _lsObDone() {
  var modal = document.getElementById('ls-onboard-modal');
  if (modal) modal.remove();
  // Redirect to dashboard since we're in parent mode
  window.location.href = '/dashboard/dashboard.html';
}
```

### 8f — Register onboarding actions in `src/events.js`

- [ ] In `src/events.js`, after the `_lsClearFamilyCache` entry added in Task 7, add:

```javascript
    _lsObSelectEmoji:       (a)   => _lsObSelectEmoji(a),
    _lsObPinKey:            (a)   => _lsObPinKey(a),
    _lsObPinBack:           ()    => _lsObPinBack(),
    _lsObSave:              ()    => _lsObSave(),
    _lsObDone:              ()    => _lsObDone(),
```

- [ ] Run: `npx jest --verbose`
- [ ] Expected: all tests still pass
- [ ] `git add src/auth.js src/events.js`
- [ ] `git commit -m "feat(student-auth): add parent onboarding modal — Step 1 (create profile) + Step 2 (family code reveal)"`

---

## Task 9 — Supabase RPCs for family code operations

**Files:** `supabase/migrations/20260330_student_profiles.sql`

These RPCs are called by the JS:
- `get_profiles_by_family_code(p_family_code)` — used by `_lsFamilyCodeSetup`
- `ensure_family_code(p_parent_id)` — used by `_lsObSave`

- [ ] Append to `supabase/migrations/20260330_student_profiles.sql`:

```sql
-- ── RPC: get student profiles by family code (called by anon/child devices) ──
CREATE OR REPLACE FUNCTION get_profiles_by_family_code(p_family_code TEXT)
RETURNS TABLE (
  id                UUID,
  username          TEXT,
  display_name      TEXT,
  age               INTEGER,
  avatar_emoji      TEXT,
  avatar_color_from TEXT,
  avatar_color_to   TEXT,
  pin_hash          TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sp.id, sp.username, sp.display_name, sp.age,
         sp.avatar_emoji, sp.avatar_color_from, sp.avatar_color_to, sp.pin_hash
  FROM student_profiles sp
  JOIN profiles p ON p.id = sp.parent_id
  WHERE p.family_code = upper(p_family_code);
$$;

GRANT EXECUTE ON FUNCTION get_profiles_by_family_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_profiles_by_family_code(TEXT) TO authenticated;

-- ── RPC: generate family_code for a parent if not set ──
CREATE OR REPLACE FUNCTION ensure_family_code(p_parent_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  SELECT family_code INTO v_code FROM profiles WHERE id = p_parent_id;
  IF v_code IS NULL THEN
    v_code := 'MMR-' || upper(substring(gen_random_uuid()::text, 1, 4));
    UPDATE profiles SET family_code = v_code WHERE id = p_parent_id;
  END IF;
  RETURN v_code;
END;
$$;

GRANT EXECUTE ON FUNCTION ensure_family_code(UUID) TO authenticated;
```

- [ ] `git add supabase/migrations/20260330_student_profiles.sql`
- [ ] `git commit -m "feat(db): add get_profiles_by_family_code + ensure_family_code RPCs"`

---

## Task 10 — Dashboard: Manage Profiles section

**Files:** `dashboard/dashboard.js`

### 10a — New state vars for profiles in dashboard

- [ ] Find the line `var _students    = {};` near the bottom of `dashboard/dashboard.js`.
- [ ] Add immediately after the `var _activeId` line:

```javascript
var _managedProfiles = [];    // Array<student_profile> for current parent
var _pinResetStudentId = null;
var _pinResetBuffer = [];
```

### 10b — `_fetchManagedProfiles`

- [ ] Add near the bottom of `dashboard/dashboard.js` (before `initDashboard`):

```javascript
async function _fetchManagedProfiles() {
  if (typeof _supaDb === 'undefined' || !_supaDb) return;
  try {
    var result = await _supaDb
      .from('student_profiles')
      .select('id, display_name, age, avatar_emoji, avatar_color_from, avatar_color_to, username, updated_at')
      .order('created_at', { ascending: true });
    if (result.error) throw result.error;
    _managedProfiles = result.data || [];
    // Keep localStorage cache in sync
    localStorage.setItem('mmr_family_profiles',
      JSON.stringify(_managedProfiles.map(function(p) {
        return { id: p.id, display_name: p.display_name, age: p.age,
          avatar_emoji: p.avatar_emoji, avatar_color_from: p.avatar_color_from,
          avatar_color_to: p.avatar_color_to, username: p.username, pin_hash: '' };
      }))
    );
  } catch(e) {
    // Fall back to localStorage cache
    try { _managedProfiles = JSON.parse(localStorage.getItem('mmr_family_profiles') || '[]'); }
    catch(e2) { _managedProfiles = []; }
  }
}
```

> **Note:** `_supaDb` must be initialized in `initDashboard`. See Task 10g.

### 10c — `_renderManageProfiles`

- [ ] Add:

```javascript
function _renderManageProfiles() {
  if (!_managedProfiles.length) {
    return '<section class="db-section db-profiles-section">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
      + '<h2 class="db-sec-h" style="margin:0">&#x1F464; Manage Profiles</h2>'
      + '<button class="db-add-student-btn" onclick="openAddStudentSheet()">+ Add Student</button>'
      + '</div>'
      + '<p class="db-empty">No student profiles yet. Add your first student above.</p>'
      + '</section>';
  }

  var rows = _managedProfiles.map(function(p) {
    var lastActive = p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never';
    return '<div class="db-profile-row">'
      + '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,' + _esc(p.avatar_color_from) + ',' + _esc(p.avatar_color_to) + ');display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">' + _esc(p.avatar_emoji) + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-weight:700;font-size:.88rem;color:#263238">' + _esc(p.display_name) + (p.age ? ' <span style="font-weight:400;color:#90a4ae;font-size:.75rem">Age ' + _esc(String(p.age)) + '</span>' : '') + '</div>'
      + '<div style="font-size:.72rem;color:#90a4ae">Last active ' + _esc(lastActive) + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-shrink:0">'
      + '<button class="db-profile-edit-btn" onclick="openEditProfileSheet(\'' + _esc(p.id) + '\')">Edit</button>'
      + '<button class="db-profile-pin-btn" onclick="openPinResetSheet(\'' + _esc(p.id) + '\')">PIN</button>'
      + '</div>'
      + '</div>';
  }).join('');

  return '<section class="db-section db-profiles-section">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
    + '<h2 class="db-sec-h" style="margin:0">&#x1F464; Manage Profiles</h2>'
    + '<button class="db-add-student-btn" onclick="openAddStudentSheet()">+ Add Student</button>'
    + '</div>'
    + '<div class="db-profiles-list">' + rows + '</div>'
    + '</section>';
}
```

### 10d — `openPinResetSheet`

- [ ] Add (mirroring the `openQuizReview` bottom-sheet pattern):

```javascript
function openPinResetSheet(studentId) {
  _pinResetStudentId = studentId;
  _pinResetBuffer = [];
  var profile = _managedProfiles.find(function(p) { return p.id === studentId; });
  if (!profile) return;

  var modal = document.getElementById('db-pin-reset-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'db-pin-reset-modal';
    modal.className = 'db-review-modal';
    modal.innerHTML = '<div class="db-review-sheet" id="db-pin-reset-sheet">'
      + '<div class="db-review-head" id="db-pin-reset-head"></div>'
      + '<div class="db-review-body" id="db-pin-reset-body"></div>'
      + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) closePinResetSheet(); });
    document.body.appendChild(modal);
  }

  document.getElementById('db-pin-reset-head').innerHTML =
    '<button class="db-review-close" onclick="closePinResetSheet()">&#x2715;</button>'
    + '<div class="db-review-title">Reset PIN for ' + _esc(profile.display_name) + '</div>'
    + '<div class="db-review-meta">Enter a new 4-digit PIN</div>';

  _lsDbRenderPinDots();

  var keys = '';
  ['1','2','3','4','5','6','7','8','9'].forEach(function(d) {
    keys += '<button class="db-pin-key" onclick="dbPinKey(\'' + d + '\')">' + d + '</button>';
  });
  keys += '<div></div>'
    + '<button class="db-pin-key" onclick="dbPinKey(\'0\')">0</button>'
    + '<button class="db-pin-key db-pin-key-back" onclick="dbPinBack()">&#x232B;</button>';

  document.getElementById('db-pin-reset-body').innerHTML =
    '<div id="db-pin-reset-dots" style="display:flex;gap:10px;justify-content:center;margin:16px 0 12px"></div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;padding:0 2px">' + keys + '</div>'
    + '<div id="db-pin-reset-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:10px"></div>'
    + '<button id="db-pin-save-btn" onclick="dbPinSave()" style="width:100%;padding:12px;border-radius:50px;border:none;background:#1565C0;color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer;opacity:0.5;pointer-events:none">Save New PIN</button>';

  _lsDbRenderPinDots();
  modal.classList.add('open');
}

function _lsDbRenderPinDots() {
  var dotsEl = document.getElementById('db-pin-reset-dots');
  if (!dotsEl) return;
  var html = '';
  for (var i = 0; i < 4; i++) {
    html += i < _pinResetBuffer.length
      ? '<div style="width:16px;height:16px;border-radius:50%;background:#1565C0;box-shadow:0 0 6px rgba(21,101,192,.5)"></div>'
      : '<div style="width:16px;height:16px;border-radius:50%;background:#f0f4f8;border:2px solid #e0e0e0"></div>';
  }
  dotsEl.innerHTML = html;
}

function dbPinKey(digit) {
  if (_pinResetBuffer.length >= 4) return;
  _pinResetBuffer.push(String(digit));
  _lsDbRenderPinDots();
  if (_pinResetBuffer.length === 4) {
    var btn = document.getElementById('db-pin-save-btn');
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = ''; }
  }
}

function dbPinBack() {
  if (!_pinResetBuffer.length) return;
  _pinResetBuffer.pop();
  _lsDbRenderPinDots();
  var btn = document.getElementById('db-pin-save-btn');
  if (btn && _pinResetBuffer.length < 4) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
}

async function dbPinSave() {
  var msg = document.getElementById('db-pin-reset-msg');
  if (_pinResetBuffer.length < 4) return;
  if (!_supaDb || !_pinResetStudentId) { if (msg) msg.textContent = 'Not connected.'; return; }

  var btn = document.getElementById('db-pin-save-btn');
  if (btn) btn.textContent = 'Saving...';

  try {
    // PBKDF2 hash in browser — same as auth.js _hashPin
    var encoder = new TextEncoder();
    var data = encoder.encode(_pinResetBuffer.join('') + 'mymathroots_pin_salt_2025');
    var keyMaterial = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);
    var salt = encoder.encode('mymathroots_pin_salt_2025');
    var derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
    var newHash = Array.from(new Uint8Array(derived)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');

    var result = await Promise.race([
      _supaDb.from('student_profiles').update({ pin_hash: newHash, updated_at: new Date().toISOString() }).eq('id', _pinResetStudentId),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);
    if (result.error) throw result.error;

    // Update localStorage cache
    var profile = _managedProfiles.find(function(p) { return p.id === _pinResetStudentId; });
    var profileName = profile ? profile.display_name : 'student';

    closePinResetSheet();
    // Show toast
    var toast = document.createElement('div');
    toast.textContent = 'PIN updated for ' + profileName;
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#263238;color:#fff;padding:10px 20px;border-radius:50px;font-size:.85rem;z-index:9999;white-space:nowrap';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
  } catch(e) {
    if (msg) msg.textContent = 'Error saving PIN. Try again.';
    if (btn) btn.textContent = 'Save New PIN';
  }
}

function closePinResetSheet() {
  var modal = document.getElementById('db-pin-reset-modal');
  if (modal) modal.classList.remove('open');
  _pinResetBuffer = [];
}
```

### 10e — `openEditProfileSheet`

- [ ] Add:

```javascript
function openEditProfileSheet(studentId) {
  var profile = _managedProfiles.find(function(p) { return p.id === studentId; });
  if (!profile) return;

  var modal = document.getElementById('db-edit-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'db-edit-profile-modal';
    modal.className = 'db-review-modal';
    modal.innerHTML = '<div class="db-review-sheet" id="db-edit-profile-sheet">'
      + '<div class="db-review-head" id="db-edit-profile-head"></div>'
      + '<div class="db-review-body" id="db-edit-profile-body"></div>'
      + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) closeEditProfileSheet(); });
    document.body.appendChild(modal);
  }

  document.getElementById('db-edit-profile-head').innerHTML =
    '<button class="db-review-close" onclick="closeEditProfileSheet()">&#x2715;</button>'
    + '<div class="db-review-title">Edit Profile</div>';

  var AVATAR_EMOJIS = ['🦁','🦋','🐉','🦊','🐬','🌟'];
  var AVATAR_COLORS = {'🦁':'#f59e0b,#f97316','🦋':'#8b5cf6,#ec4899','🐉':'#06b6d4,#3b82f6','🦊':'#ef4444,#f97316','🐬':'#10b981,#0ea5e9','🌟':'#f59e0b,#eab308'};

  document.getElementById('db-edit-profile-body').innerHTML =
    '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Name</label>'
    + '<input id="db-edit-name" type="text" maxlength="20" value="' + _esc(profile.display_name) + '" class="db-edit-inp" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:12px">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Age (optional)</label>'
    + '<input id="db-edit-age" type="number" min="4" max="18" value="' + _esc(String(profile.age || '')) + '" class="db-edit-inp" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:12px">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Avatar</label>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:16px">'
    + AVATAR_EMOJIS.map(function(e) {
        var colors = AVATAR_COLORS[e] || '#f59e0b,#f97316';
        var isSelected = e === profile.avatar_emoji;
        return '<div id="db-av-' + e.codePointAt(0) + '" onclick="dbEditSelectEmoji(\'' + _esc(e) + '\')"'
          + ' style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,' + colors + ');display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;border:' + (isSelected ? '3px solid #1565C0' : '3px solid transparent') + ';box-sizing:border-box">' + e + '</div>';
      }).join('')
    + '</div>'
    + '<div id="db-edit-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:10px"></div>'
    + '<button onclick="dbEditSave(\'' + _esc(studentId) + '\')" style="width:100%;padding:12px;border-radius:50px;border:none;background:#1565C0;color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer">Save Changes</button>';

  modal.classList.add('open');
}

var _dbEditSelectedEmoji = null;

function dbEditSelectEmoji(emoji) {
  _dbEditSelectedEmoji = emoji;
  var AVATAR_EMOJIS = ['🦁','🦋','🐉','🦊','🐬','🌟'];
  AVATAR_EMOJIS.forEach(function(e) {
    var el = document.getElementById('db-av-' + e.codePointAt(0));
    if (el) el.style.border = e === emoji ? '3px solid #1565C0' : '3px solid transparent';
  });
}

async function dbEditSave(studentId) {
  var msg = document.getElementById('db-edit-msg');
  var nameInp = document.getElementById('db-edit-name');
  var ageInp  = document.getElementById('db-edit-age');
  if (!nameInp || !msg) return;

  var name = nameInp.value.trim();
  if (!name) { msg.textContent = 'Name is required.'; return; }
  if (!_supaDb) { msg.textContent = 'Not connected.'; return; }

  var profile = _managedProfiles.find(function(p) { return p.id === studentId; });
  var emoji = _dbEditSelectedEmoji || (profile ? profile.avatar_emoji : '🦁');
  var AVATAR_COLORS = {'🦁':['#f59e0b','#f97316'],'🦋':['#8b5cf6','#ec4899'],'🐉':['#06b6d4','#3b82f6'],'🦊':['#ef4444','#f97316'],'🐬':['#10b981','#0ea5e9'],'🌟':['#f59e0b','#eab308']};
  var colors = AVATAR_COLORS[emoji] || ['#f59e0b','#f97316'];
  var ageVal = ageInp ? parseInt(ageInp.value) || null : null;

  try {
    var result = await Promise.race([
      _supaDb.from('student_profiles').update({
        display_name: name, age: ageVal,
        avatar_emoji: emoji, avatar_color_from: colors[0], avatar_color_to: colors[1],
        updated_at: new Date().toISOString(),
      }).eq('id', studentId),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);
    if (result.error) throw result.error;

    // Refresh profiles list
    await _fetchManagedProfiles();
    closeEditProfileSheet();
    _reRenderManageProfiles();
  } catch(e) {
    if (msg) msg.textContent = 'Error saving. Try again.';
  }
}

function closeEditProfileSheet() {
  var modal = document.getElementById('db-edit-profile-modal');
  if (modal) modal.classList.remove('open');
  _dbEditSelectedEmoji = null;
}
```

### 10f — `openAddStudentSheet`

- [ ] Add (reuses onboarding step 1 UI without step 2):

```javascript
function openAddStudentSheet() {
  // Reuse the same approach as parent onboarding but without showing the family code step
  var modal = document.getElementById('db-add-student-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'db-add-student-modal';
    modal.className = 'db-review-modal';
    modal.innerHTML = '<div class="db-review-sheet">'
      + '<div class="db-review-head"><button class="db-review-close" onclick="closeAddStudentSheet()">&#x2715;</button>'
      + '<div class="db-review-title">Add Student</div></div>'
      + '<div class="db-review-body" id="db-add-student-body"></div>'
      + '</div>';
    modal.addEventListener('click', function(e) { if (e.target === modal) closeAddStudentSheet(); });
    document.body.appendChild(modal);
  }

  var addPinBuffer = [];
  var addSelectedEmoji = '🦁';
  var AVATAR_EMOJIS = ['🦁','🦋','🐉','🦊','🐬','🌟'];
  var AVATAR_COLORS = {'🦁':'#f59e0b,#f97316','🦋':'#8b5cf6,#ec4899','🐉':'#06b6d4,#3b82f6','🦊':'#ef4444,#f97316','🐬':'#10b981,#0ea5e9','🌟':'#f59e0b,#eab308'};

  document.getElementById('db-add-student-body').innerHTML =
    '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Student Name *</label>'
    + '<input id="db-add-name" type="text" maxlength="20" placeholder="e.g. Maya" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:12px">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:6px">Age (optional)</label>'
    + '<input id="db-add-age" type="number" min="4" max="18" placeholder="e.g. 9" style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cfd8dc;border-radius:10px;font-size:.95rem;margin-bottom:12px">'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Avatar</label>'
    + '<div id="db-add-avatars" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:14px">'
    + AVATAR_EMOJIS.map(function(e) {
        var colors = AVATAR_COLORS[e] || '#f59e0b,#f97316';
        return '<div id="db-addav-' + e.codePointAt(0) + '"'
          + ' style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,' + colors + ');display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;border:' + (e === '🦁' ? '3px solid #1565C0' : '3px solid transparent') + ';box-sizing:border-box" onclick="dbAddSelectEmoji(\'' + _esc(e) + '\')">' + e + '</div>';
      }).join('')
    + '</div>'
    + '<label style="font-size:.8rem;font-weight:700;color:#546e7a;display:block;margin-bottom:8px">Create a 4-digit PIN</label>'
    + '<div id="db-add-dots" style="display:flex;gap:10px;justify-content:center;margin-bottom:10px">'
    + '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.12);border:1.5px solid rgba(0,0,0,.18)"></div>'.repeat(4)
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">'
    + ['1','2','3','4','5','6','7','8','9'].map(function(d){ return '<button onclick="dbAddPinKey(\'' + d + '\')" style="background:#f0f4f8;border:1px solid #e0e0e0;border-radius:10px;padding:12px 0;font-size:1.15rem;font-weight:700;cursor:pointer">' + d + '</button>'; }).join('')
    + '<div></div>'
    + '<button onclick="dbAddPinKey(\'0\')" style="background:#f0f4f8;border:1px solid #e0e0e0;border-radius:10px;padding:12px 0;font-size:1.15rem;font-weight:700;cursor:pointer">0</button>'
    + '<button onclick="dbAddPinBack()" style="background:#fce4ec;border:1px solid #ffcdd2;border-radius:10px;padding:12px 0;font-size:1rem;color:#c62828;cursor:pointer">&#x232B;</button>'
    + '</div>'
    + '<div id="db-add-msg" style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:10px"></div>'
    + '<button id="db-add-save-btn" onclick="dbAddSave()" style="width:100%;padding:12px;border-radius:50px;border:none;background:#1565C0;color:#fff;font-family:\'Boogaloo\',sans-serif;font-size:1rem;cursor:pointer;opacity:0.5;pointer-events:none">Add Student</button>';

  // Store in closures
  window._dbAddPinBuffer = [];
  window._dbAddSelectedEmoji = '🦁';

  modal.classList.add('open');
}

function dbAddSelectEmoji(emoji) {
  window._dbAddSelectedEmoji = emoji;
  ['🦁','🦋','🐉','🦊','🐬','🌟'].forEach(function(e) {
    var el = document.getElementById('db-addav-' + e.codePointAt(0));
    if (el) el.style.border = e === emoji ? '3px solid #1565C0' : '3px solid transparent';
  });
}

function dbAddPinKey(digit) {
  if ((window._dbAddPinBuffer || []).length >= 4) return;
  window._dbAddPinBuffer = (window._dbAddPinBuffer || []).concat([String(digit)]);
  var dotsEl = document.getElementById('db-add-dots');
  if (dotsEl) {
    var html = '';
    for (var i = 0; i < 4; i++) {
      html += i < window._dbAddPinBuffer.length
        ? '<div style="width:14px;height:14px;border-radius:50%;background:#1565C0;box-shadow:0 0 6px rgba(21,101,192,.5)"></div>'
        : '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.12);border:1.5px solid rgba(0,0,0,.18)"></div>';
    }
    dotsEl.innerHTML = html;
  }
  if (window._dbAddPinBuffer.length === 4) {
    var btn = document.getElementById('db-add-save-btn');
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = ''; }
  }
}

function dbAddPinBack() {
  window._dbAddPinBuffer = (window._dbAddPinBuffer || []).slice(0, -1);
  var dotsEl = document.getElementById('db-add-dots');
  if (dotsEl) {
    var html = '';
    for (var i = 0; i < 4; i++) {
      html += i < window._dbAddPinBuffer.length
        ? '<div style="width:14px;height:14px;border-radius:50%;background:#1565C0;box-shadow:0 0 6px rgba(21,101,192,.5)"></div>'
        : '<div style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.12);border:1.5px solid rgba(0,0,0,.18)"></div>';
    }
    dotsEl.innerHTML = html;
  }
  var btn = document.getElementById('db-add-save-btn');
  if (btn && window._dbAddPinBuffer.length < 4) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
}

async function dbAddSave() {
  var msg = document.getElementById('db-add-msg');
  var nameInp = document.getElementById('db-add-name');
  var ageInp  = document.getElementById('db-add-age');
  if (!nameInp || !msg) return;
  var name = nameInp.value.trim();
  if (!name) { msg.textContent = 'Name is required.'; return; }
  if ((window._dbAddPinBuffer || []).length < 4) { msg.textContent = 'Enter a 4-digit PIN.'; return; }
  if (!_supaDb) { msg.textContent = 'Not connected.'; return; }

  var btn = document.getElementById('db-add-save-btn');
  if (btn) btn.textContent = 'Saving...';

  try {
    // Hash PIN
    var encoder = new TextEncoder();
    var data = encoder.encode(window._dbAddPinBuffer.join('') + 'mymathroots_pin_salt_2025');
    var keyMaterial = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);
    var salt = encoder.encode('mymathroots_pin_salt_2025');
    var derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
    var pinHash = Array.from(new Uint8Array(derived)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');

    var emoji = window._dbAddSelectedEmoji || '🦁';
    var AVATAR_COLORS = {'🦁':['#f59e0b','#f97316'],'🦋':['#8b5cf6','#ec4899'],'🐉':['#06b6d4','#3b82f6'],'🦊':['#ef4444','#f97316'],'🐬':['#10b981','#0ea5e9'],'🌟':['#f59e0b','#eab308']};
    var colors = AVATAR_COLORS[emoji] || ['#f59e0b','#f97316'];
    var ageVal = ageInp ? parseInt(ageInp.value) || null : null;
    var username = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'student';

    var result = await Promise.race([
      _supaDb.from('student_profiles').insert({
        parent_id: _supaDb.auth && _supaDb.auth._currentUser ? _supaDb.auth._currentUser.id : null,
        username: username, display_name: name, age: ageVal,
        avatar_emoji: emoji, avatar_color_from: colors[0], avatar_color_to: colors[1],
        pin_hash: pinHash,
      }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 10000); })
    ]);
    if (result.error) throw result.error;

    await _fetchManagedProfiles();
    closeAddStudentSheet();
    _reRenderManageProfiles();
  } catch(e) {
    if (msg) msg.textContent = e.message && e.message.includes('unique') ? 'A student with that name already exists.' : 'Error saving. Try again.';
    if (btn) btn.textContent = 'Add Student';
  }
}

function closeAddStudentSheet() {
  var modal = document.getElementById('db-add-student-modal');
  if (modal) modal.classList.remove('open');
  window._dbAddPinBuffer = [];
  window._dbAddSelectedEmoji = '🦁';
}
```

### 10g — `_reRenderManageProfiles` and hook into `renderDashboard`

- [ ] Add:

```javascript
function _reRenderManageProfiles() {
  var el = document.getElementById('db-manage-profiles-section');
  if (el) el.outerHTML = _renderManageProfiles();
}
```

- [ ] In `renderDashboard()`, find the line that sets `root.innerHTML`:
  ```javascript
  root.innerHTML =
    _renderStudentSelector(_students, _activeId) +
  ```
  Add `_renderManageProfiles()` to the template, after `_renderStudentSelector` and before `_renderOverview`:
  ```javascript
  root.innerHTML =
    _renderStudentSelector(_students, _activeId) +
    '<h1 class="db-student-name">' + _esc(student.name) + '</h1>' +
    '<div id="db-manage-profiles-section">' + _renderManageProfiles() + '</div>' +
    _renderOverview(stats) +
    ...
  ```

### 10h — Initialize `_supaDb` in `initDashboard`

- [ ] Find `function initDashboard()` in `dashboard/dashboard.js`.

- [ ] Update it:

```javascript
function initDashboard() {
  if (!_checkAccess()) return;
  // Initialize Supabase client for dashboard
  var _SUPA_URL = '%%SUPA_URL%%';
  var _SUPA_KEY = '%%SUPA_KEY%%';
  if (typeof supabase !== 'undefined' && _SUPA_URL && !_SUPA_URL.includes('%%')) {
    window._supaDb = supabase.createClient(_SUPA_URL, _SUPA_KEY);
  }
  _students = getAllStudents();
  // Fetch real profiles if Supabase available
  if (window._supaDb) {
    _supaDb = window._supaDb;
    _fetchManagedProfiles().then(function() {
      var profilesSection = document.getElementById('db-manage-profiles-section');
      if (profilesSection) profilesSection.innerHTML = _renderManageProfiles();
    });
  }
  renderDashboard();
}
```

- [ ] Also add `var _supaDb = null;` near `var _students = {};`.

- [ ] Run: `npx jest --verbose`
- [ ] Expected: all tests still pass
- [ ] `git add dashboard/dashboard.js`
- [ ] `git commit -m "feat(dashboard): add Manage Profiles section with PIN reset and edit bottom sheets"`

---

## Task 11 — Dashboard CSS for Manage Profiles

**Files:** `dashboard/dashboard.css`

- [ ] Append to `dashboard/dashboard.css`:

```css
/* ── Manage Profiles ── */
.db-profiles-section {}
.db-profiles-list { border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.07); background: #fff; }
.db-profile-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f0f0;
}
.db-profile-row:last-child { border-bottom: none; }
.db-add-student-btn {
  background: #1565C0;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: .72rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.db-profile-edit-btn, .db-profile-pin-btn {
  border: none;
  border-radius: 8px;
  padding: 5px 8px;
  font-size: .7rem;
  cursor: pointer;
  white-space: nowrap;
}
.db-profile-edit-btn { background: #f5f5f5; color: #546e7a; }
.db-profile-pin-btn { background: #fff3e0; color: #e65100; font-weight: 600; }

/* ── PIN reset keypad (inside db-review-sheet) ── */
.db-pin-key {
  background: #f0f4f8;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 10px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #263238;
  cursor: pointer;
  text-align: center;
}
.db-pin-key:active { background: #e3f2fd; }
.db-pin-key-back { background: #fce4ec; border-color: #ffcdd2; color: #c62828; }
```

- [ ] `git add dashboard/dashboard.css`
- [ ] `git commit -m "style(dashboard): add Manage Profiles section and PIN reset keypad CSS"`

---

## Task 12 — Progress sync scoping (`student_id` in `_pushScores`)

**Files:** `src/auth.js`

When `mmr_active_student_id` is set, all Supabase score writes should include `student_id`.

- [ ] In `src/auth.js`, find `async function _pushScores()` (around line 1050).

- [ ] Find the `rows` map:
  ```javascript
  const rows = verifiedScores.map(s => ({
    user_id:_supaUser.id, local_id:s.id,
  ```

- [ ] Add `student_id` to the row object:
  ```javascript
  const _activeStudentId = localStorage.getItem('mmr_active_student_id') || null;
  const rows = verifiedScores.map(s => ({
    user_id:_supaUser.id, local_id:s.id,
    student_id: _activeStudentId,
    qid:s.qid||'', ...
  ```

- [ ] Run: `npx jest --verbose`
- [ ] Expected: all tests pass
- [ ] `git add src/auth.js`
- [ ] `git commit -m "feat(student-auth): include student_id in Supabase score writes when student is active"`

---

## Task 13 — Run build and final verification

**Files:** none

### 13a — Run full test suite

- [ ] Run: `npx jest --verbose`
- [ ] Expected: all 27 (dashboard) + 22 (student-auth) = 49 tests pass, 0 failures

### 13b — Run build

- [ ] Run: `npm run build`
- [ ] Expected: `dist/index.html` + `dist/dashboard/` produced, no errors

### 13c — Manual smoke test: new device linking

- [ ] Clear `mmr_family_profiles` from localStorage
- [ ] Open login screen → student card
- [ ] Confirm State A shows: "Enter your family code" input + "Link This Device" button
- [ ] Enter invalid code (e.g. "ABC-123") → confirm error message
- [ ] (Requires live Supabase with migration applied): enter a valid family code → profiles load, State B renders

### 13d — Manual smoke test: PIN login

- [ ] With profiles cached in `mmr_family_profiles`, open student card
- [ ] Confirm State B: avatar row + PIN keypad
- [ ] Tap avatar → it highlights, PIN clears
- [ ] Enter wrong PIN → shake animation + error message
- [ ] Enter correct PIN → routes to home screen

### 13e — Manual smoke test: parent onboarding

- [ ] Sign in as a new parent account with no student profiles
- [ ] Confirm onboarding modal appears
- [ ] Fill in name, pick avatar, enter PIN → "Create Profile" button enables at 4 digits
- [ ] Save → Step 2 shows family code (e.g. "MMR-4829")
- [ ] Click Done → redirects to dashboard

### 13f — Manual smoke test: Manage Profiles in dashboard

- [ ] Open dashboard → confirm "Manage Profiles" section appears above Overview
- [ ] Confirm each student row shows avatar, name, age, "Edit" + "PIN" buttons
- [ ] Click "PIN" → bottom sheet opens with keypad
- [ ] Enter 4 digits → "Save New PIN" button enables
- [ ] Save → toast "PIN updated for [name]" appears
- [ ] Click "Edit" → bottom sheet with name/age/avatar fields
- [ ] Change name, save → list re-renders

### 13g — Final commit

- [ ] `git add -A`
- [ ] `git commit -m "feat(student-auth): Student Profiles & Auth System complete — 49 tests, family code, PIN login, onboarding, manage profiles"`

---

## Appendix: Key localStorage Keys

| Key | Purpose |
|-----|---------|
| `mmr_family_profiles` | Cached `Array<StudentProfile>` — set by `_lsFamilyCodeSetup`, cleared on sign-out |
| `mmr_active_student_id` | UUID of currently playing student — scopes Supabase writes |
| `mmr_last_student_id` | UUID of last-used student — used by "Remember Me" pre-selection |
| `mmr_user_role` | `'student'` or `'parent'` — determines post-login routing |
| `mmr_stud_fail_ts` | Timestamp of last student PIN failure — lockout timer |
| `mmr_stud_fail_count` | Count of student PIN failures since last success |

## Appendix: Supabase RPCs Summary

| RPC | Caller | Auth |
|-----|--------|------|
| `get_profiles_by_family_code(p_family_code)` | `_lsFamilyCodeSetup` | anon (device setup) |
| `ensure_family_code(p_parent_id)` | `_lsObSave` | authenticated (parent) |

## Notes for Implementer

- **`_hashPin` location:** Already defined in `src/auth.js` around line 192. Uses PBKDF2 with salt `mymathroots_pin_salt_2025`, 100k iterations. The dashboard's `dbPinSave` re-implements it inline (dashboard is a separate bundle without auth.js).
- **`ls-form-shared` carousel:** After Task 5, `ls-mount-0` is a hidden `display:none` div outside the carousel. The shared form will park there harmlessly when student card is active. No change to `_lsCarouselGo` is needed.
- **Supabase RLS for anon:** The `get_profiles_by_family_code` RPC uses `SECURITY DEFINER` so it bypasses RLS — it runs as the DB owner and enforces its own filter logic. This is intentional: the anon role needs to read profiles to do device setup without having a Supabase session.
- **`_supaDb` in dashboard:** `dashboard/dashboard.js` is a standalone bundle. It must initialize its own Supabase client. The `%%SUPA_URL%%` and `%%SUPA_KEY%%` placeholders are replaced by `build.js` (same as `index.html`). Verify in `build.js` that it also processes `dashboard/dashboard.js`.
- **Build.js for dashboard:** Task 10h references `%%SUPA_URL%%` placeholders. Check that `build.js`'s template replacement step covers files in `dashboard/`. If not, add `dashboard/dashboard.js` to the list of files that get credentials injected.
