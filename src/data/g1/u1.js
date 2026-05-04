/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 1: Counting and Number Relationships to 120
 *  Design Spec — schema version 0.2.0
 *
 *  This file is a DESIGN ARTIFACT. It is *not* loaded by the runtime in this
 *  phase. It captures the rich pedagogical schema (keyIdeas, workedExamples,
 *  practiceQuestions, quizBank with per-question diagnostics + intervention,
 *  lessonQuizAttempt rule, unit-level unitTest rule) ahead of engine
 *  integration.
 *
 *  v0.2.0 changes vs v0.1.0:
 *    - Per-question intervention object on every quizBank question
 *      (errorTag, title, teachingSteps[], correctAnswerExplanation,
 *      followUpRule, doNotRepeatOriginalQuestion).
 *    - Per-choice metadata: every wrong choice carries
 *      { value, correct:false, distractorType, errorTag, misconceptionExplanation }.
 *      Correct choice carries { value, correct:true } only.
 *    - New lesson fields: practiceQuestions[], quizBank[], lessonQuizAttempt{}.
 *    - Targets per lesson: 4–6 keyIdeas, 12 worked examples, 20–25 practice,
 *      180–220 quizBank questions, lessonQuizAttempt.questionCount === 8
 *      (3 easy / 4 medium / 1 hard).
 *    - Unit-level unitTest rule: 40 questions, 5 from each lesson,
 *      pulled from lesson quizBanks (no separate unitTestBank).
 *
 *  Migration state: Lesson 1.1 is fully migrated to v0.2.0. Lessons 1.2–1.8
 *  retain the v0.1.0 sampleDiagnosticQuestions shape and will be migrated in
 *  follow-up phases once the L1.1 quality is approved.
 *
 *  ──────────────────────────────────────────────────────────────────────────
 *  TEKS covered:
 *    1.2A — recognize instantly the quantity of structured arrangements
 *    1.2D — generate a number greater/less than a given whole number ≤ 120
 *    1.2E — use place value to compare whole numbers ≤ 120
 *    1.2F — order whole numbers ≤ 120 using place value and number lines
 *    1.2G — represent comparison of two numbers ≤ 100 using >, <, =
 *    1.5A — recite numbers forward/backward from any given number 1–120
 *    1.5B — skip count by 2s, 5s, 10s up to 120
 *    1.5C — determine 10 more / 10 less than a given number up to 120
 *
 *  ──────────────────────────────────────────────────────────────────────────
 *  Translation rules → engine compact format (applied during integration):
 *    keyIdeas[]                          → lesson.points[]
 *    workedExamples[].title              → examples[].tag
 *    workedExamples[].prompt             → examples[].p
 *    workedExamples[].visual             → examples[].v
 *    workedExamples[].steps.join('\n')   → examples[].s
 *    workedExamples[].finalAnswer        → examples[].a
 *    practiceQuestions[]                 → lesson.practice[] (q,a,h,e shape)
 *    quizBank[]                          → lesson.qBank[] (compact options form)
 *    quizBank[].choices[]                → qBank[].o[] (drop distractorType +
 *                                          misconceptionExplanation; keep tag)
 *    quizBank[].intervention             → drives lesson.defaultIntervention
 *                                          + per-question intervention metadata
 *    lessonQuizAttempt                   → engine quiz-session config
 *    unitTest                            → engine unit-test config
 *
 *  ──────────────────────────────────────────────────────────────────────────
 *  TODO (structured-quantity visuals): Lesson 1.1 uses a family of visual
 *  types that are NOT yet implemented in src/visuals.js:
 *    - tenFrame      { type:'tenFrame',     count:N }              N in 0..10
 *    - fivFrame      { type:'fivFrame',     count:N }              N in 0..5
 *    - dicePattern   { type:'dicePattern',  face:N }               N in 1..6
 *    - domino        { type:'domino',       left:M, right:N }      M,N in 0..6
 *
 *  During engine integration, do ONE of the following — but DO NOT downgrade
 *  the source spec to objectSet:
 *    (A) Add real renderers in src/visuals.js (preferred, preserves the
 *        structured-quantity affordance students need to subitize).
 *    (B) Add an in-memory adapter that maps each to objectSet{layout:'grid',
 *        cols:5} for tenFrame/fivFrame; objectSet{layout:'dice'} for dice
 *        patterns; twoGroups for dominoes. Acceptable interim, but upgrade
 *        to (A) before shipping Grade 1.
 *
 *  Until then, structured-quantity visuals on Lesson 1.1 are EXEMPT from
 *  runtime visual-type validation (see scripts/validate-g1u1-spec.mjs).
 *  Lessons 1.2–1.8 use renderer-supported types directly.
 * ════════════════════════════════════════════════════════════════════════════ */

// ─── Helper factories (private; build L1.1 content in v0.2.0 schema) ─────────

function _l1Q(n, o) {
  return {
    id: `g1-u1-l1-q-${String(n).padStart(3, '0')}`,
    teks: ['1.2A'],
    lessonId: 'g1-u1-l1',
    skill: 'structured_quantity_recognition',
    keyIdea: o.keyIdea,
    difficulty: o.difficulty,
    interactionType: o.interactionType || 'multipleChoice',
    prompt: o.prompt,
    visual: o.visual,
    answer: o.answer,
    choices: o.choices,
    hint: o.hint,
    intervention: {
      errorTag: o.intervention.errorTag,
      title: o.intervention.title,
      teachingSteps: o.intervention.teachingSteps,
      correctAnswerExplanation: o.intervention.correctAnswerExplanation,
      followUpRule: o.intervention.followUpRule || 'same_skill_new_numbers',
      doNotRepeatOriginalQuestion: o.intervention.doNotRepeatOriginalQuestion !== false
    },
    followUpRule: o.followUpRule || 'same_skill_new_numbers'
  };
}

function _l1P(n, o) {
  return {
    id: `g1-u1-l1-p-${String(n).padStart(3, '0')}`,
    teks: ['1.2A'],
    lessonId: 'g1-u1-l1',
    skill: 'structured_quantity_recognition',
    interactionType: o.interactionType || 'inputNumber',
    prompt: o.prompt,
    visual: o.visual,
    answer: o.answer,
    hint: o.hint,
    explanation: o.explanation,
    difficulty: o.difficulty,
    keyIdea: o.keyIdea
  };
}

function _l1E(n, o) {
  return {
    id: `g1-u1-l1-ex-${String(n).padStart(3, '0')}`,
    title: o.title,
    prompt: o.prompt,
    visual: o.visual,
    steps: o.steps,
    finalAnswer: o.finalAnswer,
    teachingNote: o.teachingNote,
    relatedKeyIdea: o.relatedKeyIdea
  };
}

// ─── Helper factories (private; build L1.2 content in v0.2.0 schema) ─────────

function _toAssessmentNL(visual, answerNum) {
  var markVal        = Number(visual.mark);
  var destFromAnswer = Number(answerNum);

  if (!Number.isFinite(markVal)) {
    return Object.assign({}, visual, {
      mode: 'assessment',
      ticks: [], jumps: [], hideLabels: [],
      labels: {},
      assessmentWarning: 'Missing valid mark for assessment numberLine'
    });
  }

  var dest        = null;
  var sourceJumps = Array.isArray(visual.jumps) ? visual.jumps : [];
  var newJumps    = sourceJumps.map(function(j) {
    var to = Number(j.to);
    if (dest === null && j.to != null && Number.isFinite(to)) dest = to;
    return Object.assign({}, j, { hideToLabel: true });
  });

  if (dest === null && Number.isFinite(destFromAnswer)) {
    dest = destFromAnswer;
  }

  if (newJumps.length === 0 && Number.isFinite(dest)) {
    var autoLabel = dest < markVal ? '-1' : '+1';
    newJumps.push({ from: markVal, to: dest, label: autoLabel, hideToLabel: true });
  }

  if (!Number.isFinite(dest)) {
    return Object.assign({}, visual, {
      mode: 'assessment',
      ticks: [], jumps: [], hideLabels: [],
      labels: { [String(markVal)]: String(markVal) },
      assessmentWarning: 'Missing valid destination for assessment numberLine'
    });
  }

  var compactMin   = Math.min(markVal - 1, dest - 1);
  var compactMax   = Math.max(markVal + 2, dest + 1);
  var compactTicks = [];
  for (var t = compactMin; t <= compactMax; t++) compactTicks.push(t);

  return Object.assign({}, visual, {
    mode:       'assessment',
    min:        compactMin,
    max:        compactMax,
    ticks:      compactTicks,
    labels:     { [String(markVal)]: String(markVal) },
    jumps:      newJumps,
    hideLabels: [dest]
  });
}

function _l2Q(n, o) {
  // Auto-derive distractorType from errorTag if not provided (strip 'err_' prefix)
  var choices = (o.choices || []).map(function(c) {
    if (c.correct) return c;
    if (!c.distractorType && c.errorTag) {
      return Object.assign({}, c, { distractorType: c.errorTag.replace(/^err_/, '') });
    }
    return c;
  });
  // Ensure teachingSteps is always an array of ≥2 strings
  var ts = o.intervention.teachingSteps;
  if (!Array.isArray(ts)) ts = [ts, 'To check: start at the original number and count exactly one step forward.'];
  var visual = o.visual || null;
  if (visual && visual.type === 'numberLine') {
    visual = _toAssessmentNL(visual, Number(o.answer));
  }
  return {
    id: `g1-u1-l2-q-${String(n).padStart(3, '0')}`,
    teks: ['1.5A'],
    lessonId: 'g1-u1-l2',
    skill: 'count_forward_from_any_number',
    keyIdea: o.keyIdea,
    difficulty: o.difficulty,
    interactionType: o.interactionType || 'multipleChoice',
    prompt: o.prompt,
    visual: visual,
    answer: o.answer,
    choices: choices,
    hint: o.hint,
    intervention: {
      errorTag:                    o.intervention.errorTag,
      title:                       o.intervention.title,
      teachingSteps:               ts,
      correctAnswerExplanation:    o.intervention.correctAnswerExplanation,
      followUpRule:                o.intervention.followUpRule || 'same_skill_new_numbers',
      doNotRepeatOriginalQuestion: true
    },
    followUpRule: o.followUpRule || 'same_skill_new_numbers'
  };
}

function _l2P(n, o) {
  var visual = o.visual || null;
  if (visual && visual.type === 'numberLine') {
    visual = _toAssessmentNL(visual, Number(o.answer));
  }
  return {
    id: `g1-u1-l2-p-${String(n).padStart(3, '0')}`,
    teks: ['1.5A'],
    lessonId: 'g1-u1-l2',
    skill: 'count_forward_from_any_number',
    interactionType: o.interactionType || 'multipleChoice',
    prompt:      o.prompt,
    visual:      visual,
    answer:      o.answer,
    hint:        o.hint,
    explanation: o.explanation,
    difficulty:  o.difficulty,
    keyIdea:     o.keyIdea
  };
}

function _l2E(n, o) {
  return {
    id: `g1-u1-l2-ex-${String(n).padStart(3, '0')}`,
    title:          o.title,
    prompt:         o.prompt,
    visual:         o.visual || null,
    steps:          o.steps,
    finalAnswer:    o.finalAnswer,
    teachingNote:   o.teachingNote,
    relatedKeyIdea: o.relatedKeyIdea
  };
}

// ─── Helper factories (private; build L1.3 content in v0.2.0 schema) ─────────

function _l3Q(n, o) {
  var choices = (o.choices || []).map(function(c) {
    if (c.correct) return c;
    if (!c.distractorType && c.errorTag) {
      return Object.assign({}, c, { distractorType: c.errorTag.replace(/^err_/, '') });
    }
    return c;
  });
  var ts = o.intervention.teachingSteps;
  if (!Array.isArray(ts)) ts = [ts, 'To check: start at the original number and count exactly one step backward.'];
  var visual = o.visual || null;
  if (visual && visual.type === 'numberLine') {
    visual = _toAssessmentNL(visual, Number(o.answer));
  }
  return {
    id: 'g1-u1-l3-q-' + String(n).padStart(3, '0'),
    teks: ['1.5A'],
    lessonId: 'g1-u1-l3',
    skill: 'count_backward_from_any_number',
    subSkill:        o.subSkill,
    promptTemplate:  o.promptTemplate,
    keyIdea: o.keyIdea,
    difficulty: o.difficulty,
    interactionType: o.interactionType || 'multipleChoice',
    prompt: o.prompt,
    visual: visual,
    answer: o.answer,
    choices: choices,
    hint: o.hint,
    intervention: {
      errorTag:                    o.intervention.errorTag,
      title:                       o.intervention.title,
      teachingSteps:               ts,
      correctAnswerExplanation:    o.intervention.correctAnswerExplanation,
      followUpRule:                o.intervention.followUpRule || 'same_skill_new_numbers',
      doNotRepeatOriginalQuestion: true
    },
    followUpRule: o.followUpRule || 'same_skill_new_numbers'
  };
}

function _l3P(n, o) {
  var visual = o.visual || null;
  if (visual && visual.type === 'numberLine') {
    visual = _toAssessmentNL(visual, Number(o.answer));
  }
  return {
    id: 'g1-u1-l3-p-' + String(n).padStart(3, '0'),
    teks: ['1.5A'],
    lessonId: 'g1-u1-l3',
    skill: 'count_backward_from_any_number',
    interactionType: o.interactionType || 'multipleChoice',
    prompt:      o.prompt,
    visual:      visual,
    answer:      o.answer,
    choices:     o.choices || null,
    hint:        o.hint,
    explanation: o.explanation,
    difficulty:  o.difficulty,
    keyIdea:     o.keyIdea
  };
}

function _l3E(n, o) {
  return {
    id: 'g1-u1-l3-ex-' + String(n).padStart(3, '0'),
    title:          o.title,
    prompt:         o.prompt,
    visual:         o.visual || null,
    steps:          o.steps,
    finalAnswer:    o.finalAnswer,
    teachingNote:   o.teachingNote,
    relatedKeyIdea: o.relatedKeyIdea
  };
}

// ─── Lesson 1.1: Key Ideas (5) ───────────────────────────────────────────────

const _l1KeyIdeas = [
  'Look for groups first, before you count one by one.',
  'A full row in a ten-frame has 5.',
  'Two full rows make 10.',
  'When the top row is full, just count the extras below.',
  'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.'
];

// ─── Lesson 1.1: Worked Examples (12) ────────────────────────────────────────

const _l1Examples = [
  _l1E(1, {
    title: 'Example 1: An Empty Ten-Frame',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 0 },
    steps: [
      'Look at the ten-frame.',
      'No cells are filled.',
      'The total is 0.'
    ],
    finalAnswer: '0',
    teachingNote: 'Anchor 0 as "no dots filled." Don\'t let students count empty cells.',
    relatedKeyIdea: 'Look for groups first, before you count one by one.'
  }),
  _l1E(2, {
    title: 'Example 2: One Dot',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 1 },
    steps: [
      'There is 1 dot in the top row.',
      'The rest is empty.',
      'The total is 1.'
    ],
    finalAnswer: '1',
    teachingNote: 'Reinforce that empty cells don\'t add to the count.',
    relatedKeyIdea: 'Look for groups first, before you count one by one.'
  }),
  _l1E(3, {
    title: 'Example 3: Three in a Row',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 3 },
    steps: [
      'Three dots fill the start of the top row.',
      'Subitize: see 3 without counting one-by-one.',
      'The total is 3.'
    ],
    finalAnswer: '3',
    teachingNote: 'Build subitizing fluency for 1–3 before chaining with structure.',
    relatedKeyIdea: 'Look for groups first, before you count one by one.'
  }),
  _l1E(4, {
    title: 'Example 4: Anchor of 5',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 5 },
    steps: [
      'The top row is full.',
      'A full row is 5.',
      'The total is 5.'
    ],
    finalAnswer: '5',
    teachingNote: 'This is the keystone fact: full top row = 5. Used everywhere downstream.',
    relatedKeyIdea: 'A full row in a ten-frame has 5.'
  }),
  _l1E(5, {
    title: 'Example 5: Five and One More',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 6 },
    steps: [
      'The top row is full. That is 5.',
      'There is 1 more dot in the bottom row.',
      '5 and 1 makes 6.'
    ],
    finalAnswer: '6',
    teachingNote: 'Pair with verbal "five and one." This is the count-on routine.',
    relatedKeyIdea: 'When the top row is full, just count the extras below.'
  }),
  _l1E(6, {
    title: 'Example 6: Five and Three More',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 8 },
    steps: [
      'The top row is full — 5.',
      'There are 3 more dots in the bottom row.',
      '5 and 3 makes 8.'
    ],
    finalAnswer: '8',
    teachingNote: 'Don\'t let students restart counting; chain from the anchor of 5.',
    relatedKeyIdea: 'When the top row is full, just count the extras below.'
  }),
  _l1E(7, {
    title: 'Example 7: A Full Ten-Frame',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 10 },
    steps: [
      'The top row is full — 5.',
      'The bottom row is also full — 5 more.',
      '5 and 5 makes 10.'
    ],
    finalAnswer: '10',
    teachingNote: 'The 10 anchor; bridges to teen numbers and place value later.',
    relatedKeyIdea: 'Two full rows make 10.'
  }),
  _l1E(8, {
    title: 'Example 8: A Five-Frame Shows 4',
    prompt: 'How many dots?',
    visual: { type: 'fivFrame', count: 4 },
    steps: [
      'The five-frame has 5 cells.',
      '4 cells are filled.',
      'There is 1 empty cell. So the count is 4.'
    ],
    finalAnswer: '4',
    teachingNote: 'A five-frame is a smaller ten-frame; teaches "almost full" intuition.',
    relatedKeyIdea: 'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.'
  }),
  _l1E(9, {
    title: 'Example 9: A Dice Pattern of 5',
    prompt: 'How many dots?',
    visual: { type: 'dicePattern', face: 5 },
    steps: [
      'The dice shows the X pattern.',
      'Four dots in the corners and one in the middle.',
      'That is 5.'
    ],
    finalAnswer: '5',
    teachingNote: 'Tie dice subitizing to ten-frame anchor of 5. Same number, different picture.',
    relatedKeyIdea: 'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.'
  }),
  _l1E(10, {
    title: 'Example 10: A Dice Pattern of 6',
    prompt: 'How many dots?',
    visual: { type: 'dicePattern', face: 6 },
    steps: [
      'The dice shows two rows of 3 dots.',
      '3 and 3 is 6.',
      'The total is 6.'
    ],
    finalAnswer: '6',
    teachingNote: 'Dice 6 is two groups of 3 — a different way to make 6 than a ten-frame.',
    relatedKeyIdea: 'Look for groups first, before you count one by one.'
  }),
  _l1E(11, {
    title: 'Example 11: A Domino of 7',
    prompt: 'How many dots in all?',
    visual: { type: 'domino', left: 3, right: 4 },
    steps: [
      'The left side shows 3.',
      'The right side shows 4.',
      '3 and 4 makes 7.'
    ],
    finalAnswer: '7',
    teachingNote: 'Dominoes combine two subitized parts. Foundation for addition fluency.',
    relatedKeyIdea: 'Look for groups first, before you count one by one.'
  }),
  _l1E(12, {
    title: 'Example 12: Recognize a Number from a Ten-Frame',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 8 }, // TODO tenFrame
    steps: [
      'Look at the ten-frame.',
      'The top row is full — that is 5.',
      'Three more dots in the bottom row. 5 and 3 makes 8.',
      'This arrangement shows 8.'
    ],
    finalAnswer: '8',
    teachingNote: 'Use the anchor-of-5 strategy. Consolidates count 8 before harder distractor work.',
    relatedKeyIdea: 'When the top row is full, just count the extras below.'
  })
];

// ─── Lesson 1.1: Practice Questions (22) ─────────────────────────────────────

const _l1Practice = [
  _l1P(1,  { difficulty: 'easy',   prompt: 'How many dots?', visual: { type: 'tenFrame', count: 1 }, answer: 1,  hint: 'Just one dot is filled.',                       explanation: 'There is 1 dot in the top row. The total is 1.',                                       keyIdea: 'Look for groups first, before you count one by one.' }),
  _l1P(2,  { difficulty: 'easy',   prompt: 'How many dots?', visual: { type: 'tenFrame', count: 2 }, answer: 2,  hint: 'Two dots in the top row.',                       explanation: '2 dots fill the start of the top row. The total is 2.',                                keyIdea: 'Look for groups first, before you count one by one.' }),
  _l1P(3,  { difficulty: 'easy',   prompt: 'How many dots?', visual: { type: 'tenFrame', count: 3 }, answer: 3,  hint: 'Three dots in the top row.',                     explanation: '3 dots fill the start of the top row. The total is 3.',                                keyIdea: 'Look for groups first, before you count one by one.' }),
  _l1P(4,  { difficulty: 'easy',   prompt: 'How many dots?', visual: { type: 'tenFrame', count: 4 }, answer: 4,  hint: 'Four dots in the top row, one empty cell.',      explanation: '4 dots fill all but the last cell of the top row. The total is 4.',                    keyIdea: 'Look for groups first, before you count one by one.' }),
  _l1P(5,  { difficulty: 'easy',   prompt: 'How many dots?', visual: { type: 'tenFrame', count: 5 }, answer: 5,  hint: 'A full top row.',                                explanation: 'A full row is 5. The total is 5.',                                                       keyIdea: 'A full row in a ten-frame has 5.' }),
  _l1P(6,  { difficulty: 'easy',   prompt: 'How many dots?', visual: { type: 'tenFrame', count: 6 }, answer: 6,  hint: 'A full top row plus one more.',                  explanation: '5 in the top row and 1 more makes 6.',                                                  keyIdea: 'When the top row is full, just count the extras below.' }),
  _l1P(7,  { difficulty: 'medium', prompt: 'How many dots?', visual: { type: 'tenFrame', count: 7 }, answer: 7,  hint: 'Top row is full. Count the extras below.',       explanation: '5 in the top row and 2 more makes 7.',                                                  keyIdea: 'When the top row is full, just count the extras below.' }),
  _l1P(8,  { difficulty: 'medium', prompt: 'How many dots?', visual: { type: 'tenFrame', count: 8 }, answer: 8,  hint: 'Five and three more.',                           explanation: '5 in the top row and 3 more makes 8.',                                                  keyIdea: 'When the top row is full, just count the extras below.' }),
  _l1P(9,  { difficulty: 'medium', prompt: 'How many dots?', visual: { type: 'tenFrame', count: 9 }, answer: 9,  hint: 'Five and four more — almost a full ten-frame.',   explanation: '5 in the top row and 4 more makes 9.',                                                  keyIdea: 'When the top row is full, just count the extras below.' }),
  _l1P(10, { difficulty: 'easy',   prompt: 'How many dots?', visual: { type: 'tenFrame', count: 10 }, answer: 10, hint: 'Both rows are full.',                            explanation: 'Two full rows make 10.',                                                                 keyIdea: 'Two full rows make 10.' }),
  _l1P(11, { difficulty: 'easy',   prompt: 'How many dots?', visual: { type: 'tenFrame', count: 0 }, answer: 0,  hint: 'No dots are filled.',                            explanation: 'No cells are filled, so there are 0 dots.',                                              keyIdea: 'Look for groups first, before you count one by one.' }),
  _l1P(12, { difficulty: 'easy',   prompt: 'How many dots?', visual: { type: 'fivFrame', count: 2 }, answer: 2,  hint: 'A five-frame has 5 cells. Two are filled.',      explanation: '2 cells are filled in the five-frame. The total is 2.',                                  keyIdea: 'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.' }),
  _l1P(13, { difficulty: 'easy',   prompt: 'How many dots?', visual: { type: 'fivFrame', count: 5 }, answer: 5,  hint: 'A full five-frame.',                              explanation: 'All 5 cells are filled. The total is 5.',                                                keyIdea: 'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.' }),
  _l1P(14, { difficulty: 'easy',   prompt: 'How many dots on the dice?', visual: { type: 'dicePattern', face: 3 }, answer: 3, hint: 'Three dots in a diagonal line.',     explanation: 'A dice 3 shows 3 dots in a diagonal pattern. The total is 3.',                           keyIdea: 'Look for groups first, before you count one by one.' }),
  _l1P(15, { difficulty: 'easy',   prompt: 'How many dots on the dice?', visual: { type: 'dicePattern', face: 4 }, answer: 4, hint: 'Four dots in the four corners.',     explanation: 'A dice 4 shows dots in all four corners. The total is 4.',                               keyIdea: 'Look for groups first, before you count one by one.' }),
  _l1P(16, { difficulty: 'easy',   prompt: 'How many dots on the dice?', visual: { type: 'dicePattern', face: 6 }, answer: 6, hint: 'Two rows of three.',                  explanation: 'A dice 6 shows two rows of 3 dots each. 3 and 3 makes 6.',                              keyIdea: 'Look for groups first, before you count one by one.' }),
  _l1P(17, { difficulty: 'medium', prompt: 'Without counting one by one, how many dots?', visual: { type: 'tenFrame', count: 5 }, answer: 5, hint: 'A full row is your friend.', explanation: 'The top row is full. A full row is 5.',                                            keyIdea: 'A full row in a ten-frame has 5.' }),
  _l1P(18, { difficulty: 'medium', prompt: 'Without counting one by one, how many dots?', visual: { type: 'tenFrame', count: 7 }, answer: 7, hint: 'Use the anchor of 5.',  explanation: '5 in the top row plus 2 more is 7.',                                                     keyIdea: 'When the top row is full, just count the extras below.' }),
  _l1P(19, { difficulty: 'medium', prompt: 'Without counting one by one, how many dots?', visual: { type: 'tenFrame', count: 9 }, answer: 9, hint: 'One short of a full ten-frame.', explanation: '5 in the top row plus 4 more is 9. (Or: 10 minus 1.)',                                keyIdea: 'When the top row is full, just count the extras below.' }),
  _l1P(20, { difficulty: 'medium', prompt: 'How many dots in all?', visual: { type: 'domino', left: 3, right: 3 }, answer: 6, hint: 'Two parts: 3 on the left and 3 on the right.', explanation: '3 and 3 makes 6.',                                                                   keyIdea: 'Look for groups first, before you count one by one.' }),
  _l1P(21, { difficulty: 'medium', prompt: 'How many dots in all?', visual: { type: 'domino', left: 2, right: 5 }, answer: 7, hint: '2 on the left, 5 on the right.', explanation: '2 and 5 makes 7.',                                                                          keyIdea: 'Look for groups first, before you count one by one.' }),
  _l1P(22, { difficulty: 'medium', prompt: 'How many dots in all?', visual: { type: 'domino', left: 4, right: 4 }, answer: 8, hint: 'Both sides show 4.', explanation: '4 and 4 makes 8.',                                                                                 keyIdea: 'Look for groups first, before you count one by one.' })
];

// ─── Lesson 1.1: Quiz Bank — initial 30-question quality slice ───────────────
//
// Build state: 30 / 180 minimum. Validator will report quizBank<180 as a
// build-in-progress warning. Once this slice is approved for quality, the
// remaining ~150–190 questions will be added in Pass 2 (counts × prompts ×
// visuals × distractor patterns).
//
// Difficulty mix in this slice: easy=12, medium=14, hard=4.

const _l1QuizBank = [

  // ── Block A: ten-frame, "How many dots?", counts 0–10 ──────────────────────
  _l1Q(1, {
    difficulty: 'easy',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 0 },
    answer: 0,
    choices: [
      { value: 0, correct: true },
      { value: 1,  correct: false, distractorType: 'overcounted_by_one',     errorTag: 'err_overcounted_by_one',     misconceptionExplanation: 'Student counted an empty cell as a dot.' },
      { value: 2,  correct: false, distractorType: 'overcounted_multiple',   errorTag: 'err_overcounted_multiple',   misconceptionExplanation: 'Student counted multiple empty cells as dots.' },
      { value: 10, correct: false, distractorType: 'misread_structure',      errorTag: 'err_misread_structure',      misconceptionExplanation: 'Student saw the empty grid and counted all 10 cells as dots.' }
    ],
    hint: 'No dots are filled in.',
    intervention: {
      errorTag: 'err_misread_structure',
      title: 'An empty arrangement shows 0.',
      teachingSteps: [
        'Look at each cell in the ten-frame.',
        'No cells are filled with a dot.',
        'The total count is 0.'
      ],
      correctAnswerExplanation: 'No cells are filled, so there are 0 dots.'
    }
  }),

  _l1Q(2, {
    difficulty: 'easy',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 1 },
    answer: 1,
    choices: [
      { value: 0, correct: false, distractorType: 'undercounted_by_one',  errorTag: 'err_undercounted_by_one',  misconceptionExplanation: 'Student missed the single dot and saw the frame as empty.' },
      { value: 1, correct: true },
      { value: 2, correct: false, distractorType: 'overcounted_by_one',   errorTag: 'err_overcounted_by_one',   misconceptionExplanation: 'Student counted an empty cell along with the dot.' },
      { value: 5, correct: false, distractorType: 'misread_full_row',     errorTag: 'err_misread_structure',    misconceptionExplanation: 'Student assumed the top row was full when it had only 1 dot.' }
    ],
    hint: 'Just one dot is filled.',
    intervention: {
      errorTag: 'err_undercounted_by_one',
      title: 'Touch each filled cell to count it.',
      teachingSteps: [
        'Find the dot in the ten-frame.',
        'Point to it and say one.',
        'There is 1 dot.'
      ],
      correctAnswerExplanation: 'Exactly one cell has a dot. The total is 1.'
    }
  }),

  _l1Q(3, {
    difficulty: 'easy',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 2 },
    answer: 2,
    choices: [
      { value: 1, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student counted just one of the two dots.' },
      { value: 2, correct: true },
      { value: 3, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted an extra empty cell as a dot.' },
      { value: 5, correct: false, distractorType: 'misread_full_row',    errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student assumed a full top row when only 2 cells were filled.' }
    ],
    hint: 'Two dots are filled in the top row.',
    intervention: {
      errorTag: 'err_undercounted_by_one',
      title: 'Touch each dot once.',
      teachingSteps: [
        'Point to the first dot. Say one.',
        'Point to the second dot. Say two.',
        'The total is 2.'
      ],
      correctAnswerExplanation: 'Two cells are filled. The total is 2.'
    }
  }),

  _l1Q(4, {
    difficulty: 'easy',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 3 },
    answer: 3,
    choices: [
      { value: 2, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one of the three dots.' },
      { value: 3, correct: true },
      { value: 4, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted an empty cell along with the dots.' },
      { value: 5, correct: false, distractorType: 'misread_full_row',    errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student assumed a full top row when only 3 cells were filled.' }
    ],
    hint: 'Three dots in the top row, with two cells empty.',
    intervention: {
      errorTag: 'err_overcounted_by_one',
      title: 'Count only filled cells.',
      teachingSteps: [
        'Look at the top row.',
        'Count only the cells with a dot: 1, 2, 3.',
        'The total is 3. Empty cells don\'t count.'
      ],
      correctAnswerExplanation: 'Three cells are filled. The total is 3.'
    }
  }),

  _l1Q(5, {
    difficulty: 'easy',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 4 },
    answer: 4,
    choices: [
      { value: 3, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one dot.' },
      { value: 4, correct: true },
      { value: 5, correct: false, distractorType: 'misread_full_row',    errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student assumed a full top row when one cell was empty.' },
      { value: 6, correct: false, distractorType: 'overcounted_by_two',  errorTag: 'err_overcounted_multiple', misconceptionExplanation: 'Student counted past the dots into empty cells.' }
    ],
    hint: 'Four dots, one empty cell at the end of the top row.',
    intervention: {
      errorTag: 'err_misread_structure',
      title: 'A full row has 5. This row has 4.',
      teachingSteps: [
        'Look carefully at the top row.',
        'Count just the dots: 1, 2, 3, 4.',
        'The last cell is empty. The total is 4.'
      ],
      correctAnswerExplanation: 'The top row has 4 dots, with one cell empty. The total is 4.'
    }
  }),

  _l1Q(6, {
    difficulty: 'easy',
    keyIdea: 'A full row in a ten-frame has 5.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 5 },
    answer: 5,
    choices: [
      { value: 4,  correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one dot in the full row.' },
      { value: 5,  correct: true },
      { value: 6,  correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted an empty bottom-row cell.' },
      { value: 10, correct: false, distractorType: 'misread_both_rows',   errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student saw the structure and assumed both rows were full.' }
    ],
    hint: 'The whole top row is filled.',
    intervention: {
      errorTag: 'err_undercounted_by_one',
      title: 'A full top row equals 5.',
      teachingSteps: [
        'Look at the top row.',
        'It is completely full of dots.',
        'A full row is 5. The total is 5.'
      ],
      correctAnswerExplanation: 'The top row is full, which always means 5.'
    }
  }),

  _l1Q(7, {
    difficulty: 'medium',
    keyIdea: 'When the top row is full, just count the extras below.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 6 },
    answer: 6,
    choices: [
      { value: 5, correct: false, distractorType: 'only_full_row',       errorTag: 'err_only_count_full_row',  misconceptionExplanation: 'Student counted only the full top row and missed the extras below.' },
      { value: 6, correct: true },
      { value: 7, correct: false, distractorType: 'overcounted_by_one',   errorTag: 'err_overcounted_by_one',   misconceptionExplanation: 'Student counted an empty bottom-row cell along with the filled one.' },
      { value: 1, correct: false, distractorType: 'ignore_full_row',      errorTag: 'err_ignore_full_row',      misconceptionExplanation: 'Student counted only the partial bottom row and ignored the full top row.' }
    ],
    hint: 'Top row is full. How many extras are below?',
    intervention: {
      errorTag: 'err_only_count_full_row',
      title: 'Don\'t stop at 5 — there are extras below.',
      teachingSteps: [
        'The top row is full. That is 5.',
        'Now look at the bottom row. There is 1 more dot.',
        '5 and 1 makes 6.'
      ],
      correctAnswerExplanation: 'Five in the top row plus one in the bottom row makes 6.'
    }
  }),

  _l1Q(8, {
    difficulty: 'medium',
    keyIdea: 'When the top row is full, just count the extras below.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 7 },
    answer: 7,
    choices: [
      { value: 5, correct: false, distractorType: 'only_full_row',     errorTag: 'err_only_count_full_row',  misconceptionExplanation: 'Student counted only the full top row.' },
      { value: 6, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one extra dot in the bottom row.' },
      { value: 7, correct: true },
      { value: 8, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted an empty bottom-row cell as a dot.' }
    ],
    hint: 'Use the anchor of 5, then count the extras.',
    intervention: {
      errorTag: 'err_only_count_full_row',
      title: 'Five and how many more?',
      teachingSteps: [
        'The top row is full. That is 5.',
        'Now look at the bottom row. There are 2 dots.',
        '5 and 2 makes 7.'
      ],
      correctAnswerExplanation: 'Five in the top row plus two in the bottom row makes 7.'
    }
  }),

  _l1Q(9, {
    difficulty: 'medium',
    keyIdea: 'When the top row is full, just count the extras below.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 8 },
    answer: 8,
    choices: [
      { value: 3, correct: false, distractorType: 'ignore_full_row',     errorTag: 'err_ignore_full_row',      misconceptionExplanation: 'Student counted only the bottom row\'s extras and ignored the full top row.' },
      { value: 5, correct: false, distractorType: 'only_full_row',       errorTag: 'err_only_count_full_row',  misconceptionExplanation: 'Student counted only the full top row.' },
      { value: 7, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one',  misconceptionExplanation: 'Student missed one dot in the bottom row.' },
      { value: 8, correct: true }
    ],
    hint: 'Five in the top, three more in the bottom.',
    intervention: {
      errorTag: 'err_ignore_full_row',
      title: 'Don\'t skip the full top row.',
      teachingSteps: [
        'Look at the top row first. It is full — that is 5.',
        'Look at the bottom row. There are 3 dots.',
        '5 and 3 makes 8.'
      ],
      correctAnswerExplanation: 'Five in the top row plus three in the bottom row makes 8.'
    }
  }),

  _l1Q(10, {
    difficulty: 'medium',
    keyIdea: 'When the top row is full, just count the extras below.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 9 },
    answer: 9,
    choices: [
      { value: 8,  correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one dot in the bottom row.' },
      { value: 9,  correct: true },
      { value: 10, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted the empty cell as a dot — almost saw a full ten-frame.' },
      { value: 5,  correct: false, distractorType: 'only_full_row',       errorTag: 'err_only_count_full_row', misconceptionExplanation: 'Student counted only the full top row.' }
    ],
    hint: 'Almost a full ten-frame — one cell is empty.',
    intervention: {
      errorTag: 'err_overcounted_by_one',
      title: 'Look for the empty cell.',
      teachingSteps: [
        'Look at both rows of the ten-frame.',
        'Find the one empty cell.',
        'There are 9 dots — one short of a full ten-frame.'
      ],
      correctAnswerExplanation: 'Five in the top row plus four in the bottom row makes 9. One cell is empty.'
    }
  }),

  _l1Q(11, {
    difficulty: 'easy',
    keyIdea: 'Two full rows make 10.',
    prompt: 'How many dots?',
    visual: { type: 'tenFrame', count: 10 },
    answer: 10,
    choices: [
      { value: 5,  correct: false, distractorType: 'only_full_row',       errorTag: 'err_only_count_full_row', misconceptionExplanation: 'Student counted only the top row.' },
      { value: 9,  correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one dot in the bottom row.' },
      { value: 10, correct: true },
      { value: 11, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student double-counted a dot in a full ten-frame.' }
    ],
    hint: 'Both rows are completely filled.',
    intervention: {
      errorTag: 'err_only_count_full_row',
      title: 'Two full rows make 10.',
      teachingSteps: [
        'Look at the top row. It is full — that is 5.',
        'Look at the bottom row. It is also full — 5 more.',
        '5 and 5 makes 10.'
      ],
      correctAnswerExplanation: 'Both rows are full, so the count is 10.'
    }
  }),

  // ── Block B: ten-frame, alternative prompt (count carefully phrasing) ──────
  _l1Q(12, {
    difficulty: 'medium',
    keyIdea: 'A full row in a ten-frame has 5.',
    prompt: 'Count the dots.',
    visual: { type: 'tenFrame', count: 4 },
    answer: 4,
    choices: [
      { value: 3, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one dot.' },
      { value: 4, correct: true },
      { value: 5, correct: false, distractorType: 'misread_full_row',    errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student assumed the top row was full.' },
      { value: 8, correct: false, distractorType: 'wrong_visual_count',  errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student counted both dots and empty cells together.' }
    ],
    hint: 'The top row has one empty cell at the end.',
    intervention: {
      errorTag: 'err_undercounted_by_one',
      title: 'Touch each dot as you count.',
      teachingSteps: [
        'Point to each dot one at a time.',
        'Say each number aloud: 1, 2, 3, 4.',
        'The total is 4.'
      ],
      correctAnswerExplanation: 'Four cells in the top row are filled, with one empty cell at the end.'
    }
  }),

  _l1Q(13, {
    difficulty: 'medium',
    keyIdea: 'When the top row is full, just count the extras below.',
    prompt: 'Count the dots.',
    visual: { type: 'tenFrame', count: 7 },
    answer: 7,
    choices: [
      { value: 2, correct: false, distractorType: 'ignore_full_row',     errorTag: 'err_ignore_full_row',     misconceptionExplanation: 'Student counted only the partial bottom row.' },
      { value: 5, correct: false, distractorType: 'only_full_row',       errorTag: 'err_only_count_full_row', misconceptionExplanation: 'Student counted only the full top row.' },
      { value: 7, correct: true },
      { value: 8, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted an empty bottom cell as a dot.' }
    ],
    hint: 'A full row plus a few more.',
    intervention: {
      errorTag: 'err_ignore_full_row',
      title: 'Use the full top row first.',
      teachingSteps: [
        'See the full top row — that is 5.',
        'See the 2 dots in the bottom row.',
        '5 and 2 makes 7.'
      ],
      correctAnswerExplanation: 'Five in the top row plus two more makes 7.'
    }
  }),

  _l1Q(14, {
    difficulty: 'medium',
    keyIdea: 'When the top row is full, just count the extras below.',
    prompt: 'Without counting one by one, how many dots?',
    visual: { type: 'tenFrame', count: 9 },
    answer: 9,
    choices: [
      { value: 4,  correct: false, distractorType: 'ignore_full_row',     errorTag: 'err_ignore_full_row',     misconceptionExplanation: 'Student counted only the bottom row.' },
      { value: 5,  correct: false, distractorType: 'only_full_row',       errorTag: 'err_only_count_full_row', misconceptionExplanation: 'Student counted only the full top row.' },
      { value: 9,  correct: true },
      { value: 10, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted the empty cell as a dot.' }
    ],
    hint: 'One short of a full ten-frame.',
    intervention: {
      errorTag: 'err_only_count_full_row',
      title: 'Use 10 minus 1 thinking.',
      teachingSteps: [
        'A full ten-frame is 10.',
        'This ten-frame has one empty cell.',
        '10 minus 1 is 9.'
      ],
      correctAnswerExplanation: 'A nearly-full ten-frame with one empty cell shows 9.'
    }
  }),

  // ── Block C: five-frame, counts 0–5 ────────────────────────────────────────
  _l1Q(15, {
    difficulty: 'easy',
    keyIdea: 'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt: 'How many dots in the five-frame?',
    visual: { type: 'fivFrame', count: 0 },
    answer: 0,
    choices: [
      { value: 0, correct: true },
      { value: 1, correct: false, distractorType: 'overcounted_by_one',   errorTag: 'err_overcounted_by_one',   misconceptionExplanation: 'Student counted an empty cell as a dot.' },
      { value: 2, correct: false, distractorType: 'overcounted_multiple', errorTag: 'err_overcounted_multiple', misconceptionExplanation: 'Student counted multiple empty cells.' },
      { value: 5, correct: false, distractorType: 'misread_full_row',     errorTag: 'err_misread_structure',    misconceptionExplanation: 'Student saw the empty 5-frame structure as a full row.' }
    ],
    hint: 'No cells are filled in.',
    intervention: {
      errorTag: 'err_misread_structure',
      title: 'An empty five-frame shows 0.',
      teachingSteps: [
        'A five-frame has 5 cells.',
        'No cells are filled with a dot.',
        'The total is 0.'
      ],
      correctAnswerExplanation: 'No dots are filled in the five-frame, so the count is 0.'
    }
  }),

  _l1Q(16, {
    difficulty: 'easy',
    keyIdea: 'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt: 'How many dots in the five-frame?',
    visual: { type: 'fivFrame', count: 2 },
    answer: 2,
    choices: [
      { value: 1, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student counted only one of the dots.' },
      { value: 2, correct: true },
      { value: 3, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted an empty cell along with the dots.' },
      { value: 5, correct: false, distractorType: 'misread_full_row',    errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student assumed the five-frame was full.' }
    ],
    hint: 'Two cells are filled out of five.',
    intervention: {
      errorTag: 'err_undercounted_by_one',
      title: 'Touch each filled cell once.',
      teachingSteps: [
        'Find each dot in the five-frame.',
        'Count them: 1, 2.',
        'There are 3 empty cells. The total is 2 dots.'
      ],
      correctAnswerExplanation: 'Two cells are filled in the five-frame.'
    }
  }),

  _l1Q(17, {
    difficulty: 'easy',
    keyIdea: 'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt: 'How many dots in the five-frame?',
    visual: { type: 'fivFrame', count: 3 },
    answer: 3,
    choices: [
      { value: 2, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one dot.' },
      { value: 3, correct: true },
      { value: 4, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted an empty cell.' },
      { value: 5, correct: false, distractorType: 'misread_full_row',    errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student assumed the five-frame was full.' }
    ],
    hint: 'Three cells filled, two empty.',
    intervention: {
      errorTag: 'err_misread_structure',
      title: 'A full five-frame is 5. This is less.',
      teachingSteps: [
        'Look carefully at each cell.',
        'Count only the filled cells: 1, 2, 3.',
        'Two cells are empty. The total is 3.'
      ],
      correctAnswerExplanation: 'Three of the five cells are filled. The total is 3.'
    }
  }),

  _l1Q(18, {
    difficulty: 'easy',
    keyIdea: 'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt: 'How many dots in the five-frame?',
    visual: { type: 'fivFrame', count: 4 },
    answer: 4,
    choices: [
      { value: 3, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one of the four dots.' },
      { value: 4, correct: true },
      { value: 5, correct: false, distractorType: 'misread_full_row',    errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student assumed the five-frame was full when one cell was empty.' },
      { value: 1, correct: false, distractorType: 'count_empty_cells',   errorTag: 'err_count_empty_cells',    misconceptionExplanation: 'Student counted the empty cell instead of the filled ones.' }
    ],
    hint: 'Four cells filled, one empty — almost full.',
    intervention: {
      errorTag: 'err_misread_structure',
      title: 'Four is one less than a full five-frame.',
      teachingSteps: [
        'A full five-frame is 5.',
        'This five-frame has one empty cell.',
        '5 minus 1 is 4.'
      ],
      correctAnswerExplanation: 'Four cells are filled, one is empty. The total is 4.'
    }
  }),

  _l1Q(19, {
    difficulty: 'easy',
    keyIdea: 'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt: 'How many dots in the five-frame?',
    visual: { type: 'fivFrame', count: 5 },
    answer: 5,
    choices: [
      { value: 4,  correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one dot in the full five-frame.' },
      { value: 5,  correct: true },
      { value: 6,  correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted past the five-frame.' },
      { value: 10, correct: false, distractorType: 'confuse_with_tenframe', errorTag: 'err_confuse_frame_size', misconceptionExplanation: 'Student treated the five-frame as a ten-frame.' }
    ],
    hint: 'A full five-frame.',
    intervention: {
      errorTag: 'err_confuse_frame_size',
      title: 'A full five-frame is 5, not 10.',
      teachingSteps: [
        'A five-frame has 5 cells, not 10.',
        'When all 5 cells are filled, the count is 5.',
        'A ten-frame has two rows of 5 — that\'s when it\'s 10.'
      ],
      correctAnswerExplanation: 'All 5 cells are filled in the five-frame. The total is 5.'
    }
  }),

  // ── Block D: dice patterns, faces 1–6 ──────────────────────────────────────
  _l1Q(20, {
    difficulty: 'easy',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots on the dice?',
    visual: { type: 'dicePattern', face: 1 },
    answer: 1,
    choices: [
      { value: 0, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed the single dot in the center.' },
      { value: 1, correct: true },
      { value: 2, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted the center dot twice or saw a phantom dot.' },
      { value: 4, correct: false, distractorType: 'wrong_dice_pattern',  errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student confused the dice 1 with the dice 4 corners pattern.' }
    ],
    hint: 'One dot in the middle of the dice.',
    intervention: {
      errorTag: 'err_misread_structure',
      title: 'A dice 1 has just the center dot.',
      teachingSteps: [
        'Look at the dice face.',
        'There is just one dot, right in the middle.',
        'A dice 1 shows 1 dot.'
      ],
      correctAnswerExplanation: 'The dice shows the single center dot. The total is 1.'
    }
  }),

  _l1Q(21, {
    difficulty: 'medium',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots on the dice?',
    visual: { type: 'dicePattern', face: 4 },
    answer: 4,
    choices: [
      { value: 3, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one of the corner dots.' },
      { value: 4, correct: true },
      { value: 5, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student saw a phantom center dot (mistook for dice 5).' },
      { value: 6, correct: false, distractorType: 'wrong_dice_pattern',  errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student confused the dice 4 corners pattern with dice 6.' }
    ],
    hint: 'Four dots, one in each corner.',
    intervention: {
      errorTag: 'err_overcounted_by_one',
      title: 'A dice 4 has no center dot.',
      teachingSteps: [
        'Look at each corner of the dice.',
        'Count: 1, 2, 3, 4.',
        'There is no center dot. The total is 4.'
      ],
      correctAnswerExplanation: 'Four dots in the four corners — no center dot — makes 4.'
    }
  }),

  _l1Q(22, {
    difficulty: 'medium',
    keyIdea: 'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt: 'How many dots on the dice?',
    visual: { type: 'dicePattern', face: 5 },
    answer: 5,
    choices: [
      { value: 4, correct: false, distractorType: 'miss_center_dot',     errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed the center dot of the dice 5.' },
      { value: 5, correct: true },
      { value: 6, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student saw a phantom dot.' },
      { value: 9, correct: false, distractorType: 'wrong_dice_pattern',  errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student grossly overcounted the dice pattern.' }
    ],
    hint: 'Four corners plus a center dot.',
    intervention: {
      errorTag: 'err_undercounted_by_one',
      title: 'A dice 5 has 4 corners and 1 center.',
      teachingSteps: [
        'Look at the four corners. That is 4.',
        'Look at the middle. There is 1 more dot.',
        '4 and 1 makes 5.'
      ],
      correctAnswerExplanation: 'Four corner dots plus one center dot makes 5.'
    }
  }),

  _l1Q(23, {
    difficulty: 'medium',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots on the dice?',
    visual: { type: 'dicePattern', face: 6 },
    answer: 6,
    choices: [
      { value: 5, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one dot in the dice 6 pattern.' },
      { value: 6, correct: true },
      { value: 7, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student saw a phantom dot.' },
      { value: 4, correct: false, distractorType: 'wrong_dice_pattern',  errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student saw only one of the two rows of 3.' }
    ],
    hint: 'Two rows of three dots.',
    intervention: {
      errorTag: 'err_misread_structure',
      title: 'A dice 6 is two groups of 3.',
      teachingSteps: [
        'Look at the left column. That is 3 dots.',
        'Look at the right column. That is 3 more dots.',
        '3 and 3 makes 6.'
      ],
      correctAnswerExplanation: 'Two columns of 3 dots make 6.'
    }
  }),

  _l1Q(24, {
    difficulty: 'medium',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots on the dice?',
    visual: { type: 'dicePattern', face: 2 },
    answer: 2,
    choices: [
      { value: 1, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student counted only one of the two corner dots.' },
      { value: 2, correct: true },
      { value: 3, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student saw a phantom dot in the middle.' },
      { value: 5, correct: false, distractorType: 'wrong_dice_pattern',  errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student confused the dice 2 with the dice 5 corners pattern.' }
    ],
    hint: 'Two dots in opposite corners.',
    intervention: {
      errorTag: 'err_undercounted_by_one',
      title: 'A dice 2 shows two diagonal dots.',
      teachingSteps: [
        'Look at the dice face.',
        'There is one dot in one corner and one in the opposite corner.',
        'The total is 2.'
      ],
      correctAnswerExplanation: 'Two dots placed diagonally in opposite corners makes 2.'
    }
  }),

  _l1Q(25, {
    difficulty: 'medium',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots on the dice?',
    visual: { type: 'dicePattern', face: 3 },
    answer: 3,
    choices: [
      { value: 2, correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one dot in the diagonal.' },
      { value: 3, correct: true },
      { value: 4, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student saw a phantom dot.' },
      { value: 5, correct: false, distractorType: 'wrong_dice_pattern',  errorTag: 'err_misread_structure',   misconceptionExplanation: 'Student confused dice 3 with dice 5.' }
    ],
    hint: 'Three dots in a diagonal line.',
    intervention: {
      errorTag: 'err_misread_structure',
      title: 'A dice 3 shows three dots on a diagonal.',
      teachingSteps: [
        'Look at the dice face.',
        'Three dots make a diagonal line from corner to corner.',
        'Count: 1, 2, 3.'
      ],
      correctAnswerExplanation: 'Three dots arranged diagonally make 3.'
    }
  }),

  // ── Block E: domino sums (combine two structured parts) ─ HARD ─────────────
  _l1Q(26, {
    difficulty: 'hard',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots in all?',
    visual: { type: 'domino', left: 1, right: 3 },
    answer: 4,
    choices: [
      { value: 3, correct: false, distractorType: 'count_one_side_only', errorTag: 'err_count_one_side',     misconceptionExplanation: 'Student counted only the side with 3 dots.' },
      { value: 4, correct: true },
      { value: 5, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one', misconceptionExplanation: 'Student counted an extra dot in the gap or edge.' },
      { value: 1, correct: false, distractorType: 'count_one_side_only', errorTag: 'err_count_one_side',     misconceptionExplanation: 'Student counted only the side with 1 dot.' }
    ],
    hint: 'One side has 1 dot, the other has 3.',
    intervention: {
      errorTag: 'err_count_one_side',
      title: 'A domino has TWO sides — count both.',
      teachingSteps: [
        'Look at the left side: 1 dot.',
        'Look at the right side: 3 dots.',
        '1 and 3 makes 4.'
      ],
      correctAnswerExplanation: 'One on the left plus three on the right makes 4 in all.'
    }
  }),

  _l1Q(27, {
    difficulty: 'hard',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots in all?',
    visual: { type: 'domino', left: 3, right: 4 },
    answer: 7,
    choices: [
      { value: 3, correct: false, distractorType: 'count_one_side_only', errorTag: 'err_count_one_side',      misconceptionExplanation: 'Student counted only the left side (3 dots) and stopped.' },
      { value: 4, correct: false, distractorType: 'count_one_side_only', errorTag: 'err_count_one_side',      misconceptionExplanation: 'Student counted only the right side (4 dots) and stopped.' },
      { value: 7, correct: true },
      { value: 8, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted an extra dot somewhere across the domino.' }
    ],
    hint: 'Count the dots on the left. Count the dots on the right. Put them together.',
    intervention: {
      errorTag: 'err_count_one_side',
      title: 'Count both sides to find the total.',
      teachingSteps: [
        'Look at the left side: 3 dots.',
        'Look at the right side: 4 dots.',
        '3 and 4 makes 7.'
      ],
      correctAnswerExplanation: 'Three on the left plus four on the right makes 7 in all.'
    }
  }),

  _l1Q(28, {
    difficulty: 'hard',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots in all?',
    visual: { type: 'domino', left: 4, right: 4 },
    answer: 8,
    choices: [
      { value: 4,  correct: false, distractorType: 'count_one_side_only', errorTag: 'err_count_one_side',  misconceptionExplanation: 'Student counted only one side and reported its count.' },
      { value: 7,  correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one of the dots.' },
      { value: 8,  correct: true },
      { value: 9,  correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one', misconceptionExplanation: 'Student overcounted by one dot somewhere in the (4,4) domino.' }
    ],
    hint: 'Both sides show 4 dots.',
    intervention: {
      errorTag: 'err_count_one_side',
      title: 'Doubles: when both sides match.',
      teachingSteps: [
        'The left side has 4 dots. The right side also has 4.',
        'When both sides show the same, the total is double.',
        '4 and 4 makes 8.'
      ],
      correctAnswerExplanation: 'Four on each side makes 4 + 4 = 8 in all.'
    }
  }),

  _l1Q(29, {
    difficulty: 'hard',
    keyIdea: 'Look for groups first, before you count one by one.',
    prompt: 'How many dots in all?',
    visual: { type: 'domino', left: 5, right: 5 },
    answer: 10,
    choices: [
      { value: 5,  correct: false, distractorType: 'count_one_side_only', errorTag: 'err_count_one_side',  misconceptionExplanation: 'Student counted only one side.' },
      { value: 9,  correct: false, distractorType: 'undercounted_by_one', errorTag: 'err_undercounted_by_one', misconceptionExplanation: 'Student missed one dot in the doubles.' },
      { value: 10, correct: true },
      { value: 11, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one', misconceptionExplanation: 'Student overcounted by one dot in the (5,5) domino.' }
    ],
    hint: 'Both sides show a dice 5 pattern.',
    intervention: {
      errorTag: 'err_undercounted_by_one',
      title: 'A double-five domino is 10.',
      teachingSteps: [
        'The left side has 5 dots. The right side has 5 dots.',
        '5 and 5 makes 10.',
        'A double-five domino always shows 10.'
      ],
      correctAnswerExplanation: 'Five on each side makes 5 + 5 = 10 in all.'
    }
  }),

  // ── Block F: ten-frame extra coverage at counts 6, 8, 10 with alt prompts ──
  _l1Q(30, {
    difficulty: 'medium',
    keyIdea: 'When the top row is full, just count the extras below.',
    prompt: 'Without counting one by one, how many dots?',
    visual: { type: 'tenFrame', count: 6 },
    answer: 6,
    choices: [
      { value: 1, correct: false, distractorType: 'ignore_full_row',     errorTag: 'err_ignore_full_row',     misconceptionExplanation: 'Student counted only the bottom row\'s single dot.' },
      { value: 5, correct: false, distractorType: 'only_full_row',       errorTag: 'err_only_count_full_row', misconceptionExplanation: 'Student counted only the full top row.' },
      { value: 6, correct: true },
      { value: 7, correct: false, distractorType: 'overcounted_by_one',  errorTag: 'err_overcounted_by_one',  misconceptionExplanation: 'Student counted an extra empty cell as a dot.' }
    ],
    hint: 'Use the anchor: 5 plus how many more?',
    intervention: {
      errorTag: 'err_only_count_full_row',
      title: 'Five and one more makes six.',
      teachingSteps: [
        'See the full top row — that is 5.',
        'See the 1 dot in the bottom row.',
        '5 and 1 makes 6.'
      ],
      correctAnswerExplanation: 'Five in the top row plus one in the bottom row makes 6.'
    }
  }),

  // ── Block G: tenFrame, alt prompts ── q31–q68 ──────────────────────────────

  // "Count the dots." — counts 0,1,2,3,5,6,8,9,10
  _l1Q(31, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'tenFrame',count:0}, answer:0,
    choices:[{value:0,correct:true},{value:1,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:2,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted multiple empty cells.'},{value:5,correct:false,distractorType:'misread_structure',errorTag:'err_misread_structure',misconceptionExplanation:'Saw the empty frame as a full row.'}],
    hint:'No dots are filled in.',
    intervention:{errorTag:'err_misread_structure',title:'An empty ten-frame shows 0.',teachingSteps:['Look at each cell.','No cells have a dot.','The count is 0.'],correctAnswerExplanation:'No cells are filled. The total is 0.'} }),

  _l1Q(32, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'tenFrame',count:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the single dot.'},{value:1,correct:true},{value:3,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Saw phantom extra dots.'},{value:5,correct:false,distractorType:'misread_full_row',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the row was full.'}],
    hint:'Find the one filled cell.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Touch the one dot and count it.',teachingSteps:['Find the dot in the top row.','Point and say: one.','The total is 1.'],correctAnswerExplanation:'One cell is filled. The total is 1.'} }),

  _l1Q(33, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'tenFrame',count:2}, answer:2,
    choices:[{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Counted only one of the two dots.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell as a dot.'},{value:5,correct:false,distractorType:'misread_full_row',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed a full row.'}],
    hint:'Count each filled dot, one at a time.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Touch each dot as you count.',teachingSteps:['Point to dot 1. Say: one.','Point to dot 2. Say: two.','The total is 2.'],correctAnswerExplanation:'Two cells are filled. The total is 2.'} }),

  _l1Q(34, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'tenFrame',count:3}, answer:3,
    choices:[{value:2,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:6,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Overcounted significantly.'}],
    hint:'Count only the filled cells.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Count only filled cells, not empty ones.',teachingSteps:['Look at the top row.','Count cells with a dot: 1, 2, 3.','Stop when there are no more dots.'],correctAnswerExplanation:'Three cells are filled. The total is 3.'} }),

  _l1Q(35, { difficulty:'medium', keyIdea:'A full row in a ten-frame has 5.',
    prompt:'Count the dots.', visual:{type:'tenFrame',count:5}, answer:5,
    choices:[{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot in the full row.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty bottom cell.'},{value:9,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Confused top row with a nearly-full frame.'}],
    hint:'The top row is completely full.',
    intervention:{errorTag:'err_undercounted_by_one',title:'A full top row always equals 5.',teachingSteps:['Look at the top row.','Every cell is filled.','A full row is 5.'],correctAnswerExplanation:'Five cells fill the top row. The total is 5.'} }),

  _l1Q(36, { difficulty:'medium', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'Count the dots.', visual:{type:'tenFrame',count:6}, answer:6,
    choices:[{value:2,correct:false,distractorType:'ignore_full_row',errorTag:'err_ignore_full_row',misconceptionExplanation:'Counted only the bottom row.'},{value:5,correct:false,distractorType:'only_full_row',errorTag:'err_only_count_full_row',misconceptionExplanation:'Stopped at the full top row.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty bottom cell.'}],
    hint:'Top row is full. Count the extra dot below.',
    intervention:{errorTag:'err_only_count_full_row',title:'There is one extra dot below the full row.',teachingSteps:['Top row is full — that is 5.','Look below: 1 more dot.','5 and 1 makes 6.'],correctAnswerExplanation:'Five in the top row plus one extra makes 6.'} }),

  _l1Q(37, { difficulty:'hard', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'Count the dots.', visual:{type:'tenFrame',count:8}, answer:8,
    choices:[{value:5,correct:false,distractorType:'only_full_row',errorTag:'err_only_count_full_row',misconceptionExplanation:'Counted only the full top row.'},{value:7,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot in the bottom row.'},{value:8,correct:true},{value:9,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'}],
    hint:'Full top row plus three dots below.',
    intervention:{errorTag:'err_only_count_full_row',title:'Count the extras in the bottom row too.',teachingSteps:['Top row full = 5.','Bottom row has 3 dots.','5 and 3 makes 8.'],correctAnswerExplanation:'Five plus three more equals 8.'} }),

  _l1Q(38, { difficulty:'hard', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'Count the dots.', visual:{type:'tenFrame',count:9}, answer:9,
    choices:[{value:6,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed several dots.'},{value:8,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one bottom-row dot.'},{value:9,correct:true},{value:10,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted the empty cell as a dot.'}],
    hint:'One cell is empty — almost a full frame.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Find the empty cell — it does not count.',teachingSteps:['Look for the one empty cell.','Only filled cells count.','9 cells are filled.'],correctAnswerExplanation:'Nine cells filled, one empty. The total is 9.'} }),

  _l1Q(39, { difficulty:'hard', keyIdea:'Two full rows make 10.',
    prompt:'Count the dots.', visual:{type:'tenFrame',count:10}, answer:10,
    choices:[{value:7,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Miscounted significantly.'},{value:9,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:10,correct:true},{value:11,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted a phantom dot.'}],
    hint:'Both rows are completely full.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Two full rows always make 10.',teachingSteps:['Top row is full: 5.','Bottom row is also full: 5 more.','5 and 5 makes 10.'],correctAnswerExplanation:'Both rows are full. The total is 10.'} }),

  // "Without counting one by one, how many dots?" — counts 0,1,2,3,4,5,7,8,10
  _l1Q(40, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting one by one, how many dots?', visual:{type:'tenFrame',count:0}, answer:0,
    choices:[{value:0,correct:true},{value:1,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:2,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted multiple empty cells.'},{value:5,correct:false,distractorType:'misread_structure',errorTag:'err_misread_structure',misconceptionExplanation:'Thought an empty row showed 5.'}],
    hint:'No dots are filled in at all.',
    intervention:{errorTag:'err_misread_structure',title:'An empty frame has 0 dots.',teachingSteps:['Look at the frame.','No cells are filled.','The count is 0.'],correctAnswerExplanation:'No dots are filled. The total is 0.'} }),

  _l1Q(41, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting one by one, how many dots?', visual:{type:'tenFrame',count:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Saw the frame as empty.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom second dot.'},{value:4,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Confused with a dice 4 pattern.'}],
    hint:'Only one dot is filled.',
    intervention:{errorTag:'err_undercounted_by_one',title:'See the one dot and say one.',teachingSteps:['Find the single dot.','It is one filled cell.','The total is 1.'],correctAnswerExplanation:'One cell is filled. The total is 1.'} }),

  _l1Q(42, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting one by one, how many dots?', visual:{type:'tenFrame',count:2}, answer:2,
    choices:[{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Only saw one dot.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell as a dot.'},{value:5,correct:false,distractorType:'misread_full_row',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed a full row.'}],
    hint:'Two dots at the start of the top row.',
    intervention:{errorTag:'err_undercounted_by_one',title:'See both dots at once.',teachingSteps:['Look at the start of the top row.','Two cells are filled.','Without counting: that is 2.'],correctAnswerExplanation:'Two dots fill the first two cells. The total is 2.'} }),

  _l1Q(43, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting one by one, how many dots?', visual:{type:'tenFrame',count:3}, answer:3,
    choices:[{value:2,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:5,correct:false,distractorType:'misread_full_row',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the row was full.'}],
    hint:'Three filled cells in the top row.',
    intervention:{errorTag:'err_misread_structure',title:'Three dots — not a full row.',teachingSteps:['A full row is 5.','Count the dots: 1, 2, 3.','Two cells are still empty.'],correctAnswerExplanation:'Three cells are filled. The total is 3.'} }),

  _l1Q(44, { difficulty:'medium', keyIdea:'A full row in a ten-frame has 5.',
    prompt:'Without counting one by one, how many dots?', visual:{type:'tenFrame',count:4}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:4,correct:true},{value:5,correct:false,distractorType:'misread_full_row',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the top row was full.'},{value:7,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Overcounted significantly.'}],
    hint:'Four dots — one cell is still empty at the end.',
    intervention:{errorTag:'err_misread_structure',title:'Four is one less than a full row.',teachingSteps:['A full top row is 5.','This top row has one empty cell.','4 cells are filled.'],correctAnswerExplanation:'The top row has 4 dots with one empty cell. The total is 4.'} }),

  _l1Q(45, { difficulty:'medium', keyIdea:'A full row in a ten-frame has 5.',
    prompt:'Without counting one by one, how many dots?', visual:{type:'tenFrame',count:5}, answer:5,
    choices:[{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot in the full row.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty bottom cell.'},{value:8,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Miscounted the full row.'}],
    hint:'Recognize a full top row right away.',
    intervention:{errorTag:'err_undercounted_by_one',title:'A full row without counting is 5.',teachingSteps:['See the full top row.','Recognize it instantly as 5.','No need to count one by one.'],correctAnswerExplanation:'A full top row is always 5.'} }),

  _l1Q(46, { difficulty:'hard', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'Without counting one by one, how many dots?', visual:{type:'tenFrame',count:7}, answer:7,
    choices:[{value:5,correct:false,distractorType:'only_full_row',errorTag:'err_only_count_full_row',misconceptionExplanation:'Counted only the full top row.'},{value:6,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one extra dot below.'},{value:7,correct:true},{value:9,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted the bottom row.'}],
    hint:'Top row full = 5. Count the extras without touching each one.',
    intervention:{errorTag:'err_only_count_full_row',title:'See 5, then see the extras.',teachingSteps:['See the full row — that is 5.','See 2 more dots below.','5 and 2 is 7.'],correctAnswerExplanation:'Five plus two extras makes 7.'} }),

  _l1Q(47, { difficulty:'hard', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'Without counting one by one, how many dots?', visual:{type:'tenFrame',count:8}, answer:8,
    choices:[{value:3,correct:false,distractorType:'ignore_full_row',errorTag:'err_ignore_full_row',misconceptionExplanation:'Counted only the bottom row.'},{value:5,correct:false,distractorType:'only_full_row',errorTag:'err_only_count_full_row',misconceptionExplanation:'Stopped at the full top row.'},{value:8,correct:true},{value:9,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'}],
    hint:'Think: 5 in the top, how many below?',
    intervention:{errorTag:'err_ignore_full_row',title:'Always start from the full top row.',teachingSteps:['Top row full = 5. Start there.','Count the bottom row: 3.','5 and 3 makes 8.'],correctAnswerExplanation:'Five plus three more equals 8.'} }),

  _l1Q(48, { difficulty:'hard', keyIdea:'Two full rows make 10.',
    prompt:'Without counting one by one, how many dots?', visual:{type:'tenFrame',count:10}, answer:10,
    choices:[{value:8,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Miscounted the two full rows.'},{value:9,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:10,correct:true},{value:11,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Double-counted one dot.'}],
    hint:'Two full rows — recognize 10 without counting.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Two full rows = 10. Always.',teachingSteps:['Both rows are full.','5 and 5 makes 10.','No need to count one by one.'],correctAnswerExplanation:'Both rows full means the total is always 10.'} }),

  // "How many filled cells?" — counts 0–10
  _l1Q(49, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:0}, answer:0,
    choices:[{value:0,correct:true},{value:1,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell as filled.'},{value:3,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted several empty cells as filled.'},{value:5,correct:false,distractorType:'misread_structure',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed a full row.'}],
    hint:'No cells have a dot.',
    intervention:{errorTag:'err_misread_structure',title:'Filled means a cell has a dot in it.',teachingSteps:['Look for cells with a dot inside.','No cells have a dot.','The number of filled cells is 0.'],correctAnswerExplanation:'No cells are filled. The total is 0.'} }),

  _l1Q(50, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the single filled cell.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell as filled.'},{value:10,correct:false,distractorType:'misread_structure',errorTag:'err_misread_structure',misconceptionExplanation:'Counted all cells (filled and empty).'}],
    hint:'Just one cell has a dot.',
    intervention:{errorTag:'err_misread_structure',title:'Count only the cells that have a dot.',teachingSteps:['Find each cell with a dot.','Only one cell has a dot.','The answer is 1.'],correctAnswerExplanation:'One cell has a dot. The total filled cells is 1.'} }),

  _l1Q(51, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:2}, answer:2,
    choices:[{value:0,correct:false,distractorType:'count_empty_cells',errorTag:'err_count_empty_cells',misconceptionExplanation:'Counted only empty cells.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:5,correct:false,distractorType:'misread_full_row',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed a full row.'}],
    hint:'Look for two cells with dots in them.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Only dots count as filled.',teachingSteps:['Touch each cell with a dot.','Count: 1, 2.','Empty cells do not count.'],correctAnswerExplanation:'Two cells have dots. The total filled cells is 2.'} }),

  _l1Q(52, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:3}, answer:3,
    choices:[{value:2,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:7,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Counted all cells rather than filled ones.'}],
    hint:'Three cells have dots.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Count only the cells that have dots.',teachingSteps:['Find the cells with dots.','Count: 1, 2, 3.','Empty cells — skip them.'],correctAnswerExplanation:'Three cells are filled. The total is 3.'} }),

  _l1Q(53, { difficulty:'easy', keyIdea:'A full row in a ten-frame has 5.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:4}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:4,correct:true},{value:6,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted two empty cells.'},{value:8,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Miscounted badly.'}],
    hint:'Four of the five top-row cells have dots.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Four cells are filled.',teachingSteps:['Count the top row cells that have a dot.','1, 2, 3, 4.','The last cell is empty.'],correctAnswerExplanation:'Four cells have dots. The total is 4.'} }),

  _l1Q(54, { difficulty:'medium', keyIdea:'A full row in a ten-frame has 5.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:5}, answer:5,
    choices:[{value:0,correct:false,distractorType:'count_empty_cells',errorTag:'err_count_empty_cells',misconceptionExplanation:'Counted the empty bottom-row cells instead of filled top-row cells.'},{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty bottom cell.'}],
    hint:'All 5 cells in the top row are filled.',
    intervention:{errorTag:'err_count_empty_cells',title:'Filled means it has a dot.',teachingSteps:['The top row has 5 cells — all filled.','The bottom row has 5 cells — all empty.','Count only filled ones: 5.'],correctAnswerExplanation:'Five cells in the top row are filled. The total is 5.'} }),

  _l1Q(55, { difficulty:'medium', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:6}, answer:6,
    choices:[{value:3,correct:false,distractorType:'ignore_full_row',errorTag:'err_ignore_full_row',misconceptionExplanation:'Counted only part of the frame.'},{value:5,correct:false,distractorType:'only_full_row',errorTag:'err_only_count_full_row',misconceptionExplanation:'Counted only the full top row.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'}],
    hint:'Count all cells that have a dot — top and bottom rows.',
    intervention:{errorTag:'err_only_count_full_row',title:'Count filled cells from both rows.',teachingSteps:['Top row: 5 filled cells.','Bottom row: 1 filled cell.','5 and 1 is 6 filled cells.'],correctAnswerExplanation:'Six cells in total have dots: 5 on top plus 1 below.'} }),

  _l1Q(56, { difficulty:'medium', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:7}, answer:7,
    choices:[{value:2,correct:false,distractorType:'ignore_full_row',errorTag:'err_ignore_full_row',misconceptionExplanation:'Counted only the partial bottom row.'},{value:5,correct:false,distractorType:'only_full_row',errorTag:'err_only_count_full_row',misconceptionExplanation:'Stopped at the full top row.'},{value:7,correct:true},{value:8,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted one empty cell.'}],
    hint:'Seven cells have dots — five on top, two below.',
    intervention:{errorTag:'err_ignore_full_row',title:'Don\'t ignore the full top row.',teachingSteps:['Top row: all 5 cells are filled.','Bottom row: 2 cells are filled.','5 + 2 = 7 filled cells.'],correctAnswerExplanation:'Five in the top row and two in the bottom row makes 7.'} }),

  _l1Q(57, { difficulty:'hard', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:8}, answer:8,
    choices:[{value:4,correct:false,distractorType:'ignore_full_row',errorTag:'err_ignore_full_row',misconceptionExplanation:'Ignored the full row and miscounted the bottom.'},{value:6,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Undercounted significantly.'},{value:8,correct:true},{value:9,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted one empty cell as filled.'}],
    hint:'Eight cells have dots in them.',
    intervention:{errorTag:'err_ignore_full_row',title:'All top-row cells are filled — count them too.',teachingSteps:['Top row: 5 filled cells.','Bottom row: 3 filled cells.','5 + 3 = 8 filled cells.'],correctAnswerExplanation:'Five plus three filled cells makes 8 in total.'} }),

  _l1Q(58, { difficulty:'hard', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:9}, answer:9,
    choices:[{value:4,correct:false,distractorType:'ignore_full_row',errorTag:'err_ignore_full_row',misconceptionExplanation:'Counted only the bottom row.'},{value:7,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Miscounted.'},{value:9,correct:true},{value:10,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted the empty cell as filled.'}],
    hint:'Nine out of ten cells have dots.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Look for the empty cell — it is not filled.',teachingSteps:['Find the one empty cell.','All other 9 cells are filled.','The answer is 9, not 10.'],correctAnswerExplanation:'Nine cells are filled; one is empty. The total is 9.'} }),

  _l1Q(59, { difficulty:'hard', keyIdea:'Two full rows make 10.',
    prompt:'How many filled cells?', visual:{type:'tenFrame',count:10}, answer:10,
    choices:[{value:5,correct:false,distractorType:'only_full_row',errorTag:'err_only_count_full_row',misconceptionExplanation:'Counted only one of the two rows.'},{value:8,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Miscounted the full frame.'},{value:10,correct:true},{value:11,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Double-counted one cell.'}],
    hint:'Count all the dots — every cell is filled.',
    intervention:{errorTag:'err_only_count_full_row',title:'Both rows are fully filled — count them both.',teachingSteps:['Top row: 5 filled cells.','Bottom row: 5 filled cells.','5 + 5 = 10 filled cells.'],correctAnswerExplanation:'Every cell in both rows is filled. The total is 10.'} }),

  // "How many dots are shown?" — counts 1–9
  _l1Q(60, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots are shown?', visual:{type:'tenFrame',count:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Saw the frame as empty.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom second dot.'},{value:3,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Overcounted.'}],
    hint:'This ten-frame shows only 1 dot.',
    intervention:{errorTag:'err_undercounted_by_one',title:'One cell is filled — that shows 1.',teachingSteps:['Look at the frame.','One cell has a dot.','The ten-frame shows 1.'],correctAnswerExplanation:'One dot is shown. The total is 1.'} }),

  _l1Q(61, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots are shown?', visual:{type:'tenFrame',count:2}, answer:2,
    choices:[{value:0,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed both dots.'},{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Saw only one of the two dots.'},{value:2,correct:true},{value:4,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted empty cells along with dots.'}],
    hint:'Two dots are shown in this ten-frame.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count each dot shown.',teachingSteps:['Find the first dot: 1.','Find the second dot: 2.','Two dots are shown.'],correctAnswerExplanation:'Two dots are shown. The total is 2.'} }),

  _l1Q(62, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots are shown?', visual:{type:'tenFrame',count:3}, answer:3,
    choices:[{value:1,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Only saw one dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:6,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Overcounted significantly.'}],
    hint:'Three dots are shown in the top row.',
    intervention:{errorTag:'err_misread_structure',title:'Count only the dots shown.',teachingSteps:['Look at the top row.','Count: 1, 2, 3.','No dots below. The total is 3.'],correctAnswerExplanation:'Three dots are shown. The total is 3.'} }),

  _l1Q(63, { difficulty:'easy', keyIdea:'A full row in a ten-frame has 5.',
    prompt:'How many dots are shown?', visual:{type:'tenFrame',count:4}, answer:4,
    choices:[{value:2,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Significantly undercounted.'},{value:4,correct:true},{value:5,correct:false,distractorType:'misread_full_row',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the row was full.'},{value:7,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Overcounted badly.'}],
    hint:'This shows 4 dots — one cell is empty.',
    intervention:{errorTag:'err_misread_structure',title:'This is 4, not 5 — one cell is empty.',teachingSteps:['Look at the top row.','Count: 1, 2, 3, 4.','The last cell has no dot.'],correctAnswerExplanation:'Four dots are shown. The total is 4.'} }),

  _l1Q(64, { difficulty:'medium', keyIdea:'A full row in a ten-frame has 5.',
    prompt:'How many dots are shown?', visual:{type:'tenFrame',count:5}, answer:5,
    choices:[{value:3,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:5,correct:true},{value:8,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Counted empty cells too.'}],
    hint:'A full top row shows 5.',
    intervention:{errorTag:'err_undercounted_by_one',title:'A full row shows 5.',teachingSteps:['Look at the top row.','Every cell is filled.','A full row shows 5.'],correctAnswerExplanation:'Five dots fill the top row. The total is 5.'} }),

  _l1Q(65, { difficulty:'medium', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'How many dots are shown?', visual:{type:'tenFrame',count:6}, answer:6,
    choices:[{value:4,correct:false,distractorType:'ignore_full_row',errorTag:'err_ignore_full_row',misconceptionExplanation:'Counted only some of the dots.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:9,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Overcounted greatly.'}],
    hint:'Five on top, one below — that is what is shown.',
    intervention:{errorTag:'err_ignore_full_row',title:'All dots count — top and bottom.',teachingSteps:['Top row shows 5.','Bottom row shows 1 more.','Together: 6 dots are shown.'],correctAnswerExplanation:'Six dots are shown: 5 on top and 1 below.'} }),

  _l1Q(66, { difficulty:'medium', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'How many dots are shown?', visual:{type:'tenFrame',count:7}, answer:7,
    choices:[{value:4,correct:false,distractorType:'ignore_full_row',errorTag:'err_ignore_full_row',misconceptionExplanation:'Miscounted across both rows.'},{value:6,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot below.'},{value:7,correct:true},{value:10,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed both rows were full.'}],
    hint:'This shows 7: five on top, two below.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all the extras below.',teachingSteps:['See the full top row: 5.','See the bottom row: 2 dots.','5 and 2 makes 7.'],correctAnswerExplanation:'Seven dots are shown: 5 on top and 2 below.'} }),

  _l1Q(67, { difficulty:'hard', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'How many dots are shown?', visual:{type:'tenFrame',count:8}, answer:8,
    choices:[{value:5,correct:false,distractorType:'only_full_row',errorTag:'err_only_count_full_row',misconceptionExplanation:'Counted only the full top row.'},{value:7,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot below.'},{value:8,correct:true},{value:10,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed both rows were full.'}],
    hint:'This shows 8: top row full, three below.',
    intervention:{errorTag:'err_only_count_full_row',title:'Look at the bottom row too.',teachingSteps:['Top row is full: 5.','Bottom row: 3 dots.','5 + 3 = 8 shown.'],correctAnswerExplanation:'Eight dots are shown: 5 on top and 3 below.'} }),

  _l1Q(68, { difficulty:'hard', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'How many dots are shown?', visual:{type:'tenFrame',count:9}, answer:9,
    choices:[{value:7,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:8,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:9,correct:true},{value:11,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted.'}],
    hint:'This shows 9: almost a full ten-frame.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Nine dots shown, one cell empty.',teachingSteps:['Top row: 5. Bottom row: 4.','5 + 4 = 9.','One cell is empty.'],correctAnswerExplanation:'Nine dots are shown. One cell is empty. The total is 9.'} }),

  // ── Block H: fivFrame, complete coverage ── q69–q84 ───────────────────────

  // "How many dots in the five-frame?" — count 1 (missing from Block C)
  _l1Q(69, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'How many dots in the five-frame?', visual:{type:'fivFrame',count:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Saw the five-frame as empty.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:3,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Overcounted the five-frame.'}],
    hint:'Only one cell is filled in the five-frame.',
    intervention:{errorTag:'err_undercounted_by_one',title:'One cell in the five-frame has a dot.',teachingSteps:['Look at the five-frame.','Find the cell with a dot.','The total is 1.'],correctAnswerExplanation:'One cell is filled. The total is 1.'} }),

  // "Count the dots." — fivFrame counts 0–5
  _l1Q(70, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'Count the dots.', visual:{type:'fivFrame',count:0}, answer:0,
    choices:[{value:0,correct:true},{value:1,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell as a dot.'},{value:2,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted multiple empty cells.'},{value:4,correct:false,distractorType:'misread_structure',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the frame was almost full.'}],
    hint:'No cells are filled.',
    intervention:{errorTag:'err_misread_structure',title:'An empty five-frame shows 0.',teachingSteps:['Look at each of the 5 cells.','No cells have a dot.','The count is 0.'],correctAnswerExplanation:'No cells are filled. The total is 0.'} }),

  _l1Q(71, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'Count the dots.', visual:{type:'fivFrame',count:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the single dot.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell as a dot.'},{value:3,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted past the one dot into empty cells.'}],
    hint:'Find the one filled cell.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Touch the dot and count it.',teachingSteps:['Find the dot in the five-frame.','Say: one.','The total is 1.'],correctAnswerExplanation:'One cell is filled. The total is 1.'} }),

  _l1Q(72, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'Count the dots.', visual:{type:'fivFrame',count:2}, answer:2,
    choices:[{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Counted only one dot.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:4,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted two extra empty cells as dots.'}],
    hint:'Two cells are filled.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Touch each dot once.',teachingSteps:['Find dot 1. Say: one.','Find dot 2. Say: two.','The total is 2.'],correctAnswerExplanation:'Two cells are filled. The total is 2.'} }),

  _l1Q(73, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'Count the dots.', visual:{type:'fivFrame',count:3}, answer:3,
    choices:[{value:2,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:5,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the frame was full.'}],
    hint:'Three cells have dots, two are empty.',
    intervention:{errorTag:'err_misread_structure',title:'Three is not a full five-frame.',teachingSteps:['Count the filled cells: 1, 2, 3.','Two cells are still empty.','The total is 3.'],correctAnswerExplanation:'Three of the five cells are filled. The total is 3.'} }),

  _l1Q(74, { difficulty:'medium', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'Count the dots.', visual:{type:'fivFrame',count:4}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:4,correct:true},{value:5,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the frame was full.'},{value:0,correct:false,distractorType:'count_empty_cells',errorTag:'err_count_empty_cells',misconceptionExplanation:'Counted empty cells only.'}],
    hint:'Four cells filled, one empty — almost full.',
    intervention:{errorTag:'err_misread_structure',title:'Four is almost a full five-frame.',teachingSteps:['A full five-frame is 5.','This frame has one empty cell.','4 cells are filled.'],correctAnswerExplanation:'Four cells are filled, one is empty. The total is 4.'} }),

  _l1Q(75, { difficulty:'medium', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'Count the dots.', visual:{type:'fivFrame',count:5}, answer:5,
    choices:[{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted past the five-frame.'},{value:0,correct:false,distractorType:'count_empty_cells',errorTag:'err_count_empty_cells',misconceptionExplanation:'Counted empty cells.'}],
    hint:'All five cells are filled.',
    intervention:{errorTag:'err_undercounted_by_one',title:'A full five-frame is 5.',teachingSteps:['A five-frame has 5 cells.','All cells are filled.','The total is 5.'],correctAnswerExplanation:'All 5 cells are filled. The total is 5.'} }),

  // "How many filled cells in the five-frame?" — counts 0–5
  _l1Q(76, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'How many filled cells in the five-frame?', visual:{type:'fivFrame',count:0}, answer:0,
    choices:[{value:0,correct:true},{value:1,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell as filled.'},{value:2,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted multiple empty cells.'},{value:5,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Thought all 5 cells were filled.'}],
    hint:'No cells have a dot.',
    intervention:{errorTag:'err_misread_structure',title:'Filled means a cell has a dot.',teachingSteps:['Look at each cell.','No cells have a dot.','The number of filled cells is 0.'],correctAnswerExplanation:'No cells are filled. The total is 0.'} }),

  _l1Q(77, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'How many filled cells in the five-frame?', visual:{type:'fivFrame',count:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the single filled cell.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:4,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Counted the empty cells instead.'}],
    hint:'Only one cell has a dot.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Find the one filled cell.',teachingSteps:['Look for cells with dots.','One cell has a dot.','The filled count is 1.'],correctAnswerExplanation:'One cell is filled. The total is 1.'} }),

  _l1Q(78, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'How many filled cells in the five-frame?', visual:{type:'fivFrame',count:2}, answer:2,
    choices:[{value:0,correct:false,distractorType:'count_empty_cells',errorTag:'err_count_empty_cells',misconceptionExplanation:'Counted only empty cells.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:5,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the frame was full.'}],
    hint:'Two of the five cells have dots.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Count only cells that have dots.',teachingSteps:['Touch cells with dots.','Count: 1, 2.','Empty cells — skip them.'],correctAnswerExplanation:'Two cells are filled. The total is 2.'} }),

  _l1Q(79, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'How many filled cells in the five-frame?', visual:{type:'fivFrame',count:3}, answer:3,
    choices:[{value:1,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Significantly undercounted.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:5,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the frame was full.'}],
    hint:'Three cells have dots, two are empty.',
    intervention:{errorTag:'err_misread_structure',title:'Three filled, two empty.',teachingSteps:['Count cells with dots: 1, 2, 3.','Two cells are empty.','The total filled is 3.'],correctAnswerExplanation:'Three cells have dots. The total is 3.'} }),

  _l1Q(80, { difficulty:'medium', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'How many filled cells in the five-frame?', visual:{type:'fivFrame',count:4}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:4,correct:true},{value:5,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the frame was full.'},{value:2,correct:false,distractorType:'count_empty_cells',errorTag:'err_count_empty_cells',misconceptionExplanation:'Counted empty cells.'}],
    hint:'Four cells filled, one empty.',
    intervention:{errorTag:'err_misread_structure',title:'One cell is still empty.',teachingSteps:['Count cells with dots: 1, 2, 3, 4.','One cell has no dot.','Four cells are filled.'],correctAnswerExplanation:'Four cells are filled. One cell is empty. The total is 4.'} }),

  _l1Q(81, { difficulty:'medium', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'How many filled cells in the five-frame?', visual:{type:'fivFrame',count:5}, answer:5,
    choices:[{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted past the frame.'},{value:2,correct:false,distractorType:'count_empty_cells',errorTag:'err_count_empty_cells',misconceptionExplanation:'Counted empty cells instead.'}],
    hint:'All 5 cells are filled.',
    intervention:{errorTag:'err_undercounted_by_one',title:'All five cells are filled.',teachingSteps:['Count all five cells.','Every cell has a dot.','The total is 5.'],correctAnswerExplanation:'All five cells are filled. The total is 5.'} }),

  // "What number does this five-frame show?" — counts 1, 3, 5
  _l1Q(82, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'What number does this five-frame show?', visual:{type:'fivFrame',count:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Saw the frame as empty.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom dot.'},{value:3,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Overcounted.'}],
    hint:'Count the filled cells to find the number.',
    intervention:{errorTag:'err_undercounted_by_one',title:'One filled cell shows the number 1.',teachingSteps:['Count filled cells.','One cell has a dot.','This five-frame shows 1.'],correctAnswerExplanation:'One cell is filled. The five-frame shows 1.'} }),

  _l1Q(83, { difficulty:'medium', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'What number does this five-frame show?', visual:{type:'fivFrame',count:3}, answer:3,
    choices:[{value:2,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:5,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the frame was full.'}],
    hint:'Count the filled cells to find the number.',
    intervention:{errorTag:'err_misread_structure',title:'Three filled cells shows the number 3.',teachingSteps:['Count filled cells: 1, 2, 3.','Two cells are empty.','This five-frame shows 3.'],correctAnswerExplanation:'Three cells are filled. The five-frame shows 3.'} }),

  _l1Q(84, { difficulty:'medium', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'What number does this five-frame show?', visual:{type:'fivFrame',count:5}, answer:5,
    choices:[{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted past the frame.'},{value:2,correct:false,distractorType:'count_empty_cells',errorTag:'err_count_empty_cells',misconceptionExplanation:'Counted empty cells.'}],
    hint:'A full five-frame shows 5.',
    intervention:{errorTag:'err_undercounted_by_one',title:'All five cells are filled — this shows 5.',teachingSteps:['Count all filled cells.','Every cell has a dot.','A full five-frame shows 5.'],correctAnswerExplanation:'All five cells are filled. The five-frame shows 5.'} }),

  // ── Block I: dicePattern, alt prompts ── q85–q98 ──────────────────────────

  // "Count the dots on this dice." — faces 1–6
  _l1Q(85, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots on this dice.', visual:{type:'dicePattern',face:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the single center dot.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom second dot.'},{value:5,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused dice 1 with a different face.'}],
    hint:'One dot in the middle of the dice.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count the one dot in the center.',teachingSteps:['Look at the dice face.','There is one dot in the center.','The count is 1.'],correctAnswerExplanation:'One dot is on this dice face. The total is 1.'} }),

  _l1Q(86, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots on this dice.', visual:{type:'dicePattern',face:2}, answer:2,
    choices:[{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Counted only one of the two diagonal dots.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom third dot.'},{value:4,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused dice 2 with the four corners of dice 4.'}],
    hint:'Two dots placed diagonally.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count both diagonal dots.',teachingSteps:['Find the first dot in one corner.','Find the second dot in the opposite corner.','The total is 2.'],correctAnswerExplanation:'Two diagonal dots make 2.'} }),

  _l1Q(87, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots on this dice.', visual:{type:'dicePattern',face:3}, answer:3,
    choices:[{value:2,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot in the diagonal.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom fourth dot.'},{value:6,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused dice 3 with dice 6.'}],
    hint:'Three dots in a diagonal line.',
    intervention:{errorTag:'err_misread_structure',title:'Three dots on a diagonal.',teachingSteps:['Look at the diagonal line of dots.','Count: 1, 2, 3.','The total is 3.'],correctAnswerExplanation:'Three dots arranged diagonally make 3.'} }),

  _l1Q(88, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots on this dice.', visual:{type:'dicePattern',face:4}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one corner dot.'},{value:4,correct:true},{value:5,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Added a phantom center dot (mistook for dice 5).'},{value:2,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Only saw one side of the dice 4 pattern.'}],
    hint:'Four dots, one in each corner.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Dice 4 has no center dot.',teachingSteps:['Count each corner: 1, 2, 3, 4.','There is no dot in the middle.','The total is 4.'],correctAnswerExplanation:'Four corner dots with no center dot makes 4.'} }),

  _l1Q(89, { difficulty:'medium', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'Count the dots on this dice.', visual:{type:'dicePattern',face:5}, answer:5,
    choices:[{value:4,correct:false,distractorType:'miss_center_dot',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the center dot.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom dot.'},{value:3,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Counted only part of the dice 5 pattern.'}],
    hint:'Four corners plus a center dot.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count the center dot too.',teachingSteps:['Four corner dots: 1, 2, 3, 4.','One center dot: 5.','The total is 5.'],correctAnswerExplanation:'Four corners plus one center dot makes 5.'} }),

  _l1Q(90, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots on this dice.', visual:{type:'dicePattern',face:6}, answer:6,
    choices:[{value:5,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom dot.'},{value:3,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Saw only one column.'}],
    hint:'Two columns of three dots each.',
    intervention:{errorTag:'err_misread_structure',title:'Two groups of 3 make 6.',teachingSteps:['Left column: 3 dots.','Right column: 3 more dots.','3 and 3 makes 6.'],correctAnswerExplanation:'Two columns of 3 dots each makes 6.'} }),

  // "What number does this dice show?" — faces 1–6
  _l1Q(91, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'What number does this dice show?', visual:{type:'dicePattern',face:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Saw the dice as empty.'},{value:1,correct:true},{value:3,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused with a different dice pattern.'},{value:6,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count the dots to find the number.',
    intervention:{errorTag:'err_misread_structure',title:'Count the dots to know the number.',teachingSteps:['Count each dot on the dice.','There is 1 dot.','This dice shows 1.'],correctAnswerExplanation:'One dot means this dice shows 1.'} }),

  _l1Q(92, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'What number does this dice show?', visual:{type:'dicePattern',face:2}, answer:2,
    choices:[{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Only saw one dot.'},{value:2,correct:true},{value:4,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused the two-dot diagonal with dice 4.'},{value:6,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count the dots — how many are there?',
    intervention:{errorTag:'err_misread_structure',title:'Two dots on a diagonal shows 2.',teachingSteps:['Count the dots: 1, 2.','There are 2 dots.','This dice shows 2.'],correctAnswerExplanation:'Two dots means this dice shows 2.'} }),

  _l1Q(93, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'What number does this dice show?', visual:{type:'dicePattern',face:3}, answer:3,
    choices:[{value:1,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Saw only the center dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Added a phantom corner dot.'},{value:6,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Doubled the count incorrectly.'}],
    hint:'A diagonal line of dots.',
    intervention:{errorTag:'err_misread_structure',title:'Count the dots on the diagonal.',teachingSteps:['Find the diagonal line.','Count: 1, 2, 3.','This dice shows 3.'],correctAnswerExplanation:'Three dots on a diagonal means this dice shows 3.'} }),

  _l1Q(94, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'What number does this dice show?', visual:{type:'dicePattern',face:4}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one corner dot.'},{value:4,correct:true},{value:5,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Added a phantom center dot.'},{value:1,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Saw only the center area.'}],
    hint:'Four dots, one in each corner.',
    intervention:{errorTag:'err_misread_structure',title:'Count all four corners.',teachingSteps:['Look at each corner: 1, 2, 3, 4.','No dot in the center.','This dice shows 4.'],correctAnswerExplanation:'Four corner dots — this dice shows 4.'} }),

  _l1Q(95, { difficulty:'hard', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'What number does this dice show?', visual:{type:'dicePattern',face:5}, answer:5,
    choices:[{value:3,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Only counted the corners, missed the center.'},{value:4,correct:false,distractorType:'miss_center_dot',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the center dot.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Added a phantom dot.'}],
    hint:'Four corners and one center dot.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Don\'t miss the center dot.',teachingSteps:['Count the four corners: 4.','Count the center dot: +1.','This dice shows 5.'],correctAnswerExplanation:'Four corners plus the center dot makes 5.'} }),

  _l1Q(96, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'What number does this dice show?', visual:{type:'dicePattern',face:6}, answer:6,
    choices:[{value:5,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom dot.'},{value:4,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Only saw one column of dots.'}],
    hint:'Two rows of three.',
    intervention:{errorTag:'err_misread_structure',title:'Two groups of 3.',teachingSteps:['Count the left column: 3.','Count the right column: 3.','3 + 3 = 6. This dice shows 6.'],correctAnswerExplanation:'Six dots total — this dice shows 6.'} }),

  // "Without counting, how many dots on the dice?" — faces 2, 4 (extra coverage)
  _l1Q(97, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting, how many dots on the dice?', visual:{type:'dicePattern',face:2}, answer:2,
    choices:[{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Only saw one of the diagonal dots.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom center dot.'},{value:5,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused with dice 5 corner pattern.'}],
    hint:'See the two diagonal dots as a pair.',
    intervention:{errorTag:'err_undercounted_by_one',title:'See both dots at once.',teachingSteps:['Two dots on a diagonal.','Recognize them as a pair.','Without counting: that is 2.'],correctAnswerExplanation:'Two diagonal dots — the dice shows 2.'} }),

  _l1Q(98, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting, how many dots on the dice?', visual:{type:'dicePattern',face:4}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one corner dot.'},{value:4,correct:true},{value:5,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom center dot.'},{value:6,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused with dice 6.'}],
    hint:'Recognize the four-corner pattern.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Four corners, no center dot.',teachingSteps:['See the four corner dots.','There is no center dot.','The dice shows 4.'],correctAnswerExplanation:'Four corner dots — this dice shows 4.'} }),

  // ── Block J: domino, all 45 new combinations ── q99–q143 ─────────────────

  // Easy — sum 0–4 (14 pairs)
  _l1Q(99, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:0,right:0}, answer:0,
    choices:[{value:0,correct:true},{value:1,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty side as a dot.'},{value:2,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted multiple empty spots.'},{value:3,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed a random number.'}],
    hint:'Both sides are empty — no dots at all.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Both sides are empty — the total is 0.',teachingSteps:['Look at the left side: 0 dots.','Look at the right side: 0 dots.','0 and 0 makes 0.'],correctAnswerExplanation:'There are no dots on either side. The total is 0.'} }),

  _l1Q(100, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:0,right:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty left side.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:4,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Left side: 0. Right side: 1.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides, even when one is empty.',teachingSteps:['Left side: 0 dots.','Right side: 1 dot.','0 and 1 makes 1.'],correctAnswerExplanation:'Zero plus one equals 1 in all.'} }),

  _l1Q(101, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:1,right:0}, answer:1,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty right side.'},{value:1,correct:true},{value:3,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted significantly.'},{value:4,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Left side: 1. Right side: 0.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides, even when one is empty.',teachingSteps:['Left side: 1 dot.','Right side: 0 dots.','1 and 0 makes 1.'],correctAnswerExplanation:'One plus zero equals 1 in all.'} }),

  _l1Q(102, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:0,right:2}, answer:2,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty left side.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:4,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 0. Right side: 2.',
    intervention:{errorTag:'err_count_one_side',title:'An empty side has 0 — still count it.',teachingSteps:['Left side: 0 dots.','Right side: 2 dots.','0 and 2 makes 2.'],correctAnswerExplanation:'Zero plus two equals 2 in all.'} }),

  _l1Q(103, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:1,right:1}, answer:2,
    choices:[{value:1,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only one side (1 dot).'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:4,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Doubled to 4 instead of adding to 2.'}],
    hint:'Both sides show 1 dot each.',
    intervention:{errorTag:'err_count_one_side',title:'A domino has two sides — count both.',teachingSteps:['Left side: 1 dot.','Right side: 1 dot.','1 and 1 makes 2.'],correctAnswerExplanation:'One on each side makes 2 in all.'} }),

  _l1Q(104, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:2,right:0}, answer:2,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty right side.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:5,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Left side: 2. Right side: 0.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides — even the empty one.',teachingSteps:['Left side: 2 dots.','Right side: 0 dots.','2 and 0 makes 2.'],correctAnswerExplanation:'Two plus zero equals 2 in all.'} }),

  _l1Q(105, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:0,right:3}, answer:3,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty left side.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:5,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 0. Right side: 3.',
    intervention:{errorTag:'err_count_one_side',title:'Don\'t skip the empty side.',teachingSteps:['Left side: 0 dots.','Right side: 3 dots.','0 and 3 makes 3.'],correctAnswerExplanation:'Zero plus three equals 3 in all.'} }),

  _l1Q(106, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:1,right:2}, answer:3,
    choices:[{value:2,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (2 dots).'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:5,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 1. Right side: 2.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 1 dot.','Right side: 2 dots.','1 and 2 makes 3.'],correctAnswerExplanation:'One plus two equals 3 in all.'} }),

  _l1Q(107, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:2,right:1}, answer:3,
    choices:[{value:1,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (1 dot).'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:6,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Left side: 2. Right side: 1.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 2 dots.','Right side: 1 dot.','2 and 1 makes 3.'],correctAnswerExplanation:'Two plus one equals 3 in all.'} }),

  _l1Q(108, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:3,right:0}, answer:3,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty right side.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:6,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Left side: 3. Right side: 0.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides — even when one is empty.',teachingSteps:['Left side: 3 dots.','Right side: 0 dots.','3 and 0 makes 3.'],correctAnswerExplanation:'Three plus zero equals 3 in all.'} }),

  _l1Q(109, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:0,right:4}, answer:4,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty left side.'},{value:4,correct:true},{value:5,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:6,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 0. Right side: 4.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides — even the empty one.',teachingSteps:['Left side: 0 dots.','Right side: 4 dots.','0 and 4 makes 4.'],correctAnswerExplanation:'Zero plus four equals 4 in all.'} }),

  _l1Q(110, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:2,right:2}, answer:4,
    choices:[{value:2,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only one side (2 dots).'},{value:4,correct:true},{value:5,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:6,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Doubled incorrectly to 6.'}],
    hint:'Both sides show 2 dots each.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 2 dots.','Right side: 2 more dots.','2 and 2 makes 4.'],correctAnswerExplanation:'Two on each side makes 4 in all.'} }),

  _l1Q(111, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:3,right:1}, answer:4,
    choices:[{value:3,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (3 dots).'},{value:4,correct:true},{value:5,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:6,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 3. Right side: 1.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 3 dots.','Right side: 1 dot.','3 and 1 makes 4.'],correctAnswerExplanation:'Three plus one equals 4 in all.'} }),

  _l1Q(112, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:4,right:0}, answer:4,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty right side.'},{value:4,correct:true},{value:5,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:7,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Left side: 4. Right side: 0.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides — even the empty one.',teachingSteps:['Left side: 4 dots.','Right side: 0 dots.','4 and 0 makes 4.'],correctAnswerExplanation:'Four plus zero equals 4 in all.'} }),

  // Medium — sum 5–8 (22 pairs)
  _l1Q(113, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:0,right:5}, answer:5,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty left side.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:7,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'One side is empty. The other shows 5.',
    intervention:{errorTag:'err_count_one_side',title:'An empty side adds 0.',teachingSteps:['Left side: 0 dots.','Right side: 5 dots.','0 and 5 makes 5.'],correctAnswerExplanation:'Zero plus five equals 5 in all.'} }),

  _l1Q(114, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:1,right:4}, answer:5,
    choices:[{value:1,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (1 dot).'},{value:4,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (4 dots).'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 1. Right side: 4. Put them together.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 1 dot.','Right side: 4 dots.','1 and 4 makes 5.'],correctAnswerExplanation:'One plus four equals 5 in all.'} }),

  _l1Q(115, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:2,right:3}, answer:5,
    choices:[{value:2,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (2 dots).'},{value:3,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (3 dots).'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 2. Right side: 3.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 2 dots.','Right side: 3 dots.','2 and 3 makes 5.'],correctAnswerExplanation:'Two plus three equals 5 in all.'} }),

  _l1Q(116, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:3,right:2}, answer:5,
    choices:[{value:2,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (2 dots).'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:7,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 3. Right side: 2.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 3 dots.','Right side: 2 dots.','3 and 2 makes 5.'],correctAnswerExplanation:'Three plus two equals 5 in all.'} }),

  _l1Q(117, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:4,right:1}, answer:5,
    choices:[{value:4,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (4 dots).'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:7,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 4. Right side: 1.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 4 dots.','Right side: 1 dot.','4 and 1 makes 5.'],correctAnswerExplanation:'Four plus one equals 5 in all.'} }),

  _l1Q(118, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:5,right:0}, answer:5,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty right side.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:8,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Left side: 5. Right side: 0.',
    intervention:{errorTag:'err_count_one_side',title:'An empty side adds 0.',teachingSteps:['Left side: 5 dots.','Right side: 0 dots.','5 and 0 makes 5.'],correctAnswerExplanation:'Five plus zero equals 5 in all.'} }),

  _l1Q(119, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:0,right:6}, answer:6,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty left side.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:8,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'One side is empty. The other shows 6.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides — even the empty one.',teachingSteps:['Left side: 0 dots.','Right side: 6 dots.','0 and 6 makes 6.'],correctAnswerExplanation:'Zero plus six equals 6 in all.'} }),

  _l1Q(120, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:1,right:5}, answer:6,
    choices:[{value:1,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (1 dot).'},{value:5,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (5 dots).'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 1. Right side: 5.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 1 dot.','Right side: 5 dots.','1 and 5 makes 6.'],correctAnswerExplanation:'One plus five equals 6 in all.'} }),

  _l1Q(121, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:2,right:4}, answer:6,
    choices:[{value:2,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (2 dots).'},{value:4,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (4 dots).'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 2. Right side: 4.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 2 dots.','Right side: 4 dots.','2 and 4 makes 6.'],correctAnswerExplanation:'Two plus four equals 6 in all.'} }),

  _l1Q(122, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:3,right:3}, answer:6,
    choices:[{value:3,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only one side (3 dots).'},{value:5,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Both sides show 3 dots each.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 3 dots.','Right side: 3 more dots.','3 and 3 makes 6.'],correctAnswerExplanation:'Three plus three equals 6 in all.'} }),

  _l1Q(123, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:4,right:2}, answer:6,
    choices:[{value:4,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (4 dots).'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:8,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 4. Right side: 2.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 4 dots.','Right side: 2 dots.','4 and 2 makes 6.'],correctAnswerExplanation:'Four plus two equals 6 in all.'} }),

  _l1Q(124, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:5,right:1}, answer:6,
    choices:[{value:5,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (5 dots).'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:8,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 5. Right side: 1.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 5 dots.','Right side: 1 dot.','5 and 1 makes 6.'],correctAnswerExplanation:'Five plus one equals 6 in all.'} }),

  _l1Q(125, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:6,right:0}, answer:6,
    choices:[{value:0,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the empty right side.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:9,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Left side: 6. Right side: 0.',
    intervention:{errorTag:'err_count_one_side',title:'An empty side adds 0.',teachingSteps:['Left side: 6 dots.','Right side: 0 dots.','6 and 0 makes 6.'],correctAnswerExplanation:'Six plus zero equals 6 in all.'} }),

  _l1Q(126, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:1,right:6}, answer:7,
    choices:[{value:1,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (1 dot).'},{value:6,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (6 dots).'},{value:7,correct:true},{value:8,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 1. Right side: 6.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 1 dot.','Right side: 6 dots.','1 and 6 makes 7.'],correctAnswerExplanation:'One plus six equals 7 in all.'} }),

  _l1Q(127, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:2,right:5}, answer:7,
    choices:[{value:2,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (2 dots).'},{value:5,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (5 dots).'},{value:7,correct:true},{value:8,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 2. Right side: 5.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 2 dots.','Right side: 5 dots.','2 and 5 makes 7.'],correctAnswerExplanation:'Two plus five equals 7 in all.'} }),

  _l1Q(128, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:4,right:3}, answer:7,
    choices:[{value:3,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (3 dots).'},{value:7,correct:true},{value:8,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:9,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 4. Right side: 3.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 4 dots.','Right side: 3 dots.','4 and 3 makes 7.'],correctAnswerExplanation:'Four plus three equals 7 in all.'} }),

  _l1Q(129, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:5,right:2}, answer:7,
    choices:[{value:5,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (5 dots).'},{value:7,correct:true},{value:8,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:9,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 5. Right side: 2.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 5 dots.','Right side: 2 dots.','5 and 2 makes 7.'],correctAnswerExplanation:'Five plus two equals 7 in all.'} }),

  _l1Q(130, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:6,right:1}, answer:7,
    choices:[{value:6,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (6 dots).'},{value:7,correct:true},{value:8,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:9,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 6. Right side: 1.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 6 dots.','Right side: 1 dot.','6 and 1 makes 7.'],correctAnswerExplanation:'Six plus one equals 7 in all.'} }),

  _l1Q(131, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:2,right:6}, answer:8,
    choices:[{value:2,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (2 dots).'},{value:6,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (6 dots).'},{value:8,correct:true},{value:9,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 2. Right side: 6.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 2 dots.','Right side: 6 dots.','2 and 6 makes 8.'],correctAnswerExplanation:'Two plus six equals 8 in all.'} }),

  _l1Q(132, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:3,right:5}, answer:8,
    choices:[{value:3,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (3 dots).'},{value:5,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (5 dots).'},{value:8,correct:true},{value:9,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 3. Right side: 5.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 3 dots.','Right side: 5 dots.','3 and 5 makes 8.'],correctAnswerExplanation:'Three plus five equals 8 in all.'} }),

  _l1Q(133, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:5,right:3}, answer:8,
    choices:[{value:3,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (3 dots).'},{value:8,correct:true},{value:9,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:10,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 5. Right side: 3.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 5 dots.','Right side: 3 dots.','5 and 3 makes 8.'],correctAnswerExplanation:'Five plus three equals 8 in all.'} }),

  _l1Q(134, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:6,right:2}, answer:8,
    choices:[{value:6,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (6 dots).'},{value:8,correct:true},{value:9,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:10,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 6. Right side: 2.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 6 dots.','Right side: 2 dots.','6 and 2 makes 8.'],correctAnswerExplanation:'Six plus two equals 8 in all.'} }),

  // Hard — sum 9–12 (9 pairs)
  _l1Q(135, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:3,right:6}, answer:9,
    choices:[{value:3,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (3 dots).'},{value:6,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (6 dots).'},{value:9,correct:true},{value:10,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 3. Right side: 6.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 3 dots.','Right side: 6 dots.','3 and 6 makes 9.'],correctAnswerExplanation:'Three plus six equals 9 in all.'} }),

  _l1Q(136, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:4,right:5}, answer:9,
    choices:[{value:4,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (4 dots).'},{value:5,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (5 dots).'},{value:9,correct:true},{value:10,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 4. Right side: 5.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 4 dots.','Right side: 5 dots.','4 and 5 makes 9.'],correctAnswerExplanation:'Four plus five equals 9 in all.'} }),

  _l1Q(137, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:5,right:4}, answer:9,
    choices:[{value:5,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (5 dots).'},{value:8,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:9,correct:true},{value:10,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 5. Right side: 4.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 5 dots.','Right side: 4 dots.','5 and 4 makes 9.'],correctAnswerExplanation:'Five plus four equals 9 in all.'} }),

  _l1Q(138, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:6,right:3}, answer:9,
    choices:[{value:6,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (6 dots).'},{value:9,correct:true},{value:10,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:11,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 6. Right side: 3.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 6 dots.','Right side: 3 dots.','6 and 3 makes 9.'],correctAnswerExplanation:'Six plus three equals 9 in all.'} }),

  _l1Q(139, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:4,right:6}, answer:10,
    choices:[{value:4,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (4 dots).'},{value:6,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (6 dots).'},{value:10,correct:true},{value:11,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 4. Right side: 6.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 4 dots.','Right side: 6 dots.','4 and 6 makes 10.'],correctAnswerExplanation:'Four plus six equals 10 in all.'} }),

  _l1Q(140, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:6,right:4}, answer:10,
    choices:[{value:6,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (6 dots).'},{value:10,correct:true},{value:11,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:12,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Left side: 6. Right side: 4.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 6 dots.','Right side: 4 dots.','6 and 4 makes 10.'],correctAnswerExplanation:'Six plus four equals 10 in all.'} }),

  _l1Q(141, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:5,right:6}, answer:11,
    choices:[{value:5,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the left side (5 dots).'},{value:6,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (6 dots).'},{value:11,correct:true},{value:12,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 5. Right side: 6.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 5 dots.','Right side: 6 dots.','5 and 6 makes 11.'],correctAnswerExplanation:'Five plus six equals 11 in all.'} }),

  _l1Q(142, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:6,right:5}, answer:11,
    choices:[{value:5,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only the right side (5 dots).'},{value:10,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:11,correct:true},{value:12,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Left side: 6. Right side: 5.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 6 dots.','Right side: 5 dots.','6 and 5 makes 11.'],correctAnswerExplanation:'Six plus five equals 11 in all.'} }),

  _l1Q(143, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots in all?', visual:{type:'domino',left:6,right:6}, answer:12,
    choices:[{value:6,correct:false,distractorType:'count_one_side_only',errorTag:'err_count_one_side',misconceptionExplanation:'Counted only one side (6 dots).'},{value:11,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:12,correct:true},{value:13,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Both sides show 6 dots each.',
    intervention:{errorTag:'err_count_one_side',title:'Count both sides to find the total.',teachingSteps:['Left side: 6 dots.','Right side: 6 more dots.','6 and 6 makes 12.'],correctAnswerExplanation:'Six plus six equals 12 in all.'} }),

  // ── Block K: objectSet organized arrays ── q144–q165 ─────────────────────

  // "How many dots?" — objectSet counts 1–11
  _l1Q(144, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:1,layout:'rows'}, answer:1,
    choices:[{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:3,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'},{value:4,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count just one dot.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Count each dot once.',teachingSteps:['Point to each dot.','Say: one.','The total is 1.'],correctAnswerExplanation:'One dot in the arrangement. The total is 1.'} }),

  _l1Q(145, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:2,layout:'rows'}, answer:2,
    choices:[{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:4,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'},{value:6,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count each dot in the row.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Touch each dot and count carefully.',teachingSteps:['Point to dot 1. Say: one.','Point to dot 2. Say: two.','The total is 2.'],correctAnswerExplanation:'Two dots in the arrangement. The total is 2.'} }),

  _l1Q(146, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:3,layout:'rows'}, answer:3,
    choices:[{value:2,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:7,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count each dot in the row.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count every dot.',teachingSteps:['Touch each dot one at a time.','Count: 1, 2, 3.','The total is 3.'],correctAnswerExplanation:'Three dots in the arrangement. The total is 3.'} }),

  _l1Q(147, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:4,layout:'rows'}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:4,correct:true},{value:5,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:8,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count each dot carefully.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Touch each dot and count.',teachingSteps:['Touch each dot one at a time.','Count: 1, 2, 3, 4.','The total is 4.'],correctAnswerExplanation:'Four dots in the arrangement. The total is 4.'} }),

  _l1Q(148, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:5,layout:'rows'}, answer:5,
    choices:[{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:8,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count each dot in the rows.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all the dots.',teachingSteps:['Touch each dot one at a time.','Count: 1, 2, 3, 4, 5.','The total is 5.'],correctAnswerExplanation:'Five dots in the arrangement. The total is 5.'} }),

  _l1Q(149, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:6,layout:'rows'}, answer:6,
    choices:[{value:5,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:9,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count all the dots in the arrangement.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count every dot in the rows.',teachingSteps:['Touch each dot one at a time.','Keep track: 1, 2, 3, 4, 5, 6.','The total is 6.'],correctAnswerExplanation:'Six dots in the arrangement. The total is 6.'} }),

  _l1Q(150, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:7,layout:'rows'}, answer:7,
    choices:[{value:6,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:7,correct:true},{value:8,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:9,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Count all the dots carefully.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count each dot — don\'t skip any.',teachingSteps:['Touch each dot one at a time.','Count: 1, 2, 3, 4, 5, 6, 7.','The total is 7.'],correctAnswerExplanation:'Seven dots in the arrangement. The total is 7.'} }),

  _l1Q(151, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:8,layout:'rows'}, answer:8,
    choices:[{value:7,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:8,correct:true},{value:9,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:10,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count all the dots in the rows.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count carefully — don\'t skip any.',teachingSteps:['Touch each dot one at a time.','Count: 1, 2, 3, 4, 5, 6, 7, 8.','The total is 8.'],correctAnswerExplanation:'Eight dots in the arrangement. The total is 8.'} }),

  _l1Q(152, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:9,layout:'rows'}, answer:9,
    choices:[{value:8,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:9,correct:true},{value:10,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:11,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Count each dot in the arrangement.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count carefully from the start.',teachingSteps:['Touch each dot one at a time.','Keep a careful count to 9.','The total is 9.'],correctAnswerExplanation:'Nine dots in the arrangement. The total is 9.'} }),

  _l1Q(153, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:10,layout:'rows'}, answer:10,
    choices:[{value:9,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:10,correct:true},{value:11,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:12,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Count carefully all the way to 10.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all ten dots.',teachingSteps:['Touch each dot one at a time.','Keep count: ...8, 9, 10.','The total is 10.'],correctAnswerExplanation:'Ten dots in the arrangement. The total is 10.'} }),

  _l1Q(154, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'How many dots?', visual:{type:'objectSet',count:11,layout:'rows'}, answer:11,
    choices:[{value:8,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed several dots.'},{value:10,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:11,correct:true},{value:12,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Count carefully all the way to 11.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all eleven dots.',teachingSteps:['Touch each dot one at a time.','Keep count: ...9, 10, 11.','The total is 11.'],correctAnswerExplanation:'Eleven dots in the arrangement. The total is 11.'} }),

  // "Count the dots." — objectSet counts 1–11
  _l1Q(155, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:1,layout:'rows'}, answer:1,
    choices:[{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:4,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'},{value:5,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed a much larger number.'}],
    hint:'There is just one dot to count.',
    intervention:{errorTag:'err_overcounted_by_one',title:'Count carefully — one dot only.',teachingSteps:['Point to the dot.','Say: one.','The total is 1.'],correctAnswerExplanation:'One dot. The total is 1.'} }),

  _l1Q(156, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:2,layout:'rows'}, answer:2,
    choices:[{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Counted only one dot.'},{value:2,correct:true},{value:4,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'},{value:6,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed a much larger number.'}],
    hint:'Count each dot one at a time.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count both dots.',teachingSteps:['Touch dot 1. Say: one.','Touch dot 2. Say: two.','The total is 2.'],correctAnswerExplanation:'Two dots. The total is 2.'} }),

  _l1Q(157, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:3,layout:'rows'}, answer:3,
    choices:[{value:1,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Only counted one dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:5,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count each dot. There are 3.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count every dot in the row.',teachingSteps:['Touch each dot.','Count: 1, 2, 3.','The total is 3.'],correctAnswerExplanation:'Three dots. The total is 3.'} }),

  _l1Q(158, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:4,layout:'rows'}, answer:4,
    choices:[{value:2,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:4,correct:true},{value:5,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'},{value:7,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count each dot carefully.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all four dots.',teachingSteps:['Touch each dot.','Count: 1, 2, 3, 4.','The total is 4.'],correctAnswerExplanation:'Four dots. The total is 4.'} }),

  _l1Q(159, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:5,layout:'rows'}, answer:5,
    choices:[{value:3,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:5,correct:true},{value:7,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count each dot in the arrangement.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all five dots.',teachingSteps:['Touch each dot.','Count: 1, 2, 3, 4, 5.','The total is 5.'],correctAnswerExplanation:'Five dots. The total is 5.'} }),

  _l1Q(160, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:6,layout:'rows'}, answer:6,
    choices:[{value:4,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:5,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:6,correct:true},{value:8,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Count all the dots in the rows.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all six dots.',teachingSteps:['Touch each dot.','Count: 1, 2, 3, 4, 5, 6.','The total is 6.'],correctAnswerExplanation:'Six dots. The total is 6.'} }),

  _l1Q(161, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:7,layout:'rows'}, answer:7,
    choices:[{value:5,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:6,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:7,correct:true},{value:9,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Count carefully — don\'t skip any dot.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all seven dots.',teachingSteps:['Touch each dot.','Count: 1, 2, 3, 4, 5, 6, 7.','The total is 7.'],correctAnswerExplanation:'Seven dots. The total is 7.'} }),

  _l1Q(162, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:8,layout:'rows'}, answer:8,
    choices:[{value:6,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:7,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:8,correct:true},{value:10,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Count each dot all the way through.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all eight dots.',teachingSteps:['Touch each dot.','Count: ...6, 7, 8.','The total is 8.'],correctAnswerExplanation:'Eight dots. The total is 8.'} }),

  _l1Q(163, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:9,layout:'rows'}, answer:9,
    choices:[{value:7,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:8,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:9,correct:true},{value:11,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Count carefully all the way to 9.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all nine dots.',teachingSteps:['Touch each dot.','Count: ...7, 8, 9.','The total is 9.'],correctAnswerExplanation:'Nine dots. The total is 9.'} }),

  _l1Q(164, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:10,layout:'rows'}, answer:10,
    choices:[{value:8,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:9,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:10,correct:true},{value:12,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Count carefully all the way to 10.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all ten dots.',teachingSteps:['Touch each dot.','Count: ...8, 9, 10.','The total is 10.'],correctAnswerExplanation:'Ten dots. The total is 10.'} }),

  _l1Q(165, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Count the dots.', visual:{type:'objectSet',count:11,layout:'rows'}, answer:11,
    choices:[{value:9,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:10,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:11,correct:true},{value:12,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra dot.'}],
    hint:'Count carefully all the way to 11.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count all eleven dots.',teachingSteps:['Touch each dot.','Count: ...9, 10, 11.','The total is 11.'],correctAnswerExplanation:'Eleven dots. The total is 11.'} }),

  // ── Block L: final top-up ── q166–q188 ───────────────────────────────────

  // "What number does this ten-frame show?" — counts 0–10
  _l1Q(166, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:0}, answer:0,
    choices:[{value:0,correct:true},{value:1,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:2,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted multiple empty cells.'},{value:5,correct:false,distractorType:'misread_structure',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed one row was full.'}],
    hint:'No dots are filled in. This shows 0.',
    intervention:{errorTag:'err_misread_structure',title:'No dots means this ten-frame shows 0.',teachingSteps:['Look for filled cells.','No cells have a dot.','This ten-frame shows 0.'],correctAnswerExplanation:'No cells are filled. The ten-frame shows 0.'} }),

  _l1Q(167, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the single dot.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra cell.'},{value:3,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Only one cell is filled. This shows 1.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Find the filled cell to know the number.',teachingSteps:['Look for cells with a dot.','One cell has a dot.','This ten-frame shows 1.'],correctAnswerExplanation:'One filled cell means this ten-frame shows 1.'} }),

  _l1Q(168, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:2}, answer:2,
    choices:[{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra cell.'},{value:4,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Two cells are filled. This shows 2.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count the filled cells to know the number.',teachingSteps:['Find each filled cell.','Count: 1, 2.','This ten-frame shows 2.'],correctAnswerExplanation:'Two filled cells mean this ten-frame shows 2.'} }),

  _l1Q(169, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:3}, answer:3,
    choices:[{value:2,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra cell.'},{value:6,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Three cells are filled. This shows 3.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count the filled cells.',teachingSteps:['Find each filled cell.','Count: 1, 2, 3.','This ten-frame shows 3.'],correctAnswerExplanation:'Three filled cells mean this ten-frame shows 3.'} }),

  _l1Q(170, { difficulty:'easy', keyIdea:'A full row in a ten-frame has 5.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:4}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:4,correct:true},{value:5,correct:false,distractorType:'misread_full_row',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the top row was full.'},{value:7,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Four cells are filled — one cell is empty.',
    intervention:{errorTag:'err_misread_structure',title:'Count the filled cells — not all 5 are filled.',teachingSteps:['Count cells with a dot: 1, 2, 3, 4.','One cell is empty.','This ten-frame shows 4.'],correctAnswerExplanation:'Four filled cells mean this ten-frame shows 4.'} }),

  _l1Q(171, { difficulty:'medium', keyIdea:'A full row in a ten-frame has 5.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:5}, answer:5,
    choices:[{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty bottom cell.'},{value:8,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'The top row is completely full. This shows 5.',
    intervention:{errorTag:'err_undercounted_by_one',title:'A full top row shows 5.',teachingSteps:['The top row has 5 filled cells.','The bottom row is empty.','This ten-frame shows 5.'],correctAnswerExplanation:'Five filled cells — a full top row — show 5.'} }),

  _l1Q(172, { difficulty:'medium', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:6}, answer:6,
    choices:[{value:5,correct:false,distractorType:'only_full_row',errorTag:'err_only_count_full_row',misconceptionExplanation:'Counted only the full top row.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:9,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Top row full (5) plus 1 below. This shows 6.',
    intervention:{errorTag:'err_only_count_full_row',title:'Count the extras below the full row.',teachingSteps:['Top row is full: 5.','Bottom row has 1 more dot.','5 and 1 makes 6.'],correctAnswerExplanation:'Five plus one more below — this ten-frame shows 6.'} }),

  _l1Q(173, { difficulty:'medium', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:7}, answer:7,
    choices:[{value:5,correct:false,distractorType:'only_full_row',errorTag:'err_only_count_full_row',misconceptionExplanation:'Counted only the full top row.'},{value:7,correct:true},{value:8,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra cell.'},{value:9,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'Top row full (5) plus 2 below. This shows 7.',
    intervention:{errorTag:'err_only_count_full_row',title:'Count all the filled cells.',teachingSteps:['Top row full: 5.','Two more dots in the bottom row.','5 and 2 makes 7.'],correctAnswerExplanation:'Five plus two more — this ten-frame shows 7.'} }),

  _l1Q(174, { difficulty:'hard', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:8}, answer:8,
    choices:[{value:6,correct:false,distractorType:'ignore_full_row',errorTag:'err_ignore_full_row',misconceptionExplanation:'Ignored the full top row.'},{value:8,correct:true},{value:9,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:10,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed both rows were full.'}],
    hint:'Top row full (5) plus 3 below. This shows 8.',
    intervention:{errorTag:'err_ignore_full_row',title:'Count the full top row too.',teachingSteps:['Top row is full: 5.','Bottom row has 3 dots.','5 and 3 makes 8.'],correctAnswerExplanation:'Five plus three more — this ten-frame shows 8.'} }),

  _l1Q(175, { difficulty:'hard', keyIdea:'When the top row is full, just count the extras below.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:9}, answer:9,
    choices:[{value:7,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:8,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:9,correct:true},{value:11,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Overcounted by two.'}],
    hint:'Almost full — one empty cell. This shows 9.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Find the empty cell to know it\'s 9.',teachingSteps:['Count all filled cells.','There are 9 filled cells.','One cell is empty.'],correctAnswerExplanation:'Nine filled cells and one empty — this ten-frame shows 9.'} }),

  _l1Q(176, { difficulty:'hard', keyIdea:'Two full rows make 10.',
    prompt:'What number does this ten-frame show?', visual:{type:'tenFrame',count:10}, answer:10,
    choices:[{value:8,correct:false,distractorType:'undercounted_multiple',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed two dots.'},{value:9,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:10,correct:true},{value:11,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted a phantom extra dot.'}],
    hint:'Both rows fully filled. This shows 10.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Two full rows always show 10.',teachingSteps:['Top row: 5 filled cells.','Bottom row: 5 filled cells.','5 and 5 makes 10.'],correctAnswerExplanation:'Both rows full — this ten-frame shows 10.'} }),

  // "What number does this five-frame show?" — counts 0–5
  _l1Q(177, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'What number does this five-frame show?', visual:{type:'fivFrame',count:0}, answer:0,
    choices:[{value:0,correct:true},{value:1,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an empty cell.'},{value:2,correct:false,distractorType:'overcounted_multiple',errorTag:'err_overcounted_multiple',misconceptionExplanation:'Counted multiple empty cells.'},{value:4,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'No cells are filled. This shows 0.',
    intervention:{errorTag:'err_overcounted_by_one',title:'No dots — this five-frame shows 0.',teachingSteps:['Look for filled cells.','No cells have a dot.','This five-frame shows 0.'],correctAnswerExplanation:'No filled cells — this five-frame shows 0.'} }),

  _l1Q(178, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'How many dots are in the five-frame?', visual:{type:'fivFrame',count:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the one dot.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra cell.'},{value:4,correct:false,distractorType:'wrong_count',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed incorrectly.'}],
    hint:'One cell is filled. This shows 1.',
    intervention:{errorTag:'err_undercounted_by_one',title:'One filled cell shows 1.',teachingSteps:['Find the filled cell.','There is one filled cell.','This five-frame shows 1.'],correctAnswerExplanation:'One filled cell — this five-frame shows 1.'} }),

  _l1Q(179, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'What number does this five-frame show?', visual:{type:'fivFrame',count:2}, answer:2,
    choices:[{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Only counted one dot.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra cell.'},{value:5,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the frame was full.'}],
    hint:'Two cells are filled. This shows 2.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count the filled cells.',teachingSteps:['Find each filled cell.','Count: 1, 2.','This five-frame shows 2.'],correctAnswerExplanation:'Two filled cells — this five-frame shows 2.'} }),

  _l1Q(180, { difficulty:'easy', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'How many dots are in the five-frame?', visual:{type:'fivFrame',count:3}, answer:3,
    choices:[{value:2,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted an extra cell.'},{value:5,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the frame was full.'}],
    hint:'Three cells are filled. This shows 3.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Count the three filled cells.',teachingSteps:['Find each filled cell.','Count: 1, 2, 3.','This five-frame shows 3.'],correctAnswerExplanation:'Three filled cells — this five-frame shows 3.'} }),

  _l1Q(181, { difficulty:'medium', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'What number does this five-frame show?', visual:{type:'fivFrame',count:4}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:4,correct:true},{value:5,correct:false,distractorType:'misread_full_frame',errorTag:'err_misread_structure',misconceptionExplanation:'Assumed the frame was full.'},{value:0,correct:false,distractorType:'count_empty_cells',errorTag:'err_count_empty_cells',misconceptionExplanation:'Counted empty cells only.'}],
    hint:'Four cells are filled — one is empty. This shows 4.',
    intervention:{errorTag:'err_misread_structure',title:'Four is almost — but not — a full five-frame.',teachingSteps:['A full five-frame shows 5.','This frame has one empty cell.','4 cells are filled: this shows 4.'],correctAnswerExplanation:'Four filled cells — this five-frame shows 4.'} }),

  _l1Q(182, { difficulty:'medium', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'How many dots are in the five-frame?', visual:{type:'fivFrame',count:5}, answer:5,
    choices:[{value:4,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Counted past the frame.'},{value:2,correct:false,distractorType:'count_empty_cells',errorTag:'err_count_empty_cells',misconceptionExplanation:'Counted empty cells.'}],
    hint:'All five cells are filled. This shows 5.',
    intervention:{errorTag:'err_undercounted_by_one',title:'A completely full five-frame shows 5.',teachingSteps:['All 5 cells are filled.','Count: 1, 2, 3, 4, 5.','This five-frame shows 5.'],correctAnswerExplanation:'All five cells filled — this five-frame shows 5.'} }),

  // "Without counting, how many dots?" — dicePattern faces 1–6
  _l1Q(183, { difficulty:'easy', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting, how many dots?', visual:{type:'dicePattern',face:1}, answer:1,
    choices:[{value:0,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Saw the face as empty.'},{value:1,correct:true},{value:2,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom second dot.'},{value:4,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused with dice 4 corners.'}],
    hint:'Just one dot — recognize it instantly.',
    intervention:{errorTag:'err_undercounted_by_one',title:'One dot in the center — that\'s 1.',teachingSteps:['See the single center dot.','Recognize it without counting.','The answer is 1.'],correctAnswerExplanation:'One center dot — this dice shows 1.'} }),

  _l1Q(184, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting, how many dots?', visual:{type:'dicePattern',face:2}, answer:2,
    choices:[{value:1,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Only saw one diagonal dot.'},{value:2,correct:true},{value:3,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom third dot.'},{value:5,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused with dice 5.'}],
    hint:'Two diagonal dots — see them as a pair.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Two diagonal dots — that\'s 2.',teachingSteps:['See the two diagonal dots.','Recognize the pair without counting.','The answer is 2.'],correctAnswerExplanation:'Two diagonal dots — this dice shows 2.'} }),

  _l1Q(185, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting, how many dots?', visual:{type:'dicePattern',face:3}, answer:3,
    choices:[{value:2,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the center dot.'},{value:3,correct:true},{value:4,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Saw a phantom fourth dot.'},{value:6,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused with dice 6.'}],
    hint:'Three dots on a diagonal — see the pattern.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Three on a diagonal — that\'s 3.',teachingSteps:['See the diagonal line of dots.','There are 3 dots on the diagonal.','The answer is 3.'],correctAnswerExplanation:'Three diagonal dots — this dice shows 3.'} }),

  _l1Q(186, { difficulty:'medium', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting, how many dots?', visual:{type:'dicePattern',face:4}, answer:4,
    choices:[{value:3,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one corner dot.'},{value:4,correct:true},{value:5,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Added a phantom center dot.'},{value:6,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Confused with dice 6.'}],
    hint:'Four corner dots — see them as a square.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Four corners, no center — that\'s 4.',teachingSteps:['See the four corner dots.','No dot in the center.','The answer is 4.'],correctAnswerExplanation:'Four corner dots — this dice shows 4.'} }),

  _l1Q(187, { difficulty:'hard', keyIdea:'Different shapes can show the same number — a ten-frame, a dice face, or a five-frame can all show 5.',
    prompt:'Without counting, how many dots?', visual:{type:'dicePattern',face:5}, answer:5,
    choices:[{value:4,correct:false,distractorType:'miss_center_dot',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed the center dot.'},{value:5,correct:true},{value:6,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Added a phantom dot.'},{value:7,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed too high.'}],
    hint:'Four corners and a center dot — see all 5.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Four corners plus center dot — that\'s 5.',teachingSteps:['See the four corner dots: 4.','See the center dot: one more.','The answer is 5.'],correctAnswerExplanation:'Four corners plus the center dot — this dice shows 5.'} }),

  _l1Q(188, { difficulty:'hard', keyIdea:'Look for groups first, before you count one by one.',
    prompt:'Without counting, how many dots?', visual:{type:'dicePattern',face:6}, answer:6,
    choices:[{value:5,correct:false,distractorType:'undercounted_by_one',errorTag:'err_undercounted_by_one',misconceptionExplanation:'Missed one dot.'},{value:6,correct:true},{value:7,correct:false,distractorType:'overcounted_by_one',errorTag:'err_overcounted_by_one',misconceptionExplanation:'Added a phantom dot.'},{value:8,correct:false,distractorType:'wrong_dice_pattern',errorTag:'err_misread_structure',misconceptionExplanation:'Guessed too high.'}],
    hint:'Two columns of three — see both groups.',
    intervention:{errorTag:'err_undercounted_by_one',title:'Two groups of 3 — that\'s 6.',teachingSteps:['See the left column: 3 dots.','See the right column: 3 dots.','3 and 3 makes 6.'],correctAnswerExplanation:'Two columns of 3 dots each — this dice shows 6.'} })
];

// ─── Lesson 1.1: Lesson Quiz Attempt rule ─────────────────────────────────────

const _l1QuizAttempt = {
  questionCount: 8,
  difficultyMix: { easy: 3, medium: 4, hard: 1 },
  sourceRule: 'this_lesson_quizbank_only',
  avoidRecentlySeen: true,
  noDuplicatesWithinAttempt: true
};

// ─── Lesson 1.1: Diagnostics overview (for migration tracking) ────────────────

const _l1Diagnostics = {
  commonDistractors: [
    { value: 'count - 1',  meaning: 'Off by one — student counted one too few.',                       errorTag: 'err_undercounted_by_one' },
    { value: 'count + 1',  meaning: 'Off by one — student counted an empty cell.',                    errorTag: 'err_overcounted_by_one' },
    { value: '5',          meaning: 'Only counted the full top row; missed the extras below.',         errorTag: 'err_only_count_full_row' },
    { value: 'count - 5',  meaning: 'Counted only the partial bottom row; ignored the full top row.',  errorTag: 'err_ignore_full_row' },
    { value: '0 or 10',    meaning: 'Misread the structure entirely.',                                 errorTag: 'err_misread_structure' },
    { value: 'one-side',   meaning: 'On a domino, counted only one side.',                             errorTag: 'err_count_one_side' }
  ],
  errorTags: [
    'err_undercounted_by_one', 'err_overcounted_by_one', 'err_overcounted_multiple',
    'err_only_count_full_row', 'err_ignore_full_row', 'err_misread_structure',
    'err_count_empty_cells', 'err_confuse_frame_size',
    'err_count_one_side'
  ],
  interventionRules: [
    { errorTag: 'err_undercounted_by_one',  style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_overcounted_by_one',   style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_overcounted_multiple', style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_only_count_full_row',  style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_ignore_full_row',      style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_misread_structure',    style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_count_empty_cells',    style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_confuse_frame_size',   style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_count_one_side',       style: 'visual_model', followUpRule: 'same_skill_new_numbers' }
  ]
};

// ════════════════════════════════════════════════════════════════════════════
//  Lesson 1.2 — Count Forward (v0.2.0)
// ════════════════════════════════════════════════════════════════════════════

// ─── L1.2 shared intervention templates ──────────────────────────────────────

const _l2IntBackward = {
  errorTag: 'err_counted_backward',
  title: 'Count Forward, Not Backward',
  teachingSteps: 'To count forward, add 1 each time. Move right on the number line. Each step right is one more number.',
  correctAnswerExplanation: 'Counting forward adds 1 and gives a bigger number, not a smaller one.'
};
const _l2IntRepeated = {
  errorTag: 'err_repeated_number',
  title: 'Move Forward — Do Not Stay',
  teachingSteps: 'When counting forward, say a NEW number each time. Add 1 to the last number to move forward.',
  correctAnswerExplanation: 'The next number is always 1 more. Saying the same number twice means you did not move forward.'
};
const _l2IntSkipped = {
  errorTag: 'err_skipped_number',
  title: 'Count One Step at a Time',
  teachingSteps: 'Counting forward adds exactly 1 each step. Slow down and count one step at a time.',
  correctAnswerExplanation: 'You jumped 2 steps instead of 1. Add exactly 1 to count forward correctly.'
};
const _l2IntTens = {
  errorTag: 'err_tens_transition_error',
  title: 'Crossing a New Ten',
  teachingSteps: 'After the 9 in the ones place, the tens digit goes up by 1. So 29 becomes 30, 39 becomes 40, 49 becomes 50.',
  correctAnswerExplanation: 'When ones reach 9, adding 1 starts a new ten. The ones digit resets to 0 and the tens goes up by 1.'
};
const _l2IntHundred = {
  errorTag: 'err_hundred_transition_error',
  title: 'Crossing 99 to 100',
  teachingSteps: 'After 99 comes 100. The rule is the same: add 1. 99 + 1 = 100. Count forward, not backward.',
  correctAnswerExplanation: '99 + 1 = 100. This starts a new hundred. Counting always adds 1, even at 99.'
};
const _l2IntSeq = {
  errorTag: 'err_sequence_order_error',
  title: 'Find the Missing Number',
  teachingSteps: 'Look at the number just before the blank. Add 1 to find what goes in the blank.',
  correctAnswerExplanation: 'In a forward-counting sequence, each number is exactly 1 more than the one before it.'
};

// ─── L1.2: Key Ideas (5) ─────────────────────────────────────────────────────

const _l2KeyIdeas = [
  'Counting forward means the numbers get bigger by 1 each time.',
  'You can start counting forward from any number, not just 1.',
  'After 9 in the ones place, the tens digit goes up by 1 -- like 29, 30 or 49, 50.',
  'After 99 comes 100 -- counting crosses into a new place value.',
  'On a number line, counting forward means moving to the right.'
];

const _l2KI1 = _l2KeyIdeas[0];
const _l2KI2 = _l2KeyIdeas[1];
const _l2KI3 = _l2KeyIdeas[2];
const _l2KI4 = _l2KeyIdeas[3];
const _l2KI5 = _l2KeyIdeas[4];

// ─── L1.2: Worked Examples (12) ──────────────────────────────────────────────

const _l2Examples = [
  _l2E(1, {
    title: 'Simple Count Forward',
    prompt: 'Start at 5. Count forward 4 numbers. What are those 4 numbers?',
    visual: null,
    steps: [
      'Start at 5.',
      'Count one more at a time: 6, 7, 8, 9.',
      'Each step adds exactly 1.'
    ],
    finalAnswer: '6, 7, 8, 9',
    teachingNote: 'Count slowly and point to each number. Reinforce "one more each time."',
    relatedKeyIdea: _l2KI1
  }),
  _l2E(2, {
    title: 'What Comes Next',
    prompt: 'What number comes after 13?',
    visual: { type: 'numberLine', min: 11, max: 16, ticks: [11, 12, 13, 14, 15, 16], mark: 13, jumps: [{ from: 13, to: 14, label: '+1' }] },
    steps: [
      'Find 13 on the number line.',
      'The arrow moves 1 step to the right.',
      'One step right from 13 lands on 14.'
    ],
    finalAnswer: '14',
    teachingNote: 'Use the jump arc to show that moving right is the same as counting forward.',
    relatedKeyIdea: _l2KI5
  }),
  _l2E(3, {
    title: 'Missing Number in Sequence',
    prompt: 'Fill in: 22, 23, ___, 25',
    visual: { type: 'numberLine', min: 20, max: 27, ticks: [20, 21, 22, 23, 24, 25, 26, 27], mark: 23 },
    steps: [
      'Look at 22, 23 -- each goes up by 1.',
      'Add 1 to 23: 23 + 1 = 24.',
      'Check: 24 + 1 = 25. Correct!'
    ],
    finalAnswer: '24',
    teachingNote: 'Point to the gap on the number line and count forward one step from 23.',
    relatedKeyIdea: _l2KI1
  }),
  _l2E(4, {
    title: 'Start From Any Number',
    prompt: 'Start at 67. Count forward 3 numbers. What are those numbers?',
    visual: null,
    steps: [
      'Start at 67.',
      'Add 1: 68.',
      'Add 1 more: 69.',
      'Add 1 more: 70.',
      'The three numbers are 68, 69, 70.'
    ],
    finalAnswer: '68, 69, 70',
    teachingNote: 'Stress that counting can begin anywhere -- students do not need to start from 1.',
    relatedKeyIdea: _l2KI2
  }),
  _l2E(5, {
    title: 'Across a Ten',
    prompt: 'Count forward: 28, 29, ___, 31',
    visual: { type: 'numberLine', min: 26, max: 33, ticks: [26, 27, 28, 29, 30, 31, 32, 33], mark: 29, jumps: [{ from: 29, to: 30, label: '+1' }] },
    steps: [
      '28, 29 -- the ones digit is about to reach 9.',
      'After 29, the ones digit resets to 0 and the tens digit goes up: 30.',
      'Check: 30 + 1 = 31. Correct!'
    ],
    finalAnswer: '30',
    teachingNote: 'Highlight the jump across the decade on the number line. Students often stall at 29.',
    relatedKeyIdea: _l2KI3
  }),
  _l2E(6, {
    title: 'Across 99 to 100',
    prompt: 'Count forward: 98, 99, ___, 101',
    visual: { type: 'numberLine', min: 96, max: 103, ticks: [96, 97, 98, 99, 100, 101, 102, 103], mark: 99, jumps: [{ from: 99, to: 100, label: '+1' }] },
    steps: [
      '98, 99 -- the ones and tens digits are both 9.',
      'Adding 1 crosses into a brand new hundred: 100.',
      'Check: 100 + 1 = 101. Correct!'
    ],
    finalAnswer: '100',
    teachingNote: 'Emphasize that 99 + 1 = 100 uses the same rule as all other forward counting.',
    relatedKeyIdea: _l2KI4
  }),
  _l2E(7, {
    title: 'Number Line Movement',
    prompt: 'The number line shows 44. Move 1 step to the right. Where do you land?',
    visual: { type: 'numberLine', min: 41, max: 48, ticks: [41, 42, 43, 44, 45, 46, 47, 48], mark: 44, jumps: [{ from: 44, to: 45, label: '+1' }] },
    steps: [
      'Find 44 on the number line.',
      'Moving right means counting forward.',
      '1 step right from 44 lands on 45.'
    ],
    finalAnswer: '45',
    teachingNote: 'Connect moving right on the number line to the idea of adding 1.',
    relatedKeyIdea: _l2KI5
  }),
  _l2E(8, {
    title: 'Common Mistake -- Counting Backward',
    prompt: 'A student counted: 45, 44, 43. What mistake did they make?',
    visual: null,
    steps: [
      'Look at the numbers: 45, 44, 43.',
      'Each number is getting SMALLER -- that is counting backward.',
      'To count forward, each number must be 1 MORE than the last.'
    ],
    finalAnswer: 'They counted backward instead of forward.',
    teachingNote: 'Use this to help students self-check: ask "Is each number bigger than the last?"',
    relatedKeyIdea: _l2KI1
  }),
  _l2E(9, {
    title: 'Common Mistake -- Skipped a Number',
    prompt: 'A student counted: 34, 35, 37. What number did they skip?',
    visual: null,
    steps: [
      'Check each step: 34 to 35 is +1. Good.',
      '35 to 37 is +2 -- that jumps over 36!',
      'The missing number is 36.'
    ],
    finalAnswer: '36',
    teachingNote: 'Count each step carefully. One step at a time, always +1.',
    relatedKeyIdea: _l2KI1
  }),
  _l2E(10, {
    title: 'Common Mistake -- Repeated a Number',
    prompt: 'A student counted: 50, 51, 51, 52. What mistake did they make?',
    visual: null,
    steps: [
      'Check each step: 50 to 51 is +1. Good.',
      '51 to 51 is +0 -- same number repeated!',
      '51 to 52 is +1. Good.',
      'They said 51 twice instead of moving forward.'
    ],
    finalAnswer: 'They repeated 51 instead of moving forward.',
    teachingNote: 'Remind students: every step forward must be a NEW number.',
    relatedKeyIdea: _l2KI1
  }),
  _l2E(11, {
    title: 'Harder Sequence Near 120',
    prompt: 'Fill in: 116, 117, ___, 119, 120',
    visual: { type: 'numberLine', min: 114, max: 121, ticks: [114, 115, 116, 117, 118, 119, 120, 121], mark: 117 },
    steps: [
      '116, 117 -- each goes up by 1.',
      'Add 1 to 117: 117 + 1 = 118.',
      'Check: 118 + 1 = 119, 119 + 1 = 120. Correct!'
    ],
    finalAnswer: '118',
    teachingNote: 'Show that the one-more rule works all the way up to 120.',
    relatedKeyIdea: _l2KI2
  }),
  _l2E(12, {
    title: 'Mixed Review -- Two Blanks',
    prompt: 'Count forward from 88: 88, 89, ___, ___, 92. Fill in both missing numbers.',
    visual: null,
    steps: [
      '88, 89 -- add 1: 90. That crosses a new ten.',
      'Add 1 to 90: 91.',
      'Check: 91 + 1 = 92. Correct!',
      'The two missing numbers are 90 and 91.'
    ],
    finalAnswer: '90, 91',
    teachingNote: 'This crosses a ten. Use as a bridge to Block G questions.',
    relatedKeyIdea: _l2KI3
  })
];

// ─── L1.2: Practice Questions (22) ───────────────────────────────────────────

const _l2Practice = [
  _l2P(1,  { difficulty: 'easy',   keyIdea: _l2KI1, prompt: 'What number comes after 5?',  answer: '6',  hint: 'What is 1 more than 5?',  explanation: '5 + 1 = 6.',
    choices: [{value:'6',correct:true},{value:'4',correct:false,errorTag:'err_counted_backward'},{value:'5',correct:false,errorTag:'err_repeated_number'},{value:'7',correct:false,errorTag:'err_skipped_number'}] }),
  _l2P(2,  { difficulty: 'easy',   keyIdea: _l2KI1, prompt: 'What number comes after 12?', answer: '13', hint: 'What is 1 more than 12?', explanation: '12 + 1 = 13.',
    choices: [{value:'13',correct:true},{value:'11',correct:false,errorTag:'err_counted_backward'},{value:'12',correct:false,errorTag:'err_repeated_number'},{value:'14',correct:false,errorTag:'err_skipped_number'}] }),
  _l2P(3,  { difficulty: 'easy',   keyIdea: _l2KI1, prompt: 'What number comes after 18?', answer: '19', hint: 'What is 1 more than 18?', explanation: '18 + 1 = 19.',
    choices: [{value:'19',correct:true},{value:'17',correct:false,errorTag:'err_counted_backward'},{value:'18',correct:false,errorTag:'err_repeated_number'},{value:'20',correct:false,errorTag:'err_skipped_number'}] }),
  _l2P(4,  { difficulty: 'medium', keyIdea: _l2KI2, prompt: 'What number comes after 25?', answer: '26', hint: 'What is 1 more than 25?', explanation: '25 + 1 = 26.',
    choices: [{value:'26',correct:true},{value:'24',correct:false,errorTag:'err_counted_backward'},{value:'25',correct:false,errorTag:'err_repeated_number'},{value:'27',correct:false,errorTag:'err_skipped_number'}] }),
  _l2P(5,  { difficulty: 'medium', keyIdea: _l2KI2, prompt: 'What number comes after 31?', answer: '32', hint: 'What is 1 more than 31?', explanation: '31 + 1 = 32.',
    choices: [{value:'32',correct:true},{value:'30',correct:false,errorTag:'err_counted_backward'},{value:'31',correct:false,errorTag:'err_repeated_number'},{value:'33',correct:false,errorTag:'err_skipped_number'}] }),
  _l2P(6,  { difficulty: 'medium', keyIdea: _l2KI2, prompt: 'What number comes after 40?', answer: '41', hint: 'What is 1 more than 40?', explanation: '40 + 1 = 41.',
    choices: [{value:'41',correct:true},{value:'39',correct:false,errorTag:'err_counted_backward'},{value:'40',correct:false,errorTag:'err_repeated_number'},{value:'42',correct:false,errorTag:'err_skipped_number'}] }),
  _l2P(7,  { difficulty: 'medium', keyIdea: _l2KI2, prompt: 'What number comes after 45?', answer: '46', hint: 'What is 1 more than 45?', explanation: '45 + 1 = 46.',
    choices: [{value:'46',correct:true},{value:'44',correct:false,errorTag:'err_counted_backward'},{value:'45',correct:false,errorTag:'err_repeated_number'},{value:'47',correct:false,errorTag:'err_skipped_number'}] }),
  _l2P(8,  { difficulty: 'easy',   keyIdea: _l2KI1, prompt: 'Fill in: 20, 21, ___, 23', answer: '22', hint: 'What comes after 21?', explanation: '21 + 1 = 22.',
    choices: [{value:'22',correct:true},{value:'21',correct:false,errorTag:'err_repeated_number'},{value:'23',correct:false,errorTag:'err_sequence_order_error'},{value:'20',correct:false,errorTag:'err_counted_backward'}] }),
  _l2P(9,  { difficulty: 'easy',   keyIdea: _l2KI1, prompt: 'Fill in: 33, 34, ___, 36', answer: '35', hint: 'What comes after 34?', explanation: '34 + 1 = 35.',
    choices: [{value:'35',correct:true},{value:'34',correct:false,errorTag:'err_repeated_number'},{value:'36',correct:false,errorTag:'err_sequence_order_error'},{value:'33',correct:false,errorTag:'err_counted_backward'}] }),
  _l2P(10, { difficulty: 'medium', keyIdea: _l2KI2, prompt: 'Fill in: 47, 48, ___, 50', answer: '49', hint: 'What comes after 48?', explanation: '48 + 1 = 49.',
    choices: [{value:'49',correct:true},{value:'48',correct:false,errorTag:'err_repeated_number'},{value:'50',correct:false,errorTag:'err_sequence_order_error'},{value:'47',correct:false,errorTag:'err_counted_backward'}] }),
  _l2P(11, { difficulty: 'medium', keyIdea: _l2KI2, prompt: 'Fill in: 55, ___, 57',      answer: '56', hint: 'What comes after 55?', explanation: '55 + 1 = 56.',
    choices: [{value:'56',correct:true},{value:'55',correct:false,errorTag:'err_repeated_number'},{value:'57',correct:false,errorTag:'err_sequence_order_error'},{value:'54',correct:false,errorTag:'err_counted_backward'}] }),
  _l2P(12, { difficulty: 'medium', keyIdea: _l2KI2, prompt: 'Fill in: 61, 62, ___, 64', answer: '63', hint: 'What comes after 62?', explanation: '62 + 1 = 63.',
    choices: [{value:'63',correct:true},{value:'62',correct:false,errorTag:'err_repeated_number'},{value:'64',correct:false,errorTag:'err_sequence_order_error'},{value:'61',correct:false,errorTag:'err_counted_backward'}] }),
  _l2P(13, { difficulty: 'medium', keyIdea: _l2KI3, prompt: 'Fill in: 68, 69, ___, 71', answer: '70', hint: 'What comes after 69? Remember: after 9 in the ones, the tens go up.', explanation: '69 + 1 = 70. The ones reset to 0 and tens go up to 7.',
    choices: [{value:'70',correct:true},{value:'69',correct:false,errorTag:'err_repeated_number'},{value:'60',correct:false,errorTag:'err_tens_transition_error'},{value:'71',correct:false,errorTag:'err_skipped_number'}] }),
  _l2P(14, { difficulty: 'medium', keyIdea: _l2KI2, prompt: 'Fill in: 73, ___, 75',      answer: '74', hint: 'What comes after 73?', explanation: '73 + 1 = 74.',
    choices: [{value:'74',correct:true},{value:'73',correct:false,errorTag:'err_repeated_number'},{value:'75',correct:false,errorTag:'err_sequence_order_error'},{value:'72',correct:false,errorTag:'err_counted_backward'}] }),
  _l2P(15, { difficulty: 'medium', keyIdea: _l2KI3, prompt: 'Fill in: 29, ___, 31',      answer: '30', hint: 'After 29 the ones digit resets. What new ten starts?', explanation: '29 + 1 = 30. The tens digit goes from 2 to 3.',
    choices: [{value:'30',correct:true},{value:'29',correct:false,errorTag:'err_repeated_number'},{value:'20',correct:false,errorTag:'err_tens_transition_error'},{value:'28',correct:false,errorTag:'err_counted_backward'}] }),
  _l2P(16, { difficulty: 'medium', keyIdea: _l2KI3, prompt: 'Fill in: 39, ___, 41',      answer: '40', hint: 'After 39 comes a new ten. What ten?', explanation: '39 + 1 = 40.',
    choices: [{value:'40',correct:true},{value:'39',correct:false,errorTag:'err_repeated_number'},{value:'30',correct:false,errorTag:'err_tens_transition_error'},{value:'38',correct:false,errorTag:'err_counted_backward'}] }),
  _l2P(17, { difficulty: 'medium', keyIdea: _l2KI3, prompt: 'Fill in: 59, ___, 61',      answer: '60', hint: 'After 59 the ones digit resets. What new ten starts?', explanation: '59 + 1 = 60.',
    choices: [{value:'60',correct:true},{value:'59',correct:false,errorTag:'err_repeated_number'},{value:'50',correct:false,errorTag:'err_tens_transition_error'},{value:'58',correct:false,errorTag:'err_counted_backward'}] }),
  _l2P(18, { difficulty: 'medium', keyIdea: _l2KI3, prompt: 'Fill in: 79, ___, 81',      answer: '80', hint: 'After 79 comes a new ten. What ten?', explanation: '79 + 1 = 80.',
    choices: [{value:'80',correct:true},{value:'79',correct:false,errorTag:'err_repeated_number'},{value:'70',correct:false,errorTag:'err_tens_transition_error'},{value:'78',correct:false,errorTag:'err_counted_backward'}] }),
  _l2P(19, { difficulty: 'hard',   keyIdea: _l2KI4, prompt: 'What number comes after 99?', answer: '100', hint: 'After 99 comes a new hundred. What is it?', explanation: '99 + 1 = 100. We cross into a new hundred.',
    choices: [{value:'100',correct:true},{value:'98',correct:false,errorTag:'err_counted_backward'},{value:'99',correct:false,errorTag:'err_repeated_number'},{value:'90',correct:false,errorTag:'err_hundred_transition_error'}] }),
  _l2P(20, { difficulty: 'hard',   keyIdea: _l2KI4, prompt: 'Fill in: 98, 99, ___',       answer: '100', hint: 'What comes after 99?', explanation: '99 + 1 = 100.',
    choices: [{value:'100',correct:true},{value:'99',correct:false,errorTag:'err_repeated_number'},{value:'90',correct:false,errorTag:'err_hundred_transition_error'},{value:'101',correct:false,errorTag:'err_skipped_number'}] }),
  _l2P(21, { difficulty: 'medium', keyIdea: _l2KI5,
    prompt: 'The number line shows 43. Move 1 step forward. Where do you land?',
    visual: { type: 'numberLine', min: 40, max: 47, ticks: [40, 41, 42, 43, 44, 45, 46, 47], mark: 43, jumps: [{ from: 43, to: 44, label: '+1' }] },
    answer: '44', hint: 'Moving right on the number line is counting forward.', explanation: '43 + 1 = 44. One step right from 43 lands on 44.',
    choices: [{value:'44',correct:true},{value:'42',correct:false,errorTag:'err_counted_backward'},{value:'43',correct:false,errorTag:'err_repeated_number'},{value:'45',correct:false,errorTag:'err_skipped_number'}] }),
  _l2P(22, { difficulty: 'hard',   keyIdea: _l2KI5,
    prompt: 'The arrow shows 1 step forward from 99. What number does the arrow point to?',
    visual: { type: 'numberLine', min: 96, max: 103, ticks: [96, 97, 98, 99, 100, 101, 102, 103], mark: 99, jumps: [{ from: 99, to: 100, label: '+1' }] },
    answer: '100', hint: 'Count forward 1 from 99. Remember: after 99 comes 100.', explanation: '99 + 1 = 100. The arrow lands on 100.',
    choices: [{value:'100',correct:true},{value:'98',correct:false,errorTag:'err_counted_backward'},{value:'99',correct:false,errorTag:'err_repeated_number'},{value:'90',correct:false,errorTag:'err_hundred_transition_error'}] })
];

// ─── L1.2: QuizBank (190 questions) ──────────────────────────────────────────

const _l2QuizBank = [

  // ── Block A: "What number comes after N?" easy, N=3–25 (15 q) ──────────────
  _l2Q(1,  {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 3?',  visual:null,answer:'4',  hint:'What is 1 more than 3?',
    choices:[{value:'4',correct:true},{value:'2',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'3',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'5',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(2,  {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 7?',  visual:null,answer:'8',  hint:'What is 1 more than 7?',
    choices:[{value:'8',correct:true},{value:'6',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'7',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'9',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(3,  {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 11?', visual:null,answer:'12', hint:'What is 1 more than 11?',
    choices:[{value:'12',correct:true},{value:'10',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'11',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'13',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(4,  {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 14?', visual:null,answer:'15', hint:'What is 1 more than 14?',
    choices:[{value:'15',correct:true},{value:'13',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'14',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'16',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(5,  {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 16?', visual:null,answer:'17', hint:'What is 1 more than 16?',
    choices:[{value:'17',correct:true},{value:'15',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'16',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'18',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(6,  {keyIdea:_l2KI3,difficulty:'easy',prompt:'What number comes after 19?', visual:null,answer:'20', hint:'After 9 in the ones, the tens go up. What new ten comes after 19?',
    choices:[{value:'20',correct:true},{value:'18',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'19',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'10',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'}],
    intervention:_l2IntTens}),
  _l2Q(7,  {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 20?', visual:null,answer:'21', hint:'What is 1 more than 20?',
    choices:[{value:'21',correct:true},{value:'19',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'20',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'22',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(8,  {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 4?',  visual:null,answer:'5',  hint:'What is 1 more than 4?',
    choices:[{value:'5',correct:true},{value:'3',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'4',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'6',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(9,  {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 8?',  visual:null,answer:'9',  hint:'What is 1 more than 8?',
    choices:[{value:'9',correct:true},{value:'7',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'8',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'10',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(10, {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 13?', visual:null,answer:'14', hint:'What is 1 more than 13?',
    choices:[{value:'14',correct:true},{value:'12',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'13',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'15',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(11, {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 17?', visual:null,answer:'18', hint:'What is 1 more than 17?',
    choices:[{value:'18',correct:true},{value:'16',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'17',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'19',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(12, {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 22?', visual:null,answer:'23', hint:'What is 1 more than 22?',
    choices:[{value:'23',correct:true},{value:'21',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'22',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'24',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(13, {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 24?', visual:null,answer:'25', hint:'What is 1 more than 24?',
    choices:[{value:'25',correct:true},{value:'23',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'24',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'26',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(14, {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 10?', visual:null,answer:'11', hint:'What is 1 more than 10?',
    choices:[{value:'11',correct:true},{value:'9',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'10',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'12',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(15, {keyIdea:_l2KI1,difficulty:'easy',prompt:'What number comes after 25?', visual:null,answer:'26', hint:'What is 1 more than 25?',
    choices:[{value:'26',correct:true},{value:'24',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'25',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'27',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),

  // ── Block B: medium, N=28–90 (18 q) ─────────────────────────────────────────
  _l2Q(16, {keyIdea:_l2KI2,difficulty:'medium',prompt:'What number comes after 28?', visual:null,answer:'29', hint:'What is 1 more than 28?',
    choices:[{value:'29',correct:true},{value:'27',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'28',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'30',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(17, {keyIdea:_l2KI2,difficulty:'medium',prompt:'What number comes after 35?', visual:null,answer:'36', hint:'What is 1 more than 35?',
    choices:[{value:'36',correct:true},{value:'34',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'35',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'37',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(18, {keyIdea:_l2KI2,difficulty:'medium',prompt:'What number comes after 42?', visual:null,answer:'43', hint:'What is 1 more than 42?',
    choices:[{value:'43',correct:true},{value:'41',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'42',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'44',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(19, {keyIdea:_l2KI2,difficulty:'medium',prompt:'What number comes after 50?', visual:null,answer:'51', hint:'What is 1 more than 50?',
    choices:[{value:'51',correct:true},{value:'49',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'50',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'52',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(20, {keyIdea:_l2KI2,difficulty:'medium',prompt:'What number comes after 58?', visual:null,answer:'59', hint:'What is 1 more than 58?',
    choices:[{value:'59',correct:true},{value:'57',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'58',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'60',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(21, {keyIdea:_l2KI2,difficulty:'medium',prompt:'What number comes after 63?', visual:null,answer:'64', hint:'What is 1 more than 63?',
    choices:[{value:'64',correct:true},{value:'62',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'63',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'65',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(22, {keyIdea:_l2KI2,difficulty:'medium',prompt:'What number comes after 71?', visual:null,answer:'72', hint:'What is 1 more than 71?',
    choices:[{value:'72',correct:true},{value:'70',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'71',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'73',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(23, {keyIdea:_l2KI2,difficulty:'medium',prompt:'What number comes after 76?', visual:null,answer:'77', hint:'What is 1 more than 76?',
    choices:[{value:'77',correct:true},{value:'75',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'76',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'78',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(24, {keyIdea:_l2KI2,difficulty:'medium',prompt:'What number comes after 83?', visual:null,answer:'84', hint:'What is 1 more than 83?',
    choices:[{value:'84',correct:true},{value:'82',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'83',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'85',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(25, {keyIdea:_l2KI2,difficulty:'medium',prompt:'What number comes after 88?', visual:null,answer:'89', hint:'What is 1 more than 88?',
    choices:[{value:'89',correct:true},{value:'87',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'88',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'90',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(26, {keyIdea:_l2KI5,difficulty:'medium',prompt:'Count forward one step from 30. What number do you reach?',
    visual:{type:'numberLine',min:28,max:34,ticks:[28,29,30,31,32,33,34],mark:30,jumps:[{from:30,to:31,label:'+1'}]},
    answer:'31', hint:'Look at the number line. Move 1 step to the right from 30.',
    choices:[{value:'31',correct:true},{value:'29',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left instead of right'},{value:'30',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'32',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(27, {keyIdea:_l2KI5,difficulty:'medium',prompt:'Count forward one step from 47. What number do you reach?',
    visual:{type:'numberLine',min:45,max:51,ticks:[45,46,47,48,49,50,51],mark:47,jumps:[{from:47,to:48,label:'+1'}]},
    answer:'48', hint:'Look at the number line. Move 1 step to the right from 47.',
    choices:[{value:'48',correct:true},{value:'46',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left instead of right'},{value:'47',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'49',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(28, {keyIdea:_l2KI5,difficulty:'medium',prompt:'Count forward one step from 55. What number do you reach?',
    visual:{type:'numberLine',min:53,max:59,ticks:[53,54,55,56,57,58,59],mark:55,jumps:[{from:55,to:56,label:'+1'}]},
    answer:'56', hint:'Look at the number line. Move 1 step to the right from 55.',
    choices:[{value:'56',correct:true},{value:'54',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left instead of right'},{value:'55',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'57',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(29, {keyIdea:_l2KI5,difficulty:'medium',prompt:'Count forward one step from 66. What number do you reach?',
    visual:{type:'numberLine',min:64,max:70,ticks:[64,65,66,67,68,69,70],mark:66,jumps:[{from:66,to:67,label:'+1'}]},
    answer:'67', hint:'Look at the number line. Move 1 step to the right from 66.',
    choices:[{value:'67',correct:true},{value:'65',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left instead of right'},{value:'66',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'68',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(30, {keyIdea:_l2KI5,difficulty:'medium',prompt:'Count forward one step from 74. What number do you reach?',
    visual:{type:'numberLine',min:72,max:78,ticks:[72,73,74,75,76,77,78],mark:74,jumps:[{from:74,to:75,label:'+1'}]},
    answer:'75', hint:'Look at the number line. Move 1 step to the right from 74.',
    choices:[{value:'75',correct:true},{value:'73',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left instead of right'},{value:'74',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'76',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(31, {keyIdea:_l2KI5,difficulty:'medium',prompt:'Count forward one step from 80. What number do you reach?',
    visual:{type:'numberLine',min:78,max:84,ticks:[78,79,80,81,82,83,84],mark:80,jumps:[{from:80,to:81,label:'+1'}]},
    answer:'81', hint:'Look at the number line. Move 1 step to the right from 80.',
    choices:[{value:'81',correct:true},{value:'79',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left instead of right'},{value:'80',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'82',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(32, {keyIdea:_l2KI5,difficulty:'medium',prompt:'Count forward one step from 86. What number do you reach?',
    visual:{type:'numberLine',min:84,max:90,ticks:[84,85,86,87,88,89,90],mark:86,jumps:[{from:86,to:87,label:'+1'}]},
    answer:'87', hint:'Look at the number line. Move 1 step to the right from 86.',
    choices:[{value:'87',correct:true},{value:'85',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left instead of right'},{value:'86',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'88',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(33, {keyIdea:_l2KI5,difficulty:'medium',prompt:'Count forward one step from 90. What number do you reach?',
    visual:{type:'numberLine',min:88,max:94,ticks:[88,89,90,91,92,93,94],mark:90,jumps:[{from:90,to:91,label:'+1'}]},
    answer:'91', hint:'Look at the number line. Move 1 step to the right from 90.',
    choices:[{value:'91',correct:true},{value:'89',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left instead of right'},{value:'90',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'92',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),

  // ── Block C: hard, N=92–120 (10 q) ──────────────────────────────────────────
  _l2Q(34, {keyIdea:_l2KI2,difficulty:'hard',prompt:'What number comes after 92?',  visual:null,answer:'93',  hint:'What is 1 more than 92?',
    choices:[{value:'93',correct:true},{value:'91',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'92',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'94',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(35, {keyIdea:_l2KI2,difficulty:'hard',prompt:'What number comes after 95?',  visual:null,answer:'96',  hint:'What is 1 more than 95?',
    choices:[{value:'96',correct:true},{value:'94',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'95',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'97',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(36, {keyIdea:_l2KI2,difficulty:'hard',prompt:'What number comes after 101?', visual:null,answer:'102', hint:'What is 1 more than 101?',
    choices:[{value:'102',correct:true},{value:'100',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'103',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(37, {keyIdea:_l2KI2,difficulty:'hard',prompt:'What number comes after 107?', visual:null,answer:'108', hint:'What is 1 more than 107?',
    choices:[{value:'108',correct:true},{value:'106',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'107',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'109',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(38, {keyIdea:_l2KI2,difficulty:'hard',prompt:'What number comes after 110?', visual:null,answer:'111', hint:'What is 1 more than 110?',
    choices:[{value:'111',correct:true},{value:'109',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'110',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'112',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(39, {keyIdea:_l2KI2,difficulty:'hard',prompt:'What number comes after 113?', visual:null,answer:'114', hint:'What is 1 more than 113?',
    choices:[{value:'114',correct:true},{value:'112',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'113',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'115',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(40, {keyIdea:_l2KI2,difficulty:'hard',prompt:'What number comes after 116?', visual:null,answer:'117', hint:'What is 1 more than 116?',
    choices:[{value:'117',correct:true},{value:'115',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'116',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'118',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(41, {keyIdea:_l2KI2,difficulty:'hard',prompt:'What number comes after 118?', visual:null,answer:'119', hint:'What is 1 more than 118?',
    choices:[{value:'119',correct:true},{value:'117',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'118',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'120',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(42, {keyIdea:_l2KI2,difficulty:'hard',prompt:'What number comes after 119?', visual:null,answer:'120', hint:'What is 1 more than 119?',
    choices:[{value:'120',correct:true},{value:'118',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'119',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'121',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(43, {keyIdea:_l2KI2,difficulty:'hard',prompt:'What number comes after 115?', visual:null,answer:'116', hint:'What is 1 more than 115?',
    choices:[{value:'116',correct:true},{value:'114',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'115',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'117',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),

  // ── Block D: fill-in missing number, easy, N=1–25 (15 q) ────────────────────
  _l2Q(44, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 3, ___, 5',   visual:null,answer:'4',  hint:'What comes after 3?',
    choices:[{value:'4',correct:true},{value:'3',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'5',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'2',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(45, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 7, ___, 9',   visual:null,answer:'8',  hint:'What comes after 7?',
    choices:[{value:'8',correct:true},{value:'7',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'9',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'6',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(46, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 11, ___, 13', visual:null,answer:'12', hint:'What comes after 11?',
    choices:[{value:'12',correct:true},{value:'11',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'13',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'10',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(47, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 14, ___, 16', visual:null,answer:'15', hint:'What comes after 14?',
    choices:[{value:'15',correct:true},{value:'14',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'16',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'13',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(48, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 16, ___, 18', visual:null,answer:'17', hint:'What comes after 16?',
    choices:[{value:'17',correct:true},{value:'16',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'18',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'15',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(49, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 21, ___, 23', visual:null,answer:'22', hint:'What comes after 21?',
    choices:[{value:'22',correct:true},{value:'21',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'23',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'20',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(50, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 12, ___, 14', visual:null,answer:'13', hint:'What comes after 12?',
    choices:[{value:'13',correct:true},{value:'12',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'14',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'11',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(51, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 5, ___, 7',   visual:null,answer:'6',  hint:'What comes after 5?',
    choices:[{value:'6',correct:true},{value:'5',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'7',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'4',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(52, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 8, ___, 10',  visual:null,answer:'9',  hint:'What comes after 8?',
    choices:[{value:'9',correct:true},{value:'8',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'10',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'7',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(53, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 22, ___, 24', visual:null,answer:'23', hint:'What comes after 22?',
    choices:[{value:'23',correct:true},{value:'22',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'24',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'21',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(54, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 2, ___, 4',   visual:null,answer:'3',  hint:'What comes after 2?',
    choices:[{value:'3',correct:true},{value:'2',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'4',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'1',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(55, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 4, 5, ___',   visual:null,answer:'6',  hint:'What comes after 5?',
    choices:[{value:'6',correct:true},{value:'5',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'4',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'7',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(56, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 6, 7, ___',   visual:null,answer:'8',  hint:'What comes after 7?',
    choices:[{value:'8',correct:true},{value:'7',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'6',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'9',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(57, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 17, ___, 19', visual:null,answer:'18', hint:'What comes after 17?',
    choices:[{value:'18',correct:true},{value:'17',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'19',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'16',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(58, {keyIdea:_l2KI1,difficulty:'easy',prompt:'Fill in: 23, ___, 25', visual:null,answer:'24', hint:'What comes after 23?',
    choices:[{value:'24',correct:true},{value:'23',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'25',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'22',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),

  // ── Block E: fill-in missing number, medium, N=26–90 (15 q) ─────────────────
  _l2Q(59, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 26, ___, 28', visual:null,answer:'27', hint:'What comes after 26?',
    choices:[{value:'27',correct:true},{value:'26',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'28',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'25',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(60, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 33, ___, 35', visual:null,answer:'34', hint:'What comes after 33?',
    choices:[{value:'34',correct:true},{value:'33',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'35',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'32',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(61, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 41, ___, 43', visual:null,answer:'42', hint:'What comes after 41?',
    choices:[{value:'42',correct:true},{value:'41',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'43',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'40',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(62, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 53, ___, 55', visual:null,answer:'54', hint:'What comes after 53?',
    choices:[{value:'54',correct:true},{value:'53',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'55',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'52',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(63, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 62, ___, 64', visual:null,answer:'63', hint:'What comes after 62?',
    choices:[{value:'63',correct:true},{value:'62',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'64',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'61',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(64, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 70, ___, 72', visual:null,answer:'71', hint:'What comes after 70?',
    choices:[{value:'71',correct:true},{value:'70',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'72',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'69',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(65, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 75, ___, 77', visual:null,answer:'76', hint:'What comes after 75?',
    choices:[{value:'76',correct:true},{value:'75',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'77',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'74',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(66, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 82, ___, 84', visual:null,answer:'83', hint:'What comes after 82?',
    choices:[{value:'83',correct:true},{value:'82',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'84',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'81',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(67, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 87, ___, 89', visual:null,answer:'88', hint:'What comes after 87?',
    choices:[{value:'88',correct:true},{value:'87',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'89',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'86',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(68, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 44, 45, ___', visual:null,answer:'46', hint:'What comes after 45?',
    choices:[{value:'46',correct:true},{value:'45',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'44',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'47',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(69, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 57, 58, ___', visual:null,answer:'59', hint:'What comes after 58?',
    choices:[{value:'59',correct:true},{value:'58',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'57',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'60',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(70, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 66, 67, ___', visual:null,answer:'68', hint:'What comes after 67?',
    choices:[{value:'68',correct:true},{value:'67',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'66',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'69',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(71, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 78, ___, 80', visual:null,answer:'79', hint:'What comes after 78?',
    choices:[{value:'79',correct:true},{value:'78',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'80',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'77',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(72, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 84, 85, ___', visual:null,answer:'86', hint:'What comes after 85?',
    choices:[{value:'86',correct:true},{value:'85',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'84',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'87',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(73, {keyIdea:_l2KI2,difficulty:'medium',prompt:'Fill in: 47, ___, 49', visual:null,answer:'48', hint:'What comes after 47?',
    choices:[{value:'48',correct:true},{value:'47',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'49',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'46',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),


  // ── Block F: fill-in hard, N=91–120 (10 q) ───────────────────────────────
  _l2Q(74, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 93, ___, 95',    visual:null,answer:'94',  hint:'What comes after 93?',
    choices:[{value:'94',correct:true},{value:'93',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'95',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'92',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(75, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 97, ___, 99',    visual:null,answer:'98',  hint:'What comes after 97?',
    choices:[{value:'98',correct:true},{value:'97',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'99',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'96',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(76, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 103, ___, 105',  visual:null,answer:'104', hint:'What comes after 103?',
    choices:[{value:'104',correct:true},{value:'103',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'105',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'102',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(77, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 108, ___, 110',  visual:null,answer:'109', hint:'What comes after 108?',
    choices:[{value:'109',correct:true},{value:'108',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'110',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'107',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(78, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 112, ___, 114',  visual:null,answer:'113', hint:'What comes after 112?',
    choices:[{value:'113',correct:true},{value:'112',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'114',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'111',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(79, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 116, ___, 118',  visual:null,answer:'117', hint:'What comes after 116?',
    choices:[{value:'117',correct:true},{value:'116',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'118',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'115',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(80, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 91, 92, ___',    visual:null,answer:'93',  hint:'What comes after 92?',
    choices:[{value:'93',correct:true},{value:'92',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'91',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'94',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(81, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 106, 107, ___',  visual:null,answer:'108', hint:'What comes after 107?',
    choices:[{value:'108',correct:true},{value:'107',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'106',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'109',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(82, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 114, 115, ___',  visual:null,answer:'116', hint:'What comes after 115?',
    choices:[{value:'116',correct:true},{value:'115',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'114',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'117',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(83, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 117, ___, 119',  visual:null,answer:'118', hint:'What comes after 117?',
    choices:[{value:'118',correct:true},{value:'117',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'119',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'116',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),

  // ── Block G: across-ten transitions (30 q) ───────────────────────────────
  // 19→20 (3 q)
  _l2Q(84,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'Count forward: 17, 18, 19, ___',         visual:null,answer:'20', hint:'After 19 comes a new ten. The ones digit resets to 0.',
    choices:[{value:'20',correct:true},{value:'18',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward from 19'},{value:'19',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 19 instead of moving forward'},{value:'10',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'}],
    intervention:_l2IntTens}),
  _l2Q(85,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 18, 19, ___',                 visual:null,answer:'20', hint:'After 19 comes a new ten.',
    choices:[{value:'20',correct:true},{value:'19',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'10',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'21',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(86,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 19, ___, 21',                 visual:null,answer:'20', hint:'What comes between 19 and 21?',
    choices:[{value:'20',correct:true},{value:'19',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'21',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'18',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  // 29→30 (4 q)
  _l2Q(87,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'What number comes after 29?',          visual:null,answer:'30', hint:'After 9 in the ones, a new ten starts.',
    choices:[{value:'30',correct:true},{value:'28',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'20',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'31',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(88,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 28, 29, ___',                 visual:null,answer:'30', hint:'After 29 comes a new ten.',
    choices:[{value:'30',correct:true},{value:'29',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'20',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'31',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(89,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 29, ___, 31',                 visual:null,answer:'30', hint:'What comes between 29 and 31?',
    choices:[{value:'30',correct:true},{value:'29',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'31',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'28',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(90,  {keyIdea:_l2KI3,difficulty:'hard',prompt:'Fill in: 27, 28, 29, ___, 31',           visual:null,answer:'30', hint:'The blank is right after 29. What new ten comes next?',
    choices:[{value:'30',correct:true},{value:'29',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'20',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'31',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l2IntTens}),
  // 39→40 (4 q)
  _l2Q(91,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'What number comes after 39?',          visual:null,answer:'40', hint:'After 9 in the ones, a new ten starts.',
    choices:[{value:'40',correct:true},{value:'38',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'30',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'41',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(92,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 38, 39, ___',                 visual:null,answer:'40', hint:'After 39 comes a new ten.',
    choices:[{value:'40',correct:true},{value:'39',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'30',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'41',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(93,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 39, ___, 41',                 visual:null,answer:'40', hint:'What comes between 39 and 41?',
    choices:[{value:'40',correct:true},{value:'39',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'41',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'38',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(94,  {keyIdea:_l2KI3,difficulty:'hard',prompt:'Fill in: 37, 38, 39, ___, 41',           visual:null,answer:'40', hint:'The blank is right after 39. What new ten comes next?',
    choices:[{value:'40',correct:true},{value:'39',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'30',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'41',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l2IntTens}),
  // 49→50 (4 q)
  _l2Q(95,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'What number comes after 49?',          visual:null,answer:'50', hint:'After 9 in the ones, a new ten starts.',
    choices:[{value:'50',correct:true},{value:'48',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'40',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'51',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(96,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 48, 49, ___',                 visual:null,answer:'50', hint:'After 49 comes a new ten.',
    choices:[{value:'50',correct:true},{value:'49',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'40',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'51',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(97,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 49, ___, 51',                 visual:null,answer:'50', hint:'What comes between 49 and 51?',
    choices:[{value:'50',correct:true},{value:'49',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'51',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'48',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(98,  {keyIdea:_l2KI3,difficulty:'hard',prompt:'Fill in: 47, 48, 49, ___, 51',           visual:null,answer:'50', hint:'The blank is right after 49. What new ten comes next?',
    choices:[{value:'50',correct:true},{value:'49',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'40',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'51',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l2IntTens}),
  // 59→60 (3 q)
  _l2Q(99,  {keyIdea:_l2KI3,difficulty:'medium',prompt:'What number comes after 59?',          visual:null,answer:'60', hint:'After 9 in the ones, a new ten starts.',
    choices:[{value:'60',correct:true},{value:'58',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'50',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'61',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(100, {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 58, 59, ___',                 visual:null,answer:'60', hint:'After 59 comes a new ten.',
    choices:[{value:'60',correct:true},{value:'59',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'50',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'61',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(101, {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 59, ___, 61',                 visual:null,answer:'60', hint:'What comes between 59 and 61?',
    choices:[{value:'60',correct:true},{value:'59',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'61',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'58',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  // 69→70 (4 q)
  _l2Q(102, {keyIdea:_l2KI3,difficulty:'medium',prompt:'What number comes after 69?',          visual:null,answer:'70', hint:'After 9 in the ones, a new ten starts.',
    choices:[{value:'70',correct:true},{value:'68',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'60',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'71',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(103, {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 68, 69, ___',                 visual:null,answer:'70', hint:'After 69 comes a new ten.',
    choices:[{value:'70',correct:true},{value:'69',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'60',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'71',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(104, {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 69, ___, 71',                 visual:null,answer:'70', hint:'What comes between 69 and 71?',
    choices:[{value:'70',correct:true},{value:'69',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'71',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'68',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(105, {keyIdea:_l2KI3,difficulty:'hard',prompt:'Fill in: 67, 68, 69, ___, 71',           visual:null,answer:'70', hint:'The blank is right after 69. What new ten comes next?',
    choices:[{value:'70',correct:true},{value:'69',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'60',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'71',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l2IntTens}),
  // 79→80 (4 q)
  _l2Q(106, {keyIdea:_l2KI3,difficulty:'medium',prompt:'What number comes after 79?',          visual:null,answer:'80', hint:'After 9 in the ones, a new ten starts.',
    choices:[{value:'80',correct:true},{value:'78',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'70',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'81',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(107, {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 78, 79, ___',                 visual:null,answer:'80', hint:'After 79 comes a new ten.',
    choices:[{value:'80',correct:true},{value:'79',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'70',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'81',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(108, {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 79, ___, 81',                 visual:null,answer:'80', hint:'What comes between 79 and 81?',
    choices:[{value:'80',correct:true},{value:'79',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'81',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'78',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(109, {keyIdea:_l2KI3,difficulty:'hard',prompt:'Fill in: 77, 78, 79, ___, 81',           visual:null,answer:'80', hint:'The blank is right after 79. What new ten comes next?',
    choices:[{value:'80',correct:true},{value:'79',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'70',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'81',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l2IntTens}),
  // 89→90 (4 q)
  _l2Q(110, {keyIdea:_l2KI3,difficulty:'medium',prompt:'What number comes after 89?',          visual:null,answer:'90', hint:'After 9 in the ones, a new ten starts.',
    choices:[{value:'90',correct:true},{value:'88',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'80',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'91',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(111, {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 88, 89, ___',                 visual:null,answer:'90', hint:'After 89 comes a new ten.',
    choices:[{value:'90',correct:true},{value:'89',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'80',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'91',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(112, {keyIdea:_l2KI3,difficulty:'medium',prompt:'Fill in: 89, ___, 91',                 visual:null,answer:'90', hint:'What comes between 89 and 91?',
    choices:[{value:'90',correct:true},{value:'89',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'91',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'88',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(113, {keyIdea:_l2KI3,difficulty:'hard',prompt:'Fill in: 87, 88, 89, ___, 91',           visual:null,answer:'90', hint:'The blank is right after 89. What new ten comes next?',
    choices:[{value:'90',correct:true},{value:'89',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'80',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'91',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l2IntTens}),

  // ── Block H: across 99→100, all hard (20 q) ──────────────────────────────
  _l2Q(114, {keyIdea:_l2KI4,difficulty:'hard',prompt:'What number comes after 99?',
    visual:null,answer:'100', hint:'After 99 comes a new hundred.',
    choices:[{value:'100',correct:true},{value:'98',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'90',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Reset to wrong hundred'}],
    intervention:_l2IntHundred}),
  _l2Q(115, {keyIdea:_l2KI4,difficulty:'hard',prompt:'Fill in: 98, 99, ___',
    visual:null,answer:'100', hint:'After 99 comes 100.',
    choices:[{value:'100',correct:true},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Reset to wrong hundred'},{value:'101',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntHundred}),
  _l2Q(116, {keyIdea:_l2KI4,difficulty:'hard',prompt:'Fill in: 97, 98, 99, ___',
    visual:null,answer:'100', hint:'Count forward one more from 99.',
    choices:[{value:'100',correct:true},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Reset to wrong hundred'},{value:'200',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Jumped to wrong hundred'}],
    intervention:_l2IntHundred}),
  _l2Q(117, {keyIdea:_l2KI4,difficulty:'hard',prompt:'Count forward: 98, ___, 100',
    visual:null,answer:'99',  hint:'The blank is between 98 and 100. What comes after 98?',
    choices:[{value:'99',correct:true},{value:'100',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'98',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'97',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(118, {keyIdea:_l2KI4,difficulty:'hard',prompt:'Fill in: 99, 100, ___',
    visual:null,answer:'101', hint:'Count forward one more from 100.',
    choices:[{value:'101',correct:true},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'99',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'102',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(119, {keyIdea:_l2KI4,difficulty:'hard',prompt:'Fill in: 99, ___, 101',
    visual:null,answer:'100', hint:'After 99 comes 100.',
    choices:[{value:'100',correct:true},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'101',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'90',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Reset to wrong hundred'}],
    intervention:_l2IntHundred}),
  _l2Q(120, {keyIdea:_l2KI5,difficulty:'hard',prompt:'The number line shows 99. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:97,max:104,ticks:[97,98,99,100,101,102,103,104],mark:99,jumps:[{from:99,to:100,label:'+1'}]},
    answer:'100', hint:'Moving right is counting forward.',
    choices:[{value:'100',correct:true},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'98',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'90',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Reset to wrong hundred'}],
    intervention:_l2IntHundred}),
  _l2Q(121, {keyIdea:_l2KI5,difficulty:'hard',prompt:'The arrow shows 1 step forward from 99. What number does the arrow point to?',
    visual:{type:'numberLine',min:98,max:105,ticks:[98,99,100,101,102,103,104,105],mark:99,jumps:[{from:99,to:100,label:'+1'}]},
    answer:'100', hint:'Follow the arrow one step to the right.',
    choices:[{value:'100',correct:true},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed on 99'},{value:'98',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'200',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Jumped to wrong hundred'}],
    intervention:_l2IntHundred}),
  _l2Q(122, {keyIdea:_l2KI5,difficulty:'hard',prompt:'The number line shows 100. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:97,max:104,ticks:[97,98,99,100,101,102,103,104],mark:100,jumps:[{from:100,to:101,label:'+1'}]},
    answer:'101', hint:'Moving right is counting forward.',
    choices:[{value:'101',correct:true},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'99',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'200',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Jumped to wrong hundred'}],
    intervention:_l2IntHundred}),
  _l2Q(123, {keyIdea:_l2KI5,difficulty:'hard',prompt:'The number line shows 99. Count forward 1 number. What do you get?',
    visual:{type:'numberLine',min:96,max:103,ticks:[96,97,98,99,100,101,102,103],mark:99},
    answer:'100', hint:'Count forward means +1.',
    choices:[{value:'100',correct:true},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move forward'},{value:'98',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'90',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Reset to wrong hundred'}],
    intervention:_l2IntHundred}),
  _l2Q(124, {keyIdea:_l2KI4,difficulty:'hard',prompt:'Count forward: 100, 101, ___',
    visual:null,answer:'102', hint:'What comes after 101?',
    choices:[{value:'102',correct:true},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'100',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'103',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(125, {keyIdea:_l2KI3,difficulty:'hard',prompt:'What number comes after 109?',
    visual:null,answer:'110', hint:'After 109 comes a new ten.',
    choices:[{value:'110',correct:true},{value:'108',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'109',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'100',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'}],
    intervention:_l2IntTens}),
  _l2Q(126, {keyIdea:_l2KI3,difficulty:'hard',prompt:'Fill in: 108, 109, ___, 111',
    visual:null,answer:'110', hint:'After 109 comes a new ten.',
    choices:[{value:'110',correct:true},{value:'109',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'100',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'112',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(127, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 119, ___, 121',
    visual:null,answer:'120', hint:'What number goes between 119 and 121?',
    choices:[{value:'120',correct:true},{value:'119',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 119 instead of moving forward'},{value:'110',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'121',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into the blank slot'}],
    intervention:_l2IntSeq}),
  _l2Q(128, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 118, 119, ___',
    visual:null,answer:'120', hint:'After 119 comes 120.',
    choices:[{value:'120',correct:true},{value:'119',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'110',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'121',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(129, {keyIdea:_l2KI4,difficulty:'hard',prompt:'Fill in: 99, 100, 101, ___',
    visual:null,answer:'102', hint:'Count forward one more from 101.',
    choices:[{value:'102',correct:true},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'100',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'103',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(130, {keyIdea:_l2KI4,difficulty:'hard',prompt:'Count forward: 97, 98, ___, 100',
    visual:null,answer:'99',  hint:'The blank is between 98 and 100.',
    choices:[{value:'99',correct:true},{value:'100',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'98',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'97',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(131, {keyIdea:_l2KI4,difficulty:'hard',prompt:'Fill in: 100, ___, 102',
    visual:null,answer:'101', hint:'What comes after 100?',
    choices:[{value:'101',correct:true},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'102',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'99',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(132, {keyIdea:_l2KI3,difficulty:'hard',prompt:'Fill in: 109, ___, 111',
    visual:null,answer:'110', hint:'What comes after 109?',
    choices:[{value:'110',correct:true},{value:'109',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'111',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C into blank'},{value:'108',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(133, {keyIdea:_l2KI2,difficulty:'hard',prompt:'Fill in: 116, 117, 118, 119, ___',
    visual:null,answer:'120', hint:'Count forward one more from 119.',
    choices:[{value:'120',correct:true},{value:'119',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'118',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'121',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),

  // ── Block I: number line movement (27 q) ────────────────────────────────────
  // i-001 to i-015: "The number line shows N. Move 1 step forward." medium
  _l2Q(134, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 12. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:9, max:16,ticks:[9,10,11,12,13,14,15,16],mark:12,jumps:[{from:12,to:13,label:'+1'}]},
    answer:'13', hint:'One step right = one more.',
    choices:[{value:'13',correct:true},{value:'11',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'12',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'14',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(135, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 18. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:15,max:22,ticks:[15,16,17,18,19,20,21,22],mark:18,jumps:[{from:18,to:19,label:'+1'}]},
    answer:'19', hint:'One step right = one more.',
    choices:[{value:'19',correct:true},{value:'17',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'18',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'20',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(136, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 24. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:21,max:28,ticks:[21,22,23,24,25,26,27,28],mark:24,jumps:[{from:24,to:25,label:'+1'}]},
    answer:'25', hint:'One step right = one more.',
    choices:[{value:'25',correct:true},{value:'23',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'24',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'26',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(137, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 31. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:28,max:35,ticks:[28,29,30,31,32,33,34,35],mark:31,jumps:[{from:31,to:32,label:'+1'}]},
    answer:'32', hint:'One step right = one more.',
    choices:[{value:'32',correct:true},{value:'30',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'31',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'33',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(138, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 36. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:33,max:40,ticks:[33,34,35,36,37,38,39,40],mark:36,jumps:[{from:36,to:37,label:'+1'}]},
    answer:'37', hint:'One step right = one more.',
    choices:[{value:'37',correct:true},{value:'35',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'36',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'38',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(139, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 43. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:40,max:47,ticks:[40,41,42,43,44,45,46,47],mark:43,jumps:[{from:43,to:44,label:'+1'}]},
    answer:'44', hint:'One step right = one more.',
    choices:[{value:'44',correct:true},{value:'42',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'43',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'45',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(140, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 49. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:46,max:53,ticks:[46,47,48,49,50,51,52,53],mark:49,jumps:[{from:49,to:50,label:'+1'}]},
    answer:'50', hint:'After 49 the ones reset and a new ten starts.',
    choices:[{value:'50',correct:true},{value:'48',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'49',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'40',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'}],
    intervention:_l2IntTens}),
  _l2Q(141, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 55. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:52,max:59,ticks:[52,53,54,55,56,57,58,59],mark:55,jumps:[{from:55,to:56,label:'+1'}]},
    answer:'56', hint:'One step right = one more.',
    choices:[{value:'56',correct:true},{value:'54',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'55',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'57',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(142, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 61. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:58,max:65,ticks:[58,59,60,61,62,63,64,65],mark:61,jumps:[{from:61,to:62,label:'+1'}]},
    answer:'62', hint:'One step right = one more.',
    choices:[{value:'62',correct:true},{value:'60',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'61',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'63',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(143, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 67. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:64,max:71,ticks:[64,65,66,67,68,69,70,71],mark:67,jumps:[{from:67,to:68,label:'+1'}]},
    answer:'68', hint:'One step right = one more.',
    choices:[{value:'68',correct:true},{value:'66',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'67',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'69',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(144, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 72. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:69,max:76,ticks:[69,70,71,72,73,74,75,76],mark:72,jumps:[{from:72,to:73,label:'+1'}]},
    answer:'73', hint:'One step right = one more.',
    choices:[{value:'73',correct:true},{value:'71',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'72',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'74',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(145, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 79. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:76,max:83,ticks:[76,77,78,79,80,81,82,83],mark:79,jumps:[{from:79,to:80,label:'+1'}]},
    answer:'80', hint:'After 79 the ones reset and a new ten starts.',
    choices:[{value:'80',correct:true},{value:'78',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'79',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'70',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'}],
    intervention:_l2IntTens}),
  _l2Q(146, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 84. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:81,max:88,ticks:[81,82,83,84,85,86,87,88],mark:84,jumps:[{from:84,to:85,label:'+1'}]},
    answer:'85', hint:'One step right = one more.',
    choices:[{value:'85',correct:true},{value:'83',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'84',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'86',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(147, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 89. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:86,max:93,ticks:[86,87,88,89,90,91,92,93],mark:89,jumps:[{from:89,to:90,label:'+1'}]},
    answer:'90', hint:'After 89 the ones reset and a new ten starts.',
    choices:[{value:'90',correct:true},{value:'88',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'89',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'80',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'}],
    intervention:_l2IntTens}),
  _l2Q(148, {keyIdea:_l2KI5,difficulty:'medium',prompt:'The number line shows 95. Move 1 step forward. Where do you land?',
    visual:{type:'numberLine',min:92,max:99,ticks:[92,93,94,95,96,97,98,99],mark:95,jumps:[{from:95,to:96,label:'+1'}]},
    answer:'96', hint:'One step right = one more.',
    choices:[{value:'96',correct:true},{value:'94',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'95',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'97',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  // i-016 to i-027: "What number does the arrow land on?" hard
  _l2Q(149, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:38,max:45,ticks:[38,39,40,41,42,43,44,45],mark:41,jumps:[{from:41,to:42,label:'+1'}]},
    answer:'42', hint:'Follow the arrow one step right.',
    choices:[{value:'42',correct:true},{value:'40',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'41',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'43',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(150, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:44,max:51,ticks:[44,45,46,47,48,49,50,51],mark:47,jumps:[{from:47,to:48,label:'+1'}]},
    answer:'48', hint:'Follow the arrow one step right.',
    choices:[{value:'48',correct:true},{value:'46',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'47',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'49',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(151, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:51,max:58,ticks:[51,52,53,54,55,56,57,58],mark:54,jumps:[{from:54,to:55,label:'+1'}]},
    answer:'55', hint:'Follow the arrow one step right.',
    choices:[{value:'55',correct:true},{value:'53',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'54',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'56',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(152, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:56,max:63,ticks:[56,57,58,59,60,61,62,63],mark:59,jumps:[{from:59,to:60,label:'+1'}]},
    answer:'60', hint:'After 59 comes a new ten.',
    choices:[{value:'60',correct:true},{value:'58',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'59',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'50',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'}],
    intervention:_l2IntTens}),
  _l2Q(153, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:62,max:69,ticks:[62,63,64,65,66,67,68,69],mark:65,jumps:[{from:65,to:66,label:'+1'}]},
    answer:'66', hint:'Follow the arrow one step right.',
    choices:[{value:'66',correct:true},{value:'64',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'65',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'67',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(154, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:66,max:73,ticks:[66,67,68,69,70,71,72,73],mark:69,jumps:[{from:69,to:70,label:'+1'}]},
    answer:'70', hint:'After 69 comes a new ten.',
    choices:[{value:'70',correct:true},{value:'68',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'69',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'60',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'}],
    intervention:_l2IntTens}),
  _l2Q(155, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:70,max:77,ticks:[70,71,72,73,74,75,76,77],mark:73,jumps:[{from:73,to:74,label:'+1'}]},
    answer:'74', hint:'Follow the arrow one step right.',
    choices:[{value:'74',correct:true},{value:'72',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'73',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'75',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(156, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:75,max:82,ticks:[75,76,77,78,79,80,81,82],mark:78,jumps:[{from:78,to:79,label:'+1'}]},
    answer:'79', hint:'Follow the arrow one step right.',
    choices:[{value:'79',correct:true},{value:'77',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'78',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'80',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(157, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:96,max:103,ticks:[96,97,98,99,100,101,102,103],mark:99,jumps:[{from:99,to:100,label:'+1'}]},
    answer:'100', hint:'After 99 comes 100.',
    choices:[{value:'100',correct:true},{value:'98',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'90',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Reset to wrong hundred'}],
    intervention:_l2IntHundred}),
  _l2Q(158, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:97,max:104,ticks:[97,98,99,100,101,102,103,104],mark:100,jumps:[{from:100,to:101,label:'+1'}]},
    answer:'101', hint:'Count forward one from 100.',
    choices:[{value:'101',correct:true},{value:'99',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'200',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Jumped to wrong hundred'}],
    intervention:_l2IntHundred}),
  _l2Q(159, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:107,max:114,ticks:[107,108,109,110,111,112,113,114],mark:110,jumps:[{from:110,to:111,label:'+1'}]},
    answer:'111', hint:'Follow the arrow one step right.',
    choices:[{value:'111',correct:true},{value:'109',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'110',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'112',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(160, {keyIdea:_l2KI5,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',min:112,max:119,ticks:[112,113,114,115,116,117,118,119],mark:115,jumps:[{from:115,to:116,label:'+1'}]},
    answer:'116', hint:'Follow the arrow one step right.',
    choices:[{value:'116',correct:true},{value:'114',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Moved left'},{value:'115',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Stayed at start'},{value:'117',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),

  // ── Block J: mixed review (30 q) ─────────────────────────────────────────
  _l2Q(161, {keyIdea:_l2KI1,difficulty:'easy',  prompt:'Fill in: 8, 9, ___, 11', visual:null,answer:'10', hint:'What comes after 9?',
    choices:[{value:'10',correct:true},{value:'9',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'11',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'8',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(162, {keyIdea:_l2KI1,difficulty:'easy',  prompt:'What number comes after 27?', visual:null,answer:'28', hint:'What is 1 more than 27?',
    choices:[{value:'28',correct:true},{value:'26',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'27',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'29',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(163, {keyIdea:_l2KI2,difficulty:'medium', prompt:'Fill in: 44, 45, ___, 47', visual:null,answer:'46', hint:'What comes after 45?',
    choices:[{value:'46',correct:true},{value:'45',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'47',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'44',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(164, {keyIdea:_l2KI3,difficulty:'medium', prompt:'Count forward from 69: 69, ___', visual:null,answer:'70', hint:'After 69 comes a new ten.',
    choices:[{value:'70',correct:true},{value:'68',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'69',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'60',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'}],
    intervention:_l2IntTens}),
  _l2Q(165, {keyIdea:_l2KI2,difficulty:'easy',   prompt:'Fill in: 51, 52, ___, 54', visual:null,answer:'53', hint:'What comes after 52?',
    choices:[{value:'53',correct:true},{value:'52',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'54',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'51',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(166, {keyIdea:_l2KI3,difficulty:'medium', prompt:'What number comes next? 78, 79, ___', visual:null,answer:'80', hint:'After 79 comes a new ten.',
    choices:[{value:'80',correct:true},{value:'79',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'70',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'},{value:'81',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntTens}),
  _l2Q(167, {keyIdea:_l2KI2,difficulty:'hard',   prompt:'Fill in: 96, 97, ___, 99', visual:null,answer:'98', hint:'What comes after 97?',
    choices:[{value:'98',correct:true},{value:'97',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'99',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'96',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(168, {keyIdea:_l2KI4,difficulty:'hard',   prompt:'The student is at 99 on the number line. They take 1 step forward. Where are they?', visual:null,answer:'100', hint:'Count forward 1 from 99.',
    choices:[{value:'100',correct:true},{value:'98',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move'},{value:'200',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Jumped to wrong hundred'}],
    intervention:_l2IntHundred}),
  _l2Q(169, {keyIdea:_l2KI1,difficulty:'easy',   prompt:'Fill in: 31, 32, ___, 34', visual:null,answer:'33', hint:'What comes after 32?',
    choices:[{value:'33',correct:true},{value:'32',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'34',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'31',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(170, {keyIdea:_l2KI2,difficulty:'medium', prompt:'What comes next? 63, 64, ___', visual:null,answer:'65', hint:'What comes after 64?',
    choices:[{value:'65',correct:true},{value:'64',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'63',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'66',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(171, {keyIdea:_l2KI2,difficulty:'hard',   prompt:'Fill in: 106, ___, 108', visual:null,answer:'107', hint:'What comes after 106?',
    choices:[{value:'107',correct:true},{value:'106',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'108',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'105',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(172, {keyIdea:_l2KI2,difficulty:'hard',   prompt:'Count forward from 116: 116, ___', visual:null,answer:'117', hint:'What is 1 more than 116?',
    choices:[{value:'117',correct:true},{value:'115',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'116',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'118',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(173, {keyIdea:_l2KI1,difficulty:'easy',   prompt:'Fill in: 15, 16, ___, 18', visual:null,answer:'17', hint:'What comes after 16?',
    choices:[{value:'17',correct:true},{value:'16',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'18',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'15',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(174, {keyIdea:_l2KI1,difficulty:'easy',   prompt:'A student counted: 21, 22, 24. What number is missing?', visual:null,answer:'23', hint:'Check the step from 22 to 24.',
    choices:[{value:'23',correct:true},{value:'22',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 22'},{value:'21',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'25',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped too far'}],
    intervention:_l2IntSkipped}),
  _l2Q(175, {keyIdea:_l2KI2,difficulty:'medium', prompt:'Fill in: 88, ___, 90', visual:null,answer:'89', hint:'What comes after 88?',
    choices:[{value:'89',correct:true},{value:'88',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'90',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'87',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(176, {keyIdea:_l2KI2,difficulty:'medium', prompt:'What comes after 57?', visual:null,answer:'58', hint:'What is 1 more than 57?',
    choices:[{value:'58',correct:true},{value:'56',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'57',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'59',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(177, {keyIdea:_l2KI2,difficulty:'hard',   prompt:'Fill in: 103, 104, ___, 106', visual:null,answer:'105', hint:'What comes after 104?',
    choices:[{value:'105',correct:true},{value:'104',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'106',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'103',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'}],
    intervention:_l2IntSeq}),
  _l2Q(178, {keyIdea:_l2KI2,difficulty:'medium', prompt:'Count forward: 72, 73, ___', visual:null,answer:'74', hint:'What comes after 73?',
    choices:[{value:'74',correct:true},{value:'73',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'72',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'75',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(179, {keyIdea:_l2KI1,difficulty:'easy',   prompt:'What number comes between 5 and 7?', visual:null,answer:'6', hint:'Count forward from 5.',
    choices:[{value:'6',correct:true},{value:'5',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 5'},{value:'7',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Skipped to 7'},{value:'4',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(180, {keyIdea:_l2KI3,difficulty:'medium', prompt:'Fill in: 29, 30, ___, 32', visual:null,answer:'31', hint:'What comes after 30?',
    choices:[{value:'31',correct:true},{value:'30',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'32',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'29',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(181, {keyIdea:_l2KI2,difficulty:'medium', prompt:'What comes after 38?', visual:null,answer:'39', hint:'What is 1 more than 38?',
    choices:[{value:'39',correct:true},{value:'37',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'38',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'40',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(182, {keyIdea:_l2KI2,difficulty:'hard',   prompt:'Fill in: 110, 111, ___, 113', visual:null,answer:'112', hint:'What comes after 111?',
    choices:[{value:'112',correct:true},{value:'111',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'113',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'110',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(183, {keyIdea:_l2KI2,difficulty:'medium', prompt:'Count forward from 85: 85, 86, ___', visual:null,answer:'87', hint:'What comes after 86?',
    choices:[{value:'87',correct:true},{value:'86',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'85',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'88',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntSeq}),
  _l2Q(184, {keyIdea:_l2KI1,difficulty:'easy',   prompt:'What is the missing number? 17, ___, 19', visual:null,answer:'18', hint:'What comes after 17?',
    choices:[{value:'18',correct:true},{value:'17',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'19',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'16',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(185, {keyIdea:_l2KI3,difficulty:'medium', prompt:'A student is at 39 and wants to count forward. Which number comes next?', visual:null,answer:'40', hint:'After 39 comes a new ten.',
    choices:[{value:'40',correct:true},{value:'38',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'39',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'30',correct:false,errorTag:'err_tens_transition_error',misconceptionExplanation:'Reset to wrong ten'}],
    intervention:_l2IntTens}),
  _l2Q(186, {keyIdea:_l2KI2,difficulty:'medium', prompt:'Fill in: 49, 50, ___, 52', visual:null,answer:'51', hint:'What comes after 50?',
    choices:[{value:'51',correct:true},{value:'50',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'52',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'49',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(187, {keyIdea:_l2KI2,difficulty:'hard',   prompt:'What comes next? 118, 119, ___', visual:null,answer:'120', hint:'What is 1 more than 119?',
    choices:[{value:'120',correct:true},{value:'119',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'118',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Went backward'},{value:'121',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(188, {keyIdea:_l2KI1,difficulty:'easy',   prompt:'Fill in: 1, 2, ___, 4', visual:null,answer:'3', hint:'What comes after 2?',
    choices:[{value:'3',correct:true},{value:'2',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'4',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'1',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'}],
    intervention:_l2IntSeq}),
  _l2Q(189, {keyIdea:_l2KI2,difficulty:'medium', prompt:'What comes after 75?', visual:null,answer:'76', hint:'What is 1 more than 75?',
    choices:[{value:'76',correct:true},{value:'74',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'75',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'77',correct:false,errorTag:'err_skipped_number',misconceptionExplanation:'Jumped two steps'}],
    intervention:_l2IntBackward}),
  _l2Q(190, {keyIdea:_l2KI4,difficulty:'hard',   prompt:'Count forward: 99, ___, 101', visual:null,answer:'100', hint:'After 99 comes 100.',
    choices:[{value:'100',correct:true},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'98',correct:false,errorTag:'err_counted_backward',misconceptionExplanation:'Counted backward'},{value:'200',correct:false,errorTag:'err_hundred_transition_error',misconceptionExplanation:'Jumped to wrong hundred'}],
    intervention:_l2IntHundred})

]; // end _l2QuizBank

// ─── L1.2: Lesson Quiz Attempt ────────────────────────────────────────────────

const _l2QuizAttempt = {
  questionCount: 8,
  difficultyMix: { easy: 3, medium: 4, hard: 1 },
  sourceRule: 'this_lesson_quizbank_only',
  avoidRecentlySeen: true,
  noDuplicatesWithinAttempt: true
};

// ─── L1.2: Diagnostics ────────────────────────────────────────────────────────

const _l2Diagnostics = {
  errorTags: [
    'err_counted_backward', 'err_repeated_number', 'err_skipped_number',
    'err_tens_transition_error', 'err_hundred_transition_error', 'err_sequence_order_error'
  ],
  interventionRules: [
    { errorTag: 'err_counted_backward',         style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_repeated_number',          style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_skipped_number',           style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_tens_transition_error',    style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_hundred_transition_error', style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_sequence_order_error',     style: 'reteach',      followUpRule: 'same_skill_new_numbers' }
  ]
};

// ─── L1.2: Spec object (referenced in lessons array) ─────────────────────────

const _l2Spec = {
  lessonId: 'g1-u1-l2',
  title: 'Count Forward',
  teks: ['1.5A'],
  skill: 'count_forward_from_any_number',
  keyIdeas:          _l2KeyIdeas,
  workedExamples:    _l2Examples,
  practiceQuestions: _l2Practice,
  quizBank:          _l2QuizBank,
  lessonQuizAttempt: _l2QuizAttempt,
  diagnostics:       _l2Diagnostics
};

// ════════════════════════════════════════════════════════════════════════════
//  Lesson 1.3 — Count Backward (v0.2.0)
// ════════════════════════════════════════════════════════════════════════════

// ─── Shared intervention templates ───────────────────────────────────────────

const _l3IntForward = {
  errorTag: 'err_counted_forward_instead',
  title: 'Count Backward, Not Forward',
  teachingSteps: [
    'Backward means the numbers get smaller. Subtract 1 each time.',
    'To check: each number should be 1 less than the one before it. If numbers are growing, you are counting the wrong way.'
  ],
  correctAnswerExplanation: 'Counting backward subtracts 1 and gives a smaller number, not a bigger one.'
};
const _l3IntSkipped = {
  errorTag: 'err_skipped_backward_number',
  title: 'Count One Step at a Time Backward',
  teachingSteps: [
    'Counting backward subtracts exactly 1 each step.',
    'Slow down and count one step at a time. Each step is just 1 less.'
  ],
  correctAnswerExplanation: 'You jumped 2 steps backward instead of 1. Subtract exactly 1 to count backward correctly.'
};
const _l3IntRepeated = {
  errorTag: 'err_repeated_number',
  title: 'Move Backward — Do Not Stay',
  teachingSteps: [
    'When counting backward, say a NEW number each time. Subtract 1 from the last number.',
    'If you say the same number twice, you did not move backward.'
  ],
  correctAnswerExplanation: 'The previous number is always 1 less. Saying the same number twice means you did not move backward.'
};
const _l3IntTens = {
  errorTag: 'err_backward_tens_transition_error',
  title: 'Crossing Back Across a Ten',
  teachingSteps: [
    'Before the round ten (like 30), the number is 29 — the tens digit goes down by 1 and the ones digit becomes 9.',
    'So 30 goes to 29, 40 goes to 39, 50 goes to 49, and so on.'
  ],
  correctAnswerExplanation: 'When counting backward past a round ten, the tens digit drops by 1 and ones become 9. That is how 30 becomes 29.'
};
const _l3IntHundred = {
  errorTag: 'err_backward_hundred_transition_error',
  title: 'Crossing Back Across 100',
  teachingSteps: [
    'Before 100 comes 99. The same rule applies: subtract 1.',
    '100 − 1 = 99. Count backward, not forward.'
  ],
  correctAnswerExplanation: '100 − 1 = 99. This steps back into the two-digit numbers. Counting always subtracts 1, even at 100.'
};
const _l3IntSeq = {
  errorTag: 'err_sequence_order_error',
  title: 'Find the Missing Backward Number',
  teachingSteps: [
    'Look at the number before the blank and subtract 1. That gives you the missing number.',
    'You can also look at the number after the blank and add 1 — both ways should give the same answer.'
  ],
  correctAnswerExplanation: 'In a backward-counting sequence, each number is exactly 1 less than the one before it.'
};
const _l3IntBackward_generic = {
  errorTag: 'err_counted_forward_instead',
  title: 'Count Backward, Not Forward',
  teachingSteps: [
    'Backward means subtract 1 each time. Numbers get smaller.',
    'To check: is each number smaller than the one before? If not, you went the wrong way.'
  ],
  correctAnswerExplanation: 'Each step backward subtracts 1. After 99 comes 98, then 97, and so on.'
};

// ─── Key Ideas (6) ───────────────────────────────────────────────────────────

const _l3KeyIdeas = [
  'Counting backward means the numbers get smaller by 1 each time.',
  'You can start counting backward from any number.',
  'The number before is one less.',
  'When counting backward across a ten, 30 goes to 29, 40 goes to 39, and so on.',
  'Before 100 comes 99.',
  'On a number line, counting backward means moving to the left.'
];
const _l3KI1 = _l3KeyIdeas[0];
const _l3KI2 = _l3KeyIdeas[1];
const _l3KI3 = _l3KeyIdeas[2];
const _l3KI4 = _l3KeyIdeas[3];
const _l3KI5 = _l3KeyIdeas[4];
const _l3KI6 = _l3KeyIdeas[5];

// ─── Worked Examples (12) ────────────────────────────────────────────────────

const _l3Examples = [
  _l3E(1, {
    title: 'Simple Count Backward',
    prompt: 'Start at 8. Count backward 4 numbers. What are those 4 numbers?',
    visual: null,
    steps: ['Start at 8.', 'Subtract 1 each time: 7, 6, 5, 4.', 'Each step takes away exactly 1.'],
    finalAnswer: '7, 6, 5, 4',
    teachingNote: 'Count slowly. Point to each number. Reinforce "one less each time."',
    relatedKeyIdea: _l3KI1
  }),
  _l3E(2, {
    title: 'What Comes Before',
    prompt: 'What number comes before 16?',
    visual: { type: 'numberLine', min: 13, max: 19, ticks: [13,14,15,16,17,18,19], mark: 16, jumps: [{ from: 16, to: 15, label: '-1' }] },
    steps: ['Find 16 on the number line.', 'The arrow moves 1 step to the left.', 'One step left from 16 lands on 15.'],
    finalAnswer: '15',
    teachingNote: 'Moving left on the number line is the same as counting backward. The jump arrow goes left here.',
    relatedKeyIdea: _l3KI6
  }),
  _l3E(3, {
    title: 'Missing Number in Backward Sequence',
    prompt: 'Fill in: 27, 26, ___, 24',
    visual: { type: 'numberLine', min: 22, max: 29, ticks: [22,23,24,25,26,27,28,29], mark: 26 },
    steps: ['Look at 27, 26 — each goes down by 1.', 'Subtract 1 from 26: 26 − 1 = 25.', 'Check: 25 − 1 = 24. Correct!'],
    finalAnswer: '25',
    teachingNote: 'Point to the gap on the number line and count backward one step from 26.',
    relatedKeyIdea: _l3KI1
  }),
  _l3E(4, {
    title: 'Start From Any Number',
    prompt: 'Start at 87. Count backward 3 numbers. What are those numbers?',
    visual: null,
    steps: ['Start at 87.', 'Subtract 1: 86.', 'Subtract 1 more: 85.', 'Subtract 1 more: 84.', 'The three numbers are 86, 85, 84.'],
    finalAnswer: '86, 85, 84',
    teachingNote: 'Stress that counting backward can begin anywhere. Students do not need to count down from 100.',
    relatedKeyIdea: _l3KI2
  }),
  _l3E(5, {
    title: 'Across a Ten Going Backward',
    prompt: 'Count backward: 31, 30, ___, 28',
    visual: { type: 'numberLine', min: 27, max: 33, ticks: [27,28,29,30,31,32,33], mark: 30, jumps: [{ from: 30, to: 29, label: '-1' }] },
    steps: ['31, 30 — the ones digit just crossed 0.', 'Subtract 1 from 30: the tens digit drops from 3 to 2 and ones become 9. That is 29.', 'Check: 29 − 1 = 28. Correct!'],
    finalAnswer: '29',
    teachingNote: 'Highlight the leftward jump on the number line at the ten boundary. Students often stall at 30.',
    relatedKeyIdea: _l3KI4
  }),
  _l3E(6, {
    title: 'Across 100 to 99',
    prompt: 'Count backward: 102, 101, ___, 99',
    visual: { type: 'numberLine', min: 97, max: 104, ticks: [97,98,99,100,101,102,103,104], mark: 101, jumps: [{ from: 101, to: 100, label: '-1' }] },
    steps: ['102, 101 — we are counting down through the hundreds.', 'Subtract 1 from 101: 100.', 'Check: 100 − 1 = 99. Correct!'],
    finalAnswer: '100',
    teachingNote: 'Show that the same rule applies at 100. Before 101 is 100; before 100 is 99.',
    relatedKeyIdea: _l3KI5
  }),
  _l3E(7, {
    title: 'Number Line Backward Movement',
    prompt: 'The number line shows 53. Move 1 step to the left. Where do you land?',
    visual: { type: 'numberLine', min: 50, max: 57, ticks: [50,51,52,53,54,55,56,57], mark: 53, jumps: [{ from: 53, to: 52, label: '-1' }] },
    steps: ['Find 53 on the number line.', 'Moving left means counting backward.', '1 step left from 53 lands on 52.'],
    finalAnswer: '52',
    teachingNote: 'Connect moving left on the number line to subtracting 1. Contrast with the forward lesson.',
    relatedKeyIdea: _l3KI6
  }),
  _l3E(8, {
    title: 'Common Mistake — Counting Forward Instead',
    prompt: 'A student counted: 45, 46, 47. What mistake did they make?',
    visual: null,
    steps: ['Look at the numbers: 45, 46, 47.', 'Each number is getting BIGGER — that is counting forward.', 'To count backward, each number must be 1 LESS than the last.'],
    finalAnswer: 'They counted forward instead of backward.',
    teachingNote: 'Use this to build self-checking: ask "Is each number smaller than the last?"',
    relatedKeyIdea: _l3KI1
  }),
  _l3E(9, {
    title: 'Common Mistake — Skipping a Number',
    prompt: 'A student counted: 34, 33, 31. What number did they skip?',
    visual: null,
    steps: ['Check each step: 34 to 33 is −1. Good.', '33 to 31 is −2 — that jumps over 32!', 'The missing number is 32.'],
    finalAnswer: '32',
    teachingNote: 'Count each backward step carefully. One step at a time, always −1.',
    relatedKeyIdea: _l3KI1
  }),
  _l3E(10, {
    title: 'Common Mistake — Repeating a Number',
    prompt: 'A student counted: 50, 49, 49, 48. What mistake did they make?',
    visual: null,
    steps: ['Check each step: 50 to 49 is −1. Good.', '49 to 49 is 0 — same number repeated!', '49 to 48 is −1. Good.', 'They said 49 twice instead of moving backward.'],
    finalAnswer: 'They repeated 49 instead of moving backward.',
    teachingNote: 'Remind students: every backward step must be a NEW, smaller number.',
    relatedKeyIdea: _l3KI1
  }),
  _l3E(11, {
    title: 'Harder Sequence Near 120',
    prompt: 'Fill in: 119, 118, ___, 116, 115',
    visual: { type: 'numberLine', min: 114, max: 121, ticks: [114,115,116,117,118,119,120,121], mark: 118 },
    steps: ['119, 118 — each goes down by 1.', 'Subtract 1 from 118: 118 − 1 = 117.', 'Check: 117 − 1 = 116, 116 − 1 = 115. Correct!'],
    finalAnswer: '117',
    teachingNote: 'Show that the one-less rule works all the way down from 120.',
    relatedKeyIdea: _l3KI2
  }),
  _l3E(12, {
    title: 'Mixed Backward Review — Two Blanks',
    prompt: 'Count backward from 92: 92, 91, ___, ___, 88. Fill in both missing numbers.',
    visual: null,
    steps: ['92, 91 — subtract 1: 90. That crosses a new ten.', 'Subtract 1 from 90: 89.', 'Check: 89 − 1 = 88. Correct!', 'The two missing numbers are 90 and 89.'],
    finalAnswer: '90, 89',
    teachingNote: 'This crosses a ten going backward. Use as a bridge to the tens-transition quizBank questions.',
    relatedKeyIdea: _l3KI4
  })
];

// ─── Practice Questions (22) ─────────────────────────────────────────────────

const _l3Practice = [
  _l3P(1,  { difficulty:'easy',   keyIdea:_l3KI1, prompt:'What number comes before 8?',   answer:'7',   hint:'What is 1 less than 8?',  explanation:'8 − 1 = 7.',
    choices:[{value:'7',correct:true},{value:'9',correct:false,errorTag:'err_counted_forward_instead'},{value:'8',correct:false,errorTag:'err_repeated_number'},{value:'6',correct:false,errorTag:'err_skipped_backward_number'}] }),
  _l3P(2,  { difficulty:'easy',   keyIdea:_l3KI1, prompt:'What number comes before 15?',  answer:'14',  hint:'What is 1 less than 15?', explanation:'15 − 1 = 14.',
    choices:[{value:'14',correct:true},{value:'16',correct:false,errorTag:'err_counted_forward_instead'},{value:'15',correct:false,errorTag:'err_repeated_number'},{value:'13',correct:false,errorTag:'err_skipped_backward_number'}] }),
  _l3P(3,  { difficulty:'easy',   keyIdea:_l3KI1, prompt:'What number comes before 22?',  answer:'21',  hint:'What is 1 less than 22?', explanation:'22 − 1 = 21.',
    choices:[{value:'21',correct:true},{value:'23',correct:false,errorTag:'err_counted_forward_instead'},{value:'22',correct:false,errorTag:'err_repeated_number'},{value:'20',correct:false,errorTag:'err_skipped_backward_number'}] }),
  _l3P(4,  { difficulty:'easy',   keyIdea:_l3KI1, prompt:'Fill in: 11, 10, ___, 8',       answer:'9',   hint:'What comes after 10 when counting backward?', explanation:'10 − 1 = 9.',
    choices:[{value:'9',correct:true},{value:'10',correct:false,errorTag:'err_repeated_number'},{value:'8',correct:false,errorTag:'err_sequence_order_error'},{value:'11',correct:false,errorTag:'err_counted_forward_instead'}] }),
  _l3P(5,  { difficulty:'easy',   keyIdea:_l3KI1, prompt:'Fill in: 7, 6, ___, 4',         answer:'5',   hint:'What comes after 6 when counting backward?', explanation:'6 − 1 = 5.',
    choices:[{value:'5',correct:true},{value:'6',correct:false,errorTag:'err_repeated_number'},{value:'4',correct:false,errorTag:'err_sequence_order_error'},{value:'7',correct:false,errorTag:'err_counted_forward_instead'}] }),
  _l3P(6,  { difficulty:'easy',   keyIdea:_l3KI3, prompt:'What number comes before 20?',  answer:'19',  hint:'What is 1 less than 20?', explanation:'20 − 1 = 19. When counting backward, 20 goes to 19.',
    choices:[{value:'19',correct:true},{value:'21',correct:false,errorTag:'err_counted_forward_instead'},{value:'20',correct:false,errorTag:'err_repeated_number'},{value:'10',correct:false,errorTag:'err_backward_tens_transition_error'}] }),
  _l3P(7,  { difficulty:'easy',   keyIdea:_l3KI3, prompt:'What number comes before 40?',  answer:'39',  hint:'Before the round ten is the number with 9 in the ones.', explanation:'40 − 1 = 39.',
    choices:[{value:'39',correct:true},{value:'41',correct:false,errorTag:'err_counted_forward_instead'},{value:'40',correct:false,errorTag:'err_repeated_number'},{value:'30',correct:false,errorTag:'err_backward_tens_transition_error'}] }),
  _l3P(8,  { difficulty:'medium', keyIdea:_l3KI2, prompt:'What number comes before 37?',  answer:'36',  hint:'What is 1 less than 37?', explanation:'37 − 1 = 36.',
    choices:[{value:'36',correct:true},{value:'38',correct:false,errorTag:'err_counted_forward_instead'},{value:'37',correct:false,errorTag:'err_repeated_number'},{value:'35',correct:false,errorTag:'err_skipped_backward_number'}] }),
  _l3P(9,  { difficulty:'medium', keyIdea:_l3KI2, prompt:'Fill in: 54, 53, ___, 51',      answer:'52',  hint:'What comes after 53 when counting backward?', explanation:'53 − 1 = 52.',
    choices:[{value:'52',correct:true},{value:'53',correct:false,errorTag:'err_repeated_number'},{value:'51',correct:false,errorTag:'err_sequence_order_error'},{value:'54',correct:false,errorTag:'err_counted_forward_instead'}] }),
  _l3P(10, { difficulty:'medium', keyIdea:_l3KI2, prompt:'Fill in: 68, ___, 66',          answer:'67',  hint:'What comes between 68 and 66?', explanation:'68 − 1 = 67.',
    choices:[{value:'67',correct:true},{value:'68',correct:false,errorTag:'err_repeated_number'},{value:'66',correct:false,errorTag:'err_sequence_order_error'},{value:'69',correct:false,errorTag:'err_counted_forward_instead'}] }),
  _l3P(11, { difficulty:'medium', keyIdea:_l3KI2, prompt:'Fill in: 76, 75, ___, 73',      answer:'74',  hint:'What comes after 75 when counting backward?', explanation:'75 − 1 = 74.',
    choices:[{value:'74',correct:true},{value:'75',correct:false,errorTag:'err_repeated_number'},{value:'73',correct:false,errorTag:'err_sequence_order_error'},{value:'76',correct:false,errorTag:'err_counted_forward_instead'}] }),
  _l3P(12, { difficulty:'medium', keyIdea:_l3KI4, prompt:'Fill in: 31, 30, ___, 28',      answer:'29',  hint:'Before the round ten, the ones digit is 9.', explanation:'30 − 1 = 29. The tens digit drops from 3 to 2 and ones become 9.',
    choices:[{value:'29',correct:true},{value:'30',correct:false,errorTag:'err_repeated_number'},{value:'20',correct:false,errorTag:'err_backward_tens_transition_error'},{value:'28',correct:false,errorTag:'err_sequence_order_error'}] }),
  _l3P(13, { difficulty:'medium', keyIdea:_l3KI4, prompt:'Fill in: 51, ___, 49',          answer:'50',  hint:'What comes between 51 and 49 when counting backward?', explanation:'51 − 1 = 50.',
    choices:[{value:'50',correct:true},{value:'51',correct:false,errorTag:'err_repeated_number'},{value:'49',correct:false,errorTag:'err_sequence_order_error'},{value:'40',correct:false,errorTag:'err_backward_tens_transition_error'}] }),
  _l3P(14, { difficulty:'medium', keyIdea:_l3KI4, prompt:'What number comes before 60?',  answer:'59',  hint:'Before the round ten is the number with 9 in the ones.', explanation:'60 − 1 = 59.',
    choices:[{value:'59',correct:true},{value:'61',correct:false,errorTag:'err_counted_forward_instead'},{value:'60',correct:false,errorTag:'err_repeated_number'},{value:'50',correct:false,errorTag:'err_backward_tens_transition_error'}] }),
  _l3P(15, { difficulty:'medium', keyIdea:_l3KI4, prompt:'What number comes before 80?',  answer:'79',  hint:'Before 80 comes the number with 7 tens and 9 ones.', explanation:'80 − 1 = 79.',
    choices:[{value:'79',correct:true},{value:'81',correct:false,errorTag:'err_counted_forward_instead'},{value:'80',correct:false,errorTag:'err_repeated_number'},{value:'70',correct:false,errorTag:'err_backward_tens_transition_error'}] }),
  _l3P(16, { difficulty:'medium', keyIdea:_l3KI6, prompt:'The number line shows 47. Move 1 step to the left. Where do you land?',
    visual: { type:'numberLine', mark:47, jumps:[{from:47, to:46, label:'-1'}] },
    answer:'46', hint:'Moving left on the number line is counting backward.', explanation:'47 − 1 = 46. One step left from 47 lands on 46.',
    choices:[{value:'46',correct:true},{value:'48',correct:false,errorTag:'err_counted_forward_instead'},{value:'47',correct:false,errorTag:'err_repeated_number'},{value:'45',correct:false,errorTag:'err_skipped_backward_number'}] }),
  _l3P(17, { difficulty:'medium', keyIdea:_l3KI6, prompt:'The number line shows 33. Move 1 step to the left. Where do you land?',
    visual: { type:'numberLine', mark:33, jumps:[{from:33, to:32, label:'-1'}] },
    answer:'32', hint:'Moving left is counting backward.', explanation:'33 − 1 = 32.',
    choices:[{value:'32',correct:true},{value:'34',correct:false,errorTag:'err_counted_forward_instead'},{value:'33',correct:false,errorTag:'err_repeated_number'},{value:'31',correct:false,errorTag:'err_skipped_backward_number'}] }),
  _l3P(18, { difficulty:'hard',   keyIdea:_l3KI5, prompt:'What number comes before 100?', answer:'99',  hint:'Before 100 comes 99.', explanation:'100 − 1 = 99. We step back from a hundred into two-digit numbers.',
    choices:[{value:'99',correct:true},{value:'101',correct:false,errorTag:'err_counted_forward_instead'},{value:'100',correct:false,errorTag:'err_repeated_number'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error'}] }),
  _l3P(19, { difficulty:'hard',   keyIdea:_l3KI5, prompt:'Fill in: 101, 100, ___',        answer:'99',  hint:'After 100 comes 99 when counting backward.', explanation:'100 − 1 = 99.',
    choices:[{value:'99',correct:true},{value:'100',correct:false,errorTag:'err_repeated_number'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error'},{value:'98',correct:false,errorTag:'err_skipped_backward_number'}] }),
  _l3P(20, { difficulty:'hard',   keyIdea:_l3KI5, prompt:'The arrow shows 1 step backward from 100. What number does the arrow point to?',
    visual: { type:'numberLine', mark:100, jumps:[{from:100, to:99, label:'-1'}] },
    answer:'99', hint:'Count backward 1 from 100. Remember: before 100 comes 99.', explanation:'100 − 1 = 99. The arrow lands on 99.',
    choices:[{value:'99',correct:true},{value:'101',correct:false,errorTag:'err_counted_forward_instead'},{value:'100',correct:false,errorTag:'err_repeated_number'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error'}] }),
  _l3P(21, { difficulty:'hard',   keyIdea:_l3KI2, prompt:'Fill in: 115, 114, ___, 112',   answer:'113', hint:'What comes after 114 when counting backward?', explanation:'114 − 1 = 113.',
    choices:[{value:'113',correct:true},{value:'114',correct:false,errorTag:'err_repeated_number'},{value:'112',correct:false,errorTag:'err_sequence_order_error'},{value:'115',correct:false,errorTag:'err_counted_forward_instead'}] }),
  _l3P(22, { difficulty:'hard',   keyIdea:_l3KI2, prompt:'Fill in: 119, ___, 117',        answer:'118', hint:'What comes between 119 and 117?', explanation:'119 − 1 = 118.',
    choices:[{value:'118',correct:true},{value:'119',correct:false,errorTag:'err_repeated_number'},{value:'117',correct:false,errorTag:'err_sequence_order_error'},{value:'120',correct:false,errorTag:'err_counted_forward_instead'}] })
];

// ─── QuizBank Part A: what_comes_before + missing_number_backward_sequence ───

const _l3QuizBank = [
  // ── Block A: what comes before — easy (q-001 to q-010) ──────────────────────
  _l3Q(1, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 5?',visual:null,answer:'4',hint:'What is 1 less than 5?',
    choices:[{value:'4',correct:true},{value:'6',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'5',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'3',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(2, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 9?',visual:null,answer:'8',hint:'What is 1 less than 9?',
    choices:[{value:'8',correct:true},{value:'10',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'9',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'7',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(3, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 12?',visual:null,answer:'11',hint:'What is 1 less than 12?',
    choices:[{value:'11',correct:true},{value:'13',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'12',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'10',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(4, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 17?',visual:null,answer:'16',hint:'What is 1 less than 17?',
    choices:[{value:'16',correct:true},{value:'18',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'17',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'15',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(5, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 23?',visual:null,answer:'22',hint:'What is 1 less than 23?',
    choices:[{value:'22',correct:true},{value:'24',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'23',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'21',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(6, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 6?',visual:null,answer:'5',hint:'What is 1 less than 6?',
    choices:[{value:'5',correct:true},{value:'7',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'6',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'4',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(7, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 10?',visual:null,answer:'9',hint:'What is 1 less than 10?',
    choices:[{value:'9',correct:true},{value:'11',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'10',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'8',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(8, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 14?',visual:null,answer:'13',hint:'What is 1 less than 14?',
    choices:[{value:'13',correct:true},{value:'15',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'14',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'12',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(9, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 18?',visual:null,answer:'17',hint:'What is 1 less than 18?',
    choices:[{value:'17',correct:true},{value:'19',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'18',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'16',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(10, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 21?',visual:null,answer:'20',hint:'What is 1 less than 21?',
    choices:[{value:'20',correct:true},{value:'22',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'21',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'19',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  // ── Block B: what comes before — medium (q-011 to q-025) ───────────────────
  _l3Q(11, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 28?',visual:null,answer:'27',hint:'What is 1 less than 28?',
    choices:[{value:'27',correct:true},{value:'29',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'28',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'26',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(12, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 35?',visual:null,answer:'34',hint:'What is 1 less than 35?',
    choices:[{value:'34',correct:true},{value:'36',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'35',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'33',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(13, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 44?',visual:null,answer:'43',hint:'What is 1 less than 44?',
    choices:[{value:'43',correct:true},{value:'45',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'44',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'42',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(14, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 56?',visual:null,answer:'55',hint:'What is 1 less than 56?',
    choices:[{value:'55',correct:true},{value:'57',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'56',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'54',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(15, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 67?',visual:null,answer:'66',hint:'What is 1 less than 67?',
    choices:[{value:'66',correct:true},{value:'68',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'67',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'65',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(16, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 72?',visual:null,answer:'71',hint:'What is 1 less than 72?',
    choices:[{value:'71',correct:true},{value:'73',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'72',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'70',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(17, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 78?',visual:null,answer:'77',hint:'What is 1 less than 78?',
    choices:[{value:'77',correct:true},{value:'79',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'78',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'76',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(18, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 83?',visual:null,answer:'82',hint:'What is 1 less than 83?',
    choices:[{value:'82',correct:true},{value:'84',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'83',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'81',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(19, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 88?',visual:null,answer:'87',hint:'What is 1 less than 88?',
    choices:[{value:'87',correct:true},{value:'89',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'88',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'86',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(20, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 26?',visual:null,answer:'25',hint:'What is 1 less than 26?',
    choices:[{value:'25',correct:true},{value:'27',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'26',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'24',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(21, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 31?',visual:null,answer:'30',hint:'What is 1 less than 31?',
    choices:[{value:'30',correct:true},{value:'32',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'31',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'29',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(22, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 42?',visual:null,answer:'41',hint:'What is 1 less than 42?',
    choices:[{value:'41',correct:true},{value:'43',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'42',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'40',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(23, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 53?',visual:null,answer:'52',hint:'What is 1 less than 53?',
    choices:[{value:'52',correct:true},{value:'54',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'53',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'51',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(24, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 62?',visual:null,answer:'61',hint:'What is 1 less than 62?',
    choices:[{value:'61',correct:true},{value:'63',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'62',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'60',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(25, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 71?',visual:null,answer:'70',hint:'What is 1 less than 71?',
    choices:[{value:'70',correct:true},{value:'72',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'71',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'69',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  // ── Block C: what comes before — hard (q-026 to q-035) ──────────────────────
  _l3Q(26, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'hard',prompt:'What number comes before 94?',visual:null,answer:'93',hint:'What is 1 less than 94?',
    choices:[{value:'93',correct:true},{value:'95',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'94',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'92',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(27, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'hard',prompt:'What number comes before 107?',visual:null,answer:'106',hint:'What is 1 less than 107?',
    choices:[{value:'106',correct:true},{value:'108',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'107',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'105',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(28, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'hard',prompt:'What number comes before 113?',visual:null,answer:'112',hint:'What is 1 less than 113?',
    choices:[{value:'112',correct:true},{value:'114',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'113',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'111',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(29, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'hard',prompt:'What number comes before 98?',visual:null,answer:'97',hint:'What is 1 less than 98?',
    choices:[{value:'97',correct:true},{value:'99',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'98',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'96',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(30, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'hard',prompt:'What number comes before 104?',visual:null,answer:'103',hint:'What is 1 less than 104?',
    choices:[{value:'103',correct:true},{value:'105',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'104',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'102',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(31, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'hard',prompt:'What number comes before 110?',visual:null,answer:'109',hint:'What is 1 less than 110?',
    choices:[{value:'109',correct:true},{value:'111',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'110',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'108',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(32, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'hard',prompt:'What number comes before 116?',visual:null,answer:'115',hint:'What is 1 less than 116?',
    choices:[{value:'115',correct:true},{value:'117',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'116',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'114',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(33, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'hard',prompt:'What number comes before 119?',visual:null,answer:'118',hint:'What is 1 less than 119?',
    choices:[{value:'118',correct:true},{value:'120',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'119',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'117',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(34, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'hard',prompt:'What number comes before 120?',visual:null,answer:'119',hint:'What is 1 less than 120?',
    choices:[{value:'119',correct:true},{value:'121',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'120',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'118',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  _l3Q(35, {subSkill:'what_comes_before',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'hard',prompt:'What number comes before 115?',visual:null,answer:'114',hint:'What is 1 less than 115?',
    choices:[{value:'114',correct:true},{value:'116',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'115',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number'},{value:'113',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back instead of one'}],
    intervention:_l3IntForward}),
  // ── Block D: fill in missing — easy (q-036 to q-049) ────────────────────────
  _l3Q(36, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 9, 8, ___, 6',visual:null,answer:'7',hint:'Subtract 1 from 8.',
    choices:[{value:'7',correct:true},{value:'8',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'6',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'9',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(37, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 14, 13, ___, 11',visual:null,answer:'12',hint:'Subtract 1 from 13.',
    choices:[{value:'12',correct:true},{value:'13',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'11',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'14',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(38, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 18, 17, ___, 15',visual:null,answer:'16',hint:'Subtract 1 from 17.',
    choices:[{value:'16',correct:true},{value:'17',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'15',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'18',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(39, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 5, ___, 3',visual:null,answer:'4',hint:'Subtract 1 from 5.',
    choices:[{value:'4',correct:true},{value:'5',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'3',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'6',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'}],
    intervention:_l3IntSeq}),
  _l3Q(40, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 22, ___, 20',visual:null,answer:'21',hint:'Subtract 1 from 22.',
    choices:[{value:'21',correct:true},{value:'22',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'20',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'23',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'}],
    intervention:_l3IntSeq}),
  _l3Q(41, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 16, ___, 14',visual:null,answer:'15',hint:'Subtract 1 from 16.',
    choices:[{value:'15',correct:true},{value:'16',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'14',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'17',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'}],
    intervention:_l3IntSeq}),
  _l3Q(42, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 12, 11, ___, 9',visual:null,answer:'10',hint:'Subtract 1 from 11.',
    choices:[{value:'10',correct:true},{value:'11',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'9',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'12',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(43, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 24, 23, ___, 21',visual:null,answer:'22',hint:'Subtract 1 from 23.',
    choices:[{value:'22',correct:true},{value:'23',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'21',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'24',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(44, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 8, 7, ___, 5',visual:null,answer:'6',hint:'Subtract 1 from 7.',
    choices:[{value:'6',correct:true},{value:'7',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'5',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'8',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(45, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 20, 19, ___, 17',visual:null,answer:'18',hint:'Subtract 1 from 19.',
    choices:[{value:'18',correct:true},{value:'19',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'17',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'20',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(46, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 6, ___, 4',visual:null,answer:'5',hint:'Subtract 1 from 6.',
    choices:[{value:'5',correct:true},{value:'6',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'4',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'7',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'}],
    intervention:_l3IntSeq}),
  _l3Q(47, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 13, 12, ___, 10',visual:null,answer:'11',hint:'Subtract 1 from 12.',
    choices:[{value:'11',correct:true},{value:'12',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'10',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'13',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(48, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 4, ___, 2',visual:null,answer:'3',hint:'Subtract 1 from 4.',
    choices:[{value:'3',correct:true},{value:'4',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'2',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'5',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'}],
    intervention:_l3IntSeq}),
  _l3Q(49, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 17, ___, 15',visual:null,answer:'16',hint:'Subtract 1 from 17.',
    choices:[{value:'16',correct:true},{value:'17',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'15',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'18',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'}],
    intervention:_l3IntSeq}),
  // ── Block E: fill in missing — medium (q-050 to q-061) ──────────────────────
  _l3Q(50, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 34, 33, ___, 31',visual:null,answer:'32',hint:'Subtract 1 from 33.',
    choices:[{value:'32',correct:true},{value:'33',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'31',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'34',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(51, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 48, 47, ___, 45',visual:null,answer:'46',hint:'Subtract 1 from 47.',
    choices:[{value:'46',correct:true},{value:'47',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'45',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'48',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(52, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 64, 63, ___, 61',visual:null,answer:'62',hint:'Subtract 1 from 63.',
    choices:[{value:'62',correct:true},{value:'63',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'61',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'64',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(53, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 79, 78, ___, 76',visual:null,answer:'77',hint:'Subtract 1 from 78.',
    choices:[{value:'77',correct:true},{value:'78',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'76',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'79',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(54, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 86, 85, ___, 83',visual:null,answer:'84',hint:'Subtract 1 from 85.',
    choices:[{value:'84',correct:true},{value:'85',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'83',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'86',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(55, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 53, 52, ___, 50',visual:null,answer:'51',hint:'Subtract 1 from 52.',
    choices:[{value:'51',correct:true},{value:'52',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'50',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'53',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(56, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 69, 68, ___, 66',visual:null,answer:'67',hint:'Subtract 1 from 68.',
    choices:[{value:'67',correct:true},{value:'68',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'66',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'69',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(57, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 75, 74, ___, 72',visual:null,answer:'73',hint:'Subtract 1 from 74.',
    choices:[{value:'73',correct:true},{value:'74',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'72',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'75',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(58, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 82, 81, ___, 79',visual:null,answer:'80',hint:'Subtract 1 from 81.',
    choices:[{value:'80',correct:true},{value:'81',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'79',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'82',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(59, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 90, 89, ___, 87',visual:null,answer:'88',hint:'Subtract 1 from 89.',
    choices:[{value:'88',correct:true},{value:'89',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'87',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'90',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(60, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 37, 36, ___, 34',visual:null,answer:'35',hint:'Subtract 1 from 36.',
    choices:[{value:'35',correct:true},{value:'36',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'34',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'37',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(61, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 56, 55, ___, 53',visual:null,answer:'54',hint:'Subtract 1 from 55.',
    choices:[{value:'54',correct:true},{value:'55',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'53',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'56',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  // ── Block F: fill in missing — hard (q-062 to q-071) ────────────────────────
  _l3Q(62, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 97, 96, ___, 94',visual:null,answer:'95',hint:'Subtract 1 from 96.',
    choices:[{value:'95',correct:true},{value:'96',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'94',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'97',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(63, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 105, 104, ___, 102',visual:null,answer:'103',hint:'Subtract 1 from 104.',
    choices:[{value:'103',correct:true},{value:'104',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'102',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'105',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(64, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 112, 111, ___, 109',visual:null,answer:'110',hint:'Subtract 1 from 111.',
    choices:[{value:'110',correct:true},{value:'111',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'109',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'112',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(65, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 119, 118, ___, 116',visual:null,answer:'117',hint:'Subtract 1 from 118.',
    choices:[{value:'117',correct:true},{value:'118',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'116',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'119',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(66, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 94, 93, ___, 91',visual:null,answer:'92',hint:'Subtract 1 from 93.',
    choices:[{value:'92',correct:true},{value:'93',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'91',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'94',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(67, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 99, 98, ___, 96',visual:null,answer:'97',hint:'Subtract 1 from 98.',
    choices:[{value:'97',correct:true},{value:'98',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'96',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'99',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(68, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 109, 108, ___, 106',visual:null,answer:'107',hint:'Subtract 1 from 108.',
    choices:[{value:'107',correct:true},{value:'108',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'106',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'109',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(69, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 114, 113, ___, 111',visual:null,answer:'112',hint:'Subtract 1 from 113.',
    choices:[{value:'112',correct:true},{value:'113',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'111',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'114',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(70, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 121, 120, ___, 118',visual:null,answer:'119',hint:'Subtract 1 from 120.',
    choices:[{value:'119',correct:true},{value:'120',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'118',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'121',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  _l3Q(71, {subSkill:'missing_number_backward_sequence',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 116, 115, ___, 113',visual:null,answer:'114',hint:'Subtract 1 from 115.',
    choices:[{value:'114',correct:true},{value:'115',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last shown number'},{value:'113',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied the number after the blank'},{value:'116',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used the number before the blank'}],
    intervention:_l3IntSeq}),
  // ── Block G: across_ten_backward (q-072 to q-106) ───────────────────────────
  // 20→19 cluster
  _l3Q(72, {subSkill:'across_ten_backward',promptTemplate:'count_backward_sequence',keyIdea:_l3KI4,difficulty:'medium',prompt:'Count backward: 22, 21, 20, ___',visual:null,answer:'19',hint:'After 20, the ones digit becomes 9 and tens drop by 1.',
    choices:[{value:'19',correct:true},{value:'21',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'20',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 20 instead of moving back'},{value:'10',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(73, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 21, 20, ___',visual:null,answer:'19',hint:'After 20 comes 19 when counting backward.',
    choices:[{value:'19',correct:true},{value:'20',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'10',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'18',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntTens}),
  _l3Q(74, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 22, 21, 20, ___, 18',visual:null,answer:'19',hint:'The blank is right after 20. What tens-transition comes next?',
    choices:[{value:'19',correct:true},{value:'20',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'10',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'18',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  _l3Q(75, {subSkill:'across_ten_backward',promptTemplate:'what_comes_before',keyIdea:_l3KI4,difficulty:'medium',prompt:'What number comes before 20?',visual:null,answer:'19',hint:'Before 20 comes 19 — the ones digit becomes 9.',
    choices:[{value:'19',correct:true},{value:'21',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'20',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'10',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  // 30→29 cluster
  _l3Q(76, {subSkill:'across_ten_backward',promptTemplate:'count_backward_sequence',keyIdea:_l3KI4,difficulty:'medium',prompt:'Count backward: 32, 31, 30, ___',visual:null,answer:'29',hint:'After 30, the ones digit becomes 9 and tens drop by 1.',
    choices:[{value:'29',correct:true},{value:'31',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'30',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 30 instead of moving back'},{value:'20',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(77, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 31, 30, ___',visual:null,answer:'29',hint:'After 30 comes 29 when counting backward.',
    choices:[{value:'29',correct:true},{value:'30',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'20',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'28',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntTens}),
  _l3Q(78, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 32, 31, 30, ___, 28',visual:null,answer:'29',hint:'The blank is right after 30.',
    choices:[{value:'29',correct:true},{value:'30',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'20',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'28',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  _l3Q(79, {subSkill:'across_ten_backward',promptTemplate:'what_comes_before',keyIdea:_l3KI4,difficulty:'medium',prompt:'What number comes before 30?',visual:null,answer:'29',hint:'Before 30 comes 29 — the ones digit becomes 9.',
    choices:[{value:'29',correct:true},{value:'31',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'30',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'20',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  // 40→39 cluster
  _l3Q(80, {subSkill:'across_ten_backward',promptTemplate:'count_backward_sequence',keyIdea:_l3KI4,difficulty:'medium',prompt:'Count backward: 42, 41, 40, ___',visual:null,answer:'39',hint:'After 40, the ones digit becomes 9 and tens drop by 1.',
    choices:[{value:'39',correct:true},{value:'41',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'40',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 40 instead of moving back'},{value:'30',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(81, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 41, 40, ___',visual:null,answer:'39',hint:'After 40 comes 39 when counting backward.',
    choices:[{value:'39',correct:true},{value:'40',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'30',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'38',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntTens}),
  _l3Q(82, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 42, 41, 40, ___, 38',visual:null,answer:'39',hint:'The blank is right after 40.',
    choices:[{value:'39',correct:true},{value:'40',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'30',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'38',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  _l3Q(83, {subSkill:'across_ten_backward',promptTemplate:'what_comes_before',keyIdea:_l3KI4,difficulty:'hard',prompt:'What number comes before 40?',visual:null,answer:'39',hint:'Before 40 comes 39 — the ones digit becomes 9.',
    choices:[{value:'39',correct:true},{value:'41',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'40',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'30',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  // 50→49 cluster
  _l3Q(84, {subSkill:'across_ten_backward',promptTemplate:'count_backward_sequence',keyIdea:_l3KI4,difficulty:'medium',prompt:'Count backward: 52, 51, 50, ___',visual:null,answer:'49',hint:'After 50, the ones digit becomes 9 and tens drop by 1.',
    choices:[{value:'49',correct:true},{value:'51',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'50',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 50 instead of moving back'},{value:'40',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(85, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 51, 50, ___',visual:null,answer:'49',hint:'After 50 comes 49 when counting backward.',
    choices:[{value:'49',correct:true},{value:'50',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'40',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'48',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntTens}),
  _l3Q(86, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 52, 51, 50, ___, 48',visual:null,answer:'49',hint:'The blank is right after 50.',
    choices:[{value:'49',correct:true},{value:'50',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'40',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'48',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  _l3Q(87, {subSkill:'across_ten_backward',promptTemplate:'what_comes_before',keyIdea:_l3KI4,difficulty:'hard',prompt:'What number comes before 50?',visual:null,answer:'49',hint:'Before 50 comes 49 — the ones digit becomes 9.',
    choices:[{value:'49',correct:true},{value:'51',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'50',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'40',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  // 60→59 cluster
  _l3Q(88, {subSkill:'across_ten_backward',promptTemplate:'count_backward_sequence',keyIdea:_l3KI4,difficulty:'medium',prompt:'Count backward: 62, 61, 60, ___',visual:null,answer:'59',hint:'After 60, the ones digit becomes 9 and tens drop by 1.',
    choices:[{value:'59',correct:true},{value:'61',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'60',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 60 instead of moving back'},{value:'50',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(89, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 61, 60, ___',visual:null,answer:'59',hint:'After 60 comes 59 when counting backward.',
    choices:[{value:'59',correct:true},{value:'60',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'50',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'58',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntTens}),
  _l3Q(90, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 62, 61, 60, ___, 58',visual:null,answer:'59',hint:'The blank is right after 60.',
    choices:[{value:'59',correct:true},{value:'60',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'50',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'58',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  _l3Q(91, {subSkill:'across_ten_backward',promptTemplate:'what_comes_before',keyIdea:_l3KI4,difficulty:'hard',prompt:'What number comes before 60?',visual:null,answer:'59',hint:'Before 60 comes 59 — the ones digit becomes 9.',
    choices:[{value:'59',correct:true},{value:'61',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'60',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'50',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  // 70→69 cluster
  _l3Q(92, {subSkill:'across_ten_backward',promptTemplate:'count_backward_sequence',keyIdea:_l3KI4,difficulty:'medium',prompt:'Count backward: 72, 71, 70, ___',visual:null,answer:'69',hint:'After 70, the ones digit becomes 9 and tens drop by 1.',
    choices:[{value:'69',correct:true},{value:'71',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'70',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 70 instead of moving back'},{value:'60',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(93, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 71, 70, ___',visual:null,answer:'69',hint:'After 70 comes 69 when counting backward.',
    choices:[{value:'69',correct:true},{value:'70',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'60',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'68',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntTens}),
  _l3Q(94, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 72, 71, 70, ___, 68',visual:null,answer:'69',hint:'The blank is right after 70.',
    choices:[{value:'69',correct:true},{value:'70',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'60',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'68',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  _l3Q(95, {subSkill:'across_ten_backward',promptTemplate:'what_comes_before',keyIdea:_l3KI4,difficulty:'hard',prompt:'What number comes before 70?',visual:null,answer:'69',hint:'Before 70 comes 69 — the ones digit becomes 9.',
    choices:[{value:'69',correct:true},{value:'71',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'70',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'60',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  // 80→79 cluster
  _l3Q(96, {subSkill:'across_ten_backward',promptTemplate:'count_backward_sequence',keyIdea:_l3KI4,difficulty:'medium',prompt:'Count backward: 82, 81, 80, ___',visual:null,answer:'79',hint:'After 80, the ones digit becomes 9 and tens drop by 1.',
    choices:[{value:'79',correct:true},{value:'81',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'80',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 80 instead of moving back'},{value:'70',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(97, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 81, 80, ___',visual:null,answer:'79',hint:'After 80 comes 79 when counting backward.',
    choices:[{value:'79',correct:true},{value:'80',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'70',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'78',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntTens}),
  _l3Q(98, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 82, 81, 80, ___, 78',visual:null,answer:'79',hint:'The blank is right after 80.',
    choices:[{value:'79',correct:true},{value:'80',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'70',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'78',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  _l3Q(99, {subSkill:'across_ten_backward',promptTemplate:'what_comes_before',keyIdea:_l3KI4,difficulty:'hard',prompt:'What number comes before 80?',visual:null,answer:'79',hint:'Before 80 comes 79 — the ones digit becomes 9.',
    choices:[{value:'79',correct:true},{value:'81',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'80',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'70',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  // 90→89 cluster
  _l3Q(100, {subSkill:'across_ten_backward',promptTemplate:'count_backward_sequence',keyIdea:_l3KI4,difficulty:'medium',prompt:'Count backward: 92, 91, 90, ___',visual:null,answer:'89',hint:'After 90, the ones digit becomes 9 and tens drop by 1.',
    choices:[{value:'89',correct:true},{value:'91',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'90',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 90 instead of moving back'},{value:'80',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(101, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 91, 90, ___',visual:null,answer:'89',hint:'After 90 comes 89 when counting backward.',
    choices:[{value:'89',correct:true},{value:'90',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'80',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'88',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntTens}),
  _l3Q(102, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 92, 91, 90, ___, 88',visual:null,answer:'89',hint:'The blank is right after 90.',
    choices:[{value:'89',correct:true},{value:'90',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'80',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'88',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  _l3Q(103, {subSkill:'across_ten_backward',promptTemplate:'what_comes_before',keyIdea:_l3KI4,difficulty:'hard',prompt:'What number comes before 90?',visual:null,answer:'89',hint:'Before 90 comes 89 — the ones digit becomes 9.',
    choices:[{value:'89',correct:true},{value:'91',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'90',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'80',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  // Extra across-ten questions to reach 35 (q-104 to q-106)
  _l3Q(104, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 51, 50, ___, 48',visual:null,answer:'49',hint:'50 − 1 = 49. Ones digit becomes 9.',
    choices:[{value:'49',correct:true},{value:'50',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'40',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'48',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  _l3Q(105, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 71, 70, ___, 68',visual:null,answer:'69',hint:'70 − 1 = 69. Ones digit becomes 9.',
    choices:[{value:'69',correct:true},{value:'70',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'60',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'68',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  _l3Q(106, {subSkill:'across_ten_backward',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'hard',prompt:'Fill in: 81, 80, ___, 78',visual:null,answer:'79',hint:'80 − 1 = 79. Ones digit becomes 9.',
    choices:[{value:'79',correct:true},{value:'80',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'70',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'78',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'}],
    intervention:_l3IntTens}),
  // ── Block H: across_100_to_99 (q-107 to q-128) ──────────────────────────────
  _l3Q(107, {subSkill:'across_100_to_99',promptTemplate:'what_comes_before',keyIdea:_l3KI5,difficulty:'hard',prompt:'What number comes before 100?',visual:null,answer:'99',hint:'Before 100 comes 99.',
    choices:[{value:'99',correct:true},{value:'101',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(108, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 101, 100, ___',visual:null,answer:'99',hint:'After 100 comes 99 when counting backward.',
    choices:[{value:'99',correct:true},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'},{value:'98',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntHundred}),
  _l3Q(109, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 102, 101, 100, ___',visual:null,answer:'99',hint:'100 − 1 = 99. We step into two-digit numbers.',
    choices:[{value:'99',correct:true},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'},{value:'98',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntHundred}),
  _l3Q(110, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Count backward: 101, ___, 99',visual:null,answer:'100',hint:'What number is between 101 and 99?',
    choices:[{value:'100',correct:true},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated first shown'},{value:'99',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(111, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 100, 99, ___',visual:null,answer:'98',hint:'99 − 1 = 98.',
    choices:[{value:'98',correct:true},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'},{value:'97',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntHundred}),
  _l3Q(112, {subSkill:'across_100_to_99',promptTemplate:'what_comes_before',keyIdea:_l3KI5,difficulty:'hard',prompt:'What number comes before 101?',visual:null,answer:'100',hint:'101 − 1 = 100.',
    choices:[{value:'100',correct:true},{value:'102',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(113, {subSkill:'across_100_to_99',promptTemplate:'count_backward_sequence',keyIdea:_l3KI5,difficulty:'hard',prompt:'Count backward: 103, 102, 101, 100, ___',visual:null,answer:'99',hint:'100 − 1 = 99. We cross into two-digit numbers.',
    choices:[{value:'99',correct:true},{value:'101',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(114, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 102, 101, ___, 99',visual:null,answer:'100',hint:'What is between 101 and 99?',
    choices:[{value:'100',correct:true},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'99',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(115, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 104, 103, ___, 101',visual:null,answer:'102',hint:'103 − 1 = 102.',
    choices:[{value:'102',correct:true},{value:'103',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'101',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'},{value:'104',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used number before blank'}],
    intervention:_l3IntHundred}),
  _l3Q(116, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 100, ___, 98',visual:null,answer:'99',hint:'100 − 1 = 99.',
    choices:[{value:'99',correct:true},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'98',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(117, {subSkill:'across_100_to_99',promptTemplate:'count_backward_sequence',keyIdea:_l3KI5,difficulty:'hard',prompt:'Count backward: 102, 101, ___',visual:null,answer:'100',hint:'101 − 1 = 100.',
    choices:[{value:'100',correct:true},{value:'102',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(118, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 103, ___, 101',visual:null,answer:'102',hint:'103 − 1 = 102.',
    choices:[{value:'102',correct:true},{value:'103',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'101',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'},{value:'104',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'}],
    intervention:_l3IntHundred}),
  _l3Q(119, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 111, 110, ___, 108',visual:null,answer:'109',hint:'110 − 1 = 109.',
    choices:[{value:'109',correct:true},{value:'110',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'108',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'},{value:'111',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used number before blank'}],
    intervention:_l3IntHundred}),
  _l3Q(120, {subSkill:'across_100_to_99',promptTemplate:'count_backward_sequence',keyIdea:_l3KI5,difficulty:'hard',prompt:'Count backward: 104, 103, 102, 101, ___',visual:null,answer:'100',hint:'101 − 1 = 100.',
    choices:[{value:'100',correct:true},{value:'102',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(121, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 103, 102, 101, ___, 99',visual:null,answer:'100',hint:'101 − 1 = 100.',
    choices:[{value:'100',correct:true},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'99',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(122, {subSkill:'across_100_to_99',promptTemplate:'what_comes_before',keyIdea:_l3KI5,difficulty:'hard',prompt:'What number comes before 102?',visual:null,answer:'101',hint:'102 − 1 = 101.',
    choices:[{value:'101',correct:true},{value:'103',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'102',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(123, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 101, ___, 99',visual:null,answer:'100',hint:'101 − 1 = 100.',
    choices:[{value:'100',correct:true},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'99',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(124, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 108, 107, ___, 105',visual:null,answer:'106',hint:'107 − 1 = 106.',
    choices:[{value:'106',correct:true},{value:'107',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'105',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'},{value:'108',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used number before blank'}],
    intervention:_l3IntHundred}),
  _l3Q(125, {subSkill:'across_100_to_99',promptTemplate:'count_backward_sequence',keyIdea:_l3KI5,difficulty:'hard',prompt:'Count backward: 100, 99, ___',visual:null,answer:'98',hint:'99 − 1 = 98.',
    choices:[{value:'98',correct:true},{value:'100',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(126, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 102, ___, 100',visual:null,answer:'101',hint:'102 − 1 = 101.',
    choices:[{value:'101',correct:true},{value:'102',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'100',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied number after blank'},{value:'103',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'}],
    intervention:_l3IntHundred}),
  _l3Q(127, {subSkill:'across_100_to_99',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 101, 100, 99, ___',visual:null,answer:'98',hint:'99 − 1 = 98.',
    choices:[{value:'98',correct:true},{value:'99',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'},{value:'97',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntHundred}),
  _l3Q(128, {subSkill:'across_100_to_99',promptTemplate:'count_backward_sequence',keyIdea:_l3KI5,difficulty:'hard',prompt:'Count backward: 103, 102, 101, ___',visual:null,answer:'100',hint:'101 − 1 = 100.',
    choices:[{value:'100',correct:true},{value:'102',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'101',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  // ── Block I: number_line_backward (q-129 to q-155) ───────────────────────────
  // q-129 to q-143: promptTemplate:'number_line_move_left', medium
  _l3Q(129, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 14. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:14,jumps:[{from:14,to:13,label:'-1'}]},
    answer:'13',hint:'One step left = one less.',
    choices:[{value:'13',correct:true},{value:'15',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'14',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'12',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(130, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 27. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:27,jumps:[{from:27,to:26,label:'-1'}]},
    answer:'26',hint:'One step left = one less.',
    choices:[{value:'26',correct:true},{value:'28',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'27',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'25',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(131, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 38. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:38,jumps:[{from:38,to:37,label:'-1'}]},
    answer:'37',hint:'One step left = one less.',
    choices:[{value:'37',correct:true},{value:'39',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'38',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'36',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(132, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 45. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:45,jumps:[{from:45,to:44,label:'-1'}]},
    answer:'44',hint:'One step left = one less.',
    choices:[{value:'44',correct:true},{value:'46',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'45',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'43',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(133, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 51. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:51,jumps:[{from:51,to:50,label:'-1'}]},
    answer:'50',hint:'One step left = one less. 51 − 1 = 50.',
    choices:[{value:'50',correct:true},{value:'52',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'51',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'40',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntForward}),
  _l3Q(134, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 63. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:63,jumps:[{from:63,to:62,label:'-1'}]},
    answer:'62',hint:'One step left = one less.',
    choices:[{value:'62',correct:true},{value:'64',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'63',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'61',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(135, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 72. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:72,jumps:[{from:72,to:71,label:'-1'}]},
    answer:'71',hint:'One step left = one less.',
    choices:[{value:'71',correct:true},{value:'73',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'72',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'70',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(136, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 84. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:84,jumps:[{from:84,to:83,label:'-1'}]},
    answer:'83',hint:'One step left = one less.',
    choices:[{value:'83',correct:true},{value:'85',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'84',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'82',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(137, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 56. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:56,jumps:[{from:56,to:55,label:'-1'}]},
    answer:'55',hint:'One step left = one less.',
    choices:[{value:'55',correct:true},{value:'57',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'56',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'54',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(138, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 34. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:34,jumps:[{from:34,to:33,label:'-1'}]},
    answer:'33',hint:'One step left = one less.',
    choices:[{value:'33',correct:true},{value:'35',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'34',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'32',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(139, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 67. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:67,jumps:[{from:67,to:66,label:'-1'}]},
    answer:'66',hint:'One step left = one less.',
    choices:[{value:'66',correct:true},{value:'68',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'67',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'65',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(140, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 78. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:78,jumps:[{from:78,to:77,label:'-1'}]},
    answer:'77',hint:'One step left = one less.',
    choices:[{value:'77',correct:true},{value:'79',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'78',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'76',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(141, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 43. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:43,jumps:[{from:43,to:42,label:'-1'}]},
    answer:'42',hint:'One step left = one less.',
    choices:[{value:'42',correct:true},{value:'44',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'43',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'41',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(142, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 31. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:31,jumps:[{from:31,to:30,label:'-1'}]},
    answer:'30',hint:'One step left = one less. 31 − 1 = 30.',
    choices:[{value:'30',correct:true},{value:'32',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'31',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'20',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntForward}),
  _l3Q(143, {subSkill:'number_line_backward',promptTemplate:'number_line_move_left',keyIdea:_l3KI6,difficulty:'medium',prompt:'The number line shows 71. Move 1 step to the left. Where do you land?',
    visual:{type:'numberLine',mark:71,jumps:[{from:71,to:70,label:'-1'}]},
    answer:'70',hint:'One step left = one less. 71 − 1 = 70.',
    choices:[{value:'70',correct:true},{value:'72',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'71',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'60',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntForward}),
  // q-144 to q-155: promptTemplate:'number_line_arrow_lands', hard
  _l3Q(144, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:42,jumps:[{from:42,to:41,label:'-1'}]},
    answer:'41',hint:'The arrow moves 1 step left from 42.',
    choices:[{value:'41',correct:true},{value:'43',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'42',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'40',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(145, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:60,jumps:[{from:60,to:59,label:'-1'}]},
    answer:'59',hint:'The arrow moves 1 step left from 60. That crosses the ten boundary.',
    choices:[{value:'59',correct:true},{value:'61',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'60',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'50',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(146, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:100,jumps:[{from:100,to:99,label:'-1'}]},
    answer:'99',hint:'The arrow moves 1 step left from 100. Before 100 comes 99.',
    choices:[{value:'99',correct:true},{value:'101',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(147, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:110,jumps:[{from:110,to:109,label:'-1'}]},
    answer:'109',hint:'The arrow moves 1 step left from 110.',
    choices:[{value:'109',correct:true},{value:'111',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'110',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'100',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntForward}),
  _l3Q(148, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:74,jumps:[{from:74,to:73,label:'-1'}]},
    answer:'73',hint:'The arrow moves 1 step left from 74.',
    choices:[{value:'73',correct:true},{value:'75',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'74',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'72',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(149, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:85,jumps:[{from:85,to:84,label:'-1'}]},
    answer:'84',hint:'The arrow moves 1 step left from 85.',
    choices:[{value:'84',correct:true},{value:'86',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'85',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'83',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(150, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:97,jumps:[{from:97,to:96,label:'-1'}]},
    answer:'96',hint:'The arrow moves 1 step left from 97.',
    choices:[{value:'96',correct:true},{value:'98',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'97',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'95',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(151, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:53,jumps:[{from:53,to:52,label:'-1'}]},
    answer:'52',hint:'The arrow moves 1 step left from 53.',
    choices:[{value:'52',correct:true},{value:'54',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'53',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'51',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(152, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:69,jumps:[{from:69,to:68,label:'-1'}]},
    answer:'68',hint:'The arrow moves 1 step left from 69.',
    choices:[{value:'68',correct:true},{value:'70',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'69',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'67',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(153, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:79,jumps:[{from:79,to:78,label:'-1'}]},
    answer:'78',hint:'The arrow moves 1 step left from 79.',
    choices:[{value:'78',correct:true},{value:'80',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'79',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'77',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  _l3Q(154, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:91,jumps:[{from:91,to:90,label:'-1'}]},
    answer:'90',hint:'The arrow moves 1 step left from 91.',
    choices:[{value:'90',correct:true},{value:'92',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'91',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'80',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntForward}),
  _l3Q(155, {subSkill:'number_line_backward',promptTemplate:'number_line_arrow_lands',keyIdea:_l3KI6,difficulty:'hard',prompt:'What number does the arrow land on?',
    visual:{type:'numberLine',mark:118,jumps:[{from:118,to:117,label:'-1'}]},
    answer:'117',hint:'The arrow moves 1 step left from 118.',
    choices:[{value:'117',correct:true},{value:'119',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Moved right instead of left'},{value:'118',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start'},{value:'116',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps left'}],
    intervention:_l3IntForward}),
  // ── Block K: count_backward_multiple_steps (q-156 to q-170) ─────────────────
  _l3Q(156, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_multiple_steps',keyIdea:_l3KI1,difficulty:'easy',prompt:'Start at 10. Count backward 3 numbers. What are they?',
    visual:null,answer:'9, 8, 7',hint:'Subtract 1 three times starting at 10.',
    choices:[{value:'9, 8, 7',correct:true},{value:'11, 12, 13',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'9, 8, 6',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps on the last step'},{value:'9, 9, 8',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 9 instead of continuing backward'}],
    intervention:_l3IntForward}),
  _l3Q(157, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_multiple_steps',keyIdea:_l3KI1,difficulty:'easy',prompt:'Start at 15. Count backward 3 numbers. What are they?',
    visual:null,answer:'14, 13, 12',hint:'Subtract 1 three times starting at 15.',
    choices:[{value:'14, 13, 12',correct:true},{value:'16, 17, 18',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'14, 13, 11',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps on the last step'},{value:'14, 14, 13',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 14 instead of continuing backward'}],
    intervention:_l3IntForward}),
  _l3Q(158, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_multiple_steps',keyIdea:_l3KI1,difficulty:'easy',prompt:'Start at 20. Count backward 3 numbers. What are they?',
    visual:null,answer:'19, 18, 17',hint:'Subtract 1 three times starting at 20.',
    choices:[{value:'19, 18, 17',correct:true},{value:'21, 22, 23',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'19, 18, 16',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps on the last step'},{value:'19, 19, 18',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 19 instead of continuing backward'}],
    intervention:_l3IntForward}),
  _l3Q(159, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_multiple_steps',keyIdea:_l3KI1,difficulty:'easy',prompt:'Start at 8. Count backward 3 numbers. What are they?',
    visual:null,answer:'7, 6, 5',hint:'Subtract 1 three times starting at 8.',
    choices:[{value:'7, 6, 5',correct:true},{value:'9, 10, 11',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'7, 6, 4',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps on the last step'},{value:'7, 7, 6',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 7 instead of continuing backward'}],
    intervention:_l3IntForward}),
  _l3Q(160, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_multiple_steps',keyIdea:_l3KI2,difficulty:'easy',prompt:'Start at 25. Count backward 4 numbers. What are they?',
    visual:null,answer:'24, 23, 22, 21',hint:'Subtract 1 four times starting at 25.',
    choices:[{value:'24, 23, 22, 21',correct:true},{value:'26, 27, 28, 29',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'24, 23, 22, 20',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps on the last step'},{value:'24, 24, 23, 22',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 24 instead of continuing backward'}],
    intervention:_l3IntForward}),
  _l3Q(161, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_last_number',keyIdea:_l3KI2,difficulty:'medium',prompt:'Start at 45. Count backward 4 steps. What number do you land on?',
    visual:null,answer:'41',hint:'Subtract 1 four times: 44, 43, 42, 41.',
    choices:[{value:'41',correct:true},{value:'49',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'42',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Only went 3 steps'},{value:'40',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Went 5 steps instead of 4'}],
    intervention:_l3IntForward}),
  _l3Q(162, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_last_number',keyIdea:_l3KI4,difficulty:'medium',prompt:'Start at 32. Count backward 3 steps. What number do you land on?',
    visual:null,answer:'29',hint:'32 → 31 → 30 → 29. Crossing a ten means the ones become 9.',
    choices:[{value:'29',correct:true},{value:'35',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'30',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Only went 2 steps'},{value:'20',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(163, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_multiple_steps',keyIdea:_l3KI2,difficulty:'medium',prompt:'Start at 67. Count backward 3 numbers. What are they?',
    visual:null,answer:'66, 65, 64',hint:'Subtract 1 three times starting at 67.',
    choices:[{value:'66, 65, 64',correct:true},{value:'68, 69, 70',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'66, 65, 63',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps on the last step'},{value:'66, 66, 65',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated 66 instead of continuing backward'}],
    intervention:_l3IntForward}),
  _l3Q(164, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_last_number',keyIdea:_l3KI2,difficulty:'medium',prompt:'Start at 58. Count backward 5 steps. What number do you land on?',
    visual:null,answer:'53',hint:'Subtract 1 five times: 57, 56, 55, 54, 53.',
    choices:[{value:'53',correct:true},{value:'63',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'54',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Only went 4 steps'},{value:'52',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Went 6 steps instead of 5'}],
    intervention:_l3IntForward}),
  _l3Q(165, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_last_number',keyIdea:_l3KI4,difficulty:'medium',prompt:'Start at 41. Count backward 2 steps. What number do you land on?',
    visual:null,answer:'39',hint:'41 → 40 → 39. Crosses a ten going backward.',
    choices:[{value:'39',correct:true},{value:'43',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'40',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Only went 1 step'},{value:'30',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntTens}),
  _l3Q(166, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_last_number',keyIdea:_l3KI2,difficulty:'medium',prompt:'Start at 80. Count backward 4 steps. What number do you land on?',
    visual:null,answer:'76',hint:'80 → 79 → 78 → 77 → 76.',
    choices:[{value:'76',correct:true},{value:'84',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'77',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Only went 3 steps'},{value:'70',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntForward}),
  _l3Q(167, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_last_number',keyIdea:_l3KI2,difficulty:'medium',prompt:'Start at 73. Count backward 3 steps. What number do you land on?',
    visual:null,answer:'70',hint:'73 → 72 → 71 → 70.',
    choices:[{value:'70',correct:true},{value:'76',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'71',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Only went 2 steps'},{value:'60',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'}],
    intervention:_l3IntForward}),
  _l3Q(168, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_last_number',keyIdea:_l3KI5,difficulty:'hard',prompt:'Start at 102. Count backward 3 steps. What number do you land on?',
    visual:null,answer:'99',hint:'102 → 101 → 100 → 99. This crosses from 100 into two-digit numbers.',
    choices:[{value:'99',correct:true},{value:'105',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'100',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Only went 2 steps'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(169, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_last_number',keyIdea:_l3KI5,difficulty:'hard',prompt:'Start at 101. Count backward 2 steps. What number do you land on?',
    visual:null,answer:'99',hint:'101 → 100 → 99.',
    choices:[{value:'99',correct:true},{value:'103',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'100',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Only went 1 step'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(170, {subSkill:'count_backward_multiple_steps',promptTemplate:'count_backward_last_number',keyIdea:_l3KI2,difficulty:'hard',prompt:'Start at 117. Count backward 5 steps. What number do you land on?',
    visual:null,answer:'112',hint:'117 → 116 → 115 → 114 → 113 → 112.',
    choices:[{value:'112',correct:true},{value:'122',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward instead of backward'},{value:'113',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Only went 4 steps'},{value:'111',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Went 6 steps instead of 5'}],
    intervention:_l3IntForward}),
  // ── Block J: mixed_backward_review (q-171 to q-195) ──────────────────────────
  _l3Q(171, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 10, 9, ___, 7',visual:null,answer:'8',hint:'What comes after 9 when counting backward?',
    choices:[{value:'8',correct:true},{value:'9',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'7',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'},{value:'10',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'}],
    intervention:_l3IntSeq}),
  _l3Q(172, {subSkill:'mixed_backward_review',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 11?',visual:null,answer:'10',hint:'What is 1 less than 11?',
    choices:[{value:'10',correct:true},{value:'12',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'11',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'9',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntForward}),
  _l3Q(173, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 3, ___, 1',visual:null,answer:'2',hint:'What comes between 3 and 1?',
    choices:[{value:'2',correct:true},{value:'3',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'1',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'},{value:'4',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'}],
    intervention:_l3IntSeq}),
  _l3Q(174, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI1,difficulty:'easy',prompt:'Fill in: 16, 15, ___, 13',visual:null,answer:'14',hint:'Subtract 1 from 15.',
    choices:[{value:'14',correct:true},{value:'15',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'13',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'},{value:'16',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used start number'}],
    intervention:_l3IntSeq}),
  _l3Q(175, {subSkill:'mixed_backward_review',promptTemplate:'what_comes_before',keyIdea:_l3KI1,difficulty:'easy',prompt:'What number comes before 16?',visual:null,answer:'15',hint:'What is 1 less than 16?',
    choices:[{value:'15',correct:true},{value:'17',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'16',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'14',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntForward}),
  _l3Q(176, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 45, 44, ___, 42',visual:null,answer:'43',hint:'Subtract 1 from 44.',
    choices:[{value:'43',correct:true},{value:'44',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'42',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'},{value:'45',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used start number'}],
    intervention:_l3IntSeq}),
  _l3Q(177, {subSkill:'mixed_backward_review',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 57?',visual:null,answer:'56',hint:'57 − 1 = 56.',
    choices:[{value:'56',correct:true},{value:'58',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'57',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'55',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntForward}),
  _l3Q(178, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 41, 40, ___, 38',visual:null,answer:'39',hint:'Before 40 comes 39 — crosses a ten.',
    choices:[{value:'39',correct:true},{value:'40',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'30',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'38',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'}],
    intervention:_l3IntTens}),
  _l3Q(179, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 61, 60, ___, 58',visual:null,answer:'59',hint:'Before 60 comes 59 — crosses a ten.',
    choices:[{value:'59',correct:true},{value:'60',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'50',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'58',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'}],
    intervention:_l3IntTens}),
  _l3Q(180, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 87, 86, ___, 84',visual:null,answer:'85',hint:'Subtract 1 from 86.',
    choices:[{value:'85',correct:true},{value:'86',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'84',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'},{value:'87',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used start number'}],
    intervention:_l3IntSeq}),
  _l3Q(181, {subSkill:'mixed_backward_review',promptTemplate:'what_comes_before',keyIdea:_l3KI2,difficulty:'medium',prompt:'What number comes before 47?',visual:null,answer:'46',hint:'What is 1 less than 47?',
    choices:[{value:'46',correct:true},{value:'48',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'47',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'45',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntForward}),
  _l3Q(182, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 91, 90, ___, 88',visual:null,answer:'89',hint:'Before 90 comes 89.',
    choices:[{value:'89',correct:true},{value:'90',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'80',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'88',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'}],
    intervention:_l3IntTens}),
  _l3Q(183, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 63, ___, 61',visual:null,answer:'62',hint:'63 − 1 = 62.',
    choices:[{value:'62',correct:true},{value:'63',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'61',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'},{value:'64',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'}],
    intervention:_l3IntSeq}),
  _l3Q(184, {subSkill:'mixed_backward_review',promptTemplate:'count_backward_sequence',keyIdea:_l3KI2,difficulty:'medium',prompt:'Count backward: 55, 54, 53, ___',visual:null,answer:'52',hint:'53 − 1 = 52.',
    choices:[{value:'52',correct:true},{value:'54',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'53',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'51',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntForward}),
  _l3Q(185, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 31, 30, ___, 28',visual:null,answer:'29',hint:'Before 30 comes 29 — the tens digit drops by 1.',
    choices:[{value:'29',correct:true},{value:'30',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'20',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'28',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'}],
    intervention:_l3IntTens}),
  _l3Q(186, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 105, 104, 103, ___',visual:null,answer:'102',hint:'103 − 1 = 102.',
    choices:[{value:'102',correct:true},{value:'103',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'},{value:'101',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntHundred}),
  _l3Q(187, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 117, 116, ___, 114',visual:null,answer:'115',hint:'116 − 1 = 115.',
    choices:[{value:'115',correct:true},{value:'116',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'114',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'},{value:'117',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used start number'}],
    intervention:_l3IntSeq}),
  _l3Q(188, {subSkill:'mixed_backward_review',promptTemplate:'what_comes_before',keyIdea:_l3KI5,difficulty:'hard',prompt:'What number comes before 105?',visual:null,answer:'104',hint:'105 − 1 = 104.',
    choices:[{value:'104',correct:true},{value:'106',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'105',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated start'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred}),
  _l3Q(189, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'hard',prompt:'Fill in: 116, ___, 114',visual:null,answer:'115',hint:'116 − 1 = 115.',
    choices:[{value:'115',correct:true},{value:'116',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'114',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'},{value:'117',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'}],
    intervention:_l3IntSeq}),
  _l3Q(190, {subSkill:'mixed_backward_review',promptTemplate:'count_backward_sequence',keyIdea:_l3KI4,difficulty:'medium',prompt:'Count backward: 33, 32, 31, ___',visual:null,answer:'30',hint:'31 − 1 = 30.',
    choices:[{value:'30',correct:true},{value:'32',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Counted forward'},{value:'31',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'29',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntForward}),
  _l3Q(191, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI4,difficulty:'medium',prompt:'Fill in: 21, 20, ___, 18',visual:null,answer:'19',hint:'Before 20 comes 19 — the tens digit drops by 1.',
    choices:[{value:'19',correct:true},{value:'20',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'10',correct:false,errorTag:'err_backward_tens_transition_error',misconceptionExplanation:'Dropped to wrong ten'},{value:'18',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'}],
    intervention:_l3IntTens}),
  _l3Q(192, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 74, 73, ___, 71',visual:null,answer:'72',hint:'73 − 1 = 72.',
    choices:[{value:'72',correct:true},{value:'73',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'71',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'},{value:'74',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used start number'}],
    intervention:_l3IntSeq}),
  _l3Q(193, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI5,difficulty:'hard',prompt:'Fill in: 103, 102, ___',visual:null,answer:'101',hint:'102 − 1 = 101.',
    choices:[{value:'101',correct:true},{value:'102',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'},{value:'100',correct:false,errorTag:'err_skipped_backward_number',misconceptionExplanation:'Jumped two steps back'}],
    intervention:_l3IntHundred}),
  _l3Q(194, {subSkill:'mixed_backward_review',promptTemplate:'fill_in_middle',keyIdea:_l3KI2,difficulty:'medium',prompt:'Fill in: 84, 83, ___, 81',visual:null,answer:'82',hint:'83 − 1 = 82.',
    choices:[{value:'82',correct:true},{value:'83',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated last shown'},{value:'81',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied next number'},{value:'84',correct:false,errorTag:'err_counted_forward_instead',misconceptionExplanation:'Used start number'}],
    intervention:_l3IntSeq}),
  _l3Q(195, {subSkill:'mixed_backward_review',promptTemplate:'what_comes_before',keyIdea:_l3KI5,difficulty:'hard',prompt:'Count backward: 100, ___, 98',visual:null,answer:'99',hint:'After 100 comes 99.',
    choices:[{value:'99',correct:true},{value:'100',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated A'},{value:'98',correct:false,errorTag:'err_sequence_order_error',misconceptionExplanation:'Copied C'},{value:'90',correct:false,errorTag:'err_backward_hundred_transition_error',misconceptionExplanation:'Dropped to wrong hundred'}],
    intervention:_l3IntHundred})
]; // end _l3QuizBank — 195 questions total

// ─── Lesson Quiz Attempt ──────────────────────────────────────────────────────

const _l3QuizAttempt = {
  questionCount: 8,
  difficultyMix: { easy: 3, medium: 4, hard: 1 },
  sourceRule: 'this_lesson_quizbank_only',
  avoidRecentlySeen: true,
  noDuplicatesWithinAttempt: true,
  balanceBySubSkill: true,
  maxNumberLineQuestions: 2,
  maxSamePromptTemplate: 2,
  maxSimplePreviousNumberPrompts: 2,
  requiredSubSkills: [
    'what_comes_before',
    'missing_number_backward_sequence',
    'count_backward_multiple_steps',
    'across_ten_backward',
    'across_100_to_99',
    'number_line_backward',
    'mixed_backward_review'
  ]
};

// ─── Diagnostics ──────────────────────────────────────────────────────────────

const _l3Diagnostics = {
  errorTags: [
    'err_counted_forward_instead',
    'err_skipped_backward_number',
    'err_repeated_number',
    'err_backward_tens_transition_error',
    'err_backward_hundred_transition_error',
    'err_sequence_direction_error',
    'err_sequence_order_error'
  ],
  interventionRules: [
    { errorTag: 'err_counted_forward_instead',           style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_skipped_backward_number',           style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_repeated_number',                   style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_backward_tens_transition_error',    style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_backward_hundred_transition_error', style: 'visual_model', followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_sequence_direction_error',          style: 'reteach',      followUpRule: 'same_skill_new_numbers' },
    { errorTag: 'err_sequence_order_error',              style: 'reteach',      followUpRule: 'same_skill_new_numbers' }
  ]
};

// ─── Spec Object ──────────────────────────────────────────────────────────────

const _l3Spec = {
  lessonId: 'g1-u1-l3',
  title: 'Count Backward',
  teks: ['1.5A'],
  skill: 'count_backward_from_any_number',
  keyIdeas:          _l3KeyIdeas,
  workedExamples:    _l3Examples,
  practiceQuestions: _l3Practice,
  quizBank:          _l3QuizBank,
  lessonQuizAttempt: _l3QuizAttempt,
  diagnostics:       _l3Diagnostics
};

// ════════════════════════════════════════════════════════════════════════════
//  Lesson 1.4 — Skip Count by 2s, 5s, and 10s (v0.2.0)
//  TEKS 1.5B · skip_count_to_find_totals
// ════════════════════════════════════════════════════════════════════════════

// ── Key ideas ────────────────────────────────────────────────────────────────
const _l4KeyIdeas = [
  'Skip counting means counting by equal jumps.',
  'Counting by 2s means saying every second number.',
  'Counting by 5s means adding 5 each time.',
  'Counting by 10s means adding 10 each time.',
  'Equal groups help you count faster.',
  'On a number line, skip counting means making equal jumps.'
];
const _l4KI1 = _l4KeyIdeas[0];
const _l4KI2 = _l4KeyIdeas[1];
const _l4KI3 = _l4KeyIdeas[2];
const _l4KI4 = _l4KeyIdeas[3];
const _l4KI5 = _l4KeyIdeas[4];
const _l4KI6 = _l4KeyIdeas[5];

// ── Shared interventions ──────────────────────────────────────────────────────
const _l4IntCountedByOnes = {
  errorTag: 'err_counted_by_ones_instead',
  title: 'Skip Count, Not Count by 1s',
  teachingSteps: [
    'Skip counting means jumping by the same amount each time, not adding 1.',
    'For counting by 2s, say every second number: 2, 4, 6, 8 — each jump is +2.'
  ],
  correctAnswerExplanation: 'Each jump adds 2 (or 5 or 10). Count the jumps, not each step of 1.',
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
};
const _l4IntWrongInterval = {
  errorTag: 'err_wrong_skip_count_interval',
  title: 'Use the Right Jump Size',
  teachingSteps: [
    'Look at the numbers in the sequence. How much does each number increase?',
    'That increase is your jump size. Use the same jump size every time.'
  ],
  correctAnswerExplanation: 'Find the gap between two consecutive numbers. Keep that same gap every jump.',
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
};
const _l4IntPatternBreak = {
  errorTag: 'err_skip_count_pattern_break',
  title: 'Keep the Pattern Going',
  teachingSteps: [
    'In a skip-count sequence, every jump is exactly the same size.',
    'Add the same amount to the last number in the sequence to find the next one.'
  ],
  correctAnswerExplanation: 'The pattern never changes size. Find the jump and add it one more time.',
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
};
const _l4IntGroupCounting = {
  errorTag: 'err_group_counting_error',
  title: 'Count the Total, Not the Groups',
  teachingSteps: [
    'The question asks for the total number of objects, not how many groups there are.',
    'Skip count the group size for every group: each group adds the same amount.'
  ],
  correctAnswerExplanation: 'Count each group by the group size. Add that amount once per group.',
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
};
const _l4IntTensTransition = {
  errorTag: 'err_skip_count_tens_transition_error',
  title: 'Keep Going Past the Round Number',
  teachingSteps: [
    'When skip counting reaches a round number like 10, 20, or 100, keep going.',
    'Add the same jump size again: 8, 10, 12 — the jump is +2, so after 10 comes 12.'
  ],
  correctAnswerExplanation: 'The jump size never changes at tens. Add it past the round number.',
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
};
const _l4IntRepeated = {
  errorTag: 'err_repeated_number',
  title: 'Move Forward, Not Stay',
  teachingSteps: [
    'The next number in a sequence must be different from the last one.',
    'Add the jump size to the last number to find the next number.'
  ],
  correctAnswerExplanation: 'Skip counting always moves forward. Add the jump size once more.',
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
};
const _l4IntSkippedGroup = {
  errorTag: 'err_skipped_group',
  title: 'Count Every Group',
  teachingSteps: [
    'Make sure you count each group exactly once.',
    'Point to each group and say the next skip-count number out loud.'
  ],
  correctAnswerExplanation: 'Every group adds to the total. Skip counting one group is a big jump.',
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
};
const _l4IntOvercounted = {
  errorTag: 'err_overcounted_group',
  title: 'Stop After the Last Group',
  teachingSteps: [
    'Count one number per group. When you run out of groups, stop.',
    'If there are 3 groups of 2: say 2, 4, 6 — then stop.'
  ],
  correctAnswerExplanation: 'Count exactly one number per group, then stop.',
  followUpRule: 'same_skill_new_numbers',
  doNotRepeatOriginalQuestion: true
};

// ── Factory functions ─────────────────────────────────────────────────────────
function _l4Q(n, obj) {
  return Object.assign({
    id: 'g1-u1-l4-q-' + String(n).padStart(3,'0'),
    teks: ['1.5B'],
    lessonId: 'g1-u1-l4',
    skill: 'skip_count_to_find_totals',
    interactionType: 'multipleChoice',
    followUpRule: 'same_skill_new_numbers'
  }, obj);
}
function _l4P(n, obj) {
  return Object.assign({
    id: 'g1-u1-l4-p-' + String(n).padStart(3,'0'),
    teks: ['1.5B'],
    lessonId: 'g1-u1-l4',
    skill: 'skip_count_to_find_totals',
    interactionType: 'multipleChoice'
  }, obj);
}

// ── Worked examples ───────────────────────────────────────────────────────────
const _l4Examples = [
  {
    id: 'g1-u1-l4-ex-001',
    title: 'Count Pairs by 2s',
    prompt: 'There are 4 pairs of mittens. How many mittens in all?',
    visual: { type: 'objectSet', emoji: '🧤', groups: 4, groupSize: 2 },
    steps: [
      'Each pair is a group of 2.',
      'Count by 2s, one number for each pair: 2, 4, 6, 8.',
      'There are 8 mittens in all.'
    ],
    finalAnswer: '8',
    teachingNote: 'Pairs are the most natural 2s context. Emphasize the +2 jump for each pair.',
    relatedKeyIdea: 'Counting by 2s means saying every second number.'
  },
  {
    id: 'g1-u1-l4-ex-002',
    title: 'Count Hands by 5s',
    prompt: 'How many fingers are on 3 hands?',
    visual: { type: 'objectSet', emoji: '✋', groups: 3, groupSize: 5 },
    steps: [
      'Each hand has 5 fingers.',
      'Count by 5s, one number for each hand: 5, 10, 15.',
      'There are 15 fingers in all.'
    ],
    finalAnswer: '15',
    teachingNote: 'Hands are the canonical 5s context. Use the rhythm "five, ten, fifteen".',
    relatedKeyIdea: 'Counting by 5s means adding 5 each time.'
  },
  {
    id: 'g1-u1-l4-ex-003',
    title: 'Count Stacks by 10s',
    prompt: 'There are 5 stacks of 10 cubes. How many cubes in all?',
    visual: { type: 'base10', config: { tens: 5, ones: 0 } },
    steps: [
      'Each stack has 10 cubes.',
      'Count by 10s, one number for each stack: 10, 20, 30, 40, 50.',
      'There are 50 cubes in all.'
    ],
    finalAnswer: '50',
    teachingNote: 'Base-ten rods reinforce that one rod = ten.',
    relatedKeyIdea: 'Counting by 10s means adding 10 each time.'
  },
  {
    id: 'g1-u1-l4-ex-004',
    title: 'Missing Number in a 2s Sequence',
    prompt: 'Fill in the blank: 4, 6, ___, 10',
    visual: null,
    steps: [
      'Look at the jump from 4 to 6. That is +2.',
      'Each jump adds 2, so after 6 comes 8.',
      'Check: 8 + 2 = 10. ✓'
    ],
    finalAnswer: '8',
    teachingNote: 'Have students state the jump size before filling in the blank.',
    relatedKeyIdea: 'Skip counting means counting by equal jumps.'
  },
  {
    id: 'g1-u1-l4-ex-005',
    title: 'Missing Number in a 5s Sequence',
    prompt: 'Fill in the blank: 10, 15, ___, 25',
    visual: null,
    steps: [
      'Look at the jump from 10 to 15. That is +5.',
      'Each jump adds 5, so after 15 comes 20.',
      'Check: 20 + 5 = 25. ✓'
    ],
    finalAnswer: '20',
    teachingNote: 'Reinforce that the jump stays the same throughout the sequence.',
    relatedKeyIdea: 'Skip counting means counting by equal jumps.'
  },
  {
    id: 'g1-u1-l4-ex-006',
    title: 'Missing Number in a 10s Sequence',
    prompt: 'Fill in the blank: 30, 40, ___, 60',
    visual: null,
    steps: [
      'Look at the jump from 30 to 40. That is +10.',
      'Each jump adds 10, so after 40 comes 50.',
      'Check: 50 + 10 = 60. ✓'
    ],
    finalAnswer: '50',
    teachingNote: 'Ten-jumps are large and visible — great for building number sense.',
    relatedKeyIdea: 'Skip counting means counting by equal jumps.'
  },
  {
    id: 'g1-u1-l4-ex-007',
    title: 'Number Line Jumps by 2',
    prompt: 'This number line shows equal jumps of 2. Start at 0 and make 4 jumps. Where do you land?',
    visual: {
      type: 'numberLine',
      min: 0, max: 10,
      ticks: [0, 2, 4, 6, 8, 10],
      mark: 0,
      jumps: [
        { from: 0, to: 2, label: '+2', hideToLabel: false },
        { from: 2, to: 4, label: '+2', hideToLabel: false },
        { from: 4, to: 6, label: '+2', hideToLabel: false },
        { from: 6, to: 8, label: '+2', hideToLabel: false }
      ]
    },
    steps: [
      'Start at 0.',
      'Each arc jumps +2. Count the arcs: 2, 4, 6, 8.',
      'After 4 jumps you land on 8.'
    ],
    finalAnswer: '8',
    teachingNote: 'The arc labels +2 make the equal-jump structure explicit.',
    relatedKeyIdea: 'On a number line, skip counting means making equal jumps.'
  },
  {
    id: 'g1-u1-l4-ex-008',
    title: 'Number Line Jumps by 5',
    prompt: 'This number line shows equal jumps of 5. Start at 0 and make 3 jumps. Where do you land?',
    visual: {
      type: 'numberLine',
      min: 0, max: 20,
      ticks: [0, 5, 10, 15, 20],
      mark: 0,
      jumps: [
        { from: 0,  to: 5,  label: '+5', hideToLabel: false },
        { from: 5,  to: 10, label: '+5', hideToLabel: false },
        { from: 10, to: 15, label: '+5', hideToLabel: false }
      ]
    },
    steps: [
      'Start at 0.',
      'Each arc jumps +5. Count: 5, 10, 15.',
      'After 3 jumps you land on 15.'
    ],
    finalAnswer: '15',
    teachingNote: 'Large arcs for +5 make the rhythm visible.',
    relatedKeyIdea: 'On a number line, skip counting means making equal jumps.'
  },
  {
    id: 'g1-u1-l4-ex-009',
    title: 'Number Line Jumps by 10',
    prompt: 'This number line shows equal jumps of 10. Start at 0 and make 4 jumps. Where do you land?',
    visual: {
      type: 'numberLine',
      min: 0, max: 50,
      ticks: [0, 10, 20, 30, 40, 50],
      mark: 0,
      jumps: [
        { from: 0,  to: 10, label: '+10', hideToLabel: false },
        { from: 10, to: 20, label: '+10', hideToLabel: false },
        { from: 20, to: 30, label: '+10', hideToLabel: false },
        { from: 30, to: 40, label: '+10', hideToLabel: false }
      ]
    },
    steps: [
      'Start at 0.',
      'Each arc jumps +10. Count: 10, 20, 30, 40.',
      'After 4 jumps you land on 40.'
    ],
    finalAnswer: '40',
    teachingNote: '+10 jumps feel large. Emphasize that each arc is equal.',
    relatedKeyIdea: 'On a number line, skip counting means making equal jumps.'
  },
  {
    id: 'g1-u1-l4-ex-010',
    title: 'Common Mistake: Counting by 1s',
    prompt: 'Here are 3 pairs of shoes. A student says there are 4 shoes. What is the mistake?',
    visual: { type: 'objectSet', emoji: '👟', groups: 3, groupSize: 2 },
    steps: [
      'The student counted: 1, 2, 3, 4 — but stopped too early.',
      'Each pair is a group of 2, not just 1.',
      'Count by 2s for each pair: 2, 4, 6. There are 6 shoes.'
    ],
    finalAnswer: '6',
    teachingNote: 'Common error: students count groups as individuals. Use this to emphasize "count the size of each group".',
    relatedKeyIdea: 'Equal groups help you count faster.'
  },
  {
    id: 'g1-u1-l4-ex-011',
    title: 'Common Mistake: Switching Interval',
    prompt: 'A student is counting by 5s and writes: 5, 10, 12, 15. What is wrong?',
    visual: null,
    steps: [
      'From 10 to 12 is only +2 — the student switched to counting by 2s.',
      'When counting by 5s, every jump must be +5.',
      'The correct sequence is: 5, 10, 15, 20.'
    ],
    finalAnswer: '5, 10, 15, 20',
    teachingNote: 'Switching intervals is a common error. Have students check each gap.',
    relatedKeyIdea: 'Skip counting means counting by equal jumps.'
  },
  {
    id: 'g1-u1-l4-ex-012',
    title: 'Mixed Review: Groups and Number Line',
    prompt: 'There are 2 groups of 10 blocks. How many blocks in all?',
    visual: { type: 'objectSet', emoji: '🟦', groups: 2, groupSize: 10 },
    steps: [
      'Each group has 10 blocks.',
      'Count by 10s: 10, 20.',
      'There are 20 blocks in all.'
    ],
    finalAnswer: '20',
    teachingNote: 'Consolidation: connect equal groups to the 10s skip-count sequence.',
    relatedKeyIdea: 'Equal groups help you count faster.'
  }
];

// ── Practice questions ────────────────────────────────────────────────────────
const _l4Practice = [
  _l4P(1,  { difficulty:'easy',   subSkill:'skip_count_by_2s',            promptTemplate:'count_by_2s_sequence',     keyIdea:_l4KI2,
    prompt:'Count by 2s: 2, 4, ___', answer:'6', hint:'What is 2 more than 4?', explanation:'Adding 2 each time: 2, 4, 6.',
    choices:[{value:'6',correct:true},{value:'5',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 2',distractorType:'counted_by_ones'},{value:'8',correct:false,errorTag:'err_skipped_group',misconceptionExplanation:'Jumped two steps',distractorType:'skipped_group'},{value:'4',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(2,  { difficulty:'easy',   subSkill:'skip_count_by_2s',            promptTemplate:'count_by_2s_sequence',     keyIdea:_l4KI2,
    prompt:'Count by 2s: 6, 8, ___', answer:'10', hint:'What is 2 more than 8?', explanation:'Adding 2 each time: 6, 8, 10.',
    choices:[{value:'10',correct:true},{value:'9',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 2',distractorType:'counted_by_ones'},{value:'12',correct:false,errorTag:'err_skipped_group',misconceptionExplanation:'Jumped two steps',distractorType:'skipped_group'},{value:'8',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(3,  { difficulty:'medium', subSkill:'skip_count_by_2s',            promptTemplate:'count_by_2s_sequence',     keyIdea:_l4KI2,
    prompt:'Fill in: 20, 22, ___, 26', answer:'24', hint:'Count by 2s from 22.', explanation:'22 + 2 = 24.',
    choices:[{value:'24',correct:true},{value:'23',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 2',distractorType:'counted_by_ones'},{value:'25',correct:false,errorTag:'err_skip_count_pattern_break',misconceptionExplanation:'Did not follow the +2 pattern',distractorType:'pattern_break'},{value:'22',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(4,  { difficulty:'hard',   subSkill:'skip_count_by_2s',            promptTemplate:'missing_skip_count_number', keyIdea:_l4KI2,
    prompt:'Fill in: 46, 48, ___, 52', answer:'50', hint:'Count by 2s from 48.', explanation:'48 + 2 = 50.',
    choices:[{value:'50',correct:true},{value:'49',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 2',distractorType:'counted_by_ones'},{value:'51',correct:false,errorTag:'err_skip_count_pattern_break',misconceptionExplanation:'Did not keep the +2 pattern',distractorType:'pattern_break'},{value:'54',correct:false,errorTag:'err_skipped_group',misconceptionExplanation:'Jumped two steps',distractorType:'skipped_group'}] }),
  _l4P(5,  { difficulty:'easy',   subSkill:'skip_count_by_5s',            promptTemplate:'count_by_5s_sequence',     keyIdea:_l4KI3,
    prompt:'Count by 5s: 5, 10, ___', answer:'15', hint:'What is 5 more than 10?', explanation:'Adding 5 each time: 5, 10, 15.',
    choices:[{value:'15',correct:true},{value:'11',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 5',distractorType:'counted_by_ones'},{value:'20',correct:false,errorTag:'err_wrong_skip_count_interval',misconceptionExplanation:'Used +10 instead of +5',distractorType:'wrong_interval'},{value:'10',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(6,  { difficulty:'easy',   subSkill:'skip_count_by_5s',            promptTemplate:'count_by_5s_sequence',     keyIdea:_l4KI3,
    prompt:'Count by 5s: 15, 20, ___', answer:'25', hint:'What is 5 more than 20?', explanation:'Adding 5 each time: 15, 20, 25.',
    choices:[{value:'25',correct:true},{value:'21',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 5',distractorType:'counted_by_ones'},{value:'30',correct:false,errorTag:'err_wrong_skip_count_interval',misconceptionExplanation:'Used +10 instead of +5',distractorType:'wrong_interval'},{value:'20',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(7,  { difficulty:'medium', subSkill:'skip_count_by_5s',            promptTemplate:'count_by_5s_sequence',     keyIdea:_l4KI3,
    prompt:'Fill in: 40, 45, ___, 55', answer:'50', hint:'Count by 5s from 45.', explanation:'45 + 5 = 50.',
    choices:[{value:'50',correct:true},{value:'46',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 5',distractorType:'counted_by_ones'},{value:'48',correct:false,errorTag:'err_skip_count_pattern_break',misconceptionExplanation:'Did not keep the +5 pattern',distractorType:'pattern_break'},{value:'45',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(8,  { difficulty:'hard',   subSkill:'skip_count_by_5s',            promptTemplate:'missing_skip_count_number', keyIdea:_l4KI3,
    prompt:'Fill in: 85, ___, 95, 100', answer:'90', hint:'Count by 5s. What comes after 85?', explanation:'85 + 5 = 90.',
    choices:[{value:'90',correct:true},{value:'86',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 5',distractorType:'counted_by_ones'},{value:'88',correct:false,errorTag:'err_skip_count_pattern_break',misconceptionExplanation:'Did not keep the +5 pattern',distractorType:'pattern_break'},{value:'85',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number',distractorType:'repeated_number'}] }),
  _l4P(9,  { difficulty:'easy',   subSkill:'skip_count_by_10s',           promptTemplate:'count_by_10s_sequence',    keyIdea:_l4KI4,
    prompt:'Count by 10s: 10, 20, ___', answer:'30', hint:'What is 10 more than 20?', explanation:'Adding 10 each time: 10, 20, 30.',
    choices:[{value:'30',correct:true},{value:'21',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 10',distractorType:'counted_by_ones'},{value:'22',correct:false,errorTag:'err_wrong_skip_count_interval',misconceptionExplanation:'Added 2 instead of 10',distractorType:'wrong_interval'},{value:'20',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(10, { difficulty:'easy',   subSkill:'skip_count_by_10s',           promptTemplate:'count_by_10s_sequence',    keyIdea:_l4KI4,
    prompt:'Count by 10s: 40, 50, ___', answer:'60', hint:'What is 10 more than 50?', explanation:'Adding 10 each time: 40, 50, 60.',
    choices:[{value:'60',correct:true},{value:'51',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 10',distractorType:'counted_by_ones'},{value:'55',correct:false,errorTag:'err_wrong_skip_count_interval',misconceptionExplanation:'Added 5 instead of 10',distractorType:'wrong_interval'},{value:'50',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(11, { difficulty:'medium', subSkill:'skip_count_by_10s',           promptTemplate:'count_by_10s_sequence',    keyIdea:_l4KI4,
    prompt:'Fill in: 60, 70, ___, 90', answer:'80', hint:'Count by 10s from 70.', explanation:'70 + 10 = 80.',
    choices:[{value:'80',correct:true},{value:'71',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 10',distractorType:'counted_by_ones'},{value:'75',correct:false,errorTag:'err_wrong_skip_count_interval',misconceptionExplanation:'Added 5 instead of 10',distractorType:'wrong_interval'},{value:'70',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(12, { difficulty:'hard',   subSkill:'skip_count_by_10s',           promptTemplate:'missing_skip_count_number', keyIdea:_l4KI4,
    prompt:'Fill in: 80, 90, ___, 110', answer:'100', hint:'Count by 10s from 90.', explanation:'90 + 10 = 100.',
    choices:[{value:'100',correct:true},{value:'91',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 10',distractorType:'counted_by_ones'},{value:'95',correct:false,errorTag:'err_skip_count_tens_transition_error',misconceptionExplanation:'Made an error at the round hundred',distractorType:'tens_transition'},{value:'90',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(13, { difficulty:'easy',   subSkill:'grouped_object_total',        promptTemplate:'grouped_objects_total',    keyIdea:_l4KI5,
    prompt:'There are 3 groups with 2 dots in each group. How many dots in all?',
    visual: { type: 'objectSet', emoji: '●', groups: 3, groupSize: 2 },
    answer:'6', hint:'Count by 2s, one number for each group.', explanation:'2, 4, 6 — three groups of 2 makes 6.',
    choices:[{value:'6',correct:true},{value:'3',correct:false,errorTag:'err_group_counting_error',misconceptionExplanation:'Counted the number of groups, not the total',distractorType:'group_count_error'},{value:'8',correct:false,errorTag:'err_overcounted_group',misconceptionExplanation:'Counted one extra group',distractorType:'overcounted'},{value:'2',correct:false,errorTag:'err_skipped_group',misconceptionExplanation:'Only counted one group',distractorType:'skipped_group'}] }),
  _l4P(14, { difficulty:'medium', subSkill:'grouped_object_total',        promptTemplate:'grouped_objects_total',    keyIdea:_l4KI5,
    prompt:'There are 4 groups with 5 dots in each group. How many dots in all?',
    visual: { type: 'objectSet', emoji: '●', groups: 4, groupSize: 5 },
    answer:'20', hint:'Count by 5s, one number for each group: 5, 10, 15, 20.', explanation:'4 groups of 5: 5, 10, 15, 20.',
    choices:[{value:'20',correct:true},{value:'4',correct:false,errorTag:'err_group_counting_error',misconceptionExplanation:'Counted the groups, not the objects',distractorType:'group_count_error'},{value:'25',correct:false,errorTag:'err_overcounted_group',misconceptionExplanation:'Counted one extra group',distractorType:'overcounted'},{value:'9',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added items one by one and made an error',distractorType:'counted_by_ones'}] }),
  _l4P(15, { difficulty:'hard',   subSkill:'grouped_object_total',        promptTemplate:'grouped_objects_total',    keyIdea:_l4KI5,
    prompt:'There are 6 groups with 10 dots in each group. How many dots in all?',
    visual: { type: 'objectSet', emoji: '●', groups: 6, groupSize: 10 },
    answer:'60', hint:'Count by 10s: 10, 20, 30, 40, 50, 60.', explanation:'6 groups of 10: 10, 20, 30, 40, 50, 60.',
    choices:[{value:'60',correct:true},{value:'6',correct:false,errorTag:'err_group_counting_error',misconceptionExplanation:'Counted the groups, not the total',distractorType:'group_count_error'},{value:'70',correct:false,errorTag:'err_overcounted_group',misconceptionExplanation:'Counted one extra group',distractorType:'overcounted'},{value:'50',correct:false,errorTag:'err_skipped_group',misconceptionExplanation:'Counted one too few groups',distractorType:'skipped_group'}] }),
  _l4P(16, { difficulty:'easy',   subSkill:'missing_skip_count_number',   promptTemplate:'missing_skip_count_number', keyIdea:_l4KI1,
    prompt:'Fill in: 0, 2, ___, 6', answer:'4', hint:'Count by 2s. What comes after 2?', explanation:'0, 2, 4, 6 — count by 2s.',
    choices:[{value:'4',correct:true},{value:'3',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 2',distractorType:'counted_by_ones'},{value:'8',correct:false,errorTag:'err_skipped_group',misconceptionExplanation:'Jumped two steps ahead',distractorType:'skipped_group'},{value:'2',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(17, { difficulty:'medium', subSkill:'missing_skip_count_number',   promptTemplate:'missing_skip_count_number', keyIdea:_l4KI1,
    prompt:'Fill in: 25, ___, 35, 40', answer:'30', hint:'Count by 5s. What comes after 25?', explanation:'25 + 5 = 30.',
    choices:[{value:'30',correct:true},{value:'26',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 5',distractorType:'counted_by_ones'},{value:'28',correct:false,errorTag:'err_skip_count_pattern_break',misconceptionExplanation:'Did not follow the +5 pattern',distractorType:'pattern_break'},{value:'25',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the starting number',distractorType:'repeated_number'}] }),
  _l4P(18, { difficulty:'medium', subSkill:'missing_skip_count_number',   promptTemplate:'missing_skip_count_number', keyIdea:_l4KI1,
    prompt:'Fill in: 50, 60, ___, 80', answer:'70', hint:'Count by 10s. What comes after 60?', explanation:'60 + 10 = 70.',
    choices:[{value:'70',correct:true},{value:'61',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 10',distractorType:'counted_by_ones'},{value:'65',correct:false,errorTag:'err_wrong_skip_count_interval',misconceptionExplanation:'Added 5 instead of 10',distractorType:'wrong_interval'},{value:'60',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(19, { difficulty:'hard',   subSkill:'missing_skip_count_number',   promptTemplate:'missing_skip_count_number', keyIdea:_l4KI1,
    prompt:'Fill in: 94, 96, ___, 100', answer:'98', hint:'Count by 2s. What comes after 96?', explanation:'96 + 2 = 98.',
    choices:[{value:'98',correct:true},{value:'97',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 2',distractorType:'counted_by_ones'},{value:'100',correct:false,errorTag:'err_skipped_group',misconceptionExplanation:'Jumped two steps forward',distractorType:'skipped_group'},{value:'96',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Repeated the last number',distractorType:'repeated_number'}] }),
  _l4P(20, { difficulty:'easy',   subSkill:'number_line_skip_count',      promptTemplate:'number_line_equal_jumps',  keyIdea:_l4KI6,
    prompt:'The number line starts at 4 and shows one jump of +2. Where does the arrow land?',
    visual: { type:'numberLine', mode:'assessment', mark:4, jumps:[{from:4, to:6, label:'+2', hideToLabel:true}], labels:{'4':'4'}, ticks:[4,5,6] },
    answer:'6', hint:'Start at 4. Add 2.', explanation:'4 + 2 = 6.',
    choices:[{value:'6',correct:true},{value:'5',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 2',distractorType:'counted_by_ones'},{value:'8',correct:false,errorTag:'err_skipped_group',misconceptionExplanation:'Added 4 instead of 2',distractorType:'skipped_group'},{value:'4',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start',distractorType:'repeated_number'}] }),
  _l4P(21, { difficulty:'medium', subSkill:'number_line_skip_count',      promptTemplate:'number_line_equal_jumps',  keyIdea:_l4KI6,
    prompt:'The number line starts at 10 and shows one jump of +5. Where does the arrow land?',
    visual: { type:'numberLine', mode:'assessment', mark:10, jumps:[{from:10, to:15, label:'+5', hideToLabel:true}], labels:{'10':'10'}, ticks:[10,12,15] },
    answer:'15', hint:'Start at 10. Add 5.', explanation:'10 + 5 = 15.',
    choices:[{value:'15',correct:true},{value:'11',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'Added 1 instead of 5',distractorType:'counted_by_ones'},{value:'20',correct:false,errorTag:'err_wrong_skip_count_interval',misconceptionExplanation:'Added 10 instead of 5',distractorType:'wrong_interval'},{value:'10',correct:false,errorTag:'err_repeated_number',misconceptionExplanation:'Did not move from start',distractorType:'repeated_number'}] }),
  _l4P(22, { difficulty:'hard',   subSkill:'mixed_skip_count_review',     promptTemplate:'mixed_skip_count_review',  keyIdea:_l4KI1,
    prompt:'Which sequence is counting by 5s?',
    visual: null,
    answer:'10, 15, 20, 25', hint:'Each jump in a 5s sequence adds exactly 5.', explanation:'10 + 5 = 15, 15 + 5 = 20, 20 + 5 = 25. Each jump is +5.',
    choices:[{value:'10, 15, 20, 25',correct:true},{value:'10, 12, 14, 16',correct:false,errorTag:'err_wrong_skip_count_interval',misconceptionExplanation:'This is counting by 2s, not 5s',distractorType:'wrong_interval'},{value:'10, 20, 30, 40',correct:false,errorTag:'err_wrong_skip_count_interval',misconceptionExplanation:'This is counting by 10s, not 5s',distractorType:'wrong_interval'},{value:'10, 11, 12, 13',correct:false,errorTag:'err_counted_by_ones_instead',misconceptionExplanation:'This is counting by 1s',distractorType:'counted_by_ones'}] })
];

// ── Lesson quiz attempt ───────────────────────────────────────────────────────
const _l4QuizAttempt = {
  questionCount: 8,
  difficultyMix: { easy: 3, medium: 4, hard: 1 },
  sourceRule: 'this_lesson_quizbank_only',
  avoidRecentlySeen: true,
  noDuplicatesWithinAttempt: true,
  balanceBySubSkill: true,
  maxNumberLineQuestions: 2,
  maxGroupedObjectQuestions: 2,
  maxSamePromptTemplate: 2,
  requiredSubSkills: [
    'skip_count_by_2s',
    'skip_count_by_5s',
    'skip_count_by_10s',
    'grouped_object_total',
    'missing_skip_count_number',
    'number_line_skip_count',
    'mixed_skip_count_review'
  ]
};

// ── Spec (quizBank added in subsequent batches) ───────────────────────────────
const _l4Spec = {
  lessonId: 'g1-u1-l4',
  title: 'Skip Count by 2s, 5s, and 10s',
  teks: ['1.5B'],
  skill: 'skip_count_to_find_totals',
  keyIdeas:          _l4KeyIdeas,
  workedExamples:    _l4Examples,
  practiceQuestions: _l4Practice,
  quizBank:          [],
  lessonQuizAttempt: _l4QuizAttempt
};

// ════════════════════════════════════════════════════════════════════════════
//  Spec Export
// ════════════════════════════════════════════════════════════════════════════

export const G1_U1_SPEC = {
  unitId: 'g1u1',
  title: 'Counting and Number Relationships to 120',
  teks: ['1.2A', '1.2D', '1.2E', '1.2F', '1.2G', '1.5A', '1.5B', '1.5C'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 40,
    perLessonCount: 5,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 1.1 — Quick Looks (MIGRATED to v0.2.0)
    //  TEKS 1.2A · structured_quantity_recognition
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u1-l1',
      title: 'Quick Looks',
      teks: ['1.2A'],
      skill: 'structured_quantity_recognition',
      keyIdeas: _l1KeyIdeas,
      workedExamples: _l1Examples,
      practiceQuestions: _l1Practice,
      quizBank: _l1QuizBank,
      lessonQuizAttempt: _l1QuizAttempt,
      allowedQuestionTypes: ['multipleChoice', 'inputNumber'],
      diagnostics: _l1Diagnostics
    },

    _l2Spec,

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 1.3 — Count Backward (v0.2.0)
    //  TEKS 1.5A · count_backward_from_any_number
    // ═══════════════════════════════════════════════════════════════════════
    _l3Spec,

    _l4Spec,

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 1.5 — One More and One Less
    //  TEKS 1.2D · one_more_one_less
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u1-l5',
      title: 'One More and One Less',
      teks: ['1.2D'],
      skill: 'one_more_one_less',
      keyIdeas: [
        'One more is the next number when you count up.',
        'One less is the number just before when you count back.',
        'One more than 7 is 8. One less than 7 is 6.',
        'Use the number line: one step right is one more, one step left is one less.'
      ],
      workedExamples: [
        {
          id: 'g1-u1-l5-ex-001',
          title: 'Example 1: One More Than 47',
          prompt: 'What is one more than 47?',
          visual: {
            type: 'numberLine',
            config: { min: 45, max: 50, ticks: [45, 46, 47, 48, 49, 50], mark: 47 }
          },
          steps: [
            'Find 47 on the number line.',
            'Take one step to the right — that is one more.',
            'One more than 47 is 48.'
          ],
          finalAnswer: '48',
          teachingNote: 'Pair the language "one more" with the visible step. Build the verbal habit.',
          relatedKeyIdea: 'One more is the next number when you count up.'
        },
        {
          id: 'g1-u1-l5-ex-002',
          title: 'Example 2: One Less Across a Decade',
          prompt: 'What is one less than 60?',
          visual: {
            type: 'numberLine',
            config: { min: 57, max: 62, ticks: [57, 58, 59, 60, 61, 62], mark: 60 }
          },
          steps: [
            'Find 60 on the number line.',
            'Take one step to the left — that is one less.',
            'One less than 60 is 59.'
          ],
          finalAnswer: '59',
          teachingNote: 'Decade boundary going down. Watch for "50" answers (over-stepped a decade).',
          relatedKeyIdea: 'Use the number line: one step right is one more, one step left is one less.'
        },
        {
          id: 'g1-u1-l5-ex-003',
          title: 'Example 3: One More At 99',
          prompt: 'What is one more than 99?',
          visual: {
            type: 'numberLine',
            config: { min: 97, max: 102, ticks: [97, 98, 99, 100, 101, 102], mark: 99 }
          },
          steps: [
            'Find 99 on the number line.',
            'Take one step to the right.',
            'One more than 99 is 100.'
          ],
          finalAnswer: '100',
          teachingNote: 'Highlight that "one more" still works at the 100 boundary.',
          relatedKeyIdea: 'One more is the next number when you count up.'
        }
      ],
      allowedQuestionTypes: ['multipleChoice'],
      diagnostics: {
        commonDistractors: [
          { value: 'less_when_more', meaning: 'Confused "one more" with "one less" (or vice versa).', errorTag: 'err_one_more_one_less_swap' },
          { value: 'plus_10',        meaning: 'Added 10 instead of 1 — confused with ten more.',     errorTag: 'err_more_less_magnitude' },
          { value: 'minus_10',       meaning: 'Subtracted 10 instead of 1.',                          errorTag: 'err_more_less_magnitude' },
          { value: 'far_decade',     meaning: 'Crossed an extra decade by mistake.',                  errorTag: 'err_decade_boundary' }
        ],
        errorTags: ['err_one_more_one_less_swap', 'err_more_less_magnitude', 'err_decade_boundary'],
        interventionRules: [
          { errorTag: 'err_one_more_one_less_swap', style: 'reteach',      followUpRule: 'same_skill_new_instance' },
          { errorTag: 'err_more_less_magnitude',    style: 'visual_model', followUpRule: 'same_skill_new_instance' },
          { errorTag: 'err_decade_boundary',        style: 'visual_model', followUpRule: 'same_skill_new_instance' }
        ]
      },
      sampleDiagnosticQuestions: [
        {
          t: 'What is one more than 65?',
          v: { type: 'numberLine', config: { min: 63, max: 68, ticks: [63, 64, 65, 66, 67, 68], mark: 65 } },
          o: [
            { val: '64', tag: 'err_one_more_one_less_swap' },
            { val: '66' },
            { val: '75', tag: 'err_more_less_magnitude' },
            { val: '55', tag: 'err_more_less_magnitude' }
          ],
          a: 1,
          e: 'One step to the right of 65 is 66.',
          d: 'e',
          h: 'Count up by one from 65.',
          s: null
        },
        {
          t: 'What is one less than 80?',
          v: { type: 'numberLine', config: { min: 77, max: 82, ticks: [77, 78, 79, 80, 81, 82], mark: 80 } },
          o: [
            { val: '81', tag: 'err_one_more_one_less_swap' },
            { val: '70', tag: 'err_more_less_magnitude' },
            { val: '79' },
            { val: '89', tag: 'err_more_less_magnitude' }
          ],
          a: 2,
          e: 'One step to the left of 80 is 79.',
          d: 'm',
          h: 'Count back by one from 80.',
          s: null
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 1.6 — Ten More and Ten Less
    //  TEKS 1.5C · ten_more_ten_less
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u1-l6',
      title: 'Ten More and Ten Less',
      teks: ['1.5C'],
      skill: 'ten_more_ten_less',
      keyIdeas: [
        'Ten more means add a whole group of 10.',
        'Ten less means take away a whole group of 10.',
        'The tens digit changes by 1. The ones digit stays the same.',
        'Ten more than 23 is 33. Ten less than 23 is 13.',
        'Use base-ten blocks: add or take away one rod of ten.'
      ],
      workedExamples: [
        {
          id: 'g1-u1-l6-ex-001',
          title: 'Example 1: Ten More Than 34',
          prompt: 'What is ten more than 34?',
          visual: { type: 'base10', config: { tens: 3, ones: 4 } },
          steps: [
            'Show 34 with 3 rods and 4 cubes.',
            'Add one more rod of ten.',
            'Now there are 4 rods and 4 cubes. The ones did not change.',
            'Ten more than 34 is 44.'
          ],
          finalAnswer: '44',
          teachingNote: 'Anchor that the ones digit is invariant under ten-more / ten-less.',
          relatedKeyIdea: 'The tens digit changes by 1. The ones digit stays the same.'
        },
        {
          id: 'g1-u1-l6-ex-002',
          title: 'Example 2: Ten Less Than 56',
          prompt: 'What is ten less than 56?',
          visual: { type: 'base10', config: { tens: 5, ones: 6 } },
          steps: [
            'Show 56 with 5 rods and 6 cubes.',
            'Take away one rod of ten.',
            'Now there are 4 rods and 6 cubes.',
            'Ten less than 56 is 46.'
          ],
          finalAnswer: '46',
          teachingNote: 'Reinforce taking away a rod, not a cube. The ones stay the same.',
          relatedKeyIdea: 'Ten less means take away a whole group of 10.'
        },
        {
          id: 'g1-u1-l6-ex-003',
          title: 'Example 3: Ten More Near 100',
          prompt: 'What is ten more than 89?',
          visual: { type: 'base10', config: { tens: 8, ones: 9 } },
          steps: [
            'Show 89 with 8 rods and 9 cubes.',
            'Add one more rod of ten.',
            'Now there are 9 rods and 9 cubes.',
            'Ten more than 89 is 99.'
          ],
          finalAnswer: '99',
          teachingNote: 'Stay below 100 here; the 99 → 109 case is harder and reserved for later units.',
          relatedKeyIdea: 'Ten more than 23 is 33. Ten less than 23 is 13.'
        }
      ],
      allowedQuestionTypes: ['multipleChoice'],
      diagnostics: {
        commonDistractors: [
          { value: 'plus_one',        meaning: 'Added 1 instead of 10 — confused with one more.',           errorTag: 'err_one_vs_ten' },
          { value: 'minus_one',       meaning: 'Subtracted 1 instead of 10.',                                errorTag: 'err_one_vs_ten' },
          { value: 'ten_less_for_more', meaning: 'Subtracted 10 when asked for ten more (or vice versa).',    errorTag: 'err_ten_more_ten_less_swap' },
          { value: 'changed_ones',    meaning: 'Changed the ones digit by 1 instead of changing the tens.',  errorTag: 'err_changed_wrong_digit' }
        ],
        errorTags: ['err_one_vs_ten', 'err_ten_more_ten_less_swap', 'err_changed_wrong_digit'],
        interventionRules: [
          { errorTag: 'err_one_vs_ten',             style: 'visual_model', followUpRule: 'same_skill_new_instance' },
          { errorTag: 'err_ten_more_ten_less_swap', style: 'reteach',      followUpRule: 'same_skill_new_instance' },
          { errorTag: 'err_changed_wrong_digit',    style: 'visual_model', followUpRule: 'same_skill_new_instance' }
        ]
      },
      sampleDiagnosticQuestions: [
        {
          t: 'What is ten more than 47?',
          v: { type: 'base10', config: { tens: 4, ones: 7 } },
          o: [
            { val: '48', tag: 'err_one_vs_ten' },
            { val: '57' },
            { val: '37', tag: 'err_ten_more_ten_less_swap' },
            { val: '46', tag: 'err_changed_wrong_digit' }
          ],
          a: 1,
          e: 'Add one rod of ten to 4 rods and 7 cubes. The result is 5 rods and 7 cubes — that is 57.',
          d: 'e',
          h: 'The ones stay 7. Just change the tens.',
          s: null
        },
        {
          t: 'What is ten less than 92?',
          v: { type: 'base10', config: { tens: 9, ones: 2 } },
          o: [
            { val: '91', tag: 'err_one_vs_ten' },
            { val: '82' },
            { val: '93', tag: 'err_ten_more_ten_less_swap' },
            { val: '102', tag: 'err_ten_more_ten_less_swap' }
          ],
          a: 1,
          e: 'Take away one rod from 9 rods and 2 cubes. The result is 8 rods and 2 cubes — that is 82.',
          d: 'm',
          h: 'The ones stay 2. Just change the tens.',
          s: null
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 1.7 — Order Numbers
    //  TEKS 1.2F · order_numbers_to_120
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u1-l7',
      title: 'Order Numbers',
      teks: ['1.2F'],
      skill: 'order_numbers_to_120',
      keyIdeas: [
        'Numbers can be put in order from least to greatest.',
        'Compare the tens first. Fewer tens means a smaller number.',
        'If the tens are the same, compare the ones.',
        'A number line shows order: numbers further to the right are greater.'
      ],
      workedExamples: [
        {
          id: 'g1-u1-l7-ex-001',
          title: 'Example 1: Order by Tens',
          prompt: 'Put these in order from least to greatest: 47, 23, 89.',
          visual: {
            type: 'numberLine',
            config: { min: 20, max: 90, ticks: [20, 23, 30, 40, 47, 50, 60, 70, 80, 89, 90] }
          },
          steps: [
            'Look at the tens: 23 has 2, 47 has 4, 89 has 8.',
            'Smallest tens first: 23 has the fewest, then 47, then 89.',
            'Order: 23, 47, 89.'
          ],
          finalAnswer: '23, 47, 89',
          teachingNote: 'Lead with the place-value rule, not just memorized comparisons.',
          relatedKeyIdea: 'Compare the tens first. Fewer tens means a smaller number.'
        },
        {
          id: 'g1-u1-l7-ex-002',
          title: 'Example 2: Same Tens',
          prompt: 'Put these in order from least to greatest: 34, 38, 36.',
          visual: {
            type: 'numberLine',
            config: { min: 33, max: 39, ticks: [33, 34, 35, 36, 37, 38, 39], mark: 36 }
          },
          steps: [
            'All three numbers have 3 tens. The tens are tied.',
            'Look at the ones: 4, 8, 6.',
            'Smallest ones first: 4, then 6, then 8.',
            'Order: 34, 36, 38.'
          ],
          finalAnswer: '34, 36, 38',
          teachingNote: 'Reinforce the tie-breaking rule. Common pitfall: ordering by ones alone.',
          relatedKeyIdea: 'If the tens are the same, compare the ones.'
        },
        {
          id: 'g1-u1-l7-ex-003',
          title: 'Example 3: Order Past 100',
          prompt: 'Put these in order from least to greatest: 65, 92, 100.',
          visual: {
            type: 'numberLine',
            config: { min: 60, max: 110, ticks: [60, 65, 70, 80, 90, 92, 100, 110] }
          },
          steps: [
            '65 has 6 tens. 92 has 9 tens. 100 is one hundred.',
            'Smallest tens first.',
            'Order: 65, 92, 100.'
          ],
          finalAnswer: '65, 92, 100',
          teachingNote: 'Treat 100 as one hundred (no tens-only comparison). Open number line is okay here.',
          relatedKeyIdea: 'A number line shows order: numbers further to the right are greater.'
        }
      ],
      allowedQuestionTypes: ['multipleChoice'],
      diagnostics: {
        commonDistractors: [
          { value: 'ones_only',        meaning: 'Ordered by ones digit only, ignoring tens.',          errorTag: 'err_ones_only_compare' },
          { value: 'reverse_order',    meaning: 'Ordered greatest to least when asked for least to greatest (or vice versa).', errorTag: 'err_order_direction_swap' },
          { value: 'middle_swap',      meaning: 'Swapped the middle two numbers (close-tens confusion).', errorTag: 'err_close_tens_swap' },
          { value: 'left_as_is',       meaning: 'Did not reorder; reported the numbers in input order.',  errorTag: 'err_no_compare' }
        ],
        errorTags: ['err_ones_only_compare', 'err_order_direction_swap', 'err_close_tens_swap', 'err_no_compare'],
        interventionRules: [
          { errorTag: 'err_ones_only_compare',  style: 'visual_model', followUpRule: 'same_skill_new_instance' },
          { errorTag: 'err_order_direction_swap', style: 'reteach',     followUpRule: 'same_skill_new_instance' },
          { errorTag: 'err_close_tens_swap',    style: 'reteach',      followUpRule: 'same_skill_new_instance' },
          { errorTag: 'err_no_compare',         style: 'reteach',      followUpRule: 'same_skill_new_instance' }
        ]
      },
      sampleDiagnosticQuestions: [
        {
          t: 'Which order goes from smallest to greatest? 56, 38, 71',
          v: null,
          o: [
            { val: '38, 56, 71' },
            { val: '56, 38, 71', tag: 'err_no_compare' },
            { val: '71, 56, 38', tag: 'err_order_direction_swap' },
            { val: '38, 71, 56', tag: 'err_close_tens_swap' }
          ],
          a: 0,
          e: 'Compare the tens: 38 has 3, 56 has 5, 71 has 7. Smallest tens first.',
          d: 'm',
          h: 'Look at the tens digit of each number.',
          s: null
        },
        {
          t: 'Which order goes from greatest to smallest? 28, 32, 25',
          v: null,
          o: [
            { val: '25, 28, 32', tag: 'err_order_direction_swap' },
            { val: '32, 28, 25' },
            { val: '28, 32, 25', tag: 'err_no_compare' },
            { val: '32, 25, 28', tag: 'err_close_tens_swap' }
          ],
          a: 1,
          e: 'Greatest first means biggest number first. 32 has 3 tens; 28 and 25 each have 2 tens. Among 28 and 25, 28 is greater.',
          d: 'h',
          h: 'Greatest tens first. If tens are tied, the bigger ones digit wins.',
          s: null
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 1.8 — Compare Numbers
    //  TEKS 1.2D, 1.2E, 1.2G · compare_numbers_to_100
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u1-l8',
      title: 'Compare Numbers',
      teks: ['1.2D', '1.2E', '1.2G'],
      skill: 'compare_numbers_to_100',
      keyIdeas: [
        'The symbol > means "greater than".',
        'The symbol < means "less than".',
        'The symbol = means "equal to".',
        'Compare the tens first. If the tens are the same, compare the ones.',
        'The wide side of the symbol points to the bigger number.'
      ],
      workedExamples: [
        {
          id: 'g1-u1-l8-ex-001',
          title: 'Example 1: Different Tens',
          prompt: 'Compare 56 and 43. Which symbol is true: 56 ___ 43?',
          visual: {
            type: 'comparison',
            config: {
              left:  { label: '56', barLen: 6 },
              right: { label: '43', barLen: 4 }
            }
          },
          steps: [
            '56 has 5 tens. 43 has 4 tens.',
            '5 tens is more than 4 tens, so 56 is greater.',
            'Use >: 56 > 43.'
          ],
          finalAnswer: '56 > 43',
          teachingNote: 'Use the bar visual to make "more tens" tactile. Avoid alligator metaphor first.',
          relatedKeyIdea: 'Compare the tens first. If the tens are the same, compare the ones.'
        },
        {
          id: 'g1-u1-l8-ex-002',
          title: 'Example 2: Equal Numbers',
          prompt: 'Compare 78 and 78. Which symbol is true: 78 ___ 78?',
          visual: {
            type: 'comparison',
            config: {
              left:  { label: '78', barLen: 8 },
              right: { label: '78', barLen: 8 }
            }
          },
          steps: [
            'Both numbers have 7 tens and 8 ones.',
            'They are exactly the same.',
            'Use =: 78 = 78.'
          ],
          finalAnswer: '78 = 78',
          teachingNote: 'Equal-sign moments matter — students often default to > or <.',
          relatedKeyIdea: 'The symbol = means "equal to".'
        },
        {
          id: 'g1-u1-l8-ex-003',
          title: 'Example 3: Less Than',
          prompt: 'Compare 25 and 32. Which symbol is true: 25 ___ 32?',
          visual: {
            type: 'comparison',
            config: {
              left:  { label: '25', barLen: 3 },
              right: { label: '32', barLen: 4 }
            }
          },
          steps: [
            '25 has 2 tens. 32 has 3 tens.',
            '2 tens is less than 3 tens.',
            'Use <: 25 < 32.'
          ],
          finalAnswer: '25 < 32',
          teachingNote: 'Symbol-direction is the bigger conceptual lift. Show the wide side opens to 32.',
          relatedKeyIdea: 'The wide side of the symbol points to the bigger number.'
        }
      ],
      allowedQuestionTypes: ['multipleChoice'],
      diagnostics: {
        commonDistractors: [
          { value: 'flipped_symbol', meaning: 'Picked < when > is correct (or vice versa).',                 errorTag: 'err_compare_symbol_swap' },
          { value: 'equal_when_unequal', meaning: 'Picked = when the numbers are not equal.',                errorTag: 'err_equal_misuse' },
          { value: 'ones_only',     meaning: 'Compared ones digit only, ignoring tens (e.g. 78 vs 21 → ones say 8>1 but answer is fine; trickier when 32 vs 25, ones say 5>2 so wrongly picks 25>32).', errorTag: 'err_ones_only_compare' },
          { value: 'plus_sign',     meaning: 'Picked + (an unrelated symbol).',                              errorTag: 'err_unrelated_symbol' }
        ],
        errorTags: ['err_compare_symbol_swap', 'err_equal_misuse', 'err_ones_only_compare', 'err_unrelated_symbol'],
        interventionRules: [
          { errorTag: 'err_compare_symbol_swap', style: 'visual_model', followUpRule: 'same_skill_new_instance' },
          { errorTag: 'err_equal_misuse',        style: 'reteach',      followUpRule: 'same_skill_new_instance' },
          { errorTag: 'err_ones_only_compare',   style: 'visual_model', followUpRule: 'same_skill_new_instance' },
          { errorTag: 'err_unrelated_symbol',    style: 'reteach',      followUpRule: 'same_skill_new_instance' }
        ]
      },
      sampleDiagnosticQuestions: [
        {
          t: 'Which sign goes between 67 and 73? 67 ___ 73',
          v: { type: 'comparison', config: { left: { label: '67', barLen: 7 }, right: { label: '73', barLen: 7 } } },
          o: [
            { val: '<' },
            { val: '>', tag: 'err_compare_symbol_swap' },
            { val: '=', tag: 'err_equal_misuse' },
            { val: '+', tag: 'err_unrelated_symbol' }
          ],
          a: 0,
          e: '67 has 6 tens, 73 has 7 tens. 67 is less than 73, so 67 < 73.',
          d: 'e',
          h: 'Compare the tens digits.',
          s: null
        },
        {
          t: 'Which statement is true?',
          v: null,
          o: [
            { val: '84 > 79' },
            { val: '84 < 79', tag: 'err_compare_symbol_swap' },
            { val: '84 = 79', tag: 'err_equal_misuse' },
            { val: '79 > 84', tag: 'err_ones_only_compare' }
          ],
          a: 0,
          e: '84 has 8 tens. 79 has 7 tens. 84 is greater, so 84 > 79.',
          d: 'm',
          h: 'Bigger tens means bigger number.',
          s: null
        }
      ]
    }

  ]
};

export default G1_U1_SPEC;
