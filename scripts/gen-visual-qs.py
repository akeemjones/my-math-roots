#!/usr/bin/env python3
"""
Generate visual questions for U1-U4 and U10, inject into unit data files.

Target density: 20-30% visual questions in early units.
  U1: 75 qs  (numberLine 38, array 37)
  U2: 75 qs  (base10 64, array 11)
  U3: 75 qs  (numberLine 34, base10 33, array 8)
  U4: 40 qs  (base10 22, numberLine 18)
  U10: 40 qs (array 40)
  Total: 305
"""
import json, random, os

random.seed(42)
BASE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')


# ═══════════════════════════════════════════════════════════════════════
#  Helpers
# ═══════════════════════════════════════════════════════════════════════

def _make_opts(correct, distractors, as_str=True):
    """Build 4-option list with correct answer shuffled in. Returns (opts, correct_index)."""
    c = str(correct) if as_str else correct
    ds = [str(d) if as_str else d for d in distractors]
    # Remove duplicates and the correct answer from distractors
    ds = [d for d in ds if d != c]
    # Deduplicate preserving order
    seen = set()
    unique_ds = []
    for d in ds:
        if d not in seen:
            seen.add(d)
            unique_ds.append(d)
    ds = unique_ds[:3]
    # Pad if needed
    offset = 1
    while len(ds) < 3:
        candidate = str(int(correct) + offset) if as_str else correct + offset
        if as_str:
            candidate = str(int(correct) + offset)
        if candidate != c and candidate not in ds:
            ds.append(candidate)
        offset = -offset if offset > 0 else (-offset + 1)
    opts = [c] + ds[:3]
    random.shuffle(opts)
    return opts, opts.index(c)


def _nl_ticks_every(lo, hi):
    """Generate tick list for every integer from lo to hi."""
    return list(range(lo, hi + 1))


def _nl_ticks_by(lo, hi, step):
    """Generate tick list from lo to hi stepping by step."""
    ticks = list(range(lo, hi + 1, step))
    if ticks[-1] != hi:
        ticks.append(hi)
    return ticks


# ═══════════════════════════════════════════════════════════════════════
#  U1 — Basic Fact Strategies (75 qs: 38 numberLine, 37 array)
# ═══════════════════════════════════════════════════════════════════════

def gen_u1():
    qs = []

    # ── NL: Count on (15) ──
    for _ in range(15):
        start = random.randint(3, 12)
        jump = random.randint(2, 5)
        ans = start + jump
        lo, hi = max(0, start - 1), ans + 1
        opts, ci = _make_opts(ans, [ans-1, ans+1, ans+2, ans-2, start])
        qs.append({
            "t": "Use the number line to help. What is {} + {}?".format(start, jump),
            "o": opts, "a": ci,
            "e": "Start at {}, count on {}: you land on {}!".format(start, jump, ans),
            "d": "e", "s": None,
            "h": "Find {} on the number line. Count forward {} spaces.".format(start, jump),
            "v": {"type": "numberLine", "config": {
                "min": lo, "max": hi, "ticks": _nl_ticks_every(lo, hi)
            }}
        })

    # ── NL: Count back (13) ──
    for _ in range(13):
        start = random.randint(8, 18)
        jump = random.randint(2, 5)
        ans = start - jump
        lo, hi = max(0, ans - 1), start + 1
        opts, ci = _make_opts(ans, [ans-1, ans+1, ans+2, ans-2, start])
        qs.append({
            "t": "Use the number line to help. What is {} − {}?".format(start, jump),
            "o": opts, "a": ci,
            "e": "Start at {}, count back {}: you land on {}!".format(start, jump, ans),
            "d": "e", "s": None,
            "h": "Find {} on the number line. Count backward {} spaces.".format(start, jump),
            "v": {"type": "numberLine", "config": {
                "min": lo, "max": hi, "ticks": _nl_ticks_every(lo, hi)
            }}
        })

    # ── NL: Missing addend (10) ──
    for _ in range(10):
        a = random.randint(3, 10)
        total = random.randint(a + 2, a + 7)
        missing = total - a
        lo, hi = max(0, a - 1), total + 1
        opts, ci = _make_opts(missing, [missing-1, missing+1, missing+2, total, a])
        qs.append({
            "t": "Use the number line. {} + ___ = {}. What is the missing number?".format(a, total),
            "o": opts, "a": ci,
            "e": "From {} to {} is a jump of {}. So the missing number is {}!".format(a, total, missing, missing),
            "d": "m", "s": None,
            "h": "Find {} and {} on the number line. How many spaces apart are they?".format(a, total),
            "v": {"type": "numberLine", "config": {
                "min": lo, "max": hi, "ticks": _nl_ticks_every(lo, hi)
            }}
        })

    # ── Array: Doubles (10) ──
    for col in [2, 3, 4, 5, 6, 7, 8, 9, 3, 5]:
        total = 2 * col
        opts, ci = _make_opts(total, [total-1, total+1, total+2, col, total-2])
        qs.append({
            "t": "Each row has the same number of dots. How many dots in all?",
            "o": opts, "a": ci,
            "e": "2 rows of {} dots each. {} + {} = {}! That's a double!".format(col, col, col, total),
            "d": "e", "s": None,
            "h": "Count the dots in one row, then double it.",
            "v": {"type": "array", "config": {"rows": 2, "cols": col}}
        })

    # ── Array: Near-doubles (10) ──
    for _ in range(10):
        col = random.randint(2, 6)
        total = 3 * col  # 3 rows
        near = 2 * col  # the double
        opts, ci = _make_opts(total, [near, total+1, total-1, total+col, col])
        qs.append({
            "t": "How many dots are in this group?",
            "o": opts, "a": ci,
            "e": "{} rows of {} = {} dots total!".format(3, col, total),
            "d": "e", "s": None,
            "h": "Count the rows and the columns, then multiply.",
            "v": {"type": "array", "config": {"rows": 3, "cols": col}}
        })

    # ── Array: Total dots (10) ──
    for _ in range(10):
        r = random.randint(2, 5)
        c = random.randint(2, 5)
        total = r * c
        opts, ci = _make_opts(total, [total-1, total+1, total+r, total-c, r+c])
        qs.append({
            "t": "How many dots are in this group?",
            "o": opts, "a": ci,
            "e": "{} rows and {} columns. {} × {} = {} dots!".format(r, c, r, c, total),
            "d": "m", "s": None,
            "h": "Count the rows (going down) and the columns (going across). Multiply them!",
            "v": {"type": "array", "config": {"rows": r, "cols": c}}
        })

    # ── Array: Part-part-whole / missing dots (7) ──
    for _ in range(7):
        r = random.randint(2, 4)
        c = random.randint(3, 5)
        total = r * c
        missing = random.randint(1, 3)
        filled = total - missing
        opts, ci = _make_opts(filled, [total, filled-1, filled+1, filled+2])
        qs.append({
            "t": "This dot group should have {} rows and {} columns, but {} dots are missing. How many are filled in?".format(r, c, missing),
            "o": opts, "a": ci,
            "e": "{} × {} = {} total. {} − {} = {} filled!".format(r, c, total, total, missing, filled),
            "d": "m", "s": None,
            "h": "First find the total ({} × {}), then subtract the missing dots.".format(r, c),
            "v": {"type": "array", "config": {"rows": r, "cols": c, "filled": filled, "missingMark": True}}
        })

    return qs


# ═══════════════════════════════════════════════════════════════════════
#  U2 — Place Value (75 qs: 64 base10, 11 array)
# ═══════════════════════════════════════════════════════════════════════

def gen_u2():
    qs = []

    # ── Base10: What number? (18) ──
    for _ in range(18):
        h = random.choice([0, 0, 0, 1, 1, 2])
        t = random.randint(0, 9)
        o = random.randint(0, 9)
        if h == 0 and t == 0 and o == 0:
            t = random.randint(1, 9)
        val = h * 100 + t * 10 + o
        opts, ci = _make_opts(val, [val+10, val-10, val+1, val-1, t*100+h*10+o])
        qs.append({
            "t": "What number do these base-10 blocks show?",
            "o": opts, "a": ci,
            "e": "Count: {} hundreds, {} tens, {} ones = {}!".format(h, t, o, val),
            "d": "m", "s": None,
            "h": "Count the hundreds (big squares), tens (tall rods), and ones (small cubes).",
            "v": {"type": "base10", "config": {"hundreds": h, "tens": t, "ones": o}}
        })

    # ── Base10: How many tens? (12) ──
    for _ in range(12):
        h = random.choice([0, 0, 1, 1, 2])
        t = random.randint(1, 9)
        o = random.randint(0, 9)
        opts, ci = _make_opts(t, [t-1, t+1, t+2, o, h])
        qs.append({
            "t": "Look at the base-10 blocks. How many tens are there?",
            "o": opts, "a": ci,
            "e": "Count the tall rods — there are {}. That means {} tens ({})!".format(t, t, t*10),
            "d": "e", "s": None,
            "h": "The tall, thin rods are the tens. Count them carefully.",
            "v": {"type": "base10", "config": {"hundreds": h, "tens": t, "ones": o}}
        })

    # ── Base10: How many ones? (10) ──
    for _ in range(10):
        h = random.choice([0, 0, 1])
        t = random.randint(1, 9)
        o = random.randint(1, 9)
        opts, ci = _make_opts(o, [o-1, o+1, o+2, t])
        qs.append({
            "t": "Look at the base-10 blocks. How many ones are there?",
            "o": opts, "a": ci,
            "e": "Count the small cubes — there are {}. That's {} ones!".format(o, o),
            "d": "e", "s": None,
            "h": "The tiny cubes are the ones. Count each one carefully.",
            "v": {"type": "base10", "config": {"hundreds": h, "tens": t, "ones": o}}
        })

    # ── Base10: Expanded form (12) ──
    for _ in range(12):
        h = random.choice([0, 1, 1, 2, 2])
        t = random.randint(1, 9)
        o = random.randint(1, 9)
        val = h * 100 + t * 10 + o
        correct = ""
        if h > 0:
            correct = "{} + {} + {}".format(h*100, t*10, o)
        else:
            correct = "{} + {}".format(t*10, o)
        # Build distractors
        if h > 0:
            d1 = "{} + {} + {}".format(h*100, o*10, t)
            d2 = "{} + {} + {}".format(t*100, h*10, o)
            d3 = "{} + {}".format(h*100, t*10 + o)
        else:
            d1 = "{} + {}".format(o*10, t)
            d2 = "{} + {}".format((t+1)*10, o)
            d3 = str(val)
        opts = [correct, d1, d2, d3]
        # Deduplicate
        opts = list(dict.fromkeys(opts))
        while len(opts) < 4:
            opts.append("{} + {}".format(t*10 + random.randint(1,5), o + random.randint(1,3)))
        opts = opts[:4]
        random.shuffle(opts)
        ci = opts.index(correct)
        qs.append({
            "t": "These blocks show a number. What is it in expanded form?",
            "o": opts, "a": ci,
            "e": "{}! Each place has its own value.".format(correct),
            "d": "m", "s": None,
            "h": "Count each type of block separately: hundreds, tens, ones. Write each value.",
            "v": {"type": "base10", "config": {"hundreds": h, "tens": t, "ones": o}}
        })

    # ── Base10: Which is bigger? (12) ──
    for _ in range(12):
        # Generate two different numbers
        h1 = random.choice([0, 1, 1, 2])
        t1 = random.randint(0, 9)
        o1 = random.randint(0, 9)
        val1 = h1*100 + t1*10 + o1
        if val1 == 0: val1 = random.randint(10, 99); h1, t1, o1 = val1//100, (val1%100)//10, val1%10

        # Second number differs by swapping digits or adjusting
        h2, t2, o2 = h1, t1, o1
        which = random.choice(['h', 't', 'o'])
        if which == 'h' and h1 < 9: h2 = h1 + 1
        elif which == 't' and t1 < 9: t2 = t1 + 1
        else: o2 = min(9, o1 + random.randint(1, 3))
        val2 = h2*100 + t2*10 + o2
        if val1 == val2:
            t2 = min(9, t1 + 1)
            val2 = h2*100 + t2*10 + o2

        bigger = max(val1, val2)
        smaller = min(val1, val2)
        opts, ci = _make_opts(bigger, [smaller, bigger+10, smaller-10, (val1+val2)//2])
        # Show base-10 of the bigger number
        bh, bt, bo = bigger//100, (bigger%100)//10, bigger%10
        qs.append({
            "t": "These base-10 blocks show a number. Is it bigger or smaller than {}?".format(smaller),
            "o": ["Bigger — it's {}".format(bigger), "Smaller — it's {}".format(smaller),
                   "They're equal", "Can't tell"],
            "a": 0,
            "e": "The blocks show {}. Since {} > {}, it's bigger!".format(bigger, bigger, smaller),
            "d": "m", "s": None,
            "h": "First count the blocks to find the number. Then compare it to {}.".format(smaller),
            "v": {"type": "base10", "config": {"hundreds": bh, "tens": bt, "ones": bo}}
        })

    # ── Array: Total dots (11) ──
    for _ in range(11):
        r = random.randint(2, 5)
        c = random.randint(2, 5)
        total = r * c
        opts, ci = _make_opts(total, [total-1, total+1, total+r, total-c, r+c])
        qs.append({
            "t": "How many dots are in this group?",
            "o": opts, "a": ci,
            "e": "{} rows × {} columns = {} dots!".format(r, c, total),
            "d": "m", "s": None,
            "h": "Count the rows and columns, then multiply.",
            "v": {"type": "array", "config": {"rows": r, "cols": c}}
        })

    return qs


# ═══════════════════════════════════════════════════════════════════════
#  U3 — Add & Subtract to 200 (75 qs: 34 numberLine, 33 base10, 8 array)
# ═══════════════════════════════════════════════════════════════════════

def gen_u3():
    qs = []

    # ── NL: Addition (17) ──
    pairs = []
    while len(pairs) < 17:
        a = random.randint(15, 90)
        b = random.randint(5, 50)
        s = a + b
        if s <= 200 and (a, b, s) not in pairs:
            pairs.append((a, b, s))
    for a, b, s in pairs:
        step = 5 if (s - a) <= 40 else 10
        lo = (a // step) * step
        hi = ((s // step) + 1) * step
        hi = min(200, hi)
        ticks = _nl_ticks_by(lo, hi, step)
        # Ensure a and s are in the ticks for reference
        for v in [a, s]:
            if v not in ticks:
                ticks.append(v)
        ticks = sorted(set(ticks))
        opts, ci = _make_opts(s, [s-10, s+10, s-1, s+1, a+b+10])
        qs.append({
            "t": "Use the number line to help. What is {} + {}?".format(a, b),
            "o": opts, "a": ci,
            "e": "{} + {} = {}. Great work!".format(a, b, s),
            "d": "m", "s": None,
            "h": "Find {} on the number line. Jump forward {}.".format(a, b),
            "v": {"type": "numberLine", "config": {
                "min": lo, "max": hi, "ticks": ticks
            }}
        })

    # ── NL: Subtraction (17) ──
    pairs = []
    while len(pairs) < 17:
        a = random.randint(40, 150)
        b = random.randint(5, 40)
        s = a - b
        if s > 0 and (a, b, s) not in pairs:
            pairs.append((a, b, s))
    for a, b, s in pairs:
        step = 5 if (a - s) <= 40 else 10
        lo = (s // step) * step
        hi = ((a // step) + 1) * step
        hi = min(200, hi)
        ticks = _nl_ticks_by(lo, hi, step)
        for v in [a, s]:
            if v not in ticks:
                ticks.append(v)
        ticks = sorted(set(ticks))
        opts, ci = _make_opts(s, [s-10, s+10, s-1, s+1, a])
        qs.append({
            "t": "Use the number line to help. What is {} − {}?".format(a, b),
            "o": opts, "a": ci,
            "e": "{} − {} = {}!".format(a, b, s),
            "d": "m", "s": None,
            "h": "Find {} on the number line. Jump backward {}.".format(a, b),
            "v": {"type": "numberLine", "config": {
                "min": lo, "max": hi, "ticks": ticks
            }}
        })

    # ── Base10: What number to 200 (12) ──
    for _ in range(12):
        h = random.choice([0, 1, 1, 1, 2])
        t = random.randint(0, 9)
        o = random.randint(0, 9)
        if h == 0 and t == 0: t = random.randint(1, 9)
        val = h*100 + t*10 + o
        opts, ci = _make_opts(val, [val+10, val-10, val+1, val-1, t*100+h*10+o])
        qs.append({
            "t": "What number do these base-10 blocks show?",
            "o": opts, "a": ci,
            "e": "{} hundreds + {} tens + {} ones = {}!".format(h, t, o, val),
            "d": "m", "s": None,
            "h": "Count: big squares = hundreds, rods = tens, small cubes = ones.",
            "v": {"type": "base10", "config": {"hundreds": h, "tens": t, "ones": o}}
        })

    # ── Base10: Add ones (regrouping) (11) ──
    for _ in range(11):
        h = random.choice([0, 1, 1])
        t = random.randint(2, 8)
        o = random.randint(3, 7)
        val = h*100 + t*10 + o
        add = random.randint(4, 9 - o + 5)  # enough to regroup sometimes
        add = min(add, 9)
        result = val + add
        opts, ci = _make_opts(result, [result-1, result+1, result+10, result-10, val])
        qs.append({
            "t": "These blocks show {}. Add {} more ones. What is the new number?".format(val, add),
            "o": opts, "a": ci,
            "e": "{} + {} = {}! {} + {} ones = {}, regroup if needed.".format(val, add, result, o, add, o+add),
            "d": "m", "s": None,
            "h": "Count the blocks to check the starting number. Then add {} ones.".format(add),
            "v": {"type": "base10", "config": {"hundreds": h, "tens": t, "ones": o}}
        })

    # ── Base10: How many hundreds (10) ──
    for _ in range(10):
        h = random.choice([1, 1, 2])
        t = random.randint(0, 9)
        o = random.randint(0, 9)
        opts, ci = _make_opts(h, [h+1, max(0, h-1), t, o])
        qs.append({
            "t": "How many hundreds are shown in these base-10 blocks?",
            "o": opts, "a": ci,
            "e": "There are {} big flat squares — that's {} hundreds ({})!".format(h, h, h*100),
            "d": "e", "s": None,
            "h": "The big flat squares are the hundreds. Count them!",
            "v": {"type": "base10", "config": {"hundreds": h, "tens": t, "ones": o}}
        })

    # ── Array: Repeated addition (8) ──
    for _ in range(8):
        r = random.randint(2, 5)
        c = random.randint(3, 6)
        total = r * c
        expr = " + ".join([str(c)] * r)
        opts, ci = _make_opts(total, [total-1, total+1, total+c, r+c])
        qs.append({
            "t": "This dot group shows {} rows of {}. What is {} equal to?".format(r, c, expr),
            "o": opts, "a": ci,
            "e": "{} = {}! {} rows of {} dots.".format(expr, total, r, c),
            "d": "m", "s": None,
            "h": "Add {} + {} + ... Count each row and keep adding.".format(c, c),
            "v": {"type": "array", "config": {"rows": r, "cols": c}}
        })

    return qs


# ═══════════════════════════════════════════════════════════════════════
#  U4 — Add & Subtract to 1,000 (40 qs: 22 base10, 18 numberLine)
# ═══════════════════════════════════════════════════════════════════════

def gen_u4():
    qs = []

    # ── Base10: What number to 999 (10) ──
    for _ in range(10):
        h = random.randint(1, 9)
        t = random.randint(0, 9)
        o = random.randint(0, 9)
        val = h*100 + t*10 + o
        opts, ci = _make_opts(val, [val+100, val-100, val+10, val-10, t*100+h*10+o])
        qs.append({
            "t": "What number do these base-10 blocks show?",
            "o": opts, "a": ci,
            "e": "{} hundreds + {} tens + {} ones = {}!".format(h, t, o, val),
            "d": "m", "s": None,
            "h": "Count: big flats = hundreds, rods = tens, small cubes = ones.",
            "v": {"type": "base10", "config": {"hundreds": h, "tens": t, "ones": o}}
        })

    # ── Base10: How many hundreds (7) ──
    for _ in range(7):
        h = random.randint(1, 9)
        t = random.randint(0, 9)
        o = random.randint(0, 9)
        opts, ci = _make_opts(h, [h+1, max(0,h-1), t, o])
        qs.append({
            "t": "How many hundreds are shown in these base-10 blocks?",
            "o": opts, "a": ci,
            "e": "There are {} hundred-flats, representing {}!".format(h, h*100),
            "d": "e", "s": None,
            "h": "The large flat squares are hundreds. Count them!",
            "v": {"type": "base10", "config": {"hundreds": h, "tens": t, "ones": o}}
        })

    # ── Base10: Expanded form (5) ──
    for _ in range(5):
        h = random.randint(1, 9)
        t = random.randint(1, 9)
        o = random.randint(1, 9)
        val = h*100 + t*10 + o
        correct = "{} + {} + {}".format(h*100, t*10, o)
        d1 = "{} + {} + {}".format(t*100, h*10, o)
        d2 = "{} + {} + {}".format(h*100, o*10, t)
        d3 = str(val)
        extras = [
            "{} + {} + {}".format(h*100, (t+1)*10, o),
            "{} + {} + {}".format((h+1)*100, t*10, o),
            "{} + {} + {}".format(h*100, t*10, o+1),
        ]
        opts = list(dict.fromkeys([correct, d1, d2, d3] + extras))
        opts = [correct] + [x for x in opts if x != correct][:3]
        random.shuffle(opts)
        ci = opts.index(correct)
        qs.append({
            "t": "These blocks show a number. Write it in expanded form.",
            "o": opts, "a": ci,
            "e": "{}! Hundreds + tens + ones.".format(correct),
            "d": "m", "s": None,
            "h": "Count each type of block and write its value.",
            "v": {"type": "base10", "config": {"hundreds": h, "tens": t, "ones": o}}
        })

    # ── NL: Rounding to nearest 100 (8) ──
    for _ in range(8):
        hundred = random.choice([100, 200, 300, 400, 500, 600, 700])
        offset = random.randint(5, 95)
        num = hundred + offset
        rounded = hundred if offset < 50 else hundred + 100
        closer = hundred if offset < 50 else hundred + 100
        farther = hundred + 100 if offset < 50 else hundred
        ticks = _nl_ticks_by(hundred, hundred + 100, 10)
        if num not in ticks:
            ticks.append(num)
            ticks = sorted(ticks)
        opts = ["{}".format(closer), "{}".format(farther),
                "{}".format(hundred + 50), "{}".format(num)]
        opts = list(dict.fromkeys(opts))[:4]
        random.shuffle(opts)
        ci = opts.index(str(closer))
        qs.append({
            "t": "Look at the number line. What does {} round to, to the nearest hundred?".format(num),
            "o": opts, "a": ci,
            "e": "{} is closer to {} than to {}, so it rounds to {}!".format(num, closer, farther, closer),
            "d": "m", "s": None,
            "h": "Find {} on the number line. Which hundred is it closer to?".format(num),
            "v": {"type": "numberLine", "config": {
                "min": hundred, "max": hundred + 100, "ticks": ticks
            }}
        })

    # ── NL: Add hundreds (5) ──
    pairs = []
    while len(pairs) < 5:
        start = random.randint(100, 600)
        start = (start // 100) * 100  # round to hundred
        jump = random.choice([100, 200, 300])
        ans = start + jump
        if ans <= 999 and (start, jump, ans) not in pairs:
            pairs.append((start, jump, ans))
    for start, jump, ans in pairs:
        lo = max(0, start - 100)
        hi = min(999, ans + 100)
        ticks = _nl_ticks_by(lo, hi, 100)
        opts, ci = _make_opts(ans, [ans-100, ans+100, ans-10, ans+10])
        qs.append({
            "t": "Use the number line. What is {} + {}?".format(start, jump),
            "o": opts, "a": ci,
            "e": "{} + {} = {}!".format(start, jump, ans),
            "d": "m", "s": None,
            "h": "Find {} on the number line. Jump forward by hundreds.".format(start),
            "v": {"type": "numberLine", "config": {
                "min": lo, "max": hi, "ticks": ticks
            }}
        })

    # ── NL: Subtract hundreds (5) ──
    pairs = []
    while len(pairs) < 5:
        start = random.randint(300, 900)
        start = (start // 100) * 100
        jump = random.choice([100, 200])
        ans = start - jump
        if ans > 0 and (start, jump, ans) not in pairs:
            pairs.append((start, jump, ans))
    for start, jump, ans in pairs:
        lo = max(0, ans - 100)
        hi = min(999, start + 100)
        ticks = _nl_ticks_by(lo, hi, 100)
        opts, ci = _make_opts(ans, [ans-100, ans+100, ans-10, start])
        qs.append({
            "t": "Use the number line. What is {} − {}?".format(start, jump),
            "o": opts, "a": ci,
            "e": "{} − {} = {}!".format(start, jump, ans),
            "d": "m", "s": None,
            "h": "Find {} on the number line. Jump backward by hundreds.".format(start),
            "v": {"type": "numberLine", "config": {
                "min": lo, "max": hi, "ticks": ticks
            }}
        })

    return qs


# ═══════════════════════════════════════════════════════════════════════
#  U10 — Multiplication & Division (40 qs: all array)
# ═══════════════════════════════════════════════════════════════════════

def gen_u10():
    qs = []

    # ── Array: Total dots (12) ──
    for _ in range(12):
        r = random.randint(2, 9)
        c = random.randint(2, 9)
        total = r * c
        opts, ci = _make_opts(total, [total-1, total+1, total+r, total-c, r+c, (r-1)*c, r*(c-1)])
        qs.append({
            "t": "How many dots are in this group?",
            "o": opts, "a": ci,
            "e": "{} rows × {} columns = {} dots!".format(r, c, total),
            "d": "m", "s": None,
            "h": "Count the rows (down) and columns (across), then multiply.",
            "v": {"type": "array", "config": {"rows": r, "cols": c}}
        })

    # ── Array: Which multiplication matches? (10) ──
    for _ in range(10):
        r = random.randint(2, 8)
        c = random.randint(2, 8)
        correct = "{} × {}".format(r, c)
        wrongs = [
            "{} × {}".format(r+1, c),
            "{} × {}".format(r, c+1),
            "{} × {}".format(r-1, c+1) if r > 1 else "{} × {}".format(r+2, c),
        ]
        opts = [correct] + wrongs
        random.shuffle(opts)
        ci = opts.index(correct)
        qs.append({
            "t": "Which multiplication sentence matches this dot picture?",
            "o": opts, "a": ci,
            "e": "{} rows and {} columns = {}. {} = {}!".format(r, c, correct, correct, r*c),
            "d": "m", "s": None,
            "h": "Count the rows, then the columns. That gives you rows × columns.",
            "v": {"type": "array", "config": {"rows": r, "cols": c}}
        })

    # ── Array: Division as rows (10) ──
    for _ in range(10):
        r = random.randint(2, 6)
        c = random.randint(2, 8)
        total = r * c
        opts, ci = _make_opts(c, [c+1, c-1, r, total])
        templates = [
            "{} dots are arranged in {} equal rows. How many dots in each row?".format(total, r),
            "If you share {} dots equally into {} rows, how many are in each row?".format(total, r),
        ]
        qs.append({
            "t": random.choice(templates),
            "o": opts, "a": ci,
            "e": "{} ÷ {} = {}. Each row has {} dots!".format(total, r, c, c),
            "d": "m", "s": None,
            "h": "Count the dots in just one row.",
            "v": {"type": "array", "config": {"rows": r, "cols": c}}
        })

    # ── Array: Missing dots / factor (8) ──
    for _ in range(8):
        r = random.randint(2, 6)
        c = random.randint(2, 6)
        total = r * c
        filled = total - random.randint(1, min(3, total-1))
        missing = total - filled
        opts, ci = _make_opts(missing, [missing+1, missing-1, missing+2, r, c])
        qs.append({
            "t": "This dot picture should be a full {} × {} rectangle. How many dots are missing?".format(r, c),
            "o": opts, "a": ci,
            "e": "A full {} × {} rectangle has {} dots. {} are shown, so {} are missing!".format(r, c, total, filled, missing),
            "d": "m", "s": None,
            "h": "Find the total ({} × {}), then subtract the filled dots.".format(r, c),
            "v": {"type": "array", "config": {"rows": r, "cols": c, "filled": filled, "missingMark": True}}
        })

    return qs


# ═══════════════════════════════════════════════════════════════════════
#  Inject into data files (idempotent)
# ═══════════════════════════════════════════════════════════════════════

def inject(ukey, idx, visual_qs):
    fname = os.path.join(BASE, '{}.js'.format(ukey))
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    first_nl = content.index('\n')
    comment = content[:first_nl]
    prefix = '_mergeUnitData({}, '.format(idx)
    json_start = content.index(prefix) + len(prefix)
    json_end = content.rindex(');')
    data = json.loads(content[json_start:json_end])

    # Strip any previously injected visual questions (idempotent re-runs)
    data['unitQuiz'] = [q for q in data.get('unitQuiz', []) if not q.get('v')]
    if data.get('lessons') and len(data['lessons']) > 0:
        data['lessons'][0]['qBank'] = [q for q in data['lessons'][0].get('qBank', []) if not q.get('v')]

    # Prepend fresh visual questions
    data['unitQuiz'] = visual_qs + data['unitQuiz']
    if data.get('lessons') and len(data['lessons']) > 0:
        data['lessons'][0]['qBank'] = visual_qs + data['lessons'][0]['qBank']

    out = comment + '\n' + prefix + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ');'
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(out)

    uq_total = len(data['unitQuiz'])
    l0_total = len(data['lessons'][0]['qBank']) if data.get('lessons') else 0
    uq_pct = len(visual_qs) / uq_total * 100 if uq_total > 0 else 0
    print('{}: {} visual qs -> unitQuiz ({} total, {:.1f}% visual), lesson[0] qBank ({} total)'.format(
        ukey, len(visual_qs), uq_total, uq_pct, l0_total))


if __name__ == '__main__':
    all_units = [
        ('u1',  0, gen_u1()),
        ('u2',  1, gen_u2()),
        ('u3',  2, gen_u3()),
        ('u4',  3, gen_u4()),
        ('u10', 9, gen_u10()),
    ]
    total = 0
    for ukey, idx, qs in all_units:
        inject(ukey, idx, qs)
        total += len(qs)
    print('\nTotal visual questions generated: {}'.format(total))
