"""Generate MY-MATH-ROOTS-CHANGELOG.pdf — updated through v5.30"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
    Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import datetime

OUTPUT = "MY-MATH-ROOTS-CHANGELOG.pdf"

# ── Colour palette ──────────────────────────────────────────────────────────
C_BLUE    = colors.HexColor("#2c7be5")
C_GREEN   = colors.HexColor("#27ae60")
C_PURPLE  = colors.HexColor("#6c5ce7")
C_ORANGE  = colors.HexColor("#e67e22")
C_RED     = colors.HexColor("#e74c3c")
C_DARK    = colors.HexColor("#1a1a2e")
C_MID     = colors.HexColor("#4a4a6a")
C_LIGHT   = colors.HexColor("#f0f4f8")
C_RULE    = colors.HexColor("#ccd6f0")

# ── Styles ───────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, **kw)

COVER_TITLE = S("CoverTitle", fontSize=32, leading=38, textColor=C_DARK,
                fontName="Helvetica-Bold", alignment=TA_CENTER, spaceAfter=6)
COVER_SUB   = S("CoverSub", fontSize=13, leading=18, textColor=C_MID,
                fontName="Helvetica", alignment=TA_CENTER, spaceAfter=4)
COVER_DATE  = S("CoverDate", fontSize=11, leading=14, textColor=C_BLUE,
                fontName="Helvetica-Oblique", alignment=TA_CENTER, spaceAfter=2)

VER_LABEL   = S("VerLabel", fontSize=18, leading=22, textColor=colors.white,
                fontName="Helvetica-Bold", alignment=TA_LEFT, spaceAfter=2)
VER_DATE    = S("VerDate", fontSize=10, leading=13, textColor=colors.white,
                fontName="Helvetica-Oblique", alignment=TA_LEFT, spaceAfter=0)
VER_TAG     = S("VerTag", fontSize=9, leading=11, textColor=colors.white,
                fontName="Helvetica", alignment=TA_LEFT)

SEC_HEAD    = S("SecHead", fontSize=12, leading=15, textColor=C_BLUE,
                fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=3)
ITEM_TITLE  = S("ItemTitle", fontSize=10, leading=13, textColor=C_DARK,
                fontName="Helvetica-Bold", spaceBefore=4, spaceAfter=1)
ITEM_BODY   = S("ItemBody", fontSize=9, leading=13, textColor=C_MID,
                fontName="Helvetica", spaceAfter=2, leftIndent=14)
NOTE        = S("Note", fontSize=8, leading=11, textColor=colors.HexColor("#888"),
                fontName="Helvetica-Oblique", leftIndent=14, spaceAfter=4)
TOC_ENTRY   = S("TocEntry", fontSize=10, leading=14, textColor=C_DARK,
                fontName="Helvetica", spaceAfter=1)
TOC_HEAD    = S("TocHead", fontSize=13, leading=16, textColor=C_DARK,
                fontName="Helvetica-Bold", spaceBefore=4, spaceAfter=6)

# ── Helpers ──────────────────────────────────────────────────────────────────
def rule():
    return HRFlowable(width="100%", thickness=0.5, color=C_RULE, spaceAfter=6, spaceBefore=2)

def ver_header(version, date_str, category, accent=C_BLUE):
    data = [[
        Paragraph(version, VER_LABEL),
        Paragraph(f"{date_str}<br/><font size='8'>{category}</font>", VER_DATE),
    ]]
    t = Table(data, colWidths=[3.2*inch, 4.1*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",  (0,0), (-1,-1), accent),
        ("TOPPADDING",  (0,0), (-1,-1), 10),
        ("BOTTOMPADDING",(0,0),(-1,-1), 10),
        ("LEFTPADDING", (0,0), (-1,-1), 14),
        ("RIGHTPADDING",(0,0), (-1,-1), 14),
        ("ROUNDEDCORNERS",(0,0),(-1,-1), 8),
        ("VALIGN",      (0,0), (-1,-1), "MIDDLE"),
    ]))
    return t

def section(title):
    return Paragraph(title, SEC_HEAD)

def item(title, *bullets):
    parts = [Paragraph(f"<b>{title}</b>", ITEM_TITLE)]
    for b in bullets:
        parts.append(Paragraph(f"• {b}", ITEM_BODY))
    return parts

def sp(n=6):
    return Spacer(1, n)

# ── Document setup ───────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=letter,
    leftMargin=0.7*inch, rightMargin=0.7*inch,
    topMargin=0.7*inch, bottomMargin=0.7*inch,
    title="My Math Roots — Internal Version Changelog",
    author="Akeem Jones",
)

story = []

# ══════════════════════════════════════════════════════════════════════════════
#  COVER PAGE
# ══════════════════════════════════════════════════════════════════════════════
story += [
    sp(60),
    Paragraph("MY MATH ROOTS", COVER_TITLE),
    Paragraph("K-5 Math Review App", COVER_SUB),
    Paragraph("Internal Version Changelog", COVER_SUB),
    sp(8),
    HRFlowable(width="60%", thickness=2, color=C_BLUE, hAlign="CENTER"),
    sp(8),
    Paragraph(f"Updated: {datetime.date.today().strftime('%B %d, %Y')}", COVER_DATE),
    Paragraph("Created by Akeem Jones", COVER_DATE),
    sp(40),
]

# Table of contents
toc_entries = [
    ("v5.30", "March 26, 2026 (Current)", "Major UI Overhaul, Push Notifications, Timer Improvements"),
    ("v5.29", "March 25, 2026", "Glass Icon, iOS Fixes, White Background"),
    ("v5.28", "March 24, 2026", "Glass Buttons, Transparent Header, New Icon"),
    ("v5.27", "March 2026", "Icon Update, PIN Number Pad"),
    ("v5.26", "March 2026", "Glassmorphic UI Overhaul"),
    ("v5.25", "March 2026", "Background, Change Password, Login Fixes"),
    ("v5.24", "March 2026", "Password Reveal, Remember Email, Icon Fix"),
    ("v5.23", "March 2026", "Unit Card Illustrations, Color Refresh"),
    ("v5.22", "March 2026", "Security Hardening, Layout Fixes"),
    ("v5.18–v5.21", "March 2026", "Safe Area Padding Corrections"),
    ("v5.13–v5.17", "March 2026", "Tutorial, Spotlight Tours, Security, Note Pad, Feedback"),
    ("v5.12", "March 2026", "Google Sign-In, Auto-Update, Login Polish"),
    ("v5.11", "March 2026", "Cloud Accounts & Progress Sync"),
    ("v5.10 and earlier", "2025–2026", "See Previous Changelog Document"),
]

story.append(Paragraph("Table of Contents", TOC_HEAD))
for ver, date, desc in toc_entries:
    story.append(Paragraph(f"<b>{ver}</b>  —  {date}  •  {desc}", TOC_ENTRY))
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.30
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.30", "March 26, 2026 (Current)", "UI Overhaul · Push Notifications · Timer Improvements", C_BLUE))
story.append(sp(10))

story.append(section("Parent Controls — Full Glass UI Overhaul"))
for i in item("Panel background made transparent",
    "The outer .parent-panel-inner container background changed from var(--bg3) solid grey to fully transparent, "
    "allowing the frosted-glass page background to show through every card on the screen."):
    story.append(i)
for i in item("Timer settings card — glass style",
    "Background changed from var(--bg3) to rgba(255,255,255,0.18) with backdrop-filter:blur(10px) saturate(150%).",
    "Asymmetric borders applied: top/left bright white, right/bottom near-transparent — mimics real glass edge lighting.",
    "Inset highlight: inset 0 1px 0 rgba(255,255,255,0.85) for a polished top sheen.",
    "Drop shadow: 0 4px 16px rgba(0,0,0,0.08) for subtle depth."):
    story.append(i)
for i in item("PIN change area — glass style",
    "Same rgba(255,255,255,0.18) glass treatment applied to the pin-change-area container."):
    story.append(i)
for i in item("Clear All Score History button — glass style",
    "Replaced the solid border button with the same glass background, asymmetric borders, and box-shadow."):
    story.append(i)
for i in item("Send Feedback card — glass style",
    "The entire feedback form container (previously var(--bg3) + 2px border) now uses glass styling."):
    story.append(i)
for i in item("What's New (changelog) card — glass style",
    "The scrollable changelog container matches the glass style for full visual consistency."):
    story.append(i)
for i in item("Change PIN button — glass style",
    "The 'Change PIN' parent-btn changed from background:var(--bg3);border:2px solid var(--border2) to full glass treatment."):
    story.append(i)
for i in item("Feedback category buttons — glass style",
    ".fb-cat-btn CSS class rewritten: border-top/left bright, border-right/bottom faint, rgba background, backdrop-filter:blur(8px).",
    "Active state retains the solid blue fill (#4a90d9) with a blue glow box-shadow."):
    story.append(i)
for i in item("Comments textarea — glass style",
    "The #fb-comment textarea background changed from var(--bg) to rgba(255,255,255,0.22) with backdrop-filter:blur(8px) "
    "and asymmetric glass borders."):
    story.append(i)
for i in item("Confirmation modal (restart/quit) — more transparent",
    "The .restart-modal-box glass gradient opacity reduced: 0.72 → 0.42 (top), 0.62 → 0.34 (mid), 0.58 → 0.28 (bottom).",
    "Result: modal appears lighter and more translucent, matching the pin-box style."):
    story.append(i)

story.append(sp(6))
story.append(section("Final Test Timer Control"))
for i in item("New timer row in Parent Controls",
    "A dedicated Final Test timer row (identical in design to Lesson Quiz and Unit Quiz rows) added to the Quiz Timer section.",
    "Stored in localStorage key wb_final_timer_secs. Default: 3600 seconds (60 minutes). Max: 7200 seconds (2 hours).",
    "getFinalTimerSecs() function added with no migration needed (new key, no legacy format)."):
    story.append(i)
for i in item("Timer labels and getter helpers",
    "_timerSecsLbl(s): formats seconds as 'X sec' (under 1 min) or 'Xm Ys' / 'X min' (1 min and over).",
    "updateTimerToggleBtn() updated to sync all three timer inputs: lesson, unit, and final."):
    story.append(i)
for i in item("1-second step intervals below 1 minute",
    "Previously all timers stepped in 15s increments regardless of value.",
    "New logic: if current < 60s → +1s / -1s (min 1s). If current ≥ 60s → +60s / -60s.",
    "Allows precise testing values like 67 seconds without being forced to use a round number."):
    story.append(i)
for i in item("Manual number pad entry",
    "Each timer row now has an <input type='number' inputmode='numeric'> field showing the current raw seconds.",
    "User taps the field, types a value, presses Enter or taps away — _setTimerDirect(type, val) clamps to 1..maxSecs.",
    "A formatted label below the input (e.g. '1m 7s') updates immediately after entry.",
    "onfocus='this.select()' auto-selects the value so the user can type immediately."):
    story.append(i)
for i in item("Quiz start code updated",
    "All three quiz launch paths (startQuiz, resumeQuiz, _runQuiz for final) now call getFinalTimerSecs(), "
    "getUnitTimerSecs(), getLessonTimerSecs() as appropriate."):
    story.append(i)

story.append(sp(6))
story.append(section("Push Notifications"))
for i in item("VAPID key pair generated",
    "ES256 (P-256) VAPID keys generated using Node.js crypto.generateKeyPairSync.",
    "Public key embedded in app as VAPID_PUBLIC_KEY constant.",
    "Private key stored as VAPID_PRIVATE_KEY Supabase Edge Function secret."):
    story.append(i)
for i in item("Supabase push_subscriptions table",
    "New table: id (uuid PK), user_id (nullable FK → auth.users), endpoint (unique), p256dh, auth, device_id, created_at, last_seen.",
    "RLS enabled: users can only INSERT/SELECT/UPDATE/DELETE their own subscriptions; anonymous subscriptions (user_id IS NULL) also allowed.",
    "Indexes on user_id and last_seen for fast lookup."):
    story.append(i)
for i in item("Service worker push handler",
    "push event: parses JSON payload, calls showNotification with icon /icon-192-v5.1.png, badge, tag mmr-daily.",
    "notificationclick event: closes notification, focuses existing app window or opens a new one at the payload URL."):
    story.append(i)
for i in item("In-app subscription flow",
    "_urlBase64ToUint8Array(): converts VAPID public key for pushManager.subscribe().",
    "enablePushNotifications(): requests Notification.requestPermission(), subscribes via pushManager, calls _savePushSubscription().",
    "disablePushNotifications(): unsubscribes from pushManager, deletes row from Supabase, updates UI.",
    "_savePushSubscription(): upserts {endpoint, p256dh (base64url), auth (base64url), user_id, last_seen} to Supabase on conflict endpoint.",
    "PUSH_PREF_KEY (wb_push_enabled) stores 'enabled' / 'disabled' / 'denied' for UI state persistence."):
    story.append(i)
for i in item("Settings → Reminders UI",
    "New 'Reminders' section added above Parent Controls in Settings screen.",
    "Bell icon, description text, and toggle button (🔕 Off / 🔔 On).",
    "Section hidden on browsers that don't support PushManager.",
    "_maybePushPrompt(): after 3rd app visit shows a toast suggesting the user enable reminders."):
    story.append(i)
for i in item("Edge Function: send-push",
    "Deployed to Supabase as functions/v1/send-push.",
    "Implements full Web Push RFC 8291 / RFC 8188: ECDH key exchange, HKDF key derivation, AES-128-GCM encryption, aes128gcm content-encoding header.",
    "VAPID JWT signed with ES256 using crypto.subtle — no external library needed.",
    "Fetches all push_subscriptions, sends a random rotating message from a 5-item catalogue.",
    "Automatically deletes subscriptions that return HTTP 404 or 410 (expired/revoked).",
    "Returns JSON: {sent, failed, stale_removed}."):
    story.append(i)
for i in item("Daily cron schedule",
    "pg_cron + pg_net extensions enabled on Supabase project.",
    "Job 'daily-push-reminder' runs at 19:00 UTC daily (noon–3pm US time zones).",
    "Calls the send-push edge function via net.http_post with x-supabase-cron: true header."):
    story.append(i)

story.append(sp(6))
story.append(section("Bug Fixes & UX Improvements"))
for i in item("Re-Lock All — stays on Parent Controls",
    "Previously: _confirmRelockAll() called playSwooshBack() + show('home'), navigating away from the parent panel.",
    "Fix: removed navigation call entirely. User stays on Parent Controls screen.",
    "A showLockToast('Progress reset. All lessons re-locked.') confirmation is shown at the bottom of the screen instead.",
    "localStorage.removeItem(QUIZ_PAUSE_KEY) added to also clear any paused quizzes including the Final Test."):
    story.append(i)
for i in item("Spotlight scroll lock — immediate",
    "Previously: scroll lock was applied inside _spotRender() which ran after the 600ms spotlight delay. "
    "Users who scrolled quickly after a screen loaded could scroll past the spotlighted element before it appeared.",
    "Fix: document.body.classList.add('spot-scroll-lock') moved to _spotCheckScreen(), executing immediately "
    "when the first-visit screen is detected — before the 600ms timer fires.",
    "CSS targeting: body.spot-scroll-lock .sc.on, body.spot-scroll-lock .lesson-glass-wrap { overflow:hidden !important; touch-action:none !important } "
    "targets the actual scrolling containers (.sc elements), not document.body which had no effect."):
    story.append(i)
for i in item("Hero text — plain white (gradient removed)",
    "Previous: .hero-h1 used a radial gradient with green/teal tones intended to reflect the sprout.",
    "The gradient was difficult to position precisely and looked inconsistent across screen sizes.",
    "Fix: color:#ffffff with filter:drop-shadow(0 6px 3px rgba(0,0,0,0.32)) — clean, crisp, consistent.",
    "Applied to both home screen (.hero-h1 CSS) and login screen H1 (inline style updated to match)."):
    story.append(i)
for i in item("Final Test header bar — icon rendering fix",
    "The quiz bar-title element used textContent = label to set the title, which escaped HTML entities.",
    "The Final Test label contains _ICO.graduation (an SVG string) via a template literal.",
    "The label string was also built with single quotes instead of backticks, preventing template interpolation.",
    "Fix 1: changed string delimiters from '' to backticks in startFinalTest().",
    "Fix 2: changed .textContent = label to .innerHTML = label in both _runQuiz() and resumeQuiz() title-update lines."):
    story.append(i)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.29
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.29", "March 25, 2026", "Visual Polish · iOS Fixes", C_PURPLE))
story.append(sp(10))
for i in item("Brighter white app background",
    "Body background changed from a tinted value to #f0f4f8 — a near-white that makes glass cards pop more visibly.",
    "Body overflow:hidden added to prevent any background bleed."):
    story.append(i)
for i in item("Google-style glass app icon",
    "New icon design: white glass background, orange-petal sprout, subtle math symbols in corners.",
    "Exported at 192px and 512px; manifest.json updated."):
    story.append(i)
for i in item("iOS launch splash fix",
    "The apple-touch-startup-image meta tag was referencing an old backpack/2nd Grade Math graphic.",
    "Replaced with the new sprout-based splash image."):
    story.append(i)
for i in item("iOS swipe-back Google OAuth fix",
    "Swiping back after Google OAuth was landing on the Google OAuth page instead of the app.",
    "Fix: history guard now prevents navigating back into OAuth flows."):
    story.append(i)
for i in item("Three-screen overlap fix",
    "A race condition could cause three screens to be simultaneously visible (.on) after rapid navigation.",
    "Fix: show() function now ensures exactly one screen is active at a time."):
    story.append(i)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.28
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.28", "March 24, 2026", "Glass Design System · New Icon", C_GREEN))
story.append(sp(10))
for i in item("Glass buttons everywhere",
    "Every interactive button in the app given frosted-glass treatment: rgba background, backdrop-filter:blur, asymmetric borders, inset sheen.",
    "Covers: navigation buttons, quiz actions, settings toggles, lock/unlock buttons, category chips."):
    story.append(i)
for i in item("Transparent navigation header",
    "The top bar (.bar) changed from a solid background to glass-transparent so the animated math-bubble background shows through.",
    "Text and icons remain fully readable via text-shadow and contrast tuning."):
    story.append(i)
for i in item("Orange sprout petals",
    "Sprout SVG leaves recolored to a warm orange-glass palette on the home, login, and loading screens.",
    "Creates a warmer, more distinctive brand identity."):
    story.append(i)
for i in item("Smarter unit quiz button",
    "After passing a unit quiz (80%+) the button label changes to 'Next Unit →' and navigates directly — removing the extra tap.",
    "Previous behavior required navigating back to home then finding the next unit."):
    story.append(i)
for i in item("Cleaner lesson bottom CTA",
    "'Take quiz to unlock' message and next-lesson button combined into one call-to-action row.",
    "Reduces visual clutter and makes the next action clearer."):
    story.append(i)
for i in item("Progress bar transparency fix",
    "Progress bar opacity now matches the surrounding scroll container glass level (was inconsistently more opaque)."):
    story.append(i)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.27 and v5.26
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.27", "March 2026", "Icon Refresh · PIN UX", C_ORANGE))
story.append(sp(10))
for i in item("Updated app icon",
    "New icon: spread grass blades, colorful math symbols, larger sprout — more recognizable at small sizes."):
    story.append(i)
for i in item("PIN number pad opens immediately",
    "The number pad on the Parent Controls PIN screen now appears as soon as the screen is shown.",
    "Previously the keyboard had to be tapped separately, causing a delay in entry."):
    story.append(i)
story.append(sp(10))

story.append(ver_header("v5.26", "March 2026", "Glassmorphic UI — All Cards & Panels", C_BLUE))
story.append(sp(10))
for i in item("Glassmorphism applied app-wide",
    "All cards, popups, modals, and tutorial panels converted to frosted-glass: backdrop-filter:blur, translucent rgba backgrounds, soft borders.",
    "This was the first pass that established the glass design language; later versions refined individual components."):
    story.append(i)
for i in item("Updated sprout icon",
    "Sprout now has wide-spreading grass blades; appears on login and home screens."):
    story.append(i)
for i in item("App icon refresh",
    "Colorful math symbols added, sprout enlarged, text overlay removed — cleaner and more recognizable."):
    story.append(i)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.25 and v5.24
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.25", "March 2026", "Background Fix · Change Password · Login Polish", C_GREEN))
story.append(sp(10))
for i in item("Background fills full screen",
    "Gradient background now extends edge-to-edge including the iPhone home indicator area at the bottom.",
    "Previously a white strip was visible at the bottom on some iPhone models."):
    story.append(i)
for i in item("Smoother back transition",
    "Swiping back to the home screen no longer makes the unit card appear to grow or shift during the animation."):
    story.append(i)
for i in item("Change Password in Parent Controls",
    "Email account users can change their password directly from the Parent Controls screen.",
    "Sends a password-reset email via Supabase Auth."):
    story.append(i)
for i in item("Login screen improvements",
    "'Forgot password?' link repositioned to the left for better thumb reach.",
    "Settings screen shows 'Log In' button instead of 'Create Free Account' when user is signed out."):
    story.append(i)
story.append(sp(10))

story.append(ver_header("v5.24", "March 2026", "Login UX Polish · PWA Fix", C_PURPLE))
story.append(sp(10))
for i in item("Password reveal toggle",
    "Tap the eye icon on the login screen to show or hide the password as it is typed.",
    "Uses standard input type='text'/'password' swap with an SVG eye icon."):
    story.append(i)
for i in item("Remember my email",
    "A 'Remember my email' checkbox saves the user's email address to localStorage.",
    "Pre-fills the email field on the next visit."):
    story.append(i)
for i in item("PWA icon fix",
    "The app icon now correctly shows the My Math Roots sprout logo when installed on a home screen.",
    "Previous versions were showing a generic browser icon due to a manifest path issue."):
    story.append(i)
for i in item("Security improvements",
    "Backend hardening: additional input validation, rate limiting adjustments, error message scrubbing."):
    story.append(i)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.23 and v5.22
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.23", "March 2026", "Unit Card Illustrations · Color Refresh", C_ORANGE))
story.append(sp(10))
for i in item("Unit card topic illustrations",
    "Each of the 10 unit cards now shows a unique topic illustration (SVG icon) representing what it teaches.",
    "Examples: coins for Money, ruler for Measurement, fractions icon for Fractions, etc."):
    story.append(i)
for i in item("Color refresh across all unit cards",
    "Unit card accent colors updated to brighter, more vibrant shades for improved visual hierarchy.",
    "Each unit has a distinct color that carries through to the unit screen header and quiz button."):
    story.append(i)
for i in item("Navigation icon flash fix",
    "Going back from a unit screen no longer caused icons to flash or pop during the swipe-back transition.",
    "Root cause: icon elements were briefly re-rendering due to a DOM mutation during the animation."):
    story.append(i)
story.append(sp(10))

story.append(ver_header("v5.22", "March 2026", "Security Hardening · Layout Fixes", C_RED))
story.append(sp(10))
for i in item("Security and stability hardening",
    "Comprehensive audit to ensure all user data is fully protected and isolated between sessions.",
    "Prevents data from one logged-in user being visible to another after sign-out without page refresh.",
    "All in-memory state (DONE, SCORES, CUR) cleared on sign-out.",
    "Supabase Row Level Security policies verified on all tables (quiz_scores, student_progress, profiles, feedback)."):
    story.append(i)
for i in item("Safe area layout corrections",
    "All screen layouts updated to correctly respect iPhone safe areas.",
    "No content is hidden behind the iPhone home indicator on any device or screen size.",
    "Uses env(safe-area-inset-bottom) consistently via CSS padding."):
    story.append(i)
for i in item("Unit quiz button always visible",
    "The Unit Quiz button is now always fully visible regardless of how many lessons are in the unit.",
    "lesson-glass-wrap capped with a max-height so it never pushes the quiz button off screen."):
    story.append(i)
for i in item("Font self-hosting",
    "Google Fonts (Boogaloo) inlined as base64 data URIs to eliminate external network dependency.",
    "Fixes CSP violations when fonts were being blocked by strict browser policies."):
    story.append(i)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.18–v5.21
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.18 – v5.21", "March 2026", "Safe Area Padding Iterations", C_MID))
story.append(sp(10))
for i in item("v5.18 — Bottom gap fix attempt 1",
    "calc(20px + env(safe-area-inset-bottom)) padding applied to all scroll screens."):
    story.append(i)
for i in item("v5.19 — Bottom padding removed",
    "Removed bottom padding gaps on all screens so content fills to the edge."):
    story.append(i)
for i in item("v5.20 — Safe area restored",
    "env(safe-area-inset-bottom) padding restored on all screens after v5.19 caused content to be cut off by the home indicator."):
    story.append(i)
for i in item("v5.21 — Minor polish",
    "Small layout tweaks and consistency fixes following the safe area corrections."):
    story.append(i)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.13–v5.17
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.13 – v5.17", "March 2026", "Tutorial · Security · Note Pad · Feedback System", C_BLUE))
story.append(sp(10))

story.append(section("Tutorial & Spotlight Tours"))
for i in item("Tutorial redesigned — 2-slide welcome + per-screen spotlight tours",
    "Replaced the 10-slide tutorial with a streamlined 2-slide welcome that introduces the app concept.",
    "Each screen (home, units, lessons, quiz, settings, history) runs its own spotlight tour on first visit.",
    "Spotlight rectangles match each target element precisely (not circular highlights)."):
    story.append(i)
for i in item("Full-screen swipe-back (v5.17)",
    "Swipe right from anywhere on screen — not just the left edge — to go back, matching native iOS behavior.",
    "Replaced the edge-zone restriction from v5.9 which required starting within 32px of the left edge."):
    story.append(i)
for i in item("Quiz spotlight tour",
    "Covers: timer display, scratch pad / note pad button, start-over button, and quit button.",
    "Quiz timer pauses automatically during the spotlight tour to prevent time pressure."):
    story.append(i)
for i in item("Auto-scroll for off-screen spotlight targets",
    "If the spotlight target element is not currently visible, the screen scrolls to bring it into view before highlighting."):
    story.append(i)

story.append(section("Security (v5.15–v5.17)"))
for i in item("Cloudflare Turnstile CAPTCHA",
    "Added to login and signup flows to prevent bot account creation and brute-force attempts."):
    story.append(i)
for i in item("Pen-test vulnerability fixes (v5.15)",
    "Fixed all issues identified in internal pen-test audit including: error message information disclosure, "
    "missing rate limits on specific endpoints, and unsafe direct object references."):
    story.append(i)
for i in item("Advanced security hardening (v5.16)",
    "Eliminated all data-leakage vectors identified in secondary audit.",
    "User session data fully isolated — no cross-session data bleed."):
    story.append(i)
for i in item("Build minification + obfuscation pipeline (v5.17)",
    "Added build.js script: minifies and obfuscates the production index.html before deployment.",
    "Removes comments, whitespace, and renames internal identifiers to make reverse engineering harder."):
    story.append(i)

story.append(section("Features"))
for i in item("Note Pad added to quiz screen",
    "A drawable canvas / text scratchpad accessible from every quiz and test screen.",
    "Centered fullscreen modal — students can write or draw to work out problems by hand.",
    "Contents cleared between questions to prevent carry-over confusion."):
    story.append(i)
for i in item("Feedback system with star ratings",
    "5-star rating, category selection (General / Bug Report / Feature Request / Content Issue), and optional comment field.",
    "Submissions saved to Supabase feedback table; email notification sent to developer.",
    "Rate-limited to 3 submissions per minute per session."):
    story.append(i)
for i in item("Parent Controls moved to dedicated screen",
    "PIN entry is now a lightbox modal. After authentication, user is taken to a full parent-controls screen.",
    "Forgot PIN flow: solve a 3rd-grade math problem to reset PIN to default."):
    story.append(i)
for i in item("Session loading splash screen",
    "A branded splash overlay shows while the Supabase session is being established on app open.",
    "Prevents a flash of the login or home screen before auth state is known."):
    story.append(i)
for i in item("Clear user data on sign-out (v5.17)",
    "Signing out now clears all in-memory state: DONE, SCORES, CUR, UNITS_DATA derived state, PIN unlocks.",
    "Prevents the next person to open the app from seeing another user's progress."):
    story.append(i)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.12 and v5.11
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.12", "March 2026", "Google Sign-In · Auto-Update · Login Polish", C_GREEN))
story.append(sp(10))
for i in item("Google Sign-In",
    "Students and parents can sign in or create an account with one tap using their Google account.",
    "'Continue with Google' button on the login screen; Google One Tap shown automatically for returning users.",
    "PKCE flow with nonce verification for security. Handles token exchange and Supabase session creation."):
    story.append(i)
for i in item("Sign Out button",
    "Appears at the bottom of the Settings screen when a user is logged in.",
    "Tapping signs the user out, clears all local state, and returns to the login screen."):
    story.append(i)
for i in item("Automatic silent updates",
    "App detects new service worker versions and updates automatically in the background.",
    "A brief 'App updated!' toast appears after the reload. No user action required.",
    "Eliminates the need to delete and reinstall the PWA from the home screen."):
    story.append(i)
for i in item("Double-tap zoom disabled",
    "Double-tapping the screen no longer triggers zoom on iPhone and iPad.",
    "Maintains the native app feel without relying on the deprecated user-scalable=no approach."):
    story.append(i)
for i in item("Smoother screen transitions",
    "Brief background flicker during back navigation eliminated.",
    "Root cause: a CSS transition on the body background was triggering during screen show/hide."):
    story.append(i)
story.append(sp(10))

story.append(ver_header("v5.11", "March 2026", "Cloud Accounts & Progress Sync", C_PURPLE))
story.append(sp(10))
for i in item("Cloud accounts and progress sync",
    "Students can create a free account (email + password) and have all lesson completions and quiz scores synced to the cloud.",
    "Progress is restored automatically on any device after signing in.",
    "Guest mode still available — local-only storage, no account required.",
    "Supabase backend: quiz_scores and student_progress tables with RLS."):
    story.append(i)
for i in item("Login screen",
    "Branded sign-in / create account screen appears before the home page.",
    "Already signed-in users skip directly to home via Supabase onAuthStateChange INITIAL_SESSION.",
    "'Continue without an account' link for guest access."):
    story.append(i)
for i in item("Visual worked example operator fix",
    "The + and = signs in visual worked examples now centered correctly between emoji groups."):
    story.append(i)
for i in item("Quiz Next button redesign",
    "Next Question button is now a small green pill on the right, paired opposite the Previous Question button on the left."):
    story.append(i)
for i in item("Title all-caps",
    "Main page title displayed as 'MY MATH ROOTS' using text-transform:uppercase."):
    story.append(i)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  STATISTICS SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("Statistics & Summary", "As of v5.30 — March 26, 2026", "Project Overview", C_DARK))
story.append(sp(10))

stats = [
    ["Metric", "Value"],
    ["Total app versions", "30+ (v1.0 through v5.30)"],
    ["Total questions", "2,502+"],
    ["Total units", "10"],
    ["Total lessons", "35"],
    ["Lesson quiz questions (per quiz)", "8"],
    ["Unit quiz questions (per quiz)", "25"],
    ["Final Test questions", "50"],
    ["Supported platforms", "iOS 16.4+ (installed PWA), Android Chrome, Desktop Chrome/Edge/Firefox"],
    ["Backend", "Supabase (Postgres + Auth + Edge Functions + Storage)"],
    ["Hosting", "Netlify (CDN, custom headers, branch deploys)"],
    ["Auth methods", "Email/password + Google OAuth (PKCE) + Guest (offline)"],
    ["Push notifications", "Web Push API — VAPID self-hosted, daily cron via pg_cron + pg_net"],
    ["Security measures", "SHA-256 PIN hashing, RLS on all tables, Cloudflare Turnstile, CSP headers, HSTS"],
    ["Offline support", "Full — service worker caches all assets; works without internet after first load"],
]

t = Table(stats, colWidths=[3.0*inch, 4.3*inch])
t.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0),  C_DARK),
    ("TEXTCOLOR",     (0,0), (-1,0),  colors.white),
    ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,0),  9),
    ("BACKGROUND",    (0,1), (-1,-1), C_LIGHT),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [C_LIGHT, colors.white]),
    ("FONTNAME",      (0,1), (-1,-1), "Helvetica"),
    ("FONTSIZE",      (0,1), (-1,-1), 8),
    ("FONTNAME",      (0,1), (0,-1),  "Helvetica-Bold"),
    ("TEXTCOLOR",     (0,1), (0,-1),  C_DARK),
    ("TEXTCOLOR",     (1,1), (1,-1),  C_MID),
    ("TOPPADDING",    (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("GRID",          (0,0), (-1,-1), 0.3, C_RULE),
    ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
]))
story.append(t)
story.append(sp(20))
story.append(Paragraph(
    f"Document generated automatically on {datetime.date.today().strftime('%B %d, %Y')}. "
    "This changelog covers v5.11 through v5.30. For v5.10 and earlier, see the previous changelog document.",
    NOTE
))

# ── Build ─────────────────────────────────────────────────────────────────────
doc.build(story)
print(f"Done — wrote {OUTPUT}")
