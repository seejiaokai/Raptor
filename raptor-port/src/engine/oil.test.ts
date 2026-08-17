// Wire 4's credit computation (engine/oil.ts): how much OIL a day's SC
// shifts and duty rows earn each person, BEFORE anyone asks whether the day
// is non-working — that half of the rule (weekend, PH flag, 'off' event) is
// Leave War's answer and is tested with the sync pass in
// src/leavewar/oilsync.test.ts. Owner's rule, 17 Aug 26: an SC AM or PM
// shift is half a day, more than that a full one; any other duty goes by
// its written hours, six or more being a full day.

import { afterEach, describe, expect, it } from 'vitest'
import { dayOilCredits, scShiftCredit } from './oil'
import { VCONF } from './rules'
import { PEOPLE } from './people'

const SAVE = { oilFullMin: VCONF.oilFullMin, scDayFrom: VCONF.scDayFrom, scDayTo: VCONF.scDayTo }
afterEach(() => Object.assign(VCONF, SAVE))

const main = (p: string, w = '') => ({ p, w, area: '', rmks: '', opts: {}, spare: false, role: 'MAIN' })
const spare = (p: string) => ({ p, w: '', area: '', rmks: '', opts: {}, spare: true, role: 'SPARE' })
const shift = (to: string, ld: string, aircraft: any[]) =>
  ({ cs: 'SC', msn: 'X', shift: 'X', to, ld, aircraft })
const scWave = (...formations: any[]) =>
  ({ label: 'SC', kind: 'sc', standalone: true, noconf: false, formations })
const day = (waves: any[] = [], rows: any[] = []) =>
  ({ waves, dutywaves: rows.length ? [{ label: 'Duty', rows }] : [], sims: { amt: [], oft: [] }, ground: [] })
const duty = (id: string, str: string, end: string) => ({ role: 'SDO', id, str, end })

describe('scShiftCredit — AM and PM are the halves, anything more is a day', () => {
  it('the minted AM and PM shifts are each half a day', () => {
    expect(scShiftCredit(7 * 60, 13 * 60)).toBe(0.5)   // AM 07:00–13:00
    expect(scShiftCredit(13 * 60, 19 * 60)).toBe(0.5)  // PM 13:00–19:00
  })

  it('the whole day window is a full day', () => {
    expect(scShiftCredit(7 * 60, 19 * 60)).toBe(1)
  })

  it('a night shift reaching outside the window is a full day, not a PM half', () => {
    expect(scShiftCredit(19 * 60, 7 * 60)).toBe(1)     // 19:00–07:00, wraps midnight
  })

  it('a shift spanning the midpoint is more than a half', () => {
    expect(scShiftCredit(8 * 60, 14 * 60)).toBe(1)     // 08:00–14:00 crosses 13:00
  })

  it('unreadable times measure nothing', () => {
    expect(scShiftCredit(null, 13 * 60)).toBeNull()
    expect(scShiftCredit(7 * 60, null)).toBeNull()
  })

  it('the halves move with the SC day window, not the clock', () => {
    VCONF.scDayFrom = 6 * 60; VCONF.scDayTo = 22 * 60  // midpoint now 14:00
    expect(scShiftCredit(6 * 60, 14 * 60)).toBe(0.5)   // the new AM half
    expect(scShiftCredit(7 * 60, 13 * 60)).toBe(0.5)   // inside it too
    expect(scShiftCredit(13 * 60, 15 * 60)).toBe(1)    // crosses the new midpoint
  })
})

describe('dayOilCredits — who earns what from one day blob', () => {
  it('an SC MAIN seat earns the shift credit, both cockpits', () => {
    const d = day([scWave(shift('07:00', '13:00', [main('plasma', 'rocky')]))])
    expect(dayOilCredits(d)).toEqual({ plasma: 0.5, rocky: 0.5 })
  })

  it('an SC SPARE earns nothing — he is standing by at home', () => {
    const d = day([scWave(shift('07:00', '19:00', [main('plasma'), spare('rocky')]))])
    expect(dayOilCredits(d)).toEqual({ plasma: 1 })
  })

  it('standing both halves sums to a full day', () => {
    const d = day([scWave(
      shift('07:00', '13:00', [main('plasma')]),
      shift('13:00', '19:00', [main('plasma')]),
    )])
    expect(dayOilCredits(d)).toEqual({ plasma: 1 })
  })

  it('a non-standalone wave earns nothing here — flying is not duty', () => {
    const d = day([{ label: 'VL', formations: [shift('07:00', '19:00', [main('plasma')])] }])
    expect(dayOilCredits(d)).toEqual({})
  })

  it('a duty row goes by its written hours: six or more is a full day', () => {
    expect(dayOilCredits(day([], [duty('plasma', '0800', '1800')]))).toEqual({ plasma: 1 })   // 10h
    expect(dayOilCredits(day([], [duty('plasma', '0800', '1400')]))).toEqual({ plasma: 1 })   // 6h exactly
    expect(dayOilCredits(day([], [duty('plasma', '0800', '1200')]))).toEqual({ plasma: 0.5 }) // 4h
  })

  it('hours are summed per person before the line is drawn', () => {
    const d = day([], [duty('plasma', '0800', '1100'), duty('plasma', '1400', '1700')])  // 3h + 3h
    expect(dayOilCredits(d)).toEqual({ plasma: 1 })
  })

  it('an overnight duty counts its real length', () => {
    expect(dayOilCredits(day([], [duty('plasma', '2000', '0200')]))).toEqual({ plasma: 1 })  // 6h across midnight
  })

  it('a row with no readable times mints nothing — the credit follows what was written', () => {
    expect(dayOilCredits(day([], [duty('plasma', '0800', '')]))).toEqual({})
    expect(dayOilCredits(day([], [duty('plasma', '', '')]))).toEqual({})
    expect(dayOilCredits(day([], [duty('plasma', '0800', '0800')]))).toEqual({})
  })

  it('SC plus a duty caps at one day — a day worked, not a day and a half', () => {
    const d = day(
      [scWave(shift('07:00', '13:00', [main('plasma')]))],
      [duty('plasma', '1400', '1700')],
    )
    expect(dayOilCredits(d)).toEqual({ plasma: 1 })
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
})
