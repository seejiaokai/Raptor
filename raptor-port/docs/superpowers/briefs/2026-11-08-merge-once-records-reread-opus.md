# [MERGE-ONCE-RECORDS] — the narrow re-read of the fixes, the fresh Opus read (8 Nov 26, chat 33)

A fresh, blind Opus reader (did not write the code, blind to Astra's re-read); brief: `2026-11-08-merge-once-records-reread-brief.md`. Its report, word for word; its scenarios stayed in the chat's scratchpad.

---

[MERGE-ONCE-RECORDS] — the narrow re-read of the fixes, fresh blind Opus reader (0e059ce63..4ae5062fe)

Every reproduction below was run in throwaway repos under scratchpad\opus-reread\repos (harness h.mjs; scenarios s1–s4.mjs; the same cases against the 0e059ce63 copy of the step: h-old.mjs, s2-old.mjs, s4-old.mjs), each a real `git merge --no-commit --no-ff main` that stops, then the current records-merge.mjs run with --no-checks. No repo file changed.

FINDINGS

1. P1 — two different versions of one backlog item are FUSED into one, silently (new: the shared-prefix rule, Opus 3's fix).
   Failure (s4.mjs): both sides archive [X] at the same place in OUTSTANDING-ARCHIVE.md — the same heading and first line, a different last line ("Built and live 8 Nov 26 (PR 700)." vs "Dropped on his word, 8 Nov 26."). The step writes ONE "### [X] the item" whose body holds both last lines, says "settled", exits 0. The same in OUTSTANDING.md: one [NEW] item added on both sides with different "**Place:**" lines becomes one item with two Place lines. At 0e059ce63 (s4-old.mjs) the same merge gave [X] twice — visible, and a doubled [ID] the document check fails on; now nothing can see it (no identity is doubled, so neither docsize nor the replay's new fail rule fires).
   Cause: joinInsertions keeps ANY shared prefix that holds a non-blank line, so a shared item heading plus shared first lines are taken as "the same text both inserted", and the two remainders are concatenated under it.
   Fix: keep a shared prefix once only up to the end of its last line that is a whole record by itself — a `## ` heading, a blank, a table head/separator or a table row — and never past an item heading (`#{3,6} `, `### [ID]`) or a paragraph line; if what remains on BOTH sides then opens with the same item heading (or the same first line), leave the region. Tests: the two cases above, red first, asserting the region is left.

2. P1 (rare trigger) — a shared LAST line is taken from one entry and given to the other (new: the shared-suffix rule, Opus 3's fix).
   Failure (s1.mjs suffix): both sides archive a different item at the same place, each ending with the same line "Status: closed, live.". Result: "### [X] x / body x / ### [Y] y / body y / Status: closed, live." — X has lost its last line, which now reads as Y's. Exit 0. At 0e059ce63 both items kept their own line.
   Cause: joinInsertions keeps a shared suffix once whenever it holds a non-blank line, whether or not it is a whole entry.
   Fix: keep a shared suffix once only when it starts at an entry boundary on both sides (the line before it is blank or a table row, and it begins with a heading or a table row) — in practice, only whole table rows; otherwise s = 0. Test: the case above.

3. P1/P2 — after an unclosed code fence in a note, later note headings vanish from the cut, the next-number count and the document check, so a doubled number reaches the merge silently (new: Astra 5's fence-aware heading).
   Failure (s2.mjs l4): this branch adds Observation 11 whose body holds a lone "```" line that never closes, then Observation 12; main adds its own 11 and 12. The step renumbers 11 → 13 only; this branch's "### Observation 12: ours later" sits inside the open fence, is not a record, so the file ends with Observation 12 twice ("main twelve" and "ours later"); exit 0, "settled". observationHeads on that file returns 11,12,13 (fence.mjs; raw headings: 4), so the docsize number check passes too, and the replay's identity count is blind the same way. At 0e059ce63 (s2-old.mjs) both were renumbered (13, 14).
   Cause: CommonMark lets an unclosed fence run to the end of the text; one stray "```" in any note hides every later heading from all four users of the shared definition.
   Fix: in observationHeads / the step's cut, a fence still open at the end of the text is not a fence (treat its opener as text and scan again); and docsize fails the skill log (and each archive) on "a code block opened at line N never closes". Test: the l4 shape, red first, plus a self-test scenario.

4. P2 — Astra 3's shape survives inside the renumbered note itself.
   Failure (s2.mjs l5): this branch's new Observation 11 says "unlike main's Observation 11, this one is about X"; main adds its own 11. The step renumbers to 12 and rewrites the line to "unlike main's Observation 12" — now pointing at nothing main has (12 is this note). Printed as "rewritten:", not as "look by hand". Same as at 0e059ce63 for this shape: the fix covered lines outside the note and lines naming main's title, not the shape.
   Cause: `own === n` is taken as certainty that a citation inside the note means the note itself.
   Fix: inside the own note, rewrite only a line that does not name main's title AND does not mention main ("main", "main's") near the number; otherwise list it under "look by hand". Test: the l5 line.

5. P3 — HANDOFF.md is now left WHOLE when both sides add a new `## ` section at one place (a side effect of Astra 2's rule, which orderKeys applies to every file).
   Failure (s3.mjs hnoeol): both sides add a different `## ` section after "## Standing constraints"; the step leaves the whole handoff ("both sides added new headings at one place"), every block in it with it. HANDOFF sections hold no other side's entries, so the order question Astra 2 is about does not arise there; before the fix both were kept, this branch's first.
   Fix: apply the "different new headings at one place" leave only to the skill log (pass a flag from settle()), or for HANDOFF keep both new sections, this branch's first.

6. P3 — the replay's fail rule cannot see three kinds of wrong result: an item fused (finding 1), a line moved between entries (finding 2), a doubled one-line record with no identity (a walk-ledger or file-map row — the plan's §"Before it is trusted" named "ledger rows" among the identities; IDS has none); and a step that crashed is counted on the sheet but does not fail the run.
   Fix: exit 1 when any replayed merge has `crashed`; add an identity "every non-blank line" (a line the step's file holds more often than the chat's and both parents' fails — catches doubled rows); and for each `[ID]`/note record in a settled file, flag one that equals neither parent's version nor the chat's.

7. P3 — a doubled table head inside one table when the two sides wrote the same day heading with different spacing (s1.mjs headblank: one side "## Moved 8 Nov 26" + blank + table, the other no blank line). The shared prefix is the heading alone; the rest joins as table rows, so "| # | D |" and "|---|---|" stand again mid-table, rendered as a data row. backlog-archive writes the heading one way, so rare. Fix: in seam, drop a table head + separator pair from the start of b when a's table already has them.

CHECKED AND SOUND (each finding of the code read, re-run against the current code)

- Astra 1: no, one and two final line endings on both sides — both headings and bodies whole (the tests); every non-final record now gets its ending, any file.
- Astra 2 / Opus 1, 2: archives — Opus 1's exact shape (one day heading at different offsets) is LEFT with git's own two small clashes, never doubled (s1 opus1); Opus 2's shape and its mirror put main's 7 Nov row under 7 Nov, before this branch's 8 Nov (opus2, opus2m); a shared middle day with rows on both sides is left (mid). Skill log: a note under a day both opened stays under it, before the other side's next day (l1); a note under the base's last day stays before main's new day (l2).
- Astra 3: a line naming main's title, and a bare citation in another note, are left and listed (the tests); see finding 4 for the remaining shape.
- Astra 4: docsize counts across the log and every archive against the base — the five new self-test scenarios hold; today's log and archives hold no doubled number and no heading inside a fence (dups.mjs), so the base comparison has nothing to forgive yet.
- Astra 5: closed backtick and tilde fences are text in the cut, the count, the next number and the replay (tests); the four places share one definition (cut uses fenceStep exactly as fencedFlags does). See finding 3 for unclosed fences.
- Astra 6: a file settled in part is compared record by record, its regions set aside; every difference whole in the companion file; the new test drives a stand-in step that doubles a settled block and the replay exits 1.
- Opus 3: a row both sides added the same, first or last, is kept once (tests); paragraphs added at the top of the file map by each side stay apart (s1 paras); items added on both sides stay apart by one blank line (s1 items). See findings 1 and 2 for what the rule now also takes.
- Opus 4: a merge typed with `-c merge.conflictStyle=zdiff3` is recognised, settled with a renumber, and a second run reports "already settled", unchanged (s3 zd).
- Opus 5, 6: local branches counted; a run after a fetch keeps the number it chose (the test).
- Opus 8: the replay now fails on a doubled identity; the renumber exemption is narrow (stands once and the step renumbered to it).
- The tidiness 2 point: a first run that settles nothing does not say "already settled".
- Runs: `node --test raptor-port/scripts/records-merge.test.mjs` — 43 of 43 pass (97 s). `node raptor-port/scripts/docsize-selftest.mjs` — OK, 320 scenarios passed, the new skill-log ones among them. `cd raptor-port && npm run docsize` — OK. Nothing failed.
