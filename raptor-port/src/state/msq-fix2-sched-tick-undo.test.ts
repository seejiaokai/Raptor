// @vitest-environment jsdom
/* Fix read 2, the core share — the gate's hold on where a Scheduler tick was given (perms.ts schedRecordViolation) must not
   stop the honest ways the record is written: the tick's own door, its Undo and Redo, and the Undo of an untick the day
   after (the record put back with the day it had — the security read's note). */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, on } from '../test-support/msq-world'
import { PEOPLE } from '../engine/people'
import { updatePersonField } from './quals-write'
import { commitPeopleEdit } from './people-settings-commit'
import { schedTickIn } from './units'
import { globalUndo, globalRedo } from '../undo/timeline'

useMsqWorld()

const ranger = (): any => (PEOPLE as any)[PID.ranger]
const tick = () => updatePersonField(PID.ranger, { tick: 'sched' } as any)

describe('fix read 2 — the Scheduler tick’s record, by its honest doors', () => {
  it('ticked by his own admin, unticked the day after, and the untick undone: the record is back with the day it had', () => {
    signInAs('hunter')
    if (ranger().quals.sched) expect(tick()).toBeNull()
    expect(tick()).toBeNull()
    expect([ranger().schedOf, ranger().schedFrom]).toEqual(['u142', '2026-07-15'])
    on(16)
    expect(tick()).toBeNull()                                            // unticked
    expect(ranger().schedOf).toBeUndefined()
    const u = globalUndo()
    expect(u.ok, u.reason).toBe(true)
    expect([!!ranger().quals.sched, ranger().schedOf, ranger().schedFrom]).toEqual([true, 'u142', '2026-07-15'])
    expect(schedTickIn(PID.ranger, 'u142', '2026-07-16')).toBe(true)
    const r = globalRedo()
    expect(r.ok, r.reason).toBe(true)
    expect(!!ranger().quals.sched).toBe(false)
  })
  it('a hand-made write of an earlier day, or of the record with no tick, is refused', () => {
    signInAs('hunter')
    if (ranger().quals.sched) expect(tick()).toBeNull()
    const write = (fn: (p: any) => void): boolean => { const r: any = commitPeopleEdit(() => fn(ranger())); return !!r && r.ok !== false }
    expect(write(p => { p.quals = { ...p.quals, sched: true }; p.schedOf = 'u142'; p.schedFrom = '2026-07-01' }), 'back-dated').toBe(false)
    expect(write(p => { p.schedOf = 'u142'; p.schedFrom = '2026-07-15' }), 'the record with no tick').toBe(false)
    expect(write(p => { p.quals = { ...p.quals, sched: true }; p.schedFrom = '2026-07-15' }), 'a day with no squadron').toBe(false)
    expect(ranger().schedOf).toBeUndefined()
  })
  it('a record dated ahead holds on no day before it', () => {
    signInAs('hunter')
    expect(schedTickIn(PID.ranger, 'u142', '2026-07-15')).toBe(!!ranger().quals.sched)
    const p = { ...ranger(), quals: { ...ranger().quals, sched: true }, schedOf: 'u142', schedFrom: '2026-07-20' }
    ;(PEOPLE as any)[PID.ranger] = p
    expect(schedTickIn(PID.ranger, 'u142', '2026-07-19')).toBe(false)
    expect(schedTickIn(PID.ranger, 'u142', '2026-07-20')).toBe(true)
  })
})
