/* HIS SANS LEFTOVERS ANSWERS ON THE WARNING LIST (D2584, 25 Nov 26 — "The rest as recommended", the SANS leftovers page):
   Q3 (his D2579, replacing D2574): a SANS man planned in a flying seat or a sim with NOTHING filed gets one amber line,
   stating the fact and telling nobody to file — "SANS: no availability filed for today. Planned on VL BFM (T/O 13:00)" —
   wearing the amber ring and "A" (his D2583, not a new letter); standby lines need nothing (D2584 Q4).
   2a: the mismatch line says what he DID offer, so it matches the crew list — "SANS: offered Fly only today. Planned on …"
   (two offered: "SANS: offered OFT and AMT only today."); wrong hours keep "SANS: available 08:00–10:00 only".
   3b: the Logic page's line "A SANS man planned outside the event or the hours he filed, or with nothing filed." and the
   check's name "SANS availability — not filed, or planned outside it". The Legend's amber "A" line reads "advisory —
   shift, ground or SANS availability" (D2583). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId } from './inputs'
import { validate, WARN, WCODE } from './validate'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const ID = 'ipman'          // a SANS pilot of the seed, nothing filed for Mon 13 Jul, on nothing that day
const fileSans = (sans: any, hours?: [number, number]) => {
  const r: any = { person: ID, date: 'Jul 13', endDate: undefined, allday: !hours, type: 'SANS Availability', sans, mod: 'now',
    ...(hours ? { s: hours[0], e: hours[1] } : {}) }
  inpId(r); INPUTS.push(r); return r
}
/* a new flying line on Monday with him in its front seat; `to`/`ld` typed or not; "VL BFM" is callsign VL, mission BFM */
const line = (name: string, to = '', ld = '') => {
  const [cs, msn = ''] = name.split(' ')
  const f: any = { cs, msn, to, ld, aircraft: [{ p: ID, w: '', area: '', rmks: '', opts: {} }] }
  DAYS[0].waves.push({ label: 'ZB', night: false, intimes: [], traffic: [], formations: [f] })
  return `0.${DAYS[0].waves.length - 1}.0.0.p`
}
const sim = (kind: 'oft' | 'amt', label: string, str = '', end = '') => {
  const rows = DAYS[0].sims[kind]
  rows.push({ label, str, end, p: ID, w: '' })
  return `s:0.${kind}.${rows.length - 1}`
}
const his = () => validate().all.filter((w: any) => w.code === 'SANS_AVAIL' && (w.who || []).includes(ID))

describe('Q3 (D2579) — nothing filed: one amber line, stating the fact', () => {
  it('a timed flight: "SANS: no availability filed for today. Planned on VL BFM (T/O 13:00)"', () => {
    line('VL BFM', '13:00', '14:00')
    const w = his()
    expect(w).toHaveLength(1)
    expect(w[0].sev).toBe('adv')
    expect(w[0].msg).toBe('SANS: no availability filed for today. Planned on VL BFM (T/O 13:00)')
  })
  it('wears the amber ring and the amber "A" (D2583)', () => {
    line('VL BFM', '13:00', '14:00'); validate()
    expect(WARN.sev[0][ID]).toBe('adv')
    expect(WARN.chip[0][ID]).toBe('A')
  })
  it('a timed OFT: named as the sim', () => {
    sim('oft', 'EP-9', '10:00', '11:00')
    const w = his()
    expect(w).toHaveLength(1)
    expect(w[0].msg).toMatch(/^SANS: no availability filed for today\. Planned on Sim EP-9 10:00–11:00$/)
  })
  it('a flight with no times yet: warned too, as the crew list strikes him', () => {
    line('SSFU')
    // (a line with no mission leaves two spaces in the stored words, as before this change; the screen draws one)
    expect(his().map((w: any) => w.msg.replace(/\s+/g, ' '))).toEqual(['SANS: no availability filed for today. Planned on SSFU (no times yet)'])
  })
  it('an AMT with no times yet: warned too', () => {
    sim('amt', 'EP-9')
    expect(his()).toHaveLength(1)
  })
  it('never tells anybody to file', () => {
    line('VL BFM', '13:00', '14:00')
    expect(his()[0].msg).not.toMatch(/[Ff]ile it|to file|[Ff]ile for/)
  })
  it('a standby line needs nothing (D2584 Q4): no line', () => {
    const f: any = { cs: 'SC', msn: '', to: '07:00', ld: '13:00', aircraft: [{ p: ID, w: '', area: '', rmks: '', opts: {} }] }
    DAYS[0].waves.push({ label: 'SC AM', standalone: 'sc', night: false, intimes: [], traffic: [], formations: [f] })
    expect(his()).toHaveLength(0)
  })
  it('filed all day for Fly: no line', () => {
    line('VL BFM', '13:00', '14:00'); fileSans({ f: true })
    expect(his()).toHaveLength(0)
  })
})

describe('2a — the mismatch line says what he offered', () => {
  it('"Fly only" on an OFT: "SANS: offered Fly only today. Planned on Sim EP-9 10:00–11:00"', () => {
    sim('oft', 'EP-9', '10:00', '11:00'); fileSans({ f: true })
    expect(his().map((w: any) => w.msg)).toEqual(['SANS: offered Fly only today. Planned on Sim EP-9 10:00–11:00'])
  })
  it('"OFT and AMT" on a flight: "SANS: offered OFT and AMT only today."', () => {
    line('VL BFM', '13:00', '14:00'); fileSans({ o: true, a: true })
    expect(his().map((w: any) => w.msg)).toEqual(['SANS: offered OFT and AMT only today. Planned on VL BFM (T/O 13:00)'])
  })
  it('an untimed AMT, "OFT only": the same words', () => {
    sim('amt', 'EP-9'); fileSans({ o: true })
    expect(his()[0].msg).toMatch(/^SANS: offered OFT only today\. Planned on Sim EP-9/)
  })
  it('wrong hours keep their words: "SANS: available 08:00–10:00 only"', () => {
    line('VL BFM', '13:00', '14:00'); fileSans({ f: true }, [480, 600])
    expect(his()[0].msg).toMatch(/^SANS: available 08:00–10:00 only\. Planned on VL BFM \(T\/O 13:00\)$/)
  })
  it('"not offering" is never said any more', () => {
    line('VL BFM', '13:00', '14:00'); fileSans({ o: true })
    expect(his()[0].msg).not.toMatch(/not offering/)
  })
})

describe('3b — the check\'s name', () => {
  it('"SANS availability — not filed, or planned outside it"', () => {
    expect(WCODE.SANS_AVAIL).toBe('SANS availability — not filed, or planned outside it')
  })
})
