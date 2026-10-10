# `main` brought into `claude/day-window-compact` — the check of the two together (10 Oct 26)

**What happened.** `main` gained the changes-window fix (`[HIST-JUMP-EMPTY-SEAT]`, D733 — pull request #489, live
10 Oct 26): a tap on a change whose seat is empty now lands on its row. This branch (pull request #488 — the Inputs
pages' work, D684–D732) was cut before it, so `main` was merged in here (D78). No new code was written: two finished,
separately checked pieces were joined. Opus 5.5, the host, did the merge and this check. Pictures:
`docs/img/handpass/2026-10-10-main-into-day-window/` (7, all opened) and its `rewalk/` (3 of the re-walk's 47, the
three the host opened).

## 1. What the merge joined, and what clashed

- **Code: nothing clashed.** Both sides changed `src/ui/interactions.ts` and `src/ui/histbubble.ts`, in different
  functions — this branch the sentences of accepting and taking off a request and the History bubble's heading (an
  input's own title), `main` the tap on a change — and git joined them by itself. The joined files were read.
- **Records that clashed, each settled by hand or by its script** (the merge commit's message says how): the
  scheduler's rulings (D733 set on top of D709–D732 by `backlog-archive.mjs --rulings --merge`; D708 stays archived, as
  this branch had it), the file map and the observation log (both sides kept whole), `HANDOFF.md` §Gate baseline (this
  branch's counts, with the one sentence `main` added).
- **`[HIST-JUMP-EMPTY-SEAT]` in the backlog:** this branch's older copy ("NOT BUILT", as first filed here) dropped,
  `main`'s kept — then, the fix being live, archived by the script under one added line saying so. What stays open
  from it: `[HIST-JUMP-SEEN]`.

## 2. The eight questions, asked of the JOIN, and the tier

| # | Question | Answer |
|---|---|---|
| 1 | OIL, pay, how many count as present | NO — neither side's calculation is touched by the other; the fix marks a place and presses nothing (its own check proved nobody's OIL moves). |
| 2 | The published record | NO — the tap writes nothing. |
| 3 | Saved data | NO. |
| 4 | A shared drawer | **YES** — the landing is used for every kind of row on three pages, and this branch changed how ONE kind of row is drawn: a row made from an input with a title of its own carries its kind beside its name (D717), on the board inside a wrapper round the name box. |
| 5 | A new gesture or mode | NO — the same tap. |
| 6 | A new surface | NO. |
| 7 | Roles | NO. |
| 8 | The warning list | NO. |

**Tier: WALK** — sized small (§4). No outside reader: no line of code was written here; each side had its own reads.

## 3. The roll-call — the rows this branch draws differently, against the landing `main` brought

`main`'s own roll-call (every kind of seat, on Edit Schedule, the Scheduler Board and View-only Sched) is its sheet's,
`2026-10-10-hist-jump-empty-seat.md`, and its test (`src/ui/histjump.test.tsx`) ran green on the joined code. What
this branch ADDS to that list:

| Place | Lands and is marked | The sentence | What else is drawn there |
|---|---|---|---|
| A ground row made from a TITLED input — Scheduler Board (the name box in its new wrapper, the kind under it) | HAS IT — the row's people box, ringed (D1, P2) | "That seat is empty now" | the kind "EVENT" stays in plain sight under the name; nothing over the ring |
| The same row — Edit Schedule (the kind small under the name) | HAS IT — the people box (D2, P1) | the same | the kind in sight; on a phone the passing note stands over the changes bar's "Show" for its two seconds — known, filed (`[HIST-JUMP-SEEN]` 4) |
| The same row — View-only Sched | HAS IT — the people of the row, where its first man still stands (D3) | the same | the kind in sight |
| A ground row made from an input filed for ALL AVAIL / ALL | NOT WALKED BY ITSELF — it is drawn by the same row drawer and has the same people box; the only thing this branch draws differently on such a row is the name's kind label, which is the case above | — | — |
| A planning note with its own pucks (the Inputs calendar's opened day) | MUST NOT — a note is not on the schedule; the changes window's lines for it are not buttons, and this branch did not touch the changes window | — | — |

No row MISSING.

## 4. The five sizing lines (D607)

1. **Type of change:** no new change — the join of a type-D piece (a landing drawn on many kinds of row, `main`) with
   a type-E piece (one kind of row drawn differently, this branch).
2. **What only a walk could find here:** the ring and the sentence on a row whose name cell this branch re-drew, on
   each of the three pages, at desktop and phone size — and that nothing of `main`'s fix reads differently on this
   branch's demo week. The tests cover the code of each side; no test of either side taps a change of a titled row.
3. **What the ledger says:** `main`'s own walk of this fix (63 steps, 47 pictures) found three gaps by Astra's
   scenarios and none by re-walking; this branch's walks of the title (D715–D717) found faults in how the kind label
   is drawn on read-only faces. Neither walked the other's work.
4. **The walk chosen:** the HOST alone, by script, no helpers. (a) `main`'s own walk run again WHOLE on the joined
   build — its checks are the right behaviour, so that is the re-walk (63 steps; desktop at his PC's 125%, a phone by
   touch, a member by a real sign-in, a published day, OIL Earn, undo and redo). (b) Nine new steps on a titled
   input's row: filed through the input's own window, a second man put on and taken off on the board, then the line
   pressed at a point on the three pages on the desktop and on two on the phone. No size beyond the required two.
   Nothing left to a test.
5. **After the walk:** its row is in `docs/walk-ledger.md`.

## 5. The walk — what the screen said

**(a) `main`'s walk again, on the joined build** (`scripts/handpass/hj-walk.mjs`): **63 of 63 steps PASS, no console,
page or network error.** 47 pictures taken; the host opened three, each a different page and size
(`rewalk/p-board-4-grnd.png`, `rewalk/m-view-2-deskx.png`, `rewalk/o-oil-2-emptied.png`) — each step's own
measurements (the mark on screen, clear of the window, nothing over it, the exact sentence) carry the rest.

**(b) The titled row** (`scripts/handpass/mj-walk.mjs`): **9 of 9 PASS, no console, page or network error.**

| Step | What was done | What the screen showed | Picture |
|---|---|---|---|
| F1 | Inputs calendar, Monday: an Event titled "Sports day" filed through the input's own window | a row SPORTS DAY on Monday's ground programme, the kind "EVENT" small under it | `f1-input-window.png` |
| F2 | Scheduler Board: a second man (Ranger) put on the row by its "+ add" box | he stands on the row | — |
| F3 | Scheduler Board: he is taken off again (a right-click on his puck) | "Ranger removed"; the seat is empty, Saber stands | `f3-board-seat-emptied.png` |
| D1 | Desktop (125%), Scheduler Board: the changes window, the line of that change pressed | the row's people box ringed, on screen, clear of the window; "That seat is empty now"; EVENT in sight | `d1-board-sports-day.png` |
| D2 | Desktop, Edit Schedule: the same line | the same | `d2-week-sports-day.png` |
| D3 | Desktop, View-only Sched: the same line, from Monday's own count | the people of the row ringed; the same sentence; EVENT in sight | `d3-view-sports-day.png` |
| P0 | Phone: the world saved on the desktop is the one opened | the row and its emptied seat are there | — |
| P1 | Phone (by touch), Edit Schedule: the same line | the people box ringed, clear of the bar; the same sentence | `p1-week-sports-day.png` |
| P2 | Phone, Scheduler Board: the same line | the same | `p2-board-sports-day.png` |

**Seen in passing, not new:** the line of a man put on a row and taken off again reads "Ranger moved place 2 →
place 2" — already filed, `[HIST-JUMP-SEEN]` (2); it is older than both pieces. The first run of (b) failed at F1
because the walk helper it borrowed named the title box as it was called before the title was built
(`it-B-lib.mjs`); the step was rewritten to fill the window's own fields and the whole walk run again — a fault of
the script, not of the app.

## 6. Break tests

`main`'s thirteen cuts (`scripts/handpass/hj-breaks.mjs`), run on the joined code: **13 of 13 RED** — every wire of
the fix still has a test that fails when it is cut; the source was put back after each (the working tree was clean
of them afterwards).

## 7. What was NOT walked, and why

- A row made from an ALL AVAIL input, by itself (§3 — the same drawer, the same people box).
- The fix's landing on a row's NAME inside the board's new wrapper: a ground row always has a people box to land on
  where the schedule is edited, so the name is never the landing there; the name-landing cases (`main`'s AMT rows)
  are rows this branch does not re-draw.
- A phone on its side; a member by his own sign-in on the titled row (the member's page is View-only Sched, walked
  as the admin sees it in D3 — the landing there is decided by the page, not the person; `main`'s walk has the
  member's sign-in, M1–M3, green above).
- His iPhone: his look, as for the rest of pull request #488.

## 8. What the walk found

Nothing in the app. One fault of the walk's own script (§5), corrected.

## 9. The gates

The whole gate set, in one run under the PC lock with nothing else running, on the merge (`5bd3640e`; this sheet,
the walk script and the records were added after it and touch no code): **unit 9940 / 9940 (582 files) · build clean · tfin 728 / 0 · e2e 763 passed, 0 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK — WHOLLY
GREEN.** Before it, the two joined pieces' own test files alone: 138 of 138.

`Walk: docs/handpass/2026-10-10-main-into-day-window.md · 10 pictures opened (54 taken) · 3 surfaces (Scheduler Board, Edit Schedule, View-only Sched) at desktop and phone size · 2 walks (main's 63 steps again; 9 new steps) · MISSING: none`

