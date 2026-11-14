# Family 4 — availability, absences and inputs against a seat (W40–W53) — results (11 Nov 26)

Test file: `raptor-port/src/engine/rulesfirst-4-availability.test.ts` — 13 passed, 0 it.fails. `npx tsc -b` clean.

| W-id | D-numbers | verdict | where implemented | the test | one line |
|---|---|---|---|---|---|
| W40 | D605 | MATCHES | engine/events.ts buildDay (`whole`, `blank`, wholeDay); engine/validate.ts absence loops (sortie, events, `blank`, sacrew) | new: "W40 — … a Mon–Wed leave flags a blank line on Tuesday; an overnight … does not; edited to part-day or deleted …"; also engine/blankabsence.test.ts (the oracle table, every seat kind) | Several-day leave, overnight tail, 00:00–23:59, edit and delete after seating all behave as ruled. Reading (7)'s known crew-list difference is already filed ([BLANK-STANDBY-STRIKE]). |
| W41 | D36 | MATCHES | engine/avail.ts personBusy (step→dekit; a shift unpadded); leavewar/sync.ts availableFor; validate.ts crowdClashes (flags, never removes) | new: "W41 — … exactly step→dekit; on a standby shift exactly its hours"; existing ui/availwin.test.tsx "THE FLAGS ARE THE POINT …" and "the owner's case — an ops brief inside a man's own debrief is FLAGGED (D38)"; engine/crowdsim.test.ts | Narrow window, brief/debrief clashes shown amber, man kept in the crowd. |
| W42 | D27, D37; D43, D755, D776; [ALL-AVAIL-REDEF] | MATCHES | leavewar/sync.ts availableFor | new: "W42: ATT B in, leave out, ground crew out, a SANS man out until planned with us, a time clash out — and the equal-time edge in" | Every clause of the membership rule holds; a step touching the window's end is no clash. |
| W43 | D702; D711–D713, D778 | MATCHES | inputs.ts inputLines / PLACEHOLDER_KINDS; leavewar/sync.ts availableFor (keptOut reads lines; a placeholder has none) | new: "W43: an input filed FOR ALL AVAIL keeps nobody out, and its crowd changes as the day changes" | Worked out live both ways. Frozen at publication is D44's (not re-tested here). |
| W44 | D714, D713; D778 | MATCHES | inputs.ts INPUT_META shiftHard; validate.ts events loop (SHIFT_SOFT branch) | new: "on an SC MAIN 07:00–13:00: Event red, Personal red …, Meeting amber"; existing engine/eventkind.test.ts "D714 — an Event clashes red across a standby shift …" | The worklist's open point — Personal's grading on a shift — is red, as Event, which D778's "the same as an Event for everything about people" supports. |
| W45 | D1393, D1390, D1381, D1389, D1374, D1372; D1357, D1377, D998 | MATCHES | inputs.ts isAway / odOut; events.ts inpShow (a rejected 'r' is dormant); avail.ts slotBar | new: "filed: away, refused by the picker, a red clash; rejected: in, the picker silent, no warning" | The three readers of "away" agree for a rejected overseas duty: crew list in, warning list silent. (An OD speaks as INPUT_FLY, not LEAVE_FLY — as built, not ruled otherwise.) |
| W46 | D1118; D1113, D1114 | MATCHES | ui/palette-html.ts (groundedType, gFree) | existing ui/palette.test.ts "D1118 — the ATT B man with nothing else that day, no place picked" › "is drawn in full colour with "ATT B: no flying" …" | ATT B's four readings are four different questions (free to fly / free for a ground event / manning / Tracker down days) and do not contradict; ALL AVAIL keeping him in is pinned in W42. |
| W47 | D360, D361 | MATCHES | time.ts win (VCONF.openEnd); oil.ts openEndRows; avail.ts personBusy | new: "as built: a NAMED man on a 10:00 row with no end is busy 10:00–11:00 …"; existing engine/oilopenrow.test.ts (crowd over the assumed hour, credits nobody, the Logic setting moves it, no start counts nobody) | The worklist's question answered: a named man on an open-ended row is checked over the same assumed hour, and the setting moves both. D361 is a filed future job ([ROW-NO-TIME-MARK]) — nothing to implement yet. |
| W48 | D742, D739, D740 | MATCHES | inputs.ts isLateInput (never read by validate.ts or slotBar) | new: "the same meeting filed late and on time raises exactly the same warnings and the same crew-list answer; a downchit never reads late" | Unseen by the rules engine, as ruled. |
| W49 | settled Aug 26; D713, D714, D928, D1357, D1372–D1374, D1388, D1399 | MATCHES | inputs.ts INPUT_META / isAway; validate.ts sortie loop and brief checks | new: "Attach (Unavailable) and Meeting give the same warnings at the same hours; ending exactly at the step is no clash" | No padding on the input: ending at the step is no INPUT_FLY, though it still eats the brief (NO_BRIEF advisory) exactly as a Meeting does. SHIFT_SOFT has no numbered ruling (Meeting's amber on a shift, owner 26 Aug 26). |
| W50 | settled 10 Aug 26 | MATCHES | avail.ts slotRules / slotBar; validate.ts sortie loop | new: "absence 08:00–10:30 against a 11:00 take-off (step 10:00): both refuse; 08:00–10:00: both silent" | Picker and warning list agree, both padded to the step, the equal-time edge silent. |
| W51 | settled 14 Aug / 26 Aug 26 | MATCHES | avail.ts sansGate, slotRules (sansStart); validate.ts SANS_AVAIL (min(report, step)) | new: "no in-time published: the picker and the warning list judge the same window"; "an in-time published at 10:00 opens the window there, for both" | The two front edges agree with and without an in-time. Rally-only cases not tried (see doubts). |
| W52 | settled 1 Sep 26; D31, D760 | MATCHES | events.ts buildDay (skips info/cx rows); avail.ts personBusy, slotBar (infoRow) | existing engine/infoflag.test.ts (leaves the event stream; occupies nobody's time; marks nobody engaged; mints no OIL; the crew picker stands down) | Held whole by the existing file. |
| W53 | settled 27 Aug 26; D999, D1022, D1023 | MATCHES | engine/medical.ts upchitTrimPlan, giveBack, upchitDeletePlan | new: "down 10–13 Jul, upchit 12 Jul → cut to 10–11 Jul; … the cut row, its upchit deleted, grows back to its first end"; existing engine/medical.test.ts | Trim, delete-when-only-fit-days, and give-back all as ruled. |

## Findings

None. Every claim I tried to make fail held.

## UNCLEAR

None raised as questions. Two worklist doubts were settled by reading the rows and the code:
- W44 (Personal's grading across a shift, not stated on the page): built red (shiftHard), consistent with D778.
- W47 (whether a named man on an open-ended row is checked over the same assumed hour): yes — `win()` uses the same Logic setting; D360's own question text says "the same default the rest of the schedule already uses".

## Doubts (not findings)

- W51: the SANS front edge with a typed RALLY (no in-time line) was not exercised; slotRules reads `seatIntime` (in-time or rally, the earlier) and validate reads `min(e.report, e.step)` from the same body, so they should agree — a test there would settle it.
- W45: an overseas duty moved → Ground (`odGround`) was not tested against a seated sortie; the crew list counts him in (isAway false) and the clash should come from its landed programme row.

## Noticed outside the family (not reviewed)

- An overseas duty raises INPUT_FLY ("… clashes with …"), not LEAVE_FLY, against a sortie — wording only; check whether any ruling wants it said as "overseas".
