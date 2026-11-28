# Final read — Astra (gpt-6-astra, Codex CLI), batch 1's second half, commit 82e5a28ce

Saved verbatim as it arrived (through chat 149's Sonnet helper, 23 Nov 26 ~05:25 MPST; high reasoning, read-only, ~11 min on an exported copy; the brief's code-location paragraph alone pointed at the copy). Links point into that copy.

Read-only review of the exported copy of **82e5a28ce**. Two findings. The tests below are written out but were not run.

1. **The older master-admin route preserves rights that should end.**

   **Steps:** Saber gives Hunter Plan of 149, calls `setMaster(Hunter, true)`, then calls `setMaster(Hunter, false)`.

   **Actual:** Both calls succeed. Hunter retains Plan of 149 after the master mark is removed. Promotion through the new Save route removes that Plan.

   **Expected:** Plan §4.5 and §16 D1′a require promotion to remove the grant rows; §15 D14 requires the save check to reject grants left on a master admin.

   **Cause:** [accounts.ts — `setMaster`](/C:/ax149q/raptor-port/src/state/accounts.ts:770) writes the master mark without removing grants. [perms.ts — `unitRowViolation`](/C:/ax149q/raptor-port/src/state/perms.ts:2910) checks for leftover grants only for `account.access`, allowing `account.master` through.

   **Fix:** Apply the same promotion operation through both routes, including grant removal and the combined last-admin check. Enforce the resulting account state independently of which command performed the promotion.

   **Failing test**, using the existing `save-access` test world and `level` helper:

   ```ts
   it('promotion never preserves hidden Plan rights', () => {
     signInAs('saber')
     expect(saveAccess(ACCT.hunter, {
       grants: { u149: 'plan' },
     })).toBeNull()

     expect(setMaster(ACCT.hunter, true).ok).toBe(true)
     expect(setMaster(ACCT.hunter, false).ok).toBe(true)

     expect(level(ACCT.hunter, 'u149')).toBe('none')
     // Today: 'admin'
   })
   ```

2. **A refused Save can still grant access; a successful combined Save needs two Undos.**

   **Steps:** Saber opens Hunter under Admin → Users, selects Plan of 149, changes the sign-in name to Ranger’s existing name (`us`), and presses Save.

   **Actual:** Plan of 149 is saved and its bell line written. The name check then rejects the duplicate name. The editor remains open with an error, despite access having changed. With a valid new name, one Undo reverses only the rename, leaving the Plan grant.

   **Expected:** Plan §4.5 says the first refusal leaves nothing committed; §0 requires one press to make one Undo step.

   **Cause:** [UsersPanel.tsx — `PersonEditor.save`](/C:/ax149q/raptor-port/src/ui/UsersPanel.tsx:370) commits `saveAccess` before calling `updateAccount` for the name. These are separate commands.

   **Fix:** Include the name in the combined save operation. Validate every requested change before committing the account, grants and notices together.

   **Failing test**, using the existing `msq-users-row` test’s `panel` helper:

   ```tsx
   it('a refused rename saves none of the access changes', async () => {
     signInAs('saber')
     const p = panel()
     await p.open(PID.hunter)
     await p.pick('u149', 'plan')

     fireEvent.change(p.$('#accEdName')!, {
       target: { value: 'us' },
     })
     await p.save()

     expect(accountOfPid(PID.hunter)!.name).toBe('ad2')
     expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBeNull()
     // Today: 'admin'
   })
   ```

**Read:** the supplied working instructions, plan with §§16 and 15 taking precedence, relevant full rulings, squadron edit-rights inventory, and backlog. Traced the changed account/access, permission, squadron-pick, bell, Undo, posting, OIL, held-window, sign-in and Tracker paths, with supporting tests.

**Not read or checked:** the prohibited reports, other readers’ findings, drawing-check sheet, or visual agreement with the drawings. No app, tests or build were run. No files were changed, committed or pushed.

**Three tidiness notes, filed here only:**

- [units.ts — `putGrantLine`](/C:/ax149q/raptor-port/src/state/units.ts:401): share grant-row construction with `setGrant`; both now independently write the level, date and start moment.
- [useraccess-model.ts — `byNum`](/C:/ax149q/raptor-port/src/ui/useraccess-model.ts:11): share squadron-number ordering with the menu and bell readers.
- [usersfilter-model.ts — `usersView`](/C:/ax149q/raptor-port/src/ui/usersfilter-model.ts:100): expand the nested map insertion into explicit steps so duplicate prevention and group creation are easier to inspect.

Rulings: none this session.