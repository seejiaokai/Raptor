// @vitest-environment jsdom
/* GUARD RAILS ON THE PERSONAL-INPUTS SURFACES (owner, 12 Aug 26).

   Three editors write one list — the Inputs page, the week's cells and the
   board's — and all three funnel through commitInputEdit/setInpField, so every
   guard below is tested at that shared choke point and holds on all three.

   The line, as everywhere else: refuse MALFORMED data (a value that is not a
   time, or a span that cannot mean anything), warn about DECISIONS. An
   overnight absence, a clash, a late submission all still go straight in. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { INPUTS, dateOrd, inputCoversDate } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { commitInputEdit, setInpField, draftOf } from './inputedit'

const ISNAP = JSON.stringify(INPUTS)
let said: string[] = []
const realToast = HOOKS.toast

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  said = []
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
})
afterEach(() => { HOOKS.toast = realToast })

/* a timed input on the demo Monday, whatever the seed happens to hold */
const timed = () => {
  const r: any = INPUTS.find((i: any) => !i.allday && i.s != null) || INPUTS[0]
  r.allday = false; r.s = 540; r.e = 660; r.date = 'Jul 13'; delete r.endDate
  return r
}

describe('an input time has to be a time', () => {
  it('refuses an out-of-range clock in the in-place cells', () => {
    const r = timed()
    expect(setInpField(r, 'str', '2570'), 'refused').toBe(false)
    expect(r.s, 'the model never moved').toBe(540)
    expect(said.join(' ')).toMatch(/not a time/i)
  })

  it('refuses a minute overflow rather than rolling it an hour on', () => {
    const r = timed()
    expect(setInpField(r, 'str', '0990')).toBe(false)
    expect(r.s).toBe(540)
  })

  it('refuses it through the DIALOG too, and says the right thing', () => {
    const r = timed()
    const d: any = draftOf(r); d.allday = false; d.sTime = '2570'
    expect(commitInputEdit(r, d)).toBe(false)
    expect(r.s).toBe(540)
    /* it used to complain that no time had been given, when one had */
    expect(said.join(' ')).toMatch(/not a time/i)
    expect(said.join(' ')).not.toMatch(/tick All day/i)
  })

  it('still takes a real time, and still lets a cell be cleared to all-day', () => {
    const r = timed()
    expect(setInpField(r, 'str', '0730')).toBe(true)
    expect(r.s).toBe(450)
    expect(setInpField(r, 'str', '')).toBe(true)
    expect(r.allday).toBe(true)
  })

  /* the damage the guard prevents: an absence whose window is off the end of
     the day overlaps nothing on its own day, so the man keeps his leave and
     loses every warning that goes with it */
  it('keeps a leave overlapping the day it is on', () => {
    const r = timed()
    setInpField(r, 'str', '2570')
    expect(r.s).toBeLessThan(1440)
    expect(r.e).toBeLessThan(1441)
  })
})

describe('a span has to run forwards', () => {
  /* THE NEW-YEAR CASE NOW WORKS (owner, 12 Aug 26 — "Ok do it"). A leave typed
     Dec 28 → Jan 3 keeps the year on the endpoint that leaves the loaded week,
     so it stores forwards, sorts forwards and covers every day between. It used
     to be refused because the yearless labels sorted 'Jan 3' behind 'Dec 28'. */
  it('takes a range that runs into the new year, keeping the year on the far end', () => {
    const r = timed()
    const d: any = draftOf(r)
    d.start = '2026-12-28'; d.end = '2027-01-03'
    expect(commitInputEdit(r, d), 'accepted, not refused').toBe(true)
    expect(r.date).toBe('Dec 28')
    expect(r.endDate, 'the far end carries its year so the span is unambiguous').toBe('Jan 3 2027')
  })

  it('and that stored shape sorts and covers correctly', () => {
    /* pinned so the year in the label is never dropped again — with it, the
       end sorts AFTER the start and the span covers the days across midnight */
    expect(dateOrd('Jan 3 2027')! > dateOrd('Dec 28')!).toBe(true)
    const span = { date: 'Dec 28', endDate: 'Jan 3 2027' }
    expect(inputCoversDate(span, 'Dec 30')).toBe(true)
    expect(inputCoversDate(span, 'Jan 1 2027')).toBe(true)
    expect(inputCoversDate(span, 'Jan 5 2027')).toBe(false)
  })

  it('still refuses a genuinely backwards range', () => {
    const r = timed()
    const d: any = draftOf(r)
    d.start = '2026-07-17'; d.end = '2026-07-13'
    expect(commitInputEdit(r, d), 'an end before its start in real time').toBe(false)
    expect(said.join(' ')).toMatch(/on or after the start/i)
  })

  it('takes an ordinary forward span, and a single day', () => {
    const r = timed()
    const d: any = draftOf(r)
    d.start = '2026-07-13'; d.end = '2026-07-16'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.endDate).toBe('Jul 16')
    const d2: any = draftOf(r); d2.start = '2026-07-13'; d2.end = '2026-07-13'
    expect(commitInputEdit(r, d2)).toBe(true)
    expect(r.endDate, 'a one-day range keeps no end at all').toBeUndefined()
  })
})

describe('the AM/PM label is derived, never trusted', () => {
  it('typing hours that are not the morning drops a stale AM label', () => {
    const r: any = timed()
    r.type = 'LL'
    const d: any = draftOf(r)
    d.allday = false; d.half = 'am'; d.sTime = '08:00'; d.eTime = '12:00'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.half, 'an 08:00–12:00 window is not "the morning"').toBeUndefined()
  })

  it('a real half keeps its label', () => {
    const r: any = timed()
    r.type = 'LL'
    const d: any = draftOf(r)
    d.allday = false; d.half = ''; d.sTime = '00:00'; d.eTime = '12:00'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.half).toBe('am')
  })

  it('a type with no halves never carries one, whatever the hours say', () => {
    const r: any = timed()
    r.type = 'CSE'
    const d: any = draftOf(r)
    d.allday = false; d.half = 'am'; d.sTime = '00:00'; d.eTime = '12:00'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.half, 'no control could ever clear it again').toBeUndefined()
  })
})

describe('what is still allowed, because it is a decision and not a typo', () => {
  it('an overnight absence, end before start', () => {
    const r = timed()
    const d: any = draftOf(r)
    d.allday = false; d.sTime = '22:00'; d.eTime = '02:00'
    expect(commitInputEdit(r, d), 'a real absence, and every other row type rolls it').toBe(true)
    expect(r.s).toBe(1320); expect(r.e).toBe(120)
  })

  it('a date far outside the loaded week', () => {
    const r = timed()
    const d: any = draftOf(r)
    d.start = '2026-09-04'; d.end = ''
    expect(commitInputEdit(r, d), 'members file leave months ahead').toBe(true)
    expect(DAYS.some((x: any) => inputCoversDate(r, x.dt)), 'it simply covers no loaded day').toBe(false)
  })
})
