# [STANDBY-FLIES] Walker A — desktop 1440×900 by mouse (19 Oct 26)

Served build proved first: `http://localhost:4322/` serves `index-BTbomYbk.js`. Chromium (Playwright), viewport 1440×900, scale 1,
the app is dark only. Scripts: `raptor-port/scripts/handpass/sf-A-*.mjs` (the shared helper is `sf-A-lib.mjs`; each script's own
result lines are in `sf-A-log-sf-A-<name>.txt`). Pictures: `raptor-port/docs/img/handpass/2026-10-19-standby-flies/walk/A/`.
Share: scenarios 1, 3, 4, 9 (desktop), 10, 11, 14, 15, 16 (desktop), 20, 22; break tests 3, 4, 5, 6. Admin `ad`/`a` throughout
(member `us`/`us` for the member steps of 9). Every script printed an empty browser error list (console, page errors, HTTP 4xx).

**How each state was built.** Standby waves were added with `addWave` and crew seated with `fillSlot` — SET-UP ONLY, never the thing
under test (the brief allows it). Everything under test was pressed through the real controls: the Flies chip (mouse and keyboard),
the R / B boxes (typed, then left by a plain press on the board's title), CX (its popup, "Cancel line" / "Un-cancel"), the MAIN / SPARE
badge, dragging pucks to and from the crew list, Undo / Redo, the sign-off selects and Publish day / Publish AL, the plan menu,
History, Templates, + Wave / + Line / +, ✕ Line / ✕ Wave, reload. Pub Sat = day 5 published through the four sign-off selects (ORIG);
Unpub = day 1 (Tuesday). Row addresses are `day.wave.shift.row`; "the SPARE" is row 3 (index 2) of SC AM.

**Verdict count (after the report's own overrides, below): PASS 56 · FAIL 4 · RECORD 18 · NOT WALKED: see the last section.**

Overrides I applied to the script logs, and why:
- Scenario 20's two script FAILs are RECORDs: the two tabs never sync live and the last tab to save wins — a control with two
  older edits (a remark in tab A, R in tab B) lost tab B's R the same way (`sf-A-s20c.mjs`). Not this change.
- The OIL Earn board line in 1a is a RECORD, not a FAIL: the tracker (the money) did not move until AL1; the OIL Earn board is a
  working-copy preview — CX on a ticked row also removes the name from it at once (4a, 4b), as older features do.
- The keyboard focus line (15) and the + Wave note (misc) are FAILs as logged.

## What happened, in the order a scheduler would care about

1. **The Flies tick works as ruled on every desktop surface walked**: one row lit by hand, the whole shift lit by a typed B or R,
   the typed shift's lit chip not pressable with its "CX the row" explanation, the tick stored per row and kept when R is typed and
   cleared, one Undo per press, one pending change per row on a published day (sign-offs fall, "Not yet signed", "Publish AL1"),
   OIL reaching the Leave War tracker only when the amendment is published, and leaving it when the opposite amendment is.
2. **The week, View-only Sched, the next-week peek and the member's View-only show lit chips only** — never a dashed chip and
   never a button; the issued versions look right (Original: no chip; AL1: lit chip, not pressable).
3. **Four things are wrong in the words**: the changes window never says "Flies" (F1); the + Wave picker note (F3) and a Logic
   page line (F4) still say what was true before; and after a keyboard press the chip loses focus (F2, not new — see there).

### 1 — a hand tick on a published Saturday, its whole life

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 1: Pub Sat (SC AM 07:00-13:00, R/B empty, SPARE seated), published ORIG; OIL Earn and the tracker for the SPARE | Drifter earns nothing | oil: Drifter —; tracker:  /  | PASS | A/A-1-0-published.png |
| 1a: press the SPARE's dashed chip on the published day: pending count, sign-offs, wording | lit; "1 pending"; Not yet signed; four sign-offs fall; Publish AL1 | lit=0010; pend=["SIGNED","Not yet signed","1 pending","Publish AL1","Unpublish"]; beak=Publish AL1; signs=["","","",""] | PASS | A/A-1a-1-ticked-top.png |
| 1a: the changes window's words for the tick | names the SC line, the SPARE row and a Flies change in words a scheduler uses | "Changes · Saturday 18/7 Published · 1 change waiting to go out as AL1 ✕ New to you 0 All changes 15 To go out · AL1 1 Week Mon Tue Wed Thu Fri Sat Sun Waiting to go out as AL1 · 1 change SC · #3 remarks earlier (no remarks) · SPARE · SPARE → (no remarks) · SPARE · SPARE Tap a change to go to it. Tap a change to go to it." | FAIL | A/A-1a-2-changes-window.png |
| 1a: OIL Earn mode and the tracker right after the tick, before any amendment | brief: both unchanged until AL1 (D592 (4)). The tracker (the money) must not move; the OIL Earn board is a working-copy preview (a CX moves it at once too) | OIL Earn: Drifter HO; tracker:  /  | RECORD | A/A-1a-4-oil-mode.png |
| 1b: Undo the tick | pending back to none, chip dashed, sign-offs back (the strip reads SIGNED again, no "Not yet signed") | lit=0000; pend=["SIGNED","16 changes","Unpublish"]; beak=""; head=SIGNED ORIG CUR CKAce SKED CKBasher PLANNEDBolt APPROVEDCinch SIGN-OFF CUR CK — name — — name — Ace Anvil Basher Blade B | PASS | A/A-1b-undo-top.png |
| 1c: Redo, sign four, publish the amendment | AL1; the tracker credits the SPARE for 07:00-13:00 (6h = half a day) | publish={"published":true,"label":"Publish AL1","chip":"AL1"}; chip=AL1; lit=0010; OIL Earn: Drifter HO; tracker: HO* /  | PASS | A/A-1c-AL1-top.png |
| 1c: look at the earlier issued version (Original) | the SPARE row (3rd badge) shown without a lit chip (the tick came after); nothing pressable | badges: MAIN:nochip  MAIN:nochip  SPARE:nochip  SPARE:nochip  MAIN:nochip  MAIN:nochip  SPARE:nochip  SPARE:nochip | PASS | A/A-1c-original-look.png |
| 1c: look at AL1 (issued, read-only) | the SPARE (3rd badge) WITH the lit chip, nothing pressable | badges: MAIN:nochip  MAIN:nochip  SPARE:SPAN*LIT*  ✓ FLIES:SPAN*LIT*  SPARE:nochip  MAIN:nochip  MAIN:nochip  SPARE:nochip  SPARE:nochip | PASS | A/A-1c-AL1-look.png |
| 1d: press the lit chip off on the amended day (AL1) | dashed again; "1 pending"; Publish AL2; tracker still credits until published | lit=0000; pend=["SIGNED","Not yet signed","1 pending","Publish AL2","Unpublish"]; beak=Publish AL2; OIL Earn: Drifter —; tracker: HO* /  | PASS | A/A-1d-1-unticked-top.png |
| 1d: publish the amendment (AL2) | the SPARE's OIL leaves the tracker | publish={"published":true,"label":"Publish AL2","chip":"AL2"}; chip=AL2; tracker:  /  | PASS | A/A-1d-2-AL2-top.png |
| 1e: view AL1 (tick on), "Load onto working copy" | the working copy gets the tick back: chip lit, pending, OIL Earn follows; tracker unchanged until published | plan=Live working copy ▾; lit=0010; pend=["SIGNED","Not yet signed","1 pending","Publish AL3","Unpublish"]; OIL Earn: Drifter HO; tracker:  /  | PASS | A/A-1e-2-after-load.png |

### 3 — hand tick, then type R, the reverse, then clear R

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 3a: press the SPARE row (0.2) dashed chip, nothing typed | only that row lit; other three dashed | lit=0010 | PASS | A/A-3a-1-ticked-spare.png |
| 3a: type R 06:30 on the board, leave the box | all four lit; the ticked row's chip is no longer pressable, its title says to CX the row | lit=1111; 0.2 chip=[{"tag":"SPAN","txt":"✓ FLIES","on":true,"cls":"sarole saflies on ro","title":"Flies: this shift has its B or R typed. A row that does not come in is cancelled with CX.","dis":false,"aria":"","safly":null,"tab":-1}] | PASS | A/A-3a-2-R-typed.png |
| 3a: clear R again | RECORD: the ticked row stays lit and is a button again; the other three dashed | lit=0010; 0.2 chip=[{"tag":"BUTTON","txt":"✓ FLIES","on":true,"cls":"sarole saflies on","title":"Flies: ticked by hand. Tap to take the tick off.","dis":false,"aria":"","safly":"1.2.0.2","tab":0}] | PASS | A/A-3a-3-R-cleared.png |
| 3c: Undo x3 from the end (clear R, type R, tick) | one Undo per action: after 1st lit=1111 R=06:30; after 2nd lit=0010 R=''; after 3rd lit=0000 R='' | 1111/R=06:30 ; 0010/R= ; 0000/R= | PASS | A/A-3c-undo-all.png |
| 3c: Redo x3 | same states forwards: 0010; 1111|06:30; 0010|empty | 0010/R= ; 1111/R=06:30 ; 0010/R= | PASS |  |
| 3b: untick, type R first, try the SPARE chip, then clear R | after R: lit=1111 and the chip not pressable; after clearing R: all dashed (no tick stored) | untick lit=0000; after R lit=1111, chip ["SPAN"]; press: no button; lit after press 1111; stored ticks [false,false,false,false]; after clear lit=0000 | PASS | A/A-3b-R-first-then-cleared.png |
| 3d: Pub Sat: tick the SPARE, type R 06:30, clear R: the pending count after each step | tick=1; after R = what really differs from the issued day (R typed + derived flies); after clearing R = exactly 1 (the tick only), not 3 | start 0; after tick 1 (lit 0010); after R 2 (lit 1111) [Waiting to go out as AL1 · 2 changes SC · rally Saber 19/10 18:48 06:30 SC · #3 remarks earlier (no remarks) · SPARE · SPARE → (no remarks) · SPARE · SPARE Tap a change to go to it. Tap a change to go to it.]; after clear R 1 (lit 0010) [null] | PASS | A/A-3d-3-after-clear-top.png |
| 3d: Pub Sat: untick the SPARE (the day now equals its issued form) | pending 0, no "Not yet signed", Publish AL button gone | pending 0; lit 0000; beak=""; strip=["SIGNED","18 changes","Unpublish"] | PASS | A/A-3d-4-unticked-top.png |

### 4 — CX and the tick, both orders

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 4a: Pub Sat, SC AM R 06:30 typed, CX the SPARE row (0.2) | his chip goes / not lit; badge drops one jet (4 -> 3); his OIL goes; the other three rows still fly | before: chips[0.0:MAIN:SPAN*LIT*  0.1:MAIN:SPAN*LIT*  0.2:SPARE:SPAN*LIT*  0.3:SPARE:SPAN*LIT*] badge="4 / 2" cx=[false,false,false,false] pend=0 OIL[Ranger FO / Saber FO / Drifter FO / Ace FO] // after CX: chips[0.0:MAIN:SPAN*LIT*  0.1:MAIN:SPAN*LIT*  0.2:SPARE:nochip  0.3:SPARE:SPAN*LIT*] badge="3 / 2" cx=[false,false,true,false] pend=1 pending OIL[Ranger FO / Saber FO / Ace FO] | PASS | A/A-4a-1-cx-spare.png |
| 4a: un-CX the row | back as before: lit 1111, badge as before, OIL back | after un-CX: chips[0.0:MAIN:SPAN*LIT*  0.1:MAIN:SPAN*LIT*  0.2:SPARE:SPAN*LIT*  0.3:SPARE:SPAN*LIT*] badge="4 / 2" cx=[false,false,false,false] pend=0 OIL[Ranger FO / Saber FO / Drifter FO / Ace FO] | PASS | A/A-4a-2-uncx.png |
| 4b: no R; tick the SPARE by hand, publish, then CX that row | he neither counts nor earns (badge one down, no OIL) | ticked: chips[0.0:MAIN:B-dash-  0.1:MAIN:B-dash-  0.2:SPARE:B*LIT*  0.3:SPARE:B-dash-] badge="1 / 2" cx=[false,false,false,false] pend=0 OIL[Ranger HO / Saber HO / Drifter HO / Ace —] // after CX: chips[0.0:MAIN:B-dash-  0.1:MAIN:B-dash-  0.2:SPARE:nochip  0.3:SPARE:B-dash-] badge="0 / 2" cx=[false,false,true,false] pend=1 pending OIL[Ranger HO / Saber HO / Ace —]; row model {"p":"slipway","w":"dirty","area":"","rmks":"","opts":{},"spare":true,"role":"SPARE","rid":"rmvf4xh97gdwhvh","fly":true,"cx":true,"cxr":""} | PASS | A/A-4b-1-cx-ticked.png |
| 4b: un-CX the ticked row | he flies again: the tick survived the cancel (chip lit, badge back, OIL back) | after un-CX: chips[0.0:MAIN:B-dash-  0.1:MAIN:B-dash-  0.2:SPARE:B*LIT*  0.3:SPARE:B-dash-] badge="1 / 2" cx=[false,false,false,false] pend=0 OIL[Ranger HO / Saber HO / Drifter HO / Ace —] | PASS | A/A-4b-2-uncx.png |
| 4c: CX the 4th row first (no R), look for the dashed chip on it, press it if shown | RECORD whether the chip shows on a cancelled row; a press must never make it count | after CX: chips[0.0:MAIN:B-dash-  0.1:MAIN:B-dash-  0.2:SPARE:B-dash-  0.3:SPARE:nochip] badge="0 / 2"; row chip detail []; no chip shown on the cancelled row; after: chips[0.0:MAIN:B-dash-  0.1:MAIN:B-dash-  0.2:SPARE:B-dash-  0.3:SPARE:nochip] badge="0 / 2" OIL[Ranger HO / Saber HO / Drifter —] | RECORD | A/A-4c-1-cx-first.png |
| 4d: R typed, CX all four rows of SC AM | no row flies; the badge loses the AM term; no OIL for the four | before: chips[0.0:MAIN:SPAN*LIT*  0.1:MAIN:SPAN*LIT*  0.2:SPARE:SPAN*LIT*  0.3:SPARE:SPAN*LIT*] badge="4 / 2" cx=[false,false,false,false] pend=0 OIL[Ranger FO / Saber FO / Drifter FO / Ace FO] // after: chips[0.0:MAIN:nochip  0.1:MAIN:nochip  0.2:SPARE:nochip  0.3:SPARE:nochip] badge="0 / 2" cx=[true,true,true,true] pend=5 pending OIL[] | PASS | A/A-4d-1-all-cx.png |
| 4d: Undo x4 (one CX each) | all four back to flying | after undo x4: chips[0.0:MAIN:SPAN*LIT*  0.1:MAIN:SPAN*LIT*  0.2:SPARE:SPAN*LIT*  0.3:SPARE:SPAN*LIT*] badge="4 / 2" cx=[false,false,false,false] pend=0 OIL[Ranger FO / Saber FO / Drifter FO / Ace FO] | PASS | A/A-4d-2-undo.png |
| 4d: Redo x4 then reload | all cancelled again, same after reload | redo: chips[0.0:MAIN:nochip  0.1:MAIN:nochip  0.2:SPARE:nochip  0.3:SPARE:nochip] badge="0 / 2" cx=[true,true,true,true] pend=5 pending OIL[] // reload: chips[0.0:MAIN:nochip  0.1:MAIN:nochip  0.2:SPARE:nochip  0.3:SPARE:nochip] badge="0 / 2" cx=[true,true,true,true] pend=5 pending OIL[] | PASS | A/A-4d-3-reload.png |

### 9 — every desktop surface that draws a standby row

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 9: Scheduler Board (desktop, admin): SC AM R typed, SC PM one SPARE ticked, AVALON and BB standing by | L* = lit and pressable, L = lit not pressable, d = dashed button. AM: all four lit (not pressable); PM: only the ticked SPARE lit and pressable, the rest dashed; AVALON and BB all dashed | {"scAM":"LLLL","scPM":"ddL*d","av":"dddd","bb":"dddd"} | PASS | A/A-9-1-board-SC.png |
| 9: Edit Schedule week (Saturday) | lit chips only; no dashed chip anywhere; nothing pressable (no button) | shape {"scAM":"LLLL","scPM":"--L-","av":"----","bb":"----"}; buttons 0; dashed 0; lit 5; day badge "5 / 6" | PASS | A/A-9-2-week-SC.png |
| 9: View-only Sched (admin), Saturday | lit only: 5 lit (4 AM + 1 PM), no dashed, no button | {"lit":5,"dash":0,"btn":0,"badge":"5 / 6"} | PASS | A/A-9-3-viewonly-Saturday.png |
| 9: next-week peek (Monday Jul 20 with SC AM R typed), seen from the week before | "✓ FLIES" text before the four SC AM rows' words, no button | {"badge":"4 X 2 X 4 / 2","text":["SPAN.ntx:✓ FLIES · MAIN","SPAN.ntx:✓ FLIES · MAIN","SPAN.ntx:✓ FLIES · SPARE","SPAN.ntx:✓ FLIES · SPARE"],"btn":0,"rows":"NEXT WEEK: CLICK A DAY TO LOAD IT Monday Jul 20 4 X 2 X 4 / 2 COMMON PROGRAMME DEMO — SECOND SCHEDULE WEEK ORDERS: FLYING ORDERS SECTION 2 NAME START END PEOPLE RMKS SODB 07:45 08:00 MASS BRIEF 08:00 08:30 STANDARDISATION MEETING 13:30 14:30 Piston IP WAVE 1 CS MSN R B TO LD FCP / RCP RMKS VL BFM 06:20 08:40 10:05 Ranger IP Echo IW 1B: BFM-4 TPOD 2 TKS Wildcard O Tally O 2A: OCU CREW SOLO AREA NORTH · SOUTH 0840-1005 RU BFM 06:20 08:40 10:0 | PASS | A/A-9-4-peek-Monday.png |
| 9: View-only Sched as member us/us, Saturday | lit only; no dashed chip; no button | RANGER · MEMBER; {"lit":5,"dash":0,"btn":0} | PASS | A/A-9-5-member-viewonly.png |
| 9: the read-only board for the member | lit only | a member has no scheduler board: openScheduler(5) opens nothing visible (returned true); the member's read-only view is View-only Sched | RECORD | A/A-9-6-member-noboard.png |

### 10 — SC's B on the board, seen from the week

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 10: SC AM: type B 06:15 on the board only, then look at Edit Schedule's week | RECORD: lit chips on all four rows with no B box on the week to explain them; what a scheduler can find out and take back from the week | model {"br":"06:15","rl":""}; lit=1111; chip tooltip "Flies: this shift has its B or R typed. A row that does not come in is cancelled with CX."; chip tag SPAN; week fields in the wave: {"txt":["wl:1.2=SC","ff:1.2.0.cs=SC","ff:1.2.0.msn=AM","ff:1.2.0.rl=","ff:1.2.0.to=07:00","ff:1.2.0.ld=13:00","fr:1.2.0.0=","fr:1.2.0.1=","fr:1.2.0.2=","fr:1.2.0.3=","ff:1.2.1.cs=SC","ff:1.2.1.msn=PM","ff:1.2.1.rl=","ff:1.2.1.to=13:00"],"head":""} | RECORD | A/A-10-1-week-B-only.png |
| 10: does the week offer a B box or an R box for the SC row | RECORD | B box on the week: 0; R box on the week: 1 | RECORD |  |
| 10: View-only Sched (as admin) with B only typed | lit chips, no press possible, no B visible | lit=4; badges: MAIN:SPAN*LIT*  ✓ FLIES:SPAN*LIT*  MAIN:SPAN*LIT*  ✓ FLIES:SPAN*LIT*  SPARE:SPAN*LIT*  ✓ FLIES:SPAN*LIT*  SPARE:SPAN*LIT*  ✓ FLIES:SPAN*LIT*  MAIN:nochip  MAIN:nochip  SPARE:nochip  SPARE:nochip | PASS | A/A-10-2-viewonly-B-only.png |
| 10: clear B on the board | all four chips dashed/none on the week again | lit=0000 | PASS | A/A-10-3-week-B-cleared.png |
| 10: type R 06:30 in the week's own R box, then clear it there | chips lit while R is typed, gone when cleared (the week CAN take it back) | after R: lit=1111; after clear: lit=0000 | PASS | A/A-10-4-week-R-typed-on-week.png |

### 11 — tick, then flip MAIN / SPARE; tick, then clear the seat

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 11a: Pub Sat: hand-tick the SPARE, flip its badge to MAIN, flip back | still lit and a button both ways; pending counts both changes (2 after the flip, 1 after flipping back to the original role + tick = 1); OIL default on both ways | ticked: {"lit":"ddBd","roles":"MMSS","pend":"1","oil":"Drifter HO"}; as MAIN: {"lit":"ddBd","roles":"MMMS","pend":"1","oil":"Drifter HO"} changes window: [Waiting to go out as AL1 · 1 change SC · #3 remarks earlier (no remarks) · SPARE · SPARE → (no remarks) · MAIN Tap a change to go to it. Tap a change to go to it.] chip ["BUTTON:on"]; back: {"lit":"ddBd","roles":"MMSS","pend":"1","oil":"Drifter HO"} | RECORD | A/A-11a-1-flipped-main.png |
| 11b: tick a SPARE, then remove both his crew from the row (dragged back to the crew list) | RECORD: the badge drops him (nobody seated); the chip | {"seatedP":"","seatedW":"","lit":"ddBd","pend":"3","badge":"0 / 2","badgeBefore":"1 / 2","chipDetail":["BUTTON:✓ FLIES:on"]} | RECORD | A/A-11b-1-emptied.png |
| 11b: drag a different man onto the emptied row | RECORD: he inherits the tick (the tick is the row's, not the man's); say whether a scheduler would expect that | {"seatedP":"","lit":"ddBd","pend":"3","badge":"0 / 2","chipDetail":["BUTTON:✓ FLIES:on"],"tickStored":true} | RECORD | A/A-11b-2-new-man.png |

### 14 — copies of a day, a plan, a wave

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 14a: save Saturday (SC AM R 06:30 typed, AVALON row 3 ticked by hand) as a day template, apply to Sunday | R travels as before; RECORD whether the hand tick travels | Sunday SC AM lit LLLL R="06:30"; AVALON lit dddd, stored ticks [false,false,false,false] | RECORD | A/A-14a-1-applied-AVALON.png |
| 14c: + Wave → SC on Monday | no tick, dashed chips, the faint dash in R and B | lit dddd; R/B placeholder/value ["—/","—/"] | PASS | A/A-14c-new-SC-wave.png |
| 14e: press the "+" on an AVALON row (add another aircraft row) when row 3 is ticked | RECORD whether the ticked row copies: the new row dashed | lit before ddLd, after ddLdd; rows now 5 | RECORD | A/A-14e-plus-row.png |
| 14d: leave the week and come back, then reload | every tick and every lit chip survives (SC AM LLLL; AVALON row 3 lit) | after returning {"sc":"LLLL","av":"ddLdd"}; after reload {"sc":"LLLL","av":"ddLdd"} | PASS | A/A-14d-after-reload.png |
| 14b: Pub Sat: Plan A holds a hand tick, the live Plan B does not (equals issued); bring Plan A out as the live day | a pending amendment that includes the Flies change: the chip lit, "1 pending", "Publish AL1", the changes window names the change | Plan B before: {"plan":"Plan B ▾","lit":"dddd","pend":"0"}; after switching: {"plan":"Plan A ▾","lit":"ddLd","pend":"1","pending":"SIGNED/Not yet signed/1 pending/Publish AL1/Unpublish"}; changes window: [Waiting to go out as AL1 · 1 change SC · #3 remarks earlier (no remarks) · SPARE · SPARE → (no remarks) · SPARE · SPARE Tap a change to go to it. Tap a change to go to it.] | PASS | A/A-14b-1-plan-A-brought-out.png |
| 14e: "+ Line" on the SC wave while the row 3 of AM is ticked | RECORD whether the tick travels to the new line (it should not) | formations before 2, after 3; lit per line: ddLd / dddd / d | RECORD | A/A-misc-2-plus-line.png |

### 15 — the chip by keyboard and screen reader

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 15: focus the SPARE row's MAIN/SPARE badge, press Tab | focus lands on the dashed Flies chip with a visible focus ring | {"tag":"BUTTON","safly":"1.2.0.2","sarole":null,"cls":"sarole saflies sp","txt":"FLIES","pressed":"false","label":null,"title":"Tick if this row is activated to fly: its crew rest, OIL and warnings then count it as a flight.","outline":"solid 2px rgb(59, 198, 232)","shadow":"none"} | PASS | A/A-15-1-tab-to-chip.png |
| 15: Enter, Enter, Space, Space — each time Tab from the badge to the chip first | tick, untick, tick, untick (lit 0010, 0000, 0010, 0000) | Enter→0010 ; Enter→0000 ; Space→0010 ; Space→0000 | PASS |  |
| 15: where focus is right after the chip is pressed by Enter / Space | focus stays on the chip, so a second press unticks without re-tabbing (the same as the older MAIN/SPARE badge behaves: RECORD that too) | focus after each press: body ; body ; body ; body | FAIL |  |
| 15: Escape while the chip is focused (lit) | nothing changes (still lit), no harm | before 0010, after 0010; board still open: true | PASS |  |
| 15: the accessible name of the (lit, hand-ticked) chip | RECORD: name/state a screen reader gets | ariaSnapshot: - button "✓ FLIES" [pressed] | RECORD |  |
| 15: the accessible name of the dashed chip | RECORD | ariaSnapshot: - button "FLIES"; attrs: {"tag":"BUTTON","safly":"1.2.0.2","sarole":null,"cls":"sarole saflies sp","txt":"FLIES","pressed":"false","label":null,"title":"Tick if this row is activated to fly: its crew rest, OIL and warnings then count it as a flight.","outline":"solid 2px rgb(59, 198, 232)","shadow":"none"} | RECORD |  |
| 15: R typed: Tab from the badge to the lit (not pressable) chip, then Enter and Space | Enter and Space must not untick or change anything; its explanation (CX the row) readable without hover | Tab landed on {"tag":"TEXTAREA","safly":null,"sarole":null,"cls":"nts","txt":"","pressed":null,"label":null,"title":null,"outline":"auto 1px rgb(16, 16, 16)","shadow":"none"}; lit before 1111, after 1111; chip: tag SPAN tab -1 aria-label "" title "Flies: this shift has its B or R typed. A row that does not come in is cancelled with CX." | PASS | A/A-15-2-typed-shift-lit.png |
| 15: Edit Schedule week: the lit chip | takes no focus and no press | {"tag":"SPAN","tab":-1,"focusable":false}; {"aria":null,"title":"Flies: this shift has its B or R typed. A row that does not come in is cancelled with CX.","role":null} | PASS |  |

### 16 — the faint dash on every standby box

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 16: board desktop, Unpub Tuesday: SC, AVALON and BB lines with R and B empty | a faint grey dash in every R and B box, the same colour/strength as the faint "Remarks" | {"SC.rl":{"ph":"—","phColor":"rgb(138, 150, 163)","phOp":"0.55","val":""},"SC.br":{"ph":"—","phColor":"rgb(138, 150, 163)","phOp":"0.55","val":""},"AVALON.rl":{"ph":"—","phColor":"rgb(138, 150, 163)","phOp":"0.55","val":""},"AVALON.br":{"ph":"—","phColor":"rgb(138, 150, 163)","phOp":"0.55","val":""},"BB.rl":{"ph":"—","phColor":"rgb(138, 150, 163)","phOp":"0.55","val":""},"BB.br":{"ph":"—","phColor":"rgb(138, 150, 163)","phOp":"0.55","val":""}} remarks=rgb(138, 150, 163)/0.55 | PASS | A/A-16-1-SC-board.png |
| 16: flying lines on the same day | keep their faint suggested times (placeholder a time, not the dash) | R placeholder "05:40" colour rgb(59, 198, 232); B "06:20" | PASS | A/A-16-2-flying-line.png |
| 16: tap the SC R box | stays empty and ready to type: no value placed | {"val":"","focused":true,"sel":"","outline":"auto 1px none"} | PASS | A/A-16-3-tap-R.png |
| 16: type 0630 and leave | "06:30" in the ordinary text colour, the dash gone | val "06:30" colour rgb(241, 244, 247) (ordinary differs from remarks colour rgb(182, 192, 203)) | PASS | A/A-16-4-typed.png |
| 16: clear it again | the faint dash back (empty value, placeholder dash) | val "" ph "—" colour rgb(138, 150, 163) | PASS | A/A-16-5-cleared.png |
| 16: Edit Schedule week: the SC R box | RECORD whether the empty R box shows the same faint dash | {"rl":{"text":"","ph":null,"before":"\"—\"","beforeColor":"rgb(138, 150, 163)","beforeOp":"0.55","cls":"rl txed"},"remarks":{"before":"\"Remarks\"","color":"rgb(138, 150, 163)","op":"0.55"}} | RECORD | A/A-16-6-week-SC.png |
| 16: View-only Sched: the SC wave head | RECORD whether the empty R shows a dash | SCSTANDALONE SC SHIFT R START END FCP / RCP RMKS SC AM 07:00 13:00 MAIN MAIN SPARE SPARE SC PM 13:00 19:00 MAIN MAIN SPARE SPARE | RECORD | A/A-16-7-viewonly.png |
| 16: Pub Sat: tap the SC R box and the B box and leave | nothing pending, no value placed | pending before SIGNED/14 changes/Unpublish; after SIGNED/14 changes/Unpublish; stored {"rl":"","br":""} | PASS | A/A-16-8-pub-tap.png |

### 20 — two tabs

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 20: two tabs on Pub Sat: A ticks the SPARE, B types R 06:30 at the same time; wait for sync | both tabs agree, chip lit and non-pressable (shift flies), no tick lost or doubled, same pending count | no reload: {"A":{"lit":"ddBd","model":{"rl":"","ticks":"false,false,true,false"},"pend":"1"},"B":{"lit":"LLLL","model":{"rl":"06:30","ticks":"false,false,false,false"},"pend":"1"}}; after reload: {"A":{"lit":"ddBd","model":{"rl":"","ticks":"false,false,true,false"},"pend":"1"},"B":{"lit":"ddBd","model":{"rl":"","ticks":"false,false,true,false"},"pend":"1"}} | RECORD | A/A-20-1-tabA-after.png |
| 20: A clears R while B presses the chip off at the same time | both tabs agree afterwards (RECORD which state wins) | before {"A":"ddBd","B":"ddBd"}; B: pressed; after (no reload): {"A":{"lit":"ddBd","model":{"rl":"","ticks":"false,false,true,false"},"pend":"1"},"B":{"lit":"dddd","model":{"rl":"","ticks":"false,false,false,false"},"pend":"0"}} | RECORD | A/A-20-3-round2-tabA.png |

### 22 — reload and the error list

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| 22: reload on a Pub Sat holding: SC AM R typed (one row CX), SC PM one ticked SPARE, AVALON one ticked + one more ticked after publishing, BB R typed | every hand tick and lit chip comes back exactly; wave/row order unchanged; pending count unchanged | before {"SC0":"LLL-","SC1":"ddLd","AV0":"ddLL","BB0":"LLLL"} pend 1; after {"SC0":"LLL-","SC1":"ddLd","AV0":"ddLL","BB0":"LLLL"} pend 1; model identical: true | PASS | A/A-22-2-after-reload-SC.png |
| 22: the week and View-only Sched after the reload | lit chips only; the week shows the working copy (10 lit, AVALON term 2) and View-only shows the issued day without the one pending tick (9 lit, AVALON term 1) | week {"lit":10,"dash":0,"btn":0,"badge":"4 X 2 X 4 / 4"}; view-only {"lit":9,"dash":0,"btn":0,"badge":"4 X 1 X 4 / 4"} | PASS |  |
| 22: the browser error list across this script (console errors, page errors, HTTP 4xx/5xx) | empty | [] | PASS |  |

### Break test 3 — hammer the chip

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| B3: Unpub Tuesday: double-click the dashed chip, then triple-click it (5 presses in all), then Undo five times | a double-click ends clear (dashed); a triple-click ends lit; one Undo per press: states after Undo 1..5 = dddd, ddLd, dddd, ddLd, dddd | after double: {"lit":"dddd","m":{"rl":"","ticks":"0000"}}; after triple: {"lit":"ddLd","m":{"rl":"","ticks":"0010"}}; after each Undo: dddd > ddLd > dddd > ddLd > dddd | PASS | A/A-B3-1-after-hammer.png |
| B3: Pub Sat: double-click the dashed chip (a press pair) | ends dashed with 0 pending (no "Not yet signed") | {"lit":"dddd","pend":"0","pending":"SIGNED/16 changes/Unpublish"} | PASS | A/A-B3-2-pub-dbl.png |

### Break test 4 — press the chip while a box is mid-edit

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| B4: focus the SC R box, type "06", then press the SPARE's chip without leaving the box | R saved or put back cleanly, the chip state follows the final R, no half state | typed "06"; right after the chip press: {"boxNow":"","lit":"ddLd","m":{"rl":"","ticks":"0010"},"active":"BODY"}; after leaving the box: {"lit":"ddLd","m":{"rl":"","ticks":"0010"},"box":""} | PASS | A/A-B4-1-mid-edit.png |

### Break test 5 — delete the wave / a ticked line, then Undo

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| B5: tick a SPARE row, delete that line (its ✕), Undo, reload | the line is gone after the delete; Undo brings it back with the tick lit; reload keeps it | before {"lit":"ddLd","m":{"rl":"","ticks":"0010"}}; after delete {"lit":"ddd","rows":3,"confirm":[]}; after Undo {"lit":"ddLd","m":{"rl":"","ticks":"0010"},"rows":4}; after reload {"lit":"ddLd","m":{"rl":"","ticks":"0010"}} | PASS | A/A-B5-1-line-undo.png |
| B5: delete the whole SC wave (a ticked row inside), Undo, reload | the wave is gone, Undo brings it back with the tick lit, reload keeps it | kinds after delete [] (confirm []); after Undo {"kinds":["sc"],"lit":"ddLd","m":{"rl":"","ticks":"0010"}}; after reload {"kinds":["sc"],"lit":"ddLd"} | PASS | A/A-B5-2-wave-undo.png |

### Break test 6 — hand-tick every row, type R, clear R

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| B6: Pub Sat: hand-tick all four rows, type R, clear R | after clear R all four stay lit; the pending count says four changes, not eight | after four ticks: 4 (lit 1111); after R: 5 (lit 1111); after clear R: 4 (lit 1111); stored ticks [true,true,true,true]; list [Waiting to go out as AL1 · 4 changes SC · #1 remarks earlier (no remarks) · MAIN → (no remarks) · MAIN SC · #2 remarks earlier (no remarks) · MAIN → (no remarks) · MAIN SC · #3 remarks earlier (no remarks) · SPARE · SPARE → (no remarks) · SPARE · SPARE SC · #4 remarks earlier (no remarks) · SPARE · SPARE → (no remarks) · SPARE · SPARE Tap a change to go to it. Tap a change to go to it.] | PASS | A/A-B6-after-clear-top.png |
| B6: reload after the above | all four stay lit, pending unchanged | lit 1111; pending 4 | PASS | A/A-B6-after-reload-top.png |

### Extra reads (the + Wave picker note, the Logic page, + Line)

| step | expected | seen | verdict | picture |
|---|---|---|---|---|
| misc: the + Wave picker's note on SC / AVALON / BB | RECORD: after D1044-D1046 a standby line with B or R typed DOES count in the day's flying count; the note should not say they sit outside it without that exception | ["SC · AVALON · BB sit outside the day's flying count — two waves of four plus an SC reads 4 X 4 / 2."] | FAIL | A/A-misc-1-wave-picker-note.png |
| misc: the Logic page's text about standby lines (SC / AVALON / BB) | RECORD: it should say a standby line with B or R typed flies and is checked like a flight, and that the other rows are standing by | ["IL until its end is typed. Any other row 1h The same for a ground, programme or duty row. Standby (SC, AVALON, BB) SC day window 07:00 to 19:00 A shift wholly inside it needs SC DAY; one reaching outside it needs SC NIGHT. SC MAIN clashes What an SC MAIN man's clash with each shows: a red warning or an amber ","end is typed. Any other row 1h The same for a ground, programme or duty row. Standby (SC, AVALON, BB) SC day window 07:00 to 19:00 A shift wholly inside it needs SC DAY; one reaching outside it needs SC NIGHT. SC MAIN clashes What an SC MAIN man's clash with each shows: a red warning or an amber advisory. a f","yped. Any other row 1h The same for a ground, programme or duty row. Sta ... | RECORD | A/A-misc-3-logic-standby.png |
| misc: the Logic page line on OIL for a standby shift | must not say a standby shift earns none now that a flying one does by default | {"line":"A line's take-off and landing are the same time. A flying line still earns its OIL; a standby shift earns none.","laterOnTheSamePage":"A shift with its B or R typed flies, every row on it; a row ticked FLIES on the Scheduler Board flies on its own. A row that flies is checked as an SC MAIN is, counts as a jet and a sortie, and earns OIL by default. A row with nobody on it counts nothing; one "} | FAIL | A/A-misc-4-logic-earns-none.png |

## Faults found

**F1 — the changes window never says "Flies"; a tick reads as a remarks change whose old and new are identical.** (FAIL, scenario 1a.)
Where: Scheduler Board → History → "To go out · AL1". Steps: publish a Saturday with an SC wave (SC AM, four rows seated), press the
dashed FLIES chip on the third row. The window says "Waiting to go out as AL1 · 1 change — SC · #3 remarks — earlier (no remarks) ·
SPARE · SPARE → (no remarks) · SPARE · SPARE". A scheduler reads "remarks" and two identical strings; nothing names the Flies tick.
Hand-ticking all four rows (break test 6) lists four "SC · #n remarks" lines of the same kind; flipping the ticked row to MAIN
(11a) reads "… SPARE · SPARE → (no remarks) · MAIN" (the role change shows, the tick still does not). The count itself is right (1 / 2 /
4 — see 3d, 11a, B6). Pictures: `A/A-1a-2-changes-window.png`, `A/A-B6-after-clear-top.png`, `A/A-11a-1-flipped-main.png`.

**F2 — after a keyboard press the Flies chip loses focus (focus drops to the page).** (FAIL, scenario 15; NOT new to this change:
the older MAIN / SPARE badge does the same.) Steps: focus the SPARE badge, Tab → focus ring lands on the dashed chip (solid 2px cyan
ring — PASS); Enter ticks it; the board repaints and the focused element is the page body, so a second Enter or Space does
nothing until the user tabs back from the badge. Each key does tick and untick when re-focused (Enter, Enter, Space, Space gave
lit, dashed, lit, dashed). Picture `A/A-15-1-tab-to-chip.png` (the ring). Screen-reader reading: the dashed chip is `button "FLIES"`,
the lit one `button "✓ FLIES" [pressed]`; the lit chip on a typed shift is a plain span (not in the tab order) with its "CX the row"
explanation in a hover title only, no aria-label — a keyboard or screen-reader user cannot read it.

**F3 — the + Wave picker's note is out of date.** (FAIL, a "most likely missing" item.) Steps: on the Scheduler Board press "+ Wave".
The note under the buttons says: "SC · AVALON · BB sit outside the day's flying count — two waves of four plus an SC reads 4 X 4 / 2."
With D1044–D1046 a standby shift with B or R typed counts as a jet and adds its own "X n" term (seen: Monday with two flying waves
and a flying SC reads "4 X 2 X 4 / 2"; a Saturday with SC, AVALON and BB flying reads "4 X 2 X 4 / 4"). Picture
`A/A-misc-1-wave-picker-note.png`.

**F4 — the Logic page contradicts itself about OIL for a standby shift.** (FAIL.) Logic → "Flight times — take-off and landing are the
same": "A flying line still earns its OIL; a standby shift earns none." The Standby section of the same page now says a row that
flies "earns OIL by default". Picture `A/A-misc-4-logic-earns-none.png` (the sentence outlined in orange; the Standby section is
the card on its right).

## Records worth his look (the RECORD rows above carry the numbers)

- **OIL Earn board vs tracker on a published day (1a, 1d, 1e):** a hand tick, its untick and a loaded plan change the OIL Earn board
  at once (Drifter "—" to "HO"); the Leave War tracker moves only at Publish AL. A CX does the same (4a, 4b). The brief reads "OIL Earn
  and the tracker do not move yet" — the tracker half holds; whether the OIL Earn board should stay frozen to the issued day is his call.
- **The tick is the row's, not the man's (11b):** with a ticked SPARE row emptied (both crew dragged back to the crew list) the chip
  stays lit and pressable, the day's count drops him (1 / 2 to 0 / 2), and a man dragged in afterwards inherits the tick (count back
  to 1 / 2). Dragging the man out to another row leaves the tick behind (11c). Flipping MAIN / SPARE keeps it lit and keeps one pending
  entry (11a: "1", not 2 — one entry per row).
- **Copies (14):** a day template does NOT carry the hand tick (R does carry); + Wave → SC starts dashed with the faint dash; the "+"
  (add a row) and "+ Line" buttons do not copy the tick; a saved plan (Plan A) brought out as the live day brings the tick back as
  one pending change; the tick and every chip survive leaving the week and a reload.
- **B only (10):** with only B typed on the board the week shows four lit chips, an empty R box and no B box anywhere; the words that
  explain the chips are in their hover text ("this shift has its B or R typed"). The week can take it back only through R (typing and
  clearing R in the week's own R box lit and cleared the chips); B can be cleared only on the board.
- **The faint dash (16):** the board's SC / AVALON / BB R and B boxes show the dash as their placeholder, the exact colour and
  strength of the faint "Remarks" (rgb 138,150,163 at 0.55); a tap puts nothing in (focus ring only); typing 0630 gives "06:30" in
  the ordinary colour; clearing brings the dash back; on a published day tapping both boxes left nothing pending. The week's empty
  SC R box shows the same dash (drawn by the page, same colour); View-only Sched shows no dash (an empty cell). Flying lines
  on the same day keep their suggested times (05:40, 06:20 in blue). **No light theme exists in this build** (no control; a light
  colour-scheme browser still gets the dark page), so "dark and light" could not be compared.
- **The board repaints only after the box is left (3, 15, B4):** typing 0630 into R shows "0630" and dashed chips until the box
  loses focus; then "06:30" and lit chips. A pre-existing pattern (the board is not redrawn under a focused box).
- **Mid-edit chip press (B4):** typed "06" in R, pressed the chip without leaving the box: the half-typed R was dropped (R empty
  afterwards, no half value), the tick landed once, focus ended on the page body.
- **Standby rows with nobody seated (9, 4d, 11b):** a dashed chip is drawn (and pressable on the board) on empty rows; the day's
  count ignores them. Not walked further — scenario 5 is another walker's.
- **Pending count after CX of a whole shift (4d):** four CXs read "5 pending", not 4 (an extra entry); Undo x4 returns to 0.
- **The changes window open (1a, 11b):** gold amendment dots show on every seated puck of the whole SC wave while the window
  is open, not only on the changed row (pictures `A/A-1a-2-changes-window.png`, `A/A-11b-1-emptied.png`); with the window closed
  there is no dot anywhere, none on the chip or the row. The brief's "where the amendment mark sits" answer: the top strip
  ("Not yet signed", "1 pending", "Publish AL1") and the changes window; nothing on the row itself.
- **A member (9):** has no Scheduler Board (`openScheduler` opens nothing visible); the member's read-only view is View-only Sched,
  which showed 5 lit chips on the test Saturday, no dashed chip, no button.
- **Two tabs (20):** no live sync between tabs; each keeps its own copy and the last tab to save wins on reload — A's tick
  survived and B's typed R vanished (round 2: B's untick won). Same as the control with two older edits. Not this change.

## Not walked, and why

- **Excel export and PDF (scenarios 9, 16):** saving a file out of the browser is a download; the brief did not give leave and I
  did not ask. Whether MAIN / SPARE / Flies appear there, and that an empty standby box prints no dash, is unchecked.
- **Crew rest and the long-day note for a flying SPARE (4a, 4b):** the scenario says his crew rest goes with the CX; I checked the
  count and OIL, not a crew-rest line (it needs a second-day set-up — scenario 2 / 6 territory).
- **A phone anywhere (9, 16):** desktop only by my share.
- **Scenario 9's "earlier published version's look":** walked inside scenario 1c (Original and AL1), not as a separate step.
- **Dark / light themes (16):** see the record above — there is no light theme to compare.
- **Pressing a cancelled row's chip (4c):** no chip is drawn on a cancelled row, so there was nothing to press.
