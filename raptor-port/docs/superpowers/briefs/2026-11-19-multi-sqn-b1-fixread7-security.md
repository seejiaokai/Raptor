# Fix read 7 — the security reader's report (Opus, D1411; 19 Nov 26, chat 116; copy at 69a5bdb1d)

Saved whole as handed back; not yet reproduced by the host.

---

# Fix read 7: the security reader's report (D1411)

I worked from the copy at 69a5bdb1d. No handoff block was pasted, so I had none to ignore. I ran my proofs in a temporary test file, `src/leavewar/zz-sec7-proof.test.ts`, built on the harness of `multi-sqn-fixread6-retired.test.ts`. I deleted it before finishing. `node_modules` was not touched and `src` is unchanged.

All four proofs ran red ("4 failed (4)"). The three holes, worst first:

## SEC7-1 (introduced by c0c471030, fault C): an unmarked line written before a man's move stays on his bell for good after it

**The crafted command.** Hunter files LL for Ranger. Saber's change tells him, and that line is correctly marked `fu ['u142']`. On 15 Jul Outlaw is made a plain 142 admin. Hunter is still 142 that day and moves to 149 from 16 Jul. Outlaw changes the remark through `writeInputsBatch` and, in the same command, pushes:
`{id:'nsec7a', to:'prowler', by:'casper', at:now, iid:IID, name:'LL', day:'2026-07-25', what:[{k:'rmk'}]}` (no `fu`).
He also pushes a second line, `nsec7b`, with `iid:'ipd-nowhere'`. That input does not exist and the command does not change it.

**What it achieves.** Both lines are saved. On 17 Jul the honest line has left Hunter's 149 bell, but both forged lines are still there:
`P1 gate, unmarked line through a changed input: allowed` / `naming no input: allowed` / `17 Jul, Hunter (149) bell shows nsec7a: true nsec7b: true unread: 2` → `AssertionError: the forged unmarked line left too: expected true to be false`.
The old squadron decides what stays on a man's bell after he moves, read or unread, which breaks D2218 and D2223.

**Cause.**
- `filerMarkOk` is asked only at the `toldBy` door.
- When it fails, the admin section falls through to `if (to !== self && !ownsHim(to))`. On the day before a move the reader is still the admin's own man, so the line passes with any mark or none.
- Since fault C, `noticeAboutHim` treats every unmarked input line as "about him" (`return !Array.isArray(n.fu)`), and that keeps it for good.
- Was it there before? `nsec7a`: no. The old rule read the input, and `filerTold('prowler', r)` on 17 Jul was false, so the line left. Fault C introduced it. `nsec7b`, the missing input: yes, older. The old rule's `!r` already kept it.

**Fix.**
1. In `adminOwnerViolation`, for every notice put (`c.op==='put' && n===c.after`) with a non-empty `iid`, apply this before the `ownsHim` fallback. Skip it for a restore's verified replay (`REPLAY(env)?.(c)`).
   - Require `changedInputs.has(iid)`. The pass (`notices.ts:302`) is the only writer of input lines, and it writes them only inside the command that changes the input.
   - Require `filerMarkOk(env, c, n)`.
   - Otherwise return `a bell line not as the pass writes it`.
2. Do the same in the member section. It already asks `rides` and `filerMarkOk`, so this keeps the two sections the same.
3. Add red tests: P1 above (both lines), plus a control that the pass's own line to his own man is still accepted.

## SEC7-2 (older, not introduced by these commits): a line dated in the future never leaves a man's bell, and that undoes fault C's retirement and D2218

**The crafted command.**
- (a) Outlaw, as a plain 142 admin on 15 Jul, writes Hunter's filer line exactly as the pass does (`fu:['u142']`), but with `at: new Date(2099,0,1)`.
- (b) A member can do the same through the member door. Ranger ('us', a 142 member) changes his own LL that Hunter filed, and the line to Hunter carries `fu:['u142']` and the 2099 date.

**What it achieves.** Both lines are saved and both outlive Hunter's move:
`P2a … bell shows the 2099 line: true unread: 1`, `P2b gate, member, 2099 line: allowed`, `P2b … shows the 2099 line: true` → `AssertionError: a marked line his move retired: expected true to be false` (twice).
The line also sorts to the top of his bell for good.

**Cause.**
- `noticeLeftBell` returns early with `if (!(wrote < today)) return false`, where `wrote = dayOfAt(n.at)`. That covers marked and unmarked lines alike.
- No door in the gate limits a put line's `at`.
- The `fu` check closes the mark but not the date. It is the same harm through the next field.

**Fix.**
1. In both sections of `ownershipViolation`, before any door: a notice a person's command puts that is not a verified replay must have `Number.isFinite(at)` and `|at − Date.now()| ≤ 5 min`. The pass (`o.at ?? Date.now()`) and `noticeWar` both stamp the current time, so they still pass.
2. As a backstop, `noticeLeftBell` should return true for `at > Date.now() + 5 min`.
3. Add red tests: P2a and P2b.

## SEC7-3 (low; the no-maker allowance this round added): an admin can ride an unsigned line to another squadron's man by labelling his command `lw.postout`

**The crafted command.** Saber (master) filed for Ranger and is now 149. Outlaw, a plain 142 admin, changes that input. The envelope has `type:'lw.postout'`, and the notice is `{to:'stiff', fu:['u142'], what:[{k:'out'}]}` with no `by`.
`P3 authorize lw.postout for Outlaw: true`; `lw.postout, no maker: allowed` (same line under `inputs.batch`: refused; signed `kes9`: refused) → `expected 'allowed' to match /another squadron/`.
I proved this at the gate only. The real route would be in-memory edits swept into a genuine posting command, because the scheduler store compares against a lagging baseline.

**What it achieves.** Another squadron's man (any man the change tells) gets a line in invented words that names no maker, so it looks like the app's own act. That reverses fault A's (3) intent, "written as the pass writes it". It reaches only men the change tells.

**Cause.** `(n.by == null && APP_ACTS.has(env.type))` trusts `env.type`. A command type is only a label: an admin's `lw.postout` command is not limited in which records it changes.

**Fix.**
1. Have the pass record the ids it mints in the running command (`sched-commit.ts`, beside `noticePass`).
2. Let a no-maker line through only if its id is among them. At the least, its parts must all be `out`, `del` or `rbid`, and its input's change must be a take-out or a delete.
3. Add a red test: P3.

## Explicit negatives (checked, no hole)

- **The probe unset.** With no probe, `followUpOf` returns null (`!FOLLOWUPS`) and the line falls to `ownsHim`, so it fails closed. The probe is set by `installAbsenceDoor`, which `wireLeaveWarSync` calls from `boot.ts`.
- **Follow-ups.**
  - Each must equal `followUpsFor`'s result for a line this very restore verifiably replayed, field for field: `what`, `name`, `day`, `iid:''` and `to`.
  - It must be signed by the actor and about its addressee (`q.k==='lw'`).
  - At most one per `ref` (`followed`).
  - A forged restore gets no replay. Extra fields beyond those compared change nothing.
  - A future `at` here falls under SEC7-2.
- **`toldBy`.**
  - The filer comes from the before image, which is the stored baseline and cannot be forged. On a new input the filer is the actor only.
  - Named men cannot be widened past 7c, which reads homes on the input's days through the same `inputUnit`.
  - A forged ALL AVAIL date or placeholder moves both checks together.
  - `atOn` carries a man's first home back to every earlier day, so no "no squadron" gap opens.
  - A named man whose home today differs from his home on the input's date is the open question Opus F4, not a finding.
- **`filerMarkOk` at the doors it guards.** A missing, wrong, duplicated or non-string mark is refused, and a named reader with a mark is refused.
- **Signing and taking lines off.**
  - A line signed by anyone else (`kes9`) is refused.
  - A delete through the `toldBy` door needs the actor's own line.
  - A 142 admin cannot delete 149's lines; that falls to `ownsHim`.
- **Read records.** The `seen`, `noticeseen`, `apprseen` and `reqseen` records still need admin rights in that man's squadron (7e).
- **Every place a bell shows.** The list, the unread count, "mark all read" and a tap all read through `noticeLive`, which uses `noticeLeftBell`.
  - "Mark all read" also covers future-dated lines (`at > upto`), so SEC7-2's line can be marked read but never leaves.
  - Storage and the gate's own facts do not go through the display rule.
- **A move typed today** counts from tomorrow, so a line written on the move day is judged against the next day's home.

Ranking: SEC7-1 (introduced, and an admin can do it with any words) above SEC7-2 (older; an admin or a member can do it) above SEC7-3 (low).
