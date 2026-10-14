# The design guide's two drag rules — the draft wording (D894, 15 Oct 26)

**His word (D894):** *"This is also part of design skill that u should incorporate. The 2 things I flagged out. The
rearrange and drag outside screen. Note it"* — after his two finds on the Leave War's Rearrange that evening: two landing
lines a few pixels apart for one drop (D890, D891), and a row carried to the screen's edge that did not scroll (D892,
D893). Backlog: `[GUIDE-DRAG-RULES]`. A working-guide change (D852, D70): this wording is read by one fresh reader, then
put to him; it goes into `raptor-port/docs/design-practices.md` only on his approval.

**Where it goes:** `design-practices.md` §6 "Small polish — check for these", as two bullets after "A touch target a
finger can hit". §6 is the list a look checks against; both rules are things a look must try by hand (a drag), and the
existing touch-target bullet is the third rule his finds of that evening touched (a counter's grip, harder to take than a
man's — `[LW-COUNTER-GRIP-REACH]`).

## Version 1

- **One drop, one landing line** (D890, D891). Anything carried to a new place — a row, a puck, a heading, a column, a
  note — shows where it will land with ONE line, in ONE place. The lower half of one row and the upper half of the row
  under it are the same drop, so they draw the same line, on the top edge of the row under; only below the last row of a
  list is a line drawn on a row's foot. Two lines a few pixels apart for one drop make him ask which is which. A look
  drags slowly across every gap to check it.
- **Carried to the edge, the view follows** (D892, D893). Anything carried by a drag scrolls what it sits in when it is
  held near that box's edge — the page, a window's list, a table that runs sideways — at the app's own edge distance and
  speed (the Leave War's drag selection and the Scheduler's drags already do), so a thing can be carried to a place out
  of view. A look carries one thing to a place off the screen, on a phone and on a desktop.

## The read (one fresh Opus reader, blind to this chat, 15 Oct 26)

Seven findings, all taken: (1) bullet 1 lost D890's second case — the line also stays on a row's bottom edge above a
heading the row cannot land on; "foot" → "bottom edge", his ruling's word. (2) Bullet 1 wrongly covered a drop ONTO a
place (a puck onto a seat, a chip onto a day, Quals' heading onto a column) — those mark one place; the rule is for a
thing moved into a LIST. (3) "The app's own edge distance and speed" is not one setting — the app has four (the
Scheduler's row drag, its puck drag by finger, the Leave War's drag selection by mouse and by finger) — so: "a distance
and speed the app already uses, never new numbers". (4) Which way it scrolls was missing: the way the thing can move —
a row up and down, a column sideways. (5) §5 Motion's "off for a reader who asked for less motion" could switch it off
and strand a drag — it stays on (the reader's reading, said to him as such). (6) Drags already built that fall short are
named to him, not changed (D852) — e.g. the Inputs month calendar's bar drag, the Tracker's ball drag. (7) Not "small
polish" — both of his finds stop or mislead the work: a short section of their own, §5a "Dragging", after §5 Motion.

## Version 2 — what is put to him

**§5a. Dragging** *(his finds of 15 Oct 26 on the Leave War's Rearrange — D890–D894)*

- **One drop, one landing line.** Anything dragged into a new place in a list — a row, a heading, a note — shows where it
  will land with ONE line, in ONE place. The lower half of one row and the upper half of the row under it are the same
  drop, so they draw the same line, on the top edge of the row under; only under the last row of a list, or above a
  heading the row cannot land on, is the line drawn on a row's bottom edge. Two lines a few pixels apart for one drop
  make him ask which is which. A thing dropped ONTO a place — a puck onto a seat, a chip onto a day, a Quals heading onto
  the column whose place it takes — marks that one place, once. A look drags slowly across every gap to check it.
- **Carried to the edge, the view follows.** Anything carried by a drag scrolls what it sits in when it is held near
  that box's edge — the page, a window's list, a table that runs sideways — in the direction the thing can move (a row
  up and down, a column sideways), at an edge distance and speed the app already uses, never new numbers, so it can be
  carried to a place out of view. It stays on for a reader who asked for less motion: it is the drag itself, not an
  effect. A look carries one thing to a place off the screen, on a phone and on a desktop.
- A drag already built that does otherwise is named to him, not changed (D852).
