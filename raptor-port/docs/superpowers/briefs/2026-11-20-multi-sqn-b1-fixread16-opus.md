# Fix read 16 — the fresh Opus reader's report (blind; copy at `078bc2f7e`)

Reader: a fresh Opus reader (D790), a background helper of chat 123, blind to the other three readers and to the builder's
report; brief `2026-11-20-multi-sqn-b1-fixread16-brief.md`; its own exported copy of `078bc2f7e`; finished whole (about
12½ minutes). Its proof test kept outside `src` in its copy (`fr16/opus/zz-proof-fr16.test.ts.txt`, scratchpad). The
report as returned:

---

## Fix read 16 — fresh Opus reader's report (blind)

I worked only in `…\scratchpad\fr16\opus`. I saw no pasted handoff block from a compaction, so there was none to ignore. I changed nothing under `raptor-port/src`. My proof test is deleted from `src`. A copy is kept outside it at `…\fr16\opus\zz-proof-fr16.test.ts.txt`. It uses fix read 15's harness, copied whole, and runs from `src/leavewar/`.

### Finding 1 (new in 5f6e3f5df): a removed half-day leave is wrongly counted as folded, and the whole command is refused

**Failing input (run, red):** the setup is fix read 15's.
- Saber approves `*LL` (morning) for Ranger on 28 Jul with the words "morning".
- Hunter approves `LL*` (afternoon) for Ranger on 28 Jul with the words "afternoon".
- Saber then runs `changeAbsenceById('bane','2026-07-28', <afternoon leave's id>, 'removed')`, which is the sheet's Delete. With `'pending'` (un-approve) the result is the same.

**What happens:**
- The call returns `null`, so the sheet says it was done.
- The afternoon leave is still there.
- The commit gate refused the command with `member-writes-own: a bell line not as the pass writes it`.
- The refused lines were a "words changed" line on the **morning** leave to Ranger, and one to Hunter carrying a squadron mark.

Both test cases fail. The two controls pass: with the same words on both halves, the delete works.

**Cause:**
- `notices.ts` `noticePass` now computes `imgs = [b, a, ...foldedInto(a, removed)]` for **every** input in the before-map, including ones the command never changed.
- `foldedInto` counts a removed leave as folded when it has the same war, kind and people and its days lie within the standing leave's days. It never asks whether the standing leave actually grew over those days, and it ignores the half of the day.
- So the deleted afternoon leave (28 Jul) "lies within" the untouched morning leave (28 Jul). The war branch then tells Ranger and the afternoon leave's filer that the morning leave's words changed, which is false.
- The gate's `foldedFor` only looks at inputs that are in `env.changes`. The morning leave is not, so the gate judges the line over no images and refuses the whole command.
- The result: the admin cannot delete or un-approve one half of a day while the other half, with different words, stays. Nothing is saved, and the sheet says it was done.
- Even if the gate had let it through, the line itself would be false.
- Before this commit the pass compared only `b` with `a`, and for an unchanged leave that is empty. So 5f6e3f5df introduced it.

**Fix, step by step:**
1. Give `foldedInto(a, removed, b)` the standing record's before-image `b`. Return nothing when `!b` or when `deepEqual(b, a)` (the record did not change).
2. Count a removed leave `x` as folded only when its span lies within `a`'s span **and not** within `b`'s span, meaning the standing leave grew over those days.
3. Also require the join's own match: `!!x.allday === !!a.allday && (x.half ?? '') === (a.half ?? '')`.
4. In `noticePass`, call `foldedInto(a, removed, b)`.
5. In `perms.ts` `foldedFor`, take the id's own `c.before` and pass it, so the gate and the pass read the same body.
6. Tests to add:
   - The four cases above (Delete or un-approve, different or same words): each is done, with no words line about the leave that stays.
   - Astra 1's bridge and its control stay green.
   - The bridge of three, below, stays green.

### Checked and found sound (explicit negatives)

**Choice 1 (74b452c2b), whether 'g' is the only mark a week load's landing writes: supported.**
- The only writes to memory's filing mark outside a command are the day's reconcile (`slots.ts reconcileDayFiling`, 'g' or nothing, skipping 'u' and 'r'), the after-command working-out (`holderbase.ts`, the same rule) and the week switch (`store.ts`, which clears everything except 'r' and 'u').
- The load-a-version path (`drafts.ts loadVersionToWorkingCopy`) writes 'u', 'r' and `odGround`, but it runs inside the load's own command (`afterSchedMutate`), so those are saved.
- `odGround` is written only in `slots.ts`, `drafts.ts` and `inputedit.tsx`, all inside commands. `autoAcceptInput` has no callers.
- A restore strips 'g' anyway (`sched-commit.ts`), so 'g' in a before-image only affects the history line.
- The cases you asked about (a landing that clears a 'g', a 'g' over a saved 'u', a scheduler's own move followed by a member's edit) all fall back to the saved row. Memory 'g' over a saved 'u' or 'r' is ignored.
- The scheduler's own move mark (`schedPlaced`), the war-approved mark (`lw`) and the dropped-LATE mark (`lateOff`) are always taken from the saved row.
- Fix read 14's and 15's files are green (13 and 7 tests), and fix read 13's (31).

**Choice 2, what the fold rule misses:**
- A bridge of three is fine. I ran it: Saber's 27 Jul, Hunter's 29 Jul and 31 Jul leaves, bids on 28 and 30, the words "joined" typed over the lot, then Approve. The result is one leave, 27–31 Jul; Hunter gets one words line, Ranger one; the gate refuses nothing.
- A join from the other side removes no record, so the leave's own before and after images cover it.
- A group leave never joins (`idsOf(x).length === 1`).
- A move on the war (`doorMoveApproved`), a cut (`cutDates`) and an un-approve make new pieces and never join. The posting cut and its take-back do not fold.
- Undo and Redo are restores, which the notice pass does not run on.
- Outside the war branch, the extra images change only the filer test of the standing leave, over the same days.
- Low, and with no proof run: `filerVia` takes the filing day from the earliest `at` among the images, so a folded filer is judged from the standing leave's earlier filing day. It can only differ for a filer who moved between the two filings and is no longer an admin. I do not raise it.

**Choice 3, the absent before-image: sound.**
- The create form is used only where the saved copy is whole, the record has no saved row, and it did not arrive from another device (remote rows are exempt).
- A record saved by another device always arrives through that exemption.
- A saved copy that has not started is not yet whole, so nothing is asked.
- Redo after the Undo passes the "already written" check, because the Undo removed the saved row. Astra 2's test is green.

**Choice 4 (0e81a165c): no behaviour change.**
- The command layer already copies every record with `deepClone` (`commit.ts cloneRecords`, `deriveChanges`). The foreign war store's capture and restore now match it.
- A posting window holds plain data (`personCut`, `stintOpened`, `stintClosed`, read back from JSON). Nothing in it is a function, a `Date` or a `Map` that the clone would throw on. A property set to nothing now survives a rollback, which is more faithful.
- Reading accounts by id with `byId` / `afterById` keeps the first account of an id, as `find` did. `Map.get` and `===` differ only on NaN, which a string id cannot be.

**Rulings D2218, D2223, D2225, D2228, D1388, D148, D350:** I found no further conflict in these commits beyond Finding 1, which breaks an admin's normal Delete and un-approve on the war.
