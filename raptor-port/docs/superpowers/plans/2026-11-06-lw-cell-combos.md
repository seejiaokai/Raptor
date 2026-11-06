# The Leave War's cells: every combination of entries on one day (his D1723, 6 Nov 26) — brief

**His words:** "then there actually a lot of combination of multiple inputs. Can u go through comprehensively to fix" — after
his iPhone pictures of pull request 646's preview showed Cobra's Sat 26 Dec (an FO award beside a whole-day Attach) and
Sun 27 Dec (an Attach beside an Other) drawn side by side with their letters cut: "FO|TC", "TC|TH" (filed first as
[LW-SIDE-BOXES-CUT]). Backlog item: [LW-CELL-COMBOS].

## What is known (6 Nov 26)

- Two whole-day entries stand side by side in the cell (D1167), each half the cell's width; a box of three or more letters
  there is drawn at 6.5px (`matrix.css` `.c.wide:not(.whole)`). On his iPhone at the phone's opening zoom a half is about
  12px inside — "ATCH" needs about 16px, "OTH" about 12px, so the letters are clipped.
- A whole day beside a half: the half takes a quarter on the right (`right-am`, `right-pm`, 6.5px).
- The corner marks ("!", "+n") and the PO tags (the small grey PO on a gone day, the yellow PO of a man's last day in)
  sit on top of the box; the yellow one already covers part of a box's letters ([LW-POLAST-COVERS-LETTERS]).
- The grid zooms from about 0.4 to 1.4 on a phone (D1283, D1284) and opens at 0.8; a desktop at 1.

## The job, in order

**His D1725 (6 Nov 26), for the build and the walk alike:** every combination of entries on a day (whole days, halves, two or
more, each kind) is checked for how it looks on the grid, what a tap opens, how that window looks, and how to reach and make
each change from it — pictured at his iPhone's size and a desktop's, each driven through the real controls.

1. **Go through every combination, measured, not guessed.** A script on the real build lays out each combination on one
   day — every pair of a whole day, a morning and an afternoon; three or more ("+n"); every kind's letters (2, 3 and 4
   letters, FO* / HO* with the star, B / C, ATCH, OTH, CSE, OD, the leaves); each beside a corner mark, the grey PO tag and
   the yellow last-day PO; approved, pending and refused looks — at his iPhone's size (402, at the opening zoom, the
   smallest and the largest) and a desktop's, and measures for each box whether its letters fit inside it. The result: one
   table and a picture of every combination that fails.
2. **Draw the fixes** for the families that fail (D1625), standardised to the app's own boxes (D1496), with Impeccable;
   the ways to look at, among others: smaller letters where they still read; the two whole days one above the other
   (which D1167 set aside, so his word is needed); a short form for a code too long for its half; a tag moved off the
   letters. Put to him as a page, today beside each option, the recommended one first.
3. **Build** what he picks, every combination re-measured by the same script (it is the re-walk), at both sizes and the
   zoom ends; a WALK tier check at least, the drawing check against his pick.

**His D1727 (6 Nov 26), questions 1 and 2 answered — "i prefer this":** two whole days side by side, codes reading bottom to top; a whole day beside a half keeps the cell, the half over its half; "!" an outlined amber tag; a stack of cards for three or more; the PO turned in a strip down the day's right edge (yellow last day, grey posted out); long codes one size smaller. The build starts from option D/E's CSS in `scripts/handpass/lw-cell-combos-options.mjs`. Open before the build: how a posted-out or last day holding two entries looks (the strip leaves the codes no room — about 2,800 combinations).

**His D1726 (6 Nov 26), question 3 answered:** zoomed out, the boxes keep their letters and every code's letters shrink with the grid by one same scale — LL and OL never drawn bigger than the rest (today the iPhone's 9px smallest-letter floor keeps the 10px boxes' letters at 9px). The build sets those letters so the floor never applies at any zoom below 1, and re-measures at the zoom ends.

Not in this job: what a tap on such a day opens and what can be changed there — that is his other question of 6 Nov 26
(full editing on the Leave War), filed apart.
