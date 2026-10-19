# [STANDBY-FLIES] — behaviour register (19 Oct 26)

One plain line per ruling, each named by a test (`scripts/rulecheck.mjs` SF1–SF10). The rulings: D1042–D1046 (what counts
and when), D1060–D1065 (his answers to the drawing). The design note: `2026-10-19-standby-flies-design.md`.

| Id | The behaviour | Pinned by |
|---|---|---|
| SF1 | D1044, D1045: a standby shift (SC, AVALON, BB) with its B or R typed flies whole — every MAIN and SPARE row on it; read from the typed times, so clearing them takes it back | `engine/standbyflies.test.ts`, `ui/standbyflies.test.tsx` |
| SF2 | D1061: a row ticked "Flies" by hand flies alone, never its shift; a second tap takes the tick off | `engine/standbyflies.test.ts`, `ui/standbyflies.test.tsx` |
| SF3 | D1045, D1046: a cancelled shift or row never flies; a row of a typed shift is taken out by its own CX — no untick, and its chip is no button | `engine/standbyflies.test.ts`, `ui/standbyflies.test.tsx` |
| SF4 | D1045: a flying row is checked as an SC MAIN is — crew rest, the long day, clashes, availability with no standby carve-outs, SC currency once — its day from the earliest of R, B and START to its END, nothing added; a row standing by beside it keeps the standby look only | `engine/standbyflies.test.ts`, `engine/scintime.test.ts`, `engine/scpickerrest.test.ts`, `engine/scrole-rules.test.ts` |
| SF5 | D1045, D1062: a flying row counts as a jet in the day's badge and a sortie in Insights; a row with nobody seated does not (his case: R typed, both SPARE rows empty — 2 jets, not 4) | `engine/standbyflies.test.ts` |
| SF6 | D1042: a flying row earns OIL by default, from the earliest of R, B and START to its END; a row standing by is off by default on its written window, as before (D24) | `engine/standbyflies.test.ts`, `engine/oilscintime.test.ts`, `engine/scrally.test.ts` |
| SF7 | D1060, D1063, D1064: a lit "✓ FLIES" beside MAIN / SPARE on a row that flies, on the board, Edit Schedule's week, View-only Sched and the next-week peek; the dashed "FLIES" — the button that ticks a row by hand — on the Scheduler Board only | `ui/standbyflies.test.tsx` |
| SF8 | D1065: a faint grey dash in a standby line's empty R and B on the board — a placeholder, never a value | `ui/scboard.test.tsx` |
| SF9 | (the agent's call, told with the drawing) a standby shift that flies with no START or END raises an advisory naming the line, anchored on its START box | `engine/standbyflies.test.ts` |
| SF10 | D45: a hand tick on a published day is a change like any other — pending, and it rides the next amendment | `ui/standbyflies.test.tsx` |
