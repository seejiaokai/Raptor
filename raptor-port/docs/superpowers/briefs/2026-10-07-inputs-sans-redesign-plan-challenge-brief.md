# Brief — challenge the build plan for the Inputs calendar and the SANS availability calendar — one round, independent

Written 7 Oct 26 by the host (Opus 5.5), who also wrote the plan — so you are not its writer (D67, D590). You are ONE
of two readers (Astra, Sol 6.1). Read alone: do not look for, open or rely on the other reader's report
(`2026-10-07-inputs-sans-redesign-plan-challenge-astra.md` / `…-sol.md`). **Read-only: change no file, run no test,
build nothing, start no server.** Your whole output is your report.

## What you are reading

A plan, before any app code changes. Nothing in it is built.

- **The plan:** `raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` — all of it. Its §9 says
  what to attack, in order of worth; this brief adds what to read and how to report.

Read these whole before judging it (none of this loads for you by itself):

- **The design he approved and every answer he gave:** `raptor-port/docs/superpowers/specs/2026-10-07-inputs-sans-redesign.md`.
- **His rulings, FULL rows** (a short line is the rule; his words, its conditions and the readings he was told are only
  in the full row): `grep -h '^| D6[1-4][0-9] |' .claude/decisions-full/*.md` (D617–D641) and
  `grep -h '^| D5[67][0-9] \|^| D58[0-5] ' .claude/decisions-full/*.md` (D567–D585, Codex's build of 5 Oct 26 —
  D569–D572, D577 and D581 still stand; D580's "build on your recommendations" does not run now).
- **The area rulings the change touches**, with their settled decisions and architecture: `.claude/rules/decisions/scheduler.md`,
  `.claude/rules/decisions/leave-war.md` (its §Architecture — "four seams, and only four" — is what the plan's §3.1 leans
  on), `.claude/rules/decisions/oil.md` (a public holiday earns OIL, an Off day does not — nothing here may move that),
  `.claude/rules/decisions/people-accounts.md` (who may do what), `.claude/rules/decisions/how-we-work.md`.
- **The rules every build follows:** `raptor-port/CLAUDE.md` (§Architecture rules — the command layer, the mutation and
  persistence funnels), `.claude/rules/raptor-executor.md`, `raptor-port/docs/undo-contract.md`,
  `raptor-port/docs/performance.md` §E (the Leave War grid), `raptor-port/docs/feature-impact.md`
  (§1 the surfaces, Flow B — an input added or edited, and its closing section on the calendars).
- **The code the plan's §2 describes** — check its claims against the live files, do not take them from the plan:
  `raptor-port/src/state/sans-calendar.ts`, `src/state/people-settings-commit.ts`, `src/state/perms.ts`,
  `src/state/undo-wire.ts`, `src/state/view.ts`, `src/ui/InputsCal.tsx`, `src/ui/InputsPage.tsx`,
  `src/ui/SansCalendarControls.tsx`, `src/ui/inputedit.tsx`, `src/engine/inputs.ts` (the late rule, ~l.755–818),
  `src/engine/rules.ts`, `src/state/changelines.ts`; and in `src/leavewar/`: `sync.ts`, `state/store.ts` (the State,
  `setDayEvent` ~l.3239, `persistNotify`, `lwRegisterCommands`, the manning-rule writers ~l.3869–4010), `state/rows.ts`,
  `engine/period.ts`, `engine/wars.ts`, `engine/eventdefs.ts`, `engine/requirements.ts`, `engine/availability.ts`,
  `engine/evaluate.ts`, `ui/Matrix.tsx` (the table's tbody order ~l.3769–3859, the verdict memo ~l.719), `ui/EventRows.tsx`,
  `ui/CountRows.tsx`, `ui/select.ts`, `ui/Sheet.tsx`, `ui/SelectSheet.tsx`, `ui/CounterForm.tsx`.

## What to find

The plan's §9, items 1 to 6 — and, **Astra only, item 7** (the D138 read of the short lines against their full rows).
Above all read for ABSENCE: the failure this project has had most often is a surface nobody wired up, which no reading
of the code that IS there can find. For each of these, say what the plan leaves out:

- every place the app draws a day, an input, a count of who is available, or a late mark;
- every door that makes or changes an input;
- every ruling of D569–D641 whose rule has no home in the plan's §3;
- every existing rule the design would quietly break (search the area files' "Settled before this list" sections and
  `raptor-port/docs/ui-contracts.md` for the Inputs page, the calendar, the Leave War grid, its sheets and its drag).

## What is NOT a finding

- A matter of taste, or another way to build the same thing with no failure shown.
- A claim with no concrete case. A finding needs: where in the plan · the concrete situation in which it fails (the
  presses, the data, the result) · why · **the exact change to the plan that fixes it** (D489) — exact enough that the
  builder can apply it without asking you what you meant.
- A problem that lives only in data already stored (D56). The `sansday:` rows of Codex's build never left this branch.
- Anything the plan's §8 already puts to the owner — unless you think the recommended answer is wrong; then say why.
- A product choice the owner has already ruled (name the ruling if you think the plan misreads it — THAT is a finding).

## Your report

- First line: **PASS** or **CHANGES REQUIRED**.
- Findings numbered, most serious first; each: where · the concrete failure · why · the exact fix.
- Then, briefly: what you checked and found sound (so the builder knows what was covered), and what you could not check.
- Say plainly that you changed nothing, ran nothing, and did not read the other reader's report.
- Write for a builder: file names and line numbers are welcome. Plain sentences; no padding.
