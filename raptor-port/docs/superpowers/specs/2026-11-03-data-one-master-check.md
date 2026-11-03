# What does not read the one table — the check of 3 Nov 26 (D1580)

**Asked by him (D1580):** *"shouldnt the whole app be designed such that it relies to store data on the tables? And that
is the master for all to call data from it? … Can u check what else in the app doesnt follow this?"* Backlog item
[DATA-ONE-MASTER-CHECK]. A read-only check by one fresh Opus reader of `docs/data-schema.md`, `docs/data-model.md`, the
three stores, the Leave War's link to the scheduler, the Tracker's link to the roster, the scheduler's memory-only
settings and every direct browser write. Not checked: the engine's rule bodies, every template field. Earned OIL is the
first case, already ruled (D1579, [DB-OIL-OWN-TABLE]). **Host's checks:** A1 and A2 read in the code by the host
(`state/quals-write.ts` writes `p.quals[k]`; `data-model.md` §5's people row says `quals` "is not migrated";
`state/view.ts` `NOTEPUB` is a session-only set). Nothing here is built before the database step (D473) unless he says so.

## A. Should change at the database step

| # | What he sees | Where it lives today | What goes wrong | Fix |
|---|---|---|---|---|
| A1 | Quals ticks (TF, Scheduler, SC Day/Night, DAAR/NAAR, Management) | the person's `quals` block (`state/quals-write.ts`); SXO and SANS held twice (`p.sxo` / `p.quals.sxo`, `p.san` / `p.quals.san`), kept in step by one writer | the table plan (§5 people row, QualMark) maps the marks from the top-level flags and calls `quals` "not migrated" — the adapter, built to that map, would not read the ticks Quals writes. (Stored demo ticks are wiped anyway — D56; the fault is the map.) IMC/NVG are worked out from CAT once and frozen in `quals`; nothing reads them yet | QualMark the only home, written from what Quals writes; correct the §5 row |
| A2 | "Make public" on a scheduler note | memory only (`state/view.ts` `NOTEPUB`) — the agent's choice on the LATEOFF precedent, not a ruling | gone after a reload, a sign-out or a week change; in the shared database a member would never see it | save it with the note block, shared like its text |
| A3 | A LATE mark dropped (the orange chip tapped) | memory only (`LATEOFF`), cleared on every week change and sign-in — session-only by the agent's reading of his 21 Aug 26 ask (`scheduler.md` §Settled → The late-input mark) | scheduler A drops it; B and every member still see it; A sees it again after a week change | save it on the input, like its `flag` — his question first (he asked for "per input"; whether it is shared is his) |
| A4 | An input "landed on the Ground Programme" (`acc:'g'`) | worked out for the week on that screen (`state/holderbase.ts`), then saved with the input | in a shared table the saved value is the last writer's week view; an input of another week reads not landed | never store `'g'`; work it out per day (the plan's stage-2 ScheduleInputPlacement) |
| A5 | Public holidays and Off days | inside a Leave War period (`Period.days` / `bands`); the Holidays list refuses a date no period covers | the same shape as D1579: a holiday in a year with no period cannot be saved; OIL, the SANS calendar and the Inputs month read "not covered" | holidays a table of their own by date; D638's two doors onto one record stand, only the home moves |
| A6 | A posted-out man on the Leave War | his profile row keeps a frozen copy of him (callsign, seat, CAT), drawn when the roster no longer offers him (`leavewar/state/store.ts setPeople`) | his row shows the callsign and CAT of the day the copy was taken | already planned (data-model LeavePersonProfile): keep only dates and outcome, read who he is from Person |
| A7 | A Tracker student picked from the roster | the roster entry keeps `name`, copied from his callsign; `linkedPerson` exists, nothing calls it | his callsign changed on Quals; the Tracker keeps the old name on every chart and in Undo | a linked student shows Person's callsign live; the typed name only for an unlinked student |
| A8 | Medical documents | each browser's own file store (IndexedDB `raptor-docs`) | an upchit photo taken on a member's phone cannot be opened by the admin on his PC | already planned: the shared file store (data-model Attachment) |
| A9 | A Ground row that came from an input | its `src` is a key built from the input's content, not its id | two inputs alike cannot be told apart | already planned: `sourceInputId` |
| A10 | Which leave period was last opened | one shared setting (`current`), written on every switch, never read at boot | needless shared writes; if ever honoured, one man's switch would move everyone | drop it, or keep it per person |
| A11 | SANS quarter progress | typed counts on the person (`sanQ`); the rule that uses them is parked | once wired, "flown" would drift from the published schedule | work "flown" out from the published days; store only a shortfall carried in by hand |

## B. Right to stay as it is

Published versions frozen on purpose — each issued version's inputs, men, roster, warnings, callsigns, OIL evidence and
signatures (D44, D45, D179; D183–D185 for what stays live). A row from an input copies its people and marks, re-made from
the input on every read (D755, D760) — never stored as the row's own in the database. History stamps record how things
stood (the change history's labels, a bell notice's name and day, a Leave War notice's "replaced by", an access request).
A typed leave figure keeps the approved leave as it stood when typed (`bal.snap`, D1479). Undo per person, cleared at
sign-out (D148); the signed-in session and the view state. Per-person or per-device conveniences: the board panel's width
(D1113, D1118), the Tracker's last course and chart (D376), the Manning block open on a phone and the Inputs month
expanded (no ruling found), "Approve what I enter" (D1302 — could follow him across devices; low stakes). Squadron-wide
settings rightly one shared row: Show SANS, row orders, group definitions, the flying-plan rows, templates. Stored from
the day's facts on purpose: the posting run on its date and its `poDone` (D229, D280, D283, D287); the OIL openings until
[LW-OIL-OPENING-AWARD]. Worked out on read, never stored: Quals' derived rungs, the Leave War grid, the OIL ledger, the
Tracker's down days (D1002), the "bidding closed" line, the holiday notice's dates.

## C. Not sure

The Leave War's flight label (`profile.label`) overrides Person's flight; nothing sets it; kept for a sort by flight (D1001)
— settle with [LW-SORT-BY-FLIGHT]. Who-stamps kept as a name, not a person (the Tracker mark's `by`, the ledger's
`approvedBy`, the change history's `who` — which also keeps the id but prints the old name): does history say the name at
the time or his name now? Either way store the id. Each person's "seen" and "read" markers are per-person shared rows —
right, and they will follow him across devices.

## His three examples

**The Leave War — mostly follows:** leave, medical, course and overseas duty are read live from the Inputs
(`refreshAbsences`; approving writes the Input itself, [ARCH-STACK] step 4); the exceptions are earned OIL (D1579),
holidays (A5) and a posted-out man's copy (A6). **The pucks on a day — follows:** rows keep person ids, a row from an input
is re-made from it on every read (D755), the issued face frozen on purpose (D44, D179); beside them, public notes (A2),
dropped LATE marks (A3) and the landed mark (A4) break the rule. **SANS inputs — follow:** SANS availability is an Input,
read live, with the flying plan through the resolver shared with the Leave War; only its holiday tags (A5) and the parked
quarter counts (A11) do not.
