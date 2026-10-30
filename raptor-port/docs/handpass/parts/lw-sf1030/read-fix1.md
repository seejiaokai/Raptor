# The narrow read of the fix commit fdc66f528 (30 Oct 26)

A fresh Opus reader (D790) of the fix commit only, handed the commit and the findings it answers
(`read-opus.md` beside this file). Its report as it arrived, saved by the night's coordinator before anything was done
about it. Its scratch tests: the coordinator's scratch folder `read3/r3.test.ts` (config `vitest.read3.config.mts`),
outside the repo — 12 tests, 4 failing, each one of the findings.

**Verdict:** both fixes incomplete; one false refusal new.

## Finding 1 — LOW-MEDIUM: the finding-2 fix lets approved leave back on days after a Delete posting's date when the posting ran late

The fix's comment says his days from the cutoff are still refused by the date check, "as for every deleted man"; but
for a posting the cutoff is `deleteCutoff(poDate)` — the later of the posting date and the day it ran — not the posting
date, so a posting with a past date, or one run at a later opening, leaves a gap: days the live Approve door refuses
(D1436, D1447 R20) and the restore now lets through.
- **Setup:** today 15 Jul; Ranger (`bane`) has a pending LL on 13 Jul; approve it; Undo.
- **Action:** `postOut('bane','2026-07-12','delete')`, `runPoOutcomes()` — the cutoff written is 15 Jul (`deletedFrom`
  2026-07-15, `to` 2026-07-11); Redo.
- **Expected:** refused — a live Approve on 13 Jul then says "He posted out on 12 Jul: refuse or delete it".
- **What happens:** the Redo returns ok and writes war-approved LL on 13 Jul. The same hole: the Undo of a send-back on
  13 Jul, the Redo of a place-and-approve (`placeApproved`) on 13 Jul.
- **Old or new:** on the parent 14403cf57 all three were refused (the request test ran for every deleted man); on `main`
  they passed (no check). The fix partly undoes the parent's guard.
- **Cause:** `person-delete.ts deletedRestoreProblem` — `if (!refusedWhole(id)) continue` skips both the Redo count and the
  request test for a man whose Delete posting has run; only the cutoff date check is left.
- **Exact fix:** in `sync.ts` export beside `refusedWhole`
  `export function refusedFrom(id){ if (refusedWhole(id)) return ''; if (!deletedMan(id)) return null; const k:any = getState().postOuts[id] || getState().people.find(p=>p.id===id); return k && k.to && outcomeOf(k) !== 'sans' ? addDays(k.to,1) : null }`
  (`''` every day; a date the first refused day — the same as `postingOutWhy`); in `deletedRestoreProblem` replace the
  `continue` line with `const from = refusedFrom(id); if (from == null) continue`; in `lwDays` count only
  `inputDates(row).filter(d => d >= from)`; limit `takesBid` to cells whose date (`parts[parts.length-1]`) is `>= from`;
  limit `writesLeave` to rows with some date `>= from`; pin with the three failing A tests in `r3.test.ts`.

## Finding 2 — LOW, new in this commit: a Redo of an admin's Inputs-page change that lengthens his war-approved leave is refused, though the live edit is allowed

- **Setup:** Ranger has an approved LL on 10 Jul; an admin lengthens it to 10–11 Jul on the Inputs page (an admin's edit
  keeps the war's mark — `inputedit.tsx`: `if (r.lw && !leaveSame && !canEditSched()) delete r.lw`); Undo.
- **Action:** delete Ranger on Admin → Users; Redo.
- **Expected:** it goes through — D321 (10): an admin may still add leave on a deleted man's past days; the same edit
  made live after his delete succeeds (scratch test).
- **What happens:** refused "Ranger has been deleted — that change can't be undone", and passed over for good (the
  refusal is cached on the step, `deadFor`); the Undo of the opposite edit (a shortening) passes.
- **Old or new:** the parent passed this Redo (the step touches no war cell).
- **Cause:** the Redo count reads only `inputs` changes, where an approval and a page edit are the same shape (`before.lw`
  and `after.lw` set, days growing). What tells them apart is the step's scope: `lw.placeApproved` / `lw.decide` are
  recorded under `module: 'lw'`, the Inputs-page edit `inputs.write` under `module: 'inputs'`.
- **Exact fix:** `undo/timeline.ts`: the hook becomes `deadRefusal?(changes, dir, entry?)`, `e` passed in `deadFor` and
  `entry` in `restoreCommit`'s second ask; `undo-wire.ts`: `deadRefusal: (ch, dir, e) => deletedRestoreProblem(ch, dir, e?.scope?.module)`;
  in `deletedRestoreProblem` run the added-days count only when `dir === 'redo' && module === 'lw'` (any other Redo:
  `continue`, or the parent's request test); pin with the failing B test.

## Observation, not a finding (older than this change, also on `main`)

For a man posted out but NOT deleted, a Redo of an approval made before the posting, on a day after the posting's date,
is not refused, where the live door refuses it (D1436, "wherever leave is approved") — reproduced with an Overseas
posting: the live Approve refused, the Redo ok. Neither `restoreBlocker` nor `deletedRestoreProblem` looks at posting
dates. Fixing Finding 1 by a general rule (a `postingOutWhy` test for any posted-out man) would close this too — that
widens the scope.

## Explicit negatives — checked, nothing found

- `refusedWhole` is a verbatim extraction of `approveWhy`'s first check (same `getState()`, `deletedMan`, `outcomeOf`,
  `poDone`): what Approve refuses is unchanged.
- Right now: the Redo of an approval, a Refused → Approve switch, a place-and-approve (bid window, drag window, two days
  of one man), an approval that extends a leave, a placing over his pending bid — all refused for a man refused whole;
  the Redo of a war move of his approved leave (tested), a removal, a send-back, a shortening, remarks edits on the war or
  the Inputs page (tested) — all pass, adding no days; an Inputs-page leave not war-approved passes; the Undo side's
  request test unchanged for a man refused whole — the send-back Undo and the Approve → Refuse Undo still refused, the
  Undo of a delete of his approved leave still passes; finding 2's days before the posting date approve on Undo and Redo
  as the live door does.
- The day count cannot be fooled: every approving war gesture only adds (Approvals passes one target state for all lines;
  BidPicker one line; `setBidStates('approved')` leaves approved days alone; `placeApproved`'s `writeMany` will not write
  over filed leave; the doors that take leave away never approve in the same gesture), so no approving step nets zero or
  below; a half day on the other half is a new row, +1; forward images carry `before` on a put (a remarks edit, a move
  count 0); two men counted per man — a two-man place-and-approve with one man deleted since refused whole, the other
  man too, by design (the earlier read's observation).
- The import cycle: `person-delete` and `sync` already imported each other; `refusedWhole` is called only at run time.
