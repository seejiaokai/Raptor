/* The medical tracker's derivations and trim planners (owner, 27 Aug 26).
   Pure functions over INPUTS — these tests plant rows directly and restore
   the array after each, the suite's pristine-INPUTS idiom. Ordinals are the
   dateOrd form y*10000+m*100+d; every planted row carries an explicit yr
   anchor so nothing here leans on the loaded week. */
import { afterEach, describe, expect, it } from 'vitest'
import { INPUTS } from './inputs'
import { ordShift, ordLabel, medStartOrd, medEndOrd, medDownAsOf, pendingUpchits, upchitsWithin, upchitTrimPlan, newMedTrimPlan } from './medical'

const ISNAP = JSON.stringify(INPUTS)
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)) })

const med = (person: string, type: string, date: string, endDate?: string, yr = 2026) => {
  const r: any = { person, type, date, allday: true, remarks: '', mod: 'now', yr }
  if (endDate) r.endDate = endDate
  INPUTS.push(r); return r
}
const up = (person: string, date: string, yr = 2026) => med(person, 'Upchit', date, undefined, yr)

describe('the date helpers', () => {
  it('ordShift walks real calendar days, across month and year ends', () => {
    expect(ordShift(20260801, -1)).toBe(20260731)
    expect(ordShift(20260101, -1)).toBe(20251231)
    expect(ordShift(20260713, -30)).toBe(20260613)
    expect(ordShift(null, -1)).toBe(null)
  })
  it('ordLabel speaks the record convention, anchored to the ROW year', () => {
    expect(ordLabel(20260713, 2026)).toBe('Jul 13')
    expect(ordLabel(20270103, 2026)).toBe('Jan 3 2027')
    expect(ordLabel(20270103, 2027)).toBe('Jan 3')
  })
  it('span ordinals resolve through the row anchor; a bad label is null', () => {
    const r = med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    expect([medStartOrd(r), medEndOrd(r)]).toEqual([20260710, 20260713])
    expect(medEndOrd(med('t1', 'OML', 'Jul 10'))).toBe(20260710)   // no endDate → its own day
    expect(medStartOrd(med('t1', 'HL', 'garbage'))).toBe(null)
  })
})

describe('medDownAsOf', () => {
  it('covers its whole span inclusive, and only its span', () => {
    med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    expect(medDownAsOf(20260709).some((e: any) => e.person === 't1')).toBe(false)
    expect(medDownAsOf(20260710).some((e: any) => e.person === 't1')).toBe(true)
    expect(medDownAsOf(20260713).some((e: any) => e.person === 't1')).toBe(true)
    expect(medDownAsOf(20260714).some((e: any) => e.person === 't1')).toBe(false)
  })
  it('an unparseable row is skipped, never guessed at', () => {
    med('t1', 'ATT C', 'nonsense')
    expect(medDownAsOf(20260713).some((e: any) => e.person === 't1')).toBe(false)
  })
})

describe('pendingUpchits — the expired-and-unanswered nag', () => {
  it('appears the day after the downchit ends, carrying that row', () => {
    const r = med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    expect(pendingUpchits(20260713).some((e: any) => e.person === 't1')).toBe(false)
    const hit = pendingUpchits(20260714).find((e: any) => e.person === 't1')
    expect(hit && hit.row).toBe(r)
    expect(hit.endOrd).toBe(20260713)
  })
  it('does not age out — an old debt still nags months later', () => {
    med('t1', 'OML', 'Feb 2', 'Feb 4')
    expect(pendingUpchits(20260714).some((e: any) => e.person === 't1')).toBe(true)
  })
  it('a person down again as of the date is not pending', () => {
    med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    med('t1', 'ATT B', 'Jul 15', 'Jul 20')
    expect(pendingUpchits(20260716).some((e: any) => e.person === 't1')).toBe(false)
  })
  it('a NEWER medical entry replaces the nag even before it starts (owner rule)', () => {
    med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    med('t1', 'ATT B', 'Jul 20', 'Jul 25')      // future-dated as of the 14th
    expect(pendingUpchits(20260714).some((e: any) => e.person === 't1')).toBe(false)
  })
  it('an upchit dated on the (trimmed) end clears it; an older episode\'s does not', () => {
    med('t1', 'ATT C', 'Jul 10', 'Jul 12')      // the trimmed shape: end == upchit date
    up('t1', 'Jul 12')
    expect(pendingUpchits(20260714).some((e: any) => e.person === 't1')).toBe(false)
    med('t2', 'ATT C', 'Jul 10', 'Jul 13')
    up('t2', 'Jun 5')                            // last episode's paperwork
    expect(pendingUpchits(20260714).some((e: any) => e.person === 't2')).toBe(true)
  })
  it('the LATEST-ended expired row is the one carried', () => {
    med('t1', 'OML', 'Jun 1', 'Jun 3')
    const late = med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    const hit = pendingUpchits(20260720).find((e: any) => e.person === 't1')
    expect(hit.row).toBe(late)
  })
})

describe('upchitsWithin — the trailing 30-day window, newest first', () => {
  it('takes exactly the trailing window, half-open at the far edge', () => {
    up('t1', 'Jul 31')
    up('t2', 'Jul 2')
    up('t3', 'Jul 1')                            // exactly 30 days back — out
    up('t4', 'Aug 2')                            // after as-of — not yet
    const got = upchitsWithin(20260731).map((e: any) => e.person)
    expect(got).toEqual(['t1', 't2'])            // newest first
  })
})

describe('upchitTrimPlan — an upchit cuts what still runs past it', () => {
  it('trims a spanning row to end ON the upchit date (the owner\'s example)', () => {
    const r = med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    expect(upchitTrimPlan('t1', 20260712)).toEqual([{ row: r, action: 'trim', newEndOrd: 20260712 }])
  })
  it('leaves an already-ended row alone (pending clears without mutation)', () => {
    med('t1', 'ATT C', 'Jul 10', 'Jul 12')
    expect(upchitTrimPlan('t1', 20260712)).toEqual([])
    expect(upchitTrimPlan('t1', 20260714)).toEqual([])
  })
  it('an upchit before the start cancels the row outright', () => {
    const r = med('t1', 'OML', 'Jul 10', 'Jul 13')
    expect(upchitTrimPlan('t1', 20260709)).toEqual([{ row: r, action: 'delete' }])
  })
  it('a single-day row: on its day no-op, before it delete', () => {
    const r = med('t1', 'HL', 'Jul 10')
    expect(upchitTrimPlan('t1', 20260710)).toEqual([])
    expect(upchitTrimPlan('t1', 20260709)).toEqual([{ row: r, action: 'delete' }])
  })
  it('covers every running row of the person in one pass, nobody else\'s', () => {
    const a = med('t1', 'ATT C', 'Jul 10', 'Jul 20')
    const b = med('t1', 'OML', 'Jul 14', 'Jul 18')
    med('t2', 'ATT C', 'Jul 10', 'Jul 20')
    const plan = upchitTrimPlan('t1', 20260712)
    expect(plan).toHaveLength(2)
    expect(plan.find((p: any) => p.row === a)).toMatchObject({ action: 'trim', newEndOrd: 20260712 })
    expect(plan.find((p: any) => p.row === b)).toMatchObject({ action: 'delete' })
  })
  it('the row being edited is excluded via except', () => {
    const r = med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    expect(upchitTrimPlan('t1', 20260712, r)).toEqual([])
  })
})

describe('newMedTrimPlan — a different-type overlap wins its days', () => {
  it('the owner\'s example: ATT B 12–15 over ATT C 10–13 trims the C to 10–11', () => {
    const r = med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    expect(newMedTrimPlan('t1', 'ATT B', 20260712, 20260715))
      .toEqual([{ row: r, action: 'trim', newEndOrd: 20260711 }])
  })
  it('same type never reaches the planner\'s knife', () => {
    med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    expect(newMedTrimPlan('t1', 'ATT C', 20260712, 20260715)).toEqual([])
    expect(newMedTrimPlan('t1', 'att c', 20260712, 20260715)).toEqual([])   // spelling-proof
  })
  it('full containment deletes; disjoint spans touch nothing', () => {
    const r = med('t1', 'OML', 'Jul 12', 'Jul 13')
    expect(newMedTrimPlan('t1', 'ATT B', 20260710, 20260715)).toEqual([{ row: r, action: 'delete' }])
    expect(newMedTrimPlan('t1', 'ATT B', 20260714, 20260715)).toEqual([])
  })
  it('an old row starting inside the new range goes, tail and all', () => {
    const r = med('t1', 'ATT C', 'Jul 12', 'Jul 20')
    expect(newMedTrimPlan('t1', 'HL', 20260710, 20260715)).toEqual([{ row: r, action: 'delete' }])
  })
  it('a single-day new input still cuts what it lands on', () => {
    const r = med('t1', 'ATT C', 'Jul 10', 'Jul 13')
    expect(newMedTrimPlan('t1', 'OML', 20260712, null))
      .toEqual([{ row: r, action: 'trim', newEndOrd: 20260711 }])
  })
  it('cross-year: a row anchored 2027 is untouched by a 2026 span on the same words', () => {
    med('t1', 'ATT C', 'Jul 10', 'Jul 13', 2027)
    expect(newMedTrimPlan('t1', 'ATT B', 20260712, 20260715)).toEqual([])
  })
})
