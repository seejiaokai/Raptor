# Bug check — an ALL / ALL AVAIL input drawn on the Common Programme (17 Oct 26)

Branch `claude/allavail-common` (cut from pull request 522's tip). Rulings D954, D955 (his four answers), D957 (the Reject
line), built unattended in the build chat by his word (D956). Order: `docs/bug-check-order.md`.

## Questions waiting for him
**ANSWERED 17 Oct 26 (D958): "Yes. Short word Common is fine" — built.** Re-walked on a fresh build (`…/2026-10-17-allavail-common/rewalk-d958/`, 5 PASS, 0 FAIL, no errors): the ✕ note reads "Common item removed — back under Personal Inputs — …", the button "→ Common", the phone banner "Planning Common · MEETING"; tests in `ui/allavail-common.test.tsx`, `ui/reqdoor.test.tsx` restated (58 / 58). **Q1 — the words that still say "Ground" for such a row** (the scenario designer's 5; narrowed by the walk, J8): the
phone's banner while a place waits for a puck ("Planning Ground · MEETING" — j8-5), the board's note after ✕ ("Ground item
removed — back under Personal Inputs" — j8-2), and Personal Inputs' "→ Ground" button for an Other filed for ALL AVAIL,
which lands it on the Common Programme (j8-3, j8-4). The changes window does not say it (j8-1). **Recommended: yes — each names the Common Programme where the row is drawn there.** Waits on it: those four words
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
pass, desktop 1440 + phone 390, pictures. 5. **After:** its row in `docs/walk-ledger.md` (written).

## 4. The walk
One Sonnet 5.5 walker (D787), script `scripts/handpass/allavail-common-walk.mjs` (assertions), the built app at gate run 2
(served on 4186), desktop 1440 by mouse, phone 390 by touch (real touch for the drag). **58 PASS, 0 FAIL; console errors,
page errors, 4xx: none.** Pictures `docs/img/handpass/2026-10-17-allavail-common/build/` (~60). The host opened
j3-1-board-prog-phone390 (both ALL AVAIL meetings on the Common Programme between 11:30 and 13:30, no grip of their own, the
Reject line, the typed words in the box). Walked: filing for ALL AVAIL in the window (J1); the week and View-only Sched,
the row's place by time, the line, the tint, the phone shape (J2); the board, no grip, a drag of the programme's own rows
past it — one landing line, never on it (J3); ALL AVAIL out → the Ground Programme, back → the Common Programme, Undo each
way (J4); a retimed start saved, a remark saved, Reject and Accept (J5); OIL Earn on a Saturday (J6); a published day — no
pending from the move, the issued face (J7); the peek (J9). **Notes:** a retimed row takes its new time place at the next
drawing of the screen, not at once — the Ground Programme's own rows behave the same (J5-6), as built; the changes window
never says "Ground" for it (J8-1 — Q1 narrowed to three words).

## 5. Cases carried by a test
`ui/allavail-common.test.tsx`: the rule; the order; the week (edit and View-only); taken off and put back; the ⓘ count; a
published day nothing pending; the board (edit, no grip, the line; read-only, no line); the peek.

## 6. Gates
| Run | unit | build | tfin | e2e | smoke | rulecheck | docsize |
|---|---|---|---|---|---|---|---|
| 1 (`8664052d4`) | **FAIL 46** — four test files that find the ALL AVAIL row in the Ground Programme's section (the scenario designer's 1; re-expressed) | PASS | PASS | PASS | PASS | PASS | PASS |
| 2 (`4f828217d`, with the designer's fixes) | **PASS 11573 / 11573 (651 files)** | PASS | PASS (728 / 0) | PASS (827 passed) | PASS | PASS | PASS |

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

**The fresh, blind Opus read of the finished code (this sheet in its hands):** the three moved row builders compared line by
line with their old loop bodies — nothing changed but the Common Programme's gate and `return`. One finding: (1) LOW — a
retime of such a row on a published day added "Order changed · ground items" to what waits, though nothing moved on the
Ground Programme (the published compare counted the Ground Programme's order with the rows drawn elsewhere). Proved by
the reader's own throwaway test. **Fixed**: the rule moved into the engine (`engine/grouprows.ts onCommon`, re-exported by
`ui/html.ts`), and both order comparisons (`engine/drafts.ts`, `engine/canonical.ts`) leave such rows out. A test in
`ui/allavail-common.test.tsx` holds the result (no "order changed"); it did NOT fail before the fix in this chat's setup —
the reader's probe was the red. Every test file of the published compare run (39 files, 1144 / 1144), tfin 728 / 0.
Absences checked and found fine: every roll-call row (§2). Tidiness, filed: the phone rule that lets a date wrap has no
`.ah-row` twin (the walk passed); `progOf` restates the rule (to point at the engine's next time it is touched); a public
Ground Programme note with no rows now shows on View-only, where Duties' does not. The read was the last round.
