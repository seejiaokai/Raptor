// RB8 — AN SC, AVALON OR BB LINE'S OWN RALLY BOX (owner D1036, D1040, D1041, 19 Oct 26).
//
// "For SC AVALON and BB I want to standardise to have rally time as well" — and, to what it counts for, "First option and
// to be specific is it SC main only?": yes. On an SC MAIN line a typed rally starts the crew's day exactly as the SC
// in-time box (its B) does — crew rest, the long day, work hours and OIL — the earlier of the two counting where both are
// typed; on an SC SPARE row, an AVALON or a BB line it is shown, printed and exported only. An empty box counts nothing.
// CHANGED 19 Oct 26 ([STANDBY-FLIES], D1044, D1045 narrow D1041): a typed rally on ANY standby line flies its whole shift,
// SPARE rows included — so on a SPARE, AVALON or BB row it now starts the day as on SC MAIN (the tests below say so).
// The crew-rest sentence names which box it was ("SC AM's rally is 05:00").
// Register: docs/superpowers/specs/2026-10-02-rally-behaviour-register.md (RB8).

import { afterEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { validate, WARN, workSpan, dayEvents } from './validate'
import { makeStandalone } from './waves'
import { dayOilSpans, dayOilWork } from './oil'
import { scReport } from './reporting'
import { VCONF } from './rules'

const h = (hh: number, mm = 0) => hh * 60 + mm

describe('scReport — the earlier of the in-time box and the rally box', () => {
  it('either box alone, both (the earlier), neither', () => {
    expect(scReport({ br: '06:00' }, h(7))).toBe(h(6))
    expect(scReport({ rl: '05:30' }, h(7))).toBe(h(5, 30))
    expect(scReport({ br: '06:00', rl: '05:30' }, h(7))).toBe(h(5, 30))
    expect(scReport({ br: '05:00', rl: '05:30' }, h(7))).toBe(h(5))
    expect(scReport({}, h(7))).toBeNull()
    expect(scReport({ br: '', rl: 'abc' }, h(7))).toBeNull()
    expect(scReport(null, h(7))).toBeNull()
  })
  it('each read by the in-time box\'s own evening-before rule', () => {
    expect(scReport({ rl: '23:00' }, h(1))).toBe(-60)
    expect(scReport({ rl: '23:00' }, h(8))).toBe(h(23))
  })
})

/* crew rest, off the seed's own late duty: stuff stands OPS-O until 21:30 on the Monday, so his Tuesday clears at 09:30
   (the same case engine/scintime.test.ts pins for the in-time box) */
const TUE = 1
const addSC = (br?: string, rl?: string) => {
  const w: any = makeStandalone('sc')
  if (br != null) w.formations[0].br = br
  if (rl != null) w.formations[0].rl = rl
  w.formations[0].aircraft[0].p = 'stuff'
  ;(DAYS[TUE] as any).waves.push(w)
  validate()
}
const breach = () => {
  const g: any = WARN.byDay.find((x: any) => x.di === TUE)
  return ((g && g.warns) || []).find((w: any) => w.code === 'CREW_REST' && (w.who || []).includes('stuff'))
}

describe('RB8 — crew rest on an SC MAIN line reads its rally box', () => {
  afterEach(() => { (DAYS[TUE] as any).waves.pop(); validate() })
  it('a typed rally (05:00) pulls the report onto it, and the sentence says rally', () => {
    addSC(undefined, '05:00')
    const cr = breach()
    expect(cr).toBeTruthy()
    expect(cr.msg).toContain("SC AM's rally is 05:00")
    expect(cr.msg).toContain('7h30 rest')
  })
  it('both typed: the earlier counts, and the sentence names that box', () => {
    addSC('06:00', '05:00')
    expect(breach().msg).toContain("SC AM's rally is 05:00")
    ;(DAYS[TUE] as any).waves.pop()
    addSC('05:00', '06:00')
    expect(breach().msg).toContain("SC AM's in-time is 05:00")
  })
  it('a rally later than the shift start moves nothing — the watch still starts at 07:00', () => {
    addSC(undefined, '08:00')
    expect(breach().msg).toContain('SC AM starts 07:00')
    expect(breach().msg).toContain('9h30 rest')
  })
  it('the long day starts at the rally too (work span from the report)', () => {
    addSC(undefined, '05:00')
    expect(workSpan(dayEvents(TUE, 'stuff'))!.s, 'his day starts at the rally').toBe(h(5))
  })
})

const day = (waves: any[] = []) => ({ waves, dutywaves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [] })
const one = (kind: string, to: string, ld: string, box: any = {}, spare = false) => {
  const w: any = makeStandalone(kind)
  const f = w.formations[0]
  Object.assign(f, { to, ld }, box)
  f.aircraft[0].p = 'bane'
  if (spare) f.aircraft[2].p = 'stiff'
  w.formations.length = 1
  return w
}

describe('RB8 — OIL reads a standby line\'s rally box: SC MAIN, and since [STANDBY-FLIES] SPARE, AVALON and BB too', () => {
  const SAVE = { reportLead: VCONF.reportLead }
  afterEach(() => Object.assign(VCONF, SAVE))
  it('SC MAIN 07:00–13:00 with a rally 06:00: from 06:00; with both, from the earlier', () => {
    expect(dayOilSpans(day([one('sc', '07:00', '13:00', { rl: '06:00' })])).bane).toEqual([[h(6), h(13)]])
    expect(dayOilSpans(day([one('sc', '07:00', '13:00', { rl: '06:00', br: '05:30' })])).bane).toEqual([[h(5, 30), h(13)]])
    expect(dayOilSpans(day([one('sc', '07:00', '13:00', { rl: '05:30', br: '06:00' })])).bane).toEqual([[h(5, 30), h(13)]])
  })
  it('an empty box, or a later one, leaves the written window', () => {
    expect(dayOilSpans(day([one('sc', '07:00', '13:00', { rl: '' })])).bane).toEqual([[h(7), h(13)]])
    expect(dayOilSpans(day([one('sc', '07:00', '13:00', { rl: '08:00' })])).bane).toEqual([[h(7), h(13)]])
  })
  it('a SPARE row on the same shift flies with it: from the rally, on by default (D1044, D1045)', () => {
    const work = dayOilWork(day([one('sc', '07:00', '13:00', { rl: '06:00' }, true)]), { expandAll: () => [] })
    expect(work.bane.map(x => [x.s, x.e, x.dflt])).toEqual([[h(6), h(13), true]])
    expect(work.stiff.map(x => [x.s, x.e, x.dflt])).toEqual([[h(6), h(13), true]])
  })
  it('AVALON and BB: a typed rally flies the shift — from the rally, on by default; an empty box leaves it standing by (D1045)', () => {
    for (const kind of ['avalon', 'bb']) {
      const plain = dayOilWork(day([one(kind, '07:00', '19:00')]), { expandAll: () => [] })
      const withRl = dayOilWork(day([one(kind, '07:00', '19:00', { rl: '05:00' })]), { expandAll: () => [] })
      expect(plain.bane.map(x => [x.s, x.e, x.dflt]), kind).toEqual([[h(7), h(19), false]])
      expect(withRl.bane.map(x => [x.s, x.e, x.dflt]), kind).toEqual([[h(5), h(19), true]])
    }
  })
})
