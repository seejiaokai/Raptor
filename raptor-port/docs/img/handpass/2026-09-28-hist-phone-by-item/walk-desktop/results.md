# hp-walk — desktop (1440×900)

| Step | What | Result | Note | Picture |
|---|---|---|---|---|
| H0 | the world: Monday published, Hex's changes and Ranger's leave in the history | PASS | {"monPub":true,"mon":true,"lines":24,"hexIds":{"moved":"snap","from":1,"to":0,"r2":"rocky"},"wtitle":"2nd wave"} |  |
| H1 | History off: no gold dots anywhere | PASS |  | 01-history-off.png |
| H2 | the admin's clock opens the window: Group by Item, on, first; New to you; every group an item | PASS | {"on":"Item","btns":["Item","Who"],"tab":"New to you 12","items":["Tue · Input · Ranger · LL","Tue · Wave · WAVE 2","Tue · Flying · VL BFM · 5","Mon · Flying · VL BFM","Tue · Flying · RU BFM","Tue · Programme · SODB","Tue · Duty · SDO · 2","Tue · Duty · SXO"]} | 02-window-item.png |
| H3 | the hint in his words on the phone; no hint and no Hide on a desktop | PASS | {"hint":null,"hide":0} |  |
| H4 | the edit week: every changed detail is dotted, painted where the design puts it — seats outside the corner, typed details inside | PASS | {"seat":{"on":true,"how":"outside","painted":true},"seat2":{"on":true,"how":"outside","painted":true},"time":{"on":true,"how":"outside","painted":true},"rmk":{"on":true,"how":"outside","painted":true},"atime":{"on":true,"how":"outside","painted":true},"leave":{"on":true,"painted":true},"untouched":f | 03-editweek-dots.png |
| H5 | a seat's dot and its OG tag share it, in opposite corners; nothing covers the dotted seat | PASS | "OG" |  |
| H6 | a tap (phone) or a hover (desktop) on a dotted detail raises its bubble — and the edit still happens underneath | PASS | VL BFM · #1 FCPWarden → OutlawHex · 28/9 14:13 | 04-bubble.png |
| H8 | All changes: the first line is one group "Flying · …" with its seats as details, and the within-line move is ONE entry, "moved", #1 RCP → #2 RCP | PASS | {"h":"Flying · VL BFM · 5","lines":["Area time0840-1005 → 1300-1400Hex · 28/9 14:13","Ranger moved#1 RCP → #2 RCPHex · 28/9 14:13","#2 RCPHex taken offHex · 28/9 14:13","#1 RCPBasher → RangerHex · 28/9 14:13","#1 FCPWarden → OutlawHex · 28/9 14:13"]} | 05-item-formation.png |
| H9 | the duty-desk move is under BOTH desks — "moved in from" and "moved out to" — and ONE change in the tab | PASS | {"ins":["Cinch moved in from SXOHex · 28/9 14:13"],"outs":["Duty · SXOHex · 28/9 14:13Cinch moved out to SDO"],"moved":"snap"} |  |
| H10 | the week view: the day leads every item ("Tue · …"), the newest item on top | PASS | ["Mon · The day · 10","Tue · Input · Ranger · LL","Tue · Wave · WAVE 2","Tue · Flying · VL BFM · 5","Mon · Flying · VL BFM","Tue · Flying · RU BFM","Tue · Programme · SODB","Tue · Duty · SDO · 2","Tue · Duty · SXO"] | 06-item-week.png |
| H11 | Group by Who keeps its sittings, each line item-first | PASS | [{"h":"▾Saber · 10 changes28/9 14:13–14:14","open":"true","firsts":["Mon · The day","Mon · The day","Mon · The day","Mon · The day","Mon · The day","Mon · The day","Mon · The day","Mon · The day","Mon · The day","Mon · The day"]},{"h":"▾Ranger · 1 changeNEW28/9 14:14","open":"true","firsts":["Tue ·  | 07-group-who.png |
| H12 | every group opens by default; a caret folds one and it stays folded while the window is open | PASS | {"k":3,"allOpen":true,"folded":"false"} |  |
| H13 | a tap on a line takes the schedule there (the week, not the board) and the window stays — on a phone as its bar | PASS | {"flash":1,"open":1,"bar":0,"board":null} | 08-after-jump.png |
| H14 | published Monday: its issued remark wears its AL1 tag AND the dot | PASS | {"alc":"1","al":"\"AL1\"","dot":true} | 09-mon-al-and-dot.png |
| H15 | the board: seats, a typed box and the wave-title box are dotted; the wave title answers with its bubble | PASS | {"seat":{"on":true,"how":"outside","painted":true},"time":{"on":true,"painted":true},"wsel":{"on":true,"painted":true},"bubble":"Wave · WAVE 21st wave → 2nd waveHex · 28/9 14:14"} | 10-board-dots.png |
| H16 | a look at the published Original on the board wears no dot, and answers no bubble | PASS | {"look":1,"dots":0,"vers":["live","2026-07-13#0","2026-07-13#1"],"bub":null} | 11-board-look.png |
| H17 | Mark all as seen: the OG tags and the gold "new" marks go; the history dots stay | PASS | {"og":0,"fresh":0,"dots":10} | 12-after-seen.png |
| H18 | Hide, then ✕ on the bar (phone) — or ✕ on the window (desktop): the window shuts and every dot goes | PASS |  |  |
| H19 | a reload: the history is still there — the window reopened, the dots come back on the same details | PASS | {"on":true,"how":"outside","painted":true} | 13-after-reload.png |
| H21 | a week change while History is on closes the window, hidden or not, and the dots go with it | PASS | 20/07/2026 |  |
| H22 | a member: the day chip opens the window grouped by Item; View-only wears no dots; on a phone no hint, and the bar says "Changes" | PASS | {"open":1,"on":"Item","dots":0,"hint":0,"bar":null} | 14-member-viewonly.png |
| H23 | no console errors through the whole walk | PASS |  |  |
