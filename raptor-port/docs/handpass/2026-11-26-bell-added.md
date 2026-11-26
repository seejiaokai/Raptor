# Evidence sheet — a person added to an input by someone else is told on his bell (chat 190, 26 Nov 26)

**What this is:** his ask of 26 Nov 26 — "check on the running app that a person added to an input by someone else is
told on their bell, every way of adding (schedule drop, Inputs page window, Leave War)" — the baseline before the
combined-row job ([COMBINED-INPUT-ROWS], D2770–D2780) adds new ways of adding. No code change: type R (a re-test).

## The eight answers and the tier
No change is made, so no tier gates a build; the walk is sized as a WALK of the bell across every door that adds a
person. If a fault is found, its fix gets its own tier (it would touch saved data — the bell's lines — so FULL).

## The scenarios — designed blind by Astra and a fresh Fable (D2443)
Brief: `../superpowers/briefs/2026-11-26-bell-added-scenarios-brief.md`. Fable's list (54) and Astra's (45) whole:
`parts/bell-added-1126/scenarios-fable.md`, `parts/bell-added-1126/scenarios-astra.md`. Combined by the host into the
three walkers' lists in `parts/bell-added-1126/walk-brief.md` (each case named by its source numbers, F<n> / A<n>).

## The roll-call — every door that adds a person to an input
| Door | Desktop | Phone | Walker | Result |
|---|---|---|---|---|
| Edit Schedule — drop on an input's Ground Programme row (empty place, a shared puck, the only puck) | | | A | |
| Scheduler Board — the same | | | A | |
| Tap-to-arm then tap the place (phone) | — | | A | |
| A man dragged from a seat onto an input | | | A | |
| A man moved from one input's row to another | | | A | |
| Unavailable row — a drop replacing a man (Other, Inputs-filed leave, Leave-War-approved leave, medical, shared) | | | A | |
| The input's own window opened from the schedule | | | A | |
| The Board's "+ Inputs" | | | A | |
| Inputs page — "+ Input" for one other, for several (list, a calendar day) | | | B | |
| Inputs page — an existing input's window, a person added (list, calendar bar, a day's card) | | | B | |
| A member filing a duty or commitment for others; a member filer adding later | | | B | |
| Personal, ALL AVAIL / ALL, medical, leave filed on the Inputs page, one replacing a pending bid | | | B | |
| SANS calendar — "+ Commitment" for a SANS man | | | B | |
| Leave War — leave entered on a man's row, Auto-approve on / off, a run, a half day | | | C | |
| Leave War — several people at once | | | C | |
| Leave War — OD, course, Other, Attach filed from the war | | | C | |
| Undo of an add, before and after the line is read | | | A, B, C | |
| A published day (the add waiting as an amendment) | | | A | |

## The five sizing lines (§7.0)
1. **Type:** R — a re-test of the bell across every door that adds a person, no change made; the doors are drawn and
   handled by separate code (the schedule's door, the Inputs window, the Leave War's own store), so each needs its own
   proof on screen (type D's question).
2. **What only a walk finds:** a door whose bell line is never written, or written twice, or written for the wrong man;
   the phone's tap route; what the added man actually SEES on his bell and what a tap on it opens. The unit tests
   (`src/ui/bellnotices.test.tsx` 47, `src/ui/bellnotices-scenarios.test.tsx` 45) drive the schedule's door and the
   Inputs window by code, not by a person's press, and none drives the Leave War's lines on screen.
3. **The ledger:** bell walks before — `lw-retype-bell-walk`, `onerule-mock-bell`, `rdl1108-bell-host` — each a single
   door; none covered every door at once.
4. **The walk chosen:** three Opus walkers at once (D787, D2256), each in its own browser world on the one served build,
   desktop 1536×864 and his iPhone's 402×874 (WebKit, touch, 3×): A the schedule (about 18 cases), B the Inputs page
   (about 16), C the Leave War (about 11). The host opens every deciding picture and reproduces every finding. Cases
   carried by a test instead are listed below with their test.
5. **After the walk:** a row in `../walk-ledger.md`.

## The orders walked
## Cases carried by a test
## Pictures
## Break tests
## Errors seen
## What was NOT walked, and why
- Each person's own choice of notifications (D2200) — not built; nothing to switch.
- Full editing on the Leave War (D1724) — not built.
- A man of another squadron (F48, A41, A42) — needs a second squadron and a master admin set up; this round keeps to
  one squadron; filed if the walk finds the doors otherwise sound.
## Gate counts
None — no code changed.
## What the walk found, and each disposition
