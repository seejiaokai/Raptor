# Fix read 16 — the security reader's report (blind; copy at `078bc2f7e`)

Reader: a fresh Opus security reader (D1411), a background helper of chat 123, blind to the other three readers and to the
builder's report; brief `2026-11-20-multi-sqn-b1-fixread16-brief.md`, with its scope (holes only) in its own prompt; its
own exported copy of `078bc2f7e`; finished whole (about 12 minutes). The report as returned:

---

# Fix read 16: security reader's report (blind; no handoff block was pasted, so there was none to ignore)

**Scope:** holes only, meaning what one person can see of, write to or take from another, through the doors these fixes touch.

**How I worked:**
- I read FIXES.patch, FIXES-LOG.txt and fix read 15's security report and brief.
- I read perms.ts (storedRowViolation, withLanding, toldBy, foldedFor, filerMarkOk, the admin and member notice doors, and stampForged), notices.ts (foldedInto, noticePass, filerTold, filerVia, filerUnits, filedDay, movedSince), undo/derive.ts and timeline.ts (invertChange and the conflict checks), the restore 'g' strip in sched-commit.ts, and foreign.ts.
- I put three proof tests in the copy, ran each with `npx vitest run`, and deleted them. Nothing under src is changed.

## Finding S16-1: a war command that takes one leave away tells a false "words changed" line about another leave that stands (introduced by 5f6e3f5df)

**Failing input (red, the pass run in memory with the harness's people loaded):**
1. Two war-approved LL half-days for Ranger (`bane`) on 28 Jul, same war `y2026`:
   - `ipd-am`, morning, filed by Hunter (`prowler`), words "morning words";
   - `ipd-pm`, afternoon, filed by Saber (`stiff`), words "afternoon words".
2. Through the real doors I confirmed that two such separate inputs exist: `placeApproved(... 'LL*' ...)` by `ad2`, then `'*LL'` by `ad`, leaves two lw inputs on 28 Jul, one per half.
3. Run `noticePass(before = {pm, am}, live = [pm], { actor: 'stiff', skipLw: true })`. This is a war command that takes the morning half away and leaves the afternoon half unchanged.
4. Lines written:
   - to `bane`, on `ipd-pm`, kind `rmk`;
   - to `prowler`, on `ipd-pm`, kind `rmk`, with `fu: ['u142']`.
5. Expected: no line of words, because nobody typed any.

**Consequence:** Hunter is told the words of Saber's leave as "changed", on a leave he never filed, and Ranger gets the same false line. The commit gate passes both lines, because toldBy and filerMarkOk now read the same foldedInto body. So this is a bell line the gate vouches for, carrying another leave's remarks to someone who is not its filer. Here everyone is in one squadron. Across squadrons, filerTold still limits it to a filer who is told of the removed leave anyway, so I found no case that crosses squadrons.

**Not driven at app level:** the app-level gesture that takes away one half while the other stands. `changeAbsenceById(..., 'removed' | 'refused')` returned done, but the harness showed no change, and I ran out of time. **The input to run next:** the two halves above, then a war door that removes or un-approves only the morning half's input.

**Cause:** foldedInto folds every removed war leave of the same war, kind and people whose days lie within the survivor's days. It never asks whether the survivor grew over those days in this command. The survivor's own before-image already covered 28 Jul, so nothing was folded into it. In the pass, the words branch then compares the removed leave's words with the survivor's.

**Fix, step by step:**
1. Change foldedInto to `foldedInto(a, removed, b)`, where `b` is the survivor's before-image. Return [] when `b` is absent.
2. Keep a removed leave `x` only when both hold:
   - its span lies within `a`'s span;
   - at least one of its days lies outside `b`'s span, meaning the join extended the survivor over it.
3. Where `a` is not all-day, also require `x.half === a.half`.
4. In noticePass, pass `b`.
5. In perms.ts foldedFor, take the survivor change's `before` alongside its after-image and pass it through.
6. Add the in-memory case above as a red-first test. Then drive it through the war's own door.
7. Check that Astra 1's bridge test stays green. Saber's 27 Jul leave was [27,27] before and [27,29] after, so Hunter's 29 Jul leave still folds.

## Finding S16-2: a member clears an admin's refusal of his own Leave War bid, keeping its original place in the queue (older than these commits; on the war approvals door)

**Failing input (red):**
1. As `ad2`, `setCell('bane','2026-07-28','LL')`, then `setBidStates([{bane, 28 Jul}], 'refused')`. The stored war cell holds the request with `state: 'refused'`, `decidedBy: 'prowler'` and `decidedAt`.
2. Build a member envelope: actor `{role: 'member', personId: 'bane'}`, origin `user`, type `lw.edit`. It holds one `lw.cell` put whose before is that cell and whose after is the same record with `state: 'pending'` and both `decidedBy` and `decidedAt` deleted. The id and placedAt are kept.
3. With the day open (`setLwDayOpenProbe(() => true)`), `ownershipViolation(env)` returns **null**, so it is accepted. Expected: refused.
4. With the day closed it is refused, but only for "day not open".

**Consequence:**
- The admin's refusal and who made it vanish.
- The bid goes back to Approvals as pending with its original placedAt. That is the earlier place in the queue the code is written to deny: stampForged's M10 comment says a refused bid's stamp is never carried to a live bid.
- Honestly, he can only clear the refused bid and bid again with a stamp from now.

**Cause:** stampForged compares placedBy, placedAt and the decision fields. It never compares `state`. A record whose decision fields are deleted reads as "no decision written".

**Fix, step by step:**
1. In stampForged, when `same` exists and `(same.state ?? 'pending') !== (r.state ?? 'pending')`, return `who decided a request` for the member.
2. For a record that is not `same`, require `r.state === 'pending'`.
3. A verified replay is already skipped before stampForged, so a member's own Undo or Redo is untouched. The narrowed half-day cut already requires the same state.
4. Add the envelope above as a test.

## Explicit negatives (checked, nothing found)

**74b452c2b (withLanding):**
- 'u' or 'r' on either side keeps the saved row's value. A memory 'g' over a saved 'u' or 'r', a cleared 'r', and a 'u' over an 'r' all keep the saved filing.
- A 'g' carried onto the before-image is stripped by every input restore (sched-commit.ts) and is not counted as a change by the gate (`said`), so carrying it puts back nothing.
- odGround is now always the saved row's. On a held input, a member's change to it is refused by the second pass's `placeOf` check. On an unheld input it is his to move.
- One correctness lead, not a hole: engine/drafts.ts sets acc, 'u', 'r' and odGround in memory during a version load, and the log's claim "landing writes only 'g' / odGround only inside a command" depends on that load being saved by its own command. Either way the change falls back to the saved row, which closes rather than opens.

**5f6e3f5df, the never-saved create:**
- `before === null` is set only while the saved copy is whole, for a record it does not hold that came neither from another device nor from a restore. So Undo deletes only a record this very put first saved.
- D148 conflicts are judged by revision, not by the before-image, so a later change by someone else still blocks the Undo.
- Bell lines in the same shape: a member's put needs no before-image anyway, and a delete by his Undo still needs toldBy or the verified replay.

**foldedFor and toldBy:**
- On a second pass, removed before-images are the saved rows.
- A removal of a never-saved record is refused ("gone").
- A folded leave names the same men as the survivor, so the set of people told is not widened.
- filerUnits over a folded span adds no squadron.
- A lower filedDay only makes a filer count as moved more often, so it only narrows who is told.
- I found no way to tell another squadron's man.

**0e81a165c:**
- structuredClone of foreign.ts slots: they are plain JSON-shaped data, and the clone is used only for capture and restore. I found no check this opens.
- Reading accounts by id keeps the first account per id, which is what `find` returned, so the account that wins is unchanged.

**People:** I found no door through these commits that brings a deleted person back.
