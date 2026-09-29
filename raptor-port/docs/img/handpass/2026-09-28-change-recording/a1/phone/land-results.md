# Walker A1 — land (phone 390×844)

| # | Check | Result | Observed | Picture(s) |
|---|---|---|---|---|
| A | top bar, same week: the change on Monday, Friday in view → after Undo, Monday (where the change was) is on screen | **FAIL** | {"before":[4],"after":[4],"mondayNote":"off screen","toast":["Undid: a change to the schedule"]} | phone/land-01-A-top-same-week.png |
| B | board, same week: the change on Monday, the board on Friday → after Undo the board is on Monday | PASS | {"boardDay":0,"toast":["Undid: a change to the schedule"]} | phone/land-02-B-board-same-week.png |
| C | top bar, another week: the change on Monday 13 Jul, Thursday 23 Jul in view → after Undo, week of 13 Jul with Monday on screen | **FAIL** | {"before":{"wk":"20/07/2026","days":[3]},"after":{"wk":"13/07/2026","days":[3],"note":"off screen"},"toast":["Undid: a change to the schedule"]} | phone/land-03-C-top-other-week.png |
| D | board, another week: the change on Monday 13 Jul, the board on Thursday 23 Jul → after Undo, Monday 13 Jul on the board (or on screen) | **FAIL** | {"after":{"wk":"13/07/2026","board":null,"days":[3],"note":"off screen"},"toast":["Undid: a change to the schedule"]} | phone/land-04-D-board-other-week.png |
| D-door | NOTE | note | {"what":"after the board's Undo crossed the week, is the board (and its Redo) still there?","boardOpen":false,"redo":"redoBtn on \"Redo — a change to the schedule\""} |  |

Console / page errors: none
