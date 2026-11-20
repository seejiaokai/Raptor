# The fresh, blind Opus reader's report — the skill-notes review of 20 Nov 26 (a general-purpose helper on Opus, read-only, on the live checkout at commit b2314fc80; saved word for word as it came back, chat 121)

REVISE

No handoff block was pasted into my context, and I opened no `read-` file. I changed no file.

## Findings

**1. `raptor-port/docs/codex-guide.md`, the recipe, steps 1 and 3: the commands don't name the copy, so run as written they commit into the shared checkout**
- Passage: step 1 "`git archive <commit> -- . ':(exclude,glob)**/*.png' … | tar -x -C <copy>`"; step 3 "`git init -q`, `git -c core.longpaths=true add -A`, `git -c core.hooksPath=/dev/null commit -qm copy`, then `git log --oneline -1` must print that commit".
- Checked against: notes 954 and 977, the hard limits on a shared checkout (AGENTS.md: never delete data; one checkout per session), and the brief's ask that the recipe be "complete and runnable as written".
- What is wrong: no step moves into the copy, and step 3's commands are bare. Someone still in the repo root follows every step exactly:
  - `git init` re-initialises the real repo without complaint.
  - `add -A` stages every untracked walk picture and `raptor-port/.tmp/`.
  - The commit lands on the chat's branch with the hooks switched off, and `git log -1` "prints that commit".
  - That is the push-guard and commit-guard failure the same review files under (s) and (v), made by the recipe itself.
  - Also, `tar -x -C <copy>` fails unless the folder already exists, and `-- .` exports only the subtree you are standing in.
- Replacement for step 1: "1. **Export without the pictures**, from the repo root, into a new short scratch folder: `mkdir -p <copy> && git archive <commit> -- . ':(exclude,glob)**/*.png' ':(exclude,glob)**/*.jpg' ':(exclude,glob)**/*.gif' ':(exclude,glob)**/*.mp4' ':(exclude,glob)**/*.webm' | tar -x -C <copy>` — seconds; the whole tree ran past five minutes (19 Nov 26)."
- Replacement for step 3's commands: "`git -C <copy> init -q`, `git -C <copy> -c core.longpaths=true add -A`, `git -C <copy> -c core.hooksPath=/dev/null commit -qm copy`, then `git -C <copy> log --oneline -1` must print that commit — every git command here names the copy, never the checkout —". The rest of step 3 stays.

**2. `raptor-port/docs/bug-check-order.md` §4 "Before a brief leaves", the new bullet (note 980): it gives Astra a brief of his own, and asks for a file his read-only run cannot write**
- Passage: "Each reader's brief holds only its own job … Astra's brief asks for the code checked against the rulings and contracts it names, each finding written to its report as it is confirmed, so a stopped run keeps what it found."
- Checked against:
  - how-we-work §Models and readers: the fresh, blind Opus reader is "given the same brief" (D790's line).
  - The order's own §4 at about line 239 and the FULL row: "both models read the finished code and the same brief".
  - The recipe's step 4 in this same change: `-s read-only … -o <report>`.
- What is wrong:
  - **(a) Separate briefs.** "Astra's brief" carries note 980's second guard ("Astra gets a brief of its own"). A host will write Astra a separate, rules-worded brief while the Opus reader gets another. The two blind code reads then no longer answer the same question, against the same-brief rule. The note's real point is narrower: only the security reader's scope (D1411) leaves the shared brief.
  - **(b) A file Astra cannot write.** Under `-s read-only` Codex cannot write a report file as it goes. `-o` writes only the last message, at the end, so a stopped run leaves no report. What survives is the progress stream in the log. The bullet asks for something the recipe makes impossible.
  - On the writers' doubt: the bullet's last sentence does forbid re-running on a brief reworded after a stop, so it does not read as a way past a provider's check. That part is sound.
- Replacement for the bullet: "- Each reader's brief holds only its own job, decided when the brief is written: a paragraph meant for one reader (the security reader's scope, D1411, above all) goes in that reader's own prompt, never in the brief the two code readers share (§4: the same brief) — wording meant for one reader can stop another's run. The code readers' brief asks for the code checked against the rulings and contracts it names, and for each finding to be stated in the run's output the moment it is confirmed (a Codex read runs read-only, its log the only copy until it ends), so a stopped run keeps what it found. A stopped run is never re-run on a brief reworded after the stop: its log is read for claims, another reader is sent to chase any claim no other reader made, and the lost read goes on the reads-owed list (19 and 20 Nov 26: readers stopped by their provider in fix reads 5, 8, 9, 10, 11 and 13; a re-run on a cut brief was refused)."

**3. `raptor-port/docs/bug-check-order.md` §4, the blindness clause (note 978) lists less than the recipe step it cites**
- Passage: "from which the round's handoff block, builder briefs and reports are taken out (the recipe's step 2; …)".
- Checked against: codex-guide step 2, which takes out "the branch's `HANDOFF.md` block, and any builder brief, report or evidence sheet of this round".
- What is wrong: the clause leaves out the evidence sheet. Someone reading only the order keeps the round's evidence sheet in the copy. That sheet carries the walk's findings, which the blind reader must not see (how-we-work: "has seen neither the walk's nor any other reader's report").
- Replacement: "from which the branch's handoff block and the round's builder briefs, reports and evidence sheet are taken out (the recipe's step 2; …".

**4. `.claude/skills/brainstorming/mockups-on-the-real-app.md` step 3: the new page-laid tag contradicts "always, never" two sentences above it**
- Passage: "is drawn ON the element … always, never as a box laid over the page at measured coordinates", followed by the new "Where the element cannot hold a tag … the tag alone goes on the page (fixed, placed from the element's box just before the picture, above everything)".
- Checked against: note 960, and the same paragraph's drift reason (16 and 20 Oct 26).
- What is wrong: the new sentence is a reasonable, narrow exception (a still screen, placed just before the picture). But "always, never" still stands unqualified, so the paragraph contradicts itself. A helper either refuses the exception or reads "always" as gone and lays tags over a gliding layer, the 16 and 20 Oct fault.
- Replacement for the earlier clause: "is drawn ON the element (an outline, which takes no room, and a tag in its own `::before`), never as a box laid over the page at measured coordinates — the one exception, a tag on a still screen, is below:". The new sentence stays as drafted.

**5. `raptor-port/docs/design-practices.md` §1a test 9: the exception lets the writer overrule a reader who already had the context**
- Passage: "one that differs, or a second reading, is a lost fact and the wording goes back — except a second reading that the line above it or the word list settles, which is recorded beside the wording".
- Checked against:
  - Note 949: readers "given only the two sentences" reported the stripped context as ambiguity.
  - The same test's "never the chat that wrote it, who knows what was meant and cannot see a second reading".
  - D825 and D836, with D2230's approved "cold read loosened".
- What is wrong: the draft's first half now gives the reader the word list's line and the line above. A second reading that survives that context is a real one: a person at the screen has no more than that. Yet the exception lets the writer, the one person test 9 says cannot see a second reading, judge that the same context "settles" it and keep the wording.
  - Concrete: a reader given the word list's line for "pending" still reads the note two ways. Under this draft the writer records it and sends nothing back.
  - The loosening he approved was for context the reader lacked. That still fits, scoped to what the reader was not given.
- Replacement: "… is a lost fact and the wording goes back — except a second reading that the screen settles beyond what the reader was given (where the note sits, a control beside it), which is recorded beside the wording with what settles it (15 Nov 26: OIL and "pending" read two ways by a reader given neither); one the reader names with the word list's line and the line above in hand is a lost fact like any other."

**6. `.claude/skills/session-handoff/SKILL.md` "Work that spans chats": every FULL build is now split, a rule wider than the checklist it cites**
- Passage: "A build sized FULL — a batch of three or more items above all — is split into chats from the start, as the bug-check checklist's step 3 names them".
- Checked against:
  - The checklist's step 3: "A FULL check names its chats too **when** its start plus what its area pages will load … leaves too little room".
  - Note 966 ("a batch of three or more items is sized FULL") and note 942 (commit the reading to a plan file).
  - D2229: the room is now 600,000.
- What is wrong: the draft makes the split unconditional for every FULL build. That says more than both notes and contradicts the step it points to. A one-item FULL fix with room to spare is forced into two chats, two start-up loads and a handoff it does not need.
- Replacement: "A build sized FULL is split into chats from the start when the bug-check checklist's step 3 finds too little room — a batch of three or more items is presumed to — and its reading of the code is written to a plan file and committed before the first fix (13 and 17 Nov 26: the reading and the build alone filled 76% and 85%)."

**7. `.claude/skills/session-handoff/SKILL.md` Step 1, the own-folder sentence: note 921's half for the new chat is not carried**
- Passage: "First list the live chats (`ListAgents`) and say where you are: … If that shows changes you did not make, or another live chat works in this folder, do not switch branches here …".
- Checked against: note 921, "A new chat lists the live chats and messages the block's writer BEFORE its first heavy read". Disposition 921 says the new chat's half is "the opening line's live-chats check".
- What is wrong: the drafted check uses the live-chats list only to decide the folder.
  - Run against 921's own case: chat 56 (compacted, carrying on) and two fresh chats opened with the same line. The two fresh chats would list the live chats, find their own folders clean, and each go on to read the 46,000-token guide.
  - The outgoing chat's pushed "taken back" line helps only once a new chat has read the block. The new chats never learn that someone holds the job.
- Replacement: insert after "level with `origin/main` or not." the sentence "If a live chat already holds this job — the block's writer, or one opened with this same line — message it before any heavy read."

**8. `raptor-port/docs/walk-scripts.md` §4, the calibrated-read rewrite (note 943) drops a safeguard**
- Passage, old: "an assertion that something did NOT happen is run once on a state where it did". New: "every pass/fail line a new script prints is run once on a screen known to be clean and once on one known to be changed".
- Checked against: question 3 (does a rewrite drop a safeguard), and note 943.
- What is wrong: the old rule covered every negative assertion. The new one covers only "a new script". A "not picked" check added to an existing script, the common case, no longer has to be calibrated. That is the 31 Oct 26 class of false pass.
- Replacement: "every pass/fail line a script prints for the first time — a new script's, or a new line in an old one — is run once on a screen known to be clean and once on one known to be changed …". The rest stays.

**9. `raptor-port/docs/bug-check-order.md` §7.0 (note 939): a required width sits under "What can be chosen"**
- Passage: the new sentence "A layout change to a page that fits the screen or scrolls inside itself is walked at the narrowest desktop width just above the phone split and at a mid width …", appended to "**What can be chosen:**".
- Checked against: note 939 (name these widths in the sizing step) and the bullet's own split between "the required ones" and what is chosen.
- What is wrong: inside a list of optional choices, the sizer reads these widths as optional. The two faults of 13 Nov 26 came back from exactly that reading.
- Replacement: delete the appended sentence, and change the parenthesis to "(phone and desktop width always, §7.2's short screen where it applies, and — for a layout change to a page that fits the screen or scrolls inside itself — the narrowest desktop width just above the phone split and a mid width, its sideways scroll walked at the narrow one: 13 Nov 26, two faults only a narrower window shows were found by the code readers, not the walk)".

**10. `.claude/skills/test-driven-development/SKILL.md` Verify GREEN (note 941; the writers' doubt): the browser tests get no type check here, so the line passes them unchecked**
- Passage: "A new or changed test file passes the pipeline's own type check — a runner that strips types without checking them (Vitest, esbuild) runs a mistyped test green, and the build then fails it".
- Checked against:
  - `raptor-port/tsconfig.json`: references app and node only. `tsconfig.app.json` includes `src`; `tsconfig.node.json` includes only `vite.config.ts` and `playwright.config.ts`. The build is `tsc -b && vite build`.
  - The project guide's "Verified vs assumed, always distinguished".
- What is wrong: for a new `e2e/*.spec.ts` the pipeline runs no type check at all. A browser test with a mistyped property passes this rule as written: the builder says "type check passed", Playwright strips the types, the build never reads the file, and "the build then fails it" is untrue. A wrong property can make an assertion compare `undefined` and pass on broken code.
  - The line is the right home and right for unit tests under `src`. It needs a clause for a folder no check covers.
- Replacement: "- A new or changed test file passes the pipeline's own type check — a runner that strips types without checking them (Vitest, esbuild) runs a mistyped test green, and the build then fails it; a test folder the pipeline's check does not cover is named as unchecked in the report, never called checked".

**11. The backlog additions for `[RULE-FILE-LESSONS]` (`_docs/OUTSTANDING-items.md`, group D): the item's count goes stale**
- Passage: the instruction changes only the heading's parenthesis, "(skill notes 733, 734, 859, 860, 938, 951; …)".
- Checked against: the live heading "### [RULE-FILE-LESSONS] Four lessons whose only home …" and the priority line "- [RULE-FILE-LESSONS] — four lessons for the rule files …".
- What is wrong: after (e) and (f) the item holds six lessons. Both the heading and the one-line index would still say four. The index line is what a "recommend the next jobs" chat reads (note 927's own lesson).
- Replacement: in the install instruction, add: "and 'Four lessons' becomes 'Six lessons' in the heading; the priority line becomes `- [RULE-FILE-LESSONS] — six lessons for the rule files and the steps for recording a ruling — his word.`"

**12. `.claude/skills/test-driven-development/SKILL.md` "Which other tests?" (note 928) and the register's change 8 row: a project path in a vendored skill, and a row that misnames the change**
- Passages: "(here `src/ui/html.test.ts`, the week; a deliberate difference added to its list in the same change)"; and the register row "GREEN 'Which other tests?': the whole-output tests of a builder whose drawing changed".
- Checked against:
  - `_review/helper-brief.md` rule 5: a lesson holding the project's specifics stays out of a vendored skill's general text.
  - The live TDD skill, which names no project path today (grep for `src/` finds none).
- What is wrong:
  - The first project file name in that skill is lost or garbled on the next upstream refresh. Its real home is the project's gates guide, beside 928's other half.
  - The row's "whose drawing changed" reads as a mock-up drawing, not the builder's output.
- Replacement in TDD: "every test that compares a builder's whole output with a reference, for any change to what that builder draws — found by the builder it covers, a deliberate difference added to its list in the same change". Add to `raptor-port/docs/gates-and-deploy.md`, after the new `lint:changed` trap: "A change to what the week's builder draws (`src/ui/html.ts`) also runs `src/ui/html.test.ts`, which compares the whole week word for word and holds none of the changed words (11 Nov 26)."
- Register row: "… GREEN 'Which other tests?': the whole-output tests of a builder whose output changed …"

## Running the drafts on real cases (Step 8)

- **Note 923's case** (chat 59: started fresh, clean, level with `main`), under the drafted opening sentence. It lists the live chats, finds its folder clean, the condition is false, and it stays where it is. The absolute path removes the `.claude/worktrees/` landing. Pass.
- **Note 936's case** (main's run failed downloading the test browser), under GD's "a wait waits for success". The run did not conclude success or skipped, the failed step is read, and it is called infrastructure, not code. Pass.
- **Note 930's case** (a new file read the requests store; a guard test went red on GitHub), under the overnight builder brief. The brief now names GD's two tests that scan source text. `src/engine/inputs-readers.test.ts` is the guard that failed, so it would have run. Pass.
- **Note 919's rename** against `raptor-port/docs/handpass/2026-11-16-warn-words-followups.md`, "(§7.11 lesson 23, side-by-side boxes)". The reader opens 23, finds the tap lesson, and 23b's note "older sheets … cite it as 'lesson 23'" plus the content settles it. The first 23's citations (D1722's full row, `lw-d1722-walk.mjs`, `walk-ledger.md`) stay right. Two scripts already wrote "lesson 23b". The rename is safe. Pass.
- **Note 921's case** under the drafted handoff guide. It fails; see finding 7.
- **Note 966's case** (a four-item batch sized FULL). It splits correctly. But a one-item FULL engine fix with room at 600,000 is also forced to split; see finding 6.
- **A case that passes every drafted rule and is still wrong:**
  - A helper follows codex-guide steps 1 to 5 literally from the repo root (finding 1). Every step's condition is met: `git log --oneline -1` prints a commit. That commit is the shared checkout's untracked pictures, made on the chat's branch with the hooks off.
  - A second case: a new browser test with a mistyped field passes "the pipeline's own type check" by default (finding 10).

## Notes (not findings)

- **`ListAgents` (916, 951's (f)):** `shipping.md`, always loaded, already names it, so the drafts are consistent. It was not among my own tools as a helper. If a chat without it is possible, "where the chat has it; otherwise say so" would keep the pasted line from becoming an order nobody can carry out.
- **The overnight figures (D2229):** 450,000 of 600,000 (75%) and 576,000 (96%) match the full row. No 300,000 / 384,000 / 400,000 is left in the overnight or handoff drafts.
- **The handoff guide's cut of "Look before the push":** the command and the rule stand nearly word for word in `shipping.md` §The loop (always loaded; also on Codex's read-first list), and the push guard backs it. Nothing in the guide pointed at the paragraph. The cut is safe.
- **Note 920's mechanism:** the archive tool's byte-for-byte refusal already enforces it. The line tells the agent how not to trip it, which is enough.
- **922, 924, 925 (doc-budget §2):** a sound home; nothing always-loaded says it. One wrinkle: the bullet is headed "Before a rewrite goes to its readers", but a saving is quoted to him earlier, on the list he approves. A heading like "Before a rewrite's list goes to him, and before its readers" would match note 924's timing. `writing-plans` Self-Review 4 (change 7) partly overlaps 924; there is no conflict.
- **951 and 968 FILED:** each adds something the rulings do not require. 951 adds the uncommitted-rows check before taking a number. 968 adds a script after a third break of D1237 and D1363. FILED is right.
- **Note 973:** the note wanted tags of "New" or nothing. The draft keeps numbers he answers by, which fits step 4 and D2164's reading. That is fine.
- **Note 980's wording:** apart from finding 2, it reads as a decision about scope made when the brief is written, not a workaround after a stop.
- **Size:** the mock-up guide grows 18,956 → 22,330 bytes for 12 lessons, about 280 bytes each, in house style. Cuts if wanted:
  - 962's tail "— a reused recipe brings its own alignment" (the story already says it).
  - Folding 956's pure-style sentence into the existing "A reproduction written as assertions of the RIGHT behaviour, with a hook that injects a candidate stylesheet" bullet.
  - Finding 4's fix shortens step 3 a little.
  - The handoff guide's 5% growth is offset by its cut; nothing to name.
- **Subagent-driven-development:** 931's bullet brings the first dated project story ("11 Nov 26") into that skill. That is harmless, but it is the kind of project detail rule 5 keeps out.
- **Verified by running:** `codex exec --help` lists `-m`, `-c`, `-s`, `-C`, `-o/--output-last-message` and `--skip-git-repo-check`. The code check accepts `--include-untracked`.
- **The register rows (change 8)** match what the drafts change in brainstorming (the SKILL bullet plus 12 mock-up lessons), TDD (apart from finding 12's wording) and subagent-driven-development.
- **The letters (s) to (z):** GD's wait script (y), codex-guide's and the order's (g), the mock-up guide's `[CSS-SCOPE-GUARD]`, and dispositions 917 (s), 932 and 935 (t), 947 (u), 944 (v), 919 (w), 926 (x), 936 (y) and 928 (z) all point at the right paragraph of the merged additions. Two helper reports used other letters (A's h–k, D's t for the wait script); the merged file and the drafts settled them consistently.

## Rows sampled

- **APPLY**, each note opened and its draft read: 916, 918, 920, 921, 922, 923, 924, 925, 927, 928, 929, 930, 931, 933, 936, 937, 939, 940, 941, 942, 943, 944, 945, 946, 947, 948, 949, 950, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 969, 971, 972, 973, 974, 976, 977, 978, 979, 980, 981.
- **REFLECTED, FILED and MEMORY**, checked against the place or item named: 915, 970 (REFLECTED); 917, 919, 926, 932, 935, 938, 951, 967, 968 (FILED); 934, 975 (MEMORY).
- **Full rulings rows opened:** D2229 (from `origin/main`), D2230, D2164, D825, D832, D836, D2210, D761, D1086, D2005, D1797, D1411, D790, D1671, D878.
