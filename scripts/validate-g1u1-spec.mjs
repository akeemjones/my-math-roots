// Validation pass for Grade 1 Unit 1 design spec — schema v0.2.0
// Run: node scripts/validate-g1u1-spec.mjs
//
// Read-only. Enforces the strict diagnostic-quality and anti-duplication rules.
//
// Rules grouped into 12 categories (matching the user's spec):
//   R1  per-question schema completeness on quizBank
//   R2  per-wrong-choice metadata
//   R3  per-correct-choice constraints
//   R4  no duplicate choice values inside a question
//   R5  no duplicate question IDs
//   R6  no duplicate prompt + answer + visual combinations
//   R7  no duplicate answer-choice sets for the same prompt type
//   R8  follow-ups must use different values than the original (heuristic)
//   R9  quizBank size 180–220 per lesson (warning if below 180 during build)
//   R10 lesson structure: 4–6 keyIdeas, 12 worked examples, 20–25 practice,
//        180–220 quizBank, lessonQuizAttempt.questionCount === 8
//   R11 lessonQuizAttempt rule shape (3 easy / 4 medium / 1 hard, etc.)
//   R12 unit-level unitTest rule shape (40 total, 5 per lesson, balanced)
//
// Lessons that still use the legacy `sampleDiagnosticQuestions` field (i.e.
// haven't been migrated yet) get the legacy lightweight checks only — these
// are reported as "legacy" and should not block the build of the migrated
// lessons.

import { G1_U1_SPEC } from '../src/data/g1/u1.js';

const errors  = [];   // hard failures
const warns   = [];   // build-in-progress / soft signals
const err  = (m) => errors.push(m);
const warn = (m) => warns.push(m);

const SUPPORTED_VISUALS = new Set([
  'objectSet', 'base10', 'numberLine', 'array', 'comparison',
  'twoGroups', 'shapes', 'tapGroup',
  'tenFrame', 'fivFrame', 'dicePattern', 'domino'  // structured-quantity types (TODO renderer)
]);
const TENFRAME_FAMILY = new Set(['tenFrame', 'fivFrame', 'dicePattern', 'domino']);
const TENFRAME_EXEMPT_LESSONS = new Set(['g1-u1-l1']);

const VALID_DIFFICULTIES   = new Set(['easy', 'medium', 'hard']);
const LEGACY_DIFF_CODES    = new Set(['e', 'm', 'h']);   // sampleDiagnosticQuestions still use codes
const VALID_INTERACTION    = new Set(['multipleChoice', 'inputNumber', 'tapSingle', 'tapGroup', 'sortOrder']);
const VALID_FOLLOWUP_RULES = new Set([
  'same_skill_new_numbers',
  'same_skill_new_visual',
  'same_skill_new_arrangement',
  'same_skill_new_instance'   // generic
]);

const FORBIDDEN_TOPICS = [
  'penny', 'nickel', 'dime', 'quarter', 'dollar',
  'clock', "o'clock", 'minute hand', 'hour hand',
  'inch', 'yard', 'centimeter', 'meter long',
  'rhombus', 'hexagon', 'pentagon',
  'tally', 'bar graph', 'pictograph'
];

// ─── Top-level unit checks ───────────────────────────────────────────────────
if (G1_U1_SPEC.unitId !== 'g1u1') err(`unitId should be 'g1u1', got ${G1_U1_SPEC.unitId}`);
if (G1_U1_SPEC.lessons.length !== 8) err(`expected 8 lessons, got ${G1_U1_SPEC.lessons.length}`);
if (!G1_U1_SPEC.schemaVersion) warn(`schemaVersion missing on G1_U1_SPEC`);

const expectedLessons = [
  ['g1-u1-l1', 'Quick Looks',                    ['1.2A'],                'structured_quantity_recognition'],
  ['g1-u1-l2', 'Count Forward',                  ['1.5A'],                'count_forward_from_any_number'],
  ['g1-u1-l3', 'Count Backward',                 ['1.5A'],                'count_backward_from_any_number'],
  ['g1-u1-l4', 'Skip Count by 2s, 5s, and 10s',  ['1.5B'],                'skip_count_to_find_totals'],
  ['g1-u1-l5', 'One More and One Less',          ['1.2D'],                'one_more_one_less'],
  ['g1-u1-l6', 'Ten More and Ten Less',          ['1.5C'],                'ten_more_ten_less'],
  ['g1-u1-l7', 'Order Numbers',                  ['1.2F'],                'order_numbers_to_120'],
  ['g1-u1-l8', 'Compare Numbers',                ['1.2D', '1.2E', '1.2G'], 'compare_numbers_to_100']
];

// ─── R12: unit-level unitTest rule ───────────────────────────────────────────
function checkUnitTest() {
  const ut = G1_U1_SPEC.unitTest;
  if (!ut) { err('R12: missing unit-level unitTest rule'); return; }
  if (ut.totalQuestions !== 40)  err(`R12: unitTest.totalQuestions must be 40, got ${ut.totalQuestions}`);
  if (ut.perLessonCount !== 5)   err(`R12: unitTest.perLessonCount must be 5, got ${ut.perLessonCount}`);
  if (ut.sourceRule !== 'all_lesson_quizbanks') err(`R12: unitTest.sourceRule must be 'all_lesson_quizbanks'`);
  if (ut.difficultyMixBalanced !== true) err('R12: unitTest.difficultyMixBalanced must be true');
  if (ut.preserveDiagnosticMetadata !== true) err('R12: unitTest.preserveDiagnosticMetadata must be true');
  if (ut.unitTestBank != null) err('R12: there must be no separate unitTestBank — unit test pulls from lesson banks');
}

// ─── Per-lesson dispatcher ───────────────────────────────────────────────────
const seenIds = new Set();   // R5: question id uniqueness across whole spec

G1_U1_SPEC.lessons.forEach((l, i) => {
  const tag = `L${i + 1}`;
  const [id, title, teks, skill] = expectedLessons[i] || [];

  // Header alignment
  if (l.lessonId !== id)    err(`${tag} lessonId mismatch: ${l.lessonId} vs ${id}`);
  if (l.title    !== title) err(`${tag} title mismatch: ${l.title} vs ${title}`);
  if (JSON.stringify(l.teks) !== JSON.stringify(teks)) {
    err(`${tag} TEKS mismatch: ${JSON.stringify(l.teks)} vs ${JSON.stringify(teks)}`);
  }
  if (l.skill !== skill) err(`${tag} skill mismatch: ${l.skill} vs ${skill}`);

  // Migration mode: lessons with quizBank get strict checks; lessons with
  // sampleDiagnosticQuestions get the legacy lightweight checks.
  const isMigrated = Array.isArray(l.quizBank);
  const isLegacy   = Array.isArray(l.sampleDiagnosticQuestions);

  if (!isMigrated && !isLegacy) {
    err(`${tag} has neither quizBank nor sampleDiagnosticQuestions`);
    return;
  }

  if (isMigrated) checkMigratedLesson(tag, l);
  else            checkLegacyLesson(tag, l);

  // Off-scope content scan (both modes)
  const allText = JSON.stringify(l).toLowerCase();
  FORBIDDEN_TOPICS.forEach(t => {
    if (allText.includes(t.toLowerCase())) {
      warn(`${tag} contains potentially off-scope word "${t}" (review manually)`);
    }
  });
});

// ─── R13 helper: strict assessment-mode check for numberLine visuals ──────────
// Called from both quizBank and practiceQuestions loops. workedExamples exempt.
function _checkR13NL(qtag, vis, ansStr) {
  const markNum = Number(vis.mark);
  const ansNum  = Number(ansStr);

  if (vis.mode !== 'assessment')
    err(`${qtag} R13: numberLine must use mode:"assessment"`);
  if (!Number.isFinite(markNum))
    err(`${qtag} R13: numberLine missing valid mark`);

  // Resolve destination from first finite jump.to, else from answer
  let dest = null;
  if (Array.isArray(vis.jumps)) {
    for (const j of vis.jumps) {
      const to = Number(j.to);
      if (Number.isFinite(to)) { dest = to; break; }
    }
  }
  if (dest === null && Number.isFinite(ansNum)) dest = ansNum;
  if (dest === null) err(`${qtag} R13: numberLine missing valid destination`);

  if (!vis.labels) {
    err(`${qtag} R13: numberLine missing labels map`);
  } else {
    const markKey = Number.isFinite(markNum) ? String(markNum) : null;
    if (markKey && !(markKey in vis.labels))
      err(`${qtag} R13: labels must contain the mark "${markNum}"`);
    if (Number.isFinite(ansNum) && String(ansNum) in vis.labels)
      err(`${qtag} R13: answer "${ansNum}" must not appear in labels`);
    if (markKey !== null) {
      for (const k of Object.keys(vis.labels)) {
        if (k !== markKey)
          err(`${qtag} R13: labels must only contain the mark key — found extra key "${k}"`);
      }
    }
    for (const v of Object.values(vis.labels)) {
      if (Number.isFinite(ansNum) && String(v) === String(ansNum))
        err(`${qtag} R13: label text "${v}" equals answer — would reveal the answer`);
    }
  }
  if (Array.isArray(vis.jumps)) {
    vis.jumps.forEach((j, ji) => {
      if (!j.hideToLabel)
        err(`${qtag} R13: jump ${ji + 1} must have hideToLabel:true`);
    });
  }
  const ticks = Array.isArray(vis.ticks) ? vis.ticks : [];
  if (ticks.length < 3 || ticks.length > 5)
    warn(`${qtag} R13: ticks.length=${ticks.length} — expected 3–5 for compact assessment view`);
  if (Number.isFinite(markNum) && !ticks.includes(markNum))
    err(`${qtag} R13: ticks must include mark ${markNum}`);
  if (dest !== null && !ticks.includes(dest))
    err(`${qtag} R13: ticks must include destination ${dest}`);
}

// ─── Strict checks (lessons migrated to v0.2.0 schema) ──────────────────────
function checkMigratedLesson(tag, l) {
  // R10: lesson structure
  const k = (l.keyIdeas || []).length;
  if (k < 4 || k > 6) err(`${tag} R10: keyIdeas length=${k} (need 4–6)`);

  const we = (l.workedExamples || []).length;
  if (we !== 12) err(`${tag} R10: workedExamples=${we} (need exactly 12)`);

  const pq = (l.practiceQuestions || []).length;
  if (pq < 20 || pq > 25) err(`${tag} R10: practiceQuestions=${pq} (need 20–25)`);

  const qb = l.quizBank.length;
  if (qb > 220) err(`${tag} R10: quizBank=${qb} (max 220)`);
  else if (qb < 180) warn(`${tag} R10: quizBank=${qb} (need ≥180; build in progress)`);

  // R11: lessonQuizAttempt
  const lqa = l.lessonQuizAttempt;
  if (!lqa) err(`${tag} R11: missing lessonQuizAttempt`);
  else {
    if (lqa.questionCount !== 8) err(`${tag} R11: lessonQuizAttempt.questionCount must be 8`);
    const dm = lqa.difficultyMix;
    if (!dm || dm.easy !== 3 || dm.medium !== 4 || dm.hard !== 1) {
      err(`${tag} R11: lessonQuizAttempt.difficultyMix must be {easy:3, medium:4, hard:1}, got ${JSON.stringify(dm)}`);
    }
    if (lqa.sourceRule !== 'this_lesson_quizbank_only') {
      err(`${tag} R11: lessonQuizAttempt.sourceRule must be 'this_lesson_quizbank_only'`);
    }
    if (lqa.avoidRecentlySeen !== true) err(`${tag} R11: lessonQuizAttempt.avoidRecentlySeen must be true`);
    if (lqa.noDuplicatesWithinAttempt !== true) err(`${tag} R11: lessonQuizAttempt.noDuplicatesWithinAttempt must be true`);
  }

  // R-new-C: L1.3 lessonQuizAttempt must have specific rate-limiting caps
  if (l.lessonId === 'g1-u1-l3' && lqa) {
    if (!lqa.maxNumberLineQuestions)         err(`${tag} R-new-C: _l3QuizAttempt missing maxNumberLineQuestions`);
    if (!lqa.maxSamePromptTemplate)          err(`${tag} R-new-C: _l3QuizAttempt missing maxSamePromptTemplate`);
    if (!lqa.maxSimplePreviousNumberPrompts) err(`${tag} R-new-C: _l3QuizAttempt missing maxSimplePreviousNumberPrompts`);
  }

  // workedExamples shape (existing fields)
  l.workedExamples.forEach((ex, ei) => {
    const need = ['id', 'title', 'prompt', 'visual', 'steps', 'finalAnswer', 'teachingNote', 'relatedKeyIdea'];
    need.forEach(k => { if (!(k in ex)) err(`${tag} ex${ei + 1} missing ${k}`); });
    if (!Array.isArray(ex.steps) || ex.steps.length < 2) err(`${tag} ex${ei + 1} steps too few`);
    if (ex.visual?.type && !SUPPORTED_VISUALS.has(ex.visual.type)) {
      err(`${tag} ex${ei + 1} unknown visual ${ex.visual.type}`);
    }
    if (TENFRAME_FAMILY.has(ex.visual?.type) && !TENFRAME_EXEMPT_LESSONS.has(l.lessonId)) {
      err(`${tag} ex${ei + 1} structured-quantity visual outside exempt lesson`);
    }
    if (l.keyIdeas && !l.keyIdeas.includes(ex.relatedKeyIdea)) {
      err(`${tag} ex${ei + 1} relatedKeyIdea not in keyIdeas: "${ex.relatedKeyIdea}"`);
    }
  });

  // practiceQuestions shape
  (l.practiceQuestions || []).forEach((p, pi) => {
    if (!p.id) err(`${tag} p${pi + 1} missing id`);
    if (!p.prompt) err(`${tag} p${pi + 1} missing prompt`);
    if (p.answer == null) err(`${tag} p${pi + 1} missing answer`);
    if (!p.hint) err(`${tag} p${pi + 1} missing hint`);
    if (!p.explanation) err(`${tag} p${pi + 1} missing explanation`);
    if (!VALID_DIFFICULTIES.has(p.difficulty)) err(`${tag} p${pi + 1} difficulty invalid: ${p.difficulty}`);
    if (l.keyIdeas && !l.keyIdeas.includes(p.keyIdea)) err(`${tag} p${pi + 1} keyIdea not in lesson keyIdeas: "${p.keyIdea}"`);
    if (p.visual?.type && !SUPPORTED_VISUALS.has(p.visual.type)) err(`${tag} p${pi + 1} unknown visual ${p.visual.type}`);
    if (TENFRAME_FAMILY.has(p.visual?.type) && !TENFRAME_EXEMPT_LESSONS.has(l.lessonId)) {
      err(`${tag} p${pi + 1} structured-quantity visual outside exempt lesson`);
    }
    // R13: assessment-mode check for practice numberLines
    if (p.visual && p.visual.type === 'numberLine') {
      _checkR13NL(`${tag} p${pi + 1}`, p.visual, p.answer);
    }
    // R-new-B: L1.3 multipleChoice practice questions must have non-empty choices
    if (l.lessonId === 'g1-u1-l3' && p.interactionType === 'multipleChoice') {
      if (!Array.isArray(p.choices) || p.choices.length === 0)
        err(`${tag} p${pi + 1} R-new-B: multipleChoice practice question has no choices`);
    }
    if (seenIds.has(p.id)) err(`R5: duplicate id ${p.id}`);
    seenIds.add(p.id);
  });

  // quizBank shape — strict per-question, per-choice, anti-duplication
  const qPromptVisualAnswerKeys = new Set();   // R6
  const qChoiceSetByPrompt      = new Map();   // R7
  l.quizBank.forEach((q, qi) => {
    const qtag = `${tag} qb${qi + 1}`;

    // R1: per-question fields
    const required = ['id', 'teks', 'lessonId', 'skill', 'keyIdea', 'difficulty',
                      'interactionType', 'prompt', 'answer', 'choices', 'hint',
                      'intervention', 'followUpRule'];
    required.forEach(k => { if (!(k in q)) err(`${qtag} R1: missing ${k}`); });

    if (q.lessonId && q.lessonId !== l.lessonId) err(`${qtag} R1: lessonId mismatch ${q.lessonId} vs ${l.lessonId}`);
    if (q.skill && q.skill !== l.skill)           err(`${qtag} R1: skill mismatch ${q.skill} vs ${l.skill}`);
    if (q.teks && JSON.stringify(q.teks) !== JSON.stringify(l.teks)) {
      err(`${qtag} R1: TEKS mismatch ${JSON.stringify(q.teks)} vs ${JSON.stringify(l.teks)}`);
    }
    if (l.keyIdeas && q.keyIdea && !l.keyIdeas.includes(q.keyIdea)) {
      err(`${qtag} R1: keyIdea "${q.keyIdea}" not in lesson keyIdeas`);
    }
    if (!VALID_DIFFICULTIES.has(q.difficulty)) err(`${qtag} R1: difficulty invalid: ${q.difficulty}`);
    if (!VALID_INTERACTION.has(q.interactionType)) err(`${qtag} R1: interactionType invalid: ${q.interactionType}`);
    if (!VALID_FOLLOWUP_RULES.has(q.followUpRule)) err(`${qtag} R1: followUpRule invalid: ${q.followUpRule}`);

    // R-new-A: L1.3 requires subSkill and promptTemplate on every quizBank question
    if (l.lessonId === 'g1-u1-l3') {
      if (!q.subSkill)       err(`${qtag} R-new-A: missing subSkill`);
      if (!q.promptTemplate) err(`${qtag} R-new-A: missing promptTemplate`);
    }

    // Visual checks
    if (q.visual?.type && !SUPPORTED_VISUALS.has(q.visual.type)) {
      err(`${qtag} unknown visual ${q.visual.type}`);
    }
    if (TENFRAME_FAMILY.has(q.visual?.type) && !TENFRAME_EXEMPT_LESSONS.has(l.lessonId)) {
      err(`${qtag} structured-quantity visual outside exempt lesson`);
    }

    // R13: strict assessment-mode check. Worked examples are exempt.
    if (q.visual && q.visual.type === 'numberLine') {
      _checkR13NL(qtag, q.visual, q.answer);
    }

    // R5: question id uniqueness
    if (q.id) {
      if (seenIds.has(q.id)) err(`R5: duplicate id ${q.id}`);
      seenIds.add(q.id);
    }

    // intervention object
    const iv = q.intervention || {};
    const ivNeeded = ['errorTag', 'title', 'teachingSteps', 'correctAnswerExplanation', 'followUpRule', 'doNotRepeatOriginalQuestion'];
    ivNeeded.forEach(k => { if (!(k in iv)) err(`${qtag} R1: intervention missing ${k}`); });
    if (!Array.isArray(iv.teachingSteps) || iv.teachingSteps.length < 2) {
      err(`${qtag} R1: intervention.teachingSteps must be array of ≥2 strings`);
    }
    if (iv.doNotRepeatOriginalQuestion !== true) err(`${qtag} R1: intervention.doNotRepeatOriginalQuestion must be true`);
    if (iv.followUpRule && !VALID_FOLLOWUP_RULES.has(iv.followUpRule)) {
      err(`${qtag} R1: intervention.followUpRule invalid: ${iv.followUpRule}`);
    }

    // R2 + R3: per-choice metadata
    const choices = Array.isArray(q.choices) ? q.choices : [];
    if (choices.length < 2) err(`${qtag} R1: choices must have ≥2 entries`);
    let correctCount = 0;
    choices.forEach((c, ci) => {
      const ctag = `${qtag} c${ci + 1}`;
      if (c.value == null) err(`${ctag} missing value`);
      if (typeof c.correct !== 'boolean') err(`${ctag} missing/invalid correct flag`);
      if (c.correct === true) {
        correctCount += 1;
        // R3: correct must have NO errorTag, NO distractorType, NO misconceptionExplanation
        if ('errorTag' in c)                err(`${ctag} R3: correct choice must not have errorTag`);
        if ('distractorType' in c)          err(`${ctag} R3: correct choice must not have distractorType`);
        if ('misconceptionExplanation' in c) err(`${ctag} R3: correct choice must not have misconceptionExplanation`);
      } else {
        // R2: wrong choices must have all three fields
        if (!c.distractorType)            err(`${ctag} R2: wrong choice missing distractorType`);
        if (!c.errorTag)                   err(`${ctag} R2: wrong choice missing errorTag`);
        else if (!c.errorTag.startsWith('err_')) err(`${ctag} R2: errorTag "${c.errorTag}" must start with err_`);
        if (!c.misconceptionExplanation) err(`${ctag} R2: wrong choice missing misconceptionExplanation`);
      }
    });
    if (correctCount !== 1) err(`${qtag} must have exactly 1 correct choice, got ${correctCount}`);

    // Confirm answer field matches the correct choice
    const correctChoice = choices.find(c => c.correct === true);
    if (correctChoice && q.answer != null && correctChoice.value !== q.answer) {
      err(`${qtag} answer (${q.answer}) does not match correct choice value (${correctChoice.value})`);
    }

    // R4: no duplicate choice values within a question
    const vals = choices.map(c => String(c.value));
    if (new Set(vals).size !== vals.length) err(`${qtag} R4: duplicate choice values`);

    // R6: no duplicate prompt+answer+visual combination within the lesson
    const r6key = JSON.stringify([q.prompt, q.answer, q.visual]);
    if (qPromptVisualAnswerKeys.has(r6key)) err(`${qtag} R6: duplicate prompt+answer+visual combo`);
    qPromptVisualAnswerKeys.add(r6key);

    // R7: no duplicate answer-choice set for the same prompt/interaction
    const r7promptKey  = `${q.interactionType}|${q.prompt}`;
    const r7choiceKey  = JSON.stringify([...vals].sort());
    if (!qChoiceSetByPrompt.has(r7promptKey)) qChoiceSetByPrompt.set(r7promptKey, new Set());
    const set = qChoiceSetByPrompt.get(r7promptKey);
    if (set.has(r7choiceKey)) err(`${qtag} R7: duplicate answer-choice set for prompt "${q.prompt}"`);
    set.add(r7choiceKey);
  });

  // R-new-D: L1.3 subSkill coverage and promptTemplate diversity
  if (l.lessonId === 'g1-u1-l3') {
    const bank = l.quizBank;
    const qa   = l.lessonQuizAttempt;

    // All requiredSubSkills must have ≥1 question in the bank
    ((qa && qa.requiredSubSkills) || []).forEach(ss => {
      const count = bank.filter(q => q.subSkill === ss).length;
      if (count === 0) err(`R-new-D: no quizBank questions found for requiredSubSkill '${ss}'`);
      if (count < 3)   warn(`R-new-D: subSkill '${ss}' has only ${count} question(s) — low coverage`);
    });

    // Prompt template diversity — no single template should dominate >40%
    const ptCounts = {};
    bank.forEach(q => { ptCounts[q.promptTemplate] = (ptCounts[q.promptTemplate] || 0) + 1; });
    const maxPT = Math.max(...Object.values(ptCounts));
    if (maxPT > bank.length * 0.4)
      warn(`R-new-D: single promptTemplate accounts for >40% of quizBank — quiz may feel repetitive`);
  }
}

// ─── Legacy checks (lessons not yet migrated) ───────────────────────────────
function checkLegacyLesson(tag, l) {
  if (!l.diagnostics) err(`${tag} (legacy) missing diagnostics`);
  if ((l.workedExamples || []).length !== 3) err(`${tag} (legacy) workedExamples must be 3 in legacy lessons`);
  const sd = l.sampleDiagnosticQuestions || [];
  if (sd.length !== 2) err(`${tag} (legacy) sampleDiagnosticQuestions must be 2`);
  sd.forEach((q, qi) => {
    const qtag = `${tag} sd${qi + 1}`;
    if (!q.t) err(`${qtag} missing t`);
    if (!Array.isArray(q.o) || q.o.length !== 4) err(`${qtag} options must be array of 4`);
    if (!LEGACY_DIFF_CODES.has(q.d)) err(`${qtag} difficulty code invalid: ${q.d}`);
  });
}

checkUnitTest();

// ─── R8 (cross-lesson follow-up sanity, heuristic) ───────────────────────────
// Heuristic: if a question's prompt+visual matches another's prompt+visual AND
// they share the same primary errorTag, that's a potential same-instance reuse.
// (Real follow-ups should differ in numbers or arrangement.)
{
  const byPromptVisualErr = new Map();
  G1_U1_SPEC.lessons.forEach(l => {
    if (!Array.isArray(l.quizBank)) return;
    l.quizBank.forEach(q => {
      const k = JSON.stringify([q.prompt, q.visual, q.intervention?.errorTag]);
      const arr = byPromptVisualErr.get(k) || [];
      arr.push(q.id);
      byPromptVisualErr.set(k, arr);
    });
  });
  byPromptVisualErr.forEach((ids, k) => {
    if (ids.length > 1) warn(`R8: questions ${ids.join(', ')} share identical prompt+visual+errorTag`);
  });
}

// ─── Counts summary ─────────────────────────────────────────────────────────
console.log('\n=== Counts ===');
console.log('Lessons:                           ', G1_U1_SPEC.lessons.length);
console.log('Schema version:                    ', G1_U1_SPEC.schemaVersion || '(unset)');
G1_U1_SPEC.lessons.forEach((l, i) => {
  const isMig = Array.isArray(l.quizBank);
  if (isMig) {
    const dMix = { easy: 0, medium: 0, hard: 0 };
    l.quizBank.forEach(q => { if (dMix[q.difficulty] != null) dMix[q.difficulty]++; });
    console.log(
      `  L${i+1} ${l.lessonId.padEnd(10)} migrated  | ` +
      `keyIdeas=${(l.keyIdeas||[]).length} examples=${(l.workedExamples||[]).length} practice=${(l.practiceQuestions||[]).length} quizBank=${l.quizBank.length} ` +
      `[easy=${dMix.easy} med=${dMix.medium} hard=${dMix.hard}]`
    );
  } else {
    console.log(
      `  L${i+1} ${l.lessonId.padEnd(10)} legacy    | ` +
      `keyIdeas=${(l.keyIdeas||[]).length} examples=${(l.workedExamples||[]).length} sampleQs=${(l.sampleDiagnosticQuestions||[]).length}`
    );
  }
});

// ─── Results ────────────────────────────────────────────────────────────────
console.log('\n=== Validation results ===');
if (errors.length === 0) console.log(`✓ ${errors.length} errors`);
else { console.log(`✗ ${errors.length} ERRORS:`); errors.forEach(e => console.log('  -', e)); }
if (warns.length === 0) console.log(`✓ 0 warnings`);
else { console.log(`! ${warns.length} warnings:`); warns.forEach(w => console.log('  -', w)); }

if (errors.length > 0) process.exit(1);
