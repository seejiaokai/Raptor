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

## The fourth round — his ?kbdebug recordings of 10:10, 10:18 and 10:30 (the third round's build)

**What he saw.** The input window opened from an Inputs calendar day (OL) and from a SANS calendar day (SANS Availability), and
the Tracker's All events → Edit (ST-12): a box tapped, the keys up — the form pushed down inside its window, an empty band under
the window's title, the box under the keys; "Check the rest of the app for this bug".

**What his numbers said** (frames read with `video-frames.mjs`, 30 a second around the tap; every figure below off his
readout). Once the keys were up and the phone had panned the visible screen, his iPhone gave every box's place from the top of
the VISIBLE screen and the layout's height as what was left below that top: the window standing 12 from the layout's top read
−172 with a pan of 184, −162 at 174, −152 at 164; the layout 684 read 500, 510, 520; the Tracker's All events (6 above the
layout's top, 696 tall) read −300 at a pan of 294, the layout 390. Chromium, a desktop and the older iPhones give a box's place
from the layout's top, the visible screen starting at the pan — the only measure the lift knew, and the only one the three
earlier rounds' stand-in played. Read his way, the lift took the visible screen for 184–577 where everything it measured was
0–393: the window, read as standing above the screen and as tall as the "layout" left, passed the test for a full-screen
backdrop, so the lift held and moved the window's BODY — down 280 inside it (the band, the box under the keys). One frame at
1.10 s shows it: the window's title still at the top, the readout dropped to the pan, the form 242 points lower. The Tracker's
panel passed that test on any phone, being a window a little taller than the screen.

**Fix.** The visible screen is read in the measure the boxes are given in: a fixed mark at the layout's top and foot, never
seen (`kbscroll.ts screenBox`), says where the layout stands — 0 everywhere but his phone, −pan there — and how tall it is; the
keys-up test reads the full height from it too (his layout read 500 had the keys read as gone). A backdrop is only a layer
exactly on the layout; a window the pan left above the screen and too tall for the room is held as well as brought down.
**The sweep he asked for** — every place that reads the visible screen: the Leave War's sheets (the keys-up test, which his
500 would have read as no keyboard, dropping the sheet under the keys; the top bar's foot; the drag's clamp), its bubble bar
(placed from the layout's height — under the keys on his phone), its "Manning rows in view" check, the board's duty-role
pick-list, the History bubble, and the Inputs and SANS months' fit (his 500 read as no keyboard, so the month shrank behind
the window and grew back) — each now reads the same mark. Positions written as `top: offsetTop` (the readout's own) land at
the visible top in both measures and are left as they are; the drags' edge scrolls and the pop-ups placed from the layout's
height run with no keyboard up and are left too.

**Red first.** `kbscroll.test.ts`: "the window itself is held …" (the form moved down 320) and the Tracker's "a window a little
taller …" (its list moved) failed on the code before; KS3g and KS3h in the browser (Chromium made to measure as his phone does)
failed — the window's title left at −172.

**Gates (this PC, the lock taken):** `kbscroll.test.ts` 39 / 39; the touched unit files 575 / 575 and the Leave War's screens
1389 / 1389; `npm run build` clean; the browser set — `kbscroll`, `changeswin`, `inputs-calendar`, `inputs-sans-calendar`,
`sched-phone` (raptor) and `round2-` / `round3-leavewar` (lw-phone) — 139 / 139.

**Walk:** WALK — his four cases (`scripts/handpass/kbs-his-measure.mjs`: A the Inputs day's input window OL, B the SANS day's,
C the Tracker's All events → Edit → Name, D the Leave War's one-day window → Remarks), phone 402 × 684, his pans and visible
heights, Chromium measuring as his phone does; every picture taken after the tap and the pan, cut to what his screen shows;
4 / 4: the window held at the visible top (8), the box above the keys and above Cancel / Add, nothing inside the window moved.
Looked at: `docs/img/handpass/2026-10-25-kbs-his-measure/A-2-his-screen.png` … `D-2-his-screen.png`. His iPhone not yet.

## The fifth round — his recording of 11:09 ("this section looks abit twitchy", the Tracker's All events)

Read at 30 frames a second: each time the keys came up the panel jumped about 140–300 points down, then rose with the
phone's slide; each time they went, it jumped up, then fell. His iPhone slides the page over about a quarter of a second but
tells of it once, with the final pan, so a window placed at once for the end stood a whole slide away for those frames.
**Fix (`kbscroll.ts`):** a window the lift moves, holds or puts back glides from where it was drawn to its new place over a
quarter second (an animation of its own `translate`, stopped exactly when the next placing measures — a CSS transition was
not, and the next placing moved the panel 218 too far); at the phone's own word the window holding the box is moved by the
pan's change at once (`compensate`), so it holds still while the page slides; a placing that takes over mid-slide goes on
along the same curve; a reader who asked for less motion gets the old instant move. Red first: KS3i (his slide played frame
by frame on the window's drawn place) — steps of 294 before; after, 7 runs in 8 under 40 and the eighth 44 (one frame where
the second placing takes over), the test failing above 60. Gates: `kbscroll.test.ts` 39 / 39; the browser set 140 / 140;
the walk `kbs-his-measure.mjs` 4 / 4. **Not known:** when Safari's slide starts against its event, and its curve — tuned
against a model; his iPhone decides.

**Walk:** WALK — his four cases again (`kbs-his-measure.mjs`), 4 / 4, and KS3i's frame-by-frame slide; his iPhone not yet.

## The sixth round — his recordings of 11:49 and 11:54 (the fifth round's build)

**His words:** *"The tracker edit syllabus portion seems better now Comparing to the previous. But this fix cause the input
to look different when I click on the remarks. Like I can see the top of the background behind this window. The old one
was like smoother. I don't see like the inputs button for a second at all."* (11:49: an older tab of the branch beside a
fresh one; 11:54: the fresh one with `?kbdebug`, OL then "Other".) The fault against D1081 (nothing jumps as the keys
open or close).

**The cause, measured (60 frames a second, `video-frames.mjs` at 1/60 s).** The readout is fixed at the pan, so its place
each frame is the phone's own slide. The keys coming up: the page slides on **cubic-bezier(.42,0,.58,1) over 250ms** —
both openings within 1 point (rms 0.98 and 0.83; the round-5 glide's curve, .2,.8,.2,1, misses by 35–45) — and the app is
told of the pan about **30ms after the slide began** (the readout's move first drawn 40 and 42ms in; OL: one `resize`
carrying the pan; "Other": the keys' `resize` first with no pan, the pan's `scroll` 15ms later — his readout,
"92ms vv-resize vv390@0", "107ms vv-scroll vv390@272"). The window's glide ran fast-out from the moment it was told: by
the fourth frame some 90–145 points ahead of the slide, so the window stood that far below its place and the day panel
behind it — its "+ Input" — showed above it for four frames (1.833–1.933 and 7.933–7.983 in the 11:54 recording; 4.133–
4.200 in the fresh tab of 11:49), then rose back. The keys going down: **cubic-bezier(.3,.58,.2,1) over 330ms** — fitted
to the old tab of 11:49, where nothing but the phone moved the window (rms 1.0), and holding on the first frames of both
closings of 11:54 (rms 1.8, 2.7); the focus leaves ~30ms in. (A first reading of a "snap" on closing was the readout
passing under the address bar — the scan began below it.)

**Fix (`kbscroll.ts`).** `SLIDE_UP` / `SLIDE_DOWN` (curve, length, lead) replace `GLIDE_MS` / `GLIDE_EASE`; every glide
runs on the phone's slide for its direction, its start set to when the phone began it (`compensate` at the pan's event
less 30ms; `dropLifts` from a focus leaving less 30ms, from the keys' own `resize` less 60ms; a placing with no slide of
the phone's own from now); a glide that takes over a running one (the placing two frames in) stays on its slide and its
start; a FRESH glide starts as if begun with the slide, so its first frame stands where the slide puts it — the frames the
phone slid before the app was told are not carried and drifted back (the first test of the keys going down: 48 points low
at the first frame, drifting back over the slide). The readout logs `focusout` too.

**Tier: WALK** — the eight questions: money no; the published record no; saved data no (nothing stored); **a shared drawer
yes** (the one lift moves every window raised or held for the keys); a new gesture or surface no; roles no; the warning
list no.

**Roll-call — every window the glide moves:**

| Where | Moves for the keys? | Walked |
|---|---|---|
| The input window from an Inputs calendar day (OL; "Other") | has it | A, A2 |
| The input window from a SANS calendar day | has it | B |
| The input window from the schedule (Edit Schedule, the board) | has it — the same window and the same lift as A | carried by A (same component, same layer) |
| The Tracker's All events (a window taller than the screen) | has it | C |
| A window on a backdrop (Admin → Duty templates, Wave templates) | has it — the box on the backdrop | E |
| The Scheduler Board | must not, because it is page content carried by the phone's own scroll (D1081) — never raised, so never glided | KS1, KS7, KS8 (unchanged) |
| The Leave War's sheets and bid windows | must not, because they place themselves by their own `top` (`Sheet.tsx followVisible`; `compensate` skips them) | not walked (unchanged; filed in [KBS-PHONE-SLIDE]) |

**Sizing (D607):** (1) type E, motion of a window (layout or look) in a shared mechanism, and R (his reported fault);
(2) only a walk shows his screen frame by frame — the tests prove the numbers, not what he sees; every window the lift
moves, at its own pan; (3) the ledger's keyboard rows (this sheet's rounds) found each fault only on his phone or his
measure — the stand-in must play his measured slide; (4) the host alone; five cases (A, A2, B, C, E), up and down,
phone 402 Chromium, both builds (the one he tested, the fix), every frame's place recorded and his screen drawn; the
schedule's input window carried by A; (5) the row added below.

**Red first.** KS3j (OL), KS3k ("Other", the pan 15ms after the keys) and KS3i rewritten (the Tracker) play his measured
slides — measured off his screen, not the app's own curve, which is what let round 5's KS3i pass: it played the glide's
curve as the phone's. On the build he tested: the window's top 79, 118 and 130 points from still. On the fix: within 4.

**The walk** (`scripts/handpass/kbs-slide-walk.mjs`; numbers `docs/img/handpass/2026-10-25-kbs-slide/walk-{before,after}.txt`,
strips `before/` and `after/<case>-{up,down}.png`, the look card's picture `look-before-after.png`). Furthest the window's
top strays from still (points), keys up / down:

| Case | The build he tested | The fix |
|---|---|---|
| A input window, OL, Remarks | 77 / 45 | 0 / 0 |
| A2 input window, "Other", Remarks | 115 / 70 | 0 / 0 |
| B SANS day's input window, Remarks | 70 / 40 | 0 / 0 |
| C Tracker All events, Name | 103 / 55 | 0 / 0 |
| E Duty templates, last time box | 65 / 0 | 0 / 0 |

On the fix the input windows' tops run 12 → 8 as the keys come and 8 → 12 as they go; the Tracker's panel and the Duty
templates box move into place one way with the slide, never down and back. The pictures: Chromium's compositor draws a
moving window between the page's own frames, a frame ahead of the page's clock, and its screencast's stamp lags further —
each frame carries its own time on a 400ms sweep run by the compositor (the first pictures, on the page's clock, showed the
fixed window 15–18 points low and were wrong; `walk-scripts.md` §5).

**Seen, not changed (older, in both builds):** as the keys start, a held window shortens at once to the room it will have,
so for about a tenth of a second the page behind shows in the band between its foot and the rising keys (the Tracker's
graph in C's strips); he called the Tracker better with it there. Filed in [KBS-PHONE-SLIDE], to put to him if he sees it.

**Gates:** `kbscroll.test.ts` 42 / 42 (the measured slides pinned point by point), with `freshbox.test.tsx` 61 / 61;
`e2e/kbscroll.spec.ts` 18 / 18; `npm run build` green. GitHub's run of the pull request is the full set (D1086).

**Walk:** WALK — his measured slides played on five windows, up and down, both builds (`kbs-slide-walk.mjs`): 5 / 5 fail
on the build he tested, 5 / 5 pass on the fix; pictures opened. **Owed: his iPhone look** (the tab closed and reopened).

## After the sixth round — his look, and the fault handed to Fable (25 Oct 26, D1366)

His iPhone look at round 6 (12:57): *"Still similar bug"* — the page behind the input window still shows above it as the
keys come. Six Opus rounds have passed the stand-in keyboard and failed on his phone, so by his call (D903) the fault goes to
Fable after his weekly reset (Mon 26 Oct 26, evening), from a fresh recording he saves for it and the brief
`raptor-port/docs/superpowers/briefs/2026-10-25-kbs-fable-brief.md` (D1366), which asks Fable to weigh going back to the
behaviour before round 5's glide beside a seventh fix. No seventh round is built until then.
