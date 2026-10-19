# [STANDBY-FLIES] — red team of the plan (19 Oct 26)

A fresh, blind read of D1042–D1044 and his follow-up of 19 Oct 26 ("a spare in another situation is activated, therefore
no B or R, but Flies is ticked so that OIL and crew rest is a safeguard"), against the rulings around them (D15, D24,
D516, D591, D592, D606, D1035–D1041) and the engine as it stands on `claude/rally-box-changes`. Read-only; nothing built.

## 1. The rulings as I read them

1. An SC, AVALON or BB line that flies counts as a flight: the day's flying count, Insights' flying load, OIL by default, every warning a flying line gets (D1042).
2. The app knows by a "Flies" tick per row: typing the line's B or R ticks it by itself; a row activated later is ticked by hand (D1043).
3. B or R typed makes every row of that line count, SPARE included, on the line's planned START and END; no take-off and landing of its own (D1044).
4. For a SPARE the point is a safeguard: its crew rest and its OIL — including a SPARE activated with no B or R, ticked by hand (his follow-up).
5. Still open: whether a hand untick on a line with B or R typed stays unticked (D1044 left it for the build's picture).

## 2. Holes and risks

**H1. A rally typed for a line that only stands by turns it into a flight — the biggest risk.** The R box reached SC, AVALON
and BB only today, so every line "looks the same" (D1036, D1040), and D1041 said there it is shown, printed and exported only.
D1044 now makes the same box mean "flies". Case: a Saturday, AVALON NIGHT 19:00–07:00, R 18:30 typed so the standby crew
know when to be in. Nobody flies. The app would count four AVALON jets in the day's figure, give all four men (MAIN and SPARE)
a full day of OIL by default (12h30 > the full-day threshold), raise a long-day note on each (12h30 > 12h), and start crew
rest at 07:00 Sunday, so any of them on a Sunday line reporting before 19:00 goes red. A scheduler cannot see why from the
R box alone. **Answer:** keep his rule (B or R ticks), but make the tick visible on every row and let a hand untick stick
(Q1); and the R box's hint on standby lines should say that a time there marks the line as flying.

**H2. D1041 is overturned, and the rally branch builds the opposite.** `claude/rally-box-changes` (not merged) builds "R on SC
SPARE, AVALON, BB = shown only, counts for nothing" (D1041), with tests (RB8–RB10), the Logic page's SC line and
engine-rules saying so. D1042–D1044 are later and win (D90). **Answer:** merge the rally branch as built (it is correct
until this job lands); this job then rewrites those homes and tests in the same change and marks D1041 narrowed (D201).

**H3. "Every warning" plus START/END read as take-off/landing brings back the padded-shift bug.** A flying line is padded:
nominal report 3h before take-off, step 1h, dekit 30 min, debrief 2h. Treat SC AM 07:00–13:00 that way and its day is
04:00–15:00; SC PM 13:00–19:00 reports 10:00 — the two abutting shifts overlap again, the very fault fixed on 8 Sep 26
("two clean abutting shifts as one fifteen-hour day"). The brief and debrief windows would also fire against a "take-off" at
07:00 that is only a shift start. **Answer:** a flying standby row keeps its shift window: the day starts at the earlier of B,
R and START and ends at END, no pads; it gets the flying line's checks that need no take-off (crew rest, long day, clashes
with other events, availability, currency, seats, SANS, work hours, OIL) and the existing SC in-time advisory widened to
all its rows; no brief or debrief windows (Q3).

**H4. The day's flying count and Insights double count.** Today SC AM and SC PM are "the same jets handed over" and spares
are excluded (the day badge reads "4 X 4 / 2"). If every ticked row is a sortie, SC AM with R typed (2 MAIN + 2 SPARE) adds
four jets for two that flew; with PM too, eight. Insights' sortie total and each spare's personal sortie count rise the same
way. **Answer:** his purpose for a SPARE is crew rest and OIL, so recommend: a SPARE ticked only because B or R was typed
gets crew rest, OIL and the warnings but is not a jet or a sortie; a SPARE ticked by hand (activated) is (Q2).

**H5. A rolling spare that did not go.** SC AM, R 06:30, spare Viper did not launch. He keeps crew rest from 13:00, OIL for the
shift and, under H4 without the fix, a sortie. If the day is published, removing it is an amendment. **Answer:** a hand untick
per row that stays (Q1); the default leans to the safeguard, as he wants.

**H6. A ticked SPARE loses "spares stay free".** Today a spare against his own sortie, sim or duty raises nothing (31 Aug 26),
and AVALON allows local leave, OIL, childcare or a course on a standby seat. Once ticked he is a flyer: Viper on SC AM SPARE
(R typed) and a 10:00 sim goes hard red; an AVALON spare on local leave becomes LEAVE_FLY. Correct if he really goes; noise
if he only stood by. **Answer:** this is the intended safeguard; the untick (Q1) is the way out. Say it on the picture.

**H7. SC's B is already an in-time, and AVALON/BB's B means nothing yet.** An SC MAIN given B 05:30 for an early report but
not flying becomes a flight. D606 says a filled SC B is rare and usually means flying, so the default is fair; the untick
covers the rest. On AVALON and BB, B has never been read (24 Aug 26). **Answer (my call):** on every flying standby row B and R
both mean "report time", the earlier one starting the day — one meaning across the three kinds; it replaces D606 reading (3)
(SPARE earns from the written start only) for a ticked SPARE.

**H8. SC MAIN barely changes.** It already earns OIL by default (D15), already has crew rest, long day, clashes and work
hours. For it the tick adds only the flying count and Insights' sorties. The real change is SC SPARE, AVALON and BB.
Worth saying to him so the picture focuses on spares.

**H9. Duty desks.** The AVALON and BB desks (SXO, OPS O, RUNNER, LOG CELL) stay exempt and earn nothing by default (D15, D24);
the SC desk is unchanged. **Answer:** the tick lives on jet rows only; no desk gets one.

**H10. BB with no hours.** BB is minted with blank START/END. A BB line with R typed and no hours "flies" with no window:
it counts but earns no OIL and starts no crew rest. **Answer:** count it, and raise an amber line in the warning list ("BB flies
but has no start or end — crew rest and OIL need them"); the same family as [ROW-NO-TIME-MARK].

**H11. Published day, after the fact.** Activation usually happens on the day, after publishing. A hand tick is then a pending
change, an amendment number goes up, and OIL moves only when it is republished (D592 (4), D606 (6)). That is consistent, but it
is recording what happened, which is the unbuilt End-of-Day job's work ([EOD]). **Answer:** an amendment, like any change, for
now; note it on [EOD].

**H12. What the tick is stored as.** If typing B also writes a tick, undo needs two steps, clearing B leaves a stale tick, and
templates copy it. **Answer (my call):** store only a hand override per row (on / off / none); "flies" = the override, else
"B or R typed on the line". Then undoing B undoes the tick, clearing B clears it, the MAIN/SPARE flip carries the override
with the row, and a day template or saved plan copies B and R as it does today but drops the hand overrides (an activation is a
one-off). The override goes through the ordinary change path, so it marks pending, records history and rides the next amendment.

**H13. Where it shows.** Per row, beside the MAIN/SPARE badge, on the board and the week, phone and desktop; read-only for a
member and on View-only Sched, the next-week peek, the export and the PDF; the warning-ring rules for exempt lines
(`html.ts`) must follow (a flying row rings for every warning, not only its standby ones). Picture first (D853).

## 3. Questions only he can answer

**Q1. If you untick a row on a line with a B or R typed, should it stay unticked?** Example: Saturday SC AM 07:00–13:00, R 06:30.
MAIN Ranger and Saber fly; SPARE Viper never goes. You untick Viper: his crew rest and OIL from that shift go, the rest of the
line still flies. *Recommended: yes, your untick stays until you tick it again.*

**Q2. Does a SPARE count as a jet in the day's flying count and Insights?** Example: the same SC AM with R typed: two MAIN, two
SPARE. *Recommended: the day reads 2 jets, not 4 — a SPARE ticked only because a time was typed gets its crew rest and OIL
but is not counted as a jet or a sortie; a SPARE you tick by hand (activated) is counted.*

**Q3. Does a flying standby line's day end at its END, or at END plus the debrief?** Example: AVALON 19:00–07:00, R 18:30. Ending at
END: crew rest runs from 07:00. With the debrief added, from 09:00, and SC AM and SC PM would overlap again.
*Recommended: at END, no padding — it is a planned shift.*

**Q4. Is a rally ever typed on SC, AVALON or BB for a line that will NOT fly?** Example: AVALON R 18:30 so the night crew know when
to come in. If yes, every such night becomes a flight unless unticked. *Recommended: if it happens often, only B (or your hand
tick) marks AVALON and BB as flying, and R stays a time only there; if rarely, keep your rule and untick.*

## 4. The suggested design (plain words)

Each MAIN and SPARE row on SC, AVALON and BB gets a small "Flies" tick beside its MAIN/SPARE badge. Typing the line's B or R
ticks every row on it at once; clearing them unticks again. You can tick a row yourself — an activated spare with no time
typed — or untick one that did not go, and your choice stays. Members see the tick but cannot change it; it prints and exports.

A ticked row counts as flying. Its day runs from the earlier of B, R and START to END, no extra padding. It gets crew rest,
the long-day note, clashes with anything else he is on, availability, currency and seat checks, work hours in Insights, and
OIL by default on a weekend or holiday (the OIL Earn switch can still turn it off). A MAIN row counts as a jet in the day's
figure and as a sortie in Insights; a SPARE counts only if you ticked it yourself.

An unticked row stays standby exactly as today. Duty desks never get the tick. On a published day a tick or untick is a
change like any other: it rides the next amendment, and OIL moves when you publish it.

## 5. Tier and size

**Tier: FULL** — OIL, crew rest and every warning, Insights, the published record and amendments, saved data (a new per-row value).
**Size: large** — about the size of the in-time OIL job: events, checks, OIL, Insights, the day badge, the crew list's carve-outs,
the warning rings, one new control drawn in about six places, the amendment record, the data documents, D1041's homes rewritten,
and tests. A picture and his four answers first.
