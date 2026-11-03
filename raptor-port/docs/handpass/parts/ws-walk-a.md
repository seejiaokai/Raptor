# Walker A — the phone's swipe across weeks (build `e44d50a26`, served on 4173), 3 Nov 26

Walker: Sonnet 5.5. Chromium by real touch over CDP at 402 × 874, pixel ratio 3; WebKit by touch events raised inside the page.
Scripts (all under `raptor-port/scripts/handpass/`): `ws-walk-a.mjs` (the scenarios), `ws-walk-a-lib.mjs` (driver and trace),
`ws-walk-a-flick.mjs`, `ws-walk-a-twice.mjs`, `ws-walk-a-twice2.mjs` (the two diagnoses below), `ws-walk-a-wkfps.mjs` (WebKit's frame rate).
Pictures and traces: `raptor-port/docs/img/handpass/2026-11-03-week-swipe/walk/A/` (`A<n>-<engine>-<what>.png`; `A<n>-<engine>-trace.json`;
`results-<engine>.json` holds every try's notes). Console errors, page errors, failed requests and HTTP 4xx over the whole walk: **none**.

How each cross was measured: a trace sampled by `requestAnimationFrame` from before the touch to 700 ms after the lift: the week's `scrollLeft`,
every live day's left edge, both fixed copies (z 41 leaving, z 40 arriving) and the touch events the page saw. Each scenario was run twice:
a clean run (trace only, no screencast, so nothing slows the page) and a pictures run (Chromium: screencast frames chosen by time against the
lift — one before the lift, one at the start of the slide, three inside the slide, one after; WebKit: screenshots). The trace is from the clean run.
"Leaving Δ" = leaving copy's first position minus where the day stood in the last frame before it went up; "arriving Δ" = arriving copy's last
position minus where the real day rests once the copies come off.

## Result in one line

Chromium by real touch: A1, A2, A3, A4, A5, A7, A8, A9, A10a, A10b, A11 **PASS**; A6 (second swipe straight on) **PASS**, but A6b (second swipe
~120 ms after the lift) **FAIL, intermittent**; A12 (844 × 390) **FAIL** (no cross at all: at 844 the app treats the phone as a desktop).
WebKit (in-page touches): A1, A2, A5, A9 **PASS** (endpoints only; see the note on frame rate), A6 **NOT WALKED for its premise** (the crossing itself works).

## Table

| Scenario | Engine | EXPECTED | What happened | Verdict | Pictures / trace |
|---|---|---|---|---|---|
| A1 Edit, Mon 13 Jul, slow right (150px/400ms) | Chromium | cross to Sun 12 Jul; copy goes up where the day stood; arriving copy ends where the day rests; no hop | crossed to week 06/07; day stood at 12 (a 12px pull at the end), leaving copy went up at 12 (Δ 0); arriving copy ended at 24, real day rests at 24 (Δ 0); both copies glide 12→414 and −378→24 at a top speed of 3.0 px/ms (largest step 49.6px/16ms, the glide's own pace); no step over 30px that is not that pace; no frame reversed; Sunday lands at the end (sl 2328, Sunday card at 24); copies up 426 ms; first copy up 91 ms after the lift | PASS | `A1-chromium-1-beforelift`, `-2-slide0-first`, `-2-slide1..3`, `-3-after` · `A1-chromium-trace.json` |
| A2 quick short flick (30px, one move, lifted at once ≈ 65–80 ms) | Chromium | same as A1 | crossed; leaving Δ 0, arriving Δ 0; max 2.86 px/ms; no hop. **How it was first driven:** 30px as two moves over 60 ms failed three times (no cross) — the test browser puts about 34 ms between the last move and the lift, so the app reads a finger that stopped (it needs 45px then). Diagnosed in `ws-walk-a-flick.mjs`: the same 30px as one move crossed 2 of 2 (and 26px, 40px likewise); every multi-move variant did not cross. That is the script's world (a real finger's touch events come every 8–16 ms, so the last 100 ms hold several points), not a fault; the pictured run is the one-move flick | PASS (the 3 first tries are recorded above as the script's own) | `A2-chromium-*` · `A2-chromium-trace.json` |
| A3 curling thumb (70 across, 80 down) | Chromium | crosses | crossed; Δ 0 / 0; 2.88 px/ms; no hop | PASS | `A3-chromium-*` · trace |
| A4 mostly-vertical drag drifting sideways (20 across, 200 down), page first scrolled 400px down | Chromium | no cross; the day scrolls | week stayed 13/07; the page scrolled from 400 to 215; no copies appeared; the page saw the touch (start, moves, end) | PASS | `A4-chromium-1-beforelift`, `-3-after` · trace |
| A5 back: Sun 12 Jul, slow left | Chromium | cross to Mon 13 Jul at its resting place (12px in) | crossed to 13/07; leaving copy went up at 24 where Sunday stood (Δ 0); arriving copy ended at 0 = where Monday rests (Δ 0; week at 12, Monday's day at 0); 2.94 px/ms; no hop | PASS | `A5-chromium-*` · trace |
| A6 Tue 14 → right swipe to Mon; the second right swipe straight on (17 ms after the first lifts) | Chromium | reaches Sun 12 Jul | the week was still 157px from Monday when the second swipe touched (the case under test); crossed to Sunday 12 Jul; Δ 0 / 0; 3.11 px/ms; first copy up 96 ms after the lift. The pictures run of the same scenario began at a different moment and was flagged by my premise check; the clean run (trace) is the evidence | PASS | `A6-chromium-*` · `A6-chromium-trace.json` |
| **A6b** the same, second swipe begun ~120 ms (page clock) after the first lifts | Chromium | reaches Sun 12 Jul | **intermittent no-cross.** Over 24 runs (`ws-walk-a-twice.mjs`): gaps 100–170 ms crossed 20 of 24. In the 4 that did not, the week was standing still 84 or 127px from Monday (no scrollLeft change for 160 ms or more before the second touch — the browser had not begun the first swipe's snap), so the second swipe began at a place the app does not count as the end (more than 24px out, and no scroll in the last 150 ms), only carried the week on to Monday, and the user is still on Monday 13 Jul: the "several swipes only bounce" symptom. At a 17 ms gap 3 of 3 crossed; at 50–100 ms gaps (week already on Monday) 6 of 6 crossed. Whether a real iPhone ever holds the strip still 100+ ms after a lift (this test browser's snap sometimes starts late) is what only his phone shows; the app's rule is "moved within the last 150 ms" | **FAIL (intermittent, 4 of 24)** | `A6b-chromium-*` (the pictures run happened to cross); the failing runs: `A6-chromium-nocross-after-1.png`, `-2.png`, `A6-chromium-nocross-trace-1.json`, `-2.json` (week position by time and the touch marks) · `A6b-chromium-trace.json` (clean run, no cross) |
| A7 wave-dense Monday 20 Jul, touch begun in the middle of Wave 1's block (x 189, y 437; the block does not scroll sideways) | Chromium | crosses to Sun 19 Jul | crossed; leaving copy went up at 0 where the day stood (Δ 0); arriving ended at 24 (Δ 0); 3.12 px/ms; the wave block did not swallow the swipe | PASS | `A7-chromium-*` · trace |
| A8 slow drag 34px, held 300 ms before the lift | Chromium | no cross | week stayed; no copies; the page saw 10 touch moves and the lift (proof the gesture happened) | PASS | `A8-chromium-1-beforelift`, `-3-after` · trace |
| A9 inside the week, Wed → Thu | Chromium | one day, no copies | scrollLeft 792 → 1182 (one day = 390px); no copy ever appeared; week unchanged | PASS | `A9-chromium-*` · trace |
| A10 View-only Sched: A1 | Chromium | as A1 (its own landing code) | crossed to 06/07; leaving Δ 0 (copy at 12 where the day stood); arriving Δ 0; **View-only Sunday rests at 12px, Edit's Sunday at 24px** — the copy ended where each rests; 2.88 px/ms; first copy up 33 ms after the lift | PASS | `A10a-chromium-*` · `A10a-chromium-trace.json` |
| A10 View-only Sched: A5 | Chromium | as A5 | crossed to 13/07; Δ 0 / 0; Monday lands at 12, day at 0; 2.82 px/ms. (First tried at y 430: nothing happened, because Sunday 12 Jul on View-only is a short card ending near y 295 and the finger started on empty page below it — see "seen in passing"; the pictured run starts on the card, y 220) | PASS | `A10b-chromium-*` · trace |
| A11 Scheduler Board on the phone: sideways swipes | Chromium | the week does not change; the board steps by its arrows | on Monday's board (right slow, right flick, right at y 250, right at y 650) and on Sunday's (left slow, left flick, left at y 250, left at y 650): week stayed 13/07, the board stayed open on the same day, no copy ever appeared (sampled all the time); the page saw all 8 touches. Positive control: the board's own › moved Mon → Tue and its ‹ moved Sun → Sat | PASS | `A11-chromium-monday-1-board`, `-2-after-swipes`, `-3-after-arrow`, `A11-chromium-sunday-1..3` |
| **A12** phone on its side, 844 × 390, Monday → Sunday and back | Chromium | cross each way (R5) | **no cross either way, three tries each.** At 844 wide the page lays out as a desktop (the full top navigation, the AIRCREW panel at the right, a "DAY 1 OF 7" bar, ‹ › arrows, one day 552px wide with the next day's edge showing); the swipe moved the browser's own scroll only; no copies. The phone swipe and the glide are coded for widths up to 820 (`window.innerWidth > 820` returns in the touch handler), and 844 is above that | **FAIL** (the roll-call R5 line "has it" is not true at 844) | `A12a-chromium-1-beforelift`, `-3-after`, `A12b-chromium-*` · traces |
| A12x (extra, not asked) 812 × 375 | Chromium | cross each way | crossed each way; Δ 0 / 0 both ends; the copies run at 5.5–5.9 px/ms because the screen is twice as wide (same 340 ms) — my 402-wide speed ceiling flagged it, the positions are exact | PASS in substance (the script's own limit marked it FAIL) | `A12xa-chromium-*`, `A12xb-chromium-*` |
| A1 | WebKit (pixel ratio 3) | as A1 | crossed; leaving copy first at 0 = where the day stood (Δ 0); arriving ended 24 = real day (Δ 0). **Frame rate:** this WebKit draws about 5 frames a second during the glide at pixel ratio 3 (gaps of 170–250 ms: 5 frames in 869 ms, the copies come off after the fallback timer), so no mid-slide statement is possible; at pixel ratio 1 it draws about 30 (13 frames, 35 ms gaps), see the next row. The screenshots taken after the lift show the day before it moved and after it landed, not the slide | PASS (endpoints only) | `A1-webkit-0-before`, `-1..3-slide`, `-4-after` · `A1-webkit-trace.json` |
| A1, A2, A5 | WebKit at pixel ratio 1 (added so the slide is sampled) | as A1 / A2 / A5 | all crossed; leaving Δ 0, arriving Δ 0; 2.9 px/ms; the biggest single step is 88–115px in a 33–48 ms frame gap (the same glide pace); nothing reversed | PASS | `A1-webkit1-*`, `A2-webkit1-*`, `A5-webkit1-*` · traces |
| A2 | WebKit (pixel ratio 3) | as A2 | crossed with Δ 0 / 0 on the third try; the first two tries were flagged only because the sampler had no frame between the touch and the copies going up, so "where the day stood" could not be read (frames 170 ms apart) | PASS (3rd try; first two the script's own) | `A2-webkit-*` · trace |
| A5 | WebKit (pixel ratio 3) | as A5 | crossed; leaving 24 = day stood 24; arriving 0 = Monday; Δ 0 / 0 | PASS (endpoints) | `A5-webkit-*` · trace |
| A6 | WebKit (both ratios) | second swipe crosses | **NOT WALKED for its premise.** In-page touches drive no browser scroll, so the first swipe cannot move the week; I tried setting the week to 157px and smooth-scrolling it to Monday at the lift, but WebKit's snap pulls it straight to Monday, so the second swipe began with the week at 12px. The second swipe then crossed to Sunday 12 Jul with correct endpoints (Δ 0 / 0), i.e. an ordinary Monday-at-rest cross. The settling case itself was walked in Chromium (A6, A6b) | NOT WALKED (premise) | `A6-webkit-*`, `A6-webkit1-*` |
| A9 | WebKit | no copies, no cross | week unchanged, no copies; the one-day move itself cannot be driven by in-page touches (no browser scroll) — so only "no cross, no glide" is proven here | PASS (the part that can be walked) | `A9-webkit-*`, `A9-webkit1-*` |

## Details a reader may want

- **Does the leaving copy's first position equal where the day stood?** Yes, every time, both engines: Δ 0 (A1 12 vs 12, A5 24 vs 24, A7 0 vs 0, View-only 12 vs 12).
  The day had been pulled 12px past Monday by the finger (A1: week at 0, Monday's day at 12), and the copy went up at 12 — no jump back first.
- **Any step over 30px between two frames?** Yes, only the glide's own: 42–50px per 16 ms frame at the start of the slide (peak 2.9–3.1 px/ms, easing out; the
  speeds never rise mid-slide and never reverse). Before the copies go up, the finger-dragged day never moved more than a few px a frame. At the hand-over, no step:
  the arriving copy's last frame equals the real day's first frame (Δ 0), and the real day does not move once the copies are off.
- **Does the arriving copy's last position equal the real day's resting place?** Yes, both engines: Edit's Sunday 24 and Monday 0, View-only's Sunday 12 and Monday 0.
- **Lift to first copy:** 33–96 ms in Chromium (up to 137 ms in the board-less landscape runs); the cross itself 340 ms, the copies stay up 410–445 ms.

## Seen in passing

1. **The arriving copy stands on screen for two frames before the slide.** In every cross the arriving copy is first drawn at its landing place (24 or 0) under the leaving copy
   for 2 frames (20–80 ms), then moves off screen to start its slide. For Edit's Sunday the leaving card (12 wide of the card edge to 390) leaves the arriving card's right
   12px (390–402) not covered in those frames. I could not catch that moment in a picture (the screencast has no frame inside it), so whether anything shows there is **not verified**.
2. **A swipe that starts on empty page below a short day does nothing.** View-only Sunday 12 Jul is a short card (ends near y 295 of 874); a swipe begun at y 430 (empty page)
   moved nothing and crossed nothing (the touch is not on the week). Older behaviour, not from this change; a swipe begun on the card crosses.
3. **A12:** the roll-call's R5 ("has it") needs a decision: at 844 × 390 the phone swipe is off by design (the width test is 820); an iPhone in landscape at 844 gets the desktop's arrows instead.
   At 812 × 375 the swipe and the glide work.
4. **WebKit in this test browser draws the glide at about 5 frames a second at pixel ratio 3** (30 at ratio 1): its slide is not a fair picture of Safari; his iPhone is.
5. After the A7 cross a cyan ring stood round "MAKE PUBLIC" under Sims in the last picture (`A7-chromium-3-after.png`); the finger had lifted nearby, so it is most likely the touch's hover; not investigated.
6. The strip standing still for 160 ms after a lift (A6b) was seen only when the week was left at 84 or 127px by the first swipe; I did not find out whether the browser or the page held the snap back.

## Tries and stopping

A2 (as first driven): 3 tries failed, diagnosed as the script's world, re-driven. A6b: one try per run, the 24-run count is in `ws-walk-a-twice.mjs`'s output above. A10b: 3 tries failed
(the finger began on empty page), re-aimed at the card. A12: 3 tries each way failed — recorded FAIL. WebKit A6: 3 tries each at two pixel ratios, premise unreachable — NOT WALKED.
Every script and browser I started has been stopped (nothing is left running; the server on 4173 was not touched). Nothing was committed; no app file was changed.

Token count: not known to me.
