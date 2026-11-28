# The read of the fixes — Astra (gpt-6-astra, Codex CLI), commit 1cd46dcdb

Saved verbatim as it arrived (through chat 149's Sonnet helper, 23 Nov 26 ~06:15 MPST; high reasoning, read-only, ~13 min on an exported copy; the brief's code-location paragraph alone pointed at the copy). Links point into that copy.

Three findings remain. These are source-traced findings; the tests below are written out **but not run**.

1. **High — Undo can still restore hidden Plan access onto a master admin.**

   Saber gives Hunter Plan of 149, then removes it. Another master admin promotes Hunter. Saber then undoes his removal. The Plan returns underneath “Full access”. Taking Hunter’s master mark off subsequently exposes that Plan again, including after reloading.

   The gate’s grant check explicitly exempts restores. The strengthened promotion check runs only when the same command changes the master mark. This Undo changes only the grant, so neither stops it. The Undo safeguards check the account’s person and squadron history, but not its new master status.

   Expected: no hidden grant restored while Hunter remains a master admin—plan §4 item 5 and §15 D14. His later demotion must not revive previously removed access.

   **Location:** [perms.ts:2717](C:/ax149s/raptor-port/src/state/perms.ts:2717), `unitRowViolation`; its promotion-only check at line 2914; `restoreLeavesOut`.

   **Failing test:** add to the existing Undo-rights tests, using their `remote`, `KESTREL` and `holds` helpers, with `setMaster` and `todayIso` imported:

   ```ts
   it('does not restore Plan beneath another admin’s master promotion', () => {
     signInAs('saber')
     expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
     expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
     expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)

     remote(KESTREL, 'account.master', () => {
       const key = 'account:' + ACCT.hunter
       store.set(key, {
         ...store.get(key, null),
         master: true,
         masterFrom: todayIso(),
         masterAt: Date.now(),
       })
     })

     globalUndo()
     accountsLoad()
     unitsLoad()
     expect(accountById(ACCT.hunter)!.master).toBe(true)
     expect(holds(ACCT.hunter, 'u149')).toBeUndefined()
     // Today: a holding Plan row is restored.
   })
   ```

2. **Medium — Switching squadrons with Approvals open retains the previous squadron’s requests.**

   With matching leave-period dates in 142 and 149, Saber opens 142’s Approvals, then picks 149 without leaving Approvals. The old 142 rows remain alongside 149’s rows, marked stale, ordinarily “No longer there”.

   R2 now changes the previous-visit timestamp with the squadron, but the retained list resets only when the **period ID** changes. Period IDs are made from dates, so two newly created periods with identical dates naturally share an ID. This is not confined to old demo records.

   Expected: the page shows only the picked squadron’s requests—plan §3 item 4. Its visit state must distinguish both squadron and period.

   **Location:** [ApprovalsPage.tsx:98](C:/ax149s/raptor-port/src/leavewar/ui/ApprovalsPage.tsx:98), `ApprovalsPage`; particularly `rowsRef` and the row merge at lines 226–294.

   **Failing test:** add to the Approvals regression tests, importing `setCell` and `getState`. This creates fresh requests in the fixture’s matching periods:

   ```tsx
   it('drops 142’s displayed rows when Approvals switches to 149', () => {
     signInAs('saber')
     const period142 = getState().period.id
     expect(setCell(PID.ranger, '2026-11-23', 'LL')).toBe(true)

     act(() => { enterSquadron('u149'); notify() })
     expect(getState().period.id).toBe(period142)
     expect(setCell(PID.osprey, '2026-11-23', 'LL')).toBe(true)

     act(() => { enterSquadron('u142'); notify() })
     const page = render(<ApprovalsPage shown />)
     expect(page.queryAllByTestId(`appr-line-${PID.ranger}`).length)
       .toBeGreaterThan(0)

     act(() => { enterSquadron('u149'); notify() })
     expect(worldUnit()).toBe('u149')
     expect(page.queryAllByTestId(`appr-line-${PID.osprey}`).length)
       .toBeGreaterThan(0)
     expect(page.queryAllByTestId(`appr-line-${PID.ranger}`))
       .toHaveLength(0)
     // Today: the retained 142 row is still drawn.
   })
   ```

3. **Low — F3 keeps the wrong Admin panel when the squadron change is out of view.**

   Saber adds squadron 150, opens Admin → Data, then presses Undo or Redo. The change succeeds while Data stays open. From another main page, the landing still explicitly requests Users.

   The fix treats *any* open Admin panel as though Squadrons were visible. D672 requires keeping the screen only when the change is already in view; otherwise it should reveal the change.

   **Location:** [undo-wire.ts:225](C:/ax149s/raptor-port/src/state/undo-wire.ts:225), `landingOf`.

   **Failing test:** add beside the existing Admin-panel regression, using its `adminOn` helper:

   ```tsx
   it('reveals Squadrons when its Undo is pressed from Data', async () => {
     signInAs('saber')
     const a = adminOn(/Squadrons/)
     await act(async () => {
       expect(addUnit('150', placeOfOn('u142', todayIso())!.id,
         ACCT.hunter).ok).toBe(true)
       notify()
     })

     const data = [...a.c.querySelectorAll('button.adm-cat')]
       .find(b => b.textContent?.startsWith('Data'))!
     act(() => { fireEvent.click(data) })

     await act(async () => {
       expect(globalUndo().ok).toBe(true)
       notify()
     })
     expect(a.on()).toBe('admSquadrons')
     // Today: admData.
   })
   ```

**Read:** the seven fixes and their new regression tests; surrounding account, permission-gate, Undo/Redo, storage, bell, Approvals and navigation paths; the governing rules, schema and plan, with §§16 and 15 taking precedence. The wider two-commit change supplied targeted context, not an exhaustive review of all 156 changed files.

**Not read or run:** the prohibited reports and walk; builds, tests or browser checks. The exported copy has no installed test dependencies. No files changed, committed or pushed. I found no further fault in F1, R1, R4 or R5 within those traces.

**Three tidiness notes for the host to file; not fixed:**

- `accounts.ts`, `rightsDropped`: replace the nested conditional with named promotion/demotion conditions so the two removal rules are easier to check.
- `accounts.ts`, `saveAccess`: share the rename-validation sequence with `updateAccount`; the new copy gives future changes two places to keep aligned.
- `perms.ts`, `requestAnsweredByAccount`: share the sign-in-name normalizer with the account code; matching a request should use one normalization rule.

Rulings: none new.