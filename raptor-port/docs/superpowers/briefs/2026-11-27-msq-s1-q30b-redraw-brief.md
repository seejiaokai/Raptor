# Section 1 (the guard rail) — question 30 redrawn: a medical still open when the man moves (chat 204, 27 Nov 26)

**A drawing-and-design job, for one card to the owner. No file under `raptor-port/src` changes.** Use the shape of the
round's drawing:
- read `2026-11-27-msq-s1-round-kr-draw-brief.md` and its report (`…-round-kr-draw-report.md`), and the q30 part of
  `2026-11-27-msq-s1-q30-31-draw-brief.md`;
- reuse `scripts/handpass/n204/draw-round-kr.mjs` and `draw-q30-31.mjs`;
- desktop 1536×864 and phone 390×844, 2× crops with the teal ring;
- your own worktree, with the junction removed at the end, and the checks lock taken for the build;
- look at every picture.

Your worktree should be at commit `4bd3b040b` or later. Put your pictures in
`raptor-port/docs/mock/2026-11-26-msq-questions/q30b/`, your script in `scripts/handpass/n204/draw-q30b.mjs`, and your
report in `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-q30b-draw-report.md`. All three stay **in your own copy,
uncommitted**.

## His question (27 Nov, on card 30)

"What about this person is pending upchit and he moves sqn halfway. What would it show?"

Card 30 asked whether a moved man's old medical records show on 149's Medical tab (answer A: they stay on 142's). His
point is this. Quill, a member pilot, moved from 142 to 149 with his OML still awaiting its upchit. Under A, 149's tab
would hide that Quill is not yet cleared, and 149 needs to know that to schedule him. The card is on hold until this is
redrawn.

## The job

1. **Find out what the app does today, by real presses**, for a medical still open at the move: Quill's OML of 6–9 Jul,
   still in Pending upchit when he moves 142 → 149 from 16 Jul. The seed's case, as the round drew it.
   - What shows on 149's tab, and on 142's?
   - Who can open it live, and where would its Save write?
   - What does the schedule show of Quill on 149 (is he struck, or flagged)?
2. **Read what the rulings already say** with the shell: `grep -h '^| D2163 |' .claude/decisions-full/*.md`. Do the same
   for D2160, D2136, D2621 and D211, and search for "medical" in those rows. D2163 says a transfer carries his "inputs,
   medical records". Say what that settles and what it leaves open.
3. **Work out the choices and recommend one.** The recommendation must show 149 that Quill is not cleared, and must never
   let a record be saved into the wrong squadron. Candidates:
   - (B) the record still open at the move goes with him and becomes 149's from the move: 149's admins see and edit it;
     its days before the move stay on 142's history, read only there;
   - (C) it shows on both tabs, editable only under the squadron it belongs to;
   - (A) as card 30 had it: stays on 142's tab.

   Say what each means for an upchit filed after the move, for the schedule's strike or flag on 149, and for K10's rule
   (the window opens live only on the input's own squadron). Say which of them the app can show today by real presses.
4. **Draw:**
   - today, on 149's tab and on 142's, and the window opened from each;
   - each choice, where real presses can reach it, captioned with how it was reached;
   - any other choice described in words only.

## The card text (in the report)

Plain words, for the owner. Include:
- **every person named with his role**, his D2833: "Quill, a member pilot who moved from 142 to 149", "Saber, a master
  admin", "Kestrel, 149's admin who also plans 150";
- a title;
- "When this happens": who, at what point, how often;
- each choice and what he'd see;
- the recommendation and why.

Reply in under 150 words.
