// ── Question Engine (QE) ──────────────────────────────────────────────────────
// Pure functions — no DOM access. Normalizes, validates, grades, and routes
// questions across all types. Inserted between visuals.js and quiz.js in build.
// ─────────────────────────────────────────────────────────────────────────────

var QE = {};

// ── Normalizer ────────────────────────────────────────────────────────────────
// Maps legacy field names to unified schema. Does NOT mutate the original.
// Called at the start of _renderQ so all downstream code sees normalized fields.

QE.normalize = function(raw, lessonContext) {
  var q = Object.assign({}, raw);
  if (!q.prompt)       q.prompt       = q.t || '';
  if (!q.hint)         q.hint         = q.h || null;
  if (!q.explanation)  q.explanation  = q.e || '';
  if (!q.standard)     q.standard     = q.s || null;
  if (!q.visual)       q.visual       = q.v || null;
  if (!q.intervention) q.intervention = q.i || null;
  // Resolve d: 'e' (difficulty) vs d: {...} (distractors) collision
  if (!q.difficulty && q.d) {
    if (typeof q.d === 'string') {
      var D_MAP = { e: 'easy', m: 'medium', h: 'hard' };
      q.difficulty = D_MAP[q.d] || q.d;
    } else if (typeof q.d === 'object' && !q.distractors) {
      q.distractors = q.d;
    }
  }
  // Resolve answer
  if (!q.answer) {
    if (q.type === 'tapGroup' || q.type === 'tapSingle') {
      q.answer = {};
    } else if (q.a !== undefined) {
      q.answer = { index: q.a };
    }
  }
  // Infer type from visual when absent
  if (!q.type && q.visual) q.type = q.visual.type || 'multipleChoice';
  if (!q.type) q.type = 'multipleChoice';

  // Merge lesson-level defaults — only when the question doesn't carry its own.
  // Safe-clone so per-question runtime mutation cannot corrupt the shared default.
  if ((!q.tags || q.tags.length === 0) && lessonContext && Array.isArray(lessonContext.defaultTags)) {
    q.tags = lessonContext.defaultTags.slice();
  }
  if (!q.intervention && lessonContext && lessonContext.defaultIntervention) {
    var d = lessonContext.defaultIntervention;
    q.intervention = {
      teach: Object.assign({}, d.teach || {}),
      retry: Object.assign(
        {},
        d.retry || {},
        { matchTags: (d.retry && Array.isArray(d.retry.matchTags)) ? d.retry.matchTags.slice() : [] }
      )
    };
  }
  // Stash lesson/unit/grade context for downstream loggers (_lessonId, _unitId, _grade).
  // Underscore prefix marks these as engine metadata — not question content.
  var _lid = (lessonContext && lessonContext.id) || q.lessonId || null;
  if (_lid) {
    q._lessonId = _lid;
    var _um = _lid.match(/^(k?u\d+)/);
    if (_um) q._unitId = _um[1];
  }
  try { q._grade = localStorage.getItem('mmr_grade') || null; } catch (_e) {}
  return q;
};

// ── Validator ─────────────────────────────────────────────────────────────────
// Returns { valid: bool, errors: string[] }. Used by auditPool in preview mode.

QE.validate = function(q) {
  var errors = [];
  if (!q.id)               errors.push('missing id');
  if (!q.prompt && !q.t)   errors.push('missing prompt/t');
  if (!q.type)             errors.push('missing type');

  if (q.type === 'tapGroup' || q.type === 'tapSingle') {
    if (!q.tags || !q.tags.length)
      errors.push('tapGroup: tags required');
    if (!q.difficulty)
      errors.push('tapGroup: difficulty required');
    if (!q.visual || q.visual.type !== 'tapGroup')
      errors.push('tapGroup: visual.type must be tapGroup');
    var cfg = q.visual && q.visual.config;
    if (!cfg || !cfg.shapes) {
      errors.push('tapGroup: visual.config.shapes required');
    } else {
      var shapes = cfg.shapes;
      if (shapes.length < 2) errors.push('tapGroup: at least 2 shapes required');
      if (shapes.length > 6) errors.push('tapGroup: max 6 shapes');
      var correctCount = shapes.filter(function(s) { return s.correct; }).length;
      if (correctCount < 1)  errors.push('tapGroup: at least 1 correct shape');
      var wrongCount = shapes.filter(function(s) { return !s.correct; }).length;
      if (wrongCount < 1)    errors.push('tapGroup: at least 1 distractor shape');
      var ids = shapes.map(function(s) { return s.id; });
      if (new Set(ids).size !== ids.length) errors.push('tapGroup: shape ids must be unique');
      var VALID_SHAPES = ['circle', 'triangle', 'square', 'rectangle'];
      shapes.forEach(function(s) {
        if (!s.id)    errors.push('tapGroup: shape missing id');
        if (VALID_SHAPES.indexOf(s.shape) === -1)
          errors.push('tapGroup: invalid shape "' + s.shape + '"');
      });
      if (cfg.mode && cfg.mode !== 'multi' && cfg.mode !== 'single')
        errors.push('tapGroup: mode must be "multi" or "single"');
    }
    if (!q.intervention)
      errors.push('tapGroup: intervention config required');
    else if (!q.intervention.teach || !q.intervention.teach.text)
      errors.push('tapGroup: intervention.teach.text required');
  }

  if (q.type === 'multipleChoice') {
    if (!q.o || !q.o.length) errors.push('multipleChoice: options (o) required');
    if (q.a === undefined)   errors.push('multipleChoice: answer index (a) required');
  }

  return { valid: errors.length === 0, errors: errors };
};

// ── Grader ────────────────────────────────────────────────────────────────────
// Returns { ok: bool, errorType: string|null, details: {} }

QE.grade = function(q, response) {
  var type = q.type || 'multipleChoice';

  if (type === 'tapGroup' || type === 'tapSingle') {
    var cfg = q.visual && q.visual.config;
    var shapes = (cfg && cfg.shapes) || [];
    var correctIds = shapes.filter(function(s) { return s.correct; }).map(function(s) { return s.id; });
    var selectedIds = response.selectedIds || [];
    var ok = selectedIds.length === correctIds.length
          && correctIds.every(function(id) { return selectedIds.indexOf(id) !== -1; });
    var errorType = null;
    if (!ok) {
      var selectedWrong = selectedIds.some(function(id) {
        var s = shapes.find(function(sh) { return sh.id === id; });
        return s && !s.correct;
      });
      errorType = selectedWrong ? 'err_tap_wrong_shape' : 'err_tap_missed';
    }
    return { ok: ok, errorType: errorType, details: { selectedIds: selectedIds, correctIds: correctIds } };
  }

  if (type === 'multipleChoice' || type === 'objectSet' || type === 'twoGroups') {
    var ai = q.answer ? q.answer.index : q.a;
    var ok2 = response.selectedIndex === ai;
    return { ok: ok2, errorType: null, details: { selectedIndex: response.selectedIndex } };
  }

  return { ok: false, errorType: 'err_unknown_type', details: {} };
};

// ── Retry Selector ────────────────────────────────────────────────────────────
// Selects a follow-up question after intervention. Never returns the same question
// when alternatives exist. Uses tiered matching: subSkill+errorTag → subSkill →
// matchTags → same-type → any-different.
//
// SCORING: follow-up questions are remediation-only. The original question stays
// marked wrong in the quiz score; the follow-up result is tracked separately in
// qz._followUp and not added to the quiz score.
//
// Parameters:
//   q         – current question (legacy format: {t, o, sk, d, v, ...} or normalized)
//   pool      – full lesson quizBank (legacy format)
//   errorTag  – the specific errorTag the student triggered (from activeIntervention)

QE.selectRetry = function(q, pool, errorTag) {
  var currentId   = q.id   || null;
  var currentText = q.t    || q.prompt || null;
  // Support both legacy (v.type) and normalized (q.type) question formats
  var type        = q.type || (q.v && q.v.type) || 'multipleChoice';
  var subSkill    = q.sk   || null;
  var matchTags   = (q.intervention && q.intervention.retry && q.intervention.retry.matchTags)
                 || q.tags || [];

  // Build the set of errorTags to match: the triggered tag (highest priority) plus
  // any distractor tags on the current question (broadens the pool slightly)
  var errorTagsToMatch = [];
  if (errorTag) errorTagsToMatch.push(errorTag);
  if (Array.isArray(q.o)) {
    q.o.forEach(function(opt) {
      var t = opt && typeof opt === 'object' ? (opt.tag || opt.errorTag || null) : null;
      if (t && errorTagsToMatch.indexOf(t) === -1) errorTagsToMatch.push(t);
    });
  }

  // Returns true when candidate c is a different question from q
  function _notCurrent(c) {
    if (currentId   && c.id && c.id === currentId)               return false;
    if (currentText && (c.t || c.prompt) === currentText)        return false;
    return true;
  }

  // Returns true when candidate matches the question type.
  // Checks both c.type (normalized) and c.v.type (legacy visual type).
  function _sameType(c) {
    var cType = c.type || (c.v && c.v.type) || 'multipleChoice';
    return cType === type;
  }

  // Returns true when candidate has at least one distractor whose errorTag is in tags[]
  function _hasErrorTag(c, tags) {
    if (!tags.length) return false;
    var opts = c.o || c.choices || [];
    return opts.some(function(opt) {
      var t = (opt && typeof opt === 'object') ? (opt.tag || opt.errorTag || null) : null;
      return t && tags.indexOf(t) !== -1;
    });
  }

  var pick;

  // Tier 1: same subSkill + has a distractor matching the triggered errorTag
  if (subSkill && errorTagsToMatch.length) {
    var t1 = pool.filter(function(c) {
      return _notCurrent(c) && _sameType(c) && c.sk === subSkill && _hasErrorTag(c, errorTagsToMatch);
    });
    if (t1.length) return t1[Math.floor(Math.random() * t1.length)];
  }

  // Tier 2: same subSkill (any question)
  if (subSkill) {
    var t2 = pool.filter(function(c) {
      return _notCurrent(c) && _sameType(c) && c.sk === subSkill;
    });
    if (t2.length) return t2[Math.floor(Math.random() * t2.length)];
  }

  // Tier 3: matchTags (legacy tag-based matching)
  if (matchTags.length) {
    var t3 = pool.filter(function(c) {
      if (!_notCurrent(c) || !_sameType(c)) return false;
      var cTags = c.tags || [];
      return matchTags.some(function(tag) { return cTags.indexOf(tag) !== -1; });
    });
    if (t3.length) return t3[Math.floor(Math.random() * t3.length)];
  }

  // Tier 4: any different question of the same type
  var t4 = pool.filter(function(c) { return _notCurrent(c) && _sameType(c); });
  if (t4.length) return t4[Math.floor(Math.random() * t4.length)];

  // Tier 5: any different question regardless of type (cross-type last resort)
  var t5 = pool.filter(function(c) { return _notCurrent(c); });
  if (t5.length) {
    console.warn('[QE.selectRetry] No same-type follow-up found; using cross-type fallback');
    return t5[Math.floor(Math.random() * t5.length)];
  }

  // Pool has only the current question — cannot avoid repeating
  if (pool.length > 0) console.warn('[QE.selectRetry] Pool size ' + pool.length + ' — cannot avoid repeating question');
  return pool.length > 0 ? pool[0] : null;
};

// ── Mastery + Activity Logger ─────────────────────────────────────────────────
// (a) Updates per-tag aggregate in mmr_mastery_v1.
// (b) Appends a rich event to mmr_activity_v1 for dashboard analytics.
// Gracefully skips the activity event when _lessonId is absent so older
// callers still get the aggregate without requiring a lessonContext.

QE.logResult = function(q, result) {
  var hasTags = q && q.tags && q.tags.length;
  var ts = Date.now();

  // (a) Aggregate update — schema unchanged: { [tag]: { attempts, correct, lastSeen } }
  // Stored per-grade so K and Grade 2 mastery never collide on shared tag names
  // like 'addition' or 'counting'. Read sites must request the same key shape.
  if (hasTags) {
    try {
      var _gFn = (typeof normalizeGrade === 'function') ? normalizeGrade : function(v){
        if (v === null || v === undefined) return '2';
        var s = String(v).trim().toLowerCase();
        return (s === 'k' || s === 'kindergarten' || s === '0') ? 'K' : '2';
      };
      var _gradeForKey = _gFn(q && q._grade ? q._grade : (function(){
        try { return localStorage.getItem('mmr_grade'); } catch(_){ return null; }
      })());
      var aggKey = 'mmr_mastery_v1_' + _gradeForKey;
      var agg = JSON.parse(localStorage.getItem(aggKey) || '{}');
      q.tags.forEach(function(tag) {
        if (!agg[tag]) agg[tag] = { attempts: 0, correct: 0 };
        agg[tag].attempts++;
        if (result && result.ok) agg[tag].correct++;
        agg[tag].lastSeen = ts;
      });
      localStorage.setItem(aggKey, JSON.stringify(agg));
    } catch (e) {
      try { console.warn('[QE] aggregate write failed', e); } catch (_) {}
    }
  }

  // (b) Activity event — requires _lessonId (set by QE.normalize when lessonContext provided).
  var lessonId = q && q._lessonId;
  if (!lessonId) return;
  try {
    var actKey = 'mmr_activity_v1';
    var raw = JSON.parse(localStorage.getItem(actKey) || 'null');
    var doc = (raw && raw.v === 1 && Array.isArray(raw.events))
      ? raw
      : { v: 1, events: [] };
    doc.events.push({
      ts:         ts,
      grade:      (q._grade)  || null,
      unitId:     (q._unitId) || null,
      lessonId:   lessonId,
      questionId: q.id || null,
      tags:       (q.tags || []).slice(),
      correct:    !!(result && result.ok),
      errorType:  (result && result.errorType) || null,
      patternTag: q.patternTag || null
    });
    var MAX = 1000;
    if (doc.events.length > MAX) doc.events = doc.events.slice(doc.events.length - MAX);
    localStorage.setItem(actKey, JSON.stringify(doc));
  } catch (e) {
    try { console.warn('[QE] activity write failed', e); } catch (_) {}
  }
};

// ── Audit Pool ────────────────────────────────────────────────────────────────
// Dev-mode batch validator — runs when ?preview=1 OR localStorage.mmr_audit==='1'.
// Callers should pre-normalize with lessonContext so lesson-default tags/intervention
// are visible to the audit (see _loadKUnit in shared_k.js).

QE.auditPool = function(pool, label) {
  var inPreview = typeof location !== 'undefined' && location.search.indexOf('preview=1') !== -1;
  var inAudit   = (function(){ try { return localStorage.getItem('mmr_audit') === '1'; } catch(e){ return false; } })();
  if (!inPreview && !inAudit) return;
  var prefix = label ? '[QE audit:' + label + ']' : '[QE audit]';
  var errCount = 0;
  pool.forEach(function(q) {
    var norm = QE.normalize(q);
    var r = QE.validate(norm);
    // K questions are designed without per-question ids; that check is out of
    // scope for the activation pass. Drop it to keep audit signal actionable.
    var validateErrors = (r.errors || []).filter(function(e){ return e !== 'missing id'; });
    var extra = [];
    if (!norm.tags || !norm.tags.length) extra.push('missing tags after normalize');
    if (!norm.intervention) extra.push('missing intervention after normalize');
    else if (!norm.intervention.retry || !Array.isArray(norm.intervention.retry.matchTags) || !norm.intervention.retry.matchTags.length) {
      extra.push('empty intervention.retry.matchTags');
    }
    var opts = norm.o || (norm.options || []);
    if (Array.isArray(opts)) {
      opts.forEach(function(opt, i){
        if (opt && opt.correct === false && opt.tag && opt.tag.indexOf('err_') !== 0) {
          extra.push('option[' + i + '] tag "' + opt.tag + '" missing err_ prefix');
        }
        if (opt && opt.correct === true && typeof opt.tag === 'string' && opt.tag.indexOf('err_') === 0) {
          extra.push('option[' + i + '] correct answer has err_* tag "' + opt.tag + '"');
        }
      });
    }
    if (validateErrors.length || extra.length) {
      var allErrs = validateErrors.concat(extra);
      console.error(prefix, norm.id || norm.prompt || norm.t, allErrs);
      errCount++;
    }
  });
  if (errCount === 0) {
    console.log(prefix + ' Pool audit complete — 0 errors.');
  } else {
    console.warn(prefix + ' Pool audit complete — ' + errCount + ' question(s) with errors.');
  }
};
