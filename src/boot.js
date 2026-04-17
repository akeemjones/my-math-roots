// ════════════════════════════════════════
//  BOOT — Global scope collision detection (dev only)
// ════════════════════════════════════════

// All intentional global function/variable names declared across src/ files
const _APP_GLOBALS = [
  // data/shared.js
  'q','_ICO','UNITS_DATA','_unitLoadPromises','_mergeUnitData','_loadUnit',
  // util.js

  '_sr','_shuffle','_sanitize','_escHtml','_validEmail','_friendlyError','_rateLimit',
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
  '_lsForgotPassword','_lsTogglePw','_turnstileToken','_onTurnstileSuccess',
  '_onTurnstileExpired','_resetTurnstile','_lsSubmit','_pullOnLogin','_pushDone',
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
  '_skipNextHomeBuild','goHome','goHistory','showLockToast',
  // unit.js
  'openUnit','goUnit','playCarryAnim','play3dCarry','playBorrowAnim','renderEx',
  'refreshExamples','generateExamples','buildPQItem','morePractice','steps',
  'generatePractice','openLesson','_renderLesson','_quizTimer','_quizSecsLeft','_quizStartedAt',
  '_pausedSecsLeft','_startTimer','_clearTimer','_updateTimerDisplay','_timeUp',
  // quiz.js
  '_audioCtx','_getAudio','playSwooshBack','playSwooshForward','playTap',
  'playCorrect','playWrong','playPassQuiz','playConfettiBurst',
  'startLessonQuiz','startUnitQuiz','_getPausedAll','getPausedQuiz',
  '_savePausedQuiz','_clearPausedQuiz','resumeQuiz','_weightedSample','_runQuiz','_renderQ',
  '_pickAnswer','nextQ','prevQ','quitQuiz','retryQuiz','_finishQuiz',
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
  'goSettings','_fpAnswer','_gen5thGradeProblem','_fpProblem','_fpBlurHandler',
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
  // tour.js
  'TUT_SLIDES','_tutIdx','_tutShowing','_onboardingActive','_startTutorial',
  'tutCheckAndShow','_tutSpot','_tutClearSpot','_tutRender','tutNext','tutBack','tutSkip',
  'SPOT_TOURS','_spotScreen','_spotStepIdx','_spotActive','_pendingTimerSecs',
  '_pendingTimerColor','_spotCheckScreen','_spotShowStep','_spotRender',
  '_spotAdvance','_spotDone',
  // events.js
  // (all exports are block-scoped inside the IIFE — no globals registered)
  // boot.js
  '_APP_GLOBALS','_showUpdatedToast','_autoApplyUpdate',
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

applyStoredTheme();
applyA11y();
buildHome();
// Set version display
const vEl = document.getElementById('app-version');
if(vEl) vEl.textContent = APP_VERSION;
// SEC-6/SEC-2: Generate per-device secret used for lockout and score signing
if(!localStorage.getItem('wb_app_secret')){
  localStorage.setItem('wb_app_secret', crypto.randomUUID());
}
supabaseInit();
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
      // Logged-in user whose data load hung — show home with whatever local data we have
      show('home'); buildHome(); _installHistoryGuard();
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
      _lsRenderStudentCard();
    }
  }
}, 8000);






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
