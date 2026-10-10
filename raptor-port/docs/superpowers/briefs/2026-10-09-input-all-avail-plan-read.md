# Brief — red-team the PLAN for an input filed for "ALL AVAIL" or "ALL" (one reader each; read-only; blind)

**You are one of two independent readers of an important plan** (owner D67, D590: Opus 5.5 planned; Astra and Sol 6.1
each read it, blind). Nothing is built. **Change no file. Do not read the other reader's report.** The owner ruled
(D708) that this may be built tonight only if both readers read the plan CLEAN — so say plainly at the end:
`VERDICT: CLEAN` (build it as written), `VERDICT: CLEAN WITH THESE EXACT CHANGES` (list them, each precise enough to
apply without asking you), or `VERDICT: NOT CLEAN` (what must be decided or redesigned first, and by whom — the owner
for a product choice, the planner for a technical one).

## The plan
`raptor-port/docs/superpowers/plans/2026-10-09-input-all-avail-plan.md` — read it whole.

## Read these to judge it (nothing loads by itself for you)
- The rulings, one line each: `.claude/rules/decisions/scheduler.md` — D700, D702, D708, and the placeholders' own:
  D27, D33, D36, D37, D38–D41, D44, D45, D47, D50, D51, D65, D66, D77; the shared input: D654–D663; D178, D179 (a
  published day). `.claude/rules/decisions/oil.md` — all of it, above all D2, D18, D28, D31, D32, D43, D46, D48, D52,
  D142, D470. `.claude/rules/decisions/how-we-work.md` — D25 (OIL is earned leave), D56, D489.
  A ruling's full row: `grep -h '^| D46 |' .claude/decisions-full/*.md`.
- The code the plan leans on — verify every claim it makes about each: `raptor-port/src/engine/overlay.ts`
  (`landRequests`, `requestRowFields`, `rowMayStand`), `src/engine/slots.ts` (`acceptInput`, `sentinelSeatOK`),
  `src/engine/oilev.ts` (`oilEvidence`, `landedHasSentinel`, `landedExtras`, `oilEarnedWork`, `oilInputEligible`,
  `oilEvidenceKey`), `src/leavewar/sync.ts` (`availableFor`, `oilAskPlan`, `oilPendingFor`, `creditable`),
  `src/engine/publish.ts` (`daySnap`), `src/engine/inputs.ts` (`INPUT_META`, `typeGroup`, `restsInput`, `isPersonal`,
  `inputCoversDate`), `src/state/perms.ts` (`memberFilesForOthers`, `mayFileInputFor`, `mayFileGroup`, `mayEditInput`,
  `inputBreach`), `src/ui/PeoplePick.tsx`, `src/ui/inputedit.tsx` (`normalizeInputDraft`, `commitNewInput`,
  `commitInputEdit`, `commitGroup`, `oilGate`, `reassignInput`), `src/ui/oilmode.ts`, `src/ui/board-html.ts` (the
  request row's OIL switch), `src/leavewar/absences.ts` (`warVisible`), `src/engine/avail.ts` (`dayAway`).
- The contracts: `raptor-port/docs/engine-rules.md` (search "placeholder", "ALL AVAIL", "request"),
  `raptor-port/docs/data-model.md` §11, `raptor-port/docs/feature-impact.md`.

## NOT a finding (owner D56)
A problem that lives only in data already stored. A claim counts only with a concrete failure, its cause and its
exact fix (D489).

## What we most want from you
1. **Is §3.7 (OIL) right and safe?** Trace `oilEarnedWork` and everything that feeds it. With the plan's change, can
   any man be credited, or lose credit, silently — on a working copy, on an ISSUED day (D44, D48, D142), after the
   filer changes his answer, after the scheduler replaces the name box, when the row carries BOTH typed men and the
   placeholder, when a named man's input carries the placeholder among its extras? How does a holder's answer of 0.5
   limit his credit today, and does the crowd need the same? Is "the crowd minus the typed men" computable where the
   plan says, from what an issued day has written down?
2. **Can a refused input be written?** Every door that makes or changes an input (the editor, the calendar's drag and
   its range pick, the schedule's own Accept / reassign / move-to-ground buttons, Undo and Redo, a loaded version, a
   template): can any of them produce a placeholder input of a refused kind, of several days, mixed with names, or by
   someone who may not?
3. **What does the roll-call (§4) miss?** Any reader of an input's `person` that would crash, miscount, mis-sort,
   mis-announce or show a placeholder as a man — and the `'all'` string collision.
4. **Does anything in §3 contradict a ruling** — quote its line. In particular: D702's "realtime" against D44's freeze;
   "members can choose too" against the members' switch; "only on the day and the schedule".
5. **Are the three parked questions (§7) truly the owner's**, and are the plan's interim answers the safe ones? Is
   there a product choice the plan made silently that the owner should have been asked?
6. **What would you test that §5 does not?**

Number every point. Keep it to what would change the plan or stop the build. End with the VERDICT line, then
`Rulings: none this session`.
