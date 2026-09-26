# Brief — `[LEAVE-LATE-PUBLISHED]`: attack the plan (25 Sep 26, overnight, D181) — ONE round

You are an independent reviewer. You did not write this plan and you will not write the code. **Do not edit any file.**

## Read
- The plan: `raptor-port/docs/superpowers/plans/2026-09-25-late-published-plan.md`.
- The rulings: `.claude/rules/decisions/scheduler.md` (D177, D178, D179 first; then D44/D45, D98, D103, D109, D114,
  D174, D176), `.claude/rules/decisions/oil.md` (D48, D142), `.claude/rules/decisions/how-we-work.md` (D56, D67),
  `.claude/rules/raptor-executor.md`.
- The sweep: `raptor-port/docs/superpowers/specs/2026-09-25-published-face-live-inputs.md`.
- The code the plan names (under `raptor-port/src/`): `engine/publish.ts`, `engine/inputs.ts`, `engine/events.ts`,
  `engine/avail.ts`, `engine/validate.ts` (`validate`, `officialDiverges`, `withIssuedWeek`, `withOfficialWarn`),
  `engine/weekctx.ts`, `engine/world.ts`, `ui/html.ts` (`withDaySnap`, `withChipWorld`, `dayIssuedHTML`, `viewDayHTML`),
  `ui/board.ts`, `ui/board-html.ts`, `ui/pendlist.ts`, `state/sched-commit.ts` (the deferred reflow),
  `state/store.ts` (HOOKS wiring), `engine/drafts.ts` (the load).

## Your job — one round, capped
Where does the plan misread a ruling? Where does it miss a reader, a writer, a surface or a door? Where does it pick an
approach that breaks something that works today (undo of a publish, Unpublish, the load, plans, a week switch, a
reload, the cross-week seeds, the OIL pass, performance on a phone)? Where can a count, the four sign-offs, the
published face and the pending list disagree? And where will the frozen-warnings layer read pending with nothing
changed (noise), or stay silent when something changed?

Specifically weigh the two freezes:
- `snap.inp` + `inputsOn(dt)`, installed in `withDaySnap` (issued versions) and `withIssuedWeek`.
- `snap.w` + the FACE bundle + `warnDelta`, the validator run at issue through a hook, and the choice to keep it out
  of `officialDiverges`.

**What is NOT a finding (owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored
when the code is already correct going forward** — no migration, no back-compat, no "an existing record would read
wrongly". If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not
touch it.

## Hand back
- Findings ranked by consequence, each with **exact, step-by-step fix instructions** (file, function, what to change).
- **Explicit negatives:** what you checked in the plan and found sound, by name.
- Plain English; tight.
