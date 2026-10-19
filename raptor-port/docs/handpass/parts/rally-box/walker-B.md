# Walker B - phone walk of the rally box (19 Oct 26)

App: http://localhost:4298/ (the build under test). Phone 402x874, density 3, finger taps (touchscreen, rests before lift), fresh browser context per scenario. Scenarios 3, 6, 7, 8 (phone), 11, 16, 18, 19 (phone), 21. Scripts: `raptor-port/scripts/handpass/rally-walk/B/` (s03*.mjs, s06*.mjs, s07, s08*, s11, s16, s18, s19, s21*). Pictures: `raptor-port/docs/img/handpass/2026-10-19-rally-build/B/` (written below as B/<name>). No source file changed. Every picture cited was opened.

**WebKit / iPhone engine: NOT available.** Playwright's webkit-2336 folder has no browser installed here, so scenario 6's tap-then-type could not be run in WebKit. All runs are Chromium, mobile-emulated. The "phone ignores the highlight" case (iOS) was SIMULATED: after the tap, the selection was collapsed to the end by script, then keys typed (6e, 7f). That proves the app's replace-on-first-keys fix; it does not prove real iOS behaviour.

Counts: 2 FAILs (F1, F2), 1 minor RECORD flagged (F3); everything else PASS / RECORD / NOT WALKED as tabled.

## Findings first

- **F1 (FAIL, board, phone): tap R, then B -> B's suggestion is NOT placed.** Tue board, RU line (empty R and B, suggestions 06:40 / 07:20). Finger on R places 06:40 (highlighted). Finger on B next: R is saved (model 06:40) but B ends focused with an EMPTY value (faint 07:20 shows as placeholder, white ring, nothing highlighted). Same with a 1.2 s pause between the taps. A second tap on B then places 07:20. B alone (nothing before) places correctly, and B-then-R places both. So the failure is specifically "R's save on leaving, then B is tapped". Scenario 5(d)/6 expects both placed and saved, one tap each. Picture B/B06b-RthenB.png, B/B06x2-B-second-tap.png. The Edit Schedule week does NOT have this fault (S7d passes).
- **F2 (FAIL, Logic page, phone): the first-press fix does not cover a plain box on the Logic page.** Logic, Edit mode, "Default rally before take-off" 3h typed to 2h30 (box still focused), one finger press on "Done": the value is saved (150 min) but the page stays in edit mode with the box still highlighted and "Done" still showing; a second press ends edit mode. With nothing changed, one press on Done ends edit mode (L1 PASS). So a button pressed right after a changed box is lost once here. Pictures B/B08z-L2.png, B/B08z-logic-Done.png. (Scenario 8 said to RECORD this for windows; recorded as FAIL because the press was swallowed. Not walked: an input's own window.)
- **F3 (RECORD, minor inconsistency, board): Enter after a tap.** On the board, tap R (05:40 placed) then Enter: nothing saved and the box keeps focus (saved only when you tap away / Done). Typing a value then Enter does save it (05:35, box still focused). On the week, tap R then Enter saves 09:45 and leaves the box. Tapping Done after a placed-only R saves it (09:45). So not a data loss, but the keyboard's Done key on the phone board leaves a placed rally unsaved until you tap away.

## Table (scenario / what I pressed / EXPECTED / SEEN / verdict / picture)

### Scenario 6 - phone Scheduler Board (Tue, openScheduler)
| Step | Pressed | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|---|
| 6a | tap empty R (VL) | 05:40 placed, whole value highlighted | value 05:40, selection 0-5, focused | PASS | B/B06a-placed.png |
| 6a2 | type 0530 | replaces | box "0530" | PASS | B/B06a2-typed.png |
| 6a3 | tap heading (leave) | saved 05:30 | model rl 05:30 | PASS | B/B06a3-saved.png |
| 6b | tap R then B (RU) | R 06:40 saved, B 07:20 placed | R saved; B value "" focused, placeholder 07:20 | **FAIL (F1)** | B/B06b-RthenB.png |
| 6b2 | leave | both saved | rl 06:40, br empty | **FAIL (F1)** | B/B06b2-both-saved.png |
| 6x1 | tap B alone | placed 07:20 | placed, selected | PASS | B/B06x1-B-alone.png |
| 6x2 | R, B, B again | RECORD | 2nd tap on B places 07:20 | RECORD | B/B06x2-B-second-tap.png |
| 6x3 | R, wait 1.2 s, B | placed | B empty (same fault) | FAIL (F1) | - |
| 6x4 | B then R | R placed | R 06:40 placed; B 07:20 saved | PASS | B/B06x4-BthenR.png |
| 6c | tap R, Enter (keyboard Done) | RECORD | box keeps 05:40 focused, model rl empty (nothing saved) | RECORD (F3) | B/B06c-done.png |
| 6x6 | tap R, type 0535, Enter | RECORD | saved 05:35, box "0535" still focused | RECORD | B/B06x6-typed-enter.png |
| 6d | tap R, swipe page up | RECORD | still focused, 05:40 in the box, not saved until a tap elsewhere (then saved 05:40) | RECORD | B/B06d-scrolled.png |
| 6e | tap, selection collapsed (iOS simulated), type 0555 | replaces, never appends | box "0555"; saved 05:55 | PASS (simulated) | B/B06e-typed-after-collapse.png |

### Scenario 7 - phone Edit Schedule week (Thu VL, TO 12:45)
| Step | Pressed | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|---|
| 7a | tap empty R | 09:45 placed, highlighted | text 09:45, selection 09:45 | PASS | B/B07a-placed.png |
| 7a2/7a3 | type 0930, tap heading | replaces, saved | saved 09:30 | PASS | B/B07a3-saved.png |
| 7e | tap typed R, select all, Delete, leave | cleared; faint suggestion returns | model empty, box empty, data-ph 09:45, faint 09:45 painted (teal) | PASS | B/B07e-cleared.png |
| 7b | tap R, Escape | box empty, nothing saved, Undo still disabled | empty, rl none, Undo disabled | PASS | B/B07b-escape.png |
| 7d | tap R then B | R saved 09:45, B placed 10:25 highlighted | exactly so; both saved after leaving | PASS | B/B07d-RthenB.png |
| 7f | collapsed selection, type 0955 | replaces | "0955" | PASS (simulated) | B/B07f-collapsed-typed.png |
| 7g | View-only Sched | typed R shows, empty R blank, empty B prints suggestion | VL 09:30; RU R blank; B 10:25 both | PASS | B/B07g-viewonly.png |

### Scenario 19 - Tab order (phone, finger focus then keyboard)
| Step | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| 19a week CS then Tab x5 | CS, MSN, R, B, TO, LD; R and B stay empty | exactly that; nothing filled | PASS | B/B19a-week-tab.png |
| 19b week Shift+Tab x5 | reverse | exactly reverse | PASS | - |
| 19c week tap R then Enter | RECORD | saves 09:45 and leaves the box | RECORD | B/B19c-week-enter.png |
| 19d/e board Tab and Shift+Tab | same order; nothing filled | same order; R, B empty and unsaved | PASS | B/B19d-board-tab.png |

### Scenario 8 - first press after a changed box (phone; R typed 0930, not left; then one finger press)
| Step | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| W1 week "+ In-time" | one line added, R saved | 2 -> 3, rl 09:30 | PASS | B/B08-W1.png |
| W2 week in-time line X | one removed | 2 -> 1, rl saved | PASS | B/B08-W2.png |
| W3/X7 week Undo | takes back only that change; Redo enabled | R empty, Undo disabled, Redo enabled | PASS | B/B08-W3.png |
| W4 week Templates | opens first press | R saved; menu/sheet opened (not asserted by name; picture) | PASS | B/B08-W4.png |
| W5 week change-history clock | opens first press | history window opened, R saved | PASS | B/B08-W5.png |
| W6 week TO focused unchanged, then "+ In-time" | exactly one line | 2 -> 3 | PASS | B/B08-W6.png |
| B1 board "+ Line" | exactly one line | 2 -> 3, R saved | PASS | B/B08-B1.png |
| B2 board "+ In-time" | exactly one | 2 -> 3 | PASS | B/B08-B2.png |
| B3 board in-time X | exactly one removed | 2 -> 1 | PASS | B/B08-B3.png |
| B4 board "+ Wave" then "Flying wave" | sheet opens on first press, one wave | sheet open; 2 -> 3; R saved | PASS | B/B08y-wave-sheet-after-change.png |
| B5 board dots menu then Sort all | menu opens first press, closes after Sort all | yes, R saved | PASS | B/B08y-more-after-change.png |
| B6/X6 board Undo | takes back that change, Redo enabled | R empty, Redo enabled | PASS | B/B08-B6.png |
| B7 board next-day arrow | day advances once, R saved on Thu | Thu -> Fri, rl 09:30 | PASS | B/B08-B7.png |
| B8 board Done | closes first press, R saved | closed; rl 09:30 | PASS | B/B08-B8.png |
| B9 board tap R (placed only) then Done | saved | closes, rl 09:45 | PASS | B/B08-B9.png |
| B10 placed, Enter, then Done | RECORD | saved 09:45, closed | RECORD | B/B08-B10.png |
| X8 week: after Undo, type B 1000 (not left), press Redo | RECORD | B saved 10:00, Redo now disabled (new change clears redo) | RECORD | - |
| L1 Logic: Edit then Done, nothing changed | one press ends edit mode | yes | PASS | B/B08z-L1.png |
| L2 Logic: change setting, Done | one press ends edit mode, value kept | value kept (150), edit mode still on; ended on 2nd press | **FAIL (F2)** | B/B08z-L2.png |
| Publish / sign-off | each acts once | NOT WALKED: needs four sign-offs first (not set up); an input's own window also NOT WALKED | NOT WALKED | - |
No double-firing seen anywhere (every count moved by exactly one).

### Scenario 3 - crew rest across days (phone). Fixture note
The seeded week has no Friday landing; I used the seed's Outlaw (lands Mon 20:45, flies Tue VL, crew rest 12h, clear at 10:45). Built in the app: both typed in-time lines on Tue wave 1 removed with their X; Tue VL typed to take-off 14:00 / landing 15:25 (nominal 11:00). Baseline had a seeded crew-rest breach (report 06:00); after the fixture it was gone.
| Step | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| fixture | in-times 0, TO 14:00, LD 15:25 | as typed | PASS | B/B03a-clean.png |
| 3a tap R (placed 11:00), type 1000, leave | R 10:00 saved; red crew-rest warning naming the rally | saved 10:00; "Crew rest (<12h) - Outlaw - Crew rest breach - Monday landed 20:45 ... told to report 10:00 - only 11h15 rest." The text says "report", never "rally" | PASS (RECORD wording) | B/B03a-breach.png |
| 3b Monday puck of Outlaw | dotted ring (D1013) | class "boxdot dim", title "Crew rest - Tuesday is broken by this day: he had to leave by 22:00" (was 18:00 under the seeded 06:00 report) | RECORD | B/B03b-monday-puck.png |
| 3c Tue puck | RECORD | red "Crew rest breach (<12h)" chip/ring, no rally wording | RECORD | - |
| 3e AIRCREW palette | his entry marked | Outlaw red-ringed with "R" chip, title "Crew rest breach (<12h)" | PASS | B/B03e-palette-breach.png |
| 3f clear R (select all, Delete, leave) | warning goes | R empty, no crew-rest line | PASS | B/B03f-cleared.png |
| 3g palette after clearing | entry unmarked | plain dim entries, no breach title | RECORD | B/B03g-palette-cleared.png |
| 3i TO 13:30 (nominal report 10:30), no R, then R typed 11:00 | tight advisory; RECORD text | with no R: "Tight turning - crew rest ... T/O 13:30 puts the 3h report at 10:30, inside 12h. Monday landed 20:45 ... crew rest clear at 10:45"; with R 11:00 the SAME advisory stays, unchanged, no mention of the typed R or "in-time" wording; TT chip on his Tue pucks | RECORD | B/B03i-typedLater.png |
| 3j arming a seat | barred with reason | NOT WALKED: tapping an occupied Tue seat did not arm anything and no empty seat existed; palette pucks only showed the breach title | NOT WALKED | B/B03j-palette-armed.png |

### Scenario 11 - the evening before (phone; Saturday wave built through the board "+ Wave" > "Flying wave")
| Step | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| fixture | VL, TO 01:30, LD 03:00 | as typed | PASS | - |
| 11a tap R | 22:30 placed, highlighted | 22:30, selected | PASS | B/B11a-placed.png |
| 11a2 leave | saved; board shows "(prev day)" | rl 22:30; "(prev day)" beside the wave title; B suggestion 23:10 | PASS | B/B11a2-board-prevday.png |
| 11a3 week header | "In-time / Rally 22:30 (prev day)" | "WAVE 1 - In-time / Rally 22:30 (prev day)" | PASS | B/B11a3-week-prevday.png |
| 11a4 Sat / Fri warnings | RECORD | only "OIL waiting - this day is not published" on Sat; nothing on Fri (wave uncrewed) | RECORD | - |
| 11b R 09:00, TO 12:00, then TO changed to 08:30 | RECORD | R stays 09:00 and now reads as the day before: header "In-time / Rally 09:00 (prev day)", B suggestion becomes 06:10; no toast, no warning anywhere | RECORD (silent) | B/B11b-to-moved-earlier.png, B/B11b2-week.png |
| OIL credit / crew rest on Friday with a crewed man | - | NOT WALKED: a palette crew attempt picked a WSO into the FCP seat (illegal-seat warning) and the following R tap missed, so the crewed variant was dropped; OIL readout not checked | NOT WALKED | - |

### Scenario 16 - member (us/us) at 402
| Step | Expected | Seen | Verdict | Picture |
|---|---|---|---|---|
| 16a View-only Sched Thu | typed R shows; empty R no faint suggestion; not editable | VL R 09:30; RU R blank (spacer only), B 10:25 prints; no contenteditable | PASS (my script's own check tripped on the spacer; picture shows blank) | B/B16a-member-view.png |
| 16b finger tap on empty R | nothing placed, saved or toasted | rl empty, box empty, no toast, Undo state unchanged | PASS | B/B16b-member-tap.png |
| 16c/d read-only board | typed R shown, no suggestion | NOT WALKED: a member has no way to open the board (openScheduler does nothing for him) | NOT WALKED | B/B16c-member-board.png |

### Scenario 18 - wave bands (phone)
Tue wave 2 (typed in-times 12:00 VL / 11:40 RU), no part-day unavailability built. Typed R 10:00 on wave 2 VL: the Available crew section changed from "1ST WAVE AM-11:40 . 30 CAN FLY" to "1ST WAVE AM-10:00 / 2ND WAVE 10:00-END . 23 CAN FLY / AVAILABLE ALL DAY . 22"; Warden, Drifter, Gambit, Outlaw, Basher, Echo, Hex etc. left the first-wave list. RECORD: an R earlier than the wave's typed in-times moves the wave's start and band boundary (11:40 to 10:00) and men's availability marks with it. Picture B/B18a-avail-after.png. Part-day unavailability / SANS window variant NOT WALKED (no such input near a wave start was built).

### Scenario 21 - two tabs
Tab B opened first (not reloaded), tab A types R 09:30 on Thu VL, then B types B 10:15 on the same line. A third fresh tab reads: R empty, B 10:15. **The stale tab's save wiped the other tab's R.** Control run with plain boxes (A types TO 13:00 on RU, B types mission "XYZ" on VL): fresh tab shows TO back at 12:45, so it is the app's whole-week save in each tab, not specific to the rally box. RECORD. Picture B/B21-tabB.png (and B/B21c-tabB.png).

## Errors seen
Console errors and page errors across all scripts: none.

## Could not settle
- WebKit not installed: iOS select-all behaviour untested for real; 6e/7f are simulated.
- F1 root cause (the board redraw after R's save swallowing B's placement) is my inference from the order dependence; not code-read.
- Scenario 3 on the seeded Mon/Tue instead of Fri/Sat; arming a seat, OIL on a crewed weekend, an input's own window, publish/sign-off, member board and part-day unavailability not walked (reasons above).
- Desktop halves of 6, 7, 8 belong to the other walker.
