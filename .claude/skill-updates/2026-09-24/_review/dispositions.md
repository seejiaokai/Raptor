# Skill review, 24 Sep 26 — every OPEN observation's disposition

The log: `.claude/skill-observations/log.md` — 46 `### Observation` headers, 46 `**Status:**` lines (the
reconciliation guard holds); 44 OPEN, #194 and #228 already ACTIONED today. How this repo runs a review:
`.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo (lessons land in the skills, not in the
always-loaded files; plugin-skill lessons go to the machine-local memory notes, as the 23 Sep 26 review did;
a lesson already written where it belongs is closed as reflected). Drafts sit beside this file at the live
files' relative paths (`_docs/` = the repo's project docs, `_notes/` = `.claude/skills/*.md`); the whole change
set, live → draft, is `diff.patch`. **Nothing under `.claude/skills/`, `raptor-port/docs/` or the memory
folder is changed until he approves.**

**Also found (not an observation): two rulings whose named home never carried them.** D16 (a long hand-test
pass is fanned out across parallel helpers) and D17 (drive the app with a scripted real browser from the start)
both name `raptor-port/docs/bug-check-order.md` (§4 and §7.2) as where they live; `git log -S` shows no commit
ever wrote either there. Group 1 writes them in, beside the lessons that build on them (#211, #213, #214).

The table is read by the install script: one row per observation, `ACTIONED` / `OPEN` / `DECLINED`, the group
he approves it under, and what the status line will say.

| # | Disposition | Group | Where it lands / why |
|---|---|---|---|
| 42 | ACTIONED | 10 | filed as backlog item `[BG-CWD-GUARD]` in OUTSTANDING.md — a structural fix (a hook or a root script), not a guide change; the 23 Sep review left it open for that reason |
| 120 | OPEN | — | stays open on D73's condition: write the "whole app as a tab" guide only if a third app is brought in |
| 122 | OPEN | — | as #120 (D73) |
| 191 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §6 (a new floating surface: every surface it opens over, and an elementFromPoint test on each) |
| 192 | ACTIONED | 4 | verification-before-completion: Common Failures row "removed everywhere" (sweep for what identifies; name what the sweep cannot read) |
| 193 | ACTIONED | 4 | verification-before-completion: Common Failures row "clean / nothing found" (the verdict states its scope) |
| 195 | ACTIONED | 2 | systematic-debugging: the flaky-check questions (a test's leftovers can be the product's bug) |
| 196 | ACTIONED | 5 | session-handoff Step 3 (condense this chat's own scaffolding, its own docs-only commit — D69) |
| 197 | ACTIONED | 5 | session-handoff Rule 9 (the opening line is sendable unchanged — no choice slot inside it) |
| 198 | ACTIONED | 4 | verification-before-completion "Long check runs": a gate chained into a commit (its pipe-eats-the-verdict half was already in the Common Failures row and raptor-port/CLAUDE.md §Token discipline) |
| 199 | ACTIONED | 2 | systematic-debugging/condition-based-waiting.md "Before you pace a test" (replay at human pace first) + a pointer in the SKILL.md flaky questions |
| 200 | ACTIONED | 2 | systematic-debugging/condition-based-waiting.md "Before you pace a test" (make the CI's slowness reproducible; prove the fix at it) |
| 201 | ACTIONED | 2 | systematic-debugging/condition-based-waiting.md Common Mistakes (waiting on a proxy) |
| 202 | ACTIONED | 2 | systematic-debugging/condition-based-waiting.md Common Mistakes (a symmetric empty read is a false pass) |
| 203 | ACTIONED | 2 | systematic-debugging Phase 1 step 3 (a fresh checkout inherits the machine's defaults) |
| 204 | ACTIONED | H | already reflected: session-handoff Step 1 ("check `gh run list` first, and push the handoff only when no run is going", D151) |
| 205 | ACTIONED | 2 | systematic-debugging Phase 1 step 2 (a one-frame defect: sample per frame, pin in the same task); its test half in test-driven-development Verify RED |
| 206 | ACTIONED | 2 | systematic-debugging Red Flags (identical before and after: run the check that tells the two explanations apart first) |
| 207 | ACTIONED | 3 | test-driven-development Verify RED (a red-first test green on the old code: find the second cure in the scenario) |
| 208 | ACTIONED | 9 | machine-local memory: a new feedback note on writing setup steps he carries out himself |
| 209 | ACTIONED | 8 | raptor-port/docs/gates-and-deploy.md §The checks run on HIS PC (why the folder's permissions mattered: every local account, the tools' own included) |
| 210 | ACTIONED | 2 | systematic-debugging Phase 1 step 3 (a service cannot answer a prompt); the concrete fix is already in `.github/workflows/deploy.yml` |
| 211 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §7.2 (the driver moves the view with the surface's own gesture; a failed gesture is looked at on its picture first) |
| 212 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §6 (a wording ruling or a writer fix gets its own small roll-call; the fix shares one body) |
| 213 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §4, beside D16 (nobody rebuilds the build walkers are served; the host typechecks and unit-tests meanwhile) — its "one shared preview" half NOT applied: D16's recorded recipe gives each walker its own port, and only he can narrow that |
| 214 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §5 (the re-walk: walk scripts assert the right behaviour, re-walk into a second folder, read FAILs against the new flow) |
| 215 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §8 (a ruling's "as it is today" half is pinned by a test before the new half is built) |
| 216 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §7.2 (walk a SHORT screen too; measure every edge-docked control) |
| 217 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §5 (the surface's own suite after EACH fix round; a closed door's hints) |
| 218 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §7.8 (a gesture step asserts what the person sees) |
| 219 | ACTIONED | 3 | test-driven-development Verify RED (read the red; assert each case's premise; identify by id, not a count) |
| 220 | ACTIONED | 4 | verification-before-completion/browser-checks.md Measure, Don't Estimate (across a mode switch, measure after the first frame, relative to the moved view) |
| 221 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §7.9 (where engines deliver events differently, replay the other engine's sequence; name what only a real device proves) |
| 222 | ACTIONED | 8 | raptor-port/docs/gates-and-deploy.md §Now (an intermittent gate stop gets evidence and a filed item before its one re-run; D84's known family keeps its own rule) |
| 225 | ACTIONED | 1 | raptor-port/docs/bug-check-order.md §7.7 (change role in place; never sign in again mid-fixture on a fresh demo world) |
| 226 | ACTIONED | 4 | verification-before-completion/browser-checks.md Measure, Don't Estimate (count line positions, not rects) |
| 227 | ACTIONED | 9 | machine-local memory `astra-codex-cli-available.md` (a brief points reviewers at the live files; a mid-review ruling is folded in, not restarted) |
| 229 | ACTIONED | 9 | machine-local memory `prefer-codex-for-bug-checks-fable-scarce.md` (a reviewer's thinking level is a launch setting: `--effort high` on every runner call) |
| 230 | ACTIONED | H | already reflected: `.claude/rules/doc-structure.md` §When it leaves (`backlog-archive.mjs --move`, `docsize.mjs --moves`) and `raptor-port/docs/doc-budget.md` |
| 231 | ACTIONED | 7 | writing-plans Task Right-Sizing (a migration of shared records: the checks come first and gate every move) |
| 232 | ACTIONED | 5 | session-handoff Step 3 (before an item leaves, walk every deliverable it ever named) |
| 233 | ACTIONED | 6 | task-observer Numbering discipline rule 4 (prove the cross-branch check on the current branch first; `MSYS_NO_PATHCONV=1` on Git Bash) |
| 234 | ACTIONED | 9 | machine-local memory `astra-codex-cli-available.md` (a brief to the other provider names the area rules files; the rule itself is D140, always loaded) |
| 235 | ACTIONED | 4 | verification-before-completion Common Failures row (a green run is evidence for its own environment); its fault-injection half in test-driven-development Verify RED |

## The groups he approves

1. **The bug-check order** — 11 lessons + the D16/D17 homes: `_docs/raptor-port/docs/bug-check-order.md`.
2. **systematic-debugging** — 9 lessons: `systematic-debugging/SKILL.md`, `condition-based-waiting.md`.
3. **test-driven-development** — 2 lessons + the test halves of #205 and #235.
4. **verification-before-completion** — 6 lessons: `SKILL.md`, `browser-checks.md`.
5. **session-handoff** — 3 lessons.
6. **task-observer** — 1 lesson (and its `TASK-OBSERVER-VENDORED.md` register line).
7. **writing-plans** — 1 lesson.
8. **The gates and deploy doc** — 2 lessons: `_docs/raptor-port/docs/gates-and-deploy.md`.
9. **Memory notes on this machine** — 4 lessons: `_memory/additions.md`.
10. **The backlog** — 1 item for #42: `_docs/OUTSTANDING-item.md`.
- **H — housekeeping**: 2 closed as already reflected (#204, #230). **Kept OPEN**: #120, #122 (D73).

## After the two reads (Fable 5.1 high, Astra gpt-5.6-sol high — both REVISE; reports `fable.md`, `astra.md`)

Every finding was checked against the live files and taken, with these settlements:
- **D16's "own port" (Astra 1 vs Fable's note):** the reviewers disagreed on whether #213's "one shared preview"
  narrows the owner's ruling. D16's row records the recipe with "its own port", so the draft now keeps D16 as
  recorded and applies only #213's freeze half. Narrowing it is his call, and the saving is small.
- **D17 (Fable 5 vs Astra's "faithful"):** the ruling's own words begin "For a long hand pass"; the draft had
  dropped that condition, so it is restored (D138).
- **#198 (Fable 7 vs Astra's "closable"):** the observation's lesson is the chain that COMMITTED after a piped
  gate; nothing live says that, so one "Long check runs" line is added and #198 moves from H to group 4.
- Merged where both raised the same point: #222's threshold (Fable 8, Astra 6), #231's control case (Fable 9,
  Astra 5), §7.7's bridge calls (Fable 3, Astra 11), #210's creation times and `GCM_INTERACTIVE` (Fable 11, Astra 3).
- Taken as written: Fable 1 (the filing push IS the re-run), 2 (D138's guard on condensing), 4 (#234 includes
  `raptor-executor.md`), 6 ("pace or settle"), 10 (the Updating note names change 4); Astra 2 (a linked worktree
  shares its repo's config), 4 (`elementFromPoint` may hit a child), 7 (a touch sequence, not one call), 8 (a
  `MutationObserver` runs at the microtask checkpoint, not "the same task"), 9 (the premise list as examples),
  10 (platform behaviour that IS the requirement is exercised on every OS).
- Added after the reads, not reviewed: the direct review-launch commands in the #229 memory block (the two used
  here). One round each (D70); no second round.

The superpowers skills' local changes are registered in `_notes/SUPERPOWERS-VENDORED.md` (change 4) so an
upstream refresh re-applies them.
