# Fix read 17 — the fresh Opus reader's report (blind; copy at `7dbc13fd0`, whose app code is `6e08cdf25`'s)

Reader: a fresh Opus reader (D790), a background helper of chat 124, blind to the other three readers and to the builder's
report; brief `2026-11-20-multi-sqn-b1-fixread17-brief.md`; its own exported copy; finished whole (about 11½ minutes).
Its proof files were deleted, not kept. The report as returned:

---

Fix read 17 — the fresh, blind Opus reader's report

No handoff block was pasted into this run, so there was none to ignore. I worked only in the fr17/opus copy. I ran every proof in place under `raptor-port/src`, then deleted the proof files. `perms.ts` was edited briefly to show which commit caused each fault, then restored byte for byte (checked with `cmp`). The existing tests still pass: fixread16 for the war and for squadrons, plus movestandard (45 of 45).

## Finding 1 (highest consequence): a member's Move of his own refused bid now fails silently, and the window still says "moved". Introduced by 4771676e5.

**How to see it fail (ran, red).** In the fixread16 harness:
1. Saber opens 20–31 Jul for bidding.
2. Ranger (`us`, member, viewing his own row) bids LL on 27 Jul.
3. Hunter refuses it with `decideRequestById(..., 'refused')`.
4. Ranger asks `movableRecords` for 27 Jul. It returns the bid, so the store offers Move.
5. Ranger calls `moveCells(27 Jul, +2)`.

Result: the call returns `'moved'` and no message appears. Afterwards 27 Jul still holds the refused bid and 29 Jul is empty. The gate on its own refuses the same move, a delete from the 27 Jul cell plus the same record put pending on 29 Jul, with "who decided a request (lw.cell/y2026:bane:2026-07-29)".

**Proof it is these commits.** With the new state line in `stampForged` switched off, both tests pass: the bid lands pending on 29 Jul.

**Cause.**
- The store's `requestMovable` still lets a member move his own refused bid. The store's own comment calls this "the mock-up's reading, uncorrected"; `moveRecords` lands it pending with the decision fields dropped.
- The new state rule in `stampForged` compares the landed record with `same`, the refused record that left its cell. Refused does not equal pending, so the commit is refused.
- The gesture's refusal never reaches `moveRecords`, which reports `'moved'`. This is the same harm shape as Fable 1: the window says "done" and nothing happened.

**Which way to fix it.** His D1177, which narrows D333, says "a member moves his own bid while it waits and its days are open". A refused bid is not waiting, so the store is what is wrong. The new gate rule (S16-2) should stay.

**Fix, step by step.**
1. In `leavewar/state/store.ts` `requestMovable`, after the `canEditRow` and `dayWritable` checks, add: `if (r.state === 'refused' && !canDecide(state.role)) return false`. The member then gets no Move on a refused bid. The admin's Move, which lands it undecided, stays.
2. In `moveRecordsProblem`, give a member's refused record its own reason rather than `'nothing'`, so the door can say why.
3. In `moveRecords`, return a refusal whenever the gesture's commit came back not ok. Never return `'moved'` for a rolled-back command.
4. Test it red first: a member's drag, sheet and day-list Move of his own refused bid offers no Move. If forced through, it returns a refusal and changes nothing. The admin's Move of the same refused bid lands it pending.
5. Add to the walk: a member presses Move on a refused bid on screen.

## Finding 2: a move and a same-day move back take another squadron's right away when no move happens. Introduced by 7a1166124.

**How to see it fail (ran, red).** In the units-sqn-fixread16 harness:
1. Saber makes squadron 150 and gives Ranger View of 150.
2. Saber gives Hunter Plan of 149.
3. As Hunter, `removeGrant('acus', 150)` is refused. This control holds: Hunter is not 150's admin.
4. Hunter runs `setHome('bane','u149')`, which saves; then `setHome('bane','u142')`, which also saves (the same row is replaced).
5. On 16 Jul Ranger is still 142's, but his View of 150 is gone (null, where `'view'` was expected).

With the new move exemption in `unitRowViolation` switched off, step 4's first move is refused and the View stands.

**Cause.** The exemption lets any command that changes the man's squadron from tomorrow drop his rights in every squadron. Each command is judged alone, so a move followed by a move back to his own squadron passes. The net effect is the bare removal of 150's right that the gate refuses directly — against D2191/D2192, and with no move under D2203. A 150 admin has to give it again, and Hunter's Undo is the only way back.

**Fix, step by step.**
1. In `units.ts` `setHome`, find the case where a row dated tomorrow is replaced by his current squadron, which takes back a saved move. Treat it as taking the move back:
   - On the move's own home row, record the rights the move dropped (e.g. `dropped: [grant images]`), written in the move's command.
   - On the take-back, put those exact images back in the same command.
2. In `perms.ts` `unitRowViolation`, allow a grant put back only where it matches a `dropped` image on the home row this command removes or replaces, and only where tomorrow's squadron then equals today's.
3. A simpler alternative: refuse such a take-back in `setHome` with "Take the move back with Undo", and refuse it at the gate too. The cost is that only the admin who made the move can take it back.
4. Test: the proof above. The control is Undo of the move giving the right back, which already passes.

## A smaller gap, not shown to do harm (named, no red test)

The pass decides whether a filer is told by checking each earlier version of the leave in turn. If his first check fails, he can still be told through a later one. The gate's check stops at the first version he filed, whether or not that check failed. They part only when the earlier test is false and the later one true. That needs a filer who moved, filed the folded leave after his move, and has since lost the admin role.

On every route I traced, the gate's "the pass wrote this line" short-cut lets the line through, because the actor is the master or that squadron's admin. So nothing honest is refused, and I am not ranking it as a finding.

To make the two match, in `joinFilerImgs` return at the first version whose filer is the man and for which `filerTold(f, own)` holds.

## Explicit negatives (checked, found nothing)

**The join fold (`foldedInto`).**
- A true fold always has a day outside the standing leave's earlier span, because two leaves of one man and half never share a day. So the new test never drops a real join. That holds for both sides of a bridge, for a bridge of three across two separate runs in one command, and for a join with the leave before or after.
- A Move never joins at its landing: it cuts, then files new records. A part-move or cut only shrinks the standing leave, so nothing is read as folded.
- Halves never fold into a whole day, and timed leaves fold exactly as the join's own test does.
- An untouched standing leave has no change, so the gate's `foldedFor` returns nothing, and the pass sees no growth.
- The pass and the gate read the same earlier versions: each command records one change per record.

**The filer judged on his own leave's days (`joinFilerImgs`).** These all match between pass and gate:
- one man filing both leaves;
- the standing leave's words unchanged while the folded one's changed;
- the filer also named in the input;
- a filer who moved and is still an admin.

**The member decision check (`stampForged`).** These all still pass:
- re-typing a pending bid;
- a half-day re-type, which keeps the live bid's state;
- clearing a refused bid and bidding again (a new id, pending);
- a moved pending bid;
- his own Undo and Redo (a verified replay, skipped);
- the words changed on a refused bid.

The check runs for members only; no admin action passes through it.

**The move window.**
- A right given on the move's own day, after it, passes.
- Undo of a move puts the rights back.
- A first placing (today equals tomorrow) is not held.
- A right standing unchanged is not held.

**The move exemption.**
- Writing a home row and taking it back in one command shows no change.
- A move of another man does not count.
- A forged home row by someone who may not make it is refused by the home checks, so the whole command fails.
- A home row dated beyond tomorrow gets no exemption.
- A missing account gets no exemption.

**One minor point.** A master's "add squadron" naming as first admin a man whose move is saved for tomorrow is now refused at the gate with only a general failure message. That is consistent with D2203, but there is no plain message on screen. Low.

**Undo and Redo (D148).** No honest Undo or Redo I traced is newly refused, except the Redo or put-back of a right in the window between a move being saved and its day. That is refused by design.
