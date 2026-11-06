---
target: Leave War day-cell options
total_score: 18
max_score: 32
na_heuristics: 3,10
p0_count: 0
p1_count: 2
timestamp: 2026-11-06T06-31-47Z
slug: ort-docs-mock-2026-11-06-lw-cell-combos-index-html
---
Method: dual-agent (A: design review · B: detector + browser)

Target: the Leave War day-cell options page (docs/mock/2026-11-06-lw-cell-combos/index.html) and the candidate designs A (one above the other), B (colour edge), Flags, Words kept, colours-only.

Health of the first recommended set (A + Flags + colours-only): 18/32 (heuristics 3 and 10 n/a-ish; user control n/a). Lowest: consistency 1 (same meaning, two looks — empty vs boxed last day / gone day), error diagnosis 1 (the "!" alarm shrunk to a 7px triangle).

Priority issues:
- [P1] A drew a whole day as a half on every two-entry day (cases 3, 5, 6) — the owner's own D1160 complaint; ~17,000 of 23,940 combinations hold a whole-day entry beside another. Fixed in C: floor-and-roof (a whole day keeps the cell, the half sits on it) and a split tile for two whole days.
- [P1] Flags demoted the only mark that asks an admin to act ("!") to a 7px triangle the colour of LL / OL (#F2C879 = the LL edge). Fixed in C: the "!" tab kept, with a dark keyline.
- [P2] Grey top flag ("more") vs grey bottom flag ("posted out") told apart only by corner; the bottom flag redundant over the hatch. Fixed in C: a stack of cards for "more"; the box itself carries the hatch on a gone day.
- [P2] An empty last day kept "PO" while a boxed one got a line. Fixed in C: the yellow line on every last day.
- [P3] Page: the live-check button 36px tall (raised to 44); grey text passes AA; no overflow, no errors.

Detector: degraded static mode (parser modules missing) — 2 advisories (Inter Tight in the measuring lab — false positive; em-dashes). In-page: 43 (cyan accent text — the app's own accent; em-dashes; line length on desktop).

Measured after the redraw: C — 0 combinations cut or covered at the iPhone size (his PC's letters and wider ones), 1 on the desktop (OML on a crowded last day); a few more only in letters wider than any desktop draws.

Questions put to him: 1 two entries — C or A; 2 marks — C or Flags; 3 zoomed right out — colours only with the "!" kept.
