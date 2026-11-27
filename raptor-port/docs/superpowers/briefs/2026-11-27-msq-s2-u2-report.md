# U2 report (chat 205, step U2)

## Pass A — the rule, the doors, the gate and the replay

**Status: READY FOR INDEPENDENT REVIEW (Pass A only).** Nothing committed, staged or pushed; no build, no checks lock, no full suite. Pass B (`ui/topstate.ts`, the lines) and Pass C (the row, `useraccess-model.ts`, roles note 5) not started.

### Hand-made sessions (counted before Pass A)
- **1 file** whose hand-made session has no account and makes an admin: `leavewar/holnotice.test.tsx` (`setSession({ user: 'ad', … })`, then `addAccount('wd','nact','admin')` in its set-up). Confirmed at run time: all 36 of its tests went red under Pass A (Q8's door fails closed), then green after the set-up change below.
- A wider grep (door calls of `setGrant` / `removeGrant` with nobody signed in) gave 13 candidate files; each was run under Pass A and none turned red for that reason (they sign in properly through helpers).

### Changes, file by file
- `state/units-model.ts` — the pure core (R1): `mayGivePlanAt` (fails closed: no account, switched off, archived/deleted/placeholder, no home, home ≠ the squadron; a master admin only with the admin role in force); the Q8 helper `madeAdminsIn` (R2: keyed by man, judged today, a home row alone makes nobody an admin).
- `state/lastadmin.ts` — `LockHit` carries `own` (R5, D2816). Nothing else.
- `state/units.ts` — `mayGivePlanOn`, `madeAdminsNow` (this store's fallback home); `setGrant` / `removeGrant` ask `mayGivePlanNow(unit)`, failing closed with nobody signed in; `PLAN_MASTER_ONLY` and `notMaster` gone, the refusal is the line sentence.
- `state/accounts.ts` — `mayGivePlanNow(unit)`; the three sentences (`planWords`, `makeAdminWords`, `makeAdminUndoWords`); `lockWords` tails per R5; `relinkRightsProblem` asks the rule for a Plan that holds (Q12's words; the View case unchanged); Q8 at `saveAccess` (role to admin, `remade` included), `updateAccount` (a role change, and a re-link leaving a man an admin), `addAccount`, `approveRequest`, `approveRequestNew`, `addPersonAndAccount`; `saveAccess`'s Plan line asks `mayGivePlanNow(ln.unit)`.
- `state/perms.ts` — the gate's reader `planActorOf` / `mayGivePlanOf` (the actor as he stood BEFORE the command); the Plan who-check per row's squadron, the replay exception gone; the receiver check reads the role in force after the command; the `first` mark rule; `RestoreGrantCtx.master` → `mayPlan`, rule 4 failing closed, comment rewritten; the restore backstop hands `mayPlan`; G4 asks the rule for a Plan that holds (reason "re-linked by one who may not end it"); Q8's own section `madeAdminViolation`, called beside `homeUnitViolation`.
- `state/undo-wire.ts` — `grantCtx` hands `mayPlan`; `pressedByMaster` gone; `planRestoreStuck` (R3 b, over the full images) and `makeAdminStuck` (R4: D2807's sentence on an Undo, `true` on a Redo); the installed `stuck` in the brief's order; `planRestoreStuck` also inside `restoreRefusal`; `_planChecks(false)` (tests only) so a test sees the gate alone. Both checks read the accounts and squadron rows from the store on both sides (see "found while running").
- `undo/timeline.ts` — the agreed three places only: the `stuck` hook's type `boolean | string`, the Undo call and the Redo call pass a sentence to `sayBlocked`, `true` → OUT_OF_BAND.

### Files touched that are not on §21.2's list
- `state/lastadmin.ts`, `undo/timeline.ts`, `state/units-model.ts` (all named in the brief's §5).
- Tests re-pointed (below) and `leavewar/holnotice.test.tsx`'s set-up.
- `docs/file-map.md` NOT edited: the three new test files are owed their rows by whoever closes the step.

### New tests — each seen failing first, then passing
- `state/msq-s2-u2-doors.test.ts` (40): run against the code before the change — 29 failed (old words "Only a master admin gives Plan or makes a master admin.", Q8 doors saving, old last-admin tails), 11 passed (pins and cases the old code already refused); after the doors — 34/40, the 6 left waiting on the gate; now 40/40.
- `state/msq-s2-u2-gate.test.ts` (18): written after the code, so seen red by putting the HEAD versions of the seven source files back for one run (then restored byte for byte, checked with `cmp`): 12 failed, 6 passed — the 6 are named "pin:" (Saber's one Save with Plan; Saber in the member view; the own-actor command; a kept `first`; "+ New squadron" Undo/Redo; Q8 as Kestrel). Now 18/18.
- `state/msq-s2-u2-replay.test.ts` (43): the same way, 41 failed, 2 passed (both "pin:": Saber's make-member Undo/Redo; Ranger's make-member Undo leaving the Plan out). Honest note: on the old code most replay cases fail at their SET-UP (Kestrel could not give Plan then), so the old code cannot show R3's refusal red on its own; the "gate alone" case and the D2807 cases are the ones that show the new refusal itself. Now 43/43.

### Pins re-pointed, by name, and why
- `state/msq-s2-plan.test.ts` — the "as built today — changes at U2 (D2730 Q8)" block: (i) the Role tick now refused in D2806's sentence; (ii) the re-link now refused in D2806's sentence; (iii) Hunter's Undo now refused in D2807's sentence — each as its own comment said U2 would.
- `ui/msq-s2-asis.test.tsx` group 3, cases 1 and 3 — the D2806 tail ("Only 149's own admins or a master admin can make another.") and the D2816 tail ("Only a master admin can make another.").
- `state/units.test.ts` — Pike (142's own admin) giving Osprey (a member) Plan of 142: now refused as "Plan is for an admin" ('This change could not be saved.'), since Pike may give Plan of 142 (D2626).
- `state/save-access.test.ts` — "Plan is a master admin's to give (PA1)" → Kestrel giving Hunter Plan of 149: saved (D2626).
- `state/piece-b-tables.test.ts` — "4.": `master` → `mayPlan`, "not asked: as before" → "not asked: left out"; the two rule-2 cases on a Plan row now say `mayPlan: true` (rule 4 fails closed; what they pin is unchanged).
- `state/reshape-plan-audit.test.ts` — PA1 (a)–(d): Kestrel, 149's own admin, now saved; PA3 (a): still refused, now by Q8 for 142 (Kestrel holding only Plan of 142 may not make another 142 man an admin).
- `state/reshape-piece-c-doors.test.ts` — Ranger's words for 150 (no admin of its own): D2816's tail.
- `state/lastadmin.test.ts` — six `toEqual` hits gain `own` (true / false).
- `state/edit-rights-readers.test.ts` — undo-wire's `isAdmin` count 4 → 3 (`pressedByMaster` gone).
- `state/signin-kinds-cells.test.ts` — AD, PL, VA: `givePlan` in their own squadron now holds (D2626).
- `ui/msq-s2-rejudge3.test.tsx` — "a pick the line no longer allows": Kestrel's Save of View over the Plan a master admin gave since now goes through as one call (D2626). See "unclear" 2.
- `leavewar/multi-sqn-fixread8` (fault G step 1), `-fixread9` (SEC9-1 gate): a Plan raised for / re-pointed to Hunter after his move to 149 is now refused first as "Plan on an account that is not an admin's" (the receiver check reads the role in force; he is 149's member). The "not dated today" rule stays pinned by the other rows of those tests.
- `leavewar/multi-sqn-fixread10` (O10-4b), `-fixread11` (SEC11-5 door; the new-account-row gate; fault H) — Q12's words, G4's new reason, the who-check's new reason.
- `leavewar/holnotice.test.tsx` — set-up only: Warden is added by Saber really signed in, then the file's own hand session is put back.

### Every file run, one at a time (final counts)
- New: msq-s2-u2-doors 40/40 · msq-s2-u2-gate 18/18 · msq-s2-u2-replay 43/43.
- msq-s2-*: order 14 · plan 4 · asis 24 · lists 14 · row 15 · rejudge 23 · rejudge2 52 · rejudge3 39 · rejudge4 110 · rejudge5 83 · rejudge6 21 · rejudge7 14 · rejudge8 32 · rejudge9 15 · rejudge10 21 · rejudge11 11 — all passed.
- Guard: asis 29 (+4 todo) · doors 125 (+1 todo) · doors-bell 79 · doors-switch 104 · doors-undo 12 (+1 todo) · g 33 · note 65 · rollcall 49 · input-sqn 25 (+2 todo) · drawn-role 30 · drawn-rights 31 · drawn-landing 30 · guard-open with `-t "userrow|archrow|giveaccess|addperson"` 12 passed (178 skipped by the filter). After the two late fixes (below) the touched files, the undo files and a group of earlier-green files (doors-bell, doors-switch, rejudge4, rejudge5, users-row, onedoor-users, postout-outcomes, msq-bell-rights, fable-master-mark-lock, the two msq-fix2 words files, ui/oilundo, opendates-store) were run again: all green.
- edit-rights-readers 4.
- Domain: units 22 · save-access 29 · piece-b-tables 25 · reshape-plan-audit 9 · reshape-plan-audit-read 4 · reshape-piece-c-doors 20 · lastadmin 24 · accounts 44 · msq-undo-rights 11 · msq-undo-worlds 15 · msq-fix2-undo-last-admin-words 1 · msq-fix2-redo-move-lock-words 1 · msq-fix2-undo-right-lock 2 · units-sqn-guard 17 · signin-kinds-fixes 27 · fable-master-mark-lock 2 · fixread8 22 · fixread9 26 · fixread10 29 · fixread11 46 · fixread12 37 · fixread3-postlock 5 · postout-outcomes 31 · msq-war-a5-a6 13 · msq-users-row 7 · rolestable 12 · onedoor-users 22 · accounts-ui 21 · accounts-newperson 26 · admin 5 · msq-bell-tap 12 · postout-landing 4 · msq-users-filter 24.
- Must pass unchanged: timeline 22 · timeline-cr 19 · integration 6 · oilundo 4 · ui/oilundo 7 · oilundo-button 2 · oilconfirm 33 · undo-caret 3 · msq-fix2-r2-input-undo 4 · midnight-swap-undo 6 · opendates-store 37 — all passed, none edited.
- Hand-session candidates and other last-admin files: holnotice 36 · msq-bell-rights 14 · reshape-r2-move-back 3 · signin-kinds-cells 22 · tracker/msq-bell-recheck-after-ask 5 · tracker/msq-trk-follows-pick 28 · units-sqn-fixread2 34 · multi-sqn-a3-foreign 12 · reshape-b3-lock-door-vs-gate 4 · person-delete 22 · postout-notice 27 · leavewar/ui/po 18.
- Security pins, each copied into `src/ui/`, run, removed (no `zz-` file left): fixread9 proof-1 8/8, proof-2 7/7; fixread11 proof-1 5/5, proof-2 2/2; **fixread10 proof-1: 5/6 — S3 fails by design** (see "unclear" 2).

### Type check and code check
- `npx tsc -p tsconfig.app.json --noEmit`: exit 0.
- `npm run lint:changed -- --base HEAD --include-untracked`: "no new finding (48 changed files read against HEAD)".

### Found while running, and fixed
- The `first` rule refused the Undo of Saber's removal of a first admin's Plan (msq-fix2-undo-right-lock went red): a verified replay now passes the `first` rule (it puts back the very row the step recorded); who may put that Plan back is still the who-check's, asked of the presser today. A reading, named here.
- `makeAdminStuck` read the accounts before the restore from the in-memory list, which in one UI test lagged the store (Mako missing), so a rename's Undo read as "Mako made an admin of 150" and was refused (msq-s2-row V4b). Both checks now read both sides from the stored rows, as the gate's two worlds do.

### Unclear, and what I chose
1. **§8 "The same Undo by Saber, and by Kestrel holding Plan of 142: both come back"** contradicts R4 / D2807: Kestrel holding only Plan of 142 may not make a man an admin of 142 (D2806), so his Undo of making Hunter a member is refused in D2807's words for 142. I followed D2807 (the later, more specific ruling); the replay test pins it. Saber's Undo: both back (pin).
2. **The stale pick under an open row (rejudge3's pin, security pin S3):** Kestrel picks View/None for Mako, a master admin then gives Mako Plan of 149, Kestrel saves. Before U2 the door refused (Plan a master admin's alone); since D2626 Kestrel, 149's own admin, may lower or end it, so the save goes through. I re-pointed rejudge3 to "saved". The security pin S3 (outside the repo, not edited) still asserts the old rule and fails. Whether the guard should stop an own admin's pick made before the line changed (Pass B's row-changed note) is for the orchestrator / Pass B to settle; then S3 is re-pointed or retired.
3. R4's ordering: the make-admin check runs before `planRestoreStuck`, so an Undo that does both reads D2807's sentence.
4. Q8's door for a man with no home known fails closed with "This change could not be saved." (the reader's own fail-closed answer).
5. The `first` rule asks for exactly one first row for that squadron in a `unit.add`, and a master admin; a verified replay passes (above).
6. The gate's reason words are internal and new where the rule changed: "Plan given, changed or taken by one who may not give it", "re-linked by one who may not end it", "a man made an admin of <unit> by one who may not give its Plan", "a squadron's first-admin mark written outside \"+ New squadron\"", "a Plan put back by one who may not give it" (no on-screen words beyond §4).

### Readings built (for the report's §10 list)
- The door's refusal in D2806's grey-line sentence (B6), the same for a re-link that makes an admin.
- " Press Undo again for: …" after D2807's sentence (the app's existing `sayBlocked`).
- (Pass B/C readings — "No sign-in", the greyed Admin's undrawn places, the raise/lower mapping of the lines — not built in Pass A.)

### Left out (by the brief)
D2808's four lines; Q4's folds; the coloured numbers; the Redo's words (the stand-in is OUT_OF_BAND, its test named "changes when the Redo's words are ruled"); the re-link line. Readings 22, 23 and 24 are his answers (D2730 Q10–Q12), so no clause is left out for them.

### What a person will see differently (Pass A)
- Refusals at the doors now read the §4 sentences ("Only 149's own admins or a master admin can give or end Plan of 149." / "… can make an admin of 149." / the re-link's Q12 sentence / the last-admin tails / D2807's Undo sentence).
- A squadron's own admin (Kestrel) can now give, raise, lower and end Plan of it; a Plan holder (Hunter) can no longer make a man that squadron's admin.
- Still showing the old "Only a master admin gives Plan." on the row: `ui/useraccess-model.ts` lineState (Pass C's / Pass B's change).

### Ten-line summary
1. One rule now answers "may he give or end Plan of this squadron, and make its admins": its own admins or a master admin, who can still sign in.
2. Every door asks it (Plan lines, the Role tick, new accounts, approvals, adding a person, re-links), refusing in the brief's exact words.
3. The commit gate asks the same rule, of the actor as he stood before the command, with no exception for an Undo or Redo.
4. A new gate section refuses a man made an admin by one who may not; the `first` mark is a "+ New squadron"'s alone (or its exact replay).
5. An Undo or Redo of Plan by one who has lost the right is blocked whole, in today's words; the Undo of making an admin a member, by one who may not, says D2807's sentence.
6. The last-admin words now say who can make another, by whether the squadron has an admin of its own.
7. Three new test files (101 tests) were seen red against the old code and are green; every listed file passes one at a time.
8. Sixteen existing test files were re-pointed (fifteen pins, one set-up) to the new rulings, each with its reason in a comment.
9. One brief line contradicts D2807 (Kestrel holding Plan of 142); I followed D2807.
10. One outside security pin (S3) fails by design under D2626 and needs re-pointing or retiring once Pass B settles the stale-pick case.

## Pass B — the lines

**Status: READY FOR INDEPENDENT REVIEW (Pass B only).** Nothing committed, staged or pushed; no build, no checks lock, no
full suite. Pass C (the row: `useraccess-model.ts`, `UserAccess.tsx`, `UsersPanel.tsx`, roles note 5) not started.

### Changes, file by file
- `state/notices.ts` — a new line kind, `sqplan` (`{ who, c: given | ended | member | moved, num, mv? }`, its squadron
  the notice's own stamp `u`); not `acct`. The four §4 sentences (`partWords`); its bell line (`noticeWords`: the man in
  bold by today's callsign, the day, the words, the signer — the move's unsigned). The writer `noticePlanLine` (never to
  the presser, never to the man himself, never to a man no longer here; a fixed id per reader for a move's line) and
  `isPlanLine`. `noticeLive`: an admin-kind line (`ADMIN_KINDS` — so the rights rule `rightHolds` and the move rule
  `noticeLeftBell` judge it as a posting's), the bell's switch reading its stamp, and hidden in the member view as a
  posting's line is (a reading, below).
- `state/acctlines.ts` — `planLinesOf(pid, parts)`: the one body saying which change owes which line, from the very parts
  the man's own lines come from (Plan given or a View raised → "given"; ended or lowered → "ended"; ended while his own
  squadron's admin makes him a member → "member"; ended by his move → "moved"; D2808's four → none). `tellAccess` writes
  them beside his own lines, to `adminLineAudience(u, today, rows before)` — the rows `accessWas()` found, kept with it.
  `planMovesOwed` / `planMovedLineId`: a move's line on the move's day, by the app's own `account.told` pass, unsigned,
  once; `writeMoveLines` writes both kinds.
- `state/perms.ts` — `planLineViolation` (+ `planLineChange`), called right after `acctLineViolation`, for every actor:
  an admin's command — each line new, owed by this command's own change of that man's Plan of that squadron (the same
  `planLinesOf` over `accessParts` of the command's rows before and after), to a reader in that squadron's audience on the
  rows before, never the man nor the actor, one per reader, signed by the actor, dated now, stamped with that squadron,
  named by the man's callsign; an Undo / Redo — the verified replay, taken away only where the restore changes that man's
  Plan of that squadron too, put back only where owed again; `account.told` — a move's line only, as the pass writes it;
  any other actor or command refused. `adminOwnerViolation` passes these lines over to it (as it does `acct` lines); the
  `account.told` section of `acctLineViolation` lets them ride.
- `state/undo-wire.ts` — `acctLineLeftOut` widened to the new kind, by its squadron (the stamp) and its man (`who`): a
  Plan row left out (R3 (c)) keeps its squadron lines; and a line a Redo would put back on a reader no longer in that
  squadron's audience today is left out (the gate owes it only to the audience — without this, a Redo after someone lost
  his Plan of 149 would be refused whole). `acctNoticesReversed` stays handed the step's images: the test below proves
  the opposite line comes out right either way (the plan l.2566–2570's "V7 proves it either way").
- `ui/topstate.ts` — exactly what chat 204 agreed: `sqplan` keyed in `LINE_KINDS` (`planLine`: 'admin'; null for a man
  archived, deleted or a placeholder, null where his pages may never be the squadron), and its own `openNotice` branch on
  the posting line's road (after the existing `enterForLine`: the line read, then `openAdminUsers({ person: who })`, or
  nothing). No guard line, no refusal added (D2825); no new `enterForLine` call.
- `docs/notifications-register.md` — the four lines, unnumbered rows after B15; the D2220 bullet notes "Plan given or
  removed" built, its D2808 endings waiting for U2L.
- `docs/file-map.md` — one paragraph: Pass B's changed files and all five U2 test files (Pass A's three owed rows with it).

### Files touched that are not on §21.2's list
- None beyond §5's Pass B list and the two docs. (`ui/topstate.ts` is chat 204's, edited only as agreed.)

### New tests — each seen failing first
- `state/msq-s2-u2-lines.test.ts` (26): against HEAD's five source files (put back for one run, restored, checked with
  `cmp`) 21 failed, 4 passed — the 4 are D2808's pins (archive, overseas posting, delete, made a master admin write no
  squadron line). The 26th, added after (Hunter, who had read his lines, gets "Made an admin of 142" alone after
  Ranger's Undo) is a pin of today's follow-up, passing as built. Now 26/26.
- `ui/msq-s2-u2-tap.test.tsx` (4): against HEAD's sources 4 failed (no line to tap); with only `ui/topstate.ts` put back,
  2 failed (the tap opening Admin → Users at Mako's row; `lineOpens`) and 2 passed (the window-open refusal and the
  archived man — today's shared road already reads them right); and R5 (d) went red, "sqplan: say what a tap on this line
  opens", as the brief predicted. Now 4/4, R5 (d) green.
- V10 covered: each of the four lines to the right readers, never the presser (given; raised; ended; lowered; made a
  member by Saber and by 142's Ranger; moved, unsigned, once); the man only his own line; Undo takes them back, Redo puts
  the same lines back; R3 (c) — Ranger's Undo of a make-member leaves the Plan out and both "ended" lines stand; Saber's
  same Undo takes them back; the tap (nothing open → 149's Admin → Users at his row, ringed; a window open → refused as
  any line; archived → opens nothing, kept); D2808 pins. The gate's forged lines, each refused by name ("a squadron's Plan
  line…"): no row changed; another account's row; another squadron's row; unsigned; signed as another; a reader outside
  the audience (Osprey, the presser, the man); two lines to one reader; words not matching ("ended" for a give, "made a
  member", "moved" from a person); another squadron's stamp; a member's command; the app's writer for a move that never
  happened. A control (the honest hand-built line) saves.

### Pins re-pointed
- None in Pass B. Every listed file passed unchanged.

### Every file run, one at a time (final counts, all passed)
- New: msq-s2-u2-lines 26 · msq-s2-u2-tap 4. Pass A's: doors 40 · gate 18 · replay 43.
- msq-s2-*: order 14 · plan 4 · asis 24 · lists 14 · row 15 · rejudge 23 · rejudge2 52 · rejudge3 39 · rejudge4 110 ·
  rejudge5 83 · rejudge6 21 · rejudge7 14 · rejudge8 32 · rejudge9 15 · rejudge10 21 · rejudge11 11.
- Guard: asis 29 (+4 todo) · doors 125 (+1) · doors-bell 79 · doors-switch 104 · doors-undo 22 (+1) · g 33 · note 65 ·
  rollcall 49 · input-sqn 42 (+1) · drawn-role 30 · drawn-rights 31 · drawn-landing 30 · guard-open with
  `-t "userrow|archrow|giveaccess|addperson"` 12 (178 skipped by the filter).
- edit-rights-readers 4.
- Domain: units 22 · save-access 29 · piece-b-tables 25 · reshape-plan-audit 9 · reshape-plan-audit-read 4 ·
  reshape-piece-c-doors 20 · lastadmin 24 · accounts 44 · msq-undo-rights 11 · msq-undo-worlds 15 ·
  msq-fix2-undo-last-admin-words 1 · msq-fix2-redo-move-lock-words 1 · msq-fix2-undo-right-lock 2 · units-sqn-guard 17 ·
  signin-kinds-fixes 27 · fable-master-mark-lock 2 · fixread8 22 · fixread9 26 · fixread10 29 · fixread11 46 ·
  fixread12 37 · fixread3-postlock 5 · postout-outcomes 31 · msq-war-a5-a6 13 · msq-users-row 7 · rolestable 12 ·
  onedoor-users 22 · accounts-ui 21 · accounts-newperson 26 · admin 5 · msq-bell-tap 12 · postout-landing 4 ·
  msq-users-filter 24.
- Must pass unchanged: timeline 22 · timeline-cr 19 · integration 6 · oilundo 4 · ui/oilundo 7 · oilundo-button 2 ·
  oilconfirm 33 · undo-caret 3 · msq-fix2-r2-input-undo 4 · midnight-swap-undo 6 · opendates-store 37 — none edited.
- The bell's files: msq-acct-lines 24 · msq-bell-audience 8 · msq-bell-rights 14 · msq-posting-failed 9 ·
  postout-notice 27 · msq-bell-show 6 · bellnotices 47 · holnotice 36 · signin-kinds-cells 22 · person-delete 22.
- Security pins, each copied into `src/ui/`, run, removed (no `zz-` file left): fixread9 proof-1 8/8, proof-2 7/7;
  fixread11 proof-1 5/5, proof-2 2/2; fixread10 proof-1 5/6 — the same S3 as Pass A, by design under D2626, untouched by
  Pass B.

### Type check, code check, document check
- `npx tsc -p tsconfig.app.json --noEmit`: exit 0.
- `npm run lint:changed -- --base HEAD --include-untracked`: "no new finding (32 changed files read against HEAD)".
- `npm run docsize`: OK, every record accounted for (HANDOFF.md and OUTSTANDING.md over their tripwires already —
  deferred, D29; not this pass's).

### Found while building
- **The app's own projection door could write a non-account line in an `account.told` command** — seen red on HEAD:
  `acctLineViolation` returns before its `account.told` check when the command carries no `acct` line, and the system
  actor is asked nothing else, so a lone forged line rode through. Closed for the new kind (`planLineViolation` judges
  every `sqplan` line of every actor). Whether other kinds can ride an `account.told` alone is **not checked** — a
  finding for the security reader, outside this pass.

### Readings built (for the report's §10 list)
- The raise and lower mapping: View raised to Plan reads "Given Plan of 149"; Plan lowered to View reads "Plan of 149
  ended" (needs the fresh Fable word review, D2441, as the brief says).
- The line is hidden in the member view, as a posting's line is, because its tap opens Admin → Users (the agent's
  reading; the brief named only the switch and the rights rule).
- The move's line goes to the squadron's audience as it stands on the move's day (its Plan holder already out of it).
- A man with no row opens nothing, but — on the posting line's road — the squadron is entered first (the guard asks),
  then nothing opens and the line is read.
- A Redo's line to a reader no longer in that squadron's audience is left out of the restore rather than refusing it.

### Left out (by the brief)
D2808's four lines (pinned silent); Q4's folds ("From other squadrons", "View only", the other squadron's heading — U3,
U5); the two coloured numbers on the line (the bell's `BellList`, `belltap.ts lineSqnMark` untouched); the Redo's words;
the re-link line (a re-link writes no squadron line — `accessParts` owes nothing across a re-link). Readings 22–24 are his
answers (D2730 Q10–Q12), so no clause is left out for them.

### Owed by the step's records, not done in Pass B (the brief's "Records in the same change")
- `docs/data-schema.md` — the new notice kind; `docs/data-model.md` §11's `Notice` row — the gate's new rule for these
  lines (D200 pairs `perms.ts` with §11). Named here so the closing of U2 carries them.

### What a person will see differently (Pass B)
- When a man's Plan of a squadron is given or ended, that squadron's admins (its own, its Plan holders, a master admin
  with it switched on) get one bell line under his name — "Given Plan of 149 · Kestrel", "Plan of 149 ended · Kestrel",
  "Plan of 149 ended: made a member · Ranger", "Plan of 149 ended: he moved to 150" (no name). The one who pressed gets
  none; the man keeps only his own line. A tap opens that squadron's Admin → Users at his row, ringed. Every three-squadron
  test world now leaves Kestrel one such line from its set-up (Saber giving Hunter Plan of 149) — no listed test minded.

### Ten-line summary
1. A new bell line tells a squadron's admins when a man's Plan of it is given or ended, in the four ruled sentences.
2. It goes to everyone who already gets that squadron's admin lines, never the presser; the man keeps his own line only.
3. One body decides which change owes which line; the writer and the commit gate both ask it.
4. The gate refuses any such line its command's own change does not owe — forged readers, words, signers, stamps.
5. A move's ending is told by the app on the move's day, unsigned, once; D2808's four endings stay silent for U2L.
6. Undo takes the lines back and Redo puts them back; a Plan the Undo leaves out keeps its "ended" lines.
7. A tap opens that squadron's Admin → Users at his row, ringed; a window open refuses it; an archived man opens nothing.
8. Two new test files (30 tests) were seen red against the old code and are green; every listed file passes unchanged.
9. Found: the app's own "account.told" door let a lone non-account line through; closed for this kind, the rest owed a look.
10. Owed: the data-schema and data-model §11 rows for the new kind, with the step's closing records.
