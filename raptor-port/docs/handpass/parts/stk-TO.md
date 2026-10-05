# Walker TO — the Codex stack trial walk — 5 Oct 26

Served build: `http://localhost:4226` (frozen; nothing started, stopped or rebuilt). Every fixture through the app's own
controls (the board's "+ Wave" → "Flying wave", "+ Line", the formation boxes, a seat from the crew list, "+ In-time /
Rally" and its lines typed on the real keyboard, the line's ✕, CX, Logic's "Edit rules" box, the four sign-offs, Publish
day / Publish AL, the version menu, the print and CSV buttons). The step-by-step figures: `stk-TO.json`. Pictures:
`docs/img/handpass/2026-10-05-codex-stack/TO/`. P2-06, P2-07, P2-08 at desktop 1440×900 and phone 390×844; the rest at desktop.

## 1. The table

| # | What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|---|
| P2-06 | Monday, new wave: VL (Comet/Cinder) and RU (Havoc/Dash), both 12:00–13:00. Week: lines "08:00 IN TIME", "08:30 VL RALLY". Board: third line "09:00 VL IN TIME". Insights' Work hours after each. | Two lines: all four +7h (08:00 → 15:00). Third line: VL crew +6h30 (08:30), RU crew still +7h. Same on the phone. A red line then reads "VL: in-time 09:00 is later than rally 08:30". For the record: with no line at all each read +4h (the day starts 1h before take-off, not the 3h Logic names). | PASS (both sizes) | `dk-01…11-p206-*`, `ph-01…11-p206-*` |
| P2-07 | Tuesday, new wave: NX 01:00–02:00 (Vandal/Ryder). Week: "23:00 NX IN TIME", "00:15 NX IN TIME"; board: the two retyped in the other order. | 5h each before and after the swap (23:00 the evening before → 04:00). Half-way, both lines 00:15: 3h45. The message under the lines says "23:00 (previous day)"; the line and the board's wave header show the bare "23:00". | PASS (both sizes) | `dk-01…08-p207-*`, `ph-01…08-p207-*` |
| P2-08 | Monday, new wave, take-offs 12:00 and 13:00. Press "+ In-time / Rally"; retype 08:00; Logic's "Nominal report before T/O" 3h → 2h; press again. Once with the week's button, once with the board's. | Press 1 (Logic 3h): "12:00H: IN TIME + WX/NOTAMS". Press 2 (Logic 2h): "08:00H: IN TIME + WX/NOTAMS" — a copy of the line already there. Extra: every line removed, pressed again at 2h: "12:00H: IN TIME + WX/NOTAMS". Week = board, desktop = phone. | RECORDED | `dk-01…08-p208-*`, `ph-01…08-p208-*` |
| P2-09 | Logic searched ("words", "wording", "default", "button", "WX/NOTAMS", "rally") and every box in "Edit rules" listed. Then both buttons on new waves; then the three wordings typed by hand. | **Logic has no setting for the button's words** (22 boxes, none for it). Both buttons fill "12:00H: IN TIME + WX/NOTAMS". By hand: "09:00 RALLY", "09:00 RALLY — check 13:00" and "09:00" each start the crew at 09:00 (the 13:00 in the words did not take over). | NOT WALKED as written (the setting is not there) | `dk-01…09-p209-*` |
| P2-10 | Friday, new wave VL 12:00–13:00, B box blank (suggested 09:40), "10:00 RALLY". Four sign-offs, Publish day. Warning hidden with ✕, Publish day again. Rally corrected, published, Rally put back, Publish AL1. | Message: "VL: rally 10:00 is later than brief 09:40." — no "suggested". Publish day: "Cannot publish — VL: rally 10:00 is later than brief 09:40. Correct the timing first." Day stays DRAFT; the same after hiding the warning; "Publish AL1" refused with the same words. | **FAIL** | `dk-01…07-p210-*` |
| P2-11 | Friday, new wave, B typed 09:40, "08:00 IN TIME", "09:40 RALLY"; Rally to 09:41 and back, on the week and on the board. | 09:40: nothing. 09:41: red "VL: rally 09:41 is later than brief 09:40." under the lines and in both lists. Back to 09:40: gone. | PASS | `dk-01…08-p211-*` |
| P2-12 | Friday, new wave, no take-off: "RALLY AFTER IN TIME"; crew seated; "25:70 IN TIME"; then take-off 12:00 and "08:00 IN TIME"; then CX. A second pass, one change at a time. | Vandal and Ryder seated on a formation with no take-off: Insights prints **"NaN min"** for each, with a full-width bar — with or without a reporting line. With a take-off: 7h at 08:00; "25:70" and a lone "RALLY AFTER IN TIME" each get an amber "check the reporting instruction". Without a take-off nothing is said. CX: back to before. | **FAIL** | `dk-01…08-p212-*`, `dk-01…08-p212b-*` |
| P2-13 | Friday, new wave: VL (Vandal/Ryder) and VL2 (Nomad/Fable). "08:00 VL IN TIME"; "07:00 NOMAD" / "07:00 RYDER"; six clock spellings; "06:00 VL2 IN TIME". | VL's line moved only VL's crew. A name alone acted as a whole-wave line — both wordings gave the same figures. 0800, 08:00H, 0800H:, 8:00, 800 all show 08:00 and give 7h. "08.00" is not read and nothing says so. VL2 at 06:00 left VL at 08:00. | PASS | `dk-01…06-p213-*`, `dk-01…03-p213b-*` |
| P2-16 | Vandal on a new line on each of the seven days; Wed 06:00 → 19:30, Thu reports 05:00. Each warning tapped. Wed in-time retyped 08:00. | Long work day 13h30 (Wed), crew rest 9h30 (Thu, with "Breaks Thursday" on Wed), "7 days in a row" (Sun). Each tap lit only Vandal. After: 39h30 → 37h30, the long-day line gone, rest and 7-day lines still there. | PASS | `dk-01…07-p216-*` |
| P2-17 | Monday as the demo has it: sign-offs, Publish day. Then the four lines put in order, one unreadable line left ("VL RALLY AT 25:70"), published; corrected to "10:10 VL RALLY", not amended; every reader; then AL1. | As written: refused ("Cannot publish — VL: in-time 12:00 is later than brief 10:20…"). With the amber kind: View-only Sched (admin and member), the Original's read-only look and its list kept the old words and the warning until AL1; afterwards they show the new words, and the Original's look still shows the old. The peek, the printed sheet and the CSV carry no reporting lines at all; the CSV was the same file at all three stages. | PASS with an amber warning; the red kind cannot be published (finding 1) | `dk-01…15-p217-*` |
| H-01 | Monday's night wave: RU (Piston/Relay, Outlaw/Wisp) retyped take-off 10:00, landing 11:25; lines left alone. | No negative figure, bars in step. But the line still reads the bare "19:20H: NIGHT WAVE RU IN TIME"; the red RU timing line disappeared; the only words are grey notes "Outlaw has a long work day: 18h05, 19:20 → 13:25". Work hours: Outlaw, Wisp +14h40; Piston, Relay +12h (Relay tops the list, 28h10). | **FAIL** (third expectation) | `dk-01…07-h01-*` |
| H-05 | Tuesday, new wave NX 01:30–02:30 (Vandal/Ryder), Logic at 3h. "+ In-time / Rally" on the week; on a second wave, the board's. | Filled "01:30H: IN TIME + WX/NOTAMS" — not 22:30, no previous day anywhere. Work figure 3h (4h before the press). Red: "NX: in-time 01:30 is later than brief 23:10 (previous day)." | **FAIL** | `dk-01…04-h05-*` |

## 2. Findings

1. **A timing pair out of order blocks publication** (P2-10, P2-17). Steps: any line with Rally or in-time later than
   the brief → four sign-offs → "Publish day" (or "Publish AL1" on a published day). Expected: published, the warning
   stays (D509). Happened: "Cannot publish — … Correct the timing first."; hiding the warning changes nothing. Logic's
   own text says "publication and amendments are blocked until it is corrected". The untouched demo Monday cannot be
   published. `dk-04/05/07-p210-*`, `dk-01-p217-*`, `dk-01-p209-*`.
2. **The message never says "suggested brief"** (P2-10): B box blank, the message reads "…later than brief 09:40".
3. **"+ In-time / Rally" does not use the nominal report** (P2-08, P2-09, H-05, P2-06). It fills the take-off's own
   clock (12:00H; 01:30H), or copies a line already there; Logic's value changes nothing. Each fresh press therefore
   raises a red timing line, which (finding 1) blocks publication.
4. **No Logic setting for the button's words** (P2-09).
5. **A wave flying just after midnight** (H-05): no 22:30, no "previous day", 3h of work.
6. **"NaN min" in Insights** (P2-12): a crew on a formation with no take-off; full-width bars at the foot of the list;
   the day's list says nothing. `dk-01-p212b-*`, `dk-03-p212-*`.
7. **A reporting clock later than a changed take-off** (H-01) is silently taken as the evening before: 18–22 hour days
   for a 1h25 flight, said only in grey notes; the line and the board header show the bare clock.
8. Smaller: an unreadable instruction is explained only when the formation has a take-off; "08.00" is ignored without
   a word (P2-13); with no line the day starts 1h before take-off while Logic names 3h (recorded, not judged).
9. Seen in passing, outside my share: the Amendments box still shows a "Discard marks" button (`dk-02-p210-*`).

## 3. Errors
None: no console error, page error, 4xx or native dialog in any of the 17 runs.

## 4. Not walked
P2-09 as written (finding 4). P2-17's setup with a red warning (finding 1). No short-screen size and no phone pass
beyond the first three — the trial note sets the sizes. The printed page itself cannot be seen in this browser: I read
the sheet the app builds for the printer and re-drew it in a second tab for the picture.

## 5. Pictures
136 saved, 136 opened (plus 25 survey pictures in `TO/probe/`, not evidence).
