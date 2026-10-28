# M5a — the builder helpers' common brief (the night of 28–29 Oct 26)

Every M5a builder helper reads this first, whole, then its own job's prompt. The host chat coordinates, commits and
checks; the helpers build (his D1416 — a fresh helper per piece inside the night's chat).

## Where you are
- Checkout `C:\Users\User\projects\Raptor\.claude\worktrees\sync-main-handoff-fe9391`, branch
  `claude/leave-war-m5a-screens-ced9d7`. **Other helpers edit other files in this same checkout at the same time.** Touch
  only the files your prompt gives you; if you need a change elsewhere, stop and report it. **Never** `git commit`,
  `git add`, `git stash`, `git checkout`, `git switch` or `git reset` — the host commits.
- The approved spec: `raptor-port/docs/superpowers/plans/2026-10-28-lw-m5a-build-spec.md` — read §0–§4 whole and your
  job's parts of §5–§7. His answers: D1490 (a grade changed after 1 Jan counts from the next 1 Jan), D1491 (the drag bar
  goes — done), D1492 (all 24 readings of §6 stand). Every ruling it names: one line each in
  `.claude/rules/decisions/leave-war.md`; open a ruling's full row before acting on its detail:
  `grep -h '^| D1479 |' .claude/decisions-full/*.md` (the shell — the Grep tool hides a long row).
- The project's rules for builders: `.claude/rules/raptor-executor.md`, `raptor-port/CLAUDE.md` (its one-line rules), and
  for anything a person sees `.claude/rules/ui-design.md` and `raptor-port/docs/design-practices.md` (the ONE design
  guide — §9 is his design lessons; follow every one). Speed: `raptor-port/docs/performance.md` Part 1 before any
  layout or rendering change.

## Already built (do not rebuild; read the code)
- **The engine** `raptor-port/src/leavewar/engine/leaveyear.ts` (+ `leaveyear.test.ts`, the spec's §1.5 table): `personFigures`,
  `daysTaken`, `annualUsedIn`, `snapshotOf`, `gradeDaysOn`, `BAL_KINDS` ('LVE','CCL','FCL','PL','EL','CL'), `KIND_COUNTER`,
  `DAYS_TAKEN_COLS`, `START_GRADES`.
- **The store's bridge and writers** (`raptor-port/src/leavewar/state/store.ts`, search "M5a — A PERSON'S LEAVE FIGURES"):
  `leaveFiguresOf(pid, whatIf?)` → `{ kinds: { LVE: { app, war, pending, cf, typed }, CCL: … }, lveTaken, medTaken, cfTill }`
  (cached; `whatIf = { dates, code, portion? }` answers "what is left if I place this"); `leaveWorldOf(pid)` → `{ world, days }`
  for `daysTaken` / `annualUsedIn`; `dayRecsOf(pid)`; `setTypedBalance(pid, kind, amount, cf?, from?)` (true when saved;
  `from` = the running figure shown before, for the history line) and `balanceProblem(...)` (the box's refusal words);
  `gradesList`, `liveGrades`, `gradeOf(pid)`, `gradeDaysNow(g)`, `gradeHolders(id)`, `gradeNameProblem`, `addGrade`,
  `renameGrade`, `setGradeDays`, `moveGrade`, `deleteGrade`, `setPersonGrade(pid, id | null)`, `setBalanceLock(on)`,
  `balancesLocked()`. Commands: `lw.balance`, `lw.grade`, `lw.grades`, `lw.balLock` (the gesture's `note` carries JSON
  `{k, from, to}` for a balance, `{from, to}` names for a grade, a short string for the grades list).
- **Who may write** (`raptor-port/src/state/perms.ts`, `docs/data-model.md` §11): done and break-tested
  (`leavewar/m5a-gate.test.ts`). **The last visit** `raptor-port/src/state/lwseen.ts`: `openOwnWindow(pid)` writes now and
  returns the previous moment (ms); `lwSeenAt(pid)`.
- **Removed:** the grid's FIGURES drawer and the drag-to-give-days bar (`docs/handpass/parts/lw-m5a-drawer-removal.md`
  lists what was left dead for you to finish).

## How to check your work (from `raptor-port/`)
- `npx vitest run <your test files and the folders you touched>`. The Leave War suite pins the app's today to
  2000-01-01 (`src/leavewar/test-setup.ts`); a test that needs a date calls `setMemberTodayForTests('<date>')` from
  `./engine` (and puts it back to '2000-01-01' after) — see `src/leavewar/m5a-gate.test.ts`.
- Type-check with `npm run build` (never `tsc --noEmit`, hollow here). Run it at the end; another helper may be mid-edit,
  so if the only errors are in a file not yours, say so and stop there.
- **Do not run the browser tests (Playwright / e2e), the smoke suite, or a preview server** — the host runs those and the
  walk. Edit e2e specs that pin what you change, and list them.
- Never weaken an assertion to pass; a test that pinned removed behaviour is rewritten to the new behaviour or deleted with
  its reason (spec §4 "Tests that pin what changes").
- The demo world and drawings: the build reads sizes, spacings and colours from the drawing scripts
  (`raptor-port/docs/mock/lw-overhaul/full-m5a-person.mjs`, `full-m5a-balances.mjs`), never re-types them (D1478); the
  pictures are under `raptor-port/docs/mock/lw-overhaul/full/m5a/` — open the ones your job names (Read shows them).
- Code style: `src/leavewar/ui` and `state` are ordinary TS/React — 2 spaces, no semicolons, single quotes; comments say
  WHY, in prose. Every new or deleted file gets its line in `raptor-port/docs/file-map.md` (only your own lines).
- Words on screen: the design guide's §1–§1b (production words, no "demo"; "you", never "we"; a button starts with its verb).

## Report back — short, plain
Files changed / added / deleted; tests added, changed, deleted (each with why); the vitest and `npm run build` results with
counts; every departure from the drawings or the spec, with its reason (none on purpose — D1424); anything you could not
do, and anything left dead in a file not yours.
