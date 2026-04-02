#!/usr/bin/env python3
"""Fix Unit 6 answer distribution by line number (SVG-heavy content).
Operates directly on option arrays at specific line numbers to avoid matching huge SVG strings."""
import re, sys

with open('E:/Cameron Jones/my-math-roots/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

orig_lines = lines[:]
fixes = 0

def move_answer(line_num, from_idx, to_idx):
    """Reorder options so the correct answer moves from from_idx to to_idx."""
    global fixes
    line = lines[line_num - 1]
    # Match the options array and answer index
    m = re.search(r",(\['.+?'\]),(\d+),", line)
    if not m:
        # Try double-quote variant
        m = re.search(r',(\[".+?"\]),(\d+),', line)
    if not m:
        print(f'  NO MATCH L{line_num}: {line.strip()[:80]}')
        return
    opts_str = m.group(1)
    cur_idx = int(m.group(2))
    if cur_idx != from_idx:
        print(f'  WRONG IDX L{line_num}: expected {from_idx}, got {cur_idx}')
        return
    # Parse options list
    opts = re.findall(r"'([^']*)'", opts_str)
    if not opts:
        opts = re.findall(r'"([^"]*)"', opts_str)
    if len(opts) != 4:
        print(f'  BAD OPTS L{line_num}: {opts_str[:60]}')
        return
    answer = opts[from_idx]
    # Build new options: remove answer, insert at to_idx
    others = [o for i, o in enumerate(opts) if i != from_idx]
    others.insert(to_idx, answer)
    new_opts_str = "['" + "','".join(others) + "']"
    # Replace in line
    old_part = opts_str + "," + str(from_idx) + ","
    new_part = new_opts_str + "," + str(to_idx) + ","
    if old_part not in line:
        print(f'  REPLACE FAIL L{line_num}: old_part not found')
        return
    lines[line_num - 1] = line.replace(old_part, new_part, 1)
    fixes += 1
    print(f'  OK L{line_num}: [{",".join(opts)}] idx{from_idx}→{to_idx} answer="{answer}"')

# =========================================================
# U6L1 qBank: 0=3,1=9,2=16,3=2 → 0=8,1=7,2=7,3=8
# Move 5 from idx2→0, 4 from idx2→3, 2 from idx1→3
# =========================================================
print('\n=== U6L1 qBank ===')
# idx 2 → 0
move_answer(2783, 2, 0)
move_answer(2785, 2, 0)
move_answer(2787, 2, 0)
move_answer(2789, 2, 0)
move_answer(2795, 2, 0)
# idx 2 → 3
move_answer(2784, 2, 3)
move_answer(2786, 2, 3)
move_answer(2796, 2, 3)
move_answer(2804, 2, 3)
# idx 1 → 3
move_answer(2794, 1, 3)
move_answer(2799, 1, 3)

# =========================================================
# U6L2 qBank: 0=0,1=15,2=12,3=4 → 0=8,1=7,2=8,3=8
# Move 8 from idx1→0, 4 from idx2→3
# =========================================================
print('\n=== U6L2 qBank ===')
# idx 1 → 0
move_answer(2837, 1, 0)
move_answer(2839, 1, 0)
move_answer(2841, 1, 0)
move_answer(2843, 1, 0)
move_answer(2845, 1, 0)
move_answer(2846, 1, 0)
move_answer(2848, 1, 0)
move_answer(2849, 1, 0)
# idx 2 → 3
move_answer(2833, 2, 3)
move_answer(2835, 2, 3)
move_answer(2838, 2, 3)
move_answer(2840, 2, 3)

# =========================================================
# U6L2 quiz: 0=0,1=3,2=3,3=0 → 0=1,1=2,2=2,3=1
# Move 1 from idx1→0, 1 from idx2→3
# =========================================================
print('\n=== U6L2 quiz ===')
move_answer(2867, 1, 0)
move_answer(2865, 2, 3)

# =========================================================
# U6L3 qBank: 0=0,1=10,2=16,3=4 → 0=8,1=8,2=7,3=7
# Move 2 from idx1→0, 6 from idx2→0, 3 from idx2→3
# =========================================================
print('\n=== U6L3 qBank ===')
# idx 1 → 0
move_answer(2887, 1, 0)
move_answer(2898, 1, 0)
# idx 2 → 0
move_answer(2885, 2, 0)
move_answer(2891, 2, 0)
move_answer(2896, 2, 0)
move_answer(2902, 2, 0)
move_answer(2905, 2, 0)
move_answer(2909, 2, 0)
# idx 2 → 3
move_answer(2899, 2, 3)
move_answer(2908, 2, 3)
move_answer(2910, 2, 3)

# =========================================================
# U6L3 quiz: 0=0,1=3,2=3,3=0 → 0=1,1=2,2=2,3=1
# Move 1 from idx1→0, 1 from idx2→3
# =========================================================
print('\n=== U6L3 quiz ===')
move_answer(2919, 1, 0)
move_answer(2917, 2, 3)

# =========================================================
# U6L4 qBank: 0=2,1=14,2=13,3=2 → 0=8,1=8,2=8,3=7
# Move 6 from idx1→0, 5 from idx2→3
# =========================================================
print('\n=== U6L4 qBank ===')
# idx 1 → 0
move_answer(2938, 1, 0)
move_answer(2941, 1, 0)
move_answer(2943, 1, 0)
move_answer(2946, 1, 0)
move_answer(2948, 1, 0)
move_answer(2954, 1, 0)
# idx 2 → 3
move_answer(2937, 2, 3)
move_answer(2942, 2, 3)
move_answer(2944, 2, 3)
move_answer(2945, 2, 3)
move_answer(2947, 2, 3)

# =========================================================
# U6L4 quiz: 0=0,1=2,2=4,3=0 → 0=1,1=1,2=2,3=2
# Move 1 from idx1→0, 2 from idx2→3
# =========================================================
print('\n=== U6L4 quiz ===')
move_answer(2970, 1, 0)
move_answer(2971, 2, 3)
move_answer(2974, 2, 3)

# =========================================================
# U6 testBank: 0=1,1=13,2=15,3=1 → 0=7,1=7,2=8,3=8
# Move 6 from idx1→0, 7 from idx2→3
# =========================================================
print('\n=== U6 testBank ===')
# idx 1 → 0
move_answer(2979, 1, 0)
move_answer(2982, 1, 0)
move_answer(2985, 1, 0)
move_answer(2988, 1, 0)
move_answer(2989, 1, 0)
move_answer(2990, 1, 0)
# idx 2 → 3
move_answer(2978, 2, 3)
move_answer(2980, 2, 3)
move_answer(2986, 2, 3)
move_answer(2987, 2, 3)
move_answer(2991, 2, 3)
move_answer(2993, 2, 3)
move_answer(2994, 2, 3)

# =========================================================
print(f'\nTotal fixes: {fixes}')
if lines == orig_lines:
    print('ERROR: No changes made!')
    sys.exit(1)

with open('E:/Cameron Jones/my-math-roots/index.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('File written OK.')
