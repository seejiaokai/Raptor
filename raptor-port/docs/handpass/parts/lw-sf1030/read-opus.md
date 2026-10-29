# The blind code read of `claude/lw-small-fixes-1030` at 14403cf57 (30 Oct 26)

A fresh Opus reader (D790), blind to the builder and to any other reader, read only; handed the evidence sheet
(`raptor-port/docs/handpass/2026-10-30-lw-small-fixes.md`) and the scenario list. Its report as it arrived, saved by the
night's coordinator before anything was done about it. Its scratch tests: the coordinator's scratch folder `read2/`
(`autoapprove-redo.test.ts`, `arrived-redo.test.ts`, `deletepost-redo.test.ts`, `vitest.read2.config.mts`), outside the repo.

## Finding 1 — MEDIUM: Redo of an Auto-approve placement brings back approved war leave for a man deleted since

A twin path the restore refusal misses; the gap is older than the change, but inside its own promise.
- **Setup:** admin, Auto-approve on (bid window or drag window); he places LL on Ranger's (`bane`) past day, 10 Jul — it
  lands approved; Undo.
- **Action:** delete Ranger on Admin → Users; Redo.
- **Expected:** the Redo passed over or refused, no war-approved leave written — the live door refuses the same (a placing
  with Auto-approve after his delete lands pending, the evidence sheet's S1-7).
- **What happens:** the Redo says ok and an approved LL input carrying the war's mark is written for the deleted man
  (proven by `arrived-redo.test.ts` — an arrived man — and `autoapprove-redo.test.ts` — one never arrived: both fail
  "expected length 0, got 1"; the control, placing over a pending bid already there, is refused).
- **Cause:** `state/person-delete.ts deletedRestoreProblem` fires only when the step's war-cell change takes a request away
  (`takesBid`); `leavewar/state/store.ts placeApproved` creates and approves the request inside one gesture, the change
  set is the net over the command, so on an empty cell there is no war-cell change and `takesBid` is false; the date
  check does not catch it, the day being before his cutoff. The same hole: the drag window's place-and-approve
  (`SelectSheet.tsx` → `placeApproved`).
- **Exact fix:** (1) `undo-wire.ts`: pass the direction — `deadRefusal: (changes, dir) => deletedRestoreProblem(changes as any, dir)`,
  `dir?: 'undo' | 'redo'` on `deletedRestoreProblem`; (2) in its per-man loop, when `dir === 'redo'`, count the
  war-approved leave days the step adds for him — the sum of `inputDates(ch.after).length` over every `inputs` change with
  `ch.after?.lw && inInput(ch.after, id)`, less `inputDates(ch.before).length` over every one with
  `ch.before?.lw && inInput(ch.before, id)` (forward images carry both sides); above 0 → the "<cs> has been deleted — that
  change can't be undone" sentence; it covers approve, place-and-approve and an approval that extends a leave, and lets a
  move, a delete or a remarks edit pass; (3) keep `takesBid` for `dir === 'undo'` (the builder's "Undo of its delete
  passes"); (4) pin it in `deletednorow.test.ts` (`placeApproved`, `globalUndo`, `deletePerson`, `globalRedo`), and the
  drag-window form (two cells, one man).

## Finding 2 — LOW: the restore refusal also blocks a Delete posting that has run, on days the live door still approves

New in the change (on `origin/main` the same Redo passes).
- **Setup:** `bane` has a pending LL on 10 Jul; approve it; Undo.
- **Action:** post him out from 12 Jul with Delete and let the posting run (`postOut('bane','2026-07-12','delete')`,
  `runPoOutcomes()`); Redo.
- **Expected:** the Redo succeeds — D1447 R20 and D1436: a day before the posting date approves; R3c-1 the same here;
  a live Approve on that day after the posting ran succeeds (`deletepost-redo.test.ts` test 1 passes).
- **What happens:** refused "Ranger has been deleted — that change can't be undone" (test 2); the Undo of a send-back on
  such a day is refused by the same rule.
- **Cause:** `deletedRestoreProblem` loops over every `PEOPLE[id].deleted` man, and the posting pass sets that mark;
  `approveWhy` exempts a kept war record with outcome `delete` and `poDone` — the two doors disagree.
- **Exact fix:** (1) `leavewar/sync.ts`: export one predicate from `approveWhy`'s first check —
  `export function refusedWhole(id: string): boolean { const kept: any = getState().postOuts[id] || getState().people.find(p => p.id === id); return deletedMan(id) && !(kept && outcomeOf(kept) === 'delete' && kept.poDone) }`
  — and make `approveWhy` call it (one body); (2) `person-delete.ts` (it already imports from `leavewar/sync`): start the
  new loop with `if (!refusedWhole(id)) continue` — the cutoff check still refuses his days from the posting date;
  (3) pin it with `deletepost-redo.test.ts` test 2.

## Observation, not a finding

A step that approved several men at once (Approve all, a drag window), made before one of them was deleted and undone,
can never be redone after his delete: the step is atomic and is passed over whole — Undo / Redo applies whole steps by
design; the other men's lines stay pending and are approved again by hand on Approvals. No fix; worth one line in the
evidence sheet.

## Explicit negatives — checked, nothing found

- **The restore check's reading of the records:** `Change` images, `invertChange`, `invertClosure` read rightly; an
  Approve's forward has the war cell as a delete whose `before` holds the request, a send-back's inverse the same shape;
  the Undo of an Approve → Refuse switch (D1428) and a Refused → Approve Redo both caught; the war-cell id split
  (`parts[length-2]`) matches `applyLwRecord`'s split from the right; `deadFor` caches only a refusal, so a step judged
  before the delete is judged again after.
- **No false refusals among the other doors:** a war filing (OD, CSE, Other or Attach through `doorFile`) writes no war
  mark, so is not refused; an Inputs-page leave over his bid is not refused (pinned); S1-6(b)'s on-screen words come from
  the older Approve step behind the passed-over send-back, as expected.
- **`approveWhy`:** a SANS man is never deleted (D1436, D283 untouched); a Delete posting set but not yet run, then deleted
  on Admin → Users, is refused whole; archive then delete refused whole; a reused callsign judged by id; every approving
  door goes through `doorApprove` → `approveWhy` (Approvals, Approve all, the bid window, the day's list, the drag window,
  place-and-approve).
- **The month memo — every value a month's cells read:** own day only — code, state, the open check, `raptorOwns`,
  `shiftedFrom`, stints through the person's identity; by identity as before — `lockedCols`, `evKind`, period, role,
  viewer, deciding, `movedShown`; neighbour views and run keys up to 2 days either side (`joinClasses` reads `has` at ±2,
  `JOIN_REACH` is 2); the bar's run key reads only the request's own fields, all in the records compared; no other
  `PersonRow` / `PersonMonth` caller, `recs` passed at the one site; each man's records keep their object between writes
  (`withList` copies only his part, the merged read keeps `war.recs`); a day in the next period reads nothing either side
  (views per war, no regression); a mid-month write still redraws one month, a write within 2 days of a month's edge two,
  as measured; `version` not compared, unchanged.
- **The words:** `codeInWords` reads the stored morning and afternoon forms; `notationOf` and the stored clash codes
  untouched; the clash note's desktop line and phone list are the only places printing the clash's codes, the clash key
  still the stored ones; "OIL the app credited" opens only for the app's own credits (`!award`), so a hand award never
  gains a star; the `cond ? null : undefined` precedence in `BidPicker` right for leave; existing expectations moved to
  the new words, not weakened.
