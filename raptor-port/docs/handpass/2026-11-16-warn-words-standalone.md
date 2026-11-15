# Evidence sheet — [WARN-WORDS-STANDALONE], the night of 16 Nov 26 (chat 83's builder)

Every warning reads on its own (owner D2045, D2048, D2058, D2068–D2071), the assumed landing (D2046, D2047, D2053) and a
standby shift with no END left out of crew rest (D2055). Branch `claude/warn-words-standalone`. Laid down before the
build (the checklist's step 4); the walk, the reads and the fixes fill it in the second stage.
Pictures: `docs/img/handpass/2026-11-16-warn-words-standalone/`.

## The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money — what a man is owed (OIL), or who counts as present | YES — the assumed landing moves OIL's worked times for a flight with no landing typed (D2046, D2053) |
| 2 | The published record | YES — a published day's frozen warnings carry the old words; the new Logic setting is one a published day keeps (D2005) |
| 3 | Saved data | YES — a new saved Logic setting (the flight length); a conflict's hide key |
| 4 | A shared drawer | YES — the warning sentences are drawn by the issues list, the board, the ALL AVAIL window, the crew-rest trace, the peek |
| 5 | A new gesture or mode | NO — no new control; the Logic page gains one setting row of an existing kind |
| 6 | A new surface | NO — the pending list gains a line inside an existing row |
| 7 | Roles | NO — no permission changes; the Logic row is an admin's as its neighbours are |
| 8 | The warning list | YES — every warning's words, and how the landing is read |

**Tier: FULL** (YES to 1, 2, 3 and 8).

## The rulings that apply

Swept from `.claude/rules/decisions/scheduler.md`, `oil.md` and the full rows; each to be checked against the running
build in the walk, pass or fail.

| Ruling | What it says, in short | Pinned by | Walk |
|---|---|---|---|
| D2045, D2048 | Every warning reads on its own: who, which items, their times, why; an assumed time called "assumed" | warnwords.test.ts (every family) | |
| D2050 | The double-turn line keeps its one-line count — left as it is | warnwords.test.ts "D2050" (pinned before the change, passed before and after) | |
| D2058 | A conflict between a flight and an item shows the step or dekit end that causes it | warnwords.test.ts "Ranger's Friday" | |
| D2059, D2060 | Step to dekit is a man's busy time; two flights back to back stay the amber tight turn | warnwords.test.ts "D2060" (pinned before) | |
| D2061–D2065 | A standby line has no step or dekit added | warnwords.test.ts "D2061–D2065" (pinned before) | |
| D2068 | "Tight turning" keeps its name | warnwords.test.ts short names | |
| D2069 | The crew-rest line keeps his order with "needs 12h" | warnwords.test.ts crew rest | |
| D2070 | "Conflict:", not "Clash:"; the check keeps "Conflict" as its short name | warnwords.test.ts | |
| D2067, D2071 | The Logic note is one sentence | logic.test.tsx | |
| D2054 | The pending list says what moved and whether OIL changed, inside the man's row | oilworkstart.test.tsx "D2054" (OWS13; seen red: the empty line list with the note taken out) | |
| D2001, D2018 | A conflict's hide follows its two items; a request against flying still told apart by its words | warnwords.test.ts "hide" | |
| D2005, D2044, D2013 | A published day keeps the settings it went out under | (piece B) | |
| D2046, D2047, D1990, D2010, D2022 | A flight with no landing typed is assumed to land the Logic flight length after take-off | (piece B) | |
| D1936, D2053 | Insights' hours and the long day count to the assumed landing | (piece B) | |
| D2055 | A standby shift with START and no END is left out of crew rest until END is typed | (piece C) | |
| D56 | Demo data is not a finding | — | |

## The roll-call — every place a warning's words show

Columns: does it SHOW the new words · is the gesture USABLE (tap, hide, jump) · what else is PAINTED there. Each cell
YES / NO-because / MISSING, filled in the walk.

| Surface | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| The warning list (Edit Schedule's issues list, desktop and phone) | | | | |
| The Scheduler Board's issues list | | | | |
| The ALL AVAIL window's reason under a puck | | | | |
| The previous day's crew-rest mark ("Breaks Tuesday" row) | | | | |
| The next-week preview (peek) — the same-time line's box title and its hide | | | | |
| The foot-of-screen note (a tapped warning) | | | | |
| The pucks' own notes (the flag's hover / tap words) | | | | |
| Insights' "Conflicts by type" (the short names) | | | | |
| View-only Sched's list (and a published day's frozen face) | | | | |
| The Logic page — the checks' names, the note under the changed-settings strip, the new setting's row | | | | |
| Print and export | | | | |
| The pending list (a Logic change on a published day's OIL) | | | | |

## The five sizing lines (§7.0)

(written at the walk's sizing step)

## The orders walked

## The cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| Every family of line, on a small made-up week | `engine/warnwords.test.ts` | each line asserted whole; red against the old words before the change |
| The demo week's 33 lines | `engine/warnwords.test.ts` "the seed week, every line" | the parity test's positive half — the old dump differed on every line but the double-turn count |
| The left-as-it-is pins (D2050, D2060, D2061–D2065, D2068) | `engine/warnwords.test.ts` | passed before and after the change |
| A time range is one span | `engine/warnwords.test.ts` "escMsg" | the no-wrap span, escaping first |
| Every "Conflict:" line on a phone | `e2e/warnhide.spec.ts` (its last block) | 8 conflict lines and 24 time ranges measured at 390 wide on Edit Schedule: each conflict two rows at most, each range one line |
| The pending list's OIL line (D2054) | `ui/oilworkstart.test.tsx` "D2054" ×2 | the line inside the man's row, each case's words |
| The Logic note (D2067) | `ui/logic.test.tsx` | the pending sentence is gone |

## The pictures

## The break tests

## Errors seen

## What was NOT walked, and why

## The gate counts

## What the walk found, and each disposition

## Notes for the walk, from the build

- Hides stored before this change: a hide of a conflict between two schedule items keyed on its two items (D2001) since
  12 Nov 26, so those stay hidden. Every other hidden warning is keyed on its words, so a hide stored before the
  rewording comes back once, the line shown again with its new words. Demo data only (D56) — not a finding; new hides
  work going forward.
- A published day's frozen warnings carry the words they went out with; once the new words are live a published day
  whose frozen list differs reads its warnings as changed until its next amendment. Demo data only (D56).
