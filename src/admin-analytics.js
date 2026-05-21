// admin-analytics.js — standalone, NOT concatenated into app.js.
// Token-substituted by build.js: %%SUPA_URL%% / %%SUPA_KEY%%
// Requires CDN Supabase SDK (loaded in admin-analytics.html).
// XSS safety: all API data rendered via textContent/createElement — never innerHTML.
//
// Phase C.2: adds date-range + grade filters, MAU / total-students /
// drop-off-funnel / top-lessons / hint-usage / parent-action metrics, and
// reorganizes the layout into Overview / Active Users / Funnel / Engagement /
// Quiz Performance / Learning Insights / Parent Actions / Retention / Bill Risk.

(async function () {
  var SUPA_URL = '%%SUPA_URL%%';
  var SUPA_KEY = '%%SUPA_KEY%%';

  var elLoading  = document.getElementById('loading');
  var elAuthGate = document.getElementById('auth-gate');
  var elDash     = document.getElementById('dashboard');
  var elContent  = document.getElementById('dash-content');

  var supa = supabase.createClient(SUPA_URL, SUPA_KEY);
  var sessionData = await supa.auth.getSession();
  var session = sessionData.data && sessionData.data.session;

  if (!session) {
    elLoading.style.display = 'none';
    window.location.href = '/';
    return;
  }

  var authHdr = 'Bearer ' + session.access_token;

  // Admin smoke check
  var testRes = await fetch('/.netlify/functions/analytics-query?metric=bill_risk',
    { headers: { 'Authorization': authHdr } }).catch(function () { return { status: 500 }; });

  elLoading.style.display = 'none';

  if (testRes.status === 401 || testRes.status === 403) {
    elAuthGate.style.display = 'block';
    return;
  }

  elDash.style.display = 'block';

  // ── Filter state ────────────────────────────────────────────────────────
  // `breakdown` only applies to the Average Scores section (single RPC).
  // `from`/`to` (YYYY-MM-DD) are set only when the user picks Custom and
  // hits Apply with a valid range; when set, they override `days`.
  var filters = {
    days:      '30',
    grade:     'all',
    breakdown: 'lesson',
    from:      null,
    to:        null,
  };

  // Default custom-range inputs: today and 30 days ago. Stored separately
  // from `filters.from`/`filters.to` so editing the inputs doesn't fire a
  // refetch until Apply is clicked.
  function _todayStr()    { return new Date().toISOString().slice(0, 10); }
  function _daysAgoStr(n) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }
  var customDraft = { from: _daysAgoStr(30), to: _todayStr() };

  // Metric set — every RPC the admin page consumes.
  var METRICS = [
    // Phase A
    'dau', 'wau', 'session_duration', 'quiz_completion',
    'retention_1d', 'retention_7d', 'retention_30d',
    'top_grades', 'top_units', 'hardest_lessons',
    'error_tags', 'report_usage', 'bill_risk', 'parent_usage',
    // Phase C.2
    'mau', 'total_students', 'drop_off_funnel', 'top_lessons',
    'hint_usage', 'free_mode_usage', 'reset_usage', 'unlock_usage',
    // Phase C.3A
    'new_signups', 'returning_students', 'sessions_per_student', 'avg_score',
    // Phase C.3B
    'unique_site_visits',
    // Launch Gate (controlled beta)
    'launch_dashboard',
  ];

  function _buildQuery(metric) {
    var qs = '?metric=' + encodeURIComponent(metric);
    // Custom range (when both ends set) overrides the days preset; the
    // server-side helper drops `days` when from/to are valid anyway, but
    // sending both is clearer.
    if (filters.from && filters.to) {
      qs += '&from=' + encodeURIComponent(filters.from)
          + '&to='   + encodeURIComponent(filters.to);
    } else {
      qs += '&days=' + encodeURIComponent(filters.days);
    }
    if (filters.grade && filters.grade !== 'all') {
      qs += '&grade=' + encodeURIComponent(filters.grade);
    }
    if (metric === 'avg_score') {
      qs += '&breakdown=' + encodeURIComponent(filters.breakdown);
    }
    return '/.netlify/functions/analytics-query' + qs;
  }

  // Returns null on valid range, error string otherwise. Mirrors the
  // server-side _parseAnalyticsFilters guard so users see the issue before
  // hitting the network.
  function _validateCustomRange(from, to) {
    var re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(from || '') || !re.test(to || '')) return 'Use YYYY-MM-DD for both dates.';
    var dF = new Date(from + 'T00:00:00.000Z');
    var dT = new Date(to   + 'T00:00:00.000Z');
    if (isNaN(dF.getTime()) || dF.toISOString().slice(0,10) !== from) return 'Start date is not a real date.';
    if (isNaN(dT.getTime()) || dT.toISOString().slice(0,10) !== to)   return 'End date is not a real date.';
    if (dF.getTime() > dT.getTime()) return 'Start date is after end date.';
    if (dT.getTime() > Date.now() + 86400000) return 'End date is too far in the future.';
    return null;
  }

  async function _loadMetrics() {
    var results = await Promise.allSettled(METRICS.map(function (m) {
      return fetch(_buildQuery(m), { headers: { 'Authorization': authHdr } })
        .then(function (r) { return r.json(); })
        .then(function (data) { return { metric: m, data: data }; });
    }));
    var d = {};
    results.forEach(function (r) {
      if (r.status === 'fulfilled') d[r.value.metric] = r.value.data;
    });
    return d;
  }

  // ── Data helpers ────────────────────────────────────────────────────────
  function _first(d, key) { return (Array.isArray(d[key]) && d[key].length > 0) ? d[key][0] : null; }
  function _last (d, key) { var a = d[key]; return (Array.isArray(a) && a.length > 0) ? a[a.length - 1] : null; }
  function _sumField(d, key, field) {
    if (!Array.isArray(d[key])) return 0;
    return d[key].reduce(function (acc, row) { return acc + (parseFloat(row[field]) || 0); }, 0);
  }
  function _isArr(d, key) { return Array.isArray(d[key]); }

  // ── Format helpers ──────────────────────────────────────────────────────
  function _num(n)  { if (n == null) return '—'; var v = parseFloat(n); return isNaN(v) ? '—' : v.toLocaleString(); }
  function _pct(n)  { if (n == null) return '—'; var v = parseFloat(n); return isNaN(v) ? '—' : Math.round(v) + '%'; }
  function _mins(s) { if (s == null) return '—'; var v = Math.round(parseFloat(s) / 60); return isNaN(v) ? '—' : v + ' min'; }
  function _grade(g) { return g === 'K' ? 'Kindergarten' : 'Grade ' + g; }

  // ── DOM helpers ─────────────────────────────────────────────────────────
  function _el(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls)  el.className   = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function _section(title) {
    var sec = _el('div', 'section');
    sec.appendChild(_el('h2', 'section-title', title));
    return sec;
  }

  function _statCard(label, value, hint, badge) {
    var card = _el('div', 'stat-card');
    card.appendChild(_el('div', 'stat-label', label));
    card.appendChild(_el('div', 'stat-value', String(value)));
    if (hint)  card.appendChild(_el('div', 'stat-hint', hint));
    if (badge) card.appendChild(_el('div', badge.cls, badge.text));
    return card;
  }

  function _tableCard(title, headers, rows, emptyMsg) {
    var wrap = _el('div', 'table-card');
    wrap.appendChild(_el('div', 'table-card-title', title));
    if (!rows || rows.length === 0) {
      wrap.appendChild(_el('div', 'empty', emptyMsg || 'No data yet'));
      return wrap;
    }
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var hRow  = document.createElement('tr');
    headers.forEach(function (h) { hRow.appendChild(_el('th', null, h)); });
    thead.appendChild(hRow);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    rows.forEach(function (cells) {
      var tr = document.createElement('tr');
      cells.forEach(function (c) { tr.appendChild(_el('td', null, String(c))); });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function _retentionCard(label, explain, pct, cohortSize, retained) {
    var card = _el('div', 'retention-card');
    card.appendChild(_el('div', 'stat-label', label));
    var pctEl = _el('div', 'ret-pct');
    var n = parseFloat(pct);
    pctEl.textContent = (cohortSize === 0 || isNaN(n)) ? '—' : Math.round(n) + '%';
    if (cohortSize === 0 || isNaN(n)) pctEl.className = 'ret-pct color-none';
    else if (n >= 40)                 pctEl.className = 'ret-pct color-high';
    else if (n >= 20)                 pctEl.className = 'ret-pct color-mid';
    else                              pctEl.className = 'ret-pct color-low';
    card.appendChild(pctEl);
    var detail = _el('div', 'ret-detail');
    detail.textContent = cohortSize > 0
      ? retained + ' of ' + cohortSize + ' students came back'
      : 'Not enough data yet';
    card.appendChild(detail);
    card.appendChild(_el('div', 'ret-explain', explain));
    return card;
  }

  function _funnelRow(stage, label, students, events, prevStudents) {
    var row = _el('div', 'funnel-row');
    row.appendChild(_el('div', 'funnel-stage', label));
    var bar = _el('div', 'funnel-bar');
    var fill = _el('div', 'funnel-fill');
    var pctOfFirst = prevStudents > 0 ? (students / prevStudents) * 100 : 0;
    fill.style.width = Math.max(0, Math.min(100, pctOfFirst)) + '%';
    bar.appendChild(fill);
    row.appendChild(bar);
    var counts = _el('div', 'funnel-counts');
    counts.appendChild(_el('span', 'funnel-students', _num(students) + ' student' + (students === 1 ? '' : 's')));
    counts.appendChild(_el('span', 'funnel-events',   _num(events)   + ' event'   + (events   === 1 ? '' : 's')));
    if (prevStudents > 0 && students < prevStudents) {
      var dropPct = Math.round((1 - students / prevStudents) * 100);
      counts.appendChild(_el('span', 'funnel-drop', '-' + dropPct + '% drop'));
    }
    row.appendChild(counts);
    return row;
  }

  // ── Launch Controls (controlled beta) ───────────────────────────────────
  function _buildLaunchControls(d) {
    var sec = _section('Launch Controls');
    var lc  = (Array.isArray(d.launch_dashboard) && d.launch_dashboard.length > 0) ? d.launch_dashboard[0] : null;

    if (!lc) {
      sec.appendChild(_el('div', 'empty', 'Could not load launch settings.'));
      return sec;
    }

    var wrap = _el('div', 'launch-controls');

    // Status badges row
    var statRow = _el('div', 'stats-grid');
    var capUsed = lc.current_parent_accounts || 0;
    var capMax  = lc.max_parent_accounts || 0;
    var pct     = capMax > 0 ? Math.round((capUsed / capMax) * 100) : 0;
    statRow.appendChild(_statCard('Parent accounts',
      _num(capUsed) + ' / ' + _num(capMax),
      'Currently ' + pct + '% of cap used'));
    statRow.appendChild(_statCard('Student profiles',
      _num(lc.current_student_profiles),
      'Cap: ' + _num(lc.max_students_per_parent) + ' per parent'));
    statRow.appendChild(_statCard('Waitlist',
      _num(lc.waitlist_count),
      'Pending entries'));
    statRow.appendChild(_statCard('Signup state',
      lc.signup_enabled ? (capUsed >= capMax ? 'Cap reached' : 'Open') : 'Closed',
      lc.signup_enabled
        ? (capUsed >= capMax ? 'Waitlist active' : 'Accepting new signups')
        : 'Manually disabled'));
    wrap.appendChild(statRow);

    // Editor card
    var card = _el('div', 'launch-editor');

    function row(labelText, inputEl, hintText) {
      var r = _el('div', 'launch-row');
      var l = _el('label', 'launch-label', labelText);
      r.appendChild(l);
      r.appendChild(inputEl);
      if (hintText) r.appendChild(_el('div', 'launch-hint', hintText));
      return r;
    }

    var signupSel = document.createElement('select');
    signupSel.id = 'lc-signup-enabled';
    [['true','Open — accepting new signups'], ['false','Closed — waitlist only']].forEach(function(opt){
      var o = document.createElement('option');
      o.value = opt[0]; o.textContent = opt[1];
      if ((opt[0] === 'true') === !!lc.signup_enabled) o.selected = true;
      signupSel.appendChild(o);
    });
    card.appendChild(row('Signup status', signupSel,
      'Closed forces every visitor to the waitlist regardless of cap.'));

    var waitSel = document.createElement('select');
    waitSel.id = 'lc-waitlist-enabled';
    [['true','Open — visitors can join'], ['false','Closed — hide form']].forEach(function(opt){
      var o = document.createElement('option');
      o.value = opt[0]; o.textContent = opt[1];
      if ((opt[0] === 'true') === !!lc.waitlist_enabled) o.selected = true;
      waitSel.appendChild(o);
    });
    card.appendChild(row('Waitlist', waitSel,
      'Set to Closed if you do not want to collect emails right now.'));

    var capInp = document.createElement('input');
    capInp.type = 'number'; capInp.min = '1'; capInp.max = '100000';
    capInp.id = 'lc-max-parent'; capInp.value = String(lc.max_parent_accounts);
    card.appendChild(row('Max parent accounts', capInp,
      'When parent accounts reach this number, new signups are blocked.'));

    var stuInp = document.createElement('input');
    stuInp.type = 'number'; stuInp.min = '1'; stuInp.max = '50';
    stuInp.id = 'lc-max-students'; stuInp.value = String(lc.max_students_per_parent);
    card.appendChild(row('Max student profiles per parent', stuInp,
      'Enforced server-side via a database trigger.'));

    var msg = _el('div', 'launch-msg');
    msg.id = 'lc-msg';
    card.appendChild(msg);

    var btn = document.createElement('button');
    btn.className = 'apply-btn';
    btn.textContent = 'Save Launch Settings';
    btn.addEventListener('click', _saveLaunchSettings);
    card.appendChild(btn);

    wrap.appendChild(card);
    sec.appendChild(wrap);
    return sec;
  }

  async function _saveLaunchSettings() {
    var msg = document.getElementById('lc-msg');
    if (msg) { msg.textContent = 'Saving…'; msg.className = 'launch-msg pending'; }
    var body = {
      signup_enabled:          document.getElementById('lc-signup-enabled').value === 'true',
      waitlist_enabled:        document.getElementById('lc-waitlist-enabled').value === 'true',
      max_parent_accounts:     parseInt(document.getElementById('lc-max-parent').value, 10),
      max_students_per_parent: parseInt(document.getElementById('lc-max-students').value, 10),
    };
    try {
      var r = await fetch('/.netlify/functions/analytics-query?metric=update_launch_settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHdr },
        body:    JSON.stringify(body),
      });
      var json = await r.json().catch(function(){ return {}; });
      if (!r.ok) {
        if (msg) { msg.textContent = '⚠️ ' + (json.error || 'Save failed.'); msg.className = 'launch-msg error'; }
        return;
      }
      if (msg) { msg.textContent = '✅ Saved. Reloading dashboard…'; msg.className = 'launch-msg ok'; }
      try {
        // Best-effort fire-and-forget event so we can see who tweaks the gate.
        if (window._supa) await window._supa.rpc('app_event_noop').catch(()=>{});
      } catch (_) {}
      // Reload to reflect new cap/status across all sections.
      setTimeout(function(){ window.location.reload(); }, 600);
    } catch (e) {
      if (msg) { msg.textContent = '⚠️ Network error.'; msg.className = 'launch-msg error'; }
    }
  }

  // ── Filter controls ─────────────────────────────────────────────────────
  function _buildFilters() {
    var wrap = _el('div', 'filters');
    wrap.appendChild(_el('h2', 'section-title', 'Filters'));

    var grid = _el('div', 'filter-grid');

    // Days (incl. Custom option)
    var dCol = _el('div', 'filter-col');
    dCol.appendChild(_el('label', 'filter-label', 'Date range'));
    var dSel = document.createElement('select');
    dSel.id = 'filter-days';
    var isCustom = !!(filters.from && filters.to);
    var presetValue = isCustom ? 'custom' : filters.days;
    [['7','Last 7 days'],['30','Last 30 days'],['90','Last 90 days'],['custom','Custom…']].forEach(function(opt){
      var o = document.createElement('option');
      o.value = opt[0]; o.textContent = opt[1];
      if (opt[0] === presetValue) o.selected = true;
      dSel.appendChild(o);
    });
    dSel.addEventListener('change', function(){
      if (dSel.value === 'custom') {
        // Show the date inputs panel; don't refetch yet.
        var panel = document.getElementById('custom-range-panel');
        if (panel) panel.style.display = '';
      } else {
        // Pick a preset — clear any custom range and refetch.
        filters.days = dSel.value;
        filters.from = null;
        filters.to   = null;
        _refresh();
      }
    });
    dCol.appendChild(dSel);
    grid.appendChild(dCol);

    // Grade
    var gCol = _el('div', 'filter-col');
    gCol.appendChild(_el('label', 'filter-label', 'Grade'));
    var gSel = document.createElement('select');
    gSel.id = 'filter-grade';
    [['all','All grades'],['K','Kindergarten'],['1','Grade 1'],['2','Grade 2']].forEach(function(opt){
      var o = document.createElement('option');
      o.value = opt[0]; o.textContent = opt[1];
      if (opt[0] === filters.grade) o.selected = true;
      gSel.appendChild(o);
    });
    gSel.addEventListener('change', function(){ filters.grade = gSel.value; _refresh(); });
    gCol.appendChild(gSel);
    grid.appendChild(gCol);

    wrap.appendChild(grid);

    // Custom range panel — hidden unless user picks Custom (or has one active)
    var panel = _el('div', 'custom-range-panel');
    panel.id = 'custom-range-panel';
    panel.style.display = isCustom ? '' : 'none';

    var draftFrom = isCustom ? filters.from : customDraft.from;
    var draftTo   = isCustom ? filters.to   : customDraft.to;

    var fromCol = _el('div', 'filter-col');
    fromCol.appendChild(_el('label', 'filter-label', 'Start date'));
    var fromIn = document.createElement('input');
    fromIn.type = 'date'; fromIn.value = draftFrom; fromIn.id = 'custom-from';
    fromIn.addEventListener('input', function(){ customDraft.from = fromIn.value; });
    fromCol.appendChild(fromIn);

    var toCol = _el('div', 'filter-col');
    toCol.appendChild(_el('label', 'filter-label', 'End date'));
    var toIn = document.createElement('input');
    toIn.type = 'date'; toIn.value = draftTo; toIn.id = 'custom-to';
    toIn.addEventListener('input', function(){ customDraft.to = toIn.value; });
    toCol.appendChild(toIn);

    var actCol = _el('div', 'filter-col custom-range-actions');
    actCol.appendChild(_el('label', 'filter-label', ' '));  // align with sibling labels
    var apply = document.createElement('button');
    apply.type = 'button';
    apply.className = 'apply-btn';
    apply.textContent = 'Apply range';
    var err = _el('div', 'custom-range-error');
    err.id = 'custom-range-error';
    err.style.display = 'none';
    apply.addEventListener('click', function(){
      var msg = _validateCustomRange(customDraft.from, customDraft.to);
      if (msg) {
        err.textContent = msg;
        err.style.display = '';
        return;
      }
      err.style.display = 'none';
      filters.from = customDraft.from;
      filters.to   = customDraft.to;
      // `days` is now ignored because from/to are set; keep last preset for
      // a clean revert if the user switches back.
      _refresh();
    });
    actCol.appendChild(apply);

    var inputsGrid = _el('div', 'filter-grid custom-range-grid');
    inputsGrid.appendChild(fromCol);
    inputsGrid.appendChild(toCol);
    inputsGrid.appendChild(actCol);
    panel.appendChild(inputsGrid);
    panel.appendChild(err);

    wrap.appendChild(panel);
    return wrap;
  }

  function _windowLabel() {
    var range = (filters.from && filters.to)
      ? (filters.from + ' → ' + filters.to)
      : ('Last ' + filters.days + ' days');
    return range + (filters.grade !== 'all' ? ' · ' + _grade(filters.grade) : '');
  }

  // ── Render ──────────────────────────────────────────────────────────────
  function _renderAll(d) {
    elContent.innerHTML = '';

    // The static <h1>/<p class="subtitle"> already exist in admin-analytics.html;
    // update the subtitle text to reflect the active filter window instead of
    // appending a duplicate.
    var staticSub = document.querySelector('#dashboard > .subtitle');
    if (staticSub) staticSub.textContent = 'Internal Analytics — Admin only · ' + _windowLabel();

    elContent.appendChild(_buildFilters());

    // ──────────────────────────────────────────────────────────────────────
    // Section: Launch Controls (controlled beta)
    // ──────────────────────────────────────────────────────────────────────
    elContent.appendChild(_buildLaunchControls(d));

    // ──────────────────────────────────────────────────────────────────────
    // Section: Active Users (DAU/WAU/MAU + total students)
    // ──────────────────────────────────────────────────────────────────────
    var secActive = _section('Active Users');
    var gActive   = _el('div', 'stats-grid');

    var dauRow = _last (d, 'dau');
    var wauRow = _last (d, 'wau');
    var mauRow = _first(d, 'mau');
    var tsRow  = _first(d, 'total_students');

    gActive.appendChild(_statCard('Daily active students',
      _num(dauRow && dauRow.dau),
      'Students who started at least one session today'));
    gActive.appendChild(_statCard('Weekly active students',
      _num(wauRow && wauRow.wau),
      'Distinct students with a session this week'));
    gActive.appendChild(_statCard('Monthly active students',
      _num(mauRow && mauRow.mau),
      'Distinct students with a session in the selected window'));
    gActive.appendChild(_statCard('Total student profiles',
      _num(tsRow && tsRow.total),
      tsRow ? _num(tsRow.with_recent_activity) + ' active in last 30 days' : 'No data yet'));

    secActive.appendChild(gActive);
    elContent.appendChild(secActive);

    // ──────────────────────────────────────────────────────────────────────
    // Section: Growth & Engagement (Phase C.3A)
    // ──────────────────────────────────────────────────────────────────────
    var secGrowth = _section('Growth & Engagement');
    var gGrowth   = _el('div', 'stats-grid');

    var signups   = _isArr(d, 'new_signups') ? d['new_signups'] : [];
    var totalP    = signups.reduce(function(a, r){ return a + (parseInt(r.parent_signups)  || 0); }, 0);
    var totalS    = signups.reduce(function(a, r){ return a + (parseInt(r.student_signups) || 0); }, 0);
    var ret       = _first(d, 'returning_students');
    var sps       = _first(d, 'sessions_per_student');
    var visits    = _isArr(d, 'unique_site_visits') ? d['unique_site_visits'] : [];
    var totalVisits = visits.reduce(function(a, r){ return a + (parseInt(r.unique_visitors) || 0); }, 0);

    gGrowth.appendChild(_statCard('New parent accounts',
      _num(totalP),
      'Parent accounts created in the selected window'));
    gGrowth.appendChild(_statCard('New student profiles',
      _num(totalS),
      'Student profiles added in the selected window'));
    gGrowth.appendChild(_statCard('Returning students',
      ret && ret.active_students > 0 ? _pct(ret.returning_pct) : '—',
      ret && ret.active_students > 0
        ? _num(ret.returning_count) + ' of ' + _num(ret.active_students) + ' active students returned on a 2nd day'
        : 'Not enough data yet'));
    gGrowth.appendChild(_statCard('Avg sessions per student',
      sps && sps.active_students > 0 ? _num(sps.avg_sessions) : '—',
      sps && sps.active_students > 0
        ? 'Range: ' + _num(sps.min_sessions) + '–' + _num(sps.max_sessions) + ' across ' + _num(sps.active_students) + ' students'
        : 'Not enough data yet'));
    gGrowth.appendChild(_statCard('Unique site visits',
      visits.length > 0 ? _num(totalVisits) : '—',
      visits.length > 0
        ? 'Distinct anonymous browsers that loaded the login page in the selected window'
        : 'No visit data yet — starts tracking from deploy'));

    secGrowth.appendChild(gGrowth);
    elContent.appendChild(secGrowth);

    // ──────────────────────────────────────────────────────────────────────
    // Section: Drop-off Funnel
    // ──────────────────────────────────────────────────────────────────────
    var secFunnel = _section('Drop-off Funnel');
    var funnelData = _isArr(d, 'drop_off_funnel') ? d['drop_off_funnel'].slice() : [];
    funnelData.sort(function(a, b){ return (a.step_idx||0) - (b.step_idx||0); });
    if (funnelData.length === 0) {
      secFunnel.appendChild(_el('div', 'empty', 'No funnel data yet'));
    } else {
      var labels = {
        app_opened:         '1. App opened',
        student_app_opened: '2. Student app opened',
        unit_viewed:        '3. Unit viewed',
        lesson_viewed:      '4. Lesson viewed',
        quiz_started:       '5. Quiz started',
        quiz_completed:     '6. Quiz completed',
        quiz_abandoned:     '*  Quiz abandoned',
      };
      var first = funnelData.find(function(s){ return s.stage === 'app_opened'; });
      var anchor = (first && parseInt(first.students)) || 0;
      // app_opened → lesson_viewed → quiz_started/completed funnel
      var orderedKeep = ['app_opened','student_app_opened','unit_viewed','lesson_viewed','quiz_started','quiz_completed'];
      var prev = anchor;
      orderedKeep.forEach(function(stage){
        var row = funnelData.find(function(s){ return s.stage === stage; });
        if (!row) return;
        secFunnel.appendChild(_funnelRow(stage, labels[stage] || stage,
          parseInt(row.students) || 0, parseInt(row.events) || 0, prev));
        prev = parseInt(row.students) || 0;
      });
      // Quiz abandoned shown separately (off-funnel)
      var abandonRow = funnelData.find(function(s){ return s.stage === 'quiz_abandoned'; });
      if (abandonRow) {
        var qsRow = funnelData.find(function(s){ return s.stage === 'quiz_started'; });
        secFunnel.appendChild(_funnelRow('quiz_abandoned', labels.quiz_abandoned,
          parseInt(abandonRow.students) || 0,
          parseInt(abandonRow.events) || 0,
          (qsRow ? parseInt(qsRow.students) : 0) || 0));
      }
    }
    elContent.appendChild(secFunnel);

    // ──────────────────────────────────────────────────────────────────────
    // Section: Engagement (sessions / avg duration / top grades + units)
    // ──────────────────────────────────────────────────────────────────────
    var secEng = _section('Engagement');
    var gEng   = _el('div', 'stats-grid');

    var sesRow = _first(d, 'session_duration');
    var parentTotal = _sumField(d, 'parent_usage', 'opens');

    gEng.appendChild(_statCard('Total sessions',
      _num(sesRow && sesRow.session_count),
      'Student sessions started in the selected window'));
    gEng.appendChild(_statCard('Avg. session length',
      sesRow ? _mins(sesRow.avg_duration_secs) : '—',
      'Average time a student spends in a single session'));
    gEng.appendChild(_statCard('Parent dashboard opens',
      _num(parentTotal),
      'Parent dashboard sessions in the selected window'));

    secEng.appendChild(gEng);

    var engTables = _el('div', 'tables-row');
    var gradeRows = _isArr(d, 'top_grades')
      ? d['top_grades'].map(function (r) { return [_grade(r.grade), _num(r.student_count) + ' students']; })
      : [];
    engTables.appendChild(_tableCard('Most active grades',
      ['Grade', 'Active students'], gradeRows, 'No grade data yet'));

    var unitRows = _isArr(d, 'top_units')
      ? d['top_units'].slice(0, 10).map(function (r) {
          return [r.unit_id, _num(r.start_count), _num(r.unique_students)];
        }) : [];
    engTables.appendChild(_tableCard('Most used units',
      ['Unit', 'Times started', 'Unique students'], unitRows, 'No unit activity yet'));

    secEng.appendChild(engTables);
    elContent.appendChild(secEng);

    // ──────────────────────────────────────────────────────────────────────
    // Section: Top Lessons
    // ──────────────────────────────────────────────────────────────────────
    var secTopL = _section('Top Lessons');
    var topLessonRows = _isArr(d, 'top_lessons')
      ? d['top_lessons'].slice(0, 15).map(function (r) {
          return [r.lesson_id, _num(r.views), _num(r.starts), _num(r.completions), _num(r.unique_students)];
        }) : [];
    secTopL.appendChild(_tableCard('Most used lessons',
      ['Lesson', 'Views', 'Quiz starts', 'Completions', 'Unique students'],
      topLessonRows, 'No lesson activity yet'));
    elContent.appendChild(secTopL);

    // ──────────────────────────────────────────────────────────────────────
    // Section: Average Scores (Phase C.3A) — breakdown by grade/unit/lesson
    // ──────────────────────────────────────────────────────────────────────
    var secAvg = _section('Average Scores');

    var tabBar  = _el('div', 'tab-bar');
    [['lesson','By lesson'],['unit','By unit'],['grade','By grade']].forEach(function(opt){
      var btn = _el('button', 'tab-btn' + (filters.breakdown === opt[0] ? ' tab-active' : ''), opt[1]);
      btn.type = 'button';
      btn.addEventListener('click', function(){
        if (filters.breakdown === opt[0]) return;
        filters.breakdown = opt[0];
        _refresh();
      });
      tabBar.appendChild(btn);
    });
    secAvg.appendChild(tabBar);

    var avgRows = _isArr(d, 'avg_score')
      ? d['avg_score'].slice(0, 30).map(function(r){
          return [r.key || '—', _pct(r.avg_pct), _num(r.attempts), _num(r.unique_students)];
        }) : [];
    var bdHeader = filters.breakdown.charAt(0).toUpperCase() + filters.breakdown.slice(1);
    var avgTable = _tableCard('Avg score by ' + filters.breakdown,
      [bdHeader, 'Avg score', 'Attempts', 'Unique students'],
      avgRows,
      avgRows.length === 0
        ? 'No completed attempts with score data in this slice yet.'
        : 'No data');
    secAvg.appendChild(avgTable);

    var note = _el('p', 'section-note',
      'Based on quiz_completed and lesson_completed events that include a score percentage. Quit and abandoned attempts are excluded.');
    secAvg.appendChild(note);

    elContent.appendChild(secAvg);

    // ──────────────────────────────────────────────────────────────────────
    // Section: Quiz Performance
    // ──────────────────────────────────────────────────────────────────────
    var secQuiz = _section('Quiz Performance');
    var gQuiz   = _el('div', 'stats-grid');
    var quizRow = _first(d, 'quiz_completion');

    gQuiz.appendChild(_statCard('Quizzes started',
      quizRow ? _num(quizRow.started) : '—',
      'Total quizzes started in the window'));
    gQuiz.appendChild(_statCard('Quiz completion rate',
      quizRow ? _pct(quizRow.completion_pct) : '—',
      'Students who finished a quiz without quitting'));
    gQuiz.appendChild(_statCard('Quiz abandonment rate',
      quizRow ? _pct(quizRow.abandonment_pct) : '—',
      'Students who quit or gave up before finishing'));
    gQuiz.appendChild(_statCard('Completed quizzes',
      quizRow ? _num(quizRow.completed) : '—',
      'Distinct from started — counted by quiz_completed events'));
    secQuiz.appendChild(gQuiz);
    elContent.appendChild(secQuiz);

    // ──────────────────────────────────────────────────────────────────────
    // Section: Learning Insights (hardest lessons + error tags + hints)
    // ──────────────────────────────────────────────────────────────────────
    var secInsights = _section('Learning Insights');

    var hardRows = _isArr(d, 'hardest_lessons')
      ? d['hardest_lessons'].slice(0, 10).map(function (r) {
          var rate = parseFloat(r.interventions_per_start);
          return [
            r.lesson_id, _num(r.starts), _num(r.interventions),
            isNaN(rate) ? '—' : rate.toFixed(2),
            _pct(r.resolution_pct),
          ];
        }) : [];
    secInsights.appendChild(_tableCard(
      'Hardest lessons — ranked by how often students need help',
      ['Lesson', 'Starts', 'Help shown', 'Help per start', 'Resolved correctly'],
      hardRows,
      'No lesson data yet — start some lessons to see difficulty rankings'));

    var insightsTables = _el('div', 'tables-row');
    var tagRows = _isArr(d, 'error_tags')
      ? d['error_tags'].slice(0, 10).map(function (r) {
          return [r.error_tag || '—', _num(r.occurrences), _num(r.affected_students)];
        }) : [];
    insightsTables.appendChild(_tableCard('Most common mistakes',
      ['Error type', 'Times seen', 'Students affected'], tagRows,
      'No errors logged yet — errors appear when interventions are triggered'));

    // Hint usage card
    var hintRow = _first(d, 'hint_usage');
    var hintsTotal = hintRow ? parseInt(hintRow.total_hints) || 0 : 0;
    var hintsStudents = hintRow ? parseInt(hintRow.unique_students) || 0 : 0;
    var hintsPerStudent = hintRow && hintRow.hints_per_student != null ? hintRow.hints_per_student : null;
    var hintsGrid = _el('div', 'stats-grid');
    hintsGrid.appendChild(_statCard('Hints revealed',
      _num(hintsTotal),
      'First-reveal count — one per question max'));
    hintsGrid.appendChild(_statCard('Students using hints',
      _num(hintsStudents),
      'Pseudonymous students who tapped at least one hint'));
    hintsGrid.appendChild(_statCard('Hints per student',
      hintsPerStudent != null ? hintsPerStudent : '—',
      'Average reveals per student over the window'));
    insightsTables.appendChild(hintsGrid);

    secInsights.appendChild(insightsTables);
    elContent.appendChild(secInsights);

    // ──────────────────────────────────────────────────────────────────────
    // Section: Parent Actions (free mode / reset / unlock)
    // ──────────────────────────────────────────────────────────────────────
    var secParent = _section('Parent Actions');
    var gParent   = _el('div', 'stats-grid');

    var fm     = _first(d, 'free_mode_usage');
    var reset  = _first(d, 'reset_usage');
    var unlock = _isArr(d, 'unlock_usage') ? d['unlock_usage'] : [];

    gParent.appendChild(_statCard('Free Mode toggles',
      fm ? _num(fm.total) : '—',
      fm ? (_num(fm.turned_on) + ' on · ' + _num(fm.turned_off) + ' off · ' + _num(fm.unique_parents) + ' parent' + (fm.unique_parents === 1 ? '' : 's')) : 'No data yet'));

    gParent.appendChild(_statCard('Student resets',
      reset ? _num(reset.total) : '—',
      reset ? (_num(reset.unique_parents) + ' parent' + (reset.unique_parents === 1 ? '' : 's') + ' · ' + _num(reset.unique_students) + ' student' + (reset.unique_students === 1 ? '' : 's')) : 'No data yet'));

    var unlockTotal = unlock.reduce(function(a, r){ return a + (parseInt(r.total) || 0); }, 0);
    gParent.appendChild(_statCard('Manual unlock changes',
      _num(unlockTotal),
      unlock.length ? unlock.length + ' scope/action breakdowns below' : 'No data yet'));

    secParent.appendChild(gParent);

    if (unlock.length > 0) {
      var unlockRows = unlock.map(function(r){
        return [r.scope || '—', r.action || '—', _num(r.total), _num(r.unique_parents)];
      });
      secParent.appendChild(_tableCard('Unlock breakdown',
        ['Scope', 'Action', 'Total', 'Unique parents'], unlockRows, 'No data yet'));
    }

    elContent.appendChild(secParent);

    // ──────────────────────────────────────────────────────────────────────
    // Section: Retention (1d / 7d / 30d)
    // ──────────────────────────────────────────────────────────────────────
    var secRet = _section('Retention');
    var rGrid  = _el('div', 'retention-grid');

    var r1  = _first(d, 'retention_1d');
    var r7  = _first(d, 'retention_7d');
    var r30 = _first(d, 'retention_30d');

    rGrid.appendChild(_retentionCard('Back the next day',
      'Of students who used the app yesterday, how many returned today. Good apps see 30–50%.',
      r1 ? r1.retention_pct : null,
      r1 ? parseInt(r1.cohort_size) || 0 : 0,
      r1 ? parseInt(r1.retained)    || 0 : 0));
    rGrid.appendChild(_retentionCard('Back within 7 days',
      'Of students active 7–14 days ago, how many came back in the last 7 days. Strong apps see 20–40%.',
      r7 ? r7.retention_pct : null,
      r7 ? parseInt(r7.cohort_size) || 0 : 0,
      r7 ? parseInt(r7.retained)    || 0 : 0));
    rGrid.appendChild(_retentionCard('Back within 30 days',
      'Of students active 30–60 days ago, how many came back in the last 30 days. Strong apps see 15–30%.',
      r30 ? r30.retention_pct : null,
      r30 ? parseInt(r30.cohort_size) || 0 : 0,
      r30 ? parseInt(r30.retained)    || 0 : 0));

    secRet.appendChild(rGrid);
    elContent.appendChild(secRet);

    // ──────────────────────────────────────────────────────────────────────
    // Section: AI Reports & Bill Risk
    // ──────────────────────────────────────────────────────────────────────
    var secBill = _section('AI Reports — Bill Risk (Gemini API)');
    var gBill   = _el('div', 'stats-grid');
    var billRow   = _first(d, 'bill_risk');
    var calls24h  = billRow ? (parseInt(billRow.gemini_calls_24h)  || 0) : 0;
    var calls7d   = billRow ? (parseInt(billRow.gemini_calls_7d)   || 0) : 0;
    var parents7d = billRow ? (parseInt(billRow.unique_parents_7d) || 0) : 0;
    var reportTotal = _sumField(d, 'report_usage', 'report_count');

    gBill.appendChild(_statCard('AI reports generated',
      _num(reportTotal), 'In the selected window'));
    gBill.appendChild(_statCard('Reports in last 24h',
      _num(calls24h), 'Each AI report = 1 Gemini API call',
      calls24h > 50 ? { cls: 'badge badge-high', text: 'High — check for abuse' }
        : calls24h > 20 ? { cls: 'badge badge-warn', text: 'Elevated' }
        : { cls: 'badge badge-ok', text: 'Normal' }));
    gBill.appendChild(_statCard('Reports in last 7 days',
      _num(calls7d), 'Total reports this week',
      calls7d > 200 ? { cls: 'badge badge-high', text: 'High' }
        : calls7d > 100 ? { cls: 'badge badge-warn', text: 'Elevated' }
        : { cls: 'badge badge-ok', text: 'Normal' }));
    gBill.appendChild(_statCard('Unique parents using AI reports',
      _num(parents7d), 'Parents who generated at least one report (last 7 days)'));

    secBill.appendChild(gBill);
    elContent.appendChild(secBill);
  }

  // ── Refresh on filter change ────────────────────────────────────────────
  async function _refresh() {
    // Show a lightweight loading state on top of the existing render so the
    // user sees feedback while metrics refetch.
    var statusEl = document.getElementById('refresh-status');
    if (!statusEl) {
      statusEl = _el('div', 'refresh-status', 'Refreshing…');
      statusEl.id = 'refresh-status';
      document.body.appendChild(statusEl);
    } else {
      statusEl.textContent = 'Refreshing…';
      statusEl.style.display = 'block';
    }
    try {
      var d = await _loadMetrics();
      _renderAll(d);
    } catch (e) {
      var err = _el('div', 'error-banner', 'Failed to load analytics: ' + (e && e.message || 'unknown error'));
      elContent.innerHTML = '';
      elContent.appendChild(err);
    } finally {
      if (statusEl) statusEl.style.display = 'none';
    }
  }

  // Initial render
  await _refresh();
})();
