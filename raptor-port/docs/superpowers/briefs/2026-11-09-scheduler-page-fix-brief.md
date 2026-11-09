# The scheduler's page — the fixer's brief (9 Nov 26, chat 43, D1944)

You are a fresh Opus helper. You wrote neither the page nor either reader's report. Work in
`C:\Users\User\projects\Raptor`, branch `claude/rules-diet-scheduler-page` (checked out). Commit nothing, push nothing:
the host commits. In Git Bash set `MSYS_NO_PATHCONV=1` before `git show <ref>:<path>`; read full rows with the shell's
grep (`grep -h '^| D569 |' .claude/decisions-full/*.md`) — the Grep tool hides a long row.

## The job
The scheduler's rulings list became a page (`.claude/rules/decisions/scheduler.md`; the list before:
`git show 5d8ddf6f8:.claude/rules/decisions/scheduler.md`). Two readers read it blind with the brief
`raptor-port/docs/superpowers/briefs/2026-11-09-scheduler-page-read-brief.md` (read it — its six questions and its
"Not findings" are your scope too). Their reports: `…/2026-11-09-scheduler-page-read-opus.md` and
`…/2026-11-09-scheduler-page-read-astra.md`. Act on every finding of both:

1. **Check it first** against the ruling's full row (column 3 his words, column 4 the meaning — the first bold sentence
   is his rule; parts marked "the agent's reading" are not his), the old short line, and for a test claim the test's own
   assertions. Decide **held** or **not held**, with the reason. A finding about stored data, size or style is not held
   (the brief's "Not findings").
2. **Held → fix the page**: put back the words his rulings carry (prefer the row's own words), mark an agent's reading
   as "(the agent's reading)", widen or narrow a line back to its ruled scope, cite every ruling a line states. A number
   whose tests hold only part comes OFF the "Built, held by tests" line and is stated on the page (its unheld part at
   least) — the strict rule: unsure means it stays written out. Change no test and no app code.
3. **A finding that shows the app differs from his ruling** (e.g. D663's window title) is not fixed in the app: state
   his ruling on the page, and write the difference under "Questions for him" in your notes, with a recommendation.
4. **A later ruling that changes an earlier one whose full row carries no mark** (e.g. D1041 by D1044, D1045): write
   the mark in the earlier row's full row the way `DECISIONS.md`'s head says (read its steps for a converted area, and
   copy the mark format already used in `.claude/decisions-full/scheduler.md`, e.g. "NARROWED … BY D531"), only where
   the later ruling's own words make the change plain; otherwise list it under "Unsure, for the host". The same check
   for chat 42's list: D1063 by D1064; D1041 by D1044, D1045; D1030 by D1038; D1782 on D844, D845, D882; D1106 on D41;
   D278 by D753; D949 on D950.
5. **The other files the readers name** (`people-accounts.md`'s bracket, `how-we-work.md`'s one-file line, a "From
   other areas" line): fix only the numbers or words the finding concerns; no other word changes. `how-we-work.md` is
   near its hard limit (`raptor-port/scripts/docsize.mjs` PAGE_LIMITS): keep a change there byte-neutral or smaller.
6. **Two readers on one point** count once; say so.

## Then
- Run from `raptor-port/`: `npm run docsize` and `npm run rulecheck` — both must pass. Read what a failure says and fix
  the page, never the scripts. (Do not run the docsize self-test; the host does.)
- The sorting tables (`…/2026-11-09-scheduler-page-sort-{A,B,C,D}.md`): add "read 9 Nov 26: <what changed>" to the row
  of every ruling you touched.
- Write your notes to `raptor-port/docs/superpowers/briefs/2026-11-09-scheduler-page-fixes.md`, in the shape of
  `…/2026-11-09-inputs-trial-fixes.md`: a head (what was read, how), a result line (findings, held, not held, numbers
  off the built line before → after), one table row a finding (Reader | # | Ruling(s) | Held? | What was done | Why),
  then "Questions for him" (each with the case and a recommendation) and "Unsure, for the host".
- Your final message: the result line, the page's bytes before → after, the built line's count before → after, every
  file you changed, and the questions and unsure points — short.
