I read an exported copy of 33c916756 (D:/raptor-work/c186-scn-f-src), read-only; the brief whole, the SANS lines of the scheduler and Inputs rulings pages, and the SANS check, its gate, the sim collection, the note-after-planning ordering and the demo seed's notes. I opened no handoff, evidence sheet, report or other designer's list.

# Walk scenarios — the warning list's SANS lines (D2579, D2584 Q3 / 2a / 3b, D2583) — fresh blind Fable designer, 25 Nov 26

Conventions. "The line" = the amber warning-list line. "All places" = the brief's roll-call: Edit Schedule's warning list at 1536 and at 402, View-only Sched, the Scheduler Board's issues panel, the day-info popup (ⓘ), every copy of his puck that day (seat, crew list, SANS availability card, Personal Inputs / Ground rows, Unavailable row), the day's "N issues" count and bar colour. Sign in `ad` / `a` unless a step says `us` / `us`. Every setup is made through the app's own controls. Each scenario wants a picture of the list and of the puck.

## A. Most specialised first

**1. An OFT or AMT box with no start time, nothing filed — every seat of it, the extra places too.**
SETUP: a day one of the four unfiled men (say Yeti) is SANS. Add a sim row on the OFT with a name (EP-9) and NO times. Put Yeti in its front seat; then a second unfiled SANS man (Badger) as an extra place under the same box.
ACTION: read all places after each plant.
EXPECTED: one line each — "SANS: no availability filed for today. Planned on Sim EP-9" (no hours after the name), amber ring and "A" on each man (D2584 Q5, D2586, D2573). The extra place raises its own line as the seat does (D2586).
WRONG IF: the list is silent while the crew list strikes him; the extra place raises nothing; the line ends in a dangling dash, "NaN", "undefined" or empty hours; two men share one line or one man's line vanishes when the other is planted (both sit on the same box).

**2. The same untimed sim, then its times typed, then cleared.**
SETUP: as 1, Yeti in the seat.
ACTION: type 09:00–10:30 on the box; read; clear the start again; read.
EXPECTED: the line stays one line throughout, its tail going "Sim EP-9" → "Sim EP-9 09:00–10:30" → "Sim EP-9"; the count never moves by 2 (D2584 Q5).
WRONG IF: a second line appears beside the first, the line vanishes for a moment and a "new warning" note pops for a man already flagged, or the count flickers to a higher number.

**3. A sim box with no name and no times.**
SETUP: add an AMT row, leave its name and times empty, plant Wrangler.
EXPECTED: RECORD exactly what the tail says (the brief words only a named sim and an unnamed flying line; no ruling words an unnamed sim).
WRONG IF: the line reads "Planned on Sim undefined", "Sim " with nothing after, or a bare "Planned on".

**4. A flying line with no name and no times.**
SETUP: "+ Wave", "+ Line", leave mission and times empty; plant Cards in the front seat.
EXPECTED: "SANS: no availability filed for today. Planned on this line (no times yet)" with ring and "A" (D2584 Q3, D2573, the brief).
WRONG IF: nothing is raised until a take-off is typed; the tail shows a blank name or "(T/O --:--)".

**5. The same line gaining a name, then a take-off.**
ACTION: on 4, type the mission (VL BFM) — read; type T/O 13:00 — read.
EXPECTED: "…Planned on VL BFM (no times yet)" (RECORD the exact words for a named line with no times), then "…Planned on VL BFM (T/O 13:00)". One line throughout.
WRONG IF: two lines at any step; the old tail stays after the edit.

**6. Mismatch with one event offered, on a flight with no times.**
SETUP: on the Inputs page's SANS tab file for Yeti that day: OFT only, all day. Plant him in an untimed flying seat.
EXPECTED: "SANS: offered OFT only today. Planned on …(no times yet)" (D2584 2a, D2585); crew list strikes him "SANS — not offering Fly" (D2585) — the two lists differ in words by ruling, RECORD both side by side.
WRONG IF: the warning line still says "not offering Fly today" or "no availability filed".

**7. Mismatch with two events offered.**
SETUP: file OFT and AMT, all day; plant him on a timed flight.
EXPECTED: "SANS: offered OFT and AMT only today. Planned on VL BFM (T/O 13:00)" (D2584 2a). RECORD the order of the two words for each pair (Fly + OFT, Fly + AMT, OFT + AMT) by planting him on the third event each time.
WRONG IF: the order differs from the order of the letters on his SANS card (F, O, A); "offered Fly and OFT and AMT".

**8. OFT against AMT is a miss too.**
SETUP: file AMT only; plant him in an OFT seat with times.
EXPECTED: "SANS: offered AMT only today. Planned on Sim EP-9 09:00–10:30" (D2584 2a; D2570 "OFT against AMT a miss too").
WRONG IF: no line because "a sim is a sim".

**9. A filing that ticks nothing.**
SETUP: on the SANS tab try to save a filing for him with F, O and A all unticked (also: tick one, save, reopen, untick all, save).
EXPECTED: if the app lets it be saved, the line reads "SANS: not offering Fly today. Planned on …" (the brief: "stays only where his record ticks nothing"). If the app refuses, RECORD that the case cannot be made by hand.
WRONG IF: "SANS: offered  only today" or "offered today" with a gap.

**10. Wrong hours — unchanged, and never mixed with the new words.**
SETUP: file Fly, 08:00–12:00; plant him on a flight T/O 13:00.
EXPECTED: "SANS: available 08:00–12:00 only. Planned on VL BFM (T/O 13:00)" — unchanged (the brief). Then clear the line's times: the line goes entirely (he offered the event; nothing to hold the hours against — D2585 "staying plain until the times are typed").
WRONG IF: the hours line now reads "offered Fly only"; an untimed seat keeps an hours line.

**11. Hours that just cover, and the in-time edge.**
SETUP: file Fly with hours that cover take-off to landing but not the report / step time before it.
EXPECTED: RECORD whether the hours line is raised and exactly what it says; then widen the hours by the Inputs page until it clears, and note the hour at which it clears.
WRONG IF: the crew list strikes him for hours while the warning list is silent, or the reverse.

**12. A flight across midnight, nothing filed on either day, then filed on one.**
SETUP: a night line T/O 23:00 landing 01:00 on Tue; plant Badger. Nothing filed Tue or Wed.
ACTION: read Tue and Wed. File Tue all day; read both.
EXPECTED: one line on Tue only before; none after (the line is "for today"). RECORD what Wed shows.
WRONG IF: Wed carries a line for a seat planned on Tue, or Tue's line stays after an all-day filing.

**13. Two filings on one day.**
SETUP: file for Yeti Fly AM, then a second filing the same day OFT PM (if the SANS tab allows two). Plant him on a PM OFT seat.
EXPECTED: RECORD exactly what the list and the crew list say, and whether they agree with each other and with the letters on his SANS card.
WRONG IF: the card shows F and O offered while the line says "offered Fly only today".

**14. One man in two seats the same day.**
SETUP: an unfiled SANS man on a morning flight and an afternoon OFT.
EXPECTED: RECORD whether one line or two (D2579 says "one amber line for a SANS man planned…"; the rulings do not settle one-per-man against one-per-seat). The count, the ⓘ popup and the Board's panel must agree with the list either way. Take him off one seat: exactly that seat's line goes.
WRONG IF: the count says 2 where the list shows 1; removing one seat clears both.

**15. Front and back seat of one jet, both unfiled SANS men.**
EXPECTED: two lines, one each, same tail; both pucks ringed.
WRONG IF: one line naming only one man, or the second man's puck unringed.

**16. A man posted out as SANS from a date ahead (Ranger).**
SETUP: find Ranger's SANS date in Admin → Users. Day X = the day before it; day Y = that date; day Z = a later day.
ACTION: plant Ranger in a flying seat on X, Y and Z with nothing filed.
EXPECTED: X — no line, no ring, no "A"; he is an ordinary man (D2338, D2340, D2329). Y and Z — the line. RECORD the line's exact words on Y / Z while his posting has not yet run: the crew list there says "SANS from Fri 17 Jul: no availability filed" (D2587) while the warning list, as built, says "no availability filed for today" — put the two side by side in one picture.
WRONG IF: any line on X; no line on Y.

**17. His SANS date moved.**
SETUP: after 16, with lines standing on Y and Z, move Ranger's SANS date later, past Y (Admin → Users).
EXPECTED: Y's line, ring and "A" go at once, the day's count drops; Z keeps its line (D2341, D2329). Undo: Y's line returns.
WRONG IF: Y keeps a line for a day he is not SANS; Undo leaves Y clean.

**18. Availability filed, then the day stops and starts being SANS.**
SETUP: as `us`, file Fly for Z (matching his seat) — line gone. As `ad`, move his date past Z, then back.
EXPECTED: while Z is not SANS: no line (ordinary man). Back: no line (his filing returns by itself — D2341).
WRONG IF: "no availability filed" after the date returns.

**19. The SANS tick on the Quals page.**
SETUP: an ordinary man planned on a flight. Tick SANS for him on Quals (nothing filed).
EXPECTED: the line appears on every day he is in a flying seat or sim from when he is SANS; untick — all go. RECORD what each day says.
WRONG IF: lines stay after the untick, or appear on days before his date.

**20. The member files for himself and the scheduler's screen answers.**
SETUP: Ranger planned on Z with the line showing. Sign in `us`, open the SANS calendar, file Fly all day for Z; sign back in `ad`.
EXPECTED: line, ring, "A" and count gone in all places. Then as `us` change it to OFT only: the line returns as "SANS: offered OFT only today. …". Then delete it: back to "no availability filed for today".
WRONG IF: any place keeps the old words after a change; the puck keeps a ring with no line.

**21. The note after a drop, and after tap-to-plan.**
SETUP: desktop — drag an unfiled SANS man from the crew list into a timed flying seat. Phone (402) — arm the seat, tap him.
EXPECTED: the note repeats the new line's words, "SANS: no availability filed for today. Planned on …" (the brief; the app's rule that the note names the warning the plant raised). RECORD it at both sizes — whether it fits, wraps or is cut on the phone. Repeat with a mismatch (the note says "offered … only today") and wrong hours.
WRONG IF: the note still says "SANS — no availability filed for today" (the crew list's words), tells anyone to file, or two notes show.

**22. The note when the plant raises a harder warning too.**
SETUP: drop an unfiled SANS WSO into a front seat (an illegal-seat warning), and an unfiled SANS man onto a flight overlapping another of his.
EXPECTED: the note leads with the red warning; RECORD whether the SANS line is named after it. The puck's chip is the red one, not "A"; the SANS line is still in the list.
WRONG IF: the SANS line is missing from the list because a red one took its place.

**23. "A" against TT and DT.**
SETUP: an unfiled SANS man on two flights close enough to earn a tight turn, then a double turn.
EXPECTED: his puck shows "A", not "TT" / "DT" (the built chip order); the TT / DT lines still stand in the list.
WRONG IF: "TT" or "DT" printed over the "A", or two chips squeezed on one puck.

**24. A SANS man on leave, or medically down, planned in a seat with nothing filed.**
SETUP: give Wrangler leave on the day (Inputs), plant him in a flying seat.
EXPECTED: RECORD which lines the list shows (the leave clash, the SANS line, or both) and which chip the puck wears. The crew list's reason is the leave, not SANS.
WRONG IF: the count and the list disagree.

**25. Hiding the line (✕), and what brings it back.**
SETUP: Cards with the line showing.
ACTION: (a) press ✕ — read all places; (b) flag it again — read; (c) hide it again, then retime the flight 13:00 → 14:00; (d) hide again, then file OFT only for him; (e) hide again, then take him off and put him back.
EXPECTED: (a) the line struck in place, the count drops by one, RECORD whether his ring and "A" go with it (D469–D475); (b) all back; (c), (d), (e) — "until the situation changes": RECORD for each whether the line returns unhidden. In (d) it must not stay hidden: the fact changed from nothing filed to a mismatch.
WRONG IF: hiding Cards's line hides Wrangler's; a hidden "no availability filed" silently hides the later "offered OFT only" line; the count goes negative or does not drop.

**26. Hidden for everyone.**
SETUP: after 25(a), sign in `us` and open View-only Sched and the ⓘ popup for that day.
EXPECTED: the line is hidden for him too (D469).
WRONG IF: the member still sees it counted.

**27. Publishing a day carrying the line, then things change.**
SETUP: a day with one "no availability filed" line; publish it.
ACTION: (a) read the published face in all places; (b) as `us` file matching availability; (c) as `ad` delete it again; (d) plant a second unfiled SANS man on the published day.
EXPECTED: (a) the line shows as published; (b) the published face keeps it frozen (D179, D183–D185, D2005: only qualification and crew-rest warnings stay live) — RECORD exactly what shows and whether anything reads pending; (d) the change reads pending — RECORD whether the new man's line and ring show on the working copy, and the note after the plant.
WRONG IF: the published line vanishes live on (b) while other frozen warnings stay; the issued face changes without an amendment.

**28. Publishing a clean day, then he deletes his filing.**
SETUP: Yeti filed and planned, no line; publish. As `us`-style owner (admin for Yeti) delete his filing.
EXPECTED: the published face stays without the line (frozen); RECORD what the working copy and the "N issues" count show.
WRONG IF: the published count and the published list disagree.

**29. Undo and Redo.**
ACTION: plant an unfiled SANS man (line appears) — Undo — Redo; delete a filing on the Inputs page (line appears on the schedule) — Undo there.
EXPECTED: line, ring, "A" and count follow each step in all places.
WRONG IF: a ring is left with no line, or the count is one out after Redo.

**30. Moving him seat to seat.**
ACTION: drag an unfiled SANS man from a timed flight to (a) an untimed flight, (b) an OFT seat, (c) SC MAIN, (d) a ground row.
EXPECTED: (a), (b) the line follows with the new tail, still one line; (c), (d) the line, ring and "A" go (D2584 Q4; ground needs nothing).
WRONG IF: the old seat's line lingers; a line on (c) or (d).

**31. A cancelled line.**
SETUP: an unfiled SANS man on a flight with the line showing; cancel the line. Same for a cancelled sim box.
EXPECTED: RECORD — the rulings give "a cancelled line never" for his reminder (D2568) but do not say it for the warning list. For the sim, the line should go. Restore: it returns.
WRONG IF: the list and his puck disagree (ring without line).

## B. The roll-call, plainly

**32. The demo week as it boots.**
ACTION: fresh start, no edits. For every day of the week read the warning list.
EXPECTED: lines for exactly Cards, Wrangler, Yeti and Badger where each sits in a flying seat or sim (the brief), each "SANS: no availability filed for today. Planned on …"; the six SANS men with demo filings raise none. RECORD the count of lines per day, each day's "N issues" and bar colour, and the week view's day bars.
WRONG IF: a fifth man carries the line; one of the four has none on a day he flies; a demo-filed man shows a mismatch or hours line.

**33. One line, every place — desktop 1536.**
SETUP: one "no availability filed" line, one mismatch, one hours line on one day.
ACTION: Edit Schedule's list, View-only Sched, the Board's issues panel, ⓘ.
EXPECTED: the same three sentences word for word, each under the check name "SANS availability — not filed, or planned outside it" where a place groups by check (D2584 3b); the count the same in all four.
WRONG IF: any place still carries the old check name or old words; a place cuts the sentence short with no way to read the rest.

**34. The same at 402.**
EXPECTED: the full sentence readable (wrapped, not cut) in each place; the check name does not push the ✕ off screen or under the line. RECORD pictures.
WRONG IF: the long check name or the long sentence overflows sideways, or the ✕ cannot be pressed.

**35. Pressing the line.**
ACTION: press the line in the list (desktop and phone).
EXPECTED: his pucks light on every copy that day — seat, crew list, SANS availability card — the rest dimmed, his amber ring kept (D1013 family). For an untimed sim seat and an untimed flying seat too.
WRONG IF: nothing lights for the untimed seats, or the wrong seat lights where two men share a sim box.

**36. Every copy of the puck.**
SETUP: an unfiled SANS man in a flying seat.
EXPECTED: amber ring and "A" on the seat, the crew list, the SANS availability panel and any Ground / Personal Inputs row he also sits on that day; no new letter (D2583). RECORD each copy. The crew list draws no reason line under him when no seat is armed (D2420).
WRONG IF: a copy without the ring; a letter other than "A"; a reason line telling the scheduler to file.

**37. The crew list and the "N free" count.**
SETUP: arm a flying seat on a day; note "N free"; file Fly all day for one unfiled SANS man.
EXPECTED: he stops being struck and "N free" rises by one (D2584 "and the 'N free' count"); arm an OFT seat — he is struck "SANS — not offering OFT"... RECORD.
WRONG IF: the warning list and the crew list disagree about whether he may sit there.

**38. The Legend.**
ACTION: open Edit Schedule's Legend, desktop and phone.
EXPECTED: the amber "A" line reads exactly "advisory — shift, ground or SANS availability" (D2583).
WRONG IF: any other words; the line wraps into its neighbour at 402.

**39. The Logic page.**
ACTION: open the Logic page's check list.
EXPECTED: the check is named "SANS availability — not filed, or planned outside it" and its line reads "A SANS man planned outside the event or the hours he filed, or with nothing filed." (D2584 3b), marked amber / advisory. RECORD whether the check can be switched off there, and if so: switch it off — all three kinds of line and the rings go; on — they return.
WRONG IF: the old name or line; switching it off leaves rings on pucks.

**40. Bar colour.**
SETUP: a day whose only issue is one SANS line.
EXPECTED: the day's bar is amber, "1 issue"; add a red warning — red; hide the SANS line on a day with nothing else — the bar returns to clean (D469–D475).
WRONG IF: the SANS line alone turns the bar red.

## C. Negatives — what must NOT change

N1. SC MAIN, SC SPARE, BB and AVALON (standing by or flying) with an unfiled SANS man: no line, no ring, no "A", no strike, no note about SANS after the plant (D2584 Q4, D2576, D2578). Try each of the four.
N2. A ground row, a duty desk, an all-hands event, a brief / debrief row, a personal input: no SANS line whatever he filed or did not (D2564; "any ground event can also be planned").
N3. A SANS man whose filing matches (Fly, all day, on a flight; OFT with covering hours on the OFT): no line, no ring.
N4. An ordinary man, and Ranger before his SANS date: never a SANS line (D2338, D2329).
N5. A SANS man with nothing filed and planned on nothing: no line; the crew list draws no reason line for him with no seat picked (D2420).
N6. The hours line's words are exactly as before: "SANS: available 08:00–12:00 only. Planned on …".
N7. No line anywhere tells anyone to file ("File it…", "needs to file") (D2579, D2587).
N8. No new letter or colour on any puck: amber ring and "A" only (D2583). The shift and ground advisories still wear "A" and their own words.
N9. Red warnings, their order above amber in the list, and crew-rest rings are untouched on a day that gains SANS lines.
N10. The day's other counts — Available rows, ALL AVAIL, the SANS calendar's "still needed" figures — do not move when a line appears or is hidden.
N11. A published day's face does not change by itself because this check now speaks: nothing on an already-published day is rewritten without a change being made (D179, D183–D185). (Lines missing from days published in stored data before this change are not a finding — D56.)
N12. Hiding one man's SANS line never hides another man's, nor the same man's line on another day.
N13. His own bell and the SANS calendar are not changed by this piece: planting him raises no new bell words here.
N14. View-only Sched offers a member no ✕ to hide the line.
N15. The Tracker and the Leave War show nothing new.

## D. Questions the rulings do not settle

Q1. When it happens: a scheduler plants a man whose SANS posting has not yet run, on a day from its date. The crew list says "SANS from Fri 17 Jul: no availability filed"; the warning list says "SANS: no availability filed for today." Should the warning line also name his SANS date, or is "for today" right? (scenario 16)
Q2. When it happens: one unfiled SANS man flies in the morning and sits the OFT in the afternoon. One line for the man, or one per seat? D2579 says "one amber line"; as built it looks to be one per seat. (scenario 14)
Q3. When it happens: a scheduler hid "no availability filed" for a man, and he then files the wrong event. Does the new "offered OFT only" line come back showing? I would expect yes — the situation changed. (scenario 25d)
Q4. When it happens: a scheduler cancels a line that carries an unfiled SANS man. D2568 says a cancelled line never counts for his reminder; should the warning line go too? (scenario 31)
Q5. When it happens: a published day carried the line and he files afterwards. Does the published line stay until the day is republished (frozen, D2005), or clear live as the qualification and crew-rest ones do? (scenario 27)
Q6. A sim box with no name: what should the tail say — "Planned on this sim (no times yet)", to match the unnamed flying line? (scenario 3)
Q7. A named flying line with no times reads "VL BFM (no times yet)" while an untimed sim reads just "Sim EP-9" with nothing saying the times are missing. Should the sim say "(no times yet)" too?
Q8. A SANS man on leave planned in a seat with nothing filed: the leave clash alone, or the SANS line beside it? (scenario 24)
