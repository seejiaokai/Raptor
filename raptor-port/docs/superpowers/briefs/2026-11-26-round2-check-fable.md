# Check of the round-2 questions, the end-time try-out, the reviewed words and today's chat answers

Fresh read, 26 Nov 26. Rulings read as full rows in `C:/Users/User/projects/Raptor-readings` and, for the newer ones,
on `origin/main`, `origin/claude/msq-b1-screens-135`, `origin/claude/sans-warnlines-185` and
`origin/claude/sans-leftovers-179`. Facts checked in `raptor-port/src` (this branch and `origin/main`). Nothing was
changed. Not run: the app itself — every fact below is from the code and the rulings, none from a walk.

Letters: (a) already answered, (b) contradicts a ruling, (c) wrong fact, (d) inconsistent with the rest,
(e) a reading shown as his rule, (f) a missing question.

## The most serious

### 1. H — three different recommendations for the same question (d, b)
- The page: "Recommended: yes, one rule for every row … A dinner gets a planned end", reason given "it is the made-up
  times your rule set out to stop".
- Chat message 1: "yes when a person or name is on the row".
- The try-out: `DEFAULTS = { a:'grey', b:'never', c:'red' }` — "Rows with nobody on them, like the dinner: Never block".
- The rule as recorded (D2612, his words "every item must have a start and end time") lists "a ground or programme row,
  an ALL AVAIL row" with no test of who is on it. So the chat's version narrows D2612 for every kind of row — the
  try-out's switch also lets an empty flying line or sim row with a start and no end through, not only a dinner
  (`tryout.js`, `counts = it.people || (S.set.b==='block' && anyTime)`).
- He was not told the recommendation had flipped, nor that the new one changes what D2612 records.
- The chat's reason ("a row with nobody on it affects no one's crew rest or OIL") is true in the code (a programme row
  with nobody on it reaches no check: `engine/avail.ts`, `engine/oil.ts`). The page's reason is also true. They point
  opposite ways and he has seen both.
- If he answers "H as recommended" nobody can tell which he meant.
- Put instead, once: "A row with a start, no end and nobody on it (DINNER WITH CMD 18:30): must it have an end before
  the day is signed? Yesterday's page recommended yes; I now recommend no, because such a row touches nobody's crew
  rest, conflicts or OIL — this narrows your 'every item'. A row with a person, a name or ALL AVAIL on it always needs
  both times."

### 2. D — the question falls away under the chat's own H (d)
- D asks whether the AMT block's BRIEF and DEBRIEF rows need an end. In the demo those two rows carry nobody
  (`engine/data.ts`: `{label:'BRIEF',str:'1100',end:''}`, no people; the try-out shows them with "+ add").
- Under the chat's rule ("only a row with a person or name on it") they never count, whatever D's answer. Yet message 1
  still asks D, and C's Publish pictures still count "4 items" with them.
- D matters only (i) if H is "block too", or (ii) when a person is put on a BRIEF or DEBRIEF row.
- Put instead, after H: "If someone is put on an AMT block's own BRIEF or DEBRIEF row, must that row have an end?
  Recommended no — the app already works out both ends." Drop D if H is answered "never block" and he does not seat
  people on those rows.

### 3. C cannot be answered "as drawn" together with I, J and G (d)
- C draws red from the moment the start is typed and the words "no end time". Message 1 asks "C as drawn" and in the
  same list recommends J 2 (grey while drafting), I yes (words become "missing a time") and G yes (a count line).
  Each changes C's drawing or words.
- "C as drawn" plus "J 2" leaves two opposite answers on record.
- Also in C: "What stays as you ruled … A row with no times at all is not touched." That was the agent's reading in
  D2612 ("The agent's readings, told to him"), not his ruling, and question I on the same page says "it was never put to
  you as a question" (e, d).
- Put instead: ask I, J, G, H first; then C only as "the refusal is the grey 'Blocked:' note at the sign-off boxes and
  at Publish day — yes?", with the words that follow from his answers.

### 4. G — partly answered already, and not said (a, d)
- D2734 (26 Nov, "yeah as recommended"): on the Scheduler Board, while a time is missing the sign-off line reads
  "4 items missing a time · 4 to sign". That takes G's line, and I's "missing a time" words, as given.
- Message 1 still lists G and I as open, with no mention of D2734. Either G and I are answered, or D2734 rests on two
  open questions. He should be told which; the row for D2734 does not say.
- Put instead: "You approved the board's short line this morning. Confirm the same line on Edit Schedule's sign-off
  panel (G), and the tap that takes you to the empty box."

### 5. Message 4 / small point 15 — wrong fact about who gives Plan; his question read one way without asking (b, c, e)
- Told: "only a master admin gives Plan of another squadron." D2626 (25 Nov, "ok as recommended", on the
  multi-squadron branch) changed that: "Plan of a squadron is given and taken away by that squadron's own admins or a
  master admin." Point 15's own "for a master admin alone" rests on the same replaced rule (D2199).
- He asked "shouldn't an admin of the owner squadron be able to do so too?" The reply took "owner squadron" as the
  man's own squadron. It can equally mean the squadron whose Plan it is (149) — which is exactly what D2626 gave him
  the day before. The reply chose one and called him right.
- "a master admin's own sign-in stays a master admin's alone to move, as today" — nothing moves a sign-in today
  (D2266: "No control on Admin → Users moves a sign-in … for now"), so "as today" describes no screen.
- If recorded as answered, a rule is written on a misread question and a replaced fact.
- Put instead: nothing to decide now (D2266). If he wants it settled anyway, one worked case: "Hunter (142 admin, Plan
  of 149). Who may move Hunter's sign-in to another person — 142's admins, 149's admins, or both? Either way the
  sign-in arrives with no rights, and Plan of 149 is given again by 149's admins or a master admin (D2626)."

### 6. Message 3 (small point 19) — "the wording isn't built yet" is untrue (c)
- "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." is built: it is in
  `raptor-port/src/ui/inputedit.tsx` on this branch and on `origin/main` (added 24 Nov, chat 156). D2394's row still
  says "NOT BUILT" — the row is stale; the answer copied it without looking at the code.
- Smaller: "a man who isn't SANS has no '+ Commitment'". The button is there, greyed, with "SANS aircrew add their
  availability here." under it (`ui/SansDay.tsx`). Same effect, different screen.
- The three blocks themselves are right (`sansRefusal` asks every day for every man; a man not SANS that day is
  refused). Point 19's recommendation stands.

## The end-time questions, the rest

### I
- (c) "An all-day input, such as an Attach, lands on the Ground Programme with no times on purpose", and I1's picture
  of an ATTACH row on the Ground Programme. An Attach lands under Unavailable by itself (D1374, built:
  `engine/inputs.ts landsUnavail`), as a course does (D1372). The try-out has it right (its Attach is under
  Unavailable). I1 is still a real case, for an all-day Training, Meeting, Duty or Appointment accepted onto the
  programme. Change the example.
- (c) "What the app does today: Nothing … The only thing flagged on such a row is a man who is on leave or grounded for
  the whole day." Too wide:
  - on a weekend or holiday the day's warning list already says "… no usable times, so nobody on it earns OIL for this
    day" for a crewed line or desk with no times (`engine/validate.ts`, `OIL_NO_TIMES`; his words of 20 Sep);
  - a standby line that flies with no START or END gets "flies but has no START. Type it…";
  - crew rest is not blind to it: a landing typed alone still ends the man's day for tomorrow's rest, and a typed Brief
    or the wave's In-time still counts as his report (`validate.ts`, `restblank.test.ts`). The example VL has a landing
    of 14:10, so "no crew-rest check" in the "No" choice overstates;
  - small point 14 on the same page adds a man on a course, overseas duty or all-day meeting.
  True for the weekday example; untrue as the general statement it is written as.
- (c) "The built-in Standard duty block arrives blank, so its times are typed each time it is used." The duty-block
  templates window lets each desk carry a start and an end (`ui/DutyTplModal.tsx`; the SC Shift and AVALON blocks
  already do). The times can be typed once into the Standard template. The cost of "yes" is smaller than stated.
- (f) His own filed idea is not mentioned: D361, "In the future I think there's a ? shown if no timing or end time is
  entered" ([ROW-NO-TIME-MARK]; scheduler page "a future job, scoped with him first"). The outline is that mark. Say
  so, and ask whether the outline replaces the "?" job.
- (f) Not asked: a cancelled (CX) row or an information-only row with a time missing — must it be typed before the day
  is signed? A flight cancelled before its times were typed is ordinary. Recommended: never counted. Also a "TBD"
  typed as a take-off (E3 covers a landing only).
- I2 and I3: no finding (D2072 and D2612's reading quoted correctly).

### H, beyond finding 1
- (c, unchecked fact — D2140) "One case could not be checked here: an input a member files with a start and no end."
  It can be checked: an input is saved either all day or with both times (`engine/inputs.ts`: "No UI path can mint such
  a record — both entry paths always write the flag or both times"). Remove the sentence.

### J
- No finding on the question; it says plainly that choice 2 changes D2613.
- (d) small: the page says "red once a press is refused"; the try-out's switch says "red once signing starts".

### K, E4
- No finding (View-only Sched does offer "Working draft — not issued" on a published day: `ui/html.ts`).

### E
- E6 (e): "Your ruling on that list has each answer stamped with who gave it." In D782 that line is among "The agent's
  readings, to confirm on the picture". Say "it was drawn that way" or ask it.
- E1, E2, E3, E5, E7–E12: no finding. E12 and E4 fall away with J 2 and K, as the page says.

### The try-out's three switches
- Switch 2: finding 1.
- Switch 1 and 3: no finding. They agree with message 1.
- Its note "Your call: keep the role names after the count…" is answered (D2734); take it off.

## The six sentences (F) and the reviewed words
- (d) The page says "Every picture now shows the exact words to be built". `words-reviewed.md` marks four of them
  "cold read owed … need one before they are built": the sign-off refusal (G4), F2, F5 and F6. If the cold read
  changes a word after "F as drawn", he approved words that are not the built ones. Do the cold reads first, or tell
  him those four may still shift.
- (d) `words-reviewed.md` still gives "Blocked: 4 items have no end time…"; with I yes the words are "missing a time".
- F1–F6 themselves: today's sentences are quoted exactly from the code, and the new ones match D2001, D2018, D2424,
  D2427, D2615. No finding.

## A and B
- A: no finding (D2294, D2299 quoted correctly; "Later asks no more that day").
- B: answered (D2617). Take it off the list.

## The nineteen small points
- 15: finding 5.
- 19: finding 6; the point itself, no finding.
- 1 (and message 2): "This now arises only while a day is being drafted, since a day with a missing end time can no
  longer be published." Written as fact; the rule is not built and H is open. Message 2 says it correctly ("until the
  end-time rule ships …"). The page line should say "once the rule is built". Message 2 otherwise: no finding (an ALL
  AVAIL row counts as a row with someone on it in the try-out, so it must have its end).
- 9 (b, mild): "Make the day's figures read him free too." D1120 records "the day's figures and the Leave War are not
  changed" (the agent's reading, told to him 21 Oct). The point changes that without saying so, and says nothing of
  the Leave War's clash with leave, which reads the same list. Name both.
- 16 and 17 (a): each follows a clear ruling (D1667 "never 'Not saved'"; D2313 "on every screen"). By D2610 a clash
  with a clear ruling is a fault to fix, not a question. Move both to the fix list.
- 8 (doubtful): asks him to keep three bell lines "never shown to you", still unshown. His bell-words job ([BELL-WORDS-
  CLEAR], D2392, D2563) and D2611 put bell words to him with pictures. Hand the three lines to that job.
- 7: "nothing to decide … you hear only if it does not" is not a question. His go for the bell section came on 26 Nov
  (D2731). Check it against that page and take it off.
- 5: no finding (the new schedulers' bell line of D2588 is for a deleted filing, a different case).
- 2, 3, 4, 6, 10, 11, 12, 13, 14, 18: no finding.

## Verdict
Can go to him as they are: J, K, A, F1–F6 (once the four cold reads are done or declared), E1–E5 and E7–E12, and small
points 2–6, 10–14, 18 and 19. Must change before he answers: H (one recommendation, saying it narrows his "every
item"), I (the Attach example, the "nothing today" statement, the Standard block's cost, the "?" idea, cancelled
rows), C (asked last, as the refusal only), G (say what D2734 already took), E6, small points 1 and 9, and the chat
answers on point 15 (D2626; which squadron he meant) and point 19 ("not built" is wrong — it is live). Must be
dropped or moved: B (answered, D2617), D (unless H is "block too" or he seats people on those rows), small points 16
and 17 (faults under clear rulings), 7 (nothing to decide) and 8 (to the bell-words job); the try-out's board
question (answered, D2734). The pattern behind the errors: the page and the chat were written on a branch 97 commits
behind main and never checked against the other branches' rulings of 25–26 Nov, and the chat changed a
recommendation without saying it had.
