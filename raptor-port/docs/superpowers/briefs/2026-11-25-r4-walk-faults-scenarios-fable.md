# Walk scenarios — the note's box, and the Board's held sections (designer: Fable, blind)

Read: the brief, `CHANGE.diff`, and in the copy `ui/toast.ts`, `ui/dayswap.ts`, `ui/SchedBoard.tsx` (the paint), `ui/board.ts`
(the day's builder, the day change, the OIL Earn press), `ui/board-html.ts`, `ui/oilmode.ts`, `ui/schedule-tab.ts`,
`ui/textedit.ts`, `ui/rowdrag.ts`, `ui/scheduler/28-blocked.css`, the rulings pages for the scheduler and inputs.
Nothing run. No handoff block was pasted into my context. No other designer's report was read.

## 1. What the code does, in the terms the scenarios need

- The Board's day is one panel whose top-level children are: the "THIS DAY" bar, then one wrapper per section in the
  day's order — Overall notes, Common Programme, Flying waves (ALL the waves in one wrapper), Duties, Sims, Ground
  Programme, Personal Inputs, Available crew, SANS Avail, Unavailable. Eleven children on an editable day.
- Under a caret the new code matches old and new children **by position and by count only** — never by which section
  each is. Same count but different sections at a position = the wrong thing written at that position, and the caret's
  section left standing where another now belongs.
- In **OIL Earn**, a frozen look and a read-only Board the sections are NOT wrapped: each flying wave is its own
  top-level child and Available crew is left out. So an editable day (11) and the same day in OIL Earn (9 + the number
  of waves) have the **same count exactly when the day has two flying waves**.
- An owed section is written only by the **next paint**. A paint comes from a save, or from the caret leaving ALL text
  boxes. Moving the caret from one section's box to another section's box with nothing new typed starts no paint.
- A press that does not move the focus (an iPhone's tap on a button — WebKit) keeps the caret in its box. The section
  grip, a section's sort and Sort all take the caret out first; **OIL Earn, Undo / Redo, the day arrows (for an In-time
  line, an area or a stores box — only the plain boxes are left first) do not**.
- Kinds of box on the Board: time boxes and name / remark boxes of rows (plain boxes), an input's own start / end /
  remark, note lines, a section's notes box, and the typed-in-place words: In-time lines, AREA and its time, stores.

**For every WebKit-only scenario: after the press, check the caret is still in the box (the keyboard still up /
`document.activeElement`). If the browser moved the focus, say the scenario could not be made there — do not report a
pass.** A picture right after each press and a settled one (D1281).

## 2. Scenarios, ranked by likely failure

### B1 — OIL Earn switched on while the caret is in a box, a two-wave day (phone, WebKit matters)
- Phone 402×874 touch, WebKit. Scheduler `ad`/`a`.
- Setup: Edit Schedule, a Saturday or Sunday with exactly two flying waves (add or remove a wave), one accepted input
  on its Ground Programme, Personal Inputs open. Open that day's Board.
- Presses: tap the input's start box under Personal Inputs (keyboard up). Without closing the keyboard, scroll up and
  tap "OIL Earn" on the THIS DAY bar. Picture. Then repeat with the caret first in a Ground Programme row's box, then
  in a Duties box, then in a flying line's callsign.
- EXPECTED: each section appears once, in the day's order, and the day reads as OIL Earn or as the editable day — never
  a mix (the promise: "every other section shows what is saved"; the contract's "anything that does not line up …
  writes nothing"). The note "OIL Earn: tap a puck…" shows.
- Disproves: Personal Inputs drawn twice and Ground Programme gone (caret in Personal Inputs); Ground twice and Sims
  gone (caret in Ground); Duties twice and Go 2 gone (caret in Duties); Go 2 twice (caret in the waves). Also run it on
  a day with one and with three waves and RECORD (expected there: nothing changes until the caret leaves, as on main).
  After closing the keyboard: the whole day in OIL Earn, each section once.

### B2 — Undo of a section's move with the caret in a box (phone, WebKit matters)
- Phone 402×874, WebKit. Scheduler.
- Setup: Board open, Personal Inputs open with an accepted input. Drag Personal Inputs by its grip to above Ground
  Programme (decline "Set as default").
- Presses: tap the input's start box (caret in it, nothing typed). Tap Undo in the Board's bar. Picture. Tap Redo.
  Picture. Close the keyboard. Picture.
- EXPECTED: after Undo, Ground Programme above Personal Inputs, each once; after Redo the reverse; the box he tapped
  still holds the caret (the promise: "Undo / Redo with the caret in a box still put the screen right").
- Disproves: two Personal Inputs sections on screen, or Ground Programme missing, until the keyboard closes; a box of
  the doubled section that takes typing.

### B3 — The section the caret has LEFT catches up without waiting for a save (desktop; any browser)
- Desktop 1440×900, Chromium. Scheduler.
- Setup: a published weekday (so a change wears its amendment mark), Board open. A man who flies Go 1; an accepted
  input for him well clear of the flight, Personal Inputs open.
- Presses: under Personal Inputs type a start that overlaps his flight, Tab (caret in the End box). Note what his puck
  shows in that row, in the Ground Programme row and on his flying line. Now click into a box of ANOTHER section
  (an Overall notes line, or a Duties time box) and type nothing. Picture after one second. Then press Tab once more
  inside that other section without typing. Picture. Then click blank space. Picture.
- EXPECTED: while the caret is in Personal Inputs its own row may wait (contract: "Held by design until the caret
  leaves its section: the puck rings and marks inside that section"); **once the caret is in the other section, the
  Personal Inputs row shows the same ring / mark / amendment mark as the Ground Programme row** (the promise: the held
  section is "written whole once the caret leaves").
- Disproves: the Personal Inputs row still un-ringed / unmarked while the caret sits in the other section, catching up
  only at the next save or when the caret leaves every box. RECORD exactly when it catches up.
- Repeat the other way round: caret first in a Ground Programme plain row (type a START that clashes), Tab, then click
  into Personal Inputs.

### B4 — A day arrow pressed with the caret in an In-time line (phone, WebKit matters)
- Phone 402×874, WebKit. Scheduler.
- Setup: Board on Tuesday, a wave with an In-time line; Wednesday visibly different (other callsigns).
- Presses: tap into the In-time line, type "0715 ALL" (do not leave it). Tap the › day arrow. Picture. Close the
  keyboard. Picture. Step back to Tuesday.
- EXPECTED: RECORD exactly what it shows after the arrow. Sourced part: the title says Wednesday and, once the keyboard
  closes, the whole day is Wednesday's; Tuesday holds "0715 ALL" once, on the line it was typed in (board.ts, the
  day-change rule: a typed value is saved to the day being left).
- Disproves: Wednesday's sections with Tuesday's flying waves between them under Wednesday's title; the typed line
  lost, doubled, or written into Wednesday. Repeat with the caret in an AREA box and in a stores box.

### B5 — The plain-user round of the Board's ground rows (desktop, then phone in WebKit)
- Desktop 1440×900 Chromium; again on phone 402×874 WebKit (the keyboard's Tab; on the phone also the keyboard's own
  next-box arrow — RECORD where the caret lands). Scheduler.
- Setup: Edit Schedule, a weekday, Board open. Ground Programme → "+ Inputs": Training, one man, 08:00–10:00, title
  "Range brief". Open Personal Inputs.
- Presses, a picture after each: (1) Personal Inputs row, start box: 0900, Tab. (2) start box again: 0800, Tab.
  (3) end box: 1130, Tab (caret in remarks). (4) remarks: "bring kit", Tab. (5) on the Ground Programme row of the same
  input, START: 0830, Tab. (6) ✕ Close / ✓ Done; look at the week's Ground Programme row and Personal Inputs row for
  the day. (7) reopen the Board. (8) Inputs page: the input on its date, and its window. (9) the bell, as the scheduler
  and signed in as the man (`us`/`us` if he is the man). (10) reload, look again.
- EXPECTED: after each of 1–4 the Board's Ground Programme row reads the time / remark just saved, at once, the caret
  still on the Board (the fault fixed). After 5 the Personal Inputs row reads 08:30 at once (D739, D740: a time typed
  on an input's row changes the input itself). The box holding the caret is the same box, its text and caret as left;
  Tab goes start → end → remarks → the next open box (D554, D555). 6–10: every place reads 08:30–11:30 "bring kit";
  the bell and the change history as on main today (RECORD the lines; the scheduler's name on the change — D739).
- Disproves: any Ground Programme reading one change behind; the caret's box redrawn (text reselected, caret jumps,
  keyboard drops); a Tab that lands nowhere; the week or the Inputs page disagreeing with the Board.

### B6 — The other rows an input stands on (desktop)
- Desktop, Chromium. Scheduler. Personal Inputs open. A picture after each Tab.
- (a) A shared input (two named men): type its end under Personal Inputs, Tab → EXPECTED the one Ground Programme row
  reads it at once, both pucks still on it (D661, D739).
- (b) An input filed for ALL AVAIL: type its start under Personal Inputs, Tab → EXPECTED its row under **Common
  Programme** reads it at once and keeps time order there (D955).
- (c) Unavailable: a leave 08:00–17:00 for a man seated on a flying line; type end 0900, Tab → EXPECTED at once: his
  puck's ring on the flying line, his place in Available crew, the warning list and its count (D509; contract: the
  warnings "are current while he types on"). His own Unavailable row may wait.
- (d) Personal Inputs FOLDED (its default), caret in a Ground Programme request row: type START, Tab → EXPECTED the
  folded heading keeps its count; then open Personal Inputs by its heading → the row there reads the new time.
- (e) A time that is refused: type "abc" in the input's start box, Tab → EXPECTED the amber note, the box back to the
  stored time, the Ground Programme row unchanged (board.ts: "a refused value must never be left on screen").
- Disproves: any of these rows one change behind while the caret is on the Board, or doubled.

### B7 — Undo / Redo of a typed time, the caret kept and the caret gone
- Phone 402×874 WebKit (caret kept) and desktop Chromium (the press takes the caret). Scheduler.
- Presses: Personal Inputs start 08:00 → type 0900, Tab (caret in End). Undo. Picture. Redo. Picture. Close the
  keyboard / click blank space. Picture.
- EXPECTED: after Undo the Ground Programme row reads 08:00 at once; after Redo 09:00; once the caret has left, the
  Personal Inputs row reads the stored time too (the D994 lesson: an owed block is rewritten even if Undo puts back
  what it showed).
- Disproves: the Personal Inputs start box still reading 09:00 after Undo and the caret gone; the Ground row behind.

### B8 — The box never moves while sections above it change (phone, WebKit matters)
- Phone 402×874 WebKit, phone layout; then the ⋯ menu's desktop layout, pinched out as far as it goes. Scheduler.
- Setup: as B6 (c), with enough crew that Available crew gains or loses a line of pucks; scroll so the Unavailable row
  is mid-screen.
- Presses: type the end, press the keyboard's Tab / next. Measure the box's top before and after; repeat making the
  list shrink. Repeat with the first warning of the day appearing (the checks panel above grows).
- EXPECTED: the box's place on screen moves by no more than 1px, the keyboard stays up, the half-typed value in the
  next box survives a second save (the promise; `holdingPlace`, Safari has no anchoring of its own).
- Disproves: the row jumping under the finger; the page left scrolled so the box is under the bar or the keyboard.
  RECORD the case where the page is scrolled to its very foot and the list above shrinks.

### B9 — A row removed from the section the caret is in, by a press in another section (phone, WebKit matters)
- Phone, WebKit. Scheduler. Two accepted inputs, both on the Ground Programme, the upper one's Reject under Personal
  Inputs in reach.
- Presses: tap the remarks box of the LOWER input's Ground Programme row, type "xyz" (keyboard up). Tap "Reject" on
  the UPPER input under Personal Inputs. Picture. Close the keyboard. Picture.
- EXPECTED: RECORD exactly what it shows. Sourced part: "xyz" ends on the row it was typed in, once, and no other row
  gains it (the lesson behind the grip and sort presses: "one line doubled, the other lost").
- Disproves: "xyz" on the wrong row or lost. The same with "+ Item" and ✕ pressed inside Ground Programme itself while
  the caret is in it (the unchanged hold — RECORD).

### B10 — A re-ordered day, and the Tab route across sections (desktop)
- Desktop, Chromium. Scheduler. Day with Flying waves dragged to the foot and Personal Inputs above Ground Programme.
- Presses: B5 steps 1–5 again; then Tab from the last box of one section into the first of the next, typing a change
  in each; Shift+Tab back; Tab from the day's last open box.
- EXPECTED: the right section updates, none doubled; Tab follows the displayed order, reaches only open boxes, and
  after the last one goes to the next button or stays (D551, D553, D555, D597).
- Disproves: a section written at another's place; the caret on nothing.

### N1 — The long word, at every door that says it (phone; WebKit and Chromium)
- Phone 402×874 and 320×700, both browsers. Scheduler. Type 60 letters with no space, then Tab / leave the box, in:
  (a) a Board time box (a flying line's take-off); (b) an input's start box under Personal Inputs on the Board;
  (c) the same box on Edit Schedule's week; (d) the input's window, its start time, then Save — the note is at the
  TOP (D731 (1)); (e) a duty template's and a wave template's time box.
- EXPECTED: the words inside the note's border on every line, the note 12px from each side (D828), amber, at the foot
  (top for d), nothing of it off the screen; the box healed to the stored time.
- Disproves: any letter past the border or the screen edge; in (d) the taller note covering the window's Save / Close;
  in (e) the note hidden under the dialog (RECORD where it stands).

### N2 — No ordinary note has moved (phone 402 and desktop 1440; compare with main)
- Raise, on this build and on main, and measure the note's box (left, width, height), its line count and colours:
  a plain one ("Input added"), an amber one (a not-current crew drop), a red one (a hard breach on a drop), the grey
  "Blocked:" one (a refused change — its sign, bold lead, quieter rest, read from the left, D1668), a publish receipt
  joined with " · ", the note with a window up on a phone (top), the note while "OIL not answered" stands (above it).
- EXPECTED: identical to main in every measure (the promise: "no ordinary note's look moves").
- Disproves: a different width or line count, a break inside an ordinary word, the Blocked sign squeezed or its words
  wrapped differently.

### N3 — Widths between a phone and a desktop (RECORD)
- Desktop browser at 621, 768 and 900 wide, and the phone on its side (874×402, WebKit): the 60-letter note from a
  week time box.
- EXPECTED: inside its border and on the screen (the promise). RECORD its width and lines beside main's — here the
  box is half the window, so the word is now broken where main widened the box; that is a change of look for a note
  that was already on the screen.
- Disproves: letters outside the border; a note wider than the window.

## 3. What I looked for and found MISSING (why B1–B4, B9 rank where they do)

| Thing | Has it? |
|---|---|
| A check that the section at a position is the same section before a write | MISSING — count only (B1, B2, B4) |
| The caret taken out of its box before OIL Earn is switched | MISSING (sort, Sort all and the grips have it) — B1 |
| The same before a day arrow, for In-time lines, AREA, stores | MISSING (plain boxes have it) — B4 |
| A paint when the caret goes from one section to another | MISSING — B3 |
| The caret's section while it is in the flying waves | has it, but ALL waves are one section: Go 2 waits while he types in Go 1 (as before) |
| A caret in a frozen look, a read-only Board, OIL Earn | must not: none has an open box (but see B1 for getting there with one) |
| The note's box at every face and place | has it — one element, one style (N1–N3) |

## 4. Negatives — checked, no fault expected

- **A member, a guest, a frozen look at a published version, a read-only Board:** no open text box is drawn there, so
  the new path is never taken; the Board is written whole as on main.
- **Typing in the Board's search box or with an input's window over the Board:** not the Board's own panel; unchanged.
- **Highlights, search dimming, the armed-seat ring, the gold history dots, the Blue/Red question:** put back after
  every paint over the whole Board, as before; a replaced section gets them again.
- **Pinch zoom:** kept on the day's outer box, never on a section, so a replaced section keeps the zoom.
- **A refused value in the caret's box:** healed in place by the box's own handler, not by a redraw (B6 e checks it).
- **Text areas' height:** grown by the stylesheet, not by script; a replaced section sizes itself.
- **The note's hold time, its place, its screen-reader copy:** untouched by the one added style.
- **An ordinary note on a desktop:** the box is as wide as its words up to half the window, as before; the added style
  only acts where a single word cannot fit a line.
- **The Leave War's notes:** the same element; N2's Blocked note can be raised from Balances as a second sample.
- **Data already stored:** nothing here depends on it.
