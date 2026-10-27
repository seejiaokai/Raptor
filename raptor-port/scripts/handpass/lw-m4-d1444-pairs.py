# His D1444 and D1445 (28 Oct 26), built — each beside its drawing at the same scale, from
# scripts/handpass/lw-m4-d1444-after.mjs's pictures: the phone top of Approvals at 402 (the demo's two months) and at 360
# (seven months), beside the drawing he approved (scripts/handpass/lw-m4-d1439-mock.mjs, "proposed-plain"); the slim bar's
# fill on a phone beside r22-6-phone and on a desktop beside r22-4-desk.
# Run from raptor-port/: python scripts/handpass/lw-m4-d1444-pairs.py
from PIL import Image, ImageDraw, ImageFont
import os
HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(HERE, '..', '..', 'docs')
DRAW = os.path.join(DOCS, 'mock', 'lw-overhaul', 'full')
MOCK = os.path.join(DOCS, 'img', 'handpass', '2026-10-27-lw-m4', 'd1439')
SRC = os.path.join(DOCS, 'img', 'handpass', '2026-10-27-lw-m4', 'd1444')
OUT = os.path.join(SRC, 'pairs')
os.makedirs(OUT, exist_ok=True)
try:
    FONT = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 26)
except OSError:
    FONT = ImageFont.load_default()

def whole(path):
    return Image.open(path).convert('RGB')

def cut(path, box):
    return whole(path).crop(box)

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

DR, NOW = 'Your drawing', 'Built'
# D1444 - the phone top of Approvals, the demo's two months at 402, seven months at 360
stack('d1444-top-402', [(DR, whole(os.path.join(MOCK, 'demo-402-proposed-plain.png'))), (NOW, whole(os.path.join(SRC, 'demo-402-built.png')))])
stack('d1444-top-360-busy', [(DR, whole(os.path.join(MOCK, 'busy-360-proposed-plain.png'))), (NOW, whole(os.path.join(SRC, 'busy-360-built.png')))])
# D1445 - the slim bar's fill: the foot of the phone screen (402 x 874 x 3) and of the desktop's (1536 x 860 x 1.25)
stack('d1445-slim-phone', [(DR, cut(os.path.join(DRAW, 'r22-6-phone.png'), (0, 2622 - 300, 1206, 2622))), (NOW, cut(os.path.join(SRC, 'slim-phone.png'), (0, 2622 - 300, 1206, 2622)))])
stack('d1445-slim-desk', [(DR, cut(os.path.join(DRAW, 'r22-4-desk.png'), (560, 1075 - 150, 1360, 1075))), (NOW, cut(os.path.join(SRC, 'slim-desk.png'), (560, 1075 - 150, 1360, 1075)))])
