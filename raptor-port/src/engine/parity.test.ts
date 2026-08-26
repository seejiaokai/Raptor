/* Engine ↔ reference parity: boot the untouched reference app in jsdom, run
   its engine, and require the ported engine to produce byte-identical results
   on the seed week. This pins the verbatim port far harder than spot
   assertions can — any drift in validate/collectEvents/REST/EVD shows up here. */
import { beforeAll, describe, expect, it } from 'vitest'
import { refWindow } from '../testing/refwin'
import { validate, WARN, REST, EVD } from './validate'
import { collectEvents } from './events'
import { dayCount, makeStandalone } from './waves'
import { DAYS } from './data'
import { inputCoversDate, INPUTS } from './inputs'

let w: any
/* The port's week runs Mon..SUN (owner, Aug 26); the reference's stops at
   Friday and `reference/` is read-only, so it can never grow to match. The
   house idiom applies: excise the divergence from BOTH sides — compare only
   the days the reference actually has — and pin the new ones POSITIVELY in
   the weekend block below, so nothing is merely tolerated. Read off the
   reference itself rather than hard-coded, so this follows it if it moves. */
let REFN = 0

beforeAll(async () => { w = await refWindow(); REFN = w.eval('DAYS.length') })

const byDay = (o: any) => Object.fromEntries(
  Object.entries(JSON.parse(JSON.stringify(o))).filter(([k]) => +k < REFN))

/* The port's warnings and events carry an anchor `key` (the slot-key of the
   line that caused the flag, so a warning click pans to it) that the reference
   never emits. Same idiom as the week bound above: excise the divergence from
   BOTH sides — every new field is deliberately named `key` so one excision
   covers them all — and pin the keys POSITIVELY in validate.test.ts
   ("warnings carry the causing line's slot-key"), so they are checked, not
   merely tolerated. */
const stripKeys = (o: any): any => {
  if (Array.isArray(o)) return o.map(stripKeys)
  if (o && typeof o === 'object')
    return Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'key').map(([k, v]) => [k, stripKeys(v)]))
  return o
}

/* The port carries two port-only additions the reference has never had:
   `day.sacrew` (AVALON's one check) and the shifted copies of the NEIGHBOURING
   days' inputs appended to `day.input` — `nx` for tomorrow's (a window running
   past midnight) and `pv` for yesterday's (a small-hours take-off whose brief
   and step run back before minute 0). Same idiom as stripKeys above — excise
   from BOTH sides — and pinned positively in overnight.test.ts ("positive pins
   for the parity excision"). */
const noPortOnly = (days: any) => days.map(({ sacrew, ...d }: any) =>
  ({ ...d, input: (d.input || []).filter((i: any) => !i.nx && !i.pv) }))

describe('engine parity with the reference', () => {
  it('the reference is the 5-day week this comparison is bounded to', () => {
    expect(REFN).toBe(5)
    expect(DAYS.length).toBe(7)
  })

  it('collectEvents matches the reference exactly', () => {
    expect(stripKeys(noPortOnly(JSON.parse(JSON.stringify(collectEvents().slice(0, REFN))))))
      .toEqual(stripKeys(noPortOnly(JSON.parse(JSON.stringify(w.collectEvents())))))
  })

  it('validate produces identical WARN {all, byDay, sev, chip}', () => {
    const ref = w.validate()
    const port = validate()
    /* `all` is a flat list, so it is filtered by the day each warning names
       rather than sliced; every warning carries its di. */
    const allTo = (a: any) => stripKeys(JSON.parse(JSON.stringify(a)).filter((x: any) => x.di == null || x.di < REFN))
    expect(allTo(port.all)).toEqual(allTo(ref.all))
    expect(stripKeys(JSON.parse(JSON.stringify(port.byDay.slice(0, REFN))))).toEqual(stripKeys(JSON.parse(JSON.stringify(ref.byDay))))
    expect(byDay(port.sev)).toEqual(byDay(ref.sev))
    expect(byDay(port.chip)).toEqual(byDay(ref.chip))
    expect(WARN).toBe(port)
  })

  /* top-level let/const in a classic script are not window properties — read
     them out of the page's scope with eval instead */
  it('REST and EVD publish identically', () => {
    validate(); w.validate()
    expect(byDay(REST)).toEqual(byDay(JSON.parse(w.eval('JSON.stringify(REST)'))))
    expect(stripKeys(byDay(EVD))).toEqual(stripKeys(byDay(JSON.parse(w.eval('JSON.stringify(EVD)')))))
  })

  it('seed data matches (DAYS) and day badges agree', () => {
    expect(JSON.parse(JSON.stringify(DAYS.slice(0, REFN)))).toEqual(JSON.parse(w.eval('JSON.stringify(DAYS)')))
    DAYS.slice(0, REFN).forEach((d: any, i: number) => expect(dayCount(d)).toBe(w.eval(`dayCount(DAYS[${i}])`)))
  })
})

/* What the bounded comparison above stops covering: the two days the reference
   has never had. Pinned positively here. */
describe('the weekend the port adds (owner, Aug 26)', () => {
  it('the week runs Monday to Sunday', () => {
    expect(DAYS.map((d: any) => d.dow))
      .toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    expect(DAYS.map((d: any) => d.dt).slice(5)).toEqual(['Jul 18', 'Jul 19'])
  })

  it('every weekend day carries the full section shape, non-flying', () => {
    DAYS.slice(5).forEach((d: any) => {
      for (const k of ['notes', 'allhands', 'waves', 'dutywaves', 'ground'])
        expect(Array.isArray(d[k]), `${d.dow}.${k}`).toBe(true)
      expect(d.sims && Array.isArray(d.sims.amt) && Array.isArray(d.sims.oft)).toBe(true)
      expect(d.waves.length).toBe(0)
      expect(dayCount(d), `${d.dow} badge`).toBe('0 X 0 X 0')   // reads d.wc when nothing flies
      expect(d.dutywaves[0].rows.length, `${d.dow} duty crew`).toBeGreaterThan(0)
    })
  })

  it('the engine builds them without throwing, and they raise nothing on their own', () => {
    const ev = collectEvents()
    expect(ev.length).toBe(DAYS.length)
    ev.slice(5).forEach((e: any) => { expect(e.fly).toEqual([]); expect(Array.isArray(e.events)).toBe(true) })
    const wk = validate().byDay.slice(5)
    expect(wk.length).toBe(2)
    /* a non-flying weekend with only a duty crew has nothing to clash with */
    wk.forEach((g: any) => expect(g.warns).toEqual([]))
  })

  it('a multi-day input can now span into the weekend', () => {
    const inp = { person: 'pike', date: 'Jul 17', endDate: 'Jul 19', type: 'Detachment' }
    expect(inputCoversDate(inp, 'Jul 18')).toBe(true)
    expect(inputCoversDate(inp, 'Jul 19')).toBe(true)
    expect(inputCoversDate(inp, 'Jul 16')).toBe(false)
  })
})

/* The 26 Aug 26 fail-closed seam close, proven CROSS-ENGINE. An unrecognised
   input type against an SC MAIN shift grades HARD in both engines now; the
   seed week never exercises that branch, so without this fixture the reinput
   mirror (refwin.ts, the MEETING literal) could drift silently — inspection
   was the only check. Same-mutation-both-sides idiom as syncInputs: the
   reference has makeStandalone and the same seed Tuesday, so both engines are
   handed the identical SC MAIN + typo'd input and must speak the same hard
   INPUT_FLY. Runs LAST in this file and restores both models in finally, so
   the seed comparisons above never see the fixture. */
describe('an unknown type vs SC MAIN fails closed in both engines', () => {
  it('the same typo raises the same hard INPUT_FLY, and no amber, in port and reference', () => {
    const typo = { person: 'split', date: 'Jul 14', allday: false, s: 600, e: 660, type: 'Trainng', remarks: '', mod: '' }
    const sc: any = makeStandalone('sc'); sc.formations[0].aircraft[0].p = 'split'
    ;(DAYS[1] as any).waves.push(sc); INPUTS.push(typo)
    w.eval("DAYS[1].waves.push(makeStandalone('sc'));"
      + "DAYS[1].waves[DAYS[1].waves.length-1].formations[0].aircraft[0].p='split';"
      + 'INPUTS.push(' + JSON.stringify(typo) + ')')
    try {
      const pick = (a: any[]) => a.filter((x: any) => (x.who || []).includes('split') && /Trainng/.test(x.msg))
      const port = pick(JSON.parse(JSON.stringify(validate().all)))
      const ref = pick(JSON.parse(w.eval('JSON.stringify(validate().all)')))
      expect(port.length).toBe(1)
      expect(port[0].code).toBe('INPUT_FLY')
      expect(port[0].sev).toBe('hard')
      expect(port[0].msg).toContain('Trainng but tasked — SC AM')
      expect(stripKeys(port)).toEqual(ref)
    } finally {
      ;(DAYS[1] as any).waves.pop(); INPUTS.pop()
      w.eval('DAYS[1].waves.pop();INPUTS.pop();validate()')
      validate()
    }
  })
})
