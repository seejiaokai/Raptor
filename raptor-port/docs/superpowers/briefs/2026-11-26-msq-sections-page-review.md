# The four section pages — a fresh Fable's review before he sees them (chat 191, 26 Nov 26)

Brief: `2026-11-26-msq-sections-page-review-brief.md`. Folder `C:/Users/User/projects/Raptor-msq`, branch
`claude/msq-b1-screens-135`; nothing committed, nothing switched. I wrote none of the pages. Read through the design
skill (`impeccable`, critique, for a 390-wide phone): the four bodies whole, the four drawers' reports, the words
review, the plan's §8.3–§8.5, §19.6–§19.8, §19.13, §21, §22, §23, §24, and the full rows of D332, D1626–D1628, D2636,
D2653, D2659, D2660. Changed: `body-s{1,2,3,4}.html` and one rule of the shared `head.html` (below); all four rebuilt.

**Checked at 390 px (WebKit, a copy with a viewport line — `scratchpad/chk.cjs`, after `n188/page/check390.cjs`):**
no sideways scroll, no broken picture, no script error, the reply bar answers a pressed Differently and marks its row
in the list, on every page; pictures of each page's top and of two or more questions opened, before and after.

| Page | Build check line | At 390 px |
|---|---|---|
| Section 1 | `bytes 49873 pictures 57 missing [] dead links []` | 390 wide, 28,836 high, 25 Differently buttons, no error |
| Section 2 | `bytes 59802 pictures 82 missing [] dead links []` | 390 wide, 47,449 high, 30 buttons, no error |
| Section 3 | `bytes 39494 pictures 25 missing [] dead links []` | 390 wide, 18,718 high, 23 buttons, no error |
| Section 4 | `bytes 32608 pictures 31 missing [] dead links []` | 390 wide, 16,927 high, 13 buttons, no error |

## Faults that would have misled him (fixed)

1. **Section 3, three pictures showed the wrong part — a fault of the shared frame.** A tall picture cut from a wide
   one was centred instead of started at its left (`figure.tall img{justify-self:center}` reaches the cut's picture in
   today's browsers, WebKit and Chromium both). Q1's "Kestrel's Admin column ends at Data" and the Display group's
   "where its card sits" each showed the middle of the screen, not the column; Q4's picture showed the bell preview.
   Fixed in `head.html`: `figure.tall .cut img{…;justify-self:start}`. Measured after: every cut on all four pages
   within 3 px of its numbers (`scratchpad/probe.cjs`).
2. **Section 3 Q4, the picture was cut to the preview, not to what the question is about.** Recut to 149's two
   sliders with Save and Reset.
3. **Section 1 group 4, the "no leave period" phone picture.** It was redrawn shorter after the words review (1480
   high); the cut still said 1720, so it showed the wrong strip. Recut, and its caption now says what the drawer
   found: on this taller form the note lies over the form's own Cancel and Save for its few seconds.
4. **Section 1 Q3, the desktop picture** was the whole 3072-wide screen at a phone's width — no word readable. Cut to
   the note; a tap still opens the whole screen.
5. **Section 2, a press on a group's Differently wrote "S4" in the reply while the page called the group "D"**, and
   its row in the list was never marked. And "group B" there clashed with his own "group B" (Logout, Undo, the
   refresh card — D2636), which section 1's page uses.

## Section 1 — the guard rail

- Changed: the top heading reads "Open questions" (was "Still open: your answer needed"); a heading "The open
  questions" before Q1; the how-to line names groups too; the two recuts above; groups keep their numbers, ids
  `s1`–`s6`, each with its own Differently ("S4 (group 4, the Calendar's notes)" in the reply) — groups 4 and 5 are
  all new drawings he has never answered, and had no button.
- Checked and kept: every recommendation against the plan's holds — Q1 is NQ2, Q2 reading 17, Q3 the words gap, Q4
  reading 20, Q5 D2652 N8 a, Q7 reading 18, Q8 reading 19, Q9 N14; each "you ruled" is his. Approved against new
  drawing agrees with the drawer's report and the ledger.
- **Would put to him, not on the page:** (a) the Leave War's show-only sheets — the plan lets none close by itself
  until the builder's list, each with what it holds, has been put to him; the page only says "checked before the
  build"; (b) his own input of a squadron he moves to, on his home page (the plan's §5.5 row, a hold on K10);
  (c) "Mark all read" marking another squadron's lines, and a waiting OIL question taking the bell's one tap — both
  still owed since round 5; (d) Q9 says "after a set time" — he may ask how long; the builder's to name.

## Section 2 — Admin → Users across squadrons

- Changed: groups renumbered 1–8 (were A–H), ids `s1`–`s8`, their buttons naming the group; "When" reads "When this
  happens", "the other answer" reads "the other choice", named choices come in brackets in the reply — all as the
  other three pages; "Nothing here is built yet." in the lede; Q10–Q12 say how often (rare); Q5's "Today" caption
  says it is cut from the drawn page; **Q3 gains a line that the "Home squadron" box in its pictures is today's and is
  asked on section 1's page** (section 1 recommends removing it — the two pages disagreed in the picture).
- Checked and kept: Q1 (home squadron first, everywhere — the plan's §8.5, his N3 h words), Q2, Q3 (V-Q2, with the
  form shut by the press, as the drawer's fact 2 requires), Q4, Q5–Q7 (the fold's readings), Q8–Q9 (NQ1, NQ3),
  Q10–Q12 (readings 22–24), Q13 (the longer words).
- **Would put to him, not on the page:** Q6 carries two readings in one answer (what an Outgoing row opens, and one
  opened row a page) — sound as one, but if he answers "does not open" the second falls away; the film's timings
  (0.6 s run, 0.3 s back to grey) are the drawer's readings, shown but not named as a choice. The page is 47,000 px
  high — 56 screens; the list at the top carries it, but group 7's ten pictures in one run is the longest stretch.

## Section 3 — the bell, colours and Display

- Changed: the frame fault and the Q4 recut above; "Open questions"; the five groups numbered, ids `s1`–`s5`, each
  with "↑ The list" (they had none) and a Differently; "When this happens".
- **The new line, read (D2441): adjusted.** "Blocked: save your colour change or put it back, then pick 149." →
  **"Blocked: save your colour change or slide it back, then pick 149."** Reason: every note of this family names a
  press the form offers ("save or cancel…"). Display offers Save and Reset, and Reset, as recommended in Q3a, goes
  to the starting colour — it does not drop a slide. "Put it back" names no control; "slide it back" names the one
  thing he can do. "Your colour change" is kept: "149's colour… then pick 149" would read twice over in his example.
  The plan's earlier draft, "save or reset your squadron colours", would be untrue for the same reason.
- **Q4 now states its cost,** which it did not: with no Cancel, the only way to leave without saving is to slide two
  sliders back by hand. The recommendation stays the plan's (refused); the other choice is one tap away.
- Checked and kept: Q1 (no card), Q2 ("can show"), Q3 a–d, Q5 (each admin's own look — the red team's question),
  Q6 grey (the plan: colour is the bell's alone; the drawer had recommended colour — the page is right to follow the
  plan), Q7 (asked, with the published record named).
- **Would put to him, not on the page:** (a) if he keeps Q4 as recommended, a "Cancel" beside Save while a slide is
  unsaved would make the note "save or cancel your colour change" and end the hand-sliding — a new control, drawn
  first; or Q3a's other choice gives it; (b) whether a slide slid back by hand counts as unchanged is the builder's
  to confirm, or the note traps him; (c) captions say "approved in round 6" for pictures drawn in round 5 and answered
  on round 6's page (bug reports, the badge, the sign-off box); sections 1 and 2 say "round 5" for the same kind —
  left, since both are true, but one convention would be cleaner.

## Section 4 — the Leave War posting sheet

- **Added Q4 — the "Delete Cinch?" card's Delete button** (the host's addition; `s4-{d,p}-delete-grey` exist, made
  11:39): today's reddish Delete beside the dashed grey one, phone first; recommended dashed grey, as his D332 rules
  for every Leave War sheet (only a counter's own Delete is red — D673, D676); the other choice "Keep today's look".
  The count reads 4; group 1's card caption says it is drawn with today's colour and points to Q4.
- Changed: the lede and how-to line as the other pages (nothing built yet; green is the recommendation); the cast in
  the shared form; "Recommended:" taken off the three green short lines; "I would build" → "Recommended", "the other
  way" → "the other choice"; Q2's pictures are the phone's (the title was too small to read in the desktop's); Q3
  no longer wears the teal "new" edge (it has no drawing); groups ids `s1`–`s4` with a Differently each.
- Checked and kept: Q1 (D2660 — A, B, C as the drawer's report), Q2 (the drawer's reading of D2653 f, asked), Q3
  (the plan's reading of "pressing the day again", asked; "not yet tried on screen" said). "Transfer to Sqn" in no
  picture (D2659). Group 4's phone "approved in round 6" is true (the ledger's 4.11).
- **Would put to him, not on the page:** nothing more. For the builder: the chosen chip's row is 2 px taller on a
  phone; whether the dragged days stay highlighted behind the sheet was not checked (both from the drawer's report).

## Across the four pages

Now the same on all four: the answer line, "Open questions", "When this happens", "the other choice", brackets round
a named choice in the reply, numbered groups each with its own Differently and a mark in the list once pressed.
Left as they are: section 3's and section 1's group pictures carry no per-picture button; the pages' lengths.

Not done: nothing was published; the pages were not opened on a real iPhone (WebKit at 390 wide stands in).
