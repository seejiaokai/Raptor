# Scenarios — SANS warning-lines answers (chat 208) — Fable, blind

Demo week 13–19 Jul. Seed filings I rely on (check them on the SANS calendar first): Nick — Mon 13, PM, Fly; Waldo — Wed
15, AM, OFT (he sits on OFT EP-4 09:00–10:30); Bullet — Tue 14, all day, Fly/OFT/AMT; Romeo — Tue 14, all day, Fly. "A
blank SANS man" = any SANS man with nothing filed that day and on nothing that day. Every filing is made with the app's
own form, never by changing data. Every note is pictured the moment it shows (it fades), and the warning list is opened
after each plant.

## A. The note after a plant (D2753)

1. **Desktop, Edit Schedule, Mon — drag from the crew list, nothing filed.** Pick a timed flying seat; a blank SANS man
   is struck. Read his struck reason and the drag hint, then drop him. **EXPECTED:** note "‹Callsign› — SANS — no
   availability filed for today", word for word his struck reason with his callsign in front, one "SANS", no "Planned
   on". Warning list: "SANS: no availability filed for today. Planned on ‹flight› (T/O hh:mm)" — unchanged. (D2753)
2. **Same, but hide his warning line first.** Plant, hide the line, take him off, plant again on the same seat.
   **EXPECTED:** the same short note both times (lesson 1: both states). (D2753)
3. **Desktop — tap onto an armed seat, filed something else.** File Fly only, all day, for a blank SANS man on Tue. Arm an
   AMT seat (row named BOX, 13:00–14:00), tap him. **EXPECTED:** "‹Callsign› — SANS — offered Fly only, not AMT"; list:
   "SANS: offered Fly only today. Planned on AMT BOX 13:00–14:00". (D2753, D2754)
4. **Two ticked.** File OFT + AMT for him on Wed; drop on a flying seat. **EXPECTED:** note "… — SANS — offered OFT and AMT
   only, not Fly" (OFT before AMT); list "SANS: offered OFT and AMT only today. Planned on ‹flight› (T/O …)". (D2753, D2755)
5. **Seat-to-seat drag.** Bullet (Tue, all three, all day) sits clean on a flight. File Fly-only for another man, plant
   him on a flight (no note about SANS expected — all day covers), then drag him from the flight to OFT EP-row.
   **EXPECTED:** "… — SANS — offered Fly only, not OFT". Drag back to the flight: no SANS note, the line gone. (D2753)
6. **Drop onto an input's row** (a duty / commitment row on the day's panel that takes people) with a blank SANS man.
   **EXPECTED:** if that row asks SANS availability, the same crew-list words; if it does not, no SANS note and no SANS
   line — record which, and that the crew list's strike agreed before the drop. (D2753)
7. **The OIL-question path.** Plant a blank SANS man on a seat that raises the OIL question (a weekend / Earn-OIL day);
   answer it each way. **EXPECTED:** after the answer the note is the crew-list words, never the long line, and it is
   not lost behind the question. (D2753)
8. **Posting not yet run.** A regular posted to SANS from Fri 17 Jul (Admin → Users, a posting dated Fri 17). On Fri or
   later, pick a seat: his reason reads "SANS from Fri 17 Jul: no availability filed"; plant him. **EXPECTED:** note
   "‹Callsign› — SANS from Fri 17 Jul: no availability filed". Then on Mon 13 (before his date): no strike, no note, no
   line. (D2753, D2338)
9. **Dropped on another day's seat from the week view.** With Mon open, plant a blank SANS man on a Thu seat (week
   group / week strip). **EXPECTED:** "Thu · ‹Callsign› — SANS — no availability filed for today". (D2753)
10. **Two warnings from one drop.** Plant a blank SANS man where he also clashes with another event. **EXPECTED:** the
    red clash line leads, "(+1 more)"; SANS words appear only if SANS is the top line. Then plant him so SANS is top
    with a lesser one: "… — SANS — no availability filed for today (+1 more)". (D2753)
11. **Untimed seat.** A flight with no times; blank SANS man. **EXPECTED:** struck reason and note both "… — SANS — no
    availability filed for today"; list "… Planned on this line (no times yet)" or the flight's name, as before. Repeat
    on an OFT row with no times: note the same; list "Planned on OFT ‹name› (no times yet)". (D2753, D2754, D2573)
12. **Standby lines.** Plant a blank SANS man on SC MAIN, SC SPARE, AVALON, BB. **EXPECTED:** not struck, no SANS note, no
    SANS line, no amber A from SANS. (D2584)
13. **Undo / Redo.** After scenario 3, Undo, Redo. **EXPECTED:** line goes and returns; whatever note Redo shows is the
    short words, never the long line. (D2753)

## B. The sim's name in the warning line (D2754)

14. **Desktop, Wed — the seed line.** Open Wed's warning list. **EXPECTED:** "SANS: no availability filed for today.
    Planned on OFT EP-4 09:00–10:30" (both times typed). No "Sim" anywhere in a SANS line. (D2754)
15. **State table on one OFT row, one blank SANS man planted (lesson 1):** edit the row on screen and re-read the list
    after each: (a) start 10:00, end 11:00 → "Planned on OFT EP-9 10:00–11:00"; (b) clear the end → "Planned on OFT EP-9
    10:00–11:30 (end assumed)"; (c) clear both → "Planned on OFT EP-9 (no times yet)"; (d) clear the row's name, no times
    → "Planned on this OFT row (no times yet)"; (e) no name, 09:00 only → "Planned on this OFT row 09:00–10:30 (end
    assumed)"; (f) end typed, start blank → record what shows — it must not print a made-up start; (g) retype the end the
    same as the assumed one (10:30) → "(end assumed)" gone. (D2754)
16. **AMT, same table (a), (b), (d).** **EXPECTED:** "AMT BOX 13:00–14:00"; "AMT BOX 13:00–14:30 (end assumed)"; "this AMT
    row (no times yet)". (D2754)
17. **Odd row names.** Name an OFT row "Sim", then "sim", then "SIM 2", then "Simba", then "OFT 1", then spaces only.
    **EXPECTED:** "this OFT row" for Sim / sim / spaces; "OFT SIM 2"? — the typed name whole after "OFT" ("OFT Simba",
    never "OFT ba"); "OFT OFT 1" is the literal rule — picture it for him. (D2754)
18. **The "offered X only" line on a sim.** Fly-only man on OFT EP-9 10:00, no end. **EXPECTED:** "SANS: offered Fly only
    today. Planned on OFT EP-9 10:00–11:30 (end assumed)". (D2754)
19. **The "available … only" line on a sim.** File AMT, typed 08:00–12:00; plant on AMT BOX 13:00–14:00. **EXPECTED:**
    "SANS: available 08:00–12:00 only. Planned on AMT BOX 13:00–14:00". Clear BOX's end: "… 13:00–14:30 (end assumed)".
    Clear both times: the line goes (nothing to hold his hours against), and his crew-list strike goes too. (D2754)
20. **Flying lines unchanged.** Blank SANS man on a flight with a take-off and no landing. **EXPECTED:** the flying words
    as before ("(T/O 13:00)" / the "landing assumed" wording), no "(end assumed)". (D2754)
21. **Same man on OFT then AMT; hiding.** Plant a Fly-only man on OFT EP-9, hide the line; move him to AMT BOX.
    **EXPECTED:** the AMT line shows (not hidden). Then on one hidden OFT line, type the row's end, rename the row,
    change the start: record whether the hidden line stays hidden each time — a line he hid must not shout again only
    because its words gained "(end assumed)" or lost it. (D2754, D2756)
22. **Every place the line is read, not only the drawer:** the day's warning list, the week's warning count / all-days
    list, the puck's ring and amber A on the sim seat, a tap on the line jumping to the sim row, the published page /
    Export as PDF if warnings print there, and the list after Publish and after a reload. **EXPECTED:** same words in
    each; "(end assumed)" survives a reload and a published day's frozen view. (D2754)

## C. The tick boxes (D2755)

23. **Desktop, Inputs → SANS calendar → "+ Commitment".** **EXPECTED:** boxes left to right Fly · OFT · AMT. Untick all,
    Save: "Tick at least one of Fly / OFT / AMT". Tab through: focus order Fly, OFT, AMT. (D2755)
24. **Each tick saves what it says** (the swap's real risk). Tick only the middle box, save. **EXPECTED:** card and chip
    read "O"; crew list letter "O"; on a flying seat he is struck "SANS — offered OFT only, not Fly". Repeat with only the
    third: "A", "offered AMT only". Reopen each record: the same box is ticked. (D2755)
25. **Every door to the form (lesson 12):** "+ Commitment"; a tap on a calendar day; the SANS panel's "+ Add" on Edit
    Schedule; a tap on an existing SANS card (edit); the Inputs list row's edit; the member's own phone filing; a
    scheduler filing for a SANS man. **EXPECTED:** Fly · OFT · AMT and the same refusal in each. (D2755)
26. **Phone (iPhone size), the form.** Open, tick, save; with the keyboard up for Remarks. **EXPECTED:** the three boxes in
    order, one row or a clean wrap, nothing covered by Cancel / Add (lesson 5). (D2755)

## D. Kept as built (D2756, D2758)

27. **Two flights, two lines.** Blank SANS man on two flights on Thu. **EXPECTED:** two SANS lines, each naming its
    flight; the count counts both; hide one — the other stays, count drops by one; one note per plant. (D2756)
28. **On leave and planned.** SANS man on leave Thu, nothing filed, planted on a flight. **EXPECTED:** the leave line and
    the SANS line both; the note after the plant leads with the more serious one. (D2756)
29. **AM / PM under the letter.** Mon, nothing picked: Nick reads "F · PM" on one line. Pick a morning flying seat:
    "F" with "PM" under it, struck; pick an evening seat: "F" / "PM", free. A typed-hours man: letter with
    "08:00–10:00" under it. Measure the column on desktop and phone — letters aligned for struck and free, pilot and WSO
    (lesson 9). (D2758)

## E. The amber A (D2757)

30. **Desktop hover.** Hover the A on (a) a blank SANS man's puck on a seat, (b) a man planned outside his hours, (c) a
    non-SANS man on shift and down for a ground event. **EXPECTED:** all three: "Advisory — on shift and also down for a
    ground event or programme item; or SANS availability not filed, or planned outside it" — both in the small A's own
    hover and in the puck's hover after "· SANS ·". Same puck in the week view, the crew list and a sim seat. Legend
    still "advisory — shift, ground or SANS availability". (D2757)
31. **Admin → Logic (the row of flag letters).** **EXPECTED:** A carries the new words there too; say so to him if not
    wanted. Phone: no hover — record where, if anywhere, a tap shows the words. (D2757)

## F. AM / PM as filed (D2759)

32. **Seed, Mon.** Pick a morning flying seat (before 12:00). Nick's struck reason. **EXPECTED:** "SANS — available PM
    only"; drag hint the same; plant: "Nick — SANS — available PM only"; warning list keeps "SANS: available 12:01–23:59
    only. Planned on …" (not ruled). (D2759)
33. **AM, Wed.** Waldo (AM, OFT): arm an OFT row 13:00–14:00. **EXPECTED:** "SANS — available AM only"; planted, the note
    the same with his callsign. Arm a flying seat instead: "SANS — offered OFT only, not Fly" (what he offered wins over
    hours). (D2759)
34. **Typed hours stay hours — and the edges.** File typed 00:00–12:00 (the same span as AM, typed): reason "SANS —
    available 00:00–12:00 only". Then edit a PM filing to typed 13:00–17:00: "available 13:00–17:00 only", never "PM
    only" left over. Edit typed hours back to AM: "AM only". Edit PM to all day: no strike. (D2759)
35. **A seat across noon.** AM filer on a flight 11:30–13:00; PM filer on the same. **EXPECTED:** both struck, "AM only" /
    "PM only". A PM filer on a night flight landing after midnight: record strike or not — unchanged from before. (D2759)
36. **A span filing.** One PM filing over Tue–Thu; a morning seat on Wed. **EXPECTED:** "SANS — available PM only" on each
    day. (D2759)
37. **Sim with no times, PM filer who offered it.** **EXPECTED:** not struck, no note, no line, until times are typed;
    type 09:00 → struck "PM only", line appears with "(end assumed)". (D2759, D2754)

## G. Plain-user round

38. **Desktop, end to end.** As a SANS man: SANS calendar → "+ Commitment" → Thu, PM, Fly + OFT → save; card reads
    "F/O · PM". As scheduler: Edit Schedule Thu, crew list shows "F/O · PM"; pick a morning OFT row with only a start —
    struck "SANS — available PM only"; plant anyway — note; open the warning list — "SANS: available 12:01–23:59 only.
    Planned on OFT ‹row› 09:00–10:30 (end assumed)"; amber A on his puck, hover; hide the line — count drops, A goes or
    stays as before; open the hidden lines, unhide; type the end 10:15 — "(end assumed)" goes; move him to an afternoon
    row — line gone; delete the filing on the calendar — line becomes "no availability filed for today. Planned on OFT
    …". Press every control that opens or closes on the way (list, hidden fold, form, crew panel). (all)
39. **Phone, end to end.** File AM-only AMT from the phone's SANS calendar (boxes Fly · OFT · AMT). On Edit Schedule tap an
    afternoon AMT seat to arm it; the crew list shows "A" with "AM" under it, struck, reason "SANS — available AM only"
    fully readable (no clipping at 390px — measure it); tap him — note pictured on its first frame, whole text in view,
    not under the top bar; open the warning list, read the long line wrapped, hide it, unhide it. Plant a blank man by
    tap, and by a drag at a person's ordinary speed and a quick flick (lesson 2). (all)
40. **A member / a guest looking at the published day.** **EXPECTED:** they see no scheduler note; the A's words, where
    shown to them, are the new ones.

## Places the builder may have missed

- **The warning list's "available … only" line still prints "12:01–23:59" / "00:00–12:00"** for a half filing, while the
  note and the crew list now say "PM only" — side by side in scenario 32. Brief says not ruled; picture the pair for him.
- **The amber A's words are drawn in three places from one table:** the small A's own hover, the puck's whole hover, and
  the flag-letter row on the Logic page. D2757 names only the puck; the Logic page changes with it. The Legend line is
  separate text and did not change.
- **The untimed-seat strike has its own copy of the reason** (nothing filed / offered something else) beside the shared
  one — scenario 11 holds the two together; and the crew list with no seat picked has a third reader of "no availability
  filed". Three readers, one set of words: scenarios 1, 8, 11.
- **The note falls back to the long line whenever the short words are missing** — any SANS line raised by a path that does
  not carry them (a restored, frozen or published copy of the warnings; another day's line) would show the old long note.
  Scenarios 9, 13, 22.
- **"(end assumed)" rides on a hidden mark of the sim event;** any place that copies the day's events (published view,
  the week list, a reload, Undo) may drop it and print a bare made-up end. Scenario 22.
- **An OFT/AMT row with an end but no start** is treated as "no times yet" — the line would say so beside a typed end.
  Scenario 15(f).
- **The row-name rule strips a leading "Sim"** — a row really named "Sim 2" or "Sim" loses or keeps it oddly; "OFT 1" on
  an OFT row reads "OFT OFT 1". Scenario 17.
- **A hidden line's identity:** if hiding keys on the line's words, typing a sim's end (words change) un-hides it; if it
  keys on the row, renaming does not. Scenario 21.
- **Tick order vs what is saved:** the form's boxes moved; the saved letters, the Inputs list's "F/O/A" chip, the
  calendar's card order and sort, and the Changes / history line for a SANS filing all print F, O, A by their own rule —
  scenario 24 checks the middle box saves OFT, not AMT. The form's help text, any "Fly / AMT / OFT" wording in the
  Inputs page's hints, the Logic page and the user guide were not searched on screen — look for the old order there.
- **Other doors to the same form** (the day panel's "+ Add", edit of an existing card, a scheduler filing for him) —
  scenario 25.
- **The reference-comparison harness** carries its own copy of the A's words; if a comparison check is red on the A, that
  is why — not an app fault.
- **Tests' own words:** engine tests cover the words; nothing in them presses the form on a phone, reads the note on
  screen, or reads the hover — those are the walk's.

## Lessons (§7.11) checked

1 → 2, 15, 16, 34 (state tables). 2, 20 → 39 (drag speeds). 3 → every plant pictures the note and the list. 4 → 23 with
the form open, press another calendar day. 5 → 26. 9 → 29 (measured, pilot and WSO, struck and free). 12 → 25, 30.
17 → 38 (crew panel toggle). 18 → 22 (print). 23 → 6, 12 (the ruled behaviour, not the build's). 6, 7, 10, 11, 13–16, 19,
21, 22: no gesture, pinned bar, keyboard motion or window-over-window is changed here — not applicable beyond 26 and 39.
