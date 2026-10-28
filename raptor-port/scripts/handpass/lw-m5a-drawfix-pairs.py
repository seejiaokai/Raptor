# M5a drawing fixes (D1493, 29 Oct 26): each fix beside its drawing, the same area cut from both at the same size, labelled.
# Run from raptor-port/ after lw-m5a-drawfix-shots.mjs:  python scripts/handpass/lw-m5a-drawfix-pairs.py
# Drawings are 1536 x 864 CSS px at 1.25 (1920 x 1080 pixels), as the build's "desk-" pictures are.
from PIL import Image, ImageDraw, ImageFont

MOCK = 'docs/mock/lw-overhaul/full/m5a/'
OUT = 'docs/img/handpass/2026-10-28-lw-m5a/drawing-fixes/'


def font(n):
    for f in ('C:/Windows/Fonts/segoeuib.ttf', 'C:/Windows/Fonts/arialbd.ttf'):
        try:
            return ImageFont.truetype(f, n)
        except OSError:
            pass
    return ImageFont.load_default()


def pair(name, left, lbox, right, rbox, title, scale=1.0, gap=24):
    a = Image.open(left).convert('RGB').crop(lbox)
    b = Image.open(right).convert('RGB').crop(rbox)
    if scale != 1.0:
        a = a.resize((round(a.width * scale), round(a.height * scale)), Image.LANCZOS)
        b = b.resize((round(b.width * scale), round(b.height * scale)), Image.LANCZOS)
    head = 64
    w = a.width + b.width + gap * 3
    h = max(a.height, b.height) + head + gap
    im = Image.new('RGB', (w, h), (24, 26, 30))
    d = ImageDraw.Draw(im)
    d.text((gap, 10), title, fill=(240, 240, 240), font=font(22))
    d.text((gap, 38), 'DRAWING', fill=(255, 45, 149), font=font(18))
    d.text((gap * 2 + a.width, 38), 'BUILT', fill=(59, 198, 232), font=font(18))
    im.paste(a, (gap, head))
    im.paste(b, (gap * 2 + a.width, head))
    im.save(OUT + name)
    print(name, im.size)


# A — where the desktop person window stands: the whole screen at his PC's 125% (each picture shown at half size)
pair('pair-A-window-place.png', MOCK + 'm5a-p2-desk-drawn.png', (0, 0, 1920, 1080),
     OUT + 'desk-window-from-grid.png', (0, 0, 1920, 1080),
     "A  The desktop person window: just under the top bar, at the grid's right edge, every leave line in view", scale=0.5)
# B — the leave lines: flat rows between thin lines, only the dot for new (the window's list, both at 1.25)
pair('pair-B-leave-lines.png', MOCK + 'm5a-p2-desk-drawn.png', (1200, 500, 1876, 905),
     OUT + 'desk-window-from-grid.png', (1200, 500, 1876, 905),
     'B  His leave in the person window: flat rows between thin lines, no card, no cyan bar')
# D — the Balances page's names set left in their pucks (the name column and App bal, at 1.25)
pair('pair-D-names-left.png', MOCK + 'm5b-b1-desk.png', (28, 280, 600, 940),
     OUT + 'desk-balances-admin.png', (28, 280, 600, 940),
     "D  The Balances page's names: each callsign set left inside its puck, as on the grid")
# E — a member's locked row: the amber pending figures on their figures' line (Ranger's row, at 1.25)
pair('pair-E-locked-row.png', MOCK + 'm5c-c2-desk-locked-cut.png', (480, 548, 1640, 598),
     OUT + 'desk-balances-member-locked.png', (480, 548, 1640, 598),
     "E  A member's locked row (Ranger): every figure, amber pending ones included, on one line")
