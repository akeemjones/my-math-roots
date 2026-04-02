"""Rewrite all abbreviated/fragment questions in u7 testBank and unitQuiz."""

with open('E:/Cameron Jones/my-math-roots/index.html', 'rb') as f:
    content = f.read()

# Each tuple: (old question text, new question text)
# We wrap with b"q('" and b"'," to ensure we only hit question t-fields
REWRITES = [
    # ── MEASUREMENT (testBank 0-29 + unitQuiz) ──────────────────────────────
    ("Pencil ends at 7 on ruler. Length?",
     "A pencil ends at the 7 on a ruler. How many inches long is the pencil?"),

    ("Best unit to measure a room?",
     "What is the best unit to measure the length of a room?"),

    ("Book=8 in, notebook=6 in. Difference?",
     "A book is 8 inches long. A notebook is 6 inches long. How much longer is the book?"),

    ("12 inches = ?",
     "12 inches is equal to how many feet?"),

    ("Longer: 1 inch or 1 centimeter?",
     "Which is longer: 1 inch or 1 centimeter?"),

    ("A crayon is about how long?",
     "About how many inches long is a crayon?"),

    ("Door is about __ feet tall.",
     "About how many feet tall is a door?"),

    ("100 cm = ?",
     "100 centimeters is equal to 1 what?"),

    ("Measure a pencil with?",
     "Which tool would you use to measure a pencil?"),

    ("A classroom is about __ feet long.",
     "About how many feet long is a classroom?"),

    ("Start measuring from?",
     "When using a ruler, where should you start measuring from?"),

    ("Longer: 15 inches or 15 cm?",
     "Which is longer: 15 inches or 15 centimeters?"),

    ("A paper clip is about __ inch(es)?",
     "About how many inches long is a paper clip?"),

    ("Best unit: length of a car?",
     "What is the best unit to measure the length of a car?"),

    ("Ruler shows 12 inches. What else is that?",
     "A ruler shows 12 inches. What is another name for 12 inches?"),

    ("A finger is about __ cm wide?",
     "About how many centimeters wide is a finger?"),

    ("Pen is 6 inches, pencil is 7 inches. Together?",
     "A pen is 6 inches long and a pencil is 7 inches long. How long are they together?"),

    ("Best unit: height of a person?",
     "What is the best unit to measure the height of a person?"),

    ("Straw is 8 inches, cut 3 inches off. How long left?",
     "A straw is 8 inches long. You cut 3 inches off. How long is the straw now?"),

    ("1 meter = __ centimeters",
     "1 meter is equal to how many centimeters?"),

    ("Longer: 1 foot or 1 meter?",
     "Which is longer: 1 foot or 1 meter?"),

    ("Bookshelf is 3 feet tall. In inches?",
     "A bookshelf is 3 feet tall. How many inches tall is that?"),

    ("Measure school hallway with?",
     "What tool would you use to measure a school hallway?"),

    ("Eraser is about __ cm long?",
     "About how many centimeters long is a pencil eraser?"),

    ("Book is 10 cm wide. Ruler in cm. How many cm left if ruler is 30 cm?",
     "A book is 10 centimeters wide. A ruler is 30 centimeters long. How many centimeters of the ruler are not covered by the book?"),

    ("Three books each 2 inches. Total width?",
     "Three books are each 2 inches wide. What is the total width of all three books?"),

    ("Best unit: length of an ant?",
     "What is the best unit to measure the length of an ant?"),

    ("14 inches - 9 inches = ?",
     "What is 14 inches minus 9 inches?"),

    # ── TIME (testBank 30-59 + unitQuiz) ────────────────────────────────────
    ("Short on 4, long on 12. Time?",
     "The short hand is on the 4 and the long hand is on the 12. What time does the clock show?"),

    ("Short hand on 4, long on 12. Time?",
     "The short hand is on the 4 and the long hand is on the 12. What time does the clock show?"),

    ('"Half past 3" means?',
     "What does half past 3 mean?"),

    ("Long hand at 6=how many minutes?",
     "When the long hand points to the 6, how many minutes past the hour is it?"),

    ("Long hand on 6=___minutes.",
     "When the long hand points to the 6, how many minutes past the hour is it?"),

    ("Minutes in 1 hour?",
     "How many minutes are in 1 hour?"),

    ('"Quarter to 6"=?',
     "What time does quarter to 6 equal?"),

    ("Short hand tells?",
     "What does the short hand on a clock tell you?"),

    ("Long hand at 3=how many minutes?",
     "When the long hand points to the 3, how many minutes past the hour is it?"),

    ("Long hand at 3=___minutes.",
     "When the long hand points to the 3, how many minutes past the hour is it?"),

    ('"Quarter past 7"=?',
     "What time does quarter past 7 equal?"),

    ("Long hand at 9=how many minutes?",
     "When the long hand points to the 9, how many minutes past the hour is it?"),

    ("Short on 8, long on 6. Time?",
     "The short hand is on the 8 and the long hand is on the 6. What time does the clock show?"),

    ("Hours in one day?",
     "How many hours are in one day?"),

    ("Long hand at 12=?",
     "When the long hand points to the 12, how many minutes past the hour is it?"),

    ('"Half past 11"=?',
     "What time does half past 11 equal?"),

    ("Short on 2, long on 12. Time?",
     "The short hand is on the 2 and the long hand is on the 12. What time does the clock show?"),

    ("Minutes hand moves faster than hours hand?",
     "Does the minute hand move faster than the hour hand?"),

    ('"Quarter to 9"=?',
     "What time does quarter to 9 equal?"),

    ("Long hand at 2=how many minutes?",
     "When the long hand points to the 2, how many minutes past the hour is it?"),

    ("Short between 5 and 6, long on 12. Time?",
     "The short hand is between the 5 and 6, and the long hand is on the 12. What time does the clock show?"),

    ("Minutes in half an hour?",
     "How many minutes are in half an hour?"),

    ('"Five minutes past 4"=?',
     "What time does five minutes past 4 equal?"),

    ("Short on 12, long on 12. Time?",
     "The short hand and long hand are both on the 12. What time does the clock show?"),

    ('"Twenty minutes past 3"=?',
     "What time does twenty minutes past 3 equal?"),

    ("Long hand at 4=how many minutes?",
     "When the long hand points to the 4, how many minutes past the hour is it?"),

    ("Dinner at 6:30. Long hand position?",
     "It is 6:30 — dinner time! Where does the long hand point on the clock?"),

    ('"Quarter past 12"=?',
     "What time does quarter past 12 equal?"),

    ("Short on 10, long on 6. Time?",
     "The short hand is on the 10 and the long hand is on the 6. What time does the clock show?"),

    ("Long hand at 1=how many minutes?",
     "When the long hand points to the 1, how many minutes past the hour is it?"),

    ('"Half past 7"=?',
     "What time does half past 7 equal?"),

    ("Counting by 5s helps tell time because?",
     "Why does counting by 5s help you tell time on a clock?"),

    ("Short on 3, long on 3. Time?",
     "The short hand and long hand are both on the 3. What time does the clock show?"),

    # ── TEMPERATURE / CAPACITY / WEIGHT (testBank 60-99 + unitQuiz) ─────────
    ("Water freezes at ___\u00b0F.",
     "At what temperature in degrees Fahrenheit does water freeze?"),

    ("Water freezes at___\u00b0F.",
     "At what temperature in degrees Fahrenheit does water freeze?"),

    ("35\u00b0F outside \u2014 wear?",
     "It is 35\u00b0F outside. What should you wear?"),

    ("2 cups = ?",
     "2 cups is equal to how many pints?"),

    ("4 quarts = ?",
     "4 quarts is equal to how many gallons?"),

    ("16 ounces = ?",
     "16 ounces is equal to how many pounds?"),

    ("65\u00b0F\u219278\u00b0F. How much warmer?",
     "The temperature went from 65\u00b0F to 78\u00b0F. How many degrees warmer did it get?"),

    ("65\u00b0F to 78\u00b0F. How much warmer?",
     "The temperature went from 65\u00b0F to 78\u00b0F. How many degrees warmer did it get?"),

    ("Water boils at ___\u00b0F.",
     "At what temperature in degrees Fahrenheit does water boil?"),

    ("90\u00b0F outside \u2014 wear?",
     "It is 90\u00b0F outside. What should you wear?"),

    ("90\u00b0F outside. What to wear?",
     "It is 90\u00b0F outside. What should you wear?"),

    ("2 pints = ?",
     "2 pints is equal to how many quarts?"),

    ("Which is bigger: cup or quart?",
     "Which holds more liquid: a cup or a quart?"),

    ("Normal body temp?",
     "What is the normal human body temperature in degrees Fahrenheit?"),

    ("4 cups = ?",
     "4 cups is equal to how many quarts?"),

    ("Gallon is bigger than quart?",
     "Is a gallon bigger than a quart?"),

    ("Freezing temp on Fahrenheit scale?",
     "What is the freezing temperature on the Fahrenheit scale?"),

    ("Outside is 55\u00b0F. Season likely?",
     "It is 55\u00b0F outside. What season is it most likely?"),

    ("Pints in a quart?",
     "How many pints are in 1 quart?"),

    ("Heavy: measured in?",
     "Very heavy objects are best measured in which unit?"),

    ("Temperature went from 70\u00b0F to 55\u00b0F. Colder by?",
     "The temperature went from 70\u00b0F to 55\u00b0F. How many degrees colder did it get?"),

    ("Ounces in a pound?",
     "How many ounces are in 1 pound?"),

    ("Cup vs pint: which is more liquid?",
     "Which holds more liquid: a cup or a pint?"),

    ("Thermometer goes up when?",
     "When does the temperature on a thermometer go up?"),

    ("Light objects measured in?",
     "Light objects are best measured in which unit?"),

    ("4 gallons = how many quarts?",
     "4 gallons is equal to how many quarts?"),

    ("Snow outside. Temp likely?",
     "It is snowing outside. What is the temperature most likely?"),

    ("Apple weighs about?",
     "About how much does an apple weigh?"),

    ("Pencil weighs about?",
     "About how much does a pencil weigh?"),

    ("Coldest: 45\u00b0F, 32\u00b0F, 60\u00b0F, 15\u00b0F?",
     "Which of these temperatures is the coldest: 45\u00b0F, 32\u00b0F, 60\u00b0F, or 15\u00b0F?"),

    ("Gallons in 8 quarts?",
     "How many gallons are in 8 quarts?"),

    ("8 pints = how many quarts?",
     "8 pints is equal to how many quarts?"),

    ("Temperature scale used in USA?",
     "What temperature scale is used in the United States?"),

    ("Pencil=7 inches on ruler?",
     "A pencil lines up to the 7 on a ruler. How many inches long is it?"),

    ("12 inches=?",
     "12 inches is the same as how many feet?"),

    ("Room measured in?",
     "Which unit would you use to measure the length of a room?"),

    ("100 cm=?",
     "100 centimeters is equal to how many meters?"),

    ("Half past 3=?",
     "What time does half past 3 equal?"),

    ("Long hand at 6=? minutes",
     "When the long hand points to the 6, how many minutes past the hour is it?"),

    ("Water freezes at?",
     "At what temperature in degrees Fahrenheit does water freeze?"),

    ("2 cups=?",
     "2 cups is equal to how many pints?"),

    # ── unitQuiz-only ────────────────────────────────────────────────────────
    ("Best unit for a room?",
     "What is the best unit to measure the length of a room?"),

    ("Door\u2248___feet tall.",
     "About how many feet tall is a door?"),

    ("Crayon\u2248___cm.",
     "About how many centimeters long is a crayon?"),

    ("Pencil\u2248___inches.",
     "About how many inches long is a pencil?"),

    ("Longer: 15cm or 15 inches?",
     "Which is longer: 15 centimeters or 15 inches?"),

    ("Quarter past 9=?",
     "What time does quarter past 9 equal?"),

    ("2:30 on clock, which hand at 6?",
     "When the clock shows 2:30, which hand is pointing to the 6?"),

    ("Book=8in, notebook=6in. Difference?",
     "A book is 8 inches long. A notebook is 6 inches long. How much longer is the book?"),

    ("Math book weighs about___.",
     "About how much does a math book weigh?"),

    ("2 cups=___pint.",
     "2 cups is equal to how many pints?"),

    ("4 quarts=___gallon.",
     "4 quarts is equal to how many gallons?"),

    ("Short between 7&8, long on 6. Time?",
     "The short hand is between the 7 and 8, and the long hand is on the 6. What time does the clock show?"),

    ("Quarter to 5=?",
     "What time does quarter to 5 equal?"),

    ("Best unit for a pool length?",
     "What is the best unit to measure the length of a swimming pool?"),

    ("16 ounces=___pound.",
     "16 ounces is equal to how many pounds?"),

    ("Classroom\u224830___long.",
     "A classroom is about 30 ___ long. Which unit fits best?"),

    ("2 pints=___quart.",
     "2 pints is equal to how many quarts?"),

    ("Pencil=7cm, pen=12cm. Pen longer by?",
     "A pencil is 7 centimeters long. A pen is 12 centimeters long. How much longer is the pen?"),

    ("11:45 on clock, long hand at?",
     "When the clock shows 11:45, where does the long hand point?"),
]

count = 0
for old, new in REWRITES:
    old_b = ("q('" + old + "',").encode('utf-8')
    new_b = ("q('" + new + "',").encode('utf-8')
    if old_b in content:
        times = content.count(old_b)
        content = content.replace(old_b, new_b)
        print(f"  [{times}x] {old[:50]!r}")
        count += 1
    else:
        print(f"  MISS: {old[:60]!r}")

print(f"\nDone. {count} rewrites applied.")

with open('E:/Cameron Jones/my-math-roots/index.html', 'wb') as f:
    f.write(content)
print("Saved.")
