# The warnings' new words — the proposal ([WARN-WORDS-STANDALONE], D2045–D2057)

**Status (15 Nov 26, chat 82): a DRAFT for his look. Nothing is built. No wording here is approved until he says so.**
Written by Fable on his call (D2049). To go to him as a page of before-and-after pictures of the real warning list
(D1625, D2057); the engine changes of the item (D2046, D2053, D2055) wait for his approval of the words (D2057).
**Read sections 3a and 3b with it: each replaces the lines it names** (the cold read's changes; what the pictures showed).

## 1. What the list already gives, and the shape every line takes

The warning list prints each line as **`<callsign(s)> — <the warning's words>`** (the day's list, the red note at the
foot of the screen, the puck's own note). So the words never repeat the man's name where he is the line's one subject.

Every line: **a short label, a colon, the items with their times, then — only where needed — one short sentence of why.**

How each kind of item is written (one way everywhere):

| The item | Written | When the app filled the time in |
|---|---|---|
| a flight, where only which flight matters | `VL BFM (T/O 12:00)` | — |
| a flight in a clash (both ends matter) | `RU (T/O 13:00, landing 14:30)` | `VL BFM (T/O 12:00, landing assumed 13:00)` |
| a ground, programme, duty or sim row | `BRIEFING 12:40–13:00` | — |
| a standby shift | `SC AM 07:00–13:00` | — |
| a request (an input) | `Appointment 12:30–13:30`, `Leave (all day)` | — |
| a brief or debrief window | `RU brief 10:40–13:00`, `VL BFM debrief 14:30–16:30` | `VL BFM debrief 13:00–15:00 (landing assumed)` |

"Assumed" is said for every time the app fills in: a landing nobody typed (T/O + the Logic flight length, D2046) and
the debrief after the last landing (the Logic page's "Debrief after landing"), which today's crew-rest and long-day
lines already call "assumed".

A limit the check reads from the Logic page is said as `needs 120` / `needs 12h` / `limit 7`, so the line says why
it is a problem without the reader knowing the setting.

## 2. Ranger's Friday — his five lines, and what changed from them

The day: VL BFM takes off 12:00, no landing typed · BRIEFING 12:40–13:00 · RU takes off 13:00.
"After" is the list as it will read once the words AND the assumed 60-minute landing are built.

| # | Today (as built) | After |
|---|---|---|
| 1 | RU & BRIEFING clash | Clash: RU (T/O 13:00, landing …) & BRIEFING 12:40–13:00 |
| 2 | *(not raised today: a blank landing counts as the take-off)* | Clash: VL BFM (T/O 12:00, landing assumed 13:00) & BRIEFING 12:40–13:00 |
| 3 | Tight turn VL BFM→ RU: 60 min take-off→next T/O, no landing typed (needs 120 min — threshold 120, dekit+step 30+60) | Tight turn: VL BFM → RU, 0 min (needs 120). VL BFM landing assumed 13:00 (T/O + 1h), RU T/O 13:00 |
| 4 | Not enough time to attend the VL BFM debrief — BRIEFING sits inside 12:00–14:00 (take-off + 2h, no landing typed) | *(goes away: with the landing assumed at 13:00 the debrief is 13:00–15:00 and the BRIEFING ends at 13:00. Where one is raised it reads:)* Misses VL BFM debrief 13:00–15:00 (landing assumed): MEETING 13:30–14:00 |
| 5 | No time for the RU flight brief — BRIEFING sits inside 10:40–13:00 (brief 10:40) | Misses RU brief 10:40–13:00: BRIEFING 12:40–13:00 |
| 6 | 1 person is double turning: Ranger | *(unchanged — D2050)* |

**Where these differ from the five he liked (D2051), each his to take or leave:**
- Line 1: his was `RU (T/O 13:00)`. Mine adds the landing in a clash, so a clash at the landing end of a flight reads
  on its own too ("RU (T/O 13:00, landing 14:30) & MEETING 14:40–15:30"). **Question 1.**
- Line 3: his ended at "(T/O + 1h)". Mine adds ", RU T/O 13:00" so both times of the turn are there (0 min explains
  itself; 45 min would not).
- Line 4: his read "…: RU T/O 13:00". The app never raises a missed debrief against another flight (that is the
  tight turn's job), so the reason is always a ground item, a duty, a sim or a request. To be confirmed at the build.

## 3. Every other warning — today, and proposed

Example values throughout. "Left whole" is a result, not an omission (the writing guide §1a test 10).

### Clashes (red)
| Today | Proposed |
|---|---|
| RU & BRIEFING clash | Clash: RU (T/O 13:00, landing 14:30) & BRIEFING 12:40–13:00 |
| SC AM & OFT 1 clash *(a standby shift against a cockpit, a duty post or a red-list commitment)* | Clash: SC AM 07:00–13:00 & OFT 1 10:00–11:30 |
| Ranger is in two seats on VL BFM at once | Clash: two seats on VL BFM (T/O 12:00) |
| Ranger is on two items called SODB at once | Clash: two items called SODB, 07:45–08:00 & 07:50–08:10 |
| Ranger is on AVALON DUTY (07:00–15:00) and also on OFT 1 (10:00–11:30) | Clash: AVALON DUTY 07:00–15:00 & OFT 1 10:00–11:30 |
| Ranger is standing SC SPARE (SC AM 07:00–13:00) and also on OFT 1 (10:00–11:30) | Clash: SC SPARE (SC AM 07:00–13:00) & OFT 1 10:00–11:30 |
| Appointment clashes with VL BFM — reason: dental | Clash: VL BFM (T/O 12:00, landing 13:30) & Appointment 12:30–13:30. Reason: dental |
| Appointment but tasked — AVALON duty — reason: dental | Clash: AVALON duty 07:00–15:00 & Appointment 12:30–13:30. Reason: dental |

### On standby and also on something else (amber)
| Today | Proposed |
|---|---|
| Ranger is on SC AM (07:00–13:00) and also down for LECTURE | On standby: SC AM 07:00–13:00 & LECTURE 09:00–10:00 |
| Ranger is on SC AM (07:00–13:00) and also down for Meeting *(a request)* | On standby: SC AM 07:00–13:00 & Meeting 09:00–10:00 |
| Ranger reports 06:00 for SC AM — MEETING (06:30–07:00) cuts into the in-time window before the 07:00 start | Misses SC AM in-time 06:00–07:00: MEETING 06:30–07:00 |

### On leave, downchit, away (red) — the labels are his D2009 names
| Today | Proposed |
|---|---|
| Downchit but planned to fly VL BFM — reason: flu | Downchit + planned: VL BFM (T/O 12:00). Reason: flu |
| On leave but planned to fly VL BFM — reason: family | On leave + planned: VL BFM (T/O 12:00). Reason: family |
| Downchit but tasked — AVALON duty — reason: flu | Downchit + planned: AVALON duty 07:00–15:00. Reason: flu |
| On leave but tasked — OFT 1 | On leave + planned: OFT 1 10:00–11:30 |
| ATT C but on AVALON DUTY — medically down — reason: flu | Downchit + planned: AVALON DUTY 07:00–15:00 (ATT C, medically down). Reason: flu |
| Overseas Duty but on AVALON DUTY — overseas | Overseas + planned: AVALON DUTY 07:00–15:00 (Overseas Duty) |
| ATT C but standing SC SPARE — medically down, SC AM — reason: flu | Downchit + planned: SC SPARE on SC AM 07:00–13:00 (ATT C, medically down). Reason: flu |
| *(a row or line with no times yet)* On leave but tasked — this duty row | On leave + planned: this duty row (no times yet) |

Open at the build: a request's own hours are added where it does not cover the whole day
("Downchit 08:00–12:00 + planned: …") — to be drawn once the engine's fields are read.

### Brief and debrief (amber)
| Today | Proposed |
|---|---|
| No time for the RU flight brief — BRIEFING sits inside 10:40–13:00 (brief 10:40) | Misses RU brief 10:40–13:00: BRIEFING 12:40–13:00 |
| Not enough time to attend the VL BFM debrief — MEETING sits inside 14:30–16:30 (land + 2h) | Misses VL BFM debrief 14:30–16:30 (landing + 2h): MEETING 15:00–16:00 |
| …(take-off + 2h, no landing typed) | Misses VL BFM debrief 13:00–15:00 (landing assumed): MEETING 13:30–14:00 |
| No time for the OFT 1 brief — SODB sits inside 09:45–10:00 | Misses OFT 1 brief 09:45–10:00: SODB 09:30–09:50 |
| No time for the OFT 1 debrief — MEETING sits inside 11:30–12:00 | Misses OFT 1 debrief 11:30–12:00: MEETING 11:45–12:30 |
| *(two things in the window)* …BRIEFING, Meeting sits inside… | …: BRIEFING 12:40–13:00, Meeting 11:00–11:30 |

Added: each thing in the window now carries its own times (today it is named only).

### Turns and rest
| Today | Proposed |
|---|---|
| Tight turn VL BFM→RU: 45 min land→next T/O (needs 120 min — threshold 120, dekit+step 30+60) | Tight turn: VL BFM → RU, 45 min (needs 120). VL BFM landing 14:15, RU T/O 15:00 |
| …60 min take-off→next T/O, no landing typed (needs 120 min — …) | Tight turn: VL BFM → RU, 0 min (needs 120). VL BFM landing assumed 13:00 (T/O + 1h), RU T/O 13:00 |
| Crew rest breach — Thu landed 21:30, +2h debrief assumed → ended 23:30 → crew rest clear at 11:30, but told to report 08:40 — only 9h10 rest. | Crew rest: Thu landed 21:30 + 2h debrief (assumed) → ended 23:30 → clear 11:30. Report 08:40: 9h10 rest, needs 12h. |
| Crew rest breach — Thu took off 20:30 with no landing typed, +2h debrief assumed → … | Crew rest: Thu T/O 20:30, landing assumed 21:30 (T/O + 1h) + 2h debrief (assumed) → ended 23:30 → clear 11:30. Report 08:40: 9h10 rest, needs 12h. |
| Crew rest breach — Thu ended 20:00 → crew rest clear at 08:00, but SC AM starts 07:00 — only 11h rest. | Crew rest: Thu ended 20:00 → clear 08:00. SC AM starts 07:00: 11h rest, needs 12h. |
| …but SC AM's in-time is 06:00 — … / …'s rally is 06:00 — … | …SC AM in-time 06:00: 10h rest, needs 12h. / …SC AM rally 06:00: … |
| …but his day starts 07:00 (MEETING) before the 08:40 report — only 7h30 rest. | …Day starts 07:00 (MEETING), before report 08:40: 7h30 rest, needs 12h. |
| …but his day starts 07:00 (MEETING), and he is on a line with no take-off yet — only 7h30 rest. | …Day starts 07:00 (MEETING); his line has no T/O yet: 7h30 rest, needs 12h. |
| …— 1h30 before his Thu duty ends. | …: starts 1h30 before his Thu duty ends. |
| … Late show — he still makes the 12:00 step. | … Late show: still makes the 12:00 step. |
| … Late show cannot save it — the 12:00 step is still before rest clears. | … Late show can't fix it: the 12:00 step is before rest clears. |
| Tight turning — T/O 09:00 puts the 3h report at 06:00, inside 12h. Thu landed 19:30, +2h debrief assumed → ended 21:30 → crew rest clear at 09:30 | Tight crew rest: the usual report (T/O 09:00 − 3h = 06:00) is before clear 09:30. Thu landed 19:30 + 2h debrief (assumed) → ended 21:30 → clear 09:30. |
| Ranger has a long work day: 13h20, 06:00 → 19:20 (last landing 17:20 + 2h debrief assumed) | Long day: 13h20 (limit 12h), 06:00 → 19:20 (last landing 17:20 + 2h debrief assumed) |
| *(D2053, once built)* | Long day: 13h20 (limit 12h), 06:00 → 19:20 (VL BFM landing assumed 17:20 + 2h debrief assumed) |
| Ranger is on the programme 8 days in a row — 7 is the limit, so a break day is due | Days in a row: 8 (limit 7). A break day is due. |
| 1 person is double turning: Ranger | *(unchanged — D2050)* |

Kept on purpose: the crew-rest line's order — yesterday's end → when rest clears → what breaks it → the shortfall —
is his own of 22 Aug 26. Added: "needs 12h" and "(limit 12h)", the Logic page's own figures. "Tight turning" becomes
"Tight crew rest" so it is not read as the same-day "Tight turn" (**Question 2**).

### Who may fly with whom, and in which seat
| Today | Proposed |
|---|---|
| Viper (OCU pilot) with Jinx (OCU WSO) in VL BFM — a crew solo, only allowed under the Basic Course Syllabus | Crew solo: OCU pilot Viper & OCU WSO Jinx on VL BFM (T/O 12:00). Only allowed under the Basic Course Syllabus. |
| OCU pilot Viper with CAT C WSO Jinx — not an authorised combination (VL BFM) | Crew not authorised: OCU pilot Viper & CAT C WSO Jinx on VL BFM (T/O 12:00). An OCU needs an instructor in the other seat. |
| CAT D pilot Viper with CAT C WSO Jinx in VL BFM — CO approval required | CO approval needed: CAT D pilot Viper & CAT C WSO Jinx on VL BFM (T/O 12:00) |
| Tan is riding the rear seat of VL BFM as an incentive passenger — this crew pairing needs approval | Approval needed: incentive passenger in the rear seat of VL BFM (T/O 12:00) |
| OCU in VL BFM with no IP | OCU with no IP: VL BFM (T/O 12:00) |
| IRT in VL BFM with no IR examiner | IRT with no IR examiner: VL BFM (T/O 12:00) |
| IRT remarks on VL BFM with no IR examiner | IRT with no IR examiner: VL BFM (T/O 12:00), from the aircraft's remarks |
| Tan is ground crew — cannot fly a front seat (VL BFM) | Wrong seat: ground crew in the front seat of VL BFM (T/O 12:00) |
| Jinx is a WSO — cannot fly FCP (VL BFM) | Wrong seat: a WSO in FCP on VL BFM (T/O 12:00) |
| Jinx is CAT IW — a WSO category, cannot fly FCP (VL BFM) | Wrong seat: CAT IW (a WSO category) in FCP on VL BFM (T/O 12:00) |
| …cannot fly FCP (SC AM MAIN) / (SC AM SPARE) | …in FCP on SC AM MAIN 07:00–13:00 / SC AM SPARE 07:00–13:00 |
| Jinx is a WSO — cannot take the front seat (OFT 1) | Wrong seat: a WSO in the front seat of OFT 1 10:00–11:30 |
| SC DAY currency needed for SC AM MAIN (07:00–13:00) — Ranger is not current | Not SC DAY current: SC AM MAIN 07:00–13:00 |
| SC NIGHT currency needed for SC PM (19:00–01:00) — Viper, Jinx are not current | Not SC NIGHT current: SC PM 19:00–01:00 |
| Viper is not DAAR current — VL BFM remarks call for day AAR | Not DAAR current: VL BFM (T/O 12:00) remarks call for day AAR |
| Jinx is not cleared to instruct DAAR — Viper is not DAAR current and VL BFM remarks call for day AAR | Jinx can't instruct DAAR: Viper is not DAAR current, and VL BFM (T/O 12:00) remarks call for day AAR |
| Ranger planned for VL BFM — not offering flying today | SANS: not offering flying today. Planned on VL BFM (T/O 12:00) |
| Ranger planned for VL BFM — available 08:00–12:00 only | SANS: available 08:00–12:00 only. Planned on VL BFM (T/O 13:00) |

Added, each read from the check itself: "An OCU needs an instructor in the other seat" (the check clears the pair
when either seat holds an instructor — the Logic page says the same). A sim's and a shift's times.

### A line's own times, and OIL
| Today | Proposed |
|---|---|
| VL BFM takes off and lands at the same time (12:00) — one of the two is wrong; the day still earns from the report and debrief | Times look wrong: VL BFM T/O and landing are both 12:00. The day still earns OIL from the report and debrief. |
| …; the shift still earns from its R or B | …The shift still earns OIL from its R or B. |
| …; a shift with no length earns nobody any OIL until it is fixed | …A shift with no length earns nobody any OIL until it is fixed. |
| …; with no report before it and no debrief after it, the line earns nobody any OIL until it is fixed | …With no report before it and no debrief after it, the line earns nobody any OIL until it is fixed. |
| SC AM MAIN flies but has no END — type it so its crew rest and OIL can be worked out | SC AM MAIN flies but has no END. Type it so its crew rest and OIL can be worked out. |
| SC AM has no usable times — nobody on it earns OIL for this day | SC AM has no usable times, so nobody on it earns OIL for this day |
| There is no leave war period for Jul 26, so no OIL can be earned for this day — create the period on the Leave War | No Leave War period for Jul 26, so no OIL can be earned for this day. Create the period on the Leave War. |
| This day is not published yet, so nobody earns their OIL for it — publish it before the day is out | Not published yet, so nobody earns OIL for this day. Publish it before the day is out. |
| This day was published before the app counted who is behind an ALL AVAIL puck on a duty desk, a sim or an extras line — publish it again to credit them | …or an extras line. Publish it again to credit them. |
| Publish this day again so OIL is earned. The PH was set after the day was published. | *Left whole.* |
| Publish this day again to withdraw the OIL. The PH was removed after the day was published. | *Left whole.* |
| RU: RALLY 09:00 is later than BRIEF 08:40. | *Left whole.* |
| RU: reporting line 2 has no recognised clock. Check the time. | *Left whole.* |

These already read on their own (they are about the day or a named line); only the dash that joined two thoughts
goes (the writing guide §1b test 2). "One of the two is wrong" is cut as said twice ("Times look wrong").

## 4. The pending list's new line (D2054)
Where a Logic change makes a published day pending through its OIL:
- OIL unchanged: `RU crew: start 10:00 → 10:30 (Default rally changed). Still a full day of OIL.`
- OIL changed: `RU crew: start 10:00 → 13:30 (Default rally changed). OIL: full day → half day.`
To be drawn on the real pending list beside today's line (pictures of today:
`raptor-port/docs/img/handpass/2026-11-14-rules-check-batch2/w2/s12B-p9/s12B-pendinglist-p.png`, `…/s12B-d9/…-d.png`).

## 5. The Logic page's note under the changed-settings strip (D2052, meaning unchanged)
**Today:** "**2 settings changed from the squadron standard.** The schedule is checked against them now. A published
day keeps the settings it was published under, and the OIL they gave it, until it is published again. If a change to
Default rally, Debrief after landing or Full day of OIL would change that OIL, the day reads pending." — and, where
it applies, " A changed late cut-off moves the LATE marks at once, on published days too." / " Only an admin can
change them."

**Proposed:** "**2 settings changed from the squadron standard.** They are in use now. A published day does not
change until you publish it again: it keeps its old settings and its OIL. If the new Default rally, Debrief after
landing or Full day of OIL would change a published day's OIL, that day reads pending." — the late cut-off and admin
sentences left whole.

Its five facts, each still there: in use now · a published day keeps its settings · and its OIL · until published
again · it reads pending where one of the three OIL settings would change its OIL. (An earlier cold read found that
"reads pending" alone was taken for the OIL being unsettled — so "does not change until you publish it again" comes
first.)

## 6. Questions for him (at most four)
1. **A flight in a clash: T/O only, or T/O and landing?** Recommended: both ("RU (T/O 13:00, landing 14:30)"), so a
   clash at the landing end reads on its own. Costs about three words on clash lines only.
2. **"Tight turning" (tomorrow's crew rest would be short at the usual report time) renamed "Tight crew rest"?**
   Recommended: yes — today it reads like the same-day "Tight turn".
3. **Should the Logic page's names for these checks follow the new labels?** Today it calls a clash "Conflict — two
   events at once" and a missed brief "No time for the flight brief". Recommended: yes, in the same build, so one
   thing has one name.
4. **The crew-rest line keeps his own order of 22 Aug 26 (yesterday's end → clear → what breaks it → the shortfall),
   with "needs 12h" added. Keep that order?** Recommended: yes.

## 7. For the build (not for him)
- Where the words are written: `raptor-port/src/engine/validate.ts` (the `add(` calls, `noBriefSays`, `debriefSays`,
  `simBriefSays`, `simDebriefSays`, `FLT_NO_LEN_SAYS`, `runSays`, the crew-rest `tail` / `crMsg`), `reporting.ts`
  (left whole), the Logic note `src/ui/LogicPage.tsx offNote`, the checks' names table in `validate.ts`
  (`DOUBLE_BOOK:'Conflict — two events at once'` …) if question 3 is yes.
- **Hidden warnings are found by their words** (`add`'s dedup key and `warnhide.ts`): a clash that now carries its
  times would come back from hiding when a time changes — against D2001 ("a hidden clash stays hidden while the same
  man is on the same two items, whatever their times"). The build must key a clash's hide on its two items, not its
  words, and say what happens to hides already stored (demo data, D56).
- The same sentences are read by the ALL AVAIL window (`crowdClashes`), the previous day's crew-rest mark (`markTrace`),
  the next-week preview (`fltNoLenMsg`), the foot-of-screen note and the pucks' own notes: each is in the roll-call.
- `parity.test.ts` compares the warnings with the original app's; check first whether the original's 728 tests read
  any of these words (D2045's open point), and how today's already-changed lines are let through.
- The brief / debrief lines need each hit's own times (today only its name is gathered).
- Ranger's Friday is staged by `raptor-port/scripts/handpass/rcb2/rcb2-w3-r1.mjs` (chat 81's walk); the picture of
  today is `raptor-port/docs/img/handpass/2026-11-14-rules-check-batch2/w3/r1-p1/r1-b-turn-blank-board-p.png`.
- The writing guide's cold read (§1a test 9) of every new wording by a fresh reader: done 15 Nov 26 — section 3a,
  the reader's result in `raptor-port/docs/superpowers/briefs/2026-11-15-warn-words-cold-read.md`.

## 3a. Changed after the cold read (15 Nov 26) — each line here REPLACES the proposed line it names in sections 2–5

A fresh reader read the 69 proposed lines alone (26 clear, 35 clear with a small point, 11 unclear — most of the 11
were table fragments, not wordings). What changed, old proposed → new proposed:

| Was proposed | Now proposed | Why |
|---|---|---|
| On standby: SC AM 07:00–13:00 & LECTURE 09:00–10:00 | Overlaps standby: LECTURE 09:00–10:00 & SC AM 07:00–13:00 | the label did not say what was wrong |
| On standby: SC AM 07:00–13:00 & Meeting 09:00–10:00 | Overlaps standby: Meeting 09:00–10:00 & SC AM 07:00–13:00 | the same |
| Misses SC AM in-time 06:00–07:00: MEETING 06:30–07:00 | Busy before SC AM: MEETING 06:30–07:00 is between his 06:00 in-time and the 07:00 start | "in-time" is a time, not a window |
| Clash: two seats on VL BFM (T/O 12:00) | Clash: in two seats on VL BFM (T/O 12:00) at once | "two seats" could be read two ways |
| Clash: two items called SODB, 07:45–08:00 & 07:50–08:10 | Clash: two items both called SODB, 07:45–08:00 & 07:50–08:10 | the name is not the problem, the overlap is |
| Clash: AVALON duty 07:00–15:00 & Appointment 12:30–13:30. Reason: dental | Clash: AVALON DUTY 07:00–15:00 & Appointment 12:30–13:30. Reason: dental | one spelling of the desk |
| Downchit + planned: AVALON duty 07:00–15:00. Reason: flu | Downchit + planned: AVALON DUTY 07:00–15:00. Reason: flu | the same |
| Downchit + planned: AVALON DUTY 07:00–15:00 (ATT C, medically down). Reason: flu | Downchit + planned: AVALON DUTY 07:00–15:00 (ATT C). Reason: flu | "medically down" repeated "Downchit" |
| Overseas + planned: AVALON DUTY 07:00–15:00 (Overseas Duty) | Overseas + planned: AVALON DUTY 07:00–15:00 | the bracket repeated the label |
| Downchit + planned: SC SPARE on SC AM 07:00–13:00 (ATT C, medically down). Reason: flu | Downchit + planned: SC SPARE on SC AM 07:00–13:00 (ATT C). Reason: flu | as above |
| Misses VL BFM debrief 14:30–16:30 (landing + 2h): MEETING 15:00–16:00 | Misses VL BFM debrief 14:30–16:30: MEETING 15:00–16:00 | the bracket is kept for "(landing assumed)" only |
| Crew rest: Thu ended 20:00 → clear 08:00. SC AM starts 07:00: 11h rest, needs 12h. | Crew rest: Thu duty ended 20:00 → clear 08:00. SC AM starts 07:00: 11h rest, needs 12h. | "ended" did not say what ended |
| …Day starts 07:00 (MEETING); his line has no T/O yet: 7h30 rest, needs 12h. | …Day starts 07:00 (MEETING): 7h30 rest, needs 12h. His flight has no T/O yet. | the colon tied the rest to the missing T/O |
| …: starts 1h30 before his Thu duty ends. | …Report 22:30: 1h30 before his Thu duty ends. | no subject |
| … Late show can't fix it: the 12:00 step is before rest clears. | … Late show doesn't help: the 12:00 step is before rest clears. | "it" was unnamed |
| IRT with no IR examiner: VL BFM (T/O 12:00), from the aircraft's remarks | IRT with no IR examiner: VL BFM (T/O 12:00), IRT in an aircraft's remarks | unclear what came from the remarks |
| Wrong seat: a WSO in FCP on VL BFM (T/O 12:00) | Wrong seat: a WSO in the front seat of VL BFM (T/O 12:00) | one name for the seat |
| Wrong seat: CAT IW (a WSO category) in FCP on VL BFM (T/O 12:00) | Wrong seat: CAT IW (a WSO category) in the front seat of VL BFM (T/O 12:00) | the same |
| …in FCP on SC AM MAIN 07:00–13:00 / SC AM SPARE 07:00–13:00 | …in the front seat of SC AM MAIN 07:00–13:00 / SC AM SPARE 07:00–13:00 | the same |
| Not DAAR current: VL BFM (T/O 12:00) remarks call for day AAR | Not DAAR current: VL BFM (T/O 12:00) remarks call for it | DAAR and "day AAR" side by side |
| Jinx can't instruct DAAR: Viper is not DAAR current, and VL BFM (T/O 12:00) remarks call for day AAR | Jinx is not cleared to instruct DAAR. Viper is not DAAR current and VL BFM (T/O 12:00) remarks call for it. | the colon made Viper's currency the reason Jinx can't instruct |
| *(pending list)* RU crew: start 10:00 → 10:30 (Default rally changed). Still a full day of OIL. | RU crew: OIL counts from 10:30, not 10:00 (Default rally changed). Still a full day of OIL. | "start" of what? |
| *(pending list)* RU crew: start 10:00 → 13:30 (Default rally changed). OIL: full day → half day. | RU crew: OIL counts from 13:30, not 10:00 (Default rally changed). OIL: full day → half day. | the same |
| *(Logic note)* …that day reads pending. | …that day shows as pending. | "reads pending" read oddly |

**Considered and left, with the reader's point:** "needs 120" with no unit (his liked line); the crew-rest line's
arrows and its order, answer last (his own order of 22 Aug 26 — question 4); "Crew solo", "Late show", "END", "R or
B", "ATT C" (the squadron's and the app's own words); the same case showing as both "Clash" and "Misses … brief"
(two checks raise it today, as on Ranger's Friday); "Approval needed" naming nobody (today's line names nobody
either); "assumed" twice in the long-day bracket (two assumed times); the OIL lines with no action (today's have none).

## 3b. Changed when the pictures were made (15 Nov 26) — each point here REPLACES what sections 2–7 say of it

**Ranger's Friday, confirmed in the app.** With a 13:00 landing typed on VL BFM the real list gives exactly section 2's
rows, in this order: the VL BFM clash, the RU clash, the tight turn (0 min), the missed RU brief, the double-turn line —
"5 issues · 2 warnings"; the missed-debrief line goes away. RU has a landing typed in the staging (14:00), so line 1
reads `Clash: RU (T/O 13:00, landing 14:00) & BRIEFING 12:40–13:00`.

**Every row on a picture is a whole line.** The table cells of section 3 that start with "…" or hold " / " were
written out as whole lines for the pictures (the list of them, today and proposed:
`raptor-port/docs/mock/2026-11-15-warn-words/redraw-2.md`). One pair shows the engine change, not only the words: a
flight with no landing typed, the night before — today "Thu took off 20:30 with no landing typed, +2h debrief assumed →
ended 22:30 → crew rest clear at 10:30 … only 10h10 rest", after "Thu T/O 20:30, landing assumed 21:30 (T/O + 1h) + 2h
debrief (assumed) → ended 23:30 → clear 11:30. Report 08:40: 9h10 rest, needs 12h."

**The pending list's line (section 4) — inside the man's own row, the answer first.** The real list already shows the
two worked times ("Ranger · OIL as published, under today's values: full day · 05:00–18:00 → full day · 05:10–18:00"),
so a separate "RU crew: …" row would say the times twice. Now proposed: one line added under that row's times —
- OIL unchanged: `Still a full day of OIL. It counts from 05:10, not 05:00.`
- OIL changed: `OIL changes: full day → half day. It counts from 13:30, not 10:00.`
"(Default rally changed)" is dropped: the list's own first row names the Logic value that changed.

**Question 3 is about the checks' short names** (the engine's table of names, shown where warnings are counted by
kind — Insights' warnings by type, the view-only schedule's list — and on the Logic page where it prints them). The
names proposed, to follow the new labels:

| Today's name | Proposed name |
|---|---|
| Conflict — two events at once | Clash |
| Personal input clash | Clash with a request |
| No time for the flight brief | Misses flight brief |
| No time for the flight debrief | Misses flight debrief |
| No time for the sim brief | Misses sim brief |
| No time for the sim debrief | Misses sim debrief |
| Tight turning — crew rest | Tight crew rest |
| Long work day | Long day |
| No break day — too many days in a row | Days in a row |
| Qualification — illegal seat | Wrong seat |
| Illegal aircrew combination | Crew not authorised |
| Crew combination — CO approval required | CO approval needed |
| OCU without IP | OCU with no IP |
| IRT without an IR examiner | IRT with no IR examiner |
| On shift — also down for a ground event | Overlaps standby |
| In-time window cut — busy between report and shift start | Busy before a standby shift |

**For the build (adds to section 7):**
- A time range never breaks across lines: at phone width "BRIEFING 12:40–" / "13:00" broke after the dash. Each
  `HH:MM–HH:MM` is kept on one line where the list is drawn (the proposed pictures are drawn so).
- No proposed line reaches four lines on a phone (402 wide); the longest are three, as today's are.
- The pictures, their manifest and the scripts that made them: `raptor-port/docs/mock/2026-11-15-warn-words/`
  (`manifest.json` says for each picture whether it is real or drawn, and its rows). The family pictures are example
  rows set onto Monday's real list; the colours the drawer chose where the proposal named none: the late-show crew-rest
  lines red (the engine raises every crew-rest line red), "flies but has no END" amber, the two reporting-time lines red.

## 3c. His answer on the clash lines (D2058, 15 Nov 26) — REPLACES question 1 and every clash line between a flight and another item

He asked what causes a clash between flights and what causes a tight turn. What the app does today (read in the
engine): two flights clash only where their take-off-to-landing times overlap; a gap from one landing to the next
take-off shorter than the larger of the Logic "Tight turn threshold" and "Dekit after landing" + "Step before
take-off" is the amber tight turn; a flight against anything else clashes where the item falls inside the hours the
flight keeps the man busy — take-off less the step, to landing plus the dekit.

So "Clash: RU (T/O 13:00, landing 14:00) & BRIEFING 12:40–13:00" did not say why: the reason is the step at 12:00.
His ruling: the line shows the end of the flight that causes the clash, the times following the Logic page's step and
dekit settings.

| Where the other item falls | The line |
|---|---|
| only in the step before take-off | Clash: RU (step 12:00, T/O 13:00) & BRIEFING 12:40–13:00 |
| only in the dekit after landing | Clash: VL BFM (landing 13:00, dekit to 13:30) & MEETING 13:10–14:00 |
| during the flight itself | Clash: VL BFM (T/O 12:00, landing assumed 13:00) & BRIEFING 12:40–13:00 *(as drawn)* |

Open for the build, the agent's to settle and show him: an item that spans both the step and the flight (shown with
the step, since that is where it starts), an assumed landing with a dekit ("landing assumed 13:00, dekit to 13:30"),
a clash between two flights (T/O and landing of both, as drawn), and the same shape for a request against a flight.
**Not drawn yet:** the page's clash rows and Ranger's Friday row 2 still show T/O and landing — redraw
(`b-families.mjs`, `a-friday.mjs` in the mock folder) and republish the page before the build.
