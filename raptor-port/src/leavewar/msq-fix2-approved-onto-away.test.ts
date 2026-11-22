// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { getState, setCell, worldUnit, movableRecords, moveRecords, decideRequestById, fileStraight, setCells } from './state/store'
import { setHome, homeOn, unitsLoad } from '../state/units'
import { useMsqWorld, signInAs, on as msqOn } from '../test-support/msq-world'
import { INPUTS, idsOf } from '../engine/inputs'

useMsqWorld()
const on = (d: number, h = 9, m = 0) => { msqOn(d, h, m); unitsLoad() }
const recsOn = (pid: string, date: string) => getState().wars.flatMap(w => (w.recs as any)[pid]?.[date] ?? [])
const hisInputs = (pid: string) => (INPUTS as any[]).filter(r => idsOf(r).map(String).includes(pid))
  .map(r => ({ type: r.type, date: r.date, endDate: r.endDate, lw: r.lw, lwU: r.lwU }))

describe('fable3 — leave the old war approved, slid onto a day now another squadron’s', () => {
  it('Saber (master admin) slides Ranger’s approved 14 Jul leave two days on, onto 16 Jul (149’s) in 142’s war', () => {
    on(13); signInAs('saber'); expect(worldUnit()).toBe('u142')
    expect(setCell('bane', '2026-07-14', 'LL')).toBe(true)
    const rec = recsOn('bane', '2026-07-14')[0]
    expect(decideRequestById('bane', '2026-07-14', rec.id, 'approved')).toBe(true)
    on(15); signInAs('saber')
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(homeOn('bane', '2026-07-16')).toBe('u149')
    const movers = movableRecords([{ personId: 'bane', date: '2026-07-14' }])
    const res = moveRecords(movers, 2)
    const after = hisInputs('bane').filter(r => r.lw)
    expect(after.some(r => /16/.test(String(r.date))), '142’s war leave must not land on 16 Jul, 149’s day (D2243 Q3)').toBe(false)
  })
  it('Hunter (142 plain admin) does the same', () => {
    on(13); signInAs('hunter'); expect(worldUnit()).toBe('u142')
    expect(setCell('bane', '2026-07-14', 'LL')).toBe(true)
    const rec = recsOn('bane', '2026-07-14')[0]
    expect(decideRequestById('bane', '2026-07-14', rec.id, 'approved')).toBe(true)
    on(15); signInAs('saber')
    expect(setHome('bane', 'u149').ok).toBe(true)
    signInAs('hunter')
    const movers = movableRecords([{ personId: 'bane', date: '2026-07-14' }])
    const res = moveRecords(movers, 2)
    expect(hisInputs('bane').filter(r => r.lw).some(r => /16/.test(String(r.date)))).toBe(false)
  })
  it('Hunter files a duty over 15–17 Jul across Ranger’s move: what the door answers and what is stored', () => {
    signInAs('saber')
    expect(setHome('bane', 'u149').ok).toBe(true)
    signInAs('hunter')
    const cells = ['2026-07-15', '2026-07-16', '2026-07-17'].map(date => ({ personId: 'bane', date }))
    const f = fileStraight(cells, 'OD')
    const stored = hisInputs('bane').filter(r => r.type === 'OD')
    expect(f.done > 0 && stored.length === 0, 'the door must not say filed where nothing was').toBe(false)
  })
  it('a duty and a bid dragged over 14–17 Jul across his move', () => {
    signInAs('saber')
    expect(setHome('bane', 'u149').ok).toBe(true)
    const cells = ['2026-07-15', '2026-07-16', '2026-07-17'].map(date => ({ personId: 'bane', date }))
    const r = setCells(cells, 'LL')
    const f = fileStraight(cells, 'OD')
    expect(recsOn('bane', '2026-07-16').length + recsOn('bane', '2026-07-17').length).toBe(0)
  })
})
