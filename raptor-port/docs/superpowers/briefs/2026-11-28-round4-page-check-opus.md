# Round 4 questions page — a fresh check before it goes to him (a fresh Opus, 28 Nov 26)

Read: `raptor-port/docs/mock/2026-11-28-round4/body.html` (identical to the body inside `index.html`), every picture it
cites, the full rows D2855, D2856, D2441, D2001, D2018, `scheduler.md` lines 171-172, round 3's page (E9, E10, F), the
round-3 F-words briefs (drafts, adjust, three cold reads and their item sheets, compare), and the code named in the
brief. The writer's work was not seen beyond these files.

**Result: 16 problems, 3 of them substantive (Q3's standby lines, Q3's framing of round 3, Q2's report of the third
reader), the rest small.** Ordered by weight.

## Substantive

1. **Q3 · "When it happens" · "A man on a standby line (SC, AVALON or BB) is also down for a meeting in his standby
   hours. The warning list shows an amber 'Overlaps standby' line."**
   True: only an SC line raises "Overlaps standby". AVALON and BB are outside the conflict engine (`engine/events.ts`,
   the `saExempt` branch: "AVALON / BB — outside the conflict engine"; their men go to the standby collection, never to
   `shift` events); the Logic page's own row says "An SC MAIN man is also down for something set to Advisory under SC
   MAIN conflicts" (`ui/logic-html.ts`, id `shiftsoft`). A standby row that flies gives the red Conflict instead.
   Fix: "A man on an SC line (not flying) is also down for a meeting in its hours."

2. **Lede and Q3 · "one case your F5 answer did not cover" / "Your answer kept today's words on every other warning.
   But the app's code keeps…"**
   True: his E10 answer (D2855) did cover it — it kept today's words on every other warning — but round 3 told him
   the premise: "Only a conflict between two schedule items stays hidden while the same man is on the same two items;
   every other warning comes back when its words change" (round 3, E10). That was untrue for "Overlaps standby"
   (`validate.ts` both SHIFT_SOFT `add()` calls pass `clashItems(...)`; `warnhide.ts hideKey` keys any warning with two
   items by them, not its words). This job is the readings-lapse fix; the page should own the error, not frame it as a
   gap in his answer.
   Fix (lede): "…and one thing round 3 told you that was wrong." Fix (Q3): "Round 3 told you only a conflict between
   two schedule items stays hidden that way, and every other warning comes back when its words change. That was wrong
   for 'Overlaps standby': the app keeps it hidden the same way…"

3. **Q2 · the cost paragraph · "A third reader … understood them as meant … One small catch remains: 'counts as taken'
   could make someone think of leave taken."**
   True (`2026-11-28-round3-f-words-coldread3-fable.md`): the third reader's main second reading of "counts as taken"
   was "picked or used for something, as in that seat is taken"; leave taken was "a weaker third". It also called
   three more readings two-way — "On the working copy" (only on the editable day, or just where it is seen), "as soon
   as it is filed" (with or without acceptance), "cancels it (CX)" (the input, or a programme item) — and stumbled on
   three verbs for one thing (closes / counts as taken / takes). It suggested "counts as busy" or "counts as not
   available". The page's own words use "busy" twice ("why a man shows as busy", "busy for those hours").
   Fix: report it truly — "The third reader understood the facts, but still had to stop on 'counts as taken' (it could
   mean picked for something, or leave taken) and on three smaller points" — and offer "counts as busy" as a third
   choice, or say plainly why not. Also: "The three rounds of rewording allowed are used up" — there were two
   rewordings and three reads; the cap (D70, about three rounds, ruled for design red-team loops) applied to a words
   loop is the agent's reading and should be marked as such ("I have used the rounds I allow for wording").

## Smaller

4. **Q3 · the pictures' captions · "with F5's hover words", "With F5's words."**
   True: his F5 (D2856) approved the passing note only; the hover sentence on the ✕ is a new line (draft D1 in
   `…-drafts.md`, kept by the adjuster), never shown to him, and the hover on a red Conflict line would change too.
   Saying "F5's words" on the hover passes the agent's reading (that his F5 answer covers the hover) as his ruling — the
   very lapse this job fixes. Fix: "With the new hover words, made to match F5's note (my reading that your F5 answer
   covers the hover too; they would show on every conflict between two items as well)."

5. **Q2 · the bullets · "'closes' is not a word the app uses anywhere else"**
   True: the Logic page itself uses it — the check's own name, and the Half days row: "a half day closes only its own
   half" (`ui/logic-html.ts`, id `halfdays`). What the second reader said: "closes the hours" is not in the word list
   and reads two ways — the man is taken in those hours, or the hours are locked. Fix: "'closes' could mean he is taken
   in those hours, or that the hours are locked".

6. **Settled item · no picture.**
   True: the backlog item ([READINGS-LAPSE-FIX] (b)) says these two lines are "to draft and draw with the six"; his
   rules ask for pictures of the real app for anything on screen talked about (D853, D921) and a drawing of anything
   new before it is built (D1625). Fix: draw the passing note with each of the two forms (the drawing script can raise
   it by hand, as the drafts say no tap reaches it), or say on the page why it is not drawn.

7. **Settled item · "Nobody sees them by a tap today, since the pencil is hidden on such a row."**
   True: there is no pencil on a row any more (D718, D723 — `ui/InputsPage.tsx`: "the pencil and the cross are gone");
   a tap on the row opens the input's window, read-only for him, which shows F3's line instead. The reason in the
   drafts came from a stale code comment in `ui/inputedit.tsx`. Fix: "Nobody reaches them by a tap today: a tap opens
   the input's window, which shows F3's line instead."

8. **Settled item · "They will follow your F3 rule, two forms chosen by the members' switch …"**
   True: (a) carrying F3's two forms onto these notes, and changing F3's "…change this." to "…change this input" with
   no full stop, is the adjuster's and the builder's reading, not his F3 answer — mark it ("following your F3 rule, my
   reading that it covers these notes too"). (b) The condition is simplified: the filer may change it only while the
   switch is on AND for a kind members may file for others (duty and other commitments, never SANS availability —
   `state/perms.ts filedForOther`, `memberFilesForOthers`); with the switch off the filer himself is already told
   "Filing for other people is switched off — an admin can change this." (`inputedit.tsx FILING_OFF`); an input with no
   filer stored takes the short form (adjuster's findings 1 and 2). The page need not list all of it, but "chosen by the
   members' switch" should not be the whole rule; e.g. "the first while the man who filed it may change it, the second
   otherwise".

9. **Q1 · recommendation · "A second reader given these words read them as intended."**
   True for "changes to match". But the second reader (`…-coldread2-fable.md`) still called three parts of the same
   approved lines genuinely two-way: "Change that input" (edit it, or also reject, cancel or delete it), "that was
   accepted", and "publish the day again" (no button by that name). Round 1's comparison recorded the last two as
   settled by the screen; "Change that input" is recorded as settled nowhere (there is no comparison file for the second
   read). Fix: record in the compare file what settles it (if any of those acts changes the OIL at the next publish,
   both readings are true), and keep the page's line as "read them as intended" only once that is recorded.

10. **Q2 · "Two readers, each given the words alone, found:"**
    True: only the first reader was given round 3's words; the second was given the first rewording, and the "closes"
    and "nor does … cancels" points came from that read (they apply to round 3's words too, since both kept them).
    Fix: "Two readers, given these words and a first rewording, found:".

11. **Q2 · recommendation · "It is ten words longer than round 3's."**
    True: 43 words to 52 — nine. (The adjuster's own figure, 42 → 52, is off by one too.) Fix: "nine words longer".

12. **Q2 · bullet · "the buttons are named Reject and Info only"**
    True: Reject is a button's label (`ui/html.ts`); "Info only" is the hover of the ⓘ button (`ui/board-html.ts`).
    Fix: "the Reject button, and the ⓘ button whose hover reads Info only".

13. **Q1 · example · "his OIL box shows HO"**
    True: the box reads "HO*" (`img/facts-r4-f7-sb.json`, "shaft's Sat 18 box"). Fix: "shows HO*".

14. **Lede · "Those reads found three places where the words could be taken two ways"**
    Unclear beside three questions, only two of which are about two-way words (the three places are F2, F7 and F6).
    Fix: "…found words that could be taken two ways on the OIL card (F2, F7) and the Logic page (F6)".

15. **Q3 pictures · the yellow box reads "Hover words (drawn by the script): …"**
    "drawn by the script" is a programmer's phrase inside a picture for him; the caption already explains the yellow.
    Fix: "Words shown when the pointer rests here:" in the picture.

16. **Q1 · F2's changed line is not drawn** (only F7's is). Low — round 3 drew F2 in the same place — but the caption
    "F2's line sits in the same place" asks him to picture it. Optional: a second F7-style crop for F2.

## Checked and true

- D2855, D2856 are stated rightly (F7 drawn first; a changed word goes back to him; F5's words on a conflict between
  two schedule items only; E10 kept today's words elsewhere).
- Q3's code claim: both "Overlaps standby" paths carry the man and the two items, so the hide survives a moved time
  (`validate.ts` the ground-row path and the Meeting-input path, the latter by the input's id; `warnhide.ts hideKey`).
  The page's own caveat ("read in the code, not yet tried on screen") is right to keep.
- Today's ✕ hover and passing-note words (`ui/html.ts`, `ui/board.ts`, `ui/interactions.ts`), today's Logic line
  (`logic-html.ts` id `inputcloses`), today's card lines (`BidPicker.tsx`, admin's sheet and member's sheet).
- The first reader's "follows" report (changes to match / given afterwards, "steps for getting OIL") and the five F6
  points as findings (subject to 5 and 10).
- The F2/F7 words and "two words longer" (20 → 22).
- Every cited picture matches its alt text and caption; pink marks only on the words named.
- Plain language: no code names in the text; each question says when it happens, holds one decision and carries a
  recommendation; numbered 1-3 in sight (D2920).

## Not on the page, for the builder

- A third refusal of the same kind: dragging another man's input on the calendar says "Only a scheduler can move
  someone else's input" (`ui/caldrag.ts`), untrue in the same way (the man himself and the filer may move it). The drag
  is not offered on such an input, so it is reached the same way as the two notes. Worth filing beside them.
