# Astra's blind read of the second round of fixes — multi-squadron batch 1's full check (18 Nov 26)

Head: Astra (`codex exec --skip-git-repo-check -m gpt-6-astra -c model_reasoning_effort=high -s read-only`), in an exported copy of `4934adaa4` (app code = the second round of fixes, on `34a07036a`) at `scratchpad/fixread2/copy`, the walk's results, the evidence sheet below its job-5 heading, the walk ledger's 18 Nov rows, the night's walk and read lines of HANDOFF, every walk script and picture of this job and every earlier reader's report (the first fix read's Astra, Opus and Opus-7 files included) removed from the copy; brief `2026-11-18-multi-sqn-b1-fixread2-brief.md` (FIX2-READ-BRIEF.md) as its prompt; first of the three readers, blind to the Opus and security reads (both started after this one ended). Started Wed 18 Nov 26 09:00:07 MPST, finished 09:16:16 (exit 0). Read-only sandbox: its one unit-test attempt ran zero tests (the sandbox refused a temporary folder), so it ran isolated in-memory checks of the permission functions and the account reader and named its proof inputs for the host. Saved as it came; full log `scratchpad/fixread2/astra.log`.

---

**The second round is not complete.** I found four substantial gaps, one remaining history error, and two wording gaps. Two substantial gaps require forged commands; two are reachable through ordinary controls.

This was a blind, read-only review. I changed no files and read no other reader’s report or running-app walk. The unit runner failed before executing tests because it could not create its temporary directory. I did run isolated, in-memory checks of the actual permission functions and account reader; those results are distinguished below from application tests still owed.

1. **High — A person-only command bypasses both master protection and the last-admin lock.**

   **Input:** Start with the existing unit-test fixture. Sign in as Hunter (`ad2`), make an ordinary account edit to store the account list, then submit:

   ```ts
   updateAccount('acus', { name: 'ranger2' })

   const r = commitPeopleIntent('person.delete', null, () => {
     Object.assign(PEOPLE.stiff, {
       deleted: true,
       deletedFrom: todayIso(),
       archived: true,
       archivedBy: 'del',
     })
   })
   ```

   Expected: refusal and Saber unchanged. The permission checks accept this change. After the account loader runs, Saber's deleted person also causes his stored account to be omitted.

   Repeat as Saber, targeting `kes9`: the same path deletes 149’s only home admin without changing an account row. This is a forged-command finding, not a claim that the normal Delete button skips its preflight.

   **Cause:** [perms.ts:1409](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/fixread2/copy/raptor-port/src/state/perms.ts:1409) runs the last-admin comparison only when account rows changed. Master protection at line 1275 likewise examines account changes, not deletion of the person behind the master account. The ordinary person ownership check merely establishes that the actor administers that person’s squadron.

   There is also a home-only variant: Saber can call `setHome('kes9', 'u142')`, leaving 149 without a home admin tomorrow. No account change invokes the lock, and its present implementation counts homes only today.

   **Fix:** Build combined before/after views of people, accounts and homes. Reject deletion of a master’s person independently of whether an account row changed. Run the last-admin invariant for changes to any of those three record families, including each future home transition affected by the command.

   **Failing tests:** Assert refusal, unchanged person/account, and unchanged future home for these three inputs.

   **Evidence and origin:** The isolated source checks returned no violation for both person-only deletions. The application-level assertions remain owed. These are pre-existing omissions that fixes 1 and 6 leave open.

2. **High — The “whole account list” comparison does not compare what the loader actually accepts.**

   **Input:** On a fresh store, sign in as Hunter and submit:

   ```ts
   const r = commitSettingsIntent('account.update', null, () => {
     for (const a of seedAccounts()) {
       store.set(`account:${a.id}`,
         a.id === 'acad2' ? { ...a, name: 'ad9' } : a)
     }
   })
   accountsLoad()
   ```

   Expected: refusal; Kestrel retains his account and 149 retains its admin.

   The gate sees Hunter’s account renamed and Kestrel’s row unchanged. The loader sorts the accounts, keeps `acad2` first, and drops `acad9` because both now have the sign-in name `ad9`. Kestrel’s account disappears from the loaded list.

   **Cause:** [perms.ts:1256](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/fixread2/copy/raptor-port/src/state/perms.ts:1256) compares raw stored images. [accounts.ts:165](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/fixread2/copy/raptor-port/src/state/accounts.ts:165) additionally normalizes names, rejects invalid rows, deduplicates IDs, names and people, and excludes deleted people. The gate counts accounts that sign-in will not load.

   **Fix:** Share one candidate-account interpretation between loading and validation, supplied with the appropriate before/after people. Reject invalid or colliding account writes explicitly; then apply cross-squadron, master and last-admin checks to the effective lists. Keep the demo repair policy explicit rather than silently treating raw rows as accepted accounts.

   **Failing test:** The command above must return `ok: false`; after reload, `accountById('acad9')` must still exist. Repeat with an already-stored list, normalized-name collisions, duplicate people and reordered rows.

   **Evidence and origin:** The isolated permission functions accepted this input. Executing the actual account reader dropped `acad9`. The loader mismatch predates this round; fixes 5 and 6 still rely on it.

3. **High — The master’s cross-squadron Archive, Restore and Delete still use the loaded Leave War world.**

   **Ordinary-control setup:** As a 149 admin, give Osprey a leave or OIL record before today. Sign out, sign in as Saber, and use Admin → Users to archive Osprey.

   Expected: Osprey is archived, his sign-in suspended, and **149’s** stint closes yesterday while his earlier months remain visible.

   Instead, Archive changes the global person and account but asks **142’s loaded war** to close the stint. It finds no Osprey and silently does nothing. When 149’s war is loaded again, the archived person is excluded from its projection and has no closed window to preserve his historical row.

   A separate, simpler reproduction is to archive Osprey correctly while signed into 149, then sign in as Saber and press **Restore** or **Restore as**. The master is authorized, but restoring fails with “That did not save” because the loaded 142 world cannot supply his war identity.

   **Cause:** [sync.ts:2785](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/fixread2/copy/raptor-port/src/leavewar/sync.ts:2785) obtains the restore identity from the current world. Archive does the same at lines 2865–2882; Delete’s war half at lines 2665–2667 also operates on that world. The newly squadron-filtered projection cannot supply another squadron’s person.

   **Fix:** Resolve the subject’s squadron and enlist that squadron’s war records in the same transaction as the person/account change. Apply the same routing to Archive, Restore, Restore as and Delete. Preserve the viewer’s own Leave War rather than changing it as a workaround.

   **Failing tests:** Verify 149’s closed historical window after master Archive/Delete; verify successful master Restore/Restore as and the requested new stint in 149. Assert that 142’s war remains unchanged.

   **Origin:** Introduced by this branch’s squadron-specific war projection before the second-round fixes. Fix 10 improves the permission words but does not repair the authorized master’s operation.

4. **High — Adding a 149 person silently loses the requested post-in date.**

   **Ordinary-control input:** Sign in as Kestrel. In Admin → Users, add a new pilot with a post-in date of **1 December 2026**. Repeat with a blank sign-in, and through approving a request as **New person**.

   Expected: access may begin immediately, but the Leave War counts him from 1 December and his Users row shows the pending arrival.

   The date is skipped. Once his home is written and the roster reprojects, he appears without the requested joining boundary.

   **Cause:** All three writers call the war hook **before** assigning the new person’s home:

   - [accounts.ts:754](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/fixread2/copy/raptor-port/src/state/accounts.ts:754), also lines 771–775.
   - [roster-add.ts:156](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/fixread2/copy/raptor-port/src/state/roster-add.ts:156).

   At that moment the demo fallback makes the person 142’s. The 149 projection excludes him, and `postInNewPerson` at `sync.ts:2902` silently returns when it finds no identity.

   **Fix:** Assign the home immediately after creating the person, before invoking the war hook, in all three writers. Make failure to obtain the required war identity refuse the whole add rather than silently discard the date.

   **Failing test input:**

   ```ts
   addPersonAndAccount(
     'join149',
     { cs: 'FixJoin149', ini: 'FJ', seat: 'FCP', cat: 'D' },
     'main',
     '2026-12-01'
   )
   ```

   Find the new person and assert `getState().postOuts[pid]?.from === '2026-12-01'`, with no counting before that date. Repeat for roster-only add and request approval.

   **Origin:** A branch regression predating fix 2, exposed by the new squadron filter. It affects newly created data.

5. **Medium — Undo and Redo can still file a person’s history in a different squadron from the original change.**

   **Exact sequence:** Freeze the date at 18 November. Sign in as Saber; call `setHome('osp9', 'u142')`, effective tomorrow. Change Osprey’s CAT while he is still 149’s. Keep the session open, advance the clock to 19 November, then Undo and Redo that CAT change.

   Expected under promise 8: both reversal lines remain in 149’s history, beside the original change. The new code chooses Osprey’s **current** home, 142.

   **Cause:** [changelines.ts:643](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/fixread2/copy/raptor-port/src/state/changelines.ts:643) recomputes the home when reversing instead of retaining the original history destination.

   **Fix:** Capture the history squadron when the original change is recorded and retain it with the Undo entry. Use that same destination for Undo and Redo.

   **Failing test:** Extend the existing master/Osprey history test with the dated home change and midnight boundary. Assert successful reversal and `u149` on both reversal lines.

   **Origin:** The earlier history misfiling is only partially corrected; this date-transition case remains. This does not require building the deferred transfer screen.

6. **Low — Admin → Users does not always give the master refusal first.**

   **Input:** Sign in as Kestrel and attempt to delete Saber from Users. The result is the other-squadron account refusal, not “Saber is a master admin, so he can't be deleted.” Saber attempting his own Delete receives the own-account refusal first.

   **Cause:** [accounts.ts:539](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/fixread2/copy/raptor-port/src/state/accounts.ts:539) checks own-account and other-squadron restrictions before master protection.

   **Fix/test:** Move the master check ahead of those restrictions. Assert the exact master sentence for Saber, Hunter and Kestrel attempting Saber's deletion. Deletion remains blocked today; this is the promised refusal priority, not another deletion bypass.

   **Origin:** Incomplete second-round wording fix.

7. **Low — The developer bridge’s raised admin still gets the wrong cross-squadron person refusal.**

   **Input:** Sign in as Ranger, raise the effective role to admin through the developer bridge, then call `updatePersonField('osp9', { callsign: 'Osprey2' })`.

   Expected: “He is 149's. Only an admin of 149 can change him.” Actual source path returns “You can only edit your own row.”

   **Cause:** [accounts.ts:318](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/fixread2/copy/raptor-port/src/state/accounts.ts:318) tests the stored account role, while the permission check correctly uses the effective role.

   **Fix/test:** Use the effective role to decide whether to give the admin’s squadron explanation, while retaining the stored account’s identity, home and master mark. Assert the exact sentence for the raised-role input, and retain the member’s ordinary own-row refusal.

   **Origin:** A case missed by the new helper; no unauthorized write was found here.

The ten promises therefore stand as follows. “No defect found” means source review, not a passing application test.

| Promise | Result |
|---|---|
| 1. Master cannot be deleted through any door | **Incomplete:** finding 1; refusal priority also finding 6. Normal Delete and posting preflights contain master checks. |
| 2. Retry once, then hold; other postings continue | **No concrete defect found.** I checked synchronous and queued results, rollback, splitting a refused batch, rechecking a changed posting before execution, done markers and boot reset. |
| 3. First account write omits a dropped unstored account | **No defect found** in the changed writer. |
| 4. Posting gate suspends only Overseas Sqn accounts | **No defect found** in that correction; SANS preserves the account and Delete removes its account through its separate outcome. |
| 5. Compare whole account lists as loaded | **Incomplete:** finding 2. |
| 6. Last-admin lock for every actor | **Incomplete:** findings 1 and 2. |
| 7. Judge home changes day by day | **No further date-permission defect found:** past, today, tomorrow, later reversals and same-date ties are compared. Home changes still escape the admin-continuity check in finding 1. |
| 8. Correct history squadron | Formation/person distinction looks correct. **Undo/Redo remains incomplete:** finding 5. |
| 9. Seen markers per squadron | **No defect found:** separate cursors, reload, and preservation of the old-shape cursor for existing squadrons were checked. |
| 10. Correct refusals at every door | **Incomplete:** findings 6 and 7; finding 3 also causes an authorized Restore to show the generic failure. |

The surface and action inventory used for this read was:

| Surface/object | Visible sign and working gesture expected |
|---|---|
| Due posting, including master, last admin, hidden SANS and deleted person | Posting sheets and Users row show the applicable held reason; due processing preserves a held posting and lets unrelated postings proceed. |
| Archived person | Users’ archived row offers Restore, Restore as, Save name and Delete; a permitted return opens the subject squadron’s stint and retains earlier months. |
| Live person/account | Users’ row offers role, sign-in, Suspend/Enable, Archive and Delete; Quals offers permitted person-field changes. Person, account and squadron restrictions must agree. |
| New person or access request | New person and approval forms retain the chosen post-in date; linking an existing person retains his home. |
| Home timeline | The existing command checks today, past and every future transition; no already-begun day changes, and admin continuity survives each transition. |
| Undo/Redo | Only the current sign-in’s own eligible changes reverse; the combined candidate passes the same guards and history is filed with the original change. |
| Changes window | Formation lines follow the schedule; person lines follow the appropriate squadron; marking one squadron seen leaves the other unread. |
| Tracker and downstream roster readers | Tracker’s offered people and deleted-person feed follow its squadron. Leave War history, availability and manning consume the correct person window. Tracker student removal is not a separate global-person deletion door. |

I checked ordinary own-squadron account renaming, role changes, suspension, the shared person-edit path, existing-person request approval, and session clearing and found no additional defect in the traced paths. I checked normal sign-out’s reload and boot’s clearing of posting retry holds and found no defect in that normal sequence. I found no separate retry-loop or double-run defect to report.

For the host, the existing single-file check I attempted was:

```text
npx vitest run src/state/units-sqn-fixread.test.ts
```

It executed **zero tests** because temporary-directory creation failed with `EPERM`. The reproduction assertions above still need full application-level execution, using that file’s account fixture and the posting tests’ initialized war fixture where required. No browser result or broad green test claim is made.

The known Inputs commit-gate hole, old-data-only cases and deferred batch work are excluded from these findings.

Rulings: none recorded; read-only review, no files changed.