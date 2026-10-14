# Read — the design guide's "one mark, one look" draft (`[GUIDE-ONE-MARK]`, D866)

A fresh, blind Opus reader (D790, D810's precedent). Read-only; nothing else changed.

**Verdict: NOT READY AS DRAFTED — one must (G1) and four shoulds (G2–G5); changes 1, 2 and 4 are sound apart from
G3's parenthetical. With G1–G5 taken, ready to put to him.**

## Findings

### G1 — must — change 3 presents the agent's readings as his ruling (D138; the guide's own convention)
- **The words:** the point's head "**One mark, one look (owner D860, D861, 15 Oct 26; carried here by D866).**" covers
  every clause under it, and four of them are not his words:
  1. "a row, a wave or a block that IS the thing added, round itself": D860's reading (2), "said to him", not his words;
  2. "a table's row as one box round the whole row, never one per cell": D861 rules the desktop Inputs List only ("THE
     DESKTOP INPUTS LIST DRAWS ONE BOX ROUND THE WHOLE ROW"); "a table's row", meaning any table, is a generalisation;
  3. "A thing wearing it shows no other flash with it": D861's ruling names the month's bar only ("THE MONTH'S BAR WEARS
     ONLY THE PLAIN JUST-ADDED RING — NO GLOWING LANDING FLASH BEFORE IT"), and even that is its reading (1) of "same
     thing no glow"; "a thing", meaning any, widens it;
  4. "A new kind of mark is a ruling of his, never a variant of this one": the draft's own "Why" calls it "the agent's
     reading", but the guide text does not say so.
- **Why:** the guide marks where a reading began, even after he approves it: §0's D852 paragraph ("…began as the
  agent's reading; he approved the paragraph as written, D855") and §1's D850 point ("Everything below began as the
  agent's reading of those words; he approved it as written here"). Without that line he approves a paragraph that
  says he ruled on every table, every flash and every new mark, when he ruled on one list, one bar and one look.
- **The fix:** add this after the point's last sentence: "(His words: the board's plain ring with no glow on the
  Inputs pages too, and a note ringed on its own box, D860; the List's one box and the month's bar with no landing
  flash, D861. That a line, a wave or a block is ringed round itself, that any table's row is one box, that no thing
  wearing the mark shows another flash, and that a new kind of mark is his to rule, began as the agent's reading; he
  approved them as written here, D…)". Fill in the D-number when he approves. Until then, show the four readings to
  him as readings when the wording goes to him.

### G2 — should — a block is not ringed "round itself" today
- **The words:** "a row, a wave or a block that IS the thing added, round itself."
- **Why:** `highlights.ts paintFreshAdds` rings a new block as its heading row (`.sb-psub`) plus a separate ring on
  each of its rows (`.sb-arow` siblings, each wearing `.sb-fresh` with its own 6px corners). So it draws several boxes
  stacked, not one box round the block. The code comment says "so the whole new block reads as one", but by the CSS
  it is several rings. A next agent who reads "round itself" next to "never one per cell" could take that as a rule
  and "fix" the block into one box, which he has not ruled. Or he could be told the block is already one box when it
  is not.
- **The fix:** "a line, a row or a wave that IS the thing added, round itself; a new block, round its heading and
  each of its rows." If one box round a block is wanted, it is a new suggestion for him under D852 step 3, with a
  picture. It is not written into the guide as today's look.

### G3 — should — change 4 states a behaviour the app guarantees only on the month's bar
- **The words:** "the picked-up look and landing flash of a drag (never with the ring on the same thing, §4)".
- **Why:** §5's sentence describes "the motion already in the app … as measured". `ui-contracts.md` and the
  stylesheet guard one surface only: `.ib-bar.innew.lift-land::after{content:none}` (the month's bar). On the
  Scheduler Board the ring follows the row's PLACE (`FRESHADD` holds slot keys), so a row moved into a just-added row's
  place within its six seconds would wear the ring and get its landing flash at once (`rowdrag.ts` `markLand`). This
  is my reading of the code. I did not run it. Also, change 3's "no other flash with it" can be read as forbidding the
  drop flash of a seat, and a new flag's blink on a puck (`.puck.flagnew`), inside a line still wearing the ring.
  §5 lists both as motion he asked for.
- **The fix:** in change 4: "the picked-up look and landing flash of a drag (a month's bar wearing the ring shows no
  landing flash, §4)". In change 3: "A thing wearing it shows no other flash of its own over it. A flash on something
  inside it, such as a puck dropped into a new line or its new flag, belongs to that thing." That second sentence is
  one of G1's readings.

### G4 — should — the mark is worn by more than "a thing just added"
- **The words:** "The just-added mark looks the same wherever the app marks a thing just added".
- **Why:** D854 rules that a changed input in view "WEARS THE JUST-ADDED MARK INSTEAD" of "Input updated". The code
  lights an input that was added, changed, or put back by Undo (`InputsPage.tsx`: "one added, one changed, one put
  back by Undo"; `InputCard.tsx`, `25-inputs-calendar.css`: "just saved, changed or brought back"). Picture an agent
  designing the feedback for an edit on a new screen. From this sentence, and from §1's "a changed value shows
  changed", it would not learn that this same mark is how the app already shows a change in view. Then "a new kind of
  mark is his" leaves it with no mark it may use.
- **The fix:** "The just-added mark looks the same wherever the app wears it: a thing just added, and on the Inputs
  pages an input just changed or put back by Undo (D854). Today that is the Scheduler Board, the Inputs calendar's
  month and its opened day, and the Inputs List:" followed by the look as drafted.

### G5 — should — "the edge of the thing added" has no test for a kind not named
- **The words:** "It sits on the edge of the thing added: a note's own box, not the row it sits in; …".
- **Why:** an agent marking a new kind of thing (a card in a new list, a person on Admin → Users, a Leave War cell)
  gets three examples and no test. D860's reading (2) gives the test: the ring hugs the thing's own box, and leaves
  outside it the controls its row carries for it ("the row's grip, its number and its ✕"). The draft dropped it. The
  draft also does not say where the mark is NOT used: a puck dropped in a seat gets no mark, because "THE PUCK IS THE
  SIGN" (D854). §1 already covers the week and the dense grid.
- **The fix:** "It sits on the edge of the thing added, its own box, and leaves outside the controls its row carries
  for it (a grip, a number, a ✕): a note's own box, not the row it sits in; …". Then add: "A puck dropped in a seat
  wears none: the puck is the sign (D854)." The first part is D860's reading and goes under G1's line.

### G6 — could — the timing and the reader who asked for less motion
- **The words:** "for about six seconds and then its fade."
- **Why:** the fade is the LAST half second of the six (`ui-contracts.md`: held for 5450ms of 6000ms, then a 550ms
  fade). It does not come after the six. The point also says nothing about the reader who asked for less motion. §1
  and §5 cover that reader, but this is the point an agent will open when it designs a mark.
- **The fix:** "for about six seconds, its last half second a fade (steady and without the fade for a reader who asked
  for less motion, §5)."

### G7 — could — a dash used as a join (§1b test 2)
- **The words:** change 1's "(§4: the plain selection-blue ring, about six seconds — one look everywhere)".
- **Why:** the dash joins a phrase that only spells out the one before it. §1b would use a comma there.
- **The fix:** "(§4: the plain selection-blue ring for about six seconds, the same look everywhere)".

## Considered and left
- **Change 3 sits in §4 (colour), though much of it is about placement and motion.** I left it there: the "Selection
  blue" row is the mark's colour anchor, §1 already points to "§4" for the mark, and change 4 links §5 to it.
- **"2px" in a guide he approves.** I left it: it is a number that matches the contract, and plain-language check 4
  keeps numbers.
- **"never a ring" (the clicked puck) beside "the ring round a thing just added" in the same table row.** I left it:
  the two are told apart clearly enough.
- **Leaving `.claude/rules/ui-design.md` unchanged.** Agreed: its point 2 already says "the Scheduler Board's
  just-added mark".
- **The overlap with §1's "It is the app's own mark, never a new one".** It is not a contradiction. The new sentence
  adds that a new kind of mark is his to rule (G1 marks it as a reading).

## What I did not read
- I did not run the app or any walk. G3's board case comes from reading the code only.
- I read `lift.ts`, `rowdrag.ts`, `InputsCal.tsx` and `InputsPage.tsx` only around the lines named. I did not read
  `state/view.ts` beyond where `FRESHADD` is set.
- I did not read the evidence pictures in `docs/img/handpass/2026-10-15-ring/`.
- I did not read the other reader's report, if there is one.
