# Walker A: stack several line pictures into one sheet with their file names (a reading aid; each source picture stays as it is).
# usage: python lw-m4-walk-a-stack.py <out.png> <in1.png> <in2.png> ...
import sys
from PIL import Image, ImageDraw
out, ins = sys.argv[1], sys.argv[2:]
ims = [Image.open(p).convert('RGB') for p in ins]
W = max(i.size[0] for i in ims)
H = sum(i.size[1] + 16 for i in ims)
sheet = Image.new('RGB', (W, H), (30, 30, 30))
d = ImageDraw.Draw(sheet)
y = 0
for p, i in zip(ins, ims):
    d.text((4, y + 2), p.replace('\\', '/').split('/')[-1], fill=(255, 220, 80))
    sheet.paste(i, (0, y + 16)); y += i.size[1] + 16
sheet.save(out); print(out, sheet.size)
