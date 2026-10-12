# [OIL-ASK-NOTIFY] — the short plan (12 Oct 26)

**Rulings:** D780, D781, D782, D783 (the pictures are the design of record), D784 (Fable reads this plan and the
finished code). Also in force: D762 (one OIL answer an input), D755 (a row that came from an input IS the input), D769
(the bell's list and what a tap goes straight to), D103 (a pending change wipes the sign-offs), D56 (stored demo data is
no finding), D754 (the same everywhere). Pictures: `docs/mock/2026-10-12-oil-notify/`, page `docs/mock/oil-notify.html`,
drawn by `scripts/handpass/oilnotify-mock.mjs`. Backlog: `OUTSTANDING.md` `[OIL-ASK-NOTIFY]`. Branch
`claude/oil-ask-notify`, cut from `main` after pull request #491. Tier FULL (OIL, a published day, a saved record,
roles).

## 1. What he ruled, in one paragraph

A swap, an add or a move on an input's row that raises the OIL question is NOT MADE until the question is answered —
nothing moves. Not answered: both pucks flash and a bar stays until tapped ("Not swapped — OIL not answered" · Answer
OIL · OK). When a day is made a public holiday after inputs already stand on it, ONE list opens by itself for the admin
who made it — every input of that day that needs an answer, Yes / No each, "Yes to all" / "No to all", Later / Save —
and what is left goes to the schedulers' bells as ONE line a holiday, counting what is left, a tap opening the list.
What he answers there tells nobody.

## 2. As built today (read 12 Oct 26, on this branch)

- **The row's door** `src/ui/reqdoor.ts`: `rowPut` → `join` / `replace`, `rowMove`; each COMMITS first, then calls
  `askOilIfPending(inp, true)` (`src/ui/inputedit.tsx`), which opens the input's window with the OIL sheet over it. Cancel
  leaves the change made and the question open. Callers: the drag (`ui/drag.ts`, five call sites), the armed tap
  (`state/view.ts placeArmed` through `HOOKS.inputRow.write`), the store's writers (`state/store.ts`), the right-click
  remove (`ui/Shell.tsx` — a leave, never asks).
- **Two more doors do the same** — commit, then ask, Cancel leaves it open: the Unavailable row's person drag
  (`inputedit.tsx reassignInput`, both its branches) and the Inputs calendar's date drag (`ui/caldrag.ts`). The same
  file already has the pattern this plan copies: a MEDICAL move "waits on the sheet and nothing is written until it is
  answered" (`setMedMove` → `ui/MedMoveConfirm.tsx`, mounted in `ui/App.tsx`).
- **The question** is one pure gate, `oilGate(draft, prevRow)` → `'none' | 'refused' | 'ask' {who, typeLabel, plan,
  prev}`, drawn by `ui/OilConfirm.tsx`. An answer rides a save as `opts.oil` (`commitInput`, `InputSaveOpts`).
- **A holiday** is the Leave War's record: `leavewar/state/store.ts holidayAdd / holidayChange / holidayRemove` (the
  Calendar window's Holidays list, `ui/HolidaysPanel.tsx`) and the Event row's writers (`setDayEvent`,
  `setDayEventRange`, the event sheet's `lw.event.save`); an event TYPE re-tagged as a holiday does it too. Each is a
  Leave War command (`gesture`). `isNonWorkingDay` (`leavewar/engine/eventdefs.ts`) is the one test; `oilAskPlan`
  (`leavewar/sync.ts`) the one plan. Nothing tells a scheduler.
- **The bell** `ui/topbits.tsx`: a tap goes to an access request, a bug report, the tapper's OWN unanswered input
  (`oilPendingFor`), else opens the list of NOTICES (`state/notices.ts` — one saved record a person told, made inside
  the command by `state/sched-commit.ts tellPass`, never rewritten, read-state in `state/noticeseen.ts`).

## 3. The design

### 3.1 The question first, the write only on an answer (D783 (1)–(4))

One new piece of state, **the waiting change** (`OILWAIT`, in `state/view.ts` beside `SECDEFOFFER`, re-exported by
`ui/pops.ts`; cleared on a week, page or session change — it names places by day): `{ kind: 'swap' | 'add' | 'move',
lead, gate, places: [row-id keys], redo: (oil) => RowAnswer, again: () => void }`.

- **`reqdoor.ts`**: `join`, `replace` and `rowMove` ask the gate BEFORE they write — for a replacement
  `oilGate({ ...draftOf(inp), person: pid }, inp)` (a new holder has not answered), for a join or a move
  `oilGate(draftOf(inp), inp)` on the input he is going INTO. Every other refusal is checked first, as today, so the
  question is never put for a change that would be refused anyway (the save's own refusals are tried by a dry
  `normalizeInputDraft`; the swap's seat by the drag's own preflight, handed in). `'ask'` → the door sets `OILWAIT`,
  writes NOTHING, and answers a new fourth value **`'asked'`**. Every caller treats `'asked'` as "nothing moved, say
  nothing": the drag ends with no flash and no note; the armed tap stays armed; the store's writers return.
- **The sheet** `ui/OilWaitSheet.tsx` (mounted in `App.tsx`): `OilConfirm` with three new optional props — a lead line in
  bold ("Swapping Tally and Ranger" / "Adding Tally to Range brief" / "Moving Tally to Range brief"), the cancel
  button's words ("Don’t swap" / "Don’t add" / "Don’t move") and the save button's ("Swap" / "Add" / "Move"). No window
  of the input opens behind it (as drawn).
- **Answered** → `redo(oil)`: the SAME door function runs again with the answer and writes the change AND the answer in
  ONE command (`commitInput(…, { sched: true, oil })`; the replacement's `commitInputEdit` gains the same `opts.oil`
  write inside its batch). One Undo takes back both. It re-checks everything; if the row has changed underneath, it
  refuses in words and nothing is written.
- **Not answered** (the cancel button, ✕, Escape, a press outside) → nothing is written; both places flash with the
  app's own landing flash (`ui/lift.ts landOn`); **the bar** (`OILBAR`, same home and resets as `OILWAIT`; drawn by
  `ui/OilWaitSheet.tsx` (`OilBar`) in the "Set as default" bar's own look, `secdef-snack`) stays: "Not swapped — OIL not answered" /
  "Not added — …" / "Not moved — …" · **Answer OIL** (runs `again()`: the door is asked afresh, so a row that has since
  changed says so instead of opening a stale question) · **OK** (closes it). Nobody else is told.
- **The same rule at the two sibling doors** (the agent's reading of D780's "holds at every door" and D754 — to tell
  him): `reassignInput` (a man dragged onto another's Unavailable row — "Not swapped") and the Inputs calendar's date
  drag (`caldrag.ts` — "Not moved"; a member dragging his own input onto a weekend is then asked first, as the input's
  own window already does). After this, the only way an input's question opens with nobody asked is a day made a
  holiday afterwards. `askOilIfPending` keeps its last caller, `setInpField`'s non-scheduler branch (not reachable from
  a screen).
- **Not changed:** a person taken OFF a row; a swap between two seats that are not an input's row; an input whose
  answer is No (the add is made, the note says "not counted for OIL"); the window's own save.

### 3.2 The one list (D782, D783 (5))

`ui/OilDayList.tsx`, a movable window that does not block the page (`ui/FloatWindow.tsx`, D641), opened by a flag
`OILLIST = { from, to, name, fresh }` in `ui/pops.ts` (in `POPS_RESET`). Title "OIL — Fri 17 Jul" (a run: "Fri 17 – Sat
18 Jul"), under it "Public holiday · National Day"; when `fresh`, the line "National Day is now a public holiday."

- **What it lists** is worked out live, never stored: every input with `oilAsks(type)`, on the programme (`acc !== 'r'`),
  not on a protected week, whose plan has a day in the run with no answer. One line an input, on the input's own card
  (`ui/InputCard.tsx`, no "OIL?" tag inside); "Yes · FO" / "Yes · HO" (the plan's own amount) and "No" (a chosen No in
  quiet grey); the count's line "4 to answer" / "3 of 4 answered" with "Yes to all" / "No to all"; the foot "What is
  left goes to the schedulers’ bells" (gone when all are picked), "Later", "Save" (greyed until something is picked).
- **Save** writes the picked answers in ONE command (`saveBatchX`): for each input, each of its unanswered days IN THE
  RUN gets the amount or 0 — its other days' answers are not touched — stamped as the window's answer-only save stamps
  it (`stampChanged`). One Undo. Then the window closes. **Later**, ✕ and Escape write nothing.
- Admins only (`canEditSched`); a member's way stays his own bell and his input's window.

### 3.3 The holiday's notice and the bell (D780, D781, D783 (5), (6))

- **Worked out from the calendar before and after, never raised by a door.** At the one end every Leave War command
  passes (`gesture`), when a period's days or bands or the event types changed: the dates that were working days before
  and are non-working now, by the one test. Grouped into runs; for each run with at least one input that needs an answer
  (3.2's test) the store calls ONE installed hook (set by `sync.ts`, as the absence door is). So the Holidays list, the
  Event row, a band and a re-tagged event type all tell, and a door added later cannot be silent. A restore (Undo, Redo),
  a load and a change from another device make none.
- **The hook** (in `sync.ts`), still inside the holiday's command: (a) writes ONE notice a scheduler — every account
  that is an admin, switched on and tied to a person, the one who made the holiday INCLUDED (his "Later" needs a way
  back; reading, to tell him) — through the scheduler store's own input command (a child of the holiday's command, so
  the holiday's Undo takes the notices back and its Redo returns them); (b) when the command is a person's own act,
  sets `OILLIST` with `fresh` — the list opens by itself, from either door.
- **The notice** is the existing record with one new part: `{ id, to, by, at, iid: '', name: <the holiday's name>, day:
  <its first day>, what: [{ k: 'oilhol', a: from, b: to }] }`. It stores no count. **The count is read live** when the
  bell draws ("4 inputs need an OIL answer · Saber"); a line whose count is 0 is not listed and is not unread — so
  answering in the list tells nobody (D781), a holiday taken away again leaves no line, and nothing stale is ever shown.
  `noticesFor` / `unreadFor` / "Mark all read" skip such a line through one resolver installed by `sync.ts` (state/ may
  not import the Leave War — the `inputgate-hook` way).
- **The bell's tap** (`bellTap`): unchanged for a member. For a scheduler, an own unanswered input that a live holiday
  line already covers no longer sends the tap straight to that one input's question — the list of notices opens, and its
  line opens the ONE list (D782; D769's "straight to an OIL question" still holds for every other question of his own).
  A tap on the line: `OILLIST` without `fresh`, the bell's list closes, the line is read.
- **Saved data:** no new record kind (`notices/<id>` as built; `docs/data-schema.md`, `docs/data-model.md` §Notice gain
  the new part). Older stored notices read as before.

## 4. The build, a failing test first each step

1. **The door waits** — `ui/reqdoor.test.tsx` and a new `ui/oilwait.test.tsx`: on a Saturday, a swap, a crew-list
   replacement, a join onto an unanswered input and a move each answer `'asked'` and change NOTHING (the inputs, the
   day, the Undo stack, the notices, a published day's count and sign-offs); answered Yes / No → the change and the
   answer in one Undo step; not answered → nothing, `OILBAR` set; "Answer OIL" after the row changed → refused in
   words. On a weekday, and onto an input answered No, exactly as today (pinned first, the order's §8.7).
   Then `reassignInput` and `caldrag` the same way.
2. **The sheet, the bar, the flash** — component tests for `OilWait` / `OilBar` (words per kind, Escape, the resets on
   week / page / sign-out); a browser test: the real drag on the board and the week, phone and desktop, the bar inside
   the screen and over the board (layering — `elementFromPoint`).
3. **The one list** — its lister (unit, both stores live), `OilDayList` (picks, Yes to all / No to all, the count,
   Save = one command and one Undo, Later writes nothing, a run of two days, an input of several, a multi-day input
   whose other days keep their answers), admin only.
4. **The notice and the bell** — `leavewar/holnotice.test.ts`: each door (Holidays add, change onto new dates, the Event
   row, a band, a re-tagged type) tells every scheduler once; a holiday with nothing to answer tells nobody and opens
   nothing; Undo takes the notices, Redo returns them; the count falls as answers are saved and the line goes at 0; a
   member gets no line; the bell's tap order.
5. **The records** — `docs/ui-contracts.md`, `docs/feature-impact.md`, `docs/data-schema.md`, `docs/data-model.md`,
   `docs/file-map.md`, the behaviour register lines and `npm run rulecheck`.
6. **The check** (`docs/bug-check-order.md`, FULL): roll-call and door check → the sizing lines → the walk (3 Sonnet
   walkers, about 30 scenarios) → fixes → Fable's read of the finished code with the evidence sheet, a blind Opus read
   beside it → fixes → re-walk → the gates → the sheet → his look.

## 5. What could go wrong (asked of the reader)

- The dry check and the real save disagreeing (a question asked, then the save refused) — or the reverse.
- `'asked'` reaching a caller that treats anything but `'none'` as "written".
- The Leave War command carrying scheduler-store records (the notices): Undo, Redo, a refused holiday, the row writer.
- A count read live on every bell draw: the cost with many notices.
- The bar or the waiting change outliving the day it names.
- A published day: nothing may read pending, and no sign-off may fall, until the answer is given.

## 5a. Fable's read of this plan (12 Oct 26, one round — D784) and what it changed

Ten findings, each checked against the code by the builder before it was taken; all ten taken. Where a line above
differs, THIS section is the plan.

- **A1 (blocked the build) — `gesture` is not the one end.** A word typed on the Event row, a band, an event TYPE's
  kind changed and a new period go through `persistNotify`'s own `lw.edit` command, never `gesture`. So the hook is ONE
  function, `holidayTell(before, after)` (in `sync.ts`, installed on the store), called from BOTH command bodies —
  inside `gesture` after its body, and inside `persistNotify`'s `lw.edit` — with the state as last committed and the
  state now. It compares every date of every period by `isNonWorkingDay` with each state's OWN event types and bands
  (never `isNonWorkingISO`, which reads the live state). Only working → non-working dates make a run.
- **A2 (blocked the build) — the dry check is the REAL save, rolled back.** A dry `normalizeInputDraft` cannot see the
  refusals made inside the save (a second placeholder, ALL AVAIL on an input longer than a day, leave over recorded
  work, a protected week). So the door runs its own body once inside a command that is then thrown away
  (`inputedit.tsx dryRun`): refused → the refusal's own words, no question; passed → the gate is asked; `'ask'` →
  wait; `'none'` → the same body for real. Asked and refused can then never disagree.
- **A3 — every caller of the door gets the fourth answer by name:** the drag's five sites end with nothing moved;
  the armed tap returns false and stays armed; the store's writers already stop. `RowAnswer` is widened so a later
  door cannot miss it.
- **A4 — the answered path keeps the gesture's own ending.** The waiting change carries the CALLER's continuation (the
  landing flash, the "already busy" note, the arm put down and the phone's drawer parked), reading the warnings afresh
  when it runs.
- **A5 — the bar names rows by their ids, not their places.** At "Answer OIL" the row, the seat and the men on each
  are found again; anything gone or different → "That row has changed — not swapped", and the bar closes. The reset on
  a page change is in `setPage`, as the ALL AVAIL window's is.
- **A6 — the bell line's own tap and words:** it opens the one list (never "That input is gone"), reads "1 input needs
  an OIL answer" / "4 inputs need…", and the rule "a line at 0 is not listed and not unread" sits in ONE place the list,
  the unread count and the bell share (applied before the thirty-line cut).
- **A7 — one line a holiday, even made twice:** a holiday taken away and made again leaves two notices; the reader
  shows the newest for a run of dates.
- **A8 — where the swap's answer is written:** in `commitInputEdit`, AFTER the hand-over voids the old holder's answer.
- **A9 — the count is remembered** between changes (both stores' versions), not worked out on every bell draw.
- **A10 — a medical never asks the OIL question,** so the medical wait and this one never meet on one gesture; the
  order stays the medical's question, then the dry run, then the OIL gate.

Its 35 scenarios for the walk are the walk's list (the evidence sheet carries them); its negatives are in the sheet.

## 6. Readings to tell him at the build's end

R1 the same rule at the Unavailable row's drag and the Inputs calendar's date drag ("Not swapped" / "Not moved"). R2 a
man from the crew list put on the only man's puck uses the swap's words. R3 the admin who made the holiday gets the bell
line too, while anything is left. R4 the list's Yes answers that input's unanswered days in the holiday only. R5 the
bell's line does not show a number that is 0 — it goes. R6 (D783's own) the list opens from the Leave War's Event row
too; "Later" sends everything to the bells; the bar's OK only closes it; a move waits the same way.
