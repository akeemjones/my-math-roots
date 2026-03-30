"""Generate MY-MATH-ROOTS-CHANGELOG.pdf — updated through v5.33"""
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
    ("v5.33", "March 30, 2026 (Current)", "Security Hardening Sprint · Offline Resilience · Stable Question IDs"),
    ("v5.32", "March 30, 2026", "Dark Mode Polish · Faster Repeat Visits · CSP Hardening · Guest Restrictions"),
    ("v5.31", "March 2026", "Auto Theme · Push Notification Milestones · Parent Controls Redesign"),
    ("v5.30", "March 26, 2026", "Major UI Overhaul, Push Notifications, Timer Improvements"),
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
#  v5.33
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.33", "March 30, 2026 (Current)", "Security Hardening · Offline Resilience · Stable Question IDs", C_GREEN))
story.append(sp(10))

story.append(section("Offline Resilience — Stale-While-Revalidate Service Worker"))
for i in item("Instant offline launch",
    "The service worker's index.html fetch strategy changed from network-first to stale-while-revalidate.",
    "Result: the app opens immediately from the device cache regardless of network availability, then silently "
    "updates the cached copy in the background. Previously, a slow or missing network connection caused a "
    "noticeable delay or a 503 error before the app appeared."):
    story.append(i)

story.append(sp(6))
story.append(section("Security — PBKDF2 PIN Hashing"))
for i in item("PIN hashing algorithm upgraded from SHA-256 to PBKDF2",
    "Algorithm: PBKDF2-HMAC-SHA256 with 100,000 iterations and a device-unique salt (wb_app_secret).",
    "The salt is a per-device UUID generated at first launch; this means the same PIN hashes differently "
    "on every device, making pre-computed rainbow-table attacks impossible.",
    "Old storage key wb_pin_v absent or '1' = SHA-256 (legacy). New value '2' = PBKDF2.",
    "Silent migration: on first successful login with a legacy SHA-256 PIN, the stored hash is "
    "automatically re-hashed with PBKDF2 and wb_pin_v is set to '2'. No user action required.",
    "Added _hashPinLegacy() for the migration path; _hashPin() now uses SubtleCrypto PBKDF2 deriveBits."):
    story.append(i)

story.append(sp(6))
story.append(section("Security — HMAC-SHA256 Score Signing"))
for i in item("Score signatures upgraded from DJB2 (non-cryptographic) to HMAC-SHA256",
    "Previous _scoreSig() used a synchronous 32-bit DJB2 hash — easily invertible, no secret key.",
    "New implementation: async HMAC-SHA256 keyed with wb_app_secret (per-device UUID).",
    "Message format: '{qid}:{pct}:{id}'. Signature stored as 64-char hex in score._sig.",
    "_scoreValid() now rejects any signature that is not exactly 64 hex characters "
    "(catches legacy DJB2 numeric strings and any tampered values).",
    "Boot migration (wb_sig_migrated_v2): old DJB2 sigs cleared from localStorage wb_sc5 and from "
    "in-memory SCORES array on first boot after upgrade. Cleared entries pass through the !s._sig "
    "backward-compat path in _pushScores and are re-signed on next quiz completion.",
    "_finishQuiz, confirmQuit, and confirmRestart updated to await _scoreSig().",
    "_pushScores updated to use Promise.all + async _scoreValid() for filter."):
    story.append(i)

story.append(sp(6))
story.append(section("Security — Device-Specific Unlock Token Signing"))
for i in item("_signUnlockToken now incorporates wb_app_secret",
    "Previous implementation signed tokens with a static suffix ':mymathroots_unlock_v1' only.",
    "New implementation appends ':' + wb_app_secret (device UUID) to the signed string.",
    "Effect: an unlock token computed on one device cannot unlock content on a different device.",
    "Boot migration (wb_unlock_migrated_v2): existing device-agnostic unlock tokens are cleared "
    "on first boot. Parents re-enter PIN once to re-lock/unlock — losing unlock state is harmless."):
    story.append(i)

story.append(sp(6))
story.append(section("Security — CSP Hardening & Audit Fixes"))
for i in item("'unsafe-inline' removed from script-src Content Security Policy",
    "All onclick= attributes across unit.js, ui.js, tour.js, and lesson data files migrated to "
    "data-action= / data-arg= event delegation (SEC-3 migration).",
    "CSP script-src now lists only explicit external domains — no inline script execution permitted.",
    "Full zero-bug audit (2026-03-30): all High, Medium, and Low findings identified and resolved.",
    "High: removed unsafe-inline from script-src. Medium: secured event delegation, removed orphaned "
    "inline handlers. Low: general code hygiene, removed dead event listeners."):
    story.append(i)

story.append(sp(6))
story.append(section("Cloud Sync — Testable _mergeCloudData Function"))
for i in item("_mergeCloudData extracted as pure function from _pullOnLogin",
    "All cloud-sync merge logic (previously 80+ inline lines in _pullOnLogin) extracted into "
    "_mergeCloudData(local, cloud) — a pure function with no Supabase/localStorage side effects.",
    "Merge strategies: DONE (union), SCORES (append-only dedup, capped at 200), "
    "STREAK (last-writer-wins by date), MASTERY (higher-attempts-wins), APP_TIME (max per field/day).",
    "_pullOnLogin now calls _mergeCloudData and applies the result to globals via Object.assign.",
    "Prototype pollution protection on done_json keys (__proto__, constructor, prototype rejected).",
    "Remote score validation: filters out entries with missing qid, non-numeric pct, or pct > 100."):
    story.append(i)

story.append(sp(6))
story.append(section("Testing — Jest Suite (29 Tests)"))
for i in item("Jest installed and configured",
    "Added jest ^30.3.0 to devDependencies. Test script: 'npm test'.",
    "jest config: { testEnvironment: 'node' }."):
    story.append(i)
for i in item("21 tests for _mergeCloudData (tests/mergeCloudData.test.js)",
    "DONE merge: union, cloud overwrites, local-only survives, prototype pollution rejected, "
    "non-boolean coercion.",
    "SCORES: new remote id appended, duplicate id ignored, sorted descending, capped at 200, "
    "invalid qid filtered, pct > 100 filtered.",
    "STREAK: newer server date wins, older server date kept local, Math.max for longest, "
    "missing local lastDate adopts server.",
    "MASTERY: higher attempts wins, equal attempts + higher correct wins, lower remote kept local, "
    "missing local key adopts remote.",
    "APP_TIME: higher totalSecs wins, per-day max wins."):
    story.append(i)
for i in item("8 tests for PIN hashing (tests/pin.test.js)",
    "_hashPinLegacy returns 64-char hex, _hashPin (PBKDF2) returns 64-char hex.",
    "PBKDF2 and SHA-256 produce different hashes for same PIN.",
    "_savePin stores PBKDF2 hash and sets wb_pin_v=2.",
    "_verifyPin succeeds for PBKDF2 PIN, rejects wrong PIN.",
    "_verifyPin accepts legacy SHA-256 hash and upgrades silently to PBKDF2.",
    "_verifyPin rejects wrong PIN against legacy hash."):
    story.append(i)

story.append(sp(6))
story.append(section("Data — Stable Question IDs (5,073 questions)"))
for i in item("Unique id field added to every question object",
    "Format: u{unitNum}-{category}-{NNN} (3-digit zero-padded index per unit + category).",
    "Example IDs: u1-add-001, u3-sub-042, u10-div-289.",
    "Categories: add, sub, mul, div, frac, dec, place, word, mixed — derived from lesson content.",
    "5,073 unique IDs across u1.js–u10.js. Zero duplicates (validated at generation time).",
    "Migration script: scripts/add-question-ids.js — splits each file on \"qBank\":[ delimiter, "
    "inserts {\"id\":\"...\",\"t\": at each question boundary. Safe to re-run."):
    story.append(i)
for i in item("_qId(q) utility function added to util.js",
    "Returns q.id if the question has a stable ID; falls back to _qKey(q.t) for pre-migration data.",
    "Guarantees backward compatibility: guests on old cached data or answers without id fields "
    "continue to key MASTERY by text hash until the unit data is refreshed."):
    story.append(i)
for i in item("MASTERY keying updated to use _qId(q)",
    "_updateMastery in state.js: const k = _qId(a) replaces _qKey(a.t).",
    "quiz.js: both MASTERY read sites updated from MASTERY[_qKey(q.t)] to MASTERY[_qId(q)].",
    "Answer objects now include id: q.id so _updateMastery has the stable ID available.",
    "Lazy migration in _updateMastery: on first touch of a question with a stable id, "
    "if MASTERY has the old text-hash key but not the stable id key, the entry is renamed automatically."):
    story.append(i)
for i in item("nextReview:null field added to MASTERY schema",
    "Every new or migrated MASTERY entry includes nextReview: null (spaced-repetition foundation).",
    "Boot migration (wb_migrated_qids_v1): adds nextReview:null to all existing MASTERY entries "
    "on first launch after upgrade. No scheduling logic yet — field reserved for future use."):
    story.append(i)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.32
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.32", "March 30, 2026", "Dark Mode · CSP · Guest Restrictions · Nudge Overlay Refactor", C_PURPLE))
story.append(sp(10))

story.append(section("Dark Mode Polish"))
for i in item("Every modal and popup updated to full frosted-glass dark look",
    "Timer modal, access modal, settings modal, PIN entry modal, and parent controls modal "
    "all updated to use the dark frosted-glass design language.",
    "No more white or washed-out boxes in Dark Mode."):
    story.append(i)

story.append(sp(6))
story.append(section("Guest User Restrictions"))
for i in item("Guest mode limits to lesson 1 scoring only",
    "Signed-out (guest) users can still browse and practice freely, but quiz scores are only "
    "recorded for lesson 1 to encourage sign-up.",
    "Lock toast added: attempting to record a score beyond lesson 1 as a guest shows a soft gate."):
    story.append(i)
for i in item("Nudge overlay refactored to transparent glass",
    "_showSoftGate and _showSignupNudge both refactored to use a new shared _makeNudgeOverlay() helper.",
    "Overlay uses transparent frosted-glass instead of a solid background.",
    "Consent gate remains non-dismissable; soft-gate nudge can be tapped outside to dismiss.",
    ".nudge-overlay CSS class added for the transparent glass modal wrapper."):
    story.append(i)

story.append(sp(6))
story.append(section("Performance — Faster Repeat Visits"))
for i in item("JavaScript loaded as a separate cached file",
    "After the first visit, the app's JS bundle loads instantly from device cache.",
    "Service worker updated to cache the JS bundle with the HTML assets."):
    story.append(i)

story.append(sp(6))
story.append(section("Security — CSP & Event Delegation (SEC-3)"))
for i in item("onclick= → data-action= migration for all inline handlers",
    "All remaining onclick= attributes in unit.js, ui.js, and tour.js migrated to data-action= / data-arg=.",
    "playCarryAnim() calls in lesson data files migrated from onclick= to data-action=.",
    "This completes the SEC-3 migration — no inline JS event handlers remain in the app."):
    story.append(i)
for i in item("unsafe-inline removed from script-src CSP (Phase 3 of SEC-3)",
    "script-src now allows only: 'self', cdn.jsdelivr.net, accounts.google.com, challenges.cloudflare.com.",
    "Removing unsafe-inline prevents any injected inline scripts from executing, even if an "
    "attacker finds an XSS vector."):
    story.append(i)

story.append(sp(6))
story.append(section("Bug Fixes & Audit Findings"))
for i in item("Full zero-bug audit — 2026-03-30",
    "High findings: removed unsafe-inline from CSP, validated all event delegation targets.",
    "Medium findings: removed orphaned inline event handlers, hardened input validation.",
    "Low findings: code hygiene, removed dead listeners, consistent error handling."):
    story.append(i)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.31
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.31", "March 2026", "Auto Theme · Push Notification Milestones · Parent Controls Redesign", C_ORANGE))
story.append(sp(10))

story.append(section("Auto Theme"))
for i in item("App now follows device Light/Dark Mode automatically",
    "On first launch (or after reset), the app reads prefers-color-scheme and matches the OS theme.",
    "New 'Auto' button in Settings → Appearance resets back to OS-matching after a manual theme choice.",
    "Previously, the app started in light mode and required manual toggling to match a dark device."):
    story.append(i)

story.append(sp(6))
story.append(section("Push Notification Milestones"))
for i in item("5-day streak push notification",
    "When a student reaches a 5-day consecutive practice streak, a special '🔥 5-Day Streak!' "
    "push notification is sent celebrating the milestone.",
    "Triggered server-side by the daily streak check cron job."):
    story.append(i)
for i in item("Streak-ending warning notification",
    "If a student had an active streak yesterday but has not practiced today, the daily reminder "
    "changes from a generic reminder to a '⚡ Don't break your streak!' alert.",
    "Fires at the same scheduled time as the regular daily reminder."):
    story.append(i)

story.append(sp(6))
story.append(section("Parent Controls Redesign"))
for i in item("Every panel inside Parent Controls updated to card style",
    "All panels now use identical frosted-glass card styling matching the rest of the app.",
    "Consistent appearance in both Light and Dark mode — no more mismatched glass panels.",
    "Border radii, shadows, and backdrop blur brought into alignment with the settings screen style."):
    story.append(i)

story.append(sp(6))
story.append(section("Feedback Form — Unclick Stars & Categories"))
for i in item("Tapping an already-selected star or category now deselects it",
    "Previously, once a star rating or feedback category was selected it could not be unset "
    "without selecting a different value.",
    "Now tapping the same star or category again toggles it off, allowing the user to "
    "change their mind before submitting."):
    story.append(i)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  v5.30
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("v5.30", "March 26, 2026", "UI Overhaul · Push Notifications · Timer Improvements", C_BLUE))
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
    "When the timer value is under 60 seconds, +/- buttons step by 1 second instead of 15 seconds.",
    "Allows precise sub-minute timer values for fast-paced practice scenarios."):
    story.append(i)

story.append(sp(6))
story.append(section("Manual Timer Entry"))
for i in item("Tap-to-type timer value",
    "Tapping any timer value label in Parent Controls opens a native number-pad input for direct entry.",
    "Input is validated and clamped to the allowed range (15s–7200s) on blur.",
    "Applies to Lesson Quiz timer, Unit Quiz timer, and Final Test timer."):
    story.append(i)

story.append(sp(6))
story.append(section("Push Notifications"))
for i in item("Daily math reminder notifications",
    "Parents can enable/disable daily practice reminders from Parent Controls → Reminders section.",
    "Works on Android (any Chrome) and installed iOS PWA (iOS 16.4+).",
    "Uses Web Push API with VAPID keys; subscription stored in Supabase alongside the user profile.",
    "Delivery scheduled via Supabase pg_cron + pg_net edge function."):
    story.append(i)

story.append(sp(6))
story.append(section("Bug Fixes — v5.30"))
for i in item("Re-Lock All fix",
    "Confirming a full reset (Re-Lock All) now stays on the Parent Controls screen and shows a "
    "confirmation toast instead of navigating to the home page.",
    "Also clears any paused quizzes including the Final Test."):
    story.append(i)
for i in item("Spotlight scroll lock",
    "Screen scrolling is now locked the instant a first-visit spotlight tour is detected, "
    "preventing users from scrolling past the highlighted feature before it appears."):
    story.append(i)
for i in item("Final Test header fix",
    "The graduation cap emoji in the quiz header bar now renders correctly instead of showing raw "
    "unicode escape code."):
    story.append(i)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
#  Statistics
# ══════════════════════════════════════════════════════════════════════════════
story.append(ver_header("Statistics & Summary", "As of v5.33 — March 30, 2026", "Project Overview", C_DARK))
story.append(sp(10))

stats = [
    ["Metric", "Value"],
    ["Total app versions", "33+ (v1.0 through v5.33)"],
    ["Total questions (with stable IDs)", "5,073"],
    ["Total units", "10"],
    ["Total lessons", "35"],
    ["Lesson quiz questions (per quiz)", "8"],
    ["Unit quiz questions (per quiz)", "25"],
    ["Final Test questions", "50"],
    ["Automated tests", "29 (21 cloud merge + 8 PIN)"],
    ["Supported platforms", "iOS 16.4+ (installed PWA), Android Chrome, Desktop Chrome/Edge/Firefox"],
    ["Backend", "Supabase (Postgres + Auth + Edge Functions + Storage)"],
    ["Hosting", "Netlify (CDN, custom headers, branch deploys)"],
    ["Auth methods", "Email/password + Google OAuth (PKCE) + Guest (offline)"],
    ["Push notifications", "Web Push API — VAPID self-hosted, daily cron via pg_cron + pg_net"],
    ["PIN security", "PBKDF2-HMAC-SHA256, 100,000 iterations, device-unique salt (wb_app_secret)"],
    ["Score security", "HMAC-SHA256 signatures, per-device secret, 64-char hex"],
    ["CSP script-src", "No unsafe-inline; explicit CDN allowlist only"],
    ["Offline support", "Full — service worker stale-while-revalidate; opens instantly from cache"],
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
    "This changelog covers v5.11 through v5.33. For v5.10 and earlier, see the previous changelog document.",
    NOTE
))

# ── Build ─────────────────────────────────────────────────────────────────────
doc.build(story)
print(f"Generated {OUTPUT}")
