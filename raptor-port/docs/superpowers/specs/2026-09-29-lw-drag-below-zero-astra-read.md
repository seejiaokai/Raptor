# Astra's code read of [LW-DRAG-BELOW-ZERO] (29 Sep 26) — kept whole

Codex gpt-5.6-sol, high effort, read-only, after the walk; the finder brief of `docs/bug-check-order.md` §4. Its four findings and their dispositions: `docs/handpass/2026-09-29-lw-drag-below-zero.md` §10.

---

CHANGES REQUESTED - 4 findings.

Findings

1. High - Mixed half-days can be written below zero without any warning

File: raptor-port/src/leavewar/engine/counters.ts:210

Concrete failure scenario:

- Setup: a person has 0.25 FCL remaining and an existing AM FCL request on a weekday.
- Action: drag-select that day, choose PM, then tap FCL.
- Expected: the first tap says the resulting balance is -0.25 FCL and writes nothing.
- Actual: `drawIfWritten` appends a source containing only the new PM request. `chargedDays` treats that appended source as the whole day's charge, so the existing AM half disappears from the hypothetical calculation. The predicted additional draw is zero, although `setCell` preserves the AM request and adds PM. The first tap therefore writes the PM half and the real balance becomes -0.25 without asking.
- Observation disproving correctness: after the first FCL tap, both halves are present and the balance is negative, but no `sel-note` appeared.

This can undercount by more than half a day when completing the fifteenth full LL/OL day for a pilot, because the real write can activate the 15-day weekend/PH charging rule while the hypothetical source still contains only one half.

Exact fix:

1. Stop modeling the write as a new legacy source containing only `{ date: code }`.
2. For every candidate date, obtain the current merged `DayView`.
3. Remove only non-refused requests whose portions overlap the new request, exactly as `liveRequestsOn` does.
4. Preserve the other half, filed absences, credits, refused history, and notices.
5. Add the prospective pending request and rebuild that date with `dayView`.
6. Feed those replacement views into `chargedDays` as explicit date replacements. When replacing a date, update both `taken` and `annualFull`; explicitly delete the previous `annualFull` membership when the replacement is not a full LL/OL day.
7. Add tests for:
   - AM FCL plus prospective PM FCL;
   - AM LL plus prospective PM OL;
   - completing a pilot's fifteenth full annual-leave day;
   - replacing only one half while the other half spends another counter.

2. Medium - A confirmation remains armed after the selection or action changes

Files:

- raptor-port/src/leavewar/ui/BidPicker.tsx:300
- raptor-port/src/leavewar/ui/BidPicker.tsx:383
- raptor-port/src/leavewar/ui/SelectSheet.tsx:140
- raptor-port/src/leavewar/ui/SelectSheet.tsx:168
- raptor-port/src/leavewar/ui/SelectSheet.tsx:225

Concrete failure scenarios:

- One-day range:
  - Start with zero CCL.
  - Tap CCL for one day and receive the "-1 CCL" warning.
  - Change How many to a three-day range; this clears the note but not `confirming`.
  - Tap CCL once.
  - Expected: a fresh "-3 CCL" warning.
  - Actual: the three-day range writes immediately because `confirming` still equals `CCL`.

- Drag sheet portion:
  - Ask for Whole day CCL.
  - Tap AM, then Whole day again without tapping a leave in between.
  - Tap CCL once.
  - Expected: a fresh ask after changing the portion.
  - Actual: the old whole-day confirmation is still armed.

- Drag sheet Decide:
  - Ask for a below-zero fill over a selection containing one decidable bid and one skipped cell.
  - Tap Refuse; the partial decision keeps the sheet open and replaces the visible warning with the decision note.
  - Tap the previously warned leave once.
  - Expected: a fresh ask because another action intervened.
  - Actual: it writes because `decide` never clears `confirming`.

Exact fix:

1. In both sheets, add one helper that clears `confirming` and clears a leave-positioned warning.
2. Call it whenever the portion changes.
3. In `BidPicker`, call it whenever the single-day/range mode or range dates change.
4. In `SelectSheet`, call it before every Decide action and when PO controls are opened or changed.
5. Keep Delete using the same helper instead of its separate reset.
6. Prefer storing a confirmation token containing the formatted code, writable date set, and predicted people/counter/after values, rather than only the code.
7. On every leave tap, recompute that token; write only if it exactly matches the immediately preceding token.
8. Add regression tests for the three sequences above.

3. Medium - OIL expiry/FIFO warnings do not predict the OIL balance

File: raptor-port/src/leavewar/ui/Matrix.tsx:1085

Concrete failure scenario:

- Setup: grant one OIL day on 1 Jan with 30-day expiry; set the current calculation date after expiry. With no debit, the unused credit has expired and OIL BAL is 0.
- Action: place an OIL day dated 15 Jan, before that credit expired.
- Expected: the leave consumes the otherwise-expired credit, so the resulting OIL balance remains 0 and the first tap writes.
- Actual: `balanceAfter` takes the current expiry-adjusted balance, 0, and subtracts the raw one-day draw, producing -1. It displays a false below-zero warning even though the OIL tracker will still show 0 after writing.
- Observation disproving correctness: warning says "-1 OIL"; after confirmation, the tracker and balance column show 0.

Exact fix:

1. Reuse the corrected prospective source set from finding 1.
2. For OIL, build a prospective `FigureCtx` with those sources.
3. Run `oilLedgerOf(prospectiveCtx, personId).balance`.
4. Do not subtract `drawIfWritten` from the current expiry-adjusted balance; FIFO and expiry are not linear.
5. Add tests covering:
   - a debit consuming credit that would otherwise expire;
   - a debit after the credit's expiry becoming unbacked;
   - multiple FIFO credits with different expiry dates.

4. Low - Already-negative balances trigger warnings for writes that spend nothing

Files:

- raptor-port/src/leavewar/ui/Matrix.tsx:1089
- raptor-port/src/leavewar/ui/SelectSheet.tsx:128
- raptor-port/src/leavewar/ui/BidPicker.tsx:301

Concrete failure scenario:

- Setup: a person's FCL balance is already -2.
- Action: select a weekend that costs no FCL, or retry the same leave after a partial write has already filled every writable cell.
- Expected: no below-zero ask, because the action does not reduce the balance.
- Actual: `drawIfWritten` returns zero, but `balanceAfter` returns `after: -2`; both sheets warn because they test only `after < 0`.
- Observation disproving correctness: the message says "That takes X to -2 FCL" even though the balance remains -2.

Exact fix:

1. Have `balanceAfter` return both `before` and the true counterfactual `after`.
2. Ask only when `after < 0` and `after < before`.
3. Apply this predicate in the shared Matrix result so both sheets cannot diverge.
4. Add tests for an already-negative weekend, an exact same-code no-op, a cheaper replacement, and a partial-write retry.

Production coverage inventory

- One-day fill:
  - Visible door: tap an editable Leave War cell.
  - Renderer: `BidPicker`.
  - Sign: warning under Which leave.
  - Gesture: tap the identical leave/portion again to write.

- One-person multi-day fill:
  - Visible door: BidPicker, How many, Pick a range.
  - Writer: `setCellRange`, then `writeMany`.
  - Sign and confirmation gesture: same as the one-day door.

- Multi-person or rectangular fill:
  - Visible door: mouse drag on desktop or hold-and-drag on phone.
  - Renderer: `SelectSheet`.
  - Writer: `setCells`, then `writeMany`.
  - Sign: one sentence under Which leave naming every affected person.
  - Gesture: tap the identical leave/portion again once for the whole block.

- Qualifying balances:
  - LL and OL use LVE.
  - OIL uses the FIFO/expiry tracker balance.
  - CCL, FCL, PL, EL, and CL use their counters.
  - Full, AM, and PM portions must be evaluated separately.
  - Weekend/PH charging and the pilot 15-day LL/OL rule apply.

- Readers and downstream displays:
  - `balanceAfter`, `drawIfWritten`, `chargedDays`, `dayView`, `balanceOf`, and `oilLedgerOf`.
  - The balance column, figure drawer, person breakdown, and OIL tracker must show the number predicted by the warning.

- Roles:
  - Admin fills permitted rows through both sheets.
  - Members fill only their own editable row.
  - Both roles reach the same `balanceAfter` callback.

- Meaningful action orders checked:
  - ask, same leave, write;
  - ask, different leave or half, ask again;
  - ask, Delete, ask again;
  - ask, partial write, retry;
  - ask, Decide, retry;
  - ask, change portion away and back;
  - ask, change a one-day selection into a range.

Explicit negatives

- I found no other production call site that fills leave across several Leave War days. Multi-day writes converge on `setCellRange` or `setCells`.
- Approve does not newly consume a balance because pending and acknowledged bids already charge; Move is a different operation rather than a fill door.
- `cellProblem` is applied before prediction, so locked, role-refused, medical-blocked, and outside-window dates are excluded.
- No timezone conversion was introduced: the new path uses ISO dates and the existing UTC-safe date helpers. I found no Pacific/Midway-specific defect.
- The shared wording correctly says LVE rather than ANNUAL.
- The SelectSheet warning is not lost when the leave row is absent: every role/state that can reach this fill path renders Which leave.
- Delete's warning is placed under Selected; Decide and PO notes remain at the foot.
- I found no additional expectation using the old ANNUAL wording. The updated LVE assertion is consistent with the visible column.
- The synchronous input-calendar tap helper still exercises the real native pointerdown/pointerup path. Dedicated fake-timer tests continue to exercise the 180 ms and 450 ms hold branches.
- The JAN e2e branch is not vacuous: if January and December are both present in the contiguous month window, all 12 months must be drawn; otherwise the test still requires December to be pruned.
- I found no migration or old-data-only issue under D56.

Checks

- `git diff --check HEAD`: PASS.
- Focused Vitest command: NOT RUN. Vitest failed before collecting tests because the read-only environment refused creation of its temporary `client` directory with `EPERM`.

