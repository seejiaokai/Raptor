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

**The second fault, from his recording of 07:40 (on the bundle before the fix — his Safari had not reloaded):** frames every half
second (`scripts/handpass/video-frames.mjs`) show the window held to the room the keys left, then — after the focus window —
the iPhone's password bar (key, card, pin) rising and the phone panning the visible screen about 170 points down: the window,
pinned where it had been, ended with its top off the screen and a band of about 95 points under it. The lift follows a pan or
a resize only within 1.5s of the focus (for the page, where a late resize is Safari's bars folding as he scrolls). **The fix:**
a window raised or held for the keys follows the visible screen while they are up and its box has the focus — a late pan moves
the window alone, a late change of the room holds it to the new room and keeps the box in sight. Red first: two cases in
`kbscroll.test.ts` (the window stayed at 8 when the screen panned to 170; the hold stayed 444 when the room shrank to 364), and
KS3e in the browser test. One old assertion said a late pan moves nothing — the fault itself, its box left 100 under the keys
— and now says the window follows, its reason written beside it. (Typing with "Training" worked in his recording because that
window was not held: its body scrolled instead.)

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
| Other, then a pan of 170 two seconds later | 762 / 500 (held) | 148–181 on screen | 204 | 0 — the title 8 from the top, no band |
| Other, the same | 874 / 540 (held) | 220–253 on screen | 276 | 0 — the title 8 from the top, no band |

Looked at (opened, cropped): Other and LL held at 874 / 540 — Remarks whole above Cancel / Add, the window's title on screen.
No console or page errors in any run.

## Gates

- `src/ui/kbscroll.test.ts` — 34 / 34 (five new, one corrected), with `src/ui/amendbatch-app.test.tsx` 41 / 41 together.
- `e2e/kbscroll.spec.ts` (raptor) — 12 / 12, KS3d and KS3e new; each run built the bundle the walk drove (under the check lock).
- Looked at: `kbs/other-latepan-visible-phone.png` — the visible screen after the pan, cut to it: the title, Remarks, Cancel / Add.
- The pull request's GitHub run — read after the push.

## The third round — his recordings of 08:05 (the fixed build)

"Sometimes it works": with the iPhone's key/card/pin bar over the keys the window behaved; with its ˄ ˅ ✓ form bar ("Other"
and OD, the window opened from a calendar day) it was held short, its title off the top, a band of some 110 points under it,
Remarks behind Cancel / Add. Read from the frames: the phone had panned the visible screen down past the window's own place as
the keys came; the hold pinned a window by raising it only (a shift never below zero), so it stayed where it stood. **Fix:** the
pin moves a window up or down to the visible top, and a window that fits comes down to it too — below its own place only when
the phone panned past that place (a full-screen panel at the top is left where it is: two older cases caught a first, wider
version). Red first: two cases (`a window the phone panned past`) failed on the previous code; KS3f in the browser (OD, the keys
and a pan of 186 together). `?kbdebug` added to read his phone's numbers if anything is left. Gates: `kbscroll.test.ts` 36 / 36,
`amendbatch-app.test.tsx` with it 43 / 43, `e2e/kbscroll.spec.ts` 13 / 13 (built under the lock). Looked at:
`kbs/other-kbdebug-visible-phone.png` — the readout's lines and the window following the pan.

**Walk:** WALK — the input window (Other, Training, LL) at four keyboards and Holidays' form, phone 402, Chromium with a
stand-in keyboard; 14 runs, every picture taken after the tap; 0 left under the buttons (was 33px of 33); then his recording's
late pan, replayed at two sizes on the fixed build — the window follows, no band, the title in sight; his iPhone not yet.
