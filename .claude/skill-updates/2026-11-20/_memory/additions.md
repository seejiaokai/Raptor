# Memory additions — the skill-notes review of 20 Nov 26, groups A and D merged (chat 121)

Applied by hand at install, in `C:\Users\User\.claude\projects\C--Users-User-projects-Raptor\memory\`; no new note,
three extended.

<!-- ===== group A-handoff ===== -->

## Extend `measure-context-before-reporting.md` (no new note) — skill note 934

Index line in `MEMORY.md` unchanged. Append at the end of the note:

```
**Met again 11 Nov 26** (chat 64): at 91% with the state saved and a compaction about to run, a notification and the
next-step box told him the chat was full and his two points would wait for a fresh chat; the compaction then left the
chat at 42%, and both points were answered there ten minutes later. When a compaction is about to run, defer nothing in
words — let it run, measure after it, then choose between answering here and handing off; a notification cannot be
taken back.
```

<!-- ===== group D-reads-records ===== -->

Two extensions of existing notes in `C:\Users\User\.claude\projects\C--Users-User-projects-Raptor\memory\`; no new note.

## 1. `js-replace-dollar-patterns.md` — extend (note 975)

**New `description:`** "In a node edit script, prose inside a JS string is not literal: replace() with a TEXT replacement expands $' $` $& (pass a function), and a string or template literal eats backslashes (\d becomes d) — text holding backslashes goes in by the Edit tool or is read from a file"

**The index line in `MEMORY.md`** becomes: `- [JS edit scripts: $' and backslashes](js-replace-dollar-patterns.md) — always `s.replace(a, () => b)`; a `$'` in prose doubled the backlog (17 Oct 26); a regex inside a template literal lost its backslashes (19 Nov 26)`

**Append to the body:**

**The backslashes too (19 Nov 26, an overnight build):** an edit script written to a file — not typed into the shell —
held its new source text inside a template literal; the regex in it lost its backslashes there (`\d` reads as `d`), which
silently broke the post-in date check and every post-in; only the unit tests caught it. The shell guard cannot see this:
the escaping is JavaScript's own. **How to apply:** a line holding a backslash goes in by the Edit tool, or the script
reads its new text from a file the Write tool wrote (or wraps it in `String.raw`); then grep the edited file for one
escaped pattern before running anything. Related: [[node-e-in-git-bash-mangles-escapes]].

## 2. `pipe-hides-check-failure.md` — extend (note 926)

**Replace its "How to apply" line** (`send the check to a file, test its own exit — npm run docsize > f 2>&1; echo exit=$? — and read the file before committing`) with:

**How to apply:** join the commit to the check's own exit with `&&` — `npm run docsize > f 2>&1 && git commit …` — and
read the file whatever happened; never a pipe, never a semicolon.

**Append:**

Met again 10 Nov 26 (the guides' tightening, step 3), through a semicolon: `docsize > f; echo $?; git commit` committed
after the check failed (a rules file one line over its tripwire). Three meetings: the guard is a tool, filed as
`[CHECK-TOOLS-HARDEN]` (x) — a check-then-commit script and a refusal in the script guard.
