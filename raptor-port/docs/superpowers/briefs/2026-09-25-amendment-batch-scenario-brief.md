# Brief — the amendment batch: design the scenarios, attack the plan (25 Sep 26)

You are an independent reviewer. You did not write this plan and you will not write the code. **Do not edit any file.**
Read the LIVE files by path (they are the source of truth; a ruling made while you read reaches you through them).

## Read first
- The batch: `raptor-port/docs/superpowers/specs/2026-09-25-amendment-batch.md` (14 items, each a recorded ruling).
- The plan to attack: `raptor-port/docs/superpowers/plans/2026-09-25-amendment-batch-plan.md`.
- The rulings: `.claude/rules/decisions/scheduler.md` (D91–D111 are this batch; D44, D45, D103 matter most for money),
  `.claude/rules/decisions/oil.md`, `.claude/rules/decisions/how-we-work.md` (D56, D67), `.claude/rules/raptor-executor.md`.
- The register every amendment rule lives in: `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`.
- How this project bug-checks: `raptor-port/docs/bug-check-order.md` (§4, §6, §7).
- The code the plan touches (under `raptor-port/src/`): `engine/publish.ts`, `engine/canonical.ts`, `engine/restore.ts`
  (`dayKeys`, the address grammar), `engine/drafts.ts` (`loadVersionToWorkingCopy`), `engine/slots.ts`
  (`reconcileDayFiling`), `engine/daytpl.ts` (`applyDayTpl`), `engine/editlog.ts`, `ui/html.ts` (`dayStatHTML`,
  `verTagHTML`, `nysMarkHTML`, `signoffHTML`, `dayInfoHTML`, `withDaySnap`), `ui/board.ts` (`boardSignHTML`,
  `switchDraft`, `dayTplMenu`), `ui/board-html.ts` (the board's `puck(…)` calls), `ui/interactions.ts`
  (`jumpToChange`, the Load handler), `ui/histbubble.ts`, `ui/HistoryModal.tsx`, `ui/ALPanel.tsx`, `ui/SchedBoard.tsx`,
  `ui/scheduler.css` (the `[data-alc]` / `[data-aln]` / `.verchip` / `.schedboard` / `.histbub` rules).

## Your two jobs

**1. Design the test scenarios.** Do not merely review the changed code. Starting from the user promise and the
applicable rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream consumer,
role, overlay and meaningful order of actions. **Assume every existing line may be correct and the defect may be a
MISSING call site.** For each item, state where the visible sign and the working gesture should exist in the production
app. Then rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove
correctness. Start with the least-shared or most specialised surface.

**2. Attack the plan.** Where does it misread a ruling, miss a surface / reader / door / role, pick an approach that
will break something that works today, or leave a count, a signature or a published face able to disagree with
another? Especially: item 14's pairing algorithm against his words in D109 (and the GAP call it makes); item 7's new
signature axis against AM11 (putting a change back restores the four), plans (each plan carries its own sign-offs,
AM12), Unpublish, Undo, and the D45 → D103 replacement; item 6 against Fable's earlier warning (a general reconcile
turned a deliberate removal into a fresh input on a plan switch); item 3 against AM5 (the view page must never show
working-copy state); item 12 on a phone.

**What is NOT a finding (owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored
when the code is already correct going forward** — no migration, no back-compat, no "an existing record would read
wrongly". If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not
touch it.

## What to hand back
- Scenarios: ranked, each with setup / action / expected / the observation that would disprove it; the surface it runs
  on (edit week, board, View-only Sched; desktop, phone).
- Plan findings: ranked by consequence; each with **exact, step-by-step fix instructions** (file, function, what to
  change) — not a direction.
- **Explicit negatives:** what you checked and found nothing wrong with, by name.
- Plain English; keep it tight — no restating the plan back.
</content>
</invoke>
<invoke name="Bash">
<parameter name="command">cd /c/Users/User/projects/Raptor && git add raptor-port/docs/superpowers/plans/2026-09-25-amendment-batch-plan.md raptor-port/docs/superpowers/briefs/2026-09-25-amendment-batch-scenario-brief.md && git commit -q -m "amendment batch: the build plan and the scenario brief for Fable and Astra (D112)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && git log --oneline -1 && which codex && codex --version 2>/dev/null | head -1