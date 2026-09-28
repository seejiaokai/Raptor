# Evidence — the Tracker leftovers (28 Sep 26)

Branch `claude/tracker-leftovers-f79d36` (preview 4175, `E2E_PORT=4192`, rulings D370–D379 — his instruction of 28 Sep
26; parallel with `claude/change-recording-retest`, `claude/docs-tidy-subheads-audit-ec8f87` and
`claude/small-fixes-batch-d223f6`, coordinated by message, D302). Items: `[TRK-RETEST-NOTES]`, `[TRK-EDIT-SIDEWAYS]`,
`[TRK-SESSION-PICK]`, `[TRK-DLG-LEFTOVERS]`, `[TRK-BAKE-STALE]`. Plan (with the red team's changes, §6):
`docs/superpowers/plans/2026-09-28-tracker-leftovers-plan.md`. Pictures: `docs/img/handpass/2026-09-28-trk-leftovers/`
(`baseline/` before the fixes, `mock/` his choices, `walk/` after). Step logs: `docs/handpass/parts/trk-leftovers/`.

## 1. The eight questions and the tier

| # | Question | Answer, with the reason |
|---|---|---|
| 1 | Money / owed | NO — the Tracker holds course progress; no OIL, leave or manning |
| 2 | Published record | NO — nothing in the Tracker is published or signed |
| 3 | Saved data | **YES** — each person's remembered course and student; what a date box saves while typed; the order a student's failures are stored in; the pace and lull periods now in the undo history |
| 4 | A shared drawer | **YES** — the ball (`ballGroup`, every event on every chart); the question box (every question in the Tracker) |
| 5 | A new gesture or mode | **YES** — a press on a failure tick; the folded tools and Tools ▾ |
| 6 | A new surface | **YES** — the folded tool row on a short screen |
| 7 | Roles | NO — the Tracker reads no role (D121); the per-person pick is about who, not what they may do |
| 8 | The warning list | NO |

**Tier: FULL** (question 3). **The server question (D202): NO** — no rule about who may do what, what anyone is owed,
an official record or personal details; `perms.ts` and `data-model.md` §11 untouched.

## 2. Rulings that apply (the rules sweep) — and how each is honoured

| Ruling | What it asks | Where it is pinned / walked |
|---|---|---|
| **D370** (28 Sep 26, "1 yes") | an N.A. event's failures leave the Failures card, its total and the full list; kept, back when graded | `leftovers.test.tsx` "D370 …"; walk B |
| **D371** ("2 yes") | failures by DAY; − takes back the latest day | "D371 …" (2 tests); smoke's three failure checks updated; walk B |
| **D372** ("3 a") | a pace, end-date or lull change is an undo step; Copy to… is one | "D372 …" (4 tests); walk B |
| **D373** ("6 fold") | on a short screen the edit tools fold behind one row; Tools ▾ opens the set over the chart | "D373 …"; `trk-lo-10-fold.mjs`; walk C |
| **D374** ("4 yes") | a day after today refused in Done on, Failed on, both Last Flown; Upchit and end dates take any day | "C8 + D374 …" (4 tests); walk B |
| **D375** ("5 keep") | a students import's new course joins at the bottom | as built; `known-gaps.md` |
| **D376** ("7 own place") | each person reopens on their own course and student | "D376 …" (6 tests); smoke's reopen block; walk A |
| D120, D56 | the export → wipe → import route; nothing built around stored demo data | old unprefixed pick keys and older file formats left (plan §5) |
| D121 | the same Tracker for everyone | walk C (member) |
| D123, R50 (narrowed by D374) | Last Flown the latest day flown; a hand-typed day stands until a later flight — any day up to today | the four older date tests updated to days before today |
| D126, R26 | details per chart; his chart loop (bake) | bake test + `trk-lo-12-bake.mjs` |
| D129 | logout asks about unsaved chart edits | unchanged; the resume waits while an edit is unsaved |
| D190/D191 | the + Add dialog never loses a typed name; OK adds a search matching nobody | older tests green; C11 keeps the pick by id |
| R42/R43/R46/R52/R53/R54/R109/R110/R114/R115 (register) | failures, dates, lulls, pace, undo, popups, repeated taps | pointers added to the register rows D370–D374 changed |
| Standing: a click-open popup closes on a click outside | the Tools ▾ set | "D373 …" test (a press outside) and the fold walk |

No clash between rulings found beyond the narrowings recorded (D374 narrows R50; D371 settles R42/R43's reading).

## 3. The roll-calls

*(filled in below as the walk reports — every row YES / NO-because / MISSING)*
