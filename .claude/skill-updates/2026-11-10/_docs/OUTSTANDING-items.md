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

## From group B-design

### [DRAW-MARK-HELPER] One shared helper that marks a part on a drawing, and refuses a mark that moves or loses it (skill notes 820, 822, 848; 5–8 Nov 26)
**What:** each drawing script writes its own ring-and-tag code, and the same three faults have passed scripts that ran
clean: a mark's class set `position:relative` on a fixed list and took it out of the picture (820); a tag in its own
`::before` was cut off by a parent that hides what overflows it, twice in one night (848); a part taken away with
`remove()` blanked the whole app at its next redraw, and three runs chased the wrong cause before the page's own error
was printed (822). **To do:** one helper under `raptor-port/scripts/handpass/` that every new drawing script imports:
it rings a part with an outline and a tag (a child for a static element), asserts the part's box is the same before and
after the mark, refuses the picture (or moves the tag) when a tag is not wholly inside every ancestor that clips, offers
`hide()` and no `remove()`, and prints the page's errors to the run's log as they happen; with a self-test on one case of
each fault. A part the drawing marks with an inline ring in the marker colour could then be left out by the drawing
check's recorder by itself (742). The guide's lines stay (`.claude/skills/brainstorming/mockups-on-the-real-app.md`,
step 3 and the Traps); this is the guard for the one met twice. **Place:** with the next drawing job; low.

Priority-list line: `- [DRAW-MARK-HELPER] — one shared helper for marking a part on a drawing, refusing a mark that moves or clips — low.`

### Addition to [CHECK-TOOLS-HARDEN] (append under its "Added 10 Nov 26" paragraph, after group A-walks' (c)–(f))
**Added 10 Nov 26 (the skill-notes review, group B-design):** (g) **The "start fresh" address, refused where it hides
the thing under test** — beside the walk helpers' refusal to save a world from it (237, 506): the walk and drawing
helpers' start (`scripts/handpass/lib.mjs`, `scripts/drawcheck/lib.mjs`) refuse an address carrying both `fresh=1` and
`savefail` (D1666 — the failed-save switch works only on the browser's store, so under `fresh=1` the band never shows),
and a `reload()` in a page opened on `fresh=1`, whose every reload begins from the demo world again — met 29 Oct 26 (six
"not kept after a reload" FAILs that were the script's) and 8 Nov 26 (a comparison of two identical screens) (745;
`docs/walk-scripts.md` §3 carries the guide's line).

## From group C1-handoff

### Addition to [CHECK-TOOLS-HARDEN] (append under its "Added 10 Nov 26" paragraph, after groups A-walks' and B-design's (c)–(g))
**Added 10 Nov 26 (the skill-notes review, group C1-handoff):** (h) **The check lock's `exec`** (`scripts/gatelock.mjs`):
one quoted string after `--` is handed to Windows' own shell, not bash, so a compound with `;` or `>` ran something else
and the lock reported a clean exit (31 Oct 26) — refuse a one-string command holding `;`, `>`, `<` or `&&`, with the
advice to write a script and pass `-- bash <script>`, and say so in the usage line (760; `docs/gates-and-deploy.md`
carries the guide's line). (i) **The push guard** (`.claude/hooks/push-guard.mjs`, a hook — on his word, read as a guide
change is): before a push to a branch with an open pull request, read its merge state and, when it is CONFLICTING, say
that no check run will start until `main` is brought in — met three times on 8 Nov 26, each time after a wait for a run
that never came (887; the guide's line in `docs/gates-and-deploy.md`, "After a push", and the memory note on stacked
and clashing pull requests).
