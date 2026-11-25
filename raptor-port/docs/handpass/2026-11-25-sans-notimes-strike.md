# Bug check — a SANS man struck on a flying seat with no times yet (his D2573)

Branch `claude/sans-leftovers-179` (chat 179), pull request 848. Built from commit `3eb45f0cc`. Pictures:
`docs/img/handpass/2026-11-25-sans-notimes-strike/`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL, who counts as present) | NO — the crew list's per-seat reason only; nothing earns, nothing counts him present or away (the counts read a different question, `dayTasked`/`dayAway`). |
| 2 | The published record | NO — nothing published or signed changes; the reason is never stored. |
| 3 | Saved data | NO — nothing is written. |
| 4 | A shared drawer | YES — the per-seat reason (`slotBar`) feeds the crew list on Edit Schedule and the Board, the drag hover, the drop's note and the green rings. |
| 5 | A new gesture or mode | NO. |
| 6 | A new surface | NO. |
| 7 | Roles | NO — the crew list is a scheduler's (an admin's) only. |
| 8 | The warning list / how a rule is read | YES — it changes how the SANS availability rule is read for a seat with no times (the warning list itself is unchanged). |

**Tier: FULL** (question 8).

## 2. The rulings that apply

| Ruling | In the app's words | Checked by |
|---|---|---|
| D2573 | With nothing filed, a SANS man is struck on the crew list for a flying seat with no times yet, the same reason as a timed seat; a man who filed something is unchanged | the test file; the walk |
| D2568 | His reminder counts a seat with no times yet; a cancelled line never | the walk (the bell agrees) |
| D2564 | Only flying seats and sims count — never a ground row, a duty desk, all hands | the walk (a desk, a ground row unchanged) |
| D2576, D2578 | SC MAIN, SC SPARE, BB, AVALON need no SANS availability (not built) — so the new strike never reaches them | the test file; the walk |
| D2420 | With no seat picked, the crew list draws no reason line for a man struck for nothing filed | the walk |
| D2338, D2340 | Posted out as SANS from a date ahead: the strike's words name that date; before it he is an ordinary man | the walk |
| D2579 | The amber warning line for nothing filed — drawn first, NOT built here; the warning list must stay as it is | the test file; the walk |
| D2611 | A case his ruling does not name (a sim with no times) is put to him first, not built on a guess | the questions page |

No clash between them found.

## 3. The roll-call

| Place the answer shows | SHOW | USABLE | PAINTED beside it |
|---|---|---|---|
| Edit Schedule crew panel, a flying seat with no times picked — desktop | | | |
| Edit Schedule crew panel, the same — phone | | | |
| Scheduler Board crew list, the same — desktop | | | |
| Scheduler Board crew list, the same — phone | | | |
| Crew list, no seat picked (unchanged, D2420) | | | |
| The drag hover over the seat | | | |
| The note after a drop or a tap-to-plan | | | |
| The green "where can he go" rings | | | |
| His bell's SANS reminder (must agree) | | | |
| The warning list and his puck's marks (unchanged) | | | |
| Standby seats with no times (unchanged) | | | |
| A sim row with no times (unchanged, a question for him) | | | |

## 4. The five sizing lines

## 5. The scenarios (Astra and a fresh Fable, blind to each other, combined by the host)

## 6. The orders walked

## 7. Cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| No times, nothing filed → struck in the timed seat's words | `src/engine/sans-notimes-strike.test.ts` | the two cases that failed before the fix |
| A man who filed anything, a non-SANS man, every SC / AVALON / BB seat, the warning list — unchanged | the same file | five cases; removing the fix's standby guard fails one |

## 8. The pictures

## 9. The break tests

## 10. Errors seen

## 11. Not walked, and why

## 12. The code reads

## 13. Gates

## 14. What the walk found, and each disposition

## 15. The Walk line
