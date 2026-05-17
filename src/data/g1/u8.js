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
 *    L8.2  Goods and Services       ← 140 questions (45E / 55M / 40H)
 *    L8.3  Spending and Saving      ← 150 questions (45E / 60M / 45H)
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
// Used as the building block for C3 / C4 / C5 / C6 imgChoice grids and the
// rest of the L8.1 visuals. FIXED width (not min/max range) so every card
// in any grid renders at identical outer dimensions — required for the
// imgChoice equal-size constraint. Long labels wrap onto multiple lines
// inside the fixed width.
function _u8WorkerCard(emoji, label) {
  return '<div style="display:inline-block;border:2px solid #37474F;border-radius:8px;' +
    'background:#fff;padding:6px 10px;margin:4px;text-align:center;' +
    'width:108px;font-family:Nunito,sans-serif;vertical-align:top">' +
    '<div style="font-size:36px;line-height:1;margin-bottom:4px">' + emoji + '</div>' +
    '<div style="font-size:12px;font-weight:bold;color:#37474F;line-height:1.2;' +
      'overflow-wrap:break-word;word-wrap:break-word">' + label + '</div>' +
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

// _q81JobVsNotJob — C3: 4 tappable image cards (imgChoice). The student
// taps the picture itself; there are no separate text buttons below.
// jobItem: {emoji, label}  3 non-job items: [{emoji, label, tag}]
// Mirrors the imgChoice pattern from L6.4 C3 / L7.1 C6 / L7.2 C4 / L7.3 C4 —
// q.v is the active-quiz imgChoice config; q.s is the fallback grid shown
// in review mode and in the Practice Drills imgChoice branch.
function _q81JobVsNotJob(jobItem, restItems, diff, aIdx) {
  var letters = ['A','B','C','D'];
  // Place jobItem at aIdx in the on-screen grid; distractors fill the rest in order.
  var gridItems = restItems.slice();
  gridItems.splice(aIdx, 0, jobItem);

  // svgs: one tappable card per slot. Reuses _u8WorkerCard so visual language
  // matches the rest of the unit. Cards are equal-size by construction.
  var svgs = gridItems.map(function(item){ return _u8WorkerCard(item.emoji, item.label); });
  var labels = letters.map(function(L){ return 'Picture ' + L; });

  // Fallback grid for review mode / Practice Drills: same 4 cards in a row
  // with letter headers so the explanation can reference Picture A/B/C/D.
  var fallback = '<div style="display:flex;flex-wrap:wrap;justify-content:center;' +
    'gap:6px;padding:4px 0">' +
    gridItems.map(function(item, i){
      return '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
        'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:110px;vertical-align:top">' +
        '<div style="font-size:14px;font-weight:800;color:#333;margin-bottom:3px">' + letters[i] + '</div>' +
        _u8WorkerCard(item.emoji, item.label) +
      '</div>';
    }).join('') +
  '</div>';

  // Options: aIdx = correct (no tag); other slots carry the distractor's tag
  // so wrong answers route to the right intervention/error-tag bucket.
  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    var restIdx = i < aIdx ? i : i - 1;
    var tag = (restItems[restIdx] && restItems[restIdx].tag) || _81JC;
    return {val: 'Picture ' + L, tag: tag};
  });

  return {
    t: 'Look at the four pictures. Which picture shows someone working at a job? Tap a picture.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows ' + jobItem.label + ' — doing work for pay. That is a job.',
    d: diff,
    h: 'A job is work people do for pay. Look for the picture showing someone doing work, not playing or resting.',
    sk: 'earning_income',
    i: _i81JobConfusion()
  };
}

// _q81GiftVsIncome — C4: 2 tappable picture cards (imgChoice). One card shows
// a gift (with 🎁 badge), the other shows someone working for pay. Prompt
// asks the child to tap either "the card that shows income" or "the card
// that shows a gift". No "both"/"neither" — those concepts are not what
// this question type tests.
// aIdx ∈ {0, 1} (mod 2 to tolerate legacy bank values): 0 = correct card on
// the left, 1 = correct card on the right. Cards equal-size by construction.
function _q81GiftVsIncome(giftEmoji, giftLabel, workEmoji, workLabel, askForGift, diff, aIdx) {
  var letters = ['A', 'B'];
  aIdx = aIdx % 2;

  // Both cards use the same outer wrapper so the engine sizes them identically.
  // The gift card gets a 🎁 badge overlay; the work card gets an invisible
  // placeholder that occupies the same flow space (zero-width span) so neither
  // card is visually wider than the other.
  function buildCard(emoji, label, isGift) {
    var badge = isGift
      ? '<span style="position:absolute;top:-6px;left:-6px;font-size:20px;z-index:1" aria-hidden="true">🎁</span>'
      : '';
    return '<div style="position:relative;display:inline-block;vertical-align:top">' +
      badge +
      _u8WorkerCard(emoji, label) +
    '</div>';
  }

  // Which card is correct depends on askForGift.
  var correctSpec = askForGift ? {emoji: giftEmoji, label: giftLabel, isGift: true}
                                : {emoji: workEmoji, label: workLabel, isGift: false};
  var wrongSpec   = askForGift ? {emoji: workEmoji, label: workLabel, isGift: false}
                                : {emoji: giftEmoji, label: giftLabel, isGift: true};

  var slot0 = aIdx === 0 ? correctSpec : wrongSpec;
  var slot1 = aIdx === 1 ? correctSpec : wrongSpec;

  var svgs = [
    buildCard(slot0.emoji, slot0.label, slot0.isGift),
    buildCard(slot1.emoji, slot1.label, slot1.isGift)
  ];
  var labels = ['Picture A', 'Picture B'];

  var fallback = '<div style="display:flex;flex-wrap:wrap;justify-content:center;' +
    'gap:8px;padding:4px 0">' +
    [slot0, slot1].map(function(card, i){
      return '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
        'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:140px;vertical-align:top">' +
        '<div style="font-size:14px;font-weight:800;color:#333;margin-bottom:3px">' + letters[i] + '</div>' +
        buildCard(card.emoji, card.label, card.isGift) +
      '</div>';
    }).join('') +
  '</div>';

  var opts = aIdx === 0
    ? [{val: 'Picture A'}, {val: 'Picture B', tag: _81GI}]
    : [{val: 'Picture A', tag: _81GI}, {val: 'Picture B'}];

  return {
    t: askForGift ? 'Tap the card that shows a gift.' : 'Tap the card that shows income.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: aIdx,
    e: askForGift ? ('Picture ' + letters[aIdx] + ' shows the ' + giftLabel + ' — a gift, given for free. The other card shows the ' + workLabel + ' (work done for pay, which is income).')
                  : ('Picture ' + letters[aIdx] + ' shows the ' + workLabel + ' — work done for pay, which is income. The other card shows the ' + giftLabel + ' (a gift, given for free).'),
    d: diff,
    h: askForGift ? 'A gift is given for free, often wrapped or in a card.' : 'Income comes from doing work and being paid.',
    sk: 'earning_income',
    i: _i81GiftVsIncome()
  };
}

// _q81WorkVsPlay — C5: 2 tappable picture cards (imgChoice). The child taps
// the card itself; there are no separate text buttons below. No "both"/"neither"
// — those concepts are not what this question type tests.
// aIdx ∈ {0, 1} (mod 2 to tolerate legacy bank values): 0 = correct card on
// the left, 1 = correct card on the right. Cards equal-size by construction.
function _q81WorkVsPlay(workEmoji, workLabel, playEmoji, playLabel, diff, aIdx) {
  var letters = ['A', 'B'];
  aIdx = aIdx % 2;

  var slot0 = aIdx === 0 ? {emoji: workEmoji, label: workLabel} : {emoji: playEmoji, label: playLabel};
  var slot1 = aIdx === 1 ? {emoji: workEmoji, label: workLabel} : {emoji: playEmoji, label: playLabel};

  var svgs = [_u8WorkerCard(slot0.emoji, slot0.label), _u8WorkerCard(slot1.emoji, slot1.label)];
  var labels = ['Picture A', 'Picture B'];

  // Fallback grid for review mode / Practice Drills imgChoice branch
  var fallback = '<div style="display:flex;flex-wrap:wrap;justify-content:center;' +
    'gap:8px;padding:4px 0">' +
    [slot0, slot1].map(function(card, i){
      return '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
        'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:140px;vertical-align:top">' +
        '<div style="font-size:14px;font-weight:800;color:#333;margin-bottom:3px">' + letters[i] + '</div>' +
        _u8WorkerCard(card.emoji, card.label) +
      '</div>';
    }).join('') +
  '</div>';

  // Two options: aIdx is correct (no tag), the other gets _81WP (play-vs-work)
  var opts = aIdx === 0
    ? [{val: 'Picture A'}, {val: 'Picture B', tag: _81WP}]
    : [{val: 'Picture A', tag: _81WP}, {val: 'Picture B'}];

  return {
    t: 'Tap the card that shows someone earning income.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows the ' + workLabel + ' — doing work for pay. That earns income. The other card shows ' + playLabel + ' (for fun, not work).',
    d: diff,
    h: 'Working for pay earns income. Playing or resting does not.',
    sk: 'earning_income',
    i: _i81WorkVsPlay()
  };
}

// _q81WorkThatEarns — C6: 4 tappable image cards (imgChoice). The student
// taps the picture itself; there are no separate text buttons below.
// jobItem: {emoji, label}  distractors: [{emoji, label, tag}] length 3 with
// mixed reasons (play, rest, gift, unpaid help — exactly one correct).
// Same imgChoice pattern as L7.1 C6 / L7.2 C4 / L7.3 C4.
function _q81WorkThatEarns(jobItem, distractors, diff, aIdx) {
  var letters = ['A','B','C','D'];
  var gridItems = distractors.slice();
  gridItems.splice(aIdx, 0, jobItem);

  var svgs = gridItems.map(function(item){ return _u8WorkerCard(item.emoji, item.label); });
  var labels = letters.map(function(L){ return 'Picture ' + L; });

  var fallback = '<div style="display:flex;flex-wrap:wrap;justify-content:center;' +
    'gap:6px;padding:4px 0">' +
    gridItems.map(function(item, i){
      return '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
        'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:110px;vertical-align:top">' +
        '<div style="font-size:14px;font-weight:800;color:#333;margin-bottom:3px">' + letters[i] + '</div>' +
        _u8WorkerCard(item.emoji, item.label) +
      '</div>';
    }).join('') +
  '</div>';

  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    var restIdx = i < aIdx ? i : i - 1;
    var tag = (distractors[restIdx] && distractors[restIdx].tag) || _81WP;
    return {val: 'Picture ' + L, tag: tag};
  });

  return {
    t: 'Look at the four pictures. Which picture shows someone earning income? Tap a picture.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows ' + jobItem.label + ' — doing work and being paid. That earns income.',
    d: diff,
    h: 'Look for the picture showing someone doing work for pay. Playing, resting, getting gifts, and helping for free do not earn income.',
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
  _q81WorkThatEarns({emoji:'\u{1F4DA}', label:'librarian helping kids find books'},
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


// ════════════════════════════════════════════════════════════════════════════
//  L8.2 — Goods and Services
//  TEKS 1.9B | 140 questions (45E / 55M / 40H)
//
//  Puts L8.1's income definition to work: people use income to obtain goods
//  and services, and they make purchase choices about what to obtain.
//
//  10 categories: C1 identify-goods (imgChoice 4-card), C2 identify-services
//  (imgChoice 4-card), C3 good-vs-service (text MC), C4 match-scenario
//  (text MC), C5 income→good (text MC), C6 income→service (text MC),
//  C7 purchase-choice (imgChoice 4-card), C8 wants-needs-supporting-context
//  (text MC), C9 error-repair (text MC), C10 true-sentence/mixed-review
//  (text MC). imgChoice count: 46 (C1+C2+C7).
//
//  Goods are things (book, apple, shirt, …). Services are work someone does
//  (haircut, doctor visit, mechanic fixing a car, …). Cards for goods and
//  services use the SAME visual format (_u8WorkerCard) so the category is
//  never given away by styling.
//
//  Hard guardrails (verified by scope scans before lock):
//    NO $ symbol, NO ¢ symbol, NO dollar/cents amounts.
//    NO coin names, NO price/cost vocabulary.
//    NO spending/saving/giving content (L8.3/L8.4).
//    NO wants/needs as the assessed skill.
//    "wants"/"needs" (financial-literacy noun sense) appear ONLY in C8
//    prompts (12 questions). Other categories use neutral framings like
//    "is broken", "is hungry", "is sick".
//    NO Grade 2 financial-literacy content.
//    NO drag-and-drop. multipleChoice + imgChoice only.
// ════════════════════════════════════════════════════════════════════════════

// ── L8.2 error tags ──────────────────────────────────────────────────────────
var _82GS = 'err_good_vs_service_confusion';
var _82GD = 'err_good_definition_confusion';
var _82SD = 'err_service_definition_confusion';
var _82IP = 'err_income_purchase_confusion';
var _82PC = 'err_purchase_choice_confusion';
var _82WN = 'err_want_need_context_confusion';
var _82WS = 'err_worker_service_confusion';
var _82IS = 'err_item_service_confusion';
var _82NS = 'err_category_not_supported';

// ── L8.2 visual helpers ──────────────────────────────────────────────────────

// _u8GoodServicePair — 2-card vs pair. Both cards use _u8WorkerCard so they
// are visually identical (no badge or color hints which side is which).
function _u8GoodServicePair(goodEmoji, goodLabel, serviceEmoji, serviceLabel) {
  return '<div style="display:flex;justify-content:center;align-items:center;' +
    'gap:10px;margin:8px 0;flex-wrap:wrap">' +
    _u8WorkerCard(goodEmoji, goodLabel) +
    '<span style="font-size:14px;color:#9ca3af">vs</span>' +
    _u8WorkerCard(serviceEmoji, serviceLabel) +
    '</div>';
}

// _u8ItemGridFallback — 4-card grid with letter headers, used as the q.s
// fallback for C1/C2/C7 imgChoice questions (review mode + Practice Drills).
function _u8ItemGridFallback(items, letters) {
  return '<div style="display:flex;flex-wrap:wrap;justify-content:center;' +
    'gap:6px;padding:4px 0">' +
    items.map(function(it, i){
      return '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
        'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:110px;vertical-align:top">' +
        '<div style="font-size:14px;font-weight:800;color:#333;margin-bottom:3px">' + letters[i] + '</div>' +
        _u8WorkerCard(it.emoji, it.label) +
      '</div>';
    }).join('') +
  '</div>';
}

// _u8IncomeChainCard — visualizes "income → result" for C5/C6/C7/C8 scenarios.
// resultHtml is typically a _u8WorkerCard showing the good or service obtained.
function _u8IncomeChainCard(incomeHtml, resultHtml) {
  return '<div style="display:flex;justify-content:center;align-items:center;' +
    'gap:10px;margin:8px 0;flex-wrap:wrap">' +
    incomeHtml +
    '<span style="font-size:24px;color:#5a7080;font-weight:bold">→</span>' +
    resultHtml +
    '</div>';
}

// ── L8.2 teaching visuals (intervention overlays) ────────────────────────────
function _u82TvGoodVsService() {
  return _u8TvWrap(_u8GoodServicePair('📕', 'book', '💇', 'haircut'),
    'A book is a thing — that is a good. A haircut is work someone does — that is a service.');
}
function _u82TvGoodDefinition() {
  return _u8TvWrap(_u8WorkerCard('📕', 'book'),
    'A good is a thing people can have or use. Books, apples, shirts, and shoes are goods.');
}
function _u82TvServiceDefinition() {
  return _u8TvWrap(_u8WorkerCard('💇', 'haircut'),
    'A service is work people do to help others. Haircuts, bus rides, and doctor visits are services.');
}
function _u82TvIncomePurchase() {
  return _u8TvWrap(_u8IncomeChainCard(_u8MoneyBag(), _u8WorkerCard('📕', 'book')),
    'Income obtains goods and services. The thing or work that the income paid for is what was obtained.');
}
function _u82TvPurchaseChoice() {
  return _u8TvWrap(_u8WorkerCard('🔧', 'mechanic fixing a bike'),
    'Match the choice to the scenario. Pick the good or service that fits the situation.');
}
function _u82TvWantsNeedsContext() {
  return _u8TvWrap(_u8WorkerCard('🍎', 'apple'),
    'The question is still which good or service fits. The scenario tells you what is needed.');
}
function _u82TvWorkerService() {
  return _u8TvWrap(_u8WorkerCard('💇', 'haircut'),
    'The barber is a person. The haircut is the work the barber does — that work is the service.');
}
function _u82TvItemService() {
  return _u8TvWrap(_u8WorkerCard('📕', 'book'),
    'Paying for something does not make it a service. A thing is still a good — like a book.');
}
function _u82TvUnsupported() {
  return _u8TvWrap(_u8WorkerCard('🍎', 'apple'),
    'Pick the option that fits the scenario. Stick to the choices given.');
}

// ── L8.2 intervention factories ──────────────────────────────────────────────
function _i82GoodVsService() { return {
  errorTag: _82GS, title: 'A thing is a good. Work is a service.',
  teachingSteps: [
    'A good is a thing — something you can hold, use, eat, wear, or own.',
    'A service is work — something someone does to help others.',
    'Ask yourself: is this a thing, or is this work?',
    'If it is a thing, it is a good. If it is work, it is a service.'
  ],
  teachingVisualRaw: _u82TvGoodVsService(),
  correctAnswerExplanation: 'Goods are things. Services are work.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i82GoodDefinition() { return {
  errorTag: _82GD, title: 'Goods are things',
  teachingSteps: [
    'A good is a thing people can have or use.',
    'Books, apples, shirts, toys, backpacks, and shoes are goods.',
    'You can hold a good. You can use a good. You can eat or wear a good.',
    'If the answer is a thing, it is a good.'
  ],
  teachingVisualRaw: _u82TvGoodDefinition(),
  correctAnswerExplanation: 'A good is a thing you can have or use.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i82ServiceDefinition() { return {
  errorTag: _82SD, title: 'Services are work people do',
  teachingSteps: [
    'A service is work someone does to help others.',
    'A haircut, a bus ride, a doctor visit, and a teacher teaching are services.',
    'When someone works to help another person, that work is a service.',
    'If the answer is work that helps someone, it is a service.'
  ],
  teachingVisualRaw: _u82TvServiceDefinition(),
  correctAnswerExplanation: 'A service is work people do to help others.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i82IncomePurchase() { return {
  errorTag: _82IP, title: 'Income obtains goods and services',
  teachingSteps: [
    'Income is money people earn by working.',
    'People can use income to obtain goods — like a book or a backpack.',
    'People can use income to obtain services — like a haircut or a bus ride.',
    'The thing or work that the income paid for is what was obtained.'
  ],
  teachingVisualRaw: _u82TvIncomePurchase(),
  correctAnswerExplanation: 'Income obtains goods (things) and services (work).',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i82PurchaseChoice() { return {
  errorTag: _82PC, title: 'Match the choice to the situation',
  teachingSteps: [
    'Read the scenario carefully.',
    'Find the choice that fits what the situation is asking for.',
    'A broken bike calls for a mechanic. Hunger calls for food.',
    'Pick the good or service that helps with the situation.'
  ],
  teachingVisualRaw: _u82TvPurchaseChoice(),
  correctAnswerExplanation: 'The right purchase choice fits the situation in the scenario.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i82WantsNeedsContext() { return {
  errorTag: _82WN, title: 'The question is still which fits',
  teachingSteps: [
    'The scenario tells you what is needed.',
    'You are still picking which good or service fits the situation.',
    'A scenario about food needs a food good. A scenario about a ride needs a ride service.',
    'Pick the option that solves what the scenario asks for.'
  ],
  teachingVisualRaw: _u82TvWantsNeedsContext(),
  correctAnswerExplanation: 'Pick the good or service that solves the situation.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i82WorkerService() { return {
  errorTag: _82WS, title: 'The work is the service',
  teachingSteps: [
    'A barber is a person who cuts hair.',
    'The haircut is the work the barber does.',
    'When income pays for the haircut, it pays for the work — the service.',
    'The worker is a person; the service is the work the worker does.'
  ],
  teachingVisualRaw: _u82TvWorkerService(),
  correctAnswerExplanation: 'The service is the work the worker does — not the worker themselves.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i82ItemService() { return {
  errorTag: _82IS, title: 'A thing is still a good',
  teachingSteps: [
    'Paying for something does not make it a service.',
    'A book costs money, but a book is still a thing — a good.',
    'An apple costs money, but an apple is still a thing — a good.',
    'A thing is a good, no matter how it was obtained.'
  ],
  teachingVisualRaw: _u82TvItemService(),
  correctAnswerExplanation: 'A thing is a good. Paying for it does not turn it into a service.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i82Unsupported() { return {
  errorTag: _82NS, title: 'Stick to the choices given',
  teachingSteps: [
    'Read the scenario and the choices carefully.',
    'Pick the option that fits the scenario.',
    'Do not invent a choice that is not listed.',
    'Only the good or service that matches the situation is correct.'
  ],
  teachingVisualRaw: _u82TvUnsupported(),
  correctAnswerExplanation: 'Pick the option that fits the scenario from the choices given.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// ── L8.2 question factory functions ──────────────────────────────────────────

// _q82IdentifyGood — C1: imgChoice 4-card. 1 good + 3 services. Tap the good.
// goodItem: {emoji, label}  serviceItems: [{emoji, label}] length 3.
function _q82IdentifyGood(goodItem, serviceItems, diff, aIdx) {
  var letters = ['A','B','C','D'];
  var gridItems = serviceItems.slice();
  gridItems.splice(aIdx, 0, goodItem);
  var svgs = gridItems.map(function(it){ return _u8WorkerCard(it.emoji, it.label); });
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var fallback = _u8ItemGridFallback(gridItems, letters);
  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _82GD};
  });
  return {
    t: 'Tap the picture that shows a good.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows ' + goodItem.label + '. A good is a thing you can have or use.',
    d: diff,
    h: 'A good is a thing. A service is work someone does.',
    sk: 'goods_and_services',
    i: _i82GoodDefinition()
  };
}

// _q82IdentifyService — C2: imgChoice 4-card. 1 service + 3 goods. Tap the service.
function _q82IdentifyService(serviceItem, goodItems, diff, aIdx) {
  var letters = ['A','B','C','D'];
  var gridItems = goodItems.slice();
  gridItems.splice(aIdx, 0, serviceItem);
  var svgs = gridItems.map(function(it){ return _u8WorkerCard(it.emoji, it.label); });
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var fallback = _u8ItemGridFallback(gridItems, letters);
  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _82SD};
  });
  return {
    t: 'Tap the picture that shows a service.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows ' + serviceItem.label + '. A service is work someone does to help others.',
    d: diff,
    h: 'A service is work people do. A good is a thing.',
    sk: 'goods_and_services',
    i: _i82ServiceDefinition()
  };
}

// _q82GoodVsService — C3: item card + "Is this a good or a service?" text MC.
// item: {emoji, label}  isGood: boolean
function _q82GoodVsService(item, isGood, diff, aIdx) {
  var sceneHtml = _u8ScenarioCard(item.emoji, item.label);
  var correctText = isGood ? 'a good' : 'a service';
  var oppositeText = isGood ? 'a service' : 'a good';
  var opts = [
    {val: correctText},
    {val: oppositeText, tag: _82GS},
    {val: 'income', tag: _82IP},
    {val: 'a worker', tag: _82WS}
  ];
  opts = _u8Place(opts, aIdx);
  return {
    t: 'Look at the picture. Is this a good or a service?',
    s: sceneHtml,
    o: opts, a: aIdx,
    e: isGood ? ('A ' + item.label + ' is a thing you can have or use. That is a good.')
              : ('A ' + item.label + ' is work that someone does to help others. That is a service.'),
    d: diff,
    h: 'Ask: is this a thing, or is this work someone does?',
    sk: 'goods_and_services',
    i: isGood ? _i82GoodDefinition() : _i82ServiceDefinition()
  };
}

// _q82MatchScenario — C4: scenario sentence + binary classification text MC.
// scenarioText: e.g., "A family pays someone to fix a sink."  isService: boolean
function _q82MatchScenario(scenarioText, isService, diff, aIdx) {
  var correctText = isService ? 'a service' : 'a good';
  var oppositeText = isService ? 'a good' : 'a service';
  var opts = [
    {val: correctText},
    {val: oppositeText, tag: _82GS},
    {val: 'income', tag: _82IP},
    {val: isService ? 'a worker' : 'a thing for sale'},
  ];
  // Add tag to the 4th option
  opts[3].tag = isService ? _82WS : _82IS;
  opts = _u8Place(opts, aIdx);
  return {
    t: scenarioText + ' Is that a good or a service?',
    o: opts, a: aIdx,
    e: isService ? 'Work that someone does to help others is a service.'
                 : 'A thing someone obtains is a good.',
    d: diff,
    h: 'Ask: is it a thing, or is it work someone does?',
    sk: 'goods_and_services',
    i: _i82GoodVsService()
  };
}

// _q82IncomeGood — C5: "Maya earned income. She uses it to get a [good].
// What kind of thing did she get?" Income → good text MC + chain visual.
function _q82IncomeGood(name, goodEmoji, goodLabel, diff, aIdx) {
  var visual = _u8IncomeChainCard(_u8MoneyBag(), _u8WorkerCard(goodEmoji, goodLabel));
  var opts = [
    {val: 'a good'},
    {val: 'a service', tag: _82GS},
    {val: 'income', tag: _82IP},
    {val: 'a worker', tag: _82WS}
  ];
  opts = _u8Place(opts, aIdx);
  return {
    t: name + ' earned income. ' + name + ' uses it to get a ' + goodLabel + '. What did ' + name + ' get?',
    s: visual,
    o: opts, a: aIdx,
    e: 'A ' + goodLabel + ' is a thing — that is a good. Income obtained a good.',
    d: diff,
    h: 'Ask: is the thing in the picture a thing, or is it work?',
    sk: 'goods_and_services',
    i: _i82IncomePurchase()
  };
}

// _q82IncomeService — C6: "[Name] uses income to pay for [service].
// What did [name] get?" Income → service text MC + chain visual.
function _q82IncomeService(name, serviceEmoji, serviceLabel, diff, aIdx) {
  var visual = _u8IncomeChainCard(_u8MoneyBag(), _u8WorkerCard(serviceEmoji, serviceLabel));
  var opts = [
    {val: 'a service'},
    {val: 'a good', tag: _82GS},
    {val: 'income', tag: _82IP},
    {val: 'a thing for sale', tag: _82IS}
  ];
  opts = _u8Place(opts, aIdx);
  return {
    t: name + ' earned income. ' + name + ' uses it to pay for ' + serviceLabel + '. What did ' + name + ' get?',
    s: visual,
    o: opts, a: aIdx,
    e: serviceLabel + ' is work someone does — that is a service. Income obtained a service.',
    d: diff,
    h: 'Ask: is the thing in the picture a thing, or is it work?',
    sk: 'goods_and_services',
    i: _i82IncomePurchase()
  };
}

// _q82PurchaseChoice — C7: imgChoice 4-card. Scenario + 4 cards (mix of goods
// and services), tap the one that fits the scenario.
// correctItem: {emoji, label}  distractors: [{emoji, label}] length 3 (mixed goods/services).
function _q82PurchaseChoice(scenarioText, correctItem, distractors, diff, aIdx) {
  var letters = ['A','B','C','D'];
  var gridItems = distractors.slice();
  gridItems.splice(aIdx, 0, correctItem);
  var svgs = gridItems.map(function(it){ return _u8WorkerCard(it.emoji, it.label); });
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var fallback = _u8ItemGridFallback(gridItems, letters);
  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _82PC};
  });
  return {
    t: scenarioText + ' Tap the picture that fits.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows ' + correctItem.label + ' — that fits the scenario.',
    d: diff,
    h: 'Match the choice to the scenario. Pick the good or service that helps with the situation.',
    sk: 'goods_and_services',
    i: _i82PurchaseChoice()
  };
}

// _q82WantsNeedsContext — C8: scenario explicitly invokes a need + 4 text options
// listing item names. Assessed skill is still picking the matching purchase.
// scenarioText already contains the need ("A family needs food. ...").
// correctOption: text label for the correct item  wrongs: [{val, tag}] length 3.
function _q82WantsNeedsContext(scenarioText, correctOption, wrongs, diff, aIdx) {
  var opts = [{val: correctOption}].concat(wrongs);
  opts = _u8Place(opts, aIdx);
  return {
    t: scenarioText + ' Which is a good choice?',
    o: opts, a: aIdx,
    e: '"' + correctOption + '" fits the situation in the scenario.',
    d: diff,
    h: 'Read the scenario. Pick the choice that solves what is needed.',
    sk: 'goods_and_services',
    i: _i82WantsNeedsContext()
  };
}

// _q82ErrorRepair — C9: student's wrong claim + correct fix text MC.
function _q82ErrorRepair(claim, correctFix, wrongs, diff, aIdx) {
  var opts = [{val: correctFix}].concat(wrongs);
  opts = _u8Place(opts, aIdx);
  return {
    t: 'A student says: "' + claim + '" What is the correct fix?',
    o: opts, a: aIdx,
    e: 'The correct fix is: "' + correctFix + '"',
    d: diff,
    h: 'Think about whether the answer is a thing or work someone does.',
    sk: 'goods_and_services',
    i: _i82GoodVsService()
  };
}

// _q82TrueSentence — C10: 4 candidate sentences about goods and services, one true.
function _q82TrueSentence(correctText, wrongs, diff, aIdx) {
  var opts = [{val: correctText}].concat(wrongs);
  opts = _u8Place(opts, aIdx);
  return {
    t: 'Which sentence is true about goods and services?',
    o: opts, a: aIdx,
    e: 'True: "' + correctText + '"',
    d: diff,
    h: 'A good is a thing. A service is work. Income can obtain either one.',
    sk: 'goods_and_services',
    i: _i82GoodVsService()
  };
}

// ── L8.2 key ideas (6) ───────────────────────────────────────────────────────
var _l82KeyIdeas = [
  'Goods are things people can have or use — like a book, an apple, a shirt, a toy, a backpack, or a pair of shoes.',
  'Services are work that people do to help others — like a haircut, a doctor visit, a bus ride, or a teacher teaching.',
  'People can use income to obtain goods.',
  'People can use income to obtain services.',
  'People make choices about what to obtain with their income — they pick the good or service that fits their situation.',
  'To tell goods from services, ask: "Is it a thing, or is it work someone does?" A thing is a good. Work that helps others is a service.'
];

// ── L8.2 worked examples (5) ─────────────────────────────────────────────────
var _l82Examples = [
  {
    id: 'g1-u8-l2-ex-1',
    title: 'Example 1: What is a good?',
    prompt: 'What is a good?',
    visual: {type: 'rawHtml', html: _u8WorkerCard('📕', 'book')},
    steps: [
      'A good is a thing people can have or use.',
      'A book is a thing — you can hold it, open it, and read it.',
      'A book is a good.',
      'Apples, shirts, toys, and shoes are also goods.'
    ],
    finalAnswer: 'A book is a good. Goods are things people have or use.'
  },
  {
    id: 'g1-u8-l2-ex-2',
    title: 'Example 2: What is a service?',
    prompt: 'What is a service?',
    visual: {type: 'rawHtml', html: _u8WorkerCard('💇', 'haircut')},
    steps: [
      'A service is work that someone does to help others.',
      'A haircut is work — someone uses scissors to cut hair.',
      'A haircut is a service.',
      'Bus rides, doctor visits, and teacher teaching are also services.'
    ],
    finalAnswer: 'A haircut is a service. Services are work people do to help others.'
  },
  {
    id: 'g1-u8-l2-ex-3',
    title: 'Example 3: Goods vs services',
    prompt: 'Is a hat a good or a service? What about a dentist cleaning teeth?',
    visual: {type: 'rawHtml', html: _u8GoodServicePair('🧢', 'hat', '🦷', 'dentist cleaning teeth')},
    steps: [
      'A hat is a thing you wear — that is a good.',
      'A dentist cleaning teeth is work someone does — that is a service.',
      'Goods are things. Services are work.',
      'Ask: is it a thing, or is it work?'
    ],
    finalAnswer: 'A hat is a good. A dentist cleaning teeth is a service.'
  },
  {
    id: 'g1-u8-l2-ex-4',
    title: 'Example 4: Income obtains a good',
    prompt: 'Maya earned income. She uses it to get a backpack for school. What did she get?',
    visual: {type: 'rawHtml', html: _u8IncomeChainCard(_u8MoneyBag(), _u8WorkerCard('🎒', 'backpack'))},
    steps: [
      'Maya earned income by working.',
      'She uses her income to get a backpack.',
      'A backpack is a thing she can hold and use.',
      'Income obtained a good.'
    ],
    finalAnswer: 'Maya got a good (a backpack).'
  },
  {
    id: 'g1-u8-l2-ex-5',
    title: 'Example 5: Income obtains a service',
    prompt: 'Dad earned income. He uses it to pay a mechanic to fix his car. What did he get?',
    visual: {type: 'rawHtml', html: _u8IncomeChainCard(_u8MoneyBag(), _u8WorkerCard('🔧', 'mechanic fixing a car'))},
    steps: [
      'Dad earned income by working.',
      'He uses his income to pay a mechanic.',
      'The mechanic does work — fixing the car.',
      'Income obtained a service.'
    ],
    finalAnswer: 'Dad got a service (the mechanic fixing the car).'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L8.2 question banks (10 categories, 140 total)
//  Target: 45E / 55M / 40H · imgChoice count: 46 (C1=16, C2=16, C7=14)
//  C1 identify-goods + C2 identify-services + C3 good-vs-service +
//  C4 match-scenario + C5 income→good + C6 income→service +
//  C7 purchase-choice + C8 wants-needs-supporting-context +
//  C9 error-repair + C10 true-sentence/mixed-review
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Identify Goods (16 = 5E / 6M / 5H) ───────────────────────────────────
// 1 good + 3 services. Tap the good.
var _l82C1 = [
  // Easy (5)
  _q82IdentifyGood({emoji:'📕', label:'book'},
    [{emoji:'💇', label:'haircut'},
     {emoji:'👨‍⚕️', label:'doctor visit'},
     {emoji:'🚌', label:'bus ride'}], 'e', 0),
  _q82IdentifyGood({emoji:'🍎', label:'apple'},
    [{emoji:'🔧', label:'mechanic fixing a car'},
     {emoji:'👩‍🏫', label:'teacher teaching'},
     {emoji:'🦷', label:'dentist cleaning teeth'}], 'e', 1),
  _q82IdentifyGood({emoji:'👕', label:'shirt'},
    [{emoji:'🚿', label:'plumber fixing a sink'},
     {emoji:'💇', label:'haircut'},
     {emoji:'🚌', label:'bus ride'}], 'e', 2),
  _q82IdentifyGood({emoji:'🎒', label:'backpack'},
    [{emoji:'📚', label:'librarian helping kids find books'},
     {emoji:'👨‍⚕️', label:'doctor visit'},
     {emoji:'📫', label:'mail carrier delivering'}], 'e', 3),
  _q82IdentifyGood({emoji:'✏️', label:'pencil'},
    [{emoji:'🐾', label:'vet caring for animals'},
     {emoji:'💇', label:'haircut'},
     {emoji:'🚌', label:'bus ride'}], 'e', 0),
  // Medium (6)
  _q82IdentifyGood({emoji:'👟', label:'shoes'},
    [{emoji:'👩‍🏫', label:'teacher teaching'},
     {emoji:'🦷', label:'dentist cleaning teeth'},
     {emoji:'🔧', label:'mechanic fixing a car'}], 'm', 1),
  _q82IdentifyGood({emoji:'🥪', label:'sandwich'},
    [{emoji:'🚿', label:'plumber fixing a sink'},
     {emoji:'📫', label:'mail carrier delivering'},
     {emoji:'📚', label:'librarian helping kids find books'}], 'm', 2),
  _q82IdentifyGood({emoji:'🥛', label:'milk'},
    [{emoji:'🐾', label:'vet caring for animals'},
     {emoji:'💇', label:'haircut'},
     {emoji:'👨‍⚕️', label:'doctor visit'}], 'm', 3),
  _q82IdentifyGood({emoji:'🧢', label:'hat'},
    [{emoji:'🚌', label:'bus ride'},
     {emoji:'👩‍🏫', label:'teacher teaching'},
     {emoji:'🔧', label:'mechanic fixing a car'}], 'm', 0),
  _q82IdentifyGood({emoji:'🍞', label:'bread'},
    [{emoji:'🦷', label:'dentist cleaning teeth'},
     {emoji:'📚', label:'librarian helping kids find books'},
     {emoji:'🚿', label:'plumber fixing a sink'}], 'm', 1),
  _q82IdentifyGood({emoji:'🚲', label:'bike'},
    [{emoji:'👨‍⚕️', label:'doctor visit'},
     {emoji:'🐾', label:'vet caring for animals'},
     {emoji:'📫', label:'mail carrier delivering'}], 'm', 2),
  // Hard (5)
  _q82IdentifyGood({emoji:'🪥', label:'toothbrush'},
    [{emoji:'🦷', label:'dentist cleaning teeth'},
     {emoji:'🔧', label:'mechanic fixing a car'},
     {emoji:'💇', label:'haircut'}], 'h', 3),
  _q82IdentifyGood({emoji:'🍌', label:'banana'},
    [{emoji:'👩‍🏫', label:'teacher teaching'},
     {emoji:'🚿', label:'plumber fixing a sink'},
     {emoji:'🐾', label:'vet caring for animals'}], 'h', 0),
  _q82IdentifyGood({emoji:'📕', label:'book'},
    [{emoji:'📚', label:'librarian helping kids find books'},
     {emoji:'👩‍🏫', label:'teacher teaching'},
     {emoji:'🚌', label:'bus ride'}], 'h', 1),
  _q82IdentifyGood({emoji:'👕', label:'shirt'},
    [{emoji:'📫', label:'mail carrier delivering'},
     {emoji:'💇', label:'haircut'},
     {emoji:'👨‍⚕️', label:'doctor visit'}], 'h', 2),
  _q82IdentifyGood({emoji:'🍎', label:'apple'},
    [{emoji:'🐾', label:'vet caring for animals'},
     {emoji:'🦷', label:'dentist cleaning teeth'},
     {emoji:'🔧', label:'mechanic fixing a car'}], 'h', 3)
];

// ── C2: Identify Services (16 = 5E / 6M / 5H) ────────────────────────────────
// 1 service + 3 goods. Tap the service.
var _l82C2 = [
  // Easy (5)
  _q82IdentifyService({emoji:'💇', label:'haircut'},
    [{emoji:'📕', label:'book'}, {emoji:'🍎', label:'apple'}, {emoji:'👕', label:'shirt'}], 'e', 0),
  _q82IdentifyService({emoji:'👨‍⚕️', label:'doctor visit'},
    [{emoji:'👟', label:'shoes'}, {emoji:'🧢', label:'hat'}, {emoji:'🥛', label:'milk'}], 'e', 1),
  _q82IdentifyService({emoji:'🚌', label:'bus ride'},
    [{emoji:'🎒', label:'backpack'}, {emoji:'✏️', label:'pencil'}, {emoji:'🥪', label:'sandwich'}], 'e', 2),
  _q82IdentifyService({emoji:'👩‍🏫', label:'teacher teaching'},
    [{emoji:'🍞', label:'bread'}, {emoji:'🚲', label:'bike'}, {emoji:'🍌', label:'banana'}], 'e', 3),
  _q82IdentifyService({emoji:'🔧', label:'mechanic fixing a car'},
    [{emoji:'📕', label:'book'}, {emoji:'🍎', label:'apple'}, {emoji:'🪥', label:'toothbrush'}], 'e', 0),
  // Medium (6)
  _q82IdentifyService({emoji:'🚿', label:'plumber fixing a sink'},
    [{emoji:'👕', label:'shirt'}, {emoji:'🧢', label:'hat'}, {emoji:'👟', label:'shoes'}], 'm', 1),
  _q82IdentifyService({emoji:'📚', label:'librarian helping kids find books'},
    [{emoji:'✏️', label:'pencil'}, {emoji:'🥪', label:'sandwich'}, {emoji:'🥛', label:'milk'}], 'm', 2),
  _q82IdentifyService({emoji:'🐾', label:'vet caring for animals'},
    [{emoji:'🍞', label:'bread'}, {emoji:'🚲', label:'bike'}, {emoji:'🍌', label:'banana'}], 'm', 3),
  _q82IdentifyService({emoji:'🦷', label:'dentist cleaning teeth'},
    [{emoji:'📕', label:'book'}, {emoji:'👕', label:'shirt'}, {emoji:'🧢', label:'hat'}], 'm', 0),
  _q82IdentifyService({emoji:'📫', label:'mail carrier delivering'},
    [{emoji:'🍎', label:'apple'}, {emoji:'👟', label:'shoes'}, {emoji:'🎒', label:'backpack'}], 'm', 1),
  _q82IdentifyService({emoji:'💇', label:'haircut'},
    [{emoji:'🥛', label:'milk'}, {emoji:'🥪', label:'sandwich'}, {emoji:'🍞', label:'bread'}], 'm', 2),
  // Hard (5)
  _q82IdentifyService({emoji:'🦷', label:'dentist cleaning teeth'},
    [{emoji:'🪥', label:'toothbrush'}, {emoji:'🍎', label:'apple'}, {emoji:'🥛', label:'milk'}], 'h', 3),
  _q82IdentifyService({emoji:'👨‍⚕️', label:'doctor visit'},
    [{emoji:'🎒', label:'backpack'}, {emoji:'🚲', label:'bike'}, {emoji:'🍌', label:'banana'}], 'h', 0),
  _q82IdentifyService({emoji:'👩‍🏫', label:'teacher teaching'},
    [{emoji:'📕', label:'book'}, {emoji:'✏️', label:'pencil'}, {emoji:'🎒', label:'backpack'}], 'h', 1),
  _q82IdentifyService({emoji:'🔧', label:'mechanic fixing a car'},
    [{emoji:'🚲', label:'bike'}, {emoji:'🧢', label:'hat'}, {emoji:'👟', label:'shoes'}], 'h', 2),
  _q82IdentifyService({emoji:'📚', label:'librarian helping kids find books'},
    [{emoji:'📕', label:'book'}, {emoji:'✏️', label:'pencil'}, {emoji:'🍌', label:'banana'}], 'h', 3)
];

// ── C3: Goods vs Services (18 = 6E / 7M / 5H) ────────────────────────────────
// Item card + binary classification.
var _l82C3 = [
  // Easy (6) — clear cases
  _q82GoodVsService({emoji:'📕', label:'book'},                     true,  'e', 0),
  _q82GoodVsService({emoji:'💇', label:'haircut'},                  false, 'e', 1),
  _q82GoodVsService({emoji:'🍎', label:'apple'},                    true,  'e', 2),
  _q82GoodVsService({emoji:'👨‍⚕️', label:'doctor visit'},            false, 'e', 3),
  _q82GoodVsService({emoji:'👕', label:'shirt'},                    true,  'e', 0),
  _q82GoodVsService({emoji:'🚌', label:'bus ride'},                 false, 'e', 1),
  // Medium (7)
  _q82GoodVsService({emoji:'🎒', label:'backpack'},                 true,  'm', 2),
  _q82GoodVsService({emoji:'👩‍🏫', label:'teacher teaching'},         false, 'm', 3),
  _q82GoodVsService({emoji:'✏️', label:'pencil'},                   true,  'm', 0),
  _q82GoodVsService({emoji:'🔧', label:'mechanic fixing a car'},    false, 'm', 1),
  _q82GoodVsService({emoji:'👟', label:'shoes'},                    true,  'm', 2),
  _q82GoodVsService({emoji:'🚿', label:'plumber fixing a sink'},    false, 'm', 3),
  _q82GoodVsService({emoji:'🥪', label:'sandwich'},                 true,  'm', 0),
  // Hard (5) — tricky pairings
  _q82GoodVsService({emoji:'📚', label:'librarian helping kids find books'}, false, 'h', 1),
  _q82GoodVsService({emoji:'🪥', label:'toothbrush'},               true,  'h', 2),
  _q82GoodVsService({emoji:'🦷', label:'dentist cleaning teeth'},   false, 'h', 3),
  _q82GoodVsService({emoji:'🚲', label:'bike'},                     true,  'h', 0),
  _q82GoodVsService({emoji:'🐾', label:'vet caring for animals'},   false, 'h', 1)
];

// ── C4: Match Scenario (14 = 5E / 5M / 4H) ───────────────────────────────────
var _l82C4 = [
  // Easy (5)
  _q82MatchScenario('A family pays someone to fix a sink.',         true,  'e', 0),
  _q82MatchScenario('Sam buys a backpack at the store.',            false, 'e', 1),
  _q82MatchScenario('Mei pays a barber to cut her hair.',           true,  'e', 2),
  _q82MatchScenario('Carlos buys an apple at the store.',           false, 'e', 3),
  _q82MatchScenario('Lin pays for a bus ride downtown.',            true,  'e', 0),
  // Medium (5)
  _q82MatchScenario('Pat buys a new pair of shoes.',                false, 'm', 1),
  _q82MatchScenario('A family pays a doctor for a visit.',          true,  'm', 2),
  _q82MatchScenario('Mei buys a hat at the store.',                 false, 'm', 3),
  _q82MatchScenario('Dad pays a mechanic to fix his car.',          true,  'm', 0),
  _q82MatchScenario('Sara buys a sandwich for lunch.',              false, 'm', 1),
  // Hard (4)
  _q82MatchScenario('Ben pays a dentist to clean his teeth.',       true,  'h', 2),
  _q82MatchScenario('Maya pays a plumber to fix a leaky pipe.',     true,  'h', 3),
  _q82MatchScenario('Jay buys a toothbrush at the store.',          false, 'h', 0),
  _q82MatchScenario('A family pays the vet to care for their dog.', true,  'h', 1)
];

// ── C5: Income → Goods (12 = 4E / 5M / 3H) ───────────────────────────────────
var _l82C5 = [
  // Easy (4)
  _q82IncomeGood('Maya',   '📕', 'book',      'e', 0),
  _q82IncomeGood('Carlos', '🍎', 'apple',     'e', 1),
  _q82IncomeGood('Sara',   '👕', 'shirt',     'e', 2),
  _q82IncomeGood('Lin',    '🎒', 'backpack',  'e', 3),
  // Medium (5)
  _q82IncomeGood('Pat',    '✏️', 'pencil',    'm', 0),
  _q82IncomeGood('Ben',    '👟', 'pair of shoes', 'm', 1),
  _q82IncomeGood('Mei',    '🥪', 'sandwich',  'm', 2),
  _q82IncomeGood('Dev',    '🥛', 'carton of milk', 'm', 3),
  _q82IncomeGood('Rina',   '🧢', 'hat',       'm', 0),
  // Hard (3)
  _q82IncomeGood('Sam',    '🍞', 'loaf of bread', 'h', 1),
  _q82IncomeGood('Mia',    '🚲', 'bike',      'h', 2),
  _q82IncomeGood('Lily',   '🪥', 'toothbrush','h', 3)
];

// ── C6: Income → Services (12 = 4E / 5M / 3H) ────────────────────────────────
var _l82C6 = [
  // Easy (4)
  _q82IncomeService('Maya',   '💇',  'a haircut',                        'e', 0),
  _q82IncomeService('Carlos', '👨‍⚕️', 'a doctor visit',                   'e', 1),
  _q82IncomeService('Sara',   '🚌',  'a bus ride',                       'e', 2),
  _q82IncomeService('Lin',    '🔧',  'a mechanic to fix the car',        'e', 3),
  // Medium (5)
  _q82IncomeService('Pat',    '🚿',  'a plumber to fix the sink',        'm', 0),
  _q82IncomeService('Ben',    '🦷',  'a dentist to clean teeth',         'm', 1),
  _q82IncomeService('Mei',    '🐾',  'a vet to care for her pet',        'm', 2),
  _q82IncomeService('Dev',    '💇',  'a haircut',                        'm', 3),
  _q82IncomeService('Rina',   '🔧',  'a mechanic to fix the car',        'm', 0),
  // Hard (3)
  _q82IncomeService('Sam',    '👨‍⚕️', 'a doctor visit',                   'h', 1),
  _q82IncomeService('Mia',    '🚌',  'a bus ride to school',             'h', 2),
  _q82IncomeService('Lily',   '🚿',  'a plumber to fix the sink',        'h', 3)
];

// ── C7: Purchase Choice (14 = 4E / 6M / 4H) ──────────────────────────────────
// Scenario + 4 tappable cards (mix of goods and services).
var _l82C7 = [
  // Easy (4)
  _q82PurchaseChoice("Mei's bike is broken.",
    {emoji:'🔧', label:'mechanic fixing a bike'},
    [{emoji:'📕', label:'book'},
     {emoji:'💇', label:'haircut'},
     {emoji:'👕', label:'shirt'}], 'e', 0),
  _q82PurchaseChoice('Pat is hungry.',
    {emoji:'🍎', label:'apple'},
    [{emoji:'🚌', label:'bus ride'},
     {emoji:'🔧', label:'mechanic fixing a car'},
     {emoji:'👕', label:'shirt'}], 'e', 1),
  _q82PurchaseChoice("Lin's hair is long.",
    {emoji:'💇', label:'haircut'},
    [{emoji:'📕', label:'book'},
     {emoji:'🍎', label:'apple'},
     {emoji:'🎒', label:'backpack'}], 'e', 2),
  _q82PurchaseChoice("Carlos's tooth hurts.",
    {emoji:'🦷', label:'dentist cleaning teeth'},
    [{emoji:'📕', label:'book'},
     {emoji:'👕', label:'shirt'},
     {emoji:'🚲', label:'bike'}], 'e', 3),
  // Medium (6)
  _q82PurchaseChoice('Sara is going to school across town.',
    {emoji:'🚌', label:'bus ride'},
    [{emoji:'📕', label:'book'},
     {emoji:'🍎', label:'apple'},
     {emoji:'👟', label:'shoes'}], 'm', 0),
  _q82PurchaseChoice("Mei's sink has a leak.",
    {emoji:'🚿', label:'plumber fixing a sink'},
    [{emoji:'📕', label:'book'},
     {emoji:'🍎', label:'apple'},
     {emoji:'💇', label:'haircut'}], 'm', 1),
  _q82PurchaseChoice('Ben is sick.',
    {emoji:'👨‍⚕️', label:'doctor visit'},
    [{emoji:'🚲', label:'bike'},
     {emoji:'🍎', label:'apple'},
     {emoji:'👕', label:'shirt'}], 'm', 2),
  _q82PurchaseChoice("Mia's puppy is sick.",
    {emoji:'🐾', label:'vet caring for animals'},
    [{emoji:'📕', label:'book'},
     {emoji:'👕', label:'shirt'},
     {emoji:'🚌', label:'bus ride'}], 'm', 3),
  _q82PurchaseChoice("Dev's hair is messy.",
    {emoji:'💇', label:'haircut'},
    [{emoji:'🚲', label:'bike'},
     {emoji:'🚿', label:'plumber fixing a sink'},
     {emoji:'📕', label:'book'}], 'm', 0),
  _q82PurchaseChoice('Rina is hungry for lunch.',
    {emoji:'🥪', label:'sandwich'},
    [{emoji:'💇', label:'haircut'},
     {emoji:'🔧', label:'mechanic fixing a car'},
     {emoji:'🦷', label:'dentist cleaning teeth'}], 'm', 1),
  // Hard (4)
  _q82PurchaseChoice("Sam's car will not start.",
    {emoji:'🔧', label:'mechanic fixing a car'},
    [{emoji:'🚌', label:'bus ride'},
     {emoji:'🚲', label:'bike'},
     {emoji:'👕', label:'shirt'}], 'h', 2),
  _q82PurchaseChoice('Mia is going to read a story.',
    {emoji:'📕', label:'book'},
    [{emoji:'💇', label:'haircut'},
     {emoji:'🍎', label:'apple'},
     {emoji:'👕', label:'shirt'}], 'h', 3),
  _q82PurchaseChoice('Lily has a toothache.',
    {emoji:'🦷', label:'dentist cleaning teeth'},
    [{emoji:'📕', label:'book'},
     {emoji:'👨‍⚕️', label:'doctor visit'},
     {emoji:'🚲', label:'bike'}], 'h', 0),
  _q82PurchaseChoice('Dev is making breakfast.',
    {emoji:'🍞', label:'loaf of bread'},
    [{emoji:'💇', label:'haircut'},
     {emoji:'🔧', label:'mechanic fixing a car'},
     {emoji:'🚌', label:'bus ride'}], 'h', 1)
];

// ── C8: Wants/Needs Supporting Context (12 = 3E / 5M / 4H) ───────────────────
// "Needs" appears in scenario; assessed skill is still picking the matching purchase.
var _l82C8 = [
  // Easy (3)
  _q82WantsNeedsContext('A family needs food.',
    'an apple',
    [{val:'a toy',     tag:_82WN},
     {val:'a haircut', tag:_82PC},
     {val:'a bike',    tag:_82WN}], 'e', 0),
  _q82WantsNeedsContext('Sam needs to get to school.',
    'a bus ride',
    [{val:'a book',    tag:_82PC},
     {val:'a hat',     tag:_82WN},
     {val:'a haircut', tag:_82PC}], 'e', 1),
  _q82WantsNeedsContext('Mei needs clothes to wear.',
    'a shirt',
    [{val:'a bus ride', tag:_82PC},
     {val:'a haircut',  tag:_82PC},
     {val:'a toy',      tag:_82WN}], 'e', 2),
  // Medium (5)
  _q82WantsNeedsContext("Pat needs to fix his bike.",
    'a mechanic',
    [{val:'a book',     tag:_82PC},
     {val:'an apple',   tag:_82WN},
     {val:'a sandwich', tag:_82WN}], 'm', 3),
  _q82WantsNeedsContext("A family needs help with a leaky sink.",
    'a plumber',
    [{val:'a hat',     tag:_82WN},
     {val:'a haircut', tag:_82PC},
     {val:'a book',    tag:_82PC}], 'm', 0),
  _q82WantsNeedsContext('Carlos needs to brush his teeth.',
    'a toothbrush',
    [{val:'a bus ride', tag:_82PC},
     {val:'a bike',     tag:_82WN},
     {val:'a sandwich', tag:_82WN}], 'm', 1),
  _q82WantsNeedsContext('Lin needs new shoes for school.',
    'a pair of shoes',
    [{val:'a haircut', tag:_82PC},
     {val:'an apple',  tag:_82WN},
     {val:'a book',    tag:_82WN}], 'm', 2),
  _q82WantsNeedsContext('Sara needs to get her hair cut.',
    'a haircut',
    [{val:'a hat',     tag:_82WN},
     {val:'a book',    tag:_82WN},
     {val:'a bus ride', tag:_82PC}], 'm', 3),
  // Hard (4)
  _q82WantsNeedsContext('Ben needs help because he is sick.',
    'a doctor visit',
    [{val:'a book',     tag:_82WN},
     {val:'a bike',     tag:_82WN},
     {val:'a sandwich', tag:_82WN}], 'h', 0),
  _q82WantsNeedsContext("Mia's puppy needs care.",
    'a vet',
    [{val:'a toy',     tag:_82WN},
     {val:'a haircut', tag:_82PC},
     {val:'a hat',     tag:_82WN}], 'h', 1),
  _q82WantsNeedsContext('Dev needs something to read.',
    'a book',
    [{val:'a bus ride', tag:_82PC},
     {val:'a haircut',  tag:_82PC},
     {val:'an apple',   tag:_82WN}], 'h', 2),
  _q82WantsNeedsContext('A family needs food for breakfast.',
    'a loaf of bread',
    [{val:'a toy',     tag:_82WN},
     {val:'a haircut', tag:_82PC},
     {val:'a bike',    tag:_82WN}], 'h', 3)
];

// ── C9: Error Repair (12 = 4E / 5M / 3H) ─────────────────────────────────────
var _l82C9 = [
  // Easy (4)
  _q82ErrorRepair('A haircut is a good because people pay for it.',
    'A haircut is a service because it is work someone does.',
    [{val:'A haircut is a worker.', tag:_82WS},
     {val:'A haircut is income.', tag:_82IP},
     {val:'A haircut is just a thing.', tag:_82IS}], 'e', 0),
  _q82ErrorRepair('A book is a service because reading takes work.',
    'A book is a good because it is a thing you can hold and use.',
    [{val:'A book is income.', tag:_82IP},
     {val:'A book is a worker.', tag:_82WS},
     {val:'A book is just an idea.', tag:_82NS}], 'e', 1),
  _q82ErrorRepair('An apple is a service because someone grew it.',
    'An apple is a good because it is a thing you can eat.',
    [{val:'An apple is the farmer.', tag:_82WS},
     {val:'An apple is income.', tag:_82IP},
     {val:'An apple is not a real choice.', tag:_82NS}], 'e', 2),
  _q82ErrorRepair('A doctor visit is a good because the doctor gives you a thing.',
    'A doctor visit is a service because the doctor does work to help you.',
    [{val:'A doctor visit is a worker.', tag:_82WS},
     {val:'A doctor visit is income.', tag:_82IP},
     {val:'A doctor visit is anything you pay for.', tag:_82IS}], 'e', 3),
  // Medium (5)
  _q82ErrorRepair('A bus ride is a good because the bus is a thing.',
    'A bus ride is a service because the driver does work to take you somewhere.',
    [{val:'A bus ride is a worker.', tag:_82WS},
     {val:'A bus ride is income.', tag:_82IP},
     {val:'A bus ride is a thing.', tag:_82IS}], 'm', 0),
  _q82ErrorRepair('A backpack is a service because you carry things with it.',
    'A backpack is a good because it is a thing you can have or use.',
    [{val:'A backpack is a worker.', tag:_82WS},
     {val:'A backpack is income.', tag:_82IP},
     {val:'A backpack is a kind of work.', tag:_82IS}], 'm', 1),
  _q82ErrorRepair('A teacher teaching is a good because students get knowledge.',
    'A teacher teaching is a service because the teacher does work to help students learn.',
    [{val:'A teacher is just a worker, not a service.', tag:_82WS},
     {val:'A teacher is income.', tag:_82IP},
     {val:'A teacher teaching is anything paid for.', tag:_82IS}], 'm', 2),
  _q82ErrorRepair('A pencil is a service because writing is work.',
    'A pencil is a good because it is a thing you can use.',
    [{val:'A pencil is a worker.', tag:_82WS},
     {val:'A pencil is income.', tag:_82IP},
     {val:'A pencil is whatever you pay for.', tag:_82IS}], 'm', 3),
  _q82ErrorRepair('A mechanic fixing a car is a good because the car is a thing.',
    'A mechanic fixing a car is a service because the mechanic does work.',
    [{val:'A mechanic is just a worker.', tag:_82WS},
     {val:'A mechanic is income.', tag:_82IP},
     {val:'The fixing is a thing.', tag:_82IS}], 'm', 0),
  // Hard (3)
  _q82ErrorRepair('Income is a good because it is something you can hold.',
    'Income is money earned by working. It is not a good or a service — it is what people use to obtain them.',
    [{val:'Income is a service because money is work.', tag:_82IP},
     {val:'Income is a worker.', tag:_82WS},
     {val:'Income is anything that is paid.', tag:_82IS}], 'h', 1),
  _q82ErrorRepair('A toothbrush is a service because brushing is work.',
    'A toothbrush is a good because it is a thing you can hold and use.',
    [{val:'A toothbrush is a worker.', tag:_82WS},
     {val:'A toothbrush is income.', tag:_82IP},
     {val:'A toothbrush is the dentist.', tag:_82WS}], 'h', 2),
  _q82ErrorRepair('A plumber fixing a sink is a good because the sink is a thing.',
    'A plumber fixing a sink is a service because the plumber does work to fix something.',
    [{val:'A plumber is just a worker.', tag:_82WS},
     {val:'A plumber is income.', tag:_82IP},
     {val:'The sink is the service.', tag:_82IS}], 'h', 3)
];

// ── C10: True Sentence / Mixed Review (14 = 5E / 5M / 4H) ────────────────────
var _l82C10 = [
  // Easy (5)
  _q82TrueSentence('Goods are things people can have or use.',
    [{val:'Goods are work someone does.', tag:_82GS},
     {val:'Goods are workers.', tag:_82WS},
     {val:'Goods are income.', tag:_82IP}], 'e', 0),
  _q82TrueSentence('Services are work people do to help others.',
    [{val:'Services are things.', tag:_82GS},
     {val:'Services are income.', tag:_82IP},
     {val:'Services are anything not free.', tag:_82IS}], 'e', 1),
  _q82TrueSentence('A book is a good.',
    [{val:'A book is a service.', tag:_82GS},
     {val:'A book is income.', tag:_82IP},
     {val:'A book is a worker.', tag:_82WS}], 'e', 2),
  _q82TrueSentence('A haircut is a service.',
    [{val:'A haircut is a good.', tag:_82GS},
     {val:'A haircut is a worker.', tag:_82WS},
     {val:'A haircut is anything paid for.', tag:_82IS}], 'e', 3),
  _q82TrueSentence('Income can be used to obtain goods.',
    [{val:'Income is a kind of good.', tag:_82IP},
     {val:'Income is the worker.', tag:_82WS},
     {val:'Income only buys services.', tag:_82GS}], 'e', 0),
  // Medium (5)
  _q82TrueSentence('Income can be used to obtain services.',
    [{val:'Income is a kind of service.', tag:_82IP},
     {val:'Income only buys goods.', tag:_82GS},
     {val:'Income is the work.', tag:_82WS}], 'm', 1),
  _q82TrueSentence('A thing is a good. Work is a service.',
    [{val:'Things and work are both goods.', tag:_82GS},
     {val:'Both are services.', tag:_82GS},
     {val:'Both are income.', tag:_82IP}], 'm', 2),
  _q82TrueSentence('People make choices about what to obtain with their income.',
    [{val:'People always obtain the same thing.', tag:_82NS},
     {val:'People only obtain goods.', tag:_82GS},
     {val:'People only obtain services.', tag:_82GS}], 'm', 3),
  _q82TrueSentence('Paying for something does not make it a service.',
    [{val:'Paying for something makes it a service.', tag:_82IS},
     {val:'Paying makes it a worker.', tag:_82WS},
     {val:'Paying makes it income.', tag:_82IP}], 'm', 0),
  _q82TrueSentence('A bus ride is a service because the driver does work.',
    [{val:'A bus ride is a good because the bus is a thing.', tag:_82IS},
     {val:'A bus ride is income.', tag:_82IP},
     {val:'A bus ride is a worker.', tag:_82WS}], 'm', 1),
  // Hard (4)
  _q82TrueSentence('A backpack is a good even though people pay for it.',
    [{val:'A backpack is a service because people pay for it.', tag:_82IS},
     {val:'A backpack is income.', tag:_82IP},
     {val:'A backpack is a worker.', tag:_82WS}], 'h', 2),
  _q82TrueSentence('A teacher teaching is a service. The teacher is a worker.',
    [{val:'A teacher teaching is a good.', tag:_82GS},
     {val:'A teacher teaching is income.', tag:_82IP},
     {val:'A teacher teaching is a thing.', tag:_82IS}], 'h', 3),
  _q82TrueSentence('Both adults and kids can use income to obtain goods or services.',
    [{val:'Only adults can use income.', tag:_82NS},
     {val:'Only kids can use income.', tag:_82NS},
     {val:'Income only obtains goods, never services.', tag:_82GS}], 'h', 0),
  _q82TrueSentence('Goods are things; services are work. Income obtains both.',
    [{val:'Goods and services are the same.', tag:_82GS},
     {val:'Income is the same as goods.', tag:_82IP},
     {val:'Services are only at restaurants.', tag:_82NS}], 'h', 1)
];

// ── L8.2 combined bank ───────────────────────────────────────────────────────
var _l82Bank = [].concat(_l82C1, _l82C2, _l82C3, _l82C4, _l82C5, _l82C6, _l82C7, _l82C8, _l82C9, _l82C10);


// ════════════════════════════════════════════════════════════════════════════
//  L8.3 — Spending and Saving
//  TEKS 1.9C | 150 questions (45E / 60M / 45H)
//
//  Distinguishes spending (using income now to obtain a good or service)
//  from saving (keeping income for later). Builds on L8.1 (income) and
//  L8.2 (goods/services). 10 categories. 68 imgChoice questions
//  (C3+C4 = 4-card 36, C6+C10 = 2-card 32).
//
//  Delayed-spending rule (locked): if income is kept for a future purchase,
//  it counts as saving — spending requires the income to be used NOW.
//
//  Hard guardrails (verified by scope scans before lock):
//    NO $ symbol, NO ¢ symbol, NO dollar/cents amounts.
//    NO coin names, NO price/cost vocabulary.
//    NO charitable giving (L8.4), NO donations, NO charity.
//    NO "give/giving/gave" in donation sense.
//    NO wants-vs-needs classification (K.9D territory).
//    NO Grade 2 financial-literacy content.
//    "Spend"/"save" ARE the lesson topic — allowed everywhere.
//    multipleChoice + imgChoice only.
// ════════════════════════════════════════════════════════════════════════════

// ── L8.3 error tags ──────────────────────────────────────────────────────────
var _83SS = 'err_spend_vs_save_confusion';
var _83SD = 'err_spending_definition_confusion';
var _83VD = 'err_saving_definition_confusion';
var _83NL = 'err_now_vs_later_confusion';
var _83GS = 'err_goal_saving_confusion';
var _83IU = 'err_income_use_confusion';
var _83GP = 'err_good_service_spending_confusion';
var _83SA = 'err_saving_as_spending_confusion';
var _83NS = 'err_category_not_supported';

// ── L8.3 teaching visuals (intervention overlays) ────────────────────────────
function _u83TvSpendVsSave() {
  return _u8TvWrap(_u8GoodServicePair('📕', 'gets a book today', '🐷', 'saves for later'),
    'Using income now is spending. Keeping income for later is saving.');
}
function _u83TvSpendingDefinition() {
  return _u8TvWrap(_u8WorkerCard('📕', 'gets a book today'),
    'Spending means using income now to get a good or service.');
}
function _u83TvSavingDefinition() {
  return _u8TvWrap(_u8WorkerCard('🐷', 'saves for later'),
    'Saving means keeping income for later — not using it right now.');
}
function _u83TvNowVsLater() {
  return _u8TvWrap(_u8GoodServicePair('📕', 'gets a book today', '🐷', 'saves for a book later'),
    '"Today" or "now" means spending. "Later" or "for a future thing" means saving.');
}
function _u83TvGoalSaving() {
  return _u8TvWrap(_u8WorkerCard('🐷', 'saves for a bike later'),
    'Saving for a goal means keeping income aside until later. The goal is in the future.');
}
function _u83TvIncomeUse() {
  return _u8TvWrap(_u8IncomeChainCard(_u8MoneyBag(), _u8WorkerCard('📕', 'book today')),
    'When income is used now, it obtains a good or service. When kept for later, it is saving.');
}
function _u83TvGoodServiceSpending() {
  return _u8TvWrap(_u8IncomeChainCard(_u8MoneyBag(), _u8WorkerCard('🚌', 'bus ride today')),
    'Spending uses income to get a good or a service. The good or service is what was obtained.');
}
function _u83TvSavingAsSpending() {
  return _u8TvWrap(_u8WorkerCard('🐷', 'keeps income for later'),
    'Keeping income in a jar is NOT spending. The money has not been used yet — that is saving.');
}
function _u83TvUnsupported() {
  return _u8TvWrap(_u8WorkerCard('🐷', 'saves for later'),
    'Pick the option that fits the scenario. Stick to the choices given.');
}

// ── L8.3 intervention factories ──────────────────────────────────────────────
function _i83SpendVsSave() { return {
  errorTag: _83SS, title: 'Now means spending. Later means saving.',
  teachingSteps: [
    'Ask: is the income being used NOW, or kept for LATER?',
    'If used now to get a good or service, that is spending.',
    'If kept for later, that is saving.',
    'Look for "today" / "now" (spending) or "later" / "for a future thing" (saving).'
  ],
  teachingVisualRaw: _u83TvSpendVsSave(),
  correctAnswerExplanation: 'Spending = used now. Saving = kept for later.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i83SpendingDefinition() { return {
  errorTag: _83SD, title: 'Spending means using income now',
  teachingSteps: [
    'Spending means using income right now.',
    'When someone spends, they get a good or a service today.',
    'A book bought today, a haircut today, a bus ride today — those are all spending.',
    'If the income is used right away, it is spending.'
  ],
  teachingVisualRaw: _u83TvSpendingDefinition(),
  correctAnswerExplanation: 'Spending means using income now to get a good or service.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i83SavingDefinition() { return {
  errorTag: _83VD, title: 'Saving means keeping income for later',
  teachingSteps: [
    'Saving means keeping income for later — not using it right now.',
    'Money in a piggy bank or a jar is being saved.',
    'Money kept for a future goal — like a bike later — is being saved.',
    'If the income is NOT used right now, it is saving.'
  ],
  teachingVisualRaw: _u83TvSavingDefinition(),
  correctAnswerExplanation: 'Saving means keeping income for later.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i83NowVsLater() { return {
  errorTag: _83NL, title: 'Look for now vs later',
  teachingSteps: [
    '"Today" and "now" mean spending — the income is used right away.',
    '"Later," "next month," and "for a future thing" mean saving.',
    'Even if the future goal is just tomorrow, money kept for later is saving.',
    'Read the scenario and look for the time words.'
  ],
  teachingVisualRaw: _u83TvNowVsLater(),
  correctAnswerExplanation: '"Now" = spending. "Later" = saving. Always.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i83GoalSaving() { return {
  errorTag: _83GS, title: 'Saving for a goal is still saving',
  teachingSteps: [
    'A goal is something a person wants for the future.',
    'Saving for a goal means keeping income until later, when the goal is reached.',
    'Even if the goal is to buy something later, the income is being saved right now.',
    'The decision is made now, but the using happens later — that is saving.'
  ],
  teachingVisualRaw: _u83TvGoalSaving(),
  correctAnswerExplanation: 'Saving for a future goal is saving, not spending.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i83IncomeUse() { return {
  errorTag: _83IU, title: 'Income use is the question',
  teachingSteps: [
    'Income is money earned by working.',
    'When income is used now, it obtains a good or a service — that is spending.',
    'When income is kept for later, that is saving.',
    'Earning is separate — the question is what happens to the income after it is earned.'
  ],
  teachingVisualRaw: _u83TvIncomeUse(),
  correctAnswerExplanation: 'Spending uses income now. Saving keeps income for later.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i83GoodServiceSpending() { return {
  errorTag: _83GP, title: 'Spending gets a good or a service',
  teachingSteps: [
    'When income is spent, it obtains a good or a service.',
    'A good is a thing — like a book or an apple.',
    'A service is work someone does — like a haircut or a bus ride.',
    'Either way, the money was used now — that is spending.'
  ],
  teachingVisualRaw: _u83TvGoodServiceSpending(),
  correctAnswerExplanation: 'Spending uses income to get a good or a service right now.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i83SavingAsSpending() { return {
  errorTag: _83SA, title: 'Keeping income is not spending',
  teachingSteps: [
    'When income is put in a jar or piggy bank, it is being kept — not used.',
    'Keeping money does not count as spending it.',
    'Spending requires the income to be used right now.',
    'If the money is still there, ready for later, that is saving.'
  ],
  teachingVisualRaw: _u83TvSavingAsSpending(),
  correctAnswerExplanation: 'Putting income aside is saving, not spending.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

function _i83Unsupported() { return {
  errorTag: _83NS, title: 'Stick to the choices',
  teachingSteps: [
    'Read the scenario and the choices carefully.',
    'Pick the option that fits the scenario.',
    'Do not invent a choice that is not listed.',
    'Only the answer that matches the spending or saving in the scenario is correct.'
  ],
  teachingVisualRaw: _u83TvUnsupported(),
  correctAnswerExplanation: 'Pick the option that fits the scenario from the choices given.',
  followUpRule: 'same_skill_new_numbers', doNotRepeatOriginalQuestion: true
};}

// ── L8.3 question factory functions ──────────────────────────────────────────

// _q83DefineSpending — C1: text MC, "What does spending mean?"
function _q83DefineSpending(promptText, correctText, distractors, diff, aIdx) {
  var opts = [{val: correctText}].concat(distractors);
  opts = _u8Place(opts, aIdx);
  return {
    t: promptText,
    o: opts, a: aIdx,
    e: 'Spending means using income now to get a good or service.',
    d: diff,
    h: 'Spending uses income today to get something right now.',
    sk: 'spending_and_saving',
    i: _i83SpendingDefinition()
  };
}

// _q83DefineSaving — C2: text MC, "What does saving mean?"
function _q83DefineSaving(promptText, correctText, distractors, diff, aIdx) {
  var opts = [{val: correctText}].concat(distractors);
  opts = _u8Place(opts, aIdx);
  return {
    t: promptText,
    o: opts, a: aIdx,
    e: 'Saving means keeping income for later.',
    d: diff,
    h: 'Saving keeps income for the future — does not use it today.',
    sk: 'spending_and_saving',
    i: _i83SavingDefinition()
  };
}

// _q83IdentifySpending — C3: imgChoice 4-card. 1 spending + 3 saving. Tap spending.
// spendItem: {emoji, label}  saveItems: [{emoji, label}] length 3.
function _q83IdentifySpending(spendItem, saveItems, diff, aIdx) {
  var letters = ['A','B','C','D'];
  var gridItems = saveItems.slice();
  gridItems.splice(aIdx, 0, spendItem);
  var svgs = gridItems.map(function(it){ return _u8WorkerCard(it.emoji, it.label); });
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var fallback = _u8ItemGridFallback(gridItems, letters);
  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _83SS};
  });
  return {
    t: 'Tap the picture that shows spending.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows "' + spendItem.label + '" — using income now. That is spending.',
    d: diff,
    h: 'Spending uses income today. Saving keeps it for later.',
    sk: 'spending_and_saving',
    i: _i83SpendingDefinition()
  };
}

// _q83IdentifySaving — C4: imgChoice 4-card. 1 saving + 3 spending. Tap saving.
function _q83IdentifySaving(saveItem, spendItems, diff, aIdx) {
  var letters = ['A','B','C','D'];
  var gridItems = spendItems.slice();
  gridItems.splice(aIdx, 0, saveItem);
  var svgs = gridItems.map(function(it){ return _u8WorkerCard(it.emoji, it.label); });
  var labels = letters.map(function(L){ return 'Picture ' + L; });
  var fallback = _u8ItemGridFallback(gridItems, letters);
  var opts = letters.map(function(L, i){
    if (i === aIdx) return {val: 'Picture ' + L};
    return {val: 'Picture ' + L, tag: _83SS};
  });
  return {
    t: 'Tap the picture that shows saving.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: aIdx,
    e: 'Picture ' + letters[aIdx] + ' shows "' + saveItem.label + '" — keeping income for later. That is saving.',
    d: diff,
    h: 'Saving keeps income for later. Spending uses it now.',
    sk: 'spending_and_saving',
    i: _i83SavingDefinition()
  };
}

// _q83SpendNowVsSaveLater — C5: scenario + 4 text decision options.
// scenarioText describes a situation; isSave true if the right answer is to save.
function _q83SpendNowVsSaveLater(scenarioText, isSave, diff, aIdx) {
  var correctText, wrong1, wrong2, wrong3;
  var t1, t2, t3;
  if (isSave) {
    correctText = 'save the income for the future goal';
    wrong1 = 'spend the income today on something else';
    wrong2 = 'spend the income now on a snack';
    wrong3 = 'not use the income at all';
    t1 = _83SS; t2 = _83NL; t3 = _83NS;
  } else {
    correctText = 'spend the income now to get what is needed today';
    wrong1 = 'save the income for later';
    wrong2 = 'keep the income in a jar';
    wrong3 = 'not use the income at all';
    t1 = _83SS; t2 = _83NL; t3 = _83NS;
  }
  var opts = [
    {val: correctText},
    {val: wrong1, tag: t1},
    {val: wrong2, tag: t2},
    {val: wrong3, tag: t3}
  ];
  opts = _u8Place(opts, aIdx);
  return {
    t: scenarioText + ' What should they do with the income?',
    o: opts, a: aIdx,
    e: isSave ? 'Saving for a future goal keeps the income until later — when the goal can be reached.'
              : 'Spending now uses the income to get what is needed today.',
    d: diff,
    h: 'Future goals call for saving. Today needs call for spending.',
    sk: 'spending_and_saving',
    i: isSave ? _i83GoalSaving() : _i83SpendingDefinition()
  };
}

// _q83MatchActionToJar — C6: 2-card imgChoice. 1 saving jar + 1 spending action.
// saveItem: {emoji, label}  spendItem: {emoji, label}  askForSave: true asks
// for the saving card; false asks for the spending card.
function _q83MatchActionToJar(saveItem, spendItem, askForSave, diff, aIdx) {
  var letters = ['A', 'B'];
  var localAIdx = aIdx % 2;
  var correctCard = askForSave ? saveItem : spendItem;
  var wrongCard = askForSave ? spendItem : saveItem;
  var slot0 = localAIdx === 0 ? correctCard : wrongCard;
  var slot1 = localAIdx === 1 ? correctCard : wrongCard;
  var svgs = [_u8WorkerCard(slot0.emoji, slot0.label), _u8WorkerCard(slot1.emoji, slot1.label)];
  var labels = ['Picture A', 'Picture B'];
  var fallback = '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:4px 0">' +
    [slot0, slot1].map(function(card, i){
      return '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
        'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:140px;vertical-align:top">' +
        '<div style="font-size:14px;font-weight:800;color:#333;margin-bottom:3px">' + letters[i] + '</div>' +
        _u8WorkerCard(card.emoji, card.label) +
      '</div>';
    }).join('') + '</div>';
  var opts = localAIdx === 0
    ? [{val: 'Picture A'}, {val: 'Picture B', tag: _83SS}]
    : [{val: 'Picture A', tag: _83SS}, {val: 'Picture B'}];
  return {
    t: askForSave ? 'Tap the card that shows saving.' : 'Tap the card that shows spending.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: localAIdx,
    e: 'Picture ' + letters[localAIdx] + ' shows "' + correctCard.label + '" — ' +
       (askForSave ? 'keeping income for later. That is saving.' : 'using income now. That is spending.'),
    d: diff,
    h: 'Saving keeps income for later. Spending uses it now.',
    sk: 'spending_and_saving',
    i: _i83SpendVsSave()
  };
}

// _q83SpendingObtains — C7: scenario shows income used today, asks what's happening.
// itemEmoji/itemLabel describe the good or service obtained. isService true if a service.
function _q83SpendingObtains(name, itemEmoji, itemLabel, isService, diff, aIdx) {
  var visual = _u8IncomeChainCard(_u8MoneyBag(), _u8WorkerCard(itemEmoji, itemLabel));
  var correctText = isService
    ? 'spending — they paid for a service today'
    : 'spending — they got a good today';
  var wrong1 = 'saving — they kept income for later';
  var wrong2 = 'earning — they made income';
  var wrong3 = isService
    ? 'spending — they got a good'
    : 'spending — they paid for a service';
  var opts = [
    {val: correctText},
    {val: wrong1, tag: _83SS},
    {val: wrong2, tag: _83IU},
    {val: wrong3, tag: _83GP}
  ];
  opts = _u8Place(opts, aIdx);
  return {
    t: name + ' uses income to get ' + itemLabel + ' today. What is ' + name + ' doing with the income?',
    s: visual,
    o: opts, a: aIdx,
    e: name + ' is spending — using income today to get ' + (isService ? 'a service' : 'a good') + '.',
    d: diff,
    h: 'Income used today = spending. The thing or work obtained tells you whether it was a good or a service.',
    sk: 'spending_and_saving',
    i: _i83GoodServiceSpending()
  };
}

// _q83ErrorRepair — C8: student's wrong claim + correct fix text MC.
function _q83ErrorRepair(claim, correctFix, wrongs, diff, aIdx) {
  var opts = [{val: correctFix}].concat(wrongs);
  opts = _u8Place(opts, aIdx);
  return {
    t: 'A student says: "' + claim + '" What is the correct fix?',
    o: opts, a: aIdx,
    e: 'The correct fix is: "' + correctFix + '"',
    d: diff,
    h: 'Spending uses income now. Saving keeps income for later.',
    sk: 'spending_and_saving',
    i: _i83SpendVsSave()
  };
}

// _q83TrueSentence — C9: 4 candidate sentences, one true.
function _q83TrueSentence(correctText, wrongs, diff, aIdx) {
  var opts = [{val: correctText}].concat(wrongs);
  opts = _u8Place(opts, aIdx);
  return {
    t: 'Which sentence is true about spending and saving?',
    o: opts, a: aIdx,
    e: 'True: "' + correctText + '"',
    d: diff,
    h: 'Spending is now. Saving is later. Both come from income.',
    sk: 'spending_and_saving',
    i: _i83SpendVsSave()
  };
}

// _q83VisualChoice — C10: 2-card imgChoice (1 spending + 1 saving), prompt
// varies between "Tap spending" and "Tap saving" per askForSpend.
function _q83VisualChoice(spendItem, saveItem, askForSpend, diff, aIdx) {
  var letters = ['A', 'B'];
  var localAIdx = aIdx % 2;
  var correctCard = askForSpend ? spendItem : saveItem;
  var wrongCard = askForSpend ? saveItem : spendItem;
  var slot0 = localAIdx === 0 ? correctCard : wrongCard;
  var slot1 = localAIdx === 1 ? correctCard : wrongCard;
  var svgs = [_u8WorkerCard(slot0.emoji, slot0.label), _u8WorkerCard(slot1.emoji, slot1.label)];
  var labels = ['Picture A', 'Picture B'];
  var fallback = '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:4px 0">' +
    [slot0, slot1].map(function(card, i){
      return '<div style="display:inline-block;text-align:center;border:1px solid #B0BEC5;' +
        'border-radius:6px;padding:4px;margin:3px;background:#fff;min-width:140px;vertical-align:top">' +
        '<div style="font-size:14px;font-weight:800;color:#333;margin-bottom:3px">' + letters[i] + '</div>' +
        _u8WorkerCard(card.emoji, card.label) +
      '</div>';
    }).join('') + '</div>';
  var opts = localAIdx === 0
    ? [{val: 'Picture A'}, {val: 'Picture B', tag: _83SS}]
    : [{val: 'Picture A', tag: _83SS}, {val: 'Picture B'}];
  return {
    t: askForSpend ? 'Tap the picture that shows spending.' : 'Tap the picture that shows saving.',
    v: {type: 'imgChoice', config: {items: labels, svgs: svgs}},
    s: fallback,
    o: opts, a: localAIdx,
    e: 'Picture ' + letters[localAIdx] + ' shows "' + correctCard.label + '" — ' +
       (askForSpend ? 'using income now. That is spending.' : 'keeping income for later. That is saving.'),
    d: diff,
    h: 'Spending uses income today. Saving keeps it for later.',
    sk: 'spending_and_saving',
    i: _i83SpendVsSave()
  };
}

// ── L8.3 key ideas (6) ───────────────────────────────────────────────────────
var _l83KeyIdeas = [
  'Spending means using income now to get a good or a service.',
  'Saving means keeping income for later.',
  'People can spend income today, or they can save income for a future goal.',
  'Saving for a future goal means setting income aside instead of using it now.',
  'Spending gets goods or services right away. Saving keeps the income for the future.',
  'To tell spending from saving, ask: "Is the income being used now, or kept for later?"'
];

// ── L8.3 worked examples (5) ─────────────────────────────────────────────────
var _l83Examples = [
  {
    id: 'g1-u8-l3-ex-1',
    title: 'Example 1: What is spending?',
    prompt: 'What does spending mean?',
    visual: {type: 'rawHtml', html: _u8WorkerCard('📕', 'gets a book today')},
    steps: [
      'Spending means using income right now.',
      'When someone spends, they get a good or a service today.',
      'A book bought today is a good — that is spending.',
      'A haircut paid for today is a service — that is also spending.'
    ],
    finalAnswer: 'Spending means using income now to get a good or a service.'
  },
  {
    id: 'g1-u8-l3-ex-2',
    title: 'Example 2: What is saving?',
    prompt: 'What does saving mean?',
    visual: {type: 'rawHtml', html: _u8WorkerCard('🐷', 'saves for later')},
    steps: [
      'Saving means keeping income for later.',
      'Money in a piggy bank or a jar is being saved.',
      'Money kept for a future goal — like a bike later — is being saved.',
      'When the income is NOT used right now, it is saving.'
    ],
    finalAnswer: 'Saving means keeping income for later.'
  },
  {
    id: 'g1-u8-l3-ex-3',
    title: 'Example 3: Identify spending',
    prompt: 'Maya gets a book today. Is Maya spending or saving?',
    visual: {type: 'rawHtml', html: _u8WorkerCard('📕', 'gets a book today')},
    steps: [
      'Maya is using her income right now.',
      'She is getting a book — a good — today.',
      'When income is used today to get a good, that is spending.',
      'Maya is spending.'
    ],
    finalAnswer: 'Maya is spending.'
  },
  {
    id: 'g1-u8-l3-ex-4',
    title: 'Example 4: Identify saving',
    prompt: 'Lin keeps income in a jar for a bike later. Is Lin spending or saving?',
    visual: {type: 'rawHtml', html: _u8WorkerCard('🐷', 'saves for a bike later')},
    steps: [
      'Lin is keeping her income — not using it now.',
      'The bike is a future goal — later, not today.',
      'When income is kept for later, that is saving.',
      'Lin is saving.'
    ],
    finalAnswer: 'Lin is saving.'
  },
  {
    id: 'g1-u8-l3-ex-5',
    title: 'Example 5: Spend now or save for later?',
    prompt: 'Nia has a future goal — she wants a bigger thing later. What should she do with her income?',
    visual: {type: 'rawHtml', html: _u8WorkerCard('🐷', 'saves for the future goal')},
    steps: [
      'Nia\'s goal is for later — not today.',
      'To reach a future goal, the income should be kept.',
      'Saving keeps income for later — when the goal can be reached.',
      'Nia should save her income for the future goal.'
    ],
    finalAnswer: 'Nia should save her income for the future goal.'
  }
];

// ════════════════════════════════════════════════════════════════════════════
//  L8.3 question banks (10 categories, 150 total)
//  Target: 45E / 60M / 45H · imgChoice count: 68 (4-card 36 + 2-card 32)
// ════════════════════════════════════════════════════════════════════════════

// ── C1: Define Spending (12 = 4E / 5M / 3H) ──────────────────────────────────
var _l83C1 = [
  // Easy (4)
  _q83DefineSpending('What does spending mean?',
    'Spending means using income now to get a good or service.',
    [{val:'Spending means keeping income for later.', tag:_83SS},
     {val:'Spending means earning money.', tag:_83IU},
     {val:'Spending means putting money in a jar.', tag:_83SA}], 'e', 0),
  _q83DefineSpending('Which sentence describes spending?',
    'When a person uses income today to get something, that is spending.',
    [{val:'When a person saves income for later, that is spending.', tag:_83SS},
     {val:'When a person finds money, that is spending.', tag:_83IU},
     {val:'When a person waits to use money, that is spending.', tag:_83NL}], 'e', 1),
  _q83DefineSpending('What does spending mean?',
    'Spending uses income right away.',
    [{val:'Spending puts income in a piggy bank.', tag:_83SA},
     {val:'Spending saves income for a future goal.', tag:_83GS},
     {val:'Spending earns income.', tag:_83IU}], 'e', 2),
  _q83DefineSpending('Which sentence is true about spending?',
    'Spending means using income now.',
    [{val:'Spending means using income later.', tag:_83NL},
     {val:'Spending means not using income at all.', tag:_83NS},
     {val:'Spending means earning income.', tag:_83IU}], 'e', 3),
  // Medium (5)
  _q83DefineSpending('What does spending mean?',
    'Spending means using income today to get a good or service.',
    [{val:'Spending means keeping income in a jar.', tag:_83SA},
     {val:'Spending means saving income for a goal.', tag:_83GS},
     {val:'Spending means money that has no use.', tag:_83SD}], 'm', 0),
  _q83DefineSpending('Which sentence is true?',
    'When someone spends, they get a good or a service today.',
    [{val:'When someone spends, they put money in a piggy bank.', tag:_83SA},
     {val:'When someone spends, they earn more money.', tag:_83IU},
     {val:'When someone spends, they wait until later.', tag:_83NL}], 'm', 1),
  _q83DefineSpending('What is spending?',
    'Spending is using income now to obtain a good or service.',
    [{val:'Spending is keeping income safe for later.', tag:_83SS},
     {val:'Spending is working to earn money.', tag:_83IU},
     {val:'Spending is having lots of money.', tag:_83SD}], 'm', 2),
  _q83DefineSpending('Which sentence describes spending correctly?',
    'A person spends when income is used right now.',
    [{val:'A person spends when income is kept for a future goal.', tag:_83GS},
     {val:'A person spends when they wait to use income.', tag:_83NL},
     {val:'A person spends only when they have a job.', tag:_83IU}], 'm', 3),
  _q83DefineSpending('What does spending mean?',
    'Spending means using income today to get something.',
    [{val:'Spending means putting income aside.', tag:_83SA},
     {val:'Spending means money in a piggy bank.', tag:_83SA},
     {val:'Spending means setting income aside for later.', tag:_83GS}], 'm', 0),
  // Hard (3)
  _q83DefineSpending('Which best describes spending?',
    'Spending uses income now to get a good or service — not for later.',
    [{val:'Spending uses income later to get something.', tag:_83NL},
     {val:'Spending puts income aside for a future goal.', tag:_83GS},
     {val:'Spending earns more income.', tag:_83IU}], 'h', 1),
  _q83DefineSpending('What makes income spending?',
    'Income becomes spending when it is used right now to get something.',
    [{val:'Income becomes spending when it is saved.', tag:_83SS},
     {val:'Income becomes spending when it is earned.', tag:_83IU},
     {val:'Income becomes spending when it is kept in a jar.', tag:_83SA}], 'h', 2),
  _q83DefineSpending('Which sentence is the best definition of spending?',
    'Spending means using income right now to obtain a good or a service.',
    [{val:'Spending means waiting to use income later.', tag:_83NL},
     {val:'Spending means saving for a future goal.', tag:_83GS},
     {val:'Spending means making more money.', tag:_83IU}], 'h', 3)
];

// ── C2: Define Saving (12 = 4E / 5M / 3H) ────────────────────────────────────
var _l83C2 = [
  // Easy (4)
  _q83DefineSaving('What does saving mean?',
    'Saving means keeping income for later.',
    [{val:'Saving means using income now.', tag:_83SS},
     {val:'Saving means earning money.', tag:_83IU},
     {val:'Saving means buying things today.', tag:_83NL}], 'e', 0),
  _q83DefineSaving('Which sentence describes saving?',
    'When a person keeps income for a future goal, that is saving.',
    [{val:'When a person spends income today, that is saving.', tag:_83SS},
     {val:'When a person earns income, that is saving.', tag:_83IU},
     {val:'When a person finds money, that is saving.', tag:_83NS}], 'e', 1),
  _q83DefineSaving('What is saving?',
    'Saving is keeping income for later.',
    [{val:'Saving is spending income now.', tag:_83SS},
     {val:'Saving is using income today.', tag:_83NL},
     {val:'Saving is making more income.', tag:_83IU}], 'e', 2),
  _q83DefineSaving('Which sentence is true about saving?',
    'Saving means putting income aside instead of using it now.',
    [{val:'Saving means using income now.', tag:_83SS},
     {val:'Saving means earning income.', tag:_83IU},
     {val:'Saving means money that is gone.', tag:_83VD}], 'e', 3),
  // Medium (5)
  _q83DefineSaving('What does saving mean?',
    'Saving means keeping income for later — not using it right now.',
    [{val:'Saving means using income today.', tag:_83SS},
     {val:'Saving means earning extra money.', tag:_83IU},
     {val:'Saving means buying things.', tag:_83NL}], 'm', 0),
  _q83DefineSaving('Which sentence is true?',
    'A person saves when they keep income for a future goal.',
    [{val:'A person saves when they spend income today.', tag:_83SS},
     {val:'A person saves when they earn money.', tag:_83IU},
     {val:'A person saves when they find money.', tag:_83NS}], 'm', 1),
  _q83DefineSaving('What is saving?',
    'Saving keeps income until later, when it might be used for a goal.',
    [{val:'Saving uses income right now.', tag:_83SS},
     {val:'Saving means putting money in a store.', tag:_83NL},
     {val:'Saving means making income disappear.', tag:_83VD}], 'm', 2),
  _q83DefineSaving('Which sentence describes saving correctly?',
    'Saving is when income is set aside instead of used now.',
    [{val:'Saving is when income is used today.', tag:_83SS},
     {val:'Saving is when income is earned.', tag:_83IU},
     {val:'Saving is when income is forgotten.', tag:_83VD}], 'm', 3),
  _q83DefineSaving('What does saving mean?',
    'Saving means keeping money for a future time or goal.',
    [{val:'Saving means buying snacks today.', tag:_83NL},
     {val:'Saving means earning a paycheck.', tag:_83IU},
     {val:'Saving means spending right away.', tag:_83SS}], 'm', 0),
  // Hard (3)
  _q83DefineSaving('Which best describes saving?',
    'Saving keeps income for the future — the money is not used right now.',
    [{val:'Saving uses income right now.', tag:_83SS},
     {val:'Saving puts income in the store today.', tag:_83NL},
     {val:'Saving earns income.', tag:_83IU}], 'h', 1),
  _q83DefineSaving('What makes income saving?',
    'Income becomes saving when it is kept for later instead of used now.',
    [{val:'Income becomes saving when it is spent today.', tag:_83SS},
     {val:'Income becomes saving when more is earned.', tag:_83IU},
     {val:'Income becomes saving when the day ends.', tag:_83NS}], 'h', 2),
  _q83DefineSaving('Which sentence is the best definition of saving?',
    'Saving means keeping income for later — often for a future goal.',
    [{val:'Saving means using income on a snack now.', tag:_83NL},
     {val:'Saving means working to earn income.', tag:_83IU},
     {val:'Saving means money lost forever.', tag:_83VD}], 'h', 3)
];

// ── C3: Identify Spending (18 = 6E / 7M / 5H) ────────────────────────────────
// 1 spending + 3 saving distractors. Tap spending.
var _l83C3 = [
  // Easy (6)
  _q83IdentifySpending({emoji:'📕', label:'gets a book today'},
    [{emoji:'🐷', label:'saves for a bike later'},
     {emoji:'🐷', label:'keeps income for later'},
     {emoji:'🏺', label:'puts income in a jar'}], 'e', 0),
  _q83IdentifySpending({emoji:'🍎', label:'gets an apple today'},
    [{emoji:'🐷', label:'saves for a future trip'},
     {emoji:'🐷', label:'saves for a backpack later'},
     {emoji:'🐷', label:'saves for a future gift'}], 'e', 1),
  _q83IdentifySpending({emoji:'💇', label:'pays for a haircut today'},
    [{emoji:'🐷', label:'saves for shoes later'},
     {emoji:'🐷', label:'keeps income for later'},
     {emoji:'🐷', label:'saves for a future toy'}], 'e', 2),
  _q83IdentifySpending({emoji:'🚌', label:'pays for a bus ride today'},
    [{emoji:'🐷', label:'saves for a hat later'},
     {emoji:'🏺', label:'puts income in a jar'},
     {emoji:'🐷', label:'saves for a future trip'}], 'e', 3),
  _q83IdentifySpending({emoji:'👕', label:'gets a shirt today'},
    [{emoji:'🐷', label:'saves for a bike later'},
     {emoji:'🐷', label:'saves for a book later'},
     {emoji:'🐷', label:'saves for a future gift'}], 'e', 0),
  _q83IdentifySpending({emoji:'👨‍⚕️', label:'pays for a doctor visit today'},
    [{emoji:'🐷', label:'saves for a future toy'},
     {emoji:'🐷', label:'keeps income for later'},
     {emoji:'🏺', label:'puts income in a jar'}], 'e', 1),
  // Medium (7)
  _q83IdentifySpending({emoji:'🎒', label:'gets a backpack today'},
    [{emoji:'🐷', label:'saves for a bike later'},
     {emoji:'🐷', label:'saves for new shoes later'},
     {emoji:'🐷', label:'saves for a future trip'}], 'm', 2),
  _q83IdentifySpending({emoji:'🔧', label:'pays a mechanic today'},
    [{emoji:'🐷', label:'keeps income for later'},
     {emoji:'🐷', label:'saves for a hat later'},
     {emoji:'🏺', label:'puts income in a jar'}], 'm', 3),
  _q83IdentifySpending({emoji:'👟', label:'buys shoes today'},
    [{emoji:'🐷', label:'saves for a future gift'},
     {emoji:'🐷', label:'saves for a book later'},
     {emoji:'🐷', label:'saves for a bike later'}], 'm', 0),
  _q83IdentifySpending({emoji:'🥪', label:'buys a sandwich today'},
    [{emoji:'🐷', label:'saves for a future trip'},
     {emoji:'🐷', label:'saves for a future toy'},
     {emoji:'🐷', label:'saves for new shoes later'}], 'm', 1),
  _q83IdentifySpending({emoji:'🦷', label:'pays a dentist today'},
    [{emoji:'🐷', label:'keeps income for later'},
     {emoji:'🏺', label:'puts income in a jar'},
     {emoji:'🐷', label:'saves for a backpack later'}], 'm', 2),
  _q83IdentifySpending({emoji:'🚿', label:'pays a plumber today'},
    [{emoji:'🐷', label:'saves for a future toy'},
     {emoji:'🐷', label:'saves for a hat later'},
     {emoji:'🐷', label:'saves for a future gift'}], 'm', 3),
  _q83IdentifySpending({emoji:'🍎', label:'gets an apple today'},
    [{emoji:'🐷', label:'saves for a bike later'},
     {emoji:'🐷', label:'saves for shoes later'},
     {emoji:'🐷', label:'saves for a future trip'}], 'm', 0),
  // Hard (5) — tricky: distractors related to the spending item
  _q83IdentifySpending({emoji:'📕', label:'gets a book today'},
    [{emoji:'🐷', label:'saves for a book later'},
     {emoji:'🐷', label:'keeps income for later'},
     {emoji:'🐷', label:'saves for a backpack later'}], 'h', 1),
  _q83IdentifySpending({emoji:'💇', label:'pays for a haircut today'},
    [{emoji:'🐷', label:'saves for a future toy'},
     {emoji:'🐷', label:'keeps income for later'},
     {emoji:'🐷', label:'saves for a future gift'}], 'h', 2),
  _q83IdentifySpending({emoji:'🚌', label:'pays for a bus ride today'},
    [{emoji:'🐷', label:'keeps income for later'},
     {emoji:'🐷', label:'saves for a future trip'},
     {emoji:'🏺', label:'puts income in a jar'}], 'h', 3),
  _q83IdentifySpending({emoji:'🥪', label:'buys a sandwich today'},
    [{emoji:'🐷', label:'saves for a future gift'},
     {emoji:'🐷', label:'saves for a hat later'},
     {emoji:'🐷', label:'saves for new shoes later'}], 'h', 0),
  _q83IdentifySpending({emoji:'🔧', label:'pays a mechanic today'},
    [{emoji:'🐷', label:'saves for a bike later'},
     {emoji:'🐷', label:'keeps income for later'},
     {emoji:'🏺', label:'puts income in a jar'}], 'h', 1)
];

// ── C4: Identify Saving (18 = 6E / 7M / 5H) ──────────────────────────────────
// 1 saving + 3 spending distractors. Tap saving.
var _l83C4 = [
  // Easy (6)
  _q83IdentifySaving({emoji:'🐷', label:'saves for a bike later'},
    [{emoji:'📕', label:'gets a book today'},
     {emoji:'🍎', label:'gets an apple today'},
     {emoji:'💇', label:'pays for a haircut today'}], 'e', 0),
  _q83IdentifySaving({emoji:'🐷', label:'keeps income for later'},
    [{emoji:'👕', label:'gets a shirt today'},
     {emoji:'🚌', label:'pays for a bus ride today'},
     {emoji:'🥪', label:'buys a sandwich today'}], 'e', 1),
  _q83IdentifySaving({emoji:'🏺', label:'puts income in a jar'},
    [{emoji:'👨‍⚕️', label:'pays for a doctor visit today'},
     {emoji:'👟', label:'buys shoes today'},
     {emoji:'🎒', label:'gets a backpack today'}], 'e', 2),
  _q83IdentifySaving({emoji:'🐷', label:'saves for a future toy'},
    [{emoji:'🔧', label:'pays a mechanic today'},
     {emoji:'🦷', label:'pays a dentist today'},
     {emoji:'🚿', label:'pays a plumber today'}], 'e', 3),
  _q83IdentifySaving({emoji:'🐷', label:'saves for shoes later'},
    [{emoji:'📕', label:'gets a book today'},
     {emoji:'🚌', label:'pays for a bus ride today'},
     {emoji:'🍎', label:'gets an apple today'}], 'e', 0),
  _q83IdentifySaving({emoji:'🐷', label:'saves for a future trip'},
    [{emoji:'💇', label:'pays for a haircut today'},
     {emoji:'👕', label:'gets a shirt today'},
     {emoji:'🥪', label:'buys a sandwich today'}], 'e', 1),
  // Medium (7)
  _q83IdentifySaving({emoji:'🐷', label:'saves for a backpack later'},
    [{emoji:'👨‍⚕️', label:'pays for a doctor visit today'},
     {emoji:'👟', label:'buys shoes today'},
     {emoji:'🔧', label:'pays a mechanic today'}], 'm', 2),
  _q83IdentifySaving({emoji:'🐷', label:'saves for a future gift'},
    [{emoji:'🦷', label:'pays a dentist today'},
     {emoji:'🚿', label:'pays a plumber today'},
     {emoji:'📕', label:'gets a book today'}], 'm', 3),
  _q83IdentifySaving({emoji:'🐷', label:'saves for a hat later'},
    [{emoji:'🚌', label:'pays for a bus ride today'},
     {emoji:'🍎', label:'gets an apple today'},
     {emoji:'💇', label:'pays for a haircut today'}], 'm', 0),
  _q83IdentifySaving({emoji:'🐷', label:'keeps income for later'},
    [{emoji:'🎒', label:'gets a backpack today'},
     {emoji:'🥪', label:'buys a sandwich today'},
     {emoji:'👕', label:'gets a shirt today'}], 'm', 1),
  _q83IdentifySaving({emoji:'🐷', label:'saves for a future toy'},
    [{emoji:'🔧', label:'pays a mechanic today'},
     {emoji:'👟', label:'buys shoes today'},
     {emoji:'👨‍⚕️', label:'pays for a doctor visit today'}], 'm', 2),
  _q83IdentifySaving({emoji:'🏺', label:'puts income in a jar'},
    [{emoji:'🦷', label:'pays a dentist today'},
     {emoji:'🚿', label:'pays a plumber today'},
     {emoji:'📕', label:'gets a book today'}], 'm', 3),
  _q83IdentifySaving({emoji:'🐷', label:'saves for a bike later'},
    [{emoji:'💇', label:'pays for a haircut today'},
     {emoji:'🍎', label:'gets an apple today'},
     {emoji:'🚌', label:'pays for a bus ride today'}], 'm', 0),
  // Hard (5) — tricky: distractors related to the saving goal
  _q83IdentifySaving({emoji:'🐷', label:'saves for a future bike'},
    [{emoji:'🔧', label:'pays a mechanic today'},
     {emoji:'🚌', label:'pays for a bus ride today'},
     {emoji:'👟', label:'buys shoes today'}], 'h', 1),
  _q83IdentifySaving({emoji:'🐷', label:'saves for a book later'},
    [{emoji:'📕', label:'gets a book today'},
     {emoji:'🎒', label:'gets a backpack today'},
     {emoji:'🥪', label:'buys a sandwich today'}], 'h', 2),
  _q83IdentifySaving({emoji:'🐷', label:'keeps income for a future haircut'},
    [{emoji:'💇', label:'pays for a haircut today'},
     {emoji:'🍎', label:'gets an apple today'},
     {emoji:'👕', label:'gets a shirt today'}], 'h', 3),
  _q83IdentifySaving({emoji:'🐷', label:'saves for a future trip'},
    [{emoji:'🚌', label:'pays for a bus ride today'},
     {emoji:'🥪', label:'buys a sandwich today'},
     {emoji:'🦷', label:'pays a dentist today'}], 'h', 0),
  _q83IdentifySaving({emoji:'🏺', label:'puts income in a jar'},
    [{emoji:'🚿', label:'pays a plumber today'},
     {emoji:'🔧', label:'pays a mechanic today'},
     {emoji:'👨‍⚕️', label:'pays for a doctor visit today'}], 'h', 1)
];

// ── C5: Spend Now vs Save for Later (16 = 5E / 6M / 5H) ──────────────────────
var _l83C5 = [
  // Easy (5)
  _q83SpendNowVsSaveLater('Lin has a goal of getting a bike next month.',         true,  'e', 0),
  _q83SpendNowVsSaveLater('Pat is hungry right now.',                              false, 'e', 1),
  _q83SpendNowVsSaveLater('Carlos is saving for a future trip.',                   true,  'e', 2),
  _q83SpendNowVsSaveLater("Maya's hair is long and needs to be cut today.",        false, 'e', 3),
  _q83SpendNowVsSaveLater('Mei has a future goal of new shoes.',                   true,  'e', 0),
  // Medium (6)
  _q83SpendNowVsSaveLater('Sam needs to ride the bus to school today.',            false, 'm', 1),
  _q83SpendNowVsSaveLater('Ben has a future goal of a backpack.',                  true,  'm', 2),
  _q83SpendNowVsSaveLater('Lily is sick and needs a doctor today.',                false, 'm', 3),
  _q83SpendNowVsSaveLater('Sara is working toward a future toy.',                  true,  'm', 0),
  _q83SpendNowVsSaveLater("Mia's bike is broken and she needs it fixed today.",    false, 'm', 1),
  _q83SpendNowVsSaveLater('Dev is keeping income for a future book.',              true,  'm', 2),
  // Hard (5)
  _q83SpendNowVsSaveLater('Tomas needs lunch right now.',                          false, 'h', 3),
  _q83SpendNowVsSaveLater('Ana is saving for a future birthday gift.',             true,  'h', 0),
  _q83SpendNowVsSaveLater('Eli has a goal of new shoes for next year.',            true,  'h', 1),
  _q83SpendNowVsSaveLater('Jaden is sick and needs a doctor today.',               false, 'h', 2),
  _q83SpendNowVsSaveLater('Rina has a future goal of a bike.',                     true,  'h', 3)
];

// ── C6: Match Action to Jar (14 = 4E / 6M / 4H) ──────────────────────────────
// 2-card imgChoice. 1 saving jar + 1 spending action. Half ask saving, half spending.
var _l83C6 = [
  // Easy (4)
  _q83MatchActionToJar({emoji:'🐷', label:'saves for later'},
    {emoji:'📕', label:'gets a book today'}, true, 'e', 0),
  _q83MatchActionToJar({emoji:'🐷', label:'saves for a bike later'},
    {emoji:'💇', label:'pays for a haircut today'}, true, 'e', 1),
  _q83MatchActionToJar({emoji:'🏺', label:'puts income in a jar'},
    {emoji:'🚌', label:'pays for a bus ride today'}, false, 'e', 0),
  _q83MatchActionToJar({emoji:'🐷', label:'keeps income for later'},
    {emoji:'🍎', label:'gets an apple today'}, false, 'e', 1),
  // Medium (6)
  _q83MatchActionToJar({emoji:'🐷', label:'saves for shoes later'},
    {emoji:'👟', label:'buys shoes today'}, true, 'm', 0),
  _q83MatchActionToJar({emoji:'🐷', label:'saves for a future trip'},
    {emoji:'🚌', label:'pays for a bus ride today'}, true, 'm', 1),
  _q83MatchActionToJar({emoji:'🏺', label:'puts income in a jar'},
    {emoji:'👨‍⚕️', label:'pays for a doctor visit today'}, false, 'm', 0),
  _q83MatchActionToJar({emoji:'🐷', label:'saves for a backpack later'},
    {emoji:'🎒', label:'gets a backpack today'}, true, 'm', 1),
  _q83MatchActionToJar({emoji:'🐷', label:'saves for a future gift'},
    {emoji:'🦷', label:'pays a dentist today'}, false, 'm', 0),
  _q83MatchActionToJar({emoji:'🐷', label:'saves for a future toy'},
    {emoji:'🔧', label:'pays a mechanic today'}, true, 'm', 1),
  // Hard (4) — same item on both sides (book/now vs book/later)
  _q83MatchActionToJar({emoji:'🐷', label:'saves for a book later'},
    {emoji:'📕', label:'gets a book today'}, true, 'h', 0),
  _q83MatchActionToJar({emoji:'🐷', label:'saves for a future toy'},
    {emoji:'🍎', label:'gets an apple today'}, false, 'h', 1),
  _q83MatchActionToJar({emoji:'🐷', label:'saves for a future bike'},
    {emoji:'🚲', label:'buys a bike today'}, true, 'h', 0),
  _q83MatchActionToJar({emoji:'🐷', label:'keeps income for later'},
    {emoji:'👨‍⚕️', label:'pays for a doctor visit today'}, false, 'h', 1)
];

// ── C7: Spending Obtains Goods/Services (12 = 3E / 5M / 4H) ──────────────────
var _l83C7 = [
  // Easy (3)
  _q83SpendingObtains('Maya',   '📕', 'a book',         false, 'e', 0),
  _q83SpendingObtains('Pat',    '💇', 'a haircut',      true,  'e', 1),
  _q83SpendingObtains('Lin',    '🍎', 'an apple',       false, 'e', 2),
  // Medium (5)
  _q83SpendingObtains('Carlos', '🚌', 'a bus ride',     true,  'm', 3),
  _q83SpendingObtains('Mei',    '👕', 'a shirt',        false, 'm', 0),
  _q83SpendingObtains('Ben',    '👨‍⚕️', 'a doctor visit', true,  'm', 1),
  _q83SpendingObtains('Sam',    '🎒', 'a backpack',     false, 'm', 2),
  _q83SpendingObtains('Dev',    '🔧', 'a mechanic visit', true, 'm', 3),
  // Hard (4)
  _q83SpendingObtains('Rina',   '👟', 'shoes',          false, 'h', 0),
  _q83SpendingObtains('Lily',   '🦷', 'a dentist visit', true,  'h', 1),
  _q83SpendingObtains('Mia',    '🥪', 'a sandwich',     false, 'h', 2),
  _q83SpendingObtains('Tomas',  '🚿', 'a plumber visit', true,  'h', 3)
];

// ── C8: Error Repair (14 = 4E / 5M / 5H) ─────────────────────────────────────
var _l83C8 = [
  // Easy (4)
  _q83ErrorRepair('Spending means keeping money in a jar.',
    'Spending means using income now to get a good or service.',
    [{val:'Spending means earning money.', tag:_83IU},
     {val:'Spending means saving for a goal.', tag:_83GS},
     {val:'Spending means waiting to use money.', tag:_83NL}], 'e', 0),
  _q83ErrorRepair('Saving means using money today.',
    'Saving means keeping income for later, not using it today.',
    [{val:'Saving means making more money.', tag:_83IU},
     {val:'Saving means spending right away.', tag:_83SS},
     {val:'Saving means losing money.', tag:_83VD}], 'e', 1),
  _q83ErrorRepair('Buying a book today is saving.',
    'Buying a book today is spending — using income now to get a good.',
    [{val:'Buying a book today is earning.', tag:_83IU},
     {val:'Buying a book today is saving for later.', tag:_83SS},
     {val:'Buying a book today is not using income.', tag:_83NS}], 'e', 2),
  _q83ErrorRepair('Putting income in a piggy bank is spending.',
    'Putting income in a piggy bank is saving — keeping it for later.',
    [{val:'Putting income in a piggy bank is earning.', tag:_83IU},
     {val:'Putting income in a piggy bank is using it now.', tag:_83SS},
     {val:'Putting income in a piggy bank is losing it.', tag:_83VD}], 'e', 3),
  // Medium (5)
  _q83ErrorRepair('Saving for a bike later is spending.',
    'Saving for a bike later is saving — keeping income for a future goal.',
    [{val:'Saving for a bike later is using income today.', tag:_83SS},
     {val:'Saving for a bike later means the bike is gone.', tag:_83VD},
     {val:'Saving for a bike later is earning a bike.', tag:_83IU}], 'm', 0),
  _q83ErrorRepair('Paying for a haircut today is saving.',
    'Paying for a haircut today is spending — using income now for a service.',
    [{val:'Paying for a haircut today is earning income.', tag:_83IU},
     {val:'Paying for a haircut today is keeping income for later.', tag:_83SS},
     {val:'Paying for a haircut today is not using income.', tag:_83NS}], 'm', 1),
  _q83ErrorRepair('Keeping income for a future trip is spending.',
    'Keeping income for a future trip is saving — the income is kept for later.',
    [{val:'Keeping income for a future trip is using it today.', tag:_83SS},
     {val:'Keeping income for a future trip is earning.', tag:_83IU},
     {val:'Keeping income for a future trip means losing it.', tag:_83VD}], 'm', 2),
  _q83ErrorRepair('Maya keeps income for a future book — that is spending.',
    'Maya is saving — she is keeping income for later, not using it now.',
    [{val:'Maya is earning a book.', tag:_83IU},
     {val:'Maya is using income today.', tag:_83SS},
     {val:'Maya is not using income at all.', tag:_83NS}], 'm', 3),
  _q83ErrorRepair('Spending means making money.',
    'Spending means using income to get a good or service — not making money.',
    [{val:'Spending means saving for the future.', tag:_83SS},
     {val:'Spending means waiting to use income.', tag:_83NL},
     {val:'Spending means putting income in a jar.', tag:_83SA}], 'm', 0),
  // Hard (5)
  _q83ErrorRepair('Lin keeps income for a haircut tomorrow — she is spending.',
    'Lin is saving — even though the goal is just tomorrow, the income is being kept for later, not used today.',
    [{val:'Lin is earning a haircut.', tag:_83IU},
     {val:'Lin is spending — the haircut is the same as today.', tag:_83NL},
     {val:'Lin is not using income.', tag:_83NS}], 'h', 1),
  _q83ErrorRepair('Spending uses income to keep for the future.',
    'Spending uses income right now. Saving keeps income for the future.',
    [{val:'Spending means waiting forever.', tag:_83NL},
     {val:'Spending means earning more money.', tag:_83IU},
     {val:'Spending means putting income in a jar.', tag:_83SA}], 'h', 2),
  _q83ErrorRepair('Pat saves income today for a snack right now.',
    'If Pat is using income today for a snack, that is spending, not saving.',
    [{val:'Pat is earning a snack.', tag:_83IU},
     {val:'Pat is keeping the snack for later.', tag:_83NL},
     {val:'Pat is not using income.', tag:_83NS}], 'h', 3),
  _q83ErrorRepair('Saving for a future goal means buying the goal today.',
    'Saving for a future goal means keeping income now, then using it later when the goal is reached.',
    [{val:'Saving for a future goal means earning extra.', tag:_83IU},
     {val:'Saving for a future goal means losing income.', tag:_83VD},
     {val:'Saving for a future goal means not using income at all.', tag:_83NS}], 'h', 0),
  _q83ErrorRepair('Putting income in a piggy bank counts as spending because the decision was made.',
    'Saving requires the income to be kept — putting income in a piggy bank is saving, not spending.',
    [{val:'Putting income in a piggy bank is earning income.', tag:_83IU},
     {val:'Putting income in a piggy bank is using it for a snack.', tag:_83NL},
     {val:'Putting income in a piggy bank is losing it.', tag:_83VD}], 'h', 1)
];

// ── C9: True Sentence / Mixed Review (16 = 5E / 7M / 4H) ─────────────────────
var _l83C9 = [
  // Easy (5)
  _q83TrueSentence('Spending means using income now.',
    [{val:'Spending means keeping income for later.', tag:_83SS},
     {val:'Spending means earning income.', tag:_83IU},
     {val:'Spending means losing income.', tag:_83VD}], 'e', 0),
  _q83TrueSentence('Saving means keeping income for later.',
    [{val:'Saving means using income today.', tag:_83SS},
     {val:'Saving means earning income.', tag:_83IU},
     {val:'Saving means money in a store.', tag:_83NL}], 'e', 1),
  _q83TrueSentence('People can spend income today or save income for later.',
    [{val:'People can only spend income.', tag:_83NS},
     {val:'People can only save income.', tag:_83NS},
     {val:'People cannot make a choice with income.', tag:_83NS}], 'e', 2),
  _q83TrueSentence('A piggy bank is for saving.',
    [{val:'A piggy bank is for spending.', tag:_83SS},
     {val:'A piggy bank is for earning.', tag:_83IU},
     {val:'A piggy bank is not for income.', tag:_83NS}], 'e', 3),
  _q83TrueSentence('Saving keeps income for the future.',
    [{val:'Saving uses income today.', tag:_83SS},
     {val:'Saving means earning extra income.', tag:_83IU},
     {val:'Saving means money no one can find.', tag:_83VD}], 'e', 0),
  // Medium (7)
  _q83TrueSentence('Spending uses income to get a good or a service today.',
    [{val:'Spending uses income to get a future goal.', tag:_83NL},
     {val:'Spending means making more income.', tag:_83IU},
     {val:'Spending means putting income aside.', tag:_83SA}], 'm', 1),
  _q83TrueSentence('Saving for a future goal means keeping income aside until later.',
    [{val:'Saving for a future goal means using income today.', tag:_83SS},
     {val:'Saving for a future goal means earning extra.', tag:_83IU},
     {val:'Saving for a future goal means the goal is now.', tag:_83NL}], 'm', 2),
  _q83TrueSentence('When someone pays for a haircut today, that is spending.',
    [{val:'When someone pays for a haircut today, that is saving.', tag:_83SS},
     {val:'When someone pays for a haircut today, they are earning income.', tag:_83IU},
     {val:'When someone pays for a haircut today, no income is used.', tag:_83NS}], 'm', 3),
  _q83TrueSentence('When someone keeps income in a piggy bank, that is saving.',
    [{val:'When someone keeps income in a piggy bank, that is spending.', tag:_83SS},
     {val:'When someone keeps income in a piggy bank, they are earning.', tag:_83IU},
     {val:'When someone keeps income in a piggy bank, they are using it today.', tag:_83NL}], 'm', 0),
  _q83TrueSentence('Spending gets a good or service right away. Saving keeps income for the future.',
    [{val:'Spending and saving are the same thing.', tag:_83SS},
     {val:'Spending is for later. Saving is for today.', tag:_83NL},
     {val:'Spending earns income. Saving spends income.', tag:_83IU}], 'm', 1),
  _q83TrueSentence('A goal in the future is reached by saving income now.',
    [{val:'A goal in the future is reached by spending today.', tag:_83GS},
     {val:'A goal in the future is reached by earning more.', tag:_83IU},
     {val:'A goal in the future cannot be reached.', tag:_83NS}], 'm', 2),
  _q83TrueSentence('Asking "now or later?" helps tell spending from saving.',
    [{val:'Asking "how much?" tells spending from saving.', tag:_83NS},
     {val:'Asking "who earned it?" tells spending from saving.', tag:_83IU},
     {val:'There is no way to tell them apart.', tag:_83SS}], 'm', 3),
  // Hard (4)
  _q83TrueSentence('Even if a goal is just for tomorrow, keeping income for it is saving.',
    [{val:'Keeping income for tomorrow counts as spending.', tag:_83NL},
     {val:'Keeping income for tomorrow means earning it.', tag:_83IU},
     {val:'Keeping income for tomorrow means losing it.', tag:_83VD}], 'h', 0),
  _q83TrueSentence('Spending obtains a good or a service. Saving obtains nothing yet — the income waits.',
    [{val:'Spending obtains a future goal. Saving obtains a good today.', tag:_83SS},
     {val:'Spending and saving both obtain a good right away.', tag:_83NS},
     {val:'Spending earns income. Saving spends it.', tag:_83IU}], 'h', 1),
  _q83TrueSentence('Both adults and kids can spend income or save income.',
    [{val:'Only adults can spend or save income.', tag:_83NS},
     {val:'Only kids can save income.', tag:_83NS},
     {val:'Spending and saving are not real choices.', tag:_83NS}], 'h', 2),
  _q83TrueSentence('Saving for a future goal is still saving — the income is kept, not used.',
    [{val:'Saving for a future goal is spending because the goal is real.', tag:_83GS},
     {val:'Saving for a future goal is the same as earning.', tag:_83IU},
     {val:'Saving for a future goal means the goal is here today.', tag:_83NL}], 'h', 3)
];

// ── C10: Visual Choice (18 = 4E / 7M / 7H) ───────────────────────────────────
// 2-card imgChoice. 1 spending + 1 saving. Half ask spending, half ask saving.
var _l83C10 = [
  // Easy (4)
  _q83VisualChoice({emoji:'📕', label:'gets a book today'},
    {emoji:'🐷', label:'saves for a bike later'}, true, 'e', 0),
  _q83VisualChoice({emoji:'💇', label:'pays for a haircut today'},
    {emoji:'🐷', label:'keeps income for later'}, false, 'e', 1),
  _q83VisualChoice({emoji:'🍎', label:'gets an apple today'},
    {emoji:'🐷', label:'saves for a future toy'}, true, 'e', 0),
  _q83VisualChoice({emoji:'🚌', label:'pays for a bus ride today'},
    {emoji:'🏺', label:'puts income in a jar'}, false, 'e', 1),
  // Medium (7)
  _q83VisualChoice({emoji:'👕', label:'gets a shirt today'},
    {emoji:'🐷', label:'saves for a future trip'}, true, 'm', 0),
  _q83VisualChoice({emoji:'🎒', label:'gets a backpack today'},
    {emoji:'🐷', label:'saves for shoes later'}, false, 'm', 1),
  _q83VisualChoice({emoji:'👨‍⚕️', label:'pays for a doctor visit today'},
    {emoji:'🐷', label:'saves for a future gift'}, true, 'm', 0),
  _q83VisualChoice({emoji:'🔧', label:'pays a mechanic today'},
    {emoji:'🐷', label:'saves for a hat later'}, false, 'm', 1),
  _q83VisualChoice({emoji:'👟', label:'buys shoes today'},
    {emoji:'🐷', label:'saves for a backpack later'}, true, 'm', 0),
  _q83VisualChoice({emoji:'🥪', label:'buys a sandwich today'},
    {emoji:'🐷', label:'saves for a future toy'}, false, 'm', 1),
  _q83VisualChoice({emoji:'🦷', label:'pays a dentist today'},
    {emoji:'🐷', label:'keeps income for later'}, true, 'm', 0),
  // Hard (7) — same item on both sides
  _q83VisualChoice({emoji:'📕', label:'gets a book today'},
    {emoji:'🐷', label:'saves for a book later'}, true, 'h', 0),
  _q83VisualChoice({emoji:'💇', label:'pays for a haircut today'},
    {emoji:'🐷', label:'saves for a future toy'}, false, 'h', 1),
  _q83VisualChoice({emoji:'🚌', label:'pays for a bus ride today'},
    {emoji:'🐷', label:'saves for a future trip'}, true, 'h', 0),
  _q83VisualChoice({emoji:'🔧', label:'pays a mechanic today'},
    {emoji:'🐷', label:'saves for a bike later'}, false, 'h', 1),
  _q83VisualChoice({emoji:'🎒', label:'gets a backpack today'},
    {emoji:'🐷', label:'saves for a backpack later'}, true, 'h', 0),
  _q83VisualChoice({emoji:'🥪', label:'buys a sandwich today'},
    {emoji:'🐷', label:'keeps income for later'}, false, 'h', 1),
  _q83VisualChoice({emoji:'👟', label:'buys shoes today'},
    {emoji:'🐷', label:'saves for new shoes later'}, true, 'h', 0)
];

// ── L8.3 combined bank ───────────────────────────────────────────────────────
var _l83Bank = [].concat(_l83C1, _l83C2, _l83C3, _l83C4, _l83C5, _l83C6, _l83C7, _l83C8, _l83C9, _l83C10);


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
      allowedQuestionTypes: ['multipleChoice', 'imgChoice'],
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
    //  Lesson 8.2 — Goods and Services
    //  TEKS 1.9B | 140 questions (45E / 55M / 40H)
    //  10 categories: C1 identify-goods (imgChoice), C2 identify-services
    //  (imgChoice), C3 good-vs-service, C4 match-scenario, C5 income→good,
    //  C6 income→service, C7 purchase-choice (imgChoice), C8 wants-needs-
    //  supporting-context, C9 error-repair, C10 true-sentence/mixed-review.
    //  46 imgChoice questions (C1=16 + C2=16 + C7=14). Goods and services
    //  cards use the same visual format (no styling hints).
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u8-l2',
      title: 'Goods and Services',
      teks: ['1.9B'],
      skill: 'goods_and_services',
      allowedQuestionTypes: ['multipleChoice', 'imgChoice'],
      keyIdeas: _l82KeyIdeas,
      workedExamples: _l82Examples,
      quizBank: _l82Bank,
      diagnostics: {
        commonDistractors: [_82GS, _82GD, _82SD, _82IP, _82PC, _82WN, _82WS, _82IS, _82NS],
        errorTags:         [_82GS, _82GD, _82SD, _82IP, _82PC, _82WN, _82WS, _82IS, _82NS],
        interventionRules: []
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  Lesson 8.3 — Spending and Saving
    //  TEKS 1.9C | 150 questions (45E / 60M / 45H)
    //  10 categories: C1 define-spending, C2 define-saving, C3 identify-
    //  spending (imgChoice 4-card), C4 identify-saving (imgChoice 4-card),
    //  C5 spend-now-vs-save-later, C6 match-action-to-jar (imgChoice 2-card),
    //  C7 spending-obtains-goods/services, C8 error-repair, C9 true-sentence,
    //  C10 visual-choice (imgChoice 2-card mixed).
    //  68 imgChoice questions (4-card: 36; 2-card: 32). Delayed-spending
    //  rule locked: kept income = saving, regardless of future intent.
    // ═══════════════════════════════════════════════════════════════════════
    {
      lessonId: 'g1-u8-l3',
      title: 'Spending and Saving',
      teks: ['1.9C'],
      skill: 'spending_and_saving',
      allowedQuestionTypes: ['multipleChoice', 'imgChoice'],
      keyIdeas: _l83KeyIdeas,
      workedExamples: _l83Examples,
      quizBank: _l83Bank,
      diagnostics: {
        commonDistractors: [_83SS, _83SD, _83VD, _83NL, _83GS, _83IU, _83GP, _83SA, _83NS],
        errorTags:         [_83SS, _83SD, _83VD, _83NL, _83GS, _83IU, _83GP, _83SA, _83NS],
        interventionRules: []
      }
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
