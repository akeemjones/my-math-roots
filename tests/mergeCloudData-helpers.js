// tests/mergeCloudData-helpers.js
// Pure merge function — no Supabase, no localStorage, no global state.
// Inputs:
//   local: { done, scores, streak, mastery, appTime }
//   cloud: { prog: { done_json, mastery_json, apptime_json }, remoteScores, profile }
// Returns a new object with the same shape — does NOT mutate inputs.
// Keep in sync with _mergeCloudData in src/auth.js.

function _mergeCloudData(local, cloud){
  const done     = { ...local.done };
  const scores   = [...local.scores];
  const streak   = { ...local.streak };
  const mastery  = JSON.parse(JSON.stringify(local.mastery));
  const appTime  = JSON.parse(JSON.stringify(local.appTime));

  const { prog, remoteScores, profile } = cloud;

  // DONE — union merge
  if(prog && prog.done_json && typeof prog.done_json === 'object' && !Array.isArray(prog.done_json)){
    for(const [k,v] of Object.entries(prog.done_json)){
      if(typeof k === 'string' && k.length < 100
         && k !== '__proto__' && k !== 'constructor' && k !== 'prototype'){
        done[k] = !!v;
      }
    }
  }

  // SCORES — append-only dedup
  if(Array.isArray(remoteScores) && remoteScores.length){
    const localIds = new Set(scores.map(s => s.id));
    const incoming = remoteScores
      .filter(r => r && typeof r.local_id === 'number' && typeof r.qid === 'string'
        && typeof r.score === 'number' && typeof r.total === 'number'
        && typeof r.pct === 'number' && r.pct >= 0 && r.pct <= 100
        && !localIds.has(r.local_id))
      .map(r => ({
        qid:r.qid, label:String(r.label||''), type:String(r.type||''),
        score:r.score, total:r.total, pct:r.pct, stars:String(r.stars||''),
        unitIdx:typeof r.unit_idx==='number'?r.unit_idx:0, color:String(r.color||''),
        name:String(r.student_name||''), id:r.local_id,
        timeTaken:typeof r.time_taken==='number'?r.time_taken:0,
        answers:Array.isArray(r.answers)?r.answers:[],
        date:String(r.date_str||''), time:String(r.time_str||''),
        quit:!!r.quit, abandoned:!!r.abandoned
      }));
    scores.push(...incoming);
    scores.sort((a,b) => b.id - a.id);
    if(scores.length > 200) scores.length = 200;
  }

  // STREAK — last-writer-wins
  if(profile && typeof profile.current_streak === 'number' && profile.current_streak >= 0){
    const serverDate = typeof profile.last_activity_date === 'string' ? profile.last_activity_date : '';
    const serverLongest = typeof profile.longest_streak === 'number' ? profile.longest_streak : 0;
    if(!streak.lastDate || serverDate >= streak.lastDate){
      streak.current = profile.current_streak;
      streak.longest = Math.max(serverLongest, streak.longest);
      streak.lastDate = serverDate || streak.lastDate;
    }
  }

  // MASTERY — higher-attempts-wins
  if(prog && prog.mastery_json && typeof prog.mastery_json === 'object'){
    for(const [k, cm] of Object.entries(prog.mastery_json)){
      if(!cm || typeof cm.attempts !== 'number') continue;
      const lm = mastery[k];
      if(!lm || cm.attempts > lm.attempts || (cm.attempts === lm.attempts && cm.correct > (lm.correct||0))){
        mastery[k] = { attempts:cm.attempts, correct:cm.correct||0, lastSeen:cm.lastSeen||0 };
      }
    }
  }

  // APP_TIME — max per field/day
  if(prog && prog.apptime_json && typeof prog.apptime_json === 'object'){
    const ct = prog.apptime_json;
    if(typeof ct.totalSecs === 'number' && ct.totalSecs > (appTime.totalSecs||0)) appTime.totalSecs = ct.totalSecs;
    if(typeof ct.sessions === 'number' && ct.sessions > (appTime.sessions||0)) appTime.sessions = ct.sessions;
    if(ct.dailySecs && typeof ct.dailySecs === 'object'){
      appTime.dailySecs = appTime.dailySecs || {};
      for(const [d, s] of Object.entries(ct.dailySecs)){
        if(typeof s === 'number' && s > (appTime.dailySecs[d]||0)) appTime.dailySecs[d] = s;
      }
    }
  }

  return { done, scores, streak, mastery, appTime };
}

module.exports = { _mergeCloudData };
