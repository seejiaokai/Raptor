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
| In-time / Rally drag | Scheduler Board, desktop | HAS | |
| | Scheduler Board, phone (touch) | HAS | |
| | Edit Schedule's week | MUST NOT (D594 — no drag there), shows the board's order | |
| | View-only Sched | MUST NOT (read only), shows the order | |
| | a published day | HAS — a change waiting, sign-offs fall, a drag back nets to nothing | |
| In-time / Rally order by sort | the wave's Auto sort; the board's Sort all | HAS | |
| "To go out" words | the changes window, a published day | HAS — names the lines; "order changed" | |
| The crew list's strike / hint | SC MAIN, SC SPARE (blank times), AVALON / BB seat, a blank line, a duty / sim / ground / programme row with no times; week and board | HAS | |
| The warning sentences | the day's issues list, week and board, desktop and phone | HAS | |
| The SC SPARE's ring | week and board | MUST NOT borrow the MAIN's | |
| The changes window: SC B "in-time"; In-time block a button on the board; + Block / SC wave / documents lines | Edit Schedule's clock window; the board's History | HAS | |
| "Discard N edits & load" | the versions menu's load of an issued version | HAS — counts only real discards | |
| "Set as default order?" | over the Scheduler Board | HAS — above the board, below a modal | |
| A note while the changes window is open | phone | HAS — at the top | |
| "Breaks <day>" focus | closing that list | HAS — focus goes | |
| The landing flash | a day's first ground-row drag (phone) | HAS — the row that landed | |
| Undo's words | after a swap on an input's row; after an OIL answer | HAS | |
| A touch drag's edge band | the board on a phone on its side | HAS — a sixth of the pane, at most 52px | |
| The desktop week after a resize; "day a–b of 7" | Edit Schedule, View-only Sched at 1440 | HAS | |
| One click after a changed box | Edit Schedule's week, desktop and phone, a draft and a published day | HAS | |
| | the Scheduler Board's boxes | HAS (`textCaret` used there too) | |
| Tab from the day's last box | a weekday (no control below: back in the box, D597); a weekend (a control below: on it, D553) | HAS | |
| OFT row's "+" twice | Edit Schedule's week | HAS — refused, says why (unchanged) | |
| A man's figures on a phone, the year scrolled | the Leave War | HAS — the grid stays (unchanged) | |

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
5. **Its row in the ledger:** added after the walk.

## The orders walked

## Cases carried by a test

## Pictures

## Break tests

## Errors seen

## What was NOT walked, and why

## The gates

## The code read

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
| 9–11 | designer S3-08, S4-13, S3-05 (B), two low | the discard count for an input under Unavailable; a resize during an arrow's glide; a note raised while the offer is up | — | judged from the walk |

## His look
