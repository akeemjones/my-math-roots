// admin-analytics.js — standalone, NOT concatenated into app.js.
// Token-substituted by build.js copy step: %%SUPA_URL%% / %%SUPA_KEY%%
// Requires CDN Supabase SDK (loaded in admin-analytics.html).

(async function() {
  var SUPA_URL = '%%SUPA_URL%%';
  var SUPA_KEY = '%%SUPA_KEY%%';

  var elLoading  = document.getElementById('loading');
  var elAuthGate = document.getElementById('auth-gate');
  var elDash     = document.getElementById('dashboard');
  var elGrid     = document.getElementById('metrics-grid');

  var supa = supabase.createClient(SUPA_URL, SUPA_KEY);
  var sessionData = await supa.auth.getSession();
  var session = sessionData.data && sessionData.data.session;

  if (!session) {
    elLoading.style.display = 'none';
    window.location.href = '/';
    return;
  }

  var authHdr = 'Bearer ' + session.access_token;

  // Verify admin role via analytics-query endpoint
  var testRes = await fetch('/.netlify/functions/analytics-query?metric=bill_risk',
    { headers: { 'Authorization': authHdr } }).catch(function() { return { status: 500 }; });

  elLoading.style.display = 'none';

  if (testRes.status === 401 || testRes.status === 403) {
    elAuthGate.style.display = 'block';
    return;
  }

  elDash.style.display = 'block';

  var METRICS = [
    'dau','wau','session_duration','quiz_completion',
    'retention_1d','retention_7d','retention_30d',
    'top_grades','top_units','hardest_lessons',
    'error_tags','report_usage','bill_risk','parent_usage',
  ];

  var results = await Promise.allSettled(METRICS.map(function(m) {
    return fetch('/.netlify/functions/analytics-query?metric=' + m,
      { headers: { 'Authorization': authHdr } })
      .then(function(r) { return r.json(); })
      .then(function(data) { return { metric: m, data: data }; });
  }));

  results.forEach(function(r) {
    if (r.status === 'fulfilled') elGrid.appendChild(_renderCard(r.value.metric, r.value.data));
  });

  // XSS-safe rendering: use createElement + textContent throughout.
  // Never use innerHTML to render data from the API response.
  function _renderCard(metric, data) {
    var card  = document.createElement('div');
    card.className = 'metric-card';

    var title = document.createElement('h3');
    title.textContent = metric.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    card.appendChild(title);

    var pre = document.createElement('pre');
    // JSON.stringify produces only ASCII-safe output; assign via textContent (not innerHTML)
    pre.textContent = JSON.stringify(data, null, 2);
    card.appendChild(pre);

    return card;
  }
})();
