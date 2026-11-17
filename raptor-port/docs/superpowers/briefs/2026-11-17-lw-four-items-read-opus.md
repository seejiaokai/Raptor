# The fresh, blind Opus read of the four Leave War items — its report, condensed by the host (17 Nov 26, chat 101)

**Head:** a fresh Opus reader (a helper of chat 101, which did not write the code), brief
`2026-11-17-lw-four-items-read-brief.md`, on an exported copy of `01f1030c4` without `HANDOFF.md`, `docs/handpass/` or
`docs/img/`; it read no other reader's report; no handoff block reached it; nothing run (no packages in the copy); about
10 minutes. Its proof tests were kept in the host's scratch folder and three were moved into `e2e/leavewar.spec.ts`.
The full report is in chat 101's transcript; this is the host's condensed copy — findings and negatives kept, wording cut.

## Findings, by consequence

- **R1 (medium):** phone Balances — the pinned name cells (`.bp-who`) and the heading's first cell shrink to their words
  under option B's `justify-self: start`, so slid boxes show beside the names, ragged row by row; D1518. Fix: those
  cells `justify-self: stretch`. The drawing's slid picture has the same shrink.
- **R2 (medium-low):** phone Balances — CCL's cell carries the `.sep` rule (1px + 6px) in a 54px column, so its box runs
  2px into FCL's and its tag covers ~14px of FCL's corner. Fix: CCL's column 61px; delete the dead older column list.
- **R3 (low-medium):** phone Balances — a tapped box near the right edge leaves its corner tag cut: the reveal
  (`showCell`) measures `.bp-oc`, which no longer holds the out-of-flow tag. Fix: measure the tag's right edge too.
- **R4 (low; a look for him):** desktop grid — on a day inside a joined leave block the ring sits under the block, so only
  its top and bottom lines show; on his own row nothing changes. The drawing and the test hovered empty days only. A ring
  on filled days (a `::after` over the cell) is a new mark — draw it for him first (D1625).

## Explicit negatives

- **D2155:** the save still sends amount, reason, given-by and half; a whole amount drops the half; the date is never
  changed (D260); Delete still two presses; the hidden AM / PM copies cannot be pressed, focused or read aloud; a refusal
  sits on its own line. The correction editor keeps the old layout (outside D2155). *For him (D852):* the grid's day
  sheet award editor still moves its Save when the amount changes.
- **D2158:** every door uses the one New-period window; the name follows one tap (one month), two taps (a range), a
  backwards pick; a typed name is kept; an emptied or spaces-only box follows again; the saved name is the shown one,
  trimmed; two periods in one month both read "JAN 27", as ruled. The schedule's whole-year "2027" is outside D2158.
- **D2156, desktop:** every heading starts at its column's box or figure; LVE and OTHER LEAVE span 4 and 5 columns;
  tags without a minus, under the pinned headings, presses passing through; read-only figures keep the box's width; Days
  taken unchanged. The person window keeps "−1" (outside the ruling; a candidate).
- **D2157:** hover-capable devices only; a man's day cells only; off while selecting; never over a picked day, the move's
  landing, the just-added ring or Rearrange's landing; his own row's lines kept; the row tint untouched.

## Tidiness (filed, not fixed)

The old phone column list (removed with R2's fix); `.bp-oc`'s overridden widths and stale comment; the desktop OIL cell's
stale comment ("set right"); `.bp-table.bal .w-war { nowrap }` never applies; the two hover rules repeat one long
selector (a custom property on `tr.me` would make one); the short class names `.bp-kb`, `.bp-pdt`, `.oil-delb`; the
tag's `aria-label` on a plain span may not be read aloud.
