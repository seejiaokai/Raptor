# [NO-PAGE-ZOOM] — the bug check (2 Nov 26, `claude/no-page-zoom`, pull request 613)

His D1567 (2 Nov 26): *"Can u disable the other kind of zooming? So only allow the grids to be zoomed. Not the page.
Sometimes I get stuck and I can't zoom out if the page zooms in."* — on a phone the page itself never zooms; only the
grids that zoom by their own pinch do. Built: `touch-action:pan-x pan-y` on the page under `(pointer:coarse)`
(`00-foundation-login.css`), `maximum-scale=1, user-scalable=no` on a touch screen that is not an iPhone (`index.html`),
an iPhone's own gesture events cancelled on the whole page (`src/ui/nopagezoom.ts`). Contract: `docs/ui-contracts.md`
§On a touch screen the page itself never zooms.

## The eight answers and the tier

1 OIL — no. 2 published record — no. 3 saved data — no. 4 shared drawer — no drawing routine; but one rule on the page
reaches every surface (treated as a reason to walk every kind of surface). 5 gesture — **yes**: a gesture taken away (the
page's pinch and double tap) beside gestures that must stay (each grid's pinch, swipes, scrolls, drags). 6 new surface —
no. 7 roles — no. 8 warnings — no. **Tier: WALK.** No code read (the tier carries none); GitHub's run is the gate set (D1086).

## The roll-call — every place a finger can pinch, and every other surface

| Surface | Must | Proved by |
|---|---|---|
| The sign-in page | not zoom | N0a–N0c (Chromium), N0a–N0b (WebKit) |
| Edit Schedule's week — top, part-way down, quick and slow | not zoom | N1–N3; `e2e/nopagezoom.spec.ts` |
| The top bar | not zoom | N4 |
| A window over the page (the schedule's input window) | not zoom; stays open; closes | N7a–N7c |
| Logic's words — a double tap | not zoom | N6; spec's double-tap test (already green before — Chromium's emulation does not double-tap zoom, kept as a guard) |
| The Scheduler Board's phone layout (no pinch of its own) | not zoom | G1a |
| The Scheduler Board's desktop layout | its own pinch stays | G1b–G1c; `e2e/pinchzoom.spec.ts` (7) |
| Quals | its own pinch stays | G2a–G2b; `e2e/pinchzoom.spec.ts` (4) |
| The Leave War grid | its own pinch stays | G3a–G3b; `e2e/leavewar.spec.ts` (lw-phone, pinch tests) |
| The Balances page | its own pinch stays | G4a–G4b (no browser test pins it — the walk is its proof) |
| The OIL tab | its own pinch stays; closes by Escape | G5a–G5c; `e2e/leavewar.spec.ts` |
| The Tracker's chart | its own pinch stays | G6a–G6b (Chromium); the Tracker smoke's pinch (GitHub's run) |
| One finger: the page's scroll, the week's day swipe | stays | N5a–N5b |
| Every everyday page read at 402 without zoom | readable | R-viewsched, R-inputs, R-logic, R-help, R-admin + pictures |
| His PC (a mouse): the page's touch rule, its setting, a trackpad's gestures, Ctrl+scroll over the grid | unchanged | D1–D5; spec's desktop test |
| The keyboard on a phone (kbscroll, the focus zoom) | unchanged | must not, because the iPhone's page setting is untouched and nothing listens to the keys or the visible screen; `e2e/kbscroll.spec.ts` on GitHub's run |

## The five sizing lines (§7.0)

1. **Type:** C (a gesture taken away, gestures kept) and E (one style on the page, reaching every surface).
2. **What only a walk finds:** a grid whose pinch the page's new rule silently stops; a swipe or scroll it stops; a page
   only readable zoomed in; Safari's own page zoom — which no test browser plays (lessons 6, 7).
3. **The ledger:** gesture walks of the pinch jobs (23 and 31 Oct 26) found faults only mid-gesture and part-way down
   (lesson 13), and only his iPhone found what Safari draws (lesson 6).
4. **The walk chosen:** the host alone, one script (`scripts/handpass/nopagezoom-walk.mjs`), 33 steps in Chromium by real
   fingers at his iPhone's 402 × 874 at 3x, the same in WebKit by touches made inside the page (19 steps — no page scale to
   read there), and 5 at his PC's 1536. Quick and slow pinches (lesson 2), part-way down (lesson 13), a window pinched then
   closed (lesson 19). Repeated grid cases carried by the existing browser tests above (real fingers, real controls).
   Lessons 1, 3–5, 8–12, 14–18: no state reading, feedback, box lifted, drawing, list alignment, hidden page, fit-dependent
   reading, multi-door window, keyboard box, pinned bar, typed figure, width control or print in this change.
5. **Row:** added to `docs/walk-ledger.md`.

## Orders walked and what the screen said

Chromium **33/33 PASS** · WebKit **16/19** · desktop **5/5** (`docs/img/handpass/2026-11-02-no-page-zoom/*/results.json`).
Red first: `e2e/nopagezoom.spec.ts` on the old build — two fingers over the week took the page to **5×**.

## Cases carried by a test

- `src/ui/nopagezoom.test.ts` — the gesture events cancelled on a finger-first screen, left alone on a desktop, the setting
  and the stylesheet carry their lines (calls the installer directly; the real fingers are the walk's).
- `e2e/pinchzoom.spec.ts`, `e2e/leavewar.spec.ts` pinch tests — every grid's own pinch by real fingers through the app.

## What was not walked, and why

- **Safari's own page zoom on his iPhone** — no test browser plays an iPhone's pinch or its gesture events from outside the
  page. Carried by: the gesture events cancelled (N0b in both engines, the unit test) and the stylesheet's rule (WebKit
  computes `pan-x pan-y`, N0a). **His look card asks him to try it.**
- WebKit N5a, N5b, G6a — touches made inside the page drive no browser scroll and no pointer events (the Tracker's chart
  pinches by pointer events): the method's limit, not a fault; all three pass in Chromium by real fingers. The Tracker's
  chart and the Leave War grid, Quals and the Balances page already carried `touch-action:pan-x pan-y` on their own boxes,
  so the page's rule changes nothing under them.
- His recording could not be opened here (no video tool on this PC); the fix covers every page, so where he was stuck does
  not change it.

## The pictures

`docs/img/handpass/2026-11-02-no-page-zoom/` — 33 (chromium, webkit, desktop folders; `stchip-phone.png`).

## Found, and each disposition

- **The smallest words on a phone are the week's stores chips ("TPOD", "2 TKS"), 7.5px** (a desktop draws them at 9). Not
  new, but they could be pinched to before. Opened at 3× (`stchip-phone.png`): short bold codes, legible. **No change;
  on his look card** — if they are hard to read on his iPhone, raising them to the desktop's 9 is his to say (D487, D812).
- Walk-script faults only (an event made not to bubble, a closed window not closed first, a 0px hidden label counted) —
  fixed in the script, re-run.

## Gate counts

On his PC: `nopagezoom.test.ts` 5/5; the browser run of `nopagezoom.spec.ts` + `pinchzoom.spec.ts` + the Leave War pinch
tests 28/28; the code check: no new finding. The full set: GitHub's run of pull request 613 (D1086).

## His look card

1. On your iPhone, open the preview and pinch two fingers apart anywhere on Edit Schedule, the Inputs page and an open
   window: nothing should zoom. Double-tap some words: nothing should zoom.
2. Pinch the Leave War grid, Quals, the Scheduler Board's wide layout and the Tracker's chart: each should still zoom.
3. The stores chips on the week ("TPOD", "2 TKS") are now the smallest words you cannot zoom into: easy enough to read?
