#!/usr/bin/env python3
"""Fix all Unit 1 issues: duplicates, fragments, answer redistribution."""
import sys

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

orig = content
count = 0

def fix(old, new, label=''):
    global content, count
    old_b = old.encode('utf-8')
    new_b = new.encode('utf-8')
    n = content.count(old_b)
    if n == 0:
        print(f'  NOT FOUND: {old_b[:80]}')
        return
    content = content.replace(old_b, new_b)
    count += n
    print(f'  OK ({n}x){" ["+label+"]" if label else ""}: {old_b[:70]}')

# =========================================================
# FIX 1: L3 qBank — Replace 3 duplicate questions
# Target the SECOND occurrence of each duplicate pair
# using the unique explanation text
# =========================================================
print('\n=== FIX 1: L3 duplicates ===')

# Duplicate of "8 + 6" (first at line 1151, second at line 1161 with diff explanation)
fix(
    "q('Use the make-ten strategy. What is 8 + 6?',['12','13','14','15'],2,'8 needs 2 to reach 10. Then 10+4=14.')",
    "q('Use the make-ten strategy. What is 8 + 3?',['9','11','10','12'],1,'8 needs 2 to reach 10. Then 10+1=11.')"
)

# Duplicate of "9 + 7" (first at line 1150, second at line 1162 with diff explanation)
fix(
    "q('Use the make-ten strategy. What is 9 + 7?',['14','15','16','17'],2,'9 needs 1 to reach 10. Then 10+6=16.')",
    "q('Use the make-ten strategy. What is 9 + 3?',['12','10','11','13'],0,'9 needs 1 to reach 10. Then 10+2=12.')"
)

# Duplicate of "7 + 5" (first at line 1156, second at line 1163 with diff explanation)
fix(
    "q('Use the make-ten strategy. What is 7 + 5?',['10','11','12','13'],2,'7 needs 3 to reach 10. Then 10+2=12.')",
    "q('Use the make-ten strategy. What is 7 + 7?',['12','14','13','15'],1,'7 needs 3 to reach 10. Then 10+4=14.')"
)

# =========================================================
# FIX 2: L4 qBank — Fix 2 fragment questions
# =========================================================
print('\n=== FIX 2: L4 qBank fragments ===')

fix(
    "q('Family 5,6,11: which addition fact?',",
    "q('Which addition fact belongs to the fact family with 5, 6, and 11?',"
)

fix(
    "q('How many total facts in every family?',",
    "q('How many number sentences are in every fact family?',"
)

# =========================================================
# FIX 3: L4 quiz — Fix 1 fragment question
# =========================================================
print('\n=== FIX 3: L4 quiz fragment ===')

fix(
    "q('Missing number: 8 + __ = 15',",
    "q('What is the missing number? 8 + ___ = 15',"
)

# =========================================================
# FIX 4: unitQuiz — Redistribute answer positions
# 28/30 were at index 2 — spread across 0,1,2,3
# Target: 7 at 0, 7 at 1, 9 at 2, 7 at 3
# =========================================================
print('\n=== FIX 4: unitQuiz redistribution ===')

# Q1 → index 0 (9+3=12)
fix(
    "q('Use the count-on strategy. What is 9 + 3?',['10','11','12','13'],2,'Start at 9, count on 3: 10,11,12.')",
    "q('Use the count-on strategy. What is 9 + 3?',['12','10','11','13'],0,'Start at 9, count on 3: 10,11,12.')"
)

# Q3 → index 3 (6+6=12)
fix(
    "q('What is 6 + 6? (Doubles fact)',['10','11','12','13'],2,'6+6=12. Doubles fact!')",
    "q('What is 6 + 6? (Doubles fact)',['10','11','13','12'],3,'6+6=12. Doubles fact!')"
)

# Q4 → index 0 (5+6=11)
fix(
    "q('What is 5 + 6? Use the near-doubles strategy.',['9','10','11','12'],2,'5+5=10, +1=11.')",
    "q('What is 5 + 6? Use the near-doubles strategy.',['11','9','10','12'],0,'5+5=10, +1=11.')"
)

# Q5 → index 1 (9+4=13) — unitQuiz has short explanation, different from L3 qBank
fix(
    "q('Use the make-ten strategy. What is 9 + 4?',['11','12','13','14'],2,'9+1=10, +3=13.')",
    "q('Use the make-ten strategy. What is 9 + 4?',['11','13','12','14'],1,'9+1=10, +3=13.')"
)

# Q8 → index 0 (14+3=17)
fix(
    "q('Use the count-on strategy. What is 14 + 3?',['15','16','17','18'],2,'14,15,16,17.')",
    "q('Use the count-on strategy. What is 14 + 3?',['17','15','16','18'],0,'14,15,16,17.')"
)

# Q9 → index 1 (7+8=15)
fix(
    "q('What is 7 + 8? Use the near-doubles strategy.',['13','14','15','16'],2,'7+7=14, +1=15.')",
    "q('What is 7 + 8? Use the near-doubles strategy.',['13','15','14','16'],1,'7+7=14, +1=15.')"
)

# Q12 → index 0 (16-4=12) — unitQuiz short explanation differs from L1 qBank
fix(
    "q('Use the count-back strategy. What is 16 \u2212 4?',['10','11','12','13'],2,'16,15,14,13,12.')",
    "q('Use the count-back strategy. What is 16 \u2212 4?',['12','10','11','13'],0,'16,15,14,13,12.')"
)

# Q13 → index 3 (4+4=8)
fix(
    "q('What is 4 + 4? (Doubles fact)',['6','7','8','9'],2,'4+4=8.')",
    "q('What is 4 + 4? (Doubles fact)',['6','7','9','8'],3,'4+4=8.')"
)

# Q15 → index 3 (7+6=13) — unitQuiz short explanation differs from L3 qBank
fix(
    "q('Use the make-ten strategy. What is 7 + 6?',['11','12','13','14'],2,'7+3=10, +3=13.')",
    "q('Use the make-ten strategy. What is 7 + 6?',['11','12','14','13'],3,'7+3=10, +3=13.')"
)

# Q16 → index 1 (6+5=11) — unitQuiz short explanation unique
fix(
    "q('Use the count-on strategy. What is 6 + 5?',['9','10','11','12'],2,'6,7,8,9,10,11.')",
    "q('Use the count-on strategy. What is 6 + 5?',['9','11','10','12'],1,'6,7,8,9,10,11.')"
)

# Q17 → index 0 (9+9=18)
fix(
    "q('What is 9 + 9? (Doubles fact)',['16','17','18','19'],2,'9+9=18.')",
    "q('What is 9 + 9? (Doubles fact)',['18','16','17','19'],0,'9+9=18.')"
)

# Q19 → index 1 (6+7=13) — unitQuiz short explanation differs from L3 qBank
fix(
    "q('Use the make-ten strategy. What is 6 + 7?',['11','12','13','14'],2,'6+4=10, +3=13.')",
    "q('Use the make-ten strategy. What is 6 + 7?',['11','13','12','14'],1,'6+4=10, +3=13.')"
)

# Q20 → index 0 (17-8=9)
fix(
    "q('What is 17 \u2212 8?',['7','8','9','10'],2,'17-8=9. Check: 8+9=17.')",
    "q('What is 17 \u2212 8?',['9','7','8','10'],0,'17-8=9. Check: 8+9=17.')"
)

# Q22 → index 1 (3+3=6)
fix(
    "q('What is 3 + 3? (Doubles fact)',['4','5','6','7'],2,'3+3=6.')",
    "q('What is 3 + 3? (Doubles fact)',['4','6','5','7'],1,'3+3=6.')"
)

# Q23 → index 3 (15-7=8) — unitQuiz long explanation is unique
fix(
    "q('Use the count-back strategy. What is 15 \u2212 7?',['6','7','8','9'],2,'15,14,13,12,11,10,9,8. Answer: 8.')",
    "q('Use the count-back strategy. What is 15 \u2212 7?',['6','7','9','8'],3,'15,14,13,12,11,10,9,8. Answer: 8.')"
)

# Q25 → index 3 (5+7=12) — unitQuiz explanation unique
fix(
    "q('Use the make-ten strategy. What is 5 + 7?',['10','11','12','13'],2,'5+5=10, then +2 more = 12.')",
    "q('Use the make-ten strategy. What is 5 + 7?',['10','11','13','12'],3,'5+5=10, then +2 more = 12.')"
)

# Q27 → index 0 (12-7=5)
fix(
    "q('If 7 + 5 = 12, what is 12 \u2212 7?',['3','4','5','6'],2,'Fact family: 12-7=5.')",
    "q('If 7 + 5 = 12, what is 12 \u2212 7?',['5','3','4','6'],0,'Fact family: 12-7=5.')"
)

# Q28 → index 3 (7+7=14)
fix(
    "q('What is 7 + 7? (Doubles fact)',['12','13','14','15'],2,'7+7=14.')",
    "q('What is 7 + 7? (Doubles fact)',['12','13','15','14'],3,'7+7=14.')"
)

# Q30 → index 3 (6+7=13)
fix(
    "q('What is 6 + 7? Use the near-doubles strategy.',['11','12','13','14'],2,'6+6=12, +1=13.')",
    "q('What is 6 + 7? Use the near-doubles strategy.',['11','12','14','13'],3,'6+6=12, +1=13.')"
)

# =========================================================
# FIX 5: L1 qBank — Redistribute answer positions
# Most answers at index 2; also cascades to testBank
# Move 7 to index 0, 3 to index 1, 7 to index 3
# =========================================================
print('\n=== FIX 5: L1 qBank redistribution ===')

# → index 0
fix(
    "q('Use the count-on strategy. What is 8 + 4?',['10','11','12','13'],2,'Start at 8, count on 4: 9,10,11,12.')",
    "q('Use the count-on strategy. What is 8 + 4?',['12','10','11','13'],0,'Start at 8, count on 4: 9,10,11,12.')"
)
fix(
    "q('Use the count-on strategy. What is 7 + 5?',['10','11','12','13'],2,'Start at 7, count on 5: 8,9,10,11,12.')",
    "q('Use the count-on strategy. What is 7 + 5?',['12','10','11','13'],0,'Start at 7, count on 5: 8,9,10,11,12.')"
)
fix(
    "q('Use the count-on strategy. What is 5 + 4?',['7','8','9','10'],2,'Start at 5, count on 4: 6,7,8,9.')",
    "q('Use the count-on strategy. What is 5 + 4?',['9','7','8','10'],0,'Start at 5, count on 4: 6,7,8,9.')"
)
fix(
    "q('Use the count-back strategy. What is 15 \u2212 5?',['8','9','10','11'],2,'Start at 15, count back 5: 14,13,12,11,10.')",
    "q('Use the count-back strategy. What is 15 \u2212 5?',['10','8','9','11'],0,'Start at 15, count back 5: 14,13,12,11,10.')"
)
fix(
    "q('Use the count-back strategy. What is 11 \u2212 4?',['5','6','7','8'],2,'Start at 11, count back 4: 10,9,8,7.')",
    "q('Use the count-back strategy. What is 11 \u2212 4?',['7','5','6','8'],0,'Start at 11, count back 4: 10,9,8,7.')"
)
fix(
    "q('Use the count-back strategy. What is 18 \u2212 5?',['11','12','13','14'],2,'Start at 18, count back 5: 17,16,15,14,13.')",
    "q('Use the count-back strategy. What is 18 \u2212 5?',['13','11','12','14'],0,'Start at 18, count back 5: 17,16,15,14,13.')"
)
fix(
    "q('Use the count-on strategy. What is 9 + 5?',['12','13','14','15'],2,'Start at 9, count on 5: 10,11,12,13,14.')",
    "q('Use the count-on strategy. What is 9 + 5?',['14','12','13','15'],0,'Start at 9, count on 5: 10,11,12,13,14.')"
)

# → index 1
fix(
    "q('Use the count-on strategy. What is 14 + 2?',['14','15','16','17'],2,'Start at 14, count on 2: 15,16.')",
    "q('Use the count-on strategy. What is 14 + 2?',['14','16','15','17'],1,'Start at 14, count on 2: 15,16.')"
)
fix(
    "q('Use the count-back strategy. What is 12 \u2212 3?',['7','8','9','10'],2,'Start at 12, count back 3: 11,10,9.')",
    "q('Use the count-back strategy. What is 12 \u2212 3?',['7','9','8','10'],1,'Start at 12, count back 3: 11,10,9.')"
)
fix(
    "q('Use the count-back strategy. What is 19 \u2212 6?',['11','12','13','14'],2,'Start at 19, count back 6: 18,17,16,15,14,13.')",
    "q('Use the count-back strategy. What is 19 \u2212 6?',['11','13','12','14'],1,'Start at 19, count back 6: 18,17,16,15,14,13.')"
)

# → index 3
fix(
    "q('Use the count-on strategy. What is 11 + 3?',['12','13','14','15'],2,'Start at 11, count on 3: 12,13,14.')",
    "q('Use the count-on strategy. What is 11 + 3?',['12','13','15','14'],3,'Start at 11, count on 3: 12,13,14.')"
)
fix(
    "q('Use the count-back strategy. What is 10 \u2212 3?',['5','6','7','8'],2,'Start at 10, count back 3: 9,8,7.')",
    "q('Use the count-back strategy. What is 10 \u2212 3?',['5','6','8','7'],3,'Start at 10, count back 3: 9,8,7.')"
)
fix(
    "q('Use the count-back strategy. What is 13 \u2212 4?',['7','8','9','10'],2,'Start at 13, count back 4: 12,11,10,9.')",
    "q('Use the count-back strategy. What is 13 \u2212 4?',['7','8','10','9'],3,'Start at 13, count back 4: 12,11,10,9.')"
)
fix(
    "q('Use the count-back strategy. What is 17 \u2212 6?',['9','10','11','12'],2,'Start at 17, count back 6: 16,15,14,13,12,11.')",
    "q('Use the count-back strategy. What is 17 \u2212 6?',['9','10','12','11'],3,'Start at 17, count back 6: 16,15,14,13,12,11.')"
)
fix(
    "q('Use the count-on strategy. What is 6 + 6?',['10','11','12','13'],2,'Start at 6, count on 6: 7,8,9,10,11,12.')",
    "q('Use the count-on strategy. What is 6 + 6?',['10','11','13','12'],3,'Start at 6, count on 6: 7,8,9,10,11,12.')"
)
fix(
    "q('Use the count-on strategy. What is 13 + 3?',['14','15','16','17'],2,'Start at 13, count on 3: 14,15,16.')",
    "q('Use the count-on strategy. What is 13 + 3?',['14','15','17','16'],3,'Start at 13, count on 3: 14,15,16.')"
)
fix(
    "q('Use the count-back strategy. What is 16 \u2212 4?',['10','11','12','13'],2,'Start at 16, count back 4: 15,14,13,12.')",
    "q('Use the count-back strategy. What is 16 \u2212 4?',['10','11','13','12'],3,'Start at 16, count back 4: 15,14,13,12.')"
)

# =========================================================
# FIX 6: L3 qBank — Redistribute answer positions
# All at index 2; move 8 to index 0, 6 to index 3
# =========================================================
print('\n=== FIX 6: L3 qBank redistribution ===')

# → index 0
fix(
    "q('Use the make-ten strategy. What is 8 + 5?',['11','12','13','14'],2,'8+2=10, then +3=13.')",
    "q('Use the make-ten strategy. What is 8 + 5?',['13','11','12','14'],0,'8+2=10, then +3=13.')"
)
fix(
    "q('Use the make-ten strategy. What is 7 + 4?',['9','10','11','12'],2,'7+3=10, then +1=11.')",
    "q('Use the make-ten strategy. What is 7 + 4?',['11','9','10','12'],0,'7+3=10, then +1=11.')"
)
fix(
    "q('Use the make-ten strategy. What is 7 + 6?',['11','12','13','14'],2,'7+3=10, then +3=13.')",
    "q('Use the make-ten strategy. What is 7 + 6?',['13','11','12','14'],0,'7+3=10, then +3=13.')"
)
fix(
    "q('Use the make-ten strategy. What is 6 + 5?',['9','10','11','12'],2,'6+4=10, then +1=11.')",
    "q('Use the make-ten strategy. What is 6 + 5?',['11','9','10','12'],0,'6+4=10, then +1=11.')"
)
fix(
    "q('Use the make-ten strategy. What is 9 + 8?',['15','16','17','18'],2,'9+1=10, then +7=17.')",
    "q('Use the make-ten strategy. What is 9 + 8?',['17','15','16','18'],0,'9+1=10, then +7=17.')"
)
fix(
    "q('Use the make-ten strategy. What is 8 + 4?',['10','11','12','13'],2,'8+2=10, then +2=12.')",
    "q('Use the make-ten strategy. What is 8 + 4?',['12','10','11','13'],0,'8+2=10, then +2=12.')"
)
fix(
    "q('Use the make-ten strategy. What is 9 + 5?',['12','13','14','15'],2,'9+1=10, then +4=14.')",
    "q('Use the make-ten strategy. What is 9 + 5?',['14','12','13','15'],0,'9+1=10, then +4=14.')"
)
fix(
    "q('Use the make-ten strategy. What is 5 + 8?',['11','12','13','14'],2,'5+5=10, then +3=13. Or 8+2=10, +3=13.')",
    "q('Use the make-ten strategy. What is 5 + 8?',['13','11','12','14'],0,'5+5=10, then +3=13. Or 8+2=10, +3=13.')"
)

# → index 3
fix(
    "q('Use the make-ten strategy. What is 6 + 8?',['12','13','14','15'],2,'6+4=10, then +4=14.')",
    "q('Use the make-ten strategy. What is 6 + 8?',['12','13','15','14'],3,'6+4=10, then +4=14.')"
)
fix(
    "q('Use the make-ten strategy. What is 6 + 6?',['10','11','12','13'],2,'6+4=10, then +2=12.')",
    "q('Use the make-ten strategy. What is 6 + 6?',['10','11','13','12'],3,'6+4=10, then +2=12.')"
)
fix(
    "q('Use the make-ten strategy. What is 7 + 8?',['13','14','15','16'],2,'7+3=10, then +5=15.')",
    "q('Use the make-ten strategy. What is 7 + 8?',['13','14','16','15'],3,'7+3=10, then +5=15.')"
)
fix(
    "q('Use the make-ten strategy. What is 8 + 7?',['13','14','15','16'],2,'8+2=10, then +5=15.')",
    "q('Use the make-ten strategy. What is 8 + 7?',['13','14','16','15'],3,'8+2=10, then +5=15.')"
)
fix(
    "q('Use the make-ten strategy. What is 9 + 6?',['13','14','15','16'],2,'9+1=10, then +5=15.')",
    "q('Use the make-ten strategy. What is 9 + 6?',['13','14','16','15'],3,'9+1=10, then +5=15.')"
)
fix(
    "q('Use the make-ten strategy. What is 5 + 7?',['10','11','12','13'],2,'5+5=10, then +2=12.')",
    "q('Use the make-ten strategy. What is 5 + 7?',['10','11','13','12'],3,'5+5=10, then +2=12.')"
)

# =========================================================
# Done — write file
# =========================================================
print(f'\nTotal replacements: {count}')

if content == orig:
    print('ERROR: No changes made!')
    sys.exit(1)

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print('File written OK.')
