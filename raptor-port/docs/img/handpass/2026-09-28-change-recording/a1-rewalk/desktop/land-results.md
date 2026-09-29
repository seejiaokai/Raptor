# Walker A1 — land (desktop 1440×900)

| # | Check | Result | Observed | Picture(s) |
|---|---|---|---|---|
| A | top bar, same week: the change on Monday, Friday in view → after Undo, Monday (where the change was) is on screen | PASS | {"before":[4,5,6],"after":[0,1,2],"mondayNote":"on screen","toast":["Undid: a change to the schedule"]} | desktop/land-01-A-top-same-week.png |
| B | board, same week: the change on Monday, the board on Friday → after Undo the board is on Monday | PASS | {"boardDay":0,"toast":["Undid: a change to the schedule"]} | desktop/land-02-B-board-same-week.png |
| C | top bar, another week: the change on Monday 13 Jul, Thursday 23 Jul in view → after Undo, week of 13 Jul with Monday on screen | PASS | {"before":{"wk":"20/07/2026","days":[3,4,5]},"after":{"wk":"13/07/2026","days":[0,1,2],"note":"on screen"},"toast":["Undid: a change to the schedule"]} | desktop/land-03-C-top-other-week.png |
| D | board, another week: the change on Monday 13 Jul, the board on Thursday 23 Jul → after Undo, Monday 13 Jul on the board (or on screen) | PASS | {"after":{"wk":"13/07/2026","board":0,"days":[3,4,5],"note":"off screen"},"toast":["Undid: a change to the schedule"]} | desktop/land-04-D-board-other-week.png |
| D-door | NOTE | note | {"what":"after the board's Undo crossed the week, is the board (and its Redo) still there?","boardOpen":true,"redo":"redoBtn on \"Redo — a change to the schedule\""} |  |

Console / page errors: none
