# The Leave War's page — the fixer's brief (9 Nov 26, chat 46, D1947)

Copied from the scheduler's (`2026-11-09-scheduler-page-fix-brief.md`), its area, commits and lists changed.

You are a fresh Opus helper. You wrote neither the page nor either reader's report. Work in
`C:\Users\User\projects\Raptor\.claude\worktrees\epic-lehmann-06a880`, branch `claude/rules-diet-leave-war-page`
(checked out). Commit nothing, push nothing: the host commits. In Git Bash set `MSYS_NO_PATHCONV=1` before
`git show <ref>:<path>`; read full rows with the shell's grep (`grep -h '^| D1177 |' .claude/decisions-full/*.md`) — the
Grep tool hides a long row. Edit files with the Edit and Write tools; a script is written to a file with Write, then run
(no `node -e`, no `sed -i`; in JS use `s.replace(a, () => b)`).

## The job
The Leave War's rulings list became a page (`.claude/rules/decisions/leave-war.md`, drafted at `694602fac`; the list
before: `git show 0ce71adab:.claude/rules/decisions/leave-war.md`). Two readers read it blind with the brief
`raptor-port/docs/superpowers/briefs/2026-11-09-leave-war-page-read-brief.md` (read it — its six questions and its
"Not findings" are your scope too). Their reports: `…/2026-11-09-leave-war-page-read-opus.md` and
`…/2026-11-09-leave-war-page-read-astra.md`. The drafter's brief, with the host's notes from the four sorters at its end:
`…/2026-11-09-leave-war-page-draft-brief.md`. Act on every finding of both:

1. **Check it first** against the ruling's full row (column 3 his words, column 4 the meaning — the first bold sentence
   is his rule; parts marked "the agent's reading" are not his), the old short line, and for a test claim the test's own
   assertions. Decide **held** or **not held**, with the reason. A finding about stored data, size or style is not held
   (the brief's "Not findings").
2. **Held → fix the page**: put back the words his rulings carry (prefer the row's own words), mark an agent's reading
   as "(the agent's reading)", widen or narrow a line back to its ruled scope, cite every ruling a line states. A number
   whose tests hold only part comes OFF the "Built, held by tests" line and is stated on the page (its unheld part at
   least) — the strict rule: unsure means it stays written out. Change no test and no app code.
3. **A finding that shows the app differs from his ruling** is not fixed in the app: state his ruling on the page, and
   write the difference under "Questions for him" in your notes, with a recommendation.
4. **A later ruling that changes an earlier one whose full row carries no mark**: write the mark in the earlier ruling's
   full row the way `DECISIONS.md`'s head says (read its steps for a converted area, and copy the mark format already
   used in `.claude/decisions-full/leave-war.md`, e.g. "— NARROWED 22 Oct 26 BY D1225: …"), only where the later
   ruling's own words make the change plain; otherwise list it under "Unsure, for the host". The drafter's list to check:
   D1330 / D1332 over D1212, D331, D335; D1254 over D1227 (My leave's place); D1316 over D1175 (course, overseas-duty and
   medical colours); D1019 (largely overtaken — say by what); and D1326's stale short line (it read "CSE · OD · UNA" and
   cited the archived D1338).
5. **The host's own points — check them whether or not a reader raised them:**
   - D1177's row lists "the agent's readings, drawn for him and his to strike" — among them "the admin decides bids at
     any time", "a member moves his own bid while it waits and its days are open", "the page opens on the first open
     date from today, else on today", the closed days' dim and small lock, the tap on "Bidding closed", Undo of opening
     or closing dates, the dotted "moved" mark, remarks on an approved leave at any time. Every page line stating one of
     these as his rule (lines 29, 135, 209 and others — search) is marked "(the agent's reading of D1177)" unless a
     later ruling of his own words states it (then cite that ruling instead).
   - The drafter cut citations on the UNA line and the bid-row line (D1326, D1338 and the rulings around them): check
     every ruling those lines state is cited, and none cited that the line does not state.
6. **The other files the readers name** (`inputs.md`, `scheduler.md`, `people-accounts.md`, `it-flow-guide.md`, a map
   line, a "From other areas" line): fix only the numbers or words the finding concerns; no other word changes. A page
   near its hard limit (`raptor-port/scripts/docsize.mjs` PAGE_LIMITS — How we work and the IT flow guide are within
   bytes of theirs): keep a change there byte-neutral or smaller; if it cannot be, stop and list it for the host — never
   raise a limit (D1932).
7. **Two readers on one point** count once; say so.

## Then
- Run from `raptor-port/`: `npm run docsize` and `npm run rulecheck` — both must pass. Read what a failure says and fix
  the page, never the scripts. (Do not run the docsize self-test; the host does.)
- The sorting tables (`…/2026-11-09-leave-war-page-sort-{A,B,C,D}.md`): add "read 9 Nov 26: <what changed>" to the row
  of every ruling you touched.
- Write your notes to `raptor-port/docs/superpowers/briefs/2026-11-09-leave-war-page-fixes.md`, in the shape of
  `…/2026-11-09-scheduler-page-fixes.md`: a head (what was read, how), a result line (findings, held, not held, numbers
  off the built line before → after), one table row a finding (Reader | # | Ruling(s) | Held? | What was done | Why),
  then "Questions for him" (each with the case and a recommendation), "Marks written" and "Unsure, for the host".
- Your final message: the result line, the page's bytes before → after, the built line's count before → after, every
  file you changed, and the questions and unsure points — short.
