// ═════════════════════════════════════════════════════════════════════════════
//  KEY IDEA — Step-based Interactive Visual System
//
//  This module replaces the old "one big visual blob" Key Idea modal with a
//  step-list + step-visual pattern. Every lesson across K / G1 / G2 resolves
//  to a non-empty array of step objects via _resolveKeyIdeaSteps(lesson, unit).
//
//  Resolution precedence:
//    1. lesson.keyIdeaSteps   (author override; not used on day one)
//    2. _detectLessonTopic   → _KI_TOPIC_STEPS[topic](lesson, unit)
//    3. _keyIdeaStepsFromPoints (per-point fallback — always non-empty)
//
//  Each step has shape: { title, text, visualType, visual }
//  visualType is keyed into _KI_BUILDERS which renders the step's visual HTML.
//
//  External dependencies (defined in earlier-loaded bundle files):
//    - _escHtml          (util.js)
//    - drawNumberLine    (visuals.js)
//    - drawArray         (visuals.js)
//    - drawBase10        (visuals.js)
//    - drawComparison    (visuals.js)
//    - drawShapes        (visuals.js)
//
//  DOM contract: the modal at #key-idea-modal contains #ki-steplist (the
//  clickable buttons) and #ki-visual (the active step's visual area).
//  _renderKeyIdeaModal() populates both; _showKeyIdeaStep(idx) swaps ONLY
//  the visual area on click.
// ═════════════════════════════════════════════════════════════════════════════

// ── Module-scoped state ──────────────────────────────────────────────────────
// Cache the resolved step array between open and close so that a step click
// doesn't have to re-run the resolver (which would re-detect topic, re-shuffle
// any randomization, etc.).
let _KI_CURRENT_STEPS  = null;
let _KI_CURRENT_IDX    = 0;
let _KI_CURRENT_LESSON = null;
let _KI_CURRENT_UNIT   = null;

// ── Top-level resolver ───────────────────────────────────────────────────────
// Pipeline:
//   1. author override (lesson.keyIdeaSteps) — used as-is
//   2. topic match → topic generator returns ordered visual pool; resolver pairs
//      each lesson.points[i] with the i-th topic visual. STEP TITLES AND TEXT
//      ALWAYS COME FROM lesson.points so the modal matches the lesson page.
//      If a lesson has more points than the topic pool provides, the extras get
//      a genericPoint card. If the lesson has fewer points than the pool, only
//      the first points.length visuals are used (extras dropped).
//   3. fallback per-point — when no topic matched.
function _resolveKeyIdeaSteps(lesson, unit) {
  const u = unit || { color: '#6c5ce7' };
  if (!lesson || typeof lesson !== 'object') {
    return [{
      title: 'Key Idea', text: '',
      visualType: 'genericPoint',
      visual: { n: 1, text: '', color: u.color }
    }];
  }
  // 1. Author override
  if (Array.isArray(lesson.keyIdeaSteps) && lesson.keyIdeaSteps.length) {
    return lesson.keyIdeaSteps.map(function(s){ return _normalizeStep(s, lesson, u); });
  }
  // 2. Topic detection — pair topic visuals with lesson.points
  const topic = _detectLessonTopic(lesson);
  if (topic && typeof _KI_TOPIC_STEPS[topic] === 'function') {
    const points = Array.isArray(lesson.points) ? lesson.points.filter(Boolean) : [];
    try {
      const rawSteps = _KI_TOPIC_STEPS[topic](lesson, u);
      if (Array.isArray(rawSteps) && rawSteps.length) {
        // If the lesson has no points, keep the topic's natural steps as-is.
        if (!points.length) return rawSteps;
        return _alignStepsToPoints(rawSteps, points, lesson, u);
      }
    } catch (_e) {
      // Topic generator threw — fall through to fallback so the modal still works
    }
  }
  // 3. Per-point fallback
  return _keyIdeaStepsFromPoints(lesson, u);
}

// Pair every lesson bullet with a topic visual.
// - step.title and step.text come from the lesson's actual bullet (so the modal
//   wording mirrors the lesson-page bullets).
// - step.visualType + step.visual come from the topic's i-th rawStep.
// - When points.length > rawSteps.length, surplus points get a genericPoint card.
function _alignStepsToPoints(rawSteps, points, lesson, unit) {
  const color = (unit && unit.color) || '#6c5ce7';
  const ex0   = (Array.isArray(lesson.examples) && lesson.examples[0]) || null;
  return points.map(function(point, i) {
    // Sanitize first — strips any raw <img>/<svg>/base64 markup out of titles
    // and captions. Coin photos (with data-coin metadata) get extracted into
    // an `embedded` block so the resolver can render the actual coin image
    // in the visual area, not the raw markup as text.
    const clean = _sanitizeKeyIdeaPoint(point);
    const r = rawSteps[i];
    const isLast = i === points.length - 1;

    // Embedded coin photo → render it as the visual via customHtml. The title
    // and caption use the clean "Label = Value" form (no raw HTML leaks).
    if (clean.embedded && clean.embedded.kind === 'coin') {
      return {
        title:      _stepHeadingFromPoint(clean.title, i),
        text:       clean.text,
        visualType: 'customHtml',
        visual: { html: '<div class="ki-coin-embed">' + clean.embedded.html + '</div>' }
      };
    }
    // Embedded inline SVG → render it as the visual via customHtml.
    if (clean.embedded && clean.embedded.kind === 'svg') {
      return {
        title:      _stepHeadingFromPoint(clean.title, i),
        text:       clean.text,
        visualType: 'customHtml',
        visual: { html: '<div class="ki-svg-embed">' + clean.embedded.html + '</div>' }
      };
    }

    if (r && r.visualType && r.visualType !== 'genericPoint') {
      return {
        title:      _stepHeadingFromPoint(clean.title, i),
        text:       clean.text,
        visualType: r.visualType,
        visual:     r.visual
      };
    }
    // Fallback enhancement: when the rawSteps signal a money topic, surplus
    // points with a recognizable coin name (e.g. "DOLLAR = 100 cents") get a
    // single-coin SVG face instead of a plain text card.
    const isMoneyTopic = Array.isArray(rawSteps) && rawSteps.length &&
                        /^money/.test(rawSteps[0].visualType || '');
    if (isMoneyTopic) {
      const coin = _detectCoinFromText(clean.text);
      if (coin) {
        return {
          title:      _stepHeadingFromPoint(clean.title, i),
          text:       clean.text,
          visualType: 'moneyIdentify',
          visual:     { color: color, coins: [coin] }
        };
      }
    }
    // Surplus point — emit a genericPoint card. On the LAST surplus point,
    // inline the lesson's first worked example so the student lands on a
    // concrete instance.
    return {
      title:      _stepHeadingFromPoint(clean.title, i),
      text:       clean.text,
      visualType: 'genericPoint',
      visual: {
        n: i + 1,
        text: clean.text,
        color: color,
        exampleSvg:    (isLast && ex0 && ex0.s) ? ex0.s : null,
        examplePrompt: (isLast && ex0 && ex0.p) ? ex0.p : null,
        exampleAnswer: (isLast && ex0 && ex0.a) ? String(ex0.a).replace(/[✅✨]/g, '').trim() : null
      }
    };
  });
}

function _normalizeStep(step, lesson, unit) {
  if (!step || typeof step !== 'object') {
    return { title: 'Step', text: '', visualType: 'genericPoint',
             visual: { n: 1, text: '', color: unit.color } };
  }
  const visualType = step.visualType
                  || (typeof step.visual === 'string' ? 'customHtml' : 'genericPoint');
  return {
    title:      step.title || 'Step',
    text:       step.text  || '',
    visualType: visualType,
    visual:     (step.visual != null) ? step.visual : { text: step.text || '' }
  };
}

// ── Per-point fallback ───────────────────────────────────────────────────────
function _keyIdeaStepsFromPoints(lesson, unit) {
  const color  = (unit && unit.color) || '#6c5ce7';
  const points = Array.isArray(lesson.points) ? lesson.points.filter(Boolean) : [];
  const ex0    = (Array.isArray(lesson.examples) && lesson.examples[0]) || null;

  if (!points.length) {
    return [{
      title: 'Key Idea',
      text:  lesson.title || 'Key idea for this lesson',
      visualType: 'genericPoint',
      visual: { n: 1, text: lesson.title || '', color: color }
    }];
  }

  return points.map(function(p, i){
    const isLast = i === points.length - 1;
    const clean = _sanitizeKeyIdeaPoint(p);
    // Embedded coin/svg → render the visual via customHtml; clean title/caption.
    if (clean.embedded && clean.embedded.kind === 'coin') {
      return {
        title: _stepHeadingFromPoint(clean.title, i),
        text:  clean.text,
        visualType: 'customHtml',
        visual: { html: '<div class="ki-coin-embed">' + clean.embedded.html + '</div>' }
      };
    }
    if (clean.embedded && clean.embedded.kind === 'svg') {
      return {
        title: _stepHeadingFromPoint(clean.title, i),
        text:  clean.text,
        visualType: 'customHtml',
        visual: { html: '<div class="ki-svg-embed">' + clean.embedded.html + '</div>' }
      };
    }
    return {
      title: _stepHeadingFromPoint(clean.title, i),
      text:  clean.text,
      visualType: 'genericPoint',
      visual: {
        n: i + 1,
        text: clean.text,
        color: color,
        exampleSvg:    (isLast && ex0 && ex0.s) ? ex0.s : null,
        examplePrompt: (isLast && ex0 && ex0.p) ? ex0.p : null,
        exampleAnswer: (isLast && ex0 && ex0.a) ? String(ex0.a).replace(/[✅✨]/g, '').trim() : null
      }
    };
  });
}

// Detect a coin name + cent value in a plain-text bullet ("DOLLAR = 100 cents",
// "Penny = 1 cent"). Returns { name, value } where value is the integer cents,
// or null when the text doesn't look like a coin label. Used as a fallback when
// a money-topic point has no <img> source so we can still render an SVG coin
// face in the visual area (e.g. the $1 bullet in u5l1).
function _detectCoinFromText(s) {
  if (!s) return null;
  const COIN_VALUES = { penny: 1, pennies: 1, nickel: 5, nickels: 5, dime: 10, dimes: 10, quarter: 25, quarters: 25, dollar: 100, dollars: 100 };
  const m = String(s).match(/\b(penny|pennies|nickels?|dimes?|quarters?|dollars?)\b/i);
  if (!m) return null;
  const name = m[1].toLowerCase().replace(/(es|s|ies)$/, '').replace(/y$/, 'y');
  // Normalize: pennie → penny, nickels → nickel, etc.
  const key = name === 'pennie' ? 'penny' : name;
  const value = COIN_VALUES[key];
  if (typeof value !== 'number') return null;
  return { name: key, value: value };
}

// Sanitize a raw lesson point that may carry embedded HTML/SVG/image markup
// (e.g. <img data-coin data-label="Penny" data-value="1 cent">PENNY = 1 cent).
// Returns { title, text, embedded } where:
//   - `title` is a short clean label (no HTML, no base64).
//   - `text`  is the human-readable caption (also stripped of HTML/base64).
//   - `embedded` is { kind, html, label?, value? } when the point carries a
//     visual fragment the resolver can show in the visual area (currently
//     supports `kind:'coin'` for <img data-coin ...> and `kind:'svg'` for an
//     inline <svg>). This keeps raw <img>/<svg> markup OUT of step titles and
//     visual captions, and lets the resolver render the visual safely.
function _sanitizeKeyIdeaPoint(raw) {
  const s = String(raw == null ? '' : raw);
  // Fast path: no HTML/entity-reference AND no inline base64 data URL → return as-is.
  if (!/[<&]/.test(s) && !/data:[a-z]+\/[a-z0-9.+-]+;base64,/i.test(s)) {
    return { title: s, text: s, embedded: null };
  }

  let embedded = null;
  const imgMatch = s.match(/<img\b[^>]*>/i);
  if (imgMatch) {
    const tag = imgMatch[0];
    const isCoin = /\bdata-coin\b/i.test(tag) || /\bdata-label\s*=\s*["']/i.test(tag);
    if (isCoin) {
      const lbl = (tag.match(/\bdata-label\s*=\s*"([^"]*)"/i) || [])[1] || '';
      const val = (tag.match(/\bdata-value\s*=\s*"([^"]*)"/i) || [])[1] || '';
      embedded = { kind: 'coin', html: tag, label: lbl, value: val };
    } else {
      embedded = { kind: 'image', html: tag };
    }
  } else {
    const svgMatch = s.match(/<svg\b[\s\S]*?<\/svg>/i);
    if (svgMatch) embedded = { kind: 'svg', html: svgMatch[0] };
  }

  // Strip ALL HTML tags + base64 data URIs from text / title
  let stripped = s
    .replace(/<[^>]+>/g, ' ')
    .replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=\s]*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Prefer the extracted coin metadata for the title when present. Strip any
  // trailing decorative em-dash phrase ("1 cent — Lincoln Memorial" → "1 cent").
  if (embedded && embedded.kind === 'coin' && embedded.label) {
    const valClean = String(embedded.value || '').replace(/\s*—.*$/, '').trim();
    const coinTitle = valClean ? embedded.label + ' = ' + valClean : embedded.label;
    return { title: coinTitle, text: stripped || coinTitle, embedded: embedded };
  }
  // Non-coin embed: use the stripped text for both (falls through to existing
  // _stepHeadingFromPoint trimming for the title).
  return { title: stripped, text: stripped, embedded: embedded };
}

// Derive a short, child-friendly button title from a lesson bullet. The full
// bullet text still appears as step.text in the visual caption — this function
// just produces a compact label that fits in the step-list button.
function _stepHeadingFromPoint(point, i) {
  // Defense in depth: sanitize first so raw HTML/base64 never reaches a title.
  const sanitized = _sanitizeKeyIdeaPoint(point);
  const trimmed = sanitized.title.replace(/\s+/g, ' ').trim();
  if (!trimmed) return 'Step ' + (i + 1);
  // Strip leading non-alphanumeric (emojis, bullets)
  let txt = trimmed.replace(/^[^A-Za-z0-9]+/, '').trim();
  // Cut at colon — content after ":" is usually an elaboration
  txt = txt.replace(/:\s.*$/, '').trim();
  // Cut at em-dash (with spaces) — content after " — " is usually elaboration
  txt = txt.replace(/\s+—\s+.*$/, '').trim();
  // Cut at first comma if the lead-in is at least 3 words
  const commaIdx = txt.indexOf(',');
  if (commaIdx > 0) {
    const lead = txt.slice(0, commaIdx).trim();
    if (lead.split(/\s+/).length >= 3) txt = lead;
  }
  // Strip trailing parenthetical decoration "(gold color)" / "(Lincoln)"
  txt = txt.replace(/\s*\([^)]*\)\s*$/, '').trim();
  // Strip trailing punctuation
  txt = txt.replace(/[.!?]+$/, '').trim();
  // Lowercase ALL-CAPS emphasis words including hyphenated forms ("DOUBLES",
  // "MAKE-A-TEN"). Skips single-letter words like "I" / "A" to avoid mangling
  // pronouns and articles at sentence starts.
  txt = txt.replace(/\b[A-Z]+(?:[-_][A-Z]+)*\b/g, function(w){
    return w.length >= 2 ? w.toLowerCase() : w;
  });
  // Capitalize the first letter so labels read as titles ("dollar = 100 cents"
  // → "Dollar = 100 cents"). Idempotent for already-capitalized inputs.
  if (txt && /^[a-z]/.test(txt)) txt = txt.charAt(0).toUpperCase() + txt.slice(1);
  // Hard cap at 8 words; if longer, take first 6 + "…"
  const words = txt.split(/\s+/);
  if (words.length > 8) txt = words.slice(0, 6).join(' ') + '…';
  return txt || 'Step ' + (i + 1);
}

// ── Topic detection — order matters! ─────────────────────────────────────────
// Most-specific predicates first. The "regroup-sub before regroup-add" and
// "tally before pictograph" orderings prevent the previous miss-routing bugs.
// "array" is intentionally last among detectable topics so generic "rows of"
// language doesn't grab pictograph or word-problem lessons.
const _KI_TOPIC_RULES = [
  // ── Most-specific operations first ─────────────────────────────────────────
  ['regroup-sub',     /\bregroup.*subtract\b|\bsubtract.*regroup\b|\bborrow\b|trade\s+(a\s+)?ten\s+for|\btake[ -]?away\b.*\bregroup/],
  ['regroup-add',     /\bregroup\b|\bcarry(ing|\s+the\s+ten)?\b/],

  // subitize MUST match before make-ten — "Quick Looks" lessons say "Two full
  // rows make 10" which would otherwise trigger make-ten. Subitize regex is
  // very specific (only matches subitize/quick-look keywords), so no risk of
  // false positives by promoting it.
  ['subitize',        /\bsubitiz(e|ing|ation)\b|\bquick\s+look(s)?\b|\binstant(ly)?\s+recogniz/],

  // three-addends BEFORE doubles/make-ten — "Add Three Numbers" lessons mention
  // both doubles and make-ten as STRATEGIES but the lesson itself is about
  // grouping three addends.
  ['three-addends',   /\bthree\s+addends?\b|\badd\s+three\s+numbers?\b|\b3\s+addends?\b|\bthree[ -]number\s+sum|\bthree[ -]addend\b/],

  // make-ten lessons teach a specific decomposition strategy.
  ['make-ten',        /\bmake[ -]?(a\s+)?(10|ten)\b|\bmake_a_ten\b|\bmake\s+ten\b/],

  // doubles + near-doubles — specific addition strategy
  ['doubles',         /\bnear[ -]doubles?\b|\bdoubles?\s+(and|or)\s+near\b|\bdoubles?\s+fact(s)?\b|\bdoubles!?\b/],

  // ── Data / graphs (specific keywords before pictograph "graph") ────────────
  ['bar-graph',       /\bbar[ -]?graph(s)?\b|\bbar\s+chart\b|\bbar[ -]?type\s+graph(s)?\b/],
  ['tally',           /\btally(\s+marks?|\s+chart)?\b|\bcross[ -]stroke\b/],
  ['line-plot',       /\bline\s+plot(s)?\b/],
  ['pictograph',      /\bpictograph(s)?\b|\bpicture\s+graph(s)?\b/],

  // data analysis — must match BEFORE generic compare/sort
  ['data-conclusion', /\bdraw(ing)?\s+conclusions?\b|\binterpret(ing)?\s+(the\s+)?data\b|\bconclusions?\s+from\s+(the\s+)?data\b/],
  ['compare-data',    /\bcompar(e|ing)\s+data\b|\bcompare\s+(the\s+)?(graphs?|tables?|results?)\b/],
  ['sort-groups',     /\bsort(ing)?\s+(into\s+)?(groups?|categor)|\bsort\s+by\b|\bsorting\b/],

  // ── Domains with strong identifiers ────────────────────────────────────────
  ['financial-literacy',
                      /\bearn(ing|ed)?\s+(income|money|jobs?)\b|\bgoods\s+and\s+services\b|\bspend(ing)?\s+(and|or)\s+sav(ing)?\b|\bsav(ing|e)\s+(and|or|,)\s+(spend|give)|\bsave[, ]+spend[, ]+(and\s+)?give\b|\bcharitable\s+giv(ing)?\b|\bwants?\s+(vs?\.?|and|or)\s+needs?\b|\bneeds?\s+(vs?\.?|and|or)\s+wants?\b|\bfinancial\s+liter/],

  // symmetry BEFORE fraction — symmetry lessons mention "halves" in "fold so
  // both halves match"; fraction would otherwise steal them.
  ['symmetry',        /\bsymmetr(y|ic|ical)\b|\bline(s)?\s+of\s+symmetry\b|\bmirror\s+(shape|line|image)|\breflect(ion|ed)?\b.*\bshape\b/],

  ['fraction',        /\bfractions?\b|\b(equal|fair)\s+parts?\b|\bhalves?\b|\bthirds?\b|\bfourths?\b|\bquarters?\s+of\b|\bnumerator\b/],

  // money — DROPPED standalone "quarter(s)" because it triggered on "(also
  // called quarters)" in fraction lessons. Coin-context keywords remain.
  ['money',           /\bcoins?\b|\bpenny\b|\bpennies\b|\bnickel(s)?\b|\bdime(s)?\b|\bdollar(s)?\b|counting_coins/],
  ['time',            /\btell(ing)?\s+time\b|\bread\s+(the\s+)?clock\b|\bhour\s+hand\b|\bo['']clock\b|\bhalf[ -]past\b|\bwhat\s+time\b|\btime\s+(is|to\s+the)\b/],

  // rounding / estimation (G2 — was the only pure fallback)
  ['rounding',        /\bround(ing)?\s+(to|each|the|up|down|numbers?)\b|\bnearest\s+(10|ten|100|hundred)\b|\bestimat(e|ion|ing)\b|\bclose\s+enough\b|\breasonable(ness)?\b/],

  ['tens-addition',   /\b(add(ing)?|sum)\s+multiples\s+of\s+(10|ten)\b|\bmultiples\s+of\s+(10|ten)\b|\badd\s+(by\s+)?(10|tens)\b/],
  ['skip-count',      /\bskip[ -]count(ing)?\b|skip\s+by\s+\d|\b(count|skip)\s+by\s+(2|5|10)s?\b/],

  // count-back BEFORE count-on — fires only when the lesson is clearly
  // subtraction-flavored AND mentions counting back. Pure "Count Backward"
  // (counting recital, not subtraction) still resolves to count-on.
  // EXCLUSION (rule[2]): if the lesson ALSO covers count up/on/forward (e.g.
  // "Count Up & Count Back" which teaches BOTH directions), skip count-back so
  // the lesson resolves to count-on (which can show forward jumps).
  ['count-back',      /\b(subtract\w*|subtraction|take[ -]?away|minus)\b[\s\S]{0,200}\b(count\s+back|count\s+down|countback)\b|\b(count\s+back|count\s+down)\b[\s\S]{0,200}\b(subtract\w*|take[ -]?away|minus)\b/,
                      /\bcount\s+(on|up|forward(s)?)\b|count_on\b/],

  ['count-on',        /\bcount\s*-?\s*(on|forward(s)?|up|back(ward(s)?)?)\b|count_on|count_back|\bcounting\s+on\b/],
  ['number-line-add', /\bnumber\s*line\b.*\b(add|sum|plus|\+)\b|\b(add|sum|plus)\b.*\bnumber\s*line\b/],

  // ── Number sense ───────────────────────────────────────────────────────────
  // next-number BEFORE compare — "missing number in patterns" lessons say
  // "one less than" which would match compare otherwise.
  ['next-number',     /\bmissing\s+number(s)?\b|\bcomes\s+(before|after|next)\b|\bnumber\s+pattern(s)?\b|\bpattern.{0,40}blank\b|\bblank.{0,40}pattern\b|\bone\s+more.{0,40}one\s+less\b/],

  ['compare',         /\bcompar(e|ing|ison)\s+(numbers?|sets?)\b|\b(greater|less)\s+than\b|\bgreater_less_equal\b|\b[<>]\b|\bmore,?\s+less\b|\bmore\s+and\s+less\b/],
  ['place-value',     /\bplace\s+value\b|\btens?\s+and\s+ones?\b|\bhundreds?\b.*\btens?\b|\bbig\s+numbers\b|\bexpand(ed)?\s+form\b|\bgroups\s+of\s+ten\b/],

  // equal-sharing BEFORE number-bond — division/sharing lessons mention "fact
  // families" (multiplication ↔ division), which would otherwise be eaten by
  // number-bond's fact_families rule.
  ['equal-sharing',   /\bshar(e|ing)\s+equally\b|\bequal\s+shar(e|ing)\b|\bdivision\b|\bdivid(e|ing|ed)\b|÷|division_foundations|sharing_equally|\bsplit(ting)?\s+into\s+equal\s+groups\b/],

  ['number-bond',     /\bnumber\s+bond(s)?\b|\bpart-?part-?whole\b|\bfact\s+famil(y|ies)\b|fact_families|\bcompose\b.*\bdecompose\b|\bcompose\s+(and|&)\s+decompose\b|\bdecompose\b/],
  ['ten-frame',       /\bten[ -]frame(s)?\b|\bfiv(e)?[ -]frame\b/],

  // ── Story / word problems (broad — placed after specific topics) ───────────
  ['story-problem',   /\b(word|story)\s+problem(s)?\b|\bjoin\s+(and|&)\s+separate\b|\bexplain\s+(your\s+)?(thinking|math|answer)\b|\bmath\s+stor(y|ies)\b|\bproblem[ -]solv/],

  // ── Geometry / measurement (already specific) ──────────────────────────────
  ['shape',           /\b(2d|3d|flat|solid)\s+shapes?\b|\bsides?\s*(and|&)\s*corners?\b|\bgeometry\b|\bidentify\s+(the\s+)?shape\b/],
  ['measure',         /\bmeasure(ment|ing)?\b|\blength\b|\bheight\b|\bweight\b|\bcapacity\b/],

  // ── Generic counting ───────────────────────────────────────────────────────
  ['counting',        /\bcount(ing)?\s+to\s+\d+|\bcount(ing)?\s+from\b|\bread\s+(and|&)\s+represent\b|\brepresent\s+(11|12|13|14|15|16|17|18|19|20|teen)/],

  // ── Array LAST ─────────────────────────────────────────────────────────────
  ['array',           /\barrays?\b|\brepeated\s+addition\b|\bequal\s+groups?\b|\b\d\s*rows?\s+of\s+\d/]
];

function _detectLessonTopic(lesson) {
  if (!lesson) return null;
  const lid    = String(lesson.id    || '').toLowerCase();
  const title  = String(lesson.title || '').toLowerCase();
  const pts    = (Array.isArray(lesson.points)      ? lesson.points      : []).join(' ').toLowerCase();
  const tags   = (Array.isArray(lesson.defaultTags) ? lesson.defaultTags : []).join(' ').toLowerCase();
  const blob   = lid + ' | ' + title + ' | ' + pts + ' | ' + tags;
  for (let i = 0; i < _KI_TOPIC_RULES.length; i++) {
    const rule = _KI_TOPIC_RULES[i];
    if (!rule[1].test(blob)) continue;
    // Optional exclusion regex at rule[2]: skip the rule if blob matches it.
    if (rule[2] && rule[2].test(blob)) continue;
    return rule[0];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: extract first add/subtract pair from lesson examples so the topic
//  generators can adapt to the lesson's actual numbers instead of hard-coding.
//  Returns { a, b, op } or null. op: '+' | '-'.
// ─────────────────────────────────────────────────────────────────────────────
function _extractFirstOpFromLesson(lesson, preferOp) {
  if (!lesson) return null;
  const sources = [];
  if (Array.isArray(lesson.examples)) lesson.examples.forEach(function(e){ if(e && e.p) sources.push(String(e.p)); });
  if (Array.isArray(lesson.practice)) lesson.practice.forEach(function(e){ if(e && e.q) sources.push(String(e.q)); });
  if (Array.isArray(lesson.qBank))    lesson.qBank.slice(0, 4).forEach(function(e){ if(e && e.t) sources.push(String(e.t)); });
  const re = preferOp === '-'
    ? /(\d{1,4})\s*[-−]\s*(\d{1,4})/
    : preferOp === '+'
    ? /(\d{1,4})\s*\+\s*(\d{1,4})/
    : /(\d{1,4})\s*([+\-−])\s*(\d{1,4})/;
  for (let i = 0; i < sources.length; i++) {
    const m = sources[i].match(re);
    if (m) {
      const a = +m[1], b = +(preferOp ? m[2] : m[3]);
      const op = preferOp || (m[2] === '+' ? '+' : '-');
      if (!isNaN(a) && !isNaN(b)) return { a: a, b: b, op: op };
    }
  }
  return null;
}

// ── Topic step-set generators ────────────────────────────────────────────────
// Each returns 3–6 step objects. Numbers are pulled from lesson content when
// possible; otherwise canonical defaults that match the lesson curriculum.
const _KI_TOPIC_STEPS = {
  'pictograph': function(lesson, unit) {
    const color = unit.color;
    const key = 2;  // canonical: ★ = 2
    const a = 3, b = 5;
    return [
      { title: 'Read the key',     text: 'Each picture stands for a number. Here ★ = ' + key + '.',
        visualType: 'pictographKey',     visual: { color: color, symbol: '★', value: key } },
      { title: 'Count the pictures', text: 'Count how many stars are in each row.',
        visualType: 'pictographCount',   visual: { color: color, symbol: '★', rows: [{ label: 'Red', count: a }, { label: 'Blue', count: b }] } },
      { title: 'Find each row total', text: 'Multiply the count by the key value to get each row total.',
        visualType: 'pictographRowTotal', visual: { color: color, symbol: '★', key: key, rows: [{ label: 'Red', count: a, total: a*key }, { label: 'Blue', count: b, total: b*key }] } },
      { title: 'Compare the totals', text: 'Subtract the smaller total from the bigger one.',
        visualType: 'pictographCompare', visual: { color: color, left: { label: 'Blue', value: b*key }, right: { label: 'Red', value: a*key }, diff: (b-a)*key } }
    ];
  },

  'number-line-add': function(lesson, unit) {
    const color = unit.color;
    const op = _extractFirstOpFromLesson(lesson, '+');
    const a = op ? op.a : 26;
    const b = op ? op.b : 19;
    const tens = Math.floor(b / 10) * 10;
    const ones = b - tens;
    const mid  = a + tens;
    const end  = a + b;
    const min  = a;
    const max  = end;
    // Build ticks: start, multiples of 10, end
    const ticks = [a, mid, end];
    if (a + 10 !== mid && a + 5 < mid) ticks.splice(1, 0, a + Math.floor((mid - a) / 2));
    const tStart   = { color: color, cfg: { min: min, max: max, ticks: ticks, mark: a } };
    const tBreak   = { color: color, a: a, b: b, tens: tens, ones: ones };
    const tJumpT   = { color: color, cfg: { min: min, max: max, ticks: ticks, mark: a, jumps: [{ from: a, to: mid, label: '+' + tens }] } };
    const tJumpO   = { color: color, cfg: { min: min, max: max, ticks: ticks, mark: a, jumps: [{ from: a, to: mid, label: '+' + tens }, { from: mid, to: end, label: '+' + ones }] } };
    const tLand    = { color: color, cfg: { min: min, max: max, ticks: ticks, mark: a, endMark: end, jumps: [{ from: a, to: mid, label: '+' + tens }, { from: mid, to: end, label: '+' + ones }] }, a: a, b: b, sum: end };
    return [
      { title: 'Start at ' + a,            text: 'Find ' + a + ' on the number line. That is where we begin.',
        visualType: 'numberLineStart',     visual: tStart },
      { title: 'Break ' + b + ' apart',    text: 'Split ' + b + ' into ' + tens + ' and ' + ones + ' so each jump is easy.',
        visualType: 'numberLineBreak',     visual: tBreak },
      { title: 'Jump +' + tens,            text: 'From ' + a + ' jump forward ' + tens + '. You land on ' + mid + '.',
        visualType: 'numberLineJumpTens',  visual: tJumpT },
      { title: 'Jump +' + ones,            text: 'From ' + mid + ' jump forward ' + ones + ' more.',
        visualType: 'numberLineJumpOnes',  visual: tJumpO },
      { title: 'Land on ' + end,           text: a + ' + ' + b + ' = ' + end + '.',
        visualType: 'numberLineLand',      visual: tLand }
    ];
  },

  'regroup-add': function(lesson, unit) {
    const color = unit.color;
    const op = _extractFirstOpFromLesson(lesson, '+');
    let a = op ? op.a : 47, b = op ? op.b : 36;
    // Ensure the example actually requires regrouping
    if ((a % 10) + (b % 10) < 10) { a = 47; b = 36; }
    const onesSum = (a % 10) + (b % 10);
    const onesDigit = onesSum % 10;
    const carry = Math.floor(onesSum / 10);
    const tensSum = Math.floor(a/10) + Math.floor(b/10) + carry;
    const sum = a + b;
    const base = { color: color, a: a, b: b, onesSum: onesSum, onesDigit: onesDigit, carry: carry, tensSum: tensSum, sum: sum };
    return [
      { title: 'Line up columns',  text: 'Stack ' + a + ' and ' + b + ' so the ones are above the ones, tens above tens.',
        visualType: 'regroupAddSetup',  visual: { phase: 'setup',  ...base } },
      { title: 'Add the ones',     text: (a%10) + ' + ' + (b%10) + ' = ' + onesSum + '. That is more than 9, so regroup.',
        visualType: 'regroupAddOnes',   visual: { phase: 'ones',   ...base } },
      { title: 'Carry the ten',    text: 'Write the ones digit (' + onesDigit + ') and carry 1 ten to the tens column.',
        visualType: 'regroupAddCarry',  visual: { phase: 'carry',  ...base } },
      { title: 'Add the tens',     text: Math.floor(a/10) + ' + ' + Math.floor(b/10) + ' + 1 = ' + tensSum + '.',
        visualType: 'regroupAddTens',   visual: { phase: 'tens',   ...base } },
      { title: 'Read the answer',  text: a + ' + ' + b + ' = ' + sum + '.',
        visualType: 'regroupAddRead',   visual: { phase: 'read',   ...base } }
    ];
  },

  'regroup-sub': function(lesson, unit) {
    const color = unit.color;
    const op = _extractFirstOpFromLesson(lesson, '-');
    let a = op ? op.a : 91, b = op ? op.b : 47;
    if (a < b || (a % 10) >= (b % 10)) { a = 91; b = 47; }
    const aTens = Math.floor(a/10), aOnes = a % 10;
    const bTens = Math.floor(b/10), bOnes = b % 10;
    const newOnes = aOnes + 10;
    const newTens = aTens - 1;
    const onesDiff = newOnes - bOnes;
    const tensDiff = newTens - bTens;
    const diff = a - b;
    const base = { color: color, a: a, b: b, aTens: aTens, aOnes: aOnes, bTens: bTens, bOnes: bOnes,
                   newOnes: newOnes, newTens: newTens, onesDiff: onesDiff, tensDiff: tensDiff, diff: diff };
    return [
      { title: 'Line up columns',     text: 'Stack ' + a + ' over ' + b + ' so ones are above ones.',
        visualType: 'regroupSubSetup',     visual: { phase: 'setup', ...base } },
      { title: 'Check the ones',      text: aOnes + ' is not enough to subtract ' + bOnes + '. We need more ones.',
        visualType: 'regroupSubCheckOnes', visual: { phase: 'check', ...base } },
      { title: 'Borrow one ten',      text: aTens + ' tens becomes ' + newTens + ' tens. ' + aOnes + ' ones becomes ' + newOnes + ' ones.',
        visualType: 'regroupSubBorrow',    visual: { phase: 'borrow', ...base } },
      { title: 'Subtract the ones',   text: newOnes + ' − ' + bOnes + ' = ' + onesDiff + '.',
        visualType: 'regroupSubOnes',      visual: { phase: 'ones', ...base } },
      { title: 'Subtract the tens',   text: newTens + ' − ' + bTens + ' = ' + tensDiff + '.',
        visualType: 'regroupSubTens',      visual: { phase: 'tens', ...base } },
      { title: 'Read the answer',     text: a + ' − ' + b + ' = ' + diff + '.',
        visualType: 'regroupSubRead',      visual: { phase: 'read', ...base } }
    ];
  },

  'array': function(lesson, unit) {
    const color = unit.color;
    // Try "N rows of M" or "N x M" in lesson content
    let rows = 5, cols = 4;
    const blob = ((lesson.examples || []).map(function(e){return (e.p||'')+' '+(e.a||'');}).join(' ') + ' ' + (lesson.points||[]).join(' '));
    const m1 = blob.match(/(\d+)\s*rows?\s+of\s+(\d+)/i);
    const m2 = blob.match(/(\d+)\s*[x×]\s*(\d+)/i);
    if (m1) { rows = +m1[1]; cols = +m1[2]; }
    else if (m2) { rows = +m2[1]; cols = +m2[2]; }
    const total = rows * cols;
    const sum = new Array(rows).fill(cols).join(' + ');
    return [
      { title: 'Count the rows',       text: 'There are ' + rows + ' rows.',
        visualType: 'arrayRows',       visual: { color: color, rows: rows, cols: cols, highlightRows: 'all' } },
      { title: 'Count per row',        text: 'Each row has ' + cols + ' in it.',
        visualType: 'arrayPerRow',     visual: { color: color, rows: rows, cols: cols, highlightFirstRow: true } },
      { title: 'Repeated addition',    text: sum + ' = ' + total + '.',
        visualType: 'arrayRepeatedAdd', visual: { color: color, rows: rows, cols: cols, expr: sum, total: total } },
      { title: 'Find the total',       text: rows + ' rows × ' + cols + ' = ' + total + '.',
        visualType: 'arrayTotal',      visual: { color: color, rows: rows, cols: cols, total: total } }
    ];
  },

  'ten-frame': function(lesson, unit) {
    const color = unit.color;
    const filled = 7;  // canonical example
    return [
      { title: 'Fill the frame',  text: 'A ten frame has 10 boxes. Each dot fills one box.',
        visualType: 'tenFrameFill',         visual: { color: color, filled: filled } },
      { title: 'Count the dots',   text: 'There are ' + filled + ' dots in the frame.',
        visualType: 'tenFrameCountFilled',  visual: { color: color, filled: filled } },
      { title: 'Count the empty',  text: 'There are ' + (10 - filled) + ' empty boxes left.',
        visualType: 'tenFrameCountEmpty',   visual: { color: color, filled: filled } },
      { title: 'Total is 10',      text: filled + ' + ' + (10 - filled) + ' = 10. A full frame is always 10.',
        visualType: 'tenFrameTotal',        visual: { color: color, filled: filled } }
    ];
  },

  'number-bond': function(lesson, unit) {
    const color = unit.color;
    const whole = 8, p1 = 3, p2 = 5;
    return [
      { title: 'The whole',        text: 'The number on top is the whole — here, ' + whole + '.',
        visualType: 'bondWhole',     visual: { color: color, whole: whole, p1: null, p2: null } },
      { title: 'One part',         text: 'Break the whole into parts. One part is ' + p1 + '.',
        visualType: 'bondPart1',     visual: { color: color, whole: whole, p1: p1,   p2: null } },
      { title: 'The other part',   text: 'The other part is ' + p2 + '.',
        visualType: 'bondPart2',     visual: { color: color, whole: whole, p1: p1,   p2: p2 } },
      { title: 'Fact family',      text: p1 + ' + ' + p2 + ' = ' + whole + ' and ' + whole + ' − ' + p1 + ' = ' + p2 + '.',
        visualType: 'bondFactFamily',visual: { color: color, whole: whole, p1: p1,   p2: p2 } }
    ];
  },

  'place-value': function(lesson, unit) {
    const color = unit.color;
    const h = 2, t = 3, o = 4;  // 234
    return [
      { title: 'Hundreds',     text: h + ' hundreds means ' + (h*100) + '.',
        visualType: 'pvHundreds',visual: { hundreds: h } },
      { title: 'Tens',         text: t + ' tens means ' + (t*10) + '.',
        visualType: 'pvTens',    visual: { hundreds: h, tens: t } },
      { title: 'Ones',         text: o + ' ones means ' + o + '.',
        visualType: 'pvOnes',    visual: { hundreds: h, tens: t, ones: o } },
      { title: 'Write the number', text: 'The number is ' + (h*100 + t*10 + o) + '.',
        visualType: 'pvWrite',   visual: { hundreds: h, tens: t, ones: o, color: color } }
    ];
  },

  'compare': function(lesson, unit) {
    const color = unit.color;
    const left = 47, right = 52;
    return [
      { title: 'Look at the tens',  text: left + ' has ' + Math.floor(left/10) + ' tens. ' + right + ' has ' + Math.floor(right/10) + ' tens.',
        visualType: 'compareTens',    visual: { left: left, right: right, phase: 'tens', color: color } },
      { title: 'Look at the ones',  text: 'If the tens are the same, look at the ones.',
        visualType: 'compareOnes',    visual: { left: left, right: right, phase: 'ones', color: color } },
      { title: 'Decide bigger',     text: right + ' is bigger than ' + left + '.',
        visualType: 'compareDecide',  visual: { left: left, right: right, color: color } },
      { title: 'Write the symbol',  text: left + ' < ' + right + '. The open side points to the bigger number.',
        visualType: 'compareSymbol',  visual: { left: left, right: right, symbol: '<', color: color } }
    ];
  },

  'bar-graph': function(lesson, unit) {
    const color = unit.color;
    const bars = [{ label: 'Dogs', value: 8 }, { label: 'Cats', value: 5 }, { label: 'Fish', value: 3 }];
    return [
      { title: 'Read the axis',  text: 'The numbers on the side show how many.',
        visualType: 'barAxis',     visual: { color: color, bars: bars } },
      { title: 'Read each bar',  text: 'Look at the top of each bar to see its value.',
        visualType: 'barReadBar',  visual: { color: color, bars: bars } },
      { title: 'Compare the bars', text: 'The tallest bar is the biggest group.',
        visualType: 'barCompare',  visual: { color: color, bars: bars } },
      { title: 'Answer the question', text: 'Dogs has the most (8). Cats and fish together = 8.',
        visualType: 'barAnswer',   visual: { color: color, bars: bars, answer: 'Dogs has the most' } }
    ];
  },

  'tally': function(lesson, unit) {
    const color = unit.color;
    return [
      { title: 'One stroke = 1',   text: 'Each tally mark stands for 1.',
        visualType: 'tallyOne',     visual: { color: color, count: 3 } },
      { title: 'Five = bundle',    text: 'Every 5th tally crosses the other 4. A bundle = 5.',
        visualType: 'tallyFive',    visual: { color: color } },
      { title: 'Count by 5s',      text: 'Count the bundles by 5s: 5, 10, 15.',
        visualType: 'tallyGroups',  visual: { color: color, bundles: 3 } },
      { title: 'Add leftovers',    text: '3 bundles + 2 leftover = 15 + 2 = 17.',
        visualType: 'tallyLeftovers', visual: { color: color, bundles: 3, leftover: 2, total: 17 } }
    ];
  },

  'count-on': function(lesson, unit) {
    const color = unit.color;
    const start = 7, jump = 4;
    const end = start + jump;
    const ticks = [];
    for (let i = start - 1; i <= end + 1; i++) ticks.push(i);
    return [
      { title: 'Start at the bigger', text: 'Begin at ' + start + ' so we have less to count.',
        visualType: 'countOnStart',  visual: { color: color, cfg: { min: start - 1, max: end + 1, ticks: ticks, mark: start } } },
      { title: 'Count forward',      text: 'Jump forward ' + jump + ' times, one at a time.',
        visualType: 'countOnForward',visual: { color: color, cfg: { min: start - 1, max: end + 1, ticks: ticks, mark: start, jumps: _makeUnitJumps(start, jump) } } },
      { title: 'Land on the answer', text: start + ' + ' + jump + ' = ' + end + '.',
        visualType: 'countOnLand',   visual: { color: color, cfg: { min: start - 1, max: end + 1, ticks: ticks, mark: start, endMark: end, jumps: _makeUnitJumps(start, jump) } } }
    ];
  },

  'skip-count': function(lesson, unit) {
    const color = unit.color;
    const skip = 5;
    const start = 0, end = 25;
    const ticks = [0, 5, 10, 15, 20, 25];
    return [
      { title: 'Pick the skip', text: 'Skip count by ' + skip + 's: 5, 10, 15, 20, 25 …',
        visualType: 'skipPick',  visual: { color: color, cfg: { min: start, max: end, ticks: ticks, mark: start }, skip: skip } },
      { title: 'Jump by ' + skip, text: 'Each jump moves forward ' + skip + ' places.',
        visualType: 'skipJump',  visual: { color: color, cfg: { min: start, max: end, ticks: ticks, mark: start, jumps: _makeSkipJumps(start, end, skip) }, skip: skip } },
      { title: 'Land',          text: 'After ' + ((end - start) / skip) + ' jumps you land on ' + end + '.',
        visualType: 'skipLand',  visual: { color: color, cfg: { min: start, max: end, ticks: ticks, mark: start, endMark: end, jumps: _makeSkipJumps(start, end, skip) } } }
    ];
  },

  'fraction': function(lesson, unit) {
    const color = unit.color;
    const denom = 4, shaded = 3;
    return [
      { title: 'The whole',    text: 'Start with one whole shape.',
        visualType: 'fractionWhole', visual: { color: color, denom: 1, shaded: 0 } },
      { title: 'Equal parts',  text: 'Split it into ' + denom + ' equal parts.',
        visualType: 'fractionParts', visual: { color: color, denom: denom, shaded: 0 } },
      { title: 'Shade some',   text: 'Shade ' + shaded + ' out of ' + denom + ' parts.',
        visualType: 'fractionShaded',visual: { color: color, denom: denom, shaded: shaded } },
      { title: 'Write the fraction', text: shaded + '/' + denom + ' is shaded.',
        visualType: 'fractionWrite', visual: { color: color, denom: denom, shaded: shaded } }
    ];
  },

  'time': function(lesson, unit) {
    const color = unit.color;
    const h = 3, m = 30;
    return [
      { title: 'Read the hour hand',  text: 'The short hand points to the hour. Here it is between ' + h + ' and ' + (h+1) + ', so the hour is ' + h + '.',
        visualType: 'timeHourHand', visual: { color: color, h: h, m: m, focus: 'hour' } },
      { title: 'Read the minute hand', text: 'The long hand points to ' + (m/5) + ', which counts ' + m + ' minutes.',
        visualType: 'timeMinuteHand',visual: { color: color, h: h, m: m, focus: 'minute' } },
      { title: 'Read the time',       text: 'Time is ' + h + ':' + String(m).padStart(2, '0') + '.',
        visualType: 'timeRead',     visual: { color: color, h: h, m: m, focus: 'both' } }
    ];
  },

  'money': function(lesson, unit) {
    const color = unit.color;
    const coins = [{ name: 'quarter', value: 25 }, { name: 'dime', value: 10 }, { name: 'nickel', value: 5 }, { name: 'penny', value: 1 }];
    const total = coins.reduce(function(s,c){return s+c.value;}, 0);
    return [
      { title: 'Identify each coin', text: 'Quarter = 25¢, dime = 10¢, nickel = 5¢, penny = 1¢.',
        visualType: 'moneyIdentify', visual: { color: color, coins: coins } },
      { title: 'Add the values',     text: 'Add from the biggest: 25 + 10 + 5 + 1.',
        visualType: 'moneyAdd',      visual: { color: color, coins: coins } },
      { title: 'Find the total',     text: 'Total = ' + total + '¢.',
        visualType: 'moneyTotal',    visual: { color: color, coins: coins, total: total } }
    ];
  },

  'measure': function(lesson, unit) {
    const color = unit.color;
    const units = 6;
    return [
      { title: 'Line up zero', text: 'Place the object so it starts at 0.',
        visualType: 'measureLineUp', visual: { color: color, units: units } },
      { title: 'Count the units', text: 'Count one for each whole tick mark.',
        visualType: 'measureCount',  visual: { color: color, units: units } },
      { title: 'Read the length', text: 'The object is ' + units + ' units long.',
        visualType: 'measureRead',   visual: { color: color, units: units } }
    ];
  },

  'shape': function(lesson, unit) {
    const color = unit.color;
    const shape = 'triangle';
    return [
      { title: 'Count the sides',   text: 'A triangle has 3 straight sides.',
        visualType: 'shapeSides',   visual: { color: color, shape: shape, sides: 3 } },
      { title: 'Count the corners', text: 'A triangle has 3 corners (vertices).',
        visualType: 'shapeCorners', visual: { color: color, shape: shape, corners: 3 } },
      { title: 'Name the shape',    text: '3 sides + 3 corners = triangle.',
        visualType: 'shapeName',    visual: { color: color, shape: shape, name: 'Triangle' } }
    ];
  },

  // ── COUNTING (counting-to-N lessons) ─────────────────────────────────────
  'counting': function(lesson, unit) {
    const color = unit.color;
    // Try to extract target N from title (e.g. "Counting to 10" -> N=10)
    const titleMatch = (lesson.title || '').match(/\b(\d+)\b/);
    const n = titleMatch ? Math.min(20, Math.max(3, +titleMatch[1])) : 5;
    const sample = Math.min(n, 10);  // visual shows at most 10 dots
    return [
      { title: 'Start at one',      text: 'Begin with the first object. Say "one".',
        visualType: 'countingStart', visual: { color: color, n: sample, highlight: 0 } },
      { title: 'Touch each one',    text: 'Touch each object once as you count.',
        visualType: 'countingTouch', visual: { color: color, n: sample } },
      { title: 'Say the numbers',   text: 'Say one number for each object: 1, 2, 3 …',
        visualType: 'countingSay',   visual: { color: color, n: sample } },
      { title: 'The last number tells how many', text: 'The last number you say is the total.',
        visualType: 'countingTotal', visual: { color: color, n: sample, total: sample } }
    ];
  },

  // ── SUBITIZE (quick looks / instant pattern recognition) ─────────────────
  'subitize': function(lesson, unit) {
    const color = unit.color;
    return [
      { title: 'Look at the dots', text: 'Take a quick look — no counting one by one.',
        visualType: 'subitizeLook',    visual: { color: color, pattern: 'fivePlusTwo' } },
      { title: 'Find a pattern',   text: 'Look for parts you already know — like 5 and 2.',
        visualType: 'subitizePattern', visual: { color: color, pattern: 'fivePlusTwo' } },
      { title: 'Add the parts',    text: '5 + 2 = 7.',
        visualType: 'subitizeSplit',   visual: { color: color, parts: [5, 2], total: 7 } },
      { title: 'Say the total',    text: 'There are 7 dots.',
        visualType: 'subitizeTotal',   visual: { color: color, total: 7 } }
    ];
  },

  // ── STORY-PROBLEM (word problems / story problems) ───────────────────────
  'story-problem': function(lesson, unit) {
    const color = unit.color;
    return [
      { title: 'Read the story',         text: 'There are 6 birds. 2 more come.',
        visualType: 'storyRead',     visual: { color: color, text: 'There are 6 birds. 2 more come.' } },
      { title: 'Find what you know',     text: 'Numbers in the story: 6 birds, 2 more birds.',
        visualType: 'storyKnown',    visual: { color: color, items: [{ label: 'birds at start', value: 6 }, { label: 'birds that come', value: 2 }] } },
      { title: 'What is the question?',  text: 'How many birds are there now?',
        visualType: 'storyQuestion', visual: { color: color, question: 'How many birds in all?' } },
      { title: 'Add or subtract?',       text: 'More birds came, so we ADD.',
        visualType: 'storyOp',       visual: { color: color, op: '+', reason: 'more came' } },
      { title: 'Solve and check',        text: '6 + 2 = 8 birds.',
        visualType: 'storySolve',    visual: { color: color, a: 6, op: '+', b: 2, result: 8, unit: 'birds' } }
    ];
  },

  // ── FINANCIAL LITERACY ───────────────────────────────────────────────────
  'financial-literacy': function(lesson, unit) {
    const color = unit.color;
    const title = (lesson.title || '').toLowerCase();
    // Lightly adapt the third step's category emphasis to the lesson focus.
    const focusEarn   = /earn/.test(title);
    const focusSpend  = /spend|charit|giv/.test(title);
    const focusSave   = /sav/.test(title);
    const focusWant   = /want|need/.test(title);
    const focusGoods  = /goods|service/.test(title);
    let ess = 'all';
    if (focusEarn) ess = 'earn';
    else if (focusSpend) ess = 'spend';
    else if (focusSave) ess = 'save';
    return [
      { title: 'Look at the choice', text: 'Read the situation carefully.',
        visualType: 'flChoice',   visual: { color: color, prompt: focusWant ? 'You see a toy at the store.' : focusGoods ? 'A neighbor mows your lawn.' : 'Mom gives you $5 for chores.' } },
      { title: 'Need or want?',      text: 'A NEED is something we must have. A WANT is nice to have.',
        visualType: 'flNeedWant', visual: { color: color, focus: focusWant ? 'want' : focusGoods ? 'service' : 'need' } },
      { title: 'Earn, Save, or Spend?', text: 'You can earn money, save it, or spend it.',
        visualType: 'flESS',      visual: { color: color, focus: ess } },
      { title: 'Pick the best',      text: 'Make a smart choice and explain why.',
        visualType: 'flDecide',   visual: { color: color, focus: ess } }
    ];
  },

  // ── DOUBLES + near doubles ───────────────────────────────────────────────
  'doubles': function(lesson, unit) {
    const color = unit.color;
    const n = 6;  // canonical: 6 + 6 = 12, 6 + 7 = 13
    return [
      { title: 'Find the double',     text: 'Look for two equal groups: ' + n + ' + ' + n + '.',
        visualType: 'doublesEqual',  visual: { color: color, n: n } },
      { title: 'Add the double',      text: n + ' + ' + n + ' = ' + (n + n) + '.',
        visualType: 'doublesSum',    visual: { color: color, n: n, sum: n + n } },
      { title: 'Near double — add 1', text: 'For ' + n + ' + ' + (n + 1) + ', take the double then add one more.',
        visualType: 'doublesNear',   visual: { color: color, n: n, extra: 1 } },
      { title: 'Say the answer',      text: n + ' + ' + (n + 1) + ' = ' + (n + n + 1) + '.',
        visualType: 'doublesAnswer', visual: { color: color, a: n, b: n + 1, sum: n + n + 1 } }
    ];
  },

  // ── MAKE-A-TEN strategy ──────────────────────────────────────────────────
  'make-ten': function(lesson, unit) {
    const color = unit.color;
    const a = 8, b = 5;  // canonical: 8 + 5 → 8 + 2 + 3 → 10 + 3 = 13
    const need = 10 - a;
    const leftover = b - need;
    const sum = a + b;
    return [
      { title: 'Find the 10-friend',     text: a + ' needs ' + need + ' more to make 10.',
        visualType: 'makeTenFind',   visual: { color: color, a: a, b: b, need: need } },
      { title: 'Break apart the other',  text: 'Split ' + b + ' into ' + need + ' and ' + leftover + '.',
        visualType: 'makeTenBreak',  visual: { color: color, b: b, need: need, leftover: leftover } },
      { title: 'Make 10',                text: a + ' + ' + need + ' = 10.',
        visualType: 'makeTenForm',   visual: { color: color, a: a, need: need } },
      { title: 'Add the leftovers',      text: '10 + ' + leftover + ' = ' + sum + '.',
        visualType: 'makeTenAdd',    visual: { color: color, leftover: leftover, sum: sum } },
      { title: 'Say the answer',         text: a + ' + ' + b + ' = ' + sum + '.',
        visualType: 'makeTenAnswer', visual: { color: color, a: a, b: b, sum: sum } }
    ];
  },

  // ── LINE PLOT ────────────────────────────────────────────────────────────
  'line-plot': function(lesson, unit) {
    const color = unit.color;
    const plot = { labels: [3, 4, 5, 6, 7], counts: [2, 4, 3, 1, 2] };
    return [
      { title: 'Read the labels',    text: 'The numbers along the bottom show the values.',
        visualType: 'lpLabels',  visual: { color: color, plot: plot, focus: 'labels' } },
      { title: 'Count the Xs',       text: 'Each X stands for 1. Count the Xs above each number.',
        visualType: 'lpCount',   visual: { color: color, plot: plot, focus: 'all' } },
      { title: 'Compare the counts', text: 'The tallest stack has the most. The shortest has the fewest.',
        visualType: 'lpCompare', visual: { color: color, plot: plot } },
      { title: 'Answer the question',text: 'Most kids picked 4. That stack has 4 Xs.',
        visualType: 'lpAnswer',  visual: { color: color, plot: plot, answer: '4 is the most popular' } }
    ];
  },

  // ── TENS-ADDITION (add multiples of 10) ──────────────────────────────────
  'tens-addition': function(lesson, unit) {
    const color = unit.color;
    const aT = 3, bT = 4;
    const a = aT * 10, b = bT * 10;
    return [
      { title: 'Look at the tens',  text: a + ' has ' + aT + ' tens. ' + b + ' has ' + bT + ' tens.',
        visualType: 'taTens',  visual: { color: color, aT: aT, bT: bT } },
      { title: 'Add the tens',      text: aT + ' tens + ' + bT + ' tens = ' + (aT + bT) + ' tens.',
        visualType: 'taAdd',   visual: { color: color, aT: aT, bT: bT, sumT: aT + bT } },
      { title: 'No ones to keep',   text: 'These are multiples of 10, so there are 0 ones.',
        visualType: 'taOnes',  visual: { color: color, sumT: aT + bT, ones: 0 } },
      { title: 'Write the total',   text: a + ' + ' + b + ' = ' + (a + b) + '.',
        visualType: 'taTotal', visual: { color: color, a: a, b: b, sum: a + b } }
    ];
  },

  // ── DATA-CONCLUSION ──────────────────────────────────────────────────────
  'data-conclusion': function(lesson, unit) {
    const color = unit.color;
    const bars = [{ label: 'Apples', value: 6 }, { label: 'Bananas', value: 9 }, { label: 'Pears', value: 3 }];
    return [
      { title: 'Read the graph',     text: 'Look at each bar and see how many.',
        visualType: 'dcRead',    visual: { color: color, bars: bars } },
      { title: 'Find biggest / smallest', text: 'Bananas has the most (9). Pears has the fewest (3).',
        visualType: 'dcBig',     visual: { color: color, bars: bars, biggestIdx: 1, smallestIdx: 2 } },
      { title: 'Compare the data',   text: '9 − 3 = 6 more bananas than pears.',
        visualType: 'dcCompare', visual: { color: color, bars: bars, diff: 6 } },
      { title: 'Pick the conclusion',text: 'Conclusion: bananas is most popular.',
        visualType: 'dcAnswer',  visual: { color: color, bars: bars, conclusion: 'Most kids chose bananas.' } }
    ];
  },

  // ── SORT-GROUPS ──────────────────────────────────────────────────────────
  'sort-groups': function(lesson, unit) {
    const color = unit.color;
    return [
      { title: 'Look at each item',  text: 'Look carefully at every object.',
        visualType: 'sortItems', visual: { color: color, items: ['red', 'blue', 'red', 'blue', 'red'] } },
      { title: 'Pick a rule',        text: 'Sort by color: red and blue.',
        visualType: 'sortRule',  visual: { color: color, rule: 'color' } },
      { title: 'Group matching items', text: 'Put all the reds together, all the blues together.',
        visualType: 'sortPlace', visual: { color: color, groups: [{ label: 'Red', items: ['red','red','red'] }, { label: 'Blue', items: ['blue','blue'] }] } },
      { title: 'Count each group',   text: '3 red, 2 blue.',
        visualType: 'sortCount', visual: { color: color, groups: [{ label: 'Red', count: 3 }, { label: 'Blue', count: 2 }] } }
    ];
  },

  // ── ROUNDING / ESTIMATION ────────────────────────────────────────────────
  // Steps tuned to the 4 actual Key Idea points of G2 u4l3 "Close Enough Counts!":
  //   1. Round each number FIRST, then add or subtract
  //   2. Round to nearest 10: look at ones digit (5+ round up, 0-4 round down)
  //   3. Round to nearest 100: look at tens digit
  //   4. Estimates are CLOSE but not exact
  'rounding': function(lesson, unit) {
    const color = unit.color;
    return [
      { title: 'Round first',
        text:  'Round each number before you add or subtract.',
        visualType: 'roundFirst',
        visual: { color: color, a: 47, b: 32, roundedA: 50, roundedB: 30, sum: 80 } },

      { title: 'Nearest 10',
        text:  'To round to the nearest 10, look at the ones digit.',
        visualType: 'roundNearest10',
        visual: { color: color, target: 47, low: 40, high: 50, halfway: 45, rounded: 50,
                  digit: 7, place: 'ones', direction: 'UP' } },

      { title: 'Nearest 100',
        text:  'To round to the nearest 100, look at the tens digit.',
        visualType: 'roundNearest100',
        visual: { color: color, target: 347, low: 300, high: 400, halfway: 350, rounded: 300,
                  digit: 4, place: 'tens', direction: 'DOWN' } },

      { title: 'Close, not exact',
        text:  'An estimate is close to the answer, but not exact.',
        visualType: 'roundCompare',
        visual: { color: color, a: 47, b: 32, exact: 79, estimate: 80 } }
    ];
  },

  // ── THREE-ADDENDS ────────────────────────────────────────────────────────
  // Visual pool ordered to match the typical lesson bullet order:
  //   1. "Look for DOUBLES or MAKE-A-TEN pairs first"  → highlight pair
  //   2. "Add those two numbers, then add the third"   → pair sum + add third
  //   3. "You can add in any order — pick the easiest" → equivalent orderings
  'three-addends': function(lesson, unit) {
    const color = unit.color;
    const a = 4, b = 6, c = 3;  // 4+6=10 (easy pair), then +3 = 13
    return [
      { title: 'Look for the pair', text: 'Find DOUBLES or MAKE-A-TEN pairs first.',
        visualType: 'threePickPair',  visual: { color: color, nums: [a, b, c], pairIdx: [0, 1], pairSum: a + b } },
      { title: 'Add the pair then the third', text: a + ' + ' + b + ' = ' + (a + b) + ', then ' + (a + b) + ' + ' + c + ' = ' + (a + b + c) + '.',
        visualType: 'threeAddLast',   visual: { color: color, a: a + b, b: c, sum: a + b + c } },
      { title: 'Pick the easiest order', text: 'You can add in any order — pick the easiest.',
        visualType: 'threeEasyOrder', visual: { color: color, nums: [a, b, c], grouped: '(' + a + ' + ' + b + ') + ' + c, result: a + b + c } }
    ];
  },

  // ── SYMMETRY ─────────────────────────────────────────────────────────────
  'symmetry': function(lesson, unit) {
    const color = unit.color;
    return [
      { title: 'What is symmetry?', text: 'A shape has SYMMETRY if you can fold it so both halves match exactly.',
        visualType: 'symFoldTest', visual: { color: color, shape: 'square' } },
      { title: 'Find one line',     text: 'A square folds left/right and the halves match — that\'s 1 line of symmetry.',
        visualType: 'symLine',     visual: { color: color, shape: 'square', lines: 1 } },
      { title: 'Count all the lines', text: 'A square has 4 lines of symmetry: vertical, horizontal, and both diagonals.',
        visualType: 'symCount',    visual: { color: color, shape: 'square', lines: 4 } },
      { title: 'Check for no symmetry', text: 'An L-shape can\'t fold so sides match. It has NO line of symmetry.',
        visualType: 'symNone',     visual: { color: color, shape: 'L' } }
    ];
  },

  // ── EQUAL-SHARING (division as repeated sharing) ─────────────────────────
  'equal-sharing': function(lesson, unit) {
    const color = unit.color;
    const total = 12, groups = 4, per = total / groups;
    return [
      { title: 'Look at the total', text: 'We have ' + total + ' cookies to share equally.',
        visualType: 'shareTotal',    visual: { color: color, total: total } },
      { title: 'Choose number of groups', text: 'Share among ' + groups + ' friends — ' + groups + ' plates.',
        visualType: 'shareIntoGroups', visual: { color: color, total: total, groups: groups } },
      { title: 'Deal one at a time', text: 'Give each friend one cookie at a time until they\'re all gone.',
        visualType: 'shareDeal',     visual: { color: color, total: total, groups: groups, per: per } },
      { title: 'Write the equation', text: total + ' ÷ ' + groups + ' = ' + per + '. Each friend gets ' + per + '.',
        visualType: 'shareEquation', visual: { color: color, total: total, groups: groups, per: per } }
    ];
  },

  // ── NEXT-NUMBER (missing number in a pattern) ────────────────────────────
  'next-number': function(lesson, unit) {
    const color = unit.color;
    // Canonical: 3, 4, ?, 6, 7  → missing is 5
    const seq = [3, 4, null, 6, 7];
    const blankIdx = 2, answer = 5;
    return [
      { title: 'See the pattern',  text: 'Some numbers are in a row with one number missing.',
        visualType: 'nnShow',  visual: { color: color, seq: seq, blankIdx: blankIdx } },
      { title: 'Look before',      text: 'Before the blank is ' + seq[blankIdx - 1] + '. The missing number is one MORE.',
        visualType: 'nnBefore', visual: { color: color, seq: seq, blankIdx: blankIdx } },
      { title: 'Look after',       text: 'After the blank is ' + seq[blankIdx + 1] + '. The missing number is one LESS.',
        visualType: 'nnAfter',  visual: { color: color, seq: seq, blankIdx: blankIdx } },
      { title: 'Fill the blank',   text: 'Both checks point to ' + answer + '.',
        visualType: 'nnFill',   visual: { color: color, seq: seq, blankIdx: blankIdx, answer: answer } }
    ];
  },

  // ── COUNT-BACK (subtraction by counting backward) ────────────────────────
  'count-back': function(lesson, unit) {
    const color = unit.color;
    // Find a subtraction example with a non-trivial subtrahend (b >= 2). Many
    // lessons mention identities like "8 − 0 = 8" as their first example which
    // would render zero jumps. Fall back to canonical 9 − 3 = 6 if needed.
    let a = 9, b = 3;
    if (Array.isArray(lesson.examples) || Array.isArray(lesson.practice) || Array.isArray(lesson.qBank)) {
      const sources = [];
      if (Array.isArray(lesson.examples)) lesson.examples.forEach(function(e){ if(e && e.p) sources.push(String(e.p)); });
      if (Array.isArray(lesson.practice)) lesson.practice.forEach(function(e){ if(e && e.q) sources.push(String(e.q)); });
      if (Array.isArray(lesson.qBank))    lesson.qBank.slice(0, 8).forEach(function(e){ if(e && e.t) sources.push(String(e.t)); });
      const re = /(\d{1,2})\s*[-−]\s*(\d{1,2})/g;
      for (const src of sources) {
        let m;
        while ((m = re.exec(src)) !== null) {
          const aa = +m[1], bb = +m[2];
          if (!isNaN(aa) && !isNaN(bb) && bb >= 2 && bb <= 5 && aa <= 20 && aa > bb) {
            a = aa; b = bb; break;
          }
        }
        if (b !== 3 || a !== 9) break;
      }
    }
    const end = a - b;
    const min = Math.max(0, end - 1);
    const max = a + 1;
    const ticks = [];
    for (let i = min; i <= max; i++) ticks.push(i);
    const jumps = [];
    for (let i = 0; i < b; i++) jumps.push({ from: a - i, to: a - i - 1, label: '−1' });
    return [
      { title: 'Start at ' + a,    text: 'Begin at ' + a + ' — that\'s the number you have.',
        visualType: 'countBackStart', visual: { color: color, cfg: { min: min, max: max, ticks: ticks, mark: a } } },
      { title: 'Count back ' + b,   text: 'Take away ' + b + ': jump back ' + b + ' time' + (b === 1 ? '' : 's') + '.',
        visualType: 'countBackJump',  visual: { color: color, cfg: { min: min, max: max, ticks: ticks, mark: a, jumps: jumps } } },
      { title: 'Land on ' + end,    text: a + ' − ' + b + ' = ' + end + '.',
        visualType: 'countBackLand',  visual: { color: color, cfg: { min: min, max: max, ticks: ticks, mark: a, endMark: end, jumps: jumps }, a: a, b: b, diff: end } }
    ];
  },

  // ── COMPARE-DATA ─────────────────────────────────────────────────────────
  'compare-data': function(lesson, unit) {
    const color = unit.color;
    const left = { label: 'Group A', count: 5, color: '#f59e0b' };
    const right = { label: 'Group B', count: 8, color: '#3b82f6' };
    return [
      { title: 'Count each group',  text: 'Group A has ' + left.count + '. Group B has ' + right.count + '.',
        visualType: 'cdCount', visual: { left: left, right: right } },
      { title: 'Find which is more', text: 'Group B is bigger.',
        visualType: 'cdMore',  visual: { left: left, right: right, biggerSide: 'right' } },
      { title: 'Compare with numbers', text: left.count + ' < ' + right.count + '. Group B has ' + (right.count - left.count) + ' more.',
        visualType: 'cdCompare', visual: { left: left, right: right, diff: right.count - left.count } },
      { title: 'Answer with words',  text: 'Group B has more. Group A has fewer.',
        visualType: 'cdAnswer',  visual: { left: left, right: right, biggerLabel: right.label } }
    ];
  }
};

// Small helpers shared by topic generators
function _makeUnitJumps(start, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ from: start + i, to: start + i + 1, label: '+1' });
  return out;
}
function _makeSkipJumps(start, end, skip) {
  const out = [];
  for (let v = start; v < end; v += skip) out.push({ from: v, to: v + skip, label: '+' + skip });
  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
//  Builder registry — each renders one step's visual area to an HTML string.
// ═════════════════════════════════════════════════════════════════════════════
const _KI_BUILDERS = {};

// ── Universal ────────────────────────────────────────────────────────────────
_KI_BUILDERS.genericPoint = function(cfg) {
  cfg = cfg || {};
  const n = cfg.n || 1;
  const color = cfg.color || '#6c5ce7';
  let h = ''
    + '<div class="ki-card" style="border-color:' + color + '33">'
    +   '<div class="ki-card-num" style="background:' + color + '">' + n + '</div>'
    +   '<div class="ki-card-text">' + _escHtml(cfg.text || '') + '</div>'
    + '</div>';
  if (cfg.exampleSvg) {
    h += '<div class="ki-card-ex"><div class="ki-card-ex-head">Example</div>'
      + (cfg.examplePrompt ? '<div class="ki-card-ex-q">' + _escHtml(cfg.examplePrompt) + '</div>' : '')
      + '<div class="ki-card-ex-svg">' + cfg.exampleSvg + '</div>'
      + (cfg.exampleAnswer ? '<div class="ki-card-ex-a">Answer: <strong>' + _escHtml(cfg.exampleAnswer) + '</strong></div>' : '')
      + '</div>';
  }
  return h;
};
_KI_BUILDERS.customHtml = function(cfg) {
  return (cfg && cfg.html) ? cfg.html : '';
};

// ── Pictograph ───────────────────────────────────────────────────────────────
function _kiRowStars(symbol, count, color, withCount) {
  let s = '<div class="ki-row"><span class="ki-row-stars" style="color:' + color + '">';
  for (let i = 0; i < count; i++) s += _escHtml(symbol) + ' ';
  s += '</span>';
  if (withCount) s += ' <span class="ki-row-meta">= ' + count + '</span>';
  s += '</div>';
  return s;
}
_KI_BUILDERS.pictographKey = function(cfg) {
  return '<div class="ki-pic-key" style="border-color:' + cfg.color + '33">'
    +    '<div class="ki-pic-key-label">Key</div>'
    +    '<div class="ki-pic-key-row"><span style="font-size:2em;color:' + cfg.color + '">' + _escHtml(cfg.symbol) + '</span><span class="ki-pic-key-eq">= ' + cfg.value + '</span></div>'
    +  '</div>';
};
_KI_BUILDERS.pictographCount = function(cfg) {
  let h = '<div class="ki-pic-rows">';
  cfg.rows.forEach(function(r){
    h += '<div class="ki-pic-line"><span class="ki-pic-lbl">' + _escHtml(r.label) + '</span>';
    h += '<span class="ki-pic-syms" style="color:' + cfg.color + '">';
    for (let i = 0; i < r.count; i++) h += _escHtml(cfg.symbol) + ' ';
    h += '</span>';
    h += '<span class="ki-pic-meta">count: ' + r.count + '</span></div>';
  });
  h += '</div>';
  return h;
};
_KI_BUILDERS.pictographRowTotal = function(cfg) {
  let h = '<div class="ki-pic-rows">';
  cfg.rows.forEach(function(r){
    h += '<div class="ki-pic-line"><span class="ki-pic-lbl">' + _escHtml(r.label) + '</span>';
    h += '<span class="ki-pic-syms" style="color:' + cfg.color + '">';
    for (let i = 0; i < r.count; i++) h += _escHtml(cfg.symbol) + ' ';
    h += '</span>';
    h += '<span class="ki-pic-meta"><strong>' + r.count + ' × ' + cfg.key + ' = ' + r.total + '</strong></span></div>';
  });
  h += '</div>';
  return h;
};
_KI_BUILDERS.pictographCompare = function(cfg) {
  return '<div class="ki-cmp">'
    +    '<div class="ki-cmp-row"><strong>' + _escHtml(cfg.left.label) + '</strong> shows ' + cfg.left.value + '</div>'
    +    '<div class="ki-cmp-row"><strong>' + _escHtml(cfg.right.label) + '</strong> shows ' + cfg.right.value + '</div>'
    +    '<div class="ki-cmp-eq" style="color:' + cfg.color + '">' + cfg.left.value + ' − ' + cfg.right.value + ' = <strong>' + cfg.diff + '</strong> more</div>'
    +  '</div>';
};

// ── Number-line add ─────────────────────────────────────────────────────────
function _wrapNL(html, caption) {
  return '<div class="ki-nl">' + html + (caption ? '<div class="ki-nl-caption">' + _escHtml(caption) + '</div>' : '') + '</div>';
}
_KI_BUILDERS.numberLineStart    = function(cfg) { return _wrapNL(drawNumberLine(cfg.cfg), 'Start: ' + cfg.cfg.mark); };
_KI_BUILDERS.numberLineBreak    = function(cfg) { return _wrapNL(drawNumberLine(cfg.cfg || { min: cfg.a, max: cfg.a + cfg.b, ticks: [cfg.a, cfg.a + cfg.tens, cfg.a + cfg.b], mark: cfg.a }), cfg.b + ' = ' + cfg.tens + ' + ' + cfg.ones); };
_KI_BUILDERS.numberLineJumpTens = function(cfg) { return _wrapNL(drawNumberLine(cfg.cfg), '+' + (cfg.cfg.jumps && cfg.cfg.jumps[0] ? (cfg.cfg.jumps[0].label.replace(/^\+/, '')) : '') + ' jump'); };
_KI_BUILDERS.numberLineJumpOnes = function(cfg) { return _wrapNL(drawNumberLine(cfg.cfg), 'Then one more jump'); };
_KI_BUILDERS.numberLineLand     = function(cfg) { return _wrapNL(drawNumberLine(cfg.cfg), cfg.a + ' + ' + cfg.b + ' = ' + cfg.sum); };

// ── Regroup add — vertical column SVG with phase highlighting ────────────────
function _renderRegroupAddSvg(cfg) {
  const a = cfg.a, b = cfg.b;
  const phase = cfg.phase;
  const aTens = Math.floor(a/10), aOnes = a % 10;
  const bTens = Math.floor(b/10), bOnes = b % 10;
  const accent = cfg.color || '#3949ab';
  const dim = '#94a3b8';
  const okGreen = '#2d7d46';
  const showCarry  = phase === 'carry' || phase === 'tens' || phase === 'read';
  const showOnes   = phase === 'ones'  || phase === 'carry' || phase === 'tens' || phase === 'read';
  const showTens   = phase === 'tens'  || phase === 'read';
  const isRead     = phase === 'read';

  const onesColor = phase === 'ones' ? accent : (showOnes ? '#1a2438' : dim);
  const tensColor = phase === 'tens' ? accent : (showTens ? okGreen : dim);
  const carryColor = phase === 'carry' ? accent : (showCarry ? okGreen : dim);
  const setupOpacity = phase === 'setup' ? '1' : '0.6';

  return '<svg viewBox="0 0 200 150" width="100%" style="max-width:300px;display:block;margin:0 auto" aria-hidden="true">'
    + '<text x="40" y="14" font-size="10" fill="#888" text-anchor="middle">tens</text>'
    + '<text x="80" y="14" font-size="10" fill="#888" text-anchor="middle">ones</text>'
    // Carried 1
    + '<text x="40" y="28" font-size="13" fill="' + carryColor + '" text-anchor="middle" font-weight="bold" opacity="' + (showCarry ? 1 : 0) + '">1</text>'
    // top row
    + '<text x="40" y="52" font-size="22" font-family="monospace" text-anchor="middle" opacity="' + setupOpacity + '">' + aTens + '</text>'
    + '<text x="80" y="52" font-size="22" font-family="monospace" text-anchor="middle" opacity="' + setupOpacity + '">' + aOnes + '</text>'
    // bottom row
    + '<text x="20" y="80" font-size="22" font-family="monospace" text-anchor="middle">+</text>'
    + '<text x="40" y="80" font-size="22" font-family="monospace" text-anchor="middle" opacity="' + setupOpacity + '">' + bTens + '</text>'
    + '<text x="80" y="80" font-size="22" font-family="monospace" text-anchor="middle" opacity="' + setupOpacity + '">' + bOnes + '</text>'
    + '<line x1="14" y1="88" x2="96" y2="88" stroke="#333" stroke-width="1.5"/>'
    // ones-sum highlight when phase === ones
    + (phase === 'ones'
        ? '<text x="80" y="116" font-size="22" font-family="monospace" text-anchor="middle" fill="' + accent + '" font-weight="bold">' + cfg.onesSum + '</text>'
          + '<text x="115" y="116" font-size="10" fill="' + accent + '">' + aOnes + ' + ' + bOnes + ' = ' + cfg.onesSum + ' (regroup!)</text>'
        : '')
    // Final result row
    + (showOnes && phase !== 'ones'
        ? '<text x="80" y="116" font-size="22" font-family="monospace" text-anchor="middle" fill="' + onesColor + '" font-weight="bold">' + cfg.onesDigit + '</text>'
        : '')
    + (showTens
        ? '<text x="40" y="116" font-size="22" font-family="monospace" text-anchor="middle" fill="' + tensColor + '" font-weight="bold">' + cfg.tensSum + '</text>'
        : '')
    + (isRead
        ? '<text x="115" y="116" font-size="11" fill="' + okGreen + '" font-weight="bold">= ' + cfg.sum + '</text>'
        : '')
    + '</svg>';
}
_KI_BUILDERS.regroupAddSetup = function(cfg){ return _renderRegroupAddSvg(cfg); };
_KI_BUILDERS.regroupAddOnes  = function(cfg){ return _renderRegroupAddSvg(cfg); };
_KI_BUILDERS.regroupAddCarry = function(cfg){ return _renderRegroupAddSvg(cfg); };
_KI_BUILDERS.regroupAddTens  = function(cfg){ return _renderRegroupAddSvg(cfg); };
_KI_BUILDERS.regroupAddRead  = function(cfg){ return _renderRegroupAddSvg(cfg); };

// ── Regroup sub — vertical column with borrow ────────────────────────────────
function _renderRegroupSubSvg(cfg) {
  const a = cfg.a, b = cfg.b;
  const phase = cfg.phase;
  const accent = cfg.color || '#c0392b';
  const okGreen = '#2d7d46';
  const dim = '#94a3b8';
  const showBorrow = phase === 'borrow' || phase === 'ones' || phase === 'tens' || phase === 'read';
  const showOnes   = phase === 'ones'   || phase === 'tens' || phase === 'read';
  const showTens   = phase === 'tens'   || phase === 'read';
  const isRead     = phase === 'read';
  const checkPhase = phase === 'check';

  return '<svg viewBox="0 0 200 160" width="100%" style="max-width:300px;display:block;margin:0 auto" aria-hidden="true">'
    + '<text x="40" y="14" font-size="10" fill="#888" text-anchor="middle">tens</text>'
    + '<text x="80" y="14" font-size="10" fill="#888" text-anchor="middle">ones</text>'
    // Borrowed scaffolding above the tens column
    + (showBorrow
        ? '<text x="40" y="36" font-size="13" fill="' + okGreen + '" text-anchor="middle" font-weight="bold">' + cfg.newTens + '</text>'
          + '<line x1="32" y1="50" x2="48" y2="42" stroke="#888" stroke-width="1"/>'  // strike-through old tens
          + '<text x="80" y="36" font-size="11" fill="' + okGreen + '" text-anchor="middle" font-weight="bold">' + cfg.newOnes + '</text>'
        : '')
    // top row (a)
    + '<text x="40" y="60" font-size="22" font-family="monospace" text-anchor="middle" opacity="' + (showBorrow ? 0.4 : 1) + '">' + cfg.aTens + '</text>'
    + '<text x="80" y="60" font-size="22" font-family="monospace" text-anchor="middle" opacity="' + (showBorrow ? 0.4 : 1) + '">' + cfg.aOnes + '</text>'
    // bottom row (b)
    + '<text x="20" y="90" font-size="22" font-family="monospace" text-anchor="middle">−</text>'
    + '<text x="40" y="90" font-size="22" font-family="monospace" text-anchor="middle">' + cfg.bTens + '</text>'
    + '<text x="80" y="90" font-size="22" font-family="monospace" text-anchor="middle">' + cfg.bOnes + '</text>'
    + '<line x1="14" y1="98" x2="96" y2="98" stroke="#333" stroke-width="1.5"/>'
    + (checkPhase
        ? '<text x="115" y="90" font-size="10" fill="' + accent + '">' + cfg.aOnes + ' < ' + cfg.bOnes + ' — borrow!</text>'
        : '')
    // Result row
    + (showOnes
        ? '<text x="80" y="126" font-size="22" font-family="monospace" text-anchor="middle" fill="' + (phase === 'ones' ? accent : okGreen) + '" font-weight="bold">' + cfg.onesDiff + '</text>'
        : '')
    + (showTens
        ? '<text x="40" y="126" font-size="22" font-family="monospace" text-anchor="middle" fill="' + (phase === 'tens' ? accent : okGreen) + '" font-weight="bold">' + cfg.tensDiff + '</text>'
        : '')
    + (isRead
        ? '<text x="115" y="126" font-size="11" fill="' + okGreen + '" font-weight="bold">= ' + cfg.diff + '</text>'
        : '')
    + '</svg>';
}
_KI_BUILDERS.regroupSubSetup     = function(cfg){ return _renderRegroupSubSvg(cfg); };
_KI_BUILDERS.regroupSubCheckOnes = function(cfg){ return _renderRegroupSubSvg(cfg); };
_KI_BUILDERS.regroupSubBorrow    = function(cfg){ return _renderRegroupSubSvg(cfg); };
_KI_BUILDERS.regroupSubOnes      = function(cfg){ return _renderRegroupSubSvg(cfg); };
_KI_BUILDERS.regroupSubTens      = function(cfg){ return _renderRegroupSubSvg(cfg); };
_KI_BUILDERS.regroupSubRead      = function(cfg){ return _renderRegroupSubSvg(cfg); };

// ── Array (dots grid) ────────────────────────────────────────────────────────
function _drawDotGrid(rows, cols, color, opts) {
  opts = opts || {};
  const W = 20 * cols + 20;
  const H = 20 * rows + 20;
  let dots = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const opacity = (opts.highlightFirstRow && r > 0) ? 0.25
                    : (opts.highlightRow != null && r !== opts.highlightRow) ? 0.25
                    : 1;
      dots += '<circle cx="' + (15 + c*20) + '" cy="' + (15 + r*20) + '" r="7" fill="' + color + '" opacity="' + opacity + '"/>';
    }
  }
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:240px;display:block;margin:0 auto" aria-hidden="true">' + dots + '</svg>';
}
_KI_BUILDERS.arrayRows = function(cfg) {
  return _drawDotGrid(cfg.rows, cfg.cols, cfg.color)
    + '<div class="ki-row-meta-center">' + cfg.rows + ' rows</div>';
};
_KI_BUILDERS.arrayPerRow = function(cfg) {
  return _drawDotGrid(cfg.rows, cfg.cols, cfg.color, { highlightFirstRow: true })
    + '<div class="ki-row-meta-center">' + cfg.cols + ' in each row</div>';
};
_KI_BUILDERS.arrayRepeatedAdd = function(cfg) {
  return _drawDotGrid(cfg.rows, cfg.cols, cfg.color)
    + '<div class="ki-row-meta-center"><strong>' + _escHtml(cfg.expr) + ' = ' + cfg.total + '</strong></div>';
};
_KI_BUILDERS.arrayTotal = function(cfg) {
  return _drawDotGrid(cfg.rows, cfg.cols, cfg.color)
    + '<div class="ki-row-meta-center"><strong>' + cfg.rows + ' × ' + cfg.cols + ' = ' + cfg.total + '</strong></div>';
};

// ── Ten-frame ────────────────────────────────────────────────────────────────
function _drawTenFrameSvg(filled, color) {
  // 2 rows × 5 cols
  let cells = '';
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const x = 10 + c * 30, y = 10 + r * 30;
      cells += '<rect x="' + x + '" y="' + y + '" width="28" height="28" fill="#fff" stroke="#1a2438" stroke-width="1.5" rx="3"/>';
      const idx = r * 5 + c;
      if (idx < filled) {
        cells += '<circle cx="' + (x + 14) + '" cy="' + (y + 14) + '" r="10" fill="' + color + '"/>';
      }
    }
  }
  return '<svg viewBox="0 0 180 80" width="100%" style="max-width:280px;display:block;margin:0 auto" aria-hidden="true">' + cells + '</svg>';
}
_KI_BUILDERS.tenFrameFill        = function(cfg){ return _drawTenFrameSvg(cfg.filled, cfg.color); };
_KI_BUILDERS.tenFrameCountFilled = function(cfg){ return _drawTenFrameSvg(cfg.filled, cfg.color) + '<div class="ki-row-meta-center">Filled: <strong>' + cfg.filled + '</strong></div>'; };
_KI_BUILDERS.tenFrameCountEmpty  = function(cfg){ return _drawTenFrameSvg(cfg.filled, cfg.color) + '<div class="ki-row-meta-center">Empty: <strong>' + (10 - cfg.filled) + '</strong></div>'; };
_KI_BUILDERS.tenFrameTotal       = function(cfg){ return _drawTenFrameSvg(cfg.filled, cfg.color) + '<div class="ki-row-meta-center"><strong>' + cfg.filled + ' + ' + (10 - cfg.filled) + ' = 10</strong></div>'; };

// ── Number bond ──────────────────────────────────────────────────────────────
function _drawBondSvg(whole, p1, p2, color) {
  const dim = '#cbd5e1';
  const p1Filled = p1 != null;
  const p2Filled = p2 != null;
  return '<svg viewBox="0 0 200 160" width="100%" style="max-width:280px;display:block;margin:0 auto" aria-hidden="true">'
    + '<circle cx="100" cy="36" r="26" fill="' + color + '" />'
    + '<text x="100" y="44" text-anchor="middle" font-size="22" font-weight="bold" fill="#fff">' + whole + '</text>'
    + '<line x1="88" y1="58" x2="50" y2="100" stroke="#1a2438" stroke-width="2"/>'
    + '<line x1="112" y1="58" x2="150" y2="100" stroke="#1a2438" stroke-width="2"/>'
    + '<circle cx="50" cy="120" r="22" fill="' + (p1Filled ? color : dim) + '"/>'
    + '<text x="50" y="128" text-anchor="middle" font-size="18" font-weight="bold" fill="#fff">' + (p1Filled ? p1 : '?') + '</text>'
    + '<circle cx="150" cy="120" r="22" fill="' + (p2Filled ? color : dim) + '"/>'
    + '<text x="150" y="128" text-anchor="middle" font-size="18" font-weight="bold" fill="#fff">' + (p2Filled ? p2 : '?') + '</text>'
    + '</svg>';
}
_KI_BUILDERS.bondWhole       = function(cfg){ return _drawBondSvg(cfg.whole, cfg.p1, cfg.p2, cfg.color); };
_KI_BUILDERS.bondPart1       = function(cfg){ return _drawBondSvg(cfg.whole, cfg.p1, cfg.p2, cfg.color); };
_KI_BUILDERS.bondPart2       = function(cfg){ return _drawBondSvg(cfg.whole, cfg.p1, cfg.p2, cfg.color); };
_KI_BUILDERS.bondFactFamily  = function(cfg){
  return _drawBondSvg(cfg.whole, cfg.p1, cfg.p2, cfg.color)
    + '<div class="ki-points-list">'
    +   '<div>' + cfg.p1 + ' + ' + cfg.p2 + ' = ' + cfg.whole + '</div>'
    +   '<div>' + cfg.p2 + ' + ' + cfg.p1 + ' = ' + cfg.whole + '</div>'
    +   '<div>' + cfg.whole + ' − ' + cfg.p1 + ' = ' + cfg.p2 + '</div>'
    +   '<div>' + cfg.whole + ' − ' + cfg.p2 + ' = ' + cfg.p1 + '</div>'
    + '</div>';
};

// ── Place value (reuses drawBase10) ──────────────────────────────────────────
_KI_BUILDERS.pvHundreds = function(cfg){ return '<div class="ki-vis-wrap">' + drawBase10({ hundreds: cfg.hundreds }) + '</div>'; };
_KI_BUILDERS.pvTens     = function(cfg){ return '<div class="ki-vis-wrap">' + drawBase10({ hundreds: cfg.hundreds, tens: cfg.tens }) + '</div>'; };
_KI_BUILDERS.pvOnes     = function(cfg){ return '<div class="ki-vis-wrap">' + drawBase10({ hundreds: cfg.hundreds, tens: cfg.tens, ones: cfg.ones }) + '</div>'; };
_KI_BUILDERS.pvWrite    = function(cfg){
  const n = (cfg.hundreds||0)*100 + (cfg.tens||0)*10 + (cfg.ones||0);
  return '<div class="ki-vis-wrap">' + drawBase10({ hundreds: cfg.hundreds, tens: cfg.tens, ones: cfg.ones }) + '</div>'
    + '<div class="ki-row-meta-center"><strong>Number: ' + n + '</strong></div>';
};

// ── Compare ──────────────────────────────────────────────────────────────────
_KI_BUILDERS.compareTens = function(cfg){
  const lT = Math.floor(cfg.left/10), rT = Math.floor(cfg.right/10);
  return '<div class="ki-cmp-side"><div class="ki-cmp-num" style="color:' + cfg.color + '">' + cfg.left + '</div>'
    + '<div class="ki-row-meta">' + lT + ' tens</div></div>'
    + '<div class="ki-cmp-side"><div class="ki-cmp-num" style="color:' + cfg.color + '">' + cfg.right + '</div>'
    + '<div class="ki-row-meta">' + rT + ' tens</div></div>';
};
_KI_BUILDERS.compareOnes = function(cfg){
  return '<div class="ki-cmp-side"><div class="ki-cmp-num" style="color:' + cfg.color + '">' + cfg.left + '</div>'
    + '<div class="ki-row-meta">ones: ' + (cfg.left % 10) + '</div></div>'
    + '<div class="ki-cmp-side"><div class="ki-cmp-num" style="color:' + cfg.color + '">' + cfg.right + '</div>'
    + '<div class="ki-row-meta">ones: ' + (cfg.right % 10) + '</div></div>';
};
_KI_BUILDERS.compareDecide = function(cfg){
  const bigger = cfg.left > cfg.right ? 'left' : (cfg.left < cfg.right ? 'right' : 'equal');
  return '<div class="ki-cmp">'
    + '<div class="ki-cmp-row' + (bigger==='left' ? ' big' : '') + '"><strong>' + cfg.left + '</strong></div>'
    + '<div class="ki-cmp-row' + (bigger==='right' ? ' big' : '') + '"><strong>' + cfg.right + '</strong></div>'
    + '<div class="ki-cmp-eq" style="color:' + cfg.color + '">Bigger: <strong>' + (cfg.left > cfg.right ? cfg.left : cfg.right) + '</strong></div>'
    + '</div>';
};
_KI_BUILDERS.compareSymbol = function(cfg){
  return '<div class="ki-cmp-sym"><span class="ki-cmp-num">' + cfg.left + '</span>'
    + '<span class="ki-cmp-op" style="color:' + cfg.color + '">' + _escHtml(cfg.symbol) + '</span>'
    + '<span class="ki-cmp-num">' + cfg.right + '</span></div>';
};

// ── Bar graph ────────────────────────────────────────────────────────────────
function _drawBarSvg(bars, color, opts) {
  opts = opts || {};
  const maxV = Math.max.apply(null, bars.map(function(b){return b.value;}));
  const W = 60 * bars.length + 40;
  const H = 140;
  const baseY = 110;
  const barW = 36;
  let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:300px;display:block;margin:0 auto" aria-hidden="true">';
  // Axis
  svg += '<line x1="20" y1="' + baseY + '" x2="' + (W - 10) + '" y2="' + baseY + '" stroke="#1a2438" stroke-width="1.5"/>';
  svg += '<line x1="20" y1="10" x2="20" y2="' + baseY + '" stroke="#1a2438" stroke-width="1.5"/>';
  // Y ticks
  for (let i = 1; i <= maxV; i++) {
    const y = baseY - i * (90 / maxV);
    svg += '<line x1="17" y1="' + y + '" x2="20" y2="' + y + '" stroke="#1a2438"/>';
    svg += '<text x="13" y="' + (y + 3) + '" font-size="9" text-anchor="end" fill="#1a2438" opacity="' + (opts.dimAxis ? 0.4 : 1) + '">' + i + '</text>';
  }
  // Bars
  bars.forEach(function(b, i){
    const h = b.value * (90 / maxV);
    const x = 30 + i * 60;
    const dim = opts.dimBars && opts.highlightIdx !== i;
    svg += '<rect x="' + x + '" y="' + (baseY - h) + '" width="' + barW + '" height="' + h + '" fill="' + color + '" opacity="' + (dim ? 0.3 : 1) + '"/>';
    if (opts.showValues) svg += '<text x="' + (x + barW/2) + '" y="' + (baseY - h - 3) + '" text-anchor="middle" font-size="10" font-weight="bold" fill="#1a2438">' + b.value + '</text>';
    svg += '<text x="' + (x + barW/2) + '" y="' + (baseY + 14) + '" text-anchor="middle" font-size="10" fill="#1a2438">' + _escHtml(b.label) + '</text>';
  });
  svg += '</svg>';
  return svg;
}
_KI_BUILDERS.barAxis    = function(cfg){ return _drawBarSvg(cfg.bars, cfg.color, { dimBars: true }); };
_KI_BUILDERS.barReadBar = function(cfg){ return _drawBarSvg(cfg.bars, cfg.color, { showValues: true }); };
_KI_BUILDERS.barCompare = function(cfg){
  const maxIdx = cfg.bars.reduce(function(mi, b, i, arr){ return b.value > arr[mi].value ? i : mi; }, 0);
  return _drawBarSvg(cfg.bars, cfg.color, { showValues: true, dimBars: true, highlightIdx: maxIdx })
    + '<div class="ki-row-meta-center">Tallest: <strong>' + _escHtml(cfg.bars[maxIdx].label) + '</strong></div>';
};
_KI_BUILDERS.barAnswer  = function(cfg){ return _drawBarSvg(cfg.bars, cfg.color, { showValues: true }) + '<div class="ki-row-meta-center"><strong>' + _escHtml(cfg.answer) + '</strong></div>'; };

// ── Tally ────────────────────────────────────────────────────────────────────
function _drawTallyStroke(x, color) {
  return '<line x1="' + x + '" y1="10" x2="' + x + '" y2="50" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/>';
}
function _drawTallyBundle(x, color) {
  let s = '';
  for (let i = 0; i < 4; i++) s += _drawTallyStroke(x + i*8, color);
  s += '<line x1="' + (x - 4) + '" y1="45" x2="' + (x + 32) + '" y2="15" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/>';
  return s;
}
_KI_BUILDERS.tallyOne = function(cfg){
  let strokes = '';
  for (let i = 0; i < (cfg.count || 3); i++) strokes += _drawTallyStroke(20 + i*16, cfg.color);
  return '<svg viewBox="0 0 100 60" width="100%" style="max-width:200px;display:block;margin:0 auto" aria-hidden="true">' + strokes + '</svg>'
    + '<div class="ki-row-meta-center">Each stroke = 1</div>';
};
_KI_BUILDERS.tallyFive = function(cfg){
  return '<svg viewBox="0 0 80 60" width="100%" style="max-width:200px;display:block;margin:0 auto" aria-hidden="true">' + _drawTallyBundle(20, cfg.color) + '</svg>'
    + '<div class="ki-row-meta-center">A bundle = 5</div>';
};
_KI_BUILDERS.tallyGroups = function(cfg){
  let s = '';
  for (let i = 0; i < cfg.bundles; i++) s += _drawTallyBundle(20 + i * 50, cfg.color);
  const W = cfg.bundles * 50 + 30;
  return '<svg viewBox="0 0 ' + W + ' 60" width="100%" style="max-width:' + (W*2) + 'px;display:block;margin:0 auto" aria-hidden="true">' + s + '</svg>'
    + '<div class="ki-row-meta-center">Count by 5s: ' + Array.from({length: cfg.bundles}, function(_,i){return (i+1)*5;}).join(', ') + '</div>';
};
_KI_BUILDERS.tallyLeftovers = function(cfg){
  let s = '';
  for (let i = 0; i < cfg.bundles; i++) s += _drawTallyBundle(20 + i * 50, cfg.color);
  const baseX = 20 + cfg.bundles * 50;
  for (let i = 0; i < cfg.leftover; i++) s += _drawTallyStroke(baseX + i*8, cfg.color);
  const W = cfg.bundles * 50 + cfg.leftover * 8 + 30;
  return '<svg viewBox="0 0 ' + W + ' 60" width="100%" style="max-width:' + (W*2) + 'px;display:block;margin:0 auto" aria-hidden="true">' + s + '</svg>'
    + '<div class="ki-row-meta-center"><strong>' + (cfg.bundles*5) + ' + ' + cfg.leftover + ' = ' + cfg.total + '</strong></div>';
};

// ── Count-on (reuses drawNumberLine) ─────────────────────────────────────────
_KI_BUILDERS.countOnStart   = function(cfg){ return _wrapNL(drawNumberLine(cfg.cfg), 'Start at ' + cfg.cfg.mark); };
_KI_BUILDERS.countOnForward = function(cfg){ return _wrapNL(drawNumberLine(cfg.cfg), 'Count forward, +1 at a time'); };
_KI_BUILDERS.countOnLand    = function(cfg){ return _wrapNL(drawNumberLine(cfg.cfg), 'Landed!'); };

// ── Skip count ──────────────────────────────────────────────────────────────
_KI_BUILDERS.skipPick = function(cfg){ return _wrapNL(drawNumberLine(cfg.cfg), 'Skip by ' + cfg.skip); };
_KI_BUILDERS.skipJump = function(cfg){ return _wrapNL(drawNumberLine(cfg.cfg), 'Each jump = +' + cfg.skip); };
_KI_BUILDERS.skipLand = function(cfg){ return _wrapNL(drawNumberLine(cfg.cfg), 'Total reached'); };

// ── Fraction ─────────────────────────────────────────────────────────────────
function _drawFractionSvg(denom, shaded, color) {
  const cx = 80, cy = 80, r = 60;
  if (denom <= 1) {
    return '<svg viewBox="0 0 160 160" width="100%" style="max-width:220px;display:block;margin:0 auto" aria-hidden="true">'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff" stroke="' + color + '" stroke-width="2"/></svg>';
  }
  let slices = '';
  const ang = (2 * Math.PI) / denom;
  for (let i = 0; i < denom; i++) {
    const a1 = -Math.PI/2 + i * ang;
    const a2 = -Math.PI/2 + (i + 1) * ang;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const largeArc = ang > Math.PI ? 1 : 0;
    const fill = i < shaded ? color : '#fff';
    slices += '<path d="M ' + cx + ' ' + cy + ' L ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2 + ' Z" fill="' + fill + '" stroke="#1a2438" stroke-width="1.5"/>';
  }
  return '<svg viewBox="0 0 160 160" width="100%" style="max-width:220px;display:block;margin:0 auto" aria-hidden="true">' + slices + '</svg>';
}
_KI_BUILDERS.fractionWhole  = function(cfg){ return _drawFractionSvg(1, 0, cfg.color); };
_KI_BUILDERS.fractionParts  = function(cfg){ return _drawFractionSvg(cfg.denom, 0, cfg.color); };
_KI_BUILDERS.fractionShaded = function(cfg){ return _drawFractionSvg(cfg.denom, cfg.shaded, cfg.color); };
_KI_BUILDERS.fractionWrite  = function(cfg){
  return _drawFractionSvg(cfg.denom, cfg.shaded, cfg.color)
    + '<div class="ki-row-meta-center" style="font-size:1.4em"><strong>' + cfg.shaded + ' / ' + cfg.denom + '</strong></div>';
};

// ── Time (clock) ─────────────────────────────────────────────────────────────
function _drawClockSvg(h, m, color, focus) {
  const cx = 80, cy = 80, r = 60;
  const hAng = ((h % 12) + m / 60) * 30 - 90;  // hours
  const mAng = m * 6 - 90;                     // minutes
  const hLen = 30, mLen = 50;
  const hX = cx + hLen * Math.cos(hAng * Math.PI / 180);
  const hY = cy + hLen * Math.sin(hAng * Math.PI / 180);
  const mX = cx + mLen * Math.cos(mAng * Math.PI / 180);
  const mY = cy + mLen * Math.sin(mAng * Math.PI / 180);
  let nums = '';
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    const tx = cx + (r - 10) * Math.cos(a);
    const ty = cy + (r - 10) * Math.sin(a) + 4;
    nums += '<text x="' + tx + '" y="' + ty + '" text-anchor="middle" font-size="10" fill="#1a2438">' + i + '</text>';
  }
  const hourColor = (focus === 'minute') ? '#94a3b8' : color;
  const minColor  = (focus === 'hour')   ? '#94a3b8' : color;
  return '<svg viewBox="0 0 160 160" width="100%" style="max-width:220px;display:block;margin:0 auto" aria-hidden="true">'
    + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff" stroke="#1a2438" stroke-width="2"/>'
    + nums
    + '<line x1="' + cx + '" y1="' + cy + '" x2="' + hX + '" y2="' + hY + '" stroke="' + hourColor + '" stroke-width="5" stroke-linecap="round"/>'
    + '<line x1="' + cx + '" y1="' + cy + '" x2="' + mX + '" y2="' + mY + '" stroke="' + minColor + '" stroke-width="3" stroke-linecap="round"/>'
    + '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#1a2438"/>'
    + '</svg>';
}
_KI_BUILDERS.timeHourHand   = function(cfg){ return _drawClockSvg(cfg.h, cfg.m, cfg.color, 'hour'); };
_KI_BUILDERS.timeMinuteHand = function(cfg){ return _drawClockSvg(cfg.h, cfg.m, cfg.color, 'minute'); };
_KI_BUILDERS.timeRead       = function(cfg){
  return _drawClockSvg(cfg.h, cfg.m, cfg.color, 'both')
    + '<div class="ki-row-meta-center" style="font-size:1.4em"><strong>' + cfg.h + ':' + String(cfg.m).padStart(2, '0') + '</strong></div>';
};

// ── Money ────────────────────────────────────────────────────────────────────
function _drawCoinFace(value, name, x, color) {
  const cy = 30, r = 22;
  const fill = value === 1   ? '#b87333'  // penny — copper
             : value === 5   ? '#a9a9a9'  // nickel — silver
             : value === 10  ? '#bdbdbd'  // dime — light silver
             : value === 25  ? '#9e9e9e'  // quarter — grey
             : value === 100 ? '#f1c40f'  // dollar — gold
             : '#9e9e9e';
  return '<g><circle cx="' + x + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="#444" stroke-width="1.5"/>'
    + '<text x="' + x + '" y="' + (cy + 4) + '" text-anchor="middle" font-size="11" font-weight="bold" fill="#fff">' + value + '¢</text>'
    + '<text x="' + x + '" y="' + (cy + 36) + '" text-anchor="middle" font-size="9" fill="#1a2438">' + _escHtml(name) + '</text></g>';
}
function _drawCoinRow(coins, color) {
  const W = 60 * coins.length;
  let svg = '<svg viewBox="0 0 ' + W + ' 80" width="100%" style="max-width:360px;display:block;margin:0 auto" aria-hidden="true">';
  coins.forEach(function(c, i){ svg += _drawCoinFace(c.value, c.name, 30 + i * 60, color); });
  svg += '</svg>';
  return svg;
}
_KI_BUILDERS.moneyIdentify = function(cfg){ return _drawCoinRow(cfg.coins, cfg.color); };
_KI_BUILDERS.moneyAdd = function(cfg){
  let running = 0;
  let html = _drawCoinRow(cfg.coins, cfg.color);
  html += '<div class="ki-points-list">';
  cfg.coins.forEach(function(c){
    running += c.value;
    html += '<div>+ ' + c.value + '¢ = ' + running + '¢</div>';
  });
  html += '</div>';
  return html;
};
_KI_BUILDERS.moneyTotal = function(cfg){
  return _drawCoinRow(cfg.coins, cfg.color)
    + '<div class="ki-row-meta-center" style="font-size:1.3em"><strong>Total: ' + cfg.total + '¢</strong></div>';
};

// ── Measure ─────────────────────────────────────────────────────────────────
function _drawRulerSvg(units, color, opts) {
  opts = opts || {};
  const PITCH = 30;
  const W = PITCH * units + 40;
  const H = 70;
  let ticks = '';
  for (let i = 0; i <= units; i++) {
    const x = 20 + i * PITCH;
    ticks += '<line x1="' + x + '" y1="30" x2="' + x + '" y2="50" stroke="#1a2438" stroke-width="1.5"/>';
    if (opts.showLabels) ticks += '<text x="' + x + '" y="62" text-anchor="middle" font-size="10" fill="#1a2438">' + i + '</text>';
  }
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:360px;display:block;margin:0 auto" aria-hidden="true">'
    + '<rect x="20" y="30" width="' + (PITCH * units) + '" height="20" fill="#fef3c7" stroke="#1a2438" stroke-width="1.5"/>'
    + '<rect x="20" y="10" width="' + (PITCH * units) + '" height="14" fill="' + color + '" rx="2"/>'
    + ticks
    + '</svg>';
}
_KI_BUILDERS.measureLineUp = function(cfg){ return _drawRulerSvg(cfg.units, cfg.color, { showLabels: false }) + '<div class="ki-row-meta-center">Line the start at 0</div>'; };
_KI_BUILDERS.measureCount  = function(cfg){ return _drawRulerSvg(cfg.units, cfg.color, { showLabels: true })  + '<div class="ki-row-meta-center">Count the unit ticks</div>'; };
_KI_BUILDERS.measureRead   = function(cfg){ return _drawRulerSvg(cfg.units, cfg.color, { showLabels: true })  + '<div class="ki-row-meta-center"><strong>Length: ' + cfg.units + ' units</strong></div>'; };

// ── Shape ───────────────────────────────────────────────────────────────────
function _drawShapeSimple(name, color, opts) {
  opts = opts || {};
  let path = '';
  let dots = '';
  if (name === 'triangle') {
    path = '<polygon points="80,15 145,120 15,120" fill="' + color + '22" stroke="' + color + '" stroke-width="3"/>';
    if (opts.markCorners) dots = '<circle cx="80" cy="15" r="5" fill="' + color + '"/><circle cx="145" cy="120" r="5" fill="' + color + '"/><circle cx="15" cy="120" r="5" fill="' + color + '"/>';
  } else if (name === 'square') {
    path = '<rect x="20" y="20" width="120" height="120" fill="' + color + '22" stroke="' + color + '" stroke-width="3"/>';
    if (opts.markCorners) dots = '<circle cx="20" cy="20" r="5" fill="' + color + '"/><circle cx="140" cy="20" r="5" fill="' + color + '"/><circle cx="20" cy="140" r="5" fill="' + color + '"/><circle cx="140" cy="140" r="5" fill="' + color + '"/>';
  } else if (name === 'circle') {
    path = '<circle cx="80" cy="80" r="60" fill="' + color + '22" stroke="' + color + '" stroke-width="3"/>';
  }
  return '<svg viewBox="0 0 160 150" width="100%" style="max-width:220px;display:block;margin:0 auto" aria-hidden="true">' + path + dots + '</svg>';
}
_KI_BUILDERS.shapeSides   = function(cfg){ return _drawShapeSimple(cfg.shape, cfg.color, {}) + '<div class="ki-row-meta-center"><strong>' + cfg.sides + ' sides</strong></div>'; };
_KI_BUILDERS.shapeCorners = function(cfg){ return _drawShapeSimple(cfg.shape, cfg.color, { markCorners: true }) + '<div class="ki-row-meta-center"><strong>' + cfg.corners + ' corners</strong></div>'; };
_KI_BUILDERS.shapeName    = function(cfg){ return _drawShapeSimple(cfg.shape, cfg.color, {}) + '<div class="ki-row-meta-center" style="font-size:1.3em"><strong>' + _escHtml(cfg.name) + '</strong></div>'; };

// ─────────────────────────────────────────────────────────────────────────────
//  COUNTING-TO-N — sequential object counting
//  Draws a horizontal row of N circles. The `highlight` config controls which
//  circles are emphasized: a single index, an array of indices, or 'all'.
// ─────────────────────────────────────────────────────────────────────────────
function _drawCountingRow(n, color, opts) {
  opts = opts || {};
  const R = 14, GAP = 8;
  const PAD = 12;
  const W = PAD * 2 + n * (R * 2) + (n - 1) * GAP;
  const H = R * 2 + 36;
  const cy = R + 6;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:' + Math.min(W * 2, 380) + 'px;display:block;margin:0 auto" aria-hidden="true">';
  for (let i = 0; i < n; i++) {
    const cx = PAD + R + i * (R * 2 + GAP);
    const on = opts.highlight === 'all'
            || (Array.isArray(opts.highlight) && opts.highlight.indexOf(i) !== -1)
            || (typeof opts.highlight === 'number' && opts.highlight === i);
    const fill = on ? color : '#e2e8f0';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="' + fill + '" stroke="' + color + '" stroke-width="1.5"/>';
    if (opts.showNumbers) s += '<text x="' + cx + '" y="' + (cy + R + 16) + '" text-anchor="middle" font-size="13" font-weight="bold" fill="#1a2438">' + (i + 1) + '</text>';
  }
  s += '</svg>';
  return s;
}
_KI_BUILDERS.countingStart = function(cfg){
  return _drawCountingRow(cfg.n, cfg.color, { highlight: cfg.highlight != null ? cfg.highlight : 0 })
    + '<div class="ki-row-meta-center">First object → say <strong>"one"</strong></div>';
};
_KI_BUILDERS.countingTouch = function(cfg){
  return _drawCountingRow(cfg.n, cfg.color, { highlight: 'all' })
    + '<div class="ki-row-meta-center">Touch each one as you count</div>';
};
_KI_BUILDERS.countingSay = function(cfg){
  return _drawCountingRow(cfg.n, cfg.color, { highlight: 'all', showNumbers: true })
    + '<div class="ki-row-meta-center">Say one number for each object</div>';
};
_KI_BUILDERS.countingTotal = function(cfg){
  return _drawCountingRow(cfg.n, cfg.color, { highlight: 'all', showNumbers: true })
    + '<div class="ki-row-meta-center" style="font-size:1.4em"><strong>Total: ' + (cfg.total || cfg.n) + '</strong></div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  SUBITIZE — instant pattern recognition (5 + 2)
// ─────────────────────────────────────────────────────────────────────────────
function _drawSubitizePattern(color, mode) {
  // 5-and-2 layout: a 5-frame group on the left + 2 dots on the right
  const dots = [];
  // Left "5" cluster (dice pattern)
  const leftXs = [20, 40, 60, 20, 60];
  const leftYs = [20, 20, 20, 60, 60];
  for (let i = 0; i < 5; i++) dots.push({ x: leftXs[i], y: leftYs[i], group: 'A' });
  dots.push({ x: 40, y: 40, group: 'A' });  // center dot makes 5 dice-pattern... wait that's 6. Let me fix.
  // Actually dice 5 pattern is 4 corners + 1 center. Let me redo.
  dots.length = 0;
  // Dice 5: corners + center
  const dice5 = [[20,20],[60,20],[40,40],[20,60],[60,60]];
  for (const [x, y] of dice5) dots.push({ x: x, y: y, group: 'A' });
  // Right pair
  dots.push({ x: 110, y: 30, group: 'B' });
  dots.push({ x: 110, y: 60, group: 'B' });

  let s = '<svg viewBox="0 0 150 90" width="100%" style="max-width:260px;display:block;margin:0 auto" aria-hidden="true">';
  // Optional divider when in pattern/split mode
  if (mode === 'pattern' || mode === 'split') {
    s += '<line x1="85" y1="10" x2="85" y2="80" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3"/>';
  }
  dots.forEach(function(d){
    const fill = mode === 'pattern' || mode === 'split'
      ? (d.group === 'A' ? color : '#f59e0b')
      : color;
    s += '<circle cx="' + d.x + '" cy="' + d.y + '" r="6" fill="' + fill + '"/>';
  });
  s += '</svg>';
  return s;
}
_KI_BUILDERS.subitizeLook    = function(cfg){ return _drawSubitizePattern(cfg.color, 'look') + '<div class="ki-row-meta-center">Look — don\'t count one by one</div>'; };
_KI_BUILDERS.subitizePattern = function(cfg){ return _drawSubitizePattern(cfg.color, 'pattern') + '<div class="ki-row-meta-center">I see a <strong>5</strong> and a <strong>2</strong></div>'; };
_KI_BUILDERS.subitizeSplit   = function(cfg){ return _drawSubitizePattern(cfg.color, 'split') + '<div class="ki-row-meta-center" style="font-size:1.2em"><strong>' + (cfg.parts ? cfg.parts.join(' + ') : '5 + 2') + ' = ' + cfg.total + '</strong></div>'; };
_KI_BUILDERS.subitizeTotal   = function(cfg){ return _drawSubitizePattern(cfg.color, 'split') + '<div class="ki-row-meta-center" style="font-size:1.4em"><strong>' + cfg.total + ' in all</strong></div>'; };

// ─────────────────────────────────────────────────────────────────────────────
//  STORY-PROBLEM — story mat with known numbers, operation choice, equation
// ─────────────────────────────────────────────────────────────────────────────
_KI_BUILDERS.storyRead = function(cfg){
  return '<div class="ki-card" style="border-color:' + cfg.color + '33;background:#fff;align-items:center"><div class="ki-card-text" style="font-size:1.05em">' + _escHtml(cfg.text) + '</div></div>';
};
_KI_BUILDERS.storyKnown = function(cfg){
  let s = '<div class="ki-story-known">';
  cfg.items.forEach(function(it){
    s += '<div class="ki-story-known-chip" style="background:' + cfg.color + '15;border-color:' + cfg.color + '">'
      + '<span class="ki-story-known-val" style="color:' + cfg.color + '">' + it.value + '</span>'
      + '<span class="ki-story-known-lbl">' + _escHtml(it.label) + '</span></div>';
  });
  s += '</div>';
  return s;
};
_KI_BUILDERS.storyQuestion = function(cfg){
  return '<div class="ki-card" style="border-color:' + cfg.color + '33;background:#fff7ed"><div class="ki-card-text"><strong>?</strong> ' + _escHtml(cfg.question) + '</div></div>';
};
_KI_BUILDERS.storyOp = function(cfg){
  const op = cfg.op || '+';
  return '<div class="ki-story-op">'
    + '<div class="ki-story-op-symbol" style="color:' + cfg.color + '">' + _escHtml(op) + '</div>'
    + '<div class="ki-story-op-reason">' + _escHtml(cfg.reason || (op === '+' ? 'more came → add' : 'some left → subtract')) + '</div>'
    + '</div>';
};
_KI_BUILDERS.storySolve = function(cfg){
  const unit = cfg.unit ? ' ' + cfg.unit : '';
  return '<div class="ki-story-solve" style="color:' + cfg.color + '">'
    + '<span class="ki-story-eq">' + cfg.a + ' ' + cfg.op + ' ' + cfg.b + ' = <strong>' + cfg.result + '</strong>' + _escHtml(unit) + '</span>'
    + '</div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  FINANCIAL LITERACY — concept cards (Need/Want, Earn/Save/Spend)
// ─────────────────────────────────────────────────────────────────────────────
_KI_BUILDERS.flChoice = function(cfg){
  return '<div class="ki-card" style="border-color:' + cfg.color + '33;background:#fff"><div class="ki-card-text" style="font-size:1.05em">' + _escHtml(cfg.prompt || 'Read the choice carefully.') + '</div></div>';
};
_KI_BUILDERS.flNeedWant = function(cfg){
  const focus = cfg.focus || 'all';
  const needActive = focus === 'need' || focus === 'all';
  const wantActive = focus === 'want' || focus === 'all';
  const serviceNote = focus === 'service' ? '<div class="ki-row-meta-center" style="margin-top:8px">Goods are things; services are help.</div>' : '';
  return '<div class="ki-fl-row">'
    + '<div class="ki-fl-card' + (needActive ? ' is-active' : '') + '" style="border-color:#10b981"><div class="ki-fl-icon" style="color:#10b981">✓</div><div class="ki-fl-lbl">NEED</div><div class="ki-fl-ex">food · water · home</div></div>'
    + '<div class="ki-fl-card' + (wantActive ? ' is-active' : '') + '" style="border-color:' + cfg.color + '"><div class="ki-fl-icon" style="color:' + cfg.color + '">★</div><div class="ki-fl-lbl">WANT</div><div class="ki-fl-ex">toy · candy · game</div></div>'
    + '</div>' + serviceNote;
};
_KI_BUILDERS.flESS = function(cfg){
  const focus = cfg.focus || 'all';
  const isActive = function(k){ return focus === 'all' || focus === k; };
  return '<div class="ki-fl-row ki-fl-row-3">'
    + '<div class="ki-fl-card' + (isActive('earn') ? ' is-active' : '') + '" style="border-color:#10b981"><div class="ki-fl-lbl">EARN</div><div class="ki-fl-ex">work for money</div></div>'
    + '<div class="ki-fl-card' + (isActive('save') ? ' is-active' : '') + '" style="border-color:#3b82f6"><div class="ki-fl-lbl">SAVE</div><div class="ki-fl-ex">keep for later</div></div>'
    + '<div class="ki-fl-card' + (isActive('spend') ? ' is-active' : '') + '" style="border-color:' + cfg.color + '"><div class="ki-fl-lbl">SPEND</div><div class="ki-fl-ex">use for now</div></div>'
    + '</div>';
};
_KI_BUILDERS.flDecide = function(cfg){
  const focus = cfg.focus || 'all';
  const reasons = {
    earn:  'Earning means doing work and getting paid.',
    save:  'Saving means keeping money for something later.',
    spend: 'Spending means using money for what you need or want now.',
    all:   'A smart choice matches your goal: earn, save, or spend.'
  };
  return '<div class="ki-card" style="border-color:' + cfg.color + '33;background:#ecfdf5"><div class="ki-card-text">' + _escHtml(reasons[focus] || reasons.all) + '</div></div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  DOUBLES + NEAR-DOUBLES — two equal groups, optional extra
// ─────────────────────────────────────────────────────────────────────────────
function _drawTwoGroupsOfN(n, color, extra) {
  const R = 9, GAP = 4;
  const PAD = 12;
  const colW = n * (R * 2 + GAP);
  const W = PAD * 2 + colW * 2 + 30;
  const H = 60;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:340px;display:block;margin:0 auto" aria-hidden="true">';
  for (let i = 0; i < n; i++) {
    const cx = PAD + R + i * (R * 2 + GAP);
    s += '<circle cx="' + cx + '" cy="20" r="' + R + '" fill="' + color + '"/>';
  }
  // plus separator
  s += '<text x="' + (PAD + colW + 12) + '" y="26" font-size="18" fill="#1a2438" font-weight="bold">+</text>';
  for (let i = 0; i < n; i++) {
    const cx = PAD + colW + 30 + R + i * (R * 2 + GAP);
    s += '<circle cx="' + cx + '" cy="20" r="' + R + '" fill="' + color + '"/>';
  }
  if (extra) {
    const cx = PAD + colW + 30 + R + n * (R * 2 + GAP);
    s += '<circle cx="' + cx + '" cy="20" r="' + R + '" fill="#f59e0b" stroke="#92400e" stroke-width="1.5"/>';
    s += '<text x="' + cx + '" y="50" font-size="10" text-anchor="middle" fill="#92400e" font-weight="bold">+1</text>';
  }
  s += '</svg>';
  return s;
}
_KI_BUILDERS.doublesEqual  = function(cfg){ return _drawTwoGroupsOfN(cfg.n, cfg.color, false) + '<div class="ki-row-meta-center">Two equal groups of ' + cfg.n + '</div>'; };
_KI_BUILDERS.doublesSum    = function(cfg){ return _drawTwoGroupsOfN(cfg.n, cfg.color, false) + '<div class="ki-row-meta-center" style="font-size:1.2em"><strong>' + cfg.n + ' + ' + cfg.n + ' = ' + cfg.sum + '</strong></div>'; };
_KI_BUILDERS.doublesNear   = function(cfg){ return _drawTwoGroupsOfN(cfg.n, cfg.color, true) + '<div class="ki-row-meta-center">Take the double, then add one more</div>'; };
_KI_BUILDERS.doublesAnswer = function(cfg){ return _drawTwoGroupsOfN(cfg.a, cfg.color, true) + '<div class="ki-row-meta-center" style="font-size:1.3em"><strong>' + cfg.a + ' + ' + cfg.b + ' = ' + cfg.sum + '</strong></div>'; };

// ─────────────────────────────────────────────────────────────────────────────
//  MAKE-A-TEN — ten-frame + number bond
// ─────────────────────────────────────────────────────────────────────────────
function _drawTenFrameFilled(filled, accentColor, takeFromOther) {
  // Same as tenFrame but allows two colors (existing dots + the "moved" dot)
  let cells = '';
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const x = 10 + c * 30, y = 10 + r * 30;
      cells += '<rect x="' + x + '" y="' + y + '" width="28" height="28" fill="#fff" stroke="#1a2438" stroke-width="1.5" rx="3"/>';
      const idx = r * 5 + c;
      if (idx < filled - (takeFromOther || 0)) {
        cells += '<circle cx="' + (x + 14) + '" cy="' + (y + 14) + '" r="10" fill="' + accentColor + '"/>';
      } else if (idx < filled) {
        cells += '<circle cx="' + (x + 14) + '" cy="' + (y + 14) + '" r="10" fill="#f59e0b" stroke="#92400e" stroke-width="2"/>';
      }
    }
  }
  return '<svg viewBox="0 0 180 80" width="100%" style="max-width:260px;display:block;margin:0 auto" aria-hidden="true">' + cells + '</svg>';
}
_KI_BUILDERS.makeTenFind = function(cfg){
  return _drawTenFrameFilled(cfg.a, cfg.color, 0)
    + '<div class="ki-row-meta-center"><strong>' + cfg.a + '</strong> needs <strong>' + cfg.need + '</strong> more to make 10</div>';
};
_KI_BUILDERS.makeTenBreak = function(cfg){
  // Show b = need + leftover as a number bond
  return _drawBondSvg(cfg.b, cfg.need, cfg.leftover, cfg.color)
    + '<div class="ki-row-meta-center">' + cfg.b + ' = ' + cfg.need + ' + ' + cfg.leftover + '</div>';
};
_KI_BUILDERS.makeTenForm = function(cfg){
  return _drawTenFrameFilled(10, cfg.color, cfg.need)
    + '<div class="ki-row-meta-center"><strong>' + cfg.a + ' + ' + cfg.need + ' = 10</strong> ✓</div>';
};
_KI_BUILDERS.makeTenAdd = function(cfg){
  return _drawTenFrameFilled(10, cfg.color, 0)
    + '<div class="ki-row-meta-center" style="font-size:1.2em"><strong>10 + ' + cfg.leftover + ' = ' + cfg.sum + '</strong></div>';
};
_KI_BUILDERS.makeTenAnswer = function(cfg){
  return '<div class="ki-card" style="border-color:' + cfg.color + '33;background:#ecfdf5"><div class="ki-card-text" style="font-size:1.4em;text-align:center"><strong>' + cfg.a + ' + ' + cfg.b + ' = ' + cfg.sum + '</strong></div></div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  LINE PLOT — axis + Xs above each label
// ─────────────────────────────────────────────────────────────────────────────
function _drawLinePlotSvg(plot, color, opts) {
  opts = opts || {};
  const labels = plot.labels;
  const counts = plot.counts;
  const PAD = 18, COL = 36, MAXX = Math.max.apply(null, counts);
  const xH = 16;
  const W = PAD * 2 + labels.length * COL;
  const H = PAD + (MAXX + 1) * xH + 24;
  const axisY = H - 24;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:340px;display:block;margin:0 auto" aria-hidden="true">';
  // baseline
  s += '<line x1="' + (PAD - 4) + '" y1="' + axisY + '" x2="' + (W - PAD + 4) + '" y2="' + axisY + '" stroke="#1a2438" stroke-width="1.5"/>';
  for (let i = 0; i < labels.length; i++) {
    const cx = PAD + COL/2 + i * COL;
    const xCount = counts[i];
    const focus = (typeof opts.focusIdx === 'number') ? (i === opts.focusIdx) : true;
    const labelFill = opts.focus === 'labels' && i === 0 ? color : '#1a2438';
    s += '<text x="' + cx + '" y="' + (axisY + 16) + '" text-anchor="middle" font-size="12" font-weight="bold" fill="' + labelFill + '">' + labels[i] + '</text>';
    for (let k = 0; k < xCount; k++) {
      const y = axisY - 8 - k * xH;
      const opacity = focus ? 1 : 0.35;
      s += '<text x="' + cx + '" y="' + y + '" text-anchor="middle" font-size="14" font-weight="bold" fill="' + color + '" opacity="' + opacity + '">X</text>';
    }
  }
  s += '</svg>';
  return s;
}
_KI_BUILDERS.lpLabels  = function(cfg){ return _drawLinePlotSvg(cfg.plot, cfg.color, { focus: 'labels' }) + '<div class="ki-row-meta-center">Numbers on the bottom show the values</div>'; };
_KI_BUILDERS.lpCount   = function(cfg){ return _drawLinePlotSvg(cfg.plot, cfg.color) + '<div class="ki-row-meta-center">Each X counts 1</div>'; };
_KI_BUILDERS.lpCompare = function(cfg){
  const maxIdx = cfg.plot.counts.reduce(function(mi, c, i, arr){ return c > arr[mi] ? i : mi; }, 0);
  return _drawLinePlotSvg(cfg.plot, cfg.color, { focusIdx: maxIdx })
    + '<div class="ki-row-meta-center">Tallest column: <strong>' + cfg.plot.labels[maxIdx] + '</strong> (' + cfg.plot.counts[maxIdx] + ' Xs)</div>';
};
_KI_BUILDERS.lpAnswer  = function(cfg){ return _drawLinePlotSvg(cfg.plot, cfg.color) + '<div class="ki-row-meta-center"><strong>' + _escHtml(cfg.answer || '') + '</strong></div>'; };

// ─────────────────────────────────────────────────────────────────────────────
//  TENS-ADDITION — base-10 rods
// ─────────────────────────────────────────────────────────────────────────────
_KI_BUILDERS.taTens = function(cfg){
  return '<div class="ki-vis-wrap" style="display:flex;justify-content:center;gap:18px;align-items:center">'
    + '<div>' + drawBase10({ tens: cfg.aT }) + '<div class="ki-row-meta-center">' + (cfg.aT * 10) + '</div></div>'
    + '<div style="font-size:1.5em;color:#1a2438;font-weight:bold">+</div>'
    + '<div>' + drawBase10({ tens: cfg.bT }) + '<div class="ki-row-meta-center">' + (cfg.bT * 10) + '</div></div>'
    + '</div>';
};
_KI_BUILDERS.taAdd = function(cfg){
  return '<div class="ki-vis-wrap">' + drawBase10({ tens: cfg.sumT }) + '</div>'
    + '<div class="ki-row-meta-center" style="font-size:1.2em"><strong>' + cfg.aT + ' tens + ' + cfg.bT + ' tens = ' + cfg.sumT + ' tens</strong></div>';
};
_KI_BUILDERS.taOnes = function(cfg){
  return '<div class="ki-vis-wrap">' + drawBase10({ tens: cfg.sumT, ones: cfg.ones || 0 }) + '</div>'
    + '<div class="ki-row-meta-center">' + (cfg.ones === 0 ? 'No ones to add — both numbers ended in 0.' : (cfg.ones + ' ones to keep')) + '</div>';
};
_KI_BUILDERS.taTotal = function(cfg){
  return '<div class="ki-card" style="border-color:' + cfg.color + '33;background:#ecfdf5"><div class="ki-card-text" style="font-size:1.3em;text-align:center"><strong>' + cfg.a + ' + ' + cfg.b + ' = ' + cfg.sum + '</strong></div></div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  DATA-CONCLUSION — bar graph with highlight
// ─────────────────────────────────────────────────────────────────────────────
_KI_BUILDERS.dcRead = function(cfg){ return _drawBarSvg(cfg.bars, cfg.color, { showValues: true }); };
_KI_BUILDERS.dcBig  = function(cfg){
  return _drawBarSvg(cfg.bars, cfg.color, { showValues: true, dimBars: true, highlightIdx: cfg.biggestIdx })
    + '<div class="ki-row-meta-center">Most: <strong>' + _escHtml(cfg.bars[cfg.biggestIdx].label) + '</strong> · Fewest: <strong>' + _escHtml(cfg.bars[cfg.smallestIdx].label) + '</strong></div>';
};
_KI_BUILDERS.dcCompare = function(cfg){
  const big = cfg.bars[cfg.biggestIdx || 0];
  const small = cfg.bars[cfg.smallestIdx || (cfg.bars.length - 1)];
  return _drawBarSvg(cfg.bars, cfg.color, { showValues: true })
    + '<div class="ki-row-meta-center"><strong>' + (big && big.value) + ' − ' + (small && small.value) + ' = ' + cfg.diff + '</strong> more</div>';
};
_KI_BUILDERS.dcAnswer = function(cfg){
  return _drawBarSvg(cfg.bars, cfg.color, { showValues: true })
    + '<div class="ki-card" style="border-color:' + cfg.color + '33;background:#ecfdf5;margin-top:8px"><div class="ki-card-text"><strong>' + _escHtml(cfg.conclusion || '') + '</strong></div></div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  SORT-GROUPS — items + grouped boxes
// ─────────────────────────────────────────────────────────────────────────────
function _drawSortItem(label, x, y) {
  const fill = label === 'red' ? '#ef4444' : label === 'blue' ? '#3b82f6' : '#10b981';
  return '<circle cx="' + x + '" cy="' + y + '" r="9" fill="' + fill + '" stroke="#1a2438" stroke-width="1"/>';
}
_KI_BUILDERS.sortItems = function(cfg){
  let svg = '<svg viewBox="0 0 200 50" width="100%" style="max-width:280px;display:block;margin:0 auto" aria-hidden="true">';
  cfg.items.forEach(function(it, i){ svg += _drawSortItem(it, 20 + i * 35, 25); });
  svg += '</svg>';
  return svg + '<div class="ki-row-meta-center">A mixed group of items</div>';
};
_KI_BUILDERS.sortRule = function(cfg){
  return '<div class="ki-card" style="border-color:' + cfg.color + '33;background:#fff;text-align:center"><div class="ki-card-text" style="font-size:1.1em">Sort by <strong>' + _escHtml(cfg.rule) + '</strong></div></div>';
};
_KI_BUILDERS.sortPlace = function(cfg){
  let s = '<div class="ki-sort-groups">';
  cfg.groups.forEach(function(g){
    s += '<div class="ki-sort-group">';
    s += '<div class="ki-sort-group-lbl">' + _escHtml(g.label) + '</div>';
    s += '<svg viewBox="0 0 ' + (g.items.length * 28 + 10) + ' 30" width="100%" style="max-width:200px;display:block;margin:0 auto" aria-hidden="true">';
    g.items.forEach(function(it, i){ s += _drawSortItem(it, 14 + i * 28, 15); });
    s += '</svg></div>';
  });
  s += '</div>';
  return s;
};
_KI_BUILDERS.sortCount = function(cfg){
  let s = '<div class="ki-sort-groups">';
  cfg.groups.forEach(function(g){
    s += '<div class="ki-sort-group"><div class="ki-sort-group-lbl">' + _escHtml(g.label) + '</div>'
      + '<div class="ki-sort-count" style="color:' + cfg.color + '">' + g.count + '</div></div>';
  });
  s += '</div>';
  return s;
};

// ─────────────────────────────────────────────────────────────────────────────
//  COMPARE-DATA — two groups side by side
// ─────────────────────────────────────────────────────────────────────────────
function _drawDotsCluster(n, color, opacity) {
  // grid up to 5 columns
  const cols = Math.min(5, n);
  const rows = Math.ceil(n / 5);
  const PAD = 8, R = 8, GAP = 6;
  const W = PAD * 2 + cols * (R * 2 + GAP);
  const H = PAD * 2 + rows * (R * 2 + GAP);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:140px;display:block;margin:0 auto" aria-hidden="true">';
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const cx = PAD + R + c * (R * 2 + GAP);
    const cy = PAD + R + r * (R * 2 + GAP);
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="' + color + '" opacity="' + (opacity || 1) + '"/>';
  }
  s += '</svg>';
  return s;
}
_KI_BUILDERS.cdCount = function(cfg){
  return '<div class="ki-cmp-data">'
    + '<div class="ki-cmp-data-col"><div class="ki-cmp-data-lbl">' + _escHtml(cfg.left.label) + '</div>' + _drawDotsCluster(cfg.left.count, cfg.left.color) + '<div class="ki-cmp-data-n">' + cfg.left.count + '</div></div>'
    + '<div class="ki-cmp-data-col"><div class="ki-cmp-data-lbl">' + _escHtml(cfg.right.label) + '</div>' + _drawDotsCluster(cfg.right.count, cfg.right.color) + '<div class="ki-cmp-data-n">' + cfg.right.count + '</div></div>'
    + '</div>';
};
_KI_BUILDERS.cdMore = function(cfg){
  const leftDim = cfg.biggerSide === 'right';
  const rightDim = cfg.biggerSide === 'left';
  return '<div class="ki-cmp-data">'
    + '<div class="ki-cmp-data-col' + (leftDim ? ' is-dim' : ' is-bigger') + '"><div class="ki-cmp-data-lbl">' + _escHtml(cfg.left.label) + '</div>' + _drawDotsCluster(cfg.left.count, cfg.left.color, leftDim ? 0.35 : 1) + '<div class="ki-cmp-data-n">' + cfg.left.count + '</div></div>'
    + '<div class="ki-cmp-data-col' + (rightDim ? ' is-dim' : ' is-bigger') + '"><div class="ki-cmp-data-lbl">' + _escHtml(cfg.right.label) + '</div>' + _drawDotsCluster(cfg.right.count, cfg.right.color, rightDim ? 0.35 : 1) + '<div class="ki-cmp-data-n">' + cfg.right.count + '</div></div>'
    + '</div>';
};
_KI_BUILDERS.cdCompare = function(cfg){
  return '<div class="ki-cmp-data">'
    + '<div class="ki-cmp-data-col"><div class="ki-cmp-data-lbl">' + _escHtml(cfg.left.label) + '</div><div class="ki-cmp-data-n" style="font-size:2em">' + cfg.left.count + '</div></div>'
    + '<div class="ki-cmp-data-op">' + (cfg.left.count < cfg.right.count ? '&lt;' : cfg.left.count > cfg.right.count ? '&gt;' : '=') + '</div>'
    + '<div class="ki-cmp-data-col"><div class="ki-cmp-data-lbl">' + _escHtml(cfg.right.label) + '</div><div class="ki-cmp-data-n" style="font-size:2em">' + cfg.right.count + '</div></div>'
    + '</div>'
    + '<div class="ki-row-meta-center" style="margin-top:8px"><strong>' + cfg.diff + ' more</strong></div>';
};
_KI_BUILDERS.cdAnswer = function(cfg){
  return '<div class="ki-card" style="border-color:#10b98133;background:#ecfdf5"><div class="ki-card-text"><strong>' + _escHtml(cfg.biggerLabel) + '</strong> has more.</div></div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  ROUNDING — number line + halfway mark + arrow + estimate equation
// ─────────────────────────────────────────────────────────────────────────────
function _drawRoundingSvg(cfg, mode) {
  const color = cfg.color || '#6c5ce7';
  const PAD = 24, W = 320, axisY = 60, H = 110;
  const range = cfg.high - cfg.low;
  const valToX = function(v){ return PAD + ((v - cfg.low) / range) * (W - PAD * 2); };
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:380px;display:block;margin:0 auto" aria-hidden="true">';
  // Baseline
  s += '<line x1="' + PAD + '" y1="' + axisY + '" x2="' + (W - PAD) + '" y2="' + axisY + '" stroke="#1a2438" stroke-width="2" stroke-linecap="round"/>';
  // Halfway dashed (only in mode 'halfway' or later)
  if (mode === 'halfway' || mode === 'decide') {
    const hx = valToX(cfg.halfway);
    s += '<line x1="' + hx + '" y1="' + (axisY - 18) + '" x2="' + hx + '" y2="' + (axisY + 18) + '" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>';
    s += '<text x="' + hx + '" y="' + (axisY - 22) + '" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">halfway: ' + cfg.halfway + '</text>';
  }
  // Decide-arrow from target → rounded (mode 'decide')
  // Direction is computed from target vs rounded so the same helper works for
  // BOTH "47 rounds UP to 50" and "347 rounds DOWN to 300".
  if (mode === 'decide') {
    const tx = valToX(cfg.target);
    const rx = valToX(cfg.rounded);
    const dirLabel = cfg.rounded < cfg.target ? 'round DOWN' : cfg.rounded > cfg.target ? 'round UP' : 'rounded';
    s += '<path d="M' + tx + ' ' + (axisY - 12) + ' Q ' + ((tx + rx) / 2) + ' ' + (axisY - 30) + ' ' + rx + ' ' + (axisY - 12) + '" fill="none" stroke="' + color + '" stroke-width="2.5"/>';
    s += '<polygon points="' + rx + ',' + (axisY - 8) + ' ' + (rx - 5) + ',' + (axisY - 16) + ' ' + (rx + 5) + ',' + (axisY - 16) + '" fill="' + color + '"/>';
    s += '<text x="' + ((tx + rx) / 2) + '" y="' + (axisY - 32) + '" text-anchor="middle" font-size="11" font-weight="bold" fill="' + color + '">' + dirLabel + '</text>';
  }
  // Ticks
  const ticks = cfg.ticks || [cfg.low, cfg.target, cfg.high];
  ticks.forEach(function(v){
    const x = valToX(v);
    const isTarget = v === cfg.target;
    const isRounded = mode === 'decide' && v === cfg.rounded;
    const isEdge = v === cfg.low || v === cfg.high;
    const tickColor = isRounded ? '#2d7d46' : (isTarget ? color : '#1a2438');
    const tickWeight = (isTarget || isRounded || isEdge) ? 3 : 1.5;
    s += '<line x1="' + x + '" y1="' + (axisY - 8) + '" x2="' + x + '" y2="' + (axisY + 8) + '" stroke="' + tickColor + '" stroke-width="' + tickWeight + '"/>';
    s += '<text x="' + x + '" y="' + (axisY + 24) + '" text-anchor="middle" font-size="12" font-weight="' + ((isTarget || isRounded || isEdge) ? 'bold' : 'normal') + '" fill="' + tickColor + '">' + v + '</text>';
  });
  s += '</svg>';
  return s;
}
// Lesson-tuned builders for G2 u4l3 "Close Enough Counts!".
// 4 visuals, one per lesson point.

// Step 1 — Round first: show the original equation transforming into rounded.
_KI_BUILDERS.roundFirst = function(cfg) {
  return '<div class="ki-round-first">'
    +   '<div class="ki-round-eq-row">'
    +     '<div class="ki-round-eq exact">'
    +       '<div class="ki-round-eq-lbl">Exact</div>'
    +       '<div class="ki-round-eq-val">' + cfg.a + ' + ' + cfg.b + '</div>'
    +     '</div>'
    +     '<div class="ki-round-arrow" style="color:' + cfg.color + '">→</div>'
    +     '<div class="ki-round-eq rounded" style="border-color:' + cfg.color + '">'
    +       '<div class="ki-round-eq-lbl">Rounded</div>'
    +       '<div class="ki-round-eq-val" style="color:' + cfg.color + '">' + cfg.roundedA + ' + ' + cfg.roundedB + '</div>'
    +     '</div>'
    +   '</div>'
    +   '<div class="ki-round-sum">= <strong>' + cfg.sum + '</strong></div>'
    + '</div>';
};

// Step 2 — Nearest 10: number line + halfway + decision arrow + rule reminder.
// Step 3 — Nearest 100: same _drawRoundingSvg helper, different config + rule.
function _roundNumberLineWithRule(cfg, ruleLabel) {
  const nlCfg = Object.assign({}, cfg, { ticks: [cfg.low, cfg.halfway, cfg.target, cfg.high].sort(function(a,b){return a-b;}) });
  return _drawRoundingSvg(nlCfg, 'decide')
    + '<div class="ki-round-rule">'
    +   '<div class="ki-round-rule-row"><span class="ki-round-rule-key">' + ruleLabel + ' 0–4</span><span class="ki-round-rule-act">round DOWN</span></div>'
    +   '<div class="ki-round-rule-row"><span class="ki-round-rule-key">' + ruleLabel + ' 5–9</span><span class="ki-round-rule-act ki-round-rule-up">round UP</span></div>'
    + '</div>'
    + '<div class="ki-row-meta-center">'
    +   cfg.target + ' has a <strong>' + cfg.digit + '</strong> in the ' + cfg.place + ' place → round <strong>' + cfg.direction + '</strong> to ' + cfg.rounded
    + '</div>';
}
_KI_BUILDERS.roundNearest10  = function(cfg){ return _roundNumberLineWithRule(cfg, 'ones'); };
_KI_BUILDERS.roundNearest100 = function(cfg){ return _roundNumberLineWithRule(cfg, 'tens'); };

// Step 4 — Close, not exact: two side-by-side cards, then short note.
_KI_BUILDERS.roundCompare = function(cfg) {
  return '<div class="ki-round-compare">'
    +   '<div class="ki-round-cmp-card exact">'
    +     '<div class="ki-round-cmp-lbl">Exact</div>'
    +     '<div class="ki-round-cmp-val">' + cfg.a + ' + ' + cfg.b + ' = <strong>' + cfg.exact + '</strong></div>'
    +   '</div>'
    +   '<div class="ki-round-cmp-card estimate" style="border-color:' + cfg.color + '">'
    +     '<div class="ki-round-cmp-lbl" style="color:' + cfg.color + '">Estimate</div>'
    +     '<div class="ki-round-cmp-val">' + cfg.a + ' + ' + cfg.b + ' ≈ <strong style="color:' + cfg.color + '">' + cfg.estimate + '</strong></div>'
    +   '</div>'
    + '</div>'
    + '<div class="ki-row-meta-center"><strong>' + cfg.estimate + '</strong> is close to <strong>' + cfg.exact + '</strong> — a good estimate.</div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  THREE-ADDENDS — three colored chips, pair grouping, collapse
// ─────────────────────────────────────────────────────────────────────────────
function _drawAddendChips(nums, color, opts) {
  opts = opts || {};
  const PAD = 14, CHIP_W = 60, GAP = 16;
  const W = PAD * 2 + nums.length * CHIP_W + (nums.length - 1) * GAP + 60;
  const H = opts.showArc ? 100 : 70;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:380px;display:block;margin:0 auto" aria-hidden="true">';
  const baseY = opts.showArc ? 65 : 30;
  // Optional arc connecting the paired chips
  if (opts.showArc && opts.pairIdx && opts.pairIdx.length === 2) {
    const i1 = opts.pairIdx[0], i2 = opts.pairIdx[1];
    const x1 = PAD + i1 * (CHIP_W + GAP) + CHIP_W / 2;
    const x2 = PAD + i2 * (CHIP_W + GAP) + CHIP_W / 2;
    const mx = (x1 + x2) / 2;
    s += '<path d="M ' + x1 + ' ' + (baseY - 5) + ' Q ' + mx + ' 10 ' + x2 + ' ' + (baseY - 5) + '" fill="none" stroke="' + color + '" stroke-width="2.5"/>';
    s += '<text x="' + mx + '" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="' + color + '">easy pair</text>';
  }
  nums.forEach(function(n, i){
    const x = PAD + i * (CHIP_W + GAP);
    const isPaired = opts.pairIdx && opts.pairIdx.indexOf(i) !== -1;
    const dim = opts.dimNonPaired && !isPaired;
    const fill = dim ? '#e2e8f0' : color;
    const textFill = dim ? '#94a3b8' : '#fff';
    s += '<rect x="' + x + '" y="' + (baseY - 18) + '" width="' + CHIP_W + '" height="36" rx="8" fill="' + fill + '"/>';
    s += '<text x="' + (x + CHIP_W / 2) + '" y="' + (baseY + 6) + '" text-anchor="middle" font-size="20" font-weight="bold" fill="' + textFill + '">' + n + '</text>';
  });
  s += '</svg>';
  return s;
}
_KI_BUILDERS.threeShow = function(cfg){
  return _drawAddendChips(cfg.nums, cfg.color, {})
    + '<div class="ki-row-meta-center">Three numbers to add — pick the easiest path</div>';
};
_KI_BUILDERS.threePickPair = function(cfg){
  return _drawAddendChips(cfg.nums, cfg.color, { pairIdx: cfg.pairIdx, dimNonPaired: true, showArc: true })
    + '<div class="ki-row-meta-center"><strong>' + cfg.nums[cfg.pairIdx[0]] + ' + ' + cfg.nums[cfg.pairIdx[1]] + ' = ' + cfg.pairSum + '</strong> first</div>';
};
_KI_BUILDERS.threeAddPair = function(cfg){
  return _drawAddendChips([cfg.paired, cfg.remaining], cfg.color, {})
    + '<div class="ki-row-meta-center">Now we have just two numbers: ' + cfg.paired + ' and ' + cfg.remaining + '</div>';
};
_KI_BUILDERS.threeAddLast = function(cfg){
  return '<div class="ki-card" style="border-color:' + cfg.color + '33;background:#ecfdf5;text-align:center">'
    + '<div class="ki-card-text" style="font-size:1.4em"><strong>' + cfg.a + ' + ' + cfg.b + ' = ' + cfg.sum + '</strong></div></div>';
};
// threeEasyOrder — shows the original sum and a re-grouping with the easy pair
// in parentheses, demonstrating the commutative + associative properties.
_KI_BUILDERS.threeEasyOrder = function(cfg){
  const nums = cfg.nums || [];
  return '<div class="ki-round-first">'
    +   '<div class="ki-round-eq-row">'
    +     '<div class="ki-round-eq">'
    +       '<div class="ki-round-eq-lbl">Original</div>'
    +       '<div class="ki-round-eq-val">' + nums.join(' + ') + '</div>'
    +     '</div>'
    +     '<div class="ki-round-arrow" style="color:' + cfg.color + '">↻</div>'
    +     '<div class="ki-round-eq" style="border-color:' + cfg.color + '">'
    +       '<div class="ki-round-eq-lbl">Easy order</div>'
    +       '<div class="ki-round-eq-val" style="color:' + cfg.color + '">' + _escHtml(cfg.grouped) + '</div>'
    +     '</div>'
    +   '</div>'
    +   '<div class="ki-round-sum">= <strong>' + cfg.result + '</strong></div>'
    + '</div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  SYMMETRY — shapes with dashed fold lines, plus an L-shape with no symmetry
// ─────────────────────────────────────────────────────────────────────────────
function _drawSymmetryShape(name, color, lines, showCross) {
  const W = 180, H = 160, cx = 90, cy = 80;
  let body = '';
  if (name === 'square') {
    body = '<rect x="30" y="20" width="120" height="120" fill="' + color + '22" stroke="' + color + '" stroke-width="3"/>';
  } else if (name === 'L') {
    body = '<polygon points="30,20 90,20 90,80 150,80 150,140 30,140" fill="' + color + '22" stroke="' + color + '" stroke-width="3"/>';
  }
  let dashedLines = '';
  if (name === 'square' && lines >= 1) {
    // vertical
    dashedLines += '<line x1="90" y1="10" x2="90" y2="150" stroke="' + color + '" stroke-width="2" stroke-dasharray="6 4"/>';
  }
  if (name === 'square' && lines >= 4) {
    dashedLines += '<line x1="20" y1="80" x2="160" y2="80" stroke="' + color + '" stroke-width="2" stroke-dasharray="6 4"/>';   // horizontal
    dashedLines += '<line x1="30" y1="20" x2="150" y2="140" stroke="' + color + '" stroke-width="2" stroke-dasharray="6 4"/>'; // \
    dashedLines += '<line x1="150" y1="20" x2="30" y2="140" stroke="' + color + '" stroke-width="2" stroke-dasharray="6 4"/>'; // /
  }
  let crossX = '';
  if (showCross) {
    // Red X over the shape
    crossX = '<line x1="40" y1="30" x2="140" y2="130" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>'
      +     '<line x1="140" y1="30" x2="40" y2="130" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>';
  }
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:240px;display:block;margin:0 auto" aria-hidden="true">'
    + body + dashedLines + crossX + '</svg>';
}
_KI_BUILDERS.symFoldTest = function(cfg){
  return _drawSymmetryShape(cfg.shape || 'square', cfg.color, 1, false)
    + '<div class="ki-row-meta-center">Fold along the dashed line — both halves match</div>';
};
_KI_BUILDERS.symLine = function(cfg){
  return _drawSymmetryShape(cfg.shape || 'square', cfg.color, 1, false)
    + '<div class="ki-row-meta-center"><strong>1 line of symmetry</strong></div>';
};
_KI_BUILDERS.symCount = function(cfg){
  return _drawSymmetryShape(cfg.shape || 'square', cfg.color, 4, false)
    + '<div class="ki-row-meta-center"><strong>' + cfg.lines + ' lines of symmetry</strong> (vertical, horizontal, both diagonals)</div>';
};
_KI_BUILDERS.symNone = function(cfg){
  return _drawSymmetryShape(cfg.shape || 'L', cfg.color, 0, true)
    + '<div class="ki-row-meta-center"><strong>0 lines of symmetry</strong> — no fold makes the sides match</div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  EQUAL-SHARING — total dots, plates, dealing animation (static frames)
// ─────────────────────────────────────────────────────────────────────────────
function _drawSharingScene(total, color, opts) {
  opts = opts || {};
  const cols = 4;
  const R = 9, GAP = 5;
  const dotsW = cols * (R * 2 + GAP);
  const dotsRows = Math.ceil(total / cols);
  const dotsH = dotsRows * (R * 2 + GAP);
  const platesY = opts.showPlates ? dotsH + 30 : 0;
  const plateW = 50, plateH = 24, plateGap = 8;
  const platesCount = opts.groups || 0;
  const platesTotalW = platesCount * (plateW + plateGap) - plateGap;
  const W = Math.max(dotsW + 24, platesTotalW + 24) + 8;
  const H = dotsH + platesY + 12;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:300px;display:block;margin:0 auto" aria-hidden="true">';

  // Distributed mode: dots are inside the plates
  if (opts.distributed && platesCount) {
    const per = total / platesCount;
    const plateBaseX = (W - platesTotalW) / 2;
    for (let p = 0; p < platesCount; p++) {
      const px = plateBaseX + p * (plateW + plateGap);
      const py = 14;
      // Plate
      s += '<ellipse cx="' + (px + plateW / 2) + '" cy="' + (py + plateH) + '" rx="' + (plateW / 2) + '" ry="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>';
      // Dots in plate (small)
      for (let i = 0; i < per; i++) {
        const dotR = 7;
        const slotW = plateW - 14;
        const slotsPerRow = Math.min(3, per);
        const col = i % slotsPerRow;
        const row = Math.floor(i / slotsPerRow);
        const dx = px + 7 + (slotW / slotsPerRow) * col + (slotW / slotsPerRow) / 2 - dotR / 2;
        const dy = py + 4 + row * 14;
        s += '<circle cx="' + dx + '" cy="' + dy + '" r="' + dotR + '" fill="' + color + '"/>';
      }
      // Plate label
      s += '<text x="' + (px + plateW / 2) + '" y="' + (py + plateH + 18) + '" text-anchor="middle" font-size="10" fill="#475569">' + per + '</text>';
    }
  } else {
    // Loose dots at the top
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      const dx = 12 + R + c * (R * 2 + GAP);
      const dy = 12 + R + r * (R * 2 + GAP);
      s += '<circle cx="' + dx + '" cy="' + dy + '" r="' + R + '" fill="' + color + '"/>';
    }
    // Plates below
    if (opts.showPlates && platesCount) {
      const plateBaseX = (W - platesTotalW) / 2;
      for (let p = 0; p < platesCount; p++) {
        const px = plateBaseX + p * (plateW + plateGap);
        const py = platesY;
        s += '<ellipse cx="' + (px + plateW / 2) + '" cy="' + py + '" rx="' + (plateW / 2) + '" ry="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>';
      }
    }
  }
  s += '</svg>';
  return s;
}
_KI_BUILDERS.shareTotal = function(cfg){
  return _drawSharingScene(cfg.total, cfg.color, {})
    + '<div class="ki-row-meta-center"><strong>' + cfg.total + '</strong> to share equally</div>';
};
_KI_BUILDERS.shareIntoGroups = function(cfg){
  return _drawSharingScene(cfg.total, cfg.color, { showPlates: true, groups: cfg.groups })
    + '<div class="ki-row-meta-center">Share among <strong>' + cfg.groups + '</strong></div>';
};
_KI_BUILDERS.shareDeal = function(cfg){
  return _drawSharingScene(cfg.total, cfg.color, { distributed: true, groups: cfg.groups })
    + '<div class="ki-row-meta-center"><strong>' + cfg.per + ' in each plate</strong></div>';
};
_KI_BUILDERS.shareEquation = function(cfg){
  return _drawSharingScene(cfg.total, cfg.color, { distributed: true, groups: cfg.groups })
    + '<div class="ki-card" style="border-color:' + cfg.color + '33;background:#ecfdf5;margin-top:8px;text-align:center">'
    + '<div class="ki-card-text" style="font-size:1.3em"><strong>' + cfg.total + ' ÷ ' + cfg.groups + ' = ' + cfg.per + '</strong> each</div></div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  NEXT-NUMBER — five boxes in a row, one blank, arcs from neighbors
// ─────────────────────────────────────────────────────────────────────────────
function _drawNNBoxes(seq, color, opts) {
  opts = opts || {};
  const PAD = 14, BOX = 50, GAP = 8;
  const W = PAD * 2 + seq.length * BOX + (seq.length - 1) * GAP;
  const H = opts.showArc ? 100 : 70;
  const baseY = opts.showArc ? 65 : 30;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:380px;display:block;margin:0 auto" aria-hidden="true">';
  // Optional arc between neighbor and blank
  if (opts.showArc) {
    const fromIdx = opts.arcFrom, toIdx = opts.blankIdx;
    if (fromIdx != null) {
      const x1 = PAD + fromIdx * (BOX + GAP) + BOX / 2;
      const x2 = PAD + toIdx * (BOX + GAP) + BOX / 2;
      const mx = (x1 + x2) / 2;
      s += '<path d="M ' + x1 + ' ' + (baseY - 22) + ' Q ' + mx + ' 12 ' + x2 + ' ' + (baseY - 22) + '" fill="none" stroke="' + color + '" stroke-width="2.5"/>';
      s += '<text x="' + mx + '" y="14" text-anchor="middle" font-size="11" font-weight="bold" fill="' + color + '">' + (opts.arcLabel || '') + '</text>';
    }
  }
  // Boxes
  seq.forEach(function(n, i){
    const x = PAD + i * (BOX + GAP);
    const isBlank = (n == null) || (opts.fillBlank && i === opts.blankIdx ? false : false);
    const showAsBlank = (n == null);
    const isAnswer = opts.fillBlank && i === opts.blankIdx;
    const isFocusFrom = i === opts.arcFrom;
    const fill = isAnswer ? '#10b981' : showAsBlank ? '#fff' : '#fff';
    const stroke = isAnswer ? '#059669' : isFocusFrom ? color : '#94a3b8';
    const strokeDash = showAsBlank ? ' stroke-dasharray="4 3"' : '';
    s += '<rect x="' + x + '" y="' + (baseY - 22) + '" width="' + BOX + '" height="44" rx="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"' + strokeDash + '/>';
    const label = isAnswer ? opts.answer : showAsBlank ? '?' : n;
    const textFill = isAnswer ? '#fff' : isFocusFrom ? color : '#1a2438';
    s += '<text x="' + (x + BOX / 2) + '" y="' + (baseY + 8) + '" text-anchor="middle" font-size="22" font-weight="bold" fill="' + textFill + '">' + label + '</text>';
  });
  s += '</svg>';
  return s;
}
_KI_BUILDERS.nnShow = function(cfg){
  return _drawNNBoxes(cfg.seq, cfg.color, { blankIdx: cfg.blankIdx })
    + '<div class="ki-row-meta-center">One number is missing — what comes between?</div>';
};
_KI_BUILDERS.nnBefore = function(cfg){
  return _drawNNBoxes(cfg.seq, cfg.color, { blankIdx: cfg.blankIdx, showArc: true, arcFrom: cfg.blankIdx - 1, arcLabel: '+1' })
    + '<div class="ki-row-meta-center">One MORE than ' + cfg.seq[cfg.blankIdx - 1] + '</div>';
};
_KI_BUILDERS.nnAfter = function(cfg){
  return _drawNNBoxes(cfg.seq, cfg.color, { blankIdx: cfg.blankIdx, showArc: true, arcFrom: cfg.blankIdx + 1, arcLabel: '−1' })
    + '<div class="ki-row-meta-center">One LESS than ' + cfg.seq[cfg.blankIdx + 1] + '</div>';
};
_KI_BUILDERS.nnFill = function(cfg){
  return _drawNNBoxes(cfg.seq, cfg.color, { blankIdx: cfg.blankIdx, fillBlank: true, answer: cfg.answer })
    + '<div class="ki-row-meta-center"><strong>The missing number is ' + cfg.answer + '</strong></div>';
};

// ─────────────────────────────────────────────────────────────────────────────
//  COUNT-BACK — drawNumberLine with leftward jumps (subtraction)
// ─────────────────────────────────────────────────────────────────────────────
_KI_BUILDERS.countBackStart = function(cfg){
  return _wrapNL(drawNumberLine(cfg.cfg), 'Start at ' + cfg.cfg.mark + ' — that\'s the number you have');
};
_KI_BUILDERS.countBackJump = function(cfg){
  return _wrapNL(drawNumberLine(cfg.cfg), 'Jump back, one at a time');
};
_KI_BUILDERS.countBackLand = function(cfg){
  return _wrapNL(drawNumberLine(cfg.cfg), cfg.a + ' − ' + cfg.b + ' = ' + cfg.diff);
};

// ═════════════════════════════════════════════════════════════════════════════
//  Modal rendering — the only side-effecting code in this module
// ═════════════════════════════════════════════════════════════════════════════

function _renderKeyIdeaModal(steps, lesson, unit) {
  _KI_CURRENT_STEPS  = steps;
  _KI_CURRENT_IDX    = 0;
  _KI_CURRENT_LESSON = lesson;
  _KI_CURRENT_UNIT   = unit;
  const listEl = document.getElementById('ki-steplist');
  const visEl  = document.getElementById('ki-visual');
  if (!listEl || !visEl) return;
  let listHtml = '';
  steps.forEach(function(s, i){
    listHtml += '<li>'
      + '<button type="button" role="tab" data-action="_kiPickStep" data-arg="' + i + '" aria-controls="ki-visual" aria-selected="' + (i === 0 ? 'true' : 'false') + '" class="' + (i === 0 ? 'is-active' : '') + '">'
      +   '<span class="ki-stepnum">' + (i + 1) + '</span>'
      +   '<span class="ki-steptitle">' + _escHtml(s.title || ('Step ' + (i + 1))) + '</span>'
      + '</button></li>';
  });
  listEl.innerHTML = listHtml;
  visEl.innerHTML = _renderStepVisual(steps[0]);
}

function _renderStepVisual(step) {
  if (!step) return '';
  const builder = _KI_BUILDERS[step.visualType] || _KI_BUILDERS.genericPoint;
  let html = '';
  if (step.text && step.visualType !== 'genericPoint') {
    html += '<div class="ki-step-caption">' + _escHtml(step.text) + '</div>';
  }
  try {
    html += builder(step.visual || {}, _KI_CURRENT_LESSON, _KI_CURRENT_UNIT);
  } catch (e) {
    html += '<div class="ki-step-error">' + _escHtml('Could not render this step’s visual.') + '</div>';
  }
  return html;
}

function _showKeyIdeaStep(idx) {
  const steps = _KI_CURRENT_STEPS;
  if (!steps || idx < 0 || idx >= steps.length) return;
  const visEl  = document.getElementById('ki-visual');
  const listEl = document.getElementById('ki-steplist');
  if (!visEl || !listEl) return;
  visEl.innerHTML = _renderStepVisual(steps[idx]);
  const btns = listEl.querySelectorAll('button');
  for (let i = 0; i < btns.length; i++) {
    const on = (i === idx);
    btns[i].setAttribute('aria-selected', on ? 'true' : 'false');
    if (on) btns[i].classList.add('is-active');
    else    btns[i].classList.remove('is-active');
  }
  _KI_CURRENT_IDX = idx;
}
