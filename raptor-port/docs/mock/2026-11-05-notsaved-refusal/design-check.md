---
target: the not-saved refusal look
total_score: 17
max_score: 28
na_heuristics: 5,7,10
p0_count: 0
p1_count: 2
timestamp: 2026-11-05T07-40-28Z
slug: t-docs-mock-2026-11-05-notsaved-refusal-index-html
---
Method: dual-agent (A: design review · B: detector and measurements)

Target: the proposed one look for the "not saved" refusals (D1665), drawn 5 Nov 26 — https://claude.ai/artifact/5iK5a5aEMJuP9WXpEkqYhS

## Scores (0-4; 5, 7, 10 n/a for a passing message) — 17/28
1 visibility 3 · 2 match to real world 2 · 3 control 2 · 4 consistency 2 · 6 recognition 3 · 8 minimalist 3 · 9 recovery 2

## Verdict
Specific to this app, built from its own parts; reads apart from the band by colour, sign and no button; one face for tag and note.
Detector (degraded, regex only — parser packages not installed): no finding on the element itself; flat-type-hierarchy (page wrapper / single message — false positive),
thin-border-wide-shadow (the app's existing note shadow, not introduced). Contrast: lead 10.4:1, rest 9.5:1, sign and edge 7.0:1 — all pass.
Sign 14x14, centred on the first line (0-1px); a wrapped second line starts under the text.

## Priority issues
- P1 The bold lead "Not saved" is the band's own words in the band's place: the words say "the app can't save" before the colour says "only this change". Fix: a different lead for a refusal, his to rule.
- P1 Red already means "kept, but it clashes" (the red passing note after a drop; the day's red issues bar). A red box now also means "thrown away". Fix: the grey note surface with only the sign in red, or the sign alone carrying the meaning.
- P2 With the dash not drawn the lines read as run-ons ("Not saved that change was refused"). Fix: a colon after the lead (writing guide §1b).
- P2 The Leave War's bare "Not saved" gives no reason; the document message is a storage failure, not a refusal, and gives no remedy. Fix: the tag takes the check's reason; decide where the document message belongs.
- P3 The wider tag covers the next row's grade ▾ (R1, PC). Fix: hold its right edge to the box's column.

## Personas
Scheduler at a desk: a red note at the screen foot, far from his drop, read as the usual clash note — the dropped change missed.
Member on an iPhone: a bare "Not saved" with no reason or next step; the document note sits over the window's top corner for 7-8 s.

## Minor
The red ⊘ sits near the red "CX" (cancelled) language. A passing note is announced politely to a screen reader while the tag is urgent.
