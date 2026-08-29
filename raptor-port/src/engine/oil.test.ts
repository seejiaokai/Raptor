// Wire 4's credit computation (engine/oil.ts): how much OIL a day's work
// earns each person, BEFORE anyone asks whether the day is non-working —
// that half of the rule (weekend, PH flag, 'off' event) is Leave War's
// answer and is tested with the sync pass in src/leavewar/oilsync.test.ts.
// Owner's rule, REWRITTEN 28 Aug 26, measure corrected 29 Aug 26: ONE law
// for every source — a person's worked minutes are the ENVELOPE of their
// day, first start to last end with the gaps included ("even tho there's
// nothing, they are still in squadron"), over flying report→land+debrief,
// SC shifts, sims, duties, ground and Common Programme by written times.
// Six hours or less is HO (0.5), more than six is FO (1). The old SC
// shift-window rule (AM/PM halves, midpoint, night clause) is deleted.

import { afterEach, describe, expect, it } from 'vitest'
import { dayOilCredits, dayOilSpans, envMin, uniformOil, inputOilAmt } from './oil'
import { VCONF } from './rules'
import { PEOPLE } from './people'

const SAVE = { oilFullMin: VCONF.oilFullMin, reportLead: VCONF.reportLead, debrief: VCONF.debrief }
afterEach(() => Object.assign(VCONF, SAVE))

const main = (p: string, w = '') => ({ p, w, area: '', rmks: '', opts: {}, spare: false, role: 'MAIN' })
const spare = (p: string) => ({ p, w: '', area: '', rmks: '', opts: {}, spare: true, role: 'SPARE' })
const shift = (to: string, ld: string, aircraft: any[]) =>
  ({ cs: 'SC', msn: 'X', shift: 'X', to, ld, aircraft })
const scWave = (...formations: any[]) =>
  ({ label: 'SC', kind: 'sc', standalone: true, noconf: false, formations })
const flyWave = (...formations: any[]) => ({ label: 'VL', formations })
const day = (waves: any[] = [], rows: any[] = [], extra: any = {}) =>
  ({ waves, dutywaves: rows.length ? [{ label: 'Duty', rows }] : [], sims: { amt: [], oft: [] }, ground: [], allhands: [], ...extra })
const duty = (id: string, str: string, end: string) => ({ role: 'SDO', id, str, end })

describe('envMin / uniformOil / inputOilAmt — the shared arithmetic', () => {
  it('the day is an ENVELOPE — first start to last end, gaps included (owner, 29 Aug 26)', () => {
    expect(envMin([[480, 720], [540, 600]])).toBe(240)              // a contained row extends nothing
    expect(envMin([[480, 600], [600, 720]])).toBe(240)              // abutting spans chain
    expect(envMin([[480, 600], [720, 780]])).toBe(300)              // the 2h gap COUNTS — 0800→1300, not 3h summed
    expect(envMin([[420, 480], [720, 780]])).toBe(360)              // the owner's own example: 7-8am + 12-1pm = a 6h day
    expect(envMin([])).toBe(0)
  })
  it('uniformOil: nothing / half at six hours / full past it, off the editable rule', () => {
    expect(uniformOil(0)).toBe(0)
    expect(uniformOil(360)).toBe(0.5)
    expect(uniformOil(361)).toBe(1)
    VCONF.oilFullMin = 8 * 60
    expect(uniformOil(361)).toBe(0.5)
    expect(uniformOil(480)).toBe(1)
  })
  it('inputOilAmt: all-day is a full day (owner, 28 Aug 26), a timed record by its length', () => {
    expect(inputOilAmt(true, null, null)).toBe(1)
    expect(inputOilAmt(false, 8 * 60, 14 * 60)).toBe(0.5)           // 6h exactly — half
    expect(inputOilAmt(false, 8 * 60, 14 * 60 + 1)).toBe(1)         // 6h01 — the owner's line
    expect(inputOilAmt(false, 20 * 60, 2 * 60 + 1)).toBe(1)         // overnight rolls, 6h01
    expect(inputOilAmt(false, null, 14 * 60)).toBeNull()            // unreadable asks nothing
    expect(inputOilAmt(false, 8 * 60, 8 * 60)).toBeNull()           // zero length measures nothing
  })
})

describe('dayOilCredits — who earns what from one day blob', () => {
  it('an SC MAIN seat earns by its shift hours, both cockpits — 6h is a half', () => {
    const d = day([scWave(shift('07:00', '13:00', [main('plasma', 'rocky')]))])
    expect(dayOilCredits(d)).toEqual({ plasma: 0.5, rocky: 0.5 })
  })

  it('an SC shift crossing the old midpoint is judged by HOURS now, not the window shape', () => {
    // 10:00–16:00 spanned the 13:00 midpoint and read FULL under the deleted
    // SC-window rule; it is six hours of work, so it is a HALF. Pinned so the
    // old rule cannot creep back.
    const d = day([scWave(shift('10:00', '16:00', [main('plasma')]))])
    expect(dayOilCredits(d)).toEqual({ plasma: 0.5 })
  })

  it('an SC SPARE earns nothing — he is standing by at home', () => {
    const d = day([scWave(shift('07:00', '19:00', [main('plasma'), spare('rocky')]))])
    expect(dayOilCredits(d)).toEqual({ plasma: 1 })
  })

  it('standing both halves pools to a full day', () => {
    const d = day([scWave(
      shift('07:00', '13:00', [main('plasma')]),
      shift('13:00', '19:00', [main('plasma')]),
    )])
    expect(dayOilCredits(d)).toEqual({ plasma: 1 })
  })

  it('a FLYING seat earns its working day: report to land plus debrief (owner, 28 Aug 26)', () => {
    // T-O 10:00, LD 11:00 → 07:00–13:00 with the standard 3h report / 2h
    // debrief pads = exactly six hours = HALF; a second sortie tips it over.
    const one = day([flyWave(shift('10:00', '11:00', [main('plasma')]))])
    expect(dayOilCredits(one)).toEqual({ plasma: 0.5 })
    const two = day([flyWave(
      shift('10:00', '11:00', [main('plasma')]),
      shift('13:30', '14:30', [main('plasma')]),
    )])
    expect(dayOilCredits(two)).toEqual({ plasma: 1 })
  })

  it('AVALON and BB earn nothing — seats AND the desks they bring', () => {
    const av = { label: 'AVALON', kind: 'avalon', standalone: true, noconf: true,
      formations: [shift('07:00', '19:00', [main('plasma')])] }
    const desk = { label: 'AVALON duties', sa: 'avalon', rows: [duty('rocky', '0700', '1900')] }
    const d = { waves: [av], dutywaves: [desk], sims: { amt: [], oft: [] }, ground: [], allhands: [] }
    expect(dayOilCredits(d)).toEqual({})
  })

  it('a SIM row earns by its written times — seats, pax and extras alike', () => {
    const d = day([], [], { sims: { amt: [{ label: 'AMT', str: '0800', end: '1200', p: 'plasma', w: 'rocky' }],
      oft: [{ label: 'OFT', str: '0900', end: '1000', pax: ['divot'] }] } })
    expect(dayOilCredits(d)).toEqual({ plasma: 0.5, rocky: 0.5, divot: 0.5 })
  })

  it('a GROUND row earns by its written times — but an input-derived row (src) never auto-earns', () => {
    const d = day([], [], { ground: [
      { prog: 'Servicing', str: '0800', end: '1200', who: 'plasma' },
      { prog: 'Dental', str: '0800', end: '1200', who: 'rocky', src: 'k|x' },
    ] })
    expect(dayOilCredits(d)).toEqual({ plasma: 0.5 })
  })

  it('a COMMON PROGRAMME row earns by its written times, who as string or array', () => {
    const d = day([], [], { allhands: [
      { prog: 'Town hall', str: '0900', end: '1000', who: ['plasma', 'rocky'] },
      { prog: 'Brief', str: '1000', end: '1100', who: 'divot' },
    ] })
    expect(dayOilCredits(d)).toEqual({ plasma: 0.5, rocky: 0.5, divot: 0.5 })
  })

  it('an overlapping row inside the envelope changes nothing — the same hour never pays twice', () => {
    const d = day([], [duty('plasma', '0800', '1200')], { allhands: [
      { prog: 'Brief', str: '0900', end: '1000', who: 'plasma' },
    ] })
    expect(dayOilCredits(d)).toEqual({ plasma: 0.5 })   // envelope 0800→1200 = 4h
  })

  it('the gap between two commitments counts — he was in squadron the whole time (owner, 29 Aug 26)', () => {
    // 7-8am + 12-1pm: an hour of work twice, but a 0700→1300 day — exactly
    // six hours, which the owner re-confirmed is still a HALF.
    const six = day([], [duty('plasma', '0700', '0800'), duty('plasma', '1200', '1300')])
    expect(dayOilCredits(six)).toEqual({ plasma: 0.5 })
    // one minute past six hours tips it to a FULL day
    const over = day([], [duty('plasma', '0700', '0800'), duty('plasma', '1201', '1301')])
    expect(dayOilCredits(over)).toEqual({ plasma: 1 })
  })

  it('an ALL / ALL AVAIL sentinel on a programme or ground row expands via the resolver, or drops without one', () => {
    const d = day([], [], { allhands: [{ prog: 'All hands', str: '0800', end: '1200', who: 'all' }],
      ground: [{ prog: 'Sweep', str: '1300', end: '1400', who: 'allavail' }] })
    expect(dayOilCredits(d)).toEqual({})               // no resolver: sentinel drops, as ever
    const seen: any[] = []
    const credits = dayOilCredits(d, { expandAll: (win) => { seen.push(win); return ['plasma'] } })
    expect(credits).toEqual({ plasma: 0.5 })           // envelope 0800→1400 = 6h exactly — half
    /* ground rows are walked before allhands — the order is the walker's, not the day's */
    expect(seen.sort((a, b) => a[0] - b[0])).toEqual([[480, 720], [780, 840]])
  })

  it('a duty row goes by its written hours: MORE than six is a full day, six exactly is half', () => {
    expect(dayOilCredits(day([], [duty('plasma', '0800', '1800')]))).toEqual({ plasma: 1 })   // 10h
    expect(dayOilCredits(day([], [duty('plasma', '0800', '1401')]))).toEqual({ plasma: 1 })   // 6h01 — the owner's line
    expect(dayOilCredits(day([], [duty('plasma', '0800', '1400')]))).toEqual({ plasma: 0.5 }) // 6h exactly is a HALF
    expect(dayOilCredits(day([], [duty('plasma', '0800', '1200')]))).toEqual({ plasma: 0.5 }) // 4h
  })

  it('every commitment stretches one envelope per person before the line is drawn', () => {
    const d = day([], [duty('plasma', '0800', '1200'), duty('plasma', '1400', '1701')])  // 0800→1701 = 9h01
    expect(dayOilCredits(d)).toEqual({ plasma: 1 })
  })

  it('an overnight duty counts its real length', () => {
    expect(dayOilCredits(day([], [duty('plasma', '2000', '0201')]))).toEqual({ plasma: 1 })    // 6h01 across midnight
    expect(dayOilCredits(day([], [duty('plasma', '2000', '0200')]))).toEqual({ plasma: 0.5 })  // 6h exactly — half, not a negative-length skip
  })

  it('a row with no readable times mints nothing — the credit follows what was written', () => {
    expect(dayOilCredits(day([], [duty('plasma', '0800', '')]))).toEqual({})
    expect(dayOilCredits(day([], [duty('plasma', '', '')]))).toEqual({})
    expect(dayOilCredits(day([], [duty('plasma', '0800', '0800')]))).toEqual({})
  })

  it('SC plus a duty pools to one day — a day worked, not a day and a half', () => {
    const d = day(
      [scWave(shift('07:00', '13:00', [main('plasma')]))],
      [duty('plasma', '1400', '1700')],
    )
    expect(dayOilCredits(d)).toEqual({ plasma: 1 })   // envelope 0700→1700 = 10h
  })

  it('a name the roster does not hold earns nothing', () => {
    expect(dayOilCredits(day([], [duty('zzznot', '0800', '1800')]))).toEqual({})
  })

  it('a CANCELLED duty row or SC line earns nothing — a CX\'d duty did not stand', () => {
    expect(dayOilCredits(day([], [{ ...duty('plasma', '0800', '1800'), cx: 1 }]))).toEqual({})
    const cxForm = day([scWave({ ...shift('07:00', '19:00', [main('plasma')]), cx: 1 })])
    expect(dayOilCredits(cxForm)).toEqual({})
    const cxRow = day([scWave(shift('07:00', '19:00', [{ ...main('plasma'), cx: 1 }, main('rocky')]))])
    expect(dayOilCredits(cxRow)).toEqual({ rocky: 1 })
  })

  it('a duty row\'s more[] extras earn its hours like the primary — they stand the same duty', () => {
    const d = day([], [{ ...duty('plasma', '0800', '1800'), more: ['rocky'] }])
    expect(dayOilCredits(d)).toEqual({ plasma: 1, rocky: 1 })
  })

  it('a callsign resolves to its person like every other joint', () => {
    const cs = PEOPLE.plasma.cs
    expect(dayOilCredits(day([], [duty(cs, '0800', '1800')]))).toEqual({ plasma: 1 })
  })

  it('the full-day line is the editable rule, not a constant', () => {
    VCONF.oilFullMin = 8 * 60
    expect(dayOilCredits(day([], [duty('plasma', '0800', '1400')]))).toEqual({ plasma: 0.5 }) // 6h now under the line
    expect(dayOilCredits(day([], [duty('plasma', '0800', '1600')]))).toEqual({ plasma: 1 })   // 8h makes it
  })

  it('dayOilSpans exposes the pooled windows the credits are drawn from', () => {
    const d = day([], [duty('plasma', '0800', '1200'), duty('plasma', '1400', '1700')])
    expect(dayOilSpans(d)).toEqual({ plasma: [[480, 720], [840, 1020]] })
  })
})
