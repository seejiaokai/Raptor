# The checking fix, round 2 — Fable's blind read, 25 Nov 26

Read: the whole change (`e6d855310..b6479344c`), the plan §C/§E, lesson 32, round 1's three reports and the builder's
"Round 1 fixes". Not opened: any round-2 report. Run: the check's 24 tests (pass); 80 cases of my own against the
check's functions (scratchpad `fable2-probe.mjs`, `fable2-time.mjs`); `npm run readings` three ways; the turn-end
check twice. Nothing in the repo changed.

## Must-fix

None.

## Round 1's findings — each checked with my own cases

- **The rule's block (C1):** fixed. It is in `DECISIONS.md` in the plan's words, one block, and all seven pointers land on it.
- **Wrapped phrases:** fixed. `//` runs, starred blocks, a JSX comment, a blank `//` line in between, only the second
  line new — all fail as they should; an old wrapped comment with neither line new passes.
- **Other phrasings, moved lines, the listing, the mistyped mark:** fixed as reported, with the limits below.
- **The comment reader:** fixed for every round-1 case; one hole left (S1).

## Should-fix

**S1. A comment is still missed when JSX text before it holds an apostrophe and the comment holds one too.**
`<p>Don't</p> // the agent's reading: any row` → no failure (also `{/* the builder's reading */}` on such a line).
Cause: the first apostrophe pairs with the one inside "agent's", so the `//` between them is read as quoted text.
Round 1's test used "his to change", which has no apostrophe; four of the seven phrases do. Fix: a quote's partner
may not lie beyond a `//` or `/*` when the line also holds `>` before the quote — or, simpler, test the phrase on the
raw text of every new line that holds `//` or `/*` and that the reader did not count.

**S2. The commonest remaining wordings pass.** No failure for "his to decide" (3 in `src` today), "his to settle"
(the rule's own words), "for him to decide / rule", "pending his ruling", "he has not ruled", "the agent's
interpretation", "the agents' reading". Fix: add `his to (decide|settle)`, `for him to (decide|rule)`,
`pending his ruling`, `agents?['’]s? (interpretation|reading)`. "His call" rightly stays out.

**S3. A mark typed without the comma, or with the bold closed early, drops off the list silently.**
`READING OPEN (25 Nov, not asked): …` and `**READING, OPEN** (25 Nov, not asked): …` → 0 marks, 0 failures. For a
reading met in a drawing or in wording there is no code tag, so the row's mark is the only record; it vanishes
unseen. Fix: fail any row holding `READING,?\s*OPEN` that does not parse as a mark.

**S4. The turn-end check as a whole ran 69 s and 74 s here, over its hook's 60-second limit; the readings part is
about 3 s of that** (2.6 s against the parent branch, 3.4 s against `main`; 25 s whole against the parent). The
readings part is fast enough. The rest is not this change's doing, and other readers may have been loading the PC —
but a check that times out enforces nothing. Fix: time it on a quiet PC before relying on it; file a job if it holds.

## Minor

- One `READING D<n>` or `ruled D<n>` anywhere in a comment clears every phrase in that comment — a long header
  comment with one answered reading hides a second, unanswered one, from the check and from the listing.
- `ruled D<n>` accepts any ruling that exists: "planned = any row (ruled D2338)" passes. The rule's sentence says
  "he has answered"; the check cannot know. Say so in the script's "honestly" note.
- A new comment copied from an old untagged one in the same file counts as moved, so it passes.
- New false fails, all with the `ruled D<n>` way through: "a member's own row is his to change", "the build's first
  reading of storage", "Opus's code reading", "read here as a string". Acceptable; the failure message names the way.

## The three wording changes — meaning check

- **C1's added last sentence:** says what fix 6 meant; contradicts nothing; it is the honest exit round 1 asked for.
- **`record-decisions.md`'s line:** clear now, same meaning as the plan's.
- **Lesson 32's folded sentence:** all four rules present, each with its home; the case text is byte for byte.

## The two raised limits

Both needed where they sit: `DECISIONS.md` stands at 119 of 120 (the rule's one home), the builder's rules at 110 of
110 (the stop and the report line). Nothing to move.

## The owner's two questions

**Would it now have caught the SANS "planned" case at the cheapest point?** Yes, as far as a check can. The builder's
rule now says a reading of his word is a stop and a question, with a worked example — and the rule it points to
exists. Had the builder written the same note anyway, the check fails it at the end of that turn (it is the first
test). Had he written nothing, the roll-call's new row would have set the reminder's rule beside the crew list's.

**The next one, made in a drawing or in the app's words?** Not by the check — it reads notes in the code only, never a
mock-up or the words on screen. There it rests on people following the rule: the always-loaded line before anything is
put to him, the two design clauses, the words reviewer's list, and the readers' question "what does each ruled word
cover". These are real now and would likely catch it, but later and only if someone notices; S3 matters most here.
