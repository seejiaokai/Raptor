# Final-read brief — `[HIST-PHONE-HIDE]` + `[CHG-BY-ITEM]`, the finished code (28 Sep 26)

You are reading FINISHED CODE for a React/TypeScript scheduling app, which you did not write. The worktree is
`C:\Users\User\projects\Raptor-hist` (branch `claude/hist-phone-by-item`), the app in `raptor-port/`. Read-only: change
nothing, run nothing that writes. (You may run the unit tests of one file if it helps: `npx vitest run <file>` from
`raptor-port/` — it writes nothing.)

**What changed:** `git diff c50b4736..HEAD` (from `main` at PR #453). The plan and what the plan's red team changed:
`raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md` (§9). **The evidence sheet — the roll-call,
the doors, the walk, the break tests, what was not walked:** `raptor-port/docs/handpass/2026-09-28-hist-phone-by-item.md`.
The owner's rulings: `.claude/rules/decisions/scheduler.md` rows D339, D340, D344, D345 (the approved design) and the
standing ones the sheet lists in §2; `.claude/rules/decisions/how-we-work.md` D56, D90, D201. The approved mock-ups:
`raptor-port/docs/img/handpass/2026-09-28-draft-pending/histphone/histphone-mockup.png`, `…/byitem/byitem-mockup.png`.
The rules for building here (Codex loads none of this by itself): `.claude/rules/raptor-executor.md`,
`raptor-port/docs/bug-check-order.md`. The contract: `raptor-port/docs/ui-contracts.md` §The one changes window and
§History on the board.

**Your job — find what is WRONG and what is MISSING.** Do not merely review the changed code. Starting from the user
promise and the applicable rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
consumer, role, overlay and meaningful order of actions. **Assume every existing line may be correct and the defect may
be a MISSING call site.** For each item, state where the visible sign and the working gesture should exist in the
production app. Then rank concrete failure scenarios with setup, action, expected result, and the observation that would
disprove correctness. Start with the least-shared or most specialised surface. **Check the roll-call in the sheet (§3)
for gaps** — a row missing, a "MUST NOT" that the code does not actually enforce, a surface the walk never reached.

Specifically:
1. `src/ui/changesmodel.ts` (`itemOf`, `entriesOf`, `byItem`, `whoEntry`): every key and keyless kind the history can hold
   — a wrong item, a wrong title (live vs frozen), a wrong day, a move's entries and their jumps, the counts.
2. `src/ui/histbubble.ts` (`storyOf`, `refreshHistDots`, `cellOf`, `findHistCell`, `keyOf`): a cell dotted with no
   bubble, a bubble with no dot, a stale dot, a dot in a look, the input rows by day, the wave title, the cost.
3. `src/ui/ChangesWindow.tsx`, `src/ui/scheduler.css`: Hide / Show / the hint / the bar (its words, place, layer), the
   groups and folds, the item and Who views — both widths; the dot's paint beside every other mark.
4. `src/state/changelines.ts`: the two writer changes (a posting line; a roster add) — does anything else read `sect` /
   `sub` / `fld` and now read them wrongly?

**What is NOT a finding (the owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when
the code is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly".
If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**Your report:** findings ranked most severe first, each with an id, a severity, the evidence (file and line), the
concrete scenario, and **exact, step-by-step fix instructions**. Then **explicit negatives** — what you checked and found
sound. Plain words where you can; the owner does not read code.
