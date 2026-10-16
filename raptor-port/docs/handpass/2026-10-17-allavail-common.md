# Bug check — an ALL / ALL AVAIL input drawn on the Common Programme (17 Oct 26)

Branch `claude/allavail-common` (cut from pull request 522's tip). Rulings D954, D955 (his four answers), D957 (the Reject
line), built unattended in the build chat by his word (D956). Order: `docs/bug-check-order.md`.

## Questions waiting for him
**Q1 — the words that still say "Ground" for such a row** (the scenario designer's 5): the changes window's title of the
row ("Ground · MEETING"), the phone's banner while a place waits for a puck ("Ground · …"), the board's note after ✕
("Ground item removed — back under Personal Inputs"), and Personal Inputs' "→ Ground" button for an Other filed for ALL
AVAIL. **Recommended: yes — each names the Common Programme where the row is drawn there.** Waits on it: those four words
only (pictures with the walk). Everything else is built.

## 1. The eight answers and the tier
1 money (OIL) — NO change by design: the row keeps its OIL (the same record; the board's row builder draws its OIL switches
wherever it stands) — **walked in OIL Earn**. 2 the published record — **YES**: where a published day's row is DRAWN (the
issued face, View-only Sched); nothing it prints or counts changes. 3 saved data — NO: nothing stored changes. 4 a shared
drawer — **YES**: the Ground Programme's row builders moved into one function each, called from two sections. 5 a new gesture
— NO (none; a grip taken away there). 6 a new surface — NO (a row in an existing list). 7 roles — NO (the row's own gates).
8 the warning list — NO (the same record; the checks read `d.ground`). **Tier: FULL** (2).

## 2. The roll-call — every place the app draws a Ground Programme row or the Common Programme
| Place | Draws such a row on the Common Programme? | How |
|---|---|---|
| Edit Schedule's week | has it, `.ah-row`, with the Reject line | `html.ts` `commonOrder` + `grRowHTML` |
| View-only Sched / the issued face | has it, no Reject line | the same builder, read-only |
| The board, editing | has it, no grip, the Reject line | `board-html.ts sbProgPanel` + `sbGrRowHTML(…, true)` |
| The board, read-only / a look at a version | has it, no line | the same, `ro` |
| The board in OIL Earn | has it, its OIL switches | `sbGrRowHTML`'s own OIL path |
| The next-week peek | has it | `peek.ts peekGrRow` |
| The ⓘ panel | counts it as squadron-wide | `dayInfoHTML` |
| The Ground Programme (week, board, peek) | must not draw it; its line counts only what it draws | `onCommon` filter |
| The changes window's jump to the row | finds it by its key, wherever drawn | the `gr:` key is kept |
| The pending list / history / bell | must not change: the record is the same | untouched |
| Print / CSV export | must not: they list flying lines only | untouched |
| The Inputs pages | must not: the input is unchanged | untouched |

## 3. Sizing the walk (§7.0)
1. **Type:** a drawing change of a shared row across two sections and four surfaces. 2. **Only a walk finds:** the row's look
in the `.ah-row` grid at phone width (the week's two row shapes differ), the board row without a grip among rows with one,
drags of the Common Programme's own rows around it, OIL Earn on the board, ALL AVAIL dropped on / taken off a row moving it
live. 3. **The ledger:** layout walks of shared rows have found phone faults. 4. **Chosen:** one Sonnet walker, one scripted
pass, desktop 1440 + phone 390, pictures. 5. **After:** its row in `docs/walk-ledger.md`.

## 4. The walk
(to come)

## 5. Cases carried by a test
`ui/allavail-common.test.tsx`: the rule; the order; the week (edit and View-only); taken off and put back; the ⓘ count; a
published day nothing pending; the board (edit, no grip, the line; read-only, no line); the peek.

## 6. Gates
(to come)

## 7. The model reads
**The scenario designer (a fresh Opus reader, asked what is MISSING), and what became of each:** (1) four test files found
the ALL AVAIL row in the Ground Programme's section (46 tests) — **re-expressed** to find it in either programme, nothing
they check weakened; (2) a day whose only Ground Programme row moved lost its public note on View-only Sched — **fixed**
(the section stands for its note), test; (3) the week's row lost the "came from an input" tint there — **fixed** (CSS), and
the phone rule that keeps a shared row's two times together — **fixed** for `.ah-row`; test; (4) "+ Inputs" said "added
to the Ground Programme" for an ALL AVAIL input — **fixed** (it names the programme it lands on, the window's hint too);
(5) other words that say "Ground" — **parked for him** (Q1); (6), (8), (9), (10) — walked; (7) the board's Sort note on the
Ground Programme — true as it is (the hand order is cleared), left. Its own slip, said by it: it ran the whole unit suite
while the first gate run held the lock (no data written) — that run's unit failures were the 46 above, reproduced alone.

**The fresh, blind Opus read of the finished code:** (to come)
