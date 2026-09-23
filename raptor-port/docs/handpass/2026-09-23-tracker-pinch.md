# The Tracker pinch zoom follows the fingers — WALK-tier evidence sheet (23 Sep 26)

Branch `claude/tracker-pinch-anchor` (from `main` after PR #429). **The owner, on the live app the same
evening:** *"The tracker zoom in and out does not follow where my fingers open or close, it's like off to
the top left it's a bug."* Pictures: `docs/img/handpass/2026-09-23-tracker-pinch/` (a red cross marks the
fingers' midpoint). Walk driver: `scripts/handpass/trk-pinch.mjs` (two real fingers through Chromium's own
touch input; results `docs/handpass/parts/tracker-pinch/pinch-after.json`).

## 1. The eight questions → WALK

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave / manning | **NO** — a chart's zoom and scroll; the Tracker reaches no OIL or manning count |
| 2 | The published record | **NO** — nothing published |
| 3 | Saved data | **NO** — zoom and scroll are never stored (`flowZoom` has no storage call); the fix adds no write |
| 4 | A shared drawer | **NO** — no drawing routine changes; the ANCHOR MATHS is now one body with two callers (below) |
| 5 | A gesture / mode | **YES** — the pinch, in both of the chart's modes, and the + / − buttons' anchor |
| 6 | A surface | **NO** — no new screen |
| 7 | Roles | **NO** |
| 8 | Rules / the warning list | **NO** |

## 2. Cause

The pinch worked out "the chart point under the fingers" as if the chart began at the board's very corner.
It does not: it sits inside the board's padding (16 / 12 px) and, since 9 Sep 26, half a view of slack on
each side so any ball can be centred. The + / − buttons learned about the slack that day; the pinch — a
second copy of the same anchor maths — never did. So the anchor landed the padding plus half a view
below-right of the fingers, and everything under them ran off up-left: **807 px** on a phone going
40 % → 133 %, 962 px on a tablet. Measured against the model to the pixel (predicted −307 px, measured −306).
In Edit chart layout the pinch measured from the board, not the canvas inside it (a padding, a border and
any scroll away): 56 px off on a phone, 90 px with sliding fingers.

**Fix** (`src/tracker/app/core.js`): one anchor body — `chartOrigin` / `chartPointAt` / `placeChartPoint` —
used by both the buttons and the pinch; `canvasOrigin` shared by Edit chart layout's pinch and its mouse
wheel. The pinch now keeps the chart point under the fingers' CURRENT midpoint, so fingers that slide
while pinching carry the chart with them, the way a map does.

## 3. The roll-call — every place the chart zooms

| Where | Has it? |
|---|---|
| Pinch on the chart (normal view), phone / sideways / tablet | **has it** — fixed; walked (§5) |
| Pinch in Edit chart layout | **has it** — fixed; walked on empty canvas (§5) |
| + / − buttons | **has it** — now the same body as the pinch; the suite's two button-anchor checks stayed green; walked "− after a pinch" (holds the middle, ≤1 px) |
| reset | **has it** — goes through the + / − body |
| Mouse wheel in Edit chart layout | **has it** — same canvas origin as the pinch now (was 1 px off: the border) |
| ⤢ Fit in Edit chart layout | **must not** — it frames the whole chart; it has no anchor point |
| The info panel's own zoom (PANEL − % +) | **must not** — it scales the panel for a screenshot; no pinch is wired to it |
| Trackpad pinch on a desktop (ctrl + wheel) | **must not, because** nothing listens for it: the browser zooms the whole page, as before — unchanged |

## 4. The door check — ways into the gesture

Both fingers down together (walked); one finger dragging, then a second (the drag stops the moment a pinch
starts — `pinching` blocks it; walked "pinch after a drag"); pinch then one finger (the drag still scrolls;
walked); first finger on EMPTY space vs ON A BALL — on a ball in Edit chart layout it also drags the ball
(**filed, F-B below**); the zoom at its 300 % / 400 % ceilings (a pinch past it holds; walked).

## 5. Orders walked (after the fix — `pinch-after.json`)

| Case | Phone 390×844 | Sideways 844×390 | Tablet 1366×1024 |
|---|---|---|---|
| Pinch out on a ball (before the fix) | **807 px off** | **424 px off** | **962 px off** |
| Pinch out on a ball | 0 px | 0 px | 0 px |
| Pinch in on a ball | 0 px | 0 px | 0 px |
| Pinch while the fingers slide | 1 px | 0 px | 0 px |
| Drag, then pinch | 1 px | — (§7) | 0 px |
| Pinch, then a one-finger drag still scrolls | yes | yes | yes |
| − after a pinch holds the middle of the view | ≤1 px | 0 px | 0 px |
| Edit chart layout: pinch out / in / sliding (empty canvas) | 1.3 / 0.7 / 1.8 px | — (F-C) | 0.6 / 0.9 / 1.2 px |
| "✓ Done editing chart" reachable after a pinch | yes | yes | yes (second tap — F-D) |
| Console / page errors | none | none | none |

Pictures: `before-phone-out-*` / `after-phone-out-*` (the owner's case), `after-phone-slide-*`,
`before-tablet-out-*` / `after-tablet-out-*`, `before-` / `after-phone-sideways-out-2-after`,
`after-phone-edit-*`, `after-phone-sideways-edit-no-room` (F-C).

## 6. Findings and dispositions

| # | Finding | Disposition |
|---|---|---|
| F-A | The reported bug: the pinch zooms about a point below-right of the fingers (normal chart) and off by the canvas's offset (Edit chart layout) | **fixed, red first** — the Tracker suite's four new pinch checks failed on the old code (807 px; 180 px) with all 427 others green, and pass now |
| F-B | Edit chart layout: a pinch with one finger ON a ball also drags that ball — it moves (36 px on a phone), an undo step appears, and the move saves itself | **filed `[TRK-PINCH-DRAGS-BALL]`** — older than this fix; the fix touches a saved change, so it is its own FULL-tier job |
| F-C | Edit chart layout on a phone held sideways: the tool strip fills the screen and leaves the chart 0 px | **filed `[TRK-EDIT-SIDEWAYS]`** — older; a layout job |
| F-D | The first tap on a button (−, the ✎ menu) straight after a one-finger drag or a pinch on the chart does nothing; a second tap works. Finger down and up both reach the button; the browser makes no click. Same on the live code; a mouse click is fine | **filed `[TRK-TAP-AFTER-DRAG]`** — seen only in the test browser's touch emulation; not yet confirmed on a real iPhone |

**Why the [HUMAN-RETEST] walk missed F-A:** its Edit-layout step (w3 item 10) checked that "the pinch
zooms" — the number changed — and never where it zoomed. A gesture check has to measure what the person
sees (the thing under the fingers stays under them), not that a value moved.

## 7. NOT walked, and why

- **A real iPhone** — headless Chromium with touch emulation (CDP touch input). His look (§9) is the device check.
- **Sideways phone, drag then pinch** — at 300 % a ball (174 px) is taller than the sideways chart area (131 px): nothing to aim at. The other sideways rows are walked.
- **Sideways Edit chart layout pinch** — F-C: there is no chart on screen to pinch.
- **Three fingers**, **a pinch starting on a button** — not reachable in normal use.

## 8. Gates

Run 23 Sep 26 on this branch, one at a time on a quiet PC (D86, D125): unit **5819 / 5819** (358 files) ·
build clean · tfin **728 / 0** · rulecheck OK · smoke **431 / 431** (427 + the 4 new pinch checks) · e2e
**467 passed**, 48 skipped.

## 9. His look (on the branch's Vercel preview, on his phone)

1. Tracker → put two fingers on a ball and spread them → the ball stays under your fingers as it grows.
2. Pinch in the same way → it shrinks toward your fingers.
3. Spread your fingers and slide them at the same time → the chart comes with them.
4. Syllabus ✎ → Edit chart layout → pinch on EMPTY space → same. (Not on a ball — that is F-B, filed.)

`Walk: docs/handpass/2026-09-23-tracker-pinch.md · 15 pictures · 5 surfaces · 10 orders · MISSING: 0 (3 older problems filed: F-B, F-C, F-D)`
