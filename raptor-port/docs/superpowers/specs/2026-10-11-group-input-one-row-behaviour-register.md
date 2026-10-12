# `[GROUP-INPUT-ONE-ROW]` — behaviour register (D661, D662, D734–D745, D747, D748; 11 Oct 26)

One plain line per behaviour, each named by a test (`scripts/rulecheck.mjs`, GI1–GI21). The rulings' full rows:
`grep -h '^| D73[4-9] |\|^| D74[0-8] |' .claude/decisions-full/*.md`. The plan (version 3, the one built):
`../plans/2026-10-10-group-input-one-row-plan.md`; the design note `2026-10-10-group-input-one-row.md`; the approved
pictures `../../mock/group-input-one-row.html` (D743). The rules as written: `../../engine-rules.md` ("The rows of one
shared input…", "A request's row: its name…", "On a shared input's row the pucks are the input's people", "A shared
input is counted once"); the screens: `../../ui-contracts.md` §A shared input is ONE row on the schedule. The check:
`../../handpass/2026-10-11-group-input-one-row.md`.

**CHANGED BY THE ONE-RULE BUILD (`[ALL-AVAIL-AS-MEMBER]`, step 2 — 12 Oct 26; owner D755, D756, D762).** An input is ONE
record and ONE row now, and every input's row is the input — not a shared input's alone. The rows below are as they
were written on 11 Oct 26; what each reads as now is its line in `scripts/rulecheck.mjs`, and its proof has moved:
GI6, GI8–GI10, GI12, GI13, GI15 → `src/ui/reqdoor.test.tsx`; GI16–GI18, GI20 → `src/state/inputcount.test.ts`
(`grouprow-hands.test.tsx` and `grouprow-count.test.ts` are gone). **GI11 and GI19 are SET ASIDE** (D745 → D755: the
placeholder is one of the input's own people and is tied to no man); their ids are not re-used. **GI7** (D738, D744 →
D762): a person added follows the input's ONE answer; nobody is asked for himself. This register is rewritten with the
rest of the records in step 8 of that build (`../plans/2026-10-11-one-rule-plan.md` §5, §10).
*(Done 12 Oct 26, step 8: "As each line reads now", at the foot of this file. The table is kept as written.)*

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

## As each line reads now — since the one-rule build (`[ALL-AVAIL-AS-MEMBER]`, 12 Oct 26; D755, D756, D759, D760, D762, D763, D753)

An input is ONE stored record with the list of its people, and its row is ONE row, a whole copy of it — for an input
of one person too. The rules as written now: `../../engine-rules.md` ("A row that came from an input is one row, a whole
copy of the input", "One answer for everyone in an input", "The people step"); the build's record:
`../plans/2026-10-11-one-rule-plan.md` §10. The ids are those of the table above; the words in `scripts/rulecheck.mjs`
are the short form of each.

| ID | As it reads now | Ruling | Named proof |
|---|---|---|---|
| GI1–GI3 | Unchanged: a box typed on an input's row changes the input; nothing done from the schedule makes it read late; hours typed there keep a Yes at the new amount | D739–D742 | as in the table |
| GI4 | An input is ONE row: there are no rows of one input to "carry one mark and stand together", and no entry mark (`srcg` is not written). Its CX, red box and "information only" are the INPUT's own and are copied onto the row | D755, D756, D760 (was D661, D735) | `src/state/grouprow-entry.test.ts`, `src/ui/inputmarks.test.tsx` |
| GI5 | Drawn as one row because it IS one: its named people A to Z, then ALL AVAIL / ALL, each puck on its own key of that one row (`engine/grouprows.ts rowPeopleDrawn`); the Unavailable list is still one row a man, drawn from the record's people | D755, D756, D737 | `src/ui/grouprow-draw.test.tsx`, `e2e/grouprow.spec.ts` |
| GI6 | A person put anywhere on ANY input's row joins the input — a one-person request's row included; the seat he came from keeps him; already in it: refused, in words. On the puck of the input's ONLY entry he REPLACES that man, and the input becomes his | D755, D755 (2) (first D734) | `src/ui/reqdoor.test.tsx` |
| GI7 | A person added follows the input's ONE OIL answer and nothing is written for him: unanswered, the question opens at once for the INPUT, for whoever added him; No, the note says he is not counted. Nobody is asked for himself | D762, D755 (1) (was D738, D744) | `src/ui/groupeditor.test.tsx`, `src/ui/reqdoor.test.tsx` |
| GI8 | Unchanged: a person added from the schedule is never marked late | D741 | `src/ui/reqdoor.test.tsx` |
| GI9 | A person taken off an input's row leaves the input; the LAST one is refused, saying how | D755, D757 | `src/ui/reqdoor.test.tsx` |
| GI10 | Dragged to another place he leaves the input and is put there in ONE step; onto another input's row he moves, never in both | D755 | `src/ui/reqdoor.test.tsx` |
| GI11 | SET ASIDE (D745 → D755). ALL AVAIL / ALL is one of the input's people: it joins wherever it is put on the row, never replaces anyone, and STAYS when anyone else leaves | D750, D753, D755 | `src/ui/phmember.test.tsx`, `src/engine/phmember.test.ts` |
| GI12 | A box typed on an input's row is everyone's — one record, one time; on the Unavailable list a typed box changes that one man's PART: he is first given an input of his own (`engine/inputown.ts ownInputOf`) | D735, D739, D737, D759 reading 4 | `src/ui/reqdoor.test.tsx` |
| GI13 | An input is ONE row: its ✕, its drag and its LATE mark are that row's; its CX, red box and "information only" are written on the INPUT, by a scheduler only | D755, D756, D760 | `src/ui/reqdoor.test.tsx`, `src/ui/inputmarks.test.tsx` |
| GI14 | Unchanged: the window opened from the schedule is the input's, for everyone in it | D748 | `src/ui/groupeditor.test.tsx` |
| GI15 | The belt refuses a raw write of ANYTHING to any place of an input's row — a one-person request's included (`engine/slots.ts inputSeatBar`); a row nobody filed is written as ever | D755 (was D734, D18, D470) | `src/ui/reqdoor.test.tsx` |
| GI16 | A published day counts an input once; each person or placeholder put in or taken out is one each; a swap of its only person is one — worked out from the people, with nothing to fold | D736, D113 | `src/state/inputcount.test.ts` |
| GI17 | What goes out is the count the day head showed. There is no "entry a man" in the record any more — one entry an input; "Discard" counts what a load would put back, and a load never changes an input (a CX on a published day discards 0) | D736, D109, D760 | `src/state/inputcount.test.ts` |
| GI18 | One line naming the input and its people; one person put in or taken out is his own line | D736, D663 | `src/state/inputcount.test.ts` |
| GI19 | SET ASIDE (D745 → D755): nothing comes off with a man, so there is no such change to count. "… came off with him" is said only of a row issued before the build | D755 | — |
| GI20 | Unchanged: a person added to a row the issued day held wears his mark on his puck | D93 | `src/state/inputcount.test.ts` |
| GI21 | Unchanged | D747 | `e2e/grouprow.spec.ts` |

**Behaviours the build adds, with their proofs** — not given ids of their own here (an id is named in
`scripts/rulecheck.mjs`, which this record does not change): one OIL answer for everyone in an input, the scheduler
alone leaving one person out (D762 — `src/engine/onerecord.test.ts`, `src/engine/oilclaimcrowd.test.ts`); who is in an
input is changed only by whoever filed it or a scheduler, and anyone in it may take himself out (D763 —
`src/leavewar/onerecord-perms.test.ts`); ALL AVAIL / ALL under "Several people" (D753 — `src/ui/phpick.test.tsx`); a
cancelled or information-only input is silent to the rules and earns nobody OIL (D760 —
`src/ui/inputmarks-scenarios.test.tsx`); one man's row under Unavailable is addressed `iu:<iid>~<person>`.
**Not built yet:** how a cancelled input looks on the Inputs calendar, and the bell's notices, wait for his look at a
picture (the plan's §8, Q2–Q4).
