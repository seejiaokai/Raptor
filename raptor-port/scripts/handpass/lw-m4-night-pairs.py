# The night of 27-28 Oct 26: each of his answers 17-19 beside its drawing (D1424), at the same scale (his iPhone's 402 x 874,
# three times over), from scripts/handpass/lw-m4-night-after.mjs's pictures. The headings at 360 and 390 stand alone.
from PIL import Image, ImageDraw, ImageFont
import os
HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(HERE, '..', '..', 'docs')
DRAW = os.path.join(DOCS, 'mock', 'lw-overhaul', 'full')
SRC = os.path.join(DOCS, 'img', 'handpass', '2026-10-27-lw-m4', 'night-after')
OLD = os.path.join(DOCS, 'img', 'handpass', '2026-10-27-lw-m4', 'sbs-after')
OUT = os.path.join(SRC, 'pairs')
os.makedirs(OUT, exist_ok=True)
try:
    FONT = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 26)
except OSError:
    FONT = ImageFont.load_default()

def cut(path, box):
    return Image.open(path).convert('RGB').crop(box)

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

r5 = os.path.join(DRAW, 'r22-5-phone.png'); r6 = os.path.join(DRAW, 'r22-6-phone.png')
DR, NOW = 'His drawing', 'Built tonight'
# 17 - the phone's slim bar: the foot of the screen
stack('17-phone-slim', [(DR, cut(r6, (0, 2622 - 300, 1206, 2622))), (NOW, cut(os.path.join(SRC, 'n17-slim-402.png'), (0, 2622 - 330, 1206, 2622)))])
# 18 - the list's first requests: the drawing's letters on Approve and Refuse
stack('18-phone-buttons', [(DR, cut(r5, (0, 1000, 1206, 1900))), (NOW, cut(os.path.join(SRC, 'n18-list-402.png'), (0, 900, 1206, 1900)))])
# 19 - the changes window's bar: before tonight (the page's picture of every bar) and after
stack('19-changes-bar', [('Built tonight', cut(os.path.join(SRC, 'n19-chgbar-402.png'), (0, 2622 - 260, 1206, 2622)))])
