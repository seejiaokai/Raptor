# S2 step U2 — the first fix round: what the four blind readers found (chat 205's brief, 27 Nov 26)

For one Opus builder (his D2819). Work only in `C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0`.
**You do not commit, stage, push, build or take the checks lock.** One test file at a time; never the whole suite; never
weaken a test. Read first: the build brief `2026-11-27-msq-s2-u2-brief.md` §3 (the rule) and §4 (the only sentences),
and `.claude/rules/raptor-executor.md`. The readers' reports and their proofs, every one re-run by the host and failing
for the reason it gives: `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/u2read/{astra,opus1,opus2,security}/`
(`report.md`, `zz-*.test.ts(x)`; a `.ts` proof belongs in `src/state/`, a `.tsx` in `src/ui/`). **Copy each proof you
fix into the repo as a test of its own file (`src/state/msq-s2-u2fix-*.test.ts`, `src/ui/msq-s2-u2fix-*.test.tsx`,
renamed, calling `withThird()`), see it fail, then fix.** No new words beyond §4 and the app's existing notes.

## The fixes, in this order

**1. The member view is not a lost right (opus1 F1, High).** U2's `makeAdminStuck` and `planRestoreStuck`
(`state/undo-wire.ts`) ask `mayGivePlanNow`, which reads the role in force, so an admin's own Plan or make-admin step
pressed in the member view is blocked for good in the wrong words, where the app says "Switch back to the admin view to
undo that." (D292). Add `mayGivePlanByAccount(unit)` in `state/accounts.ts` (the account's own role in place of the
role in force; otherwise the same body, failing closed the same); the two stuck checks call it; `mayGivePlanNow` stays
for `grantCtx`'s `mayPlan`, the doors and the screen. Proof: `opus1/zz-opus1-proof-1`, plus a master admin case (give
Plan → member view → Undo says "Switch back…" → admin view → Undo goes through).

**2. A Redo is refused whole, never halved (opus1 F2, opus2 F2, security S4 — the same fault).** `planRestoreStuck`'s
`if (n && n.level === 'admin' && roleSwap(acc, 'main', 'admin')) continue` skips the Undo of "made a member" (R3 (c))
but also the Redo of "made an admin and given Plan in one Save". Take opus1's fix: a `dropped(acc)` check over the
step's forward images (the account admin→member AND its Plan row ended in that step); the first skip only for
`dir === 'undo'` and `dropped(acc)`, the second (the member's drop, D2250) only for `dir === 'redo'` and `dropped(acc)`.
Proofs: `opus1/…-proof-2`, `opus2/…-proof-2`, `security/…-proof-4` (one test file for all three is enough).

**3. An unreadable home fails closed for a master admin too (Astra 1).** `state/units-model.ts mayGivePlanAt` returns
yes for a master admin before reading his home; R1 says every reader answers no for an unreadable home. Read the home
first, false when unreadable, then the master and own-admin branches; the first-admin arrival rule unchanged. Proof:
`astra/zz-astra-proof-1`.

**4. Enable and Restore are "making an admin" (opus2 F1, security S3).** R2's own words — "wherever a command leaves a
man an admin in force of `unit` who was not one before it" — with R1's list (an account switched off, a man archived:
not in force) cover these two doors; the agent's reading, said to the coordinator. Fix as the security reader's steps
1, 2 and 4 (NOT step 3 — no screen change, no greying: the door's refusal is the existing note, words D2806's sentence
"Only 149's own admins or a master admin can make an admin of 149."): `madeAdminsIn` counts an admin on a side only if
his account is on and his man is on the roster (not archived, deleted or a placeholder) on that side, people before and
after handed in; `madeAdminViolation` passes them and also runs when a command changes a person's archived mark;
`makeAdminStuck` the same; `updateAccount` — an admin's account switched off→on asks `makeAdminProblem(homeOn(a.pid,
today))`; `leavewar/sync.ts restoreProblem` (and `restoreArchivedAs`) — a man whose account is an admin's asks
`makeAdminProblem(his home)` and is refused. The Undo of a Suspend follows through `makeAdminStuck`. Proofs:
`opus2/…-proof-1`, `security/…-proof-3`. Check the posting pass and an overseas man's return (archived, then restored by
his own squadron's admin) still go through.

**5. The gate asks the app's own actor (security S1, High, older than U2).** Do the security reader's steps 1 and 2
only: in `state/perms.ts unitRowViolation`, the Plan who-check and the first-mark check move above `if (sys) continue`
and are asked of the app's actor too, exempting only origin `seed` or `remote` and a removal inside `lw.postoutRun`;
`madeAdminViolation` exempts the app's actor only for `seed` / `remote`. **Before you change it, list every path where
the app itself writes a grant row or an account role (the posting pass, the move-day pass, `account.told`, a restore,
the seeds) and make sure each still goes through** — run their suites. Steps 3 and 4 (`command/actor.ts`, the
`commitProjection` export) are NOT this round's: the host files them under SEC-R4-2. Proof: `security/…-proof-2` — of
its four failing tests, the two "nobody signed in" ones and the two projection-door ones must all be refused by the
gate after steps 1–2; if one still passes, say why, do not reach into `command/`.

**6. A bare `account.told` carries only account and squadron-Plan lines (security S2).** In `perms.ts
acctLineViolation`, run the `account.told` branch before `if (!ch.length) return null`: refuse unless the actor is the
app and every change is an `acct` or `sqplan` line. Proof: `security/…-proof-1` (drop its "it shows" case once the
premise is gone). Re-run `msq-s2-u2-lines`, `leavewar/msq-acct-lines`.

**7. A tap on a Plan line about a man with no row opens nothing (opus1 F3, opus2 F3, Astra 4).** Take opus1's fix: one
reader "has a row on squadron u's Admin → Users today" using the panel's own listing rule (`ui/userslist-model.ts`, not a
copy); `ui/topstate.ts planLine` answers null when he has none; the `sqplan` branch of `openNotice` asks `lineOpens`
first and, on null, marks the line read and stops (the archived case's road, D1691). Do NOT bring him in by a search
(Astra's alternative) — the brief's rule is "a man with no row there opens nothing". Proofs: `opus1/…-proof-3`,
`opus2/…-proof-3`; Astra's proof-4 expects the other answer — keep it out, and say so.

**8. The move line's audience as it stood on the move day (Astra 3).** A man made an admin after a move must not get
that move's line when a later wake rescans it. Read each reader's admin standing on the move day (the record of when
his admin right began — `adminFrom` — and the dated home and grants), shared by the writer and the gate; keep the fixed
ids; do not hide wrongly addressed lines instead. Proof: `astra/zz-astra-proof-3`. If no dated record of a master mark
exists, say so and limit it to what the records hold.

**9. One kind of apostrophe in the refused Undo's note (Fable's word review).** D2807's sentence mixes "149's" with
"can’t", and the app's tail adds "Osprey’s": make the squadron's possessive curly in that one sentence
(`state/accounts.ts`, the sentence beside "so this can’t be undone"), and the tests that pin it.

## Not this round — leave and name in the report
- Astra 2 (Hunter moving INTO 149, whose Plan of it ends, writes 149's admins no line): a reading for his word — the
  host files it. Do not build a line.
- Security steps 3–4 of S1 and the wider projection-door gap (SEC-R4-2): filed by the host.
- fixread10's old security pin S3 fails by design under D2626: leave it.

## When you finish
Run, one file at a time: your new fix test files; `src/state/msq-s2-u2-*.test.ts`, `src/ui/msq-s2-u2-*.test.tsx`; every
`src/ui/msq-s2-*.test.tsx`; the undo files (`undo/timeline`, `state/msq-guard-doors-undo` if present, `undo-rights`);
the posting pass and move-line suites; `leavewar/msq-acct-lines`, `msq-bell-*`; `state/perms-scan`,
`state/edit-rights-readers`; `msq-guard-rollcall` and `msq-guard-open.test.tsx -t "userrow|archrow|giveaccess|addperson"`;
the parity harness `node reference/tfin.js` (728/0) if you touched anything it reaches; `npx tsc -p tsconfig.app.json
--noEmit`; `npm run lint:changed -- --base HEAD --include-untracked`; `npm run docsize`. Records: `docs/file-map.md` for
the new tests; `docs/data-model.md` §11 if a gate rule changed (D200). Your final reply is the report: per fix, what
changed (file, function), the test seen failing then passing, and anything left; also append it as a "Fix round 1"
section to `2026-11-27-msq-s2-u2-report.md` (if refused, the reply alone is enough). Keep it concise.
