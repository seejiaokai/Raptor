/* SANS AVAILABILITY (owner, 14 Aug 26) — the gate (`sansGate`), the picker's
   grey-out (`slotBar`) and the validator's advisory (`SANS_AVAIL`) are all
   judged through the ONE function `sansGate` in avail.ts; this file pins
   that they agree, and pins the deliberate scoping (a bare no-record never
   raises a persistent advisory, only the palette's grey + toast) that keeps
   reference parity untouched — see docs/engine-rules.md §SANS availability. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId } from './inputs'
import { PEOPLE } from './people'
import { hm24 } from './time'
import { validate, WCODE, chipOf, sevOf } from './validate'
import { slotBar, slotRules, sansGate, SANS_LABEL } from './avail'
import { setSlotVal } from './slots'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

/* files a SANS record — the caller passes the person, the day it covers and
   the sans payload; `withId`/`inpId` mint the row's own address the way
   every add path does (InputsPage.tsx's `withId`), which is what the shape
   section of the plan calls for even though nothing here needs to re-find
   the row by it */
const fileSans = (person: string, sans: any, date = 'Jul 13') => {
  const r: any = { person, date, endDate: undefined, allday: true,
    type: 'SANS Availability', sans, mod: 'now' }
  inpId(r)
  INPUTS.push(r)
  return r
}

describe('sansGate — the one judge (avail.ts)', () => {
  const S = 480, E = 600   // an arbitrary slot window; sansGate reads only PEOPLE + INPUTS, no DAYS

  it("'na' — not a SANS person, whatever is filed", () => {
    expect(PEOPLE.nasty.san).toBeFalsy()
    expect(sansGate('nasty', 'Jul 13', 'fly', S, E).status).toBe('na')
  })

  it("'none' — SANS, but no record filed for the day at all", () => {
    expect(sansGate('krait', 'Jul 13', 'fly', S, E).status).toBe('none')
  })

  it("'not-offered' — a record exists but this event's box is unticked", () => {
    fileSans('krait', { o: true })
    expect(sansGate('krait', 'Jul 13', 'fly', S, E).status).toBe('not-offered')
  })

  it("'ok' — offered all day (true)", () => {
    fileSans('krait', { f: true })
    expect(sansGate('krait', 'Jul 13', 'fly', S, E).status).toBe('ok')
  })

  it("'ok' — offered a window that COVERS the slot", () => {
    fileSans('krait', { f: { s: 400, e: 700 } })
    expect(sansGate('krait', 'Jul 13', 'fly', S, E).status).toBe('ok')
  })

  it("'window' — offered, but a narrower window than the slot", () => {
    fileSans('krait', { f: { s: 500, e: 550 } })
    const g = sansGate('krait', 'Jul 13', 'fly', S, E)
    expect(g.status).toBe('window')
    expect(g.off).toEqual({ s: 500, e: 550 })
  })
})

/* ---------------------------------------------------------------------------
   slotBar — the picker's grey-out. One SANS pilot per domain (flying / OFT /
   AMT), all record-less and absence-free in the seed, so the SANS reason is
   isolated: nothing else on these men or these slots can produce a reason
   that starts with 'SANS —', and the assertions lean on that.
   --------------------------------------------------------------------------- */
describe('slotBar — the SANS gate, picker side (avail.ts)', () => {
  /* nick (SANS, RCP) already sits this seat in the seed, but slotBar judges
     the ID PASSED IN, not the seat's current occupant — the same question
     the picker asks of every name in the column */
  const FLY_KEY = '0.1.0.1.w', FLY_ID = 'nick'
  it('a flying seat: no record filed', () => {
    expect(slotBar(FLY_ID, FLY_KEY)).toBe('SANS — no availability filed for today')
  })
  it('a flying seat: record filed, Fly not ticked', () => {
    fileSans(FLY_ID, { o: true })
    expect(slotBar(FLY_ID, FLY_KEY)).toBe('SANS — not offering Fly')
  })
  it('a flying seat: Fly offered a window narrower than the sortie', () => {
    const r = slotRules(FLY_KEY)
    fileSans(FLY_ID, { f: { s: r.slotStart, e: r.slotStart + 30 } })
    const why = slotBar(FLY_ID, FLY_KEY)
    expect(why).toBe(`SANS — Fly offered ${hm24(r.slotStart)}–${hm24(r.slotStart + 30)} only`)
  })
  it('a flying seat: Fly offered all day — no SANS reason', () => {
    fileSans(FLY_ID, { f: true })
    expect(slotBar(FLY_ID, FLY_KEY)).not.toMatch(/^SANS/)
  })

  /* waldo (SANS, RCP) already rides this OFT box as pax in the seed, on
     Jul 15 (day index 2) — the record has to cover that same date */
  const OFT_KEY = 's:2.oft.0', OFT_ID = 'waldo', OFT_DATE = 'Jul 15'
  it('an OFT seat: no record filed', () => {
    expect(slotBar(OFT_ID, OFT_KEY)).toBe('SANS — no availability filed for today')
  })
  it('an OFT seat: record filed, OFT not ticked', () => {
    fileSans(OFT_ID, { a: true }, OFT_DATE)
    expect(slotBar(OFT_ID, OFT_KEY)).toBe('SANS — not offering OFT')
  })
  it('an OFT seat: OFT offered a window narrower than the box', () => {
    const r = slotRules(OFT_KEY)
    fileSans(OFT_ID, { o: { s: r.slotStart, e: r.slotStart + 30 } }, OFT_DATE)
    expect(slotBar(OFT_ID, OFT_KEY))
      .toBe(`SANS — OFT offered ${hm24(r.slotStart)}–${hm24(r.slotStart + 30)} only`)
  })
  it('an OFT seat: OFT offered all day — no SANS reason', () => {
    fileSans(OFT_ID, { o: true }, OFT_DATE)
    expect(slotBar(OFT_ID, OFT_KEY)).not.toMatch(/^SANS/)
  })

  /* an AMT box that carries no crew in the seed — ipman is a clean,
     record-less SANS pilot with nothing else on him this week */
  const AMT_KEY = 's:0.amt.1.p', AMT_ID = 'ipman'
  it('an AMT seat: no record filed', () => {
    expect(slotBar(AMT_ID, AMT_KEY)).toBe('SANS — no availability filed for today')
  })
  it('an AMT seat: record filed, AMT not ticked', () => {
    fileSans(AMT_ID, { f: true })
    expect(slotBar(AMT_ID, AMT_KEY)).toBe('SANS — not offering AMT')
  })
  it('an AMT seat: AMT offered a window narrower than the box', () => {
    const r = slotRules(AMT_KEY)
    fileSans(AMT_ID, { a: { s: r.slotStart, e: r.slotStart + 30 } })
    expect(slotBar(AMT_ID, AMT_KEY))
      .toBe(`SANS — AMT offered ${hm24(r.slotStart)}–${hm24(r.slotStart + 30)} only`)
  })
  it('an AMT seat: AMT offered all day — no SANS reason', () => {
    fileSans(AMT_ID, { a: true })
    expect(slotBar(AMT_ID, AMT_KEY)).not.toMatch(/^SANS/)
  })

  /* THE CARVE-OUT: a duty post or a ground row is never SANS-greyed, even for
     a record-less SANS man — "any ground event can also be planned" */
  it('a duty key on a record-less SANS person is never SANS-greyed', () => {
    expect(PEOPLE.ipman.san).toBe(true)
    expect(slotBar('ipman', 'd:0.0.0')).not.toMatch(/^SANS/)
  })
  it('a ground key on a record-less SANS person is never SANS-greyed', () => {
    expect(slotBar('ipman', 'g:0.0')).not.toMatch(/^SANS/)
  })
})

/* ---------------------------------------------------------------------------
   The validator — SANS_AVAIL is the amber advisory, CP chip (PAX_CREW
   precedent), raised ONLY against a FILED record. A record-less SANS man
   planted the same way raises nothing persistent — the palette grey and the
   plant toast still say so, but validate() stays silent, which is exactly
   what keeps the seed (romeo/vinci/krait fly, waldo rides OFT pax, zero SANS
   records) parity-clean.
   --------------------------------------------------------------------------- */
describe('validate() — the SANS_AVAIL advisory', () => {
  /* '0.0.0.0.p' is a front (pilot) seat with no AAR/qual bar for ipman (SANS,
     FCP) — a clean plant that raises nothing but what this test is about */
  const FLY_KEY = '0.0.0.0.p', FLY_ID = 'ipman'
  const sansAvail = (id: string) => validate().all.filter((w: any) =>
    w.code === 'SANS_AVAIL' && (w.who || []).includes(id))

  it('offering only O/A raises exactly one advisory: adv, CP chip, "not offering Fly"', () => {
    setSlotVal(FLY_KEY, FLY_ID)
    fileSans(FLY_ID, { o: true, a: true })
    const hits = sansAvail(FLY_ID)
    expect(hits.length).toBe(1)
    expect(hits[0].sev).toBe('adv')
    expect(hits[0].msg).toContain('not offering Fly')
    validate()
    expect(sevOf(0, FLY_ID)).toBe('adv')
    expect(chipOf(0, FLY_ID)).toBe('CP')
  })

  it('Fly offered a window narrower than the sortie: "offered … only"', () => {
    setSlotVal(FLY_KEY, FLY_ID)
    const r = slotRules(FLY_KEY)
    fileSans(FLY_ID, { f: { s: r.slotStart, e: r.slotStart + 30 } })
    const hits = sansAvail(FLY_ID)
    expect(hits.length).toBe(1)
    expect(hits[0].msg).toContain('Fly offered')
    expect(hits[0].msg).toContain('only')
  })

  it('Fly offered all day (true) — no SANS_AVAIL', () => {
    setSlotVal(FLY_KEY, FLY_ID)
    fileSans(FLY_ID, { f: true })
    expect(sansAvail(FLY_ID)).toEqual([])
  })

  it('no record filed at all, planted anyway — no SANS_AVAIL (deliberate scoping)', () => {
    setSlotVal(FLY_KEY, FLY_ID)
    expect(sansAvail(FLY_ID)).toEqual([])
  })

  /* the sim side of the same check — day.events' `s:di.oft.ri` entries.
     Day index 2 = Jul 15, so the record has to cover that date. */
  const OFT_KEY = 's:2.oft.0.p', OFT_ID = 'ipman', OFT_DATE = 'Jul 15'
  it('a SANS pilot planted into an OFT seat, offering only Fly: "not offering OFT"', () => {
    setSlotVal(OFT_KEY, OFT_ID)
    fileSans(OFT_ID, { f: true }, OFT_DATE)
    const hits = sansAvail(OFT_ID)
    expect(hits.length).toBe(1)
    expect(hits[0].sev).toBe('adv')
    expect(hits[0].msg).toContain('not offering OFT')
  })
})

/* ---- reference-parity guards (personnel.test.ts:141-148 pattern) --------- */
describe('reference-parity guards', () => {
  it('SANS_AVAIL has a WCODE sentence', () => {
    expect(WCODE.SANS_AVAIL).toBeTruthy()
  })
  it('the seed week raises no SANS_AVAIL — nothing fires on the reference', () => {
    expect(validate().all.filter((w: any) => w.code === 'SANS_AVAIL')).toEqual([])
  })
})
