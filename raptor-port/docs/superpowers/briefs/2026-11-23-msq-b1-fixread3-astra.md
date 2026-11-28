# The read of the last small fix (A4) — Astra (gpt-6-astra, Codex CLI), commit 781b033de

Saved verbatim as it arrived (through chat 149's Sonnet helper, 23 Nov 26 ~07:47 MPST; high reasoning, read-only, ~4 min on an exported copy; the brief's code-location paragraph alone pointed at the copy). Links point into that copy.

1. **Undo can wrongly blame the signed-in person for Kestrel’s change.**

   Steps: Saber makes Hunter a master admin from another session. In this session, Saber removes that mark. Kestrel then gives Hunter View of 149. Saber presses Undo.

   Undo correctly refuses, but says **“You changed this somewhere else after this action…”** Saber's other-session change happened **before** the action being undone. It should name **Kestrel**, whose later View grant prevents restoring the mark.

   Cause: [state/undo-wire.ts — masterRightRefusal](/C:/ax149u/raptor-port/src/state/undo-wire.ts:618) always asks for the account row’s writer. Here, the conflicting change belongs to the **grant row**. [undo/timeline.ts — outOfBandWords](/C:/ax149u/raptor-port/src/undo/timeline.ts:817) consequently uses Saber's older recorded change.

   Fix: when restoring the master-admin mark conflicts with a later right, name that right’s writer. Keep the account writer for the opposite case: restoring a right after a later promotion.

   Regression test, using the existing helpers in `msq-fix4-undo-plan-master.test.ts`:

   ```ts
   it('names the later grant writer when Undo restores master admin', () => {
     signInAs('saber')
     expect(setMaster(ACCT.kestrel, true).ok).toBe(true)

     const SABER = {
       id: ACCT.saber, role: 'admin',
       personId: PID.saber, session: null,
     } as any

     remote(SABER, 'account.master', () => {
       const key = 'account:' + ACCT.hunter
       store.set(key, {
         ...store.get(key, null),
         master: true, masterFrom: todayIso(), masterAt: Date.now(),
       })
     })
     expect(setMaster(ACCT.hunter, false).ok).toBe(true)

     remote(KESTREL, 'grant.set', () => {
       store.set('grant:ga4', {
         id: 'ga4', account: ACCT.hunter,
         unit: 'u149', level: 'view', from: todayIso(),
       })
     })

     const result = globalUndo()
     expect(result.ok).toBe(false)
     expect(accountById(ACCT.hunter)!.master).not.toBe(true)
     expect(holds(ACCT.hunter, 'u149')?.level).toBe('view')
     expect(result.reason).toBe(
       'Kestrel changed this after your action — it can’t be undone now.'
     )
   })
   ```

   The final assertion fails by source tracing; I did not execute it.

**Read:** the supplied one-commit diff and committed source for the changed functions and tests; the account writers, candidate-state readers, grant rules, Undo/Redo conflict handling, restore guards and test setup; the applicable working rules and D148/D56/D489. Prohibited reports and walk evidence stayed unopened. No files changed or builds run.

**Tidiness note:** the added final test repeats the first test’s promotion-and-Undo case, which now already checks Kestrel’s name. Filed here only.

Rulings: none this session.