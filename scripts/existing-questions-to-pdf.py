#!/usr/bin/env python3
"""
Generate a PDF of all EXISTING questions from src/data/u*.js files.
Parses the _mergeUnitData() calls to extract qBank, testBank, and unitQuiz arrays.
"""

import json
import os
import re
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
)

# --- Config ---
DATA_DIR = Path(__file__).parent.parent / "src" / "data"
OUTPUT_PDF = Path(__file__).parent.parent / "My_Math_Roots_Existing_Questions.pdf"

UNIT_NAMES = {
    1: "Basic Fact Strategies",
    2: "Place Value",
    3: "Add & Subtract to 200",
    4: "Subtraction",
    5: "Money",
    6: "Data & Graphs",
    7: "Measurement & Time",
    8: "Fractions",
    9: "Geometry",
    10: "Multiplication & Division",
}

LESSON_NAMES = {
    1: ["Count Up & Count Back", "Doubles!", "Make a 10", "Number Families"],
    2: ["Big Numbers", "Different Ways to Write Numbers", "Bigger or Smaller?", "Skip Counting"],
    3: ["Adding Bigger Numbers", "Taking Away Bigger Numbers", "Add Three Numbers", "Word Problems"],
    4: ["Subtract Without Regrouping", "Subtract With Regrouping", "Check Your Work", "Subtraction Word Problems"],
    5: ["Know Your Coins", "Count Your Money", "Dollar Signs & Decimal Points", "Making Change"],
    6: ["Tally Charts & Bar Graphs", "Pictographs", "Read and Answer Questions", "Line Plots"],
    7: ["How Long Is It?", "What Time Is It?", "Hot, Cold and Full"],
    8: ["What is a Fraction?", "Halves, Fourths and Eighths", "Which Piece is Bigger?"],
    9: ["Flat Shapes", "Solid Shapes", "Mirror Shapes"],
    10: ["Equal Groups", "Adding the Same Number", "Sharing Equally"],
}


def extract_unit_data(filepath):
    """
    Parse a u*.js file and extract the JSON data object from _mergeUnitData(N, {...}).
    Returns (unit_index, data_dict) or (None, None) on failure.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find _mergeUnitData(N, {....})
    # The data is everything between the first { after _mergeUnitData(N, and the last )
    m = re.search(r'_mergeUnitData\s*\(\s*(\d+)\s*,\s*', content)
    if not m:
        print(f"  WARNING: Could not find _mergeUnitData in {filepath.name}")
        return None, None

    unit_idx = int(m.group(1))
    json_start = content.index('{', m.end() - 1)

    # Find matching closing brace by counting braces
    depth = 0
    json_end = json_start
    for i in range(json_start, len(content)):
        if content[i] == '{':
            depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0:
                json_end = i + 1
                break

    json_str = content[json_start:json_end]

    # The JSON uses unquoted keys and single quotes in some places.
    # We need to handle JS object notation -> JSON.
    # Strategy: Use a Node.js one-liner to parse it safely.
    import subprocess
    import tempfile

    # Write the JS to a temp file and use Node to convert to JSON
    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8')
    tmp.write(f"process.stdout.write(JSON.stringify({json_str}))")
    tmp.close()

    try:
        result = subprocess.run(
            ["node", tmp.name],
            capture_output=True, text=True, timeout=30,
            encoding='utf-8'
        )
        if result.returncode != 0:
            print(f"  WARNING: Node parse failed for {filepath.name}: {result.stderr[:200]}")
            return unit_idx, None
        data = json.loads(result.stdout)
        return unit_idx, data
    except Exception as e:
        print(f"  WARNING: Parse error for {filepath.name}: {e}")
        return unit_idx, None
    finally:
        os.unlink(tmp.name)


def sanitize(text):
    """Remove HTML/SVG tags and escape XML entities for reportlab."""
    if not text:
        return ""
    # Remove SVG blocks
    text = re.sub(r'<svg[^>]*>.*?</svg>', '[image]', text, flags=re.DOTALL)
    # Remove HTML tags but keep content
    text = re.sub(r'<br\s*/?>', ' ', text)
    text = re.sub(r'<[^>]+>', '', text)
    # Escape XML entities for reportlab
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def build_pdf():
    styles = getSampleStyleSheet()

    # Custom styles
    styles.add(ParagraphStyle(
        name="UnitTitle",
        parent=styles["Heading1"],
        fontSize=18,
        spaceAfter=6,
        textColor=HexColor("#1565C0"),
        borderWidth=1,
        borderColor=HexColor("#1565C0"),
        borderPadding=6,
    ))
    styles.add(ParagraphStyle(
        name="LessonTitle",
        parent=styles["Heading2"],
        fontSize=14,
        spaceAfter=4,
        textColor=HexColor("#37474F"),
    ))
    styles.add(ParagraphStyle(
        name="SectionHeader",
        parent=styles["Heading3"],
        fontSize=12,
        spaceAfter=4,
        textColor=HexColor("#6A1B9A"),
    ))
    styles.add(ParagraphStyle(
        name="QuestionText",
        parent=styles["Normal"],
        fontSize=10,
        leading=13,
        spaceBefore=6,
        spaceAfter=2,
        leftIndent=12,
    ))
    styles.add(ParagraphStyle(
        name="ChoiceText",
        parent=styles["Normal"],
        fontSize=9,
        leading=11,
        leftIndent=30,
        textColor=HexColor("#424242"),
    ))
    styles.add(ParagraphStyle(
        name="AnswerText",
        parent=styles["Normal"],
        fontSize=9,
        leading=11,
        leftIndent=30,
        textColor=HexColor("#1B5E20"),
    ))
    styles.add(ParagraphStyle(
        name="ExplanationText",
        parent=styles["Normal"],
        fontSize=8,
        leading=10,
        leftIndent=30,
        textColor=HexColor("#616161"),
        fontName="Helvetica-Oblique",
    ))
    styles.add(ParagraphStyle(
        name="TOCEntry",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        leftIndent=20,
    ))
    styles.add(ParagraphStyle(
        name="StatsText",
        parent=styles["Normal"],
        fontSize=10,
        leading=13,
        alignment=TA_CENTER,
    ))

    # Parse all unit files
    print("Parsing unit data files...")
    all_units = {}
    for unit_n in range(1, 11):
        fpath = DATA_DIR / f"u{unit_n}.js"
        if not fpath.exists():
            print(f"  Skipping u{unit_n}.js (not found)")
            continue
        print(f"  Parsing u{unit_n}.js...")
        idx, data = extract_unit_data(fpath)
        if data:
            all_units[unit_n] = data

    if not all_units:
        print("ERROR: No unit data could be parsed.")
        return

    # Count totals
    total_q = 0
    unit_stats = {}
    for unit_n, data in sorted(all_units.items()):
        lessons = data.get("lessons", [])
        unit_count = 0
        lesson_counts = []
        for i, lesson in enumerate(lessons):
            qbank = lesson.get("qBank", [])
            lesson_counts.append(len(qbank))
            unit_count += len(qbank)
        tb = data.get("testBank", [])
        uq = data.get("unitQuiz", [])
        unit_count += len(tb) + len(uq)
        unit_stats[unit_n] = {
            "lesson_counts": lesson_counts,
            "testBank": len(tb),
            "unitQuiz": len(uq),
            "total": unit_count
        }
        total_q += unit_count

    # Build document
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
    )

    story = []

    # --- Cover page ---
    story.append(Spacer(1, 2 * inch))
    story.append(Paragraph("My Math Roots", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Existing Question Bank", styles["Heading2"]))
    story.append(Spacer(1, 24))
    story.append(Paragraph(f"<b>{total_q}</b> Questions across <b>{len(all_units)}</b> Units", styles["StatsText"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Grade 2 | Texas TEKS Aligned", styles["StatsText"]))
    story.append(PageBreak())

    # --- Table of Contents ---
    story.append(Paragraph("Table of Contents", styles["Title"]))
    story.append(Spacer(1, 12))
    for unit_n in sorted(all_units.keys()):
        unit_name = UNIT_NAMES.get(unit_n, f"Unit {unit_n}")
        stats = unit_stats[unit_n]
        story.append(Paragraph(
            f"<b>Unit {unit_n}: {unit_name}</b> ({stats['total']} questions)",
            styles["TOCEntry"]
        ))
        lesson_names = LESSON_NAMES.get(unit_n, [])
        for i, count in enumerate(stats["lesson_counts"]):
            lname = lesson_names[i] if i < len(lesson_names) else f"Lesson {i+1}"
            story.append(Paragraph(
                f"&nbsp;&nbsp;&nbsp;&nbsp;Lesson {i+1}: {lname} — qBank ({count} questions)",
                styles["TOCEntry"]
            ))
        if stats["testBank"] > 0:
            story.append(Paragraph(
                f"&nbsp;&nbsp;&nbsp;&nbsp;Test Bank ({stats['testBank']} questions)",
                styles["TOCEntry"]
            ))
        if stats["unitQuiz"] > 0:
            story.append(Paragraph(
                f"&nbsp;&nbsp;&nbsp;&nbsp;Unit Quiz ({stats['unitQuiz']} questions)",
                styles["TOCEntry"]
            ))
    story.append(PageBreak())

    # --- Questions ---
    def render_questions(questions, story, styles):
        """Render a list of question objects into the story."""
        for i, q in enumerate(questions, 1):
            q_elements = []

            q_text = sanitize(q.get("t", "???"))
            q_elements.append(Paragraph(f"<b>{i}.</b> {q_text}", styles["QuestionText"]))

            correct_idx = q.get("a", -1)
            options = q.get("o", [])
            choice_labels = ["A", "B", "C", "D"]
            for j, opt in enumerate(options):
                opt_text = sanitize(str(opt))
                if j == correct_idx:
                    q_elements.append(Paragraph(
                        f"<b>{choice_labels[j]}. {opt_text}</b>  &#10004;",
                        styles["AnswerText"]
                    ))
                else:
                    q_elements.append(Paragraph(
                        f"{choice_labels[j]}. {opt_text}",
                        styles["ChoiceText"]
                    ))

            explanation = sanitize(q.get("e", ""))
            if explanation:
                q_elements.append(Paragraph(f"Explanation: {explanation}", styles["ExplanationText"]))

            q_elements.append(Spacer(1, 4))
            story.append(KeepTogether(q_elements))

    for unit_n in sorted(all_units.keys()):
        unit_name = UNIT_NAMES.get(unit_n, f"Unit {unit_n}")
        data = all_units[unit_n]

        story.append(Paragraph(f"Unit {unit_n}: {unit_name}", styles["UnitTitle"]))
        story.append(Spacer(1, 8))

        lessons = data.get("lessons", [])
        lesson_names = LESSON_NAMES.get(unit_n, [])

        for i, lesson in enumerate(lessons):
            lname = lesson_names[i] if i < len(lesson_names) else f"Lesson {i+1}"
            qbank = lesson.get("qBank", [])
            if not qbank:
                continue

            story.append(Paragraph(f"Lesson {i+1}: {lname}", styles["LessonTitle"]))
            story.append(Paragraph(f"Question Bank ({len(qbank)} questions)", styles["SectionHeader"]))
            render_questions(qbank, story, styles)
            story.append(Spacer(1, 8))

        # Test Bank
        tb = data.get("testBank", [])
        if tb:
            story.append(Paragraph("Test Bank", styles["LessonTitle"]))
            story.append(Paragraph(f"{len(tb)} questions", styles["SectionHeader"]))
            render_questions(tb, story, styles)
            story.append(Spacer(1, 8))

        # Unit Quiz
        uq = data.get("unitQuiz", [])
        if uq:
            story.append(Paragraph("Unit Quiz", styles["LessonTitle"]))
            story.append(Paragraph(f"{len(uq)} questions", styles["SectionHeader"]))
            render_questions(uq, story, styles)
            story.append(Spacer(1, 8))

        story.append(PageBreak())

    # Build
    print(f"Building PDF...")
    doc.build(story)
    print(f"PDF created: {OUTPUT_PDF}")
    print(f"Total questions: {total_q}")


if __name__ == "__main__":
    build_pdf()
