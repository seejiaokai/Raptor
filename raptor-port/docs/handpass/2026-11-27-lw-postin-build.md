# Bug check — the posted-in man's leave balance ([LW-POSTIN-BALANCE]), chat 208, 27 Nov 26

Branch `claude/lw-postin-build-5d49de`, pull request 857 (draft). His rulings built: D2747 (leave before his post-in date never
deducted), D2746 ("Not typed"), D2749 and D2812 (the one line), D2810 ("Official bal"); D2745 kept as is (nothing to build).
Pictures: `docs/img/handpass/2026-11-27-lw-postin-build/`.

## The eight answers and the tier
1. Money — YES: the leave balance is a figure a man relies on (what he is owed in days), and D2747 changes what comes off it.
2. The published record — NO: nothing published, signed or amended is read or written; the balance lives on the Leave War only.
3. Saved data — YES: the history line a balance save writes changes ("→ 24" with no "from" for a first figure); the saved
   balance row itself is unchanged in shape.
4. A shared drawer — YES: the figure box (`FigBox`) is drawn by the Balances page, the person window and the Grades window.
5. A new gesture or mode — NO new control; a box's empty state and a refusal are new looks of an existing box.
6. A new surface — NO.
7. Roles — the line shows by who may type (admin / member unlocked) — reads the existing rule (`balanceProblem`), changes
   none — NO change to who may do what; checked on the walk all the same.
8. The warning list — NO (the below-zero question is a sheet's question, not the warning list; it is walked).
**Tier: FULL** (1, 3).

## The rulings swept (the app's words), pass or fail on the running build
(to fill during the walk)

## The roll-call
| Surface | SHOWS (Official bal / the line / Not typed / D2747 figure) | USABLE (type, save, refuse) | PAINTED there besides |
|---|---|---|---|
| Person window, desktop, admin | | | |
| Person window, phone 402, admin | | | |
| Person window, member own, unlocked | | | |
| Person window, member own, locked | | | |
| Person window, member, another man's | | | |
| Balances page, desktop, admin | | | |
| Balances page, phone 402, admin | | | |
| Balances page, member unlocked / locked | | | |
| Balances page, Days taken view | | | |
| Grid figure beside the name | | | |
| My leave | | | |
| Approvals' LVE BAL | | | |
| One-day bid window: leave buttons' "left", below-zero question | | | |
| Drag window: below-zero question | | | |
| Change history line of a typed figure; Undo / Redo | | | |
| Grades window (shares the figure box) | | | |

## The five sizing lines (§7.0)
(to fill)

## Scenarios (Astra and a fresh, blind Opus in Fable's seat — D2443, D2819)
(to fill)

## Orders walked
(to fill)

## The cases carried by a test
| Case | Test | What it proves |
|---|---|---|
| His example both orders (post-in Mon 7 Dec, leave Wed 2 Dec, 24 typed → 24) | `src/leavewar/engine/leaveyear.test.ts` "D2747 — …" | the figure, either order |
| A bid before the post-in date never pending | same | Pending 0, War bal 24 |
| A half day before / after | same | 24 / 23.5 |
| A leave across the date | same | only its days from the date (21), "3 taken" |
| A gap before the current stint; an earlier stint | same | not deducted / deducted |
| A day after a posting out | same | still deducted (D1541) |
| A post-in date moved before a typed snapshot | same | still 24 |
| Never typed, typed 0, an old opening | `leaveyear.test.ts` "D2746 — …" | `notTyped` |
| The below-zero question waits | `src/leavewar/ui/belowzero.test.ts` | `goesBelow` false when not typed |
| Person window: label, line by role and lock, Not typed, 0 saves, carried forward refused | `src/leavewar/ui/personwindow.test.tsx` "[LW-POSTIN-BALANCE] …" | the window |
| Balances page: heading (two lines on a phone), the line once, Not typed, a figure saves, member's dash | `src/leavewar/ui/balances.test.tsx` "[LW-POSTIN-BALANCE] …" | the page |
| A first figure's history line | `src/leavewar/m5a-readers.test.ts` | "LVE balance →" with no "from" |

## Pictures
(to fill)

## Break tests
(to fill)

## Errors seen
(to fill)

## What was NOT walked, and why
(to fill)

## Gate counts
(to fill)

## The code reads
(to fill)

## What the walk found, and each disposition
(to fill)
