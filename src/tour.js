// ════════════════════════════════════════
//  FIRST-TIME TUTORIAL
// ════════════════════════════════════════
const TUT_SLIDES = [
  {
    emoji: '🌱',
    title: 'Welcome to My Math Roots!',
    body: `A <strong>K–5 math practice app</strong> built to help students learn, practice, and grow through structured lessons and quizzes. Tap <strong>Next</strong> to continue or <strong>Skip</strong> to jump straight in!`
  },
  {
    emoji: '🗺️',
    title: 'Guided Page Tours',
    body: `Each time you visit a <strong>new page</strong> for the first time, a quick tour highlights every feature — so you always know exactly what to do. Let's start with the home screen!`
  }
];

let _tutIdx = 0;
let _tutShowing = false;     // blocks per-screen spot tours while tutorial is open
let _onboardingActive = false; // blocks swipe gestures during install prompt + tutorial

function _startTutorial(){
  _onboardingActive = true;
  _tutShowing = true;
  _tutIdx = 0;
  _tutRender();
  document.getElementById('tut-overlay').style.display = 'flex';
  document.body.classList.add('tut-active');
  document.body.style.overflow = 'hidden';
  document.body.style.touchAction = 'none';
}

function tutCheckAndShow(){
  // Clear any pre-lock set by _continueAsGuest (will be re-set below if still needed)
  _onboardingActive = false;
  document.body.classList.remove('tut-active');
  // Show install prompt first; tutorial fires after it's dismissed.
  if(!localStorage.getItem('install_seen')){
    _onboardingActive = true;
    document.body.classList.add('tut-active');
    showInstall();
    return;
  }
  if(localStorage.getItem('wb_tutorial_v2')) return;
  _startTutorial();
}

// ── Tutorial spotlight helpers ────────────────────────────────
function _tutSpot(sel){
  let el = null;
  try { el = document.querySelector(sel); } catch(e){}
  if(!el){ _tutClearSpot(); return; }
  const rect = el.getBoundingClientRect();
  if(!rect.width && !rect.height){ _tutClearSpot(); return; }

  const vw = window.innerWidth, vh = window.innerHeight;
  const pad = 12;
  const hx = Math.max(0, rect.left - pad);
  const hy = Math.max(0, rect.top  - pad);
  const hw = Math.min(vw, rect.width  + pad * 2);
  const hh = Math.min(vh, rect.height + pad * 2);
  const rx = 16;

  const svg = document.getElementById('spot-svg');
  svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  svg.setAttribute('width',  vw);
  svg.setAttribute('height', vh);
  document.getElementById('spot-bg-rect').setAttribute('width',  vw);
  document.getElementById('spot-bg-rect').setAttribute('height', vh);
  document.getElementById('spot-dim-rect').setAttribute('width',  vw);
  document.getElementById('spot-dim-rect').setAttribute('height', vh);

  const hole = document.getElementById('spot-hole');
  hole.setAttribute('x', hx); hole.setAttribute('y', hy);
  hole.setAttribute('width', hw); hole.setAttribute('height', hh);
  hole.setAttribute('rx', rx);

  const ring = document.getElementById('spot-ring');
  ring.setAttribute('x', hx - 3); ring.setAttribute('y', hy - 3);
  ring.setAttribute('width', hw + 6); ring.setAttribute('height', hh + 6);
  ring.setAttribute('rx', rx + 3);

  // Hide the spot tooltip card — the tutorial card handles the explanation
  document.getElementById('spot-card').style.display = 'none';
  document.getElementById('spot-overlay').style.display = 'block';

  // Make tutorial overlay transparent so the spotlight dim shows through
  document.getElementById('tut-overlay').style.background = 'transparent';
}

function _tutClearSpot(){
  document.getElementById('spot-overlay').style.display = 'none';
  document.getElementById('spot-card').style.display = '';
  document.getElementById('tut-overlay').style.background = '';
}
// ─────────────────────────────────────────────────────────────

function _tutRender(){
  const slide = TUT_SLIDES[_tutIdx];
  const total = TUT_SLIDES.length;
  document.getElementById('tut-emoji').textContent = slide.emoji;
  document.getElementById('tut-title').textContent = slide.title;
  document.getElementById('tut-body').innerHTML = slide.body;
  // Dots
  const dotsEl = document.getElementById('tut-dots');
  dotsEl.innerHTML = '';
  for(let i=0;i<total;i++){
    const d = document.createElement('div');
    d.className = 'tut-dot' + (i===_tutIdx?' active':'');
    dotsEl.appendChild(d);
  }
  // Buttons
  const nextBtn = document.getElementById('tut-next-btn');
  const skipBtn = document.getElementById('tut-skip-btn');
  const isLast = _tutIdx === total - 1;
  nextBtn.innerHTML = isLast ? "Let's Go! " + _ICO.rocket : 'Next →';
  skipBtn.style.display = isLast ? 'none' : '';
  // Spotlight
  if(slide.spot){ _tutSpot(slide.spot); } else { _tutClearSpot(); }
}

function tutNext(){
  if(_tutIdx < TUT_SLIDES.length - 1){
    _tutIdx++;
    _tutRender();
  } else {
    tutSkip();
  }
}

function tutBack(){
  if(_tutIdx > 0){ _tutIdx--; _tutRender(); }
}

// ── Swipe gesture on tutorial card ───────────────────────────
(function(){
  let _tx = 0, _ty = 0, _dragging = false;
  function _onTutTouchStart(e){
    if(e.touches.length !== 1) return;
    _tx = e.touches[0].clientX;
    _ty = e.touches[0].clientY;
    _dragging = true;
  }
  function _onTutTouchEnd(e){
    if(!_dragging) return;
    _dragging = false;
    const dx = e.changedTouches[0].clientX - _tx;
    const dy = e.changedTouches[0].clientY - _ty;
    if(Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return; // not a horizontal swipe
    if(dx < 0) tutNext(); else tutBack();
  }
  document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('tut-card');
    if(!card) return;
    card.addEventListener('touchstart', _onTutTouchStart, { passive: true });
    card.addEventListener('touchend',   _onTutTouchEnd,   { passive: true });
  });
})();

function tutSkip(){
  localStorage.setItem('wb_tutorial_v2','1');
  _tutShowing = false;
  _onboardingActive = false;
  _tutClearSpot();
  document.getElementById('tut-overlay').style.display = 'none';
  document.body.classList.remove('tut-active');
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
  // Hold scroll lock across the gap between tutorial end and spotlight start
  document.body.classList.add('spot-scroll-lock');
  setTimeout(() => _spotCheckScreen('home'), 350);
}

// ════════════════════════════════════════
//  SCREEN SPOTLIGHT TOUR
// ════════════════════════════════════════
const SPOT_TOURS = {
  'home': [
    {
      sel: '.op-title',
      emoji: '📊',
      title: 'Your Progress',
      tip: 'This bar shows how many lessons you\'ve finished across all 10 units. Watch it grow as you learn!'
    },
    {
      sel: '#streak-badge',
      emoji: '🔥',
      title: 'Daily Streak',
      tip: 'Complete a lesson every day to build your streak! Tap the flame to open your streak calendar — see every day you practiced, your current run, and your all-time best. Only visible when signed in.'
    },
    {
      sel: '#ugrid .cs',
      emoji: '📚',
      title: 'Math Units',
      tip: 'Tap any unit card to open it and start learning. Scroll down to see all 10 units!'
    },
    {
      sel: '.scores-link .big-btn',
      emoji: '🏆',
      title: 'Score History',
      tip: 'Tap here to review every quiz you\'ve taken — see your stars, score, and go back over any questions!'
    },
    {
      sel: '.cog-btn',
      emoji: '⚙️',
      title: 'Settings',
      tip: 'Change your name, appearance, and sounds here. Parents can open controls with a PIN!'
    }
  ],
  'unit-screen': [
    {
      sel: '#lesson-cards .lcard',
      emoji: '📖',
      title: 'Lessons',
      tip: 'Complete lessons in order — each one unlocks the next. Finish all of them to unlock the Unit Quiz!'
    },
    {
      sel: '#uq-btn',
      emoji: '🏆',
      title: 'Unit Quiz',
      tip: 'A 25-question challenge covering everything in this unit. Score 80% or more to unlock the next unit!'
    }
  ],
  'lesson-screen': [
    {
      sel: '.learn-card',
      emoji: '💡',
      title: 'Key Ideas',
      tip: 'Read these facts and rules first — quiz questions are based directly on them!'
    },
    {
      sel: '#ex-card',
      emoji: '📖',
      title: 'Worked Examples',
      tip: 'See problems solved step by step. Tap ✨ New Examples anytime for a fresh set to study!'
    },
    {
      sel: '.practice-card',
      emoji: '✏️',
      title: 'Practice Problems',
      tip: 'Try each problem yourself, then tap 👀 Show Answer to check. Use ➕ More Practice for unlimited extras!'
    },
    {
      sel: '.lq-banner',
      emoji: '🚀',
      title: 'Quiz Time!',
      tip: 'When ready, take the 8-question Lesson Quiz. Score 80% or higher to unlock the next lesson — retry as many times as you need!'
    }
  ],
  'quiz-screen': [
    {
      sel: '#qlbl',
      emoji: '📊',
      title: 'Question Counter',
      tip: 'Shows your current question out of the total. Take your time — read each one carefully!'
    },
    {
      sel: '#qtimer',
      emoji: '⏱️',
      title: 'Quiz Timer',
      tip: 'Counts down your time for this quiz. Parents can turn the timer on/off and adjust the time limit inside Parent Controls!'
    },
    {
      sel: '.quiz-scratch-btn',
      emoji: '✏️',
      title: 'Scratch Pad',
      tip: 'Open a drawing pad to work out problems by hand — just like using paper!'
    },
    {
      sel: '.quiz-restart-btn',
      emoji: '↩️',
      title: 'Start Over',
      tip: 'Restart the quiz from question 1 at any time. Your current attempt will be saved as Abandoned in Score History.'
    },
    {
      sel: '.quiz-quit-btn',
      emoji: '🚪',
      title: 'Quit Quiz',
      tip: 'Exit the quiz early — a confirmation box will appear first. Your attempt is saved as Quit in Score History.'
    }
  ],
  'settings-screen': [
    {
      sel: '[data-action="goParentControls"]',
      emoji: '🔐',
      title: 'Parent Controls',
      tip: 'Set quiz timers, unlock lessons, clear scores, and send feedback. Default PIN: 1234.'
    }
  ],
  'history-screen': [
    {
      sel: '#history-list .hist-card',
      emoji: '📋',
      title: 'Score Entry',
      tip: 'Tap any entry to review your answers and see exactly which questions you got right or wrong!'
    }
  ]
};

let _spotScreen      = null;
let _spotStepIdx     = 0;
let _spotActive      = false;
let _pendingTimerSecs  = 0;
let _pendingTimerColor = '';

function _spotCheckScreen(screenId){
  const _releaseLock = () => document.body.classList.remove('spot-scroll-lock');
  if(_spotActive || _tutShowing || _onboardingActive){ _releaseLock(); return; }
  if(!localStorage.getItem('install_seen')){ _releaseLock(); return; }
  if(!localStorage.getItem('wb_tutorial_v2')){ _releaseLock(); return; }
  if(!SPOT_TOURS[screenId]){ _releaseLock(); return; }
  if(localStorage.getItem('wb_spot_' + screenId)){ _releaseLock(); return; }
  _spotScreen  = screenId;
  _spotStepIdx = 0;
  document.body.classList.add('spot-scroll-lock');
  setTimeout(_spotShowStep, 600);
}

function _spotShowStep(){
  const steps = SPOT_TOURS[_spotScreen];
  if(!steps || _spotStepIdx >= steps.length){ _spotDone(); return; }

  const step = steps[_spotStepIdx];
  // Try to find the element
  let el = null;
  try { el = document.querySelector(step.sel); } catch(e){}
  if(!el){
    // Try fallback selectors for known tricky elements
    if(step.sel.includes('goParentControls')){
      // find the button directly
      document.querySelectorAll('button').forEach(b=>{
        if(b.getAttribute('onclick') && b.getAttribute('onclick').includes('goParentControls')) el = b;
      });
    }
  }
  if(!el){ _spotStepIdx++; _spotShowStep(); return; }

  const rect = el.getBoundingClientRect();
  if(rect.width === 0 && rect.height === 0){ _spotStepIdx++; _spotShowStep(); return; }

  // Scroll the element into view if it's off-screen, then re-measure after scroll settles
  const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
  if(!inView){
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Wait for smooth scroll to finish, then snap spotlight directly (no transition)
    setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        _spotActive = true;
        _spotRender(step, el.getBoundingClientRect(), true);
      }));
    }, 480);
    return;
  }

  // Use double-rAF so layout is fully settled before measuring the final rect
  _spotActive = true;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    _spotRender(step, el.getBoundingClientRect(), false);
  }));
}

function _spotRender(step, rect, snapInstant){
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Ensure card is invisible before we position it (fade-in happens at end)
  document.getElementById('spot-card').style.opacity = '0';

  // Spotlight rectangle — match element dimensions + small padding
  const pad = 10;
  const hx  = Math.max(0, rect.left - pad);
  const hy  = Math.max(0, rect.top  - pad);
  const hw  = Math.min(vw, rect.width  + pad * 2);
  const hh  = Math.min(vh, rect.height + pad * 2);
  const rx  = 16; // rounded corners

  // Center used for card placement
  const cy = rect.top + rect.height / 2;

  // Update SVG dimensions
  const svg = document.getElementById('spot-svg');
  svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  svg.setAttribute('width',  vw);
  svg.setAttribute('height', vh);

  // Update mask background
  const bgRect = document.getElementById('spot-bg-rect');
  bgRect.setAttribute('width',  vw);
  bgRect.setAttribute('height', vh);

  const dimRect = document.getElementById('spot-dim-rect');
  dimRect.setAttribute('width',  vw);
  dimRect.setAttribute('height', vh);

  // Update spotlight hole (rect in mask)
  const hole = document.getElementById('spot-hole');
  const ring = document.getElementById('spot-ring');
  const isFirstShow = document.getElementById('spot-overlay').style.display !== 'block';
  // Lesson/quiz screens need a snappy transition; nav/home screens get a more relaxed pace
  const dur = ['lesson-screen','quiz-screen'].includes(_spotScreen) ? '0.25s' : '0.42s';
  const ease = 'cubic-bezier(0.4,0,0.2,1)';
  const trVal = `x ${dur} ${ease}, y ${dur} ${ease}, width ${dur} ${ease}, height ${dur} ${ease}`;
  if(isFirstShow || snapInstant){
    // Suppress transition: first show or post-scroll — snap directly to final position
    hole.style.transition = 'none'; ring.style.transition = 'none';
  } else {
    hole.style.transition = trVal; ring.style.transition = trVal;
  }
  hole.style.x = hx+'px'; hole.style.y = hy+'px';
  hole.style.width = hw+'px'; hole.style.height = hh+'px';
  hole.setAttribute('rx', rx);
  ring.style.x = (hx-3)+'px'; ring.style.y = (hy-3)+'px';
  ring.style.width = (hw+6)+'px'; ring.style.height = (hh+6)+'px';
  ring.setAttribute('rx', rx+3);
  if(isFirstShow || snapInstant){
    hole.offsetHeight; // force reflow, then apply the correct duration going forward
    hole.style.transition = trVal; ring.style.transition = trVal;
  }

  // Card content
  document.getElementById('spot-emoji').textContent = step.emoji;
  document.getElementById('spot-title').textContent = step.title;
  document.getElementById('spot-tip').textContent   = step.tip;

  const steps   = SPOT_TOURS[_spotScreen];
  const isLast  = _spotStepIdx === steps.length - 1;
  document.getElementById('spot-next-btn').textContent = isLast ? '✓ Got it!' : 'Next →';
  document.getElementById('spot-count').textContent    = `${_spotStepIdx + 1} / ${steps.length}`;

  // Position card: below spotlight if element in top half, above if in bottom half
  const card  = document.getElementById('spot-card');
  const cardW = Math.min(280, vw - 40);
  card.style.width = cardW + 'px';

  const cardLeft = Math.max(20, Math.min((vw - cardW) / 2, vw - cardW - 20));
  card.style.left = cardLeft + 'px';

  // Use a generous height estimate so card + Next button never clips viewport bottom
  const cardH   = 210; // emoji + title + tip (2–3 lines) + btn row + padding
  const gap     = 16;
  const safeTop = 12;
  const safeBot = 16; // minimum gap from bottom of viewport

  let cardTop;
  if(cy < vh * 0.55){
    // Element in upper portion — place card below it
    cardTop = hy + hh + gap;
  } else {
    // Element in lower portion — place card above it
    cardTop = hy - cardH - gap;
  }
  // Hard clamp: never off top, never cut off at bottom
  cardTop = Math.max(safeTop, Math.min(cardTop, vh - cardH - safeBot));
  card.style.transition = `top ${dur} ${ease}, left ${dur} ${ease}, opacity .18s ease`;
  card.style.top = cardTop + 'px';

  document.getElementById('spot-overlay').style.display = 'block';
  // Fade card in (works for both first show and after _spotAdvance fades it out)
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ card.style.opacity = '1'; }));
}

function _spotAdvance(){
  if(!_spotActive) return;
  _spotStepIdx++;
  const steps = SPOT_TOURS[_spotScreen];
  if(!steps || _spotStepIdx >= steps.length){
    _spotDone();
  } else {
    // Fade card out while hole starts sliding to next target
    const card = document.getElementById('spot-card');
    card.style.opacity = '0';
    setTimeout(()=>{ _spotActive = false; _spotShowStep(); }, 160);
  }
}

function _spotDone(){
  const wasScreen = _spotScreen;
  _spotActive = false;
  document.body.classList.remove('spot-scroll-lock');
  if(_spotScreen) localStorage.setItem('wb_spot_' + _spotScreen, '1');
  document.getElementById('spot-overlay').style.display = 'none';
  _spotScreen = null;
  // If quiz tour just finished, start the deferred timer
  if(wasScreen === 'quiz-screen' && _pendingTimerSecs > 0){
    _startTimer(_pendingTimerSecs, _pendingTimerColor);
    _pendingTimerSecs = 0;
    _pendingTimerColor = '';
  }
}
