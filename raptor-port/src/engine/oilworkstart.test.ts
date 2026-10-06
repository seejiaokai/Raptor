// [OIL-WORK-START] half 1 — WHERE A FLYING LINE'S OIL DAY STARTS (owner, D591 and D592, 5 Oct 26).
//
// D591: "it should take the actual intime/rally time right? not the nominal report timing". D592, "all 4 as
// recommended": (1) the earliest in-time or Rally that applies to the formation — the one the work-hours bar and the
// long-day warning already use (D505, D506); (2) the nominal report time where none is typed; (3) a report on the
// evening before (D503) lengthens the line's own day; (5) the day still runs first start to last end, breaks included.
// Until this build the span was always take-off less the Logic page's "Nominal report before T/O", and the wave's
// reporting lines were never read (engine/oil.ts — "a stated simplification").
//
// Bare day blobs through the engine's own walk, an exact answer per case. The published half — a day keeps the
// values its OIL went out with (D592 (4)) — is src/leavewar/oilworkstart-published.test.ts.
// Register: docs/superpowers/specs/2026-10-06-oil-work-start-register.md (OWS1–OWS5 here).

import { afterEach, describe, expect, it } from 'vitest'
import { dayOilCredits, dayOilSpans, dayOilWork, uniformOil } from './oil'
import { VCONF } from './rules'

const SAVE = { oilFullMin: VCONF.oilFullMin, reportLead: VCONF.reportLead, debrief: VCONF.debrief }
afterEach(() => Object.assign(VCONF, SAVE))

const jet = (p: string, w = '') => ({ p, w, area: '', rmks: '', opts: {} })
const line = (cs: string, to: string, ld: string, crew: any[], extra: any = {}) => ({ cs, msn: 'X', to, ld, br: '', aircraft: crew, ...extra })
const wave = (intimes: any[], ...formations: any[]) => ({ label: 'WAVE 1', intimes, formations })
const day = (waves: any[] = [], extra: any = {}) =>
  ({ waves, dutywaves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], ...extra })
const h = (hh: number, mm = 0) => hh * 60 + mm
/* his own worked Saturday (D592): take-off 12:00, landing 13:00, the day ending 15:00 */
const sat = (intimes: any[]) => day([wave(intimes, line('VL', '12:00', '13:00', [jet('bane')]))])

describe('OWS1 — the day starts at the earliest in-time / Rally that applies to the formation (D591, D592 (1))', () => {
  it('his worked Saturday: an in-time typed 08:30 makes 6h30, a full day — where the nominal 09:00 gives 6h, half a day', () => {
    expect(dayOilSpans(sat(['IN TIME 0830'])).bane).toEqual([[h(8, 30), h(15)]])
    expect(dayOilCredits(sat(['IN TIME 0830']))).toEqual({ bane: 1 })
    expect(dayOilSpans(sat([])).bane).toEqual([[h(9), h(15)]])
    expect(dayOilCredits(sat([]))).toEqual({ bane: 0.5 })
  })
  it('a Rally with no in-time is the report (D497)', () => {
    expect(dayOilSpans(sat(['RALLY 0845'])).bane).toEqual([[h(8, 45), h(15)]])
  })
  it('an in-time and a Rally: the EARLIER of the two stages, whichever line comes first', () => {
    expect(dayOilSpans(sat(['IN TIME 0830', 'RALLY 0900'])).bane).toEqual([[h(8, 30), h(15)]])
    expect(dayOilSpans(sat(['RALLY 0900', 'IN TIME 0830'])).bane).toEqual([[h(8, 30), h(15)]])
    /* a Rally typed before the in-time is a wrong pair the warning list names — the day still starts at the earlier */
    expect(dayOilSpans(sat(['IN TIME 0900', 'RALLY 0815'])).bane).toEqual([[h(8, 15), h(15)]])
  })
  it('"rally after in-time" with no clock of its own takes the in-time', () => {
    expect(dayOilSpans(sat(['IN TIME 0830', 'RALLY AFTER IN TIME'])).bane).toEqual([[h(8, 30), h(15)]])
  })
  it('a clock with no word is an in-time (the squadron\'s older lines)', () => {
    expect(dayOilSpans(sat(['0830'])).bane).toEqual([[h(8, 30), h(15)]])
    expect(dayOilSpans(sat(['08:30 WX/NOTAMS'])).bane).toEqual([[h(8, 30), h(15)]])
  })
  it('a line naming a formation is that formation\'s; the wave-wide line is everyone else\'s', () => {
    const d = day([wave(['IN TIME 0900', 'VL IN TIME 0800'],
      line('VL', '12:00', '13:00', [jet('bane')]),
      line('RAP', '12:00', '13:00', [jet('stiff')]))])
    expect(dayOilSpans(d).bane).toEqual([[h(8), h(15)]])
    expect(dayOilSpans(d).stiff).toEqual([[h(9), h(15)]])
  })
  it('a formation\'s own Rally does not cancel the wave\'s in-time — each activity apart, then the earlier (D505)', () => {
    const d = day([wave(['IN TIME 0830', 'VL RALLY 1000'], line('VL', '12:00', '13:00', [jet('bane')]))])
    expect(dayOilSpans(d).bane).toEqual([[h(8, 30), h(15)]])
    const e = day([wave(['RALLY 0830', 'VL IN TIME 1000'], line('VL', '12:00', '13:00', [jet('bane')]))])
    expect(dayOilSpans(e).bane).toEqual([[h(8, 30), h(15)]])
  })
  it('two lines for one formation and one activity: the earliest, in either order (D506)', () => {
    expect(dayOilSpans(sat(['IN TIME 0900', 'IN TIME 0830'])).bane).toEqual([[h(8, 30), h(15)]])
    expect(dayOilSpans(sat(['IN TIME 0830', 'IN TIME 0900'])).bane).toEqual([[h(8, 30), h(15)]])
  })
  it('a time typed LATER than the nominal one shortens the day — the actual time, not the nominal (D591)', () => {
    expect(dayOilSpans(sat(['IN TIME 1000'])).bane).toEqual([[h(10), h(15)]])
    /* and it can cost the full day: take-off 12:00, landing 13:30 — nominal 09:00–15:30 is 6h30, full; 10:00 is 5h30 */
    const d = (lines: any[]) => day([wave(lines, line('VL', '12:00', '13:30', [jet('bane')]))])
    expect(dayOilCredits(d([]))).toEqual({ bane: 1 })
    expect(dayOilCredits(d(['IN TIME 1000']))).toEqual({ bane: 0.5 })
  })
  it('both seats of every jet on the line take the line\'s start', () => {
    const d = day([wave(['IN TIME 0830'], line('VL', '12:00', '13:00', [jet('bane', 'stiff'), jet('plasma')]))])
    const s = dayOilSpans(d)
    expect([s.bane, s.stiff, s.plasma]).toEqual([[[h(8, 30), h(15)]], [[h(8, 30), h(15)]], [[h(8, 30), h(15)]]])
  })
  it('each wave reads its own lines — another wave\'s in-time is not this one\'s', () => {
    const d = day([wave(['IN TIME 0600'], line('RAP', '09:00', '10:00', [jet('stiff')])),
      wave([], line('VL', '12:00', '13:00', [jet('bane')]))])
    expect(dayOilSpans(d).stiff).toEqual([[h(6), h(12)]])
    expect(dayOilSpans(d).bane).toEqual([[h(9), h(15)]])
  })
})

describe('OWS2 — nothing typed, or nothing readable: the nominal report time (D592 (2))', () => {
  it('no line at all', () => {
    expect(dayOilSpans(sat([])).bane).toEqual([[h(9), h(15)]])
    expect(dayOilSpans(day([{ label: 'W', formations: [line('VL', '12:00', '13:00', [jet('bane')])] }])).bane).toEqual([[h(9), h(15)]])
  })
  it('the nominal time follows the Logic value, as before', () => {
    VCONF.reportLead = 150
    expect(dayOilSpans(sat([])).bane).toEqual([[h(9, 30), h(15)]])
  })
  it('a typed time is NOT moved by the Logic value', () => {
    VCONF.reportLead = 150
    expect(dayOilSpans(sat(['IN TIME 0830'])).bane).toEqual([[h(8, 30), h(15)]])
  })
  it('a line with no recognised clock, words only, or a rally with no in-time to follow', () => {
    for (const lines of [['IN TIME 25:90'], ['IN TIME + WX/NOTAMS'], ['RALLY AFTER IN TIME'], ['8h30 IN TIME'], [''], ['   ']])
      expect(dayOilSpans(sat(lines)).bane, JSON.stringify(lines)).toEqual([[h(9), h(15)]])
  })
  it('a line naming ANOTHER formation only', () => {
    const d = day([wave(['RAP IN TIME 0700'], line('VL', '12:00', '13:00', [jet('bane')]), line('RAP', '12:00', '13:00', [jet('stiff')]))])
    expect(dayOilSpans(d).bane).toEqual([[h(9), h(15)]])
    expect(dayOilSpans(d).stiff).toEqual([[h(7), h(15)]])
  })
  it('whatever a saved day holds in its lines, the walk does not break', () => {
    for (const lines of [[null], [undefined], [{}], [[]], [NaN], [true]] as any[])
      expect(dayOilSpans(sat(lines)).bane, JSON.stringify(lines)).toEqual([[h(9), h(15)]])
    expect(dayOilSpans(day([{ label: 'W', intimes: 'IN TIME 0830', formations: [line('VL', '12:00', '13:00', [jet('bane')])] }])).bane).toBeTruthy()
    expect(dayOilSpans(day([{ label: 'W', intimes: null, formations: [line('VL', '12:00', '13:00', [jet('bane')])] }])).bane).toEqual([[h(9), h(15)]])
  })
})

describe('OWS3 — a report on the evening before lengthens the line\'s own day (D592 (3), D503)', () => {
  it('a clock later than the take-off is the evening before', () => {
    const d = (lines: any[]) => day([wave(lines, line('VL', '01:00', '02:00', [jet('bane')]))])
    /* nominal: 22:00 the evening before to 04:00 — six hours, half a day */
    expect(dayOilSpans(d([])).bane).toEqual([[-120, h(4)]])
    expect(dayOilCredits(d([]))).toEqual({ bane: 0.5 })
    /* typed 21:00: seven hours, a full day, all of it this line's own day */
    expect(dayOilSpans(d(['IN TIME 2100'])).bane).toEqual([[-180, h(4)]])
    expect(dayOilCredits(d(['IN TIME 2100']))).toEqual({ bane: 1 })
  })
  it('an overnight line still earns on the day it sits on (D42)', () => {
    const d = day([wave(['IN TIME 2000'], line('VL', '23:00', '01:00', [jet('bane')]))])
    expect(dayOilSpans(d).bane).toEqual([[h(20), h(25) + 120]])
  })
})

describe('OWS4 — the day still runs from his first event to his last end, breaks included (D592 (5))', () => {
  it('an earlier event of his starts the day before the in-time', () => {
    const d = day([wave(['IN TIME 0830'], line('VL', '12:00', '13:00', [jet('bane')]))],
      { dutywaves: [{ label: 'Duty', rows: [{ role: 'SDO', id: 'bane', str: '0700', end: '0800' }] }] })
    expect(dayOilCredits(d)).toEqual({ bane: 1 })               // 07:00 → 15:00
  })
  it('a later event of his ends it after the debrief', () => {
    const d = day([wave(['IN TIME 1000'], line('VL', '12:00', '13:00', [jet('bane')]))],
      { ground: [{ prog: 'G', str: '1600', end: '1700', who: 'bane' }] })
    expect(dayOilCredits(d)).toEqual({ bane: 1 })               // 10:00 → 17:00
  })
  it('two sorties: the first one\'s report to the last one\'s debrief', () => {
    const d = day([wave(['IN TIME 0900'], line('VL', '10:00', '11:00', [jet('bane')])),
      wave(['IN TIME 1300'], line('VL', '14:00', '15:00', [jet('bane')]))])
    expect(dayOilSpans(d).bane).toEqual([[h(9), h(13)], [h(13), h(17)]])
    expect(dayOilCredits(d)).toEqual({ bane: 1 })
  })
})

describe('OWS5 — what did NOT change', () => {
  it('an SC shift is its written window — neither a reporting line nor its typed B box moves it', () => {
    const sc = { label: 'SC', kind: 'sc', standalone: true, noconf: false, intimes: ['IN TIME 0500'],
      formations: [{ cs: 'SC', msn: 'X', shift: 'AM', to: '08:00', ld: '14:00', br: '06:00', aircraft: [{ ...jet('bane'), spare: false, role: 'MAIN' }] }] }
    expect(dayOilSpans(day([sc])).bane).toEqual([[h(8), h(14)]])
  })
  it('AVALON and BB: the written window, and still off by default', () => {
    for (const kind of ['avalon', 'bb']) {
      const w = { label: kind.toUpperCase(), kind, standalone: true, noconf: true, intimes: ['IN TIME 0500'],
        formations: [line('AV', '07:00', '19:00', [jet('bane')])] }
      const work = dayOilWork(day([w]), { expandAll: () => [] })
      expect(work.bane.map(x => [x.s, x.e, x.dflt]), kind).toEqual([[h(7), h(19), false]])
    }
  })
  it('a nought-minute sortie still earns (D49), from its entered in-time', () => {
    const d = day([wave(['IN TIME 0600'], line('VL', '09:00', '09:00', [jet('bane')]))])
    expect(dayOilSpans(d).bane).toEqual([[h(6), h(11)]])
  })
  /* Astra's plan challenge, finding 4 (6 Oct 26) — considered, and the boundary left where it already was. D49's half
     day is the report before and the debrief after a sortie that itself measures nothing. Take both away and nothing is
     written to measure: that was already so with both Logic leads at zero, and it is the same answer when the entered
     report IS the take-off and the debrief setting is zero — "credit follows the times written", never a minimum
     (D31). With any debrief at all the line earns, as D49 says. Filed beside it: [OIL-ZERO-SPAN-SORTIE]. */
  it('a nought-minute sortie earns from its report and debrief — and measures nothing only when neither is there', () => {
    const d = (lines: any[]) => day([wave(lines, line('VL', '12:00', '12:00', [jet('bane')]))])
    expect(dayOilSpans(d(['IN TIME 1200'])).bane, 'reporting at take-off: the debrief still counts').toEqual([[h(12), h(14)]])
    expect(dayOilCredits(d(['IN TIME 1200']))).toEqual({ bane: 0.5 })
    VCONF.debrief = 0
    expect(dayOilSpans(d([])).bane, 'the nominal report alone').toEqual([[h(9), h(12)]])
    expect(dayOilSpans(d(['IN TIME 1200'])).bane, 'no report before it and no debrief after: nothing written to measure').toBeUndefined()
    VCONF.reportLead = 0
    expect(dayOilSpans(d([])).bane, 'the same boundary as before this build: both leads at zero').toBeUndefined()
  })
  it('a line with no readable take-off or landing earns nothing, whatever its lines say', () => {
    for (const [to, ld] of [['', '13:00'], ['12:00', ''], ['', ''], ['x', 'y']])
      expect(dayOilSpans(day([wave(['IN TIME 0830'], line('VL', to!, ld!, [jet('bane')]))])).bane, `${to}|${ld}`).toBeUndefined()
  })
  it('a cancelled line and a cancelled jet earn nothing', () => {
    expect(dayOilSpans(day([wave(['IN TIME 0830'], line('VL', '12:00', '13:00', [jet('bane')], { cx: true }))])).bane).toBeUndefined()
    const d = day([wave(['IN TIME 0830'], line('VL', '12:00', '13:00', [{ ...jet('bane'), cx: true }, jet('stiff')]))])
    expect(dayOilSpans(d).bane).toBeUndefined()
    expect(dayOilSpans(d).stiff).toEqual([[h(8, 30), h(15)]])
  })
  it('sims, duty, ground and Common Programme rows are their written times', () => {
    const d = day([wave(['IN TIME 0500'])], {
      dutywaves: [{ label: 'Duty', rows: [{ role: 'SDO', id: 'bane', str: '0800', end: '1400' }] }],
      sims: { amt: [{ label: 'S', str: '1300', end: '1500', p: 'stiff' }], oft: [] },
      ground: [{ prog: 'G', str: '0900', end: '1000', who: 'plasma' }],
      allhands: [{ prog: 'A', rid: 'a1', str: '1000', end: '1100', who: ['rocky'] }] })
    const s = dayOilSpans(d)
    expect([s.bane, s.stiff, s.plasma, s.rocky]).toEqual([[[h(8), h(14)]], [[h(13), h(15)]], [[h(9), h(10)]], [[h(10), h(11)]]])
  })
  it('the debrief end and the full-day line still follow their Logic values on a working day', () => {
    VCONF.debrief = 150
    expect(dayOilSpans(sat(['IN TIME 0830'])).bane).toEqual([[h(8, 30), h(15, 30)]])
    VCONF.oilFullMin = 8 * 60
    expect(dayOilCredits(sat(['IN TIME 0830']))).toEqual({ bane: 0.5 })
  })
})

describe('OWS6 — the walk can be handed the values a published day kept (the engine half of D592 (4))', () => {
  const kept = { reportLead: 180, debrief: 120, oilFullMin: 361 }
  it('kept values outrank today\'s: the nominal start and the debrief end', () => {
    VCONF.reportLead = 150; VCONF.debrief = 60
    expect(dayOilSpans(sat([])).bane).toEqual([[h(9, 30), h(14)]])
    expect(dayOilWork(sat([]), { rv: kept }).bane.map(x => [x.s, x.e])).toEqual([[h(9), h(15)]])
  })
  it('the threshold can be handed in too', () => {
    VCONF.oilFullMin = 300
    expect(uniformOil(360)).toBe(1)
    expect(uniformOil(360, kept.oilFullMin)).toBe(0.5)
    expect(uniformOil(0, kept.oilFullMin)).toBe(0)
  })
  it('with nothing handed in, today\'s values are read — as before', () => {
    expect(dayOilWork(sat([]), {}).bane.map(x => [x.s, x.e])).toEqual([[h(9), h(15)]])
    expect(dayOilWork(sat([]), { rv: null as any }).bane.map(x => [x.s, x.e])).toEqual([[h(9), h(15)]])
  })
})
