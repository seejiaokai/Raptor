# [RALLY-PER-FORMATION] — the scenario designer's report (a fresh Opus, blind to the build chat, 19 Oct 26)

Saved whole as it arrived (the order's §4; the overnight guide: a helper's report is saved before anything is done about
it). Read-only; it read the full rows of D1026–D1034, D45, D503, D505, D506, D509, D510, D554, D591, D592, the design
note, RB1–RB7, the order §6, §7.1, §7.4 and the diff c4cad58e1..HEAD. Defaults: admin; "Pub Sat" = a Saturday published
through the app; "Unpub" = an unpublished weekday. After every step: Undo, Redo, reload — the screen recorded each time.

## Scenarios (most valuable first)

1. **OIL on a weekend, both orders** (desktop 1440, then the Leave War's OIL tracker). Pre: a Saturday flying line TO
   12:00, LD 13:00, crewed, day end 15:00; nominal 09:00 = half day (D592's example). (a) Before publishing: tap the R
   suggestion — 09:00 placed, OIL must not move (equal to the nominal); type 08:30; publish → full day. (b) Publish
   first with R empty (half day); then type R 08:30 → the pending mark, sign-offs wiped (D103), a gold dot on R, the
   OIL tracker still a half day; publish the amendment → full day; the earlier version's look still shows R empty.
   (c) As (b) but Undo before amending → pending clears, OIL never moved. Rulings D591, D592(4), D1032, D45, RB7.
2. **Precedence, the box and the typed lines** (Unpub, desktop; watch the long-day note, the crew-rest trace, the OIL
   Earn readout). (a) Whole-wave "IN TIME 06:00" + VL R 07:00 → VL starts 06:00 (D1034). (b) "RU IN TIME 08:00" + RU R
   07:00 → RU starts 07:00 and a red order warning. (c) Typed "VL RALLY 07:30" + VL R 08:00 → 07:30 (D506). (d)
   Whole-wave "RALLY 07:00" + VL R 08:00, RU's box empty → VL 08:00, RU 07:00 (D505). Remove each typed line with its ✕
   and watch the start move. The same on a Pub Sat: each change reads pending only.
3. **Crew rest across days** (desktop, then phone). Pre: a man lands Friday 21:10 and flies Saturday. Type a Saturday
   R that breaks his rest → the red crew-rest warning, a trace naming the rally; Friday's puck the dotted red ring, and
   his entry in the crew palette (D1013); arming a Saturday seat shows him barred, with the reason. Clear R → the
   warning goes. Type an R later than the nominal → the tight crew-rest advisory; its text says "typed in-time" —
   RECORD exactly what it says beside a rally.
4. **A timings-out-of-order warning from the box alone** (Unpub, desktop; a wave with no typed lines). R 10:00, B blank
   (suggested 09:40), TO 12:00 → a red warning naming "suggested brief", publishing still allowed (D509). RECORD whether
   anything explains it while editing (D502/D509 "explained while editing") — the red note is only drawn inside the
   typed-lines block, which this wave lacks. Click the warning and RECORD what gets the ring (the code points at the
   first pilot seat, which may be empty; expected: the R box or its line). Then add an in-time line and repeat with R
   as the culprit; RECORD whether the warning now points at the in-time lines instead.
5. **Board suggestion by mouse** (desktop 1440, R and B empty). (a) Click R → 09:00 placed, highlighted; type 0830 →
   replaces, not appends; leave → saved; one Undo brings back the empty box and its faint suggestion (count the
   presses). (b) Click R, Escape → empty, nothing saved, no Undo entry; on a Pub Sat no pending mark. (c) Tab CS → MSN →
   R → B → TO → LD → nothing filled (D554, D1030). (d) Click R, then at once B → both placed and saved, one click each.
   (e) Click R, then at once ✓ Done or a day arrow → RECORD whether the rally was saved (the save on leaving needs the
   box still on screen). (f) Click R, then Enter.
6. **The same on a phone board** (402, by finger, WebKit if possible — his iPhone). After the tap typing must replace,
   not append (iOS does not always honour a select-all in a box). Tap R then B; tap R then the keyboard's Done; tap R
   then scroll away.
7. **The same on the Edit Schedule week** (desktop by mouse, 402 by finger): click, type, Escape, Tab, R then B. Clear
   a typed R and leave → does the faint suggestion come back? View-only Sched: an empty R stays blank, an empty B prints
   its suggested brief (D509, D1030).
8. **The first-press fix** (desktop by mouse, phone by finger). Change a box, then at once press each of: "+ In-time",
   "+ Line", an in-time line's ✕, "+ Wave", Sort all, Undo, Redo, publish or sign, the day arrows, the board's ✓ Done →
   each acts once, on the first press, never twice ("+ Line" adds exactly one; Undo takes back only the change just
   typed). Also: a focused box left unchanged, then a press; a box inside a window (the Logic page, an input's window),
   then that window's buttons — the fix listens on every page: RECORD that nothing double-fires.
9. **The Logic setting** (desktop). Its name reads "Default rally before take-off". 180 → 150: empty R suggestions update
   on the week and the board; typed R values stay; "+ In-time" fills TO less 2h30. A Pub Sat with empty R boxes reads
   pending (D592(8)); a Pub Sat where every line has R typed — RECORD whether it reads pending. Reset. The crew-rest,
   OIL and order explanations quote the new name.
10. **"+ In-time" ignores the box** (Unpub): TO 10:00, R 06:00, no lines → it fills 07:00 (RB6, D1031); the start is
    then 06:00; RECORD whether "in-time 07:00 is later than rally 06:00" shows.
11. **The evening before** (desktop and phone). (a) A Sat TO 01:30: tap R → 22:30 placed; the week header "In-time /
    Rally 22:30 (prev day)", the board "(prev day)"; OIL credits Saturday only (D592(3)); crew rest read against Friday.
    (b) R 09:00 typed, TO 12:00 → change TO to 08:30: R now 09:00 the day before — RECORD the long day, OIL, crew rest
    and header; compare the brief (one left after the new take-off is removed with a toast; R gets nothing).
12. **What a published day shows and prints** (Pub Sat). Change R: the changes window names "Rally"; "To go out" words
    the change; the gold-dot bubble shows the history; Undo says "a rally time". Amend: the AL mark on R; the first
    version's look shows the old R; the export and the PDF print the issued R in a Rally column before Brief (pending
    changes not included, the default never printed); an empty R prints blank.
13. **Rally carried by copies.** A plan with a different R brought out on a Pub day → a pending amendment, R marked. A day
    template saved from a day with R, applied elsewhere → RECORD whether R travels (not ruled; wave templates carry
    none). A line with R removed, then Undo → R back. A line dragged to another wave → R goes with it.
14. **Standby and cancelled lines.** SC / AVALON / BB: the board a blank place, no R box; the week unchanged; Rally blank
    in the export. A flying wave with R typed changed to SC and back → RECORD whether R is ignored, then returns. A
    cancelled line: RECORD whether the faint suggestion shows and a tap places it; its R must not set the wave's start.
15. **Board layout** at 1440, 821, 820, 768, 402, a 700-tall window, and a desktop at 125%: one line above 820, headings
    over their boxes; stacked at 820 and below; the phone header hides the right cells (nine now); remarks ~162px at
    402; the read-only board and the version look match; the week's four times one size.
16. **Roles.** A member on View-only Sched at 402 and on the read-only board: typed R shows; no faint suggestion; a tap
    does nothing and raises no toast.
17. **Long day and Insights** (Unpub weekday): R 05:00, landing 17:00 → the grey long-day note; Insights hours from 05:00;
    clear R → from the nominal again.
18. **Wave bands** (Unpub): a part-day unavailability or a SANS window near a wave's start; type an R earlier than the
    wave's in-time → RECORD whether the wave's band and that man's availability mark move.
19. **Tab order**, week and board: CS, MSN, R, B, TO, LD; Shift+Tab reverses; Enter on R.
20. **The next-week peek:** R/B and TO/LD headings, next week's values.
21. **Two tabs:** tab A types R, tab B (opened first) types B on the same line → RECORD whether either save wipes the other.
22. **Reload and a fresh open:** R survives a reload; the browser's error list stays empty throughout.

## Roll-call gaps (missing from the host's draft)
- The wave bands: `engine/events.ts:590–600` reads the wave's start (now including R) — the Available-crew band and the windows.
- The dotted crew-rest ring on the previous day's puck, `ui/html.ts:494`; the crew palette marks, `ui/palette-html.ts:63`.
- The editing explanation of an order fault, `ui/html.ts:1243`, `:1286` — only inside the typed-lines block, drawn only
  when the wave has lines (`board.ts:191`; `html.ts` ~1823). A box-only fault has no explanation on screen. Possibly MISSING.
- Where the warning points, `engine/validate.ts:697–698`: a box-only fault points at the first pilot seat; with lines
  present, at the in-time block.
- Changing TO, `engine/slots.ts:418`: a brief left after the new take-off is removed with a toast; nothing comparable for
  R, which silently becomes the day before (`engine/reporting.ts:84`).
- Day templates and plans copy R (`engine/daytpl.ts:102`, `engine/drafts.ts:290`); wave templates do not (`engine/wavetpl.ts:29`).
- Saving a placed suggestion on the board (`ui/interactions.ts:613–622`) only while the box is still on screen when left —
  closing the board or switching day may lose it.
- The first-press fix listens on every page (`ui/textedit.ts:120–140`), so it covers every button in every window.
- The week's faint suggestion (`12-schedule-editing.css:25`) shows only when the box is empty; a cleared box may not count as empty.
- The red bad-times shading (`ui/html.ts:1902–1904`) now paints the R/B cell and the TO/LD cell.
- The tight crew-rest advisory: its nominal and wording, `engine/validate.ts:509`, `:674`.
- OIL uses the issued Logic value on a published day, `engine/oil.ts:186`, `:270`.
- The export reads the issued copy for the Rally column, `ui/export.ts:51`.
- Rollback: `engine/restore.ts:78` now includes the rally — walk a rollback of a day whose R changed.
- The jump from the gold-dot bubble or a change line, `ui/histbubble.ts:226` (onlyOn; no R on a standby line).
