# Read brief — lean working copies ([HELPER-COPIES-NO-PICTURES], his D2290), 22 Nov 26

**Two readers, blind to each other (D1761, D1770):** Astra, and a fresh Opus reader who did not write this. Do not open
any file whose name starts `2026-11-22-lean-copy-read-` other than this brief, and do not read this branch's
`HANDOFF.md` block if one appears. Read-only: change no file in the repo; write only your report.

## What changed

Branch `claude/helper-copies-no-pictures-134`, pull request 821 into `main`. The change is everything in
`git diff origin/main...claude/helper-copies-no-pictures-134` (three dots: since the branch left `main`; the two merges
of `main` into the branch are not under review):

- `raptor-port/scripts/lean-copy.mjs` (new) and `raptor-port/scripts/lean-copy.test.mjs` (new, `node --test`).
- `.claude/settings.json` — a SessionStart entry (matcher `startup`) and a SubagentStart entry that run `… hook`.
- `raptor-port/scripts/docsize.mjs` — `homes()` counts a skip-worktree file as present.
- `.github/workflows/docs-guard.yml` — runs the new tests.
- Notes: `raptor-port/docs/gates-and-deploy.md` §Lean working copies (new, at the end), `raptor-port/docs/walk-scripts.md`
  §2 (one new bullet), `raptor-port/docs/file-map.md`, `.claude/rules/decisions/how-we-work.md` (D2290's line),
  `.claude/decisions-full/how-we-work.md` (D2290's row, last column), `OUTSTANDING.md` ([HELPER-COPIES-NO-PICTURES]).

## The ruling it builds

His D2290 — read its full row: `grep -h '^| D2290 |' .claude/decisions-full/*.md`. In short: the working copies made
for helpers and reviewers leave out the walk pictures, as GitHub's machines already do (D1091); no picture is deleted; a
helper whose task needs pictures opens them in the main folder or fetches only the folder it needs; a walk's new
pictures are still saved and committed from a helper's copy. The rules every chat loads: `.claude/rules/*.md` and
`.claude/rules/decisions/how-we-work.md`. How the app's hooks work: https://code.claude.com/docs/en/hooks.md
(SessionStart, SubagentStart — `additionalContext`).

## What to answer

Ask yourself what is MISSING as much as what is wrong — reading code cannot find a line that is not there.

1. **The script, for correctness.** Can it ever: change the main folder; act on a copy that is not a new helper's or
   chat's own (above all the working copy of a chat already running, whose helper starts without a copy of its own);
   remove or lose a file, a change or a picture not yet committed; leave a copy where a NEW walk's pictures cannot be
   added and committed; fail to fetch a folder with `get`; hang or fail a helper's or chat's start (the hook must always
   exit 0, within its 300-second limit); misbehave on Windows paths, folder names with odd characters, an old commit
   without the pictures folder, two helpers starting at once, or a copy on another drive?
2. **The kinds of copy.** Is every way a copy is made on his PC covered: the app's helpers (`isolation: "worktree"`),
   the desktop app's worktree chats, `claude --worktree`, a typed `git worktree add` (the session-handoff skill's
   parallel-chat folders, the walk scripts' break-test scratch copies), Codex's own copies, the reviewers' exported
   read-copies (`raptor-port/docs/codex-guide.md` §Reading a commit that is not the branch head)? Is any helper task
   left that needs an old picture on disk without knowing it (a walk script reading an earlier walk's pictures, the
   drawing check, a script under `raptor-port/scripts/handpass/`, a test)?
3. **The document check's change.** Could counting a skip-worktree file as present ever hide a ruling home that is
   really gone?
4. **The notes, as a working-guide change** (D1761's narrow brief): does each note say what the change does, truly;
   does any contradict a guide or a ruling; does any drop a safeguard; does any add bulk where it sits?
5. **A tidiness note** (D489): three questions of the changed lines — is anything there that need not be, is anything
   said twice, is any name unclear. Filed, not fixed.

## What is not a finding

- A problem that lives only in data already stored (D56) — here, the working copies already on his PC: none is touched,
  and whether to slim them is put to him separately.
- That chats' own copies (the desktop's worktree chats, typed copies, Codex's) are slimmed as well as helpers' — that
  goes beyond D2290's words and is put to him as a question; say only if it would cause a concrete fault.
- Style alone, with no failure.

## How to report

A claim is a finding only with a concrete failure (what someone does, what goes wrong), its cause, and its exact fix
(D489). Rank by harm. Say plainly what you checked and found sound. Write the report to the file your caller names.
