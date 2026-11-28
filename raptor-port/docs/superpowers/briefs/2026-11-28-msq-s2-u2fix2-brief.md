# S2 step U2 — the second fix round: what the four blind readers of fix round 1 found (chat A212's brief, 28 Nov 26)

For one Opus builder. Work only in `C:/Users/User/projects/Raptor/.claude/worktrees/a212-s2-users-d10cb2` (the app in
`raptor-port/`). **You do not commit, stage, push, build or take the checks lock.** One test file at a time
(`npx vitest run <file>` from `raptor-port/`); never the whole suite; never weaken a test; no `sed -i`, no inline
script holding a backslash — write a script file and run it. Read first: `.claude/rules/raptor-executor.md`, the first
round's brief `2026-11-27-msq-s2-u2fix-brief.md` (fix 4 and fix 8 are what this round finishes) and the build brief
`2026-11-27-msq-s2-u2-brief.md` §3 (the rule) and §4 (the only sentences).

The readers' reports and proofs, each proof re-run by the coordinator and failing for the reason it gives:
`C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/u2fix1read/{astra,fable,opus,security}/`
(`report.md`, `zz-*.test.ts`; a `.ts` proof belongs in `src/state/`). **Copy each proof you fix into the repo as a test
of its own file (`src/state/msq-s2-u2fix2-*.test.ts`, `src/ui/msq-s2-u2fix2-*.test.tsx`, renamed, calling
`withThird()`), see it fail, then fix.** No new words: only D2806's sentence ("Only 149's own admins or a master admin
can make an admin of 149.", from `accounts.ts makeAdminProblem`) and the app's existing "That did not save".

The cast, for every test name and the report: Saber (master admin, home 142), Hunter (142's admin, Plan of 149),
Ranger (142's member), Kestrel (149's admin), Osprey (149's member), Mako (150's admin).

## The fixes, in this order

**1. Enable and Restore ask the role IN FORCE, never the stored role (Astra 1, Fable 2, Opus F2).** Hunter moves from
142 to 149 and is a member there (K3), though his account still stores `admin`. Mako, given Plan of 149, may bring a
suspended or archived member of 149 back — but Enable, Restore and "Restore as" refuse him in the make-an-admin
sentence, where the commit gate (`madeAdminsIn`) lets the same write through.
- `state/accounts.ts updateAccount`, the "ENABLE IS MAKING AN ADMIN" block: `if (patch.on === true && !a.on &&
  adminNow(next0))` and ask `makeAdminProblem(homeOn(next0.pid, todayIso()))` (the man the row will name — a re-link
  with Enable in one call asked the old man's home).
- `leavewar/sync.ts restoreMakesAdminProblem`: `if (!a || a.master || !adminNow(a)) return null`.
- Do not rewrite the stored role to dodge the refusal.
- Tests: Astra's proof 1 (three roads: Enable, Restore, Restore as), Fable's proof 2, Opus's proof 3 — one file is
  enough. Round 1's `msq-s2-u2fix-enable.test.ts` stays green (a true admin's Enable and Restore are still refused to
  a Plan holder; the first-admin arrival still goes through).

**2. The posting's two take-backs ask the same door, and the sheet never closes on a refusal (Fable 1, Opus F3,
security S5 — closes [LW-UNDO-POSTOUT-ADMIN-WORDS]).** Kestrel posts Osprey, made an admin of 149, overseas from
today; the posting runs (archived, sign-in suspended). Hunter (Plan of 149) presses "Undo post out": the gate refuses,
`Matrix.tsx` throws the answer away and the sheet closes as if it had worked. Moving the date later is refused as
"That posting date was not taken.". The gate is right and stays; the doors learn to say why. All in
`leavewar/sync.ts` and `leavewar/ui/Matrix.tsx`:
1. Beside `restoreMakesAdminProblem`, one helper the posting doors ask — "would taking this posting back bring an
   admin back?": his body archived with `archivedBy === 'po'`, or his account off with `offBy === 'po'` → return
   `restoreMakesAdminProblem(id)` (as corrected in fix 1), else null.
2. `undoPostOutProblem`: after the `adminArchived` line, return the helper's sentence when it has one.
3. `restoreArchivedPerson`: ask `restoreMakesAdminProblem(id)` on the no-post-in road too and return false, so that
   door never reaches the gate either.
4. `postOut`: work out `keep` first; where the take-back would lift what the posting made (`!keep.archive` with a
   `'po'` archive, or `!keep.suspend` with a `'po'` suspension) ask the helper. Export
   `postOutChangeProblem(id, from, outcome)` returning the sentence; `postOut` returns false on it.
5. `Matrix.tsx postOutOr`: ask `postOutChangeProblem` after `postOutProblem`, so its sentence is said in place of
   "That posting date was not taken.". Check every other caller of `postOut` and `undoPostOut` (the bid sheet's PO, the
   drag selection's PO, any second posting sheet) says the sentence the same way.
6. `Matrix.tsx`, the sheet's `onUndo`: use the door's answer — `if (!undoPostOut(open.id)) return 'That did not save'`
   before `close()` — so no later refusal can close the sheet silently.
- Tests: Fable's proof 1 (its two red cases become "refused in D2806's sentence, nothing changed"; its two controls
  kept: Hunter takes back the posting of a 149 MEMBER; Kestrel takes back the posting of a 149 ADMIN), Opus's proof 1,
  security's proof 2 — one `.ts` file. And one screen test (`src/ui/msq-s2-u2fix2-postsheet.test.tsx`, or beside the
  Leave War's own posting-sheet tests if their set-up fits better): Hunter presses "Undo post out" on Osprey's sheet —
  the sheet stays open and shows the sentence; pressed by Kestrel it closes and Osprey is back. A moved member
  (fix 1's Hunter, posted out of 149 and taken back by Mako) goes through.
- Re-run the posting suites (`leavewar/postout-outcomes`, `postout-landing`, `msq-war-a5-a6`, the posting pass's).

**3. A move's bell line reaches only those in force on the move day (Astra 2, Opus F1 — fix 8 finished).** Hunter
(Plan of 149) moves to 150 on 16 Jul; the first wake tells Kestrel and Saber. Osprey, an admin of 149 switched off
(2a), archived (2b) or made a member (2c) that day, is brought back on the 17th — and the next wake writes him the
line of the 16th, because `adminLineAudienceOn` starts from who can sign in TODAY and the stored moments
(`adminAt`, `masterAt`, `kept`, `fromAt`) never moved. **The orchestrator's decision: one new moment on the account
row, `liveAt` — "this sign-in last came back into force then" — and `adminAt` is NEVER moved** (`notices.ts
rightStart` / `rightHolds` read it; D2310's reading there — "an Undo of the take-away restores the row whole, its
moment with it, and the lines come back" — stays exactly as it is, and `liveAt` is not read there).
- `state/accounts.ts`: `Account.liveAt?: number`; `stampMoments` — `prev && prev.on === false && a.on !== false` →
  `now`; otherwise carried from `prev` (deleted when `prev` has none), never taken from what a door passes; a new row
  has none. `accountRow` writes it and the loader reads it (a finite number only), as `adminAt` is. Restore's
  `enableForRestore` and the posting's `enableAfterPosting` go through `writeAccounts`, so they are stamped by the
  same line — prove it with 2b.
- `state/perms.ts restoreRedated`, the account branch — an Undo or a Redo puts a row back whole, old moments with it.
  `liveAt` as the restore writes it: `now` (the restore's moment) when the put brings him into force — no row stored,
  or stored off and the image on, or stored not an admin's role and the image an admin's, or stored without the master
  mark and the image with it; otherwise as the stored row has it (the image's own older `liveAt` is never put back,
  and a newer stored one is never dropped — as `pidFrom` is kept "as it stands").
- `adminLineAudienceOn`: a reader counts only if `Math.max(best, liveAt ?? -Infinity) < dayStart` — the switch covers
  every road (home's admin, Plan, the master mark).
- The gate holds the moments (`perms.ts`, beside "an admin role not dated now" — about line 2243): hold `liveAt` the
  same way — changed only to this command's moment, only where the row comes into force by the rules above, never
  back-dated — and the restore's own writing passes it ("the restore never writes what the gate refuses"). A forged
  older `liveAt` is refused: a test.
- Tests (`src/state/msq-s2-u2fix2-moveday.test.ts`): Astra's proof 2; Opus's proof 2 (2a, 2b, 2c); 2d — Kestrel makes
  Osprey an admin on the 15th and undoes it, redoes it on the 17th: no line of the 16th; a master-mark twin of 2c
  (the mark taken on the 15th, its Undo on the 17th); and two controls — an admin of 149 in force on the 16th and
  switched off and on again on the 18th keeps his one line and gets no second; a Suspend undone the same day BEFORE
  the move day still leaves him told on the 16th. Round 1's `msq-s2-u2fix-moveday.test.ts` stays green, and so does
  every bell-retirement test (`rightHolds`: old lines come back on an Undo of the take-away).
- Records, in the same change: `docs/data-schema.md` (the account row) and `docs/data-model.md` (the user table and
  §11 if a gate rule's wording changes) wherever `adminAt` is described; `docs/notifications-register.md` if it names
  the move line's audience.

**4. A stale comment (Fable's note).** `state/undo-wire.ts`, above `restoreOf` (about line 701): "The app's own actor
… is the gate's to pass, as it does" — since round 1's fix 5 the gate refuses the app's actor a Plan. Correct the
comment; no behaviour.

**5. fixread10's old security pin S3, re-pointed (outside the repo).** `…/s2-chat205/fixread10/security/zz-security-proof-1.test.tsx`,
case S3, asserts the rule before D2626 (Kestrel's stale pick for Mako after a master admin gave Mako Plan of 149 is
refused); since D2626 Kestrel, 149's own admin, may lower or end it, so the save goes through (the repo's rejudge3 was
re-pointed in Pass A). Copy the file into `src/ui/`, re-point that one case to "saved" with a dated comment naming
D2626, run it (6 of 6), save the re-pointed copy beside the original as `zz-security-proof-1.d2626.test.tsx` — never
overwrite the original — and remove it from `src/ui/`.

## Not this round — leave and name in the report
- The security reader's S1–S4 and Astra's 3 (the app's own actor: a home row, a View row, an account-only demotion,
  the `remote` label): the coordinator files them under [GATE-APP-ACTOR-DOORS] for the security review before the
  database step. Do not touch the gate for them.
- Enable and Restore staying live for a Plan holder on a true admin's row and refusing on the press (Fable's and
  Opus's notes), and whether the make-an-admin sentence reads right there: fix 4 is the agent's reading of R2 — parked
  for his word. No screen change.
- If a fix needs a word the app does not have, or a ruling does not cover a case: stop and say so in the report.

## When you finish
Run, one file at a time: the new `msq-s2-u2fix2-*` files; every `src/state/msq-s2-u2*.test.ts` and
`src/ui/msq-s2-u2*.test.tsx`; `src/state/accounts.test.ts` and the moments' own tests (grep `adminAt` in tests); the
undo files (`undo/timeline`, `msq-undo-rights`, `msq-undo-worlds`, `msq-fix2-*`); the posting suites named in fix 2;
`leavewar/msq-acct-lines`, `msq-bell-*`, `multi-sqn-fixread10`, `-fixread11`, `-fixread12`; `state/perms-scan`,
`state/edit-rights-readers`; `node reference/tfin.js` (728/0) if you touched anything it reaches;
`npm run lint:changed -- --base HEAD --include-untracked`; `npm run docsize`. Records: `docs/file-map.md` for the new
tests. **Write your report to
`C:/Users/User/AppData/Local/Temp/claude/4c1f52179889e8bf/00df8e1d-41bd-40f0-9555-e8082ed913be/scratchpad/u2fix2-report.md`**
(per fix: what changed — file, function; each test seen failing, then passing; every suite run with its count;
anything left or unclear) and append it as a "Fix round 2" section to `2026-11-27-msq-s2-u2-report.md`. Your final
reply is a ten-line summary pointing at that file.
