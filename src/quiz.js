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

function playHintReveal(){
  try {
    const ctx = _getAudio();
    if(!ctx) return;
    [[330, 0, 0.08], [440, 0.08, 0.08]].forEach(([freq, start, dur]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = freq;
      const t = ctx.currentTime + start;
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
  } catch(e){}
}
// ── Distractor-Mapped Adaptive Engine — session state ──────────────────────
let errorProfile = {};
let isPaused = false;
const INTERVENTION_THRESHOLD = 3;
const INTERVENTION_EVENTS_KEY = "mmr_intervention_events_v1";

// ── Intervention telemetry ────────────────────────────────────────────────
let interventionEvents = [];
let activeIntervention = null;
let interventionSessionId = "";

function _readInterventionEvents() {
  try {
    const raw = localStorage.getItem(INTERVENTION_EVENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to read intervention events", e);
    return [];
  }
}

function _writeInterventionEvents(events) {
  try {
    localStorage.setItem(INTERVENTION_EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn("Failed to write intervention events", e);
  }
}

function _appendInterventionEvent(event) {
  const MAX_EVENTS = 500;
  // Stamp a unique client_id (Supabase dedup key) and synced flag on first write.
  if (!event.clientId) {
    event.clientId = (event.sessionId || '') + '_' + (event.type || '') + '_' + (event.timestamp || Date.now());
  }
  if (event.synced === undefined) event.synced = false;
  const events = _readInterventionEvents();
  events.push(event);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  _writeInterventionEvents(events);
}

const MINI_LESSONS = {
  err_count_inclusive: {
    title: 'Counting On — Where to Start',
    text: 'Don\'t count the number you start on. Put your finger on 8, then jump: 9, 10, 11.',
    mode: 'passive',
    visual: {
      type: 'numberLine',
      config: { min: 0, max: 15, ticks: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], jumps: [{ from: 8, to: 11, label: '+3' }], mark: 11 }
    }
  },
  err_off_by_one: {
    title: 'Almost There — Check Your Landing Spot',
    text: 'Count each jump out loud and stop right when you finish. Say the last number — that\'s your answer.',
    mode: 'passive',
    visual: {
      type: 'numberLine',
      config: { min: 0, max: 12, ticks: [0,1,2,3,4,5,6,7,8,9,10,11,12], jumps: [{ from: 5, to: 8, label: '+3' }], mark: 8 }
    }
  },
  err_wrong_operation: {
    title: 'Which Operation Do I Use?',
    text: 'Find the sign in the problem. Plus (+) means put groups together. Minus (\u2212) means take one group away.',
    mode: 'passive',
    visual: {
      type: 'array',
      config: { rows: 2, cols: 5, filled: 10 }
    }
  },
  err_forgot_carry: {
    title: 'Don\'t Forget to Carry',
    text: 'When ones add up to 10 or more, trade 10 ones for 1 ten. Write the leftover ones and move the ten over.',
    mode: 'passive',
    visual: {
      type: 'base10',
      config: { hundreds: 0, tens: 1, ones: 14 }
    }
  },
  err_forgot_borrow: {
    title: 'Borrowing — Break a Ten Apart',
    text: 'If the top ones digit is too small, break 1 ten into 10 ones. Cross out the tens digit and make it one less.',
    mode: 'passive',
    visual: {
      type: 'base10',
      config: { hundreds: 0, tens: 2, ones: 3 }
    }
  },
  err_place_value_confusion: {
    title: 'Tens and Ones Are Different',
    text: 'The tens digit tells how many groups of 10. The ones digit tells how many singles. Read each column on its own.',
    mode: 'passive',
    visual: {
      type: 'base10',
      config: { hundreds: 0, tens: 3, ones: 5 }
    }
  },
  err_skip_count_error: {
    title: 'Skip Counting — Keep the Same Jump',
    text: 'Every hop must be the same size. Tap the number line and say each landing number out loud: 2, 4, 6, 8.',
    mode: 'passive',
    visual: {
      type: 'numberLine',
      config: { min: 0, max: 20, ticks: [0,2,4,6,8,10,12,14,16,18,20], jumps: [{ from: 0, to: 2, label: '+2' }, { from: 2, to: 4, label: '+2' }, { from: 4, to: 6, label: '+2' }] }
    }
  },
  err_double_count: {
    title: 'Count Each One Only Once',
    text: 'Touch each thing once and slide it to the side after you count it. That way nothing gets counted twice.',
    mode: 'passive',
    visual: {
      type: 'array',
      config: { rows: 2, cols: 4, filled: 7, missingMark: true }
    }
  },
  err_magnitude_error: {
    title: 'How Big Is the Number?',
    text: 'Cover the choices and guess the answer first. If your pick is much bigger or smaller than your guess, try again.',
    mode: 'passive',
    visual: {
      type: 'base10',
      config: { hundreds: 0, tens: 2, ones: 0 }
    }
  },
  err_inverse_confusion: {
    title: 'Adding Goes Up, Subtracting Goes Down',
    text: 'Plus moves you right on the number line. Minus moves you left. Point in the direction the sign tells you.',
    mode: 'passive',
    visual: {
      type: 'numberLine',
      config: { min: 0, max: 10, ticks: [0,1,2,3,4,5,6,7,8,9,10], jumps: [{ from: 3, to: 7, label: '+4' }], mark: 7 }
    }
  }
};

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

  CUR.quiz = { questions:qs, idx:0, viewIdx:0, score:0, answers:[], id:qid, label, type, hintsUsed:0 };
  _quizStartedAt = Date.now();
  errorProfile = {};
  isPaused = false;
  interventionEvents = _readInterventionEvents();
  activeIntervention = null;
  interventionSessionId = "sess_" + Date.now();

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
    const _ov = item => (item && typeof item === 'object') ? item.val : item;
    const past = qz.answers[qIdx];
    const correct = past ? past.correct : _ov(q.o[q.a]);
    const chosen = past ? past.chosen : null;
    nb.style.display = 'block';
    nb.innerHTML = (qIdx >= qz.idx - 1) ? 'Back to Current →' : 'Forward →';
    document.getElementById('qcard').innerHTML =
      '<div class="q-num" style="color:'+u.color+'">Question '+(qIdx+1)+'</div>'+
      '<div class="q-text">'+_qText(q.t)+'</div>'+(q.v?_buildVisualHTML(q.v):(q.s?'<div class="q-visual">'+q.s+'</div>':''))+
      '<div style="font-size:var(--fs-sm);color:var(--txt2);margin-bottom:10px">' + _ICO.eyeOn + ' Review — answer locked</div>'+
      '<div class="agrid">'+
        (past && past.opts ? past.opts : q.o.map(_ov)).map(text=>{
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
  // Preserve existing option order on retry (intervention loop); shuffle only on first render
  // Support both plain string options and {val, tag} object options
  const _optVal = item => typeof item === 'object' ? item.val : item;
  const opts = qz._opts || _shuffle([...q.o].map((item,i)=>({text:_optVal(item),i})));
  qz._opts = opts;
  const correct = _optVal(q.o[q.a]);

  nb.style.display = 'none';
  nb.innerHTML = (qz.idx === total-1) ? 'See Results! ' + _ICO.trophy : 'Next Question →';

  // Use inline onclick with data-index — no addEventListener stacking
  qz._hintRevealed = false;
  document.getElementById('qcard').innerHTML =
    '<div class="q-num" style="color:'+u.color+'">Question '+(qIdx+1)+'</div>'+
    '<div class="q-text" role="heading" aria-level="2">'+_qText(q.t)+'</div>'+(q.v?_buildVisualHTML(q.v):(q.s?'<div class="q-visual">'+q.s+'</div>':''))+
    '<div class="agrid" role="group" aria-label="Answer choices">'+
      opts.map((opt,i)=>
        '<button class="abtn" type="button" data-action="_pickAnswer" data-arg="'+i+'" id="abtn-'+i+'" aria-label="Answer: '+_escHtml(opt.text)+'">'+_escHtml(opt.text)+'</button>'
      ).join('')+
    '</div>'+
    (q.h ? '<div id="qhint" role="note" aria-live="polite">'+
      '<button id="qhint-btn" class="hint-btn" type="button" data-action="_toggleHint" aria-label="Need a hint?" aria-expanded="false">💡 Need a Hint?</button>'+
      '<div class="hint-content" aria-hidden="true">'+_escHtml(q.h)+'</div>'+
    '</div>' : '')+
    '<div class="reveal" id="qreveal" role="status" aria-live="polite" aria-atomic="true"></div>';

  // Store correct text for answer checking
  qz._correct = correct;
  qz._answered = false;
  // Per-question timer — captures how long student spends on this question
  qz._qStartedAt = Date.now();
}

function _pickAnswer(btnIdx){
  const qz = CUR.quiz;
  if(isPaused) return;
  if(!qz || qz._answered) return;
  qz._answered = true;

  const chosen = qz._opts[btnIdx].text;
  const correct = qz._correct;
  const isOk = chosen === correct;
  const q = qz.questions[qz.idx];
  _handleAnswer(qz._opts[btnIdx].i);
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

    // Disable hint button after answering
    const hintEl = document.getElementById('qhint');
    if(hintEl){
      hintEl.classList.add('hint-answered');
      const hintBtn = document.getElementById('qhint-btn');
      if(hintBtn){ hintBtn.setAttribute('aria-disabled','true'); hintBtn.setAttribute('tabindex','-1'); }
    }

    qz.answers.push({t:q.t, chosen, correct, ok:isOk, exp:q.e, opts:qz._opts.map(o=>o.text), timeSecs:qTimeSecs, hintUsed:qz._hintRevealed||false});

    const nb = document.getElementById('next-btn');
    if(nb){
      nb.style.display = 'block';
      // Auto-scroll so the Next button is visible without manual scrolling
      setTimeout(()=> nb.scrollIntoView({ behavior:'smooth', block:'end' }), 60);
    }
  }, 120);
}

// ── Distractor-Mapped Adaptive Engine ──────────────────────────────────────
// Tracks error patterns by distractor tag and triggers micro-interventions
// when a student repeatedly selects the same type of wrong answer.

function _handleAnswer(selectedIndex){
  var qz = CUR.quiz;
  if(!qz) return;
  var q = qz.questions[qz.idx];
  if(!q) return;

  var _ov = function(item){ return (item && typeof item === 'object') ? item.val : item; };

  // ── Log intervention resolution if returning from an intervention ──
  if(activeIntervention){
    var retryCorrect = selectedIndex === q.a;
    var resolvedEvt = {
      type: 'resolved',
      timestamp: Date.now(),
      sessionId: interventionSessionId,
      questionId: activeIntervention.questionId,
      unitId: activeIntervention.unitId,
      lessonId: activeIntervention.lessonId,
      questionText: activeIntervention.questionText,
      errorTag: activeIntervention.errorTag,
      resolvedCorrectly: retryCorrect,
      retryChosenValue: _ov(q.o[selectedIndex]),
      correctValue: _ov(q.o[q.a]),
      lessonTitle: activeIntervention.lessonTitle
    };
    interventionEvents.push(resolvedEvt);
    _appendInterventionEvent(resolvedEvt);
    console.log("Intervention event:", resolvedEvt);
    activeIntervention = null;
  }

  // Correct answer — nothing to track
  if(selectedIndex === q.a) return;

  var option = q.o[selectedIndex];
  var tag = (option && typeof option === 'object') ? option.tag : null;
  if(!tag) return;

  errorProfile[tag] = (errorProfile[tag] || 0) + 1;

  if(errorProfile[tag] >= INTERVENTION_THRESHOLD){
    _pauseForIntervention(tag, selectedIndex);
    errorProfile[tag] = 0;
  }
}

// ── Dynamic intervention content builder ─────────────────────────────────
// Returns {title, text, visualHTML} based on error tag + live question data.
// K-specific tags (err_off_by_one, err_same, err_over_count, err_less, err_more)
// are handled dynamically using actual values. All other tags fall back to
// the static MINI_LESSONS table (Grade 2 content).
function _buildInterventionContent(errorTag, q, correctVal, chosenVal){
  var vc       = (q && q.v && q.v.config) ? q.v.config : null;
  var startCount = vc ? (vc.count || null) : null;
  var emoji    = (vc && vc.emoji) ? vc.emoji : null;
  var correctNum = parseInt(correctVal, 10);
  var chosenNum  = parseInt(chosenVal,  10);

  function emojiRow(n, em){
    var s = '<span style="font-size:1.35rem;letter-spacing:3px">';
    for(var i=0;i<n;i++) s += em;
    return s + '</span>';
  }

  function dynamicNL(from, to){
    var mn = Math.max(0, Math.min(from,to)-1);
    var mx = Math.min(20, Math.max(from,to)+1);
    var ticks=[];
    for(var i=mn;i<=mx;i++) ticks.push(i);
    var lbl = to>from ? '+1' : '\u22121';
    try{ return _buildVisualHTML({type:'numberLine',config:{min:mn,max:mx,ticks:ticks,jumps:[{from:from,to:to,label:lbl}],mark:to}}); }
    catch(e){ return ''; }
  }

  // K-only: show counting sequence with missing spot and correct answer below.
  // Always shows the 3 numbers before correct, then [?], then the answer.
  // countOnFrom: if provided and differs from correct, appends a step-progression
  // arrow chain (e.g. 16 → 17 → 18 ✓) instead of a bare number.
  function kSequenceFallback(qText, correct, countOnFrom){
    var seq = [correct-3, correct-2, correct-1].filter(function(n){ return n >= 0; });
    var cells = seq.map(function(n){
      return '<span style="display:inline-block;min-width:2.4rem;text-align:center;font-size:1.3rem;font-weight:700;color:#2d4a5a">' + n + '</span>';
    });
    cells.push('<span style="display:inline-block;min-width:2.4rem;text-align:center;font-size:1.3rem;font-weight:700;color:#FF9800;border:2px dashed #FF9800;border-radius:6px;padding:0 4px">?</span>');
    var answerHTML;
    if(countOnFrom !== undefined && countOnFrom !== correct && !isNaN(countOnFrom)){
      var isUp = correct > countOnFrom;
      var steps = [];
      for(var si = countOnFrom; isUp ? si <= correct : si >= correct; isUp ? si++ : si--) steps.push(si);
      answerHTML = '<div style="font-size:1.2rem;font-weight:700;color:#2d7d46;margin-top:2px">' + steps.join(' \u2192 ') + ' \u2713</div>';
    } else {
      answerHTML = '<div style="font-size:1.3rem;font-weight:700;color:#2d7d46">' + correct + ' \u2713</div>';
    }
    return '<div style="text-align:center;font-family:var(--ff2,\'Nunito\',sans-serif)">'
      + '<div style="display:flex;gap:6px;justify-content:center;align-items:center">' + cells.join('') + '</div>'
      + '<div style="margin-top:4px;font-size:1.1rem;color:#FF9800">\u2193</div>'
      + answerHTML
      + '</div>';
  }

  var title='', text='', visualHTML='';

  if(errorTag === 'err_off_by_one'){
    if(_ACTIVE_GRADE === 'K' && !isNaN(correctNum) && !isNaN(chosenNum)){
      // K: step-aware language — never say "one step" when diff > 1
      var kDiff = Math.abs(correctNum - chosenNum);
      var kUp   = correctNum > chosenNum;
      if(kDiff === 1){
        title = 'Almost! You Were Just One Off';
        text  = 'You picked ' + chosenVal + ', but the answer is ' + correctVal + '. Count ' + (kUp ? 'one more' : 'one less') + ': ' + chosenVal + ' \u2192 ' + correctVal + '!';
      } else {
        title = 'Keep Counting!';
        text  = 'Keep counting from ' + chosenVal + '! Count ' + (kUp ? 'up' : 'back') + ' until you reach ' + correctVal + '.';
      }
      if(q && q.v && q.v.type === 'objectSet' && emoji && correctNum >= 1 && correctNum <= 20){
        visualHTML = '<div style="text-align:center;line-height:2.2">'
          + emojiRow(correctNum, emoji)
          + '<br><span style="font-size:0.82rem;color:#5a7080;font-family:var(--ff2,\'Nunito\',sans-serif)">Count: ' + correctVal + ' \u2713</span>'
          + '</div>';
      } else {
        // Sequence visual; when diff > 1 also show the step chain
        visualHTML = kSequenceFallback(q && q.t, correctNum, kDiff > 1 ? chosenNum : undefined);
      }
    } else {
      title = 'Almost! You Were Just One Off';
      if(!isNaN(correctNum) && !isNaN(chosenNum)){
        var dir = correctNum > chosenNum ? 'forward' : 'back';
        text = 'You picked ' + chosenVal + ', but the answer is ' + correctVal + '. Take one step ' + dir + ' from ' + chosenVal + '!';
      } else {
        text = 'You were so close! Count each step out loud and stop at the right number.';
      }
      if(q && q.v && q.v.type === 'objectSet' && emoji && correctNum >= 1 && correctNum <= 20){
        visualHTML = '<div style="text-align:center;line-height:2.2">'
          + emojiRow(correctNum, emoji)
          + '<br><span style="font-size:0.82rem;color:#5a7080;font-family:var(--ff2,\'Nunito\',sans-serif)">Count: ' + correctVal + ' \u2713</span>'
          + '</div>';
      } else if(startCount !== null && !isNaN(correctNum)){
        visualHTML = dynamicNL(startCount, correctNum);
      } else if(!isNaN(correctNum) && !isNaN(chosenNum)){
        visualHTML = dynamicNL(chosenNum, correctNum);
      }
    }

  } else if(errorTag === 'err_same'){
    title = 'Remember to Change the Count!';
    if(!isNaN(correctNum) && !isNaN(chosenNum)){
      var isMore = correctNum > chosenNum;
      text = 'You picked ' + chosenVal + ' \u2014 that\'s what you started with. Add ' + (isMore ? 'one more' : 'take one less') + ': ' + chosenVal + ' \u2192 ' + correctVal + '.';
      if(emoji && correctNum >= 1 && correctNum <= 20){
        visualHTML = '<div style="text-align:center;line-height:2.2">'
          + emojiRow(chosenNum, emoji)
          + '<span style="font-size:1.25rem;margin:0 10px">\u2192</span>'
          + emojiRow(correctNum, emoji)
          + '<br><span style="font-size:0.82rem;color:#5a7080;font-family:var(--ff2,\'Nunito\',sans-serif)">'
          + chosenVal + ' \u2192 ' + correctVal
          + '</span></div>';
      }
    } else {
      text = 'Don\'t keep the same number \u2014 change it by one!';
    }

  } else if(errorTag === 'err_over_count'){
    title = 'Too Many \u2014 Stop Earlier!';
    if(!isNaN(correctNum) && !isNaN(chosenNum)){
      text = 'You picked ' + chosenVal + ', but that\'s too many. Count carefully and stop at ' + correctVal + '.';
      if(emoji && correctNum >= 1 && correctNum <= 20){
        visualHTML = '<div style="text-align:center;line-height:2.2">'
          + emojiRow(correctNum, emoji)
          + '<br><span style="font-size:0.82rem;color:#5a7080;font-family:var(--ff2,\'Nunito\',sans-serif)">Stop here: ' + correctVal + '</span>'
          + '</div>';
      }
    } else {
      text = 'You went too far! Count carefully and stop at the right number.';
    }

  } else if(errorTag === 'err_less'){
    title = 'Look for the BIGGER Group!';
    if(!isNaN(correctNum) && !isNaN(chosenNum)){
      text = 'You picked ' + chosenVal + ' \u2014 that\'s the smaller number. The bigger number is ' + correctVal + '.';
    } else {
      text = 'MORE means the bigger number. Count both groups and pick the larger one!';
    }
    if(vc && vc.leftCount !== undefined){
      var lc=vc.leftCount, rc=vc.rightCount, le=vc.leftObj||'\u2b50', re=vc.rightObj||'\u2b50';
      visualHTML = '<div style="display:flex;gap:20px;justify-content:center;align-items:flex-end">'
        + '<div style="text-align:center">' + emojiRow(lc,le) + '<br><span style="font-size:0.85rem">' + lc + '</span></div>'
        + '<span style="font-size:1.1rem;padding-bottom:4px">vs</span>'
        + '<div style="text-align:center">' + emojiRow(rc,re) + '<br><span style="font-size:0.85rem">' + rc + '</span></div>'
        + '</div>';
    }

  } else if(errorTag === 'err_more'){
    title = 'Look for the SMALLER Group!';
    if(!isNaN(correctNum) && !isNaN(chosenNum)){
      text = 'You picked ' + chosenVal + ' \u2014 that\'s the bigger number. The smaller number is ' + correctVal + '.';
    } else {
      text = 'FEWER means the smaller number. Count both groups and pick the smaller one!';
    }
    if(vc && vc.leftCount !== undefined){
      var lc2=vc.leftCount, rc2=vc.rightCount, le2=vc.leftObj||'\u2b50', re2=vc.rightObj||'\u2b50';
      visualHTML = '<div style="display:flex;gap:20px;justify-content:center;align-items:flex-end">'
        + '<div style="text-align:center">' + emojiRow(lc2,le2) + '<br><span style="font-size:0.85rem">' + lc2 + '</span></div>'
        + '<span style="font-size:1.1rem;padding-bottom:4px">vs</span>'
        + '<div style="text-align:center">' + emojiRow(rc2,re2) + '<br><span style="font-size:0.85rem">' + rc2 + '</span></div>'
        + '</div>';
    }

  } else if(errorTag === 'err_keep_start'){
    title = 'That\'s the Starting Number — What Changed?';
    if(!isNaN(correctNum) && !isNaN(chosenNum)){
      text = 'You picked ' + chosenVal + ' — that\'s where you started. Something was added or taken away, so the answer changes to ' + correctVal + '.';
    } else {
      text = 'When you add or subtract, the answer is different from where you started!';
    }
    if(emoji && correctNum >= 1 && correctNum <= 12){
      visualHTML = '<div style="text-align:center;line-height:2.2">'
        + emojiRow(correctNum, emoji)
        + '<br><span style="font-size:0.82rem;color:#5a7080;font-family:var(--ff2,\'Nunito\',sans-serif)">Answer: ' + correctVal + '</span>'
        + '</div>';
    }

  } else if(errorTag === 'err_add_instead'){
    title = 'You Added — But This One Subtracts!';
    if(!isNaN(correctNum) && !isNaN(chosenNum)){
      text = 'You picked ' + chosenVal + ' by adding, but the problem asks you to take away. Start at the big number and count back to get ' + correctVal + '.';
    } else {
      text = 'Look for take-away words: "left", "ate", "flew away", "popped". Those mean subtract!';
    }

  } else if(errorTag === 'err_sub_instead'){
    title = 'You Subtracted — But This One Adds!';
    if(!isNaN(correctNum) && !isNaN(chosenNum)){
      text = 'You picked ' + chosenVal + ' by taking away, but the problem asks you to join groups. Count both groups together to get ' + correctVal + '.';
    } else {
      text = 'Look for joining words: "more", "joined", "gave", "in all". Those mean add!';
    }

  } else if(errorTag === 'err_count_all'){
    title = 'Count Back \u2014 Don\'t Count All!';
    if(!isNaN(correctNum) && !isNaN(chosenNum)){
      text = 'You counted all the objects and got ' + chosenVal + '. But we need to take some away! Start at the big number and count back to find ' + correctVal + '.';
      if(_ACTIVE_GRADE === 'K' && emoji && correctNum >= 1 && correctNum <= 20){
        visualHTML = '<div style="text-align:center;line-height:2.2">'
          + emojiRow(correctNum, emoji)
          + '<br><span style="font-size:0.82rem;color:#5a7080;font-family:var(--ff2,\'Nunito\',sans-serif)">Count back \u2014 ' + correctVal + ' are left \u2713</span>'
          + '</div>';
      } else if(_ACTIVE_GRADE === 'K'){
        visualHTML = kSequenceFallback(q && q.t, correctNum, chosenNum > correctNum ? chosenNum : undefined);
      } else {
        visualHTML = dynamicNL(chosenNum, correctNum);
      }
    } else {
      text = 'When you subtract, start at the big number and count backwards \u2014 don\'t restart from 1!';
    }

  } else if(errorTag === 'err_keep_total'){
    title = 'That\'s the Total — Find the Missing Part!';
    if(!isNaN(correctNum) && !isNaN(chosenNum)){
      text = 'You picked ' + chosenVal + ' — that\'s the whole amount. We already know the total! We need to find the missing piece, which is ' + correctVal + '.';
    } else {
      text = 'In a missing part problem, you already have the total. Use subtraction to find what is missing!';
    }

  } else if(errorTag === 'err_teen'){
    title = 'Teen Numbers \u2014 10 and Some More!';
    if(!isNaN(correctNum) && correctNum >= 11 && correctNum <= 19){
      var extras = correctNum - 10;
      var em = emoji || '\u2b50';
      text = correctVal + ' is 10 and ' + extras + ' more. Look at the groups below!';
      visualHTML =
        '<div style="text-align:center;line-height:1.9">' +
          '<div style="display:inline-flex;gap:10px;align-items:center;justify-content:center">' +
            '<div style="border:2px solid #FF9800;border-radius:8px;padding:4px 6px;line-height:1.6">' +
              '<div style="font-size:1.25rem;letter-spacing:2px">' + em.repeat(5) + '</div>' +
              '<div style="font-size:1.25rem;letter-spacing:2px">' + em.repeat(5) + '</div>' +
            '</div>' +
            '<span style="font-size:1.1rem;font-weight:700">+</span>' +
            '<div style="border:2px dashed #FF9800;border-radius:8px;padding:4px 6px;line-height:1.6">' +
              '<div style="font-size:1.25rem;letter-spacing:2px">' + em.repeat(extras) + '</div>' +
            '</div>' +
          '</div>' +
          '<br><span style="font-size:0.85rem;color:#5a7080">10 + ' + extras + ' = ' + correctVal + ' \u2713</span>' +
        '</div>';
    } else {
      text = 'Teen numbers are made of 10 and some extras. Count the 10 first, then count the rest!';
    }

  } else if(errorTag === 'err_under_count'){
    title = 'You Stopped Too Early \u2014 Keep Going!';
    if(!isNaN(correctNum) && !isNaN(chosenNum)){
      text = 'You picked ' + chosenVal + ', but keep counting! There are ' + correctVal + ' altogether.';
      if(emoji && correctNum >= 1 && correctNum <= 20){
        visualHTML = '<div style="text-align:center;line-height:2.2">'
          + emojiRow(correctNum, emoji)
          + '<br><span style="font-size:0.82rem;color:#5a7080;font-family:var(--ff2,\'Nunito\',sans-serif)">Count all the way to ' + correctVal + '!</span>'
          + '</div>';
      }
    } else {
      text = 'Make sure you count every single object \u2014 touch each one and do not stop early!';
    }

  } else if(errorTag === 'err_longer_shorter'){
    title = 'Check Which End Sticks Out Farther!';
    if(_ACTIVE_GRADE === 'K'){
      text = 'To find the LONGER object, line them up at one end and look at the other end — the longer one sticks out farther! The SHORTER one does not reach as far.';
      visualHTML = '<div style="text-align:center;font-family:var(--ff2,\'Nunito\',sans-serif);font-size:0.92rem;line-height:2.2">'
        + '<div style="display:inline-block;text-align:left">'
        + '<div><span style="display:inline-block;background:#2196F3;height:10px;width:120px;border-radius:4px;vertical-align:middle"></span> <span style="color:#2196F3;font-weight:700">← longer</span></div>'
        + '<div style="margin-top:6px"><span style="display:inline-block;background:#90CAF9;height:10px;width:70px;border-radius:4px;vertical-align:middle"></span> <span style="color:#5a7080">← shorter</span></div>'
        + '</div>'
        + '<div style="margin-top:6px;color:#5a7080;font-size:0.8rem">Line up at one end — the longer one reaches farther!</div>'
        + '</div>';
    } else {
      text = 'Compare by lining objects up at one end. The object that extends farther is longer; the one that does not reach as far is shorter.';
    }

  } else if(errorTag === 'err_heavier_lighter'){
    title = 'Check Which Feels Heavier to Lift!';
    if(_ACTIVE_GRADE === 'K'){
      text = 'HEAVIER means it weighs MORE — it would be harder to lift. LIGHTER means it weighs LESS — easy to lift or even float! Think about picking each object up in real life.';
      visualHTML = '<div style="text-align:center;font-size:1.5rem;line-height:2.4;font-family:var(--ff2,\'Nunito\',sans-serif)">'
        + '🪨 &nbsp;vs&nbsp; 🪶'
        + '<br><span style="font-size:0.82rem;color:#5a7080">rock (heavier) &nbsp;vs&nbsp; feather (lighter)<br>The heavier one pulls your arm DOWN!</span>'
        + '</div>';
    } else {
      text = 'Heavier means more weight — it pushes down harder on a scale. Lighter means less weight. Compare by picking objects up or using a balance scale.';
    }

  } else if(errorTag === 'err_shape_orient'){
    title = 'Shapes Stay the Same When You Turn Them!';
    if(_ACTIVE_GRADE === 'K'){
      text = 'A triangle is STILL a triangle even if it points left, right, or upside-down. Count its corners and sides — they never change!';
      visualHTML = '<div style="text-align:center;font-size:1.4rem;line-height:2.4">'
        + '🔺 &nbsp;▷&nbsp; 🔻'
        + '<br><span style="font-size:0.82rem;color:#5a7080;font-family:var(--ff2,\'Nunito\',sans-serif)">pointing up &nbsp;→&nbsp; sideways &nbsp;→&nbsp; upside-down<br>All are still triangles!</span>'
        + '</div>';
    } else {
      text = 'Shapes keep their name no matter how they are turned or flipped. Count the sides and corners to identify a shape.';
    }

  } else if(errorTag === 'err_wrong_solid'){
    title = 'Flat Shape or Solid Shape?';
    if(_ACTIVE_GRADE === 'K'){
      text = 'A circle is flat — you draw it on paper. A sphere is 3D — you can hold it like a ball! Always ask: can I hold it in my hand?';
      visualHTML = '<div style="text-align:center;font-size:1.6rem;line-height:2.4">'
        + '🔵 &nbsp;vs&nbsp; ⚽'
        + '<br><span style="font-size:0.82rem;color:#5a7080;font-family:var(--ff2,\'Nunito\',sans-serif)">circle (flat, 2D) &nbsp;vs&nbsp; sphere (solid, 3D)</span>'
        + '</div>';
    } else {
      text = 'A 2D shape is flat — you draw it on paper. A 3D solid takes up space and has volume — you can hold it. Look carefully at the object.';
    }

  } else if(errorTag === 'err_random'){
    title = 'Look Carefully and Try Again!';
    if(!isNaN(correctNum)){
      text = 'That was not right. Count carefully \u2014 the answer is ' + correctVal + '.';
      if(emoji && correctNum >= 1 && correctNum <= 20){
        visualHTML = '<div style="text-align:center;line-height:2.2">'
          + emojiRow(correctNum, emoji)
          + '<br><span style="font-size:0.82rem;color:#5a7080;font-family:var(--ff2,\'Nunito\',sans-serif)">Count: ' + correctVal + ' \u2713</span>'
          + '</div>';
      }
    } else {
      text = 'That was not right \u2014 read the question again and think it through!';
    }

  } else {
    // Fall back to static MINI_LESSONS for Grade 2 error tags
    var lesson = MINI_LESSONS[errorTag];
    title = lesson ? lesson.title : 'Let\'s Review';
    text  = lesson ? lesson.text  : 'Take a moment to review this concept before trying again.';
    if(lesson){
      try{ visualHTML = _buildVisualHTML(lesson.visual); }catch(e){ console.warn('Visual render failed:', errorTag); }
    }
  }

  return {title:title, text:text, visualHTML:visualHTML};
}

function _pauseForIntervention(errorTag, selectedIndex){
  isPaused = true;

  var qz = CUR.quiz;
  var q = qz ? qz.questions[qz.idx] : null;
  var _ov = function(item){ return (item && typeof item === 'object') ? item.val : item; };

  var correctVal = q ? _ov(q.o[q.a]) : null;
  var chosenVal  = (q && selectedIndex != null) ? _ov(q.o[selectedIndex]) : null;
  var content    = _buildInterventionContent(errorTag, q, correctVal, chosenVal);
  var title      = content.title;
  var text       = content.text;
  var visualHTML = content.visualHTML;

  // ── Log triggered intervention event ──
  var triggeredEvt = {
    type: 'triggered',
    timestamp: Date.now(),
    sessionId: interventionSessionId,
    questionId: q ? (q.id || null) : null,
    unitId: CUR.unit || null,
    lessonId: CUR.lesson || null,
    questionText: q ? (q.t || '') : '',
    errorTag: errorTag,
    chosenValue: chosenVal,
    correctValue: correctVal,
    lessonTitle: title
  };
  interventionEvents.push(triggeredEvt);
  _appendInterventionEvent(triggeredEvt);
  console.log("Intervention event:", triggeredEvt);

  activeIntervention = {
    questionId: triggeredEvt.questionId,
    unitId: triggeredEvt.unitId,
    lessonId: triggeredEvt.lessonId,
    questionText: triggeredEvt.questionText,
    errorTag: errorTag,
    lessonTitle: title
  };

  console.log("Intervention:", title);

  // Remove any existing overlay
  var existing = document.querySelector('[data-focus-overlay]');
  if(existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.setAttribute('data-focus-overlay', '1');
  overlay.style.cssText = [
    'position:fixed','inset:0','z-index:99999',
    'background:var(--modal-bg, rgba(255,255,255,0.82))',
    'backdrop-filter:var(--modal-blur, blur(28px) saturate(160%) brightness(1.04))',
    '-webkit-backdrop-filter:var(--modal-blur, blur(28px) saturate(160%) brightness(1.04))',
    'display:flex','flex-direction:column',
    'align-items:center','justify-content:center',
    'padding:32px','box-sizing:border-box',
    'font-family:var(--ff, "Boogaloo","Arial Rounded MT Bold",sans-serif)',
    'color:var(--txt, #1a2535)'
  ].join(';');

  // ── Standard intervention shell ──────────────────────────────────────────
  // Layout is always the same (5 sections). Teaching content is situation-specific
  // (supplied by _buildInterventionContent via title / text / visualHTML).
  var LABEL_STYLE = 'font-size:0.68rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;'+
    'color:var(--txt2,#5a7080);margin-bottom:6px;font-family:var(--ff2,\'Nunito\',sans-serif)';
  var DIVIDER = '<hr style="border:none;border-top:1px solid var(--border,rgba(0,0,0,.09));margin:14px 0">';

  // § 2 — THE QUESTION
  var qVisualHTML = '';
  if(q && q.v){ try{ qVisualHTML = _buildVisualHTML(q.v); }catch(e){} }
  var qSection = q ?
    '<div style="background:var(--bg2,#f4f7fa);border-radius:var(--rad-sm,12px);padding:12px 14px;text-align:left;">'+
      '<div style="'+LABEL_STYLE+'">The question</div>'+
      '<p style="margin:0 0 '+(qVisualHTML?'8px':'0')+';font-size:1rem;font-weight:600;line-height:1.4;color:var(--txt,#1a2535);font-family:var(--ff2,\'Nunito\',sans-serif)">'+_escHtml(q.t)+'</p>'+
      (qVisualHTML ? '<div style="margin-top:4px">'+qVisualHTML+'</div>' : '')+
    '</div>' : '';

  // § 3 — LET'S FIX IT  (situation-specific text from _buildInterventionContent)
  var fixSection = text ?
    '<div style="text-align:left;">'+
      '<div style="'+LABEL_STYLE+'">Let\'s fix it</div>'+
      '<p style="margin:0;font-size:1rem;line-height:1.5;color:var(--txt2,#5a7080);font-family:var(--ff2,\'Nunito\',sans-serif)">'+_escHtml(text)+'</p>'+
    '</div>' : '';

  // § 4 — TRY IT THIS WAY  (situation-specific visual from _buildInterventionContent)
  var trySection = visualHTML ?
    '<div>'+
      '<div style="'+LABEL_STYLE+';text-align:left">Try it this way</div>'+
      '<div style="padding:10px 0">'+visualHTML+'</div>'+
    '</div>' : '';

  overlay.innerHTML =
    '<div style="max-width:520px;width:100%;background:var(--card-bg,#fff);border-radius:var(--rad,22px);'+
      'box-shadow:var(--shad,0 6px 28px rgba(0,0,0,.16));padding:28px 28px 24px;'+
      'border:1px solid var(--border,rgba(0,0,0,.11));display:flex;flex-direction:column;gap:0">'+
      // § 1 — Title
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'+
        '<span style="font-size:1.6rem;line-height:1">💡</span>'+
        '<h2 style="margin:0;font-size:1.2rem;color:var(--txt,#2d3a8c);font-family:var(--ff,\'Boogaloo\',sans-serif);text-align:left">'+_escHtml(title)+'</h2>'+
      '</div>'+
      // § 2 — The question
      qSection+
      (qSection && fixSection ? DIVIDER : '')+
      // § 3 — Let's fix it
      fixSection+
      (fixSection && trySection ? DIVIDER : '')+
      // § 4 — Try it this way
      trySection+
      // § 5 — Retry button
      '<div style="margin-top:18px;text-align:center">'+
        '<button id="focus-overlay-got-it" style="'+
          'background:linear-gradient(135deg,#4f46e5,#6c5ce7);color:#fff;border:none;'+
          'border-radius:var(--rad-md,14px);padding:13px 32px;font-size:1rem;font-weight:700;'+
          'cursor:pointer;font-family:var(--ff,\'Boogaloo\',sans-serif);'+
          'box-shadow:0 4px 14px rgba(79,70,229,0.35);transition:transform .15s,box-shadow .15s">'+
          'Got it \u2014 try again! \u2192'+
        '</button>'+
      '</div>'+
    '</div>';

  console.log("Mounting Focus Overlay");
  document.body.appendChild(overlay);

  document.getElementById('focus-overlay-got-it').addEventListener('click', function(){
    overlay.remove();
    _resumeQuiz();
  });
}

function _resumeQuiz(){
  isPaused = false;
  var qz = CUR.quiz;
  if(!qz) return;
  qz._answered = false;
  // Re-render the SAME question without advancing index.
  // _opts is preserved so answer order stays stable (no reshuffle on retry).
  _renderQ();
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
    qz._opts = null; // clear so next question gets fresh shuffled options
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

function _toggleHint(){
  const qz = CUR.quiz;
  if(!qz) return;
  const hintEl = document.getElementById('qhint');
  const btn = document.getElementById('qhint-btn');
  const content = hintEl && hintEl.querySelector('.hint-content');
  if(!hintEl || !btn || !content) return;

  if(hintEl.classList.contains('hint-show')){
    // Collapse — no charge, no sound
    hintEl.classList.remove('hint-show');
    btn.setAttribute('aria-expanded', 'false');
    content.setAttribute('aria-hidden', 'true');
  } else {
    // Expand
    hintEl.classList.add('hint-show');
    btn.setAttribute('aria-expanded', 'true');
    content.removeAttribute('aria-hidden');
    // Only charge the first reveal
    if(!qz._hintRevealed){
      qz._hintRevealed = true;
      qz.hintsUsed = (qz.hintsUsed || 0) + 1;
      playHintReveal();
    }
  }
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
  const rawPct = Math.floor(qz.score/total*100);
  const hintsUsed = qz.hintsUsed || 0;
  const pct = Math.max(0, rawPct - hintsUsed * 2);

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
    rawPct, penPct: pct, hintsUsed,
    stars: pct===100?'⭐⭐⭐':pct>=90?'⭐⭐⭐':pct>=80?'⭐⭐':pct>=60?'⭐':'',
    unitIdx: CUR.unitIdx, color: u.color,
    name: studentName, id: Date.now(),
    timeTaken,
    answers: qz.answers ? qz.answers.map(a=>({t:a.t,chosen:a.chosen,correct:a.correct,ok:a.ok,exp:a.exp,opts:a.opts,timeSecs:a.timeSecs,hintUsed:a.hintUsed||false})) : [],
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
    ${hintsUsed > 0 ? `<div class="hint-penalty-note">💡 You used ${hintsUsed} hint${hintsUsed===1?'':'s'} — score adjusted by -${hintsUsed*2}%. Unadjusted: ${rawPct}%.</div>` : ''}
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
            : `<div class="ri-a"><strong style="color:#e74c3c">Your answer:</strong> <span style="color:#546e7a">${_escHtml(a.chosen)}</span></div>
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
        if(!bank.length){ return; }
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
