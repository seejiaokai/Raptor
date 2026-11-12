/* Engine ↔ reference parity: boot the untouched reference app in jsdom, run
   its engine, and require the ported engine to produce byte-identical results
   on the seed week. This pins the verbatim port far harder than spot
   assertions can — any drift in validate/collectEvents/REST/EVD shows up here. */
import { beforeAll, describe, expect, it } from 'vitest'
import { refWindow } from '../testing/refwin'
import { validate, WARN, REST, EVD, WCODE } from './validate'
import { collectEvents } from './events'
import { dayCount, makeStandalone } from './waves'
import { DAYS } from './data'
import { inputCoversDate, INPUTS } from './inputs'
import { VCONF } from './rules'

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
   merely tolerated.
   ONE MORE SINCE 12 Nov 26 (owner D2001): a clash warning carries `items`, its two items' row ids, which the hide key
   reads in place of the words. The reference never emits it; excised from BOTH sides here and pinned positively in
   rulesfirst-6-hidden-warnings.test.ts ("D2001 …" — a hide follows the two items, not the words). */
const stripKeys = (o: any): any => {
  if (Array.isArray(o)) return o.map(stripKeys)
  if (o && typeof o === 'object')
    return Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'key' && k !== 'items').map(([k, v]) => [k, stripKeys(v)]))
  return o
}

/* The port carries three port-only additions the reference has never had:
   `day.sacrew` (AVALON's one check), the shifted copies of the NEIGHBOURING
   days' inputs appended to `day.input` — `nx` for tomorrow's (a window running
   past midnight) and `pv` for yesterday's (a small-hours take-off whose brief
   and step run back before minute 0) — and each form's `spareAcs` (the RAW
   spare rows beside the reference's own deduped spareCrew, feeding the 31 Aug
   26 SC SPARE rules). Same idiom as stripKeys above — excise from BOTH
   sides — and pinned positively in overnight.test.ts ("positive pins for the
   parity excision") and scspare-rules.test.ts.
   A fourth and fifth since 6 Oct 26: `day.blank`, the men on seats with no hours
   of their own, and `day.whole`, the day's whole-day inputs they are judged
   against (owner, D605) — pinned positively, one kind of seat at a time, in
   blankabsence.test.ts. */
const noPortOnly = (days: any) => days.map(({ sacrew, blank, whole, ...d }: any) =>
  ({ ...d, input: (d.input || []).filter((i: any) => !i.nx && !i.pv),
     forms: (d.forms || []).map(({ spareAcs, ...f }: any) => f) }))

/* D502 adds reporting warnings only; the untouched reference has no reporting
   order rule. Excise these two codes from BOTH warning lists, never from event,
   hours, rest, puck marks or existing warnings. The untouched-seed pin below
   checks their presence instead of silently tolerating the difference. */
const oldWarns = (a:any[]) => a.filter(x=>!['REPORT_ORDER','REPORT_UNRESOLVED'].includes(x.code))

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
    const allTo = (a: any) => stripKeys(oldWarns(JSON.parse(JSON.stringify(a))).filter((x: any) => x.di == null || x.di < REFN))
    expect(allTo(port.all)).toEqual(allTo(ref.all))
    const dayWarns=(a:any[])=>stripKeys(JSON.parse(JSON.stringify(a)).map((d:any)=>({...d,warns:oldWarns(d.warns)})))
    expect(dayWarns(port.byDay.slice(0, REFN))).toEqual(dayWarns(ref.byDay))
    expect(byDay(port.sev)).toEqual(byDay(ref.sev))
    expect(byDay(port.chip)).toEqual(byDay(ref.chip))
    expect(WARN).toBe(port)
  })

  it('D510 pristine seed has no reporting-order warnings and identical reference reporting fixtures', () => {
    const issues=validate().all.filter((x:any)=>x.code==='REPORT_ORDER')
    expect(issues).toEqual([])
    expect(JSON.parse(w.eval('JSON.stringify(DAYS.map(d=>d.waves.map(w=>w.intimes)))')))
      .toEqual(DAYS.slice(0,REFN).map(d=>d.waves.map((wv:any)=>wv.intimes)))
  })

  /* top-level let/const in a classic script are not window properties — read
     them out of the page's scope with eval instead */
  it('REST and EVD publish identically', () => {
    validate(); w.validate()
    expect(byDay(REST)).toEqual(byDay(JSON.parse(w.eval('JSON.stringify(REST)'))))
    expect(stripKeys(byDay(EVD))).toEqual(stripKeys(byDay(JSON.parse(w.eval('JSON.stringify(EVD)')))))
  })

  it('seed data matches (DAYS) and day badges agree', () => {
    /* the port's day-notes are { id, t } objects since 13 Sep 26 (ARCH-STACK 1A)
       while the reference keeps bare strings, so compare note CONTENT (the text),
       with note identity excluded — the id is never printed and rides no
       reference byte (Astra SID-06). reday already projected the port TEXT into
       the reference, so both normalise to the same strings; the byte-exact render
       parity below remains the independent proof that the text still renders. */
    const noteText = (n: any) => (typeof n === 'string' ? n : (n && typeof n.t === 'string' ? n.t : ''))
    const normNotes = (days: any[]) => days.map((d: any) => ({ ...d, notes: (d.notes || []).map(noteText) }))
    expect(normNotes(JSON.parse(JSON.stringify(DAYS.slice(0, REFN))))).toEqual(normNotes(JSON.parse(w.eval('JSON.stringify(DAYS)'))))
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

/* A LANDING THAT IS NOT A TIME, IN BOTH ENGINES (D1990, D2010 — Astra's read of the rules check's small batch, 13 Nov
   26). The port ends a sortie whose landing box holds no clock time ("TBD", any words) at its take-off plus the debrief
   (validate.ts `flyLd`) and says "took off … with no landing typed"; the reference window mirrored the words but kept
   the reference's own sum on the unreadable landing — not-a-number, so the reference raised NO crew-rest warning at all
   and parity was blind to the case. Same-mutation-both-sides idiom as above: Monday's sortie for one seed pilot with
   each kind of landing, Tuesday's take-off 04:00 (its suggested brief 01:40 is short of every clearance), and the two
   engines' crew-rest warnings for him compared whole. Also the two checks' names (D2009): the reference's label table
   carries the new ones. Restores both models in finally. */
describe('a landing that is not a time ends the day the same in both engines (D1990, D2010)', () => {
  it('blank, "TBD", other words, the take-off\'s own minute and a typed landing: the same crew-rest warning', () => {
    const portSaved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), v: JSON.stringify(VCONF) }
    w.eval('window.__pv={d:JSON.stringify(DAYS),i:JSON.stringify(INPUTS),v:JSON.stringify(VCONF)}')
    const vals = { briefLead: 140, debrief: 120, crewRest: 720, step: 60, dekit: 30 }
    const sortie = (to: string, ld: string) => ({ label: 'WAVE 1', intimes: [],
      formations: [{ cs: 'VL', msn: 'BFM', to, ld, br: '', aircraft: [{ p: 'split', w: '', rmks: '', opts: {} }] }] })
    const clear = '[0,1].forEach(i=>{DAYS[i].waves=[];DAYS[i].ground=[];DAYS[i].allhands=[];'
      + 'if(DAYS[i].sims)DAYS[i].sims={amt:[],oft:[]};if(DAYS[i].dutywaves)DAYS[i].dutywaves=[];});INPUTS.length=0;'
    try {
      Object.assign(VCONF, vals)
      w.eval(`Object.assign(VCONF,${JSON.stringify(vals)})`)
      const seen: string[] = []
      for (const ld of ['', 'TBD', 'late', '12:00', '13:00']) {
        ;[0, 1].forEach(i => Object.assign(DAYS[i] as any, { waves: [], ground: [], allhands: [], sims: { amt: [], oft: [] }, dutywaves: [] }))
        INPUTS.splice(0)
        ;(DAYS[0] as any).waves.push(sortie('12:00', ld)); (DAYS[1] as any).waves.push(sortie('04:00', '05:00'))
        w.eval(clear + `DAYS[0].waves.push(${JSON.stringify(sortie('12:00', ld))});DAYS[1].waves.push(${JSON.stringify(sortie('04:00', '05:00'))});`)
        const pick = (a: any[]) => a.filter((x: any) => x.code === 'CREW_REST' && x.di === 1 && (x.who || []).includes('split'))
        const port = pick(structuredClone(validate().all))
        const ref = pick(JSON.parse(w.eval('JSON.stringify(validate().all)')))
        expect(port.length, `port, landing "${ld}"`).toBe(1)
        expect(stripKeys(port).map((x: any) => x.msg), `landing "${ld}"`).toEqual(ref.map((x: any) => x.msg))
        expect(stripKeys(port), `landing "${ld}"`).toEqual(ref)
        seen.push(port[0].msg)
      }
      /* the positive half: each case says what D2010 says it says */
      for (const i of [0, 1, 2]) expect(seen[i]).toContain('Monday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00')
      expect(seen[3]).toContain('Monday landed 12:00, +2h debrief assumed → ended 14:00')
      expect(seen[4]).toContain('Monday landed 13:00, +2h debrief assumed → ended 15:00')
    } finally {
      DAYS.splice(0, DAYS.length, ...JSON.parse(portSaved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(portSaved.i))
      Object.keys(VCONF).forEach(k => delete (VCONF as any)[k]); Object.assign(VCONF, JSON.parse(portSaved.v))
      w.eval('DAYS.splice(0,DAYS.length,...JSON.parse(__pv.d));INPUTS.splice(0,INPUTS.length,...JSON.parse(__pv.i));'
        + 'Object.keys(VCONF).forEach(k=>delete VCONF[k]);Object.assign(VCONF,JSON.parse(__pv.v));validate()')
      validate()
    }
  })
  it('the two checks carry their new names in both engines\' label tables (D2009)', () => {
    const port = { LEAVE_FLY: (WCODE as any).LEAVE_FLY, DNIF_FLY: (WCODE as any).DNIF_FLY }
    expect(port).toEqual({ LEAVE_FLY: 'On leave + planned', DNIF_FLY: 'Downchit + planned' })
    expect(JSON.parse(w.eval('JSON.stringify({LEAVE_FLY:WCODE.LEAVE_FLY,DNIF_FLY:WCODE.DNIF_FLY})'))).toEqual(port)
  })
})
