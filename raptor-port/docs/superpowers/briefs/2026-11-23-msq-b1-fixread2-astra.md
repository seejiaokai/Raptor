# The read of the second fix round — Astra (gpt-6-astra, Codex CLI), commit 41ca09274

Saved verbatim as it arrived (through chat 149's Sonnet helper, 23 Nov 26 ~07:20 MPST; high reasoning, read-only, ~6 min on an exported copy; the brief's code-location paragraph alone pointed at the copy). Links point into that copy.

1. **Low — the new Undo refusal does not say who changed the account.**

   Saber gives Hunter Plan of 149, then removes it. Kestrel, another master admin, makes Hunter a master admin through a remote command. Saber presses Undo.

   The unsafe restore is correctly refused, but the message says only “Something else changed this…”. D148 requires the refusal to name who changed it. Kestrel’s identity is available in the remote command.

   **Cause:** [accounts.ts](/C:/ax149u/raptor-port/src/state/accounts.ts:1189), `accountsRestoreProblem`, returns a fixed anonymous sentence. The existing `outOfBandWords` in `undo/timeline.ts` already resolves the writer’s callsign.

   **Fix:** pass the conflicting account’s record key back to the Undo layer and use its existing named-conflict message.

   **Failing test:** add this to `msq-fix4-undo-plan-master.test.ts`, using its existing helpers:

   ```ts
   it('D148 names who made Hunter a master admin', () => {
     signInAs('saber')
     expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
     expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
     expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)
     hunterMadeMasterElsewhere()

     const result = globalUndo()
     expect(result.ok).toBe(false)
     expect(holds(ACCT.hunter, 'u149')).toBeUndefined()
     expect(result.reason).toContain('Kestrel')
   })
   ```

   The last assertion fails against the fixed sentence. This test is written out, not executed.

I found no further concrete fault in A1, A2/N1 or A3. The source now rejects restoring rights onto a master admin, advances the Leave War change count across swaps, separates Approvals visits by squadron and period, and requests Squadrons explicitly for squadron/place Undo and Redo.

**Read:** this round’s source changes and tests; relevant earlier-round changes; finished source around account restores, permission checks, Leave War loading and subscriptions, Approvals, and Admin navigation; the plan, governing area rules, D148, D672 and the edit-rights inventory.

**Not read or run:** the forbidden reports or walk evidence; a complete review of every change in the whole half; browser checks, tests or builds. This copy has no installed test dependencies. No files changed, committed or pushed.

**Three tidiness notes, reported here for filing; not fixed:**

- `ApprovalsPage`: rename `periodId` to reflect that it now identifies both squadron and period.
- `view`: give the Admin-opening request distinct Users and Squadrons shapes, avoiding irrelevant Users fields on a Squadrons request.
- `ApprovalsPage`: remove the redundant `periodNow` alias; the effect can use the composite key directly.

Rulings: none this session.

