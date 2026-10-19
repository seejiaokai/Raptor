# [STANDBY-FLIES] — Walker C's report (19 Oct 26)

Share: the rules and the chain, desktop 1440 by mouse. Scenarios 2, 6, 7, 12, 13, 17, 18, 19; break tests 7 and 8; the
designer's "Most likely missing" list. Served build `http://localhost:4322/`, bundle `index-BTbomYbk.js` (printed first by
every script). Scripts: `raptor-port/scripts/handpass/sf-C-*.mjs` (driver `sf-C-lib.mjs`; run log `sf-C-results.log`).
Pictures: `raptor-port/docs/img/handpass/2026-10-19-standby-flies/walk/C/` (named below; I opened each one cited).
Every script is a fresh browser context (a fresh demo week); no set-up used `fillSlot` — seats were filled by the arm-and-pick
route, rows and ticks by the real controls; the one exception is the SC DAY tick taken off two men on the Quals page's own
control (scenario 19). Day 5 = Sat 18 Jul, day 6 = Sun 19 Jul, day 4 = Fri 17 Jul. The browser's error list stayed empty in
every script. Not walked at all: any phone run (brief gave me desktop only), 12(d) the public-holiday weekday (see the end).

## Faults found (3 FAIL)

**F1 — the changes window's "To go out" tab does not say what a hand tick changed (published Saturday).**
Steps: Pub Sat with SC AM, Saber MAIN, Reaper SPARE; press Reaper's dashed FLIES; open the "1 pending" button (or History,
"To go out · AL1" tab). Seen: `SC · #3 remarks` with `earlier (no remarks) · SPARE · SPARE → (no remarks) · SPARE · SPARE` —
before and after read the same; the word "Flies" is not there. The "All changes" tab of the same window does name it
(`Flying · SC AM · 3 … #3 stores — Standing by → Flies`), although it calls the field "stores". A scheduler deciding whether
to publish the amendment sees a "remarks" change with nothing different. Pictures: `C-A-2-pending-window.png` (To go out),
`C-A2-1-all-changes.png` (All changes). The Undo button's hover says only "Undo — a change to the schedule".

**F2 — stale words about standby lines survive on three screens.** (a) The week's heading tag on AVALON and BB reads
"standalone · availability, currency and seat checks only … nothing else"; SC's reads "A SPARE is checked for availability, SC
currency, a pilots-only front seat and not holding another SC seat in the same hours — nothing else" — untrue for a row that
flies (it gets crew rest, long day, clashes). The same AVALON tag is drawn in the next-week peek. (b) The Logic page's
Standby section: "A flying line still earns its OIL; a standby shift earns none." (D1042 says a flying standby row earns OIL
by default), and the AVALON note "Every line — MAIN or SPARE — is only checked for overseas / medically down, SC NIGHT
currency, …" has no "unless it flies" (the SC note beside it does). The Logic page's added "A standby row that flies" note
and the advisory note are correct. Pictures: `C-W-1-week-waves.png`, `C-W-3-logic.png`, `C-P-1-peek-monday.png`.
(The + Wave picker itself has no notes: it lists only SC, AVALON, BB — `C-W2-1-board-wave-picker.png`.)

**F3 — tapping the amber BB warning does not land on the START box.** Steps: BB shift with no times, tick a row by hand (or
type R only); tap "BB SHIFT flies but has no START or END …" in the warning list. Seen: the board scrolls to the BB shift and
rings the whole shift in blue and rings the warning line; the START box is neither focused nor ringed
(`document.activeElement` stays the page body). The brief says the tap lands on START. Picture: `C-M-2-bb-tap-lands.png`.

## Scenario 2 — AVALON overnight that flies (Pub Sat; Sunday line 09:00 with Ace)
| Step | Expected | Seen | V | Picture |
|---|---|---|---|---|
| Set-up: AVALON NIGHT 19:00–07:00, Saber + Ranger MAIN, Drifter + Ace SPARE; Sunday flying line 09:00 with Ace; Pub Sat | Ace clean on Sunday while AVALON stands by | Sunday list: only the "not published" note; Sat published ORIG | PASS | C-2-01-sunday-before |
| Standing by, published | no AVALON term, chips dashed | badge "0 / 2"; four dashed chips (buttons) | RECORD | C-2-02-pub-sat |
| Type AVALON R 18:30 | four lit, badge term, long-day notes | four "✓ FLIES" (not buttons); badge "4"; four notes "long work day: 12h30, 18:30 → 07:00"; 1 pending | PASS | C-2-03-R-typed |
| Sign-offs after the change | fall; publish locked | four sign-offs empty, "Publish AL1" locked | PASS | C-2-03-R-typed |
| Changes window | change named in words | "AV · rally  18:30" listed; 1 change | RECORD | C-2-04-changes |
| Undo / Redo / reload | follow the R each time | Undo: chips dashed, pending gone; Redo: four lit, 1 pending; reload: same | PASS | C-2-04b-after-reload |
| OIL Earn | all four ON by default, full day | AV ON; Saber, Ranger, Drifter, Ace each ON / FO (full day) | PASS | C-2-05-oil-earn |
| Sunday: Ace's seat | red crew rest, AVALON's 07:00 end, no debrief added | puck red; "Ace — Crew rest breach — Saturday ended 07:00 → crew rest clear at 19:00, but told to report 06:40 — 0h20 before his Sunday duty ends." Rest runs from 07:00 (no debrief). The sentence says "Saturday", not AVALON, and its tail "before his Sunday duty ends" reads oddly (same wording on the Monday case below) | PASS (wording RECORD) | C-2-06-sunday-ace |
| Clear R | everything back; Ace clean | chips dashed, badge "0 / 2", "No conflicts flagged"; nothing waiting to go out; OIL: AV off, four off; Sunday: Ace clean | PASS | C-2-07-R-cleared |
| Retype R, Publish AL1 → Leave War OIL tracker | four credited | Saber, Ranger, Drifter, Ace each "+1 18 Jul AUTO Weekend/PH FLT · 18:30–23:59" (hours after midnight earn the next day nothing) | PASS | C-2-08-tracker |
| Clear R, Publish AL2 → tracker | four gone | the four credits gone (only the SDO desk's remains) | PASS | C-2-09-tracker-after-clear |
| Weekday (Fri), AVALON R 18:30, unpublished | same, no OIL | four lit, badge "4", long-day notes; no OIL Earn button on a weekday board | PASS | C-2b-02-weekday-board, C-2b-01-weekday-oil |
| Sunday AVALON R 18:30 into next week's Monday | Monday crew rest | Sunday: four lit, 12h30 notes. After loading next week: "Ranger — Crew rest breach — Sunday ended 07:00 → crew rest clear at 19:00, but told to report 05:40 — 1h20 before his Monday duty ends." — the AVALON tail crosses the week | PASS | C-2b-03-sunday-avalon, C-2b-04-next-week-monday |

## Scenario 6 — a man on a flying SPARE and on other seats in the same hours (Fri; Torch stands in for "Viper")
| Step | Expected | Seen | V | Picture |
|---|---|---|---|---|
| Torch on SC AM SPARE, a 10:00–10:45 sim, an 11:00–12:00 ground item; standing by | nothing warns for the spare | nothing for the spare/sim clash (only his own sim-debrief note vs the ground item, and a Thursday crew rest on another man) | PASS | C-6-01-standing-by |
| Type SC AM R 06:30 | hard clashes for Torch; puck red | "SC AM & Sim EP-5 clash", "Torch is on SC AM … and also down for AIRCREW ADMIN"; pucks red on the spare row, the sim and the ground item ("Conflict (two events at once)"). Whole shift flies, so the shift-mate Nomad (overseas) gets "OD but tasked — SC AM" | PASS | C-6-02-R-typed |
| Palette, empty 09:00–10:30 sim seat armed | Torch barred with reason | Torch: "already on SC AM 07:00–13:00" (barred) | PASS | C-6-03-palette |
| R cleared; tick Torch's chip by hand instead | clashes for Torch only | clashes for Torch; Nomad keeps his standing wording "OD but standing SC SPARE", not "tasked" | PASS | C-6-04-hand-tick |
| + Block menu / an SC desk | RECORD | menu: Standard, SC Shift (SC desk), AVALON (AVALON desk). Torch on the SC desk (SXO AM 07:00–13:00) while ticked: "SC AM & SXO AM duty clash" — a hard clash | RECORD | C-6-05-add-block-menu, C-6-05b-sc-desk |
| Torch SC AM SPARE (R 06:30) + SC PM MAIN (R 13:00) | no clash at 13:00; long day 06:30 → 19:00 | no PM clash; "Torch has a long work day: 12h30, 06:30 → 19:00" | PASS | C-6-06-am-pm-abut |

## Scenario 7 — absences against a flying and a standing-by AVALON SPARE (Ranger, filed by `us`/`us` through the Inputs window)
| Step | Expected | Seen | V | Picture |
|---|---|---|---|---|
| Local leave filed for Sat (member) | saved | saved; toast "Ranger planned" | PASS | C-7-LL-1-member-list |
| AVALON standing by | no warning (standby allowance) | none on his row or puck | PASS | C-7-LL-2-standing |
| Type AVALON R | leave-on-flying-seat warning on row, list, puck | list: "Ranger — On leave but tasked — AV NIGHT — reason: SF walk LL"; puck red | PASS | C-7-LL-3-flying |
| Clear R | warning goes | gone | PASS | C-7-LL-4-cleared |
| Overseas leave: standing / flying / cleared | RECORD | standing: "OL but on AVALON NIGHT — overseas" (already warns); flying: "On leave but tasked — AV NIGHT"; cleared: back to "OL but on…" | RECORD | C-7-OL-2-standing, -3-flying, -4-cleared |
| Medical (ATT C): standing / flying / cleared | RECORD | standing: "ATT C but on AVALON NIGHT — medically down"; flying: "Downchit but tasked — AV NIGHT"; cleared: back | RECORD | C-7-ATTC-2-standing, -3-flying, -4-cleared |
| Reverse: R typed first, then the member files local leave | RECORD what the member and scheduler are told | member: toast "Ranger planned", list row tagged LATE, nothing about the clash; his Inputs calendar bar "Ranger · LL" and the day's window show no warning; scheduler: "On leave but tasked — AV NIGHT — reason: SF walk after R" on the board, puck red | RECORD (scheduler side PASS) | C-7-rev-1-member-list, C-7-rev-2-scheduler, C-I-1-member-calendar-july, C-I-2-member-day-open |

## Scenario 12 — OIL Earn's switch state table (Pub Sat)
| Step | Expected | Seen | V | Picture |
|---|---|---|---|---|
| (a) AVALON R 18:30 | every row ON | AV ON; Saber, Ranger, Drifter, Ace ON / FO | PASS | C-12-a1-R-default |
| (a) switch Ace off | Ace off | Ace off, others ON; 2 pending | PASS | C-12-a2-ace-off |
| (a) clear R | all off | all four off | PASS | C-12-a3-R-cleared |
| (a) retype R | RECORD Ace | the other three back ON; **Ace stays off** (his earlier choice is remembered) | RECORD | C-12-a4-R-retyped |
| (b) AVALON standing by | item off, four off | as expected | PASS | C-12-b0-standing |
| (b) switch Drifter ON | Drifter ON | Drifter ON / FO, rest off; 1 pending | PASS | C-12-b1-drifter-on |
| (b) Publish AL1 → tracker | written window only | Drifter "+1 18 Jul … FLT · 19:00–23:59"; nobody else | PASS | C-12-b2-tracker-standing |
| (b) type R 18:30 | RECORD | all four ON (Drifter stays ON) | RECORD | C-12-b3-R-typed |
| (b) Publish AL2 → tracker | window starts at R | all four "FLT · 18:30–23:59" (Drifter's now from 18:30) | PASS | C-12-b4-tracker-R |
| (c) SC MAIN, R 07:00 = START | OIL unchanged; badge changes | OIL Earn identical before/after (Saber, Ranger ON / HO); badge "2 / 2"; tracker before = after ("+0.5 … FLT · 07:00–13:00") | PASS | C-12-c1-R-eq-start, C-12-c0/c2-tracker |
| (d) public-holiday weekday | same as Saturday | **NOT WALKED** — I did not find the holiday doorway in the time; no reading | — | — |

## Scenario 13 — Insights (week of Jul 13)
| Step | Expected | Seen | V | Picture |
|---|---|---|---|---|
| Baseline (SC AM and Fri AVALON seated, nothing flies) | RECORD | 32 sorties, 16 formations, 38 aircrew flying | RECORD | C-13-0-baseline |
| SC AM R 06:30, four rows seated (four men who flew nothing else that week) | sorties +4, formations +1, own counts +1, hours up | 36 / 17; aircrew flying 42 (+4); Saturday line "4 sorties · 1 formations"; each man 1 sortie; hours +30 min (MAIN rows, 07:00→06:30) and +6h30 (SPARE rows) | PASS | C-13-1-sc-r |
| Hand-tick one AVALON SPARE (Fri) | +1 / +1 | 37 / 18; aircrew 43; Friday "1 sortie · 1 formations" | PASS | C-13-2-hand-tick |
| Untick, clear R | baseline | 32 / 16 / 38 exactly | PASS | C-13-3-back |
| Blue / red mix | standby joins none | Insights shows no blue / red figure at all in this view; the board's Insights button opens the same week view | RECORD | C-13-4-board-insights |

## Scenarios 17, 18, 19 (Fri)
| Step | Expected | Seen | V | Picture |
|---|---|---|---|---|
| 17: Reaper MAIN SC AM (R 06:30), SPARE SC PM (nothing) | PM stays standby for him | no PM warning; AM lit, PM dashed; Insights hours +6h30 (06:30–13:00) | PASS | C-17-1-am-flies |
| 17: type PM B 12:30 | RECORD | both fly; amber: "Reaper reports 12:30 for SC PM — SC AM (07:00–13:00) cuts into the in-time window before the 13:00 start" (not a hard clash; plain words, a real overlap); "long work day: 12h30, 06:30 → 19:00"; hours +12h30 | RECORD | C-17-2-pm-b |
| 18: SC AM 07:00, R 06:00, ground 06:15–06:45 | RECORD | standing: nothing; with R: amber "Reaper reports 06:00 for SC AM — EARLY BRIEF (06:15–06:45) cuts into the in-time window before the 07:00 start" — the in-time advisory now covers a flying spare | RECORD | C-18-1-standing, C-18-2-sc-r-before-start |
| 18: AVALON R 18:00 (START 19:00), BB R 07:30 (START 08:00) | RECORD | same amber advisory on both ("…before the 19:00 start", "…before the 08:00 start"); nothing while standing | RECORD | C-18-3-…, C-18-4-… |
| 19: set-up | seated | Torch, Gambit (SC AM SPARE), Diesel + Hex (SC PM SPARE), Ridge (AVALON SPARE); the palette refuses a man without SC DAY currency, so Torch and Gambit were seated first and the tick taken off on Quals afterwards | PASS | — |
| 19: standing by | designer expected silence | **not silent for currency**: "Torch, Gambit — SC DAY currency needed for SC AM … not current" and "Ridge — SC NIGHT currency needed for AVALON NIGHT SPARE" already show (standby rows were already checked for currency); the Diesel/Hex seat rule is silent | RECORD | C-19-1-standing |
| 19: type SC AM R | currency warning, once per shift | unchanged: one line for both men ("Torch, Gambit — …") — once per shift, not per row; a Thursday crew-rest line for Torch appears (he flew Thursday) | PASS | C-19-2-sc-am-flies |
| 19: type SC PM R 12:30 (Diesel front, Hex rear) | seat-rule warning | "Diesel, Hex — CAT D pilot Diesel with CAT C WSO Hex in SC PM — CO approval required" appears only now | PASS | C-19-3-sc-pm-flies |
| 19: type AVALON R 18:30 | currency warning | wording changes to "…needed for AV NIGHT (19:00–07:00)"; plus a long-day note | PASS | C-19-4-avalon-flies |

## Break tests 7 and 8
| Step | Expected | Seen | V | Picture |
|---|---|---|---|---|
| B7: drag a hand-ticked SC AM SPARE row (Reaper) onto the SC PM SPARE row | tick travels or is dropped consistently; badge in the right shift | the row moved across shifts; the tick went with the man (PM row 2 lit, AM row 2 empty and dashed); badge "1 / 2" unchanged; the drop took the PM shift's third row, not the one under the pointer (row 4); Undo restored the exact start | RECORD (Undo PASS) | C-B7-1-before-drag, -2-mid-drag, -3-after-drag |
| B8: AVALON R 08:00 (END 07:00, START 19:00) | no negative or 24 h day | day 08:00 → 07:00 = "long work day: 23h00"; OIL Earn ON / FO; tracker "FLT · 08:00–23:59". No negative or 24-hour figure; nothing warns that R is eleven hours before START | RECORD | C-B8-AV-1, -2, -3 |
| B8: SC AM R 14:00 (END 13:00) | same | R ignored: day stays 07:00–13:00, no long-day note, OIL ON / HO, tracker "FLT · 07:00–13:00" — nothing beyond END | PASS | C-B8-SC-1, -2, -3 |

## The designer's "Most likely missing" list
| Place | Seen | V | Picture |
|---|---|---|---|
| Changes window / History / Undo words for a hand tick; where the amendment mark sits | see F1. Week of the published day: the lit "SPARE ✓ FLIES" chip shows; the change counts as 1 pending, the four sign-offs fall and "Publish AL1" locks. No separate gold dot on the chip; the OIL bar on the man's puck lights at once (the OIL itself reaches the tracker only after AL1 — Reaper credited "+0.5 … 07:00–13:00" then) | FAIL (F1) | C-A-1, C-A-2, C-A2-1, C-A-4, C-A-7 |
| Earlier issued version's look; read-only board | the Original looked at on the week and on the board draws MAIN / SPARE with no tick and no chip (as issued), nothing pressable; View-only Sched (admin): "Original — as issued" no chip, "Working draft" one lit "✓ FLIES" and no button; member's View-only Sched after AL1: "✓ FLIES" lit, no button; the member's read-only board: no dashed chip, no button | PASS | C-A5, C-A3-1, -2, -3, C-A-8, C-A-9 |
| Next-week peek | Monday Jul 20 built with AVALON R, SC AM R and one BB row ticked: the peek's day figure "4 X 2 X 2 X 1 X 1 / 4" equals the loaded week's; "✓ FLIES · MAIN / SPARE" before the words of exactly the nine rows that fly | PASS | C-P-1-peek-monday |
| + Wave picker notes; Logic page | see F2 | FAIL (F2) | C-W2-1, C-W-1, C-W-3 |
| Crew palette's barred reasons and puck ring on AVALON / BB | AVALON flying SPARE: palette "Reaper — already on AV NIGHT 19:00–07:00" (barred); on the 22:00 sim both pucks red with "AV NIGHT & Sim EP-9 clash" | PASS | C-M-5, C-M-6 |
| Inputs: member's leave on a flying AVALON SPARE | the request window, list row and calendar bar say nothing of the clash (list row shows LATE) — scenario 7 | RECORD | C-I-1, C-I-2 |
| Copies | a saved day template applied to Friday brings R (06:30) but **not** the hand ticks (all dashed); + Line inside the SC wave: the new line has no tick; "+ Alt Plan": the live copy and the parked Plan A both keep the tick. The design is silent on templates — a question for him if he expects ticks to travel | RECORD | C-T-4-after-apply |
| Insights' per-person figures; blue / red | scenario 13 | PASS | C-13-1 |
| OIL Earn default for AVALON and BB; desks | BB with START 08:30 / END 14:00, R 08:00: Saber, Ranger ON / HO (typed R before START); AVALON flying row ON / FO while an AVALON duty desk's rows (Cobra, SXO, OPS O, RUNNER, LOG CELL) stay off | PASS | C-M-3-bb-oil, C-M-4-avalon-desk-oil |
| Amber BB line for a hand-ticked row | fires for a hand-ticked row with no times ("BB SHIFT flies but has no START or END …"), for R-only, and "…has no END" when only END is cleared; gone once START and END are typed. The older line "the BB shift has no usable times — nobody on it earns OIL for this day" shows beside it the whole time (two lines say nearly the same thing; the older one also shows while standing by). Tap: see F3 | PASS (tap FAIL — F3) | C-M-1-bb-hand-tick, C-M-2-bb-tap-lands |

## Not walked, and why
- Any phone run (scenarios 6 and 7's phone halves, the member on a phone): the brief gave me desktop 1440 by mouse.
- Scenario 12(d): a public-holiday weekday — I did not reach the Calendar window's holiday doorway.
- Scenario 2: Monday's crew rest was read in the loaded next week only; I did not walk Sunday AVALON's own next-week peek from the week before except in the peek check above (Monday built there, not Sunday).
- Not checked as errors on purpose: the demo's seeded warnings (e.g. Thursday-night crew rests) that show on Fridays; a problem living only in stored demo data.

Rulings: none recorded by this walk (the report only).
