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

## The four changes, before → after

### 1. §1 (feedback designed into the screen) — the mark's name
- **Before:** "wearing the app's one just-added mark (§4: the selection-blue box, about six seconds), as a row just added
  on the Scheduler Board does;"
- **After:** "wearing the app's one just-added mark (§4: the plain selection-blue ring, about six seconds — one look
  everywhere), as a row just added on the Scheduler Board does;"
- *Why:* he calls it the ring (D860), and "one look everywhere" is the rule §4 now spells out.

### 2. §4 — the colour table's "Selection blue" row
- **Before:** "the puck he clicked (a fill, never a ring) — a clicked warning lights its crew in the WARNING's colours,
  never this blue; and the box round a thing just added, for about six seconds" · *Where from:* "the product
  invariants; owner, 14 Aug 26"
- **After:** "the puck he clicked (a fill, never a ring) — a clicked warning lights its crew in the WARNING's colours,
  never this blue; and the ring round a thing just added, for about six seconds, with no glow (below)" · *Where from:*
  "the product invariants; owner, 14 Aug 26; D860"

### 3. §4 — a new point under the table
- **After (new):** "**One mark, one look (owner D860, D861, 15 Oct 26; carried here by D866).** The just-added mark looks
  the same wherever the app marks a thing just added — today the Scheduler Board, the Inputs calendar's month and its
  opened day, the Inputs List: the plain selection-blue ring, 2px, with no glow, for about six seconds and then its fade. It
  sits on the edge of the thing added: a note's own box, not the row it sits in; a table's row as one box round the
  whole row, never one per cell; a row, a wave or a block that IS the thing added, round itself. A thing wearing it
  shows no other flash with it. A new kind of mark is a ruling of his, never a variant of this one."
- *Why each clause:* the look and "no glow" — D860; "on the edge of the thing added", the note's own box — D860; the row
  as one box — D861 (2); no other flash with it — D861 (1); a new kind of mark is his — D860 made one look of two, so a
  variant drifting back in is what the rule exists to stop (the agent's reading, said to him).

### 4. §5 (motion) — the motion already in the app
- **Before:** "The motion already in the app that he asked for stays as measured — the box round a new thing and its fade,
  the picked-up look and landing flash of a drag, a new flag's flash, the board sliding up; a look does not report them."
- **After:** "The motion already in the app that he asked for stays as measured — the ring round a new thing and its fade
  (with no glow, §4), the picked-up look and landing flash of a drag (never with the ring on the same thing, §4), a new
  flag's flash, the board sliding up; a look does not report them."

## Not in this draft, on purpose
- **The other places that glow** — the landing flash after a drag or an Undo, the keyboard's focus ring (D842) — are
  `[GLOW-PLACES-LOOK]`: drawn for his look first, nothing changed before he answers (D866). If he takes the glow off
  them too, the guide's §5 gains a line then.
- **The short form in `.claude/rules/ui-design.md`** gains nothing: its point 2 already says a thing added shows "wearing
  the Scheduler Board's just-added mark", which this draft makes exact.

## The read
One fresh, blind Opus reader — brief `raptor-port/docs/superpowers/briefs/2026-10-15-guide-one-mark-read.md`; its findings
and what was done with each are written under this line before the wording goes to him.
