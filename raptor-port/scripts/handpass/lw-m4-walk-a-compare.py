# Walker A: stack his drawing (scaled 0.8 to 1536 wide, i.e. CSS px) above our picture, same region.
# usage: python lw-m4-walk-a-compare.py <drawing.png> <ours.png> <out.png> y0 y1 [x0 x1]
import sys
from PIL import Image, ImageDraw
d, o, out, y0, y1 = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
x0 = int(sys.argv[6]) if len(sys.argv) > 6 else 0
x1 = int(sys.argv[7]) if len(sys.argv) > 7 else 1536
a = Image.open(d).convert('RGB')
a = a.resize((1536, round(a.size[1] * 1536 / a.size[0])), Image.LANCZOS)
b = Image.open(o).convert('RGB')
if b.size[0] != 1536:
    b = b.resize((1536, round(b.size[1] * 1536 / b.size[0])), Image.LANCZOS)
ca = a.crop((x0, y0, x1, y1)); cb = b.crop((x0, y0, x1, y1))
W = x1 - x0; H = y1 - y0
im = Image.new('RGB', (W, 2 * H + 24), (40, 40, 40))
im.paste(ca, (0, 0)); im.paste(cb, (0, H + 24))
dr = ImageDraw.Draw(im)
dr.text((6, H + 6), 'above: his drawing   |   below: the built page (same region, CSS px)', fill=(255, 220, 80))
im.save(out)
print(out, im.size)
