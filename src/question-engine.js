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
// Finds a replacement question after intervention. Tag-aware, excludes current q.

QE.selectRetry = function(q, pool) {
  var matchTags = (q.intervention && q.intervention.retry && q.intervention.retry.matchTags)
               || q.tags || [];
  var type = q.type || 'multipleChoice';

  var candidates = pool.filter(function(candidate) {
    if (candidate.id && candidate.id === q.id) return false;
    if ((candidate.type || 'multipleChoice') !== type) return false;
    if (!matchTags.length) return true;
    var cTags = candidate.tags || [];
    return matchTags.some(function(tag) { return cTags.indexOf(tag) !== -1; });
  });

  if (!candidates.length) {
    candidates = pool.filter(function(c) {
      return c.id !== q.id && (c.type || 'multipleChoice') === type;
    });
  }
  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
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
  if (hasTags) {
    try {
      var aggKey = 'mmr_mastery_v1';
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
