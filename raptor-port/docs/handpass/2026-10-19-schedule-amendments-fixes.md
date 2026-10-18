# D994's Schedule and amendments small fixes — the one bug check for the batch (branch `claude/schedule-amendments-fixes-fffce0`)

His ask (D994, 18 Oct 26): the first 24 lines of the priority list's "Schedule and amendments" group that need nothing
from him, on one branch, one check sized by the riskiest change (D485), pictures of everything on screen, each finished
item archived by script; browser tests on a port checked free; nothing merges without his "merge live".

| Item | What changed | Where |
|---|---|---|
| `[INTIME-LINES-DRAG]` `[PEND-INTIME-WORDS]` | In-time / Rally lines drag into order on the Scheduler Board (D593, D594); Auto sort and Sort all order them; "To go out" names the lines | `engine/reorder.ts`, `engine/reporting.ts`, `ui/html.ts intimesInner`, `ui/pendlist.ts` |
| `[SC-INTIME-REST-WORDS]` `[SC-BLANK-SHIFT-QUAL]` `[BLANK-LINE-SANS-WORDS]` | the warning sentences on SC and blank lines | `engine/validate.ts`, `engine/people.ts scShiftKind` |
| `[BLANK-STANDBY-STRIKE]` `[BLANK-SEAT-ACTIVITY-HINT]` | the crew list on standby seats and seats with no hours | `engine/avail.ts` |
| `[SC-SPARE-RING-BORROWS]` | the SC SPARE no longer wears the MAIN's leave ring | `ui/html.ts exemptLineOwn` |
| `[SC-B-CHANGE-SAYS-BRIEF]` `[BOARD-INTIME-JUMP]` `[BLOCK-NO-HISTORY-LINE]` | the changes window's and the history's words and lines | `engine/editlog.ts`, `ui/changesmodel.ts`, `undo/describe.ts`, `ui/histbubble.ts` |
| `[DISCARD-FILING-NOOP]` | "Discard N edits & load" counts only what it discards | `engine/drafts.ts dayDiscardCount` |
| `[SECDEFAULT-OFFER-BEHIND-BOARD]` `[BUBBLE-SMALL-SEEN]` (2)(3) | the offer over the board; notes | `ui/SecDefaultSnackbar.tsx`, `ui/toast.ts` |
| `[TRACE-FOCUS-STAYS]` | closing the list a "Breaks <day>" line was tapped in lets the focus go | `state/view.ts toggleDayWarn` |
| `[ONE-ROW-DRAG-FLASH]` | a day's first ground-row drag flashes the row that landed | `engine/reorder.ts LANDED_KEY` |
| `[OIL-NOTIFY-SEEN]` (1)(6) | Undo's words after a swap and an OIL answer; the touch drag's edge band on a short pane | `undo/describe.ts`, `ui/drag.ts` |
| `[ARROW-GUTTER-STRIP]` | a resize re-lands the desktop week on a day; "day a–b of 7" | `ui/pan.ts` |
| `[EDIT-SECOND-CLICK]` | one click after a changed box takes the caret | `ui/textedit.ts textCaret`, `ui/EditWeek.tsx`, `ui/SchedBoard.tsx` |
| `[TAB-LAST-BOX-TEST-GAPS]` | Tab tests; a Tab onto a control where the save replaced the day keeps the focus | `ui/schedule-tab.ts` |
| `[CRP-FLAG]` `[OFT-ADD-TWICE-SILENT]` `[AMEND-SMALL-SEEN]` (6)(7) | tests only — no app change | `engine/official-flags.test.ts`, `state/store.test.ts`, `ui/rowtwice-refusal.test.tsx`, `e2e/leavewar.spec.ts`, `leavewar/state/balanceafter.test.ts` |

## The eight questions and the tier

1. Money / OIL — no: nothing in the batch decides who earns; the OIL words changed are Undo's description only, and the
   swap's OIL question is unchanged.
2. The published record — YES: an In-time / Rally reorder on a published day is a change waiting (D594); the discard
   count; the published face's warnings (tests only).
3. Saved data — YES: new lines of the change history (kept across sign-out and reload, D338).
4. A shared drawer — YES: the crew list (every seat), the SC SPARE ring (week and board), the In-time block (week and board).
5. A new gesture or mode — YES: the In-time / Rally drag on the board.
6. A new surface — no.
7. Roles — no: nothing about who may do or see what changed.
8. The warning list — YES: the sentences of four warnings.

**Tier: FULL** (2, 3 and 8).

## The rulings swept

D593, D594 (the drag, the order, a published day); D503 (an evening-before clock); D510, D600 (the "+ In-time / Rally"
fill — unchanged); D597, D553, D554, D555 (the Tab route); D544 (Enter and Escape keep their meaning); D605 (a whole-day
absence flagged on a seat with no times); D271 (one man, once per row); D338, D340, D345, D346 (the changes window);
D103, D178 (a change waiting wipes the sign-offs); D179, D183–D188 (what stays live on a published face); D850 (feedback
on screen first, a note only where needed); D877, D860 (the landing mark, no glow); D672 (undo leaves the screen where it
is when the change is in view); D418 (a weekend LL asks nothing). No clash found.

## The roll-call

(Filled during the walk — every row a mark; a row nobody walked shows blank.)

| Thing | Place | Has it / must not, because… / MISSING | Proof |
|---|---|---|---|
| In-time / Rally drag | Scheduler Board, desktop | HAS | walked A S1-01a–c, S1-04, S1-17, S1-18; re-walk E; re-walk G F2 (D) |
| | Scheduler Board, phone (touch) | HAS | walked A S1-03 (on its side); re-walk E; re-walk G F2 (P, finger) |
| | Edit Schedule's week | MUST NOT (D594 — no drag there), shows the board's order | walked A S1-05, S1-05c (no drag, the board's order); `rowdrag.test.tsx` |
| | View-only Sched | MUST NOT (read only), shows the order | walked A S1-13, S1-20 |
| | a published day | HAS — a change waiting, sign-offs fall, a drag back nets to nothing | walked A S1-09–S1-14w, S1-19; `intimes-order.test.ts` (ITD2) |
| In-time / Rally order by sort | the wave's Auto sort; the board's Sort all | HAS | walked A S1-02, S1-06, S1-07b, S1-08, S1-19; re-walk E; `intimes-order.test.ts` (ITD3) |
| "To go out" words | the changes window, a published day | HAS — names the lines; "order changed" | walked A S1-09, S1-12, S1-15, S1-15w, S1-16, S1-16b |
| The crew list's strike / hint | SC MAIN, SC SPARE (blank times), AVALON / BB seat, a blank line, a duty / sim / ground / programme row with no times; week and board | HAS | walked B S2-01–S2-06 (board D and P, week) |
| The warning sentences | the day's issues list, week and board, desktop and phone | HAS | walked B S2-01d, S2-02e, S2-03, S2-04f (no empty "( )", no double space), S2-01e (the published face) |
| The SC SPARE's ring | week and board | MUST NOT borrow the MAIN's | walked B S2-07a–f (board, week, View-only, published) |
| The changes window: SC B "in-time"; In-time block a button on the board; + Block / SC wave / documents lines | Edit Schedule's clock window; the board's History | HAS | walked C S3-10, S3-11, S3-12, S3-13; A S1-16, S1-16b; re-walk F S3-10 |
| "Discard N edits & load" | the versions menu's load of an issued version | HAS — counts only real discards | walked C S3-06–S3-09; A S1-14, S1-14w |
| "Set as default order?" | over the Scheduler Board | HAS — above the board, below a modal | walked C S3-04, S3-05A/B |
| A note while the changes window is open | phone | HAS — at the top | walked C S3-03; re-walk F S3-03 (week and board, both orders) |
| "Breaks <day>" focus | closing that list | HAS — focus goes | walked B S2-09, S2-10; re-walk F S2-10b/f, S2-09 (D and P) |
| The landing flash | a day's first ground-row drag (phone) | HAS — the row that landed | walked C S3-14a–c (D and P), S3-15 |
| Undo's words | after a swap on an input's row; after an OIL answer | HAS | walked C S3-01, S3-02a–c; re-walk F S3-02 |
| A touch drag's edge band | the board on a phone on its side | HAS — a sixth of the pane, at most 52px | walked A S1-03; C S3-16, S3-17; re-walk F S3-16; re-walk G S3-16 (a crew-list puck: older, filed) |
| The desktop week after a resize; "day a–b of 7" | Edit Schedule, View-only Sched at 1440 | HAS | walked D S4-12–S4-15; re-walk G F3 (the app's own band resize does not re-land; a real one does) |
| One click after a changed box | Edit Schedule's week, desktop and phone, a draft and a published day | HAS | walked D S4-01, S4-02, S4-04, S4-06; `e2e/schedule-tab.spec.ts` (draft and published) |
| | the Scheduler Board's boxes | HAS (`textCaret` used there too) | walked D S4-03; re-walk F S4-04, S4-01 board half (D and P); `e2e/schedule-tab.spec.ts` (click and finger) |
| Tab from the day's last box | a weekday (no control below: back in the box, D597); a weekend (a control below: on it, D553) | HAS | walked D S4-07–S4-10; `e2e/schedule-tab.spec.ts` (the whole day replaced) |
| OFT row's "+" twice | Edit Schedule's week | HAS — refused, says why (unchanged) | walked D S4-16 (board D, published, week, phone); `rowtwice-refusal.test.tsx` |
| A man's figures on a phone, the year scrolled | the Leave War | HAS — the grid stays (unchanged) | walked D S4-17 (its FAIL was the walker's own script, not the app); `e2e/leavewar.spec.ts` |
| A box after Undo with the caret still in its block | Edit Schedule's week and the Scheduler Board, a draft and a published day | HAS — shows what is stored (fixed in this check, older than the batch) | re-walk G S (four cases); `schedule-tab.test.tsx` |
| A finger that lands on a box and scrolls | the week and the board, phone | HAS — the held redraw is drawn; no whole-app repaint | re-walk G F1 (board, week); `textcaret.test.ts`, `schedule-tab.test.tsx` |

## The walk's size (`docs/walk-ledger.md` — D607)

1. **The type of change:** a batch of 21 small fixes across one area (the scheduler): a new gesture (the In-time /
   Rally drag, D594), a published-day change waiting, new history lines, warning sentences, the crew list on every kind
   of seat, layers over the board, the text boxes' caret — types C (published record), D (a shared drawer), E (a
   gesture) and H (words) of the ledger.
2. **What only a walk can find here:** a drag that lands on screen differently from the stored order (the phone's
   touch, a held caret); a note or offer painted under or over the board or the changes window; a strike or hint the
   crew list draws on one surface and not another; the caret after a real click; the week's landing after a real
   window resize; a phone on its side.
3. **What the ledger says:** the one-rule check (12 Oct 26) — 12 walkers, ~8 points of his weekly allowance, 5 faults;
   the batch-2 check (10 Oct 26) — the host alone, 45 steps, 1 fault, the reads 5 more. Small-fix batches find most
   by the reads and the scenario designer; the walk finds layering and touch.
4. **The walk chosen:** four Sonnet 5.5 walkers (D588, D787), one share each of the scenario designer's 69 scenarios
   (`docs/superpowers/briefs/2026-10-19-sched-fixes-scenarios-report.md`), each its own browser worlds on ONE frozen
   build (`walk-5c48ee2ea`, served on 4240; bundle `index-Tt45wSsd.js`), desktop 1440×900 and a phone 390×844 by
   touch, a phone on its side 844×390 for the board. The host opens the pictures behind every FAIL and every
   published-day PASS, and reproduces every finding. His weekly allowance read 79% before the walk.
5. **Its row in the ledger:** added — `docs/walk-ledger.md`, 19 Oct 26.

**Re-sized after the evidence changed (§7.0):** the read of the fixes (F1–F3), then its narrow read (N1), each changed code a walk had already passed, so each round got a SHORT re-walk of only what it touched, by the host alone on a new frozen build — re-walk F (31 rows, a Sonnet walker, on `676a92e43`), then re-walk G (13 rows, the host, on `9cbdc5e64`, bundle `index-D7Sgl7pl.js`, served on 4240). Re-walk G found one older fault (the box after Undo — below) and widened by one route: the same Undo on a DRAFT day and on the week, walked too.

## The orders walked

Every row and its result are in the six walk sheets (`docs/handpass/parts/2026-10-19-sched-fixes-{A,B,C,D,rewalk-E,rewalk-F}.md`) and re-walk G below. In short:

| Walk | Rows | PASS | FAIL | RECORDED | NOT WALKED | Build |
|---|---|---|---|---|---|---|
| A — In-time drag, sorts, published day | 50 | 40 | 8 | 2 | 0 | `walk-5c48ee2ea` |
| B — the crew list, the warning sentences, the SPARE ring, focus | 70 | 56 | 2 | 12 | 0 | `walk-5c48ee2ea` |
| C — the changes window, Undo's words, layers, the landing flash, a sideways phone | 49 | 31 | 6 | 11 | 1 | `walk-5c48ee2ea` |
| D — the caret, Tab, the week after a resize, the OFT "+", the Leave War | 18 | 13 | 3 | 1 | 1 | `walk-5c48ee2ea` |
| re-walk E — what the walk's fixes touched | 21 | 21 | 0 | 0 | 0 | `walk-676a92e43` |
| re-walk F — the same, second share | 33 | 31 | 0 | 2 | 0 | `walk-676a92e43` |
| re-walk G — the read's fixes (F1–F3, N1, round 2's F1) and re-walk F's surprise, the host | 15 | 14 | 0 | 1 | 0 | `walk-9cbdc5e64`, then `walk-40c7af45e` |

**Re-walk G (19 Oct 26, the host, scripted, `walk-9cbdc5e64`):** the Undo surprise — a B typed on a line, the caret on in the same line, Undo — on the board and the week, a published day and a draft: FAIL ×3 on `walk-0df257c26` (the box kept 08:30, stored blank; reproduced the same on `main`'s build), PASS ×4 after the fix; F1 — a finger that lands on a box and scrolls, then Undo, phone, board and week: PASS ×2 (on Chromium the synthetic scroll ended as a tap on the box, so the cancelled press itself is carried by `textcaret.test.ts`; his iPhone is on the look card); F2 — four In-time lines, the first emptied with the caret in it, the third dragged to the top, desktop by mouse and phone by finger: PASS ×2 (C, B, D — the line pressed moved; the script's first aim, measured before the emptied line went, dropped on nothing and was re-aimed); F3 — the desktop week panned by hand between two days, then the failed-save band: PASS (380 → 380), and a real resize afterwards re-lands it on a day: PASS; S3-16 — a crew-list puck held 40px and 15px below the top of the board pane on a phone on its side: RECORDED, the pane never scrolls (older — the drag scrolls the list the puck came from; filed in `[OIL-NOTIFY-SEEN]`). **Round 2's F1** (`walk-40c7af45e`, bundle `index-BbXxY49r.js`): three In-time lines, the first emptied, the caret on the second, Undo pressed WITHOUT the focus moving (the button's click called directly, as a tap on Safari leaves the focus), then the second line left, desktop and phone: FAIL ×2 on `walk-9cbdc5e64` (A lost, B doubled — `G-R2F1-*` taken there were overwritten by the PASS run), PASS ×2 after the fix (all three back, "Undid: an In-time / Rally line"); and every row above run again on it: PASS.

**After publishing, and the opposites:** the In-time order on a published day (a change waiting, the sign-offs fall, dragged back nets to nothing, Undo / Redo, Publish AL1, Load onto working copy) — A S1-09 to S1-14w; a published day's SC in-time words — F S3-10; the discard count after publishing — C S3-06 to S3-09; the Undo of a typed B on a published day — G.

## Cases carried by a test

| Claim | Test | Through the app's controls, or the calculation directly |
|---|---|---|
| A finger that lands on a box and then scrolls (pointercancel) lets the mark go and repaints only what was held | `ui/textcaret.test.ts`; `ui/schedule-tab.test.tsx` "a held week redraw…" (week and board) | the mounted app's week and board; the pointer events dispatched directly (Chromium's synthetic finger did not produce a cancel) |
| An emptied line's own grip pressed: no drag; the week's copy emptied, the board's grip pressed: the line pressed moves | `ui/rowdrag.test.tsx` | the board's markup and the real grip handler |
| The In-time order on a published day is one pending change (ITD2); the sort's order (ITD3) | `engine/intimes-order.test.ts` | the reorder and sort commands directly — the screen route was walked (A) |
| Sort all writes one history line | `engine/sort.test.ts` | the command directly — walked A S1-08 |
| The three published-day cases [CRP-FLAG] left untested | `engine/official-flags.test.ts` | the engine directly — no screen route changed |
| A weekend LL asks nothing | `leavewar/state/balanceafter.test.ts` | the calculation directly — walked D S4-18 |

## Pictures

`docs/img/handpass/2026-10-19-sched-fixes/` — walker A (126), B (74), C (135), D (128), the host (4), re-walk E (42) and F (46), re-walk G (`rewalk/G`, 17): 572 in all. The host opened the pictures behind every FAIL and every published-day PASS of each walk (A–F, by the chat before) and every picture of re-walk G.

## Break tests

Every fix of the batch landed red first: its test failed on the fault before the fix (the commits say so). In this chat each new wire was broken once on purpose and its test watched go red: the In-time grip's shifted address (`rowdrag.ts`, two tests red), the emptied line's own grip (one red), the week's `CARET_GONE` listener (`schedule-tab.test.tsx`, one red), the board's (one red); the `OWED` fix's two tests were red on the code before it. No break list was run through `scripts/handpass/breaks.mjs` for the batch's earlier surfaces; their red-first tests stand in for it.

## Errors seen

None: every walk's console, page-error and 4xx list was empty (A–F, and every run of re-walk G; F3's forced storage refusal is the walk's own, not counted).

## What was NOT walked, and why

- C S3-02 on a phone — Undo's words come from one place, walked at desktop and (re-walk F) on the phone board.
- D S4-11 (a weekend duty desk's OIL question) — its route was not reached in that walker's world; nothing in the batch changes the OIL question.
- D S4-17's late joiner / posted-out man — no such row in the demo world; the jump itself was the walker's script.
- His iPhone: a finger's tap from one box to another after a change (the fresh read's O1 — the next box must be named by the browser on its way), a finger scroll that starts on a box, the sideways phone's edge band — on his look card; only a real device can prove them.

## The gates

At `b1e3ac72a` (the batch with F1–F3, before N1 and the Undo fix), the whole set under the PC lock, browser tests on 4232: build clean · tfin 728 / 0 · unit 11846 / 11846 · e2e 865 passed, 0 failed, 61 skipped · smoke 453 / 0 · rulecheck OK · docsize OK — WHOLLY GREEN.
At `9cbdc5e64` (with N1 and the box after Undo): unit 11852 / 11852 · e2e 864 passed, 1 failed — the Leave War phone test "Undo and Redo leave the grid where it is…" at its month-button step, the known unsteady test of `[LW-WINDOW-PRUNE-FLAKE-2]` (this batch touches nothing of the Leave War), alone under the lock 2 of 3 · the rest green.
**At `40c7af45e` (every fix in), the whole set under the PC lock, browser tests on 4232: build clean · tfin 728 / 0 · unit 11855 / 11855 · e2e 865 passed, 0 failed, 61 skipped · smoke 453 / 0 · rulecheck OK · docsize OK — WHOLLY GREEN.**

## The code read

- **The scenario designer** (a fresh Opus reader, D790): `docs/superpowers/briefs/2026-10-19-sched-fixes-scenarios-report.md` — 69 scenarios, eleven suspicions (the table below).
- **The fresh blind read of the batch** (a fresh Opus reader): `…-read-report.md` — F1, F2, F3, all fixed red first, re-walked (F, G).
- **The narrow read of the fix round, round 1** (a fresh Opus reader, only the fix commits): `…-fixread-report.md` — F1–F3 right and complete; N1 (a speed cost of F1's fix) fixed red first; O2's two untested routes tested; O1 on the look card.
- **Round 2** (only N1's fix and the Undo fix): `…-fixread2-report.md` — both right, nothing broken beside them; one older finding (its F1, below) fixed red first and walked. O1 (a shape-changing hold keeps the old chunks — no route found today) and O2–O3 noted, not findings. **Round 2 was the last read:** its fix is a guard on the one undo (a held caret is let go before Undo / Redo run), carried by its red tests, re-walk G and the gates.
- No ChatGPT reader (Astra, Sol 6.1) read this job — written in `[NO-ASTRA-LIST]`.

## What the check found, and each disposition

**Before the walk — the gates and the scenario designer's eleven suspicions** (each reproduced by a test that was red
before its fix, on the branch, against the real code path):

| # | Found by | What | New on this branch? | Disposition |
|---|---|---|---|---|
| 1 | the gates (the new board test) | On the Scheduler Board, one click into a box after a changed one did not take the caret (the board saves on change, before focusout names the box) | the week's half was the item; the board's is the same item | FIXED `5c48ee2ea` — the box under a press counts as the caret |
| 2 | designer S1-01 | A drag of an In-time line with the caret in another line lost a line (one doubled, one gone) | NEW (the drag is new) | FIXED `4d0c9e807` — a grip's press leaves the text box first |
| 3 | designer S1-02 | The same through a wave's ⇅ and through Sort all, on a tap that does not move the focus | NEW | FIXED `7f2be46a3`, `34ba00338` |
| 4 | designer S2-10 | Closing the list a run-of-days "Breaks <day>" line was tapped in left the crew lit | the item's mend was partial | FIXED `f6f4ab9f8` — every such line remembers its list |
| 5 | designer S3-03 | A note already up when the changes window opens on a phone stayed over its first lines | the item's mend was partial | FIXED (the window places the note as it opens) |
| 6 | designer S1-03 / S3-17 | A row's drag on a phone on its side kept two fixed 72px bands | the item's mend was partial (pucks only) | FIXED — `rowdrag.ts rowEdge`, a sixth of the pane |
| 7 | designer S1-08 | Sort all wrote two history lines (the In-time sort logged its own) | NEW | FIXED `19b2bd267` |
| 8 | designer S3-01 | Undo after a swap with ALL AVAIL would read its stored id | — | FALSE ALARM — it reads "ALL AVAIL" (the placeholder is in the roster); pinned |
| HIS | the owner, from walker A's picture (19 Oct 26) | The board's In-time / Rally lines stood in the middle of the panel: the drag's rows kept the block's old grid rule `align-items:center` | NEW (the drag's rows) | FIXED `1329e0396` — the rows stretch; a browser test of each row's left and width at 1440 and 390. **The method's line (order §11):** every walker's picture showed it and no step asserted it — a new layout inside an existing block gets its rows' left edge and width measured at both sizes, against the block |
| 9–11 | designer S3-08, S4-13, S3-05 (B), two low | the discard count for an input under Unavailable; a resize during an arrow's glide; a note raised while the offer is up | — | NOT A FAULT — walked: C S3-08 one press, no false "Discard", a true note; D S4-13 every run came to rest on a day; C S3-05B the offer closes at the press, the note covers nothing |
| 12 | walker A S1-01a–c, S1-03 | the board kept the old order until the line was left; a line lost on a drag while typing; the 72px band on a sideways phone | NEW | FIXED (rows 2, 6 above) — re-walk E PASS |
| 13 | walker A S1-07 | the sort with unnamed lines | — | NOT A FAULT — with the earliest take-off 07:00 the unnamed 07:30 / 08:00 are the evening before (D503), as the app's own warning says; the scenario's expected line was wrong |
| 14 | walker B S2-10b/f | the run-of-days focus stays | the item's mend was partial | FIXED `f6f4ab9f8` (row 4) — re-walk F PASS |
| 15 | walker C S3-02b | Undo after an OIL answer in the input's own window said "a personal input" | the item's mend was partial | FIXED `6bef23a8e` — re-walk F PASS |
| 16 | walker C S3-10 | Undo named a box typed on the board "a change to the schedule" | the item's mend was partial | FIXED `50cad9dc3` — re-walk F PASS ×10 |
| 17 | walker C S3-16; re-walk F; re-walk G | a crew-list puck held near the top of the board pane on a sideways phone never scrolls the pane | OLDER — the drag scrolls the list it came from (`ui/drag.ts tdScrollerFor`, unchanged by the batch) | FILED in `[OIL-NOTIFY-SEEN]` |
| 18 | walker D S4-04 | a finger's tap on the phone board after a changed box did not take the caret | NEW | FIXED `285f3ac3b` — re-walk F PASS |
| 19 | walker D S4-05 | a button's first press after a changed box does nothing | OLDER | FILED `[EDIT-BUTTON-AFTER-CHANGE]` |
| 20 | walker D S4-17 | the Leave War grid back to January on a phone | — | NOT A FAULT — the walker's own script (a scroll into view of an off-screen cell) |
| F1–F3 | the fresh blind read | the pressed-box mark could stick and hold the redraw; an emptied line then a grip dragged the wrong line; the week re-landed on the app's own band resize | NEW | FIXED `b2797b27f`, `5a20cccfe`, `f9cdafcdb` — re-walk F (F1) and G (F1–F3) PASS |
| N1 | the narrow read, round 1 | F1's fix repainted the whole app at the start of nearly every finger scroll on a phone | NEW (with F1's fix) | FIXED `0df257c26`, red first — re-walk G F1 PASS |
| G-S | re-walk F's surprise, reproduced in re-walk G | after Undo with the caret still in the line, the box kept the typed time for good (week and board, draft and published) | OLDER — the same on `main`'s build | FIXED `9cbdc5e64`, red first on both surfaces — re-walk G PASS ×4 |
| R2-F1 | the narrow read, round 2 | Undo pressed with the caret still on an In-time line (a tap on Safari) wrote that line over the one Undo brought back: a line lost, another doubled — saved data | OLDER — reproduced on the built app | FIXED `40c7af45e` — Undo and Redo let a held caret go first; red first (`undo-caret.test.tsx`), red again with the guard out; re-walk G PASS ×2 |

## His look

## His look

A five-minute look, on the preview, on his iPhone and his PC:

1. **Scheduler Board, a wave with three In-time / Rally lines:** drag one by its six-dot grip into a new place — it lands where you let go, and the lines run the panel's full width. Auto sort puts them in time order.
2. **On your iPhone, Edit Schedule:** type a new take-off time, then tap straight into the next box once — the cursor goes there (the fresh read's O1: only a real iPhone proves it).
3. **On your iPhone:** empty one In-time line, tap the next line, tap Undo, tap away — every line is back, none doubled.
4. **On your iPhone:** start a scroll with your finger on a time box — the week scrolls smoothly, with no hitch at the start.
5. **A published day:** drag an In-time line into a new order — the day shows "1 pending" and "To go out" says "order changed".

## The walk line

`Walk: docs/handpass/2026-10-19-schedule-amendments-fixes.md · 572 pictures · 26 roll-call rows, every one walked · 256 rows walked (187 in the walk, 69 in the re-walks E–G) · MISSING: none open — 0 MISSING rows; older faults met: 2 fixed (the box after Undo, the In-time line under Undo), 2 filed ([EDIT-BUTTON-AFTER-CHANGE], the crew-list puck in [OIL-NOTIFY-SEEN])`
