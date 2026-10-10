# Brief — read of the PLAN for "the schedule's one row for a shared input" (one reader each; read-only; blind)

**You are one of two independent readers of a plan** (owner D67, D590, D601: Opus 5.5 planned; Astra and Sol 6.1 each
read it, blind — it reaches published days and earned OIL, so two readers). Nothing is built. **Change no file. Do not
read the other reader's report** (`raptor-port/docs/superpowers/briefs/2026-10-10-reads/` is closed to you).

One round only. The owner has made every product choice (D661, D662, D734–D743) and has approved the pictures. Say
plainly at the end: `VERDICT: CLEAN` (build it as written), `VERDICT: CLEAN WITH THESE EXACT CHANGES` (list them, each
precise enough to apply without asking you), or `VERDICT: NOT CLEAN` (what must be redesigned first, and by whom — the
owner for a product choice he has NOT already made, the planner for a technical one).

## The plan
`raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md` — read it whole.
The design note it is written from: `raptor-port/docs/superpowers/specs/2026-10-10-group-input-one-row.md`.
The approved pictures: `raptor-port/docs/mock/group-input-one-row.html` (its images in
`raptor-port/docs/mock/img/group-input-one-row/` — `…-1today.png` beside `…-2new.png`).

## Read these to judge it (nothing loads by itself for you)
- The rulings, one line each: `.claude/rules/decisions/scheduler.md` — **D734–D743, D661–D663**, and D654–D660, D681,
  D682, D711, D715–D717, D727, D731 (a shared input and its title), D109, D113, D114, D174–D178, D103, D98, D93, D91,
  D45, D44 (a published day), D468, D271, D278, D605, D450, and its closed section "The late-input mark".
  `.claude/rules/decisions/oil.md` — D18, D46, D43, D470, D2, D142, D25. `.claude/rules/decisions/how-we-work.md` — D56,
  D489, D29, D473, D485. `.claude/rules/raptor-executor.md`. **A ruling's full row — open it before leaning on its
  detail:** `grep -h '^| D736 |' .claude/decisions-full/*.md`.
- The backlog: `OUTSTANDING.md` `[GROUP-INPUT-ONE-ROW]`, `[REQ-ROW-OWN-BOXES]`, `[REQ-ROW-SELF-CLASH]`,
  `[CAL-TOGO-ONE-ITEM]`.
- The code the plan leans on — **verify every claim its §2 makes about each**:
  `raptor-port/src/state/inputgroup.ts` (whole), `src/engine/overlay.ts` (whole — `requestRowFields`, `srcvOf`,
  `landedRid`, `rowMayStand`, `standingRow`, `standsOn`, `reconcileRequestRows`, `landRequests`, `viewOfWeek`),
  `src/state/holderbase.ts` (whole — `rederive`, `requestAddMarks`, the `acc` derivation), `src/ui/inputedit.tsx`
  (`commitNewInput`, `commitInputEdit`, `reassignInput`, `askOilIfPending`, `setInpField`, `removeEntry`, `dropInputRow`,
  `commitGroup`, the editor's `saveNow` and its use of `entryRowsOf`), `src/engine/inputs.ts` (`isLateInput`,
  `inputStampISO`, `nowStamp`, `inpDetailKey`, `frozenInputMatch`, `inputOn`, `inputsOn`, `titleOf`, `inpLabel`,
  `isPersonal`), `src/state/inputstamp.ts`, `src/engine/publish.ts` (`dayPendingItemsIn`, `requestRowUnit`,
  `unitRequestSrc`, `groundOrderMovedOnlyBy`, `inputAxes`, `filingDelta`, `filingSame`, `dayDiscardCount`, `itemCounts`,
  `alIssue`, `pendingKey`, `alAttr`), `src/engine/canonical.ts` (`canonicalUnits`, `canonicalDiff`), `src/engine/restore.ts`
  (`dayKeys`), `src/ui/pendlist.ts` (whole), `src/ui/changesmodel.ts` (`inputItem`, `mergeFiled`), `src/ui/ChangesWindow.tsx`,
  `src/ui/ALPanel.tsx`, `src/ui/html.ts` (`lSeat`, `moreSeats`, `lCell`, `plRow`, `rowKindTag`, the ground loop, `inGrp`,
  `inpTimeCells`, `inpRmkCell`, `accCtl`, `lateTag`, `lateChip`, `lateTagOf`, `srcInput`, `dayStatHTML`),
  `src/ui/board-html.ts` (`sbGroundPanel`, `sbInpRow`, `sbInputsGroupPanel`, `sbUnavailPanel`, `sbRowCtl`),
  `src/ui/board.ts` (the `grdel` / `grcx` / `grflag` / `grinfo` handlers, `boardChange`), `src/ui/textedit.ts`
  (`routeFocusOut`), `src/ui/drag.ts` (`applyDrop`), `src/state/view.ts` (`placeArmed`, `toggleLateOff`, `lateShown`),
  `src/ui/Shell.tsx` (the right-click remove), `src/state/store.ts` (`writeSlot`, `writeFill`, `writeText`,
  `runInputWrite`, `writeInputsBatch`), `src/engine/slots.ts` (`setSlotVal`, `fillSlot`, `txtSet`, `acceptInput`,
  `unacceptInput`), `src/engine/avail.ts` (`rowTwice`), `src/engine/order.ts` (`groundOrder`), `src/engine/reorder.ts`
  (the ground row move and sort), `src/ui/rowdrag.ts`, `src/engine/events.ts` (the ground rows' events, `inpShow`,
  `shiftHardGround`, the `blank` / `whole` self-clash guard), `src/engine/oil.ts` (`voidedOil`, `inputOilAmt`,
  `groundItemKey`), `src/engine/oilev.ts` (`projectOilInputs`, `landedStanding`, `landedRow`, `landedExtras`,
  `oilEarnedWork`, `earnsFrom`), `src/ui/oilmode.ts` (`toggleOilItem`, `toggleOilPerson`, `oilRowPeople`,
  `oilItemCellHTML`), `src/ui/peek.ts`, `src/ui/export.ts`, `src/ui/printpdf.ts`, `src/state/perms.ts` (`mayEditInput`,
  `ownershipViolation`, `inputBreach`), `src/state/changelines.ts` (`inputLines`), `src/engine/schema.ts` (`Input`,
  `GroundRow`), `src/engine/weekstash.ts` (`rowElsewhere`, `stashDays`), `src/engine/drafts.ts` (`rebaseDayPending`).
- The contracts: `raptor-port/docs/engine-rules.md` (search "auto-lands", "late-input mark", "pending count"),
  `docs/ui-contracts.md` (search "One input filed for several people", "request row", "counting unit"),
  `docs/feature-impact.md` ("One input filed for several people"), `docs/data-schema.md`, `docs/data-model.md`,
  `docs/undo-contract.md`, `docs/performance.md` Part 1.

## NOT a finding (owner D56)
The app's entire stored world is DEMO DATA that will be CLEARED before the database step. **Do not report a problem
whose harm exists only in data already stored when the code is already correct going forward** — no migration, no
back-compat, no "an existing row would read wrongly" (the plan's R8 is known and accepted). If the app would do it again
to NEW data, report it. A claim counts only with a concrete failure, its cause and its exact fix (D489).
**Not open either: the owner's own choices** — one row for the Ground Programme and Personal Inputs, a row a man on the
Unavailable list; the pucks are the input's people; one row, one time; one change waiting for the whole input and one for
each man taken off or added; the added man takes the input's OIL answer with no question; a typed time or remark changes
the request; nothing done from the schedule makes an on-time input LATE; the ten pictures. Report only where the PLAN
fails to deliver one of them, or contradicts another ruling. **The plan's readings R1–R9 and its Q1 ARE open to you**: say
where one is wrong, or where a choice the plan made for itself is really the owner's.

## What we most want from you
1. **The bet (§3).** The plan keeps one ground row a man and makes the ONE row only where it is drawn, written and
   counted. Find the reader or the writer it forgot. Walk every importer of `overlay.ts`, every reader of `row.src`, and
   every writer of a ground row's `who`, `more`, `prog`, `str`, `end`, `rmks`, `cx`, `flag`, `info`: with four member
   rows drawn as one, which of them can now leave the four rows DIFFERENT (so the one row silently splits), write to one
   man's row or record alone, or act on a row the screen does not draw? Is "alike" (§4.1) the right test — can two rows
   that should be one fail it going forward, or two rows that should NOT be one pass it?
2. **`srcg` and the view (§4.1, §4.2).** Is adding `srcg` to `requestRowFields` and to `srcvOf` only-when-grouped really
   invisible to every digest, diff, signature and count (`restore.ts dayKeys`, `canonical.ts`, `publish.ts`, the holder
   base's `sigOf`, `weekstash.ts`, the peek's signatures)? On a PUBLISHED day, does inserting a landed row mid-list (not
   at the end) move any other row's mark, pending unit, order unit (`mov:…ground`, `groundOrderMovedOnlyBy`) or key? Is
   handing a taken-away row's placeholders to a sibling sound in the holder base (the stored day still holds the old row
   until its holder saves) — after a reload, after an Undo of the delete, on a published day?
3. **The typed boxes (§4.4).** Trace `gr:di.ri.str` typed on a one-man request's row through the new door on the week,
   the board, by Tab, and through `writeText`: is anything still written to the row, is it exactly one command and one
   Undo step, does the caret-safe repaint survive, does a refused time heal? What of a row whose request is taken off, on
   another day, in a read-only week, or whose input the scheduler may not edit? Does `setInpField`'s "the other end
   defaults / a cleared time means all day" damage anything a Ground Programme row relied on (a row with a start and no
   end — D360, D361; a time-less row)? Is `prog` → the input's `title` sound for every kind that lands, including Other
   and a placeholder input (D700–D712)?
4. **The hands (§4.5).** Is there a door that puts a person on, or takes one off, a ground row that the plan's list
   misses (keyboard, the palette, a swap, a day template, a saved plan, a load of an older version, the probe bridge)?
   Is "a drag never writes a member row's `who`" enforceable at those doors alone, or does it need a belt in the engine?
   Is treating a drop from a seat as an ADD that vacates nothing (R4) coherent with `applyDrop`'s swap and move code, the
   drop's flash, `barDrop` and the armed seat? With `commitGroup` as the writer: what does it do for a scheduler adding a
   man to a MEMBER's entry, to an entry of one, to a placeholder input, to a record that has left its group — and what
   stops the absence rules, `groupBreach` or `ownershipViolation` refusing a legitimate schedule-side add?
5. **OIL (§4.5, §4.7).** "The answer the input carries" is defined as the majority answer, A-to-Z first on a tie: is
   there a better-founded definition in the records as they are kept (D682 writes the filer's answer on every record;
   D660 lets a man change his own)? Will the copied answer pass `ownershipViolation`'s test 3 and survive `voidedOil`?
   Does anything in OIL — the evidence, the credit, a published day's frozen block, the per-man switch, `landedExtras`
   — read differently for four member rows drawn as one than for the four rows of today? (It should not: say so if
   you can confirm it.) On §4.7 / Q1: which behaviour do the rulings as recorded require for a typed time on the
   schedule, and does the plan's "as built" choice contradict any of them other than D739's reading 4?
6. **The LATE mark (§4.6).** Is `mod` the only thing `isLateInput` and every LATE surface read? Is skipping the stamp
   reachable by anyone but a scheduler, from anywhere but a row on the schedule? Is "the earliest `mod` among the entry"
   right for an added man, and can it ever make an on-time input read late or a late one on time? Does anything else
   (sorting, the Inputs list, the SANS calendar, a published day's frozen copy, `inpDetailKey`) depend on `mod` moving?
7. **The count (§4.8).** Work the twelve counts, and find the thirteenth that comes out wrong: a group re-timed AND
   taken off; a record that left its group; a group of one; two different shared inputs with the same times; a shared
   input covering two published days; a request moved between days; an Undo of each; `frozenInputMatch`'s content-first
   pairing (steps 2 and 4) meeting a group; `dayDiscardCount`; an amendment issued, then unpublished (D101). Is it true
   that `dayDelta`, the stored `diff` and `pendingKey` are untouched, so the sign-offs fall and stand exactly as today
   (D103)? Does "never zero while the delta is not" (`pendunits.test.ts`) still hold?
8. **The roll-call (§6) and the build order (§5).** What surface that draws or counts the thing is missing? Is any step
   unbuildable before a later one, or missing a test that would have caught a failure you found above?
9. Anything in the plan that is wrong about the code as it stands.

## For Astra only — one more, short (owed since 10 Oct 26, `OUTSTANDING.md` `[CAL-JOB-LEFT]` (2))
A meaning read (owner D138: a short line must never change what its full row meant) of the short lines **D734–D743** in
`.claude/rules/decisions/scheduler.md` against their full rows in `.claude/decisions-full/scheduler.md`. For each: SAME,
or the exact words that differ in meaning and the corrected short line. Put it under its own heading at the end of your
report. (Sol: skip this.)

## Your report
Findings first, numbered, most serious first: the failure (concrete), its cause (file and function), the exact fix.
Then explicit negatives — what you traced and found sound. Then the VERDICT line.
