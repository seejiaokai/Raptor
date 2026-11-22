# Fix read 9 — the fresh Opus reader's report (blind; 19 Nov 26, chat 118; copy at `fc0e95ecf`, code = `ae1af3806`)

Saved whole as handed back; not yet reproduced by the host. The reader's proof file is kept at chat 118's scratch
`fr9-opus/zz-opus9/zz-opus9.test.ts` (run from `raptor-port/src/leavewar/`).

---

**Fix read 9: the fresh Opus reader's report (blind).** I found five faults, all proven red on this code.

No handoff block was pasted after a compaction, so there was nothing to ignore. I opened no `*fixread9*` file other than the brief.

**Proof file:** `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/9fd34fb7-f6fc-4b49-8eb7-eec4d211d74d/scratchpad/fr9-opus/zz-opus9/zz-opus9.test.ts`. It uses the fixread8 harness. To run it, copy it to `raptor-port/src/leavewar/` and run `npx vitest run src/leavewar/zz-opus9.test.ts`.
- The last run gave 5 failed and 3 passed. The 3 passing tests are controls and negatives.
- The builders' `multi-sqn-fixread8.test.ts` is green here (22/22).
- I took the proof out of `src` before finishing; the only new folder in the copy is `zz-opus9/`.

## Findings, by consequence

### O9-1 (medium): fault W was fixed at one door only
Three other commands bring the scheduler's starting point up to the live list and then enlist it, but do not re-take the bell's before-image:
- `person.delete` (`state/person-delete.ts`)
- `lw.postout`, both `takeBack` and `restoreBody` (`leavewar/sync.ts`)
- `lw.postoutRun`

For these commands the image still comes from the whole-world guard's `capture()`, which is `tellBegin()` on the lagging baseline. So the pass tells an input write made outside every command as if it were this command's change. W's gate half then refuses that line, and with it the whole command.

**Setup:** Ranger files a Training for Ace. Saber adds Newby (post-in 20 Jul). Ace's Training remark is then changed outside every command.

**Proofs:**
- `deletePerson(Newby)` returns "That did not save". The envelope handed to the gate holds `{to:'dj', by:null, what:[{k:'rmk'}]}` and no change of the input. The test's failing line: `expect(r, 'the delete of Newby refused…').toBeNull()`. The control with no outside write passes.
- The posting sheet's Undo post out (`undoPostOut('casper')`) returns false, with the same unsigned line to Ace in its envelope. Its control passes.
- What disproves correctness: an admin's delete, or Undo post out, of an unrelated man is refused.
- **Introduced by:** bb4255a9f. Before it, `passMade` vouched for the line, so it was committed in the app's name — SEC8-5 through these doors.

**Fix:**
1. Export from `sched-commit.ts` one helper that does exactly W's three steps: `const fresh = !isEnlisted(schedStore.key); resyncSchedBaseline(); tellBegin(fresh)`.
2. Use it at every resync-before-enlist site: `person-delete.ts` (the `apply` body), `sync.ts` `takeBack`, `restoreBody`, the `lw.postoutRun` body, and `commitInputsWith` itself.
3. Add the two red tests above.

**Negatives:**
- `lw.postoutRun` did not tell the outside write in my run. Its own posting-pass gate also holds it (`postout-notice.test.ts` "a stray request change…").
- The `commitSched` doors (`commitInputs`, used by the war's `tellWar`, `tellBidding`, the holiday line and `lw.notice`) do not resync. There the outside write rides the envelope as the actor's own change and is gated as such (option (a)). I did not report this, as it is consistent with that design.

### O9-2 (medium): Undo or Redo puts back a right dated before a move it was not held on (choice 8)
`verifiedReplay` now vouches for account and grant rows, and the restore puts back the recorded `masterFrom` or `from`.

**Scenario:**
1. Saber sets Hunter master on 15 Jul, then takes it off on 15 Jul.
2. Hunter moves to 149 from 16 Jul. His 142 filer line retires, which is correct.
3. On 18 Jul Saber's Undo of "taken off" puts the mark back with `masterFrom: '2026-07-15'`.
4. Hunter's retired line is back on his bell, though he held no mark on his move day.

This is fault D's harm through the restore door.
- **Proof:** `expect(shown('prowler', l.id), 'he held no mark on his move day…').toBe(false)` receives true.
- Grants take the same path. The builders' own control expects a Redo on 19 Jul to keep `from: '2026-07-18'`.
- **Introduced by:** 71c7d3095 (G), on top of 048239e8d (P).

**Fix:**
1. In `accountShapeAndMasterViolation`, a restore that turns the mark on (before not master, after master) must carry `masterFrom === today`. The replay exemption is kept only where the mark's state does not change.
2. Likewise in `unitRowViolation`, a restore that creates a grant or changes its level must carry `from === today`.
3. Have the restore write re-date such rows to today — the account and units stores' restore write, or `setMaster` and `setGrant` replay handling — so Undo and Redo are not refused.
4. Change the builders' Redo control to expect today's day.

### O9-3 (medium; his ruling question — choice 6): a moved filer who is now that man's own admin is not told
**Setup:** Hunter, 142's admin, holds Plan of 149. On 15 Jul he files Osprey's LL; before the move `filerVia` gives `['u149']`. He then moves to 149 through the real `setHome`, which drops his Plan (D2203), and becomes 149's home admin — Osprey's own admin.
- **Result:** on 17 Jul `filerVia('prowler', [inp])` gives null, so he is never told of a change to the LL he filed.
- **Proof:** `expect(filerVia(...), "Hunter, now 149's home admin…").not.toBeNull()` receives null.
- D2223 says "the filer is told only while he is still that man's admin", and its "no longer told" is about inputs "he filed for his old squadron's men". Osprey is not his old squadron's man.
- D2225's "a moved filer is still no longer told" reads the other way.
- The same happens to a home-admin filer whose named man moves into the filer's new squadron.

Not a builder error: R follows the host's reading. It is a clash between two rulings (D90/D201) and should go to him with this case.

If he answers "told": in `filerVia`, add `|| (u === home && isAdminAccount(acct))` for a moved filer. Do not change `noticeLeftBell`. The line written before the move still leaves on the move day, which is right: D2223's first sentence keeps an input line only where he is named in it. I checked this and dropped my earlier test of it.

### O9-4 (low): fault B's clock fallback retires a NEW squadron's line
A line dated more than 5 minutes ahead is read as written before every home row (`BEFORE_ALL`). So a 149 bidding line written to Hunter on 18 Jul — after his 16 Jul move — leaves his bell while the clock is 10 minutes behind it, then comes back.
- This happens after a clock correction, or with two devices at the database step.
- **Proof:** `noticeLeftBell(mk(10))` returns true. The 4-minute-ahead control returns false.
- **Introduced by:** f0b57a64d; before it, fault T's backstop did the same.

**Fix:** use `BEFORE_ALL` only for a line more than a day ahead; otherwise read its day as `dayOfAt(Math.min(n.at, Date.now()))`. A 2099 line still leaves; fault N's gate still refuses the line dated tomorrow.

## The builders' choices
1. **M's registry (`passMade`):** supported. It is per envelope (a WeakMap), written only by `tellPass`, shared by joined children, and dies with a failed command. Other modules can import `notePassMade`, but only tests do.
   - Since W, it vouches only for an input this command changes. That turned O9-1 into a refusal rather than a wrong line.
2. **T on new lines only:** supported. `lineRewritten` freezes `at` on lines already written. The member section's one put door asks for a new line only.
3. **Fixtures re-dated, holiday lines given `iid: ''`:** supported. Every refusal fixture I found that still has `at: 1` (in `postout-notice`, `m4sec`, `fixread6-allavail`) matches its own specific message, so `lineNotNow`, asked last, cannot mask it.
4. **A right with no day counts from always:** supported for D56 stored data. The boot's first master (`firstAdminRow`, written raw) is new data with no day, but "from always" is true for him.
5. **An unreadable input date falls back to today:** supported.
6. **Home-admin role in his new squadron:** see O9-3.
7. **`isEnlisted`:**
   - Root command: re-takes the image, correct.
   - Child joining an outer command that has not enlisted the scheduler store: re-takes it, correct (the `inputrange` case).
   - Child joining an outer command that has enlisted it: keeps the outer image; the outside write rides the envelope.
   - Nested child: the same command, the same answer.
   - Half-failed command: its state is per envelope and is rolled back.
   - The gap is O9-1: the other resync sites.
8. **Replay planting a back-dated right:** yes, see O9-2.

## Explicit negatives (checked, nothing found)
- **`adminThen` and `from < iso`:** a Plan grant cannot predate a move — the move drops it (D2203) and the gate refuses one in his own home — so after a move only the master mark keeps a filer told, as R intends.
- **`movedSince`:** handles a move saved for tomorrow and a man who moved and came back (still not told). D2223 says so.
- **Q (never-moved member, and an admin with the input straddling the move):** told, with the mark `[home]`.
- **R on a master filer:** told, marked with every squadron.
- **N's day test:** `dayOfAt` and `todayIso` read the same local calendar, so a normal line is never wrongly refused.
- **The account-row rebuilders** (`enableAfterPosting`, `suspendForArchive`, `enableForRestore`, `accountRow`) keep `masterFrom`, so G2 does not refuse ordinary account edits.
- **`addUnit`'s first grant:** dated today.
- **U, F and S:** I read the logic and saw no fault. I did not write my own failing tests for them.
