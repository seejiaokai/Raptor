# [STANDBY-FLIES] — the design of record (19 Oct 26)

A standby line (SC, AVALON, BB) that flies counts as a real flight. His rulings: D1042–D1046 (what counts, when, how),
and his four answers to the drawing of the Flies tick, D1060–D1063 ("Yes as recommended", 19 Oct 26). The red team this
was hardened by: `raptor-port/docs/superpowers/plans/2026-10-19-standby-flies-redteam.md`. The pictures he answered:
`raptor-port/docs/img/handpass/2026-10-19-standby-flies/mock/` (`flies-look.html`, drawn by
`raptor-port/scripts/handpass/look-standby-flies.mjs`).

## What flies

- **A shift (formation) of SC, AVALON or BB with its B or R typed flies whole** — every MAIN and SPARE row on it
  (D1044, D1045). That is not a stored mark: it is read from the typed times, so clearing them takes it back.
- **A row ticked by hand flies on its own (D1061)** — one row, never the whole shift; the rest of the shift stays
  standby. The hand tick is the row's own stored mark (`fly`), and a second tap takes it off. On a shift with B or R typed
  the tick is lit and cannot be taken off: a row that does not come in is cancelled with its own CX (D1046).
- **A cancelled shift or row never flies** (D1045, D1046) — the engine's cancel rule already skips it.
- **A row with nobody seated does not count as a jet (D1062)** — an SC AM with R typed and both SPARE rows empty reads
  2 jets, not 4. Ordinary flying lines with nobody on them still count (D1009 is unchanged).

## What a flying row gets (D1042, D1045)

- the day's flying count (the day heading) and Insights' sorties and flying load;
- OIL by default on a weekend or holiday, from the earliest of the shift's R, B and START to its END (OIL Earn can still
  switch it off);
- every warning a flying line gets that needs no take-off: crew rest, the long day, clashes with his other events,
  availability, currency, seats, work hours — its day running from the earliest of R, B and START to END, with no
  debrief or other padding added (D1045);
- no brief or debrief window (it has no take-off — the agent's call, told to him with the drawing);
- a BB shift that flies with no START or END raises an amber line in the warning list, as its crew rest and OIL need
  those times (the agent's call, told to him).

## The chip (D1060, D1063)

- Beside each MAIN / SPARE badge on a standby row, on the Scheduler Board and the week, phone and desktop: a lit
  "✓ FLIES" where the row flies, a dashed "FLIES" where it does not, as drawn (D1060).
- Edit Schedule and the board: the dashed chip is a button that ticks the row by hand; the lit one on a hand-ticked row
  takes it off; the lit one on a shift with B or R typed is not a button — its title says to CX the row instead.
- View-only Sched, a member, the next-week peek: only the lit chip, read only; no dashed chip (D1063).
- Duty desks never carry it.

## Published days

A hand tick or its removal is a change like any other: on a published day it waits for the next amendment, and OIL moves
when that is published (D592, D606, D45).

## Rulings it changes (D201)

- **D1041** ("on an SC SPARE, AVALON or BB line … shown, printed and exported only") — narrowed by D1044–D1045: a typed
  R there now makes the shift fly. Its homes are rewritten in this job: the rally design note, `engine-rules.md`,
  `ui-contracts.md`, the Logic page's standby line and the tests that pinned "shown only".
- **D516** (standby duties are not flying load), **D24 / D15** (SC SPARE, AVALON and BB earn nothing by default) —
  narrowed for a row that flies.
