# M4 — the Fable read (28 Oct 26, blind; code at 5f0405eaf in `C:/m4r`)

Read against the brief `docs/superpowers/briefs/2026-10-28-lw-m4-code-read.md`, the spec, the evidence sheet (§3, §6, §8, §9, §10)
and the rulings D1420–D1442. `read-opus.md` not opened. Read-only: no file changed but this one; nothing built or run.

## Findings

### 1 — HIGH (would harm a person's leave records). Approvals ties an approved line to the WRONG leave when the day already holds another war-approved leave; the second tap, and Approved → Refused (D1428), then un-approves or refuses that other leave.

**Steps.** A member holds a war-approved morning OL on Tue 10 Feb (approved last week, Input A). He bids `LL*` (afternoon) on
the same day — Approvals shows one line, "Tue 10 Feb, PM". The admin presses Approve. The line lights "Approved" (correct —
Input B, the afternoon LL, is written). Now he presses the lit button again (D1421, back to pending), or presses Refuse
(D1428).

**What happens.** The MORNING OL goes back to a pending request (or becomes a refused request); the afternoon LL he just
approved stays approved and the line's light goes out. The grid now shows OL pending / LL approved — the reverse of what he
did. His bell tells the member "OL back to pending · Saber" / "OL refused · Saber". Nothing says it was the wrong leave, and
the line, now re-keyed to the OL's new request but still drawn with the LL code, approves the OL on the next press.

**Cause.** `leavewar/state/store.ts decideRequests` — the re-read after the command: for an approved part it looks the leave up
by DAY only, `warLeaveOn(l.personId, p.date)` (no `iid`), which returns the FIRST war-approved leave contribution on that day
from `absencesAt` — in practice the older Input, since the absence index follows the Inputs' order (`sync.ts refreshAbsences`,
the new row appended). So `parts` gets `{ iid: A }` and the second press hands Input A to `DOOR.decideApproved`. `staleWhy`
has the same day-only lookup for its "Already approved by …" answer, which would name the other leave's approver. The
approve preflight (`approveWhy` → `barsWrite`) rightly lets two halves of different kinds share a day, so the case is reachable.
Not covered: `m4decide.test.ts` approves a line onto an empty day only.

**Exact fix.** Tie the approved part to the leave that holds the request's own time, not the day:
- in `decideRequests`, before `gesture('lw.decide', …)`, record each approve part's window from its request —
  `const wins = new Map<string, Win>()`, keyed `${personId}|${date}`, `requestWin(rec.code)` from `listAt` (the request is
  gone after the command);
- in the re-read, `const leave = p.state === 'approved' ? warLeaveOn(pid, date, p.iid) : absencesAt(pid, date).find(c =>
  c.kind === 'absence' && !!c.lw && isLeaveCode(c.code) && overlaps(c.win, wins.get(key)!))` (the engine's `overlaps`);
- give `DecidePart` the request's `code` when the page draws it (`approvals.ts linesOfWar` has it), and make `staleWhy`'s
  gone-from-day branch use the same window test — `absencesAt(...).find(... overlaps(c.win, requestWin(p.code)))` — so
  "Already approved by …" names the right leave;
- a test red first: a morning OL approved on the war, an afternoon LL bid; `decideRequests` approve → parts' `iid` is the
  LL's Input; second tap → the OL still approved, the LL pending.

### 2 — LOW (a visible fault — the two doors disagree). Once a posting out has RUN, Approvals refuses the man's pending request ("Posted out — refuse or delete it") but the bid window still approves it.

**Steps.** A man posted out as archive on 14 Oct (the posting has run — `gone`), with a pending bid on 6 Oct still on his
frozen past months. Approvals: his line's Approve is refused on the line. Open the same cell's bid window on the grid and press
Approve: it goes through.

**Cause.** The "posting has run" refusal lives only in `store.ts decideWhy` (`postedOutBy(personId) && !postedOutAsSans`),
asked by Approvals' writer alone. The one body both doors share, `sync.ts approveWhy` → `postingOutWhy`, returns null for a
`gone` man (`!w || !w.to || w.gone || …`), so `doorApprove` (the bid windows, the drag window, the day's list) never refuses him.
D1436's own case (a posting still to come) IS in both doors; this is the older B12 case the spec gives to "the line" only, but
the spec's §4 names `approveWhy` as the one body so that no door answers differently.

**Exact fix.** Move the check into `sync.ts approveWhy`, after the "No longer there" test: `if (postedOutBy(it.personId) &&
!postedOutAsSans(it.personId)) return 'Posted out — refuse or delete it'` (export `postedOutAsSans` from the store beside
`postedOutBy`), and drop the duplicate from `decideWhy`. Extend `m4decide.test.ts` "a man whose posting out has run" to
`setBidStates` on the same cell.

### 3 — TIDINESS. The new `apprseen:` row is not in the storage table map, so the change batch labels it "Setting", not `LeaveApprovalsSeen`.

**What happens.** `storage/tables.ts tableOf('settings', 'apprseen:<pid>')` falls to `return 'Setting'`; `state/changebatch.ts`
writes that table name on the batch row of every Approvals opening, while `state/perms.ts` (`T.apprseen`) and `docs/data-model.md`
§11 call the record `LeaveApprovalsSeen` — the IT side's table list and the batch disagree for this one row (`noticeseen:` →
`NoticeSeen`, `reqseen:` → `AccessRequestSeen` are both mapped).

**Exact fix.** In `storage/tables.ts`, under `case 'settings'`, add `if (id.startsWith('apprseen:')) return 'LeaveApprovalsSeen'`;
add the row `['settings', 'apprseen:stiff', 'LeaveApprovalsSeen']` to `storage/seal.test.ts`'s list (line ~138).

## What I read and found sound

- **Saved data.** The four stamps are read back by `readRecBody` with bounds and kept whole by `rows.ts recJSON`; an older
  request without them loads as it was (D401). Every rebuild carries them: `setCell` keeps the earliest of the requests it
  replaces, `moveRecords` keeps "placed" and drops "decided" (lands pending), `decideRequest` sets / clears "decided",
  `replaceClashingBids`'s kept half spreads the record (same id, same stamps), `doorApprove` puts the run's earliest placer on
  the Input as `lwBy / lwAt` (and on a merge), `doorDecideApproved` gives it back and stamps a refusal. The notice's
  `remarks / docIds / iid` are read back bounded. `apprseen:` is now declared (`APPRSEEN_TYPES`), a row prefix, own-row
  only (`'required'`), written at open, not an Undo step; hydrated like `noticeseen:` through `settingsRowKeys`.
- **Who may do what.** `ownershipViolation` returns at once for an admin, so his real Undo / Redo can never meet `stampForged`;
  for a member, `verifiedReplay` vouches `lw.cell` and `inputs` images record for record, and the stamp guard's three cases
  (same record / first of the replaced / new = himself within −5 s … +5 min) match what the store writes. A member can write
  no war line kind, `lw.notice` is admin-only, `lwBy / lwAt` and `lw / lwMoved` on his Inputs are kept-or-dropped only.
  `NoticeSeen` admin read is in-memory (`SEEN` holds every row). `lw.decide` is `op(T.bid, 'U')` with own `'never'`, and
  `decideRequests` also asks `canDecide`.
- **The one writer.** Every line pre-checked (`staleWhy`, `decideWhy`, both doors' `*Why` bodies) before one `lw.decide`; a
  refused command re-reads as "Couldn't decide that…"; D1428 and D1421 paths both route through `decideApproved(to)`; D1436 in
  both doors through `approveWhy → postingOutWhy`, SANS excepted, a range crossing the date refused whole on the line.
- **The bell.** `decisionTells` is worked out from before/after, not raised by a door; one line a run; a re-type tells
  nothing (★5), another kind placed approved is "added" (★6); B1's skip is by envelope type with the remark-only exception;
  `noticeLive` keeps one bidding line a stretch; `endedLines` is dated after the newest line of its stretch (C-F3's fix) and
  listed however old where he held a line; `warNoticesReversed` writes "taken back" only for a read line, and a fresh
  "again" line on Redo only where one stands; "Bidding" capitalised (D1433).
- **The page.** Rows re-key by every id a line has had; lit lines survive an Undo as `undone` and relight on Redo (★1);
  joined lines collapse (★8); Approve all is armed on an exact signature; the slim bar's Back keeps the page mounted
  (`hidden`), ✕ / another tab / another page / member view end the visit; `Matrix` skips the soft jump in page mode (★2);
  the ring is view state looked for by time (★3); a rowless man opens his person window from `warIdentityIfHidden`.
- **Absences (roll-call).** Nothing found drawing a pending request, a decision, a bell line or a document that §3 does not
  list. One observation, not a finding: `PersonFiguresSheet` now opens for a man off the roster with its admin "set balance"
  live — unchanged behaviour of the sheet, a new way to reach it.
