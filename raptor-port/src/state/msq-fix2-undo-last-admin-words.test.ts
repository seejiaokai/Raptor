// @vitest-environment jsdom
import { it, expect } from 'vitest'
import {
  useMsqWorld, signInAs, PID, ACCT,
} from '../test-support/msq-world'
import { updateAccount, setMaster, levelIn } from './accounts'
import {
  addUnit, setGrant, unitRows, unitsLoad, todayIso,
} from './units'
import { GRANT_PFX } from './units-model'
import { settingsStore } from './people-settings-commit'
import { store } from '../engine/hooks'
import { commitAs } from '../command/commit'
import { globalUndo } from '../undo/timeline'

useMsqWorld()

it('explains why Undo cannot remove the remaining Plan admin', () => {
  signInAs('saber')
  expect(updateAccount(ACCT.osprey, { role: 'admin' })).toBeNull()
  expect(setMaster(ACCT.osprey, true).ok).toBe(true)

  const made = addUnit('150', 'p1', ACCT.hunter)
  expect(made.ok).toBe(true)
  const unit = made.id!
  expect(setGrant(ACCT.kestrel, unit, 'admin', PID.kestrel).ok)
    .toBe(true)

  const hunterGrant = unitRows().grants.find(
    g => g.unit === unit && g.account === ACCT.hunter,
  )!

  const remote = commitAs({
    type: 'grant.remove',
    scope: { module: 'settings' },
    meta: null,
    apply(txn: any) {
      txn.enlist(settingsStore)
      store.set(GRANT_PFX + hunterGrant.id, null)
    },
  } as any, {
    actor: {
      id: ACCT.osprey, personId: PID.osprey,
      role: 'admin', session: null,
    },
    origin: 'remote',
  })
  expect((remote as any).ok).toBe(true)
  unitsLoad()

  const result = globalUndo()
  expect(result.ok).toBe(false)
  expect(levelIn(ACCT.kestrel, unit, todayIso())).toBe('admin')
  expect(result.reason).toMatch(
    /Kestrel is 150.s last admin\. Make another admin of 150 first\./,
  )
})
