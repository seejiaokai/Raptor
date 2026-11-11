# The Balances list stuck at its foot — the look's sheet (11 Nov 26, chat 64)

**The fault he reported** (Chrome on his PC, a mouse wheel, 11 Nov 26): on the Leave War's Balances page, on a desktop,
the whole page shifts up a little when the list reaches its end; rolled to the foot and then up at once, the list is
stuck "sometimes" and scrolls only after a pause; rolled slowly it does not happen. `[BAL-SCROLL-STUCK]`.

**Tier: LOOK.** The eight questions, each NO: OIL or what a man is owed — no, nothing counted changes; the published
record — no; saved data — no, nothing is written; a shared drawer — no, the page's own height and its own list; a new
gesture or mode — no; a new surface — no; roles — no; the warning list — no. One surface: the Balances page. The page is
the only one fitted to the screen this way (searched: every other use of the window's height sizes a floating window).

**Cause, measured, not guessed.** A real window is a whole number of screen pixels tall, so at his 125% display scale
the page's own height is often a fraction, which the browser's rounded figure rounds up. In real Chrome windows started
at 125% with no screen size emulated:

| Window | The screen's true height | The browser's rounded figure | Before: the window behind the page scrolls by | After |
|---|---|---|---|---|
| 731 | 731.2 | 731 | 0 | 0 |
| 732 | 732 | 732 | 0 | — |
| 733 | 733.6 | 734 | **0.8** (one screen pixel) | **0** |
| 734 | 734.4 | 734 | 0 | 0 |
| 735 | 735.2 | 735 | 0 | — |
| 900 | 900 | 900 | 0 | — |
| 901 | 901.6 | 902 | **0.8** | **0** |
| 902 | 902.4 | 902 | 0 | 0 |
| 903 | 903.2 | 903 | 0 | — |

So at some window heights (733 and 901 of the nine measured) the page stood taller than the screen and the window
behind it could move: his "the whole page shifts a bit up", and why it is "sometimes". A wheel turned with the list
already at its foot is then handed to that window, and the browser keeps giving the wheel to it until the wheel rests.

**What was not reproduced, said plainly:** the stuck list itself. A test browser's wheel is not held by the window the
way a real wheel is — driven in the test browser and in the real Chrome and Edge on his PC, at six emulated sizes and
with the page forced 0.4 and 3 taller, the list came up at once every time. The cause above rests on his own
observation (the page shifting) matching the measured one-pixel scroll; the cure is checked by that scroll being gone.
**His look on his PC is the proof of the stuck list.**

**The fix** (`e1ec63dff`): the page takes the screen's unrounded height where it is within a pixel of the rounded one,
never more than the rounded one (`BalancesPage.tsx`); and the desktop list keeps the wheel to itself, as the phone's
list already did (`balances.css`). Nothing a person sees changes.

**Checked:** six tests written first in `src/leavewar/ui/balances.test.tsx` (two red before the fix; the file 68 pass);
the build; the code check on the changed files (no new finding); the table above after the fix; the fixed build driven
in a real Chrome window 733 tall at 125% — the list wheeled to its foot and up, the window scrolled by 0, no errors on
the page; the phone page (402 × 874) the same height rule as before, the window unable to scroll. GitHub's run of the
pull request is the full check.

**Pictures** (`docs/img/handpass/2026-11-11-bal-scroll-stuck/`, each opened): `after-desktop-733-top.png`,
`after-desktop-733-foot-then-up.png`, `after-phone-402.png`. No "before" picture: nothing visible differs — the
"before" is the table's 0.8.

**The lesson added** (the order's §7.11, lesson 31): the M5a walk and the browser tests ran at emulated screen sizes,
always whole numbers, so none could meet a screen a fraction tall.

`Walk: docs/handpass/2026-11-11-bal-scroll-stuck.md · 3 pictures · 1 surface (a LOOK: the Balances page, desktop and phone) · 9 real window heights measured · MISSING: the stuck list itself, which no test browser shows — his look on his PC`
