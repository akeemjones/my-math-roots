#!/usr/bin/env python3
"""Generate the My Math Roots internal changelog PDF — v5.22 update."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

OUTPUT = r"E:\Cameron Jones\my-math-roots\Math-Workbook-Changelog_NEW.pdf"

# ── Colour palette ─────────────────────────────────────────────────────────
BLUE        = colors.HexColor("#1a3a5c")
ACCENT      = colors.HexColor("#4a90d9")
DARK_GREY   = colors.HexColor("#333333")
MID_GREY    = colors.HexColor("#555555")
LIGHT_GREY  = colors.HexColor("#888888")
RED_ACCENT  = colors.HexColor("#c0392b")
GREEN_ACCENT= colors.HexColor("#27ae60")

# ── Styles ──────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

TITLE_STYLE = ParagraphStyle("Title", parent=styles["Normal"],
    fontName="Helvetica-Bold", fontSize=20, textColor=BLUE,
    alignment=TA_CENTER, spaceAfter=4)

SUBTITLE_STYLE = ParagraphStyle("Subtitle", parent=styles["Normal"],
    fontName="Helvetica", fontSize=11, textColor=MID_GREY,
    alignment=TA_CENTER, spaceAfter=2)

DATE_STYLE = ParagraphStyle("Date", parent=styles["Normal"],
    fontName="Helvetica-Oblique", fontSize=9, textColor=LIGHT_GREY,
    alignment=TA_CENTER, spaceAfter=16)

VERSION_CURRENT = ParagraphStyle("VersionCurrent", parent=styles["Normal"],
    fontName="Helvetica-Bold", fontSize=13, textColor=ACCENT,
    spaceBefore=14, spaceAfter=4)

VERSION_OLD = ParagraphStyle("VersionOld", parent=styles["Normal"],
    fontName="Helvetica-Bold", fontSize=12, textColor=BLUE,
    spaceBefore=14, spaceAfter=4)

SECTION_LABEL = ParagraphStyle("SectionLabel", parent=styles["Normal"],
    fontName="Helvetica-Bold", fontSize=9.5, textColor=MID_GREY,
    spaceBefore=7, spaceAfter=2, leftIndent=6)

BULLET_STYLE = ParagraphStyle("Bullet", parent=styles["Normal"],
    fontName="Helvetica", fontSize=9, textColor=DARK_GREY,
    leftIndent=20, firstLineIndent=-10, spaceAfter=3, leading=13)

BULLET_BOLD = ParagraphStyle("BulletBold", parent=BULLET_STYLE,
    fontName="Helvetica-Bold")

TECH_STYLE = ParagraphStyle("Tech", parent=BULLET_STYLE,
    fontName="Courier", fontSize=8.2, textColor=MID_GREY, leftIndent=30)

SECURITY_LABEL = ParagraphStyle("SecurityLabel", parent=styles["Normal"],
    fontName="Helvetica-Bold", fontSize=9.5, textColor=RED_ACCENT,
    spaceBefore=7, spaceAfter=2, leftIndent=6)

def bullet(text, bold_prefix=None, tech=False):
    """Return a bullet paragraph. Optionally bold the prefix."""
    prefix = "\u2022  "
    if bold_prefix:
        return Paragraph(f"{prefix}<b>{bold_prefix}</b> — {text}", BULLET_STYLE)
    if tech:
        return Paragraph(f"    {text}", TECH_STYLE)
    return Paragraph(f"{prefix}{text}", BULLET_STYLE)

def sec(label, security=False):
    st = SECURITY_LABEL if security else SECTION_LABEL
    return Paragraph(label, st)

def ver(label, current=False):
    return Paragraph(label, VERSION_CURRENT if current else VERSION_OLD)

def hr():
    return HRFlowable(width="100%", thickness=0.5,
                      color=colors.HexColor("#dddddd"), spaceAfter=4)

# ── Page template (header/footer) ───────────────────────────────────────────
class NumberedCanvas:
    pass  # use SimpleDocTemplate onPage instead

def on_first_page(canvas, doc):
    _draw_footer(canvas, doc)

def on_later_pages(canvas, doc):
    _draw_header(canvas, doc)
    _draw_footer(canvas, doc)

def _draw_header(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(BLUE)
    canvas.drawString(inch * 0.75, letter[1] - inch * 0.55,
                      "My Math Roots — Internal Version Changelog — CONFIDENTIAL")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(LIGHT_GREY)
    canvas.drawRightString(letter[0] - inch * 0.75, letter[1] - inch * 0.55,
                           f"Page {doc.page}")
    canvas.setStrokeColor(colors.HexColor("#dddddd"))
    canvas.setLineWidth(0.5)
    canvas.line(inch * 0.75, letter[1] - inch * 0.65,
                letter[0] - inch * 0.75, letter[1] - inch * 0.65)
    canvas.restoreState()

def _draw_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica-Oblique", 7.5)
    canvas.setFillColor(LIGHT_GREY)
    canvas.drawCentredString(letter[0] / 2, inch * 0.45,
        "Internal use only — My Math Roots by Akeem Jones — mymathroots.netlify.app")
    canvas.restoreState()

# ── Build story ─────────────────────────────────────────────────────────────
story = []

# Cover / title block
story += [
    Spacer(1, 0.3 * inch),
    Paragraph("MY MATH ROOTS", TITLE_STYLE),
    Paragraph("K-5 Math Review App — Internal Version Changelog", SUBTITLE_STYLE),
    Paragraph("Updated: March 24, 2026", DATE_STYLE),
    HRFlowable(width="100%", thickness=2, color=BLUE, spaceAfter=20),
]

# ═══════════════════════════════════════════════════════════════════════════
# v5.22 — CURRENT
# ═══════════════════════════════════════════════════════════════════════════
story.append(ver("v5.22 — March 24, 2026  (CURRENT)", current=True))
story.append(hr())

story.append(sec("SECURITY — Authentication & Session Data Isolation", security=True))
story += [
    bullet("_clearUserData() function", bold_prefix=None),
    Paragraph("    A dedicated <b>_clearUserData()</b> function is now triggered on every "
              "SIGNED_OUT auth-state event from Supabase. It performs a full wipe of all "
              "in-memory and persisted user state:", BULLET_STYLE),
    bullet("SCORES array — mutated in-place (SCORES.length = 0) since it is a const reference", tech=True),
    bullet("DONE object — all keys deleted with Object.keys(DONE).forEach(k => delete DONE[k])", tech=True),
    bullet("CUR object — unitIdx, lessonIdx, quiz reset to defaults", tech=True),
    bullet("_supaUser reference — set to null", tech=True),
    bullet("_carouselInited flag — reset to false so home carousel re-initialises on next login", tech=True),
    bullet("updateAccountUI() — called immediately to refresh UI to guest/logged-out state", tech=True),
]
story += [
    bullet("localStorage keys removed on sign-out:", bold_prefix=None),
    bullet("wb_sc5 (scores), wb_done5 (lesson completion), wb_paused_quiz", tech=True),
    bullet("wb_unit_unlocks, wb_lesson_unlocks", tech=True),
    bullet("wb_parent_pin, wb_parent_unlock, wb_pin_changed", tech=True),
    bullet("PIN failure tracking keys (_PIN_FAIL_KEY, _PIN_FAIL_COUNT_KEY)", tech=True),
]
story += [
    bullet("Session data isolation — a guest or the next signed-in user can no longer "
           "view any progress, scores, unlock states, PIN data, or paused quiz from a "
           "previous account after sign-out."),
    bullet("Cross-session PIN lockout prevention — PIN failure count and lockout "
           "timestamp are cleared on sign-out, preventing a previous user's failed PIN "
           "attempts from locking out the next user."),
    bullet("Sign-out confirmation copy updated — dialog now reads: "
           "'Your progress is saved to your account and will reload on next login.'"),
]

story.append(sec("LAYOUT & SAFE AREA COMPLIANCE"))
story += [
    bullet("Safe area padding", bold_prefix="Screen bottom padding"),
    Paragraph("    All .sc-in scroll containers updated from a legacy flat 60px "
              "padding-bottom to <b>env(safe-area-inset-bottom)</b>. On iPhone 16 Pro Max "
              "this resolves to 34px (home indicator), on desktop/browser it resolves to 0. "
              "Affected screens: lesson-screen, quiz-screen, results-screen, "
              "settings-screen, history-screen, unit-screen.", BULLET_STYLE),
    bullet("Unit screen quiz button visibility", bold_prefix="lesson-glass-wrap max-height"),
    Paragraph("    .lesson-glass-wrap given:<br/>"
              "<font name='Courier' size='8'>max-height: calc(100dvh - 340px - "
              "env(safe-area-inset-top) - env(safe-area-inset-bottom))</font><br/>"
              "This caps the lesson list height so the Unit Quiz button is always fully "
              "visible below it, regardless of device screen size or safe-area values.",
              BULLET_STYLE),
    bullet("Removed legacy 60px flat bottom padding from all .sc-in containers; "
           "bottom padding is now entirely device-aware."),
]

# ═══════════════════════════════════════════════════════════════════════════
# v5.17 — v5.13
# ═══════════════════════════════════════════════════════════════════════════
story.append(ver("v5.13 – v5.17 — March 2026"))
story.append(hr())

story.append(sec("TUTORIAL & ONBOARDING REDESIGN"))
story += [
    bullet("Tutorial reduced from 10 slides to 2", bold_prefix="TUT_SLIDES overhaul"),
    Paragraph("    Slide 1: Welcome to My Math Roots (app overview). "
              "Slide 2: Guided Page Tours (introduces the spotlight system). "
              "The 10 per-feature slides were removed; their content is delivered "
              "contextually via per-screen spotlight tours instead.", BULLET_STYLE),
    bullet("_tutShowing flag added — blocks _spotCheckScreen() from firing "
           "while the tutorial overlay is open (prevents z-index conflicts)."),
    bullet("tutSkip() updated — after tutorial closes, kicks off the home spotlight "
           "tour after a 350ms delay via setTimeout(() => _spotCheckScreen('home'), 350)."),
    bullet("Tut-overlay z-index raised to 6000 (above spot-overlay at z-5000). "
           "Background set to transparent when a spotlight is active so the SVG dim + "
           "cutout shows through the tutorial card."),
]

story.append(sec("SPOTLIGHT TOUR SYSTEM (SPOT_TOURS)"))
story += [
    bullet("SPOT_TOURS object added for 6 screens:", bold_prefix="Per-screen tours"),
    bullet("home — progress bar, unit cards, score history, settings cog", tech=True),
    bullet("unit-screen — lesson cards, unit quiz button", tech=True),
    bullet("lesson-screen — key ideas, worked examples, practice, lesson quiz", tech=True),
    bullet("quiz-screen — question counter, timer, scratch pad, start over, quit quiz", tech=True),
    bullet("settings-screen — parent controls entry", tech=True),
    bullet("history-screen — score entry cards", tech=True),
    bullet("Auto-scroll to off-screen targets", bold_prefix="_spotShowStep()"),
    Paragraph("    If the spotlit element is off-screen, "
              "el.scrollIntoView({behavior:'smooth', block:'center'}) is called, "
              "followed by a 500ms settle timeout before measuring the element rect "
              "and calling _spotRender(). Prevents the spotlight card from rendering "
              "over an element that hasn't scrolled into view yet.", BULLET_STYLE),
    bullet("Card positioning — cardH=210, safeBot=16. Card placed above or below "
           "highlight based on cy < vh * 0.55. Clamped to "
           "Math.max(safeTop, Math.min(cardTop, vh - cardH - safeBot)) so Next/Skip "
           "buttons are never clipped by the viewport bottom."),
    bullet("Quiz timer paused during quiz spotlight tour — prevents time running out "
           "while the student is reading the tour steps."),
]

story.append(sec("FULL-SCREEN SWIPE-BACK NAVIGATION"))
story += [
    bullet("30px left-edge restriction removed", bold_prefix="Swipe-back expanded"),
    Paragraph("    Swipe-back gesture now activates from anywhere on the screen "
              "(full width), matching native iOS app behaviour.", BULLET_STYLE),
    bullet("Horizontal intent detection added — prevents accidental swipe-back "
           "triggers during vertical scrolling:"),
    bullet("DECIDE_PX = 8 — minimum movement before intent is evaluated", tech=True),
    bullet("H_RATIO = 0.8 — dx must exceed dy * 0.8 to be classified as horizontal", tech=True),
    bullet("_startSwipe() deferred until intent confirmed — previous screen is not "
           "revealed (no flash) until the horizontal threshold is met."),
    bullet("passive:false on touchmove — required to call e.preventDefault() once "
           "horizontal intent is confirmed, blocking page scroll during swipe."),
    bullet("Constants: COMMIT_PX=80, COMMIT_V=0.4, ANIM_MS=280."),
]

story.append(sec("SPOTLIGHT VISUAL POLISH (v5.17)"))
story += [
    bullet("Spotlight cutout shape changed from circle to rectangle — matches the "
           "actual bounding box of each spotlit element precisely."),
    bullet("Tutorial tooltip card background set to semi-transparent — "
           "rgba(0,0,0,0.7) with backdrop-filter so the spotlit element is visible "
           "through the card when the tut-overlay and spot-overlay are combined."),
]

story.append(sec("GOOGLE SIGN-IN POLISH (v5.17)"))
story += [
    bullet("'Connecting...' state shown on Google Sign-In button while the auth "
           "request is in flight — prevents double-taps and gives user feedback."),
    bullet("Sign-in errors now surfaced to the user — previously failed silently; "
           "error message displayed in the UI on failure."),
]

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════
# v5.12
# ═══════════════════════════════════════════════════════════════════════════
story.append(ver("v5.12 — March 2026 — Google Sign-In, Auto-Update & Polish"))
story.append(hr())
story += [
    bullet("Google Sign-In", bold_prefix="Google Sign-In"),
    Paragraph("    Students and parents can sign in or create an account with one tap "
              "using their Google account. A 'Continue with Google' button appears on "
              "the login screen, and Google One Tap shows automatically.", BULLET_STYLE),
    bullet("Sign Out button — appears at the bottom of Settings when a user is logged "
           "in. Tapping it signs the user out and returns to the login screen."),
    bullet("Automatic silent updates — app updates itself in the background on new "
           "deployment. 'App updated!' toast shown after update."),
    bullet("Double-tap zoom disabled — prevents accidental zoom on iPhone and iPad."),
    bullet("Smoother screen transitions — background flicker on swipe-back eliminated."),
    bullet("Login screen layout fix — more compact, no longer scrolls on small screens."),
]

story.append(ver("v5.11 — March 2026 — Cloud Accounts & Progress Sync"))
story.append(hr())
story += [
    bullet("Cloud accounts & progress sync — email+password accounts, cross-device "
           "sync via Supabase. Guests continue with local storage only."),
    bullet("Login screen — branded sign-in/create account screen before home. "
           "'Continue without an account' link for guest mode."),
    bullet("Worked example operator fix — +/= signs now centred between emoji groups."),
    bullet("Quiz Next button redesign — small green pill on right, opposite Previous."),
    bullet("Title all-caps — displayed as MY MATH ROOTS."),
]

story.append(ver("v5.10 — 2025 — iOS-Style Swipe-Back (Initial)"))
story.append(hr())
story += [
    bullet("iOS-style swipe-back (left-edge) — screen slides with finger, previous "
           "screen visible behind with parallax. Commit at 80px or velocity threshold."),
    bullet("Unit screen no-scroll fix — flex layout for banner + cards + quiz button."),
]

story.append(ver("v5.9 — 2025 — Contrast & Color Refresh"))
story.append(hr())
story += [
    bullet("Contrast & color refresh — richer light mode, darker card backgrounds in "
           "dark mode, stronger borders/shadows throughout."),
    bullet("Compact Unit Quiz button — slim horizontal card instead of large block."),
    bullet("Smaller unit banner — more compact header, more room for lesson list."),
]

story.append(ver("v5.8 — 2025 — Charts, Dynamic Island & Update Banner"))
story.append(hr())
story += [
    bullet("In-app update banner — 'Update ready!' slides up on new deployment. "
           "Fully automatic as of v5.12."),
    bullet("Tally chart scaling fix — SVG charts scale to any screen width."),
    bullet("iPhone Dynamic Island fix — all nav bars clear Dynamic Island via "
           "env(safe-area-inset-top)."),
]

story.append(ver("v5.6 — 2025 — Quit, Start Over & Previous Question"))
story.append(hr())
story += [
    bullet("Quit button — red Quit button on all quizzes. Confirmation required. "
           "Attempt saved as 'Quit' in score history."),
    bullet("Start Over confirmation — incomplete attempt saved as 'Abandoned (DNF)' "
           "before new attempt begins."),
    bullet("Previous Question button — back arrow lets students review earlier answers "
           "in read-only mode."),
    bullet("Glass quiz cards — frosted-glass style matching rest of app."),
    bullet("Larger answer button spacing — bigger min-height, easier to tap."),
]

story.append(ver("v5.5 — 2025 — Answer Accuracy & Balance Fixes"))
story.append(hr())
story += [
    bullet("Answer correctness fixes — best estimate questions for 724-283 and "
           "876-324 corrected in qBank and testBank."),
    bullet("Answer position balance — Units 1-7 rebalanced. "
           "Unit 5: 84 rewrites. Unit 6: 65 fixes. Unit 7: 60 fixes."),
    bullet("0 duplicate answer options confirmed — verified across all questions."),
    bullet("Explanation rewrites (Unit 2) — circular/contradictory wording removed."),
]

story.append(ver("v5.4 — 2025 — Final Test"))
story.append(hr())
story += [
    bullet("Final Test — 50-question test drawing from all 10 units. Appears after "
           "completing all units with 80%+."),
    bullet("Unit Quiz label corrected — now correctly shows '25 Questions'."),
]

story.append(ver("v5.3 — 2025 — Color & Dark Mode Polish"))
story.append(hr())
story += [
    bullet("Orange accents more vivid. Gold lock buttons. Locked icons greyed out."),
    bullet("Dark mode whites corrected — true white, not muted grey."),
    bullet("Bug fix: PIN entry in Settings no longer navigates to results screen."),
]

story.append(ver("v5.1 — 2025 — Individual Lesson & Unit Unlocks"))
story.append(hr())
story += [
    bullet("Individual Lesson Unlock — tap lock + enter parent PIN to unlock a single lesson."),
    bullet("Individual Unit Unlock — same for units on home screen."),
    bullet("Re-Lock All — now also clears individual unit and lesson unlocks."),
    bullet("Scroll jitter fixed. Settings glass theme fixed."),
]

story.append(ver("v5.0 — 2025 — Glassmorphism UI Overhaul"))
story.append(hr())
story += [
    bullet("Glassmorphism UI — frosted glass cards, scroll-focus scaling, hover scale."),
    bullet("Home page no longer scrolls — only the unit cards box scrolls internally."),
    bullet("iPhone safe area fix — title clears notch and Dynamic Island."),
    bullet("Forgot PIN? — solve a maths problem to reset PIN to 1234."),
    bullet("Sound mute toggle. PIN limited to 4 digits."),
]

story.append(ver("v4.x — 2024 — Resume, Sound & Timer Fixes"))
story.append(hr())
story += [
    bullet("Pause & Resume (v4.0) — quiz progress saved on back. Orange Resume banner."),
    bullet("Sound effects (v4.3) — chime/buzz/fanfare + confetti on pass."),
    bullet("PIN settings fix (v4.6) — no longer navigates away from Settings."),
    bullet("Scrollable units box (v4.8) — all 10 unit cards in compact scrollable box."),
    bullet("Home button fix (v4.9)."),
]

story.append(ver("v3.x — 2024 — Quiz Timer & Score History"))
story.append(hr())
story += [
    bullet("Quiz Timer — 8 min lesson / 30 min unit. Colour warnings at 2 min / 30 sec."),
    bullet("Score History — tap to expand, shows right/wrong per question."),
    bullet("Column math examples with carry digit alignment."),
    bullet("Examples, More Practice, Show/Hide Answer added to every lesson."),
    bullet("Math wallpaper on all screens. Default PIN 1234."),
]

story.append(ver("v1.0 – v2.0 — 2024 — Initial Release"))
story.append(hr())
story += [
    bullet("Initial release — 10 units, 34 lessons, 2,502 questions (K-5 math standards)."),
    bullet("Lesson quizzes (8 questions), unit quizzes (25 questions)."),
    bullet("Sequential unlock system — 80%+ on unit quiz to advance."),
    bullet("Star ratings, score history, parent controls (PIN), dark/light mode."),
    bullet("PWA installable on iPhone & iPad via Safari. Offline support."),
]

story.append(Spacer(1, 0.3 * inch))
story.append(HRFlowable(width="100%", thickness=1, color=BLUE))
story.append(Paragraph(
    "My Math Roots — Internal Changelog — v5.22 — March 24, 2026 — CONFIDENTIAL",
    ParagraphStyle("Footer", parent=styles["Normal"],
        fontName="Helvetica-Oblique", fontSize=8,
        textColor=LIGHT_GREY, alignment=TA_CENTER, spaceBefore=6)))

# ── Build PDF ───────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=letter,
    leftMargin=inch * 0.75,
    rightMargin=inch * 0.75,
    topMargin=inch * 0.85,
    bottomMargin=inch * 0.7,
    title="My Math Roots — Internal Version Changelog",
    author="Akeem Jones",
    subject="Internal changelog v5.22",
)
doc.build(story, onFirstPage=on_first_page, onLaterPages=on_later_pages)
print(f"PDF written to {OUTPUT}")
