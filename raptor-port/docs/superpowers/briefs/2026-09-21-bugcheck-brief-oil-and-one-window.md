# BUG-CHECK BRIEF — the OIL rulings and the one input window (21 Sep 26)

**This is a brief for an INDEPENDENT REVIEWER, not a plan to build.** The work is already
built, on branch `claude/s4-bughunt`. Review the diff `git diff 9c45af9..HEAD` (36 files).
Do NOT apply fixes. For every finding give an exact, step-by-step fix specification —
file, function, the precise change — plus a concrete failing scenario.

The app is a squadron flying-programme and leave-management app. The "owner" below is the
product owner; every change here is one of his rulings, given 20–21 Sep 26.

---

## What was built

### 1. An awarded OIL day no longer flags a leave day
`forbiddenPair` in `src/leavewar/engine/dayview.ts` now returns false for any pair where
either side is a credit that is not `auto`. A hand-typed OIL credit ("an award") says a man
is OWED a day, not where he was, so it cannot contradict leave or a medical. A credit the
app earned off the published schedule (`auto`) still flags.

### 2. An award no longer counts a man as ON DUTY
`DayView.duty` is now `shown.some(c => c.kind === 'credit' && c.auto)`. Ruling: "it
shouldn't by default take him as on duty … count the manning based on the schedule …
unless it's stated in the input or the schedule". **This moves manning figures**:
`duty` feeds `haveOf`, `ruleHave` and `countsFor` in `src/leavewar/engine/availability.ts`.

### 3. A warning when a worked weekend earns nobody anything
The defect it closes: a man was put on the SDO desk for a Sunday, the day was published,
and no OIL appeared — because the desk had no start and end times, so it measured nothing
and minted nothing. Correct, and completely silent.
- `dayOilBlind(day)` and `blindDesks(names)` in `src/engine/oil.ts`.
- `OIL_NO_TIMES`, a `hard` warning raised per day in `src/engine/validate.ts`, scoped to
  weekends (from `day.dow`) and public holidays (from a new `HOOKS.oilEarningDay`, wired
  in `src/leavewar/sync.ts` to the same `isNonWorkingISO` the credit itself is drawn from).
- `warnNobodyEarnsOil` in `src/leavewar/sync.ts`, a toast at the publish moment.

### 4. OIL says why it is there, who gave it, how many days
- `CreditRec.via: 'schedule' | 'input'`, recorded by `ingestDutyCredit`, carried from
  `desiredOilCells` (a day backed by both reads as the schedule's).
- `creditGiver()` in `src/leavewar/engine/warrecs.ts` → "Weekend/PH" / "Duty input" for an
  automatic credit, the typed name for an award.
- Three read-back lines (reason / given by / days) added to the day window (`BidPicker`),
  the tap list (`DayList`) and the read-only sheet (`RaptorSheet`), and the giver added to
  OIL tracker rows.
- The read-only sheet used to tell an earned OIL credit it was "Filed on the Inputs page";
  it now says where its own fact lives.

### 5. One window for an input, in every stage
- The separate `DecisionSheet` is no longer opened by the grid. Its Ack / Approve / Refuse
  buttons and its Move field now sit at the top of the day window, on one row.
- `canDecide` changed from `admin && biddingClosed(stage)` to `admin && stage !== 'draft'`.
- "Pending" renamed to "Ack" on the button, the bulk decision sheet, the grid legend and
  the tap list. The stored state token is unchanged (`acknowledged`).
- Unchanged, and the owner's own exception: an input APPROVED and PUBLISHED offers remarks
  and nothing else; one not yet approved stays editable with the four answers on it.

---

## Where to look hardest

1. **Manning arithmetic.** Any path where a man is now double-counted, counted present
   while away, or removed twice. Other readers of `duty` — `codes.ts` `duty: true`,
   `isDuty`, `availabilityOf` — that may now disagree with the day view.
2. **OIL balance integrity.** Does the new `via` field break `ingestDutyCredit`'s
   idempotency (`JSON.stringify(had) === JSON.stringify(rec)`), the unpublish hand-back of
   an admin's own credit, or the reverse sweep that clears `auto` credits the schedule no
   longer backs?
3. **`canDecide` widened to the open stage.** Every caller. Anything using it as a proxy
   for "bidding has closed" rather than "may decide" — in particular `shiftBid`'s
   `shiftedFrom` provenance, which is only meant to be recorded once bidding has closed,
   and the bulk `setBidStates`.
4. **The new warning's scope.** Can `OIL_NO_TIMES` fire where it should not — a cancelled
   desk, an empty desk, a weekday, an unpublished draft, the byte-for-byte reference run?
   Is the `HOOKS.oilEarningDay` default (`false`) safe for every caller?
5. **The sheet consolidation.** Any cell / stage / role combination that now opens the
   wrong sheet, two sheets, or no sheet where one used to open: posted-out days,
   not-yet-arrived days, Raptor-owned cells, the free-half case, the published remarks
   editor, a member on their own row.

## What is already known green

All seven gates: `npx vitest run` 5220/0 · `npm run build` · `node reference/tfin.js`
728/0 · `npm run rulecheck` · `npm run test:e2e` 447/0 (45 skipped) · `npm run perf` 4/0 ·
`npm run smoke:tracker` 425/0. Hand-tested in the running app at desktop and phone width.

A green suite is not evidence of correctness for the parts nobody thought to test — the
manning figures and the OIL balances are exactly where a silent error would hide.
