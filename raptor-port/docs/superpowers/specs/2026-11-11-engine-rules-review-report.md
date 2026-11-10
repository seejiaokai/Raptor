# The rules check — every warning rule checked against the app (11 Nov 26)

His order of 11 Nov 26 (D1983): every ruling about what the warnings flag and how a rule is read, checked against the
app one by one, with a test for each — and "a report, nothing changed". Written for him; the last section is for the
next chat.

---

## 1. In one screen

**What was done.** Nine reviewers each took one family of rules — report times, standby lines, crew rest, availability,
seats and quals, hidden warnings, the published day, OIL hours, and who earns OIL. Each read your rulings, found where
the app carries them, and wrote a test that proves what the app does. **Nothing in the app was changed.**

**The totals.**
- **96 rules checked.**
- **86 behave exactly as you ruled.**
- **4 are off** — the app or its explanation says something your ruling does not.
- **5 can be read two ways** from your own words.
- **1 is not built yet, by your choice** — a single-seat jet's rules, waiting for you to design them.
- **11 faults found.** Some sit at one edge of a rule that otherwise matches, so they are counted on their own. All 11
  were run again by the coordinator and seen to fail.
- **10 questions for you.** The 5 rules read two ways give 4 questions (two of them are the same question). The other 6
  came up at the edges of other rules.
- **119 tests added**: 108 that pass, and 11 marked "expected to fail" — one for each fault. They turn green once the
  fault is fixed. (Counted from the nine new test files, and it agrees with the nine reviewers' own counts.)
- The app's whole set of tests still passes with them in.

**The headline.** The rules engine is sound: the rules themselves hold almost everywhere, at their sharpest edges. It is
weakest in two places. First, the Logic page's explanations have fallen behind the rules — 7 of the 11 faults are
lines on that page that are no longer true. Second, the newer rules built on top of the original meet badly in a few
places: standby lines that fly, the published day, and report times when nothing is typed.

**Nothing is fixed yet.** You said "a report, nothing changed", so none of the 11 is fixed. Each is a small job once you
have read this. Three of them wait on your answers:
- **F1** (the published-day crew rest) waits on **Q8**.
- **F7** (the tight-turn line) waits on **Q1**.
- **F10** (the ground crew line) waits on **Q6**.

The other eight can be fixed without asking you anything.

**The faults, most important first:**
- **F1** — On a published day, a red crew-rest warning measured to a brief time the day never printed (7.1)
- **F2** — A seventh day in a row is not flagged while that day's only task has no times yet (3.1)
- **F3** — After you hide a "takes off and lands at the same time" warning, a second line keeps its amber box (6.1)
- **F4** — The duty-template sheet says an AVALON or BB desk "earns no OIL" — it can (9.2)
- **F5–F11** — Seven lines of the Logic page that are no longer true (3.4, 3.3, 3.2, 8.1, 9.1, 5.2, 5.1)

**The questions:**
- **Q1** — With nothing typed, where does crew rest start?
- **Q2** — Can the "+ In-time" button's words still make a rally?
- **Q3** — Is a standby line that flies checked like a sortie, or like a standby shift?
- **Q4** — Does a desk made from the AVALON template stay exempt when the AVALON flies?
- **Q5** — Do days standing by count toward days in a row?
- **Q6** — Should a ground crewman's own absence flag him?
- **Q7** — When does a hidden clash come back?
- **Q8** — On a published day, which brief does the live crew-rest check measure to?
- **Q9** — A published day made a holiday afterwards: should its red "no usable times" line show at once?
- **Q10** — A standby shift that flies, typed with the same START and END: does it earn OIL?

---

## 2. The faults found

Each fault keeps the reviewer's own number in brackets, so its test can be found.

### F1 — On a published day, a red crew-rest warning measured to a brief time the day never printed (7.1)

- **The case.** Ranger flies Monday's LATE, 18:00–19:00. Monday is not published. With the 2-hour debrief his day ends
  at 21:00, so his crew rest clears at 09:00 on Tuesday. Tuesday is published with Ranger on VL: take-off 12:00, B left
  blank, so the published day prints B 09:40. The admin then raises "Brief before take-off" on the Logic page to 200
  minutes.
- **What the app does.** Tuesday's published schedule still prints B 09:40, and Tuesday reads pending — both correct.
  But the published day now also shows a red warning on Ranger: crew rest breached, "told to report 08:40 — only 11h40
  rest". Measured to the 09:40 the day prints, he has 12h40 and no breach.
- **What you ruled.** "A published day keeps the brief lead it printed with it; the rulebook itself stays unversioned
  (the validator and every working surface read today's rules)" (D186). The crew-rest breach stays live on a published
  day (D184). The Logic page tells the scheduler: "A published day keeps its B until it is published again." And
  every Logic line must be "correct for whatever the settings are" (D932).
- **What a scheduler or member sees.** On View-only Sched, Ranger is ringed red for crew rest. The warning names a report
  time, 08:40, that appears nowhere on the published schedule, which says 09:40.
- **How big.** It happens only when someone changes the brief setting while published days with a blank B are standing.
  The day reads pending, so the admin is told, and the next amendment prints 08:40 and agrees with the warning. No one's
  OIL changes, and the printed times do not change.
- **Recommended.** Answer Q8 first. If today's setting is right, change only the Logic page's words. If the printed B is
  right, a small fix makes the check measure to the B the day printed.

### F2 — A seventh day in a row is not flagged while that day's only task has no times yet (3.1)

- **The case.** The limit is 6 days. Hawk is on a ground row, 09:00–10:00, Monday to Saturday. On Sunday the scheduler
  seats him on a ground row, or on a duty desk from a template whose times were cleared, and has not typed its times
  yet.
- **What the app does.** No break-day warning. Sunday reads as a day off. The crew list's check before a drop says
  nothing either. If Sunday's task had been a flying line with no times yet, the red "No break day" warning would land
  on Sunday.
- **What you ruled.** A break day is due after 6 days in a row, counting "every kind of tasking there is: a flight, a
  duty post, a sim, a ground item, a programme row" (settled Aug 26, before rulings were numbered). The Logic page says
  the same: "Any tasking counts: a flight, a duty, a sim, a ground or programme row."
- **What a scheduler loses.** A seventh day goes unflagged until someone types a time.
- **How big.** A short window, because times are usually typed. But a day published with its times still blank would go
  out without the warning. No OIL is affected.
- **Recommended.** Fix in a small job: count a row with no times yet as a day on the programme. The reviewer was only
  medium-sure this is what you meant. If you meant a row with no times not to count, say so, and it stays as built.

### F3 — After you hide a "takes off and lands at the same time" warning, a second line keeps its amber box (6.1)

- **The case.** Tuesday, WAVE 1. Two lines are added with "+ Line" and no callsign yet. Ranger is on the first, Saber on
  the second. Both have take-off 15:00 and landing 15:00. The list shows one advisory: "WAVE 1 takes off and lands at
  the same time (15:00) …". The scheduler hides it with Hide this warning.
- **What the app does.** The day reads no issues and the line is struck through. The first line's time boxes go plain,
  but the second line's stay amber.
- **What you ruled.** "If it's hidden, the pucks shouldn't have flagging for that specific item" (D469).
- **What a scheduler sees.** An amber box with nothing in the list to explain it. The only way to clear it is to flag
  the warning again.
- **How big.** Rare: it needs two lines worded exactly alike. Nothing published is wrong, and no OIL is affected.
- **Recommended.** Fix in a small job.

### F4 — The duty-template sheet says an AVALON or BB desk "earns no OIL" — it can (9.2)

- **The case.** Saturday 18 Jul. A scheduler places a block from the AVALON template and puts Drifter on its SXO row,
  19:00–07:00. The AVALON is activated that night. In OIL Earn the admin switches the desk on, and Drifter is credited a
  full day — as you ruled.
- **What the app shows.** The note under "For wave" in Duty templates… says the AVALON desk "earns no OIL on a weekend or
  holiday". The BB note says the same.
- **What you ruled.** These seats "must OFFER the OIL switch in the mode, defaulting to OFF, so that when one of them is
  actually activated the admin can credit it" (D24). "The SWITCH reaches the template-minted block too" (D35).
- **What a person loses.** An admin who trusts the note never looks for the switch, so the man is never credited his
  OIL. Your reason for D24 was that "the admin can just easily click credit OIL".
- **How big.** Rare: you said AVALON and BB fly "almost rarely to never" (D1042). The app's own calculation is right. The
  risk is a credit nobody thinks to give.
- **Recommended.** Change the note's words. Suggested: "…and earns no OIL by default on a weekend or holiday — switch it
  on in OIL Earn when it was worked."

### F5–F11 — Seven lines of the Logic page that are no longer true

You ruled that every line on the Logic page is "correct for whatever the settings are" (D932). Each line below is untrue
for a real case.

- **What they share:** in every one the app does the right thing; only the explanation is wrong.
- **Who it misleads:** a scheduler or member who reads the page to understand a warning.
- **The two that could lead to a wrong action:**
  - **F9** could lead someone to type times into a request's row "to make it earn". That changes the request for
    everyone on it.
  - **F10** hides a check that ground crew really do get.
- **None changes** a warning or an amount of OIL.
- **Recommended for all seven:** fix the words in one small job. F7 waits on Q1, and F10 waits on Q6. The suggested
  words are the reviewers'.

| | The line as it reads today | The case where it is untrue | The words it should say (suggested) |
|---|---|---|---|
| **F5** (3.4) | Crew rest: "Rest runs from the end of the day before to the first thing today: his in-time, his B where no in-time is typed, or anything earlier, such as a meeting." | Bane's Monday ends 21:30, so his rest clears 09:30. On Tuesday, VL takes off 12:00 with R typed 09:00, no in-time and a blank B (suggested 09:40). The app counts the rally, 09:00, and shows a red breach — correctly. The line says the B counts. | "…his in-time or rally, his B where neither is typed, or anything earlier, such as a meeting." |
| **F6** (3.3) | Crew rest: "An SC SPARE carries no crew rest either way." | Monday, SC PM 13:00–19:00 has R typed 12:00, so it flies, with Bane on its SPARE row. His Tuesday in-time is 06:30. The app shows a red crew-rest breach — correctly. | "An SC SPARE standing by carries no crew rest either way; one that flies carries it as any flyer does." |
| **F7** (3.2) | Tight turn: "His rest would be short if he reported the usual 3h before take-off (Default rally before take-off), but his typed in-time is later, so it clears." | Bane lands 19:30 on Monday. On Tuesday he takes off 12:00 with nothing typed. The amber note shows because the suggested B, 09:40, clears. No in-time was typed. | Waits on Q1. If crew rest stays on the B: "…but his in-time, or the suggested B where none is typed, is later, so it clears." If crew rest moves to the default rally: no change. |
| **F8** (8.1) | OIL: a standby line that flies earns "from its B or R (the earlier) to its END". | Saturday, SC AM 07:00–13:00, Bane on MAIN and Stiff on SPARE, B typed 08:00. The app credits both men from 07:00 to 13:00 — right by D1044 and D606. The page says they earn from 08:00. | "…from its B or R if earlier than its START, otherwise from its START, to its END." |
| **F9** (9.1) | OIL: "A row with no times, or no end time, earns nothing." | Ranger files an all-day Training for Saturday 18 Jul and answers Yes to the OIL question. Once accepted, it sits on the Ground Programme with blank times. When the day is published, Ranger is credited a full day — as ruled. | "A row the scheduler adds with no times, or no end time, earns nothing; a request answered yes earns over its own times." |
| **F10** (5.2) | Personnel: "Ground crew are checked only for clashes, the long day and days in a row." | Ratchet, ground crew, files local leave for all of Tuesday. Put on a Tuesday 09:00–10:00 BRIEFING row, he gets the red "On leave + flying". | Waits on Q6. If yes: "Ground crew are checked for clashes, the long day, days in a row and their own absences; never a front seat; none of the flying rules (crew rest, turns, pairing, AAR, SC currency, briefs)." |
| **F11** (5.1) | AAR: "…That clears the front seat's currency warning; an instructor without the mark is flagged instead." | Tuesday, VL BFM 12:00–13:00, remarks AAR. Diesel (CAT D, not DAAR current) is in front; Echo (CAT IW) is behind. The app flags Diesel "not DAAR current" and says nothing about Echo. Only an instructor pilot can clear it — the rule is right; the line is not. | "…an instructor pilot (IP, IR or FI) in the back seat…" |

---

## 3. Questions for you

Each question is one decision, and none depends on another's answer. "As built" means what the app does today.

### Q1 — With nothing typed, where does crew rest start?

- **The example.** On Monday, Bane lands 19:30. His day ends at 21:30, so his rest clears at 09:30. On Tuesday, VL takes
  off at 12:00 and nothing is typed: no in-time, no R, no B. The faint R suggests 09:00 (the default rally); the faint B
  suggests 09:40.
- **What the screen shows today.** No crew-rest breach, because crew rest is measured to the 09:40 B. Instead there is
  the amber "Tight turning — crew rest" note, measured to 09:00. OIL and the long work day both start his Tuesday at
  09:00.
- **The odd part.** If the scheduler taps the faint 09:00 into R — one tap, accepting the app's own suggestion — the day
  turns red. OIL and the long day do not move.
- **The two readings.**
  - **A — the default rally, like everything else.** Crew rest counts from 09:00. This case becomes a red breach, and
    the amber note would almost never show.
  - **B — the suggested B, as built.** Crew rest stays on the B, and the amber note covers the gap. You then accept that
    tapping the suggestion can turn a day red, or ask for the tap not to count for crew rest.
- **Why both fit your words.** "An empty box's default counts only where no in-time or rally is entered" (D1032) can be
  read either way. D1786 moved only the long day and Insights to the default rally, and said nothing about crew rest.
- **Recommended:** neither reviewer gave one, because both readings fit your words. Today's mix — where accepting the
  app's own suggestion turns a clean day red — is the part worth ending.
- **Waits on it:** F7's words.

### Q2 — Can the "+ In-time" button's words still make a rally?

- **The example.** A squadron sets the Logic setting "Words the + In-time button fills in" to "RALLY". In Wave 1, VL
  takes off 12:00 and its R box says 10:00. The scheduler presses "+ In-time" and the line "09:00H: RALLY" appears.
- **What the screen shows today.** The line is read as a rally for the whole wave. VL's own R box replaces it, so VL
  reports at 10:00. Read as an in-time, VL would report at 09:00.
- **Why it matters.** That is an hour's difference in VL's day start, OIL and crew rest. Nothing on screen says the line
  was not taken as an in-time.
- **The two readings.**
  - **An in-time only.** "The button will just be intime only… No Rally" (D1026).
  - **A rally, as built.** "A typed line that still says RALLY stays a rally" (D1034). Both rulings were made the same
    day.
- **Recommended:** none given. It matters only if a squadron puts the word RALLY into that setting.
- **Waits on it:** nothing else.

### Q3 — Is a standby line that flies checked like a sortie, or like a standby shift?

- **The example.** Tuesday, SC AM 07:00–13:00, with a rally of 06:30 typed. Split is on its SPARE row, so the line
  flies. Split is also on the Ground Programme for a LECTURE, 09:00–10:00.
- **What the screen shows today.** An amber note: "Split is on SC AM (07:00–13:00) and also down for LECTURE". Put Split
  on an ordinary sortie, VL BFM 08:00–12:00, with the same lecture, and it is a red clash.
- **Two more effects, from the same choice in the app:**
  - **No tight-turn note.** Put the same flying shift before an ordinary sortie taking off at 13:30. Nothing shows. An
    ordinary line landing at 13:00 into a 13:30 take-off would get the tight-turn note.
  - **No double-turn note.** Bane flies VL 06:00–07:00, then sits on SC PM's SPARE row with R typed 12:00. Insights
    counts two sorties for him, but the warning list has no "Double turning" line.
- **The two readings.**
  - **A — a sortie everywhere.** Your words: a standby line that flies gets "every warning an ordinary flying line
    gets" (D1042). The lecture becomes red, and the tight-turn and double-turn notes appear.
  - **B — keep it a standby shift, as built.** You called it "a schedule that's planned" (D1044): START to END is a
    window of being on call, not airborne time. All three stay as they are.
- **One answer settles all three effects.**
- **Recommended:** B, keep as built (the standby reviewer's call), and add a sentence to your rulings page so "every
  warning" is not read literally.
- **Waits on it:** nothing else.

### Q4 — Does a desk made from the AVALON template stay exempt when the AVALON flies?

- **The example.** Tuesday, AVALON NIGHT 19:00–07:00, with a rally of 18:30 typed, so it flies. Split is on its MAIN.
  Bane is on the AVALON desk (SXO 19:00–07:00, made from the template) and also on an ordinary sortie, 20:00–21:00.
- **What the screen shows today.** Nothing for Bane's desk-against-sortie clash, and the desk earns no OIL by default —
  just as when the AVALON only stands by.
- **The two readings.** Your Aug 26 rule says the desk is "exempt as its wave is".
  - **Read literally:** once the wave flies, the desk is fully checked and earns OIL by default.
  - **As built:** the desk stays exempt — a desk is not a line that flies, and desks never carry the Flies mark (D1060).
- **Recommended:** keep as built, and reword your page to "exempt as its standby is". Nothing changes for anyone today.
- **Waits on it:** nothing else.

### Q5 — Do days standing by count toward days in a row?

- **The example.** Bane stands SC AM SPARE, not flying, for seven days running.
- **What the screen shows today.** No break-day warning. A day only standing by is not counted.
- **The two readings.** A day standing by is a day on the programme; or it is not (as built). No ruling of yours covers
  it.
- **Recommended:** leave as built until you say. The crew list already treats a man standing by as free to be planned
  (D1120), and counting his standby days would cut against that. The cost: a man on standby seven days running gets no
  break-day warning.
- **Waits on it:** nothing else.

### Q6 — Should a ground crewman's own absence flag him?

- **The example.** Ratchet, ground crew, files local leave for all of Tuesday. The scheduler puts him on a Tuesday
  09:00–10:00 BRIEFING row.
- **What the screen shows today.** The red "On leave + flying" on Ratchet.
- **The two readings.** Your Aug 26 rule says ground crew get "only these three: the conflict, the long working day and
  the 7-day run".
  - **Yes, flag him (as built).** He also gets the absence check.
  - **No.** Only the three.
- **Recommended:** yes, as built (the seats reviewer's call). Then only the Logic line changes.
- **Waits on it:** F10's words.

### Q7 — When does a hidden clash come back?

- **The example.** Tuesday: Ranger is on VL BFM at 12:00 and on a BRIEFING, 12:00–12:30. The clash is hidden.
  - **(a)** The brief slides to 12:30–13:00. It is still a clash with the same words, and it stays hidden.
  - **(b)** Ranger is taken off VL, the brief moves to 15:00, and a new wave is added with another VL BFM at 15:00, with
    Ranger on it. This is a different clash at a different hour, worded the same. It arrives already struck through,
    and his puck carries no flag. The only sign is the amber "already on …" note when he is dropped in.
- **The two readings.** A hide covers the same words on the same day (as built). Or it covers that one clash, and comes
  back once that clash has gone after an edit. You ruled it stays hidden "until another person unhides it" (D469). You
  were told a clash recreated by putting the same man back on the same seat "returns already struck" (D479) — but not
  about a different line.
- **Recommended:** none given — there is a cost either way. As built, a later, different clash can arrive already
  acknowledged. The other way, a small edit like sliding the brief 30 minutes brings a hidden clash back.
- **Waits on it:** nothing else.

### Q8 — On a published day, which brief does the live crew-rest check measure to?

- **The example.** This is F1's case. Tuesday is published printing B 09:40. The admin then raises "Brief before
  take-off" to 200 minutes. The day shows a red breach for Ranger, "told to report 08:40".
- **The two readings.**
  - **The B the day printed (09:40).** No breach. A small fix to the check.
  - **Today's setting (08:40), as built.** The red stands. Only the Logic page's words change, and the next amendment
    brings the printed B into line.
- **Why both fit your words.** You ruled that a published day keeps the brief it printed (D186), and that crew rest
  stays live on a published day so the break can be seen (D184). They disagree on one day until its next amendment.
- **Recommended:** none given. The reviewer notes that D186 itself says "the validator and every working surface read
  today's rules", which may make today's behaviour the ruled side.
- **Waits on it:** F1 — this answer decides how it is fixed.

### Q9 — A published day made a holiday afterwards: should its red "no usable times" line show at once?

- **The example.** Wednesday 15 Jul. Bane is on VL with no take-off or landing typed; Stiff is on the SDO desk,
  08:00–15:00. The day is published as a working day, so no OIL words show. The admin then makes the day a PH on the
  Leave War's Event row.
- **What the screen shows today.**
  - The published day says it must be published again before it pays.
  - It also shows a red line: VL has no usable times, and nobody on it earns OIL.
  - The day reads pending, the four sign-offs fall, and nobody is credited until it is published again.
  - After the amendment, Stiff gets a full day. The red line stays, because it is still true.
- **The two readings.** You said "freeze everything for now" (D179). The warnings you then let stay live (D183–D185,
  D188) do not name the OIL lines, but six of them are live today.
  - **Keep them live, as built,** and widen the page to say so.
  - **Freeze the red "no usable times" line** like the other warnings.
- **Recommended:** keep as built (the OIL-hours reviewer's call). You asked for the day to say so (D2, D81), and the red
  line names the one thing to fix before publishing again.
- **Waits on it:** nothing else.

### Q10 — A standby shift that flies, typed with the same START and END: does it earn OIL?

- **The example.** SC AM with Ranger on MAIN. START and END are both typed 08:00, and R is typed 06:00, so the shift
  flies.
- **What the screen shows today.** Ranger earns nothing, and the day shows the red "the SC shift has no usable times —
  nobody on it earns OIL". An ordinary flying line typed 08:00–08:00 would earn half a day and get only the amber
  "times look wrong".
- **The two readings.**
  - **Earn, like a flying line.** You ruled "a flying line whose written take-off and landing are the same still earns.
    The man reported and debriefed" (D49). The shift would earn from its R or B, with the amber note.
  - **Earn nothing until the times are fixed (as built).** This choice was made before you ruled that a standby line
    that flies counts as a real flight (D1042).
- **Recommended:** none given. As built, a man who reported at 06:00 and flew loses his day until someone corrects the
  times; the red line tells the scheduler which line to fix.
- **Waits on it:** nothing else.

---

## 4. Checked and sound

What "sound" rests on — each family's count and a few of the sharpest edges tested that held.

- **Report times — in-times, rallies, briefs, where a day starts:** 11 of 13 match.
  - The earliest in-time counts whichever order it is typed in, and across midnight (23:30 beats 00:15).
  - A rally may share the brief time; a rally one minute after the brief is red.
  - A report time later than take-off is read as the evening before, and never two days back.
- **Standby lines — SC, AVALON, BB, and lines that fly:** 12 of 13 match.
  - Crew rest runs from END exactly: a 07:00 report is clear, 06:59 is a breach.
  - A cancelled SPARE stops flying while the other SPARE still flies.
  - With R typed and both SPARE rows empty, Insights counts 2 jets, not 4.
- **Crew rest, days in a row, the long work day, turns:** 9 of 13 match.
  - Exactly 12 hours' rest is legal.
  - One breach gives one warning, on the day it breaks, with its mark on the day before.
  - An overnight sortie, 22:00–00:30, is judged the same by the debrief check, the long day and crew rest (14:29 a
    breach, 14:30 clear).
- **Availability, absences and inputs:** 14 of 14 match, no faults.
  - A Monday-to-Wednesday leave flags a blank line on Tuesday; an overnight leave's tail does not.
  - Every part of the ALL AVAIL rule holds.
  - A request filed late raises exactly the same warnings as one filed on time.
  - An upchit cuts a downchit short, and gives the days back if it is deleted.
- **Seats, crew pairing, quals, placeholders:** 5 of 8 match outright. Two more have the right rule but a wrong Logic line
  (F10, F11). The single-seat jet is not built, by your choice.
  - ALL and ALL AVAIL are refused in both seats of every flying line, a standby line that flies included.
  - A one-minute airborne overlap is a red clash; landing exactly at the next take-off is a turn.
  - A quals edit after seating shows at once.
- **Hidden warnings and the issue counts:** 6 of 6 match.
  - Every counter — the week's bar, the board, the ⓘ, Insights' day and week — agrees as a red, an advisory and a note
    are hidden and shown again.
  - Hiding the only red turns the bar amber.
  - On a draft day a hide moves Insights at once; on a published day it waits for the amendment.
- **The published day and amendments:** 11 of 11 match (F1 sits at one edge).
  - A change reads pending and the four sign-offs fall; putting it back restores them.
  - Live warnings never make a day pending on their own.
  - Each day keeps its own amendment numbers, ORIG → AL1 → AL2; Unpublish then publish again reissues the same number.
- **OIL hours — how a day is measured and which version pays:** 9 of 9 match (F8 is the page's words only).
  - On one made-up Saturday, all four places that work out OIL hours agree.
  - An amendment that takes Stiff off a past day takes his OIL away, and an Undo of the publish takes the day's OIL away.
  - A hand award on a working Monday stands, and the automatic pass gives that Monday nothing.
- **OIL — which seats and which people earn:** 9 of 9 match.
  - All eleven seats that earn by default credit with nothing decided.
  - A man on two earning rows earns one day, once.
  - A ground crewman named on a Saturday desk earns a full day, while ALL AVAIL's crowd has no ground crew.
  - The OIL question is asked of exactly the nine request types you ruled.

---

## 5. Small things noticed, no decision needed

These are written down here and in the reviewers' results, filed for the next job in each area. None is fixed. None
changes what the app does today, except the two marked "worth one check".

**Your rulings pages and the rules notes**
- The scheduler page still says the in-time window advisory is "on a MAIN only … AVALON and BB untouched". Later rulings
  (D1044, D1045) overtook it for lines that fly. The app follows the later rulings — this includes the amber in-time
  advisory on a SPARE whose line has B typed, which the standby reviewer found matches.
- D606's full row still describes the SPARE earning only its written hours, with no mark that D1044 and D1045 overtook
  it. The app follows the later rulings.
- A rules note says typing the R box's faint suggestion "changes nothing now". That is untrue for crew rest — see Q1.
- The OIL page still calls one request type "Fly with". It was renamed Attach (D1373).
- Nowhere says that there is no separate "end of day" version: the latest amendment is the day's last word. Worth one
  line, so nobody hunts for it.
- The Logic page's flight line never says that a typed rally alone starts the line. The app counts it (D1032).
- The Logic page's "Days in a row" fold shares F2's gap.
- The crew-rest line "to his earliest in-time" may want "in-time or rally". Those are your own words (D933), so they are
  left for you.

**Notes in the code that fell behind** (they describe the app before standby lines could fly; the app itself is right)
- Several notes still say a SPARE "never reaches" the checks.
- Two notes still say a bare AAR counts as night "if it runs past 19:00". That clock was removed on 21 Aug 26.
- One label is named after the old publish block that you withdrew.
- Two values are worked out and never used.

**Small oddities, each one line**
- **Worth one check:** flipping a row between MAIN and SPARE may not go through the app's normal save path. One check
  that the flip survives a reload.
- **Worth one check:** an SC line with R typed and nobody seated on its MAIN reads as if the shift were not there in the
  day's flying count. Not ruled either way.
- Whether a standby line that flies counts as a "flying line" for refusing ALL and ALL AVAIL is not stated. The app
  refuses them there.
- An SC MAIN that only stands by still gets the crew-pairing and AAR checks. There is no ruling either way.
- An overseas duty against a sortie says "clashes with", not "overseas" — wording only.
- A BB left with blank times and crew on a weekend raises the red "no usable times" line. That is consistent with D31,
  but noisy.
- A blank landing and a "TBD" landing differ for the next day's crew rest: a blank landing borrows the take-off, and TBD
  ends nothing. D1936 ruled them the same for hours only.
- The Logic page's "fired this week" filter counts hidden warnings. No count is shown on screen, so this is likely fine.

---

## 6. What this review did not cover

- **It read your rules against the app's code and tests. It did not walk the running app.** Every case above was run as
  a test of the rules engine, not by pressing buttons on screen.
- **Things the reviewers said they did not try:**
  - The SANS window's front edge with a typed rally but no in-time line.
  - An overseas duty moved to the Ground Programme, against a seated sortie.
  - A saved plan brought out on a published day.
  - An archived man's own OIL on a published day after his archive.
  - The ALL AVAIL count on OIL Earn.
  - The size and look of the Flies mark, and the faint dash in an empty SC box (looks, not rules).
- **Not built, so not checked:** the single-seat jet's rules (D1099) and the mark for a row with no time (D361). Both
  wait for you.
- **The printed schedule and the spreadsheet export carry no warning marks at all.** So "a hidden warning drops from
  print" holds only because nothing is printed — the export job waits on your word (D1644).
- **The 16 rulings no test named before tonight are now all named by at least one of the new tests** (checked by
  search). Two of them, D361 and D1099, are future jobs, so their tests pin what the app does today.

---

## 7. For the next chat

(Technical; he need not read it.)

- **Branch:** `claude/engine-rules-review`. Nothing under `raptor-port/src` outside the nine test files was changed.
- **Tests:** `raptor-port/src/engine/rulesfirst-<n>-<slug>.test.ts`, n = 1…9 (`1-report-times`, `2-standby`,
  `3-crew-rest`, `4-availability`, `5-seats-quals`, `6-hidden-warnings`, `7-published-day`, `8-oil-hours`,
  `9-oil-earners`). Counted with grep at line start: 108 `it(` + 11 `it.fails(` = 119, which agrees with the results
  files (14, 15, 17+4, 13, 14+2, 8+1, 8+1, 10+1, 9+2).
- **A finding** is an `it.fails(...)` under a `// RULES-FIRST FINDING <n.m> (11 Nov 26, [ENGINE-RULES-REVIEW]) …` comment.
  When the app is fixed, flip it to `it(...)` — it must then pass. Findings: 3.1–3.4 (file 3), 5.1–5.2 (file 5), 6.1,
  7.1, 8.1, 9.1–9.2. The "as built" tests pin today's behaviour on each question. A ruling that changes it flips that
  test's expectation.
- **Fault map:** F1 = 7.1 · F2 = 3.1 · F3 = 6.1 · F4 = 9.2 · F5 = 3.4 · F6 = 3.3 · F7 = 3.2 · F8 = 8.1 · F9 = 9.1 ·
  F10 = 5.2 · F11 = 5.1.
- **Question map:** Q1 = W6 / W27 · Q2 = W9 · Q3 = W14's UNCLEAR + W32 (one cause: `validate.ts` `byP` skips `e.shift`,
  and the clash loop's shift branch) · Q4 = W25 · Q5 = W33's sub-point · Q6 = W61 / 5.2 · Q7 = 6.U1 · Q8 = 7.U1 ·
  Q9 = 7.U2 (answered with the real OIL hooks by family 8) · Q10 = 9.U1. W12 (the SC SPARE in-time advisory) was settled
  by family 2 as MATCHES — it is not a question.
- **Item verdicts as the reviewers gave them:** MATCHES 85 (+ W12 = 86); UNCLEAR 5 (W6, W9, W25, W27, W32); DRIFT 4
  (W33, W38, W59, W61); MISSING 1 (W56, expected, filed as [SINGLE-SEAT]). Total 96.
- **The results**, copied byte for byte: `raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-results-<n>.md`.
  **The worklist:** `raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-worklist.md`.
- **The checks on the review's last test commit,** on his PC under the checks lock:
  - The whole unit suite: 824 files, 14,193 tests pass, 11 expected fail (exactly the eleven findings), 20 skipped,
    0 failed.
  - Type check (`npx tsc -b`) clean.
  - `npm run rulecheck` OK.
  - React Doctor: no new finding.
- **Engine bodies copied from the original stay word for word (D1537).** A fix inside such a body is the behaviour
  change only, with its reads (Astra and a fresh, blind Opus reader).
