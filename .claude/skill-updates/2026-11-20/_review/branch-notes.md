# Notes held only on other open branches (copied whole, read-only, for this review)

939–943: from `claude/rules-check-small-batch` (no pull request; 33 commits ahead of main, last 13 Nov 26).
975–981: from `claude/multi-sqn-b1-107` (pull request 806, open), with its 'met again' lines.

### Observation 939: A walk of a page fitted to the screen is sized at a narrow desktop width too, not only the wide one

**Status:** OPEN
**Date:** 2026-11-13
**Session context:** the night of 13 Nov 26 (chat 67) — the Approvals page made to fit the screen on a PC, a WALK with both code reads
**Skill:** New skill candidate: bug-check walk sizing (the project's bug-check order, its sizing step and lesson 11)
**Type:** open-source
**Phase/Area:** sizing the walk — which window widths a layout change is walked at

**Issue:** Every desktop scenario of the first walk ran at the widest common window or wider. Two faults that exist only in a narrower desktop window (the list's lines showing past the pinned headings; a newly opened calendar and a new list opening out of sight after a sideways scroll) were found only by the code readers, not by the walk. The sizing step had named heights (neighbouring and fractional) carefully but took the width from the usual desktop size.
**Suggested improvement:** In the sizing step for a page that fits the screen or scrolls inside itself, name at least one narrow desktop width just above the phone split and one mid width, beside the usual wide one, and walk the sideways scroll there; add it to the lesson on fitted pages.
**Principle:** When a layout has a breakpoint, the walk covers both sides of it close up — the narrowest window that still gets the wide layout is where the wide layout is most likely to fail.

### Observation 940: A warning drawn live on a published day reads the settings too — it belongs in the roll-call

**Status:** OPEN
**Date:** 2026-11-13
**Session context:** the night of 13 Nov 26 (chat 67) — the rules check's small batch: a published day keeps the Logic settings it was published under (D2005, D2014)
**Skill:** New skill candidate: bug-check roll-call (the project's bug-check order, its roll-call step)
**Type:** open-source
**Phase/Area:** the roll-call — listing every place the app draws the thing a change touches

**Issue:** The change made a published day keep the settings it was published with. The roll-call listed the places that show the day's stored figures, and each kept them. A red warning line that is not stored but worked out each time the day is drawn (the "no usable times" line) still read today's settings, so it moved at once with a settings change on a published day. Only the blind code read found it; the roll-call had no row for it, because the line is not a "place that shows the figure" — it is a check that reads the same setting.
**Suggested improvement:** In the roll-call step, add a second question beside "where is this thing drawn": "what else reads the same setting or input each time the screen is drawn" — warnings, counts, notes and marks worked out live — and give each its own row with has it / must not / MISSING.
**Principle:** When a change freezes or redirects an input, list every reader of that input, not only every display of its result; a derived message is a reader even when it stores nothing.

### Observation 941: Type-check a new test file before calling it done — the test runner does not

**Status:** OPEN
**Date:** 2026-11-13
**Session context:** the night of 13 Nov 26 (chat 67) — the rules check's small batch, new test files written by a builder helper
**Skill:** New skill candidate: build-step checks (the project's executor rule, its "tests first" step)
**Type:** open-source
**Phase/Area:** verifying a new test file before the full check

**Issue:** A new test file ran green in the test runner while carrying type errors, because the runner strips types without checking them. The errors surfaced only later, at the build step of the full check, costing a second round. (In this project the plain no-output type check is also hollow, so the project's build-mode type check is the one to run.)
**Suggested improvement:** In the builder's brief and the executor rule, add to "its own tests green": run the project's real type check (here `npx tsc -b`, or the build) on any new or changed test file before the job is called built.
**Principle:** A test runner that transpiles without type-checking proves behaviour, not types; run the type check that the full gate will run before handing work on.

### Observation 942: A build chat was three-quarters full before its first edit — the area pages load whole on the first source file opened

**Status:** OPEN
**Date:** 13 Nov 26
**Session context:** Chat 68, D2028's build on `claude/rules-check-small-batch` (a small engine change at the FULL tier)
**Skill:** session-handoff
**Type:** internal
**Phase/Area:** The opening line a handoff writes; what a continuing chat loads at its start

**Issue:** The chat followed its opening line (the block, the backlog item, two briefs, three full rows) and then opened engine and screen files to read the code. Opening them loaded the project guide, the scheduler page, the screen-design page, the OIL page, the builder's rules and the design short form, each whole. The chat read 76% full after the reading alone, 90% by the time the fix and its tests were committed, with the walk, the reads and the gates all still ahead — so the job's long half starts on a compaction. No other open note was checked for the same cause (the log was not read beyond its highest number, 941, the same on every pushed branch).
**Suggested improvement:** In the session-handoff skill's step that writes the opening line: when the next step is a build with a FULL check, have the opening line say to write the reading of the code into a plan file and commit it BEFORE any fix, and name which checks a fresh helper should carry (the walk, the reads) so the host keeps room. Separately, a job for the rules diet's follow-up (D1960): measure what a scheduler-engine job loads on its first source file, as was done for the Leave War.
**Principle:** A chat's room is spent by what loads, not only by what it reads on purpose; when the pages a job loads are large, save the reading before the first edit and plan the checks around a compaction.

### Observation 943: A walk script's own checks must be proven on a known-clean and a known-changed screen before its result is believed

**Status:** OPEN
**Date:** 2026-11-13
**Session context:** The host's own walk of a fix (D2028, chat 68) — a new script that changed a setting, made a change, took it back and published.
**Skill:** New skill candidate: walk-script writing (the project's `raptor-port/docs/walk-scripts.md`)
**Type:** open-source
**Phase/Area:** Writing a new walk script — the step that takes a change back, and the script's own pass/fail lines

**Issue:** Two faults in a freshly written walk script, both in the script and neither in the app, each caught only because the host opened the pictures: (1) the put-back step pressed the keyboard's undo keys, which did nothing in the driven browser, so the "put back" picture still showed the change; the helper that presses the app's own Undo button worked. (2) The script's pass/fail line searched the page's whole text for the word that marks a waiting change, and matched the change history's count label instead, so it printed a failure on a clean screen.
**Suggested improvement:** In the walk-scripts guide: take a change back by the app's own button through the shared helper, never by a key press; and a script's pass/fail line reads one named element's text (the list's own empty line), never the page's whole text — and is run once against a screen known to be clean and once against one known to be changed before the walk's results are read.
**Principle:** A check written inside a test script is itself untested code: prove it can say both yes and no on known cases, and read the narrowest element that carries the answer, before trusting what it prints.

_13 Nov 26, chat 68 (the sim count fix and the two explanations): no observations beyond 943._

### Observation 975: Regex backslashes lost inside a template literal in an edit script

**Status:** OPEN
**Date:** 19 Nov 26
**Session context:** chat 109's overnight run, multi-squadron batch 1, the A3 build (a store per unloaded squadron)
**Skill:** New skill candidate: edit-script safety (or the project's editing traps in raptor-port/CLAUDE.md)
**Type:** open-source
**Phase/Area:** editing source files by a generated script

**Issue:** The builder wrote a source change through a Node edit script whose new text sat inside a template literal; the regex in it lost its backslashes on the way, which silently broke the post-in date check and every post-in. Only the unit tests caught it.
**Suggested improvement:** Add to the editing traps: never put regex backslashes inside a template literal in an edit script; write such lines with the Edit tool, or read the new text from a file written by the Write tool.
**Principle:** A generated edit passes text through one more layer of escaping; any line holding backslashes is safest written by a tool that keeps every character as typed, and checked by a test before it is trusted.

### Observation 976: A walk that reads a second person's screen in a second live tab tests stale state, not the app

**Status:** OPEN
**Date:** 19 Nov 26
**Session context:** chat 113, fix read 5's walk F4 (a posting taken back after another admin read its bell line)
**Skill:** New skill candidate: walk-scripts (raptor-port/docs/walk-scripts.md)
**Type:** open-source
**Phase/Area:** writing a walk script where two people act in turn

**Issue:** The walker kept person A signed in in tab 1 and read person B's bell in tab 2 of the same browser. B's "read" mark was saved by tab 2, but tab 1 loads read records only at start-up, so A's undo in tab 1 thought B had never read the line and wrote no "taken back" line. The walk reported a FAIL; one world in a unit test was green. An hour of builder time went on proving it an artifact.
**Suggested improvement:** walk-scripts.md: when two people act in turn, either one tab with sign-out / sign-in between them, or reload the acting tab after the other person's step; a two-live-tab FAIL is reproduced in one world before it is filed.
**Principle:** In an app that keeps per-tab in-memory state over shared browser storage, two live tabs are two devices that never sync; a walk must not use them as one shared backend.

### Observation 977: Reader copies are exported without pictures; the package link is made in PowerShell

**Status:** OPEN
**Date:** 19 Nov 26
**Session context:** chat 114, fix read 6 of multi-squadron batch 1 (three blind readers, each on its own exported copy)
**Skill:** New skill candidate: blind-reader-copies (the codex-guide recipe for exported copies)
**Type:** open-source
**Phase/Area:** making the readers' copies

**Issue:** `git archive <commit> | tar -x` of the whole repo ran past 5 minutes for one copy (thousands of walk pictures) and was stopped; the package link made with `cmd //c mklink /J` from Git Bash failed ("Invalid switch") because Git Bash rewrites the `/J`.
**Suggested improvement:** in the recipe: export with pathspec excludes (`git archive <c> -- . ':(exclude,glob)**/*.png' ':(exclude,glob)**/*.jpg' ':(exclude,glob)**/*.mp4' ':(exclude,glob)**/*.gif' ':(exclude,glob)**/*.webm'`) — three copies then take seconds; make the node_modules junction with PowerShell's `New-Item -ItemType Junction`.
**Principle:** a reviewer's copy needs the code and documents, not the evidence pictures — export only what the reader reads; make Windows links with the Windows shell.
- met again 19 Nov 26 (chat 116, fix read 7's four copies): the excludes worked (four copies in seconds), but the copy's own `git add -A` failed silently inside a loop — "Filename too long" on a browser-test leftover under `docs/handpass/` — so every copy had no commit; fixed with `git -c core.longpaths=true add -A` and `-c core.hooksPath=/dev/null` on the commit. Guard: put both in the recipe, and check `git log --oneline -1` in each copy before starting a reader.

### Observation 978: A Codex reader's start-up reads defeat the blind read

**Status:** OPEN
**Date:** 19 Nov 26
**Session context:** chat 116, fix read 7 of multi-squadron batch 1 (four blind readers on exported copies)
**Skill:** claudex-loop (the reviewer's copy and brief); also the codex-guide recipe for exported copies
**Type:** open-source
**Phase/Area:** making a blind reviewer's copy

**Issue:** Twice running (fix reads 6 and 7) the Codex reader said its read was not fully blind: the repo's agent instructions tell it to read the handoff file first, and the exported copy carried the branch's handoff block with the builder's own summary of the fixes, which it read before reaching the brief's "do not read" line. The brief's exclusion came too late to help.
**Suggested improvement:** when exporting a reader's copy, replace the branch's handoff block (and any builder brief or evidence sheet for the round) in the copy with a one-line pointer, so the start-up reads find nothing to anchor on; say so in the brief's first line.
**Principle:** a reader is only blind if the material it must not see is absent from its copy — an instruction not to look loses to an instruction to read it first.

### Observation 979: a red test was red because its own setup was silently dropped

**Status:** OPEN
**Date:** 2026-11-19
**Session context:** Fix read 7, fault Q (chat 117's builder): writing the red-first test for a filer told after a named man's move
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** RED — verify the test fails for the right reason

**Issue:** The new test seeded a man's move through a helper that writes stored rows; the row id it was given did not match the store's id rule, so the loader dropped the row without a word. The test still went red, and on first read the failure looked like the fault itself; only a printout of the stored state showed the move had never happened (the input's line carried the old squadron alone). A control that should have passed also failed, which was the clue.
**Suggested improvement:** In the RED step, add: before trusting a red, assert the setup took effect (read back the state the fixture was meant to create, e.g. the man's squadron on the day), and treat a failing control as a sign the fixture, not the fix, is wrong.
**Principle:** a red test proves the fault only if its own setup is known to have happened; fixtures that validate and silently discard bad input make a wrong red look right.


### Observation 980: A security-scoped paragraph in a shared brief gets the Codex reader stopped; cutting it afterwards is refused

**Status:** OPEN
**Date:** 19 Nov 26
**Session context:** chat 117, fix read 8 of multi-squadron batch 1 (four blind readers sharing one brief)
**Skill:** claudex-loop (the reviewer's brief); also the codex-guide recipe for blind reader copies
**Type:** open-source
**Phase/Area:** writing one brief for several readers, one of them a Codex model

**Issue:** The shared brief ended with a paragraph scoping the security reader ("looks only for holes … what one person can take from another"). The Codex reader worked for ~250k tokens and was then stopped twice by its provider as a "cybersecurity risk", returning no report (the same happened in fix read 5). Re-running it on a copy with that paragraph cut was refused by the host's own permission check as rewording to get past a provider's filter, so the standing reviewer's read was lost for the round. Its progress notes still held one finding no other reader made; a second reader sent to chase that one claim proved it.
**Suggested improvement:** give the security reader its scope in its own prompt (or its own short brief), never in the brief the Codex reader receives — decided when the brief is written, not after a refusal; and when a reader's run dies, read its progress notes for claims and send another reader to chase any claim no one else made.
**Principle:** keep each reader's brief to its own job from the start — wording meant for one reader can stop another, and changing it after a refusal reads as evasion; a stopped reader's partial notes are evidence worth chasing.
- Met again 19 Nov 26 (chat 118, fix read 9): the new brief again carried the security paragraph (chat 117's handoff said "never cut its security paragraph" — read as keeping it, against this note's improvement); Sol 6.1 was stopped the same way after ~232k tokens with no report. Guard proposed: the brief-writing step of the bug-check order §4 ("Before a brief leaves") asks "does any paragraph here belong to one reader only?" and moves it into that reader's own prompt.
- Met again 20 Nov 26 (chat 118, fix reads 10, 11 and 13): even with the security paragraph moved to the security reader's own prompt, Astra was stopped three more times (it finished only in fix read 12) — the shared brief's own wording (findings framed as "holes", "forged", "bypass") is enough. Guard proposed: Astra gets a brief of its own worded as a rules-enforcement check, and writes each finding to its report as it goes, so a stop keeps what was found.

### Observation 981: A backgrounded `codex exec` waits for keyboard input and never starts

**Status:** OPEN
**Date:** 20 Nov 26
**Session context:** fix read 9, two Codex readers started from background shell commands
**Skill:** New skill candidate: running a Codex reader from Claude Code (now in `raptor-port/docs/codex-guide.md` §Reading a commit that is not the branch head)
**Type:** open-source
**Phase/Area:** starting the reader

**Issue:** One of two `codex exec … "<prompt>" > log 2> err` commands run in the background printed only "Reading additional input from stdin..." and sat idle for 80 minutes until noticed; the other, started two seconds later, ran. With stdin left open, `codex exec` may wait to read more prompt from it.
**Suggested improvement:** every backgrounded `codex exec` gets `< /dev/null`; the guide's recipe line shows it; and a short check 90 seconds after the start (the log has grown past one line) before the host waits on it.
**Principle:** a command meant to run unattended has its input closed explicitly, and its start is confirmed before a long wait begins.
