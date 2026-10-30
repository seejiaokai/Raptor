# Bug check — a page opens at its own top; nothing pinned shows what scrolls under it; Quals' pinned headings follow a reflowed column (30 Oct 26, `claude/lw-scroll-pinned-sweep`)

The night of 30 Oct 26, job 1 (unattended, Low). Three backlog items in one batch (D485): `[LW-LEAVE-SCROLL-CARRY]`,
`[PINNED-LEAK-SWEEP]` (his D1518) and `[QUALS-PINNED-COLS-REFLOW]`. Pictures: `docs/img/handpass/2026-10-30-scroll-pinned/`
(`walk/` the walk, `parts/` each part before and after, `pinch/` what the pinch walk met, `q1-week-arrows-marked.png`).

## Questions waiting for him

1. **ANSWERED 30 Oct 26 (D1522): keep them see-through; a design where they block nothing is filed as `[WEEK-ARROWS-NO-BLOCK]`.** **The desktop week's ‹ › arrows are see-through.** They float over the days on View-only Sched and Edit Schedule (since
   long — frosted glass, drawn at three-quarters strength), so the day under an arrow shows through it as the week scrolls:
   picture `docs/img/handpass/2026-10-30-scroll-pinned/q1-week-arrows-marked.png` (the arrow ringed; the day's cyan edge and
   "RU · BFM" through it). Making them solid changes how they look (they would no longer be glass), so it is his to say.
   **Recommended:** solid, in the colour they show over a day today, still brightening under the pointer as now. **Waits on
   it:** only the two arrows (`[WEEK-ARROWS-SEE-THROUGH]`); everything else of this job is done.

## The eight questions and the tier

1 Money — no (no OIL, no balance). 2 The published record — no. 3 Saved data — no (nothing stored changes). 4 A shared drawer —
yes: the page switch is every page's (Shell), the pinned parts are drawn on several screens. 5 A new gesture or mode — no.
6 A new surface — no (the OIL tracker's parts above its list are put in one box; nothing new on screen). 7 Roles — no.
8 The warning list — no. **Tier: WALK.**

## The changes

1. **Each page opens at its own top** (`[LW-LEAVE-SCROLL-CARRY]`, commit 6ec23035c, before this sheet): `ui/Shell.tsx` puts
   the window at its top in a layout effect on a page change, before the new page paints — not on arriving at the Leave War
   (it puts back where he was) and not on the View-only Sched ↔ Edit Schedule hop (as today); `ui/Drawer.tsx` puts the old
   page's scroll back only when the menu closes on the page it opened on. Test: `e2e/leavewar.spec.ts` "a page opened from
   the Leave War scrolled down opens at its own top, and the war comes back where he was" (red first on both projects).
2. **Nothing pinned shows what scrolls under it** (D1518, `[PINNED-LEAK-SWEEP]`, commit 19abc2e74):
   - the OIL tracker: its head, tools row and (when open) legend or date picker are one box, `.oil-top`
     (`leavewar/ui/OilTracker.tsx`), filled in the sheet's own colour across the sheet's width and up to its top, stacked
     over the list's frozen cells; the list keeps what it draws inside its box (`contain: paint` — `oiltracker.css`). Nothing
     moved: P2 below measured every part where it stood, with wide letters.
   - the desktop week's scroll bar at the foot (`#hscroll`, 93% and blurred) — solid `var(--bg)`;
   - Edit Schedule's CREW rail (`.ros-rail`, a 14% blue tint) — solid `#12272e`, the colour it showed over the page;
   - the phone's parked crew drawer on Edit Schedule (`.edit-board .eroster`) and the board (`.schedboard .sb-ros`), 96.5% and
     blurred — solid `var(--bg)`.
   Tests: `e2e/leavewar.spec.ts` "nothing of the OIL tracker's list shows over its tools row…" (both Leave War projects; three
   states), `e2e/geometry.spec.ts` "the parts pinned over the week are solid (D1518)" (desktop and phone). Red first: all four
   failed on the build before.
3. **Quals' pinned headings follow a reflowed column** (`[QUALS-PINNED-COLS-REFLOW]`, commits 19abc2e74, e1f1ad675):
   `ui/QualsPage.tsx` watches the real heading cells as well as the table and its box, and moves the watch onto the new
   cells each time the table is drawn again (`watchCells`, the effect on `tableInner`). Tests: `e2e/geometry.spec.ts`
   "desktop: one column reflowed inside a table of the same width…" and "desktop: an Undo and a Redo that reflow a Quals
   column…" (red first: 178px, then 24.9px off).
4. **The sweep** (`scripts/handpass/pinned-sweep.mjs`, the probe `pinned-probe.mjs`), calibrated (below), and the pinch walk
   (`pinned-pinch.mjs`).

## Roll-call

**(a) Every page opener, per route — "is the page where it should be on its first frame":**

| Opener | Route | Must | Result (first frame) | Proved by |
|---|---|---|---|---|
| The top nav (desktop) | Leave War scrolled 500 → Edit Schedule, View-only Sched, Inputs, Quals, Logic, Help, Admin, Tracker | each at its top | all 8 at 0 | walk L1 desk; e2e (5 of them) |
| The menu (phone) | the same 8 | each at its top | all 8 at 0 (WebKit) | walk L1 phone; e2e lw-phone |
| Back to the Leave War | from each of the 8 | where he was | the same row at the same height, 16 of 16 | walk L1 |
| View-only Sched ↔ Edit Schedule | View-only scrolled 400 → Edit | as today: kept | 400, both widths | walk L2 |
| Undo (top bar) | an Edit Schedule day note typed, Undo on the Leave War scrolled 600 | Edit Schedule, undone, the day in view | top, undone, Thursday at the front, both widths | walk L3 |
| Undo (top bar) | a Quals row's initials typed, Undo on the Leave War scrolled 600 | Quals, the row on screen | the row on screen and ringed, clear of the pinned row, on the first frame (548 / 467) | walk L4 |
| "+ Add person" on Quals | Quals scrolled | Admin with the new person's form in view | form in view (233–497 desk, 333–625 phone) | walk L5 |
| The menu, closed on the same page (phone) | View-only scrolled 500, menu open then closed | its place kept | 500 → 500 | walk L6 |
| The menu, a page picked (phone) | View-only scrolled 500 → Logic | at its top | 0 | walk L6 |
| The bell's Leave War line | the member's "approved" line, tapped on Quals scrolled | the Leave War at that day | 24 Mar in sight, seen, ringed, both widths | walk L7 |
| The bell's other lines (Inputs, Help, Admin) | — | at its top (Shell) | same code path as the menu (`setPage`), not driven: no notice of those kinds in the demo world without a longer fixture | Shell's layout effect, break 1 |

**(b) Every pinned part the sweep found — "is it solid and in front, at every zoom and scroll":** found by the browser (sticky
or fixed, or held still by the app), 4 sizes × 19 states; the parts by page:

| Page | Pinned parts | Result |
|---|---|---|
| Every page | the top bar | solid, in front |
| View-only Sched, Edit Schedule (desktop) | ‹ › week arrows | **see-through by design — question 1** |
| View-only Sched, Edit Schedule (desktop) | the days' scroll bar at the foot | was see-through — **fixed** |
| Edit Schedule (desktop) | the CREW rail; the AIRCREW panel's heading rows (`er-h`, `rh`) | rail was see-through — **fixed**; headings solid |
| Edit Schedule, the board (phone) | the parked crew drawer | was see-through — **fixed** |
| Quals | the pinned heading copy and its callsign heading, the real headings, the callsign column | solid (one sliver at a fractional zoom after a pinch — filed, below) |
| Logic | its pinned row of buttons (`lgbar`) | solid |
| Leave War grid (admin, member) | month buttons and their cell, the frozen date row and corner, the names and LVE columns, group headings, the Manning bar | solid (mid-pinch: one overlap filed, below) |
| Balances (admin, member, search open) | the bar and the lines under it, the headings strip, the name column | solid — D1519's fix holds |
| OIL tracker (at rest, legend, date picker) | its head and tools; its frozen columns and headings | tools were see-through to a spill — **fixed**; the rest solid |
| Inputs (month, list), Approvals, Help, Admin, the Tracker | the top bar only | solid |

## Sizing (§7.0)

1. **Type:** E (layout and look over several screens — fills of pinned parts) and C/A for the page switch (one shared
   behaviour every page reads), plus a fix to one surface's re-measure (Quals).
2. **What only a walk could find:** each page's first frame after a switch, by each route (nav, menu, Undo, bell, a page's
   own button); a designed landing still landing; what stands behind every pinned part at every zoom and scroll, which only a
   real browser draws; a phone's pressed state on the parts made solid; the OIL tracker's parts not moving.
3. **The ledger:** E walks find little in the change (4 of 10), and his own look has found what walks did not (D536, D537,
   D1505 → D1519 — a bar checked by where it sits, never by what it lets through: lesson 15).
4. **The walk chosen:** the host alone (Low), scripted: the sweep at 4 sizes (his iPhone in WebKit, his PC at 125%, zoomed to
   150% and 67%) × 19 states × 4 scroll places with a forced spill of each list; the pinch walk (6 surfaces, out and in,
   mid-pinch and after the lift, Chrome); the walk of 57 checks (L1–L7, P1, P2) at both sizes. Carried by tests: the page
   switch for the five pages of the e2e test (the walk drives all eight); the fills' colours.
   Lessons: 10 (every switch read on its first frame; back to the war by every route) · 11 (zoomed in and out: deskin,
   deskout) · 12 (the OIL tracker from the grid only — its other doors are untouched by this change) · 13 (the pinch part-way
   down, fingers drifting, mid-pinch probe and picture) · 15 (the forced spill, calibrated) · 3 and 5 (what a landing shows,
   and what stands over a landed row: L4's "clear of the pinned row") · 6 and 7 (what only the iPhone draws: below).
5. **After the walk:** its row is in `docs/walk-ledger.md`.

## The calibration (§7.9 — a stand-in is believed only once calibrated)

The sweep's first version reported the Balances page **clean on the build before D1519's fix** — it missed the very fault: the
bar is no sticky or fixed part, it only stands beside the list's scroll box. The probe now notes what stands in a band above
and left of each scroll box (and the strip between the box and a part within 12px), lets the list draw past its edge
(overflow visible, containment off, content slid 120px up and left), and asks again. **On the build before D1519 (main before
pull request 590, Balances files only): 42 leaks at the phone and the desk, admin, member and the search line open — the rows
answering in the bar** (`parts/phone-balances-spill-pre1519.png`); **on this build: 0** (`parts/phone-balances-spill-after.png`).
The first full run's false readings, each of the probe's own and taken out (commit aa7b9b60a): a point in a rounded corner; a
part's area cut by the box that clips it; a sticky row in a box that cannot scroll that way (Quals' real headings); a gap
sampled along a whole edge; a spilled box's own pinned parts; a shade over the whole screen (the OIL tracker's scrim); a box
that clips but does not scroll; a seam where two boxes meet on one screen pixel (the Tracker's head).

## The sweep

Before this job's fixes (the build of 2c3924126's source): the OIL tracker's tools, window line, chips, legend and picker
answered by its list under the spill (phone and desktop, all three states); the days' scroll bar, the CREW rail, the phone
drawers see-through; the week arrows see-through. **After: only the week arrows** (question 1) — phone 0 leaks of 188 parts,
desk / deskin / deskout the two arrows only. Pictures before and after: `parts/`.

## The pinch walk (Chrome, 402 at 3x, real fingers)

The Leave War grid, Balances, the OIL tracker, Quals, the board's desktop layout and the Tracker's chart, each part-way down,
pinched out then in, the fingers drifting; the probe with the fingers down and after the lift. **Balances, OIL tracker,
board, Tracker: 0 at every reading. After every lift: 0.** Met (all older than this job, none of its changes — filed):
- **Leave War grid, mid-pinch in:** the names column's rows are drawn over the lower part of the stretched corner and date
  row until the lift (`pinch/lw-grid-pinch-in-mid-corner.png`) — `[LW-PINCH-IN-CORNER]`.
- **Quals, mid-pinch:** a pinch out part-way down opens an empty band between the pinned heading row and the table; a pinch
  in carries the name column off the left edge until the lift (`pinch/quals-pinch-out-mid-band.png`,
  `pinch/quals-pinch-in-mid-names.png`) — `[QUALS-PINCH-MID]`.
- **Quals at rest after a pinch, at a fractional zoom (0.978):** a one-screen-pixel sliver of a scrolled cell's white letters
  at the name column's left edge (Recon, Talisman, Wildcard), in pixels only — the layout says the column covers it; a
  shadow in the column's colour did not cover it (`pinch/quals-zoomed-edge-sliver.png`) — `[QUALS-ZOOM-EDGE-SLIVER]`.

## The walk — `scripts/handpass/scroll-pinned-walk.mjs`, 57 checks, 57 pass

Desktop (Chromium 1536×730 ×1.25, mouse) and his iPhone's engine (WebKit 402×874 ×3, a finger), on the frozen build of
19abc2e74 (port 4186), the build before on 4187 for P2. L1–L7 as the roll-call above. **P1:** the crew drawer pressed open on
a phone (picture ~90 ms after the lift and settled), the CREW rail at rest and under the pointer, the days' bar pressed, the
OIL tracker's "?" pressed over a scrolled list — each solid. **P2:** the OIL tracker's head, tools, window line, chips and list
where they stood before the fix, Verdana forced from the first paint, phone and desktop — every part within 0.5px. No page
errors. Re-walk after the last fix (Quals' guard out): L4 again on the new build, 6 of 6 at both sizes; the sweep of Quals
(admin and member) and the OIL tracker at the phone and the desk, 0 leaks; the touched browser tests, 31 passed.

## Cases carried by a test

- The page switch for Edit Schedule, View-only Sched, Logic, Help, Admin (`e2e/leavewar.spec.ts`, through the real nav and
  menu) — the walk drives these and three more.
- The fills (`e2e/geometry.spec.ts` "the parts pinned over the week are solid") — read as computed colours; the sweep and the
  pictures are what show nothing behind them.
- The standing "no pinned cell turns see-through on a phone press" (§7.10): the Leave War's own test passes; the screens
  changed here are the week and the board's parked drawer (their fills now solid by rule, pressed in P1) and the OIL tracker
  (P1) — no new standing test was added: the parts changed are not cells of a dense table.

## Break tests — `scripts/handpass/breaks/scroll-pinned.browser.json`

First run 10 of 12 caught. Not caught: the OIL tracker's top with its fill off (reading 1 — the test read only the topmost
element, which a part with no fill still is: it now reads down to a solid fill), and Quals' no-change guard (reading 4 — it
changed nothing a person sees: taken out). **The whole list again after the last code change: 11 of 11 caught** (the guard's
break left the list with its line). Proved first that the list runs: the guard suite unbroken, 10 passed.

## Errors seen

None in the walk or the sweep (page errors watched throughout).

## What was not walked, and why

- **What his iPhone itself draws** (lessons 6, 7, 15): WebKit on this PC is the iPhone's engine, not the iPhone; the spill
  that started D1519 is a stand-in, calibrated. His look on his iPhone at the OIL tracker zoomed out and scrolled, and at the
  phone crew drawer, is owed.
- **WebKit mid-pinch:** WebKit takes no touch input from outside the page, so the pinch walk ran in Chrome only.
- **The bell's Inputs, Help and Admin lines:** not driven (see the roll-call); the same page change as the menu, carried by
  Shell's effect (break 1).
- **The Tracker's other tabs and the Inputs list's headings** named by the backlog item: the sweep found no pinned part on
  them but the top bar.

## Gate counts

On this PC (GitHub's run is the full check while the repo is public, D1086): the touched browser tests 31 passed; seven unit
files 270 passed; the build green. GitHub's run: see the pull request.

`Docs: OUTSTANDING 150 items (+4 −0) · DECISIONS D1–D1520 · homes OK`
`docsize: OK`

## Disposition of every find

| Find | Disposition |
|---|---|
| OIL tracker's tools over its list | fixed red-first (19abc2e74) |
| The days' scroll bar, the CREW rail, the phone crew drawers | fixed red-first (19abc2e74) |
| Quals' pinned headings after a reflow | fixed red-first (19abc2e74, e1f1ad675) |
| The week arrows see-through | a question for him (question 1), `[WEEK-ARROWS-SEE-THROUGH]` |
| Leave War grid mid-pinch in | filed `[LW-PINCH-IN-CORNER]` (older) |
| Quals mid-pinch band and name column | filed `[QUALS-PINCH-MID]` (older) |
| Quals' edge sliver at a fractional zoom | filed `[QUALS-ZOOM-EDGE-SLIVER]` (older) |
| The sweep's own false readings | fixed in the probe (aa7b9b60a) |

## The week arrows built — his D1526 (30 Oct 26, the day after)

**The change:** his answer to the arrows page — *"sliding tab but make it still slightly transparent"* (his option D, drawn as
`scripts/handpass/week-arrows-draw-d.mjs`). At rest each ‹ › is a slim tab, 14 × 70, flush on the window's edge, over the front
day's border and margin only; while the pointer is inside the full arrow's footprint plus 24px, or a key reaches it, it slides
out to the full 38-wide arrow, lit, at 0.9 (still see-through, never solid — D1522); back when the pointer leaves. Code:
`src/ui/scheduler/03-week.css` (the look), `src/ui/pan.ts` (the near rule, one class, `.near`). **Tier: WALK** — §5's
questions 1, 2, 3, 7, 8 NO (no OIL, record, saved data, roles or warnings); 4 YES (one control on two pages), 5 YES (a new
way the control opens).
**Roll-call — every place the arrows are drawn or meet something:** View-only Sched (has it), Edit Schedule (has it), a
phone and up to 820 wide (must not — the floating arrows are desktop only; walked), the failed-save band (moves them down —
walked), the changes and ALL AVAIL windows on the right edge (above them, z-index 410 over 150 — walked), a puck drag
carried to the edge (walked), the keyboard (walked), every other page (hidden — walked, A6).
**Red first:** 5 unit tests (6 after the read) (`src/ui/pan.test.tsx`, two failing on the old arrows) and one browser test
(`e2e/geometry.spec.ts`, failing on the old 38-wide arrow) before the build; then 35/35 and the browser test with the 42
other week and arrow tests, 43/43. The red run is the break test: the browser test fails on today's arrows.
**The walk** (`scripts/handpass/week-arrows-walk.mjs`, pictures `docs/img/handpass/2026-10-30-week-arrows/walk/`), checked
against §7.11's lessons (two speeds, a state left and come back to, a press beside an open window, more than one page):
17/17 — at rest both tabs 14 wide on the edges at 0.75; a slow approach and a fast swipe each open it and leaving closes it;
› pressed three times without moving stays open and in place, a day a press (2 → 3 → 4 → 5); the keyboard opens it and Enter
steps a day; left open, the page left and come back to, it is slim again; at 1366 under the "Not saved" band it opens where
it now is; Edit Schedule the same; the changes window on the right stays above it; an iPhone and 820 wide draw none; no page
errors. The host opened every deciding picture (rest, open, keyboard).
**The fresh read (Opus, blind — D790):** one low finding — on a touch screen wider than 820 a finger tap held the tab open,
because the stylesheet also opened it on hover and a browser keeps a tapped button in hover. Fixed red first: Chromium's
emulation does not hold a tap's hover, so the case is pinned in the walk under WebKit (step E1, iPad on its side — failed on
the build, 38 wide after the tap). Removing the hover opening was not enough: WebKit then sends a pretend mouse move to the
tapped spot, which the near rule took for a mouse; a mouse move within a second of a finger touching is now ignored (unit
test added, failing first). **The fix's narrow reads (§5 — the same fresh reader, who did not write the fix):** round 2 found a
finger held over a second then lifted still left it open (the echo follows the lift) — the lift and a cancel now count too;
round 3 found that closing on the finger's press could shrink an arrow the mouse had opened from under the tap on a touch
laptop — both arrows now close on the lift, never the press. Each red first in the unit tests; round 3 is the last (the cap),
with nothing left open. Re-walk 19/19; browser tests 44/44; unit 38/38.
**His look at the open arrow — D1527 (30 Oct 26):** *"U didnt show me a mock up of how transparent it is. make it similar to
the old one"*, with a close-up of the old arrow at rest. The open look ("still slightly transparent" read as 0.9, lit blue) had
been chosen and built without a picture first — lesson 73 in the design guide's §9. Now the open arrow is the old arrow's
look exactly: frosted at 0.75, grey edge and arrow. Drawn close up three ways at the same spot
(`scripts/handpass/week-arrows-look.mjs`, `docs/img/handpass/2026-10-30-week-arrows/look/`: the old arrow, as first built,
now) and put to him on the arrows page; the browser test now asserts 0.75, the old glass and no blue; browser tests 44/44,
walk 19/19.
**His look (30 Oct 26):** *"Looks right"* — the arrows approved as built, on the preview of 728baf5fd. The read also found the short line of D1526
faithful to its full row (D138).
**Found, not this change's:** a man dragged with a mouse to the left or right edge of Edit Schedule never pans the week
sideways — measured the same with today's arrows, with the new tab and with no arrows at all; filed `[WEEK-DRAG-EDGE-PAN]`.

## Walk:

`Walk: docs/handpass/2026-10-30-scroll-pinned.md · 81 pictures · 15 surfaces · 57 orders · MISSING: 0 (the week arrows a question for him; three older pinch finds filed)`

`Walk (D1526, the week arrows): docs/handpass/2026-10-30-scroll-pinned.md §The week arrows built · 13 pictures · 2 surfaces (View-only Sched, Edit Schedule) + the phone, 820 and an iPad on its side by finger · 19 checks · MISSING: 0 (a mouse drag never pans the week sideways — older, filed [WEEK-DRAG-EDGE-PAN])`
