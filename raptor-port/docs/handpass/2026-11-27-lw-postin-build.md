# Bug check — the posted-in man's leave balance ([LW-POSTIN-BALANCE]), chat 208, 27 Nov 26

Branch `claude/lw-postin-build-5d49de`, pull request 857 (draft). His rulings built: D2747 (leave before his post-in date never
deducted), D2746 ("Not typed"), D2749 and D2812 (the one line), D2810 ("Official bal"); D2745 kept as is (nothing to build).
Pictures: `docs/img/handpass/2026-11-27-lw-postin-build/` (`a/` the desktop walker, `b/` the phone walker).

## The eight answers and the tier
1. Money — YES: the leave balance is a figure a man relies on (what he is owed in days), and D2747 changes what comes off it.
2. The published record — NO: nothing published, signed or amended is read or written; the balance lives on the Leave War only.
3. Saved data — YES: the history line a balance save writes changes ("→ 24" with no "from" for a first figure); the saved
   balance row itself is unchanged in shape.
4. A shared drawer — YES: the figure box (`FigBox`) is drawn by the Balances page, the person window and the Grades window.
5. A new gesture or mode — NO new control; a box's empty state and a refusal are new looks of an existing box.
6. A new surface — NO.
7. Roles — the line shows by who may type (admin / member unlocked) — reads the existing rule (`balanceProblem`), changes
   none — NO change to who may do what; checked on the walk all the same.
8. The warning list — NO (the below-zero question is a sheet's question, not the warning list; it is walked).
**Tier: FULL** (1, 3).

## The rulings swept (the app's words), pass or fail on the running build
| Ruling | What the running build must show | Result |
|---|---|---|
| D2747 | a leave before his post-in date drawn on the grid, never off his balance; days away the same; from the post-in date it comes off | PASS — a s1.1–s1.13, s2, s3, s5; b B6 |
| D2747 with D1541 | a day after his posting-out date still comes off | PASS — a s5.1 |
| D2746 | never typed: "Not typed" in amber where War bal stands, the boxes empty with the dashed amber edge, never 0; read only an amber "–" | PASS after two fixes — a s7.0, s8.4–s8.9; b B1, B2, B7–B9 (FAULT 1 and 2 fixed, re-walked) |
| D2746 | the below-zero question waits for a figure; a typed 0 still asks | PASS — a s6.1–s6.5; b B4, B5 |
| D2746 (grid beside the name) | not built — drawn for him as question 23 (D1625) | RECORD — a s8.6, b B4 ("0", "−1") |
| D2749, D2812 | "Only leave after post-in is deducted." once where a box is drawn — under the LVE box, once above the Balances rows; none locked for a member, none on another man's window, none in Days taken | PASS — a s8.1, s8.3, s8.7–s8.11; b B1c, B2, B8, B9 |
| D2810 | "Official bal" / OFFICIAL BAL, no "App bal" shown, hovered or read aloud | PASS — a s8.2, s8.4; b B1b, B7, B8 |
| D2745 | today's order kept: leave first, then the figure; a slip corrected by typing again | PASS — a s1.1, s1.8 (no build) |
| D1249, D1486 | "No grade" amber in his own row | RECORD — grey in a member's read-only view (a lead outside this change, filed) |

## The roll-call
| Surface | SHOWS (Official bal / the line / Not typed / D2747 figure) | USABLE (type, save, refuse) | PAINTED there besides |
|---|---|---|---|
| Person window, desktop, admin | has it — a s1, s8.4, s8.5c | has it — a s7 | the tile's "N taken" leaves out leave before the post-in date |
| Person window, phone 402, admin | has it — b B2 (after FAULT 2's fix) | has it — b B3, B5 | — |
| Person window, member own, unlocked | has it — a s8.8, b B8h | has it — b B8i | — |
| Person window, member own, locked | the line must not, because he cannot type — a s8.11, b B9e | read only | padlock |
| Person window, member, another man's | the line must not; amber "–", "Not typed" — a s8.9, b B8j | read only | small tiles show "–" only (parked with (a)) |
| Balances page, desktop, admin | has it — a s8.1, s8.2, s8.5, s9 | has it — a s1, s7 | — |
| Balances page, phone 402 and 375, admin | has it — b B1, B7 (after FAULT 1's fix) | has it — b B5 | — |
| Balances page, member unlocked / locked | has it / the line must not when locked — a s8.7, s8.11; b B8, B9 | own row only | "Locked by admin" |
| Balances page, Days taken view | the line must not, because nothing is typed there — a s8.3 | — | still counts leave before the post-in date (parked (d)) |
| Grid figure beside the name | D2747 figure has it — a s1.6; "Not typed" MISSING by design: question 23 | — | second line counts leave before the post-in date (a s1.6r) |
| My leave | D2747 figure has it (same engine); "Not typed" MISSING by design: question 23 | — | "-1" with a hyphen (filed) |
| Approvals' LVE BAL | D2747 figure has it — a s4.2, s5.3; "Not typed" MISSING by design: question 23 | — | — |
| One-day bid window: leave buttons' "left", below-zero question | question waits — a s6.1, s6.2; b B4, B5; "left" MISSING by design: question 23 | has it | — |
| Drag window: below-zero question | has it — a s6.3–s6.5 | has it | — |
| Change history line of a typed figure; Undo / Redo | Undo / Redo has it — a s7.3, s7.4, s1.10, s1.11; history line held by a test (not reachable on the walk, a s7.6) | — | — |
| Grades window (shares the figure box) | must not change — the box's new props are off there; the Grades window's tests green | — | — |

## The five sizing lines (§7.0)
1. **Type:** A (one shared calculation — what comes off the balance), D (a mark drawn in several places — "Not typed", the
   empty dashed boxes, the line), E (the Balances columns, the person window's tile), F (new words), G (Undo / Redo and the
   history line of a first figure).
2. **What only a walk could find:** the places that draw the figure each by their own code (the Balances page, the person
   window at two sizes, member read only); "Not typed" fitting its column at 375 and 402 and on the desktop; the drawing
   check against `q16-final-*`; posting in, moving the post-in date, posting out and Restore through the app's own sheets
   in both orders; the below-zero question in both windows. The engine's cases are held by tests (the table below).
3. **The ledger:** type A walks have found unwired readers more than wrong sums; type D walks find a place never wired; type E
   walks find spills at a phone's width — all three met here (two faults, both type D / E).
4. **The walk chosen:** two Opus walkers in parallel on one frozen build, from the two scenario lists combined — a =
   desktop 1536 at 1.25, admin and member, ten groups (his example both orders, the post-in date moved with Undo / Redo, a
   leave across the date, halves, away twice, the hidden SANS man, posting out, pending through Approve, the below-zero
   question in both windows, the first figure and its Undo, the looks by role and lock, the drawing check); b = phone 402
   (and 375 for fit), admin and member, ten groups (the looks, "Not typed" fit, the refusal, the below-zero question, his
   example, the drawing check). A picture after each tap on the phone.
5. **After the walk:** its row added to `docs/walk-ledger.md`.

## Scenarios (Astra and a fresh, blind Opus in Fable's seat — D2443, D2819)
Astra 28, the fresh Opus 19, each blind to the other (the reports kept outside the checkout). Both found the same two
faults before the walk — a man away twice, his older gap's leave deducted; a hidden SANS man counted without his post-in
date — both fixed red first before the walk, then walked (a s3, s4). Their other points: walk scenarios (combined into the
two walkers' lists above) or his choices, parked (the handoff's (a)–(f)).

## Orders walked
- His example both orders: leave first then the figure (a s1.1, b B6), the figure first then the leave (a s1.2).
- The post-in date moved after typing, both directions, Undo and Redo (a s1.7–s1.13).
- Away twice: post out, Restore, post out, Restore, reload (a s3).
- Hidden SANS: shown, hidden, shown again (a s4).
- Pending bids before the post-in date, then Approve (a s5.2–s5.4).
- Never typed → carried typed first (refused) → 0 → Undo → Redo → 24 and carried 2 (a s7; b B3, B5).

## The cases carried by a test
| Case | Test | What it proves |
|---|---|---|
| His example both orders (post-in Mon 7 Dec, leave Wed 2 Dec, 24 typed → 24) | `src/leavewar/engine/leaveyear.test.ts` "D2747 — …" | the figure, either order |
| A bid before the post-in date never pending | same | Pending 0, War bal 24 |
| A half day before / after | same | 24 / 23.5 |
| A leave across the date | same | only its days from the date (21), "3 taken" |
| A gap before the current stint; an earlier stint; away twice, either gap, a deleted leave | same | not deducted / deducted / nothing given back |
| A day after a posting out | same | still deducted (D1541) |
| A post-in date moved before a typed snapshot | same | still 24 |
| A post-in in the next year, leave in the old year | same | 24 |
| A pilot's 15-day run across the post-in date | same | only its days from the date, weekends with them: 8 of 15 |
| A hidden SANS man counted with his stored posting | `src/leavewar/state/postin-hidden.test.ts` | his post-in date still applies |
| Never typed, typed 0, an old opening | `leaveyear.test.ts` "D2746 — …" | `notTyped` |
| The below-zero question waits | `src/leavewar/ui/belowzero.test.ts`, `state/balanceafter.test.ts` | `goesBelow` false when not typed |
| Person window: label, line by role and lock, Not typed, 0 saves, carried forward refused | `src/leavewar/ui/personwindow.test.tsx` "[LW-POSTIN-BALANCE] …" | the window |
| Balances page: heading (two lines on a phone), the line once, Not typed, a figure saves, member's dash | `src/leavewar/ui/balances.test.tsx` "[LW-POSTIN-BALANCE] …" | the page |
| A first figure's history line | `src/leavewar/m5a-readers.test.ts` | "LVE balance →" with no "from" |

## Pictures
Opened by the host, each cropped to what decides it: FAULT 1 `b/01-bal-admin-402-nt-zoom.png` (before) and
`b/only-B1_B2/01-bal-admin-402-nt-zoom.png` (after); FAULT 2 `b/02c-pw-buzzard-402-crop.png` (before) and
`b/only-B1_B2/02c-pw-buzzard-402-crop.png` (after); the desktop drawing differences `a/only-s9/s9-drawcheck-bal-side-by-side.png`
(before) and `a/only-s8,s9/s9-cmp-bal.png`, `a/only-s8,s9/s9-cmp-pw.png` (after — the War bal column and OIL back in their
drawn places, the person window's line in its drawn place; the remaining marked areas are the rows' different people and
figures). Every walked step's picture is in `a/` (91) and `b/` (68), named in `walk-a` / `walk-b` order by step.

## Break tests
- Carried forward typed into an empty Official bal: refused, nothing saved, still "Not typed" (a s7.1, b B3).
- 0 typed is a typed figure, not "never typed" (a s6.0, s7.2; b B5).
- One drag over five rows mixing never-typed and typed-0 men: the question names only the typed one (a s6.5).
- "+ SANS" off and on: no figure moves (a s4.4).
- A reload after the away-twice sequence: the figure stays (a s3.7).

## Errors seen
None — no console error, page error or failed request in any run of either walker.

## What was NOT walked, and why
- The change history line (a s7.6): the changes window opens on the loaded week and its › did not reach the typing day's
  week in 30 presses — held by `m5a-readers.test.ts`.
- Deleting an old-gap leave (Astra 3), the 15-day pilot run (Astra 12, Opus SC9), a post-in in the next year (Astra 19):
  held by engine tests (above); the walk's own posting doors already walked in s1–s5.
- Pending of each small kind (Astra 4), 1 Jan with the page open (Astra 18), ranges across periods (Astra 17), editing the
  leave on the Inputs page (Astra 16), Restore as / Undo post out (Astra 15), a SANS posting rather than the Quals tick
  (Astra 14), lock changing mid-edit (Astra 22), every person-window opener (Astra 24), OIL beside it (Astra 27): the
  same engine and the same box reached by another door; none changes what this build changed — sized out (§7.0, line 4).
- The phone's pinch on Balances, WebKit (Chromium phone emulation only — an iPhone's own letters may run wider): "Not
  typed" now wraps to two lines inside its column, so a wider font grows the row, not the column.
- The drag window's below-zero question on the phone (walked on the desktop, a s6.3–s6.5).

## Gate counts
- The whole Leave War unit run under the lock: 5,359 passed, 5 failed — each fixed (they leaned on an untyped balance
  asking below zero, now typing a figure first), then green file by file; GitHub's run on `1759fce23`: every check green
  but Vercel ("rate limited — retry in 24 hours", too many builds across the chats, not this change).
- After the walk's fixes: `balances.test.tsx` 75 passed, `personwindow.test.tsx` 51 passed, `leaveyear.test.ts` 43 passed;
  the code check: no new finding.

## The code reads
Astra and a fresh, blind Opus, one brief, each blind to the other and to the walk; their reports whole, with the scenario
designers' and walkers': `docs/handpass/parts/lw-postin-1127/` (`read-astra.md`, `read-opus.md`, `scen-*.md`, `walk-*.md`).
| Finding | Readers | Disposition |
|---|---|---|
| R1 — a first Official bal typed into the empty box took its carried-forward part from the figure counted underneath "Not typed": a man with a grade and two 1 Jans behind him typed 20 and it saved 20 incl. 20, wiped as carried-forward days on the next 1 Jan, with an extra "carried fwd → 20" history line | both (Opus F1, Astra F2) | REPRODUCED red (`m5a-readers.test.ts`, saved `cf: 20`), FIXED in the one save door both screens use (`9657b6b77`); the test also holds Undo, Redo and the next 1 Jan (53 incl. 20); re-walked the first-figure steps on the rebuilt app — desktop s7 6 PASS (`a/only-s7/`), phone B3 and B5 9 PASS (`b/only-B3_B5/`) |
| R2 — the five smaller kinds (CCL, FCL, PL, EL, CL) never show the words "Not typed": an empty dashed box where they can be typed, an amber "–" where not, and the person window's small tile's War bal line a "–" while a leave is pending | Astra F1 | NOT BUILT — his to rule: question 11's approved drawing shows the LVE tile only, and the words in a small kind's place are a new look, drawn first (D1625); the build gives them the narrow places' look question 23 recommends. Parked with (a), filed on the backlog item |
| Q — Days taken still counts a leave before the post-in date (the plan's step 2: "to confirm at the build") | Opus Q1 | parked for him (d) |
| Q — "Type the Official bal first" not word-reviewed or drawn | Opus Q2 | a fresh Fable kept the words; put to him on question 23 |
| Tidiness (filed, not fixed): the post-in check's head comment said "the gap right before"; two doc comments back to back on the per-kind figures; whether a balance is typed worked out twice; the "Not typed" look repeated across two screens; the bid picker's own result type without `notTyped` | both | the head comment corrected (a stale comment is a wrong fact, `9657b6b77`); the rest filed on the backlog item |
Both readers' negatives: the post-in rule in every order, the figure cache's key, every reader of the figures, both below-zero doors, the history and Undo, the permission gate, "Official bal" everywhere, the time zone — nothing.

## What the walk found, and each disposition
| Found | By | Disposition |
|---|---|---|
| A man away twice: his older gap's leave deducted | both scenario designers | FIXED red first (`11ae74d9b`), walked PASS (a s3) |
| A hidden SANS man counted without his post-in date | both scenario designers | FIXED red first (`11ae74d9b`), walked PASS (a s4) |
| FAULT 1 — "Not typed" ran over the phone's OIL column | walker b | FIXED (`1759fce23`): two lines; re-walked PASS (`b/only-B1_B2/`) |
| FAULT 2 — the person window's empty boxes had no dashed amber edge | walker b | FIXED (`1759fce23`); re-walked PASS (b, and a s8.5c, s10) |
| The War bal column 26px wider than drawn, OIL and OTHER LEAVE pushed right | walker a, the drawing check | FIXED (`ded008f08`): "Not typed" on two lines at every width; re-checked against the drawing |
| The person window's line 2.4px higher than drawn | walker a and b, the drawing check | FIXED (`ded008f08`); re-checked: 0 regions |
| "Type the Official bal first" — new words | both designers, walkers | put to him on question 23; a fresh Fable kept the words |
| The refusal tag covers "till 31 Dec" and the line's top on a phone | walker b (B3d) | filed — a small look point |
| 36 of 53 demo rows show five empty amber boxes | walker b (B1d) | for his look — the demo types the small kinds for few men |
| Grid's second line, Days taken count leave before the post-in date; the tile's "N taken" does not | walker a (s1.6r), both designers | parked for him (d) |
| A hidden SANS man signed in has no My leave and no Balances row | walker a (s4.3) | filed — outside this change |
| "No grade" grey in a member's read-only view | walker a (s8 lead) | filed — to read against D1249 |
| My leave prints "-1" with a hyphen | walker b | filed — outside this change |

Walk: FULL — two Opus walkers on one frozen build, desktop 1536 at 1.25 (70 checks: 62 PASS, 0 FAIL of the app, 7 RECORD, 1 NOT WALKED, held by a test) and phone 402 / 375 (73 lines: 49 PASS, 9 FAIL from 2 faults, 15 RECORD); 4 faults (2 on the phone, 2 drawing differences) fixed and re-walked PASS; after the code reads' one fix, the first-figure steps re-walked on the rebuilt app at both sizes, 15 PASS; pictures `docs/img/handpass/2026-11-27-lw-postin-build/` (a, b and their re-walk folders).

## After his look began — D2820 and D2822 (27 Nov 26, chat 208)

Two answers of his, through coordinator chat 206, built red first on this branch (tier WALK: one screen, the Balances page;
nothing saved changes; his person window, My leave and Approvals untouched and checked).
- **D2820 (question 28, "a"):** on the Balances page a balance never typed shows no words and no "–" — a read-only figure's
  place and War bal's place an empty amber dashed outline the size of the box in that column (War bal 40 × 28 on a desktop,
  44 × 30 on a phone, where 44 widened its column), named "Not typed" on hover and to a screen reader. Drawn first:
  `docs/img/handpass/2026-11-27-lw-postin-q28/{desk,phone}-{today,A}-{admin,member}.png` (`scripts/handpass/lw-postin-q28-draw.mjs`).
- **D2822:** on a desktop "Only leave after post-in is deducted." sat about 60px above NAME and GRADE, the two heading rows
  between; it now stands in the heading block's empty top-left corner, its foot 19px above NAME's words (the phone: 20px
  above NAME · GRADE), set at NAME's left, the list 33px higher. Measured before and after:
  `docs/img/handpass/2026-11-27-lw-postin-gap/{desk,phone}-{before,after}.png` (`scripts/handpass/lw-postin-gap-measure.mjs`).
  The first build cut the line's letter tails under the second heading row; fixed (the corner drawn above it), re-measured.
- **Re-walk** (`scripts/handpass/lw-postin-q28-walk.mjs`, `q28-walk.json`): desktop and phone, an admin and a member looking at
  Pelican's row (added on Admin → Users, nothing typed) — 28 checks, 28 PASS, no page or console errors: no "Not typed" on the
  page, each outline as drawn, each read-only outline the width of the admin's box in its column, the row's height unchanged,
  his person window still "Not typed". Beside the drawing: the phone pictures pixel-identical to A; the desktop rows the same
  by eye, the pictures 3px taller by the moved line (`{desk,phone}-build-*.png` beside `*-A-*.png`).
- Unit: the Balances page's 76 tests pass (three rewritten for D2820 and D2822, one added for the phone's line — each failed
  first). Code check: no new finding.

Walk (D2820, D2822): WALK — the host, one script at desktop 1536 and phone 402, admin and member: 28 PASS, 0 FAIL; the gap
measured before and after at both sizes; checked beside the drawing of A.

## D2823 — "Not typed" nowhere (27 Nov 26, chat 208)

His answer through coordinator 206, built red first on this branch (tier WALK: what a person sees in five places; nothing
saved changes). A balance never typed now reads the amber "–" beside his name on the grid, on My leave, in Approvals' LVE
BAL, on the leave buttons' "left" (not dimmed — question 23's item 4 as drawn) and in his window's War bal. No pointing
hint says "Not typed"; a screen reader still hears it (the agent's reading, put to him). The Balances page keeps D2820's
outline, its read-only places and War bal included (206 confirmed).
- **Re-walk** (`scripts/handpass/lw-postin-d2823-walk.mjs`, `docs/img/handpass/2026-11-27-lw-postin-d2823/d2823-walk.json`):
  desktop 1536 and phone 402, the admin and Pelican himself (added on Admin → Users with a sign-in, nothing typed, one
  pending LL on Tue 1 Dec) — 40 checks, 40 PASS, no page or console errors.
- **Found by the walk's pictures, fixed red first:** My leave read "LVE – ·OIL 0" — the edit had lost the space after the
  dot. A test now reads the whole line; re-walked 40 PASS.
- Unit: the five changed test files and their neighbours pass (182 + 140 + 107). Code check: no new finding, after the grid
  box's top line moved into one small helper.

Walk (D2823): WALK — the host, one script at desktop 1536 and phone 402, admin and the never-typed man: 40 PASS, 0 FAIL;
one fault found by the pictures (My leave's lost space), fixed red first and re-walked.
