# Brief — `[LEAVE-LATE-PUBLISHED]`: read the finished code (26 Sep 26, overnight, D181) — FULL tier, both providers, blind

You are an independent reviewer. You did not write this code. **Do not edit any file.** Read the LIVE files.

## What was built, and the evidence in hand
- The rulings: `.claude/rules/decisions/scheduler.md` D177, D178, D179 (and D44/D45, D98, D103, D109/D114, D174/D176),
  `.claude/rules/decisions/oil.md` (D48, D142), `.claude/rules/decisions/how-we-work.md` (D56, D67),
  `.claude/rules/raptor-executor.md`.
- The plan: `raptor-port/docs/superpowers/plans/2026-09-25-late-published-plan.md` — and what changed from it after the
  plan reads: `raptor-port/docs/handpass/2026-09-26-late-pub.md` §8.
- **The evidence sheet, with the roll-call and the walk: `raptor-port/docs/handpass/2026-09-26-late-pub.md`** (read §3 —
  the roll-call — and look for rows that are wrong or MISSING).
- The rule as written for the next reader: `raptor-port/docs/engine-rules.md` §Publishing, "A PUBLISHED DAY KEEPS WHAT IT
  WENT OUT WITH".
- The diff: `git diff 5f4496a3..HEAD -- raptor-port/src` (branch `claude/leave-late-published`). The heart of it:
  `src/engine/inputs.ts` (`inputsOn`, `withFrozenInputs`, `inpDetailKey`, `frozenInputMatch`), `src/engine/publish.ts`
  (`daySnap`, `dayInputsFrozen`, `inputAxes`, `dayPendingItemsIn`'s folding, `freezeWarn`, `warnSliceKey`, `warnDelta`,
  `dayDeltaCore`), `src/engine/validate.ts` (`faceWarn`, `LIVE_ON_FACE`, `warnSliceOf`, `withIssuedWeek`, `officialDiverges`,
  the HOOKS registration), `src/engine/events.ts` (`inpShow`, the readers, `shiftHardGround`), `src/engine/avail.ts`,
  `src/engine/weekctx.ts` (`windowInputs`, `windowDiverges`), `src/engine/oilev.ts` (`oilMovedInputsOnly`),
  `src/ui/html.ts` (`withDaySnap`, `srcInput`), `src/ui/board.ts`, `src/ui/board-html.ts`, `src/ui/pendlist.ts`,
  `src/ui/ALPanel.tsx`; tests `src/ui/latepub.test.tsx`, `src/engine/official-flags.test.ts`.

## Your job
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

Especially, look for:
- a reader of a published day's inputs or warnings that still reads the live world (the roll-call's gaps);
- a way the count, the four sign-offs, the pending list and the published face can disagree;
- a pending item that appears with nothing changed (noise: repeated validates, a reload, a week switch, a plan switch, a
  publish of the neighbour day, undo / redo, the load, Unpublish) or no item when something did change;
- the one-act-one-item folding going wrong (two items for one act, or one act's item swallowing an unrelated change);
- anything that breaks what worked before (the OIL pass, the cross-week seeds, performance on a phone — the official pass
  now runs whenever a published day's inputs changed; the extra validator run at issue).

**What is NOT a finding (owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored
when the code is already correct going forward** — no migration, no back-compat, no "an existing record would read
wrongly". If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not
touch it.

## Hand back
- Findings ranked by consequence, each with setup / action / expected / what you observed or would observe, and
  **exact, step-by-step fix instructions** (file, function, what to change).
- **Explicit negatives:** what you checked and found sound, by name.
- Plain English; tight.
