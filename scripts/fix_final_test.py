#!/usr/bin/env python3
"""Fix all Final Test question issues across all unit quizzes."""

import sys

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

orig = content
count = 0

def fix(old, new):
    global content, count
    old_b = old if isinstance(old, bytes) else old.encode('utf-8')
    new_b = new if isinstance(new, bytes) else new.encode('utf-8')
    n = content.count(old_b)
    if n == 0:
        print(f'  NOT FOUND: {old_b[:60]}')
        return
    content = content.replace(old_b, new_b)
    print(f'  OK ({n}x): {old_b[:60]}')
    global count
    count += n

# =========================================================
# FIX 1: U5 Q28 — Remove coin values from options
# =========================================================
print('\n=== FIX 1: U5 Q28 ===')
fix(
    "q('Which is more money: 8 dimes or 3 quarters?',['8 dimes (80\u00a2) is more','3 quarters (75\u00a2) is more','Equal','Cannot tell'],0,",
    "q('Which is more money: 8 dimes or 3 quarters?',['8 dimes','3 quarters','They are equal','Cannot tell'],0,"
)

# =========================================================
# FIX 2: U9 Q7 — Replace broken rectangle symmetry question
# (wrong options ['Yes','No','Sometimes','Never'] + duplicate of Q20)
# =========================================================
print('\n=== FIX 2: U9 Q7 ===')
fix(
    "q('How many lines of symmetry does a rectangle have?<svg width=\"108\" height=\"66\" viewBox=\"0 0 108 66\" style=\"display:inline-block;vertical-align:middle;margin:0 5px\"><rect x=\"7\" y=\"10\" width=\"94\" height=\"46\" fill=\"#fde8d8\" stroke=\"#e67e22\" stroke-width=\"2\"/><line x1=\"54\" y1=\"4\" x2=\"54\" y2=\"62\" stroke=\"#e74c3c\" stroke-width=\"2\" stroke-dasharray=\"5,3\"/><line x1=\"2\" y1=\"33\" x2=\"106\" y2=\"33\" stroke=\"#e74c3c\" stroke-width=\"2\" stroke-dasharray=\"5,3\"/></svg>',['Yes','No','Sometimes','Never'],0,'Yes,2 lines.')",
    "q('How many sides does an octagon have?',['6','7','8','9'],2,'An octagon has 8 sides and 8 corners.')"
)

# =========================================================
# FIX 3: U8 unitQuiz — Rewrite all 30 fragment questions
# =========================================================
print('\n=== FIX 3: U8 fragments ===')

# Q1
fix("q('Pizza: 4 slices, eat 1. Fraction?',",
    "q('A pizza has 4 equal slices and 1 slice is eaten. What fraction was eaten?',")
# Q2
fix("q('Larger: 1/2 or 1/4?',",
    "q('Which fraction is larger: 1/2 or 1/4?',")
# Q3
fix("q('Bottom number called?',",
    "q('What is the bottom number of a fraction called?',")
# Q4
fix("q('4/4=?',",
    "q('What does 4/4 equal?',")
# Q5
fix("q('Ribbon:8 pieces,use 3. Fraction?',",
    "q('A ribbon is cut into 8 equal pieces and 3 are used. What fraction of the ribbon is that?',")
# Q6
fix("q('Smaller: 1/4 or 1/8?',",
    "q('Which fraction is smaller: 1/4 or 1/8?',")
# Q7
fix("q('1/2 means?',",
    "q('What does the fraction 1/2 mean?',")
# Q8
fix("q('4 equal parts, 2 shaded. Fraction?',",
    "q('A shape has 4 equal parts and 2 parts are shaded. What fraction is shaded?',")
# Q9
fix("q('Least to greatest: 1/4,1/8,1/2?',",
    "q('Which list orders 1/4, 1/8, and 1/2 from least to greatest?',")
# Q10
fix("q('Top number called?',",
    "q('What is the top number of a fraction called?',")
# Q11
fix("q('5/8 vs 3/8?',",
    "q('Which symbol correctly compares 5/8 and 3/8?',")
# Q12
fix("q('Square cut in 2 equal parts. Each=?',",
    "q('A square is cut into 2 equal parts. What fraction does each part represent?',")
# Q13
fix("q('Fourths in one whole?',",
    "q('How many fourths are in one whole?',")
# Q14
fix("q('Parts must be?',",
    "q('For a shape to show fractions, all parts must be what?',")
# Q15
fix("q('1/4 vs 1/2?',",
    "q('Which symbol correctly compares 1/4 and 1/2?',")
# Q16
fix("q('Pie:8 slices,eat 2. Fraction?',",
    "q('A pie has 8 equal slices and 2 slices are eaten. What fraction was eaten?',")
# Q17
fix("q('3/4 means?',",
    "q('What does the fraction 3/4 mean?',")
# Q18
fix("q('Eighths in one whole?',",
    "q('How many eighths are in one whole?',")
# Q19
fix("q('Equals 1/2?',",
    "q('Which fraction below is equal to 1/2?',")
# Q20
fix("q('Sandwich cut in half. Each piece=?',",
    "q('A sandwich is cut in half. What fraction does each piece represent?',")
# Q21
fix("q('5/8 vs 7/8?',",
    "q('Which number sentence correctly compares 5/8 and 7/8?',")
# Q22 — DUPLICATE of Q8, replace with new unique question
fix(
    "q('4 parts, 2 shaded. Fraction?',['1/4','1/2','3/4','2/6'],1,'2/4=1/2.')",
    "q('A rectangle has 8 equal parts and 5 are shaded. What fraction is NOT shaded?',['5/8','3/8','5/3','3/5'],1,'8\u22125=3 parts not shaded. 3 out of 8 = 3/8.')"
)
# Q23
fix("q('1/8 vs 1/4?',",
    "q('Which symbol correctly compares 1/8 and 1/4?',")
# Q24
fix("q('4 equal pieces, each=?',",
    "q('A whole is divided into 4 equal pieces. What fraction does each piece represent?',")
# Q25
fix("q('Greatest: 1/2,3/8,1/4?',",
    "q('Which is the greatest fraction: 1/2, 3/8, or 1/4?',")
# Q26
fix("q('Numerator=denominator means?',",
    "q('When the numerator equals the denominator, the fraction equals what?',")
# Q27
fix("q('8 parts, 3 colored. Fraction?',",
    "q('A shape has 8 equal parts and 3 are colored. What fraction is colored?',")
# Q28 — DUPLICATE concept of Q14, replace with new unique question
fix(
    "q('Fractions need___parts.',['Any','Equal','Unequal','3'],1,'Always equal parts.')",
    "q('A circle is cut into 3 parts \u2014 two large and one small. Can this show a valid fraction?',['Yes, 2/3 is correct','No, all parts must be equal size','Yes, 1/3 is small','Yes, any parts work'],1,'Fractions require all parts to be equal in size.')"
)
# Q29
fix("q('Larger: 3/4 or 3/8?',",
    "q('Which fraction is larger: 3/4 or 3/8?',")
# Q30
fix("q('Compare:7/8 vs 5/8?',",
    "q('Which number sentence correctly compares 7/8 and 5/8?',")

# =========================================================
# FIX 4: U4 unitQuiz — Redistribute answer positions
# ALL 30 were at index 1 (option B) — now spread across 0,1,2,3
# =========================================================
print('\n=== FIX 4: U4 answer redistribution ===')

# Q1: 347+286=633. Move correct (633) from index 1 to index 2
fix("q('What is 347 + 286?',['572','633','681','714'],1,",
    "q('What is 347 + 286?',['572','681','633','714'],2,")

# Q2: 456+378=834. Move correct (834) from index 1 to index 0
fix("q('What is 456 + 378?',['762','834','871','913'],1,",
    "q('What is 456 + 378?',['834','762','871','913'],0,")

# Q3: 742-385=357. Move correct (357) from index 1 to index 3
fix("q('What is 742 \u2212 385?',['284','357','413','526'],1,",
    "q('What is 742 \u2212 385?',['284','413','526','357'],3,")

# Q4: 600-245=355. KEEP at index 1 (no change)

# Q5: 523+349=872. Move correct (872) from index 1 to index 0
fix("q('What is 523 + 349?',['801','872','913','754'],1,",
    "q('What is 523 + 349?',['872','801','913','754'],0,")

# Q6: 800-367=433. Move correct (433) from index 1 to index 3
fix("q('What is 800 \u2212 367?',['364','433','512','276'],1,",
    "q('What is 800 \u2212 367?',['364','512','276','433'],3,")

# Q7: 274 rounded to 100 = 300. Move correct (300) from index 1 to index 2
fix("q('What is 274 rounded to the nearest 100?',['200','300','270','280'],1,",
    "q('What is 274 rounded to the nearest 100?',['200','270','300','280'],2,")

# Q8: estimate 489+312=800. KEEP at index 1

# Q9: 267+435=702. Move correct (702) from index 1 to index 0
fix("q('What is 267 + 435?',['651','702','743','815'],1,",
    "q('What is 267 + 435?',['702','651','743','815'],0,")

# Q10: 900-536=364. Move correct (364) from index 1 to index 3
fix("q('What is 900 \u2212 536?',['291','364','423','512'],1,",
    "q('What is 900 \u2212 536?',['291','423','512','364'],3,")

# Q11: estimate 197+312=500. Move correct (500) from index 1 to index 2
fix("q('What is the best estimate for 197 + 312? (Round to the nearest hundred first.)',['400','500','600','700'],1,",
    "q('What is the best estimate for 197 + 312? (Round to the nearest hundred first.)',['400','600','500','700'],2,")

# Q12: 451+279=730. Move correct (730) from index 1 to index 0
fix("q('What is 451 + 279?',['653','730','781','912'],1,",
    "q('What is 451 + 279?',['730','653','781','912'],0,")

# Q13: 705-348=357. Move correct (357) from index 1 to index 3
fix("q('What is 705 \u2212 348?',['284','357','423','516'],1,",
    "q('What is 705 \u2212 348?',['284','423','516','357'],3,")

# Q14: 346 rounded to 10 = 350. KEEP at index 1

# Q15: 563+187=750. Move correct (750) from index 1 to index 2
fix("q('What is 563 + 187?',['673','750','821','914'],1,",
    "q('What is 563 + 187?',['673','821','750','914'],2,")

# Q16: 432-256=176. Move correct (176) from index 1 to index 0
fix("q('What is 432 \u2212 256?',['104','176','234','315'],1,",
    "q('What is 432 \u2212 256?',['176','104','234','315'],0,")

# Q17: 765 rounded to 100 = 800. Move correct (800) from index 1 to index 3
fix("q('What is 765 rounded to the nearest 100?',['700','800','760','770'],1,",
    "q('What is 765 rounded to the nearest 100?',['700','760','770','800'],3,")

# Q18: 281+649=930. Move correct (930) from index 1 to index 2
fix("q('What is 281 + 649?',['852','930','971','1013'],1,",
    "q('What is 281 + 649?',['852','971','930','1013'],2,")

# Q19: 1000-473=527. Move correct (527) from index 1 to index 0
fix("q('What is 1000 \u2212 473?',['454','527','583','612'],1,",
    "q('What is 1000 \u2212 473?',['527','454','583','612'],0,")

# Q20: 548+276=824. Move correct (824) from index 1 to index 3
fix("q('What is 548 + 276?',['763','824','871','912'],1,",
    "q('What is 548 + 276?',['763','871','912','824'],3,")

# Q21: estimate 312+489=800. KEEP at index 1

# Q22: 900-628=272. Move correct (272) from index 1 to index 0
fix("q('What is 900 \u2212 628?',['194','272','331','415'],1,",
    "q('What is 900 \u2212 628?',['272','194','331','415'],0,")

# Q23: 423+398=821. Move correct (821) from index 1 to index 2
fix("q('What is 423 + 398?',['754','821','873','912'],1,",
    "q('What is 423 + 398?',['754','873','821','912'],2,")

# Q24: 756-389=367. Move correct (367) from index 1 to index 3
fix("q('What is 756 \u2212 389?',['293','367','425','514'],1,",
    "q('What is 756 \u2212 389?',['293','425','514','367'],3,")

# Q25: 450 rounded to 100 = 500. KEEP at index 1

# Q26: 634+187=821. Move correct (821) from index 1 to index 0
fix("q('What is 634 + 187?',['754','821','873','912'],1,",
    "q('What is 634 + 187?',['821','754','873','912'],0,")

# Q27: 502-147=355. Move correct (355) from index 1 to index 2
fix("q('What is 502 \u2212 147?',['283','355','412','521'],1,",
    "q('What is 502 \u2212 147?',['283','412','355','521'],2,")

# Q28: estimate 197+603=800. Move correct (800) from index 1 to index 3
fix("q('What is the best estimate for 197 + 603? (Round to the nearest hundred first.)',['700','800','900','1000'],1,",
    "q('What is the best estimate for 197 + 603? (Round to the nearest hundred first.)',['700','900','1000','800'],3,")

# Q29: 387+246=633. KEEP at index 1

# Q30: 700-358=342. Move correct (342) from index 1 to index 2
fix("q('What is 700 \u2212 358?',['264','342','413','521'],1,",
    "q('What is 700 \u2212 358?',['264','413','342','521'],2,")

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
