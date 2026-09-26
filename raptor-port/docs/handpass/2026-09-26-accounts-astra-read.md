# `[ACCOUNTS]` independent code-read report

## Verdict

**Not clear yet.** I found four defects:

1. **High:** switching off, demoting, or relinking an account does not revoke an already-open session in another tab.
2. **Major structural gap:** the generic scheduler backstop authorizes members as though a schedule mutation were an input write; its mutation also occurs before that backstop opens the command.
3. **Moderate:** Tracker carries the previous person’s course and student selection into the next login.
4. **Low:** two scheduler presentation selections—the board layout and roster-palette day—survive a login boundary.

The first is a live authority failure. The second is presently protected by the visible UI doors I inspected, but it defeats the promised write-path backstop if any call site is missed. The latter two breach the session-reset promise without granting extra data access.

I reviewed committed source at `562d96a6ac9502d077bf0d842d6b33b9302dd8cd`. There is no uncommitted change under `raptor-port/src`. The working tree currently contains documentation changes in `HANDOFF.md`, `OUTSTANDING.md`, the accounts plan, and an untracked round-three report; I made no edits.

---

## Findings, ranked

### 1. High — an already-open account keeps its old authority after it is switched off, demoted, or relinked

**Setup**

Open two tabs in the same browser:

- Tab A signs in as an admin.
- Tab B signs in as another admin or member.
- Tab A opens **Admin → Users**.

**Action**

In Tab A, switch Tab B’s account off, demote it, or link it to a different person. In Tab B, use a control that was already visible—for example, sign a schedule as the formerly-admin account or file/edit something under the old person.

**Expected**

The changed account must immediately lose the old authority. A switched-off account should reach the switched-off screen; a demoted account should lose admin controls; a relinked account must stop acting as the previous person.

**What the code would do**

The account write updates the writing tab’s `ACCOUNTS_LIST` and persistent setting, but there is no `storage` listener or other incoming-account path. The other tab retains the session snapshot in [`auth.ts`](/C:/Users/User/projects/Raptor/raptor-port/src/state/auth.ts:18). Every later command derives its role, account and person from that stale snapshot in [`actor.ts`](/C:/Users/User/projects/Raptor/raptor-port/src/command/actor.ts:26).

[`updateAccount()`](/C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.ts:217) therefore changes the account record without invalidating another live page that is using it. The other page can continue writing with the old role and `pid` indefinitely.

This affects newly performed account changes, so D56 does not exclude it.

**Exact fix**

1. Add an incoming-change path to the browser storage layer for `raptor:settings/accounts`, `accessreqs`, and `guestview`. It must update the whiteboard without echoing the same change back through the postman.
2. After an incoming accounts change, call `accountsLoad()` and revalidate the current `SESSION.user`.
3. If the account is missing or off, pass the session through `resetSession()` into the off state.
4. If its role, name or `pid` changed, rebuild the session from the current account and pass it through `resetSession()` so ME, Leave War, Tracker, undo and visible doors all change together.
5. Add a fail-closed current-account check before `cmdAuthorize` accepts a user command; a session whose account no longer exists or no longer matches its current role/person must not write.
6. Add a two-page Playwright test: sign in separately in two pages sharing one browser context; switch off/demote/relink one account; prove its stale visible button cannot write and its whole tree changes.
7. Include the same test for an admin demotion, because that is the highest-consequence stale session.

---

### 2. Major — `sched.mutate` is member-authorized, and authorization starts after the mutation

**Setup**

Sign in as a member. Reach any overlooked or future call site which changes the schedule directly and finishes with `afterSchedMutate()`.

There is no currently identified member-visible scheduler-edit gesture; the present render doors appear admin-only. This scenario tests the promised second guard when a door is missing.

**Action**

The call site mutates `DAYS` or another schedule structure, then calls `afterSchedMutate()`.

**Expected**

A member’s top-level schedule edit must be refused before anything changes. Only a schedule projection joined to the member’s authorized own-input command may proceed.

**What the code does**

[`COMMAND_OPS`](/C:/Users/User/projects/Raptor/raptor-port/src/state/perms.ts:207) maps `sched.mutate` to the member-own Input row:

```ts
'sched.mutate': op(T.input, 'U', 'optional')
```

The member ownership invariant expressly leaves schedule records to the command type. Consequently, a member-authorized `sched.mutate` may change schedule records.

There is a second ordering problem: the board functions generally mutate first and invoke [`afterSchedMutate()`](/C:/Users/User/projects/Raptor/raptor-port/src/state/view.ts:1119) afterwards. The hook in [`registerSchedCommandLayer()`](/C:/Users/User/projects/Raptor/raptor-port/src/state/sched-commit.ts:598) opens the command only for the epilogue. Merely changing `sched.mutate` to admin-only would therefore refuse after the live mutation has already happened.

The current working-tree plan and `OUTSTANDING.md` already describe this gap, but HEAD still contains it.

**Exact fix**

1. Change `sched.mutate` in `perms.ts` to the Schedule row, `U`, admin-only.
2. Introduce one scheduler mutation wrapper that opens the command **before** running the mutation and includes `rawSchedEpilogue()` inside that command.
3. Convert every production site that currently does “mutate, then `afterSchedMutate()`”—notably `ui/board.ts`, `ui/drag.ts`, `state/view.ts::placeArmed`, template/draft operations and OIL controls—to execute the mutation inside that wrapper.
4. Keep a member’s own-input landing inside the already-authorized `inputs.write`/`inputs.batch` command. Its scheduler step should be a joined child, not a separately authorized top-level schedule command.
5. Make the source scan reject production calls to raw scheduler mutation primitives or `afterSchedMutate()` outside the approved wrapper.
6. Test armed placement, field edit, add/delete, drag, draft restore and OIL controls as a member; assert both the returned refusal and an unchanged live model.
7. Add the positive counter-test: a member’s own input still lands its permitted projection on the working copy in the same outer command.

---

### 3. Moderate — Tracker carries the previous person’s course and student selection

**Setup**

An admin opens **Tracker**, changes course, and selects a student. The admin signs out; a member signs in on the same tab and opens Tracker.

**Expected**

The new login should start with a neutral/default Tracker selection or its own account-scoped preference. It must not reopen the outgoing person’s selected course and student.

**What the code would do**

[`endSession()`](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:90) clears undo, dialogs, modes and search, but not `course` or `active`. Those live module bindings are declared together at approximately line 628.

Tracker boots only once. On the next mount, `core.ready` is already true, so the React component redraws the intact module state. The existing F10 test at [`retest.test.tsx`](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/retest.test.tsx:173) checks undo, modes and windows, but not either selection.

The persistence keys are also browser-wide: `lastCourse` and `lastCrew:<course>`. The latter is described in source as “Your own last pick” but has no account/person component.

All members and admins are permitted to read Tracker, so this is context leakage and wrong-person operation risk rather than an authorization disclosure.

**Exact fix**

1. Extend the lightweight Tracker session seam in `tracker/role.js` to carry a session/account key, not only an anonymous “end” signal.
2. In `core.js`, reset `course` and `active` at session end and mark the next mount as needing a selection load.
3. Either start every login at the first course/student, or namespace `lastCourse` and `lastCrew` by the signed-in account/person. Do not retain the outgoing account’s unscoped values.
4. Before drawing the remounted board, load the incoming session’s/default course and roster selection.
5. Extend F10 to select a non-default course and student, cross a logout/login boundary, and assert neither is inherited.
6. Add a same-account re-login case if account-scoped preferences are intentionally retained.

---

### 4. Low — scheduler board layout and roster day cross the session boundary

#### Board layout

`SBWIDE` is module state in [`board.ts`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/board.ts:1762). Its comment promises survival only while closing and reopening within one session, but `resetSession()` never clears it. `openScheduler()` resets `SBWOPEN`, not `SBWIDE`.

**Visible result:** one person taps **Desktop layout**, signs out, and the next person’s board opens wide with the button offering **Phone layout**.

#### Roster-palette day

`ROSDAY` is the day read by [`paletteDay()`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/palette-html.ts:12). Its reset registry entry is week-only in [`view.ts`](/C:/Users/User/projects/Raptor/raptor-port/src/state/view.ts:826). The reset test expressly pins that a session reset leaves it standing.

**Visible result:** an admin leaves the edit palette on a later day; the next admin initially gets that selected day when opening Edit Schedule.

**Exact fix**

1. Add a board-session reset for `SBWIDE` as well as the already-reset board dialog state. Because of the state/UI layering, expose it through the existing board hook or a dedicated session-reset hook.
2. Give `ROSDAY` both `session` and `week` scopes.
3. Add a session test that dirties `SBWIDE` and `ROSDAY`, calls logout/login through `resetSession`, opens the relevant surface, and asserts the standard layout/day.
4. Keep `SBWIDE` surviving an ordinary close/reopen within the same login, as its current contract states.

---

## Coverage map

I started with the least-shared surfaces.

| Surface and qualifying objects | Production sign and working gesture | Writer, reader, downstream consumer and order | Result |
|---|---|---|---|
| Tracker courses, syllabi, enrolments, attempts, layouts | **Tracker** tab; choose course/student, mark balls, edit chart, File menu | `trk.*` commands → Tracker store → charts, reports and export; admin/member equal, guest never mounts it | Authority sound; session selection finding 3 |
| Leave War, bids, ledger, openings, balances, profiles | **Leave War** tab; own-row bid for member, management doors for admin | Leave War’s writer checks plus `lw.*` command mapping and the hard changed-record invariant; session mirrors role and viewer | Sound |
| Guest issued schedule | “Waiting for access — view only”; week arrows and Sign out | Separate `GuestApp` → issued-day renderer only; no Shell, Tracker, Leave War, Inputs, documents or overlays | Sound |
| Scheduler working copy and board | **Edit Schedule**, day board, crew palette, template and OIL controls | Admin-visible doors → named scheduler commands or generic epilogue → schedule/undo/persistence | Visible doors sound; generic backstop finding 2; reset finding 4 |
| Inputs, attachments and calendar | **Inputs** page; add/edit/delete, calendar drag, document button | Member-own/admin gate at door and command; downstream schedule and Leave War projections | Sound |
| Medical inputs | Type, remarks and document for members/admins; “Unavailable” plus time for guest | `mayReadMedicalOf` → HTML and document viewer | Sound under D211 |
| Quals Person and QualMark rows | **Quals → Edit qualifications**; controls only on the member’s own row | Closed `updatePersonField` operations → people command with owner metadata → roster, sign-off eligibility and displays | Sound |
| User accounts | **Admin → Users**; add, edit, role, puck and Switch off | Account intent → accounts setting → sign-in/session | Single-tab lifecycle sound; cross-tab revocation finding 1 |
| Access requests and guest switch | Request access, waiting screen, Approve/Decline, guest switch | Pending-own request; admin approval changes account and request in one command | Sound |
| Sign-in renderer selection | Sign-in → request/wait/off/guest/full application | `signIn` → `sessionFor` → `resetSession` → whole-tree switch | Sound for a fresh sign-in |
| Permission matrix and command actor | Mostly invisible; determines which visible controls work and whether their commands commit | `perms.ts` matrix → `cmdAuthorize`; ownership invariant inspects actual changed records | Centralized for current types, except finding 2’s overly broad mapping |
| “Who” records | History, Help reports, Leave War approver and Tracker stamps | Callsign display through `whoami`; edit log/report also keep `pid`; consumers resolve live names where planned | Sound |
| Undo and redo | Toolbar Undo/Redo | Actor/person ownership check plus `endUndoSession` on sign-in and sign-out | Sound |
| Overlays and transient doors | Editors, documents, history, templates, drawer, board dialogs and toast | `POPS_RESET`, `VIEW_RESET`, board-close hook and toast reset | Sound except selections in findings 3–4 |
| Persistence and rollback | Reload retains accounts, requests and guest switch | Three settings keys enlisted in one settings snapshot; rollback restores all keys and reruns `accountsLoad` | Sound |
| Probe and initial-load performance | No production-visible gesture; developer bridge on loopback | `main.tsx` installs bridge only for localhost; Tracker session seam does not load the Tracker chunk | Sound |

---

## Explicit negatives

I checked the following and found them sound:

- **Account uniqueness:** duplicate sign-in names and duplicate `pid` links are refused.
- **Last-admin protection:** an admin cannot edit their own account, and an update cannot leave no enabled usable admin.
- **Load fallback:** a malformed/no-admin account list restores the seeded admin while removing collisions with its id, name or person.
- **Request claiming:** the typed request callsign never claims a person; the approving admin chooses the link.
- **Atomic account intents:** approval changes `accounts` and `accessreqs` inside one command; rollback restores all three account-related settings consistently.
- **Boot persistence:** `initStore()` calls `accountsLoad()`.
- **Current settings inventory:** every current `store.set` key is in the guarded settings inventory. I found no present unknown-key writer using the raw fallback.
- **Quals:** member-own is enforced at renderer, write function, command owner and post-change invariant; callsign changes use the unique rename path.
- **Inputs:** member-own applies to create, edit, delete, calendar movement, remarks and attachments.
- **Guest:** no working-copy picker, warning list, day-information door, document viewer, Tracker, Leave War, Inputs, Help or Admin tree is mounted.
- **Guest medical:** the renderer replaces medical type/remarks with “Unavailable”; documents have no guest route.
- **Guest/pending/off writes:** the command gate refuses them, except a pending principal’s own access request.
- **Leave War:** member-own bids and admin management remain checked in its own writer layer as well as the central command layer.
- **Undo/redo:** identity is checked, another person’s entry is refused, and both lists clear on session change.
- **Overlays:** input editor, document, history, templates, drawer, board and toast have session-reset paths.
- **Identity stability:** edit-log rows and reports keep the person id where the plan requires it; callsign rename does not move ownership.
- **Seed sign-ins:** `ad/a` and `us/us` remain; the prototype password limitation was treated as explicitly out of scope.
- **Probe bridge:** installed only on loopback hosts; its presence on the developer PC is preserved.
- **Sign-in weight:** the session boundary imports only the lightweight Tracker role seam, not the Tracker engine.
- **D56:** I did not report loader migration or already-stored-demo-only effects.

---

## Verification status

I attempted a focused Vitest run, but no tests executed:

- PowerShell blocked the `npx` script under the machine’s execution policy.
- Running through `npm.cmd` reached Vitest, but every selected suite failed before collection because Vitest could not create its temporary directory under `%LOCALAPPDATA%\Temp` (`EPERM`) in this read-only environment.

Therefore this report does **not** claim a fresh green test run.

The existing evidence sheet records walk 1 as 38/38, walk 2 as 40/40, and the Leave War e2e run as 318/318. I used those as prior evidence only. Its §7 gate section and §8 code-read section are still placeholders, so the sheet itself is not yet a completed FULL-check record.

Prior memory was used only to preserve the distinction between focused green evidence and actual clearance; every repository fact in this report was rechecked against the current checkout.

