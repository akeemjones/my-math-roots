# Streak Calendar Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing v1 streak calendar with a condensed, no-scroll modal featuring a compact streak hero, milestone badges, day detail with expandable quiz items, and a dedicated home-screen calendar button that stacks below the profile switcher.

**Architecture:** The existing `_openStreakCal` / `_buildStreakCal` / `_buildCalGridHTML` / `_showDayDetail` functions in `auth.js` are replaced in-place. A new `<button id="cal-btn">` is added to `index.html` next to the existing `<button id="prof-btn">`. CSS handles stacking via fixed positioning. The existing swipe-to-navigate and backdrop-dismiss patterns are preserved. No new localStorage keys — reads existing `wb_streak`, `wb_sc5`, `wb_act_dates`, `wb_apptime`.

**Tech Stack:** Vanilla JS, CSS variables, existing event dispatcher (`data-action`), existing `safeLoad`/`safeLoadSigned` state helpers.

**Spec:** `docs/superpowers/specs/2026-04-10-streak-calendar-redesign.md`

**Target:** v1 only — `E:/Cameron Jones/my-math-roots/`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `index.html:37` | Modify | Add `<button id="cal-btn">` after `prof-btn`. Remove `#streak-badge` div (line 235). |
| `src/styles.css:2391+` | Modify | Add `.cal-btn` and `.cal-dot` styles. Remove `#streak-badge` styles (lines 2051-2062). |
| `src/auth.js:1336-1616` | Modify | Replace streak calendar functions with redesigned versions. Add `_renderCalBtn`, `_updateCalDot`, `_getMilestone`, `_toggleDayExpand`. Remove `_renderStreak`. |
| `src/events.js:172-176` | Modify | Update action names: add `openCalendar`, `_toggleDayExpand`. Keep `_streakCalNav`, `_showDayDetail`. Remove `_openStreakCal`. |
| `src/home.js:10,157` | Modify | Replace `_renderStreak()` calls with `_renderCalBtn()`. |
| `src/tour.js:184-189` | Modify | Update tour step: change `#streak-badge` selector to `#cal-btn`, update tip text. |

---

### Task 1: Add Calendar Button to HTML and Remove Streak Badge

**Files:**
- Modify: `index.html:37` (add cal-btn after prof-btn)
- Modify: `index.html:235` (remove streak-badge div)

- [ ] **Step 1: Add the calendar button element**

In `index.html`, immediately after the existing `prof-btn` line (line 37):

```html
  <button id="prof-btn" class="prof-btn" data-action="openProfileSwitcher" aria-label="Switch profile" style="display:none"></button>
  <button id="cal-btn" class="cal-btn" data-action="openCalendar" aria-label="Open streak calendar" style="display:none"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span id="cal-dot" class="cal-dot"></span></button>
```

- [ ] **Step 2: Remove the streak-badge div**

In `index.html`, line 235, delete the entire line:

```html
    <div style="text-align:center;margin:6px 16px 0"><div id="streak-badge" style="display:none;font-size:var(--fs-md);color:#e06000;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;letter-spacing:.3px;padding:4px 14px;border-radius:20px;background:rgba(255,255,255,0.08);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,150,0,0.55);box-shadow:0 2px 8px rgba(255,100,0,0.10)"></div></div>
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(calendar): add cal-btn to HTML, remove streak-badge"
```

---

### Task 2: Add Calendar Button and Activity Dot CSS

**Files:**
- Modify: `src/styles.css:2051-2062` (replace streak-badge styles)
- Modify: `src/styles.css:2391+` (add cal-btn styles after prof-btn)

- [ ] **Step 1: Remove streak-badge CSS**

In `src/styles.css`, delete lines 2050-2062 (the `/* ── STREAK BADGE INTERACTION ── */` block through the `streak-pulse` animation):

```css
/* ── STREAK BADGE INTERACTION ── */
#streak-badge{
  transition:transform .15s ease, box-shadow .15s ease;
}
#streak-badge:active{
  transform:scale(.93);
  box-shadow:0 1px 4px rgba(255,100,0,0.18);
}
@keyframes streak-pulse{
  0%,100%{ opacity:1; }
  50%{ opacity:0.75; }
}
#streak-badge{ animation:streak-pulse 3s ease-in-out infinite; }
```

- [ ] **Step 2: Add cal-btn and cal-dot styles**

In `src/styles.css`, immediately after the `.prof-btn` block (after the `button:focus-visible.prof-btn` rule around line 2405), add:

```css
/* ── CALENDAR BUTTON (stacks below prof-btn) ── */
.cal-btn{
  position:fixed; top:calc(14px + env(safe-area-inset-top)); left:16px;
  z-index:var(--z-fixed-btn); width:50px; height:50px; border-radius:50%; border:none;
  background:rgba(255,255,255,0.85);
  border:1.5px solid rgba(255,255,255,0.82);
  box-shadow:0 4px 18px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.95);
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:transform .2s, box-shadow .2s; -webkit-tap-highlight-color:transparent;
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }
.cal-btn:active{ transform:scale(.93); }
body.dark .cal-btn{
  background:rgba(255,255,255,.08);
  border-top-color:rgba(255,255,255,.20);
  border-left-color:rgba(255,255,255,.14); }
@media (hover:hover){ .cal-btn:hover{ box-shadow:0 5px 20px rgba(0,0,0,.2); } }
button:focus-visible.cal-btn{ outline:3px solid rgba(74,144,217,0.7); outline-offset:2px; }

/* Stacked position: when prof-btn is visible, cal-btn shifts down */
.cal-btn.cal-btn--stacked{
  top:calc(14px + env(safe-area-inset-top) + 50px + 10px); }

.cal-dot{
  position:absolute; top:2px; right:2px;
  width:10px; height:10px; border-radius:50%;
  border:2px solid rgba(255,255,255,0.9);
  background:#ddd; pointer-events:none; }
.cal-dot.cal-dot--active{ background:#27ae60; }
```

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat(calendar): add cal-btn/cal-dot CSS, remove streak-badge styles"
```

---

### Task 3: Update Event Dispatcher

**Files:**
- Modify: `src/events.js:172-176`

- [ ] **Step 1: Replace streak calendar actions**

In `src/events.js`, replace lines 172-176:

```javascript
    _openStreakCal:         ()    => _openStreakCal(),
    _closeStreakCal:        ()    => _closeStreakCal(),
    _buildStreakCal:        ()    => _buildStreakCal(),
    _streakCalNav:          (a)   => _streakCalNav(Number(a)),
    _showDayDetail:         (a)   => _showDayDetail(a),
```

with:

```javascript
    openCalendar:           ()    => _openStreakCal(),
    _closeStreakCal:        ()    => _closeStreakCal(),
    _buildStreakCal:        ()    => _buildStreakCal(),
    _streakCalNav:          (a)   => _streakCalNav(Number(a)),
    _showDayDetail:         (a)   => _showDayDetail(a),
    _toggleDayExpand:       ()    => _toggleDayExpand(),
```

- [ ] **Step 2: Commit**

```bash
git add src/events.js
git commit -m "feat(calendar): register openCalendar and _toggleDayExpand actions"
```

---

### Task 4: Update Home Screen Calls

**Files:**
- Modify: `src/home.js:10-11` and `src/home.js:157`

- [ ] **Step 1: Replace _renderStreak with _renderCalBtn**

In `src/home.js`, line 10-11 inside `buildHome()`:

Replace:
```javascript
  _renderStreak();
```

With:
```javascript
  _renderCalBtn();
```

And at line 157 (the other `_renderStreak()` call), make the same replacement:

Replace:
```javascript
  _renderStreak();
```

With:
```javascript
  _renderCalBtn();
```

- [ ] **Step 2: Commit**

```bash
git add src/home.js
git commit -m "feat(calendar): call _renderCalBtn instead of _renderStreak on home"
```

---

### Task 5: Implement Calendar Button Rendering and Activity Dot

**Files:**
- Modify: `src/auth.js:1378-1387` (replace `_renderStreak` function)

- [ ] **Step 1: Replace _renderStreak with _renderCalBtn and _updateCalDot**

In `src/auth.js`, replace the `_renderStreak` function (lines 1378-1387):

```javascript
function _renderStreak(){
  const el = document.getElementById('streak-badge');
  if(!el) return;
  if(!STREAK.current){ el.style.display = 'none'; return; }
  el.style.display = 'inline-block';
  el.style.cursor = 'pointer';
  el.onclick = _openStreakCal;
  const best = STREAK.longest > STREAK.current ? ` <span style="opacity:.65;font-weight:400">· Best: ${STREAK.longest}</span>` : '';
  el.innerHTML = `${_fireSvg('sfb',22,30)} <strong>${STREAK.current}-day streak</strong>${best}`;
}
```

With:

```javascript
function _renderCalBtn(){
  const btn = document.getElementById('cal-btn');
  if(!btn) return;
  // Only show for authenticated users
  if(!_supaUser){ btn.style.display = 'none'; return; }
  btn.style.display = 'flex';
  // Stack below prof-btn if prof-btn is visible
  const prof = document.getElementById('prof-btn');
  if(prof && prof.style.display !== 'none'){
    btn.classList.add('cal-btn--stacked');
  } else {
    btn.classList.remove('cal-btn--stacked');
  }
  _updateCalDot();
}

function _updateCalDot(){
  const dot = document.getElementById('cal-dot');
  if(!dot) return;
  const todayStr = new Date().toISOString().slice(0,10);
  const actDates = safeLoad('wb_act_dates', []);
  if(actDates.indexOf(todayStr) !== -1){
    dot.classList.add('cal-dot--active');
  } else {
    dot.classList.remove('cal-dot--active');
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/auth.js
git commit -m "feat(calendar): implement _renderCalBtn and _updateCalDot"
```

---

### Task 6: Implement Milestone Badge Logic

**Files:**
- Modify: `src/auth.js` (add after `_updateCalDot`, before `_openStreakCal`)

- [ ] **Step 1: Add milestone helper function**

In `src/auth.js`, immediately after the `_updateCalDot` function, add:

```javascript
function _getMilestone(streak){
  if(streak >= 30) return { label: 'MATH LEGEND', gradient: 'linear-gradient(135deg,#ffd700,#ff8c00)' };
  if(streak >= 14) return { label: 'SUPER STUDENT', gradient: 'linear-gradient(135deg,#a29bfe,#6c5ce7)' };
  if(streak >= 7) return { label: 'WEEK WARRIOR', gradient: 'linear-gradient(135deg,#ff9500,#ff5a00)' };
  if(streak >= 3) return { label: 'GETTING STARTED', gradient: 'linear-gradient(135deg,#74b9ff,#0984e3)' };
  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/auth.js
git commit -m "feat(calendar): add _getMilestone badge helper"
```

---

### Task 7: Rebuild the Streak Calendar Modal

**Files:**
- Modify: `src/auth.js:1583-1616` (replace `_buildStreakCal`)

- [ ] **Step 1: Replace _buildStreakCal with condensed no-scroll version**

In `src/auth.js`, replace the entire `_buildStreakCal` function (lines 1583-1616):

```javascript
function _buildStreakCal(){
  const modal = document.getElementById('scal-modal');
  if(!modal) return;
  modal.dataset.calView = 'calendar';

  const FC = '#ff7700';
  const isDark = document.body.classList.contains('dark');
  const _bg = isDark
    ? 'background:rgba(255,255,255,.07);box-shadow:0 8px 40px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,0.12)'
    : 'background:linear-gradient(145deg,rgba(255,255,255,0.93) 0%,rgba(240,248,255,0.85) 55%,rgba(235,252,245,0.80) 100%);box-shadow:0 8px 40px rgba(60,120,200,0.18)';
  const _bdr = isDark
    ? 'border:1.5px solid rgba(255,255,255,0.12)'
    : 'border:1.5px solid rgba(255,255,255,0.85)';

  const ms = _getMilestone(STREAK.current);
  const msBadge = ms
    ? `<div style="margin-top:2px"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:8px;font-weight:800;letter-spacing:.4px;color:#fff;background:${ms.gradient}">${ms.label}</span></div>`
    : '';

  modal.innerHTML = `
  <div style="${_bg};${_bdr};backdrop-filter:blur(28px) saturate(160%) brightness(1.04);-webkit-backdrop-filter:blur(28px) saturate(160%) brightness(1.04);border-radius:24px;width:100%;max-width:340px;padding:12px 12px 16px">
    <div style="width:32px;height:3px;background:rgba(0,0,0,.12);border-radius:2px;margin:0 auto 10px"></div>
    <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:linear-gradient(135deg,rgba(255,119,0,.08),rgba(255,60,0,.04));border-radius:14px;border:1px solid rgba(255,119,0,.10);margin-bottom:10px">
      ${_fireSvg('scah',32,40)}
      <div style="flex:1;min-width:0">
        <div style="font-size:28px;font-weight:900;color:${FC};line-height:1;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif">${STREAK.current}</div>
        <div style="font-size:10px;font-weight:700;color:var(--txt2,#888);text-transform:uppercase;letter-spacing:.4px">Day Streak &middot; Best: ${STREAK.longest}</div>
        ${msBadge}
      </div>
    </div>
    <div id="scal-viewport" style="overflow:hidden;position:relative">
      <div id="scal-slide" style="position:relative;will-change:transform">
        ${_buildCalGridHTML(_scDate)}
      </div>
    </div>
    <div id="scal-day-panel"></div>
    <div style="text-align:center;margin-top:6px;font-size:9px;color:rgba(0,0,0,.25);font-weight:600">Tap outside or swipe down to close</div>
  </div>`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/auth.js
git commit -m "feat(calendar): rebuild _buildStreakCal as condensed no-scroll modal"
```

---

### Task 8: Update the Calendar Grid HTML

**Files:**
- Modify: `src/auth.js:1518-1581` (replace `_buildCalGridHTML`)

- [ ] **Step 1: Replace _buildCalGridHTML with compact grid (30px rows, 24px circles)**

In `src/auth.js`, replace the entire `_buildCalGridHTML` function:

```javascript
function _buildCalGridHTML(date){
  const FC = '#ff7700', GC = '#27ae60';
  const actSet = new Set(safeLoad('wb_act_dates', []));
  const todayStr = new Date().toISOString().slice(0,10);
  const y = date.getFullYear(), mo = date.getMonth();
  const monthLabel = date.toLocaleString('en-US',{month:'long',year:'numeric'});
  const firstDow = new Date(y, mo, 1).getDay();
  const daysInMo = new Date(y, mo+1, 0).getDate();
  const now = new Date();
  const isCurMo = (y === now.getFullYear() && mo === now.getMonth());
  const streakStart = STREAK.current > 0
    ? new Date(Date.now() - (STREAK.current-1)*86400000).toISOString().slice(0,10)
    : null;

  const pad = n => String(n).padStart(2,'0');
  let cells = '';
  for(let i=0;i<firstDow;i++) cells += '<div style="height:30px"></div>';

  for(let d=1; d<=daysInMo; d++){
    const ds = `${y}-${pad(mo+1)}-${pad(d)}`;
    const isAct = actSet.has(ds);
    const isToday = ds === todayStr;
    const isFuture = ds > todayStr;
    const inStreak = streakStart && ds >= streakStart && ds <= todayStr;
    const dow = (firstDow + d - 1) % 7;
    const prev = d>1 ? `${y}-${pad(mo+1)}-${pad(d-1)}` : null;
    const next = d<daysInMo ? `${y}-${pad(mo+1)}-${pad(d+1)}` : null;
    const prevConn = prev && actSet.has(prev) && dow !== 0;
    const nextConn = next && actSet.has(next) && dow !== 6;
    const col = inStreak ? FC : GC;
    const colL = inStreak ? 'rgba(255,119,0,.15)' : 'rgba(39,174,96,.15)';

    let pipBg='', pipTxt='var(--txt,#333)', pipEx='';
    if(isFuture){ pipTxt='var(--txt,#333);opacity:.3'; }
    else if(isAct){ pipBg=`background:${col};`; pipTxt='#fff'; }
    if(isToday && !isAct){ pipBg=`border:2px solid ${inStreak?col:FC};`; pipTxt=inStreak?col:FC; }
    else if(isToday && isAct){ pipEx=`box-shadow:0 0 0 2px #fff,0 0 0 3.5px ${col};`; }

    const bL = (isAct&&prevConn) ? `<div style="position:absolute;left:0;width:50%;height:18px;top:50%;transform:translateY(-50%);background:${colL}"></div>` : '';
    const bR = (isAct&&nextConn) ? `<div style="position:absolute;right:0;width:50%;height:18px;top:50%;transform:translateY(-50%);background:${colL}"></div>` : '';
    const fw = (isAct||isToday) ? '700' : '400';
    const clickAttr = isAct ? `data-action="_showDayDetail" data-arg="${ds}" style="position:relative;display:flex;align-items:center;justify-content:center;height:30px;cursor:pointer"` : `style="position:relative;display:flex;align-items:center;justify-content:center;height:30px"`;
    cells += `<div ${clickAttr}>${bL}${bR}<div style="position:relative;z-index:1;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:${fw};color:${pipTxt};font-family:'Nunito',sans-serif;${pipBg}${pipEx}">${d}</div></div>`;
  }

  const totalCells = firstDow + daysInMo;
  const padEnd = 42 - totalCells;
  for(let i=0;i<padEnd;i++) cells += '<div style="height:30px"></div>';

  const hdrs = ['S','M','T','W','T','F','S'].map(x=>`<div style="text-align:center;font-size:9px;font-weight:700;color:var(--txt2,#999);padding-bottom:2px;font-family:'Nunito',sans-serif">${x}</div>`).join('');
  const prevBtn = `<button data-action="_streakCalNav" data-arg="-1" style="background:none;border:none;font-size:16px;cursor:pointer;color:var(--txt,#444);padding:2px 10px;line-height:1">&#8249;</button>`;
  const nextBtn = isCurMo
    ? `<button style="background:none;border:none;font-size:16px;cursor:default;color:var(--txt,#444);padding:2px 10px;line-height:1;opacity:.25">&#8250;</button>`
    : `<button data-action="_streakCalNav" data-arg="1" style="background:none;border:none;font-size:16px;cursor:pointer;color:var(--txt,#444);padding:2px 10px;line-height:1">&#8250;</button>`;
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      ${prevBtn}
      <span style="font-weight:700;font-size:12px;color:var(--txt,#333);font-family:'Nunito',sans-serif">${monthLabel}</span>
      ${nextBtn}
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr)">${hdrs}</div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr)">${cells}</div>`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/auth.js
git commit -m "feat(calendar): compact calendar grid (30px rows, 24px circles)"
```

---

### Task 9: Rebuild Day Detail with Summary + Expandable Items

**Files:**
- Modify: `src/auth.js:1340-1376` (replace `_showDayDetail`)

- [ ] **Step 1: Replace _showDayDetail with summary + expandable panel**

In `src/auth.js`, replace the entire `_showDayDetail` function:

```javascript
function _showDayDetail(dateStr){
  const panel = document.getElementById('scal-day-panel');
  if(!panel) return;

  const formatted = new Date(dateStr+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const dateLabel = new Date(dateStr+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  const dayScores = SCORES.filter(s => s.date === formatted);

  if(dayScores.length === 0){
    panel.innerHTML = `<div style="margin-top:8px;padding:10px;text-align:center;font-size:10px;color:var(--txt2,#888);background:rgba(0,0,0,.03);border-radius:12px">No quiz records for this day.</div>`;
    return;
  }

  const total = dayScores.length;
  const avgPct = Math.round(dayScores.reduce((s,e)=>s+e.pct,0)/total);

  // Time from APP_TIME.dailySecs
  const appTime = safeLoad('wb_apptime', { dailySecs:{} });
  const daySecs = appTime.dailySecs?.[dateStr] || 0;
  const timeStr = daySecs >= 60 ? Math.round(daySecs/60)+'m' : (daySecs > 0 ? daySecs+'s' : '—');

  const typeLabel = t => t==='lesson'?'Lesson':t==='unit_quiz'?'Unit Quiz':t==='final'?'Final Test':'Quiz';
  const barColor = t => t==='lesson'?'#4a90d9':t==='unit_quiz'?'#27ae60':'#ff7700';
  const scoreColor = p => p>=90?'#27ae60':p>=80?'#4a90d9':'#e06000';

  const items = dayScores.map(s => `
    <div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:rgba(0,0,0,.04);border-radius:10px;margin-top:4px">
      <div style="width:3px;min-width:3px;height:28px;border-radius:2px;background:${barColor(s.type)}"></div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--txt,#333)">${_escHtml(s.label||s.qid)}</div>
        <div style="font-size:9px;color:var(--txt2,#888)">${typeLabel(s.type)} &middot; ${_escHtml(s.time||'')}</div>
      </div>
      <div style="font-size:13px;font-weight:900;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;color:${scoreColor(s.pct)}">${s.pct}%</div>
    </div>`).join('');

  panel.innerHTML = `
    <div style="margin-top:8px;padding:8px 10px;background:rgba(0,0,0,.03);border-radius:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:11px;font-weight:800;color:var(--txt,#333)">${dateLabel}</span>
        <span style="font-size:9px;color:var(--txt2,#888)">${total} activit${total===1?'y':'ies'}</span>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:6px">
        <div style="flex:1;text-align:center;padding:5px 2px;background:rgba(255,255,255,.6);border-radius:8px">
          <div style="font-size:14px;font-weight:900;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;color:#4a90d9">${total}</div>
          <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:var(--txt2,#888)">Quizzes</div>
        </div>
        <div style="flex:1;text-align:center;padding:5px 2px;background:rgba(255,255,255,.6);border-radius:8px">
          <div style="font-size:14px;font-weight:900;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;color:#27ae60">${avgPct}%</div>
          <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:var(--txt2,#888)">Avg</div>
        </div>
        <div style="flex:1;text-align:center;padding:5px 2px;background:rgba(255,255,255,.6);border-radius:8px">
          <div style="font-size:14px;font-weight:900;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;color:#ff7700">${timeStr}</div>
          <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:var(--txt2,#888)">Time</div>
        </div>
      </div>
      <div id="scal-expand-items" style="display:none">${items}</div>
      <div id="scal-expand-btn" data-action="_toggleDayExpand" style="padding:6px 10px;background:rgba(255,255,255,.5);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:10px;font-weight:700;color:var(--txt2,#666)">View details</span>
        <span id="scal-expand-arrow" style="font-size:10px;color:var(--txt2,#aaa)">&#9662;</span>
      </div>
    </div>`;
}

function _toggleDayExpand(){
  const items = document.getElementById('scal-expand-items');
  const btn = document.getElementById('scal-expand-btn');
  const arrow = document.getElementById('scal-expand-arrow');
  if(!items || !btn) return;
  const open = items.style.display !== 'none';
  items.style.display = open ? 'none' : 'block';
  if(arrow) arrow.innerHTML = open ? '&#9662;' : '&#9652;';
  btn.querySelector('span').textContent = open ? 'View details' : 'Hide details';
}
```

- [ ] **Step 2: Commit**

```bash
git add src/auth.js
git commit -m "feat(calendar): day detail with summary stats + expandable quiz items"
```

---

### Task 10: Update the Open/Close Logic

**Files:**
- Modify: `src/auth.js:1393-1494` (update `_openStreakCal` and `_closeStreakCal`)

- [ ] **Step 1: Update _openStreakCal to clear day panel on open**

In `src/auth.js`, inside the `_openStreakCal` function, the line `_buildStreakCal();` at the end (line 1489) should remain. But we need to ensure the day panel clears when navigating months.

In the `_streakCalNav` function, after `_buildStreakCal()` is called (the timeout callback), add a line to clear the day panel. Replace the timeout callback in `_streakCalNav` (around line 1504-1506):

Replace:
```javascript
    _scDate = new Date(_scDate.getFullYear(), _scDate.getMonth()+dir, 1);
    _buildStreakCal();
```

With:
```javascript
    _scDate = new Date(_scDate.getFullYear(), _scDate.getMonth()+dir, 1);
    _buildStreakCal();
    var dp = document.getElementById('scal-day-panel'); if(dp) dp.innerHTML = '';
```

Do the same for the touchend handler's committed path (around line 1471):

Replace:
```javascript
        setTimeout(() => { _scDate = new Date(_scDate.getFullYear(), _scDate.getMonth()+commitDir, 1); _buildStreakCal(); }, 250);
```

With:
```javascript
        setTimeout(() => { _scDate = new Date(_scDate.getFullYear(), _scDate.getMonth()+commitDir, 1); _buildStreakCal(); var dp = document.getElementById('scal-day-panel'); if(dp) dp.innerHTML = ''; }, 250);
```

And in the `_openStreakCal` backdrop click handler (around line 1401-1403):

Replace:
```javascript
      if(modal.dataset.calView === 'day') _buildStreakCal();
      else _closeStreakCal();
```

With:
```javascript
      _closeStreakCal();
```

This removes the "day view" sub-state since day detail is now inline below the grid, not a separate view. Backdrop click always closes.

- [ ] **Step 2: Commit**

```bash
git add src/auth.js
git commit -m "feat(calendar): update open/close/nav to clear day panel, backdrop always closes"
```

---

### Task 11: Update Tour Step

**Files:**
- Modify: `src/tour.js:184-189`

- [ ] **Step 1: Update the streak tour step to target cal-btn**

In `src/tour.js`, replace lines 184-189:

```javascript
    {
      sel: '#streak-badge',
      emoji: '🔥',
      title: 'Daily Streak',
      tip: 'Complete a lesson every day to build your streak! Tap the flame to open your streak calendar — see every day you practiced, your current run, and your all-time best. Only visible when signed in.'
    },
```

With:

```javascript
    {
      sel: '#cal-btn',
      emoji: '🔥',
      title: 'Streak Calendar',
      tip: 'Tap to see your streak calendar! Track your daily practice, view quiz scores for any day, and earn milestone badges as your streak grows. Only visible when signed in.'
    },
```

- [ ] **Step 2: Commit**

```bash
git add src/tour.js
git commit -m "feat(calendar): update tour step to target #cal-btn"
```

---

### Task 12: Build and Copy to Dist

**Files:**
- Run: `node build.js`
- Copy: `src/data/*.js` → `dist/data/*.js` (preserve data changes)

- [ ] **Step 1: Run the build**

```bash
cd "E:/Cameron Jones/my-math-roots"
node build.js
```

Expected: Build completes without errors, outputs to `dist/index.html`.

- [ ] **Step 2: Copy data files to dist (preserve unit quiz normalization)**

```bash
for n in 1 2 3 4 5 6 7 8 9 10; do cp "src/data/u${n}.js" "dist/data/u${n}.js"; done
```

- [ ] **Step 3: Verify the app loads**

Open `http://localhost:3001` in a browser. Verify:
1. Calendar button appears top-left (if signed in).
2. Tapping it opens the condensed modal with streak hero + milestone badge.
3. Calendar grid shows activity days with orange streak connectors.
4. Tapping an active day shows summary stats + expandable detail.
5. Swiping left/right navigates months with smooth animation.
6. Tapping backdrop closes the modal.
7. Profile button (if visible) sits above the calendar button.

- [ ] **Step 4: Commit build output**

```bash
git add dist/
git commit -m "build: rebuild dist with streak calendar redesign"
```

---

### Task 13: Final Verification and Cleanup

- [ ] **Step 1: Delete the temporary normalization scripts**

```bash
rm "E:/Cameron Jones/mymathroots-v2/scripts/normalize-v1-unitquiz.js"
rm "E:/Cameron Jones/mymathroots-v2/scripts/normalize-v2-unitquiz.js"
rm "E:/Cameron Jones/mymathroots-v2/scripts/verify-unitquiz-counts.js"
```

- [ ] **Step 2: Verify no references to #streak-badge remain in src/**

```bash
grep -r "streak-badge" src/
```

Expected: No matches (all references removed).

- [ ] **Step 3: Verify dark mode**

Toggle dark mode in settings. Verify the calendar button and modal both render correctly with dark theme colors.

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: cleanup temp scripts and verify calendar redesign"
```
