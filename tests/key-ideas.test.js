// =============================================================================
//  Key Idea — Step-based Visual System — Test Suite
//
//  Loads src/key-ideas.js into a Node global scope with shims for the browser
//  helpers it depends on (_escHtml, drawNumberLine, etc.). Tests the resolver,
//  topic detector, and builder registry without a DOM.
// =============================================================================

'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// ── Shims for browser-only globals ────────────────────────────────────────────
// _escHtml: identity (no HTML special chars to escape in tests).
global._escHtml = function(s){ return String(s == null ? '' : s); };

// Stub the draw* SVG factories used by topic step visuals. Each returns a
// predictable string we can assert against, but the builders only check the
// string is non-empty, so identity-ish values are fine.
global.drawNumberLine = function(cfg){ return '<svg data-numline mark="' + (cfg && cfg.mark != null ? cfg.mark : '') + '"></svg>'; };
global.drawArray      = function(cfg){ return '<svg data-array rows="' + cfg.rows + '" cols="' + cfg.cols + '"></svg>'; };
global.drawBase10     = function(cfg){ return '<svg data-base10 h="' + (cfg.hundreds||0) + '" t="' + (cfg.tens||0) + '" o="' + (cfg.ones||0) + '"></svg>'; };
global.drawComparison = function(){ return '<div data-cmp></div>'; };
global.drawShapes     = function(){ return '<svg data-shapes></svg>'; };

// Load the module under test directly into the Node global scope so the same
// `let`/`const` declarations expose as globals (the production runtime treats
// the whole bundle as a single concatenated script).
(function _loadKeyIdeasIntoGlobal(){
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'key-ideas.js'), 'utf8');
  // Wrap and run in current vm context, but project all top-level declarations
  // onto globalThis (mimicking the bundle's single-scope concatenation).
  const wrapped = src
    .replace(/^let (\w+)/mg, 'globalThis.$1')
    .replace(/^const (_KI_\w+)/mg, 'globalThis.$1')
    .replace(/^function (\w+)/mg, 'globalThis.$1 = function $1');
  // eslint-disable-next-line no-new-func
  new Function(wrapped)();
})();

// ── _detectLessonTopic — one fixture per topic + regressions ─────────────────
describe('_detectLessonTopic', () => {
  const fixtures = [
    ['regroup-sub',        { id: 'u3l4', title: 'Subtract with Regrouping', points: ['Trade a ten for ten ones'] }],
    ['regroup-add',        { id: 'u3l2', title: 'Add with Regrouping',      points: ['Regroup ten ones into one ten and carry'] }],
    ['make-ten',           { id: 'u1l3', title: 'Make a 10',                points: ['Use the make-a-ten strategy to add'] }],
    ['doubles',            { id: 'u1l2', title: 'Doubles!',                 points: ['A double adds the same number twice'] }],
    ['bar-graph',          { id: 'u9l3', title: 'Read a Bar Graph',         points: ['Read the y-axis'] }],
    ['tally',              { id: 'ku7l1', title: 'Tally Marks',             points: ['Five strokes make a bundle'] }],
    ['line-plot',          { id: 'u6l4', title: 'Line Plots',               points: ['Read each X above a number'] }],
    ['pictograph',         { id: 'u9l2', title: 'Read a Pictograph',        points: ['Each star = 2 books'] }],
    ['data-conclusion',    { id: 'g1u7l4', title: 'Drawing Conclusions from Data', points: ['Use the graph to draw a conclusion'] }],
    ['compare-data',       { id: 'ku7l4', title: 'Compare Data',            points: ['Compare data between two groups'] }],
    ['sort-groups',        { id: 'ku7l1b', title: 'Sort Into Groups',       points: ['Sort by color into groups'] }],
    ['financial-literacy', { id: 'ku8l1', title: 'Earning Money & Jobs',    points: ['You earn money by doing a job'] }],
    ['financial-literacy', { id: 'ku8l2', title: 'Wants vs Needs',          points: ['A need is something we must have'] }],
    ['financial-literacy', { id: 'g1u8l4', title: 'Charitable Giving',      points: ['Giving to others is a choice'] }],
    ['money',              { id: 'ku8l3', title: 'Identify Coins',          points: ['Penny, nickel, dime, quarter'] }],
    ['time',               { id: 'u6l1', title: 'Telling Time',             points: ['Read the hour hand'] }],
    ['fraction',           { id: 'u7l1', title: 'Equal Parts',              points: ['Halves and thirds'] }],
    ['subitize',           { id: 'ku1l2', title: 'Quick Look',              points: ['Look at the dots — find the pattern'] }],
    ['tens-addition',      { id: 'g1u4l3', title: 'Add Multiples of 10',    points: ['Add multiples of 10 by counting tens'] }],
    ['skip-count',         { id: 'ku4l2', title: 'Count by Tens',           points: ['Skip count by 10s'] }],
    ['count-on',           { id: 'u1l1', title: 'Count Up and Count Back',  defaultTags: ['count_on', 'count_back'] }],
    ['number-line-add',    { id: 'u3l5', title: 'Add Using a Number Line',  points: ['Find the addend on the number line, then jump forward'] }],
    ['compare',            { id: 'ku2l3', title: 'Compare Numbers',         points: ['Greater than or less than'] }],
    ['place-value',        { id: 'u2l1', title: 'Big Numbers',              points: ['Hundreds, tens, and ones'] }],
    ['number-bond',        { id: 'u1l4', title: 'Number Families',          points: ['Fact families show related facts'] }],
    ['ten-frame',          { id: 'ku1l5', title: 'Ten Frames',              points: ['Fill the ten frame'] }],
    ['story-problem',      { id: 'ku3l3', title: 'Word Problems',           points: ['Read the story and find what you know'] }],
    ['shape',              { id: 'ku5l1', title: 'Flat Shapes (2D)',        points: ['Identify the shape by sides and corners'] }],
    ['measure',            { id: 'ku6l1', title: 'Comparing Length',        points: ['Longer or shorter — measure to find out'] }],
    ['counting',           { id: 'ku1l1', title: 'Counting to 10',          points: ['Count to 10 by ones'] }],
    ['array',              { id: 'u8l1', title: 'Build an Array',           points: ['5 rows of 4 dots'] }],
  ];

  test.each(fixtures)('detects topic %s for fixture', (expected, lesson) => {
    expect(_detectLessonTopic(lesson)).toBe(expected);
  });

  // Regressions — the priority ordering must keep these straight.
  test('tally lesson is NOT detected as pictograph', () => {
    const l = { id: 'ku7l1', title: 'Tally Marks', points: ['Each tally is 1; a cross-stroke is 5'] };
    expect(_detectLessonTopic(l)).toBe('tally');
  });

  test('pictograph lesson is NOT detected as array (despite "rows" language)', () => {
    const l = { id: 'u9l2', title: 'Read a Pictograph', points: ['Each row of pictures shows a category'] };
    expect(_detectLessonTopic(l)).toBe('pictograph');
  });

  test('regroup-sub matches before regroup-add for subtraction lessons', () => {
    const l = { id: 'u4l3', title: 'Subtract with Regrouping', points: ['Borrow a ten when there are not enough ones'] };
    expect(_detectLessonTopic(l)).toBe('regroup-sub');
  });

  test('make-ten lesson is NOT classified as regroup-add', () => {
    // "Make a 10" is a specific strategy lesson — must beat the broader regroup-add rule.
    const l = { id: 'u1l3', title: 'Make a 10', points: ['Use the make-a-ten strategy'] };
    expect(_detectLessonTopic(l)).toBe('make-ten');
  });

  test('financial-literacy lesson is NOT classified as money', () => {
    // Earning Income, Wants vs Needs, etc. — conceptual, not coin counting.
    const l = { id: 'g1u8l1', title: 'Earning Income', points: ['Earning means doing work for money'] };
    expect(_detectLessonTopic(l)).toBe('financial-literacy');
    const l2 = { id: 'ku8l2', title: 'Wants vs Needs', points: ['A need is something we must have'] };
    expect(_detectLessonTopic(l2)).toBe('financial-literacy');
    // But "Identify Coins" still goes to money:
    const l3 = { id: 'ku8l3', title: 'Identify Coins', points: ['Penny, nickel, dime, quarter'] };
    expect(_detectLessonTopic(l3)).toBe('money');
  });

  test('subitize lesson uses subitize, not ten-frame, when both keywords appear', () => {
    const l = { id: 'ku1l7', title: 'Quick Look: Subitize', points: ['Recognize patterns instantly — like a ten frame'] };
    expect(_detectLessonTopic(l)).toBe('subitize');
  });

  test('"What Time Is It?" matches time, not count-on', () => {
    const l = { id: 'u7l2', title: 'What Time Is It?', points: ['Read the clock'] };
    expect(_detectLessonTopic(l)).toBe('time');
  });

  test('"Count Your Coins" matches money, not count-on', () => {
    const l = { id: 'u5l2', title: 'Count Your Coins', points: ['Count on from each coin'], defaultTags: ['money', 'counting_coins'] };
    expect(_detectLessonTopic(l)).toBe('money');
  });

  test('story-problem keyword matches "Math Stories" and "Explain Thinking"', () => {
    expect(_detectLessonTopic({ id: 'u3l4', title: 'Math Stories', points: ['Read the story'] })).toBe('story-problem');
    expect(_detectLessonTopic({ id: 'ku3l4', title: 'Explain Thinking', points: ['Explain your math'] })).toBe('story-problem');
  });

  test('line-plot matches separately from bar-graph and pictograph', () => {
    expect(_detectLessonTopic({ id: 'u6l4', title: 'Line Plots', points: ['Read each X'] })).toBe('line-plot');
  });

  test('doubles matches without claiming generic "double" word elsewhere', () => {
    expect(_detectLessonTopic({ id: 'u1l2', title: 'Doubles!', points: ['Doubles fact: 5 + 5 = 10'] })).toBe('doubles');
    expect(_detectLessonTopic({ id: 'g1u3l3', title: 'Doubles and Near Doubles', points: ['Near doubles strategy'] })).toBe('doubles');
  });

  test('tens-addition matches "Add Multiples of 10"', () => {
    expect(_detectLessonTopic({ id: 'g1u4l3', title: 'Add Multiples of 10', points: ['Add multiples of 10 by counting tens'] })).toBe('tens-addition');
  });

  test('sort-groups matches "Sort Into Groups"', () => {
    expect(_detectLessonTopic({ id: 'ku7l1', title: 'Sort Into Groups', points: ['Sort by color'] })).toBe('sort-groups');
  });

  // ── Must-fix routing assertions (per implementation plan §9) ───────────────
  test('G2 u4l3 Close Enough Counts! → rounding', () => {
    expect(_detectLessonTopic({
      id: 'u4l3', title: 'Close Enough Counts!',
      points: [
        'Round each number FIRST, then add or subtract',
        'Round to nearest 10: look at ones digit (5+ round up, 0-4 round down)',
        'Estimates are CLOSE but not exact'
      ],
      defaultTags: ['estimation','rounding','reasonableness']
    })).toBe('rounding');
  });

  test('G2 u3l3 Add Three Numbers → three-addends (NOT doubles)', () => {
    expect(_detectLessonTopic({
      id: 'u3l3', title: 'Add Three Numbers',
      points: ['Look for DOUBLES or MAKE-A-TEN pairs first', 'Add those two numbers, then add the third'],
      defaultTags: ['three_addends','addition_strategy','make_ten']
    })).toBe('three-addends');
  });

  test('G2 u9l3 Mirror Shapes → symmetry (NOT fraction)', () => {
    expect(_detectLessonTopic({
      id: 'u9l3', title: 'Mirror Shapes',
      points: ['A shape has SYMMETRY if you can fold it so both halves match', 'The fold line is the LINE OF SYMMETRY'],
      defaultTags: ['geometry','symmetry','line_of_symmetry']
    })).toBe('symmetry');
  });

  test('G2 u10l3 Sharing Equally → equal-sharing (NOT number-bond)', () => {
    expect(_detectLessonTopic({
      id: 'u10l3', title: 'Sharing Equally',
      points: ['DIVISION means splitting into EQUAL groups', '12 ÷ 4 = 3 means 12 split into 4 groups = 3 in each', 'Multiplication and division are FACT FAMILIES'],
      defaultTags: ['division_foundations','sharing_equally','equal_groups']
    })).toBe('equal-sharing');
  });

  test('G1 g1-u1-l1 Quick Looks → subitize (NOT make-ten)', () => {
    expect(_detectLessonTopic({
      id: 'g1-u1-l1', title: 'Quick Looks',
      points: ['Look for groups first, before you count one by one.', 'Two full rows make 10.']
    })).toBe('subitize');
  });

  test('G1 g1-u5-l5 Equal Parts — Halves and Fourths → fraction (NOT money)', () => {
    expect(_detectLessonTopic({
      id: 'g1-u5-l5', title: 'Equal Parts — Halves and Fourths',
      points: ['When a shape is split into 4 equal parts, the four parts are called fourths (also called quarters).']
    })).toBe('fraction');
  });

  test('K ku4l4 Missing Numbers in Patterns → next-number (NOT compare)', () => {
    expect(_detectLessonTopic({
      id: 'ku4l4', title: 'Missing Numbers in Patterns',
      points: ['Look at the numbers on BOTH sides of the blank to find the missing number', 'The missing number must be one more than the number before it'],
      defaultTags: ['pattern','missing_number']
    })).toBe('next-number');
  });

  test('G1 g1-u3-l2 Subtract Within 20 → count-back (NOT count-on)', () => {
    expect(_detectLessonTopic({
      id: 'g1-u3-l2', title: 'Subtract Within 20',
      points: ['Subtraction means take away — we find what is left.', 'To count back, start at the first number and count down the smaller one.']
    })).toBe('count-back');
  });

  test('K ku3l2 Subtracting Numbers → count-back (NOT count-on)', () => {
    expect(_detectLessonTopic({
      id: 'ku3l2', title: 'Subtracting Numbers',
      points: ['Subtracting means taking away from a group to find what is left', 'Start with the total and count back to find the answer'],
      defaultTags: ['add_sub','subtraction','take_away']
    })).toBe('count-back');
  });

  // ── Collision regressions for the new rules ────────────────────────────────
  test('money does NOT steal fraction lessons because of parenthesized "quarters"', () => {
    const l = { id: 'g1-u5-l5', title: 'Equal Parts', points: ['Four equal parts are called fourths (also called quarters).'] };
    expect(_detectLessonTopic(l)).toBe('fraction');
  });

  test('make-ten does NOT steal subitizing lessons', () => {
    const l = { id: 'g1-u1-l1', title: 'Quick Looks', points: ['Two full rows make 10.'] };
    expect(_detectLessonTopic(l)).toBe('subitize');
  });

  test('compare does NOT steal missing-number pattern lessons', () => {
    const l = { id: 'ku4l4', title: 'Missing Numbers in Patterns', points: ['The missing number is one less than the number after it'] };
    expect(_detectLessonTopic(l)).toBe('next-number');
  });

  test('fraction does NOT steal symmetry lessons', () => {
    const l = { id: 'u9l3', title: 'Mirror Shapes', points: ['Fold the shape so the halves match. The fold line is the line of symmetry.'] };
    expect(_detectLessonTopic(l)).toBe('symmetry');
  });

  test('number-bond does NOT steal equal-sharing lessons', () => {
    const l = { id: 'u10l3', title: 'Sharing Equally', points: ['DIVISION means splitting into equal groups', 'Multiplication and division are FACT FAMILIES'] };
    expect(_detectLessonTopic(l)).toBe('equal-sharing');
  });

  test('count-on still wins for forward-counting lessons (no subtraction context)', () => {
    // "Count Backward" recital lesson — backward in name but no subtraction. Should stay count-on.
    const l = { id: 'g1-u1-l3', title: 'Count Backward', points: ['Start at any number and count back: 20, 19, 18 ...'] };
    expect(_detectLessonTopic(l)).toBe('count-on');
  });

  test('count-back fires for subtract-with-count-back lessons', () => {
    const l = { id: 'g1-u3-l2', title: 'Subtract Within 20', points: ['To count back, start at the first number and count down the smaller one.'] };
    expect(_detectLessonTopic(l)).toBe('count-back');
  });

  test('rounding matches estimation lessons but not generic addition', () => {
    expect(_detectLessonTopic({ id: 'u4l3', title: 'Close Enough Counts!', points: ['Round each number first', 'Round to nearest 10'] })).toBe('rounding');
    // Generic addition lesson should NOT match rounding
    expect(_detectLessonTopic({ id: 'u3l1', title: 'Adding Bigger Numbers', points: ['Add the ones first'] })).not.toBe('rounding');
  });

  test('returns null when no rule matches', () => {
    const l = { id: 'random', title: 'A Random Lesson About Nothing', points: ['random unmatched content'] };
    expect(_detectLessonTopic(l)).toBeNull();
  });
});

// ── _resolveKeyIdeaSteps — non-empty for every input shape ───────────────────
describe('_resolveKeyIdeaSteps always returns a non-empty step array', () => {
  const UNIT = { color: '#4CAF50' };

  test('honors author-supplied keyIdeaSteps when present', () => {
    const lesson = {
      id: 'x', title: 'X', points: ['p1'],
      keyIdeaSteps: [{ title: 'A', text: 'A text', visualType: 'customHtml', visual: { html: '<p>A</p>' } }]
    };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps).toHaveLength(1);
    expect(steps[0].title).toBe('A');
    expect(steps[0].visualType).toBe('customHtml');
  });

  test('falls back to per-point when no topic match', () => {
    const lesson = { id: 'unmatched', title: 'Random', points: ['point one', 'point two', 'point three'] };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps).toHaveLength(3);
    steps.forEach(s => expect(s.visualType).toBe('genericPoint'));
  });

  test('synthesizes a single step when points is missing entirely', () => {
    const lesson = { id: 'broken', title: 'Broken Lesson' };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps).toHaveLength(1);
    expect(steps[0].text).toBe('Broken Lesson');
  });

  test('synthesizes a single step when points is an empty array', () => {
    const lesson = { id: 'empty', title: 'Empty Points', points: [] };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps).toHaveLength(1);
  });

  test('returns one step per bullet for topic-matched regroup-add (5 bullets)', () => {
    // Under the bullet-clicks refactor, step count = bullet count.
    const lesson = {
      id: 'u3l1', title: 'Add with Regrouping',
      points: [
        'Line up ones and tens',
        'Add ONES first, then tens',
        'If ones add to 10 or more, REGROUP (move 1 ten)',
        'Carry the ten to the tens column',
        'Read your final answer'
      ]
    };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps).toHaveLength(5);
    expect(steps[0].visualType).toBe('regroupAddSetup');
  });

  test('returns 4-step sequence for pictograph topic (4 bullets)', () => {
    const lesson = {
      id: 'u6l2', title: 'Picture Graphs',
      points: [
        'Each picture stands for a number',
        'Count the pictures in a row',
        'Multiply count by the key value',
        'To compare rows, subtract'
      ]
    };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps).toHaveLength(4);
    expect(steps.map(s => s.visualType)).toEqual([
      'pictographKey', 'pictographCount', 'pictographRowTotal', 'pictographCompare'
    ]);
  });

  test('last fallback step inlines worked example when available', () => {
    const lesson = {
      id: 'unmatched-with-ex', title: 'Random',
      points: ['p1', 'p2'],
      examples: [{ p: 'Example prompt', s: '<svg></svg>', a: '42 ✅' }]
    };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps).toHaveLength(2);
    expect(steps[1].visual.exampleSvg).toBe('<svg></svg>');
    expect(steps[1].visual.examplePrompt).toBe('Example prompt');
    expect(steps[1].visual.exampleAnswer).toBe('42');  // ✅ stripped
    // Only the LAST step inlines the example
    expect(steps[0].visual.exampleSvg).toBeNull();
  });
});

// ── _KI_BUILDERS smoke test — every visualType referenced by a topic step set
//    must have a builder, and every builder must return a non-empty string.
// ─────────────────────────────────────────────────────────────────────────────
describe('_KI_BUILDERS — registry integrity', () => {
  test('every topic step-set references a real builder', () => {
    const UNIT = { color: '#000' };
    const FIXTURE = { id: 'fake', title: 'Fake', points: ['p'], defaultTags: [], examples: [{ p: 'q', s: '<svg></svg>', a: '1' }] };
    const missing = [];
    for (const topic of Object.keys(_KI_TOPIC_STEPS)) {
      const steps = _KI_TOPIC_STEPS[topic](FIXTURE, UNIT);
      for (const s of steps) {
        if (typeof _KI_BUILDERS[s.visualType] !== 'function') {
          missing.push(topic + ' -> ' + s.visualType);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  test('each builder produces a non-empty string for its topic config', () => {
    // Walk every visualType used by a topic step-set and confirm the builder
    // returns a non-empty string when given the topic-generated config.
    const UNIT = { color: '#4CAF50' };
    const FIXTURE = { id: 'fake', title: 'Fake', points: ['p'], defaultTags: [], examples: [{ p: 'q', s: '<svg></svg>', a: '1' }] };
    const empties = [];
    for (const topic of Object.keys(_KI_TOPIC_STEPS)) {
      const steps = _KI_TOPIC_STEPS[topic](FIXTURE, UNIT);
      for (const s of steps) {
        const builder = _KI_BUILDERS[s.visualType];
        if (!builder) continue;  // covered by previous test
        const html = builder(s.visual || {}, FIXTURE, UNIT);
        if (typeof html !== 'string' || html.length === 0) {
          empties.push(topic + ' -> ' + s.visualType);
        }
      }
    }
    expect(empties).toEqual([]);
  });

  test('genericPoint builder renders text and example when provided', () => {
    const html = _KI_BUILDERS.genericPoint({
      n: 2, color: '#333', text: 'Hello world',
      exampleSvg: '<svg></svg>', examplePrompt: 'Q?', exampleAnswer: '42'
    });
    expect(html).toContain('Hello world');
    expect(html).toContain('Q?');
    expect(html).toContain('42');
    expect(html).toContain('<svg></svg>');
  });

  test('customHtml builder returns cfg.html verbatim', () => {
    expect(_KI_BUILDERS.customHtml({ html: '<p>OK</p>' })).toBe('<p>OK</p>');
  });
});

// ── _extractFirstOpFromLesson — adapts topic visuals to lesson content ───────
describe('_extractFirstOpFromLesson', () => {
  test('pulls first addition pair from examples', () => {
    const lesson = { examples: [{ p: '47 + 36 = ?' }, { p: '12 + 5' }] };
    expect(_extractFirstOpFromLesson(lesson, '+')).toEqual({ a: 47, b: 36, op: '+' });
  });

  test('pulls first subtraction pair when preferring -', () => {
    const lesson = { examples: [{ p: '12 + 5 = 17' }, { p: '91 − 47 = ?' }] };
    expect(_extractFirstOpFromLesson(lesson, '-')).toEqual({ a: 91, b: 47, op: '-' });
  });

  test('returns null when no op found', () => {
    const lesson = { examples: [{ p: 'no math here' }] };
    expect(_extractFirstOpFromLesson(lesson, '+')).toBeNull();
  });
});

// =============================================================================
//  Bullet-clicks refactor — every lesson's resolved step count must equal the
//  lesson's bullet count, and titles must come from the bullets themselves.
// =============================================================================
describe('Step count equals bullet count + titles come from bullets', () => {
  const UNIT = { color: '#4CAF50' };

  test('resolver returns N steps for N-bullet lesson (topic-matched)', () => {
    const lesson = {
      id: 'u3l3', title: 'Add Three Numbers',
      points: [
        'Look for DOUBLES or MAKE-A-TEN pairs first',
        'Add those two numbers, then add the third',
        'You can add in any order — pick the easiest!'
      ],
      defaultTags: ['three_addends','addition_strategy','make_ten']
    };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps).toHaveLength(3);                 // matches bullet count
    expect(steps[0].text).toBe(lesson.points[0]);  // text is the bullet verbatim
    expect(steps[1].text).toBe(lesson.points[1]);
    expect(steps[2].text).toBe(lesson.points[2]);
  });

  test('Close Enough Counts! has exactly 4 steps matching its 4 bullets', () => {
    const lesson = {
      id: 'u4l3', title: 'Close Enough Counts!',
      points: [
        'Round each number FIRST, then add or subtract',
        'Round to nearest 10: look at ones digit (5+ round up, 0-4 round down)',
        'Round to nearest 100: look at tens digit',
        'Estimates are CLOSE but not exact'
      ],
      defaultTags: ['estimation','rounding','reasonableness']
    };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps).toHaveLength(4);
    expect(steps.map(s => s.visualType)).toEqual([
      'roundFirst', 'roundNearest10', 'roundNearest100', 'roundCompare'
    ]);
    expect(steps[0].title).toMatch(/round/i);
    expect(steps[1].title).toMatch(/nearest/i);
    expect(steps[2].title).toMatch(/nearest/i);
  });

  test('three-addends visual pool is reordered to match lesson bullets', () => {
    const lesson = {
      id: 'u3l3', title: 'Add Three Numbers',
      points: ['Look for pairs first', 'Add those two, then add the third', 'You can add in any order']
    };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps[0].visualType).toBe('threePickPair');   // pair highlight
    expect(steps[1].visualType).toBe('threeAddLast');    // pair sum + add third
    expect(steps[2].visualType).toBe('threeEasyOrder');  // equivalent orderings
  });

  test('extra bullets beyond topic pool fall through to genericPoint', () => {
    const lesson = {
      id: 'fake', title: 'Big Rounding Lesson',
      points: [
        'Round each number first',
        'Round to nearest 10',
        'Round to nearest 100',
        'Estimates are close',
        'Bonus: estimation in real life'   // 5th bullet — no topic visual
      ]
    };
    const steps = _resolveKeyIdeaSteps(lesson, UNIT);
    expect(steps).toHaveLength(5);
    expect(steps[4].visualType).toBe('genericPoint');
  });

  test('threeEasyOrder builder renders non-empty HTML', () => {
    const html = _KI_BUILDERS.threeEasyOrder({
      color: '#4CAF50', nums: [4, 6, 3], grouped: '(4 + 6) + 3', result: 13
    });
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(40);
    expect(html).toContain('13');
  });
});

// =============================================================================
//  _stepHeadingFromPoint — title generator (verifies button-label quality)
// =============================================================================
describe('_stepHeadingFromPoint produces readable button labels', () => {
  test('lowercases ALL CAPS emphasis words', () => {
    expect(_stepHeadingFromPoint('Look for DOUBLES or MAKE-A-TEN pairs first', 0))
      .toBe('Look for doubles or make-a-ten pairs first');
  });
  test('cuts at colon (drops elaboration)', () => {
    expect(_stepHeadingFromPoint('Round to nearest 10: look at ones digit (5+ round up, 0-4 round down)', 0))
      .toBe('Round to nearest 10');
  });
  test('cuts at em-dash with spaces', () => {
    expect(_stepHeadingFromPoint('You can add in any order — pick the easiest!', 0))
      .toBe('You can add in any order');
  });
  test('cuts at comma when the lead-in is ≥3 words', () => {
    expect(_stepHeadingFromPoint('Round each number FIRST, then add or subtract', 0))
      .toBe('Round each number first');
  });
  test('keeps short bullets verbatim (drops trailing punctuation)', () => {
    expect(_stepHeadingFromPoint('Estimates are CLOSE but not exact', 0))
      .toBe('Estimates are close but not exact');
  });
  test('caps very long bullets with an ellipsis', () => {
    const long = 'This is a very long bullet that has lots of words and goes on and on and on without commas';
    const heading = _stepHeadingFromPoint(long, 0);
    expect(heading.split(/\s+/).length).toBeLessThanOrEqual(7);
    expect(heading.endsWith('…')).toBe(true);
  });
  test('falls back to "Step N" for empty input', () => {
    expect(_stepHeadingFromPoint('', 2)).toBe('Step 3');
    expect(_stepHeadingFromPoint(null, 0)).toBe('Step 1');
  });
});

// =============================================================================
//  _sanitizeKeyIdeaPoint — strips raw HTML/base64 out of titles + captions
//  and extracts coin metadata so the Key Idea modal never renders raw markup.
// =============================================================================
describe('_sanitizeKeyIdeaPoint strips raw markup and extracts coin metadata', () => {
  const PENNY_PNG = 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/' + 'A'.repeat(400);

  test('extracts coin label + value from <img data-coin data-label data-value>', () => {
    const raw = '<img src="' + PENNY_PNG + '" data-coin data-label="Penny" data-value="1 cent — Lincoln Memorial" style="width:72px">PENNY = 1 cent (copper color, Lincoln)';
    const out = _sanitizeKeyIdeaPoint(raw);
    expect(out.title).toBe('Penny = 1 cent');
    expect(out.text).not.toMatch(/<img|src=|data:image|base64/i);
    expect(out.text).toMatch(/PENNY/);
    expect(out.embedded).not.toBeNull();
    expect(out.embedded.kind).toBe('coin');
    expect(out.embedded.label).toBe('Penny');
    expect(out.embedded.html).toMatch(/^<img\b/);
  });

  test('coin variants — nickel/dime/quarter resolve to clean "Name = N cents" titles', () => {
    const mk = (label, value, suffix) =>
      '<img src="' + PENNY_PNG + '" data-coin data-label="' + label + '" data-value="' + value + '">' + suffix;

    expect(_sanitizeKeyIdeaPoint(mk('Nickel',  '5 cents — Jefferson',  'NICKEL = 5 cents')).title).toBe('Nickel = 5 cents');
    expect(_sanitizeKeyIdeaPoint(mk('Dime',    '10 cents — Roosevelt', 'DIME = 10 cents')).title).toBe('Dime = 10 cents');
    expect(_sanitizeKeyIdeaPoint(mk('Quarter', '25 cents — Washington','QUARTER = 25 cents')).title).toBe('Quarter = 25 cents');
  });

  test('non-coin plain text point passes through unchanged', () => {
    const out = _sanitizeKeyIdeaPoint('Always start at the ZERO end of the ruler');
    expect(out.title).toBe('Always start at the ZERO end of the ruler');
    expect(out.text).toBe('Always start at the ZERO end of the ruler');
    expect(out.embedded).toBeNull();
  });

  test('point with inline <svg> extracts it as embedded svg and strips from title/text', () => {
    const raw = '<svg width="100" height="40"><rect x="0" y="0" width="100" height="40"/></svg>Ruler example';
    const out = _sanitizeKeyIdeaPoint(raw);
    expect(out.title).not.toMatch(/<svg|<rect/);
    expect(out.title).toMatch(/Ruler example/i);
    expect(out.embedded).not.toBeNull();
    expect(out.embedded.kind).toBe('svg');
    expect(out.embedded.html).toMatch(/^<svg\b[\s\S]*<\/svg>$/);
  });

  test('strips embedded base64 even without a wrapping <img> tag', () => {
    const noisy = 'Look at this: data:image/png;base64,AAAAABBBBCCCC then the rest';
    const out = _sanitizeKeyIdeaPoint(noisy);
    expect(out.title).not.toMatch(/data:image|base64/i);
  });

  test('null / empty input is safe', () => {
    expect(_sanitizeKeyIdeaPoint(null)).toEqual({ title: '', text: '', embedded: null });
    expect(_sanitizeKeyIdeaPoint('')).toEqual({ title: '', text: '', embedded: null });
  });
});

// =============================================================================
//  _stepHeadingFromPoint — raw-HTML defense + dollar-style coin titles
// =============================================================================
describe('_stepHeadingFromPoint is defended against raw markup leaks', () => {
  test('returns a clean label when handed a raw <img> point (not "img src= ..." garbage)', () => {
    const raw = '<img src="data:image/png;base64,/9j/AAA" data-coin data-label="Penny" data-value="1 cent">PENNY = 1 cent';
    const title = _stepHeadingFromPoint(raw, 0);
    expect(title).not.toMatch(/<|>|src=|data:image|base64|img/i);
    expect(title).toBe('Penny = 1 cent');
  });

  test('"DOLLAR = 100 cents (gold color)" → "Dollar = 100 cents" (parens stripped, first letter capitalized)', () => {
    expect(_stepHeadingFromPoint('DOLLAR = 100 cents (gold color)', 4)).toBe('Dollar = 100 cents');
  });
});

// =============================================================================
//  Resolved Key Idea steps for "All About Coins" — end-to-end resolver check
// =============================================================================
describe('_resolveKeyIdeaSteps cleans coin lesson points and renders coin visuals', () => {
  const PENNY_PNG = 'data:image/png;base64,/9j/4AA' + 'A'.repeat(400);

  const COIN_LESSON = {
    id: 'u5l1',
    title: 'All About Coins',
    defaultTags: ['money', 'coins', 'coin_value'],
    points: [
      '<img src="' + PENNY_PNG + '" data-coin data-label="Penny" data-value="1 cent — Lincoln Memorial">PENNY = 1 cent (copper color, Lincoln)',
      '<img src="' + PENNY_PNG + '" data-coin data-label="Nickel" data-value="5 cents — Jefferson">NICKEL = 5 cents (silver, Jefferson)',
      '<img src="' + PENNY_PNG + '" data-coin data-label="Dime" data-value="10 cents — Roosevelt">DIME = 10 cents (smallest coin, Roosevelt)',
      '<img src="' + PENNY_PNG + '" data-coin data-label="Quarter" data-value="25 cents — Washington">QUARTER = 25 cents (largest, Washington)',
      'DOLLAR = 100 cents (gold color)'
    ],
    examples: []
  };
  const COIN_UNIT = { id: 'u5', color: '#00CC44' };

  test('5 coin steps with clean titles — no raw HTML/base64 anywhere', () => {
    const steps = _resolveKeyIdeaSteps(COIN_LESSON, COIN_UNIT);
    expect(steps).toHaveLength(5);
    const titles = steps.map(s => s.title);
    expect(titles).toEqual([
      'Penny = 1 cent',
      'Nickel = 5 cents',
      'Dime = 10 cents',
      'Quarter = 25 cents',
      'Dollar = 100 cents'
    ]);
    steps.forEach((s) => {
      expect(s.title).not.toMatch(/<|>|src=|data:image|base64|data-coin|data-label|data-value/i);
      expect(s.text).not.toMatch(/data:image|base64|data-coin|data-label|data-value/i);
    });
  });

  test('first 4 steps embed the actual coin <img> as the visual (customHtml), 5th uses topic visual or generic', () => {
    const steps = _resolveKeyIdeaSteps(COIN_LESSON, COIN_UNIT);
    [0, 1, 2, 3].forEach((i) => {
      expect(steps[i].visualType).toBe('customHtml');
      expect(steps[i].visual.html).toMatch(/^<div class="ki-coin-embed"><img\b/);
      expect(steps[i].visual.html).toMatch(/data-coin/);
    });
    // 5th step (dollar) has no <img> — the money-topic fallback emits a
    // single-coin moneyIdentify card so the visual area still shows a coin.
    expect(steps[4].visualType).toBe('moneyIdentify');
    expect(steps[4].visual.coins).toEqual([{ name: 'dollar', value: 100 }]);
  });
});

// =============================================================================
//  System-wide safety: no resolved step title contains raw HTML/base64
// =============================================================================
describe('No resolved Key Idea step title contains raw markup', () => {
  test('plain HTML point with no embedded coin still produces a clean title', () => {
    const lesson = {
      id: 'u7l1', title: 'How Long Is It?',
      defaultTags: ['measure'],
      points: [
        'Always start at the ZERO end of the ruler',
        '<svg width="100" height="40"><rect x="0" y="0" width="100" height="40"/></svg>Ruler example'
      ],
      examples: []
    };
    const steps = _resolveKeyIdeaSteps(lesson, { color: '#abc' });
    steps.forEach((s) => {
      expect(s.title).not.toMatch(/<|svg|rect/i);
    });
  });
});

// =============================================================================
//  Modal layering — the coin lightbox must render ABOVE the Key Idea modal so
//  tapping a coin photo inside the modal pops the lightbox forward, not behind.
//  This guards the z-index relationship at the CSS-variable source.
// =============================================================================
describe('Coin lightbox z-index layers above the Key Idea modal', () => {
  const CSS_PATH = path.join(__dirname, '..', 'src', 'styles.css');
  const css = fs.readFileSync(CSS_PATH, 'utf8');

  function readVar(name) {
    const m = css.match(new RegExp('--' + name + '\\s*:\\s*(\\d+)\\s*;'));
    return m ? Number(m[1]) : null;
  }

  test('--z-coin is defined and is a positive number', () => {
    const zCoin = readVar('z-coin');
    expect(zCoin).not.toBeNull();
    expect(zCoin).toBeGreaterThan(0);
  });

  test('--z-coin is GREATER than --z-modal (coin lightbox renders on top)', () => {
    const zCoin  = readVar('z-coin');
    const zModal = readVar('z-modal');
    expect(zModal).not.toBeNull();
    expect(zCoin).toBeGreaterThan(zModal);
  });

  test('.coin-lightbox uses position:fixed and full-viewport inset', () => {
    expect(css).toMatch(/\.coin-lightbox\s*\{[^}]*position\s*:\s*fixed[^}]*inset\s*:\s*0/);
  });

  test('.coin-lightbox uses var(--z-coin) for its z-index (no hardcoded value)', () => {
    expect(css).toMatch(/\.coin-lightbox\s*\{[^}]*z-index\s*:\s*var\(--z-coin\)/);
  });
});
