# Brief — SECOND, SHORT read of the plan for "the schedule's one row for a shared input": the changed parts only

**You read version 1 and found it NOT CLEAN.** Version 2 is at
`raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md`; its §8 lists every finding of both readers
and what was done. This is a confirmation round, not a new review: **read-only, change no file, blind** — you may open
YOUR OWN first report (`raptor-port/docs/superpowers/briefs/2026-10-10-reads/group-input-plan-astra.md` if you are Astra,
`…/group-input-plan-sol.md` if you are Sol) and nothing else in that folder. The first brief
(`raptor-port/docs/superpowers/briefs/2026-10-10-group-input-one-row-plan-read.md`) still says what to read to judge it,
what is NOT a finding (D56, D489) and which choices are the owner's.

End with `VERDICT: CLEAN`, `VERDICT: CLEAN WITH THESE EXACT CHANGES` (each precise enough to apply without asking you) or
`VERDICT: NOT CLEAN`.

## What to do
1. **For each of YOUR findings: closed, or not** — one line each; where not, the concrete failure that remains and its
   exact fix. Two were answered rather than taken — say whether the answer holds:
   - **The last man** (§4.5, R5): kept as a refusal, on the ground that D734 itself measures the row by the input's own
     window ("the same as doing it in the input's own window"), which will not save an input with nobody in it.
   - **"What this day earns" beside a CX or a take-off** (§4.8): left as its own item, because that is what a one-man
     request's row counts today, and the rule is "the one row counts what a one-man row counts, never that times its
     people".
2. **What version 2 newly decides — attack each, in the code:**
   - **`entryIdOf` / `srcg` as the entry's identity (§4.1).** A hash of `sharedKey` on the row: is it the same test as
     `state/inputgroup.ts entriesOf` in every case (a medical kind, an upchit, a blank against a missing field, the SANS
     ticks)? Does re-making a grouped row whenever any shared field moves — a date the row does not show — raise a mark, a
     pending unit or a history line it should not, on a published day or an unpublished one (`state/holderbase.ts
     rederive`, `requestAddMarks`, `engine/drafts.ts rebaseDayPending`)?
   - **`placeRequestRow` (§4.2)** used by both `landRequests` and `slots.ts acceptInput`: does a mid-list insert in
     `acceptInput` (which marks a structural add, shifts keys and logs) break its own bookkeeping, the `mov:…ground`
     unit, `groundOrderMovedOnlyBy`, or `gman`?
   - **A grouped row's name box is its own man's (§4.2):** moving a kept occupant from `who` to `more` inside the view —
     does anything read differently for him (the events, D470's OIL through `landedExtras`, his switch
     `<person>|i:<iid>`, `requestAddMarks`, a published day's pending units)? Is it stable from the holder base across
     reloads and an Undo?
   - **The placeholder is not handed on (§4.5, R10).** Is leaving it to go with its member free of the silent failure
     you found? What does the scheduler see and what is counted, on a published Saturday and an unpublished day? Is the
     "said once" reachable for both doors (the schedule's, and a removal in the input's own window through
     `rederive({ live })`)?
   - **`oilAll` (§4.5).** Every writer that must keep it true: a new group filing, `commitGroup`'s three OIL paths, a
     single input made a group, a man added in the window, the calendar's drag, a record that leaves its group or is
     handed to another man, `voidedOil` in the window, `repricedOil` on the schedule, Undo / Redo. Any reader that would
     misread a record carrying it (`inpDetailKey`, `sharedKey`, `frozenInputMatch`, the Leave War, the bell's
     `oilPendingFor`, `oilSummaryOf`)? Is the check in `state/perms.ts` (what a member's command changed) written so a
     filer can set it and a man answering for himself cannot?
   - **`repricedOil` and no sheet (§4.7).** With D739 (4) and D740 (4) followed for every typed box: what happens to a
     Yes when the new hours price nothing, when the request becomes all day, when it crosses midnight; does the per-day
     map stay well-formed for `ownershipViolation`'s test 3; does anything still open the sheet for a schedule-side
     change (`askOilIfPending`'s other callers)? Is narrowing the 28 Aug 26 rule to the input's own window stated
     anywhere the plan's step 7 does not list?
   - **The belts (§4.4, §4.5)** in `txtSet`, `setSlotVal`, `fillSlot`: name every legitimate caller they would now
     refuse — the view's own writes, `acceptInput` / `unacceptInput`, `state/person-delete.ts` and
     `overlay.ts stripPersonFromDay`, a load of an older version, a plan switched in, a day template applied, Undo /
     Redo's restore, the drop's swap code, `renameCallsign` — and say for each whether it goes through those three
     functions at all.
   - **The outward move as ONE command (§4.5):** `writeInputsBatch(() => { the record dropped; the place written })`.
     Trace it through `state/store.ts runInputWrite`, `state/sched-commit.ts commitInputsWith` (its
     `resyncSchedBaseline`), the after-command pass and `daysNamed`: one envelope, one Undo step, a refusal rolling back
     both? Does `applyDrop`'s `done()` (its `afterSchedMutate`, the flash, `barDrop`) then add a second step?
   - **The fold (§4.8)** now keyed by `entryIdOf` for records and `srcg` for rows: the cases you raised, and the
     list of counts at the end of §4.8 — is any of them wrong as written?
3. **Anything in the changed sections that is wrong about the code as it stands.**

## Your report
Your findings first, numbered, most serious first: the failure (concrete), its cause (file and function), the exact fix.
Then the one-line status of each earlier finding. Then the VERDICT line.
