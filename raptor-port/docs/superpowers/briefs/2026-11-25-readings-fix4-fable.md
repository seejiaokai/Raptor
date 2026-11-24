# The checking fix, round 3's must-fix — check of the fix (fresh, blind Fable, 25 Nov 26)

Read: `git show HEAD` (716d93d79), the three round-3 reports. Changed no file. Probes: `fix4-probe.mjs`, beside this report.

## Must-fix

None.

## Reproduced, each now behaves

- D2338's and D2394's real rows, given an open mark: stay open ("not asked"), nothing answers them, the `READING D<n>` tag passes, and the 22 Nov comment citing `ruled D2340` or `ruled D2421` fails.
- Two readings on one row, one answered, both orders, with a step-2 ANSWERED mark and a later unrelated NARROWED: the unanswered one stays listed; only D2564 is citable; `ruled D2600` fails.
- An unrelated later narrowing alone closes nothing.
- D472's real row is not read as a broken mark. No row in the repo today reads as a mark, open, answered or broken.
- Tests: 38 of 38 pass.

## The clause in "A reading"

Says what was meant. It loses nothing: "only by his ruling" and step 2's mark are kept, and "that answer" still ties `ruled D<n>` to the reading's own answer. It adds only the in-place rewrite, text kept — nothing his rules forbid.

## Left as is (one line each)

- A mark typed wrong in lower case is no longer caught (the builder's stated price); a wrong form in capitals — two answers, date before "BY", no colon, a bracket inside the date — still fails loudly.
- Lower-case prose that happens to match the full form ("reading, answered by D9 (date): …") is read as an answer.
- The clause does not say which date goes in `(<date>)`, nor that the mark's "asked / not asked" is dropped on rewriting; the script compares no dates.
- The document gate's change-mark reader also matches "ANSWERED BY D<n>" inside the new mark; harmless while step 2's mark names the same ruling, as the clause requires.
- `ruled D<n>` is checked against every answered reading, not the one the comment speaks of (round 3's note, unchanged).
- A row quoting the mark's form in prose still fails as unreadable (round 3's note).
- Marks on a row later moved to the archive are no longer read (by reading the code; not run).
- `badMarks`' header comment and `rowWarnings` (open marks only) still describe the old shape.
