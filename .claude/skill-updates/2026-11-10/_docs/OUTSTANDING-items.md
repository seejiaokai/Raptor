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

### Addition to [CHECK-TOOLS-HARDEN] (append after the chat-48 paragraph's (c) — the one that starts "**Added 10 Nov 26 (chat 48, from chat 19's handoff block):**")
**Added 10 Nov 26 (the skill-notes review, group A-walks):** (d) **the code check's message** (`scripts/code-check.mjs`
`read()`): when React Doctor marks the comparison degraded, the message blames `main`'s side whatever the cause — print
its own skip reasons (`skippedCheckReasons`) first, since on 3 Nov 26 the cause was a walk script on the branch with one
character not in UTF-8 (778); and a changed code file that is not valid UTF-8 is refused by name before React Doctor
runs (778; [WALK-SCRIPT-UTF8] carries the guide's line). (e) **One shared "letters fit" helper** for walk scripts,
measuring the letters' ink as `lw-cell-combos-measure.mjs` does, so a new script imports it instead of writing its own —
the guide's line was missed the day it was written (834). (f) **A unit check over `e2e/*.spec.ts`** that flags a new
text-width assertion (`getBoundingClientRect` against a fixed width) in a test that pins no letters — the Linux-letters
trap met twice, 23 Oct and 8 Nov 26 (680, 882). (g) **A ready script for a blind reader's clean copy**: archive named
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

### Addition to [CHECK-TOOLS-HARDEN] (append after the chat-48 paragraph's (c) and group A-walks' (d)–(g))
**Added 10 Nov 26 (the skill-notes review, group B-design):** (h) **The "start fresh" address, refused where it hides
the thing under test** — beside the walk helpers' refusal to save a world from it (237, 506): the walk and drawing
helpers' start (`scripts/handpass/lib.mjs`, `scripts/drawcheck/lib.mjs`) refuse an address carrying both `fresh=1` and
`savefail` (D1666 — the failed-save switch works only on the browser's store, so under `fresh=1` the band never shows),
and a `reload()` in a page opened on `fresh=1`, whose every reload begins from the demo world again — met 29 Oct 26 (six
"not kept after a reload" FAILs that were the script's) and 8 Nov 26 (a comparison of two identical screens) (745;
`docs/walk-scripts.md` §3 carries the guide's line).

## From group C1-handoff

### Addition to [CHECK-TOOLS-HARDEN] (append after the chat-48 paragraph's (c) and groups A-walks' and B-design's (d)–(h))
**Added 10 Nov 26 (the skill-notes review, group C1-handoff):** (i) **The check lock's `exec`** (`scripts/gatelock.mjs`):
one quoted string after `--` is handed to Windows' own shell, not bash, so a compound with `;` or `>` ran something else
and the lock reported a clean exit (31 Oct 26) — refuse a one-string command holding `;`, `>`, `<` or `&&`, with the
advice to write a script and pass `-- bash <script>`, and say so in the usage line (760; `docs/gates-and-deploy.md`
carries the guide's line). (j) **The push guard** (`.claude/hooks/push-guard.mjs`, a hook — on his word, read as a guide
change is): before a push to a branch with an open pull request, read its merge state and, when it is CONFLICTING, say
that no check run will start until `main` is brought in — met three times on 8 Nov 26, each time after a wait for a run
that never came (887; the guide's line in `docs/gates-and-deploy.md`, "After a push", and the memory note on stacked
and clashing pull requests).

## From group C2-records

### [RULE-FILE-LESSONS] Four lessons whose only home is an always-loaded rule file or the steps for recording a ruling (skill notes 733, 734, 859, 860; 28 Oct – 8 Nov 26)
**What:** the skill-notes review of 10 Nov 26 could not draft these, because they belong in files only the rules diet or
his word may change (`.claude/rules/record-decisions.md`, `.claude/rules/plain-language.md`, `DECISIONS.md`'s steps).
(a) **The sweep for what a new ruling leaves behind (D201) searches by the rule's subject across every Markdown file in
the repo** (the archives and the full-text rulings left out), not a list chosen from memory — the plans under
`raptor-port/docs/superpowers/plans/` among them, whose tables of open questions are homes of each answer — and the
readers' brief names the search that was run, so they can widen it (859, 724: four guides and a backlog item still
named the old readers on 8 Nov 26; a plan showed two answered questions as open for five days). (b) **A ruling that
changes the rule for one of several parties is rewritten clause by clause:** before rewriting each line it touches, list
every clause of the old line (each party, each safeguard, each window or date) and mark it changed or carried over; the
rewritten line keeps every carried clause (860: D1770 dropped the "owed list" safeguard for the unchanged reader, in five
files). (c) **A blanket approval ("all as recommended") is recorded from the page he answered:** each rule is written from
that page's own recommended words, at the version he saw (`git show <commit>:<page>`); anything only in the plan behind
it is the agent's reading, marked; and the fresh reader of such rulings checks every number and condition of the line
against that page version (734, met twice on 28 Oct 26). (d) **The check before sending, a step that counts:** list every
screen, tile, figure or control the message names; each has a picture in the same message, or it is not sent (733:
D853 and D921 were loaded and missed, "rules, not screens").
**To do:** draft each as the smallest change to its file; read by Astra and a fresh, blind Opus reader, each blind to the
other (D1761, D1770); on his word, and his "merge live". **Place:** his to place — with the next change to those files.

Priority-list line: `- [RULE-FILE-LESSONS] — four lessons for the rule files and the steps for recording a ruling — his word.`

### Addition to [CHECK-TOOLS-HARDEN] (append after the chat-48 paragraph's (c) and the earlier groups' (d)–(j))
**Added 10 Nov 26 (the skill-notes review, group C2-records):** (k) **The change-mark check** (`scripts/docsize-rulings.mjs`
`backMarks`): it reads only the first number after a change verb, so "Narrows D1510 and D149" checked D1510 and never
D149, and it runs only on new rows — read every number of the list after the verb, and run it once over every live
row, listing what is owed (881: D149 and D218 unmarked, found only by a drafter reading row by row, 8 Nov 26). (l) **The
backlog script** (`backlog-archive.mjs <ID>`): before it moves an item, warn when the item is the backlog's last mention of
a ruling whose row names the backlog as a home, naming the item that could carry the number (900: D1871's home check
failed only at the closing step, 8 Nov 26). (m) **The document check** (`scripts/docsize.mjs`): fail on any line
beginning `<<<<<<< ` or `>>>>>>> ` in a file it reads, and on a `=======` line between two such lines (a heading's
underline is not one) (803: a rulings file kept a merge's clash marks through a
passing check, 6 Nov 26; only the commit refused; `docs/gates-and-deploy.md`, the settle step, carries the guide's line).

## From group D-reads-code

### Addition to [CHECK-TOOLS-HARDEN] (append after the chat-48 paragraph's (c) and the earlier groups' (d)–(m))
**Added 10 Nov 26 (the skill-notes review, group D-reads-code):** (n) **The backlog script's git wrapper**
(`scripts/backlog-archive.mjs`, its `git()`): it returns an empty text whenever git fails, and it sets no output buffer,
so a listing past Node's 1 MB default — the untracked walk pictures alone can pass it — reads as "no files" with no
error (840: the same wrapper made `docsize --reads` report every rules file as not loading, 300,000 tokens wrong, 7 Nov
26; `docsize.mjs` and `docsize-reads.mjs` were fixed then, this one was not). Set `maxBuffer`, and let a listing whose
empty result means "none" fail loudly; the rule for any new script: swallow an error only where "none" and "failed" lead
to the same action. (o) **The document check's self-test takes a name filter** (`scripts/docsize-selftest.mjs`, an
environment variable), so a red-first round can run only its new cases — without one, each round of fixes to the merge
tool meant a scratch copy with every case-runner patched (841, 7 Nov 26; about 12 minutes a round). (p) **The inputs
guard reads comments** (`src/engine/inputs-readers.test.ts`): its file list is chosen by `NAMES` over the raw text, so a
comment heading with the word INPUTS in capitals put a file in the set and turned the unit run red (767, 2 Nov 26) —
choose the list through the guard's own `code()` that strips comments, as its other checks do. (q) **The tests that
name a changed file, listed and run before its first push:** a small script that takes the branch's changed files and
lists every test file — unit, browser, smoke scripts — whose text names each one's base name (`grep -rl` over `src`,
`e2e` and `scripts`), unfiltered, to be run before the first push; the test-driven-development guide's "Which other
tests?" already says to find them, and it was missed twice — a filtered search missed five browser tests on 5 Nov 26,
and the date box's look test on 8 Nov 26, each found only by GitHub's run (833). (r) **The Inputs list's browser
tests open on every date by default:** the list shows a window of dates from today, so a new test on today's clock
found no rows and failed its own setup, twice on 8 Nov 26 (865) — the list's test helper shows every date unless a test
asks otherwise, and a test that measures the list's rows asserts a row is visible first; the guide's premises line
carries the rest.
