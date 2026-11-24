# The checking fix (commit 2e9a83d0e) — Fable's blind read, 24 Nov 26

Read: every diff of the commit except the builder's report; the plan §A–§E; D2567, D2610, D2611 full rows.
Run: the check's 12 tests (pass); `npm run readings` on the SANS file; a probe of 17 phrasings against the check's
own functions (scratchpad `fable-probe.mjs`). Nothing in the repo changed.

## Must-fix

**M1. The rule itself was never written — plan C1 is missing.** `DECISIONS.md` changed by one line only (D2611 added
to the map). There is no "A reading" block: `git show 2e9a83d0e:DECISIONS.md | grep -i reading` finds only three
old, unrelated lines. Seven places now point at `DECISIONS.md`, "A reading" (executor, ui-design twice,
record-decisions, order §12, lesson 32, the check's two failure messages) and land on nothing.
What is lost with it: what a reading is ("that a person would see" — without it the executor's new clause makes
every technical reading a BLOCKED stop, against D2610's own reading); "with a worked example and how the app answers
elsewhere"; "never drawn as settled or folded into other wording"; the mark's format (it exists only inside the
script and its test); "his approval of wording that only repeats the word does not settle it" — the exact gap that
let D2390/D2394 give the word his authority. Lesson 32's folded sentence therefore loses one of its four rules: "a
builder's reading goes to him with a worked example before the build is read" now lives nowhere.
Fix: add C1's block to `DECISIONS.md` as the plan words it, then have it read.

**M2. `npm run readings` reports "none" on files that hold untagged readings — the brief and §12 take that as
clean.** Run today: `node scripts/readings.mjs src/leavewar/sansunfiled.ts D2338` prints "none / none / Readings
open: 0". The command lists marks and tags only; the 40 "his to change" and 69 "agent's reading" comments already in
`src` are invisible to it. §4 now tells every brief to take its readings from this command "never from memory", the
words reviewer is "given" it, and §12's box is ticked on it. Until the audit clears the old comments, each gets an
empty list and reads it as "no readings here" — layer 3 of the lapse again, now with a tool's authority.
Fix: the listing (not the failing check) also prints every untagged free-words comment in the named files, old lines
included, as "unrecorded — treat as not asked", and counts them in the summary line.

## Should-fix

**S1. A phrase that wraps across two comment lines passes.** The check tests each line alone. Probe: "(his to⏎
change)" and "the agent's⏎ reading" both return 0 findings. Not rare here: 6 of the ~110 existing occurrences in
`src` already break inside the phrase (e.g. `engine/oilev.ts:719`, `leavewar/sync.ts:2622`). Fix: match on the
comment's text with line breaks and leading `*`/`//` folded to one space, report the line the match starts on.

**S2. Near phrasings pass.** 0 findings for: "the agent's own reading", "my reading", "read here as", "his call, not
yet asked", "for him to change", "his to rule". The script says honestly it is a word check; "agent's own reading"
and "for him to change / his to rule / his call" are cheap to add.

**S3. A reading written into a new ruling's row in free words is not seen.** The check looks at rows only for the
mark. A branch adding a row with "The agent's reading: …" (not "told to him") and no mark passes and is not listed —
layer 2 of the diagnosis. Fix: on rows a branch adds, "agent's reading" without "told to him" or a mark is listed as
unrecorded (person-visible or not is the host's call).

**S4. No way to pass honestly when the words are not a reading.** "caps stay paused until he rules (D2186)" fails;
so does "D2564: … no longer the build's reading". The only exits are rewording or a false tag. Other branches add
such comments often (69 in `src`); each fails at its next turn's end once it brings `main` in. That is what C7 asks
— but tell the other chats before the merge (D2611 covers the rule, not the red check), and let a comment carrying
"ruled D<n>" pass.

**S5. A mark typed slightly off silently does not count.** Without the bold stars, or with a space before the
colon, `marksIn` returns nothing, so the reading drops off the list with no failure. Fix: fail any row holding
"READING, OPEN" that the pattern does not parse.

## Minor

- `.html` under `src` (6 files) is not read; a JSX comment after an apostrophe on the same line, or inside a
  template's `${}`, is skipped.
- Base: correct. Locally the fork point from `main`; on GitHub the pull request's base against the merged copy —
  only the branch's own lines. This branch's 9 failures are the SANS branch's lines; its pull request stays red
  until that branch merges first or those 9 are tagged.
- Lesson 32's case text is byte for byte; the other three of its four rules are kept (§4, §6). §6's row, the
  checklist's line 32 and step 8, the §12 box, the executor footer and the ui-design clauses match the plan.

## The owner's two questions

**Would it have caught the SANS "planned" case at the cheapest point?** Partly. The builder's rule now names a
reading as a stop, and the check would have failed that comment at the end of the same turn, because it happened to
say "his to change". Both rest on the builder noticing or using those words; and the rule that says what to do —
ask him, one worked example — is the block that is missing (M1). The next-cheapest catch, the roll-call's new row
(§6), is in and would have caught it without anyone noticing: the reminder's rule beside the crew list's.

**Will it catch the next one made in a drawing or in the app's words?** Not as built. The check reads code comments
only — never a mock-up, never the words on screen. For those there are two short clauses in the design rule, both
pointing at the missing block, and a words reviewer handed a list that is empty unless someone already recorded the
reading (M2). With M1 and M2 fixed it becomes a real rule with a real list; it still depends on a person noticing,
which the plan says plainly. The readers' new question ("what does the code make each ruled word cover") is the only
net for a reading nobody noticed, and it comes late.
