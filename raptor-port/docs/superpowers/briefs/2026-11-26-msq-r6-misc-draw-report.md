# Round 6, misc drawings — report (an Opus drawer; chat 188, 26 Nov 26)

Brief: `2026-11-26-msq-r6-misc-draw-brief.md`. Everything below is drawn on the real app; nothing in the app's code was
changed. Every picture listed was opened and looked at before this report.

- **Served app:** `http://localhost:4700/` serves THIS folder's build — its page loads `assets/index-7OsqMtMA.js`, the
  same file as `raptor-port/dist/assets/`. Used as is; nothing rebuilt, no server started or stopped.
- **Where:** `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`, every file starting `m6-`. Desktop 1536 wide,
  phone 402×874, both at 2x.
- **Scripts** (`raptor-port/scripts/handpass/n176/`): `draw-r6-misc-fade.mjs` (D2), `draw-r6-misc-d8.mjs` (D8),
  `draw-r6-misc-d12.mjs` (D12), `draw-r6-misc-lib.mjs` (the violet ring and the measured button pair),
  `draw-r6-misc-probe.mjs` (the first reading of today's app), `words-r6-misc.mjs` (every new word).
- **The violet mark:** a 2px dashed `#8B5CF6` ring, 4px clear of the part, round what is new since round 5. No other
  violet was added. The purple ✦ beside SKED CK, PLANNED BY and APPROVED BY in the D12 pictures is the app's own
  scheduler mark, not a ring.

## 1. D2 on a phone: the fade waits until the ☰ menu has closed (D2642)

A film of the real app on a phone (WebKit, which is Safari's engine). Saber is on 142. He taps ☰, taps the menu's TALON
drop-down and taps 150. The list closes and the menu stays open with its pages already changed (D2384). He then taps the
shade beside the menu and the menu closes. Two frames later, with the number now in sight, the small number above TALON
dims to about a third and comes back, twice, in about one second. That is round 5's fade, started at a later moment. With
"less motion" on, there is no fade: the number goes bright white for about a second, then back to grey.

The fade is started inside the page, the way the build would start it. When the number turns to 150 while the menu is
open, the fade is marked as owed. The menu closing plays it.

- `m6-p-fade-film.mp4`: 6.8 s, H.264, 804×1748. It plays on an iPhone.
- `m6-p-fade-poster.png`: the whole phone screen at the fade's first dim.
- `m6-p-fade-01.png` … `-81.png`: 12 stills a second across the whole film, each cut to the top-left corner (402×320 at
  2x), where the ☰, the menu's TALON mark and the number are. The tap on the shade is still 53. The two dims follow in
  stills 54–61. Still 53 is the first with the menu gone.
- `m6-p-fade-lm-film.mp4`, `m6-p-fade-lm-poster.png` (the white number), `m6-p-fade-lm-01.png` … `-81.png`: the same,
  with less motion on.
- **Ringed:** the number, from the moment the menu has closed (the new part is the wait).
- **Film aid, not the app:** a white dot shows for about a quarter second wherever the finger taps, so the taps can be
  followed. Round 5's films had none.
- No new desktop film was made; the desktop is unchanged.
- FACT `m6-p-fade.afterPick`: menuOpen true · squadron 150 · fade owed, not played · the number covered by the menu at the
  change.
- FACT `m6-p-fade.closed`: played 1,480 ms after the change, the moment the menu closed · number not covered at the start
  · opacity 0.33 at 250 ms · back to 1 after.
- FACT `m6-p-fade-lm.closed`: number white (255,255,255) at 400 ms · grey (138,150,163) after.

## 2. D8: "It's him", end to end (D2632, D2633, D2643)

Round 1's e6 world is used: Jester (Pilot, CAT B) is archived on 142.

- **`m6-d-itshim`, `m6-p-itshim`** (the phone twin was added). Kestrel is on 149's Admin → Users, in "+ Add a person",
  and has typed "Jester". The note under the callsign box reads as in round 5: "142 has an archived Jester: Pilot, CAT B,
  archived 25 Nov 26. Is this him?". It now has two answers, **"It's him"** and **"Someone new"**, side by side.
  - Both are plain buttons laid as the app's own pair, measured on Osprey's opened row: 28px high, 12px semibold, 6px
    apart, one baseline. Both are plain because neither answer is the default, and a cyan main button would push one of
    them.
  - The quiet line "If this is him, ask 142's admin" is gone, because the button now says it.
  - "Add person" stays greyed, with "Answer “Is this him?” first." under it, as round 5.
  - **Ringed:** the pair.
  - FACT `a.d.pair`: It's him 68×28 and Someone new 107×28, both at y 350 with baseline 368. The form's Add person ·
    Cancel are 28 high, baselines 514 and 514.
- **`m6-d-itshim-asked`**. After "It's him", **my judgement is that the form folds shut and empties**, as its Cancel
  does, and "+ Add a person" goes back to its plain look. Once he has pressed "It's him", the form has nothing left to
  add: the man's own record comes back from 142. A form left open would invite a second, wrong add. The app's own passing
  note (its ordinary kind, raised by the app's own note function) says "Asked 142's admins to bring Jester back and post
  him to 149. Nothing is added yet."
  - **Ringed:** the note.
  - FACT `asked.149people`: 11 rows, no Jester.
- **`m6-d-itshim-bell`, `m6-p-itshim-bell`**. Hunter (142's admin) taps his bell. On top is a new line, copied from a real
  line of his bell: name place "Jester", then "Restore him and post him to 149? · Kestrel", then "now", unread. Its
  squadron number 142 is first, in round 5's column.
  - His bell shows two squadrons (FACT: Show 142 on, 149 on), so every number box wears its squadron's colour (D2638;
    round 5's sample colours: 142 orange, 149 gold).
  - **Ringed:** the line.
- **`m6-d-itshim-row`, `m6-p-itshim-row`**: what the tap opens. This is 142's Admin → Users with Archived open and Jester's
  archived row opened as the app opens it: callsign, post-in date, "The Leave War counts him from the post-in date."
  - Added: the request in the row's own note look, "Kestrel on 149 asks to have him back and posted to 149.", above the
    fields.
  - Added: a new main button **"Restore and post to 149"** first, copied from the row's own Restore (28px). Restore takes
    the plain look, so the row keeps one main button.
  - **Ringed:** the note and the new button.
  - On a phone the four buttons wrap: Cancel drops to a second line, as the app wraps a row.
- **`m6-d-itshim-sheet`**: that press opens the Leave War's own posting sheet. The real sheet was opened on the Leave War
  (a 142 man's day, then ⋯, then Post out), copied whole, and laid under the pressed button on Admin → Users.
  - It is drawn by the Leave War's own styles, so it looks the same as on the Leave War. FACT `sheet.copy` matches the
    real sheet's background, edge, corner, label and chip looks.
  - The day's leave rows are left out, because they belong to the day's leave, not the posting.
  - Head "Jester". "PO FROM Tue 1 Dec 26". POSTING with **"✓ Transfer to Sqn"** chosen; today that chip is drawn but
    cannot be pressed ("Comes with the shared database").
  - A **new row "TO"** shows the squadrons as the same chips, ✓ 149 chosen and 150 offered. Its line reads "On 1 Dec:
    restored on 142 and posted to 149.". Below it is "Post out", which looks the same as on the Leave War today.
  - **Ringed:** the request note and the new button on the row, and the Transfer chip, the TO row and the line.
  - Not drawn, per the brief: the end, with Jester in 142's Outgoing and 149's Incoming (the Fable drawer's).

**Round 5's D8 redraws were checked.** `e6a-?-archived-r`, `e6a2-*`, `e6b-d`, `e6b2-d` and `e6d-d-taken-r` were all
redrawn at 00:55–00:56. That is after `e1b-d-form-crop.png` (00:53), by `draw-r5b-form.mjs`, which measures the row's
Save · Cancel and lays the form's foot to it. Looked at in `e6a-d-archived-r-crop`, "Add person" and "Cancel" are the
same 28px height on one line. **None needed redrawing; no `m6-` copies were made of them.**

## 3. D12: his "my drop down of personnel design is so ugly"

**What the app draws today, for both lists, is the browser's own list.** The sign-off boxes (PLANNED BY and the others) are
an invisible browser select under the box's words. "+ Input"'s Person box is a plain browser select. A press opens the
browser's own pop-up list; on his iPhone it is the wheel at the foot of the screen. A screen picture cannot hold that
pop-up, so the "today" pictures show the boxes closed:

- `m6-d-today-plannedby`: Kestrel on 149's Edit Schedule, Mon 7 Dec, with the PLANNED BY box pressed (focused).
  FACT: it offers "— name —", Kestrel, Hunter, Saber.
- `m6-d-today-person`: Hunter on 149, "+ Input". The Person box already reads "Hunter", a 142 man. FACT: it offers
  Hunter, then 149's ten men.
- Round 5's `e11-d-plannedby` was a drawing of that browser list, plain and white-edged. That is the look he called ugly.

**The app's own lists.**
- Its own drop-down is the top bar's squadron list (the "Schedules" menu): a dark card with a rounded edge, one 38px row
  per choice, a cyan tick on the chosen one, the choice in white and a grey word at the right. The phone's ☰ menu opens
  the same list in place.
- Its own person picker is the pucks ("Several people" in "+ Input", and "Add people" on the Inputs calendar). The pucks
  are for picking several people at once, not one.

**The recommended design** is the app's own drop-down. Its parts are copied from the real Schedules menu, and FACT
`pb.d.drawn` confirms the same look: background, edge, corner, row height, letters and grey word. It hangs 6px under the
box:

- **`m6-d-plannedby`, `m6-p-plannedby`.** "— name —" comes first, ticked because nothing is signed yet. Then 149's own
  man (Kestrel). Then the names from another squadron, each with its number as the grey word at the right: "Hunter 142",
  "Saber 142".
  - **Ringed:** the list.
  - On the phone the list takes the box's full width and the phone's larger letters (15px, the app's own phone size).
- **`m6-d-plannedby-chosen`, `m6-p-plannedby-chosen`**: the closed box after choosing Hunter reads "Hunter · 142" in
  the signed green.
  - No ring: this is round 5's e11b, already shown. The phone twin is only the same box on a phone.
- **`m6-d-person`, `m6-p-person`.** The Person box starts empty (D2628 C2). The same drop-down opens with "— name —"
  first, ticked, then only 149's ten men, A to Z.
  - There are **no names from another squadron here**, because his D2628 C2 says "+ Input" on another squadron offers
    only that squadron's men. The brief's "then the names from another squadron" applies to the sign-off boxes only.
  - **Ringed:** the list.
- **`m6-d-person-chosen`**: the closed box after choosing **Osprey**, a 149 man. Hunter cannot be chosen there, because
  by C2 he is not offered on 149. No ring: the box is round 5's.
- **Which is which:** today's boxes = the browser's own list (the `m6-d-today-*` pictures); recommended = the app's own
  Schedules-menu drop-down (`m6-?-plannedby`, `m6-?-person`).

## Every new word (for a fresh Fable before he sees them — D2441); the file is `words-r6-misc.mjs`

1. **"It's him"**: the button answering "Is this him?" (D8 a). It is D2632's own phrase.
2. **"Asked 142's admins to bring Jester back and post him to 149. Nothing is added yet."**: the passing note after
   "It's him" (D8 b).
3. **"Restore him and post him to 149? · Kestrel"**: the line on 142's admins' bell, "Jester" in its name place (D8 c).
4. **"Kestrel on 149 asks to have him back and posted to 149."**: the request above Jester's archived row's fields
   (D8 c).
5. **"Restore and post to 149"**: the row's new main button (D8 c).
6. **"To"**: the new row's label in the posting sheet, drawn in its small capitals as "TO" (D8 d).
7. **"On 1 Dec: restored on 142 and posted to 149."**: the posting sheet's one line with Transfer chosen (D8 d).
8. **"— name —"**: the empty first line of the drop-down. It is today's sign-off boxes' own words, now also used in the
   Person box, which today has no empty choice (D12).

Settled words reused unchanged (round 5's `words.mjs`): the archived note, "Someone new", "Answer “Is this him?” first.",
and "Hunter · 142".

## FACT lines, one per picture

- `m6-p-fade-film.mp4` / `-poster` / `-01…81`: the fade played 1,480 ms after the pick, at the menu's close, with the
  number in sight; dims 0.33; 81 stills.
- `m6-p-fade-lm-film.mp4` / `-poster` / `-01…81`: white at 400 ms, grey after; played at the menu's close; 81 stills.
- `m6-d-itshim`: pair 68×28 + 107×28, gap 6, one baseline; Add person greyed, 28.
- `m6-p-itshim`: the same pair at y 293; the note takes 2 lines.
- `m6-d-itshim-asked`: the note in the 'ok' look at 524,800, 488×38; 149 shows 11 rows, no Jester.
- `m6-d-itshim-bell`: Show 142 on, 149 on, so coloured; lines: 142 Jester "Restore him and post him to 149? · Kestrel"
  now, then Hunter's two lines with their number place empty (his own account).
- `m6-p-itshim-bell`: the same.
- `m6-d-itshim-row`: buttons Restore and post to 149 (main) 162×28, Restore 71×28, Delete 62×28, Cancel 65×28; one line.
- `m6-p-itshim-row`: the same four; Cancel wraps to a second line.
- `m6-d-itshim-sheet`: the sheet 560×285 at 595,325, on screen; the copy's look is the real sheet's (the chip widths
  differ only by their words).
- `m6-d-today-plannedby`: 149; "— name —", Kestrel, Hunter, Saber; the browser's own select.
- `m6-d-today-person`: 149; starts on "Hunter"; the browser's own select.
- `m6-d-plannedby`: rows "— name —" (ticked), Kestrel, Hunter | 142, Saber | 142; 220×186; the same look as the menu.
- `m6-p-plannedby`: the same rows; 338×190.
- `m6-d-plannedby-chosen` / `m6-p-plannedby-chosen`: the box reads "Hunter · 142", in the signed green.
- `m6-d-person`: "— name —" (ticked) + 10 of 149's men; 255×452; on screen.
- `m6-p-person`: the same; 198×456.
- `m6-d-person-chosen`: the box reads "Osprey".

## Departures, and why

- **D12, the menu's small-capitals heading is left out.** The real Schedules menu opens with a heading ("SCHEDULES").
  Here the box's own label, "PLANNED BY" or "PERSON", sits just above the list, so a heading would say it twice. Running
  the script with `HEAD=1` draws it.
- **D12, the grey number at the right of the row, not "Hunter · 142" written into the row.** That is how the app's own
  menu lays a choice and its grey word. The closed box still reads "Hunter · 142", as round 5 settled.
- **D12, the Person list has no other squadron's names**, by D2628 C2 (above).
- **D8 b, the form closes** rather than staying open: my judgement, explained above.
- **D8 c, four buttons on the archived row**, with Restore made plain so the row has one main button. On a phone, Cancel
  wraps.
- **D8 c, the bell line's day** shows the day the request was made (Wed 25 Nov, copied from the real line). The request
  is about no day, and every bell line carries one. This is my reading.
- **D8 d, the sheet hangs under the pressed button** and shows only the posting rows, because the day's leave rows have
  nothing to do with a posting.
- **D8, a phone twin of (a)** was added; the brief asked for the desktop only.
- **D2, white tap dots** in the films (above). At 4px clear, the ring round the small number brushes the top of "TALON"
  under it.

## Not drawn

- The browser's own open list, today, for either box. No screen picture holds it; the closed boxes are shown and the
  limit is said above.
- The end of D8 (Incoming and Outgoing), left to the Fable drawer as the brief says.
- How the drop-down behaves with keys, or how it closes. Only its look and place are drawn.
