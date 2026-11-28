# Scenario design — one man's row of a shared absence (fresh, blind Opus designer in Fable's seat)

Read: the brief; `D:/c177/change.diff`; the full rows of D737, D735, D739, D755, D661, D45 (D759 has no full row under
that number in `.claude/decisions-full/` — the grep returned nothing; its reading 4 is quoted in code comments only); the
code of every door that holds an input's id across a save. I did not open any other designer's file. No compaction
happened in this run.

People: Saber = admin (sign-in `ad`); Ranger, Hex, Outlaw = members. "The shared leave" = one leave (LL) filed on the
Inputs page for Ranger + Hex, 08:00–10:00, on a weekday of the week on screen, remark empty unless said.

## 1. What I found while enumerating — the call sites the fix did not reach

The fix makes the two SAVE doors (`setInpField`, `setLeaveRemarks`) and the two change handlers follow the man to his
own input. But five other readers still look the held row's input up by the box's raw address (the shared input's id),
with no `rowInputOf`. After the first change has cut Ranger out, the shared input is Hex's alone, so each of these reads
HEX's times/remark into RANGER's box:

| # | Where (code) | Gesture | What it reads | Risk |
|---|---|---|---|---|
| M1 | `textedit.ts refreshTextDestination` (called by `schedule-tab.ts routeScheduleTab` → `refresh(next)` on every Tab / Shift+Tab within a day) | Tab or Shift+Tab INTO a box of Ranger's held row, on the week AND the Board (`d.inp \|\| d.ifld`) | `inpById(shared)` → Hex's value written into Ranger's box | Week: the next focus-out compares the box with Ranger's OWN value, finds it different and SAVES Hex's value onto Ranger. Board: wrong value on screen; saved if anything then fires `change` |
| M2 | `textedit.ts` Escape on a week `[data-inp]` cell (~line 450) | Escape in Ranger's row | `inpById(iuParts(..).iid)` = shared → Hex's value, then `blur()` | Week: blur → focus-out saves Hex's value onto Ranger |
| M3 | `textedit.ts` Escape on a Board `[data-ifld]` box (~line 473) | Escape in Ranger's row | same | Board: Hex's value on screen; `blur()` may fire `change` → saved onto Ranger |
| M4 | `board.ts boardTab` (~line 2102) — the day stepped / board tab changed with an input box focused | day arrow or day tab while caret is in Ranger's held row | compares the box with the SHARED value, not his | box differs from Hex's → a `change` is dispatched by hand → a save of an unchanged value (phantom history line / Undo step / pending), or a wrong value saved if M1/M3 put one there |
| M5 | `inputedit.tsx reassignInput` (drop or arm-and-plant on the row's puck, `data-inpseat` = `<shared>~bane`) | a man dropped on Ranger's puck while his row is held, or with Ranger's row armed from before the split | `from = holds(shared, bane) ? bane : leadOf(shared)` → **Hex** | Hex is swapped out of HIS leave for the dropped man; Ranger untouched — the others' input changed by a gesture on Ranger's row (D755 (2), D737) |
| M6 | `ReqWords.tsx LeaveWords` — `row = inputById(row.iid) \|\| row`, then `typed`, `docIds`, `till` read off it | the Leave War remark windows (member's own cell `RemarksSheet`, admin's decide window `BidPicker leaveRow`, day's list) | if the parent does not hand a fresh row after the cut, the window re-reads the SHARED leave → Hex's remark/documents/till | after Ranger's first remark save the box shows Hex's (blank) words; a Document added or the till tick then saves `edit ?? typed` (Hex's words) and Hex's document list onto Ranger's own leave — **his remark and documents wiped** |

M6 depends on whether Matrix re-renders with `leaveInputAt` (which would now find Ranger's own leave) after a remark-only
save; I could not settle that by reading, so it is a walk question, not a claim. M1–M5 follow from code alone; the walk
decides whether the browser fires the events as I expect.

## 2. Roll-call — every place the row's input is shown, saved, or read downstream

| Surface | Visible sign | Working gesture | Expected (source) |
|---|---|---|---|
| Board, Unavailable list, desktop (`data-ifld` input boxes) | one row a man: start, end, remark, puck | type + Tab / click away / Enter / Escape / day step | his part alone (D737, D739 reading via R5/R7, the fix) |
| Board, Unavailable list, phone 402×874 | same boxes, 3-column layout | tap, keyboard's next arrow / Done, tap away | same |
| Edit Schedule week, Unavailable row (`data-inp` contenteditable) | one row a man | type + Tab / Shift+Tab / click away / Escape / Enter | same |
| Board/week puck on the row (`data-inpseat`) | puck; armed outline | drag a roster puck onto it; tap puck then tap a name | the man on HIS row is replaced, his part only (D755 (2), D737) |
| Leave War: member's own cell → remarks window | box, till tick, Document | type + blur, Document, till | remark is his alone (D737, setLeaveRemarks comment, R5) |
| Leave War: admin's decide window (approved cell) | Remarks row | same | same |
| Leave War: day's list (war-approved `lw` leaves only) and drag window keepWords | words row | same | same (only `lw` rows) |
| Personal Inputs rows, Ground Programme rows (`reqrow.ts`) | ONE row for the group (D661) | typed box | the input for everyone (D739) — no `who`, untouched by the fix |
| Readers downstream | Inputs page calendar/cards; Leave War grid cells; bell lines (Ranger "his own now", Hex nothing); changes window ("Ranger · Leave — his own now — …"); pending marks and sign-offs on a published day (D45, D103); warnings (a man on leave in a seat) | — | must all show Ranger's own times and Hex's unchanged |

Roles: admin types everywhere; a member's Board/week is read-only (`RO`, the `if (RO) return back()` path); a member
reaches only his own Leave War cell's remark window. A scheduler is always an admin (D785).

## 3. Scenarios, ranked by likely failure

Every scenario ends with a plain-user check: leave the section, look at Ranger's row, Hex's row, the Inputs page and the
Leave War cells for both men; picture each.

### S1 — Week, Shift+Tab back into his row after the split (M1) — desktop 1440×900, admin
Setup: the shared leave; Edit Schedule week; the day's Unavailable list.
Presses: Ranger's start cell → type `0900` → Tab (now in his end cell) → type `1100` → Tab (in his remark) →
Shift+Tab (back in his end cell) → look → Tab → click outside the day.
Expected: after Shift+Tab his end cell reads 11:00; after the last Tab nothing new is saved; Ranger 09:00–11:00, Hex
08:00–10:00 (the promise; D737; "every later change on his row reaches HIS input" — and a box only re-read, never
retyped, saves nothing: textedit "LEFT AS IT WAS, NOTHING IS SAVED").
Disproved by: the end cell showing 10:00 after Shift+Tab; Ranger saved as 09:00–10:00 afterwards; an extra history line
"Ranger … 11:00 → 10:00" nobody typed.

### S2 — Week, Escape in his row after the split (M2) — desktop, admin
Presses: Ranger's start `0900` → Tab → CLICK (not Tab) back into his start cell → type `0930` → Escape → click outside.
Expected: Escape puts back HIS saved 09:00 and nothing is saved (D1011's fresh read, as for every cell); Ranger
09:00–10:00, Hex 08:00–10:00.
Disproved by: the cell reading 08:00 after Escape; Ranger saved as 08:00–10:00 (now a separate leave identical to Hex's).

### S3 — Hex's row typed after Ranger's split, then Tab back to Ranger's row (M1, cross-row) — week, then Board, desktop, admin
Presses: Ranger's start `0900` → Tab; click Hex's end → `1200` → Shift+Tab repeatedly until the caret is in RANGER's
end cell → look → Tab → leave the day.
Expected: Ranger's end cell reads 10:00 throughout; Hex 08:00–12:00, Ranger 09:00–10:00.
Disproved by: Ranger's end showing 12:00 (Hex's); on the week, Ranger saved 09:00–12:00 — Hex's change landed on
Ranger. Repeat on the Board: RECORD exactly what Ranger's box shows and what is saved.

### S4 — Board, Shift+Tab and Escape (M1, M3) — desktop and phone, admin
Desktop presses: Ranger's start `0900` → Tab → `1100` → Tab → Shift+Tab → look at the end box → Escape → Tab out of
the section.
Phone presses: tap Ranger's start, `0900`, keyboard's next arrow, `1100`, previous arrow, look; then tap the end box,
type `1130`, Escape is not on an iPhone keyboard — tap outside instead and confirm 11:30 saved on Ranger's.
Expected: the end box reads 11:00 after Shift+Tab and after Escape; nothing saved by either; Ranger 09:00–11:00, Hex
08:00–10:00.
Disproved by: 10:00 in Ranger's box at either look; Ranger saved with 10:00; on the phone, any save onto Hex.

### S5 — Board, day stepped with the caret in his held row (M4) — desktop, admin
Presses: Ranger's start `0900` → Tab → click back into his start box (reads 09:00) → press the Board's next-day arrow
(or its day tab) → step back.
Expected: nothing saved by the step: no new history line, Undo count unchanged, no pending added on a published day
(boardTab's own rule: "a merely-focused, untouched field" writes nothing).
Disproved by: a history line or Undo step "Ranger start 09:00 → 09:00", a pending mark appearing. Variant: do S4's
Shift+Tab first so the box holds Hex's 10:00, then step the day — Disproved by Ranger saved as 10:00.

### S6 — Leave War, member's own remark window (M6) — phone 402×874, Ranger signed in
Setup: the shared leave (filed on the Inputs page) shows as approved leave on the Leave War grid for both men.
Presses: tap Ranger's cell → remarks window → type `Dental` → tap outside the box (window stays) → look at the box →
tap Document, add a file → look → tick "till" → close → reopen the window.
Expected: the box reads "Dental" after each step; Ranger's own leave holds "Dental", the document, the till; Hex's leave
no remark, no document (D737 R5; setLeaveRemarks comment "the remark is his alone").
Disproved by: the box going blank after the first save; "Dental" gone from Ranger's leave after the Document or the till
tick; the document on Hex's leave. Repeat as Saber through the admin's decide window on Ranger's approved cell.

### S7 — Drop or plant a man on Ranger's puck while his row is held (M5) — Board desktop (drag), phone (tap-arm-plant), admin
Desktop presses: Ranger's start `0900` → Tab (caret now in his end box) → drag Outlaw from the roster palette onto
Ranger's puck on the Unavailable row.
Phone presses: tap Ranger's puck on the row (armed) → tap his start box → `0900` → next arrow → tap Outlaw in the palette.
Expected: Ranger's own leave becomes Outlaw's (D755 (2): "a man dropped on the only man's puck replaces him");
Hex's leave untouched. If the arm is dropped by the tap into the box, the plant does nothing — RECORD exactly.
Disproved by: Hex's leave now Outlaw's (Hex no longer on leave), Ranger still 09:00–10:00.

### S8 — The fault as found (W3), every door — Board desktop, Board phone, week desktop, admin
Presses: Ranger's start `0900` Tab, end `1100` Tab, remark `own hours` Tab, then leave the section.
Expected: Ranger 09:00–11:00 "own hours"; Hex 08:00–10:00, no remark; screen = store at every Tab (the promise).
Disproved by: anything landing on Hex; Ranger's row showing values different from the Inputs page after leaving.
Also RECORD: does Ranger's row move below Hex's when the section repaints (his own leave is placed after the shared one)
— D735's "nothing re-orders itself" spirit; as on main today the cut-out already did this.

### S9 — A refused second change heals to HIS times — Board and week, desktop, admin
Presses: Ranger's start `0900` Tab; end `2570` Tab; then end `0830` Tab (before his start).
Expected: the "2570 is not a time" sentence (D2521 Q4a); the end box heals to 10:00 (his), not saved; the end-before-start
refusal's sentence and a heal to 10:00; Hex untouched (the fix: "a refused box heals to his own times").
Disproved by: heal to Hex's value; any change saved; Ranger cut a second time.

### S10 — Kinds and shapes — Board desktop, admin; one pass each
(a) all-day shared leave: Ranger's start `0900` Tab → own 09:00–23:59; end `1100` Tab → 09:00–11:00; clear start Tab →
all day. (b) half day AM shared: Ranger's end `1000` → "(AM)" gone from Ranger's only. (c) overseas duty and course,
Mon–Wed, typed on Wednesday's row: Ranger's own covers Mon–Wed with the new times (D739 reading 2); Hex's untouched on
all three days; the second change follows. (d) Attach shared (its "To" kept on Ranger's copy). (e) an Other filed under
Unavailable for two. (f) a commitment a scheduler moved onto the Unavailable list.
Expected for each: Ranger alone changed, second change on his own record. Disproved by: any change on Hex's; Ranger
losing the kind, "To", span or filing stamp.

### S11 — Three men, rows in turn — Board desktop, admin
Shared leave Ranger + Hex + Outlaw. Presses: Ranger's start `0900` Tab; Outlaw's start `0930` Tab; Ranger's end `1100`
Tab; Hex's end `1200` Tab; Outlaw's remark `gym` Tab.
Expected: three leaves — Ranger 09:00–11:00, Outlaw 09:30–10:00 "gym", Hex 08:00–12:00 (Hex's alone by then, saved on
the original record, no new one). Disproved by: any value on the wrong man; a fourth record.

### S12 — Undo / Redo between changes — Board desktop, admin
Presses: Ranger's start `0900` Tab → top-bar Undo → click Ranger's end → `1100` Tab → Undo → Redo → click Ranger's remark
→ `x` Tab.
Expected: after Undo one shared leave 08:00–10:00; end 1100 gives Ranger his own afresh, 08:00–11:00; Undo/Redo step
one change at a time; the remark lands on Ranger's own (unit tests' cases, through the real controls).
Disproved by: a remark on Hex's leave; Undo taking back more than one change; Undo greyed with no reason.

### S13 — Published day — Board desktop, admin
Setup: publish the day with the shared leave, sign it off (all four).
Presses: S8's three changes.
Expected: one waiting change for the input — pending marks on Ranger's row (dotted, amendment colour, D1784), the
sign-offs wiped once (D103), the changes window "Ranger · Leave — his own now — 09:00–11:00" (pendlist words), nothing for
Hex's row; the issued face frozen (D44, D45). Bells: Ranger told of his own part; Hex told nothing (unit test).
Disproved by: two or three pending changes counted for one man; a pending mark on Hex's row; Hex's bell saying his
leave changed.

### S14 — Regression: the one-man doors — admin and member
(a) A one-man leave's remark from Ranger's own Leave War cell (member) — saves as before. (b) A one-man Unavailable row
typed on the Board — saves as before. (c) A shared meeting under Personal Inputs (ONE row, D661) typed — changes the
input for everyone (D739). (d) A Ground Programme request row's time and name. Expected: as on main today.
Disproved by: "That could not be saved — change it on the Inputs page" on (a) (setLeaveRemarks now refuses where the row
does not hold the person — RECORD any refusal), or a split on (c).

### S15 — Member on the Board — phone, Ranger signed in
Presses: open the Board on the day; tap Ranger's own Unavailable row boxes.
Expected: read-only — no box takes typing (RO; schedule edits are a scheduler's). Disproved by: a box that accepts typing
and saves.

## 4. Explicit negatives — checked, no fault expected

- **The two save doors themselves** (`setInpField`, `setLeaveRemarks`): `rowInputOf` runs first; a held shared address
  for a man no longer in it is followed to his own, or nothing is saved. Matches the promise.
- **Personal Inputs and the Ground Programme rows**: no man after the id, so `who` is null and `rowInputOf` passes the
  input through unchanged; `setInpTitle` passes no `who`.
- **Hex's own held row after Ranger's split**: the shared leave still holds Hex, so `rowInputOf` returns it, and with one
  person left `saveFromRow` saves it directly — no needless split.
- **Undo of the split, then a change**: the pointer is checked against the records each time; with Ranger back in the
  shared leave it is used as the shared one and cut afresh (unit-tested).
- **A stale pointer after a reload**: the memory lives only for the page; a reload repaints every row with its own
  address, so nothing needs following.
- **Another person's change arriving meanwhile**: the demo has no cross-tab or server push (no storage listener), and
  the app has no keyboard Undo; anything that changes the inputs from another door takes the caret out of the box first,
  which releases the hold and repaints the row with true addresses. So "his part removed while his row is held" cannot
  be reached on one page — except through M5's armed key, covered by S7.
- **The Leave War drag window (`SelectSheet keepWords`) and the day list's "Add to the …"**: they look the leave up
  afresh by man and day for every save, so they always hand a row that holds him.
- **OIL**: `askOilIfPending` and the schedule-side rule now receive Ranger's own record, the one changed; leave carries no
  OIL claim. No change expected.
- **Data already stored**: the fix's memory is not saved, so no stored record changes shape; nothing here is a stored-data
  problem (D56).
