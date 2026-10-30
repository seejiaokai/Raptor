# The narrow read of the second fix round, fdc66f528 → 77cb09bc5 (30 Oct 26)

A fresh Opus reader (D790) of the round only (the fix d30c6a369 and its pins 77cb09bc5), handed the findings it answers
(`read-fix1.md` beside this file). Its report as it arrived, saved by the night's coordinator before anything was done about
it. Its scratch tests: the coordinator's scratch folder `read4/` (`r4.test.ts`, `r4b.test.ts`, `r4c.test.ts`,
`vitest.read4.config.mts`, `log.txt`), outside the repo. The round's own `deletednorow.test.ts`: 35 of 35.

**Verdict:** both fixes do what their findings asked. Two problems beside them, both LOW and both over-refusals — an Undo or
Redo refused where the same action done live is allowed; one new in this round, the other older in the job (the part of
finding 2 the round left). Nothing lets leave back that the live door refuses.

## Finding A — LOW, new in this round: the Redo of a war move of his approved leave across the posting's date is refused for good

- **Setup:** today 15 Jul; Ranger (`bane`) has approved LL on 10 Jul; the admin moves it +3 days to 13 Jul (`moveCells`),
  then Undoes the move; `postOut('bane','2026-07-12','delete')`, `runPoOutcomes()` — run late: deleted from 15 Jul, his days
  from 12 Jul refused.
- **Action:** Redo.
- **Expected:** the leave moves back to 13 Jul — the same move done live after the posting goes through ("moved", leave on
  13 Jul); the Undo twin goes through too (r4c: approved 13 Jul, moved to 10 Jul, the posting run late, Undo puts it on 13 Jul).
- **What happens:** "Ranger has been deleted — that change can't be undone"; `canRedo` false — passed over for good.
- **Old or new:** on fdc66f528 this man was skipped by the loop and 13 Jul is before his cutoff of 15 Jul, so the Redo passed;
  on `main` no check at all — new in d30c6a369.
- **Cause:** in `deletedRestoreProblem`, `lwDays` now counts only days `>= from`; a move nets 0 days in all, but one that
  crosses `from` now counts as adding days (the comment still says a move "adds none and passes").
- **Exact fix:** in the `dir === 'redo' && module === 'lw'` branch refuse only when the step adds days overall AND adds days
  from `from`:
  ```ts
  const all = (row: any): number => (row && row.lw && inInput(row, id) ? inputDates(row).length : 0)
  let grew = 0, added = 0
  for (const ch of changes || []) if (ch && ch.collection === 'inputs') {
    const a = ch.op === 'delete' ? null : ch.after
    grew += all(a) - all(ch.before); added += lwDays(a) - lwDays(ch.before)
  }
  if (grew > 0 && added > 0) return `${(PEOPLE as any)[id].cs} has been deleted — that change can't be undone`
  continue
  ```
  Every existing pin holds: the approvals on 12 and 13 Jul and the place-and-approve each grew 1 and added 1 (refused); his
  11 Jul joined beside 12 Jul grew 1, added 0 (passes); for a man refused whole `from` is `''`, identical to fdc66f528. Pin:
  the Redo of a 10 → 13 Jul move after a late posting goes through.

## Finding B — LOW, older in the job (14403cf57 / fdc66f528, not on `main`): the Redo of an Inputs-page lengthening over his own pending bid is still refused

- **Setup:** Ranger has approved LL on 10 Jul and a pending LL bid on 11 Jul; the admin lengthens the leave to 10–11 Jul on
  the Inputs page (`writeInputs`) — the inputs door swaps his bid for a notice; Undo; the admin deletes Ranger on Admin → Users.
- **Action:** Redo.
- **Expected:** it goes through — the same edit live after his delete returns true and the leave reads 10–11 Jul (D321 (10)).
- **What happens:** "Ranger has been deleted — that change can't be undone", passed over for good.
- **Cause:** a non-war step's Redo now falls to the request test; the inputs door's swap takes a request off `lw.cell` 11 Jul
  and writes a row carrying `lw` that holds him, so `takesBid` and `writesLeave` are both true; finding 2's fix covers only a
  lengthening with no bid underneath.
- **Exact fix:** in `deletedRestoreProblem`, `continue` after the war count for any Redo —
  `if (dir === 'redo') { if (module === 'lw') { /* the count */ } continue }` — only war steps approve (the writer survey
  below), and every non-war step that takes a request and writes war-marked leave is the inputs door's swap, allowed live;
  keep the request test for Undo. Pin: the scenario above.

## Explicit negatives — checked, nothing found

- **`postingOutWhy`'s rewrite** behaves exactly as before: `date < addDays(w.to,1)` equals `date <= w.to` for ISO dates;
  the SANS and missing-record exits the same; the words the same (`dayMon(addDays(w.to,1))`, past or future by
  `postedOutBy`); it matches fdc66f528 and `origin/main`; `postingOutFrom` reads the record `refusedWhole` reads, so the live
  door and the restore agree on the first refused day.
- **`refusedFrom` for each kind of man:** deleted on Admin → Users with no posting `''`; a Delete posting set but not run,
  then deleted on Admin → Users `''`, and it stays so (`poDueNow` skips deleted men, so that posting never runs later and the
  refusal never narrows); a Delete posting run on time — `from` the posting date, also the cutoff; run late — `from` the
  posting date, earlier than the cutoff, the gap days refused; an Overseas (archived) or SANS posting then deleted `''`,
  matching the live door; posted out, not deleted `null` (`[LW-POSTED-OUT-RESTORE]`); a reused callsign — a new person gets a
  fresh id (`newId('p')`), nothing crosses, only the words share the callsign.
- **Twin paths on the gap day after a late posting:** refused — the Redo of an approval, of a place-and-approve, of a
  drag-window approve (`setBidStates`, scratch); the Undo of a send-back and of Approve → Refuse — the dead rule refuses the
  step (r4b: `deletedRestoreProblem` refuses its inverse), the press then showing the older approval's "A later change touches
  the same thing and can't be undone", no leave written; a several-men step refused whole, by design. Pass, as they should: a
  remarks edit, a non-crossing move, an Undo of a delete (his past), his 11 Jul joined beside 12 Jul both ways, his 10 Jul
  both ways.
- **Limiting the count to `module === 'lw'` lets nothing slip:** the only writer that creates a war-marked input is
  `doorApprove` (`sync.ts inputRowFor({…lw})`); move, decide-approved and remove act only on existing war-marked rows; every
  caller reaches them through a store gesture scoped `{module:'lw'}` — `decideRequests` (Approvals, Approve all, the bid
  window), `setBidStates` (the drag and bid windows), `placeApproved` (the bid and drag windows), `decideRequestById` (the
  day's list); no screen wraps them in another module's command; the posting pass (`lw.postoutRun`, module people) and
  `person.delete` only shorten or remove leave; `fileStraight` writes no war mark and its codes (CSE / OD / OTH / ATCH) are not
  leave.
- **The new `entry` argument reaches both asks with the right step:** `deadFor(e)`, `restoreCommit(entry)` and
  `undoConflictOf`'s `deadFor(o)`; the scope is `env.scope` as recorded (scratch logs: `lw` for `lw.decide` and `lw.move`,
  `people` for `lw.postout`).
- **The "passed over for good" cache (`deadFor`) cannot go stale:** it keeps only refusals, and all a refusal depends on is
  fixed once the man is deleted — the set of deleted men only grows; `from` is fixed (the posting pass skips deleted men, a
  posting is no Undo step (D321 (8)), the posting step's own Undo is dead); the step's module and images do not change.
  Findings A and B are wrong from the first ask, not through the cache.
