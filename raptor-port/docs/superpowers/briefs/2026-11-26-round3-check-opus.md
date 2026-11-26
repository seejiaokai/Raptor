# Round 3 checked — fresh Opus reader, 26 Nov 26

Read only. I read every ruling below as its full row, on this branch and on `origin/claude/msq-b1-screens-135`, and checked each statement about the app in the code on `origin/main`. Most serious first.

## Must change before he sees it

**1. Point 15 leaves out a ruling he made on 26 Nov, and still reads his question only one way (questions 2, 1).**
- Words: "who may (his own squadron's admins, the other squadron's, or both) is asked if that control is ever drawn", and "You asked whether the man's own squadron's admins should be able to move it".
- Evidence: D2730 on the multi-squadron branch (26 Nov, "All four as recommended") is Admin → Users Q12: "Hunter tries to link a sign-in that holds Plan of 149 to another person … 'This sign-in holds a right in 149. Only 149's own admins or a master admin can link it to another person.'" (page `scripts/handpass/n191/page/body-s2.html`; today's words are in `state/accounts.ts`, relinkRightsProblem). So for a sign-in that holds Plan of 149, "who may" is already answered: 149's own admins or a master admin. He asked about "an admin of the owner squadron". The combined findings say this was read one way without asking him, and round 3 does it again.
- Harm: a question he has already answered goes back to him as open. If he then answers "his own squadron's", that clashes with his own ruling of the same day.
- Corrected words: "Moving a person's sign-in to another person's row. No screen does it, by your 22 Nov ruling. You asked: 'shouldn't an admin of the owner squadron be able to do so too?' For a sign-in that holds Plan of 149 you settled this on 26 Nov: only 149's own admins or a master admin may link it to another person, and the sign-in arrives with no rights. Nothing to decide now."

**2. Point 17: the split is half done, and "on 22 Nov" is my reading, not his ruling (questions 1, 5, 2).**
- Words: "The Leave War's row stays as you ruled in September and on 22 Nov", and the recommendation "the Leave War's row is left as it is". The summary at the top also says "your rulings on a SANS man's Leave War row", plural.
- Evidence: D2327 (22 Nov) confirmed only "the SANS highlight chip, and who may be filed". The page put to him that day was "Two places that go by today", and neither place is the Leave War (`docs/mock/2026-11-22-sans-readings`). In D2313 the Leave War's row stays on today's tick only as "the agent's reading". Only D321 (27 Sep) is his. The combined findings said: dated counts read by the day per D2313, and the row's grouping kept. Round 3 drops round 2's "Leave War's Available rows" altogether. Those rows still read today's tick on every date (`leavewar/engine/availrows.ts` withoutSans), and so does the SANS calendar's "still needed" figure that is worked out from them. That goes against D2313's "on every screen", and the page does not say so.
- Harm: past days on the Leave War keep counting a man as available, or not, by today's SANS tick. He would sign that off believing his own 22 Nov ruling keeps it.
- Corrected words: "…The Leave War's row stays where you ruled in September: a man posted out as SANS moves his whole row into the SANS group, earlier months included. But its Available P and W counts, and the SANS calendar's 'still needed', go by today's tick on every date." Recommendation: "Read the Inputs calendar's groups and the Leave War's two Available counts by the day, by your 22 Nov rule; leave the Leave War's row where it is."

**3. Point 9 calls my reading his ruling (question 5).**
- Words: "On 21 Oct you ruled the crew list reads him free and left the day's figures and the Leave War as they were."
- Evidence: D1120. His words were only "they should not be faded as they are available to be planned". "Only the crew list's look and count change: the Leave War's clash with leave and the day's own figures … are left as they are" is listed under "The agent's readings, told to him". This is the exact lapse this branch exists to fix.
- Corrected words: "On 21 Oct you ruled that a man only on standby is never faded in the crew list. I told you then that the day's figures and the Leave War would stay as they were. This changes that for the figures."

**4. J: my argument sits under the heading "What you ruled on 25 Nov" (question 5).**
- Words: the heading "What you ruled on 25 Nov", followed by "In this app red already means something is wrong… A half-planned day is not wrong; it is unfinished."
- Evidence: D2613 rules only the red outline from the moment the start is typed. Round 2 labelled the rest "The worry:".
- Corrected words: keep only the first sentence under the heading. Add a heading "Why I ask again" before "In this app red…".

**5. A: "your words" given to a line he never said (question 5).**
- Words: "though your words say 'no more that day'"; choice a "as your words say"; the recommendation "Part 2: your words, 'no more that day'".
- Evidence: D2294. His words were "how about B but u ask when any sign off is selected", then "yes as recommended". "Later asks no more that day" is the rule as written down, and it came from my own point that he accepted. The same card already says this correctly: "Written down then".
- Corrected words: replace "your words" with "your 22 Nov rule" in all three places.

**6. Point 19: one false thing I told him in the chat is still not corrected (question 1).**
- Words he was told in the chat: "every day is checked for every man; a man not SANS that day is refused, the offer doesn't save." Round 3 corrects only the "not built" part.
- Evidence: `ui/inputedit.tsx` sansRefusal skips the days the offer already holds for him. Only newly added days are checked, so "a record one of whose days was hidden by a later change of his posting still saves as it stands". That is the very case point 19 is about. Listed in the combined findings ("the save checks only new days (held days kept)").
- Corrected words, added to point 19's bracket: "…and an offer is not checked again day by day when it is saved: only days newly added are refused, so an offer already holding a day he has stopped being SANS on still saves."

**7. E says "ten remain". Nine do (question 3).**
- Words: "so ten remain" (E's opening line) and "Ten points the drawings raise" (What to look at now).
- Evidence: 12 points, less E4, E5 and E7, is 9: E1, E2, E3, E6, E8, E9, E10, E11 and E12. E12 is now only a pointer to J.
- Corrected words: "nine remain" / "Nine points the drawings raise".

**8. I: "nothing marks these rows" is still wider than the truth (questions 1, 3, 4).**
- Words: "On a working day, nothing marks these rows." The next sentence then says "A man with a whole-day absence … is flagged on such a row". I2 says "never a warning line".
- Evidence: `engine/validate.ts`, SA_FLY_NO_TIME. On any day, a standby line that flies with no START or END gets "…flies but has no START. Type it so its crew rest and OIL can be worked out." The combined findings listed "a flying standby's advisory", and round 3 dropped it. I's own example list includes a BB standby shift.
- Corrected words: "On a working day nothing marks a missing time, except a standby line that flies: it gets an advisory asking for its START or END." In I2: "…It gets the outline only, never a new warning line (a standby line that flies keeps its advisory), so your 16 Nov choice holds."

**9. The try-out's board pictures still show the choice the page no longer recommends (question 4).**
- Words, in the try-out (`frame.html`): heading "3. A time emptied on a published day", picture `board-c-duty-phone.png`, which shows a red outline at once inside the cyan "waiting change" edge.
- Evidence: J2 is now recommended "the same on a draft and on a published day being amended": grey until a press is refused. The try-out's third switch now starts on grey, but the board picture under it was not redrawn. The page says "The end-time try-out is updated to match this page."
- Harm: he sees red on a published day, drawn as the plan.
- Fix: redraw it grey, or caption it "If you choose red at once on a published day (not recommended)".

## Smaller

**10. G's summary line says the board already shows the count (question 3).** "…as the board's now does". D2734: "Drawn on the end-time try-out; not built". Corrected: "…as you approved for the board this morning".

**11. H: the example and the definitions do not line up (questions 4, 6).**
- "CMD ENGAGEMENT @ CREW ROOM (ALL)" has "(ALL)" in its title but nobody on it (`engine/data.ts`; the picture shows "+ ADD"). Yet the line before says a row with ALL on it needs its end whatever he answers. Add: "(ALL is only in its title; nobody is put on it)".
- H defines someone on a row as "a person, ALL or ALL AVAIL", but I adds "or a callsign typed in its people box". Use I's wording in both.
- H's reason for 1, "one rule with no list to remember", sits beside the three exceptions the page also recommends: D, L and I1. Corrected: "the rule closest to your words; with D, L and I1 as recommended it has three named exceptions".

**12. "As drawn" no longer means one thing (question 4).**
- F says "Seven wording fixes, each drawn where it shows" and "Reply 'F as drawn'". But F7 is not drawn ("Drawn on the card before it is built"), and F6's picture shows round 2's words.
- C's three pictures show the first draft, "Type the times, then sign.", and the desktop caption does not say so.
- Corrected: "Reply 'F as written'" / "'C as written'". Say "six drawn, F7 drawn before it is built". Add to C's desktop caption: "It shows the first draft too."

**13. Point 8 is not where the page says it is (question 3).** "To the bell-words job, where they are shown to you with pictures." The bell-words job in the backlog covers lines saying an earlier line no longer stands, plus an input's "Deleted" line, and is marked "ready to build". Nothing in the backlog mentions the three leave-bid lines. File them there before he reads this line, or say "to be added to the bell-words job".

**14. I: "The outline is that mark" says more than it does (question 5, mild).** The "?" job (D361) covers any row missing its start or end. The outline would leave out a blank row with nobody on it, an all-day input and a cancelled item (I1, I3, L), and it never shows on View-only Sched (K). Corrected: "The outline would do most of that job: it marks every row that counts…, not a blank row with nobody on it, an all-day input or a cancelled item."

**15. E3 widens his rule a little (question 5).** "A take-off or a landing. Your rule counts it as no time." D2612 names only a "TBD" landing. Corrected: "Your rule counts a 'TBD' landing as no end; with I yes, a 'TBD' take-off counts as no start."

**16. Try-out details (question 4).**
- After one sign-off that goes through, a time emptied later turns red at once with no refused press. The cause: `tryout.js` sets `S.pressed = true` on a successful sign as well, which J2 does not say.
- The count button's hover text still says "Go to the first missing time", though each tap now goes to the next box.
- The page names the try-out three times but never links to it. G's cost says "the try-out shows it".

**17. Plain words (question 6).**
- E6: "That was in the drawing's readings" → "That was my own idea for the drawing, never your ruling."
- F: "one cold read" → "one read by someone who has not seen them" (as C already says).
- I1: "which this rule does not read" → "and the rule does not look there".
- C has no "When it happens" (his D2439), while every other question does. L's "Likely every few weeks" is a guess, so say so: "how often is yours to say".
- No ruling numbers or review codes appear in the text.

## No finding
- **The end-time questions:** H's choices and recommendation. I's Attach and course facts (`engine/inputs.ts` landsUnavail), its Standard template cost (`engine/dutytpl.ts`) and I1 to I3. L's facts (`engine/events.ts`, `engine/oil.ts`). J's choices. D. G's card. C's words. K.
- **A:** its facts (`ui/oilsign.ts`, `ui/pops.ts` OILSIGN_LATER), apart from item 5.
- **E:** E1, E2, E6's substance, E8 to E11.
- **F:** F1 to F7 words; F6 checked against `engine/events.ts` inpShow.
- **Small points:** 1, 2 to 6, 7 (D2217, and D2731 on the multi-squadron branch), 10 to 14, 16 (D1667), 18, and 19's recommendation (D2341).
- **"Already answered":** D2612, D2613, D2614, D2617, D2734.
- **The try-out:** its three defaults and labels, the tap that goes to each box in turn, and the amendment refusal naming its AL.

**Verdict: not ready yet.** First fix 1 to 9: point 15 against his 26 Nov Q12, the point 17 split, the three places where my reading is called his ruling (9, J, A), the uncorrected chat claim on point 19, the E count, I's "nothing marks" and the try-out's board picture. 10 to 17 are quick wording fixes for the same pass.
