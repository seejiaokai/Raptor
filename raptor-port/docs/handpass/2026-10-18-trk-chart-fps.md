# Evidence sheet — the Tracker's chart scrolled by the phone itself, the pinch as a picture (`[TRK-CHART-FPS]`, D992), 18 Oct 26

Branch `claude/trk-chart-fps`. Built by Opus 5.5 in this chat; read by a fresh, blind Opus reader (D790). The walk:
`scripts/handpass/trk-fps-walk.mjs` (real fingers through Chromium's touch input, and a real mouse, on the production
bundle), its pictures `docs/img/handpass/2026-10-18-trk-chart-fps/walk/`, its results `docs/handpass/parts/trk-fps/walk.json`.

## Questions waiting for him

None. **His look on his iPhone, 18 Oct 26: "Yes this feels good"** — given on the preview; his "merge live" is what is left. His look on his iPhone carries the lines only a real device can prove (the last section).

## Why — what was measured before anything was built

His report (17–18 Oct 26): the chart looks choppy when it moves; it is the chart's finger scroll; his phone is an iPhone 17
Pro (a 120-frame screen) and he opens the app in Chrome. Found: Safari on such a phone draws a page's own motion near 60
frames by default ("Prefer Page Rendering Updates near 60fps"), and Chrome on an iPhone (Apple's WebKit underneath) holds it
there with no setting; the iPhone's own scrolling runs at 120. The chart's scroll was the app's own (the glide of
`[TRK-SCROLL-GLIDE]`), so it was held at 60. **His test:** in Safari with that setting off, the chart scrolled smoother —
"Ok it's smoother now on safari" — then "The scroll is smoother than the pinch. The pinch feels like slower FPS".

Measured here (390 × 844, a finger through Chromium's touch input, frames a second while the gesture runs; the computer
slowed by the factor shown; the same script, `fps` below, on the old build and the new):

| Gesture | Before — normal / ½ speed / ¼ speed | After — normal / ½ / ¼ | Why |
|---|---|---|---|
| A finger scroll | 60 / 60 / 60 | the phone's own scroll (this test browser shows the page's frames at 60 / 59 / ~50 while it moves; the scroll itself runs off the page's drawing) | before: drawing was cheap — the only limit was the 60-frame hold on a page's own motion |
| A pinch | 59 / 24 / 12 | **60 / 59 / 30** | before: each step of the fingers set the chart's zoom and laid the whole chart out again (about 80 thousandths of a second a step at ¼ speed, against 33 for a scroll step); after: one transform a step, one layout at the lift |

At ¼ speed the two slow frames left in a pinch are its start (the measure of the transform's pixel) and its lift (the one
layout); the frames between them hold. The test browser here draws at 60, so 120 can be seen only on his iPhone.

## The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — scrolling and zooming move no mark, date or credit. |
| 2 | The published record | NO — the Tracker has none; nothing is written. |
| 3 | Saved data | NO — nothing stored changes; the zoom and the scroll place are not saved. |
| 4 | A shared drawer | YES — `dragScroll` serves two places (the chart's board and the Info half). |
| 5 | A new gesture or mode | YES — a finger is now the browser's scroll; the pinch draws differently while it runs. |
| 6 | A new surface | NO. |
| 7 | Roles | NO — the Tracker reads no role (D121). |
| 8 | The warning list | NO. |

**Tier: WALK** (4 and 5), with the fresh Opus code read on top (D790) — a gesture on the most-used Tracker surface.

## The rulings swept

D992 (this job) · D991 (speed is part of how good the app feels) · D985–D987 (the glide, the touch that only stops it, the
bounce — now the phone's own) · D988 (a mouse drag stops where it is let go, never bounces) · D989 (two fingers stop a
glide; the app's own move wins; Edit chart layout untouched) · D134 (the pinch take-back; after a pinch the finger left
down does nothing until it lifts) · D984 (the landing) · D980 (the chart by keyboard — Home / End stop a glide first) ·
D899 (Edit chart layout's edge pan) · D158 (the test browser's tap-after-drag quirk) · the design guide §5 (motion: D987's
bounce, D991's "smooth") · `docs/performance.md` Part 1 (nothing new on a hot path; a transform for the pinch).

## The roll-call — every place a finger, two fingers or a mouse moves the chart or the Info half

| Place | A finger: the phone's own scroll | Two fingers: the pinch as a picture | A mouse: the app's own drag, unchanged (D988) | What shares the pixels — checked |
|---|---|---|---|---|
| The chart, phone 390 (Flow chart tab) | YES — W1, W5, W6 | YES — W2 (out), W3 (in), W4 (the finger left down, D134) | MUST NOT, because a phone has no mouse | events: a tap opens (W5b), a drag that starts on one opens nothing (W6); the zoom bar's + straight after a scroll (W7) |
| The chart, a phone on its side 844 × 390 | YES — S1 | YES, the same code as W2–W4 — not walked again, because nothing in the pinch reads the screen's shape | — | — |
| The chart, an iPad on its side 1180 × 820 | YES — P1 | YES, the same code — not walked again (as above) | — | the Info half beside it (P2) |
| The chart, desktop 1440 | MUST NOT, because a desktop has no finger (a touch-screen laptop is a finger — the same code as P1) | — | YES — D1 stops where it is let go | a click on an event opens it (D3) |
| Edit chart layout (phone) | MUST NOT — its canvas pans by its own code (`touch-action:none` on the canvas) | its own pinch (its view), untouched | — | W10: a finger pans the canvas, a pinch zooms its view, no picture left on the chart |
| The Info tab, phone 390 | YES — W8 (zoomed 160% by its own +) | MUST NOT — the Info half has no pinch (never had) | — | its event chip: a tap lands that event on the chart (W9) |
| The Info half, iPad on its side | YES — P2 | — | — | — |
| The Info half, desktop 1440 | — | — | YES — D2 moves it and stops at the release | — |
| The Failures card's own list, inside Info | YES — the phone's own scroll scrolls the innermost box that can scroll (the browser's rule, not ours) | — | a mouse drag there moves the Info half, as before (the mouse code is the old code, line for line) | NOT WALKED here — the same browser rule as the walked boxes; on his look card |
| The lull calendar (a window inside Info) | a finger on its backdrop: the browser's scroll of Info under a fixed window, which does not move with it | — | a press inside a fixed window starts no mouse drag (the old rule, kept) | on his look card |

## The sizing step (D607)

1. **Type:** C — a gesture on a surface drawn by its own code in two places (the chart's board, the Info half), with a
   touch of D (the same routine wired twice).
2. **What only a walk could find:** whether the browser really scrolls the boxes now, at every size; whether the pinch's
   picture keeps the spot under the fingers and lands where they ended (its pixel measured against the chart's zoom);
   whether taps, the zoom buttons, a chip's landing and Edit chart layout still behave; that a mouse is untouched.
3. **The ledger:** C walks (the glide, the Tracker batch, the reorder drag) each found real faults in orders of action.
4. **The walk chosen:** the host alone, one scripted pass (21 checks), phone 390 (touch), a phone on its side, an iPad on
   its side (touch), desktop 1440 (mouse), plus eight break tests. **What this test browser cannot do:** make a glide
   from scripted fingers, bounce, or draw at 120 frames — so the phone's own glide, bounce and touch-to-stop, and the
   frame rate itself, are on his look card; the pinch's frame rate is measured (the table above).
5. **The ledger row:** added at the close.

## The orders walked (each a check in the walk; the values each judged are in `parts/trk-fps/walk.json`)

| # | Order | Result |
|---|---|---|
| W1 | phone: a finger drag on the chart | PASS — scrolled 245 by the browser; nothing of the app's left drawn on it |
| W2 | phone: a pinch out, the fingers sliding as they open | PASS — mid-pinch the chart is a stretched picture (its zoom still 40%), the event under the fingers 0px off; at the lift laid out at 147%, still 0px off |
| W3 | phone: a pinch in | PASS — 147% → 60%, the event 1px off where the fingers ended |
| W4 | phone: a pinch, one finger lifted, the other moved 250px | PASS — the chart did not move (D134) |
| W5 | phone: a finger drag after a pinch; a tap on an event | PASS — it scrolls; the tap opens the event's pop-up |
| W6 | phone: a drag that starts on an event | PASS — the chart scrolled, nothing opened |
| W7 | phone: the zoom's + pressed straight after a finger scroll | PASS — the middle of the view stays in view; nothing left on the box |
| W8 | phone: a finger drag on the Info tab | PASS — 226 screen pixels (141 of its own at 160%) |
| W9 | phone: a tap on an Info event chip | PASS — the Flow chart opens with that event in view |
| W10 | phone: Edit chart layout, a finger and a pinch | PASS — its canvas pans and zooms by its own code |
| S1 | a phone on its side: a finger drag | PASS |
| P1, P2 | an iPad on its side: a finger on each half | PASS — both scroll |
| D1–D3 | desktop: a fast mouse drag on the chart; on the Info half; a click on an event | PASS — each stops at the release; the click opens |
| E1–E4 | the error list at every size | PASS — none |

**The Tracker suite** (`npm run smoke:tracker`, its scroll and pinch checks rewritten for D992): 452 of 453 on the first
run; the one red was the suite's Info check meeting an Info half with nothing to scroll in that test world (room 0) — the
check now zooms it in by its own + first, as the walk does. Re-run below (Gates).

## Pictures (`docs/img/handpass/2026-10-18-trk-chart-fps/walk/`, opened and looked at)

`w1-phone-chart-before-drag` / `-after-drag` · `w2-phone-pinch-out-mid-picture` / `-after-lift` (the same view, no jump at
the lift) · `w3-phone-pinch-in-after-lift` · `w5-phone-tap-opens-event` · `w8-phone-info-after-drag` ·
`w9-phone-chip-tap-lands` · `w10-phone-edit-layout-pan-and-pinch` · `s1-short-screen-after-drag` ·
`p1-ipad-both-halves-after-drag` · `d1-desktop-mouse-drag-stops`.

## Break tests (`scripts/handpass/trk-fps-breaks.mjs` — each wire broken once, the app rebuilt, the walk run on it; `parts/trk-fps/breaks.json`)

| # | The wire broken | Caught by |
|---|---|---|
| 1 | the chart's box keeps the finger from the browser | W1, W5, W6, S1, P1 |
| 2 | the Info half keeps the finger from the browser | W8, P2 |
| 3 | the pinch sets the zoom at every step again (no picture) | W2, W4 |
| 4 | the lift lays nothing out | W2, W3 |
| 5 | two fingers are not held from the browser | **not by the walk** — Chromium does not take two fingers from the pinch without the hold (an engine difference, the order §7.9); so `src/tracker/trk-chart-fps.test.tsx` pins the wire itself — red with the break, green without (run by hand, 18 Oct 26) — and the iPhone's side is on his look card (5) |
| 6 | a mouse drag is not the app's any more | D1, D2 (and the unit test's last case) |
| 7 | the pinch's spot not carried with the fingers | W2 |
| 8 | the app's own move does not stop the phone's glide | **not caught, as expected** — this test browser makes no glide; his look card (6) |

## The code read (a fresh, blind Opus reader of the build as walked, given the brief `docs/superpowers/briefs/2026-10-18-trk-chart-fps-read.md` — D790)

| # | Finding | Disposition |
|---|---|---|
| F1 | The app's own move probably did not stop the phone's glide: the box was made unscrollable and scrollable again inside one task, and the glide runs outside the page (the iPhone's scroller, Chrome's compositor), which hears of it only at the next frame | **FIXED, red first** — the box stays unscrollable for two frames, the caller's own scroll landing meanwhile, and only right after a finger's scroll (a mouse's or a wheel's is left alone, so no scrollbar flashes on a desktop). Pinned: `trk-chart-fps.test.tsx` (D989 block). Whether the iPhone's glide really stops: his look card (6) |
| F2 | A finger resting anywhere else on the screen (a thumb on the Info half) froze the chart: a touch event's list counts every finger on the screen | **FIXED, red first** — only the chart's own fingers count, by their ids. Pinned (the "resting off the chart" case) |
| F3 | A redraw mid-pinch could let the browser take the fingers: their moves go to the detached target, never reaching the chart's canceller | **FIXED, red first** — the hold is hung on each held finger's own target too. Pinned (the "detached target" case) |
| F4 | The touch canceller is attached all the time, so a scroll's first move waits on the page | **DECLINED** — a canceller added in the middle of a touch may not be honoured as able to cancel (the browsers decide that when the touch begins), which would undo the hold; the wait is only felt while the page is busy, and the chart is at rest when a scroll begins |
| — | Not new, met in passing: switching Edit chart layout mid-pinch (a third finger, through the menu) throws in the pinch's move; the lost-lift path settles the zoom but leaves the % label stale | older code, unchanged by this job — not widened (§7.0) |

The three fixes were red on the build as walked and green after (`trk-chart-fps.test.tsx`: 3 failed / 6 passed on it, 9 / 9 after). **Re-walk** after the fixes: 21 of 21 (`parts/trk-fps/rewalk/walk.json`, pictures `…/rewalk/`).

## The fix reads (a fresh, blind Opus reader each round, handed only the fix commit and the findings it answers — the order's "a fix is new code"; three rounds, the agent's cap)

| Round | Finding | Disposition |
|---|---|---|
| 2 (of `e50b22115`) | 1. On a touch-screen laptop the two-frame hold shows (the scrollbars blink, a caller measures a scrollbar's width off), and a later wheel or mouse scroll still set it off | **FIXED, red first** — a mouse's press or a wheel clears the finger's mark; a box whose scrollbars take room keeps them (the toggle within one task) |
| 2 | 2. On Android, a finger id reused after a lift lost to a redraw could count a thumb off the chart as the chart's, freezing it for one gesture (an iPhone gives each touch a fresh id) | **FIXED, red first** — a finger landing anywhere frees its id |
| 2 | 3. The glide-stop test's name claimed "its place kept", which it did not prove | **FIXED** — renamed to what it proves; whether the iPhone's glide stops is on the look card |
| 3 (of `ddeffbaae`) | F1. A key no longer stopped a glide: round 2's "a key clears the mark" ran before the key's own move | **FIXED, red first** — the key's clear is gone; a stop spends the mark instead, so a key held after a flick stops it once, not at every repeat |
| 3 | F2. On a touch-screen laptop the toggle within one task probably stops no glide (the earlier F1's own reason) | **SAID PLAINLY, not built round** — a rare device, his is an iPhone; the code's comment says so: on such a laptop a finger's glide can carry on over the app's own move |
| 3 | F3. A phone's own rounding could read as a scrollbar by a pixel and send it down the laptop's branch | **FIXED** — a few pixels' allowance (a classic scrollbar is at least about 8) |

After round 3: the Tracker unit tests 485 of 485 (`trk-chart-fps.test.tsx` 13, each new one red on the code before it); the
Tracker suite 453 / 0 and the re-walk 21 / 21 (`parts/trk-fps/rewalk3/`). Round 3 is the last fix read (the cap); what it could not settle is on the look card.

## Gates

| Gate | On `e50b22115` (the full set, the PC's lock, `gatelock.mjs run`) | After rounds 2–3 (the touched suites only) |
|---|---|---|
| unit (`npm test`) | PASS — 11,649 | the Tracker's 485 (all pass); the full set is GitHub's run of the pull request (D902) |
| build | PASS | PASS |
| the original's checks (`tfin`) | PASS — 728 / 0 | — (no engine change) |
| browser tests (`test:e2e`) | PASS — 844 | GitHub's run |
| the Tracker suite (`smoke:tracker`) | PASS — 453 / 0 | round 2: 453 / 0; round 3: 453 / 0 |
| rulecheck · docsize | PASS · PASS | docsize at each commit |

`Walk: docs/handpass/2026-10-18-trk-chart-fps.md · 12 pictures (and three re-walks' sets) · 9 surfaces · 21 checks · MISSING: 9 fixed (3 of the walk script's own, 0 of the app by the walk, 3 + 2 + 2 by the reads), 0 ruled, 0 filed; 1 declined, 1 limit said plainly`

## For his look on his iPhone — what only a real device can prove

1. **The scroll is smooth**, like Settings or Photos — in Chrome, and in Safari with its setting back on.
2. **It glides after a flick, slows to a stop, bounces a little at the top and the bottom** — the iPhone's own.
3. **A touch while it glides only stops it** — nothing opens; the next tap works.
4. **A pinch is steady**, a little soft while zooming in, sharp the moment the fingers lift, and lands where the fingers ended.
5. **After a pinch, the finger left down does nothing** until it lifts.
6. **A search, a tap on an Info chip, the zoom's + or an arrow key while the chart is still gliding** stops the glide and lands right (the app's own move wins) — and there is no flash when it does.
7. **The Info tab scrolls the same way**, and the Failures card's own list (when it has many) scrolls inside it; dragging the dimmed backdrop of a window open over Info (the lull calendar) does not rubber-band the page behind it.
8. **Two fingers that land a moment apart**, as real fingers do, still pinch — no two-finger scroll, no page zoom.

**If a line fails on his phone — the fallback for each (the code reads' readings):**
- 4 (the picture drifts from the fingers mid-pinch, then jumps at the lift): put the transform on a wrapper outside the
  chart's zoomed box, so every unit is a plain screen pixel; the place at the lift is already right either way.
- 6 (a move mid-glide is lost, or the chart flashes): the stop is one function (`__glideStop` in `dragScroll`) — hold the
  box still longer, or end the glide by scrolling it once to where it is; nothing else depends on how it is done.
- 8 (two fingers scroll instead of pinching): the hold in `enablePinchZoom` is the place; the browser's own pinch can be
  given back to it (`touch-action:pan-x pan-y pinch-zoom`) only by ruling, since it would zoom the whole page.

## D993 — Quals' pinned header row, moved by the browser (18 Oct 26, the same branch)

His look first: on his iPhone the Leave War's pinned date row keeps up with its grid; Quals' does not. His ask: "Could u
try to just fix the quals pinned header with the 120 frames fix. I wanna see the difference". Built the Leave War's way
(the browser moves the row, linked to the table's own scroll), the Leave War's row left as it is.

**The eight questions:** a change to one surface's pinned row (no money, record, stored data, role or warning; no new
gesture) — **LOOK** by the questions; walked as a WALK all the same (a row that must stay in step is a gesture's
companion, and the first frame is a known trap), with a fresh Opus read.

**Roll-call — where the pinned row is drawn:** Quals on a phone (Q1–Q4, Q6), a phone on its side (Q5), a desktop (D1),
in every seat view by the same markup (`qualsHead`), and while editing (Q6). **Must not change:** the Leave War's row —
untouched code; the save-warning band's placement of the row (`e2e/save-note.spec.ts`, its top only — unchanged).

**The walk** (`scripts/handpass/quals-pinned-walk.mjs`, `parts/trk-fps/quals.json`, pictures `…/2026-10-18-trk-chart-fps/quals/`):
9 of 9 — the row over the table from its first frame (Q1, 0px), at every sideways place and after a finger's swipe
(worst 0px, the callsign heading within 0.5px, its copy the column's width to 0px), a tap on the still callsign
heading sorts (Q4), after a rotate (Q5), while editing (Q6), on a desktop (D1), no errors.

**Tests:** `e2e/geometry.spec.ts` — the first-frame test now reads what is seen (a pinned heading over its column) instead
of the row's own scroll place, which the browser's way leaves at 0; a new test pins the wire (the row translated with the
table, its own scroller not written, the still copy there) — **red on the code before D993, green after** (run by
hand under the lock, 18 Oct 26); the Quals unit tests 72 / 72.

**For his look:** with the page scrolled down, swipe Quals sideways — the pinned row keeps up with the table, as the
Leave War's does.
