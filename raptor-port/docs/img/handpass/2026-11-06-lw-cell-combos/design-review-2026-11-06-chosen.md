---
target: chosen Leave War day-cell design (D + K1)
total_score: 20
max_score: 32
na_heuristics: 3,9
p0_count: 0
p1_count: 2
timestamp: 2026-11-06T10-08-00Z
slug: ort-docs-mock-2026-11-06-lw-cell-combos-index-html
---
Method: dual-agent (A: design review · B: detector + measurements)

Target: the chosen Leave War day-cell design — option D (D1726, D1727) with the posting-out look K1 (D1728, D1729).

Health 20/32 (heuristics 3 and 9 n/a): status 2, real world 3, consistency 2, error prevention 3, recognition 2, efficiency 3, minimalist 3, help 2. Earlier set 18/32.

Strengths: geometry carries whole/half at every zoom; posting-out days lost their word clutter; a whole day beside a half keeps the cell.

Priority issues:
1. P1 — a gone day's entry on a dark box (LL, CCL, course, medical) looks present: the faint stripes measure 1.15-1.39 contrast against the fill (1.03 on an outlined box); only the cell hatch shows through. Fix keeping D1729: fade the box to half on a gone day (drawn: sheet-posting-out-fade.png) — his choice.
2. P1 — "!" beside two turned codes cuts the right box: 96 at zoom 1.4, 96 on desktop, 864 in wide letters (FO*, OML, OTH, ATCH, TRG, MTG). Fix in the build: the turned boxes step down under the "!" so it has its own corner; re-measure.
3. P2 — letters touch the ring (turned ATCH/OTH/OML/CSE, whole ATCH, LL under HO): the measure counts ink inside the box, not clear of its ring. Fix: a stricter check (ink at least 0.5px clear of the ring) and a size step where it fails.
4. P2 — the yellow last-day line meets a box's edge (LL's tan ring, the next day's cyan). Fix: a 1-2px dark gap before the line.
5. P2 — the stack of cards may read as a shadow and hides the count; idea: the back card in the hidden entry's colour — his to rule.

Detector: MatrixRows.tsx clean (styles live in CSS, not scanned); options page 2 false positives (measuring font, em-dashes). Browser overlay skipped: no dev server for this target.
