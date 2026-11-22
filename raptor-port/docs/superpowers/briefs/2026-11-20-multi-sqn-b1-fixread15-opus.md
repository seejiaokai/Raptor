# Fix read 15 — the fresh, blind Opus reader, returned 20 Nov 26 (saved by the host from its final message)

Copy `claude/multi-sqn-b1-107` at `f27c924be`; no handoff block was pasted after a compaction.

## Finding O15-1 (one, ranked first): fix A's set of fields kept from memory is too wide, so a member can undo a scheduler's Reject of his own request
**Consequence:** a member can take back a scheduler's Reject of his own request (D1388, G5: "parked by his Reject, which
only he writes"). The request goes back on the Ground Programme, and that is saved. Doing the same thing directly is refused.

**Cause:** `perms.ts storedRowViolation` (b), through `withLanding`, takes `acc` and `odGround` from memory onto the saved
before-image, whatever their values. But nothing outside a command ever changes `acc` other than between `'g'` and
nothing: `holderbase.ts` (line ~205) skips `'r'` and `'u'`, and `reconcileDayFiling` (`slots.ts` 664–675) does the same.
`'r'` and `'u'` are a scheduler's decisions, written by his commands and saved. Whether a place is held is read from the
saved row (`placeHeld`: `schedPlaced || acc==='r'`). So with an `acc:'r'` taken from memory, the saved Reject is gone from
the image the Undo step records.

**Input (red, run with vitest; kept at scratch `fr15/opus/O15-proof.test.ts.txt`, the fixread14 harness):**
1. Ranger (`us`) files his own LL with `iid ipd-o15-r`.
2. Hunter (`ad2`) saves `x.acc='r'`. The saved row reads `'r'`.
3. Ranger tries `writeInputsBatch(() => { delete x.acc; x.remarks='direct' })`. It is refused, as it should be.
4. Ranger then deletes `x.acc` in memory, outside every command, and runs `writeInputsBatch(() => { x.acc='r';
   x.remarks='mine, changed' })`. It is accepted. In the second pass the saved row and the after-image are both `'r'`, so
   the place is unchanged.
5. `globalUndo()` succeeds, and the saved row's `acc` is **undefined**. The restore is a verified replay, so `inputBreach`
   returns at `replayed`.

I also tried the same with an overseas duty's Ground mark (`odGround` with `schedPlaced`). It is refused at the first
pass, because `schedPlaced` stays in memory and holds the place. So only the Reject (`'r'`) is open.

**Introduced by these commits?** No. Before fix A the put carried memory's whole before-image, so this already happened.
Fix A closed `lw`, `lwMoved`, `lateOff` and the scheduler's other marks, but left this one through `LANDING_ONLY`. It is a
missing narrowing, not a regression.

**Fix, step by step:**
1. In `withLanding`, take memory's `acc` only where the saved value and memory's value are each `'g'` or absent.
   Otherwise keep the saved value, including an absent one. This matches how the gate already reads `acc` (`perms.ts
   said`: only `'g'` counts as nothing).
2. Take `odGround` from memory only where `!placeHeld(saved)`, or drop it from `LANDING_ONLY`. I found no writer outside a
   command for it: `drafts.ts` 711/721 sit in `loadVersionToWorkingCopy`, which is a scheduler's command.
3. Add my test (red now), and an `odGround` twin with the saved row place-held.
4. Correct the builder's honest control ("a landing mark memory holds… `x.acc='u'` as a week load's landing writes it").
   No landing writes `'u'`. Write it with `acc:'g'`, which is what a landing writes. With `'u'` under the new rule, the
   Undo would rightly put back the saved row's absent `acc`, and the timeline would rightly show that the edit filed it
   under Unavailable.

## The builder's choices, judged
**(1) A**
- `acc`/`odGround` as the whole list: **wrong in its width** (above). It is right that no other field differs on purpose.
  I checked the writes to inputs outside commands (`INPUTS.push`/`splice` across `src`): `holderbase` and the reconcile
  change only `acc 'g'`, the rest run inside commands, the hydrate and the seed.
- No before-image for a record never saved: supported for the seed, because `STORED_WHOLE` is set only after
  `writeSeedRows` or hydration. Also supported for remote records (`REMOTE_ONLY`), split pieces (they have no
  before-image anyway), the Leave War's approvals, moves and joins (puts on saved rows), and the working copy of a
  published day.
- One low note, D56-adjacent and demo-only: `leavewar/state/demoworld.ts` (lines 375/393) pushes demo inputs outside any
  command when a squadron's war world starts fresh after the raptor store was hydrated. An admin's edit of such a row
  followed by Undo now removes the row, where before the Undo put back the unsaved image. This is demo seeding that goes
  at the database step; I am not reporting it as a finding.
- The refuse-outright option is not needed if step 1 is taken. Keeping the saved `'r'`/`'u'` is enough.

**(2) B: supported.**
- A filer who never moved (D2225): each image's own men over its own days still names his squadron for the days still his.
- A filer who moved with the man (D2228): the man's new squadron comes from whichever image holds him on those days.
- An input changed from or to ALL AVAIL: the image naming nobody gives its own squadron (`inputUnit`), and `namedOf`
  drops the stand-in.
- The change only narrows the old cross product. I found no case D2225 or D2228 requires that is now dropped.
- The commit gate (`toldBy`, `filerMarkOk`) and the line's mark read the same body.

**(3) C: supported.**
- `common` compares the typed words through `remarksTyped`, which reads each image's own dates. A join keeps the leave's
  own words (`sync.ts` 708), and so do a cut or a move (`sliceInput`). `tillTurned` leaves out a flip that the dates alone
  made. So a war move, join, cut, shortening, delete or take-back tells nothing of words.
- `tell` skips the actor, so a filer who typed the words himself is not told.
- `!named.includes(f)` stops the filer being told twice.
- A new war-approved leave is still told only by the war (`if (a.lw) continue`).
- One possible remark change nobody typed: an old remark still carrying a date token. That lives only in stored demo
  data (D56).

**(4) D: supported.**
- `applyDelete` returns early on a man already deleted (`person-delete.ts` 191), so a second delete never rewrites the marks.
- The posting's take-back skips deleted men (`sync.ts` ~3254/3264).
- A Quals edit of a deleted man keeps all four marks and saves (the builder's control).
- The seed and remote changes carry no deleted before-image.
- Undo of a delete was already refused (D350, `deletedRestoreProblem`).
- `archivedOn` is not one of the delete's marks, and changing it does nothing for a deleted man.

## The questions of the ask
1. **Complete?** Item A misses the Reject mark (O15-1). B, C and D: I checked every writer of a remark and a bell line
   listed above, Undo and Redo, the Leave War's windows (approve, join, move, cut, put-back), and Admin → Users and Quals.
   I found no other door.
2. **Narrow and sound?** Item A's second pass still refuses a member writing `lw`, `lwMoved`, `lateOff`, `cx` or
   `schedPlaced` directly. Item D refuses a person command that clears `archived` on a deleted man. I found no check that
   lets a change through when its hook is unset beyond what the brief already exempts (no probe installed; the saved copy
   not yet whole, by design).
3. **Rulings:** B and C match D2223, D2225 and D2228 as written. D matches D290, D297 and D350. O15-1 breaks D148 in
   effect: an Undo puts back something the person's own change never took away.
4. **Earlier rounds:** fix read 13's item A(a) (a removal of a record never saved is refused) stands. Fix read 12's D (a
   record never saved is judged as new) now has a matching Undo. Fix read 11's A (the second pass against the saved row)
   is unchanged.
5. **What broke:** nothing honest that I found, apart from the demo-only note under (1).

**Tests run:** the builder's `multi-sqn-fixread14.test.ts` passes all 13. My proof file: the Reject case is red (the
finding); the overseas duty case is refused at the first pass, so it is a negative. The temporary test file and temp
folder were removed from `src`. One slip: I first wrote the proof file into the shared `fr15` folder, outside my copy, and
moved it into my copy straight away.

**Checked and found nothing:** told twice; words told to whoever typed them; a man brought back onto Quals; another
squadron told of business that is not its own through B; a deleted man's posting take-back.

---
**Host's note (chat 122):** the same fault as the security reader's SEC15-1, found independently; reproduced red by the
host (`multi-sqn-fixread15.test.ts`, "SEC15-1"). Its step 2 confirmed: every writer of `odGround` runs inside a command
(drafts.ts's version load, publish.ts, slots.ts, ui/inputedit.tsx) — so `odGround` leaves `LANDING_ONLY`. Its slip (a
file briefly in the shared `fr15` folder) noted; nothing in another reader's copy was opened by it, by its own account.
