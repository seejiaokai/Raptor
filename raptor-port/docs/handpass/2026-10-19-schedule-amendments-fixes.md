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

(Written before the walkers start.)

## The orders walked

## Cases carried by a test

## Pictures

## Break tests

## Errors seen

## What was NOT walked, and why

## The gates

## The code read

## What the check found, and each disposition

## His look
