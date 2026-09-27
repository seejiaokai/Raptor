# [DRAFT-PENDING] walk — phone 390×844 (28 Sep 26)

| # | Check | Result | Note | Picture |
|---|---|---|---|---|
| A1 | Monday was published through its own controls | PASS | true |  |
| A2 | Tuesday (not published) reads "N new" — Hex's and Ranger's changes, new to Saber | PASS | {"t":"5 new","c":"dpend dpendbtn dnew"} | 01-saber-editweek.png |
| A3 | Monday (published) reads "1 pending" with the gold dot (something new on it) | PASS | {"t":"1 pending","dot":true} |  |
| A4 | the OG tag is PAINTED on Tuesday's two new pucks, and on no published day | PASS | [{"k":"1.0.0.0.p","c":"\"OG\"","p":"relative"},{"k":"1.0.0.0.w","c":"\"OG\"","p":"relative"},{"k":"d:1.0.0","c":"\"OG\"","p":"relative"}] |  |
| A5 | the admin's icon carries the week's new count, no word | PASS | {"t":"6","n":"6"} |  |
| F1 | a reorder carries the OG tag with its row (P1): Tuesday's desk a man was moved onto, moved down one — the tag goes with him | PASS | {"to":0,"dst":1,"before":["1.0.0.0.p","1.0.0.0.w","d:1.0.0"],"after":["1.0.0.0.p","1.0.0.0.w","d:1.0.1"]} | 02-reorder-og.png |
| F2 | Tuesday's ⓘ panel speaks the chip's words ("N new"), never "N unpublished edits" (P7, D118) | PASS | Draft — not yet published5 new | 03-dayinfo-tue.png |
| F3 | a look at a saved plan of Tuesday wears no OG tag (P4) — the live day still does | PASS | {"id":"dr2","live":3,"look":0,"back":3} | 04-plan-preview-no-og.png |
| F4 | the clock icon's number fits its button (P2): on a phone a small badge on the icon's corner, on screen, the bar one line | PASS | {"btn":[346,9,376,39],"num":[366,5,381,20],"vw":390,"bar":[0,49],"pos":"absolute"} | 05-clock-icon.png |
| A6 | Tuesday's chip opens the window on Tuesday, New to you, grouped by Who | PASS | {"ttl":"Changes · Tuesday 14/7Not yet published","tab":"New to you 5","grp":["▾Ranger · 1 changeNEW28/9 04:52","▾Hex · 4 changesNEW28/9 04:52"]} | 06-window-tue-new.png |
| A7 | the move between two of the duty desks on Tuesday is ONE line, "moved from … to …" | PASS | ["CinchHex · 28/9 04:52moved from Duty · SXO to Duty · SDO"] |  |
| A8 | Ranger's leave is ONE line under his name, and a tap lands on his row under Unavailable (the R30 finding) | PASS | {"k":1,"tag":"BUTTON","flash":["imukao4x0w47wh5"]} | 07-leave-line-jump.png |
| A9 | the window STAYED OPEN after the tap (D167) | PASS |  |  |
| A10 | Group by Where lists Flying waves, Duties and Absences | PASS | ["▾Flying waves · 2 changesNEW","▾Duties · 2 changesNEW","▾Absences · 1 changeNEW"] | 08-group-where.png |
| A11 | Monday's "1 pending" opens To go out · AL1, naming the SDO desk change with who | PASS | {"tab":"To go out · AL1 1","items":["SDOHex28/9 04:52Sidewinder → Piston"]} | 09-mon-to-go-out.png |
| A12 | the week: every change this week, the day picker's gold dots on Mon and Tue | PASS | ["Mon","Tue"] | 10-week-all.png |
| A13 | the board: its History button opens the window on the board's day, the bubble answers a changed seat | PASS | {"chip":"5 new","og":3,"ttl":"Changes · Tuesday 14/7Not yet published","bub":"VL BFM · #1 FCPWarden → OutlawHex · 28/9 04:52"} | 11-board-history.png |
| F5 | on the board, Ranger's leave line lands on the board's own Unavailable row (P5) — never "shown on the week" | PASS | {"flash":["imukao4x0w47wh5"],"t":""} | 12-board-leave-jump.png |
| A14 | the edit week has the bubble too while the window is open (D116) | PASS | VL BFM · #1 FCPWarden → OutlawHex · 28/9 04:52 | 13-editweek-bubble.png |
| A15 | Mark all as seen: Tuesday reads "N changes", the tags and the icon's number go | PASS | {"c":{"t":"5 changes","c":"dpend dpendbtn dchg"},"og":0,"num":0} | 14-seen.png |
| F6 | phone: the panel dragged up the screen, then a tap — the slim bar sits at the BOTTOM, not where the panel was (P8) | PASS | {"draggedTop":136,"bar":{"top":788,"bottom":832,"vh":844},"backTop":136} | 15-phone-bar-after-drag.png |
| A16 | a reload keeps the history and what Saber has seen (D336 (b)) | PASS | {"t":"5 changes","c":"dpend dpendbtn dchg"} |  |
| A17 | Saber signs Tuesday's CUR CK — a line "Signed · CUR CK" on Tuesday | PASS | ["Ranger · LL added · 14 Jul","Signed · CUR CK · Ace"] |  |
| A18 | Undo leaves its own line on the day it changed | PASS | {"lbl":"Undo — a change to the schedule","date":"2026-07-15"} |  |
| F7 | "Discard marks" leaves a line on the day it cleared (P9) | PASS | {"had":1,"last":[{"lbl":"VL SAT · #1 FCP","date":"2026-07-16"},{"lbl":"Draft marks cleared (5)","date":"2026-07-14"},{"lbl":"Draft marks cleared (1)","date":"2026-07-16"}]} |  |
| F8 | a CAT changed on Quals after Monday went out: Monday's To go out names who changed it and when (P6) | PASS | {"items":["SDOHex28/9 04:52Sidewinder → Piston","What this day showsSaber28/9 04:52OCU pilot Drifter with CAT C WSO Vector — not an authorised combination (RU BFM)newDrifter · CATA → OCU"],"back":"1 pending"} | 16-to-go-out-cat.png |
| A19 | a week change closes the window | PASS |  |  |
| M1 | a member has no top-bar changes door (D171 (1)) | PASS |  |  |
| M2 | View-only Sched: Tuesday's live draft carries the chip (Hex's changes are new to Ranger) | PASS | {"t":"6 new","c":"dpend dpendbtn dnew"} | 17-member-view.png |
| M3 | the chip opens the window, read only — and it names who made each change | PASS | "Read only — every change and who made it, for everyone to see." | 18-member-window.png |
| M4 | Monday's issued face shows no chip; the working copy shows "1 pending" and it opens the window | PASS | {"face":0,"wc":"1 pending"} |  |
| F9 | View-only, Monday on its issued face: a tap on Monday's line turns the day to its Working draft and lands (P3) | PASS | {"v":"working","flash":1,"t":"Showing the working draft — the change is on it"} | 19-member-issued-jump.png |
| M5 | the page scrolls no sideways with the window open | PASS |  |  |

Console errors: none
