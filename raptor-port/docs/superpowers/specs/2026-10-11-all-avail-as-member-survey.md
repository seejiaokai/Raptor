# `[ALL-AVAIL-AS-MEMBER]` — the survey D756 asked for: everything that reads or stands on an input's row (11 Oct 26)

**What this is:** the verified form of the design note's §6 first pass
(`raptor-port/docs/superpowers/specs/2026-10-11-all-avail-as-member-design-note.md`), read off the app on
`claude/all-avail-as-member` (= `main` at `7c1fcdc0`). Four read-only Opus surveys (the Inputs pages and permissions; the
engine, the Leave War and every other reader; the schedule's rows and the published record; OIL with storage and undo),
gathered by the host. **HOST-CHECKED** marks what the host opened and read itself; everything else is a helper's
reading with its line reference, for the plan's readers to verify. The plan written from it:
`raptor-port/docs/superpowers/plans/2026-10-11-one-rule-plan.md`.

**What he ruled on it, the same day:** **D759** — the stored shape of D756 is confirmed now that he has its cost (this
survey is what the cost was read from), built in steps, the first changing nothing on screen; **D760** — a CX on a row
that came from an input cancels the INPUT, and the red box and "information only" go with the input too (§5 below is
how the three marks are kept today).

## 1. The shape today — two layers of "one a man", joined when read

**An input is one stored record per person** (`src/engine/schema.ts:172-241`; `docs/data-schema.md:143-171`). A shared
input is N records tied by `grp` (the group) and `grpBy` (its filer); the "entry" is worked out on read as the records
that share `grp` AND the same shared fields (`src/engine/inputentry.ts` `SHARED_FIELDS`, `sharedKey`, `entryIdOf`;
`src/state/inputgroup.ts` `entriesOf`, `entryRowsOf`, `entryLines`) — HOST-CHECKED.

- Shared across a group's records: `type`, `title`, `date`, `endDate`, `yr`, `allday`, `s`, `e`, `half`, `remarks`, `sans`.
- One person's own, on HIS record: `iid`, `ord`, `person` (a PEOPLE id, or `allavail` / `all`), `oil` ({iso: 0 | 0.5 | 1}
  — his answer per day), `acc` (his filing: none / `g` on the programme / `u` under Unavailable / `r` taken off), `mod`
  (the date the late mark reads), `by` / `at` / `modBy` / `modAt`, `hand` / `leftAt` (hand-overs), `lw` (the Leave
  War's approval), `docId` / `docIds` (medical only).
- A record changed alone simply stops matching and reads as that man's own input; nothing is written to keep a group
  in step (`inputgroup.ts` head) — HOST-CHECKED.

**A shared input is also one GROUND ROW per person** (`src/engine/overlay.ts` `requestRowFields`: `who = inp.person`,
`src = iid`, `srcg` = the entry's mark; `src/engine/grouprows.ts` `groundGroups` / `drawnPeople` draw the rows as one) —
HOST-CHECKED. Yesterday's plan called this its bet: "one record a man AND one ground row a man — the ONE row is made
where a person meets it" (`docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md` §3).

**The glue that exists only because of that** — every piece of it HOST-CHECKED:
`inputentry.ts` (entry identity), `inputgroup.ts` (`entriesOf`, `entryLines`, `groupSnapshot`, `groupsTouched`,
`groupBreach`), `grouprows.ts` (which rows are one row, whose pucks it draws), `overlay.ts` (`srcg` in the row and its
hash, `placeRequestRow`'s sibling placing, `entryPeopleOnce`, `carryOilRefusal`, the "name box is the scheduler's unless
shared" branch of the re-make), `ui/grouprow.ts` (the whole door: `placeOf`, `groupPut`, `groupMove`, `leave`,
`groupTake`, `groupLeaveTo`, `groupRetarget`, `leadKeyOf`, `lineOf`), `slots.ts sharedSeatBar` (the belt),
`engine/entryfold.ts` (the published day's count folded back to one), `inputedit.tsx commitGroup` (one save run as N
per-record saves), `leavingNote` (D745), `board.ts oneRow` (CX / red box / info written alike on every member row).

## 2. One-person row against shared row — every branch found (the one rule removes the difference)

| Where | One-person request's row (`src`, no `srcg`) | Shared input's row (`srcg`) |
|---|---|---|
| `overlay.ts:331-349` re-make | a foreign occupant of the name box is KEPT (D470, D46) | its own man is written back; the occupant goes to `more` |
| `ui/grouprow.ts placeOf` | not this door's — a drop writes the ROW (`drag.ts:361` → `slots.ts:210`); the input is untouched | a named man dropped anywhere JOINS the input (`groupPut`); a puck taken off LEAVES it (`groupTake`) |
| the only man dragged off | plain `setSlotVal(key,'')` — NOT refused; the name box is left empty (`drag.ts:450`, `Shell.tsx:233`) | refused: "the last person on this input" (`grouprow.ts:186-189`) |
| a man dropped ON a puck | the name box changes; the input does not (D470) | "nobody is ever swapped INTO the request" (`grouprow.ts:220-221`) |
| a placeholder | name box or `more`; its crowd earns by DEFAULT (`oilev.ts:1171`) | re-aimed to the lead row's `more` (`groupRetarget`); leaves with that man (D745) |
| OIL default for someone added | YES (`claimDefault`, `oilev.ts:1168-1173`) — D18, D43, D46, D470 | his own record's answer; taken from the entry while all agree, asked where they differ (D738, D744) |
| the published count | a man added under the row is a content change at `g:di.ri.xN` | folded by `entryfold.ts` (D736) |
| OIL item | `i:<iid>` | N items, one per member's iid; the crowd under the lead's |

## 3. Every reader of an input, by what it needs

About 70 source files read the inputs list and about 300 lines read whose input it is (`grep`, HOST-CHECKED: 72 files
name `INPUTS`; 323 lines read `.person` across `src`, not all of them an input's).

**A. About ONE PERSON'S DAY — each needs one line per person.** The clash and crew-rest rules (`events.ts:499-546`
`mapInp` → `validate.ts` — the one place an input becomes a validator item), who is away (`avail.ts:79-81, 484-524,
611-613`), the ALL AVAIL crowd (`leavewar/sync.ts:896-910` `availableFor` — HOST-CHECKED: it drops a man by
`inp.person === id`), the 7-day run seed (`weekctx.ts:144-149`), SANS availability and its counts (`inputs.ts:754`,
`state/flyplan.ts:207-217`, `ui/sanscal-model.ts:140-150`), the medical tracker (`medical.ts`), the palette's reasons
(`palette-html.ts:25, 70`), the Leave War's absence index and its day view (`leavewar/sync.ts:172-224`,
`absences.ts:172-222`), the bell's unanswered OIL (`sync.ts:796-821`), the CSV export (`export.ts:49`), the posting's
"is this day past on the war" read (`sync.ts:1673 pastOnWar`), `roster-restore.ts:61`, the seeds' de-dupe.
*(CORRECTED 11 Oct 26 by Fable's read of the plan, F1 — HOST-CHECKED: this line first listed "a delete's and a
posting's trims (`state/person-delete.ts:196-235`)" here. They are WRITERS — `applyDelete` finds a man's records, then
`INPUTS.indexOf` / `splice` and assigns to them — and belong in C below, where they already stood. A writer handed
lines would delete the wrong record.)*
*(CORRECTED AGAIN 12 Oct 26 by the build of step 1 — each opened at the source by the host. FOUR of the readers this
line lists do not read "one line a person", and were left reading the RECORD: (1) **the medical tracker**
(`medical.ts`) tells its rows apart by identity (`r===except`, `keepTail.indexOf(c.row)`) and hands the very records to
the one applier that trims them (`ui/inputedit.tsx applyMedPlan`) — the same fault as F1, in a second place; a medical
kind holds one person, so it reads the record and, from step 2, its one named person. (2) **"The bell's unanswered
OIL"** (`sync.ts oilPendingFor`) also answers for an input filed for ALL AVAIL — which has no line — asks who may
change the input, and hands back its id for the editor: it is about who ANSWERS for an input, and step 2 (a) rewrites
it on the record. (3) **"SANS availability and its counts"** is two things: the count (`state/flyplan.ts
sansCommittedOn`) reads lines; the lookup of one man's offer (`inputs.ts sansAvailOn`) and the opened day's list
(`ui/sanscal-model.ts sansDayGroups`) hand the RECORD on — to a test that holds it as the record it is, and to the
window that changes it — so they find the record by who is IN it. (4) **The CSV export** (`export.ts`) is "one row an
input as stored" and is to write a line for the placeholder too (the plan's §4.5): the Inputs pages' step. And ONE
reader this line missed, moved with the rest: the Inputs List's "Deleted" group — the deleted men who still have an
input (`ui/InputsPage.tsx DeletedGroup`). The lists as built: `src/engine/inputs-readers.test.ts`.)*
**The parity tests need a flat per-person list too:** `src/testing/refwin.ts:142-145` pushes the port's inputs into the
reference page, which reads one `person` a record and compares `day.input` in order (HOST-CHECKED). `node
reference/tfin.js` itself does not see the port's inputs.

**B. About THE INPUT — each must read one record.** The Inputs calendar, list, cards and window (`inputscal-model.ts`,
`inputcard-model.ts`, `placedline.ts`, `InputsPage.tsx`, `InputsCal.tsx`, `inputedit.tsx InputEditor`, `caldrag.ts`,
`PeoplePick.tsx`); the schedule's row and every hand on it (§2); the published snapshot (`publish.ts:410-441`: `inp` a
whole copy of each input keyed by iid, `fil` its filing; `inpDetailKey` (`inputs.ts:96-105`) carries `person`;
`frozenInputMatch` pairs "by man"); the count (`dayPendingItemsIn`, `entryfold.ts`); loads (`drafts.ts:644-689`
`loadVersionToWorkingCopy`, `draftSelect`, `dayAsLoadLeaves`); the holder base (`holderbase.ts:83-98, 199-225`);
permissions (`perms.ts:216-270, 548-594`); undo ownership (`undo/derive.ts:119-122` — one owner a record); the change
history (`changelines.ts:100-137` — `{iid, sub: person, grp}`; the stored lines carry `grp`, `editlog.ts:64, 180, 483`);
storage (`persist.ts:166-183, 242-246` — one row `raptor:inputs/<iid>` a record; NO shape check at load, HOST-CHECKED).

**C. Writers that change ONE man's part of a shared input today, relying on "a record changed alone leaves the
entry":** sick cuts leave (`leavewar/inputgate.ts:97-171`), the war's approve-extend and `cutDates` (`sync.ts:402-481`),
a delete's and a posting's trims, the Unavailable row's typed box (`inputedit.tsx saveFromRow` — under Unavailable it
changes one man's record, D737) and its puck swap (`reassignInput`, `inputedit.tsx:1400-1452` — HOST-CHECKED: it
REPLACES `person` on one record, refuses a placeholder as target and as source).

**What can be shared today** (`perms.ts:241-246`): by an admin, every kind but the four medical kinds and Upchit — so
LEAVE, an overseas duty, a course and SANS availability (D658) can be; by a member, the "Duty & other commitments" kinds
only. Personal can be shared today; D755 (4)'s refusal is new. A placeholder input: six kinds, one day, alone, never
under Unavailable (`inputs.ts:530-547`; the save boundary `store.ts:244-252`).

## 4. OIL — how a request's row earns today (HOST-CHECKED: `oilev.ts:1034-1245`)

- One CLAIM per stored record (`projectOilInputs`, `oilev.ts:415-441`): `{iid, person, ans = row.oil[iso], win, stand}`.
  The item is `i:<iid>`. The schedule's own walk skips every `src` row, so a request row earns only through its claim.
- The default (`claimDefault`): the holder — his own answer; anyone else on a NAMED man's request (a man typed on the
  row, the crowd of a placeholder dropped there) — YES; on a request a PLACEHOLDER holds — the filer's answer for the
  crowd, YES for a man typed on the row.
- The scheduler's switch lives on the DAY: `DAYS[di].oild.people['<person>|i:<iid>']` (`oilmode.ts:437-478`), with a
  holding stamp `pa`; pruned for anyone who is neither the holder nor on the row (`pruneHandedOverDecisions`).
- Frozen at publication (`publish.ts:389-410`): the whole evidence block — the claims with each answer, the decisions,
  the crowd `sent['i:<iid>']`, the Logic values — and the credit reads only that (`sync.ts:1019-1036`).
- A cancelled or information-only row earns nobody anything: the claim's standing reads the row, and `landedRow`
  answers nothing for it (`oilev.ts:1098-1101`). The claim's standing is the ONE row's state for every day the request
  covers (`oilInputEligible`).
- What stops double counting: the crowd leaves out anyone with his own commitment over the window (`sync.ts:905`) or
  busy on the schedule then; `landedExtras` drops the holder and duplicates; the credit pools a man's spans a date and
  prices the envelope once (`sync.ts:1081-1151`).
- **No "the input's answer" is stored** — it is derived (`inputedit.tsx:756 entryOilAnswer`: same / none / differ).
- The decision key `<person>|i:<iid>` already means "this person, this input" once an input has one id.

## 5. The marks a scheduler puts on a request's row (HOST-CHECKED: `board.ts:1115-1146`)

Stored on the ROW and kept through every re-make (`overlay.ts ROW_OWN`): **CX** with its reason — the item is cancelled,
earns nobody OIL; **the red box** — "flagged for the next scheduler"; **information only** — "no longer checked against
the rules, and earns nobody any OIL". All three are part of the published comparison (`restore.ts:119`). None is read
by any Inputs page (`grep` of `InputsCal.tsx`, `InputsPage.tsx`, `inputcard-model.ts`, `inputscal-model.ts`: no hit —
HOST-CHECKED). A request moved to another day leaves them, and the people added, with the OLD day — by no code of its
own: the old row leaves the view, a fresh row lands from the request alone, and the old row survives in the holder's
stored day (D468; `docs/engine-rules.md:1281-1283`).

## 6. Loads — a version, a saved plan, a day template

`loadVersionToWorkingCopy` (`drafts.ts:644-689`) and `draftSelect` (`:331-364`) install the version's or the plan's rows —
name box, `more`, CX, red box and the hash they were made from; the next pass re-makes any row whose hash differs: the
title, times, remark and holder from the LIVE request, the extras and marks from the VERSION. A day template blanks
`who` / `more` and removes `src` (`daytpl.ts:148-159`): its rows are nobody's request; refused on a published day (D96).

## 7. Storage, undo, the table list

- One stored row per record, written from each command's changes; a group of N is N rows. Load checks no field; the
  shape is held only at the WRITE (`placeholderShapeViolation`, `ownershipViolation`).
- Old-shaped inputs are stored in THREE places: the inputs' own rows, every published day's `inp` copies and evidence
  block, and every saved week's rows (`srcg`, per-member `src`).
- Undo: a group change is one command, one step; **a conflict is per RECORD** — a later change by someone else to the
  same record refuses the Undo whole (D148; `undo/timeline.ts`).
- The only shape tool the store has is the wipe on a format bump (`storage/reset.ts`: inputs, weeks, the Leave War, the
  change log together) and the fold (`storage/fold.ts`, not traced).
- The table list says today, in words to be changed: `docs/data-model.md` §Input 545-585 (`personId` 552 — "no list of
  names is stored"; `groupId` / `groupFiledBy` 570 — "one row per man … there is no group table"), `ScheduleInputPlacement`
  488, `ProgrammeRow.sourceInputId` 529, `RowPerson` 530, §9 rule 9 (1281-1300), §11's `Input` row (1435) and the
  user-owned list (~1460); `docs/data-schema.md` §Inputs 143-171, the evidence block 85-107, the ground row 235-236, the
  stored rows 334, the edit log 400-401.
- The seeds are all in the old shape: `inputs.ts:647`, `weeks-data.ts:137-147`, `week2.ts:120-122`, `demoseed.ts` (the
  shared demo input 204-219; two placeholder inputs 240-255), `leavewar/state/demoworld.ts:66-105, 212-240`,
  `leavewar/test-setup.ts`, `testkit.ts`; pinned by `schema.test.ts`.

## 8. What the design note's first pass missed or had wrong

1. **A man's OWN OIL answer.** The note's §5 says "one answer per input", its §6 says "his own answer is a line of the
   list". Today a member of a shared input can answer for himself, and screens show it (`saveOwnOil`, "Your OIL",
   `oilSummaryOf` — "credited for 2 of 3 — Ranger: no", D744's "differ"). His to settle.
2. **Filing (`acc`) is per person.** One man of a shared input can be taken off the programme, or filed under
   Unavailable, while the others are not (`entryLines` draws the line apart). One record means one filing.
3. **Absences are shared too**, and the Leave War works a man's record at a time (§3 C).
4. **`iu:<iid>` stops naming one man** — the Unavailable row's address, its arm and drop target.
5. **The bell cannot carry a sentence.** It has four triggers and a tap that goes somewhere (`ui/topbits.tsx:42-68`,
   HOST-CHECKED); `state/view.ts markBell` is session-only and has no caller. "Saber added Tally to your Training" needs
   a new SAVED notice per person.
6. **"OIL's records filed under each person's own request"** was half right: the CREDIT is one record per person per
   date and needs no change; the answer, the frozen claim, the switch and the crowd are per record.
7. **Undo gets coarser** — two people changing their own parts of one input now change one record (§7).
8. **A member adding a man to an entry he did not file** is allowed today (`inputedit.tsx:1810-1813`, `perms.ts
   groupStood`).
9. **A deleted man** takes a request's whole row when `inp.person` is him (`overlay.ts hisLanded`); with a list he must
   leave the list.
10. **A request's command never moves the holder's stored day**, so people moved into the input can still sit in a
    stored row's `more` until that day is next saved — the re-make must own the whole row.
11. **`groupPut` leaves a man on the seat he was dragged from** (reading R4 of yesterday's plan).
12. **Rows the door cannot own:** a read-only request's, a taken-off request whose row stands again, a `kept` row.
13. The type catalogue has a field also called `grp` (`inputs.ts:190`; `isPersonal` reads it) — a `grep` for `grp` hits both.

## 9. Tests that pin today's shape (to rewrite, by name)

`src/state/inputgroup.test.ts`, `perms.test.ts`, `grouprow-count.test.ts`, `grouprow-entry.test.ts`, `demostamps.test.ts`;
`src/engine/placeholderinput.test.ts`, `grouprows.test.ts`, `schema.test.ts`, `oilnamebox.test.ts`,
`oilplaceholderclaim.test.ts`; `src/leavewar/groupinput.test.ts`, `groupwrite.test.ts`, `oilsync.test.ts`;
`src/ui/groupeditor.test.tsx`, `peoplepick.test.tsx`, `placeholderdoors.test.tsx`, `placeholderlist.test.tsx`,
`sharedline.test.tsx`, `grouprow-draw.test.tsx`, `grouprow-hands.test.tsx`, `inputcard-model.test.ts`,
`inputscal-model.test.ts`, `inputslist.test.tsx`, `inputsmonth.test.tsx`, `inputsvet.test.tsx`, `inputtitle.test.tsx`,
`inputtitle-row.test.tsx`, `placedline.test.ts`, `barmove.test.tsx`, `batch2.test.tsx`, `changesmodel.test.ts`,
`editorwindow.test.tsx`, `windowreads.test.tsx`; `e2e/inputs-calendar.spec.ts`; the walk scripts under
`scripts/handpass/`.

## 10. Not read by anyone in this survey

`storage/fold.ts` and `storage/schema.ts`; the Leave War's `merge.ts`, `dayview.ts`, `Matrix`, `BidPicker`,
`FiguresDrawer`, `OilTracker` beyond `grep`; `ui/peek.ts`, `engine/reorder.ts`, `ui/printpdf.ts`; `engine/oil.ts` beyond
`grep`; `src/command/*`; every test file's body; `reference/scheduler.html`. The plan's readers are asked to cover the
first two lines of this list.
