// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { getState, setCell, worldUnit, movableRecords, moveRecords, moveRecordsProblem, setDayAward, grantOilDays, awardsOnDay, notThisWarsDay } from './state/store'
import { setHome, homeOn, unitsLoad } from '../state/units'
import { useMsqWorld, signInAs, on as msqOn } from '../test-support/msq-world'

useMsqWorld()
const on = (d: number, h = 9, m = 0) => { msqOn(d, h, m); unitsLoad() }
const recsOn = (pid: string, date: string) => getState().wars.flatMap(w => (w.recs as any)[pid]?.[date] ?? [])

describe('fable3 — a Move landing on a day now another squadron’s', () => {
  it('admin moves Ranger’s waiting bid one day on, onto a 149 day: the bid is not lost', () => {
    signInAs('saber'); expect(worldUnit()).toBe('u142')
    expect(setCell('bane', '2026-07-15', 'LL')).toBe(true)
    const before = recsOn('bane', '2026-07-15')
    expect(before.length).toBe(1)
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(homeOn('bane', '2026-07-16')).toBe('u149')
    expect(notThisWarsDay('bane', '2026-07-16')).toBe(true)
    const movers = movableRecords([{ personId: 'bane', date: '2026-07-15' }])
    const res = moveRecords(movers, 1)
    const src = recsOn('bane', '2026-07-15'), dst = recsOn('bane', '2026-07-16')
    expect(dst.length, 'nothing lands on 149’s day').toBe(0)
    expect(src.length, 'the bid still stands on its own day').toBe(1)
  })
  it('an OIL award dated on a 149 day of Ranger’s, given in 142’s war', () => {
    signInAs('saber')
    expect(setHome('bane', 'u149').ok).toBe(true)
    on(16); signInAs('saber'); expect(worldUnit()).toBe('u142')
    const r = setDayAward('bane', '2026-07-17', 1, { note: 'x' })
    const g = grantOilDays([{ personId: 'bane', date: '2026-07-20' }], 1, { note: 'y' })
    expect(awardsOnDay('bane', '2026-07-17').length + awardsOnDay('bane', '2026-07-20').length, 'no award on a day that is 149’s').toBe(0)
  })
})
