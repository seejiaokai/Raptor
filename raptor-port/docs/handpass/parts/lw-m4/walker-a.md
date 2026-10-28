# M4 walk — walker A (Approvals on the desktop, 1536 x 860 at 1.25, admin) — 27 Oct 26

Build: the frozen bundle `index-CxJcpwed.js` on port 4173. Engine: Chromium. Pictures: `raptor-port/docs/img/handpass/2026-10-27-lw-m4/a/<run>/`
(runs `s1`, `s4`, `s4b`, `s4c`, `s6`, `s8`, `s9`, `s9b`, `s9c`, `s10`, side-by-sides with his drawings in `compare/`).
Scripts: `raptor-port/scripts/handpass/lw-m4-walk-a-s1.mjs`, `-s4`, `-s4b`, `-s4c`, `-s6`, `-s8`, `-s9`, `-s9b`, `-s9c`, `-s10`, helpers `-a-lib.mjs`, `-a-compare.py`, `-a-stack.py`
(`-a0` … `-a12` are looking scripts). Every run signs in on real storage, the member (Ranger) places his bids through the bid window, the admin (Saber) walks Approvals.
Every picture named below was opened and looked at.

Totals: **39 PASS, 6 FAIL, 1 NOT WALKED.**

## Results

Pictures are under `a/`. "Drawing" means his drawing `docs/mock/lw-overhaul/full/r22-*-desk.png`.

| Scenario | Size / engine | Verdict | Pictures | What the picture shows |
|---|---|---|---|---|
| 1a tab, page, header | desk / Chromium | PASS | `s1/a-s1-1-approvals.png` | Tab row Grid · Approvals 19 · OIL; header "17 pending · 10 new" and "+2 pending in JAN - DEC 27 ›". The tab counts every period (19), the header this one (17); the "+2" link says so |
| 1b oldest placed first | desk | PASS | `s1/a-s1-1-approvals.png` | The 11 Ranger lines are in the order the bids went in; demo requests with no Placed time come first |
| 1c halves written .5 | desk | PASS | same | No ½ anywhere on the page; "0.5 day" |
| 1d columns line up | desk | PASS | same | Every cell's edge measured on all 17 lines: spread 0 px for each column |
| 1e numbers agree with the grid / bid window | desk | PASS | `s9/a-s9-1-bidwin-14jan.png` | Wed 14 Jan: line "P 26", the grid's Available P row that day 26; line LVE BAL −4.5, the bid window's LL button "LL −4.5" |
| 1f set beside r22-1 | desk | FAIL | `compare/cmp-1-top.png` | Layout differs from his drawing — see F1 |
| 2a Approve one: lit, line stays | desk | PASS | `s1/a-s1-2-approved-12jan.png`, `s1/a-s1-13-lit-approved.png` | Solid green "Approved", Refuse dimmed, line in place |
| 2b counts fall by one | desk | PASS | same | Tab 19 → 18; "Approve all 17" → "Approve all 16" |
| 2c Undo near the foot: back to pending, page did not move | desk | PASS | `s1/a-s1-2-before-undo.png`, `s1/a-s1-2-after-undo.png`, `compare/s1-undo-before-after.png` | scrollY 546 before approve, 546 after approve, 546 after Undo; the Undo button stood in the bar (top 14); the line is pending again, its new dot back; toast "Undid: a decision on a bid" |
| 2d Redo: lit again, page still | desk | PASS | `s1/a-s1-2-after-redo.png` | Lit "Approved", scrollY 546 |
| 2e second tap after Redo sends it back (star 1) | desk | PASS | `s1/a-s1-2-after-redo-second-tap.png` | Pending again |
| 3a Refuse lights "Refused" | desk | PASS | `s1/a-s1-13-lit-refused.png` | Solid red "Refused", Approve dimmed |
| 3b second tap on lit Refuse → pending | desk | PASS | `s1/a-s1-13-back-to-pending.png` | Both buttons back to rest |
| 3c second tap on lit Approve → pending | desk | PASS | (read from the line: pressed false, "Approve") | |
| 3d lit state set beside r22-3 | desk | FAIL | `compare/cmp-3-decided.png` | The other button is dimmed, in the drawing it stays normal — see F3 |
| 4a Approve all: first tap arms, second (1 s later) approves every shown line | desk | PASS | `s4/a-s4-4a-armed.png`, `s4/a-s4-4a-all-approved.png` | Amber "Approve 12 — tap again"; then 12 of 12 lines lit green, button "Approve all 0" (greyed), tab 14 → 2 |
| 4b ONE Undo brings every line back | desk | PASS | `s4/a-s4-4a-after-one-undo.png` | 0 lit, 12 pending, tab 14 |
| 4c two taps under 150 ms: exactly one round | desk | PASS | `s4b/a-s4b-fast-after-taps.png` (also `-slow-`, `-mid-`) | Taps 78 ms apart: 6 of 6 lit and ONE Undo step; same one step for 1 s apart and 100 ms apart. (A first try in `s4` read a lingering toast as a second step; `s4c` shows approve, Undo, approve again, Undo leaves the Undo button off) |
| 4d armed, then the month chip → disarmed | desk | PASS | `s4/a-s4-4d-after-month-chip.png` | "Approve 12 — tap again" → "Approve all 6", not amber |
| 4e Undo steps after approve, Undo, approve again | desk | PASS | `s4c/a-s4c-undo-A.png` | One Undo, Undo button off |
| 5a month chip: approves exactly what shows | desk | PASS | `s4/a-s4-5a-jan-approved.png`, `s4/a-s4-5a-all-after-jan.png`, `s4/a-s4-5a-grid-feb-cell.png` | Jan chip: 6 lines, 6 lit; with All the 6 February lines are still pending; on the grid Ranger's 16 Feb cell is still dashed (waiting) |
| 5b Pick dates… a range (2–10 Feb) | desk | PASS | `s4/a-s4-5b-range-picked.png`, `s4/a-s4-5b-range-approved.png`, `s4/a-s4-5b-all-after-range.png` | The picker opens inline above the list and narrows it to 4 lines; Approve all 4 lights 4; 16 Feb and 24 Feb stay pending |
| 5c New: approves exactly the New lines | desk | PASS | `s4/a-s4-5c-new.png`, `s4/a-s4-5c-new-approved.png` | New 1 (Ranger 16 Feb) approved; demo 24 Feb untouched |
| 5d Pick dates closes on an outside press and on Escape | desk | PASS | `s4/a-s4-5d-open.png`, `-after-outside-press.png`, `-after-escape.png` | Both close it; focus returns to the Pick dates button |
| 5e "Also since you last looked" set beside r22-2 | desk | FAIL | `compare/cmp-2-also-since.png` | Layout differs — see F5 |
| 6a bid deleted on the grid: Back → Approve all disarmed and recounted, line "No longer there", buttons off | desk | PASS | `s6/a-s6-6-after-delete-on-grid.png`, `s6/a-s6-6-after-back-deleted.png`, `s6/a-s6-13-stale-gone.png` | "Approve 9 — tap again" → "Approve all 8" (grey); the line says "No longer there" in red, Approve and Refuse greyed, dates link still live |
| 6b refused on the grid: "Already refused by Saber", buttons off | desk | PASS | `s6/a-s6-6-after-back-refused.png`, `s6/a-s6-13-stale-refused.png` | As shown |
| 7a dates tap: grid at that day, cell ringed, slim bar up | desk | PASS | `s6/a-s6-7-grid-ring-350ms.png` | Grid tab lit, Mon 12 Jan cell (Ranger) in the blue ring, in view and not under the slim bar; slim bar "Approvals · 9 pending · 3 new  Back ▴ ✕" at the foot |
| 7b ring lasts about six seconds | desk | PASS | `s6/a-s6-7-grid-ring-gone.png` | Gone 6068 ms and 6153 ms after the tap (two runs) |
| 7c slim bar count equals the page header | desk | PASS | `s6/a-s6-7-before-dates-tap.png` | "9 pending · 3 new" both (after one line was approved) |
| 7d Back → list exactly as left | desk | PASS | `s6/a-s6-7-after-back.png` | Jan chip still on, Wed 14 Jan still lit, dots on the others, "Approve all 4", same |
| 7e ✕ leaves Approvals | desk | PASS | `s6/a-s6-7-after-x.png` | No slim bar, Approvals tab not lit, grid showing |
| 7f slim bar set beside r22-4 | desk | FAIL | `compare/cmp-4-slim.png` | Looks different — see F4 |
| 8a paperclip → viewer, read only | desk | PASS | `s8/a-s8-1-viewer-open.png`, `explore/a5-viewer.png` | Modal "Ranger · LL · Jan 12", "Placed by Ranger · 27 Oct 26, 19:34", the document, foot holds only "Close" (no "Edit input", no "Upchit"). The PDF body is blank because the test file is a stub, not an app fault |
| 8b press on another line behind the viewer | desk | PASS | `s8/a-s8-2-after-press-behind.png` | The press at the visible edge of Wed 14 Jan's Approve closes the viewer and presses nothing (14 Jan and 12 Jan both still pending); the viewer never showed another request |
| 9 two lines that join | desk | PASS | `s9/a-s9-9-after-placing-13.png`, `s9/a-s9-9-after-back.png`, `s9/a-s9-13-run-joined.png` | Mon 12 and Wed 14 Jan, Tue 13 Jan placed by Saber (Approve what I enter off); Back → ONE line "Mon 12 – Wed 14 Jan · 3 days", no "No longer there" line |
| 10 a SANS man off the war | desk | PASS | `s9/a-s9-10-approvals.png`, `s9/a-s9-13-sans-line.png`, `s9/a-s9-10-dates-tap.png` | Line "Jester B LL Wed 21 Jan · 1 day · −1 · SANS · not in Avail · by Saber"; his dates open his person window (balance tiles). See also F6. Reached with the gear's "Show SANS" button, not "+ SANS" (O3) |
| 10b person window over the slim bar | desk | FAIL | `s9/a-s9-10-dates-tap.png` | See F6 |
| 11 the day's list: Placed under EACH entry | desk | PASS | `s9/a-s9-11-daylist.png` | Ranger Mon 19 Jan: "Morning · pending — Placed Ranger · Tue 27 Oct, 19:54" and "Afternoon · pending — Placed Saber · Tue 27 Oct, 19:54", each above its Approve · Refuse · Move · Delete |
| 12g a man posting out in the future (Trident, from 1 Mar 27) | desk | PASS | `s9c/a-s9c-3-approvals.png`, `s9c/a-s9c-13-posting-out-line.png` | Under his puck, in amber: "posting out 1 Mar · Overseas Sqn"; his LOWEST AVAIL is empty |
| 12h Approve on a request after the posting-out date | desk | FAIL | `s9c/a-s9c-4-after-approve.png`, `s9c/a-s9c-13-posting-out-after-approve.png`, `s9b/a-s9b-po-15jan-after-approve.png` | Approve lights green with no message — see F2 |
| 12i Refuse works | desk | PASS | `s9c/a-s9c-5a-after-second-approve-tap.png`, `s9c/a-s9c-5-refused.png` | After Approve is sent back, Refuse lights "Refused" |
| 13a line states reached | desk | PASS | `compare/sheet-s1-lines.png` (pending, lit approved, lit refused, back to pending, half day, weekend run Fri 30 Jan – Mon 2 Feb, OIL, CCL, 2 documents, "by Saber"), `s1/a-s1-13-nodoc.png` (0 documents), `s1/a-s1-13-pending-LL.png` (1 document), `compare/sheet-s6-stale.png` (stale ×2), `compare/sheet-s9-lines.png` (run from bids at two times: 19:53 = the earliest; run joined; SANS), `compare/sheet-s9c-postout.png` (posting out), `s10/a-s10-2-approvals.png` (red Manning rows) | Each as its name says. Documents: no clip / clip / clip with a "2". Red rows: "P 19.5 / IP 8 / SXO 3.5" stacked, IP and SXO red. Amber was reached on the bid window's day line but never alone on a line, so a line showing only amber was not pictured |
| 13b "refused by the rules" (… already holds leave or a medical at that time — not approved) | desk | NOT WALKED | — | No control of the app puts an approved leave or medical beside a pending request that Approve then refuses (a clash replaces the bid; no one writes a medical on the war). The posted-out refusal that should show the same kind of line was not shown either (F2) |
| 14 "+N pending in JAN - DEC 27 ›" | desk | PASS | `s8/a-s8-14-before-link.png`, `s8/a-s8-14-after-link.png` | View → "JAN - DEC 27", header "2 pending", 2 lines (Trident 13–16 Apr, Cinder 5 May AM), Apr and May chips bright; the link now reads "+8 pending in JAN - DEC 26 ›" and goes back |
| 15 speed and nodes | desk | PASS | — | Tap to lit button, three runs, median 103 ms (67, 103, 103; first run 67, 92, 100). Grid nodes (`#page-leavewar *`) before Approvals 25148, after leaving 25148 |

## Faults

**F1 — The page is built a little differently from his drawing r22-1** (D1424; `compare/cmp-1-top.png`, `s1/a-s1-1-approvals.png`). Seen, measured in CSS px; drawing in brackets (his 1920-wide picture divided by 1.25):
- The card stands at x 12, y 122, 1512 wide; the drawing's card at x 21, y 136 to x 1516, and the grid card it replaces on the Grid tab also at x 21: the page sits 9 px further left, 8 px further right and 14 px higher, flush under the tab row instead of with a gap.
- Header: ours "17 pending · 10 new"; drawing "15 pending · 3 new since you last looked, Wed 7 Jan 16:40" — the words "since you last looked" and the time are missing (the page was opened for the first time, so there may be no time to give).
- The drawing has a thin upright line between the "New 3" chip and "DATES"; ours has none.
- The list is 1240 wide, the drawing 1208 (x 37–1245); the columns sit elsewhere: LOWEST AVAIL starts at 691 [584], PLACED at 861 [700], DAYS is right-aligned at 584 and its heading is left-aligned at 414 in the drawing, NAME starts at 47 [58], KIND 229 [188], DATES 293 [232], paperclip at 1001 [808], Refuse 1171 [1162]. Ours spreads the figures, the drawing packs them to the left.
- Sizes: Approve 100 x 36 [about 90 x 31], Refuse 100 x 36 [about 83 x 31], Approve all 130 x 36 [124 x 31], row pitch 54 [50].
- Data differences, not layout: "—" in PLACED for the six demo requests; the demo's red/amber rows are not there until a counter has amber/red points (set through its own window in `s10`).

**F2 — Approve on a request of a man who is posting out is accepted** (`s9c/a-s9c-4-after-approve.png`, `s9c/a-s9c-13-posting-out-after-approve.png`; also `s9b/a-s9b-po-15jan-after-approve.png`). Steps: sign in as admin; Approvals → "+2 pending in JAN - DEC 27" → Grid; Trident's cell on Mon 1 Mar 27 → ⋯ → Post out (Overseas Sqn, from 1 Mar 27) → Post out; Approvals: his line is tagged "posting out 1 Mar · Overseas Sqn" (good); press Approve on his request of 13–16 Apr. Seen: the button lights "Approved", no words on the line. Expected (brief 12, designer 21): "Posted out — refuse or delete it" on the line, nothing approved. The same with Blade posted out from 15 Jan against his 2 Feb request (a date already past on the real clock, so the posting ran at once): no tag, LOWEST AVAIL empty, Approve accepted. Refuse works (after the lit Approve is sent back).

**F3 — A decided line dims the other button; in his drawing r22-3 it stays normal** (`compare/cmp-3-decided.png`, `s1/a-s1-13-lit-approved.png`, `s1/a-s1-13-lit-refused.png`). Seen: with "Approved" lit green, Refuse is greyed almost to the background and cannot be pressed (disabled); with "Refused" lit, Approve is greyed likewise. Drawing: the lit button solid, the other an ordinary bordered button. Consequence: to change an approval into a refusal he must tap the lit button first, then Refuse.

**F4 — The slim bar differs from r22-4** (`compare/cmp-4-slim.png`). Ours: a bar about 760 wide with a cyan edge, "Approvals" in small bold, the counts after it, "Back ▴" in its own bordered box and ✕ in a boxed button. Drawing: a compact pill about 370 wide, "Approvals" larger and bold, "15 pending · 3 new" in grey, "Back ▴" plain cyan words and a plain ✕, no cyan outline.

**F5 — "Also since you last looked" differs from r22-2** (`compare/cmp-2-also-since.png`, `s4/a-s4-5c-new.png`). Ours: each row's dates link stands on its own line above the row's middle (dates higher than the message), the message "Filed on the Inputs page · approved" at x 636 and the time at the right edge (x 1143), the kind box filled; drawing: dates, message and time on one centre line, the message under DAYS (x 414) and the time under PLACED (x 700), same header words. Also, with New chosen the header in the drawing carries "since you last looked, <time>", ours none (as F1).

**F6 — The person window covers half the slim bar** (`s9/a-s9-10-dates-tap.png`). Steps: a SANS man off the war (Show SANS off) with a pending request; Approvals; press his dates. Seen: his person window opens and its lower edge lies over the slim bar so "Back" reads "ack ▴" and the bar's words are cut; the grid behind has moved to 14 Jan and no cell is ringed. Expected (D1231): his person window; the slim bar not hidden.

## Observations (not counted as faults)

- O1 The tab's count (19) covers every period while the header's (17) covers the one on view; the "+2 pending" link says where the rest is.
- O2 Brief 10 says "⚙ → + SANS … the SANS group's ✕". This build's gear still has the single "Show SANS" button ("✓ SANS shown" when on) and no "+ SANS"/group ✕ (D1221 not in this build); walked with that button.
- O3 A SANS man's puck on his Approvals line has no purple edge (D1180 names one); the grid's own SANS pucks were not looked at.
- O4 The dates tap parks the target day at the frozen columns' left edge (ring's left edge 1 px from the frozen name column); the ring is whole and visible. Left to walker B (lesson 5).
- O5 Armed Approve all is amber ("Approve 12 — tap again"); his drawing r22-3 draws it cyan. The brief names amber, so not counted.
- O6 Placed reads "27 Oct 19:42" on Approvals and "Tue 27 Oct, 19:42" in the bid window; both carry the same time. A request joined from bids of two people shows the earliest time and no "by".
- O7 Pressing the page behind the paperclip viewer closes the viewer and passes nothing through.
- O8 Lowest Avail with amber/red rows is shown stacked (P, IP, SXO), red words in red, as the drawing; only red was pictured.

## Console

Errors, page errors and 4xx answers across all runs: none.

## Lessons 6 and 7

Nothing in this part touches the phone's own scrolling or the keyboard: Approvals on the desktop adds no scroller of its own (the page scrolls the window) and no text box, so lessons 6 and 7 hand nothing to walker A. Lesson 4 was walked (viewer over Approvals, 8b), lessons 1, 2, 3 and 5 as in 13, 4c, 2c and 7a.
