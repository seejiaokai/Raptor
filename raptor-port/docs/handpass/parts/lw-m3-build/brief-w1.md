# Walker 1 — the Leave War side (read `brief-common.md` first)

Scenarios from `designer.md` table (b), with these EXPECTED lines checked against the rulings on 25 Oct 26 (where one
differs from the designer's "Right if…", this one stands):

| # | Size | EXPECTED |
|---|---|---|
| 1 | phone (Chromium + WebKit for the taps) | Approve solid green reading "Approved", Refuse grey with red words; a second tap on Approve → back to waiting, both grey (D1361, D1330). After each: Undo, Redo, reload — the cell and the window agree |
| 2 | phone | Refuse solid red "Refused", the leave's button ringed; a second tap → waiting, nothing lit; the grid's box goes from struck grey back to pending (D1361, D1355) |
| 3 | desktop | both orders on one bid, in the one-day window AND the day's list: never two lit; the two windows agree after each tap |
| 4 | phone | a drag over three days (approved + pending + refused) — nothing lit in the drag window |
| 5 | phone, member | his own refused bid: nothing lit, no ring |
| 6 | phone | words typed on the morning go on the morning bid only; the afternoon bid keeps its own words |
| 7, 8 | phone | the bubble at the foot of the screen, red, "This bid: Available P 27 → 26" (its figures as read); Show › only while the Manning rows are out of view; Show takes him there and the bubble goes; no stray window opens (D1358, D1364) |
| 9 | phone | with a day panel resting at the foot, the bubble stands just above the panel, both pairs, each its colour, the box the worst colour; nothing of the panel covered |
| 10 | desktop | a second bid on a red day raises it again with its figures (D1345) |
| 11 | phone | a refused bid on a red day sent back to waiting (second tap on the lit Refuse): the bubble comes as the window closes (pinned by a unit test today — walk it once) |
| 12 | phone | Undo then Redo of a bid that turned a row red: RECORD whether a bubble comes on Redo (as built: none — the agent's reading) |
| 24 | phone | ⋯ → Other, Duration AM, Remarks "Brief": a morning OTH box (outlined, top half), Available −0.5, no approval; the Inputs page shows it under Unavailable, AM, "Brief" (D1365) |
| 25 | phone | a tap on 24's day: the bid window opens on the afternoon, with one line — the OTH box, "Morning", "Brief", "change it on the Inputs page"; an afternoon bid placeable (D1371) |
| 26 | phone | a whole-day TRG under Unavailable (make it: W2's route is the schedule's "→ Unavail" — or file a Training on the Inputs page and press "→ Unavail" on Edit Schedule yourself): a tap opens the day's list, read only, its remarks |
| 27, 28 | desktop | 27: the free days filed, the OTH day "already holds an Other — left as it is", two inputs; 28: one input a man, one Undo takes back all, no Post out over several men |
| 29 | phone | ⋯ → Other on a Saturday: the OIL question opens once it is filed; answer Yes; nothing doubled |
| 31 | desktop | a drag over a day holding a whole-day TRG under Unavailable → LL: the bid placed beside it, two entries (as a course) |
| 33 | desktop | LL bid run 29–31 Oct continuing 1–2 Nov, one remark: RECORD whether the bar runs on across the month's edge or ends square at it (a picture of each side) |
| 34, 35 | phone | two separate filings Mon and Tue: two boxes, not joined; a drag across a joined bar shows the days as their own boxes with cyan, and the bar joins again on release — drag at a person's speed AND slowly (§7.11 lesson 2) |
| 36 | desktop | D1362: two grey lines with their dates over an empty Remarks box; the entry with no remark not listed; type "Away" → Approve → both carry "Away", still separate; over one entry the box shows its words |
| 37 | phone (Chromium + WebKit) | tap every control of a bid window, the day's list and the bubble, pointer left on each: no tint or see-through cell only the pressed state shows |
| 39 | desktop | Legend: "Under Unavailable on the schedule" with the outlined box after Overseas duty; the Codes list all eight (OTH ATCH TRG MTG PERS APPT DTY EVT); no UNA anywhere |
| A1 | phone | admin, a free day of Drifter → ⋯ (it reads Attach, Other, Post out, Post in) → Duration PM, Remarks "Exercise" → Attach: the window closes; an afternoon ATCH outlined; Available −0.5; on the Inputs page an Attach under Unavailable, PM, "Exercise", no "To" (D1378, D1380) |
| A2 | phone, member | Ranger on an open day of his: the row CSE · OD · (empty) · ⋯; the ⋯ holds Attach alone; it files a whole-day ATCH on his row (D1379) |
| A3 | phone, member | Ranger on a day closed for bidding: the note, CSE · OD · ⋯ → Attach files a whole day (D1379) |
| A4 | desktop | admin, a drag over one man, two days → ⋯ reads Attach, Other, Post out → Attach: one input over both days, two ATCH boxes joined as one bar |

Roll-call rows to mark from what you see: the grid cell (whole, half, two entries), the day's list, the one-day window
(admin, member), the drag window, the closed-day window, the free-half window, the day panel's Away list, the Legend and
Codes (R10), the bubble (phone, desktop, rows in / out of view), R12 (the OIL tracker and balance bar unchanged by an
OTH / ATCH), R13 (a member's My leave and his own row), R14 (pinned cells with a decided button or the bubble up), R16.
