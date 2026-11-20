# The fixes after the two blind reads — the skill-notes review of 20 Nov 26 (chat 121)

Both readers said REVISE: Astra 9 findings (`read-astra.md`), the fresh Opus reader 12 (`read-opus.md`); four were the
same point. The host checked each against the files before acting (the recipe's bare commands, the type check's
`include` lists, the code check's `origin/main` base, the paragraph in the mock-up guide); every finding was taken.
Where the two differed, the narrower reading within his approval (D2230) was taken.

| Finding | What changed |
|---|---|
| Astra 1, Opus 1 — the reader-copy recipe ran its git commands in the checkout | codex-guide step 1: a new, empty folder at a short absolute path outside the checkout, `mkdir -p` first; step 3: every command `git -C <copy>`, each only after the last succeeded, `rev-parse --show-toplevel` must name the copy; the same in `[CHECK-TOOLS-HARDEN]` (g)'s addition |
| Astra 3, Opus 2 — 980's bullet: a separate brief for Astra; a report file a read-only run cannot write | BCO §4: the security reader's scope (D1411) in its own prompt, never in the brief the code readers share (the same brief, D790); findings stated in the run's output as confirmed — `-o` holds only the last message, the log is the only copy; a stopped run's log read for claims |
| Opus 3 — 978's clause left out the evidence sheet | BCO §4 blindness clause matches the recipe's step 2 |
| Opus 4 — "always, never" beside the new exception | MOCK step 3: "(the one exception, a tag on a still screen, is below)" |
| Opus 5 — the cold-read exception let the writer overrule a reader who had the context | DP §1a test 9: only a second reading the screen settles beyond what the reader was given is recorded; one named with the word list's line and the line above in hand goes back (note 949's own improvement; within D2230) |
| Astra 4, Opus 6 — every FULL build split, against the checklist's "when" and the unattended one-chat rule | SH "Work that spans chats": the plan file always; the split when step 3 finds too little room, a batch of three or more presumed to; an unattended run stays in one chat (D667, D867) |
| Opus 7 — 921's new-chat half not carried | SH Step 1 sentence: "If a live chat already holds this job … message it before any heavy read"; and where a chat has no `ListAgents`, it says whose the folder is cannot be checked and takes the worktree (both readers' note) |
| Opus 8 — the calibrated read narrowed to "a new script" | WS §4: "a script prints for the first time — a new script's, or a new line in an old one" |
| Opus 9 — required widths under "What can be chosen" | BCO §7.0: the narrow and mid desktop widths moved into the required sizes' parenthesis |
| Astra 6, Opus 10 — the browser-test folder has no type check | TDD Verify GREEN: the check confirmed to include the file, else the file named not type-checked |
| Opus 11 — `[RULE-FILE-LESSONS]` would still say "four" | the install instruction: "Six lessons" in the heading and the priority line |
| Opus 12 — a project path in the vendored TDD skill; the register's "drawing" | TDD: the path dropped; GD gains the week builder's whole-output test line beside the code-check trap; register "output changed" |
| Astra 2 — the report token is found in the brief first | ON Part 2: a report recovered from the named helper's final reply, the token checked inside it |
| Astra 5 — a failing control blamed on the fixture outright | TDD "Read the red": the fixture first, then the code, never the control's expected result; the geometry sentence its own paragraph; register row |
| Astra 7 — a pure-style rule injected out of its cascade place | MOCK step 6: the rule drawn in the place it will take — an existing rule corrected in place (Traps), a new one injected; register row |
| Astra 8 — the code check's count is against `origin/main`, not `git status` | GD trap: check the intended new files were read; the count is against its base |
| Astra 9 — "the longer line is the newer" | GD settle-step trap: which wording is newer read from the history and the rulings, never its length |

**Notes taken:** 938's addition chooses the area by its subject (D137), then checks room, raising a limit where D2148
allows (Astra); doc-budget's bullet now runs before a rewrite's list goes to him as well (Opus); 931's dated story left
out of the vendored subagent skill (Opus); two cuts — MOCK 962's tail, SH's dates after the own-folder sentence.
**Not taken:** the other cuts offered (the mock-up guide's dated cases stay, the house style keeps each lesson's date).
