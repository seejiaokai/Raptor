# The input window's Remarks behind Cancel / Add on his iPhone — 25 Oct 26 (WALK)

**His report, 07:06:** the Inputs page's new-input window on his iPhone, "Other" picked, Remarks tapped — the window showed
Type, Title, Duration and Document, then Cancel / Add, and no Remarks; an empty band under the buttons and the window's top
cut off ("The page seems to be too small"; "seems like the others are ok"). Branch `claude/lw-m3-placing-leave`.

## The cause (found, then proved red)

The keyboard lift (`src/ui/kbscroll.ts`, his D1048, built 19 Oct 26) brings a tapped box above the keys by scrolling its
panels so the box's bottom sits 8px above the panel's visible foot or the keys, whichever is higher. The input window's
Cancel / Add stand **pinned to the foot of its own scrolling body** (`position:sticky`, `25-inputs-calendar.css`), which says
so in the standard way (`scroll-padding-bottom: 64px`). The lift measured the body's bare edge, so whenever the whole window
stood above the keys — held to the room the keys leave (its "taller than the room" path), or in a browser that shortens the
page for the keys — Remarks was lifted to the body's very foot: **exactly behind Cancel / Add**. Reproduced on the built
bundle before the fix (`scripts/handpass/kbs-other-rmk.mjs`, a stand-in keyboard): held (layout 762, keys 500) and shortened
(762, 372) — Remarks 33px of 33 under the buttons. Not on `main` alone: this branch made the window taller (a Document row on
every kind, M3), which puts more kinds on the held path.

**The fix:** the lift keeps clear of what a panel covers at its edges — its scroll padding, and a button row it holds sticky
at its foot (its last child, three deep, measured as it stands, so a row that wraps on an iPhone's wider letters is cleared
whole). Red first: `src/ui/kbscroll.test.ts` (two new cases failed — 342 for 278; the undeclared row's case failed with the
measurement switched off) and `e2e/kbscroll.spec.ts` KS3d (the real input window, "Other", held to the room).

**Not proved, filed:** his picture also shows the window's top cut off and an empty band under it — the look of the visible
screen panned down after the window was placed. Chromium cannot pan as an iPhone does; the fix alone may cure it (the box he
tapped now shows, so the phone has nothing to pan to). His look on his iPhone decides — `OUTSTANDING.md` [KBS-IOS-LATE-PAN].

## Tier: WALK

The eight questions: money, the published record, saved data, roles, warnings — NO (a screen-geometry helper; nothing stored
or counted). A shared drawer — YES (one helper serves every box in every window, sheet and panel). New gesture or surface — NO.
Type of change (`docs/walk-ledger.md`): A (one shared calculation), E (geometry), R (a reported fault).

## Roll-call — every place the lift's floor now reads a pinned foot

| Place | Pinned foot in its scrolling body | Verdict |
|---|---|---|
| The input window (Inputs page, the schedule's own) — every kind | Cancel / Add, sticky, declared 64px | **has it** — walked: Other, Training, LL × four keyboards |
| Holidays' form (Leave War ⚙ → Calendar… → Holidays → + Add) | its buttons, sticky, undeclared | **has it** (measured) — walked: its boxes sit high, never lifted to the foot today |
| The confirm cards (document, medical clash, OIL question) | their two buttons, sticky | **must not matter, because** nothing in them is typed in |
| The document viewer | its foot, sticky | **must not matter, because** nothing in it is typed in |
| The OIL day list | its foot, sticky | **must not matter, because** its answers are buttons |
| Duty templates (KS3, KS3b), Logic (KS2), the Scheduler Board (KS1, KS7, KS8) | none in the scrolling body | **unchanged** — their browser tests pass |
| A desktop | no keyboard, the lift never runs | **unchanged** |

## The walk (phone 402 wide, stand-in keyboard; Chromium) — the built bundle with the fix

Pictures in `raptor-port/docs/img/handpass/2026-10-25-lw-drawings/kbs/`, each taken straight after the tap and the keys
(D1281). Figures are Remarks' top–bottom and the buttons' top, in screen pixels; "under" is how much of Remarks the buttons
cover.

| Kind | Layout / keys | Remarks | Buttons | Under |
|---|---|---|---|---|
| Other, Training, LL | 762 / 372 (scrolls its body) | 349–382 | 700 (under the keys) | 0 |
| Other, Training, LL | 762 / 372, page shortened | 272–305 | 328 | 0 (was 33) |
| Other, Training, LL | 762 / 500 (held) | 148–181 | 204 | 0 (was 33) |
| Other, Training, LL | 874 / 540 (held) | 220–253 | 276 | 0 |
| Holidays' lowest box | 762 / 500 and 762 / 372 shortened | 206–248 | 660 / 289 | 0 |

Looked at (opened, cropped): Other and LL held at 874 / 540 — Remarks whole above Cancel / Add, the window's title on screen.
No console or page errors in any run.

## Gates

- `src/ui/kbscroll.test.ts` — 32 / 32 (three new).
- `e2e/kbscroll.spec.ts` (raptor) — 11 / 11, KS3d new; it built the bundle the walk drove (under the check lock).
- The pull request's GitHub run — read after the push.

**Walk:** WALK — the input window (Other, Training, LL) at four keyboards and Holidays' form, phone 402, Chromium with a
stand-in keyboard; 14 runs, every picture taken after the tap; 0 left under the buttons (was 33px of 33); his iPhone not yet.
