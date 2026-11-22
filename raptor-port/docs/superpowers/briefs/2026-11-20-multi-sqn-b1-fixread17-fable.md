# Fix read 17 — Fable's report (blind; copy at `7dbc13fd0`, whose app code is `6e08cdf25`'s)

Reader: Fable (D2224), a background helper of chat 124, blind to the other three readers and to the builder's report;
brief `2026-11-20-multi-sqn-b1-fixread17-brief.md`; its own exported copy; finished whole. Proof bodies kept outside `src`
at `…\scratchpad\fr17\fable\probe\body{1,2,3}.ts` (chat 124's scratchpad; copied beside this report as
`…-fixread17-fable-body{1,2,3}.ts.txt`). The report as returned:

---

# Fix read 17 — Fable reader's report

Four findings, each run red in the copy; proof tests deleted from `raptor-port/src` afterwards. Test bodies are kept at `…\scratchpad\fr17\fable\probe\body1.ts`, `body2.ts`, `body3.ts` (each appended to the fixread16 harness by `mk.py` in that folder). No handoff block was pasted; nothing to ignore.

## Finding 1 (highest) — a member's Move of his own refused bid is offered, answers "moved", and does nothing
- **Introduced by** `4771676e5` (the state rule in `stampForged`).
- **Input run (red):** Saber opens 20 Jul–10 Aug. Ranger (`us`) bids LL on 28 Jul; Saber refuses it. Ranger calls `moveRecords([{personId:'bane', date:'2026-07-28', id, kind:'request'}], 1)`.
  - Result: returns `'moved'`; the refused bid is still on the 28th, the 29th is empty, no toast.
  - Control (a pending bid moved the same way) lands pending on the 29th.
  - Gate reason, run directly through `ownershipViolation` on the two-cell envelope: `who decided a request (lw.cell/y2026:bane:2026-07-29)`.
- **Cause:** `leavewar/state/store.ts requestMovable` still lets a member move a refused bid, and `moveRecords` lands it under the same id as `state:'pending'` with the decision fields dropped. The new rule says the same record keeps its state, so the gate refuses the command; `moveRecords` returns `refused ?? 'moved'` and never learns the commit rolled back.
- **The gate is right; the door is the missing call site.** leave-war.md line 235 says a member moves his own bid only "while it waits" (the reading of D1177). Before this commit a member could move his refused bid a day and back, and have it pending again with its old place in the queue — S16-2's harm through the Move door.
- **Wider consequence:** a member's block move that includes one refused bid fails whole and silently, his pending bids with it. Every Move door reads `movableRecords` (BidPicker `canMoveHere`, DayList `movableIds`, Matrix `movers`).
- **Fix:**
  1. In `requestMovable`, after the `canEditRow` line, add `if (r.state === 'refused' && !canDecide(state.role)) return false`. `movableRecords` then drops it from every door and from a member's block.
  2. In `moveRecords`, after the gesture, re-read each request's landing day; if a record is not there, return `{ reason: 'nothing' }` instead of `'moved'` (as `setRequestWords` re-reads the store after its command).
  3. Tests: a member's move of a refused bid returns not-moved; a member's block of pending plus refused moves the pending ones; an admin's move of a refused bid still lands pending.

## Finding 2 — a saved move replaced back the same day strips a third squadron's right from a man who never moves
- **Widened by** `7a1166124`. Before it, the first move was refused when the mover was no admin of the third squadron.
- **Input run (red):** Saber makes 150 and gives Ranger View of 150, and gives Hunter Plan of 149. Hunter: `setHome('bane','u149')` (ok), then `setHome('bane','u142')` (ok, same-date replace). On 16 Jul `homeOn('bane')` is `u142`, and `levelIn('acus', u150)` is `null` (expected `'view'`).
- **Cause:** the new exemption in `unitRowViolation` lets the move drop every right; the same-date replace back to his own squadron puts nothing back. An admin of two squadrons can now remove a right in a third, which he could not remove bare, with no move taking place.
- **Fix:**
  1. In `units.ts setHome`, when the new row replaces a row of the same date and `homeOn(pid, from) === homeOn(pid)` after it (the move is called off), do not accept it as a plain replace. Either refuse with "Undo the move instead" — Undo already restores the rights (the builder's control) — or
  2. keep the dropped rights with the saved move (for example on the home row) and re-put them, dated today, in the cancelling command; the gate allows a put-back where the same command returns tomorrow's home to today's.
  3. Test: the input above, green.
- This choice may be the owner's: whether a called-off move gives the rights back.

## Finding 3 — the move window reads tomorrow only; a home row dated later keeps a right past the move (D2203)
- **Older gap, not closed by** `7a1166124`, whose message says a forged write is held too.
- **Input run (red):** Hunter (142's admin, Plan of 149) commits `home.set` writing `{bane, u142, from 2026-07-15}` and `{bane, u149, from 2026-07-17}` past `setHome`. The gate passes. Saber then gives Ranger View of 150 through the ordinary `setGrant` on the 15th (ok). On 17 Jul Ranger is 149's and still holds View of 150 (expected none).
- **Cause:** `homeUnitViolation` allows a home change on any day from tomorrow on. `setGrant` and the gate's grant branch compare today with `moveFrom(today)` only. Nothing requires a move command to drop his rights.
- **Fix:**
  1. In `homeUnitViolation`, where `was !== now` and `was != null`, refuse `d !== tomorrow` ("a move dated other than tomorrow"); `setHome` writes no other date. Keep the verified-replay exemption for Undo and Redo.
  2. In `unitRowViolation`, for a command that changes a man's squadron from tomorrow, refuse if `after.grants` still holds a right of his account ("a move that keeps his rights").
  3. Tests: the input above refused; a forged tomorrow-dated move that leaves a grant refused.

## Finding 4 (low) — a new squadron whose first admin is moving tomorrow is refused in the gate's own words
- **Introduced by** `7a1166124`.
- **Input run (red):** Saber: `setHome('prowler','u149')`, then `addUnit('160', places()[0].id, 'acad2')`. Result: `{ok:false, message:"member-writes-own: a right given the day before his move (grant:g…)"}`.
- **Cause:** `addUnit` writes the first admin's right with no window check, so only the gate catches it.
- **Fix:** in `addUnit`, before `save`, resolve the first admin's person and return `no('He moves squadron tomorrow — name him after the move')` when `homeOn(pid, moveFrom(todayIso())) !== homeOn(pid)`. Add a test.

## The builder's choices, judged
1. **`foldedInto` — supported.** The survivor only grows in `doorApprove`. With only a leave after, that leave is kept and nothing is removed. In a bridge the leave before is kept and the one after is removed, lying outside the before-span. A move re-files under new ids and joins nothing; a cut keeps the first piece's id and removes nothing; two halves never join (`same` asks the part of the day). I found no removed leave read as folded when it was not. The pass and `foldedFor` hand the same before-image.
2. **`joinFilerImgs` — supported in practice, with one difference on paper.** The pass moves on to a folded leave when the standing leave names the filer but does not tell him; `joinFilerImgs` returns at the first image naming him. I ran the case: Hunter filed the 27th, moved to 149 and back, filed the 29th, was demoted to member, then Saber bridged. The join took and Hunter was told once with `fu ['u142']`; the control with Hunter still an admin also took. The pass's own lines are vouched by the command, so the difference refuses nothing honest. Tidy only: make it `continue` unless `filerTold(f, src === b ? [b, a, ...folded] : [src])`.
3. **`stampForged` state rule — wrong for one door: Finding 1.** The rest holds. Request records are only pending or refused (an approval becomes an input). A re-typed kind takes a live bid's state, always pending. Clear-then-bid is a new pending bid. A member's Undo or Redo is skipped as a verified replay. The check sits in the member branch only, so no admin action passes through it.
4. **The move window — Findings 2, 3, 4.** Supported otherwise:
   - a right given on the move's own day passes;
   - Undo of the move puts the rights back, since tomorrow's home is today's again;
   - a first placing is dated today, so it opens no window and earns no exemption;
   - the exemption needs the man's own home to change from tomorrow in the command's net result, so a row written and taken back, or another man's move, earns nothing;
   - a home row by one who may not make it is refused by the home checks, the whole command with it.

## Explicit negatives
- No honest member action other than Finding 1 is newly refused: re-typing a pending bid, a half-day re-type, clearing a refused bid then bidding, words on a pending bid.
- No fail-open in the state rule: a record with no state reads as pending on both sides.
- No way found for a single command to drop another squadron's right without a real change of the man's squadron from tomorrow.
- A call-off back to his own squadron in one command earns no exemption (tomorrow equals today afterwards).
- Fix read 16's half-day tests and the bridge tests were read, not re-run by me, beyond the two bridge runs above.
- Not checked: the browser; `opendates-store.test.ts`'s four widened refusals (read only — they accept either reason, both refusals).
