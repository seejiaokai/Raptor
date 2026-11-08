# The schedule's marks and words — the pictures round's group 3 (chat 13, 8 Nov 26)

Branch `claude/pr-sched-marks-3205d7`, from `main` after pull request 679. His rulings: **D1784** (the waiting mark on an
Unavailable row, week and board), **D1785** (the unreadable week's words; the refusal in the grey "Blocked:" note),
**D1792 (a)** (the published-version 👁 → the app's line eye) and **(d)** (a hidden warning's ↺ → the Reset arrow; ✕ stays).
Items [SCHED-UNAV-PENDING-MARK], [READONLY-WEEK-WORDS], [UI-CONSISTENCY-LOOK] (round 5 a, d). Drawings, notes and
measures: `raptor-port/docs/img/handpass/2026-11-07-pictures-round/` (`notes-sched.md` Q1, Q2; `notes-marks.md` §3);
pictures of this check: `raptor-port/docs/img/handpass/2026-11-08-sched-marks/`.

## 1. The eight answers and the tier

1. Money (OIL, who counts as present) — NO: no mark, word or arrow here changes what a man earns or who is away; the
   waiting mark reads the day's pending list, it writes nothing.
2. The published record — YES: the waiting mark says what goes out in the next amendment; it must agree with the day's
   "N pending" and the changes window, and go when the amendment goes out.
3. Saved data — YES: how a saved week that will not read is told apart from one an older version published (the refusal
   and the notice choose their words by it).
4. A shared drawer — YES: the input row builder on the week and the board's input row builder (Unavailable and Personal
   Inputs share it); the plan selector drawn on both pages.
5. A new gesture or mode — NO: no new control; the ↺ keeps its button, its words and its tap.
6. A new surface — NO.
7. Roles — NO: who may hide or flag a warning, edit an input or see a medical type is unchanged (a member sees no ✕ / ↺).
8. The warning list — YES (the flag-again button's mark on every warning line).

**Tier: FULL** (questions 2, 3 and 8).

## 2. The rulings that apply (swept; each checked against the running build)

| Ruling | What it says, in the app's words | Pass / fail |
|---|---|---|
| D1784 | | |
| D45, D93, D177, D178 | | |
| D1785 | | |
| D1667, D1668, D1669 | | |
| D837 | | |
| D1792 (a), (d) | | |
| D1700, D1703, D1124 | | |
| D469, D472, D475 (the hidden warning stays in place, struck; members see no ✕ / ↺) | | |
| D56 (what is not a finding) | | |

## 3. The roll-call

Columns: SHOWS the change (or must not, because…) · USABLE (the gesture there still works) · PAINTED WITH (what else sits
on those pixels) · proved by. Every cell filled by the walk; a blank is a row nobody walked. Astra's map of objects and
routes: `docs/handpass/parts/2026-11-08-sched-marks-scenarios.md` §Objects, surfaces and routes.

| # | Thing · surface | Shows | Usable | Painted with | Proved by |
|---|---|---|---|---|---|
| 1 | Waiting mark · Edit Schedule, Unavailable name, desktop | | | | |
| 2 | Waiting mark · Edit Schedule, phone | | | | |
| 3 | Waiting mark · Scheduler Board, Unavailable panel, desktop | | | | |
| 4 | Waiting mark · Scheduler Board, phone | | | | |
| 5 | Waiting mark · board read-only (a member) | | | | |
| 6 | Waiting mark · OIL Earn mode, both name kinds — must not, as the Ground name | | | | |
| 7 | Waiting mark · View-only Sched — must not paint, as the Ground name | | | | |
| 8 | Waiting mark · a look at a version or a plan — must not | | | | |
| 9 | Waiting mark · Personal Inputs rows, SANS cards — must not | | | | |
| 10 | Waiting mark · the day's "N pending", the changes window — agree | | | | |
| 11 | Unreadable notice · Edit Schedule, every day, desktop and phone | | | | |
| 12 | Unreadable notice · View-only Sched | | | | |
| 13 | Unreadable notice · Scheduler Board | | | | |
| 14 | Unreadable notice · next week's desktop preview | MISSING (builder: demo days, no notice) | | | |
| 15 | Unreadable notice · print, the spreadsheet export | MISSING (builder: demo days) | | | |
| 16 | Refusal · the input window: new, edit, medical (four doors), grey "Blocked:" | | | | |
| 17 | Refusal · the store's backstop: drag, Accept, → Unavail, Goes to | | | | |
| 18 | Refusal · Leave War approve / send back / delete / move — own words | | | | |
| 19 | Refusal · deleting a person — own words | | | | |
| 20 | Refusal · Publish / Publish AL on an unreadable week (board's sign strip) | | | | |
| 21 | Older-version week · notice and grey refusal unchanged in words | | | | |
| 22 | Drawn eye · plan selector, week and board, desktop and phone | | | | |
| 23 | Drawn eye · look banner (issued and plan), week and board | | | | |
| 24 | Drawn eye · wave templates window, unchanged | | | | |
| 25 | Reset arrow · hidden warning, Edit Schedule, desktop and phone | | | | |
| 26 | Reset arrow · hidden warning, Scheduler Board, desktop and phone | | | | |
| 27 | Reset arrow · a member, a look — no ✕ / arrow | | | | |

## 4. The door check

## 5. The five sizing lines (§7.0)

1. **Type:** D (a mark drawn by the week's and the board's own builders), G (the publish path — the mark lasts until the
   amendment goes out; saved data — a week that will not read), E (two drawn marks in place of typed ones), F (words).
2. **What only a walk finds:** each builder drawing the mark or not (rows 1–9), the mark beside the count after publish /
   undo / redo / reload, each refusal door pressed for real on a damaged week, the eye and arrow at their drawn sizes at
   both widths, the publish door on the board's sign strip. The tests carry each pending kind (`ui/unavmark.test.tsx`,
   15) and the words to the letter (`engine/lockednote.test.ts`).
3. **The ledger:** type D/G walks have found unwired surfaces most often (the record, 2 Nov – 8 Nov 26); the last board
   job of this round (OIL Earn, 8 Nov) walked two Sonnet helpers plus the host's re-walk.
4. **The walk chosen:** two Sonnet walkers in their own worlds — W1 the waiting mark and the drawn marks (Astra's S6–S9,
   S17–S32 that touch them, rows 1–10, 22–27, the plain-user round on Edit Schedule and the board), W2 the unreadable and
   older weeks (S1–S5, S10–S16, rows 11–21, the plain-user round on the Inputs page and the input window); desktop 1536 and
   his iPhone's size; the host opens every deciding picture and reproduces every finding. Repeated pending kinds beyond one
   each are carried by `ui/unavmark.test.tsx` (it calls the app's own commands, so each kind is also walked once).
   **Resized before the start (8 Nov 26, ~13:45):** the same scenarios over FOUR Sonnet walkers so they run side by
   side — W1a the mark's kinds and identities (S18, S17, S25, S6–S9), W1b its orders, faces and returns (S21, S19, S20,
   S22–S24, S30, S31), W2 the unreadable and older weeks (S10–S14, S1–S5, S15), W3 the drawn marks and the plain-user
   round on the schedule (S26–S29, S32) — no scenario added, only the time shortened. The host's own short walk first
   (`scripts/handpass/sm-host.mjs`, pictures `…/host/`): the mark painted on the week, the board and the phone, the
   unreadable notice on 7 of 7 days and its grey refusal, the drawn eye in a look; the warning-hide route by
   `e2e/warnhide.spec.ts` (8 of 8 on this build). The walkers' brief: `docs/superpowers/briefs/2026-11-08-sched-marks-walk.md`;
   the frozen build: `dist-sm1` in the host's scratch folder, built from `b8011e768`.
5. **After the walk:** its row goes into `docs/walk-ledger.md`.

## 6. The orders walked

## 7. The cases carried by a test

## 8. The pictures

## 9. The break tests

## 10. Errors seen

## 11. What was NOT walked, and why

## 12. The drawing check

Part list `scripts/drawcheck/specs/sched-marks.mjs`, 15 states: the waiting mark (Edit Schedule desktop and phone, the
board desktop), the unreadable notice (desktop, phone) and its grey refusal, the drawn eye (the week's selector and
banner, the board's selector and banner, desktop and phone), the Reset arrow (board and week, desktop and phone). The
drawings recorded by replaying their own scripts (`scripts/handpass/pr-sched.mjs` q1, q2; `pr-marks.mjs` r5a, r5d) on
a build of `main` at `6e6c55667`, where they were drawn — **every replay identical to its approved picture, pixel for
pixel** (records `docs/img/handpass/2026-11-08-sched-marks/drawcheck-records/`). **The build (`dist-sm1`, from
`b8011e768`): GREEN — 15 of 15 states reached, 0 differences, 0 kept** (`…/drawcheck/report.md`). One fix to the part
list, none to the app: the phone board folds its warning list, so the reach opens it by its head as the drawing did.
What the check does not measure — the dotted underline and outline themselves — was looked at by eye beside drawing A:
the host's pictures `…/host/r1-pc-week-unav.png` (a dotted cyan line under "LL") and `r1-pc-board-unav.png` (the "LL"
box outlined dotted, its purple tint kept), the computed styles "underline dotted rgb(59, 198, 232)" and "dotted 1px
rgb(59, 198, 232)" on the PC and the phone.

## 13. The code reads

## 14. The gate counts

## 15. What the walk found, and each disposition
