# The checking fix, round 3 — fresh, blind Opus read (25 Nov 26)

I read the whole change, `git diff e6d855310 HEAD` with round 2's exclusions. I also read round 2's three reports and the builder's "Round 2 fixes". I opened no round-3 report. The 34 tests pass. I ran 8 cases of my own through the check's exported functions (scratchpad `probe3.mjs`). Nothing in the repo changed.

## Must-fix

**M1. Any later step-2 mark on the row closes the reading. Nothing ties his answer to the reading itself.**
- Cause: `rowMarks` takes the row's *last* ANSWERED or NARROWED mark dated on or after the open mark, whatever it is about.
- Reproduced on a row shaped like D2394, which got four narrowings on 24 Nov (D2564, D2560, D2420, D2421):
  - (1) A NARROWED mark about something else (D2421, "lead time 3 days") makes an unasked reading drop off the list. It is then "answered", so §12's box no longer sees it.
  - (2) The reading's `READING D2394` tag then fails with "he has answered that reading — D2421 … cite it, ruled D2421". That steers the builder to cite an unrelated ruling as his answer.
  - (3) A row whose true answer (D2564) comes before an unrelated narrowing (D2600) accepts only D2600. So `ruled D2564` (honest) fails, and "planned = any row, his to change (ruled D2600)" passes.
- This is the SANS lapse again: a reading treated as settled by a ruling that never answered it. It is also what C1 forbids, since it says the reading leaves "only by his ruling".
- Fix: link the answer to the reading explicitly.
  - When he rules, the reading's own mark is rewritten in place to `**READING, ANSWERED BY D<n> (<date>): …**`, beside step 2's mark as now.
  - The checker counts only that form as answered, and only its D<n> as a valid `ruled` citation. It drops the inference from dates and from other step-2 marks.
  - C1 gains one clause: "(the mark rewritten READING, ANSWERED BY D<n>)".
  - Since that rewrites a working guide, it needs its read.
- The same change closes the two gaps below.

**M1a (same cause). Old readings he answered before this system, D2564 included, take a date trap.**
- The audit's natural move is to date the new open mark the day it is written (25 Nov). The answer, NARROWED 24 Nov BY D2564, is earlier, so the reading stays open as "asked".
- `ruled D2564` then fails with "no reading's row carries ANSWERED … BY D2564", though D2390's row does carry it (reproduced).
- The only way through is to backdate the mark, and nothing says so.
- M1's explicit form removes the date comparison.
- If M1 is not taken, C1 must at least say the mark's date is the day the reading was made.

## Judged

1. **The two clauses and lesson 32.**
   - "('asked' once it is put to him)": meaning held, and it adds nothing his rules forbid.
   - "`ruled D<n>` — the ruling its row's ANSWERED mark names": the words are right, but the check does not enforce them. It accepts NARROWED too, takes any step-2 mark (M1), and validates a citation against every answered reading, not the one the comment speaks of.
   - Lesson 32's "never left only in a comment": meaning held, all four rules kept, the case text unchanged.
   - Nothing conflicts with D2567, D2610 or D2611.
2. **Other branches.**
   - A branch with "the agent's reading" in its own new lines fails until it either rewords, or marks the row OPEN "not asked" and tags the line. The second is cheap, and it is the honest way, as the plan intends.
   - Old comments block nothing.
   - Old answered readings: cheap only once M1 or M1a is fixed. Today they block with a misleading message.

## Left as is (backlog)

- A REPLACED BY answer is never a valid `ruled` citation, and the reading stays listed until the mover archives the row. After that, its tag fails with "add the mark", which is misleading.
- A step-2 mark naming several rulings ("BY D2340, D2341") counts only the first.
- `ruled D<n>` is checked against any recorded reading's answer, not the comment's own reading. The script's note admits this.
- In CI, a pull request's base is `base.sha` (main's tip). A stale branch, one that has not brought main in, may count a line main reworded as one it added.
