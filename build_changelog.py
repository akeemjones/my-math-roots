#!/usr/bin/env python3
"""Build My Math Roots changelog PDF."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

OUTPUT = 'E:/Cameron Jones/my-math-roots/MY-MATH-ROOTS-CHANGELOG.pdf'
TODAY = 'March 21, 2026'  # Last updated: v5.10

# Color palette
PURPLE       = colors.HexColor('#6c3fc4')
PURPLE_LIGHT = colors.HexColor('#ede7f6')
ORANGE       = colors.HexColor('#e67e22')
GREEN        = colors.HexColor('#27ae60')
RED          = colors.HexColor('#e74c3c')
BLUE         = colors.HexColor('#2980b9')
GRAY_DARK    = colors.HexColor('#2c3e50')
GRAY_MID     = colors.HexColor('#7f8c8d')
GRAY_LIGHT   = colors.HexColor('#ecf0f1')
WHITE        = colors.white

# Styles
def S(name, **kw):
    return ParagraphStyle(name, **kw)

STYLE = {
    'title':    S('CTitle',    fontSize=28, fontName='Helvetica-Bold',   textColor=PURPLE,    alignment=TA_CENTER, spaceAfter=4),
    'subtitle': S('CSub',      fontSize=13, fontName='Helvetica',        textColor=GRAY_MID,  alignment=TA_CENTER, spaceAfter=6),
    'date':     S('CDate',     fontSize=11, fontName='Helvetica-Oblique',textColor=GRAY_MID,  alignment=TA_CENTER, spaceAfter=20),
    'toc_head': S('CTocHead',  fontSize=14, fontName='Helvetica-Bold',   textColor=PURPLE,    spaceBefore=14, spaceAfter=6),
    'toc_item': S('CTocItem',  fontSize=10, fontName='Helvetica',        textColor=GRAY_DARK, leftIndent=12, spaceAfter=3),
    'ver_ban':  S('CVer',      fontSize=16, fontName='Helvetica-Bold',   textColor=WHITE,     spaceBefore=0, spaceAfter=0),
    'ver_date': S('VDate',     fontSize=10, fontName='Helvetica',        textColor=WHITE,     alignment=TA_RIGHT),
    'ver_cat':  S('VCat',      fontSize=10, fontName='Helvetica-Bold',   textColor=WHITE,     spaceAfter=0),
    'section':  S('CSect',     fontSize=12, fontName='Helvetica-Bold',   textColor=PURPLE,    spaceBefore=12, spaceAfter=4),
    'ihead':    S('CIHead',    fontSize=10.5,fontName='Helvetica-Bold',  textColor=GRAY_DARK, spaceBefore=8, spaceAfter=2),
    'body':     S('CBody',     fontSize=9.5, fontName='Helvetica',       textColor=GRAY_DARK, spaceAfter=3,  leading=14),
    'bullet':   S('CBullet',   fontSize=9.5, fontName='Helvetica',       textColor=GRAY_DARK, leftIndent=16, bulletIndent=4, spaceAfter=2, leading=14),
    'sbullet':  S('CSubBullet',fontSize=9,   fontName='Helvetica',       textColor=GRAY_MID,  leftIndent=32, bulletIndent=20, spaceAfter=2, leading=13),
    'stat_head':S('CStatHead', fontSize=13, fontName='Helvetica-Bold',   textColor=PURPLE,    spaceBefore=16, spaceAfter=8),
    'note':     S('CNote',     fontSize=8.5, fontName='Helvetica-Oblique',textColor=GRAY_MID, spaceAfter=2),
}

def hr(color=GRAY_LIGHT, thickness=1):
    return HRFlowable(width='100%', thickness=thickness, color=color, spaceAfter=6, spaceBefore=2)

def sp(h=8):
    return Spacer(1, h)

def p(text, style='body'):
    return Paragraph(text, STYLE[style])

def b(text, sub=False):
    key = 'sbullet' if sub else 'bullet'
    return Paragraph(f'&#8226; {text}', STYLE[key])

def version_block(ver, date, category, color=PURPLE):
    data = [[
        Paragraph(ver, STYLE['ver_ban']),
        Paragraph(date, STYLE['ver_date']),
    ], [
        Paragraph(f'Category: {category}', STYLE['ver_cat']),
        Paragraph('', STYLE['ver_cat']),
    ]]
    t = Table(data, colWidths=[4.5*inch, 2.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), color),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ('RIGHTPADDING',  (0,0), (-1,-1), 14),
        ('TOPPADDING',    (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    return t

doc = SimpleDocTemplate(
    OUTPUT, pagesize=letter,
    leftMargin=0.75*inch, rightMargin=0.75*inch,
    topMargin=0.75*inch, bottomMargin=0.75*inch,
    title='My Math Roots - Version Changelog',
    author='Akeem Jones',
)

story = []

# COVER
story += [
    sp(30),
    p('My Math Roots', 'title'),
    p('Version Changelog', 'title'),
    sp(4),
    p('K-5 Math Review App &bull; Created by Akeem Jones', 'subtitle'),
    p(TODAY, 'date'),
    hr(PURPLE, 2),
    sp(16),
]

# TABLE OF CONTENTS
story += [
    p('Table of Contents', 'toc_head'),
    hr(),
    p('v5.10 &mdash; March 21, 2026 (Current) &bull; iOS Swipe-Back &amp; Unit Screen Fix', 'toc_item'),
    p('v5.9 &mdash; UI Polish &amp; Swipe Navigation', 'toc_item'),
    p('v5.8 &mdash; In-App Update Banner &amp; Chart Fixes', 'toc_item'),
    p('v5.7 &mdash; iPhone Dynamic Island Fix', 'toc_item'),
    p('v5.6 &mdash; Quiz Enhancements &amp; Score History Redesign', 'toc_item'),
    p('v5.5 &mdash; Interactive Features &amp; Quality Audit', 'toc_item'),
    p('v5.4 &mdash; Final Test &amp; UI Fixes', 'toc_item'),
    p('v5.3 &mdash; Dark Mode Polish', 'toc_item'),
    p('v5.2 &mdash; Scroll Box Fix', 'toc_item'),
    p('v5.1 &mdash; Individual Lesson &amp; Unit Unlock', 'toc_item'),
    p('v5.0 &mdash; Major UI Overhaul', 'toc_item'),
    p('v4.9 &mdash; Home Button Fix', 'toc_item'),
    p('v4.8 &mdash; Compact Scrollable Unit Cards', 'toc_item'),
    p('v4.7 &mdash; Sound Toggle', 'toc_item'),
    p('v4.6 &mdash; PIN Screen Bug Fix', 'toc_item'),
    p('v4.5 &mdash; Resume Banner', 'toc_item'),
    p('v4.4 &mdash; Start Quiz Button Redesign', 'toc_item'),
    p('v4.3 &mdash; Locked Unit/Lesson Sound', 'toc_item'),
    p('v4.2 &mdash; Navigation Sounds', 'toc_item'),
    p('v4.1 &mdash; Quiz Sound Effects', 'toc_item'),
    p('v4.0 &mdash; Quiz Pause &amp; Resume', 'toc_item'),
    p('v3.6-v3.9 &mdash; PIN, Timer &amp; Changelog', 'toc_item'),
    p('v3.1-v3.5 &mdash; Timer, Score History, Column Math', 'toc_item'),
    p('v3.0 &mdash; Major Bug Fix &amp; Polish', 'toc_item'),
    p('v1.0-v2.0 &mdash; Initial Release', 'toc_item'),
    sp(4),
    p('Statistics Summary', 'toc_item'),
    PageBreak(),
]

# ── v5.10 ─────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.10', 'March 21, 2026  (Current)', 'iOS UX & Layout', GREEN),
    sp(12),
    p('Navigation', 'section'),
    hr(),
    p('1.  iOS-Style Swipe-Back Gesture', 'ihead'),
    b('Full-screen interactive drag: the current screen slides right with your finger in real time'),
    b('Previous screen is visible behind with a parallax effect (-28% to 0%) -- just like native iPhone apps'),
    b('Velocity-based commit: release past 80px drag OR flick fast enough (0.4 px/ms) to go back'),
    b('Smooth animated snap-back (280ms cubic-bezier) if gesture is released early'),
    b('Works on: Unit (back to Home), Lesson, Results, History, and Settings screens'),
    b('Quiz screen intentionally excluded to prevent accidental exits'),
    b('Replaces the v5.9 frosted-glass indicator with a true full-screen parallax transition'),
    sp(6),
    p('Layout', 'section'),
    hr(),
    p('2.  Unit Screen No-Scroll Fix', 'ihead'),
    b('Unit screen now uses CSS flexbox so it never outer-scrolls on any iPhone screen size'),
    b('Banner, lesson cards, section labels, and quiz button all fit within the viewport'),
    b('Lesson glass-wrap grows to fill available space (flex:1) and would scroll internally only if more lessons were added'),
    b('Bottom padding uses env(safe-area-inset-bottom) so content clears the iPhone home indicator'),
    b('Fixed a CSS specificity bug where #unit-screen was visible even without the .on class'),
    PageBreak(),
]

# ── v5.9 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.9', 'March 21, 2026', 'UI Polish & Navigation', GREEN),
    sp(12),
    p('Navigation', 'section'),
    hr(),
    p('1.  Swipe-Back Gesture', 'ihead'),
    b('Swipe right from the left edge of the screen on any sub-screen to navigate back'),
    b('Works on: Unit (back to Home), Lesson (back to Unit), Results, History, Settings'),
    b('A frosted glass handle tracks the finger and snaps back if released early'),
    b('Requires 90px rightward drag within 500ms from the left 32px edge zone to trigger'),
    b('Quiz screen intentionally excluded -- use the Quit confirmation to prevent accidental exits'),
    sp(10),
    p('UI & Layout', 'section'),
    hr(),
    p('2.  Contrast &amp; Color Refresh', 'ihead'),
    b('Light mode: home gradient changed from pale blue to rich saturated blue/green'),
    b('Light mode: background math bubbles opacity increased from 13% to 24% (more visible)'),
    b('Dark mode: card backgrounds lightened (#1a2535 to #1c2e48) for clear contrast vs page'),
    b('Dark mode: page background deepened (#0f1923 to #08121e) for stronger card separation'),
    b('Both modes: borders and shadows strengthened; secondary text colors more vivid'),
    sp(6),
    p('3.  Compact Unit Quiz Button', 'ihead'),
    b('Unit Quiz button redesigned as a slim horizontal card (icon left, title/desc right)'),
    b('Replaces the large centered column layout that pushed content off screen'),
    b('Padding reduced from 32px to 16px; icon from 3.5rem to 2rem'),
    b('Unit screen now fits all content on one screen with zero scrolling'),
    sp(6),
    p('4.  Smaller Unit Banner', 'ihead'),
    b('Colored unit header padding reduced from 22px to 14px'),
    b('Title font size reduced from 1.6rem to 1.4rem'),
    b('Section top padding reduced from 22px to 14px'),
    b('All unit screen content now fits within a single viewport height'),
    PageBreak(),
]

# ── v5.8 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.8', '', 'Feature Update & Bug Fixes', BLUE),
    sp(12),
    p('1.  In-App Update Banner', 'ihead'),
    b('When a new version is deployed, a "Update ready!" banner slides up from the bottom of the screen'),
    b('User taps "Update Now" to reload the app instantly with the latest code'),
    b('Eliminates the need to remove the app from the iPhone home screen to receive updates'),
    b('Service worker no longer auto-skips waiting -- update only applies when user confirms'),
    b('App also checks for updates when user returns to the app (visibility change event)'),
    b('All progress, scores, and unlocks are preserved -- only app code lives in the SW cache'),
    sp(6),
    p('2.  SVG Tally Chart Scaling Fix', 'ihead'),
    b('All SVG charts inside lesson worked examples now have max-width:100% applied'),
    b('Previously the two-column tally reference chart (numbers 1-10) was cut off on the right'),
    b('Affects Data Analysis unit and all other lessons containing SVG-based charts'),
    b('Fix is a single CSS rule -- no data strings modified'),
    sp(6),
    p('3.  iPhone Dynamic Island Fix (Refined)', 'ihead'),
    b('All navigation bars confirmed to use env(safe-area-inset-top) with calc(12px + ...) padding'),
    b('Settings cog button also uses env(safe-area-inset-top) for correct positioning'),
    b('Home screen .home-in uses padding-top: env(safe-area-inset-top) for content clearance'),
    sp(20),
]

# ── v5.7 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.7', '', 'Bug Fix', RED),
    sp(12),
    p('1.  iPhone 16 Pro Max Dynamic Island Fix', 'ihead'),
    b('Top navigation bars on all sub-screens now use padding-top: calc(12px + env(safe-area-inset-top))'),
    b('Ensures Home/Back buttons are always fully visible and tappable below the Dynamic Island'),
    b('Requires viewport-fit=cover meta tag (already set) for env() values to resolve on-device'),
    b('In browser preview env() returns 0; on real device returns ~59px for iPhone 16 Pro Max'),
    sp(20),
]

# ── v5.6 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.6', '', 'Quiz Enhancements & Score History Redesign', PURPLE),
    sp(12),
    p('Quiz Enhancements', 'section'),
    hr(),
    p('1.  Quit Button', 'ihead'),
    b('Red "Quit" button on all quiz and test screens, opposite the Start Over button'),
    b('Tapping shows a confirmation modal before ending the quiz'),
    b('On confirm: quiz ends immediately, navigates back to previous screen without pausing'),
    b('Recorded as "Quit" (red accent, DNF) in score history'),
    b('A new quiz can be started right away after quitting'),
    sp(6),
    p('2.  Start Over Confirmation Modal', 'ihead'),
    b('Restarting a quiz now shows a confirmation modal before wiping progress'),
    b('If confirmed, the incomplete attempt is saved as "Abandoned" (orange, DNF) in score history'),
    b('Prevents accidental quiz resets'),
    sp(6),
    p('3.  Previous Question Button', 'ihead'),
    b('A back arrow appears below the question card after the first question is answered'),
    b('Lets students review earlier answers in read-only mode before continuing forward'),
    b('Uses a viewIdx pointer (separate from idx) so past answers are shown without re-randomizing options'),
    sp(6),
    p('4.  Glass Quiz Cards', 'ihead'),
    b('Question header and answer card now use frosted glass (backdrop-filter blur + translucent background)'),
    b('Matches the glassmorphism theme used on the home page and lesson cards'),
    sp(6),
    p('5.  Larger Answer Button Spacing', 'ihead'),
    b('Answer choice buttons have more padding (26px vertical) and a larger minimum height (82px)'),
    b('Makes answer choices easier to tap on small phone screens'),
    sp(10),
    p('Score History Redesign', 'section'),
    hr(),
    p('6.  Frosted Glass Scroll Box', 'ihead'),
    b('All score history result cards are contained in a frosted glass scroll box'),
    b('Matches the style of the unit cards scroll box on the home page'),
    b('Max height set to 50dvh so it never dominates the screen'),
    sp(6),
    p('7.  Layout &amp; Alignment Fixes', 'ihead'),
    b('All dates and times left-aligned on every score card'),
    b('DNF cards (Abandoned/Quit) now vertically align with normal score cards -- star row uses min-height'),
    b('"Score History" title centered in the header bar'),
    b('Added top padding between header and first card'),
    sp(6),
    p('8.  Score Card Lightbox', 'ihead'),
    b('Tapping any score card opens a full-detail lightbox overlay'),
    b('Shows question-by-question review with correct/incorrect indicators'),
    b('Tap anywhere outside the card to close'),
    sp(6),
    p('9.  Home Button Fix', 'ihead'),
    b('Home button on Score History screen works correctly after a layout refactor had broken it'),
    b('Root cause: display:flex on #history-screen was overriding the .sc display:none rule'),
    b('Fixed with #history-screen.on { display:flex !important } pattern'),
    PageBreak(),
]

# ── v5.5 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.5', 'March 21, 2026', 'Interactive Features'),
    sp(12),
    p('New Interactive Lesson Content', 'section'),
    hr(),
    p('1.  Step-by-Step Carry &amp; Borrow Animations - Unit 3 (Add &amp; Subtract to 200)', 'ihead'),
    b('"Watch Step by Step" button added to column math examples'),
    b('2-digit addition with carrying (e.g. 47 + 36): highlights ones column, animates carry digit pop, then tens column'),
    b('2-digit subtraction with borrowing (e.g. 73 - 28): shows borrow from tens, crossed-out digit, regrouped value with color highlights'),
    b('3-digit addition with carrying (347+286, 456+378, 523+349, 615+247): full three-column carry sequence with bounce &amp; pop animations'),
    b('CSS animations: ccaPop (scale bounce), ccaBounce (pulse), cca-hi (yellow highlight), cca-hi-red (red highlight)'),
    sp(6),
    p('2.  Interactive Clock - Unit 7 Lesson 2 (What Time Is It?)', 'ihead'),
    b('Students drag two sliders: hours (1-12) and minutes (0-59)'),
    b('SVG clock hands rotate in real time as sliders move'),
    b('Hour hand and minute hand angles calculated dynamically'),
    b('Displays the time text below the clock face'),
    b('Reinforces reading analog clocks hands-on before the quiz'),
    sp(6),
    p('3.  Interactive Thermometer - Unit 7 Lesson 3 (Hot, Cold and Full)', 'ihead'),
    b('Students drag a slider to set temperature (0-220 deg F)'),
    b('SVG mercury column animates up and down in real time'),
    b('Color changes dynamically: blue = freezing (32 deg F or below), green = comfortable (33-89 deg F), red = hot (90 deg F or above)'),
    b('Text label updates live: "Freezing!", "Cold", "Comfortable", "Warm", "Hot!", "Very Hot!"'),
    b('Reference lines mark key temperatures: 32 deg F freezing, 70 deg F comfortable, 98 deg F body temp, 212 deg F boiling'),
    sp(6),
    p('4.  Emoji Visual Examples - All Lessons', 'ihead'),
    p('Eight visual example types now render animated emoji-based graphics in worked examples:', 'body'),
    b('Addition: emoji objects shown as two groups with + operator and animated sum'),
    b('Subtraction: full starting group with crossed-out items to visualize "taking away"'),
    b('Doubles: two equal emoji groups side-by-side with equation below'),
    b('Ten-frame: 5x2 grid filling circles to show a number, with prompt "Need X more to reach 10!"'),
    b('Add 3 Numbers: three emoji groups with running totals shown step by step'),
    b('Equal Groups: emoji arranged in labeled groups (multiplication intuition)'),
    b('Arrays: emoji laid out in rows x columns grid'),
    b('Sharing Equally: total emoji distributed across illustrated characters to demonstrate division'),
    sp(6),
    p('5.  Static SVG Clock Examples - Unit 7 Lesson 2', 'ihead'),
    b('Every worked example renders a correctly drawn analog clock face'),
    b('Includes: outer circle, tick marks, hour numbers, hour hand, minute hand at exact calculated angles'),
    b('Clock face matches the exact time being taught in each example'),
    sp(10),
    p('Quality &amp; Accuracy', 'section'),
    hr(),
    p('6.  Full Answer-Accuracy Audit - All 2,438 Questions', 'ihead'),
    b('Every question scanned for: correct answer accuracy, duplicate answer options, explanation consistency'),
    b('Zero duplicate answer options found anywhere in the app'),
    b('Math auto-verified for: arithmetic, skip counting, place value, estimation, fractions, multiplication/division'),
    sp(6),
    p('7.  Bug Fix: 4 Wrong Correct-Answer Indices Fixed', 'ihead'),
    b('"Best estimate for 724 - 283?": answer index pointed to 500 -- correct answer is 400 (700-300=400). Fixed in both Unit 4 qBank and testBank.'),
    b('"Best estimate for 876 - 324?": answer index pointed to 500 -- correct answer is 600 (900-300=600). Fixed in both Unit 4 qBank and testBank.'),
    b('Both questions already had correct explanations -- only the selected answer index was wrong.'),
    sp(6),
    p('8.  Answer Position Rebalancing - Units 5, 6 &amp; 7', 'ihead'),
    p('Correct answers were clustered at certain positions, allowing students to pattern-match instead of solving.', 'body'),
    sp(4),
    p('<b>Unit 5 (Money &amp; Financial Literacy) - 84 question rewrites:</b>', 'body'),
    b('U5L1 qBank: (4,7,14,5) to (7,8,7,8)'),
    b('U5L1 quiz: (0,0,6,1) to (3,1,1,2)'),
    b('U5L3 qBank: (0,18,12,0) to (8,6,8,8) -- was missing indices 0 and 3 entirely'),
    b('U5L3 quiz: (0,4,2,0) to (3,1,1,1)'),
    b('U5L4 qBank: (8,13,9,0) to (10,8,5,7) -- had zero questions at index 3'),
    b('U5L4 quiz: (1,1,4,0) to (2,1,1,2)'),
    b('U5 testBank: (9,42,48,4) to (32,21,27,25)'),
    sp(6),
    p('<b>Unit 6 (Data Analysis) - 65 line-level fixes (SVG-heavy questions required line-number approach):</b>', 'body'),
    b('U6L1 qBank: (3,9,16,2) to (8,7,7,8)'),
    b('U6L2 qBank: (0,15,12,4) to (8,7,7,9) -- was missing index 0 entirely'),
    b('U6L3 qBank: (0,10,16,4) to (8,8,7,7) -- was missing index 0 entirely'),
    b('U6L4 qBank: (2,14,13,2) to (8,8,8,7)'),
    b('All 4 quizzes: heavy imbalance corrected to (1,2,2,1) each'),
    b('U6 testBank: (1,13,15,1) to (7,7,8,8)'),
    sp(6),
    p('<b>Unit 7 (Measurement &amp; Time) - 60 line-level fixes:</b>', 'body'),
    b('U7L1 qBank: (7,10,12,0) to (7,7,8,7) -- zero at index 3'),
    b('U7L1 quiz: (2,3,1,0) to (2,2,1,1)'),
    b('U7L2 qBank: (5,14,10,1) to (7,8,8,7)'),
    b('U7L2 quiz: (1,2,4,0) to (1,2,2,2)'),
    b('U7L3 qBank: (5,12,10,3) to (7,7,8,8)'),
    b('U7L3 quiz: (2,2,2,0) to (2,2,1,1)'),
    b('U7 testBank: (26,55,44,4) to (32,32,33,32) -- worst case: 55 at pos 1, only 4 at pos 3 out of 129 questions'),
    sp(6),
    p('9.  Answer Position Rebalancing - Units 1-4 (prior session, included in v5.5)', 'ihead'),
    b('Applied to: place value, addition/subtraction, skip counting, rounding'),
    b('All qBanks, quizzes, and testBanks balanced across all four answer positions'),
    sp(6),
    p('10.  Explanation Rewrites - Unit 2', 'ihead'),
    b('"807 ___ 780" comparison: removed contradictory "Wait--" mid-explanation that reversed the correct logic'),
    b('"Value of 0 in 908": replaced circular "0 in tens place = value of 0" with clear "Zero tens = 0"'),
    PageBreak(),
]

# ── v5.4 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.4', '', 'Feature Update', BLUE),
    sp(12),
    b('Final Test added -- after completing all 10 units with 80%+, a 50-question Final Test card appears in the unit scroll and draws questions from every unit'),
    b('Unit Quiz label corrected -- now correctly shows "25 Questions" instead of "30"'),
    b('Final Test card styled to match unit cards -- same rounded corners, white background, purple accent border'),
    b('Bug fix: Final Test button now launches correctly -- previously tapped with no response; now opens quiz immediately'),
    sp(20),
]

# ── v5.3 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.3', '', 'UI & Dark Mode Polish', colors.HexColor('#8e44ad')),
    sp(12),
    b('Orange color brightened -- more vivid across all buttons and accents'),
    b('Gold lock buttons -- consistent bright gold gradient on all lock unlock buttons'),
    b('Locked icons greyed out -- icons for locked units/lessons show grayscale at reduced opacity; name dimmed but readable'),
    b('Dark mode whites fixed -- text is now true white, no longer muted or grey'),
    b('Settings text in dark mode brightened -- clearly readable against dark background'),
    b('Student name placeholder visible in dark mode -- "e.g. Emma" hint now shows clearly'),
    b('Change PIN box fixed in dark mode -- entry field no longer appears dark or dashed'),
    b('"Muted" renamed to "Sound Off" -- toggle now reads Sound Off for clarity'),
    b('Bug fix: PIN no longer jumps to results -- entering PIN in Settings after a quiz now stays on Settings screen'),
    sp(20),
]

# ── v5.2 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.2', '', 'Bug Fix', RED),
    sp(12),
    b('Unit scroll box fixed -- unit cards on home screen are scrollable again on iPhone and iPad'),
    sp(20),
]

# ── v5.1 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.1', '', 'Feature Update', BLUE),
    sp(12),
    b('Individual Lesson Unlock -- tap lock on any locked lesson, enter parent PIN to unlock just that lesson'),
    b('Individual Unit Unlock -- same method on the home screen for locked units'),
    b('Lock button tap area enlarged -- easier to tap on both units and lessons'),
    b('Scroll jitter fixed -- unit cards no longer jitter when scrolling to top on iPhone/iPad'),
    b('Settings glass theme fixed -- settings boxes correctly show frosted glass look'),
    b('Re-Lock All now also clears all individual unit and lesson unlocks'),
    sp(20),
]

# ── v5.0 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v5.0', '', 'Major UI Overhaul', PURPLE),
    sp(12),
    b('Individual Unit Unlock -- tap lock on any locked unit on home page, enter parent PIN'),
    b('Glassmorphism UI -- frosted glass units box and lesson cards, scroll-focus scaling, hover scale effect'),
    b('Home page no longer scrolls -- fits screen exactly; only unit cards box scrolls internally'),
    b('iPhone safe area fix -- title no longer overlaps notch or Dynamic Island in full-screen mode'),
    b('Install instructions updated for iPhone and iPad -- tabbed interface, correct tab auto-selected by device'),
    b('School branding removed -- app is now generic and reusable'),
    b('Forgot your PIN? -- solve a 3rd grade math problem to reset PIN to 1234; 6 rotating problem types, refreshable'),
    b('PIN entry box fixed -- digits no longer cut off; default PIN hint shown to new users, hides after PIN change'),
    b('Sound Mute toggle in Settings -- same style as Light/Dark mode'),
    b('PIN limited to 4 digits, numbers only, numeric keypad on iPad/iPhone'),
    sp(20),
]

# ── v4.9 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v4.9', '', 'Bug Fix', RED),
    sp(12),
    b('Fixed Home button broken by the v4.8 scrollable units box update'),
    sp(20),
]

# ── v4.8 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v4.8', '', 'Feature Update', BLUE),
    sp(12),
    b('All 10 unit cards moved into compact scrollable box on home page -- page no longer stretches too long; Score History button stays always visible'),
    sp(20),
]

# ── v4.7 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v4.7', '', 'Feature Update', BLUE),
    sp(12),
    b('Added Sound On / Muted toggle in Settings'),
    b('Parent PIN limited to 4 digits, numbers only'),
    sp(20),
]

# ── v4.6 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v4.6', '', 'Bug Fix', RED),
    sp(12),
    b('Fixed bug where entering PIN from quiz results screen would exit Settings; screen now auto-scrolls to Parent Controls after unlocking'),
    sp(20),
]

# ── v4.5 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v4.5', '', 'Feature Update', BLUE),
    sp(12),
    b('Start Quiz button hidden when quiz is already in progress -- Resume banner appears in its place'),
    sp(20),
]

# ── v4.4 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v4.4', '', 'Feature Update', BLUE),
    sp(12),
    b('Large Start Quiz button replaces old banner'),
    b('After scoring 100%, Next Lesson button is built into completion card -- no separate box'),
    sp(20),
]

# ── v4.3 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v4.3', '', 'Feature Update', BLUE),
    sp(12),
    b('Tapping a locked unit or lesson plays a negative buzz sound'),
    sp(20),
]

# ── v4.2 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v4.2', '', 'Feature Update', BLUE),
    sp(12),
    b('Upward swoosh sound when moving forward; downward swoosh when pressing Back'),
    b('Soft tap click when opening Settings'),
    sp(20),
]

# ── v4.1 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v4.1', '', 'Feature Update', BLUE),
    sp(12),
    b('Correct answer plays a bright chime'),
    b('Wrong answer plays a low buzz'),
    b('Passing a quiz plays a fanfare + confetti burst sound'),
    sp(20),
]

# ── v4.0 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v4.0', '', 'Feature Update', BLUE),
    sp(12),
    b('Quiz Back button now saves quiz progress'),
    b('Pause &amp; Resume -- backing out saves your place; orange Resume banner appears on return'),
    sp(20),
]

# ── v3.6-3.9 ──────────────────────────────────────────────────────────────────
story += [
    version_block('Versions v3.6 - v3.9', '', 'Feature Updates', colors.HexColor('#16a085')),
    sp(12),
    b('Default PIN is 1234 -- prompts to change on first use'),
    b('PIN hides after unlocking; timer adjustable in 1-minute steps (1-60 min lesson, 1-120 min unit)'),
    b("What's New changelog section added"),
    b('Version number tracked and displayed'),
    sp(20),
]

# ── v3.1-3.5 ──────────────────────────────────────────────────────────────────
story += [
    version_block('Versions v3.1 - v3.5', '', 'Feature Updates', colors.HexColor('#16a085')),
    sp(12),
    b('Quiz Timer -- 8 min lesson / 30 min unit with color warnings'),
    b('Score History cards expand to show right and wrong questions per attempt'),
    b('Column math examples with carry digit alignment'),
    b('New Examples and More Practice buttons added to every lesson'),
    b('Show/Hide Answer toggle in practice section'),
    sp(20),
]

# ── v3.0 ──────────────────────────────────────────────────────────────────────
story += [
    version_block('Version v3.0', '', 'Major Bug Fix & Polish', RED),
    sp(12),
    b('Fixed multiple quiz bugs -- results screen, Try Again, Back buttons all work correctly'),
    b('Re-Lock All fully resets all progress and scores'),
    b('Math wallpaper added to all screens'),
    sp(20),
]

# ── v1.0-2.0 ──────────────────────────────────────────────────────────────────
story += [
    version_block('Versions v1.0 - v2.0', '', 'Initial Release', GREEN),
    sp(12),
    b('10 units, 34 lessons, 2,438 questions covering all 2nd grade TEKS math standards'),
    b('Lesson quizzes (8 questions each), unit quizzes (25 questions each), unit testBanks'),
    b('Score history, parent controls with PIN, iPad/iPhone installation support'),
    b('Progressive Web App (PWA) -- installable, works offline via service worker'),
    PageBreak(),
]

# ── STATISTICS SUMMARY ────────────────────────────────────────────────────────
story += [
    p('Statistics Summary', 'stat_head'),
    hr(PURPLE, 2),
    sp(8),
]

stats = [
    ['Metric', 'Value'],
    ['Total Questions', '2,438'],
    ['Total Units', '10'],
    ['Total Lessons', '34'],
    ['Quiz Types', 'Lesson Quiz (8 questions),  Unit Quiz (25 questions),  Final Test (50 questions)'],
    ['Answer Positions Audited', 'All 4 positions (0-3) across all 2,438 questions'],
    ['Wrong Answer Indices Found & Fixed', '4'],
    ['Duplicate Answer Options Found', '0'],
    ['Explanation Rewrites', '2  (v5.5)'],
    ['Interactive Examples Added', '5 types: carry animation, borrow animation, interactive clock,\ninteractive thermometer, emoji visuals'],
    ['Platform', 'Progressive Web App (PWA) -- iOS, Android, Desktop'],
]

stat_table = Table(stats, colWidths=[2.8*inch, 4.2*inch])
stat_table.setStyle(TableStyle([
    ('BACKGROUND',    (0,0), (-1,0),  PURPLE),
    ('TEXTCOLOR',     (0,0), (-1,0),  WHITE),
    ('FONTNAME',      (0,0), (-1,0),  'Helvetica-Bold'),
    ('FONTSIZE',      (0,0), (-1,0),  11),
    ('TOPPADDING',    (0,0), (-1,0),  10),
    ('BOTTOMPADDING', (0,0), (-1,0),  10),
    ('ROWBACKGROUNDS',(0,1), (-1,-1), [WHITE, GRAY_LIGHT]),
    ('FONTNAME',      (0,1), (0,-1),  'Helvetica-Bold'),
    ('FONTSIZE',      (0,1), (-1,-1), 9.5),
    ('TEXTCOLOR',     (0,1), (-1,-1), GRAY_DARK),
    ('TOPPADDING',    (0,1), (-1,-1), 8),
    ('BOTTOMPADDING', (0,1), (-1,-1), 8),
    ('LEFTPADDING',   (0,0), (-1,-1), 12),
    ('RIGHTPADDING',  (0,0), (-1,-1), 12),
    ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
    ('GRID',          (0,0), (-1,-1), 0.5, colors.HexColor('#dde1e7')),
]))
story.append(stat_table)

story += [
    sp(30),
    hr(PURPLE, 1),
    p(f'My Math Roots -- Version Changelog &nbsp;&bull;&nbsp; Generated {TODAY} &nbsp;&bull;&nbsp; Created by Akeem Jones', 'note'),
]

doc.build(story)
print(f'PDF written to: {OUTPUT}')
