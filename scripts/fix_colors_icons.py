import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ── New colors + SVGs ──────────────────────────────────────────────────────

units = {
    'u1': {
        'color': '#FF2200',
        'svg': '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" fill="#FF2200" opacity="0.1"/><rect x="8" y="27" width="18" height="7" rx="3.5" fill="#FF2200"/><rect x="13.5" y="21.5" width="7" height="18" rx="3.5" fill="#FF2200"/><rect x="34" y="27" width="18" height="7" rx="3.5" fill="#FF2200" opacity="0.75"/><circle cx="9" cy="47" r="3" fill="#FF2200" opacity="0.35"/><circle cx="51" cy="13" r="3" fill="#FF2200" opacity="0.35"/></svg>',
    },
    'u2': {
        'color': '#0095FF',
        'svg': '<svg viewBox="0 0 60 60" fill="none"><rect x="3" y="14" width="54" height="38" rx="6" fill="#0095FF" opacity="0.1" stroke="#0095FF" stroke-width="2.5"/><line x1="21" y1="14" x2="21" y2="52" stroke="#0095FF" stroke-width="2"/><line x1="39" y1="14" x2="39" y2="52" stroke="#0095FF" stroke-width="2"/><rect x="5" y="17" width="13" height="6" rx="2" fill="#0095FF" opacity="0.4"/><rect x="23" y="17" width="13" height="6" rx="2" fill="#0095FF" opacity="0.4"/><rect x="41" y="17" width="13" height="6" rx="2" fill="#0095FF" opacity="0.4"/><rect x="5" y="26" width="13" height="22" rx="2" fill="#0095FF" opacity="0.65"/><rect x="23" y="32" width="13" height="16" rx="2" fill="#0095FF" opacity="0.5"/><rect x="41" y="40" width="13" height="8" rx="2" fill="#0095FF" opacity="0.35"/><rect x="21" y="8" width="18" height="5" rx="2.5" fill="#0095FF" opacity="0.5"/></svg>',
    },
    'u3': {
        'color': '#FF6600',
        'svg': '<svg viewBox="0 0 60 60" fill="none"><line x1="4" y1="40" x2="56" y2="40" stroke="#FF6600" stroke-width="3" stroke-linecap="round"/><line x1="4" y1="35" x2="4" y2="45" stroke="#FF6600" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="35" x2="30" y2="45" stroke="#FF6600" stroke-width="2.5" stroke-linecap="round"/><line x1="56" y1="35" x2="56" y2="45" stroke="#FF6600" stroke-width="2.5" stroke-linecap="round"/><path d="M4 40 Q17 22 30 40" stroke="#FF6600" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M30 40 Q43 18 56 40" stroke="#FF6600" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="4" cy="40" r="3.5" fill="#FF6600"/><circle cx="30" cy="40" r="3.5" fill="#FF6600"/><circle cx="56" cy="40" r="3.5" fill="#FF6600"/></svg>',
    },
    'u4': {
        'color': '#FF4400',
        'svg': '<svg viewBox="0 0 60 60" fill="none"><rect x="2" y="6" width="26" height="26" rx="3" fill="#FF4400" opacity="0.18" stroke="#FF4400" stroke-width="2"/><line x1="10.7" y1="6" x2="10.7" y2="32" stroke="#FF4400" stroke-width="1" opacity="0.4"/><line x1="19.3" y1="6" x2="19.3" y2="32" stroke="#FF4400" stroke-width="1" opacity="0.4"/><line x1="2" y1="14.7" x2="28" y2="14.7" stroke="#FF4400" stroke-width="1" opacity="0.4"/><line x1="2" y1="23.3" x2="28" y2="23.3" stroke="#FF4400" stroke-width="1" opacity="0.4"/><rect x="33" y="6" width="10" height="26" rx="3" fill="#FF4400" opacity="0.55" stroke="#FF4400" stroke-width="2"/><line x1="33" y1="14.7" x2="43" y2="14.7" stroke="#FF4400" stroke-width="1" opacity="0.5"/><line x1="33" y1="23.3" x2="43" y2="23.3" stroke="#FF4400" stroke-width="1" opacity="0.5"/><rect x="48" y="18" width="10" height="10" rx="2.5" fill="#FF4400" stroke="#FF4400" stroke-width="2"/></svg>',
    },
    'u5': {
        'color': '#00CC44',
        'svg': '<svg viewBox="0 0 60 60" fill="none"><rect x="3" y="18" width="36" height="24" rx="5" fill="#00CC44" opacity="0.12" stroke="#00CC44" stroke-width="2.5"/><path d="M21 24 Q15 24 15 29 Q15 33 21 33 Q27 33 27 37 Q27 41 21 41" stroke="#00CC44" stroke-width="2.5" fill="none" stroke-linecap="round"/><line x1="21" y1="21" x2="21" y2="44" stroke="#00CC44" stroke-width="2" stroke-linecap="round"/><ellipse cx="50" cy="38" rx="8" ry="3" fill="#00CC44" opacity="0.35" stroke="#00CC44" stroke-width="1.5"/><rect x="42" y="30" width="16" height="8" fill="#00CC44" opacity="0.2"/><ellipse cx="50" cy="30" rx="8" ry="3" fill="#00CC44" opacity="0.55" stroke="#00CC44" stroke-width="1.5"/><rect x="42" y="22" width="16" height="8" fill="#00CC44" opacity="0.2"/><ellipse cx="50" cy="22" rx="8" ry="3" fill="#00CC44" stroke="#00CC44" stroke-width="1.5"/></svg>',
    },
    'u6': {
        'color': '#00C7BE',
        'svg': '<svg viewBox="0 0 60 60" fill="none"><line x1="7" y1="48" x2="56" y2="48" stroke="#00C7BE" stroke-width="2.5" stroke-linecap="round"/><line x1="7" y1="10" x2="7" y2="48" stroke="#00C7BE" stroke-width="2.5" stroke-linecap="round"/><rect x="11" y="28" width="13" height="20" rx="3" fill="#00C7BE" opacity="0.65"/><rect x="28" y="16" width="13" height="32" rx="3" fill="#00C7BE"/><rect x="45" y="36" width="13" height="12" rx="3" fill="#00C7BE" opacity="0.45"/></svg>',
    },
    'u7': {
        'color': '#4C4BFF',
        'svg': '<svg viewBox="0 0 60 60" fill="none"><rect x="3" y="6" width="54" height="18" rx="4" fill="#4C4BFF" opacity="0.1" stroke="#4C4BFF" stroke-width="2"/><line x1="12" y1="6" x2="12" y2="16" stroke="#4C4BFF" stroke-width="2" stroke-linecap="round"/><line x1="20" y1="6" x2="20" y2="13" stroke="#4C4BFF" stroke-width="1.5" stroke-linecap="round"/><line x1="28" y1="6" x2="28" y2="16" stroke="#4C4BFF" stroke-width="2" stroke-linecap="round"/><line x1="36" y1="6" x2="36" y2="13" stroke="#4C4BFF" stroke-width="1.5" stroke-linecap="round"/><line x1="44" y1="6" x2="44" y2="16" stroke="#4C4BFF" stroke-width="2" stroke-linecap="round"/><line x1="52" y1="6" x2="52" y2="13" stroke="#4C4BFF" stroke-width="1.5" stroke-linecap="round"/><circle cx="30" cy="44" r="13" fill="#4C4BFF" opacity="0.1" stroke="#4C4BFF" stroke-width="2.5"/><line x1="30" y1="44" x2="24" y2="37" stroke="#4C4BFF" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="44" x2="30" y2="34" stroke="#4C4BFF" stroke-width="2" stroke-linecap="round"/><circle cx="30" cy="44" r="2.5" fill="#4C4BFF"/></svg>',
    },
    'u8': {
        'color': '#FF0055',
        'svg': '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="24" fill="#FF0055" opacity="0.1" stroke="#FF0055" stroke-width="2.5"/><path d="M30 30 L30 6 A24 24 0 0 1 54 30 Z" fill="#FF0055" opacity="0.75"/><line x1="30" y1="6" x2="30" y2="54" stroke="#FF0055" stroke-width="2.5"/><line x1="6" y1="30" x2="54" y2="30" stroke="#FF0055" stroke-width="2.5"/><circle cx="30" cy="30" r="3" fill="#FF0055"/></svg>',
    },
    'u9': {
        'color': '#C844FF',
        'svg': '<svg viewBox="0 0 60 60" fill="none"><rect x="10" y="28" width="40" height="26" rx="3" fill="#C844FF" opacity="0.18" stroke="#C844FF" stroke-width="2.5"/><polygon points="6,30 30,8 54,30" fill="#C844FF" opacity="0.35" stroke="#C844FF" stroke-width="2.5" stroke-linejoin="round"/><circle cx="22" cy="42" r="6.5" fill="#C844FF" opacity="0.5" stroke="#C844FF" stroke-width="2"/><rect x="33" y="38" width="11" height="16" rx="3" fill="#C844FF" opacity="0.4" stroke="#C844FF" stroke-width="2"/></svg>',
    },
    'u10': {
        'color': '#FFAA00',
        'svg': '<svg viewBox="0 0 60 60" fill="none"><circle cx="14" cy="11" r="6" fill="#FFAA00"/><circle cx="30" cy="11" r="6" fill="#FFAA00"/><circle cx="46" cy="11" r="6" fill="#FFAA00"/><circle cx="14" cy="24" r="6" fill="#FFAA00"/><circle cx="30" cy="24" r="6" fill="#FFAA00"/><circle cx="46" cy="24" r="6" fill="#FFAA00"/><circle cx="14" cy="37" r="6" fill="#FFAA00"/><circle cx="30" cy="37" r="6" fill="#FFAA00"/><circle cx="46" cy="37" r="6" fill="#FFAA00"/><circle cx="14" cy="50" r="5" fill="#FFAA00" opacity="0.4"/><circle cx="30" cy="50" r="5" fill="#FFAA00" opacity="0.4"/><circle cx="46" cy="50" r="5" fill="#FFAA00" opacity="0.4"/></svg>',
    },
}

# ── Apply color + svg replacements per unit ───────────────────────────────

lines = content.split('\n')
changed = 0
for i, line in enumerate(lines):
    for uid, data in units.items():
        marker = f"{{id:'{uid}',"
        if line.strip().startswith(marker):
            # Replace color:'...'
            new_line = re.sub(r"color:'[^']*'", f"color:'{data['color']}'", line)
            # Replace svg:'...'  (SVG attrs use double quotes so [^']* is safe)
            new_line = re.sub(r"svg:'[^']*'", f"svg:'{data['svg']}'", new_line)
            if new_line != line:
                lines[i] = new_line
                changed += 1
                print(f"  Updated {uid}: color={data['color']}")
            break

content = '\n'.join(lines)

# ── Add fade-in animation CSS after .cs-enter-btn:active rule ─────────────

old_css = '.cs-enter-btn:active{ transform:translateY(3px); box-shadow:0 1px 0 rgba(0,0,0,.2); }'
new_css = (
    '.cs-enter-btn:active{ transform:translateY(3px); box-shadow:0 1px 0 rgba(0,0,0,.2); }\n'
    '@keyframes cs-appear{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\n'
    '.cs{animation:cs-appear 0.2s ease-out both;}'
)
if old_css in content:
    content = content.replace(old_css, new_css)
    print('  Added cs-appear animation CSS')
else:
    print('  WARNING: could not find .cs-enter-btn:active to inject animation CSS')

# ── Add animation-delay stagger in buildHome() ────────────────────────────

old_js = '    slide.dataset.idx = i;'
new_js = (
    '    slide.dataset.idx = i;\n'
    '    slide.style.animationDelay = (i * 30) + \'ms\';'
)
if old_js in content:
    content = content.replace(old_js, new_js, 1)  # replace only first occurrence
    print('  Added animation-delay stagger in buildHome()')
else:
    print('  WARNING: could not find slide.dataset.idx injection point')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nDone — {changed}/10 units updated.')
