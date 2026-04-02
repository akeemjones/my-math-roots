# UI/UX Parity Sprint — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Achieve 1:1 visual parity between the legacy vanilla JS build (`dist/`) and the SvelteKit build (`app/`) by porting exact legacy class names and CSS into each remaining screen.

**Architecture:** Screen-by-screen port. For each component: (1) replace scoped HTML class names with legacy class names, (2) remove the scoped `<style>` block, (3) add the extracted legacy CSS to `app/src/app.css` under a labeled section. Svelte logic, stores, routing, and event handlers are never changed.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes), plain CSS in `app/src/app.css`

---

## File Map

| File | Change |
|------|--------|
| `app/src/app.css` | Add 5 new labeled CSS sections (quiz, results, unit, lesson, dashboard) |
| `app/src/lib/components/quiz/QuizEngine.svelte` | Replace template class names + remove `<style>` block |
| `app/src/lib/components/quiz/QuizResults.svelte` | Replace template class names + remove `<style>` block |
| `app/src/routes/unit/[id]/+page.svelte` | Replace template class names + remove `<style>` block |
| `app/src/routes/lesson/[id]/+page.svelte` | Replace template class names + remove `<style>` block |
| `app/src/routes/dashboard/+layout.svelte` | Replace template class names + remove `<style>` block |
| `app/src/routes/dashboard/+page.svelte` | Replace template class names + remove `<style>` block |
| `app/src/lib/components/dashboard/OverallStats.svelte` | Replace template class names + remove `<style>` block |
| `app/src/lib/components/dashboard/QuizHistory.svelte` | Replace template class names + remove `<style>` block |
| `app/src/lib/components/dashboard/MasteryGrid.svelte` | Replace template class names + remove `<style>` block |
| `app/src/routes/+layout.svelte` | Add `class:dark={$a11y.darkMode}` to `<body>` via `$effect` |

---

## CSS Reference: Legacy Class Names

These are the actual class names from `src/styles.css` that each SvelteKit class maps to:

### Quiz / Results
| SvelteKit class | Legacy class |
|-----------------|-------------|
| `.engine` (wrapper) | `.sc` (use `<div class="sc">`) |
| `.progress-bar` | `.qpb` |
| `.progress-fill` | `.qpbf` |
| `.quiz-header` | `.qhdr` + `.qmeta` |
| `.quit-btn` | `.quiz-quit-btn` |
| `.q-label` | `.q-lbl` |
| `.score-chip` | `.q-score` |
| `.q-card` | `.qcard` |
| `.q-text` | keep as `.q-text` (style with `.qcard p`) |
| `.q-visual` | keep as `.q-visual` |
| `.answer-grid` | `.agrid` |
| `.answer-btn` | `.abtn` |
| `.answer-btn.correct` | `.abtn.correct` |
| `.answer-btn.wrong` | `.abtn.wrong` |
| `.reveal` | `.reveal` (same name!) |
| `.reveal-header` | `.rev-h` |
| `.reveal-correct` | `.rev-correct` |
| `.reveal-exp` | `.rev-exp` |
| `.nav-row` | `.quiz-nav-row` |
| `.nav-btn.primary` | `.next-btn` |
| `.nav-btn.secondary` | `.prev-btn` |
| `.results` (wrapper) | `.sc` |
| `.hero` | `.rcard` |
| `.hero-emoji` | `.r-emoji` |
| `.score` | `.r-score` |
| `.stars` | `.r-stars` |
| `.msg` | `.r-msg` |
| `.actions` | `.rbtn-row` |
| `.btn` | `.rbtn` |

### Unit Detail
| SvelteKit class | Legacy class |
|-----------------|-------------|
| `.screen` (wrapper) | `.sc` |
| `.unit-header` | `.unit-banner` |
| `.back` | `.bar-back` (inside `.bar`) |
| `.unit-icon` | `.unit-ico` |
| `.teks` | `.unit-teks` |
| `.lessons` | `.lesson-glass-wrap` |
| `.lesson-list` | `.lcard-grid` |
| LessonRow component | `.lcard` structure inline |

### Lesson
| SvelteKit class | Legacy class |
|-----------------|-------------|
| `.screen` (wrapper) | `.sc` |
| `.lesson-header` | `.bar` + `.les-teks-bar` |
| `.back` | `.bar-back` |
| `.content` | `.sc-in` |
| `.card` (key points) | `.lesson-glass-wrap` |
| `.points` list | `.kp-list` |
| `li` in points | `.kp` |
| `.examples` | `.ex-list` |
| `.example` | `.ex-card` with `.ex-list` item |
| `.ex-tag` | `.ex-tag` (same) |
| `.ex-problem` | `.ex-problem` |
| `.ex-solution` | `.ex-steps` |
| `.ex-answer` | `.ex-answer` |
| `.practice-list` | `.prac-list` |
| `.practice-item` | `.prac-item` |
| `.practice-q` | `.prac-q` |
| `.reveal-btn` | `.prac-reveal-btn` |
| `.quiz-cta` | `.lesson-footer` (bottom action area) |
| `.quiz-btn` | `.next-lesson-btn` |

### Dashboard
| SvelteKit class | Legacy class |
|-----------------|-------------|
| `.dashboard-shell` | `.dash-shell` |
| `.dash-header` | `.dash-hdr` |
| `.back-btn` | `.dash-back-btn` |
| `.brand` | `.dash-brand` |
| `.student-switcher` | `.dash-pill-row` |
| `.student-pill` | `.dash-pill` |
| `.student-banner` | `.dash-student-banner` |
| `.stats-grid` | `.stat-grid` |
| `.stat-chip` | `.stat-tile` |
| `.chip-value` | `.stat-num` |
| `.chip-label` | `.stat-lbl` |
| `.history-card` | `.qh-card` |
| `.history-list` | `.qh-list` |
| `.history-row` | `.qh-row` |
| `.mastery-card` | `.mg-card` |
| `.grid-table` | `.mg-grid` |
| `.grid-row` | `.mg-row` |
| `.lesson-cells` | `.mg-cells` |
| `.lesson-cell` | `.mg-cell` |

---

## Task 1: Add CSS Sections to app.css

**Files:**
- Modify: `app/src/app.css`

All new CSS goes at the bottom of `app/src/app.css`, in labeled sections. Run once before touching any component.

- [ ] **Step 1: Append quiz + results CSS to app/src/app.css**

Open `app/src/app.css` and append at the bottom:

```css
/* ── QUIZ SCREEN ─────────────────────────────── */
.sc-in{
  max-width:780px; margin:0 auto; width:100%; padding:20px 16px env(safe-area-inset-bottom);
  display:flex; flex-direction:column; }

.qhdr{ background:rgba(255,255,255,.40);
        border:1px solid rgba(255,255,255,.25); border-radius:var(--rad); padding:12px 16px;
        margin-bottom:10px; box-shadow:var(--shad); }
.qmeta{ display:flex; justify-content:space-between; align-items:center;
         flex-wrap:wrap; gap:8px; margin-bottom:10px; }
.q-lbl{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-base); }
.q-score{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-base);
           padding:6px 16px; border-radius:50px; background:rgba(255,255,255,.5); }
.qpb{ height:14px; background:rgba(0,0,0,.08); border-radius:50px; overflow:hidden; }
.qpbf{ height:100%; border-radius:50px; transition:width .4s; }

.qcard{ background:rgba(255,255,255,.40);
        border:1px solid rgba(255,255,255,.25); border-radius:var(--rad); padding:16px 18px;
        box-shadow:var(--shad); margin-bottom:12px; }
.qcard .q-text{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-lg);
  color:var(--txt); line-height:1.4; margin:0 0 14px; }
.qcard .q-visual{ margin:0 0 14px; }
.qcard .q-visual svg{ max-width:100%; height:auto; display:block; margin:0 auto; }

.agrid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.abtn{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-lg);
        padding:16px 12px; border-radius:16px;
        background:rgba(255,255,255,0.94);
        border-top:1.5px solid rgba(255,255,255,.92);
        border-left:1.5px solid rgba(255,255,255,.72);
        border-right:1.5px solid rgba(255,255,255,.28);
        border-bottom:1.5px solid rgba(255,255,255,.28);
        cursor:pointer; color:var(--txt); text-align:center;
        transition:transform .12s, border-color .15s, background .15s;
        box-shadow:0 6px 18px rgba(0,0,0,.10), inset 0 1.5px 0 rgba(255,255,255,.98);
        touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
.abtn:hover:not(:disabled){ transform:translateY(-2px); background:rgba(255,255,255,.98); }
.abtn:active:not(:disabled){ transform:scale(0.97); }
.agrid .abtn.correct{ background:rgba(39,174,96,.15); border-color:#27ae60; color:#1a6e3c; }
.agrid .abtn.wrong{ background:rgba(231,76,60,.15); border-color:#e74c3c; color:#a93226; }
.agrid .abtn:disabled{ cursor:default; transform:none; }

.reveal{ border-radius:14px; padding:10px 14px; margin-top:10px; }
.reveal.ok{ background:rgba(39,174,96,.12); border:2.5px solid #27ae60; }
.reveal.no{ background:rgba(231,76,60,.12); border:2.5px solid #e74c3c; }
.rev-h{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-md); margin-bottom:4px; }
.rev-h.ok{ color:#1a6e3c; }
.rev-h.no{ color:#a93226; }
.rev-correct{ font-size:var(--fs-base); font-weight:900; color:#27ae60; margin-bottom:3px; }
.rev-exp{ font-size:var(--fs-base); line-height:1.5; color:var(--txt); }
.rev-tip{ margin-top:6px; font-size:var(--fs-sm); color:#7b4f12;
  background:rgba(255,193,7,.18); border-radius:8px; padding:6px 10px; }
.rev-time{ margin-top:4px; font-size:var(--fs-sm); color:var(--txt2); }

.hint-btn-legacy{ align-self:flex-start; background:none;
  border:1.5px solid var(--color-primary,#6c5ce7);
  color:var(--color-primary,#6c5ce7); border-radius:8px;
  padding:5px 14px; font-size:var(--fs-sm); font-weight:600; cursor:pointer;
  font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; margin-top:6px; }

.quiz-nav-row{ display:flex; align-items:center; margin-top:12px; gap:8px; }
.quiz-quit-btn{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-base);
  background:transparent; border:2px solid rgba(231,76,60,.35);
  color:#e74c3c; cursor:pointer; padding:7px 18px; border-radius:50px;
  touch-action:manipulation; -webkit-tap-highlight-color:transparent;
  transition:background .15s, transform .1s; }
.quiz-quit-btn:hover{ background:rgba(231,76,60,.06); }
.quiz-quit-btn:active{ transform:scale(.95); }
.next-btn{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-md);
  flex:1; padding:14px; border-radius:50px; border:none; cursor:pointer; color:#fff;
  box-shadow:0 4px 0 rgba(0,0,0,.18); transition:transform .15s, box-shadow .15s; }
.next-btn:active{ transform:translateY(2px); box-shadow:0 2px 0 rgba(0,0,0,.18); }
.prev-btn{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-base);
  background:var(--bg3); border:2px solid var(--border2); color:var(--txt2);
  cursor:pointer; padding:7px 18px; border-radius:50px;
  touch-action:manipulation; -webkit-tap-highlight-color:transparent;
  transition:background .15s, transform .1s; }
.prev-btn:active{ transform:scale(.95); }

/* Dark mode — quiz */
body.dark .qhdr,body.dark .qcard{ background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.12); }
body.dark .abtn{ background:rgba(255,255,255,.09); color:var(--txt); }
body.dark .agrid .abtn.correct{ background:rgba(39,174,96,.2); }
body.dark .agrid .abtn.wrong{ background:rgba(231,76,60,.2); }

/* ── RESULTS SCREEN ─────────────────────────────── */
.rcard{ background:rgba(255,255,255,0.95); border:1.5px solid rgba(255,255,255,0.86);
         border-radius:var(--rad); padding:26px 22px;
         box-shadow:0 8px 32px rgba(0,0,0,.12),inset 0 1.5px 0 rgba(255,255,255,0.95);
         text-align:center; margin-bottom:16px; }
.r-emoji{ font-size:var(--fs-5xl); display:block; margin-bottom:10px;
           animation:bob 1.5s ease-in-out infinite; }
.r-score{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-5xl); }
.r-pct{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
         font-size:var(--fs-xl); color:var(--txt2); }
.r-msg{ font-size:var(--fs-md); color:var(--txt2); margin:8px 0 12px; }
.r-stars{ font-size:var(--fs-3xl); letter-spacing:5px;
           animation:starPop .5s cubic-bezier(.34,1.56,.64,1); }
@keyframes starPop{ from{ transform:scale(0); opacity:0; } to{ transform:scale(1); opacity:1; } }
.rbtn-row{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:18px; }
.rbtn{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-md);
        padding:13px 26px; border-radius:50px; border:none; cursor:pointer; color:#fff;
        box-shadow:0 4px 0 rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,0.35);
        transition:transform .15s, box-shadow .15s;
        touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
.rbtn:active{ transform:translateY(2px); box-shadow:0 2px 0 rgba(0,0,0,.18); }
.rbtn.rbtn-retry{ background:#4a90d9; }
.rbtn.rbtn-home{ background:#27ae60; }

/* Results stats strip */
.r-stats-strip{ display:flex; background:rgba(255,255,255,.94);
  border-radius:var(--rad); margin-bottom:12px;
  box-shadow:0 4px 16px rgba(0,0,0,.08); overflow:hidden; }
.r-stat{ flex:1; display:flex; flex-direction:column; align-items:center;
  padding:14px 8px; border-right:1px solid var(--border); }
.r-stat:last-child{ border-right:none; }
.r-stat-val{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-xl); color:var(--txt); }
.r-stat-lbl{ font-size:var(--fs-xs); color:var(--txt2);
  text-transform:uppercase; letter-spacing:.04em; margin-top:2px; }

/* Results pass/fail banner */
.r-banner{ margin-bottom:12px; padding:12px 16px; border-radius:var(--rad);
  font-size:var(--fs-base); font-weight:600; }
.r-banner.pass{ background:rgba(39,174,96,.12); color:#1a6e3c; }
.r-banner.fail{ background:rgba(231,76,60,.10); color:#a93226; }

/* Missed questions */
.r-missed{ margin-bottom:16px; }
.r-missed h2{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-base); color:var(--txt2); margin:0 0 8px; }
.r-missed-list{ display:flex; flex-direction:column; gap:8px; }
.r-missed-item{ background:rgba(255,255,255,.94); border-radius:12px;
  padding:12px 14px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.r-missed-q{ font-size:var(--fs-base); font-weight:600; color:var(--txt); margin:0 0 4px; }
.r-missed-correct{ font-size:var(--fs-sm); color:#27ae60; margin:0 0 2px; }
.r-missed-chosen{ font-size:var(--fs-sm); color:#e74c3c; margin:0; }

body.dark .rcard{ background:rgba(255,255,255,.08); }
body.dark .r-stats-strip,.dark .r-missed-item{ background:rgba(255,255,255,.07); }

/* ── UNIT DETAIL SCREEN ─────────────────────────── */
.unit-banner{ border-radius:var(--rad); padding:10px 18px; color:#fff;
              box-shadow:var(--shad); flex-shrink:0; margin-bottom:0; }
.unit-banner h2{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-lg); margin-bottom:2px; }
.unit-banner p{ font-size:var(--fs-sm); opacity:.9; }
.unit-teks{ font-size:var(--fs-xs); background:rgba(255,255,255,.25);
             padding:2px 10px; border-radius:50px; display:inline-block; margin-top:4px; font-weight:800; }
.unit-ico{ font-size:3rem; display:block; margin-bottom:6px; }
.uc-mini-pb{ height:7px; background:rgba(0,0,0,.08); border-radius:50px; overflow:hidden; margin:8px 0 4px; }
.uc-mini-pbf{ height:100%; border-radius:50px; transition:width .5s; }

.lcard-grid{ display:flex; flex-direction:column; gap:8px; }
.lcard{ background:rgba(255,255,255,.94); border-radius:var(--rad); padding:18px 20px;
        display:flex; align-items:center; gap:16px; cursor:pointer;
        box-shadow:0 4px 16px rgba(0,0,0,.08); border:1.5px solid rgba(255,255,255,.6);
        transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.lcard:hover{ border-color:var(--uc,#ccc); box-shadow:0 8px 28px rgba(0,0,0,.15); }
.lcard-num{ width:46px; height:46px; border-radius:50%; background:var(--uc,#ccc);
             color:#fff; display:flex; align-items:center; justify-content:center;
             font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-lg); flex-shrink:0; }
.lcard-info{ flex:1; }
.lcard-title{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-lg); color:var(--txt); }
.lcard-desc{ font-size:var(--fs-base); color:var(--txt2); margin-top:3px; }
.lcard-badges{ display:flex; gap:6px; flex-shrink:0; }
.badge{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-xs);
         padding:4px 10px; border-radius:50px; white-space:nowrap; }
.badge-done{ background:#eafaf1; color:#27ae60; }
.badge-quiz{ background:#eafaf1; color:#27ae60; }

.unit-quiz-section{ padding:0 18px 18px; }
.unit-quiz-btn{ width:100%; font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-lg); padding:16px; border-radius:var(--rad); border:none;
  cursor:pointer; color:#fff; box-shadow:var(--shad);
  transition:transform .15s, opacity .15s; }
.unit-quiz-btn:hover{ opacity:.9; }
.unit-quiz-btn:active{ transform:scale(.98); }

body.dark .lcard{ background:rgba(255,255,255,.08); }
body.dark .badge-done,body.dark .badge-quiz{ background:rgba(39,174,96,.2); }

/* ── LESSON SCREEN ─────────────────────────────── */
.bar{ position:sticky; top:0; z-index:10; background:var(--bar-bg,rgba(255,255,255,.82));
      backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
      border-bottom:1px solid rgba(255,255,255,0.35);
      padding:12px 16px; padding-top:calc(12px + env(safe-area-inset-top));
      display:flex; align-items:center; gap:10px;
      box-shadow:0 2px 18px rgba(0,0,0,.08), inset 0 -1px 0 rgba(255,255,255,0.2); }
.bar-back{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-md);
           padding:8px 10px 8px 4px; border-radius:8px; border:none;
           background:transparent; cursor:pointer; transition:opacity .15s;
           display:flex; align-items:center; gap:6px; flex-shrink:0; color:var(--txt); }
.bar-back::before{ content:''; display:inline-block; width:10px; height:10px;
           border-left:2.5px solid currentColor; border-top:2.5px solid currentColor;
           transform:rotate(-45deg); border-radius:1px; flex-shrink:0; margin-right:1px; }
.bar-back:hover{ opacity:.6; }
.bar-title{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-xl);
            position:absolute; left:50%; transform:translateX(-50%);
            overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
            max-width:55%; text-align:center; pointer-events:none; color:var(--txt); }
.bar-badge{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-base);
            padding:6px 16px; border-radius:50px; flex-shrink:0;
            background:rgba(255,255,255,.5); color:var(--txt2); }

.les-teks-bar{ font-size:var(--fs-xs); font-weight:700; letter-spacing:.02em; color:var(--txt2);
               padding:3px 16px; background:var(--bg3); border-bottom:1px solid var(--border); }
.les-teks-bar:empty{ display:none; }

.lesson-content-wrap{ padding:16px 16px 0; display:flex; flex-direction:column; gap:14px; flex:1; }

.lesson-glass-wrap{ border-radius:var(--rad);
  border:1px solid rgba(255,255,255,.25);
  background:rgba(255,255,255,.14);
  box-shadow:0 8px 32px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.2);
  padding:10px 10px; margin-bottom:0; }

/* Key points */
.kp-list{ display:flex; flex-direction:column; gap:10px; }
.kp{ display:flex; align-items:flex-start; gap:12px;
      background:var(--bg3); border-radius:14px; padding:15px 17px;
      font-size:var(--fs-md); line-height:1.7; }
.kp-ico{ font-size:var(--fs-xl); flex-shrink:0; margin-top:1px; }

/* Section header inside glass wrap */
.glass-section-hdr{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-base); color:var(--txt2); font-weight:700; letter-spacing:.04em;
  text-transform:uppercase; margin-bottom:10px; }

/* Examples */
.ex-list{ display:flex; flex-direction:column; gap:12px; margin-top:4px; }
.ex-card{ border-radius:14px; padding:14px 16px;
  border-left:4px solid var(--exc,var(--color-primary,#4a90d9));
  background:rgba(255,255,255,.82); box-shadow:0 2px 10px rgba(0,0,0,.07); }
.ex-tag{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-base);
          text-transform:uppercase; letter-spacing:1px; color:var(--exc,#4a90d9); margin-bottom:8px; display:block; }
.ex-problem{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-xl); color:var(--exc,#4a90d9); margin-bottom:8px; }
.ex-steps{ font-size:var(--fs-base); color:var(--txt3); line-height:1.9; margin-bottom:8px; }
.ex-steps svg{ max-width:100%; height:auto; }
.ex-answer{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-xl); color:#27ae60; }

/* Practice */
.prac-list{ display:flex; flex-direction:column; gap:10px; margin-top:4px; }
.prac-item{ background:rgba(255,255,255,.82); border-radius:14px; padding:14px 16px;
  border:1.5px solid var(--border); box-shadow:0 2px 8px rgba(0,0,0,.05); }
.prac-q{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-lg);
  color:var(--txt); margin:0 0 10px; }
.prac-reveal-btn{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-base); padding:8px 20px; border-radius:50px; border:none;
  background:var(--bg3); color:var(--txt2); cursor:pointer;
  transition:background .15s, transform .1s;
  touch-action:manipulation; }
.prac-reveal-btn:active{ transform:scale(.96); }
.prac-answer{ margin-top:8px; }
.prac-answer-lbl{ font-size:var(--fs-xs); font-weight:700; text-transform:uppercase;
  letter-spacing:.05em; color:var(--txt2); }
.prac-answer-val{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-xl); color:#27ae60; }
.prac-hint{ font-size:var(--fs-sm); color:var(--txt2); font-style:italic; margin-top:4px; }
.prac-encourage{ font-size:var(--fs-sm); color:var(--color-primary,#4a90d9); font-weight:600; margin-top:4px; }

/* Lesson footer — quiz launch */
.lesson-footer{ padding:14px 16px calc(16px + env(safe-area-inset-bottom)); }
.next-lesson-btn{ width:100%; font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-lg); padding:18px; border-radius:var(--rad); border:3px solid;
  cursor:pointer; color:#fff; font-weight:700;
  box-shadow:var(--shad), inset 0 1px 0 rgba(255,255,255,0.5);
  transition:transform .15s, opacity .15s; }
.next-lesson-btn:hover{ opacity:.9; }
.next-lesson-btn:active{ transform:scale(.98); }

body.dark .bar{ background:rgba(30,45,65,.88); }
body.dark .lesson-glass-wrap{ background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.12); }
body.dark .ex-card,.dark .prac-item{ background:rgba(255,255,255,.07); }
body.dark .kp{ background:rgba(255,255,255,.08); }

/* ── DASHBOARD ─────────────────────────────────── */
.dash-shell{ min-height:100dvh; background:var(--home-grad); background-image:var(--app-bg-svg),var(--home-grad);
  background-size:420px 420px, 100% 100%; display:flex; flex-direction:column; }
.dash-hdr{ display:flex; align-items:center; justify-content:space-between;
  padding:calc(12px + env(safe-area-inset-top)) 16px 12px;
  background:rgba(255,255,255,.82); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  border-bottom:1px solid rgba(255,255,255,.35);
  box-shadow:0 2px 18px rgba(0,0,0,.08); position:sticky; top:0; z-index:10; }
.dash-brand{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-lg);
  color:var(--txt); }
.dash-back-btn{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-base);
  background:none; border:none; color:var(--color-primary,#4a90d9);
  cursor:pointer; padding:0; }

.dash-pill-row{ display:flex; gap:8px; padding:10px 16px; overflow-x:auto;
  background:rgba(255,255,255,.7); backdrop-filter:blur(8px);
  border-bottom:1px solid rgba(255,255,255,.35); scrollbar-width:none; }
.dash-pill-row::-webkit-scrollbar{ display:none; }
.dash-pill{ display:flex; align-items:center; gap:6px; padding:6px 14px;
  border-radius:50px; border:2px solid transparent;
  background:rgba(255,255,255,.6); font-size:var(--fs-sm); font-weight:600;
  cursor:pointer; white-space:nowrap; transition:all .15s; color:var(--txt);
  font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; }
.dash-pill.active{ border-color:var(--pill-color); color:var(--pill-color);
  background:rgba(255,255,255,.9); }
.dash-pill-emoji{ font-size:1.1rem; }

.dash-student-banner{ display:flex; align-items:center; gap:14px; padding:14px 16px; color:#fff; }
.dash-banner-emoji{ font-size:2.5rem; line-height:1; }
.dash-banner-text{ display:flex; flex-direction:column; gap:2px; }
.dash-banner-name{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-xl); }
.dash-banner-age{ font-size:var(--fs-sm); opacity:.85; }

.dash-page{ padding:14px 14px 3rem; display:flex; flex-direction:column; gap:16px; }
.dash-section{ display:flex; flex-direction:column; gap:8px; }
.dash-section-title{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-base); color:var(--txt2); font-weight:700; letter-spacing:.04em; text-transform:uppercase; }

/* Stats grid */
.stat-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.stat-tile{ background:rgba(255,255,255,0.94); border:1.5px solid rgba(255,255,255,0.82);
  border-radius:18px; padding:14px 10px; text-align:center;
  box-shadow:0 4px 18px rgba(0,0,0,.10),inset 0 1px 0 rgba(255,255,255,0.92);
  border-top:3px solid var(--chip-color,#4a90d9); }
.stat-ico{ font-size:1.3rem; line-height:1; }
.stat-num{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;
  font-size:var(--fs-xl); color:var(--chip-color,#4a90d9); }
.stat-lbl{ font-size:var(--fs-xs); color:var(--txt2); font-weight:800; margin-top:2px; }

/* Quiz history */
.qh-card{ background:rgba(255,255,255,.94); border-radius:var(--rad); overflow:hidden;
  box-shadow:0 4px 18px rgba(0,0,0,.08); }
.qh-list{ list-style:none; margin:0; padding:0; }
.qh-row{ padding:12px 14px; border-bottom:1px solid var(--border); display:flex;
  flex-direction:column; gap:3px; }
.qh-row:last-child{ border-bottom:none; }
.qh-type-badge{ display:inline-block; font-size:.62rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.06em; background:rgba(74,144,217,.12); color:#4a90d9;
  padding:2px 7px; border-radius:5px; }
.qh-main{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
.qh-label{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-base);
  color:var(--txt); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.qh-stars{ font-size:var(--fs-base); white-space:nowrap; }
.qh-meta{ display:flex; align-items:center; gap:6px; font-size:var(--fs-sm); color:var(--txt2); }
.qh-pct{ font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size:var(--fs-base);
  font-weight:700; }
.qh-footer{ display:flex; align-items:center; justify-content:space-between; }
.qh-date{ font-size:var(--fs-xs); color:var(--txt2); }
.qh-del{ background:none; border:none; cursor:pointer; font-size:.9rem; opacity:.35;
  transition:opacity .15s; padding:0 4px; }
.qh-del:hover{ opacity:.8; }
.qh-empty{ padding:2rem; text-align:center; color:var(--txt2); font-size:var(--fs-base); margin:0; }

/* Mastery grid */
.mg-card{ background:rgba(255,255,255,.94); border-radius:var(--rad); overflow:hidden;
  box-shadow:0 4px 18px rgba(0,0,0,.08); padding:12px; }
.mg-grid{ display:flex; flex-direction:column; gap:5px; }
.mg-row{ display:flex; align-items:center; gap:8px; }
.mg-unit-label{ display:flex; align-items:center; gap:4px; min-width:52px; flex-shrink:0; }
.mg-unit-ico{ font-size:1rem; line-height:1; }
.mg-unit-name{ font-size:.62rem; font-weight:700; letter-spacing:.04em; }
.mg-cells{ display:flex; gap:4px; flex-wrap:wrap; }
.mg-cell{ width:1.6rem; height:1.6rem; border-radius:5px; display:flex; align-items:center;
  justify-content:center; font-size:.7rem; font-weight:700; cursor:default;
  transition:transform .1s; border:1.5px solid transparent; }
.mg-cell:hover{ transform:scale(1.15); }
.mg-cell.pass{ background:#27ae60; color:#fff; border-color:#1a8a4a; }
.mg-cell.attempt{ background:#ffeaa7; color:#e67e22; border-color:#fdcb6e; }
.mg-cell.untouched{ background:var(--border,#dfe6e9); color:transparent; }
.mg-legend{ display:flex; gap:14px; padding-top:10px; margin-top:6px;
  border-top:1px solid var(--border); justify-content:center; }
.mg-legend-item{ display:flex; align-items:center; gap:5px; font-size:.7rem; color:var(--txt2); }
.mg-dot{ width:.65rem; height:.65rem; border-radius:3px; display:inline-block; }
.mg-dot.pass{ background:#27ae60; }
.mg-dot.attempt{ background:#ffeaa7; border:1px solid #fdcb6e; }
.mg-dot.untouched{ background:var(--border,#dfe6e9); }

body.dark .dash-hdr,.dark .dash-pill-row{ background:rgba(20,35,55,.88); }
body.dark .stat-tile,.dark .qh-card,.dark .mg-card{ background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.12); }
body.dark .qh-row{ border-color:rgba(255,255,255,.1); }
```

- [ ] **Step 2: Verify app.css has no syntax errors**

```bash
cd "E:\Cameron Jones\my-math-roots\app"
npx svelte-check --no-tsconfig 2>&1 | head -30
```

Expected: 0 type errors (CSS errors won't show here; visual check in next task).

- [ ] **Step 3: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/app.css
git commit -m "style: add legacy CSS sections for quiz, results, unit, lesson, dashboard"
```

---

## Task 2: Quiz Engine — Restyle QuizEngine.svelte

**Files:**
- Modify: `app/src/lib/components/quiz/QuizEngine.svelte`

Replace the `<script>` section (unchanged), template, and `<style>` block.

- [ ] **Step 1: Replace QuizEngine.svelte template + remove style block**

The logic in `<script lang="ts">` is unchanged. Replace everything from `<div class="engine"` to the closing `</style>` with:

```svelte
<div class="sc" style="--color: {color}">
  <div class="sc-in">

    <!-- Progress bar -->
    <div class="qpb" role="progressbar" aria-valuenow={qz.idx} aria-valuemax={total}>
      <div class="qpbf" style="width: {progress * 100}%; background: {color}"></div>
    </div>

    <!-- Header: quit + label + score -->
    <div class="qhdr">
      <div class="qmeta">
        <span class="q-lbl">Q {qz.viewIdx + 1} of {total}</span>
        <span class="q-score" style="background: {color}22; color: {color}">{qz.score} correct</span>
        <button type="button" class="quiz-quit-btn" onclick={onQuit} aria-label="Quit quiz">✕ Quit</button>
      </div>
    </div>

    <!-- Question card -->
    <div class="qcard">
      <p class="q-text">{q?.t ?? ''}</p>

      {#if q?.s}
        <div class="q-visual" aria-hidden="true">{@html q.s}</div>
      {/if}

      {#if isReview}
        <p style="font-size:var(--fs-sm); color:var(--txt2); margin:0 0 10px">👁 Review — answer locked</p>
      {/if}

      <!-- Answer grid -->
      <div class="agrid" role="group" aria-label="Answer choices">
        {#each (isReview ? (pastAnswer?.opts ?? q?.o ?? []) : opts.map(o => o.text)) as optText, i}
          {@const origIdx = isReview ? i : opts[i]?.origIdx}
          {@const isCorrect = isReview
            ? optText === (pastAnswer?.opts?.[pastAnswer.correct] ?? q?.o[q.a])
            : origIdx === q?.a}
          {@const isChosen = isReview ? i === pastAnswer?.chosen : i === chosenIdx}
          {@const btnClass = !answered && !isReview ? '' : isCorrect ? 'correct' : isChosen ? 'wrong' : ''}

          <button
            type="button"
            class="abtn {btnClass}"
            onclick={() => pickAnswer(i)}
            disabled={answered || isReview}
            aria-label="Answer: {optText}"
            aria-pressed={isChosen}
          >
            {optText}
          </button>
        {/each}
      </div>

      <!-- Reveal panel -->
      {#if answered && !isReview}
        {@const wasCorrect = opts[chosenIdx ?? 0]?.origIdx === q?.a}
        <div class="reveal {wasCorrect ? 'ok' : 'no'}" role="status" aria-live="polite">
          <p class="rev-h {wasCorrect ? 'ok' : 'no'}">
            {wasCorrect ? '🎉 Correct! Great job!' : '😊 Not quite…'}
          </p>
          {#if !wasCorrect}
            <p class="rev-correct">✅ Correct answer: {correctText}</p>
          {/if}
          <p class="rev-exp">💡 {q?.e}</p>

          {#if !wasCorrect}
            {#if hintLoading}
              <p class="rev-time" aria-live="polite">🤔 Thinking…</p>
            {:else if hintText}
              <div class="rev-tip" role="note">
                <strong>✨ AI Hint</strong><br>{hintText}
              </div>
            {:else if hintError}
              <p class="rev-time" style="color:#e74c3c">{hintError}</p>
            {:else}
              <button type="button" class="hint-btn-legacy" onclick={fetchHint}>✨ Get a Hint</button>
            {/if}
          {/if}
        </div>
      {/if}

      <!-- Review reveal -->
      {#if isReview && pastAnswer}
        <div class="reveal {pastAnswer.ok ? 'ok' : 'no'}" role="status">
          <p class="rev-h {pastAnswer.ok ? 'ok' : 'no'}">
            {pastAnswer.ok ? '🎉 Correct!' : '😊 Not quite…'}
          </p>
          {#if !pastAnswer.ok}
            <p class="rev-correct">✅ Correct answer: {pastAnswer.opts?.[pastAnswer.correct] ?? ''}</p>
          {/if}
          <p class="rev-exp">💡 {pastAnswer.exp}</p>
          {#if pastAnswer.timeSecs != null}
            <p class="rev-time">⏱ {pastAnswer.timeSecs}s on this question</p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Navigation -->
    <div class="quiz-nav-row">
      {#if qz.viewIdx > 0}
        <button type="button" class="prev-btn" onclick={goBack}>← Back</button>
      {/if}

      {#if answered || isReview}
        <button
          type="button"
          class="next-btn"
          style="background: {color}"
          onclick={nextQuestion}
        >
          {#if isReview && qz.viewIdx < qz.idx - 1}
            Forward →
          {:else if isReview}
            Back to Current →
          {:else if qz.idx + 1 >= total}
            See Results 🏆
          {:else}
            Next Question →
          {/if}
        </button>
      {/if}
    </div>

  </div>
</div>
```

No `<style>` block needed — all CSS is in `app.css`.

- [ ] **Step 2: Run svelte-check**

```bash
cd "E:\Cameron Jones\my-math-roots\app"
npx svelte-check 2>&1 | tail -10
```

Expected: `0 errors`

- [ ] **Step 3: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/lib/components/quiz/QuizEngine.svelte
git commit -m "style: QuizEngine — legacy .qhdr/.agrid/.abtn DOM + remove scoped CSS"
```

---

## Task 3: Quiz Results — Restyle QuizResults.svelte

**Files:**
- Modify: `app/src/lib/components/quiz/QuizResults.svelte`

- [ ] **Step 1: Replace QuizResults.svelte template + remove style block**

The `<script>` block is unchanged. Replace the template and remove the `<style>` block:

```svelte
<div class="sc" style="--color: {color}">
  <div class="sc-in">

    <!-- Score card -->
    <div class="rcard">
      <span class="r-emoji" role="img" aria-label="Result">{emoji}</span>
      <div class="r-score" style="color: {color}">{entry.pct}%</div>
      <div class="r-pct">{entry.score} / {entry.total} correct</div>
      <div class="r-stars" aria-label="Stars earned">{entry.stars || '⭐'}</div>
      <div class="r-msg">{msg}</div>

      <div class="rbtn-row">
        <button type="button" class="rbtn rbtn-retry" onclick={onRetry}>🔄 Try Again</button>
        <button type="button" class="rbtn rbtn-home" onclick={onHome}>🏠 Home</button>
      </div>
    </div>

    <!-- Stats strip -->
    <div class="r-stats-strip">
      <div class="r-stat">
        <span class="r-stat-val">{entry.score}/{entry.total}</span>
        <span class="r-stat-lbl">Correct</span>
      </div>
      <div class="r-stat">
        <span class="r-stat-val">{entry.timeTaken}</span>
        <span class="r-stat-lbl">Time</span>
      </div>
      <div class="r-stat">
        <span class="r-stat-val">{entry.total - entry.score}</span>
        <span class="r-stat-lbl">Missed</span>
      </div>
    </div>

    <!-- Pass / fail banner -->
    <div class="r-banner {passed ? 'pass' : 'fail'}" role="status">
      {#if passed}
        🔓 {entry.type === 'lesson' ? 'Next lesson unlocked!' : entry.type === 'unit' ? 'Next unit unlocked!' : 'Final Test passed — Math Master! 🎓'}
      {:else}
        🔒 Need 80%+ to unlock. You got {entry.pct}% — try again!
      {/if}
    </div>

    <!-- Missed questions -->
    {#if wrong.length > 0}
      <div class="r-missed">
        <h2>Missed Questions</h2>
        <div class="r-missed-list">
          {#each wrong as a}
            <div class="r-missed-item">
              <p class="r-missed-q">{a.t}</p>
              <p class="r-missed-correct">✅ {a.opts?.[a.correct] ?? ''}</p>
              {#if a.chosen !== null && a.opts}
                <p class="r-missed-chosen">✗ Your answer: {a.opts[a.chosen] ?? ''}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </div>
</div>
```

- [ ] **Step 2: Run svelte-check**

```bash
cd "E:\Cameron Jones\my-math-roots\app"
npx svelte-check 2>&1 | tail -10
```

Expected: `0 errors`

- [ ] **Step 3: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/lib/components/quiz/QuizResults.svelte
git commit -m "style: QuizResults — legacy .rcard/.rbtn DOM + remove scoped CSS"
```

---

## Task 4: Unit Detail — Restyle unit/[id]/+page.svelte

**Files:**
- Modify: `app/src/routes/unit/[id]/+page.svelte`

The unit page currently uses a custom header and `LessonRow` component. We replace the entire template to use legacy `.unit-banner` + `.lcard-grid` structure. The `LessonRow` import is removed — lesson cards are rendered inline.

- [ ] **Step 1: Replace unit/[id]/+page.svelte template + remove style block**

Keep the `<script>` block as-is (remove the `LessonRow` import line). Replace from `{#if !unit}` onward:

The new script import line to remove: `import LessonRow from '$lib/components/home/LessonRow.svelte';`

New template:

```svelte
{#if !unit}
  <main class="sc" style="display:flex; align-items:center; justify-content:center; min-height:100dvh">
    <p style="color:var(--txt2)">Unit not found.</p>
    <button type="button" class="bar-back" onclick={goBack} style="margin-left:8px">← Back</button>
  </main>
{:else}
  <div class="sc" id="unit-screen" style="--uc: {unit.color}">

    <!-- Sticky bar -->
    <div class="bar">
      <button type="button" class="bar-back" onclick={goBack} aria-label="Back to home">Home</button>
      <span class="bar-title">{unit.name}</span>
    </div>

    <!-- TEKS strip -->
    <div class="les-teks-bar">{unit.teks}</div>

    <!-- Unit banner -->
    <div class="unit-banner" style="background: {unit.color}; margin:14px 14px 0">
      <span class="unit-ico">{unit.icon}</span>
      <h2>{unit.name}</h2>
      <p>{unit.desc ?? ''}</p>
      <span class="unit-teks">{unit.teks}</span>
      <div class="uc-mini-pb">
        <div class="uc-mini-pbf" style="width: {Math.round(progressPct)}%; background: rgba(255,255,255,.7)"></div>
      </div>
    </div>

    <!-- Lesson cards -->
    <div class="lesson-glass-wrap" style="margin:14px 14px 0">
      {#if loading && !unit._loaded}
        <p style="color:var(--txt2); padding:8px">Loading lessons…</p>
      {:else}
        <div class="lcard-grid">
          {#each unit.lessons as lesson, i}
            <div
              class="lcard"
              role="button"
              tabindex="0"
              style="--uc: {unit.color}"
              onclick={() => goto(`/lesson/${lesson.id}`)}
              onkeydown={(e) => e.key === 'Enter' && goto(`/lesson/${lesson.id}`)}
            >
              <div class="lcard-num">{i + 1}</div>
              <div class="lcard-info">
                <div class="lcard-title">{lesson.title}</div>
                {#if lesson.desc}
                  <div class="lcard-desc">{lesson.desc}</div>
                {/if}
              </div>
              <div class="lcard-badges">
                {#if $isDone(lesson.id)}
                  <span class="badge badge-done">✓ Done</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Unit Quiz -->
    {#if unit.unitQuiz}
      <div class="unit-quiz-section">
        <button
          type="button"
          class="unit-quiz-btn"
          style="background: {unit.color}"
          onclick={() => goto(`/quiz/${unit.id}_uq`)}
        >
          🏆 Unit Quiz
        </button>
      </div>
    {/if}

  </div>
{/if}
```

Also add this derived value to the script block (after the existing `loading` state):
```ts
const progressPct = $derived.by(() => {
  if (!unit) return 0;
  const done = unit.lessons.filter(l => $isDone(l.id)).length;
  return unit.lessons.length > 0 ? (done / unit.lessons.length) * 100 : 0;
});
```

- [ ] **Step 2: Run svelte-check**

```bash
cd "E:\Cameron Jones\my-math-roots\app"
npx svelte-check 2>&1 | tail -10
```

Expected: `0 errors`

- [ ] **Step 3: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/routes/unit/[id]/+page.svelte
git commit -m "style: unit detail — legacy .unit-banner/.lcard-grid DOM + remove scoped CSS"
```

---

## Task 5: Lesson Screen — Restyle lesson/[id]/+page.svelte

**Files:**
- Modify: `app/src/routes/lesson/[id]/+page.svelte`

- [ ] **Step 1: Replace lesson/[id]/+page.svelte template + remove style block**

The `<script>` block is unchanged. Replace template and `<style>` block:

```svelte
{#if !lesson && !loading}
  <main class="sc" style="display:flex; align-items:center; justify-content:center; min-height:100dvh">
    <p style="color:var(--txt2)">Lesson not found.</p>
    <button type="button" class="bar-back" onclick={goBack} style="margin-left:8px">← Back</button>
  </main>
{:else if loading && !lesson?.points}
  <main class="sc" style="display:flex; align-items:center; justify-content:center; min-height:100dvh">
    <p style="color:var(--txt2)">Loading lesson…</p>
  </main>
{:else if lesson}
  <div class="sc" id="lesson-screen" style="--color: {unit?.color ?? '#4a90d9'}; --exc: {unit?.color ?? '#4a90d9'}">

    <!-- Sticky bar -->
    <div class="bar">
      <button type="button" class="bar-back" onclick={goBack} aria-label="Back to unit">
        {unit?.name ?? 'Back'}
      </button>
      <span class="bar-title">{lesson.title}</span>
      <span class="bar-badge">{lesson.icon ?? '📖'}</span>
    </div>

    <!-- TEKS strip -->
    <div class="les-teks-bar">{unit?.teks ?? ''}</div>

    <!-- Scrollable content -->
    <div class="lesson-content-wrap">

      <!-- Key Points -->
      {#if lesson.points && lesson.points.length > 0}
        <div class="lesson-glass-wrap">
          <div class="glass-section-hdr">📌 Key Points</div>
          <ul class="kp-list" style="list-style:none; padding:0; margin:0">
            {#each lesson.points as point}
              <li class="kp">
                <span class="kp-ico">•</span>
                <span>{point}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Worked Examples -->
      {#if lesson.examples && lesson.examples.length > 0}
        <div class="lesson-glass-wrap">
          <div class="glass-section-hdr">✏️ Examples</div>
          <div class="ex-list">
            {#each lesson.examples as ex}
              <div class="ex-card" style="--exc: {ex.c ?? unit?.color ?? '#4a90d9'}">
                <span class="ex-tag">{ex.tag}</span>
                <p class="ex-problem">{ex.p}</p>
                <div class="ex-steps">{@html ex.s}</div>
                <p class="ex-answer">{ex.a}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Practice Problems -->
      {#if lesson.practice && lesson.practice.length > 0}
        <div class="lesson-glass-wrap">
          <div class="glass-section-hdr">🏋️ Practice</div>
          <div class="prac-list">
            {#each lesson.practice as item, i}
              <div class="prac-item">
                <p class="prac-q">{item.q}</p>
                {#if revealed[i]}
                  <div class="prac-answer">
                    <div class="prac-answer-lbl">Answer:</div>
                    <div class="prac-answer-val">{item.a}</div>
                    {#if item.h}
                      <p class="prac-hint">💡 {item.h}</p>
                    {/if}
                    <p class="prac-encourage">{item.e}</p>
                  </div>
                {:else}
                  <button type="button" class="prac-reveal-btn" onclick={() => toggleReveal(i)}>
                    Show Answer
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

    </div>

    <!-- Quiz CTA footer -->
    <div class="lesson-footer">
      <button
        type="button"
        class="next-lesson-btn"
        style="background: {unit?.color ?? '#4a90d9'}; border-color: {unit?.color ?? '#4a90d9'}"
        onclick={startQuiz}
      >
        🎯 Start Lesson Quiz
      </button>
    </div>

  </div>
{/if}
```

- [ ] **Step 2: Run svelte-check**

```bash
cd "E:\Cameron Jones\my-math-roots\app"
npx svelte-check 2>&1 | tail -10
```

Expected: `0 errors`

- [ ] **Step 3: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/routes/lesson/[id]/+page.svelte
git commit -m "style: lesson screen — legacy .bar/.lesson-glass-wrap/.kp/.ex-card/.prac DOM"
```

---

## Task 6: Dashboard Layout + Page — Restyle

**Files:**
- Modify: `app/src/routes/dashboard/+layout.svelte`
- Modify: `app/src/routes/dashboard/+page.svelte`

- [ ] **Step 1: Replace dashboard/+layout.svelte template + remove style block**

The `<script>` block and `$effect` guard are unchanged. Replace the template:

```svelte
<div class="dash-shell">

  <!-- Sticky header -->
  <header class="dash-hdr">
    <button type="button" class="dash-back-btn" onclick={() => goto('/select')}>← Students</button>
    <span class="dash-brand">🌱 My Math Roots</span>
  </header>

  <!-- Student switcher pills -->
  {#if $familyProfiles.length > 0}
    <nav class="dash-pill-row" aria-label="Switch student">
      {#each $familyProfiles as profile}
        <button
          type="button"
          class="dash-pill {$activeStudentId === profile.id ? 'active' : ''}"
          style="--pill-color: {profile.avatar_color_from}"
          onclick={() => activeStudentId.set(profile.id)}
        >
          <span class="dash-pill-emoji">{profile.avatar_emoji}</span>
          <span>{profile.display_name}</span>
        </button>
      {/each}
    </nav>
  {/if}

  <!-- Student banner -->
  {#if $activeStudent}
    <div
      class="dash-student-banner"
      style="background: linear-gradient(135deg, {$activeStudent.avatar_color_from}, {$activeStudent.avatar_color_to})"
    >
      <span class="dash-banner-emoji">{$activeStudent.avatar_emoji}</span>
      <div class="dash-banner-text">
        <span class="dash-banner-name">{$activeStudent.display_name}</span>
        <span class="dash-banner-age">Age {$activeStudent.age}</span>
      </div>
    </div>
  {/if}

  {@render children()}
</div>
```

- [ ] **Step 2: Replace dashboard/+page.svelte template + remove style block**

```svelte
<main class="dash-page" style="--color: {accentColor}">

  <section class="dash-section">
    <div class="dash-section-title">📈 Overall Stats</div>
    <OverallStats />
  </section>

  <section class="dash-section">
    <div class="dash-section-title">📋 Quiz History</div>
    <QuizHistory />
  </section>

  <section class="dash-section">
    <div class="dash-section-title">🗺️ Mastery Map</div>
    <MasteryGrid />
  </section>

  <section class="dash-section">
    <div class="dash-section-title">🤖 AI Progress Report</div>
    <AiReportCard />
  </section>

  <section class="dash-section">
    <div class="dash-section-title">⚙️ Settings</div>
    <ParentSettings />
  </section>

</main>
```

- [ ] **Step 3: Run svelte-check**

```bash
cd "E:\Cameron Jones\my-math-roots\app"
npx svelte-check 2>&1 | tail -10
```

Expected: `0 errors`

- [ ] **Step 4: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/routes/dashboard/+layout.svelte app/src/routes/dashboard/+page.svelte
git commit -m "style: dashboard layout/page — legacy .dash-shell/.dash-hdr/.dash-pill DOM"
```

---

## Task 7: Dashboard Components — OverallStats, QuizHistory, MasteryGrid

**Files:**
- Modify: `app/src/lib/components/dashboard/OverallStats.svelte`
- Modify: `app/src/lib/components/dashboard/QuizHistory.svelte`
- Modify: `app/src/lib/components/dashboard/MasteryGrid.svelte`

- [ ] **Step 1: Replace OverallStats.svelte template + remove style block**

`<script>` block unchanged. New template:

```svelte
<div class="stat-grid">
  {#each chips as chip}
    <div class="stat-tile" style="--chip-color: {chip.color}">
      <span class="stat-ico">{chip.icon}</span>
      <span class="stat-num">{chip.value}</span>
      <span class="stat-lbl">{chip.label}</span>
    </div>
  {/each}
</div>
```

- [ ] **Step 2: Replace QuizHistory.svelte template + remove style block**

`<script>` block unchanged. New template:

```svelte
<div class="qh-card">
  {#if recent.length === 0}
    <p class="qh-empty">No quizzes completed yet.</p>
  {:else}
    <ul class="qh-list">
      {#each recent as entry}
        <li class="qh-row">
          <span class="qh-type-badge">{typeLabel(entry.type)}</span>
          <div class="qh-main">
            <span class="qh-label">{entry.label}</span>
            <span class="qh-stars">{entry.stars}</span>
          </div>
          <div class="qh-meta">
            <span class="qh-pct" style="color: {pctColor(entry.pct)}">{entry.pct}%</span>
            <span>·</span>
            <span>{entry.score}/{entry.total} correct</span>
            <span>·</span>
            <span>⏱ {entry.timeTaken}</span>
          </div>
          <div class="qh-footer">
            <span class="qh-date">{entry.date}</span>
            <button
              type="button"
              class="qh-del"
              onclick={() => deleteEntry(entry)}
              aria-label="Delete this result"
            >🗑</button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

- [ ] **Step 3: Replace MasteryGrid.svelte template + remove style block**

`<script>` block unchanged. New template:

```svelte
<div class="mg-card">
  {#if $unitsData.length === 0}
    <p class="qh-empty">Loading curriculum…</p>
  {:else}
    <div class="mg-grid">
      {#each $unitsData as unit}
        <div class="mg-row">
          <div class="mg-unit-label" style="color: {unit.color}">
            <span class="mg-unit-ico">{unit.icon}</span>
            <span class="mg-unit-name">{unit.id.toUpperCase()}</span>
          </div>
          <div class="mg-cells">
            {#each unit.lessons as lesson}
              {@const state = lessonState(lesson.id)}
              <div
                class="mg-cell {state === 'passed' ? 'pass' : state === 'attempted' ? 'attempt' : 'untouched'}"
                title={cellTitle(lesson.id, lesson.title)}
                role="img"
                aria-label="{lesson.title}: {state}"
              >
                {#if state === 'passed'}✓{:else if state === 'attempted'}·{:else}&nbsp;{/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="mg-legend">
      <span class="mg-legend-item"><span class="mg-dot pass"></span> Passed</span>
      <span class="mg-legend-item"><span class="mg-dot attempt"></span> Started</span>
      <span class="mg-legend-item"><span class="mg-dot untouched"></span> Not started</span>
    </div>
  {/if}
</div>
```

- [ ] **Step 4: Run svelte-check**

```bash
cd "E:\Cameron Jones\my-math-roots\app"
npx svelte-check 2>&1 | tail -10
```

Expected: `0 errors`

- [ ] **Step 5: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/lib/components/dashboard/OverallStats.svelte \
        app/src/lib/components/dashboard/QuizHistory.svelte \
        app/src/lib/components/dashboard/MasteryGrid.svelte
git commit -m "style: dashboard components — legacy .stat-grid/.qh-list/.mg-grid DOM"
```

---

## Task 8: Dark Mode — Wire body.dark to a11y prefs

**Files:**
- Modify: `app/src/routes/+layout.svelte`

The `body.dark` CSS class is already defined in `app.css` with dark-mode overrides for every screen. All that's missing is wiring it to the `$a11y.darkMode` pref.

- [ ] **Step 1: Add a11y import and body.dark binding to +layout.svelte**

In `app/src/routes/+layout.svelte`, add to the imports in the `<script>` block:

```ts
import { a11y } from '$lib/stores';
```

Add this `$effect` after the existing `$effect` auth guard:

```ts
$effect(() => {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('dark', $a11y.darkMode);
  }
});
```

- [ ] **Step 2: Run svelte-check**

```bash
cd "E:\Cameron Jones\my-math-roots\app"
npx svelte-check 2>&1 | tail -10
```

Expected: `0 errors`

- [ ] **Step 3: Commit**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add app/src/routes/+layout.svelte
git commit -m "feat: wire body.dark class to a11y.darkMode for dark mode support"
```

---

## Task 9: Visual Verification

Verify each screen against the dist reference (port 3000) using screenshots.

- [ ] **Step 1: Start the SvelteKit dev server**

```bash
cd "E:\Cameron Jones\my-math-roots\app"
npm run dev
```

Server should start on `http://localhost:5173`.

- [ ] **Step 2: Verify Quiz screen**

Temporarily bypass auth in `+layout.svelte` by commenting out both `$effect` blocks. Navigate to `http://localhost:5173/quiz/lq_u1l1` and take a screenshot. Compare against the dist server at `http://localhost:3000`.

Restore auth guard after screenshot.

- [ ] **Step 3: Verify Unit Detail**

Navigate to `http://localhost:5173/unit/u1`. Take screenshot, compare against dist.

- [ ] **Step 4: Verify Lesson Screen**

Navigate to `http://localhost:5173/lesson/u1l1`. Take screenshot, compare against dist.

- [ ] **Step 5: Verify Dashboard**

Navigate to `http://localhost:5173/dashboard` (bypass auth or sign in as parent). Take screenshot, compare against dist.

- [ ] **Step 6: Verify Quiz Results**

Complete a quiz to reach the results screen. Take screenshot, compare against dist.

- [ ] **Step 7: Restore auth guard**

Ensure `+layout.svelte` auth `$effect` is uncommented and working.

- [ ] **Step 8: Commit final verification**

```bash
cd "E:\Cameron Jones\my-math-roots"
git add -A
git commit -m "style: ui parity sprint complete — all screens match legacy dist build"
```
