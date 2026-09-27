# [LW-MOVE-STANDARD] — Astra's blind final code read (27 Sep 26)

Brief: `2026-09-27-lw-move-standard-final-read-brief.md`. Run: `codex exec -m gpt-5.6-sol -c model_reasoning_effort=high -s read-only` (the config's default model is refused on this account). Read-only; nothing run. Kept whole below.

---

1. HIGH — the combined validator does not model the exact records leaving each date.

File: `raptor-port/src/leavewar/state/store.ts:4081`, `raptor-port/src/leavewar/sync.ts:538-539`

Scenario: At CLOSED, one approved whole-day leave Input spans 11–12 Feb under one Input id; a whole-day bid sits on 10 Feb. Select 10–11 Feb and move the block two days. Expected: refuse the whole move because the bid would land on 12 Feb, where the unselected part of the approved leave remains. Observed from the code: line 4081 removes every destination absence sharing the moved Input id, without checking its date. It therefore treats the unmoved 12 Feb leave as departing, accepts the preview and can land the bid over it.

The inverse also fails: if approved leave on 10 Feb and a bid on 11 Feb are both moving one day, the leave should land on the day the bid vacates. The absence-door preflight still sees that bid at lines 538–539 and refuses the legal atomic move.

New or existing: EXISTING on `818dbb04`; the new record mover retains this validator defect and makes it relevant to the reviewed workflow.

Exact fix:

1. At line 4081, exclude an absence only when `iid`, `personId`, and its exact source `date === to` all match a moving absence.
2. Extend the absence-door preflight to receive the moving request ids/source addresses.
3. At lines 538–539, remove only those exact vacating requests before checking the approved leave’s landing.
4. Use that same virtual post-removal snapshot for preview and commit.
5. Add tests for both scenarios above, asserting refusal/success respectively, no partial writes, and one Undo restoring both record types.

2. MEDIUM — a picked range cannot expose Decide when the tapped day itself has no bid.

File: `raptor-port/src/leavewar/ui/Matrix.tsx:4572`, `raptor-port/src/leavewar/ui/BidPicker.tsx:417`

Scenario: At CLOSED, 10 Feb is empty and 11 Feb has a bid. Open 10 Feb, choose Pick a range through 11 Feb. Expected under D335: Decide appears and Ack/Approve/Refuse acts on the bid in the selected range. Observed: Matrix creates the `decide` prop solely from the tapped 10 Feb cell; BidPicker renders the row only when that prop exists. Move and Delete correctly re-evaluate the range, but Decide remains absent.

New or existing: NEW in this change; range-wide Decide is part of the newly implemented D335 behavior.

Exact fix:

1. Add a read-only `decidableIn(cells)` store helper using the same eligibility logic as `setBidStates`.
2. In BidPicker, derive the Decide row from `decidableIn(selCells())`, not only the tapped cell’s `decide` prop.
3. Keep `decide.state` and `movedFrom` only for the single-day display.
4. Add tests starting from an empty and an award-only day whose picked range contains bids; assert the row appears and each action reaches all eligible days. Also assert it remains absent for a range with nothing decidable.

3. LOW — the move banner silently omits refused history that stays behind.

File: `raptor-port/src/leavewar/state/store.ts:4043`

Scenario: Refuse a morning bid, then create a new live morning bid beside it. Move the live bid from the list or a block. Expected: the banner says one bid/refused bid stays, matching the approved reading that everything unable to move stays and is named. Observed: `stayingIn` deliberately excludes refused requests, so the live bid moves while the refused record remains without being mentioned.

New or existing: NEW; `stayingIn` and this banner were added by the reviewed change.

Exact fix:

1. Count every non-moving request at the selected address, including refused requests.
2. Either retain the existing “bid stays” wording or add a distinct “refused bid stays” label.
3. Extend the existing S32 store and rendered-banner tests to assert that the history is named and remains at its source.

4. LOW — a live source change leaves move mode wired to stale records.

File: `raptor-port/src/leavewar/ui/Matrix.tsx:1280`, `raptor-port/src/leavewar/ui/Matrix.tsx:1291-1310`

Scenario: Pick up a record, then let a same-war sync replace or remove it without a stage, war, Undo, or page change. Expected: move mode ends with an explanation. Observed: `movers` recomputes from the store, but `wireMove` is installed only on `[moveSel]`, retaining callbacks over the old mover array. The rendered banner can fall to zero entries; phone Confirm can silently dismiss through the null-anchor branch, while desktop still invokes the stale callback and reports “Nothing to move” without ending the mode.

New or existing: EXISTING on `818dbb04`.

Exact fix:

1. Store the latest movers/anchor/handlers in refs, or rewire the effect whenever their identities change.
2. When an armed selection resolves to zero records, clear landing and preview, end `moveSel`, and show “That record changed or is no longer there — Move ended.”
3. Add a component test that arms Move, mutates/removes the source through the store, and verifies no zero-entry banner, stale landing, or write.

Explicit negatives:

- I checked the one-day sheet, drag-selection sheet, and day list and found no other missing Move/Delete renderer or inconsistent button implementation.
- I checked the shared Move/Delete component, row order, teal-arrow styling, dashed Delete styling, “PO” wording, and removed date box and found nothing else.
- I checked member permissions at the UI and store doors and found no route to another person’s row or a member move after bidding closes.
- I checked awards and found no path that moves one; admin Deletes still name hidden awards where D260 requires confirmation.
- I checked list selection by record id and found no path that substitutes the day’s top record.
- I checked successful move grouping and found no separate Undo step for requests versus approved leave; both join `lw.move`.
- I checked refused-bid eligibility and found it consistently lands undecided, except when a live bid owns the same half as intended.
- I checked published approved leave and found it stays put while movable bids travel, with the approved leave named in the banner.
- I checked stale record ids at the store boundary and found no stale write: eligibility and existence are revalidated before mutation. Finding 4 is the remaining UI lifecycle problem.
- I found no migration or old-demo-data-only issue worth reporting.
- Per the brief, I did not run the app or tests, did not edit files, and did not open any `*-final-fable.md` file.

