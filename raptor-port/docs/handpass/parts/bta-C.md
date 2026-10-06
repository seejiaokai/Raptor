# Walker C — `[BLANK-TIMES-ABSENCE]` / `[SC-PICKER-INTIME-REST]`, server :4233 (frozen build), desktop 1440×900 (phone 390×844 for S08 and S10)

Man X = Vandal (`split`), Cobra (`taipan`) in the first MAIN row's front seat, X in the second MAIN row's front seat. He lands 22:30 Monday (clear 12:30 Tuesday). Pictures in `docs/img/handpass/2026-10-06-blank-times-absence/C/` (`dk-` desktop, `ph-` phone). Rows in `bta-C.json`. Scripts `scripts/handpass/bta-C-*.mjs`.

| # | What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|---|
| S08 desk | SC shift 13:00–19:00, B 05:00, Cobra in MAIN row 0; armed the other MAIN seat | crew list, before any drop: Vandal struck, "crew rest — not clear until 12:30" | PASS | dk-01-s08-armed-main |
| S08 placed | pressed his name | toast and list: "Crew rest breach — Monday landed 22:30, +2h debrief assumed → ended 00:30 → crew rest clear at 12:30, but SC AM starts 05:00 — only 4h30 rest."; puck ring + chip R | PASS | dk-04-s08-placed-list, dk-02/03 |
| S08 drag | real drag from the crew list, held over the seat | bubble under the dragged name: "crew rest — not clear until 12:30"; after the drop the same breach | PASS | dk-05-s08-drag-bubble, dk-06 |
| S08 phone | same, phone drawer | drawer: Vandal struck, "crew rest — not clear until 12:30"; placed → same breach | PASS | ph-01…04 |
| H-04 | words after placement | the line is the breach sentence above: it calls **05:00 (B, the in-time) "SC AM starts"**, not the shift's typed 13:00 start; it names "Monday landed 22:30" and "clear at 12:30" | RECORDED | — |
| S09 | shift start and end cleared, B 05:00 kept | armed: struck "crew rest — not clear until 12:30"; placed: same breach; drag bubble the same; no clock invented | PASS | dk-07-s09-armed-blank, dk-10, dk-11 |
| S10 | SC SPARE, then AVALON, then BB (B 05:00 typed on each); armed and placed, desktop and phone | Vandal not struck, plain name, no rest reason; after placing: no crew-rest warning naming him | PASS | dk-13, dk-15, dk-17, ph-01/03/05 |
| S11 | Wed flight (report 06:00); Tuesday SC ends 23:30 | armed: struck "crew rest — breaks Wednesday: he must be gone by 18:00"; placed: Wednesday breach "Tuesday ended 23:30 → crew rest clear at 11:30, but told to report 06:00 — only 6h30 rest." | PASS | dk-19-s11-armed, dk-20 |
| S32 | B 12:29 / 12:30 / 12:31, shift start 14:00; then B 13:00, start 12:00 | 12:29 struck "not clear until 12:30"; 12:30 not struck; 12:31 not struck; B 13:00 with start 12:00 struck | PASS ×4 | dk-01…04-s32 |
| S33 | start 01:00, B 23:00; B cleared; B retyped and placed | B 23:00 struck 12:30; B cleared still struck 12:30; placed: "…SC AM starts 23:00 (previous day) — 1h30 before his Tuesday duty ends." | PASS | dk-05, 06, 08 |
| S34 | empty MAIN / only SPARE sibling / MAIN sibling / sibling removed and put back by Undo / Redo | empty MAIN, B 05:00: not struck (known limit) RECORDED; empty MAIN with start 12:00: struck 12:30 PASS; SPARE-only: not struck PASS; MAIN sibling: struck PASS; Undo took Cobra out and disarmed the seat; re-armed: not struck PASS; Redo: struck PASS | PASS (a, d1 RECORDED) | dk-09…15 |
| S35 | held seat; seat-to-seat drag to SPARE; sole MAIN man to the other MAIN seat; on the edit week his only Monday late seat onto Tuesday MAIN; same with a second Monday late seat (ZN 23:00–23:45) | own held seat: not struck, tooltip "already tasked today, but you can still plan him"; drag bubbles: SPARE none; sole→MAIN none; sole Monday seat none; with second late seat **"crew rest — not clear until 13:45"** | PASS | dk-02-s35-1, dk-03, dk-01-s35b, dk-02-s35d-2-held |
| S20 | B `0500`, `05:00`, `0500H`; `12:90`, `25:00`; B = shift start; shift start = end | the three forms all store 05:00 and strike alike; `12:90` / `25:00`: toast "12:90 is not a time — try 0900 or 09:00", box goes back to 05:00; B 14:00 = start 14:00: not struck; start 19:00 = end 19:00: struck 12:30 | PASS (equals RECORDED) | dk-01…07-s20 |
| H-05 | LL all Tuesday; X in MAIN row 0 and SPARE row 2 of one SC formation, board and week | blank, typed 13:00–19:00 and cleared again: **both pucks wear a solid red ring and chip C**, board and week; list has one line "On leave but tasked — SC AM — reason: Wedding" (typed adds "standing SC SPARE … and also on SC AM MAIN" double-book) | RECORDED | dk-01…06-h05 |
| S29 | Meeting, Training, Appointment, Personal, Other, each all day Tuesday; seated on a blank flying line; ALL AVAIL on a 15:00–16:00 ground row; opened its window | blank line warns each time ("Meeting clashes with this line — reason: Full-day"). Window: 35 men, **Vandal not in the crowd** with any of the five. Control with no input: 36 men, he is there, no flag, tap says "Vandal — nothing else on the programme at that time." | PARTIAL | dk-07-s29-Meeting-window, dk-01-s29-none-window |
| S36 | (Torch, a man not SC NIGHT current, Cobra in MAIN) Monday landing 22:30; B 05:00; placed; shift made 19:00–07:00; OL all day filed; then crew-rest cause, shift cause, OL removed one at a time | all three: list holds leave, crew-rest and "SC NIGHT currency needed" lines, puck shows only chip Q (priority); after each removal only that line goes, the others stay; chip falls back to C then none | PASS | dk-03-s36-1…dk-09 |

## Findings
No FAIL on this share. Things the host should look at:
1. **H-05 / S02 (F3 look):** with a local leave (silent for an SC SPARE in the oracle), the SPARE puck still wears MAIN's red ring and C, blank and typed. Steps: file LL all Tuesday for Vandal, "+ Wave" → SC, clear its shift start/end, put him in MAIN row 0 and in the SPARE row.
2. **S29 cannot be reached as written:** every whole-day input I tried removes the man from the ALL AVAIL crowd, so the window's reading of the blank-seat warning is untestable. The part-day route would not warn (silent against a blank seat).
3. Side note, not tested further: in an S36 first attempt a brief (B) typed later than the line's take-off did not stay (it went back to 05:00); I did not look at whether a message showed.

Errors seen (console, page, 4xx, dialogs): none in any run.

## Not walked
Crew-list drag for S11, S33, S34; drag bubbles for S10's SPARE/AVALON/BB (armed list and placement only); phone for S09/S11; S35's "within the same shift" move to a second MAIN seat (only two MAIN rows, one holds Cobra, so I moved to SPARE). The first S35 run lost the seat by releasing outside the board ("drop to unassign"); redone, those pictures deleted.

Pictures: 86 saved (final set), 19 opened and read (plus 4 stale ones opened then deleted).
