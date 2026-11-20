# Backlog additions — group D-reads-records (skill-notes review of 20 Nov 26)

No new item. Two additions to existing items, each appended as a new paragraph at the END of the item's body (after
its last "Added …" paragraph, before its **Place:** line where it has one), in the shape the 10 Nov 26 review used.

## 1. `[CHECK-TOOLS-HARDEN]` — append before its "**Place:** his to place." paragraph

**Added 20 Nov 26 (the skill-notes review, group D-reads-records):** (g) **widened — the blind reader's copy script**
does the whole recipe now written in `raptor-port/docs/codex-guide.md` §Reading a commit that is not the branch head:
the pictures left out by pathspec (`':(exclude,glob)**/*.png'` and the jpg, gif, mp4 and webm alike — seconds, where
the whole tree ran past five minutes); the branch's `HANDOFF.md` block and the round's builder brief, reports and
evidence sheet replaced in the copy by one line each, so the reader's start-up reads find nothing to anchor on (twice,
19 Nov 26: the Codex reader read the builder's summary before the brief's "do not read"); `git -c core.longpaths=true
add -A` and `git -c core.hooksPath=/dev/null commit`, refusing to finish unless `git log --oneline -1` prints the commit
(an `add` inside a loop failed silently on a long name, and every copy had no commit; Codex refuses a folder that is not
a repo); and, when asked to start the reader, `codex exec` with the model named (`-m gpt-6-astra`, D2210) and
`< /dev/null`, then a check after about 90 seconds that the log has grown (a backgrounded run waited 80 minutes on its
input) (954, 977, 978, 981). (s) **Check, then commit:** one script, `raptor-port/scripts/check-commit.mjs -m "<message>"
[paths…]`, runs `npm run docsize`, prints its last lines, and commits only when that check exited 0 — used for every
records commit; and the script guard (`.claude/hooks/script-guard.mjs` — a hook: on his word, read as a guide change is)
refuses a `git commit` that follows a check (`docsize`, `rulecheck`, `npm test`, `lint:changed`) joined by `;` or after a
pipe, with the advice "join the commit with `&&` to the check's own exit, or use check-commit.mjs" (926, 10 Nov 26 — a
semicolon; the pipe twice before, 3 and 8 Nov 26, the memory note on a pipe hiding a failed check). (t) **The
after-merge wait:** `raptor-port/scripts/wait-live.mjs <commit>`, beside the check lock: exits 0 only when every GitHub
run of that commit concluded `success` or `skipped` AND the Production deployment for that commit reports Ready; any
other conclusion exits non-zero naming each failed job and the step it failed at, so a download step on the hosted
machines is told from a failing test at a glance; `docs/gates-and-deploy.md`'s "Done" loop names it (936, 11 Nov 26: a
wait written as "nothing still running" printed "ready" on a failed run). (u) **The code check by hand reads new files:**
`npm run lint:changed` passes `--include-untracked` by default (the pull request's job and the end-of-turn hook read
committed files and stay as they are), and prints the changed files it read when asked (928, 11 Nov 26: a new test file
not yet staged was not read, and its finding was met only on GitHub; `docs/gates-and-deploy.md` carries the guide's line).

## 2. `[RULE-FILE-LESSONS]` — append after its **What:** paragraph, before its **To do:** line; and in its heading, "(skill notes 733, 734, 859, 860; 28 Oct – 8 Nov 26)" becomes "(skill notes 733, 734, 859, 860, 938, 951; 28 Oct – 15 Nov 26)"

**Added 20 Nov 26 (the skill-notes review, group D-reads-records) — two more for `DECISIONS.md`'s steps:** (e) **A batch
of rulings is planned before its rows are written:** read each target page's free room against its hard limit (its
`PAGE_LIMITS` row in `raptor-port/scripts/docsize.mjs`) and choose the area by room as well as by subject; decide for
each row whether it truly changes or answers an older ruling — if so, its mark and the citations on every page line
stating that ruling go in the same script; if not, it is not worded as one (938, 13 Nov 26: three refusals in one batch
of seventeen — a page 11 bytes from its limit, another under 230, and a row saying it "answers" an older ruling, which
asked for a mark and five citations). A cheaper guard beside the words: `docsize` prints each page's free room. (f)
**A ruling number counts as taken only once another open chat could see it:** before writing a row, look for other open
chats (`ListAgents`) and for uncommitted rows in the rulings files (`git status --short .claude/rules/decisions
.claude/decisions-full`); tell a chat that shares the folder before writing (951, 15 Nov 26: two chats in one checkout
both took D2056, each blind to the other's uncommitted row; settled by a message and a renumber). The root — two chats
in one folder — is already against the memory note on one checkout per session.
