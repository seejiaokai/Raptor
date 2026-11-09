# Backlog items filed by the skill-notes review of 10 Nov 26 — appended by each helper

## From group A-walks

### [READER-COMPACT-HANDOFF] A blind reader that compacts is handed the host's handoff block (skill note 888, 8 Nov 26)
**What:** the compaction start hook (`.claude/hooks/compact-resume.mjs`, [COMPACT-WHEN-MOD]) pastes the branch's
`HANDOFF.md` block into any chat on that branch that compacts — a fresh, blind reader running as a helper included. On
8 Nov 26 (chat 13's final code read) the Opus reader compacted mid-read and was handed the host's own record of the
walk's fault and its fix; it said so, and its read was noted as not fully blind. **To do:** the hook pastes the block
only into the chat that owns the branch — tell a helper or reader session apart (its parent session, or a marker its
brief sets) and print the re-read reminder alone there; a test in `compact-hooks.test.mjs` for each kind of session.
Until then the readers' brief carries the stop-gap (`raptor-port/docs/bug-check-order.md` §4, "Never show either model
the other's conclusions"). A hook change: on his word, read as a guide change is. **Place:** with the next change to the
compaction hooks; low.

Priority-list line: `- [READER-COMPACT-HANDOFF] — a blind reader that compacts is pasted the host's handoff — a hook change, his word.`

### Addition to [CHECK-TOOLS-HARDEN] (append under its "Added 10 Nov 26" paragraph)
**Added 10 Nov 26 (the skill-notes review, group A-walks):** (c) **the code check's message** (`scripts/code-check.mjs`
`read()`): when React Doctor marks the comparison degraded, the message blames `main`'s side whatever the cause — print
its own skip reasons (`skippedCheckReasons`) first, since on 3 Nov 26 the cause was a walk script on the branch with one
character not in UTF-8 (778); and a changed code file that is not valid UTF-8 is refused by name before React Doctor
runs (778; [WALK-SCRIPT-UTF8] carries the guide's line). (d) **One shared "letters fit" helper** for walk scripts,
measuring the letters' ink as `lw-cell-combos-measure.mjs` does, so a new script imports it instead of writing its own —
the guide's line was missed the day it was written (834). (e) **A unit check over `e2e/*.spec.ts`** that flags a new
text-width assertion (`getBoundingClientRect` against a fixed width) in a test that pins no letters — the Linux-letters
trap met twice, 23 Oct and 8 Nov 26 (680, 882). (f) **A ready script for a blind reader's clean copy**: archive named
paths only (the source, the docs without evidence sheets, pictures or the archive, the rulings, the backlog), set
`core.longpaths`, two commits with `git rm -r` between them, the base tagged `BASE` and the reader told what it stands
for — a whole-tree copy took over ten minutes and then failed on a long file name (898).
