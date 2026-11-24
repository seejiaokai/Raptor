# The checking fix, round 2 — fresh, blind Opus read (25 Nov 26)

Read: the diff e6d855310..b6479344c (exclusions as briefed), plan §C/§E, lesson 32, round 1's three reports and the builder's "Round 1 fixes". I opened no round-2 report. The 24 tests pass. I ran my own 35 cases through the check's own functions, against real marks, and timed the check on this tree. Nothing in the repo changed.

**Round 1, re-checked by my own cases.** All fixed:
- C1 is present.
- Wrapped phrases are caught, e.g. "not put⏎to him" and "his⏎to change".
- The regex after `)` and after `}`, the JSX apostrophe before `//`, and CSS comments are all read.
- The listing shows the two unrecorded readings in the SANS file. It shows 104 across `src`, plus row warnings.
- Mark variants (case, no stars) are read.

The meaning checks:
- C1's last sentence, the record-decisions line and the lesson's sentence each say what the plan meant.
- The lesson keeps all four of its rules. Its case text is unchanged.

## Must-fix

**M1. An answered reading never leaves the list.** C1 says a reading "leaves only by his ruling (step 2's mark)". Step 2's mark is `**— ANSWERED <date> BY D<n>: …**` in the row. `marksIn` does not read it.
- Reproduced: a row holding both the OPEN mark and that ANSWERED mark still lists as 1 open, "not asked".
- So once he rules:
  - `npm run readings` keeps listing it, and §4 tells briefs to take this list as their targets.
  - A "not asked" mark can block §12's box for good.
  - The `READING D<n>` tag still passes (a), so nothing forces the comment over to `ruled D<n>`.
  - No rule lets anyone edit the mark, or change "not asked" to "asked" once it is put to him.
- Fix:
  - `marksIn` skips a mark when its row carries `ANSWERED … BY D<n>` (or REPLACED).
  - (a) fails a tag whose mark has been answered.
  - C1 adds one clause: the mark's state is updated when the reading is put to him.

**M2. The new way through, `ruled D<n>`, accepts any ruling that exists, including the one that was misread.** I reproduced this: the 22 Nov comment, with "(D2338's row)" changed to "ruled D2338", passes. The gate's own message steers there ("if he has answered it, cite … ruled D<n>"), and the 22 Nov builder believed D2338 had settled it.
- Fix: accept `ruled D<n>` only when that ruling's row is named by an `ANSWERED … BY D<n>` mark on another row.

## Should-fix

**S1. Phrasings still missed.**
- "his to decide": used in this sense twice in `src` today (`msq-fix2-meeting-moved-man.test.ts:17`, `msq-fix2-delete-across-move.test.ts:5`).
- "his to settle": C1's own words.
- Also missed: "not yet put to him", "until he decides", "until he answers", "the agents' reading", "Fable's reading", "Claude's reading".
- Fix: `his\s+to\s+(?:change|rule|decide|settle)`, `not\s+(?:yet\s+)?put\s+to\s+him`, `until\s+he\s+(?:rules|decides|answers)`, add `fable|claude` to the names, and allow the plural `agents['’]`.

**S2. False fails have no honest way out.** "His to change" meaning "he may edit it" fails (reproduced), and so do "my reading of the file" and "the host's reading of the clock". The message offers only a tag (which needs a fake mark) or a `ruled D<n>` (any number passes, see M2).
- Fix: the message adds "or, if the words are not about his reading, reword them".

**S3. A comment moved into another file counts as new.** Splitting a file that holds one of the 104 old comments fails the gate. That forces audit work into an unrelated job.
- Fix: an added line that matches any line the same diff removes, in any `src` file, counts as moved. The removed lines are already in the `-U0` diff.

**S4. A mark without its comma is lost without a word.** `**READING OPEN (24 Nov 26, not asked): x.**` is neither read nor failed, because `MARKISH` needs the comma. That is round 1's S5 still half open.
- Fix: `/READING,?\s*OPEN\s*\(/i`.

## Minor

- A run of `//` lines is one comment. So a new, untagged reading line placed directly under an unrelated `ruled D2186` or `READING D…` line passes (reproduced).
- `<p>Don't</p>{/* his to change */}<p>won't</p>`: the two apostrophes pair up as quotes and hide the comment (reproduced).
- "his to rule on" (meaning an approval) fails.
- Speed:
  - The readings part takes about 2.7 s here, against either base.
  - The whole turn-end run (`--inventory`) took 64 s with the old script and about 70 s with this one.
  - The hook's limit is 60 s (settings.json), not the "20-second limit" the script's comment says. That slowness was there before this change, probably from the PC's load. Fix the comment.
- The DECISIONS.md tripwire comment cites D136, "a rulings file is never trimmed", but this file is the map. D141 alone is the reason.
  - Both raises are needed: the C1 block, the executor's stop clause and its footer line.
- Lesson 32's "never left in a comment" reads as forbidding the `READING D<n>` comment that C1 requires. Say "never left only in a comment".
- Still open from round 1 (M3): this branch's own run fails on the SANS branch's 9 comments, `sansunfiled.ts:10` among them.
