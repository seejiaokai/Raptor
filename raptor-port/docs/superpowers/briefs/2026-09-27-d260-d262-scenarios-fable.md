# D260 / D261 / D262 — test scenarios (Fable 5.1, 27 Sep 26, read-only)

Method: bug-check order §4 rank 1 (find what is MISSING, not review what is there) and §6 (the roll-call). D56 applied: nothing
below is about data already stored. **State of the tree when read:** D260 is IN FLIGHT in this worktree (uncommitted:
`BidPicker.tsx` Clear confirm + `clearAsked`, `SelectSheet.tsx` Delete confirm, `store.ts awardsIn` / `isAward` /
`clearRequestsAt(…, awards)`, `awardwords.ts`, `awardclear.test.tsx`, `inputgate.test.ts`); D261 and D262 are not started.
The scenarios below target the rulings, and where they target the in-flight code they say so.

**Demo people used** (seed id → callsign after the re-key; JAN–DEC 26 is OPEN, bidding window 1 Jan–31 Mar 26; a JAN–DEC 27
war exists): SLIPWAY FO award 3 Jan · *OIL bid pending 10 Feb · HO award 18 Apr · OL approved (war) 1 Jan. PROWLER FO awards
1 Jan, 4 Jan, 7 Feb, 21 Mar. AMMO FO award 3 days 4 Jul "Exercise recovery" by OC Ops beside the schedule's own credit (a +1
day, the credit on top) · HO award 8 Aug. SLASH LL pending 2 Feb · LL* pending 3 Feb · FO award 9 May · OIL approved 1–3 Jun.
DIVOT HO award 3 Jan · FO 29 Aug. PIKE FO award 10 Jan · OIL approved 14 Jan. BRUISE *LL pending 23 Jan · OIL acked 24 Feb ·
LL refused 9 Jan. WOLF LL pending 8 Jan · ATT C 5 Jan (Inputs-filed). Admin `ad`/`a` = SABER; member `us`/`us` = RANGER
(no demo records — the admin gives him awards first).

Two facts that shape everything: (1) the ladder puts a CREDIT above a BID (`dayview.ts levelOf`: credit 3, request 6), so on a
day holding both, the award is the "main" record and `movableCells` / `shiftBid` see nothing movable; (2) a day with more than
one record always opens the TAP LIST, never the bid sheet, so the bid sheet's Clear and its new Move exist only on
single-record days.

## 1. Roll-call

### D260 — every door that can remove a hand-given award
| door | removes the award? | must (D260) | state |
|---|---|---|---|
| Bid sheet **Clear**, one day (`bid-clear` → `clearCells` → `setCell('')`) | YES (admin) | name it, ask once | in flight — asks via `awardsIn` |
| Bid sheet **Clear** with "Pick a range" (`setCellRange('')` → `writeMany`) | YES, every award in the span | name each, ask once | in flight — asks on `spanCells` |
| Drag-selection **Delete** (`sel-delete` → `clearCells`) | YES, every award in the block | name each first, ask once | in flight — `awardsClause` in the confirm; Delete now offered on a block of awards alone |
| Drag-selection **Fill** (a leave code over an award) | NO — `setCell(code)` replaces requests only; the award stays (N16) | must not | correct; negative |
| Tap list **Clear** on the award's own line (`dl-clear-<id>` → `clearRecordById`) | YES, that one record | the line names itself — no confirm (my reading; see §4) | unchanged |
| +OIL panel **Remove** (`oil-clear` → `clearRecordById`) | YES, that one record | N11's door — unchanged | unchanged |
| Bid sheet one-day **Move** / drag **Move…** / tap-list **Move…** | NEVER (a credit is not a movable source) | must never | correct; S20 checks the count and the landing |
| **Undo / Redo** | restores / re-removes | one Undo brings EVERY award back | `clearCells` is one gesture; the door's removal must be in the same envelope (S19) |
| OIL tracker | edits only (days / reason / giver) | no remove door here — fine | unchanged |
| Inputs page, schedule, exports | never touch a war award | — | negative |

### D261 — every place a member meets his OWN award
| place | today | D261 requires |
|---|---|---|
| Day cell, single record, stage OPEN, inside the window | opens the bid sheet; the award reads at its foot (Reason / Given by / Days); Clear present (refused with "Nothing here can be cleared") | keep the read-back; Clear must not name or take the award |
| Day cell, single record, OPEN outside the window / CLOSED / PUBLISHED / DRAFT | NOT openable (`cellOpenable`: no branch) | opens a read-only sheet — reason, giver, days, ✕ — no Edit / Clear / +OIL / leave chips / range / decision row |
| Day cell with several records (+1: award + his bid, award + the schedule's credit) | the tap list opens at EVERY stage already (a marked day always opens); the award block is read-only for a member | unchanged — verify at CLOSED and PUBLISHED |
| Another man's award (single record) | nothing opens | unchanged |
| Another man's award on a marked day | the tap list, read-only | unchanged |
| OIL tracker ("OIL" button), the balance column, the figures drawer | show the award and its facts | unchanged |
| His own EARNED credit (the schedule's) | the Raptor sheet, read-only, every stage | unchanged — the model for the new sheet |

### D262 — every starter of a move, and every surface that must respect move mode
Starters: (1) bid sheet decision-row **Move** (`decide-shift`, admin, single-record biddable day) — NEW: straight into
`moveSel`, the date box (`shift-date`) removed; (2) `DecisionSheet` — **not mounted anywhere** (Matrix comment: kept
exported for tests) — a dead door, not a starter; (3) drag-selection **Move…** (`sel-move`) — gains edge scroll / months /
outside-click; (4) tap list per-record **Move…** (`dl-move-<id>`, war-approved leave on a multi-record day, its own date
box) — not named by D262; (5) the event sheet's Move (shares `wireMove`) — gets whatever `wireMove` gets; say so.
Must respect move mode: every day cell (lands); the placeholder columns of undrawn months (must not land or throw); the month
strip (keeps — note it sits INSIDE `.mx-wrap`, sticky); zoom − / +; Manning; ⚙; OIL; Rearrange ⇅; a name in the frozen
column (person sheet); a balance box (figure sheet); the figures drawer; the counts rows; the event rows (`dateAt` reads
`cell-` only — nothing lands); the banner's Cancel / Confirm; the top bar Undo / Redo (ENDS, `histEpoch`); the Period picker
(ENDS); the stage control (ENDS); the app tabs (page dozes, listeners stay live — S9); Escape and right-click (cancel, as
today); the four edge bands (left band starts past the frozen columns / open drawer — `leftEdge`); the empty page
background (CANCELS — the ruling's case); a sheet opened mid-move and its scrim (must not read as "empty area").

## 2. Door check (A admin, M member; D 1440, P 390)
| action | control | draft | open, in window | open, outside | closed | published |
|---|---|---|---|---|---|---|
| Clear one day with an award | bid sheet Clear | A asks+takes; M — | A asks+takes; M refused, no ask | A asks+takes; M cell not openable (D261: read-only sheet) | A asks+takes; M read-only | A: approved leave opens the NOTE sheet, so no Clear on such a day; award-only day asks+takes; M read-only |
| Delete a block with awards | drag Delete | A names+takes; M no drag | A names+takes; M drags own row, no award named or taken | A; M no drag | A; M no drag | A names award, published leave STAYS (S18); M no drag |
| Move one chip | bid sheet Move (new) | A: decision row absent at draft (`canDecide`) — no Move; M — | A yes, lands pending, no mark; M no Move on the sheet (drag Move… only) | A yes; M — | A yes, dotted mark; M — | A yes on a PENDING bid, dotted mark; approved leave opens the note sheet |
| Move a block | drag Move… | A | A; M own row while open | A | A | A (pending bids only) |
| Open own award read-only | cell tap | M (new) | M bid sheet w/ read-back | M (new) | M (new) | M (new) |
Widths: every row at D and P; on P the phone keeps tap-then-Confirm for every landing.

## 3. Ranked failure scenarios (most likely to be missed first)

**S1 · D262 · Desktop: the second click of a double-click on Move lands the chip.** Setup: admin, JAN–DEC 26, tap SLASH
2 Feb (LL pending) → sheet → double-click Move. The sheet unmounts on the first click; `wireMove`'s document capture `click`
listener is attached by the effect before the second click arrives, and lands on whatever day is under the button (a row
low on the screen). Expected: picked up, nothing lands until a deliberate click on a day. Disproof: SLASH's LL sits on a
day that was under the Move button, banner gone. Same for the drag-selection's Move… (never walked). Fix shape: ignore
landing clicks until a `pointerdown` has been seen after entry (or ~300 ms).

**S2 · D262 · Desktop: the pointer is in the bottom edge band the instant the sheet closes.** Every sheet is bottom-anchored,
so after Move the mouse rests where the button was. If edge scroll runs on plain hover, the page runs down under a still
pointer (the 2 Sep "held band" bug in a new coat). Expected: nothing moves until the pointer leaves and re-enters a band —
better, scroll only while the button is HELD (the ruling says "drag"). Disproof: press Move, don't move the mouse, the grid
or page scrolls by itself.

**S3 · D262 · A bid sharing its day with an award cannot be moved by ANY door.** Setup: admin, SLIPWAY 10 Feb (*OIL pending)
→ sheet → +OIL → Give FO → the day shows FO +1. Tap it → tap list: the bid line has Approve / Ack / Refuse / Clear, no Move.
Drag-select 10 Feb → Move… absent (the award is main; `movableCells` empty; the in-flight SelectSheet hides Move when only
awards). Expected by D262's words ("click on a single chip … move button enabled"): movable. Observation: no Move anywhere.
Decision for the builder, before building: give the tap list's BID line a Move… into grid move mode for that one record
(the store has no per-record grid move today — `moveCells` reads `mainAt`), or read D262 as single-record days only and say
so in the contract. Sibling of `[LW-MOVE-BENEATH]`.

**S4 · D262 · Move → month button → land, both orders.** Setup: admin, BRUISE 23 Jan (*LL pending) → Move → press MAR →
hover 12 Mar → click. Expected: strip works, banner still "Tap a day to move 1 entry", landing paints on 12 Mar as its
columns draw, lands *LL on 12 Mar pending, no dotted mark at OPEN. Disproof: the month press cancelled (an outside-click keyed
on "not a cell" catches the strip; one keyed on "outside `.mx-wrap`" does not — the strip is inside the scroller); the
preview stuck on stale cells; refused "outside what you can edit" because March was not drawn yet. Reverse order: press MAR
first, then Move from a March chip (PROWLER 21 Mar is an award — use SLASH 2 Feb then land in March). Phone: month tap →
tap 12 Mar → "Move 1 entry here?" → Confirm.

**S5 · D262 · The outside-click cancel eats controls, or the empty background does not cancel.** In move mode press each,
expect: month button KEEPS; zoom − / + KEEPS; Manning KEEPS; ⚙ opens settings, KEEPS; OIL opens the tracker — close it by
scrim click → KEEPS (a scrim is not empty page); Rearrange ⇅ — say what happens (today the row drag and the move listeners
coexist); a frozen-column name → person sheet, KEEPS; a balance box → figure sheet, KEEPS; banner Cancel → ends; top bar Undo →
ends; Period picker → ends; stage control → ends; the empty page background beside / below the card → CANCELS, banner and
ghost gone. Disproof: any control ended it that is not Undo / war / stage / Cancel; the background left it on.

**S6 · D262 · Landing on the chip's own day.** Today the sheet says "already has something booked"; the grid path
(`moveCells`, delta 0) says "Nothing to move." and on the phone `previewAt` PAINTS the landing and offers Confirm before
refusing. Setup: SLASH 2 Feb → Move → click 2 Feb. Expected: cancels quietly or says it is already there. Disproof: "Nothing
to move." with the mode stuck; phone: a Confirm that then fails.

**S7 · D262 · Move then Undo; Undo after a landing.** Setup: admin gives SLASH an FO on 5 Feb, then SLASH 2 Feb → Move →
top-bar Undo. Expected: move ends (no banner, no ghost), the 5 Feb FO is gone, 2 Feb LL untouched, the next click on a day
opens its sheet (does not land). Then Move → land 9 Feb → Undo → LL back on 2 Feb in ONE step. Disproof: ghost still
follows the mouse; a click lands; two Undo presses.

**S8 · D262 · Move then stage change / war change; the dotted mark.** SLASH 2 Feb → Move → stage to BIDDING CLOSED → the
move ends. At CLOSED: Move → land 9 Feb → dotted "moved" mark, sheet reads "moved from 2026-02-02", lands undecided
(no state). Mid-move switch the Period picker to JAN–DEC 27 → ends; nothing writes into 27. Disproof: no `shiftedFrom` at
closed; the mode survived the switch and the next click wrote into the other war (the W3-F7 shape).

**S9 · D262 · Move, then switch to the Schedule tab.** The Leave War page dozes but stays mounted; `wireMove`'s listeners
live on the document: the ghost "Move 1 entry" follows the mouse over the schedule, and an edge-scroll loop keeps running.
Expected: the move ends when the page goes inactive (LeaveWarPage `active`), or at least nothing fires off-page. Disproof:
ghost over the schedule; on return the mode is still on. (No scheduler surface uses a `cell-` test id — checked — so nothing
can land there.)

**S10 · D262 · Edge-scroll geometry.** Desktop, SLASH 2 Feb → Move → hold at the LEFT edge of the visible days (just right of
the balance column) → scrolls toward January; far right → toward March; bottom edge → the PAGE scrolls and the preview follows
onto rows that slide under; with the figures drawer OPEN the left band starts past the drawer. Disproof: a dead left band
(measured from the wrap's edge, under the frozen columns — the 6 Sep bug); scrolling continues after the pointer leaves the
band or leaves the browser window; the preview stays on the old row.

**S11 · D262 · Phone: swipe never lands, long press never silently cancels.** P 390, admin, SLASH 2 Feb → Move → swipe left to
MAR → tap 12 Mar → "Move 1 entry here?" → Confirm → lands. Then long-press a day mid-move: Android fires `contextmenu`,
which today CANCELS the move with no word. Expected: a swipe only scrolls; a tap stages; Confirm lands; a long press does
not drop the move unsaid. Disproof: the swipe's lift landed; the long press ended it silently.

**S12 · D262 · Refusals come from the banner now, keep the mode, and the next landing works.** Admin, SLASH 2 Feb → Move →
click 3 Feb (his LL* afternoon) → "That lands on 2026-02-03 which is already booked — pick another day." → click 9 Feb → lands.
Member RANGER (with an LL bid on 20 Jan given by himself while OPEN) → drag-select → Move… → click 15 Apr → "outside what
you can edit" → click 27 Jan → lands. Disproof: a blank banner; the refusal ended the move. (The ISO date in the banner is
`[LW-ISO-DATES]`, filed — not new.)

**S13 · D262 · The tests that type a date must be rewritten, not deleted.** `src/leavewar/ui/deciding.test.tsx` (the
`shift-date` / `decide-shift` cases: lands pending, "occupied", "window", moved-from at closed, the disabled-until-typed
assertion at ~419 which must invert), `e2e/leavewar.spec.ts` ~816 and ~855, `e2e/step4-leavewar.spec.ts` ~468. Each now
drives Move → click the day and keeps its assertion. `DecisionSheet` is unmounted: delete it with its own tests or leave it
untouched — do not "build" D262 on it, and correct the ruling's reading (a) in the contract.

**S14 · D261 · The member's own award becomes tappable and opens NOTHING.** `cellOpenable` gains a branch, but every sheet's
mount test still says no (`BidPicker` needs `canEditCell && canEditRow`; `RaptorSheet` needs `raptorOwns`; the list needs a
mark) — the exact "door drawn and dead" shape. Setup: admin gives RANGER an FO on 20 Apr 26 ("Night flying", OC Ops, 1 day)
and one on 20 Jan; sign in `us`; JAN–DEC 26. Tap 20 Apr at OPEN; then admin steps to CLOSED, PUBLISHED; then a DRAFT war
made by + New with an award in it. Expected: a read-only sheet — Reason / Given by / Days, ✕ only. 20 Jan (inside the
window) still opens the bid sheet with the read-back at its foot. Both widths; the phone tap must survive the W4-1 swallow.
Disproof: the tap does nothing; the bid sheet opens with a Clear that dead-ends; at PUBLISHED the note sheet opens.

**S15 · D261/D260 · A member's Clear inside the window neither names nor takes his award.** RANGER, 20 Jan → bid sheet →
Clear → "Nothing here can be cleared…" as today, no "Clear also takes…", award stays. Check `awardclear.test.tsx` line ~138
runs with `viewer` = the member (not `null`: a null viewer passes `canEditRow` for every row).

**S16 · D261 · Another man's award stays shut to a member.** RANGER taps AMMO 8 Aug (HO, single) → nothing; AMMO 4 Jul (+1)
→ the tap list, read-only, no Edit… / Clear on the award block. Disproof: the new branch keyed on "holds a manual credit"
without `personId === viewer`.

**S17 · D260 (in flight) · The Clear's "asked" flag does not follow a changed span.** Admin, PROWLER 4 Jan (FO) → Clear →
"Clear also takes PROWLER's OIL award (1 day)…" → press "Pick a range", choose 1–4 Jan (awards 1 Jan and 4 Jan) → Clear.
Expected: both named again before anything goes. Disproof: both go on that tap unnamed — `clearAsked` resets only when a
leave code is written. Reverse: ask on the range, switch to "Just this day", Clear → goes unnamed. Fix: reset `clearAsked`
whenever the range changes (key the flag to the cells asked about).

**S18 · D260 (in flight) · At PUBLISHED, Delete names the award, takes it, and the published leave stays — silently.** Admin
steps JAN–DEC 26 to PUBLISHED; gives SLASH an FO on 2 Jun (his OIL 1–3 Jun is war-approved); drag-select SLASH 1–3 Jun → Delete
→ "Delete 3 days for SLASH, including 1 OIL award (SLASH 1 day)? Tap Delete again." → Delete. `clearCells`: the leave cells
are not `warEditable` at published, so `clearRequestsAt(…, true)` takes the award (written 1) and the sheet closes as done.
Expected: the award goes (it was named), the leave stays (finished paperwork), and the sheet SAYS the leave stayed. Disproof:
a silent close reading as "deleted" while the leave is still there.

**S19 · D260 · One Undo brings every award back — both doors, both orders.** (A) award then leave: DIVOT 3 Jan (HO) → sheet →
LL → the day is HO +1; drag-select 3 Jan → Delete → "…including 1 OIL award (DIVOT half a day)" → Delete → both gone, OIL
tracker −0.5 → ONE Undo → both back, tracker back. (B) leave then award: BRUISE 23 Jan (*LL) → +OIL → Give FO → drag-select →
Delete → Undo. (C) a 2-row block PROWLER + SLIPWAY, 1–4 Jan: 2 PROWLER awards, SLIPWAY's FO 3 Jan and OL approved 1 Jan →
confirm names "3 OIL awards (PROWLER 1 Jan 1 day, PROWLER 4 Jan 1 day, SLIPWAY 1 day)" → Delete → ONE Undo restores all four
records and both balances; Redo takes them again. Disproof: two Undo presses (the door's removal of the approved leave a
separate step from the war's clear); an award back without reason / giver / days; the tracker still down.

**S20 · D260 · Move never moves an award, and the count says so.** PIKE 10–14 Jan at OPEN (FO 10 Jan; OIL approved 14 Jan)
→ drag-select → Move… shown (the approved leave is movable at OPEN) → banner "Tap a day to move 1 entry" (not 2) → land 20 Jan →
the leave moves, the FO stays on 10 Jan; land on a day holding another award (PROWLER-style) is NOT refused — an award
clashes with nothing. Disproof: "2 entries"; the award moved or vanished; a refusal on an award day.

**S21 · D260 · A member's drag Delete on his own row names and takes no award.** RANGER at OPEN, 20 Jan (award) + 21 Jan
(his LL) → drag-select 20–21 Jan → Delete → "Delete 2 days for RANGER? Tap Delete again." (no award), the bid goes, the award
stays, the balance unchanged. Disproof: the award named or taken (`isAward` reads `state.role` — check it after a sign-out /
sign-in switch, not a fresh boot).

**S22 · D260 · The tap list on a +1 day: the bid line's Clear takes only the bid; the award line's Clear only the award.**
SLIPWAY 10 Feb after S3's setup → tap → list → Clear on the *OIL line → the FO stays; Clear on the FO line → the FO goes;
each ONE Undo. Disproof: either Clear takes both (by address rather than by id).

**S23 · D260 · Phone: a confirm naming three awards still leaves a strip of grid reachable.** P 390, block (C) from S19 →
Delete → the note with three named awards. Disproof: the sheet grows over the whole grid (the 20 Sep sheet-height lesson).

## 4. Explicit negatives — checked, no scenario, with the reason
- The +OIL panel's **Remove** and the OIL tracker's edit: one record by id, unchanged by D260; N11 stands.
- The tap list's **Clear on the award line**: the line already names the award ("FO — OIL award (Exercise recovery) · given
  by OC Ops"), so "names it and asks once" is met by the line itself; S22 only checks it removes by id. If the builder reads
  D260 as "every Clear asks", say so in the contract — a one-line heads-up, not a scenario.
- The tap list's **per-record Move…** with its date box (war-approved leave on a multi-record day): D262's reading (a) names
  the two one-day sheets only; the store has no per-record grid move, so it keeps its date box. Record that in the contract.
- **Drag Fill over an award**: `setCell(code)` replaces requests only; the award stays — no door.
- **The schedule's own credit** (auto): never cleared (`isAward` requires `manual`); a member already opens it read-only via
  the Raptor sheet at every stage — the model for D261's sheet, not a case of it.
- **Scheduler pages** carry no `cell-` test ids: a move-mode click there cannot land (S9 covers the ghost only).
- **`DecisionSheet`**: unmounted since the one window; not a door (S13 says what to do with it).
- **The guest**: no war page. **The JAN–DEC 27 war**: same code; S8 crosses it once.
- **A member and the one-day sheet's Move**: not in D262 (the decision row is the admin's); he keeps the drag-select Move… on
  his own row while OPEN. Worth one line to him, not a build.
- **`[LW-MOVE-BENEATH]`** (a bid under Inputs-filed leave): filed low; S3 is its award sibling and needs a decision now.
- **Data already stored** (an award saved before this branch): D56 — nothing.
