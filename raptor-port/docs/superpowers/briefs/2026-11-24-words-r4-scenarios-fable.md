# Round 4 of the words pass — walk scenarios (the fresh Fable designer, blind)

(Saved by the host, chat 168, from the designer's returned text, unchanged: its Write tool refused the file.)

Read: D2521's full row; the words file (§After the fresh Fable's read, §His answer); `facts.json`; the commit's source diff; `state/notices.ts` (the one writer `noticePass` → `common`, the one drawer `noticeWords`), `state/perms.ts` (the bell-line gate), `ui/topbits.tsx`, `ui/inputedit.tsx`, `ui/InputWindow.tsx`, `ui/drag.ts`, `state/view.ts`, `ui/toast.ts`, `leavewar/sync.ts`, `ui/oilday.ts`, `ui/OilDayList.tsx`, `engine/inputs.ts`, `engine/time.ts`. No compaction happened; no handoff block or other designer's work was read. Only read-only commands were run; no test, no build.

Demo names used: Saber = the scheduler (admin); Ranger, Rocky, Pike, Hunter = members. Devices: phone 402×874, desktop 1440×900.

## 1. The map — what exists, and where a sign or a gesture should be

**Bell lines.**
- One writer: every command that changes an input passes through one place at save (`sched-commit` → `noticePass` → `common`). So every door that goes through a command writes the new shape: the input's window, the Inputs list's in-place cells, the schedule's Ground Programme / Unavailable row boxes, the Scheduler Board's cells, Inputs-calendar drags, Undo / Redo. A door that misses is one that writes outside a command.
- The Leave War's own commands do NOT use these words: a leave the war approved is told by the war's line ("LL bid changed to OL", "LL moved to …"); only its remark is told the Inputs way. A leave retyped on the Inputs page is told the new way.
- One drawer: the bell's list (`topbits.tsx`), the same component on desktop and phone. Nothing else reads the words.
- Who is told: everyone in the input before and after (the same words each), and its filer; never the one who did it. A man put in or taken out gets only "You were added / taken off" — never mixed with the other parts.
- Part order in a line is fixed: cancelled / un-cancelled → off / on the programme or Unavailable → Now … → added → taken off → kind changed → renamed → remark. "First two" follows this order.
- The gate (`perms.ts`) keeps no list of which parts a line may hold; it checks who, which input, and that a written line is not rewritten. So a new part should not be refused — to be proved by a member's save (B8).

**Notes.**
- Bad time: two code doors — the save of a window/draft (`normalizeInputDraft`), and the in-place cells (`setInpField`: Inputs list, schedule row boxes, board cells, one man's row of a shared input). **The window's Start / End are the browser's own time boxes** (`type="time"`), which cannot hold "2560"; and where a value has letters, the window's check answers "Give the input a start and end time, or tick All day" BEFORE the new words. So the window door may be unreachable, and for letters the two doors may differ (N2).
- Drag back onto own seat: one place (`drag.ts`), reached when the seat let go on is the seat picked up. The tap's twin (`view.ts placeArmed`) is reachable only for a placeholder (facts.json q4b).
- Look-ahead: one door, the Inputs page's own setting, admin only.
- No-period publish note: one writer (`publishFlagsBids`), said at publish; joined to the publish note and to the OIL lines by the note batcher (`toast.ts toastBatch`), which adds its own full stops in one of its joins.
- "Leave War period": the refusal and the created note (one click handler), the button's hover in two drawers (the week's warning list, the board's).
- OIL day list refusal: the window closes itself for a non-admin; facts.json already found it not reachable.

## 2. Scenarios, ranked by likely failure

Every bell scenario: do the change as the role named, then sign in as the reader, open the bell, picture the line (phone unless said), and copy its words exactly.

### B1 — a title that is the new kind's own name (bell; phone; Saber acts, Ranger reads)
- Setup: Saber files a Training for Ranger and Rocky, Wed 15 Jul 09:00–10:00, title "Meeting".
- Press: open it, change Kind to Meeting, touch nothing else, Save.
- EXPECTED: "Training changed to Meeting · Saber" and nothing more (D2521 Q1: "Renamed" only when the title's own words change — nobody changed a title).
- Disproves: "Training changed to Meeting, renamed — was Meeting". (The code compares the name less the kind; the old title "Meeting" becomes no title once the kind is Meeting — I expect this fault.)
- Also: title "meeting" (small m); and kind changed to Meeting with title "Brief" kept → EXPECTED "Training changed to Meeting" alone, bold name "Brief".

### B2 — a kind change that drops what the old kind had (bell; phone)
- (a) Training titled "Range brief" → LL (a kind with no title). EXPECTED: "Training changed to LL, renamed — was Range brief · Saber" (the row's reading: a title taken away keeps "Renamed"). RECORD exactly; disproves: a third phantom part, or "LL" in small letters.
- (b) LL (AM) for Ranger → Training, nothing else touched. EXPECTED: "LL changed to Training" alone — the person changed no time. RECORD exactly. Disproves: "Now 00:00–12:00, LL changed to Training" (the half is dropped with the kind, so the hours read as moved — I expect this; it was so on main, but now sits beside a sentence saying what really happened).
- (c) Training 00:00–12:00 (typed) → LL. RECORD: I expect "Now LL (AM), Training changed to LL", which says LL before saying it became LL. A wording finding for the host if seen.
- (d) LL all day → OL and AM in one save. RECORD ("Now OL (AM), LL changed to OL" expected).
- (e) Attach with To "145 Sqn" → Training. RECORD (expected "Attach changed to Training, renamed — was Attach · 145 Sqn").

### B3 — lines saved before this build (bell; phone and desktop; Ranger reads)
- Setup (the host seeds; no door writes these any more): three lines to Ranger in the old shape — (i) one part, renamed, was "LL", bold name "OL"; (ii) one part, when, hours "00:00–12:00 am"; (iii) three parts: when with a date, renamed was "Training", remark.
- EXPECTED: (i) "Renamed — was LL · Saber"; (ii) "Now 00:00–12:00 am · Saber" (the brief: read as they always did; facts.json q1/q2 "today"). (iii) RECORD exactly — the code will now say "Now Thu 16 Jul, renamed — was Training, and 1 more change"; the host decides whether that counts as "as it always did".
- Disproves: (i) reads "LL changed to OL" or blank; (ii) reads "Now AM" or "Now" alone; any line missing, or the bell not opening.
- Then tap each: it opens the input as it stands; no error.

### B4 — three or more changes: the count and the small letters (bell; phone and desktop)
One save each, by Saber, on a Training for Ranger and Rocky:
- (a) the ruled case: day moved to Thu 16 Jul, title "Training"→"Range brief", remark changed. EXPECTED: "Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber" (D2521 Q3; facts q3-after-a).
- (b) as (a) plus Pike added. EXPECTED: "Now Thu 16 Jul, Pike added, and 2 more changes" — "Pike" keeps its capital.
- (c) cancelled with reason "weather" + renamed + remark. EXPECTED: "Cancelled — weather, renamed — was Training, and 1 more change" (words file Q3).
- (d) un-cancel + hours to 09:00–11:00 only. EXPECTED: "Un-cancelled, now 09:00–11:00" — two parts, no "more" (words file Q3).
- (e) kind Training→Meeting + remark + Pike taken off. EXPECTED: "Pike taken off, Training changed to Meeting, and 1 more change" — "Training" keeps its capital in second place.
- (f) three people added + moved + remark. RECORD ("Now …, 3 people added, and 1 more change" expected).
- (g) counts: exactly two changes → no "and 0 more"; three → "1 more change" (singular); four → "2 more changes".
- (h) a rename as the only change: "Renamed — was Training" keeps its capital R.
- Disproves any: a capital after a comma on a word that is not a name or "You"; a name or kind lowered; a wrong count; "changes" for one; the third part still printed.

### B5 — the half day, every form and door (bell; phone)
- (a) window: LL all day → AM. EXPECTED "Now LL (AM) · Saber" (facts q2). → PM: "Now LL (PM)".
- (b) in-place cells on the Inputs list: on an all-day LL type 0000 in start and 1200 in end. EXPECTED the same "Now LL (AM)" once both are in (RECORD what the first cell's own save says).
- (c) AM → PM: "Now LL (PM)". AM → all day: "Now all day" (the row). AM → 09:00–11:00: "Now 09:00–11:00".
- (d) moved and made a half in one save: "Now Thu 16 Jul (AM)" (the row). A two-day leave made AM, if the window lets it: RECORD.
- (e) the titled form "Now AM": find a kind that offers both a Title and AM / PM. If none does, say so — then "Now AM" has no door except an Attach with a "To" (its bold name is not its kind): RECORD what that reads.
- (f) a half-day LL only moved to another day (still AM). RECORD ("Now Thu 16 Jul" expected, no "(AM)" — as on main).
- (g) a kind with no half (Training) typed 00:00–12:00: EXPECTED clock times "Now 00:00–12:00", never "(AM)".
- Disproves: any "am"/"pm" in small letters with clock times on a new line; "Now  (AM)" with a gap; "Now LL (AM)" on a titled input.

### B6 — the long line on his iPhone (bell; phone 402×874)
- Setup: B4 (a) and (b); and the longest honest case — a 40-character title renamed, a day range moved across two months, plus two more changes.
- EXPECTED: (a) two lines in the 307px row, whole, "· Saber" visible (D2521 Q3: "two lines on his iPhone"); the age at the right not overlapped; the unread dot in place; the whole row still the tap target.
- The longest case: RECORD how many lines. Disproves: words cut with "…" or clipped; the list wider than the screen; "Mark all read" or "↓ N more" covered.
- Desktop: the same lines; picture.

### N1 — a bad time, every door (note; desktop, then phone; scheduler, then a member on his own input)
For each door type 2560 in Start and leave it; then 0975 in End; then with both wrong:
1. the Inputs list's in-place start / end cells;
2. the schedule's Ground Programme row of an input (its Str / End boxes), on Edit Schedule;
3. the same input's row on the Scheduler Board;
4. one man's row of an input shared by two (the Unavailable block);
5. the input's window.
- EXPECTED: "2560 is not a time. Try 0900 or 09:00." — the value as typed, the first bad box named (D2521 Q4a; facts q4a-2-after); the cell goes back to what it held; nothing saved; no bell line to the others.
- Door 5: the window's boxes are the browser's time pickers — try typing 2560; if it cannot be entered, write "not reachable through the window" (not a fault).
- Disproves: the old "That is not a time — try 0900 or 09:00" anywhere; "undefined is not a time"; the wrong box named; two full stops; the value saved.

### N2 — letters, one digit, a long string (note; desktop)
- In an in-place cell type `abc`; `9`; `25:00`; `0960`; a 60-character string; a value with spaces round it.
- EXPECTED: "<typed> is not a time. Try 0900 or 09:00." each time, trimmed (the row: names what was typed). The 60-character one: RECORD how the note sits (phone too).
- If the window can be made to hold letters or a half-typed time: RECORD whether it answers the same words or "Give the input a start and end time, or tick All day" — two doors with two wordings would break the row's "reads the same in both".
- The schedule row's boxes: RECORD whether the value is named as typed or tidied.

### N3 — dragged back onto its own seat, each kind of seat (note; desktop; scheduler in Edit Schedule, then the Board)
Pick up and let go on the same seat: a flying seat (Ranger); a duty desk; a ground row's first man; a ground row's second man; a sim seat; a placeholder (ALL AVAIL) in a seat; one man of an input's own row.
- EXPECTED: "Ranger — already in that seat" (D2521 Q4b; facts q4b-2-after); the placeholder: "ALL AVAIL — already in that seat" (as the tap's, facts q4b-1); the seat flashes; nothing changes; Undo has nothing new.
- Disproves: "Already in that seat"; an id ("bane") or a blank before the dash; a different note on the board; the man gone from the seat.
- Phone: a drag back on a seat, if the phone allows drags. RECORD.
- The tap's twin for the placeholder still reads the same words (facts q4b-1).

### B7 — who gets the line, and who never does (bell; desktop)
- Saber changes LL→OL on a leave Hunter filed for Ranger and Rocky (not war-approved).
- EXPECTED: Ranger, Rocky and Hunter each read "LL changed to OL · Saber", bold name "OL"; Saber's bell has nothing.
- Then Saber takes Rocky out and changes the kind back in one save: Rocky reads only "You were taken off · Saber"; Ranger "Rocky taken off, OL changed to LL".
- Disproves: differing words between readers; the actor told; Rocky told of the kind.

### B8 — a member's own change (bell + the permissions gate; phone; Hunter acts)
- Hunter (member) files a Training for Ranger and Rocky; later, in one save: kind → Meeting, title changed, hours changed, remark changed.
- EXPECTED: the save goes through with its ordinary note — no "could not be saved"; Ranger reads the first two, then "and N more change(s) · Hunter".
- Disproves: a refusal; no line; a line with no "· Hunter".

### B9 — Undo and Redo of a change that wrote a new line (bell; desktop)
- Saber: LL→OL and AM on Ranger's leave. Ranger's bell shows the line. Saber presses Undo.
- EXPECTED (as on main): the line leaves Ranger's bell; Redo puts the same line back with the same words, once. RECORD whether Undo writes a line of its own.
- Then Ranger reads the line; Saber Undo → Redo: no doubled line, unread state as on main.
- Disproves: the line doubled; back in the old words; the bell lit with nothing in it; Redo refused.

### B10 — the replaced bid, never counted (bell; phone)
- Setup: Ranger has a pending LL bid (AM) on Thu 16 Jul on the Leave War. Saber, on the Inputs page, in one save moves a Training of Ranger's onto 16 Jul, renames it and changes its remark, so it replaces the bid.
- EXPECTED: "Now Thu 16 Jul, renamed — was Training, and 1 more change · replaces your LL (AM) bid · Saber" (the row; D1525 for the half). With exactly two changes: no "more".
- Disproves: "2 more changes"; the bid part missing or in the middle; the bid counted.

### B11 — the Leave War's copy of a leave (bell; desktop)
- (a) A war-approved LL of Ranger's, retyped to OL in its window on the Inputs page by Saber. EXPECTED: one line; RECORD its words ("LL changed to OL" expected) — never two lines.
- (b) The same done on the Leave War grid. EXPECTED: the war's own line as on main today; no "changed to" line beside it.
- (c) Its remark changed from the war's window: "Remark changed · Saber", once.

### P1 — the no-period publish note, every join (note; desktop, then phone)
World: a week in a year with no Leave War period (facts s2: 2028).
- (a) plant a man on the Saturday, sign all, publish. EXPECTED: "Saturday published and approved · No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War." (facts s2-after), one full stop at its end.
- (b) the same with an input on that Saturday whose OIL question nobody answered, and (c) with a man the app cannot credit — so the unanswered / blind line is said too. RECORD exactly. Disproves: "..", a sentence starting in small letters, the no-period sentence lost, said twice, or glued on with no space.
- (d) Saturday and Sunday published in one press, if a door does that: the sentence once, not twice.
- (e) a weekday public holiday in that year; (f) an amendment republished on that Saturday; (g) published from the Scheduler Board. EXPECTED the same sentence each.
- (h) a normal weekday: no such sentence. (i) phone: the note's width and line count — picture.
- The day's warning list on that Saturday reads the identical sentence.

### P2 — "Leave War period", three places (note + hover; desktop)
- On that Saturday: hover "Create the 2028 period" in the week's warning list, and in the Scheduler Board's warning list. EXPECTED: "Creates the 2028 Leave War period, with nothing open for bidding, and takes you to the Leave War to open its dates" (the diff; the row).
- Press it as Saber: "The 2028 Leave War period is created. Open its dates for bidding here." and the Leave War opens on 2028. Undo's hover: RECORD.
- As a member (if he sees the button): "Only a scheduler can create a Leave War period".
- With a period already covering part of that year: RECORD the note — the code still says "A leave war already covers part of 2028…" in small letters; a neighbour this round did not rule, for the host to list.
- Disproves: "leave war period" in small letters in any of the three.

### L1 — the look-ahead note (note; desktop; admin)
- Inputs page → the look-ahead setting. Save: 4 weeks, Sunday ticked → "Everyone now opens on the next 4 weeks, to Sunday" (facts s1-after). 1 week, ticked → "Everyone now opens on the next week, to Sunday" (words file S1). 1 week, unticked → RECORD ("Everyone now opens on the next week"). 2 weeks unticked → "…the next 2 weeks". 52.
- Bad figure (0, 53, "x"): "Give a number of weeks between 1 and 52", as on main; nothing saved.
- The button beside it still reads "Next 4 weeks, to Sunday" (its own label, unchanged).
- Disproves: "sunday", "next 4 weeks" without "the", "the next 1 weeks".

### O1 — the OIL day list, a member's save (note; desktop)
- Try: open the list as Saber; in a second tab remove his admin right (or change who is signed in); back in the first tab press Save without reloading.
- EXPECTED: "Only a scheduler can answer from this list" (the row), nothing saved — or the window has already closed (facts q4c: not reachable). Either is a pass; RECORD which. Disproves: "Only a scheduler answers from this list"; answers saved.

### B12 — the tap, and the list's own furniture (bell; phone)
- Tap a "LL changed to OL" line and a "…and 1 more change" line. EXPECTED (as on main): the input opens as it now stands; the line goes read; "Mark all read" and "↓ N more" behave as before with two-line rows in the list (the count of lines below is right when rows are two lines tall).

## 3. Explicit negatives — checked, no fault expected

- **A line refused by the permissions gate for its new parts.** The gate checks the reader, the input, the time and that nobody rewrites a line; it keeps no list of allowed parts. B8 proves it on screen.
- **A second place that draws bell words.** Only the bell's list reads them; no passing note, history line or export does.
- **A door that changes an input but writes the old words.** All doors save through the one pass, and the words are made in one function. Doors differ only in whether they save at all (N1).
- **"You were added / taken off" or "Deleted" lowered or counted.** Each is always a line's only part.
- **Leave War lines, posting lines, holiday lines.** They take another path in the drawer and never reach the first-two rule.
- **Typed text in the bad-time note breaking the screen.** The note is written as plain text, never as markup.
- **The same no-period sentence said twice when two days publish together.** The batcher drops an identical note.
- **Stored inputs reading wrongly** — out of scope by the brief (demo data); only B3's "old lines still read" is tested.
- **A scheduler who is not an admin** — not a case (D785); none is set up above.

## 4. Count and order

19 scenarios: B1–B12, N1–N3, P1, P2, L1, O1. Order to walk (most likely to fail first): B1, B2, B3, B4, B5, B6, N1, N2, N3, B7, B8, B9, B10, B11, P1, P2, L1, O1, B12. B3 needs the host's seeding step.

Three faults I expect from reading alone, each to be shown on screen before it counts: B1 (a phantom "renamed" when the old title is the new kind's name), B2 (b)/(c) (a phantom or oddly ordered "Now …" when a kind change adds or drops the half), and N2 (letters in the window, if it can hold them, answer different words from the cells).
