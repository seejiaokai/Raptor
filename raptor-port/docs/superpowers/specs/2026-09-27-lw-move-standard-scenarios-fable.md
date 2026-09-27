# [LW-MOVE-STANDARD] — the scenario design (Fable 5.1, 27 Sep 26)

Bug-check order §4 rank 1: the model that does not build designs the scenarios, from what was PROMISED (D264–D266,
with D260 and D262), before the build. Read-only; nothing run. Commissioned while the owner looks at the mock-up
(`raptor-port/docs/mock/lw-move-standard.html`); his answers to its questions are still open. The report is kept
whole below. **How the host takes its six contradictions (§5)** is at the foot — each either stated to the owner on
the mock-up page as a reading he can correct, or put to him.

---

SCENARIO DESIGN — [LW-MOVE-STANDARD] (D264–D266, with D260/D262). Read-only; nothing run.

What I read: leave-war.md D262–D267, oil.md D260–D261, the two backlog items, the mock-up page and 7 of its pictures, ui-contracts §Selecting on the Leave War grid, the one-absence register §12, store.ts (move / clear / decide bodies, occupancy), Matrix.tsx (which sheet a tap opens, move mode, the guards), BidPicker / SelectSheet / DayList, select.ts wireMove, dayview.ts, stages.ts, sync.ts moveApproved, the four move/clear test files.

The root, in one line: today every grid move (`isMovableSource`, `moveProblem`, `moveCells`, `movableCells`) reads the day's TOP record; only the day's list moves by record id, and only for approved leave. The build turns "cells" into "records". Every scenario below is aimed at a door that still reads the day instead of the record.

## 1. ROLL-CALL

**Records that can sit on a day** (ladder order: approved/filed leave → medical → OIL credit → course/OD → bid → refused bid → notice):

| Record | May move? | May be deleted? | Door that must offer it | Must not / because |
|---|---|---|---|---|
| Undecided bid, whole | admin (every stage but draft); member on his own row while open, inside the window | same | one-day sheet (alone on the day); day's list (with others); block | lands undecided; dotted "moved" mark only when moved at closed/published |
| Undecided bid, AM / PM | same | same | same; lands only where THAT half is free | a whole-day landing refuses it |
| Acked bid | same | same | same | a move lands it undecided again (D262 b) |
| Refused bid (history) | TODAY: yes when alone (one-day sheet) — it lands as a LIVE bid; in the list: no Move | yes (list Clear; block Delete takes it) | — rulings silent (contradiction 2) | |
| Leave the war approved, whole or half | admin at open/closed only (not draft, not published — finished paperwork) | admin, same stages | one-day sheet (alone); day's list; block | moves through the Inputs door; remarks kept, "till" rewritten |
| Leave filed on the Inputs page | must not — "Change it on the Inputs page" | must not — stays, counted as nothing | none; every door leaves it and says so | |
| Medical (ATT C / HL / OML) | must not | must not | none | a bid may sit in its OTHER half — that bid must still move |
| Course / OD | must not | must not | none | a bid may sit BESIDE it (no clash) — that bid must still move |
| OIL award (admin's) | must not (D260) | admin only: block Delete / one-day Delete NAME it first; the list's own button | the confirm on both sheets; the list line | a member's Delete never takes it |
| OIL the schedule earned | must not | must not (the schedule's) | none | |
| "Your bid was replaced" notice | must not | not by Delete — only "OK, seen" | list only | survives a block Delete |
| Day after post-out / before post-in | (a cell state) an admin's tap opens the POSTING sheet, not a bid door | — | a bid landed there is reachable only by a block or a `+1` list (S26) | |

**Doors**: one-day sheet (only ever a one-record day); day's list (2+ records, or leave outside his squadron dates); the block; the landing — desktop click or drag-release, phone tap then Confirm; Undo (one step per move; ends a move in progress); a stage/war change, leaving the tab, Escape, mouse right-click, an empty click outside the grid (all end it).

**Roles × stage**:

| | One-day sheet | Block | Day's list |
|---|---|---|---|
| Admin open/closed/published | Move+Delete on a bid; on approved leave at open/closed only | Move… on bids at ANY stage; leave as left | Move on each bid (new); leave's Move… (date box → move mode) |
| Admin DRAFT | no Decide row → NO Move; Clear yes | Move… YES today | Clear only |
| Member own row, open, in window | no Move today (question 3); Clear yes | Move… and Delete yes (no awards) | Clear on own bid; no Move today |
| Member own row, closed | sheet does not open | drag disabled | list opens read-only (OK seen / Note) |
| Member elsewhere | nothing opens | cannot select the row | nothing |

## 2. TWO MOVABLE RECORDS ON ONE DAY

The store allows one live bid per half, so two movables share a day only as halves. The one-day sheet never sees these (2 records → the list).

| Combination | Day's list | Block | Banner count | Landing |
|---|---|---|---|---|
| AM bid + PM bid | Move on each; picks THAT one | both travel | 2 (list: 1) | each where its half is free; both onto one day is fine |
| Approved AM leave + PM bid | Move on each (leave by the Inputs door, bid by record) | both travel — TODAY only the leave moves, the bid is left | 2 | the leave refuses on a locked week / published; see contradiction 4 for whether the bid then still goes |
| Award + bid (Vector 3 Jan) | Move on the bid; none on the award | bid alone — TODAY no Move… at all | 1 | may land beside another award; the box then shows the award on top with `+1` |
| Inputs-filed AM leave + PM bid (Ghost, W3-F3) | Move on the bid only | bid alone — TODAY "move 2 entries", bid stays | 1 | |
| Refused bid + new bid | Move on the new bid; the refused one — owner's call | new bid only | 1 | a block Delete takes both, history included |
| Course, or earned credit, or morning medical + bid | Move on the bid | bid alone | 1 | |

## 3. RANKED FAILURE SCENARIOS (most likely missed first)

Setup → action → expected → what disproves it. Demo world, January, admin unless said.

1. **Bid beneath an award, the list.** Vector 3 Jan (FO award + LL bid). Open the list → the LL line has Move → press → list closes, banner "Tap a day to move 1 entry" → click 5 Jan. Expect LL undecided on 5 Jan, FO still 3 Jan. Disproof: no Move; "0 entries"; the FO moves; both move.
2. **Same day, a block.** Drag Ryder–Wisp 3 Jan → Move… offered; ghost/banner say 1 → land. Disproof: Delete only; count 3 (cells); award gone.
3. **Land beside an award.** Vector: FO on 3 and 10 Jan, LL bid 4 Jan. Block 4 Jan → Move → 10 Jan. Expect LL lands beside the FO; box shows FO `+1`; the list shows both. Disproof: "already has something on that time"; the award replaced.
4. **Dotted "moved" mark hidden.** Bidding CLOSED; move a bid onto a day holding an award (or a course). The mark and the sheet's "moved from" read the day's TOP record (award), so nothing shows the bid was moved. Expect a trace — the mark, or "moved from" on the list line. Disproof: no trace anywhere.
5. **Both halves at once.** Ryder 6 Jan `*LL` + `LL*`. Block → Move… → banner 2 → land 8 Jan → both on 8 Jan, one Undo returns both. Disproof: count 1; one half lands; two Undo steps.
6. **One half from the list, then landings.** Same day → list → Move on `*LL` → count 1 → click a day whose PM holds a bid: lands. Click a day with whole-day approved leave: refused, reason in banner, mode stays. Disproof: the PM day refuses; the leave day accepts.
7. **List Move of one of two, then Undo.** After 6, press Undo → the AM bid back beside the PM bid, `+1` back; the Undo also ends any move still on. Disproof: the day reads one bid; a picked-up ghost survives.
8. **Approved AM leave + PM bid, block.** Ryder: approve `*LL` on 6 Jan, bid `LL*` beside it. Block 6 Jan → Move → 9 Jan. Expect BOTH move ("2 entries"), leave through the Inputs door with "till" rewritten, one Undo. Disproof: banner "2" but the bid stays (the W3-F3 shape).
9. **Same day, the leave from the list.** List → the leave's Move → NO date box; move mode; land → the Inputs row re-dated; at closed, the moved-from trail. Disproof: date box still there; the list's Move picks the bid.
10. **Approved leave beside Inputs-filed leave** (Ghost: file `*LL` on Inputs, approve a PM bid). The list's Move on the approved one must still work once it runs through the grid's move mode — today that mode refuses a two-absence day as "raptor" while the list's by-id move works. Disproof: "That leave was filed on the Inputs page" / a raptor refusal.
11. **Pick a range → Move.** Ryder LL 4, 5, 6 Jan (one-record days). Open 4 Jan → Pick a range 4–6 → Move → banner 3 → land 12 Jan → 12–14. Disproof: only 4 Jan moves (today `onMove` carries one cell).
12. **Pick a range → Decide.** Same → Approve → all three approved. Disproof: one approved (today the Decision row acts on the tapped day only).
13. **Pick a range → Delete with an award in the span.** First tap names the award and takes nothing; the note says "Delete also takes…" not "Clear also takes…"; second tap takes all. Disproof: the word Clear; award taken on the first tap.
14. **A range sweeping empty and award-only days.** Range 3–6 Jan where 3 holds an award, 4 a bid, 5 empty, 6 a bid → Move count 2, anchor = 4 Jan lands on the tapped day, 6 keeps its gap. Disproof: count 4; refused "nothing".
15. **Member's Move (question 3).** Sign in as Ranger, OPEN: his LL 6 Jan → sheet → Move → lands undecided, NO dotted mark, none appearing when the war later closes. Same at CLOSED: his tap opens nothing; no Move anywhere. Disproof: mark shows; a Move at closed.
16. **Member lands over another row.** Ranger moving his bid, pointer over Saber's row on 9 Jan → lands on HIS row 9 Jan (a move is by date). Disproof: on Saber's row.
17. **Member moves his ACKED bid at open** → lands undecided (purple → magenta). Existing rule; see contradiction 5 — the disproof either way is "nothing tells him".
18. **Phone two-step from the list.** Narrow to phone → Vector 3 Jan list → Move → tap 5 Jan → "Move 1 entry here?" + Confirm; tap a day whose whole day is taken → the reason where Confirm would be, no Confirm; Confirm on 5 Jan lands. Disproof: lands on the tap; Confirm under an error.
19. **Double-tap guard from the list's button.** Quick tap on the day under where the list's Move sat (<400ms) → nothing lands, mode stays. Disproof: a chip lands under the button's spot.
20. **Desktop press-and-drag after a list Move** → release over a day: lands; release off the days: nothing, mode stays.
21. **Published war, block over approved leave + a bid on another day** (Ryder leave 6 Jan, bid 8 Jan). Expect: Move… offered; the bid moves with the dotted mark, the leave stays and is SAID (or the whole block refused with a reason naming the leave — contradiction 4). Disproof: silent "raptor" refusal; or the leave moves.
22. **Published, Delete of that block** → bid and any award go, the leave stays, note says it was skipped (re-walk of D260).
23. **Banner vs ghost count.** Block over 3 Jan: ghost "Move 1 entry" and banner 1; two-bid day: 2. Disproof: ghost counts cells.
24. **Move ends on a war switch / Undo / stage step.** Pick up a bid (from the list), then: Period picker → another war; or Undo; or reopen bidding. Expect the mode ends, nothing lands. Disproof: the ghost survives and a click lands on the new war.
25. **Stale record.** Pick up bid A (desktop); open ⚙ Settings (a sheet — taps ignored) and close it → mode still on, count still 1, landing works. With record ids, a record gone meanwhile must end the move with a word, never "0 entries" then a silent nothing.
26. **Land on a greyed posted-out day.** Admin moves a bid onto a day after the man's PO date → lands (posting dates gate nothing, N8/N12) → the admin's tap there opens the Post-out sheet, so the chip has no one-day door. Observation: a stranded chip; only a block or a `+1` reaches it.
27. **Bid beside a morning medical.** Inputs: ATT C 09:00–12:00 for Vector 7 Jan; bid `LL*`. List → Move on the bid → lands only where PM is free; a day with an afternoon medical refuses naming its hours; the medical never moves. Disproof: "Filed on the Inputs page" refusal.
28. **Bid beside a course / beside the schedule's earned credit.** Same shape as the award: Move on the bid; the course / credit stays; a block Delete takes the bid and never the earned credit. Disproof: no Move (the day's top is the course).
29. **Whole-day bid onto a half-taken day** (approved `*LL` there) → refused whole "already has something on that time"; phone stages no Confirm.
30. **Draft stage.** Step the war back to draft; block over a bid shows Move… today; the one-day sheet has no Decide row and no Move. Under D264 both doors must agree (contradiction 1). Disproof: they differ.
31. **Member's block Delete with his own award in it** → no award clause, the award stays; his bids go.
32. **Refused bid + new bid.** Refuse Vector's `*LL`, bid `LL*`. List: the new bid has Move; the refused line per the owner's answer; block Move count 1; block Delete takes both — the note should say the refused history goes too. Disproof: the refused bid is picked up and lands LIVE.

## 4. EXPLICIT NEGATIVES

- `shiftBid` (the old single-bid mover) has NO production caller — only tests. It still reads the top record; if left as is it is a second door that drifts. Retire or align.
- The landing rule needs no change to land beside an award: a credit never bars a write, and the half check looks only at live requests. I found nothing there.
- Row protection: `canEditRow` sits at the write path of the move, the clear and the range write; I found no path letting a member reach another man's row from any door.
- The dotted mark is RECORDED only at closed/published (`biddingClosed` in `moveCells`); a member's open move can never record one. Nothing wrong found — only the DISPLAY gap in S4.
- Undo: a block move is one gesture (`lw.move`), the leave's door inside it; I found nothing that splits it into two steps.
- The move-ending guards (stage, war, Undo, leaving the tab, Escape, right-click, empty click outside) all hang off `moveSel`; a list-started move that sets the same `moveSel` inherits every one. Found nothing missing IF it does.
- The phone Confirm previews through `moveProblem`, the same body the commit uses; I found nothing that could stage a landing the commit then refuses — except a record vanishing in between (S25).
- The notice survives a Delete: `clearRequestsAt` strips requests (and awards) only. Assumption not read in full: `setCell('')` on a plain day — I did not open its body.
- "PO" replacing "Post out (PO)…" on the block: a label only; nothing else reads it.

## 5. WHERE RULINGS, MOCK-UP READINGS AND CODE DISAGREE (the owner decides)

1. **Who may Move, by door.** One-day sheet: Move lives inside the Decision row → admin, never at draft, never a member. Block: Move… follows `movableCells` → admin at ANY stage incl. draft, and a member on his own row while open. D264 says the same buttons in the same place; question 3 covers the member, nothing covers draft.
2. **A refused bid.** Alone on a day, today's one-day sheet moves it and it lands as a LIVE undecided bid; in the list it has no Move. D262/D265/D266 say "a record that can move" without saying whether history is one.
3. **The award's own Delete in the day's list** removes it at once with no naming. D260's "names it first, asks once" is written for the bid sheet's Clear and the block's Delete; with one word "Delete" on all three, one of them behaves differently.
4. **"Travels alone" vs "refused whole".** D265 says the record that can move travels alone; D265 (1) / D266 (3) say a landing is refused whole with its reason. For a block holding a bid AND a leave that cannot move (published war, or a locked week) today refuses the whole block as "raptor"; the mock-up's "Move's rules don't change" does not say which wins at the SOURCE end.
5. **An acked bid moved by its owner while open loses its Ack** (D262 b: "it lands undecided"). The 27 Aug rule calls an open-stage shuffle "ordinary tidying"; whether a member's tidying should cost the Ack was never asked.
6. **"Pick a range widens the selection"** is the mock-up's reading; today's code applies the range to Clear only — Decide and Move act on the tapped day. Not a rulings clash, but the largest unbuilt reading on the page, and question 1's order A/B does not settle it.

---

## How the host takes §5 (27 Sep 26)

Each is settled by applying his rulings the same way at every door (D264: "a standardised format and look"), and stated
to him on the mock-up page ("What I read into your words") so he can correct it — none is a new product direction:

1. **Every door follows the store's one rule for who may move** (`movableCells` / the record-level check that replaces
   it): the admin at every stage the store lets him write; a member on his own row while bidding is open (question 3).
   The one-day sheet's Move leaves the Decision row, so it no longer inherits the Decision row's "never at draft".
2. **A refused bid is a record that can move** (D265 read literally; the store moves it today, alone on a day): it gets
   Move on the day's list too, and lands undecided — a move is a proposal (D262 (b)). Stated to him.
3. **The award's own line on the day's list** deletes it at once: pressing Delete ON the award's line names it by
   construction; D260's ask-first is for a Delete that takes an award the person did not point at. Unchanged.
4. **The records that can move travel; what cannot stays, and the banner says what stays** (D265: "travels ALONE");
   the landing is still refused whole when a moving record cannot land (D265 (1)). Stated to him.
5. **A moved bid lands undecided**, whoever moves it (D262 (b), unchanged). Stated to him.
6. **Pick a range widens the selection** — already on the page as a reading.
