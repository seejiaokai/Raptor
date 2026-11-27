# Walker A's drawing check by pixels (walk-scripts §10's comparing, done on the pictures): the approved drawing's own raw
# picture beside the build's picture of the same world. Every region where a pixel differs by more than 24 colour levels
# is grouped (8px dilation) and listed with its box; regions under 3px either way are dropped (the "about 2px" rule).
# Writes a side-by-side picture with the differing regions ringed in the marker colour on both sides.
# usage: python a-drawcmp.py <drawing.png> <build.png> <out.png> [crop_h]
import sys
import numpy as np
from PIL import Image, ImageDraw

draw_p, build_p, out_p = sys.argv[1], sys.argv[2], sys.argv[3]
crop_h = int(sys.argv[4]) if len(sys.argv) > 4 else None
A = Image.open(draw_p).convert('RGB'); B = Image.open(build_p).convert('RGB')
print('drawing', A.size, 'build', B.size)
W = min(A.width, B.width); H = min(A.height, B.height)
if crop_h: H = min(H, crop_h)
a = np.asarray(A.crop((0, 0, W, H))).astype(int); b = np.asarray(B.crop((0, 0, W, H))).astype(int)
d = (np.abs(a - b).max(axis=2) > 24)
print('differing pixels', int(d.sum()), 'of', W * H)
# group: dilate 8px, then label connected components (simple flood fill)
k = 8
m = d.copy()
for _ in range(k):
    m2 = m.copy(); m2[1:] |= m[:-1]; m2[:-1] |= m[1:]; m2[:, 1:] |= m[:, :-1]; m2[:, :-1] |= m[:, 1:]; m = m2
lab = np.zeros(m.shape, int); n = 0; boxes = []
ys, xs = np.nonzero(m)
seen = np.zeros(m.shape, bool)
for y0, x0 in zip(ys, xs):
    if seen[y0, x0]: continue
    n += 1; st = [(y0, x0)]; seen[y0, x0] = True; ymin = ymax = y0; xmin = xmax = x0
    while st:
        y, x = st.pop()
        ymin, ymax, xmin, xmax = min(ymin, y), max(ymax, y), min(xmin, x), max(xmax, x)
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= yy < m.shape[0] and 0 <= xx < m.shape[1] and m[yy, xx] and not seen[yy, xx]:
                seen[yy, xx] = True; st.append((yy, xx))
    # shrink back by the dilation
    x1, y1, x2, y2 = xmin + k, ymin + k, xmax - k, ymax - k
    if x2 - x1 + 1 >= 3 or y2 - y1 + 1 >= 3:
        boxes.append((x1, y1, x2, y2, int(d[max(0, y1):y2 + 1, max(0, x1):x2 + 1].sum())))
for i, (x1, y1, x2, y2, c) in enumerate(boxes, 1):
    print(f'  region {i}: x {x1}-{x2}  y {y1}-{y2}  ({x2 - x1 + 1} x {y2 - y1 + 1} px picture, {c} pixels differ)')
gap = 24
S = Image.new('RGB', (W * 2 + gap, H + 40), (255, 255, 255))
S.paste(A.crop((0, 0, W, H)), (0, 40)); S.paste(B.crop((0, 0, W, H)), (W + gap, 40))
dr = ImageDraw.Draw(S)
dr.text((8, 10), 'APPROVED DRAWING', fill=(0, 0, 0)); dr.text((W + gap + 8, 10), 'BUILD (this walk)', fill=(0, 0, 0))
for i, (x1, y1, x2, y2, c) in enumerate(boxes, 1):
    for ox in (0, W + gap):
        dr.rectangle((ox + x1 - 3, 40 + y1 - 3, ox + x2 + 3, 40 + y2 + 3), outline=(255, 45, 149), width=2)
        dr.text((ox + x1, 40 + max(0, y1 - 14)), str(i), fill=(255, 45, 149))
S.save(out_p)
print('regions', len(boxes), '->', out_p)
