# Words pass, round 4 — the fresh reader's adjustment (24 Nov 26)

Read: `design-practices.md` §1, §1a, §1b (lines 84–401), the draft, the word list by search. To check the draft's
facts I also read the places the words are raised (`state/notices.ts`, `ui/inputedit.tsx`, `ui/drag.ts`,
`state/view.ts`, `leavewar/sync.ts`, `engine/validate.ts`, `engine/lookahead.ts`, `ui/oilday.ts`) and the full row of
D1525. No file in the repo was changed. No box was measured (§1a test 1) and no cold read was run (§1a test 9): both
are still owed where the guide asks for them.

Word counts are of the wording itself; on a bell line they leave out " · Saber", which does not change.

## Final words

Every draft is kept. Nothing below differs from the draft's wording; what I found is in the doubts.

| Item | Today | Final | Changed from the draft? |
|---|---|---|---|
| Q1, a leave changed to another kind | **OL** Wed 15 Jul / `Renamed — was LL · Saber` | **OL** Wed 15 Jul / `LL changed to OL · Saber` | no |
| Q2, half alone changed (morning) | **LL** Wed 15 Jul / `Now 00:00–12:00 am · Saber` | **LL** Wed 15 Jul / `Now LL (AM) · Saber` | no |
| Q2, half alone changed (afternoon) | **LL** Wed 15 Jul / `Now 12:01–23:59 pm · Saber` | **LL** Wed 15 Jul / `Now LL (PM) · Saber` | no |
| Q2, the day moved as well | **LL** Thu 16 Jul / `Now Thu 16 Jul 00:00–12:00 am · Saber` | **LL** Thu 16 Jul / `Now Thu 16 Jul (AM) · Saber` | no |
| Q3, option A (recommended) | **Range brief** Thu 16 Jul / `Cancelled — weather, Now Thu 16 Jul · Saber` | **Range brief** Thu 16 Jul / `Cancelled — weather, now Thu 16 Jul, and 1 more change · Saber` | no |
| Q3, option B | the same | **Range brief** Thu 16 Jul / `Cancelled — weather, now Thu 16 Jul, renamed — was Training · Saber` | no |
| Q4a, a time the app cannot read (an input's window) | `That is not a time — try 0900 or 09:00` | `2560 is not a time. Try 0900 or 09:00.` | no |
| Q4a, the same (the schedule's time boxes) | `2560 is not a time. Try 0900 or 09:00.` | `2560 is not a time. Try 0900 or 09:00.` | no |
| Q4b, already in that seat (by a tap) | `Ranger — already in that seat` | `Ranger is already in that seat` | no |
| Q4b, the same (by a drag) | `Already in that seat` | `Ranger is already in that seat` | no |
| Q4c, the refusal out of its family | `Only a scheduler answers from this list` | `Only a scheduler can answer from this list` | no |
| S1, the look-ahead saved | `Everyone now opens on next 4 weeks, to sunday` | `Everyone now opens on the next 4 weeks, to Sunday` | no |
| S1, without "to Sunday" | `Everyone now opens on next 4 weeks` | `Everyone now opens on the next 4 weeks` | no |
| S2, no Leave War period | `there is no leave war period for 2026, so no OIL can be earned for this day — create the period on the Leave War` | `There is no Leave War period for 2026, so no OIL can be earned for this day. Create the period on the Leave War.` | no |

**Q2, my recommendation:** take both forms as drafted; they are two cases, not a choice. Reason for him: each says
the half day the way the rest of the app does, in no more words than the clock times it replaces, and where the day
moved the day still comes first, as on every other bell line.

**Q3, my recommendation:** option A. Reason for him: the bell stays one short line on a phone and still tells the
person that more changed, so nothing is left out in silence.

## Per-item detail

### Q1 — `LL changed to OL · Saber`
- Kept. It matches its live relative on the Leave War's bell, "LL bid changed to OL · Saber" (checked in
  `state/notices.ts partWords`, the `retyped` line), and it is true where "Renamed" was not.
- Considered and not taken: "Was LL" (shorter, but it has no verb for what happened and no relative).
- Say it aloud: pass. One done thing, no mark to drop, every word one a person would say.
- Change list against today: swapped "Renamed — was LL" for "LL changed to OL". Cut: "Renamed", which fits none of
  §1a's four kinds; it goes because it is untrue here, a correction and not a shortening. Added: "changed to OL",
  true because OL is the new kind, already printed in bold on the line above. Marks: the dash goes with the words it
  joined; nothing replaces it.
- Words: 3 today, 4 new. **Longer.**

### Q2 — `Now LL (AM) · Saber` and `Now Thu 16 Jul (AM) · Saber`
- Kept, both.
- Considered for the first: "Now AM", the twin of "Now all day". Not taken: read alone it can be heard as the time
  of day, and "LL (AM)" is how the app already writes a half day.
- Considered for the second: `Now LL (AM) on Thu 16 Jul · Saber`, which keeps AM after the code as his preference
  says. Not taken as the final: it is 7 words against today's 6 and the draft's 5, it adds "on", and it turns round
  the bell's usual order of day first ("Now Thu 16 Jul", "Now Thu 16 Jul 09:00–11:00"). It is the form to offer him
  if he wants the half after the code in every case; it would be marked longer.
- Say it aloud: pass for both. With the brackets left out they still read ("Now LL AM", "Now Thu 16 Jul AM").
  "Now …" with no verb is the shape of this family as he ruled it ("Now all day").
- Change list, first form: swapped "00:00–12:00 am" for "LL (AM)". Cut: the clock times, a thing said twice in the
  same note (they say only "the morning half", which AM says). They are numbers, so the cut is his to take, as the
  draft puts it to him. Added: "LL". The draft says nothing is added, but "LL" is new on this line; it is true
  because it is the input's kind, printed in bold above. Marks: "am" becomes "(AM)", capitals and brackets.
- Change list, second form: swapped "00:00–12:00 am" for "(AM)". Cut: the clock times, as above. Added: nothing.
- Words: first form 3 today, 3 new. Second form 6 today, 5 new.

### Q3 — option A `Cancelled — weather, now Thu 16 Jul, and 1 more change · Saber`
- Kept. "and 2 more changes" for two.
- Considered: dropping "and" (reads as a clipped list), "and 1 more" (more of what?), "one" for "1" (the app
  prints counts as figures: "3 items on Monday only").
- Say it aloud: pass, with the ruled dash read as a pause. "and" joins a second fact about the same save.
- Change list: swapped "Now" for "now" after the comma. Added: ", and 1 more change", true because it is counted
  from the same save's own list of changes, the ones after the first two. Cut: nothing.
- Words: 6 today, 10 new. **Longer.**

### Q3 — option B `Cancelled — weather, now Thu 16 Jul, renamed — was Training · Saber`
- Kept as drafted: each part is his ruled wording, with only the first letter made small after a comma.
- Say it aloud: it reads, but it carries two dashes in one line, both ruled; the guide allows a note one.
- Change list: swapped "Now" for "now". Added: "renamed — was Training", true because it is the third change of the
  same save, in the words the bell already uses for a rename, its first letter made small.
- Words: 6 today, 9 new. **Longer.** It grows with every further change.

### Q4a — `2560 is not a time. Try 0900 or 09:00.`
- Kept. It is already live in three places (the schedule's time boxes and the two template windows); the input's
  window has the other wording in two places.
- Say it aloud: pass. Two sentences, each with its full stop; the instruction is its own sentence.
- Change list for the window's wording: swapped "That" for the value typed (see the doubt on which box); the dash
  for a full stop; "try" for "Try". Added: the closing full stop, the guide's rule for a note of two sentences.
- Words: 9 today, 9 new, in both places.

### Q4b — `Ranger is already in that seat`
- Kept. The name cannot be cut from the tap's line (a name is protected), so the pair meets on the named form.
- Say it aloud: pass. Subject and verb, no mark.
- Change list, the tap: the dash is swapped for "is", true because the app refuses exactly when that seat already
  holds him. Change list, the drag: added "Ranger is", true because he is the one dragged, dropped back on the seat
  he was lifted from; "Already" becomes "already".
- Words: the tap 5 today, 6 new, **longer**. The drag 4 today, 6 new, **longer**.

### Q4c — `Only a scheduler can answer from this list`
- Kept. It takes its family's shape and changes nothing else.
- Say it aloud: pass.
- Change list: swapped "answers" for "can answer". Added: "can", the family's own word; the meaning (who may) is
  the same.
- Words: 7 today, 8 new. **Longer.**

### S1 — `Everyone now opens on the next 4 weeks, to Sunday`
- Kept. "Everyone now opens on …" reads a little clipped (it is the Inputs page that opens), but that is today's
  wording and this item is a slip fix, not a rewording.
- Say it aloud: pass.
- Change list: added "the", true by grammar alone, no new claim. Swapped "sunday" for "Sunday".
- Words: 9 today, 10 new, **longer**. Without "to Sunday": 7 today, 8 new, **longer**.

### S2 — `There is no Leave War period for 2026, so no OIL can be earned for this day. Create the period on the Leave War.`
- Kept. The link word "so" stays; the instruction becomes its own sentence, as the guide says.
- Its relative, already live in the day's warning list, reads `No Leave War period for 2026, so no OIL can be earned
  for this day. Create the period on the Leave War.` (`engine/validate.ts`). The draft now matches it in everything
  but its first two words.
- Say it aloud: pass.
- Change list: swapped "there" for "There", "leave war" for "Leave War" (the app's name, as the same note's end
  writes it), the dash for a full stop, "create" for "Create". Added: the closing full stop. Cut: nothing.
- Words: 24 today, 24 new.

## Doubts for the builder

1. **Q1, what else raises "Renamed".** The line is raised whenever the bold name changes, and the bold name is the
   title, or the kind where there is none, plus " · To" on an attach. The draft covers only one case, a kind changed
   on an input with no title before and after. Three others reach the same line and are not drafted: a title given
   to an input that had none (today "Renamed — was LL"), a title taken away (bold **LL**, "Renamed — was Range
   brief"), and an attach whose "To" changed ("Renamed — was Attach · 145 Sqn"). The line today carries only the old
   name, so the builder must say how the app tells a kind change from these, and what each of them reads.
2. **Q1, the kinds are not only leave.** An untitled Training changed to a Meeting would read "Training changed to
   Meeting · Saber". It reads well; the question to him should not say "a leave" if the rule is wider.
3. **Q2, an input that has a title or is not a leave.** The half day is on every input, not only leave. The draft
   gives only LL. What does a half day read for **Range brief** ("Now Range brief (AM)"?) or an untitled Training
   ("Now Training (AM)")? Not drafted; I have not invented one. The same for a run of days with a half, if the app
   allows one.
4. **Q2, "his D1525, which names the bell".** D1525's rule is for where the Leave War writes a half day, and the
   bell it names is the Leave War's own line ("LL (AM) approved"). The Inputs page's bell line is not named there.
   Using the same form is a fair extension, but it should be put to him as one, not as already ruled.
5. **Q2, the change list.** The draft says "Added: nothing". In the first form "LL" is added to the line.
6. **Q3, the small letter.** The draft lowers only "Now". Every part after the first starts with a capital today
   ("Renamed", "Remark changed", "Taken off the programme", "Filed under Unavailable", "You were added"), so a save
   of two changes would still read `Cancelled — weather, Renamed — was Training · Saber`. Option B's own example
   already assumes "renamed". The rule needs stating for every part, with names ("Ranger added") keeping their
   capital, and a decision on "You".
7. **Q3, "a tap already opens the input, where everything shows".** The opened input shows how it stands now. Whether
   it shows what changed (the old name, the old day) I did not check, and option A's case to him leans on it.
8. **Q3, the count.** A bid the input replaced is said after the rest ("· replaces your LL bid") and is outside the
   first-two rule today. "1 more change" must not count it.
9. **Q4a, which box.** In the input's window the check covers start and end together, so the builder must name the
   one that failed (the first, where both do). In the second place the loop can refuse the other box's value, not
   the one just typed; the value named is still the unreadable one.
10. **Q4b, its relatives.** The tap's line sits among refusals of the shape "Ranger — reason" raised from the same
    places ("Ranger — already on Range brief 09:00–11:00 · not added twice", and the seat refusals). They keep their
    dash until the dash round. The guide's test 9 says relatives change together or the difference is put to him, so
    the question should tell him this one goes ahead of them. The drag's line also has relatives of its own,
    "Already in order" and "Already on Monday".
11. **Q4b, a placeholder.** Either path can be reached with a placeholder puck, so the line can read "ALL AVAIL is
    already in that seat". It reads; the builder should confirm no placeholder's name breaks on "is".
12. **Q4c, the count and the meaning.** I count 13 different "Only a scheduler can …" wordings in 15 places, not
    twelve; worth a recount. And this refusal is also given to a scheduler of another squadron (the check is "an
    admin of the list's squadron"), who is told "Only a scheduler can …" though he is one. That is today's wording
    too, not the draft's doing.
13. **S1, one week.** The count may be 1, and the line then reads "Everyone now opens on the next 1 week, to
    Sunday". A person says "the next week". The button itself reads "Next 1 week" today.
14. **S2, when it is not the only line.** The note is joined to any line before it with " · ", which is where its
    small first letter came from. With the new wording the join would read "… · There is no Leave War period for
    2026, so no OIL can be earned for this day. Create the period on the Leave War." The draft covers only the
    lone case; the joined case needs its own whole line.
15. **S2, the same slip elsewhere.** "leave war period" is in small letters in three more places a person reads:
    `Only a scheduler can create a leave war period` (one of Q4c's family), `The 2026 leave war period is created.
    Open its dates for bidding here.`, and the hover text of the "Create the 2026 period" button. The warning list,
    the Logic page and the change history already write "Leave War period".

## Suggestions for him (ruled wordings)

None of these is folded in. Each is his to take or leave.

1. **"Cancelled — weather".** The guide's own join for a done thing followed by a phrase is a colon ("Warning
   hidden: no flag, not counted"). With it, option A would read:
   **Range brief** Thu 16 Jul / `Cancelled: weather, now Thu 16 Jul, and 1 more change · Saber`
2. **"Renamed — was Training".** Without the dash, same facts:
   **Range brief** Wed 15 Jul / `Renamed from Training · Saber`
   If he takes option B as it stands, that line carries two dashes; with both suggestions it would read
   `Cancelled: weather, now Thu 16 Jul, renamed from Training · Saber`.
3. **S2 and the warning list.** The note and the day's warning list now say the same thing and differ only in
   "There is no …" against "No …". He may want one wording for both; which one is his choice, since the note's
   sentence is D19's.
4. **The bell's two-line layout, and the "Only a scheduler can …" family:** no suggestion.
