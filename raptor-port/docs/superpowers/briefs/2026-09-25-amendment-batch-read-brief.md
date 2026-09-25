# Brief — read the amendment batch's code, blind, with the evidence sheet in hand (25 Sep 26, FULL tier)

You are an independent reviewer. You did not write this code. **Do not edit any file, and run nothing that changes
anything** (reading, grepping and running the unit tests is fine). Another reviewer reads the same code independently;
do not look for or read their report (any file named `*read*` under `raptor-port/docs/handpass/` other than your own).

## What to read
- The change: `git diff 301a11fc..HEAD -- raptor-port/src raptor-port/e2e` on branch `claude/amendment-batch` (the batch
  sits on `main` at `301a11fc`). Every commit message explains its part.
- What it was meant to do: `raptor-port/docs/superpowers/specs/2026-09-25-amendment-batch.md` (14 items, rulings
  D91–D111 in `.claude/rules/decisions/scheduler.md`), the plan `raptor-port/docs/superpowers/plans/2026-09-25-amendment-batch-plan.md`,
  and the register `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` (AM6, AM13, AM19,
  AM22–AM24 changed; AM53–AM59 new).
- **The evidence sheet — read it first:** `raptor-port/docs/handpass/2026-09-25-amendment-batch.md` — the rules sweep,
  the scenario round's findings and how each was disposed, what the full unit run found, the walk (the three walkers'
  reports are under `raptor-port/docs/handpass/parts/2026-09-25-amendment-batch-b*.md`), and what was NOT walked.
- The rules files a Codex session does not load by itself: `.claude/rules/decisions/scheduler.md`, `oil.md`,
  `how-we-work.md` (D56, D67), `.claude/rules/raptor-executor.md`.

## Your job
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
least-shared or most specialised surface. Use the evidence sheet's roll-call to look for ABSENCES: a surface, a
reader, a door, an order it does not mention.

Weigh hardest what moves the published record or who must sign: the signature binding (`publish.ts currentBind`,
`pendingKey`, `signBoundOk`), the counting body (`canonical.ts canonicalUnits`, `publish.ts dayPendingItems`), the
load's filing restore (`publish.ts filingRestorePlan`, `drafts.ts loadVersionToWorkingCopy`), the Original's signers
(`setDayApproved`, `verSigners`, `retireIssued`), the per-paint memo (`publishReadPass` — can it ever serve a stale
answer?), and the template refusal (`daytpl.ts`, `board.ts`).

**What is NOT a finding (owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when
the code is already correct going forward** — no migration, no back-compat, no "an existing record would read
wrongly". If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not
touch it.

## What to hand back
- Findings ranked by consequence, each with the scenario that shows it and **exact, step-by-step fix instructions**
  (file, function, what to change) — not a direction. Say for each whether it is NEW in this batch or was already on
  `main` (compare against `301a11fc`).
- **Explicit negatives:** what you checked and found right, by name.
- Plain English, tight.
