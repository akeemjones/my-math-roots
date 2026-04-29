#!/usr/bin/env node
// scripts/migrate_u9_phase2.js
// One-shot transform for Grade 2 Unit 9 (Geometry) Phase 2 activation.
//   - Adds lessonId to every qBank/testBank/unitQuiz question
//   - Converts bare-string answer-option arrays to {val, tag, patternTag} object form
//   - Preserves the correct-answer index `a` (asserts o[a].val === original correct value)
//   - PRESERVES `s`-field SVG/HTML byte-for-byte per question (strict triple-equals gate)
//   - Writes review list for ambiguous lessonId classification + fallback distractors
//   - Re-emits src/data/u9.js with the transformed payload
//
// Geometry distractor taxonomy (canonical Grade 2 names):
//   err_shape_name_confusion, err_face_edge_vertex_confusion,
//   err_side_count_confusion, err_vertex_count_confusion,
//   err_2d_3d_confusion, err_symmetry_confusion, err_attribute_confusion,
//   err_size_distractor, err_color_distractor,
//   err_off_by_one, err_over_count, err_under_count, err_magnitude_error,
//   err_confused

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const U9_PATH = path.join(REPO_ROOT, 'src', 'data', 'u9.js');
const REVIEW_PATH = path.join(REPO_ROOT, 'scripts', 'u9_review.txt');

// ───── Load u9.js by stubbing _mergeUnitData ─────
let captured = null;
global._mergeUnitData = function(idx, data){ captured = { idx, data }; };
require(U9_PATH);
if(!captured) { console.error('FATAL: _mergeUnitData not called'); process.exit(1); }
const { idx, data } = captured;
if(idx !== 8) { console.error('FATAL: expected idx=8 for u9, got', idx); process.exit(1); }

// ───── Snapshot s-fields BEFORE any transformation ─────
const sSnapshots = []; // { ref, orig, where }
function snapshotS(q, where){
  if(q && typeof q.s === 'string'){
    sSnapshots.push({ ref: q, where, orig: q.s });
  }
}
data.lessons.forEach((lesson, li) => {
  (lesson.qBank || []).forEach((q, qi) => snapshotS(q, `qBank[u9l${li+1}][${qi}]`));
});
(data.testBank || []).forEach((q, qi) => snapshotS(q, `testBank[${qi}]`));
(data.unitQuiz || []).forEach((q, qi) => snapshotS(q, `unitQuiz[${qi}]`));

// ───── Numeric helpers ─────
function tryParseInt(s){
  if(typeof s === 'number') return Number.isFinite(s) ? s : null;
  const cleaned = String(s).trim().replace(/,/g, '');
  const m = cleaned.match(/^-?\d+$/);
  return m ? parseInt(m[0], 10) : null;
}
function extractLastNumberFromText(s){
  if(typeof s !== 'string') return null;
  const cleaned = s.replace(/,/g, '');
  const matches = cleaned.match(/-?\d+/g);
  if(!matches || matches.length === 0) return null;
  return parseInt(matches[matches.length - 1], 10);
}
function getNumericValue(s){
  const plain = tryParseInt(s);
  if(plain !== null) return plain;
  const text = extractLastNumberFromText(s);
  if(text !== null) return text;
  return null;
}
function extractNumbersFromPrompt(t){
  if(typeof t !== 'string') return [];
  const cleaned = t.replace(/,/g, '');
  const matches = cleaned.match(/\d+/g) || [];
  return matches.map(m => parseInt(m, 10)).filter(n => Number.isFinite(n));
}
function stripTags(s){
  if(typeof s !== 'string') return '';
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ───── Geometry vocabulary ─────
const FLAT_SHAPES = new Set([
  'circle','oval','ellipse','triangle','square','rectangle','rhombus','diamond',
  'trapezoid','trapezium','parallelogram','pentagon','hexagon','heptagon','octagon',
  'nonagon','decagon','quadrilateral','polygon','star','crescent'
]);
const SOLID_SHAPES = new Set([
  'cube','sphere','cylinder','cone','pyramid','prism','rectangular prism','triangular prism',
  'square pyramid','triangular pyramid','tetrahedron','rectangular solid'
]);

// Faces, Edges, Vertices lookup
const SOLID_FEV = {
  cube:                { f: 6, e: 12, v: 8 },
  rectangular_prism:   { f: 6, e: 12, v: 8 },
  triangular_prism:    { f: 5, e: 9,  v: 6 },
  square_pyramid:      { f: 5, e: 8,  v: 5 },
  triangular_pyramid:  { f: 4, e: 6,  v: 4 },
  tetrahedron:         { f: 4, e: 6,  v: 4 },
  cone:                { f: 1, e: 0,  v: 1 },
  cylinder:            { f: 2, e: 0,  v: 0 },
  sphere:              { f: 0, e: 0,  v: 0 },
};

// 2D side/vertex counts (sides == vertices for simple polygons)
const FLAT_COUNTS = {
  triangle: 3, square: 4, rectangle: 4, rhombus: 4, diamond: 4,
  trapezoid: 4, trapezium: 4, parallelogram: 4, quadrilateral: 4,
  pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8, nonagon: 9, decagon: 10,
  circle: 0, oval: 0, ellipse: 0
};

function detectSolidInText(s){
  if(typeof s !== 'string') return null;
  const t = s.toLowerCase();
  // Multi-word first
  if(/\brectangular\s*prism\b/.test(t)) return 'rectangular_prism';
  if(/\btriangular\s*prism\b/.test(t)) return 'triangular_prism';
  if(/\bsquare\s*pyramid\b/.test(t)) return 'square_pyramid';
  if(/\btriangular\s*pyramid\b/.test(t)) return 'triangular_pyramid';
  if(/\btetrahedron\b/.test(t)) return 'tetrahedron';
  if(/\brectangular\s*solid\b/.test(t)) return 'rectangular_prism';
  if(/\bcube\b/.test(t)) return 'cube';
  if(/\bsphere\b/.test(t)) return 'sphere';
  if(/\bcylinder\b/.test(t)) return 'cylinder';
  if(/\bcone\b/.test(t)) return 'cone';
  if(/\bpyramid\b/.test(t)) return 'square_pyramid';   // most common default
  if(/\bprism\b/.test(t)) return 'rectangular_prism';  // most common default
  return null;
}
function detectFlatShapeInText(s){
  if(typeof s !== 'string') return null;
  const t = s.toLowerCase().trim();
  for(const name of FLAT_SHAPES){
    const re = new RegExp('\\b' + name.replace(/\s+/g, '\\s+') + 's?\\b');
    if(re.test(t)) return name;
  }
  return null;
}

// ───── Prompt classifiers ─────
function isSymmetryPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(symmetr(y|ic|ical)|line\s*of\s*symmetry|lines?\s*of\s*symmetry|mirror\s*(image|line|shape)|fold(?:s|ed|ing)?\s*in\s*half|reflect(?:ion|ed|ive)?|matching\s*halves|two\s*matching\s*halves|same\s*on\s*both\s*sides)\b/.test(s);
}
function isLetterSymmetryPrompt(t){
  const s = String(t || '');
  // Letter-symmetry prompts typically reference uppercase letters and symmetry
  if(!isSymmetryPrompt(s)) return false;
  return /\b(letter|alphabet)\b/i.test(s) || /\bletter\s*[A-Z]\b/.test(s);
}
function isSolidPrompt(t){
  const s = String(t || '').toLowerCase();
  if(/\b(3D|3-D|three[- ]dimensional|solid\s*shape|faces?|edges?|vertex|vertices)\b/i.test(s)) return true;
  if(/\b(cube|sphere|cylinder|cone|pyramid|prism|rectangular\s*prism|triangular\s*prism|tetrahedron|square\s*pyramid|triangular\s*pyramid)\b/.test(s)) return true;
  if(/\b(roll(?:s|ed|ing)?|slide(?:s|d)?|stack(?:s|able|ed|ing)?|flat\s*face)\b/.test(s)) return true;
  // Real-world solids
  if(/\b(ball|basketball|football|soccer\s*ball|dice|die|cereal\s*box|soup\s*can|tin\s*can|soda\s*can|ice\s*cream\s*cone|tent|globe|orange|book|brick)\b/.test(s)) return true;
  return false;
}
function isFlatShapePrompt(t){
  const s = String(t || '').toLowerCase();
  if(/\b(side(s)?|corner(s)?|vertex|vertices|polygon|quadrilateral|right\s*angle|stop\s*sign|2D|2-D|two[- ]dimensional|flat\s*shape|equal\s*sides)\b/.test(s)) return true;
  for(const name of FLAT_SHAPES){
    const re = new RegExp('\\b' + name.replace(/\s+/g, '\\s+') + 's?\\b');
    if(re.test(s)) return true;
  }
  return false;
}
function isFEVPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(faces?|edges?|vertex|vertices|corners?\s*(?:of|on)\s*(?:a|the)\s*(?:cube|sphere|cylinder|cone|pyramid|prism))\b/.test(s);
}
function isCompoundFEVPrompt(t){
  const s = String(t || '').toLowerCase();
  return isFEVPrompt(s) && /\b(and|both)\b/.test(s) && /\b(faces?|edges?|vertex|vertices)\b.*\b(faces?|edges?|vertex|vertices)\b/.test(s);
}
function isSizePrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(largest|biggest|smallest|tallest|shortest|widest|longest|biggest\s*(?:shape|one)|smallest\s*(?:shape|one))\b/.test(s);
}
function isColorPrompt(t){
  const s = String(t || '').toLowerCase();
  return /\b(red|blue|green|yellow|orange|purple|pink|black|white|gray|grey|brown)\b/.test(s) && /\b(shape|color)/i.test(s);
}
function isYesNoOption(s){
  const t = String(s || '').trim().toLowerCase();
  return /^(yes|no|true|false|maybe|sometimes|cannot\s*tell|cannot\s*say|it\s*depends)$/.test(t);
}
function isAvoidanceText(s){
  const t = String(s || '').trim().toLowerCase();
  return /^(cannot|cannot\s*(?:tell|say)|you\s*cannot(?:\s*(?:tell|say))?|it\s*depends(?:\s*on.*)?|depends(?:\s*on.*)?|not\s*enough\s*info|i\s*(?:don'?t|do\s*not)\s*know|impossible|maybe|sometimes|neither|none)$/.test(t);
}
function isCategoryText(s){
  if(typeof s !== 'string') return false;
  const t = s.trim();
  if(!t) return false;
  if(/^-?\d+(\.\d+)?$/.test(t)) return false;       // pure number
  return /[A-Za-z]/.test(t);
}
function asksWhichFeatureFEV(t){
  // returns 'faces' | 'edges' | 'vertices' | null
  const s = String(t || '').toLowerCase();
  // Check vertices first (more specific)
  if(/\b(vertex|vertices|corners?\s*(?:does|on|of)\s*(?:a|the)\s*(?:cube|sphere|cylinder|cone|pyramid|prism))\b/.test(s)) return 'vertices';
  if(/\bedges?\b/.test(s)) return 'edges';
  if(/\bfaces?\b/.test(s)) return 'faces';
  return null;
}

// ───── lessonId classifier (testBank/unitQuiz; first-match-wins) ─────
const reviewItems = [];

function classifyLessonId(prompt, options){
  const t = String(prompt || '');
  // 1. Symmetry first (most specific lexicon)
  if(isSymmetryPrompt(t)) return { id: 'u9l3', confident: true };
  // 2. 3D / solid shapes (faces, edges, vertices, named solids, real-world solids, motion)
  if(isSolidPrompt(t)) return { id: 'u9l2', confident: true };
  // 3. 2D / flat shapes (sides, corners, polygon names)
  if(isFlatShapePrompt(t)) return { id: 'u9l1', confident: true };
  // 4. Fallback → u9l1 (most common geometry topic) with low confidence flag
  return { id: 'u9l1', confident: false };
}

// ───── Distractor classifier ─────
const heuristicCounts = {
  err_shape_name_confusion: 0,
  err_face_edge_vertex_confusion: 0,
  err_side_count_confusion: 0,
  err_vertex_count_confusion: 0,
  err_2d_3d_confusion: 0,
  err_symmetry_confusion: 0,
  err_attribute_confusion: 0,
  err_size_distractor: 0,
  err_color_distractor: 0,
  err_off_by_one: 0,
  err_under_count: 0,
  err_over_count: 0,
  err_magnitude_error: 0,
  err_confused: 0,
};

function classifyDistractor(wrongVal, correctVal, prompt, lessonId, allOptions){
  const wRaw = String(wrongVal);
  const cRaw = String(correctVal);
  const wStr = wRaw.startsWith('<') ? stripTags(wRaw) : wRaw;
  const cStr = cRaw.startsWith('<') ? stripTags(cRaw) : cRaw;
  const wn = getNumericValue(wStr);
  const cn = getNumericValue(cStr);
  const wLower = wStr.trim().toLowerCase();
  const cLower = cStr.trim().toLowerCase();
  const wrongIsCategory = isCategoryText(wStr);
  const correctIsCategory = isCategoryText(cStr);
  const t = String(prompt || '');
  const isSym = lessonId === 'u9l3' || isSymmetryPrompt(t);
  const isSolid = lessonId === 'u9l2' || isSolidPrompt(t);
  const isFlat = lessonId === 'u9l1' || isFlatShapePrompt(t);
  const wrongFlatShape = detectFlatShapeInText(wStr);
  const wrongSolidShape = detectSolidInText(wStr);
  const correctFlatShape = detectFlatShapeInText(cStr);
  const correctSolidShape = detectSolidInText(cStr);

  // ============= 0a. AVOIDANCE / REFUSAL ANSWERS =============
  if(isAvoidanceText(wStr)){
    if(isSym) return { tag: 'err_symmetry_confusion', patternTag: 'pattern_wrong_symmetry_judgment' };
    if(isSolid) return { tag: 'err_face_edge_vertex_confusion', patternTag: 'pattern_needs_review' };
    return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
  }

  // ============= 0b. YES/NO IN SYMMETRY CONTEXT =============
  if(isSym && isYesNoOption(wStr)){
    return { tag: 'err_symmetry_confusion', patternTag: isLetterSymmetryPrompt(t) ? 'pattern_wrong_letter_symmetry' : 'pattern_wrong_symmetry_judgment' };
  }

  // ============= 1. SHAPE_NAME_MAP — 2D shape pick =============
  // Both sides are 2D shape names but different
  if(wrongFlatShape && correctFlatShape && wrongFlatShape !== correctFlatShape && !isSolid){
    return { tag: 'err_shape_name_confusion', patternTag: 'pattern_wrong_shape_name' };
  }

  // ============= 2. SOLID_SHAPE_NAME_MAP — 3D shape pick =============
  if(wrongSolidShape && correctSolidShape && wrongSolidShape !== correctSolidShape){
    return { tag: 'err_shape_name_confusion', patternTag: 'pattern_wrong_solid_name' };
  }

  // ============= 5 (early). FLAT_VS_SOLID — category mismatch =============
  // wrong is a solid name, correct is a flat-shape name (or vice versa)
  if(wrongSolidShape && correctFlatShape && !correctSolidShape){
    return { tag: 'err_2d_3d_confusion', patternTag: 'pattern_2d_3d_confusion' };
  }
  if(wrongFlatShape && correctSolidShape && !correctFlatShape){
    return { tag: 'err_2d_3d_confusion', patternTag: 'pattern_2d_3d_confusion' };
  }

  // ============= 13. OBJECT_TO_SOLID — real-world mismatch =============
  // Prompt mentions a real-world object → wrong is the wrong solid
  if(/\b(ball|basketball|football|dice|die|cereal\s*box|soup\s*can|tin\s*can|soda\s*can|ice\s*cream\s*cone|tent|globe|orange|book|brick)\b/i.test(t) && wrongSolidShape){
    return { tag: 'err_shape_name_confusion', patternTag: 'pattern_wrong_real_world_match' };
  }

  // ============= 3. FACES_EDGES_VERTICES_SWAP =============
  if(isSolid && wn !== null && cn !== null){
    const promptSolid = detectSolidInText(t);
    const feature = asksWhichFeatureFEV(t);
    if(promptSolid && SOLID_FEV[promptSolid] && feature){
      const fev = SOLID_FEV[promptSolid];
      const featureKey = feature === 'faces' ? 'f' : feature === 'edges' ? 'e' : 'v';
      const otherFeatures = ['f','e','v'].filter(k => k !== featureKey);
      // wrong matches one of the OTHER features → swap
      if(otherFeatures.some(k => fev[k] === wn) && wn !== fev[featureKey]){
        return { tag: 'err_face_edge_vertex_confusion', patternTag: 'pattern_swapped_face_edge_vertex' };
      }
    }
  }

  // ============= 4. SIDE_COUNT / VERTEX_COUNT mismatch =============
  if(isFlat && !isSolid && wn !== null && cn !== null){
    const promptFlat = detectFlatShapeInText(t);
    const asksSides = /\bside(s)?\b/i.test(t);
    const asksCorners = /\b(corner(s)?|vertex|vertices)\b/i.test(t);
    if(promptFlat && (asksSides || asksCorners)){
      // Wrong number is the count of a DIFFERENT well-known flat shape (e.g., asked "how many sides does a hexagon have", wrong = 4)
      const isKnownFlatCount = Object.values(FLAT_COUNTS).includes(wn);
      if(isKnownFlatCount && wn !== cn){
        if(asksSides) return { tag: 'err_side_count_confusion', patternTag: 'pattern_wrong_side_count' };
        if(asksCorners) return { tag: 'err_vertex_count_confusion', patternTag: 'pattern_wrong_vertex_count' };
      }
    }
  }

  // ============= 8/9. SYMMETRY rules (numeric line count + categorical) =============
  if(isSym){
    if(wn !== null && cn !== null){
      return { tag: 'err_symmetry_confusion', patternTag: 'pattern_wrong_line_count' };
    }
    // "infinite", "many", "none" — symmetry-line-count text answers
    if(/^(infinite|infinitely\s*many|many|countless|none|zero|all|some)$/i.test(wLower)){
      return { tag: 'err_symmetry_confusion', patternTag: 'pattern_wrong_line_count' };
    }
    if(wrongIsCategory){
      return { tag: 'err_symmetry_confusion', patternTag: isLetterSymmetryPrompt(t) ? 'pattern_wrong_letter_symmetry' : 'pattern_wrong_symmetry_judgment' };
    }
  }

  // ============= 11/12. ATTRIBUTE rules (right angle, equal sides, motion) =============
  // Roll/slide/stack property answers
  if(isSolid && /\b(roll|slide|stack)/i.test(t)){
    if(wrongSolidShape || /^(yes|no|true|false)$/.test(wLower)){
      return { tag: 'err_attribute_confusion', patternTag: 'pattern_wrong_motion_property' };
    }
  }
  // Right-angle / equal-sides attribute prompts (square vs rectangle vs rhombus)
  if(/\b(right\s*angle|right\s*angles|equal\s*sides|all\s*sides\s*(?:the\s*same|equal)|equal\s*length|same\s*length|all\s*4\s*sides)\b/i.test(t)){
    if(wrongFlatShape || /^(yes|no|true|false)$/.test(wLower) || wrongIsCategory){
      return { tag: 'err_attribute_confusion', patternTag: 'pattern_wrong_attribute' };
    }
  }

  // ============= 14a. SIZE distractor =============
  if(isSizePrompt(t) && (wrongFlatShape || wrongSolidShape || wrongIsCategory)){
    return { tag: 'err_size_distractor', patternTag: 'pattern_wrong_size_pick' };
  }
  // ============= 14b. COLOR distractor =============
  if(isColorPrompt(t) && (wrongFlatShape || wrongSolidShape || wrongIsCategory)){
    return { tag: 'err_color_distractor', patternTag: 'pattern_wrong_color_pick' };
  }

  // ============= 6/7. NUMERIC: off-by-one + over/under + magnitude =============
  if(wn !== null && cn !== null){
    const delta = wn - cn;
    const absDelta = Math.abs(delta);
    if(absDelta === 1){
      return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
    }
    if(cn !== 0 && wn !== 0){
      if(wn === cn * 10) return { tag: 'err_magnitude_error', patternTag: 'pattern_too_high' };
      if(cn % 10 === 0 && wn === cn / 10) return { tag: 'err_magnitude_error', patternTag: 'pattern_too_low' };
    }
    if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
    return { tag: 'err_over_count', patternTag: 'pattern_too_high' };
  }

  // ============= Category fallbacks for shape contexts =============
  // Wrong is a flat shape word in any flat-shape prompt
  if(wrongFlatShape && (isFlat || isFlatShapePrompt(t))){
    return { tag: 'err_shape_name_confusion', patternTag: 'pattern_wrong_shape_name' };
  }
  // Wrong is a solid shape word in any solid prompt
  if(wrongSolidShape && (isSolid || isSolidPrompt(t))){
    return { tag: 'err_shape_name_confusion', patternTag: 'pattern_wrong_solid_name' };
  }
  // Yes/No in solid/flat context — attribute confusion
  if((isSolid || isFlat) && /^(yes|no|true|false)$/.test(wLower)){
    return { tag: 'err_attribute_confusion', patternTag: 'pattern_wrong_attribute' };
  }
  // Generic "all/none/both/neither" in geometry context
  if(/^(all|none|both|neither|all\s*of\s*(?:them|the\s*above)|none\s*of\s*(?:them|the\s*above))$/.test(wLower)){
    if(isSolid) return { tag: 'err_face_edge_vertex_confusion', patternTag: 'pattern_needs_review' };
    if(isSym) return { tag: 'err_symmetry_confusion', patternTag: 'pattern_wrong_symmetry_judgment' };
    return { tag: 'err_attribute_confusion', patternTag: 'pattern_wrong_attribute' };
  }

  // ============= FINAL FALLBACK =============
  return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
}

// ───── Option converter ─────
const stats = {
  totalQuestions: 0,
  qBankConverted: 0,
  testBankConverted: 0,
  unitQuizConverted: 0,
  alreadyObjectForm: 0,
  ambiguousLessonIds: 0,
  indexMismatches: 0,
  totalDistractors: 0,
  negativeDistractors: 0,
};

function isBareStringOptions(o){
  return Array.isArray(o) && o.length > 0 && o.every(x => typeof x === 'string' || typeof x === 'number');
}

function convertOptions(q, where, lessonId){
  if(!q || !Array.isArray(q.o)) return;
  const a = q.a;
  if(!Number.isInteger(a) || a < 0 || a >= q.o.length){
    console.error(`FATAL: out-of-range answer index a=${a} in ${where}: ${JSON.stringify(q).slice(0,160)}`);
    process.exit(1);
  }
  if(!isBareStringOptions(q.o)){
    stats.alreadyObjectForm++;
    q.o.forEach((opt, i) => {
      if(typeof opt !== 'object' || opt === null || !('val' in opt)){
        console.error(`FATAL: malformed option in ${where} at index ${i}: ${JSON.stringify(opt)}`);
        process.exit(1);
      }
    });
    return;
  }

  const originalCorrect = q.o[a];

  const newOpts = q.o.map((val, i) => {
    if(i === a){
      return { val: String(val) };
    }
    const cls = classifyDistractor(val, originalCorrect, q.t, lessonId, q.o);
    heuristicCounts[cls.tag] = (heuristicCounts[cls.tag] || 0) + 1;
    stats.totalDistractors++;
    if(cls.tag === 'err_confused'){
      const promptText = String(q.t || '').replace(/<[^>]+>/g, ' ').slice(0, 140);
      reviewItems.push(`fallback distractor in ${where}: prompt="${promptText}" correct="${String(originalCorrect).slice(0,80)}" wrong="${String(val).slice(0,80)}"`);
    }
    // Negative-integer sanity check (no negative counts in geometry)
    const n = tryParseInt(String(val));
    if(n !== null && n < 0){
      stats.negativeDistractors++;
      console.error(`FATAL: negative distractor in ${where}: "${val}"`);
      process.exit(1);
    }
    return { val: String(val), tag: cls.tag, patternTag: cls.patternTag };
  });

  // Duplicate detection
  const seen = new Set();
  for(const opt of newOpts){
    if(seen.has(opt.val)){
      console.error(`FATAL: duplicate option val="${opt.val}" in ${where}: ${JSON.stringify(newOpts)}`);
      process.exit(1);
    }
    seen.add(opt.val);
  }

  // Correct-index preservation
  if(newOpts[a].val !== String(originalCorrect)){
    console.error(`FATAL: correct-answer drift in ${where}: was "${originalCorrect}", now "${newOpts[a].val}"`);
    stats.indexMismatches++;
    process.exit(1);
  }

  q.o = newOpts;
}

// ───── Walk + transform ─────
data.lessons.forEach((lesson, lessonIdx) => {
  const lessonId = `u9l${lessonIdx + 1}`;
  if(Array.isArray(lesson.qBank)){
    lesson.qBank.forEach((q, qi) => {
      stats.totalQuestions++;
      q.lessonId = lessonId;
      convertOptions(q, `qBank[${lessonId}][${qi}]`, lessonId);
      stats.qBankConverted++;
    });
  }
});

if(Array.isArray(data.testBank)){
  data.testBank.forEach((q, qi) => {
    stats.totalQuestions++;
    const cls = classifyLessonId(q.t, q.o);
    q.lessonId = cls.id;
    if(!cls.confident){
      stats.ambiguousLessonIds++;
      const promptText = String(q.t || '').replace(/<[^>]+>/g, ' ').slice(0, 140);
      reviewItems.push(`testBank[${qi}] -> ${cls.id} (low confidence): ${promptText}`);
    }
    convertOptions(q, `testBank[${qi}]`, cls.id);
    stats.testBankConverted++;
  });
}

if(Array.isArray(data.unitQuiz)){
  data.unitQuiz.forEach((q, qi) => {
    stats.totalQuestions++;
    const cls = classifyLessonId(q.t, q.o);
    q.lessonId = cls.id;
    if(!cls.confident){
      stats.ambiguousLessonIds++;
      const promptText = String(q.t || '').replace(/<[^>]+>/g, ' ').slice(0, 140);
      reviewItems.push(`unitQuiz[${qi}] -> ${cls.id} (low confidence): ${promptText}`);
    }
    convertOptions(q, `unitQuiz[${qi}]`, cls.id);
    stats.unitQuizConverted++;
  });
}

// ───── Per-question s-field byte-equality gate ─────
let sGateChecked = 0, sGateFailed = 0;
for(const snap of sSnapshots){
  sGateChecked++;
  if(snap.ref.s !== snap.orig){
    sGateFailed++;
    console.error(`FATAL: s-field byte-equality gate failed at ${snap.where}`);
    console.error(`  prompt: ${String(snap.ref.t).slice(0,120)}`);
    console.error(`  before length: ${snap.orig.length}, after length: ${String(snap.ref.s).length}`);
    process.exit(1);
  }
}

// ───── Per-lesson distribution (for report) ─────
const perLesson = { u9l1: 0, u9l2: 0, u9l3: 0 };
data.lessons.forEach((lesson, idx) => {
  const id = `u9l${idx+1}`;
  if(Array.isArray(lesson.qBank)) perLesson[id] = (perLesson[id] || 0) + lesson.qBank.length;
});
if(Array.isArray(data.testBank)){
  data.testBank.forEach(q => { perLesson[q.lessonId] = (perLesson[q.lessonId] || 0) + 1; });
}
if(Array.isArray(data.unitQuiz)){
  data.unitQuiz.forEach(q => { perLesson[q.lessonId] = (perLesson[q.lessonId] || 0) + 1; });
}

// ───── Write review file ─────
fs.writeFileSync(REVIEW_PATH, reviewItems.join('\n') + '\n', 'utf8');

// ───── Re-emit u9.js ─────
const header = '// Unit 9: Geometry\n';
const body = '_mergeUnitData(8, ' + JSON.stringify(data) + ');\n';
fs.writeFileSync(U9_PATH, header + body, 'utf8');

// ───── Report ─────
const errConfused = heuristicCounts.err_confused || 0;
const errConfusedPct = stats.totalDistractors > 0 ? (errConfused / stats.totalDistractors * 100) : 0;

console.log('=== migrate_u9_phase2 ===');
console.log(JSON.stringify({
  stats,
  perLesson,
  heuristicCounts,
  errConfusedPct: Number(errConfusedPct.toFixed(2)),
  reviewListSize: reviewItems.length,
  sGate: { checked: sGateChecked, failed: sGateFailed }
}, null, 2));
console.log('Wrote:', U9_PATH);
console.log('Review list:', REVIEW_PATH, `(${reviewItems.length} items)`);
console.log(`s-field byte-equality gate: ${sGateChecked} questions checked, ${sGateFailed} mismatches`);
console.log(`err_confused: ${errConfused} / ${stats.totalDistractors} = ${errConfusedPct.toFixed(2)}%  (threshold ≤ 15%)`);
if(errConfusedPct > 15){
  console.error('WARN: err_confused above 15% threshold — strengthen classifier and rerun');
  process.exit(2);
}
