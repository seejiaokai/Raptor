# A pinch in Edit chart layout moves nothing; the editing view stays there — FULL-tier evidence sheet (23–24 Sep 26)

Branch `claude/tracker-pinch-drags-ball` (from `main` after PR #430) — **MERGED 24 Sep 26 as PR #431 on D133** (his
"merge live" given in advance for this session's work; his look waived — §12). Two faults on one seam, both where Edit
chart layout meets a pinch:

1. **`[TRK-PINCH-DRAGS-BALL]`** — F-B of `2026-09-23-tracker-pinch.md`, filed by the agent: a pinch whose first finger
   lands on a ball also drags that ball; it moves, an undo step appears, the move saves itself.
2. **The owner's report, the same night, from his phone (Vercel preview of the pinch fix):** *"I also see that the left
   side of the tracker chart is cut off"* — screenshot: zoom reads 68 %, the balls are drawn at about half that, and
   a ball is sliced by a straight edge with empty space to its left.

Pictures: `docs/img/handpass/2026-09-23-tracker-pinch-ball/` (a red cross marks the fingers). Walk driver:
`scripts/handpass/trk-pinch-ball.mjs` (two real fingers through Chromium's own touch input; the touch helpers are
`trk-pinch.mjs`'s). Results: `docs/handpass/parts/tracker-pinch-ball/`. Break tests: `trk-pinch-ball-breaks.mjs`.
Scenario design: Astra, `2026-09-23-tracker-pinch-ball-astra-scenarios.md` (brief
`docs/superpowers/briefs/2026-09-23-tracker-pinch-drags-ball-scenarios-brief.md`), before any code changed.

## 1. The eight questions → FULL

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave / manning | **NO** — a chart's layout and view; the Tracker reaches no OIL or manning count |
| 2 | The published record | **NO** |
| 3 | Saved data | **YES** — the bug SAVES a moved ball (and, found here, draws / deletes / merges lines and saves them); the fix puts a stored layout back and touches both undo lists |
| 4 | A shared drawer | **NO** — no drawing routine changes |
| 5 | A gesture / mode | **YES** — the pinch, every first-finger gesture of Edit chart layout, and the switch in and out of it |
| 6 | A surface | **NO** |
| 7 | Roles | **NO** — the Tracker reads no role (D121) |
| 8 | Rules / the warning list | **NO** |

## 2. The rulings that apply

A moved ball saves itself; ✓ Save changes is for structure edits and a drag never lights it (R9/R10, 9 Sep 26) · ONE
undo history on the bar, chart and marks together; undoing a chart step lights Save changes (R108–R110) · the pinch
zooms about the fingers in both modes, sliding fingers carry the chart (23 Sep 26, PR #430) · the edit strip sits
below the bar and never covers the chart (R90) · undo is per login session (R111 — logout while editing, M6) ·
everyone has the same access (D121). No ruling clashes with another here.

## 3. Cause

**Fault 1.** A pinch starts with ONE finger, and in Edit chart layout one finger acts the moment it lands — and only the
canvas pan knew a pinch could follow. Found beyond the filed case by the roll-call (§4) and Astra: a selected group
moves with it; the Line tool's first finger starts a line and the second FINISHES it (a line drawn and saved, a
prerequisite possibly added — and because the Line tool stops the event, the pinch never even starts); with Delete a
drawn line is deleted the moment the finger lands; with Merge the second line merges on landing; a line's squares and
a prerequisite arrow's handles drag on; a second finger landing on another ball starts a second drag.
**Fault 2 (the owner's).** Edit chart layout pans and zooms its canvas with its own view (`view`); leaving kept that
view in force on the ordinary chart, and the next pinch there repainted it as a transform — the chart drawn at
(edit zoom × chart zoom), shifted by the edit pan, and clipped by the chart's own left and top edges. That is his
screenshot: 68 % shown, ~48 % drawn, a ball cut by the chart's edge. It lasted until the next full redraw. Going in and
out also ignored the slack round the chart (added 9 Sep 26): the chart jumped 216 px going in on a phone (121 px at
the smoke suite's zoom) and landed somewhere else coming out (−269, −91 px).

**Fix** (`src/tracker/app/core.js`):
- The pinch counts fingers in the CAPTURE phase, so it sees the second finger before that finger's own handler runs;
  every first-finger gesture (ball, group, box, pan, line, line squares, arrow handles, linehit) starts nothing while
  `pinching`.
- `holdFirstFinger` records the chart as the first finger lands (the chart, its layout, the stored layout key, both
  undo lists, Save changes, the selection, a half-drawn line); `takeBackFirstFinger` — at the second finger — stops the
  first finger's gesture (`fingerStop`, set by each gesture) and, if anything changed, restores all of it the way the
  Tracker's own undo restores a chart, putting the stored layout back (off the command stream, as undo does). A pan
  is kept (it changes nothing; the zoom anchors on the view it left).
- A finger whose target the take-back redrew away and that then lifts off the board is still dropped, by the board's own
  pointerleave (E18); a window-level lift listener was tried and taken out — nothing needed it (break test B8).
- `toggleArrange` holds the point in the middle of the board through the anchor bodies (`chartPointAt` /
  `placeChartPoint`, new `canvasPointAt` / `placeCanvasPoint`), again once React has moved the board (the tool strip),
  re-cutting the slack on the way out. `view` is the identity outside Edit chart layout, always (logout too). A zoom
  changed while editing is the user's own (`zoomIsMine`), as a pinch's is.

## 4. The roll-call — every way a first finger starts something in Edit chart layout, and the switch

| Surface / tool | What the first finger starts | Before | Now | Walked |
|---|---|---|---|---|
| Move — a ball | drag, undo step, saves on the drop | **MISSING** (moves, undo, saved) | has it | E1, E2 (moved first), smoke |
| Move — second finger on another ball | a second drag | **MISSING** | has it (guard) | E3 |
| Select — an unselected ball | replaces the selection, group drag | **MISSING** | has it | E4 |
| Select — a selected group | the whole group moves | **MISSING** (whole chart moved) | has it | E5, smoke |
| Select — bare canvas | selection box | **MISSING** (selection replaced) | has it | E6 |
| Line — bare canvas | starts a line; the second finger finished it | **MISSING** (a line drawn, saved; no zoom) | has it | E7, smoke |
| Line — a line half-drawn | the finger finishes it on landing | **MISSING** | has it — the half-drawn line survives and the next tap ends it | E8, E8b |
| Delete — a drawn line | deleted on landing | **MISSING** | has it | E9, smoke |
| Delete — a ball | click-driven (asks) | has it — a two-finger touch makes no click | same | E10 |
| Connect — a ball | click-driven | has it (no click) | same | E11 |
| Text — a ball | click-driven, opens the editor | has it (no click) | same | E11b |
| Edit lines — a drawn line's end / corner square | drags, detaches the end on landing | **MISSING** | has it | E12 |
| Edit lines — a prerequisite arrow's bend / end squares | the bend handle adds an undo step on landing; the ends reconnect | **MISSING** | has it | E12c |
| Merge — a drawn line | arms it | **MISSING** (armed) | has it | E13 |
| Merge — one finger on each line | merges | **MISSING** | has it | E13b |
| Merge — line one armed, finger on line two | merges on landing | **MISSING** | has it — and line one stays armed (E13d) | E13c, E13d |
| Move/others — bare canvas | pan | has it | same — the pan is kept | E16 |
| an unsaved edit waiting | — | (lost nothing, but the pinch added a step) | kept, nothing added | E13e |
| straight after an undo | — | **MISSING** (↷ lost) | ↷ kept | E14 |
| lift either finger, carry on | — | **MISSING** | nothing moves | E15, E15b |
| fingers slide off the chart, lift over the bar | — | — | the next single finger still drags | E18 |
| an undo from the keyboard / ↶ / ✓ Save changes while a finger is held | — | (no take-back existed) | the undo / save stands | E20, E20b, E20c |
| lifts lost (Safari's way) | — | **MISSING** (every later touch a pinch) | heals on the next touch; the lift heard where it landed | E21, E22, smoke |
| a mouse drag with a pinch in the middle | — | — | finishes and saves | E23 |
| the moment the second finger lands | — | **MISSING** (the chart hopped 36 px) | the chart does not move | every E row ("hop") |
| the command stream / the save indicator | — | **MISSING** (a cancelled save left an envelope) | untouched | every E row, smoke |
| at the 400 % ceiling | the pinch cannot zoom | **MISSING** | nothing moves | E19 |
| the ordinary chart — a ball / ⓘ Details | tap actions | has it (no click) | same | N1 ×2 |
| going in (Edit chart layout) | — | **MISSING** (216 px jump) | the middle held | M1, smoke |
| coming out (✓ Done editing chart) | — | **MISSING** (−269, −91 px) | the middle held | M2, smoke |
| **a pinch after coming out (the owner's report)** | — | **MISSING** (drawn at the edit zoom, cut off) | the chart's own zoom only | M3, smoke |
| out at 400 % → the chart's 300 % | — | **MISSING** | clamped, the middle held | M4 |
| a zoom chosen while editing, then Info and back | — | (snapped back to fit) | kept | M5 |
| logout from inside Edit chart layout | — | **MISSING** (view left behind) | clean | M6 |
| Tool-strip buttons (+ Flight … Edit events) | not on the board — no pinch starts there | must not, because the pinch listens on the board | — | — (Astra: checked) |
| Sideways phone, Edit chart layout | — | **must not be walked, because** the tool strip leaves the chart 0 px (`[TRK-EDIT-SIDEWAYS]`, filed) | — | M1–M3 walked sideways |

## 5. Orders walked (`pinch-ball-before.json` → `pinch-ball-after.json`)

| Size | Unfixed code (first walk) | Unfixed code, the full final set (phone) | Fixed code (final) |
|---|---|---|---|
| Phone 390×844 | **7 / 29** | **12 / 36** (`pinch-ball-before2.json`) | **44 / 44** |
| Sideways 844×390 (Edit chart layout has no room there — only the switch is walked) | **4 / 7** | — | **7 / 7** |
| Tablet 1366×1024 | **7 / 29** | — | **42 / 42** |

The rows added for the two reads (E20–E23, the command stream, the hint, the hop) went red on the fix as it stood before
them (`red-reads`, phone 30 / 44) and pass now.

The unfixed numbers, in the app's words: a pinch starting on a ball moved it and added an undo step every time (E1–E5,
tablet the same); with Line it drew and saved a line and did not zoom at all (E7, E8); with Delete it took the line
off (smoke); straight after an undo it lost ↷ (E14); going in jumped the chart **216 px** (phone) / **277 px**
(tablet); coming out landed it **(−269, −91) px** / **(505, 227) px** off; and **the owner's case**, a pinch after
coming out: the chart drawn at **293 %** while the bar said 145 % on a phone, translated **(−746, −1587)** — the chart
gone from the screen (`before-phone-M3-2-after.png`) — and at (−332, −90) on a tablet. Sideways: a 92 % chart drawn
at 0.92 × 92 %, shifted 66 px. Some unfixed rows could not be reached: once the first pinch in Line had drawn a
stray line, the later line cases found no line of their own (the break tests below are their red).

Fixed, in the app's words: every Edit-chart-layout pinch leaves every ball, drawn line, both undo lists, ✓ Save
changes, the stored layout and the selection exactly as they were, and zooms (E1–E19); a half-drawn line survives and
the next tap ends it (E8b); an armed merge stays armed and completes on the next tap (E13d); one finger still drags a
ball, one undo step, saved, Save changes not lit (E17); going in and out holds the middle of the chart to 1–2 px
(M1, M2, all three sizes); a pinch after coming out zooms the chart it shows, nothing else (M3); 400 % comes back as
300 % with the middle held (M4); a zoom chosen while editing survives the Info tab and back (M5); logging out from
inside Edit chart layout leaves the next login a clean chart (M6); no console or page errors at any size.
**The earlier pinch walk (`trk-pinch.mjs`, PR #430) rerun on this code:** identical to its own results except its two
"a pinch with one finger ON a ball" rows, which now pass (`pinch-regress.json`, 39/46 vs 37/46; the other seven
are its three filed problems, unchanged).

Pictures (before → after): `*-phone-E1-move-*` (the filed bug), `*-phone-E5-selectall-*` (the whole chart),
`*-phone-E8-halfline-*`, `after-phone-E9-deleteline-*`, `after-phone-E12-*` / `after-phone-E12c-*` (line and arrow
squares), `*-phone-M1-*` / `*-M2-*` (the switch), **`*-phone-M3-*` (the owner's report)**, `*-sideways-M3-*`,
`*-tablet-*`.

## 6. Break tests (§8.4) — `breaks.json`, `scripts/handpass/trk-pinch-ball-breaks.mjs`

Each wire broken once, the app rebuilt, the smoke block and/or the phone walk run:

| Wire broken | Went red |
|---|---|
| B1 the pinch counts fingers in the capture phase (made bubble) | 11 — smoke Delete, Line, Done; walk E4, E7, E8, E8b, E9 … |
| B2 the second finger restores (restore skipped) | 10 — smoke "already moved", Delete; walk E2, E4, E8, E9 … |
| B3 the second finger stops the first finger's gesture | 1 — walk E12 (a line's end square dragged on) |
| B4 a second finger starts no drag (`startDrag` guard removed) | 1 — walk E15 |
| B5 leaving leaves `view` behind (the owner's bug put back) | 2 — smoke "after Edit chart layout a pinch…", walk M3 |
| B6 going in holds the middle (placement removed) | 1 — smoke "opening … keeps the middle" (221 px) |
| B7 coming out re-cuts the slack first | 1 — smoke "Done … keeps the middle" (82 px) |
| B8 a lift heard on the window | **0 — in two runs** → the window listener was TAKEN OUT (the board's own pointerleave already drops such a finger; E18 walks it) rather than kept untested |
| **After the two reads** (`breaks-B9-…-B16.json`) | |
| B9 a layout save waits while a first finger is held | 3 — smoke Delete (`cmd`, `lay`), walk E8, E9 |
| B10 a key / a press off the chart ends the take-back window | 3 — walk E20, E20b, E20c |
| B11 a primary touch heals lost lifts | 9 — smoke "two lost lifts"; walk E21 and every touch after it |
| B12 the lift heard on the element it landed on | 1 — walk E22 (the Delete not stored at the lift) |
| B13 the board holds both fingers once a pinch starts | **0 — declared**: it matters only where a browser keeps sending a finger's events to a removed element (Safari, Fable F1); Chromium re-targets them. Kept, not proven here — his iPhone is its check |
| B14 a mouse drag is not the pinch's to stop | 1 — walk E23 |
| B15 the editing canvas cut to size once the strip lands | 3 — walk E1, E13e (`hop`) |
| B16 the take-back puts the instruction back | 2 — walk E8, E13c (`hint2`) |

## 7. Astra's scenarios — dispositions

| Astra | Disposition |
|---|---|
| 1 finishing a half-drawn line | fixed, walked E8 / E8b — the draft survives (its recommendation) |
| 2 Merge / Unmerge across two lines | fixed, walked E13, E13b, E13c, E13d (Merge; Unmerge is the same code path) |
| 3 Delete a drawn line | fixed, walked E9, smoke |
| 4 a prerequisite arrow's bend and ends | fixed, walked E12c (bend, end) |
| 5 a drawn line's ends and corners | fixed, walked E12 (end, corner — a bent line) |
| 6 selected-group drag | fixed, walked E5, smoke |
| 7 selection box | fixed, walked E6 (a whole-chart selection kept) |
| 8 single-ball drag, both orders, second on another ball | fixed, walked E1, E2, E3, E15, E15b |
| 9 pinch after an undo | fixed, walked E14 |
| 10 an unsaved edit waiting | kept, walked E13e |
| 11 Connect | click-driven: a two-finger touch makes no click — walked E11 |
| 12 Text and Delete on balls / arrows | the same — walked E10, E11b (arrows' Delete is click-driven too) |
| 13 pan then pinch; the finger left down | the pan is KEPT (its recommendation); the finger left down does nothing until lifted — unchanged (§11) |
| 14 the ordinary chart's taps | no click from a pinch — walked N1 (pop-up; ⓘ Details bubble with the second finger on another ball) |
| 15 the ordinary chart, one finger left down | unchanged — nothing until it lifts (§11) |
| 16 zoom limits | walked E19 (at 400 % a pinch on a ball still moves nothing) and M4 |
| 17 read-back after reload | the stored layout itself is compared byte for byte in every row |
| Q1 pan / Q3 half-drawn line / Q4 ordinary taps / Q5 immediate actions / Q6 limits | all as Astra recommended |
| Q2 the finger left down after a pinch | left as it is today (inert) — put to him (§11) |

## 8. What was NOT walked, and why

- **A real iPhone** — Chromium's own touch input on the production bundle; his look (§12) is the device check.
- **Sideways phone, Edit chart layout** — the tool strip leaves the chart 0 px (`[TRK-EDIT-SIDEWAYS]`, filed); the
  switch (M1–M3) is walked sideways.
- **A student's wedge on the ordinary chart** — the same click path as N1 (a two-finger touch makes no click).
- **Three fingers; a pinch starting on a tool-strip button** — not reachable in normal use.

## 9. Gates

On the final code (commit `ed29319b` + docs), 24 Sep 26, one at a time at below-normal priority while the demo chat
had the PC (D125, D133), each started only below 55 % load: unit **5819 / 5819** (358 files) · build clean · tfin
**728 / 0** · rulecheck OK · smoke **442 / 442** (431 + the 11 new checks) · e2e **467 passed**, 48 skipped (the
same as the pinch fix's run) · `docsize` every record accounted for (OVER by 84, deferred — D29).
**The smoke suite's first run stopped at check 261** on its own known intermittent (the "+ Add" student box, the
`TRK-SMOKE` timeout its own comment describes — a desktop mouse path none of this change runs); the rerun on the same
code passed 442 / 442. Red first, for the record: the 8 checks of the first fix failed on the old code with the
other 431 green; the 3 added for the reads failed on the first fix (`red-reads`).
**PR #431's checks on his PC:** the first run stopped in the smoke suite at check 231 — the same "+ Add" race
(`[TRK-SMOKE-ADD-RACE]`, filed), straight after a roster pick. Before any re-run: that path runs none of this change,
and an isolated probe (24 adds straight after a syllabus switch or a roster pick) lost nothing on this build or
`main`'s. Re-run once, citing the filed item: all gates green. Merged.

## 10. The two code reads

Fable 5.1 (a subagent) and Astra (Codex, gpt-5.6-sol, high), blind to each other, both read-only, given this sheet
and `docs/superpowers/briefs/2026-09-23-tracker-pinch-ball-final-read-brief.md`; neither built it (D67). Reports
verbatim beside this sheet: `2026-09-23-tracker-pinch-ball-astra-final-read.md`, `…-fable-final-read.md`. Every
finding reproduced as a check that failed on the code before its fix (the smoke block 9/11, the phone walk's new
rows red — `red-reads` below), then fixed.

| Finding | Who | Disposition |
|---|---|---|
| A cancelled Delete / Merge / finished line left a `user` envelope on the command stream for a change that no longer existed (the take-back restored the store off the stream) | Astra #1 high (Fable asked the same, Q3) | **fixed** — a layout save WAITS while a first finger is held and is made once at the lift, never if it becomes a pinch: nothing stored, nothing on the stream. Red first: smoke Delete "changed: cmd", walk E8 / E9 |
| An undo (Ctrl+Z, or ↶ / ✓ Save changes on the bar) made while a finger was held was wiped by the take-back | Astra #2 medium, Fable F3 low | **fixed** — a key, or a press off the chart or by a mouse, ends the take-back window first; the snapshot names its chart and is never laid over another. Red first: walk E20 (undo erased), E20c (the save undone) |
| The take-back wiped the instruction ("Now click where it ends…") and a cancelled save flashed "saved" | Astra #3 low | **fixed** — the instruction comes back for the time it had left; the held save never runs. Red first: walk E8 / E13c (the hint the moment the second finger lands), E9 (the save indicator) |
| Safari can deliver a lift to the element a finger landed on after a redraw removed it; the board never hears it and every later touch reads as a pinch | Fable F1 high (conditional) | **fixed three ways** — a primary touch heals any finger still counted (red first: smoke "two lost lifts", walk E21); the lift is also heard on the element it landed on (red first: walk E22 — the Delete stored at the lift, and the next finger drags); the board holds both fingers once a pinch starts — the one line Chromium cannot prove (break test B13), left to his iPhone |
| Two wires had no gate check (B3, B4 went red only in the walk) | Fable F2 | **fixed** — the smoke block gains a line's end square and "lift one finger, carry on" |
| A mouse drag with a pinch in the middle of it was stopped and never saved | Fable F4 low | **fixed** — only a finger's gesture hands the take-back its stop. Red first: walk E23 |
| **Found by the lost-lift check (neither read):** the editing canvas was cut before the tool strip landed, so the board kept a 36 px scroll and the first take-back's redraw made the whole chart hop under the fingers | the walk | **fixed** — the canvas is cut to size once the strip has landed. Red first: walk E1 "hop" |
| Astra Q1 / Fable Q1 — the finger left down after a pinch; a deliberate long drag joined by a second finger | both | his call — §11 |
| Astra Q3 — a pen counts as a finger | Astra | kept: a pen plus a finger is a pinch, as on any map |
| Fable Q2 — the iPhone check before the merge | Fable | D133 waived his look; the iPhone is the one device no walk here drives — §11 and the look card |

## 11. Calls made, and questions for him

- **A second finger takes back EVERYTHING the first did, however long it had been down** — a ball dragged for a
  second and then joined by a second finger goes back to where the drag began. The filed shape said so, and it is the
  only answer that is right for the common case (a pinch that happened to start on a ball). Stated to him.
- **A pan before the second finger is kept** (Astra's recommendation): it changes nothing stored.
- **After a pinch, the finger left down does nothing until it lifts** — as today, in both modes. Astra suggested it
  should carry on scrolling; that is a feel question, put to him, not built.
- **A zoom chosen in Edit chart layout is now the user's own** (as a pinch or + / − already was): without it, the
  next redraw on a phone snapped it back to fit (M5).
- **Answered — D134, "1 & 2 keep that no change":** (1) a ball dragged on purpose and THEN joined by a second finger
  snaps back — kept; (2) after a pinch, the finger left down does nothing until it lifts — kept.
- **The iPhone.** Fable's F1 is about how Safari delivers a lift; all three of its fixes are in, two proven here with
  simulated lost lifts, the third (the board holding both fingers) only on a real iPhone. D133 merged without his look,
  so the look card below is where that is checked.

## 12. His look — WAIVED for the merge by D133; the card, for the live app

**D133 (24 Sep 26, going to sleep):** *"For this session only after u are done u can merge live."* The merge goes
ahead without his look, once everything above is green and both reads are dealt with — flagged to him that this
skips the look. The card stays here so he can do it on the live app, and anything that is not what he meant is a
quick follow-up:

1. Tracker → Syllabus ✎ → Edit chart layout. Put one finger on a ball and pinch → the chart zooms; the ball stays put,
   ↶ does not light, nothing is saved.
2. Same with ▣ Select all first → nothing moves. With ╱ Line → no line is drawn. With 🗑 Delete, one finger on a
   drawn line → the line stays.
3. Pinch the canvas, then ✓ Done editing chart → the part of the chart that was in the middle is still in the middle.
4. Now pinch the chart → it zooms normally; nothing shrinks or disappears off the left (his report).
5. One finger alone still drags a ball, as before.

`Walk: docs/handpass/2026-09-23-tracker-pinch-ball.md · 76 pictures · 30 surfaces · 44 orders (phone; 42 tablet, 7 sideways) · MISSING: 0 (all fixed red-first; 3 older problems stay filed: [TRK-EDIT-SIDEWAYS], [TRK-TAP-AFTER-DRAG], and the two questions in [TRK-PINCH-ASK])`
