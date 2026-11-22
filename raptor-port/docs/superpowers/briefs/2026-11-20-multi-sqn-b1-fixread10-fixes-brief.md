# Fix read 10's faults — the builder's brief (20 Nov 26, chat 118, overnight; branch `claude/multi-sqn-b1-107`)

You are the builder (Opus). Build the six faults below, each RED FIRST by a test that fails on `945c6de69`'s code, then
fixed at its cause, one commit each, in a new file `raptor-port/src/leavewar/multi-sqn-fixread10.test.ts`. Read first:
`AGENTS.md`'s rules list, `.claude/rules/raptor-executor.md`, `.claude/rules/decisions/people-accounts.md`, and the four
reports `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread10-{opus,fable,security,astra}.md`. The
readers' proofs, each red on this code (the host ran them all), sit in chat 118's scratch
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/9fd34fb7-f6fc-4b49-8eb7-eec4d211d74d/scratchpad/fr10-{opus,fable,security}/raptor-port/src/zz-*10/`
— copy their set-ups, never import from there. The earlier rounds' files `multi-sqn-fixread{7,8,9}.test.ts` stay green
(the three Q1 proofs of fix read 9 are not in them — leave that case alone: it waits for his answer).

## The faults

**A. An admin's own input command can still put a made-up line on his own man's bell, which follows him after a move
(SEC10-1, Fable F10-1, F10-2, Astra; high; fault D incomplete).** (1) `noticeWar` / `noticePosting` called from inside
`writeInputsBatch` with any part (security lines 75, 81); (2) a line with `iid:''` and `what:[]` or `what:[null]` (Fable
p:110, 115 — `[null]` also throws in `noticeWords`); (3) an `lw` part riding the telling door on a line naming an input
the command changes (Fable p:128). Fix: (a) a pure `warLinesOwed(changes)` in `leavewar/sync.ts` (as `followUpsFor` serves
restores) working out from the command's own changes which war lines are owed — the decision line for a changed leave
cell, the bidding line for a war opened or closed, the posting line for a posting record changed; installed into
`perms.ts` by a hook as `setLwRestoreCheck` is; fails closed when unset; (b) in `adminOwnerViolation` a put of a line with
any war part passes only if `warLinesOwed(env.changes)` owes it (match on `to`, `what[0]`'s kind and fields, day) or it
is a verified replay — keep `warMade` as a second condition; (c) the telling door refuses any war part, as the member
section does; (d) every put, both sections: `what` a non-empty array of objects each with a string `k`; a put with
`iid:''` is refused unless owed (a), a follow-up (`followUpOf`), a holiday line by B, or a replay; (e) `noticeAboutHim`
returns false with no first part. Controls: a real decision on Ranger's leave tells him; bidding open; a posting and Undo
post out; the restore's "taken back" and "again".

**B. A new line made only of holiday parts skips every check (O10-2, SEC10-3; high).** Outlaw puts an `oilhol` line on
Kestrel's 149 bell signed as Kestrel; on a member's bell signed as Saber (Opus e:103, 108; security 163). Fix:
`noticeHoliday` records each id it mints in the running command (a `holMade` registry keyed like `warMade`, written only
by it); the new-line skip in `adminOwnerViolation` applies only to an id in that registry (`c.before == null`,
`n === c.after`, `op === 'put'`); the replay branch unchanged; any other new holiday line takes the ordinary checks.
Control: Outlaw's real holiday tells the schedulers it tells today, and its Undo / Redo. (Who a holiday line goes to —
D2195 says never another squadron — is job 4's change, not this fault: keep `noticeHoliday`'s addressees as they are.)

**C. A drop from memory, then a "new" record with the same id, overwrites another squadron's stored record (SEC10-2;
high; older root, reached through B's doors).** Holiday line rewritten (security 102), any bell line taken away (117),
149's leave request replaced by a 142 admin's input of the same id (155). Fix — the backstop, required: in `perms.ts` the
commit gate refuses a put with `before == null` on `inputs` or `notices` whose id already has a stored row (the
whiteboard / backend's stored copy, not memory): "a record already written". Then consider the security reader's step 1
(`resyncBeforeEnlist` puts memory back to the stored state before enlisting, throwing the bare write away): do it ONLY if
no app path writes inputs or notices outside every command on purpose (check fault W's case — `leavewar/ui/inputrange.test.tsx`
and fix read 8's W tests — and every `resyncSchedBaseline` caller); if any does, keep the backstop alone and say why.
Control: an honest new input and an honest new bell line still save; W's and fix read 9's B tests stay green.

**D. A right changes hands through the account row and keeps its old day (O10-4, Fable F10-4, Astra; high) — and fault C
broke re-linking a master's account (Fable F10-3; introduced by `f27fbb89e`).** Kestrel re-links accounts so Hunter's
person holds Osprey's Plan of 142 dated 15 Jul: his retired line comes back (Opus c:113, 130; Fable p:156); Saber cannot
re-link Hunter's master account on a later day — "the master mark not dated today" (Fable p:137, q:130). Fix: (1)
`pidFrom` on the account row (the day it was linked to its present person); `updateAccount` writes today whenever `pid`
changes, and on a master account `masterFrom` today too; (2) the gate, in `accountShapeAndMasterViolation` beside G2:
`is.pidFrom === (was.pid === is.pid ? was.pidFrom : today)`, a row with no day counting from always (D56); (3)
`restoreRedated`: a restored account row whose `pid` differs from the stored row's gets `pidFrom` today; (4) `adminThen`
counts a grant and the mark from the later of its own day and the account's `pidFrom`; (5) the agent's reading of D2094 /
D2199 ("an admin of a squadron is made only by its own admins or a master admin"): re-linking an account that holds a
grant in a squadron the actor is not admin of (or the master mark) is refused unless he is the master — the gate's
words say so. Update `docs/data-model.md` §11 and `docs/data-schema.md` for `pidFrom`.

**E. An Undo of a right taken off after a move loses the lines that right kept (O10-1, Fable F10-5; medium; introduced
by `f5fb03fd1`).** Master since 10 Jul, moved 12 Jul (still master), mark taken off by mistake 15 Jul and undone: dated
15 Jul, the line gone (Opus a:108; the grant case Fable p:174). Fix: give the redate hook the day the right went off —
for an Undo the step's own day; for a Redo the day of the Undo that took it off, stamped on the entry when undone; keep
the recorded `from` / `masterFrom` when no home row of the account's person has a `from` after that day and on or before
today, otherwise today; the gate's replay exemption asks the same predicate. Fix read 9's F1, F1b, O9-2 and its grant case
stay green (a move falls between the off-day and today in each).

**F. F's exception judges a line by the rights he holds now (O10-3, Astra's third; low; introduced by `945c6de69`).**
Opus f:109. Fix: keep the exception only where his last move day is after `dayOfAt(min(at, now))`. Fix read 8's fault B
test "(Opus 4) ... a marked one is" and fix read 9's F tests stay green.

## Rules
- Change only what each fault needs; no other tidying. Every gate change goes through `state/perms.ts` with
  `docs/data-model.md` §11 in the same commit (D200). A changed expected result in an older test only where a fault here
  requires it, said in the commit.
- Each commit message: the fault, the readers, the cause, the fix, the test, "red on 945c6de69's code (…), green now".
- Before you hand back: from `raptor-port/`, the unit suite under the lock (`node scripts/gatelock.mjs exec
  "claude/multi-sqn-b1-107 — fixread10 unit" -- npm test`), `npm run build`, `node reference/tfin.js` (728/0), `npm run
  rulecheck`, `npm run docsize`, `npm run lint:changed`. `docs/file-map.md` names the new test file.
- Commit on `claude/multi-sqn-b1-107`; do NOT push, do NOT touch `HANDOFF.md`, do NOT merge. A blocker: stop and say it.

## Hand back (short)
Status, the commits (one line each), each fault's red-then-green evidence, the checks with their counts, any departure
from this brief with its reason, and anything found outside it (filed by the host).
