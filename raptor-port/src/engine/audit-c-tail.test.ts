/* AUDIT C — the midnight tail's documented holes (day 0 backwards, the last
   loaded day forwards), both directions at once on an interior day, and
   day.sacrew being rebuilt rather than staled when the AVALON crew changes.
   The holes are DOCUMENTED-DELIBERATE (HANDOFF: they fix themselves the day
   the app carries more than one week) — pinned here so a regression in either
   direction is visible against a recorded baseline. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate } from './validate'
import { collectEvents } from './events'
import { makeStandalone } from './waves'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const hits = (code: string, id: string) =>
  validate().all.filter((x: any) => x.code === code && (x.who || []).includes(id))

describe('the documented holes at the week edges', () => {
  it("the LAST day's overnight tail is unchecked — next Monday's leave is invisible (documented)", () => {
    DAYS[6].dutywaves[0].rows.push({ role: 'SDO', id: 'split', str: '1900', end: '0700' })
    INPUTS.push({ person: 'split', date: 'Jul 20', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(() => validate()).not.toThrow()
    expect(hits('LEAVE_FLY', 'split')).toEqual([])
    expect(collectEvents()[6].input.some((i: any) => i.nx)).toBe(false)
  })

  it("day 0's backward tail is unchecked — the Sunday before is invisible (documented mirror)", () => {
    const f = DAYS[0].waves[0].formations[0]
    f.to = '00:30'; f.ld = '02:00'; f.br = ''
    f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 12', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(() => validate()).not.toThrow()
    expect(hits('LEAVE_FLY', 'split')).toEqual([])
    expect(collectEvents()[0].input.some((i: any) => i.pv)).toBe(false)
  })
})

describe('an interior day runs the tail BOTH ways at once', () => {
  it('Thursday sees Friday through an overnight duty AND Wednesday through a small-hours T/O', () => {
    DAYS[3].dutywaves[0].rows.push({ role: 'SDO', id: 'split', str: '1900', end: '0700' })
    INPUTS.push({ person: 'split', date: 'Jul 17', allday: true, type: 'OL', remarks: '', mod: '' })
    const f = DAYS[3].waves[0].formations[0]
    f.to = '00:30'; f.ld = '02:00'; f.br = ''
    f.aircraft[0].p = 'fantom'
    INPUTS.push({ person: 'fantom', date: 'Jul 15', allday: false, s: 1320, e: 1425, type: 'Meeting', remarks: '', mod: '' })
    const fwd = hits('LEAVE_FLY', 'split').filter((x: any) => x.di === 3)
    expect(fwd.length, JSON.stringify(fwd)).toBeGreaterThan(0)
    const back = hits('INPUT_FLY', 'fantom').filter((x: any) => x.di === 3)
    expect(back.length, JSON.stringify(back)).toBeGreaterThan(0)
    // both copies ride on the same day.input — nx and pv coexist
    const inp = collectEvents()[3].input
    expect(inp.some((i: any) => i.nx && i.id === 'split')).toBe(true)
    expect(inp.some((i: any) => i.pv && i.id === 'fantom')).toBe(true)
  })
})

describe('day.sacrew follows the model — no staleness across edits', () => {
  it('an AVALON man removed from the seat stops being collected AND stops warning', () => {
    const w = makeStandalone('avalon')
    DAYS[0].waves.push(w)
    w.formations[0].aircraft[0].p = 'badger'
    INPUTS.push({ person: 'badger', date: 'Jul 13', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(hits('LEAVE_FLY', 'badger').length).toBeGreaterThan(0)
    expect(collectEvents()[0].sacrew.some((x: any) => x.id === 'badger')).toBe(true)
    w.formations[0].aircraft[0].p = ''                    // the man comes off the wave
    expect(hits('LEAVE_FLY', 'badger')).toEqual([])
    expect(collectEvents()[0].sacrew).toEqual([])
  })

  it('an AVALON man REPLACED by another moves the check to the new man in the same pass', () => {
    const w = makeStandalone('avalon')
    DAYS[0].waves.push(w)
    w.formations[0].aircraft[0].p = 'badger'
    INPUTS.push({ person: 'badger', date: 'Jul 13', allday: true, type: 'OL', remarks: '', mod: '' })
    INPUTS.push({ person: 'plasma', date: 'Jul 13', allday: true, type: 'OD', remarks: '', mod: '' })
    expect(hits('LEAVE_FLY', 'badger').length).toBeGreaterThan(0)
    w.formations[0].aircraft[0].p = 'plasma'
    expect(hits('LEAVE_FLY', 'badger')).toEqual([])
    expect(hits('LEAVE_FLY', 'plasma').length).toBeGreaterThan(0)
    const sc = collectEvents()[0].sacrew
    expect(sc.length).toBe(1)
    expect(sc[0].id).toBe('plasma')
  })

  it('a CX-ed AVALON jet drops its crew from sacrew', () => {
    const w = makeStandalone('avalon')
    DAYS[0].waves.push(w)
    w.formations[0].aircraft[0].p = 'badger'
    w.formations[0].aircraft[0].cx = true
    INPUTS.push({ person: 'badger', date: 'Jul 13', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(collectEvents()[0].sacrew).toEqual([])
    expect(hits('LEAVE_FLY', 'badger')).toEqual([])
  })
})
