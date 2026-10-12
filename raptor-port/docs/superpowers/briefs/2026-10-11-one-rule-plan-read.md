# Brief — read of the PLAN "one rule for every input's row, one record for every input" (read-only; blind)

**You are the independent reader of a plan** (owner D758: on this job Fable reviews, on his word — Opus 5.5 surveyed
and planned; the ChatGPT reader D758 also names is out until about 1 Nov 26, D761, so for now yours is the ONE read
before a build that touches OIL, the published record, saved data and permissions). Nothing is built. **Change no
file.** You advised on this design earlier today (`raptor-port/docs/superpowers/briefs/2026-10-11-reads/all-avail-member-consistency-fable.md`
— your candidate B is what he chose); you wrote none of this plan, and you read it as a reviewer.

One round. Say plainly at the end: `VERDICT: CLEAN` (build it as written), `VERDICT: CLEAN WITH THESE EXACT CHANGES`
(list them, each precise enough to apply without asking you), or `VERDICT: NOT CLEAN` (what must be redesigned first,
and by whom — the owner for a product choice he has NOT made, the planner for a technical one).

## The plan
`raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md` — read it whole.
Written from: the design note `raptor-port/docs/superpowers/specs/2026-10-11-all-avail-as-member-design-note.md` (§5, §7
and §8 — §7 is the walk-through he agreed, word for word) and the survey
`raptor-port/docs/superpowers/specs/2026-10-11-all-avail-as-member-survey.md` (the app as it stands: four helper
surveys; only what is marked HOST-CHECKED was read by the planner — **the rest is unverified, and verifying what the
plan leans on is part of your read**). The pictures he was shown for his OIL answer:
`raptor-port/docs/mock/one-rule-oil.html` (he chose C — D762).

## Read these to judge it (nothing loads by itself for you)
- The rulings, one line each: `.claude/rules/decisions/scheduler.md` — **D750, D753, D755–D757, D759, D760, D762**; D734–D745;
  D654–D663, D681, D682, D700, D702, D711–D713, D715–D717, D721, D724, D727, D729, D731; D363, D175, D174–D178, D114,
  D113, D109, D103, D98, D96, D91–D93, D45, D44; D468, D271, D278, D450, D355; its closed section "The late-input mark".
  `.claude/rules/decisions/oil.md` — D18, D43, D46, D470, D52, D48, D142, D2, D25, D360. `.claude/rules/decisions/people-accounts.md`
  — D200, D297, D299, D327. `.claude/rules/decisions/how-we-work.md` — D754, D758, D761, D56, D22, D148, D489, D29, D473,
  D201. `.claude/rules/raptor-executor.md`. **A ruling's full row — open it before leaning on its detail:**
  `grep -h '^| D755 |' .claude/decisions-full/*.md`.
- The backlog: `OUTSTANDING.md` `[ALL-AVAIL-AS-MEMBER]`, `[INPUT-CHANGED-TELL]`, `[NO-ASTRA-LIST]`.
- Yesterday's plan, whose bet this one reverses: `raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md`
  (§3 the bet, §4.8 the count, §8 what its readers found).
- The code — **verify every claim the plan and the survey make about each, and read past what they name:**
  `raptor-port/src/engine/overlay.ts`, `grouprows.ts`, `inputentry.ts`, `entryfold.ts`, `canonical.ts` (`canonicalUnits`,
  `placeOf`), `restore.ts` (`dayKeys`), `publish.ts` (`daySnap`, `dayInputsFrozen`, `dayDeltaIn`, `inputAxes`,
  `dayPendingItemsIn`, `requestRowUnit`, `unitRequestSrc`, `dayDiscardCount`), `drafts.ts` (`loadVersionToWorkingCopy`,
  `draftSelect`, `dayAsLoadLeaves`), `daytpl.ts`, `slots.ts` (`setSlotVal`, `fillSlot`, `txtSet`, `sharedSeatBar`,
  `acceptInput`, `unacceptInput`), `inputs.ts` (`placeholderProblem`, `inpDetailKey`, `frozenInputMatch`, `inputsOn`,
  `isLateInput`, `sansAvailOn`, `isPersonal`), `events.ts` (`mapInp`, `inpShow`), `validate.ts` (its readers of
  `day.input`), `avail.ts`, `weekctx.ts`, `weekstash.ts`, `oil.ts`, `oilev.ts` (whole), `schema.ts`;
  `src/state/inputgroup.ts`, `holderbase.ts`, `perms.ts` (`mayChangeInput`, `filedForOther`, `mayFileGroup`,
  `inputBreach`, `groupStood`, `ownershipViolation`), `store.ts` (`runInputWrite`, `writeInputsBatch`,
  `placeholderShapeViolation`, `writeSlot`, `writeFill`), `sched-commit.ts` (the restore), `persist.ts`, `person-delete.ts`,
  `changelines.ts`, `inputstamp.ts`, `view.ts` (`placeArmed`); `src/undo/derive.ts`, `timeline.ts`; `src/ui/grouprow.ts`,
  `reqrow.ts`, `drag.ts` (`applyDrop`), `inputedit.tsx` (`commitNewInput`, `commitInputEdit`, `commitGroup`,
  `reassignInput`, `saveFromRow`, `removeInput`, `removeEntry`, `oilGate`, `entryOilAnswer`, `askOilIfPending`, the
  editor), `oilmode.ts`, `board.ts` (the `grdel` / `grcx` / `grflag` / `grinfo` handlers), `html.ts` and `board-html.ts`
  (the ground loop, Personal Inputs, the Unavailable list), `inputscal-model.ts`, `inputcard-model.ts`, `placedline.ts`,
  `PeoplePick.tsx`, `caldrag.ts`, `pendlist.ts`, `changesmodel.ts`, `topbits.tsx` (the bell), `export.ts`;
  `src/leavewar/sync.ts` (`availableFor`, `oilPendingFor`, the absence index, `cutDates`, the credit pass),
  `inputgate.ts`, `absences.ts`; `src/testing/refwin.ts`, `src/probe-bridge.ts`, `src/state/demoseed.ts`,
  `src/storage/reset.ts`, `fold.ts`, `schema.ts`.
- The contracts: `raptor-port/docs/engine-rules.md` ("On a shared input's row the pucks are the input's people", "A
  shared input is counted once", the landing paragraph, the OIL input ask), `docs/ui-contracts.md` ("A shared input is
  ONE row on the schedule", "One input filed for several people"), `docs/feature-impact.md` (Flow B; "One input filed
  for several people"), `docs/data-schema.md` §Inputs, `docs/data-model.md` §Input and §11, `docs/undo-contract.md` §0,
  §3.1, §5, `docs/performance.md` Part 1.

## NOT a finding (owner D56, D22)
The app's whole stored world is DEMO DATA, cleared before the database step. **Do not report a problem whose harm
exists only in data already stored when the code is already correct going forward** — no migration, no "an existing
record would read differently" (the plan's §4.11 and its R6 are known and accepted). If the app would do it again to
NEW data, or an old record would make a load THROW, report it. A claim counts only with a concrete failure, its
cause and its exact fix (D489).
**Not open either — his own choices (D755–D762):** one rule for every input's row; one record per input, changed in
this job; ALL AVAIL / ALL as one of the people, single day, six kinds, one or the other; one OIL answer per input and
no answer of a man's own; a CX cancels the input; the walk-through of the note's §7; the ten "follows by itself"
readings of D759. Report only where the PLAN fails to deliver one of them, or contradicts another ruling.
**How to judge the design (owner D754):** by whether it is intuitive, fits the workflow, behaves the same everywhere
and leaves fewer places for a bug — never by how little it changes. Say what a choice costs; do not recommend the
cheaper design for being cheaper.
**OPEN to you:** every technical choice the plan made for itself, and its readings R1–R8 — say where one is wrong, or
where a choice the plan made is really the owner's.

## What we most want from you
1. **The bet (§2).** One record and one ground row, with the one-man's-day rules reading a derived view. Find the
   reader or the writer it forgot. Is `inputLines()` (flat, frozen, built per call) sound against every class-A
   reader as that reader is written — one that mutates what it is handed, holds it across a write, compares by
   identity (`INPUTS.indexOf(r)`, `===`), or needs the record's `iid` to mean "this man's part" (the Leave War's
   `leaveInputAt` / `DayList`, the bell, `iu:<iid>`, medical documents)? Is "built per call" affordable where
   `validate()` and the crowd run (`docs/performance.md` Part 1), and is hoisting in `availableFor` the only loop?
   Is the source-level guard (§4.2) enough to make a missed reader loud?
2. **The record (§4.1).** Is every per-person fact of today's record accounted for — `acc`, `oil`, `mod`, `by` /
   `at`, `modBy` / `modAt`, `hand` / `leftAt`, `lw` / `lwMoved`, `docIds`, `ord` — as the input's, as an entry's, or
   deliberately gone? Is `h` + `hand` a sound replacement for `hand` / `leftAt` in `pruneHandedOverDecisions` and
   `oild.pa`? Are the invariants complete, and held at every door that writes an input (Undo / Redo's restore, the
   Leave War's door, a delete, a posting, the seeds, the probe bridge)?
3. **The row (§4.3) and the hands (§4.4).** With the re-make owning the whole row: what on a stored row is lost that
   someone needed (a position, a mark, an id a mark is keyed by)? Walk every writer of a ground row's `who`, `more`,
   `cx`, `cxr`, `flag`, `info` and every door in `drag.ts applyDrop`: which reaches a row that came from an input
   without the door? Is the table of §4.4 complete and coherent with `applyDrop`'s swap and move code — especially the
   swap of the only person, a placeholder dropped on a puck, a person dragged between two inputs' rows, and "the seat
   he came from keeps him"? Is the belt enforceable in `slots.ts` without refusing a legitimate write (the re-make
   itself, a load, a template, Undo)?
4. **One man's part (§4.6).** Is `ownInputOf` right for every writer the survey's §3 C names, and are there more? What
   does a split do to the Leave War's `lw` provenance, a bid claim, the absence index, an issued day's frozen copy,
   the change history, Undo (one step?), and the split man's late date and OIL answer for days already published?
   Is `iu:<iid>~<person>` safe through every reader of the slot grammar (`keyDay`, the arm, History's dots, the
   changes window's tap)?
5. **OIL (§4.7).** Trace the walk-through's steps 1–4 and both OIL variants through `projectOilInputs`, `oilEvidence`,
   `oilEarnedWork`, `spanDefault`, `earnsFrom`, the crowd (`availableFor`), the freeze and the Leave War's credit
   pass: does anyone earn twice, earn nothing with nothing on screen saying why, or keep earning after leaving? Is
   "stand from the input, no row lookup" right for a request that never landed, one taken off, one on another week,
   and a several-day input? Is the legacy reader for an old issued block specified tightly enough to keep D48 /
   D142, and is anything ELSE in an old block read by the new code? Does a person added to an input make every
   published day it covers read pending exactly once?
6. **The published day (§4.8).** Is treating `who` + `more` of an input's row as one list place in `canonical.ts`
   sound for every unit it feeds (`reseat` pairing, the order unit, `mov:` rows, the edit log's keys, amendment marks
   on a puck)? Work the counts of the plan's T5 and find the one that comes out wrong — especially a several-day
   input's other published days, a person added AND the input re-timed, an input taken off and accepted onto another
   day, an Undo of each, an amendment issued then unpublished (D101), and `dayDiscardCount`. Are `dayDelta`, the
   stored diff and the sign-off binding unaffected except through the details axis? Does a load of an older version
   end at "nothing pending" when the inputs are as they were at issue (D98) — and what does it do when they are not?
7. **Permissions (§4.9).** Does the rule deliver D755 (3) exactly, for a member's own one-person input a scheduler
   added to, a shared input a member filed, one an admin filed, and with "members file for others" on and off — and
   can a member's command still change something that is not his through the gate as rewritten? Is ending
   `groupStood`'s "a member may add a man to an entry he did not file" a technical consequence or a choice of the
   owner's?
8. **The bell (§4.10).** A new saved record written inside another record's command: does it satisfy
   `docs/undo-contract.md` §5 and the day lock's "a change elsewhere writes its own record" (D450)? Who must NOT be
   told and is? What does Undo by ANOTHER person do to a notice (D148)?
9. **Old data and the seeds (§4.11).** With no conversion and no wipe: name anything that THROWS on an old-shaped
   record, row, issued block or change-history line. Is leaving the verbatim seeds old-shaped safe against
   `schema.test.ts` and the parity gates?
10. **The build order (§5) and the tests (§6).** Is step 1 truly invisible, and is its "every existing test passes
    unchanged" a real proof? Is step 2 buildable in the order given, or does a later letter have to come first? Which
    test that would have caught a failure you found above is missing?
11. **What is MISSING (scenario design — D758 reading 4).** The scenarios a walker must drive in the running app that
    neither the plan's §6 nor its §7 roll-call would reach: list them, each as a person would do it, with what must
    be seen.
12. Anything in the plan or the survey that is wrong about the code as it stands.

## Your report
Findings first, numbered, most serious first: the failure (concrete), its cause (file and function), the exact fix.
Then explicit negatives — what you traced and found sound. Then the missing scenarios (11). Then the VERDICT line.
Return the whole report as your final message; the host saves it, unchanged, to
`raptor-port/docs/superpowers/briefs/2026-10-11-reads/one-rule-plan-fable.md`.
