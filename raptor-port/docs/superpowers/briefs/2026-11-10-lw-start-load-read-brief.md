# What a Leave War job loads at its start — the blind read's brief (10 Nov 26, chat 56, D1960, D1973)

Sent word for word to Astra (`codex exec`, reasoning high, read-only) and to a fresh, blind Opus reader. You are one of
two readers, blind to each other. READ ONLY: change no file, run no command that writes, commit nothing. Work in
`C:\Users\User\projects\Raptor\.claude\worktrees\rules-diet-followup-4a76cd`, branch `claude/lw-start-load`.

## Background
The project's rules for the agent live in rulings files under `.claude/rules/decisions/` — one page per area. A page
with `paths:` at its top loads by itself into a chat only when the chat opens a file matching one of those paths (a file
read with the Read tool; a shell read loads nothing). A page with no `paths:` loads in every chat. Each statement on a
page cites the owner's rulings after it; each ruling's full row (his words, what it means, where it lives) is in
`.claude/decisions-full/<area>.md` (`grep -h '^| D1973 |' .claude/decisions-full/*.md`, the shell). The document check is
`cd raptor-port && npm run docsize`; its pure parts are in `raptor-port/scripts/docsize-rulings.mjs`, its self-test is
`node raptor-port/scripts/docsize-selftest.mjs`.

## What changed (one commit over `main` at `8b82a6dfc`: `git diff 8b82a6dfc 93531181d`)
Under the owner's D1960 and D1973 (read both full rows) and the backlog item `[LW-START-LOAD]` in `OUTSTANDING.md`:
1. **The scheduler's page** (`.claude/rules/decisions/scheduler.md`): its `paths:` line `raptor-port/e2e/**` is replaced
   by the 42 files of `raptor-port/e2e/` whose name does not hold `leavewar`, one line each, under a two-line comment. So
   the seven Leave War browser tests (`*leavewar*`) no longer load the scheduler's page (about 20,100 tokens); every other
   browser test, the shared helper `app.ts` and the Tracker's one test load it as before.
2. **A new check** so that list cannot go stale: `testPageProblems` in `raptor-port/scripts/docsize-rulings.mjs`, called
   from `structure()` in `raptor-port/scripts/docsize.mjs`, fails the document check for any `.ts` file under
   `raptor-port/e2e/` that matches neither the scheduler's page's `paths:` nor the Leave War's; one case in the self-test.
3. **People & accounts' page** (`.claude/rules/decisions/people-accounts.md`): its `paths:` lose
   `raptor-port/src/leavewar/ui/Matrix.tsx` and `MatrixRows.tsx` (the Leave War's grid and its rows). It still loads with
   the war's `state/**`, `sync.ts`, `engine/people.ts`, `engine/access.ts`, `ui/BidPicker.tsx` and `ui/OutcomeChips.tsx`.
4. **The Leave War page** (`.claude/rules/decisions/leave-war.md`, §From other areas): the scheduler line now says the
   war's own browser tests no longer load that page; three new lines at the page's end — two naming the People & accounts
   rulings that touch the war and that the page did not yet name (D165, D309, D310, D322, D303, D321, D327, D325, D307;
   D993), one saying People & accounts' page no longer loads with the grid's two files. The line just above them, already
   there, names the rest.
5. **The general page** (`.claude/rules/decisions/how-we-work.md`): D1960's line reworded ("filed, not started" gone,
   "loads" now "loaded") and a new line for D1973 under it (§Records); a new line for D1972 under §Models and readers.
   Full rows for D1972 and D1973 in `.claude/decisions-full/how-we-work.md`; the map in `DECISIONS.md`.
OIL's page still loads with every Leave War file — deliberately (D1973's row says why).

## The six questions — answer each, with evidence
1. **A ruling a Leave War job can no longer reach — the scheduler's page.** A job that opens the war's own files and its
   browser tests, and nothing that still loads the scheduler's page, no longer has that page. Check every statement on the
   scheduler's page that names the Leave War, its tests, a browser test, or every screen / the whole app, against what
   such a job still loads (the Leave War page with its "From other areas" lines, `oil.md`, `design.md`,
   `.claude/rules/seams/leave-war.md`, `.claude/rules/raptor-executor.md`, the always-loaded files). Name any ruling such
   a job needs and cannot now reach. (Chat 48's read of 10 Nov 26 asked this for a job opening only the war's source
   files; the new case is the war's browser tests.) Is there any statement on the scheduler's page about how browser tests
   are written or run that a Leave War test needs?
2. **A ruling a grid job can no longer reach — People & accounts' page.** A job that opens only `Matrix.tsx`,
   `MatrixRows.tsx`, their stylesheet and the war's tests no longer has that page. Read the whole People & accounts page:
   for every statement that governs what the war's grid draws or lets a person do there (a posted-out, archived, deleted,
   SANS or returning man's row; who may do what on the war; the signed-in callsign), is it stated on the Leave War page
   itself or named on its "From other areas" People lines? Name each one that is not.
3. **The pointer lines faithful.** Do the two new People lines on `leave-war.md` say what the People & accounts page's
   own lines and the full rows they cite say — no scope widened or narrowed, no condition, exception or "not built"
   dropped, no reading of the agent's stated as his rule? Is every number cited one the line's words cover, and is any
   number the words cover missing? Is the reworded scheduler line and the new "no longer loads" line true of the `paths:`
   as they now stand?
4. **The general page's lines and the two full rows.** Does the reworded D1960 line still say all that D1960's full row
   requires? Do the D1973 and D1972 lines say what their rows say, and do the rows keep his words apart from the agent's
   readings? D1972 is recorded as a one-week permission given under D903's "unless he calls for it", changing neither
   D903 nor the rule that Opus plans and builds: is that a fair record of his words, or does a standing line elsewhere
   (the general page §Models and readers, `.claude/rules/bug-check.md`, `.claude/rules/doc-structure.md`, `AGENTS.md`,
   `raptor-port/docs/codex-guide.md`) now contradict it in a way a reader would act on wrongly?
5. **The check.** Is `testPageProblems` correct — a test in a sub-folder, a `.ts` helper, a file the Leave War's
   `raptor-port/e2e/*leavewar*` matches, Windows path separators in the file list, a page file missing or with no
   `paths:`? Can a browser test be added, renamed or moved so that it loads neither page and the check stays green? Does
   the old `raptor-port/e2e/**` reach anything the 42 names do not (list `raptor-port/e2e/`)? Does the comment inside the
   `paths:` list break how the page's `paths:` are read — by `pathsOf` and `frontmatterProblems` in
   `docsize-rulings.mjs`, and by a plain YAML reader? Does the self-test case test the right thing?
6. **Anything else this change breaks** — a statement now false elsewhere (search the repo's Markdown and the scripts'
   comments for text saying a browser test loads the scheduler's page, or that People & accounts' page loads with the
   grid), a contradiction with a ruling or a guide, a safeguard dropped, bulk added. Reproduce: `npm run docsize` green,
   and which pages `raptor-port/src/leavewar/ui/Matrix.tsx` and `raptor-port/e2e/leavewar.spec.ts` now load.

**Not a finding:** a fault in a ruling or a page that this change did not touch; a problem living only in data already
stored (D56); the choice itself of which pages stop loading (the owner left it to the agent, D1973) — unless it makes a
ruling unreachable, which is questions 1 and 2. A finding names the file and line, the concrete consequence (which job,
missing which ruling, doing what wrong), its cause and the fix. Say plainly if you find nothing under a question. End
with a one-line verdict.
