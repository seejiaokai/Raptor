# [AL-LOOK] plan: fresh Opus red-team read (blind)

The plan read: `raptor-port/docs/superpowers/plans/2026-11-27-al-look-plan.md` (on `claude/readings-lapse-fix-fdbb3c`). The code read: `origin/main` at `2eaab2769`. The rulings read: D2618, D2619, D2735 to D2738 in full; D91, D92, D93, D362, D1784, D172 and D2333 in full; `scheduler.md` §Publishing, amendments and signing; `design.md`. I ran nothing; every finding comes from reading the code and the rulings.

## 1. Places where the plan contradicts a ruling, or decides something that is his

**1a. It adds waiting marks on words to View-only Sched's "Working draft" face. That cuts against a recorded owner request, and the plan never says so.**
- *Case:* a member opens a published Monday on View-only Sched and switches the picker to "Working draft — not issued". `viewVerSelHTML` offers this choice to every reader.
- *Today:* the dotted waiting underline on words, and the dotted outline on area, time, remark and in-time cells, apply only under `#eWeek` and `#schedBoard` (`04-pucks-sections.css`). So on `#vWeek` a waiting text change has no mark at all. A waiting cell wears only the neutral gold dashed outline (`[data-alp]`). Only the puck's hollow tag shows there, because its rule is not scoped to a page (D93).
- *The record:* `ui-contracts.md` §Amendment marks on screen says "Pending marks split by surface (owner request, Aug 26) … the view-only page keeps the neutral dashed hint … (no text-level mark)."
- *The plan:* roll-call row 8 reads today as "waiting marks too (D93)" and gives the verdict "waiting marks dotted, number hollow". D93 covers pucks only. D2619 says nothing about which page shows waiting marks.
- *Two consequences:*
  - Building row 8 as written shows members a new mark on a face he kept free of it.
  - Removing "the cell outlines" (step 3) without a replacement deletes the neutral hint. That is the only sign of a waiting area, time or remark change on that face.
- *Fix:*
  - Correct row 8 to today's real state.
  - Put to him, with pictures, what the Working draft face shows for waiting words and cells: keep "no word marks" and choose a replacement for the neutral hint, or show the dotted line as the edit pages do.
  - Add a test that pins whichever he chooses on `#vWeek` with `VWORK` on.
  - Update the ui-contracts paragraph in step 8.

**1b. Row 13 gives the board's emptied cockpit seat a mark. D91's recorded reading says the board shows none.**
- *Today:* the board's empty seat is `<div class="sb-slot empty">` or `— FCP empty —`, with no `alAttr` (`board-html.ts`, about line 924). D91 says "an emptied COCKPIT seat … the week shows the 'ALn' badge once issued; nothing while pending, nothing on the board".
- *The plan:* row 13 says "pucks and empty seats … as 3 and 4", and scenario 14 tests an emptied seat with no named surface.
- *Consequence:* a builder who reads row 13 adds a new visible mark on the board. That breaks D91's reading and D1625, which says a new visible mark is drawn for him first.
- *Fix:* row 13 becomes "pucks HAS IT; emptied seat MUST NOT, because D91". Scenario 14 checks the board's empty seat stays bare. Row 4 also needs the pending half of D91 ("nothing while pending"): `.seat[data-aln]::after` has no page scope and would put the hollow number on `.seat.empty-slot`. Check it against today's app and state the result.

**1c. Section 1.5 keeps the "ALn" words on version labels on the strength of the agent's reading, told to him only after the build.**
D90 and D201 say a case the newer ruling does not clearly cover goes to him as a question. Lesson 32 (the very lapse [READINGS-LAPSE-FIX] exists for) is a reading carried through to the build. The reading is well supported: the "Changed in AL1 AL2" key itself uses the words, so D2619 cannot mean "no ALn anywhere". *Fix:* add it as Q8 in the same round as Q1 to Q7, recommendation "keep", one picture. Asking costs nothing, and the build otherwise rests on it.

**1d. Q3 tells him something false about who can look back at an older version.**
- *The plan:* Q3 says "A scheduler or member … uses the eye or the version picker to look at Monday as it went out at AL3". Scenario 9 asks for "View-only Sched's picker".
- *The code:* View-only Sched's picker on a published day offers only "ALn — as issued" (the current version) and "Working draft — not issued" (`viewVerSelHTML`). Its own comment says the view page "never grew the version machinery". Only the scheduler's eye on Edit Schedule and on the board looks at an older AL.
- *Consequence:* D2439 asks each question to say who meets the case in real life. Telling him members meet this case would sway his answer.
- *Fix:* rewrite Q3's case as scheduler-only, and drop the View-only picker from scenario 9.

**1e. Step 2's test table writes the recommended answers to Q3 and Q4 as fixed facts.**
Examples: "AL3 removes a row only: … nothing on the day is newest", and "a look at AL1 …: AL1's mark is not older (Q3)". Step 0 does require his answers first. But a table that reads as settled is exactly how a reading turns into a rule. *Fix:* mark each such row "per his answer to Q3 / Q4", and rewrite it when he answers.

**1f. Q4 is put to him as open, though D2618's own words settle half of it.**
"Only the day's newest published AL keeps a solid line": when AL3 changed nothing that can be marked, AL2 is not the newest, so it gets no line. Part (a) is the ruling's own reading. Only (b), what the key lists, is genuinely open. *Fix:* put (a) as "the ruling says, confirm", and ask (b) alone. This is minor.

## 2. Places that draw marks, missed or misjudged in the roll-call

**2a. The "Changed in" key's source of truth: "reads the day's marks" is wrong in three concrete ways.**
- *(i) Entries with nothing on screen.* `SCHED.changes` and `SCHED.pending` hold made-up entries with no cell: `del:DAY.SEQ.KIND` for a removed row (D91, `markDeletion`), and `mov:` and `inp:` entries. They also hold inert old entries whose row is gone (`dropRowMarks` deliberately leaves the issued records alone). A key built from the store would list an AL with nothing showing in its colour. That is the very case Q4(b) recommends against.
- *(ii) Waiting marks the store does not hold.* The Unavailable waiting mark comes from `unavPendAtt` and `pendingInputIds`, not from `SCHED.pending`. So a key built from the store misses "waiting" when a late input is the only thing waiting.
- *(iii) Things a member cannot see.* A scheduler-only note's mark sits on something the View-only issued face does not draw. So the members' key would list an AL with no visible colour.
- *A drawing-order trap as well:* on the week the Signed line, and so the key, is drawn before the day body (`html.ts` around line 1846). On the board it sits in a separate strip.
- *Fix:* gather the seqs `alAttr` and `unavPendAtt` actually emit while the day's body is drawn, one set per day per pass. Draw the body first, or fill in a placeholder afterwards. Then build the key from that set. Add tests: a day whose AL only removed a row; a day where only an Unavailable row waits; a scheduler-only note changed on the View-only face; an old entry left behind for a deleted row.

**2b. The key in the board's look strip reads the live marks.**
`boardSignBody` is drawn outside the snapshot swap and passes `view.DPREV.get(di)` itself (`board.ts` 452: "this strip is built outside the snapshot swap"). A key builder called there reads the live `SCHED.changes`, not the looked-at version's `snap.c`. So a board look at AL3 lists AL4 to AL6. *Fix:* build the board strip's key inside `withDaySnap(di, ver, …)`, or take the set from the swapped body pass. Test: a board look at AL3 on a day now at AL6 lists only AL1 to AL3.

**2c. "Newest" for a parked plan or a draft look has no defined answer.**
- `verSeq('d:…')` finds no `#`, so it gives `NaN`. If the builder takes "newest = verSeq of the version on screen", then in a plan look `n < NaN` is false for every mark, and every published AL gets a line.
- Roll-call row 10 says "HAS IT only as the published marks it sits on" but defines no newest.
- *Fix:* state that in a plan look the newest is the day's current published seq. Add a test: a plan look on a day at AL3 lines only AL3's marks.
- Also state that `dayCurVer(di)` inside `withDaySnap` still returns the live current version, because `SCHED.cur` is not swapped. That is the Q3 trap, and it should be said where step 2 tells the builder what to read.

**2d. The key is tied to the Signed line, which is sometimes not drawn.**
`signedLineHTML` returns `''` when `verSigners` is null: no signers recorded, a plan, a legacy record. The multi-squadron branch's "Close detachment" publishes amendments with "no four names" (D2142), so this will happen. Placing the key "where the Signed line is called" and chaining it to that call would drop it on those days. *Fix:* draw the key whenever the day has marks; anchor it after the Signed line if there is one, else after the day head (the try-out's own fallback, `looks.js`). Add one test.

**2e. Roll-call row 15 (board in OIL mode) is too narrow.**
In OIL mode, the board's list seats are drawn by `oilSeatHTML`, which emits no `alAttr`. So pucks there carry no amendment mark today, not just the Unavailable pill. *Fix:* widen row 15 to "no puck mark in OIL mode, and the new number and small mark must not appear there". Decide whether the key still shows in OIL mode, and add it to scenario 19.

**2f. Hover and focus lines on editable text now collide with the line's meaning. The plan misses this.**
- `12-schedule-editing.css`: `.txed:hover{box-shadow: inset 0 -1px 0 rgba(59,198,232,.4)}` puts a cyan 1px line at the foot of every editable text on Edit Schedule, and `.txed:focus` puts on a 1px accent ring.
- Under the new look a line means "newest or waiting". Hovering an older change, colour only, makes a cyan line appear. That reads as a mark, and it sits near AL6 azure. On a newest change, hovering draws two lines.
- *Fix:* add it to risk 4 and risk 7, and to scenarios 21 and 24 (hover an older change, a newest one and a waiting one, on a desktop). Measure that the hover line cannot be mistaken for the amendment line. If it can, that is a question for him with a picture, since the hover look is an existing design.

**2g. Stores chips: a careless rule would colour a warning mark.**
The `.rmkcell` that carries the stores mark (`st:`) also holds `cxtag` (the cancellation tag), `flagtag` (the "!" flagged for the next scheduler), the SA badges and the remark's own text with its own mark. A rule such as `.rmkcell[data-alc]{color:var(--alc)}` would recolour those, and recolour the remark words that D2619's try-out keeps plain. *Fix:* step 3 targets the stores chips only. Add a browser test: in a cell whose stores changed, the CX tag, the "!" tag, the SA badges and an unchanged remark keep their computed colours.

**2h. Q5's premise is only half right.**
In edit mode an emptied `.txed` draws `::before{content:'—'}`, or its `[data-ph]` ghost text, inside the marked span. The text decoration carries onto that generated text, so on Edit Schedule the emptied change does not vanish. It is a grey dash with a coloured line. It vanishes only on View-only Sched and on read-only spans. *Fix:* measure on the build. Put Q5 to him with the real picture of both pages, not "invisible on both".

**2i. Code parses `alAttr`'s output as a string.**
`board-html.ts` 291 tests `/data-alp=/.test(al)` to drive the note's "Make public" toggle (D1588, D1592). *Fix:* keep the attribute names and order unchanged in step 2, and add a guard test that the note toggle still knows a waiting note.

## 3. Wrong or missing steps, tests and risks

**3a. A test listed as "passes unchanged" will fail.**
`html.test.ts`, the test at lines 687 to 711, ends with `expect(h2).not.toContain('>AL1<')` after AL2 is issued. AL1's mark on `dn:0.0` remains, so the new key "Changed in AL1 AL2" puts `>AL1<` in the HTML. The plan lists `html.test.ts 689 to 707` among the tests that must pass unchanged. *Fix:* move it to the rewrite list and keep its purpose: narrow the check to the day head's slice (the `head()` helper already exists), so it still proves the tag is replaced and not added to.

**3b. The "rules sweep" is missing from the FULL order.**
`bug-check-order.md` §tiers, FULL, lists "the rules sweep" first: every ruling that applies, one mark per surface for a ruling about something shown. The plan's order goes from the roll-call to the door check and leaves it out. *Fix:* add a sweep table covering D91, D92, D93, D95/D102, D97, D98, D110/D111, D113, D172, D187, D362, D736, D1588/D1592, D1784, D2333 and D2618/D2619/D2735 to D2738, with one cell for each of the week, View-only issued, View-only working draft, the board, the board look and the edit-week look.

**3c. Missing scenarios.**
- A member on View-only Sched's "Working draft" face (1a).
- A board look at an older AL, with its key (2b).
- A plan look on a published day (2c, which scenario 11 only half covers).
- Hover and focus on newest, older and waiting text (2f).
- A cell whose stores changed, holding CX, "!" and SA badges (2g).
- The board in OIL mode with marked pucks (2e).
- A day with only an Unavailable change waiting: the key shows "waiting" (2a ii).

**3d. A guard test for Unpublish.**
After an Unpublish, no published mark may carry a seq above the current version's. That would be neither older nor newest. Add it beside step 2's Unpublish test, with an explicit rule for `n > newest` (treat it as newest, or refuse it).

**3e. The readings branch (section 0, point 1).**
"Or the build branch brings it in" would pour 85 commits of rule and guide changes into a code pull request. That bypasses those changes' own required reads (Astra plus a fresh Opus for a working-guide change, D1738 and D1761) and his separate "merge live" (D1737). *Fix:* recommend that the readings branch merges first, on his word. Bringing it into the build branch should be the fallback, and if it is used, say plainly that those rule changes then go live inside the build's pull request.

**3f. Words.**
D2441 says every word people read is reviewed by a fresh Fable. That includes "Changed in" and "waiting" (the word "waiting" comes from the try-out, not from D2619's text), plus the screen-reader sentence and any changed hover titles. The plan asks for one sentence only. *Fix:* the Fable words read covers every new or changed string.

**3g. The hot paint path: a design pointer to add to step 2.**
`nextSeq` already walks `SCHED.als` on every pending cell, and `dayCurVer` runs `daySnapIn` validation. A per-day "newest" must be cached in `passMemo`, which is keyed by the day object and so is safe across the swap. It must not be a module variable keyed by day number, which would serve the live answer inside a look.

## 4. Tier and readers

- **FULL is right:** the published face's reading changes, and a shared drawer feeds every surface.
- **Question 7 (roles) is not a clean NO** until 1a is settled. What members see on the Working draft face changes, and the walk must prove it. It is not an access change, so no security read is needed.
- **Code readers are right:** Astra first, a fresh blind Opus and a fresh blind Fable (D1770, D790, D2440).
- **Scenario design is right:** Astra and a fresh Fable, each blind (D2443).
- **Build model is right:** Fable, because this is a high-risk screen build. The walkers are Opus (D2256).
- **Words read:** widen it (3f).

## Verdict

The plan is sound in shape and tier, but it cannot be built as written. Fix the View-only "Working draft" contradiction (1a), the board's empty-seat mark (1b), the false Q3 case (1d), the key's source and look-strip faults (2a to 2d), and the html test that will fail (3a), and put the version-label reading (1c) to him, before step 1.
