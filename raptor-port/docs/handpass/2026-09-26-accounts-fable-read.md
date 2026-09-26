# `[ACCOUNTS]` — independent read of the finished code (branch `claude/accounts`, HEAD 562d96a6)

**Verdict: no blocker. The permissions core is sound and fails closed.** I found four real but low-consequence defects, two of them places where the plan promises a mechanism the code does not have (a stronger one carries the load instead), and a handful of observations for the look card. Nothing lets a member, a guest, a person waiting or a switched-off account write another person's record, and nothing on the same browser survives a sign-out into the next sign-in that I could find.

I read: the brief's ruling rows (D148, D149, D165, D166, D169, D200, D202, D204, D210, D211, D56, D67), the plan, the register, the evidence sheet, `data-model.md` §11, and the live files named in the brief plus the ones they lean on (`sched-commit.ts`, `command/commit.ts`, `state/view.ts`, `leavewar/state/store.ts`, `leavewar/engine/stages.ts`, `ui/html.ts`, `ui/interactions.ts`, `ui/inputedit.tsx`, `ui/board.ts`, `ui/HelpPage.tsx`, `ui/ViewWeek.tsx`, `engine/hooks.ts`, `engine/publish.ts`, `tracker/role.js`, the four accounts tests, `perms.test.ts`, `perms-scan.test.ts`, `permsparity.test.ts`). I ran nothing and changed nothing.

---

## Findings, ranked by consequence

### F1 — The input commands never name their owner, so the command gate's own-row rule is inert for inputs; the ownership invariant is what actually holds the line

**Where.** `state/sched-commit.ts:430` `commitInputsWith(stores, type, fn)` has no `meta` parameter and the file contains no `meta` at all. `state/store.ts` `writeInputs` / `writeInputsBatch` pass none. So `inputs.write`, `inputs.batch` and `sched.mutate` always reach `cmdAuthorize` with no `meta.owner`, and the `optional` rule in `perms.ts:281` returns true for every member.

**What the plan promised (§4.3).** "`inputs.write` and `inputs.batch` — with `meta.owner` (or `meta.owners`) passed by `commitNewInput`, `commitInputEdit`, `removeInput`, `setInpField`, `setLeaveRemarks`". None of the five passes one. The same goes for the plan's §5 promise that the Quals writer diffs `PEOPLE` before the persist: `changedPeopleIds` (`people-settings-commit.ts:243`) is exported and has no caller.

**Why it is not a hole today.** `ownershipViolation` (`perms.ts:306`) runs as a hard invariant on the command's real changes and refuses any input whose person before or after is not the member, and any `people/<id>` other than his own. That is stronger than an owner claim. The writers also ask `mayEditInputOf` / `mayEditQualsOf` first.

**Why it is still a finding.** The evidence rests on `perms.test.ts:145` ("an input write: a member's own, never another's; with no owner named, the writer decides"), which calls `cmdAuthorize` with a hand-made `meta` that production never sends. The plan, the evidence sheet and the code comments in `perms.ts` describe a check that does not run. A reader who trusts the plan will look for a guard in the wrong place.

- Setup: sign in as `us`. Action: file any input on the Inputs page. Expected per plan: the `inputs.batch` envelope carries `meta.owner = 'bane'`. Observed in code: the command has no `meta`; the gate passes on the `optional` fall-through; the invariant checks the changes.

**Fix (either, not both).**
1. Build the promise: add `meta?: any` to `commitInputsWith` and `commitInputs` in `sched-commit.ts` and put it on the `Command`; add a `meta` parameter to `writeInputs` / `writeInputsBatch` / `writeInputsBatchWith` in `store.ts`; pass `{ owner: row.person }` from `commitNewInput` (`inputedit.tsx:849`), `commitInputEdit`, `removeInput` (`:1344`), `setInpField`, `setLeaveRemarks`. Then change `perms.test.ts:145` to drive a real `commitNewInput` as a member for another person and assert the gate's refusal reason is `unauthorized`.
2. Or amend the plan §4.3 / §5, the evidence sheet and the `perms.ts` comment at line 195 to say the owner check on inputs is the invariant, delete the dead `changedPeopleIds`, and add a test that a member's `inputs.batch` touching another person's input is rolled back with the `member-writes-own` message.

### F2 — A member's `sched.mutate` is authorised and the invariant lets a member change `days`; the schedule's safety against a member rests on UI gates alone

**Where.** `perms.ts:230` maps `sched.mutate` to `T.input U optional` (passes for a member with no owner). `ownershipViolation` deliberately leaves `days`, the book and the week stash to "the command's TYPE" (`perms.ts:330`, `default: break`). `sched-commit.ts:607` wraps every `afterSchedMutate()` raised outside a command in `sched.mutate`.

**What holds it today.** I walked every `afterSchedMutate()` call site in `ui/` (54 of them). Every one a member could reach is gated at the call: `interactions.ts` data-acc (`:567`), data-itadd/itdel (`:648`, `:686`), data-bacc (`:769`), data-draftgo (`:936`), the Shell's right-click clear (`Shell.tsx:198-217`), `textedit.ts` (contenteditable only in edit mode), `board.ts` (the board opens only from Edit Schedule), `Modals.tsx` AirPop (`isAdmin()`), `oilmode.ts` (board). So there is no live path.

**Why it is a finding.** The command layer is supposed to be the backstop for "a missing call site" (the plan's own words, §4.3 and the 6 Aug 26 rule). For the schedule it is not: one future `afterSchedMutate()` reachable from View-only Sched would commit as the member and pass both the gate and the invariant. The plan accepted `sched.mutate` as member-and-admin for the input-landing cascade, but that cascade runs as a joined child of `inputs.write`, never as a top-level `sched.mutate`.

- Setup: a member on View-only Sched. Action (hypothetical, no door exists today): any handler that mutates `DAYS` then calls `view.afterSchedMutate()`. Expected: refused at the gate. Observed in code: authorised; the invariant does not look at `days`.

**Fix.** In `ownershipViolation`, for a member, add before the `switch`: `if (env.type === 'sched.mutate') return 'the schedule (${where})'` for any change whose collection is `days`, `sched.book`, `sched.mutes`, `sched.orig`, `sched.als`, `sched.retired` or `weekstash`. A member's own input landing still passes because it arrives inside `inputs.write` / `inputs.batch`. Add a red-first test: a member actor committing `sched.mutate` with a `days` change is rolled back; a member's `inputs.batch` that lands a ground row is kept.

### F3 — Quals "Add person" has no write-path check of its own; a hand-made call mutates the roster, toasts "added", then is rolled back

**Where.** `QualsPage.tsx:638-672` `addPerson`: writes `PEOPLE[id]`, `ID_BY_CS`, toasts `"${cs} added"`, then `persistPeople()`. The button renders for admins only. The gate refuses the member's `people.edit` (`required`, no owner) and rolls `PEOPLE` back from the baseline, but only after the toast and the seat-view switch.

**What the plan promised (§5).** "Add person, archive, restore … now asking `mayManageRoster()`". Archive (`:424`) and restore (`sync.ts:1394`) do; add does not.

- Setup: sign in as `us`; from the console (or any future door) call the add handler. Expected: "Only an admin can add someone", nothing touched. Observed in code: the person is added in memory, "X added" is shown, the view switches seat, then the command is refused and the roster rebuilt. The `ID_BY_CS` index is rebuilt by `restorePeople`, so nothing is left behind.

**Fix.** First line of `addPerson`: `if (!mayManageRoster()) return HOOKS.toast('Only an admin can add someone', 'warn')`. Add a test beside the archive one in `ui/quals.test.tsx`.

### F4 — Three "who" records keep a callsign string with no person beside it, and one can read "admin" instead of the admin's callsign

**Where.**
- `leavewar/state/store.ts:2895` `approverName()` returns the viewer's callsign from `state.people`, else `'admin'`. The signed-in admin is not on `state.people` when his own puck is a SANS man with "Show SANS" off, or after his callsign was archived (the plan says an archived callsign keeps its account). In both cases a grant he enters is stamped `approvedBy: 'admin'`, which is the D104 wording D166 (5) replaced.
- The same record keeps only the callsign (no id), as does the replaced-bid notice's `byWho` (`inputgate.ts:305`). A later rename leaves the old callsign in the ledger and on the notice. The plan §8 chose this for the ledger, so this half is an observation, not a breach.
- The edit log does carry `pid` (`editlog.ts:215`) but the History list prints `who` as filed, so a rename is not followed there either. The log clears at every sign-in, so the window is one session.

- Setup: sign in as `ad` (Saber); on the Quals page tick SANS on Saber's own row (the walk's W5 scenario), or have the war's "Show SANS" off. Action: Leave War → credit OIL to someone. Expected: `approvedBy` = "Saber". Observed in code: "admin".

**Fix.** In `approverName()`, resolve through Raptor's roster, not the war's projection: read `state.viewer` and fall back to `PEOPLE[viewer]?.cs` via the roster projection already imported (`projectPeople` runs off `PEOPLE`), or have the sync push the viewer's callsign alongside `setViewer`. Keep `'admin'` only for a null viewer. If the id is wanted beside it, add `approvedById: state.viewer` to `LedgerEntry` when `[OIL-AWARD-IS-A-GRANT]` reshapes the record (D203 says not before).

### F5 — Observations for the look card (not defects against a ruling)

- **Asking for access while the guest switch is on** leaves the person on the waiting screen until his next sign-in (`AccessScreen.tsx:59`); the plan's table says a name that has asked sees the guest view "with the switch on", which is true only at sign-in. Consistent with "a change takes effect at his next sign-in", but worth a sentence.
- **The guest's issued face includes the Personal Inputs panel** with each non-medical commitment's type and free-text remarks ("Appointment — …"). D211 and §11 restrict medical detail only, and the panel is part of the issued programme; say so on the card so the owner can narrow it if he wants.
- **`installProbeBridge` gates only some globals behind its inner `isLocalHost()`** (`raptorRole`, `raptorMe`, `fileInput`, `lwSetCell`, `lwSetPostOut`); `lwSetRole`, `lwSetViewer`, `lwLoadWars`, `setPage` rely on `main.tsx:121` never calling it elsewhere. Hardening: move the whole body under one `if (!isLocalHost()) return`.
- **`e2e/playwright.config.ts` uses `http://localhost:<port>`** so the suites keep the bridge; a developer who opens the dev server by LAN address gets no bridge, by design.

---

## Explicit negatives — checked and sound, by name

**Authority in one place.** `perms.ts` is the only decider; the scan allow-list (`perms-scan.test.ts:21-32`) is short and each entry justified. `UsersPanel.tsx:89` duplicates the "own account" identity test (`SESSION.user === a.id || a.pid === me()`) that `accounts.ts:202` makes, which is identity, not authority, and the two agree.

**The command gate.** `wireStore()` installs `cmdAuthorize` at module eval, before any UI. `authorize` refuses an unregistered type and a type with no `COMMAND_OPS` row. `guest`, `pending`, `off` are refused for every forward type except `access.request` for `pending`, whose identity is `actor.principal` = the normalised sign-in name and whose `meta.owner` is the same string. Projections run as the system actor (`commit.ts:139`), so a guest or member scrolling weeks triggers `runPoArchive` / `runOilPass` / `setPeople` as reconciliations, never as themselves.

**The Leave War.** Its role and viewer are written only by `resetSession` (`lwSetRole`) and the sync mirror (`viewerId()`): a guest, pending or off session gets `''`, which `canEditRow` (`stages.ts:145`) never matches; null happens only with no session. Every `lw.config` writer a member could reach (`moveFigure`, `toggleFigure`, `resetFigureOrder`, `setRosterOrder`, `moveRosterRow`, `setPersLabel`, `setShowSans`, `setGroupColor`, `grantTo`, `setManualCredit`) checks `state.role === 'admin'` in the store, so a member's idle `lw.edit` never reaches the invariant's "an admin's record". `ackReplacement` is the person or an admin, matching §11. `lw.cell` ids split from the right so a war id with colons cannot fool the own-row check. The `pinViewer` pin is keyed to the SESSION object and has no production caller.

**Undo.** `endUndoSession` empties entries and both seq maps and keeps `expected`/`barrier`; `globalUndo` and `globalRedo` both ask `mayReverse` (`timeline.ts:559`, `:583`), which requires a non-empty person for a non-admin. `undo.restore` is refused for guest/pending/off at the gate and a member's restore is held to his own inputs, row and war cells by the invariant.

**The session and what the next person inherits.** `resetSession` is the one path: page → viewsched (which also closes the board, its dialogs via `HOOKS.closeBoardDialogs`, the stores/wave menus, `AVAILWIN`, `RESTARM`, `UNPUBARM`, `SECDEFOFFER`), selection/arm/highlights/search, every `VIEW_RESET` session entry, every `pops.ts` flag through `POPS_RESET` (with the completeness test), the toast, `LGEDIT`, the Leave War role, the Tracker session, the edit log, the undo list. `OILDAY` clears with the board. React-local state (Users panel form, Login form, Quals editing mode, the war's sheets and selection) dies with the Shell, which unmounts at sign-out because `App` renders `Login`. Bug reports deliberately survive, keyed by `pid`.

**Sign-in and the five states.** `signIn` refuses an empty name or password, checks the two seed passwords by account id only (renaming `ad` keeps its password, ruled not a finding), sends an off account to the switched-off screen, an unknown name to Request access, a waiting name to the waiting screen or the guest view. `sessionFor` gives every post-sign-in state a session with `pid: null` for the last three, so nothing runs as `system` for a user. Every access screen and the guest bar sign out through `ui/logout.ts`.

**The guards.** One person one account and one name one account (case-insensitive, checked on add, approve and rename, and de-duplicated again on load); an archived person keeps an account but cannot be newly linked; own account refused entirely; `ADMIN_LOCK` counts an admin ON whose person exists (archived included, consistently in both `updateAccount` and the loader's fallback). Promote B then demote A leaves B; nothing can leave none. A rename onto a waiting name answers the request (F1 of the walk); a request under a name that has an account is dropped on load.

**Persistence and rollback.** The three keys ride `SETTINGS_KEYS`; `accountsLoad` is in `SETTINGS_LOADERS` and in `initStore` after `hydrate`; it never writes; each account intent is one `commitSettingsIntent` whose `store.set` calls write raw while committing, so approve (account + request) and rename-answers-request roll back together, and `restoreSettings` re-runs the loader. No password field exists on the record or in the seeds' stored form. `guestview` is `true` or null.

**The guest.** `App.tsx` mounts `GuestApp` alone: no Shell, no document click/change/key listeners, no board, editor, viewer, history, templates, Leave War, Tracker, pages. `viewDayHTML` for a guest draws only the issued face (`dayIssuedHTML`) or "Not published yet"; the version picker, the ⓘ chip, the day-panel doors, the warning list (which is where the DNIF sentence with a medical's remarks lives) and the pending count (`PVQ` → 0) are all absent; `hideMed` reduces a medical row to "Unavailable" and its times with an empty remarks cell and no paperclip. The puck tooltip names callsign and OIL only. `viewVerSelHTML` returns nothing, so no working-copy peek.

**"Who".** `HOOKS.whoami` is the live callsign (rename follows), `whoamiId` the person; the edit log and bug reports carry both; "Your reports" and the admin's report list read the live callsign through `pid`; the unpublish `by` is the person id and is not displayed anywhere. The replaced-bid notice decides "your" by `isMe`, so an admin over his own bid gets no notice.

**Quals (D149).** Every row edit goes through `updatePersonField`: permission first, a closed op set, one `people.edit` naming its row, the invariant a second time, `renameCallsign` for the callsign, and the refusal wording fixed (F3 of the walk). The page renders controls on the member's own row only; archive ✕, Add person and Edit quals render for admins only.

**Inputs.** `commitNewInput` pins the member's person; `commitInputEdit`, `removeInput`, `caldrag.ts:89`, `DocViewer` (`Upchit`/`Edit input`) ask `perms`; the Person control is fixed for a member (`#inPersonFixed`); `InputsCal openAdd` seeds `me()`.

**The probe bridge.** Installed only when `location.hostname` is a loopback name (`main.tsx:121`); the e2e config uses `localhost`; the Tracker's own hooks are a stated exclusion.

**The drift test and §11.** `PERMS` matches §11 row for row as I read it, including the two named gaps and the guest's "no medical detail" note; the coverage test enumerates `registeredTypes()` after the scheduler, people/settings, undo, Leave War and Tracker register.

**The roll-call (§3 of the evidence sheet).** I found no missing surface. The only row whose mechanism is weaker than stated is 15 (`approvedBy`, see F4). Row 20's "the list empties at sign-in and sign-out" and row 30's "every window" are true in code, not only in the walk.

---

## What I did not do

I ran no tests and no browser; everything above is from reading. I did not read `e2e/app.ts`, the Tracker's `core.js` beyond its imports, or the hand-pass scripts, so the claim that all 318 Leave War browser tests pass is the evidence sheet's, not mine.
