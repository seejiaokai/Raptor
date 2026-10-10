# Walker C - ALL AVAIL / ALL and Event: everything around publishing a day (9 Oct 26)

Server http://localhost:4233/ (frozen build). Scripts `raptor-port/scripts/handpass/aa-C-*.mjs`; pictures `raptor-port/docs/img/handpass/2026-10-09-all-avail-event-check/C/`; data `aa-C.json`.
"Credited" = the Leave War grid cell of Ranger, Saber, Basher, Ace on the date (HO* = half a day, FO* = full day, empty = nothing). The OIL tracker sheet itself was not opened.
Filer was the admin (Saber) in every run; the member / guest were reached in place (S15 bell, S51). Every fixture was made through the app's own controls; the probe bridge was used only to read, and (S15, S51) to switch role/identity in place.

| # | Size | Role | Verdict | What the screen said | Pictures opened |
|---|---|---|---|---|---|
| S4 | 1440x900 | admin | PASS | Original: all four HO*. Puck dragged off, AL1: all four 0. Preview Original, Load onto working copy: toast "viewers still see AL1 until you publish", face AL1 with 2 pending, puck and count 45 back, credits still 0, View-only still shows AL1 without the puck. Undo/redo/reload agree. AL2: HO* again. | S4-03, S4-05, S4-09 |
| S5 | 1440x900 | admin | PARTIAL | Plan A earns 45 of 45, Plan B (Ranger denied) 44 of 45; switching plans on the published day credits nothing new (all HO*), reads 1 pending; undo/redo/reload agree; AL1 of Plan B: Ranger 0, others HO*. "Switch to this plan" on a preview NOT reachable (see below). | S5-03 |
| S10 | 1440x900 + 390x844 | admin | PASS | Orders A, B and reversed C: 0 before first issue; after issue an answer change clears the four sign-offs, reads 1 pending, credits unchanged; Undo restores signatures and 0 pending; AL pays the new answer. Phone repeat of order A identical. | S10-A1, S10-A4, S10-B2, PH-01..03 |
| S11 | 1440x900 | admin | PASS | Working crowd 45 -> 44 on filing Ranger's leave; issued credit kept (Leave War figure 0.5, clash banner) until AL1, then 0 and "LL"; reverse order restores HO* only at the AL. | S11-C2, S11-C3, S11-A2 |
| S12 | 1440x900 | admin | PASS | Editor asks the OIL question again on every person change; issued credits unchanged until AL1; Ranger/No pays 0, placeholder/Yes pays HO*; before-Original conversion pays 0. | S12-A1, S12-B2 |
| S13 | 1440x900 | admin | PASS | Sat HO* only after AL1; moved bar asks a fresh question for Sunday; Sat kept until AL2, Sun only once issued, deletion only at AL1. Replays agree. (Filing-before-Original comparison not walked.) | S13-02, S13-03a, S13-04 |
| S14 | 1440x900 | admin | **FAIL** | See finding 1. | S14-02, S14-05, S14d-weekend |
| S15 | 1440x900 | admin (member bell in place) | PASS | PH after a zero Original: day 1 pending, credits 0; only the filer's bell lights; Yes + AL1: HO*; PH removed: HO* kept, day reads 1 pending ("What this day earns changed"); AL2: 0. Same when PH is declared before the first issue. | S15-A1, S15-A3, S15-A5 |
| S20 | 1440x900 | admin | **FAIL** | See finding 2 (part A). Part B passes. | S20-05, S20-03, S20-08 |
| S26 | 1440x900 | admin | PASS | 7h Yes: FO* each. Threshold 6h01 -> 8h: 1 pending, window names the rule and each man "full day -> half day"; credits stay FO* until AL1, then HO*. | S26-02 |
| S51 | 390x844 touch | admin / member / guest | PASS | Member: issued face (45) vs "Working draft - not issued" (44, leave shown). Guest: Saturday ORIG with ALL AVAIL 45 + Event, Sunday DRAFT with ALL; no picker, no pending button, no editor; tapping count or puck opens nothing. Credits HO* until amendment. | S51-03, S51-04, S51-07 |
| S52 | 1440x900 | admin | PASS (with a recorded gap) | Inputs List export keeps ALL AVAIL / Duty and Ranger / Event. The schedule CSV and the print/PDF show flying lines only - no Ground, placeholder or Event row, so the promised Event Ground print surface does not exist. A published flying day with a pending edit exports/prints its issued face. | S52-03 |
| S56 | 1440x900 | admin | PARTIAL | HO* -> 0 -> FO*, each replay-checked and reloaded; previews of Original and AL1 change nothing. "EOD" has no control in this build; AL2 stood in. | S56-01, S56-preview-AL1 |

## Findings
1. **S14 - a taken-off request on a weekend leaves a false pending.** Saturday issued empty and signed; a placeholder Event (or Duty) filed and then taken off, or a dormant (taken-off before issue) request deleted from the editor, or moved off the date, each leave the day on "1 pending - What this day earns changed" and wipe the four sign-offs; expected 0 pending and the sign-offs kept (D174, D176). Replays and reload keep it. Not placeholder-only: a named man's Duty does the same; a weekday control (named Training on Wednesday) correctly returns to 0 with sign-offs kept. No OIL is credited from the dormant request. Pictures: S14-02-after-take-off.png, S14-05-after-delete.png (Sunday), S14d-weekend-named-Duty-Sat.png vs S14d-weekday-named-Training-Wed.png.
2. **S20 part A - archiving a man makes an issued placeholder day read pending.** July 18 issued with an ALL AVAIL Duty (Ranger only in the crowd); Admin > Users > Ranger > Archive. The July day then reads "1 pending" with the line "Ranger - posted out: no -> yes", and the four sign-offs clear. Expected nothing pending (the crowd stays as it went out). The same archive on a day with no placeholder reads 0. Credits (HO*) and the frozen crowd (45) were kept. Picture: S20-05-pending-placeholder.png.
3. **S5 - "Switch to this plan" on a preview cannot be reached through any control.** The draft preview exists only on View-only Sched (unpublished day, read only, no button); after choosing it there, Edit Schedule showed no preview bar; the plans menu switches plans directly. The selector route was walked and passes.

## Not walked / limits
S13 "compare with filing before Original"; the OIL tracker sheet (Leave War grid read instead); the List pencil in S12 (the calendar card's editor used); member as the filer in S10-S13 (admin filer only); EOD (no control).

## Console / page errors
None in any run (the error list was empty after every script).

## Other things that looked wrong (not in a scenario)
- One person change reads "2 pending" on the day (S12 A2; S4 after dragging the puck off) while a weekday single edit reads 1 - a placeholder swap counts the row and "what this day earns changed" separately. S4-05 / S12-A1.
- "What this day earns changed" (S14, S15) names no cause, while the Logic case (S26-02) names it exactly.
- 390x568: the editor window's Save sits below the fold and is reached by scrolling inside the window (PH-04-editor-568.png); the ALL AVAIL window fits (PH-06-availwin-568.png).
- Opening the bell with one task goes straight to the question (no list) - noted, fine.
