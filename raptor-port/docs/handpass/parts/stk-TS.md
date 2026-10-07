# Walker TS — report (frozen build at localhost:4227, 5 Oct 26)

Pictures: `raptor-port/docs/img/handpass/2026-10-05-codex-stack/TS/` (dk- = desktop, ph- = phone). Scripts: `raptor-port/scripts/handpass/stk-TS-*.mjs`. Results: `stk-TS.json`.
"Work hours" are the week totals on Insights; I compare before/after for the named crew. Phone Insights is reached through the drawer's "Week insights" (see finding 7).

| Scenario | What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|---|
| P2-06 (desktop + phone) | Monday wave 1, VL and RU take-off 12:00 typed, lines cleared, "+ In-time / Rally" and typing: A = "08:00H: IN TIME" + "08:30H: VL RALLY"; B = + "09:00H: VL IN TIME" | No lines: RU crew start 11:00 (Drifter 12h10). A: all eight crew earlier, VL and RU both start 08:00 (Echo 17h35→20h35, Static 22h20→25h20, Drifter 12h10→15h10, Relay 18h10→21h10). B: VL crew move later by 30 min (Echo 20h05, Static 24h50); RU unchanged (15h10, 21h10). Red line in B: "VL: in-time 09:00 is later than rally 08:30." Phone identical. | PASS | dk-03/05/07 p206, ph-05/06 p206 |
| P2-07 (desktop + phone) | Tue wave 1, VL take-off 01:00; lines "23:00H: VL IN TIME", "00:15H: VL IN TIME", then swapped | Hours none→with lines: Warden 16h15→17h15, Basher 24h15→25h15, Outlaw 15h30→16h30, Hex 21h→22h; identical after swap. Message: "VL: in-time 23:00 (previous day) is later than brief 22:40 (previous day)." Phone identical. | PASS | dk-05/06 p207, ph-05 p207 |
| P2-08 (desktop + phone) | Take-offs 12:00/13:00, no lines; pressed the button on the week (Logic nominal 3h), retyped 08:00H, Logic nominal -> 2h, pressed again on the week, then on the Board; then on a fresh Friday wave (take-off 14:00, nominal 2h) | Press 1: "12:00H: IN TIME + WX/NOTAMS" (nominal 3h). Press 2: "08:00H: IN TIME + WX/NOTAMS" (nominal 2h). Press 3 (board, nominal 2h): "08:00H: IN TIME + WX/NOTAMS". Fresh wave, take-off 14:00, nominal 2h: "14:00H: IN TIME + WX/NOTAMS" with red "in-time 14:00 is later than brief 11:40". Phone identical. | RECORDED | dk-01/03/04/05/06 p208, ph-05 p208 |
| P2-09 | Logic, Edit rules: read every box and label; searched "rally" | The nominal-report row holds one box. No box, key or text for the words the button fills in anywhere on Logic. Fill is always "...: IN TIME + WX/NOTAMS". | NOT WALKED (the setting is not on this build) | dk-01 p209 |
| P2-10 | Fresh Friday wave VL, take-off 12:00, blank Brief, line "10:00H: VL RALLY"; signed four; Publish day; control with rally 09:30; then rally 10:00 on the published day and the amendment button | Red line: "VL: rally 10:00 is later than brief 09:40." (no "suggested"). Publish day: toast "Cannot publish — VL: rally 10:00 is later than brief 09:40. Correct the timing first."; day stays DRAFT. Control with 09:30: publishes (ORIG). Amendment with the warning: same "Cannot publish" toast, stays ORIG, "Publish AL1" remains. | FAIL | dk-03/07 p210 |
| P2-12 | Fresh Friday wave, Ace seated, blank formation: "RALLY AFTER IN TIME"; "25:99H: IN TIME"; callsign VL, take-off 12:00, "08:00H: IN TIME" + "RALLY AFTER IN TIME"; then CX | No take-off: Insights prints "NaN min" for Ace with a full-width bar, every other bar also full width; board says "No conflicts flagged". Same with no line at all (control), so it comes from a seated crew with no take-off, not from the text. "25:99H" and "RALLY AFTER IN TIME" raise no advisory. Valid: Ace 25h35→31h35 (+6h: 12:00 default start to 08:00... in-time). Cancelled: back to 25h35. | FAIL (NaN hours, nothing explains the missing data) | dk-02/03 p212, dk-06/09/10 |
| H-05 | Tue new wave ZZ, take-off 01:30, landing 02:30, Cinch seated; nominal 3h; pressed the button on the week | Line filled: "01:30H: IN TIME + WX/NOTAMS" (not 22:30). Warning: "ZZ: in-time 01:30 is later than brief 23:10 (previous day)." Board header "In-time / Rally 01:30 · 1 ac", no day word. Cinch Work hours 8h30 → 13h (crew and times, no line) → 12h (after the press); never negative. | RECORDED | dk-03/04/05 h05 |
| P2-11, P2-13, P2-16, H-01 | Walked before the cut | P2-11 PASS (equal rally/brief no warning; 09:41 warns; back to 09:40 clears). P2-13 PASS (VL line moves VL only; unnamed "07:00 Blade IN TIME" moves the whole wave; spellings 0800, 8:00, 800, 08:00H accepted; "8" and "08.00" silently ignored). P2-16 PASS (Static on seven days: DAYS_RUN warning; long-day note + crew-rest breach appear with 03:00/03:30 in-times; Monday moved to 07:00 clears Monday's long-day note, hours 43h50→39h50, seven-day warning stays). H-01 RECORDED: Tally 4h10→18h25, Saber 17h10→25h55; none negative; the evening line still reads "19:00H" with no previous-day word and its red warning disappeared; long-day notes say "19:00 →". | as stated | see json |
| P2-17 | NOT WALKED — share cut by the host | | NOT WALKED | |

## Findings
1. **"Cannot publish" (P2-10).** Publishing and amendments are refused for a reporting-order warning; the Logic page text on this build also says so. Steps: Friday wave, blank brief, rally 10:00 vs suggested 09:40, sign, Publish day. Expected: published (D509), message saying "suggested brief". Got the refusal toast; message has no "suggested".
2. **"NaN min" in Insights (P2-12).** Seat a person on a new wave with no take-off. Work hours shows "NaN min", every bar full width. Control without any reporting line gives the same.
3. **The button fills the take-off itself (P2-06/08/H-05).** With nominal 3h or 2h and no line, it fills the earliest take-off with no lead taken off (12:00, 14:00, 01:30). Expected earliest take-off minus nominal (09:00, 12:00, 22:30). Recorded for the host.
4. **No words setting on Logic (P2-09).**
5. **Unrecognised clocks raise no advisory** ("25:99H", "08.00", "8", "RALLY AFTER IN TIME" with no in-time); Logic says they should.
6. **Amendments box still shows "Discard marks"** (seen in every desktop picture, e.g. dk-05 p206); outside my share, D488 says it is gone.
7. **Not mine, seen in passing:** no Insights button on the Scheduler Board at 1440 or 390 (the phone board's "⋯" holds only Sort all / Desktop layout); the phone Edit Schedule toolbar has no "⋯" after Highlight and the drawer still has the WEEK block ("Pick a date…", "Week insights").
8. A rest message reads "only -0h05 rest" (Tue VL, P2-07) — a negative figure in a warning, not in work hours.

## Errors
No console errors, page errors or 4xx in any run. One walker artefact: opening the Board through the probe bridge (`openScheduler`) left it blank once; the real day button always drew it, so not an app finding.

## Not walked
P2-09 (setting absent), P2-17 (cut). H-01 phone, P2-11/13/16 phone were never required.

117 pictures saved (includes surveys and probes); about 38 opened and judged.
