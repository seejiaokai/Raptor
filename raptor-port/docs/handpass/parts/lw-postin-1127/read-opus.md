# Fresh, blind Opus code read — [LW-POSTIN-BALANCE] (branch claude/lw-postin-build-5d49de)

Read: `git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e`, plus the callers and neighbours (leaveyear.ts whole,
store.ts figures/typed-balance/posting/hidden-identity blocks, people.ts stint helpers, balancefigs.ts, FigBox, PersonWindow,
belowzero/SelectSheet/BidPicker doors, changelines.ts balanceLines, undo/describe.ts balanceLabel, perms.ts lw.balance gate).
No HANDOFF, handpass or other reviewer notes opened.

## Findings

### F1 — The first Official bal typed for a never-typed LVE silently saves a carried-forward taken from the hidden 0-based count (medium-low, confirmed by a throwaway run)
- **Where:** `raptor-port/src/leavewar/ui/balancefigs.ts` `saveTypedFigure`, the LVE branch:
  `const cf = part === 'cf' ? … : Math.max(0, Math.min(k.cf, Math.max(n, 0)))` (unchanged line, now wrong because of D2746).
- **Setup:** the store holds a war whose earliest period starts two or more years before today (e.g. a 2025 war, today
  2027-03-01 — any store that has been in use for a couple of years); a man with a grade set before 1 Jan of last year
  (junior pilot, +33) whose LVE was never typed. His LVE now reads "Not typed" and both LVE boxes stand empty (blank).
- **Action:** an admin types 20 in the empty Official bal box (Balances page or person window) and leaves the box.
- **Wrong result:** the saved figure is `{ amount: 20, cf: 20 }` — the carried-forward box, which he never touched, now
  reads 20 ("incl. 20 carried fwd"), and the history writes a second line "LVE carried fwd → 20". Cause: `k.cf` is the
  never-typed figure's carried forward worked out from 0 on 1 Jan of the war's first year, rolled over by the grade
  (`typedOrStart` + `runYears`): 0 → 1 Jan 2026 an = 33 → 1 Jan 2027 cf = 33. Throwaway run (scratchpad `cf.test.ts`,
  engine only, TZ Pacific/Midway): `notTyped true app 66 cf 33`; the clamp then saves cf = min(33, 20) = 20.
- **Should be:** cf 0 (or whatever he types in the carried-forward box afterwards). D2746 says a never-typed balance has no
  figure ("never 0 or a figure below it"); the build itself already refuses a carried-forward typed first for exactly
  this reason (CF_FIRST: "carried forward is a part of that figure"), but the opposite order still borrows the hidden one.
  The consequence: on the next 1 Jan, 20 carried-forward days are wiped instead of rolled into his new carried forward —
  his LVE drops by the wrong amount unless someone spots the box and retypes it.
- **Fix:** in `saveTypedFigure`, LVE branch, when `part !== 'cf' && k.notTyped`, use `cf = 0`:
  `const cf = part === 'cf' ? (…as now…) : k.notTyped ? 0 : Math.max(0, Math.min(k.cf, Math.max(n, 0)))`.
  Add a unit test: a graded man, a war two years back, never typed; `saveTypedFigure(pid,'LVE',20)` → typed record cf 0
  (and one history line "LVE balance → 20", no "carried fwd" line).
- **How sure:** sure of the mechanism (run); the trigger needs a store spanning two 1 Jans with a grade set before the first,
  so it is rare in the demo but certain over a live year-on-year store.

## Questions, not findings (each needs a ruling or a check, not a code change on my word)
- **Q1 — "Days taken" still counts leave before the post-in date.** `engine/leaveyear.ts daysTaken` charges the whole
  approved row with no `beforePostIn` drop; the plan's step 2 says "Days taken leaves it out too (to confirm at the
  build)". The build leaves it in, and nothing in the code says it was confirmed. If it should leave them out: apply
  `dropDates(…, beforePostIn(w, pid))` to its `chargesOf` and to `calendarDays`' MED/CSE/OD ranges. Not a balance, so
  not reported as a finding.
- **Q2 — the new refusal words "Type the Official bal first"** (`ui/balancefigs.ts CF_FIRST`) are words a person reads
  and a new thing he will see (D2441: a fresh Fable adjusts them; D1625: drawn first). The code cites a Fable review for
  the dash's "Not typed" label but not for this line. Worth checking it went through both.

## Tidiness note (filed, not fixed)
1. *Said twice / stale:* `beforePostIn`'s header comment says "before his EARLIEST stint, or in the gap right before his
   CURRENT one", while the comment inside and the body drop EVERY day before the current stint that no earlier stint
   holds (gaps between past stints too). The header should say what the body does.
2. *Wrong place:* `KindFigures` now has two JSDoc blocks back to back — the old one-line "One kind's figures…" is left
   detached above the new `notTyped` block; fold them into one.
3. *Simpler shape:* `personFigures` re-reads `w.balances[pid]?.[kind]` and `w.openings[pid]?.[counter]` right after
   `typedOrStart` read the same two; `typedOrStart` could say whether it fell back to the 0 start (e.g. return
   `{ t, notTyped }`), so the "typed or old opening" test has one home.

## Explicit negatives — checked and found nothing
- The post-in predicate: day of post-in counts (`d < from`); days of every earlier stint count (a `from: null` earlier
  stint included); every gap before the current stint and the days before the first stint are dropped; days after a
  posting out are untouched (D1541); a man with `from: null` drops nothing.
- Both orders of typing and approving: the snapshot's days are dropped by the same test as the approved and pending rows,
  so a leave before the post-in date moves nothing either way; moving the post-in date later or earlier re-reads through
  `state.people` (in the figure cache's key).
- The figure cache's key: `state.postOuts` added for the hidden man's post-in date; `setHiddenIdentityLookup` clears the
  cache; `chargedDays` returns a fresh map each call, so `dropDates` mutating it in place harms no other reader.
- The hidden man (SANS off): `peopleCountedFor` lays his stored posting (with his earlier stints) on the bare projection;
  Approvals' own use of the same list only reads his seat.
- Show SANS on/off: `windowFor` keeps `from` and `past` whatever the switch says (only `to` changes), so the post-in drop
  does not move with the switch.
- Every reader of the figures: Balances page, person window (both read `notTyped`); grid figure, My leave, Approvals' LVE
  BAL, the leave buttons' "left" read the War bal number as before — the number counts from 0 underneath, by design of
  this build (no new look yet); none reads a wrong number beyond that.
- The below-zero question: both doors (the one-day/drag bid window via BidPicker, the several-people sheet via SelectSheet)
  go through `goesBelow`, which now waits for a typed figure; OIL is untouched; a fill on days before the post-in date
  spends nothing, so it never asks.
- The empty box (`FigBox blank`): an emptied or untouched box saves nothing; any figure typed, 0 included, saves (the held
  figure is NaN); Enter, leaving the box and the box leaving the screen all go through the same compare.
- Carried forward typed first on a never-typed LVE is refused (CF_FIRST) at the one save door both screens use.
- History and Undo: a first typing writes "LVE balance → 24" (no "from"); the Undo label says the same; Undo of a first
  typing removes the row, so the screens read "Not typed" again; the gate (`perms.ts` lw.balance, `readTypedBalShape`,
  the snapshot compare) is unchanged and still holds a member's write.
- Doors that could make a balance look typed: only `setTypedBalance` (both screens), the demo boot writer, Undo/Redo, the
  load of saved rows and the developer-only probe; old openings have no production writer.
- "Official bal": every on-screen label and screen-reader name changed (Balances page phone and desktop headings, the
  person window's tile, both boxes' names, so the "Blocked: …" note too); "App bal" remains only in code comments.
- The one line "Only leave after post-in is deducted.": shown under the LVE box only where boxes are drawn, and once above
  the rows only in the Balances view and only when some row has boxes (an admin always, a member while unlocked).
- Hostile time zone: every new date test is plain `yyyy-mm-dd` string comparison; no Date is built in the changed code.
- No test weakened: the changed tests type a figure first where the old ones relied on a never-typed 0 asking, and the
  first-typing history test now expects no "from", matching D2746.

Findings: 1 (F1). Questions: 2. Tidiness: 3.
