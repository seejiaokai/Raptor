# Walker A — rally box FULL check (19 Oct 26), build served on localhost:4298

Scripts: `raptor-port/scripts/handpass/rally-walk/A/` (lib.mjs + sc01…sc20, `results.log`). Pictures: `raptor-port/docs/img/handpass/2026-10-19-rally-build/A/` (cited as A/…png; every cited picture was opened unless marked). Fixture: a Saturday built through the board (+ Wave > Flying wave, VL, TO 12:00, LD 13:00, Saber/Echo seated), published through the sign-off selects. "Leave War OIL" = the Jul 18 cell of the Leave War grid; "hours" = Insights "work hours, report to debrief" (differences between two readings = the start moving). Every scenario in a fresh browser context.

## Summary
FAIL (2): **(A)** board at 821–1000 px wide: remarks column squeezed to 16 px and each line 189 px tall, board scrolls sideways (1440: 51 px / 199 px). **(B)** Insights hours ignore the "Default rally before take-off" for an empty R box (3h to 2h30 changes nothing) although the Logic page says Insights hours count from it; empty-box start in Insights is take-off less 1h. RECORD-grade, see 8: publishing straight after typing a box does nothing and wipes the sign-offs — but the TO box does the same, so not R-specific.
NOT WALKED: 13d (drag a line to another wave), 2 on a published Saturday, 14 for AVALON/BB.

## Table
| Sc | Size | Pressed | EXPECTED | SEEN | Verdict | Picture |
|---|---|---|---|---|---|---|
| 1a | desk | board: click empty R; type 0830; click elsewhere | 09:00 placed + highlighted; typing replaces; saved | box 09:00, selection "09:00"; after typing "0830"; saved rl 08:30 | PASS | A/A05a-1-clicked.png |
| 1a | desk | publish with R 08:30; Leave War/board OIL | full day | board OIL: Saber FO, Echo FO | PASS | A/A01a-published-R0830.png |
| 1a | desk | tap R (09:00 = nominal), leave, publish | OIL does not move (half) | rl 09:00; Leave War HO | PASS | — |
| 1b | desk | publish with R empty | half day | Leave War HO* (Saber, Echo) | PASS | — |
| 1b | desk | type R 08:30 on the published day | pending mark, gold mark on R, OIL still half | R box title "Edited — goes out as AL1", dotted outline (not a dot, on the board); button "Publish AL1"; Leave War still HO. **Board OIL Earn mode already reads FO (Saber FO) while the Leave War reads HO** | PASS (record the OIL-mode difference) | A/A01b-pending-R0830.png |
| 1b | desk | sign-off wipe (D103) | sign-offs wiped | "4 to sign" shown before AND after (my fixture had no signed names to lose) | NOT WALKED (could not set up a signed state that survives to the edit) | A/A01b-sign-strip-pending.png |
| 1b | desk | publish AL1 | full day | chip AL1; Leave War FO* | PASS | — |
| 1b | desk | open the Original version look | R empty | R and B boxes blank, version look read-only | PASS | A/A01b-original-version-look.png |
| 1c | desk | type R on published day, Undo | R empty, pending clears, OIL half | rl empty; button back to none; Leave War HO | PASS | A/A01c-after-undo.png |
| 2a | desk | whole-wave "06:00H: IN TIME" + VL R 07:00 | VL (and RU) start 06:00 | Saber hours = hours with R 06:00 alone (1570); Ranger the same | PASS | A/A02a-intime0600-VLR0700.png |
| 2a | desk | remove line with X | VL back to 07:00 start, RU to its base | 1510 = R 07:00 alone; Ranger 1080 = base | PASS | — |
| 2b | desk | "08:00H: RU IN TIME" + RU R 07:00 | RU starts 07:00, red order warning | Ranger 1320 = R 07:00 alone; warning "RU: in-time 08:00 is later than rally 07:00." red, text also under the line inside the wave | PASS | A/A02b-warning-panel.png |
| 2c | desk | "07:30H: VL RALLY" + VL R 08:00 | VL 07:30, RU unchanged | Saber 1480 = R 07:30 alone; Ranger 1080 | PASS | A/A02c-VLrally0730-VLR0800.png |
| 2d | desk | "07:00H: RALLY" (whole wave) + VL R 08:00, RU empty | VL 08:00, RU 07:00 | Saber 1450 (=08:00 alone), Ranger 1320 (=07:00 alone) | PASS | A/A02d-wave-rally0700-VLR0800.png |
| 2 | desk | each typed line removed with X | start moves back | all four steps moved back as expected (see rows above) | PASS | — |
| 2 | desk | same on a published Saturday (pending only) | each change reads pending | not run | NOT WALKED | — |
| 4a | desk | R 10:00, B blank (suggests 09:40), TO 12:00, no lines | red warning naming the suggested brief | "VL: rally 10:00 is later than suggested brief 09:40."; publish still allowed | PASS | A/A04a-box-only-warning.png |
| 4a | desk | look inside the wave for an explanation | RECORD | **none** — nothing in the wave explains it (the red note appears only under a typed line) | RECORD | same |
| 4a | desk | click the warning | RECORD what gets the ring | no ring on R box or its line; the crew pucks all dim, nothing lit | RECORD | A/A04a-warning-clicked.png |
| 4b | desk | add "06:00H: IN TIME" line, repeat | RECORD | warning unchanged (still "rally 10:00 is later than suggested brief 09:40"); the red sentence now shows UNDER THE IN-TIME LINE although the culprit is the R box; click again lights nothing | RECORD | A/A04b-warning-clicked.png |
| 5a | desk | click R; type 0830; leave; Undo; Redo; reload | placed+highlighted; replace; saved; ONE Undo restores empty box with faint 09:00; Redo; survives reload | all as expected; Undo presses = 1; box empty with placeholder 09:00; after reload rl 08:30 (needs sign-in again after reload) | PASS | A/A05a-3-undone.png |
| 5b | desk | click R, Escape, leave (unpublished) | empty, nothing saved, no Undo entry | box empty; model no rl; one Undo afterwards takes back the earlier WSO seat, not a rally entry | PASS | A/A05b-escape.png |
| 5b | desk | same on published Saturday | no pending mark | beak unchanged, no data-alp on R | PASS | A/A05b-pub-escape.png |
| 5c | desk | click CS, Tab x5 / Shift+Tab x5 | CS, MSN, R, B, TO, LD; nothing filled | exact order; R and B stayed empty both ways | PASS | A/A05c-tab.png |
| 5d | desk | click R then at once B | both placed and saved, one click each | R saved 09:00; B box 09:40 placed highlighted; saved 09:40 on leaving | PASS | A/A05d-R-then-B.png |
| 5e | desk | click R then at once Done / the Fri 17 tab | RECORD whether saved | saved in both (rl 09:00; board moved to Fri) | RECORD (good) | A/A05e-day-tab.png |
| 5f | desk | click R then Enter | RECORD | **placed 09:00 is NOT saved by Enter** and the box stays focused; with typed 0830 + Enter it IS saved (same as TO) | RECORD | A/A05f-enter.png |
| 8 | desk | change a box, press at once: "+ In-time", the line's X, "+ Line", "+ Wave", Sort all | acts once on first press | In-time +1 line, R saved; X removed it, B saved; "+ Line" +1 exactly; focused-unchanged TO then "+ Line" +1; "+ Wave" menu opens first press, then 1 wave; Sort all's confirm opens first press | PASS | A/A08-intime.png, A/A08-wave-menu.png |
| 8 | desk | type R 0745 then Undo; focus R then Redo | Undo takes only that; Redo first press | R back to 08:30 with TO 12:30 untouched; Redo gave 07:45 | PASS | — |
| 8 | desk | sign all four, type R (no leave), press Publish day | acts on first press | **did not publish**: the typed box wiped the sign-offs and the day stayed DRAFT, no message. Control with the TO box: identical | RECORD (not R-specific; the press is silent) | A/A08-publish2.png |
| 8 | desk | day tab / Done straight after R | acts first press | both worked (5e) | PASS | — |
| 9 | desk | Logic page | name "Default rally before take-off"; no "Nominal report" | name correct; old name nowhere on Logic/Edit Schedule; crew-rest text quotes "(Default rally before take-off)" | PASS | A/A09-logic-name.png |
| 9 | desk | 3h to 2h30 | empty R suggestions update (board 09:00 to 09:30; week 09:40 to 10:10); typed R stays; "+ In-time" fills 09:30 | all as expected | PASS | A/A09-board-suggestion.png, A/A09-intime-fill.png |
| 9 | desk | Published Sat, R empty, change default | reads pending | "Publish AL1" appears; Leave War stays HO; setting back to 3h clears it | PASS | A/A09b-pub-empty-after-change.png |
| 9 | desk | Published Sat, every R typed, change default | RECORD | NOT pending | RECORD | A/A09c-pub-typed-after-change.png |
| 9 | desk | Insights hours, empty R box, 3h vs 2h30 (TO 12:00 LD 17:00) | hours count from default (Logic text) | 1510 min both times; with R 09:00 typed (= default) 1630 (+120). Empty box starts at TO minus 1h, not minus the default | **FAIL** | — |
| 10 | desk | TO 10:00, R 06:00, "+ In-time" | fills 07:00 | 07:00; start stays 06:00; warning "in-time 07:00 is later than rally 06:00" shows | PASS (+RECORD) | A/A10-intime-fill.png |
| 12 | desk | Export CSV/PDF, published Saturday, R empty | Rally column before Brief; blank | CSV header and PDF header have Rally before Brief; Saturday cell empty | PASS | — |
| 12 | desk | change R on published day; History > To go out | changes window names it | "VL · rally 08:30"; Undo button reads "Undo — a rally time" | PASS | A/A12-history-togoout.png, A/A12-undo.png |
| 12 | desk | click that change line | jump to R | R box gets the flash class | PASS | A/A12-jump.png |
| 12 | desk | export while pending | issued (empty) R | empty | PASS | — |
| 12 | desk | publish AL1, export; week AL mark | 08:30 in Rally column | CSV `"","08:30","09:40"`; PDF VL row 08:30 / 09:40; week R box title "Changed at AL1" | PASS | A/A12-week-sat.png |
| 13 | desk | Plan B with R 08:30 brought out on published day | pending amendment, R marked | R 08:30, "Publish AL1", R box marked "goes out as AL1" | PASS | A/A13a-planB-out.png |
| 13 | desk | day template saved with R, applied on Friday | RECORD | **R travels** (Friday VL:08:30) | RECORD | A/A13b-friday-applied.png |
| 13 | desk | delete a line with R, Undo | R back | VL:08:30 restored | PASS | A/A13c-undo-delete.png |
| 13 | desk | drag line to another wave | R goes with it | three drags did not move the line | NOT WALKED | A/A13d-dropped.png |
| 14 | desk | wave switched to SC with R typed | board: no R box; week unchanged; export Rally blank | board line has no R box (cs,msn,br,to,ld); week no R box; export Rally empty | PASS | A/A14a-SC-board.png |
| 14 | desk | switched back to 1st wave | RECORD | R 08:30 returns, shows | RECORD | A/A14a-back.png |
| 14 | desk | cancelled line, R typed | its R must not set start | RU (Ranger) hours unchanged | PASS | A/A14b-cancelled.png |
| 14 | desk | cancelled line, R empty: look, click | RECORD | faint 09:00 shows; click places 09:00 highlighted (not saved until leaving) | RECORD | A/A14b-cancelled-click.png |
| 15 | 1440x900 | Monday board | one line, headings over boxes | R·B·TO·LD same top, header centres within 0 px; line 51 px, remarks 199 | PASS | A/A15-desk-board.png |
| 15 | 1440x700 | same | same | same | PASS | A/A15-short-board.png |
| 15 | 821 | same | one line, usable | one line, but remarks 16 px wide, line 189 px tall, board scrolls sideways (900: same; 1000: same; 1100: remarks 38, line 119; 1280: 139/51) | **FAIL** | A/A15-d821-board.png |
| 15 | 820 / 768 | same | stacked | stacked R/B and TO/LD, remarks 154, no sideways scroll | PASS | A/A15-d820-board.png |
| 15 | 402 | same | stacked; header shows CS MSN R/B TO/LD; remarks ~162 | stacked; header cells exactly those; remarks 154 | PASS (154 vs ~162) | A/A15-phone-board.png |
| 15 | 1440 at 125% (browser started at 125%, dpr 1.25 confirmed) | board and week | one line; four week times one size | one line; 11 px all four, nothing clipped | PASS | A/A15-125c-board.png |
| 15 | desk, phone | live board vs Original version look | match | box positions and sizes identical | PASS | A/A15e-desk-versionlook.png |
| 17 | desk | R 05:00, LD 17:00; clear R | grey long-day note; Insights from 05:00 | note "14h00, 05:00 to 19:00" appears, goes on clearing; Insights moved with R (see 9 FAIL for the empty-box baseline) | PASS | A/A17-R0500.png |
| 19 | desk | week: Tab / Shift+Tab / Enter | order CS MSN R B TO LD; Enter on R | order exact both ways, nothing filled; click R then Enter saves 09:40 and leaves (board does not, see 5f) | PASS | A/A19-week-tab.png, A/A19-week-enter.png |
| 20 | desk | R 08:00 on next week's Monday, back to this week | peek headed R/B, TO/LD, next week's values | headings R/B and TO/LD; R 08:00 above B 06:20; TO 08:40 above LD 10:05 | PASS | A/A20-peek-view.png |
| 22 | desk | reload; error list | R survives; no errors | R 08:30 survived (after signing in again); zero console/page/HTTP errors in every script | PASS | — |

## Errors seen
None — every script printed `errors []` (console errors, page errors, HTTP >= 400).

## Could not settle
- 1b "sign-offs wiped (D103)": the fixture's sign-off selects reset on publish, so there was nothing signed to see wiped. Needs a re-signed-then-edited sequence.
- 8 "publish right after a changed box": confirmed the press yields nothing because the edit wipes the sign-offs; whether that is intended (it matches the TO box) is the host's call; there is no message on screen.
- 15 (821–1000 wide) and 9 (Insights baseline): both could be older behaviour; no old build was served to me — the host should compare against main.
- 13d line drag across waves: three attempts, the line did not move.
- 5b "no Undo entry": proved by the Undo taking back the earlier change; the board's change counter did not expose a number.
- 14 AVALON/BB not tried; only SC.
- Scenario 2 on a published Saturday not run.
