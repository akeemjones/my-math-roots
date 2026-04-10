// ════════════════════════════════════════
//  SCREEN MANAGEMENT
// ════════════════════════════════════════
const ALL_SCREENS = ['login-screen','home','unit-screen','lesson-screen','quiz-screen','results-screen','history-screen','settings-screen','parent-screen','dashboard-screen'];
function show(id){
  // Guard: parent-screen requires a valid parent session
  if(id === 'parent-screen' && !isParentUnlocked()){
    console.warn('[Security] Blocked unauthorized access to parent-screen');
    return;
  }
  // Reset feedback form whenever navigating away from settings
  const _curScreen = ALL_SCREENS.find(s=>document.getElementById(s)?.classList.contains('on'));
  if(_curScreen === 'settings-screen' && id !== 'settings-screen'){
    _fbRating = 0; _fbCategory = '';
    _fbSetRating(0);
    document.querySelectorAll('.fb-cat-btn').forEach(b=>b.classList.remove('active'));
    const _fbc = document.getElementById('fb-comment'); if(_fbc) _fbc.value = '';
    const _fbm = document.getElementById('fb-msg'); if(_fbm) _fbm.textContent = '';
  }
  ALL_SCREENS.forEach(s=>document.getElementById(s)?.classList.remove('on'));
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('on');
  el.scrollTop = 0;
  // Clean up timer picker listeners when leaving parent-screen
  if(id !== 'parent-screen' && window._tpCleanups && window._tpCleanups.length){
    window._tpCleanups.forEach(fn=>fn()); window._tpCleanups = [];
  }
  // Hide the settings cog when inside settings, show everywhere else
  const cog = document.querySelector('.cog-btn');
  if(cog) cog.style.display = (id === 'settings-screen' || id === 'login-screen' || id === 'parent-screen' || id === 'dashboard-screen') ? 'none' : '';
  // Profile button only appears on the home (hero) screen
  const prof = document.getElementById('prof-btn');
  if(prof) prof.style.display = (id === 'home') ? '' : 'none';
  // Calendar button only appears on the home screen
  const calBtn = document.getElementById('cal-btn');
  if(calBtn) calBtn.style.display = (id === 'home' && typeof _supaUser !== 'undefined' && _supaUser) ? 'flex' : 'none';
  // Update profile button emoji/visibility when landing on home
  if(id === 'home' && typeof _psUpdateProfileBtn === 'function') _psUpdateProfileBtn();
  // Pre-fill remembered email on login screen — SEC-9: read from encrypted store
  if(id === 'login-screen'){
    const emailInp = document.getElementById('ls-email');
    const remCb = document.getElementById('ls-remember');
    const encRaw = localStorage.getItem('mmr_email_enc');
    if(encRaw && emailInp){
      _decryptStr(JSON.parse(encRaw)).then(email => {
        if(email){ emailInp.value = email; if(remCb) remCb.checked = true; }
      }).catch(()=>{});
    }
  }
  // Trigger per-screen spotlight tour on first visit
  _spotCheckScreen(id);
}

// ════════════════════════════════════════
//  PROGRESS LOCK HELPERS
// ════════════════════════════════════════
function isUnitUnlocked(unitIdx){
  if(isParentUnlocked()) return true;
  if(unitIdx === 0) return true;
  if(isUnitIndividuallyUnlocked(unitIdx)) return true;
  // Need 80%+ on previous unit quiz
  const prevUnit = UNITS_DATA[unitIdx-1];
  return SCORES.some(s => s.qid === prevUnit.id+'_uq' && s.pct >= 80);
}

function isLessonUnlocked(unitIdx, lessonIdx){
  if(isParentUnlocked()) return true;
  if(lessonIdx === 0) return true;
  if(isLessonIndividuallyUnlocked(unitIdx, lessonIdx)) return true;
  // Need 80%+ on previous lesson quiz
  const prevLesson = UNITS_DATA[unitIdx].lessons[lessonIdx-1];
  return SCORES.some(s => s.qid === 'lq_'+prevLesson.id && s.pct >= 80);
}

function isUnitQuizUnlocked(unitIdx){
  if(isParentUnlocked()) return true;
  // Need 80%+ on all lesson quizzes in this unit
  const u = UNITS_DATA[unitIdx];
  return u.lessons.every(l => SCORES.some(s => s.qid === 'lq_'+l.id && s.pct >= 80));
}


// ════════════════════════════════════════
//  SWIPE BACK — iOS-style interactive transition (full-screen gesture)
// ════════════════════════════════════════
(function(){
  const COMMIT_V   = 0.4;  // px/ms velocity threshold for fast flick
  const ANIM_MS    = 280;  // slide-out / snap-back animation duration
  const DECIDE_PX  = 8;    // min movement before deciding swipe vs scroll
  const H_RATIO    = 0.8;  // dx must exceed dy * this to be treated as horizontal

  // Current screen → { prev screen id, back function }
  // prev:null means "root screen" — absorb the gesture, no animation
  const MAP = {
    'home':           { prev:null,              back:null },
    'login-screen':   { prev:null,              back:null },
    'unit-screen':    { prev:'home',            back:()=>{ playSwooshBack(); goHome(); } },
    'lesson-screen':  { prev:'unit-screen',     back:()=>goUnit() },
    'results-screen': { prev:'unit-screen',     back:()=>afterResults() },
    'history-screen': { prev:'home',            back:()=>{ playSwooshBack(); goHome(); } },
    'settings-screen':{ prev:'home',            back:()=>{ playSwooshBack(); goHome(); } },
    'parent-screen':  { prev:'settings-screen', back:()=>{ playSwooshBack(); show('settings-screen'); const _se=document.getElementById('settings-screen'); if(_se&&_se._savedScrollTop) requestAnimationFrame(()=>{ _se.scrollTop=_se._savedScrollTop; }); } },
  };

  let curEl=null, prevEl=null, entry=null;
  let sx=0, sy=0, t0=0;
  let intentDecided=false, swiping=false, swipeAbsorbed=false, locked=false;
  const W = ()=>window.innerWidth;

  function getCurrent(){
    return Object.keys(MAP).find(id=>document.getElementById(id)?.classList.contains('on'));
  }
  function css(el,props){ Object.assign(el.style,props); }

  function _snapBack(){
    if(!curEl) return;
    locked = true;
    const ease = `${ANIM_MS}ms cubic-bezier(.25,.46,.45,.94)`;
    css(curEl, {transition:`transform ${ease}`, transform:'translateX(0px)'});
    if(prevEl) css(prevEl, {transition:`transform ${ease}`,
                             transform:'translateX(-28%)'});
    setTimeout(cleanup, ANIM_MS);
  }

  function cleanup(){
    document.body.classList.remove('swiping');
    _skipNextHomeBuild=false; // safety reset if swipe was cancelled
    if(curEl){ curEl.classList.remove('swipe-active'); css(curEl, {transition:'',transform:'',boxShadow:'',zIndex:''}); }
    if(prevEl){
      prevEl.classList.remove('swipe-peek');
      css(prevEl, {transition:'',transform:'',opacity:'',willChange:'',display:''});
    }
    curEl=null; prevEl=null; entry=null;
    intentDecided=false; swiping=false; swipeAbsorbed=false; locked=false;
  }

  function _startSwipe(){
    // Called once we've confirmed horizontal intent — reveal the previous screen
    document.body.classList.add('swiping');
    // Pre-build the home screen NOW so it's populated before it becomes visible.
    // This prevents the DOM-clear flash that happens when goHome() rebuilds mid-animation.
    if(entry && entry.prev==='home'){
      _carouselInited=false;
      const _t=document.getElementById('ugrid');
      if(_t && _t.querySelector('[data-idx]')) refreshHomeState();
      else buildHome(true);
      _skipNextHomeBuild=true;
    }
    curEl.classList.add('swipe-active');
    css(curEl, {transition:'none', zIndex:'10' /* --z-screen */});
    if(prevEl){
      prevEl.classList.add('swipe-peek');
      css(prevEl, {transition:'none', transform:'translateX(-28%)',
                   willChange:'transform'});
    }
  }

  function _isModalOpen(){
    return ['parent-auth-modal','pin-modal','install-modal','forgot-pin-modal','unit-pin-modal','auth-modal','access-modal','timer-modal','a11y-modal','scal-modal','progress-report-modal','profile-switch-modal']
      .some(id=>{ const el=document.getElementById(id); return el && getComputedStyle(el).display!=='none'; });
  }

  // Intercept iOS Safari edge-swipe-back when a modal is open
  window.addEventListener('popstate', function(e){
    const id = e.state && e.state.mmrModal;
    const closeMap = {
      'access-modal': ()=>{ if(typeof closeAccessModal==='function') closeAccessModal(); },
      'progress-report-modal': ()=>{ if(typeof closeProgressReport==='function') closeProgressReport(); },
      'timer-modal':  ()=>{ if(typeof closeTimerModal==='function')  closeTimerModal(); },
      'a11y-modal':   ()=>{ if(typeof closeA11yModal==='function')   closeA11yModal(); },
      'pin-modal':    ()=>{ if(typeof closePinModal==='function')    closePinModal(); },
      'scal-modal':   ()=>{ if(typeof _closeStreakCal==='function')  _closeStreakCal(); },
      'parent-auth-modal': ()=>{ if(typeof _closeParentAuth==='function') _closeParentAuth(); },
      'install-modal':     ()=>{ if(typeof closeInstall==='function')     closeInstall(); },
      'forgot-pin-modal':  ()=>{ if(typeof closeForgotPin==='function')   closeForgotPin(); },
      'unit-pin-modal':    ()=>{ if(typeof closeUnitPinModal==='function') closeUnitPinModal(); },
      'auth-modal':        ()=>{ if(typeof closeAuthModal==='function')   closeAuthModal(); },
      'profile-switch-modal': ()=>{ if(typeof closeProfileSwitcher==='function') closeProfileSwitcher(); },
    };
    if(id && closeMap[id]){ closeMap[id](); }
  });

  document.addEventListener('touchstart', e=>{
    // Don't intercept slider inputs or explicitly excluded containers
    if(e.target.type === 'range' || e.target.closest('[data-no-swipe]')) return;
    // Block all swipe gestures during install prompt / tutorial onboarding / spotlight tour / open modals
    if(locked || _isModalOpen() || (typeof _onboardingActive!=='undefined' && _onboardingActive) || document.body.classList.contains('spot-scroll-lock')){
      if(e.touches[0].clientX < 30) e.preventDefault();
      return;
    }
    const id = getCurrent();
    if(!id) return;
    entry = MAP[id];
    if(!entry){ entry=null; return; }
    curEl  = document.getElementById(id);
    prevEl = entry.prev ? document.getElementById(entry.prev) : null;
    const t = e.touches[0];
    sx=t.clientX; sy=t.clientY; t0=Date.now();
    intentDecided=false; swiping=false; swipeAbsorbed=false;
    // For left-edge touches, prevent iOS from starting its native back gesture.
    // We handle all back navigation ourselves.
    if(t.clientX < 30) e.preventDefault();
  }, {passive:false}); // non-passive so we can preventDefault on edge touches

  document.addEventListener('touchmove', e=>{
    if(locked || !curEl || _isModalOpen() || document.body.classList.contains('spot-scroll-lock')){ if(swiping) _snapBack(); curEl=null; return; }
    const t  = e.touches[0];
    const dx = t.clientX - sx;
    const dy = Math.abs(t.clientY - sy);

    // ── Phase 1: decide intent once enough movement has happened ──
    if(!intentDecided){
      if(Math.max(dx, dy) < DECIDE_PX) return; // not enough movement yet
      if(dx > 0 && dx >= dy * H_RATIO){
        intentDecided = true;
        if(!entry.prev){
          // Root screen (home/login) — absorb gesture, no animation
          swipeAbsorbed = true;
        } else {
          // Confirmed horizontal swipe — enter swipe mode
          swiping = true;
          _startSwipe();
        }
      } else {
        // Confirmed scroll or leftward drag — ignore for rest of gesture
        intentDecided = true;
        swiping = false;
        curEl=null; prevEl=null; entry=null;
        return;
      }
    }

    // Absorbed: silently swallow the gesture so iOS can't navigate history
    if(swipeAbsorbed){ e.preventDefault(); return; }

    if(!swiping) return;

    // Block browser from also scrolling/panning while we handle the drag
    e.preventDefault();

    if(dx <= 0){ _snapBack(); return; }

    const pct = Math.min(dx / W(), 1);
    // Current screen: pure translate only — no opacity/shadow changes (native iOS behaviour)
    css(curEl, {transform:`translateX(${dx}px)`});
    if(prevEl){
      css(prevEl, {transform:`translateX(${-28 + pct*28}%)`});
    }
  }, {passive:false}); // passive:false required to call preventDefault during confirmed swipe

  document.addEventListener('touchend', e=>{
    if(swipeAbsorbed){ cleanup(); return; }
    if(locked || !swiping || _isModalOpen() || document.body.classList.contains('spot-scroll-lock')){ cleanup(); return; }
    const t  = e.changedTouches[0];
    const dx = t.clientX - sx;
    const v  = dx / (Date.now()-t0);
    const commit = dx >= W() * 0.5 || v >= COMMIT_V;

    locked = true;
    const ease = `${ANIM_MS}ms cubic-bezier(.25,.46,.45,.94)`;

    if(commit){
      css(curEl, {transition:`transform ${ease}`, transform:`translateX(${W()}px)`});
      if(prevEl) css(prevEl, {transition:`transform ${ease}`,
                               transform:'translateX(0%)'});
      const savedPrev  = prevEl;
      const savedEntry = entry;
      setTimeout(()=>{
        if(savedPrev){ savedPrev.style.display='block'; savedPrev.style.animation='none'; }
        savedEntry.back();
        cleanup();
        if(savedPrev){
          const obs = new MutationObserver(()=>{
            if(!savedPrev.classList.contains('on')){
              savedPrev.style.animation='';
              obs.disconnect();
            }
          });
          obs.observe(savedPrev, {attributes:true, attributeFilter:['class']});
        }
      }, ANIM_MS);
    } else {
      _snapBack();
    }
  }, {passive:true});

  // Clean abort if the system cancels the touch (e.g. notification arrives)
  document.addEventListener('touchcancel', ()=>{
    if(swiping) _snapBack(); else cleanup();
  }, {passive:true});
})();