# Fix read 9 — the builder's brief for its open faults (chat 118, 19 Nov 26)

Branch `claude/multi-sqn-b1-107` (pull request 806, draft). The code under `raptor-port/src` is as at `ae1af3806`, which
the readers read. You are the builder (Opus). Read first: `.claude/rules/raptor-executor.md`,
`.claude/rules/decisions/people-accounts.md` §Posting out (D2218, D2222, D2223, D2225), the full rows
(`grep -h '^| D2218 |\|^| D2222 |\|^| D2223 |\|^| D2225 |\|^| D2194 |\|^| D148 |\|^| D780 |' .claude/decisions-full/*.md`),
and the reports in `raptor-port/docs/superpowers/briefs/`: `2026-11-19-multi-sqn-b1-fixread9-{opus,fable,security,sol,astra}.md`.
Each gives proofs and fix steps; where they differ, this brief decides. Harness: `src/leavewar/multi-sqn-fixread8.test.ts`
(put the new tests in `src/leavewar/multi-sqn-fixread9.test.ts`). The readers' proof files, to borrow from (each runs
from `raptor-port/src/leavewar/`; the host ran each red on `ae1af3806`): chat 118's scratch
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/9fd34fb7-f6fc-4b49-8eb7-eec4d211d74d/scratchpad/`
`fr9-fable/zz-fable9/zz-fable9.test.ts`, `fr9-opus/zz-opus9/zz-opus9.test.ts`, `fr9-security/zz-sec9/zz-sec9-proof.test.ts.txt`.

Nothing here is a product question for him — each is the code not doing what D2218, D2223, D780 and the gate's own
contract (`docs/data-model.md` §11) already say. **Do NOT build anything for the moved filer who is now that man's own
admin (Fable 3 = Opus O9-3)**: that is his question; the code stays as it is.

## The faults — each reproduced RED first by a test that fails on `ae1af3806`'s code, then fixed at its cause

**A. Undo or Redo puts back a right dated before a move it was not held on (Fable 1 = Opus O9-2; medium; introduced by
G).** Saber sets Hunter master on 15 Jul and takes it off (or undoes it) the same day; Hunter moves to 149 on 16 Jul; on
17/18 Jul Saber's Undo (or Redo) puts the mark back with `masterFrom: '2026-07-15'` and the retired line returns (D2218,
D2223). Grants take the same path. Fix (Opus's form — one rule, no move test): a restore that turns a right ON — the
master mark from off to on, a grant put where none stands, or a grant's level changed — writes today's day, and the gate
requires today for it (`accountShapeAndMasterViolation`, `unitRowViolation`); the replay exemption keeps the recorded day
only where the right's state and level do not change. Make the restore write the day (the stores' restore, or the replay
handling of `setMaster` / `setGrant`) so Undo and Redo are never refused; `verifiedReplay` compares ignoring `from` /
`masterFrom` for exactly those cases. Fix read 8's "Undo and Redo a day later" control now expects today's day — say so
in the commit. Tests: Fable F1, F1b, Opus's master case; a grant case (Plan of 149 given, removed, Undo after a move);
controls: an Undo that does not turn a right on keeps its day; a fresh `setMaster` / `setGrant` unchanged.

**B. Fault W fixed at one door only (Opus O9-1 = Fable 2; medium; introduced by W).** After a write outside every
command, an admin's Delete of an unrelated man (`person.delete`) and the posting sheet's Undo post out (`lw.postout`
`takeBack` / `restoreBody`) are refused whole ("a bell line not as the pass writes it"). Fix: export one helper from
`sched-commit.ts` doing W's three steps (`const fresh = !isEnlisted(schedStore.key); resyncSchedBaseline(); tellBegin(fresh)`
— match the code as it stands) and call it at EVERY resync-before-enlist site: `person-delete.ts`, `leavewar/sync.ts`
(`takeBack`, `restoreBody`, the `lw.postoutRun` body and any other resync you find — grep `resyncSchedBaseline`), and
`commitInputsWith` itself. Tests: Opus's delete and Undo post out, Fable F2; controls: each with no outside write; W's
own tests and `src/leavewar/ui/inputrange.test.tsx` stay green.

**C. A grant re-pointed to another man keeps its old day (SEC9-1; medium; introduced by G).** A 142 admin re-points
Kestrel's Plan of 142 (dated 15 Jul) to Hunter on 18 Jul, same level; the old day stays and Hunter's retired line comes
back. Fix: `unitRowViolation` keeps the old day only for the same right (`b.account === n.account && b.unit === n.unit
&& b.level === n.level`), else today; `accountShapeAndMasterViolation` keeps `was.masterFrom` only where `was.pid ===
is.pid`. Tests: SEC9-1 at the gate and end to end.

**D. An admin's war line in his own words (SEC9-2; medium; older).** A 142 admin's ordinary input command puts
`{to:'prowler', iid:'', name:'…', what:[{k:'lw', …}]}` on his own man's bell; it passes and, being "about him", follows
him to 149 for good. `docs/data-model.md` §11 says only `noticeWar`, `noticePosting` and `noticePostingBack` write war
lines. Fix (the security reader's): those three record the ids they mint in the running command (an envelope-keyed
registry like `notePassMade`, written only by them); the admin door refuses a put of a line with any `WAR_LINE_KINDS`
part (other than `noticeHoliday`'s own shape) that is not a verified replay, not passed as a follow-up (`followUpOf`)
and not in that registry. Tests: SEC9-2 at the gate and end to end, a `po` line and an `lwback` line; controls: a real
`lw.decide` line, a real posting line and its take-back still pass, and their Undo / Redo.

**E. Another squadron's holiday line deleted or rewritten (SEC9-3; low–medium; older, kept by H).** Fix: the holiday
skip applies only to a NEW line in `noticeHoliday`'s shape (`c.op === 'put' && c.before == null`) or a verified replay of
the actor's own step; every other delete or rewrite of a holiday line goes through the ordinary owner check. Tests:
SEC9-3 (delete) and a rewrite of `what` / `name` / `by`; controls: the app's own holiday line to both squadrons, its
Undo.

**F. A clock set back hides a moved man's new squadron's line (Opus O9-4 = Fable 4; low; B's residue).** Fix: in
`noticeLeftBell`, a line dated ahead by less than a day is read as written today (`dayOfAt(Math.min(n.at, Date.now()))`);
"before every move" only for a line more than a day ahead. Tests: Opus's and Fable F4; controls: fix read 8's fault B
tests and fix read 7's 2099 backstop.

**Astra's findings**, if any arrive, come as a follow-up message from the host — build them only when sent.

## Rules
- Each fault its own commit, in the order A, B, C, D, E, F; the message says fault, cause, fix, test. Red first on
  `ae1af3806`'s code (a temporary worktree or `git show ae1af3806:path` copies; never `git stash`), its failing line
  kept for the report.
- Do not touch `src/engine/` bodies. `perms.ts` changes → `docs/data-model.md` §11 where what it allows changes.
  Comments say WHY, naming the ruling. `docs/file-map.md` for the new test file.
- Checks before you finish (from `raptor-port/`): the touched suites one by one; the whole `npm test` under the checks
  lock (`node scripts/gatelock.mjs exec "multi-sqn-b1-107 — fixread9 unit suite" -- npm test`); `npm run build`;
  `node reference/tfin.js` (728/0); `npm run rulecheck`; `npm run docsize`; `npm run lint:changed` (against `c0c266077`
  if it cannot read main's side). No browser files: nothing a screen draws changes (if one does, stop and say so).
- Commit; do NOT push, merge, switch branch or edit `HANDOFF.md`.

## Hand back (short)
Per fault: cause and fix in a line each, each test's name, its red line on the old code, green after. Every check's
result. The commits. Anything you could not do or where this brief was wrong, plainly.
