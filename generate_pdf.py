"""
Maya Portfolio — Frontend Technical Presentation PDF Generator
Generates a polished, multi-page landscape A4 PDF with all frontend specs.
"""

import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, Color, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.pdfgen import canvas as pdfcanvas

# ── Config ─────────────────────────────────────────────────
PAGE_W, PAGE_H = landscape(A4)
MARGIN = 20 * mm
IMG_DIR = os.path.join(os.path.dirname(__file__), "assets", "images")
OUT_PDF = os.path.join(os.path.dirname(__file__), "Maya_Portfolio_Technical_Presentation.pdf")

# ── Colors ─────────────────────────────────────────────────
BG         = HexColor("#0B0B0D")
BG_CARD    = HexColor("#151518")
SURFACE    = HexColor("#1A1A1F")
ACCENT     = HexColor("#C8102E")
TXT_PRI    = HexColor("#FFFFFF")
TXT_SEC    = HexColor("#8E8E93")
TXT_TER    = HexColor("#4D4D52")
BORDER     = HexColor("#222228")
CODE_BG    = HexColor("#1C1C22")
CODE_TXT   = HexColor("#E8B4B8")


# ── Custom page drawing (background + accent line) ────────
class PDFWithBackground(pdfcanvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._page_number = 0

    def showPage(self):
        self._page_number += 1
        super().showPage()

def on_page(canvas, doc):
    canvas.saveState()
    # Dark background
    canvas.setFillColor(BG)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # Accent strip top
    canvas.setFillColor(ACCENT)
    canvas.rect(0, PAGE_H - 2.5 * mm, PAGE_W * 0.3, 2.5 * mm, fill=1, stroke=0)
    # Page number
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(TXT_TER)
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 12 * mm, f"{doc.page}")
    canvas.restoreState()

def on_first_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BG)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # Subtle radial glow for cover
    canvas.setFillColor(HexColor("#1A0508"))
    canvas.circle(PAGE_W / 2, PAGE_H * 0.55, 180 * mm, fill=1, stroke=0)
    canvas.setFillColor(BG)
    canvas.circle(PAGE_W / 2, PAGE_H * 0.55, 140 * mm, fill=1, stroke=0)
    canvas.restoreState()


# ── Styles ─────────────────────────────────────────────────
styles = getSampleStyleSheet()

def make_style(name, **kwargs):
    defaults = dict(fontName="Helvetica", fontSize=9, leading=13, textColor=TXT_SEC, alignment=TA_LEFT)
    defaults.update(kwargs)
    return ParagraphStyle(name, **defaults)

S_TITLE     = make_style("STitle",    fontName="Helvetica-Bold", fontSize=28, leading=32, textColor=TXT_PRI)
S_TITLE_SM  = make_style("STitleSm",  fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=TXT_PRI)
S_SUBTITLE  = make_style("SSub",      fontSize=9, leading=13, textColor=TXT_TER, spaceAfter=18)
S_LABEL     = make_style("SLabel",    fontName="Helvetica-Bold", fontSize=7.5, leading=10, textColor=ACCENT)
S_H3        = make_style("SH3",       fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=TXT_PRI)
S_BODY      = make_style("SBody",     fontSize=8.5, leading=12.5, textColor=TXT_SEC)
S_CODE      = make_style("SCode",     fontName="Courier", fontSize=7.5, leading=10, textColor=CODE_TXT)
S_COVER_T   = make_style("SCoverT",   fontName="Helvetica-Bold", fontSize=36, leading=42, textColor=TXT_PRI, alignment=TA_CENTER)
S_COVER_SUB = make_style("SCoverSub", fontSize=10, leading=14, textColor=TXT_TER, alignment=TA_CENTER)
S_COVER_LBL = make_style("SCoverLbl", fontName="Helvetica-Oblique", fontSize=12, leading=16, textColor=TXT_SEC, alignment=TA_CENTER)
S_CENTER    = make_style("SCenter",   fontSize=8.5, leading=12, textColor=TXT_SEC, alignment=TA_CENTER)
S_BULLET    = make_style("SBullet",   fontSize=8.5, leading=12.5, textColor=TXT_SEC, leftIndent=12, bulletIndent=0)
S_TABLE_H   = make_style("STabH",     fontName="Helvetica-Bold", fontSize=7, leading=9, textColor=TXT_TER)
S_TABLE_D   = make_style("STabD",     fontSize=8, leading=11, textColor=TXT_SEC)
S_TABLE_B   = make_style("STabB",     fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=TXT_PRI)
S_CAPTION   = make_style("SCaption",  fontName="Helvetica-Oblique", fontSize=7, leading=9, textColor=TXT_TER, alignment=TA_CENTER)


# ── Helpers ────────────────────────────────────────────────
def accent(text):
    return f'<font color="#C8102E">{text}</font>'

def bold(text):
    return f'<font color="#FFFFFF"><b>{text}</b></font>'

def code(text):
    return f'<font face="Courier" color="#E8B4B8" backColor="#1C1C22">&nbsp;{text}&nbsp;</font>'

def bullet_list(items):
    """Return list of Paragraph elements with arrow bullets."""
    result = []
    for item in items:
        result.append(Paragraph(f'<font color="#C8102E"><b>→</b></font>&nbsp; {item}', S_BULLET))
    return result

def data_table(headers, rows, col_widths=None):
    """Create a styled table."""
    data = [[Paragraph(h, S_TABLE_H) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), S_TABLE_D if i > 0 else S_TABLE_B) for i, c in enumerate(row)])

    if col_widths is None:
        col_widths = [None] * len(headers)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, 0), SURFACE),
        ('BACKGROUND',   (0, 1), (-1, -1), BG_CARD),
        ('TEXTCOLOR',    (0, 0), (-1, -1), TXT_SEC),
        ('ALIGN',        (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN',       (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING',   (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 5),
        ('LEFTPADDING',  (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW',    (0, 0), (-1, -2), 0.5, BORDER),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    return t

def two_column(left_items, right_items, ratio=0.5):
    """Side-by-side layout."""
    usable = PAGE_W - 2 * MARGIN - 10 * mm
    lw = usable * ratio
    rw = usable * (1 - ratio)

    left_table = Table([[item] for item in left_items], colWidths=[lw])
    left_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))

    right_table = Table([[item] for item in right_items], colWidths=[rw])
    right_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))

    wrapper = Table([[left_table, right_table]], colWidths=[lw, rw])
    wrapper.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    return wrapper

def info_card_content(label, title, body_items):
    """Build a list of flowables for a card-like section."""
    items = []
    items.append(Paragraph(label.upper(), S_LABEL))
    items.append(Spacer(1, 2 * mm))
    items.append(Paragraph(title, S_H3))
    items.append(Spacer(1, 2 * mm))
    for b in body_items:
        if isinstance(b, str):
            items.append(Paragraph(b, S_BODY))
        else:
            items.append(b)
    items.append(Spacer(1, 4 * mm))
    return items

def safe_img(filename, width, height=None):
    """Return an Image if the file exists, else a placeholder text."""
    path = os.path.join(IMG_DIR, filename)
    if os.path.exists(path):
        if height:
            return Image(path, width=width, height=height)
        return Image(path, width=width, height=width * 0.5)
    return Paragraph(f"[Image: {filename}]", S_CENTER)


# ═══════════════════════════════════════════════════════════
# BUILD PDF
# ═══════════════════════════════════════════════════════════
def build():
    doc = SimpleDocTemplate(
        OUT_PDF,
        pagesize=landscape(A4),
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=16 * mm, bottomMargin=12 * mm,
    )

    story = []
    usable_w = PAGE_W - 2 * MARGIN

    # ═══════════════ SLIDE 1: COVER ═══════════════════════
    story.append(Spacer(1, 55 * mm))
    story.append(Paragraph("Frontend Technical Presentation", S_COVER_LBL))
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("Maya — Product Designer", S_COVER_T))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("CINEMATIC PORTFOLIO WEBSITE · INTERFACE &amp; TECHNICAL BREAKDOWN", S_COVER_SUB))
    story.append(Spacer(1, 20 * mm))
    story.append(Paragraph(
        "HTML5 · Vanilla CSS · JavaScript ES6+ · Three.js · GSAP ScrollTrigger · Custom GLSL Shaders",
        make_style("tech", fontSize=8, textColor=TXT_TER, alignment=TA_CENTER)
    ))
    story.append(PageBreak())

    # ═══════════════ SLIDE 2: INTERFACE OVERVIEW ══════════
    story.append(Paragraph("Interface Overview", S_TITLE))
    story.append(Paragraph("SECTION-BY-SECTION LAYOUT ARCHITECTURE", S_SUBTITLE))

    left = []
    left += info_card_content("① Loading Screen", "Preload Experience",
        [f"Full-viewport overlay with centred progress bar. Tracks 190-frame image sequence load. Fades out with {code('opacity 0.6s ease-out-expo')} transition on completion."])
    left += info_card_content("② Hero Section", "Scrollytelling Canvas",
        [f"Full-viewport {code('&lt;canvas&gt;')} with WebGL shader rendering. Text anchored to bottom via {code('justify-content: flex-end')}. Pinned for 1.5× viewport scroll via GSAP ScrollTrigger. Text fades out at 60% scroll."])
    left += info_card_content("③ Fixed Header", "Minimal Navigation",
        [f"72px height, fixed position, {code('mix-blend-mode: difference')} for text legibility. Logo left, \"Work\" + \"Get in touch\" pill button right."])

    right = []
    right += info_card_content("④ Selected Work", "2-Column Project Grid",
        [f"CSS Grid {code('repeat(2, 1fr)')} with 1.5rem gap. 4 project cards with hover image zoom {code('scale(1.08)')}. GSAP stagger entrance (0.15s delay)."])
    right += info_card_content("⑤ Footer", "CTA & Contact",
        [f"Headline tagline with {code('clamp(1.5rem, 3.5vw, 2.8rem)')} fluid sizing. Accent-coloured email link. Social links row."])
    right += info_card_content("Layout System", "Core Layout Specs", [])
    right += bullet_list([
        f"{bold('Max Width:')} 1440px centred container",
        f"{bold('Gutter:')} {code('clamp(1rem, 3vw, 2.5rem)')}",
        f"{bold('Box Model:')} {code('box-sizing: border-box')} global reset",
        f"{bold('Overflow:')} {code('overflow-x: hidden')} on body",
    ])

    story.append(two_column(left, right))
    story.append(PageBreak())

    # ═══════════════ SLIDE 3: HERO SECTION ════════════════
    story.append(Paragraph("Hero Section", S_TITLE))
    story.append(Paragraph("FULL-VIEWPORT CINEMATIC CANVAS WITH GROUNDED EDITORIAL TYPOGRAPHY", S_SUBTITLE))

    story.append(safe_img("screenshot-hero.png", usable_w * 0.88, usable_w * 0.32))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph(
        '"Hey, I\'m a" (Crimson Pro Italic) + "PRODUCT DESIGNER" (Inter 900) + Services grid with accent markers',
        S_CAPTION))
    story.append(Spacer(1, 6 * mm))

    hero_data = [
        ["FEATURE", "SPECIFICATION"],
        ["Canvas Size", "100vw × 100vh (fullscreen WebGL)"],
        ["Pin Duration", "end: +=150%  (1.5× viewport height)"],
        ["Scrub Lag", "0.6 seconds smooth interpolation"],
        ["Text Fade", "Hero overlay → opacity 0 at 60% scroll"],
        ["Entrance Anim", "fadeUp keyframe: 0.3s / 0.5s / 0.7s stagger"],
        ["Text Anchor", "justify-content: flex-end (viewport bottom)"],
    ]
    story.append(data_table(hero_data[0], hero_data[1:], col_widths=[usable_w * 0.28, usable_w * 0.72]))
    story.append(PageBreak())

    # ═══════════════ SLIDE 4: WORK GRID & FOOTER ═════════
    story.append(Paragraph("Selected Work &amp; Footer", S_TITLE))
    story.append(Paragraph("2-COLUMN PROJECT GRID WITH HOVER INTERACTIONS + EDITORIAL FOOTER", S_SUBTITLE))

    # Two images side by side
    img_w = usable_w * 0.47
    img_grid = Table([
        [safe_img("screenshot-grid.png", img_w, img_w * 0.4),
         safe_img("screenshot-footer.png", img_w, img_w * 0.4)],
        [Paragraph("Project grid — Transcendence, Notice Everything, Saint Petersburg, Bridging the Gap", S_CAPTION),
         Paragraph("Footer CTA tagline + accent email + social links bar", S_CAPTION)]
    ], colWidths=[img_w + 5*mm, img_w + 5*mm])
    img_grid.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(img_grid)
    story.append(Spacer(1, 5 * mm))

    interaction_data = [
        ["INTERACTION", "CSS VALUE", "DETAILS"],
        ["Image Hover Zoom", code("transform: scale(1.08)"), "0.8s ease-out-expo, image only (container clips overflow)"],
        ["Arrow Button", code("background: #C8102E"), "36×36px circle fills accent + rotates −45° on hover"],
        ["Card Border", code("rgba(255,255,255,0.06)"), "1px border → 0.12 opacity on hover, 16px radius"],
        ["Card Background", code("#151518"), "Subtle elevation above #0B0B0D page background"],
        ["Image Aspect", code("aspect-ratio: 4/3"), "CSS aspect-ratio with object-fit: cover"],
        ["GPU Hint", code("will-change: transform"), "Promotes layer for smooth hover animation"],
    ]
    story.append(data_table(interaction_data[0], interaction_data[1:],
        col_widths=[usable_w * 0.2, usable_w * 0.35, usable_w * 0.45]))
    story.append(PageBreak())

    # ═══════════════ SLIDE 5: TYPOGRAPHY ══════════════════
    story.append(Paragraph("Typography System", S_TITLE))
    story.append(Paragraph("TWO-FONT PAIRING — FUNCTIONAL SANS + EDITORIAL SERIF", S_SUBTITLE))

    left_typo = []
    left_typo.append(Paragraph(accent("PRIMARY — UI FONT"), S_LABEL))
    left_typo.append(Spacer(1, 2*mm))
    left_typo.append(Paragraph("Inter", make_style("f1", fontName="Helvetica-Bold", fontSize=26, leading=30, textColor=TXT_PRI)))
    left_typo.append(Spacer(1, 2*mm))
    left_typo.append(Paragraph("Weights: 300 · 400 · 500 · 600 · 700 · 800 · <b>900</b>", S_BODY))
    left_typo.append(Paragraph("Usage: All UI text, headings, navigation, body copy", S_BODY))
    left_typo.append(Spacer(1, 6*mm))

    right_typo = []
    right_typo.append(Paragraph(accent("ACCENT — SERIF"), S_LABEL))
    right_typo.append(Spacer(1, 2*mm))
    right_typo.append(Paragraph("<i>Crimson Pro</i>", make_style("f2", fontName="Helvetica-Oblique", fontSize=26, leading=30, textColor=TXT_PRI)))
    right_typo.append(Spacer(1, 2*mm))
    right_typo.append(Paragraph("Weights: 400 Italic · 600 Italic", S_BODY))
    right_typo.append(Paragraph('Usage: Hero subtitle "Hey, I\'m a" — always italic', S_BODY))
    right_typo.append(Spacer(1, 6*mm))

    story.append(two_column(left_typo, right_typo))
    story.append(Spacer(1, 4 * mm))

    story.append(Paragraph(accent("COMPLETE FONT SIZE SCALE"), S_LABEL))
    story.append(Spacer(1, 3 * mm))

    font_data = [
        ["ELEMENT", "FONT", "SIZE", "WEIGHT", "LETTER-SP", "LINE-H", "EXTRAS"],
        ["Hero Title",      "Inter",       code("clamp(2.8rem, 8vw, 7.5rem)"), "900", "−0.04em", "0.95", "uppercase"],
        ["Hero Subtitle",   "Crimson Pro", code("clamp(1rem, 2vw, 1.5rem)"),   "400i", "normal", "1.2",  "italic"],
        ["Section Title",   "Inter",       code("clamp(1.8rem, 4vw, 3rem)"),   "800", "−0.03em", "—",    "—"],
        ["Footer Tagline",  "Inter",       code("clamp(1.5rem, 3.5vw, 2.8rem)"),"800","−0.03em", "1.15", "max-w: 600px"],
        ["Card Title",      "Inter",       code("clamp(1rem, 1.8vw, 1.35rem)"),"700", "−0.02em", "1.3",  "—"],
        ["Logo",            "Inter",       code("1.25rem") + " (20px)",         "700", "−0.02em", "—",    "—"],
        ["Nav Links",       "Inter",       code("0.85rem") + " (13.6px)",       "500", "0.02em",  "—",    "—"],
        ["Service Items",   "Inter",       code("0.8rem") + " (12.8px)",        "400", "0.02em",  "—",    "nowrap"],
        ["Card Category",   "Inter",       code("0.75rem") + " (12px)",         "400", "0.04em",  "—",    "uppercase"],
        ["Loader Text",     "Inter",       code("0.75rem") + " (12px)",         "400", "0.15em",  "—",    "uppercase"],
        ["Footer / Socials","Inter",       code("0.8rem") + " (12.8px)",        "400", "normal",  "—",    "—"],
    ]
    cw = [usable_w*0.14, usable_w*0.1, usable_w*0.26, usable_w*0.07, usable_w*0.1, usable_w*0.07, usable_w*0.12]
    story.append(data_table(font_data[0], font_data[1:], col_widths=cw))
    story.append(PageBreak())

    # ═══════════════ SLIDE 6: COLOR THEME ═════════════════
    story.append(Paragraph("Color Theme", S_TITLE))
    story.append(Paragraph("DARK MODE EDITORIAL — CSS CUSTOM PROPERTIES (DESIGN TOKENS)", S_SUBTITLE))

    story.append(Paragraph(accent("CORE PALETTE"), S_LABEL))
    story.append(Spacer(1, 3*mm))

    swatch_data = [
        ["TOKEN", "HEX VALUE", "USAGE"],
        [code("--bg"),          "#0B0B0D",  "Page background, loader, work section, footer"],
        [code("--bg-elevated"), "#111114",  "Subtle elevation for nested elements"],
        [code("--bg-card"),     "#151518",  "Project card backgrounds"],
        [code("--surface"),     "#1A1A1F",  "Loader bar track, subtle surfaces"],
        [code("--accent"),      "#C8102E",  "Service dots, arrow hover, email link, loader bar fill"],
        [code("--text-primary"),"#FFFFFF",  "Headings, titles, primary content"],
    ]
    story.append(data_table(swatch_data[0], swatch_data[1:],
        col_widths=[usable_w*0.22, usable_w*0.13, usable_w*0.65]))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(accent("ALPHA / OPACITY VALUES"), S_LABEL))
    story.append(Spacer(1, 3*mm))

    alpha_data = [
        ["TOKEN", "VALUE", "USAGE"],
        [code("--text-secondary"),  code("rgba(255,255,255,0.55)"), "Subtitle, nav links, services, card categories"],
        [code("--text-tertiary"),   code("rgba(255,255,255,0.3)"),  "Work count \"(04)\", footer copyright"],
        [code("--border"),          code("rgba(255,255,255,0.06)"), "Card borders, footer divider, arrow button"],
        [code("--border-hover"),    code("rgba(255,255,255,0.12)"), "Card hover state, pill button border"],
        [code("--accent-glow"),     code("rgba(200,16,46,0.25)"),  "Reserved for accent highlights / glows"],
    ]
    story.append(data_table(alpha_data[0], alpha_data[1:],
        col_widths=[usable_w*0.22, usable_w*0.3, usable_w*0.48]))
    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(accent("ADDITIONAL RENDERING"), S_LABEL))
    story.append(Spacer(1, 3*mm))
    story += bullet_list([
        f"{bold('Font Smoothing:')} {code('-webkit-font-smoothing: antialiased')} + {code('-moz-osx-font-smoothing: grayscale')}",
        f"{bold('WebGL Clear Color:')} {code('0x0B0B0D')} — matches CSS background seamlessly",
        f"{bold('Header Blend:')} {code('mix-blend-mode: difference')} — ensures text always visible over canvas",
    ])
    story.append(PageBreak())

    # ═══════════════ SLIDE 7: IMAGE FRAMES & ASPECT RATIOS ═
    story.append(Paragraph("Image Frames &amp; Aspect Ratios", S_TITLE))
    story.append(Paragraph("ALL IMAGE DIMENSIONS, FORMATS, AND RENDERING METHODS", S_SUBTITLE))

    left_img = []
    left_img.append(Paragraph(accent("HERO SEQUENCE FRAMES"), S_LABEL))
    left_img.append(Spacer(1, 2*mm))
    left_img.append(Paragraph("190 JPG Frames — Mouth Tunnel", S_H3))
    left_img.append(Spacer(1, 3*mm))
    seq_data = [
        ["PROPERTY", "VALUE"],
        ["Total Frames",   "190"],
        ["Format",         "JPEG (.jpg)"],
        ["Naming",         code("ezgif-frame-001.jpg") + " → " + code("ezgif-frame-190.jpg")],
        ["Path",           code("./Model image/")],
        ["Zero Padding",   "3 digits"],
        ["Display Size",   "100vw × 100vh (fullscreen canvas)"],
        ["Rendering",      "WebGL Texture on PlaneGeometry(2,2)"],
        ["Texture Filter", code("THREE.LinearFilter") + " (min + mag)"],
        ["Pixel Ratio",    code("Math.min(devicePixelRatio, 2)")],
    ]
    left_img.append(data_table(seq_data[0], seq_data[1:], col_widths=[usable_w*0.18, usable_w*0.3]))
    left_img.append(Spacer(1, 4*mm))
    left_img.append(Paragraph(accent("TEXTURE MEMORY — LRU CACHE"), S_LABEL))
    left_img.append(Spacer(1, 2*mm))
    left_img += bullet_list([
        f"{bold('Cache Size:')} 40 textures max in GPU memory",
        f"{bold('Eviction:')} Oldest texture disposed on overflow",
        f"{bold('Preload:')} All 190 frames as HTMLImageElement",
        f"{bold('Fallback:')} 4×4px {code('#0B0B0D')} canvas texture",
    ])

    right_img = []
    right_img.append(Paragraph(accent("PROJECT CARD IMAGES"), S_LABEL))
    right_img.append(Spacer(1, 2*mm))
    right_img.append(Paragraph("4 Project Thumbnails", S_H3))
    right_img.append(Spacer(1, 3*mm))
    card_data = [
        ["PROPERTY", "VALUE"],
        ["Aspect Ratio",  code("4 : 3") + "  (CSS " + code("aspect-ratio: 4/3") + ")"],
        ["Object Fit",    code("object-fit: cover")],
        ["Format",        "PNG"],
        ["Loading",       code('loading="lazy"')],
        ["Container",     code("overflow: hidden") + " (clips zoom)"],
        ["Hover Scale",   code("transform: scale(1.08)")],
        ["Transition",    code("0.8s cubic-bezier(0.16, 1, 0.3, 1)")],
        ["GPU Hint",      code("will-change: transform")],
    ]
    right_img.append(data_table(card_data[0], card_data[1:], col_widths=[usable_w*0.15, usable_w*0.33]))
    right_img.append(Spacer(1, 4*mm))
    right_img.append(Paragraph(accent("PROJECT IMAGE PATHS"), S_LABEL))
    right_img.append(Spacer(1, 2*mm))
    right_img += bullet_list([
        code("assets/images/transcendence.png"),
        code("assets/images/notice-everything.png"),
        code("assets/images/saint-petersburg.png"),
        code("assets/images/bridging-the-gap.png"),
    ])

    story.append(two_column(left_img, right_img))
    story.append(PageBreak())

    # ═══════════════ SLIDE 8: WEBGL & SHADER ══════════════
    story.append(Paragraph("WebGL &amp; GLSL Shader Pipeline", S_TITLE))
    story.append(Paragraph("CUSTOM SHADER FOR THE CINEMATIC TUNNEL ZOOM EFFECT", S_SUBTITLE))

    left_gl = []
    left_gl.append(Paragraph(accent("THREE.JS CONFIGURATION"), S_LABEL))
    left_gl.append(Spacer(1, 2*mm))
    gl_data = [
        ["PROPERTY", "VALUE"],
        ["Library",       "Three.js r128 (CDN)"],
        ["Renderer",      "THREE.WebGLRenderer"],
        ["Antialias",     "false (performance)"],
        ["Alpha Channel", "false"],
        ["Power Pref",    code("high-performance")],
        ["Camera",        "OrthographicCamera(−1, 1, 1, −1, 0, 1)"],
        ["Geometry",      "PlaneGeometry(2, 2) fullscreen quad"],
        ["Material",      "ShaderMaterial (custom GLSL)"],
        ["Depth Test",    "false"],
    ]
    left_gl.append(data_table(gl_data[0], gl_data[1:], col_widths=[usable_w*0.15, usable_w*0.33]))
    left_gl.append(Spacer(1, 4*mm))
    left_gl.append(Paragraph(accent("SHADER UNIFORMS"), S_LABEL))
    left_gl.append(Spacer(1, 2*mm))
    uni_data = [
        ["UNIFORM", "TYPE", "PURPOSE"],
        [code("uTexture"),    "sampler2D", "Current frame texture"],
        [code("uProgress"),   "float 0→1", "Scroll progress"],
        [code("uDistortion"), "float",     "Base distortion strength (0.12)"],
        [code("uResolution"), "vec2",      "Viewport width / height"],
    ]
    left_gl.append(data_table(uni_data[0], uni_data[1:], col_widths=[usable_w*0.15, usable_w*0.12, usable_w*0.21]))

    right_gl = []
    right_gl.append(Paragraph(accent("FRAGMENT SHADER — 4-LAYER POST-PROCESSING"), S_LABEL))
    right_gl.append(Spacer(1, 3*mm))

    layers = [
        ("Layer 1: Barrel Distortion",
         f"Centre-out lens distortion at focal point {code('vec2(0.5, 0.51)')} (model's face). Two-coefficient model: k1 = strength, k2 = strength × 0.35. Dynamic ramp: {code('0.15 + progress × 0.85')}."),
        ("Layer 2: Chromatic Aberration",
         f"RGB channel split: R at {code('spread × 1.02')}, G at {code('1.00')}, B at {code('0.98')}. Subtle prismatic fringing that intensifies with scroll."),
        ("Layer 3: Vignette",
         f"Parabolic mask: {code('uv × (1 − uv) × 16')}. Power curve softens with progress: {code('pow(vig, 0.18 + progress × 0.08)')}. Edge darken: 0.82 → 1.0."),
        ("Layer 4: Film Grain",
         f"GLSL noise via {code('fract(sin(dot(…)))')}. Intensity: ±0.03 (very subtle, cinematic texture)."),
    ]
    for title, desc in layers:
        right_gl.append(Paragraph(title, make_style("layer", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=TXT_PRI)))
        right_gl.append(Paragraph(desc, S_BODY))
        right_gl.append(Spacer(1, 3*mm))

    story.append(two_column(left_gl, right_gl))
    story.append(PageBreak())

    # ═══════════════ SLIDE 9: ANIMATION & MOTION ══════════
    story.append(Paragraph("Animation &amp; Motion Design", S_TITLE))
    story.append(Paragraph("GSAP SCROLLTRIGGER + CSS KEYFRAMES + CUSTOM EASING CURVES", S_SUBTITLE))

    left_anim = []
    left_anim.append(Paragraph(accent("GSAP SCROLLTRIGGER INSTANCES"), S_LABEL))
    left_anim.append(Spacer(1, 2*mm))
    anim_data = [
        ["TARGET", "ACTION", "TRIGGER / RANGE"],
        ["Hero Pin",     "Pin + scrub sequence",        code("top top → +=150%") + ", scrub: 0.6s"],
        ["Hero Text",    "Fade opacity → 0",            code("top top → +=60%") + ", scrub: true"],
        ["Work Header",  "y: 60→0, opacity: 0→1",      code("top 85%") + ", dur: 1s"],
        ["Project Cards","y: 80→0, opacity: 0→1",      code("top 85%") + ", stagger: 0.15s"],
        ["Footer",       "y: 40→0, opacity: 0→1",      code("top 90%") + ", dur: 0.8s"],
    ]
    left_anim.append(data_table(anim_data[0], anim_data[1:],
        col_widths=[usable_w*0.12, usable_w*0.18, usable_w*0.18]))
    left_anim.append(Spacer(1, 4*mm))
    left_anim.append(Paragraph(accent("GSAP LIBRARY"), S_LABEL))
    left_anim.append(Spacer(1, 2*mm))
    left_anim += bullet_list([
        f"{bold('Version:')} GSAP 3.12.5 (CDN)",
        f"{bold('Plugins:')} ScrollTrigger",
        f"{bold('Default Ease:')} {code('power3.out')}",
    ])

    right_anim = []
    right_anim.append(Paragraph(accent("CSS EASING CURVES"), S_LABEL))
    right_anim.append(Spacer(1, 2*mm))
    ease_data = [
        ["TOKEN", "VALUE"],
        [code("--ease-out-expo"),  code("cubic-bezier(0.16, 1, 0.3, 1)")],
        [code("--ease-out-quart"), code("cubic-bezier(0.25, 1, 0.5, 1)")],
    ]
    right_anim.append(data_table(ease_data[0], ease_data[1:], col_widths=[usable_w*0.2, usable_w*0.28]))
    right_anim.append(Spacer(1, 4*mm))

    right_anim.append(Paragraph(accent("CSS TRANSITION DURATIONS"), S_LABEL))
    right_anim.append(Spacer(1, 2*mm))
    dur_data = [
        ["TOKEN", "VALUE", "USAGE"],
        [code("--duration-fast"), "0.2s", "Hover states, opacity"],
        [code("--duration-med"),  "0.45s","Border, background, pill button"],
        [code("--duration-slow"), "0.8s", "Image hover zoom"],
    ]
    right_anim.append(data_table(dur_data[0], dur_data[1:], col_widths=[usable_w*0.18, usable_w*0.08, usable_w*0.22]))
    right_anim.append(Spacer(1, 4*mm))

    right_anim.append(Paragraph(accent("CSS @KEYFRAMES — fadeUp"), S_LABEL))
    right_anim.append(Spacer(1, 2*mm))
    right_anim += bullet_list([
        f"{bold('From:')} opacity: 0, translateY(20–30px)",
        f"{bold('To:')} opacity: 1, translateY(0)",
        f"{bold('Delays:')} subtitle 0.3s, title 0.5s, services 0.7s",
    ])
    right_anim.append(Spacer(1, 4*mm))
    right_anim.append(Paragraph(accent("RENDER LOOP"), S_LABEL))
    right_anim.append(Spacer(1, 2*mm))
    right_anim.append(Paragraph(
        f"{code('requestAnimationFrame')} — continuous loop updating shader uniforms ({code('uTexture')}, {code('uProgress')}) every frame. Only renders after all images preloaded.",
        S_BODY))

    story.append(two_column(left_anim, right_anim))
    story.append(PageBreak())

    # ═══════════════ SLIDE 10: RESPONSIVE & ARCH ══════════
    story.append(Paragraph("Responsive Design &amp; Architecture", S_TITLE))
    story.append(Paragraph("BREAKPOINTS, FILE STRUCTURE, AND TECHNOLOGY STACK SUMMARY", S_SUBTITLE))

    left_resp = []
    left_resp.append(Paragraph(accent("RESPONSIVE BREAKPOINTS"), S_LABEL))
    left_resp.append(Spacer(1, 2*mm))
    bp_data = [
        ["BREAKPOINT", "ADAPTATION"],
        ["≤ 900px", "Hero stacks vertically. Grid → 1 column. Footer stacks."],
        ["≤ 600px", "Header shrinks to 56px. \"Work\" link hidden. Services → 1 col."],
        ["All sizes", "Fluid typography with clamp(). Fluid gutter."],
    ]
    left_resp.append(data_table(bp_data[0], bp_data[1:], col_widths=[usable_w*0.12, usable_w*0.36]))
    left_resp.append(Spacer(1, 4*mm))

    left_resp.append(Paragraph(accent("BORDER RADIUS SYSTEM"), S_LABEL))
    left_resp.append(Spacer(1, 2*mm))
    rad_data = [
        ["TOKEN", "VALUE", "USAGE"],
        [code("--radius-sm"),   "6px",  "Loader bar, small elements"],
        [code("--radius-md"),   "10px", "General cards"],
        [code("--radius-lg"),   "16px", "Project cards"],
        [code("--radius-pill"), "100px","\"Get in touch\" button"],
    ]
    left_resp.append(data_table(rad_data[0], rad_data[1:], col_widths=[usable_w*0.14, usable_w*0.08, usable_w*0.26]))
    left_resp.append(Spacer(1, 4*mm))

    left_resp.append(Paragraph(accent("SPACING SCALE (REM)"), S_LABEL))
    left_resp.append(Spacer(1, 2*mm))
    left_resp.append(Paragraph(
        f"xs {bold('0.25')} · sm {bold('0.5')} · md {bold('1.0')} · lg {bold('1.5')} · xl {bold('2.5')} · 2xl {bold('4.0')} · 3xl {bold('6.0')}",
        S_BODY))

    right_resp = []
    right_resp.append(Paragraph(accent("FILE ARCHITECTURE"), S_LABEL))
    right_resp.append(Spacer(1, 2*mm))
    file_data = [
        ["FILE", "PURPOSE", "LINES"],
        [code("index.html"),      "Semantic HTML5 markup + CDN links",       "95"],
        [code("style.css"),       "Design tokens + responsive layouts",      "553"],
        [code("main.js"),         "Three.js + GSAP + work grid + loop",      "261"],
        [code("scrubEngine.js"),  "Frame preloader + LRU texture cache",     "120"],
        [code("tunnelShader.js"), "Custom GLSL vertex + fragment shaders",   "69"],
        [code("serve.sh"),        "Python HTTP server launcher",             "22"],
    ]
    right_resp.append(data_table(file_data[0], file_data[1:], col_widths=[usable_w*0.16, usable_w*0.22, usable_w*0.06]))
    right_resp.append(Spacer(1, 4*mm))

    right_resp.append(Paragraph(accent("TECHNOLOGY STACK"), S_LABEL))
    right_resp.append(Spacer(1, 2*mm))
    right_resp.append(Paragraph(
        "HTML5 · Vanilla CSS · JavaScript ES6+ · ES Modules · Three.js r128 · GSAP 3.12.5 · ScrollTrigger · WebGL · Custom GLSL · Google Fonts · CSS Custom Properties · CSS Grid · Flexbox · clamp()",
        S_BODY))
    right_resp.append(Spacer(1, 4*mm))

    right_resp.append(Paragraph(accent("SEO & PERFORMANCE"), S_LABEL))
    right_resp.append(Spacer(1, 2*mm))
    right_resp += bullet_list([
        f"{bold('Meta Description:')} ✓ Descriptive",
        f"{bold('Theme Color:')} {code('#0B0B0D')}",
        f"{bold('Semantic HTML:')} header, section, footer, nav, article, h1–h3",
        f"{bold('Lazy Loading:')} project images ({code('loading=\"lazy\"')})",
        f"{bold('Font Preconnect:')} Google Fonts (preconnect + crossorigin)",
        f"{bold('Pixel Ratio Cap:')} 2× maximum for performance",
    ])

    story.append(two_column(left_resp, right_resp))

    # ── Build the PDF ──────────────────────────────────────
    doc.build(story, onFirstPage=on_first_page, onLaterPages=on_page)
    print(f"\n[OK] PDF generated: {OUT_PDF}")
    print(f"     Size: {os.path.getsize(OUT_PDF) / 1024:.0f} KB")
    print(f"     Pages: {doc.page}")

if __name__ == "__main__":
    build()
