# S2 step U2 — the third fix round: what the four blind readers of fix round 2 found (chat A212's brief, 28 Nov 26)

For one Fable builder (a fault that came back after a fix is Fable's — D2233; and this round changes the commit gate).
Work only in `C:/Users/User/projects/Raptor/.claude/worktrees/a212-s2-users-d10cb2` (the app in `raptor-port/`).
**You do not commit, stage, push, build or take the checks lock.** One test file at a time (`npx vitest run <file>`
from `raptor-port/`); never the whole suite; never weaken a test; no `sed -i`, no inline script holding a backslash —
write a script file and run it. Read first: `.claude/rules/raptor-executor.md`; the second round's brief
`2026-11-28-msq-s2-u2fix2-brief.md` and its report (the "Fix round 2" section of `2026-11-27-msq-s2-u2-report.md`);
the build brief `2026-11-27-msq-s2-u2-brief.md` §3 (the rule) and §4 (the only sentences).

The readers' reports and proofs — every proof re-run by this chat on 20051e4ce and failing for the reason it gives
(`host-rerun-proof-<n>.txt` beside each):
`C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_b06e26eb-3ece-4642-8bcc-6d6dd2d081bf/a212/u2fix2read/{astra,fable,opus,security}/`
(`report.md`, `zz-*.test.ts`; each belongs in `src/state/`). **Copy each proof you fix into the repo as a test of its
own file (`src/state/msq-s2-u2fix3-*.test.ts`, renamed, calling `withThird()`), see it fail, then fix.** The reports
give each cause by file and line and a fix step by step: read them, but where this brief decides differently, this
brief wins. No new words: only D2806's sentence, "Only a master admin can do that" (`masterChangeProblem`) and the
app's existing "That did not save".

The cast: Saber (master admin, home 142), Hunter (142's admin, Plan of 149), Ranger (142's member), Kestrel (149's
admin), Osprey (149's member), Mako (150's admin).

## The fixes, in this order

**1. The gate asks "made an admin" whenever a mark it reads changes (security S1 — HIGH at the gate; no screen makes
these writes, a signed-in person's hand-made commands do).** Hunter (Plan of 149) sends three commands the gate
passes: Osprey's person marked a placeholder (`special`), his account's role set to admin (or his sign-in switched
on), the mark taken off. Osprey ends 149's admin in force. `units-model.ts inForceOn` reads archived, deleted AND
placeholder; `perms.ts madeAdminViolation` is asked only for an account row, a new person or a changed ARCHIVED mark.
Fix as the security report's S1 steps 2 and 3: the trigger is a change of any mark `inForceOn` reads (archived,
placeholder, deleted), and `undo-wire.ts makeAdminStuck` goes on, with the stored accounts on both sides, when a step
changes a person's marks and no account row. Proof: `security/zz-security-proof-5`.

**2. A role newly an admin's is "made" whatever his switch (security S2 — the door refuses, the gate passed).**
Kestrel switches off (or archives) Osprey, a member; Hunter writes `role: 'admin'` on his account row; the gate passes
it because nobody is in force after it; Kestrel's later Enable brings back an admin 149's own admins never made.
`units-model.ts madeAdminsIn` drops every account not in force before looking at its role. Fix as the security
report's S2 steps: a man counts as made where his role is newly an admin's of his squadron whatever his switch or
archive, OR where an admin is brought into force (round 1's fix 4, unchanged). Proof: `security/zz-security-proof-6`.
**And build the reader's unproven lead as a test of its own:** Kestrel, 149's own admin, suspends Osprey, makes him
an admin, undoes it; later Kestrel holds only Plan of 149 (he has moved to 142 and been given Plan of 149 — or any
road the test world has) and presses Redo: refused, in the Redo's existing out-of-band words, nothing written. Check
every honest road still goes through — run their suites: 149's own admin making a suspended or archived man an admin;
Restore and Enable by one who may; the posting pass; a squadron's first admin arriving by a move; the Undo of "made a
member" by one who may.

**3. The posting's take-backs ask only where an admin would be IN FORCE after them (Opus 1, Astra 3, Fable 3 — round
2's fix 2 asked too much).** In `leavewar/sync.ts`, as Fable's finding 3 steps 1–4:
- (a) a sign-in switched off BY HAND before the posting stays off after "Undo post out", a later date or a changed
  outcome (the take-back enables only the posting's own suspension, `offBy: 'po'`), so no admin comes back:
  `postingBringsAdminProblem` asks only where `a.on || a.offBy === 'po'`; `restoreArchivedPerson`'s no-post-in road
  asks that same body, so the sheet's door and the write judge one thing. Restore on Admin → Users (with a post-in
  date) keeps the whole question: it enables whatever suspended it (D322).
- (b) an Overseas Sqn posting changed to Delete, due today, which the pass will run: he is deleted in the same
  command, nobody comes back — `postOutChangeProblem` answers null; where that Delete would be HELD (a last admin, a
  master admin — the pass's own test), the archive is lifted and he is back: keep asking.
- Proofs: `opus/zz-opus-proof-1`, `astra/zz-astra-proof-3` (its "None outcome" case too), `fable/zz-fable-proof-3`
  (`fable/…-proof-4` is the gate judged alone — keep its sanity case). Round 2's `msq-s2-u2fix2-posting.test.ts` and
  `ui/msq-s2-u2fix2-postsheet.test.tsx` stay green, unchanged.

**4. A master admin's posting taken back says the master admin sentence (Fable 4 — words only).** In
`postingBringsAdminProblem`, where the take-back would lift what the posting made, ask `masterChangeProblem(id)`
first and return its sentence; then the admin question. Proof: `fable/zz-fable-proof-5`.

**5. A move's bell lines are told ONCE (Opus 2, Astra 2, Fable 1, security S3 — fix 8 and round 2's fix 3 both left
roads open; the orchestrator's decision, in place of another moment on the Plan row).** The same fault has now come
back by four more roads — a Plan put back by Undo or Redo, a re-link undone or redone, a moved man re-made an admin by
a Redo (a changed `adminOf`), a Plan put back and its holder then made a master admin (`kept`) — because the writer
rebuilds "who was a reader that day" from moments every time a later wake rescans. Stop rebuilding it:
- **The rule:** once a move has been told, no further reader is ever owed its line. "Told" = a stored bell line of
  that move: any squadron line with the move's fixed id prefix (`planMovedLineId(account, day, unit, …)` without its
  reader), or the mover's own line of that move day written by the same `account.told` command (`movesOwed` — check
  its id's shape and that it is written in that same command; if it is not always written with the squadron's lines,
  say so in the report and use the squadron lines alone).
- **One body** in `state/acctlines.ts` (say `moveTold(accountId, day, unit, notices)`), asked by the writer
  (`planMovesOwed` owes nothing for a move already told) and by the gate (`perms.ts planLineViolation`, the
  `account.told` branch: a `moved` line for a move with a told line stored BEFORE this command is refused — read the
  notices as they stood before the command; the lines one command writes together are all allowed).
- **The moments stay** as the backstop for the first telling (fix 8 and `liveAt`, as built) — and
  `perms.ts restoreIntoForce` gains the two cases the readers proved it misses: a row put back naming another man
  (`String(was.pid) !== String(is.pid)`) and a row put back an admin of another squadron (`adminOf` changed); correct
  the two comments that list its cases. **No moment is added to a Plan row.**
- Nothing else changes: the fixed ids, the first telling's audience, D2310 (old lines come back on an Undo of the
  take-away — `adminAt` and `fromAt` are never moved).
- Proofs (all must go green by the one rule): `opus/zz-opus-proof-2`, `astra/zz-astra-proof-2` (both cases),
  `fable/zz-fable-proof-1` (four cases), `security/zz-security-proof-1` (three cases) and `-proof-4`. Add: a forged
  second telling by a signed-in admin refused at the gate; the first telling on a LATE first wake (nobody opened the
  app on the move day; a man made an admin since gets none — round 1's test, still green); two wakes in a row write
  nothing twice; a move day on which the squadron had no reader at all (say in the report what then marks it told).
  Round 1's and round 2's `…-moveday.test.ts` files stay green, unchanged.
- Records: `docs/notifications-register.md` (the move line: told once, to the readers of the first telling) and
  `docs/data-model.md` §11 if the gate's wording there changes.

## Not this round — leave and name in the report
- The app acting as itself (nobody signed in, the projection door) back-dating or dropping `liveAt`: Astra 1, Fable 2,
  security S4 — filed under [GATE-APP-ACTOR-DOORS] (5), the coordinator's call. Do not move the gate's early return
  for the app's actor. (Fix 5 happens to close most of it; do not claim it closed.)
- Enable, Restore and "Undo post out" staying live for a Plan holder on a true admin's row; how the make-an-admin
  sentence reads there: parked for his word.
- If a fix needs a word the app does not have, a ruling does not cover a case, or a step here is wrong about the code:
  stop that fix, do the others, and say so.

## When you finish
Run, one file at a time: the new `msq-s2-u2fix3-*` files; every `src/state/msq-s2-u2*.test.ts` and
`src/ui/msq-s2-u2*.test.tsx`; `src/state/accounts.test.ts`, `lastadmin`, `units*`; the undo files (`undo/timeline`,
`msq-undo-rights`, `msq-undo-worlds`, `msq-fix2-*`); `leavewar/postout-outcomes`, `postout-landing`, `msq-war-a5-a6`,
`msq-acct-lines`, `msq-bell-*`, `multi-sqn-fixread10`, `-fixread11`, `-fixread12`; `state/perms-scan`,
`state/edit-rights-readers`; `node reference/tfin.js` (728/0) if you touched anything it reaches;
`npm run lint:changed -- --base HEAD --include-untracked`; `npm run docsize`. Records: `docs/file-map.md` for the new
tests. **Write your report to
`C:/Users/User/AppData/Local/Temp/claude/4c1f52179889e8bf/00df8e1d-41bd-40f0-9555-e8082ed913be/scratchpad/u2fix3-report.md`**
(per fix: what changed — file, function; each test seen failing, then passing; every suite run with its count; any
existing test changed and why; anything left or unclear) and append it as a "Fix round 3" section to
`2026-11-27-msq-s2-u2-report.md`. Your final reply is a ten-line summary pointing at that file.
