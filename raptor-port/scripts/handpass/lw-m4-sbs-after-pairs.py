# The pairs AFTER his answers (27 Oct 26, D1430–D1436): each item put back to his drawing, cut from the drawing and from
# the build at the same scale, the drawing above, the build below, the area ringed — and the two new questions (17, 18).
# The build's pictures are in sbs-after/ (lw-m4-sbs.mjs and lw-m4-after-shots.mjs, SBS_DIR / LW_OUT); the card now stands
# 8px in and 14px down (the stage's own gap — D1430), so the build's cuts sit 10 and 17 picture pixels from the old ones.
from PIL import Image, ImageDraw, ImageFont
import os
HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(HERE, '..', '..', 'docs')
DRAW = os.path.join(DOCS, 'mock', 'lw-overhaul', 'full')
SBS = os.path.join(DOCS, 'img', 'handpass', '2026-10-27-lw-m4', 'sbs-after')
OUT = os.path.join(SBS, 'pairs-after')
os.makedirs(OUT, exist_ok=True)
PINK = (255, 46, 136)
try:
    FONT = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 26)
except OSError:
    FONT = ImageFont.load_default()

def cut(path, box, rings):
    c = Image.open(path).convert('RGB').crop(box)
    d = ImageDraw.Draw(c)
    for r in rings:
        d.rounded_rectangle([v - o for v, o in zip(r, (box[0], box[1], box[0], box[1]))], radius=10, outline=PINK, width=5)
    return c

def label(w, text):
    strip = Image.new('RGB', (w, 44), (30, 32, 38))
    ImageDraw.Draw(strip).text((14, 7), text, fill=(235, 235, 240), font=FONT)
    return strip

def stack(name, parts_in):
    w = max(p.width for _, p in parts_in)
    parts = []
    for i, (lab, im) in enumerate(parts_in):
        if i: parts.append(Image.new('RGB', (w, 10), (12, 13, 16)))
        parts += [label(w, lab), im]
    out = Image.new('RGB', (w, sum(p.height for p in parts)), (12, 13, 16))
    y = 0
    for p in parts:
        out.paste(p, (0, y)); y += p.height
    out.save(os.path.join(OUT, name + '.png'), optimize=True)
    print(name, out.size)

def side(name, parts_in, gap=24):
    h = max(im.height for _, im in parts_in) + 44
    w = sum(im.width for _, im in parts_in) + gap * (len(parts_in) - 1)
    out = Image.new('RGB', (w, h), (12, 13, 16))
    x = 0
    for lab, im in parts_in:
        out.paste(label(im.width, lab), (x, 0)); out.paste(im, (x, 44)); x += im.width + gap
    out.save(os.path.join(OUT, name + '.png'), optimize=True)
    print(name, out.size)

r2 = os.path.join(DRAW, 'r22-2-desk.png'); r3 = os.path.join(DRAW, 'r22-3-desk.png'); r4 = os.path.join(DRAW, 'r22-4-desk.png')
r5 = os.path.join(DRAW, 'r22-5-phone.png'); r6 = os.path.join(DRAW, 'r22-6-phone.png')
d1 = os.path.join(SBS, 'd1-top.png'); dv = os.path.join(SBS, 'd1-second-visit.png'); d2 = os.path.join(SBS, 'd2-new.png')
d3 = os.path.join(SBS, 'd3-decided.png'); d4 = os.path.join(SBS, 'd4-slim.png'); p6 = os.path.join(SBS, 'p6-slim.png')
DR, NOW = 'His drawing', 'As built now'

stack('1-header', [(DR, cut(r2, (25, 185, 1000, 240), [(180, 198, 612, 228)])), (NOW, cut(dv, (25, 190, 1000, 245), [(182, 200, 780, 230)]))])
stack('3-divider', [(DR, cut(r2, (25, 245, 1050, 300), [(126, 252, 154, 296)])), (NOW, cut(d1, (25, 238, 1050, 290), [(142, 244, 172, 284)]))])
stack('6-card', [(DR, cut(r2, (0, 80, 1000, 245), [(20, 148, 1000, 182)])), (NOW, cut(d1, (0, 80, 1000, 245), [(20, 150, 1000, 180)]))])
stack('8-kind-box', [(DR, cut(r3, (40, 168, 700, 300), [(226, 180, 284, 290)])), (NOW, cut(d3, (35, 740, 705, 890), [(243, 752, 317, 884)]))])
stack('10-also', [(DR, cut(r2, (25, 550, 1600, 725), [(505, 610, 1000, 712)])), (NOW, cut(d2, (25, 545, 1600, 745), [(548, 598, 1092, 738)]))])
stack('11-slim', [(DR, cut(r4, (380, 950, 1540, 1075), [(718, 998, 1202, 1070)])), (NOW, cut(d4, (380, 950, 1540, 1075), [(712, 986, 1207, 1053)]))])

# question 17 — the phone's slim bar: his drawing above, the build below (each at his iPhone's 402, picture x3)
stack('q17-phone-slim', [(DR, cut(r6, (0, 2622 - 300, 1206, 2622), [])), (NOW, cut(p6, (0, 2622 - 330, 1206, 2622), []))])

# question 18 — his iPhone's width in WebKit: the buttons as built (a half-day date breaks), and in his drawing's letters
qb = os.path.join(SBS, 'q18-built.png'); qd = os.path.join(SBS, 'q18-drawing-letters.png')
if os.path.exists(qb) and os.path.exists(qd):
    H = Image.open(qb).height
    side('q18-phone-buttons', [('As built now', cut(qb, (0, 0, 1206, min(H, 1500)), [])), ('In your drawing\'s letters', cut(qd, (0, 0, 1206, min(H, 1500)), []))])
