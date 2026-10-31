# Job 4 (31 Oct 26, the night) — the fresh, blind Opus code read of pull request 599 (to f416065b8)

Read-only; `src/ui/pinchzoom.test.ts` 27/27. Saved as it arrived (condensed).

**Checked and sound:** only the Leave War grid passes `floor` (its OIL tab, the Balances page, Quals and the board pass
none); the plain-number path's cut changed from `floor − dyp` to `floor − dy`, correct for a box in the page and
identical when the page does not scroll; the floor-top formula is the same arithmetic as the `pin` 'up' placement of the
date-row cells, so the floor follows the date row every frame, through a change of direction and at the zoom limits;
nothing measured per frame (D991); the lift resets the clip-path, `translate`, the `alsoTL` transforms and `q-pinching`,
a touchcancel or unmount the same; Ctrl+scroll unaffected (the names copy is the phone's only; Quals has no `wheel`);
the memo firewall untouched; Quals' paint order right (corner th z 4 over name cells z 3).

1. **Medium-low — `QualsPage.tsx` ~741–760 (the mirror's `pin`); pre-existing in `Matrix.tsx` ~1961–1980 since D1288.**
   Part-way down, a pinch out scrolls the page up with the pinch; the page-scroll handler unpins the frozen heading row
   mid-gesture; if the fingers turn back to a pinch in, the page scrolls down and the frozen row re-pins while the table
   is still stretched — the new copy is not in `also`/`alsoTL` (read once at the start) and has no `q-pinching`, so it is
   drawn at rest over a stretched, shifted table until the lift; and its column widths come from
   `getBoundingClientRect().width` of stretched cells (k times too wide), re-measured only by a zoom change at the lift —
   a pinch ending at its starting zoom leaves them wrong. No walk scenario or test turns a pinch's direction. Fix: a
   pinching ref set in `onStart`, cleared in `onEnd`; while set, `pin()` may unpin but never pins anew; `onEnd` calls
   `pin(true)` once; measure `cols` from layout (`offsetWidth × qzEffRef.current`) so a stretched cell is never stored.
   Same in Matrix.
2. **Low, a test gap — `pinchzoom.test.ts` ~258–302.** Changing `live.floorTop + S` to `live.floorTop` (pinchzoom.ts
   ~265) leaves both new unit tests green: in jsdom the floor row's top equals the target's top. The branch only wins
   with the row below a held box (the Leave War's month buttons, a pinch out part-way down), where the break would draw
   the floor (k−1)×(the buttons' height) too high. Fix: a case with `scrollPage`, a `keep` box 40 tall above a floor row
   `{top: 40, foot: 80}`, a pinch out, the cut expected at `40 + S + k·40`.

**Tidiness note (filed, not fixed):** (1) no new responsibility in a busy file; (2) `floorTop`/NaN switches `stretch()`
for the Leave War alone and repeats `pin`'s 'up' arithmetic — a floor named as "the foot of pinned cell X" would let one
formula serve both; (3) Quals' `pin`/`pinAt` near-copy Matrix's — a shared "pinned table" builder could carry both; file
with `[QUALS-PINCH-NOSDA-HEAD]`.

Verdict: the fixes do what the items ask on every pinch surface, nothing else broken; the direction-change gap (1) wants
a fix and a test before "merge live".

## The narrow read of fix rounds 2 and 3 (f416065b8..452653e0d) — the same reader, saved as it arrived (condensed)

1. The frozen row through every gesture — no fault: started at the top or with the grid's own date row in sight, no
   frozen row is ever added (the own row is held from rising); frozen at the start then a pinch out, it is hidden while
   the own row is in sight and shows again, stretched, when turned back in — never two, never none; the hide reads the
   drawn top of the own row's first cell, the resting pin's own test; the Leave War hides the element its lift un-hides;
   the lift un-hides, measures at rest, re-measures if the zoom changed; touchcancel, a third finger and unmount end
   through the same lift.
2. Per frame (D991): not new — one more box read on page-scroll events while the fingers are down, no forced layout.
3. Memo firewall untouched.
4. Tests: the held-box unit cases and the turned-pinch browser tests catch the first-round faults. **Low, a test gap:**
   if the hide were broken (the frozen row never hidden) every test would likely still pass (worked out, not run) — the
   turned tests read only at the end of the turn. Fix: in both turned tests also read at the turn (fingers 80 apart) and
   assert no second row and that a heading or date row is drawn.

Verdict: both rounds sound; one test gap; nothing blocks the merge.
