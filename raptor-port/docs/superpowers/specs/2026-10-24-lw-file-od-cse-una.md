# Round 2 — a course, an overseas duty and the unforeseen absence filed on the Leave War (24 Oct 26)

[LW-FILE-OD-CRS]. His rulings: D1299 (his intent — file them far ahead while bidding is open, because they lower manning),
D1303 (one more kind for an unforeseen absence, named apart from the Inputs page's "Other"), D1318 (filed straight, no
approval, any date, a member too, no document), D1324 (UNA filed as an OD is), D1325 (UNA deep teal), D1326 (the ⋯ in the
fourth place of the CSE · OD · UNA row — built with round 3). His drawing: `scripts/handpass/lw-round2-odcrs.mjs`
(`docs/img/handpass/2026-10-24-lw-declutter/r2-*.png` — the admin's day with UNA teal, a member's open day, a member's
closed day).

## What is built

- **The row under the leaves** carries CSE · OD · UNA in its first three places, the ⋯ in the fourth (an admin's; a
  member's fourth place stays empty) — in the one-day window, the drag-selection window and a member's closed-day window
  (which a member also gets on a day before today, D1211). Each button is filled, in its kind's colour, with no figure:
  nothing is spent and nothing waits.
- **A tap files it at once**, for the day tapped, the picked range, or every day of every man of a drag-selection, and the
  window closes. One command, one Undo. It is saved as the input it is — one Inputs-page record per man per run of days —
  never as a bid.
- **UNA, "Unavailable"**, is a new input kind, offered on the Inputs page under "Duty & other commitments" beside OD, and
  drawn deep teal on the grid, its button, the Legend and the Inputs calendar.

## The agent's readings (told to him; each his to strike)

1. **Who and when (D1318):** a member files on his own row only, an admin on any row; any date — open for bidding or not,
   and a day before today, as the Inputs page allows. A day the man is not in the squadron (before his post-in, after his
   post-out) is skipped and said.
2. **Whole days:** none of the three has halves on the Inputs page, so a tap files whole days whatever Duration shows.
3. **Its words:** the Remarks and till typed in the window go with it; a document attached goes too — never asked for.
4. **Once filed it is an Inputs-page input:** the war never changes a course or an overseas duty (design §5.4, owner §13
   Q1), so a tap on that day opens the window an OD filed on the Inputs page opens, and it is changed or deleted on the
   Inputs page; Undo takes it back straight away. A bid already on the day stays (a course or an OD never replaces a bid —
   the clash rule's step 3); the day then holds both.
5. **UNA is the overseas duty's twin in every rule** ("UNA can use the same as OD", D1324): out of reach — he cannot be
   planned for anything, an SC SPARE included; drawn under the schedule's Unavailable; it lowers the Leave War's manning
   (D998's list, now with UNA); on a weekend or a holiday it asks the OIL question as OD does; it takes a title.
   **One exception, by his own reason for the medical kinds:** the LATE mark skips UNA as it skips a downchit — an
   unforeseen absence cannot be filed before a deadline.

## Where it lives

The kind: `src/engine/inputs.ts` (INPUT_META, `isLateInput`), `src/engine/schema.ts`, the reference's mirror
`src/testing/refwin.ts`. The war: `absences.ts warVisible`, `engine/dayview.ts` (AWAY_DUTY, OFF_WAR), `engine/codes.ts`
(its label and kind), `ui/matrix.css`, the Legend (`ui/Chrome.tsx`). The door: `state/store.ts fileStraight` → the absence
door's `file` (`sync.ts doorFile`) → the Inputs door (the clash rules run as for any input). The buttons:
`ui/LeaveButtons.tsx DutyButtons`, in `BidPicker`, `SelectSheet`, `ClosedNoteSheet`. The Inputs calendar's colour:
`src/ui/inputscal-model.ts`, `scheduler/25-inputs-calendar.css`.
