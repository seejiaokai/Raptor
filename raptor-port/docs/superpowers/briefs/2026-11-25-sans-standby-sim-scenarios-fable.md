# Walk scenarios — standby lines never ask a SANS man; an untimed sim strikes him (D2584 Q4, Q5)

Designer: fresh Fable, blind. Read: the brief, commit `ee6c9b0a7` (avail.ts, validate.ts, the new test), and the code
around the three changed places. Nothing else.

Words used below:
- "SANS man, nothing filed" = a man who is SANS on the day looked at, with no SANS availability on the Inputs page's
  SANS tab for that day. The demo data has one already SANS (the tests use the pilot with id `ipman`); Ranger (`us`) is
  SANS only from a date ahead, so his scenarios need a day ON or AFTER that date, and one day BEFORE it.
- "struck" = his name crossed through on the crew list with the reason line "SANS — no availability filed for today"
  (or, for Ranger on a day SANS only by a posting not yet run, the longer "SANS from <date>: no availability filed.
  File it on the Inputs page's SANS tab.").
- "plain" = no SANS reason of any kind. He may still carry another reason (currency, leave, busy) — write it down, it
  is not a fault of this change.
- Every scenario is walked on Edit Schedule's crew panel AND the Scheduler Board's crew list, at desktop 1536 and phone
  402, unless it says otherwise. A picture after each press.

What the code read suggests is most at risk (so the list leans there):
(a) the crew list, the warning list and the bell are three separate pieces of code that were each changed by hand —
    they can disagree on a row that FLIES, on a row with no times, and on a sim's extra seats;
(b) an untimed sim where the man filed something that does NOT offer that sim — the crew list stays plain, but the
    warning list may still raise "not offering OFT today" the moment he is dropped;
(c) a sim with only one of its two times typed.

---

## Scenarios — most specialised first

### 1. Untimed OFT, he filed "Fly only" — does the crew list and the warning list agree?
- SETUP: admin. A day the SANS man is SANS. On the Inputs page's SANS tab file for him that day: Fly ticked, OFT and
  AMT not. Add an OFT row with no start and no end.
- ACTION: pick the OFT front seat; read his line on the crew list. Hover him over the seat. Drop him. Read the note,
  the warning list, his puck.
- EXPECTED: crew list plain (host's reading of D2573 "a man who has filed something is unchanged" — a question, not a
  requirement). For the warning list and the puck's amber "A": RECORD exactly what it says.
- PROVES IT WRONG: the crew list offers him with no reason, and the drop at once raises an amber "SANS: not offering
  OFT today. Planned on …" with the amber chip and ring — the two screens saying opposite things about the same seat.
  (Not ruled; goes to the owner as Question 1 with both pictures.) Repeat with an untimed AMT row and "Fly only".

### 2. The same, mirrored on a flight: untimed flight, he filed "OFT only"
- SETUP: as 1, but file OFT only; an ordinary flight line with no take-off time.
- ACTION: pick its front seat, read the crew list, drop him, read the warning list and puck.
- EXPECTED: crew list plain (D2573, unchanged). Warning list: RECORD.
- PROVES IT WRONG: this behaved differently before the change (it is the comparison case for 1 — if a flight is
  silent on both screens and the sim is not, the sim half is the fault).

### 3. Sim with only ONE time typed
- SETUP: SANS man, nothing filed. Three OFT rows: (i) start 10:00, no end; (ii) no start, end 11:30; (iii) neither.
- ACTION: pick the front seat of each in turn; read his line and the "N free" count.
- EXPECTED: struck on all three — a timed seat strikes him (existing rule), an untimed one strikes him (D2584 Q5).
- PROVES IT WRONG: he is plain on any of the three — most likely (ii), where the row has an end and no start and is
  neither "timed" nor "untimed" to one of the two checks. Also wrong: the reason words differ between the three.

### 4. Untimed sim — every place in the room, not only the two seats
- SETUP: SANS man, nothing filed; an untimed OFT row and an untimed AMT row.
- ACTION: pick, in turn: front seat, rear seat, the extras / "+ more" place, a passenger place if the row has one.
  Then drop him into an extras place and sign in as him (if Ranger) to read the bell.
- EXPECTED: front and rear struck (D2584 Q5). Extras / passenger place: RECORD exactly what it says. His bell counts
  the day whichever place he sits in (D2568: "a sim with nothing filed").
- PROVES IT WRONG: front struck and rear plain (or the reverse); or his bell reminds him of a day whose crew list
  offered him with no reason (extras place plain, bell counting) — record it as a disagreement for the owner.

### 5. Untimed sim, nothing filed — the warning list stays quiet, the bell does not
- SETUP: SANS man (Ranger, a day on or after his date), nothing filed. Untimed OFT row.
- ACTION: drop him in the front seat despite the strike. Read the note after the drop, the warning list, his puck.
  Sign in as `us`, open the bell.
- EXPECTED: no amber "SANS: …" line and no amber "A" chip from this change (the amber line is only for "not
  offering" or a window that misses — nothing filed has never raised one; unchanged). His bell's SANS reminder counts
  that day (D2568: a seat with no times counts). The note after the drop: RECORD exactly what it says.
- PROVES IT WRONG: an amber SANS line appears for an untimed sim with nothing filed; or his bell misses the day.

### 6. Standby line that FLIES by a typed B or R — all three kinds
- SETUP: SANS man, nothing filed. "+ Wave" → SC; type a B (then, separately, an R) on its first shift so the whole
  shift flies. Same for an AVALON wave and a BB wave.
- ACTION: pick each MAIN and each SPARE seat; read the crew list and "N free". Drop him on a MAIN. Read the note, the
  warning list, the puck, the green rings; sign in as him for the bell.
- EXPECTED: never a SANS reason on any seat, no amber SANS line, no amber "A" for SANS, the bell does not count the
  day (D2584 Q4, D2576/D2578 "flying or not").
- PROVES IT WRONG: any "SANS —" reason on the crew list, hover or note; an amber "SANS: … Planned on SC/AVALON/BB …";
  the bell counting the day. Watch especially the AVALON and BB rows — a flying one is treated as a jet by other
  rules, so it is the likeliest to still be asked.

### 7. Standby line that flies by the Flies tick on ONE row only
- SETUP: SC wave with two rows on a shift; tick Flies on one row only. Same on AVALON.
- ACTION: seat the SANS man (nothing filed) on the ticked row, then move him to the unticked row, then untick Flies
  while he sits there, then tick it again.
- EXPECTED: plain throughout; nothing SANS appears or disappears on the warning list, the puck or the bell at any of
  the four steps (D2584 Q4).
- PROVES IT WRONG: a SANS reason or amber line that flashes on at the tick or the untick.

### 8. Standby line, he filed something that MISSES it
- SETUP: SANS man filed "OFT only" (and, separately, Fly with a window 08:00–10:00). SC MAIN shift 07:00–13:00, both
  standing by and flying (typed B).
- ACTION: pick the seat, hover, drop; read the warning list and puck.
- EXPECTED: plain; no "SANS — not offering Fly", no "SANS — available 08:00–10:00 only", no amber line (D2584 Q4).
- PROVES IT WRONG: any of those three wordings on the crew list, the hover, the note or the warning list.

### 9. Standby line with NO shift times (BB is made that way)
- SETUP: a fresh BB wave left with its shift times blank; an SC wave with its times cleared; an AVALON likewise.
- ACTION: pick MAIN and SPARE seats with the SANS man (nothing filed) on the crew list.
- EXPECTED: plain (D2584 Q4: "never strike him for nothing filed"; D2573 excluded standby lines already).
- PROVES IT WRONG: "SANS — no availability filed for today" on an untimed SC MAIN — the one seat the new
  untimed-strike could have reached.

### 10. Same day: on a standby line AND in a real seat
- SETUP: SANS man (Ranger), nothing filed, seated on SC MAIN 07:00–13:00 and on an ordinary flight T/O 15:00 the same
  day. Then a second day where he is ONLY on SC.
- ACTION: read the warning list, his puck on both rows, then his bell as `us`.
- EXPECTED: the bell counts the first day once and never the second (D2568, D2584 Q4). File "OFT only" and the amber
  line names the flight, never the SC line.
- PROVES IT WRONG: the first day dropped from his bell because a standby row was met first; the second day counted;
  an amber line naming the SC row.

### 11. Drag between a standby seat and an ordinary seat
- SETUP: SANS man, nothing filed, seated on SC MAIN. An ordinary timed flight and an untimed OFT row with empty seats.
- ACTION: drag him from the SC seat over the flight seat, then over the OFT seat (hover, do not drop — picture). Drop
  on the OFT. Then drag him back over the SC seat and drop.
- EXPECTED: hover over the flight and over the untimed OFT gives the nothing-filed reason (D2573, D2584 Q5); hover
  over the SC seat gives no SANS reason (Q4). Notes after each drop match the hover.
- PROVES IT WRONG: the hover says one thing and the note after the drop another; the SC hover carries a SANS reason
  left over from the seat he came from.

### 12. The green "where can he go" rings
- SETUP: a day with an SC wave (one shift standing by, one flying), an AVALON wave, a BB wave, a timed flight, an
  untimed flight, a timed OFT and an untimed AMT, all with empty seats. SANS man, nothing filed.
- ACTION: pick him on the crew list (desktop) / tap him (phone) to show the rings. Picture.
- EXPECTED: standby seats are not held back for a SANS reason (Q4); the flights and both sims are held back for
  nothing filed (D2573, Q5). Where a standby seat is not ringed, open it and RECORD the reason it gives.
- PROVES IT WRONG: an untimed sim seat ringed green while the crew list strikes him for it; a standby seat left
  unringed with a SANS reason behind it.

### 13. The "N free" count
- SETUP: as 12. Note the count with a timed flight seat picked.
- ACTION: pick an SC MAIN seat, then the untimed OFT seat; read "N free" each time. Count the unstruck names by hand.
- EXPECTED: the count equals the names shown as free; the SANS man is inside the count on the SC seat and outside it
  on the untimed sim seat.
- PROVES IT WRONG: the number and the list disagree by one on either seat.

### 14. No seat picked (D2420)
- SETUP: SANS man, nothing filed; the day holds only standby waves and an untimed OFT row; nothing picked.
- ACTION: read his line on the crew list at both sizes, on both screens.
- EXPECTED: no reason line drawn for him (D2420). How his name is drawn with no seat picked: RECORD.
- PROVES IT WRONG: a SANS reason line appears with no seat picked; or it differs between Edit Schedule and the Board.

### 15. Filing and un-filing while the crew list is open
- SETUP: SANS man, nothing filed; untimed OFT seat picked (struck).
- ACTION: on the Inputs page's SANS tab file "OFT, all day" → back: read. Delete that input → back: read. Use Undo for
  the delete → read.
- EXPECTED: struck → plain → struck → plain, with no reload needed.
- PROVES IT WRONG: the crew list keeps the old answer until the page is reloaded or another seat is picked.

### 16. Typing the times onto the sim afterwards
- SETUP: SANS man filed OFT 08:00–10:00. Untimed OFT row, he is seated in front (plain while untimed, by the host's
  reading).
- ACTION: type 13:00–14:30 onto the row. Read the crew list with the seat picked, the warning list, the puck. Clear
  the times again.
- EXPECTED: timed → "SANS — available 08:00–10:00 only" on the crew list and the amber line on the warning list
  (existing rule); cleared → both gone.
- PROVES IT WRONG: the amber line or chip stays after the times are cleared, or never arrives when they are typed.

### 17. Ranger around his SANS date (D2338, D2340)
- SETUP: `ad`. Find the date Ranger becomes SANS. Take the day before it, the date itself and a day in the week
  after. On each: an untimed OFT row, an SC MAIN seat.
- ACTION: pick each seat with Ranger in view; read his line.
- EXPECTED: day before — ordinary on both, no SANS words at all (D2338, D2340). On and after — struck on the untimed
  OFT, plain on SC. The wording on a day SANS only by a posting not yet run: RECORD exactly (the longer "SANS from
  <date>: …" line may show).
- PROVES IT WRONG: struck on the day before; plain on the untimed OFT on the date itself; the longer wording shown on
  a standby seat.

### 18. His bell, end to end (sign in as `us`)
- SETUP: `ad`. Across one week on or after Ranger's date, nothing filed: day A only SC SPARE; day B AVALON MAIN
  ticked Flies; day C BB; day D untimed AMT rear seat; day E a timed flight; day F a cancelled OFT row; day G a duty
  desk only.
- ACTION: sign in as `us`; open the bell; read the SANS reminder — which days it names or how many.
- EXPECTED: D and E only (D2568, D2564, D2584 Q4). Then, as `ad`, move him off D; as `us` the reminder drops D.
- PROVES IT WRONG: A, B, C, F or G named; D missing. Especially B — a flying AVALON row counted before this change.

### 19. Cancelled rows
- SETUP: SANS man, nothing filed. Cancel a standby shift he is on; cancel an untimed OFT row he is on; cancel one
  aircraft row of a flying SC shift.
- ACTION: read the warning list, the puck and (Ranger) the bell after each.
- EXPECTED: a cancelled line never counts (D2568); nothing SANS on the warning list.
- PROVES IT WRONG: the bell still counting the cancelled untimed sim.

### 20. An absence still outranks SANS on an untimed sim
- SETUP: SANS man, nothing filed, and on leave that day.
- ACTION: pick the untimed OFT seat.
- EXPECTED: his leave is the reason shown, not the SANS words (the existing order — absences first).
- PROVES IT WRONG: the SANS line replaces the leave reason.

### 21. The published day
- SETUP: `ad`. A day with the SANS man (nothing filed) on SC MAIN, on a flying AVALON row and on an untimed OFT.
- ACTION: read the warning list before publishing; publish; open the published day (desktop and phone, as `ad` and
  as `us`); then make one change to open an amendment and read the warning list again.
- EXPECTED: no amber SANS line or "A" chip for the two standby rows before or after publishing (Q4). What publishing
  says about him on the untimed OFT with nothing filed: RECORD exactly.
- PROVES IT WRONG: an amber SANS mark on a standby row on the issued face or in the amendment's warning list.

### 22. Phone: tap-to-plan
- SETUP: phone 402, Edit Schedule and the Board. SANS man, nothing filed.
- ACTION: tap an SC MAIN seat, tap his name; read the note. Tap the untimed OFT seat, tap his name; read the note.
  Picture right after each tap and once settled.
- EXPECTED: no SANS words in the SC note (Q4); the untimed OFT note carries the nothing-filed reason, the same words
  as the desktop drop (Q5).
- PROVES IT WRONG: the phone note differs from the desktop note for the same seat; the reason line is cut off or
  overlaps at 402.

### 23. Plain-user round (every walk has one)
- Build a normal day from empty as a scheduler would: a flying wave, "+ Wave" for SC, an OFT and an AMT row, crew
  dropped in, a time typed, a row cancelled and restored, Undo and Redo across a drop onto an SC seat and onto an
  untimed sim, the panel opened and closed at both sizes. Look at every other place that shows the day (the week, the
  Board, the member's own view). EXPECTED: nothing SANS on a standby row anywhere; Undo puts back exactly what was
  there.

---

## Negatives — what must NOT have changed

1. A regular (not SANS) man is never given a SANS reason on any seat — untimed sim, standby, flight.
2. An ordinary TIMED flight: nothing filed → struck; "OFT only" → "SANS — not offering Fly" and the amber line;
   a window that misses → "SANS — available hh:mm–hh:mm only" and the amber line; a window that covers → plain.
3. A TIMED OFT / AMT: the same three reasons, judged on the sim's own hours as before.
4. An ordinary flight with no times: nothing filed → struck (D2573); filed anything → plain.
5. A SANS man's OTHER reasons on a standby seat still show — "not SC DAY current" / "not SC NIGHT current", leave,
   already busy at that hour, crew rest. Q4 removes only the SANS reason.
6. Ground rows, programme rows, duty desks (the SC, AVALON and BB desks included), all hands: never a SANS reason,
   never counted by the bell.
7. The warning list's other lines for a standby row (currency, double booking on a flying row) are unchanged for a
   SANS man and for a regular.
8. A SANS man who filed "all day, Fly + OFT + AMT" is plain everywhere, bell silent.
9. The amber "A" chip and ring for SANS on an ordinary flight or timed sim still appear and still clear when he is
   moved off.
10. No new note reading "SANS — told on his bell" appears anywhere (D2584 Q4: built later with the SANS info line,
    "nothing before").
11. Another member signed in does not see Ranger's SANS reminder; an admin's bell is unchanged.
12. The wording "SANS — no availability filed for today" is letter for letter the same on a flight, a timed sim and
    an untimed sim.

---

## Questions for the owner the rulings do not settle

1. **Untimed sim, he filed something that does not offer that sim** (e.g. Fly only, on an OFT with no times). When
   it happens: a scheduler pencils a sim in before its times are known, and the man has told the squadron he is
   coming in to fly only. Today the crew list would offer him with no reason. Should it instead say "SANS — not
   offering OFT" (no times are needed to know that), and should the warning list agree either way? Scenario 1 shows
   what each screen says now. The same question for an untimed flight and "OFT only" (scenario 2).
2. **A sim's extra places** (a body in the room, not a seat) with no times and nothing filed: struck like the two
   seats, or left plain? His bell counts them already (scenario 4).
3. **A sim with only one time typed** — treated as timed or untimed? Either way he is struck for nothing filed, but
   it decides which rule a filed window is held against (scenario 3).
4. **The no-seat-picked crew list** on a day whose only places are standby lines: should a SANS man with nothing
   filed look ordinary there, since nothing on that day asks him for availability (scenario 14)?
5. **Publishing with a SANS man on an untimed sim, nothing filed** — no warning line is raised for "nothing filed"
   (only the strike and his bell). Is that enough, or should publishing say something (scenario 21)?
