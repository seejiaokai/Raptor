# The design guide's "one mark, one look" — the draft (`[GUIDE-ONE-MARK]`, D866)

**His ruling (D866, 15 Oct 26 — "Questions 1-6 as recommend", his question 5):** the design guide carries "one mark, one
look" — the just-added mark is the plain blue ring with no glow, on the edge of the thing added — its wording drafted
and read by one reader before he approves it. It comes from his correction of 15 Oct (D860) and the answers that
followed it (D861), by D852's second step. **Nothing goes into `raptor-port/docs/design-practices.md` before his
approval** (D70; while the ChatGPT readers are out, one fresh blind Opus reader — D790, D810's precedent).

Where the mark is drawn today (read 15 Oct 26): the Scheduler Board (`raptor-port/src/ui/highlights.ts paintFreshAdds`,
only inside the board — Edit Schedule's week draws none), and the Inputs pages' own marks (the month's bar, the opened
day's card, the List's row). What the app does today, read before drafting (so the guide states it, and adds nothing he has not ruled):
`raptor-port/docs/ui-contracts.md` §"ONE MARK, ONE LOOK" — every just-added mark is the board's ring: inset, 2px, the
selection blue, no outer glow, about six seconds and its fade; a note on the Scheduler Board is ringed on its own box;
every other added row keeps its ring round the row; the desktop Inputs List draws one box round the whole row, its
coloured left edge inside; a month's bar that wears the ring shows no landing flash before it, while a bar that lands
WITHOUT it (a drag, an Undo) keeps its landing flash. Pinned by `raptor-port/src/ui/markring-css.test.ts`.

## The four changes, before → after (version 2 — the read's G1 to G7 taken)

### 1. §1 (feedback designed into the screen) — the mark's name
- **Before:** "wearing the app's one just-added mark (§4: the selection-blue box, about six seconds), as a row just added
  on the Scheduler Board does;"
- **After:** "wearing the app's one just-added mark (§4: the plain selection-blue ring for about six seconds, the same
  look everywhere), as a row just added on the Scheduler Board does;"
- *Why:* he calls it the ring (D860); "the same look everywhere" is the rule §4 now spells out.

### 2. §4 — the colour table's "Selection blue" row
- **Before:** "the puck he clicked (a fill, never a ring) — a clicked warning lights its crew in the WARNING's colours,
  never this blue; and the box round a thing just added, for about six seconds" · *Where from:* "the product
  invariants; owner, 14 Aug 26"
- **After:** "the puck he clicked (a fill, never a ring) — a clicked warning lights its crew in the WARNING's colours,
  never this blue; and the ring round a thing just added, for about six seconds, with no glow (below)" · *Where from:*
  "the product invariants; owner, 14 Aug 26; D860"

### 3. §4 — a new point under the table
- **After (new):** "**One mark, one look (owner D860, D861, D854, 15 Oct 26; carried here by D866).** The just-added mark
  looks the same wherever the app wears it: a thing just added, and on the Inputs pages an input just changed or put
  back by Undo (D854). Today that is the Scheduler Board, the Inputs calendar's month and its opened day, and the Inputs
  List. The mark is the plain selection-blue ring, 2px, with no glow, for about six seconds, its last half second a fade
  (steady and without the fade for a reader who asked for less motion, §5). It sits on the edge of the thing added, its
  own box, and leaves outside the controls its row carries for it (a grip, a number, a ✕): a note's own box, not the row
  it sits in; a table's row as one box round the whole row, never one per cell; a line, a row or a wave that IS the
  thing added, round itself; a new block, round its heading and each of its rows. A puck dropped in a seat wears none:
  the puck is the sign (D854). A thing wearing the mark shows no other flash of its own over it; a flash on something
  inside it, such as a puck dropped into a new line or its new flag, belongs to that thing. A new kind of mark is his to
  rule, never a variant of this one. (His words: the board's plain ring with no glow, on the Inputs pages too, and a
  note ringed on its own box, D860; the List's one box and the month's bar with no landing flash, D861; a changed input
  in view wears the mark, and a puck in a seat none, D854. That the ring leaves a row's controls outside, that a line,
  a row or a wave is ringed round itself, that any table's row is one box, that no thing wearing the mark shows another
  flash over it, and that a new kind of mark is his to rule, began as the agent's reading; he approved them as written
  here, D…)"
- **What is HIS and what is the agent's reading** — put to him as readings (the read's G1): (a) the ring leaves a row's
  grip, number and ✕ outside (D860's reading, said to him then); (b) a line, a row or a wave is ringed round itself
  (D860's reading); (c) ANY table's row is one box, where he ruled the desktop Inputs List (D861); (d) no thing wearing
  the mark shows another flash over it, where he ruled the month's bar (D861); (e) a new kind of mark is his to rule.
- **A block today (the read's G2):** the board rings a new block's heading and each of its rows separately — several
  boxes, not one round the block. Written as it is; one box round a block would be a new suggestion, with a picture.

### 4. §5 (motion) — the motion already in the app
- **Before:** "The motion already in the app that he asked for stays as measured — the box round a new thing and its fade,
  the picked-up look and landing flash of a drag, a new flag's flash, the board sliding up; a look does not report them."
- **After:** "The motion already in the app that he asked for stays as measured — the ring round a new thing and its fade
  (with no glow, §4), the picked-up look and landing flash of a drag (a month's bar wearing the ring shows no landing
  flash, §4), a new flag's flash, the board sliding up; a look does not report them."
- **Seen by the read, not run (G3):** on the Scheduler Board the ring follows a row's PLACE, so a row dragged into a
  just-added row's place within its six seconds may wear the ring and the landing flash at once. Older behaviour, not
  this draft's; to be checked on screen with `[GLOW-PLACES-LOOK]`'s pictures and filed if it shows.

## Not in this draft, on purpose
- **The other places that glow** — the landing flash after a drag or an Undo, the keyboard's focus ring (D842) — are
  `[GLOW-PLACES-LOOK]`: drawn for his look first, nothing changed before he answers (D866). If he takes the glow off
  them too, the guide's §5 gains a line then.
- **The short form in `.claude/rules/ui-design.md`** gains nothing: its point 2 already says a thing added shows "wearing
  the Scheduler Board's just-added mark", which this draft makes exact.

## The read
One fresh, blind Opus reader — brief `raptor-port/docs/superpowers/briefs/2026-10-15-guide-one-mark-read.md`; its findings
and what was done with each are written under this line before the wording goes to him.

**Read 15 Oct 26** (`raptor-port/docs/superpowers/briefs/2026-10-15-reads/guide-one-mark-opus.md`): NOT READY AS DRAFTED —
one must (G1, readings presented as his ruling) and six more (G2 a block's ring, G3 a flash claim only the bar guarantees,
G4 the mark also worn by a changed input, G5 no test for a kind not named, G6 the fade's timing and less motion, G7 a
dash). **All seven taken** in version 2 above; G3's board case filed for a check on screen.
