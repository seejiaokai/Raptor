# The small schedule-and-board fixes — evidence sheet (chats 61–64, 10–11 Nov 26)

Branch `claude/next-jobs-recommendation-c110df`, pull request 756. Built by chat 62; the rest of the walk, a fourth fix,
the reads and this sheet by chat 63; the reads' fixes, the re-walk, W1 and the closing records by chat 64. Pictures: `docs/img/handpass/2026-11-10-sched-board-small/` — `repro/` (chat 61,
the faults before), `walk/` (chat 62's first share, `sb62-walk.mjs`), `walk2/` (chat 63, `sb63-walk.mjs`), each with
its `walk.json`.

## 1. What changed, and the tier

1. [SCHED-MARKS-WALK-ODDS] 1 — the week's issues bar: "N warnings" by count (`src/ui/html.ts` `dayWarnHTML`).
2. [SCHED-MARKS-WALK-ODDS] 3 — the changes window's foot says "Tap a change to go to it — the window stays open." only
   where a drawn line can be tapped; none on an empty list, over lines that cannot be tapped, or on "To go out"
   (`src/ui/ChangesWindow.tsx`).
3. [BOARD-UNDO-SAME-DAY] (D672) — the board's Undo and Redo bring the changed box on screen when it is out of view and
   move nothing when it is in view (`src/ui/boardland.ts`, `src/state/undo-wire.ts`).
4. Found by this walk (W9b) and fixed red-first in chat 63: on a phone with the changes window open, a change below the
   screen was brought up to the screen's foot — under the window. The landing now stops above a window standing on the
   screen's foot (`boardland.ts`; test `e2e/board-undo-land.spec.ts` "the changes window open…", red on the phone
   before the fix, 8 of 8 green after).

**The eight questions (§5):** money NO (no OIL, no count of who is present); published record NO (the window only reads
it; Undo's landing moves the screen, not the step); saved data NO (nothing stored changes); **shared drawer YES** (the
bar's drawer serves Edit Schedule, View-only Sched and a published version's look; the landing serves every board
Undo); new gesture or mode NO (no new control — the foot is words, the landing a scroll); new surface NO; roles NO (a
member's foot unchanged, walked); warning list NO (what a warning says is unchanged — only the bar's count word).
**Tier: WALK.** Not a batch over four features: one check for the lot (D485).

## 2. Roll-call (§6)

**A. "N warning(s)" — every place a count of warnings is drawn** (searched `warning\${`, `' warning'`, `warning<` in
`src/ui`, 11 Nov 26):

| Place | SHOWS the plural | USABLE (its tap) | PAINTED there too |
|---|---|---|---|
| Edit Schedule's week bar (`dayWarnHTML`) | YES — W1 (chat 62), both sizes | YES — opens the list, unchanged (W1 pictures) | the issues word and caret; a hidden warning's count dropped (D472), unchanged |
| View-only Sched's bar (same drawer) | YES — W1 | YES | same |
| A published version's look on the week (`OFW`, same drawer) | YES, by the same line — NO walk of its own because the demo has no older version to look at until a day is re-published; the drawer is the one line walked above | — | — |
| The board's bar (`board.ts`) | YES — already plural before this change (the model fix 1 copied) | YES | unchanged |
| The next-week preview (`peek.ts`) | NO, because it draws no issues bar at all (it reads no warnings, by design) — W4 picture | — | — |
| The day's ⓘ panel "N warning · N advisory · N note" (`html.ts` near `dip-sev`) | MISSING — filed, his to say (D994), in [SCHED-MARKS-WALK-ODDS] | — | — |
| Insights' tile "N warning" (`insights-html.ts`) | MISSING — filed, his to say (D994), in [SCHED-MARKS-WALK-ODDS] | — | — |

**B. The changes window's foot — every opener, every tab, every role:**

| Opened from / state | SHOWS (the right foot) | USABLE (a tap goes, window stays) | PAINTED there |
|---|---|---|---|
| Edit Schedule's clock, admin, untouched week | YES — no foot under "No changes this week yet." (W2) | — nothing to tap | no empty band (W2) |
| Edit Schedule's clock, a change made | YES — "Tap a change…" (W12, three sizes) | YES (W2 tap, window stays) | — |
| A day's "N pending" chip → "To go out" | YES — no window foot; the list's own "Tap a change to go to it." (W5) | — | tabs do not move as the foot comes and goes (W5) |
| Same window, "All changes", Item | YES (W5) | YES | — |
| "All changes", Who | YES (W5) | YES | — |
| Every group folded | YES — no foot (W5; chat 62 W2 for Item) | — nothing drawn to tap | — |
| "New to you" | YES — "✓ Mark all as seen", unchanged (W5) | — | — |
| View-only Sched, admin, a day's "1 change" | YES (W6) | YES | — |
| View-only Sched, member, "1 new" → New to you / All changes | YES — "✓ Mark all as seen" / "Read only — …", never "Tap a change" (W7, three sizes) | lines still tappable, as before | — |
| The board's History | YES (W2, W12) | YES | — |
| The phone's slim bar after "Hide ▾" | NO foot, because the bar draws none (unchanged code path) | its Show ▴ and ✕, unchanged | — |

**C. The board's Undo landing — every way an Undo reaches the board:**

| Route | SHOWS (the box brought on screen / nothing moves) | USABLE | PAINTED over the landed box |
|---|---|---|---|
| Board's Undo, box above the screen | YES — under the bar (chat 62 W3, PC and phone) | YES | nothing (`elementFromPoint`) |
| Board's Undo, box below the screen (a flying remark; an input's remark — the input branch) | YES — up clear of the foot (W8, three sizes) | YES | nothing |
| Board's Redo, box in view | YES — nothing moves (W3, W12) | YES | — |
| Undo pressed on another day's board (tab on a PC, › on a phone) | YES — Monday back, box in view (W10, three sizes; chat 62's not-run phone step) | YES | nothing |
| Undo with the changes window open, box above | YES (W9, three sizes) | YES, window stays open | nothing |
| Undo with the changes window open, box below | **was MISSING on the phone** — landed under the window (W9b, before); fixed red-first (item 4), re-walked | YES | nothing, after the fix |
| A phone held sideways (the whole board scrolls, D1780) | YES (W8, W9, W10 at 874 × 402) | YES | nothing |
| A keyboard Undo (Ctrl+Z) | NO, because the scheduler has no keyboard Undo — only the Tracker does (searched 11 Nov 26; W11 recorded) | — | — |
| A week load that closed the board, then Undo | YES by the same call (`setBoardDay` then the landing) — carried by the code read, not walked: reaching it needs a week change mid-session; named in the reads' brief | — | — |
| The pinched desktop layout on a phone | up and down only — a known limit, told to him; sideways not handled | — | — |

## 3. Sizing (§7.0, `walk-ledger.md`)

1. **Type:** D (one word drawn by several drawers), C-like routes of one existing control (Undo reaching the board), and
   the window's foot over several openers and roles.
2. **What only a walk could find:** a drawer or opener the change never reached; the landing against what stands over
   the list (the bar, a window, the screen's foot) at each size — jsdom lays nothing out.
3. **The ledger:** type D walks have found faults 10 times in 10 — every opener and surface walked, not sampled.
4. **The walk chosen:** the host alone, scripted (a helper not worth starting for about 25 steps), on the production
   build, at his PC's 1536 × 730 (Chromium), his iPhone's 402 × 874 and a phone on its side 874 × 402 (WebKit, by
   touch). Carried by tests, not walked: the step-to-box addresses for each kind of row (`boardland.test.ts`, the pure
   half, calling the function directly — it proves the addresses, not that the screen moves); the plural's two counts
   (`warnmute-week.test.ts`). Every route on screen above was pressed.
5. **Row added** to the ledger at the close (below).

**Lessons of §7.11, each against this change:** 3 (after every press, what tells him) — the landing IS the telling,
pictured just after each press (W8–W10 "just-after" pictures); 4 (a window that leaves the page working) — W9/W9b press
Undo behind the open window; 5 (a box moved into sight, checked against all that can stand over it) — **this is the
lesson W9b met**, the window at the foot; 12 (every page a window opens from) — Edit Schedule, View-only Sched, the
board; 19 (each way a window closes, WebKit touch) — ✕, the button again; Escape recorded (an open question to him);
21/30 (touch is not his phone; a picture within ~100 ms) — the "just-after" pictures; the bounce of a real iPhone is his
look; 24 (against the top bar, the phone's foot) — W8 brings boxes to the foot at 402 and 874 × 402; 27 (neighbours
before and after a press) — W5 measures the tabs as the foot comes and goes. The rest (drags, pinch, lists measured,
print, the day's turn at midnight, zoom-dependent marks, drawings) do not apply: no drag, gesture, layout, print or
date reading changed, and no screen here has an approved drawing.

## 4. The walk

- Chat 62 (`walk/walk.json`): 21 pass, 0 fail, 1 not run (the phone's other-day step — found no day tab; done as W10).
- Chat 63 (`walk2/walk.json`, on the build with fix 4): **99 pass, 0 fail, 0 not run, 7 records**, 81 pictures, at
  1536 × 730 (Chromium), 402 × 874 and 874 × 402 (WebKit, touch). Before fix 4 the same script's W9b failed on the
  phone ("on top: false — what is there: the window's foot"); the clean run is the re-walk.
- The plain-user round (§7.0a), W12 at three sizes: open the board from the week, change a remark, Undo, Redo, History
  opened and closed by ✕ and by History again, Escape recorded, ✓ Done, the week shows the change, Edit Schedule's
  clock opened and closed — all pass.
- Pictures opened by the host: chat 62's three PC pictures (the bar, the empty window, the board after Undo); chat 63's
  `w9b-phone-3-after-undo` (the remark just above the open window — the fix) and `w5-pc-1-to-go-out` (one foot, the
  list's own). The rest are judged by the script's measured checks (`elementFromPoint`, the foot's words).

## 4a. The re-walk of the reads' fixes (chat 64, 11 Nov 26)

By one Sonnet walker on the new production build, no port (the build is served from inside the test browser). Scripts:
`raptor-port/scripts/handpass/sb63-walk.mjs` (`ONLY=w8,w9`) and `sb64-rewalk.mjs` (v15). Sizes: 1536 × 730 Chromium; 402 × 874
and 874 × 402 WebKit by touch; R2 alone 402 × 874 Chromium with touch (a two-finger pinch needs the browser's own touch
input). Pictures: `docs/img/handpass/2026-11-10-sched-board-small/rewalk/` — 168 from the first re-walk and 28 (`w1-*`)
from the short re-walk, 196 on disk (counted by the host, 11 Nov 26). Notes: `docs/handpass/parts/2026-11-11-sched-board-small-rewalk.md`.

**Totals: 110 PASS, 0 FAIL, 2 NOT RUN, 2 OBSERVED** — the first re-walk 95 PASS, 0 FAIL, 2 NOT RUN, then the short re-walk
of W1 15 PASS, 0 FAIL, 2 OBSERVED. No console, page or network error in any scenario.

- **R1** the changes window open, box below and above (the chat 63 W8, W9, W9b again), three sizes — PASS (27).
- **R2** the pinched desktop layout on a phone, at 0.5 and at 2 — PASS: the box lands under the bar; Redo of a box in view moves nothing.
- **R3a** Auto sort, pc and phone — PASS. **R3b** a row dragged to the head of the Common Programme, pc — PASS (Undo goes to
  the foot, Redo back to the head); a row dragged with both places in view, pc and phone — PASS (nothing moves).
- **R3d** Sort all with the Ground rows in view and rows far above, pc and phone — PASS (nothing moves, Undo and Redo).
- **R4** a rejected Meeting's remark retyped, Personal Inputs folded and scrolled away, pc and phone — PASS (the panel opens and the line is in view; with it folded, an Undo of a remark elsewhere leaves it folded).
- **R5a** sign-off, phone; **R5b** a hidden warning, phone; **R5c** the last warning of a long list hidden, pc; **R5d** a line in view, pc — PASS.
- **R6** a SANS card, pc and phone — PASS. **R7** an accepted input on a Ground row, pc and phone — PASS (nothing moves; Personal Inputs stays folded).
- **R8** the changes window open, below and above, phone and pc — PASS (4). **R9** a flying line's seat, remark and time, three Undos and three Redos, pc — PASS; phone — PASS for the remark and two times.
- **The two NOT RUN:** R3b on the phone (a row dragged by touch never re-ordered in the test browser, in three tries and one in Chromium with touch; the browser test drags it with the mouse at both sizes) and R9's seat step on the phone (the roster drag moved nothing in three tries and the tap route timed out). Not faults: the gestures could not be driven. Filed for his iPhone look, `[BOARD-UNDO-LAND-ODDS]` (vii).
- **W1, the walk's one finding** (seen by the host in the pictures): on a phone a box brought up from below landed under the
  passing "Undid: …" note, which lies over the foot of the list for about two seconds. Before: `rewalk/r4-phone-3-after-undo.png`
  (the remark under the note). After: `rewalk/w1-c-phone-2-settled-undo.png` (the SANS card resting above the note; the line
  28–360 × 718–804 and the note 12–390 × 812–848 in the first W1a). Fixed in `73d6e12a6`; its short re-walk (W1a–W1f):
  a box brought up from below rests clear of the note, phone and desktop (W1a–W1d, PASS); a box already in view near the foot
  is not moved by Undo or Redo (W1e, PASS) and the note does cover it for its two seconds — as D672 says, nothing moves when
  the change is in view; **W1f (observed, both sizes):** the LAST box of the list (the remark of the last Unavailable row)
  still rests under the note after Undo, because the list cannot scroll past its end — the same place as before the fix, not
  a regression; filed, `[BOARD-UNDO-LAND-ODDS]` (ix) (`rewalk/w1-f-phone-2-settled-undo.png`, `rewalk/w1-f-pc-2-settled-undo.png`).
- **Who opened which picture.** The host (the coordinating chat) opened, from the first re-walk: `r4-phone-3-after-undo`,
  `r5c-pc-3-after-undo`, `r2-small-3-after-undo`, `r5a-phone-3-after-undo`, `r3d-phone-3-after-undo`, `r7-phone-3-after-undo`;
  from the short re-walk: `w1-c-phone-2-settled-undo`, `w1-f-phone-2-settled-undo`, `w1-d-pca-2-settled-undo`. The walker
  opened: R2, R3b, R4, R5b, R5c, R6, R8 on the desktop, `w9b` on the phone, `w8` on the desktop, and the settled pictures of
  W1a, W1d (the remark), W1f on the phone and W1b (phone, Undo). **Opened by nobody — PASS on measured readings only:** R3a,
  R5d, R9, the desktop pictures of R3d and R7, and the other W1 pictures.
- **The lesson (for §7.11 and the walk-scripts guide, `[BOARD-UNDO-LAND-ODDS]` (viii), his word):** an "on top" check that
  asks the page what is at a point (`elementFromPoint`) looks through a note that takes no presses, so it passed while the
  note lay over the box. Compare the two rects as well, with every passing note.

## 5. Tests and gates

- Touched unit files: 74 tests green (`boardland`, `histlist`, `warnmute-week`, `html`); `npx tsc -b` clean;
  `npm run lint:changed` no new finding.
- `e2e/board-undo-land.spec.ts`: 8 of 8 green (the new test red on the phone before fix 4).
- Chat 64, after the reads' fixes and the walk's fix W1, on his PC under the checks lock, on `73d6e12a6` (the job's last
  code commit): the whole unit suite 816 files, 14,147 pass, 20 skipped, 0 failed; the type check (`tsc -b`) clean;
  `lint:changed` no new finding; the browser file `e2e/board-undo-land.spec.ts` 36 pass, 0 skipped; `boardland.test.ts`
  59 pass.
- GitHub's run of pull request 756 (the job's full check while the project is public: build, the original's 728, unit,
  browser, the Tracker's, the rule and document checks): GREEN on `fdb9dd3b3` at 03:39 on 11 Nov 26 — that commit carries
  every code change of the job (the last code commit is `73d6e12a6`). Earlier that night the run on `ac05bd045` was RED in
  one unit test (`src/engine/inputs-readers.test.ts`, the guard that lists every file reading the inputs: the new landing
  file read them and was on no list); fixed in `52154e71d`; the runs on `6122567bb` and `2668434f4` were green.
- The run on the branch's last pushed commit: green on `fdb9dd3b3` (03:39 on 11 Nov 26) — the last commit that carries a change of code or tests; the commits after it change records and pictures only, and the run on the last of them is read before his look is asked for and named in this chat's handoff block.

## 6. The reads

Chat 64, 11 Nov 26. Each read's report is saved word for word beside the readers' brief in
`raptor-port/docs/superpowers/briefs/`, with the prefix `2026-11-11-sched-board-small-`.

1. **Astra's blind read** (`read-astra.md`, on `1d2cb16aa`): three findings — the pinched board, a re-ordered row, a folded
   Personal Inputs panel.
2. **The fresh blind Opus read** (`read-opus.md`): five findings (F1–F5) and two cases it could not settle by reading (S1, S2).
3. **Narrow read 1** (`read-narrow1.md`, a fresh Opus reader on fix round 1: `2eac8d6f9`, `ac05bd045`): three faults
   confirmed by its own failing probes (N1–N3), two points read only (N4, N5).
4. **Narrow read 2** (`read-narrow2.md`, on round 2: `41c6f79b4`, `3e06de33d`, `52154e71d`): one fault (a step that
   changed several places) and two points about the tests.
5. **Narrow read 3** (`read-narrow3.md`, on round 3: `2668434f4`, the last read round of three): no fault.
6. **Narrow read 4** (`read-narrow4.md`, a short read of the one commit `73d6e12a6`, the walk's fix): no fault; two
   tidiness notes; one case not checked in a browser (the last box of a list), which the short re-walk then observed.

Every finding and its disposition (the fix brief numbers the eight findings 1–8; each was reproduced by a failing test
first, D790). Round 1 = `2eac8d6f9`, `ac05bd045`; round 2 = `41c6f79b4`, `3e06de33d`, `52154e71d`; round 3 = `2668434f4`;
the walk's fix = `73d6e12a6`. Backlog ids: `[BOARD-UNDO-LAND-ODDS]` (the new item; its points (i)–(ix)),
`[SCHED-MARKS-WALK-ODDS]`.

| Finding | What it was | Disposition |
|---|---|---|
| Astra 1 = Opus F1 (brief 1) | the pinched board's landing used screen units in a zoomed box | fixed, round 1 (divided by the scroller's scale; tested at 0.5 and 2) |
| Astra 2 = Opus F2a (brief 2) | an Undo or Redo of a row re-order named no box | fixed, round 1; made right for a single moved row in round 2 (N1) |
| Astra 3 (brief 3) | a folded Personal Inputs panel left no box to land on | fixed, round 1; the date check added in round 2 (N3) |
| Opus F2b (brief 4) | a sign-off, publish mark or hidden warning out of view named no box | fixed, round 1; the warning's own line and the bar's place made right in round 2 (N2, N4) |
| Opus F2c (brief 5) | a SANS card changed from the board's SANS panel was found by neither finder | fixed, round 1 |
| Opus F3 (brief 6) | a refused Undo or Redo could still scroll the board | fixed, round 1 (the landing waits until the step is applied; unit tests only — `[BOARD-UNDO-LAND-ODDS]` (iv)) |
| Opus F4 (brief 7) | a first cell not laid out ended the search | fixed, round 1 |
| Opus F5 (brief 8) | the landing never checked the week | fixed, round 1 |
| Opus case S1 | an accepted input's time retyped on its programme row in view, Personal Inputs out of view: the screen must not move | real; fixed, round 1; its residual case (the remark seen only in a line out of view) filed, `[BOARD-UNDO-LAND-ODDS]` (ii) |
| Opus case S2 | a box brought down must not land under the desktop's changes window | passed on the old code, no change (a browser test only) |
| Narrow 1, N1 | a re-ordered row landed on "the first place that differs", not on the row that moved | fixed, round 2 (the rows that kept their order are left out; the moved ones are named) |
| Narrow 1, N2 | a hidden warning's line out of view not brought on screen while the day's bar was in view | fixed, round 2 (the line, the bar only where the line is not laid out) |
| Narrow 1, N3 | Personal Inputs unfolded on a day the input is not on | fixed, round 2 |
| Narrow 1, N4 (read only) | a sign-off landing dropped when a step also changed something the board does not draw | fixed, round 2 (the sign-off line only when the board draws none of the step's own places) |
| Narrow 1, N5 (read only) | a publish Undo's landing had no test | tested in round 2; right on the code as it stood, no change |
| Narrow 1, beside N3 | Redo of an input's date move sends the board to the old day (older) | filed, `[BOARD-UNDO-LAND-ODDS]` (i) |
| Narrow 2, its finding | a step that changed several places judged "in view" by the first place only | fixed, round 3 (nothing moves if any laid-out drawing of any own place of the step is in view) |
| Narrow 2, test point 1 | the publish and hidden-warning browser tests could skip themselves | fixed, round 3 (the skips removed; both ran, 36 pass, 0 skipped) |
| Narrow 2, test point 2 | the signed-day test used a made-up case, not a real step | fixed, round 3 (real signed-day steps tested; a traffic change on a signed day still lands nowhere — noted under `[BOARD-UNDO-LAND-ODDS]` (iii)) |
| Narrow 3 | none | no fault; its tidiness notes filed, `[BOARD-UNDO-LAND-ODDS]` (v), (vi) |
| W1 (the re-walk's one finding) | a box brought up from below landed under the passing "Undid: …" note | fixed red-first, `73d6e12a6`; short read (narrow 4) no fault; short re-walk passed |
| Narrow 4 | none | no fault; its two tidiness notes filed, `[BOARD-UNDO-LAND-ODDS]` (vi) |
| Narrow 4, the case not checked | the last box of the list still rests under the note (the list cannot scroll past its end) | observed by the short re-walk at both sizes (W1f); filed, `[BOARD-UNDO-LAND-ODDS]` (ix) |
| The reads' tidiness notes (Astra's, the Opus read's, the narrow reads') | long header comment, packed functions, and similar | filed, not fixed (D489), `[BOARD-UNDO-LAND-ODDS]` (vi); `histbubble.ts`'s stale comment (v) |
| Not driven in the walk | a touch drag of a programme row, a touch seat-fill on the phone | filed for his iPhone look, `[BOARD-UNDO-LAND-ODDS]` (vii) |
| The "on top" check's blind spot | W1's lesson | filed as a walk-scripts lesson needing his word, `[BOARD-UNDO-LAND-ODDS]` (viii) |

## 7. Found, and each disposition

- W9b (the landing under the phone's changes window): fixed red-first, re-walked (item 4).
- The ⓘ panel's and Insights' "N warning": filed in [SCHED-MARKS-WALK-ODDS] for his word (D994).
- Escape does not close the changes window: already an open question to him, [CHGWIN-ESCAPE].
- No keyboard Undo on the scheduler: not a fault of this change; recorded.
- Chat 64: every finding of the reads and each round's narrow read — table in §6; W1 (the landing under the passing
  note) fixed red-first in `73d6e12a6`, read and re-walked (§4a); W1f (the last box of the list) and eight older or
  untried points filed as `[BOARD-UNDO-LAND-ODDS]`; the ⓘ panel's and Insights' "N warning" stay open for his word,
  a drawing first (D1625).

## 10. The Walk line

`Walk: docs/handpass/2026-11-10-sched-board-small.md · 295 pictures on disk (chat 62's walk 19, chat 63's 80, the re-walk 196; 4 more of the first fault's reproduction) · 3 drawers, the window's 4 openers, 9 Undo routes, then the re-walk's R1–R9 and W1a–W1f · MISSING: W9b fixed, W1 fixed, W1f and the ⓘ panel's and Insights' wording filed for his word, 2 gestures not driven filed for his iPhone`

## 8. What was not walked, and why

- A published version's look (the week's 👁): its bar is the same drawer line walked on Edit Schedule and View-only
  Sched; the demo has no older version until a day is published twice.
- Undo after a week load closed the board: the same landing call; named to the readers.
- His real iPhone (the bounce, the smooth scroll's feel): his look.
