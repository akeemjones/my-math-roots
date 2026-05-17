/* ════════════════════════════════════════════════════════════════════════════
 *  Grade 1 — Unit 8: Financial Literacy
 *  Design Spec — schema version 0.2.0
 *
 *  TEKS covered:
 *    1.9A  Define money earned as income
 *    1.9B  Identify income as a means of obtaining goods and services,
 *          oftentimes making choices about what to purchase
 *    1.9C  Distinguish between spending and saving
 *    1.9D  Consider charitable giving
 *
 *  Lessons:
 *    L8.1  Earning Income           ← 140 questions (45E / 55M / 40H)
 *    L8.2  Goods and Services       ← SCAFFOLD (0 questions)
 *    L8.3  Spending and Saving      ← SCAFFOLD (0 questions)
 *    L8.4  Charitable Giving        ← SCAFFOLD (0 questions)
 *
 *  Hard scope guardrails (apply to every question added to this unit):
 *    - NO coin identification (penny / nickel / dime / quarter) — K.4A territory.
 *    - NO coin values, NO coin counting — K.4A / G2 2.5A territory.
 *    - NO dollars-and-cents math, NO decimal money notation — G2 2.5.
 *    - NO wants-vs-needs as a lesson skill — K.9D territory, not G1.
 *    - NO multi-step money word problems.
 *    - NO interest, NO tax, NO percentages, NO fractions.
 *    - NO Grade 2 financial-literacy content.
 *    - Multiple-choice questions only at the L8 scaffold stage.
 *    - Grade 2's "u5" Money & Financial Literacy content is OUT OF SCOPE —
 *      different namespace, different file, different progression.
 *
 *  Cross-grade name note: Grade 2 default Unit 5 lives at src/data/u5.js
 *  ("Money & Financial Literacy"). Grade 2 default Unit 8 lives at
 *  src/data/u8.js ("Fractions"). This file is Grade 1's separate Unit 8
 *  namespace (g1u8) and is unrelated to either of those Grade 2 files.
 * ════════════════════════════════════════════════════════════════════════════ */


// ════════════════════════════════════════════════════════════════════════════
//  L8.1 — Earning Income
//  TEKS 1.9A | 140 questions (45E / 55M / 40H)
//
//  Foundational lesson for Unit 8. After L8.1 a student is fluent in:
//    - working vs not-working (only working earns income)
//    - earning vs receiving a gift
//    - jobs and the skills that make work productive
//
//  Income definition (locked): money earned by working. Paid work counts
//  as earning income — adult jobs AND paid kid work (dog walking, lawn
//  mowing, lemonade selling, etc.). Volunteer/unpaid work does NOT earn
//  income because no pay was given.
//
//  Hard guardrails (verified by scope scans before lock):
//    NO $ symbol, NO ¢ symbol, NO dollar/cents amounts in any string.
//    NO coin names (penny, nickel, dime, quarter, coin, bill, change).
//    NO price, cost, tax, interest, percent vocabulary.
//    NO spending / saving / giving content (those are L8.3/L8.4).
//    NO wants vs needs vocabulary (K.9D, not G1).
//    NO multi-step problems, NO more than one operation per question.
//    NO Grade 2 financial-literacy content.
//    NO drag-and-drop, NO imgChoice (multipleChoice only).
//    NO wording implying only adult careers earn income.
// ════════════════════════════════════════════════════════════════════════════

// ── L8.1 error tags ──────────────────────────────────────────────────────────
var _81ID = 'err_income_definition_confusion';
var _81GI = 'err_gift_vs_income_confusion';
var _81WP = 'err_work_vs_play_confusion';
var _81JC = 'err_job_confusion';
var _81NW = 'err_not_working_is_income';
var _81PW = 'err_paid_work_confusion';
var _81SW = 'err_skill_work_confusion';
var _81IU = 'err_income_use_confusion';

// ── L8.1 visual helpers ──────────────────────────────────────────────────────

// _u8IconCell — single fixed-size emoji cell. Default 32px.
function _u8IconCell(emoji, size) {
  var s = size || 32;
  return '<span style="display:inline-flex;align-items:center;justify-content:center;' +
    'width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s * 0.7) + 'px;' +
    'line-height:1;vertical-align:middle">' + emoji + '</span>';
}

// _u8WorkerCard — bordered card with a single large emoji and a bold caption.
// Used as the building block for C3 / C5 / C6 grids and as the right side of
// C4 gift-vs-work pairs.
function _u8WorkerCard(emoji, label) {
  return '<div style="display:inline-block;border:2px solid #37474F;border-radius:8px;' +
    'background:#fff;padding:6px 10px;margin:4px;text-align:center;min-width:90px;' +
    'max-width:120px;font-family:Nunito,sans-serif;vertical-align:top">' +
    '<div style="font-size:36px;line-height:1;margin-bottom:4px">' + emoji + '</div>' +
    '<div style="font-size:12px;font-weight:bold;color:#37474F">' + label + '</div>' +
    '</div>';
}

// _u8ScenarioCard — amber-tinted scenario panel. Wider than a worker card to
// hold short scenario sentences like "Sam plays soccer for fun".
function _u8ScenarioCard(emoji, caption) {
  return '<div style="display:inline-block;background:#FFF8E1;border:2px solid #FFB300;' +
    'border-radius:10px;padding:8px 12px;margin:6px auto;text-align:center;' +
    'max-width:380px;font-family:Nunito,sans-serif">' +
    '<div style="font-size:42px;line-height:1;margin-bottom:6px">' + emoji + '</div>' +
    '<div style="font-size:13px;color:#5a7080">' + caption + '</div>' +
    '</div>';
}

// _u8WorkVsRest — side-by-side worker vs leisure pair. Used in C5 and as a
// "vs" comparison in teaching visuals.
function _u8WorkVsRest(workEmoji, workLabel, restEmoji, restLabel) {
  return '<div style="display:flex;justify-content:center;align-items:center;' +
    'gap:10px;margin:8px 0;flex-wrap:wrap">' +
    _u8WorkerCard(workEmoji, workLabel) +
    '<span style="font-size:14px;color:#9ca3af">vs</span>' +
    _u8WorkerCard(restEmoji, restLabel) +
    '</div>';
}

// _u8GiftVsWork — gift card (with 🎁 badge) on left, work card on right.
// Used in C4 to distinguish gifts from earned income.
function _u8GiftVsWork(giftEmoji, giftLabel, workEmoji, workLabel) {
  var giftCard = '<div style="position:relative;display:inline-block;vertical-align:top">' +
    '<span style="position:absolute;top:-6px;left:-6px;font-size:20px;z-index:1">🎁</span>' +
    _u8WorkerCard(giftEmoji, giftLabel) +
    '</div>';
  return '<div style="display:flex;justify-content:center;align-items:center;' +
    'gap:10px;margin:8px 0;flex-wrap:wrap">' +
    giftCard +
    '<span style="font-size:14px;color:#9ca3af">vs</span>' +
    _u8WorkerCard(workEmoji, workLabel) +
    '</div>';
}

// _u8JobGrid — 2×2 (or wrapping) grid of cards. Used in C3 and C6 for the
// multi-option scenario layout. Caller passes an array of {emoji, label}.
function _u8JobGrid(items) {
  return '<div style="display:flex;flex-wrap:wrap;justify-content:center;' +
    'gap:8px;margin:8px auto;max-width:400px">' +
    items.map(function(it){ return _u8WorkerCard(it.emoji, it.label); }).join('') +
    '</div>';
}

// _u8MoneyBag — generic income symbol (no monetary value shown).
// Caption "income" anchors the meaning so the bag is not read as coins.
function _u8MoneyBag() {
  return '<div style="display:inline-flex;flex-direction:column;align-items:center;' +
    'margin:4px;vertical-align:middle">' +
    '<span style="font-size:36px;line-height:1">💰</span>' +
    '<span style="font-size:12px;color:#37474F;font-weight:bold;font-family:Nunito,sans-serif">income</span>' +
    '</div>';
}

// _u8GiftBox — gift symbol with explicit "gift" caption.
function _u8GiftBox() {
  return '<div style="display:inline-flex;flex-direction:column;align-items:center;' +
    'margin:4px;vertical-align:middle">' +
    '<span style="font-size:36px;line-height:1">🎁</span>' +
    '<span style="font-size:12px;color:#37474F;font-weight:bold;font-family:Nunito,sans-serif">gift</span>' +
    '</div>';
}

// _u8TvWrap — wraps a teaching visual HTML with a one-sentence caption.
// Mirrors _u7TvWrap pattern from u7.js.
function _u8TvWrap(html, caption) {
  return '<div style="text-align:center;margin:8px 0">' + html +
    '<div style="margin-top:6px;font-size:13px;color:#5a7080;max-width:400px;' +
    'margin-left:auto;margin-right:auto;font-family:Nunito,sans-serif">' +
    caption + '</div></div>';
}

// _u8Place — position the correct option at slot aIdx. Mirrors _u7Place.
// opts[0] is always the correct answer; distractors fill the rest.
function _u8Place(opts, aIdx) {
  var correct = opts[0];
  var rest = opts.slice(1);
  var out = rest.slice();
  out.splice(aIdx, 0, correct);
  return out;
}

// ── L8.1 teaching visuals (intervention overlays) ────────────────────────────
function _u81TvDefinition() {
  return _u8TvWrap(_u8MoneyBag(),
    'Income is money earned by working.');
}
function _u81TvGiftVsIncome() {
  return _u8TvWrap(_u8GiftVsWork('🎁', 'gift from family', '👨‍🍳', 'cook at work'),
    'A gift is given to you for free. Income is earned by working.');
}
function _u81TvWorkVsPlay() {
  return _u8TvWrap(_u8WorkVsRest('👩‍🏫', 'teacher teaching', '🎮', 'kid playing games'),
    'Working earns income. Playing for fun does not.');
}
function _u81TvJobConfusion() {
  return _u8TvWrap(_u8WorkVsRest('👨‍⚕️', 'doctor at work', '⚽', 'soccer for fun'),
    'A job is work people do for pay. Playing for fun is not a job.');
}
function _u81TvNotWorking() {
  return _u8TvWrap(_u8WorkVsRest('🚒', 'firefighter at work', '🛏️', 'person napping'),
    'If no work is done, no income is earned.');
}
function _u81TvPaidWork() {
  return _u8TvWrap(_u8GiftVsWork('🎂', 'birthday card from Grandma', '🚶‍♀️', 'kid walking dogs for pay'),
    'Pay for work is income. Money given for free is a gift.');
}
function _u81TvSkillWork() {
  return _u8TvWrap(_u8WorkerCard('🥖', 'baker uses baking skills'),
    'Every job needs the right skill. A baker needs baking skills to do the work.');
}
function _u81TvIncomeUse() {
  return _u8TvWrap(_u8MoneyBag(),
    'Income is what you earn. What you do with income comes later — first, learn what income is.');
}

// ── L8.1 intervention factories ──────────────────────────────────────────────
function _i81Definition() { return {
  errorTag: _81ID, title: 'Income is money earned by working',
  teachingSteps: [
    'Income means money that someone earns.',
    'Earning means doing work and getting paid for it.',
    'Money you find, money you already have, or money you get for free is not income.',
    'Look for work being done before you call money income.'
  ],
  teachingVisualRaw: _u81TvDefinition(),
  correctAnswerExplanation: 'Income is money earned by working.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i81GiftVsIncome() { return {
  errorTag: _81GI, title: 'A gift is not income',
  teachingSteps: [
    'A gift is given to you for free.',
    'Income is money earned by doing work.',
    'Birthday money, holiday money, and money from family for no reason are gifts.',
    'A gift is not income because no work was done for it.'
  ],
  teachingVisualRaw: _u81TvGiftVsIncome(),
  correctAnswerExplanation: 'A gift is given for free. Income is earned by working.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i81WorkVsPlay() { return {
  errorTag: _81WP, title: 'Playing is not earning',
  teachingSteps: [
    'Playing, resting, eating, and having fun are not work.',
    'Those activities do not earn income.',
    'Only doing work and being paid earns income.',
    'Ask: did this person do work, and was the work paid?'
  ],
  teachingVisualRaw: _u81TvWorkVsPlay(),
  correctAnswerExplanation: 'Playing or resting is not work. Only paid work earns income.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i81JobConfusion() { return {
  errorTag: _81JC, title: 'A job is work for pay',
  teachingSteps: [
    'A job is work that people do for pay.',
    'A teacher teaching, a baker baking, and a kid walking the neighbor\'s dog for pay are all jobs.',
    'A hobby is something you do for fun without pay — not a job.',
    'Look for work being done in exchange for pay.'
  ],
  teachingVisualRaw: _u81TvJobConfusion(),
  correctAnswerExplanation: 'A job is work people do for pay. Hobbies and rest are not jobs.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i81NotWorking() { return {
  errorTag: _81NW, title: 'No work means no income',
  teachingSteps: [
    'If a person is not doing work, they are not earning income.',
    'Sleeping, resting, eating, and playing are not work.',
    'Money can be given to a resting person — but that is a gift, not income.',
    'Always check: is work being done right now?'
  ],
  teachingVisualRaw: _u81TvNotWorking(),
  correctAnswerExplanation: 'If no work is done, no income is earned.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i81PaidWork() { return {
  errorTag: _81PW, title: 'Pay for work is income',
  teachingSteps: [
    'When someone does work and is paid, the pay is income.',
    'When someone is given money for free, that is a gift.',
    'Adults and kids can both earn income by doing paid work.',
    'Look for the two parts: work was done AND pay was given.'
  ],
  teachingVisualRaw: _u81TvPaidWork(),
  correctAnswerExplanation: 'Pay for work is income. Free money is a gift.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i81SkillWork() { return {
  errorTag: _81SW, title: 'Every job needs the right skill',
  teachingSteps: [
    'A cook needs cooking skills.',
    'A teacher needs teaching and explaining skills.',
    'A builder needs building skills and using tools.',
    'A baker needs baking skills.',
    'The right skill helps a person do their work and earn income.'
  ],
  teachingVisualRaw: _u81TvSkillWork(),
  correctAnswerExplanation: 'The right skill helps a person do their job.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i81IncomeUse() { return {
  errorTag: _81IU, title: 'Income is what you earn',
  teachingSteps: [
    'Income is the money you earn by working.',
    'What a person does with income — that is for other lessons.',
    'In this lesson, just learn what income is.',
    'Money earned by working = income. Always.'
  ],
  teachingVisualRaw: _u81TvIncomeUse(),
  correctAnswerExplanation: 'Income is what you earn by working.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// ── L8.1 question factory functions ──────────────────────────────────────────

// _q81DefineIncome — C1: text question, 4 sentence-style options.
// distractors: [{val, tag}] length 3.
function _q81DefineIncome(promptText, correctText, distractors, diff, aIdx) {
  var opts = [{val: correctText}].concat(distractors);
  opts = _u8Place(opts, aIdx);
  return {
    t: promptText,
    o: opts, a: aIdx,
    e: 'Income is money earned by working. The other sentences are wrong about what income is.',
    d: diff,
    h: 'Income is money you earn — not money you get for free, not money you find, and not money you already have.',
    sk: 'earning_income',
    i: _i81Definition()
  };
}

// _q81IdentifyEarning — C2: scenario card + "Is X earning income?"
// reason: 'work_paid' | 'play' | 'rest' | 'gift' | 'unpaid_work' | 'eating'
function _q81IdentifyEarning(name, sceneEmoji, sceneCaption, reason, diff, aIdx) {
  var isIncome = (reason === 'work_paid');
  var correctText, wrong1, wrong2, wrong3, t1, t2, t3;
  var interv;
  if (isIncome) {
    correctText = 'Yes — ' + name + ' is doing work and getting paid.';
    wrong1 = 'No — ' + name + ' is only playing for fun.';
    wrong2 = 'No — ' + name + ' got a gift.';
    wrong3 = 'No — ' + name + ' is not doing real work.';
    t1 = _81WP; t2 = _81GI; t3 = _81JC;
    interv = _i81PaidWork;
  } else if (reason === 'play' || reason === 'eating') {
    var verb = (reason === 'eating') ? 'eating' : 'playing';
    correctText = 'No — ' + name + ' is ' + verb + ', not working.';
    wrong1 = 'Yes — ' + name + ' is earning income.';
    wrong2 = 'Yes — ' + verb + ' is a kind of job.';
    wrong3 = 'Yes — ' + name + ' is using skills at work.';
    t1 = _81NW; t2 = _81WP; t3 = _81JC;
    interv = _i81WorkVsPlay;
  } else if (reason === 'rest') {
    correctText = 'No — ' + name + ' is resting, not working.';
    wrong1 = 'Yes — ' + name + ' is earning income.';
    wrong2 = 'Yes — resting is a kind of work.';
    wrong3 = 'Yes — ' + name + ' is at a job.';
    t1 = _81NW; t2 = _81WP; t3 = _81JC;
    interv = _i81NotWorking;
  } else if (reason === 'gift') {
    correctText = 'No — ' + name + ' got a gift, not income.';
    wrong1 = 'Yes — ' + name + ' is earning income.';
    wrong2 = 'Yes — money from family is always income.';
    wrong3 = 'Yes — ' + name + ' did work for it.';
    t1 = _81GI; t2 = _81GI; t3 = _81PW;
    interv = _i81GiftVsIncome;
  } else {
    // unpaid_work
    correctText = 'No — ' + name + ' is helping for free, not earning income.';
    wrong1 = 'Yes — ' + name + ' is earning income.';
    wrong2 = 'Yes — helping is always income.';
    wrong3 = 'Yes — ' + name + ' is at a paying job.';
    t1 = _81PW; t2 = _81PW; t3 = _81JC;
    interv = _i81PaidWork;
  }
  var opts = [
    {val: correctText},
    {val: wrong1, tag: t1},
    {val: wrong2, tag: t2},
    {val: wrong3, tag: t3}
  ];
  opts = _u8Place(opts, aIdx);
  var sceneHtml = _u8ScenarioCard(sceneEmoji, sceneCaption);
  return {
    t: 'Is ' + name + ' earning income?',
    s: sceneHtml,
    o: opts, a: aIdx,
    e: isIncome ? (name + ' did work and got paid. That money is income.')
        : (reason === 'gift' ? (name + ' received a gift. A gift is not income because no work was done.')
        : reason === 'unpaid_work' ? (name + ' did work but was not paid. No pay means no income.')
        : (name + ' did not do work. No work means no income.')),
    d: diff,
    h: 'Ask two questions: did ' + name + ' do work? Did ' + name + ' get paid for it? If both are yes, that is income.',
    sk: 'earning_income',
    i: interv()
  };
}

// _q81JobVsNotJob — C3: 4-card grid + "Which person is working at a job?"
// jobItem: {emoji, label}  3 non-job items: [{emoji, label, tag}]
function _q81JobVsNotJob(jobItem, restItems, diff, aIdx) {
  // Place the job item at position aIdx in the visual grid AND in the options
  var allItems = [jobItem].concat(restItems);
  var gridItems = restItems.slice();
  gridItems.splice(aIdx, 0, jobItem);
  var grid = _u8JobGrid(gridItems);
  var opts = [
    {val: jobItem.label}
  ].concat(restItems.map(function(r){ return {val: r.label, tag: r.tag}; }));
  opts = _u8Place(opts, aIdx);
  return {
    t: 'Look at the four people. Which one is working at a job?',
    s: grid,
    o: opts, a: aIdx,
    e: 'The ' + jobItem.label + ' is doing work for pay. That is a job.',
    d: diff,
    h: 'A job is work people do for pay. Look for the one who is doing work, not playing or resting.',
    sk: 'earning_income',
    i: _i81JobConfusion()
  };
}

// _q81GiftVsIncome — C4: gift-vs-work card pair + "Which one is income?"
// or "Which one is a gift?" askForGift inverts which side is the correct answer.
function _q81GiftVsIncome(giftEmoji, giftLabel, workEmoji, workLabel, askForGift, diff, aIdx) {
  var pair = _u8GiftVsWork(giftEmoji, giftLabel, workEmoji, workLabel);
  var correctText, wrong1, wrong2, wrong3;
  if (askForGift) {
    correctText = 'the ' + giftLabel;
    wrong1 = 'the ' + workLabel;
    wrong2 = 'both are gifts';
    wrong3 = 'neither is a gift';
  } else {
    correctText = 'the ' + workLabel;
    wrong1 = 'the ' + giftLabel;
    wrong2 = 'both are income';
    wrong3 = 'neither is income';
  }
  var opts = [
    {val: correctText},
    {val: wrong1, tag: _81GI},
    {val: wrong2, tag: _81GI},
    {val: wrong3, tag: _81PW}
  ];
  opts = _u8Place(opts, aIdx);
  return {
    t: askForGift ? 'Look at the two cards. Which one is a gift?' : 'Look at the two cards. Which one is income?',
    s: pair,
    o: opts, a: aIdx,
    e: askForGift ? ('The ' + giftLabel + ' is a gift — it was given for free. The ' + workLabel + ' is income because work was done for pay.')
                  : ('The ' + workLabel + ' is income — work was done for pay. The ' + giftLabel + ' is a gift because it was given for free.'),
    d: diff,
    h: askForGift ? 'A gift is given for free. Income comes from doing work.' : 'Income comes from doing work. A gift is given for free.',
    sk: 'earning_income',
    i: _i81GiftVsIncome()
  };
}

// _q81WorkVsPlay — C5: work-vs-leisure pair + "Which one earns income?"
function _q81WorkVsPlay(workEmoji, workLabel, playEmoji, playLabel, diff, aIdx) {
  var pair = _u8WorkVsRest(workEmoji, workLabel, playEmoji, playLabel);
  var opts = [
    {val: 'the ' + workLabel},
    {val: 'the ' + playLabel,   tag: _81WP},
    {val: 'both earn income',   tag: _81WP},
    {val: 'neither earns income', tag: _81NW}
  ];
  opts = _u8Place(opts, aIdx);
  return {
    t: 'Look at the two cards. Which one earns income?',
    s: pair,
    o: opts, a: aIdx,
    e: 'The ' + workLabel + ' is doing work for pay. That earns income. The ' + playLabel + ' is for fun and does not earn income.',
    d: diff,
    h: 'Working for pay earns income. Playing or resting does not.',
    sk: 'earning_income',
    i: _i81WorkVsPlay()
  };
}

// _q81WorkThatEarns — C6: 4-card grid + "Which activity shows someone
// earning income?" with mixed distractors (play, rest, gift, unpaid help).
// jobItem: {emoji, label}  distractors: [{emoji, label, tag}] length 3.
function _q81WorkThatEarns(jobItem, distractors, diff, aIdx) {
  var gridItems = distractors.slice();
  gridItems.splice(aIdx, 0, jobItem);
  var grid = _u8JobGrid(gridItems);
  var opts = [
    {val: jobItem.label}
  ].concat(distractors.map(function(d){ return {val: d.label, tag: d.tag}; }));
  opts = _u8Place(opts, aIdx);
  return {
    t: 'Look at the four activities. Which one shows someone earning income?',
    s: grid,
    o: opts, a: aIdx,
    e: '"' + jobItem.label + '" shows someone doing work and being paid. That earns income.',
    d: diff,
    h: 'Look for the one who is doing work for pay. Playing, resting, getting gifts, and helping for free do not earn income.',
    sk: 'earning_income',
    i: _i81PaidWork()
  };
}

// _q81SkillWork — C7: "A [job] needs which skill to do their work?"
// correct: skill string  wrong: [{val, tag}] length 3
function _q81SkillWork(job, correctSkill, wrongSkills, diff, aIdx) {
  var opts = [{val: correctSkill}].concat(wrongSkills);
  opts = _u8Place(opts, aIdx);
  return {
    t: 'A ' + job + ' needs which skill to do their work and earn income?',
    o: opts, a: aIdx,
    e: 'A ' + job + ' uses ' + correctSkill + ' to do their work. The right skill helps a person earn income.',
    d: diff,
    h: 'Think about what a ' + job + ' actually does every day.',
    sk: 'earning_income',
    i: _i81SkillWork()
  };
}

// _q81ErrorRepair — C8: student's wrong statement + "What is the correct fix?"
// claim: student's wrong sentence  correctFix: correct fix sentence
// wrongs: [{val, tag}] length 3
function _q81ErrorRepair(claim, correctFix, wrongs, diff, aIdx) {
  var opts = [{val: correctFix}].concat(wrongs);
  opts = _u8Place(opts, aIdx);
  return {
    t: 'A student says: "' + claim + '" What is the correct fix?',
    o: opts, a: aIdx,
    e: 'The correct fix is: "' + correctFix + '"',
    d: diff,
    h: 'Read the student\'s claim. Then think about what income really is — money earned by doing work.',
    sk: 'earning_income',
    i: _i81Definition()
  };
}

// _q81TrueSentence — C9: 4 candidate sentences about income, one true.
// correct: true sentence  wrongs: [{val, tag}] length 3
function _q81TrueSentence(correctText, wrongs, diff, aIdx) {
  var opts = [{val: correctText}].concat(wrongs);
  opts = _u8Place(opts, aIdx);
  return {
    t: 'Which sentence is true about income?',
    o: opts, a: aIdx,
    e: 'True: "' + correctText + '" The other sentences are wrong about income.',
    d: diff,
    h: 'Income is money earned by working. Check each sentence against that idea.',
    sk: 'earning_income',
    i: _i81Definition()
  };
}

// ── L8.1 key ideas (6) ───────────────────────────────────────────────────────
var _l81KeyIdeas = [
  'Income is money earned by working.',
  'People can earn income in many ways — at a job, by selling things, or by doing paid chores. A job is one common way people earn income.',
  'A gift is money or something given to you. A gift is not income because you did not work for it.',
  'Playing, resting, sleeping, and having fun are not work. They do not earn income.',
  'Every kind of work needs skills — a cook needs cooking skills, a teacher needs teaching skills, a builder needs building skills. Skills help people do their work and earn income.',
  'Income comes only from doing work. Money you get for free, like a birthday gift, is not income.'
];

// ── L8.1 worked examples (5) ─────────────────────────────────────────────────
var _l81Examples = [
  {
    id: 'g1-u8-l1-ex-1',
    title: 'Example 1: What is income?',
    prompt: 'What is income?',
    visual: {type: 'rawHtml', html: _u8MoneyBag()},
    steps: [
      'Income is a special word for money you earn.',
      'You earn money by doing work.',
      'When someone works and gets paid, that pay is called income.',
      'Money given to you for free is not income — that is a gift.'
    ],
    finalAnswer: 'Income is money earned by working.'
  },
  {
    id: 'g1-u8-l1-ex-2',
    title: 'Example 2: Paid work earns income',
    prompt: 'Maya walks the neighbor\'s dog after school and gets paid. Is Maya earning income?',
    visual: {type: 'rawHtml', html: _u8ScenarioCard('🚶‍♀️', 'Maya walks the dog for pay')},
    steps: [
      'Maya is doing work — she walks the dog.',
      'The neighbor pays Maya for the work.',
      'Doing work and getting paid earns income.',
      'Kids can earn income too, when work is done for pay.'
    ],
    finalAnswer: 'Yes — Maya is earning income.'
  },
  {
    id: 'g1-u8-l1-ex-3',
    title: 'Example 3: Playing is not earning',
    prompt: 'Sam plays soccer with his friends for fun. Is Sam earning income?',
    visual: {type: 'rawHtml', html: _u8ScenarioCard('⚽', 'Sam plays soccer for fun')},
    steps: [
      'Sam is playing for fun.',
      'Playing is not work.',
      'No work, no pay.',
      'No pay, no income.'
    ],
    finalAnswer: 'No — Sam is playing, not earning income.'
  },
  {
    id: 'g1-u8-l1-ex-4',
    title: 'Example 4: A gift is not income',
    prompt: 'Grandma sends Lin a birthday card with money inside. Is that money income?',
    visual: {type: 'rawHtml', html: _u8GiftVsWork('🎂', 'birthday card from Grandma', '👩‍🍳', 'Lin baking cookies for pay')},
    steps: [
      'Lin did not do work for the birthday money.',
      'Grandma gave the money for free, as a gift.',
      'A gift is not income.',
      'If Lin baked cookies and was paid for them, that pay would be income.'
    ],
    finalAnswer: 'No — the birthday money is a gift, not income. The cookie-baking pay would be income.'
  },
  {
    id: 'g1-u8-l1-ex-5',
    title: 'Example 5: Skills help earn income',
    prompt: 'A baker uses baking skills at work and gets paid. What is the money the baker earned called?',
    visual: {type: 'rawHtml', html: _u8WorkerCard('🥖', 'baker')},
    steps: [
      'The baker does work — making bread and pastries.',
      'The baker uses baking skills to do that work.',
      'The baker gets paid for the work.',
      'Money earned by working is called income.'
    ],
    finalAnswer: 'The baker earned income.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L8.1 question banks (9 categories, 140 total)
//  Target: 45E / 55M / 40H
//  C1 define(12) + C2 identify(18) + C3 jobVsNot(18) + C4 giftVsIncome(18) +
//  C5 workVsPlay(14) + C6 workThatEarns(16) + C7 skills(14) +
//  C8 errorRepair(14) + C9 trueSentence(16)
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Define Income (12 = 4E / 5M / 3H) ────────────────────────────────────
var _l81C1 = [
  // Easy (4)
  _q81DefineIncome('What is income?',
    'Income is money earned by working.',
    [{val:'any money a person has', tag:_81ID},
     {val:'money found on the ground', tag:_81ID},
     {val:'money given as a gift', tag:_81GI}],
    'e', 0),
  _q81DefineIncome('Which sentence describes income?',
    'Money earned by working is called income.',
    [{val:'Money found in a couch is called income.', tag:_81ID},
     {val:'Money from a birthday card is called income.', tag:_81GI},
     {val:'Money given for free is called income.', tag:_81GI}],
    'e', 1),
  _q81DefineIncome('What is income?',
    'Income is money you earn by doing work.',
    [{val:'Income is money you find by chance.', tag:_81ID},
     {val:'Income is money given to you for free.', tag:_81GI},
     {val:'Income is any money in your hand.', tag:_81ID}],
    'e', 2),
  _q81DefineIncome('Which sentence is true?',
    'Income comes from doing work.',
    [{val:'Income comes from birthday cards.', tag:_81GI},
     {val:'Income comes from finding money.', tag:_81ID},
     {val:'Income comes from sleeping.', tag:_81NW}],
    'e', 3),
  // Medium (5)
  _q81DefineIncome('Complete the sentence. Income is...',
    'money earned by working at a job or by doing paid chores.',
    [{val:'any money a person has, even gifts.', tag:_81GI},
     {val:'money used at a shop.', tag:_81IU},
     {val:'money found in a couch.', tag:_81ID}],
    'm', 0),
  _q81DefineIncome('Which sentence describes income correctly?',
    'When a person does work and gets paid, the pay is income.',
    [{val:'When a person gets money for free, the money is income.', tag:_81GI},
     {val:'When a person plays and has fun, the fun is income.', tag:_81WP},
     {val:'When a person finds money, the money is income.', tag:_81ID}],
    'm', 1),
  _q81DefineIncome('What is income?',
    'Income is the money a person earns by doing work.',
    [{val:'Income is money received as a gift.', tag:_81GI},
     {val:'Income is money already sitting in a wallet.', tag:_81IU},
     {val:'Income is money found by accident.', tag:_81ID}],
    'm', 2),
  _q81DefineIncome('Which sentence is true about income?',
    'Income is earned by doing work. It is not the same as a gift.',
    [{val:'Income and gifts are the same thing.', tag:_81GI},
     {val:'Income is found, not earned.', tag:_81ID},
     {val:'Income is money that does not need any work.', tag:_81GI}],
    'm', 3),
  _q81DefineIncome('What makes money into income?',
    'Doing work and being paid for it makes money into income.',
    [{val:'Getting money for a birthday makes it income.', tag:_81GI},
     {val:'Finding money on the ground makes it income.', tag:_81ID},
     {val:'Having a lot of money makes it income.', tag:_81ID}],
    'm', 0),
  // Hard (3)
  _q81DefineIncome('Which best describes what income means?',
    'Income is money a person earns by working — whether at a job, by selling things, or by doing paid chores.',
    [{val:'Income is any money a person has, no matter where it came from.', tag:_81ID},
     {val:'Income is only the money adults earn at big careers.', tag:_81JC},
     {val:'Income is money that comes from family for free.', tag:_81GI}],
    'h', 1),
  _q81DefineIncome('Which sentence is the best definition of income?',
    'Income is money earned through work.',
    [{val:'Income is money received as a present.', tag:_81GI},
     {val:'Income is money already kept at home.', tag:_81ID},
     {val:'Income is money found by chance.', tag:_81ID}],
    'h', 2),
  _q81DefineIncome('Which sentence is true about income?',
    'Both adults and kids can earn income by doing paid work.',
    [{val:'Only adults can earn income.', tag:_81JC},
     {val:'Only money found is income.', tag:_81ID},
     {val:'Only gift money is income.', tag:_81GI}],
    'h', 3)
];

// ── C2: Identify Earning Income (18 = 6E / 7M / 5H) ──────────────────────────
var _l81C2 = [
  // Easy (6)
  _q81IdentifyEarning('Mr. Lee',  '\u{1F468}‍\u{1F373}', 'Mr. Lee cooks meals at the restaurant', 'work_paid', 'e', 0),
  _q81IdentifyEarning('Sam',      '⚽',  'Sam plays soccer with friends for fun',  'play',      'e', 1),
  _q81IdentifyEarning('Ms. Park', '\u{1F469}‍\u{1F3EB}', 'Ms. Park teaches a class at school', 'work_paid', 'e', 2),
  _q81IdentifyEarning('Lily',     '\u{1F6CF}', 'Lily takes a nap after school',         'rest',      'e', 3),
  _q81IdentifyEarning('Dr. Vega', '\u{1F468}‍⚕️', 'Dr. Vega sees patients at the clinic', 'work_paid', 'e', 0),
  _q81IdentifyEarning('Ana',      '\u{1F381}', 'Ana gets a birthday gift from Grandma',  'gift',     'e', 1),
  // Medium (7)
  _q81IdentifyEarning('Maya',     '\u{1F6B6}‍♀️', 'Maya walks the neighbor’s dog for pay', 'work_paid', 'm', 0),
  _q81IdentifyEarning('Jaden',    '\u{1F48C}', 'Jaden gets a holiday card with money inside', 'gift',  'm', 2),
  _q81IdentifyEarning('Carlos',   '\u{1F33F}', 'Carlos waters the garden for pay',       'work_paid',  'm', 3),
  _q81IdentifyEarning('Mia',      '\u{1F3AE}', 'Mia plays video games at home',          'play',       'm', 0),
  _q81IdentifyEarning('Mrs. Ng',  '\u{1F4DA}', 'Mrs. Ng works at the library',           'work_paid',  'm', 1),
  _q81IdentifyEarning('Tomas',    '\u{1F6C0}', 'Tomas takes a long bath',                'rest',       'm', 2),
  _q81IdentifyEarning('Sara',     '\u{1F34B}', 'Sara sells lemonade at her stand',       'work_paid',  'm', 3),
  // Hard (5)
  _q81IdentifyEarning('Rina',     '\u{1F9F8}', 'Rina helps her little brother for free', 'unpaid_work','h', 0),
  _q81IdentifyEarning('Lin',      '\u{1F36A}', 'Lin bakes cookies to sell at the bake sale','work_paid','h', 1),
  _q81IdentifyEarning('Dev',      '\u{1F333}', 'Dev plants a tree at school for fun',    'unpaid_work','h', 2),
  _q81IdentifyEarning('Ben',      '\u{1F9F9}', 'Ben sweeps the neighbor’s porch for pay','work_paid', 'h', 3),
  _q81IdentifyEarning('Eli',      '\u{1F355}', 'Eli eats pizza at lunch',                'eating',     'h', 0)
];

// ── C3: Job vs Not-Job (18 = 7E / 7M / 4H) ───────────────────────────────────
var _l81C3 = [
  // Easy (7) — adult jobs vs clear leisure
  _q81JobVsNotJob({emoji:'\u{1F468}‍\u{1F373}', label:'chef cooking at work'},
    [{emoji:'\u{1F6CF}', label:'napping', tag:_81WP},
     {emoji:'\u{1F355}', label:'eating pizza', tag:_81WP},
     {emoji:'\u{1F3AE}', label:'playing video games', tag:_81WP}], 'e', 0),
  _q81JobVsNotJob({emoji:'\u{1F469}‍\u{1F3EB}', label:'teacher teaching'},
    [{emoji:'\u{1F4FA}', label:'watching TV', tag:_81WP},
     {emoji:'⚽', label:'soccer for fun', tag:_81WP},
     {emoji:'\u{1F3A8}', label:'painting for fun', tag:_81WP}], 'e', 1),
  _q81JobVsNotJob({emoji:'\u{1F956}', label:'baker baking bread'},
    [{emoji:'\u{1F634}', label:'sleeping in', tag:_81NW},
     {emoji:'\u{1F483}', label:'dancing for fun', tag:_81WP},
     {emoji:'\u{1FA81}', label:'flying a kite', tag:_81WP}], 'e', 2),
  _q81JobVsNotJob({emoji:'\u{1F68C}', label:'bus driver at work'},
    [{emoji:'\u{1F382}', label:'eating cake', tag:_81WP},
     {emoji:'\u{1F4D6}', label:'reading for fun', tag:_81WP},
     {emoji:'\u{1F3B2}', label:'board games', tag:_81WP}], 'e', 3),
  _q81JobVsNotJob({emoji:'\u{1F468}‍⚕️', label:'doctor with a patient'},
    [{emoji:'\u{1F3C3}', label:'playing tag', tag:_81WP},
     {emoji:'⚽', label:'soccer for fun', tag:_81WP},
     {emoji:'\u{1F4FA}', label:'watching cartoons', tag:_81WP}], 'e', 0),
  _q81JobVsNotJob({emoji:'\u{1F692}', label:'firefighter on duty'},
    [{emoji:'\u{1F3CA}', label:'swimming for fun', tag:_81WP},
     {emoji:'\u{1F634}', label:'naptime', tag:_81NW},
     {emoji:'\u{1F355}', label:'eating pizza', tag:_81WP}], 'e', 1),
  _q81JobVsNotJob({emoji:'\u{1F4EB}', label:'mail carrier delivering'},
    [{emoji:'\u{1F388}', label:'balloon party', tag:_81WP},
     {emoji:'\u{1F3AE}', label:'video games', tag:_81WP},
     {emoji:'\u{1F6C0}', label:'taking a bath', tag:_81NW}], 'e', 2),
  // Medium (7) — mix of adult + paid kid
  _q81JobVsNotJob({emoji:'\u{1F469}‍⚕️', label:'nurse helping a patient'},
    [{emoji:'\u{1F366}', label:'eating ice cream', tag:_81WP},
     {emoji:'\u{1F4FA}', label:'watching TV', tag:_81WP},
     {emoji:'\u{1FAE7}', label:'blowing bubbles', tag:_81WP}], 'm', 3),
  _q81JobVsNotJob({emoji:'\u{1F6B6}‍♀️', label:'Maya walking dogs for pay'},
    [{emoji:'\u{1F6CF}', label:'napping', tag:_81NW},
     {emoji:'\u{1F37F}', label:'eating a snack', tag:_81WP},
     {emoji:'\u{1F3AE}', label:'playing video games', tag:_81WP}], 'm', 0),
  _q81JobVsNotJob({emoji:'\u{1F4DA}', label:'librarian sorting books'},
    [{emoji:'\u{1F3C3}', label:'running for fun', tag:_81WP},
     {emoji:'\u{1F3A8}', label:'painting for fun', tag:_81WP},
     {emoji:'\u{1FA81}', label:'kite flying', tag:_81WP}], 'm', 1),
  _q81JobVsNotJob({emoji:'\u{1F33F}', label:'Carlos watering plants for pay'},
    [{emoji:'\u{1F998}', label:'hopscotch', tag:_81WP},
     {emoji:'\u{1F634}', label:'naptime', tag:_81NW},
     {emoji:'\u{1F389}', label:'dance party', tag:_81WP}], 'm', 2),
  _q81JobVsNotJob({emoji:'\u{1F9B7}', label:'dentist at work'},
    [{emoji:'\u{1F634}', label:'sleeping', tag:_81NW},
     {emoji:'\u{1F4FA}', label:'watching cartoons', tag:_81WP},
     {emoji:'\u{1F6C0}', label:'taking a bath', tag:_81NW}], 'm', 3),
  _q81JobVsNotJob({emoji:'\u{1F34B}', label:'Sara selling lemonade'},
    [{emoji:'\u{1F37F}', label:'eating popcorn', tag:_81WP},
     {emoji:'♟️', label:'playing chess', tag:_81WP},
     {emoji:'\u{1F388}', label:'balloon party', tag:_81WP}], 'm', 0),
  _q81JobVsNotJob({emoji:'\u{1F9D1}‍\u{1F33E}', label:'gardener at the farm'},
    [{emoji:'\u{1F37F}', label:'eating snacks', tag:_81WP},
     {emoji:'\u{1F4D6}', label:'story time', tag:_81WP},
     {emoji:'⚽', label:'soccer for fun', tag:_81WP}], 'm', 1),
  // Hard (4) — paid kid + tricky similar-context distractors
  _q81JobVsNotJob({emoji:'\u{1F36A}', label:'Lin baking cookies to sell'},
    [{emoji:'\u{1F4FA}', label:'watching a baking show', tag:_81WP},
     {emoji:'\u{1F60B}', label:'eating cookies for fun', tag:_81WP},
     {emoji:'\u{1F388}', label:'party with cookies', tag:_81WP}], 'h', 2),
  _q81JobVsNotJob({emoji:'\u{1F527}', label:'mechanic fixing engines'},
    [{emoji:'\u{1F697}', label:'playing with toy cars', tag:_81WP},
     {emoji:'\u{1F3AE}', label:'racing video games', tag:_81WP},
     {emoji:'\u{1F4FA}', label:'watching truck shows', tag:_81WP}], 'h', 3),
  _q81JobVsNotJob({emoji:'\u{1F9F9}', label:'Ben sweeping porch for pay'},
    [{emoji:'\u{1F3C3}', label:'running for exercise', tag:_81WP},
     {emoji:'\u{1F382}', label:'eating cake', tag:_81WP},
     {emoji:'\u{1F3B2}', label:'board games', tag:_81WP}], 'h', 0),
  _q81JobVsNotJob({emoji:'\u{1F9B7}', label:'dentist cleaning teeth'},
    [{emoji:'\u{1FAA5}', label:'brushing teeth at home', tag:_81WP},
     {emoji:'\u{1F36C}', label:'eating candy', tag:_81WP},
     {emoji:'\u{1F604}', label:'smile selfie', tag:_81WP}], 'h', 1)
];

// ── C4: Gift vs Income (18 = 6E / 7M / 5H) ───────────────────────────────────
var _l81C4 = [
  // Easy (6)
  _q81GiftVsIncome('\u{1F382}', 'birthday card from Grandma', '\u{1F468}‍\u{1F373}', 'cook at the restaurant', false, 'e', 0),
  _q81GiftVsIncome('\u{1F48C}', 'holiday gift from Aunt Lin', '\u{1F469}‍\u{1F3EB}', 'teacher at school',        true,  'e', 1),
  _q81GiftVsIncome('\u{1F381}', 'present from Uncle Rob',     '\u{1F468}‍⚕️', 'doctor at the clinic', false, 'e', 2),
  _q81GiftVsIncome('\u{1F384}', 'holiday gift from cousin',   '\u{1F956}', 'baker at the bakery',     true,  'e', 3),
  _q81GiftVsIncome('\u{1F382}', 'birthday card from Mom',     '\u{1F690}', 'bus driver at work',      false, 'e', 0),
  _q81GiftVsIncome('\u{1F370}', 'treat from the bakery owner','\u{1F9D1}‍\u{1F33E}', 'farmer at the farm', true,  'e', 1),
  // Medium (7)
  _q81GiftVsIncome('\u{1F388}', 'balloon money from Mom',     '\u{1F6B6}‍♀️', 'Maya walking dogs for pay', false, 'm', 2),
  _q81GiftVsIncome('\u{1F4E6}', 'package from Auntie',        '\u{1F9B7}', 'dentist at the office',   true,  'm', 3),
  _q81GiftVsIncome('\u{1F382}', 'birthday card from Aunt',    '\u{1F33F}', 'Carlos watering plants for pay', false, 'm', 0),
  _q81GiftVsIncome('\u{1F48C}', 'holiday gift from a friend', '\u{1F4DA}', 'librarian helping kids',  true,  'm', 1),
  _q81GiftVsIncome('\u{1F380}', 'wrapped gift from neighbor', '\u{1F34B}', 'Sara selling lemonade',   false, 'm', 2),
  _q81GiftVsIncome('\u{1F381}', 'present from Uncle Rob',     '\u{1F9D1}‍\u{1F692}', 'firefighter on duty', true,  'm', 3),
  _q81GiftVsIncome('✉️', 'card from Grandpa',       '\u{1F36A}', 'Lin baking cookies to sell', false, 'm', 0),
  // Hard (5) — paid kid scenarios emphasized
  _q81GiftVsIncome('\u{1F388}', 'balloon money from cousin',  '\u{1F9F9}', 'Ben sweeping porch for pay', false, 'h', 1),
  _q81GiftVsIncome('\u{1F384}', 'holiday gift from family',   '\u{1F527}', 'mechanic at the shop',    true,  'h', 2),
  _q81GiftVsIncome('\u{1F382}', 'birthday card from Mom',     '\u{1F6B6}‍♀️', 'Maya walking dogs for pay', false, 'h', 3),
  _q81GiftVsIncome('\u{1F380}', 'wrapped gift from a friend', '\u{1F9D1}‍\u{1F33E}', 'gardener at the park', true,  'h', 0),
  _q81GiftVsIncome('\u{1F48C}', 'holiday gift from Aunt Lin', '\u{1F34B}', 'Sara selling lemonade',   false, 'h', 1)
];

// ── C5: Work vs Play/Rest (14 = 5E / 5M / 4H) ────────────────────────────────
var _l81C5 = [
  // Easy (5)
  _q81WorkVsPlay('\u{1F469}‍\u{1F3EB}', 'teacher teaching',    '\u{1F3AE}', 'kid playing video games', 'e', 0),
  _q81WorkVsPlay('\u{1F956}', 'baker baking bread',                 '\u{1F6CF}', 'person napping',          'e', 1),
  _q81WorkVsPlay('\u{1F468}‍⚕️', 'doctor with patient','\u{1F382}', 'kid eating cake',       'e', 2),
  _q81WorkVsPlay('\u{1F9D1}‍\u{1F692}', 'firefighter on duty', '\u{1F3C3}', 'kid running for fun',     'e', 3),
  _q81WorkVsPlay('\u{1F4EB}', 'mail carrier delivering',            '\u{1F6C0}', 'person in the bath',      'e', 0),
  // Medium (5)
  _q81WorkVsPlay('\u{1F6B6}‍♀️', 'Maya walking dogs for pay', '⚽', 'kid bouncing a ball', 'm', 1),
  _q81WorkVsPlay('\u{1F33F}', 'Carlos watering plants for pay',     '\u{1F37F}', 'kid eating popcorn',      'm', 2),
  _q81WorkVsPlay('\u{1F469}‍⚕️', 'nurse helping patient', '♟️', 'kids playing chess', 'm', 3),
  _q81WorkVsPlay('\u{1F34B}', 'Sara selling lemonade',              '\u{1F634}', 'kid sleeping in',         'm', 0),
  _q81WorkVsPlay('\u{1F528}', 'builder using a hammer',             '\u{1F3A8}', 'kid coloring for fun',    'm', 1),
  // Hard (4) — similar-context pairs
  _q81WorkVsPlay('\u{1F36A}', 'Lin baking cookies to sell',         '\u{1F60B}', 'kid eating cookies for fun', 'h', 2),
  _q81WorkVsPlay('\u{1F9F9}', 'Ben sweeping porch for pay',         '\u{1FAA5}', 'kid playing with a broom for fun', 'h', 3),
  _q81WorkVsPlay('\u{1F9AE}', 'vet caring for a sick cat',          '\u{1F9F8}', 'kid playing with a toy cat', 'h', 0),
  _q81WorkVsPlay('\u{1F337}', 'gardener planting flowers for pay',  '\u{1F451}', 'kid making a flower crown for fun', 'h', 1)
];

// ── C6: Work That Earns Income (16 = 5E / 6M / 5H) ───────────────────────────
// Distractor mix: play, rest, gift, unpaid help — exactly one correct.
var _l81C6 = [
  // Easy (5) — paid work + 2 play/rest + 1 gift
  _q81WorkThatEarns({emoji:'\u{1F469}‍\u{1F3EB}', label:'teacher teaching a class'},
    [{emoji:'\u{1F634}', label:'kid napping', tag:_81WP},
     {emoji:'⚽', label:'kid playing soccer', tag:_81WP},
     {emoji:'\u{1F381}', label:'kid opening a birthday gift', tag:_81GI}], 'e', 0),
  _q81WorkThatEarns({emoji:'\u{1F956}', label:'baker baking bread'},
    [{emoji:'\u{1F4FA}', label:'kid watching TV', tag:_81WP},
     {emoji:'\u{1F3AE}', label:'kid playing video games', tag:_81WP},
     {emoji:'\u{1F384}', label:'kid opening a holiday present', tag:_81GI}], 'e', 1),
  _q81WorkThatEarns({emoji:'\u{1F6B6}‍♀️', label:'Maya walking dogs for pay'},
    [{emoji:'\u{1F6CF}', label:'kid napping', tag:_81WP},
     {emoji:'\u{1F382}', label:'kid eating cake', tag:_81WP},
     {emoji:'\u{1F381}', label:'kid getting a birthday gift', tag:_81GI}], 'e', 2),
  _q81WorkThatEarns({emoji:'\u{1F468}‍⚕️', label:'doctor seeing a patient'},
    [{emoji:'\u{1F3C3}', label:'kid playing tag', tag:_81WP},
     {emoji:'\u{1F634}', label:'kid sleeping in', tag:_81WP},
     {emoji:'\u{1F380}', label:'kid unwrapping a present', tag:_81GI}], 'e', 3),
  _q81WorkThatEarns({emoji:'\u{1F33F}', label:'Carlos watering plants for pay'},
    [{emoji:'\u{1F3AE}', label:'kid playing video games', tag:_81WP},
     {emoji:'\u{1F6CF}', label:'kid napping', tag:_81WP},
     {emoji:'\u{1F48C}', label:'kid getting a holiday gift', tag:_81GI}], 'e', 0),
  // Medium (6) — paid + 1 play + 1 gift + 1 unpaid help
  _q81WorkThatEarns({emoji:'\u{1F9D1}‍\u{1F692}', label:'firefighter on duty'},
    [{emoji:'\u{1F6CF}', label:'kid napping', tag:_81WP},
     {emoji:'\u{1F382}', label:'kid getting a birthday card', tag:_81GI},
     {emoji:'\u{1F9F8}', label:'kid helping at home for free', tag:_81PW}], 'm', 1),
  _q81WorkThatEarns({emoji:'\u{1F34B}', label:'Sara selling lemonade'},
    [{emoji:'\u{1F37F}', label:'kid eating popcorn', tag:_81WP},
     {emoji:'\u{1F381}', label:'kid getting a gift', tag:_81GI},
     {emoji:'\u{1F96B}', label:'kid volunteering at the food bank', tag:_81PW}], 'm', 2),
  _q81WorkThatEarns({emoji:'\u{1F4DA}', label:'librarian helping patrons'},
    [{emoji:'⚽', label:'kid playing soccer', tag:_81WP},
     {emoji:'\u{1F380}', label:'kid unwrapping a gift', tag:_81GI},
     {emoji:'\u{1F37D}️', label:'kid washing pots at home for free', tag:_81PW}], 'm', 3),
  _q81WorkThatEarns({emoji:'\u{1F36A}', label:'Lin baking cookies to sell'},
    [{emoji:'\u{1F60B}', label:'kid eating cookies for fun', tag:_81WP},
     {emoji:'\u{1F381}', label:'kid receiving cookies as a gift', tag:_81GI},
     {emoji:'\u{1F445}', label:'kid taste-testing for free', tag:_81PW}], 'm', 0),
  _q81WorkThatEarns({emoji:'\u{1F4EB}', label:'mail carrier delivering mail'},
    [{emoji:'\u{1F3A8}', label:'kid drawing for fun', tag:_81WP},
     {emoji:'\u{1F48C}', label:'kid getting a card from Grandpa', tag:_81GI},
     {emoji:'\u{1F9F8}', label:'kid sorting toys at home for free', tag:_81PW}], 'm', 1),
  _q81WorkThatEarns({emoji:'\u{1F9F9}', label:'Ben sweeping the neighbor’s porch for pay'},
    [{emoji:'\u{1F3C3}', label:'kid running for exercise', tag:_81WP},
     {emoji:'\u{1F36C}', label:'kid getting candy as a gift', tag:_81GI},
     {emoji:'\u{1F9FD}', label:'kid sweeping at home with no pay', tag:_81PW}], 'm', 2),
  // Hard (5) — harder mixes with paid kid emphasis
  _q81WorkThatEarns({emoji:'\u{1F9AE}', label:'vet caring for animals'},
    [{emoji:'\u{1F9F8}', label:'kid playing with a stuffed animal', tag:_81WP},
     {emoji:'\u{1F381}', label:'kid receiving a pet as a gift', tag:_81GI},
     {emoji:'\u{1F415}', label:'kid feeding a stray for free', tag:_81PW}], 'h', 3),
  _q81WorkThatEarns({emoji:'\u{1F528}', label:'builder using tools at work'},
    [{emoji:'\u{1F9F1}', label:'kid playing with toy tools', tag:_81WP},
     {emoji:'\u{1F380}', label:'kid receiving a toolset as a gift', tag:_81GI},
     {emoji:'\u{1F3DE}️', label:'kid helping clean the park for free', tag:_81PW}], 'h', 0),
  _q81WorkThatEarns({emoji:'\u{1F337}', label:'gardener planting flowers for pay'},
    [{emoji:'\u{1F33C}', label:'kid playing in flowers', tag:_81WP},
     {emoji:'\u{1F490}', label:'kid receiving flowers as a gift', tag:_81GI},
     {emoji:'\u{1F3EB}', label:'kid planting at school for free', tag:_81PW}], 'h', 1),
  _q81WorkThatEarns({emoji:'\u{1F527}', label:'mechanic fixing a car'},
    [{emoji:'\u{1F3CE}️', label:'kid playing with toy cars', tag:_81WP},
     {emoji:'\u{1F381}', label:'kid receiving a toy car as a gift', tag:_81GI},
     {emoji:'\u{1F697}', label:'kid washing the family car for free', tag:_81PW}], 'h', 2),
  _q81WorkThatEarns({emoji:'\u{1F6B6}‍♀️', label:'Maya walking the neighbor’s dog for pay'},
    [{emoji:'\u{1F415}', label:'kid playing with the family dog', tag:_81WP},
     {emoji:'\u{1F380}', label:'kid receiving a puppy as a gift', tag:_81GI},
     {emoji:'\u{1F429}', label:'kid pet-sitting for free for a friend', tag:_81PW}], 'h', 3)
];

// ── C7: Skills and Work (14 = 5E / 5M / 4H) ──────────────────────────────────
var _l81C7 = [
  // Easy (5)
  _q81SkillWork('cook', 'cooking food',
    [{val:'racing cars', tag:_81SW},
     {val:'flying planes', tag:_81SW},
     {val:'taking long naps', tag:_81SW}], 'e', 0),
  _q81SkillWork('teacher', 'reading books and explaining',
    [{val:'taking long naps', tag:_81SW},
     {val:'playing video games', tag:_81SW},
     {val:'racing motorcycles', tag:_81SW}], 'e', 1),
  _q81SkillWork('baker', 'measuring and mixing dough',
    [{val:'flying kites', tag:_81SW},
     {val:'watching TV all day', tag:_81SW},
     {val:'racing cars', tag:_81SW}], 'e', 2),
  _q81SkillWork('bus driver', 'paying close attention to the road',
    [{val:'sleeping while driving', tag:_81SW},
     {val:'playing video games', tag:_81SW},
     {val:'baking cookies', tag:_81SW}], 'e', 3),
  _q81SkillWork('firefighter', 'staying calm in danger',
    [{val:'napping at work', tag:_81SW},
     {val:'running away from fires', tag:_81SW},
     {val:'watching TV', tag:_81SW}], 'e', 0),
  // Medium (5)
  _q81SkillWork('doctor', 'caring for sick people',
    [{val:'ignoring sick people', tag:_81SW},
     {val:'playing soccer all day', tag:_81SW},
     {val:'racing cars', tag:_81SW}], 'm', 1),
  _q81SkillWork('nurse', 'being kind and patient',
    [{val:'being rough with patients', tag:_81SW},
     {val:'telling jokes only', tag:_81SW},
     {val:'sleeping in the lobby', tag:_81SW}], 'm', 2),
  _q81SkillWork('librarian', 'finding and organizing books',
    [{val:'throwing books on the floor', tag:_81SW},
     {val:'playing soccer in the library', tag:_81SW},
     {val:'eating snacks at the desk', tag:_81SW}], 'm', 3),
  _q81SkillWork('vet (animal doctor)', 'caring for animals gently',
    [{val:'yelling at animals', tag:_81SW},
     {val:'racing motorcycles', tag:_81SW},
     {val:'playing video games', tag:_81SW}], 'm', 0),
  _q81SkillWork('mail carrier', 'delivering letters on time',
    [{val:'losing letters', tag:_81SW},
     {val:'sleeping in the truck', tag:_81SW},
     {val:'playing tag', tag:_81SW}], 'm', 1),
  // Hard (4)
  _q81SkillWork('dentist', 'cleaning teeth carefully',
    [{val:'letting teeth get dirty', tag:_81SW},
     {val:'eating candy at work', tag:_81SW},
     {val:'playing music only', tag:_81SW}], 'h', 2),
  _q81SkillWork('mechanic', 'fixing engines and using tools',
    [{val:'leaving cars broken', tag:_81SW},
     {val:'watching TV at the shop', tag:_81SW},
     {val:'playing toy car races', tag:_81SW}], 'h', 3),
  _q81SkillWork('gardener', 'planting and tending plants',
    [{val:'stepping on plants', tag:_81SW},
     {val:'playing in puddles only', tag:_81SW},
     {val:'telling stories all day', tag:_81SW}], 'h', 0),
  _q81SkillWork('builder', 'measuring and using tools',
    [{val:'napping on the job', tag:_81SW},
     {val:'ignoring the plans', tag:_81SW},
     {val:'watching cartoons', tag:_81SW}], 'h', 1)
];

// ── C8: Error Repair (14 = 4E / 6M / 4H) ─────────────────────────────────────
var _l81C8 = [
  // Easy (4)
  _q81ErrorRepair('Birthday money is income.',
    'Birthday money is a gift. Income is money earned by working.',
    [{val:'Birthday money is income because it is money.', tag:_81GI},
     {val:'Birthday money is income only when you say thanks.', tag:_81GI},
     {val:'Birthday money is income because Grandma works.', tag:_81PW}], 'e', 0),
  _q81ErrorRepair('Playing soccer for fun earns income.',
    'Playing for fun is not work. Only paid work earns income.',
    [{val:'Playing soccer earns income because it is exercise.', tag:_81WP},
     {val:'Playing soccer earns income only on game days.', tag:_81WP},
     {val:'Playing soccer earns income because it is on TV.', tag:_81WP}], 'e', 1),
  _q81ErrorRepair('Sleeping all day earns income.',
    'Sleeping is not work. No work means no income.',
    [{val:'Sleeping earns income because it makes you healthy.', tag:_81NW},
     {val:'Sleeping earns income if you sleep in a big bed.', tag:_81NW},
     {val:'Sleeping earns income on weekends only.', tag:_81NW}], 'e', 2),
  _q81ErrorRepair('Money found on the ground is income.',
    'Found money is not income. Income is money earned by working.',
    [{val:'Found money is income because you can keep it.', tag:_81ID},
     {val:'Found money is income if you found a lot.', tag:_81ID},
     {val:'Found money is income if you found it at school.', tag:_81ID}], 'e', 3),
  // Medium (6)
  _q81ErrorRepair('Only adults can earn income.',
    'Both adults and kids can earn income by doing paid work.',
    [{val:'Only adults can earn income because kids do not work.', tag:_81JC},
     {val:'Only adults can earn income because they are bigger.', tag:_81JC},
     {val:'Only adults can earn income because kids only play.', tag:_81JC}], 'm', 0),
  _q81ErrorRepair('A baker needs to drive trucks to earn income.',
    'A baker needs baking skills to do the work that earns income.',
    [{val:'A baker needs to race cars to earn income.', tag:_81SW},
     {val:'A baker needs to teach math to earn income.', tag:_81SW},
     {val:'A baker needs to play games to earn income.', tag:_81SW}], 'm', 1),
  _q81ErrorRepair('Helping for free earns income.',
    'Helping for free is kind, but no pay means no income.',
    [{val:'Helping for free earns income because it is hard work.', tag:_81PW},
     {val:'Helping for free earns income because someone thanks you.', tag:_81PW},
     {val:'Helping for free earns income because help is valuable.', tag:_81PW}], 'm', 2),
  _q81ErrorRepair('All money in a wallet is income.',
    'Only money earned by working is income. Money in a wallet can come from gifts or other places.',
    [{val:'All money in a wallet is income because it is in the wallet.', tag:_81IU},
     {val:'All money in a wallet is income because you keep it.', tag:_81IU},
     {val:'All money in a wallet is income because wallets hold income.', tag:_81IU}], 'm', 3),
  _q81ErrorRepair('Maya cannot earn income because she is a kid.',
    'Maya can earn income when she does work and gets paid, like walking the neighbor’s dog for pay.',
    [{val:'Maya cannot earn income because kids do not have jobs.', tag:_81JC},
     {val:'Maya cannot earn income because kids only play.', tag:_81JC},
     {val:'Maya cannot earn income because she is small.', tag:_81JC}], 'm', 0),
  _q81ErrorRepair('A doctor needs to race cars to earn income.',
    'A doctor needs to care for sick people to do the work that earns income.',
    [{val:'A doctor needs to fly planes to earn income.', tag:_81SW},
     {val:'A doctor needs to bake bread to earn income.', tag:_81SW},
     {val:'A doctor needs to play music to earn income.', tag:_81SW}], 'm', 1),
  // Hard (4)
  _q81ErrorRepair('A trophy at the parade is income.',
    'A trophy is an award, not income. Income is money earned by working.',
    [{val:'A trophy is income because it is given for hard work.', tag:_81GI},
     {val:'A trophy is income because it is shiny.', tag:_81ID},
     {val:'A trophy is income only when it has a name on it.', tag:_81ID}], 'h', 2),
  _q81ErrorRepair('Eating breakfast is a job that earns income.',
    'Eating is not a job. Only paid work earns income.',
    [{val:'Eating breakfast earns income because food matters.', tag:_81WP},
     {val:'Eating breakfast earns income because it makes you ready for work.', tag:_81WP},
     {val:'Eating breakfast earns income because someone made it for you.', tag:_81WP}], 'h', 3),
  _q81ErrorRepair('Sara’s lemonade stand is just play, not income.',
    'Sara is doing work and being paid for the lemonade. That pay is income.',
    [{val:'Sara’s lemonade stand is play because it is fun.', tag:_81WP},
     {val:'Sara’s lemonade stand is play because kids run it.', tag:_81JC},
     {val:'Sara’s lemonade stand is play because it is not in a big shop.', tag:_81JC}], 'h', 0),
  _q81ErrorRepair('Money from a birthday card is the same as money from doing work.',
    'They are different. Birthday money is a gift. Money from work is income.',
    [{val:'They are the same because they are both green.', tag:_81GI},
     {val:'They are the same because they go in the same wallet.', tag:_81IU},
     {val:'They are the same because anyone can get them.', tag:_81GI}], 'h', 1)
];

// ── C9: True Sentence / Mixed Review (16 = 3E / 7M / 6H) ─────────────────────
var _l81C9 = [
  // Easy (3)
  _q81TrueSentence('Income is money earned by working.',
    [{val:'Income is any money you have.', tag:_81ID},
     {val:'Income is money you find.', tag:_81ID},
     {val:'Income is money for free.', tag:_81GI}], 'e', 0),
  _q81TrueSentence('A gift is not income.',
    [{val:'A gift is income because it is money.', tag:_81GI},
     {val:'A gift is income only on birthdays.', tag:_81GI},
     {val:'A gift is income if it is wrapped.', tag:_81GI}], 'e', 1),
  _q81TrueSentence('People earn income by doing work.',
    [{val:'People earn income by playing.', tag:_81WP},
     {val:'People earn income by sleeping.', tag:_81NW},
     {val:'People earn income by waiting.', tag:_81NW}], 'e', 2),
  // Medium (7)
  _q81TrueSentence('Both adults and kids can earn income from paid work.',
    [{val:'Only adults can earn income.', tag:_81JC},
     {val:'Only adults at big offices can earn income.', tag:_81JC},
     {val:'Only kids can earn income.', tag:_81JC}], 'm', 3),
  _q81TrueSentence('Income is earned, never received as a gift.',
    [{val:'Income and gifts are the same.', tag:_81GI},
     {val:'Income comes from gifts only.', tag:_81GI},
     {val:'Income is money family gives for free.', tag:_81GI}], 'm', 0),
  _q81TrueSentence('Skills help people do their work and earn income.',
    [{val:'Skills are not needed for any job.', tag:_81SW},
     {val:'Skills mean playing games well.', tag:_81SW},
     {val:'Skills only matter at school.', tag:_81SW}], 'm', 1),
  _q81TrueSentence('A teacher earns income by teaching at school.',
    [{val:'A teacher earns income only on summer break.', tag:_81WP},
     {val:'A teacher earns income from holiday cards.', tag:_81GI},
     {val:'A teacher earns income by watching TV.', tag:_81WP}], 'm', 2),
  _q81TrueSentence('Doing work without pay is not earning income.',
    [{val:'Free help always earns income.', tag:_81PW},
     {val:'Helping for free is the same as paid work.', tag:_81PW},
     {val:'Volunteering at the park earns income.', tag:_81PW}], 'm', 3),
  _q81TrueSentence('A baker uses baking skills to earn income.',
    [{val:'A baker uses baking skills to play.', tag:_81WP},
     {val:'A baker uses baking skills only at home for fun.', tag:_81WP},
     {val:'A baker uses baking skills to find gifts.', tag:_81GI}], 'm', 0),
  _q81TrueSentence('When a kid walks a dog for pay, the pay is income.',
    [{val:'When a kid walks a dog for pay, the pay is a gift.', tag:_81GI},
     {val:'When a kid walks a dog for pay, the pay is play money.', tag:_81WP},
     {val:'When a kid walks a dog for pay, the pay is not real.', tag:_81ID}], 'm', 1),
  // Hard (6)
  _q81TrueSentence('Money earned by selling lemonade for pay is income.',
    [{val:'Money from selling lemonade is a gift.', tag:_81GI},
     {val:'Money from selling lemonade is play money.', tag:_81WP},
     {val:'Money from selling lemonade is found money.', tag:_81ID}], 'h', 2),
  _q81TrueSentence('A nurse uses kindness and patience to earn income.',
    [{val:'A nurse needs racing skills to earn income.', tag:_81SW},
     {val:'A nurse earns income by sleeping at work.', tag:_81NW},
     {val:'A nurse earns income only on weekends without working.', tag:_81WP}], 'h', 3),
  _q81TrueSentence('A gift is given for free. Income is earned by working.',
    [{val:'A gift is income because it is money.', tag:_81GI},
     {val:'A gift is the same as income.', tag:_81GI},
     {val:'Income is money received for free.', tag:_81GI}], 'h', 0),
  _q81TrueSentence('A builder uses tools and measures to earn income.',
    [{val:'A builder plays with blocks to earn income.', tag:_81SW},
     {val:'A builder earns income by watching cartoons.', tag:_81NW},
     {val:'A builder earns income from gifts.', tag:_81GI}], 'h', 1),
  _q81TrueSentence('Income is what a person earns. What to do with income comes later.',
    [{val:'Income is anything money does.', tag:_81IU},
     {val:'Income is what is used at a shop.', tag:_81IU},
     {val:'Income is what is kept in a wallet.', tag:_81IU}], 'h', 2),
  _q81TrueSentence('A kid who is paid for doing chores at the neighbor’s house earns income.',
    [{val:'A kid cannot earn income because kids only play.', tag:_81JC},
     {val:'A kid earns income only on holidays.', tag:_81WP},
     {val:'A kid earns income from helping for free.', tag:_81PW}], 'h', 3)
];

// ── L8.1 combined bank ───────────────────────────────────────────────────────
var _l81Bank = [].concat(_l81C1, _l81C2, _l81C3, _l81C4, _l81C5, _l81C6, _l81C7, _l81C8, _l81C9);


// ── Unit spec ────────────────────────────────────────────────────────────────
export const G1_U8_SPEC = {
  unitId: 'g1u8',
  title: 'Financial Literacy',
  teks: ['1.9A', '1.9B', '1.9C', '1.9D'],
  schemaVersion: '0.2.0',

  unitTest: {
    sourceRule: 'all_lesson_quizbanks',
    totalQuestions: 25,
    difficultyMixBalanced: true,
    preserveDiagnosticMetadata: true
  },

  lessons: [

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 8.1 — Earning Income
    //  TEKS 1.9A | 140 questions (45E / 55M / 40H)
    //  9 categories: C1 define, C2 identify-earning, C3 job-vs-not, C4 gift-
    //  vs-income, C5 work-vs-play/rest, C6 work-that-earns, C7 skills, C8
    //  error-repair, C9 true-sentence/mixed-review.
    //  Paid kid work counts as earning income alongside adult jobs. No $ or
    //  ¢ symbols. No coin imagery. No spending/saving/giving content.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u8-l1',
      title: 'Earning Income',
      teks: ['1.9A'],
      skill: 'earning_income',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: _l81KeyIdeas,
      workedExamples: _l81Examples,
      quizBank: _l81Bank,
      diagnostics: {
        commonDistractors: [_81ID, _81GI, _81WP, _81JC, _81NW, _81PW, _81SW, _81IU],
        errorTags:         [_81ID, _81GI, _81WP, _81JC, _81NW, _81PW, _81SW, _81IU],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 8.2 — Goods and Services   (SCAFFOLD)
    //  TEKS 1.9B | Focus: income helps people obtain goods and services;
    //  people make purchase choices.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u8-l2',
      title: 'Goods and Services',
      teks: ['1.9B'],
      skill: 'goods_and_services',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 8.3 — Spending and Saving   (SCAFFOLD)
    //  TEKS 1.9C | Focus: distinguish between spending and saving.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u8-l3',
      title: 'Spending and Saving',
      teks: ['1.9C'],
      skill: 'spending_and_saving',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 8.4 — Charitable Giving   (SCAFFOLD)
    //  TEKS 1.9D | Focus: consider giving money to help others.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u8-l4',
      title: 'Charitable Giving',
      teks: ['1.9D'],
      skill: 'charitable_giving',
      allowedQuestionTypes: ['multipleChoice'],
      keyIdeas: [],
      workedExamples: [],
      quizBank: [],
      diagnostics: { commonDistractors: [], errorTags: [], interventionRules: [] }
    }

  ]
};

export default G1_U8_SPEC;
