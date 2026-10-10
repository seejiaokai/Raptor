# `[GROUP-INPUT-ONE-ROW]` — behaviour register (D661, D662, D734–D745, D747, D748; 11 Oct 26)

One plain line per behaviour, each named by a test (`scripts/rulecheck.mjs`, GI1–GI21). The rulings' full rows:
`grep -h '^| D73[4-9] |\|^| D74[0-8] |' .claude/decisions-full/*.md`. The plan (version 3, the one built):
`../plans/2026-10-10-group-input-one-row-plan.md`; the design note `2026-10-10-group-input-one-row.md`; the approved
pictures `../../mock/group-input-one-row.html` (D743). The rules as written: `../../engine-rules.md` ("The rows of one
shared input…", "A request's row: its name…", "On a shared input's row the pucks are the input's people", "A shared
input is counted once"); the screens: `../../ui-contracts.md` §A shared input is ONE row on the schedule. The check:
`../../handpass/2026-10-11-group-input-one-row.md`.

| ID | The behaviour | Ruling | Named proof |
|---|---|---|---|
| GI1 | A name, a time or a remark typed on a request's row on the Ground Programme — one man's or a shared input's — changes the REQUEST: the Inputs calendar and the Personal Inputs line read the same; a time typed alone fills the other end, a time cleared makes it all day; the name becomes the input's own title; one Undo; a raw write to those boxes is refused | D739, D740 (R1, R2) | `ui/reqrow.test.tsx` |
| GI2 | No change made from an input's row on the schedule makes an input that was on time read LATE — a typed box, a different man dropped on an Unavailable row; the same change in the input's own window still does; an input already late stays late | D741, D742 | `leavewar/schedlate.test.ts` |
| GI3 | Hours typed from the schedule keep a Yes to the OIL question at what the new hours give, with no question; a No stays No; unanswered stays unanswered; the same change in the window drops the answer and asks | D739 (4), D740 (4) (R11) | `leavewar/schedlate.test.ts`, `ui/oilconfirm.test.tsx` |
| GI4 | The rows of one shared input carry one mark and stand together; a man added later joins them where they stand, with their CX, red box and information-only; a row put back where a published version had it is no reorder; a one-man request made a group keeps its own man in its name box and the old occupant among its extras | D661, D735 | `state/grouprow-entry.test.ts`, `engine/grouprows.test.ts` |
| GI5 | A shared input is drawn as ONE row on the week, the board and the next-week peek — its people A to Z, each puck under its own row's key — and ONE line under Personal Inputs; the Unavailable list stays a row a man | D661, D743, D737 | `ui/grouprow-draw.test.tsx`, `e2e/grouprow.spec.ts` |
| GI6 | A real person put anywhere on the one row — on a puck, an extra, the "+ add" — is ADDED to the input; the seat he came from keeps him; already in it: refused, in words | D734 (R4), D271 | `ui/grouprow-hands.test.tsx` |
| GI7 | His OIL: everyone in the input carrying the same answer, he takes it and nothing is asked; nobody having answered, he has none and nothing is asked; the answers differing, the question opens at once for whoever added him, on his record, for his answer alone | D738, D744 | `ui/grouprow-hands.test.tsx`, `ui/groupeditor.test.tsx` |
| GI8 | A man added from the schedule is never marked late — on an on-time input and on a late one; the others read as they did | D741 | `ui/grouprow-hands.test.tsx` |
| GI9 | One of the input's men taken off the row leaves the input; the LAST man is not taken off that way — refused, saying how; the row is still a shared input's down to one man | D734 (R3, R5) | `ui/grouprow-hands.test.tsx` |
| GI10 | One of the input's men dragged onto another place leaves the input and is put there in ONE step — one Undo puts back both; a place that refuses him leaves him in; nobody is swapped INTO the request; onto ANOTHER shared input's row he moves — out of the first, into the second, never in both | D734 (R4) | `ui/grouprow-hands.test.tsx` |
| GI11 | An ALL AVAIL or ALL on the one row is the row's own, never a man's place; it comes off with the man whose row carries it — the app says so, the change history's line says so and names anyone switched off on it, and Undo brings it back | D745 (R10), D46 | `ui/grouprow-hands.test.tsx` |
| GI12 | A box typed on the one row, or on the one line under Personal Inputs, is every record's — one row, one time; on the Unavailable list a typed box changes that one man's record | D735, D739, D737 (R7) | `ui/grouprow-hands.test.tsx`, `leavewar/groupwrite.test.ts` |
| GI13 | The row's ✕, CX, red box and information-only act on every row of it in one press; the line's Undo / Accept on every record; a drag of the row moves its rows together; the LATE mark is the line's — shown while any of its records is late, dropped and restored for all | D661, D735, D736 | `ui/grouprow-hands.test.tsx` |
| GI14 | The window a tap on a shared input opens from the schedule shows everyone in it and changes it for everyone, as its window on the Inputs page does — never one man's form; its dates are not changed there | D748, D734 | `ui/groupeditor.test.tsx`, `ui/batch2.test.tsx` |
| GI15 | The belt: a raw write to a member's place, or of a real man onto the row's "+ add", is refused with nothing written and no mark; a one-man request's row is untouched by door and belt | D734, D18, D470 | `ui/grouprow-hands.test.tsx` |
| GI16 | On a published day a shared input filed, taken off the programme, deleted, re-timed or cancelled is ONE change waiting; one man taken off or added is one each; a re-time with one man added is two; all its people gone one by one is one | D736, D109, D114, D98 | `state/grouprow-count.test.ts` |
| GI17 | What goes out is not touched by the count: the record keeps an entry a man, the published amendment's own item count is the count the day head showed; "Discard N edits" shares the fold, not the number | D736, D109, D103 | `state/grouprow-count.test.ts` |
| GI18 | The one line names the input and how many people, the names under it A to Z, then what changed — no man's name in front; one man taken off is his own line, naming him | D736, D663 | `state/grouprow-count.test.ts`, `ui/changesmodel.test.ts` |
| GI19 | A man who leaves with an ALL AVAIL on his place is ONE change waiting, its line naming both; the same for ✕ on a one-man request's row that carried the puck | D745 | `state/grouprow-count.test.ts` |
| GI20 | A man added to a one row the issued day already had wears his hollow tag on his puck — added before or after a re-time; a whole new one row wears the new row's one mark | D93, D736 | `state/grouprow-count.test.ts` |
| GI21 | On the Scheduler Board the coloured line down the left of a row stands clear of its pucks and buttons, at phone and desktop width | D747 | `e2e/grouprow.spec.ts` |

**The builder's readings** — each told to him (the plan §7, R1–R11; the readings of D747 and D748 in their full rows):
- R8 no longer holds as first told: a row saved before this build is re-made, and marked as its entry's, at its first
  read — better than "until its request next changes". An ISSUED version saved before the build still draws a row a
  man (stored demo data — D56).
- GI16's "all its people gone one by one is one" is D98's reading: the count is the difference from what was issued,
  not the number of presses.
- GI13's LATE mark on an ISSUED face reads the lead's own frozen record alone (the face is drawn from the copies the
  version froze, a record a row) — on the working copy it is any record of the entry.
- GI11's change-history note is a read of the week ON SCREEN: a man taking himself out while another week is open
  leaves a plain line; the day's own "To go out" line (GI19) still names the puck once that week is opened.
