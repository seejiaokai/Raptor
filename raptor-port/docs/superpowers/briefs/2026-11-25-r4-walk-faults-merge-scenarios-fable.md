<!-- A fresh, blind Fable helper, 25 Nov 26 — the other of the two blind scenario designers of the merge round (chat 183); read the same exported copy of 0ff30dbdf and the same brief; its report, whole -->

# Scenario design — where the Board's section-by-section writing meets one man's row of a shared leave (a fresh, blind Fable designer, 25 Nov 26)

Read: the brief, both diffs, `engine/rowinput.ts`, `ui/SchedBoard.tsx` (the paint), `ui/dayswap.ts`, `ui/board.ts`
(`boardChange`, the sections), `ui/board-html.ts` (the rows), `ui/textedit.ts` (the caret, the pressed button),
`ui/schedule-tab.ts`, `ui/inputedit.tsx` (`saveFromRow`, `reassignInput`), the two walks' scenario lists (headings and
Fable's two in full, so as not to repeat them). Nothing run. No handoff block was pasted into my context; no compaction.

Fixture for all, made through the Inputs page's own window: a leave (LL) 08:00–17:00 on a weekday for **Ranger + Hex**
(Ranger named first; three men where said: + Outlaw). "No-blur press" = a press that leaves the caret in its box — an iPhone tap does it by
itself; the test browsers take the caret out, so press the way the shared-row walk's B5 (b) did and CHECK
`document.activeElement` is still the box, or say the scenario could not be made.

## 1. What qualifies, and where its sign should be

| Thing where the two meet | Where the visible sign is |
|---|---|
| A row's address after the Unavailable section is rewritten UNDER the caret (new: it now happens when the caret only visits another section, not only on leaving the Board): one man's own input reads the bare id, no name after it | Unavailable rows; then every door on them — the three boxes, the puck, the label, Reject, LATE |
| The same man drawn in a section A writes at once and in the held one | Available crew, his puck on a flying line, the warning list and count, Personal Inputs (open, or its folded count), beside his held row |
| An input that changes section (Reject → Personal Inputs) while its row is held | one input on two rows at once until the caret leaves |
| The Tab route leaving the Unavailable section — onto the previous section's box, or off the day's last box onto a button | where the caret / keyboard focus is after the key |
| An armed puck's ring across an under-caret rewrite | the ring on his row, the arm strip, the crew drawer |
| Undo / Redo with the caret on the Board | every row above, at once; the held row later |
| OIL Earn with the caret on the Board (nothing written, as before) | his row still drawn editable in the mode |

## 2. Scenarios, ranked by likely failure

### X1 — Undo under the caret after a visit to another section: a row with a bare address (phone, WebKit matters; RANK 1)
- Phone 402×874 touch, WebKit; scheduler `ad`/`a`. Board on the fixture's day; the Ground Programme has a row.
- Presses, a picture after each: (1) Ranger's End `1000`, Tab. (2) Tap a Ground Programme remark box, type nothing
  (the Unavailable section is redrawn now — the r4 walk's B3). (3) Tap **Hex's** Start box, type nothing. (4) No-blur
  press of top-bar **Undo**. (5) Type `0900`, Tab; tap blank space. Inputs page.
- EXPECTED: after (4) one leave, both men, 08:00–17:00 (pinned). After (5) **Hex alone** reads 09:00 on an input of
  his own and Ranger keeps 08:00 (D737, D739; the own-part promise "never the others'"; `rowinput.ts` "an Undo that
  puts him back in the shared input is followed by itself") — or a refusal in words.
- Disproof: ONE leave, both men, 09:00 — Ranger's row, Available crew and the Inputs page all moved by a time typed on
  Hex's row. (Read: Hex's redrawn row carries the bare id; after Undo that input holds two again and the box names no
  man, so the save is the whole input's.)
- (b) The same with step (3) in **Ranger's** Start: after Undo type `0900`, Tab. EXPECTED: it reaches Ranger's part,
  or is refused in words and the box put back (board.ts: "a refused value must never be left on screen looking
  saved"). Disproof: nothing saved, nothing said, `09:00` left in the box (`[SHARED-ROW-HELD-LEFTOVERS]` (1) calls
  this rare; here it is four presses).
- (c) After (4), tap Hex's puck, then Outlaw in the crew drawer. EXPECTED: "Outlaw … instead of **Hex**". Disproof:
  "instead of Ranger" (the bare address falls back to the input's lead man). RECORD the note's words.
- (d) Three men: cut Ranger, then Hex, visit the Ground box, caret into Outlaw's row, Undo once, type. Same test.
- RECORD the week's twin (its blocks were always written one by one — the route may be on `main` today).

### X2 — Tab off the day's last box on his held row that carries Reject (desktop; then phone WebKit's keyboard Tab)
- Desktop 1440×900 Chromium; scheduler. Setup: an **overseas duty** for Hex + Ranger (second pass: a commitment for
  both, moved to Unavailable), Ranger the LAST row of Unavailable, Unavailable the last section, no other Unavailable
  input below.
- Presses: Ranger's Start `0900`, Tab; End `1100`, Tab; Remark `own`, **Tab**. Read `document.activeElement`. Press Tab
  once more.
- EXPECTED: the remark is saved on Ranger's own duty; the focus is on **Ranger's Reject** — the same button drawn again
  (D553, D555, D597; `schedule-tab.ts` "the button looked up again on the day as now drawn") — or stays in the box.
- Disproof: the focus is on the page body (the button is looked up by its marks, and the cut changed them: the id, the
  man's name gone); the next Tab starts from the top of the page. Run once with the first change being the Remark
  itself, and once on a one-man duty as the control.

### X3 — The caret hops between sections mid-flow, three men (desktop Chromium, then phone WebKit)
- Fixture of three (rows Ranger, Hex, Outlaw); Hex seated on a flying line that the leave overlaps; scheduler.
- Presses: Hex's Start `0900`, and WITHOUT Tab click a Ground Programme remark box. Picture at once and after 1s.
  Click Hex's End, `1100`, click the Ground box again. Outlaw's Remark `C`, click an Overall notes line. Click blank.
- EXPECTED at every picture: ONE click puts the caret in the box clicked, the same box, not moved (r4 promise;
  D551–D555); the Unavailable rows read what is saved the moment the caret is in the other section, in the order
  Ranger, Hex, Outlaw (shared-row promise; D735 — nothing re-orders itself); Hex's other time box agrees; Available
  crew, the ring on Hex's flying puck and the warning count agree with the Inputs page at once (D509). At the end:
  Ranger alone on the first leave, Hex 09:00–11:00 on his own, Outlaw's own with "C" — three records.
- Disproof: a click that lands on nothing or needs a second; a row out of place in any picture; a fourth record or a
  time on another man's; Available crew one change behind.

### X4 — Reject on his held row: one input on two rows at once (phone, WebKit matters)
- Phone WebKit; scheduler. Overseas duty for Ranger + Hex; Personal Inputs OPEN (second pass: folded).
- Presses: Ranger's End `1000`, tap his Remark box. No-blur press **Reject on Ranger's row**. Picture; measure the
  Remark box's top before and after. Type `x` in the still-standing Remark box, no-blur press Reject on it AGAIN, tap
  blank.
- EXPECTED: Ranger's own duty appears under Personal Inputs at once (or the count rises), Hex's row and duty untouched
  (both promises); the box he is in moves ≤1px (`holdingPlace`). His old row may stand until the caret leaves —
  RECORD how it reads. `x` is saved on Ranger's own duty and shows on its Personal Inputs line at once; the second
  Reject changes nothing of Hex's — RECORD its words. Caret gone: one line for Ranger, one row for Hex.
- Disproof: Hex's duty moved or re-timed; Ranger drawn nowhere or twice after the caret leaves; the box jumps.
- Variant: Unavailable dragged ABOVE Ground Programme, caret in a Ground box, no-blur Reject on Ranger's (fresh) row:
  the list above the caret loses a row — the box must not move.

### X5 — Shift+Tab out of the first Unavailable box with his first change, and Tab back in (desktop)
- Ranger the FIRST Unavailable row; the Ground Programme has rows; Personal Inputs folded. Scheduler.
- Presses: Ranger's Start `0900`, **Shift+Tab** (caret lands in the Ground Programme's last box). Picture. Tab. Tab.
  Type `1100` in his End, Tab.
- EXPECTED: the caret is in a box after every key (D551–D555); Unavailable is redrawn while the caret is in Ground;
  Tab back lands on Ranger's Start reading 09:00, then his End reading HIS end; 11:00 is saved on the SAME own leave —
  two records in all.
- Disproof: the caret on nothing; a box on arrival reading Hex's time; a third record.

### X6 — His puck armed on the held row, the caret then moved to another section, then a name (phone WebKit)
- Presses: Ranger's End `1000`, tap his Remark box; tap his puck (ring); tap a Ground Programme remark box; picture;
  tap Outlaw in the crew drawer.
- EXPECTED: RECORD whether tapping the box puts the arm down. If it stands: the ring is on Ranger's redrawn row
  (`rowKeyNow`), and Outlaw takes Ranger's place on Ranger's own leave; Hex untouched; Available crew agrees at once.
- Disproof: the ring on Hex's row or on none while the strip says armed; Hex replaced; the arm dropped with no words.

### X7 — Undo / Redo with the caret parked in another section (phone WebKit; desktop for record)
- Presses: cut Ranger (End `1000`, Tab); tap a Ground remark box; no-blur Undo, Redo, Undo; tap Ranger's Start, `0900`,
  Tab; no-blur Redo (should be greyed or do nothing).
- EXPECTED: at each press the Unavailable rows read the stored state at once, Ranger above Hex each time (D148; the
  r4 promise); the last change cuts Ranger afresh — two records, never three.
- Disproof: a row out of place after Redo; a stray third leave; Hex's time moved.

### X8 — A time typed and NOT left, then Reject on the same row (phone no-blur; desktop mouse)
- Overseas duty, Ranger + Hex, no change yet. Type `0900` in Ranger's Start, do not leave it.
- (a) No-blur Reject on Ranger's row, then tap blank. RECORD exactly: what moved to Personal Inputs, and whose time
  became 09:00. Sourced part: nothing of Hex's changes silently by a box on Ranger's row (D45, D737).
- (b) Desktop mouse: click Reject on Ranger's row once. EXPECTED: one press does its job on HIS duty
  (`[EDIT-BUTTON-AFTER-CHANGE]`). Disproof: the press does nothing and a second is needed (the button redrawn under the
  press carries another id), or it acts on Hex's.

### X9 — OIL Earn switched on with the caret in his row (phone WebKit; low, RECORD)
- Overseas duty with OIL Yes, Ranger + Hex, a weekend day. Caret in Ranger's End; no-blur "OIL Earn"; type `1000`, Tab.
- EXPECTED: RECORD. Sourced part: the mode is read-only for a typed time (`board-html.ts`, fix 5) — nobody's OIL
  figure moves by it. Disproof: Ranger cut out and a figure changed from inside the mode.

### X10 — The long word on his row (phone 402 and 320, Chromium and WebKit; low)
- After a cut, type 60 letters with no space in Ranger's End, Tab into the next section's box.
- EXPECTED: the note stays inside its border where `main` now places it; the box heals to HIS end; Unavailable is
  redrawn with his row in place. Disproof: the note over its border or under the keyboard; Hex's time in the box.

## 3. Negatives — checked, no fault expected

- **Common Programme, SANS Avail:** an ALL AVAIL input is never filed under Unavailable; SANS draws cards, not rows.
- **The warning list, sign-off strip, crew drawer:** panels of their own, written under the caret before either change.
- **The day or week stepped, Escape, with the caret in his box:** plain boxes are left first; each door reads
  `rowInputOf` (M2–M4, pinned).
- **The "other time box" set by hand:** scoped to the row's own panel; A compares parsed strings, never live nodes.
- **Row order in an under-caret rewrite:** the one function (`unavailFaces`) the whole write uses.
- **A fresh row that still names its man:** the input holding him wins; the remembered pointer is never asked.
- **The input's window from his row:** it takes the focus, so the whole Board is written (the phone tap: Fable S1).
- **A Ground row's index after "→ Unavail" with the caret in Ground:** the r4 list's B9 class.
- **Member, guest:** no boxes or buttons on the Board for them.
- **The history bubble on a rewritten row:** taken down with its row; its story is filed (`[SHARED-ROW-HELD-LEFTOVERS]` 2).
