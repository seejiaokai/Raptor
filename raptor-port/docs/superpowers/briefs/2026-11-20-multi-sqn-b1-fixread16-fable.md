# Fix read 16 — Fable's report (blind; copy at `078bc2f7e`)

Reader: Fable (D2224), a background helper of chat 123, blind to the other three readers and to the builder's report;
brief `2026-11-20-multi-sqn-b1-fixread16-brief.md`; its own exported copy of `078bc2f7e`; finished whole (about 8½
minutes). The report as returned:

---

No handoff block was pasted after a compaction; none was read. I opened nothing named `*fixread16*` but the brief, nor `*fable-sample*`, nor fix read 15's reports. All proof tests were temporary files in `raptor-port/src/leavewar/` (fix read 15's harness copied), run one file at a time, and deleted; no file under `src` is changed, git untouched.

## Finding 1 (medium) — a half-day war leave can no longer be removed or un-approved when the other half of the same day holds a war leave with different words. INTRODUCED by 5f6e3f5df.

**Failing input (ran, red):**
- Saber: `placeApproved([{bane, 2026-07-27}], '*LL', {remarks:'morning words'})` (am half).
- Hunter: `placeApproved([{bane, 2026-07-27}], 'LL*', {remarks:'afternoon words'})` (pm half). Two records, `half:'am'` / `half:'pm'`, same `lw`, same type, same man.
- Saber: `changeAbsenceById('bane','2026-07-27', pm.iid, 'removed')`.
- Result: returns `null` (the sheet's "done"), but **no command commits**, the pm leave is still in INPUTS, no toast, no bell line. Same for `'pending'` (un-approve), and for removing the am half while the pm stands.
- Control (ran, green): the identical steps with both halves reading the same words — commits (`lw.edit` / `lw.decide`), leave gone, Ranger's one war line.
- Direct proof: `foldedInto(amRow, [pmRow]).length` is 1 (expected 0).

**Cause:** `notices.ts foldedInto` tests war, kind, people and "days within" — not the part of the day. The two halves of one day pass it, so the removed half is read as "folded into" the half that stands. In `noticePass`'s war branch the standing leave is unchanged, yet `common(removedHalf, standingHalf)` finds different words, so the pass writes a "remarks changed" line (to Ranger, and to the removed half's filer) naming the standing leave — an input the command does not change. The gate (`perms.ts inputLineUnlike`: the pass's word vouches only for a line about an input this command changes — fix read 8, fault W) refuses the whole command; the war door has already answered "done". So here the pass and the gate do differ (the builder's question 2): the pass folds over every record, the gate's `foldedFor` only over an input the command changes.

**Fix, step by step:**
1. `foldedInto`: also require the same part of the day as the join itself does (`leavewar/sync.ts doorApprove same()`): `!!x.allday === !!a.allday && (x.half ?? '') === (a.half ?? '')`.
2. Make the pass fold only what the gate can: in `noticePass`, compute `foldedInto(a, removed)` only where the standing record itself changed in this command (`!deepEqual(b, a)`; a real fold always changes its dates) — so no line is ever written on an untouched leave, whatever a later widening of the test lets through.
3. Tests: the input above for pm-removed, am-removed and un-approved (each must commit, leave gone, no words line to anyone); keep Astra 1 green.
4. Separately (older, not this round's): `changeAbsenceById` reports "done" when the command was refused at commit — worth a backlog line; it is why this fault is silent.

## Finding 2 (low — a reading of D2225 / D2194 for the owner's rulings, not a crash) — the bridge tells the folded leave's filer about days that are not his squadron's. INTRODUCED by 5f6e3f5df.

**Input (ran):** Hunter (142, never moved) approves Ranger's LL on 29 Jul ('right'); Saber approves 27 Jul ('left'); a bid on 28 Jul; then Ranger's home is 149 from 28 Jul. Saber types 'joined' over 27–29 and approves. Result: Hunter gets a words line, marked `fu=['u142']`.
**Control (ran):** same set-up, no bridge — Saber only changes the words of the 29 Jul leave: Hunter is told nothing (the 29th is 149's day; D2225 "for the input's days still his squadron's").

**Cause:** the folded leave's filer is judged over `imgs = [b, a, ...folded]` — the standing leave's days (27 Jul, a 142 day) carry him, though the leave he filed never covered a 142 day. Fix read 14's item B set the principle "each image counts as it would alone".

**Fix if the owner's rulings are read strictly:** judge a folded leave's filer over that leave's own image only — in the pass `filerTold(f, [src])` / `filerVia(f, [src])` for `src !== b`; the same in `perms.ts toldBy` (`filerTold(f, [x])` in the folded loop) and in `filerMarkOk` (where `n.to` is a folded leave's filer and not the standing leave's, `want = filerVia(n.to, [x])`). Test: the input above expects no line to Hunter; Astra 1 stays green. If the builder reads "the joined leave now concerns both squadrons", record that reading in D2225's row instead.

## The builder's choices — verdicts

1. **74b452c2b (`withLanding`) — supported.** By reading every writer of `acc` / `odGround`: the only write outside a command is `state/holderbase.ts` (sets or clears 'g', leaves 'u'/'r'); `engine/drafts.ts` (a version load: writes 'u'/'r'/'g' and `odGround`) and `engine/slots.ts` run inside the scheduler's own command; `ui/inputedit.tsx` inside a command. Walked by hand: saved 'g' / memory none; saved none / memory 'g'; saved 'u' or 'r' with any memory value; memory 'u'/'r' over saved 'g'/none; scheduler's move then the member's edit — each carries the saved filing, and no history line shows a filing change that was not made ('g' against nothing is read as the same input by `said`, and a restore strips 'g'). No failing input found. I did not re-run fix read 15's SEC15-1 tests myself.
2. **`foldedInto` — wrong as written** (Finding 1: misses "same part of the day"; Finding 2: widens the filer's days). Checked and fine (ran): bridge of three (27, 29, 31 with bids on 28 and 30 — one leave 27–31, Hunter told once, Ranger once); the folded leave's filer as the typist (not told; the standing leave's filer told once); Hunter's the leave before and Saber's after; words equal to the standing leave's own (folded filer still told, once); Undo then Redo of the bridge (both ok, both leaves and all three lines back and forth). By reading: a cut, a move, a delete, a posting take-back leave no standing same-man leave covering the removed one's days — except the half-day pair above. A join from the other side removes no record (the leave after is kept).
3. **The absent before-image — supported.** By reading: only reached where the saved copy is whole, the id has no saved row, the record did not arrive by a remote change, and the command is not a restore — so a seeded store, a copy not yet whole and another device's record are not turned into a create. Redo puts it back as a new record (no stored row after the Undo, so "already written" does not fire). Not run by me beyond reading the test.
4. **0e81a165c — supported.** `foreign.ts` slots hold only JSON-read rows and plain person objects (no Date, Map or function on any path I found); `structuredClone` keeps `undefined` properties that the JSON copy dropped, which makes a snapshot agree with the live rows (the old copy could show a difference that was not one). `byId` keeps the first account of an id, as `find` did; an absent id reads the same; only a `NaN` id would differ, and none is written.

## Explicit negatives
- The five rounds fit: nothing in these commits loosens fix reads 7–14's guards that I could find; `toldBy` gains only the folded leave's own filer (already tellable on the removed leave's own line), same people by construction.
- No fail-open found in `foldedFor` (no after-image: nothing folded; non-war leave: nothing folded).
- The Inputs-page path (no `skipLw`) writes no line on an untouched leave — only the war branch does (Finding 1).
- D2228, D2223, D2218, D148, D350: no departure found in these commits beyond Finding 2's D2225 question.

## Not checked
- No browser walk (code read only). The Leave War drag-move with words typed in its window joining a neighbour was reasoned, not run.
- I could not run the pre-fix code side by side (no edits to `src` allowed); "introduced" rests on the diff: before 5f6e3f5df the war branch compared a leave only with its own after-image, so no line could be written on an unchanged leave, and the same-words control commits today.
