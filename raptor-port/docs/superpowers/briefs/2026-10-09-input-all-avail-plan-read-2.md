# Brief — second read of the PLAN for an input filed for "ALL AVAIL" / "ALL", now with the new kind "Event" (one reader each; read-only; blind)

**You are one of two independent readers of an important plan** (owner D67, D590, D601: Opus 5.5 planned; Astra and
Sol 6.1 each read it, blind). Nothing is built. **Change no file. Do not read the other reader's report, of this round
or the last** (`raptor-port/docs/superpowers/briefs/2026-10-09-reads/` is closed to you — the plan's own §10 says where
each of last round's points is answered; judge the plan, not the earlier reports).

This is VERSION 2. Version 1 was read by both readers and found NOT CLEAN; the owner has since made every product
choice (D711, D712, D713, D714) and the plan was rewritten from them. The owner's instruction: both read it again, then
it is built with a FULL bug check. So this is the last read before code — say plainly at the end:
`VERDICT: CLEAN` (build it as written), `VERDICT: CLEAN WITH THESE EXACT CHANGES` (list them, each precise enough to
apply without asking you), or `VERDICT: NOT CLEAN` (what must be redesigned first, and by whom — the owner for a
product choice he has NOT already made, the planner for a technical one).

## The plan
`raptor-port/docs/superpowers/plans/2026-10-09-input-all-avail-plan.md` — read it whole.

## Read these to judge it (nothing loads by itself for you)
- The rulings, one line each: `.claude/rules/decisions/scheduler.md` — **D700, D702, D711, D712, D713, D714**, and the
  placeholders' own: D27, D33, D36, D37, D38–D41, D44, D45, D47, D51, D65, D66, D77; the shared input: D654–D663, D682;
  D178, D179, D103 (a published day). `.claude/rules/decisions/oil.md` — all of it, above all D2, D18, D28, D31, D32,
  D43, D46, D48, D52, D142, D470. `.claude/rules/decisions/how-we-work.md` — D25 (OIL is earned leave), D56, D489,
  D485. `.claude/rules/decisions/people-accounts.md` — D200, D327.
  **A ruling's full row — open it before leaning on its detail:** `grep -h '^| D711 |' .claude/decisions-full/*.md`.
- The backlog items: `OUTSTANDING.md` `[INPUT-ALL-AVAIL]` and `[INPUT-EVENT-KIND]`.
- The code the plan leans on — verify every claim it makes about each:
  `raptor-port/src/engine/inputs.ts` (`INPUT_META`, `typeGroup`, `restsInput`, `oilAsks`, `isPersonal`, `shiftHardInput`,
  `SHIFT_HARD_RE`, `inputFlags`, `isAway`), `src/engine/schema.ts`, `src/testing/refwin.ts` (`reshift`, `reirest`),
  `src/engine/overlay.ts` (`viewOfWeek`, `requestRowFields`), `src/state/holderbase.ts`, `src/engine/slots.ts`
  (`acceptInput`, `sentinelSeatOK`), `src/engine/oilev.ts` (`oilEvidence`, `projectOilInputs`, `landedHasSentinel`,
  `landedExtras`, `oilEarnedWork`, `earnsFrom`, `spanDefault`, `itemState`, `oilInputEligible`, `oilEvidenceKey`),
  `src/ui/oilmode.ts` (`oilPersonOn`, `effectiveDefault`, `toggleOilPerson`, `oilOffReason`, `oilEligible`,
  `oilItemCellHTML`), `src/ui/AvailWindow.tsx`, `src/leavewar/sync.ts` (`availableFor`, `oilAskPlan`, `oilPendingFor`,
  `creditFrom`), `src/engine/publish.ts` (`daySnap`, the OIL comparison), `src/engine/avail.ts` (`dayAway`),
  `src/engine/events.ts` (`inpShow`), `src/state/perms.ts` (`memberFilesForOthers`, `filedForOther`, `mayFileInputFor`,
  `mayFileGroup`, `mayEditInput`, `inputBreach`, `ownershipViolation`), `src/state/store.ts` (`runInputWrite`,
  `writeInputsBatch`, `wireStore`), `src/command/harness.ts` and `src/command/commit.ts` (the hard checks),
  `src/state/sched-commit.ts` (the Undo / Redo restore of inputs), `src/ui/PeoplePick.tsx`, `src/ui/inputedit.tsx`
  (`normalizeInputDraft`, `commitNewInput`, `commitInputEdit`, `commitGroup`, `oilGate`, `reassignInput`,
  `askOilIfPending`), `src/ui/InputsPage.tsx` (`add()`, the person filter), `src/ui/InputsCal.tsx` (`dayEntries`),
  `src/ui/inputscal-model.ts`, `src/ui/topbits.tsx` (the bell), `src/probe-bridge.ts` (`fileInput`).
- The contracts: `raptor-port/docs/engine-rules.md` (search "placeholder", "ALL AVAIL", "request", "shiftHard"),
  `raptor-port/docs/data-model.md` §11, `raptor-port/docs/feature-impact.md`.

## NOT a finding (owner D56)
This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it. A claim counts only with a concrete failure, its cause and its exact fix (D489).
**Not open either: the owner's own choices** — the filer answers OIL once and a man behind the placeholder has no
answer of his own (D711 (1)); the six kinds (D711 (2), D712, D713); one day at a time (D711 (3)); the filer's bell and
only his (D711 (4)); Event clashing red like Training / Appointment / Duty (D714). Report only where the PLAN fails to
deliver one of them, or contradicts another ruling.

## What we most want from you
1. **Is §3.7 (OIL) right and safe?** Trace `oilEarnedWork`, `spanDefault`, `effectiveDefault`, `toggleOilPerson`,
   `oilOffReason` and `oilEligible` with the plan's one body `claimDefault` in place. Can any man be credited, or lose
   credit, silently — on a working copy; on an ISSUED day (D44, D48, D142); after the filer changes his answer; after
   the scheduler replaces the name box or takes the placeholder off; when the row carries typed men AND the placeholder;
   when a NAMED man's request carries a placeholder among its extras (must be unchanged); when the answer is missing?
   Is there any reader of "does this man earn by default from this request" the plan has NOT routed through the one
   body — a count, a figure, the window's list, the publish comparison, the pending list's words?
2. **Can a refused placeholder input be written or brought back?** §3.2's two layers: is the hard check on
   `env.changes` really reached by every writer — the editor, the List's own Add form, the group save, the calendar's
   drag and range pick, the time cells, `reassignInput`, `acceptInput(…,'u')`, the Leave War's door, the test bridge,
   Undo / Redo, a loaded version, a plan switch? Does it judge an admin and a restore? Could it wrongly refuse a
   legitimate command (a restore of a good record; a command that touches a placeholder input only to change its
   `acc`, its `ord`, its OIL answer)? Does every door that can meet it SAY the sentence first?
3. **What does the roll-call (§5) miss?** Any reader of an input's `person` that would crash, miscount, mis-sort,
   mis-announce or show a placeholder as a man; any place the string `'all'` still means "Everyone"; any place that
   lists the input kinds by hand and so would miss "Event".
4. **Is §4 (Event) complete?** Is one table row truly all it takes — which predicate, list, regex, document or test
   states the kinds by hand? Is the plan right that the original's suite (`reference/tfin.js`, `parity.test.ts`) stays
   green, and what in `refwin.ts` must change with it? Is the hand-typed-word ripple stated correctly?
5. **Does anything in §3 or §4 contradict a ruling** — quote its line. In particular D702's "realtime" against D44's
   freeze; D711 (4) against D702's "only on the day and the schedule"; D46 / D43 ("a placeholder credits by default, no
   exception") against a crowd that follows the filer's No — the plan reads D711 (1) as the later ruling for a request
   HELD by a placeholder only; is that reading sound, and is the line between "held by" and "dropped on" drawn where the
   code can keep it?
6. **Is any of §8's five readings really a product choice the owner must make first** — or a technical call wrongly
   left to him?
7. **What would you test that §6 does not?**

Number every point. Keep it to what would change the plan or stop the build; for each, the concrete failure, its cause,
and the exact change to the plan. Say explicitly what you checked and found sound (explicit negatives). End with the
VERDICT line, then `Rulings: none this session`.
