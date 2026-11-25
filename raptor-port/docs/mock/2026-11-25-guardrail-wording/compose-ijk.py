# Puts the round-2 page's pictures for questions I, J and K into its img folder as ns-*.png.
# Copies are byte-for-byte; a stack only sets whole pictures one above the other on the page's dark picture ground;
# a cut only crops. Nothing is redrawn. Run: python compose-ijk.py (from this folder).
import os, shutil
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
NS = os.path.join(HERE, 'img', 'no-start'); JK = os.path.join(HERE, 'img', 'jk')
OUT = os.path.join(HERE, '..', '2026-11-25-rulings-round2', 'img')
BG = (12, 17, 24)

def copy(src_dir, src, dst):
    shutil.copyfile(os.path.join(src_dir, src), os.path.join(OUT, dst)); report(dst)

def stack(src_dir, names, dst, gap):
    ims = [Image.open(os.path.join(src_dir, n)).convert('RGB') for n in names]
    w = max(i.width for i in ims); h = sum(i.height for i in ims) + gap * (len(ims) - 1)
    out = Image.new('RGB', (w, h), BG); y = 0
    for i in ims:
        out.paste(i, ((w - i.width) // 2, y)); y += i.height + gap
    out.save(os.path.join(OUT, dst)); report(dst)

def cut(src_dir, src, dst, boxes, gap=0):
    im = Image.open(os.path.join(src_dir, src)).convert('RGB')
    parts = [im.crop(b) for b in boxes]
    w = max(p.width for p in parts); h = sum(p.height for p in parts) + gap * (len(parts) - 1)
    out = Image.new('RGB', (w, h), BG); y = 0
    for p in parts:
        out.paste(p, (0, y)); y += p.height + gap
    out.save(os.path.join(OUT, dst)); report(dst)

def report(dst):
    print(dst, Image.open(os.path.join(OUT, dst)).size)

# I — the worked example, today and proposed
copy(NS, 'ns-a-flight-today-phone.png', 'ns-flight-today-phone.png')
copy(NS, 'ns-a-flight-proposed-phone.png', 'ns-flight-proposed-phone.png')
copy(NS, 'ns-b-desk-proposed-phone.png', 'ns-desk-proposed-phone.png')
copy(NS, 'ns-a2-sim-proposed-phone.png', 'ns-sim-proposed-phone.png')
stack(NS, ['ns-a-flight-proposed-desktop.png', 'ns-b-desk-proposed-desktop.png', 'ns-a2-sim-proposed-desktop.png'], 'ns-three-proposed-desktop.png', 16)
copy(NS, 'ns-c-sign-refused-phone.png', 'ns-sign-refused-phone.png')
copy(NS, 'ns-c-sign-refused-desktop.png', 'ns-sign-refused-desktop.png')
# the refused Publish on a phone: the day's head to "4 to sign", then the foot with the note
cut(NS, 'ns-c2-publish-refused-phone.png', 'ns-publish-refused-phone.png', [(0, 0, 1206, 680), (0, 2130, 1206, 2382)], 18)
# the all-day input row, if it were flagged: the last rows of Monday's Ground Programme
cut(NS, 'ns-d-attach-if-flagged-phone.png', 'ns-attach-if-flagged-phone.png', [(0, 780, 876, 1071)])
# J — look 1 (red) beside look 2 (quiet grey), each the same three rows
for size in ('phone', 'desktop'):
    stack(JK, [f'j1-red-{x}-{size}.png' for x in ('flight', 'desk', 'sim')], f'ns-j1-red-{size}.png', 16)
    stack(JK, [f'j2-quiet-{x}-{size}.png' for x in ('flight', 'desk', 'sim')], f'ns-j2-quiet-{size}.png', 16)
    copy(JK, f'j2-count-line-{size}.png', f'ns-j2-count-line-{size}.png')
# K — View-only Sched's draft Thursday as the app draws it today
stack(JK, ['k-view-head-phone.png', 'k-view-flight-phone.png', 'k-view-desk-phone.png'], 'ns-k-view-only-phone.png', 16)
