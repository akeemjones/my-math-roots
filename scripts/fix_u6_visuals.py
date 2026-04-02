#!/usr/bin/env python3
"""
fix_u6_visuals.py
Adds inline SVG visuals to plain-text chart questions in u6.js
"""

import re
import shutil
import sys
import os

INPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'u6.js')
INPUT_FILE = os.path.normpath(INPUT_FILE)
BACKUP_FILE = INPUT_FILE + '.bak'

# ─────────────────────────────────────────────────────────────────────────────
# SVG GENERATORS
# ─────────────────────────────────────────────────────────────────────────────

COLORS = ['#e74c3c', '#e67e22', '#27ae60', '#3498db', '#8e44ad',
          '#f39c12', '#16a085', '#c0392b', '#2980b9', '#d35400']


def make_bar_svg(data, title=''):
    """
    data: list of (label, value) tuples
    title: optional chart title
    Returns: SVG string
    """
    n = len(data)
    if n == 0:
        return ''

    max_val = max(v for _, v in data)
    if max_val == 0:
        max_val = 1

    # Nice y-axis max and step
    if max_val <= 10:
        y_step = 2
        y_max = max_val + (2 - max_val % 2) if max_val % 2 != 0 else max_val + 2
    elif max_val <= 20:
        y_step = 5
        y_max = max_val + (5 - max_val % 5) if max_val % 5 != 0 else max_val + 5
    else:
        y_step = 10
        y_max = max_val + (10 - max_val % 10) if max_val % 10 != 0 else max_val + 10
    if y_max <= max_val:
        y_max = max_val + y_step

    vw = 220
    vh = 130
    left = 30
    bottom = 108
    top = 18
    right_x = 215
    chart_h = bottom - top  # 90px
    chart_w = right_x - left  # 185px

    bar_slot = chart_w // n
    bar_w = min(40, bar_slot - 4)

    def val_to_y(v):
        return bottom - int(chart_h * v / y_max)

    parts = []
    parts.append(f'<svg width="520" height="312" viewBox="0 0 {vw} {vh}" '
                 f'style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">')

    # Title
    if title:
        safe = title.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        parts.append(f'<text x="{vw//2}" y="12" text-anchor="middle" font-size="8" '
                     f'fill="#333" font-weight="bold">{safe}</text>')

    # Axes
    parts.append(f'<line x1="{left}" y1="{top}" x2="{left}" y2="{bottom}" '
                 f'stroke="#999" stroke-width="1.5"/>')
    parts.append(f'<line x1="{left}" y1="{bottom}" x2="{right_x}" y2="{bottom}" '
                 f'stroke="#999" stroke-width="1.5"/>')

    # Y-axis ticks and grid
    y = 0
    while y <= y_max:
        px_y = val_to_y(y)
        parts.append(f'<text x="{left-4}" y="{px_y+3}" text-anchor="end" '
                     f'font-size="7" fill="#666">{y}</text>')
        parts.append(f'<line x1="{left-2}" y1="{px_y}" x2="{left+2}" y2="{px_y}" '
                     f'stroke="#999" stroke-width="1"/>')
        if y > 0:
            parts.append(f'<line x1="{left}" y1="{px_y}" x2="{right_x}" y2="{px_y}" '
                         f'stroke="#eee" stroke-width="0.5"/>')
        y += y_step

    # Bars
    for i, (label, val) in enumerate(data):
        color = COLORS[i % len(COLORS)]
        bar_x = left + i * bar_slot + (bar_slot - bar_w) // 2
        bar_top_y = val_to_y(val)
        bar_h = bottom - bar_top_y
        safe_label = label.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        disp_label = safe_label if len(safe_label) <= 8 else safe_label[:7] + '.'

        parts.append(f'<rect x="{bar_x}" y="{bar_top_y}" width="{bar_w}" height="{bar_h}" '
                     f'fill="{color}" rx="2"/>')
        parts.append(f'<text x="{bar_x + bar_w//2}" y="{bar_top_y - 2}" text-anchor="middle" '
                     f'font-size="7" fill="#333">{val}</text>')
        parts.append(f'<text x="{bar_x + bar_w//2}" y="{bottom + 9}" text-anchor="middle" '
                     f'font-size="8" fill="#333">{disp_label}</text>')

    parts.append('</svg>')
    return ''.join(parts)


def make_tally_chart_svg(rows):
    """
    Multi-row tally chart SVG.
    rows: list of (label, count) tuples
    """
    n = len(rows)
    max_count = max(c for _, c in rows) if rows else 1

    row_h = 22
    header_h = 16

    # Calculate SVG width based on max tally marks
    max_groups = (max_count + 4) // 5
    tally_col_w = max(80, max_groups * 52 + 10)
    label_col_w = 55
    svg_w = label_col_w + tally_col_w + 6
    svg_h = header_h + n * row_h + 8

    # Display size
    disp_w = max(300, svg_w * 2 + 60)
    disp_h = max(80, svg_h * 2 + 40)

    parts = []
    parts.append(f'<svg width="{disp_w}" height="{disp_h}" '
                 f'viewBox="0 0 {svg_w} {svg_h}" '
                 f'style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">')

    # Header
    parts.append(f'<rect x="2" y="2" width="{label_col_w - 4}" height="{header_h - 2}" '
                 f'fill="#e8f4ff" rx="2"/>')
    parts.append(f'<rect x="{label_col_w}" y="2" width="{tally_col_w}" height="{header_h - 2}" '
                 f'fill="#e8f4ff" rx="2"/>')
    parts.append(f'<text x="6" y="{header_h - 4}" font-size="7" fill="#333" '
                 f'font-weight="bold">Category</text>')
    parts.append(f'<text x="{label_col_w + 5}" y="{header_h - 4}" font-size="7" fill="#333" '
                 f'font-weight="bold">Tally Marks</text>')

    # Rows
    for i, (label, count) in enumerate(rows):
        y0 = header_h + i * row_h
        row_fill = '#fafafa' if i % 2 == 0 else '#f0f4f8'

        parts.append(f'<rect x="2" y="{y0}" width="{svg_w - 4}" height="{row_h}" '
                     f'fill="{row_fill}" rx="1"/>')
        parts.append(f'<line x1="2" y1="{y0}" x2="{svg_w - 2}" y2="{y0}" '
                     f'stroke="#ddd" stroke-width="0.5"/>')

        safe_label = label.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        disp_label = safe_label if len(safe_label) <= 9 else safe_label[:8] + '.'
        parts.append(f'<text x="5" y="{y0 + row_h//2 + 3}" font-size="7" fill="#333" '
                     f'font-weight="bold">{disp_label}</text>')

        # Tally marks
        tally_x = label_col_w + 5
        tally_y_top = y0 + 4
        tally_y_bot = y0 + row_h - 4
        mark_spacing = 7
        group_gap = 8

        remaining = count
        tx = tally_x
        while remaining > 0:
            group = min(remaining, 5)
            for m in range(min(group, 4)):
                mx = tx + m * mark_spacing
                parts.append(f'<line x1="{mx}" y1="{tally_y_top}" x2="{mx}" y2="{tally_y_bot}" '
                              f'stroke="#333" stroke-width="1.8" stroke-linecap="round"/>')
            if group == 5:
                # diagonal cross
                x_end = tx + 3 * mark_spacing
                parts.append(f'<line x1="{tx - 2}" y1="{tally_y_bot}" '
                              f'x2="{x_end + 2}" y2="{tally_y_top}" '
                              f'stroke="#333" stroke-width="1.8" stroke-linecap="round"/>')
                tx += 4 * mark_spacing + group_gap
            else:
                tx += group * mark_spacing + group_gap
            remaining -= group

    # Bottom border
    bottom_y = header_h + n * row_h
    parts.append(f'<line x1="2" y1="{bottom_y}" x2="{svg_w - 2}" y2="{bottom_y}" '
                 f'stroke="#ddd" stroke-width="1"/>')

    parts.append('</svg>')
    return ''.join(parts)


def make_pictograph_svg(rows, symbol, key_val):
    """
    rows: list of (label, actual_count) tuples — will display actual_count/key_val symbols
    symbol: unicode char
    key_val: what each symbol represents
    """
    n = len(rows)

    row_h = 18
    header_h = 16
    label_col_w = 50
    sym_start_x = label_col_w + 4
    sym_spacing = 16

    max_syms = max(int(round(c / key_val)) for _, c in rows) if rows else 1
    svg_w = sym_start_x + max_syms * sym_spacing + 10
    svg_w = max(svg_w, 120)
    svg_h = header_h + n * row_h + 8

    disp_w = max(300, svg_w * 2)
    disp_h = max(100, svg_h * 2)

    parts = []
    parts.append(f'<svg width="{disp_w}" height="{disp_h}" '
                 f'viewBox="0 0 {svg_w} {svg_h}" '
                 f'style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">')

    # Key header
    parts.append(f'<rect x="2" y="2" width="{svg_w - 4}" height="{header_h - 2}" '
                 f'fill="#e8f4ff" rx="2"/>')
    parts.append(f'<text x="6" y="{header_h - 4}" font-size="7" fill="#333" '
                 f'font-weight="bold">Key: {symbol} = {key_val}</text>')

    # Rows
    for i, (label, actual_count) in enumerate(rows):
        num_syms = int(round(actual_count / key_val)) if key_val > 0 else actual_count
        y0 = header_h + i * row_h
        row_fill = '#fafafa' if i % 2 == 0 else '#f0f4f8'

        parts.append(f'<rect x="2" y="{y0}" width="{svg_w - 4}" height="{row_h}" '
                     f'fill="{row_fill}" rx="1"/>')
        parts.append(f'<line x1="2" y1="{y0}" x2="{svg_w - 2}" y2="{y0}" '
                     f'stroke="#ddd" stroke-width="0.5"/>')

        safe_label = label.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        disp_label = safe_label if len(safe_label) <= 8 else safe_label[:7] + '.'
        parts.append(f'<text x="4" y="{y0 + 13}" font-size="7" fill="#333" '
                     f'font-weight="bold">{disp_label}</text>')

        for s in range(num_syms):
            sx = sym_start_x + s * sym_spacing
            parts.append(f'<text x="{sx}" y="{y0 + 14}" font-size="12">{symbol}</text>')

    # Bottom border
    bottom_y = header_h + n * row_h
    parts.append(f'<line x1="2" y1="{bottom_y}" x2="{svg_w - 2}" y2="{bottom_y}" '
                 f'stroke="#ddd" stroke-width="1"/>')

    parts.append('</svg>')
    return ''.join(parts)


def make_line_plot_svg(points, unit='inches'):
    """
    points: list of (value, count) tuples  e.g. [(3,4),(4,6),(5,2)]
    unit: label for x-axis
    Returns: SVG string
    """
    if not points:
        return ''

    vals = [v for v, c in points]
    min_val = min(vals)
    max_val = max(vals)
    max_count = max(c for _, c in points)

    vw = 220
    vh = 120
    left = 25
    bottom = 95
    top = 15
    right_pad = 15

    num_vals = max_val - min_val + 1
    col_w = min(30, (vw - left - right_pad) // max(num_vals, 1))
    chart_w = col_w * num_vals

    x_mark_size = 7
    mark_v_spacing = 9

    parts = []
    parts.append(f'<svg width="440" height="240" viewBox="0 0 {vw} {vh}" '
                 f'style="display:block;margin:8px auto;border-radius:8px;background:#f9f9f9">')

    # Title area
    parts.append(f'<text x="{vw//2}" y="12" text-anchor="middle" font-size="7" '
                 f'fill="#555">Line Plot</text>')

    # X-axis line
    parts.append(f'<line x1="{left}" y1="{bottom}" x2="{left + chart_w}" y2="{bottom}" '
                 f'stroke="#999" stroke-width="1.5"/>')

    # X marks and labels for each value
    for v in range(min_val, max_val + 1):
        col_idx = v - min_val
        cx = left + col_idx * col_w + col_w // 2

        # Tick mark on x-axis
        parts.append(f'<line x1="{cx}" y1="{bottom}" x2="{cx}" y2="{bottom + 3}" '
                     f'stroke="#999" stroke-width="1"/>')
        # Value label
        parts.append(f'<text x="{cx}" y="{bottom + 10}" text-anchor="middle" '
                     f'font-size="8" fill="#333" font-weight="bold">{v}</text>')

        # Find count for this value
        count = 0
        for pv, pc in points:
            if pv == v:
                count = pc
                break

        # Draw X marks stacked from bottom
        for k in range(count):
            mark_y = bottom - (k + 1) * mark_v_spacing
            half = x_mark_size // 2
            # X shape: two crossing lines
            parts.append(f'<line x1="{cx - half}" y1="{mark_y - half}" '
                         f'x2="{cx + half}" y2="{mark_y + half}" '
                         f'stroke="#e74c3c" stroke-width="1.8" stroke-linecap="round"/>')
            parts.append(f'<line x1="{cx + half}" y1="{mark_y - half}" '
                         f'x2="{cx - half}" y2="{mark_y + half}" '
                         f'stroke="#e74c3c" stroke-width="1.8" stroke-linecap="round"/>')

    parts.append('</svg>')
    return ''.join(parts)


# ─────────────────────────────────────────────────────────────────────────────
# PARSERS
# ─────────────────────────────────────────────────────────────────────────────

def parse_tally_notation(s):
    """Count all I characters in a tally notation string."""
    return s.count('I')


def parse_key_value_pairs(text):
    """
    Parse 'Label=Number' or 'Label: Number' patterns.
    Returns list of (label, int_value) or None.
    """
    pattern = r'([A-Za-z][A-Za-z\s]*?)\s*[=:]\s*(\d+(?:\.\d+)?)'
    matches = re.findall(pattern, text)
    if len(matches) >= 2:
        result = []
        for label, val in matches:
            label = label.strip()
            try:
                result.append((label, int(float(val))))
            except ValueError:
                pass
        return result if len(result) >= 2 else None
    return None


def parse_tally_rows(text):
    """
    Parse tally chart rows with I notation.
    Returns list of (label, count) or None.
    """
    # Pattern with colon: "Dogs: IIII II"
    pattern = r'([A-Za-z][A-Za-z\s]*?):\s*((?:I+\s*)+)'
    matches = re.findall(pattern, text)
    if len(matches) >= 2:
        result = []
        for label, tally_str in matches:
            count = parse_tally_notation(tally_str)
            if count > 0:
                result.append((label.strip(), count))
        if len(result) >= 2:
            return result

    # Pattern without colon: "Cats IIII, Birds III"
    pattern2 = r'([A-Za-z][A-Za-z\s]{1,15}?)\s+((?:I{1,5}\s*)+)(?=[,;.]|$)'
    matches2 = re.findall(pattern2, text)
    if len(matches2) >= 2:
        result = []
        for label, tally_str in matches2:
            count = parse_tally_notation(tally_str)
            if count > 0:
                result.append((label.strip(), count))
        if len(result) >= 2:
            return result

    # Numeric format: "Spring:7, Summer:9, Fall:5" or "Spring=7,Summer=9"
    # Only use this if no tally I-patterns were found
    kv_matches = re.findall(r'([A-Za-z][A-Za-z\s]*?)\s*[:=]\s*(\d+)', text)
    # Filter out likely non-category matches
    skip_words = {'each', 'key', 'above', 'size', 'class', 'a', 'total', 'there', 'you',
                  'star', 'data', 'bar', 'tally', 'chart', 'graph', 'line', 'plot'}
    kv_rows = [(lbl.strip(), int(n)) for lbl, n in kv_matches
               if lbl.strip().lower() not in skip_words and len(lbl.strip()) > 1]
    if len(kv_rows) >= 2:
        return kv_rows

    return None


def parse_line_plot_data(text):
    """
    Parse line plot data like:
      "Above 3: XX, Above 4: XXXXX, Above 5: XX"
      "Above 4: X X X, Above 5: X X X X X"
      "2:X X X, 3:XXXX"
    Returns list of (value, count) or None.
    """
    # Pattern: "Above N: X..." or "N: X..."
    pattern = r'[Aa]bove\s+(\d+)\s*:\s*((?:X\s*)+)'
    matches = re.findall(pattern, text)
    if not matches:
        pattern2 = r'(\d+)\s*:\s*((?:X+\s*)+)'
        matches = re.findall(pattern2, text)

    if len(matches) >= 2:
        result = []
        for val_str, xs in matches:
            count = xs.count('X')
            result.append((int(val_str), count))
        return result

    # Pattern: "Above N: no X marks" = 0
    # "2 X marks above the number 3"  -> single point
    m = re.search(r'(\d+)\s+X\s+marks\s+above\s+(?:the\s+number\s+)?(\d+)', text, re.I)
    if m:
        return [(int(m.group(2)), int(m.group(1)))]

    # "0 X marks above the number N"
    m = re.search(r'0\s+X\s+marks\s+above\s+(?:the\s+number\s+)?(\d+)', text, re.I)
    if m:
        return [(int(m.group(1)), 0)]

    # "2 X marks above 5 and 6 X marks above 7"
    matches = re.findall(r'(\d+)\s+X\s+marks?\s+above\s+(?:the\s+number\s+)?(\d+)', text, re.I)
    if len(matches) >= 2:
        return [(int(v), int(c)) for c, v in matches]

    return None


def pick_pictograph_symbol(text):
    """Pick symbol and key value from pictograph question text."""
    symbol = '★'
    key_val = 1

    m = re.search(r'each\s+(?:picture|star|symbol|smiley\s*face|heart|circle|ball|apple|book)\s*=\s*(\d+)', text, re.I)
    if not m:
        m = re.search(r'(?:star|picture|symbol)\s*=\s*(\d+)', text, re.I)
    if m:
        key_val = int(m.group(1))

    text_lower = text.lower()
    if 'heart' in text_lower:
        symbol = '♥'
    elif 'smiley' in text_lower or 'smile' in text_lower:
        symbol = '☺'
    elif 'circle' in text_lower:
        symbol = '●'
    elif 'ball' in text_lower:
        symbol = '⚽'
    elif 'book' in text_lower:
        symbol = '★'  # use star since book emoji may not render
    elif 'apple' in text_lower:
        symbol = '★'
    else:
        symbol = '★'

    return symbol, key_val


# ─────────────────────────────────────────────────────────────────────────────
# QUESTION CLEANERS
# ─────────────────────────────────────────────────────────────────────────────

# Regex pattern matching the data-description prefix of bar graph questions
BAR_PREFIXES = [
    # "A bar graph shows favorite drinks: Milk=4, Juice=9, Water=5."
    r'A bar (?:graph|chart)\s+shows\s+(?:favorite\s+)?(?:[\w\s]+?:)?\s*(?:[A-Za-z][\w\s]*?=\d+[,\s]*)+[.]?\s*',
    # "Look at the bar graph of favorite sports. Soccer=5, Baseball=3."
    r'Look at the bar (?:graph|chart)[^.]*\.\s*(?:[A-Za-z][\w\s]*?=\d+[,\s]*)*',
    # "The bar graph shows books read: Mia=8, James=5."
    r'The bar (?:graph|chart) shows[^.]*:\s*(?:[A-Za-z][\w\s]*?=\d+[,\s]*)*',
    # "A bar graph shows animals at a zoo: Monkeys=6..."
    r'A bar (?:graph|chart) shows [^:]+:\s*(?:[A-Za-z][\w\s]*?=\d+[,\s]*)*',
    # "A bar graph shows: X=N, Y=N..."
    r'A bar (?:graph|chart) shows:\s*(?:[A-Za-z][\w\s]*?=\d+[,\s]*)+',
    # "A bar graph shows 12 apples and 18 oranges."
    r'A bar (?:graph|chart) shows \d+[^.]+\.',
]

TALLY_PREFIXES = [
    r'A tally chart shows[^.?!]*\.\s*',
    r'A tally chart is missing[^.]+\.',
]

PICTO_PREFIXES = [
    r'(?:In\s+a|A|Look at the)\s+pictograph[^.]*\.\s*',
    r'A pictograph shows[^.]*\.\s*',
]

LINE_PREFIXES = [
    r'A line plot shows[^.]*\.\s*',
    r'A line plot about \w+ shows:\s*',
]

GRAPH_PREFIXES = [
    r'(?:A|The)\s+graph shows[^.]*\.\s*',
    r'The data shows[^.]*\.\s*',
]


def clean_question_text(text, prefixes):
    """
    Remove data description prefix from question text.
    Falls back to finding first question keyword.
    """
    for pat in prefixes:
        m = re.match(pat, text, re.I)
        if m:
            remaining = text[m.end():].strip()
            remaining = re.sub(r'^[.\s,;]+', '', remaining)
            if len(remaining) > 5:
                return remaining

    # Also strip inline "Label=N, Label=N" patterns that might remain
    # Find the first question word
    m = re.search(r'\b(How|Which|What|Who|Is|Are|Can|Did|Do|Put|If|Were|Does|Why)\b', text)
    if m:
        return text[m.start():].strip()

    return text


def strip_data_remnants(text):
    """Remove leftover 'X=N, Y=N' patterns from question text."""
    # Remove patterns like "Soccer=5, Baseball=3, Basketball=7." at start
    cleaned = re.sub(r'^(?:[A-Za-z][\w\s]*?=\d+[,\s]*)+\.?\s*', '', text).strip()
    if len(cleaned) > 5:
        return cleaned
    return text


# ─────────────────────────────────────────────────────────────────────────────
# QUESTION PROCESSORS
# ─────────────────────────────────────────────────────────────────────────────

def infer_bar_title(text):
    """Infer a chart title from the question text."""
    m = re.search(
        r'(?:bar\s+(?:graph|chart)\s+(?:shows?\s+)?(?:of\s+)?|graph\s+of\s+)'
        r'(?:favorite\s+)?'
        r'(books?\s+read|fruits?|drinks?|sports?|pets?|animals?|colors?|flowers?|'
        r'crayons?|toys?|weather|seasons?|snacks?|supplies|vehicles?|playground\s+equipment|'
        r'stickers?\s+earned|rainy\s+days?|[\w\s]{3,25}?)'
        r'(?=:|[A-Z]|\.|,|\s+[A-Z]|\s+\w+=)',
        text, re.I
    )
    if m:
        topic = m.group(1).strip().rstrip(' :,.')
        if len(topic) > 2:
            return topic.title()
    # Guess from labels
    return 'Survey Results'


def process_bar_graph_question(t_value):
    """Process a bar graph question without SVG."""
    data = parse_key_value_pairs(t_value)

    if data is None:
        # "shows 12 apples and 18 oranges"
        m = re.search(r'shows\s+(\d+)\s+(\w+)s?\s+and\s+(\d+)\s+(\w+)', t_value, re.I)
        if m:
            data = [(m.group(2).capitalize(), int(m.group(1))),
                    (m.group(4).capitalize(), int(m.group(3)))]

    # Single bar: "bar for grapes goes up to 6"
    if data is None:
        m = re.search(r'bar for\s+(\w+)\s+goes up to\s+(\d+)', t_value, re.I)
        if m:
            label = m.group(1).capitalize()
            val = int(m.group(2))
            # Make a minimal 1-bar chart
            data = [(label, val)]

    if data is None or len(data) < 1:
        return t_value, False

    title = infer_bar_title(t_value)
    svg = make_bar_svg(data, title)

    q = clean_question_text(t_value, BAR_PREFIXES)
    q = strip_data_remnants(q)

    return f'Use the bar graph below. {q} {svg}', True


def process_tally_question(t_value):
    """Process a tally chart question without SVG."""
    rows = parse_tally_rows(t_value)

    if rows is None:
        # "25 votes for cats and 13 for dogs"
        m = re.search(r'(\d+)\s+votes?\s+for\s+(\w+)\s+and\s+(\d+)\s+(?:votes?\s+)?for\s+(\w+)', t_value, re.I)
        if m:
            rows = [(m.group(2).capitalize(), int(m.group(1))),
                    (m.group(4).capitalize(), int(m.group(3)))]

    # Handle missing data question: "Dogs: IIII, Cats: ???, Fish: III"
    # Try to parse what we can, use the known value for the ??? row
    if rows is None:
        # Find rows with real data
        real_rows = []
        pattern = r'([A-Za-z][A-Za-z\s]*?):\s*((?:I+\s*)+)'
        for label, tally_str in re.findall(pattern, t_value):
            count = parse_tally_notation(tally_str)
            if count > 0:
                real_rows.append((label.strip(), count))
        # Find the missing row
        missing_m = re.search(r'([A-Za-z][A-Za-z\s]*?):\s*\?\?\?', t_value, re.I)
        if missing_m and real_rows:
            # Try to find the known count for missing row
            known_m = re.search(r'(\d+)\s+students?\s+voted\s+for\s+(\w+)', t_value, re.I)
            if known_m:
                missing_label = missing_m.group(1).strip()
                known_count = int(known_m.group(1))
                real_rows.append((missing_label.capitalize(), known_count))
                rows = real_rows

    if rows is None or len(rows) < 2:
        return t_value, False

    svg = make_tally_chart_svg(rows)
    q = clean_question_text(t_value, TALLY_PREFIXES)

    return f'Use the tally chart below. {q} {svg}', True


def process_pictograph_question(t_value):
    """Process a pictograph question without SVG."""
    symbol, key_val = pick_pictograph_symbol(t_value)

    rows = []

    # "X row has N pictures/stars" or "X has N stars"
    row_m = re.findall(
        r'(?:The\s+)?(\w[\w\s]*?)\s+(?:row\s+has|has)\s+(\d+)\s+'
        r'(?:pictures?|stars?|hearts?|circles?|balls?|smileys?|faces?)',
        t_value, re.I
    )
    for label, count in row_m:
        label = label.strip()
        if label.lower() not in ('each', 'the', 'a', 'an', 'there', 'you', 'he', 'she', 'key'):
            rows.append((label.capitalize(), int(count)))

    # "X has N stars/pictures"
    if not rows:
        row_m = re.findall(
            r'([A-Za-z][A-Za-z\s]{1,20}?)\s+has\s+(\d+)\s+'
            r'(?:stars?|pictures?|hearts?|circles?|balls?|smileys?)',
            t_value, re.I
        )
        for label, count in row_m:
            label = label.strip()
            if label.lower() not in ('each', 'the', 'a', 'an', 'there', 'you', 'he', 'she', 'key'):
                rows.append((label.capitalize(), int(count)))

    # "Summer has 9 stars. Winter has 3 stars. Spring has 6 stars."
    if not rows:
        matches = re.findall(r'([A-Za-z]+)\s+has\s+(\d+)', t_value, re.I)
        skip = {'each', 'the', 'a', 'an', 'there', 'you', 'he', 'she', 'it', 'key', 'which', 'tiger', 'turtle'}
        for label, count in matches:
            if label.lower() not in skip:
                rows.append((label.capitalize(), int(count)))

    # Single point: "There are N pictures"
    if not rows:
        m = re.search(r'(?:There are|has)\s+(\d+)\s+(?:pictures?|stars?)', t_value, re.I)
        if m:
            rows = [('Item', int(m.group(1)))]

    # Handle "you see N stars in the X row"
    if not rows:
        m = re.search(r'[Yy]ou see\s+(\d+)\s+stars?\s+in\s+the\s+(\w+)\s+row', t_value, re.I)
        if m:
            rows = [(m.group(2).capitalize(), int(m.group(1)))]

    # Handle "could you make a pictograph...data: Roses=9, Tulips=12"
    if not rows:
        data_m = re.search(r'(?:data|for)[:\s]+(.+?)(?:\?|$)', t_value, re.I)
        if data_m:
            kv = parse_key_value_pairs(data_m.group(1))
            if kv:
                rows = [(lbl, val) for lbl, val in kv]

    # Two-class comparison: "Class A: Dogs=12, Cats=8. Class B: Dogs=7, Cats=11"
    if not rows:
        class_m = re.search(r'Class\s+[AB]:\s*((?:[A-Za-z]+=\d+[,\s]*)+)', t_value, re.I)
        if class_m:
            kv = parse_key_value_pairs(class_m.group(1))
            if kv:
                rows = [(lbl, val) for lbl, val in kv]

    if not rows:
        return t_value, False

    svg = make_pictograph_svg(rows, symbol, key_val)
    q = clean_question_text(t_value, PICTO_PREFIXES)

    return f'Use the pictograph below. {q} {svg}', True


def process_line_plot_question(t_value):
    """Process a line plot question without SVG."""
    points = parse_line_plot_data(t_value)

    # Try description-only "from X to Y inches. Data only at 5, 7, 9."
    if points is None:
        range_m = re.search(r'from\s+(\d+)\s+to\s+(\d+)\s+inches?', t_value, re.I)
        data_at_m = re.search(r'[Dd]ata only (?:appears )?at\s+([\d,\s]+and\s+\d+|[\d,\s]+)', t_value, re.I)
        if range_m and data_at_m:
            lo, hi = int(range_m.group(1)), int(range_m.group(2))
            # Parse the "at" values
            at_vals = [int(x) for x in re.findall(r'\d+', data_at_m.group(1))]
            count_dict = {v: 2 for v in at_vals}  # assume 2 marks each
            points = [(v, count_dict.get(v, 0)) for v in range(lo, hi + 1)]
        elif range_m:
            lo, hi = int(range_m.group(1)), int(range_m.group(2))
            # Generic: give 1-3 marks at each value
            import random
            random.seed(lo + hi)
            points = [(v, random.randint(1, 4)) for v in range(lo, hi + 1)]

    if points is None:
        return t_value, False

    # If only single point, expand a bit
    if len(points) == 1:
        v, c = points[0]
        # Create minimal plot around that value
        points_full = [(v - 1, 0), (v, c), (v + 1, 0)]
    else:
        # Fill in gaps with 0
        all_vals = set(v for v, _ in points)
        min_v = min(all_vals)
        max_v = max(all_vals)
        count_dict = dict(points)
        points_full = [(v, count_dict.get(v, 0)) for v in range(min_v, max_v + 1)]

    svg = make_line_plot_svg(points_full)
    q = clean_question_text(t_value, LINE_PREFIXES)

    return f'Use the line plot below. {q} {svg}', True


def process_generic_graph_question(t_value):
    """Process 'A graph shows X=3, Y=5...' questions as bar graphs."""
    data = parse_key_value_pairs(t_value)
    if data is None or len(data) < 2:
        return t_value, False

    title = infer_bar_title(t_value)
    if title == 'Survey Results':
        # Try to extract topic from question
        m = re.search(r'(?:graph|data)\s+shows?\s+(?:favorite\s+)?([\w\s]{3,20}?)(?=:|[A-Z]|\.|,)', t_value, re.I)
        if m:
            topic = m.group(1).strip()
            if len(topic) > 2:
                title = topic.title()

    svg = make_bar_svg(data, title)

    q = clean_question_text(t_value, GRAPH_PREFIXES)
    q = strip_data_remnants(q)

    return f'Use the graph below. {q} {svg}', True


# ─────────────────────────────────────────────────────────────────────────────
# FILE I/O HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def extract_t_entries(content):
    """
    Returns list of (val_start_pos, raw_escaped_str, decoded_str)
    val_start_pos: index right after the opening quote of the t value
    raw_escaped_str: the literal bytes between the quotes (with JS escapes)
    decoded_str: Python string
    """
    results = []
    needle = '"t":"'
    i = 0
    while True:
        idx = content.find(needle, i)
        if idx == -1:
            break
        val_start = idx + len(needle)
        j = val_start
        raw_chars = []
        dec_chars = []
        while j < len(content):
            ch = content[j]
            if ch == '\\':
                nc = content[j + 1] if j + 1 < len(content) else ''
                raw_chars.append(ch)
                raw_chars.append(nc)
                if nc == '"':
                    dec_chars.append('"')
                elif nc == 'n':
                    dec_chars.append('\n')
                elif nc == 't':
                    dec_chars.append('\t')
                elif nc == '\\':
                    dec_chars.append('\\')
                else:
                    dec_chars.append(nc)
                j += 2
            elif ch == '"':
                break
            else:
                raw_chars.append(ch)
                dec_chars.append(ch)
                j += 1
        results.append((val_start, ''.join(raw_chars), ''.join(dec_chars)))
        i = idx + 1
    return results


def js_escape(python_str):
    """
    Encode a Python string for embedding as a JS double-quoted string value.
    The string will be placed between " characters in the JS file.
    """
    # Escape backslashes first
    s = python_str.replace('\\', '\\\\')
    # Escape double quotes
    s = s.replace('"', '\\"')
    return s


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    # Use backup if it exists (so we start fresh from original)
    source = BACKUP_FILE if os.path.exists(BACKUP_FILE) else INPUT_FILE
    print(f"Reading {source}")
    with open(source, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"File size: {len(content):,} bytes")

    # Create/overwrite backup from original
    if not os.path.exists(BACKUP_FILE):
        print(f"Creating backup: {BACKUP_FILE}")
        shutil.copy2(INPUT_FILE, BACKUP_FILE)

    # Extract all t entries
    t_entries = extract_t_entries(content)
    print(f"Found {len(t_entries)} 't' fields total")

    no_svg = [(pos, raw, dec) for pos, raw, dec in t_entries if '<svg' not in dec]
    print(f"Questions without SVG: {len(no_svg)}")

    # Preview
    print("\n=== PREVIEW (first 10) ===\n")
    prev = 0
    for pos, raw, dec in no_svg:
        if prev >= 10:
            break
        t = dec.lower()
        if 'bar graph' in t or 'bar chart' in t:
            new_t, ok = process_bar_graph_question(dec)
        elif 'tally' in t:
            new_t, ok = process_tally_question(dec)
        elif 'pictograph' in t or 'picture' in t:
            new_t, ok = process_pictograph_question(dec)
        elif 'line plot' in t:
            new_t, ok = process_line_plot_question(dec)
        elif 'graph shows' in t or 'data shows' in t:
            new_t, ok = process_generic_graph_question(dec)
        else:
            ok = False
        if ok:
            svg_i = new_t.find('<svg')
            print(f"  ORIG: {dec[:90]}")
            print(f"  NEW:  {new_t[:svg_i]}[SVG]")
            print()
            prev += 1

    # Process
    print("\n=== PROCESSING ===\n")

    updated = 0
    skipped = 0
    skipped_list = []

    # Process in reverse position order to preserve offsets
    no_svg_sorted = sorted(no_svg, key=lambda x: x[0], reverse=True)
    new_content = content

    for pos, raw, dec in no_svg_sorted:
        t = dec.lower()
        new_dec = None
        ok = False

        if 'bar graph' in t or 'bar chart' in t:
            new_dec, ok = process_bar_graph_question(dec)
        elif 'tally' in t:
            new_dec, ok = process_tally_question(dec)
        elif 'pictograph' in t or 'picture' in t:
            new_dec, ok = process_pictograph_question(dec)
        elif 'line plot' in t:
            new_dec, ok = process_line_plot_question(dec)
        elif 'graph shows' in t or 'data shows' in t:
            new_dec, ok = process_generic_graph_question(dec)

        if not ok:
            skipped += 1
            skipped_list.append(dec[:100])
            continue

        new_raw = js_escape(new_dec)

        # Replace: verify position still valid, else do exact match
        file_raw = new_content[pos:pos + len(raw)]
        if file_raw == raw:
            new_content = new_content[:pos] + new_raw + new_content[pos + len(raw):]
            updated += 1
        else:
            # Positional shift - use exact string match
            search = '"t":"' + raw + '"'
            replace = '"t":"' + new_raw + '"'
            if search in new_content:
                new_content = new_content.replace(search, replace, 1)
                updated += 1
            else:
                skipped += 1
                skipped_list.append(f'[NO_MATCH] {dec[:80]}')

    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")

    if skipped_list:
        print(f"\nSkipped ({len(skipped_list)}):")
        for s in skipped_list[:40]:
            print(f"  - {s}")
        if len(skipped_list) > 40:
            print(f"  ... and {len(skipped_list) - 40} more")

    # Verify SVG count
    final_entries = extract_t_entries(new_content)
    final_no_svg = [d for _, _, d in final_entries if '<svg' not in d]
    print(f"\nFinal state: {len(final_entries)} t fields, {len(final_no_svg)} without SVG")

    # Write
    print(f"\nWriting {INPUT_FILE} ...")
    with open(INPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)

    size_orig = os.path.getsize(BACKUP_FILE)
    size_new = os.path.getsize(INPUT_FILE)
    print(f"Done. Original: {size_orig:,} bytes -> New: {size_new:,} bytes "
          f"(+{size_new - size_orig:,} bytes)")


if __name__ == '__main__':
    main()
