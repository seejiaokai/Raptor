# Final-read brief — [WARN-HIDE-KEPT] hidden warnings (D469, D471, D472, D475) — the FULL check — 1 Oct 26

You are the independent reader of the FINISHED code (bug-check order §4 rank 2, §4a). Work READ-ONLY (the one file you may
write is your own report, named at the foot). You did not build this. Another reviewer is reading it at the same time;
you will not see their report and must not look for it.

**What was built:** branch `claude/warn-hide-kept` against `main` — `git diff main...HEAD -- raptor-port/src raptor-port/e2e`
(the engine: `engine/validate.ts`, `engine/publish.ts`, `engine/warnhide.ts`, `engine/hidedetail.ts`, `engine/markcheck.ts`,
`engine/weekctx.ts`, `engine/drafts.ts`, `engine/insights.ts`, `engine/hooks.ts`, `engine/canonical.ts`, `engine/schema.ts`;
the state: `state/view.ts`, `state/store.ts`, `state/sched-commit.ts`, `state/changelines.ts`, `state/dropflag.ts`; the
screens: `ui/html.ts`, `ui/board.ts`, `ui/interactions.ts`, `ui/pendlist.ts`, `ui/peek.ts`, `ui/Modals.tsx`,
`ui/SchedBoard.tsx`, `ui/scheduler.css`; `undo/describe.ts`; the tests, incl. `src/testing/marks-guard.ts`).
**What it promises:** the plan `raptor-port/docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md` (v2), the register
`raptor-port/docs/superpowers/specs/2026-10-01-warn-hide-behaviour-register.md` (WH1–WH13), the screen contract
`raptor-port/docs/ui-contracts.md` §Muting a check ("Hide a specific warning"), the picture he approved
`raptor-port/docs/mock/warn-hide.html`.
**The evidence so far — read it; it is the roll-call you check for ABSENCES:**
`raptor-port/docs/handpass/2026-10-01-warn-hide-check.md` (the eight questions, the roll-call of every reader, the walk's
table and what it found, the break tests, what was NOT walked), the plan's red team and its dispositions
(`raptor-port/docs/superpowers/briefs/2026-10-01-warn-hide-kept-dispositions-r1.md`), and the scenario design
(`…-scenarios-astra.md`).
**The owner's rulings**, from the live files: `.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/how-we-work.md`
(one line each) and the full rows in `.claude/decisions-full/` — `grep -h '^| D469 |' .claude/decisions-full/*.md` (D469,
D471, D472, D475; D45, D97, D98, D99, D101, D103, D148, D168, D179, D183–D185, D187, D188, D346, D363; D56). Also
`.claude/rules/raptor-executor.md`, `raptor-port/CLAUDE.md` §Architecture rules, `raptor-port/docs/bug-check-order.md` §2b, §4.

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

Read for WRONG lines and for MISSING ones. In particular:
1. **The engine.** `validateCore`'s marks and traces (every site names its warning's code; the two cross-week traces);
   `shownOf` (the copy, the replay, `fz` / `lv`, `all`, the trace rule); `validate()` — what is `WARN`, `workingWarn()`,
   `rawWarn()`, `OFFICIAL`; `faceWarn` (the base, the per-day overlay under `w.wo`, `w.shown`, the memo's key);
   `versionFaceWarn`; `HOOKS.issuedWarn` / `hideNow`; `withIssuedWeek` and `snapGlobals` / `restoreGlobals`
   (is anything left pointing at the wrong bundle after a swap or a throw?); `restIfPlaced` / `crossDayIfPlaced` on the raw
   pass. Find an input for which a puck keeps the flag of a hidden warning, loses the flag of a shown one, or for which
   nothing hidden does NOT give back the raw bundle.
2. **The published record.** `hidePending` / `hideDelta` in BOTH `dayDelta` and `dayPendingItemsIn`; `pendingKey` and the
   sign-offs; `alIssue`'s `diff` / `units` / `ukinds`; `dayDiscardCount(di, toVer)` and its three callers (the pending hides the load
   will undo — changed after the walk); the To go out line's tap (`warnline:` → `interactions.ts jumpToWarnLine`); the load
   (`drafts.ts loadVersionToWorkingCopy` → `HOOKS.setDayHides`) and its save; Unpublish; `retiredEntry` /
   `issuedFromRetired`; a version issued with hides read back from storage (`weekrows.ts`, `persist.ts`). Find an order of
   actions after which a published face shows or hides a flag it did not go out with while nothing is pending, a hide is
   counted twice or not at all, or two counts of pending disagree.
3. **Saved state.** `initStore` (the read-back before the baseline), `loadWeek`, `resetSession`, `histSnap` /
   `histRestore`, the `sched.mutes` record's write and restore (`sched-commit.ts`), `weekStashSnap`, the week stash and a
   second week, Undo / Redo and D148. Find an order after which a saved hide is lost, doubled, attached to the wrong day
   or week, or written outside a command. Is `toggleWarnOff`'s `validate()` (inside a command) safe on every path?
4. **Every reader** (the evidence sheet's roll-call; `html.ts exemptLineOwn` — the exempt flying seat, now one body
   for the week and the board, changed after the walk): a count, colour, list, flag or message that still reads the RAW list
   or the WORKING set where it must read the shown bundle or the version's own `off` — and the reverse (an engine probe
   that must see a hidden breach). Is a reader missing from the roll-call altogether?
5. **The tests.** A test that passes for the wrong reason; a fixture that replaces where the app mutates; the marks guard
   (`src/testing/marks-guard.ts`, `engine/markcheck.ts`) — can a mis-filed mark get past it? Is any behaviour of the
   register (WH1–WH13) named by a test that does not actually assert it?
6. **Anything the walk could not see** (the sheet's "what was NOT walked") that the code gets wrong.

**And this, in the same breath — WHAT IS NOT A FINDING (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

## How to report
- Each finding: a short title; severity (BLOCK / HIGH / MEDIUM / LOW); the concrete scenario (setup, action, expected,
  what would be observed); the code evidence (file, function, line); whether it is NEW with this branch or already on
  `main` (compare — `git show main:<path>`); and **exact, step-by-step fix instructions** — not a direction.
- **Explicit negatives:** for each of the six areas, what you checked and found sound.
- A verdict: APPROVE / REVISE / BLOCK, and the three findings that matter most.
