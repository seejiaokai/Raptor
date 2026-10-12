# Two backlog items this review files — added to `OUTSTANDING.md` only after he approves

Each goes in as its own `###` item with a line in the priority list ("his to place"). The notes they carry are
marked ACTIONED as "filed", as the 24 Sep 26 review did for the background-command guard.

### [SHELL-SCRIPT-GUARD] A guard that refuses a script typed into the shell — eighteen skill notes ask for it (filed 13 Oct 26 by the skill-notes review; needs his go — a tool that runs by itself, as D162 was)

**What keeps happening.** On this PC a script handed to the shell inline (a here-document, `node -e`, `python -c`)
loses its backslashes or fails on an apostrophe, often with no error: a regular expression arrives as a backspace
character, a test asserts the wrong pattern, a file is written with real line breaks inside a string. The rule
("write the script to a file with the file tool, then run the file") has been in memory since 28 Sep 26
(`bash-heredoc-apostrophes-fail`, `node-e-in-git-bash-mangles-escapes`, `python-edits-crlf-trap`) and in several
handoffs — and the same mistake was logged again in twelve later chats, three times in the chat after a note said
"stop adding notes and build the guard" (observations 246, 259, 402, 411, 415, 469, 472, 495, 500, 512, 518, 526; in
part 248, 311, 328). The same family: an in-place stream edit (`sed -i`) that rewrote a whole file's line endings
(403, 460).

**To build (small; no app code):** a check that runs before every shell command, as the background-command guard
does (`.claude/hooks/bg-cwd-guard.mjs`, D162), and REFUSES, with the sentence "write the script with the Write tool
and run the file": (1) a here-document, or an inline `-e` / `-c` script, whose body holds a backslash followed by a
letter or an apostrophe and which writes or edits a file; (2) `sed -i` on a tracked file ("use the editor tool").
**Conditions from two notes about writing such a guard:** it is wired `if …; then …; else exit 0; fi` — the
`test && run || exit 0` form turns its own refusal into "allowed" (270) — and proved live with one refused and one
allowed command; what it assumes about the harness is MEASURED first and written at its head, and its tests take the
environment as an input (285). **A cheaper alternative, if he prefers no new guard:** one committed helper that
applies a list of exact find-and-replace pairs read from a file, so no script is typed at all (469).
**Place:** his to place and to allow. The agent's recommendation: build it — a small job on its own branch, read by
a fresh Opus reader, any time; it removes the commonest lost round trip of every chat.

### [CHECK-TOOLS-HARDEN] Small hardening of the checking tools, asked for by seventeen skill notes (filed 13 Oct 26 by the skill-notes review; none urgent)

Each line is a place where a tool allowed a mistake that a guide now only warns about. Scripts under
`raptor-port/scripts/` — no app code.

- **The walk helpers (`scripts/handpass/lib.mjs`, `trk-lib.mjs`).** Refuse to save a world from a page opened on the
  "start fresh" address (237, 506). One setting for a run's output folder, and a refusal to write a picture or a
  step log over a file git already tracks unless the run is named a re-walk (239, 247, 338). "Fill this field"
  with a short wait and an error that names the selector and lists the fields the window does have (508). A
  `pressLeave` helper for the Leave War that answers "tap the same leave again" (313). The "N pending" chip's
  selector, which now also matches "N changes" (443).
- **The check lock (`scripts/gatelock.mjs`).** A heartbeat from the run it protects, so "stale" means no heartbeat —
  not two hours of age, and not the process id of the command that took it (342). `run` records its own process, so
  the next taker can tell a stopped run from a live one (391). `run` checks its `--from` folder holds a
  `package.json` before taking the lock, and its usage line shows the form that works from both folders (504).
- **The break-test runners (`scripts/handpass/breaks.mjs`, `breaks-browser.mjs`).** Check every entry of a list
  before the first break, and restore the true build on every way out, an error included (471). A subset chosen by
  a pattern, and the result written as a table into the evidence folder (540).
- **The document check (`scripts/docsize.mjs`, `backlog-archive.mjs`).** Refuse a REPLACED or SPENT mark written in
  the wrong cell of a ruling's row instead of reading it as a narrowing (407). Its message lists every mark word it
  accepts, ANSWERED among them (408). A branch name in backticks in a ruling's home cell is not read as a missing
  file (314). A search of the walk scripts' write paths for an absolute worktree path (298).
- **The browser tests (`playwright.config.ts`).** Refuse to build while another run holds the check lock (444).

**Place:** his to place. The agent's recommendation: one small tools job, any time, its own branch; the gates and a
fresh Opus read of the scripts; no walk (nothing of the app changes).
