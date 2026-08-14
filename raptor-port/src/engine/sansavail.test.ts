/* SANS AVAILABILITY (owner, 14 Aug 26; REWORKED the same day) — the gate
   (`sansGate`), the picker's grey-out (`slotBar`) and the validator's advisory
   (`SANS_AVAIL`) are all judged through the ONE function `sansGate` in
   avail.ts; this file pins that they agree, and pins the deliberate scoping
   (a bare no-record never raises a persistent advisory, only the palette's
   grey + toast) that keeps reference parity untouched — see
   docs/engine-rules.md §SANS availability.
   The rework: a record carries ONE window (the row's own standard allday /
   half / s / e, read by sansWindow) shared by every ticked event, and `sans`
   is flags-only ({f/o/a: true}). The old per-event {s,e} windows are gone. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId, isAway, sansWindow, sansLetters, sansBadge } from './inputs'
import { PEOPLE } from './people'
import { hm24 } from './time'
import { validate, WCODE, chipOf, sevOf } from './validate'
import { slotBar, slotRules, sansGate } from './avail'
import { setSlotVal } from './slots'
import { SCHED } from './publish'
import { collectEvents } from './events'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

/* files a SANS record the way the reworked editors write one: `sans` is the
   flag set, `when` is the one shared window — omitted = all day, {half} = the
   AM/PM preset, {s,e} = a custom window. `withId`/`inpId` mint the row's own
   address the way every add path does (InputsPage.tsx's `withId`). */
const fileSans = (person: string, sans: any, when: any = null, date = 'Jul 13') => {
  const r: any = { person, date, endDate: undefined, allday: !when,
    type: 'SANS Availability', sans, mod: 'now' }
  if (when && when.half) { r.half = when.half }
  else if (when) { r.s = when.s; r.e = when.e }
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

  it("'ok' — offered all day", () => {
    fileSans('krait', { f: true })
    expect(sansGate('krait', 'Jul 13', 'fly', S, E).status).toBe('ok')
  })

  it("'ok' — the record's one window COVERS the slot", () => {
    fileSans('krait', { f: true }, { s: 400, e: 700 })
    expect(sansGate('krait', 'Jul 13', 'fly', S, E).status).toBe('ok')
  })

  it("'window' — offered, but a narrower window than the slot", () => {
    fileSans('krait', { f: true }, { s: 500, e: 550 })
    const g = sansGate('krait', 'Jul 13', 'fly', S, E)
    expect(g.status).toBe('window')
    expect(g.off).toEqual({ s: 500, e: 550 })
  })

  it('ONE window serves every ticked event — the same record answers fly and amt alike', () => {
    fileSans('krait', { f: true, a: true }, { s: 500, e: 550 })
    expect(sansGate('krait', 'Jul 13', 'fly', S, E).status).toBe('window')
    expect(sansGate('krait', 'Jul 13', 'amt', S, E).status).toBe('window')
    expect(sansGate('krait', 'Jul 13', 'amt', 510, 540).status).toBe('ok')
    expect(sansGate('krait', 'Jul 13', 'oft', S, E).status).toBe('not-offered')
  })

  it('the AM preset is the standard half — 00:00–12:00', () => {
    fileSans('krait', { f: true }, { half: 'am' })
    expect(sansGate('krait', 'Jul 13', 'fly', 480, 700).status).toBe('ok')
    const g = sansGate('krait', 'Jul 13', 'fly', 480, 780)
    expect(g.status).toBe('window')
    expect(g.off).toEqual({ s: 0, e: 720 })
  })

  it('the PM preset is the standard half — 12:01 onwards', () => {
    fileSans('krait', { f: true }, { half: 'pm' })
    expect(sansGate('krait', 'Jul 13', 'fly', 780, 900).status).toBe('ok')
    expect(sansGate('krait', 'Jul 13', 'fly', 480, 700).status).toBe('window')
  })
})

describe('sansWindow / sansLetters / sansBadge — the record readers', () => {
  it('sansWindow reads the four shapes, failing open like inpWin fails closed', () => {
    expect(sansWindow({ allday: true })).toEqual([0, 1439])
    expect(sansWindow({ allday: false, half: 'am' })).toEqual([0, 720])
    expect(sansWindow({ allday: false, half: 'pm' })).toEqual([721, 1439])
    expect(sansWindow({ allday: false, s: 480, e: 720 })).toEqual([480, 720])
    expect(sansWindow({ allday: false }), 'a thin record reads whole-day').toEqual([0, 1439])
    expect(sansWindow(null)).toEqual([0, 1439])
  })
  it('sansLetters prints ticked events in fixed f/o/a order, slash-joined', () => {
    expect(sansLetters({ sans: { a: true, f: true } })).toBe('F/A')
    expect(sansLetters({ sans: { o: true } })).toBe('O')
    expect(sansLetters({ sans: {} })).toBe('')
    expect(sansLetters(null)).toBe('')
  })
  it('sansBadge is letters plus the one window', () => {
    fileSans('krait', { f: true, o: true, a: true })
    expect(sansBadge('krait', 'Jul 13')).toBe('F/O/A')
    INPUTS.pop()
    fileSans('krait', { f: true, o: true }, { half: 'am' })
    expect(sansBadge('krait', 'Jul 13')).toBe('F/O · AM')
    INPUTS.pop()
    fileSans('krait', { a: true }, { s: 480, e: 720 })
    expect(sansBadge('krait', 'Jul 13')).toBe('A · 08:00–12:00')
    expect(sansBadge('krait', 'Jul 14'), 'no record, no badge').toBe('')
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
  it('a flying seat: the window is narrower than the sortie', () => {
    const r = slotRules(FLY_KEY)
    fileSans(FLY_ID, { f: true }, { s: r.slotStart, e: r.slotStart + 30 })
    const why = slotBar(FLY_ID, FLY_KEY)
    expect(why).toBe(`SANS — available ${hm24(r.slotStart)}–${hm24(r.slotStart + 30)} only`)
  })
  it('a flying seat: offered all day — no SANS reason', () => {
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
    fileSans(OFT_ID, { a: true }, null, OFT_DATE)
    expect(slotBar(OFT_ID, OFT_KEY)).toBe('SANS — not offering OFT')
  })
  it('an OFT seat: the window is narrower than the box', () => {
    const r = slotRules(OFT_KEY)
    fileSans(OFT_ID, { o: true }, { s: r.slotStart, e: r.slotStart + 30 }, OFT_DATE)
    expect(slotBar(OFT_ID, OFT_KEY))
      .toBe(`SANS — available ${hm24(r.slotStart)}–${hm24(r.slotStart + 30)} only`)
  })
  it('an OFT seat: offered all day — no SANS reason', () => {
    fileSans(OFT_ID, { o: true }, null, OFT_DATE)
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
  it('an AMT seat: the window is narrower than the box', () => {
    const r = slotRules(AMT_KEY)
    fileSans(AMT_ID, { a: true }, { s: r.slotStart, e: r.slotStart + 30 })
    expect(slotBar(AMT_ID, AMT_KEY))
      .toBe(`SANS — available ${hm24(r.slotStart)}–${hm24(r.slotStart + 30)} only`)
  })
  it('an AMT seat: offered all day — no SANS reason', () => {
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

  it('a window narrower than the sortie: "available … only"', () => {
    setSlotVal(FLY_KEY, FLY_ID)
    const r = slotRules(FLY_KEY)
    fileSans(FLY_ID, { f: true }, { s: r.slotStart, e: r.slotStart + 30 })
    const hits = sansAvail(FLY_ID)
    expect(hits.length).toBe(1)
    expect(hits[0].msg).toContain('available')
    expect(hits[0].msg).toContain('only')
  })

  it('offered all day — no SANS_AVAIL', () => {
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
    fileSans(OFT_ID, { f: true }, null, OFT_DATE)
    const hits = sansAvail(OFT_ID)
    expect(hits.length).toBe(1)
    expect(hits[0].sev).toBe('adv')
    expect(hits[0].msg).toContain('not offering OFT')
  })
})

/* ---------------------------------------------------------------------------
   THE LEAK GUARD (rework, 14 Aug 26). The record carries the row's own
   standard s/e/half now, which is exactly the shape the absence and clash
   machinery reads on every OTHER type — so pin that the type-based routing
   still keeps a SANS record out of all of it: it is an OFFER, and a timed
   offer must not read as a timed absence anywhere.
   --------------------------------------------------------------------------- */
describe('a timed SANS record never leaks into the absence/clash machinery', () => {
  it('isAway stays false however the window is written', () => {
    expect(isAway({ type: 'SANS Availability', allday: true })).toBe(false)
    expect(isAway({ type: 'SANS Availability', allday: false, s: 480, e: 720 })).toBe(false)
  })
  it('never enters day.input — the brief/clash machinery cannot see it', () => {
    fileSans('ipman', { f: true }, { s: 0, e: 1439 })
    const day: any = collectEvents()[0]
    expect(day.input.filter((x: any) => x.id === 'ipman')).toEqual([])
  })
  it('a narrow window overlapping a planted sortie raises the SANS advisory and NO input clash', () => {
    setSlotVal('0.0.0.0.p', 'ipman')
    const r = slotRules('0.0.0.0.p')
    fileSans('ipman', { f: true }, { s: r.slotStart, e: r.slotStart + 30 })
    const mine = validate().all.filter((w: any) => (w.who || []).includes('ipman'))
    expect(mine.some((w: any) => w.code === 'SANS_AVAIL')).toBe(true)
    expect(mine.filter((w: any) => w.sev === 'hard')).toEqual([])
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
