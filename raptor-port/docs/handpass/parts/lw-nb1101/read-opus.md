# The fresh, blind Opus code read — the Leave War's next batch (1 Nov 26)

A fresh Opus helper that wrote none of it, read-only, handed commit `b88727483` (the diff from `3833780ad`), the evidence sheet
as it stood after the walk, the designer's report, the four items, the rulings' full rows, the finder brief and the D56
exclusion. Saved whole as it arrived; the dispositions are in `../../2026-11-01-lw-next-batch.md` §The code read.

---

**Fresh, blind code read of the Leave War's next batch at `b88727483`: 1 finding, 2 smaller notes, and the negatives**

I read the whole change and the code around it: `state/person-delete.ts`, `leavewar/sync.ts` (the approve, move, re-type and remove doors and the posting helpers), `undo/timeline.ts` (every place that calls the refusal), `state/undo-wire.ts`, `ui/Matrix.tsx`, `ui/BidPicker.tsx`, `leavewar/state/store.ts` (`moveRecords` and how a move is validated), the e2e change, the four backlog items, and the full rows of D1541, D1545, D287, D148, D1553, D1371, D948, D1150 and D1525. I ran nothing.

## Finding 1 (CONFIRMED by reading; I could not run it): an Undo of one move that carries a bid AND approved leave is refused, though the live door allows it

- **Setup**, using `deleteposting-restore.test.ts`'s own fixtures (signed in as `ad`, today 15 Jul, `PO` = 18 Jul):
  ```
  setCell('bane', AFTER, 'LL'); approve('bane', AFTER)        // approved LL 20 Jul
  setCell('bane', AFTER2, 'LL')                                // pending bid 21 Jul
  expect(moveCells([{ personId:'bane', date:AFTER }, { personId:'bane', date:AFTER2 }], 2)).toBe('moved')   // lands 22 and 23 Jul, one 'lw.move' step
  post()                                                       // Delete posting, refuses from 18 Jul
  const r = globalUndo()
  ```
- **Expected:** `r.ok === true`. The leave goes back to 20 Jul and the bid to 21 Jul. It is a move, and the live Move refuses no posting day (`doorMoveApproved` and `moveRecordsProblem` never ask about the posting). The Redo of the same step also passes.
- **Predicted:** `r.ok === false`, with "Can’t undo that — Ranger posts out on 18 Jul, so leave from that day can’t be approved".
- **Variant:** call `post()` before the move. The live move succeeds, then its Undo is refused.
- **The refused step blocks everything older:** the refusal is not passed over, so every later Undo press lands on the same step. All of the admin's older steps stay out of reach until the posting changes.
- **Cause:** `state/person-delete.ts`, `replaysApproval`, the Undo branch (`takesBid`, about lines 349–357). It judges "a request taken off" one record at a time: is the request id in *that day's* after-image? A request the step carries to another day still counts as taken. The Redo branch already excludes carried requests (`before` / `after` across the whole step); the Undo branch does not.
  - This branch was moved whole from `deletedRestoreProblem`. It now also runs for a man who is not yet deleted, whose leave the live door does move, so the new use is where it shows.
- **Fix, step by step:**
  1. In the Undo branch, replace the per-record `takesBid` with the Redo branch's whole-step set. Gather his request ids from every `lw.cell` before-image on days ≥ `from`, and his request ids from every after-image. A request counts as taken only if it is missing from all of the after-images.
  2. Keep the existing "writes his war-approved leave (`inputs` put, `lwDays(after) > 0`)" test. Optionally use the Redo's per-day window test (`winsOn` / `covered` on the taken days) for the Undo too, so both directions share one body. The send-back Undo, Approve → Refuse, and two-day send-back tests still refuse under either version.
  3. Add a test that fails before the fix: the scenario above, `globalUndo().ok` true, then leave on 20 Jul and the bid on 21 Jul. Add a twin with the posting set first.

## Note A (a design question, not a finding): a refused posting step blocks older steps

Unlike a deleted man's step, which is passed over and cached, a posting-refused step is refused on every press, and the message does not say how to get past it. This matches the existing medical-filed-since and roster refusals, so it is consistent. Whether to pass over a step that is "refused for now" is for the host or the owner to decide. Finding 1 makes it worse; fix that first.

## Note B (low): the pinned clock depends on the machine's time zone

`e2e/leavewar.spec.ts`: `PIN_T0 = '2026-11-04T09:00:00+08:00'`, and Playwright sets no `timezoneId`, so the browser uses the host's zone. On a machine west of UTC−1 the page's today is 3 Nov, and `pinnedToday` fails. It fails loudly (it does not skip), and GitHub's UTC machines and his Singapore PC are both fine.
- **Fix:** give the pinned tests `test.use({ timezoneId: 'Asia/Singapore' })` in a `describe`, or use `PIN_T0 = '2026-11-04T12:00:00Z'`, which holds from UTC−11 to UTC+11.

## Explicit negatives (checked, nothing found)

- **Every place the timeline restores asks the new refusal** (`restoreRefusal`): `globalUndo` and `globalRedo` before the view moves; the check repeated inside the restore, now given the step; no batch undo or change-history jump exists in `timeline.ts` (the only callers of `applyRestore` are those two). The dispatcher's choice of the next step asks only the deleted-man check, which is right: the posting refusal must not be cached.
- **Approval doors:** Approvals, Approve all, the windows' Approve, and place-and-approve all go through `doorApprove`, inside `gesture`, which records the step as the Leave War's own. So the Redo branch's "Leave War steps only" filter covers them all. An approval that extends an approved run grows the record and is refused. A decision over two men checks each man separately; one man with no Delete posting is never refused.
- **What the restore lets through, against the live door:** Redo of a move (net zero, the request carried) passes, as the live door allows. Re-type and remove take no request. A Redo where the same day holds a refused morning approved and its afternoon sent back is caught by the per-day window test. `covered` treats morning plus afternoon as the whole day.
- **The posting rule matches the live door:** `postingRefusedFrom` uses the same record lookup and Delete-only rule as `postingOutWhy`, and hands a deleted man to `refusedFrom`. A SANS posting, an Overseas posting and no outcome all return nothing.
- **The deleted man's check:** moved without change in behaviour, except the intended per-day Redo test.
- **Performance:** `postingOutIds()` filters the people once per press (twice with the inner check), only on a press and never per frame. The per-man work loops only over the step's changes. Negligible.
- **Time zones:** the restore code compares dates only as ISO text. The tests set local `new Date(2026, 6, 15, 9)` under Pacific/Midway; I found no conversion between local time and UTC.
- **The free half's line (D1371, D1525, D948, D1150):** the half and the box are unchanged (the free afternoon gives the held morning, `top`, "AM"); the words now carry "till", and the documents show as chips; the new `free === 'full'` → null cannot happen, since `openFreeHalf` is only a half; the member and the admin see the same line; no other window prints a commitment's typed words alone. The day's list already prints the till; SelectSheet's are the remark editor's own.

## Tidiness (filed, not fixed)

- **Duplicated:** `reqIds` (Undo branch) and `reqsOf` (Redo branch) are the same filter.
- **Duplicated:** `postingRestoreWhy` works out `postingRefusedFrom` again, which `postingRestoreProblem` has just done.
- **Stale comment:** the doc comment above `inputRows` / `heldLine` in `ui/Matrix.tsx` (about lines 138–139: "its code and its typed remarks … null where …") still describes the old `heldCommitment`.
