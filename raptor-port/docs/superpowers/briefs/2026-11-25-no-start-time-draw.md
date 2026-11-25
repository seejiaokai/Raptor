# What if no start is typed? — the count and the drawing (25 Nov 26)

His question on the end-time guard rail: "What if no start time is indicated. Will it flag the same". As drawn, the rule
flags only a missing END. This note counts what a "no start" rule would catch on the demo week as it ships, and draws
how it would look. Drawn on the real running app (the existing build, which is a few days behind the newest code on
SANS and bell work only, nothing on the schedule's time boxes). Script: `../../mock/2026-11-25-guardrail-wording/draw-no-start.mjs`.

## 1. The count — demo week 13–19 Jul, read from the running app

Every row of every day was read: programme rows, ground rows, every flying line, every AMT and OFT row, every duty desk.
No standby lines (SC, AVALON, BB) and no ALL AVAIL / ALL rows exist in this week as it ships.

**Items with something on them (a person, a name, a remark or an END) but no START:**

| Day | Items | What |
|---|---|---|
| Mon 13 Jul | 1 | Ground Programme: ATTACH, Bruise (shown as Gambit), remark "Keen for any wave", no start, no end |
| Tue 14 Jul | 0 | — |
| Wed 15 Jul | 0 | — |
| Thu 16 Jul | 0 | — |
| Fri 17 Jul | 0 | — |
| Sat 18 Jul | 0 | — |
| Sun 19 Jul | 0 | — |

By kind: flights with crew and no take-off 0; sim boxes 0; duty desks 0; standby lines 0 (none in the week); ground rows 1;
programme rows 0; ALL AVAIL rows 0 (none in the week).

**Completely empty rows (no person, no times): 0 on every day.**

**Which days would become unsignable because of "no start":** only Monday, and only through the ATTACH row. Monday is
already unsignable under the end-only rule as drawn (5 items with a start and no end, below), so in practice the added
rule blocks **no day that was not already blocked**. If the ATTACH row counted, it would add 2 boxes to type on Monday
(its start and its end). Total typing the "no start" rule adds across the week: **2 boxes**, both on an all-day row that
should probably never be asked for times (section 4).

For comparison, what the end-only rule as drawn already flags on this week (a start, no end):
- Mon: OPS SHARING + NAV SYS BRIEF 17:55 (Stiff); DINNER WITH CMD 18:30; CMD ENGAGEMENT @ CREW ROOM (ALL) 21:30; AMT BRIEF 11:00; AMT DEBRIEF 12:30 — 5
- Tue: OPS BRIEFER / EP SUP 05:00 (Dice); FLY W EXT SQN 08:45 (Ipman); AMT BRIEF 14:00; AMT DEBRIEF 15:30 — 4
- Wed: NAV-SYS TRIAL PREP 14:00 (Vegas); AMT BRIEF 11:00; AMT DEBRIEF 12:30 — 3
- Thu: AMT BRIEF 11:00; AMT DEBRIEF 12:30 — 2
- Fri: MASS DEBRIEF + BEER CALL 17:00 — 1
- Sat, Sun: 0

So Monday to Friday are already blocked by the end rule; Saturday and Sunday (one SDO desk each, timed) are clear under both.

**Where "no start" rows really come from — not the demo week, but everyday use:**
- the built-in "Standard" duty block (SDO, SXO, OPS O) is placed with blank START and END on every row; a scheduler puts names on it and often never types times;
- a BB standby line is placed with its shift times blank;
- a new flying line from "+ Line" or "+ Wave" comes up blank — crew are often seated before the times are known;
- an all-day input (Attach and the like) lands as a row with no times.
On a real squadron week those would be the bulk of what a "no start" rule flags.

## 2. The pictures — `../../mock/2026-11-25-guardrail-wording/img/no-start/`

Each has a `-desktop.png` (1536 wide) and a `-phone.png` (his iPhone, 402 wide). "Today" frames are the app as it draws
itself after staging; "proposed" frames add only the red edge (the same edge `draw-g.mjs` drew for a missing end) or the
app's own grey "Blocked:" note. The pink ring and letter mark each place.

Staged on Thursday 16 Jul, through the app's own boxes: wave 1 VL SAT's take-off cleared (landing 14:10 kept); the 1st-wave
SXO desk's START and END cleared (Shaft, shown as Anvil, kept); the first OFT EP-4's START cleared (END 10:30 and its two
crew kept); and the demo's AMT BRIEF and DEBRIEF given ends (11:30, 13:00) so the day holds exactly the three items the
drafted note counts. The app's own reading of the staged day confirmed exactly three: the flight, the sim, the desk.

| Picture | Shows |
|---|---|
| `ns-a-flight-today` / `ns-a-flight-proposed` | (a) VL with four crew seated, take-off empty (a dash), landing 14:10; proposed: the empty take-off box outlined red. Today nothing marks it, and the day's warning list says nothing about VL |
| `ns-b-desk-today` / `ns-b-desk-proposed` | (b) the SXO desk with a name and no START or END; proposed: both boxes outlined red (one item, two boxes) |
| `ns-a2-sim-today` / `ns-a2-sim-proposed` | the third item: OFT EP-4 with two crew and an END, no START; proposed: the START box outlined red |
| `ns-c-sign-refused` | (c) CUR CK pressed, the grey note: "Blocked: 3 items are missing a time, each outlined in red. Type the times, then sign." — tagged **DRAFT: words owed a Fable review** |
| `ns-c2-publish-refused` | the same for Publish day: "Blocked: 3 items are missing a time, each outlined in red. Thursday was not published." — also a DRAFT |
| `ns-d-attach-today` / `ns-d-attach-if-flagged` | Monday as it ships: the ATTACH row for Bruise, no times; "if flagged" shows both its boxes outlined red — the case argued against in section 4 |

The facts each run read off the screen: `img/no-start/facts-no-start.json`.

## 3. The drafted words (DRAFT — owed a fresh Fable review, D2441)

- Sign-off: "Blocked: 3 items are missing a time, each outlined in red. Type the times, then sign."
- Publish: "Blocked: 3 items are missing a time, each outlined in red. Thursday was not published."
"Missing a time" covers a missing start, a missing end or both, so one sentence serves the whole rule.

## 4. Odd things met

1. **An all-day input lands with no times by design.** Monday's ATTACH (Bruise, "Keen for any wave") is an all-day input;
   its row is meant to have no times. Flagging it would ask the scheduler to invent times for a whole-day thing. A
   "no start" rule needs an exception for rows that came from an all-day input — or the rule only applies once something
   else is typed. His puck there already wears a red flag today (seen on the picture), so the row is not silent as it is.
2. **A duty desk with no start is legal today on purpose.** The code says so in so many words ("a duty role with no start
   is legal — many seeded rows carry blank times"), and the built-in Standard block is placed with blank times. A
   "no start" rule would change that: every Standard block would need its times typed before signing.
3. **Standby lines are told to carry no times of their own until they fly** (his D2055, D2072: an SC desk with START and no
   END is left alone, "the empty END box the only sign"; a BB shift is minted with blank times). A rule flagging missing
   times on standby rows would cut against those rulings — they would need to be named as exceptions, or the rule set
   aside for them. The same question already exists for the end-only rule.
4. **A flight with no take-off is invisible to the checks today.** Thursday's VL with four crew and no take-off raised no
   warning at all (the day's six warnings are all about RU and other items). Crew rest, conflicts, OIL and Insights hours
   all ignore it; only a man on whole-day leave or a downchit is flagged (D605). So the red edge would be the first sign
   on screen that the line is incomplete — the strongest case for the "no start" half of the rule.
5. **An empty desk time box draws its dash at the left edge,** not centred like a flight's; with the red edge on, the box
   looks emptier than the flight's. That is how the app draws it today, not something added.
6. **A sim box with crew and an END but no START** is the same story as the flight: no time, no checks.
7. The demo week has no standby lines and no ALL AVAIL rows, so neither could be counted; both would matter on a real week.
