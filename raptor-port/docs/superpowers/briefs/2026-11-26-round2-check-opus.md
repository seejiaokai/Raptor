# Check of the round-2 questions, the try-out and today's chat answers (fresh Opus reader, 26 Nov 26)

Read only. I checked every ruling I cite in its full row, and every claim about the app in the code (this branch, and
main where the file differs). The most serious findings come first.

## 1. H: three different answers, and a change to his ruling that is never named (d, b, e) — serious
- **Wrong words.** The page recommends "Yes, every row." The chat recommends "yes when a person or name is on the row".
  The try-out starts on "Never block" for rows with nobody on them.
- **Evidence.** D2612 records "every item", and its rule lists "a ground or programme row, an ALL AVAIL row". The short
  line in scheduler.md says "a ground row". The chat's rule ("any row with a person or name on it needs both times") and
  the try-out's starting setting both narrow D2612, and neither says so. The page goes the other way: it says the
  programme rows were "never asked". If that is true, the recorded D2612 states the agent's own list as his rule. That is
  the readings lapse this branch exists to fix.
- **Knock-on he was not told.** In the seed data, four of H's seven rows already carry a man: OPS SHARING has Stiff,
  OPS BRIEFER has Dice, FLY W EXT SQN has IPman and NAV-SYS TRIAL PREP has Vegas (`engine/data.ts`). So under the chat's
  answer only three rows differ: the dinner, the engagement and the beer call. A dinner carrying ALL or ALL AVAIL still
  blocks, because an ALL AVAIL puck counts as a name (`tryout.js` `hasPeople`). D360's own example of this row was
  "DINNER WITH CMD" with ALL AVAIL on it.
- **Harm.** Whatever he answers, the record and the build will disagree with one of the three.
- **Corrected.** One question, with one recommendation on the page, in the chat and as the try-out's starting setting.
  The question: "A row with a start and no end and nobody on it (a dinner, a beer call): must it have an end before the
  day is signed and published? Rows with a man, ALL or ALL AVAIL on them need an end whatever you answer. 1 Yes, every
  row, as ruled on 25 Nov. 2 Only rows with a person or name on them. This changes your 25 Nov ruling. 3 Only on a
  weekend or holiday." Fix D2612's record to match his answer.

## 2. I: "What the app does today" is wrong, and so is where an Attach lands (c, d) — serious
- **Wrong words.** "Nothing… The only thing flagged on such a row is a man who is on leave or grounded for the whole
  day." Also: "Crew rest, conflicts, OIL and Insights hours all read a row with no start as taking no time."
- **What the code does:**
  - On a weekend or holiday, a crewed line with no take-off, or a desk with a man and no times, raises a hard warning:
    "…has no usable times, so nobody on it earns OIL for this day". The publish note names it too (`engine/oil.ts`
    `dayOilBlind`; `engine/validate.ts` OIL_NO_TIMES; `leavewar/sync.ts`).
  - Any whole-day absence a man cannot work through is flagged on a timeless row: a course, an overseas duty or an
    all-day meeting, not only leave (`validate.ts`, the D605 block). Small point 14 says this itself, so the page
    contradicts itself.
  - A standby line that flies with no START gets an advisory (SA_FLY_NO_TIME).
  - A flight with a landing typed and no take-off still ends the man's day for the next day's crew rest
    (`validate.ts` [REST-BLANK-LINE]).
- **Choice 3's cost is overstated.** "No crew-rest check, no conflict check, no OIL" is not the whole story. On the days
  that earn OIL the app already warns, though it does not refuse.
- **The Attach is wrong.** "An all-day input, such as an Attach, lands on the Ground Programme." That has been untrue
  since D1374, live since 27 Oct ([INP-ATTACH] done): an Attach lands under Unavailable by itself (`engine/inputs.ts`
  `landsUnavail`). The try-out itself puts it there. I1's picture, an ATTACH row on Monday's Ground Programme, is old
  demo data.
- **Corrected.** "On a working day nothing marks it. On a weekend or holiday the warning list and the publish note say
  nobody on it earns OIL. A man with an all-day absence is flagged. Nothing is refused." For I1, use an all-day
  Training or Meeting, which does land on the Ground Programme.

## 3. A: the recommendation narrows his 22 Nov ruling, and the page says his words do not cover the case (b, e)
- **Wrong words.** "Your words so far are about Later… They do not cover a scheduler who presses Save with a row still
  unpicked."
- **Evidence.** In D2294 his words were "u ask when any sign off is selected". The recorded rule: an unanswered input "asks it when a
  scheduler presses any of its four sign-off boxes", and only Later stops it. D2299 adds: "the next press on any of the
  four boxes asks again". After Save, an unpicked row is still unanswered. The short line in oil.md says "at the first
  press", so the record is unclear itself. The build treats Save like Later; that is the agent's reading (`ui/oilsign.ts`).
- **Harm.** He keeps a builder's choice, about OIL, thinking his rule is silent on it.
- **Corrected.** Quote his words. Say that "keep as built" narrows D2294. The reason can stay: an answer at the second
  box would clear the first name.

## 4. J, E11, E12 and the try-out's first switch do not fit together (d, e)
- **J1 contradicts E12.** J1 reads "Red, as you ruled, softened by point E12. A box is never red while… still in its
  row." But E12 recommends no softening: "Leave as you ruled." If he answers "J 1" and "E, all as recommended", the two
  answers clash.
- **J2 contradicts E12.** The chat recommends both J2 and "E1–E12 all as recommended". E12's recommended text then
  records "red at once", which J2 replaces. The page says E12 "is no longer needed" under J2. The chat should say E12
  drops.
- **E11 does not fit J2.** Its Legend line draws only "a small red box". Under J2 the box is grey most of the time, so the
  Legend needs the grey one too.
- **The try-out does not say it changes his ruling.** It opens on "Grey, red once signing starts". That is the
  recommendation that changes D2613 (his own words were "flag in red"), and the page never says which setting is his
  ruling.
- **The try-out differs a little from J2.** Its red also stays after a successful sign-off (its brief: "refused or
  not"), while J2 says red only once a press is refused.
- **Corrected.** J1: "Red, as you ruled (E12 offers to hold it until he leaves the row)." Add to J2: "E12 drops, and
  E11's Legend line shows the grey outline too." Label "Red always" in the try-out as his 25 Nov ruling.

## 5. The try-out's third switch was put in chat but is not on the page, and the try-out does more than its label says (f, d)
- **Wrong words.** "A time emptied on a published day: red at once. A published day can't send out a change that
  leaves a time blank."
- **Evidence.** The page has no such question: no "when it happens", no picture, no choices. The reason is equally true
  of a draft day, so it argues against J2 as much as for this switch. And the try-out makes every missing time red on a
  published day, not only an emptied one (`tryout.js` `render`: `S.published && S.set.c === 'red'`). So a new line being
  typed into a published day's working copy would show red at once, which is the irritation J2 is meant to avoid.
- **Corrected.** Put it on the page as its own question: "On a published day, a time emptied, or a new item not yet
  finished: red at once, or grey until a press is refused, as J?" Give a reason that tells it apart from J.

## 6. E7 is a seventh untrue sentence, not a question (c, f)
- **Wrong words.** "Whether that OIL also waits for the day to be published again was not checked. Check it when F2 is
  built."
- **Evidence.** The code answers it: a duty input's answer "moves no money until the day is published again"
  (`leavewar/sync.ts`, the [OIL-AUTO-REMOVE] note, 21 Sep). So "Earned off a duty input that was accepted — change that
  input, not the schedule." (`leavewar/ui/BidPicker.tsx`) is untrue in the same way F2 is. D2140 says no fact is put to
  him unchecked.
- **Corrected.** Make it F7 and draw it now: "…change that input, then publish the day again."

## 7. C: the agent's reading is called his ruling (e, d)
- **Wrong words.** "What stays as you ruled… A row with no times at all is not touched."
- **Evidence.** In D2612 that is one of "the agent's readings, told to him". Question I is now asking about it, and
  recommends flagging named rows that have no times.
- **Corrected.** "A row with no times at all: see question I."

## 8. G: half of it is already answered (a, d)
- **Evidence.** D2734 (26 Nov) already rules the Scheduler Board's line: "4 items missing a time · 4 to sign", with the
  box names back once the last time is typed. Neither the page nor the chat says so. A "G no" would undo D2734.
- **The try-out still asks the board question.** Its "Your call: keep the role names…" is what D2734 answered.
- **The try-out differs from the page.** The page says "a second tap to the next" box. The try-out always goes back to
  the first box (`tryout.js`: `boxes[0]`).
- **Corrected.** "On the Scheduler Board your 26 Nov answer already shows the count. Should Edit Schedule's sign-off line
  show it too, with a tap that goes to each empty box in turn?"

## 9. A question is missing: cancelled and information-only items (f)
- D2612 says "every item". Nothing asks whether a cancelled (CX) flight, desk or row with a start and no end, or an
  information-only (ⓘ) row, blocks the day. A flight cancelled before it flew would hold up Publish until someone typed a
  landing for a flight that never flew.
- The try-out counts them: it has no check for a cancelled row. The OIL check (`engine/oil.ts`) leaves them out.
- **Add:** "A cancelled or information-only item with no end: does it block? Recommended: no, as OIL and ALL AVAIL
  already leave such items out."

## 10. H: a fact the agent said it could not check is in the code (c)
- **Wrong words.** "One case could not be checked here: an input a member files with a start and no end."
- **Evidence.** Every way of saving an input refuses that with "Give the input a start and end time, or tick All day"
  (`ui/inputedit.tsx` `normalizeInputDraft`).
- **Corrected.** Drop the paragraph. That case cannot happen.

## 11. Chat answer on small point 19: wrong about what is built (c)
- **Wrong words.** "your rulings settled those words; the wording isn't built yet".
- **Evidence.** It is built, on this branch and on main: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because
  Ranger is SANS from Fri 17 Jul." (`ui/inputedit.tsx` `sansCut`; D2388, D2394).
- The rest of that answer checks out against `ui/sansadd.ts`: who may add, the trim, and an admin being refused.

## 12. Chat answer on small point 15: wrong about who gives Plan (c, b)
- **Wrong words.** "only a master admin gives Plan of another squadron".
- **Evidence.** D2626 (25 Nov, on the multi-squadron branch): Plan of 149 is given and ended by 149's own admins or a
  master admin, and every 149 admin is told on his bell. It is built today as a master admin's alone. The point's own
  premise ("for a master admin alone") dates from before D2626.
- **Missing from the recommendation.** When a sign-in move ends Plan of 149, the bell line D2626 gives 149's admins, and
  the man's own line (D2251).
- "As today" for a master admin's own sign-in is loose: no screen moves a sign-in today (D2266). D2205 is the right
  basis.

## 13. Small points 1 and 12, and chat answer 2: a plan stated as a fact (c, e)
- **Points 1 and 12.** "…since a day with a missing end time can no longer be published" (point 12: "…since a
  published day must have the desk's end typed"). Nothing is built yet. The chat corrected point 1 but not point 12.
- **Chat answer 2.** "Under the new rule a day can't be published while a row with a person on it is missing a time."
  "With a person on it" is the chat's own H recommendation, not his ruling: D2612 says any item with a start and no
  end, and covers no-start rows only if he says yes to I.
- **Corrected.** "Once the end-time rule is built…", and leave the rule's reach to H and I.

## 14. D: tied to H without saying so (d)
- Under the chat's H ("a person or name on the row"), the AMT block's BRIEF and DEBRIEF rows would normally not count
  anyway. They usually carry nobody: the app takes the block's crew from its BOX row (`engine/events.ts`). Say which
  answer makes D needed.
- The reason "two times nobody types today" rests on the demo week, which D2616 sets aside. In real use the app's
  "+ AMT" makes all three rows blank (`ui/board.ts`).
- The page's facts about the Logic page, the 30 minutes and the brief running to the box start all check out.

## 15. B: already answered — drop it (a)
- D2617: "b as recommended". It is still in "What to look at now" and in the reply line. Move it to "Already answered".

## 16. E5: mostly answered (a)
- His own words, "the schedule cant be published unless a time is in" (D2612), already cover Publish AL1, which is a
  publish. Only the words "AL1 was not published." are new. Put E5 as a wording point, not an open rule.

## 17. The words: "exact words to be built", but a read is still owed (d)
- `words-reviewed.md` marks G4, F2, F5 and F6 "cold read owed" before they are built. The page says "Every picture now
  shows the exact words to be built". Say they may still change, or put those reads on the reads-owed list.

## 18. The try-out builds in answers he has not given (e)
- Beyond its three switches, it fixes I as yes (the no-START sim and the timeless SXO desk count), G as yes, D as
  recommended, J2 and the chat's H. A line on the try-out should say which of its behaviours are his rulings and which
  are still open.

## No finding
K; E1–E4, E6, E8–E10; F1, F3–F6; I2 and I3 as worded (D2072 and D2612 checked); small points 2–11, 13, 14, and 16–19.

Outside the brief: D2729 and D2730 are used on this branch and on the multi-squadron branch with different meanings.
Whichever merges later must renumber.

## Verdict
Can go as they are: K, D (with the note at 14), E1–E4, E6, E8–E10, F1 and F3–F6, and the small points other than 1, 12
and 15.

Must change before he answers:
- H: one recommendation on the page, in the chat and in the try-out, named as a change to D2612 if it narrows it, and
  D2612's record fixed either way.
- I: the "today" facts and the Attach example.
- A: framed against D2294.
- J, E11 and E12: made to agree.
- C's "as you ruled" line.
- G: reframed after D2734.
- E7: becomes a seventh drawn sentence.
- Small points 1 and 12, and point 15's premise.
- The chat answers on points 1, 15 and 19: corrected and sent to him again.
- The try-out's third switch: put on the page as a question.
- New: a question on cancelled and information-only items.

Drop: B (answered, D2617), E5 as a rule question, H's "could not be checked" paragraph, and the try-out's "Your call"
on the board line (answered, D2734).
