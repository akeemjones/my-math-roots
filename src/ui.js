// ════════════════════════════════════════
//  HISTORY SCREEN
// ════════════════════════════════════════
let histFilter = 'all';

function buildHistory(){
  const total = SCORES.length;
  const avg = total ? Math.round(SCORES.reduce((a,b)=>a+b.pct,0)/total) : 0;
  const perfect = SCORES.filter(s=>s.pct===100).length;
  const unitQ = SCORES.filter(s=>s.type==='unit').length;

  document.getElementById('hist-stats').innerHTML =
    tile(total,'Total Quizzes','#e74c3c')+tile(avg+'%','Average Score','#27ae60')+
    tile(unitQ,'Unit Quizzes','#8e44ad')+tile(perfect,'Perfect Scores!','#f1c40f');

  document.getElementById('hist-filt').innerHTML =
    ['all','lesson','unit'].map(t=>`<button class="filt${histFilter===t?' on':''}" onclick="setFilt('${t}',this)">${{all:'All Quizzes',lesson:'Lesson Quizzes',unit:'Unit Quizzes'}[t]}</button>`).join('');

  renderScList();
}

function tile(v,l,c){ return `<div class="stat-tile"><div class="stat-num" style="color:${c}">${v}</div><div class="stat-lbl">${l}</div></div>`; }

function setFilt(t, btn){
  histFilter = t;
  document.querySelectorAll('.filt').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderScList();
}

// Private closure — score list index, inaccessible from global scope
const _scFiltered = (()=>{
  let _cache = [];
  return {
    set(arr){ _cache = arr; },
    get(i){ return _cache[i] || null; }
  };
})();

function renderScList(){
  const list = document.getElementById('sc-list');
  let filtered = SCORES;
  if(histFilter !== 'all') filtered = SCORES.filter(s=>s.type===histFilter);
  _scFiltered.set(filtered);
  if(!filtered.length){ list.innerHTML=`<div class="empty">${_ICO.inbox} No scores yet! Take a quiz to see your results here.</div>`; return; }

  list.innerHTML = filtered.map((s,i)=>{
    const u = UNITS_DATA[s.unitIdx] || {color:'#7f8c8d'};
    const pctColor = s.abandoned ? '#e67e22' : s.quit ? '#e74c3c' : s.pct>=80?'#27ae60':s.pct>=60?'#e67e22':'#e74c3c';
    const cardAccent = s.abandoned?'#e67e22':s.quit?'#e74c3c':u.color;
    return `<div class="sc-card" style="border-left:4px solid ${cardAccent}" onclick="openScLightbox(${i})"${_sr('role="button" aria-label="'+_escHtml(s.name)+', '+((s.abandoned||s.quit)?'did not finish':s.pct+'%, '+s.score+' of '+s.total)+', '+_escHtml(s.date)+'"')}>
      <div class="sc-card-header">
        <div>
          <div class="sc-name">${_escHtml(s.name)}</div>
          <div class="sc-type">${_escHtml(s.label)}${s.abandoned?' <span style="color:#e67e22;font-size:var(--fs-sm);font-family:Boogaloo,cursive">⚠️ Abandoned</span>':''}${s.quit?' <span style="color:#e74c3c;font-size:var(--fs-sm);font-family:Boogaloo,cursive">🚫 Quit</span>':''}</div>
          <div class="sc-date">${_escHtml(s.date)} · ${_escHtml(s.time)}${s.timeTaken?` · ⏱ ${_escHtml(s.timeTaken)} mins`:''}</div>
        </div>
        <div style="text-align:center;flex-shrink:0">
          <span class="sc-stars"${_sr('aria-hidden="true"')}>${(s.abandoned||s.quit)?'':_escHtml(s.stars)}</span>
          <div><span class="sc-grade" style="background:${cardAccent+'20'};color:${cardAccent}">${s.score}/${s.total}</span></div>
          <div style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-base);color:${pctColor}">${(s.abandoned||s.quit)?'DNF':s.pct+'%'}</div>
        </div>
        <div class="sc-chevron"${_sr('aria-hidden="true"')}>▸</div>
      </div>
    </div>`;
  }).join('');
}

function _buildScReviewHtml(s){
  const u = UNITS_DATA[s.unitIdx] || {color:'#7f8c8d'};
  const pctColor = s.abandoned ? '#e67e22' : s.quit ? '#e74c3c' : s.pct>=80?'#27ae60':s.pct>=60?'#e67e22':'#e74c3c';

  let reviewHtml = '';
  if(s.answers && s.answers.length){
    const wrong = s.answers.filter(a=>!a.ok);
    const right  = s.answers.filter(a=>a.ok);
    if(wrong.length){
      reviewHtml += `<div class="sc-rev-sec" style="color:#e74c3c">❌ Incorrect (${wrong.length})</div>`;
      reviewHtml += wrong.map(a=>`
        <div class="sc-rev-item sc-rev-wrong">
          <div class="sc-rev-q">${_escHtml(a.t)}</div>
          <div class="sc-rev-your">Your answer: <span style="color:#e74c3c">${_escHtml(a.chosen)}</span></div>
          <div class="sc-rev-correct">✅ Correct: <span style="color:#27ae60">${_escHtml(a.correct)}</span></div>
          ${a.timeSecs != null ? `<div class="sc-rev-time">⏱ ${a.timeSecs}s</div>` : ''}
        </div>`).join('');
    }
    if(right.length){
      reviewHtml += `<div class="sc-rev-sec" style="color:#27ae60">✅ Correct (${right.length})</div>`;
      reviewHtml += right.map(a=>`
        <div class="sc-rev-item sc-rev-right">
          <div class="sc-rev-q">${_escHtml(a.t)}</div>
          <div class="sc-rev-correct" style="color:#27ae60">✅ ${_escHtml(a.correct)}</div>
          ${a.timeSecs != null ? `<div class="sc-rev-time">⏱ ${a.timeSecs}s</div>` : ''}
        </div>`).join('');
    }
  } else {
    reviewHtml = `<div style="color:var(--txt2);font-size:var(--fs-sm);padding:10px">No question detail available for this attempt.</div>`;
  }

  const headHtml = `
    <button class="sc-lightbox-close" onclick="closeScLightbox()">✕</button>
    <div class="sc-name" style="font-size:var(--fs-md)">${_escHtml(s.name)}</div>
    <div class="sc-type">${_escHtml(s.label)}${s.abandoned?' <span style="color:#e67e22;font-size:var(--fs-sm);font-family:Boogaloo,cursive">⚠️ Abandoned</span>':''}${s.quit?' <span style="color:#e74c3c;font-size:var(--fs-sm);font-family:Boogaloo,cursive">🚫 Quit</span>':''}</div>
    <div class="sc-date" style="margin-top:4px">${_escHtml(s.date)} · ${_escHtml(s.time)}${s.timeTaken?` · ⏱ ${_escHtml(s.timeTaken)} mins`:''}</div>
    <div style="margin-top:10px;display:flex;align-items:center;gap:12px">
      <span class="sc-stars" style="font-size:var(--fs-lg)">${s.abandoned?'⚠️':s.quit?'🚫':_escHtml(s.stars)}</span>
      <span class="sc-grade" style="background:${(s.abandoned?'#e67e22':s.quit?'#e74c3c':u.color)+'20'};color:${s.abandoned?'#e67e22':s.quit?'#e74c3c':u.color}">${s.score}/${s.total}</span>
      <span style="font-family:'Boogaloo','Arial Rounded MT Bold',sans-serif;font-size:var(--fs-md);color:${pctColor}">${(s.abandoned||s.quit)?'DNF':s.pct+'%'}</span>
    </div>`;
  return { headHtml, bodyHtml: reviewHtml };
}

function openScLightbox(i){
  const s = _scFiltered.get(i);
  if(!s) return;
  const r = _buildScReviewHtml(s);
  document.getElementById('sc-lightbox-head').innerHTML = r.headHtml;
  document.getElementById('sc-lightbox-body').innerHTML = r.bodyHtml;
  document.getElementById('sc-lightbox-body').scrollTop = 0;
  document.getElementById('sc-lightbox').classList.add('open');
  _lockScroll();
  _animateModalOpen('sc-lightbox');
}

function closeScLightbox(){
  _animateModalClose('sc-lightbox', ()=>{ document.getElementById('sc-lightbox').classList.remove('open'); _unlockScroll(); });
}

function delScore(id){ const i=SCORES.findIndex(s=>s.id===id); if(i>-1){SCORES.splice(i,1);saveSc();_cloudDeleteScore(id);buildHistory();} }
function clearAll(){ if(confirm('Clear ALL saved scores?')){SCORES.length=0;saveSc();buildHistory();} }


// ════════════════════════════════════════
//  VISUAL GENERATOR
// ════════════════════════════════════════
function makeVis(v){
  if(!v) return '';
  const parts = v.split(':');
  const type = parts[0];
  const p = parts.slice(1);

  // Helper: render N emoji spans, optional cross-out starting at index s
  const emoRow = (e,n,crossFrom=999) =>
    [...Array(+n)].map((_,i)=>`<span class="vis-e${i>=crossFrom?' vis-x':''}">${e}</span>`).join('');

  if(type==='add'){
    const [e,a,b]=[p[0],+p[1],+p[2]];
    return `<div class="vis-row">${emoRow(e,a)}</div>
      <div class="vis-sep">+</div>
      <div class="vis-row">${emoRow(e,b)}</div>
      <div class="vis-sep">=</div>
      <div class="vis-row">${emoRow(e,a+b)}</div>`;
  }

  if(type==='sub'){
    const [e,a,b]=[p[0],+p[1],+p[2]];
    return `<div class="vis-row">${emoRow(e,a,a-b)}</div>
      <div class="vis-eq">${a} − ${b} = <strong>${a-b}</strong> left!</div>`;
  }

  if(type==='doubles'){
    const [e,n]=[p[0],+p[1]];
    return `<div class="vis-grps">
      <div class="vis-grp">${emoRow(e,n)}</div>
      <div class="vis-sep">+</div>
      <div class="vis-grp">${emoRow(e,n)}</div>
      <div class="vis-sep">=</div>
      <span class="vis-sep" style="color:#27ae60">${n*2}</span>
    </div>`;
  }

  if(type==='add3'){
    const [e,a,b,cc]=[p[0],+p[1],+p[2],+p[3]];
    return `<div class="vis-grps">
      <div class="vis-grp">${emoRow(e,a)}</div>
      <span class="vis-sep">+</span>
      <div class="vis-grp">${emoRow(e,b)}</div>
      <span class="vis-sep">+</span>
      <div class="vis-grp">${emoRow(e,cc)}</div>
    </div>
    <div class="vis-eq">= <strong>${a+b+cc}</strong></div>`;
  }

  if(type==='tenframe'){
    const n=+p[0];
    const cells=[...Array(10)].map((_,i)=>`<div class="tf-cell${i<n?' tf-fill':''}">${i<n?'🔵':''}</div>`).join('');
    const need=10-n;
    return `<div class="ten-frame">${cells}</div>
      <div class="vis-eq">Need <strong>${need}</strong> more to reach 10!</div>`;
  }

  if(type==='groups'){
    const [e,g,n]=[p[0],+p[1],+p[2]];
    const grps=[...Array(g)].map(()=>`<div class="vis-grp">${emoRow(e,n)}</div>`).join('<span class="vis-sep">+</span>');
    return `<div class="vis-grps">${grps}</div>
      <div class="vis-eq"><strong>${g} × ${n} = ${g*n}</strong></div>`;
  }

  if(type==='array'){
    const [e,r,cc]=[p[0],+p[1],+p[2]];
    const rows=[...Array(r)].map(()=>`<div class="vis-arr-row">${emoRow(e,cc)}</div>`).join('');
    return `${rows}<div class="vis-eq">${r} rows of ${cc} = <strong>${r*cc}</strong></div>`;
  }

  if(type==='share'){
    const [e,t,g]=[p[0],+p[1],+p[2]];
    const each=Math.floor(t/g);
    const labels=['👦','👧','🧒','👶'];
    const grps=[...Array(g)].map((_,i)=>`<div style="text-align:center">
      <div style="font-size:var(--fs-xl)">${labels[i]||'🧑'}</div>
      <div class="vis-grp" style="min-width:60px;margin-top:4px">${emoRow(e,each)}</div>
    </div>`).join('');
    return `<div class="vis-grps">${grps}</div>
      <div class="vis-eq">${t} ÷ ${g} = <strong>${each} each</strong></div>`;
  }

  if(type==='clock'){
    const h=+p[0], m=+p[1];
    const toRad = deg => deg*Math.PI/180;
    const hourDeg = ((h%12)+m/60)/12*360 - 90;
    const minDeg  = m/60*360 - 90;
    const hx=(50+24*Math.cos(toRad(hourDeg))).toFixed(1);
    const hy=(50+24*Math.sin(toRad(hourDeg))).toFixed(1);
    const mx=(50+34*Math.cos(toRad(minDeg))).toFixed(1);
    const my=(50+34*Math.sin(toRad(minDeg))).toFixed(1);
    const nums=[12,1,2,3,4,5,6,7,8,9,10,11].map((n,i)=>{
      const a=toRad((i/12)*360-90);
      const x=(50+40*Math.cos(a)).toFixed(1), y=(50+40*Math.sin(a)).toFixed(1);
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="bold" fill="#1a2535" font-family="Boogaloo,cursive">${n}</text>`;
    }).join('');
    const dots=[...Array(60)].map((_,i)=>{
      const a=toRad(i/60*360-90), r=i%5===0?44:46;
      const x=(50+r*Math.cos(a)).toFixed(1), y=(50+r*Math.sin(a)).toFixed(1);
      return `<circle cx="${x}" cy="${y}" r="${i%5===0?1.5:0.8}" fill="${i%5===0?'#4a90d9':'#ccc'}"/>`;
    }).join('');
    return `<svg width="150" height="150" viewBox="0 0 100 100" style="display:block;margin:0 auto">
      <circle cx="50" cy="50" r="49" fill="#f0f8ff" stroke="#4a90d9" stroke-width="2.5"/>
      ${dots}${nums}
      <line x1="50" y1="50" x2="${hx}" y2="${hy}" stroke="#1a2535" stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="50" x2="${mx}" y2="${my}" stroke="#e74c3c" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="3" fill="#1a2535"/>
    </svg>
    <div class="vis-eq"><strong>${h}:${String(m).padStart(2,'0')}</strong></div>`;
  }

  return '';
}

function togglePQ(pid, btn){
  const ans = document.getElementById(pid+'-ans');
  const item = document.getElementById(pid);
  const isOpen = ans.classList.contains('show');
  if(isOpen){
    // Collapse
    ans.classList.remove('show');
    item.classList.remove('revealed');
    btn.textContent = '👀 Show Answer';
    btn.style.opacity = '1';
  } else {
    // Expand
    ans.classList.add('show');
    item.classList.add('revealed');
    btn.innerHTML = _ICO.eyeOff + ' Hide Answer';
    btn.style.opacity = '1';
    if(!item.dataset.celebrated){
      confetti(10);
      item.dataset.celebrated = '1';
    }
  }
}

// Keep old name as alias for any existing markup
function revealPQ(pid, btn){ togglePQ(pid, btn); }


// ════════════════════════════════════════
//  COIN LIGHTBOX
// ════════════════════════════════════════
function openCoinLightbox(src, label, value){
  document.getElementById('cl-img').src = src;
  document.getElementById('cl-lbl').textContent = label;
  document.getElementById('cl-val').textContent = value;
  const lb = document.getElementById('coin-lightbox');
  lb.style.display = 'flex';
}
function closeCoinLightbox(){
  _animateModalClose('coin-lightbox', ()=>{ document.getElementById('coin-lightbox').style.display='none'; });
}
// Delegate clicks on any data-coin image
document.addEventListener('click', e => {
  const img = e.target.closest('img[data-coin]');
  if(img) openCoinLightbox(img.src, img.dataset.label||'', img.dataset.value||'');
});
document.addEventListener('keydown', e => {
  if(e.key==='Escape') closeCoinLightbox();
});
