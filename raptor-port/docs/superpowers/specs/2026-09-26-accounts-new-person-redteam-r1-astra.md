1. **`account.update` omits a permission for data it deletes.**

   **What:** The proposed `CommandOp.more` mapping is incomplete. Renaming an account to a sign-in name that has a waiting request updates the `User` and deletes the `AccessRequest`, but the plan adds the second permission only to `access.approve` and `account.add`.

   **Where:** Plan §3, “The commands and who may run them”; live `state/accounts.ts`, `updateAccount`; `state/perms.ts`, `COMMAND_OPS`.

   **Failure scenario:** A request from `viper@mail` is waiting. An admin changes Hex’s sign-in name to `viper@mail`. The current writer saves the account and removes that request in one intent. The proposed permission declaration says only `User U`, so the future server translation either refuses the undeclared request deletion or permits a write that D200’s agreed list does not describe.

   **Exact fix:**

   1. Give `account.update` base operation `User U` plus `AccessRequest D`.
   2. Keep `account.add` as `User C` plus `AccessRequest D`.
   3. Keep `access.approve` as `AccessRequest D` plus `User C`.
   4. Refactor `cmdAuthorize` so it evaluates the base operation and every `more` operation before any early success return.
   5. Add a permissions test that withholds just one required operation and proves the entire command is refused with neither record changed.
   6. Add the conditional request deletion to the `User`/`AccessRequest` notes in data-model §11.

2. **Three “agent’s calls” are product decisions that require the owner’s ruling before build.**

   **What:** The plan treats material user behaviour and schema choices as non-blocking implementation choices:

   - whether “seen” is global or separately remembered for every admin;
   - whether access requests outrank bug reports and OIL questions when the bell is tapped;
   - whether a person using a name instead of a callsign is limited to 14 characters.

   The last choice can reject ordinary names and directly affects D219’s purpose. The first changes the saved `AccessRequest` schema and future database behaviour. The second changes which urgent notification the user sees.

   **Where:** Plan §4 and “The agent’s calls,” items 4 and 6.

   **Failure scenario:** Two admins receive one request. One opens Users. Under the proposed interpretation, the second admin remains alerted; under a global interpretation, the bell goes out for both. Separately, a ground crew member with a displayed name longer than 14 characters cannot be created even though D219 introduced the field specifically for people without callsigns. If a bug report and access request coexist, the plan silently chooses which one the bell opens.

   **Exact fix:**

   1. Put three explicit questions to the owner before implementation.
   2. Recommend per-admin `seenBy`, access-request-first bell order, and either a longer displayed-name limit or a separately approved clipping rule.
   3. Record his answers as rulings.
   4. Update the record shape, behaviour register, mock/design note, tests and walk matrix to match those answers.
   5. Do not describe these as “his to correct later”; they materially change the result and must be settled first.

3. **The people-only `person.add` command has no defined command-layer doorway.**

   **What:** The plan defines a new cross-store `commitPeopleSettingsIntent`, but `addRosterPerson` needs a named `person.add` command that enlists only the people store, advances `PEOPLE_BASELINE`, persists the roster and rebuilds the callsign index. The existing public helper emits `people.edit`, not `person.add`.

   **Where:** Plan §2, §3 and build steps 1–2; live `state/people-settings-commit.ts`.

   **Failure scenario:** The builder reuses `commitPeopleEdit`, so a create is recorded and authorized as `Person U`, defeating the planned `Person C` mapping. Alternatively, the builder mutates `PEOPLE` directly and forgets the baseline or persistence step; the new row appears until reload, or a later rollback restores the wrong roster.

   **Exact fix:**

   1. Add `commitPeopleIntent(type, meta, fn)` beside `commitSettingsIntent`.
   2. It must enlist `peopleStore`, run `fn`, then call the same baseline-and-persist body used by `commitPeopleEdit`.
   3. Implement `person.add` through that helper.
   4. Implement the cross-store helper through the same internal people-finalization body, not a second copy.
   5. Test that `person.add` emits one `put` in the `people` collection, has type `person.add`, updates `ID_BY_CS`, advances the baseline and survives reload.

4. **`ADMINOPEN` is described as a one-shot intent consumed by two components.**

   **What:** The plan says the intent is “consumed ONCE by the Admin page” and also consumed by `UsersPanel`. A one-shot global cannot safely be cleared by both consumers.

   **Where:** Plan §5.3 and build steps 4–5; live `state/view.ts`, `ui/AdminPage.tsx`, `ui/UsersPanel.tsx`.

   **Failure scenario:** The Quals button sets `{cat:'users', newPerson:true}`. `AdminPage` consumes and clears it to choose Users and drill in on phone. `UsersPanel` then sees nothing, leaving “On the roster” selected without scrolling or focusing. Reversing the order can make the panel react while the phone remains on the category rail.

   **Exact fix:**

   1. Make `AdminPage` the sole consumer through a `takeAdminOpen()` function.
   2. Capture the complete intent before clearing it.
   3. Set the Users category and phone `drilled` state from that captured value.
   4. Pass `newPerson` to `UsersPanel` as a prop or monotonically increasing token.
   5. Let `UsersPanel` select New person, scroll and focus in an effect keyed to that token.
   6. Test Quals → Users on desktop and phone, bell → waiting list on both, repeated opens, and session reset clearing a stale intent.

5. **The shared add validation is incomplete and one collision message is wrong.**

   **What:** The planned records say initials are limited to 12 characters, but `newPersonProblem` checks only that initials are present. It also treats every archived match as restorable even though the `ALL` and `ALL AVAIL` sentinels are archived and cannot be restored on Quals. A refusal thrown by `putNewPerson` would currently be reduced to “That did not save,” not its actual reason.

   **Where:** Plan §1–§2 and §6; live `engine/people.ts`, `state/accounts.ts`, `command/commit.ts`.

   **Failure scenario:** A hand-made call submits 13-character initials and creates a person outside the old form’s limit, or silently truncates the request. Adding `ALL` produces “restore them on the Quals page,” but no such restorable person exists. If the inside-command recheck refuses, rollback works but the user receives a generic save failure despite the plan promising that every refusal says why.

   **Exact fix:**

   1. Define one `MAX_INITIALS = 12` beside the shared new-person contract.
   2. Reject overlong initials before any slicing, with an exact message.
   3. Apply the same validation to request, add and approve state functions; UI `maxLength` is only a convenience.
   4. Keep defensive loader truncation only for old demo records.
   5. When `nameToId` resolves, inspect the person: only a real, non-special archived person gets the restore instruction; sentinels and bare-id collisions get the generic taken message.
   6. Throw `CmdRefused(problem)` for an inside-command refusal and preserve that message through the intent wrapper.
   7. Test both UI forms and direct state calls for blank, overlong, archived, sentinel and bare-id collisions.

6. **The bell can treat a probe-forged role as an admin and store a non-account identity.**

   **What:** `accessAlert()` is planned around `isAdmin()` while `unseenRequests()` and `markRequestsSeen()` blindly use `SESSION.user`. The localhost probe can switch a pending, guest or member session to effective role `admin` without creating an admin account.

   **Where:** Plan §4 and roll-call row 23; live `state/auth.ts` (`setEffectiveRole`), `state/accounts.ts`, `state/perms.ts`.

   **Failure scenario:** A pending principal is switched to admin through `window.raptorRole`. The bell lights, and opening Users adds `principal:viper@mail` to `seenBy`. That is not an admin account and can later suppress the wrong notification. The same plan also overstates switched-off protection: a fresh switched-off sign-in is blocked, but an already-open admin session is not revoked across tabs in today’s prototype—a known database-step limitation.

   **Exact fix:**

   1. Add a single `currentEnabledAdminAccountId()` read that resolves `SESSION.user` to an existing, enabled admin account with a valid person.
   2. Make `accessAlert`, `unseenRequests` and `markRequestsSeen` return false/no-op without that ID.
   3. Use a real admin sign-in, not the role bridge, in bell tests and walks.
   4. Add cases for two admins, reload, member, guest, pending, switched-off fresh sign-in, probe-admin-with-no-account, request arrival while Users is open, and approve/decline before viewing.
   5. State the existing-session revocation limitation honestly instead of claiming this build fixes it; full cross-tab/device revocation remains the database/server responsibility already documented.

7. **The atomicity design is sound, but the plan’s proof is too narrow.**

   **What:** `command/commit.ts` does make an enlisted people/settings mutation atomic in memory and on the whiteboard: refusal or reducer throw restores both stores, `ID_BY_CS` and the people baseline. The whiteboard emits one storage group. A backend failure does not roll the UI back; the postman keeps the whole group and retries it, with the browser journal recovering partial application. The proposed tests cover only “forced failure of the account half.”

   **Where:** Plan §3 and build step 3; live `command/commit.ts`, `storage/whiteboard.ts`, `storage/postman.ts`, `storage/browser.ts`.

   **Failure scenario:** A future implementation forgets to enlist settings, advances the people baseline outside the transaction, or emits the two records as separate whiteboard groups. The one planned test can still pass while reload leaves an account without its person. A test that expects backend failure to roll back would also encode the wrong storage contract.

   **Exact fix:**

   1. Test a `putNewPerson` refusal and confirm no person, account, request change, index entry or envelope.
   2. Test a throw after the person mutation but before the account write.
   3. Test a throw after both writes but before completion.
   4. Test hard-invariant refusal after both stores changed.
   5. Through the real whiteboard wiring, assert one group contains `people/all`, `settings/accounts` and, where applicable, `settings/accessreqs`.
   6. Fail the backend `putMany`, assert the live whiteboard still contains the complete person/account world, then assert retry or journal replay persists the complete group.
   7. Spy on Leave War and Tracker notification paths and prove neither observes a refused or thrown half-person.
   8. Document explicitly: reducer failure rolls back; backend failure retains and retries the complete acknowledged command.

8. **The D201 wording/document sweep is incomplete.**

   **What:** The visible primary labels are covered, but several affected representations still say only “callsign” or describe the superseded two-field model.

   **Where:** Plan §5 and §8; live `ui/UsersPanel.tsx`, `ui/QualsPage.tsx`, `docs/handover-dataverse.md`.

   **Failure scenario:** A sighted user sees “Callsign/Name,” but a screen reader hears “The callsign this account belongs to” because `PuckSelect`’s `aria-label` overrides the visible label. Quals exports a CSV headed “Callsign” while the table says “Callsign/Name.” Quals edit inputs remain announced as “Callsign for…”. The database handover still says the admin creates a `Person` with separate “callsign, name” values.

   **Exact fix:**

   1. Extend the wording roll-call to accessible names, placeholders, validation messages, exports and handover prose.
   2. Change `PuckSelect`’s `aria-label` and empty option consistently.
   3. Change the Quals callsign-edit accessible labels and CSV heading.
   4. Change new duplicate/picker refusals to “callsign/name” where they address this field.
   5. Correct the handover’s separate “callsign, name” wording and clarify that the sign-in principal remains; only the typed full-name request field is removed.
   6. Search for the subject strings after editing, then render/test every intended exception.
   7. Add a test for the CSV heading and accessible names, not only visible text.

9. **The Tracker roll-call promises the wrong result for personnel.**

   **What:** Roll-call row 19 says every new person appears in Tracker’s “+ Add” roster list. The live bridge deliberately excludes ground personnel.

   **Where:** Plan roll-call row 19; live `tracker/peoplewire.ts`, `projectForTracker`.

   **Failure scenario:** Add a roster-only “Personnel (ground crew)” person. The plan’s walk expects them in Tracker and reports a defect, or the builder changes Tracker to include them, breaking its aircrew/course contract.

   **Exact fix:**

   1. Split the row into aircrew and personnel cases.
   2. Require a new pilot or WSO to appear in Tracker “+ Add.”
   3. Require ground personnel to remain absent, with the existing reason recorded.
   4. Keep the separate Leave War expectation: personnel appear there but do not count as aircrew manning.
   5. Update the migrated Tracker walk script to exercise both outcomes.

## Explicit negatives

- I checked all named rulings. Apart from the unresolved product calls above, the plan correctly carries D214, D217, D219, D220, D222, D224, D149 and D218.
- I found no second production writer that creates a Raptor `Person`: today the only such creation is the Quals form. Tracker can create an unlinked Tracker student, not a Raptor roster person.
- The planned shared `nameToId` guard correctly preserves the PID-01 callsign-or-internal-id collision rule.
- A member’s own Quals editing remains intact, and only an admin can rename the callsign/name.
- Blank sign-in → roster-only person, with no Role field, is a sound consequence of D217.
- Requiring initials follows the owner’s wording. Starting seat and CAT at “Pick…” is also consistent with the standing fail-closed rule; I do not treat that as a finding.
- The proposed `more` mechanism is a sound way to express conjunctions of permissions once `account.update` is included and the early-return logic is fixed.
- A properly implemented people/settings command does not expose a half-person to Leave War, Tracker, the callsign index or ordinary React subscribers. Those projections run after successful notification.
- Per-admin `seenBy` is technically viable across reloads and multiple sequential admin sign-ins; the issue is that the owner must choose that semantic and the writer must validate a real admin-account ID.
- Approving or declining a request before it is seen correctly removes the request and therefore removes its alert; no separate pruning is needed.
- I found no migration or backward-compatibility finding. Old access-request records are demo data, will be cleared before the database step, and the proposed tolerant loader is sufficient under D56.
- The Quals button, member absence of that button, phone drill-in requirement, account-editor label and admin-only page/write gates are all recognized by the plan.
- I found no reason to add undo to this build; people/settings undo remains the separately filed work.

## Verdict

**APPROVE WITH CHANGES.**

The plan does not need wholesale rewriting, but findings 1–8 must be folded in before implementation. The owner must answer the three product questions in finding 2 before the build starts. The largest technical correction is the missing `AccessRequest D` permission on `account.update`; the largest execution risks are the undefined people-only command seam, the double-consumed navigation intent, and insufficient atomicity/bell scenario coverage.

