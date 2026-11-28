# The read of the last small fix (A4) — the fresh, blind Opus reader (commit 781b033de)

Saved as it arrived (chat 149's helper, 23 Nov 26 ~07:55 MPST). Source only; nothing run; tests written out, not run.

## Findings

**1. (medium, an incomplete D148 fix) The refusal names nobody when the Undo itself puts the mark back and the blocking
right was given by someone else.**
- Steps: Saber makes Kestrel master; Saber makes Hunter master (no rights, nothing dropped); Saber takes the mark off
  Hunter; Kestrel, elsewhere, gives Hunter View of 149 (writes only `grant:<id>`, `units.ts setGrant`); Saber presses Undo
  (it would put the mark back with Kestrel's View under "Full access").
- What happens: correctly refused (`masterRightLeft` finds Hunter), but `undo-wire.ts masterRightRefusal` always names the
  writer of the account's row (`settings/account:<hunter>`) — Saber's own step; `outOfBandWords` drops a `'user'`-origin
  writer and there is no barrier on that row, so the anonymous "Something else changed this after your action — it can’t
  be undone now."
- Should: "Kestrel changed this after your action — it can’t be undone now." (D148). Same gap on Redo (Saber makes Hunter
  master, undoes it, Kestrel gives View, Saber Redo).
- Where: `undo-wire.ts masterRightRefusal` (always `settings/${ACCOUNT_PFX}${id}`); `accounts.ts masterRightLeft` returns
  only the account, not the holding right's row.
- Fix: `masterRightLeft` also returns the holding right's id; `masterRightRefusal` names the writer of whichever row the
  step does not write — the right's row (`settings/grant:<id>`) when the step writes the account row, the account row when
  it writes the right's row — the shape of `timeline.ts standingConflict` (`hooks.standingKey`, `outOfBandWords(key)`).
- Test (fails today), in `msq-fix4-undo-plan-master.test.ts`:
```ts
it('D148 names Kestrel when the Undo puts the mark back over a View he gave', () => {
  signInAs('saber')
  expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
  expect(setMaster(ACCT.hunter, true).ok).toBe(true)
  expect(setMaster(ACCT.hunter, false).ok).toBe(true)
  remote(KESTREL, 'grant.set', () => {
    store.set('grant:gk1', { id: 'gk1', account: ACCT.hunter, unit: 'u149', level: 'view', from: todayIso() })
  })
  const u = globalUndo()
  accountsLoad(); unitsLoad()
  expect(u.ok).toBe(false)
  expect(accountById(ACCT.hunter)!.master).not.toBe(true)
  expect(u.reason).toContain('Kestrel')
})
```

**2. (low) The wrong person is named when the mark is the signed-in person's own later step.**
- Steps: Saber makes Kestrel master; gives Hunter View of 149, takes it away; makes Hunter master; Kestrel, elsewhere,
  changes Hunter's account (his name); Saber presses Undo — the master step is blocked ("Kestrel changed this…") and set
  aside (`timeline.ts sayBlocked` / `newestUndoable`); Saber presses Undo again, on the taking-away.
- What happens: refused, correctly (Hunter is master), but it reads "Kestrel changed this after your action — it can’t be
  undone now." — Kestrel only changed the name; the mark that blocks is Saber's own step. Words that say what did not
  happen.
- Should: words that do not blame Kestrel — the "You changed this…" form, or the anonymous words.
- Where: `undo-wire.ts masterRightRefusal` names whoever last wrote the account row, not whoever set the mark.
- Test (fails today):
```ts
it('a right taken away, under a mark Saber set himself, does not blame Kestrel for a name change', () => {
  signInAs('saber')
  expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
  expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter).ok).toBe(true)
  expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)
  expect(setMaster(ACCT.hunter, true).ok).toBe(true)
  remote(KESTREL, 'account.update', () => {
    const key = 'account:' + ACCT.hunter
    store.set(key, { ...store.get(key, null), name: 'hunter2' })
  })
  expect(globalUndo().ok).toBe(false)
  const u = globalUndo()
  expect(u.ok).toBe(false)
  expect(holds(ACCT.hunter, 'u149')).toBeUndefined()
  expect(u.reason).not.toContain('Kestrel')
})
```

## Checked, nothing found
The three fixed cases name Kestrel (his remote mark sets the account row's barrier with him as maker); a step touching an
account or a squadron row is checked as before; the pre-move Undo check, the Redo check and the restore's own check all
run it via the restore-refusal hook; no crash path (`masterRightLeft` skips empty accounts, `accountsAfter` falls back to
the seeded list); `settings/account:<id>` matches the timeline's keys; no Undo that must pass is refused, none that must be
refused passes; the check now runs after the roster and account checks, so when two problems coexist the other's words win.

## Read (at 781b033de)
The whole diff 0acad2f81..781b033de under raptor-port/src; undo-wire.ts (imports, the restore-refusal chain,
masterRightRefusal); timeline.ts (outOfBandWords, outOfBand, trackExpectation, writerOf, standingConflict, globalUndo /
globalRedo, newestUndoable, sayBlocked); derive.ts recordKeyIn; accounts.ts (masterRightLeft, accountsRestoreProblem,
accountsAfter, setMaster, rightsDropped); roster-restore.ts; units.ts (unitRowsAfter, setGrant, removeGrant);
units-model.ts prefixes; perms.ts near the gate check; the test file.

## Tidiness notes (filed, not fixed — D489)
1. `perms.ts`: the comment above the right-on-a-master-admin check still says the Undo refuses first "in D148's words
   (accounts.ts accountsRestoreProblem)" — it now lives in `undo-wire.ts masterRightRefusal`.
2. `accounts.ts`: `accountsRestoreProblem`'s own comment now sits above `masterRightLeft`, reading as its comment.
3. `masterRightRefusal` repeats `rosterRestoreProblem`'s "does this step touch an account or a squadron row" test and its
   `accountsAfter` / `unitRowsAfter` work — two copies of one gate.
