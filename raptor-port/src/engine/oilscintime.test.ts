// AN SC SHIFT'S TYPED B — ITS IN-TIME — COUNTS AS WORK AND EARNS OIL (owner, D606, 7 Oct 26).
//
// "It rarely happens but SC B if filled u can count it as work hours as well and OIL earned." — his answer to the
// [OIL-WORK-START] report, which had built the opposite as the agent's own reading ("he said a flying line").
//
// On the board an SC line's B box is the crew's in-time (owner, 24 Aug 26): crew rest and the long-work-day note have
// read it since then (engine/scintime.test.ts). OIL did not — an SC MAIN on 07:00–13:00 called in at 06:00 earned six
// hours, half a day, where he worked seven. Now the shift's OIL span starts at the EARLIER of the B and the written
// start; a blank B, AVALON and BB are their written window, as before.
// Bare day blobs through the engine's own walk, an exact answer per case. The published half is in
// src/leavewar/oilworkstart-published.test.ts. Register: docs/superpowers/specs/2026-10-06-oil-work-start-behaviour-register.md (OWS12).

import { afterEach, describe, expect, it } from 'vitest'
import { dayOilCredits, dayOilSpans, dayOilWork } from './oil'
import { makeStandalone } from './waves'
import { seatIntime } from './events'
import { VCONF } from './rules'

const SAVE = { oilFullMin: VCONF.oilFullMin, reportLead: VCONF.reportLead, debrief: VCONF.debrief }
afterEach(() => Object.assign(VCONF, SAVE))

const h = (hh: number, mm = 0) => hh * 60 + mm
const day = (waves: any[] = [], extra: any = {}) =>
  ({ waves, dutywaves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], ...extra })
/* the app's own SC wave — two shifts, each two MAIN rows then two SPARE rows — with the first shift re-timed and
   Bane on its first MAIN row (and, where asked, Stiff on its first SPARE row) */
const sc = (to: string, ld: string, br?: any, spare = false) => {
  const w: any = makeStandalone('sc')
  const f = w.formations[0]
  f.to = to; f.ld = ld
  if (br !== undefined) f.br = br
  f.aircraft[0].p = 'bane'
  if (spare) f.aircraft[2].p = 'stiff'
  w.formations.length = 1
  return w
}
const spans = (w: any) => dayOilSpans(day([w]))

describe('OWS12 — an SC shift with its B (in-time) filled earns OIL from that in-time (D606)', () => {
  it('his case: an SC MAIN on 07:00–13:00 called in at 06:00 — seven hours, a full day, where six was half', () => {
    expect(spans(sc('07:00', '13:00')).bane).toEqual([[h(7), h(13)]])
    expect(dayOilCredits(day([sc('07:00', '13:00')]))).toEqual({ bane: 0.5 })
    expect(spans(sc('07:00', '13:00', '06:00')).bane).toEqual([[h(6), h(13)]])
    expect(dayOilCredits(day([sc('07:00', '13:00', '06:00')]))).toEqual({ bane: 1 })
  })
  it('every way the box takes a time gives the same start', () => {
    for (const b of ['06:00', '0600', '600', '6:00'])
      expect(spans(sc('07:00', '13:00', b)).bane, b).toEqual([[h(6), h(13)]])
  })
  it('a blank B, or one the app cannot read as a time: the written start, as before', () => {
    for (const b of ['', '   ', 'abc', null, undefined, 42, {}])
      expect(spans(sc('07:00', '13:00', b)).bane, JSON.stringify(b)).toEqual([[h(7), h(13)]])
    /* "25:90" is another case (Sol's read): the engine's parser does not refuse it — the board's box does, at the door
       (walk E07: "25:90 is not a time") — so here it is a LATER clock, and shortens nothing for that reason */
    expect(spans(sc('07:00', '13:00', '25:90')).bane).toEqual([[h(7), h(13)]])
  })
  it('a B typed LATER than the shift\'s start shortens nothing; one equal to it changes nothing', () => {
    expect(spans(sc('07:00', '13:00', '08:00')).bane).toEqual([[h(7), h(13)]])
    expect(spans(sc('07:00', '13:00', '07:00')).bane).toEqual([[h(7), h(13)]])
    expect(spans(sc('07:00', '13:00', '13:30')).bane).toEqual([[h(7), h(13)]])
  })
  it('a shift that starts just after midnight, its B on the evening before: its own day grows, read as crew rest reads it', () => {
    /* 01:00–07:00 is inside the nominal lead of midnight, so a B of 23:00 is the evening before (the bounded rule the
       crew-rest check has used since 24 Aug 26): eight hours, a full day, all on the shift's own day */
    expect(spans(sc('01:00', '07:00', '23:00')).bane).toEqual([[-60, h(7)]])
    expect(dayOilCredits(day([sc('01:00', '07:00', '23:00')]))).toEqual({ bane: 1 })
    /* a daytime shift is never rolled back: 23:00 against 08:00 is just a later clock, and shortens nothing */
    expect(spans(sc('08:00', '14:00', '23:00')).bane).toEqual([[h(8), h(14)]])
  })
  it('that evening-before reading follows the Logic value HANDED IN — a published day\'s own — not today\'s', () => {
    const w = sc('01:00', '07:00', '23:00')
    VCONF.reportLead = 30                                    // today: 01:00 is no longer "within the lead of midnight"
    expect(spans(w).bane).toEqual([[h(1), h(7)]])
    const kept = dayOilWork(day([w]), { expandAll: () => [], rv: { reportLead: 180, debrief: 120, oilFullMin: 361 } })
    expect(kept.bane.map(x => [x.s, x.e])).toEqual([[-60, h(7)]])
  })
  it('an overnight shift with an earlier B: from the B, through midnight', () => {
    expect(spans(sc('19:00', '07:00', '18:00')).bane).toEqual([[h(18), h(31)]])
  })
  it('a shift whose written start and end are the same still measures nothing, whatever its B', () => {
    expect(spans(sc('07:00', '07:00', '06:00')).bane).toBeUndefined()
  })
  it('a shift with no readable start or end earns nothing from a B alone', () => {
    expect(spans(sc('', '13:00', '06:00')).bane).toBeUndefined()
    expect(spans(sc('07:00', '', '06:00')).bane).toBeUndefined()
  })
  /* "A SPARE reports nowhere, so his B does nothing" (the Logic page, 24 Aug 26): the B is the MAIN's in-time. A SPARE
     still earns nothing by default (D24), and one an admin switches on earns the shift's WRITTEN hours. */
  it('MAIN only — a SPARE on the same shift is off by default, and its window is the written one, not the B', () => {
    const work = dayOilWork(day([sc('07:00', '13:00', '06:00', true)]), { expandAll: () => [] })
    expect(work.bane.map(x => [x.s, x.e, x.dflt])).toEqual([[h(6), h(13), true]])
    expect(work.stiff.map(x => [x.s, x.e, x.dflt])).toEqual([[h(7), h(13), false]])
  })
  /* a DAYTIME shift: the lead's one part in an SC shift's day is the evening-before reading, two tests above */
  it('the two Logic times do not move a daytime shift: an SC shift has no nominal report and no debrief', () => {
    VCONF.reportLead = 60; VCONF.debrief = 300
    expect(spans(sc('07:00', '13:00', '06:00')).bane).toEqual([[h(6), h(13)]])
    expect(spans(sc('07:00', '13:00')).bane).toEqual([[h(7), h(13)]])
  })
  it('the wave\'s reporting lines are still not an SC shift\'s (only its own B box is)', () => {
    const w = sc('07:00', '13:00'); w.intimes = ['IN TIME 0500']
    expect(spans(w).bane).toEqual([[h(7), h(13)]])
  })
  it('AVALON and BB: a time in the B box moves nothing — theirs was never an in-time (24 Aug 26)', () => {
    for (const kind of ['avalon', 'bb']) {
      const w: any = makeStandalone(kind)
      const f = w.formations[0]
      f.to = '07:00'; f.ld = '19:00'; f.br = '05:00'; f.aircraft[0].p = 'bane'
      w.formations.length = 1
      const work = dayOilWork(day([w]), { expandAll: () => [] })
      expect(work.bane.map(x => [x.s, x.e, x.dflt]), kind).toEqual([[h(7), h(19), false]])
    }
  })
  it('his day still runs first start to last end: a B before his other event starts the day, one after it does not', () => {
    const desk = (str: string, end: string) => ({ dutywaves: [{ label: 'Duty', rows: [{ role: 'SDO', id: 'bane', str, end }] }] })
    expect(dayOilSpans(day([sc('07:00', '13:00', '06:00')], desk('14:00', '16:00'))).bane).toEqual([[h(6), h(13)], [h(14), h(16)]])
    expect(dayOilCredits(day([sc('07:00', '13:00', '06:00')], desk('14:00', '16:00')))).toEqual({ bane: 1 })   // 06:00–16:00
    expect(dayOilCredits(day([sc('07:00', '13:00', '06:00')], desk('05:00', '05:30')))).toEqual({ bane: 1 })   // 05:00–13:00
    /* …and a case only the START-TO-FINISH measure answers this way (Astra's read): a three-hour shift and a one-hour
       desk are four hours summed; from the written start to the desk's end, five and a half; from the B, six and a half */
    expect(dayOilCredits(day([sc('07:00', '10:00')], desk('11:30', '12:30')))).toEqual({ bane: 0.5 })
    expect(dayOilCredits(day([sc('07:00', '10:00', '06:00')], desk('11:30', '12:30')))).toEqual({ bane: 1 })
  })
})

/* The cases the two readers of this change ranked for the host (7 Oct 26 — both PASS; these close their test limits). */
describe('OWS12 — the readers\' cases', () => {
  const rows = (w: any, who: string) => (dayOilWork(day([w]), { expandAll: () => [] })[who] || []).map((x: any) => [x.s, x.e, x.dflt])
  it('a SPARE marked on the FORMATION, with no mark on its rows, keeps the written window too', () => {
    const w = sc('07:00', '13:00', '06:00')
    w.formations[0].spare = true
    w.formations[0].aircraft.forEach((a: any) => { a.spare = false })
    expect(rows(w, 'bane')).toEqual([[h(7), h(13), false]])
  })
  it('the evening-before reading starts strictly INSIDE the lead: 03:00 under a 3h lead is not rolled back; under 3h01 it is', () => {
    const w = sc('03:00', '09:00', '23:00')
    expect(spans(w).bane).toEqual([[h(3), h(9)]])
    expect(dayOilCredits(day([w]))).toEqual({ bane: 0.5 })
    VCONF.reportLead = 181
    expect(spans(w).bane).toEqual([[-60, h(9)]])
    expect(dayOilCredits(day([w]))).toEqual({ bane: 1 })
  })
  it('a handed-in lead of ZERO is a value, not "none": no evening-before reading — while crew rest, on today\'s 3h, still reads one', () => {
    const w = sc('01:00', '07:00', '23:00')
    const kept = dayOilWork(day([w]), { expandAll: () => [], rv: { reportLead: 0, debrief: 120, oilFullMin: 361 } })
    expect(kept.bane.map(x => [x.s, x.e])).toEqual([[h(1), h(7)]])
    expect(seatIntime(w, w.formations[0], h(1))).toBe(-60)
  })
  it('the PM shift, both MAIN rows and a SPARE: each MAIN from the B, the SPARE from the written start', () => {
    const w: any = makeStandalone('sc')
    const f = w.formations[1]                                  // PM, 13:00–19:00
    f.br = '12:00'; f.aircraft[0].p = 'bane'; f.aircraft[1].p = 'split'; f.aircraft[2].p = 'stiff'
    expect(rows(w, 'bane')).toEqual([[h(12), h(19), true]])
    expect(rows(w, 'split')).toEqual([[h(12), h(19), true]])
    expect(rows(w, 'stiff')).toEqual([[h(13), h(19), false]])
  })
  it('a cancelled shift earns nothing; a cancelled row earns its man nothing and leaves the other MAIN his in-time', () => {
    const a = sc('07:00', '13:00', '06:00'); a.formations[0].cx = true
    expect(spans(a).bane).toBeUndefined()
    const b = sc('07:00', '13:00', '06:00'); b.formations[0].aircraft[0].cx = true; b.formations[0].aircraft[1].p = 'split'
    expect(spans(b).bane).toBeUndefined()
    expect(spans(b).split).toEqual([[h(6), h(13)]])
  })
})
