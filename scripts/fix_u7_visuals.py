"""
fix_u7_visuals.py
-----------------
Adds inline SVG visuals to Unit 7 (Measurement & Time) questions that reference
a visual element (ruler, clock, calendar) but don't already have one.

Run: python scripts/fix_u7_visuals.py
"""

import re
import math
import shutil
import sys
import os

SRC = "E:/Cameron Jones/my-math-roots/src/data/u7.js"
BAK = SRC + ".bak"

# ─────────────────────────────────────────────────────────────────────────────
# SVG GENERATORS
# ─────────────────────────────────────────────────────────────────────────────

CX, CY, R = 45, 45, 38   # clock center/radius in viewBox coords

def clock_svg(hour, minute):
    """Analog clock face showing hour:minute."""
    ticks = ""
    nums = ""
    for n in range(1, 13):
        angle = math.radians(n * 30 - 90)
        tx1 = CX + (R - 2) * math.cos(angle)
        ty1 = CY + (R - 2) * math.sin(angle)
        tx2 = CX + R * math.cos(angle)
        ty2 = CY + R * math.sin(angle)
        sw = 2 if n % 3 == 0 else 1
        ticks += (f'<line x1="{tx1:.2f}" y1="{ty1:.2f}" x2="{tx2:.2f}" y2="{ty2:.2f}"'
                  f' stroke="#555" stroke-width="{sw}"/>')
        nx = CX + (R - 9) * math.cos(angle)
        ny = CY + (R - 9) * math.sin(angle)
        nums += (f'<text x="{nx:.2f}" y="{ny:.2f}" text-anchor="middle"'
                 f' dominant-baseline="central" font-size="8" font-weight="bold"'
                 f' fill="#333">{n}</text>')

    # Minute hand (long, thin) – 0 min = 12 o'clock (-90°)
    ma = math.radians(minute * 6 - 90)
    mx2 = CX + (R - 8) * math.cos(ma)
    my2 = CY + (R - 8) * math.sin(ma)

    # Hour hand (short, thick) – includes minute offset
    ha = math.radians((hour % 12) * 30 + minute * 0.5 - 90)
    hx2 = CX + (R - 18) * math.cos(ha)
    hy2 = CY + (R - 18) * math.sin(ha)

    return (
        f'<svg width="180" height="180" viewBox="0 0 90 90"'
        f' style="display:block;margin:6px auto;border-radius:50%;background:#fffdf5">'
        f'<circle cx="{CX}" cy="{CY}" r="{R+1}" fill="#f0f0f0" stroke="#bbb" stroke-width="1"/>'
        f'<circle cx="{CX}" cy="{CY}" r="{R}" fill="#fffdf5" stroke="#888" stroke-width="1.5"/>'
        f'{ticks}{nums}'
        f'<line x1="{CX}" y1="{CY}" x2="{mx2:.2f}" y2="{my2:.2f}"'
        f' stroke="#444" stroke-width="2" stroke-linecap="round"/>'
        f'<line x1="{CX}" y1="{CY}" x2="{hx2:.2f}" y2="{hy2:.2f}"'
        f' stroke="#222" stroke-width="3" stroke-linecap="round"/>'
        f'<circle cx="{CX}" cy="{CY}" r="3" fill="#333"/>'
        f'</svg>'
    )


def ruler_svg(length_inches, max_inches=12, color="#3498db"):
    """
    Ruler showing 0..max_inches with a highlighted bracket/bar from 0 to length_inches.
    Proportional to max_inches = full 12-inch ruler width.
    """
    # ruler body
    W = 200   # full ruler width in viewBox px
    H = 60
    rx = 10   # ruler x start
    rw = W - 2 * rx  # ruler body width
    ry = 20
    rh = 14

    px_per_inch = rw / max_inches
    end_x = rx + length_inches * px_per_inch

    ticks = ""
    labels = ""
    for i in range(max_inches + 1):
        x = rx + i * px_per_inch
        # major ticks
        ticks += f'<line x1="{x:.1f}" y1="{ry}" x2="{x:.1f}" y2="{ry + rh}" stroke="#888" stroke-width="1"/>'
        labels += (f'<text x="{x:.1f}" y="{ry + rh + 6}" text-anchor="middle"'
                   f' font-size="6" fill="#555">{i}</text>')
        # half-inch minor tick (not after last inch)
        if i < max_inches:
            hx = x + px_per_inch / 2
            ticks += f'<line x1="{hx:.1f}" y1="{ry}" x2="{hx:.1f}" y2="{ry + rh // 2}" stroke="#bbb" stroke-width="0.6"/>'

    # colored bar for the measurement
    bar = (f'<rect x="{rx}" y="{ry + 1}" width="{(end_x - rx):.1f}" height="{rh - 2}"'
           f' fill="{color}" opacity="0.35" rx="1"/>')
    # bracket arrows
    arrow = (f'<line x1="{rx}" y1="{ry - 4}" x2="{end_x:.1f}" y2="{ry - 4}"'
             f' stroke="{color}" stroke-width="1.5"/>'
             f'<line x1="{rx}" y1="{ry - 7}" x2="{rx}" y2="{ry - 1}" stroke="{color}" stroke-width="1.5"/>'
             f'<line x1="{end_x:.1f}" y1="{ry - 7}" x2="{end_x:.1f}" y2="{ry - 1}" stroke="{color}" stroke-width="1.5"/>'
             f'<text x="{(rx + end_x) / 2:.1f}" y="{ry - 8}" text-anchor="middle"'
             f' font-size="7" fill="{color}" font-weight="bold">{length_inches} in</text>')

    # ruler label
    ruler_label = (f'<text x="{rx + rw / 2:.1f}" y="{ry + rh + 16}" text-anchor="middle"'
                   f' font-size="5.5" fill="#999">inches</text>')

    return (
        f'<svg width="440" height="130" viewBox="0 0 220 65"'
        f' style="display:block;margin:6px auto;border-radius:6px;background:#f9f9f9">'
        f'<rect x="{rx}" y="{ry}" width="{rw}" height="{rh}"'
        f' fill="#fff8e7" stroke="#c8a000" stroke-width="0.8" rx="1"/>'
        f'{bar}{ticks}{labels}{ruler_label}{arrow}'
        f'</svg>'
    )


def ruler_plain_svg(max_inches=12):
    """Ruler with no measurement highlighted — for questions about where a number is."""
    W = 200
    rx = 10
    rw = W - 2 * rx
    ry = 20
    rh = 14
    px_per_inch = rw / max_inches

    ticks = ""
    labels = ""
    for i in range(max_inches + 1):
        x = rx + i * px_per_inch
        ticks += f'<line x1="{x:.1f}" y1="{ry}" x2="{x:.1f}" y2="{ry + rh}" stroke="#888" stroke-width="1"/>'
        labels += (f'<text x="{x:.1f}" y="{ry + rh + 6}" text-anchor="middle"'
                   f' font-size="6" fill="#555">{i}</text>')
        if i < max_inches:
            hx = x + px_per_inch / 2
            ticks += f'<line x1="{hx:.1f}" y1="{ry}" x2="{hx:.1f}" y2="{ry + rh // 2}" stroke="#bbb" stroke-width="0.6"/>'

    ruler_label = (f'<text x="{rx + rw / 2:.1f}" y="{ry + rh + 16}" text-anchor="middle"'
                   f' font-size="5.5" fill="#999">inches</text>')

    return (
        f'<svg width="440" height="110" viewBox="0 0 220 55"'
        f' style="display:block;margin:6px auto;border-radius:6px;background:#f9f9f9">'
        f'<rect x="{rx}" y="{ry}" width="{rw}" height="{rh}"'
        f' fill="#fff8e7" stroke="#c8a000" stroke-width="0.8" rx="1"/>'
        f'{ticks}{labels}{ruler_label}'
        f'</svg>'
    )


def comparison_ruler_svg(len1, name1, len2, name2):
    """Two horizontal bars comparing two lengths, labels inside."""
    max_len = max(len1, len2, 1)
    W = 200
    rx = 10
    rw = W - 2 * rx
    bar_h = 12
    colors = ["#3498db", "#e74c3c"]

    bars = ""
    labels_svg = ""
    for idx, (ln, nm) in enumerate([(len1, name1), (len2, name2)]):
        bw = max(ln / max_len * rw, 10)
        by = 10 + idx * 22
        bars += (f'<rect x="{rx}" y="{by}" width="{bw:.1f}" height="{bar_h}"'
                 f' fill="{colors[idx]}" rx="2" opacity="0.85"/>')
        labels_svg += (f'<text x="{rx + bw + 3:.1f}" y="{by + bar_h / 2 + 1:.1f}"'
                       f' font-size="6" fill="{colors[idx]}" dominant-baseline="middle">'
                       f'{nm}: {ln} in</text>')

    return (
        f'<svg width="440" height="120" viewBox="0 0 220 60"'
        f' style="display:block;margin:6px auto;border-radius:6px;background:#f9f9f9">'
        f'{bars}{labels_svg}'
        f'</svg>'
    )


# ─────────────────────────────────────────────────────────────────────────────
# QUESTION PARSING HELPERS
# ─────────────────────────────────────────────────────────────────────────────

# Mapping of written time phrases to (hour, minute)
TIME_PHRASES = {}
for h in range(1, 13):
    TIME_PHRASES[f"half past {h}"] = (h, 30)
    TIME_PHRASES[f"quarter past {h}"] = (h, 15)
    TIME_PHRASES[f"quarter to {h}"] = (h - 1 if h > 1 else 12, 45)
    for m in range(1, 60):
        TIME_PHRASES[f"{m} minutes past {h}"] = (h, m)
        TIME_PHRASES[f"{m} minutes to {h}"] = (h - 1 if h > 1 else 12, 60 - m)
    # "five minutes past 4", "twenty minutes past 3", etc.
    words_to_nums = {
        "five": 5, "ten": 10, "fifteen": 15, "twenty": 20,
        "twenty-five": 25, "thirty": 30, "forty-five": 45,
    }
    for word, val in words_to_nums.items():
        TIME_PHRASES[f"{word} minutes past {h}"] = (h, val)
        TIME_PHRASES[f"{word} past {h}"] = (h, val)


def parse_clock_time(text):
    """
    Try to extract (hour, minute) from a question text.
    Returns (hour, minute) or None.
    """
    tl = text.lower()

    # "The clock shows 3:00" / "clock shows 6:30"
    m = re.search(r"(?:clock shows|shows)\s+(\d{1,2}):(\d{2})", tl)
    if m:
        return int(m.group(1)), int(m.group(2))

    # "short hand points to 4 and the long hand points to 12"
    # also "Sam's clock shows the short hand on 10 and the long hand on 9"
    m = re.search(r"short hand (?:is on(?: the)?|points to(?: the)?|on(?: the)?)?\s*(\d{1,2}).*?long hand (?:is on(?: the)?|points to(?: the)?|on(?: the)?)?\s*(\d{1,2})", tl)
    if m:
        h_num = int(m.group(1))
        min_num = int(m.group(2))
        return h_num, min_num * 5

    # "short hand is between X and Y, long hand on Z" / "short hand is between X and Y. The long hand points to Z."
    m = re.search(r"short hand (?:is )?between(?: the)?\s*(\d{1,2}) and (\d{1,2}).*?long hand (?:is |points to |on )?(on )?(?:the )?(\d{1,2})", tl)
    if m:
        h_low = int(m.group(1))
        min_num = int(m.group(4) or m.group(3) or "0")
        return h_low, min_num * 5

    # time phrases
    for phrase, (h, mn) in TIME_PHRASES.items():
        if phrase in tl:
            return h, mn

    # "quarter to 5 equal" / "half past 3 equal" / "quarter past 9"
    m = re.search(r"half past (\d{1,2})", tl)
    if m:
        h = int(m.group(1))
        return h, 30
    m = re.search(r"quarter past (\d{1,2})", tl)
    if m:
        h = int(m.group(1))
        return h, 15
    m = re.search(r"quarter to (\d{1,2})", tl)
    if m:
        h = int(m.group(1))
        return (h - 1) if h > 1 else 12, 45
    m = re.search(r"five minutes past (\d{1,2})", tl)
    if m:
        return int(m.group(1)), 5
    m = re.search(r"twenty minutes past (\d{1,2})", tl)
    if m:
        return int(m.group(1)), 20

    return None


def parse_long_hand_minute_position(text):
    """
    For questions like 'When the long hand points to the 6, how many minutes...'
    Returns the number the long hand points to, or None.
    """
    tl = text.lower()
    m = re.search(r"long hand points to(?: the)?\s+(\d{1,2})", tl)
    if m:
        return int(m.group(1))
    return None


def is_clock_question(text):
    """Return True if this question is about reading a specific time from a clock."""
    tl = text.lower()
    # Must reference a specific time or clock reading
    clock_triggers = [
        r"clock shows \d+:\d+",
        r"short hand (?:is on|points to|between|on)",
        r"half past \d+",
        r"quarter (?:past|to) \d+",
        r"five minutes past",
        r"twenty minutes past",
        r"long hand (?:is on|on)",
    ]
    for pat in clock_triggers:
        if re.search(pat, tl):
            return True
    # "long hand points to N" is clock reading only if combined with short hand
    if re.search(r"long hand points to", tl) and re.search(r"short hand", tl):
        return True
    return False


def is_minute_hand_question(text):
    """
    Questions like 'When the long hand points to the 6, how many minutes past the hour?'
    These show a clock with just the minute hand highlighted.
    """
    tl = text.lower()
    return (re.search(r"long hand points to(?: the)?\s+\d+", tl) and
            "how many minutes" in tl and
            "short hand" not in tl)


def is_ruler_reading_question(text):
    """Return True if question asks to read a measurement off a ruler."""
    tl = text.lower()
    patterns = [
        r"(?:pencil|pen|straw|book|paper clip|eraser|crayon|glue stick|marker|string|stick|wire).*(?:ends at|goes from|lines up to|at the)\s+\d+.*ruler",
        r"ruler.*(?:pencil|pen|straw|book|paper clip|eraser|crayon).*\d+",
        r"(?:ends at|goes from 0 to|lines up to)\s+\d+\s+(?:on a ruler|on the ruler)",
        r"pencil ends at the \d+",
        r"pencil (?:lines up|ends) at",
        r"pencil goes from 0 to \d+",
    ]
    for pat in patterns:
        if re.search(pat, tl):
            return True
    return False


def is_ruler_plain_question(text):
    """Return True if question says 'a ruler shows 12 inches' / 'ruler shows...' as reference."""
    tl = text.lower()
    # "A ruler shows 12 inches" / "a ruler is 12 inches long" — just show a plain ruler
    if re.search(r"ruler(?:\s+\w+){0,3}\s+(?:shows|is)\s+12", tl):
        return True
    if "where would" in tl and "ruler" in tl:
        return True
    return False


def extract_ruler_length(text):
    """Extract measurement length in inches from ruler question text."""
    tl = text.lower()
    # "ends at 7 on a ruler" / "goes from 0 to 7" / "lines up to 7"
    m = re.search(r"(?:ends at|goes from 0 to|lines up to|at the)\s+(\d+)", tl)
    if m:
        return int(m.group(1))
    # fallback: find the first number in context of ruler/inches
    m = re.search(r"(\d+)\s*(?:inches?|in\.)", tl)
    if m:
        return int(m.group(1))
    return None


def is_comparison_question(text):
    """Return True if question compares two specific lengths."""
    tl = text.lower()
    # "A book is 8 inches... notebook is 6 inches" — two different named items with lengths
    items = re.findall(r"(?:a\s+)?(?:\w+\s+){1,3}is\s+(\d+)\s*(?:inches?|in\.)", tl)
    if len(items) >= 2:
        return True
    return False


def extract_comparison_lengths(text):
    """Return [(length, name), (length, name)] for two items."""
    tl = text.lower()
    matches = re.findall(r"(?:a\s+)?([\w\s]+?)\s+is\s+(\d+)\s*(?:inches?|in\.)", tl)
    if len(matches) >= 2:
        results = []
        for name, length in matches[:2]:
            results.append((int(length), name.strip()))
        return results
    return None


# ─────────────────────────────────────────────────────────────────────────────
# QUESTION REWRITER
# ─────────────────────────────────────────────────────────────────────────────

def process_question(t):
    """
    Given the text of a question (no SVG yet), decide if it needs an SVG and return
    (new_t, category) or (t, "skip").
    """
    # Already has SVG
    if "<svg" in t:
        return t, "already_has_svg"

    tl = t.lower()

    # ── MINUTE HAND ONLY (long hand position questions) ──────────────────────
    if is_minute_hand_question(t):
        n = parse_long_hand_minute_position(t)
        if n is not None:
            # Show clock with 12:00 base and minute hand at position n
            # e.g. long hand on 6 → show 12:30 so minute hand points to 6
            minute = (n % 12) * 5
            svg = clock_svg(12, minute)
            new_t = t + svg
            return new_t, "clock_minute"

    # ── CLOCK QUESTIONS ──────────────────────────────────────────────────────
    if is_clock_question(t):
        time_result = parse_clock_time(t)
        if time_result:
            h, mn = time_result
            svg = clock_svg(h, mn)
            new_t = t + svg
            return new_t, "clock"
        # Could not parse time — skip
        return t, "skip_clock_no_parse"

    # ── RULER READING (specific measurement) ─────────────────────────────────
    if is_ruler_reading_question(t):
        length = extract_ruler_length(t)
        if length and 1 <= length <= 12:
            svg = ruler_svg(length)
            new_t = "Use the ruler below. " + t + svg
            return new_t, "ruler_reading"
        return t, "skip_ruler_no_length"

    # ── PLAIN RULER (shows 12 / where is 5) ──────────────────────────────────
    if is_ruler_plain_question(t):
        svg = ruler_plain_svg()
        new_t = "Use the ruler below. " + t + svg
        return new_t, "ruler_plain"

    # ── COMPARISON (two named objects with specific inch lengths) ────────────
    if is_comparison_question(t):
        pairs = extract_comparison_lengths(t)
        if pairs and len(pairs) == 2:
            (l1, n1), (l2, n2) = pairs
            svg = comparison_ruler_svg(l1, n1, l2, n2)
            new_t = t + svg
            return new_t, "comparison"

    return t, "skip"


# ─────────────────────────────────────────────────────────────────────────────
# FILE EXTRACTION + REPLACEMENT
# ─────────────────────────────────────────────────────────────────────────────

def extract_t_fields(content):
    """
    Walk through JS content extracting all "t":"..." positions.
    Returns list of (start_of_value, end_of_value, text) where positions
    refer to the content string (including the quotes).
    """
    results = []
    i = 0
    while i < len(content):
        idx = content.find('"t":', i)
        if idx == -1:
            break
        # find opening quote of value
        start = content.find('"', idx + 4)
        if start == -1:
            break
        # find closing quote (handle escapes)
        j = start + 1
        while j < len(content):
            ch = content[j]
            if ch == "\\":
                j += 2
                continue
            if ch == '"':
                break
            j += 1
        # start and j are positions of the opening/closing quotes
        results.append((start, j, content[start+1:j]))
        i = j + 1
    return results


def unescape_js(s):
    """Convert JS escape sequences to Python string."""
    return (s.replace('\\"', '"')
             .replace('\\n', '\n')
             .replace('\\t', '\t')
             .replace('\\\\', '\\'))


def escape_js(s):
    """Convert Python string to JS string content (inside double quotes)."""
    return (s.replace('\\', '\\\\')
             .replace('"', '\\"')
             .replace('\n', '\\n')
             .replace('\t', '\\t'))


def process_file(src, bak):
    print(f"Reading {src} ...")
    with open(src, "r", encoding="utf-8") as f:
        content = f.read()

    print(f"Backing up to {bak} ...")
    shutil.copy2(src, bak)

    fields = extract_t_fields(content)
    print(f"Found {len(fields)} 't' fields total")

    counts = {
        "already_has_svg": 0,
        "clock": 0,
        "ruler_reading": 0,
        "ruler_plain": 0,
        "comparison": 0,
        "skip": 0,
        "skip_clock_no_parse": 0,
        "skip_ruler_no_length": 0,
    }

    # We need to process in reverse order so that character positions stay valid
    # after replacements
    changes = []  # list of (start, end, new_raw_content)

    for start, end, raw in fields:
        # raw is the JS-escaped text between the quotes
        text = unescape_js(raw)
        new_text, category = process_question(text)
        counts[category] = counts.get(category, 0) + 1

        if new_text != text:
            new_raw = escape_js(new_text)
            changes.append((start, end, new_raw))

    print(f"\nPlanned changes: {len(changes)}")

    # Apply changes in reverse order
    changes.sort(key=lambda x: x[0], reverse=True)
    content_list = list(content)
    for start, end, new_raw in changes:
        # Replace content between start+1 and end (exclusive) with new_raw
        content_list[start+1:end] = list(new_raw)

    new_content = "".join(content_list)

    print(f"Writing updated file ...")
    with open(src, "w", encoding="utf-8") as f:
        f.write(new_content)

    return counts


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    counts = process_file(SRC, BAK)

    clock_minute = counts.get("clock_minute", 0)
    total_svgs_added = counts["clock"] + clock_minute + counts["ruler_reading"] + counts["ruler_plain"] + counts["comparison"]
    total_skipped = counts["skip"] + counts["skip_clock_no_parse"] + counts["skip_ruler_no_length"]
    already = counts["already_has_svg"]

    print("\n" + "="*60)
    print("RESULTS")
    print("="*60)
    print(f"SVGs added total:            {total_svgs_added}")
    print(f"  Clock/time questions:       {counts['clock']}")
    print(f"  Clock minute-hand only:     {clock_minute}")
    print(f"  Ruler reading (measured):   {counts['ruler_reading']}")
    print(f"  Ruler plain/reference:      {counts['ruler_plain']}")
    print(f"  Comparison bars:            {counts['comparison']}")
    print(f"\nAlready had SVG (untouched): {already}")
    print(f"Intentionally skipped:       {total_skipped}")
    print(f"  Pure concept / no visual:  {counts['skip']}")
    print(f"  Clock (couldn't parse):    {counts['skip_clock_no_parse']}")
    print(f"  Ruler (couldn't parse len):{counts['skip_ruler_no_length']}")
    print("="*60)
    print(f"\nBackup saved to: {BAK}")
