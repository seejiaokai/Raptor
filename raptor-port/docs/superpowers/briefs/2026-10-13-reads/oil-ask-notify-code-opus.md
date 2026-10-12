# `[OIL-ASK-NOTIFY]` — the read of the finished code (the fresh Opus reader) — 13 Oct 26

Branch `claude/oil-ask-notify` at `2f677c0d8`, read against `origin/main`. Read-only: no build, no test, no browser was
run; every claim below comes from reading the code, and each one says what was traced. The brief:
`docs/superpowers/briefs/2026-10-13-oil-ask-notify-code-read.md`. The other reader's report was not opened.

**What was read whole or in the parts where the change sits:** the rulings' full rows (D780–D783, D785, D762, D755, D769,
D103, D21, D2, D292); the plan (§3, §5a) and the register (ON1–ON16); the check's sheet (§4, §5, §8, §11); the whole
source diff (1,737 lines) and the older tests' changes; `ui/reqdoor.ts` (whole), `ui/oilwait.ts`, `ui/OilWaitSheet.tsx`,
`ui/OilDayList.tsx`, `ui/oilday.ts` (whole); `ui/inputedit.tsx` (`oilGate`, `commitInputEdit`, `saveBatchX`, `dryRun`,
`oilFirst`, `reassignInput`, `askOilIfPending`, `setInpField`, `commitInput`, the window's `save` / `saveNow`);
`ui/caldrag.ts commitChipMove` and the drop; `ui/drag.ts applyDrop` (whole); `state/view.ts placeArmed`, `setPage`,
`VIEW_RESET`; `state/store.ts` (`runInputWrite`, `batchResult`, `writeInputsBatch`, `tryInputsBatch`, `resetSession`,
`switchRoleView`, the `HOOKS` wiring); `state/sched-commit.ts` (`schedStore`, `applyEnd`, `tellBegin` / `tellPass`,
`commitInputsWith`, `afterCommandPass`, `schedWriteRecords`); `command/commit.ts` (the pipeline, the join, the
rollback, the latch); `state/history.ts histRestore`; `engine/editlog.ts` (how a history line is held);
`state/perms.ts inputBreach`; `leavewar/state/store.ts` (`persistNotify`, `gesture`, `newHolidayRuns`, `tellHolidays`,
`lwStore`, every writer of a period's days, bands and of the event types, `historyApply`, `loadWars`, `createWar`);
`leavewar/sync.ts` (`oilAskPlan`, `oilPendingFor`, `oilOpenOn`, `holidayLeft`, `tellHoliday`, the two notify lanes,
`warFactsVersion`, `dayFacts`); `state/notices.ts`, `state/noticeseen.ts` (whole); `ui/topbits.tsx` (the bell);
`state/persist.ts` (the notices' rows); `state/dropflag.ts`.

---

## Verdict

**CLEAN WITH THESE EXACT CHANGES.** One finding should be fixed before "merge live" (F1 — one line and a test). F2 is a
small, sure fix worth taking with it. F3–F8 are low: each can be fixed, or filed and told to the owner.

| # | Severity | New / older | One line |
|---|---|---|---|
| F1 | **MEDIUM** | NEW | After the question is put (and after "Don't swap / add / move"), the day's warnings, issue counts and puck rings are those of the change that was NOT made — until the next edit re-checks. |
| F2 | LOW–MEDIUM | NEW | "Answer OIL" after another person was added to the row turns the waiting SWAP into a silent ADD — no question, the man is added and stays on his seat. |
| F3 | LOW | NEW | "One bell line a holiday" does not hold when a holiday's dates are changed, when it is made again over other dates, or when one holiday runs across a weekend. |
| F4 | LOW | NEW | The bell's thirty-line cut can hide a live holiday line while the tap still defers to it — that scheduler's own OIL question is then unreachable from his bell. |
| F5 | LOW | NEW | The bar's "Answer OIL" still works after OIL Earn is switched on — a swap or an add is made inside the mode that promises the day does not move. |
| F6 | LOW (look) | NEW | "Both pucks flash" is missed in two places: an add dropped on a row's open cell from a seat, and the Unavailable row's second "not answered". |
| F7 | LOW | OLDER | An input "taken off" the programme and put back after its day became a holiday comes back unanswered with nobody asked — the plan's "the only way left" is not true. |
| F8 | LOW (records) | NEW | The declared record type of a notice (`engine/schema.ts`) does not carry the new holiday part. |

---

## F1 — MEDIUM, NEW — the tried save leaves the rules' results describing a change that was never made

**What a person meets.** On a Saturday the scheduler drags Hex from a seat onto Ranger's row under Unavailable (an
overseas duty — the walk's S14), or drags Tally from a flying seat onto Ranger's only puck on an input's row (S1). The OIL
question comes up. Behind it — and, after "Don't swap", for as long as the bar stands and until some later edit — the
day's issue count, its warning list and the rings on the pucks are the ones the swap WOULD have caused: Hex ringed as
"away but tasked", or Ranger flagged in a seat he is not in, or a warning of Tally's gone although he never left his
seat. Nothing was changed and nothing is saved, so it is display only and it heals at the next edit — but D783's promise
is "nothing moves", and the screen says otherwise. The same happens after a date drag on the Inputs calendar that is
left unanswered (seen when he next looks at the schedule).

A second, smaller effect on the ANSWERED path: the "already busy" note is worked out from "the warnings before against
the warnings after" (`state/dropflag.ts warnDelta`, by content). "Before" is read in `ui/oilwait.ts answerOilWait`
(`w.pre()` → `WARN`) — which by then is the tried picture, so a warning the change itself causes can already be in
"before" and is then not said (Fable's A4 is defeated where the tried check saw the warning).

**Cause.** `state/store.ts tryInputsBatch` runs the door's body through `runInputWrite`, whose last line is
`HOOKS.renderInputs(); HOOKS.reflow(); HOOKS.histPush()`. `HOOKS.reflow` is `() => { validate(); notify() }`
(`state/store.ts`, the `HOOKS` wiring): the `notify()` is held by the command and dropped on the rollback, but
`validate()` runs AT ONCE, inside the command, on the tried world, and reassigns `WARN` / `REST` / `EVD` — which are
module state, not part of the snapshot `histRestore` puts back. An ordinary refused save re-checks afterwards
(`batchResult` → `HOOKS.reflow()`); `tryInputsBatch` deliberately does not go through `batchResult`, so nothing re-runs
the rules on the world put back. `ui/reqdoor.ts gated` and `ui/inputedit.tsx oilFirst` then call `holdForOil` → `notify()`
and every screen repaints from the stale results. No caller re-checks: the only `validate()` callers are a command's own
epilogue, a week load, opening the board, a warning hidden, and the Leave War lane when a day's earning status moves.
What the tried check sees is a real difference: the engine's events read the inputs' people directly
(`engine/events.ts inputLinesOn`), and a swap from a seat writes the seat inside the try (`seat.take` → `setSlotVal`).

**Silent?** Not data — a wrong picture on screen, with no word that it is provisional. **New:** `tryInputsBatch` is this
job's.

**Fix (build from this).**
1. `raptor-port/src/state/store.ts`, `tryInputsBatch`: after the `commitInputsWith(...)` call and before `return passed`,
   add one line — `validate()` (already imported in that file) — with a comment: the rules were run on the tried world
   inside the batch; the rollback put the model back but not `WARN` / `REST` / `EVD`; run them once on the world as it
   stands, with no repaint of its own. Do NOT route the try through `batchResult` (that drops the armed place).
2. A test, red first, in `ui/oilwait.test.tsx`: a Saturday with a man seated on a line and another man's overseas duty
   under Unavailable (the fixture of "the Unavailable row, dragged onto from a seat…"); take
   `WARN.all.map(warnKey)` (`state/dropflag.ts`) before; `reassignInput(iid, seatedMan)` → `false` with `OILWAIT` set;
   expect the same keys; `leaveOilWait()`; expect the same keys again. A second case for the swap from a seat through
   `rowPut(key, id, { from: seat, take })`.
3. (Optional, cheaper) instead of step 1, skip the check while a try runs — a module flag set by `tryInputsBatch` and read
   by `HOOKS.reflow` — which also saves the three to five whole-week checks each try now costs. Only if nothing inside
   a save reads the check's results after its own `reflow`; step 1 is the safe one.

**Not traced to the end:** whether anything SAVED reads those results between two checks. What was traced: the warnings
frozen at publishing are re-checked first (`engine/validate.ts HOOKS.issuedWarn` calls `validate()`), and the pending
count and the sign-offs are worked out from the data, not from `WARN` (ON8 holds). The crowd frozen behind ALL AVAIL at
publishing was not traced — one more reason to fix this at the root rather than per reader.

---

## F2 — LOW–MEDIUM, NEW — "Answer OIL" can make a different change from the one that was waiting, without a question

**What a person meets.** Tally is dragged from a seat onto Ranger's only puck on Saturday's Range brief (answered).
"Don't swap" — the bar says "Not swapped — OIL not answered". While the bar is up someone adds Hex to Range brief (crew
list onto "+ add"; the input is answered, so no question). The scheduler presses **Answer OIL**. No question comes: a
note says "Tally added to Range brief", Tally is now IN the input and still on his flying seat, and Ranger was never
replaced. He pressed a button that promised the swap's question and got an add he did not ask for.

**Cause.** `ui/reqdoor.ts rowPut`, the `again` closure: it checks the row, the seat and `here()` — and `here()` only
asks that the place still holds the same man of the same input. It then calls `rowPut` afresh, which works out `swap`
again from the input as it NOW stands (`ids.length === 1` is false with two people), takes the join branch, finds the
input answered (`gated`: the gate says `'none'`) and makes the add at once. `ui/oilwait.ts oilBarAgain` sees `'done'`
and runs the landing flash. The plan's A5 ("a row that has changed says so") is kept for a changed man or seat, not for
a changed KIND of change.

**Silent?** A note is said, but it names a change other than the one waiting, and no OIL question is put. **New.**

**Fix.** In `rowPut`'s `again`: find `q = here()`; if `!k || (F && !sk) || !q` → `'none'` as now; then work the kind out
again — `const swapNow = !isSpecial(pid) && !!q.at && people(q.inp).length === 1 && !isSpecial(q.at)` — and
`if (swapNow !== swap) return 'none'` ("That row has changed — not swapped / not added"). Test beside "Answer OIL after
ANOTHER man took the puck" in `ui/oilwait.test.tsx`: cancel a swap, `commitInput` a third man into the input, press
`oilBarAgain()`, expect the input's people unchanged, no `OILWAIT`, the words "That row has changed — not swapped".

---

## F3 — LOW, NEW — "one bell line a holiday" (D783 (6)) fails where a holiday's dates change, and across a weekend

A notice stores the run of dates that became non-working at the moment it was made (`leavewar/state/store.ts
newHolidayRuns`), and `state/notices.ts noticeLive` folds two notices only when their two dates are IDENTICAL. So:

- **(a) made again over other dates — two lines counting the same inputs.** Holidays list: add National Day Thu 16 –
  Fri 17 Jul with three inputs on the Friday; remove it; add it again as Fri 17 only. The first notice (16..17) is live
  again (its count reads the Friday's inputs), the second (17..17) is live too: every scheduler's bell shows two lines,
  each "3 inputs need an OIL answer".
- **(b) dates changed — a stale date in the words, or a second line.** Change Thu–Fri to Fri only: no date became
  non-working, so no new notice; the old line and the list's heading go on saying "Thu 16 – Fri 17 Jul". Change Fri
  to Thu–Fri: Thursday is a new run, so one holiday has two lines, and an input covering both days must be answered
  twice, once in each list (`ui/oilday.ts` answers "its unanswered days in the run" only).
- **(c) one holiday across a weekend — two lines, and the list opens for the first part only.** A holiday entered as
  Fri 17 – Mon 20 Jul: Saturday and Sunday were never working days, so `newHolidayRuns` makes two runs (Fri; Mon), two
  bell lines, and `tellHoliday` opens the list for the Friday alone. (The walk's E2 recorded the two-runs behaviour for
  a re-tagged event type; this is the same thing for ONE named holiday.)

**Silent?** No — too many lines, never too few. **New.**

**Fix.** (1) `leavewar/sync.ts tellHoliday`: for each run, find the holiday as it NOW stands on the run's first date
(`holidaysIn(year)` — the line whose `from..to` holds it) and write the notice, and open the list, for that line's
whole `from..to`; drop duplicates so one holiday makes one notice a scheduler however many runs it gave. (2)
`state/notices.ts noticeLive`: hide an older holiday notice of the same person whose dates all lie INSIDE a newer live
one's (containment, not only equality) — never on mere overlap, or days only the older one covers would lose their
line. (3) For the words: have the installed reader (`setHolidayLeft`) also answer the first and last date of the run
that are still non-working, and print those in `noticeWords` and the list's heading. Tests in
`leavewar/holnotice.test.tsx` for (a), (b) and (c). If he prefers it as built, it is one more reading to tell him (R11's
neighbour).

---

## F4 — LOW, NEW — a live holiday line beyond the thirty-line cut strands that scheduler's own question

`state/notices.ts noticesFor` drops lines after the thirty newest. `ui/topbits.tsx bellTap` skips a scheduler's own
unanswered input when `holidayLineOn` finds a live holiday notice for its day — and `holidayLineOn` does not know about
the cut. With more than thirty newer notices to that scheduler (an admin who is in many inputs, questions left for
weeks), the tap opens a list that does not show the line: his own input's question can no longer be reached from the
bell, and the one list cannot be opened from it at all. The "OIL?" tag and the input's own window still work.
**Silent:** yes, as far as the bell goes. **New.**

**Fix.** In `noticesFor`, live holiday lines are never cut: sort as now, keep every notice whose first part is `oilhol`
and cut only the others to the thirty (holiday lines first, or in date order — as drawn). Test: forty newer notices and
one older live holiday notice → it is listed, and `bellTap` reaches it.

---

## F5 — LOW, NEW — the bar's "Answer OIL" makes a change while OIL Earn is on

`ui/drag.ts applyDrop` refuses every drop while OIL Earn is on (`view.OILDAY != null`, "the day underneath does not
move while a scheduler decides what it pays"). The bar is not one of the board's own controls and is not cleared by
`state/view.ts setOilDay`. So: cancel a swap on the board (bar up), switch OIL Earn on, press **Answer OIL**, answer —
the swap is made inside the mode. **Not silent** (the question and the note are shown). **New.**

**Fix (either).** Clear `OILWAIT` / `OILBAR` in `setOilDay` when the mode is switched on; or in `ui/oilwait.ts
oilBarAgain`, when `OILDAY != null`, say `OIL_NO_MOVE` (`ui/oilmode.ts`) and leave the bar. Test in
`ui/oilwait.test.tsx`.

---

## F6 — LOW (look), NEW — "both pucks flash" (D783 (2)) is missed in two places

- **An add dropped on a row's open cell from a seat.** `ui/drag.ts applyDrop`'s seat branch hands the door the seat
  (`rowPut(targetKey, aimed, seat)`), so both places flash; its cell branch (`onCell`: `rowPut(fillKey, moving)`) hands
  none, so only the row's name box flashes. Fix: in `held`, before `no()`, `if (DRAG.kind === 'slot')
  oilWaitAlso(DRAG.key)` (it ignores a place already listed).
- **The Unavailable row, the second time.** `oilWaitAlso` adds the seat to the first wait only. After "Answer OIL" and a
  second "Don't swap", `oilBarAgain` carries `pre` / `post` to the new wait but not the extra place, so only the row's
  man flashes. Fix: keep the extras on the wait (`also?: string[]`, pushed by `oilWaitAlso`) and, in `oilBarAgain`'s
  `'asked'` branch, add them to the new wait's `places`.

---

## F7 — LOW, OLDER — an input put back on the programme can come back unanswered with nobody asked

**What a person meets.** A Meeting on Fri 17 Jul is taken off the programme. Friday is then made a public holiday: the
one list and the notice leave that input out (all three readers skip one "taken off"), and if it was the only input on
the day nobody is told at all. A scheduler later puts it back (Accept on its card, or Undo of the take-off). It now
needs an OIL answer; the scheduler is asked nothing, no holiday line exists, and only the "OIL?" tag and the bell of
whoever answers for it say so.

**Cause.** `ui/interactions.ts` (the Accept / take-off buttons → `engine/slots.ts acceptInput`) and the board's
equivalent never reach the OIL gate. Not in this job's diff — but the plan (§3.1) says that after this job "the only
way an input's question opens with nobody asked is a day made a holiday afterwards", and this is a second way.

**Fix.** At the two Accept doors, when the accept went through, the reader may edit the schedule and
`oilUnansweredDay(inp)` names a day: put the question (`askOilIfPending(inp, true)` is enough here — an accept is not
refused for OIL), or go the whole way and ask first as the other doors do. Or file it and tell him.

---

## F8 — LOW (records), NEW — the declared notice type was not widened

`raptor-port/src/engine/schema.ts`, `NoticePartRec.k` lists the twelve older parts and not `'oilhol'`; `NoticeRec`'s
comment still says a notice is about "an input he is in". `docs/data-schema.md` and `docs/data-model.md` were updated;
this file is the third home of the same fact. Fix: add `'oilhol'` to the union, say that `a` / `b` are then the run of
dates and `iid` is `''`, and that `name` may be `''` for a holiday with no name of its own. No behaviour changes.

---

## Explicit negatives — traced and found sound

**The doors (brief item 1).**
- Every caller of the row's door treats the fourth answer correctly: `ui/drag.ts` (five sites → `held`, nothing
  moved, no flash, no note), `state/view.ts placeArmed` (stays armed, returns false), `state/store.ts writeSlot` /
  `writeFill` (`!== 'none'` → return; they have no caller in the app today), `probe-bridge.ts` (false). `'none'` cannot
  come back from a first call for a row the door owns, so the drag's raw two-write path is not reached; the engine's
  belt stands behind it.
- `reassignInput` (both branches) and `commitChipMove` go through `oilFirst`; their callers ignore the boolean or use
  it only for the landing flash. A medical never reaches the OIL wait (the medical question returns first).
- The input's own window still asks before it saves, for a change of dates and of people (`save` → `oilGate` before
  `doSave`); its code is not in the diff.
- Typed boxes on a row (`setInpField`, `setInpTitle`), the right-click and a drag off (`rowTake`, `rowLeaveTo`), the
  board's CX / red box / information-only (`rowMark`) put nobody on a row and ask nothing, as ruled.
- A load, a plan switch, a template and the after-command pass re-make rows FROM the inputs; none writes an input's
  people or dates.
- An Undo or a Redo re-makes a swap from its recorded images, answer included; nothing is left asked.
- **The remaining callers of `askOilIfPending`:** (1) `reqdoor.ts gated` and (2) `inputedit.tsx oilFirst` — only when
  the try said "would be refused" and the real run then went through (the change is made and the question follows —
  never silent; no way to reach it was found by reading); (3) `setInpField` for someone who may not edit the
  schedule (no screen reaches it). None of the three is on a normal path.

**The tried save (item 2).** Apart from F1, nothing was found left behind:
- the model, the notices, the pending marks and the sign-offs are in the snapshot the rollback restores
  (`histRestore`); the baseline is put back by its resync;
- change-history lines are held while a command runs and dropped with it (`engine/editlog.ts push`);
- the Undo step, the save's rows, the repaint and the after-command pass are held effects, dropped on the rollback;
- notes are muted through `HOOKS.toast` (every note on these paths goes through it);
- the Leave War's store is enlisted by any write the absence rules make inside the batch, and restored;
- the armed place is not dropped (the try does not go through `batchResult`) — except with a locked week present
  and a refusing body, where `runInputWrite`'s own catch drops it (no screen makes a locked week);
- `TRYING` and `LANDED` are reset; a burnt id counter is harmless.
- **Who holds a record across a try:** `gated`'s `make` / `gate` find the row by its id and the input by the row each
  time; `oilFirst` finds the record by its id; `caldrag` keeps the old dates and people as plain values; the input's
  window re-finds its record by id after every paint. None uses a dead object.
- **Can the try and the real run disagree?** The try stops inside the save, so it cannot see the two checks made AFTER
  a save's body (a member's ownership check, the record-shape check). For a scheduler's gestures the first does not
  apply and the second is asked earlier by the save itself; for a member's calendar drag the OIL answer written is
  well-formed for that check (each day is one the record asks, each amount the record's own or 0). If they ever did
  disagree the real run refuses in words after the answer — not silent.
- **Cost:** a change that asks costs about two saves (three to five whole-week checks and as many snapshots). It runs
  only at a drop, an armed tap or a calendar drop — never on a pointer move.

**Answered (item 3).** The answer is written in the same command for a join and a move (`commitInput`'s last line), a
replacement (`commitInputEdit`, after the hand-over voided the first man's), both Unavailable branches and the
calendar's drag for one person and for several. A No (0) is kept everywhere (`== null` is the only "unanswered" test;
the answer object is truthy). The window's own save replaces the answers the same way, so the behaviour matches.

**Not answered (item 4).** The bar's closures find rows, seats and records by id. A row deleted, moved or re-ordered, a
different man on the puck, the dragged man gone from his seat, an input handed over or re-dated meanwhile → "That row
has changed", nothing written. A week change, a page change and a sign-out clear the wait and the bar. A second waiting
change replaces the first (recorded for him, A12). Stepping the board to another day, or closing the board, within the
same week does NOT clear the bar; "Answer OIL" then still finds the right row and makes the change on the day it names
— no wrong row, but the landing flash is on a day not in view (to tell him; no ruling).

**A published day (item 5).** Nothing waits and no sign-off falls until the answer (the snapshot holds both). The
list's Save on a published day is an ordinary input change.

**What makes a holiday (item 6).** Every writer of a period's days, bands or of the event types ends either in
`gesture` (the Holidays list's three, the Event sheet's save and delete) or in `persistNotify`'s own `lw.edit` (a typed
word, a range, a band, a band moved, an event type added, changed, removed or reset, a new period) — each tells once.
A gesture's inner saves join it and tell nothing of their own. The boot, a reconcile, the old Leave War undo
(`historyApply`), the one Undo's restore (`lwStore.write`) and the test bridge tell nobody. `newHolidayRuns` judges each
side with its own event types and bands; a weekend, an Off day (D21), a day already non-working and a date no period
held are never "new". A refused holiday command rolls the notices back and never opens the list.

**Who is told (item 7).** Every admin account that is on and tied to a person, once each, the maker included; a member,
a guest and the admin's own member view have no line (`noticeLive` asks the role). The notices are saved one row each by
the collection's own writer whatever command made them, and the loader does not check a notice's kind.

**The line and the bell (item 8).** The count is read live and remembered only until either store moves; a holiday
removed, an answer given, a week loaded all move one of them, and the Leave War lane wakes the bell when the open
questions change. No line is shown at 0; a line at 0 lights nothing and is not read by "Mark all read". A member's bell
is untouched (a notice about an input returns before any new test). One small gap in ON14's words: a line the reader
had already READ comes back read, not unread, after an Undo and a Redo of the holiday (his read record keeps the id).

**The one list (item 9).** The list, the "OIL?" tag and the bell's own scan use the same three tests (the kind asks,
not taken off, a day of the plan with no answer), so they agree for a cancelled input, an information-only one, a
Personal input and a day with no period; the tag alone does not skip a locked week's day. The Save is one command,
writes only the run's unanswered days, checks the role at the write, skips an input answered or deleted meanwhile, and
leaves the window open on a refusal. Answering there makes no notice (`noticePass` has no OIL part).

**What could have broken elsewhere (item 10).** `OilConfirm` keeps Cancel / Save where no labels are passed;
`InputCard` draws nothing new without `action`; every reader of `RowAnswer` handles the fourth value; the older tests
were changed only where D783 changed the behaviour, each with the ruling named.

---

## What must be fixed before "merge live"

F1. Recommended with it: F2. F3–F8: fix, or file each in the backlog and tell the owner (F3 and F7 touch what he ruled —
"one line a holiday", "never silent").

## Scenarios a walk of the running app should still drive

1. **F1.** Saturday: Hex on a flying seat, Ranger's overseas duty under Unavailable. Drag Hex from the seat onto
   Ranger's row. With the question up, then after "Don't swap": is the day's issue count, its warning list and every
   ring exactly as before the drag? The same for Tally dragged from a seat onto the only man's puck of an input whose
   hours overlap that flight; and for a calendar date drag left unanswered, then a look at Edit Schedule.
2. **F1, the answered half.** A swap that gives the new man a real clash: is the "already busy" note said on "Swap"?
3. **Publish straight after "Don't swap"** with no edit in between: the published face's warnings and the ALL AVAIL
   count against the same day published without the cancelled swap.
4. **F2.** Cancel a swap; add a third man to that row from the crew list; "Answer OIL".
5. **F5.** Cancel a swap on the board; switch OIL Earn on; "Answer OIL".
6. **F3.** Thu–Fri holiday changed to Fri only; Fri changed to Thu–Fri; removed and added again over other dates; one
   holiday entered Fri–Mon. Count the bell lines and read their dates.
7. **F7.** Take an input off the programme; make its weekday a holiday; put it back.
8. **F4.** A scheduler with more than thirty newer notices and a live holiday line: the bell's tap.
9. **The bar across the board:** cancel a swap on the board, step to another day and close the board, then "Answer
   OIL"; and the bar on the Inputs page after the admin switches to the member view.
10. **Share B's rows still open in the sheet (§11.4):** the armed tap with the phone's drawer up (is the question in
    front of the drawer; is the bar reachable), the short screens, the bell on a phone.
11. **Escape with the question up over the Scheduler Board:** does it only leave the question, or close the board too?
