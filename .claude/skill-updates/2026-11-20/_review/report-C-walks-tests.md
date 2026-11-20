# Helper C-walks-tests — report (saved by the coordinator from the hand-back, 20 Nov 26)

**Counts:** APPLY 12 (929, 939, 940, 941, 943, 950, 964, 965, 969, 972, 976, 979) · FILED 1 (919). Table: `dispositions-C-walks-tests.md`.

## Drafted files (each copied from the live file first; LF endings)

**WS** `raptor-port/docs/walk-scripts.md`
- Header: "and 20 Nov 26 from those of 10–19 Nov 26".
- §3 Fixtures, new bullet (976): two people acting in turn — one tab with sign-out/sign-in, or reload the acting tab after the other's step; two live tabs are two devices that never sync; that test is kept for BCO §6's storage-writer step only; a two-live-tab FAIL is reproduced in one tab before it is filed.
- §4 drag line (965): every mouse move written from a measured point; the mouse stays where its last move left it; log the page's presses and scrolls before blaming the app for a wrong landing.
- §4 clean-up line (943): a change is taken back with the app's own Undo button (`#undoBtn`, `#sbUndo` on the board), never the keyboard's undo keys.
- §4 calibrated-read line, rewritten (943): every pass/fail line a new script prints is proved once on a known-clean and once on a known-changed screen, reading the one element that carries the answer, never the page's whole text.
- §4 "place measured to press later" line (964, 965): anything that moves by itself at a press is measured inside the page — a capture listener before the event, another capture listener scheduling the "after" read two animation frames later; never a bubbling listener, never two round trips from the runner.
- §4 `elementFromPoint` line (929): "nothing stands over it" also compares the box with every note, banner or overlay showing; the settled picture taken while the note still shows.

**BCO** `raptor-port/docs/bug-check-order.md`
- §4 "Before a brief leaves", EXPECTED-line bullet (969): a surface walked under two roles names each role's expected records, or says they differ and why.
- §6 wording row (950): the old-words search also covers every script that writes words a person reads (`scripts/`); the 15 Nov 26 case added.
- §6 "where an input is filed / who counts as away" row widened (940): every reader of a changed input or setting, the settings a published day keeps (D2005) included; live warnings, counts, notes and marks.
- §7.0 "What can be chosen" (939): a page fitted to the screen walked at the narrowest desktop width just above the phone split and a mid width, beside the wide one; its sideways scroll at the narrow width.
- §7.11 (919): the second lesson 23 renamed 23b, with "a second 23 until 20 Nov 26 — older sheets and briefs cite it as 'lesson 23'"; blank lines so the list renders.
- §8 point 4 (972): "if the row is found" added as an example of a skipped check. §8 point 6: reviewers asked about every condition or early return around an assertion.
- Stale lines: none.

**Checklist** `raptor-port/docs/bug-check-checklist.md`: step 8's rows read "every reader of a changed input or setting (who counts as away, the settings a day keeps)" (940); step 10's "(two lessons there are numbered 23)" aside dropped; the lesson list's second 23 becomes 23b (919).

**TDD** `.claude/skills/test-driven-development/SKILL.md`: Verify RED "Read the red" (972, 979): a premise asserted, never behind an `if`; a fixture's state read back through the app's own loader; a failing control points at the fixture. Verify GREEN Confirm list (941): a new or changed test file passes the pipeline's own type check. `writing-good-tests.md` unchanged.

## Additions
`_docs/OUTSTANDING-items-C-walks-tests.md`: point (s) on `[CHECK-TOOLS-HARDEN]` — the document check counts §7.11's lesson numbers (no gap, no repeat) and checks the checklist carries the same numbers. Finding: `[BUGCHECK-LESSON-ORDER]` (archived 10 Nov 26) only moved the second 23; the duplicate stood until this draft.

## For another file
SUPERPOWERS-VENDORED.md register row: `| test-driven-development | Verify RED: a premise asserted, never behind an if; a fixture read back through the app's own loader, a failing control blamed on the fixture. Verify GREEN: a new or changed test file passes the pipeline's own type check |`

## Doubts
- "(s)" may clash with another helper's addition to `[CHECK-TOOLS-HARDEN]`.
- 939 placed in §7.0, not lesson 31 (a code reader's find, not his).
- 969 in BCO §4; D's §4 line, if any, goes beside it.
- Least sure: (1) the 23b rename changes a cited number; (2) 941 in the vendored TDD skill — its natural home is the builder rule file; the project's type check does not cover the browser-test folder; (3) the 972/979 paragraph makes "Read the red" longer.
