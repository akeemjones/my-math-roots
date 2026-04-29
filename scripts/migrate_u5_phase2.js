#!/usr/bin/env node
// scripts/migrate_u5_phase2.js
// One-shot transform for Grade 2 Unit 5 (Money & Financial Literacy) Phase 2 activation.
//   - Adds lessonId to every qBank/testBank/unitQuiz question
//   - Converts bare-string answer-option arrays to {val, tag, patternTag} object form
//   - Preserves the correct-answer index `a` (asserts o[a].val === original correct value)
//   - PRESERVES `s`-field SVG/HTML byte-for-byte per question (strict triple-equals gate)
//   - Writes review list for ambiguous lessonId classification + fallback distractors
//   - Re-emits src/data/u5.js with the transformed payload
//
// NOTE: backup (cp src/data/u5.js src/data/u5.js.bak) and pre-edit git tag
// (git tag phase2-u5-pre-edit) are run as EXPLICIT terminal commands BEFORE this script.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const U5_PATH = path.join(REPO_ROOT, 'src', 'data', 'u5.js');
const REVIEW_PATH = path.join(REPO_ROOT, 'scripts', 'u5_review.txt');

// ───── Load u5.js by stubbing _mergeUnitData ─────
let captured = null;
global._mergeUnitData = function(idx, data){ captured = { idx, data }; };
require(U5_PATH);
if(!captured) { console.error('FATAL: _mergeUnitData not called'); process.exit(1); }
const { idx, data } = captured;
if(idx !== 4) { console.error('FATAL: expected idx=4 for u5, got', idx); process.exit(1); }

// ───── Snapshot s-fields BEFORE any transformation ─────
// Per-question byte-equality gate: every question that had s before migration
// must have an identical s string (===) after migration.
const sSnapshots = []; // { ref, orig }
function snapshotS(q, where){
  if(q && typeof q.s === 'string'){
    sSnapshots.push({ ref: q, where, orig: q.s });
  }
}
data.lessons.forEach((lesson, li) => {
  (lesson.qBank || []).forEach((q, qi) => snapshotS(q, `qBank[u5l${li+1}][${qi}]`));
});
(data.testBank || []).forEach((q, qi) => snapshotS(q, `testBank[${qi}]`));
(data.unitQuiz || []).forEach((q, qi) => snapshotS(q, `unitQuiz[${qi}]`));

// ───── Numeric & money helpers ─────
function tryParseInt(s){
  if(typeof s === 'number') return Number.isFinite(s) ? s : null;
  const cleaned = String(s).trim().replace(/,/g, '');
  const m = cleaned.match(/^-?\d+$/);
  return m ? parseInt(m[0], 10) : null;
}

// Parse any money-shaped string to integer cents.
//   "25¢"        → 25
//   "$0.25"      → 25
//   "$1.00"      → 100
//   "$1.25"      → 125
//   "100 cents"  → 100
//   "1 dollar"   → 100
//   "75 cents"   → 75
//   "$25"        → 2500   (intentional: $25 = 2500¢)
//   "0.25"       → null   (no symbol, no unit — caller decides)
function parseMoneyValueToCents(s){
  if(typeof s !== 'string') return null;
  const t = s.trim();
  // ¢ form: digits + ¢ or "cent(s)"
  const cMatch = t.match(/^(\d+)\s*(?:¢|cents?)$/i);
  if(cMatch) return parseInt(cMatch[1], 10);
  // $ form with decimal: $X.YY or $X.Y
  const dollarDec = t.match(/^\$\s*(\d+)\.(\d{1,2})$/);
  if(dollarDec){
    const dollars = parseInt(dollarDec[1], 10);
    let centsStr = dollarDec[2];
    if(centsStr.length === 1) centsStr = centsStr + '0'; // $1.5 → 150
    return dollars * 100 + parseInt(centsStr, 10);
  }
  // $ form whole dollars: $X (no decimal)
  const dollarWhole = t.match(/^\$\s*(\d+)$/);
  if(dollarWhole) return parseInt(dollarWhole[1], 10) * 100;
  // "N dollar(s)" form
  const dollarWord = t.match(/^(\d+)\s*dollars?$/i);
  if(dollarWord) return parseInt(dollarWord[1], 10) * 100;
  return null;
}

function isDollarNotation(s){ return typeof s === 'string' && /\$\s*\d/.test(s); }
function isCentNotation(s){ return typeof s === 'string' && /(¢|\bcents?\b)/i.test(s); }
function isMoneyValue(s){ return parseMoneyValueToCents(s) !== null; }

// Pull last integer from a text option ("about 80¢" → 80, "No, it's 50¢" → 50)
function extractLastNumberFromText(s){
  if(typeof s !== 'string') return null;
  const cleaned = s.replace(/,/g, '');
  const matches = cleaned.match(/-?\d+/g);
  if(!matches || matches.length === 0) return null;
  return parseInt(matches[matches.length - 1], 10);
}

// Expression parser: "30¢ + 5¢" → 35, "$1.00 - $0.25" → 75 (cents), "30 + 5" → 35
function parseExpressionToNumber(s){
  if(typeof s !== 'string') return null;
  const cleaned = s.trim();
  // Money expressions: "X + Y" where X/Y are money values
  const moneyBin = cleaned.match(/^(\$?\s*\d+(?:\.\d{1,2})?¢?(?:\s*cents?)?(?:\s*dollars?)?)\s*([+\-−])\s*(\$?\s*\d+(?:\.\d{1,2})?¢?(?:\s*cents?)?(?:\s*dollars?)?)$/i);
  if(moneyBin){
    const aC = parseMoneyValueToCents(moneyBin[1]);
    const bC = parseMoneyValueToCents(moneyBin[3]);
    if(aC !== null && bC !== null){
      return moneyBin[2] === '+' ? aC + bC : aC - bC;
    }
  }
  // Plain int expression
  const intBin = cleaned.replace(/,/g,'').match(/^(\d+)\s*([+\-−])\s*(\d+)$/);
  if(intBin){
    const a = parseInt(intBin[1],10), b = parseInt(intBin[3],10);
    return intBin[2] === '+' ? a + b : a - b;
  }
  return null;
}

// Money-aware multi-strategy: cents → integer → expression → last int
function getNumericValue(s){
  const cents = parseMoneyValueToCents(s);
  if(cents !== null) return cents;
  const plain = tryParseInt(s);
  if(plain !== null) return plain;
  const expr = parseExpressionToNumber(s);
  if(expr !== null) return expr;
  const text = extractLastNumberFromText(s);
  if(text !== null) return text;
  return null;
}

// ───── Coin parsing helpers ─────
const COIN_VALUE = {
  penny: 1, pennies: 1,
  nickel: 5, nickels: 5,
  dime: 10, dimes: 10,
  quarter: 25, quarters: 25,
  'half-dollar': 50, 'half dollars': 50, 'half dollar': 50, 'half-dollars': 50,
  'dollar coin': 100, 'dollar coins': 100,
};
function coinValueInCents(name){
  const k = String(name).toLowerCase();
  return COIN_VALUE[k] != null ? COIN_VALUE[k] : null;
}
function isCoinName(s){
  if(typeof s !== 'string') return false;
  return /^\s*(penny|nickel|dime|quarter|half[- ]dollar|dollar coin)\s*$/i.test(s);
}

// Extract coin counts from a prompt: "2 dimes and 3 pennies" → { dime:2, penny:3, ... }
function extractCoinCountsFromPrompt(prompt){
  const out = { penny:0, nickel:0, dime:0, quarter:0, halfDollar:0, dollarCoin:0 };
  if(typeof prompt !== 'string') return out;
  const t = prompt.toLowerCase();
  // word-number map for occasional written numerals
  const wordNum = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };
  const NUM = '(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)';
  const grab = (re, key) => {
    const m = t.match(re);
    if(m){
      const n = wordNum[m[1].toLowerCase()] || parseInt(m[1], 10);
      if(Number.isFinite(n)) out[key] += n;
    }
  };
  grab(new RegExp(`${NUM}\\s+pennies\\b`), 'penny');
  grab(new RegExp(`${NUM}\\s+penny\\b`), 'penny');
  grab(new RegExp(`${NUM}\\s+nickels?\\b`), 'nickel');
  grab(new RegExp(`${NUM}\\s+dimes?\\b`), 'dime');
  grab(new RegExp(`${NUM}\\s+quarters?\\b`), 'quarter');
  grab(new RegExp(`${NUM}\\s+half[- ]dollars?\\b`), 'halfDollar');
  grab(new RegExp(`${NUM}\\s+dollar coins?\\b`), 'dollarCoin');
  // Singular "a quarter" / "a dime" / "a nickel" / "a penny"
  if(/\ba penny\b/.test(t)) out.penny += 1;
  if(/\ba nickel\b/.test(t)) out.nickel += 1;
  if(/\ba dime\b/.test(t)) out.dime += 1;
  if(/\ba quarter\b/.test(t)) out.quarter += 1;
  return out;
}

function computeCoinTotalFromPrompt(prompt){
  const c = extractCoinCountsFromPrompt(prompt);
  return c.penny*1 + c.nickel*5 + c.dime*10 + c.quarter*25 + c.halfDollar*50 + c.dollarCoin*100;
}
function totalCoinsInPrompt(prompt){
  const c = extractCoinCountsFromPrompt(prompt);
  return c.penny + c.nickel + c.dime + c.quarter + c.halfDollar + c.dollarCoin;
}

// ───── Financial-literacy keyword helpers ─────
function isFinancialLiteracyPrompt(prompt){
  const t = String(prompt || '').toLowerCase();
  return /\b(need|needs|want|wants)\s+(or|vs)\b/.test(t)
      || /\bneed or a want\b/.test(t)
      || /\bwant or a need\b/.test(t)
      || /\b(saving|spending|giving|donating|donate|share|sharing)\s+money\b/.test(t)
      || /\bsaves?\s+\$?\d+\s+every\b/.test(t)
      || /\bsave\s+\$?\d+\s+every\b/.test(t)
      || /\bwhat does (the word )?(save|saving|spend|spending|give|giving|budget|allowance|income)\b/.test(t)
      || /\bbest order for making money\b/.test(t)
      || /\bbest choice\b/.test(t) && /\b(money|allowance|earn)\b/.test(t)
      || /\bmoney decisions?\b/.test(t)
      || /\bsaved\b/.test(t) && /\bcosts?\b/.test(t) && /\bhow much more\b/.test(t)
      || /\bearn\b/.test(t) && /\bspend\b/.test(t)
      || /\bdonating\b/.test(t)
      || /\ban example of (giving|saving|spending)\b/.test(t)
      || /\bgood idea\b/.test(t) && /\bsav/.test(t)
      || /\bbudget\b/.test(t)
      || /\ballowance\b/.test(t);
}

function detectFinancialLiteracySkill(prompt){
  const t = String(prompt || '').toLowerCase();
  if(/\bneed or a want\b|\bwant or a need\b|\bneed vs want\b|\bwant vs need\b/.test(t)) return 'want_need';
  if(/\bsave|saving|spend|spending|give|giving|donate|donating|share|sharing\b/.test(t)) return 'save_spend_give';
  if(/\bincome|earn|earning|allowance|gift\b/.test(t)) return 'income_gift';
  return 'general';
}

// Classify a free-text option into a financial-literacy concept bucket.
// Returns: 'save' | 'spend' | 'give' | 'want' | 'need' | 'both' | 'neither' | null
function classifyFinancialOption(opt){
  if(typeof opt !== 'string') return null;
  const t = opt.trim().toLowerCase();
  if(/^need$/.test(t)) return 'need';
  if(/^want$/.test(t)) return 'want';
  if(/^both$/.test(t)) return 'both';
  if(/^neither$/.test(t)) return 'neither';
  // Phrase-level matching for explanation-style options
  if(/\b(keep|keeping|save|saving|store|storing)\b/.test(t)) return 'save';
  if(/\b(spend|spending|buy|buying|us(e|ing) (money )?to buy)\b/.test(t)) return 'spend';
  if(/\b(give|giving|share|sharing|donate|donating|charity)\b/.test(t)) return 'give';
  if(/\bincome|earn|earning|wage|paycheck\b/.test(t)) return 'income';
  if(/\bgift|present\b/.test(t) && !/\bgiving\b/.test(t)) return 'gift';
  if(/\ballowance\b/.test(t)) return 'allowance';
  return null;
}

// ───── More/less money comparison helpers ─────
function isMoneyComparisonPrompt(prompt){
  const t = String(prompt || '').toLowerCase();
  return /\b(more|less|greater|smaller|worth more|worth less|costs? more|costs? less|which is (more|less|greater)|put .* in order)\b/.test(t);
}
function detectMoreLessMoneyPrompt(prompt){
  const t = String(prompt || '').toLowerCase();
  if(/\b(less|smaller|worth less|costs? less|fewest|least)\b/.test(t)) return 'less';
  if(/\b(more|greater|worth more|costs? more|most)\b/.test(t)) return 'more';
  return null;
}

// ───── lessonId classifier (testBank/unitQuiz) ─────
const reviewItems = [];

function classifyLessonId(prompt, options){
  const t = String(prompt || '').toLowerCase();
  const opts = Array.isArray(options) ? options : [];

  // ── u5l4: Financial literacy first (so "save $1" doesn't fall to u5l3) ──
  if(/\bneed or a want\b|\bwant or a need\b|\bneed vs want\b/.test(t))
    return { id: 'u5l4', confident: true };
  if(/\bsaves?\s+\$?\d+\s+every\b|\bsave\s+\$?\d+\s+every\b/.test(t))
    return { id: 'u5l4', confident: true };
  if(/\bwhat does (the word )?(save|saving|spend|spending|give|giving|budget|allowance|income)\b/.test(t))
    return { id: 'u5l4', confident: true };
  if(/\bbest order for making money\b|\bmoney decisions?\b/.test(t))
    return { id: 'u5l4', confident: true };
  if(/\bdonat(e|ing)\b|\ban example of giving\b/.test(t))
    return { id: 'u5l4', confident: true };
  if(/\bbudget\b|\ballowance\b/.test(t))
    return { id: 'u5l4', confident: true };
  if(/\bearn(ed|s)?\b/.test(t) && /\bspen(d|t|ds)\b/.test(t) && !/\bcoins?\b/.test(t))
    return { id: 'u5l4', confident: true };
  if(/\b(saved|saving)\b/.test(t) && /\bbike|toy|costs?\b/.test(t) && /\bhow much more\b/.test(t))
    return { id: 'u5l4', confident: true };
  if(/\bgood idea\b/.test(t) && /\bsav/.test(t))
    return { id: 'u5l4', confident: true };
  // Need/Want/Both/Neither option set is a strong u5l4 signal
  if(opts.length === 4 && opts.every(o => /^(Need|Want|Both|Neither)$/i.test(String(o).trim()))){
    return { id: 'u5l4', confident: true };
  }

  // ── u5l3: Dollars and cents — $X.XX notation, decimal, dollar/cent equivalence ──
  if(/\bdecimal\b|\bdecimal point\b/.test(t))
    return { id: 'u5l3', confident: true };
  if(/\b100 cents\b|\bone dollar\b|\bequivalent to one dollar\b/.test(t))
    return { id: 'u5l3', confident: true };
  if(/\bhow do you write\b|\bhow to write\b|\bwrite this amount\b/.test(t) && /\$|\bdollar|\bcents?\b/.test(t))
    return { id: 'u5l3', confident: true };
  if(/\bconvert:?\b/.test(t))
    return { id: 'u5l3', confident: true };
  if(/\bwhich is (more|greater|less)\b|\bwhich amount is greater\b/.test(t) && /\$|¢/.test(prompt))
    return { id: 'u5l3', confident: true };
  if(/\bsame as\b/.test(t) && /\$|¢/.test(prompt))
    return { id: 'u5l3', confident: true };
  if(/\bwrote .+ as \$/.test(t) || /\bsays \$.+ is more than\b/.test(t))
    return { id: 'u5l3', confident: true };
  // Pure dollar arithmetic with $ on both sides: "$0.75 + $0.50"
  if(/\$\d+(\.\d+)?\s*[+\-−]\s*\$\d+(\.\d+)?/.test(prompt))
    return { id: 'u5l3', confident: true };
  // "How many cents are in $X" / "$X = ___¢"
  if(/\bhow many cents (are )?in \$/.test(t))
    return { id: 'u5l3', confident: true };
  if(/\$\d+\.\d+\s*=\s*___?¢|\$\d+\.\d+\s*=\s*___?\s*cents?/.test(prompt))
    return { id: 'u5l3', confident: true };

  // ── u5l2: Count your coins — multi-coin or skip-counting same coin ──
  if(/\bhow much money is shown\b|\bcount the money\b|\bcount:\b/.test(t))
    return { id: 'u5l2', confident: true };
  if(/\b\d+\s+(pennies|nickels|dimes|quarters|half[- ]dollars)\s*=\s*___\s*¢/.test(t))
    return { id: 'u5l2', confident: true };
  if(/\b\d+\s+(pennies|nickels|dimes|quarters)\b/.test(t) && /\band\b/.test(t) && /\b\d+\s+(pennies|nickels|dimes|quarters)\b/.test(t))
    return { id: 'u5l2', confident: true };
  if(/\bhow much money is \d+\s+(pennies|nickels|dimes|quarters)/.test(t))
    return { id: 'u5l2', confident: true };
  if(/\b\d+\s+(pennies|nickels|dimes|quarters)\b/.test(t) && /\bhow much\b|\b___\s*¢|\bworth\b/.test(t))
    return { id: 'u5l2', confident: true };
  // "X dimes = ___ pennies" style
  if(/\b\d+\s+(pennies|nickels|dimes|quarters)\b\s+is the same as|=\s*how many/.test(t))
    return { id: 'u5l2', confident: true };
  if(/\bwhich (group|set|pair) (of coins )?(equals|does not equal|equal)\b/.test(t))
    return { id: 'u5l2', confident: true };
  if(/\bfewest coins\b|\bwhich (way|set|group).*coins.*(make|equal|fewer|same amount)\b/.test(t))
    return { id: 'u5l2', confident: true };
  // Multi-coin owner "Diego has 3 dimes, 3 nickels..."
  if(/\bhas (\d+|a)\s+(pennies|penny|nickels?|dimes?|quarters?)\b.*\b(\d+|a)\s+(pennies|penny|nickels?|dimes?|quarters?)\b/.test(t))
    return { id: 'u5l2', confident: true };
  // "X coin and Y coin = ___¢"
  if(/\b(\d+|a)\s+(pennies|penny|nickels?|dimes?|quarters?)\b.*=\s*___\s*¢/.test(t))
    return { id: 'u5l2', confident: true };
  // Single denomination skip-count: "X dimes = ___¢" (without "and")
  if(/^\s*\d+\s+(pennies|nickels|dimes|quarters)\s*=\s*___\s*¢\s*$/i.test(prompt))
    return { id: 'u5l2', confident: true };

  // ── u5l1: All About Coins — single coin name/value ──
  if(/\bhow much is (a |the )?(penny|nickel|dime|quarter|half[- ]dollar)\b/.test(t))
    return { id: 'u5l1', confident: true };
  if(/\bwhich coin\b|\bwhat coin\b/.test(t))
    return { id: 'u5l1', confident: true };
  if(/\bhow many cents (is|are) (a |1 |one )?(penny|nickel|dime|quarter|half[- ]dollar)\b/.test(t))
    return { id: 'u5l1', confident: true };
  if(/\bis (a |the )?(penny|nickel|dime|quarter) worth (more|less)\b/.test(t))
    return { id: 'u5l1', confident: true };
  if(/\bhow much is this coin worth\b/.test(t))
    return { id: 'u5l1', confident: true };
  if(/\b(penny|nickel|dime|quarter)\b.*\b(largest|smallest|copper|silver)\b/.test(t)
    || /\b(largest|smallest|copper|silver)\b.*\b(penny|nickel|dime|quarter)\b/.test(t))
    return { id: 'u5l1', confident: true };
  if(/\b100 pennies\b/.test(t)) return { id: 'u5l1', confident: true };
  if(/\bput these coins in order\b|\bput .* in order from least\b/.test(t))
    return { id: 'u5l1', confident: true };

  // Fallback to u5l1, log to review
  return { id: 'u5l1', confident: false };
}

// ───── Distractor classifier ─────
const heuristicCounts = {
  err_coin_value_confusion: 0,
  err_coin_name_confusion: 0,
  err_counted_coins_not_value: 0,
  err_counting_coins_error: 0,
  err_skip_count_error: 0,
  err_dollars_cents_confusion: 0,
  err_more_less_money_confusion: 0,
  err_financial_literacy_confusion: 0,
  err_want_need_confusion: 0,
  err_save_spend_give_confusion: 0,
  err_income_gift_confusion: 0,
  err_off_by_one: 0,
  err_under_count: 0,
  err_over_count: 0,
  err_magnitude_error: 0,
  err_confused: 0,
};

function classifyDistractor(wrongVal, correctVal, prompt, lessonId, allOptions){
  const wStr = String(wrongVal);
  const cStr = String(correctVal);
  const wn = getNumericValue(wStr);
  const cn = getNumericValue(cStr);

  // ── Rule 1: Financial literacy (text options or u5l4 prompts) ──
  const isFinLit = lessonId === 'u5l4' || isFinancialLiteracyPrompt(prompt);
  if(isFinLit){
    const wCat = classifyFinancialOption(wStr);
    const cCat = classifyFinancialOption(cStr);

    // Want vs need swap
    if((cCat === 'need' && wCat === 'want') || (cCat === 'want' && wCat === 'need')){
      return { tag: 'err_want_need_confusion', patternTag: 'pattern_want_need_mixup' };
    }
    // "Both" / "Neither" against need/want
    if((cCat === 'need' || cCat === 'want') && (wCat === 'both' || wCat === 'neither')){
      return { tag: 'err_want_need_confusion', patternTag: 'pattern_want_need_mixup' };
    }
    // Save/Spend/Give swaps
    const sgSet = new Set(['save','spend','give']);
    if(sgSet.has(cCat) && sgSet.has(wCat) && cCat !== wCat){
      return { tag: 'err_save_spend_give_confusion', patternTag: 'pattern_save_spend_give_mixup' };
    }
    // Income vs gift/allowance
    if((cCat === 'income' && (wCat === 'gift' || wCat === 'allowance'))
       || ((cCat === 'gift' || cCat === 'allowance') && wCat === 'income')){
      return { tag: 'err_income_gift_confusion', patternTag: 'pattern_confuses_gift_income' };
    }

    // Numeric rules still apply for u5l4 word-problem prompts (e.g. "save $5 for 3 weeks")
    if(wn !== null && cn !== null){
      const delta = wn - cn;
      const absDelta = Math.abs(delta);
      if(absDelta === 1) return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
      // Continue past — fall through to general numeric rules
    }
    // If neither rule matched but lesson is u5l4 with text options → financial fallback
    if(wn === null || cn === null){
      return { tag: 'err_financial_literacy_confusion', patternTag: 'pattern_needs_review' };
    }
  }

  // ── Rule 2: Coin name confusion (u5l1 single-coin name prompts) ──
  if(lessonId === 'u5l1' || /\bwhich coin\b|\bwhat coin\b/i.test(prompt)){
    if(isCoinName(cStr) && isCoinName(wStr) && cStr.trim().toLowerCase() !== wStr.trim().toLowerCase()){
      return { tag: 'err_coin_name_confusion', patternTag: 'pattern_coin_name_swap' };
    }
  }

  // ── Rule 3: Non-numeric specialized rules (text options that didn't match 1-2) ──
  if(wn === null || cn === null){
    const wT = String(wrongVal).trim();
    const cT = String(correctVal).trim();
    const wL = wT.toLowerCase();
    const cL = cT.toLowerCase();

    // 3a: True/False/Yes/No assertion
    if(/^(true|false|yes|no)$/i.test(wL) || /^(true|false|yes|no)$/i.test(cL)){
      if(lessonId === 'u5l4') return { tag: 'err_financial_literacy_confusion', patternTag: 'pattern_wrong_assertion' };
      if(lessonId === 'u5l3') return { tag: 'err_dollars_cents_confusion', patternTag: 'pattern_wrong_assertion' };
      return { tag: 'err_coin_value_confusion', patternTag: 'pattern_wrong_assertion' };
    }
    // 3b: "Equal"/"Same"/"They are equal" — student misjudged equality in comparison
    if(/^(equal|same|they are (equal|the same)|the same|they have the same( amount)?)$/i.test(wL)){
      return { tag: 'err_more_less_money_confusion', patternTag: 'pattern_thinks_equal' };
    }
    // 3c: Avoidance / non-committal options
    if(/^(not enough info|cannot tell|depends|sometimes|it depends|just guess)$/i.test(wL)){
      if(lessonId === 'u5l4') return { tag: 'err_financial_literacy_confusion', patternTag: 'pattern_avoidance' };
      return { tag: 'err_coin_value_confusion', patternTag: 'pattern_avoidance' };
    }
    // 3d: Strategy / order options
    if(/\b(biggest|smallest|first|count by|in order|strategy|count all|count everything)\b/i.test(cL)
       || /\b(biggest|smallest|first|count by|count all|count everything|just guess|any order)\b/i.test(wL)){
      return { tag: 'err_counting_coins_error', patternTag: 'pattern_wrong_strategy' };
    }
    // 3e: Coin sequence list (e.g., "Penny, nickel, dime, quarter")
    if(/(penny|pennies)[,\s].+(nickel|dime|quarter)/i.test(cL) && /(penny|pennies)[,\s].+(nickel|dime|quarter)/i.test(wL)){
      return { tag: 'err_coin_value_confusion', patternTag: 'pattern_wrong_coin_order' };
    }
    // 3f: Coin set option (e.g., "3 dimes" vs "2 quarters")
    if(/\b\d+\s+(pennies|nickels?|dimes?|quarters?)\b/i.test(cL) || /\b\d+\s+(pennies|nickels?|dimes?|quarters?)\b/i.test(wL)){
      return { tag: 'err_coin_value_confusion', patternTag: 'pattern_wrong_coin_set' };
    }
    // 3g: Person-name comparison ("Mia" vs "Jayden")
    if(/^[A-Z][a-z]+$/.test(cT) && /^[A-Z][a-z]+$/.test(wT)){
      return { tag: 'err_more_less_money_confusion', patternTag: 'pattern_wrong_person_more_money' };
    }
    // 3h: Meta-options (Both A and B / Only X / All of the above)
    if(/^both [a-c] and [a-c]$|^both are (right|correct)$|^only [a-z]+$|^all of the above$|^neither is (right|correct)$/i.test(wL)
       || /^both [a-c] and [a-c]$|^both are (right|correct)$|^only [a-z]+$|^all of the above$/i.test(cL)){
      if(lessonId === 'u5l3') return { tag: 'err_dollars_cents_confusion', patternTag: 'pattern_wrong_meta_option' };
      return { tag: 'err_coin_value_confusion', patternTag: 'pattern_wrong_meta_option' };
    }
    // 3i: Verification phrasing ("Yes, that is correct" / "No, it is 60¢")
    if(/^yes,? that is correct$|^yes,? he is right$|^yes,? she is right$|^no,? it is /i.test(wL)
       || /^yes,? that is correct$|^no,? it is /i.test(cL)){
      if(lessonId === 'u5l4') return { tag: 'err_financial_literacy_confusion', patternTag: 'pattern_wrong_assertion' };
      return { tag: 'err_coin_value_confusion', patternTag: 'pattern_wrong_assertion' };
    }
    // 3j: Domain fallback by lesson
    if(lessonId === 'u5l4') return { tag: 'err_financial_literacy_confusion', patternTag: 'pattern_needs_review' };
    if(lessonId === 'u5l3') return { tag: 'err_dollars_cents_confusion', patternTag: 'pattern_money_text_distractor' };
    if(lessonId === 'u5l2') return { tag: 'err_counting_coins_error', patternTag: 'pattern_money_text_distractor' };
    if(lessonId === 'u5l1') return { tag: 'err_coin_value_confusion', patternTag: 'pattern_money_text_distractor' };
    return { tag: 'err_confused', patternTag: 'pattern_needs_review' };
  }

  const delta = wn - cn;
  const absDelta = Math.abs(delta);

  // ── Rule 4: u5l1 standard coin-value confusion ──
  if(lessonId === 'u5l1' || /\bhow much is this coin worth\b|\bhow much is (a |the )?(penny|nickel|dime|quarter)/i.test(prompt)){
    const STD = new Set([1,5,10,25,50,100]);
    if(STD.has(wn) && STD.has(cn) && wn !== cn){
      return { tag: 'err_coin_value_confusion', patternTag: 'pattern_wrong_coin_value' };
    }
  }

  // ── Rule 5: Counting-coin specific errors (u5l2) ──
  if(lessonId === 'u5l2'){
    const totalCoins = totalCoinsInPrompt(prompt);
    const counts = extractCoinCountsFromPrompt(prompt);
    // 5a: counted coins not value (wrong = total number of coins, and there's >1 coin)
    if(totalCoins >= 2 && wn === totalCoins && cn !== totalCoins){
      return { tag: 'err_counted_coins_not_value', patternTag: 'pattern_counted_coins_not_value' };
    }
    // 5b: counted everything as pennies (wrong = total count of coins, treating each as 1¢)
    //   This is the same as 5a numerically; covered above.
    // 5c: skip-counted by 5s when 10s/25s required
    const totalAsFives = totalCoins * 5;
    if(totalCoins >= 2 && wn === totalAsFives && cn !== totalAsFives){
      return { tag: 'err_skip_count_error', patternTag: 'pattern_counted_by_fives_instead' };
    }
    // 5d: skip-counted by 10s when other denominations present
    const totalAsTens = totalCoins * 10;
    if(totalCoins >= 2 && wn === totalAsTens && cn !== totalAsTens){
      return { tag: 'err_skip_count_error', patternTag: 'pattern_counted_by_tens_instead' };
    }
    // 5e: counted only highest denomination (e.g., counted dimes but skipped nickels)
    //   wrong = sum of just one coin type
    const justPenny = counts.penny * 1;
    const justNickel = counts.nickel * 5;
    const justDime = counts.dime * 10;
    const justQuarter = counts.quarter * 25;
    const onlyOne = [justPenny, justNickel, justDime, justQuarter].filter(v => v > 0);
    if(onlyOne.length >= 2 && onlyOne.includes(wn) && wn !== cn){
      return { tag: 'err_skip_count_error', patternTag: 'pattern_counted_by_tens_instead' };
    }
    // 5f: off-by-one cent
    if(absDelta === 1){
      return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
    }
    // 5g: generic counting error (not perfectly matching one of the above patterns)
    if(absDelta <= 10){
      return { tag: 'err_counting_coins_error', patternTag: delta > 0 ? 'pattern_too_high' : 'pattern_too_low' };
    }
  }

  // ── Rule 6: Dollars/cents notation confusion (u5l3) ──
  // Detect cases where dollar/cent magnitude is off by 100×: e.g., $25 vs $0.25 or 25¢ vs $25.
  if(lessonId === 'u5l3' || isDollarNotation(cStr) || isDollarNotation(wStr) || isCentNotation(cStr) || isCentNotation(wStr)){
    if(cn !== 0 && wn !== 0){
      if(wn === cn * 100 || wn === cn / 100){
        return { tag: 'err_dollars_cents_confusion', patternTag: 'pattern_confused_dollars_cents' };
      }
    }
    // Wrong equivalent value in dollars/cents domain
    if(absDelta > 0 && (isDollarNotation(cStr) || isDollarNotation(wStr))){
      // Fall through: handled by general numeric rules below
    }
  }

  // ── Rule 7: More/less money comparison ──
  if(isMoneyComparisonPrompt(prompt)){
    // If wrong reverses the more/less direction
    const dir = detectMoreLessMoneyPrompt(prompt);
    if(dir === 'more' && wn < cn){
      return { tag: 'err_more_less_money_confusion', patternTag: 'pattern_too_low' };
    }
    if(dir === 'less' && wn > cn){
      return { tag: 'err_more_less_money_confusion', patternTag: 'pattern_too_high' };
    }
  }

  // ── Rule 8: General numeric ──
  if(absDelta === 1){
    return { tag: 'err_off_by_one', patternTag: delta > 0 ? 'pattern_one_more' : 'pattern_one_less' };
  }
  // Magnitude ×10/÷10/×100/÷100 (non-money domain)
  if(cn !== 0 && wn !== 0){
    if(wn === cn * 10){
      return { tag: 'err_magnitude_error', patternTag: 'pattern_too_high' };
    }
    if(wn === cn * 100){
      return { tag: 'err_magnitude_error', patternTag: 'pattern_too_high' };
    }
    if(cn % 10 === 0 && wn === cn / 10){
      return { tag: 'err_magnitude_error', patternTag: 'pattern_too_low' };
    }
    if(cn % 100 === 0 && wn === cn / 100){
      return { tag: 'err_magnitude_error', patternTag: 'pattern_too_low' };
    }
  }

  if(delta < 0) return { tag: 'err_under_count', patternTag: 'pattern_too_low' };
  return { tag: 'err_over_count', patternTag: 'pattern_too_high' };
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
  trivialContentFlags: 0,
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
      reviewItems.push(`fallback distractor in ${where}: prompt="${String(q.t).slice(0,140)}" correct="${originalCorrect}" wrong="${val}"`);
    }
    // Negative-money sanity check
    const valCents = parseMoneyValueToCents(String(val));
    if(valCents !== null && valCents < 0){
      stats.negativeDistractors++;
      console.error(`FATAL: negative-money distractor in ${where}: "${val}"`);
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

  // Trivia content flag (defensive — Phase 1 should have removed these)
  const txtBlob = [q.t, q.e || '', q.h || '', ...newOpts.map(o => o.val)].join(' ');
  if(/\b(Lincoln|Washington|Roosevelt|Jefferson|portrait|president)\b/i.test(txtBlob)){
    stats.trivialContentFlags++;
    reviewItems.push(`trivia text in ${where}: "${String(q.t).slice(0,140)}"`);
  }
}

// ───── Walk + transform ─────
data.lessons.forEach((lesson, lessonIdx) => {
  const lessonId = `u5l${lessonIdx + 1}`;
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
      reviewItems.push(`testBank[${qi}] -> ${cls.id} (low confidence): ${String(q.t).slice(0,140)}`);
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
      reviewItems.push(`unitQuiz[${qi}] -> ${cls.id} (low confidence): ${String(q.t).slice(0,140)}`);
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
const perLesson = { u5l1: 0, u5l2: 0, u5l3: 0, u5l4: 0 };
data.lessons.forEach((lesson, idx) => {
  const id = `u5l${idx+1}`;
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

// ───── Re-emit u5.js ─────
const header = '// Unit 5: Money & Financial Literacy\n';
const body = '_mergeUnitData(4, ' + JSON.stringify(data) + ');\n';
fs.writeFileSync(U5_PATH, header + body, 'utf8');

// ───── Report ─────
const errConfused = heuristicCounts.err_confused || 0;
const errConfusedPct = stats.totalDistractors > 0 ? (errConfused / stats.totalDistractors * 100) : 0;

console.log('=== migrate_u5_phase2 ===');
console.log(JSON.stringify({
  stats,
  perLesson,
  heuristicCounts,
  errConfusedPct: Number(errConfusedPct.toFixed(2)),
  reviewListSize: reviewItems.length,
  sGate: { checked: sGateChecked, failed: sGateFailed }
}, null, 2));
console.log('Wrote:', U5_PATH);
console.log('Review list:', REVIEW_PATH, `(${reviewItems.length} items)`);
console.log(`s-field byte-equality gate: ${sGateChecked} questions checked, ${sGateFailed} mismatches`);
console.log(`err_confused: ${errConfused} / ${stats.totalDistractors} = ${errConfusedPct.toFixed(2)}%  (threshold ≤ 15%)`);
if(errConfusedPct > 15){
  console.error('WARN: err_confused above 15% threshold — strengthen classifier and rerun');
  process.exit(2);
}
