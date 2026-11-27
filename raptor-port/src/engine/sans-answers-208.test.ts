/* HIS ANSWERS TO THE SANS WARNING-LINES QUESTIONS (27 Nov 26, chat 208 — "all as recommended", the questions page of the
   warning-list piece's bug check):
   D2753 (Q1): the note after planting a SANS man who filed nothing, or something else, reads the CREW LIST's words —
     "Marlin — SANS — no availability filed for today", "Bolt — SANS — offered Fly only, not AMT" — never the warning line's.
   D2754 (Q2): a SANS line naming a sim says OFT or AMT and its row, "(end assumed)" for an end nobody typed, "(no times
     yet)" with none, "this OFT row" for a row with no name; the "available … only" line ends the same way.
   D2757 (Q6): the amber "A" hover words name the man with nothing filed.
   D2759 (Q9): a morning or afternoon filing reads as filed in his struck reason — "SANS — available AM only" / "PM only",
     a fresh Fable's check of the words, chat 208 — never "00:00–12:00" / "12:01–23:59"; typed hours stay hours.
   (D2755, Q3 — Fly · OFT · AMT on the "+ Commitment" form's ticks — is held by ui/sansform.test.tsx.) */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId } from './inputs'
import { validate, CHIP_LABEL } from './validate'
import { slotBar } from './avail'
import { SCHED } from './publish'
import { flagLine } from '../state/dropflag'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const ID = 'ipman'          // a SANS pilot of the seed, nothing filed for Mon 13 Jul, on nothing that day
const fileSans = (sans: any, extra: any = { allday: true }) => {
  const r: any = { person: ID, date: 'Jul 13', endDate: undefined, type: 'SANS Availability', sans, mod: 'now', ...extra }
  inpId(r); INPUTS.push(r); return r
}
const line = (name: string, to = '', ld = '') => {
  const [cs, msn = ''] = name.split(' ')
  const f: any = { cs, msn, to, ld, aircraft: [{ p: ID, w: '', area: '', rmks: '', opts: {} }] }
  DAYS[0].waves.push({ label: 'ZB', night: false, intimes: [], traffic: [], formations: [f] })
  return `0.${DAYS[0].waves.length - 1}.0.0.p`
}
const sim = (kind: 'oft' | 'amt', label: string, str = '', end = '') => {
  const rows = DAYS[0].sims[kind]
  rows.push({ label, str, end, p: ID, w: '' })
  return `s:0.${kind}.${rows.length - 1}.p`
}
const his = () => validate().all.filter((w: any) => w.code === 'SANS_AVAIL' && (w.who || []).includes(ID))
const one = () => { const w = his(); expect(w).toHaveLength(1); return w[0] }

describe('D2754 (Q2) — a sim is named OFT or AMT, and an end nobody typed says so', () => {
  it('a timed OFT: "Planned on OFT EP-9 10:00–11:00"', () => {
    sim('oft', 'EP-9', '10:00', '11:00')
    expect(one().msg).toBe('SANS: no availability filed for today. Planned on OFT EP-9 10:00–11:00')
  })
  it('a timed AMT: "Planned on AMT BOX 13:00–14:00"', () => {
    sim('amt', 'BOX', '13:00', '14:00')
    expect(one().msg).toBe('SANS: no availability filed for today. Planned on AMT BOX 13:00–14:00')
  })
  it('a start but no end: the assumed end is marked "(end assumed)"', () => {
    sim('oft', 'EP-9', '09:00')
    expect(one().msg).toBe('SANS: no availability filed for today. Planned on OFT EP-9 09:00–10:30 (end assumed)')
  })
  it('no times: "(no times yet)"', () => {
    sim('oft', 'EP-9')
    expect(one().msg).toBe('SANS: no availability filed for today. Planned on OFT EP-9 (no times yet)')
  })
  it('a row with no name and no times: "this OFT row (no times yet)"', () => {
    sim('oft', '')
    expect(one().msg).toBe('SANS: no availability filed for today. Planned on this OFT row (no times yet)')
  })
  it('the "available … only" line ends the same way', () => {
    fileSans({ a: true }, { allday: false, s: 8 * 60, e: 12 * 60 })
    sim('amt', 'BOX', '13:00', '14:00')
    expect(one().msg).toBe('SANS: available 08:00–12:00 only. Planned on AMT BOX 13:00–14:00')
  })
  it('a flight keeps its flying words', () => {
    line('VL BFM', '13:00', '14:00')
    expect(one().msg).toBe('SANS: no availability filed for today. Planned on VL BFM (T/O 13:00)')
  })
})

describe('D2753 (Q1) — the note after planting him reads the crew list\'s words', () => {
  it('nothing filed: "Ipman — SANS — no availability filed for today"', () => {
    const key = line('VL BFM', '13:00', '14:00')
    const w = one()
    expect(flagLine(w, 0)).toMatch(/ — SANS — no availability filed for today$/)
    expect(w.crewWhy).toBe(slotBar(ID, key))
  })
  it('a filing of something else: "… — SANS — offered Fly only, not AMT"', () => {
    fileSans({ f: true })
    const key = sim('amt', 'BOX', '13:00', '14:00')
    const w = one()
    expect(flagLine(w, 0)).toMatch(/ — SANS — offered Fly only, not AMT$/)
    expect(w.crewWhy).toBe(slotBar(ID, key))
  })
  it('the warning list itself keeps its longer line naming the event', () => {
    fileSans({ f: true })
    sim('amt', 'BOX', '13:00', '14:00')
    expect(one().msg).toBe('SANS: offered Fly only today. Planned on AMT BOX 13:00–14:00')
  })
  it('another day keeps its day in front', () => {
    line('VL BFM', '13:00', '14:00')
    expect(flagLine(one(), 3)).toMatch(/^Mon · .* — SANS — no availability filed for today$/)
  })
})

describe('D2759 (Q9) — a morning or afternoon filing reads as filed', () => {
  it('PM filed, struck for a morning flight: "SANS — available PM only"', () => {
    fileSans({ f: true }, { allday: false, half: 'pm' })
    const key = line('VL BFM', '08:00', '09:00')
    expect(slotBar(ID, key)).toBe('SANS — available PM only')
  })
  it('AM filed, struck for an afternoon flight: "SANS — available AM only"', () => {
    fileSans({ f: true }, { allday: false, half: 'am' })
    const key = line('VL BFM', '14:00', '15:00')
    expect(slotBar(ID, key)).toBe('SANS — available AM only')
  })
  it('hours he typed stay hours', () => {
    fileSans({ f: true }, { allday: false, s: 8 * 60, e: 10 * 60 })
    const key = line('VL BFM', '14:00', '15:00')
    expect(slotBar(ID, key)).toBe('SANS — available 08:00–10:00 only')
  })
  it('the note after planting him says the same', () => {
    fileSans({ f: true }, { allday: false, half: 'pm' })
    line('VL BFM', '08:00', '09:00')
    expect(flagLine(one(), 0)).toMatch(/ — SANS — available PM only$/)
  })
})

describe('D2757 (Q6) — the amber "A" hover words', () => {
  it('name the man with nothing filed', () => {
    expect(CHIP_LABEL.A).toBe('Advisory — on shift and also down for a ground event or programme item; or SANS availability not filed, or planned outside it')
  })
})
