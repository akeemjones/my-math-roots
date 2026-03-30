// ════════════════════════════════════════
//  HOME
// ════════════════════════════════════════
// ════════════════════════════════════════
// ════════════════════════════════════════
//  CAROUSEL STATE
// ════════════════════════════════════════
const CAR = { idx: 0 };

function buildHome(instant){
  _renderStreak();
  const allL = UNITS_DATA.flatMap(u=>u.lessons).length;
  const doneL = UNITS_DATA.flatMap(u=>u.lessons).filter(l=>
    SCORES.some(s=>s.qid==='lq_'+l.id && s.pct>=80)
  ).length;
  const pct = allL ? Math.round(doneL/allL*100) : 0;
  document.getElementById('op-fill').style.width = pct+'%';
  document.getElementById('op-lbl').textContent = `${doneL} of ${allL} lessons completed — ${pct}%`;

  const allUnlockedEarly = UNITS_DATA.every((u,i) => isUnitUnlocked(i));
  const pausedFTEarly = getPausedQuiz('final_test');
  const finalTestAvailable = allUnlockedEarly || (pausedFTEarly && pausedFTEarly.type === 'final');

  let currentIdx = 0;
  UNITS_DATA.forEach((u,i) => { if(isUnitUnlocked(i)) currentIdx = i; });
  const uDone = UNITS_DATA[currentIdx].lessons.every(l=>
    SCORES.some(s=>s.qid==='lq_'+l.id&&s.pct>=80)) &&
    SCORES.some(s=>s.qid===UNITS_DATA[currentIdx].id+'_uq'&&s.pct>=80);
  if(uDone && currentIdx < UNITS_DATA.length-1) currentIdx++;
  // When the Final Test is available all units are "done" — no active card
  if(finalTestAvailable) currentIdx = -1;
  CAR.idx = Math.max(currentIdx, 0);

  const track = document.getElementById('ugrid');
  track.innerHTML = '';

  UNITS_DATA.forEach((u, i) => {
    const unlocked = isUnitUnlocked(i);
    const dL = u.lessons.filter(l=>SCORES.some(s=>s.qid==='lq_'+l.id&&s.pct>=80)).length;
    const lpct = u.lessons.length ? Math.round(dL/u.lessons.length*100) : 0;
    const uqDone = SCORES.some(s=>s.qid===u.id+'_uq'&&s.pct>=80);
    const isCurrent = (i === currentIdx);
    const slide = document.createElement('div');
    slide.dataset.idx = i;
    if(instant){ slide.style.animation = 'none'; }
    else { slide.style.animationDelay = (i * 30) + 'ms'; }

    if(!unlocked){
      slide.className = 'cs cs-locked-slide';
      slide.style.marginBottom = '8px';
      slide.innerHTML = `<div class="cs-lock-card"${_sr('role="region" aria-label="Unit '+(i+1)+', '+u.name+', locked"')}>
        <div class="cs-lock-ico"${_sr('aria-hidden="true"')}>${u.svg||u.icon}</div>
        <div class="cs-lock-info" data-action="showLockToast" data-arg="Finish Unit ${i} with 80%+ to unlock!" data-arg2="true">
          <div class="cs-lock-label">Unit ${i+1}</div>
          <div class="cs-lock-name">${u.name}</div>
        </div>
        <button type="button" class="cs-pin-unlock-btn" data-action="openUnitPinUnlock" data-arg="${i}" title="Parent unlock"${_sr('aria-label="Parent unlock Unit '+(i+1)+'"')}>${_ICO.lock}</button>
      </div>`;
    } else if(isCurrent){
      slide.className = 'cs cs-active';
      slide.style.setProperty('--uc', u.color);
      slide.style.marginBottom = '12px';
      slide.innerHTML = `<div class="cs-card" style="background:var(--card-bg);cursor:pointer" data-action="openUnit" data-arg="${i}"${_sr('role="region" aria-label="Unit '+(i+1)+', '+u.name+', current, '+dL+' of '+u.lessons.length+' lessons done"')}>
        <div class="cs-label">Unit ${i+1} · Current</div>
        <span class="cs-icon"${_sr('aria-hidden="true"')}>${u.svg||u.icon}</span>
        <div class="cs-name">${u.name}</div>
        <div class="cs-pb"${_sr('role="progressbar" aria-valuenow="'+lpct+'" aria-valuemin="0" aria-valuemax="100" aria-label="'+lpct+'% complete"')}><div class="cs-pbf" style="width:${lpct}%;background:${u.color}"></div></div>
        <div class="cs-stat">${dL}/${u.lessons.length} lessons done${uqDone?' · Unit Quiz ✅':''}</div>
        <div class="cs-enter-btn" style="background:linear-gradient(135deg,${u.color},${u.color}bb)"${_sr('role="button" aria-label="Open Unit '+(i+1)+'"')}>
          Let's Go! →
        </div>
      </div>`;
    } else {
      slide.className = 'cs cs-done';
      slide.style.setProperty('--uc', u.color);
      slide.style.marginBottom = '10px';
      slide.innerHTML = `<div class="cs-card" data-action="openUnit" data-arg="${i}" style="background:var(--card-bg);cursor:pointer"${_sr('role="region" aria-label="Unit '+(i+1)+', '+u.name+', '+dL+' of '+u.lessons.length+' done'+(uqDone?', unit quiz passed':'')+'"')}>
        <div class="cs-label" style="color:${u.color}">Unit ${i+1}${uqDone?' · ✅':''}</div>
        <span class="cs-icon"${_sr('aria-hidden="true"')}>${u.svg||u.icon}</span>
        <div class="cs-name">${u.name}</div>
        <div class="cs-stat">${dL}/${u.lessons.length} done${uqDone?' · Quiz ✅':''}</div>
      </div>`;
    }
    track.appendChild(slide);
  });

  // Final Test card — always visible; unlocked when all units are unlocked (by progress or parent)
  const ftSlide = document.createElement('div');
  const pausedFT = pausedFTEarly;
  const hasPausedFT = pausedFT && pausedFT.type === 'final';
  if(finalTestAvailable){
    ftSlide.className = 'cs cs-active';
    ftSlide.style.setProperty('--uc', '#6c5ce7');
    ftSlide.style.marginBottom = '12px';
    const ftBestScore = SCORES.filter(s=>s.qid==='final_test').sort((a,b)=>b.pct-a.pct)[0];
    const ftScoreLine = ftBestScore
      ? `Best score: ${ftBestScore.pct}% · ${ftBestScore.stars}`
      : '50 questions · All units';
    if(hasPausedFT){
      const ftSecsLeft = _pausedSecsLeft(pausedFT);
      const timeStr = ftSecsLeft && isTimerEnabled()
        ? ' · ⏱ '+Math.floor(ftSecsLeft/60)+':'+String(ftSecsLeft%60).padStart(2,'0')+' left' : '';
      ftSlide.innerHTML = `<div class="cs-card" style="cursor:pointer">
        <div class="cs-label">${_ICO.trophy} Final Test</div>
        <div class="resume-banner" style="margin:4px 0 0" data-action="resumeQuiz" data-arg="final_test">
          <div>
            <div class="resume-banner-h">⏸ Final Test In Progress</div>
            <div class="resume-banner-sub">Question ${pausedFT.idx+1} of ${pausedFT.questions.length} · ${pausedFT.score} correct so far${timeStr}</div>
          </div>
          <button type="button" class="resume-btn" data-action="resumeQuiz" data-arg="final_test">▶ Resume</button>
        </div>
      </div>`;
    } else {
      ftSlide.innerHTML = `<div class="cs-card" style="cursor:pointer" data-action="startFinalTest">
        <div class="cs-label">${_ICO.trophy} All Units Unlocked!</div>
        <span class="cs-icon">${_ICO.graduation}</span>
        <div class="cs-name">Final Test</div>
        <div class="cs-stat">${ftScoreLine}</div>
        <div class="cs-enter-btn" style="background:linear-gradient(135deg,#6c5ce7,#a29bfe)">
          Start Final Test →
        </div>
      </div>`;
    }
  } else {
    ftSlide.className = 'cs cs-locked-slide';
    ftSlide.style.marginBottom = '8px';
    ftSlide.innerHTML = `<div class="cs-lock-card" data-action="showLockToast" data-arg="Unlock all units to take the Final Test!" data-arg2="true">
      <div class="cs-lock-ico">${_ICO.graduation}</div>
      <div class="cs-lock-info">
        <div class="cs-lock-label">Final Test</div>
        <div class="cs-lock-name">50 Questions · All Units</div>
      </div>
      <div style="font-size:var(--fs-lg);flex-shrink:0">${_ICO.lock}</div>
    </div>`;
  }
  ftSlide.dataset.idx = 'final';
  track.appendChild(ftSlide);

  // Scroll to current unit and init focus engine
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const track = document.getElementById('ugrid');
    const wrap = document.getElementById('carousel-wrap');
    if(!track || !wrap) return;
    const slides = track.querySelectorAll('.cs');
    if(slides[currentIdx]){
      let top = 0;
      for(let i=0;i<currentIdx;i++) top += slides[i].offsetHeight + 8;
      wrap.scrollTo({top:Math.max(0,top-8), behavior:'instant'});
    }
    initCarousel();
  }));
}

function refreshHomeState(){
  // 1. Same prologue as buildHome()
  _renderStreak();
  const allL = UNITS_DATA.flatMap(u=>u.lessons).length;
  const doneL = UNITS_DATA.flatMap(u=>u.lessons).filter(l=>
    SCORES.some(s=>s.qid==='lq_'+l.id && s.pct>=80)
  ).length;
  const pct = allL ? Math.round(doneL/allL*100) : 0;
  document.getElementById('op-fill').style.width = pct+'%';
  document.getElementById('op-lbl').textContent = `${doneL} of ${allL} lessons completed — ${pct}%`;

  const allUnlockedEarly = UNITS_DATA.every((u,i) => isUnitUnlocked(i));
  const pausedFTEarly = getPausedQuiz('final_test');
  const finalTestAvailable = allUnlockedEarly || (pausedFTEarly && pausedFTEarly.type === 'final');

  let currentIdx = 0;
  UNITS_DATA.forEach((u,i) => { if(isUnitUnlocked(i)) currentIdx = i; });
  const uDone = UNITS_DATA[currentIdx].lessons.every(l=>
    SCORES.some(s=>s.qid==='lq_'+l.id&&s.pct>=80)) &&
    SCORES.some(s=>s.qid===UNITS_DATA[currentIdx].id+'_uq'&&s.pct>=80);
  if(uDone && currentIdx < UNITS_DATA.length-1) currentIdx++;
  if(finalTestAvailable) currentIdx = -1;
  CAR.idx = Math.max(currentIdx, 0);

  // 2. Guard: fall back to full rebuild if track is not yet populated
  const track = document.getElementById('ugrid');
  if(!track || !track.querySelector('[data-idx]')){ buildHome(); return; }

  // 3. Per-unit card diff
  UNITS_DATA.forEach((u, i) => {
    const slide = track.querySelector('[data-idx="'+i+'"]');
    if(!slide){ buildHome(); return; }

    const unlocked = isUnitUnlocked(i);
    const dL = u.lessons.filter(l=>SCORES.some(s=>s.qid==='lq_'+l.id&&s.pct>=80)).length;
    const lpct = u.lessons.length ? Math.round(dL/u.lessons.length*100) : 0;
    const uqDone = SCORES.some(s=>s.qid===u.id+'_uq'&&s.pct>=80);
    const isCurrent = (i === currentIdx);

    const newState = !unlocked ? 'locked' : isCurrent ? 'active' : 'done';
    const oldState = slide.classList.contains('cs-locked-slide') ? 'locked'
                   : slide.classList.contains('cs-active') ? 'active' : 'done';

    if(newState !== oldState){
      // State transition: swap className + innerHTML for this one slide
      slide.className = 'cs ' + (newState==='locked' ? 'cs-locked-slide' : newState==='active' ? 'cs-active' : 'cs-done');
      slide.style.animation = 'none';
      if(newState === 'locked'){
        slide.style.removeProperty('--uc'); slide.style.marginBottom = '8px';
        slide.innerHTML = `<div class="cs-lock-card"${_sr('role="region" aria-label="Unit '+(i+1)+', '+u.name+', locked"')}>
          <div class="cs-lock-ico"${_sr('aria-hidden="true"')}>${u.svg||u.icon}</div>
          <div class="cs-lock-info" data-action="showLockToast" data-arg="Finish Unit ${i} with 80%+ to unlock!" data-arg2="true">
            <div class="cs-lock-label">Unit ${i+1}</div>
            <div class="cs-lock-name">${u.name}</div>
          </div>
          <button type="button" class="cs-pin-unlock-btn" data-action="openUnitPinUnlock" data-arg="${i}"
            title="Parent unlock"${_sr('aria-label="Parent unlock Unit '+(i+1)+'"')}>${_ICO.lock}</button>
        </div>`;
      } else if(newState === 'active'){
        slide.style.setProperty('--uc', u.color); slide.style.marginBottom = '12px';
        slide.innerHTML = `<div class="cs-card" style="background:var(--card-bg);cursor:pointer" data-action="openUnit" data-arg="${i}"${_sr('role="region" aria-label="Unit '+(i+1)+', '+u.name+', current, '+dL+' of '+u.lessons.length+' lessons done"')}>
          <div class="cs-label">Unit ${i+1} · Current</div>
          <span class="cs-icon"${_sr('aria-hidden="true"')}>${u.svg||u.icon}</span>
          <div class="cs-name">${u.name}</div>
          <div class="cs-pb"${_sr('role="progressbar" aria-valuenow="'+lpct+'" aria-valuemin="0" aria-valuemax="100" aria-label="'+lpct+'% complete"')}><div class="cs-pbf" style="width:${lpct}%;background:${u.color}"></div></div>
          <div class="cs-stat">${dL}/${u.lessons.length} lessons done${uqDone?' · Unit Quiz ✅':''}</div>
          <div class="cs-enter-btn" style="background:linear-gradient(135deg,${u.color},${u.color}bb)"${_sr('role="button" aria-label="Open Unit '+(i+1)+'"')}>Let's Go! →</div>
        </div>`;
      } else {
        slide.style.setProperty('--uc', u.color); slide.style.marginBottom = '10px';
        slide.innerHTML = `<div class="cs-card" data-action="openUnit" data-arg="${i}" style="background:var(--card-bg);cursor:pointer"${_sr('role="region" aria-label="Unit '+(i+1)+', '+u.name+', '+dL+' of '+u.lessons.length+' done'+(uqDone?', unit quiz passed':'')+'"')}>
          <div class="cs-label" style="color:${u.color}">Unit ${i+1}${uqDone?' · ✅':''}</div>
          <span class="cs-icon"${_sr('aria-hidden="true"')}>${u.svg||u.icon}</span>
          <div class="cs-name">${u.name}</div>
          <div class="cs-stat">${dL}/${u.lessons.length} done${uqDone?' · Quiz ✅':''}</div>
        </div>`;
      }
    } else if(newState === 'active'){
      // In-place update: only progress bar + stat text
      const pbf = slide.querySelector('.cs-pbf');
      if(pbf) pbf.style.width = lpct+'%';
      const pb = slide.querySelector('.cs-pb');
      if(pb) pb.setAttribute('aria-valuenow', lpct);
      const stat = slide.querySelector('.cs-stat');
      if(stat) stat.textContent = `${dL}/${u.lessons.length} lessons done${uqDone?' · Unit Quiz ✅':''}`;
    } else if(newState === 'done'){
      // In-place update: label (✅) + stat text
      const lbl = slide.querySelector('.cs-label');
      if(lbl) lbl.textContent = `Unit ${i+1}${uqDone?' · ✅':''}`;
      const stat = slide.querySelector('.cs-stat');
      if(stat) stat.textContent = `${dL}/${u.lessons.length} done${uqDone?' · Quiz ✅':''}`;
    }
    // locked → nothing dynamic
  });

  // 4. Final Test card diff
  const ftSlide = track.querySelector('[data-idx="final"]');
  if(!ftSlide){ buildHome(); return; }

  const pausedFT = pausedFTEarly;
  const hasPausedFT = pausedFT && pausedFT.type === 'final';
  const ftNewState = !finalTestAvailable ? 'locked' : hasPausedFT ? 'paused' : 'available';
  const ftOldState = ftSlide.classList.contains('cs-locked-slide') ? 'locked'
                   : ftSlide.querySelector('.resume-banner') ? 'paused' : 'available';

  if(ftNewState !== ftOldState || ftNewState === 'paused'){
    // Full re-render of FT card; also refreshes paused timer countdown
    ftSlide.className = 'cs ' + (ftNewState === 'locked' ? 'cs-locked-slide' : 'cs-active');
    ftSlide.style.marginBottom = ftNewState === 'locked' ? '8px' : '12px';
    if(ftNewState !== 'locked') ftSlide.style.setProperty('--uc','#6c5ce7');
    const ftBestScore = SCORES.filter(s=>s.qid==='final_test').sort((a,b)=>b.pct-a.pct)[0];
    const ftScoreLine = ftBestScore ? `Best score: ${ftBestScore.pct}% · ${ftBestScore.stars}` : '50 questions · All units';
    if(ftNewState === 'locked'){
      ftSlide.innerHTML = `<div class="cs-lock-card" data-action="showLockToast" data-arg="Unlock all units to take the Final Test!" data-arg2="true">
        <div class="cs-lock-ico">${_ICO.graduation}</div>
        <div class="cs-lock-info"><div class="cs-lock-label">Final Test</div><div class="cs-lock-name">50 Questions · All Units</div></div>
        <div style="font-size:var(--fs-lg);flex-shrink:0">${_ICO.lock}</div>
      </div>`;
    } else if(ftNewState === 'paused'){
      const ftSecsLeft = _pausedSecsLeft(pausedFT);
      const timeStr = ftSecsLeft && isTimerEnabled()
        ? ' · ⏱ '+Math.floor(ftSecsLeft/60)+':'+String(ftSecsLeft%60).padStart(2,'0')+' left' : '';
      ftSlide.innerHTML = `<div class="cs-card" style="cursor:pointer">
        <div class="cs-label">${_ICO.trophy} Final Test</div>
        <div class="resume-banner" style="margin:4px 0 0" data-action="resumeQuiz" data-arg="final_test">
          <div>
            <div class="resume-banner-h">⏸ Final Test In Progress</div>
            <div class="resume-banner-sub">Question ${pausedFT.idx+1} of ${pausedFT.questions.length} · ${pausedFT.score} correct so far${timeStr}</div>
          </div>
          <button type="button" class="resume-btn" data-action="resumeQuiz" data-arg="final_test">▶ Resume</button>
        </div>
      </div>`;
    } else {
      ftSlide.innerHTML = `<div class="cs-card" style="cursor:pointer" data-action="startFinalTest">
        <div class="cs-label">${_ICO.trophy} All Units Unlocked!</div>
        <span class="cs-icon">${_ICO.graduation}</span>
        <div class="cs-name">Final Test</div>
        <div class="cs-stat">${ftScoreLine}</div>
        <div class="cs-enter-btn" style="background:linear-gradient(135deg,#6c5ce7,#a29bfe)">Start Final Test →</div>
      </div>`;
    }
  } else if(ftNewState === 'available'){
    // Same available state — update score line only
    const ftBestScore = SCORES.filter(s=>s.qid==='final_test').sort((a,b)=>b.pct-a.pct)[0];
    const ftScoreLine = ftBestScore ? `Best score: ${ftBestScore.pct}% · ${ftBestScore.stars}` : '50 questions · All units';
    const stat = ftSlide.querySelector('.cs-stat');
    if(stat) stat.textContent = ftScoreLine;
  }

  // 5. Scroll to current card + reinit carousel
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const track2 = document.getElementById('ugrid');
    const wrap = document.getElementById('carousel-wrap');
    if(!track2 || !wrap) return;
    const slides = track2.querySelectorAll('.cs');
    if(slides[CAR.idx]){
      let top = 0;
      for(let i=0; i<CAR.idx; i++) top += slides[i].offsetHeight + 8;
      wrap.scrollTo({top:Math.max(0,top-8), behavior:'instant'});
    }
    initCarousel();
  }));
}

let _carouselInited = false; // kept for compat
function initCarousel(){
  const wrap = document.getElementById('carousel-wrap');
  const track = document.getElementById('ugrid');
  if(!wrap || !track) return;

  // Disconnect any previous observer (guard against repeated buildHome() calls)
  if(window._carouselObserver) window._carouselObserver.disconnect();
  // Remove old scroll listener if present
  if(wrap._carouselScrollHandler){
    wrap.removeEventListener('scroll', wrap._carouselScrollHandler);
    wrap._carouselScrollHandler = null;
  }

  const slides = track.querySelectorAll('.cs');
  window._carouselObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('cs-focused', entry.isIntersecting);
    });
  }, { root: wrap, threshold: 0.6 });

  slides.forEach(slide => window._carouselObserver.observe(slide));
}

function carouselGoTo(idx, smooth=true){
  CAR.idx=idx;
  const slide = document.querySelectorAll('#ugrid .cs')[idx];
  if(slide) slide.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'nearest' });
}

let _skipNextHomeBuild=false;
function goHome(){
  playSwooshBack();
  _carouselInited=false;
  if(!_skipNextHomeBuild){
    const _t=document.getElementById('ugrid');
    if(_t && _t.querySelector('[data-idx]')) refreshHomeState();
    else buildHome();
  } else { _skipNextHomeBuild=false; }
  show('home');
  _maybePushPrompt();
}
function goHistory(){
  playSwooshForward(); buildHistory(); show('history-screen');
}


// ════════════════════════════════════════
//  LOCK TOAST
// ════════════════════════════════════════
function showLockToast(msg, isLock=false){
  if(isLock) playWrong();
  let t = document.getElementById('lock-toast');
  if(!t){ t=document.createElement('div'); t.id='lock-toast'; t.className='lock-toast'; document.body.appendChild(t); }
  t.innerHTML = _ICO.lock + ' ' + msg;
  t.classList.add('show');
  clearTimeout(t._to);
  t._to = setTimeout(()=>t.classList.remove('show'), 2800);
}
