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
import { INPUTS, idsOf } from '../engine/inputs'

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
  expect((result as { ok?: boolean }).ok).toBe(true)
  unitsLoad(); accountsLoad()
  globalUndo(); globalUndo(); globalUndo()
  expect(unitRows().grants.some(
    g => g.account === ACCT.osprey && g.unit === 'u142',
  )).toBe(false)
})

/* ---- helper "r2close": the reach check's own edges — blocked once and said, and an honest Undo never held ---- */
const meetingFor = (pid: string) => commitInput(null, {
  type: 'Meeting', start: '2026-07-20', end: '', allday: true, half: '', remarks: 'Briefing',
}, [pid])
/* (the demo world holds a group Meeting of its own: the one filed here names one man alone) */
const meetings = (pid: string) => (INPUTS as any[]).filter(r => r.type === 'Meeting' && idsOf(r).length === 1 && String(idsOf(r)[0]) === pid)
const givePlan = () => {
  signInAs('saber')
  expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
  unitsLoad(); accountsLoad()
  signInAs('hunter')
}
const takePlan = () => {
  const plan = unitRows().grants.find(g => g.account === ACCT.hunter && g.unit === 'u149')!
  expect((commitAs({
    type: 'grant.remove', scope: { module: 'settings' }, meta: null,
    apply(txn: any) { txn.enlist(settingsStore); store.set('grant:' + plan.id, null) },
  } as any, { actor: { id: ACCT.saber, role: 'admin', personId: PID.saber, session: null }, origin: 'remote' }) as { ok?: boolean }).ok).toBe(true)
  unitsLoad(); accountsLoad()
}

it('the unreachable Meeting is blocked once, in the words Undo already says, and stays filed; the next press takes the older step', () => {
  givePlan()
  expect(setGrant(ACCT.osprey, 'u142', 'view', PID.osprey).ok).toBe(true)
  expect(meetingFor(PID.osprey)).toBe(true)
  takePlan()
  const first = globalUndo() as { ok: boolean; reason?: string }
  expect(first.ok).toBe(false)
  expect(first.reason).toMatch(/^Something else changed this after your action — it can’t be undone now\. Press Undo again for: /)
  expect(meetings(PID.osprey)).toHaveLength(1)
  expect((globalUndo() as { ok: boolean }).ok).toBe(true)
  expect(unitRows().grants.some(g => g.account === ACCT.osprey && g.unit === 'u142')).toBe(false)
  expect(meetings(PID.osprey)).toHaveLength(1)
})

it('while he still holds Plan of 149, the Meeting’s Undo goes through', () => {
  givePlan()
  expect(meetingFor(PID.osprey)).toBe(true)
  expect((globalUndo() as { ok: boolean }).ok).toBe(true)
  expect(meetings(PID.osprey)).toHaveLength(0)
})

it('his Plan gone, an input of his own squadron’s man and one of his own still undo', () => {
  givePlan()
  takePlan()
  expect(meetingFor(PID.ranger)).toBe(true)
  expect(meetingFor(PID.hunter)).toBe(true)
  expect((globalUndo() as { ok: boolean }).ok).toBe(true)
  expect(meetings(PID.hunter)).toHaveLength(0)
  expect((globalUndo() as { ok: boolean }).ok).toBe(true)
  expect(meetings(PID.ranger)).toHaveLength(0)
})
