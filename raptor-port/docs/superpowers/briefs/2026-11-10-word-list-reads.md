# Astra's read of the word list — 2680d4f31 (read-only; saved word for word). The fresh Opus reader's read (REVISE, 7 findings: ALL works like ALL AVAIL; Not on the flying programme counts no absences; Archive, Delete, Restore rows; two wrong dates; Remarks' doc) was taken in full beside it; both applied 10 Nov 26 (chat 49), the code names checked to exist first — Astra's `MatrixRows.tsx` left out (only a test has it).

REVISE

1. **Line 72, “B”:** Incorrectly calls every B a brief and implies every blank gets a suggestion. Replace the meaning with:  
   “The brief time on a flying formation, suggested when blank. On SC it is the crew’s in-time. Standby lines have no suggested brief.”  
   Replace the code cell with: `Formation.br`, `flightBrief`, `scReport`.

2. **Line 163, moved-leave mark:** `cellring.ts` draws a temporary navigation highlight, not the lasting moved mark. Replace the code cell with: `MatrixRows.tsx`, `shiftedFrom`, `moveRecords`.

3. **Line 241, “Not on the flying programme”:** The calculation checks roster membership and sortie counts, not availability; someone on leave can appear. Replace the meaning with:  
   “Lists aircrew from the week’s applicable rosters who have no counted flying sortie; this does not establish their availability.”

Checked more than 30 rows across every section. The guide row matches D491 and the backlog brief; no safeguard removed. No files changed.

Rulings: none this session.