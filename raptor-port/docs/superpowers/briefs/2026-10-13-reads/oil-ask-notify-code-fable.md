# `[OIL-ASK-NOTIFY]` — the independent read of the FINISHED CODE — Fable 5.1, 13 Oct 26

Branch `claude/oil-ask-notify`, head `2f677c0d8`, read against `origin/main`. Brief:
`docs/superpowers/briefs/2026-10-13-oil-ask-notify-code-read.md`. Read-only; this file is the only thing written.

**What was read, whole where the change sits:** the twelve rulings' full rows (the shell); the plan (§3, §5a) and the
register (ON1–ON16); the check's sheet (§4, §5, §8, §11 on); the whole diff of `src` and `e2e`; and in full
`ui/reqdoor.ts`, `ui/oilwait.ts`, `ui/OilWaitSheet.tsx`, `ui/OilDayList.tsx`, `ui/oilday.ts`, `state/notices.ts`,
`state/noticeseen.ts`, `engine/editlog.ts`; the changed regions and their surroundings of `ui/inputedit.tsx` (`oilGate`,
`commitInputEdit`, `saveBatchX`, `dryRun`, `oilFirst`, `reassignInput`, `askOilIfPending`, `commitInput`), `ui/caldrag.ts`
(`commitChipMove`, the drop), `ui/drag.ts` (`applyDrop` whole), `state/view.ts` (`placeArmed`, `setPage`, `VIEW_RESET`),
`state/store.ts` (`writeSlot`, `writeFill`, `runInputWrite`, `tryInputsBatch`), `state/sched-commit.ts` (`applyEnd`,
`tellPass`, `commitInputs`, `commitInputsWith`, the notices row reader), `command/commit.ts` (`dispatch`, the child join,
`rollback`), `leavewar/state/store.ts` (`persistNotify`, `gesture`, `newHolidayRuns`, `tellHolidays`, `setDayEvent`,
`setDayEventRange`, `addEventBand`, `holidayPlan`/`holidayRun`, the event-type writers, `createWar`, `loadWars`, the legacy
undo), `leavewar/sync.ts` (`isNonWorkingISO`, `oilAskPlan`, `oilPendingFor`, `oilOpenOn`, `holidayLeft`, `schedulerIds`,
`tellHoliday`, `warFactsVersion`, `dayFacts`), `leavewar/engine/eventdefs.ts` (`isNonWorkingDay`), `ui/topbits.tsx`
(`bellOn`, `bellTap`, `openNotice`, the list), `ui/OilConfirm.tsx` (the save), `ui/interactions.ts` (the Unavailable row's
armed tap), `ui/Shell.tsx` (the right-click), `state/accounts.ts`, `state/perms.ts` (the member's OIL breach check), and
the names of every test in `ui/oilwait.test.tsx`, `leavewar/holnotice.test.tsx`, `ui/reqdoor.test.tsx`,
`ui/caldrag.test.tsx`, `ui/oilconfirm.test.tsx`.

**Not reported, by the brief:** harm only in stored demo data; a scheduler who is not an admin; the previous job's
register ids; two devices.

---

## 1. Verdict

**CLEAN WITH THESE EXACT CHANGES** — three findings, all LOW, none silent in a way that loses or corrupts a record, none
that must block his "merge live". The core promises hold in the code: a swap, an add or a move that raises the question
writes nothing until it is answered and is then made with its answer in one command; a tried save leaves nothing behind;
every door that makes a working day a holiday reaches the one telling, exactly once, and never a restore; what the admin
answers tells nobody; a line at nothing left is neither listed nor lights a bell; a member and the admin's own member
view see no holiday line. If he wants them fixed first, each is a few lines with a test (§3); if he wants to merge
first, nothing here would make the app do the wrong thing to a record.

---

## 2. The enumeration — every door, writer and reader, with what I found

### 2.1 Every way a person reaches an input's row, or an input reaches a day that asks (brief 1)

| Door | Path to the write | Asks first? | Verdict |
|---|---|---|---|
| Seat puck dropped on the only man's puck (board, week) | `drag.ts applyDrop` → `rowPut(targetKey, aimed, seat)` → `gated` | yes — `'asked'` → `held()` → nothing written, no flash, no note | sound (ON1) |
| Crew-list man dropped on the only puck | same, `seat` undefined → "Putting X in place of Y" | yes | sound |
| Drop on "+ add" / a puck of several / a place under | `rowPut` → `join` | yes where the input has no answer; a No adds at once "not counted" | sound (ON3) |
| One input's row → another's (a move) | `rowMove` → `gated` | yes, on the second input's question | sound (ON4) |
| ALL AVAIL / ALL dropped on an input's row | `rowPut` (never a swap) → `gated`; a two-day input refused by the save's own body in the dry run, no question | yes | sound (R8) |
| The armed tap on a row's place (phone and desktop) | `view.ts placeArmed` → `HOOKS.inputRow.write` → `rowWrite` → `rowPut` | yes — `'asked'` → returns false, place stays armed, `pre`/`post` handed to the wait | sound (ON5) |
| A callsign typed in the name box of an input's row | `state/store.ts writeSlot/writeFill` → `HOOKS.inputRow.write` → `rowPut`; the writer returns on anything but `'none'`, never on to `setSlotVal`; the belt `inputSeatBar` refuses a raw write | yes | sound in the code — see the walk list (the box's own epilogue was not driven by any test I could find) |
| The right-click | `Shell.tsx` → `rowTake` only | never asks (a leave) | sound (R13) |
| A time or remark typed on the row | `writeText` → `HOOKS.reqRowText` — not in this diff | never asks (D739 r4) | untouched (R12) |
| The Unavailable row's person — drag | `drag.ts` → `reassignInput` → `oilFirst` (both branches: one man of several `swapPerson`; one person `commitInputEdit`) | yes | sound (ON9) — but see F3 |
| The Unavailable row's person — armed tap | `interactions.ts` ~976 → `disarmSlot()` THEN `reassignInput` | yes — but the arm is dropped before the question | **F2** |
| The Inputs calendar's date drag (a chip, a bar; one person or several) | `caldrag.ts commitChipMove` → `oilFirst` | yes; medical asks its own question first and never OIL (A10) | sound (ON9) |
| The input's own window | `InputEditor` → `oilGate` → `OilConfirm` → the batch — not in this diff | always asked first | untouched (R11) |
| A load, a plan switch, a day template | `overlay.ts`/`holderbase` re-derive the row from the request; a template copies a row with nobody on it | nothing to ask | untouched |
| Undo / Redo of a swap | the one timeline restores both stores from the command's snapshots; no door runs | never asks, as it must not | sound (ON2) |

**Callers of `askOilIfPending` left:** (1) `reqdoor.ts gated` and `inputedit.tsx oilFirst`, only on the disagree branch
"the try refused but the real run went through" — the change is then made and the question follows, never silent;
(2) `setInpField`'s non-scheduler branch (a member typing hours on his own Unavailable row — unreachable from a screen
for a scheduler since D739). Neither can leave a change made and unanswered by a path a person reaches: (1) cannot
happen unless the two runs differ, which they cannot (same body, same records); (2) is the pre-existing backstop.

**Every reader of the door's answer treats `'asked'` by name:** the drag's five sites (`held`), `placeArmed`, `writeSlot`
and `writeFill` (`!== 'none'`). `HOOKS.inputRow.write`'s type carries the fourth value, so a later caller cannot miss it.
`reassignInput` now returns a boolean: its two callers (`drag.ts`, `interactions.ts`) ignore the value, as before.

### 2.2 The save that is tried and thrown away (brief 2)

`tryInputsBatch` runs the door's body inside `commitInputsWith` and throws `CmdRefused` after it; `commit`'s phase-6
`rollback` restores every enlisted store from its snapshot and empties the deferred list. I traced each thing the brief
names:

- **Schedule, inputs, pending marks, `SCHED.pending`, planning rows, NOTICES** — all in the scheduler store's `histSnap`
  (NOTICES since the one-rule job: `history.ts` line 64) → restored. **The Leave War's absence door** (`gate.apply`
  inside `runInputWrite`) writes the war through `persistNotify`'s nested-child branch, which enlists `lwStore` → restored,
  `LW_BASELINE` reset by `lwStore.restore`. **The week stash** — enlisted only by a clear; a door's save enlists none.
- **The change history (ELOG)** — `logEdit`/`logAction` are latched during a command (`editlog.ts push` → `DEFER`) and
  the latch is discarded on rollback; the held-line adoption at pipeline start finds nothing held (a drop, a tap and a
  calendar drag each begin a fresh turn, and nothing logs before the door runs). No phantom line.
- **The read-state** — never written by a save. **`LANDED`** — set during the try, reset to null in `redo`/`ask` before
  the real run. **`TRYING`** — reset in `finally`. **The armed place** — `tryInputsBatch` deliberately avoids
  `batchResult`, so `view.armDrop()` does not run; the place stays armed (ON5). **A deferred effect, a toast, a repaint,
  an Undo step, a notice told, a row id minted** — deferred effects dropped; `HOOKS.toast` silenced by `dryRun` and the
  door's own `quietly`; `HOOKS.renderInputs/reflow/histPush` are latched → dropped; `applyEnd` (which mints ids, runs
  `tellPass` and advances the baseline) is never reached because the throw comes before it; the row writer reads the
  envelope at finalize, never reached. **A pending mark or a sign-off on a published day** — the mark is in the snapshot,
  the sign-off is derived from the same comparison; ON8 pins it.
- **Asked, then refused / made although the try refused** — the try and the real run are the same closure over records
  found again by id, so they cannot disagree; the disagree branch still exists and is never silent (above).
- **Who holds a record across the try:** `commitChipMove` keeps the record's facts as plain values before the try and
  re-finds by id (`same`); `reassignInput` captures `from`/`was`; `rowPut`/`rowMove` keep row ids and re-find through
  `here()`/`ends()`; `drag.ts` holds keys only; `placeArmed` holds the key. The `Place` object `p` is used after only for
  words computed before the try. Sound.
- **Cost:** the gate (`oilGate` → `normalizeInputDraft`) runs on every drop onto an input's row; the try runs only where
  the gate says `'ask'` — a weekend or holiday with no answer. Only at the drop / the tap / the calendar's drop, never on
  a pointer move (`applyDrop` and the calendar's `pointerup` are the only callers).

### 2.3 Answered (brief 3)

- **Join:** `commitInput(…, { sched: true, oil })` → `r.oil = { …opts.oil }` after `putPerson`. **Replace / the
  Unavailable row's one-person branch:** `commitInputEdit(…, opts)` writes `opts.oil` AFTER `voidedOil`/`repricedOil`
  and the hand-over (A8). **The Unavailable row's one-of-several branch:** `x.oil = { …oil }` after `swapPerson`.
  **Move:** `leave(x, () => commitInput(y.inp, …, opts(o)))`. **The calendar's drag, one person:** `commitInputEdit(x, d,
  …, { oil })`; **several:** `commitInput(x, d, idsOf(x), { oil })` → `commitInputEdit` inside with the same opts. In every
  case the answer is the last thing written to `oil` in the batch. One command, one Undo (ON2, ON4, ON9, ON11 pinned).
- **A No is a 0 everywhere it is read:** `oilAskPlan`'s readers test `== null`; `afterPut`'s "not counted" tests `=== 0`;
  `oilOpenOn` tests `== null`; `OilConfirm`'s save writes 0 for every unticked plan day, so a multi-day answer covers
  every applicable day of the new span and the old span's entries, dropped by the wholesale write, were inert anyway.
- **The gesture's own ending:** `held()` hands `pre: () => WARN` and a `post` that disarms, marks the landing on where he
  stands THEN (`w.landed` from `placeOnRow` after the real run), and judges the "already busy" note against the warnings
  of that moment; `placeArmed` hands the arm put-down, the phone's drawer park and `flagDrop`; the calendar hands
  `markLand(landing)`. `answerOilWait` and `oilBarAgain` run `pre` before the write and `post` after it. Sound.
- **The seat he was dragged from:** `SeatTake.from` is kept as a row-id key; `seatNow()` demands he still sit there, else
  `'none'` → "That row has changed — not swapped". The man replaced takes the seat inside the same command; a seat that
  refuses him refuses the whole (`CmdRefused`).

### 2.4 Not answered (brief 4)

`OILWAIT`/`OILBAR` hold closures over row ids and the drag's `seat.take`; nothing else. Traced:
- row deleted, moved, re-ordered, another man on it, the input handed over meanwhile → `here()`/`ends()`/`same()` fail →
  `'none'` → the "has changed" words, nothing written (ON7; the break tests pin two of them);
- the input answered by someone else meanwhile → the gate says `'none'` → the change is simply made (`oilBarAgain`'s
  comment says so, and `gated`'s first line does it);
- the week changed → `VIEW_RESET` 'week'; the page changed → `setPage`; another person signed in → 'session'; all three
  pinned (ON7);
- an Undo of an unrelated change → the rows keep their ids → the question re-opens for the same row (S12 walked);
- a second waiting change while the bar is up → `holdForOil` clears the bar and replaces the wait: ONE bar, the later
  change only (recorded A12, to tell him);
- the Scheduler Board closed → `setPage` away from Edit Schedule clears both; the day stepped on the board (`setBoardDay`)
  → the bar OUTLIVES the day it names: rows are found by id in the loaded week, so "Answer OIL" re-opens the question for
  a row on another day than the one on screen and, answered, makes the swap there — correct, but the bar's words name no
  row (as drawn, D783 (2)). Not a finding; a walk scenario (§4);
- a version being looked at → the board's look at an issued version is read-only; no door runs.
- **Can "Answer OIL" write to the wrong row or person?** No: `rowPut`'s `again` re-runs the door with the same `pid` on
  the row found by its id, and demands the same input id and the same man on the dropped-on place; `rowMove` demands both
  ends unchanged; `oilFirst` demands `same(x)`.

### 2.5 A published day (brief 5)

ON8 pins: asked → 0 pending, four sign-offs stand; answered → one pending change (two lines for a swap from a seat — the
input's and the seat's — as D109/D113 already have it, §11.2 C1). The list's Save on a published day writes `oil` on
the input; the day was already pending from the holiday itself (D2, C5). A holiday declared on a published day: D2.

### 2.6 Every way a working day becomes a non-working day (brief 6) — read from the store's writers, not the plan

| Writer | Command end | Tells? |
|---|---|---|
| `holidayAdd` / `holidayChange` / `holidayRemove` (Holidays list) | `holidayRun` → `gesture` | once, at the gesture's end (the per-war `updateWar` persists inside join as `lw.sync` children, which do not tell) |
| the Event sheet's Save / Delete | `gesture('lw.event.save' / 'lw.event.remove')` | once |
| a word typed on the Event row (`setDayEvent`), a repeat (`setDayEventRange`), a band (`addEventBand`), an event moved | `updateCurrent` → `persistNotify` → `lw.edit` | once |
| an event TYPE added, changed, removed, reset (`commitEventDefs`, `removeEventType`, `resetEventTypes`) | `persistNotify` → `lw.edit`; `defsMoved` makes every day of every period compare | once |
| a new period (`createWar`) | `persistNotify`; `makeWar` builds blank days → weekends only → no run | nothing, rightly |
| a period deleted | its dates leave `after.wars` → never a run | nothing, rightly |
| a bid, a decision, an award, a clear | `{ …w, recs }` keeps the period's identity → skipped | nothing, rightly |
| the legacy Undo/Redo (`historyApply`) | `LW_RESTORING` → `persistNotify` returns raw | nothing, rightly |
| the one timeline's Undo/Redo | `lwStore.restore` sets state and baseline; no command body | nothing, rightly (ON14) |
| the boot, the demo world, `loadWars` | `LW_READY` false → raw; `loadWars` sets state with no persist and has no app caller | nothing, rightly |
| the reconciler's projections (`lw.sync`), a change from another device | `HIST.lock` / `cmdIsCommitting` branches | nothing, rightly |

**Exactly once:** inside `gesture` the nested persists take the "nested causal child" branch (`cmdCommitProjection`),
which does NOT call `tellHolidays`; only the gesture's end does, with `before` taken at its start. A gesture inside a
gesture runs `fn()` raw. `LW_BASELINE` is advanced by every `lw.edit`, every `lw.sync` child and the idle turn's trailing
projection, and reset by a refused command's rollback — I found no path that leaves it stale before a user's write.
**`newHolidayRuns`:** a date no period held before reads as a working day unless a weekend (so a holiday placed into a new
period tells); a period whose days array is replaced whole is compared day by day; a weekend is non-working both sides
→ never a run; an Off day (`free`) is NOT non-working in `isNonWorkingDay` → never a run (D21, ON13); a day already
non-working by another route (a band on another line, `ph`) → no run. Two periods → each compared against its own
before-image. Sound — with one shape it does not cover: **F1** below (a holiday's dates changed).

### 2.7 Who is told (brief 7)

`schedulerIds()` = every account that is admin, switched on and tied to a person; `noticeHoliday` drops a person who is
deleted, archived or special and de-duplicates two accounts on one person. The maker is included (D783 reading R3). A
member: never. An account suspended by a posting: `on` false → not told. `me()` null → `by` null, the line's "who" blank.
The notices are written by `commitInputs` INSIDE the war's command: `dispatch` sees phase `reducer` and joins the child
to the parent (one envelope, one Undo step, the parent's permission); `tellPass` in the child's `applyEnd` finds no input
changed and makes nothing; the notices are in the scheduler store's records, so the row writer saves them and the
parent's Undo deletes them (ON14 pinned); a refused holiday never reaches `tellHolidays`. The thirty-line cut is applied
after `noticeLive` (A6). The read-state is untouched by the telling.

### 2.8 The line and the bell (brief 8)

ONE body, `noticeLive`: a scheduler only (`mayEditSched`, so the admin's member view hides it — W1), a count above 0
(`holidayLeft`, remembered per run and dropped when the scheduler's version, the war's facts version or the inputs'
length moves — an answer written in place bumps the version through `notify`; a holiday removed moves the war's facts; a
week loaded notifies; an input re-dated notifies), and only the newest notice for an IDENTICAL run. Read by
`noticesFor`, `isUnread` (so by `unreadFor` and `bellOn`), `markAllNoticesRead` and `holidayLineOn`. So: no line at 0, no
bell lit with an empty list, no "Mark all read" reading a hidden line (W5). **A run whose dates were later changed:**
not covered — **F1**. A member's bell: untouched (`bellTap`'s branch is reached only where `holidayLineOn` finds a live
line, and a member has none). The scheduler whose own unanswered input the line covers: the tap falls to the list (ON16);
every other own question still takes the tap (D769). Both bells share `bellTap`.

### 2.9 The one list (brief 9)

`oilOpenOn` ↔ `oilSignDay` ↔ `oilPendingFor`: all three read `oilAsks(type)`, `acc !== 'r'`, `oilAskPlan`, `== null`,
and the locked-week skip per day; they differ only in WHO (the tag and the bell ask who may answer; the list is the
scheduler's) — they agree on an input of several, a multi-day input (its days in the run only), a cancelled or
information-only one (still listed — consistent with the tag), one taken off the programme (not listed), a kind that
never asks and a Personal input (D778: not listed), a locked week (skipped). A day with no period (D19) is a weekend or
nothing → consistent. **The Save:** one `saveBatchX`, only the run's unanswered days, `stampChanged`, the window's gate
and the write path's `canEditSched`; `-1` leaves the window open with the refusal's own words; an input deleted or
answered meanwhile is not in `todo` → skipped without error (S29 walked). `fresh` is not stored → a reload shows the bell
line, not the list. Sign-out closes it (`POPS_RESET`); a page change keeps it (a non-blocking window, D641); a week change
keeps it (dates, not rows). A tap on a card opens the input's window over it (R8).

### 2.10 What could have broken elsewhere (brief 10)

`InputCard`'s `action` draws only where passed; `OilConfirm`'s labels default to Cancel / Save so the input's window is
unchanged (`oilconfirm.test.tsx` runs it); `RowAnswer` widened — every switch on it enumerates by name (no `=== 'done'`
that treats `'asked'` as written); `reassignInput`'s boolean is ignored by both callers as before; the nine re-expressed
tests read "made, then asked" → "asked, then made" and nothing else.

---

## 3. Findings

### F1 — LOW, NEW: a holiday whose dates are CHANGED gets a second line, or keeps a stale one

**Failure a person meets.** Holidays list: "Training day" on Thu 16 Jul (two inputs on it) → the bell: one line "Training
day · Thu 16 Jul · 2 inputs need an OIL answer". Now change it to Thu 16 – Fri 17 Jul (one input on the Friday). The bell
shows TWO lines for the one holiday: the Thursday's and a new "Training day · Fri 17 Jul · 1 input…". D783 (6): "one bell
line a holiday". The other way round (Thu–Fri shortened to Thu): the one line keeps the heading "Thu 16 – Fri 17 Jul"
and the list it opens is titled the same, though Friday is a working day again (the list's rows are right — read live).
A rename keeps the old name on the line (cosmetic; the newest run's name is read at the telling only).
**Cause.** `leavewar/state/store.ts newHolidayRuns` reports only the dates that BECAME non-working (Fri alone), and
`leavewar/sync.ts tellHoliday` writes a notice for exactly that run; `state/notices.ts noticeLive` supersedes an older
line only for an IDENTICAL run (`o.a === h.a && o.b === h.b`). Silent: nothing is wrong on a record; the bell says one
thing twice. Older rulings are not touched.
**Fix.** (1) In `tellHoliday`, before writing, widen each run to the holiday as the war holds it now: step `from` back and
`to` forward while `isNonWorkingISO(d)` and `!isWeekend(d)` (the war's `isWeekend` is in `leavewar/engine`), so the run is
the holiday's whole extent, never the weekend beside it; take its name from the widened `from`. (2) In `noticeLive`,
supersede an older holiday notice of the same person whose run OVERLAPS or touches the newer one's (`o.a <= h.b+1 && h.a
<= o.b+1`, dates as ISO strings with `addDays`), not only an identical run. (3) Pin in `leavewar/holnotice.test.tsx`: add
Thu; change to Thu–Fri → `noticesFor(admin)` has ONE holiday line, its `noticeWords().day` "Thu 16 – Fri 17 Jul", its
count 3; shorten back to Thu → one line, "Thu 16 Jul". Note the widened run makes the fresh list open for the whole
holiday, which is also what D782 asks ("every input of that day").

### F2 — LOW, NEW: the Unavailable row's armed TAP drops the arm before the question is put

**Failure a person meets.** On a phone, tap an overseas duty's puck under Unavailable on a Saturday (it arms), tap Hex in
the drawer: the question opens; Escape or "Don't swap" → the bar, both pucks flash — but the ring on the row is gone,
whereas the same gesture on an input's row keeps the place armed (ON5, the plan's A3: "the armed tap stays armed").
D754: the same everywhere. Not silent (the bar says it). Nothing written.
**Cause.** `ui/interactions.ts` ~976: `view.disarmSlot()` is called BEFORE `reassignInput(iid, …)`; the result is not
read, and no `pre`/`post` is handed to the wait (so on the answer nothing disarms either — nothing is armed by then).
**Fix.** In that branch: `const before = view.OILWAIT; const made = reassignInput(iid, rp.dataset.person); if (made ||
view.OILWAIT === before) view.disarmSlot(); else oilWaitThen(() => null, () => { if (view.armedKey() === armKey)
view.disarmSlot() })` (import `oilWaitThen` from `./oilwait`). Pin in `ui/oilwait.test.tsx` beside "the armed tap and
the store's own writer reach the same wait": arm `iu:<iid>`, plant a man → `OILWAIT` set and `armedKey()` still
`iu:<iid>`; answer → disarmed. The drag's reassign branch in `drag.ts` (line 235) has the same shape but a drag has no
arm to keep; leave it.

### F3 — LOW, NEW: on the Unavailable row, a second "Don't swap" after "Answer OIL" flashes one puck, not both

**Failure a person meets.** Drag Ranger from a flying seat onto Hex's overseas duty under Unavailable (Saturday); "Don't
swap" → both pucks flash (W3, fixed); "Answer OIL" → the question again; "Don't swap" again → only the row's man
flashes; Ranger's seat does not. D783 (2): "both pucks flash".
**Cause.** The seat is added to the wait by `drag.ts` (`oilWaitAlso(DRAG.key)`) at the drop; `ui/oilwait.ts oilBarAgain`
rebuilds the wait through the door (`reassignInput` alone knows no seat) and carries over `pre`/`post` but not the extra
`places`. The row's door (`rowPut`) recomputes its places including the seat, so only the Unavailable row is affected.
**Fix.** In `oilBarAgain`, after `if (a === 'asked')`: `for (const pl of w.places) if (OILWAIT && !OILWAIT.places.includes(pl))
OILWAIT.places.push(pl)` (row-id keys; a stale one resolves to nothing in `flash`). Pin beside "the Unavailable row, dragged
onto from a seat…" in `ui/oilwait.test.tsx`: leave, Answer OIL, leave again → both places lit.

---

## 4. Scenarios a walk of the running app should still drive

1. **F1 on screen:** a weekday holiday lengthened by a day; shortened; renamed — count the bell's lines and read their dates.
2. **A callsign TYPED into the name box of an input's row on a Saturday** (the board's box, and the week's): the question
   first; "Don't swap" → the box shows the old man, no history line, no pending mark; answered → the swap. (The typed
   box's door is proved only through `writeSlot` in a unit test; no walk share drove the box itself.)
3. **The Unavailable row's armed tap on a phone** (share B, not in yet) — and F2's ring.
4. **F3:** Answer OIL, then Don't swap again, on the Unavailable row from a seat — both pucks.
5. **The bar across a board day step:** cancel a swap on Saturday, step the board to Friday, "Answer OIL" → the question
   for Saturday's row opens; answered, the swap is on Saturday; step back and see it. Nothing wrong expected — record it.
6. **An event type re-tagged back** (holiday → plain kind): every scheduler's line goes; re-tagged again: one line.
7. **The Leave War's event moved by drag on the grid** onto a working day (if the grid offers it): the list opens / the
   line appears; moved off: the line goes.
8. **A second scheduler answers one input in its own window while the first has the list open**, then the first presses
   "Yes to all" → only what is still open is written; the count on both bells falls.
9. **Share B's short screens** (390×568, 844×390) for the sheet's Swap button and the bar.

---

## 5. Explicit negatives — traced and found sound

No door writes first and asks after; no caller treats `'asked'` as written; the dry run leaves no record, mark, history
line, notice, read-state, Undo step, row id, deferred effect, toast or repaint behind, and cannot disagree with the real
run; the answer is written last in every one of the six write shapes; a No is 0 wherever read; the gesture's ending runs
on the answer with the warnings of that moment; the wait and the bar end with the week, the page and the sign-in and find
rows by id; a published day shows nothing pending until the answer; every holiday-making writer reaches `tellHolidays`
exactly once and no restore, load, projection or refused command does; weekends and Off days never tell; the notices are
a child of the holiday's command (Undo/Redo pinned), de-duplicated per person, never to a member, a suspended account, an
archived or deleted man; the count is read live through one body shared by the list, the unread count, the bell's light,
"Mark all read" and the bell's tap; the admin's member view hides the line; the three "unanswered" readers agree; the
list's Save is one command, scheduler-only at the write path, tolerant of an input gone or answered meanwhile; the
input's own window, the right-click, a typed time or remark, a load, a template and Undo/Redo are unchanged.

Tokens used for this read: roughly 150k.
