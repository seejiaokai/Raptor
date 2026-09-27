# [DRAFT-PENDING] walk — desktop 1440×900 (28 Sep 26)

| # | Check | Result | Note | Picture |
|---|---|---|---|---|
| A1 | Monday was published through its own controls | PASS | true |  |
| A2 | Tuesday (not published) reads "N new" — Hex's and Ranger's changes, new to Saber | PASS | {"t":"5 new","c":"dpend dpendbtn dnew"} | 01-saber-editweek.png |
| A3 | Monday (published) reads "1 pending" with the gold dot (something new on it) | PASS | {"t":"1 pending","dot":true} |  |
| A4 | the OG tag is PAINTED on Tuesday's two new pucks, and on no published day | PASS | [{"k":"1.0.0.0.p","c":"\"OG\"","p":"relative"},{"k":"1.0.0.0.w","c":"\"OG\"","p":"relative"},{"k":"d:1.0.0","c":"\"OG\"","p":"relative"}] |  |
| A5 | the admin's icon carries the week's new count, no word | PASS | {"t":"6","n":"6"} |  |
| A6 | Tuesday's chip opens the window on Tuesday, New to you, grouped by Who | PASS | {"ttl":"Changes · Tuesday 14/7Not yet published","tab":"New to you 5","grp":["▾Ranger · 1 changeNEW28/9 02:46","▾Hex · 4 changesNEW28/9 02:46"]} | 02-window-tue-new.png |
| A7 | the move between two of the duty desks on Tuesday is ONE line, "moved from … to …" | PASS | ["CinchHex · 28/9 02:46moved from Duty · SXO to Duty · SDO"] |  |
| A8 | Ranger's leave is ONE line under his name, and a tap lands on his row under Unavailable (the R30 finding) | PASS | {"k":1,"tag":"BUTTON","flash":["imuk671gb7ufoi2"]} | 03-leave-line-jump.png |
| A9 | the window STAYED OPEN after the tap (D167) | PASS |  |  |
| A10 | Group by Where lists Flying waves, Duties and Absences | PASS | ["▾Flying waves · 2 changesNEW","▾Duties · 2 changesNEW","▾Absences · 1 changeNEW"] | 04-group-where.png |
| A11 | Monday's "1 pending" opens To go out · AL1, naming the SDO desk change with who | PASS | {"tab":"To go out · AL1 1","items":["SDOHex28/9 02:46Sidewinder → Piston"]} | 05-mon-to-go-out.png |
| A12 | the week: every change this week, the day picker's gold dots on Mon and Tue | PASS | ["Mon","Tue"] | 06-week-all.png |
| A13 | the board: its History button opens the window on the board's day, the bubble answers a changed seat | PASS | {"chip":"5 new","og":3,"ttl":"Changes · Tuesday 14/7Not yet published","bub":"VL BFM · #1 FCPWarden → OutlawHex · 28/9 02:46"} | 07-board-history.png |
| A14 | the edit week has the bubble too while the window is open (D116) | PASS | VL BFM · #1 FCPWarden → OutlawHex · 28/9 02:46 | 08-editweek-bubble.png |
| A15 | Mark all as seen: Tuesday reads "N changes", the tags and the icon's number go | PASS | {"c":{"t":"5 changes","c":"dpend dpendbtn dchg"},"og":0,"num":0} | 09-seen.png |
| A16 | a reload keeps the history and what Saber has seen (D336 (b)) | PASS | {"t":"5 changes","c":"dpend dpendbtn dchg"} |  |
| A17 | Saber signs Tuesday's CUR CK — a line "Signed · CUR CK" on Tuesday | PASS | ["Ranger · LL added · 14 Jul","Signed · CUR CK · Ace"] |  |
| A18 | Undo leaves its own line on the day it changed | PASS | {"lbl":"Undo — a change to the schedule","date":"2026-07-15"} |  |
| A19 | a week change closes the window | PASS |  |  |
| M1 | a member has no top-bar changes door (D171 (1)) | PASS |  |  |
| M2 | View-only Sched: Tuesday's live draft carries the chip (Hex's changes are new to Ranger) | PASS | {"t":"5 new","c":"dpend dpendbtn dnew"} | 10-member-view.png |
| M3 | the chip opens the window, read only — and it names who made each change | PASS | "Read only — every change and who made it, for everyone to see." | 11-member-window.png |
| M4 | Monday's issued face shows no chip; the working copy shows "1 pending" and it opens the window | PASS | {"face":0,"wc":"1 pending"} |  |
| M5 | the page scrolls no sideways with the window open | PASS |  |  |

Console errors: none
