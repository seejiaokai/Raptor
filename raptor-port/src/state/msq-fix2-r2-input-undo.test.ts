// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { setGrant, unitsLoad, unitRows } from './units'
import { accountsLoad } from './accounts'
import { settingsStore } from './people-settings-commit'
import { store } from '../engine/hooks'
import { commitAs } from '../command/commit'
import { commitInput } from '../ui/inputedit'
import { globalUndo } from '../undo/timeline'

useMsqWorld()

it('passes an unreachable input step to reach an older own change', () => {
  signInAs('saber')
  expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
  unitsLoad(); accountsLoad()
  signInAs('hunter')
  expect(setGrant(ACCT.osprey, 'u142', 'view', PID.osprey).ok).toBe(true)
  expect(commitInput(null, {
    type: 'Meeting', start: '2026-07-20', end: '',
    allday: true, half: '', remarks: 'Briefing',
  }, [PID.osprey])).toBe(true)

  const plan = unitRows().grants.find(
    g => g.account === ACCT.hunter && g.unit === 'u149',
  )!
  const result = commitAs({
    type: 'grant.remove', scope: { module: 'settings' }, meta: null,
    apply(txn: any) {
      txn.enlist(settingsStore)
      store.set('grant:' + plan.id, null)
    },
  } as any, {
    actor: {
      id: ACCT.saber, role: 'admin', personId: PID.saber, session: null,
    },
    origin: 'remote',
  })
  expect(result.ok).toBe(true)
  unitsLoad(); accountsLoad()
  globalUndo(); globalUndo(); globalUndo()
  expect(unitRows().grants.some(
    g => g.account === ACCT.osprey && g.unit === 'u142',
  )).toBe(false)
})
