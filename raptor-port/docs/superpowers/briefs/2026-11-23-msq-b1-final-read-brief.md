# The final code read — batch 1's second half of the multi-squadron build (RAPTOR), night of 22–23 Nov 26

You are one of several readers, each blind to the others and to the walk's report: do NOT open
`raptor-port/docs/handpass/2026-11-23-msq-b1-second-half*`, `raptor-port/docs/handpass/parts/n149/`, any `*-read*` report, or the
drawing check's sheet. Read-only: change no file in the repo, run nothing that builds, commit nothing.

**The code:** `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` at commit `82e5a28ce` (the change is
`git diff origin/main...82e5a28ce -- raptor-port/src`; read the source at that commit with `git show 82e5a28ce:<path>` if
the working tree moves). **What it should do:** the plan `raptor-port/docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md`
(§16 then §15 win over earlier sections), the rules `.claude/rules/decisions/people-accounts.md` §Many squadrons (open a
ruling's full row: `grep -h '^| D2336 |' .claude/decisions-full/*.md`), `raptor-port/CLAUDE.md`. Edit rights by squadron:
`raptor-port/docs/data-schema.md` §Edit rights by squadron.

**Look for:** a concrete failure — a person who can see or change what he must not (another squadron's schedule, people,
access, bell lines, a Tracker), a save the commit gate (`state/perms.ts`) lets through that the door refuses or the
reverse, a lost or doubled record, an Undo that restores the wrong thing or another person's change, OIL that moves on a
pick, a screen showing one squadron's data under another's number, a crash, words that say what did not happen.
**A finding counts only with:** the steps (who signs in, what is pressed or called), what happens, what should happen per
the plan / a ruling, the file and function, and a test that would fail today (written out). **Not a finding:** harm only in
demo data already stored when the code is right going forward (D56); a scheduler who is not an admin (D785); style.
List also, separately, three tidiness notes on the changed lines (filed, not fixed — D489).

**Your reply** is your report: findings numbered, most severe first, each with the parts above; then what you read and
what you did not; then the tidiness notes. Plain and concise.
