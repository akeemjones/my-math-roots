import math

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

# ─── Clock SVG builder ────────────────────────────────────────────────────────
def clock_svg(hour, minute, hl_minute=False, hl_hour=False, minute_only=False):
    """
    Analog clock SVG.
    hl_minute: highlight minute hand red (for 'long hand at X' questions)
    hl_hour:   highlight hour hand blue (for 'short hand at X' questions)
    minute_only: hide hour hand (when question is only about minute hand position)
    """
    cx, cy, r = 45, 45, 38
    p = ['<svg width="180" height="180" viewBox="0 0 90 90" '
         'style="display:block;margin:6px auto;border-radius:50%;background:#fffdf5">']
    # Outer ring
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r+1}" fill="#f0f0f0" stroke="#bbb" stroke-width="1"/>')
    # Face
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fffdf5" stroke="#888" stroke-width="1.5"/>')
    # Hour markers & numbers
    for i in range(1, 13):
        a = math.radians(i * 30)
        # tick mark
        x1 = cx + (r - 5) * math.sin(a)
        y1 = cy - (r - 5) * math.cos(a)
        x2 = cx + r * math.sin(a)
        y2 = cy - r * math.cos(a)
        sw = '2' if i % 3 == 0 else '1'
        p.append(f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" '
                 f'stroke="#555" stroke-width="{sw}"/>')
        # number
        nx = cx + (r - 13) * math.sin(a)
        ny = cy - (r - 13) * math.cos(a)
        p.append(f'<text x="{nx:.2f}" y="{ny:.2f}" text-anchor="middle" '
                 f'dominant-baseline="central" font-size="8" font-weight="bold" fill="#333">{i}</text>')

    # Minute hand
    m_angle = math.radians(minute * 6)
    m_len = r - 7
    mx = cx + m_len * math.sin(m_angle)
    my = cy - m_len * math.cos(m_angle)
    m_color = '#e74c3c' if hl_minute else '#444'
    m_width = '2.5' if hl_minute else '2'
    p.append(f'<line x1="{cx}" y1="{cy}" x2="{mx:.2f}" y2="{my:.2f}" '
             f'stroke="{m_color}" stroke-width="{m_width}" stroke-linecap="round"/>')

    # Hour hand (shorter)
    if not minute_only:
        h_angle = math.radians((hour % 12 + minute / 60) * 30)
        h_len = r - 18
        hx = cx + h_len * math.sin(h_angle)
        hy = cy - h_len * math.cos(h_angle)
        h_color = '#2980b9' if hl_hour else '#222'
        h_width = '3.5' if hl_hour else '3'
        p.append(f'<line x1="{cx}" y1="{cy}" x2="{hx:.2f}" y2="{hy:.2f}" '
                 f'stroke="{h_color}" stroke-width="{h_width}" stroke-linecap="round"/>')

    # Center dot
    p.append(f'<circle cx="{cx}" cy="{cy}" r="3" fill="#333"/>')
    p.append('</svg>')
    return ''.join(p)


# ─── Map each question text to its clock ─────────────────────────────────────
# (search_text, hour, minute, hl_minute, hl_hour, minute_only)
questions = [
    # qBank questions
    ("q('Short on 4, long on 12. Time?',",          clock_svg(4,  0)),
    ("q('\"Half past 3\" means?',",                  clock_svg(3, 30)),
    ("q('Long hand at 6=how many minutes?',",        clock_svg(12, 30, hl_minute=True, minute_only=True)),
    ("q('\"Quarter to 6\"=?',",                      clock_svg(5, 45)),
    ("q('Long hand at 3=how many minutes?',",        clock_svg(12, 15, hl_minute=True, minute_only=True)),
    ("q('\"Quarter past 7\"=?',",                    clock_svg(7, 15)),
    ("q('Long hand at 9=how many minutes?',",        clock_svg(12, 45, hl_minute=True, minute_only=True)),
    ("q('Short on 8, long on 6. Time?',",            clock_svg(8, 30)),
    ("q('Long hand at 12=?',",                       clock_svg(12, 0,  hl_minute=True, minute_only=True)),
    ("q('\"Half past 11\"=?',",                      clock_svg(11, 30)),
    ("q('Short on 2, long on 12. Time?',",           clock_svg(2,  0)),
    ("q('\"Quarter to 9\"=?',",                      clock_svg(8, 45)),
    ("q('Long hand at 2=how many minutes?',",        clock_svg(12, 10, hl_minute=True, minute_only=True)),
    ("q('Short between 5 and 6, long on 12. Time?',", clock_svg(5,  0)),
    ("q('\"Five minutes past 4\"=?',",               clock_svg(4,  5)),
    ("q('Short on 12, long on 12. Time?',",          clock_svg(12, 0)),
    ("q('\"Twenty minutes past 3\"=?',",             clock_svg(3, 20)),
    ("q('Long hand at 4=how many minutes?',",        clock_svg(12, 20, hl_minute=True, minute_only=True)),
    ("q('Dinner at 6:30. Long hand position?',",     clock_svg(6, 30, hl_minute=True)),
    ("q('\"Quarter past 12\"=?',",                   clock_svg(12, 15)),
    ("q('Short on 10, long on 6. Time?',",           clock_svg(10, 30)),
    ("q('Long hand at 1=how many minutes?',",        clock_svg(12, 5,  hl_minute=True, minute_only=True)),
    ("q('\"Half past 7\"=?',",                       clock_svg(7, 30)),
    ("q('Short on 3, long on 3. Time?',",            clock_svg(3, 15)),
    # quiz section questions
    ("q('Short hand on 4, long hand on 12. Time?',", clock_svg(4,  0)),
    ("q('\"Half past 3\" means?',",                  clock_svg(3, 30)),
    ("q('Long hand points to 6. How many minutes?',", clock_svg(12, 30, hl_minute=True, minute_only=True)),
    ("q('\"Quarter to 6\" = ?',",                    clock_svg(5, 45)),
    ("q('Long hand at 3 = how many minutes?',",      clock_svg(12, 15, hl_minute=True, minute_only=True)),
]

applied = 0
for search, svg in questions:
    old_b = search.encode('utf-8')
    if old_b in content:
        # Insert SVG before the closing '  e.g. q('text?', → q('text?<SVG>',
        # The search ends with ','  — remove the ', and add SVG + ','
        new_b = search[:-2].encode('utf-8') + svg.encode('utf-8') + b"',"
        content = content.replace(old_b, new_b, 1)
        applied += 1
    else:
        print('MISSING:', search[:70])

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)

print(f'Applied {applied}/{len(questions)}')
