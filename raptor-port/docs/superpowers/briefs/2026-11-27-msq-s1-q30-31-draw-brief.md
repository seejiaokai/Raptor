# Section 1 (the guard rail) — the drawings for questions 30 and 31, K10's two findings (chat 204, 27 Nov 26)

**A drawing job: pictures of the real app for two questions put to the owner. No file under `raptor-port/src`
changes.** Use the shape of question 29. Read `2026-11-27-msq-s1-q29-draw-brief.md` and its report first, then the
q24–25 brief they name. Where this brief is silent, their rules hold:
- your own worktree, with `node_modules` linked by a junction and the junction removed at the end;
- the checks lock for the build, and the port;
- 2× crops with the teal ring;
- look at every picture you make;
- every picture at a desktop's 1536×864 AND a phone's 390×844.

Reuse `scripts/handpass/n204/q-lib.mjs`, `q2425-lib.mjs` and `draw-q29.mjs`. Your worktree should be at commit
`43661f601` or later; check it.
- Script: `raptor-port/scripts/handpass/n204/draw-q30-31.mjs`.
- Pictures: `raptor-port/docs/mock/2026-11-26-msq-questions/q30/` and `…/q31/`.
- Report: `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-q30-31-draw-report.md`.

Put all three **inside your own copy** and leave them uncommitted. Give the full path of your copy in your reply.

Read K10's report first (`2026-11-27-msq-s1-k10-report.md`, §FIRST): it gives the exact presses for both findings, and
the test `ui/msq-guard-input-sqn.test.tsx` "FINDING — …" reaches each state.

## Question 30 — the Medical tab after a man moves

**Today.**
1. Saber (`ad` / `a`, master admin) picks 149 and opens Inputs → Medical.
2. He moves "as of" to Thu 16 Jul.

Nasty moved from 142 to 149 from Thu 16 Jul, and his OML of 6–9 Jul, filed while he was 142's, is on 149's tab. If the
seed does not hold this move, make it by presses: Admin → Users, Nasty's row, a move to 149 from 16 Jul. Say what you
did.

Pictures:
- **q30-149-today:** 149's Medical tab with Nasty's OML card in sight; ring the card.
- **q30-149-today-open:** after pressing the card, then "Edit input". The window open and live (not greyed) under a top
  bar reading 149. Ring the squadron number and the window's Save.
- **q30-142-today:** the same as-of day on 142's Medical tab (pick 142). Does Nasty's OML show there? Picture whichever
  it is, and say so.

**Proposed** (his OML stays on 142's tab, and 149's tab shows only his records from the move on):
- **q30-149-proposed:** 149's tab with that card hidden by changing the page. Caption it "proposed: drawn by hiding the
  card". Change nothing else.
- **q30-142-proposed:** 142's tab with the card on it. If it is already there today, reuse the picture and say so.

## Question 31 — a bell line about a request whose man has moved since

Use **Kestrel** (`ad9`; 149's admin, who also plans 142 and 150; check the seed, and give him Plan of 150 through
Saber if needed). He holds Plan of 150, so today his Save would write 150's record under a bar reading 149. That is the
worst case, and the one to show.

**Set up by presses:**
1. Hunter (or Saber) files a Training for Osprey (149's) on a day ahead.
2. Another admin changes it, so Kestrel's bell gets a line about it.
3. Saber moves Osprey to 150 from a day before the Training's.

**Today:**
1. Kestrel signs in on 149 and opens the bell (**q31-bell**, the line ringed).
2. He presses the line (**q31-today-open**): 149 in view, Inputs, the Training's window open and live. Ring the squadron
   number and Save.

**Proposed** (the line brings the request's own squadron, 150, into view first, then opens it):
- **q31-proposed-open:** reach it by real presses: pick 150, open Inputs, open the Training. Caption it "proposed:
  reached by picking 150, then opening it".

Also find out from the code what the proposal would do for **someone who only VIEWS 150**, such as Hunter. View never
reaches another squadron's Inputs (his D2252). So does the line then open 150's View-only Sched with no window, open
nothing, or something else? State the answer in the report from the code (`state/belltap.ts enterForLine` and the page
door). Do not draw it.

If a step cannot be done as written, picture what you found instead and say so. Draw nothing else.

## The report

For each picture, give:
- its file and its size;
- one plain caption: who is doing what, what he pressed, and what the screen shows;
- whether it is the real app today, or the proposal and how it was reached.

Include the View-holder answer for question 31.

Then reply in under 120 words.
