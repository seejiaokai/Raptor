# Pictures round, group board (the Scheduler Board and OIL Earn): notes for the host

Drawn 7–8 Nov 26 on the app built from `main` (served at port 4291), signed in as Saber (admin), the clock held at
Mon 13 Jul 2026 09:00. Script: `raptor-port/scripts/handpass/pr-board.mjs`; every number below is in
`pr-board-measured.json` beside these notes. Pictures at 2×: his iPhone (402 × 874, touch), the iPhone on its side
(874 × 402, touch) and his PC (1536 × 864); the narrow-desktop question at 821 to 1100 wide, 900 tall. Every drawn part
is the app's own: a style copied from a real neighbour, nothing saved.

**Revised 8 Nov 26** after the blind design read (`review-design.md`, Board) and the cold read of the new words
(`cold-read.md`, numbers 1–9): Q1's worked example and tags, Q3's words and a third option, Q4's words and the end-time
tag. Every picture named below was retaken and opened after the change. The words, before → after, are listed after Q4.

**Questions 3 and 4 can be answered together.** Both are OIL Earn on the Scheduler Board, both drawn on the same Saturday,
and they are separate decisions: neither answer depends on the other. They land in the same two files and one walk.
Questions 1 and 2 are separate too; question 2's recommended fix also shortens the line question 1 is about
(189 → 111 px at 874 wide), but does not solve question 1 on its own.

---

## 1. [BOARD-SIDEWAYS-KEYS] Phone on its side with the keys up: the board's top leaves little room — STILL OPEN, partly better

**(a) The question.** With your phone on its side and the keys up, how should the Scheduler Board's top give the list
room?

**(b) Still open? Yes, partly better since D1081.** Measured at 874 × 402 with a 200 px stand-in keyboard:
- At rest, no keys: the board's top is 146 px of the 402, over a third of the screen (three rows: Calendar and the
  title; the day strip and search; the highlight chips with Templates, Sort all, Undo, Redo, History, the sync dot, the
  bell, Insights, Done).
- Keys up: 202 px of screen left; the top keeps its 146, leaving **56 px** for the list, under a third of one line. A time box tapped (Mon 13 Jul,
  the first VL line's landing time) does rise into that strip and can be typed in: the old trap (a 16 px strip, a box
  that could not be brought up) is gone with D1081. But you see that one line's boxes and nothing above or below it.
- Each jet's line at this width is 189 px tall (question 2's fault), so even one whole line does not fit.
- **Overlap check:** [BOARD-KEYS-LEFT] and [WINDOWS-KEEP-KEYS] are both about a PC's keyboard (reaching menus and day
  chips by keys, Tab kept inside a window: D1646, D1648). Neither touches the phone's on-screen keyboard covering the
  screen. No overlap, so this item is not overtaken.

**(c) Pictures** (each tagged on the picture; the stand-in keyboard is a dark block labelled "Stand-in for the keyboard,
200 px: a test browser cannot raise an iPhone's keys"):
- `q-sideways-today-rest.png` — real, today, no keys: the top ringed, "The board's top: 146 px of the 402, over a third
  of the screen".
- `q-sideways-today-keys.png` — real, today, keys up, the landing-time box ringed: "Today: the top keeps 146 px; 56 px
  left for the list, under a third of one line".
- `q-sideways-fold-keys.png` — drawn: the top down to its one bar, keys up: "Drawn: the top folded to its one bar,
  51 px; 151 px left for the list, most of one line". Serves both A and B (their keys-up state is the same picture).
  What it shows under the bar: the cut wave heading, the column headings, an empty band (the top of the VL line's own
  189 px) and that line's boxes. Nothing of the lines before or after it.
- *Kept as drawn (the design read's (3)):* in the two keys-up pictures the words sit in the keyboard stand-in, not on the
  ring. That block is the one empty place on the picture; a tag on the ring would cover the 56 px slot it measures.
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
  bell, Insights, Done) stays pinned, 51 px. With the keys up: 151 px for the list (most of one 189 px line today, about
  one line once Q2 is fixed: C makes the line 111 px), and nothing moved when the keys opened. No new words. Cost: to change day, jump to a date or search, scroll back to the top first. Changes no ruling;
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
stays at the top, and 151 px of the list is in view: the line's boxes whole, with the empty top of its own 189 px line
above them. The lines before and after come into view only once Q2 shortens the line (C makes it 111 px).

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
- *Kept as drawn (the design read's (3)):* the tag sits on the wave's empty second in-time line (only its ✕, at the far
  right, stays in sight). Raised, it would cover the wave's name; hung below the ringed line, it would cover the next
  line, which the picture measures.

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
geometry tests (`e2e`) at these widths need new measures. From the design read: in C at 1000 the two seats stand about
370 px apart (two equal columns) and the buttons drift right; give the seats fixed widths and let the remarks take the
rest, so the line stays dense.

---

## 3. [OIL-EARN-DAY-SWITCH-WORDS] OIL Earn's "Nothing today earns" reads like a statement — STILL OPEN

**(a) The question.** In OIL Earn, the day's "Nothing today earns" button looks like the app saying nobody earns, even
while a man plainly earns: should it become a real switch, a button whose words say what it does, or the design guide's
own on/off button?

**(b) Still open? Yes.** Sat 18 Jul (Fable on the SDO desk, 08:00–18:00, earning FO), OIL Earn on:
- The button reads "Nothing today earns" (149 × 23 px) in both states. Pressed, it fills amber; the words stay the same.
- Only its hover words change: "Nothing today earns — covers anything added later too" off, "Let this day earn again"
  on. On a phone there is no hover, so only the amber fill tells the two states apart.
- Pressed, the note under the bar reads "Nothing on this day earns OIL. The marks underneath are kept — turn it off and
  they come back." A tap on Fable then says "Nothing on this day earns. Turn off the switch first." (his D845 words).
  The app already calls it a switch; it is drawn as a button.
- On the phone the bar's row has 24 px to spare beside today's button (the test browser's letters).

**(c) Pictures** (each cut from the OIL Earn bar down to Fable's puck; in the off pictures his puck is tagged "Fable
earns OIL here: FO"; in each drawn "on" picture the note under the bar is ringed, its words new):
- `q-oilswitch-today-off-desk.png`, `-phone.png` — real, today, off: "A switch that reads like the day's state".
- `q-oilswitch-today-on-desk.png`, `-phone.png` — real, today, pressed: "Pressed: the same words, lit".
- `q-oilswitch-a-off-desk.png`, `-phone.png` — drawn A, off: "Drawn A: the app's own switch, off".
- `q-oilswitch-a-on-desk.png`, `-phone.png` — drawn A, on: "Drawn A: the switch on".
- `q-oilswitch-b-off-desk.png`, `-phone.png` — drawn B, at rest: "Drawn B: the button says what it does".
- `q-oilswitch-b-on-desk.png`, `-phone.png` — drawn B, pressed: "Drawn B: pressed, the words turn round".
- `q-oilswitch-b-on-phone-wide.png` — drawn B, pressed, every letter of the bar a seventh wider, as an iPhone draws
  them: "iPhone-wide letters: 27 px to spare".
- `q-oilswitch-c-off-desk.png`, `-phone.png` — drawn C, at rest: "Drawn C: the guide's on/off look, at rest".
- `q-oilswitch-c-on-desk.png`, `-phone.png` — drawn C, on: "Drawn C: on, the filter chip's cyan".

**(d) Options.** Each was measured on the phone's bar with the test browser's letters and again with an iPhone's (every
letter a seventh wider; lesson 59, D1387, and lesson 53: every state of a button fits the phone, its row one line). All
three fit, one row, in both states.
- **A — the app's own switch** (recommended). The Logic page's switch (a small slider and its words), 124 × 23 px,
  words **"No OIL earned"**. Off: the slider grey. On: the slider lit in the switch's own cyan. Hover: **"Anything added
  to this day later earns no OIL either."** The note under the bar when on: **"Nothing on this day earns OIL. Turn off
  the switch and each man earns as he did before."** A tap on a man while it is on keeps D845's words exactly ("Nothing
  on this day earns. Turn off the switch first."). Spare room on the phone: 40 px, 12 px with an iPhone's letters.
  Changes: the label and the note's words; D845 and D844 call it the "Nothing today earns" switch, a name to update;
  its lit look goes from the amber fill to the slider's cyan, which departs from the design guide's §4 twice: that line
  gives a new on/off control the filter chip's look (D882), and keeps OIL Earn's "on" looks as they are. Both are his
  call; the slider is used because its look shows off and on by itself, which is the very fault here (C shows the
  chip's look, so he can compare).
- **B — a button whose words say what it does, and turn round when pressed.** At rest: **"Stop OIL earning"**
  (127 px); pressed, lit amber as today: **"Earn OIL again"** (115 px). The note when on: **"Nothing on this day earns
  OIL. Press "Earn OIL again" and each man earns as he did before."** D845's "Turn off the switch first." no longer fits
  (there is no switch), so a tap on a man would say **"Nothing on this day earns. Press "Earn OIL again" first."**
  Spare room on the phone with an iPhone's letters: 13 px at rest, 27 px pressed. Changes D845 and D844 (his own
  wording) and the note's words. (The first pair drawn, "Stop OIL for this day" / "Let this day earn again", and the
  cold reader's "Let this day earn OIL again" did not fit his iPhone: measured with an iPhone's letters the row ran
  20 px and 32 px past the bar.)
- **C — the design guide's own on/off look** (§4, D882: the Leave War's Show SANS and Rearrange buttons wear it). The
  bar's button with the words **"No OIL earned"**, the same hover and note as A: plain grey at rest; on, the filter
  chip's pale cyan fill, cyan words and cyan edge. 112 px; 31 px to spare with an iPhone's letters. Changes: the label,
  the note, the lit colour (amber → cyan, §4's "OIL Earn's on looks stay" again his call); D845 and D844 as for A.

**(e) Recommendation: A.** A switch shows whether it is on by its look, so its words only have to say what on does (the
design guide's §1, and his lesson 66: the switch beside the words already shows whether it is on). His own refusal words,
the bar's note and the walkers' own reading all already call it a switch, so A makes the screen match the words. B
fixes the misreading with words that flip at every press, so its words must be kept in step in three more places (a
man's puck, an event's OIL mark, the ALL AVAIL window), and it changes his D845 wording. C is the guide's default, but at
rest it is a grey box of words, "No OIL earned", which reads as a statement in just the way the walkers misread today's
button (see `q-oilswitch-c-off-phone.png`). A's one cost is the colour (amber → cyan) when on, his to rule.

**(f) Worked example.** Sat 18 Jul, OIL Earn on: Fable on the SDO desk earns FO. Today the bar shows a button "Nothing
today earns" right above Fable's FO, as if the app contradicted itself. With A the bar shows a switch, off, "No OIL
earned", and Fable's FO stands. Switch it on: the switch lights, the note says "Nothing on this day earns OIL. Turn off
the switch and each man earns as he did before.", and a tap on Fable says "Nothing on this day earns. Turn off the
switch first."

**(g) For the build.** The button: `src/ui/oilmode.ts` `dayBarHTML` (line 547; the on-note at 553; `DAY_EARNS_NOTHING`
at 533); the press: `src/ui/board.ts` line 1119 (`data-oilblank` → `setOilBlanket`); its look:
`src/ui/scheduler/18-oil-board.css` lines 83–84 (the amber). The switch to copy: `.lgmix` in
`src/ui/scheduler/01-logic.css` (lines 67–71), its markup in `src/ui/LogicPage.tsx` (91–92), a checkbox with
`role="switch"`, so Space works by keys. C's look: `.fchip` / `.fchip.on` in `src/ui/scheduler/02-shell.css`
(288–290). Tests that press it: `src/ui/oilmode.test.tsx` (lines 172–188, 324–330); `src/ui/noteswords.test.ts` pins
`DAY_EARNS_NOTHING` (stays under A and C, changes under B). **What the drawing touched that the item did not name:** the
bar's heading capitals would turn the switch's words into capitals, so the drawing set the Logic page's own letters
(Inter Tight 12 px, ordinary case) and the build must too; the note under the bar changes words in every option; the
phone's bar has little room (24 px spare today), so any new words are measured with an iPhone's letters before they are
built.

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
ringed and tagged "No end time"):
- `q-inert-today-phone.png` — real, today: "Tapped: picked in blue; nothing says why".
- `q-inert-today-desk.png` — real, today: "Clicked: picked in blue; the reason only on hover: "Fable — no OIL worked
  out — this row has no end time"".
- `q-inert-a-phone.png`, `q-inert-a-desk.png` — drawn A, the note ringed: "Drawn A: a tap says why; nothing is
  picked" (the PC's: "a click says why in the passing note").
- `q-inert-b-phone.png`, `q-inert-b-desk.png` — drawn B, the note ringed: "Drawn B: the grey "Blocked:" note" (the
  PC's adds "the same words …; nothing is picked").

**(d) Options** (both: the tap picks nothing; the tap targets stay as they are, D26):
- **A — the app's passing note** (recommended): **"Nothing changed for Fable. No OIL worked out — this row has no end
  time."** First what the tap did, with the man as its subject; then D360's sentence, kept whole as he ruled it (the
  hover's words today, and the ALL AVAIL window's). The other reasons take the same shape, e.g. **"Nothing changed for
  Fable. This row gives him no working hours to count OIL from."** (in place of "nothing measurable to earn from here").
  Changes no ruling: it does what D31 asks and carries D65's rule from the ALL AVAIL window to the board.
- **B — the grey "Blocked:" note** (D1667, D1668): **"Blocked: nothing changed for Fable. No OIL worked out — this row
  has no end time."**, the grey note with the red no-entry sign. Changes no ruling's words, but D1667 is for a change
  refused, and this tap is not a change. The mode's own refusals ("Nothing on this day earns. Turn off the switch
  first.", "This event earns nobody any OIL. Turn the event back on first.") are plain notes today, so B makes the mode
  say things two ways unless they all go grey together.
- **The reader's catch on D360's words, for him to rule:** a cold reader took "No OIL worked out" two ways (no OIL could
  be counted, or he worked no OIL), and the design read flags its dash. The words are his (D360, "in substance"), so they
  are kept here. If he wants them changed, the plain form is "Fable earns no OIL here: this row has no end time.", and
  the hover and the ALL AVAIL window would change with it, so all three say one sentence.

**(e) Recommendation: A.** The tap is asking "why not him?", not trying a change, so the plain note answers it, in the
same look as the mode's other notes; it names the man as its subject, which matters on a row of several; it says first
that the tap changed nothing; and it ends with the sentence the PC already shows on hover. B would be right only if he
wants every refusal in the mode grey, which is a wider change.

**(f) Worked example.** Sat 18 Jul: the SDO desk has a start of 08:00 and no end time, Fable on it. In OIL Earn you tap
Fable on your phone. Today he lights blue and nothing says why; the reason shows only when a mouse rests on his puck on a
PC, so on your phone you never see it. With A, nothing is picked and the note at the foot says "Nothing changed for
Fable. No OIL worked out — this row has no end time."

**(g) For the build.** The inert puck is drawn in `src/ui/oilmode.ts` in three kinds, each with its reason only in its
hover title: line 713 (an ALL / ALL AVAIL puck: "the people behind it are switched in the window its count opens"),
715 (nothing to earn: `inertWhy`, line 678, whose plain reason "nothing measurable to earn from here" takes the new
words above, once the build has checked they are true of every case that reason covers) and 723 (a decision that cannot be changed here). Carry the reason in a data attribute, not the title. The
tap: `src/ui/board.ts`, the mode's own branch at about line 1422 (`[data-oilp]`, the earning pucks) — the inert ones
have no `data-oilp`, so today the tap falls through to the ordinary selection. Add a branch there: in the mode, a tap on
`.oilpk.inert` says "Nothing changed for <callsign>. <reason>" through the passing note and stops, picking nothing.
**What the drawing touched that the item did not name:** the selection also lights his name in the crew list (two
places, not one); the ALL / ALL AVAIL placeholder is an inert kind too, so check its count's own tap (which opens the
window) is not swallowed; the "no end time" tag hangs from a holder put round the box for the picture (a box to type
in carries no tag of its own), measured not to move it. A unit test: the tap says the reason and leaves nothing picked.

---

## The new words, before → after, and why (the cold read's numbers 1–9)

| # | Where | Before (first drawn) | After (drawn now) | Why |
|---|---|---|---|---|
| 1 | Q3 A and C: the label | "No OIL this day" | "No OIL earned" | "No OIL" read two ways (no OIL earned, or no OIL taken off); "earned" settles it. The reader's "No OIL earned this day" broke onto two lines on the phone's bar (A) and ran 2 px over with an iPhone's letters (C); the bar is the day's own, so "this day" goes. |
| 2 | Q3 A and C: the hover | "covers anything added later too" | "Anything added to this day later earns no OIL either." | No subject, and "added later" did not say later than what; now a sentence that stands alone. |
| 3 | Q3 B: at rest | "Stop OIL for this day" | "Stop OIL earning" | "Stop OIL" had the same two readings as 1; "earning" settles it. The reader's longer forms did not fit the phone (row 20 px over with an iPhone's letters). |
| 4 | Q3 B: pressed | "Let this day earn again" | "Earn OIL again" | "Earn" had no object and the pair was uneven; now both name OIL. "Let this day earn OIL again" ran 32 px past the phone's bar. |
| 5 | Q3 B: the note when on | "… The marks underneath are kept and come back when you let the day earn again." | "Nothing on this day earns OIL. Press "Earn OIL again" and each man earns as he did before." | "The marks underneath" said neither which marks nor under what; now it says what to press and what comes back. A and C's note takes the same shape: "Nothing on this day earns OIL. Turn off the switch and each man earns as he did before." (today's note joined with a dash and the same "marks underneath"). |
| 6 | Q3 B: tapping a man while on | "Nothing on this day earns. Let the day earn again first." | "Nothing on this day earns. Press "Earn OIL again" first." | It did not say where the way out was; now it names the button. Under A and C his D845 words stay ("Turn off the switch first."). |
| 7 | Q4 A: the passing note | "Fable: no OIL worked out — this row has no end time" | "Nothing changed for Fable. No OIL worked out — this row has no end time." | "Fable:" read as a speaker's name, and nothing said whether the tap did anything; now he is the subject and the first fact is that nothing changed. D360's sentence is his ruled wording, kept; the reader's catch on "worked out" is put to him in (d). |
| 8 | Q4 A: the other reason | "Fable: nothing measurable to earn from here" | "Nothing changed for Fable. This row gives him no working hours to count OIL from." | "Measurable" and "from here" were vague and gave nothing to act on; now it says what is missing. Not ruled words (the app's own), so reworded. Not pictured: the Saturday's puck is the no-end-time case. |
| 9 | Q4 B: the grey note | "Blocked: no OIL worked out — this row has no end time" | "Blocked: nothing changed for Fable. No OIL worked out — this row has no end time." | It dropped the man's name and did not say nothing changed, as the other grey notes do ("Nothing was saved."); both added. "Blocked" is his D1667 word, kept. |

Not reworded, from the design read's list: W1's verdict was "keep" for "No OIL this day", but the cold reader's catch (1)
was the sharper one, so the label changed; D845's refusal words stay as he ruled them.

---

## What could not be pictured, and why

1. **The iPhone's own keyboard and Safari's page pan** (question 1): a test browser cannot raise them. A 200 px stand-in
   block is drawn and said on each picture; the numbers (56 px today, 151 px drawn) assume the visible screen shrinks by
   200 px. His iPhone may pan the page instead, so the real look on his phone is unseen.
2. **Motion** (question 1): A's jump when the keys open, and B's title and day strip scrolling away, cannot be shown in
   a still. B is drawn at its end state: those parts hidden and the list scrolled 120 px.
3. **The browser's own hover box** (questions 3 and 4): the PC's hover words cannot be photographed. They were read from
   the page and written in (b) and on the tag of `q-inert-today-desk.png`.
4. **An iPhone's own letters** (question 3): the test browser has no Apple font. The bar was measured again with every
   letter a seventh wider, as the marks helper did; a real look on his iPhone settles it.
5. **Q4's other reason** ("This row gives him no working hours to count OIL from"): Saturday's puck is the no-end-time
   case, so those words are written, not drawn.

**For the host's skill log (this helper may not write under `.claude/`):** twice tonight a tag on a ringed part was cut
by a panel that hides what overflows it (the OIL Earn bar, and the flying wave's panel at 821 wide) and the script ran
clean. A check in the tag helper that each tag lies inside every clipping parent would catch it before the picture is
taken (the method file, `mockups-on-the-real-app.md`). A second, met 8 Nov 26: a box to type in (an input) draws no
`::before`, so a tag put on it shows nothing and the script still passes; the tag hangs from a same-size holder put round
it, measured not to move it. And new words for a crowded bar were drawn before they were measured with an iPhone's
letters: two of the cold reader's longer wordings did not fit. Measuring each new wording at the phone's width belongs
in the helper's own steps, not left to the reviewer.
