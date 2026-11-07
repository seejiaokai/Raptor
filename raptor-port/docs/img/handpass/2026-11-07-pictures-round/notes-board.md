# Pictures round, group board (the Scheduler Board and OIL Earn): notes for the host

Drawn 7–8 Nov 26 on the app built from `main` (served at port 4291), signed in as Saber (admin), the clock held at
Mon 13 Jul 2026 09:00. Script: `raptor-port/scripts/handpass/pr-board.mjs`; every number below is in
`pr-board-measured.json` beside these notes. Pictures at 2×: his iPhone (402 × 874, touch), the iPhone on its side
(874 × 402, touch) and his PC (1536 × 864); the narrow-desktop question at 821 to 1100 wide, 900 tall. Every drawn part
is the app's own: a style copied from a real neighbour, nothing saved.

**Questions 3 and 4 can be answered together.** Both are OIL Earn on the Scheduler Board, both drawn on the same Saturday,
and they are separate decisions: neither answer depends on the other. They land in the same two files and one walk.
Questions 1 and 2 are separate too; question 2's recommended fix also shortens the line question 1 is about
(189 → 111 px at 874 wide), but does not solve question 1 on its own.

---

## 1. [BOARD-SIDEWAYS-KEYS] Phone on its side with the keys up: the board's top leaves little room — STILL OPEN, partly better

**(a) The question.** With your phone on its side and the keyboard up, the Scheduler Board's top takes most of what is
left of the screen: should the title and day strip scroll away with the list, so the list gets the room?

**(b) Still open? Yes, partly better since D1081.** Measured at 874 × 402 with a 200 px stand-in keyboard:
- At rest, no keys: the board's top is 146 px of the 402 (three rows: Calendar and the title; the day strip and search;
  the highlight chips with Templates, Sort all, Undo, Redo, History, the sync dot, the bell, Insights, Done).
- Keys up: 202 px of screen left; the top keeps its 146, leaving **56 px** for the list. A time box tapped (Mon 13 Jul,
  the first VL line's landing time) does rise into that strip and can be typed in: the old trap (a 16 px strip, a box
  that could not be brought up) is gone with D1081. But you see that one line's boxes and nothing above or below it.
- Each jet's line at this width is 189 px tall (question 2's fault), so even one whole line does not fit.
- **Overlap check:** [BOARD-KEYS-LEFT] and [WINDOWS-KEEP-KEYS] are both about a PC's keyboard (reaching menus and day
  chips by keys, Tab kept inside a window: D1646, D1648). Neither touches the phone's on-screen keyboard covering the
  screen. No overlap, so this item is not overtaken.

**(c) Pictures** (each tagged on the picture; the stand-in keyboard is a dark block labelled "Stand-in for the keyboard,
200 px: a test browser cannot raise an iPhone's keys"):
- `q-sideways-today-rest.png` — real, today, no keys: the top ringed, "The board's top: 146 px of the 402".
- `q-sideways-today-keys.png` — real, today, keys up, the landing-time box ringed: "Today: the top keeps 146 px; 56 px
  left to see the list".
- `q-sideways-fold-keys.png` — drawn: the top down to its one bar, keys up: "Drawn: the top folded to its one bar,
  51 px; 151 px left to see the list". Serves both A and B (their keys-up state is the same picture).
- `q-sideways-b-scrolled.png` — drawn B, no keys, scrolled down: "Drawn: scrolled down, the day strip and title scroll
  away; the bar stays, 51 px".

**(d) Options.**
- **A — fold only while the keys are up** (the backlog item's own idea). Pictures: today-keys → fold-keys. When the
  keyboard opens, Calendar, the title, the day strip and search fold away and the bar alone stays: 151 px to see the
  list instead of 56. No new words. Cost: at the moment the keys rise, the list jumps up 95 px under your finger. That
  goes against D1081 and D1412 (nothing on screen jumps when the keyboard opens) unless the fold moves in step with the
  keys, which is the hard, fragile part.
- **B — on a phone on its side, the title and day strip scroll with the list; the bar stays** (recommended). Pictures:
  today-rest (B at the top of the board looks exactly like today), b-scrolled, fold-keys. Scrolled to the top, nothing
  changes; scroll down, or tap a box low on the screen with the keys up, and Calendar, the title, the day strip and
  search scroll away like any page, while the bar (highlight chips, Templates, Sort all, Undo, Redo, History, sync,
  bell, Insights, Done) stays pinned, 51 px. With the keys up: 151 px for the list, and nothing moved when the keys
  opened. No new words. Cost: to change day, jump to a date or search, scroll back to the top first. Changes no ruling;
  it keeps D1048, D1081 and D1412. (The agent's reading: it follows his D1643, a phone on its side gets one row of
  bar at the top, though D1643 is about the app's own top bar, not the board's.)
- **C — leave it.** A tapped box always rises into view now; you type with one line's boxes in sight. Sideways typing
  on the board is the rare case (D820: the phone is for minor changes).

**(e) Recommendation: B.** It gives the list the room with nothing jumping when the keys open (D1081, D1412); it behaves
the same with the keys up or down, as an ordinary page does: what is not needed scrolls away, the bar you act from stays.
A has the same room but only by moving the screen at the worst moment, and a fold that watches the keyboard is one more
moving part to break. C leaves a 56 px slot. The host may want his iPhone look first (see the end: the real keyboard
could not be raised here).

**(f) Worked example.** Hold your phone on its side on the Scheduler Board, Mon 13 Jul, and tap the first VL line's
landing time (14:05) to change it. Today the keys come up and the board's top keeps 146 px: you see the one row of boxes
of that line in a 56 px slot. With B, the title and day strip scroll away as the box rises: the bar with Undo and Done
stays at the top and 151 px of the list is in view, the line before and after included.

**(g) For the build.** The top is one flex-wrap row, `.sb-top` (`src/ui/scheduler/10-board-history.css:42`; phone rules in
`src/ui/scheduler/13-board-rows-responsive.css` from line 341, the top's at 555–580), built in `src/ui/SchedBoard.tsx`;
the list scrolls in `.sb-boardwrap`; the keyboard rise is `src/ui/kbscroll.ts` (the board is a keyboard layer there).
B: on a short screen (about 500 px tall or less, the board's sideways look) move Calendar, the title, the day strip
(`.sb-nav` / `.sb-days`) and search into the top of the scroller, the bar's line (`.sb-hl` + `.sb-actions`) staying
pinned. **What the drawing touched that the item did not name:** search and the Calendar button go with the day strip
(the item named only the day strip and headings); the highlight chips (CAT, TYPE, QUALS) stay in the bar; the empty
line-break item between the two halves (`.sb-break`) must go too, or a 12 px empty line stays (63 → 51 px). The line
headings (CS, MSN …) are already inside the list. The drawing hid the parts and scrolled the list 120 px; it did not
move them into the scroller, so the scrolling-away itself is unbuilt and unseen. Walk it on his iPhone, where Safari pans
the page as the keys rise.

---

## 2. [BOARD-NARROW-DESKTOP-REMARKS] The desktop board from 821 to 1099 wide — STILL OPEN, worse than filed

**(a) The question.** On a narrow desktop window (and a phone on its side, and an upright iPad Pro), each jet's line on
the board is very tall and its remarks are squeezed or cut off: which fix should it get?

**(b) Still open? Yes, and worse than the item said.** Each line measured (Mon 13 Jul, first wave, VL: Saber in front,
Echo in back, remarks "1B: BFM-6"):

| Width | Line tall | Remarks seen | What is cut off past the panel's edge |
|---|---|---|---|
| 821 | 189 px | 0 (box 16 px, past the edge) | back seat, remarks, buttons (175 px over) |
| 874 (phone on its side) | 189 | 0 | back seat, remarks, buttons (122 px over) |
| 900 | 189 | 2 px | buttons (96 px over) |
| 950 | 189 | 16 px | buttons (46 px over) |
| 1000 | 189 | 16 px | nothing |
| 1040 | 131 | 32 px | nothing |
| 1060 | 93 | 52 px | nothing |
| 1080 | 65 | 72 px | nothing |
| 1100 | 65 | 92 px ("1B: BFM-6" just fits) | nothing |

The item said "821 to about 1000, remarks 16 px"; the line is cramped up to 1080, and below about 950 parts of the line
are out of reach altogether.

**(c) Pictures** (each cut to the first formation's headings and two lines, the first line and its remarks ringed, the
numbers on the tag):
- `q-narrow-today-821.png`, `-900.png`, `-1000.png` — real, today: 189 px tall; at 821 "the back seat, remarks and
  buttons cut off"; at 900 "remarks 2 px wide; buttons cut off"; at 1000 "remarks 16 px wide".
- `q-narrow-today-1100.png` — real, today at 1100, where it is fine: 65 px tall, remarks 92 px.
- `q-narrow-a-821.png`, `q-narrow-a-1000.png` — drawn A.
- `q-narrow-b-821.png`, `q-narrow-b-1000.png` — drawn B.
- `q-narrow-c-821.png`, `q-narrow-c-1000.png` — drawn C.

**(d) Options** (each for 821–1099 only; from 1100 up the board stays as today; no new words in any):
- **A — the phone's own line.** Line 137 px at every width; remarks 150 px. The mission box stretches wide, R over B
  and TO over LD at the right, the two seats on a row under it with the remarks beside, the buttons at the foot.
  Everything in view. Changes D1029 (the desktop board keeps the times in one line) for these widths, and puts a phone
  layout on a desktop.
- **B — the remarks and the line's buttons take a row of their own; the times stay in one line.** Line 83 px;
  remarks 424 px (821) to 522 (1099). Keeps D1029. But at 821–900 the six times and two seats still do not fit: the
  back seat and the buttons stay cut off (89 px over at 821, 36 at 874, 10 at 900). Fine from about 950.
- **C — B, with R over B and TO over LD as on a phone** (recommended). Line 111 px; remarks 323 px (821), 355 (874),
  368 (900), 418 (1000), 468 (1099); everything in view at every width. The headings stack the same way (R over B,
  TO over LD), as the phone's do. Changes D1029 (and D1026's line on it) for 821–1099 only: the times stack there as on
  a phone (D1029's picture 6); from 1100 they stay in one line.

**(e) Recommendation: C.** It is the only option with every part of the line in reach at every width in the range, a
phone on its side included; it gives the remarks real room (over 300 px everywhere); and it uses the stacked times the
app already draws on a phone, so there is one stacked look, used wherever the room runs short. B keeps your D1029 but
still cuts off the back seat and buttons on the narrowest screens; A spends height on a layout made for a phone. One
honest cost: at 1080–1099 today's line is already 65 px tall, and C makes it 111 px there, in exchange for remarks of
about 460 px instead of 72–91 (where "1B: BFM-6" is cut). The build can move the band's top edge if a measure there says
so.

**(f) Worked example.** Open the board on your phone held on its side (874 wide), Mon 13 Jul, the first VL line (Saber
in front, Echo in back, remarks "1B: BFM-6"). Today the line is 189 px tall and Echo, the remarks and the line's
buttons (CX, the red box, +, ✕) are past the panel's edge, out of reach. With C the line is 111 px: R over B and TO over
LD, both seats in view, the remarks 355 px wide on their own row with the buttons beside them.

**(g) For the build.** `src/ui/scheduler/13-board-rows-responsive.css`: the band at lines 48–49
(`(min-width:821px) and (max-width:1439px)`, grid `18px 56px 64px 48px 48px 48px 48px 1fr 1fr 1.2fr 92px`) gets a
narrower band, 821–1099, before it. The rules drawn for C (`.sb-rb` and `.sb-tl` are `display:contents` on a desktop;
the phone's stacking rules are in the `(max-width:820px)` block from line 341):
```css
@media (min-width:821px) and (max-width:1099px){
 .schedboard:not(.sb-wide) .sb-lcols,.schedboard:not(.sb-wide) .sb-line{grid-template-columns:18px 56px 64px 48px 48px 1fr 1fr}
 .schedboard:not(.sb-wide) .sb-line>.sb-rb,.schedboard:not(.sb-wide) .sb-line>.sb-tl{display:flex;flex-direction:column;justify-content:flex-end;gap:4px}
 .schedboard:not(.sb-wide) .sb-lcols>.sb-hrb,.schedboard:not(.sb-wide) .sb-lcols>.sb-htl{display:block;line-height:1.25}
 .schedboard:not(.sb-wide) .sb-lcols>.sb-hrb>span,.schedboard:not(.sb-wide) .sb-lcols>.sb-htl>span{display:block}
 .schedboard:not(.sb-wide) .sb-line>.sb-grip{grid-row:1}
 .schedboard:not(.sb-wide) .sb-line>.sb-rcell{grid-column:2 / 7;grid-row:2}
 .schedboard:not(.sb-wide) .sb-line>.lctl{grid-column:7 / -1;grid-row:2;align-self:center}
 .schedboard:not(.sb-wide) .sb-lcols>:nth-child(8),.schedboard:not(.sb-wide) .sb-lcols>:nth-child(9){display:none}
}
```
**What the drawing touched that the item did not name:** the line's buttons move with the remarks to the second row;
the NOTES heading and the end column's heading are hidden in the band (the remarks no longer sit under them); the grip
is pinned to the first row; the range reaches 1099, not "about 1000"; it covers a phone on its side (874) and an
upright iPad Pro (834, 1024), which the item did not name; the wide board (`.sb-wide`) is untouched. The board's
geometry tests (`e2e`) at these widths need new measures.

---

## 3. [OIL-EARN-DAY-SWITCH-WORDS] OIL Earn's "Nothing today earns" reads like a statement — STILL OPEN

**(a) The question.** In OIL Earn, the day's "Nothing today earns" button looks like the app saying nobody earns, even
while a man plainly earns: should it become a real switch, or a button whose words say what it does?

**(b) Still open? Yes.** Sat 18 Jul (Fable on the SDO desk, 08:00–18:00, earning FO), OIL Earn on:
- The button reads "Nothing today earns" (149 × 23 px) in both states. Pressed, it fills amber; the words stay the same.
- Only its hover words change: "Nothing today earns — covers anything added later too" off, "Let this day earn again"
  on. On a phone there is no hover, so only the amber fill tells the two states apart.
- Pressed, the note under the bar reads "Nothing on this day earns OIL. The marks underneath are kept — turn it off and
  they come back." A tap on Fable then says "Nothing on this day earns. Turn off the switch first." (his D845 words).
  The app already calls it a switch; it is drawn as a button.

**(c) Pictures** (each cut from the OIL Earn bar down to Fable's puck; in the off pictures his puck is tagged "Fable
earns OIL here: FO"):
- `q-oilswitch-today-off-desk.png`, `-phone.png` — real, today, off: "A switch that reads like the day's state".
- `q-oilswitch-today-on-desk.png`, `-phone.png` — real, today, pressed: "Pressed: the same words, lit".
- `q-oilswitch-a-off-desk.png`, `-phone.png` — drawn A, off: "Drawn A: the app's own switch, off".
- `q-oilswitch-a-on-desk.png`, `-phone.png` — drawn A, on: "Drawn A: the switch on".
- `q-oilswitch-b-off-desk.png`, `-phone.png` — drawn B, off: "Drawn B: the button says what it does".
- `q-oilswitch-b-on-desk.png`, `-phone.png` — drawn B, pressed, its new note ringed: "Drawn B: pressed, the words turn
  round".

**(d) Options.**
- **A — the app's own switch, labelled for what on does** (recommended). The Logic page's switch (a small slider and
  its words), 129 × 23 px, words **"No OIL this day"**. Off: the slider grey. On: the slider lit in the switch's own
  cyan. The note under the bar stays word for word ("… turn it off and they come back." already speaks of a switch), and
  so does D845's "Turn off the switch first." The hover keeps its one fact, "covers anything added later too". Changes:
  the label; the lit look goes from the amber fill to the switch's cyan, which touches the design guide's line that OIL
  Earn's "on" looks stay as they are (§4), so it is his call; D845 and D844 call it the "Nothing today earns" switch, a
  name to update.
- **B — a button whose words say what it does, and turn round when pressed.** Off: **"Stop OIL for this day"**
  (151 px); pressed, lit amber as today: **"Let this day earn again"** (167 px). The note when on becomes **"Nothing on
  this day earns OIL. The marks underneath are kept and come back when you let the day earn again."** D845's "Turn off
  the switch first." no longer fits (there is no switch), so it needs new words, for example "Nothing on this day earns.
  Let the day earn again first." Changes D845 and D844 (his own wording) and the note's words.

**(e) Recommendation: A.** A switch shows whether it is on by its look, so its words only have to say what on does (the
design guide's §1, and his lesson 66: the switch beside the words already shows whether it is on). His own refusal words,
the bar's note and the walkers' own reading all already call it a switch, so A makes the screen match the words, and
nothing else changes. B fixes the misreading with words that flip at every press, so the button's words and the day's
state must be kept in step in three more places (a man's puck, an event's OIL mark, the ALL AVAIL window), and it
changes his D845 wording. A's one cost is the colour (amber → cyan) when on, his to rule.

**(f) Worked example.** Sat 18 Jul, OIL Earn on: Fable on the SDO desk earns FO. Today the bar shows a button "Nothing
today earns" right above Fable's FO, as if the app contradicted itself. With A the bar shows a switch, off, "No OIL this
day", and Fable's FO stands. Switch it on: the switch lights, the note says "Nothing on this day earns OIL. The marks
underneath are kept — turn it off and they come back.", and a tap on Fable says "Nothing on this day earns. Turn off the
switch first."

**(g) For the build.** The button: `src/ui/oilmode.ts` `dayBarHTML` (line 547; the on-note at 553; `DAY_EARNS_NOTHING`
at 533); the press: `src/ui/board.ts` line 1119 (`data-oilblank` → `setOilBlanket`); its look:
`src/ui/scheduler/18-oil-board.css` lines 83–84 (the amber). The switch to copy: `.lgmix` in
`src/ui/scheduler/01-logic.css` (lines 67–71), its markup in `src/ui/LogicPage.tsx` (91–92), a checkbox with
`role="switch"`, so Space works by keys. Tests that press it: `src/ui/oilmode.test.tsx` (lines 172–188, 324–330);
`src/ui/noteswords.test.ts` pins `DAY_EARNS_NOTHING` (stays under A, changes under B). **What the drawing touched that
the item did not name:** the bar's heading capitals would turn the switch's words into capitals, so the drawing set the
Logic page's own letters (Inter Tight 12 px, ordinary case) and the build must too; on a phone the switch (129 px) is
narrower than the button (149 px), so the bar's row still fits.

---

## 4. [OIL-INERT-TAP-SILENT] In OIL Earn, a tap on a puck that cannot earn says nothing — STILL OPEN

**(a) The question.** In OIL Earn, when you tap a man's puck that cannot earn on that row, should the app say why at
the foot of the screen, instead of picking him?

**(b) Still open? Yes.** Sat 18 Jul, the SDO desk with its end time cleared, Fable on it, OIL Earn on:
- Phone: a tap picks Fable (his puck and his name in the crew list light blue); no note is raised.
- PC: a click does the same; the reason shows only on hover: "Fable — no OIL worked out — this row has no end time".
- His D31 says a seat with nothing to measure "says why instead"; his D65 says that in OIL Earn a tap on a man (in the
  ALL AVAIL window) selects nothing. Today's board does neither on a phone.
- **How the puck was made:** through the board's own boxes, as a scheduler would. On Saturday's SDO desk (Fable,
  08:00–18:00) the end time was cleared (on the PC: one click, Backspace, Tab; on the phone the box's value was emptied
  and the board's own change sent, since typing on an emulated phone is unreliable), then OIL Earn was switched on with
  the board's own button. That is his D360 case, a row with a start and no end.

**(c) Pictures** (each cut from just above the desk to the screen's foot, where the note shows; the empty end-time box
ringed):
- `q-inert-today-phone.png` — real, today: "Tapped: picked in blue; nothing says why".
- `q-inert-today-desk.png` — real, today: "Clicked: picked in blue; the reason only on hover: "Fable — no OIL worked
  out — this row has no end time"".
- `q-inert-a-phone.png`, `q-inert-a-desk.png` — drawn A, the note ringed: "Drawn A: a tap says why; nothing is
  picked" (the PC's: "a click says why in the passing note").
- `q-inert-b-phone.png`, `q-inert-b-desk.png` — drawn B, the note ringed: "Drawn B: the grey "Blocked:" note" (the
  PC's adds "the same words …; nothing is picked").

**(d) Options** (both: the tap picks nothing; the tap targets stay as they are, D26):
- **A — the app's passing note, his name and the reason** (recommended): **"Fable: no OIL worked out — this row has no
  end time"**. The words after his name are the hover's today (D360's sentence), kept, so the tap and the hover agree.
  The other reasons read the same way, e.g. "Fable: nothing measurable to earn from here". Changes no ruling: it does
  what D31 asks and carries D65's rule from the ALL AVAIL window to the board.
- **B — the grey "Blocked:" note** (D1667, D1668): **"Blocked: no OIL worked out — this row has no end time"**, the
  grey note with the red no-entry sign. Changes no ruling's words, but D1667 is for a change refused; this tap is not a
  change. The mode's own refusals ("Nothing on this day earns. Turn off the switch first.", "This event earns nobody any
  OIL. Turn the event back on first.") are plain notes today, so B makes the mode say things two ways unless they all go
  grey together.

**(e) Recommendation: A.** The tap is asking "why not him?", not trying a change, so the plain note answers it, in the
same look as the mode's other notes; it names the man, which matters on a row of several; and the words are the ones the
PC already shows on hover, so nothing new to learn. B would be right only if he wants every refusal in the mode grey,
which is a wider change.

**(f) Worked example.** Sat 18 Jul: the SDO desk has a start of 08:00 and no end time, Fable on it. In OIL Earn you tap
Fable on your phone. Today he lights blue and nothing says why; the reason is only in the ALL AVAIL window's foot. With A,
nothing is picked and the note at the foot says "Fable: no OIL worked out — this row has no end time".

**(g) For the build.** The inert puck is drawn in `src/ui/oilmode.ts` in three kinds, each with its reason only in its
hover title: line 713 (an ALL / ALL AVAIL puck: "the people behind it are switched in the window its count opens"),
715 (nothing to earn: `inertWhy`, line 678) and 723 (a decision that cannot be changed here). Carry the reason in a
data attribute, not the title. The tap: `src/ui/board.ts`, the mode's own branch at about line 1422 (`[data-oilp]`, the
earning pucks) — the inert ones have no `data-oilp`, so today the tap falls through to the ordinary selection. Add a
branch there: in the mode, a tap on `.oilpk.inert` says "<callsign>: <reason>" through the passing note and stops,
picking nothing. **What the drawing touched that the item did not name:** the selection also lights his name in the
crew list (two places, not one); the ALL / ALL AVAIL placeholder is an inert kind too, so check its count's own tap
(which opens the window) is not swallowed. A unit test: the tap says the reason and leaves nothing picked.

---

## What could not be pictured, and why

1. **The iPhone's own keyboard and Safari's page pan** (question 1): a test browser cannot raise them. A 200 px stand-in
   block is drawn and said on each picture; the numbers (56 px today, 151 px drawn) assume the visible screen shrinks by
   200 px. His iPhone may pan the page instead, so the real look on his phone is unseen.
2. **Motion** (question 1): A's jump when the keys open, and B's title and day strip scrolling away, cannot be shown in
   a still. B is drawn at its end state: those parts hidden and the list scrolled 120 px.
3. **The browser's own hover box** (questions 3 and 4): the PC's hover words cannot be photographed. They were read from
   the page and written in (b) and on the tag of `q-inert-today-desk.png`.

**For the host's skill log (this helper may not write under `.claude/`):** twice tonight a tag on a ringed part was cut
by a panel that hides what overflows it (the OIL Earn bar, and the flying wave's panel at 821 wide) and the script ran
clean. A check in the tag helper that each tag lies inside every clipping parent would catch it before the picture is
taken (the method file, `mockups-on-the-real-app.md`).
