/* THE DEFAULT WAVE ORDER, APPLIED AT ADD TIME (owner, 29 Aug 26 pt.2 — "even to the
   arrangement of the waves under display", "new schedules only"). ui/board.ts
   addWave places a newly-added wave into the admin's house wave order — but ONLY on
   a day that is not signed off, and only when a house order is set. This pins the
   three cases: placed on a draft day, appended on a published day (never amends a
   signed-off schedule with an extra move), and appended when no house order is set.
   Uses the same tested moveWave the per-day Arrange sheet uses, so the moved-past
   waves keep their identity. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { isStandalone } from '../engine/waves'
import { dayApproved, setDayApproved, signOf, SCHED } from '../engine/publish'
import { setWaveDefault, waveDefaultReset } from '../engine'
import { initStore, setSession, notify } from '../state/store'
import { addWave } from './board'

const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  initStore()
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []; SCHED.dayOK = {}; SCHED.sign = {}
  setSession({ user: 'a', role: 'admin' }); notify()
  waveDefaultReset()
})

describe('a new wave lands in the house order', () => {
  it('places an added SC on top of a draft day, keeping the old waves attached', () => {
    setWaveDefault(['sc', 'fly', 'avalon', 'bb'])   // SC on top
    const d = DAYS[0]
    expect(dayApproved(0)).toBe(false)
    const firstBefore = d.waves[0]                  // the day's existing top wave
    const nBefore = d.waves.length
    addWave(0, 'sc')
    expect(d.waves.length).toBe(nBefore + 1)
    expect(isStandalone(d.waves[0]) && d.waves[0].kind).toBe('sc')   // SC is now on top
    expect(d.waves[1]).toBe(firstBefore)            // the old top wave slid down intact
  })

  it('appends on a SIGNED-OFF day — the default never adds an amendment move', () => {
    setWaveDefault(['sc', 'fly', 'avalon', 'bb'])
    const g = signOf(1); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(1, true)
    expect(dayApproved(1)).toBe(true)
    const d = DAYS[1]
    const nBefore = d.waves.length
    addWave(1, 'sc')
    expect(d.waves.length).toBe(nBefore + 1)
    expect(isStandalone(d.waves[nBefore]) && d.waves[nBefore].kind).toBe('sc')   // at the END, not moved
  })

  it('appends when no house order is set (unchanged behaviour)', () => {
    const d = DAYS[0]
    const nBefore = d.waves.length
    addWave(0, 'sc')                                // waveDefault is unset in beforeEach
    expect(d.waves.length).toBe(nBefore + 1)
    expect(isStandalone(d.waves[nBefore]) && d.waves[nBefore].kind).toBe('sc')   // appended
  })
})
