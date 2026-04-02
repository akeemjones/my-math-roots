#!/usr/bin/env python3
"""Fix Unit 7 answer distribution by line number."""
import re, sys

with open('E:/Cameron Jones/my-math-roots/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

orig_lines = lines[:]
fixes = 0

def move_answer(line_num, from_idx, to_idx):
    global fixes
    line = lines[line_num - 1]
    m = re.search(r",(\['.+?'\]),(\d+),", line)
    if not m:
        print(f'  NO MATCH L{line_num}: {line.strip()[:80]}')
        return
    opts_str = m.group(1)
    cur_idx = int(m.group(2))
    if cur_idx != from_idx:
        print(f'  WRONG IDX L{line_num}: expected {from_idx}, got {cur_idx}')
        return
    opts = re.findall(r"'([^']*)'", opts_str)
    if len(opts) != 4:
        print(f'  BAD OPTS L{line_num}: {opts_str[:60]}')
        return
    answer = opts[from_idx]
    others = [o for i, o in enumerate(opts) if i != from_idx]
    others.insert(to_idx, answer)
    new_opts_str = "['" + "','".join(others) + "']"
    old_part = opts_str + "," + str(from_idx) + ","
    new_part = new_opts_str + "," + str(to_idx) + ","
    if old_part not in line:
        print(f'  REPLACE FAIL L{line_num}')
        return
    lines[line_num - 1] = line.replace(old_part, new_part, 1)
    fixes += 1
    print(f'  OK L{line_num}: idx{from_idx}→{to_idx} ans="{answer}"')

# =========================================================
# U7L1 qBank: 0=7,1=10,2=12,3=0 → 0=7,1=7,2=8,3=7
# Move 3 from idx1→3, 4 from idx2→3
# =========================================================
print('\n=== U7L1 qBank ===')
move_answer(3044, 1, 3)
move_answer(3045, 1, 3)
move_answer(3048, 1, 3)
move_answer(3025, 2, 3)
move_answer(3031, 2, 3)
move_answer(3032, 2, 3)
move_answer(3033, 2, 3)

# =========================================================
# U7L1 quiz: 0=2,1=3,2=1,3=0 → 0=2,1=2,2=1,3=1
# Move 1 from idx1→3
# =========================================================
print('\n=== U7L1 quiz ===')
move_answer(3057, 1, 3)

# =========================================================
# U7L2 qBank: 0=5,1=14,2=10,3=1 → 0=7,1=8,2=8,3=7
# Move 6 from idx1→3, 2 from idx2→0
# =========================================================
print('\n=== U7L2 qBank ===')
move_answer(3077, 1, 3)
move_answer(3078, 1, 3)
move_answer(3084, 1, 3)
move_answer(3086, 1, 3)
move_answer(3090, 1, 3)
move_answer(3093, 1, 3)
move_answer(3079, 2, 0)
move_answer(3080, 2, 0)

# =========================================================
# U7L2 quiz: 0=1,1=2,2=4,3=0 → 0=1,1=2,2=2,3=2
# Move 2 from idx2→3
# =========================================================
print('\n=== U7L2 quiz ===')
move_answer(3111, 2, 3)
move_answer(3112, 2, 3)

# =========================================================
# U7L3 qBank: 0=5,1=12,2=10,3=3 → 0=7,1=7,2=8,3=8
# Move 2 from idx1→0, 3 from idx1→3, 2 from idx2→3
# =========================================================
print('\n=== U7L3 qBank ===')
move_answer(3131, 1, 0)
move_answer(3134, 1, 0)
move_answer(3138, 1, 3)
move_answer(3142, 1, 3)
move_answer(3150, 1, 3)
move_answer(3132, 2, 3)
move_answer(3136, 2, 3)

# =========================================================
# U7L3 quiz: 0=2,1=2,2=2,3=0 → 0=2,1=2,2=1,3=1
# Move 1 from idx2→3
# =========================================================
print('\n=== U7L3 quiz ===')
move_answer(3164, 2, 3)

# =========================================================
# U7 testBank: 0=26,1=55,2=44,3=4 → 0=32,1=32,2=33,3=32
# Move 6 from idx1→0, 17 from idx1→3, 11 from idx2→3
# =========================================================
print('\n=== U7 testBank ===')
# idx1 → 0 (6 moves)
move_answer(3173, 1, 0)
move_answer(3189, 1, 0)
move_answer(3191, 1, 0)
move_answer(3192, 1, 0)
move_answer(3229, 1, 0)
move_answer(3260, 1, 0)
# idx1 → 3 (17 moves)
move_answer(3174, 1, 3)
move_answer(3177, 1, 3)
move_answer(3187, 1, 3)
move_answer(3190, 1, 3)
move_answer(3195, 1, 3)
move_answer(3200, 1, 3)
move_answer(3201, 1, 3)
move_answer(3202, 1, 3)
move_answer(3208, 1, 3)
move_answer(3210, 1, 3)
move_answer(3213, 1, 3)
move_answer(3214, 1, 3)
move_answer(3217, 1, 3)
move_answer(3219, 1, 3)
move_answer(3221, 1, 3)
move_answer(3222, 1, 3)
move_answer(3225, 1, 3)
# idx2 → 3 (11 moves)
move_answer(3172, 2, 3)
move_answer(3178, 2, 3)
move_answer(3179, 2, 3)
move_answer(3180, 2, 3)
move_answer(3181, 2, 3)
move_answer(3184, 2, 3)
move_answer(3185, 2, 3)
move_answer(3193, 2, 3)
move_answer(3194, 2, 3)
move_answer(3197, 2, 3)
move_answer(3198, 2, 3)

print(f'\nTotal fixes: {fixes}')
if lines == orig_lines:
    print('ERROR: No changes!')
    sys.exit(1)

with open('E:/Cameron Jones/my-math-roots/index.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('File written OK.')
