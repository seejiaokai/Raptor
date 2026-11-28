# Brief: check the questions put to the owner against his rulings and the app

You are a fresh, independent reader. You wrote none of this and have seen no other reader's report. READ ONLY: change
no file in any project folder, commit nothing, push nothing. Your only write is your report file (named at the end).

## Who and why
The owner of this app (Raptor/TALON, a squadron scheduling app) is not technical. An agent put a long set of questions
to him, each with a recommendation, and then answered three of his follow-ups in chat. He says the agent seems to be
making errors. His standing rule (D2140): everything put to him is checked first, every line against his rulings and
the rest of the same proposal, knock-on effects worked through, no fact stated unchecked. Your job is that check.

## What to check
1. The round-2 questions page — its text: `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/18e38ec0-6666-4a42-af15-93bb497578c2/scratchpad/q-review/round2-page-text.txt`
   (the source with pictures: `C:/Users/User/projects/Raptor-readings/raptor-port/docs/mock/2026-11-25-rulings-round2/index.html`).
   Items: I (I1–I3), J, K, C, G, D, H, E1–E12, F1–F6, A, B, and the 19 small points. B is answered (D2617).
2. The end-time try-out's three switches and their defaults:
   `C:/Users/User/projects/Raptor-readings/raptor-port/docs/mock/2026-11-25-endtime-tryout/index.html` and
   `.../src/tryout.js` (DEFAULTS near the top).
3. The reviewed wordings: `C:/Users/User/projects/Raptor-readings/raptor-port/docs/mock/2026-11-25-guardrail-wording/words-reviewed.md`.
4. What the agent told him in chat today: `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/18e38ec0-6666-4a42-af15-93bb497578c2/scratchpad/q-review/what-he-was-told.md`.

## Where his rulings are — search ALL of them, newer ones included
- Working folder: `C:/Users/User/projects/Raptor-readings` (branch claude/readings-lapse-fix-fdbb3c, 97 commits behind main).
- Short lines by area: `.claude/rules/decisions/*.md` (scheduler.md, inputs.md, leave-war.md, oil.md, people-accounts.md,
  design.md, how-we-work.md …). Full rows, his exact words and conditions: `.claude/decisions-full/*.md` — read a row with
  the shell: `grep -h '^| D2612 |' .claude/decisions-full/*.md` (the Grep tool hides long rows). Also `DECISIONS-ARCHIVE.md`
  and `OUTSTANDING.md` (the backlog).
- Rulings made on OTHER branches are not in this folder. Search them with git from this folder, e.g.
  `git grep -h -E '^\| D27[0-9]{2} \|' origin/main -- .claude/decisions-full/` and the same for
  `origin/claude/msq-b1-screens-135` (People & accounts, multi-squadron; rulings to about D2733),
  `origin/claude/sans-warnlines-185` (SANS; rulings to about D2750), `origin/claude/sans-leftovers-179`. Search by SUBJECT
  (e.g. "end time", "start time", "sign-in", "SANS availability", "OIL list", "standby", "View-only"), not only by number.
  Pass refs one or a few at a time (a git grep over all refs fails with "argument list too long").
- Rulings recorded since the page was written (25 Nov) are his updates — e.g. D2613, D2616–D2619, D2729–D2736 here, and
  whatever the other branches hold. Check whether the page and the chat answers reflect them.

## The app's code (for facts)
`C:/Users/User/projects/Raptor-readings/raptor-port/src` — this branch; where a fact may have changed on main, check
`git show origin/main:raptor-port/src/<path>`. A code comment is never evidence of his ruling; the rulings win.

## For EACH item, report only what is wrong or doubtful — say "no finding" for an item that is fine
- (a) Already answered: a ruling of his settles it (cite D-number and his words) — the question should not be put.
- (b) Contradicts a ruling: the question's framing, a choice, or the recommendation goes against one of his rulings,
  or changes one without saying so (cite both).
- (c) A wrong fact: something said about what the app does today, or what is or is not built, that the code or the
  rulings show is untrue (cite the file and what it really does).
- (d) Inconsistent with the rest: two items, or the page and the chat answers, or the try-out defaults and the page,
  that disagree (e.g. the page's H recommendation vs the chat's H and the try-out's "never block").
- (e) The agent's own reading presented as his rule, or a recommendation passed off as settled.
- (f) A missing question his rulings or the app raise that the set leaves out.
For each finding: the item, the exact words at fault, the evidence (ruling row or file), what goes wrong if he answers
on the wrong basis, and the corrected question or recommendation in plain words.

## Not findings (do not report)
- A problem that lives only in demo data (D56, D2616: the demo week is remade to fit the rules).
- Any case built on a scheduler who is not an admin (D785: a scheduler is always an admin).
- Style preferences with no error behind them.

## Report
Plain, short, grouped by item, the most serious first; then a one-paragraph verdict: which items can be put to him as
they are, which must change, which must be dropped. Write it to
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/18e38ec0-6666-4a42-af15-93bb497578c2/scratchpad/q-review/REPORT_FILE`
and return the same text as your final message.
