// ════════════════════════════════════════
//  EVENTS.JS — Central event dispatcher
//  Replaces every inline onclick=/onsubmit=/oninput=/onkeydown= attribute
//  with data-action= event delegation so the CSP can drop 'unsafe-inline'.
//
//  Usage in HTML:
//    BEFORE:  <button onclick="openUnit(3)">…</button>
//    AFTER:   <button data-action="openUnit" data-arg="3">…</button>
//
//    BEFORE:  <button onclick="showLockToast('msg', true)">…</button>
//    AFTER:   <button data-action="showLockToast" data-arg="msg" data-arg2="true">…</button>
//
//  Usage in JS template literals:
//    BEFORE:  `<div onclick="openUnit(${i})">…</div>`
//    AFTER:   `<div data-action="openUnit" data-arg="${i}">…</div>`
//
//  Special attributes:
//    data-submit-on="enter"  — element fires _lsSubmit() on Enter keydown
//    data-oninput="fnName"   — element calls named action on every input event
//    data-nosubmit           — form prevents native submission (replaces onsubmit="return false")
// ════════════════════════════════════════

(function _initEventDispatcher(){
  'use strict';

  // ── Action registry ──────────────────────────────────────────────────────
  // All functions are resolved lazily at dispatch time so ordering in the
  // concatenated bundle does not matter.  Unknown actions warn in dev only.

  const _ACTIONS = {

    // ── App navigation ──────────────────────────────────────────────────────
    goSettings:             ()    => goSettings(),
    goHome:                 ()    => goHome(),
    goUnit:                 ()    => goUnit(),
    goHistory:              ()    => goHistory(),
    show:                   (a)   => show(a),            // generic: data-arg="screen-id"

    // ── Auth / login screen ─────────────────────────────────────────────────
    _lsOAuth:               (a)   => _lsOAuth(a),
    _lsSwitchTab:           (a)   => _lsSwitchTab(a),
    _lsSubmit:              ()    => _lsSubmit(),
    _lsTogglePw:            ()    => _lsTogglePw(),
    _lsResend:              ()    => _lsResend(),
    _lsForgotPassword:      ()    => _lsForgotPassword(),
    _continueAsGuest:       ()    => _continueAsGuest(),
    supaSignOut:            ()    => supaSignOut(),
    openAuthModal:          ()    => openAuthModal(),
    closeAuthModal:         ()    => closeAuthModal(),
    _switchAuthTab:         (a)   => _switchAuthTab(a),
    submitAuth:             ()    => submitAuth(),
    syncNow:                ()    => syncNow(),

    // ── Soft gate (email lead capture) ──────────────────────────────────────
    _submitSoftGate:        ()    => _submitSoftGate(),
    _skipSoftGate:          ()    => _skipSoftGate(),
    _guestConsentContinue:  ()    => _guestConsentContinue(),
    // Multi-step soft-gate actions (compound: remove modal + navigate)
    _softGateShowLogin:     ()    => { document.getElementById('soft-gate-modal')?.remove(); show('login-screen'); _lsSwitchTab('signup'); },
    _softGateClose:         ()    => { document.getElementById('soft-gate-modal')?.remove(); },
    // Signup nudge modal actions
    nudgeModalSignup:       ()    => { document.getElementById('signup-nudge-modal')?.remove(); show('login-screen'); _lsSwitchTab('signup'); },
    nudgeModalDismiss:      ()    => { document.getElementById('signup-nudge-modal')?.remove(); },

    // ── Quiz ────────────────────────────────────────────────────────────────
    nextQ:                  ()    => nextQ(),
    prevQ:                  ()    => prevQ(),
    _pickAnswer:            (a)   => _pickAnswer(Number(a)),
    _practiceWeak:          ()    => _practiceWeak(),
    fetchAIHint:            (revId, dataJson) => { const {q,chosen,correct} = JSON.parse(dataJson); _fetchAIHint(revId, q, chosen, correct); },
    restartQuiz:            ()    => restartQuiz(),
    cancelRestart:          ()    => cancelRestart(),
    confirmRestart:         ()    => confirmRestart(),
    showQuitConfirm:        ()    => showQuitConfirm(),
    cancelQuit:             ()    => cancelQuit(),
    confirmQuit:            ()    => confirmQuit(),
    quitQuiz:               ()    => quitQuiz(),
    retryQuiz:              ()    => retryQuiz(),
    afterResults:           (a)   => afterResults(a),
    openScratchPad:         ()    => openScratchPad(),
    closeScratchPad:        ()    => closeScratchPad(),
    clearScratchPad:        ()    => clearScratchPad(),
    setScratchColor:        (a, b, el) => setScratchColor(a, el),
    setScratchTool:         (a)   => setScratchTool(a),

    // ── Home ────────────────────────────────────────────────────────────────
    openUnit:               (a)   => openUnit(Number(a)),
    openUnitPinUnlock:      (a)   => openUnitPinUnlock(Number(a)),
    resumeQuiz:             (a)   => resumeQuiz(a),
    startFinalTest:         ()    => startFinalTest(),
    // showLockToast: second arg is boolean — coerce string "true"/"false"
    showLockToast:          (a,b) => showLockToast(a, b === 'true'),

    // ── Unit / lesson ────────────────────────────────────────────────────────
    openLesson:             (a,b) => openLesson(Number(a), Number(b)),
    morePractice:           ()    => morePractice(),
    revealPQ:               (a)   => revealPQ(Number(a)),
    togglePQ:               (a)   => togglePQ(Number(a)),
    refreshExamples:        ()    => refreshExamples(),
    playCarryAnim:          (a, b, el) => typeof playCarryAnim === 'function' && playCarryAnim(el),
    playBorrowAnim:         (a, b, el) => typeof playBorrowAnim === 'function' && playBorrowAnim(el),
    play3dRegroup:          (a, b, el) => typeof play3dRegroup === 'function' && play3dRegroup(el, JSON.parse(a), JSON.parse(b)),

    // ── Results ─────────────────────────────────────────────────────────────
    buildRevSection:        ()    => typeof buildRevSection === 'function' && buildRevSection(),
    toggleRS:               (a)   => typeof toggleRS === 'function' && toggleRS(a),

    // ── History ─────────────────────────────────────────────────────────────
    openScLightbox:         (a)   => openScLightbox(Number(a)),
    closeScLightbox:        ()    => closeScLightbox(),
    delScore:               (a)   => delScore(Number(a)),
    clearAll:               ()    => clearAll(),
    setFilt:                (a)   => setFilt(a),
    openCoinLightbox:       (a)   => openCoinLightbox(a),
    closeCoinLightbox:      ()    => closeCoinLightbox(),

    // ── Settings ────────────────────────────────────────────────────────────
    goSettings:             ()    => goSettings(),
    goParentControls:       ()    => goParentControls(),
    openProgressReport:     ()    => openProgressReport(),
    closeProgressReport:    ()    => closeProgressReport(),
    openPrReview:           (a)   => openPrReview(a),
    openAccessModal:        (a)   => openAccessModal(a),
    closeAccessModal:       ()    => closeAccessModal(),
    _showAccessConfirm:     (a)   => _showAccessConfirm(a),
    _cancelAccessConfirm:   ()    => _cancelAccessConfirm(),
    _executeAccessConfirm:  ()    => _executeAccessConfirm(),
    openPinModal:           ()    => openPinModal(),
    closePinModal:          ()    => closePinModal(),
    changePin:              ()    => typeof changePin === 'function' && changePin(),
    openTimerModal:         ()    => openTimerModal(),
    closeTimerModal:        ()    => closeTimerModal(),
    openA11yModal:          ()    => openA11yModal(),
    closeA11yModal:         ()    => closeA11yModal(),
    openForgotPin:          ()    => openForgotPin(),
    closeForgotPin:         ()    => closeForgotPin(),
    refreshForgotProblem:   ()    => refreshForgotProblem(),
    checkForgotAnswer:      ()    => checkForgotAnswer(),
    openUnitPinUnlock:      (a)   => openUnitPinUnlock(Number(a)),
    closeUnitPinModal:      ()    => closeUnitPinModal(),
    checkUnitPinUnlock:     ()    => checkUnitPinUnlock(),
    openLessonPinUnlock:    (a,b) => openLessonPinUnlock(Number(a), Number(b)),
    checkLessonPinUnlock:   ()    => checkLessonPinUnlock(),
    showInstall:            ()    => showInstall(),
    closeInstall:           ()    => closeInstall(),
    switchInstallTab:       (a)   => switchInstallTab(a),
    setSound:               (a)   => setSound(a),
    setTheme:               (a)   => setTheme(a),
    toggleA11y:             (a)   => toggleA11y(a),
    generateAIReport:       ()    => typeof generateAIReport === 'function' && generateAIReport(),
    downloadReportPDF:      ()    => typeof downloadReportPDF === 'function' && downloadReportPDF(),
    _backToProgressStats:   ()    => typeof _backToProgressStats === 'function' && _backToProgressStats(),
    windowPrint:            ()    => window.print(),

    // ── Tour / onboarding ────────────────────────────────────────────────────
    tutNext:                ()    => tutNext(),
    tutBack:                ()    => tutBack(),
    tutSkip:                ()    => tutSkip(),
    _spotAdvance:           ()    => typeof _spotAdvance === 'function' && _spotAdvance(),
    _spotDone:              ()    => typeof _spotDone === 'function' && _spotDone(),

    // ── Streak calendar ──────────────────────────────────────────────────────
    _openStreakCal:         ()    => _openStreakCal(),
    _closeStreakCal:        ()    => _closeStreakCal(),
    _buildStreakCal:        ()    => _buildStreakCal(),
    _streakCalNav:          (a)   => _streakCalNav(Number(a)),
    _showDayDetail:         (a)   => _showDayDetail(a),

    // ── Pin-lockout poll ─────────────────────────────────────────────────────
    _upmCheck:              ()    => typeof _upmCheck === 'function' && _upmCheck(),
    checkLessonPin:         ()    => typeof checkLessonPinUnlock === 'function' && checkLessonPinUnlock(),

    // ── Auth (sign-out / parent auth) ────────────────────────────────────────
    _signOut:               ()    => typeof _signOut === 'function' && _signOut(),
    _closeParentAuth:       ()    => typeof _closeParentAuth === 'function' && _closeParentAuth(),

    // ── Parent controls – settings screen ───────────────────────────────────
    togglePushNotifications:()    => typeof togglePushNotifications === 'function' && togglePushNotifications(),
    toggleQuizTimer:        ()    => typeof toggleQuizTimer === 'function' && toggleQuizTimer(),
    _pcChangePassword:      ()    => typeof _pcChangePassword === 'function' && _pcChangePassword(),
    _pcShowPwArea:          ()    => { const el=document.getElementById('pc-pw-area'); if(el){ el.style.display='block'; document.getElementById('pc-new-pw')?.focus(); } },
    _pcHidePwArea:          ()    => { const el=document.getElementById('pc-pw-area'); if(el) el.style.display='none'; const inp=document.getElementById('pc-new-pw'); if(inp) inp.value=''; },

    // ── Parent screen navigation ──────────────────────────────────────────────
    _goParentScreenSettings:()    => { typeof playSwooshBack === 'function' && playSwooshBack(); show('settings-screen'); },

    // ── Feedback ─────────────────────────────────────────────────────────────
    _fbSetRating:           (a)   => typeof _fbSetRating === 'function' && _fbSetRating(Number(a)),
    _fbSetCat:              (a, b, el) => typeof _fbSetCat === 'function' && _fbSetCat(el, a),
    _submitFeedback:        ()    => typeof _submitFeedback === 'function' && _submitFeedback(),

    // ── Login-screen compound: show login-screen and switch to login tab ──────
    _showLoginScreen:       ()    => { show('login-screen'); typeof _lsSwitchTab === 'function' && _lsSwitchTab('login'); },
  };

  // ── Click dispatcher (capture phase beats stopPropagation on children) ──
  document.addEventListener('click', function _clickDispatch(e){
    const el = e.target.closest('[data-action]');
    if(!el) return;
    // data-self-only: only fire when the click target IS the element (backdrop-close pattern)
    if('selfOnly' in el.dataset && e.target !== el) return;
    const action = el.dataset.action;
    const fn = _ACTIONS[action];
    if(!fn){
      if(location.hostname === 'localhost')
        console.warn('[events] Unknown data-action:', action, el);
      return;
    }
    const arg  = el.dataset.arg  !== undefined ? el.dataset.arg  : null;
    const arg2 = el.dataset.arg2 !== undefined ? el.dataset.arg2 : null;
    fn(arg, arg2, el);
  }, true);

  // ── Enter-key submit ──────────────────────────────────────────────────────
  // Replaces: onkeydown="if(event.key==='Enter')_lsSubmit()"
  // Activate with: data-submit-on="enter"
  document.addEventListener('keydown', function _keyDispatch(e){
    if(e.key !== 'Enter') return;
    const el = e.target;
    if(el.id === 'ls-password' || el.dataset.submitOn === 'enter'){
      e.preventDefault();
      if(typeof _lsSubmit === 'function') _lsSubmit();
    }
  });

  // ── Input event dispatch ──────────────────────────────────────────────────
  // Replaces: oninput="fnName()"
  // Activate with: data-oninput="actionName"
  document.addEventListener('input', function _inputDispatch(e){
    const name = e.target.dataset.oninput;
    if(!name) return;
    const fn = _ACTIONS[name] || (typeof window[name] === 'function' ? window[name] : null);
    if(fn) fn();
  });

  // ── Submit suppression ────────────────────────────────────────────────────
  // Replaces: onsubmit="return false"
  // Activate with: data-nosubmit on the <form>
  document.addEventListener('submit', function _submitDispatch(e){
    if('nosubmit' in e.target.dataset) e.preventDefault();
  });

})();
