# Final code read — `[ONE-DOOR]` — Astra (gpt-5.6-sol, high), 27 Sep 26

Brief: `docs/superpowers/briefs/2026-09-27-one-door-final-read.md`. Blind to Fable's read. Verbatim report; the dispositions are in the evidence sheet `docs/handpass/2026-09-27-one-door.md` §8.

# Findings

## 1. High — Deleted or demoted users retain authorization through a stale session

**Code:** [accounts.ts:415](/C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.ts:415), [person-delete.ts:217](/C:/Users/User/projects/Raptor/raptor-port/src/state/person-delete.ts:217), [actor.ts:26](/C:/Users/User/projects/Raptor/raptor-port/src/command/actor.ts:26), [perms.ts:334](/C:/Users/User/projects/Raptor/raptor-port/src/perms.ts:334), [App.tsx:23](/C:/Users/User/projects/Raptor/raptor-port/src/ui/App.tsx:23)

`sessionLapsed()` treats a missing account as valid:

```ts
const a = accountById(SESSION.user)
if (!a) return false
```

It also never compares the live account role with the session role. Command authorization then derives the actor from `SESSION.role` and `ME`, not from the current account.

### Concrete failures

1. Admin B signs in.
2. Admin A changes B’s account from Admin to Member.
3. B’s person remains active, so `sessionLapsed()` returns false.
4. B’s session still says Admin.
5. `deriveActor()` and the permission gate continue authorizing B as Admin, including direct Archive, Restore, Delete, and scheduling commands.

A second route:

1. A signed-in user is deleted, including by a due posting outcome.
2. Deletion removes the user’s account.
3. `sessionLapsed()` finds no account and explicitly returns false.
4. The old Member or Admin session remains usable.
5. Commands continue trusting its stale role and person identity. The deletion message asking the user to sign out does not revoke authority.

The `App` effect is also only post-render cleanup; it is not a synchronous command authorization boundary.

**Branch/main classification:** Present on `origin/main` as well. The branch adds useful archive/suspension expiry, but still does not revoke missing-account or role-changed sessions.

### Exact fix

1. Add one canonical live-session validator that resolves `SESSION.user` to the current account and person.
2. For ordinary Admin/Member sessions, reject the session when:
   - the account is missing or disabled;
   - the person is missing, special, archived, or deleted;
   - `SESSION.pid !== account.pid`;
   - the stored account role is incompatible with the session’s authority.
3. Preserve D292 deliberately: an Admin account may use Member view only when the live account is still Admin and `SESSION.acct === "admin"`.
4. Use this validator synchronously in `deriveActor()` or immediately before every command permission check. An invalid session must derive an `off`/unauthorized actor.
5. Keep the `App` handling for navigation and cleanup, but do not make it the security control.
6. Give test/system actors an explicit probe flag or separate constructor; do not exempt every session whose account is missing.
7. Add tests for:
   - a second admin demoting the signed-in admin;
   - deletion of the signed-in user by a due posting;
   - a normal missing-account session;
   - D292 Admin-as-Member remaining valid;
   - explicitly marked test/system actors remaining usable.

## 2. Medium — Renaming an archived person does not update their retained Leave War identity

**Code:** [UsersPanel.tsx:338](/C:/Users/User/projects/Raptor/raptor-port/src/ui/UsersPanel.tsx:338), [quals-write.ts:46](/C:/Users/User/projects/Raptor/raptor-port/src/state/quals-write.ts:46), [raptorRoster.ts:41](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/raptorRoster.ts:41), [sync.ts:1331](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:1331), [store.ts:1836](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts:1836), [Matrix.tsx:453](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:453), [OilTracker.tsx:650](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/OilTracker.tsx:650)

### Concrete failure

1. Archive a person who has past or posting data, so Leave War retains the row.
2. In Admin → Users → Archived, change the callsign from `Hex` to `Hex 2`.
3. Press **Save name** without restoring the person.
4. Admin/Users and the scheduler’s `PEOPLE` data show `Hex 2`.
5. Leave War continues showing `Hex` in the matrix and downstream posting/OIL surfaces.
6. Reload can preserve the stale name because the stored post-out record itself still contains the old identity.

Archived people are excluded from `projectPeople()`. The retained-row path then reuses the old Leave War person, described in code as frozen at its last projection. `updatePersonField()` persists only the people store, so no operation refreshes that kept Leave War identity.

This is current editable data, not a legacy/demo-only artifact covered by D56.

**Branch/main classification:** Present on `origin/main` as well. This branch moves the archived-name control to the one Admin door but does not propagate its result through the retained Leave War record.

### Exact fix

1. Extract a canonical Raptor-to-Leave-War identity mapper that can read an archived person without treating that person as active.
2. In the retained archived-person loop, overlay current canonical identity fields onto the kept row.
3. Overlay Leave War-owned history afterward—posting window, `past`, `gone`, posting fields, and Leave War edits—so a rename cannot reopen or otherwise change the stint.
4. Rewrite the corresponding stored `postOuts[id]` identity as part of the same operation; updating only `state.people` will allow reload to restore the old name.
5. Prefer routing archived **Save name** through a named atomic command spanning `peopleStore` and `lwStore`.
6. Test an archived person with history and assert that the new name appears immediately and after reinitialization in:
   - `PEOPLE`;
   - Leave War `state.people`;
   - the stored post-out record;
   - the matrix;
   - posting-sheet labels;
   - OIL tracker and figure surfaces.
7. Assert that the old name appears nowhere and that Restore-as still behaves correctly.

# Explicit negatives

- I found no second interactive Archive/Restore/Delete door. Quals no longer supplies those controls; Users is the Admin door.
- Archived rows do not expose Enable or role editing, and the account writer independently refuses to enable an archived person.
- The current Admin’s own destructive row controls are disabled.
- Members and Admin-as-Member do not receive the Admin door or its add/archive actions.
- `person.backSeen` remains self-owned; the clear action targets the signed-in person.
- Archive, Restore, and Delete use the joined transaction framework with the relevant people, settings, schedule/stash, and Leave War stores. I found no normal partial-commit path in those commands.
- Restore enables the account, writes the restored identity, opens the new stint, and removes the retained post-out state inside the transaction.
- New-person creation asks for and writes the post-in date through the joined creation flow.
- Stint readers use the full stint list. The before-first, gap, in-squadron, last-day, and posting-sheet paths are not reduced to only the latest stint.
- Stint writers validate ordering and overlap.
- Re-archiving removes a future current stint rather than retaining it as active history.
- Manning and availability consult `inSquadron`; an archived current person is not treated as presently available.
- Published-day comparison retains archived attributes for historical comparison, while issued output remains frozen.
- Archive suspension and restore re-enablement are part of their respective transactions. An existing person receiving sign-in access does not incorrectly create a new posting stint.
- Welcome-back notes are stored on the person, shown to that person, and cleared through the self-row action.
- The pre-existing `walk3/results.md` records 238 passed and 0 failed. I did not treat that focused evidence as clearance for the two uncovered seams above.
- I made no browser run, as required by the brief.
- I attempted the focused Vitest suites, but Vitest could not start any test because the read-only environment denied creation of its Windows temporary directory (`EPERM`). Therefore, this report is based on source tracing and the repository evidence, not a fresh test execution.
- I changed no file. The evidence/log changes visible during the read were concurrent builder activity and were left untouched.

# Missing roll-call rows

1. **Live session/account consistency after external account changes**
   - Second Admin demotes the currently signed-in Admin.
   - Due posting or another Admin deletes the currently signed-in user.
   - Direct privileged commands are attempted before and after the next render.
   - R20 covers archive-driven lapse, but not missing accounts or role demotion.

2. **Archived Save-name propagation**
   - Rename an archived person without restoring them.
   - Check the retained Leave War matrix row, posting-sheet labels, OIL tracker/figures, stored post-out record, and reload.
   - R8 checks the control and Users result, but not these downstream consumers.

Existing rows also still lack recorded live proof for R23, the archived-crowd portion of R34, R37–R40, R46, two-browser behavior, and a genuine second-Admin session. Those are proof gaps rather than newly missing specifications.

