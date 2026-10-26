# The night of 25 Oct 26: the narrow read of the fix commits

Reader: Opus 5.5, fresh and blind. I wrote none of these fixes and read none of the re-walk. Read-only: this file is the
only one changed. Read: `git show b31a10e54 / b0682e34a / 7a6cf3e98 -- raptor-port/src`, the findings they answer
(the evidence sheet §12: F1, F2, W1, W4; `read-opus.md`: R1 to R6) and the live code around each fix: `store.ts`
(`gesture`, `setRemarksOn`, `setRequestWords`, `setBidStates`), `sync.ts` (`doorApprove`, `doorDecideApproved`,
`askFiledOil`, `inputById`), `state/store.ts` (`runInputWrite`), `command/commit.ts` (dispatch, child join, rollback),
`state/perms.ts` (the member's closed-day check, `onlyChangesWords`, `inputBreach`), `ui/inputedit.tsx`
(`setLeaveRemarks`, `commitInputEdit`), `Matrix.tsx`, `SelectSheet.tsx`, `ReqWords.tsx`, `Sheet.tsx`,
`ui/FloatWindow.tsx`, `DayPanel.tsx`, `OilConfirm.tsx`, the CSS that stacks the bubble and the windows, and the tests
written with the fixes. Rule applied: the bug-check order's §5, "A fix is new code".
D56 applied: every finding below also hurts data written from now on.

## Findings

### N1 (low): R3's fix checks only the dragged day, so a member's refused bid that continues onto a closed day still loses every word he typed, and now his approved leave's words go with them
**Steps.** Member Ranger. He has refused OL bids on Tue 10 and Wed 11 Feb, one run (same code, state and words). Tue 10
is closed for him (a day before his today, D1211, or a closed date). He also has a pending LL on Thu 12. He drags Wed 11
to Thu 12, types "Back Monday" and presses ✕ (or Move). Typing with his war-approved leave inside the drag shows the
second half of the loss.
**Wrong result.** Nothing is saved: not on Thu 12's pending bid, and not on an approved leave inside the drag. No
message appears. This is R3's fault, still present in the case R3 named ("or a refused run reaching into closed days").
**Cause.** `store.ts` line 3086 skips a refused bid only when the DRAGGED day is closed:
`if (!admin && r.state !== 'pending' && !dayWritable(date)) continue`. Wed 11 is open, so the bid is written, and
`setRequestWords` (3038–3063) writes the bid's whole run, which includes Tue 10. The commit refuses a member's change to
a refused bid on a closed day (`state/perms.ts` 865: the request must be pending to pass `onlyChangesWords`), and that
one cell refuses the whole command. Since R1 and R2, `keepWords` runs the approved leave's Inputs saves inside the same
command (`SelectSheet.tsx` 272–286). Those saves landed on their own before. Now they roll back too.
The R3 test (`dragwords.test.tsx`) closes the refused bid's only day, so it passes. It never covers a run that crosses the
closing line. (Not part of the finding: 'acknowledged' is gone (D1158, stored ones are read as pending), so
`state !== 'pending'` matches the commit's rule exactly.)
**Fix.** In `setRemarksOn`, for anyone but an admin, skip a refused bid when ANY day of its run is closed for him, not
only the dragged day:
```ts
if (!admin && r.state !== 'pending') {
  const k = reqRunKey(r)
  const twin = (d: string) => listAt(personId, d).some(q => q.kind === 'request' && reqRunKey(q as RequestRec) === k)
  let open = dayWritable(date)
  for (let d = addDays(date, -1); open && twin(d); d = addDays(d, -1)) open = dayWritable(d)
  for (let d = addDays(date, 1); open && twin(d); d = addDays(d, 1)) open = dayWritable(d)
  if (!open) continue
}
```
Pin it with this test: a refused run on D1–D2 with D1 closed, a pending bid on D3, a member's `setRemarksOn` over D2–D3.
D3 must then carry the words.

### N2 (low): `overPage` also covers windows that leave the page working, chiefly the day panel, so a tap in it no longer ends the bubble, and a panel over the Manning button hides the bubble under it
**Steps (a).** Desktop or phone. Tap a date heading: the day panel opens and the grid keeps working behind it (D641).
Tap a cell and place a bid that turns Available P amber. The bubble shows. Then press › in the day panel (his next tap),
or a key while the panel has focus.
**Wrong result (a).** The bubble stays up while he steps the panel through other days, still saying "This bid turns
Available P amber." D1277 says "it goes at his next tap or key". Before F1, it went.
**Steps (b).** Desktop. Drag the day panel by its bar until it lies over the Manning button (upper left). Place a bid
that turns a row amber.
**Wrong result (b).** The bubble is drawn under the Manning button, beneath the panel (`.mn-bubble` z-index 6,
`.floatwin` z-index 410), so it is never seen. Before F1, the words went to the foot with Show ›, where he could see them.
**Cause.** `Matrix.tsx` 1510–1511, `el.closest('.airpop, [role="dialog"]')`. F1's real window is an `.airpop` (the input
editor and its OIL question, `OilConfirm.tsx` `.oilconf-pop`). `[role="dialog"]` also matches every float window,
`ui/FloatWindow.tsx` 243 (`role="dialog" aria-modal="false"`): the day panel (`DayPanel.tsx`, `floatwin lwday`), which
stands open while bids are placed, and the war's non-modal sheets (`.bidsheet.nonmodal`). The check is used at 1517
(`manningInView`), 1573 (`onDown`) and 1576 (`onKey`).
**Fix.** Keep the exemption for windows over the page, but not for the war's own windows that stand open while the grid
is worked:
```ts
const overPage = (el: EventTarget | Element | null): boolean =>
  el instanceof Element && !!el.closest('.airpop, [role="dialog"]') && !el.closest('.lwday, .bidsheet.nonmodal')
```
Do not narrow it to blocking windows only (`:not([aria-modal="false"])`). The OIL list that a drag over several men opens
(`sync.ts askFiledOil` → `ui/OilDayList.tsx`) is itself a float window, and it is F1's case again: the filing opened it at
the same moment as the bubble.

### N3 (low): a refusal thrown inside the joined Approve command now raises an error in the drag window instead of its note
**Steps.** Admin. Ranger's war-approved LL ends on a day of a week the app keeps read-only (a protected week: a stored
week it cannot read, keeps as recovery evidence, or whose book it does not support, `engine/quarantine.ts`). His pending LL
with the same words is on the next day, in an ordinary week. Drag that one day (one man) and press Approve.
**Wrong result.** The locked-week toast appears and nothing is approved, as before. But the window then gets no note: the
press raises an uncaught error (it tries to read the decision's counts from `undefined`) and the window stays as it was.
Before R1, `setBidStates`' own command absorbed the refusal and the window said "Nothing to decide" or closed cleanly.
**Cause.** `doorApprove` extends the neighbouring leave (`sync.ts` ~469–486). That leave covers a protected date, so
`runInputWrite` throws CmdRefused (`state/store.ts` 202–211). The Inputs write is a joined child (`command/commit.ts` 149,
374), so the throw leaves the outer command's body. `gesture` then returns `out`, which was never assigned
(`store.ts` 2757–2778). `inOneWarCommand` passes that `undefined` on, and `SelectSheet.tsx` 299 destructures it.
`setBidStates` was never exposed to this, because it returns counters declared outside its command (3477, 3519).
This happens only with a protected week, which is rare, but such weeks keep arising (a truncated read makes one). Any
future refusal thrown inside this command would do the same.
**Fix.** In `decide`, use a result that cannot be missing, in the same shape as `setBidStates`:
```ts
let res = { decided: 0, skipped: 0, already: 0 }
inOneWarCommand('lw.decide', () => { keepWords(); res = setBidStates(sel.cells, bid) })
const { decided, skipped, already } = res
```
Or make `inOneWarCommand` hand back a fallback the caller supplies when the body threw.

### N4 (low): the drag window re-saves a war-approved leave whose till already matches its own, writing a false "changed by … · now" on it
**Steps.** Admin. Ranger's war-approved leave on 10–11 Feb has its till unticked (approved from unticked bids: the tick
carries over, D1226). He also has a pending bid on 12 Feb. Drag 10–12 Feb, untick the window's till (for the bid) and
press ✕.
**Wrong result.** The leave changed in nothing, but its line on the Inputs page now reads "· changed by <admin> · <now>"
(`ui/placedline.ts` 57–60). Where nothing else in the drag changed, the press also leaves an Undo step whose only change
is that stamp. Each later keep of the same words (a new drag's flush, then ✕) stamps it again.
**Cause.** `SelectSheet.tsx` 283 saves the leave whenever `till !== undefined`, even when the leave already shows that
till. `commitInputEdit` stamps every save (`stampChanged` → `modBy`/`modAt`). The bids' side is guarded correctly
(`r.till !== till`, `store.ts` 3090).
**Fix.** `if ((t && t !== was) || ids.length !== rowDocIds(row).length || (till !== undefined && tillShown(row) !== till))`
(`tillShown` from `engine/inputs`).

## Read and found sound

**The Show guard (F2, narrowed by R6).** It swallows only a pointer's click (`detail > 0`) whose target is in `.mx`.
- A tap's click carries detail 1 in Chromium and WebKit, and a mouse's carries 1 or 2. Only a key's click carries 0. So
  F2's second touch is caught.
- `.mx` is the grid table and both of its drawn copies: the stuck date row (`.mxfixed`) and the frozen columns
  (`.mxband`). After Show scrolls the page up, the grid is what lies where the foot note stood.
- A cell opens its window on `onClick` (`MatrixRows.tsx` 534). Stopping the click at the document's capture phase stops
  it before React's root listener sees it.
- Show's own click is not eaten: the guard is added during that click's bubble phase, after the capture phase has passed.
- A drag's pointerdown and pointerup are untouched, and the selection machine's own trailing-click swallow is a separate
  listener.
- The Manning button, the top bar, the tabs and the pop-ups lie outside `.mx` and go through.
- Each arm clears the last, and the guard ends with the grid (unmount).
- Untested, but not a fault: R6's "a key's click goes through" test clicks the Manning button, which is outside `.mx`, so
  it passes on the area rule, not the `detail` rule. Nothing pins a key's click inside the grid. On a phone with the day
  panel at the foot, a second fast tap lands in the panel and acts there. That is outside the grid, and minor.

**`overPage` (F1, R5) for F1's own case.**
- The OIL question is an `.airpop`, and the input editor it opens over is one too. Both match. Hidden `.airpop`s are
  never hit or targeted.
- The OD is already filed when the question opens (`askFiledOil` runs after the filing, as a deferred effect). So a bubble
  kept up through Cancel is still true.
- The bid window can never count: its sheet unmounts with no exit animation before the raise effect runs.
- No window is always open, so the bubble never stays up for good. The next tap or key on the page ends it.
- R5 is right and complete for its case. N2 is the one overreach.

**`inOneWarCommand` (R1).**
- The nested gestures run inline (`gesture`: `cmdIsCommitting()` → `fn()`).
- `setLeaveRemarks` → `writeInputsBatch` → `commitInputsWith` joins as a child of the running command
  (`dispatch` → `active.api.child`). It shares the snapshot, the rollback and the one envelope, so one Undo takes the
  decision and every word back. The pinned test proves this for Refuse, and the door's approve already relied on the same
  joining.
- A refusal does not now roll back what it should not:
  - For an admin, the commit refuses nothing in the words part. The closed-day check, the UNA check and the input-owner
    check are a member's.
  - A member never decides (`canDecide`).
  - The member's own combined keep is N1. A thrown refusal is N3.
- The decision now counts twice in the placing count. That is harmless: the bubble needs only that the count moved.

**`setRemarksOn` and `keepWords` (R2, R3, W4).**
- An admin is never skipped.
- `dayWritable` is the same rule the commit's day-open check asks (`sync.ts` 258: `canEditCell` with the member's today).
- Documents are only ever added: bids get a union, the leave gets a union of `rowDocIds`. None is taken away. A bid holds
  at most 20, as everywhere else.
- The till is written only where the window holds a choice. Its one-row box stores only `false` (`ReqWords.tsx` 136).
- Revisiting the days of one run is idempotent.
- The leave's remark is `t || was`, so a documents-only keep leaves its words unchanged.
- Only war-approved leave is written (W4: `!row.lw`).
- A shared leave splitting mid-command is followed by `seen` on the next day.
- The remark is trimmed now (the earlier read's trim note is answered).

**The flush (R4).**
- It is called only from `onSelect`, and only while a selection is up: `selRef` holds the selection as of the latest
  render, so a window already closed is never flushed.
- The resets clear the selection without calling it: the open dates, the period and the Undo epoch (`Matrix.tsx` 666),
  as R4 asked.
- `flushRef` is reassigned on every render, so it holds the live window's latest draft.
- A new drag with the same key re-keeps the same words. That is idempotent.

**His leave's one row re-reads its input by id (W1, b0682e34a).**
- `usePlanVersion` is the Inputs' change signal (`useSyncExternalStore` on Raptor's version).
- The same iid always gives the same record.
- After a member's split, the window that opened it re-derives the record it shows on the war's repaint (the absence
  signature carries the iid), so the row follows his new input.
- A deleted input falls back to the record the window was given, and the save refuses with its own toast, as before.
- An Undo that replaces the record now reads the live one, which is better than before.
- b0682e34a only routes the same lookup through the Leave War's door (`sync.ts inputById`), as the guard asks.

## Readings for the host, not findings
- The drag window's till tick starts ticked, whatever the dragged entries hold. Unticking writes `false` on every one of
  them, but the window can never re-tick an entry that is already unticked: ticking back means "no choice", and nothing is
  written. This follows from R2's "the till only where the window holds a choice". Whether the tick should show the
  entries' own state is a design question.
- `setRemarksOn` counts the writes made inside its command even when the commit then refuses the whole command, so its
  return says "changed" when nothing was. No caller reads it today.
