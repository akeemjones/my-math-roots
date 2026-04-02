#!/usr/bin/env python3
"""
compress_u6_svgs.py - v5
Compresses u6.js SVGs to under 600KB.

Strategy:
1. Load u6.js.bak as source
2. Compress ALL existing SVGs using compact templates
3. Inject NEW compact SVGs for tally chart, line plot, AND bar graph questions
4. Write to u6.js and validate

SVG key technique: path-based tally marks (1 element per row vs 1 per mark)
"""

import re, os, sys
sys.stdout.reconfigure(encoding='utf-8')

BAK_FILE = r'E:\Cameron Jones\my-math-roots\src\data\u6.js.bak'
OUT_FILE = r'E:\Cameron Jones\my-math-roots\src\data\u6.js'
COLORS   = ['#e74c3c', '#3498db', '#27ae60', '#f39c12', '#9b59b6', '#e67e22', '#1abc9c']
STYLE    = 'display:block;margin:auto;background:#f9f9f9'


# ─── helpers ──────────────────────────────────────────────────────────────────

def esc(s: str) -> str:
    return s.replace('"', '\\"')

def unesc(s: str) -> str:
    return s.replace('\\"', '"').replace('\\/', '/')


# ─── tally path ────────────────────────────────────────────────────────────────

def tally_d(count: int, x0: int, yt: int, yb: int, sp: int = 4) -> str:
    """SVG path 'd' for count tally marks. Groups of 5: 4 vertical + 1 diagonal."""
    if count <= 0:
        return ''
    parts, x, i = [], x0, 0
    while i < count:
        gs = x
        gc = min(5, count - i)
        if gc < 5:
            for _ in range(gc):
                parts.append(f'M{x},{yt}V{yb}')
                x += sp
        else:
            for _ in range(4):
                parts.append(f'M{x},{yt}V{yb}')
                x += sp
            parts.append(f'M{gs-1},{yb}L{gs+4*sp},{yt}')
            x += 3
        i += 5
    return ''.join(parts)


# ─── BAR CHART ────────────────────────────────────────────────────────────────

def parse_bar_svg(svg: str):
    bars = []
    for rx, ry, rw, rh, color in re.findall(
        r'<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="(#[0-9a-f]+)" rx="[12]"',
        svg
    ):
        cx = int(rx) + int(rw) // 2
        vals  = re.findall(r'<text x="(\d+)" y="\d+" text-anchor="middle" font-size="[5-8]" fill="#333">(\d+)</text>', svg)
        value = next((int(v) for tx, v in vals if abs(int(tx)-cx) <= 10), None)
        cats  = re.findall(r'<text x="(\d+)" y="\d+" text-anchor="middle" font-size="[5-9]" fill="#(?:333|555)">([^<]+)</text>', svg)
        label = next((tv for tx, tv in cats if abs(int(tx)-cx) <= 10 and not tv.lstrip('-').isdigit()), None)
        if value is not None:
            bars.append({'label': (label or str(value))[:7], 'value': value, 'color': color})
    return bars


def make_bar(bars):
    if not bars: return None
    n  = len(bars)
    vw = 140; y0 = 62; x0 = 4
    aw = (vw - x0 - 4) / n
    bw = max(int(aw * 0.68), 6)
    gp = (aw - bw) / 2
    mx = max(b['value'] for b in bars) or 1
    mh = y0 - 7
    p  = [f'<svg viewBox="0 0 {vw} 72" width="280" height="144" style="{STYLE}">']
    p.append(f'<line x1="{x0}" y1="{y0}" x2="{vw-4}" y2="{y0}" stroke="#aaa" stroke-width="0.7"/>')
    for i, b in enumerate(bars):
        bx = int(x0 + i * aw + gp)
        h  = max(int(b['value'] / mx * mh), 2)
        by = y0 - h; cx = bx + bw // 2
        p.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{h}" fill="{b["color"]}" rx="1"/>')
        p.append(f'<text x="{cx}" y="{by-1}" text-anchor="middle" font-size="5" fill="#333">{b["value"]}</text>')
        p.append(f'<text x="{cx}" y="{y0+7}" text-anchor="middle" font-size="5" fill="#555">{b["label"]}</text>')
    p.append('</svg>')
    return ''.join(p)


# ─── TALLY CHART ─────────────────────────────────────────────────────────────

def parse_tally_svg(svg: str):
    cats = re.findall(
        r'<text x="[1-9]" y="(\d+)" font-size="[5-7]" fill="#333"(?:\s+font-weight="bold")?>([^<]+)</text>',
        svg
    )
    tv = re.findall(
        r'<line x1="(\d+)" y1="(\d+)" x2="\1" y2="(\d+)" stroke="#333" stroke-width="[12]\.[258]"',
        svg
    )
    seps = sorted(set(int(y) for y in re.findall(
        r'<line x1="\d+" y1="(\d+)" x2="\d+" y2="\1" stroke="#(?:ddd|ccc|bbb)"', svg
    )))
    hdr = 14; bounds = []
    if seps:
        prev = hdr
        for sy in seps:
            if sy > hdr + 3: bounds.append((prev, sy)); prev = sy
        while len(bounds) < len(cats): bounds.append((prev, prev + 30))
    else:
        rh = 14
        for j in range(len(cats)):
            bounds.append((hdr + j * rh, hdr + (j + 1) * rh))
    rows = []
    for j, (cy, clbl) in enumerate(cats):
        if j < len(bounds):
            y1, y2 = bounds[j]
            cnt = sum(1 for _, ty1, ty2 in tv
                      if y1 <= int(ty1) <= y2 + 2 or y1 <= int(ty2) <= y2 + 2)
            rows.append((clbl.strip(), cnt))
    return rows


def parse_tally_text(q: str):
    # "Label: IIII"
    p1 = re.findall(r'([A-Za-z][A-Za-z ]{0,14}):\s*(I{1,12}(?:\s*I{0,12})*)', q)
    if p1:
        r = [(l.strip(), s.replace(' ','').count('I')) for l, s in p1]
        if len(r) >= 2: return r
    # "Label IIII" (capitalised)
    p2 = re.findall(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(I{1,12}(?:\s*I{0,12})*)', q)
    if p2:
        r = [(l.strip(), s.replace(' ','').count('I')) for l, s in p2]
        if len(r) >= 2: return r
    # "Label=N" or "Label:N" with digits
    p3 = re.findall(r'([A-Za-z][A-Za-z ]{0,14})[=:]\s*(\d+)', q)
    if len(p3) >= 2: return [(l.strip(), int(v)) for l, v in p3]
    return []


def parse_inline_tally_svg(svg: str):
    labels = re.findall(r'font-weight="bold">([^<:]+):</text>', svg)
    tv = re.findall(
        r'<line x1="(\d+)" y1="(\d+)" x2="\1" y2="(\d+)" stroke="#333" stroke-width="2\.5"', svg
    )
    if not labels: return []
    row_data = {}
    for _, ty1, _ in tv:
        band = int(ty1) // 34
        row_data[band] = row_data.get(band, 0) + 1
    bands = sorted(row_data)
    return [(labels[j].strip(), row_data.get(bands[j], 0))
            for j in range(min(len(labels), len(bands)))]


def make_tally(rows):
    if not rows: return None
    n = len(rows); rh = 12; hh = 10
    vh = hh + n * rh; vw = 100
    p = [f'<svg viewBox="0 0 {vw} {vh}" width="200" height="{vh*2}" style="{STYLE}">']
    p.append(f'<rect x="0" y="0" width="{vw}" height="{hh}" fill="#ddeeff" rx="1"/>')
    p.append(f'<text x="1" y="{hh-1}" font-size="5" fill="#444">Category</text>')
    p.append(f'<text x="42" y="{hh-1}" font-size="5" fill="#444">Tally</text>')
    for i, (cat, cnt) in enumerate(rows):
        y = hh + i * rh; yc = y + rh - 3; yt = y + 2; yb = y + rh - 2
        p.append(f'<line x1="0" y1="{y}" x2="{vw}" y2="{y}" stroke="#bbb" stroke-width="0.5"/>')
        p.append(f'<text x="1" y="{yc}" font-size="5" fill="#333">{cat[:11]}</text>')
        if cnt > 0:
            d = tally_d(cnt, 42, yt, yb)
            p.append(f'<path d="{d}" stroke="#333" stroke-width="1.2" stroke-linecap="round" fill="none"/>')
    p.append('</svg>')
    return ''.join(p)


# ─── LINE PLOT ────────────────────────────────────────────────────────────────

def _tick_map_from_svg(svg: str):
    """Return pixel->label dict from tick label text elements."""
    from collections import Counter
    all_text = re.findall(
        r'<text x="(\d+)" y="(\d+)" text-anchor="middle" font-size="[5-9]" fill="#333"(?:\s+font-weight="bold")?>(\d+)</text>',
        svg
    )
    if not all_text: return {}
    yc = Counter(int(y) for _, y, _ in all_text)
    label_y = yc.most_common(1)[0][0]
    return {int(tx): int(tv) for tx, ty, tv in all_text if abs(int(ty) - label_y) <= 3}


def parse_lineplot_svg(svg: str):
    tick_map = _tick_map_from_svg(svg)
    if not tick_map: return {'ticks': [], 'marks': {}}
    marks = {}
    # X marks as <path d="M...L...M...L..." stroke="#e74c3c"...>
    xp = re.findall(
        r'<path d="(M\d+,\d+L\d+,\d+M\d+,\d+L\d+,\d+(?:M\d+,\d+L\d+,\d+M\d+,\d+L\d+,\d+)*)" stroke="#e74c3c"',
        svg
    )
    for d in xp:
        coords = re.findall(r'M(\d+),', d)
        for cx_str in coords[::2]:
            cx = int(cx_str) + 3
            best = min(tick_map, key=lambda px: abs(px - cx))
            if abs(best - cx) < 20:
                lv = tick_map[best]
                marks[lv] = marks.get(lv, 0) + 1
    # × symbols (w=400 dot-plot style)
    xs = re.findall(r'<text x="(\d+)" y="\d+" text-anchor="middle" font-size="12" fill="#229954"[^>]*>×</text>', svg)
    for tx in xs:
        cx = int(tx)
        best = min(tick_map, key=lambda px: abs(px - cx))
        if abs(best - cx) <= 5:
            lv = tick_map[best]
            marks[lv] = marks.get(lv, 0) + 1
    return {'ticks': sorted(tick_map.values()), 'marks': marks}


def parse_lineplot_text(q: str):
    marks = {}
    for val, xs in re.findall(r'[Aa]bove\s+(?:size\s+)?(\d+):\s*(X+(?:\s+X+)*)', q):
        marks[int(val)] = xs.count('X')
    if marks: return {'ticks': sorted(marks), 'marks': marks}
    for cnt, val in re.findall(r'(\d+)\s+[Xx×]\s*marks?\s+above\s+(?:the\s+(?:number\s+)?|size\s+)?(\d+)', q):
        marks[int(val)] = int(cnt)
    if marks: return {'ticks': sorted(marks), 'marks': marks}
    for val, xs in re.findall(r'(\d+):\s*([×Xx]+)', q):
        marks[int(val)] = len(xs)
    return {'ticks': sorted(marks), 'marks': marks}


def make_lineplot(data):
    ticks = data.get('ticks', []); marks = data.get('marks', {})
    if not ticks: return None
    n = len(ticks); vw = 90; nly = 38; nlx1 = 6; nlx2 = vw - 6
    sp = (nlx2 - nlx1) / max(n - 1, 1)
    txm = {t: int(nlx1 + i * sp) for i, t in enumerate(ticks)}
    mxc = max(marks.values()) if marks else 0
    vh = max(50, nly + 10 + mxc * 8)
    p = [f'<svg viewBox="0 0 {vw} {vh}" width="180" height="{vh*2}" style="{STYLE}">']
    p.append(f'<line x1="{nlx1}" y1="{nly}" x2="{nlx2}" y2="{nly}" stroke="#888" stroke-width="0.8"/>')
    for t in ticks:
        tx = txm[t]
        p.append(f'<line x1="{tx}" y1="{nly}" x2="{tx}" y2="{nly+3}" stroke="#888" stroke-width="0.7"/>')
        p.append(f'<text x="{tx}" y="{nly+8}" text-anchor="middle" font-size="6" fill="#333">{t}</text>')
    for val, cnt in marks.items():
        if val not in txm or cnt <= 0: continue
        tx = txm[val]
        d  = ''.join(
            f'M{tx-3},{nly-4-k*8}L{tx+3},{nly+2-k*8}M{tx+3},{nly-4-k*8}L{tx-3},{nly+2-k*8}'
            for k in range(cnt)
        )
        p.append(f'<path d="{d}" stroke="#e74c3c" stroke-width="1.4" stroke-linecap="round" fill="none"/>')
    p.append('</svg>')
    return ''.join(p)


# ─── BAR TEXT PARSING & COMPACT BAR SVG ──────────────────────────────────────

BAR_COLORS = ['#e74c3c', '#3498db', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c']


def parse_bar_text(text: str):
    """
    Extract (label, value) pairs from bar graph question text.
    Handles multiple patterns:
      Pattern 1: Label=N, Label=N  (with optional category prefix before colon)
      Pattern 2: Label:N, Label:N
      Pattern 3: prose "12 apples and 18 oranges"
      Pattern 4: "Label=N" anywhere in sentence
    Returns list of (label, int) or [] if unparseable.
    """
    # Remove escaped sequences for easier parsing
    t = text.replace('\\"', '"').replace('\\/', '/')

    # Pattern 1 & 4: Key=Value pairs (most common)
    # E.g. "A bar graph shows: Pizza=9, Tacos=4, Burgers=6"
    # E.g. "Soccer=5, Baseball=3, Basketball=7"
    # Also handles "Category: X=N, Y=M" by stripping the category prefix
    kv = re.findall(r'([A-Za-z][A-Za-z ]{0,18}?)=(\d+)', t)
    # Filter: exclude keys that look like math expressions or single chars
    kv = [(k.strip(), int(v)) for k, v in kv if k.strip() and len(k.strip()) >= 2]
    if len(kv) >= 2:
        # Deduplicate (keep first occurrence per label)
        seen = {}
        result = []
        for k, v in kv:
            if k not in seen:
                seen[k] = True
                result.append((k, v))
        return result[:6]  # max 6 bars

    # Pattern 2: Key:N pairs (e.g. "Red:7, Blue:5")
    kv2 = re.findall(r'([A-Za-z][A-Za-z ]{0,18}?)\s*:\s*(\d+)', t)
    kv2 = [(k.strip(), int(v)) for k, v in kv2 if k.strip() and len(k.strip()) >= 2]
    if len(kv2) >= 2:
        seen = {}
        result = []
        for k, v in kv2:
            if k not in seen:
                seen[k] = True
                result.append((k, v))
        return result[:6]

    # Pattern 3: prose "12 apples and 18 oranges"
    p3 = re.findall(r'(\d+)\s+([a-z]{3,14})', t.lower())
    if len(p3) >= 2:
        return [(label.capitalize(), int(num)) for num, label in p3[:6]]

    return []


def make_compact_bar_svg(items):
    """
    Make a compact bar chart SVG from (label, value) pairs.
    Designed to be ≤ 400 chars.
    """
    if not items:
        return None
    n = len(items)
    vw = 140; y0 = 64; x0 = 20
    gap = 3
    total_w = vw - x0 - 4
    bw = max(int((total_w - gap * (n - 1)) / n), 6)
    bw = min(bw, 24)  # cap bar width
    mx = max(v for _, v in items) or 1
    max_h = 55  # max bar height in pixels

    p = [f'<svg width="280" height="160" viewBox="0 0 140 80" style="display:block;margin:6px auto;border-radius:6px;background:#f9f9f9">']
    p.append(f'<line x1="18" y1="4" x2="18" y2="64" stroke="#aaa" stroke-width="1"/>')
    p.append(f'<line x1="18" y1="64" x2="136" y2="64" stroke="#aaa" stroke-width="1"/>')

    for i, (label, value) in enumerate(items):
        color = BAR_COLORS[i % len(BAR_COLORS)]
        bx = x0 + i * (bw + gap)
        h = max(int(value / mx * max_h), 2)
        by = y0 - h
        cx = bx + bw // 2
        # Truncate label to 6 chars to save space
        lbl = label[:6]
        p.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{h}" fill="{color}" rx="2"/>')
        p.append(f'<text x="{cx}" y="{by-2}" text-anchor="middle" font-size="6" fill="#333">{value}</text>')
        p.append(f'<text x="{cx}" y="72" text-anchor="middle" font-size="5" fill="#555">{lbl}</text>')

    p.append('</svg>')
    return ''.join(p)


# ─── PICTOGRAPH ───────────────────────────────────────────────────────────────

def parse_picto_svg(svg: str):
    km = re.search(r'>Key: ([^<]+)</text>', svg)
    key = km.group(1).strip() if km else ''
    rl = [(int(y), lbl) for y, lbl in re.findall(
        r'<text x="\d+" y="(\d+)" font-size="[678]" fill="#333" font-weight="bold">(?!Key:)([^<]+)</text>', svg
    ) if int(y) > 20]
    syms = re.findall(r'<text x="\d+" y="(\d+)" font-size="(?:9|1[024])">([^<]+)</text>', svg)
    seps = sorted(set(int(y) for y in re.findall(
        r'<line x1="\d+" y1="(\d+)" x2="\d+" y2="\1" stroke="#eee"', svg
    )))
    hdr = 20; bounds = []
    if seps:
        prev = hdr
        for sy in seps:
            if sy > hdr + 5: bounds.append((prev, sy)); prev = sy
        while len(bounds) < len(rl): bounds.append((prev, prev + 25))
    else:
        for j in range(len(rl)): bounds.append((hdr + j * 20, hdr + (j + 1) * 20))
    rows = []
    for j, (ly, lbl) in enumerate(rl):
        if j < len(bounds):
            y1, y2 = bounds[j]
            ss = [s for sy, s in syms if y1 <= int(sy) <= y2 + 5]
            rows.append((lbl.strip(), ss[0] if ss else '★', len(ss)))
    return {'key_text': key, 'rows': rows}


def make_picto(data):
    if not data: return None
    key = data.get('key_text', ''); rows = data.get('rows', [])
    if not rows: return None
    n = len(rows); rh = 12; hh = 10; vh = hh + n * rh; vw = 105
    p = [f'<svg viewBox="0 0 {vw} {vh}" width="210" height="{vh*2}" style="{STYLE}">']
    p.append(f'<rect x="0" y="0" width="{vw}" height="{hh}" fill="#ddeeff" rx="1"/>')
    p.append(f'<text x="1" y="{hh-1}" font-size="5" fill="#444">Key: {key}</text>')
    for i, (lbl, sym, cnt) in enumerate(rows):
        y = hh + i * rh; yc = y + rh - 3
        p.append(f'<line x1="0" y1="{y}" x2="{vw}" y2="{y}" stroke="#bbb" stroke-width="0.5"/>')
        p.append(f'<text x="1" y="{yc}" font-size="5" fill="#333">{lbl[:10]}</text>')
        xs = 44
        for _ in range(cnt):
            p.append(f'<text x="{xs}" y="{yc+1}" font-size="8">{sym}</text>')
            xs += 10
    p.append('</svg>')
    return ''.join(p)


def strip_fills(svg: str) -> str:
    """Remove decorative fill rects from small pictographs."""
    r = re.sub(r'<rect x="\d+" y="\d+" width="\d+" height="1[68]" fill="#(?:fafafa|f0f4f8)" rx="1"/>', '', svg)
    r = re.sub(r'<line x1="(\d+)" y1="(\d+)" x2="\d+" y2="\2" stroke="#ddd" stroke-width="1"/>', '', r)
    r = re.sub(r'<rect x="\d+" y="\d+" width="\d+" height="14" fill="#e8f4ff" rx="[23]?"/>', '', r)
    return r


# ─── compress one SVG ─────────────────────────────────────────────────────────

def compress_one(svg_raw: str, width: int):
    """Return compact SVG or None (keep as-is)."""
    if 'inline-block' in svg_raw: return None
    if width >= 560: return None          # lesson SVGs: keep

    if width == 520:
        bars = parse_bar_svg(svg_raw)
        return make_bar(bars) if bars else None

    if width in (410, 342):
        rows = parse_tally_svg(svg_raw)
        return make_tally(rows) if rows else None

    if width in (440, 240):               # line plots incl w=240
        data = parse_lineplot_svg(svg_raw)
        return make_lineplot(data) if data['ticks'] else None

    if width == 500:
        data = parse_picto_svg(svg_raw)
        return make_picto(data) if data.get('rows') else None

    if width == 280:
        rows = parse_inline_tally_svg(svg_raw)
        return make_tally(rows) if rows else None

    if width == 400:
        # dot-plot / pictograph line plots
        data = parse_lineplot_svg(svg_raw)
        if data['marks']:
            return make_lineplot(data)
        # try pictograph
        data2 = parse_picto_svg(svg_raw)
        return make_picto(data2) if data2.get('rows') else None

    if 300 <= width <= 520 and 'Key:' in svg_raw:
        stripped = strip_fills(svg_raw)
        if len(stripped) < len(svg_raw) - 20: return stripped

    return None


# ─── Step 1: compress existing SVGs ──────────────────────────────────────────

def compress_all(content: str):
    pat = re.compile(r'<svg width=\\"(\d+)\\".*?</svg>', re.DOTALL)
    matches = list(pat.finditer(content))
    n_comp = n_skip = saved = 0
    for m in reversed(matches):
        width = int(m.group(1))
        svg_esc = m.group(0)
        compact = compress_one(unesc(svg_esc), width)
        if compact:
            ce = esc(compact)
            saved += len(svg_esc) - len(ce)
            content = content[:m.start()] + ce + content[m.end():]
            n_comp += 1
        else:
            n_skip += 1
    return content, n_comp, n_skip, saved


# ─── Step 2: inject new SVGs for plain-text questions ───────────────────────

# Match "t" fields that contain plain text (no <svg) + followed by "o" (options array)
PLAIN_T = re.compile(
    r'("t"\s*:\s*")((?:[^"\\]|\\[^"])*?)(","o")',
    re.DOTALL
)


def inject_svgs(content: str):
    """
    Add compact SVGs to plain-text tally, line-plot, and bar graph questions.
    """
    injected = 0
    bar_injected = 0
    parts = []; last = 0
    for m in PLAIN_T.finditer(content):
        prefix, q_esc, suffix = m.group(1), m.group(2), m.group(3)
        if '<svg' in q_esc:
            continue
        q = unesc(q_esc)
        ql = q.lower()
        svg = None

        # Tally charts
        if 'tally' in ql:
            rows = parse_tally_text(q)
            if len(rows) >= 2:
                svg = make_tally(rows)

        # Line plots
        elif 'line plot' in ql or 'x mark' in ql or '× mark' in ql:
            data = parse_lineplot_text(q)
            if data.get('marks'):
                svg = make_lineplot(data)

        # Bar graphs — parse data from text and inject compact bar chart
        elif 'bar graph' in ql or 'bar chart' in ql:
            items = parse_bar_text(q)
            if len(items) >= 2:
                bar_svg = make_compact_bar_svg(items)
                if bar_svg:
                    svg = bar_svg
                    bar_injected += 1

        if svg:
            parts.append(content[last:m.start()])
            parts.append(prefix + q_esc + esc(svg) + suffix)
            last = m.end()
            injected += 1

    parts.append(content[last:])
    print(f'  Bar graph SVGs injected: {bar_injected}')
    return ''.join(parts), injected


# ─── main ─────────────────────────────────────────────────────────────────────

def main():
    print(f'Loading {BAK_FILE}...')
    with open(BAK_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = len(content)
    print(f'Backup: {orig:,} bytes ({orig//1024}KB), {content.count("<svg")} SVGs')

    print('\nStep 1: Compressing existing SVGs...')
    content, n_comp, n_skip, saved = compress_all(content)
    print(f'  Compressed: {n_comp}  Skipped: {n_skip}  Saved: {saved//1024}KB')

    print('\nStep 2: Injecting new compact SVGs (tally + line plot only)...')
    content, injected = inject_svgs(content)
    print(f'  Injected: {injected}')

    final = len(content)
    print(f'\nSVGs in output: {content.count("<svg")}')
    print(f'Backup: {orig:,} bytes ({orig//1024}KB)')
    print(f'Output: {final:,} bytes ({final//1024}KB)')
    print(f'Change: {final-orig:+,} bytes ({(final-orig)//1024:+d}KB)')

    target = 600 * 1024
    if final <= target:
        print(f'✓ Under 600KB target!')
    else:
        print(f'✗ Over target by {(final-target)//1024}KB')

    print(f'\nWriting {OUT_FILE}...')
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

    print('Validating JS syntax...')
    rc = os.system(f'node --check "{OUT_FILE}"')
    if rc == 0:
        print('✓ JS syntax valid')
    else:
        print('✗ Syntax error — restoring backup')
        import shutil; shutil.copy(BAK_FILE, OUT_FILE)
        sys.exit(1)

    # Print size breakdown
    print('\nSize breakdown:')
    pat = re.compile(r'<svg.*?</svg>', re.DOTALL)
    # Only count escaped SVGs
    pat2 = re.compile(r'<svg[^>]*>.*?</svg>', re.DOTALL)
    with open(OUT_FILE, 'r', encoding='utf-8') as f:
        out = f.read()
    svg_total = sum(len(m.group(0)) for m in pat2.finditer(out))
    print(f'  SVG content:    {svg_total//1024}KB')
    print(f'  Non-SVG:        {(len(out)-svg_total)//1024}KB')


if __name__ == '__main__':
    main()
