# Walker A — [MSQ-PA] Plan audit walk (20 Nov 26), Hunter (142 admin) with Plan of 149
Frozen build bundle index-a7kr8dHR.js. Pictures: raptor-port/docs/img/handpass/2026-11-20-msq-plan-audit/a/<desktop|phone>/ (picture name given per row; "-press" suffix = picture right after the press).
Row format: scenario | size | pressed | EXPECTED | saw | verdict | picture.
Notes: Hunter's Plan of 149 written as a stored row before sign-in (setup only). "S1c Archive tap 1" row = first run's exploratory record (no question asked); the Archive/Restore rows follow. The "search typed Kes ... cleared by its x" FAIL (r5-search-cleared) is the script's own mistake (wrong selector; the x is the browser's own search-cancel mark, pressed by position); superseded by the r5b re-run PASS. Pages for S5/S6/round reached via the app's own go() routing (as the recipe library does) not the nav tabs.

## Desktop
S1a | desktop | Osprey row, Suspend | no refusal; Sign-in dot red | toast=Osprey suspended dot=r | PASS | s1a-1-suspend
S1a | desktop | Osprey row, Enable | no refusal; dot green | toast=Osprey can sign in again dot=g | PASS | s1a-2-enable
S1a | desktop | top bar Undo | RECORD | toast=Undid: enabling Osprey’s sign-in dot=r | RECORDED | s1a-3-undo
S1a | desktop | top bar Redo | RECORD | toast=Redid: enabling Osprey’s sign-in dot=g | RECORDED | s1a-4-redo
S1b | desktop | Role Admin, Save | saved, no refusal; row reads Admin | toast=Saved badge=ADMIN header=Osprey us9 · Pilot · CAT A | PASS | s1b-1-save
S1b | desktop | top bar Undo | RECORD | toast=Undid: Osprey’s role badge=MEMBER header=Osprey us9 · Pilot · CAT A | RECORDED | s1b-2-undo
S1c | desktop | Archive tap 1 | RECORD question; no "He is 149's" refusal | toast=Osprey archived — his sign-in is suspended dlg=[] edit= | RECORDED | s1c-1-archive
S1c | desktop | Archive (no question asked; done on first tap) | no "He is 149's" refusal | toast=Osprey archived — his sign-in is suspended header=Osprey us9 · Pilot · CAT A Archived 20 Nov 26 by Hunter | PASS | s1c-1-archive
S1c | desktop | archived row opened, Restore | RECORD | toast=Osprey restored — he can sign in, and he'll be asked to check his quals and CAT header=Osprey us9 · Pilot · CAT A signin=g roster=g | RECORDED | s1c-4-restore
S1d | desktop | Delete, first tap | RECORD the question | toast= dlg=[] edit=SIGN-IN (DEFENCE MAIL) ROLE Member — own inputs, quals and bids Admin — schedules and manages Save Suspend Archive Tap again to delete Osprey Cancel Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can’t be undone. btn=Tap again to delete Osprey | RECORDED | s1d-1-delete-tap1
S1d | desktop | Delete, second tap | no "He is 149's" refusal; RECORD what happens | toast=Osprey deleted dlg=[] row=NO ROW (gone) | PASS | s1d-2-delete-tap2
S2 | desktop | Hunter (no Plan): Osprey Suspend | refused: "He is 149's. Only an admin of 149 can change his account." | toast=He is 149's. Only an admin of 149 can change his account. dot=g | PASS | s2-1-suspend
S2 | desktop | Hunter (no Plan): Osprey Archive | RECORD | toast=He is 149's. Only an admin of 149 can change him. header=Osprey us9 · Pilot · CAT A | RECORDED | s2-2-archive
S3 | desktop | Plan: Kestrel Suspend | refused: "Kestrel is 149's last admin. Make another admin of 149 first." | toast=Kestrel is 149's last admin. Make another admin of 149 first. dot=g | PASS | s3-1-kestrel-suspend
S3 | desktop | Plan: Osprey role Admin, Save | saved | toast=Saved badge=ADMIN | PASS | s3-2-osprey-admin
S3 | desktop | Plan: Kestrel Suspend again (Osprey now admin) | RECORD (expected allowed) | toast=Kestrel suspended dot=r | RECORDED | s3-3-kestrel-suspend-again
S4 | desktop | Plan: Saber (master admin) Suspend | refused "Only a master admin can do that" | toast=Only a master admin can do that dot=g | PASS | s4-1-saber-suspend
S4 | desktop | Plan: Saber Role Member, Save | RECORD | toast=Only a master admin can do that badge=ADMIN | RECORDED | s4-3-saber-save
S5 | desktop | Kestrel (149 admin) opens the bell after Osprey filed LL | RECORD | badge={"dot":"none","text":"","aria":"Notifications"} list=Nothing new | RECORDED | s5-4-kestrel-bell
S5 | desktop | Hunter (Plan of 149) opens the bell | RECORD | badge={"dot":"none","text":"","aria":"Notifications"} list=Nothing new | RECORDED | s5-5-hunter-bell
S5 | desktop | Hunter archived Osprey; Kestrel opens the bell | RECORD | badge={"dot":"none","text":"","aria":"Notifications"} list=Nothing new | RECORDED | s5-7-kestrel-bell-after-archive
Round | desktop | Kestrel: Leave War while Osprey archived | RECORD | {"osprey":true,"kestrel":true,"hunter":false,"saber":false,"len":18222,"head":"Grid Approvals Balances OIL VIEW JAN - DEC 26 JAN - DEC 27 + New period MY LEAVE LVE 0 · OIL 0 · 0 pending › ▾ Manning Bidding closed Legend JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC 2026 CS/Name +LVE JAN THU 01 FRI 02 SAT 03 SUN 04 MON 05 TUE 06 WED 07 THU 08 FRI 09 SAT 10 SUN 11 MON 12 TUE 1"} | RECORDED | s6-k-leavewar-archived
Round | desktop | Kestrel: Leave War after Osprey restored | RECORD | {"osprey":true,"kestrel":true,"hunter":false,"saber":false,"len":17550,"head":"Grid Approvals Balances OIL VIEW JAN - DEC 26 JAN - DEC 27 + New period MY LEAVE LVE 0 · OIL 0 · 0 pending › ▾ Manning Bidding closed Legend JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC 2026 CS/Name +LVE JAN THU 01 FRI 02 SAT 03 SUN 04 MON 05 TUE 06 WED 07 THU 08 FRI 09 SAT 10 SUN 11 MON 12 TUE 1"} | RECORDED | s6-k-leavewar-restored
S5 | desktop | after restore, Kestrel opens the bell | RECORD | badge={"dot":"none","text":"","aria":"Notifications"} list=Nothing new | RECORDED | s5-9-kestrel-bell-after-restore
S6 | desktop | Hunter (Plan of 149): inputs page, whose people | EXPECTED 142's only | page=inputs Osprey(149)=false Kestrel(149)=false Hunter=true Saber=true Ranger=true head=Inputs Inputs SANS Medical 2 1 Calendar List Everyone ALL AVAIL ALL Ace Anvil Basher Blade Bolt Cinch Cinder Cobra Comet Cotter Cutter Dash Diesel Drifter Echo Fable Forge Gambit Ghost Grit Havoc Hex Hunter Jester Kraken Ledger Marlin Nomad Otter Out | RECORDED | s6-h-inputs
S6 | desktop | Hunter (Plan of 149): leavewar page, whose people | EXPECTED 142's only | page=leavewar Osprey(149)=false Kestrel(149)=false Hunter=true Saber=true Ranger=true head=Grid Approvals 13 Balances OIL VIEW JAN - DEC 26 JAN - DEC 27 + New period MY LEAVE LVE 20.5 · OIL 2.5 · 0 pending › ▾ Manning Bidding closed Legend JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC 2026 CS/Name +LVE JAN THU 01 FRI 02 SAT 03 SUN 04 MON | RECORDED | s6-h-leavewar
S6 | desktop | Hunter (Plan of 149): quals page, whose people | EXPECTED 142's only | page=quals Osprey(149)=false Kestrel(149)=false Hunter=true Saber=true Ranger=true head=Edit Export to Excel VIEWING Pilots WSOs Personnel All + Add person CALLSIGN/NAME▲ INITIALS FLIGHT CAT SANS SXO MANAGEMENT SCHEDULER SC DAY SC NIGHT DAAR NAAR NVG IMC TF REMARKS ASSIGNED PILOTS · 34 Ace AA ✓ ✓ ✓ ✓ ✓ ✓ A · 4-ship FL Anvil IPIP ✓ ✓ ✓ ✓ | RECORDED | s6-h-quals
Round | desktop | row opened then closed by its header | open=1 then 0 | after open=1 after header again=0 | PASS | r1-open
Round | desktop | row opened then Cancel | closed | open after Cancel=0 | PASS | r2-cancel
Round | desktop | row opened then Escape | RECORD (closed?) | open after Escape=1 | RECORDED | r3-escape
Round | desktop | row opened then tap on empty page area outside | RECORD (closed?) | open after outside tap=1 | RECORDED | r4-tap-outside
Round | desktop | search typed "Kes" then cleared by its x | rows 1 then many | rows typed=1 after x=-1 box=Kes | FAIL | r5-search-cleared
Round | desktop | Suspend Osprey, Undo from top bar | dot green again | toast=Undid: suspending Osprey’s sign-in dot=g | PASS | r6-undo
Round | desktop | Redo from top bar | dot red again | toast=Redid: suspending Osprey’s sign-in dot=r | PASS | r6-redo
Round | desktop | Quals page after Osprey suspended | RECORD Osprey row | {"osprey":false,"len":2046,"head":"Edit Export to Excel VIEWING Pilots WSOs Personnel All + Add person CALLSIGN/NAME▲ INITIALS FLIGHT CAT SANS SXO MANAGEMENT SCHEDULER SC DAY SC NIGHT DAAR NAAR NVG IMC TF REMARKS ASSIGNED PILOTS · 34 Ace AA ✓ ✓ ✓ ✓ ✓ ✓ A · 4-ship FL Anvil IPIP ✓ ✓ ✓ ✓"} | RECORDED | r7-quals
Round | desktop | search typed "Kes" then cleared by its x (re-run, selector fixed) | rows 1 then many, box empty | rows typed=1 after x=1 box="Kes" | FAIL | r5b-cleared
Round | desktop | search typed "Kes" then cleared by its x (re-run, selector fixed) | rows 1 then many, box empty | rows typed=1 after x=71 box="" | PASS | r5b-cleared

## iPhone
S1a | iPhone | Osprey row, Suspend | no refusal; Sign-in dot red | toast=Osprey suspended dot=r | PASS | s1a-1-suspend
S1a | iPhone | Osprey row, Enable | no refusal; dot green | toast=Osprey can sign in again dot=g | PASS | s1a-2-enable
S1a | iPhone | top bar Undo | RECORD | toast=Undid: enabling Osprey’s sign-in dot=r | RECORDED | s1a-3-undo
S1a | iPhone | top bar Redo | RECORD | toast=Redid: enabling Osprey’s sign-in dot=g | RECORDED | s1a-4-redo
S1b | iPhone | Role Admin, Save | saved, no refusal; row reads Admin | toast=Saved badge=Admin header=Osprey us9 · Admin · Pilot · CAT A | PASS | s1b-1-save
S1b | iPhone | top bar Undo | RECORD | toast=Undid: Osprey’s role badge=Member header=Osprey us9 · Member · Pilot · CAT A | RECORDED | s1b-2-undo
S1c | iPhone | Archive tap 1 | RECORD question; no "He is 149's" refusal | toast=Osprey archived — his sign-in is suspended dlg=[] edit= | RECORDED | s1c-1-archive
S1c | iPhone | Archive (no question asked; done on first tap) | no "He is 149's" refusal | toast=Osprey archived — his sign-in is suspended header=Osprey us9 · Pilot · CAT A Archived 20 Nov 26 by Hunter | PASS | s1c-1-archive
S1c | iPhone | archived row opened, Restore | RECORD | toast=Osprey restored — he can sign in, and he'll be asked to check his quals and CAT header=Osprey us9 · Member · Pilot · CAT A signin=g roster=g | RECORDED | s1c-4-restore
S1d | iPhone | Delete, first tap | RECORD the question | toast= dlg=[] edit=SIGN-IN (DEFENCE MAIL) ROLE Save Suspend Archive Tap again to delete Osprey Cancel Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can’t be undone. btn=Tap again to delete Osprey | RECORDED | s1d-1-delete-tap1
S1d | iPhone | Delete, second tap | no "He is 149's" refusal; RECORD what happens | toast=Osprey deleted dlg=[] row=NO ROW (gone) | PASS | s1d-2-delete-tap2
S2 | iPhone | Hunter (no Plan): Osprey Suspend | refused: "He is 149's. Only an admin of 149 can change his account." | toast=He is 149's. Only an admin of 149 can change his account. dot=g | PASS | s2-1-suspend
S2 | iPhone | Hunter (no Plan): Osprey Archive | RECORD | toast=He is 149's. Only an admin of 149 can change him. header=Osprey us9 · Member · Pilot · CAT A | RECORDED | s2-2-archive
S3 | iPhone | Plan: Kestrel Suspend | refused: "Kestrel is 149's last admin. Make another admin of 149 first." | toast=Kestrel is 149's last admin. Make another admin of 149 first. dot=g | PASS | s3-1-kestrel-suspend
S3 | iPhone | Plan: Osprey role Admin, Save | saved | toast=Saved badge=Admin | PASS | s3-2-osprey-admin
S3 | iPhone | Plan: Kestrel Suspend again (Osprey now admin) | RECORD (expected allowed) | toast=Kestrel suspended dot=r | RECORDED | s3-3-kestrel-suspend-again
S4 | iPhone | Plan: Saber (master admin) Suspend | refused "Only a master admin can do that" | toast=Only a master admin can do that dot=g | PASS | s4-1-saber-suspend
S4 | iPhone | Plan: Saber Role Member, Save | RECORD | toast=Only a master admin can do that badge=Admin | RECORDED | s4-3-saber-save
S5 | iPhone | Kestrel (149 admin) opens the bell after Osprey filed LL | RECORD | badge={"dot":"none","text":"","aria":"Notifications"} list=Nothing new | RECORDED | s5-4-kestrel-bell
S5 | iPhone | Hunter (Plan of 149) opens the bell | RECORD | badge={"dot":"none","text":"","aria":"Notifications"} list=Nothing new | RECORDED | s5-5-hunter-bell
S5 | iPhone | Hunter archived Osprey; Kestrel opens the bell | RECORD | badge={"dot":"none","text":"","aria":"Notifications"} list=Nothing new | RECORDED | s5-7-kestrel-bell-after-archive
Round | iPhone | Kestrel: Leave War while Osprey archived | RECORD | {"osprey":true,"kestrel":true,"hunter":false,"saber":false,"len":5385,"head":"Grid Approvals Balances OIL VIEW MY LEAVE LVE 0 · OIL 0 · 0 pending › ▸ Manning Bidding closed Legend JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC 2026 CS/Name +LVE JUN MON 01 TUE 02 WED 03 THU 04 FRI 05 SAT 06 SUN 07 MON 08 TUE 09 WED 10 THU 11 FRI 12 SAT 13 SUN 14 MON 15 TUE 16 WED 17 THU 18 FR"} | RECORDED | s6-k-leavewar-archived
Round | iPhone | Kestrel: Leave War after Osprey restored | RECORD | {"osprey":true,"kestrel":true,"hunter":false,"saber":false,"len":5167,"head":"Grid Approvals Balances OIL VIEW MY LEAVE LVE 0 · OIL 0 · 0 pending › ▸ Manning Bidding closed Legend JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC 2026 CS/Name +LVE JUN MON 01 TUE 02 WED 03 THU 04 FRI 05 SAT 06 SUN 07 MON 08 TUE 09 WED 10 THU 11 FRI 12 SAT 13 SUN 14 MON 15 TUE 16 WED 17 THU 18 FR"} | RECORDED | s6-k-leavewar-restored
S5 | iPhone | after restore, Kestrel opens the bell | RECORD | badge={"dot":"none","text":"","aria":"Notifications"} list=Nothing new | RECORDED | s5-9-kestrel-bell-after-restore
S6 | iPhone | Hunter (Plan of 149): inputs page, whose people | EXPECTED 142's only | page=inputs Osprey(149)=false Kestrel(149)=false Hunter=false Saber=false Ranger=false head=Inputs Inputs SANS Medical 2 1 + Input 20 Nov → 4 Dec Calendar List Filters No inputs 20 Nov – 4 Dec. Try All dates. | RECORDED | s6-h-inputs
S6 | iPhone | Hunter (Plan of 149): leavewar page, whose people | EXPECTED 142's only | page=leavewar Osprey(149)=false Kestrel(149)=false Hunter=true Saber=true Ranger=true head=Grid Approvals 13 Balances OIL VIEW MY LEAVE LVE 20.5 · OIL 2.5 · 0 pending › ▸ Manning Bidding closed Legend JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC 2026 CS/Name +LVE JUL WED 01 THU 02 FRI 03 SAT 04 SUN 05 MON 06 TUE 07 WED 08 THU 09 FRI 10  | RECORDED | s6-h-leavewar
S6 | iPhone | Hunter (Plan of 149): quals page, whose people | EXPECTED 142's only | page=quals Osprey(149)=false Kestrel(149)=false Hunter=true Saber=true Ranger=true head=Edit Export to ExcelExport VIEWING Pilots WSOs Personnel All + Add person CALLSIGN/NAME▲ INITIALSFLIGHTCATSANSSXOMANAGEMENTSCHEDULERSC DAYSC NIGHTDAARNAARNVGIMCTFREMARKS ASSIGNED PILOTS · 34 Ace AA ✓ ✓ ✓ ✓ ✓ ✓ A · 4-ship FL Anvil IPIP ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ | RECORDED | s6-h-quals
Round | iPhone | row opened then closed by its header | open=1 then 0 | after open=1 after header again=0 | PASS | r1-open
Round | iPhone | row opened then Cancel | closed | open after Cancel=0 | PASS | r2-cancel
Round | iPhone | row opened then tap on empty page area outside | RECORD (closed?) | open after outside tap=1 | RECORDED | r4-tap-outside
Round | iPhone | search typed "Kes" then cleared by its x | rows 1 then many | rows typed=1 after x=-1 box=Kes | FAIL | r5-search-cleared
Round | iPhone | Suspend Osprey, Undo from top bar | dot green again | toast=Undid: suspending Osprey’s sign-in dot=g | PASS | r6-undo
Round | iPhone | Redo from top bar | dot red again | toast=Redid: suspending Osprey’s sign-in dot=r | PASS | r6-redo
Round | iPhone | Quals page after Osprey suspended | RECORD Osprey row | {"osprey":false,"len":2010,"head":"Edit Export to ExcelExport VIEWING Pilots WSOs Personnel All + Add person CALLSIGN/NAME▲ INITIALSFLIGHTCATSANSSXOMANAGEMENTSCHEDULERSC DAYSC NIGHTDAARNAARNVGIMCTFREMARKS ASSIGNED PILOTS · 34 Ace AA ✓ ✓ ✓ ✓ ✓ ✓ A · 4-ship FL Anvil IPIP ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓"} | RECORDED | r7-quals
Round | iPhone | search typed "Kes" then cleared by its x (re-run, selector fixed) | rows 1 then many, box empty | rows typed=1 after x=71 box="" | PASS | r5b-cleared

## Observations beyond the rows
- Archive asks NO question: one tap archives ("Osprey archived — his sign-in is suspended"); the row moves to "Archived · 1" list (toggle) showing "Archived 20 Nov 26 by Hunter"; opened, it offers Restore; Restore says "Osprey restored — he can sign in, and he'll be asked to check his quals and CAT".
- Delete: first tap turns the button to "Tap again to delete Osprey" with the words "Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can't be undone."; second tap deletes ("Osprey deleted").
- Undo/Redo after Enable: "Undid: enabling Osprey's sign-in" (dot red), "Redid: enabling Osprey's sign-in" (dot green); after Role Save: "Undid: Osprey's role" (back to Member).
- S2 (no Plan): the row still lists and opens; Suspend refused "He is 149's. Only an admin of 149 can change his account."; Archive refused "He is 149's. Only an admin of 149 can change him." Note: Admin -> Users lists 71 people incl. 149's Osprey and Kestrel for Hunter with or without Plan.
- S4 Saber: Role Member + Save also refused "Only a master admin can do that" (badge stayed Admin).
- S5 bell: Osprey filed an LL for Mon 20 Jul (clock pinned 17 Jul 2026 09:00; list showed "Osprey 20 Jul LL LATE till 20 Jul now No document"). Bell for Kestrel, Hunter, and Kestrel after archive/restore: no dot, "Nothing new" every time (desktop and phone).
- S6: Hunter's Inputs, Leave War and Quals show none of 149's people (no Osprey/Kestrel), Hunter/Saber/Ranger present (phone Inputs opened on an empty window "No inputs 20 Nov - 4 Dec", so names not testable there; see picture s6-h-inputs). Kestrel's Leave War lists Osprey on both sizes while archived (desktop picture s6-k-leavewar-archived: Osprey row hatched "PO" from 17 Jul with the LL on 20 Jul kept, balance -1/1) and after restore.
- Escape (desktop) and a tap on empty page area outside leave an opened row OPEN (recorded, not an expectation). Row also closes by header and by Cancel.
- Quals page after Osprey suspended shows no Osprey text (the page's text excerpt did not contain him; picture r7-quals) on both sizes — not investigated further; Hunter's Quals showed no 149 people at all (consistent with S6).

## Console errors
None on any run (errors [] every run).

## Not reached
- Osprey's row on Quals was not found (Quals shows 142 only for Hunter). Phone Inputs list for S6 was on an empty window.
- iPhone-specific search-x tapped by position, not by a control.
