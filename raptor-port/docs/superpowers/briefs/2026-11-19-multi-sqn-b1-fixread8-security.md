# Fix read 8 — the security reader's report (blind, D1411; 19 Nov 26, chat 117; copy at `71fdfbfd5`)

Saved whole as handed back; not yet reproduced by the host. The reader's proof file was kept outside `src` in its copy
(`zz-sec8/zz-sec8-proof.test.ts.txt`).

---

# Fix read 8: the security reader's report (D1411)

I worked from the copy at 71fdfbfd5. No handoff block was pasted, so there was none to ignore. I opened only the brief, the fix read 7 security report it names, FIXES.patch, FIXES-LOG.txt and the code.

I put the proofs in a temporary test file, `src/leavewar/zz-sec8-proof.test.ts`, built on the harness of `multi-sqn-fixread7.test.ts`. I ran it, then deleted it from `src`. A copy is kept outside `src` at `zz-sec8/zz-sec8-proof.test.ts.txt` in the copy's root. `src` is unchanged and `node_modules` was not touched. All three holes ran red: "3 failed" on the first run, then "2 failed" for SEC8-3, which I re-ran once I had made Outlaw a real admin.

## SEC8-1 (medium; fault T's 5-minute window leaves this open): a line written just before midnight can be dated on the man's move day, and then it never leaves his bell

**Input.**
- Hunter is 142 through 15 Jul and moves to 149 from 16 Jul.
- At 23:57 on 15 Jul, Outlaw (a 142 admin) puts a line to Hunter dated 00:01 on 16 Jul. That is 4 minutes ahead, so it is inside the window.
- I tried a plain line (`iid:''`) and a marked filer line (`fu:['u142']`) riding a remark change.

**Result, both variants.**
- `gate late: allowed`.
- On 17 Jul: `honest false  control false  late true`.
- `AssertionError: 142's line dated on his move day left too: expected true to be false`.

The same line dated 23:57 leaves on his move, as it should.

**Cause.**
- `noticeLeftBell` takes the day the line was written from its time. Here that is 16 Jul, so his home that day is already 149.
- It then looks only for moves after that day. There are none, so the line is never retired: neither by the `fu` branch nor by the plain-line branch.
- `lineNotNow` checks only that the time is within 5 minutes of the clock. It never checks that the time does not fall on a later calendar day.
- The member door is the same: it asks the same `lineNotNow`, so Ranger's own change can carry such a line.
- This is SEC7-2's harm, still possible in the last 5 minutes before any move.

**Fix.**
1. In `perms.ts` `lineNotNow`, also refuse a new line that is not a verified replay when its day is later than today: `dayOfAt(n.at) > todayIso()`. You will need to export `dayOfAt` from `notices.ts`. A time up to 5 minutes in the past stays allowed, so a command carried over a slow clock still passes.
2. Add a red test: SEC8-1 above, for both an admin and a member.

## SEC8-2 (low; fault M does not cover every way in): a line made only of holiday parts skips every fault-M check, and with an `iid` it outlives the move

**Input.** Outlaw puts this line to Hunter:
`{to:'prowler', by:'casper', at:now, iid:'ipd-nowhere', what:[{k:'oilhol',a:'2026-07-25',b:'2026-07-25'}]}`.
The input it names does not exist.

**Result.**
- `gate to Hunter: allowed`, and `to a 149 man: allowed`.
- On 17 Jul, after Hunter's move, it has not left his bell: `with iid false`, against `without true` for the same line with no `iid`.
- `expected 'allowed' to match /not as the pass writes it/`.

**Cause.**
- `adminOwnerViolation` lets any line made wholly of `oilhol` parts straight through with `if (holidayLine(n)) continue`. That skips `inputLineUnlike` and the other-squadron check.
- `noticeAboutHim` treats any unmarked line with an `iid` as about him, so the line stays for good.
- The app never writes a holiday line with an `iid`: `notices.ts` sets `iid: ''`.
- The crossing itself is older and was ruled on: holiday lines reach every squadron. Only the permanence through `iid` goes past fault M's "every notice put with an iid".

**Limits.** Such a line is listed only to a scheduler, and only while that holiday still has inputs waiting for an OIL answer. Its label is fixed.

**Fix.**
1. Change the skip to `if (holidayLine(n) && !n.iid && n.fu === undefined) continue`. Any other holiday-shaped line then goes through the ordinary checks, and `inputLineUnlike` refuses it.
2. Add a red test: SEC8-2.

## SEC8-3 (low; fault P can be undone by a crafted command): the gate never checks a grant's new day

**Input.**
- Hunter's 142 line has been retired by his move to 149.
- On 18 Jul, Outlaw (made a real 142 admin through `updateAccount`) puts `grant:gsec8 {account:'acad2', unit:'u142', level:'admin', from:'2026-01-01'}`. I also tried the same grant with no `from`.

**Result, both.** `{ v: 'allowed', back: true }`: the retired line is back on Hunter's bell.

**Cause.**
- `validGrant` accepts a missing or back-dated `from`.
- `unitRowViolation` checks only who may write the grant (an admin of its unit), not its day.
- `adminThen` counts a grant with no day from always. That reading is right for old stored rows (D56), but here it also accepts a new write with no day.

**Fix.**
1. In `unitRowViolation`, for a grant put whose origin is not `restore`, require `n.from === todayIso()`.
2. For a restore, require `n.from` to equal the `from` of the image the command found, or today. Better still, add grant rows to the records `verifiedReplay` checks, and accept only the replayed image.
3. Keep `validGrant`'s leniency for the loader only.
4. Add a red test: SEC8-3, with both a back-dated `from` and none.

`masterFrom` needs nothing: only a master can set or move the master mark, and `accountShapeAndMasterViolation` refuses a non-master who changes any part of a master's account row, including `masterFrom`.

## Explicit negatives (checked, no hole found)

- **The builder's registry (choice 1).**
  - `PASS_MADE` is a WeakMap private to `notices.ts`, keyed on the command's own envelope object.
  - `notePassMade` has exactly one caller, `sched-commit.ts` `tellPass`, and it stores only the ids it minted in that command.
  - The set is cleared and filled again when the pass re-runs.
  - A failed or later command has a different envelope, so nothing carries across.
  - Ids are minted with a counter and random characters, so a pre-placed line cannot share one.
  - A restore never runs the pass (`tells` excludes it), so it has no registry.
  - `passMade` only skips `inputLineUnlike`. Lines in the registry still face `lineRewritten`, the other-squadron check and `lineNotNow`.
- **S.** A line with no maker now needs both an app-act command type and an id in the registry, so a mislabelled `lw.postout` fails closed.
- **M, `lineRewritten`.**
  - It refuses changes to `to`, `iid`, `at` or `fu`.
  - A change to `what`, `by` or `name` only reaches a line about one's own man, or one's own signed line through the telling door. Both were already possible before.
- **U.**
  - The new member route needs the timeline's verified replay of that very delete.
  - `verifiedReplay` ties the restore to the history entry being applied and to the same actor.
  - A forged restore, or one taking another man's line, is still refused. I checked against the builder's control test.
- **F.** `hasRead` reads the saved read record, which is updated only after a committed write. A forged read mark inside the command cannot vouch for a follow-up. The read records of another squadron's man are still refused (7e).
- **Q, widening a span.**
  - Forging the after-image's dates to reach another squadron's days is refused by 7c (`inputUnitViolation`): it reads every named man's home across the whole span and needs admin rights in every squadron on it.
  - One mismatch for the correctness readers: `inputSpan` does not wrap the year when the end date is earlier than the start date, but 7c does. This can only under-tell a filer, so it is not a hole.
- **T.** A line already stored keeps its time under M. The display backstop retires a line more than 5 minutes ahead. A line dated long ago is refused.
- **Every place a bell shows** (the list, the unread count, "mark all read", a tap) still reads `noticeLive`, and so `noticeLeftBell`.

Ranking: SEC8-1 (an admin or a member can do it, against D2218) above SEC8-2 above SEC8-3.

---

## Follow-up (the host asked it to try to break the pass-made registry, after Astra's unfinished note) — SEC8-5

Saved whole in substance, the reader's own words condensed only in layout.

**SEC8-5 (low to medium; fault M's registry, aaf52940c): a line about an input change that no command carried.**
Input: Ranger (142 member) files a Training for Ace; Hunter (plain 142 admin), outside any command, changes it in
memory to name Ranger instead of Ace; Hunter then saves an unrelated leave of his own with `writeInputsBatch`. Result
(every saved command captured with `onCommit`): the command commits with Hunter's own input plus "taken out" (`out`) to
Ace and "put in" (`in`) to Ranger, both naming Ace's input; no saved command ever carries a change to Ace's input (never
judged by 7c, never saved). `AssertionError: a line about an input change no envelope carries: expected true to be
false`. A "put in" line counts as about Ranger, so it stays on his bell after he moves, telling him of an input that as
saved does not name him.
Cause: `commitInputsWith` takes the pass's before-image (`tellBegin`), then `resyncSchedBaseline()` silently takes up
the bare write, so it is never a change; the pass still tells of it; `inputLineUnlike` returns fine for any id in
`passMade` without asking whether the command changes that input. Limits: a line to another squadron's man is still
refused (the telling door needs the input among the changes); a member is refused (`rides`); admin only, his own men,
the pass's honest words, needs the console. Before M an admin could put such a line in any words (SEC7-1).
Fix: (1) `inputLineUnlike`: `if (passMade(env)?.has(id) && changed.has(iid)) return false`; (2) so honest commands are
not refused, stop the pass telling of an input the command will not carry — (a) `commitInputsWith` carries a bare write
the resync finds as a change of this command, so 7c judges it, or (b) `tellPass` drops any line whose input is among the
records the resync took up; the reader prefers (a). Test: SEC8-5.

**Negatives tried:** rewriting the pass's line after minting inside a settings command's closure (SEC8-4: the saved
changes still carry the pass's exact line — the baseline is snapshotted right after `tellPass` in `applyEnd`; the
alteration stays in the forger's memory only); the same id as a minted line (ids from time, counter and 3 random
characters; a planted line is taken up as baseline); re-addressing or changing content (the gate judges the baseline cut
taken right after the pass; `lineRewritten` guards later commands); forging or reusing the registry (private WeakMap on
the live envelope, only `tellPass` writes it, refilled each pass; restores never run the pass). Ranking: beside SEC8-2,
below SEC8-1.
