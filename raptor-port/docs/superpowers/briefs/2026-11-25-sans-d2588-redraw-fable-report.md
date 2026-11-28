# Fable's read of the D2588 drawing page after D2589 / D2590 (chat 186, 25 Nov 26)

Fresh Fable, words only. Read: the full rows D2581, D2582, D2584, D2588, D2589, D2590; the drawing brief; Fable's earlier
word check; `draw.mjs` (the `W` object and every scene's staging, lines 310–545); the page template whole.
Changed: `D:/raptor-work/c186-draw/index.tpl.html`. Written: `words.json` (parses), this report. Nothing in the repo
touched; the app not run; the page not rebuilt, so no new picture was seen by me.

## 1. The bell and crew-list lines (`words.json`)

| Key | Old → new | Why |
|---|---|---|
| a | read, kept | His ruled delete line (D2590). |
| b | title "Ranger cut back his…" → "Ranger changed his SANS availability for Sat 18 Jul."; quieter line kept | D2589, D2590 — now his own example, word for word. |
| c | title "cut back" → "changed"; quieter line kept | D2590: a switch of event is a change that is not a delete. |
| d | read, kept | A delete; both events named alike, in time order. |
| q1b | title "cut back" → "changed"; quieter line kept | D2590. True to the case (08:00–17:00 shortened to 10:00–17:00). |
| q2 | read, kept | Already "changed"; hours match the staged case (10:00–16:00 moved to 14:00–20:00). |
| q3 | title read, kept; quieter line "He's planned on VL BFM (T/O 13:00)." → "Ranger is planned on VL BFM (T/O 13:00)." | After "Saber deleted Ranger's…", "He" can be read as Saber. Written "Ranger is", not "Ranger's", so it is not taken for the possessive just before it. A new word of mine, never put to him — see §4. |
| q4sat | read, kept | Same as (a). |
| q4sun | read, kept | "OFT (10:00)" is how (d) already names a sim; the case's Sunday box is an OFT at 10:00. |
| q5 | title "cut back" → "changed"; quieter line kept | D2590. |
| q5both | title "cut back" → "changed"; quieter line kept | D2590. |
| flyOnly, oftOnly, flyOft | read, kept | His chosen pattern (D2584 Q2: "SANS — offered Fly only, not OFT"; two offered "SANS — offered OFT and AMT only, not Fly"), with AMT as the seat pressed. No full stop, as its siblings. |

"Cut back" is left in no line. The comment above `W` in `draw.mjs` ("Fable's adjusted words, exact") is no longer true
of (b) and (c) — the host's to fix.

## 2. The page's words (`index.tpl.html`) — changed

Top of the page
- Heading: "When Ranger takes back a day he's planned on" → "When Ranger changes or deletes a day he's planned on". A change is not a taking back.
- Lead: "deletes or cuts back" → "deletes or changes". D2589.
- **Added**, under the lead (a `<p class="note">`, an existing class): "New since you last looked: the line now says “changed” wherever it said “cut back”, as you asked (pictures 3, 4, 7, 16 and 17). Question 3 is now only a line or no line. In picture 12 the quieter line names Ranger, so “He” can't be read as Saber." The brief's top line; the last sentence falls away if the q3 change is not taken.
- List, 2: "He cuts back, but the flight is still covered" → "He shortens his hours, but the flight is still covered"; "The schedulers hear only when the plan is hit." → "…only when something he's planned on is no longer covered." D2589; "the plan is hit" was the page's own shorthand.
- List, 3: "He moves his hours instead of cutting them" → "…instead of shortening them"; "a line, saying he “changed” his availability, since nothing was cut" → "a line, since the flight is no longer covered." The word is his now; only line or no line is asked.
- List, last: "Already decided: built as drawn. Have a look. One thing the drawing found…" → "Already decided: one column. This is the drawing, for your look before it's built. What the drawing found is in its section." "Built as drawn" read as if it were built; the section lists three finds, not one.

Question 1
- "deletes that day, or shortens it" → "or changes it". Covers (b) and (c).
- "After a cut-back that misses the flight" → "After a change that leaves the flight uncovered". D2589.
- Picture 1's caption: "after each cut-back on this page" → "after each change on this page".
- Picture 3: tag "(b) He cuts back to fewer hours" → "(b) He shortens his hours"; alt and caption title → "Ranger changed his…"; "He changed Fly 08:00–17:00 to 08:00–10:00" → "He shortened…" (so "changed" is not said twice in one caption).
- Picture 4: tag "(c) He cuts back to another event" → "(c) He switches to another event"; caption "He changed Fly to OFT only: “…cut back…”" → "He switched from Fly to OFT only: “…changed…”".
- Picture 5: "deleted his Fly and OFT filing: the second sentence names both" → "deleted his Fly and OFT availability. The quieter line names both". One name for the quieter line throughout.
- Bullet 3: "(b) and (c) share one heading… That makes them one and three words longer than the first draft." → "Every change that isn't a delete has the same heading, “Ranger changed…”. What he now offers goes on the quieter line." The count is no longer true ("changed" is one word shorter), and the first draft is something he never saw. By the earlier check's own counts (b) is now the draft's length and (c) two words longer — for the host's record, not the page.
- Recommendation: "the quieter line says what that means for the plan" → "says what he now offers and what he's planned on, so Saber can see…". Says what the line holds, and loses a semicolon.

Question 2
- Heading as the list. Picture 7's caption title → "Ranger changed his…".
- Recommendation: "If nothing in the plan is hit, it's noise. Your ruling says “cuts back”, which on its own would include this case; the reason given for the line was the plan being hit, so this is your call." → "If everything Ranger is planned on is still covered, there's nothing to fix. You asked for a line when he changes a day he's planned on, and read on its own that includes this case, so this is your call." "Ruling" is a record word (D2164); "cuts back" goes. **The recommendation (no line) stands.**
- Answer: "a line for any cut-back on a planned day" → "a line for any change on a planned day".

Question 3 (rewritten to line or no line)
- Heading as the list. "Nothing was cut, so “cut back” isn't true." removed.
- The note about the example first written (08:00–12:00) removed whole: history of the drawing, nothing he acts on. The fact stays in `draw.mjs`'s comment.
- Recommendation: "a line, saying “changed”… “Changed” is true whatever he did to his hours." → "Recommended: a line. The flight is no longer covered, just as when he shortens his hours, so Saber needs to know. The line says “changed”, as in picture 3."
- Answer: three choices → "a line (recommended) / no line".

Question 4
- "Your ruling covers “a SANS man deletes”" → "You asked for a line when a SANS man deletes it himself". D2164.
- Picture 12's caption quieter line → "Ranger is planned on VL BFM (T/O 13:00)." (follows `words.json` q3).
- Recommendation: "need to know the plan is hit" → "need to know Ranger is no longer available for a flight he's on". **The recommendation stands.**

Question 5
- "Ranger files once for Sat 18 and Sun 19… deletes the filing with one press" → "Ranger offers Sat 18 and Sun 19 in one go… then deletes it with one press". Plainer.
- Picture 13: "Ranger's two-day filing" → "Ranger's two days of availability".
- Note: "so that both things read the same way. The build will check the sim's name against the warning list." → "so that a sim reads the same way as a flight, “VL BFM (T/O 13:00)”. Which name the line gives a sim is settled when it's built." "Both things" was unclear; "the build will check" wrote an action as a person (D2185).
- Recommendation: "His own mismatch line is one line a day" → "Ranger's own reminder is one line a day. A tap on a line opens its day…". "Mismatch line" is our word, not his. **Stands.**

Question 6
- "Ranger cuts back to OFT only" → "changes it to OFT only"; picture 15 "His cut-back" → "His change".
- Picture 16's tag and the answer: "only the one hit" → "only the one no longer covered". Matches the heading and the recommendation's title.
- Note: "because there the delete hit both" → "because there he deleted everything, so neither is covered." **Stands.**

Question 7
- "a ground row or a desk isn't hit by it" → "a ground brief or a duty desk doesn't depend on it". The case's own words. **Stands.**

## 3. Read, kept
The eyebrow; the list's lines 1, 4, 5, 6, 7; the cast and the picture key; question 1's "When this happens", bullets 1,
2 and 4, and its answer line; every "Real app, nothing changed" / "Line drawn in" line; pictures 2, 6, 8–11, 14, 17, 18,
19 and all the phone captions; question 2's and 6's "When this happens"; question 4's note on Ranger's own bell;
question 7's "When this happens"; the whole column section's body and its three finds; the three "filing(s)" left
(question 5's heading, twice, and picture 18's note) — plain enough, and the heading is the list's link text.
Not touched: every token's number and file, all tags, classes, ids, styles, the script, `<title>`.

## 4. For the host — untrue, unchecked, or his to answer
1. **q3's quieter line ("Ranger is planned on…") is my new wording**, not his. It needs picture 12 redrawn (both sizes), and is shown to him by the top line. If the host would rather not open it, revert q3 in `words.json`, picture 12's caption and the top line's last sentence.
2. **The "found while drawing" note under question 1** (the heading breaking inside "Sat 18 / Jul.", picture 5's line breaking inside "(T/O 13:00)") was true of the old pictures. "Changed" is five letters shorter than "cut back", so (b), (c), q1b, q5 may wrap differently. Check the note against the redrawn pictures before publishing; I kept it unchanged.
3. **No highlight exists on this page** for D2159: it has no "new this round" style, and I was not to add one. What is new is carried only by the top line naming the pictures. The pink "New" tags inside the pictures mean "drawn in, not built", an earlier meaning — I left them.
4. **Hunter** is "another admin" in the cast and picture 11, while the recommendation says "the other schedulers". I could not check whether Hunter's seeded account is a scheduler; if he is, "another scheduler" would read truer in both places.
5. **A question the word "changed" opens, for him if the host agrees:** under question 2's other answer ("a line for any change on a planned day") a line would also go out when he *adds* hours or an event. The recommendation (no line while everything is covered) already covers it, so I did not add it to the page.
6. **Picture numbers repeat** in the folds (picture 18 used three times, "·" for the copied line) — as built; not mine to renumber.
7. No recommendation was made untrue by the word change. Question 3's lost one of its three answers, as the brief asked.
