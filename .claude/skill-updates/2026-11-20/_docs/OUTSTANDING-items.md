# Backlog additions — the skill-notes review of 20 Nov 26, all four groups merged (chat 121)

`OUTSTANDING.md` is rewritten by a script, so only the additions are staged here, applied by hand at install
(weekly-review "Delivering": a file a script keeps rewriting). `[CHECK-TOOLS-HARDEN]` takes three new paragraphs, in
the order A, C, D, after its last "Added 10 Nov 26" paragraph (the one ending at (r)) and before its **Place:** line:
A (s)–(v), C (w), D (g) widened and (x)–(z). Then A's `[START-CONTEXT-AUDIT]` paragraph, D's `[RULE-FILE-LESSONS]`
paragraph, and B's two new items with their priority-list lines.

<!-- ===== group A-handoff ===== -->

No new item: both additions extend an existing item. `OUTSTANDING.md` is rewritten by a script, so only the additions
are staged here, to be applied at install (weekly-review "Delivering": a file a script keeps rewriting).

## 1. Add to `[CHECK-TOOLS-HARDEN]` — a new paragraph after its last "Added …" paragraph (the one ending at (r)), before its **Place:** line

```
**Added 20 Nov 26 (the skill-notes review, group A-handoff):** (s) **A commit guard beside the push guard**
(`.claude/hooks/`): it records, per session, the branch this session last created or switched to, and refuses
`git commit` when the checkout's current branch differs, naming both — two chats in one folder put one chat's commit on
the other's branch on 3 and 10 Nov 26 (skill notes 787, 916, 917), and the check by hand, `git branch --show-current`
before each commit, was known and not run. (t) **No time from memory in a handoff block** (skill notes 853, 873, 892,
932, 935 — met five times; the guides' "read the clock" lines did not stop it): the document check, at its Stop-hook
run on his PC, fails a dated clock time in a `## Now` block that is later than the PC's own clock — every wrong time
met so far was later (00:40 written "01:00" and "00:55"; 19:10 written "19:45"; 19:05 written "about 20:00"); CI's run
skips it, its clock being UTC. Or a placeholder in the block that the commit fills from the clock. (u) **A merged
block's removal checked** (skill note 947): run on his PC, the document check fails a change that removes another
chat's `## Now` block whose branch is not merged into `origin/main` — on 14 Nov 26 later handoffs removed two overnight
runs' blocks while seven of their pull requests sat open. (v) **The push guard refuses a push whose new commits add one
file over about 5 MB outside the picture folders** (skill note 944: two 13.5 MB raw dumps pushed on 14 Nov 26; the force
push to take them out was refused and the job was made again on a second branch).
```

Its priority-list line (`- [CHECK-TOOLS-HARDEN] — small hardening of the checking tools — his word.`) needs no change.

## 2. Add to `[START-CONTEXT-AUDIT]` — a new paragraph at the end of the item (after "…that merged with PR #481 (`[STACK-MERGED-TIDY]`).")

```
**Added 20 Nov 26 (skill note 942):** measure what a scheduler-engine job loads on its first source file, as
`[LW-START-LOAD]` (archived) did for the Leave War (D1960, D1973): chat 68's small engine fix at the FULL tier read 76%
full after its reading alone and 90% once the fix and its tests were committed (13 Nov 26) — opening the engine and
screen files loaded the project guide, the scheduler's, the screen-design and OIL pages, the builder's rules and the
design short form, each whole. Then options for which of them stop loading there, as for the Leave War.
```

Its priority-list line becomes:
`- [START-CONTEXT-AUDIT] — the guard that stops a new chat's load growing back is not built; a scheduler-engine job's load to measure (skill note 942); two of his own settings.`

<!-- ===== group C-walks-tests ===== -->

## An addition to the existing item `[CHECK-TOOLS-HARDEN]` — a new paragraph after group A-handoff's (s) to (v), before its **Place:** line

**Added 20 Nov 26 (the skill-notes review, group C-walks-tests):** (w) **The document check counts the bug-check
order's lesson numbers** (`scripts/docsize.mjs`): §7.11's numbered lessons, read in order, must run 1, 2, 3… with no
gap and no repeat (a letter after a number, such as 23b, counts as its own number once), and the checklist's list of
lessons (`docs/bug-check-checklist.md`, "The lessons of §7.11") must carry the same numbers in the same order — fail
on either, naming the number. Two chats on different days each wrote a lesson 23, cited by number elsewhere ("§7.11
lesson 23"), so the citation was ambiguous for a fortnight; the review's draft renames the second 23b (919, 10 Nov 26).
A numbered list that several writers append to needs its numbering checked by a tool.

<!-- ===== group D-reads-records ===== -->

No new item. Two additions to existing items, each appended as a new paragraph at the END of the item's body (after
its last "Added …" paragraph, before its **Place:** line where it has one), in the shape the 10 Nov 26 review used.

## 1. `[CHECK-TOOLS-HARDEN]` — append after group C-walks-tests's (w), before its "**Place:** his to place." paragraph

**Added 20 Nov 26 (the skill-notes review, group D-reads-records):** (g) **widened — the blind reader's copy script**
does the whole recipe now written in `raptor-port/docs/codex-guide.md` §Reading a commit that is not the branch head:
the pictures left out by pathspec (`':(exclude,glob)**/*.png'` and the jpg, gif, mp4 and webm alike — seconds, where
the whole tree ran past five minutes); the branch's `HANDOFF.md` block and the round's builder brief, reports and
evidence sheet replaced in the copy by one line each, so the reader's start-up reads find nothing to anchor on (twice,
19 Nov 26: the Codex reader read the builder's summary before the brief's "do not read"); every git command run with
`-C <copy>`, never in the checkout — `git -c core.longpaths=true add -A` and `git -c core.hooksPath=/dev/null commit` —
refusing to finish unless the copy's `rev-parse --show-toplevel` names it and its `git log --oneline -1` prints the commit
(an `add` inside a loop failed silently on a long name, and every copy had no commit; Codex refuses a folder that is not
a repo); and, when asked to start the reader, `codex exec` with the model named (`-m gpt-6-astra`, D2210) and
`< /dev/null`, then a check after about 90 seconds that the log has grown (a backgrounded run waited 80 minutes on its
input) (954, 977, 978, 981). (x) **Check, then commit:** one script, `raptor-port/scripts/check-commit.mjs -m "<message>"
[paths…]`, runs `npm run docsize`, prints its last lines, and commits only when that check exited 0 — used for every
records commit; and the script guard (`.claude/hooks/script-guard.mjs` — a hook: on his word, read as a guide change is)
refuses a `git commit` that follows a check (`docsize`, `rulecheck`, `npm test`, `lint:changed`) joined by `;` or after a
pipe, with the advice "join the commit with `&&` to the check's own exit, or use check-commit.mjs" (926, 10 Nov 26 — a
semicolon; the pipe twice before, 3 and 8 Nov 26, the memory note on a pipe hiding a failed check). (y) **The
after-merge wait:** `raptor-port/scripts/wait-live.mjs <commit>`, beside the check lock: exits 0 only when every GitHub
run of that commit concluded `success` or `skipped` AND the Production deployment for that commit reports Ready; any
other conclusion exits non-zero naming each failed job and the step it failed at, so a download step on the hosted
machines is told from a failing test at a glance; `docs/gates-and-deploy.md`'s "Done" loop names it (936, 11 Nov 26: a
wait written as "nothing still running" printed "ready" on a failed run). (z) **The code check by hand reads new files:**
`npm run lint:changed` passes `--include-untracked` by default (the pull request's job and the end-of-turn hook read
committed files and stay as they are), and prints the changed files it read when asked (928, 11 Nov 26: a new test file
not yet staged was not read, and its finding was met only on GitHub; `docs/gates-and-deploy.md` carries the guide's line).

## 2. `[RULE-FILE-LESSONS]` — append after its **What:** paragraph, before its **To do:** line; and in its heading, "(skill notes 733, 734, 859, 860; 28 Oct – 8 Nov 26)" becomes "(skill notes 733, 734, 859, 860, 938, 951; 28 Oct – 15 Nov 26)" and "Four lessons" becomes "Six lessons"; its priority-list line becomes `- [RULE-FILE-LESSONS] — six lessons for the rule files and the steps for recording a ruling — his word.`

**Added 20 Nov 26 (the skill-notes review, group D-reads-records) — two more for `DECISIONS.md`'s steps:** (e) **A batch
of rulings is planned before its rows are written:** read each target page's free room against its hard limit (its
`PAGE_LIMITS` row in `raptor-port/scripts/docsize.mjs`) — the area chosen by the subject it governs (D137), then its
room checked, a page's limit raised where a new feature's rulings need it (D2148); decide for
each row whether it truly changes or answers an older ruling — if so, its mark and the citations on every page line
stating that ruling go in the same script; if not, it is not worded as one (938, 13 Nov 26: three refusals in one batch
of seventeen — a page 11 bytes from its limit, another under 230, and a row saying it "answers" an older ruling, which
asked for a mark and five citations). A cheaper guard beside the words: `docsize` prints each page's free room. (f)
**A ruling number counts as taken only once another open chat could see it:** before writing a row, look for other open
chats (`ListAgents`) and for uncommitted rows in the rulings files (`git status --short .claude/rules/decisions
.claude/decisions-full`); tell a chat that shares the folder before writing (951, 15 Nov 26: two chats in one checkout
both took D2056, each blind to the other's uncommitted row; settled by a message and a renumber). The root — two chats
in one folder — is already against the memory note on one checkout per session.

<!-- ===== group B-mockups ===== -->

## Priority-list line (the checking tools' area, beside [CHECK-TOOLS-HARDEN])

- [CSS-SCOPE-GUARD] — a rule begun at `body`, `html` or `:root` inside a page's wrapper fails the stylesheet check — small, no look from him.

## The item

### [CSS-SCOPE-GUARD] A rule begun at `body`, `html` or `:root` inside a page's wrapper matches nothing (skill notes 728 and 967; filed 20 Nov 26 by the skill-notes review)
**What:** a stylesheet that wraps itself in its page (`#page-leavewar { … }`, native nesting) turns a rule written inside
the wrapper as `body …`, `html …` or `:root …` into "a body inside the page", which never matches: nothing is drawn and
no error is raised. Met twice: 27 Oct 26 (M4, a `body:has(…) .bidsheet` fix, two builds lost — note 728) and 17 Nov 26
(chat 100, the grid's hover ring moved from an injected drawing into `matrix.css`; unit tests and a code read passed, only
a browser test of the computed style caught it — note 967). The guide lines now warn (`.claude/skills/brainstorming/mockups-on-the-real-app.md`
§The Method step 6, "From the picture to the build"; the comments in `matrix.css` and `approvals.css`), so the next step is a
check, not more words.
**The check:** extend `raptor-port/src/ui/css-wrapper-css.test.ts` ([CSS-WRAPPER-GUARD]'s test, which already parses every
stylesheet wrapped in its page) with a second rule: inside a wrapper block, at any depth (an `@media` or nested block
included), a selector whose first compound is `html`, `body` or `:root` — with or without a state (`body.x`, `body:has(…)`) —
fails, its message naming the file, the selector and the two ways that work (written from the page with `&…`, or placed
after the wrapper's close as a state of `body`, rule 3 of that test). Proved red first by putting the 17 Nov 26 rule back
in a copy of `matrix.css`.
**Place:** with the next Leave War or Tracker batch (D490), or any job that touches a wrapped stylesheet; no app change, so
no walk beyond the test's own red-then-green.

## Priority-list line (the checking tools' area)

- [ASK-PAGE-CHECK] — a script run on a mock-up or questions page before it is published to him: codes, ruling numbers and record words, and one "look at now" list — small, no look from him.

## The item

### [ASK-PAGE-CHECK] A check run on a page before it is put to him (skill notes 968 and 973; filed 20 Nov 26 by the skill-notes review)
**What:** two rules for the pages put to him keep being broken by hand, each after it was ruled. (1) A questions page shows
only what is still open, newest first (D1237, D1363; D1237's reading: rebuilt at every new version): met again over chats
97–100, when four rounds each added one more "Newest" block on top and answered items stayed below until he asked for the
page to be made readable (note 968 — the third meeting, after 22 and 25 Oct 26). (2) Every such page is in plain words — no
review codes (H2, F16), ruling numbers inside sentences or record words ("narrows") in its text or on its pictures' tags
(D2164, D2185): round 7's page and its picture tags carried the findings' codes (note 973).
**The check:** `raptor-port/scripts/askpage-check.mjs <page source>`, run on the page's HTML source before every publish
(the mock-up guide's Showing It to name it once built): fails on (a) a code of one or two capitals and digits, or a ruling
number, in the visible text — outside a small grey reference after an item (D2164's reading) — and on a picture tag whose
words are anything but a number or "New"; (b) a short list of record words kept beside the script (narrows, supersedes,
greyed, REFLECTED, ACTIONED); (c) more than one top "look at now" list, or an item marked answered or replaced still on the
page. It prints each hit with its line; a hit kept on purpose carries a marker comment. The page is still read by eye — the
script catches only what words can.
**Place:** with the next design round put to him ([MULTI-SQN-DESIGN]'s next batch), built before that round's page goes
out; no app change.
