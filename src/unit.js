// ════════════════════════════════════════
//  LOCKED LESSON ACTION SHEET
// ════════════════════════════════════════
function _showLockedSheet(unitIdx, lockedIdx){
  const u = UNITS_DATA[unitIdx];
  const locked = u.lessons[lockedIdx];
  const prevIdx = lockedIdx - 1;
  const prev = u.lessons[prevIdx];
  const prevBest = SCORES.filter(s => s.qid === 'lq_'+prev.id).sort((a,b)=>b.pct-a.pct)[0];
  const prevPct = prevBest ? prevBest.pct : 0;

  // Remove any existing sheet
  const old = document.getElementById('locked-sheet-overlay');
  if(old) old.remove();

  const pctColor = prevPct >= 80 ? '#27ae60' : prevPct >= 50 ? '#e67e22' : '#e74c3c';
  const pctLabel = prevPct >= 80 ? '✅ You passed!' : prevPct > 0 ? `Your best: ${prevPct}%` : 'Not attempted yet';
  const encouragement = prevPct >= 70 ? "You're so close! One more try and you've got it." :
                        prevPct >= 50 ? "You're making great progress — keep going!" :
                        "Review the lesson and try the quiz when you're ready!";

  const ov = document.createElement('div');
  ov.id = 'locked-sheet-overlay';
  ov.innerHTML = `
    <div class="locked-sheet" id="locked-sheet">
      <div class="locked-sheet-handle"></div>
      <div class="locked-sheet-lock" style="color:${u.color}">🔒</div>
      <div class="locked-sheet-title">${locked.icon} ${locked.title}</div>
      <div class="locked-sheet-sub">This lesson is locked</div>
      <div class="locked-sheet-req">
        To unlock, score <strong>80%+</strong> on the <strong>${prev.icon} ${prev.title}</strong> quiz
      </div>
      <div class="locked-sheet-score" style="color:${pctColor}">${pctLabel}</div>
      <div class="locked-sheet-enc">${encouragement}</div>
      <button class="locked-sheet-cta" style="background:${u.color}" onclick="_closeLockedSheet();openLesson(${unitIdx},${prevIdx})">
        ${prevPct > 0 ? '🔄 Try That Quiz Again' : '📖 Go to ' + prev.title}
      </button>
      <button class="locked-sheet-dismiss" onclick="_closeLockedSheet()">Come Back Later</button>
    </div>`;
  ov.onclick = (e)=>{ if(e.target===ov) _closeLockedSheet(); };
  document.body.appendChild(ov);
  playWrong();
  requestAnimationFrame(()=> ov.classList.add('locked-sheet-in'));
}
function _closeLockedSheet(){
  const ov = document.getElementById('locked-sheet-overlay');
  if(!ov) return;
  ov.classList.remove('locked-sheet-in');
  setTimeout(()=> ov.remove(), 280);
}

// ════════════════════════════════════════
//  UNIT SCREEN
// ════════════════════════════════════════
function openUnit(idx){
  playSwooshForward();
  // Never block returning to the unit just completed (guards against race condition when session expires mid-quiz)
  if(idx !== CUR.unitIdx && !isUnitUnlocked(idx)){ showLockToast(`Finish Unit ${idx} with 80%+ first!`, true); return; }
  CUR.unitIdx = idx;
  const u = UNITS_DATA[idx];
  document.getElementById('unit-back').style.color = u.color;
  document.getElementById('unit-bar-title').textContent = u.name;
  document.getElementById('unit-banner').style.background = `linear-gradient(135deg,${u.color},${u.color}cc)`;
  document.getElementById('unit-banner').innerHTML = `
    <h2${_sr('aria-label="Unit '+(idx+1)+', '+u.name+'"')}><span style="display:inline-block;width:1.5em;height:1.5em;vertical-align:middle"${_sr('aria-hidden="true"')}>${u.svg||u.icon}</span> ${u.name}</h2>
    <p>${u.lessons.length} lessons to explore</p>
    <div class="unit-teks">${u.teks}</div>`;

  const lc = document.getElementById('lesson-cards');
  lc.innerHTML = '';
  u.lessons.forEach((l, i) => {
    const unlocked = isLessonUnlocked(idx, i);
    const lqBest = SCORES.filter(s=>s.qid==='lq_'+l.id).sort((a,b)=>b.pct-a.pct)[0];
    const lqPct = lqBest ? lqBest.pct : 0;
    const lqDone = lqPct >= 80;
    const lqHistory = SCORES.filter(s=>s.qid==='lq_'+l.id);
    const avgPct = lqHistory.length ? Math.round(lqHistory.reduce((s,x)=>s+x.pct,0)/lqHistory.length) : null;
    const masteryBadge = avgPct!==null ? `<span class="badge" style="background:${avgPct>=80?'#eafaf1':avgPct>=50?'#fef6ec':'#fef0f0'};color:${avgPct>=80?'#1e8449':avgPct>=50?'#d35400':'#c0392b'}">${avgPct}% avg</span>` : '';
    const card = document.createElement('div');

    if(unlocked){
      card.className = 'lcard';
      card.setAttribute('role', document.body.classList.contains('a11y-screenreader') ? 'button' : '');
      if(document.body.classList.contains('a11y-screenreader')) card.setAttribute('aria-label', 'Lesson '+(i+1)+', '+l.title+(lqDone?', completed':lqPct>0?', best score '+lqPct+'%':''));
      card.innerHTML = `
        <div class="lcard-num" style="background:${u.color}"${_sr('aria-hidden="true"')}>${i+1}</div>
        <div class="lcard-info">
          <div class="lcard-title">${l.icon} ${l.title}</div>
          <div class="lcard-desc">${l.desc}</div>
        </div>
        <div class="lcard-badges">
          ${lqDone ? '<span class="badge badge-done">Passed ✅</span>' : lqPct>0 ? `<span class="badge" style="background:#fef9e7;color:#d4ac0d">Best: ${lqPct}%</span>` : ''}
          ${masteryBadge}
        </div>`;
      card.onclick = () => openLesson(idx, i);
    } else {
      card.className = 'lcard lcard-locked';
      if(document.body.classList.contains('a11y-screenreader')) card.setAttribute('aria-label', 'Lesson '+(i+1)+', '+l.title+', locked');
      card.innerHTML = `
        <div class="lcard-num" style="background:#aab;color:#fff"${_sr('aria-hidden="true"')}>${i+1}</div>
        <div class="lcard-info">
          <div class="lcard-title" style="color:var(--txt2)">
            <span style="filter:grayscale(1);opacity:.45">${l.icon}</span> ${l.title}
          </div>
          <div class="lcard-desc">${lqPct > 0 ? `Score 80%+ to unlock → Your best: ${lqPct}%` : `Score 80%+ on Lesson ${i+1} quiz to unlock`}</div>
        </div>
        <div class="lcard-badges">
          <span class="cs-lock-hint" data-locked-lesson="${idx}_${i}">${_ICO.lock}</span>
        </div>`;
      card.onclick = () => _showLockedSheet(idx, i);
    }
    lc.appendChild(card);
  });

  // Unit quiz — unlocked when all lessons are 80%+
  const uqUnlocked = isUnitQuizUnlocked(idx);
  const uqBest = SCORES.filter(s=>s.qid===u.id+'_uq').sort((a,b)=>b.pct-a.pct)[0];
  const uqPct = uqBest ? uqBest.pct : 0;
  // Check for paused unit quiz
  const pausedUQ = getPausedQuiz(u.id+'_uq');
  const hasPausedUQ = !!pausedUQ;
  const uqBtn = document.getElementById('uq-btn');
  const uqResumeArea = document.getElementById('uq-resume-area');
  uqBtn.querySelector('h3').style.color = uqUnlocked ? u.color : '#aab';
  if(uqUnlocked && hasPausedUQ){
    // Show resume banner, hide the start button
    const pq = pausedUQ;
    const pqSecsLeft = _pausedSecsLeft(pq);
    const timeStr = pqSecsLeft && isTimerEnabled()
      ? ' · ⏱ '+Math.floor(pqSecsLeft/60)+':'+String(pqSecsLeft%60).padStart(2,'0')+' left' : '';
    uqResumeArea.innerHTML = `<div class="resume-banner" style="margin-bottom:12px;cursor:pointer" onclick="resumeQuiz('${u.id}_uq')">
      <div>
        <div class="resume-banner-h">⏸ Unit Quiz In Progress</div>
        <div class="resume-banner-sub">Question ${pq.idx+1} of ${pq.questions.length} · ${pq.score} correct so far${timeStr}</div>
      </div>
      <button type="button" class="resume-btn" onclick="resumeQuiz('${u.id}_uq')">▶ Resume</button>
    </div>`;
    uqBtn.style.display = 'none';
  } else if(uqUnlocked){
    uqBtn.style.display = '';
    uqBtn.style.opacity = '1';
    const nextUnitIdx = idx + 1;
    const hasNextUnit = nextUnitIdx < UNITS_DATA.length;
    if(uqPct >= 80 && hasNextUnit){
      const nu = UNITS_DATA[nextUnitIdx];
      document.getElementById('uq-ico').textContent = nu.icon;
      document.getElementById('uq-h3').textContent = `Next Unit: ${nu.name} →`;
      document.getElementById('uq-h3').style.color = nu.color;
      document.getElementById('uq-p').textContent = `Unit quiz passed ✅ ${uqPct}%`;
      uqBtn.onclick = () => openUnit(nextUnitIdx);
      uqResumeArea.innerHTML = `<div style="text-align:center;margin-bottom:6px">
        <button type="button" style="background:none;border:none;color:#999;font-size:.82rem;cursor:pointer;text-decoration:underline;font-family:inherit" onclick="event.stopPropagation();startUnitQuiz(${idx})">↩ Retake Unit Quiz</button>
      </div>`;
    } else {
      uqResumeArea.innerHTML = '';
      document.getElementById('uq-ico').textContent = uqPct>=80 ? '✅' : '▶️';
      document.getElementById('uq-h3').textContent = 'Unit Quiz — 25 Questions';
      document.getElementById('uq-h3').style.color = u.color;
      document.getElementById('uq-p').textContent = uqPct>0 ? `Best score: ${uqPct}% — need 80%+ to unlock next unit` : 'Test everything you learned in this unit!';
      uqBtn.onclick = () => startUnitQuiz(idx);
    }
  } else {
    uqResumeArea.innerHTML = '';
    uqBtn.style.display = '';
    document.getElementById('uq-ico').innerHTML = _ICO.lock;
    uqBtn.querySelector('p').textContent = 'Complete all lessons with 80%+ to unlock';
    uqBtn.style.opacity = '.6';
    uqBtn.onclick = () => showLockToast('Get 80%+ on all lessons to unlock the unit quiz!', true);
  }

  show('unit-screen');
}


function goUnit(){ playSwooshBack(); openUnit(CUR.unitIdx); }

// ════════════════════════════════════════
//  CARRY ANIMATION (Unit 3 L1 Example 2)
// ════════════════════════════════════════
function playCarryAnim(btn){
  const exDiv = btn.closest('.ex');
  const stepsDiv = exDiv.querySelector('.ex-steps');

  const STEPS = [
    { label:'👀 Let\'s solve <b>47 + 36</b> step by step!',
      hi:[], show:[], btn:'▶ Start' },
    { label:'🔍 <b>ONES column first.</b> What is 7 + 6?',
      hi:['o1','o2'], show:[], btn:'Next ▶' },
    { label:'💥 7 + 6 = <b>13</b> — that\'s 10 or more!<br>We can\'t fit 13 in the ones place alone.',
      hi:['o1','o2'], show:[], btn:'Next ▶' },
    { label:'✏️ Write the <b>3</b> in the ones place of the answer.',
      hi:['o1','o2','r-ones'], show:['r-ones'], btn:'Next ▶' },
    { label:'⬆️ Carry the <b>1</b> up to the tens column!',
      hi:['carry'], show:['carry'], pop:'carry', btn:'Next ▶' },
    { label:'🔍 <b>TENS column next.</b> Add: 1 (carried) + 4 + 3 = ?',
      hi:['carry','t1','t2'], show:['carry'], btn:'Next ▶' },
    { label:'✅ 1 + 4 + 3 = <b>8</b> — write 8 in the tens place!',
      hi:['carry','t1','t2','r-tens'], show:['carry','r-tens'], pop:'r-tens', btn:'Next ▶' },
    { label:'🎉 <b>47 + 36 = 83</b> ✅ You solved it!',
      hi:['carry','t1','t2','o1','o2','r-ones','r-tens'], show:['carry','r-ones','r-tens'], btn:'Again 🔄', final:true },
  ];

  let step = 0;

  stepsDiv.innerHTML = `
    <div class="cca-wrap" id="cca-root">
      <table class="col-math" style="margin:0 auto">
        <tr class="cm-carry">
          <td></td>
          <td id="cca-carry" class="cca-ghost">1</td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td id="cca-t1">4</td>
          <td id="cca-o1">7</td>
        </tr>
        <tr class="cm-bottom">
          <td class="cm-op">+</td>
          <td id="cca-t2">3</td>
          <td id="cca-o2">6</td>
        </tr>
        <tr class="cm-line"><td colspan="3"><hr></td></tr>
        <tr class="cm-result">
          <td></td>
          <td id="cca-r-tens" class="cca-ghost" style="border-top:none">8</td>
          <td id="cca-r-ones" class="cca-ghost" style="border-top:none">3</td>
        </tr>
      </table>
      <div class="cca-label" id="cca-label">Tap Start to begin!</div>
      <button class="cca-btn" id="cca-btn" style="background:#e67e22" onclick="advanceCarryAnim()">▶ Start</button>
    </div>`;

  window._ccaStep = 0;
  window.advanceCarryAnim = function(){
    const s = STEPS[window._ccaStep];
    if(!s) return;

    // Update label
    document.getElementById('cca-label').innerHTML = s.label;

    // Clear all highlights
    ['carry','t1','t2','o1','o2','r-ones','r-tens'].forEach(id => {
      const el = document.getElementById('cca-'+id);
      if(el){ el.classList.remove('cca-hi','cca-hi-red','cca-pop','cca-bounce'); }
    });

    // Apply highlights
    s.hi.forEach(id => {
      const el = document.getElementById('cca-'+id);
      if(el) el.classList.add(id==='carry'?'cca-hi-red':'cca-hi');
    });

    // Show/hide cells
    ['carry','r-ones','r-tens'].forEach(id => {
      const el = document.getElementById('cca-'+id);
      if(!el) return;
      if(s.show && s.show.includes(id)){
        el.classList.remove('cca-ghost');
        el.classList.add('cca-show');
        if(s.pop===id) setTimeout(()=>el.classList.add('cca-pop'),10);
      } else {
        el.classList.add('cca-ghost');
        el.classList.remove('cca-show');
      }
    });

    // Update button
    const btnEl = document.getElementById('cca-btn');
    if(btnEl){
      btnEl.textContent = s.btn;
      if(s.final){
        btnEl.onclick = () => playCarryAnim(btnEl);
      }
    }

    window._ccaStep++;
  };

  // Auto-advance to step 0 content
  advanceCarryAnim();
}

// ════════════════════════════════════════
//  3-DIGIT CARRY ANIMATION (Unit 4 L1)
// ════════════════════════════════════════
function play3dCarry(btn, top, bot){
  const exDiv = btn.closest('.ex');
  const stepsDiv = exDiv.querySelector('.ex-steps');

  // Unique prefix per instance so two animations never share DOM IDs
  window._cc3n = (window._cc3n||0) + 1;
  const p = 'cc3_' + window._cc3n;

  const [h1,t1,o1]=top, [h2,t2,o2]=bot;
  const oSum=o1+o2, oR=oSum%10, oC=oSum>=10?1:0;
  const tSum=t1+t2+oC, tR=tSum%10, tC=tSum>=10?1:0;
  const hR=h1+h2+tC;
  const pStr=`${h1}${t1}${o1} + ${h2}${t2}${o2}`;
  const aStr=`${hR}${tR}${oR}`;

  const STEPS=[
    {label:`👀 Let's solve <b>${pStr}</b> step by step!`, hi:[], show:[], btn:'▶ Start'},
    {label:`🔍 <b>ONES column first.</b> What is ${o1} + ${o2}?`, hi:['o1','o2'], show:[], btn:'Next ▶'},
    {label:`💥 ${o1} + ${o2} = <b>${oSum}</b> — write <b>${oR}</b>${oC?', carry <b>1</b>!':'. No carry!'}`,
     hi:['o1','o2','r-o'], show:['r-o'], pop:'r-o', btn:'Next ▶'},
  ];

  if(oC) STEPS.push({
    label:`⬆️ Carry the <b>1</b> up to the tens column!`,
    hi:['c-t'], show:['c-t','r-o'], pop:'c-t', btn:'Next ▶'
  });

  STEPS.push({
    label:`🔍 <b>TENS column:</b> ${t1} + ${t2}${oC?' + 1(carried)':''} = <b>${tSum}</b> — write <b>${tR}</b>${tC?', carry <b>1</b>!':'. No carry!'}`,
    hi:[...(oC?['c-t']:[]),'t1','t2','r-t'],
    show:[...(oC?['c-t']:[]),'r-o','r-t'], pop:'r-t', btn:'Next ▶'
  });

  if(tC) STEPS.push({
    label:`⬆️ Carry the <b>1</b> up to the hundreds column!`,
    hi:['c-h'], show:[...(oC?['c-t']:[]),'c-h','r-o','r-t'], pop:'c-h', btn:'Next ▶'
  });

  STEPS.push({
    label:`🔍 <b>HUNDREDS column:</b> ${h1} + ${h2}${tC?' + 1(carried)':''} = <b>${hR}</b>. Write <b>${hR}</b>!`,
    hi:[...(tC?['c-h']:[]),'h1','h2','r-h'],
    show:[...(oC?['c-t']:[]),...(tC?['c-h']:[]),'r-o','r-t','r-h'], pop:'r-h', btn:'Next ▶'
  });

  STEPS.push({
    label:`🎉 <b>${pStr} = ${aStr}</b> ✅ You solved it!`,
    hi:['h1','t1','o1','h2','t2','o2','r-h','r-t','r-o',...(oC?['c-t']:[]),...(tC?['c-h']:[])],
    show:[...(oC?['c-t']:[]),...(tC?['c-h']:[]),'r-h','r-t','r-o'],
    btn:'Again 🔄', final:true
  });

  stepsDiv.innerHTML=`
    <div class="cca-wrap">
      <table class="col-math" style="margin:0 auto">
        <tr class="cm-carry">
          <td></td>
          <td id="${p}-c-h" class="cca-ghost">${tC?'1':''}</td>
          <td id="${p}-c-t" class="cca-ghost">${oC?'1':''}</td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td id="${p}-h1">${h1}</td>
          <td id="${p}-t1">${t1}</td>
          <td id="${p}-o1">${o1}</td>
        </tr>
        <tr class="cm-bottom">
          <td class="cm-op">+</td>
          <td id="${p}-h2">${h2}</td>
          <td id="${p}-t2">${t2}</td>
          <td id="${p}-o2">${o2}</td>
        </tr>
        <tr class="cm-line"><td colspan="4"><hr></td></tr>
        <tr class="cm-result">
          <td></td>
          <td id="${p}-r-h" class="cca-ghost" style="border-top:none">${hR}</td>
          <td id="${p}-r-t" class="cca-ghost" style="border-top:none">${tR}</td>
          <td id="${p}-r-o" class="cca-ghost" style="border-top:none">${oR}</td>
        </tr>
      </table>
      <div class="cca-label" id="${p}-label">Tap Start to begin!</div>
      <button class="cca-btn" id="${p}-btn" style="background:#d35400" onclick="window['${p}_adv']()">▶ Start</button>
    </div>`;

  const allIds=['h1','t1','o1','h2','t2','o2','r-h','r-t','r-o','c-t','c-h'];
  const showIds=['r-h','r-t','r-o','c-t','c-h'];
  let step=0;

  window[p+'_adv']=function(){
    const s=STEPS[step];
    if(!s) return;
    document.getElementById(p+'-label').innerHTML=s.label;
    allIds.forEach(id=>{
      const el=document.getElementById(p+'-'+id);
      if(el) el.classList.remove('cca-hi','cca-hi-red','cca-pop','cca-bounce');
    });
    s.hi.forEach(id=>{
      const el=document.getElementById(p+'-'+id);
      if(el) el.classList.add(id.startsWith('c-')?'cca-hi-red':'cca-hi');
    });
    showIds.forEach(id=>{
      const el=document.getElementById(p+'-'+id);
      if(!el) return;
      if(s.show&&s.show.includes(id)){
        el.classList.remove('cca-ghost'); el.classList.add('cca-show');
        if(s.pop===id) setTimeout(()=>el.classList.add('cca-pop'),10);
      } else {
        el.classList.add('cca-ghost'); el.classList.remove('cca-show');
      }
    });
    const btnEl=document.getElementById(p+'-btn');
    if(btnEl){
      btnEl.textContent=s.btn;
      if(s.final) btnEl.onclick=()=>play3dCarry(btnEl,top,bot);
    }
    step++;
  };

  window[p+'_adv']();
}

// ════════════════════════════════════════
//  BORROW ANIMATION (Unit 3 L2 Example 2)
// ════════════════════════════════════════
function playBorrowAnim(btn){
  const exDiv = btn.closest('.ex');
  const stepsDiv = exDiv.querySelector('.ex-steps');

  const STEPS = [
    { label:'👀 Let\'s solve <b>73 − 28</b> step by step!',
      hi:[], show:[], btn:'▶ Start' },
    { label:'🔍 <b>ONES column first.</b> Can we do 3 − 8?',
      hi:['o1','o2'], show:[], btn:'Next ▶' },
    { label:'😬 3 is less than 8 — <b>not enough!</b><br>We need to BORROW a ten.',
      hi:['o1','o2','t1'], show:[], btn:'Next ▶' },
    { label:'⬅️ Borrow 1 ten from the tens place:<br><b>7 becomes 6</b>, ones becomes <b>13</b>.',
      hi:['b-tens','b-ones','t1'], show:['b-tens','b-ones'], pop:'b-ones', btn:'Next ▶' },
    { label:'✏️ Now: 13 − 8 = <b>5</b>. Write 5 in the ones place.',
      hi:['b-ones','o2','r-ones'], show:['b-tens','b-ones','r-ones'], pop:'r-ones', btn:'Next ▶' },
    { label:'🔍 <b>TENS column:</b> 6 − 2 = <b>4</b>. Write 4 in the tens place.',
      hi:['b-tens','t2','r-tens'], show:['b-tens','b-ones','r-ones','r-tens'], pop:'r-tens', btn:'Next ▶' },
    { label:'🎉 <b>73 − 28 = 45</b> ✅ You solved it!',
      hi:['b-tens','b-ones','t1','t2','o1','o2','r-ones','r-tens'],
      show:['b-tens','b-ones','r-ones','r-tens'], btn:'Again 🔄', final:true },
  ];

  stepsDiv.innerHTML = `
    <div class="cca-wrap" id="ccb-root">
      <table class="col-math" style="margin:0 auto">
        <tr class="cm-carry">
          <td></td>
          <td id="ccb-b-tens" class="cca-ghost">6</td>
          <td id="ccb-b-ones" class="cca-ghost">13</td>
        </tr>
        <tr>
          <td></td>
          <td id="ccb-t1">7</td>
          <td id="ccb-o1">3</td>
        </tr>
        <tr class="cm-bottom">
          <td class="cm-op">−</td>
          <td id="ccb-t2">2</td>
          <td id="ccb-o2">8</td>
        </tr>
        <tr class="cm-line"><td colspan="3"><hr></td></tr>
        <tr class="cm-result">
          <td></td>
          <td id="ccb-r-tens" class="cca-ghost" style="border-top:none">4</td>
          <td id="ccb-r-ones" class="cca-ghost" style="border-top:none">5</td>
        </tr>
      </table>
      <div class="cca-label" id="ccb-label">Tap Start to begin!</div>
      <button class="cca-btn" id="ccb-btn" style="background:#e67e22" onclick="advanceBorrowAnim()">▶ Start</button>
    </div>`;

  const allIds = ['b-tens','b-ones','t1','t2','o1','o2','r-ones','r-tens'];
  const showIds = ['b-tens','b-ones','r-ones','r-tens'];

  window._ccbStep = 0;
  window.advanceBorrowAnim = function(){
    const s = STEPS[window._ccbStep];
    if(!s) return;

    document.getElementById('ccb-label').innerHTML = s.label;

    allIds.forEach(id => {
      const el = document.getElementById('ccb-'+id);
      if(el) el.classList.remove('cca-hi','cca-hi-red','cca-pop','cca-bounce');
    });

    s.hi.forEach(id => {
      const el = document.getElementById('ccb-'+id);
      if(el) el.classList.add('cca-hi');
    });

    showIds.forEach(id => {
      const el = document.getElementById('ccb-'+id);
      if(!el) return;
      if(s.show && s.show.includes(id)){
        el.classList.remove('cca-ghost');
        el.classList.add('cca-show');
        if(s.pop===id) setTimeout(()=>el.classList.add('cca-pop'),10);
      } else {
        el.classList.add('cca-ghost');
        el.classList.remove('cca-show');
      }
    });

    const btnEl = document.getElementById('ccb-btn');
    if(btnEl){
      btnEl.textContent = s.btn;
      if(s.final) btnEl.onclick = ()=>playBorrowAnim(btnEl);
    }

    window._ccbStep++;
  };

  advanceBorrowAnim();
}

// ════════════════════════════════════════
//  EXAMPLE RENDERER
// ════════════════════════════════════════
function renderEx(ex, i){
  return `<div class="ex" style="--exc:${ex.c};--exbg:${ex.c}0d">
    <div class="ex-tag">Example ${i+1}: ${ex.tag}</div>
    <div class="ex-problem">${ex.p}</div>
    ${ex.vis ? `<div class="vis-box">${makeVis(ex.vis)}</div>` : ''}
    <div class="ex-steps">${ex.s.replace(/\n/g,'<br>')}</div>
    <div class="ex-answer">${ex.a}</div>
  </div>`;
}

function refreshExamples(unitIdx, lessonIdx){
  const u = UNITS_DATA[unitIdx];
  const l = u.lessons[lessonIdx];
  const list = document.getElementById('ex-list');
  if(!list) return;
  if(l.examples.length){
    const idx = parseInt(list.dataset.exIdx||'1') % l.examples.length;
    const batch = l.examples.slice(idx, idx+1);
    list.dataset.exIdx = String(idx+1);
    list.innerHTML = batch.map((ex,i)=>renderEx(ex,idx+i)).join('');
    list.style.opacity='0';
    setTimeout(()=>{ list.style.transition='opacity .3s'; list.style.opacity='1'; },10);
    return;
  }
  const generated = generateExamples(l.id, u.color);
  if(!generated) return;
  list.innerHTML = generated.map((ex,i)=>renderEx(ex,i)).join('');
  list.style.opacity='0';
  setTimeout(()=>{ list.style.transition='opacity .3s'; list.style.opacity='1'; },10);
}

function generateExamples(lessonId, color){
  const r = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
  const emoji = ['🍎','🌟','🎈','🐸','🍪','🦋','🍓','🎮','🐶','🌈'][r(0,9)];

  if(lessonId==='u1l1'){
    const a=r(1,15),b=r(1,9),big=Math.max(a,b),sm=Math.min(a,b);
    const a2=r(5,20),b2=r(1,8);
    return [
      {c:color,tag:'Counting ON to Add',p:`${big} + ${sm} = ?`,
       s:`Start at ${big}, count on ${sm} more: ${Array.from({length:sm},(_,i)=>big+i+1).join(' → ')}`,
       a:`${big} + ${sm} = ${big+sm} ✅`,vis:`add:${emoji}:${big}:${sm}`},
      {c:color,tag:'Counting ON to Add',p:`${a2} + ${b2} = ?`,
       s:`Start at ${a2}, count on ${b2} more: ${Array.from({length:b2},(_,i)=>a2+i+1).join(' → ')}`,
       a:`${a2} + ${b2} = ${a2+b2} ✅`},
      {c:'#c0392b',tag:'Counting BACK to Subtract',p:`${a2+b2} - ${b2} = ?`,
       s:`Start at ${a2+b2}, count back ${b2}: ${Array.from({length:b2},(_,i)=>a2+b2-i-1).join(' → ')}`,
       a:`${a2+b2} - ${b2} = ${a2} ✅`,vis:`sub:${emoji}:${a2+b2}:${b2}`},
    ];
  }

  if(lessonId==='u1l2'){
    const n=r(2,12), nd=r(2,11);
    return [
      {c:color,tag:'Doubles Fact',p:`${n} + ${n} = ?`,
       s:`${n} doubled = ${n*2}. Both groups are the same!`,
       a:`${n} + ${n} = ${n*2} ✅`,vis:`doubles:${emoji}:${n}`},
      {c:color,tag:'Near Double',p:`${nd} + ${nd+1} = ?`,
       s:`Use ${nd}+${nd}=${nd*2}, then add 1 more → ${nd*2+1}`,
       a:`${nd} + ${nd+1} = ${nd*2+1} ✅`},
      {c:color,tag:'Near Double',p:`${nd+1} + ${nd} = ?`,
       s:`Use ${nd}+${nd}=${nd*2}, then add 1 more → ${nd*2+1}`,
       a:`${nd+1} + ${nd} = ${nd*2+1} ✅`},
    ];
  }

  if(lessonId==='u1l3'){
    const base=r(6,9), add=r(2,7);
    const need=10-base;
    const rest=add>need?add-need:0;
    const base2=r(6,8), add2=r(3,6);
    const need2=10-base2, rest2=add2>need2?add2-need2:0;
    return [
      {c:color,tag:'Make a Ten',p:`${base} + ${add} = ?`,
       s:`${base} needs ${need} to reach 10.\n${base}+${need}=10, then +${rest>0?rest:'0'}=${base+add}`,
       a:`${base} + ${add} = ${base+add} ✅`,vis:`tenframe:${base}`},
      {c:color,tag:'Make a Ten',p:`${base2} + ${add2} = ?`,
       s:`${base2} needs ${need2} to reach 10.\n${base2}+${need2}=10, then +${rest2>0?rest2:'0'}=${base2+add2}`,
       a:`${base2} + ${add2} = ${base2+add2} ✅`,vis:`tenframe:${base2}`},
    ];
  }

  if(lessonId==='u1l4'){
    const a=r(2,9), b=r(2,9), sum=a+b;
    const a2=r(3,8), b2=r(3,8), sum2=a2+b2;
    return [
      {c:color,tag:`Fact Family: ${a}, ${b}, ${sum}`,p:'4 related facts:',
       s:`[ ${a} + ${b} = ${sum} ]\n[ ${b} + ${a} = ${sum} ]\n[ ${sum} − ${a} = ${b} ]\n[ ${sum} − ${b} = ${a} ]`,
       a:`All 4 use the same 3 numbers! ✅`},
      {c:color,tag:`Fact Family: ${a2}, ${b2}, ${sum2}`,p:'4 related facts:',
       s:`[ ${a2} + ${b2} = ${sum2} ]\n[ ${b2} + ${a2} = ${sum2} ]\n[ ${sum2} − ${a2} = ${b2} ]\n[ ${sum2} − ${b2} = ${a2} ]`,
       a:`The 3 numbers are ${a2}, ${b2}, and ${sum2} ✅`},
    ];
  }

  if(lessonId==='u2l1'){
    const h=r(1,9),t=r(0,9),o=r(0,9);
    const h2=r(1,9),t2=r(0,9),o2=r(0,9);
    return [
      {c:color,tag:'Place Value',p:`What is the value of each digit in ${h}${t}${o}?`,
       s:`Hundreds: ${h} → ${h*100}\nTens: ${t} → ${t*10}\nOnes: ${o} → ${o}`,
       a:`${h*100} + ${t*10} + ${o} = ${h*100+t*10+o} ✅`},
      {c:color,tag:'Place Value',p:`What is the value of each digit in ${h2}${t2}${o2}?`,
       s:`Hundreds: ${h2} → ${h2*100}\nTens: ${t2} → ${t2*10}\nOnes: ${o2} → ${o2}`,
       a:`${h2*100} + ${t2*10} + ${o2} = ${h2*100+t2*10+o2} ✅`},
    ];
  }

  if(lessonId==='u2l2'){
    const n=r(100,999), h=Math.floor(n/100), t=Math.floor((n%100)/10), o=n%10;
    const n2=r(100,999), h2=Math.floor(n2/100), t2=Math.floor((n2%100)/10), o2=n2%10;
    return [
      {c:color,tag:'Expanded Form',p:`Write ${n} in expanded form`,
       s:`${h} hundreds + ${t} tens + ${o} ones`,a:`${h*100} + ${t*10} + ${o} = ${n} ✅`},
      {c:color,tag:'Standard Form',p:`${h2*100} + ${t2*10} + ${o2} = ?`,
       s:`${h2} hundreds, ${t2} tens, ${o2} ones`,a:`${n2} ✅`},
    ];
  }

  if(lessonId==='u2l3'){
    const a=r(100,999), b=r(100,999);
    const a2=r(100,999), b2=r(100,999);
    return [
      {c:color,tag:'Compare Numbers',p:`${a} vs ${b}: which is ${a>b?'greater':'less'}?`,
       s:'Hundreds: '+Math.floor(a/100)+' vs '+Math.floor(b/100)+(Math.floor(a/100)===Math.floor(b/100)?' (same! tens: '+Math.floor((a%100)/10)+' vs '+Math.floor((b%100)/10)+')':''),
       a:`${a} ${a>b?'>':'<'} ${b} ✅`},
      {c:color,tag:'Order Numbers',p:`Order from least to greatest: ${[a2,b2,Math.floor((a2+b2)/2)].join(', ')}`,
       s:`Compare hundreds first, then tens, then ones`,
       a:`${[a2,b2,Math.floor((a2+b2)/2)].sort((x,y)=>x-y).join(', ')} ✅`},
    ];
  }

  if(lessonId==='u2l4'){
    const skip=r(0,3), rules=[2,5,10,100], rule=rules[skip];
    const start=r(1,20)*rule, steps=5;
    const seq=Array.from({length:steps},(_,i)=>start+i*rule);
    return [
      {c:color,tag:`Skip Count by ${rule}s`,p:`Continue: ${seq.slice(0,3).join(', ')}, ___`,
       s:`Each number increases by ${rule}`,a:`${seq.join(', ')} ✅`},
      {c:color,tag:`Skip Count by ${rule}s`,p:`Fill in: ${seq[0]}, ___, ${seq[2]}, ___, ${seq[4]}`,
       s:`Count by ${rule}s: add ${rule} each time`,a:`${seq.join(', ')} ✅`},
    ];
  }

  if(lessonId==='u3l1'){
    const a=r(11,89), b=r(11,89), sum=a+b;
    const aO=a%10, bO=b%10, aT=Math.floor(a/10), bT=Math.floor(b/10);
    const onesSum=aO+bO, needsCarry=onesSum>=10;
    const onesDigit=sum%10, tensDigit=Math.floor(sum/10);
    // carry 1 goes OVER the tens column (c1), not the ones column
    const carryRow=needsCarry?'<tr class="cm-carry"><td></td><td>1</td><td></td></tr>':'';
    const tableHtml='<table class="col-math">'+carryRow+
      '<tr><td></td><td>'+aT+'</td><td>'+aO+'</td></tr>'+
      '<tr class="cm-bottom"><td class="cm-op">+</td><td>'+bT+'</td><td>'+bO+'</td></tr>'+
      '<tr class="cm-line"><td colspan="3"><hr></td></tr>'+
      '<tr class="cm-result"><td></td><td>'+tensDigit+'</td><td>'+onesDigit+'</td></tr>'+
      '</table>';
    const stepText=needsCarry
      ? 'Ones: '+aO+'+'+bO+'='+onesSum+' → write <b>'+onesDigit+'</b>, carry <b>1</b> to tens<br>Tens: '+aT+'+'+bT+'+1(carried) = <b>'+tensDigit+'</b>'
      : 'Ones: '+aO+'+'+bO+'='+onesDigit+'<br>Tens: '+aT+'+'+bT+' = '+tensDigit;
    const a2=r(20,70), b2=r(20,70), sum2=a2+b2;
    const a2O=a2%10, b2O=b2%10, a2T=Math.floor(a2/10), b2T=Math.floor(b2/10);
    const ones2=a2O+b2O, carry2=ones2>=10;
    const carryRow2=carry2?'<tr class="cm-carry"><td></td><td>1</td><td></td></tr>':'';
    const table2='<table class="col-math">'+carryRow2+
      '<tr><td></td><td>'+a2T+'</td><td>'+a2O+'</td></tr>'+
      '<tr class="cm-bottom"><td class="cm-op">+</td><td>'+b2T+'</td><td>'+b2O+'</td></tr>'+
      '<tr class="cm-line"><td colspan="3"><hr></td></tr>'+
      '<tr class="cm-result"><td></td><td>'+Math.floor(sum2/10)+'</td><td>'+sum2%10+'</td></tr>'+
      '</table>';
    const step2=carry2
      ? 'Ones: '+a2O+'+'+b2O+'='+ones2+' → write <b>'+sum2%10+'</b>, carry <b>1</b> to tens<br>Tens: '+a2T+'+'+b2T+'+1(carried) = <b>'+Math.floor(sum2/10)+'</b>'
      : 'Ones: '+a2O+'+'+b2O+'='+sum2%10+'<br>Tens: '+a2T+'+'+b2T+' = '+Math.floor(sum2/10);
    return [
      {c:color, tag:needsCarry?'With Regrouping (Carrying)':'No Regrouping',
       p:`${a} + ${b} = ?`, s:tableHtml+'<br>'+stepText, a:`${a} + ${b} = ${sum} ✅`},
      {c:color, tag:needsCarry?'With Regrouping (Carrying)':'No Regrouping',
       p:`${a2} + ${b2} = ?`, s:table2+'<br>'+step2, a:`${a2} + ${b2} = ${sum2} ✅`},
    ];
  }

  if(lessonId==='u3l2'){
    const a=r(31,99), b=r(11,a-10);
    const diff=a-b;
    const needsBorrow=(a%10)<(b%10);
    return [
      {c:color,tag:needsBorrow?'With Borrowing':'No Borrowing',p:`${a} - ${b} = ?`,
       s:'Ones: '+(needsBorrow?(a%10)+'<'+(b%10)+' borrow!':(a%10)+'-'+(b%10)+'='+(diff%10))+'. Tens: '+(needsBorrow?Math.floor(a/10)+'-1-'+Math.floor(b/10):Math.floor(a/10)+'-'+Math.floor(b/10))+'='+Math.floor(diff/10),
       a:`${a} - ${b} = ${diff} ✅`,vis:`sub:${emoji}:${a}:${b}`},
      {c:color,tag:'Practice',p:`${a} - ${Math.floor(b/2)} = ?`,
       a:`${a} - ${Math.floor(b/2)} = ${a-Math.floor(b/2)} ✅`},
    ];
  }

  if(lessonId==='u3l3'){
    const a=r(1,9),b=r(1,9),cc=r(1,9);
    // find a pair that makes 10
    const p1=r(1,9), p2=10-p1, p3=r(1,8);
    return [
      {c:color,tag:'Make a 10 First',p:`${p1} + ${p2} + ${p3} = ?`,
       s:`${p1}+${p2}=10 (make a ten!)\n10+${p3}=${10+p3}`,a:`${p1}+${p2}+${p3}=${10+p3} ✅`},
      {c:color,tag:'Use Doubles',p:`${a} + ${a} + ${cc} = ?`,
       s:`${a}+${a}=${a*2} (doubles!)\n${a*2}+${cc}=${a*2+cc}`,a:`${a}+${a}+${cc}=${a*2+cc} ✅`},
    ];
  }

  if(lessonId==='u3l4'){
    const x=r(20,90), y=r(10,50);
    const x2=r(50,150), y2=r(20,80);
    return [
      {c:color,tag:'Adding Story',p:`Sam had ${x} stickers. Got ${y} more. How many total?`,
       s:`"How many total" → ADD\n${x} + ${y} = ${x+y}`,a:`${x+y} stickers ✅`},
      {c:color,tag:'Subtracting Story',p:`There were ${x2} birds. ${y2} flew away. How many left?`,
       s:`"How many left" → SUBTRACT\n${x2} - ${y2} = ${x2-y2}`,a:`${x2-y2} birds ✅`},
    ];
  }

  if(lessonId==='u4l1'){
    const a=r(100,499), b=r(100,499), sum=a+b;
    const aO=a%10, bO=b%10;
    const aT=Math.floor((a%100)/10), bT=Math.floor((b%100)/10);
    const aH=Math.floor(a/100), bH=Math.floor(b/100);
    const onesSum=aO+bO, carryToTens=onesSum>=10?1:0;
    const tensSum=aT+bT+carryToTens, carryToHunds=tensSum>=10?1:0;
    const onesD=sum%10, tensD=Math.floor((sum%100)/10), hundsD=Math.floor(sum/100);
    // carry 1 from ones goes over tens (c2), carry 1 from tens goes over hundreds (c1)
    const c1=carryToHunds?'1':'', c2=carryToTens?'1':'';
    const carryRow=(c1||c2)?'<tr class="cm-carry"><td></td><td>'+c1+'</td><td>'+c2+'</td><td></td></tr>':'';
    const tableHtml='<table class="col-math">'+carryRow+
      '<tr><td></td><td>'+aH+'</td><td>'+aT+'</td><td>'+aO+'</td></tr>'+
      '<tr class="cm-bottom"><td class="cm-op">+</td><td>'+bH+'</td><td>'+bT+'</td><td>'+bO+'</td></tr>'+
      '<tr class="cm-line"><td colspan="4"><hr></td></tr>'+
      '<tr class="cm-result"><td></td><td>'+hundsD+'</td><td>'+tensD+'</td><td>'+onesD+'</td></tr>'+
      '</table>';
    let steps='Ones: '+aO+'+'+bO+'='+onesSum+(carryToTens?' → write <b>'+onesD+'</b>, carry <b>1</b>':' = <b>'+onesD+'</b>')+'<br>';
    steps+='Tens: '+aT+'+'+bT+(carryToTens?'+1(carry)':'')+'='+tensSum+(carryToHunds?' → write <b>'+tensD+'</b>, carry <b>1</b>':' = <b>'+tensD+'</b>')+'<br>';
    steps+='Hundreds: '+aH+'+'+bH+(carryToHunds?'+1(carry)':'')+'= <b>'+hundsD+'</b>';
    const a2=r(100,499), b2=r(100,499), sum2=a2+b2;
    const a2O=a2%10,b2O=b2%10,a2T=Math.floor((a2%100)/10),b2T=Math.floor((b2%100)/10),a2H=Math.floor(a2/100),b2H=Math.floor(b2/100);
    const ones2=a2O+b2O,ct2=ones2>=10?1:0,tens2=a2T+b2T+ct2,ch2=tens2>=10?1:0;
    const c1b=ch2?'1':'',c2b=ct2?'1':'';
    const carryRow2=(c1b||c2b)?'<tr class="cm-carry"><td></td><td>'+c1b+'</td><td>'+c2b+'</td><td></td></tr>':'';
    const table2='<table class="col-math">'+carryRow2+
      '<tr><td></td><td>'+a2H+'</td><td>'+a2T+'</td><td>'+a2O+'</td></tr>'+
      '<tr class="cm-bottom"><td class="cm-op">+</td><td>'+b2H+'</td><td>'+b2T+'</td><td>'+b2O+'</td></tr>'+
      '<tr class="cm-line"><td colspan="4"><hr></td></tr>'+
      '<tr class="cm-result"><td></td><td>'+Math.floor(sum2/100)+'</td><td>'+Math.floor((sum2%100)/10)+'</td><td>'+sum2%10+'</td></tr>'+
      '</table>';
    let steps2='Ones: '+a2O+'+'+b2O+'='+ones2+(ct2?' → write <b>'+sum2%10+'</b>, carry <b>1</b>':' = <b>'+sum2%10+'</b>')+'<br>';
    steps2+='Tens: '+a2T+'+'+b2T+(ct2?'+1(carry)':'')+'='+tens2+(ch2?' → write <b>'+Math.floor((sum2%100)/10)+'</b>, carry <b>1</b>':' = <b>'+Math.floor((sum2%100)/10)+'</b>')+'<br>';
    steps2+='Hundreds: '+a2H+'+'+b2H+(ch2?'+1(carry)':'')+'= <b>'+Math.floor(sum2/100)+'</b>';
    return [
      {c:color, tag:'3-Digit Addition with Carrying',
       p:`${a} + ${b} = ?`, s:tableHtml+'<br>'+steps, a:`${a} + ${b} = ${sum} ✅`},
      {c:color, tag:'3-Digit Addition with Carrying',
       p:`${a2} + ${b2} = ?`, s:table2+'<br>'+steps2, a:`${a2} + ${b2} = ${sum2} ✅`},
    ];
  }

  if(lessonId==='u4l2'){
    const a=r(400,900), b=r(100,a-100);
    return [
      {c:color,tag:'3-Digit Subtraction',p:`${a} - ${b} = ?`,
       s:`Start with ones, borrow if needed\nThen tens, then hundreds`,
       a:`${a} - ${b} = ${a-b} ✅`},
    ];
  }

  if(lessonId==='u4l3'){
    const a=r(100,900), b=r(100,900);
    const ar=Math.round(a/100)*100, br=Math.round(b/100)*100;
    return [
      {c:color,tag:'Estimate by Rounding',p:`Estimate ${a} + ${b}`,
       s:`Round ${a} → ${ar}\nRound ${b} → ${br}\n${ar} + ${br} = ${ar+br}`,
       a:`About ${ar+br} ✅`},
      {c:color,tag:'Estimate',p:`Estimate ${Math.max(a,b)} - ${Math.min(a,b)}`,
       s:`Round to nearest 100 and subtract`,
       a:`About ${Math.round(Math.abs(a-b)/100)*100} ✅`},
    ];
  }

  if(lessonId==='u5l1'){
    return [
      {c:color,tag:'Coin Values',p:'How much is each coin worth?',
       s:`Penny = 1¢\nNickel = 5¢\nDime = 10¢\nQuarter = 25¢`,a:'1¢, 5¢, 10¢, 25¢ ✅'},
    ];
  }

  if(lessonId==='u5l2'){
    const coins=[[25,'Q'],[10,'D'],[10,'D'],[5,'N'],[1,'P'],[1,'P']];
    const pick=coins.slice(0,r(2,5));
    const total=pick.reduce((s,c)=>s+c[0],0);
    const coins2=[[25,'Q'],[25,'Q'],[10,'D'],[5,'N']];
    const total2=coins2.reduce((s,c)=>s+c[0],0);
    return [
      {c:color,tag:'Count Coins',p:`Count: ${pick.map(c=>c[1]).join(', ')}`,
       s:`Count biggest first:\n${pick.map((c,i)=>pick.slice(0,i+1).reduce((s,x)=>s+x[0],0)+'¢').join(' → ')}`,
       a:`Total = ${total}¢ ✅`},
      {c:color,tag:'Count Coins',p:`Count: Q, Q, D, N`,
       s:`25 → 50 → 60 → 65`,a:`Total = ${total2}¢ ✅`},
    ];
  }

  if(lessonId==='u5l3'){
    const d=r(1,9), c2=r(1,99);
    const amt=d*100+c2;
    return [
      {c:color,tag:'Dollars and Cents',p:`Write $${d}.${String(c2).padStart(2,'0')} as cents`,
       s:`$${d} = ${d*100}¢\n+ ${c2}¢ = ${amt}¢`,a:`${amt}¢ ✅`},
      {c:color,tag:'Making Change',p:`Item costs $${d}.${String(c2).padStart(2,'0')}. You pay $${d+1}.00. Change?`,
       s:`${(d+1)*100} - ${amt} = ${(d+1)*100-amt}¢`,a:`${(d+1)*100-amt}¢ ✅`},
    ];
  }

  if(lessonId==='u5l4'){
    return [
      {c:color,tag:'Need vs Want',p:'Is food a NEED or a WANT?',s:'You cannot survive without food.',a:'NEED ✅'},
      {c:color,tag:'Saving',p:`Save $${r(2,5)} per week for ${r(3,6)} weeks. Total?`,
       s:`$${r(2,5)} × ${r(3,6)} weeks`,a:`Multiply to find total savings ✅`},
    ];
  }

  if(lessonId==='u6l1'){
    const counts=[r(3,12),r(3,12),r(3,12)];
    const labels=['Red','Blue','Green'];
    const SK='stroke="#333" stroke-width="2.5" stroke-linecap="round"';
    const tallyRow=(lbl,cnt,i)=>{
      const full=Math.floor(cnt/5),rem=cnt%5;
      const y1=20+i*36,y2=44+i*36,mid=14+i*36+22;
      const bg=i%2===0?'#f8faff':'#ffffff';
      let s=`<rect x="4" y="${14+i*36}" width="272" height="36" fill="${bg}"/>`;
      s+=`<line x1="4" y1="${14+i*36}" x2="276" y2="${14+i*36}" stroke="#ddd" stroke-width="0.5"/>`;
      s+=`<text x="8" y="${mid}" font-size="9" fill="#333" font-weight="bold">${lbl}</text>`;
      for(let g=0;g<full;g++){const sx=55+g*40;for(let k=0;k<4;k++)s+=`<line x1="${sx+k*8}" y1="${y1}" x2="${sx+k*8}" y2="${y2}" ${SK}/>`;s+=`<line x1="${sx-2}" y1="${y2}" x2="${sx+24}" y2="${y1}" ${SK}/>`;}
      for(let j=0;j<rem;j++){const x=55+full*40+j*8;s+=`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" ${SK}/>`;}
      s+=`<text x="272" y="${mid}" text-anchor="end" font-size="9" fill="#229954" font-weight="bold">= ${cnt}</text>`;
      return s;
    };
    const hdr=`<rect x="4" y="2" width="272" height="14" fill="#e8f4ff" rx="3"/><text x="8" y="12" font-size="7" fill="#333" font-weight="bold">Color</text><text x="55" y="12" font-size="7" fill="#333" font-weight="bold">Tally Marks</text><text x="272" y="12" text-anchor="end" font-size="7" fill="#333" font-weight="bold">Total</text>`;
    const chartSvg=`<svg width="280" height="124" viewBox="0 0 280 124" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">${hdr}${tallyRow(labels[0],counts[0],0)}${tallyRow(labels[1],counts[1],1)}${tallyRow(labels[2],counts[2],2)}</svg>`;
    return [
      {c:color,tag:'Read Tally Chart',p:`${labels[0]}:${counts[0]}, ${labels[1]}:${counts[1]}, ${labels[2]}:${counts[2]}. Which has the most?`,
       s:chartSvg,
       a:`${labels[counts.indexOf(Math.max(...counts))]} = ${Math.max(...counts)} (most) ✅`},
    ];
  }

  if(lessonId==='u6l2'){
    const vals=[r(2,9),r(2,9),r(2,9)];
    const labs=['Dogs','Cats','Fish'];
    const clrs=['#4472C4','#ED7D31','#A9D18E'];
    const bxs=[34,89,144];
    let bars='',yax='<line x1="30" y1="8" x2="30" y2="108" stroke="#333" stroke-width="1.5"/><line x1="30" y1="108" x2="195" y2="108" stroke="#333" stroke-width="1.5"/>';
    for(let v=0;v<=8;v+=2){const y=108-v*10;yax+=`<line x1="27" y1="${y}" x2="30" y2="${y}" stroke="#555" stroke-width="1"/><text x="25" y="${y+3}" text-anchor="end" font-size="6" fill="#555">${v}</text>`;}
    for(let i=0;i<3;i++){const bh=vals[i]*10,bt=108-bh;bars+=`<rect x="${bxs[i]}" y="${bt}" width="40" height="${bh}" fill="${clrs[i]}" rx="2"/><text x="${bxs[i]+20}" y="117" text-anchor="middle" font-size="7" fill="#333">${labs[i]}</text><text x="${bxs[i]+20}" y="${bt-2}" text-anchor="middle" font-size="7" fill="#333">${vals[i]}</text>`;}
    const barSvg=`<svg width="520" height="312" viewBox="0 0 220 130" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9"><text x="110" y="9" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">Pets Survey</text>${yax}${bars}</svg>`;
    return [
      {c:color,tag:'Read Bar Graph',p:`Dogs:${vals[0]}, Cats:${vals[1]}, Fish:${vals[2]}. Most popular?`,
       s:barSvg,a:`${labs[vals.indexOf(Math.max(...vals))]} = ${Math.max(...vals)} (most) ✅`},
    ];
  }

  if(lessonId==='u6l3'){
    const key=r(2,5), pics=r(2,6);
    const symData=[{s:'📖',n:'books'},{s:'⭐',n:'stars'},{s:'🍎',n:'apples'},{s:'🌟',n:'stars'}];
    const sd=symData[r(0,3)];
    const picStr=sd.s.repeat(pics);
    const picSvg=`<svg width="500" height="144" viewBox="0 0 280 72" style="display:block;margin:6px auto;border-radius:6px;background:#f9f9f9"><rect x="4" y="2" width="272" height="15" fill="#e8f4ff" rx="3"/><text x="8" y="13" font-size="8" fill="#333" font-weight="bold">Key: ${sd.s} = ${key} ${sd.n}</text><line x1="4" y1="17" x2="276" y2="17" stroke="#ddd" stroke-width="1"/><text x="8" y="43" font-size="8" fill="#333" font-weight="bold">Sam</text><text x="65" y="47" font-size="16">${picStr}</text><line x1="4" y1="62" x2="276" y2="62" stroke="#ddd" stroke-width="1"/></svg>`;
    return [
      {c:color,tag:'Read Pictograph',p:`Key: ${sd.s} = ${key} ${sd.n}. Sam has ${pics} ${sd.s}. How many ${sd.n} total?`,
       s:picSvg,a:`${pics} × ${key} = ${pics*key} ${sd.n} ✅`},
    ];
  }

  if(lessonId==='u6l4'){
    const start=r(1,5);
    const cnts=[r(1,4),r(1,5),r(1,4),r(1,3)];
    const vvals=[start,start+1,start+2,start+3];
    const lxs=[20,73,126,179];
    let marks='';
    for(let i=0;i<4;i++){marks+=`<line x1="${lxs[i]}" y1="83" x2="${lxs[i]}" y2="89" stroke="#555" stroke-width="1.5"/><text x="${lxs[i]}" y="99" text-anchor="middle" font-size="9" fill="#333">${vvals[i]}</text>`;for(let j=0;j<cnts[i];j++)marks+=`<text x="${lxs[i]}" y="${76-j*13}" text-anchor="middle" font-size="12" fill="#229954" font-weight="bold">×</text>`;}
    const lpSvg=`<svg width="400" height="216" viewBox="0 0 200 108" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9"><text x="100" y="11" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">Survey Results</text><line x1="12" y1="86" x2="192" y2="86" stroke="#333" stroke-width="2"/>${marks}<text x="100" y="106" text-anchor="middle" font-size="7" fill="#888">Values</text></svg>`;
    const mi=cnts.indexOf(Math.max(...cnts));
    return [
      {c:color,tag:'Read Line Plot',p:`Which value has the most × marks?`,
       s:lpSvg,a:`Value ${vvals[mi]} has ${cnts[mi]} marks — the most! ✅`},
    ];
  }

  if(lessonId==='u7l1'){
    const len=r(2,30);
    return [
      {c:color,tag:'Measure Length',p:`A pencil ends at ${len} on the ruler. How long?`,
       s:`Always start at 0\nRead where it ends`,a:`${len} inches ✅`},
      {c:color,tag:'Compare',p:`Pencil: ${len} inches. Crayon: ${len+r(1,5)} inches. Which is longer?`,
       s:`Compare: ${len} vs ${len+r(1,5)}`,a:`Crayon is longer ✅`},
    ];
  }

  if(lessonId==='u7l2'){
    const h=r(1,12), m=[0,15,30,45][r(0,3)];
    const mName={0:'on the hour',15:'quarter past',30:'half past',45:'quarter to '+(h%12+1)};
    return [
      {c:color,tag:'Read a Clock',p:`What time does the clock show?`,
       s:`Short hand = hours → ${h}\nLong hand = minutes → ${m}`,
       a:`${h}:${String(m).padStart(2,'0')} (${mName[m]}) ✅`,vis:`clock:${h}:${m}`},
      {c:color,tag:'Half Past',p:`Half past ${r(1,12)} means?`,
       s:`Half past = 30 minutes after the hour`,a:`${r(1,12)}:30 ✅`},
    ];
  }

  if(lessonId==='u7l3'){
    const temp=r(20,100);
    return [
      {c:color,tag:'Temperature',p:`It is ${temp}°F outside. What should you wear?`,
       s:`Below 40°F → heavy coat\n40-65°F → light jacket\nAbove 65°F → light clothes`,
       a:`${temp>65?'Light clothes':temp>40?'Light jacket':'Heavy coat'} ✅`},
      {c:color,tag:'Liquid Measurement',p:`2 cups = ? pints`,s:`2 cups = 1 pint`,a:`1 pint ✅`},
    ];
  }

  if(lessonId==='u8l1'){
    const denom=r(2,8), num=r(1,denom);
    return [
      {c:color,tag:'Name a Fraction',p:`A shape is cut into ${denom} equal parts. ${num} are colored. Fraction?`,
       s:`Numerator (colored) = ${num}\nDenominator (total) = ${denom}`,a:`${num}/${denom} ✅`},
      {c:color,tag:'Fraction',p:`What does 3/4 mean?`,
       s:`3 = parts colored (numerator)\n4 = total equal parts (denominator)`,a:`3 out of 4 equal parts ✅`},
    ];
  }

  if(lessonId==='u8l2'){
    const d=[2,4,8][r(0,2)];
    return [
      {c:color,tag:'Halves, Fourths, Eighths',p:`A pie cut into ${d} equal parts. Each piece is?`,
       s:`1 out of ${d} equal parts`,a:`1/${d} ✅`},
      {c:color,tag:'Equal Parts',p:`4/8 = ?`,s:`4 out of 8 = half\n4/8 = 1/2`,a:`1/2 ✅`},
    ];
  }

  if(lessonId==='u8l3'){
    const d=4, n1=r(1,3), n2=r(1,3);
    const [lo,hi]=[Math.min(n1,n2),Math.max(n1,n2)];
    return [
      {c:color,tag:'Compare Fractions',p:`Which is larger: ${lo}/${d} or ${hi}/${d}?`,
       s:`Same denominator → compare numerators\n${lo} < ${hi}`,a:`${hi}/${d} is larger ✅`},
      {c:color,tag:'Compare',p:`Which is larger: 1/2 or 1/4?`,
       s:`Same numerator → smaller denominator = bigger piece\n2 < 4, so 1/2 > 1/4`,a:`1/2 is larger ✅`},
    ];
  }

  if(lessonId==='u9l1'){
    const shapes=[{n:'Triangle',s:3},{n:'Square',s:4},{n:'Pentagon',s:5},{n:'Hexagon',s:6}];
    const sh=shapes[r(0,3)];
    const sh2=shapes[r(0,3)];
    return [
      {c:color,tag:'Identify Shape',p:`A shape has ${sh.s} sides and ${sh.s} corners. Name it.`,
       s:`Count sides: ${sh.s}\nCount corners: ${sh.s}`,a:`${sh.n} ✅`},
      {c:color,tag:'Compare Shapes',p:`${sh.n} has ${sh.s} sides. ${sh2.n} has ${sh2.s} sides. More sides?`,
       s:`${sh.s} vs ${sh2.s}`,a:`${sh.s>sh2.s?sh.n:sh2.n} has more sides ✅`},
    ];
  }

  if(lessonId==='u9l2'){
    const solids=[{n:'Cube',f:6,v:8,e:12},{n:'Sphere',f:1,v:0,e:0},{n:'Cone',f:2,v:1,e:1}];
    const sol=solids[r(0,2)];
    return [
      {c:color,tag:'3D Shape',p:`A ${sol.n} has how many faces?`,
       s:`Count the flat faces`,a:`${sol.f} face${sol.f!==1?'s':''} ✅`},
      {c:color,tag:'Real World',p:`A soup can looks like which 3D shape?`,s:`Round, 2 flat ends`,a:`Cylinder ✅`},
    ];
  }

  if(lessonId==='u9l3'){
    return [
      {c:color,tag:'Line of Symmetry',p:`Does a square have a line of symmetry?`,
       s:`Fold it — do both halves match?\nSquare has 4 lines of symmetry`,a:`Yes! ✅`},
      {c:color,tag:'Symmetry',p:`How many lines of symmetry does a circle have?`,
       s:`A circle is the same all the way around`,a:`Unlimited! ✅`},
    ];
  }

  if(lessonId==='u10l1'){
    const g=r(2,5), n=r(2,6);
    return [
      {c:color,tag:'Equal Groups',p:`${g} groups of ${n}. How many total?`,
       s:`${Array(g).fill(n).join(' + ')} = ${g*n}`,a:`${g*n} ✅`,vis:`groups:${emoji}:${g}:${n}`},
      {c:color,tag:'Array',p:`An array has ${g} rows and ${n} columns. Total?`,
       s:`${g} rows × ${n} columns = ${g*n}`,a:`${g*n} ✅`},
    ];
  }

  if(lessonId==='u10l2'){
    const n=r(2,6), t=r(2,5);
    return [
      {c:color,tag:'Repeated Addition',p:`${n} added ${t} times = ?`,
       s:`${Array(t).fill(n).join(' + ')} = ${n*t}`,a:`${n*t} ✅`},
      {c:color,tag:'Skip Count',p:`Skip count by ${n}: ${Array(t).fill(0).map((_,i)=>(i+1)*n).join(', ')}`,
       s:`Each jump adds ${n}`,a:`${n*t} after ${t} jumps ✅`},
    ];
  }

  if(lessonId==='u10l3'){
    const total=r(2,5)*r(2,5), by=r(2,5);
    const safe=by>0?Math.floor(total/by)*by:total;
    return [
      {c:color,tag:'Sharing Equally',p:`${safe} items shared between ${by} friends. Each gets?`,
       s:`${safe} ÷ ${by} = ?\nThink: ${by} × ? = ${safe}`,a:`${safe/by} each ✅`},
      {c:color,tag:'Division',p:`${r(2,5)*4} ÷ 4 = ?`,s:`Think: 4 × ? = ${r(2,5)*4}`,a:`${r(2,5)} ✅`},
    ];
  }

  return null; // no generator for this lesson — keep original
}

// ════════════════════════════════════════
//  PRACTICE HELPERS
// ════════════════════════════════════════
// ════════════════════════════════════════
//  INTERACTIVE PRACTICE DRILLS (MC, no score, no timer)
// ════════════════════════════════════════
const _PQ_EMOJIS = ['🍎','🌟','🎈','🐸','🍪','🦋','🍓','🎮','🐶','🌈','🍦','🚀','🎯','🏆','💡','🐝'];

function buildPracticeQ(pid, q){
  const opts = _shuffle([...q.o].map(text => text));
  const correctText = q.o[q.a];
  const emoji = _PQ_EMOJIS[Math.floor(Math.random() * _PQ_EMOJIS.length)];
  // q.t and q.o may contain SVG/HTML (e.g. clock diagrams) — render as-is; these are authored data, not user input
  const qText = q.t && q.t.includes('<') ? q.t : _escHtml(q.t);
  return `<div class="pq-drill" id="${pid}" data-correct="${_escHtml(correctText)}" data-exp="${_escHtml(q.e)}">
    <div class="pq-q"><span class="pq-emo">${emoji}</span>${qText}</div>${q.v?_buildVisualHTML(q.v):(q.s?`<div class="q-visual">${q.s}</div>`:'')}
    <div class="pq-choices">
      ${opts.map((text, i) =>
        `<button class="pq-choice" type="button" id="${pid}-c${i}" onclick="_pickPracticeAns('${pid}',${i})">${_escHtml(text)}</button>`
      ).join('')}
    </div>
    <div class="pq-drill-fb" id="${pid}-fb"></div>
  </div>`;
}

function _pickPracticeAns(pid, btnIdx){
  const card = document.getElementById(pid);
  if(!card || card.dataset.answered) return;
  card.dataset.answered = '1';
  const btn = document.getElementById(pid+'-c'+btnIdx);
  const chosen = btn ? btn.textContent.trim() : '';
  const correct = card.dataset.correct;
  const exp = card.dataset.exp;
  const isOk = chosen === correct;
  // Highlight all buttons
  for(let i = 0; i < 4; i++){
    const b = document.getElementById(pid+'-c'+i);
    if(!b) continue;
    b.disabled = true;
    if(b.textContent.trim() === correct) b.classList.add('pq-c-correct');
  }
  if(btn && !isOk) btn.classList.add('pq-c-wrong');
  // Feedback
  const fb = document.getElementById(pid+'-fb');
  if(fb){
    fb.innerHTML = `<div class="pq-drill-result ${isOk?'ok':'no'}">
      <div class="pq-dr-h">${isOk ? '🎉 Correct!' : '😊 Not quite...'}</div>
      ${!isOk ? `<div class="pq-dr-correct">✅ Answer: ${_escHtml(correct)}</div>` : ''}
      <div class="pq-dr-exp">${_ICO.lightbulb} ${_escHtml(exp)}</div>
    </div>`;
  }
  if(isOk){ if(typeof confetti==='function') confetti(10); if(typeof playCorrect==='function') playCorrect(); }
  else { if(typeof playWrong==='function') playWrong(); }
}

function morePractice(unitIdx, lessonIdx){
  const u = UNITS_DATA[unitIdx];
  const l = u.lessons[lessonIdx];
  const list = document.getElementById('pq-list-'+l.id);
  if(!list) return;
  const bank = (l.qBank && l.qBank.length) ? l.qBank : [];
  if(!bank.length) return;
  const batch = _shuffle([...bank]).slice(0, 3);
  const ts = Date.now();
  list.innerHTML = batch.map((q, i) => buildPracticeQ('prq-'+l.id+'-'+ts+'-'+i, q)).join('');
  list.style.setProperty('--ac', u.color);
  list.style.opacity = '0';
  setTimeout(()=>{ list.style.transition='opacity .3s'; list.style.opacity='1'; }, 10);
}

function steps(...arr){ return arr.map((s,i)=>`<div class="step"><div class="step-num">${i+1}</div><div>${s}</div></div>`).join(''); }

function generatePractice(lessonId, color){
  const r=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const emojis=['🍎','🌟','🎈','🐸','🍪','🦋','🍓','🎮','🐶','🌈','🍦','🚀'];
  const e=()=>emojis[r(0,emojis.length-1)];

  if(lessonId==='u1l1'){
    const a=r(1,15),b=r(1,9),sum=a+b;
    const big=Math.max(a,b),sm=Math.min(a,b);
    const seq=Array.from({length:sm},(_,i)=>big+i+1).join(' → ');
    const c=r(10,20),d=r(1,8),diff=c-d;
    const bseq=Array.from({length:d},(_,i)=>c-i-1).join(' → ');
    return [
      {e:e(),q:`${big} + ${sm} = ?`,a:String(sum),
       h:steps(`Start at the bigger number: <strong>${big}</strong>`,`Count on ${sm} more: ${seq}`,`Answer: <strong>${big} + ${sm} = ${sum}</strong>`)},
      {e:e(),q:`${c} - ${d} = ?`,a:String(diff),
       h:steps(`Start at <strong>${c}</strong>`,`Count back ${d}: ${bseq}`,`Answer: <strong>${c} - ${d} = ${diff}</strong>`)},
      {e:e(),q:`${r(2,9)} + ${r(2,9)} = ?`,a:'?',
       h:steps('Find the bigger number','Count on from there using your fingers','Write your answer!')},
    ];
  }

  if(lessonId==='u1l2'){
    const n=r(2,12),d=n*2;
    const nd=r(2,11);
    return [
      {e:e(),q:`${n} + ${n} = ?`,a:String(d),
       h:steps(`Recognize this as a <strong>doubles fact</strong>`,`${n} + ${n} means two equal groups of ${n}`,`Count: ${Array.from({length:2},()=>n).join(' + ')} = <strong>${d}</strong>`)},
      {e:e(),q:`${nd} + ${nd+1} = ?`,a:String(nd*2+1),
       h:steps(`This is a <strong>near double</strong> — almost a double!`,`Start with the double: ${nd} + ${nd} = ${nd*2}`,`Then add 1 more: ${nd*2} + 1 = <strong>${nd*2+1}</strong>`)},
    ];
  }

  if(lessonId==='u1l3'){
    const a=r(6,9),b=r(2,7),need=10-a,rest=b>need?b-need:0,sum=a+b;
    const a2=r(7,9),b2=r(3,8),need2=10-a2,rest2=b2>need2?b2-need2:0,sum2=a2+b2;
    return [
      {e:e(),q:`${a} + ${b} = ?`,a:String(sum),
       h:steps(`How many does ${a} need to reach 10? → <strong>${need}</strong>`,`Break ${b} into ${need} + ${rest}: ${a} + ${need} = <strong>10</strong>`,`Then add the leftover: 10 + ${rest} = <strong>${sum}</strong>`)},
      {e:e(),q:`${a2} + ${b2} = ?`,a:String(sum2),
       h:steps(`${a2} needs <strong>${need2}</strong> more to make 10`,`Split ${b2} into ${need2} and ${rest2}`,`${a2} + ${need2} = 10, then 10 + ${rest2} = <strong>${sum2}</strong>`)},
    ];
  }

  if(lessonId==='u1l4'){
    const a=r(2,9),b=r(2,9),s=a+b;
    return [
      {e:e(),q:`Write the fact family for ${a}, ${b}, ${s}`,a:`${a}+${b}=${s}, ${b}+${a}=${s}, ${s}-${a}=${b}, ${s}-${b}=${a}`,
       h:steps(`The 3 numbers are <strong>${a}, ${b}, ${s}</strong>`,`Addition facts: ${a}+${b}=${s} and ${b}+${a}=${s}`,`Subtraction facts: ${s}-${a}=${b} and ${s}-${b}=${a}`,`All 4 facts use the same 3 numbers! ✨`)},
      {e:e(),q:`If ${a} + ${b} = ${s}, what is ${s} - ${b}?`,a:String(a),
       h:steps(`These are <strong>related facts</strong> in the same family`,`${a} + ${b} = ${s}, so ${s} - ${b} = <strong>${a}</strong>`,`The number family connects addition & subtraction!`)},
    ];
  }

  if(lessonId==='u2l1'){
    const h2=r(1,9),t=r(0,9),o=r(0,9),num=h2*100+t*10+o;
    const h3=r(1,9),t2=r(0,9),o2=r(0,9),num2=h3*100+t2*10+o2;
    return [
      {e:e(),q:`What is the value of the <strong>tens</strong> digit in ${num}?`,a:String(t*10),
       h:steps(`The number ${num} has 3 digits`,`Hundreds: <strong>${h2}</strong> (value = ${h2*100})`,`Tens: <strong>${t}</strong> (value = ${t}×10 = ${t*10})`,`Ones: <strong>${o}</strong> (value = ${o})`,`The tens digit is worth <strong>${t*10}</strong>`)},
      {e:e(),q:`Write ${num2} in expanded form`,a:`${h3*100} + ${t2*10} + ${o2}`,
       h:steps(`Break apart each digit by its place value`,`Hundreds: ${h3} × 100 = <strong>${h3*100}</strong>`,`Tens: ${t2} × 10 = <strong>${t2*10}</strong>`,`Ones: ${o2} × 1 = <strong>${o2}</strong>`,`Expanded: <strong>${h3*100} + ${t2*10} + ${o2}</strong>`)},
    ];
  }

  if(lessonId==='u2l2'){
    const n=r(100,999),h2=Math.floor(n/100),t=Math.floor((n%100)/10),o=n%10;
    return [
      {e:e(),q:`${h2*100} + ${t*10} + ${o} = ?`,a:String(n),
       h:steps(`Start with the hundreds: <strong>${h2*100}</strong>`,`Add the tens: ${h2*100} + ${t*10} = <strong>${h2*100+t*10}</strong>`,`Add the ones: ${h2*100+t*10} + ${o} = <strong>${n}</strong>`)},
      {e:e(),q:`What is the standard form of ${h2} hundreds, ${t} tens, ${o} ones?`,a:String(n),
       h:steps(`Hundreds digit goes first: <strong>${h2}</strong>`,`Tens digit goes second: <strong>${t}</strong>`,`Ones digit goes last: <strong>${o}</strong>`,`Standard form: <strong>${n}</strong>`)},
    ];
  }

  if(lessonId==='u2l3'){
    const a=r(100,499),b=a+r(10,200);
    return [
      {e:e(),q:`Which is greater: ${a} or ${b}?`,a:String(b),
       h:steps(`Compare the <strong>hundreds</strong> digits first`,`${Math.floor(a/100)} hundreds vs ${Math.floor(b/100)} hundreds`,Math.floor(a/100)===Math.floor(b/100)?`Same hundreds! Compare <strong>tens</strong>: ${Math.floor((a%100)/10)} vs ${Math.floor((b%100)/10)}`:`${Math.floor(b/100)} > ${Math.floor(a/100)}, so <strong>${b} is greater</strong>`,`Answer: <strong>${b} > ${a}</strong>`)},
    ];
  }

  if(lessonId==='u2l4'){
    const rules=[2,5,10,100],rule=rules[r(0,3)],start=r(1,10)*rule;
    const seq=Array.from({length:6},(_,i)=>start+i*rule);
    return [
      {e:e(),q:`Skip count by ${rule}s: ${seq[0]}, ${seq[1]}, ${seq[2]}, ___, ___, ___`,a:`${seq[3]}, ${seq[4]}, ${seq[5]}`,
       h:steps(`The rule is: add <strong>${rule}</strong> each time`,`${seq[2]} + ${rule} = <strong>${seq[3]}</strong>`,`${seq[3]} + ${rule} = <strong>${seq[4]}</strong>`,`${seq[4]} + ${rule} = <strong>${seq[5]}</strong>`)},
    ];
  }

  if(lessonId==='u3l1'){
    const a=r(11,89),b=r(11,89),sum=a+b;
    const carry=(a%10+b%10)>=10;
    return [
      {e:e(),q:`${a} + ${b} = ?`,a:String(sum),
       h:steps(`Add the <strong>ones</strong>: ${a%10} + ${b%10} = ${a%10+b%10}${carry?` → write <strong>${sum%10}</strong>, carry <strong>1</strong>`:''}`,`Add the <strong>tens</strong>: ${Math.floor(a/10)} + ${Math.floor(b/10)}${carry?` + 1 (carried)`:''}  = <strong>${Math.floor(sum/10)}</strong>`,`Answer: <strong>${sum}</strong>`)},
    ];
  }

  if(lessonId==='u3l2'){
    const a=r(31,99),b=r(11,a-10),diff=a-b;
    const borrow=(a%10)<(b%10);
    return [
      {e:e(),q:`${a} - ${b} = ?`,a:String(diff),
       h:steps(`Subtract the <strong>ones</strong>: ${borrow?`${a%10} is less than ${b%10}, so borrow! ${a%10+10} - ${b%10} = <strong>${a%10+10-b%10}</strong>`:`${a%10} - ${b%10} = <strong>${diff%10}</strong>`}`,`Subtract the <strong>tens</strong>: ${borrow?Math.floor(a/10)+'-1':Math.floor(a/10)} - ${Math.floor(b/10)} = <strong>${Math.floor(diff/10)}</strong>`,`Answer: <strong>${diff}</strong>`)},
    ];
  }

  if(lessonId==='u4l1'){
    const a=r(100,499),b=r(100,499),sum=a+b;
    return [
      {e:e(),q:`${a} + ${b} = ?`,a:String(sum),
       h:steps(`Ones: ${a%10} + ${b%10} = ${(a%10+b%10)>=10?`write ${sum%10} carry 1`:(a+b)%10}`,`Tens: ${Math.floor((a%100)/10)} + ${Math.floor((b%100)/10)}${(a%10+b%10)>=10?'+1':''} = ${Math.floor((sum%100)/10)}${(Math.floor((a%100)/10)+Math.floor((b%100)/10)+(a%10+b%10>=10?1:0))>=10?' (carry 1)':''}`,`Hundreds: ${Math.floor(a/100)} + ${Math.floor(b/100)}${(Math.floor((a%100)/10)+Math.floor((b%100)/10)+(a%10+b%10>=10?1:0))>=10?'+1':''} = ${Math.floor(sum/100)}`,`Answer: <strong>${sum}</strong>`)},
    ];
  }

  if(lessonId==='u4l2'){
    const a=r(400,900),b=r(100,a-100),diff=a-b;
    return [
      {e:e(),q:`${a} - ${b} = ?`,a:String(diff),
       h:steps(`Start with the <strong>ones column</strong> — borrow if needed`,`Then the <strong>tens column</strong> — borrow if needed`,`Finally the <strong>hundreds column</strong>`,`Answer: <strong>${diff}</strong>`)},
    ];
  }

  if(lessonId==='u4l3'){
    const a=r(100,900),b=r(100,900);
    const ar=Math.round(a/100)*100,br=Math.round(b/100)*100;
    return [
      {e:e(),q:`Estimate: ${a} + ${b}`,a:`About ${ar+br}`,
       h:steps(`Round ${a} to the nearest hundred → <strong>${ar}</strong>`,`Round ${b} to the nearest hundred → <strong>${br}</strong>`,`Add the rounded numbers: ${ar} + ${br} = <strong>${ar+br}</strong>`,`This is an estimate — the exact answer is ${a+b}`)},
    ];
  }

  if(lessonId==='u5l2'){
    const coins=[{v:25,n:'Quarter'},{v:10,n:'Dime'},{v:5,n:'Nickel'},{v:1,n:'Penny'}];
    const pick=coins.slice(0,r(2,4));
    const total=pick.reduce((s,c)=>s+c.v,0);
    let running=0;
    return [
      {e:e(),q:`Count: ${pick.map(c=>c.n).join(', ')}`,a:`${total}¢`,
       h:steps('Count from <strong>biggest coin to smallest</strong>',...pick.map(c=>{running+=c.v;return `Add ${c.n} (${c.v}¢): running total = <strong>${running}¢</strong>`}),`Total = <strong>${total}¢</strong>`)},
    ];
  }

  if(lessonId==='u6l1'){
    const vals=[r(3,12),r(3,12),r(3,12)],labs=['Red','Blue','Green'];
    const max=Math.max(...vals),maxLab=labs[vals.indexOf(max)];
    const SK6='stroke="#333" stroke-width="2.5" stroke-linecap="round"';
    const tallyRow6=(lbl,cnt,i)=>{
      const full=Math.floor(cnt/5),rem=cnt%5;
      const y1=20+i*36,y2=44+i*36,mid=14+i*36+22;
      const bg=i%2===0?'#f8faff':'#ffffff';
      let s=`<rect x="4" y="${14+i*36}" width="272" height="36" fill="${bg}"/>`;
      s+=`<line x1="4" y1="${14+i*36}" x2="276" y2="${14+i*36}" stroke="#ddd" stroke-width="0.5"/>`;
      s+=`<text x="8" y="${mid}" font-size="9" fill="#333" font-weight="bold">${lbl}</text>`;
      for(let g=0;g<full;g++){const sx=55+g*40;for(let k=0;k<4;k++)s+=`<line x1="${sx+k*8}" y1="${y1}" x2="${sx+k*8}" y2="${y2}" ${SK6}/>`;s+=`<line x1="${sx-2}" y1="${y2}" x2="${sx+24}" y2="${y1}" ${SK6}/>`;}
      for(let j=0;j<rem;j++){const x=55+full*40+j*8;s+=`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" ${SK6}/>`;}
      s+=`<text x="272" y="${mid}" text-anchor="end" font-size="9" fill="#229954" font-weight="bold">= ${cnt}</text>`;
      return s;
    };
    const hdr6=`<rect x="4" y="2" width="272" height="14" fill="#e8f4ff" rx="3"/><text x="8" y="12" font-size="7" fill="#333" font-weight="bold">Color</text><text x="55" y="12" font-size="7" fill="#333" font-weight="bold">Tally Marks</text><text x="272" y="12" text-anchor="end" font-size="7" fill="#333" font-weight="bold">Total</text>`;
    const chartSvg6=`<svg width="560" height="248" viewBox="0 0 280 124" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">${hdr6}${tallyRow6(labs[0],vals[0],0)}${tallyRow6(labs[1],vals[1],1)}${tallyRow6(labs[2],vals[2],2)}</svg>`;
    return [
      {e:e(),q:`Which color has the most tally marks? ${chartSvg6}`,a:maxLab,
       h:steps(`Count each row's tally marks`,`Red: <strong>${vals[0]}</strong>, Blue: <strong>${vals[1]}</strong>, Green: <strong>${vals[2]}</strong>`,`Compare: ${vals.join(' vs ')}`,`<strong>${maxLab}</strong> has the most with ${max}!`)},
    ];
  }

  if(lessonId==='u6l2'){
    const vals=[r(2,9),r(2,9),r(2,9)],labs=['Dogs','Cats','Fish'];
    const clrs=['#4472C4','#ED7D31','#A9D18E'],bxs=[34,89,144];
    const maxV=Math.max(...vals),maxLab=labs[vals.indexOf(maxV)];
    let bars='',yax='<line x1="30" y1="8" x2="30" y2="108" stroke="#333" stroke-width="1.5"/><line x1="30" y1="108" x2="195" y2="108" stroke="#333" stroke-width="1.5"/>';
    for(let v=0;v<=8;v+=2){const y=108-v*10;yax+=`<line x1="27" y1="${y}" x2="30" y2="${y}" stroke="#555" stroke-width="1"/><text x="25" y="${y+3}" text-anchor="end" font-size="6" fill="#555">${v}</text>`;}
    for(let i=0;i<3;i++){const bh=vals[i]*10,bt=108-bh;bars+=`<rect x="${bxs[i]}" y="${bt}" width="40" height="${bh}" fill="${clrs[i]}" rx="2"/><text x="${bxs[i]+20}" y="117" text-anchor="middle" font-size="7" fill="#333">${labs[i]}</text><text x="${bxs[i]+20}" y="${bt-2}" text-anchor="middle" font-size="7" fill="#333">${vals[i]}</text>`;}
    const barSvg=`<svg width="520" height="312" viewBox="0 0 220 130" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9"><text x="110" y="9" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">Pets Survey</text>${yax}${bars}</svg>`;
    return [
      {e:e(),q:`Which pet is most popular? ${barSvg}`,a:maxLab,
       h:steps(`Find the tallest bar`,`Dogs: <strong>${vals[0]}</strong>, Cats: <strong>${vals[1]}</strong>, Fish: <strong>${vals[2]}</strong>`,`Tallest bar = most popular`,`<strong>${maxLab}</strong> with ${maxV} votes ✅`)},
    ];
  }

  if(lessonId==='u6l3'){
    const key=r(2,5),pics=[r(2,5),r(2,5)],names=['Emma','Liam'];
    const syms=[{s:'📖',n:'books'},{s:'⭐',n:'stars'},{s:'🍎',n:'apples'},{s:'🎈',n:'balloons'}];
    const sd=syms[r(0,3)];
    const totals=pics.map(p=>p*key);
    const maxIdx=totals[0]>=totals[1]?0:1;
    let rows='';
    pics.forEach((p,i)=>{rows+=`<text x="8" y="${38+i*28}" font-size="9" fill="#333" font-weight="bold">${names[i]}</text><text x="65" y="${42+i*28}" font-size="16">${sd.s.repeat(p)}</text><line x1="4" y1="${48+i*28}" x2="276" y2="${48+i*28}" stroke="#ddd" stroke-width="0.5"/>`;});
    const picSvg=`<svg width="560" height="192" viewBox="0 0 280 96" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9"><rect x="4" y="2" width="272" height="15" fill="#e8f4ff" rx="3"/><text x="8" y="13" font-size="8" fill="#333" font-weight="bold">Key: ${sd.s} = ${key} ${sd.n}</text>${rows}</svg>`;
    return [
      {e:e(),q:`Who has more ${sd.n}? ${picSvg}`,a:names[maxIdx],
       h:steps(`Check the key: ${sd.s} = ${key} ${sd.n}`,`Emma: ${pics[0]} ${sd.s} × ${key} = <strong>${totals[0]}</strong>`,`Liam: ${pics[1]} ${sd.s} × ${key} = <strong>${totals[1]}</strong>`,`<strong>${names[maxIdx]}</strong> has more!`)},
    ];
  }

  if(lessonId==='u6l4'){
    const start=r(1,5),cnts=[r(1,4),r(1,5),r(1,4),r(1,3)];
    const vvals=[start,start+1,start+2,start+3];
    const lxs=[20,73,126,179];
    let marks='';
    for(let i=0;i<4;i++){marks+=`<line x1="${lxs[i]}" y1="83" x2="${lxs[i]}" y2="89" stroke="#555" stroke-width="1.5"/><text x="${lxs[i]}" y="99" text-anchor="middle" font-size="9" fill="#333">${vvals[i]}</text>`;for(let j=0;j<cnts[i];j++)marks+=`<text x="${lxs[i]}" y="${76-j*13}" text-anchor="middle" font-size="12" fill="#229954" font-weight="bold">×</text>`;}
    const lpSvg=`<svg width="560" height="302" viewBox="0 0 200 108" style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9"><text x="100" y="11" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">Survey Results</text><line x1="12" y1="86" x2="192" y2="86" stroke="#333" stroke-width="2"/>${marks}<text x="100" y="106" text-anchor="middle" font-size="7" fill="#888">Values</text></svg>`;
    const mi=cnts.indexOf(Math.max(...cnts));
    return [
      {e:e(),q:`Which value has the most × marks? ${lpSvg}`,a:`${vvals[mi]}`,
       h:steps(`Count the × marks above each number`,cnts.map((c,i)=>`Value ${vvals[i]}: <strong>${c}</strong> mark${c!==1?'s':''}`).join('<br>'),`Tallest stack = most common`,`Value <strong>${vvals[mi]}</strong> has ${cnts[mi]} marks ✅`)},
    ];
  }

  if(lessonId==='u7l2'){
    const h=r(1,12),m=[0,15,30,45][r(0,3)];
    const mWord={0:'exactly on the hour',15:'quarter past',30:'half past',45:'quarter to '+(h%12+1)}[m];
    return [
      {e:e(),q:`What time does the clock show?`,a:`${h}:${String(m).padStart(2,'0')}`,
       h:steps(`Short (hour) hand points to <strong>${h}</strong> → that's the hour`,`Long (minute) hand points to <strong>${m===0?12:m/5}</strong> → count by 5s: ${m===0?'0':m} minutes`,`Time is <strong>${h}:${String(m).padStart(2,'0')}</strong> (${mWord})`)},
    ];
  }

  if(lessonId==='u8l1'){
    const den=r(2,8),num=r(1,den);
    return [
      {e:e(),q:`A pizza is cut into ${den} equal slices. You eat ${num}. What fraction did you eat?`,a:`${num}/${den}`,
       h:steps(`The pizza was cut into <strong>${den}</strong> equal pieces → that's the <strong>denominator</strong> (bottom number)`,`You ate <strong>${num}</strong> pieces → that's the <strong>numerator</strong> (top number)`,`Fraction eaten: <strong>${num}/${den}</strong>`,`Say it: "${num} out of ${den} equal parts"`)},
    ];
  }

  if(lessonId==='u9l1'){
    const shapes=[{n:'Triangle',s:3},{n:'Square',s:4},{n:'Pentagon',s:5},{n:'Hexagon',s:6},{n:'Octagon',s:8}];
    const sh=shapes[r(0,4)];
    return [
      {e:e(),q:`How many sides and corners does a ${sh.n} have?`,a:`${sh.s} sides, ${sh.s} corners`,
       h:steps(`A ${sh.n} is a flat (2D) shape`,`Count the straight edges = <strong>sides</strong>`,`Count the points where sides meet = <strong>corners</strong>`,`A ${sh.n} has <strong>${sh.s} sides</strong> and <strong>${sh.s} corners</strong>`)},
    ];
  }

  if(lessonId==='u10l1'){
    const g=r(2,5),n=r(2,6);
    return [
      {e:e(),q:`Draw ${g} groups of ${n}. How many total?`,a:String(g*n),
       h:steps(`Make <strong>${g} equal groups</strong>`,`Put <strong>${n}</strong> objects in each group`,`Count all objects: ${Array(g).fill(n).join(' + ')} = <strong>${g*n}</strong>`,`Equal groups are the start of multiplication!`)},
    ];
  }

  if(lessonId==='u10l2'){
    const n=r(2,6),t=r(2,5);
    return [
      {e:e(),q:`${n} + ${n} + ${n} (repeated ${t} times) = ?`,a:String(n*t),
       h:steps(`Write out the repeated addition: ${Array(t).fill(n).join(' + ')}`,`Add step by step: ${Array(t).fill(0).map((_,i)=>(i+1)*n).join(', ')}`,`Total = <strong>${n*t}</strong>`,`This is the same as ${t} × ${n} = ${n*t}!`)},
    ];
  }

  if(lessonId==='u10l3'){
    const total=r(2,5)*r(2,4),by=r(2,4),each=Math.floor(total/by);
    const safe=each*by;
    return [
      {e:e(),q:`Share ${safe} stickers equally between ${by} friends. How many each?`,a:String(each),
       h:steps(`We need to split <strong>${safe}</strong> into <strong>${by}</strong> equal groups`,`Think: ${by} × ? = ${safe}`,`${by} × ${each} = ${safe} ✓`,`Each friend gets <strong>${each}</strong> stickers`)},
    ];
  }

  // Fallback — shuffle existing practice
  return null;
}

// ════════════════════════════════════════
//  LESSON SCREEN
// ════════════════════════════════════════
function openLesson(unitIdx, lessonIdx){
  playSwooshForward();
  CUR.unitIdx = unitIdx; CUR.lessonIdx = lessonIdx;
  const u = UNITS_DATA[unitIdx];
  const l = u.lessons[lessonIdx];
  // Render shell immediately (header uses metadata only)
  document.getElementById('les-back').style.color = u.color;
  document.getElementById('les-title').textContent = `${l.icon} ${l.title}`;
  const teksBanner = document.getElementById('les-teks');
  if(teksBanner) teksBanner.textContent = u.teks || '';
  document.getElementById('les-body').innerHTML =
    `<div style="text-align:center;padding:48px 20px;color:${u.color};font-size:1.2rem">Loading…</div>`;
  show('lesson-screen');
  _loadUnit(unitIdx)
    .then(function(){ _renderLesson(unitIdx, lessonIdx); })
    .catch(function(){
      document.getElementById('les-body').innerHTML =
        '<p style="padding:20px;color:#e74c3c">Failed to load lesson. Check your connection and try again.</p>';
    });
}

function _renderLesson(unitIdx, lessonIdx){
  CUR.unitIdx = unitIdx; CUR.lessonIdx = lessonIdx;
  const u = UNITS_DATA[unitIdx];
  const l = u.lessons[lessonIdx];

  document.getElementById('les-back').style.color = u.color;
  document.getElementById('les-title').textContent = `${l.icon} ${l.title}`;
  const _teksBanner = document.getElementById('les-teks');
  if(_teksBanner) _teksBanner.textContent = u.teks || '';
  // Badge only shows when quiz passed with 80%+
  const quizPassed = SCORES.some(s => s.qid === 'lq_'+l.id && s.pct >= 80);
  const badge = document.getElementById('les-badge');
  if(quizPassed){ badge.textContent='✅'; badge.style.cssText='background:#eafaf1;color:#27ae60;border-radius:50px;padding:5px 10px;font-size:1.1rem'; }
  else { badge.textContent=''; badge.style.cssText=''; }

  const body = document.getElementById('les-body');
  body.style.setProperty('--ac', u.color);

  let html = '';

  // Key points card
  html += `<p class="sec-tip">👇 <strong>Step 1:</strong> Read these key ideas first — they are the most important things to learn in this lesson.</p>`;
  html += `<div class="learn-card"><h3 style="color:${u.color}">${_ICO.lightbulb} Key Ideas</h3><div class="kp-list">`;
  l.points.forEach(p => { html += `<div class="kp"><span class="kp-ico">⭐</span><span>${p}</span></div>`; });
  html += `</div></div>`;

  // Examples card
  html += `<p class="sec-tip">👇 <strong>Step 2:</strong> Study these worked examples carefully — they show you exactly how to solve problems step by step. Tap <em>✨ New Examples</em> to see fresh ones!</p>`;
  html += `<div class="learn-card" id="ex-card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <h3 style="color:${u.color};margin:0">📖 Worked Examples</h3>
      <button class="new-ex-btn" style="background:${u.color}" type="button"
        onclick="refreshExamples(${unitIdx},${lessonIdx})">✨ New Examples</button>
    </div>
    <div class="ex-list" id="ex-list" data-ex-idx="1">`;
  l.examples.slice(0,1).forEach((ex, i) => {
    html += renderEx(ex, i);
  });
  html += `</div></div>`;

  // Practice section — interactive MC drills from qBank (no score, no timer)
  const _practiceBank = l.qBank && l.qBank.length ? l.qBank : [];
  if(_practiceBank.length){
    const _initBatch = _shuffle([..._practiceBank]).slice(0, 3);
    html += `<p class="sec-tip">👇 <strong>Step 3:</strong> Try these practice problems! Pick your answer and get instant feedback — no score, no timer, just learning. Tap <em>➕ More</em> for fresh questions!</p>`;
    html += `<div class="practice-card" id="practice-card-${l.id}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <h3 style="color:${u.color};margin:0">✏️ Practice Drills</h3>
        <button class="more-practice-btn" style="background:${u.color}" type="button"
          onclick="morePractice(${unitIdx},${lessonIdx})">➕ More</button>
      </div>
      <div id="pq-list-${l.id}">`;
    _initBatch.forEach((q, i) => {
      html += buildPracticeQ(`prq-${l.id}-init-${i}`, q);
    });
    html += `</div></div>`;
  }

  // Lesson quiz banner
  const isLastLessonInUnit = lessonIdx === u.lessons.length - 1;
  // Check for a paused quiz for this exact lesson
  const pausedQ = getPausedQuiz('lq_'+l.id);
  const hasPausedQuiz = !!pausedQ;
  html += `<p class="sec-tip">👇 <strong>Step 4 — Quiz Time!</strong> Answer 8 questions. You need <strong>80%</strong> to ${isLastLessonInUnit ? 'unlock the <strong>Unit Quiz</strong>' : 'unlock the next lesson'}. Take your time — you can try again as many times as you need!</p>`;
  const lqDone = DONE['lq_'+l.id];
  if(hasPausedQuiz){
    // Quiz in progress — show resume banner, hide Start Quiz button
    html += `<div class="resume-banner" style="cursor:pointer" onclick="resumeQuiz('lq_${l.id}')">
      <div>
        <div class="resume-banner-h">⏸ Quiz In Progress</div>
        <div class="resume-banner-sub">You left on Question ${pausedQ.idx+1} of ${pausedQ.questions.length} · ${pausedQ.score} correct so far${(()=>{const sl=_pausedSecsLeft(pausedQ);return sl&&isTimerEnabled()?' · ⏱ '+Math.floor(sl/60)+':'+String(sl%60).padStart(2,'0')+' left':'';})()}</div>
      </div>
      <button type="button" class="resume-btn" onclick="resumeQuiz('lq_${l.id}')">▶ Resume</button>
    </div>`;
  } else {
    html += `<button type="button" class="lq-banner lq-start-btn" onclick="startLessonQuiz(${unitIdx},${lessonIdx})" style="background:linear-gradient(135deg,${u.color},${u.color}cc);width:100%;border:none;cursor:pointer;font-family:inherit;text-align:center;">
      <div class="lq-start-label">${lqDone?_ICO.repeat+' Retake Quiz':_ICO.rocket+' Start Quiz'}</div>
      <div class="lq-start-sub">${lqDone?'Try to improve your score!':'Tap here to test what you learned — 8 questions!'}</div>
    </button>`;
  }

  // Completion status — driven by quiz score
  const lqBestScore = SCORES.filter(s=>s.qid==='lq_'+l.id).sort((a,b)=>b.pct-a.pct)[0];
  const lqBestPct = lqBestScore ? lqBestScore.pct : 0;
  const lessonPassed = lqBestPct >= 80;

  // Next lesson info
  const nextLessonIdx = lessonIdx + 1;
  const isLastLesson = nextLessonIdx >= u.lessons.length;
  const nextLesson = !isLastLesson ? u.lessons[nextLessonIdx] : null;
  const nextUnlocked = !isLastLesson && isLessonUnlocked(unitIdx, nextLessonIdx);

  if(lessonPassed){
    // Integrated: complete + next lesson in one card
    if(!isLastLesson && nextUnlocked){
      html += `<div class="done-card" style="text-align:center">
        <span class="done-ico">${_ICO.trophy}</span>
        <div class="done-title">Lesson Complete! Great job!</div>
        <button class="next-lesson-btn" style="border-color:${u.color};color:${u.color};margin-top:14px;width:100%"
          onclick="openLesson(${unitIdx},${nextLessonIdx})">
          Next: ${nextLesson.icon} ${nextLesson.title} →
        </button>
      </div>`;
    } else if(isLastLesson){
      html += `<div class="done-card" style="text-align:center">
        <span class="done-ico">${_ICO.trophy}</span>
        <div class="done-title">Lesson Complete! All lessons done — take the Unit Quiz!</div>
        <button class="next-lesson-btn" style="border-color:${u.color};color:${u.color};margin-top:14px;width:100%"
          onclick="goUnit()">
          Go to Unit Quiz →
        </button>
      </div>`;
    } else {
      html += `<div class="done-card" style="text-align:center">
        <span class="done-ico">${_ICO.trophy}</span>
        <div class="done-title">Lesson Complete! Great job!</div>
      </div>`;
    }
  } else if(!isLastLesson){
    const nextLesson2 = u.lessons[nextLessonIdx];
    const subMsg = lqBestPct > 0 ? `Best score: ${lqBestPct}% — need 80% to unlock` : 'Score 80% on the quiz to unlock';
    html += `<button class="next-lesson-btn next-lesson-locked"
      onclick="showLockToast('Score 80% or higher on this lesson quiz to unlock the next lesson!', true)">
        ${_ICO.lock} Next: ${nextLesson2.icon} ${nextLesson2.title}
        <div style="font-size:.78rem;font-weight:400;opacity:.7;margin-top:3px">${subMsg}</div>
      </button>`;
  } else {
    const uqUnlocked = isUnitQuizUnlocked(unitIdx);
    if(uqUnlocked){
      html += `<button class="next-lesson-btn" style="border-color:${u.color};color:${u.color}"
        onclick="goUnit()">📝 Go to Unit Quiz →</button>`;
    } else {
      const subMsg2 = lqBestPct > 0 ? `Best score: ${lqBestPct}% — need 80% to unlock` : 'Score 80% on the quiz to unlock';
      html += `<button class="next-lesson-btn next-lesson-locked"
        onclick="showLockToast('Get 80% or higher on all lessons to unlock the unit quiz!')">
          ${_ICO.lock} Unit Quiz
          <div style="font-size:.78rem;font-weight:400;opacity:.7;margin-top:3px">${subMsg2}</div>
        </button>`;
    }
  }

  body.innerHTML = html;
}

// ── Quiz Timer ───────────────────────────────────
let _quizTimer = null;
let _quizSecsLeft = 0;
let _quizStartedAt = 0;  // Date.now() when quiz began — used for tamper-resistant timer

// Compute remaining seconds from paused quiz timestamps (tamper-resistant)
function _pausedSecsLeft(p){
  // New format: startedAt/pausedAt timestamps
  if(p.startedAt && p.pausedAt){
    const isFinal = p.type === 'final';
    const totalDuration = isFinal ? getFinalTimerSecs() : p.type==='unit' ? getUnitTimerSecs() : getLessonTimerSecs();
    const elapsed = Math.floor((p.pausedAt - p.startedAt) / 1000);
    return Math.max(0, Math.min(totalDuration, totalDuration - elapsed));
  }
  // Legacy format: raw secsLeft (backward compat for existing paused quizzes)
  return p.secsLeft || 0;
}

function _startTimer(seconds, color){
  if(!isTimerEnabled()){
    // Timer disabled by parent — hide display and don't count down
    const el = document.getElementById('qtimer');
    if(el) el.style.display = 'none';
    return;
  }
  const el2 = document.getElementById('qtimer');
  if(el2) el2.style.display = '';
  _clearTimer();
  _quizSecsLeft = seconds;
  _updateTimerDisplay(color);
  _quizTimer = setInterval(()=>{
    _quizSecsLeft--;
    _updateTimerDisplay(color);
    if(_quizSecsLeft <= 0){
      _clearTimer();
      _timeUp();
    }
  }, 1000);
}

function _clearTimer(){
  if(_quizTimer){ clearInterval(_quizTimer); _quizTimer = null; }
}

function _updateTimerDisplay(color){
  const el = document.getElementById('qtimer');
  if(!el) return;
  const m = Math.floor(_quizSecsLeft / 60);
  const s = _quizSecsLeft % 60;
  el.textContent = '⏱ ' + m + ':' + String(s).padStart(2,'0');
  el.style.color = '';
  el.style.background = '';
  el.className = 'q-timer';
  if(_quizSecsLeft <= 60){
    el.classList.add('danger');
  } else if(_quizSecsLeft <= 180){
    el.classList.add('warn');
  } else {
    el.style.background = color+'22';
    el.style.color = color;
  }
}

function _timeUp(){
  // Auto-finish — mark all unanswered questions as wrong then show results
  const qz = CUR.quiz;
  if(!qz) return;
  // Fill in any remaining unanswered questions as skipped
  while(qz.answers.length < qz.questions.length){
    const q = qz.questions[qz.answers.length];
    qz.answers.push({t:q.t, chosen:'(Time ran out)', correct:q.o[q.a], ok:false, exp:q.e});
  }
  // Force finish
  _finishQuiz();
}
