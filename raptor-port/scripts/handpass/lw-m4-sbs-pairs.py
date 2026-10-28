# The side-by-side page's pairs (D1426): each difference cut from his drawing and from the build at the same scale,
# the drawing above, the build below, the area ringed in pink. Coordinates are the pictures' own pixels
# (desktop 1920 wide = CSS x 1.25; phone 1206 wide = CSS x 3).
from PIL import Image, ImageDraw, ImageFont
import os
HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(HERE, '..', '..', 'docs')
DRAW = os.path.join(DOCS, 'mock', 'lw-overhaul', 'full')
SBS = os.path.join(DOCS, 'img', 'handpass', '2026-10-27-lw-m4', os.environ.get('SBS_DIR', 'sbs'))  # SBS_DIR=sbs-after: the build after his answers
WALK = os.path.join(DOCS, 'img', 'handpass', '2026-10-27-lw-m4')
OUT = os.path.join(SBS, 'pairs')
os.makedirs(OUT, exist_ok=True)
PINK = (255, 46, 136)
try:
    FONT = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 26)
except OSError:
    FONT = ImageFont.load_default()

def cut(path, box, rings, scale=1.0):
    im = Image.open(path).convert('RGB')
    x0, y0, x1, y1 = box
    c = im.crop(box)
    if scale != 1.0:
        c = c.resize((round(c.width * scale), round(c.height * scale)), Image.LANCZOS)
    d = ImageDraw.Draw(c)
    for r in rings:
        rx0, ry0, rx1, ry1 = [(v - o) * scale for v, o in zip(r, (x0, y0, x0, y0))]
        d.rounded_rectangle((rx0, ry0, rx1, ry1), radius=10, outline=PINK, width=5)
    return c

def label(w, text):
    strip = Image.new('RGB', (w, 44), (30, 32, 38))
    ImageDraw.Draw(strip).text((14, 7), text, fill=(235, 235, 240), font=FONT)
    return strip

def pair(name, top, bottom, top_label='His drawing', bottom_label='As built now'):
    w = max(top.width, bottom.width)
    parts = [label(w, top_label), top, Image.new('RGB', (w, 10), (12, 13, 16)), label(w, bottom_label), bottom]
    h = sum(p.height for p in parts)
    out = Image.new('RGB', (w, h), (12, 13, 16))
    y = 0
    for p in parts:
        out.paste(p, (0, y)); y += p.height
    out.save(os.path.join(OUT, name + '.png'), optimize=True)
    print(name, out.size)

r1 = os.path.join(DRAW, 'r22-1-desk.png'); r2 = os.path.join(DRAW, 'r22-2-desk.png'); r3 = os.path.join(DRAW, 'r22-3-desk.png')
r4 = os.path.join(DRAW, 'r22-4-desk.png'); r7 = os.path.join(DRAW, 'r22-7-bell-phone.png')
d1 = os.path.join(SBS, 'd3-decided.png'); d2 = os.path.join(SBS, 'd2-new.png'); d3a = os.path.join(SBS, 'd3-armed.png')
d4 = os.path.join(SBS, 'd4-slim.png'); p7 = os.path.join(SBS, 'p7-bell.png')

# 1 the header: "since you last looked, <time>"
pair('1-header', cut(r2, (25, 185, 1000, 240), [(180, 198, 612, 228)]), cut(d1, (15, 170, 1000, 225), [(172, 182, 316, 210)]))
# 2 "+2 pending in JAN - DEC 27 ›" (an addition, kept on purpose)
pair('2-elsewhere', cut(r2, (25, 185, 1000, 240), []), cut(d1, (15, 170, 1000, 225), [(318, 182, 545, 210)]))
# 3 the thin divider between New and DATES
pair('3-divider', cut(r2, (25, 245, 1050, 300), [(126, 252, 154, 296)]), cut(d1, (15, 222, 1050, 274), [(126, 228, 146, 268)]))
# 4 the columns: packed after a narrower DATES in the drawing, spread in the build
pair('4-columns', cut(r2, (25, 305, 1600, 535), [(60, 312, 960, 340)]), cut(d1, (15, 290, 1600, 530), [(50, 296, 1145, 322)]))
# 5 the buttons' size and the row height
pair('5-sizes', cut(r2, (1000, 345, 1600, 535), [(1322, 354, 1560, 524)]), cut(d1, (1000, 330, 1600, 530), [(1325, 338, 1593, 524)]))
# 6 the card's place under the tab row
pair('6-card', cut(r2, (0, 80, 1000, 245), [(20, 148, 1000, 182)]), cut(d1, (0, 80, 1000, 245), [(8, 140, 1000, 165)]))
# 7 a decided line: the other button
pair('7-other-button', cut(r3, (700, 168, 1600, 300), [(1320, 172, 1563, 292)]), cut(d1, (700, 735, 1600, 868), [(1325, 740, 1593, 862)]))
# 8 a decided line: the kind's box
pair('8-kind-box', cut(r3, (40, 168, 700, 300), [(226, 180, 284, 290)]), cut(d1, (30, 735, 700, 868), [(258, 744, 338, 862)]))
# 9 Approve all, armed
pair('9-armed', cut(r3, (1290, 62, 1600, 132), [(1318, 70, 1563, 124)]), cut(d3a, (1290, 205, 1600, 285), [(1338, 216, 1596, 274)]))
# 10 "Also since you last looked"
pair('10-also', cut(r2, (25, 550, 1600, 725), [(505, 610, 1000, 712)]), cut(d2, (25, 545, 1600, 725), [(330, 595, 1530, 712)]))
# 11 the slim bar
pair('11-slim', cut(r4, (380, 950, 1540, 1075), [(718, 998, 1202, 1070)]), cut(d4, (380, 950, 1540, 1075), [(482, 988, 1440, 1052)]))
# 12 the bell's bidding line: capital B (drawing on a phone; the build's from walker C's desktop picture, enlarged)
pair('12-bidding', cut(r7, (30, 770, 1180, 1090), [(110, 860, 660, 910)]),
     cut(os.path.join(WALK, 'c', 's5', '5c-bell.png'), (866, 55, 1212, 160), [(890, 85, 1030, 105)], scale=3.3))
# 13 the bell's ages
pair('13-ages', cut(r7, (30, 150, 1180, 450), [(1060, 180, 1150, 230), (1050, 330, 1150, 385)]), cut(p7, (20, 140, 1180, 330), [(1050, 180, 1150, 230)]))

# The outright faults being fixed without asking (D1426): one picture each, the fault ringed
def single(name, path, box, rings, scale=1.0):
    c = cut(path, box, rings, scale)
    c.save(os.path.join(OUT, name + '.png'), optimize=True); print(name, c.size)
B = os.path.join(WALK, 'b'); Aw = os.path.join(WALK, 'a'); C = os.path.join(WALK, 'c')
single('f1-tabcount', os.path.join(B, 's1b-chromium-390-tabrow-sharp.png'), (0, 0, 1170, 150), [(590, 20, 690, 130)])
single('f2-dates', os.path.join(B, 's1b-webkit-402-lines-sharp.png'), (0, 0, *Image.open(os.path.join(B, 's1b-webkit-402-lines-sharp.png')).size), [(410, 455, 640, 555)])
single('f3-bubble', os.path.join(B, 's7a-bubble-with-slim.png'), (0, 770, 402, 874), [(8, 806, 394, 866)], scale=3)
single('f4-window', os.path.join(Aw, 's9', 'a-s9-10-dates-tap.png'), (370, 760, 1170, 860), [(385, 790, 1150, 842)], scale=2)
single('f5-longbell', os.path.join(C, 's8long', '8a-long-bell.png'), (860, 50, 1215, 575), [(866, 520, 1210, 572)], scale=2)
single('f6-approved', os.path.join(B, 's13-chromium-approved.png'), (600, 30, 1206, 170), [(650, 45, 915, 160)])
single('f7-member-bell', os.path.join(C, 's11', '11h-bell-no-pin.png'), (860, 50, 1215, 250), [(870, 58, 1205, 105)], scale=2)
single('f8-postedout', os.path.join(Aw, 'compare', 'sheet-s9c-postout.png'), (0, 85, 1252, 160), [(1030, 105, 1145, 150), (15, 108, 190, 150)])
# the still-open question of 27 Oct 26: the phone's filter block (D1423)
single('q14-filters', os.path.join(SBS, 'p5-top.png'), (0, 440, 1206, 1090), [(40, 560, 1166, 1075)])
