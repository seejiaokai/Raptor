# Skill review, 20 Nov 26 (chats 120 and 121) — every OPEN note's disposition

The log: `.claude/skill-observations/log.md` — 57 OPEN notes on `main` (120, 122 and 915 to 974, with gaps), and 12
held only on open branches (939–943 on `claude/rules-check-small-batch`, 975–981 on `claude/multi-sqn-b1-107`), copied
into `_review/branch-notes.md`: 69 in all. How this repo runs a review: `.claude/skills/TASK-OBSERVER-VENDORED.md`
§Reviews in this repo. Who reads these drafts: Astra and a fresh, blind Opus reader, each blind to the other, before his
final approval (D70, D1761, D1770). Drafts sit beside this folder at the live files' paths. **Nothing live is changed
until he approves.** His answers to the four rounds: all as recommended (D2230, `_review/answers.md`).

**Sorted by four helpers** (A to D), each by `_review/helper-brief.md`; their reports `_review/report-<group>.md`; the
groups `_review/groups.json` (E, two notes, the coordinator's). Their tables are merged here by
`_install/check-dispositions.mjs --merge`, which checks every OPEN note appears exactly once.

**Codes** (read by the install script): `APPLY` a draft carries it · `REFLECTED` already written where it belongs (the
place named) · `FILED` a backlog item carries it (the item named; new items and additions in `_docs/OUTSTANDING-items.md`)
· `MEMORY` a memory note carries it (`_memory/additions.md`) · `ASK` recommend closing with no change — his word ·
`OPEN` stays open. APPLY, REFLECTED, FILED and MEMORY become `ACTIONED (<install date>) — …`; OPEN is not touched.

**Short names:** SH `.claude/skills/session-handoff/SKILL.md` · ON `.claude/skills/overnight/SKILL.md` · MOCK
`.claude/skills/brainstorming/mockups-on-the-real-app.md` · TDD `.claude/skills/test-driven-development/SKILL.md` · BCO
`raptor-port/docs/bug-check-order.md` · WS `raptor-port/docs/walk-scripts.md` · GD `raptor-port/docs/gates-and-deploy.md`
· DP `raptor-port/docs/design-practices.md`.

**Placed by the coordinator (chat 121), from the helpers' "For another file" lists:** 980's bullet and 978's clause in
BCO §4 (C's draft); 928's whole-output line in TDD "Which other tests?"; 931's bullet in
`.claude/skills/subagent-driven-development/SKILL.md` "What rides along"; change 8 of
`.claude/skills/SUPERPOWERS-VENDORED.md` (brainstorming, TDD, subagent-driven-development), whose "Updating" section now
names changes 3 to 8 (it said 3, 4 and 5). The helpers' additions to `[CHECK-TOOLS-HARDEN]` are lettered after its (r):
A (s)–(v), C (w), D (x)–(z), D's "(g) widened" a new paragraph on the existing (g).

**The notes held on other branches (939–943, 975–981)** are not in this branch's log. The install re-appends them at
the log's end with their statuses written, as the reviewed side (D78), each keeping its own number where it is free and
taking the next free one where it is not — the renumber named in its entry and in the report.

| Note | Code | Where it lands, or why |
|---|---|---|
| 120 | OPEN | stays deferred on his word (D73, 23 Sep 26): the "whole app as a new tab" guide is written only if a third app comes in as a tab — none has |
| 122 | OPEN | stays deferred with 120 (D73): it extends 120's checklist and lands with it |
| 915 | REFLECTED | ON Part 2 "A helper's report" (its final reply; the tool refuses a report file; saved the moment it arrives) — read today; the draft only tightens its wording, with 933 |
| 916 | APPLY | SH Step 1 "The opening line he pastes", the own-folder sentence: the new chat lists the live chats and says where it is before any branch switch — one change with 917, 921, 923 |
| 917 | FILED | [CHECK-TOOLS-HARDEN] addition (s): a commit guard beside the push guard refusing a commit when the folder's branch differs from the session's (met 3 and 10 Nov 26); its guide half is in the SH draft with 916 (every opening line, in a reply too) |
| 918 | APPLY | SH Step 4 "acts on" list, the next-step bullet: a step that closes, drops, archives or decides names the ruling that lets the agent do it alone, or is "put to him" (D761) |
| 919 | FILED | `[CHECK-TOOLS-HARDEN]` new point (w), the document check counts §7.11's lesson numbers against the checklist (`_docs/OUTSTANDING-items-C-walks-tests.md`); the doubled 23 still stood ([BUGCHECK-LESSON-ORDER] only moved it), so BCO §7.11 and the checklist drafts rename the second one 23b |
| 920 | APPLY | SH Step 3 "A known issue RESOLVED" item 1: mark by a line added after the item's last, never by editing its lines; an open piece becomes a new item; the ruling-home half is already item 2 |
| 921 | APPLY | SH "Release the branch" bullet: work given a fresh chat as a new job is taken back only after a pushed "taken back by chat N" line; the new chat's half is the opening line's live-chats check (916) |
| 922 | APPLY | `raptor-port/docs/doc-budget.md` §2, new bullet "Before a rewrite goes to its readers": qualifying words and pointers into leaving passages shown carried; one change with 924 and 925 |
| 923 | APPLY | SH Step 1 opening-line sentence: carried whole with its condition and write test, never the fallback alone; where-you-are first; the path absolute — one change with 916 |
| 924 | APPLY | `raptor-port/docs/doc-budget.md` §2, the same bullet: a saving quoted to him is measured by a script and called a ceiling, the rewording share a guess (fixed in chat 60's measure; now general) |
| 925 | APPLY | `raptor-port/docs/doc-budget.md` §2, the same bullet: a corrected rule brings the lines that rely on it (steps, checklist, brief); the cross-file D201 sweep stays [RULE-FILE-LESSONS] (a) |
| 926 | FILED | [CHECK-TOOLS-HARDEN] (x), added: a check-then-commit script and a guard refusing a commit joined after a check by a semicolon or pipe; memory note pipe-hides-check-failure extended (third meeting) |
| 927 | APPLY | SH Step 1, new bullet "A recommend the next jobs line": each candidate's full item and its put-to-him lines read before calling it free of his answers — one change with 947 |
| 928 | APPLY | GD §Now, the code check: new trap bullet (`lint:changed -- --include-untracked`, its count matched to git status); the whole-output test half to the TDD skill (C's file); the default flag filed as [CHECK-TOOLS-HARDEN] (z) |
| 929 | APPLY | WS §4, the `elementFromPoint` line: "nothing stands over it" also compares the box with every showing note, banner or overlay, the settled picture taken while it shows |
| 930 | APPLY | ON Part 2 builder's brief: its check names GD's two tests that scan source text (GD "The tests that scan source text read comments too" already says so); a whole-suite run before hand-back would set aside D1086 while public |
| 931 | APPLY | `.claude/skills/subagent-driven-development/SKILL.md` "What rides along, and what a fix brief must say" — text under For another file (owner D); its register line the coordinator's |
| 932 | FILED | [CHECK-TOOLS-HARDEN] addition (t): the document check fails a dated time in a Now block later than the PC's clock — met five times (853, 873, 892, 932, 935); SH Rules 2 and ON step 8 already say "read the clock" |
| 933 | APPLY | ON Part 2 "A helper's report": a report recovered from the transcript is found by a one-off token the brief asked for, never a phrase the brief holds, and its saved size read before it is cited |
| 934 | MEMORY | `measure-context-before-reporting.md` extended ("Met again 11 Nov 26": with a compaction about to run, defer nothing in words; measure after it) — `_memory/additions-A-handoff.md` |
| 935 | FILED | [CHECK-TOOLS-HARDEN] addition (t), the same guard as 932 (met again; a reminder did not stop it) |
| 936 | APPLY | GD, the "There is no GitHub Pages site" bullet's "Done" loop: a wait waits for success, never for quiet; the committed wait script filed as [CHECK-TOOLS-HARDEN] (y) |
| 937 | APPLY | ON "Branches" (a later job joining a checked pull request is built on its own branch and fast-forwarded in once checked) and Part 2 "Pull requests" (runs read again minutes after a push); the stop-notice part is already in Part 2 |
| 938 | FILED | [RULE-FILE-LESSONS] (e), added: page room and the answers/changes trigger read before a batch of rows; its home is DECISIONS.md's steps, which a review may not draft |
| 939 | APPLY | BCO §7.0 "What can be chosen": a page fitted to the screen is walked at the narrowest desktop width above the phone split and a mid width beside the wide one, its sideways scroll at the narrow one |
| 940 | APPLY | BCO §6 the "where an input is filed / who counts as away" row widened to every READER of a changed input or setting (a day's kept settings, D2005), live warnings and counts included; checklist step 8's list of rows matched |
| 941 | APPLY | `.claude/skills/test-driven-development/SKILL.md` Verify GREEN, Confirm list: a new or changed test file passes the pipeline's own type check (a runner that strips types runs it green) |
| 942 | APPLY | SH Step 4 "Work that spans chats": a FULL build is split into chats from the start, its reading committed to a plan file before the first fix; the scheduler-load measurement filed as a [START-CONTEXT-AUDIT] addition |
| 943 | APPLY | WS §4: the calibrated-read line made every new pass/fail line, proved on a known-clean and a known-changed screen and read from one element, never the page's whole text; the clean-up line: take back by the app's own Undo button, never the undo keys |
| 944 | APPLY | ON Part 2 builder's brief: raw dumps outside the checkout, the commit a short summary and the pictures, its `git show --stat` read before the first push; [CHECK-TOOLS-HARDEN] addition (v), the push guard's size refusal |
| 945 | APPLY | SH Rules 3: a number carries its kind — D742, "skill note 742" — never bare, in a block, a backlog item or a brief |
| 946 | APPLY | SH Step 4 template, the Branch line: a commit that may not go live before a date is its own commit, named with the date and the choice |
| 947 | APPLY | SH Step 3 "Merged between chats": a nothing-is-waiting line read against the open pull requests; Step 1's new recommend-jobs bullet lists open pull requests first (927); [CHECK-TOOLS-HARDEN] addition (u), the removal guard |
| 948 | APPLY | GD, the settle step's mid-merge trap: one "did not arrive" can be real; a line only the branch has is carried into main's archived block |
| 949 | APPLY | DP §1a test 9: "alone" means without the writer's reasons, not without the word list's line and the line above; a second reading those settle is recorded, not sent back — one change with 952 |
| 950 | APPLY | BCO §6 wording row: the old words are also searched in every script that writes words a person reads (`scripts/` — guides, decks, exports) |
| 951 | FILED | [RULE-FILE-LESSONS] (f), added: a ruling number counts as taken only once another open chat can see it; the root (two chats, one folder) is already the memory note one-checkout-per-session |
| 952 | APPLY | DP §1a test 9: each item a whole line as a person sees it, a real value in every slot, never a table fragment; the writer reads the list before sending — one change with 949 |
| 953 | APPLY | MOCK §Judging, "This works like the existing X": a row standing for a check's output is staged and read back, or its values checked against what the check compares |
| 954 | APPLY | `raptor-port/docs/codex-guide.md` §Reading a commit that is not the branch head: the recipe as five numbered steps (step 3 makes it a repo); a handoff or brief points to it, never a fragment |
| 955 | APPLY | MOCK §The Method step 1: the phone at his iPhone's 402 x 874 (WebKit, touch, 3x), never a near size; another width only beside it |
| 956 | APPLY | MOCK §The Method step 6: a pure-style proposal drawn by injecting the exact rule and recorded then on the unchanged build; checked after with nothing injected |
| 957 | APPLY | SH Step 4 template: a Model field on the last line, and the Opening line field has the next chat compare the model it runs on and name a difference |
| 958 | APPLY | `.claude/skills/brainstorming/SKILL.md` Working in existing codebases, its first bullet sharpened: say how the product enters the same fact today; a new mechanism needs the reason the old cannot carry it |
| 959 | APPLY | MOCK §The Method step 6: a drawing script's one home is `raptor-port/docs/mock/<date>-<name>/`, never `scripts/`; the notes-only file-list check is already [REVIEW-LAYERS] step 3 |
| 960 | APPLY | MOCK §The Method step 3: where the element cannot hold a tag (a text box, a clipping panel) and the screen is still, the tag alone goes on the page, outline inside, crop takes every tag |
| 961 | APPLY | MOCK §Showing It, new bullet: with several parties' views of one thing, every picture keeps the part that names whose view it is, or the page says none does and offers a mark |
| 962 | APPLY | MOCK §The Method step 3: a new part's shared edge with its neighbour measured against the neighbour's first letter, failing above about 0.5px unless on purpose and captioned |
| 963 | APPLY | MOCK §Judging, "Choose the state by what it shows": a scroll-reached state asserted per device by co-visibility; where impossible, not drawn and said as a design finding |
| 964 | APPLY | WS §4, the "place measured to press later" line: what moves by itself at a press is measured inside the page by capture listeners, never by two round trips from the test runner |
| 965 | APPLY | WS §4: the same line's "after" read by a capture listener two frames on, never a bubbling one; the drag line: every mouse move written from a measured point, the page's presses and scrolls logged before a wrong landing is blamed on the app |
| 966 | APPLY | SH Step 4 "Work that spans chats", the same change as 942; the tier block's chat split is already the bug-check checklist's step 3 (read today) |
| 967 | FILED | new [CSS-SCOPE-GUARD] (`_docs/OUTSTANDING-items-B-mockups.md`) — met twice (728, 967), so a check in the wrapper stylesheet test; MOCK step 6 "From the picture to the build" points at it and asks for the computed-style assertion |
| 968 | FILED | new [ASK-PAGE-CHECK] (`_docs/OUTSTANDING-items-B-mockups.md`) — the rule is D1237, D1363 (how-we-work §Showing him; DP §8), broken a third time, so a pre-publish page check |
| 969 | APPLY | BCO §4 "Before a brief leaves", the EXPECTED-line bullet: a surface walked under two roles names each role's records, or says they differ and why |
| 970 | REFLECTED | how-we-work §Showing him: D2140 (every line checked against his rulings before he sees it, after this very lapse's chat 97) and D754 ("say its cost and which rulings it changes") |
| 971 | APPLY | MOCK §Judging, "Reusing an older drawing": every line of words the reused script draws is listed in the brief and checked against rulings made since |
| 972 | APPLY | `.claude/skills/test-driven-development/SKILL.md` Verify RED "Read the red": a premise asserted, never behind an `if` (one change with 979); BCO §8 point 4 gains the case and point 6 asks readers for every condition around an assertion |
| 973 | APPLY | MOCK §The Method step 3: a tag says a number he answers by or "New", never a review code or ruling number (D2164, which this event set); the page scan is [ASK-PAGE-CHECK] |
| 974 | APPLY | MOCK §The Method step 5: a helper's drawing brief gives purpose and his ruled words; shape and values read from the running app, differences reported, plan fixed first |
| 975 | MEMORY | js-replace-dollar-patterns extended: a JS string or template literal in an edit script eats backslashes; its first home (CLAUDE.md's editing traps) is not draftable and the script guard cannot see inside a script file |
| 976 | APPLY | WS §3: two people acting in turn share one tab (sign out and in) or the acting tab reloads; two live tabs are two devices, kept for §6's storage-writer step; a two-tab FAIL reproduced in one tab first |
| 977 | APPLY | `raptor-port/docs/codex-guide.md` the recipe's steps 1 (pathspec excludes) and 3 (longpaths, hooksPath, `git log -1` check); the junction already in GD; [CHECK-TOOLS-HARDEN] (g) widened |
| 978 | APPLY | `raptor-port/docs/codex-guide.md` the recipe's step 2 (the round's handoff block, briefs and reports taken out of the copy); the matching clause for BCO §4 under "For another file" |
| 979 | APPLY | `.claude/skills/test-driven-development/SKILL.md` Verify RED "Read the red": a fixture read back through the app's own loader, a failing control blamed on the fixture (one change with 972) |
| 980 | APPLY | BCO §4 "Before a brief leaves" (C's file, text under "For another file"): each reader's brief holds only its own job; a stopped run is never re-run on a reworded brief, its notes chased |
| 981 | APPLY | `raptor-port/docs/codex-guide.md` the recipe's step 4 (`-m gpt-6-astra` named, D2210; `< /dev/null`; a 90-second log check); GD's background-codex trap now points to the recipe |
| 982 | OPEN | logged by chat 120 during this review, after the rounds were put to him — for the next review (a change to the review method itself, in no round he approved) |
