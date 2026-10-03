# Fresh Astra final code inspection — round 1, immutable brief

You are a NEW independent `gpt-6-astra` inspector. Sol 6.1 wrote/fixed the application. The coordinating Astra
authored the plan/scenarios and publication walk, and is not the code approver. You have no prior final inspection
to consult. Read-only code inspection; do not edit source, tests, plans, skills, this brief or reviewer evidence.
Return your full report and explicit coverage. The host saves it verbatim. Final inspections are capped at two
under D496: this initial read, then one fresh read after fixes. Claude's post-reset code/scenario review remains owed.

## Snapshot, promise and authority

Repository worktree: `C:/Users/User/projects/Raptor/.claude/worktrees/codex-insights-mission-mix`.
App directory: its `raptor-port/`. Branch `codex/insights-mission-mix`, baseline refreshed planning
`5f9bf9781874f7ee8dcaf69ebe1b532606e851a7`; owner design approval commit `7ea067e12176bdbfb9dbd202e1244e469286368b`.
Source changes are uncommitted; inspect the complete diff against the planning baseline, not just HEAD.
Frozen source/dist SHA256: `docs/img/insights-build-freeze-3.json`. Production preview 4199.
No app source or dist changes are permitted during this read without notifying the inspector and invalidating its snapshot.

Implement ONLY [INSIGHTS-MISSION-MIX] with [INSIGHTS-BOARD-DOOR]: one formation role; exact DS/RED/RED AIR automatically
Red; conditional bounded cues ask without guessing after a qualifying own edit; save text first; preserve typing
node/range and Later; answers separate from signed content, immediate issued Insights with actor/history/Undo;
published and working contexts distinct; tracking default Off; unchanged totals/standby/work-hours; twelve/Show all.
The owner approved the final look under D532 before source changes. Do not restart product questions or plan reviews.
No main push, merge, merging PR or unrelated feature. No numeric source-file ceiling or tidying verbatim engine bodies.

Read HANDOFF then AGENTS and the complete required rule documents, project guide and relevant full guide headings.
Open full D512–D532 rows in `.claude/decisions-full/scheduler.md`; applicable general/area rulings in their full homes.
Read complete `docs/codex-review-workflow.md`, `docs/bug-check-order.md`, `docs/superpowers/specs/2026-10-03-insights-mission-mix.md`,
`docs/superpowers/plans/2026-10-03-insights-mission-mix-build-plan-revised.md`, revised-plan review and Opus review including §7.
Binding revised-plan SHA256 `A51541CA5557914E37989A6F445BD828D1FDDE2ADBFD0930E557234DE4B99DBD`; original plan/earlier reads frozen.
Contracts: data-schema, data-model, undo-contract, ui-contracts, architecture-direction, feature-impact, remarks-vocabulary.
The current own HANDOFF/contracts/evidence closing status is being updated; stale IN PROGRESS prose is not app proof.

## Finder brief — verbatim standing instruction

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
of actions. Assume every existing line may be correct and the defect may be a MISSING call site. For each item,
state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
least-shared or most specialised surface.

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
Do not report a problem whose harm exists only in data already stored when the code is already correct going forward
— no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to NEW data,
report it: that is a real finding and this exclusion does not touch it.

A finding needs a concrete failure (or broken ruling), causing code/missing call site and exact step-by-step smallest
safe fix. Separate defects, evidence gaps and nonblocking tidiness notes. Explicitly state inspected negatives.
For changed non-engine lines apply approved D489: new responsibility in a busy file; feature-only branch in shared
flow; duplicate helper. No size numbers, no unsolicited refactoring during inspection. Component separation is judged
by responsibility and real connection tests, as the owner reiterated today; do not manufacture a size target.

## Actual evidence and qualified routes

`docs/handpass/2026-10-03-insights-mission-mix.md` records FULL tier, roll-call, red-first fixes and S01–S33 results.
Independent scenario route map: `docs/superpowers/plans/2026-10-03-insights-build-coordination.md`.
Read actual tests and drivers rather than trusting counts. In particular: pure resolver/goldens and aggregate;
guarded command/history/global Undo; mounted App week/Board text writers; Logic and Board callbacks; two-store
template atomicity; persistence through real Whiteboard/Postman/MemoryBackend including boot/journal/wipe; central
forged-command guard; deep-cloned reader; stale same-key actor refusal; focus/selection and one-line wave-template silence.
Deliberately disconnecting editor, storage, actual Logic callback and both Board callbacks made their tests fail;
original wires restored before freeze. No assertion was weakened.

Running-app walk has completed, and every image was opened by its walker/host:
- `docs/img/insights-build-editing/freeze-2-editing-r3/result.json`: 20 phone/desktop route steps PASS, browser errors0;
  strict Board node/range and native keyboard contenteditable selection; both house separators; short heights;
  long-day 4× CPU, exactly eight intended text commands and zero idle commands; On/Off DOM growth zero.
- Phone desktop-button cascade defect found while opening these pictures, red-first browser regression then CSS
  specificity fix. Freeze3 `freeze-3-phone/result.json`: 10 affected phone steps PASS, errors0; all14 pictures opened.
  New `e2e/insights.spec.ts` tests desktop visibility/phone invisibility plus actual role/overflow routes; 2/0 fixed.
  Only phone CSS changed between freeze2 and3; shared functional and desktop evidence retain their qualified scope.
- `docs/img/insights-build-publication/freeze-1-publication-r3/result.json`: non-publication plan/template/off-week Undo/
  Logic/member routes PASS10; early publication failures retained and corrected as driver assumptions.
- `freeze-1-publication-r4/result.json` and `freeze-2-publication/result.json`: six publication/working scenarios PASS,
  issued A vs working B, annotation-only closure, immediate bars, normal AL/unpublish source, frozen historical refusal,
  stale same-label reissue event, older-version load. All three freeze2 pictures opened independently by coordinator.
- Earlier failures/interruption records retained. Chromium emulation does not prove physical iPhone/iOS keyboard.
- No general fresh-identity scheduler copy/import door exists: S20 applies actual day-template fresh identity;
  same-day row moves and plan duplicate preserve IDs. Wave template does not carry Remarks/seeds; its DS2 stays unanswered.
- Guest app exposes issued schedule only under D204, no existing Insights opener. No new guest door authorized.
  Shared guest aggregate/central read permission tested; guest UI opener N/A, never credited as a browser PASS.

First FULL gates `docs/handpass/insights-gates/`: unit7606/1 (read-only Logic input fixed, old assertions retained),
build PASS, tfin728/0, browser519/1/49skip (Leave War year-window rerun3/0 including both Insights), Tracker445/0,
rulecheck/docsize PASS, perf4/0 (fixed demo week5134≤5450 Board1024≤1150). Full final unit/browser/perf reruns running
sequentially under PC lock; do not launch heavy commands in parallel. Read logs as they finish.
Adapted five GREEN; audit24PASS/3FAIL. The SAME three audit failures reproduce on unchanged planning5f9 snapshot4200,
with both raw logs retained. They are limitations, not represented as clean gates or fixed as another feature.

Return PASS/REVISE with enumerated read coverage, concrete ranked findings, scenario coverage omissions, tidiness
notes and honest limits. Your code inspection is not a replacement for the running app or owed Claude review.
