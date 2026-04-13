"""
Convert AS-BUILT-V1.1.md to AS-BUILT-V1.1.pdf using reportlab.
Run: python docs/build_pdf.py
"""

import os
import re
import sys

try:
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_LEFT, TA_CENTER
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        HRFlowable, KeepTogether, PageBreak, Paragraph,
        SimpleDocTemplate, Spacer, Table, TableStyle
    )
    from reportlab.platypus.flowables import Flowable
except ImportError:
    print("Run: python -m pip install reportlab")
    sys.exit(1)

MD_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "AS-BUILT-V1.1.md")
PDF_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "AS-BUILT-V1.1.pdf")

# ── Colour palette ──────────────────────────────────────────────
C_NAVY    = colors.HexColor("#0f172a")
C_DARK    = colors.HexColor("#1e293b")
C_MID     = colors.HexColor("#334155")
C_MUTED   = colors.HexColor("#64748b")
C_LIGHT   = colors.HexColor("#94a3b8")
C_BORDER  = colors.HexColor("#e2e8f0")
C_SNOW    = colors.HexColor("#f8fafc")
C_WHITE   = colors.white
C_BLUE    = colors.HexColor("#3b82f6")
C_BLUE_BG = colors.HexColor("#eff6ff")
C_CODE_BG = colors.HexColor("#1e293b")
C_CODE_FG = colors.HexColor("#e2e8f0")
C_TEAL    = colors.HexColor("#0ea5e9")

# ── Styles ───────────────────────────────────────────────────────
def build_styles():
    base = getSampleStyleSheet()

    def s(name, **kw):
        return ParagraphStyle(name, **kw)

    return {
        "title": s("mmr_title",
            fontName="Helvetica-Bold", fontSize=24, leading=30,
            textColor=C_NAVY, spaceAfter=4),

        "meta": s("mmr_meta",
            fontName="Helvetica", fontSize=9, leading=14,
            textColor=C_MUTED, spaceAfter=2),

        "h2": s("mmr_h2",
            fontName="Helvetica-Bold", fontSize=14, leading=18,
            textColor=C_DARK, spaceBefore=22, spaceAfter=6),

        "h3": s("mmr_h3",
            fontName="Helvetica-Bold", fontSize=11, leading=14,
            textColor=C_MID, spaceBefore=14, spaceAfter=4),

        "h4": s("mmr_h4",
            fontName="Helvetica-BoldOblique", fontSize=10, leading=13,
            textColor=C_MID, spaceBefore=10, spaceAfter=3),

        "body": s("mmr_body",
            fontName="Helvetica", fontSize=9.5, leading=14.5,
            textColor=C_DARK, spaceAfter=6),

        "bullet": s("mmr_bullet",
            fontName="Helvetica", fontSize=9.5, leading=14,
            textColor=C_DARK, leftIndent=14, firstLineIndent=0,
            spaceAfter=2, bulletIndent=4),

        "bullet2": s("mmr_bullet2",
            fontName="Helvetica", fontSize=9, leading=13,
            textColor=C_MID, leftIndent=28, firstLineIndent=0,
            spaceAfter=2, bulletIndent=18),

        "code_inline": s("mmr_code_inline",
            fontName="Courier", fontSize=8.5, leading=12,
            textColor=C_DARK, spaceAfter=6),

        "blockquote": s("mmr_blockquote",
            fontName="Helvetica-Oblique", fontSize=9, leading=13,
            textColor=colors.HexColor("#1e40af"),
            leftIndent=12, spaceAfter=4,
            backColor=C_BLUE_BG),

        "th": s("mmr_th",
            fontName="Helvetica-Bold", fontSize=8.5, leading=11,
            textColor=C_WHITE, alignment=TA_LEFT),

        "td": s("mmr_td",
            fontName="Helvetica", fontSize=8.5, leading=12,
            textColor=C_DARK, alignment=TA_LEFT),

        "td_code": s("mmr_td_code",
            fontName="Courier", fontSize=8, leading=11,
            textColor=C_DARK, alignment=TA_LEFT),

        "pre": s("mmr_pre",
            fontName="Courier", fontSize=8, leading=11.5,
            textColor=C_CODE_FG, backColor=C_CODE_BG,
            leftIndent=10, rightIndent=10, spaceAfter=10,
            spaceBefore=4),
    }


def inline(text, styles):
    """Apply inline formatting: bold, code, italic → ReportLab XML."""
    # Escape XML special chars first (except our markers)
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # Bold+italic
    text = re.sub(r"\*\*\*(.+?)\*\*\*", r"<b><i>\1</i></b>", text)
    # Bold
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    # Italic
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    # Inline code
    text = re.sub(r"`([^`]+)`",
        r'<font name="Courier" size="8" color="#0f172a">\1</font>', text)
    return text


def page_header_footer(canvas, doc):
    canvas.saveState()
    w, h = letter

    # Header rule
    canvas.setStrokeColor(C_BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(0.75*inch, h - 0.55*inch, w - 0.75*inch, h - 0.55*inch)

    # Footer
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(C_LIGHT)
    canvas.drawString(0.75*inch, 0.45*inch, "My Math Roots — V1.1 As-Built Documentation")
    canvas.drawRightString(w - 0.75*inch, 0.45*inch, f"Page {doc.page}")

    canvas.restoreState()


def parse_table(lines):
    """Parse markdown table lines into list-of-lists."""
    rows = []
    for line in lines:
        if re.match(r"^\s*\|[-:| ]+\|\s*$", line):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        rows.append(cells)
    return rows


def build_table_flowable(rows, styles):
    if not rows:
        return None

    header = rows[0]
    data_rows = rows[1:]

    th_style = styles["th"]
    td_style = styles["td"]

    def make_cell(text, style):
        text = inline(text, styles)
        return Paragraph(text, style)

    table_data = [[make_cell(c, th_style) for c in header]]
    for row in data_rows:
        # Pad or trim row to match header length
        while len(row) < len(header):
            row.append("")
        row = row[:len(header)]
        table_data.append([make_cell(c, td_style) for c in row])

    col_count = len(header)
    avail = 6.5 * inch
    col_width = avail / col_count

    t = Table(table_data, colWidths=[col_width] * col_count, repeatRows=1)
    t.setStyle(TableStyle([
        # Header
        ("BACKGROUND",  (0, 0), (-1, 0),  C_DARK),
        ("TEXTCOLOR",   (0, 0), (-1, 0),  C_WHITE),
        ("FONTNAME",    (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",    (0, 0), (-1, 0),  8.5),
        ("TOPPADDING",  (0, 0), (-1, 0),  6),
        ("BOTTOMPADDING",(0,0), (-1, 0),  6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",(0, 0), (-1, -1), 8),
        # Body alternating rows
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C_WHITE, C_SNOW]),
        ("TOPPADDING",  (0, 1), (-1, -1), 5),
        ("BOTTOMPADDING",(0,1), (-1, -1), 5),
        ("VALIGN",      (0, 0), (-1, -1), "TOP"),
        # Grid
        ("LINEBELOW",   (0, 0), (-1, -1), 0.4, C_BORDER),
        ("BOX",         (0, 0), (-1, -1), 0.5, C_BORDER),
    ]))
    return t


def md_to_flowables(md_text, styles):
    flowables = []
    lines = md_text.split("\n")
    i = 0
    in_blockquote_header = False  # first blockquote = meta block

    while i < len(lines):
        line = lines[i]

        # ── Fenced code block ─────────────────────────────
        if line.strip().startswith("```"):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            code_text = "\n".join(code_lines)
            # Escape XML and preserve whitespace
            code_text = (code_text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;"))
            flowables.append(Spacer(1, 4))
            # Wrap in a table for background colour
            code_para = Paragraph(
                f'<font name="Courier" size="7.5" color="#e2e8f0">{code_text}</font>',
                ParagraphStyle("pre_inner",
                    fontName="Courier", fontSize=7.5, leading=11,
                    textColor=C_CODE_FG, backColor=C_CODE_BG,
                    leftIndent=10, rightIndent=10,
                    spaceBefore=6, spaceAfter=6)
            )
            bg_table = Table([[code_para]], colWidths=[6.5*inch])
            bg_table.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,-1), C_CODE_BG),
                ("LEFTPADDING",  (0,0), (-1,-1), 10),
                ("RIGHTPADDING", (0,0), (-1,-1), 10),
                ("TOPPADDING",   (0,0), (-1,-1), 8),
                ("BOTTOMPADDING",(0,0), (-1,-1), 8),
                ("ROUNDEDCORNERS", [4]),
            ]))
            flowables.append(bg_table)
            flowables.append(Spacer(1, 4))
            i += 1
            continue

        # ── Markdown table ────────────────────────────────
        if line.strip().startswith("|"):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i])
                i += 1
            rows = parse_table(table_lines)
            if rows:
                t = build_table_flowable(rows, styles)
                if t:
                    flowables.append(Spacer(1, 4))
                    flowables.append(t)
                    flowables.append(Spacer(1, 8))
            continue

        # ── Horizontal rule ───────────────────────────────
        if re.match(r"^-{3,}\s*$", line) or re.match(r"^\*{3,}\s*$", line):
            flowables.append(Spacer(1, 6))
            flowables.append(HRFlowable(width="100%", thickness=0.5,
                                        color=C_BORDER, spaceAfter=6))
            i += 1
            continue

        # ── Blockquote ────────────────────────────────────
        if line.startswith(">"):
            bq_lines = []
            while i < len(lines) and lines[i].startswith(">"):
                bq_lines.append(lines[i].lstrip("> ").strip())
                i += 1
            bq_text = " ".join(bq_lines)
            bq_text = inline(bq_text, styles)
            # First blockquote = meta/status block
            bq_para = Paragraph(bq_text, styles["blockquote"])
            bg_table = Table([[bq_para]], colWidths=[6.5*inch])
            bg_table.setStyle(TableStyle([
                ("BACKGROUND",   (0,0), (-1,-1), C_BLUE_BG),
                ("LEFTPADDING",  (0,0), (-1,-1), 12),
                ("RIGHTPADDING", (0,0), (-1,-1), 12),
                ("TOPPADDING",   (0,0), (-1,-1), 8),
                ("BOTTOMPADDING",(0,0), (-1,-1), 8),
                ("LINEBEFORE",   (0,0), (0,-1),  3, C_BLUE),
            ]))
            flowables.append(bg_table)
            flowables.append(Spacer(1, 6))
            continue

        # ── H1 ────────────────────────────────────────────
        if line.startswith("# ") and not line.startswith("## "):
            text = inline(line[2:].strip(), styles)
            flowables.append(Paragraph(text, styles["title"]))
            flowables.append(HRFlowable(width="100%", thickness=2,
                                        color=C_BLUE, spaceAfter=10))
            i += 1
            continue

        # ── H2 ────────────────────────────────────────────
        if line.startswith("## ") and not line.startswith("### "):
            text = inline(line[3:].strip(), styles)
            flowables.append(Spacer(1, 4))
            flowables.append(Paragraph(text, styles["h2"]))
            flowables.append(HRFlowable(width="100%", thickness=0.5,
                                        color=C_BORDER, spaceAfter=4))
            i += 1
            continue

        # ── H3 ────────────────────────────────────────────
        if line.startswith("### "):
            text = inline(line[4:].strip(), styles)
            flowables.append(Paragraph(text, styles["h3"]))
            i += 1
            continue

        # ── H4 ────────────────────────────────────────────
        if line.startswith("#### "):
            text = inline(line[5:].strip(), styles)
            flowables.append(Paragraph(text, styles["h4"]))
            i += 1
            continue

        # ── Bullet list ───────────────────────────────────
        if re.match(r"^(\s*)[-*] ", line):
            indent = len(line) - len(line.lstrip())
            style = styles["bullet2"] if indent >= 2 else styles["bullet"]
            text = inline(re.sub(r"^\s*[-*] ", "", line), styles)
            flowables.append(Paragraph(f"\u2022\u00a0{text}", style))
            i += 1
            continue

        # ── Numbered list ─────────────────────────────────
        if re.match(r"^\d+\. ", line):
            m = re.match(r"^(\d+)\. (.+)", line)
            if m:
                text = inline(m.group(2), styles)
                flowables.append(Paragraph(
                    f"<b>{m.group(1)}.</b>\u00a0{text}",
                    styles["bullet"]))
            i += 1
            continue

        # ── Blank line ────────────────────────────────────
        if line.strip() == "":
            flowables.append(Spacer(1, 4))
            i += 1
            continue

        # ── Body paragraph ────────────────────────────────
        text = inline(line.strip(), styles)
        if text:
            flowables.append(Paragraph(text, styles["body"]))
        i += 1

    return flowables


def build():
    print(f"Reading {MD_FILE}...")
    with open(MD_FILE, "r", encoding="utf-8") as f:
        md_text = f.read()

    styles = build_styles()

    print("Parsing markdown...")
    flowables = md_to_flowables(md_text, styles)

    print(f"Rendering PDF to {PDF_FILE}...")
    doc = SimpleDocTemplate(
        PDF_FILE,
        pagesize=letter,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch,
        topMargin=0.85*inch,
        bottomMargin=0.75*inch,
        title="My Math Roots — V1.1 As-Built Documentation",
        author="My Math Roots",
    )
    doc.build(flowables, onFirstPage=page_header_footer,
              onLaterPages=page_header_footer)

    size_kb = os.path.getsize(PDF_FILE) // 1024
    print(f"Done! {PDF_FILE} ({size_kb} KB)")


if __name__ == "__main__":
    build()
