// ════════════════════════════════════════
//  SUPABASE — AUTH + SYNC
// ════════════════════════════════════════
const SUPA_URL = '%%SUPA_URL%%';
const SUPA_KEY = '%%SUPA_KEY%%';
const GOOGLE_CLIENT_ID = '%%GOOGLE_CLIENT_ID%%';
let _supa      = null;
let _supaUser  = null;
let _authLoading = false;

// True after the first INITIAL_SESSION processes. Used only for idempotency on
// INITIAL_SESSION re-fires — does NOT participate in the suppress-navigation gate.
var _authInitialSessionHandled = false;

let _sessionToken = localStorage.getItem('mmr_session_token') || null;

function _isStudentSession(){
  return !!(localStorage.getItem('mmr_active_student_id') && _sessionToken);
}

function _handleSessionExpiry(error){
  var msg = (error && error.message) || String(error || '');
  if(msg.indexOf('invalid_session') !== -1){
    _sessionToken = null;
    localStorage.removeItem('mmr_session_token');
    showLockToast('Session expired — please log in again.');
    show('login-screen');
    return true;
  }
  return false;
}

function _lsSetRole(role) {
  localStorage.setItem('mmr_user_role', role);
  var btnStudent = document.getElementById('ls-role-student');
  var btnParent  = document.getElementById('ls-role-parent');
  if (btnStudent) btnStudent.classList.toggle('active', role === 'student');
  if (btnParent)  btnParent.classList.toggle('active',  role === 'parent');
}

var _lsCardIdx = 0;

// ── Student login state ──────────────────────────────────────────────────
var _lsFamilyProfiles = null;   // cached Array<profile> from mmr_family_profiles
var _lsSelectedStudentId = null; // id of avatar currently highlighted
var _lsPinBuffer = [];           // digits entered so far (max 4)
var _STU_FAIL_KEY   = 'mmr_stud_fail_ts';
var _STU_FAIL_COUNT = 'mmr_stud_fail_count';
var _STU_MAX_FAILS  = 5;
var _STU_LOCK_MS    = 30000;

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

function _validateFamilyCode(code) {
  if (code == null || code === '') return false;
  // Canonical family code is MMR- followed by exactly 8 numeric digits.
  // Backend mints this format via _generate_family_code (20260610). The
  // /i flag tolerates "mmr-" prefix; the digits part is unaffected.
  return /^MMR-[0-9]{8}$/i.test(String(code));
}

// Normalize any of the accepted user inputs to the canonical MMR-12345678.
// Accepts:
//   "12345678"            → "MMR-12345678"
//   "MMR-12345678"        → "MMR-12345678"
//   "mmr-12345678"        → "MMR-12345678"
//   "  12 345 678  "      → "MMR-12345678"   (trims + strips spaces)
//   "MMR-12-34-56-78"     → "MMR-12345678"   (strips internal dashes)
// Returns null for any input that does not yield exactly 8 digits after
// stripping. Callers should treat null as "show validation error".
function _normalizeFamilyCode(input) {
  if (input == null) return null;
  var raw = String(input).trim().toUpperCase();
  // Strip the MMR- prefix if user pasted the full canonical form.
  if (raw.indexOf('MMR-') === 0) raw = raw.slice(4);
  // Strip whitespace and dashes anywhere (paste-tolerance for "12-34-56-78").
  raw = raw.replace(/[\s\-]/g, '');
  if (!/^[0-9]{8}$/.test(raw)) return null;
  return 'MMR-' + raw;
}

function _lsEsc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function _lsValidColor(val) {
  if (typeof val !== 'string') return '#f59e0b';
  var v = val.trim();
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : '#f59e0b';
}

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
      + _lsValidColor(p.avatar_color_from) + ',' + _lsValidColor(p.avatar_color_to)
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
      + '<div style="display:flex;align-items:stretch;justify-content:center;margin-bottom:12px;gap:0">'
      + '<span id="ls-family-code-prefix" aria-hidden="true" style="display:flex;align-items:center;padding:0 14px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.25);border-right:none;border-radius:8px 0 0 8px;font-family:\'Boogaloo\',sans-serif;font-size:var(--fs-md);letter-spacing:.12em;color:rgba(255,255,255,0.92)">MMR-</span>'
      + '<input id="ls-family-code-inp" type="tel" inputmode="numeric" pattern="[0-9]*" autocomplete="off" class="set-inp" placeholder="12345678"'
      + ' maxlength="8" style="flex:1;text-align:center;letter-spacing:.15em;font-size:var(--fs-md);font-family:\'Boogaloo\',sans-serif;box-sizing:border-box;border-radius:0 8px 8px 0">'
      + '</div>'
      + '<div id="ls-family-code-msg" style="font-size:.78rem;color:#f87171;text-align:center;min-height:1.2rem;margin-bottom:8px"></div>'
      + '<button data-action="_lsFamilyCodeSetup" style="width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,#f59e0b,#f97316);color:#2c1a00;font-family:\'Boogaloo\',sans-serif;font-size:var(--fs-md);cursor:pointer;letter-spacing:.3px;touch-action:manipulation">Link This Device</button>'
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
  return '<div style="margin-bottom:14px">'
    + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);letter-spacing:.08em;text-transform:uppercase;text-align:center;margin-bottom:10px">Who\'s playing?</div>'
    + '<div class="ls-avatar-row">' + _buildAvatarHtml(profiles, selId) + '</div>'
    + '</div>'
    + '<div style="border-top:1px solid rgba(255,255,255,0.14);padding-top:14px">'
    + '<div style="font-size:.68rem;color:rgba(255,255,255,.55);text-align:center;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">' + selName + '\'s PIN</div>'
    + '<div style="position:relative;cursor:pointer;padding-bottom:2px">'
    + '<div id="ls-pin-dots" style="display:flex;gap:10px;justify-content:center;margin-bottom:10px">' + dots + '</div>'
    + '<input type="tel" id="ls-pin-native" inputmode="numeric" pattern="[0-9]*" maxlength="4"'
    + ' autocomplete="one-time-code" data-oninput="_lsPinNativeInput"'
    + ' style="position:absolute;inset:0;opacity:0;width:100%;height:100%;font-size:16px;cursor:pointer;border:none;outline:none;background:transparent">'
    + '</div>'
    + '<div id="ls-pin-msg" style="font-size:.75rem;color:#f87171;text-align:center;min-height:1.1rem;margin-bottom:6px"></div>'
    + '<div style="margin-top:8px;text-align:center;font-size:.68rem;color:rgba(255,255,255,0.35)">'
    + 'New device? <span data-action="_lsClearFamilyCache" style="color:rgba(255,210,80,0.85);text-decoration:underline;cursor:pointer">Enter family code &#x2192;</span>'
    + '</div>'
    + '</div>';
}

function _lsRenderStudentCard() {
  var body = document.getElementById('ls-student-body');
  if (!body) return;
  if (!_lsFamilyProfiles) {
    try {
      var raw = localStorage.getItem('mmr_family_profiles');
      _lsFamilyProfiles = raw ? JSON.parse(raw) : [];
    } catch(e) { _lsFamilyProfiles = []; }
  }
  if (!_lsSelectedStudentId && _lsFamilyProfiles && _lsFamilyProfiles.length) {
    var last = localStorage.getItem('mmr_last_student_id');
    _lsSelectedStudentId = last || _lsFamilyProfiles[0].id;
  }
  body.innerHTML = _buildStudentCardHtml(_lsFamilyProfiles, _lsSelectedStudentId, _lsPinBuffer);
  // Wire up auto-dash formatter for family code input (State A only)
  var _fcInp = document.getElementById('ls-family-code-inp');
  if (_fcInp) {
    _fcInp.addEventListener('input', function() {
      // Suffix-only input: digits only, max 8. If the user pastes
      // "MMR-12345678" (or "mmr-12345678"), strip the prefix first.
      var raw = String(this.value || '').trim();
      var up  = raw.toUpperCase();
      if (up.indexOf('MMR-') === 0) raw = raw.slice(4);
      // Strip everything except digits, then cap at 8.
      var digits = raw.replace(/\D/g, '').slice(0, 8);
      if (this.value !== digits) {
        this.value = digits;
        // Cursor sits at the end after auto-strip — acceptable UX for
        // an 8-digit numeric field with a fixed visible prefix.
      }
    });
  }
  // Auto-focus the native numpad input (small delay for iOS keyboard)
  if(_lsFamilyProfiles && _lsFamilyProfiles.length){
    var _nativeInp = document.getElementById('ls-pin-native');
    if(_nativeInp) setTimeout(function(){ _nativeInp.focus(); }, 60);
  }
  // Re-adapt outer height after student card body changes
  if(typeof _lsAdaptHeight === 'function') _lsAdaptHeight();
}

async function _lsFamilyCodeSetup() {
  var inp = document.getElementById('ls-family-code-inp');
  var msg = document.getElementById('ls-family-code-msg');
  if (!inp || !msg) return;
  // Normalize: accepts suffix-only ("12345678"), pasted canonical
  // ("MMR-12345678"), and case/space variants. Always returns the
  // canonical "MMR-XXXXXXXX" or null.
  var code = _normalizeFamilyCode(inp.value);
  if (!code) {
    msg.textContent = 'Enter your 8-digit family code (e.g. 12345678)';
    return;
  }
  msg.textContent = '';
  inp.disabled = true;

  if (!_supa) { msg.textContent = 'No connection — please try again.'; inp.disabled = false; return; }

  try {
    var timeout = new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); });
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

function _lsSelectAvatar(studentId) {
  _lsSelectedStudentId = studentId;
  _lsPinBuffer = [];
  _lsRenderStudentCard();
}

function _lsPinKey(digit) {
  // Lockout is enforced server-side by verify_student_pin (returns locked_until + attempts_left)
  if (_lsPinBuffer.length >= 4) return;
  _lsPinBuffer.push(String(digit));
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

// Handles input from the native numpad on the login screen
function _lsPinNativeInput() {

  var inp = document.getElementById('ls-pin-native');
  if (!inp) return;
  // Keep only digits, max 4
  var val = inp.value.replace(/\D/g, '').slice(0, 4);
  inp.value    = val;
  _lsPinBuffer = val.split('');

  // Update dot indicators
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

  if (_lsPinBuffer.length === 4) {
    inp.value = ''; // clear so it is ready for a retry
    _lsStudentLogin();
  }
}

// Shake pin dots and clear input — shared by login and profile-switcher
function _lsShakePinDots(dotContainerId) {
  var id  = dotContainerId || 'ls-pin-dots';
  var el  = document.getElementById(id);
  var inp = document.getElementById('ls-pin-native');
  if (inp) inp.value = '';
  if (el) {
    el.classList.add('ls-pin-shake');
    var emptyDots = '';
    for (var i = 0; i < 4; i++) emptyDots += '<div class="ls-pin-dot ls-pin-dot-empty"></div>';
    setTimeout(function() {
      el.classList.remove('ls-pin-shake');
      if (el) el.innerHTML = emptyDots;
    }, 450);
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  Shared student-learning-session hydrator
//  Used by:
//    1. Family-code/PIN login success (_lsStudentLogin)
//    2. In-session profile switcher PIN success (_psCheckPin)
//    3. In-session profile switcher parent-bypass (psSelectProfile)
//    4. Parent dashboard "Go to App" (dashboard.js dbGoToApp)
//    5. Post-reload restore (restoreStudentLearningSessionFromStorage)
//
//  When sessionToken is provided, RPCs use the student session_token path.
//  When sessionToken is null and _supaUser is set, RPCs use the parent's
//  Supabase session — this is what lets parent-launched student sessions
//  hydrate without making the parent re-enter a PIN.
// ─────────────────────────────────────────────────────────────────────────
async function enterStudentLearningSession(opts) {
  opts = opts || {};
  var studentId    = opts.studentProfileId;
  var profile      = opts.profile;
  var sessionToken = opts.sessionToken || null;
  var source       = opts.source || 'unknown';
  if (!studentId || !profile) {
    _devWarn('[MMR SESSION] enterStudentLearningSession aborted (missing id/profile)', {studentId, hasProfile: !!profile, source});
    return;
  }
  var parentAuthed = !!_supaUser;
  _devLog('[MMR SESSION] enterStudentLearningSession', {source, studentId, parentAuthed, hasSessionToken: !!sessionToken});

  // 1. Persist identity
  if (sessionToken) {
    _sessionToken = sessionToken;
    localStorage.setItem('mmr_session_token', sessionToken);
  } else {
    _sessionToken = null;
    localStorage.removeItem('mmr_session_token');
  }
  localStorage.setItem('mmr_active_student_id', studentId);
  localStorage.setItem('mmr_last_student_id',   studentId);
  localStorage.setItem('mmr_user_role',         'student');
  localStorage.removeItem('wb_guest_mode');

  // 2. Per-profile grade resolution.
  //
  //    HARD RULE: localStorage.mmr_grade is the student's last-selected
  //    learning grade and MUST NOT be overwritten by this function just
  //    because the parent returned from the dashboard. The three legitimate
  //    writers of mmr_grade are:
  //      (a) switchGrade()         — student uses the learning-side selector
  //      (b) _dbSaveEditProfile()  — parent explicitly re-enrolls the student
  //      (c) this function, ONLY when no valid mmr_grade exists yet
  //
  //    The dashboard's view-band selection lives in mmr_dash_view_grade_<sid>
  //    and is independent. profile.grade (Supabase) is the enrolled-grade
  //    metadata, also separate. If profile.grade and mmr_grade disagree, the
  //    student's selection wins until path (a) or (b) explicitly changes it.
  //
  //    Why this matters: profile.grade can be stale (Supabase fire-and-forget
  //    writes, parent-dashboard _fetchManagedProfiles mirroring older server
  //    data, accounts that never had grade synced). Before this guard, every
  //    return-from-dashboard call overwrote a fresh K/G1 selection with the
  //    stale '2'.
  var _norm = (typeof normalizeGrade === 'function') ? normalizeGrade : function(v){
    if (v == null) return '2';
    var s = String(v).trim().toLowerCase();
    if (s === 'k' || s === 'kindergarten' || s === '0') return 'K';
    if (s === '1') return '1';
    if (s === '3') return '3';
    return '2';
  };
  var _profileGrade;
  if (typeof _dbResolveProfileGrade === 'function') {
    _profileGrade = _dbResolveProfileGrade(profile, profile && profile.id);
  } else {
    var _byId = profile && profile.id ? localStorage.getItem('mmr_profile_grade_' + profile.id) : null;
    _profileGrade = _norm((profile && profile.grade) || _byId || localStorage.getItem('mmr_grade'));
    if (profile && profile.id) {
      try { localStorage.setItem('mmr_profile_grade_' + profile.id, _profileGrade); } catch (_e) {}
    }
  }
  var _existingRaw      = localStorage.getItem('mmr_grade');
  var _existingValid    = (_existingRaw === 'K' || _existingRaw === '1' || _existingRaw === '2' || _existingRaw === '3')
                          ? _existingRaw : null;
  // The grade we'll actually run the session under. Existing learning-side
  // selection wins; profileGrade is only used when nothing is saved yet.
  var _resolvedGrade    = _existingValid || _profileGrade;
  var _currentGrade     = _norm(_existingRaw);
  _devLog('[MMR SESSION] grade resolve', {
    existing:      _existingRaw,
    profileGrade:  _profileGrade,
    resolved:      _resolvedGrade,
    willPersist:   _existingValid == null,
    source:        source
  });
  if (_existingValid == null) {
    // First-time entry — no saved learning grade. Persist the profile grade
    // so the rest of the app has something to read.
    localStorage.setItem('mmr_grade', _resolvedGrade);
  }
  // Else: leave mmr_grade alone. Student's selection is the source of truth.

  if (_resolvedGrade !== _currentGrade) {
    // boot.js/state.js bake grade-derived constants at load time, so a true
    // grade change needs a reload. This branch fires only when (1) we just
    // wrote a first-time mmr_grade that differs from the prior empty/default
    // value, or (2) the saved value was already the new grade (no-op).
    try { localStorage.setItem('mmr_resume_student_session', '1'); } catch (_e) {}
    try { location.reload(); return; } catch (_e) {}
  }

  // 3. Reset in-memory progress; reload from per-grade local keys
  var freshDone = safeLoad(_DONE_KEY, {});
  Object.keys(DONE).forEach(function(k){ delete DONE[k]; });
  Object.assign(DONE, freshDone);
  var freshScores = safeLoadSigned(_SCORES_KEY, []);
  SCORES.length = 0;
  freshScores.forEach(function(s){ SCORES.push(s); });
  STREAK.current = 0; STREAK.longest = 0; STREAK.lastDate = null;
  localStorage.setItem('wb_streak', JSON.stringify({ current:0, longest:0, lastDate:null }));
  localStorage.setItem('wb_act_dates', JSON.stringify([]));

  // 4. Render learning dashboard
  show('home');
  buildHome();
  if (typeof _psUpdateProfileBtn === 'function') _psUpdateProfileBtn();
  if (typeof _installHistoryGuard === 'function') _installHistoryGuard();
  _devLog('[MMR STORAGE]', {
    role: localStorage.getItem('mmr_user_role'),
    activeStudent: localStorage.getItem('mmr_active_student_id'),
    sessionToken: !!localStorage.getItem('mmr_session_token'),
    guest: localStorage.getItem('wb_guest_mode'),
    resume: localStorage.getItem('mmr_resume_student_session'),
    grade: localStorage.getItem('mmr_grade')
  });

  // 5. Cloud sync — branch by source.
  // Both _syncStudentSettings and _hydrateStudentFromParentSession already call
  // buildHome() internally when data changes — do NOT add another .then(buildHome)
  // here or the carousel will re-render 3-4 times on every session entry.
  try {
    _anaSessionStartTs   = Date.now();
    _anaSessionEndedSent = false;
    // Reset per-session dedup so unit_viewed/lesson_viewed fire fresh for the
    // newly-active student (handles same-grade profile-switcher swaps that
    // don't trigger a page reload).
    if (typeof _anaShouldFire === 'function') _anaShouldFire('__reset__');
    var _g = localStorage.getItem('mmr_grade');
    _trackEvent('session_started',     { grade: _g || null });
    _trackEvent('student_app_opened',  { grade: _g || null });
  } catch (_) {}

  if (sessionToken) {
    if (typeof _syncStudentSettings === 'function') _syncStudentSettings(studentId);
    if (typeof _pullStudentProgress === 'function') _pullStudentProgress(studentId);
    if (typeof _startUnlockSync     === 'function') _startUnlockSync(studentId);
  } else if (parentAuthed) {
    _hydrateStudentFromParentSession(studentId);
  }
}

// Post-reload restore — used by INITIAL_SESSION when the one-shot
// mmr_resume_student_session flag indicates the previous session reloaded
// itself for a grade switch and wants to land back in the student view.
async function restoreStudentLearningSessionFromStorage(studentId) {
  if (!studentId) return;
  var profiles = [];
  try { profiles = JSON.parse(localStorage.getItem('mmr_family_profiles') || '[]'); } catch(_e) {}
  var profile = (profiles || []).find(function(p){ return p && p.id === studentId; });
  if (!profile) {
    // Cache lost — fall back to parent dashboard rather than entering an unidentified state.
    localStorage.setItem('mmr_user_role', 'parent');
    if (typeof show === 'function') show('dashboard-screen');
    if (typeof _dbInit === 'function') _dbInit();
    return;
  }
  // INITIAL_SESSION only triggers the resume branch when _supaUser is set, so
  // sessionToken stays null and parent's Supabase session authorizes RPCs.
  await enterStudentLearningSession({
    studentProfileId: studentId,
    profile:          profile,
    sessionToken:     null,
    source:           'parent-dashboard'
  });
}

// Parent-mode progress hydrator — uses parent's Supabase session (no session_token).
// Mirrors the merge logic of _pullStudentProgress but calls the parent-authorized
// RPC get_student_progress_by_pin (also used by dashboard at dashboard.js:3338).
// Sets _pullSucceeded so the parent push pipeline can run after a grade-reload
// restore that skipped _pullOnLogin.
async function _hydrateStudentFromParentSession(studentId) {
  if (!_supa || !_supaUser || !studentId || studentId === 'local') return;

  // Settings — parent-mode loaders write to wb_unlock_<id>/wb_timer_<id>/wb_a11y_<id>.
  if (typeof _loadUnlockSettings === 'function') _loadUnlockSettings(studentId);
  if (typeof _loadTimerSettings  === 'function') _loadTimerSettings(studentId);
  if (typeof _loadA11ySettings   === 'function') _loadA11ySettings(studentId);

  try {
    var result = await Promise.race([
      _supa.rpc('get_student_progress_by_pin', { p_student_id: studentId }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 8000); })
    ]);
    if (result.error || !result.data) return;
    var data = result.data;
    var changed = false;

    // Cross-device reset invalidation: if the server's reset_epoch is
    // newer than what this device last saw, wipe the local grade-scoped
    // progress caches and the in-memory const globals BEFORE merging
    // anything from the pull. Without this, an additive merge against
    // an empty server response would leave the local SCORES intact and
    // re-unlock units that the reset on another device just cleared.
    try {
      if (typeof _dbApplyServerResetEpoch === 'function') {
        var serverEpoch = (data && data.reset_epoch != null) ? Number(data.reset_epoch) : 0;
        _dbApplyServerResetEpoch(studentId, serverEpoch);
      }
    } catch (_e) {}

    // SCORES — append by local_id (de-duped against existing globals).
    var remoteScores = data.scores;
    if (Array.isArray(remoteScores) && remoteScores.length) {
      var localIds = new Set(SCORES.map(function(s){ return s.id; }));
      var incoming = remoteScores
        .filter(function(r){
          return r && typeof r.local_id === 'number' && typeof r.qid === 'string'
            && typeof r.score === 'number' && typeof r.total === 'number'
            && typeof r.pct === 'number' && r.pct >= 0 && r.pct <= 100
            && !localIds.has(r.local_id);
        })
        .map(function(r){
          return {
            qid: r.qid, label: String(r.label||''), type: String(r.type||''),
            score: r.score, total: r.total, pct: r.pct, stars: String(r.stars||''),
            unitIdx: typeof r.unit_idx === 'number' ? r.unit_idx : 0,
            color: String(r.color||''),
            name: String(r.student_name||''), id: r.local_id,
            timeTaken: r.time_taken || 0,
            // F5: round-trip grade so grade-filtered quiz history works
            // after cloud reload. NULL grades fall through to qid pattern
            // inference via _inferScoreGrade.
            grade: r.grade || null,
            answers: Array.isArray(r.answers) ? r.answers : [],
            date: String(r.date_str||''), time: String(r.time_str||''),
            quit: !!r.quit, abandoned: !!r.abandoned
          };
        });
      if (incoming.length) {
        SCORES.push.apply(SCORES, incoming);
        SCORES.sort(function(a,b){ return b.id - a.id; });
        if (SCORES.length > 200) SCORES.length = 200;
        if (typeof saveSc === 'function') saveSc();
        changed = true;
      }
    }

    // MASTERY — per-grade canonical key; higher attempts wins.
    var masteryJson = data.progress && data.progress.mastery_json;
    if (masteryJson && typeof masteryJson === 'object') {
      try {
        var _gPull = (typeof normalizeGrade === 'function')
          ? normalizeGrade(localStorage.getItem('mmr_grade'))
          : (localStorage.getItem('mmr_grade') || '2');
        var _pullKey = 'mmr_mastery_v1_' + _gPull;
        var localAgg = JSON.parse(localStorage.getItem(_pullKey) || '{}');
        var mkeys = Object.keys(masteryJson);
        var mchanged = false;
        for (var mi = 0; mi < mkeys.length; mi++) {
          var mk = mkeys[mi];
          var cm = masteryJson[mk];
          if (!cm || typeof cm.attempts !== 'number') continue;
          var lm = localAgg[mk];
          if (!lm || cm.attempts > lm.attempts ||
              (cm.attempts === lm.attempts && (cm.correct||0) > (lm.correct||0))) {
            localAgg[mk] = { attempts: cm.attempts, correct: cm.correct||0, lastSeen: cm.lastSeen||0 };
            mchanged = true;
          }
        }
        if (mchanged) { localStorage.setItem(_pullKey, JSON.stringify(localAgg)); changed = true; }
      } catch (_me) {}
    }

    // ACTIVITY — union by ts.
    var activityJson = data.progress && data.progress.activity_json;
    if (activityJson && activityJson.v === 1 && Array.isArray(activityJson.events)) {
      try {
        var localActDoc = JSON.parse(localStorage.getItem('mmr_activity_v1') || 'null');
        var localEvts = (localActDoc && localActDoc.v === 1 && Array.isArray(localActDoc.events))
          ? localActDoc.events : [];
        var mergedDoc = (typeof _mergeActivityEvents === 'function')
          ? _mergeActivityEvents(localEvts, activityJson.events)
          : { v: 1, events: localEvts.concat(activityJson.events) };
        localStorage.setItem('mmr_activity_v1', JSON.stringify(mergedDoc));
        changed = true;
      } catch (_ae) {}
    }

    // STREAK + ACT_DATES — fetched directly from student_profiles because
    // get_student_progress_by_pin doesn't return them. Without this hop,
    // the parent-launched "Go to App" path leaves wb_streak / wb_act_dates
    // at the {0,0,null}/[] values written by enterStudentLearningSession's
    // reset, so the student-side learning calendar shows no active days
    // even though the server has them. _fetchManagedProfiles already proves
    // this read works under the parent's Supabase session + existing RLS.
    try {
      var _streakRes = await Promise.race([
        _supa.from('student_profiles')
          .select('streak_current, streak_longest, streak_last_date, act_dates_json')
          .eq('id', studentId)
          .maybeSingle(),
        new Promise(function(_, rej) { setTimeout(function() { rej(new Error('streak timeout')); }, 8000); })
      ]);
      if (_streakRes && !_streakRes.error && _streakRes.data) {
        var _sp = _streakRes.data;
        // Defensive coercion. Mirrors _dbBuildStudentStreak /
        // _dbBuildStudentActDates in dashboard.js (commit 4d8156d).
        STREAK.current  = (typeof _sp.streak_current  === 'number' && _sp.streak_current  >= 0)
          ? _sp.streak_current  : 0;
        STREAK.longest  = (typeof _sp.streak_longest  === 'number' && _sp.streak_longest  >= 0)
          ? _sp.streak_longest  : 0;
        STREAK.lastDate = (typeof _sp.streak_last_date === 'string' && _sp.streak_last_date !== '')
          ? _sp.streak_last_date : null;
        localStorage.setItem('wb_streak', JSON.stringify(STREAK));
        var _safeActDates = Array.isArray(_sp.act_dates_json)
          ? _sp.act_dates_json.filter(function(d) {
              return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
            })
          : [];
        localStorage.setItem('wb_act_dates', JSON.stringify(_safeActDates));
        // Refresh the cal-btn dot now that wb_act_dates is populated. The
        // grid popup itself rebuilds on each open and will read the fresh
        // state on next tap.
        if (typeof _renderCalBtn === 'function') _renderCalBtn();
        changed = true;
      }
    } catch (_streakE) {
      // offline / RPC failed — leave the wiped {0,0,null}/[] values from
      // enterStudentLearningSession step 3. Calendar shows empty (matches
      // pre-fix behavior); does NOT block _pullSucceeded below.
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[Supabase] parent-session streak/act_dates hydration failed', _streakE);
      }
    }

    // Mark cloud as authoritative — gates parent push pipeline so subsequent
    // quiz writes can sync back to Supabase as this student.
    _pullSucceeded = true;

    if (changed && typeof buildHome === 'function') buildHome();
  } catch (_e) {
    // offline / RPC failed — leave whatever's in cache; do NOT set _pullSucceeded.
  }
}

async function _lsStudentLogin() {
  var msg = document.getElementById('ls-pin-msg');

  var profile = _lsFamilyProfiles && _lsFamilyProfiles.find(function(p) { return p.id === _lsSelectedStudentId; });
  if (!profile) { _lsPinBuffer = []; return; }

  var entered = _lsPinBuffer.join('');
  _lsPinBuffer = [];

  if (!_supa) {
    if (msg) msg.textContent = 'No connection — check your internet.';
    return;
  }

  // Disable native input during network call to prevent double-submission
  var nativeInp = document.getElementById('ls-pin-native');
  if (nativeInp) { nativeInp.disabled = true; nativeInp.value = ''; }

  try {
    var result = await Promise.race([
      _supa.rpc('verify_student_pin', { p_student_id: profile.id, p_pin: entered }),
      new Promise(function(_, rej) { setTimeout(function() { rej(new Error('timeout')); }, 8000); })
    ]);

    if (nativeInp) nativeInp.disabled = false;
    if (result.error) throw result.error;

    var vr = result.data;

    // ── Locked out ───────────────────────────────────────────────────────
    if (vr && vr.locked_until) {
      var secsLeft = Math.ceil((vr.locked_until - Date.now()) / 1000);
      if (secsLeft > 0) {
        if (msg) msg.textContent = 'Too many attempts. Try again in ' + secsLeft + 's.';
        _lsShakePinDots('ls-pin-dots');
        return;
      }
    }

    // ── Wrong PIN ────────────────────────────────────────────────────────
    if (!vr || !vr.success) {
      var left = (vr && vr.attempts_left != null) ? vr.attempts_left : null;
      if (msg) {
        msg.textContent = (left === 0)
          ? 'Locked for 5 minutes.'
          : (left != null && left > 0)
            ? 'Wrong PIN. ' + left + ' attempt' + (left === 1 ? '' : 's') + ' left.'
            : 'Wrong PIN — try again.';
      }
      _lsShakePinDots('ls-pin-dots');
      return;
    }

    // ── SUCCESS ──────────────────────────────────────────────────────────
    localStorage.removeItem(_STU_FAIL_COUNT);
    localStorage.removeItem(_STU_FAIL_KEY);
    await enterStudentLearningSession({
      studentProfileId: profile.id,
      profile:          profile,
      sessionToken:     vr.session_token,
      source:           'student-login'
    });

  } catch (e) {
    if (nativeInp) nativeInp.disabled = false;
    if (msg) msg.textContent = 'Connection error — check your internet.';
  }
}

function _lsClearFamilyCache() {
  localStorage.removeItem('mmr_family_profiles');
  localStorage.removeItem('mmr_last_student_id');
  _lsFamilyProfiles = [];
  _lsSelectedStudentId = null;
  _lsPinBuffer = [];
  _lsRenderStudentCard();
}

async function _lsCheckOnboarding() {
  if (!_supa || !_supaUser) return;
  var role = localStorage.getItem('mmr_user_role');
  if (role !== 'parent') return;
  try {
    var result = await Promise.race([
      _supa.from('student_profiles').select('id', { count: 'exact', head: true }).eq('parent_id', _supaUser.id),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 5000); })
    ]);
    if (result.error) return;
    var count = result.count || 0;
    if (count === 0) _lsShowOnboarding();
  } catch(e) { /* silently skip if offline */ }
}

function _lsShowOnboarding() {
  var existing = document.getElementById('ls-onboard-modal');
  if (existing) return;
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
    var avatarColors = _AVATAR_COLORS[_obSelectedEmoji] || { from: '#f59e0b', to: '#f97316' };
    var ageVal = ageInp ? parseInt(ageInp.value) || null : null;

    // Server bcrypt-hashes the PIN and auto-generates family code
    var createResult = await Promise.race([
      _supa.rpc('create_student_profile', {
        p_display_name: name,
        p_avatar_emoji: _obSelectedEmoji,
        p_avatar_color_from: avatarColors.from,
        p_avatar_color_to: avatarColors.to,
        p_age: ageVal,
        p_pin: _obPinBuffer.join('')
      }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('timeout')); }, 10000); })
    ]);
    if (createResult.error) throw createResult.error;
    var familyCode = (createResult.data && createResult.data.family_code) ? createResult.data.family_code : 'MMR-????????';

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
  show('dashboard-screen'); _dbInit(); _installHistoryGuard();
}

// Apply state for a given card index. Moves the shared form, updates dots,
// toggles .is-active on cards, sets role, renders the student PIN UI on idx=0,
// and shows/hides the guest button. Does NOT animate the track translateX —
// that's _lsSnapTrack's job, so the dot-click and touch-snap paths share state
// logic without fighting over transform.
function _lsApplyCardState(idx) {
  idx = parseInt(idx, 10) || 0;
  // Move shared form to the active card's mount point
  var form = document.getElementById('ls-form-shared');
  var mount = document.getElementById('ls-mount-' + idx);
  if (form && mount) mount.appendChild(form);
  // Update dot indicators
  document.querySelectorAll('.ls-dot').forEach(function (dot, i) {
    dot.classList.toggle('active', i === idx);
  });
  // Toggle .is-active on cards (CSS drives scale/opacity steady states)
  var c0 = document.getElementById('ls-card-0');
  var c1 = document.getElementById('ls-card-1');
  if (c0) c0.classList.toggle('is-active', idx === 0);
  if (c1) c1.classList.toggle('is-active', idx === 1);
  _lsCardIdx = idx;
  _lsSetRole(idx === 0 ? 'student' : 'parent');
  if (idx === 0) _lsRenderStudentCard();
  // Hide guest button on Parent/Teacher card — dashboard requires an account
  var guestBtn = document.getElementById('ls-guest-btn');
  if (guestBtn) guestBtn.style.display = idx === 0 ? '' : 'none';
  // Watch the new active card so post-render content growth (validation msgs,
  // password strength, waitlist panel, etc.) keeps outer height in sync.
  _lsObserveActiveCard();
}

// Animate the track to the given card index. Uses CSS transition on transform.
function _lsSnapTrack(idx, dur) {
  var track = document.getElementById('ls-carousel-track');
  if (!track) return;
  track.style.transition = 'transform ' + (dur || 0.28) + 's cubic-bezier(.4,0,.2,1)';
  track.style.transform  = 'translateX(' + (idx * -50) + '%)';
}

// Public entry — used by dot clicks (data-action="_lsCarouselGo") and any
// other caller that wants to jump cards programmatically.
function _lsCarouselGo(idx) {
  idx = parseInt(idx, 10) || 0;
  _lsApplyCardState(idx);
  _lsAdaptHeight();
  _lsSnapTrack(idx, 0.28);
}

// ResizeObserver lazily-attached to the active card. Re-runs the height
// measurement whenever the active card's intrinsic size changes (form
// validation msgs, password strength bar appearing, etc.).
var _lsCardResizeObserver = null;
function _lsObserveActiveCard() {
  if (typeof ResizeObserver === 'undefined') return;
  if (_lsCardResizeObserver) _lsCardResizeObserver.disconnect();
  var active = document.getElementById('ls-card-' + _lsCardIdx);
  if (!active) return;
  _lsCardResizeObserver = new ResizeObserver(function () { _lsAdaptHeight(); });
  _lsCardResizeObserver.observe(active);
}

// Measure the active card and size the outer to match. The active card always
// reflects what the user sees — the inactive mount is either empty or holds
// the parked form (when the student card is active).
//
// Border-box accounting: the project applies `box-sizing: border-box` globally,
// so the outer's `style.height` includes its border (1.5px × 2 = ~2px). The
// card's content needs to fit inside `clientHeight` (which excludes border),
// so we add the border delta (offsetHeight - clientHeight) to compensate.
//
// Defensive: re-measure on the next animation frame in case layout was still
// settling (font load, async-rendered content, etc.).
function _lsAdaptHeight() {
  var outer = document.querySelector('.ls-carousel-outer');
  var active = document.getElementById('ls-card-' + _lsCardIdx);
  if (!outer || !active) return;
  var borderDelta = outer.offsetHeight - outer.clientHeight;
  var h = active.scrollHeight + borderDelta;
  outer.style.height = h + 'px';
  requestAnimationFrame(function () {
    var actualDelta = outer.offsetHeight - outer.clientHeight;
    var actual = active.scrollHeight + actualDelta;
    if (actual > h + 1) outer.style.height = actual + 'px';
  });
}

function _lsInitCarousel() {
  var track = document.getElementById('ls-carousel-track');
  if (!track || track._carouselInited) return;
  track._carouselInited = true;

  var _startX = 0, _startY = 0, _startT = 0;
  var _intentSet = false, _isHoriz = false, _outerW = 0;

  // Lerp helpers — inactive cards rest at scale(.94) / opacity(.7).
  // Progress is 0 (no drag) → 1 (full card width dragged).
  function _lerpScale(progress)   { return 1 - 0.06 * progress; }   // 1 → 0.94
  function _lerpOpacity(progress) { return 1 - 0.30 * progress; }   // 1 → 0.70

  function _setCardStyle(el, scale, opacity) {
    if (!el) return;
    el.style.transform = 'scale(' + scale + ')';
    el.style.opacity   = opacity;
  }

  function _clearCardInlineStyles() {
    ['ls-card-0', 'ls-card-1'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      // Reverting these to '' lets the CSS rule + .is-active class take over.
      // Order matters: transition first so the next paint animates,
      // then transform + opacity so the change becomes a transition.
      el.style.transition = '';
      el.style.transform  = '';
      el.style.opacity    = '';
    });
  }

  track.addEventListener('touchstart', function (e) {
    _startX    = e.touches[0].clientX;
    _startY    = e.touches[0].clientY;
    _startT    = Date.now();
    _intentSet = false;
    _isHoriz   = false;
    _outerW    = (track.parentElement || document.body).offsetWidth || window.innerWidth;
    track.style.transition = 'none';
    // Pause card transitions so finger-following lerp is instant, not smoothed.
    var c0 = document.getElementById('ls-card-0');
    var c1 = document.getElementById('ls-card-1');
    if (c0) c0.style.transition = 'none';
    if (c1) c1.style.transition = 'none';
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    var dx = e.touches[0].clientX - _startX;
    var dy = e.touches[0].clientY - _startY;
    if (!_intentSet && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      _intentSet = true;
      _isHoriz   = Math.abs(dx) > Math.abs(dy);
    }
    if (!_isHoriz) return;
    // Follow finger in pixels, clamped so you can't over-drag past either card.
    var currentPx = _lsCardIdx * (-_outerW);
    var newPx     = Math.max(-_outerW, Math.min(0, currentPx + dx));
    track.style.transform = 'translateX(' + newPx + 'px)';
    // Drag progress — 0 at rest, 1 at full card-width displacement.
    var progress = Math.abs(newPx + (_lsCardIdx * _outerW)) / _outerW;
    if (progress > 1) progress = 1;
    var c0 = document.getElementById('ls-card-0');
    var c1 = document.getElementById('ls-card-1');
    if (_lsCardIdx === 0) {
      _setCardStyle(c0, _lerpScale(progress),     _lerpOpacity(progress));
      _setCardStyle(c1, _lerpScale(1 - progress), _lerpOpacity(1 - progress));
    } else {
      _setCardStyle(c1, _lerpScale(progress),     _lerpOpacity(progress));
      _setCardStyle(c0, _lerpScale(1 - progress), _lerpOpacity(1 - progress));
    }
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    if (!_intentSet || !_isHoriz) {
      // Pure tap or vertical scroll attempt — bounce back, clear inline styles.
      _lsSnapTrack(_lsCardIdx, 0.28);
      _clearCardInlineStyles();
      return;
    }
    var dx        = e.changedTouches[0].clientX - _startX;
    var gestureMs = Math.max(1, Date.now() - _startT);
    var velocity  = Math.abs(dx) / gestureMs;
    var isFast    = velocity > 0.3 && Math.abs(dx) > 20;
    var committed = Math.abs(dx) >= _outerW * 0.5 || isFast;

    var targetIdx = _lsCardIdx;
    if (committed) {
      if (dx < 0 && _lsCardIdx < 1) targetIdx = 1;
      else if (dx > 0 && _lsCardIdx > 0) targetIdx = 0;
    }

    if (targetIdx !== _lsCardIdx) {
      // Move the form + apply state immediately so the slide reveals a
      // populated card instead of an empty ghost. _lsApplyCardState updates
      // _lsCardIdx, toggles .is-active, mounts the form, and re-attaches the
      // ResizeObserver. _lsAdaptHeight animates outer height to the new card.
      _lsApplyCardState(targetIdx);
      _lsAdaptHeight();
    }
    _lsSnapTrack(targetIdx, 0.28);
    _clearCardInlineStyles();
  }, { passive: true });

  track.addEventListener('touchcancel', function () {
    _lsSnapTrack(_lsCardIdx, 0.28);
    _clearCardInlineStyles();
  }, { passive: true });
}

// ── Phase C.3B: anonymous unique site visit tracker ──────────────────────────
// Fires website_viewed once per calendar day for unauthenticated visitors.
// Dedup key: mmr_website_viewed_YYYY_MM_DD. Anonymous visitor ID is a random
// UUID stored in mmr_anon_visitor_id — no PII, no fingerprinting.
function _trackWebsiteVisit() {
  try {
    var today    = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
    var dedupKey = 'mmr_website_viewed_' + today;
    if (localStorage.getItem(dedupKey)) return;
    var visitorId = (typeof _getAnonVisitorId === 'function') ? _getAnonVisitorId() : null;
    if (!visitorId) return;
    localStorage.setItem(dedupKey, '1');
    if (typeof _trackEvent === 'function') _trackEvent('website_viewed', { anon_visitor_id: visitorId });
  } catch (_) {}
}

function _dismissSplash(fadeInId){
  const splash = document.getElementById('auth-splash');
  if(fadeInId){
    const el = document.getElementById(fadeInId);
    if(el){
      el.style.transition = 'opacity 0.9s ease';
      requestAnimationFrame(()=>requestAnimationFrame(()=>{ el.style.opacity='1'; }));
      setTimeout(()=>{ el.style.transition=''; el.style.opacity=''; }, 1000);
    }
  }
  if(splash){
    splash.style.opacity='0';
    setTimeout(()=>{
      splash.style.display='none';
      if(typeof _recoverVisibleScreen==='function' && !document.querySelector('.sc.on')){
        _recoverVisibleScreen('post-splash');
      } else if(window._recoverVisibleScreen && !document.querySelector('.sc.on')){
        window._recoverVisibleScreen('post-splash-window');
      }
    },950);
  }
}

// ── History guard ──────────────────────────────────────────────────────────
// After Google OAuth, the browser history contains OAuth/callback URLs.
// iOS's native edge-swipe navigates that history, showing the auth page
// mid-transition. This guard replaces those entries and intercepts popstate
// so the browser never leaves the app.
let _historyGuardInstalled = false;
function _installHistoryGuard(){
  if(_historyGuardInstalled) return;
  _historyGuardInstalled = true;
  const url = location.pathname + location.search;
  // Overwrite any OAuth redirect URLs in history with the clean app URL
  history.replaceState({mmr:1}, '', url);
  // Push a guard entry so popstate always has somewhere safe to land
  history.pushState({mmr:1}, '', url);
  // Re-push whenever the browser tries to go back (iOS native swipe or back btn)
  // If a modal is open, close it instead of navigating away.
  window.addEventListener('popstate', function(){
    history.pushState({mmr:1}, '', url);
    const modals = [
      { id:'scal-modal',   close: _closeStreakCal   },
      { id:'access-modal', close: closeAccessModal },
      { id:'timer-modal',  close: closeTimerModal  },
      { id:'a11y-modal',   close: closeA11yModal   },
      { id:'pin-modal',    close: closePinModal     },
    ];
    for(const m of modals){
      const el = document.getElementById(m.id);
      if(el && el.style.display === 'flex'){ m.close(); return; }
    }
  });
}

// DOM-level signal: a learning-app screen is visible right now.
function _isOnLearningScreen() {
  var ids = ['home','unit-screen','lesson-screen','quiz-screen','results-screen','history-screen','settings-screen'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el && el.classList.contains('on')) return true;
  }
  return false;
}

// Authoritative composite gate: the user is currently using the learning app
// in any observable form. Independent of _authInitialSessionHandled — even
// during boot, if any of these signals are true we must not redirect.
//   1. localStorage role + active_student_id (set by enterStudentLearningSession)
//   2. DOM: a learning screen is visible
//   3. CUR.quiz is non-null (a quiz is running)
// Any one of the three is sufficient to suppress.
// A family-code student session has no Supabase user. Validity requires
// the role + active-student keys AND mmr_session_token (set only by a
// successful verify_student_pin RPC). The token's presence proves PIN
// auth happened; without it, treat the state as stale → route to login.
function _hasValidStudentSession() {
  return localStorage.getItem('mmr_user_role') === 'student'
      && !!localStorage.getItem('mmr_active_student_id')
      && !!localStorage.getItem('mmr_session_token');
}

function _shouldSuppressAuthNavigation() {
  // Hard guard: signed-out (no Supabase user, no explicit guest mode, no
  // valid family-code student session) must never suppress auth navigation.
  // Stale localStorage alone cannot authorize a "learning context."
  var hasAuth = !!_supaUser
    || localStorage.getItem('wb_guest_mode') === '1'
    || _hasValidStudentSession();
  if (!hasAuth) return false;

  var inLearningSession = localStorage.getItem('mmr_user_role') === 'student'
    && !!localStorage.getItem('mmr_active_student_id')
    && !localStorage.getItem('wb_guest_mode');
  var inQuiz = !!(typeof CUR !== 'undefined' && CUR && CUR.quiz);
  return inLearningSession || _isOnLearningScreen() || inQuiz;
}

function supabaseInit(){
  if(typeof supabase === 'undefined' || !SUPA_URL || !SUPA_KEY){
    // CDN failed or credentials not set — dismiss splash and show login so user isn't stuck
    const _lscrCdn = document.getElementById('login-screen'); if(_lscrCdn) _lscrCdn.style.opacity='0';
    show('login-screen');
    _lsInitCarousel();
    _lsCarouselGo(0);
    _trackWebsiteVisit();
    // No Supabase = no launch status. UI stays in default open state.
    _dismissSplash('login-screen');
    return;
  }
  _supa = supabase.createClient(SUPA_URL, SUPA_KEY, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });

  _supa.auth.onAuthStateChange(async (event, session) => {
    _supaUser = session ? session.user : null;
    updateAccountUI();
    _devLog('[MMR AUTH EVENT]', event, {
      role:           localStorage.getItem('mmr_user_role'),
      activeStudent:  localStorage.getItem('mmr_active_student_id'),
      resume:         localStorage.getItem('mmr_resume_student_session'),
      guest:          localStorage.getItem('wb_guest_mode'),
      initialHandled: _authInitialSessionHandled,
      onLearningScr:  _isOnLearningScreen(),
      inQuiz:         !!(typeof CUR !== 'undefined' && CUR && CUR.quiz)
    });
    if(event === 'INITIAL_SESSION'){
      // (0) Resume from grade-switch reload: must run before any suppress gate,
      //     because role='student' + resume='1' would also satisfy the suppress
      //     check, but here the navigation IS intended.
      if (_supaUser) {
        var _resumeFlag = localStorage.getItem('mmr_resume_student_session');
        var _resumeSid  = localStorage.getItem('mmr_active_student_id');
        if (_resumeFlag === '1' && _resumeSid && localStorage.getItem('mmr_user_role') === 'student') {
          _devLog('[MMR AUTH] INITIAL_SESSION student restore -> hydrate student', {studentId: _resumeSid});
          _authInitialSessionHandled = true;
          localStorage.removeItem('mmr_resume_student_session');
          await restoreStudentLearningSessionFromStorage(_resumeSid);
          if (typeof _renderCalBtn === 'function') _renderCalBtn();
          _dismissSplash();
          return;
        }
      }
      // (i) Suppress: any other learning context → no nav, just dismiss splash.
      if (_shouldSuppressAuthNavigation()) {
        _devLog('[MMR AUTH] INITIAL_SESSION ignored — active learning context', {
          role:          localStorage.getItem('mmr_user_role'),
          activeStudent: localStorage.getItem('mmr_active_student_id'),
          onLearningScr: _isOnLearningScreen(),
          inQuiz:        !!(typeof CUR !== 'undefined' && CUR && CUR.quiz),
          initialHandled: _authInitialSessionHandled
        });
        _authInitialSessionHandled = true;
        if (typeof _dismissSplash === 'function') _dismissSplash();
        return;
      }
      // (ii) Idempotency: if INITIAL_SESSION re-fires after we've already routed,
      //      do nothing (defensive — Supabase normally fires it once per registration).
      if (_authInitialSessionHandled) {
        console.log('[MMR AUTH] INITIAL_SESSION re-fire ignored');
        return;
      }
      _authInitialSessionHandled = true;
      // (iii) Existing routing.
      if(_supaUser){
        // Normal parent return — even if mmr_user_role==='student' is stale in
        // localStorage from a closed mid-session tab, treat this as a parent visit
        // and route to the parent dashboard.
        _devLog('[MMR AUTH] INITIAL_SESSION parent route -> dashboard', {staleRole: localStorage.getItem('mmr_user_role')});
        localStorage.removeItem('mmr_resume_student_session'); // defensive
        await _pullOnLogin();
        localStorage.setItem('mmr_user_role', 'parent');
        try {
          if (!_anaParentDashFired) {
            _anaParentDashFired = true;
            _trackEvent('parent_dashboard_opened', {});
          }
        } catch (_) {}
        show('dashboard-screen');
        if (typeof _dbInit === 'function') _dbInit();
        if (typeof _renderCalBtn === 'function') _renderCalBtn();
        if (typeof _installHistoryGuard === 'function') _installHistoryGuard();
        _dismissSplash();
        return;
      } else {
        // Local preview mode: only auto-seed a fake user when ?preview=1 is in the URL.
        // Without it, show the real login screen so guest UX can be tested accurately.
        const _isLocal = ['localhost','127.0.0.1'].includes(location.hostname) || /^192\.168\./.test(location.hostname);
        const _previewMode = _isLocal && new URLSearchParams(location.search).get('preview') === '1';
        if(_previewMode){
          const _tsN = parseInt(new URLSearchParams(location.search).get('testStreak')) || 7;
          _supaUser = { id:'preview', email:'preview@test.com' };
          STREAK.current = _tsN; STREAK.longest = _tsN + 5; STREAK.lastDate = new Date().toISOString().slice(0,10);
          const _tsDates = [];
          for(let i=0;i<_tsN;i++) _tsDates.push(new Date(Date.now()-i*86400000).toISOString().slice(0,10));
          localStorage.setItem('wb_act_dates', JSON.stringify(_tsDates));
          show('home'); buildHome(); _renderCalBtn(); _installHistoryGuard();
        } else if(localStorage.getItem('wb_guest_mode')) {
          // Resume guest session after grade-switch reload
          buildHome(); show('home');
          _dismissSplash();
          return;
        } else {
          const _lscr = document.getElementById('login-screen'); if(_lscr) _lscr.style.opacity='0';
          show('login-screen'); _initOneTap(); _lsInitCarousel(); _lsCarouselGo(0);
          _trackWebsiteVisit();
          _loadLaunchStatus();
          _dismissSplash('login-screen');
          return;
        }
        _dismissSplash();
      }
    } else if(event === 'SIGNED_IN'){
      // Suppress on token refresh, session restore, or visibility-fired SIGNED_IN
      // while the user is in any observable learning context. Stands alone — no
      // dependency on _authInitialSessionHandled.
      if (_shouldSuppressAuthNavigation()) {
        _devLog('[MMR AUTH] SIGNED_IN ignored — active learning/quiz screen', {
          role:          localStorage.getItem('mmr_user_role'),
          activeStudent: localStorage.getItem('mmr_active_student_id'),
          onLearningScr: _isOnLearningScreen(),
          inQuiz:        !!(typeof CUR !== 'undefined' && CUR && CUR.quiz)
        });
        return;
      }
      // Fresh OAuth sign-in — always a parent. A resume cannot legitimately
      // produce SIGNED_IN (only INITIAL_SESSION), so clear any stale resume flag.
      console.log('[MMR AUTH] SIGNED_IN parent route -> dashboard');
      localStorage.removeItem('wb_guest_mode');
      localStorage.removeItem('mmr_resume_student_session');
      await _pullOnLogin();
      localStorage.setItem('mmr_user_role', 'parent');
      try {
        if (!_anaParentDashFired) {
          _anaParentDashFired = true;
          _trackEvent('parent_dashboard_opened', {});
        }
      } catch (_) {}
      sessionStorage.removeItem('mmr_post_auth_redirect');
      show('dashboard-screen');
      if (typeof _dbInit === 'function') _dbInit();
      if (typeof _renderCalBtn === 'function') _renderCalBtn();
      if (typeof _installHistoryGuard === 'function') _installHistoryGuard();
    } else if(event === 'SIGNED_OUT'){
      _clearUserData();
      show('login-screen');
      _lsInitCarousel();
      _lsCarouselGo(0);
      _initOneTap();
      _loadLaunchStatus();
      _dismissSplash('login-screen');
    }
  });
}

// ── MULTI-TAB SYNC ────────────────────────
// When another tab pushes to cloud, signal this tab to re-pull so both stay current.
(function(){
  if(typeof BroadcastChannel === 'undefined') return; // Safari < 15.4: no-op
  var _bc = new BroadcastChannel('mmr_sync');
  _bc.onmessage = function(ev){
    if(ev.data === 'pushed' && _supaUser && !_syncing){
      _pullOnLogin(true);
    }
  };
  // Patch _triggerParentSync to notify other tabs after this tab pushes
  var _origTriggerParentSync = _triggerParentSync;
  _triggerParentSync = function(){
    _origTriggerParentSync();
    // Notify after debounce + estimated network time
    setTimeout(function(){ _bc.postMessage('pushed'); }, 1100);
  };
})();

// ── ANONYMOUS SESSION TRACKING ───────────
// _trackAnonSession() REMOVED — COPPA compliance.
// This K-5 app must not generate persistent device identifiers or log
// referrer URLs for unauthenticated users (who may be children) before
// parental consent is obtained.  Supabase RPC log_anon_session is no
// longer called for guests.  Authenticated-user activity is tracked via
// _pullOnLogin() which runs only after a parent has signed in.
function _continueAsGuest() {
  // Purge any legacy device IDs written by older app versions
  localStorage.removeItem('wb_device_id');
  localStorage.removeItem('wb_anon_tracked');
  // Show consent gate before entering guest mode
  _showSoftGate();
}

function _proceedAsGuest() {
  console.log('[MMR GUEST] entering guest mode');
  document.getElementById('soft-gate-modal')?.remove();
  localStorage.removeItem('mmr_user_role');
  localStorage.setItem('wb_guest_mode', '1');
  buildHome();
  show('home');
}

// ── LOGIN SCREEN functions ────────────────
let _lsLoading = false;

let _oneTapReady = false;
let _oneTapNonce = null;
let _oneTapRetries = 0;
const _ONE_TAP_MAX_RETRIES = 15; // max ~6 seconds
async function _initOneTap(){
  if(typeof google === 'undefined'){
    if(++_oneTapRetries > _ONE_TAP_MAX_RETRIES) return; // give up — Google script didn't load
    setTimeout(_initOneTap, 400); return;
  }
  _oneTapRetries = 0; // reset for future calls
  if(!_supa) return;
  if(GOOGLE_CLIENT_ID.includes('%%')) { console.warn('[Auth] GOOGLE_CLIENT_ID not configured'); return; }
  if(!_oneTapReady){
    _oneTapReady = true;
    // Generate nonce — hashed version goes to Google, raw version to Supabase
    const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
    _oneTapNonce = raw;
    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    const hashed = Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      nonce: hashed,
      use_fedcm_for_prompt: true,
      callback: async ({ credential }) => {
        const { error } = await _supa.auth.signInWithIdToken({ provider:'google', token:credential, nonce:_oneTapNonce });
        if(error){ const m=document.getElementById('ls-msg'); if(m) m.textContent=error.message; }
      }
    });
  }
  google.accounts.id.prompt();
}

async function _lsOAuth(provider){
  const msg = document.getElementById('ls-msg');
  if(msg) msg.textContent = '';
  if(!_supa){
    if(msg){ msg.style.color='#e74c3c'; msg.textContent='⚠️ Not connected. Please wait and try again.'; }
    return;
  }
  // Mark as parent BEFORE the OAuth redirect — this key survives the page reload
  localStorage.setItem('mmr_user_role', 'parent');
  // Show loading state on the button
  const btn = [...document.querySelectorAll('#login-screen button')].find(b => (b.getAttribute('onclick')||'').includes(`_lsOAuth('${provider}')`));
  const origHTML = btn ? btn.innerHTML : '';
  if(btn){ btn.disabled = true; btn.style.opacity='0.65'; btn.textContent='Connecting…'; }
  if(msg){ msg.style.color='#4a90d9'; msg.textContent='Redirecting to Google…'; }
  try {
    const { error } = await _supa.auth.signInWithOAuth({
      provider,
      options:{ redirectTo: location.origin + '/' }
    });
    if(error){
      if(msg){ msg.style.color='#e74c3c'; msg.textContent='⚠️ ' + error.message; }
      if(btn){ btn.disabled=false; btn.style.opacity='1'; btn.innerHTML=origHTML; }
    }
    // No error = browser is redirecting, leave button disabled
  } catch(e){
    if(msg){ msg.style.color='#e74c3c'; msg.textContent='⚠️ Sign in failed. Please try again.'; }
    if(btn){ btn.disabled=false; btn.style.opacity='1'; btn.innerHTML=origHTML; }
  }
}

function _lsSwitchTab(tab){
  // Launch Gate: if signup is closed, refuse the switch and reveal waitlist.
  if (tab === 'signup' && _launchStatus && !_launchStatus.signup_open) {
    _showWaitlistPanel('user_clicked_create');
    return;
  }
  const isSignup = tab === 'signup';
  document.getElementById('ls-tab-login').className  = 'auth-tab-btn ' + (isSignup?'idle':'active');
  document.getElementById('ls-tab-signup').className = 'auth-tab-btn ' + (isSignup?'active':'idle');
  document.getElementById('ls-name-row').style.display    = isSignup ? 'block' : 'none';
  document.getElementById('ls-consent-row').style.display = isSignup ? 'block' : 'none';
  document.getElementById('ls-submit-btn').textContent   = isSignup ? 'Create Account' : 'Sign In';
  document.getElementById('login-screen').dataset.tab    = tab;
  document.getElementById('ls-msg').textContent          = '';
  document.getElementById('ls-pw-strength').style.display = 'none';
  document.getElementById('ls-resend-row').style.display  = 'none';
  const pwInp = document.getElementById('ls-password');
  pwInp.value = ''; pwInp.type = 'password';
  const pwToggle = document.getElementById('ls-pw-toggle');
  if(pwToggle){ pwToggle.innerHTML = _ICO.eyeOn; pwToggle.setAttribute('aria-label','Show password'); }
  const forgotRow = document.getElementById('ls-forgot-row');
  if(forgotRow) forgotRow.style.display = isSignup ? 'none' : 'block';
  // Update placeholder text for password field
  document.getElementById('ls-password').placeholder = isSignup ? 'Password (min 8 characters)' : 'Password';
  // Tab visibility changes the form's natural height. Wait two frames so the
  // display:none/block toggles have laid out, then re-measure. The CSS
  // transition on .ls-carousel-outer's height animates the change.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { _lsAdaptHeight(); });
  });
}

// ── Launch Gate (controlled beta) ────────────────────────────────────────────
// Server-enforced. The frontend just renders the right UI based on the
// status RPC; even if hidden tabs are revealed via DevTools the server still
// refuses signup (Supabase Auth has "Disable signups" ON, and signup-gate
// independently checks the cap before creating the user).
var _launchStatus = null;
var _waitlistViewedFired = false;

async function _loadLaunchStatus() {
  if (!_supa) return;
  try {
    const { data, error } = await _supa.rpc('get_launch_status');
    if (error || !Array.isArray(data) || !data.length) return;
    _launchStatus = data[0];
    _applyLaunchStatusUI();
  } catch (_) {}
}

function _applyLaunchStatusUI() {
  if (!_launchStatus) return;
  const tabSignup = document.getElementById('ls-tab-signup');
  const tabLogin  = document.getElementById('ls-tab-login');
  const panel     = document.getElementById('ls-waitlist-panel');
  if (!_launchStatus.signup_open) {
    // Hide the Create Account tab; force user to Sign In tab.
    if (tabSignup) tabSignup.style.display = 'none';
    if (tabLogin)  tabLogin.style.flex     = '1 1 100%';
    if (document.getElementById('login-screen').dataset.tab === 'signup') {
      // If we were on signup tab, switch back to login first
      _lsSwitchTab('login');
    }
    if (panel) {
      panel.style.display = 'block';
      _setWaitlistCopy();
      if (!_waitlistViewedFired) {
        _waitlistViewedFired = true;
        if (typeof _trackEvent === 'function') {
          _trackEvent('waitlist_viewed', { reason: _launchStatus.waitlist_open ? 'cap_reached' : 'closed' });
          _trackEvent('signup_gate_viewed', {});
        }
      }
    }
  } else {
    if (tabSignup) tabSignup.style.display = '';
    if (tabLogin)  tabLogin.style.flex     = '';
    if (panel)     panel.style.display     = 'none';
  }
}

function _setWaitlistCopy() {
  const head = document.getElementById('ls-waitlist-headline');
  const sub  = document.getElementById('ls-waitlist-sub');
  if (!_launchStatus) return;
  if (!_launchStatus.waitlist_open) {
    if (head) head.textContent = 'New signups are paused';
    if (sub)  sub.textContent  = 'We’re not currently accepting new accounts. Please check back soon.';
    // Hide the form when waitlist itself is disabled
    const form = document.getElementById('ls-waitlist-form');
    if (form) form.style.display = 'none';
  } else {
    if (head) head.textContent = 'My Math Roots is in limited beta';
    if (sub)  sub.textContent  = 'All ' + (_launchStatus.accounts_cap || '') + ' spots are filled. Join the waitlist and we’ll email you when more open up.';
  }
}

function _showWaitlistPanel(reason) {
  const panel = document.getElementById('ls-waitlist-panel');
  if (panel) {
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    _setWaitlistCopy();
    if (typeof _trackEvent === 'function') _trackEvent('waitlist_viewed', { reason: reason || 'manual' });
  }
}

async function _lsJoinWaitlist() {
  const emailInp = document.getElementById('ls-waitlist-email');
  const btn      = document.getElementById('ls-waitlist-btn');
  const msgEl    = document.getElementById('ls-waitlist-msg');
  if (!emailInp || !btn || !msgEl) return;

  const email = (emailInp.value || '').trim();
  msgEl.style.color = '#e74c3c';
  if (!_rateLimit('waitlist', 3)) { msgEl.textContent = '⚠️ Too many attempts. Please wait a moment.'; return; }
  if (!email || !_validEmail(email)) { msgEl.textContent = '⚠️ Please enter a valid email address.'; return; }

  // Reuse the login-screen Turnstile widget. Silent-pass mode means the
  // callback may not fire even when a token exists, so fall back to
  // getResponse the same way the signup-gate caller does.
  let captchaToken = _turnstileToken;
  if (!captchaToken && window.turnstile && typeof window.turnstile.getResponse === 'function') {
    try { captchaToken = window.turnstile.getResponse('#ls-turnstile .cf-turnstile') || null; } catch (_) {}
  }
  if (!captchaToken) {
    msgEl.textContent = _turnstileFailed
      ? _TURNSTILE_FAIL_MSG
      : '⚠️ Please complete the security check above.';
    return;
  }

  const origTxt = btn.textContent;
  btn.disabled  = true;
  btn.textContent = 'Joining…';

  try {
    const res = await fetch('/.netlify/functions/waitlist-join', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, source: 'login_screen', captchaToken }),
    });
    let json = {};
    try { json = await res.json(); } catch (_) {}
    _resetTurnstile();

    if (res.ok && json && json.ok) {
      // Non-enumerating: identical message whether the email is new or
      // already on the list. The server stores both shapes silently.
      msgEl.style.color = '#27ae60';
      msgEl.textContent = '✅ You’re on the waitlist. We’ll email you when more spots open.';
      emailInp.value = '';
      if (typeof _trackEvent === 'function') _trackEvent('waitlist_joined', { source: 'login_screen' });
    } else if (res.status === 403 && json && json.error === 'turnstile_failed') {
      msgEl.textContent = '⚠️ Security check failed. Please try again.';
    } else if (res.status === 429) {
      msgEl.textContent = '⚠️ Too many attempts. Please wait a few minutes and try again.';
    } else if (res.status === 400 && json && json.error === 'invalid_email') {
      msgEl.textContent = '⚠️ Please enter a valid email address.';
    } else {
      msgEl.textContent = '⚠️ Couldn’t join the waitlist. Please try again.';
    }
  } catch (e) {
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '⚠️ Network error. Please try again.';
  } finally {
    btn.disabled = false;
    btn.textContent = origTxt;
  }
}

async function _lsForgotPassword(){
  if(!_supa) return;
  const msgEl = document.getElementById('ls-msg');
  const email = document.getElementById('ls-email').value.trim();
  if(!email){
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '⚠️ Enter your email address above first.';
    document.getElementById('ls-email').focus();
    return;
  }
  msgEl.style.color = '#4a90d9';
  msgEl.textContent = 'Sending reset link…';
  const { error } = await _supa.auth.resetPasswordForEmail(email, {
    redirectTo: location.origin
  });
  if(error){
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '⚠️ ' + error.message;
  } else {
    msgEl.style.color = '#27ae60';
    msgEl.textContent = '✅ Reset link sent — check your email!';
  }
}

// ── Password show/hide toggle ─────────────
function _lsTogglePw(){
  const inp = document.getElementById('ls-password');
  const btn = document.getElementById('ls-pw-toggle');
  if(!inp || !btn) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.innerHTML = show ? _ICO.eyeOff : _ICO.eyeOn;
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
}

// ── Turnstile token state ─────────────────
let _turnstileToken = null;
let _turnstileFailed = false;
const _TURNSTILE_FAIL_MSG = '⚠️ Security check could not load. Please refresh and try again. If this continues, contact support.';
function _onTurnstileSuccess(token){ _turnstileToken = token; _turnstileFailed = false; }
function _onTurnstileExpired(){ _turnstileToken = null; }
function _onTurnstileError(code){
  // Fired by Cloudflare Turnstile when the widget can't initialize (e.g. error 110200
  // = hostname not in the sitekey's allowlist, or a network/CSP problem). Without this
  // hook the user only sees the generic "Please complete the security check above"
  // gate message in _lsSubmit, which is misleading because the widget never offered
  // them anything to complete (it's data-appearance="interaction-only" in index.html).
  _turnstileToken = null;
  _turnstileFailed = true;
  const msgEl = document.getElementById('ls-msg');
  if(msgEl){
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = _TURNSTILE_FAIL_MSG;
  }
}
function _resetTurnstile(){
  _turnstileToken = null;
  if(window.turnstile) window.turnstile.reset('#ls-turnstile .cf-turnstile');
}

async function _lsSubmit(){
  if(!_supa || _lsLoading) return;
  const tab      = document.getElementById('login-screen').dataset.tab || 'login';
  const email    = document.getElementById('ls-email').value.trim();
  const password = document.getElementById('ls-password').value;
  const msgEl    = document.getElementById('ls-msg');
  msgEl.style.color = '#e74c3c';
  // Honeypot — bots fill hidden fields, humans don't. Silently block.
  if(document.getElementById('ls-hp')?.value){ return; }
  // Rate limit — max 5 attempts per minute
  if(!_rateLimit('login', 5)){
    msgEl.textContent = '⚠️ Too many attempts. Please wait a moment.';
    return;
  }
  if(!email || !password){ msgEl.textContent='⚠️ Please enter email and password.'; return; }
  if(!_validEmail(email)){ msgEl.textContent='⚠️ Please enter a valid email address.'; return; }
  if(tab === 'signup'){
    if(password.length < 8){ msgEl.textContent='⚠️ Password must be at least 8 characters.'; return; }
    if(_pwStrength(password) < 1){ msgEl.textContent='⚠️ Password is too weak — add numbers or symbols.'; return; }
    const nameVal = _sanitize(document.getElementById('ls-name').value, 30);
    if(!nameVal){ msgEl.textContent='⚠️ Please enter your name.'; document.getElementById('ls-name').focus(); return; }
    const consentEl = document.getElementById('ls-consent');
    if(!consentEl?.checked){
      msgEl.textContent='⚠️ Please confirm you are a parent or guardian.';
      const label = document.getElementById('ls-consent-label');
      if(label) label.style.borderColor = '#e74c3c';
      consentEl?.focus();
      return;
    }
  } else {
    if(password.length < 6){ msgEl.textContent='⚠️ Password must be at least 6 characters.'; return; }
  }
  // Turnstile CAPTCHA — must be verified before submitting.
  // In data-appearance="interaction-only" silent-pass mode Cloudflare populates the
  // hidden input and turnstile.getResponse() but does NOT fire data-callback, so
  // _turnstileToken stays null even though a real token exists. Fall back to the
  // Turnstile SDK so the gate doesn't trap users behind an invisible passing widget.
  let captchaToken = _turnstileToken;
  if(!captchaToken && window.turnstile && typeof window.turnstile.getResponse === 'function'){
    try { captchaToken = window.turnstile.getResponse('#ls-turnstile .cf-turnstile') || null; } catch(_){ }
  }
  if(!captchaToken){
    msgEl.textContent = _turnstileFailed
      ? _TURNSTILE_FAIL_MSG
      : '⚠️ Please complete the security check above.';
    return;
  }
  _lsLoading = true;
  const btn = document.getElementById('ls-submit-btn');
  const origTxt = btn.textContent;
  btn.textContent = '…';
  msgEl.style.color = '#4a90d9';
  msgEl.textContent = tab==='signup' ? 'Creating account…' : 'Signing in…';
  try{
    let result;
    if(tab === 'signup'){
      const displayName = _sanitize(document.getElementById('ls-name').value, 30) || 'Student';
      // Launch Gate: server-enforced signup. Direct supabase.auth.signUp() is
      // blocked at the Auth layer ("Allow new users to sign up" OFF). The
      // Netlify function checks the cap + Turnstile + creates via admin API.
      let gateRes, gateJson;
      try {
        gateRes  = await fetch('/.netlify/functions/signup-gate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password, displayName, captchaToken }),
        });
        gateJson = await gateRes.json().catch(()=>({}));
      } catch (e) {
        result = { error: { message: 'Network error — please try again.' } };
      }
      _resetTurnstile();
      if (gateRes && gateRes.ok && gateJson && gateJson.ok) {
        // Signup accepted; Supabase will send a confirmation email.
        result = { data: { session: null }, error: null };
      } else if (gateRes && (gateJson.reason === 'cap_reached' || gateJson.reason === 'disabled' || gateJson.error === 'cap_reached' || gateJson.error === 'signup_disabled')) {
        if (typeof _trackEvent === 'function') _trackEvent('signup_blocked_capacity', { reason: gateJson.reason || gateJson.error });
        await _loadLaunchStatus();
        _showWaitlistPanel('signup_blocked');
        msgEl.style.color = '#e74c3c';
        msgEl.textContent = '⚠️ Beta is full — see the waitlist below.';
        return;
      } else if (gateRes && gateJson.error === 'turnstile_failed') {
        result = { error: { message: 'Security check failed. Please try again.' } };
      } else if (gateRes && (gateJson.error === 'invalid_email' || gateJson.error === 'short_password' || gateJson.error === 'invalid_body')) {
        result = { error: { message: 'Please check your details and try again.' } };
      } else if (!result) {
        result = { error: { message: 'Could not create account. Please try again.' } };
      }
    } else {
      result = await _supa.auth.signInWithPassword({
        email, password,
        options: { captchaToken }
      });
      _resetTurnstile();
    }
    // Remember email preference — SEC-9: store encrypted, never plain text
    if(!result.error && tab === 'login'){
      const rem = document.getElementById('ls-remember');
      if(rem?.checked){
        _encryptStr(email).then(enc => localStorage.setItem('mmr_email_enc', JSON.stringify(enc))).catch(()=>{});
      } else {
        localStorage.removeItem('mmr_email_enc');
      }
    }
    if(result.error){
      msgEl.style.color = '#e74c3c';
      msgEl.textContent = '⚠️ ' + _friendlyError(result.error);
    } else if(tab==='signup'){
      // Non-enumerating success: signup-gate now returns 200 ok=true even
      // when the email is already registered (the original holder owns
      // the account and gets no new confirmation email). Phrase the
      // message so it's correct in both cases — new sign-up sees an
      // email arrive; duplicate sees "sign in" path applicable.
      msgEl.style.color = '#27ae60';
      msgEl.textContent = '✅ If this email is new to us, check your inbox to confirm. Already have an account? Try signing in below.';
      _lsLastSignupEmail = email;
      document.getElementById('ls-resend-row').style.display = 'block';
    }
    // onAuthStateChange handles navigation to home on success
  } catch(e){
    _logError('lsSubmit', e);
    _resetTurnstile();
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '⚠️ ' + _friendlyError(e);
  } finally {
    _lsLoading = false;
    btn.textContent = origTxt;
  }
}

async function _syncStudentSettings(studentId) {
  if (!_supa || !studentId || studentId === 'local') return;
  try {
    // Single RPC replaces 3 separate calls — 1 round trip instead of 3
    var result = await _supa.rpc('get_all_student_settings', { p_student_id: studentId });
    if (result.data) {
      if (result.data.unlock) localStorage.setItem('wb_unlock_' + studentId, JSON.stringify(result.data.unlock));
      if (result.data.timer)  localStorage.setItem('wb_timer_'  + studentId, JSON.stringify(result.data.timer));
      if (result.data.a11y)   localStorage.setItem('wb_a11y_'   + studentId, JSON.stringify(result.data.a11y));
    }
  } catch(e) { /* offline — use cached values */ }
}

// ── Unlock settings live sync ──────────────────────────────────────────────
// Polls Supabase every 3 minutes while a student is active, AND re-checks
// whenever the user switches back to the tab/app. This means parent changes
// made on another device (phone, tablet, computer) reach the student without
// requiring a sign-out. If unlock state changed, home screen is re-rendered.
var _unlockSyncTimer   = null;
var _unlockVisListener = null;

function _stopUnlockSync() {
  if (_unlockSyncTimer)   { clearInterval(_unlockSyncTimer); _unlockSyncTimer = null; }
  if (_unlockVisListener) { document.removeEventListener('visibilitychange', _unlockVisListener); _unlockVisListener = null; }
}

async function _refreshUnlockSettings(studentId) {
  if (!_supa || !studentId || studentId === 'local') return;
  var cachedStr = localStorage.getItem('wb_unlock_' + studentId);
  try {
    var result = await _supa.rpc('get_unlock_settings', { p_student_id: studentId, p_session_token: _sessionToken });
    if (result.error) { _handleSessionExpiry(result.error); return; }
    if (!result.data) return;
    var freshStr = JSON.stringify(result.data);
    if (freshStr === cachedStr) return; // nothing changed
    localStorage.setItem('wb_unlock_' + studentId, freshStr);
    // Re-render home screen if it is currently visible so new unlocks appear instantly
    if (document.getElementById('home') &&
        document.getElementById('home').classList.contains('on') &&
        typeof buildHome === 'function') {
      buildHome();
    }
  } catch(e) { if (!_handleSessionExpiry(e)) { /* offline — keep cached */ } }
}

function _startUnlockSync(studentId) {
  _stopUnlockSync();
  if (!studentId || studentId === 'local') return;

  // Poll every 3 minutes
  _unlockSyncTimer = setInterval(function() {
    var currentId = localStorage.getItem('mmr_active_student_id');
    if (currentId === studentId) {
      _refreshUnlockSettings(studentId);
    } else {
      _stopUnlockSync(); // student switched — stop this timer
    }
  }, 3 * 60 * 1000);

  // Also refresh immediately when user switches back to the app/tab
  _unlockVisListener = function() {
    if (document.visibilityState !== 'visible') return;
    var currentId = localStorage.getItem('mmr_active_student_id');
    if (currentId === studentId) {
      _refreshUnlockSettings(studentId);
    } else {
      _stopUnlockSync();
    }
  };
  document.addEventListener('visibilitychange', _unlockVisListener);
}

async function _syncPinHash() {
  if (!_supa || !_supaUser) return;
  try {
    var result = await _supa.rpc('get_pin_hash', { p_parent_id: _supaUser.id });
    if (result.data) localStorage.setItem('wb_parent_pin', result.data);
  } catch(e) { /* offline — keep existing local hash */ }
}

// ── Activity merge helper ────────────────────────────────────────────────
// Union-merge two activity event arrays. Local events win on ts collision.
// Result is sorted by ts ascending, capped at 1000.
function _mergeActivityEvents(localEvents, remoteEvents) {
  var tsMap = {};
  (remoteEvents || []).forEach(function(e) { if (e && e.ts) tsMap[String(e.ts)] = e; });
  (localEvents  || []).forEach(function(e) { if (e && e.ts) tsMap[String(e.ts)] = e; });
  var merged = Object.keys(tsMap).map(function(k) { return tsMap[k]; });
  merged.sort(function(a, b) { return a.ts - b.ts; });
  if (merged.length > 1000) merged = merged.slice(merged.length - 1000);
  return { v: 1, events: merged };
}

// Pull progress + quiz scores from Supabase for a student who logged in via PIN,
// without requiring an active parent Supabase session.  Uses the SECURITY DEFINER
// RPC so it works with only the anon key.  Results are merged into DONE / SCORES
// (same logic as _pullOnLogin) and home is rebuilt once data arrives.
async function _pullStudentProgress(studentId) {
  if (!_supa || !studentId || studentId === 'local' || !_sessionToken) return;
  try {
    var result = await Promise.race([
      _supa.rpc('pull_student_progress', {
        p_student_id:    studentId,
        p_session_token: _sessionToken,
        p_grade:         localStorage.getItem('mmr_grade') || '2'
      }),
      new Promise(function(_, rej) { setTimeout(function() { rej(new Error('pull timeout')); }, 8000); })
    ]);
    if (result.error) {
      if (_handleSessionExpiry(result.error)) return;
      console.warn('[Supabase] pull error', result.error);
      return;
    }
    if (!result.data) return;
    var data = result.data;
    var changed = false;

    // Cross-device reset invalidation. pull_student_progress now returns
    // profile.reset_epoch — if the server has bumped past our local
    // marker, clear every grade-scoped cache + the in-memory const
    // globals before merging anything else from the pull.
    try {
      if (typeof _dbApplyServerResetEpoch === 'function') {
        var _resetEpoch = (data.profile && data.profile.reset_epoch != null)
          ? Number(data.profile.reset_epoch)
          : 0;
        _dbApplyServerResetEpoch(studentId, _resetEpoch);
      }
    } catch (_e) {}

    // Merge done_json
    var doneJson = data.profile && data.profile.done_json;
    if (doneJson && typeof doneJson === 'object' && !Array.isArray(doneJson)) {
      var safe = {};
      var keys = Object.keys(doneJson);
      for (var ki = 0; ki < keys.length; ki++) {
        var k = keys[ki];
        if (typeof k === 'string' && k.length < 100 && k !== '__proto__' && k !== 'constructor' && k !== 'prototype') {
          safe[k] = !!doneJson[k];
        }
      }
      Object.assign(DONE, safe);
      saveDone();
      changed = true;
    }

    // Tier 1 cross-device sync: reconcile paused-quiz state against the
    // merged DONE map. If another device completed a quiz that this device
    // had locally paused, the paused entry must be cleared so the dashboard
    // stops offering "Resume". Completion beats stale pause. The map is
    // qid-keyed (e.g. 'lq_u1l4'); DONE uses the same qid as the done flag.
    try {
      if (typeof _getPausedAll === 'function' && typeof _clearPausedQuiz === 'function') {
        var _pausedAll = _getPausedAll();
        if (_pausedAll && typeof _pausedAll === 'object') {
          var _pausedKeys = Object.keys(_pausedAll);
          for (var _pi = 0; _pi < _pausedKeys.length; _pi++) {
            var _pqid = _pausedKeys[_pi];
            if (DONE && DONE[_pqid] === true) {
              _clearPausedQuiz(_pqid);
              changed = true;
            }
          }
        }
      }
    } catch (_pe) {}

    // Merge mastery_json → mmr_mastery_v1_<grade> (per-grade canonical key;
    // per-tag higher-attempts wins). The RPC was called with p_grade scope,
    // so the row's mastery_json is already grade-isolated; we simply hydrate
    // into the matching local bucket.
    var masteryJson = data.profile && data.profile.mastery_json;
    if (masteryJson && typeof masteryJson === 'object') {
      try {
        var _gPull = (typeof normalizeGrade === 'function')
          ? normalizeGrade(localStorage.getItem('mmr_grade'))
          : (localStorage.getItem('mmr_grade') || '2');
        var _pullKey = 'mmr_mastery_v1_' + _gPull;
        var localAgg = JSON.parse(localStorage.getItem(_pullKey) || '{}');
        var mkeys = Object.keys(masteryJson);
        var mchanged = false;
        for (var mi = 0; mi < mkeys.length; mi++) {
          var mk = mkeys[mi];
          var cm = masteryJson[mk];
          if (!cm || typeof cm.attempts !== 'number') continue;
          var lm = localAgg[mk];
          if (!lm || cm.attempts > lm.attempts || (cm.attempts === lm.attempts && (cm.correct || 0) > (lm.correct || 0))) {
            localAgg[mk] = { attempts: cm.attempts, correct: cm.correct || 0, lastSeen: cm.lastSeen || 0 };
            mchanged = true;
          }
        }
        if (mchanged) { localStorage.setItem(_pullKey, JSON.stringify(localAgg)); changed = true; }
      } catch (_me) {}
    }
    // Hydrate activity_json → mmr_activity_v1 (union merge by ts)
    var activityJson = data.profile && data.profile.activity_json;
    if (activityJson && activityJson.v === 1 && Array.isArray(activityJson.events)) {
      try {
        var localActDoc = JSON.parse(localStorage.getItem('mmr_activity_v1') || 'null');
        var localEvts = (localActDoc && localActDoc.v === 1 && Array.isArray(localActDoc.events)) ? localActDoc.events : [];
        var mergedDoc = _mergeActivityEvents(localEvts, activityJson.events);
        localStorage.setItem('mmr_activity_v1', JSON.stringify(mergedDoc));
        changed = true;
      } catch (_ae) {}
    }

    // Merge streak
    var prof = data.profile;
    if (prof) {
      if (typeof prof.streak_current === 'number' && prof.streak_current > (STREAK.current || 0)) {
        STREAK.current = prof.streak_current; changed = true;
      }
      if (typeof prof.streak_longest === 'number' && prof.streak_longest > (STREAK.longest || 0)) {
        STREAK.longest = prof.streak_longest; changed = true;
      }
      if (prof.streak_last_date) {
        STREAK.lastDate = prof.streak_last_date;
      }
      localStorage.setItem('wb_streak', JSON.stringify(STREAK));
      // Overwrite local activity dates with server version (authoritative per student)
      if (Array.isArray(prof.act_dates_json)) {
        var _safeActDates = prof.act_dates_json.filter(function(d){
          return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
        });
        localStorage.setItem('wb_act_dates', JSON.stringify(_safeActDates));
      }
    }

    // Merge apptime
    var appJson = data.profile && data.profile.apptime_json;
    if (appJson && typeof appJson === 'object') {
      var appChanged = false;
      if (typeof appJson.totalSecs === 'number' && appJson.totalSecs > (APP_TIME.totalSecs || 0)) {
        APP_TIME.totalSecs = appJson.totalSecs; appChanged = true;
      }
      if (typeof appJson.sessions === 'number' && appJson.sessions > (APP_TIME.sessions || 0)) {
        APP_TIME.sessions = appJson.sessions; appChanged = true;
      }
      if (appJson.dailySecs && typeof appJson.dailySecs === 'object') {
        APP_TIME.dailySecs = APP_TIME.dailySecs || {};
        for (var d in appJson.dailySecs) {
          if (typeof appJson.dailySecs[d] === 'number' && appJson.dailySecs[d] > (APP_TIME.dailySecs[d] || 0)) {
            APP_TIME.dailySecs[d] = appJson.dailySecs[d]; appChanged = true;
          }
        }
      }
      if (appChanged && typeof saveAppTime === 'function') saveAppTime();
    }

    // Merge scores (append-only by local_id)
    var remoteScores = data.scores;
    if (Array.isArray(remoteScores) && remoteScores.length) {
      var localIds = new Set(SCORES.map(function(s) { return s.id; }));
      var incoming = remoteScores
        .filter(function(r) {
          return r && typeof r.local_id === 'number' && typeof r.qid === 'string'
            && typeof r.score === 'number' && typeof r.total === 'number'
            && typeof r.pct === 'number' && r.pct >= 0 && r.pct <= 100
            && !localIds.has(r.local_id);
        })
        .map(function(r) {
          return {
            qid: r.qid, label: String(r.label || ''), type: String(r.type || ''),
            score: r.score, total: r.total, pct: r.pct, stars: String(r.stars || ''),
            unitIdx: typeof r.unit_idx === 'number' ? r.unit_idx : 0,
            color: String(r.color || ''),
            name: String(r.student_name || ''), id: r.local_id,
            timeTaken: r.time_taken || 0,
            // F5: round-trip grade. See note at line ~482.
            grade: r.grade || null,
            answers: Array.isArray(r.answers) ? r.answers : [],
            date: String(r.date_str || ''), time: String(r.time_str || ''),
            quit: !!r.quit, abandoned: !!r.abandoned
          };
        });
      if (incoming.length) {
        SCORES.push.apply(SCORES, incoming);
        SCORES.sort(function(a, b) { return b.id - a.id; });
        if (SCORES.length > 200) SCORES.length = 200;
        saveSc();
        changed = true;
      }
    }

    // Apply unlock settings from cloud (parent is authoritative)
    if (data.profile && data.profile.unlock_settings) {
      localStorage.setItem('wb_unlock_' + studentId, JSON.stringify(data.profile.unlock_settings));
    }
    if (data.profile && data.profile.a11y_json) {
      localStorage.setItem('wb_a11y_' + studentId, JSON.stringify(data.profile.a11y_json));
    }

    // Rebuild home to reflect the newly-loaded progress
    if (changed && typeof buildHome === 'function') buildHome();

    // Push merged state back to cloud so both sides converge
    triggerCloudSync();
  } catch(e) {
    if (!_handleSessionExpiry(e)) { /* offline — progress stays as-is */ }
  }
}

let _syncing = false; // prevents monkey-patched saves from pushing during _pullOnLogin merge
let _pullSucceeded = false; // set true after a successful cloud pull; gates overwrite-style pushes
async function _pullOnLogin(force){
  if(!_supa || !_supaUser) return;
  _syncing = true;
  try{
  // Skip sync if we already pulled within the last 5 minutes (handles page refreshes
  // and brief re-opens without hammering Supabase on every session restore).
  const _syncKey = 'wb_last_sync_' + _supaUser.id;
  const _lastSync = parseInt(localStorage.getItem(_syncKey) || '0');
  if(!force && Date.now() - _lastSync < 5 * 60 * 1000) return;
  try{
    // Clear stale/guest local DONE before merging cloud data — prevents guest progress
    // from being pushed to the parent's cloud account on first login on a shared device.
    Object.keys(DONE).forEach(function(k){ delete DONE[k]; });
    localStorage.setItem('wb_done5', JSON.stringify(DONE));
    // Single RPC call replaces 3 separate queries — 1 round trip instead of 3.
    // Pass active student_id so cloud returns per-student progress (not shared parent row)
    const _timeout = new Promise((_,rej) => setTimeout(() => rej(new Error('pull_timeout')), 5000));
    const _activeStudId = localStorage.getItem('mmr_active_student_id') || null;
    const { data: syncData, error: rpcErr } = await Promise.race([
      _supa.rpc('get_user_sync_data', _activeStudId
        ? { p_student_id: _activeStudId, p_grade: localStorage.getItem('mmr_grade') || '2' }
        : { p_grade: localStorage.getItem('mmr_grade') || '2' }),
      _timeout
    ]);
    if(rpcErr) throw rpcErr;
    const prog         = syncData?.progress   || null;
    const remoteScores = syncData?.scores      || [];
    const profile      = syncData?.profile     || null;
    localStorage.setItem(_syncKey, String(Date.now()));
    // ── Conflict resolution strategy ──────────────────────────────
    // localStorage is the source of truth for the current session.
    // On login we merge cloud data INTO local, then push local back
    // to cloud so both sides converge.
    //
    //   DONE   – union merge: Object.assign(local, cloud) keeps every
    //            key from both sides. Cloud overwrites matching keys;
    //            local-only keys survive. _pushDone() then sends the
    //            merged result back so cloud gains any offline work.
    //
    //   SCORES – append-only: remote scores whose local_id is missing
    //            locally get appended. Local scores are never removed
    //            or overwritten. _pushScores() uploads any local-only
    //            scores the server hasn't seen yet.
    //
    //   STREAK – last-writer-wins by date: server values are adopted
    //            when its last_activity_date >= local. longest_streak
    //            uses Math.max() so it can never decrease.
    // ───────────────────────────────────────────────────────────────

    // DONE — union merge (cloud into local, then push back)
    // Validate: must be a plain object with string keys and boolean-ish values
    if(prog && prog.done_json && typeof prog.done_json === 'object' && !Array.isArray(prog.done_json)){
      const safe = {};
      for(const [k,v] of Object.entries(prog.done_json)){
        if(typeof k === 'string' && k.length < 100 && k !== '__proto__' && k !== 'constructor' && k !== 'prototype') safe[k] = !!v;
      }
      Object.assign(DONE, safe);
      localStorage.setItem('wb_done5', JSON.stringify(DONE));
    }
    // SCORES — append-only dedup by local_id (both sides preserved)
    // Validate: each score must have required fields with correct types
    if(Array.isArray(remoteScores) && remoteScores.length){
      const localIds = new Set(SCORES.map(s => s.id));
      const incoming = remoteScores
        .filter(r => r && typeof r.local_id === 'number' && typeof r.qid === 'string'
          && typeof r.score === 'number' && typeof r.total === 'number'
          && typeof r.pct === 'number' && r.pct >= 0 && r.pct <= 100
          && !localIds.has(r.local_id))
        .map(r => ({
          qid:r.qid, label:String(r.label||''), type:String(r.type||''),
          score:r.score, total:r.total, pct:r.pct, stars:String(r.stars||''),
          unitIdx:typeof r.unit_idx==='number'?r.unit_idx:0, color:String(r.color||''),
          name:String(r.student_name||''), id:r.local_id,
          timeTaken: r.time_taken || 0,
          // F5: round-trip grade. See note at line ~482.
          grade: r.grade || null,
          answers:Array.isArray(r.answers)?r.answers:[],
          date:String(r.date_str||''), time:String(r.time_str||''),
          quit:!!r.quit, abandoned:!!r.abandoned
        }));
      SCORES.push(...incoming);
      SCORES.sort((a,b) => b.id - a.id);
      if(SCORES.length > 200) SCORES.length = 200;
      localStorage.setItem('wb_sc5', JSON.stringify(SCORES));
    }
    // STREAK — last-writer-wins by date, longest never decreases
    // Validate: streak fields must be numbers, date must be string
    if(profile && typeof profile.current_streak === 'number' && profile.current_streak >= 0){
      const serverDate = typeof profile.last_activity_date === 'string' ? profile.last_activity_date : '';
      const serverLongest = typeof profile.longest_streak === 'number' ? profile.longest_streak : 0;
      if(!STREAK.lastDate || serverDate >= STREAK.lastDate){
        STREAK.current = profile.current_streak;
        STREAK.longest = Math.max(serverLongest, STREAK.longest);
        STREAK.lastDate = serverDate || STREAK.lastDate;
        localStorage.setItem('wb_streak', JSON.stringify(STREAK));
      }
    }
    // MASTERY — per-key merge → mmr_mastery_v1_<grade> (per-grade canonical
    // key; higher attempts wins). Parent-mode pull mirrors the row that
    // matches the active grade, so the local bucket stays in sync.
    if(prog && prog.mastery_json && typeof prog.mastery_json === 'object'){
      try{
        const _gPull2 = (typeof normalizeGrade === 'function')
          ? normalizeGrade(localStorage.getItem('mmr_grade'))
          : (localStorage.getItem('mmr_grade') || '2');
        const _pullKey2 = 'mmr_mastery_v1_' + _gPull2;
        let localAgg = JSON.parse(localStorage.getItem(_pullKey2) || '{}');
        let masteryChanged = false;
        for(const [k, cm] of Object.entries(prog.mastery_json)){
          if(!cm || typeof cm.attempts !== 'number') continue;
          const lm = localAgg[k];
          if(!lm || cm.attempts > lm.attempts || (cm.attempts === lm.attempts && (cm.correct||0) > (lm.correct||0))){
            localAgg[k] = { attempts:cm.attempts, correct:cm.correct||0, lastSeen:cm.lastSeen||0 };
            masteryChanged = true;
          }
        }
        if(masteryChanged) localStorage.setItem(_pullKey2, JSON.stringify(localAgg));
      } catch(_me){}
    }
    // ACTIVITY — union merge → mmr_activity_v1
    if(prog && prog.activity_json && prog.activity_json.v === 1 && Array.isArray(prog.activity_json.events)){
      try{
        const localActDoc = JSON.parse(localStorage.getItem('mmr_activity_v1') || 'null');
        const localEvts = (localActDoc && localActDoc.v === 1 && Array.isArray(localActDoc.events)) ? localActDoc.events : [];
        const mergedDoc = _mergeActivityEvents(localEvts, prog.activity_json.events);
        localStorage.setItem('mmr_activity_v1', JSON.stringify(mergedDoc));
      } catch(_ae){}
    }

    // APP_TIME — take max totalSecs/sessions; merge dailySecs by max per day
    if(prog && prog.apptime_json && typeof prog.apptime_json === 'object' && typeof APP_TIME !== 'undefined'){
      const ct = prog.apptime_json;
      let appChanged = false;
      if(typeof ct.totalSecs === 'number' && ct.totalSecs > (APP_TIME.totalSecs||0)){
        APP_TIME.totalSecs = ct.totalSecs; appChanged = true;
      }
      if(typeof ct.sessions === 'number' && ct.sessions > (APP_TIME.sessions||0)){
        APP_TIME.sessions = ct.sessions; appChanged = true;
      }
      if(ct.dailySecs && typeof ct.dailySecs === 'object'){
        APP_TIME.dailySecs = APP_TIME.dailySecs || {};
        for(const [d, s] of Object.entries(ct.dailySecs)){
          if(typeof s === 'number' && s > (APP_TIME.dailySecs[d]||0)){
            APP_TIME.dailySecs[d] = s; appChanged = true;
          }
        }
      }
      if(appChanged && typeof saveAppTime === 'function') saveAppTime();
    }

    // Push local-only data back to cloud so both sides converge
    _pullSucceeded = true;
    _syncing = false;
    if(_isStudentSession()){
      triggerCloudSync();
    } else {
      _triggerParentSync();
    }
    updateSyncLabel();
    buildHome();
    await _lsCheckOnboarding();
  } catch(e){ console.warn('[Supabase] pull error', e); } finally { _syncing = false; }
  } finally { _syncing = false; }
}

// ── Unified push pipeline (student sessions) ────────────────────────────
// All local state is sent in a single push_student_progress RPC call.
// Debounced at 500ms so rapid saves (quiz finish = done + mastery + apptime + score)
// coalesce into one network call.
let _pushInFlight = false;
let _pushPending  = false;
let _pushTimer    = null;

let _parentPushTimer = null; // debounce timer for parent push pipeline

function triggerCloudSync(){
  if(!_supa || !_isStudentSession()) return;
  if(_pushTimer) clearTimeout(_pushTimer);
  _pushTimer = setTimeout(_pushAll, 500);
}

function _triggerParentSync(){
  if(!_supa || !_supaUser || _isStudentSession()) return;
  if(_parentPushTimer) clearTimeout(_parentPushTimer);
  _parentPushTimer = setTimeout(_pushAllParent, 500);
}

async function _pushAllParent(){
  _parentPushTimer = null;
  if(!_supa || !_supaUser || _isStudentSession()) return;
  await Promise.all([
    _pushDoneParent(),
    _pushMasteryParent(),
    _pushActivityParent(),
    _pushScores(),
    _pushAppTimeParent(),
  ]);
}

// Classify a Supabase rpc() push result so a rejection is never silently
// swallowed. Mirrors tests/sync-helpers.js _classifyPushResult.
function _classifyPushResult(result){
  if(!result || result.error) return 'transport_error';
  var d = result.data;
  if(d && d.error === 'stale_reset_epoch') return 'stale_reset_epoch';
  if(d && d.error === 'validation_failed') return 'validation_failed';
  if(d && d.error) return 'rejected';
  return 'ok';
}

// Map an in-memory score to the quiz_scores payload. Preserves the stored pct
// INCLUDING any hint penalty — it must NOT be recomputed, or the cloud copy
// would disagree with what the student saw.
function _scoreToCloudRow(s){
  return {
    local_id: s.id, qid: s.qid || '', label: s.label || '', type: s.type || '',
    score: s.score || 0, total: s.total || 0,
    pct: (typeof s.pct === 'number') ? s.pct : 0,
    stars: s.stars || '', unit_idx: (s.unitIdx == null ? 0 : s.unitIdx), color: s.color || '',
    student_name: s.name || '', time_taken: s.timeTaken || 0,
    grade: s.grade || null,
    answers: s.answers || [], date_str: s.date || '', time_str: s.time || '',
    quit: !!s.quit, abandoned: !!s.abandoned
  };
}

// One-shot retry for transient score-push failures (network / timeout / a
// not-yet-applied migration). Coalesces so repeated failures don't pile up.
var _scoreRetryTimer = null;
function _scheduleScoreRetry(){
  if(_scoreRetryTimer) return;
  _scoreRetryTimer = setTimeout(function(){ _scoreRetryTimer = null; _pushStudentScores(); }, 5000);
}

// Decoupled score sync for student (PIN) sessions. Uses the lenient
// push_quiz_scores RPC — no monotonic profile guards, no pct==score/total
// check — so a completed quiz score saves even when the profile-progress push
// is rejected, and a hint-penalized score still reaches quiz_scores (the table
// the parent dashboard reads). Idempotent server-side (by student_id+local_id).
async function _pushStudentScores(){
  if(!_supa || !_isStudentSession() || !SCORES.length) return;
  var studentId = localStorage.getItem('mmr_active_student_id');
  if(!studentId || !_sessionToken) return;
  try{
    var result = await Promise.race([
      _supa.rpc('push_quiz_scores', {
        p_student_id:    studentId,
        p_session_token: _sessionToken,
        p_scores:        SCORES.map(_scoreToCloudRow)
      }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('push_quiz_scores timeout')); }, 10000); })
    ]);
    var cat = _classifyPushResult(result);
    if(cat === 'transport_error'){
      if(result && result.error && _handleSessionExpiry(result.error)) return;
      // Also covers "function not found" if the migration is not applied yet:
      // log + retry, never crash, never lose the score (it stays in localStorage).
      console.error('[Supabase] push_quiz_scores transport error — will retry', result && result.error);
      _scheduleScoreRetry();
    } else if(cat !== 'ok'){
      console.error('[Supabase] push_quiz_scores rejected:', result.data && result.data.error, result.data && result.data.details);
    }
  } catch(e){
    if(_handleSessionExpiry(e)) return;
    console.error('[Supabase] push_quiz_scores error — will retry', e);
    _scheduleScoreRetry();
  }
}

async function _pushAll(){
  _pushTimer = null;
  if(!_supa || !_isStudentSession()) return;
  if(_pushInFlight){ _pushPending = true; return; }
  _pushInFlight = true;
  try{
    var studentId = localStorage.getItem('mmr_active_student_id');
    // Cross-device reset guard: forward the last-known server reset
    // epoch on every push. The server rejects with `stale_reset_epoch`
    // if it has been bumped past this value, which we catch below.
    var _localResetEpoch = (typeof _dbReadLocalResetEpoch === 'function')
      ? _dbReadLocalResetEpoch(studentId)
      : 0;
    var result = await Promise.race([
      _supa.rpc('push_student_progress', {
        p_student_id:       studentId,
        p_grade:            (typeof normalizeGrade === 'function') ? normalizeGrade(localStorage.getItem('mmr_grade')) : (localStorage.getItem('mmr_grade') || '2'),
        p_session_token:    _sessionToken,
        p_reset_epoch:      _localResetEpoch,
        p_mastery_json:     (function(){
          try{
            var _g = (typeof normalizeGrade === 'function') ? normalizeGrade(localStorage.getItem('mmr_grade')) : (localStorage.getItem('mmr_grade') || '2');
            return JSON.parse(localStorage.getItem('mmr_mastery_v1_' + _g) || '{}');
          } catch(_){ return {}; }
        })(),
        p_activity_json:    (function(){ try{ var d=JSON.parse(localStorage.getItem('mmr_activity_v1')||'null'); return (d&&d.v===1)?d:{v:1,events:[]}; }catch(_){ return {v:1,events:[]}; } })(),
        p_streak_current:   STREAK.current || 0,
        p_streak_longest:   STREAK.longest || 0,
        p_streak_last_date: STREAK.lastDate || '',
        p_apptime_json:     (typeof APP_TIME !== 'undefined') ? APP_TIME : {},
        p_done_json:        DONE,
        p_act_dates_json:   safeLoad('wb_act_dates', []),
        p_settings_json:    safeLoad('wb_settings', {}),
        p_a11y_json:        safeLoad('wb_a11y', {}),
        // Quiz scores are DECOUPLED: they sync via the dedicated, lenient
        // push_quiz_scores RPC (see _pushStudentScores). Bundling them here
        // made the push atomic — one guard-rejected score (e.g. a legitimate
        // hint-penalized pct) or a regressed profile field rejected the WHOLE
        // payload, so scores never reached quiz_scores. Sending [] keeps this
        // RPC focused on mastery/done/apptime/streak.
        p_scores:           []
      }),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('pushAll timeout')); }, 12000); })
    ]);
    // Classify the profile-progress push result. NEVER silently swallow a
    // rejection — every non-ok outcome is logged. Quiz scores are unaffected by
    // a profile rejection because they sync separately via _pushStudentScores().
    var _cat = _classifyPushResult(result);
    if (_cat === 'transport_error') {
      if (_handleSessionExpiry(result.error)) return; // token dead — skip score push too
      console.error('[Supabase] pushAll (profile progress) transport error', result.error);
    } else if (_cat === 'stale_reset_epoch') {
      // Server says our payload predates the latest reset_student_data.
      // Clear local progress + adopt the server's epoch so future pushes
      // line up. The next pull will re-populate from the (empty) server
      // state. Do NOT retry — the same stale data would just be rejected again.
      var _serverEpoch = Number(result.data.server_reset_epoch) || 0;
      console.warn('[Supabase] pushAll rejected as stale_reset_epoch — clearing local progress and adopting server epoch', _serverEpoch);
      if (typeof _dbApplyServerResetEpoch === 'function') {
        _dbApplyServerResetEpoch(studentId, _serverEpoch);
      }
      _pushPending = false; // Suppress the auto-retry; we just wiped local state.
      if (typeof buildHome === 'function') {
        try { buildHome(); } catch (_e) {}
      }
    } else if (_cat === 'validation_failed' || _cat === 'rejected') {
      // A monotonic guard rejected the profile payload (e.g. local apptime/
      // mastery/done regressed below the server baseline after a cache clear).
      // Surface it — do not swallow. Scores still sync below, decoupled.
      console.error('[Supabase] pushAll (profile progress) rejected — quiz scores sync separately via push_quiz_scores:',
        result.data && result.data.error, result.data && result.data.details);
    }
    // Always sync quiz scores on their own decoupled, lenient path so a
    // rejected profile push never blocks a completed quiz score from saving.
    await _pushStudentScores();
  } catch(e){
    if(!_handleSessionExpiry(e)) console.error('[Supabase] pushAll error', e);
  } finally {
    _pushInFlight = false;
    if(_pushPending){ _pushPending = false; triggerCloudSync(); }
  }
}

// ── Tier 1 cross-device resume sync ────────────────────────────────────
// Refresh linked-student state when the device wakes up. The dashboard
// previously read only the local cache populated at login, so a second
// device kept showing stale lesson counts and a "resume" prompt for
// quizzes that the first device had already finished.
//
// Triggered on visibilitychange→visible, focus, online, pageshow. Only
// runs for valid family-code student sessions (not parents, not guest
// mode). Throttled to one full push→pull every 10 s so a flurry of
// foreground events doesn't hammer the RPC.
var _lastResumeSyncAt = 0;
var _RESUME_SYNC_THROTTLE_MS = 10000;

// Pure helper — exported on window for tests.
function _shouldRunResumeSync(now, lastTime, throttleMs) {
  if (typeof now !== 'number' || typeof throttleMs !== 'number') return false;
  if (!lastTime) return true;
  return (now - lastTime) >= throttleMs;
}

async function _resumeSyncIfStudent(reason) {
  try {
    if (!_supa || !_isStudentSession()) return;
    var studentId = localStorage.getItem('mmr_active_student_id');
    if (!studentId || studentId === 'local' || !_sessionToken) return;
    var _now = Date.now();
    if (!_shouldRunResumeSync(_now, _lastResumeSyncAt, _RESUME_SYNC_THROTTLE_MS)) return;
    _lastResumeSyncAt = _now;
    // Push first so any unflushed local writes land on the server before
    // we overwrite local with the pull result. _pushAll coalesces if a
    // push is already in flight.
    try { await _pushAll(); } catch (_pe) {}
    try { await _pullStudentProgress(studentId); } catch (_pe) {}
    // Refresh visible UI so unit cards / paused indicator pick up the
    // freshly-pulled state. Guarded — buildHome lives in home.js.
    try { if (typeof buildHome === 'function') buildHome(); } catch (_be) {}
  } catch (_e) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[sync] resume sync failed', reason, _e);
    }
  }
}

// Expose for testability + manual debugging.
if (typeof window !== 'undefined') {
  window._resumeSyncIfStudent = _resumeSyncIfStudent;
  window._shouldRunResumeSync = _shouldRunResumeSync;
}

(function _attachResumeSyncListeners() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') _resumeSyncIfStudent('visibilitychange');
  });
  window.addEventListener('focus', function () { _resumeSyncIfStudent('focus'); });
  window.addEventListener('online', function () { _resumeSyncIfStudent('online'); });
  window.addEventListener('pageshow', function (e) {
    // pageshow fires on initial load too; only sync on BFCache restore or
    // when we're already past the login screen (a student session exists).
    if (e && e.persisted) _resumeSyncIfStudent('pageshow-bfcache');
  });
})();

// ── Parent-path push functions (authenticated via Supabase Auth, no session token) ──
async function _pushDoneParent(){
  if(!_supa || !_supaUser) return;
  if(!_pullSucceeded) return; // don't overwrite cloud until local is confirmed current
  try{
    var _sid = localStorage.getItem('mmr_active_student_id') || null;
    await Promise.race([
      _supa.from('student_progress').upsert(
        { user_id:_supaUser.id, student_id:_sid, grade:localStorage.getItem('mmr_grade')||'2', done_json:DONE, updated_at:new Date().toISOString() },
        { onConflict:'user_id,student_id,grade' }
      ),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('pushDone timeout')); },8000); })
    ]);
  } catch(e){ console.warn('[Supabase] pushDone error', e); }
}

async function _pushMasteryParent(){
  if(!_supa || !_supaUser) return;
  if(!_pullSucceeded) return; // don't overwrite cloud until local is confirmed current
  try{
    var _gPush = (typeof normalizeGrade === 'function') ? normalizeGrade(localStorage.getItem('mmr_grade')) : (localStorage.getItem('mmr_grade') || '2');
    var mastery = (function(){ try{ return JSON.parse(localStorage.getItem('mmr_mastery_v1_' + _gPush)||'{}'); }catch(_){ return {}; } })();
    var _sid = localStorage.getItem('mmr_active_student_id') || null;
    await Promise.race([
      _supa.from('student_progress').upsert(
        { user_id:_supaUser.id, student_id:_sid, grade:_gPush, mastery_json:mastery, updated_at:new Date().toISOString() },
        { onConflict:'user_id,student_id,grade' }
      ),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('pushMastery timeout')); },8000); })
    ]);
  } catch(e){ console.warn('[Supabase] pushMastery error', e); }
}

async function _pushActivityParent(){
  if(!_supa || !_supaUser) return;
  if(!_pullSucceeded) return;
  try{
    var activity = (function(){ try{ var d=JSON.parse(localStorage.getItem('mmr_activity_v1')||'null'); return (d&&d.v===1)?d:{v:1,events:[]}; }catch(_){ return {v:1,events:[]}; } })();
    var _sid = localStorage.getItem('mmr_active_student_id') || null;
    await Promise.race([
      _supa.from('student_progress').upsert(
        { user_id:_supaUser.id, student_id:_sid, grade:localStorage.getItem('mmr_grade')||'2',
          activity_json:activity, updated_at:new Date().toISOString() },
        { onConflict:'user_id,student_id,grade' }
      ),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('pushActivity timeout')); },8000); })
    ]);
  } catch(e){ console.warn('[Supabase] pushActivity error', e); }
}

async function _pushAppTimeParent(){
  if(!_supa || !_supaUser) return;
  try{
    var appTime = (typeof APP_TIME !== 'undefined') ? APP_TIME : {};
    var _sid = localStorage.getItem('mmr_active_student_id') || null;
    await Promise.race([
      _supa.from('student_progress').upsert(
        { user_id:_supaUser.id, student_id:_sid, grade:localStorage.getItem('mmr_grade')||'2', apptime_json:appTime, updated_at:new Date().toISOString() },
        { onConflict:'user_id,student_id,grade' }
      ),
      new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('pushAppTime timeout')); },8000); })
    ]);
  } catch(e){ console.warn('[Supabase] pushAppTime error', e); }
}

function _fireSvg(pfx, w, h){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 38" width="${w}" height="${h}" style="display:inline-block;vertical-align:middle"><defs><radialGradient id="${pfx}g" cx="50%" cy="95%" r="55%"><stop offset="0%" stop-color="#ffb300" stop-opacity=".7"/><stop offset="100%" stop-color="#ff6600" stop-opacity="0"/></radialGradient><linearGradient id="${pfx}o" x1="30%" y1="0%" x2="70%" y2="100%"><stop offset="0%" stop-color="#ff9500"/><stop offset="55%" stop-color="#ff5a00"/><stop offset="100%" stop-color="#e83200"/></linearGradient><linearGradient id="${pfx}m" x1="30%" y1="0%" x2="70%" y2="100%"><stop offset="0%" stop-color="#ffcd3c"/><stop offset="100%" stop-color="#ff8c00"/></linearGradient><linearGradient id="${pfx}i" x1="40%" y1="0%" x2="60%" y2="100%"><stop offset="0%" stop-color="#fffde7"/><stop offset="100%" stop-color="#ffe033"/></linearGradient></defs><ellipse cx="16" cy="36" rx="9" ry="2.5" fill="url(#${pfx}g)"/><path d="M16,36 C9,33 5,27 5,20 C5,13.5 8.5,8.5 12,5.5 C11,9.5 11.5,13 13.5,15.5 C12,10.5 14,3 16,0 C16,0 18,7.5 16.5,13 C19,10.5 19.5,7 19,4.5 C22.5,7.5 27,13.5 27,20 C27,27 23,33 16,36Z" fill="url(#${pfx}o)"/><path d="M16,32 C11,29.5 9,25.5 9,21.5 C9,17.5 11,14.5 13,12.5 C12.5,15.5 13,18 14.5,20 C14,16.5 14.5,13 16,11 C16,11 17.5,15 17,19 C18.5,17 19,14.5 18.5,12 C20.5,14 23,17.5 23,21.5 C23,25.5 21,29.5 16,32Z" fill="url(#${pfx}m)"/><path d="M16,28 C13.5,26 12.5,23.5 12.5,21 C12.5,18.5 14,16.5 15,15 C15,17 15.5,18.5 16,20.5 C16.5,18.5 17,17 16,15 C17.5,16.5 19.5,18.5 19.5,21 C19.5,23.5 18.5,26 16,28Z" fill="url(#${pfx}i)"/></svg>`;
}

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

function _renderCalBtn(){
  const btn = document.getElementById('cal-btn');
  if(!btn) return;
  var _calIsLoggedIn = !!_supaUser || localStorage.getItem('mmr_user_role') === 'student' || localStorage.getItem('mmr_user_role') === 'parent';
  if(!_calIsLoggedIn){ btn.style.display = 'none'; return; }
  // Only show calendar button on home screen
  const _curScreen = typeof ALL_SCREENS !== 'undefined' && ALL_SCREENS.find(s=>document.getElementById(s)?.classList.contains('on'));
  if(_curScreen !== 'home'){ btn.style.display = 'none'; return; }
  btn.style.display = 'flex';
  // Stack prof-btn below cal-btn if both are visible — use data, not DOM state
  const _calRole = localStorage.getItem('mmr_user_role');
  const _calProfs = (function(){ try{ return JSON.parse(localStorage.getItem('mmr_family_profiles')||'[]'); }catch(e){ return []; }})();
  const prof = document.getElementById('prof-btn');
  const profShouldStack = _calRole === 'student' && _calProfs.length >= 2;
  if(prof) prof.classList.toggle('prof-btn--stacked', profShouldStack);
  btn.classList.remove('cal-btn--stacked');
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

function _getMilestone(streak){
  if(streak >= 30) return { label: 'MATH LEGEND', gradient: 'linear-gradient(135deg,#ffd700,#ff8c00)' };
  if(streak >= 14) return { label: 'SUPER STUDENT', gradient: 'linear-gradient(135deg,#a29bfe,#6c5ce7)' };
  if(streak >= 7) return { label: 'WEEK WARRIOR', gradient: 'linear-gradient(135deg,#ff9500,#ff5a00)' };
  if(streak >= 3) return { label: 'GETTING STARTED', gradient: 'linear-gradient(135deg,#74b9ff,#0984e3)' };
  return null;
}

// ── STREAK CALENDAR ───────────────────────────────────────────────────────────
let _scDate = new Date();

let _scalSwipeX = 0, _scalSwipeY = 0, _scalDragging = false, _scalPeeked = false, _scalDir = 0, _scalSwipeT = 0;
function _openStreakCal(){
  _scDate = new Date();
  let modal = document.getElementById('scal-modal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'scal-modal';
    Object.assign(modal.style,{position:'fixed',inset:'0',zIndex:'9950' /* --z-calendar */,display:'none',alignItems:'center',justifyContent:'center',padding:'20px',background:'rgba(0,0,0,0.35)'});
    modal.addEventListener('click', e => {
      if(e.target !== modal) return;
      _closeStreakCal();
    });

    // iOS-style drag-to-swipe month navigation
    modal.addEventListener('touchstart', e => {
      _scalSwipeX = e.touches[0].clientX;
      _scalSwipeY = e.touches[0].clientY;
      _scalDragging = false; _scalPeeked = false; _scalDir = 0; _scalSwipeT = Date.now();
    }, {passive:true});

    modal.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - _scalSwipeX;
      const dy = e.touches[0].clientY - _scalSwipeY;
      if(!_scalDragging && Math.abs(dx) < 8) return;
      if(!_scalDragging && Math.abs(dy) > Math.abs(dx)) return; // vertical scroll — ignore
      _scalDragging = true;

      const n = new Date();
      const isCur = _scDate.getFullYear()===n.getFullYear() && _scDate.getMonth()===n.getMonth();
      const wantDir = dx > 0 ? -1 : 1; // right=prev, left=next
      if(wantDir === 1 && isCur) return; // can't go past current month

      // Build peek element once per gesture
      if(!_scalPeeked){
        _scalDir = wantDir; _scalPeeked = true;
        const peekDate = new Date(_scDate.getFullYear(), _scDate.getMonth() + _scalDir, 1);
        const vp = document.getElementById('scal-viewport');
        if(vp){
          let peek = document.getElementById('scal-peek');
          if(!peek){ peek = document.createElement('div'); peek.id = 'scal-peek'; peek.style.cssText = 'position:absolute;top:0;left:0;width:100%;will-change:transform'; vp.appendChild(peek); }
          peek.innerHTML = _buildCalGridHTML(peekDate);
          const vpW = vp.offsetWidth;
          peek.style.transition = 'none';
          peek.style.transform = `translateX(${_scalDir===1 ? vpW : -vpW}px)`;
        }
      }
      if(_scalDir === 0) return;

      const slide = document.getElementById('scal-slide');
      const vp = document.getElementById('scal-viewport');
      const peek = document.getElementById('scal-peek');
      if(!slide || !vp) return;
      const vpW = vp.offsetWidth;
      const moveDx = _scalDir===1 ? Math.min(0, dx) : Math.max(0, dx); // clamp to valid direction
      slide.style.transition = 'none';
      slide.style.transform = `translateX(${moveDx}px)`;
      if(peek){ peek.style.transition = 'none'; peek.style.transform = `translateX(${(_scalDir===1 ? vpW : -vpW) + moveDx}px)`; }
    }, {passive:true});

    modal.addEventListener('touchend', e => {
      if(!_scalDragging || _scalDir===0){ _scalDragging=false; return; }
      const dx = e.changedTouches[0].clientX - _scalSwipeX;
      const slide = document.getElementById('scal-slide');
      const vp = document.getElementById('scal-viewport');
      const peek = document.getElementById('scal-peek');
      _scalDragging = false;
      if(!slide || !vp) return;
      const vpW = vp.offsetWidth;
      const gestureMs = Math.max(1, Date.now() - _scalSwipeT);
      const velocity = Math.abs(dx) / gestureMs; // px/ms
      const isFastSwipe = velocity > 0.3 && Math.abs(dx) > 20;
      const committed = Math.abs(dx) >= vpW * 0.5 || isFastSwipe;
      const ease = 'cubic-bezier(0.4,0,0.2,1)';
      if(committed){
        slide.style.transition = `transform 0.25s ${ease}`;
        slide.style.transform = `translateX(${_scalDir===1 ? -vpW : vpW}px)`;
        if(peek){ peek.style.transition = `transform 0.25s ${ease}`; peek.style.transform = 'translateX(0)'; }
        const commitDir = _scalDir; _scalDir = 0;
        setTimeout(() => { _scDate = new Date(_scDate.getFullYear(), _scDate.getMonth()+commitDir, 1); _buildStreakCal(); var dp = document.getElementById('scal-day-panel'); if(dp) dp.innerHTML = ''; }, 250);
      } else {
        slide.style.transition = `transform 0.25s ${ease}`;
        slide.style.transform = 'translateX(0)';
        if(peek){
          peek.style.transition = `transform 0.25s ${ease}`;
          peek.style.transform = `translateX(${_scalDir===1 ? vpW : -vpW}px)`;
          setTimeout(() => { if(peek.parentNode) peek.parentNode.removeChild(peek); }, 250);
        }
        _scalDir = 0;
      }
    }, {passive:true});

    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  _lockScroll();
  history.pushState({mmrModal:'scal-modal'}, '');
  _buildStreakCal();
}

function _closeStreakCal(){
  _animateModalClose('scal-modal', ()=>{ const m=document.getElementById('scal-modal'); if(m) m.style.display='none'; _unlockScroll(); });
}

function _streakCalNav(dir){
  const slide = document.getElementById('scal-slide');
  const vp = document.getElementById('scal-viewport');
  if(!slide || !vp){ _scDate = new Date(_scDate.getFullYear(), _scDate.getMonth()+dir, 1); _buildStreakCal(); return; }
  const vpW = vp.offsetWidth;
  const ease = 'cubic-bezier(0.4,0,0.2,1)';
  slide.style.transition = `transform 0.28s ${ease}`;
  slide.style.transform = `translateX(${dir===1 ? -vpW : vpW}px)`;
  setTimeout(() => {
    _scDate = new Date(_scDate.getFullYear(), _scDate.getMonth()+dir, 1);
    _buildStreakCal();
    var dp = document.getElementById('scal-day-panel'); if(dp) dp.innerHTML = '';
    const newSlide = document.getElementById('scal-slide');
    if(newSlide){
      newSlide.style.transition = 'none';
      newSlide.style.transform = `translateX(${dir===1 ? vpW : -vpW}px)`;
      newSlide.offsetWidth; // force reflow
      newSlide.style.transition = `transform 0.28s ${ease}`;
      newSlide.style.transform = 'translateX(0)';
    }
  }, 280);
}

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
  for(let i=0;i<firstDow;i++) cells += '<div style="height:38px"></div>';

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

    const bL = (isAct&&prevConn) ? `<div style="position:absolute;left:0;width:50%;height:24px;top:50%;transform:translateY(-50%);background:${colL}"></div>` : '';
    const bR = (isAct&&nextConn) ? `<div style="position:absolute;right:0;width:50%;height:24px;top:50%;transform:translateY(-50%);background:${colL}"></div>` : '';
    const fw = (isAct||isToday) ? '700' : '400';
    const clickAttr = isAct ? `data-action="_showDayDetail" data-arg="${ds}" style="position:relative;display:flex;align-items:center;justify-content:center;height:38px;cursor:pointer"` : `style="position:relative;display:flex;align-items:center;justify-content:center;height:38px"`;
    cells += `<div ${clickAttr}>${bL}${bR}<div style="position:relative;z-index:1;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:${fw};color:${pipTxt};font-family:'Nunito',sans-serif;${pipBg}${pipEx}">${d}</div></div>`;
  }

  const totalCells = firstDow + daysInMo;
  const padEnd = 42 - totalCells;
  for(let i=0;i<padEnd;i++) cells += '<div style="height:38px"></div>';

  const hdrs = ['S','M','T','W','T','F','S'].map(x=>`<div style="text-align:center;font-size:12px;font-weight:700;color:var(--txt2,#999);padding-bottom:4px;font-family:'Nunito',sans-serif">${x}</div>`).join('');
  const prevBtn = `<button data-action="_streakCalNav" data-arg="-1" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--txt,#444);padding:2px 10px;line-height:1">&#8249;</button>`;
  const nextBtn = isCurMo
    ? `<button style="background:none;border:none;font-size:22px;cursor:default;color:var(--txt,#444);padding:2px 10px;line-height:1;opacity:.25">&#8250;</button>`
    : `<button data-action="_streakCalNav" data-arg="1" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--txt,#444);padding:2px 10px;line-height:1">&#8250;</button>`;
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      ${prevBtn}
      <span style="font-weight:700;font-size:15px;color:var(--txt,#333);font-family:'Nunito',sans-serif">${monthLabel}</span>
      ${nextBtn}
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr)">${hdrs}</div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr)">${cells}</div>`;
}

function _buildStreakCal(){
  const modal = document.getElementById('scal-modal');
  if(!modal) return;
  modal.dataset.calView = 'calendar';

  const FC = '#ff7700';
  const isDark = document.body.classList.contains('dark');
  const _bg = isDark
    ? 'background:#1c2e48;box-shadow:0 8px 40px rgba(0,0,0,.55)'
    : 'background:#fff;box-shadow:0 8px 40px rgba(0,0,0,.12)';
  const _bdr = isDark
    ? 'border:1.5px solid rgba(255,255,255,0.10)'
    : 'border:1.5px solid rgba(0,0,0,.06)';

  const ms = _getMilestone(STREAK.current);
  const msBadge = ms
    ? `<div style="margin-top:2px"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:8px;font-weight:800;letter-spacing:.4px;color:#fff;background:${ms.gradient}">${ms.label}</span></div>`
    : '';

  modal.innerHTML = `
  <div style="${_bg};${_bdr};backdrop-filter:blur(28px) saturate(160%) brightness(1.04);-webkit-backdrop-filter:blur(28px) saturate(160%) brightness(1.04);border-radius:24px;width:100%;max-width:400px;padding:16px 16px 20px">
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

// ── SOFT REGISTRATION GATE ───────────────────────────────────────────────────
function _checkSoftGate(type){
  if(_supaUser) return;
  if(type !== 'lesson') return;
  if(localStorage.getItem('wb_nudge_shown')) return;
  localStorage.setItem('wb_nudge_shown', '1');
  setTimeout(_showSignupNudge, 1200);
}

function _showSignupNudge(){
  const overlay = _makeNudgeOverlay('signup-nudge-modal', true);
  if(!overlay) return;
  const isDark = document.body.classList.contains('dark');
  const _bg = isDark
    ? 'background:#0d1e35;box-shadow:0 8px 40px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,0.08)'
    : 'background:linear-gradient(145deg,rgba(255,255,255,0.95) 0%,rgba(240,248,255,0.88) 100%);box-shadow:0 8px 40px rgba(60,120,200,0.18),0 2px 12px rgba(0,0,0,0.08),inset 0 1.5px 0 rgba(255,255,255,0.98)';
  overlay.innerHTML = `<div style="width:100%;max-width:360px;border-radius:24px;padding:28px 24px 22px;${_bg};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)">
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:2.4rem;margin-bottom:8px">🌟</div>
      <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-lg);color:var(--txt,#222);line-height:1.2">Save Your Progress!</div>
      <div style="font-size:var(--fs-sm);color:var(--txt2,#666);margin-top:10px;line-height:1.6">Create a free account to save your scores and unlock all features — it only takes 30 seconds!</div>
    </div>
    <button data-action="nudgeModalSignup"
      style="width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#4a90d9,#27ae60);color:#fff;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);cursor:pointer;margin-bottom:10px;letter-spacing:.3px;touch-action:manipulation">
      Create a Free Account →
    </button>
    <div style="text-align:center">
      <button data-action="nudgeModalDismiss"
        style="background:none;border:none;color:var(--txt2,#888);font-size:var(--fs-sm);cursor:pointer;text-decoration:underline;font-family:inherit;touch-action:manipulation">
        Maybe later
      </button>
    </div>
  </div>`;
}

// Creates a .nudge-overlay wrapper, appends to body, returns the element.
// If dismissable=true, clicking outside the inner card removes the overlay.
function _makeNudgeOverlay(id, dismissable){
  if(document.getElementById(id)) return null;
  const el = document.createElement('div');
  el.id = id;
  el.className = 'nudge-overlay';
  if(dismissable){
    el.addEventListener('click', function(e){ if(e.target === el) el.remove(); });
  }
  document.body.appendChild(el);
  return el;
}

function _showSoftGate(){
  if(document.getElementById('soft-gate-modal')) return;
  const isDark = document.body.classList.contains('dark');
  const _bg = isDark
    ? 'background:#0d1e35;box-shadow:0 8px 40px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,0.08)'
    : 'background:linear-gradient(145deg,rgba(255,255,255,0.95) 0%,rgba(240,248,255,0.88) 100%);box-shadow:0 8px 40px rgba(60,120,200,0.18),0 2px 12px rgba(0,0,0,0.08),inset 0 1.5px 0 rgba(255,255,255,0.98)';
  const overlay = _makeNudgeOverlay('soft-gate-modal', false);
  if(!overlay) return;
  overlay.innerHTML = `<div style="width:100%;max-width:360px;border-radius:24px;padding:28px 24px 22px;${_bg};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)">
    <div style="text-align:center;margin-bottom:22px">
      <div style="font-size:2.2rem;margin-bottom:8px">👋</div>
      <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-lg);color:var(--txt,#222);line-height:1.2">Welcome to My Math Roots!</div>
      <div style="font-size:var(--fs-sm);color:var(--txt2,#666);margin-top:8px;line-height:1.55">This app is designed for K–5 students.<br>A quick note for parents before you begin.</div>
    </div>
    <div style="margin-bottom:18px">
      <label id="sg-consent-label" style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:var(--fs-sm);color:var(--txt,#222);line-height:1.45;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(120,160,220,0.3);background:rgba(255,255,255,0.55)">
        <input type="checkbox" id="sg-consent" style="margin-top:2px;flex-shrink:0;width:17px;height:17px;cursor:pointer;accent-color:#ff6b00">
        <span>I am a parent or guardian of the child using this app</span>
      </label>
      <div style="margin-top:8px;font-size:var(--fs-xs);color:var(--txt2,#888);text-align:center;line-height:1.5">By continuing, you agree to our <a href="./privacy.html" target="_blank" rel="noopener" style="color:#3b82f6;text-decoration:underline">Privacy Policy</a> and <a href="./terms.html" target="_blank" rel="noopener" style="color:#3b82f6;text-decoration:underline">Terms of Service</a>.</div>
    </div>
    <div id="sg-msg" style="font-size:var(--fs-sm);color:#e74c3c;text-align:center;min-height:1.2rem;margin-bottom:8px"></div>
    <button data-action="_guestConsentContinue" style="width:100%;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ff6b00,#e05200);color:#fff;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);cursor:pointer;margin-bottom:10px;letter-spacing:.3px;touch-action:manipulation">Continue as Guest →</button>
    <button data-action="_softGateShowLogin" style="width:100%;padding:12px;border-radius:14px;border:2px solid #4a90d9;background:transparent;color:#4a90d9;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-base);cursor:pointer;margin-bottom:6px;touch-action:manipulation">Create a Free Account</button>
  </div>`;
}

function _guestConsentContinue(){
  const consentEl = document.getElementById('sg-consent');
  const consentLabel = document.getElementById('sg-consent-label');
  const msgEl = document.getElementById('sg-msg');
  if(!consentEl?.checked){
    if(consentLabel) consentLabel.style.borderColor = '#e74c3c';
    if(msgEl) msgEl.textContent = 'Please confirm you are a parent or guardian.';
    consentEl?.focus();
    return;
  }
  _proceedAsGuest();
}

async function _submitSoftGate(){
  const emailEl = document.getElementById('sg-email');
  const email = emailEl?.value?.trim();
  const grade = document.getElementById('sg-grade')?.value;
  const referral = document.getElementById('sg-referral')?.value;
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    emailEl.style.border = '1.5px solid #e74c3c';
    emailEl.placeholder = 'Please enter a valid email';
    emailEl.value = '';
    emailEl.focus();
    return;
  }
  // SEC-8: Require parental consent checkbox (COPPA)
  const consentEl = document.getElementById('sg-consent');
  const consentLabel = document.getElementById('sg-consent-label');
  if(!consentEl?.checked){
    if(consentLabel) consentLabel.style.borderColor = '#e74c3c';
    consentEl?.focus();
    return;
  }
  // SEC-9: Encrypt email before storing in localStorage
  const _leadDate = new Date().toISOString().slice(0,10);
  try{
    const emailEnc = await _encryptStr(email);
    localStorage.setItem('wb_lead', JSON.stringify({ emailEnc, grade, referral, date: _leadDate }));
  } catch {
    // Crypto unavailable — store metadata only, skip email
    localStorage.setItem('wb_lead', JSON.stringify({ grade, referral, date: _leadDate }));
  }
  localStorage.setItem('wb_gate_done', '1');
  // Direct anon insert into `leads` was the SS-4 attack surface (audit
  // 2026-05-22). Migration 20260612_leads_lockdown.sql revokes anon
  // INSERT on the table. Re-enabling lead capture post-launch requires
  // a Turnstile-gated Netlify function — see the migration's table
  // COMMENT for the re-enablement contract.
  const modal = document.getElementById('soft-gate-modal');
  if(modal){
    modal.querySelector('div').innerHTML = `<div style="text-align:center;padding:24px 8px">
      <div style="font-size:var(--fs-3xl);margin-bottom:12px">✅</div>
      <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-lg);color:var(--txt,#222);margin-bottom:8px">You're all set!</div>
      <div style="font-size:var(--fs-sm);color:var(--txt2,#666);line-height:1.55;margin-bottom:22px">Create a free account to sync progress<br>across devices and track your child's streak.</div>
      <button data-action="_softGateShowLogin" style="width:100%;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ff6b00,#e05200);color:#fff;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);cursor:pointer;margin-bottom:10px">Create free account →</button>
      <button data-action="_softGateClose" style="background:none;border:none;color:var(--txt2,#888);font-size:var(--fs-sm);cursor:pointer;text-decoration:underline;font-family:inherit">Continue without account</button>
    </div>`;
    setTimeout(()=>{ modal.remove(); }, 10000);
  }
}

function _skipSoftGate(){
  document.getElementById('soft-gate-modal')?.remove();
}
// ─────────────────────────────────────────────────────────────────────────────

async function _updateStreak(){
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if(STREAK.lastDate === today) return; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  STREAK.current = (STREAK.lastDate === yesterday) ? STREAK.current + 1 : 1;
  if(STREAK.current > STREAK.longest) STREAK.longest = STREAK.current;
  STREAK.lastDate = today;
  localStorage.setItem('wb_streak', JSON.stringify(STREAK));
  // Log this day for the calendar view (works for guests too)
  const actDates = safeLoad('wb_act_dates', []);
  if(!actDates.includes(today)){
    actDates.push(today);
    if(actDates.length > 365) actDates.shift();
    localStorage.setItem('wb_act_dates', JSON.stringify(actDates));
  }
  _renderCalBtn();
  // Supabase sync — signed-in users only
  if(!_supa || !_supaUser) return;
  try{
    await _supa.from('profiles').upsert(
      { id: _supaUser.id, current_streak: STREAK.current, longest_streak: STREAK.longest, last_activity_date: today },
      { onConflict: 'id' }
    );
  } catch(e){ console.warn('[Supabase] streak update error', e); }
}

async function _pushScores(){
  if(!_supa || !_supaUser || !SCORES.length) return;
  try{
    // Filter out entries with a _sig that doesn't verify. Entries without _sig pass through (backwards compat).
    const verifiedScores = SCORES.filter(s => !s._sig || _scoreValid(s));
    const _activeStudentId = localStorage.getItem('mmr_active_student_id') || null;
    const rows = verifiedScores.map(s => ({
      user_id:_supaUser.id, local_id:s.id,
      student_id: _activeStudentId,
      qid:s.qid||'', label:s.label||'', type:s.type||'',
      score:s.score||0, total:s.total||0, pct:s.pct||0,
      stars:s.stars||'', unit_idx:s.unitIdx??null, color:s.color||null,
      student_name:s.name||null, time_taken:s.timeTaken||null,
      // F5: include normalized grade band so grade-filtered quiz history
      // round-trips correctly through Supabase. Legacy in-memory scores
      // without the field push as NULL; the dashboard side falls back to
      // qid-pattern inference via _inferScoreGrade on read.
      grade: s.grade || null,
      answers:s.answers||[], date_str:s.date||null, time_str:s.time||null,
      quit:!!s.quit, abandoned:!!s.abandoned
    }));
    await Promise.race([
      _supa.from('quiz_scores').upsert(rows,
        { onConflict:'user_id,local_id', ignoreDuplicates:true }),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('pushScores timeout')),8000))
    ]);
  } catch(e){ console.warn('[Supabase] pushScores error', e); }
}

async function _cloudDeleteAllScores(){
  if(!_supa || !_supaUser) return;
  try{
    await Promise.race([
      (async()=>{
        await _supa.from('quiz_scores').delete().eq('user_id', _supaUser.id);
        await _supa.from('student_progress').upsert(
          { user_id:_supaUser.id, done_json:{}, updated_at:new Date().toISOString() },
          { onConflict:'user_id' }
        );
      })(),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('cloudDeleteAll timeout')),10000))
    ]);
  } catch(e){ console.warn('[Supabase] cloudDelete error', e); }
}

async function _cloudDeleteScore(localId){
  if(!_supa || !_supaUser) return;
  try{
    await Promise.race([
      _supa.from('quiz_scores').delete()
        .eq('user_id', _supaUser.id).eq('local_id', localId),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('cloudDeleteScore timeout')),8000))
    ]);
  } catch(e){ console.warn('[Supabase] cloudDeleteScore error', e); }
}

// Monkey-patch save functions to push to cloud on every local save.
// Student sessions use the unified push pipeline; parent sessions use individual pushes.
const _origSaveDone = saveDone;
saveDone = function(){ _origSaveDone(); if(!_syncing) _isStudentSession() ? triggerCloudSync() : _triggerParentSync(); };
const _origSaveSc = saveSc;
saveSc = function(){ _origSaveSc(); if(!_syncing) _isStudentSession() ? triggerCloudSync() : _triggerParentSync(); };
const _origSaveMastery = saveMastery;
saveMastery = function(){ _origSaveMastery(); if(!_syncing) _isStudentSession() ? triggerCloudSync() : _triggerParentSync(); };
const _origSaveAppTime = saveAppTime;
saveAppTime = function(){ _origSaveAppTime(); if(!_syncing) _isStudentSession() ? triggerCloudSync() : _triggerParentSync(); };

async function syncNow(){
  if(!_supa){ showLockToast('Not signed in.'); return; }
  showLockToast('Syncing…');
  if(_isStudentSession()){
    if(_pushTimer) clearTimeout(_pushTimer);
    await _pushAll();
  } else if(_supaUser){
    await _pushAllParent();
  }
  updateSyncLabel();
  showLockToast('Synced! ✅');
}

// ── AUTH UI ──────────────────────────────
function openAuthModal(){
  _switchAuthTab('login');
  document.getElementById('auth-email').value    = '';
  document.getElementById('auth-password').value = '';
  document.getElementById('auth-msg').textContent= '';
  // Reset title/subtitle to defaults (may have been set by a feature gate)
  const _titleEl = document.getElementById('auth-modal-title');
  if(_titleEl) _titleEl.textContent = 'Sign In';
  const _subEl = document.getElementById('auth-modal-sub');
  if(_subEl) _subEl.textContent = 'Save your progress across devices';
  document.getElementById('auth-modal').style.display = 'flex';
  setTimeout(()=>document.getElementById('auth-email').focus(), 120);
}

function closeAuthModal(){
  _animateModalClose('auth-modal', ()=>{ document.getElementById('auth-modal').style.display='none'; });
}

function _switchAuthTab(tab){
  const isSignup = tab === 'signup';
  document.getElementById('auth-tab-login').className  = 'auth-tab-btn ' + (isSignup?'idle':'active');
  document.getElementById('auth-tab-signup').className = 'auth-tab-btn ' + (isSignup?'active':'idle');
  document.getElementById('auth-name-row').style.display = isSignup ? 'block' : 'none';
  document.getElementById('auth-submit-btn').textContent = isSignup ? 'Create Account' : 'Sign In';
  document.getElementById('auth-modal').dataset.tab = tab;
  document.getElementById('auth-msg').textContent = '';
}

async function submitAuth(){
  if(!_supa || _authLoading) return;
  const tab      = document.getElementById('auth-modal').dataset.tab || 'login';
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const msgEl    = document.getElementById('auth-msg');
  msgEl.style.color = '#e74c3c';
  if(!_rateLimit('authModal', 5)){ msgEl.textContent='⚠️ Too many attempts. Please wait a moment.'; return; }
  if(!email || !password){ msgEl.textContent='⚠️ Please enter email and password.'; return; }
  if(!_validEmail(email)){ msgEl.textContent='⚠️ Please enter a valid email address.'; return; }
  if(password.length < 6){ msgEl.textContent='⚠️ Password must be at least 6 characters.'; return; }
  _authLoading = true;
  const btn = document.getElementById('auth-submit-btn');
  const origTxt = btn.textContent;
  btn.textContent = '…';
  msgEl.style.color = '#4a90d9';
  msgEl.textContent = tab==='signup' ? 'Creating account…' : 'Signing in…';
  try{
    let result;
    if(tab === 'signup'){
      // Signup is gated behind the main login screen (server-enforced cap +
      // Turnstile via signup-gate.js). The auth-modal does not host a
      // Turnstile widget, so we explicitly refuse signup here.
      msgEl.style.color = '#e74c3c';
      msgEl.textContent = '⚠️ Please create an account from the main sign-in screen.';
      btn.textContent = origTxt;
      _authLoading = false;
      return;
    } else {
      result = await _supa.auth.signInWithPassword({ email, password });
    }
    if(result.error){
      msgEl.style.color = '#e74c3c';
      msgEl.textContent = '⚠️ ' + _friendlyError(result.error);
    } else if(tab==='signup' && !result.data.session){
      msgEl.style.color = '#27ae60';
      msgEl.textContent = '✅ Check your email to confirm your account!';
    } else {
      closeAuthModal();
      showLockToast('Signed in! Syncing…');
    }
  } catch(e){
    _logError('submitAuth', e);
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '⚠️ ' + _friendlyError(e);
  } finally {
    _authLoading = false;
    btn.textContent = origTxt;
  }
}

// Surgical, synchronous cleanup of routing-relevant state. Used by sign-out
// so a force-close mid-signout cannot resurrect the session on next launch.
// Does NOT touch progress data, theme, tutorial flags, or other preferences —
// _clearUserData() handles the broader cleanup from the SIGNED_OUT handler.
function _clearAuthRouteState(reason){
  console.log('[MMR clear auth route state]', reason || '');
  try {
    localStorage.removeItem('mmr_user_role');
    localStorage.removeItem('mmr_active_student_id');
    localStorage.removeItem('mmr_last_student_id');
    localStorage.removeItem('mmr_resume_student_session');
    localStorage.removeItem('wb_guest_mode');
    // Family-code student session token. Without this, _hasValidStudentSession
    // would still return true after sign-out and incorrectly route the next
    // reopen to home instead of login.
    localStorage.removeItem('mmr_session_token');
    // Kill cached Supabase auth tokens (sb-<ref>-auth-token and PKCE verifier)
    // so a hung _supa.auth.signOut() can't resurrect the session on reopen.
    Object.keys(localStorage).forEach(function(k){
      if (/^sb-.*-auth-token/.test(k)) localStorage.removeItem(k);
    });
  } catch(_e) {}
  _supaUser = null;
  if (typeof _sessionToken !== 'undefined') _sessionToken = null;
}

function _clearUserData(){
  // ── Wipe in-memory state ──────────────────────────────────────
  SCORES.length = 0;
  Object.keys(DONE).forEach(k => delete DONE[k]);
  CUR.unitIdx = 0; CUR.lessonIdx = 0; CUR.quiz = null;
  _supaUser = null;
  _pullSucceeded = false;
  _carouselInited = false;
  // Clear parent session timer to prevent leaked interval
  if(typeof _parentTimerInterval !== 'undefined') clearInterval(_parentTimerInterval);
  // Stop unlock live-sync so it doesn't fire after sign-out
  _stopUnlockSync();

  // ── Wipe in-memory progress state ─────────────────────────────
  Object.keys(MASTERY).forEach(k => delete MASTERY[k]);
  STREAK.current = 0; STREAK.longest = 0; STREAK.lastDate = null;
  APP_TIME.totalSecs = 0; APP_TIME.sessions = 0;
  Object.keys(APP_TIME.dailySecs).forEach(k => delete APP_TIME.dailySecs[k]);

  // ── Wipe user-specific localStorage ──────────────────────────
  // Progress & scores — clear to prevent cross-family data leakage on shared devices.
  // Pull-on-login will repopulate from Supabase for the next user.
  localStorage.removeItem('wb_done5');
  localStorage.removeItem('wb_sc5');
  localStorage.removeItem('wb_mastery');
  localStorage.removeItem('wb_apptime');
  localStorage.removeItem('wb_streak');
  localStorage.removeItem('wb_act_dates');
  localStorage.removeItem('mmr_session_token');
  _sessionToken = null;
  // Paused quiz state
  localStorage.removeItem('wb_paused_quiz');
  // Parent-managed unlocks and PIN
  localStorage.removeItem('wb_unit_unlocks');
  localStorage.removeItem('wb_lesson_unlocks');
  localStorage.removeItem('wb_parent_pin');
  _parentSessionTs = 0;
  localStorage.removeItem('wb_parent_unlock');
  localStorage.removeItem('wb_pin_changed');
  // PIN brute-force lockout counters
  localStorage.removeItem(_PIN_FAIL_KEY);
  localStorage.removeItem(_PIN_FAIL_COUNT_KEY);
  // Legacy anonymous-tracking identifiers (removed for COPPA compliance)
  localStorage.removeItem('wb_device_id');
  localStorage.removeItem('wb_anon_tracked');
  localStorage.removeItem('mmr_family_profiles');
  localStorage.removeItem('mmr_active_student_id');
  localStorage.removeItem('mmr_last_student_id');
  localStorage.removeItem('mmr_user_role');
  localStorage.removeItem('mmr_resume_student_session');
  localStorage.removeItem('wb_guest_mode');
  localStorage.removeItem(_STU_FAIL_KEY);
  localStorage.removeItem(_STU_FAIL_COUNT);
  _lsFamilyProfiles = null;
  _lsSelectedStudentId = null;
  _lsPinBuffer = [];

  // Update UI to reflect logged-out state
  updateAccountUI();
}

async function supaSignOut(){
  if(!_supa) return;
  if(!confirm('Sign out? Your progress is saved to your account and will reload on next login.')) return;
  // Sync cleanup before async signOut — protects against force-close mid-signout.
  _clearAuthRouteState('supaSignOut');
  await _supa.auth.signOut();
  // _clearUserData() and show('login-screen') handled by SIGNED_OUT auth event
  showLockToast('Signed out.');
}

function updateAccountUI(){
  const _role = localStorage.getItem('mmr_user_role');
  const isRealAccount = !!(_supaUser && _supaUser.aud === 'authenticated');
  const isStudent = !isRealAccount && _role === 'student';
  // Always show the sign-in/out button wrap
  const signout = document.getElementById('signout-btn-wrap');
  if(signout) signout.style.display = 'block';
  // Dashboard button: visible for real accounts and student sessions
  const dashBtn = document.getElementById('parent-dash-btn');
  if(dashBtn){
    if(isRealAccount){
      dashBtn.style.display = '';
      dashBtn.textContent = 'Dashboard';
    } else if(isStudent){
      dashBtn.style.display = '';
      dashBtn.textContent = 'Switch to Dashboard';
    } else {
      dashBtn.style.display = 'none';
    }
  }
  // Auth button: Sign Out (red) for real accounts and students, Sign In (blue) for guests
  const signoutBtn = document.querySelector('#signout-btn-wrap [data-action="_signOut"], #signout-btn-wrap [data-action="_showLoginScreen"]');
  if(signoutBtn){
    if(isRealAccount || isStudent){
      signoutBtn.textContent = 'Sign Out';
      signoutBtn.dataset.action = '_signOut';
      signoutBtn.style.borderColor = '#e74c3c';
      signoutBtn.style.color = '#e74c3c';
    } else {
      signoutBtn.textContent = 'Sign In';
      signoutBtn.dataset.action = '_showLoginScreen';
      signoutBtn.style.borderColor = '#4a90d9';
      signoutBtn.style.color = '#4a90d9';
    }
  }
  // Change Password only for email/password Supabase accounts
  const pwWrap = document.getElementById('pc-change-pw-wrap');
  if(pwWrap){
    const isEmail = _supaUser?.app_metadata?.provider === 'email';
    pwWrap.style.display = isEmail ? 'block' : 'none';
  }
}

function _goParentDashboard(){
  if(_supaUser){
    show('dashboard-screen');
    _dbInit();
    _installHistoryGuard();
  } else {
    _showParentSignInGate();
  }
}

function _showParentSignInGate(){
  if(document.getElementById('parent-gate-modal')) return;
  var overlay = _makeNudgeOverlay('parent-gate-modal', true);
  if(!overlay) return;
  // Pre-position login carousel on parent slide (index 1) so if the
  // modal is dismissed and the user reaches the login screen it shows
  // the parent tab, not the student tab.
  if(typeof _lsCarouselGo === 'function') _lsCarouselGo(1);
  var isDark = document.body.classList.contains('dark');
  var _bg = isDark
    ? 'background:#0d1e35;box-shadow:0 8px 40px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,0.08)'
    : 'background:#fff;box-shadow:0 8px 40px rgba(60,120,200,0.18),0 2px 12px rgba(0,0,0,0.08)';
  overlay.innerHTML = '<div style="width:100%;max-width:360px;border-radius:24px;padding:28px 24px 22px;'+_bg+';backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)">'
    + '<div style="text-align:center;margin-bottom:22px">'
    +   '<div style="font-size:2.2rem;margin-bottom:8px">📊</div>'
    +   '<div style="font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-lg);color:var(--txt,#222);line-height:1.2">Parent Dashboard</div>'
    +   '<div style="font-size:var(--fs-sm);color:var(--txt2,#666);margin-top:8px;line-height:1.55">Sign in to view progress, manage locks,<br>and access parent controls.</div>'
    + '</div>'
    + '<div id="parent-gate-msg" style="font-size:var(--fs-sm);color:#e74c3c;text-align:center;min-height:1.2rem;margin-bottom:8px"></div>'
    + '<button data-action="_parentGateGoogle" style="width:100%;padding:13px;border-radius:14px;border:1.5px solid #ddd;background:#fff;color:#333;font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);cursor:pointer;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:10px;box-sizing:border-box">'
    +   '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>'
    +   ' Continue with Google'
    + '</button>'
    + '<div style="text-align:center;margin:4px 0 12px;font-size:var(--fs-sm);color:var(--txt2,#888)">— or sign in with email —</div>'
    + '<input id="parent-gate-email" type="email" inputmode="email" autocomplete="email" placeholder="Email address"'
    +   ' style="width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid #ddd;font-size:var(--fs-base);margin-bottom:10px;box-sizing:border-box;font-family:inherit;color:var(--txt,#222);background:var(--bg2,#f9f9f9)">'
    + '<input id="parent-gate-pw" type="password" autocomplete="current-password" placeholder="Password"'
    +   ' style="width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid #ddd;font-size:var(--fs-base);margin-bottom:14px;box-sizing:border-box;font-family:inherit;color:var(--txt,#222);background:var(--bg2,#f9f9f9)">'
    + '<button data-action="_parentGateEmailSignIn" style="width:100%;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#8e44ad,#6c3483);color:#fff;font-family:\'Boogaloo\',\'Arial Rounded MT Bold\',sans-serif;font-size:var(--fs-base);cursor:pointer;margin-bottom:10px;box-sizing:border-box">Sign In →</button>'
    + '<button data-action="_parentGateClose" style="width:100%;padding:10px;background:none;border:none;color:var(--txt2,#888);font-size:var(--fs-sm);cursor:pointer;text-decoration:underline;font-family:inherit">Cancel</button>'
    + '</div>';
}

async function _parentGateEmailSignIn(){
  var email = (document.getElementById('parent-gate-email') ? document.getElementById('parent-gate-email').value : '').trim();
  var pw    = document.getElementById('parent-gate-pw') ? document.getElementById('parent-gate-pw').value : '';
  var msg   = document.getElementById('parent-gate-msg');
  if(!email || !pw){ if(msg){ msg.style.color='#e74c3c'; msg.textContent='Please enter your email and password.'; } return; }
  if(!_supa){ if(msg){ msg.style.color='#e74c3c'; msg.textContent='Connection error. Please try again.'; } return; }
  if(msg){ msg.style.color='#4a90d9'; msg.textContent='Signing in\u2026'; }
  try{
    var res = await _supa.auth.signInWithPassword({ email: email, password: pw });
    if(res.error){
      if(msg){
        var _errMap = {
          'Invalid login credentials': 'Incorrect email or password.',
          'Email not confirmed': 'Please confirm your email before signing in.',
          'Too many requests': 'Too many attempts. Please wait a moment and try again.'
        };
        msg.style.color = '#e74c3c';
        msg.textContent = _errMap[res.error.message] || 'Sign in failed. Please check your details and try again.';
      }
      return;
    }
    localStorage.setItem('mmr_user_role', 'parent');
    var modal = document.getElementById('parent-gate-modal');
    if(modal) modal.remove();
    console.log('[MMR AUTH] parent-gate email sign-in success -> dashboard');
    show('dashboard-screen');
    if(typeof _dbInit === 'function') _dbInit();
    if(typeof _installHistoryGuard === 'function') _installHistoryGuard();
  } catch(e){
    if(msg){ msg.style.color='#e74c3c'; msg.textContent='Sign in failed. Please try again.'; }
  }
}

async function _parentGateGoogle(){
  if(!_supa) return;
  try{
    await _supa.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + '/' }
    });
  } catch(e){
    var msg = document.getElementById('parent-gate-msg');
    if(msg){ msg.style.color='#e74c3c'; msg.textContent='Google sign-in failed. Please try again.'; }
  }
}

function _parentGateClose(){
  var modal = document.getElementById('parent-gate-modal');
  if(modal) modal.remove();
}

async function _signOut(){
  const _soRole = localStorage.getItem('mmr_user_role');

  // (1) Sync cleanup of routing keys + Supabase auth tokens. Protects against
  //     force-close happening mid-signout — by the time the user reopens the
  //     PWA, no stale state can route them back into dashboard or student home.
  _clearAuthRouteState('explicit-signout');

  // (2) Show login immediately so UI matches the new state regardless of
  //     whether the async Supabase signOut completes.
  if (typeof show === 'function') show('login-screen');
  if (typeof _lsInitCarousel === 'function') { _lsInitCarousel(); _lsCarouselGo(0); }

  // (3) Student PIN session: no Supabase signOut needed.
  if (_soRole === 'student') return;

  // (4) Parent: best-effort async Supabase signOut. UI is already correct;
  //     SIGNED_OUT handler runs _clearUserData() for full progress wipe.
  if (!_supa) return;
  try {
    await _supa.auth.signOut();
  } catch (err) {
    console.warn('[MMR signOut] supabase signOut failed', err);
  }
}

function updateSyncLabel(){
  const el = document.getElementById('account-sync-lbl');
  if(el) el.textContent = 'Last synced: ' +
    new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
}

let CUR = { unitIdx:0, lessonIdx:0, quiz:null };
// quiz: { questions[], shuffled[], idx, score, answers[], id, label, type, returnTo }

// ── Grade switch helper ─────────────────────────────────────────────────────
var _gradeSwitching = false;

function _showGradeSwitchOverlay(newGrade){
  var label = newGrade === 'K' ? 'Kindergarten' : 'Grade ' + newGrade;
  var lbl = document.getElementById('gso-label');
  if(lbl) lbl.textContent = 'Switching to ' + label + '\u2026';
  var overlay = document.getElementById('grade-switch-overlay');
  if(overlay) overlay.classList.add('gso-active');
  // Store label so boot splash can echo it
  localStorage.setItem('wb_grade_switch_label', label);
}

async function switchGrade(newGrade){
  console.log('GRADE CLICKED:', newGrade);
  if(_gradeSwitching) return;
  var current = localStorage.getItem('mmr_grade') || '2';
  if(newGrade === current) return;
  // Last line of defense. This is the only writer of mmr_grade that a student
  // action can reach, so an unlaunched grade must not get past it even if a UI
  // guard is bypassed. Switching AWAY from an unlaunched grade stays allowed —
  // that is the recovery path off Grade 3.
  if(typeof isGradeLaunched === 'function' && !isGradeLaunched(newGrade)){
    console.warn('[grade] refused switch to unavailable grade:', newGrade);
    return;
  }
  _gradeSwitching = true;
  if(typeof _pushAll === 'function'){
    try{
      if(typeof _pushTimer !== 'undefined' && _pushTimer){ clearTimeout(_pushTimer); _pushTimer = null; }
      await Promise.race([
        _pushAll(),
        new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('switch push timeout')); }, 5000); })
      ]);
    } catch(e){ console.warn('[grade switch] push failed, proceeding anyway', e); }
  }
  _showGradeSwitchOverlay(newGrade);
  await new Promise(function(resolve){ setTimeout(resolve, 280); });
  localStorage.setItem('mmr_grade', newGrade);
  console.log('GRADE SAVED:', localStorage.getItem('mmr_grade'));
  var _sid = localStorage.getItem('mmr_active_student_id');
  if(_supaUser && _sid && localStorage.getItem('mmr_user_role') === 'student') {
    try {
      var _ng = (typeof normalizeGrade === 'function') ? normalizeGrade(newGrade) : newGrade;
      // Update per-profile cache so _dbResolveProfileGrade() returns new grade on restore
      localStorage.setItem('mmr_profile_grade_' + _sid, _ng);
      // Update mmr_family_profiles cache so enterStudentLearningSession doesn't revert grade
      try {
        var _fp = JSON.parse(localStorage.getItem('mmr_family_profiles') || '[]');
        var _pi = _fp.findIndex(function(p){ return p && p.id === _sid; });
        if(_pi !== -1){ _fp[_pi] = Object.assign({}, _fp[_pi], { grade: _ng }); localStorage.setItem('mmr_family_profiles', JSON.stringify(_fp)); }
      } catch(_e) {}
      // Signal INITIAL_SESSION to restore student learning view (not dashboard)
      localStorage.setItem('mmr_resume_student_session', '1');
      // Fire-and-forget Supabase persistence
      if(_supa){ _supa.from('profiles').update({ grade: _ng, updated_at: new Date().toISOString() }).eq('id', _sid).then(function(){}).catch(function(e){ console.warn('[grade switch] Supabase profile update failed', e); }); }
    } catch(_e) {}
  } else if(!_supaUser) {
    // Preserve guest mode across reload so boot.js fast-path fires
    localStorage.setItem('wb_guest_mode', '1');
  }
  try {
    var _newG = localStorage.getItem('mmr_grade');
    _trackEvent('grade_selected', { grade: _newG || null });
    _anaFlush(true);
  } catch (_) {}
  location.reload();
}
