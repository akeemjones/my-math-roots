// ════════════════════════════════════════
//  BOOT — Global scope collision detection (dev only)
// ════════════════════════════════════════

// All intentional global function/variable names declared across src/ files
const _APP_GLOBALS = [
  // data/shared.js
  'q','_ICO','UNITS_DATA','_unitLoadPromises','_mergeUnitData','_loadUnit',
  // data/shared_k.js
  '_UNITS_DATA_K','_kUnitLoadPromises','_mergeKUnitData','_loadKUnit','_applyKindergartenGrade',
  // data/shared_g1.js
  '_UNITS_DATA_G1','_g1UnitLoadPromises','_mergeG1UnitData','_loadG1Unit','_applyGrade1Grade',
  // data/shared_g3.js
  '_UNITS_DATA_G3','_g3UnitLoadPromises','_mergeG3UnitData','_loadG3Unit','_applyGrade3Grade',
  // data/g3/cbe.js
  '_G3_CBE_BANK','_g3CbeGateOpen',
  // data/g3/unit0_diagnostic.js
  '_G3_UNIT0_DIAGNOSTIC',
  // util.js

  '_sr','_shuffle','_sanitize','_escHtml','_formatAnswerForReview','_validEmail','_friendlyError','_rateLimit',
  '_appErrors','_logError','_pwStrength','_updatePwStrength','_lsLastSignupEmail','_lsResend',
  'PARENT_SESSION_MINS','_parentTimerInterval','_parentSessionTs',
  '_startParentSession','_updateParentTimerDisplay','_hashPin','_savePin','_verifyPin',
  '_getDeviceKey','_encryptStr','_decryptStr','_migrateEmailStorage',
  // state.js
  'DONE','SCORES','safeLoad','saveDone','saveSc','STREAK',
  'MASTERY','saveMastery','_qKey','_updateMastery',
  'APP_TIME','saveAppTime',
  // auth.js
  'SUPA_URL','SUPA_KEY','_supa','_supaUser','_authLoading',
  '_dismissSplash','_historyGuardInstalled','_installHistoryGuard','supabaseInit',
  '_continueAsGuest','_lsLoading','_oneTapReady','_oneTapNonce',
  '_oneTapRetries','_ONE_TAP_MAX_RETRIES','_initOneTap','_lsOAuth','_lsSwitchTab',
  '_lsForgotPassword','_lsTogglePw','_turnstileToken','_turnstileFailed',
  '_TURNSTILE_FAIL_MSG','_onTurnstileSuccess','_onTurnstileExpired','_onTurnstileError',
  '_resetTurnstile','_lsSubmit','_pullOnLogin','_pushDone',
  // Launch Gate
  '_launchStatus','_loadLaunchStatus','_applyLaunchStatusUI','_setWaitlistCopy',
  '_showWaitlistPanel','_lsJoinWaitlist','_waitlistViewedFired',
  '_trackWebsiteVisit',
  '_fireSvg','_showDayDetail','_renderCalBtn','_updateCalDot','_getMilestone','_toggleDayExpand','_scDate','_scalSwipeX','_openStreakCal',
  '_closeStreakCal','_streakCalNav','_buildStreakCal','_checkSoftGate','_showSoftGate',
  '_submitSoftGate','_skipSoftGate','_proceedAsGuest','_guestConsentContinue','_showSignupNudge',
  '_updateStreak','_pushScores','_cloudDeleteAllScores',
  '_cloudDeleteScore','_origSaveDone','_origSaveSc','_origSaveMastery','_origSaveAppTime',
  '_pushMastery','_pushAppTime','syncNow','openAuthModal',
  'closeAuthModal','_switchAuthTab','submitAuth','_clearUserData','supaSignOut',
  'updateAccountUI','_signOut','updateSyncLabel','CUR','switchGrade',
  // nav.js
  'ALL_SCREENS','show','isUnitUnlocked','isLessonUnlocked','isUnitQuizUnlocked',
  // home.js
  'CAR','buildHome','_carouselInited','initCarousel','carouselGoTo',
  '_skipNextHomeBuild','goHome','goHistory','showLockToast','toggleHeroGradePicker',
  // unit.js
  'openUnit','goUnit','playCarryAnim','play3dCarry','playBorrowAnim','renderEx',
  'refreshExamples','generateExamples','buildPQItem','morePractice','steps',
  'generatePractice','openLesson','_renderLesson','openKeyIdeaVisual','closeKeyIdeaVisual','_quizTimer','_quizSecsLeft','_quizStartedAt',
  // key-ideas.js
  '_resolveKeyIdeaSteps','_detectLessonTopic','_keyIdeaStepsFromPoints','_stepHeadingFromPoint','_sanitizeKeyIdeaPoint',
  '_normalizeStep','_extractFirstOpFromLesson','_KI_TOPIC_RULES','_KI_TOPIC_STEPS','_KI_BUILDERS',
  '_renderKeyIdeaModal','_renderStepVisual','_showKeyIdeaStep',
  '_KI_CURRENT_STEPS','_KI_CURRENT_IDX','_KI_CURRENT_LESSON','_KI_CURRENT_UNIT',
  '_makeUnitJumps','_makeSkipJumps',
  '_pausedSecsLeft','_startTimer','_clearTimer','_updateTimerDisplay','_timeUp',
  // quiz.js
  '_audioCtx','_getAudio','playSwooshBack','playSwooshForward','playTap',
  'playCorrect','playWrong','playPassQuiz','playConfettiBurst',
  'startLessonQuiz','startUnitQuiz','_getPausedAll','getPausedQuiz',
  '_savePausedQuiz','_clearPausedQuiz','resumeQuiz','_weightedSample','_runQuiz','_renderQ',
  '_pickAnswer','nextQ','prevQ','quitQuiz','retryQuiz','_finishQuiz','_pauseCurrentQuiz',
  'buildRevSection','toggleRS','restartQuiz','cancelRestart','showQuitConfirm',
  'cancelQuit','_scratchCtx','_scratchDrawing','_scratchColor','_scratchTool',
  '_scratchLastX','_scratchLastY','openScratchPad','closeScratchPad',
  '_initScratchCanvas','_bindScratchEvents','clearScratchPad','setScratchColor',
  'setScratchTool','confirmQuit','confirmRestart','afterResults','startFinalTest','confetti',
  // settings.js
  'A11Y_KEY','getA11y','applyA11y','_focusListenersOn','_a11yFocusIn','_a11yFocusOut',
  '_a11yClick','_applyFocusListeners','toggleA11y',
  'openProgressReport','closeProgressReport','openPrReview',
  'openAccessModal','closeAccessModal',
  '_accessConfirmType','_showAccessConfirm','_cancelAccessConfirm','_executeAccessConfirm',
  'openPinModal','closePinModal','openTimerModal','closeTimerModal',
  'openA11yModal','closeA11yModal','_syncA11yUI','setSound','toggleSound','toggleTheme','setTheme','applyStoredTheme',
  'APP_VERSION','TIMER_KEY','QUIZ_PAUSE_KEY','SOUND_KEY','isSoundEnabled',
  'LESSON_TIMER_KEY','UNIT_TIMER_KEY','FINAL_TIMER_KEY','PIN_CHANGED_KEY',
  'getLessonTimerSecs','getUnitTimerSecs','getFinalTimerSecs',
  'getLessonTimerMins','getUnitTimerMins','_timerSecsLbl','isTimerEnabled',
  'PARENT_PIN_KEY','PARENT_UNLOCK_KEY','UNIT_UNLOCK_KEY','LESSON_UNLOCK_KEY',
  'getUnitUnlocks','saveUnitUnlocks','isUnitIndividuallyUnlocked',
  'getLessonUnlocks','saveLessonUnlocks','isLessonIndividuallyUnlocked',
  'getPin','isParentUnlocked','_setParentSession','_clearParentSession',
  '_PIN_FAIL_KEY','_PIN_FAIL_COUNT_KEY','_PIN_LOCKOUT_SIG_KEY','_PIN_MAX_ATTEMPTS',
  '_authClosing','_authPinBlurHandler','_openParentAuth','_closeParentAuth',
  'goSettings','goSettingsBack','toggleGradePicker','pickGrade','_fpAnswer','_gen5thGradeProblem','_fpProblem','_fpBlurHandler',
  'openForgotPin','closeForgotPin','refreshForgotProblem','checkForgotAnswer',
  'showInstall','_upmUnitIdx','_upmMode','_upmCheck','_upmPoll','_startUpmPoll',
  '_stopUpmPoll','_upmBind','_lpmUnitIdx','_lpmLessonIdx',
  'openLessonPinUnlock','checkLessonPinUnlock','_upmBlurHandler',
  'openUnitPinUnlock','closeUnitPinModal','checkUnitPinUnlock',
  'switchInstallTab','closeInstall',
  // ui.js
  'histFilter','buildHistory','tile','setFilt','_scFiltered','renderScList',
  '_buildScReviewHtml','openScLightbox','closeScLightbox','delScore','clearAll',
  'makeVis','togglePQ','revealPQ','openCoinLightbox','closeCoinLightbox',
  // events.js
  // (all exports are block-scoped inside the IIFE — no globals registered)
  // boot.js
  '_APP_GLOBALS','_showUpdatedToast','_autoApplyUpdate',
  '_debugSafeArea','_enableSafeAreaDebug','_disableSafeAreaDebug','_openSaDebugPanel',
  '_recoverVisibleScreen',
];

if (location.hostname === 'localhost') {
  (function _checkGlobalCollisions() {
    const missing = [];
    for (const name of _APP_GLOBALS) {
      if (!(name in window)) missing.push(name);
    }
    if (missing.length) {
      console.warn('[DEV] Global scope check — missing globals:', missing);
    }
    console.info('[DEV] Global scope check: ' + _APP_GLOBALS.length + ' app globals registered. All present: ' + (missing.length === 0));
  })();
}

// ════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════

// ════════════════════════════════════════
//  SAFE-AREA DEBUG HELPERS  (build: safe-area-debug-v6.0.4)
//  Temporary helpers for diagnosing the iOS standalone bottom safe-area
//  layout. On the iPhone Home Screen PWA, tap the bottom-right corner 5
//  times quickly to open the in-app debug panel (no Mac/Web Inspector needed).
//  Or append ?safeDebug=1 to the URL to auto-open it.
//    window._openSaDebugPanel()      -- opens the in-app visual debug panel
//    window._enableSafeAreaDebug()   -- paints each layer a distinct color
//    window._debugSafeArea()         -- returns viewport / standalone / computed-style report
//    window._disableSafeAreaDebug()  -- removes color overlay
// ════════════════════════════════════════
var _SAFE_AREA_DEBUG_BUILD = 'safe-area-debug-v6.0.5';
var _SAFE_AREA_DEBUG_SW_CACHE = 'math-workbook-v6.0.5-debug';

function _enableSafeAreaDebug(){
  document.documentElement.classList.add('safe-area-debug');
  if(!document.getElementById('sa-debug-bar')){
    var bar = document.createElement('div');
    bar.id = 'sa-debug-bar';
    document.body.appendChild(bar);
  }
  console.log('[MMR SAFE-AREA] debug overlay ENABLED — call _debugSafeArea() for the report, _disableSafeAreaDebug() to remove.');
}
function _disableSafeAreaDebug(){
  document.documentElement.classList.remove('safe-area-debug');
  var bar = document.getElementById('sa-debug-bar');
  if(bar) bar.remove();
  console.log('[MMR SAFE-AREA] debug overlay DISABLED.');
}

// Probes whether the .safe-area-debug CSS rule actually shipped in the
// served HTML by toggling the class and reading the computed background.
// Returns true iff html.safe-area-debug paints rgb(255, 0, 0).
function _hasSafeAreaDebugCss(){
  var hadClass = document.documentElement.classList.contains('safe-area-debug');
  if(!hadClass) document.documentElement.classList.add('safe-area-debug');
  var bg = getComputedStyle(document.documentElement).backgroundColor;
  if(!hadClass) document.documentElement.classList.remove('safe-area-debug');
  return /rgba?\(\s*255\s*,\s*0\s*,\s*0/.test(bg);
}

function _debugSafeArea(){
  var probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:-9999px;'
    + 'padding-top:env(safe-area-inset-top,0px);'
    + 'padding-bottom:env(safe-area-inset-bottom,0px);'
    + 'padding-left:env(safe-area-inset-left,0px);'
    + 'padding-right:env(safe-area-inset-right,0px);';
  document.body.appendChild(probe);
  var pcs = getComputedStyle(probe);
  var insets = { top: pcs.paddingTop, bottom: pcs.paddingBottom, left: pcs.paddingLeft, right: pcs.paddingRight };
  document.body.removeChild(probe);

  function _rect(sel){
    var el = document.querySelector(sel);
    if(!el) return { selector: sel, found: false };
    var r = el.getBoundingClientRect();
    var s = getComputedStyle(el);
    return {
      selector: sel,
      found: true,
      rect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height },
      computed: {
        position:        s.position,
        top:             s.top,
        bottom:          s.bottom,
        left:            s.left,
        right:           s.right,
        width:           s.width,
        height:          s.height,
        minHeight:       s.minHeight,
        paddingTop:      s.paddingTop,
        paddingBottom:   s.paddingBottom,
        backgroundColor: s.backgroundColor,
        backgroundImage: s.backgroundImage,
        zIndex:          s.zIndex,
        overflow:        s.overflow
      }
    };
  }

  var activeScreen = document.querySelector('.sc.on');
  var activeId = activeScreen ? activeScreen.id : null;

  var htmlCS = getComputedStyle(document.documentElement);
  var bodyCS = getComputedStyle(document.body);

  var info = {
    // ── Build identity (proves the iPhone is on the new debug build) ──
    debugBuild:               _SAFE_AREA_DEBUG_BUILD,
    swExpectedCache:          _SAFE_AREA_DEBUG_SW_CACHE,
    safeAreaDebugCssPresent:  _hasSafeAreaDebugCss(),
    documentURL:              location.href,
    userAgent:                navigator.userAgent,

    // Viewport meta (proves the served value)
    viewportMeta: (function(){
      var m = document.querySelector('meta[name="viewport"]');
      return m ? m.content : '(MISSING)';
    })(),

    standalone: {
      navigatorStandalone: !!window.navigator.standalone,
      mmStandalone:        window.matchMedia && window.matchMedia('(display-mode: standalone)').matches,
      mmFullscreen:        window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches,
      mmBrowser:           window.matchMedia && window.matchMedia('(display-mode: browser)').matches
    },

    viewport: {
      innerHeight:                window.innerHeight,
      outerHeight:                window.outerHeight,
      visualViewportH:            window.visualViewport ? window.visualViewport.height : null,
      visualViewportO:            window.visualViewport ? window.visualViewport.offsetTop : null,
      documentElementClientH:     document.documentElement.clientHeight,
      bodyClientH:                document.body.clientHeight,
      htmlComputedHeight:         htmlCS.height,
      bodyComputedHeight:         bodyCS.height,
      htmlComputedBgColor:        htmlCS.backgroundColor,
      bodyComputedBgColor:        bodyCS.backgroundColor,
      devicePixelRatio:           window.devicePixelRatio
    },

    safeAreaInsets: insets,

    activeScreenId: activeId,
    activeScreen:   activeScreen ? _rect('#' + activeId) : null,

    elements: {
      html:                _rect('html'),
      body:                _rect('body'),
      home:                _rect('#home'),
      dashboardScreen:     _rect('#dashboard-screen'),
      homeIn:              _rect('#home .home-in'),
      dbAiFooterWrap:      _rect('#dashboard-screen .db-ai-footer-wrap'),
      historyLink:         _rect('#history-link'),
      historyLinkBigBtn:   _rect('#home #history-link .big-btn'),
      generateReportBtn:   _rect('#dashboard-screen .db-ai-gen-btn')
    },

    cssSupport: {
      dvh:                CSS && CSS.supports && CSS.supports('height: 100dvh'),
      webkitFillAvail:    CSS && CSS.supports && CSS.supports('height: -webkit-fill-available'),
      envSafeAreaInsetB:  CSS && CSS.supports && CSS.supports('padding-bottom: env(safe-area-inset-bottom)')
    }
  };
  console.log('[MMR SAFE-AREA]', info);
  return info;
}

// ── In-app safe-area debug panel ────────────────────────────
// Opens on 5 quick taps in the bottom-right corner (≤2 s) or ?safeDebug=1.
// Dormant by default — no DOM cost for normal users.
(function _initSaDebugGesture(){
  var _tc = 0, _tt = null;
  function _check(x, y){
    if(x < window.innerWidth - 60 || y < window.innerHeight - 60) return;
    _tc++;
    if(_tt) clearTimeout(_tt);
    if(_tc >= 5){ _tc = 0; window._openSaDebugPanel(); return; }
    _tt = setTimeout(function(){ _tc = 0; }, 2000);
  }
  document.addEventListener('touchend', function(e){
    var t = e.changedTouches[0];
    if(t) _check(t.clientX, t.clientY);
  }, { passive: true });
  if(location.search.indexOf('safeDebug=1') !== -1){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){ window._openSaDebugPanel(); });
    } else {
      setTimeout(function(){ window._openSaDebugPanel(); }, 200);
    }
  }
})();

function _openSaDebugPanel(){
  if(document.getElementById('sa-panel')) return;
  var _d = _debugSafeArea();

  function _esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var _rows = [
    ['debugBuild',         _d.debugBuild],
    ['cssPresent',         String(_d.safeAreaDebugCssPresent)],
    ['swCache',            _d.swExpectedCache],
    ['nav.standalone',     String(_d.standalone.navigatorStandalone)],
    ['display:standalone', String(_d.standalone.mmStandalone)],
    ['viewportMeta',       _d.viewportMeta],
    ['safeInset.bottom',   _d.safeAreaInsets.bottom],
    ['innerHeight',        String(_d.viewport.innerHeight)],
    ['visualViewport.H',   String(_d.viewport.visualViewportH)],
    ['docEl.clientH',      String(_d.viewport.documentElementClientH)],
    ['body.clientH',       String(_d.viewport.bodyClientH)],
    ['activeScreen',       String(_d.activeScreenId)],
    ['activeScreen.btm',   _d.activeScreen ? String(Math.round(_d.activeScreen.rect.bottom)) : 'n/a'],
    ['body bg',            _d.viewport.bodyComputedBgColor],
    ['html bg',            _d.viewport.htmlComputedBgColor],
  ];

  var _legend = [
    ['#f00',               'html layer'],
    ['#00f',               'body layer'],
    ['#0a0',               'active screen (.sc.on)'],
    ['#ff0',               'inner / footer layer'],
    ['#f0f',               'bottom buttons (magenta outline)'],
    ['rgba(255,0,0,0.45)', 'env(safe-area-inset-bottom) bar'],
  ];

  var p = document.createElement('div');
  p.id = 'sa-panel';
  p.innerHTML =
    '<div id="sa-ph">' +
      '<span id="sa-pt">Safe-Area Debug v6.0.5</span>' +
      '<div id="sa-pbtns">' +
        '<button id="sa-en">Enable Colors</button>' +
        '<button id="sa-dis">Disable Colors</button>' +
        '<button id="sa-ref">Refresh</button>' +
        '<button id="sa-cp">Copy JSON</button>' +
        '<button id="sa-col">Collapse ▲</button>' +
        '<button id="sa-cl">✕ Close</button>' +
      '</div>' +
    '</div>' +
    '<div id="sa-pb">' +
      '<div id="sa-sum">' +
        _rows.map(function(r){
          return '<div class="sa-row"><span class="sa-key">'+_esc(r[0])+'</span><span class="sa-val">'+_esc(String(r[1]))+'</span></div>';
        }).join('') +
      '</div>' +
      '<div id="sa-leg">' +
        '<div class="sa-lh">Color legend (what to look for in the gap):</div>' +
        _legend.map(function(l){
          return '<div class="sa-lr"><span class="sa-sw" style="background:'+l[0]+'"></span>'+_esc(l[1])+'</div>';
        }).join('') +
      '</div>' +
      '<pre id="sa-json">'+_esc(JSON.stringify(_d, null, 2))+'</pre>' +
    '</div>';

  document.body.appendChild(p);

  document.getElementById('sa-en').onclick  = function(){ _enableSafeAreaDebug(); };
  document.getElementById('sa-dis').onclick = function(){ _disableSafeAreaDebug(); };
  document.getElementById('sa-ref').onclick = function(){
    var old = document.getElementById('sa-panel');
    if(old) old.remove();
    _openSaDebugPanel();
  };
  document.getElementById('sa-cp').onclick = function(){
    var json = JSON.stringify(_debugSafeArea(), null, 2);
    var btn = document.getElementById('sa-cp');
    function _ok(){ if(btn){ btn.textContent = 'Copied ✓'; setTimeout(function(){ if(btn) btn.textContent = 'Copy JSON'; }, 2200); } }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(json).then(_ok).catch(function(){ _copyFallback(json); _ok(); });
    } else { _copyFallback(json); _ok(); }
  };
  document.getElementById('sa-col').onclick = function(){
    var pb = document.getElementById('sa-pb');
    var btn = document.getElementById('sa-col');
    var collapsed = pb.style.display === 'none';
    pb.style.display = collapsed ? '' : 'none';
    btn.innerHTML = collapsed ? 'Collapse ▲' : 'Expand ▼';
  };
  document.getElementById('sa-cl').onclick = function(){
    var panel = document.getElementById('sa-panel');
    if(panel) panel.remove();
  };
}

function _copyFallback(text){
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;font-size:12px;';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch(e){}
  document.body.removeChild(ta);
}

// ════════════════════════════════════════
//  PWA BLANK-SCREEN RECOVERY
//  Restores visible screen state after BFCache restore, visibilitychange, or
//  post-splash when the auth suppress gate fires on force-close/reopen.
// ════════════════════════════════════════
function _recoverVisibleScreen(reason){
  var splash = document.getElementById('auth-splash');
  if(splash && splash.style.display !== 'none') return;

  var screens = document.querySelectorAll('.sc');
  screens.forEach(function(screen){
    screen.style.display = '';
    screen.style.opacity = '';
    screen.style.visibility = '';
    screen.style.transform = '';
  });

  var active = document.querySelector('.sc.on');
  if(active){
    active.style.opacity = '1';
    active.style.visibility = 'visible';
    active.getBoundingClientRect();
    console.log('[MMR PWA recovery]', reason, 'active:', active.id);
    return;
  }

  console.warn('[MMR PWA recovery]', reason, 'no active screen; restoring route');

  var hasUser = typeof _supaUser !== 'undefined' && !!_supaUser;
  var isGuest = localStorage.getItem('wb_guest_mode') === '1';
  // Family-code student session: role + active-student + session-token.
  // The session token is set only by a successful verify_student_pin RPC,
  // so it's the proof that the user actually authenticated.
  var hasStudentSession =
    localStorage.getItem('mmr_user_role') === 'student'
    && !!localStorage.getItem('mmr_active_student_id')
    && !!localStorage.getItem('mmr_session_token');

  // Hard guard: no auth, no guest, no valid student session → login.
  // Stale role/active-student WITHOUT mmr_session_token does not qualify.
  if(!hasUser && !isGuest && !hasStudentSession){
    console.log('[MMR PWA recovery] signed-out → login', reason);
    if(typeof show === 'function') show('login-screen');
    return;
  }

  if(hasUser){
    if(typeof show === 'function') show('dashboard-screen');
    if(typeof _dbInit === 'function') _dbInit();
    return;
  }

  // Family-code student or guest → home
  if(hasStudentSession || isGuest){
    if(typeof buildHome === 'function') buildHome();
    if(typeof show === 'function') show('home');
    return;
  }

  if(typeof show === 'function') show('login-screen');
}
window._recoverVisibleScreen = _recoverVisibleScreen;

// BFCache restore (iOS fast app-switch freeze/thaw)
window.addEventListener('pageshow', function(e){
  if(e.persisted) _recoverVisibleScreen('pageshow-bfcache');
});
// Tab/app becomes visible again
document.addEventListener('visibilitychange', function(){
  if(!document.hidden) _recoverVisibleScreen('visibilitychange-visible');
});
// Window regains focus (secondary signal)
window.addEventListener('focus', function(){
  _recoverVisibleScreen('window-focus');
});

// ── Lazy-load fonts CSS (moved out of inline HTML to save ~1MB on initial load) ──
(function _loadFonts(){
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/fonts.css';
  link.onload = function(){
    // Optionally populate the fonts-inline style block for compatibility
    const el = document.getElementById('fonts-inline');
    if(el) el.dataset.loaded = '1';
  };
  document.head.appendChild(link);
})();

// ════════════════════════════════════════
//  SESSION TIME TRACKING
//  Measures foreground app time using visibilitychange.
//  Caps each segment at 1 hr to avoid overnight/idle counts.
// ════════════════════════════════════════
(function _initSessionTracking(){
  let _segStart = null;

  function _startSeg(){ _segStart = Date.now(); }

  function _endSeg(){
    if(!_segStart) return;
    const elapsed = Math.round((Date.now() - _segStart) / 1000);
    _segStart = null;
    if(elapsed < 3 || elapsed > 3600) return; // ignore blips and overnight idle
    if(typeof APP_TIME === 'undefined') return;
    APP_TIME.totalSecs = (APP_TIME.totalSecs||0) + elapsed;
    APP_TIME.sessions  = (APP_TIME.sessions ||0) + 1;
    const today = new Date().toISOString().slice(0,10);
    if(!APP_TIME.dailySecs) APP_TIME.dailySecs = {};
    APP_TIME.dailySecs[today] = (APP_TIME.dailySecs[today]||0) + elapsed;
    if(typeof saveAppTime === 'function') saveAppTime();
  }

  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'visible'){ _startSeg(); } else { _endSeg(); }
  });
  window.addEventListener('pagehide', _endSeg);

  _startSeg(); // begin tracking immediately on load
})();

// ── Resume-quiz reliability: snapshot in-progress quizzes on tab hide/refresh.
// quitQuiz already saves when the student presses Back; this catches the cases
// where the student closes the tab, refreshes, or backgrounds the app without
// ever pressing Back. Without it, "sometimes resume works, sometimes it doesn't"
// because saving only happened on the Back path.
(function _wireQuizPauseOnHide(){
  function _safePauseInFlightQuiz(){
    try {
      if (typeof CUR === 'undefined' || !CUR || !CUR.quiz) return;
      if (typeof _pauseCurrentQuiz === 'function') _pauseCurrentQuiz();
    } catch(_) { /* never throw out of an unload handler */ }
  }
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'hidden') _safePauseInFlightQuiz();
  });
  window.addEventListener('pagehide', _safePauseInFlightQuiz);
  window.addEventListener('beforeunload', _safePauseInFlightQuiz);
})();

applyStoredTheme();
applyA11y();
// Apply grade data before first render so UNITS_DATA is correct for all paths
(function _applyGradeData(){
  var _g = localStorage.getItem('mmr_grade') || '2';
  console.log('BOOT GRADE:', _g);
  if(_g === 'K'){ console.log('APPLYING GRADE:', 'K'); _applyKindergartenGrade(); }
  else if(_g === '1'){ console.log('APPLYING GRADE:', '1'); _applyGrade1Grade(); }
  else if(_g === '3'){ console.log('APPLYING GRADE:', '3'); _applyGrade3Grade(); }
})();
buildHome();
// Set version display
const vEl = document.getElementById('app-version');
if(vEl) vEl.textContent = APP_VERSION;
// SEC-6/SEC-2: Generate per-device secret used for lockout and score signing
if(!localStorage.getItem('wb_app_secret')){
  localStorage.setItem('wb_app_secret', crypto.randomUUID());
}
// Boot-side polish: echo grade-switch label in splash if coming from a switch
(function(){
  var _gsl = localStorage.getItem('wb_grade_switch_label');
  if(_gsl){
    localStorage.removeItem('wb_grade_switch_label');
    var _splEl = document.querySelector('#auth-splash div[style*="font-size:var(--fs-2xl)"]');
    if(_splEl) _splEl.textContent = 'Loading ' + _gsl + '\u2026';
  }
})();
// Guest fast-path: show home immediately, but also initialize Supabase in
// the background so a later "Sign In" from guest can succeed without a
// reload. INITIAL_SESSION fires with no session, hits the suppress gate
// (guest + on home → suppress), and is a no-op routing-wise.
if(localStorage.getItem('wb_guest_mode') === '1'){
  console.log('GRADE SAVED:', localStorage.getItem('mmr_grade'));
  buildHome(); show('home'); _dismissSplash();
  if(typeof supabaseInit === 'function') supabaseInit();
} else if (
  localStorage.getItem('mmr_user_role') === 'student'
  && localStorage.getItem('mmr_active_student_id')
  && localStorage.getItem('mmr_session_token')
) {
  // Family-code student fast-path: home immediately. Supabase init runs in
  // the background so RPCs (progress sync, unlocks) work right away. The
  // suppress gate prevents INITIAL_SESSION from re-routing.
  buildHome(); show('home'); _dismissSplash();
  if(typeof supabaseInit === 'function') supabaseInit();
} else {
  supabaseInit();
}
// SEC-9: Migrate any legacy plain-text email in localStorage to AES-GCM encrypted form
_migrateEmailStorage().catch(()=>{});
// Clear old tutorial flag so users see the improved v2 tutorial
localStorage.removeItem('wb_tutorial_v1');
// Safety net: if auth/data load never resolves within 8s, force-dismiss splash
setTimeout(() => {
  const splash = document.getElementById('auth-splash');
  if(splash && splash.style.display !== 'none'){
    _dismissSplash();
    const _isLocal2 = ['localhost','127.0.0.1'].includes(location.hostname);
    if(_supaUser){
      // Parent Supabase session present — route to parent dashboard.
      // (Student sessions never sit behind a 5s+ splash — they hydrate
      // synchronously from localStorage. If a grade-switch resume is in
      // flight, the INITIAL_SESSION handler already consumed the flag.)
      // Defense-in-depth: if any learning context is observable, suppress nav.
      if (typeof _shouldSuppressAuthNavigation === 'function' && _shouldSuppressAuthNavigation()) {
        console.log('[MMR AUTH] safety-net 8s timeout suppressed — active learning context');
      } else {
        console.log('[MMR AUTH] safety-net 8s timeout, _supaUser present -> dashboard');
        show('dashboard-screen');
        if(typeof _dbInit === 'function') _dbInit();
        if(typeof _installHistoryGuard === 'function') _installHistoryGuard();
      }
    } else if(localStorage.getItem('wb_guest_mode') === '1'){
      console.log('[MMR AUTH] safety-net 8s timeout, guest mode -> home');
      buildHome(); show('home');
    } else if(_isLocal2 && new URLSearchParams(location.search).get('preview') === '1'){
      const _tsN2 = parseInt(new URLSearchParams(location.search).get('testStreak')) || 7;
      _supaUser = { id:'preview', email:'preview@test.com' };
      STREAK.current = _tsN2; STREAK.longest = _tsN2 + 5; STREAK.lastDate = new Date().toISOString().slice(0,10);
      const _tsDates2 = [];
      for(let i=0;i<_tsN2;i++) _tsDates2.push(new Date(Date.now()-i*86400000).toISOString().slice(0,10));
      localStorage.setItem('wb_act_dates', JSON.stringify(_tsDates2));
      show('home'); buildHome(); _renderCalBtn(); _installHistoryGuard();
    } else {
      show('login-screen');
      _lsInitCarousel();
      _lsCarouselGo(0);   // Apply state so .is-active is on card 0 at first paint
    }
  }
}, 8000);

// Deferred safety net: catch post-splash blank screen when auth suppress gate fires
// on force-close/reopen (fires after splash fade completes at 950ms)
setTimeout(function(){ _recoverVisibleScreen('post-init'); }, 1200);





// ════════════════════════════════════════
//  PWA — SERVICE WORKER (full offline)
// ════════════════════════════════════════
function _showUpdatedToast(){
  const b = document.getElementById('update-banner');
  if(!b) return;
  b.style.display = 'flex';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    b.classList.add('show');
    setTimeout(()=>{
      b.classList.remove('show');
      setTimeout(()=>{ b.style.display='none'; }, 400);
    }, 3000);
  }));
}
function _autoApplyUpdate(){
  sessionStorage.setItem('app-just-updated','1');
  navigator.serviceWorker.getRegistration().then(reg => {
    if(reg && reg.waiting){ reg.waiting.postMessage({type:'SKIP_WAITING'}); }
    else { window.location.reload(); }
  });
}

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').then(reg => {
    window._swReg = reg; // expose for pull-to-refresh
    // Check for SW updates when user returns to tab (no polling interval — saves battery on mobile)
    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) reg.update(); });
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      sw.addEventListener('statechange', () => {
        if(sw.state === 'installed' && navigator.serviceWorker.controller){
          _autoApplyUpdate();
        }
      });
    });
    if(reg.waiting && navigator.serviceWorker.controller){ _autoApplyUpdate(); }
  }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', ()=>window.location.reload());
}

// After auto-update reload, show brief toast
if(sessionStorage.getItem('app-just-updated')){
  sessionStorage.removeItem('app-just-updated');
  document.addEventListener('DOMContentLoaded', ()=>setTimeout(_showUpdatedToast, 1200));
}

// ════════════════════════════════════════
//  PWA — APPLE TOUCH ICONS (all sizes)
// ════════════════════════════════════════
(function generateIcons(){
  const sizes = [
    {rel:'apple-touch-icon'},                          // iPhone retina
    {rel:'apple-touch-icon', sizes:'167x167'},         // iPad Pro
    {rel:'apple-touch-icon', sizes:'152x152'},         // iPad retina
    {rel:'apple-touch-icon', sizes:'120x120'},         // iPhone
  ];
  sizes.forEach(({rel, sizes:sz}) => {
    const link = document.createElement('link');
    link.rel = rel;
    if(sz) link.setAttribute('sizes', sz);
    link.href = '/icon-192.png';
    document.head.appendChild(link);
  });
  // Favicon
  const link = document.createElement('link');
  link.rel = 'icon'; link.type = 'image/png'; link.href = '/icon-192.png';
  document.head.appendChild(link);
})();

// ════════════════════════════════════════
//  PWA — SPLASH SCREEN (iOS)
// ════════════════════════════════════════
// iOS uses apple-touch-startup-image for splash screens.
// We generate one dynamically that matches the app icon style.
(function generateSplash(){
  try{
    const w = screen.width * devicePixelRatio || 1170;
    const h = screen.height * devicePixelRatio || 2532;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    // Background gradient matching app
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#f9fcff');
    grad.addColorStop(0.45, '#eef7ff');
    grad.addColorStop(1, '#eafaf2');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    // Sprout SVG — orange petals, green stem
    const sz = Math.round(Math.min(w, h) * 0.30);
    const sx = (w - sz) / 2;
    const sy = (h - sz) / 2 - h * 0.06;
    const svgStr = `<svg viewBox="0 0 310 300" fill="none" xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz}"><defs><linearGradient id="sp-l1" x1="5%" y1="5%" x2="95%" y2="95%"><stop offset="0%" stop-color="#ffd8a0"/><stop offset="38%" stop-color="#f5a020"/><stop offset="100%" stop-color="#c86c00"/></linearGradient><linearGradient id="sp-l2" x1="95%" y1="5%" x2="5%" y2="95%"><stop offset="0%" stop-color="#ffe4b0"/><stop offset="38%" stop-color="#ee9010"/><stop offset="100%" stop-color="#b85e00"/></linearGradient><linearGradient id="sp-ls" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3ada6e"/><stop offset="100%" stop-color="#14762e"/></linearGradient><linearGradient id="sp-lb" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#aeffc8"/><stop offset="100%" stop-color="#28c45c"/></linearGradient></defs><g stroke-linecap="round" fill="none"><path d="M154 284 Q100 278 72 292" stroke="#16763a" stroke-width="3.0"/><path d="M156 284 Q210 278 238 292" stroke="#16763a" stroke-width="3.0"/><path d="M154 283 Q112 270 92 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M156 283 Q198 270 218 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M154 283 Q128 266 116 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M156 283 Q182 266 194 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M154 282 Q142 266 138 260" stroke="#20a650" stroke-width="3.5"/><path d="M156 282 Q168 266 172 260" stroke="#20a650" stroke-width="3.5"/><path d="M154 283 Q105 276 76 289" stroke="#50de80" stroke-width="1.5" opacity="0.55"/><path d="M156 283 Q205 276 234 289" stroke="#50de80" stroke-width="1.5" opacity="0.55"/><path d="M154 282 Q130 268 118 270" stroke="#50de80" stroke-width="1.4" opacity="0.50"/><path d="M156 282 Q180 268 192 270" stroke="#50de80" stroke-width="1.4" opacity="0.50"/></g><path d="M155 278 Q152 234 154 190 Q156 155 155 118" stroke="url(#sp-ls)" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M154 194 C136 174,82 152,62 108 C50 78,74 50,104 70 C126 85,144 146,154 194Z" fill="url(#sp-l1)"/><ellipse cx="96" cy="110" rx="22" ry="12" fill="rgba(255,255,255,0.26)" transform="rotate(-35 96 110)"/><path d="M153 189 C130 166 88 128 68 100" stroke="rgba(255,255,255,0.42)" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M156 162 C176 142,228 120,248 76 C260 46,236 18,206 38 C184 54,164 112,156 162Z" fill="url(#sp-l2)"/><ellipse cx="212" cy="80" rx="21" ry="11" fill="rgba(255,255,255,0.24)" transform="rotate(34 212 80)"/><path d="M157 158 C178 134 210 94 228 68" stroke="rgba(255,255,255,0.38)" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M155 118 C147 100 145 74 155 56 C165 74 163 100 155 118Z" fill="url(#sp-lb)"/></svg>`;
    const blob = new Blob([svgStr], {type:'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = function(){
      ctx.filter = 'drop-shadow(0 8px 20px rgba(0,80,20,0.20))';
      ctx.drawImage(img, sx, sy, sz, sz);
      ctx.filter = 'none';
      URL.revokeObjectURL(url);
      // App name
      const fs = Math.round(sz * 0.30);
      ctx.font = `900 ${fs}px 'Boogaloo','Arial Rounded MT Bold',sans-serif`;
      ctx.fillStyle = '#1a3520'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('MY MATH ROOTS', w/2, sy + sz + fs * 1.1);
      // Subtitle
      ctx.font = `700 ${Math.round(fs*0.52)}px 'Boogaloo',sans-serif`;
      ctx.fillStyle = '#4a7060';
      ctx.fillText('K-5 REVIEW', w/2, sy + sz + fs * 1.1 + fs * 0.62);
      const link = document.createElement('link');
      link.rel = 'apple-touch-startup-image';
      link.href = canvas.toDataURL('image/png');
      document.head.appendChild(link);
    };
    img.src = url;
  } catch(e){}
})();

// ── Analytics: app_opened ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  try {
    var _g = localStorage.getItem('mmr_grade');
    _trackEvent('app_opened', _g ? { grade: _g } : {});
  } catch (_) {}
});
