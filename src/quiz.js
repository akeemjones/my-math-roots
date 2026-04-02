// Render question text: SVG content passes through raw (trusted data files only),
// plain text is HTML-escaped to prevent XSS.
function _qText(t){ return (typeof t === 'string' && t.includes('<svg')) ? t : _escHtml(t); }


// ════════════════════════════════════════
//  SOUND ENGINE (Web Audio API)
// ════════════════════════════════════════
let _audioCtx = null;
function _getAudio(){
  if(!isSoundEnabled()) return null;
  if(!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function playSwooshBack(){
  try {
    const ctx = _getAudio();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(520, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0.22, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.22);
  } catch(e){}
}

function playSwooshForward(){
  try {
    const ctx = _getAudio();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(200, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.16);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
  } catch(e){}
}

function playTap(){
  try {
    const ctx = _getAudio();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.08);
  } catch(e){}
}

function playCorrect(){
  try {
    const ctx = _getAudio();
    // Happy two-tone ding: C5 then E5
    [[523, 0, 0.12], [659, 0.13, 0.18]].forEach(([freq, start, dur]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(0.35, ctx.currentTime + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + dur + 0.05);
    });
  } catch(e){}
}

function playWrong(){
  try {
    const ctx = _getAudio();
    // Low descending buzz
    [[220, 0, 0.15], [196, 0.12, 0.18]].forEach(([freq, start, dur]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sawtooth';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + dur + 0.05);
    });
  } catch(e){}
}

function playPassQuiz(){
  try {
    const ctx = _getAudio();
    // Fanfare: C5 E5 G5 C6 — celebratory rising arpeggio
    [[523,0],[659,0.12],[784,0.24],[1047,0.36],[784,0.52],[1047,0.62]].forEach(([freq, start]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = freq;
      const t = ctx.currentTime + start;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.start(t);
      o.stop(t + 0.25);
    });
  } catch(e){}
}

function playConfettiBurst(){
  try {
    const ctx = _getAudio();
    // White noise burst = confetti pop
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.35, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i] = (Math.random()*2-1);
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 1800;
    filt.Q.value = 0.5;
    src.buffer = buf;
    src.connect(filt); filt.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    src.start();
    src.stop(ctx.currentTime + 0.4);
  } catch(e){}
}

// ════════════════════════════════════════
//  QUIZ ENGINE
// ════════════════════════════════════════
// ── Quiz helpers ─────────────────────────────────
// Called by inline onclick — avoids post-innerHTML assignment issues
function startLessonQuiz(unitIdx, lessonIdx){
  CUR.lessonIdx = lessonIdx;
  _loadUnit(unitIdx).then(function(){
    const l = UNITS_DATA[unitIdx].lessons[lessonIdx];
    _runQuiz(l.qBank||l.quiz, 'lq_'+l.id, l.icon+' '+l.title, 'lesson', unitIdx);
  }).catch(function(){ alert('Could not load quiz. Check your connection.'); });
}

function startUnitQuiz(unitIdx){
  _loadUnit(unitIdx).then(function(){
    const u = UNITS_DATA[unitIdx];
    _runQuiz(u.testBank||u.unitQuiz, u.id+'_uq', u.name+' — Unit Test', 'unit', unitIdx);
  }).catch(function(){ alert('Could not load quiz. Check your connection.'); });
}

function _getPausedAll(){ try{ const d=JSON.parse(localStorage.getItem(QUIZ_PAUSE_KEY)); if(!d) return {}; if(d.id) return {}; return d; }catch{ return {}; } }
function getPausedQuiz(qid){ try{ return _getPausedAll()[qid]||null; }catch{ return null; } }
function _savePausedQuiz(qid, data){ const all=_getPausedAll(); all[qid]=data; localStorage.setItem(QUIZ_PAUSE_KEY, JSON.stringify(all)); }
function _clearPausedQuiz(qid){ const all=_getPausedAll(); delete all[qid]; localStorage.setItem(QUIZ_PAUSE_KEY, JSON.stringify(all)); }

function resumeQuiz(qid){
  const p = getPausedQuiz(qid);
  if(!p) return;
  _clearPausedQuiz(qid);
  CUR.unitIdx = p.unitIdx;
  CUR.lessonIdx = p.lessonIdx;
  const isFinal = p.type === 'final';
  const u = !isFinal && p.unitIdx != null ? UNITS_DATA[p.unitIdx] : null;
  const color = u ? u.color : '#6c5ce7';
  CUR.quiz = { questions:p.questions, idx:p.idx, viewIdx:p.idx, score:p.score, answers:p.answers,
               id:p.id, label:p.label, type:p.type };
  document.getElementById('quiz-title').innerHTML = p.label;
  document.getElementById('quiz-back').style.color = color;
  document.getElementById('qscore').style.background = color+'22';
  document.getElementById('qscore').style.color = color;
  document.getElementById('qpbf').style.background = color;
  // Resume timer from where it was paused (uses timestamps to prevent manipulation)
  if(isTimerEnabled()){
    const secsLeft = _pausedSecsLeft(p);
    if(secsLeft > 0){
      const totalDuration = isFinal ? getFinalTimerSecs() : p.type==='unit' ? getUnitTimerSecs() : getLessonTimerSecs();
      const elapsed = totalDuration - secsLeft;
      _quizStartedAt = Date.now() - (elapsed * 1000);
      _quizSecsLeft = secsLeft;
      _startTimer(secsLeft, color);
    } else {
      const secs = isFinal ? getFinalTimerSecs() : p.type==='unit' ? getUnitTimerSecs() : getLessonTimerSecs();
      _quizStartedAt = Date.now();
      _startTimer(secs, color);
    }
  }
  playSwooshForward();
  _renderQ();
  show('quiz-screen');
}

// ── Adaptive weighted question sampler ──────────────────────────────────────
// Core mastery sampler: scores each question by history, samples N without replacement.
// Weak/unseen questions get higher weight; mastered ones fade but never disappear.
function _masteryWeightedSample(bank, n){
  const now = Date.now();
  const DAY = 86400000;
  const pool = bank.map(function(q){
    const m = MASTERY[_qKey(q.t)];
    let w;
    if(!m || m.attempts === 0){
      w = 1.5; // never seen — moderate priority
    } else {
      const acc = m.correct / m.attempts;           // 0=always wrong, 1=always right
      const daysSince = (now - m.lastSeen) / DAY;
      const decay = Math.min(daysSince / 7, 1) * 0.5; // fades mastered Qs back in after 1 week
      w = (1 - acc) * 2.0 + decay + 0.1;           // 0.1 floor so mastered Qs stay possible
    }
    return { q, w };
  });
  const result = [];
  const remaining = [...pool];
  for(let i = 0; i < Math.min(n, remaining.length); i++){
    const total = remaining.reduce(function(s, x){ return s + x.w; }, 0);
    let r = Math.random() * total;
    let pick = remaining.length - 1;
    for(let j = 0; j < remaining.length; j++){
      r -= remaining[j].w;
      if(r <= 0){ pick = j; break; }
    }
    result.push(remaining[pick].q);
    remaining.splice(pick, 1);
  }
  return result;
}

// ── Difficulty-stratified sampler ────────────────────────────────────────────
// Draws from Easy / Medium / Hard tiers separately so each quiz has a balanced
// mix that challenges students and surfaces weaknesses.
// Falls back to flat mastery sampling when no d-field is present (backward compat).
//
// Draw targets by quiz type:
//   lesson   (8 Qs):  3 easy + 3 medium + 2 hard
//   unit    (25 Qs):  8 easy + 10 medium + 7 hard
//   final   (50 Qs): 15 easy + 20 medium + 15 hard
//   balanced (5/unit): 1 easy + 2 medium + 2 hard (guaranteed per-unit coverage)
const _DIFF_TARGETS = {
  lesson:   { e:3, m:3, h:2 },
  unit:     { e:8, m:10, h:7 },
  final:    { e:15, m:20, h:15 },
  balanced: { e:1, m:2, h:2 },
};

function _weightedSample(bank, n, quizType){
  // Backward compat: if no questions have a d field, use flat sampler
  if(!bank.some(function(q){ return q.d; })){
    return _masteryWeightedSample(bank, n);
  }

  const targets = _DIFF_TARGETS[quizType] || _DIFF_TARGETS.lesson;
  const tiers = {
    e: bank.filter(function(q){ return q.d === 'e'; }),
    m: bank.filter(function(q){ return q.d === 'm' || !q.d; }), // untagged → medium
    h: bank.filter(function(q){ return q.d === 'h'; }),
  };

  // Copy targets and redistribute shortfall from under-sized tiers
  const draws = { e: targets.e, m: targets.m, h: targets.h };
  ['e','m','h'].forEach(function(d){
    const shortage = Math.max(0, draws[d] - tiers[d].length);
    if(shortage > 0){
      draws[d] = tiers[d].length;
      const others = ['e','m','h'].filter(function(x){ return x !== d; });
      const otherTotal = others.reduce(function(s,x){ return s + draws[x]; }, 0);
      if(otherTotal > 0){
        others.forEach(function(x){
          draws[x] += Math.round(shortage * draws[x] / otherTotal);
        });
      } else {
        others.forEach(function(x){ draws[x] += Math.ceil(shortage / 2); });
      }
    }
  });

  // Clamp total to n (rounding can push it slightly over)
  let drawTotal = draws.e + draws.m + draws.h;
  while(drawTotal > n){
    const biggest = ['e','m','h'].reduce(function(a,b){ return draws[a] >= draws[b] ? a : b; });
    draws[biggest]--;
    drawTotal--;
  }

  // Sample from each tier using mastery weighting, then shuffle result
  const result = [
    ..._masteryWeightedSample(tiers.e, draws.e),
    ..._masteryWeightedSample(tiers.m, draws.m),
    ..._masteryWeightedSample(tiers.h, draws.h),
  ];
  for(let i = result.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i]; result[i] = result[j]; result[j] = tmp;
  }
  return result;
}

function _runQuiz(bank, qid, label, type, unitIdx, _prebuiltQs){
  if(!_prebuiltQs && (!bank || bank.length === 0)){ alert('No questions found for this quiz.'); return; }
  CUR.unitIdx = unitIdx != null ? unitIdx : null;
  const u = unitIdx != null ? UNITS_DATA[unitIdx] : null;
  const color = u ? u.color : '#6c5ce7';
  const n = type==='final' ? 50 : type==='unit' ? 25 : 8;
  const qs = _prebuiltQs || _weightedSample(bank, n, type);

  CUR.quiz = { questions:qs, idx:0, viewIdx:0, score:0, answers:[], id:qid, label, type };
  _quizStartedAt = Date.now();

  document.getElementById('quiz-title').innerHTML = label;
  document.getElementById('quiz-back').style.color = color;
  document.getElementById('qscore').style.background = color+'22';
  document.getElementById('qscore').style.color = color;
  document.getElementById('qpbf').style.background = color;

  // Timer: 60 min for final, configurable for unit/lesson
  const secs = type === 'final' ? getFinalTimerSecs() : type === 'unit' ? getUnitTimerSecs() : getLessonTimerSecs();
  // Defer timer start if quiz spotlight tour hasn't run yet (tour will start it when done)
  if(!localStorage.getItem('wb_spot_quiz-screen')){
    _pendingTimerSecs  = secs;
    _pendingTimerColor = color;
  } else {
    _startTimer(secs, color);
  }

  _renderQ();
  show('quiz-screen');
}

function _renderQ(){
  const qz = CUR.quiz;
  const u = CUR.unitIdx != null ? UNITS_DATA[CUR.unitIdx] : { color:'#6c5ce7' };
  const total = qz.questions.length;
  if(qz.viewIdx == null) qz.viewIdx = qz.idx;
  const isReview = qz.viewIdx < qz.idx;
  const qIdx = qz.viewIdx;
  const q = qz.questions[qIdx];

  document.getElementById('qlbl').textContent = 'Question '+(qIdx+1)+' of '+total;
  document.getElementById('qscore').textContent = qz.score+' correct';
  const qbadge = document.getElementById('quiz-badge');
  if(qbadge) qbadge.textContent = 'Q'+(qIdx+1)+'/'+total;
  document.getElementById('qpbf').style.width = (qz.idx/total*100)+'%';

  const nb = document.getElementById('next-btn');
  const pb = document.getElementById('prev-btn');
  if(pb) pb.style.display = qIdx > 0 ? 'block' : 'none';

  if(isReview){
    // Read-only: render past answered question
    const past = qz.answers[qIdx];
    const correct = past ? past.correct : q.o[q.a];
    const chosen = past ? past.chosen : null;
    nb.style.display = 'block';
    nb.innerHTML = (qIdx >= qz.idx - 1) ? 'Back to Current →' : 'Forward →';
    document.getElementById('qcard').innerHTML =
      '<div class="q-num" style="color:'+u.color+'">Question '+(qIdx+1)+'</div>'+
      '<div class="q-text">'+_qText(q.t)+'</div>'+(q.s?'<div class="q-visual">'+q.s+'</div>':'')+
      '<div style="font-size:var(--fs-sm);color:var(--txt2);margin-bottom:10px">' + _ICO.eyeOn + ' Review — answer locked</div>'+
      '<div class="agrid">'+
        (past && past.opts ? past.opts : q.o).map(text=>{
          let cls = 'abtn';
          let prefix = '';
          if(text === correct){ cls += ' correct'; if(document.body.classList.contains('a11y-colorblind')) prefix = '✓ '; }
          if(chosen && text === chosen && text !== correct){ cls += ' wrong'; if(document.body.classList.contains('a11y-colorblind')) prefix = '✗ '; }
          return '<button class="'+cls+'" type="button" disabled>'+prefix+_escHtml(text)+'</button>';
        }).join('')+
      '</div>'+
      (past ? '<div class="reveal show '+(past.ok?'ok':'no')+'">'+
        '<div class="rev-h '+(past.ok?'ok':'no')+'">'+(past.ok?'🎉 Correct! Great job!':'😊 Not quite...')+'</div>'+
        (!past.ok ? '<div class="rev-correct">✅ Correct answer: '+_escHtml(correct)+'</div>' : '')+
        '<div class="rev-exp">' + _ICO.lightbulb + ' '+_escHtml(past.exp)+'</div>'+
        (past.timeSecs != null ? '<div class="rev-time">⏱ '+past.timeSecs+'s on this question</div>' : '')+
      '</div>' : '');
    qz._answered = true;
    return;
  }

  // Normal mode — unanswered current question
  const opts = _shuffle([...q.o].map((text,i)=>({text,i})));
  qz._opts = opts;
  const correct = q.o[q.a];

  nb.style.display = 'none';
  nb.innerHTML = (qz.idx === total-1) ? 'See Results! ' + _ICO.trophy : 'Next Question →';

  // Use inline onclick with data-index — no addEventListener stacking
  document.getElementById('qcard').innerHTML =
    '<div class="q-num" style="color:'+u.color+'">Question '+(qIdx+1)+'</div>'+
    '<div class="q-text" role="heading" aria-level="2">'+_qText(q.t)+'</div>'+(q.s?'<div class="q-visual">'+q.s+'</div>':'')+
    '<div class="agrid" role="group" aria-label="Answer choices">'+
      opts.map((opt,i)=>
        '<button class="abtn" type="button" data-action="_pickAnswer" data-arg="'+i+'" id="abtn-'+i+'" aria-label="Answer: '+_escHtml(opt.text)+'">'+_escHtml(opt.text)+'</button>'
      ).join('')+
    '</div>'+
    '<div class="reveal" id="qreveal" role="status" aria-live="polite" aria-atomic="true"></div>';

  // Store correct text for answer checking
  qz._correct = correct;
  qz._answered = false;
  // Per-question timer — captures how long student spends on this question
  qz._qStartedAt = Date.now();
}

function _pickAnswer(btnIdx){
  const qz = CUR.quiz;
  if(!qz || qz._answered) return;
  qz._answered = true;

  const chosen = qz._opts[btnIdx].text;
  const correct = qz._correct;
  const isOk = chosen === correct;
  const q = qz.questions[qz.idx];
  const qTimeSecs = qz._qStartedAt ? Math.round((Date.now() - qz._qStartedAt) / 1000) : null;

  // Disable all buttons immediately, show neutral "selected" on tapped button
  qz._opts.forEach((opt,i)=>{
    const btn = document.getElementById('abtn-'+i);
    if(btn) btn.disabled = true;
  });
  const picked = document.getElementById('abtn-'+btnIdx);
  if(picked) picked.classList.add('selected');

  // After brief pause, reveal correct/wrong feedback
  setTimeout(()=>{
    if(picked) picked.classList.remove('selected');
    qz._opts.forEach((opt,i)=>{
      const btn = document.getElementById('abtn-'+i);
      if(!btn) return;
      if(opt.text === correct){ btn.classList.add('correct'); if(document.body.classList.contains('a11y-colorblind')) btn.textContent = '✓ ' + btn.textContent; }
    });
    if(picked){ picked.classList.add(isOk ? 'correct' : 'wrong'); if(!isOk && document.body.classList.contains('a11y-colorblind')) picked.textContent = '✗ ' + picked.textContent; }
    // Haptic feedback for wrong answers (mobile devices) — only when enabled in accessibility settings
    if(!isOk && document.body.classList.contains('a11y-haptic') && navigator.vibrate) try{ navigator.vibrate(150); }catch(e){}

    if(isOk){ qz.score++; confetti(16); playCorrect(); }
    else { playWrong(); }
    document.getElementById('qscore').textContent = qz.score+' correct';

    const rev = document.getElementById('qreveal');
    if(rev){
      // Pick a short formative nudge for wrong answers (cycles through a few phrases)
      const _nudges = [
        "Take a deep breath — you\'ve got this! Read the tip and try the next one. 💪",
        "Mistakes help us learn! Check the tip above and keep going. 🌟",
        "Almost! Read the explanation and you\'ll get the next one. 🚀",
        "Don\'t give up — every wrong answer makes you smarter! 🧠",
        "You\'re still doing great! Read the tip and move on. ⭐"
      ];
      const nudge = _nudges[(qz.idx || 0) % _nudges.length];
      const revId = 'rev-'+Date.now();
      rev.className = 'reveal show '+(isOk?'ok':'no');
      rev.innerHTML =
        '<div class="rev-h '+(isOk?'ok':'no')+'">'+(isOk?'🎉 Correct! Great job!':'😊 Not quite...')+'</div>'+
        (!isOk ? '<div class="rev-correct">✅ Correct answer: '+_escHtml(correct)+'</div>' : '')+
        '<div class="rev-exp" id="'+revId+'-exp">' + _ICO.lightbulb + ' '+_escHtml(q.e)+'</div>'+
        (!isOk ? '<div class="rev-tip">'+_escHtml(nudge)+'</div>' : '');
    }

    qz.answers.push({t:q.t, chosen, correct, ok:isOk, exp:q.e, opts:qz._opts.map(o=>o.text), timeSecs:qTimeSecs});

    const nb = document.getElementById('next-btn');
    if(nb){
      nb.style.display = 'block';
      // Auto-scroll so the Next button is visible without manual scrolling
      setTimeout(()=> nb.scrollIntoView({ behavior:'smooth', block:'end' }), 60);
    }
  }, 120);
}

function nextQ(){
  const qz = CUR.quiz;
  if(!qz) return;
  if(qz.viewIdx < qz.idx){
    // In review mode — advance viewIdx forward
    qz.viewIdx++;
    _renderQ();
  } else {
    // At current unanswered question — advance to next
    qz.idx++;
    qz.viewIdx = qz.idx;
    if(qz.idx >= qz.questions.length) _finishQuiz();
    else _renderQ();
  }
}

function prevQ(){
  const qz = CUR.quiz;
  if(!qz || qz.viewIdx <= 0) return;
  qz.viewIdx--;
  _renderQ();
}

function quitQuiz(){
  playSwooshBack();
  _clearTimer();
  // Save quiz state so student can resume
  if(CUR.quiz && CUR.quiz.idx < CUR.quiz.questions.length){
    const paused = {
      questions: CUR.quiz.questions,
      idx: CUR.quiz.idx,
      score: CUR.quiz.score,
      answers: CUR.quiz.answers,
      id: CUR.quiz.id,
      label: CUR.quiz.label,
      type: CUR.quiz.type,
      unitIdx: CUR.unitIdx,
      lessonIdx: CUR.lessonIdx,
      startedAt: _quizStartedAt,
      pausedAt: Date.now()
    };
    _savePausedQuiz(CUR.quiz.id, paused);
  }
  if(CUR.quiz && CUR.quiz.type==='lesson') openLesson(CUR.unitIdx, CUR.lessonIdx);
  else if(CUR.quiz && CUR.quiz.type==='final') goHome();
  else goUnit();
}

function retryQuiz(){
  const qz = CUR.quiz;
  if(!qz) return;
  if(qz.type==='lesson') startLessonQuiz(CUR.unitIdx, CUR.lessonIdx);
  else if(qz.type==='final') qz.id === 'final_test_balanced' ? startFinalTestBalanced() : startFinalTest();
  else startUnitQuiz(CUR.unitIdx);
}

function _practiceWeak(){
  const qz = CUR.quiz;
  if(!qz) return;
  // Session wrong questions first
  const weakBank = qz.answers
    .map(function(a, i){ return a.ok ? null : qz.questions[i]; })
    .filter(Boolean);
  // Add historically weak Qs from same unit (if content already loaded)
  if(CUR.unitIdx !== null){
    const u = UNITS_DATA[CUR.unitIdx];
    if(u && u._loaded){
      const allQ = u.lessons.flatMap(function(l){ return l.qBank || []; });
      allQ.forEach(function(q){
        const m = MASTERY[_qKey(q.t)];
        if(m && m.attempts >= 2 && (m.correct / m.attempts) < 0.6){
          if(!weakBank.some(function(w){ return w.t === q.t; })) weakBank.push(q);
        }
      });
    }
  }
  if(!weakBank.length) return;
  _runQuiz(weakBank, qz.id, qz.label + ' — Practice', qz.type, CUR.unitIdx);
}
//  RESULTS

// ════════════════════════════════════════
// ── GUIDED REMEDIATION ───────────────────
// Returns an HTML block with a targeted review recommendation, or '' if score is passing.
function _guidedRemediation(qz, pct, u){
  if(pct >= 80 || !u) return '';

  let heading = '', body = '', btnHtml = '';

  if(qz.type === 'lesson'){
    // Recommend reviewing the current lesson content
    const l = u.lessons[CUR.lessonIdx];
    heading = `📖 Recommended Review`;
    body = `Re-read <strong>${l ? l.icon+' '+l.title : 'this lesson'}</strong> — focus on the Key Ideas and Worked Examples, then try again.`;
    btnHtml = l ? `<button class="rem-btn" data-action="openLesson" data-arg="${CUR.unitIdx}" data-arg2="${CUR.lessonIdx}">Go Back to ${_escHtml(l.title)}</button>` : '';

  } else if(qz.type === 'unit'){
    // Find the lesson in this unit with the lowest quiz score
    let weakLesson = null, weakPct = 101;
    u.lessons.forEach((l, li) => {
      const best = SCORES.filter(s => s.qid === 'lq_'+l.id).sort((a,b)=>b.pct-a.pct)[0];
      const lPct = best ? best.pct : 0;
      if(lPct < weakPct){ weakPct = lPct; weakLesson = {l, li, lPct}; }
    });
    if(weakLesson){
      heading = `📖 Focus Area`;
      const label = weakLesson.lPct > 0 ? `(your best: ${weakLesson.lPct}%)` : '(not yet passed)';
      body = `Your weakest lesson is <strong>${weakLesson.l.icon} ${weakLesson.l.title}</strong> ${label}. Review it before retrying the unit quiz.`;
      btnHtml = `<button class="rem-btn" data-action="openLesson" data-arg="${CUR.unitIdx}" data-arg2="${weakLesson.li}">Review ${_escHtml(weakLesson.l.title)}</button>`;
    }

  } else if(qz.type === 'final'){
    // Find the unit with the lowest unit quiz score
    let weakUnit = null, weakPct = 101;
    UNITS_DATA.forEach((uu, ui) => {
      const best = SCORES.filter(s => s.qid === uu.id+'_uq').sort((a,b)=>b.pct-a.pct)[0];
      const uPct = best ? best.pct : 0;
      if(uPct < weakPct){ weakPct = uPct; weakUnit = {uu, ui, uPct}; }
    });
    if(weakUnit){
      heading = `📖 Focus Area`;
      const label = weakUnit.uPct > 0 ? `(your best: ${weakUnit.uPct}%)` : '(not yet passed)';
      body = `Your weakest unit is <strong>${weakUnit.uu.name}</strong> ${label}. Review it to boost your Final Test score.`;
      btnHtml = `<button class="rem-btn" data-action="openUnit" data-arg="${weakUnit.ui}">Review ${_escHtml(weakUnit.uu.name)}</button>`;
    }
  }

  if(!heading) return '';
  return `<div class="rem-block">
    <div class="rem-head">${heading}</div>
    <div class="rem-body">${body}</div>
    ${btnHtml}
  </div>`;
}

function _finishQuiz(){
  _clearTimer();
  _clearPausedQuiz(CUR.quiz ? CUR.quiz.id : ''); // Clear pause — quiz is done
  // Safety guard — if called with no active quiz, bail out
  if(!CUR.quiz || (CUR.quiz.type !== 'final' && !UNITS_DATA[CUR.unitIdx])){
    show('results-screen');
    return;
  }
  const qz = CUR.quiz;
  const u = CUR.unitIdx != null ? UNITS_DATA[CUR.unitIdx] : { color:'#6c5ce7', name:'Final Test', id:'final' };
  const total = qz.questions.length;
  const pct = Math.floor(qz.score/total*100);

  // ── Capture first-time pass BEFORE adding to SCORES ──
  const _isPassing = pct >= 80;
  const _isFirstTimePass = _isPassing && !SCORES.some(s => s.qid === qz.id && s.pct >= 80);

  // ── AUTO-SAVE score immediately so lock system can see it ──
  const cfg = loadSettings();
  const studentName = cfg.studentName || 'Student';
  const totalSecs = qz.type === 'final' ? getFinalTimerSecs() : qz.type === 'unit' ? getUnitTimerSecs() : getLessonTimerSecs();
  const elapsedSecs = Math.max(0, totalSecs - Math.max(0, _quizSecsLeft));
  const elapsedMin = Math.floor(elapsedSecs / 60);
  const elapsedSec = elapsedSecs % 60;
  const timeTaken = elapsedMin + ':' + String(elapsedSec).padStart(2,'0');

  const autoEntry = {
    qid: qz.id, label: qz.label, type: qz.type,
    score: qz.score, total, pct,
    stars: pct===100?'⭐⭐⭐':pct>=90?'⭐⭐⭐':pct>=80?'⭐⭐':pct>=60?'⭐':'',
    unitIdx: CUR.unitIdx, color: u.color,
    name: studentName, id: Date.now(),
    timeTaken,
    answers: qz.answers ? qz.answers.map(a=>({t:a.t,chosen:a.chosen,correct:a.correct,ok:a.ok,exp:a.exp,opts:a.opts,timeSecs:a.timeSecs})) : [],
    date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
    time: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
  };
  if(_supaUser || autoEntry.qid === 'lq_u1l1'){
    if(_supaUser) autoEntry._sig = _scoreSig(autoEntry);
    SCORES.unshift(autoEntry);
    if(SCORES.length>200) SCORES.pop();
    saveSc();
  }
  if(qz.answers && qz.answers.length) _updateMastery(qz.answers);

  // ── Streak rule: first-time pass OR all content complete ──
  // True when every lesson, unit quiz, and final test has been passed (≥80%)
  function _allContentComplete(){
    if(!Array.isArray(UNITS_DATA)) return false;
    for(const unit of UNITS_DATA){
      for(const lesson of (unit.lessons||[])){
        if(!SCORES.some(s=>s.qid==='lq_'+lesson.id&&s.pct>=80)) return false;
      }
      if(!SCORES.some(s=>s.qid===unit.id+'_uq'&&s.pct>=80)) return false;
    }
    // Only the mastery-mode final test (qid='final_test') counts for full completion.
    // The balanced test (qid='final_test_balanced') is a supplementary mode.
    return SCORES.some(s=>s.qid==='final_test'&&s.pct>=80);
  }

  // ── Mark lesson done automatically when quiz is completed ──
  if(qz.type==='lesson'){
    // Extract lesson id from qid (format: lq_u1l1)
    const lid = qz.id.replace('lq_','');
    DONE[lid] = true;
    DONE[qz.id] = true;
    saveDone();
    if(_isFirstTimePass || (_isPassing && _allContentComplete())) _updateStreak();
    _checkSoftGate('lesson');
  } else if(qz.type === 'unit'){
    if(_isFirstTimePass || (_isPassing && _allContentComplete())) _updateStreak();
    _checkSoftGate('unit');
  } else if(qz.type === 'final'){
    if(_isFirstTimePass || (_isPassing && _allContentComplete())) _updateStreak();
  }

  let emoji, msg, stars;
  if(pct===100){emoji=_ICO.trophy;msg='PERFECT SCORE! You are a math superstar!';stars='⭐⭐⭐';}
  else if(pct>=90){emoji=_ICO.medal;msg='Outstanding! Almost perfect!';stars='⭐⭐⭐';}
  else if(pct>=80){emoji='🎉';msg='Great job! You really know this material!';stars='⭐⭐';}
  else if(pct>=70){emoji='😊';msg='Good work! A little more practice will help!';stars='⭐⭐';}
  else if(pct>=60){emoji=_ICO.muscle;msg='Keep practicing — you are getting there!';stars='⭐';}
  else{emoji='📚';msg='Let\'s review and try again! You can do it!';stars='⭐';}

  // ── Unlock message ──
  let unlockMsg = '';
  if(qz.type==='lesson'){
    if(pct>=80){
      const nextIdx = CUR.lessonIdx + 1;
      if(nextIdx < u.lessons.length)
        unlockMsg = `<div class="unlock-banner">${_ICO.unlock} Lesson ${nextIdx+1} — ${u.lessons[nextIdx].title} — unlocked!</div>`;
      else
        unlockMsg = `<div class="unlock-banner">${_ICO.unlock} All lessons done! Unit Quiz now unlocked!</div>`;
    } else {
      unlockMsg = `<div class="lock-banner">${_ICO.lock} Need 80%+ to unlock the next lesson — you got ${pct}%. Try again!</div>`;
    }
  } else if(qz.type==='unit'){
    if(pct>=80){
      const nextUnitIdx = CUR.unitIdx + 1;
      if(nextUnitIdx < UNITS_DATA.length)
        unlockMsg = `<div class="unlock-banner">${_ICO.unlock} Unit ${nextUnitIdx+1}: ${UNITS_DATA[nextUnitIdx].name} unlocked!</div>`;
      else
        unlockMsg = `<div class="unlock-banner">${_ICO.trophy} You completed all units! Take the Final Test from the home screen!</div>`;
    } else {
      unlockMsg = `<div class="lock-banner">${_ICO.lock} Need 80%+ to unlock the next unit. You got ${pct}% — keep trying!</div>`;
    }
  } else if(qz.type==='final'){
    if(pct>=80)
      unlockMsg = `<div class="unlock-banner">${_ICO.graduation} Congratulations! You passed the Final Test with ${pct}%! You are a Math Master!</div>`;
    else
      unlockMsg = `<div class="lock-banner">📚 Need 80%+ to pass the Final Test. You got ${pct}% — keep reviewing and try again!</div>`;
  }

  const elTitle = document.getElementById('res-title');
  const elBack  = document.getElementById('res-back');
  const elCard  = document.getElementById('res-card');
  const elReview= document.getElementById('res-review');
  const elBtns  = document.getElementById('res-btns');
  if(!elTitle || !elCard || !elReview || !elBtns){ show('results-screen'); return; }
  elTitle.textContent = qz.label+' — Results';
  if(elBack) elBack.style.color = u.color;

  const timeLeft = Math.max(0, _quizSecsLeft);
  const timeStr = timeLeft > 0
    ? `${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,'0')} remaining`
    : 'Time ran out';

  elCard.innerHTML = `
    <span class="r-emoji">${emoji}</span>
    <div class="r-score" style="color:${u.color}">${qz.score} / ${total}</div>
    <div class="r-pct">${pct}%</div>
    <div class="r-msg">${msg}</div>
    <div class="r-stars">${stars}</div>
    <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-base);color:var(--txt2);margin-top:6px">⏱ ${timeStr}</div>
    ${unlockMsg}
    ${_guidedRemediation(qz, pct, u)}`;

  // Score is auto-saved — show confirmation in save-card div
  const saveCard = document.getElementById('save-card');
  if(saveCard) saveCard.innerHTML = `<p style="text-align:center;font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-base);color:var(--txt2);margin-bottom:8px">✅ Score auto-saved for <strong>${_escHtml(studentName)}</strong></p>`;

  // Review sections
  const wrong = qz.answers.filter(a=>!a.ok);
  const right  = qz.answers.filter(a=>a.ok);
  let rv = '';
  if(wrong.length) rv += buildRevSection('❌ Review These Questions', wrong, '#e74c3c', false);
  if(right.length) rv += buildRevSection('✅ Correct Answers', right, '#27ae60', true);
  elReview.innerHTML = rv;

  // ── Results action buttons ──
  let nextBtn = '';
  if(qz.type==='lesson'){
    const nextIdx = CUR.lessonIdx + 1;
    if(pct>=80 && nextIdx < u.lessons.length){
      const nl = u.lessons[nextIdx];
      nextBtn = `<button class="rbtn" style="background:linear-gradient(135deg,${u.color},${u.color}aa)"
        data-action="openLesson" data-arg="${CUR.unitIdx}" data-arg2="${nextIdx}">
        Next Lesson: ${nl.icon} ${nl.title} →
      </button>`;
    } else if(pct>=80 && nextIdx >= u.lessons.length){
      nextBtn = `<button class="rbtn" style="background:linear-gradient(135deg,${u.color},${u.color}aa)"
        data-action="goUnit">
        📝 Go to Unit Quiz →
      </button>`;
    }
  } else if(qz.type==='unit' && pct>=80){
    const nextUnitIdx = CUR.unitIdx + 1;
    if(nextUnitIdx < UNITS_DATA.length){
      nextBtn = `<button class="rbtn" style="background:linear-gradient(135deg,${UNITS_DATA[nextUnitIdx].color},${UNITS_DATA[nextUnitIdx].color}aa)"
        data-action="openUnit" data-arg="${nextUnitIdx}">
        Next Unit: <span style="display:inline-block;width:1.2em;height:1.2em;vertical-align:middle">${UNITS_DATA[nextUnitIdx].svg||UNITS_DATA[nextUnitIdx].icon}</span> ${UNITS_DATA[nextUnitIdx].name} →
      </button>`;
    }
  }

  const backLabel = qz.type === 'final' ? 'Back to Home' : 'Back to Unit';
  const weakBtn = (pct < 80 && wrong.length > 0)
    ? `<button class="rbtn" style="background:linear-gradient(135deg,#e67e22,#d35400)" data-action="_practiceWeak">Practice Weak Topics (${wrong.length} question${wrong.length===1?'':'s'}) →</button>`
    : '';
  elBtns.innerHTML = `
    ${nextBtn}
    ${weakBtn}
    <button class="rbtn" style="background:linear-gradient(135deg,${u.color},${u.color}aa)" data-action="retryQuiz">Try Again ${_ICO.refresh}</button>
    <button class="rbtn" style="background:linear-gradient(135deg,#7f8c8d,#636e72)" data-action="afterResults">${backLabel}</button>`;

  CUR.pendingScore = {qid:qz.id, label:qz.label, type:qz.type, score:qz.score, total, pct, stars,
    unitIdx:CUR.unitIdx, color:u.color,
    date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
    time:new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})};

  show('results-screen');
  confetti(50);
  // Play fanfare if passed (80%+ for unit and lesson)
  const passThreshold = 80;
  if(pct >= passThreshold){ playPassQuiz(); setTimeout(playConfettiBurst, 380); }
  else { playWrong(); }
}

function buildRevSection(title, items, color, collapsed){
  const id = 'rs-'+Math.random().toString(36).slice(2,7);
  return `<div class="rev-section">
    <div class="rev-sec-head" style="color:${color}" data-action="toggleRS" data-arg="${id}">
      ${title} (${items.length}) <span id="arr-${id}">${collapsed?'▸':'▾'}</span>
    </div>
    <div id="${id}" style="${collapsed?'display:none':''}">
      ${items.map((a,i)=>`<div class="rev-item">
        <div class="rinum" style="background:${color}">${i+1}</div>
        <div class="ribody">
          <div class="ri-q">${_qText(a.t)}</div>
          ${a.ok
            ? `<div class="ri-a" style="color:#27ae60">Your answer: ${_escHtml(a.chosen)} ✅</div>`
            : `<div class="ri-a"><strong style="color:#e74c3c">Your answer:</strong> <span style="color:#7f8c8d">${_escHtml(a.chosen)}</span></div>
               <div class="ri-a"><strong style="color:#27ae60">Correct:</strong> ${_escHtml(a.correct)} ✅</div>`}
          <div class="ri-e">${_ICO.lightbulb} ${_escHtml(a.exp)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function toggleRS(id){
  const el = document.getElementById(id);
  const arr = document.getElementById('arr-'+id);
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  arr.textContent = open ? '▸' : '▾';
}

// saveScore() removed — scores are auto-saved



function restartQuiz(){
  if(!CUR.quiz) return;
  document.getElementById('restart-confirm-modal').style.display = 'flex';
}

function cancelRestart(){
  _animateModalClose('restart-confirm-modal', ()=>{ document.getElementById('restart-confirm-modal').style.display='none'; });
}

function showQuitConfirm(){
  document.getElementById('quit-confirm-modal').style.display = 'flex';
}
function cancelQuit(){
  _animateModalClose('quit-confirm-modal', ()=>{ document.getElementById('quit-confirm-modal').style.display='none'; });
}

// ── Scratch Pad ──────────────────────────────────────────
let _scratchCtx = null;
let _scratchDrawing = false;
let _scratchColor = '#222';
let _scratchTool = 'pen';
let _scratchLastX = 0;
let _scratchLastY = 0;

function openScratchPad(){
  const overlay = document.getElementById('scratch-overlay');
  if(!overlay) return;
  overlay.style.display = 'flex';
  setTimeout(_initScratchCanvas, 50);
}

function closeScratchPad(){
  _animateModalClose('scratch-overlay', ()=>{ const o=document.getElementById('scratch-overlay'); if(o) o.style.display='none'; });
}

function _initScratchCanvas(){
  const wrap = document.getElementById('scratch-canvas-wrap');
  const canvas = document.getElementById('scratch-canvas');
  if(!wrap || !canvas) return;
  // Set canvas resolution to match physical pixels
  const dpr = window.devicePixelRatio || 1;
  const rect = wrap.getBoundingClientRect();
  if(canvas._initialized && canvas.width === Math.round(rect.width * dpr)) return;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  _scratchCtx = canvas.getContext('2d');
  _scratchCtx.scale(dpr, dpr);
  _scratchCtx.lineCap = 'round';
  _scratchCtx.lineJoin = 'round';
  canvas._initialized = true;
  _bindScratchEvents(canvas);
}

function _bindScratchEvents(canvas){
  if(canvas._bound) return;
  canvas._bound = true;
  function getPos(e){
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }
  function start(e){
    e.preventDefault();
    _scratchDrawing = true;
    const p = getPos(e);
    _scratchLastX = p.x; _scratchLastY = p.y;
    _scratchCtx.beginPath();
    _scratchCtx.arc(p.x, p.y, _scratchTool==='eraser'?10:2, 0, Math.PI*2);
    _scratchCtx.fillStyle = _scratchTool==='eraser' ? '#fff' : _scratchColor;
    _scratchCtx.fill();
  }
  function move(e){
    e.preventDefault();
    if(!_scratchDrawing) return;
    const p = getPos(e);
    _scratchCtx.beginPath();
    _scratchCtx.moveTo(_scratchLastX, _scratchLastY);
    _scratchCtx.lineTo(p.x, p.y);
    _scratchCtx.strokeStyle = _scratchTool==='eraser' ? '#fff' : _scratchColor;
    _scratchCtx.lineWidth = _scratchTool==='eraser' ? 22 : 3;
    _scratchCtx.stroke();
    _scratchLastX = p.x; _scratchLastY = p.y;
  }
  function stop(){ _scratchDrawing = false; }
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', stop);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', stop);
}

function clearScratchPad(){
  if(!_scratchCtx) return;
  const canvas = document.getElementById('scratch-canvas');
  _scratchCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function setScratchColor(color, btn){
  _scratchColor = color;
  _scratchTool = 'pen';
  document.querySelectorAll('.scratch-color-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  document.getElementById('sc-pen-btn').classList.add('active');
  document.getElementById('sc-erase-btn').classList.remove('active');
  if(_scratchCtx){ _scratchCtx.strokeStyle = color; }
}

function setScratchTool(tool){
  _scratchTool = tool;
  document.getElementById('sc-pen-btn').classList.toggle('active', tool==='pen');
  document.getElementById('sc-erase-btn').classList.toggle('active', tool==='eraser');
}
function confirmQuit(){
  _animateModalClose('quit-confirm-modal', ()=>{ document.getElementById('quit-confirm-modal').style.display='none'; });
  const qz = CUR.quiz;
  if(!qz) return;
  // Save quit score entry
  const u = CUR.unitIdx != null ? UNITS_DATA[CUR.unitIdx] : { color:'#e74c3c' };
  const cfg = loadSettings();
  const quitEntry = {
    qid: qz.id, label: qz.label, type: qz.type,
    score: qz.score, total: qz.questions.length,
    pct: Math.floor(qz.score / qz.questions.length * 100),
    stars: '🚫', quit: true,
    unitIdx: CUR.unitIdx, color: u.color,
    name: cfg.studentName || 'Student', id: Date.now(),
    timeTaken: '',
    answers: qz.answers ? qz.answers.map(a=>({t:a.t, chosen:a.chosen, correct:a.correct, ok:a.ok})) : [],
    date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
    time: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
  };
  if(_supaUser || quitEntry.qid === 'lq_u1l1'){
    if(_supaUser) quitEntry._sig = _scoreSig(quitEntry);
    SCORES.unshift(quitEntry);
    if(SCORES.length > 200) SCORES.pop();
    saveSc();
  }
  // Clear pause, stop timer, navigate back — no pause saved
  _clearTimer();
  if(qz.id) _clearPausedQuiz(qz.id);
  CUR.quiz = null;
  playSwooshBack();
  if(quitEntry.type === 'lesson') openLesson(CUR.unitIdx, CUR.lessonIdx);
  else if(quitEntry.type === 'final') goHome();
  else goUnit();
}

function confirmRestart(){
  _animateModalClose('restart-confirm-modal', ()=>{ document.getElementById('restart-confirm-modal').style.display='none'; });
  const qz = CUR.quiz;
  if(!qz) return;
  // Save abandoned score if any questions were answered
  if(qz.answers && qz.answers.length > 0){
    const u = CUR.unitIdx != null ? UNITS_DATA[CUR.unitIdx] : { color:'#6c5ce7' };
    const cfg = loadSettings();
    const abandonedEntry = {
      qid: qz.id, label: qz.label, type: qz.type,
      score: qz.score, total: qz.questions.length,
      pct: Math.floor(qz.score / qz.questions.length * 100),
      stars: '⚠️', abandoned: true,
      unitIdx: CUR.unitIdx, color: u.color,
      name: cfg.studentName || 'Student', id: Date.now(),
      timeTaken: '',
      answers: qz.answers.map(a=>({t:a.t, chosen:a.chosen, correct:a.correct, ok:a.ok})),
      date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
      time: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
    };
    if(_supaUser || abandonedEntry.qid === 'lq_u1l1'){
      if(_supaUser) abandonedEntry._sig = _scoreSig(abandonedEntry);
      SCORES.unshift(abandonedEntry);
      if(SCORES.length > 200) SCORES.pop();
      saveSc();
    }
  }
  if(qz.id) _clearPausedQuiz(qz.id);
  let bank;
  if(qz.type === 'lesson'){
    const u = UNITS_DATA[CUR.unitIdx];
    const l = u.lessons[CUR.lessonIdx];
    bank = l.qBank || l.quiz;
  } else if(qz.type === 'final'){
    if(qz.id === 'final_test_balanced'){ startFinalTestBalanced(); return; }
    bank = UNITS_DATA.flatMap(u => u.unitQuiz || u.testBank || []);
  } else {
    const u = UNITS_DATA[CUR.unitIdx];
    bank = u.testBank || u.unitQuiz;
  }
  _runQuiz(bank, qz.id, qz.label, qz.type, CUR.unitIdx);
}

function afterResults(){
  playSwooshBack();
  if(CUR.quiz && CUR.quiz.type === 'final') goHome();
  else goUnit();
}
function startFinalTest(){
  const btn = document.querySelector('[data-action="startFinalTest"]');
  if(btn) btn.textContent = 'Loading…';
  Promise.all(UNITS_DATA.map(function(_, i){ return _loadUnit(i); }))
    .then(function(){
      if(btn) btn.textContent = 'Start Final Test →';
      const bank = UNITS_DATA.flatMap(u => u.unitQuiz || u.testBank || []);
      if(!bank.length){ alert('No questions available for the Final Test.'); return; }
      playSwooshForward();
      _runQuiz(bank, 'final_test', `${_ICO.graduation} Final Test — All Units`, 'final', null);
    })
    .catch(function(){
      if(btn) btn.textContent = 'Start Final Test →';
      alert('Could not load all units. Check your connection.');
    });
}

function startFinalTestBalanced(){
  const btn = document.querySelector('[data-action="startFinalTestBalanced"]');
  if(btn) btn.textContent = 'Loading…';
  Promise.all(UNITS_DATA.map(function(_, i){ return _loadUnit(i); }))
    .then(function(){
      if(btn) btn.textContent = 'Balanced →';
      const allQs = [];
      UNITS_DATA.forEach(function(u){
        const bank = u.unitQuiz || u.testBank || [];
        if(!bank.length){ console.warn('[MMR] No bank for unit:', u.name || u.id); return; }
        const sample = _weightedSample(bank, Math.min(5, bank.length), 'balanced');
        sample.forEach(function(q){ allQs.push(q); });
      });
      if(!allQs.length){ alert('No questions available for the Final Test.'); return; }
      // Fisher-Yates shuffle
      for(let i = allQs.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = allQs[i]; allQs[i] = allQs[j]; allQs[j] = tmp;
      }
      playSwooshForward();
      _runQuiz([], 'final_test_balanced', `${_ICO.graduation} Final Test — Balanced`, 'final', null, allQs);
    })
    .catch(function(){
      if(btn) btn.textContent = '⚖️ Balanced';
      alert('Could not load quiz data. Check your connection.');
    });
}


// ════════════════════════════════════════
//  CONFETTI
// ════════════════════════════════════════
function confetti(count=32){
  const cols=['#e74c3c','#e67e22','#27ae60','#8e44ad','#f1c40f','#3498db','#fff'];
  for(let i=0;i<count;i++){
    const p=document.createElement('div'); p.className='cfp';
    p.style.cssText=`left:${Math.random()*100}vw;top:0;width:${8+Math.random()*9}px;height:${8+Math.random()*9}px;background:${cols[Math.floor(Math.random()*cols.length)]};border-radius:${Math.random()>.5?'50%':'3px'};animation-duration:${1.2+Math.random()*1}s;animation-delay:${Math.random()*.4}s`;
    document.body.appendChild(p); setTimeout(()=>p.remove(),2600);
  }
}

// ════════════════════════════════════════
//  KEYBOARD — Enter to advance quiz
// ════════════════════════════════════════
document.addEventListener('keydown', e=>{
  if(e.key==='Enter'){
    const nb = document.getElementById('next-btn');
    const quizActive = document.getElementById('quiz-screen')?.classList.contains('on');
    if(nb && nb.style.display==='block' && quizActive) nextQ();
  }
});
