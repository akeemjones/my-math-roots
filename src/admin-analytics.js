// admin-analytics.js — standalone, NOT concatenated into app.js.
// Token-substituted by build.js: %%SUPA_URL%% / %%SUPA_KEY%%
// Requires CDN Supabase SDK (loaded in admin-analytics.html).
// XSS safety: all API data rendered via textContent/createElement — never innerHTML.

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

  var testRes = await fetch('/.netlify/functions/analytics-query?metric=bill_risk',
    { headers: { 'Authorization': authHdr } }).catch(function () { return { status: 500 }; });

  elLoading.style.display = 'none';

  if (testRes.status === 401 || testRes.status === 403) {
    elAuthGate.style.display = 'block';
    return;
  }

  elDash.style.display = 'block';

  var METRICS = [
    'dau', 'wau', 'session_duration', 'quiz_completion',
    'retention_1d', 'retention_7d', 'retention_30d',
    'top_grades', 'top_units', 'hardest_lessons',
    'error_tags', 'report_usage', 'bill_risk', 'parent_usage',
  ];

  var results = await Promise.allSettled(METRICS.map(function (m) {
    return fetch('/.netlify/functions/analytics-query?metric=' + m,
      { headers: { 'Authorization': authHdr } })
      .then(function (r) { return r.json(); })
      .then(function (data) { return { metric: m, data: data }; });
  }));

  var d = {};
  results.forEach(function (r) {
    if (r.status === 'fulfilled') d[r.value.metric] = r.value.data;
  });

  // ── Data helpers ──────────────────────────────────────────────────────────

  function _first(key) {
    return (Array.isArray(d[key]) && d[key].length > 0) ? d[key][0] : null;
  }
  function _last(key) {
    var arr = d[key];
    return (Array.isArray(arr) && arr.length > 0) ? arr[arr.length - 1] : null;
  }
  function _sumField(key, field) {
    if (!Array.isArray(d[key])) return 0;
    return d[key].reduce(function (acc, row) { return acc + (parseFloat(row[field]) || 0); }, 0);
  }

  // ── Format helpers ────────────────────────────────────────────────────────

  function _num(n) {
    if (n == null) return '—';
    var v = parseFloat(n);
    return isNaN(v) ? '—' : v.toLocaleString();
  }
  function _pct(n) {
    if (n == null) return '—';
    var v = parseFloat(n);
    return isNaN(v) ? '—' : Math.round(v) + '%';
  }
  function _mins(secs) {
    if (secs == null) return '—';
    var v = Math.round(parseFloat(secs) / 60);
    return isNaN(v) ? '—' : v + ' min';
  }
  function _grade(g) {
    return g === 'K' ? 'Kindergarten' : 'Grade ' + g;
  }

  // ── DOM helpers ───────────────────────────────────────────────────────────

  function _el(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
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
    if (hint) card.appendChild(_el('div', 'stat-hint', hint));
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

  // ─────────────────────────────────────────────────────────────────────────
  // Section 1 — Overview
  // ─────────────────────────────────────────────────────────────────────────

  var sec1  = _section('Overview');
  var grid1 = _el('div', 'stats-grid');

  var dauRow  = _last('dau');
  var wauRow  = _last('wau');
  var sesRow  = _first('session_duration');
  var parentTotal = _sumField('parent_usage', 'opens');
  var reportTotal = _sumField('report_usage', 'report_count');

  grid1.appendChild(_statCard(
    'Students active today',
    _num(dauRow && dauRow.dau),
    'Students who started at least one session today'
  ));
  grid1.appendChild(_statCard(
    'Students active this week',
    _num(wauRow && wauRow.wau),
    'Students who had at least one session in the last 7 days'
  ));
  grid1.appendChild(_statCard(
    'Avg. session length',
    sesRow ? _mins(sesRow.avg_duration_secs) : '—',
    'Average time a student spends in a single learning session'
  ));
  grid1.appendChild(_statCard(
    'Total sessions (30d)',
    _num(sesRow && sesRow.session_count),
    'Total student sessions started in the last 30 days'
  ));
  grid1.appendChild(_statCard(
    'Parent dashboard opens',
    _num(parentTotal),
    'How many times parents opened the dashboard this month'
  ));
  grid1.appendChild(_statCard(
    'AI reports generated',
    _num(reportTotal),
    'Total AI progress reports generated this month'
  ));

  sec1.appendChild(grid1);
  elContent.appendChild(sec1);

  // ─────────────────────────────────────────────────────────────────────────
  // Section 2 — Student Engagement
  // ─────────────────────────────────────────────────────────────────────────

  var sec2  = _section('Student Engagement');
  var grid2 = _el('div', 'stats-grid');

  var quizRow = _first('quiz_completion');

  grid2.appendChild(_statCard(
    'Quiz completion rate',
    quizRow ? _pct(quizRow.completion_pct) : '—',
    'Students who finished a quiz without quitting (last 30 days)'
  ));
  grid2.appendChild(_statCard(
    'Quiz abandonment rate',
    quizRow ? _pct(quizRow.abandonment_pct) : '—',
    'Students who quit or gave up before finishing a quiz'
  ));
  grid2.appendChild(_statCard(
    'Quizzes started',
    quizRow ? _num(quizRow.started) : '—',
    'Total quizzes started in the last 30 days'
  ));
  grid2.appendChild(_statCard(
    'Avg. session length',
    sesRow ? _mins(sesRow.avg_duration_secs) : '—',
    'Average minutes per learning session'
  ));

  sec2.appendChild(grid2);

  var tablesRow2 = _el('div', 'tables-row');

  var gradeRows = Array.isArray(d['top_grades'])
    ? d['top_grades'].map(function (r) { return [_grade(r.grade), _num(r.student_count) + ' students']; })
    : [];
  tablesRow2.appendChild(_tableCard(
    'Most active grades',
    ['Grade', 'Active students'],
    gradeRows,
    'No grade data yet'
  ));

  var unitRows = Array.isArray(d['top_units'])
    ? d['top_units'].slice(0, 10).map(function (r) {
        return [r.unit_id, _num(r.start_count), _num(r.unique_students)];
      })
    : [];
  tablesRow2.appendChild(_tableCard(
    'Most used units',
    ['Unit', 'Times started', 'Unique students'],
    unitRows,
    'No unit activity yet'
  ));

  sec2.appendChild(tablesRow2);
  elContent.appendChild(sec2);

  // ─────────────────────────────────────────────────────────────────────────
  // Section 3 — Learning Insights
  // ─────────────────────────────────────────────────────────────────────────

  var sec3 = _section('Learning Insights');

  var hardRows = Array.isArray(d['hardest_lessons'])
    ? d['hardest_lessons'].slice(0, 10).map(function (r) {
        var rate = parseFloat(r.interventions_per_start);
        return [
          r.lesson_id,
          _num(r.starts),
          _num(r.interventions),
          isNaN(rate) ? '—' : rate.toFixed(2),
          _pct(r.resolution_pct),
        ];
      })
    : [];
  sec3.appendChild(_tableCard(
    'Hardest lessons — ranked by how often students need help',
    ['Lesson', 'Starts', 'Help shown', 'Help per start', 'Resolved correctly'],
    hardRows,
    'No lesson data yet — start some lessons to see difficulty rankings'
  ));

  var tagRows = Array.isArray(d['error_tags'])
    ? d['error_tags'].slice(0, 10).map(function (r) {
        return [r.error_tag || '—', _num(r.occurrences), _num(r.affected_students)];
      })
    : [];
  var tablesRow3 = _el('div', 'tables-row');
  tablesRow3.appendChild(_tableCard(
    'Most common mistakes',
    ['Error type', 'Times seen', 'Students affected'],
    tagRows,
    'No errors logged yet — errors appear when interventions are triggered'
  ));

  // Intervention resolution rate summary
  var totalInterventions = 0, totalResolved = 0;
  if (Array.isArray(d['hardest_lessons'])) {
    d['hardest_lessons'].forEach(function (r) {
      totalInterventions += (parseInt(r.interventions) || 0);
      totalResolved      += (parseInt(r.resolved)      || 0);
    });
  }
  var resPct = totalInterventions > 0 ? Math.round(totalResolved / totalInterventions * 100) : null;
  var resSummaryGrid = _el('div', 'stats-grid');
  resSummaryGrid.appendChild(_statCard(
    'Overall intervention resolution rate',
    resPct != null ? resPct + '%' : '—',
    'Percentage of help prompts that students answered correctly on the retry'
  ));
  resSummaryGrid.appendChild(_statCard(
    'Total interventions triggered',
    _num(totalInterventions || null),
    'Total times the app showed a student a help prompt (last 30 days)'
  ));
  tablesRow3.appendChild(resSummaryGrid);

  sec3.appendChild(tablesRow3);
  elContent.appendChild(sec3);

  // ─────────────────────────────────────────────────────────────────────────
  // Section 4 — Retention
  // ─────────────────────────────────────────────────────────────────────────

  var sec4  = _section('Retention');
  var rGrid = _el('div', 'retention-grid');

  var r1  = _first('retention_1d');
  var r7  = _first('retention_7d');
  var r30 = _first('retention_30d');

  rGrid.appendChild(_retentionCard(
    'Back the next day',
    'Of students who used the app yesterday, how many returned today. Good apps see 30–50%.',
    r1  ? r1.retention_pct  : null,
    r1  ? parseInt(r1.cohort_size)  || 0 : 0,
    r1  ? parseInt(r1.retained)     || 0 : 0
  ));
  rGrid.appendChild(_retentionCard(
    'Back within 7 days',
    'Of students active 7–14 days ago, how many came back in the last 7 days. Strong apps see 20–40%.',
    r7  ? r7.retention_pct  : null,
    r7  ? parseInt(r7.cohort_size)  || 0 : 0,
    r7  ? parseInt(r7.retained)     || 0 : 0
  ));
  rGrid.appendChild(_retentionCard(
    'Back within 30 days',
    'Of students active 30–60 days ago, how many came back in the last 30 days. Strong apps see 15–30%.',
    r30 ? r30.retention_pct : null,
    r30 ? parseInt(r30.cohort_size) || 0 : 0,
    r30 ? parseInt(r30.retained)    || 0 : 0
  ));

  sec4.appendChild(rGrid);
  elContent.appendChild(sec4);

  // ─────────────────────────────────────────────────────────────────────────
  // Section 5 — Bill Risk
  // ─────────────────────────────────────────────────────────────────────────

  var sec5  = _section('Bill Risk — Gemini API Usage');
  var grid5 = _el('div', 'stats-grid');

  var billRow   = _first('bill_risk');
  var calls24h  = billRow ? (parseInt(billRow.gemini_calls_24h)  || 0) : 0;
  var calls7d   = billRow ? (parseInt(billRow.gemini_calls_7d)   || 0) : 0;
  var parents7d = billRow ? (parseInt(billRow.unique_parents_7d) || 0) : 0;

  grid5.appendChild(_statCard(
    'Reports in last 24 hours',
    _num(calls24h),
    'Each AI report = 1 Gemini API call',
    calls24h > 50
      ? { cls: 'badge badge-high', text: 'Unusually high — check for abuse' }
      : calls24h > 20
        ? { cls: 'badge badge-warn', text: 'Elevated — monitor closely' }
        : { cls: 'badge badge-ok',   text: 'Normal' }
  ));
  grid5.appendChild(_statCard(
    'Reports in last 7 days',
    _num(calls7d),
    'Total AI progress reports generated this week',
    calls7d > 200
      ? { cls: 'badge badge-high', text: 'High — review Gemini costs' }
      : calls7d > 100
        ? { cls: 'badge badge-warn', text: 'Elevated — keep an eye on costs' }
        : { cls: 'badge badge-ok',   text: 'Normal' }
  ));
  grid5.appendChild(_statCard(
    'Unique parents using reports',
    _num(parents7d),
    'Parents who generated at least one AI report this week'
  ));

  sec5.appendChild(grid5);
  elContent.appendChild(sec5);

})();
