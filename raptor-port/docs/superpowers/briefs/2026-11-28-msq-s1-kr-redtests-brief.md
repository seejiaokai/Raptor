# Section 1 (the guard rail), step KR — the red-first tests, written before U2 lands (chat A211, 28 Nov 26)

**You are a fresh Opus test writer.** Working copy `C:/Users/User/projects/Raptor/.claude/worktrees/a211-s1-kr-dd0560`,
branch `a211-s1`. Write tests only — **no change to any app source file**. Commit nothing, push nothing; the
orchestrator commits. Return your report as your final reply AND save it to
`raptor-port/docs/superpowers/briefs/2026-11-28-msq-s1-kr-redtests-report.md`.

## What KR is
His D2825 (27 Nov): the guard rail refuses nothing for open work. A pick of another squadron, the switch to or from the
member view, a bell line, the page door, the OIL card, an Undo that changes the squadron — go through; what is open
closes, half-typed work is dropped, NO note. Still standing: "Not saved" stops them until Retry (D2594); the Tracker's
own question about unsaved chart edits; show-only windows and edit modes close as before. Read the plan whole:
`raptor-port/docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md` — §0–§5, §8, and §12's head, where his
answers **D2836** (a window held since his midnight move closes at a pick), **D2837** (a holiday waiting for a leave
period is dropped at a switch — its new words come later, test only the drop), **D2838** (a box with no Save button is
saved into its OWN squadron first, then the switch goes through in the same press; if that save fails the switch is
stopped with "Not saved") win over any line of the plan that differs.

## What you write
1. **The new file `raptor-port/src/ui/msq-guard-drops.test.tsx`** — §8.1's D1–D8, by door and family as listed, with
   D2836–D2838 folded in (D3 is now D2838's: kept, saved into its own squadron, then switched; D5 covers that save
   failing). Use the existing world and helpers (`src/test-support/msq-world.ts`, `msq-guard-testkit.ts`, `withThird()`
   and the like — read `msq-guard-doors.test.tsx`, `-switch`, `-bell`, `-undo` for how presses are made). A new shared
   helper goes in a plain `.ts` file under `src/test-support/` (a `.tsx` of helpers draws lint findings; a file outside
   test-support that imports it must be a `*.test` file).
2. **R10** in `raptor-port/src/ui/msq-guard-rollcall.test.ts` — every `window`, `row` and `closes` row of `GUARD_ROWS`
   has a closer (`close`).

Test BEHAVIOUR through presses and what is stored/shown, not functions KR has yet to add — except R10, which reads the
table. Every test is about what he would see or what is saved.

## Red first, honestly
- Run the new file and R10 on today's code. List **every test that FAILS and why** (the refusal, the note, the window
  still open — the right reason) and **every test that PASSES on today's code** (Not saved cases, D2 should mostly pass
  already; say which, by name — a pass is not a fault, but it must be listed). A test that fails for a wrong reason (a
  helper missing, a typo) is fixed until it fails for the right one.
- Do not weaken a test to make it pass; do not change app code to make one fail.

## Off limits until chat S2's U2 lands
No change at all to `ui/UsersPanel.tsx`, `ui/topstate.ts`, `state/undo-wire.ts`, `undo/timeline.ts`,
`state/accounts.ts`, `state/perms.ts`, `state/notices.ts`, `state/acctlines.ts`, `state/units*.ts`,
`ui/useraccess-model.ts`, `ui/UserAccess.tsx`. Tests may PRESS the Admin → Users row and forms (they are D1 cases), but
mark each such test in your report: U2 changes that panel, so those tests are re-checked after it lands.

## Traps
- Run from `raptor-port/`: `npx vitest run src/ui/msq-guard-drops.test.tsx src/ui/msq-guard-rollcall.test.ts`. Never
  `npm run build`, never the full suite, never a browser test. Send long output to a file in your scratchpad and read it.
- Another helper (a planner) works in this copy on docs only — leave `raptor-port/docs/superpowers/plans/` alone.
- The guard's open file `msq-guard-open.test.tsx` is slow (~12 min) — do not run it.
- `npm run lint:changed` at the end: no new finding beyond the one known (`ui/UsersPanel.tsx`'s complexity).
- Every test name says the door, the family and the expected result after KR, and cites D2825 (and D2836–D2838 where
  they apply).

Finish with the executor footer (Status / Changes / Checks / Open items).
