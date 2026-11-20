# Red team of the multi-squadron build's batch plan — the brief (chat 106, 17 Nov 26)

The owner's call (chat 106): Astra (Codex) and a fresh, blind Fable reader, blind to each other, one brief. READ ONLY:
change no file except your own report, commit nothing. Write your whole report to the path you are given.

## What you are reading

A BUILD PLAN, not code: `raptor-port/docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` — how the agreed
two-squadron and detachment design is built in five batches, with batch 1 (the squadrons foundation) planned in
detail, its architecture included. The design itself is settled by the owner's rulings and is NOT under review: do
not re-argue a ruling. Under review: the ORDER of the batches, whether each batch is complete and correctly cut
(nothing agreed lost between batches, nothing live half-working), and above all **batch 1's architecture** (§3.4) —
will it work in this code, and what will break.

Read:
1. The plan, whole.
2. The agreed design: `.claude/rules/decisions/scheduler.md` §Not built yet (lines ~159–220) and
   `.claude/rules/decisions/people-accounts.md` §Many squadrons; the design note
   `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md` by section (§Round 7 above all).
   A ruling's full row: `grep -h '^| D2132 |' .claude/decisions-full/*.md` (the shell).
3. The architecture rules: `raptor-port/CLAUDE.md` §Architecture rules; `raptor-port/docs/undo-contract.md` (§5);
   `raptor-port/docs/data-schema.md`, `data-model.md` (§11 permissions, §Squadrons); the Leave War's seams
   `.claude/rules/seams/leave-war.md`; the Tracker's `.claude/rules/seams/tracker.md`.
4. The code, as the plan's claims need: `raptor-port/src/storage/` (backend.ts, tables.ts, browser.ts),
   `src/state/persist.ts`, `src/state/seeds.ts`, `src/boot.ts`, `src/state/perms.ts`, `src/state/accounts.ts`,
   `src/state/auth.ts`, `src/engine/hooks.ts`, `src/engine/rules.ts` (VCONF), `src/engine/weeks-data.ts`,
   `src/command/`, `src/ui/AdminPage.tsx`, `src/ui/UsersPanel.tsx`, `src/ui/icons.tsx` (TalonMark), `src/ui/Shell.tsx`,
   `src/leavewar/state/raptorRoster.ts`, `src/leavewar/sync.ts`, `src/tracker/peoplewire.ts`. Never read a file over
   ~300 lines whole — grep it, read slices.

## What to report

- Every finding: a concrete failure (who does what, what goes wrong on screen or in saved data), its cause in the
  plan or the code, and its exact fix to the plan. A claim without all three is not a finding (D489).
- Severity HIGH / MEDIUM / LOW. HIGH: the batch-1 architecture would lose data, leak one squadron's people or rights to
  the other, break OIL, or need rebuilding in a later batch; or the order makes a batch go live half-working.
- Also: anything agreed that no batch builds; anything a batch claims that contradicts a ruling; a cheaper or safer
  architecture for batch 1 if you see one, with its cost.
- **Not a finding (D56):** a problem living only in data already stored — the whole store is demo data, and the plan
  clears it once. **Not a finding:** a scheduler who is not an admin (D785).
- Keep it under ~2,000 words; most important first.
