# Student Profiles & Auth System Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the single-user student login with a family-based system — parents own the account, children log in with a username + 4-digit PIN on any device using a family code.

**Architecture:** Parent holds a Supabase auth account (unchanged). Student profiles are database records linked to the parent. Children never have their own email/Supabase identity. Cross-device sync works because all progress writes use the parent's auth token scoped to a `student_id`. The student login card becomes an avatar picker + on-screen PIN keypad; the parent card is unchanged.

---

## Decisions Made

| Question | Decision |
|---|---|
| Student auth model | Child profiles under parent account (no Supabase auth for students) |
| Multi-child | Yes — one parent can have multiple student profiles |
| New device linking | Family code (e.g. `MMR-4829`) entered once on first visit |
| Student login UI | Avatar picker → big on-screen PIN keypad (game-style) |
| Manage Profiles UI | Compact list + bottom-sheet PIN reset (matches existing quiz review pattern) |
| Visual style | Frosted glass (matches current login card: `rgba(255,255,255,0.13)`, `blur(28px)`) |

---

## Database Schema

### New table: `student_profiles`

```sql
CREATE TABLE student_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username          TEXT NOT NULL,
  display_name      TEXT NOT NULL,
  age               INTEGER,
  avatar_emoji      TEXT NOT NULL DEFAULT '🦁',
  avatar_color_from TEXT NOT NULL DEFAULT '#f59e0b',
  avatar_color_to   TEXT NOT NULL DEFAULT '#f97316',
  pin_hash          TEXT NOT NULL,  -- PBKDF2 (100k iterations), same algo as current parent PIN
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, username)
);

-- RLS: parent can read/write their own children
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_owns_profiles" ON student_profiles
  USING (parent_id = auth.uid());

-- Anon read by family_code join (for device setup) — see profiles table below
```

### Modified table: `profiles` (existing)

Add one column:

```sql
ALTER TABLE profiles ADD COLUMN family_code TEXT UNIQUE;
```

- Generated on first `student_profiles` insert for a parent: `'MMR-' || upper(substring(gen_random_uuid()::text, 1, 4))`
- Shown to parent after onboarding; child enters it once on a new device
- Anon SELECT allowed on `profiles(family_code, id)` only — no other fields exposed

```sql
CREATE POLICY "anon_family_code_lookup" ON profiles
  FOR SELECT TO anon
  USING (true)  -- filtered by family_code in the query; only id + family_code columns projected
```

### Modified table: `student_progress` (existing)

Add one column:

```sql
ALTER TABLE student_progress ADD COLUMN student_id UUID REFERENCES student_profiles(id);
```

- `NULL` = legacy record (pre-feature, parent as sole user)
- All new writes include `student_id`
- RLS: existing `parent_id = auth.uid()` policy covers children (progress writes use parent token)

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| MODIFY | `index.html` | Student card: avatar picker + PIN keypad + family code state |
| MODIFY | `src/auth.js` | `_lsStudentLogin()`, `_lsFamilyCodeSetup()`, post-signup onboarding trigger |
| MODIFY | `src/events.js` | Register `_lsStudentLogin`, `_lsFamilyCodeSetup`, `_lsSelectAvatar` |
| MODIFY | `src/styles.css` | PIN keypad button styles (`.ls-pin-key`), avatar picker styles (`.ls-avatar-row`) |
| MODIFY | `dashboard/dashboard.js` | `_renderManageProfiles()`, `openPinResetSheet()`, `openEditProfileSheet()`, `addStudentProfile()` |
| MODIFY | `dashboard/dashboard.css` | Manage profiles section, bottom-sheet PIN reset |
| CREATE | `supabase/migrations/YYYYMMDD_student_profiles.sql` | All schema changes above |

---

## Section 1 — Student Login Card

The student card (`.ls-card#ls-card-0`) has **two states** controlled by whether `localStorage.mmr_family_profiles` is set.

### State A — New Device (no cached profiles)

HTML structure:
```
[star SVG icon]
[title: "Student"]
[subtitle: "Sign in to track your progress"]
[divider]
[label: "Enter your family code"]
[text input: placeholder "MMR-0000", uppercase, centered, letter-spacing]
[button: "Link This Device"  data-action="_lsFamilyCodeSetup"]
```

On submit (`_lsFamilyCodeSetup`):
1. Validate input matches `/^MMR-[A-Z0-9]{4}$/i`
2. Query Supabase: `SELECT sp.id, sp.username, sp.display_name, sp.age, sp.avatar_emoji, sp.avatar_color_from, sp.avatar_color_to, sp.pin_hash FROM student_profiles sp JOIN profiles p ON p.id = sp.parent_id WHERE p.family_code = $1`
3. On success: store result in `localStorage.mmr_family_profiles` (JSON array)
4. Transition to State B (re-render card)
5. On error: show inline error "Family code not found — check with your parent"

### State B — Known Device (profiles cached)

HTML structure:
```
[star SVG icon]
[title: "Student"]
[subtitle: "Sign in to track your progress"]
[divider]
[label: "Who's playing?"]
[avatar row: one circle per student profile]
  [selected: gold ring, full opacity]
  [unselected: 70% opacity, no ring]
[divider]
[label: "{selectedName}'s PIN"]
[PIN dots: 4 circles, filled gold on entry]
[3×4 keypad: 1–9, 0, ⌫  — glass buttons]
["New device? Enter family code →"  small link]
```

Avatar selection (`_lsSelectAvatar(studentId)`):
- Highlights selected avatar, clears PIN dots
- Stores selected student in component state variable `_lsSelectedStudentId`

PIN entry:
- Digits accumulate in `_lsPinBuffer` (max 4)
- On 4th digit: call `_lsStudentLogin()`
- Backspace: pops last digit, updates dots

`_lsStudentLogin()`:
1. PBKDF2-hash `_lsPinBuffer` with salt `mymathroots_pin_salt_2025` (matches existing `_hashPin`)
2. Compare against `profile.pin_hash` from cached `mmr_family_profiles`
3. **Match:**
   - Set `localStorage.mmr_active_student_id = profile.id`
   - If "Remember me" checked: set `localStorage.mmr_last_student_id = profile.id`
   - Set `localStorage.mmr_user_role = 'student'`
   - Call existing `_pullOnLogin()` with student scope, route to `show('home')`
4. **No match:**
   - Shake animation on PIN dots
   - Clear `_lsPinBuffer`, reset dots
   - Increment fail counter (same `_PIN_FAIL_KEY` logic as existing parent PIN — 5 attempts, 30s lockout)

"Remember me": on return visit, pre-select avatar matching `mmr_last_student_id` (avatar ring shown, focus jumps straight to PIN keypad).

### Visual Style

Matches existing login card exactly:
- Card background: `rgba(255,255,255,0.13)`, `backdrop-filter: blur(28px)`
- Border: `1.5px solid rgba(255,255,255,0.40)` top, lighter on sides/bottom
- Keypad buttons: `background: rgba(255,255,255,0.12)`, `border: 1px solid rgba(255,255,255,0.18)`, `border-radius: 12px`
- Backspace button: `rgba(255,255,255,0.07)` background, dimmer
- PIN dots (filled): `#f59e0b` with `box-shadow: 0 0 8px rgba(245,158,11,0.7)`
- PIN dots (empty): `rgba(255,255,255,0.2)` with white border
- Avatar selected ring: `border: 2.5px solid rgba(255,255,255,0.85)` + `box-shadow: 0 0 0 3px rgba(color,0.45)`
- Text: `#fff` headings, `rgba(255,255,255,0.72)` subtitles, `rgba(255,255,255,0.55)` labels

---

## Section 2 — Parent Onboarding

Triggered in `src/auth.js` `_pullOnLogin()` when:
- `mmr_user_role === 'parent'`
- Query `student_profiles` count for this parent = 0

Shows a modal (not a route change) with steps:

**Step 1 — Add first student:**
```
Title: "Set up your first student profile"
- Name input (required, max 20 chars)
- Age input (optional, number, 4–18)
- Avatar picker: 6 emoji options in a row
  (🦁 🦋 🐉 🦊 🐬 🌟 — tappable circles, selected gets gold ring)
- PIN keypad (same glass style)
- [Create Profile] button
```

On save:
1. PBKDF2-hash the PIN
2. INSERT into `student_profiles`
3. If `profiles.family_code` is NULL: generate and UPDATE it
4. Advance to Step 2

**Step 2 — Family code reveal:**
```
Title: "Your family code"
Large display: "MMR-4829"
Subtitle: "Enter this code once on your child's device to link it"
[Done] button → dismisses modal, routes to dashboard
```

Additional students can be added anytime via Dashboard → Manage Profiles.

---

## Section 3 — Dashboard: Manage Profiles

New section in `dashboard/dashboard.js`, rendered via `_renderManageProfiles()`, inserted after the student selector and before the analytics sections.

### List View

```
[section header: "👤 Manage Profiles"  |  [+ Add Student] button]
[for each student profile:]
  [avatar circle] [name + age + "last active X"] [Edit] [PIN]
```

Data source: `localStorage.mmr_family_profiles` (already cached on device) + fresh fetch on dashboard init.

### PIN Reset (bottom sheet)

Same pattern as existing quiz review bottom-sheet (`db-review-modal` / `db-review-sheet`):

```
[drag handle]
[title: "Reset PIN for Cameron"]
[subtitle: "Enter a new 4-digit PIN"]
[4 PIN cells — white background, blue active border]
[3×4 keypad]
[Save New PIN] button — disabled until 4 digits entered
[Cancel]
```

`openPinResetSheet(studentId)`:
1. Show bottom sheet, render keypad
2. On 4 digits: enable Save button
3. On Save: PBKDF2-hash new PIN, UPDATE `student_profiles.pin_hash` via parent's Supabase token
4. Update `mmr_family_profiles` cache
5. Close sheet, show success toast "PIN updated for Cameron"

### Edit Profile (bottom sheet)

Same bottom-sheet, different content:
```
[name input — prefilled]
[age input — prefilled]
[avatar picker row — 6 options]
[Save Changes] button
```

On save: UPDATE `student_profiles`, refresh cache and re-render list.

### Add Student

Tapping "+ Add Student" opens the same 2-step flow from Parent Onboarding (Step 1 only — family code already exists, skip Step 2).

---

## Section 4 — Data Sync & Scoping

When a student is active (`mmr_active_student_id` set), all Supabase progress writes in `src/auth.js` include `student_id`:

```javascript
// _pushScores — add student_id to upsert payload
{ user_id: _supaUser.id, student_id: _activeStudentId, ... }
```

The dashboard `_readLocalStudentData()` is already abstracted behind `getStudentData(id)` — the dashboard fetches from Supabase filtered by `student_id` when viewing a cloud-backed student, falling back to localStorage for the "local" demo students.

**Multi-device scenario:**
- iPad: student logs in via family code + PIN → progress writes to Supabase with `student_id`
- Parent laptop: dashboard fetches `student_progress WHERE student_id = X` → sees real-time data

---

## Out of Scope

- Student-to-student messaging
- Parent approval flow for new device links (family code is the trust mechanism)
- PIN recovery for students (parent resets via dashboard)
- Age-based content filtering (separate feature)
