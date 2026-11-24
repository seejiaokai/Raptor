# The checking fix — round 3 read (fresh, blind Fable, 25 Nov 26)

Read: `git diff e6d855310 HEAD` with round 2's exclusions, the round 1–3 briefs, the builder's "Round 2 fixes".
Changed no file. Reproduction script: `r3.mjs`, beside this report.

## Must-fix — one

**M1. Any later mark on the same row counts as his answer to the reading — so the SANS reading itself would have left
the list the next day, unanswered.**

- Failure, reproduced on D2338's real row: it carries `**— NARROWED 23 Nov 26 BY D2340, D2341, D2342: …**` (filing
  ahead — nothing to do with what "planned" covers). Give that row the mark the rule asks for,
  `READING, OPEN (22 Nov 26, not asked): …`, and the script reports: open readings 0; answered by D2340. The §12 box
  then shows nothing "not asked"; a `READING D2338` tag FAILS and its message tells the builder to "cite it, ruled
  D2340"; and the 22 Nov comment with "(his to change, ruled D2340)" passes.
- Second form, same cause: add his true answer too (`ANSWERED 24 Nov 26 BY D2564`) at the cell's start, where step 2
  puts marks, and the script still names D2340 — it takes the LAST mark in the row's text. So `ruled D2564`, the
  brief's own example, fails and `ruled D2340` passes.
- Cause: `rowMarks` takes any ANSWERED or NARROWED mark dated on or after the reading's mark (the same day included),
  never asking whether it is about the reading; 518 NARROWED and 126 ANSWERED marks are in the rows today, so a row
  narrowed on another point is the usual case. The "A reading" block names only the ANSWERED mark; the script also
  takes NARROWED.
- Fix: a reading leaves only by a mark that names it — e.g. step 2's mark written
  `**— ANSWERED <date> BY D<n>: the reading — …**` (the script requiring "the reading" after the colon, NARROWED no
  longer counting), every such mark on the row collected, never only the last. One clause in the block ("step 2's
  ANSWERED mark, naming the reading"); tests: D2338's row as above stays open; both orders of two marks.

## The two judgements

1. **The two clauses and lesson 32:** meaning held, nothing added his rules forbid — except that the second clause
   says "ANSWERED mark" while the script also takes NARROWED (M1). "Never left only in a comment" loses nothing: the
   block's "never built on" is the stronger rule.
2. **Other branches and old answers:** not blocked. A branch's new comment fails only on its own added lines, and each
   message gives the way out (put it to him and mark it, or reword). An old answer such as D2564 costs one row edit —
   the open mark and the ANSWERED mark — honest and cheap, but today it does not work on D2338's row (M1's second form).

## Left as is (backlog, one line each)

- A mark naming two answers ("BY D2563, D2564") admits only the first as `ruled`.
- A reading mark with a date the script cannot read ("22 November 26") is answered by any mark on the row, however old.
- `ruled D<n>` in ANY comment under src, old lines too, fails unless D<n> answered a reading — none on this branch or
  `main` today; "he ruled D123" written naturally on another branch fails, the way out a reword.
- A ruling row that quotes the mark's form in prose ("READING, OPEN (<date>, asked | not asked)") fails as unreadable.
- "He has not ruled" is not caught; `.html` comments and quoted text are not read.

## The two plain lines

- **The SANS "planned" case:** yes at the cheapest point — the turn the comment was written, "his to change" fails the
  turn-end check and the builder must stop and ask; but as it stands the reading would then have dropped off the list
  on 23 Nov, when its row was narrowed on another point (M1).
- **The next one, in a drawing or the app's words:** no check reads either; it is caught only if the drawer or the
  words' reviewer follows the rule and names it — the script helps only once somebody has written the reading down.
