/* HIS D2584 Q2 (25 Nov 26, "The rest as recommended" — the SANS leftovers page, as drawn), answering D2575: on the crew
   list a SANS man whose filing misses the event armed is struck with words naming what he offered AND the event planned —
   "SANS — offered Fly only, not OFT"; two offered: "SANS — offered OFT and AMT only, not Fly" — in place of today's
   "SANS — not offering OFT". The events in his card's order, F, O, A, as the warning list's line names them (D2584 2a,
   engine/avail.ts sansOfferedWords). Fable's words, kept as drafted (docs/superpowers/briefs/2026-11-25-sans-leftovers-
   words-fable.md §B). A seat with no times reads the same (D2585), standby never (D2584 Q4). The crew list's strike, the
   drag hover, the drop's note and the green rings all read slotBar, so this pins them all. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId } from './inputs'
import { validate } from './validate'
import { slotBar } from './avail'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const ID = 'ipman'          // a SANS pilot of the seed, nothing filed for Mon 13 Jul
const fileSans = (sans: any) => {
  const r: any = { person: ID, date: 'Jul 13', endDate: undefined, allday: true, type: 'SANS Availability', sans, mod: 'now' }
  inpId(r); INPUTS.push(r); validate(); return r
}
/* a new flying line on Monday — with times, or with none typed yet */
const line = (timed: boolean) => {
  const f: any = { cs: timed ? 'VL' : '', msn: timed ? 'BFM' : '', to: timed ? '13:00' : '', ld: timed ? '14:00' : '',
    aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] }
  DAYS[0].waves.push({ label: 'ZB', night: false, intimes: [], traffic: [], formations: [f] })
  validate()
  return `0.${DAYS[0].waves.length - 1}.0.0.p`
}
/* a new OFT or AMT row on Monday — with times, or with none */
const sim = (kind: 'oft' | 'amt', timed: boolean) => {
  const rows = DAYS[0].sims[kind]
  rows.push({ label: 'EP-9', str: timed ? '09:00' : '', end: timed ? '10:30' : '', p: '', w: '' })
  validate()
  return `s:0.${kind}.${rows.length - 1}`
}

describe('D2584 Q2 — the crew list names what he offered, and the event armed', () => {
  for (const timed of [true, false]) {
    const t = timed ? 'timed' : 'no times yet'
    it(`a flight (${t}), "OFT only": SANS — offered OFT only, not Fly`, () => {
      const key = line(timed); fileSans({ o: true })
      expect(slotBar(ID, key)).toBe('SANS — offered OFT only, not Fly')
    })
    it(`a flight (${t}), "OFT and AMT": SANS — offered OFT and AMT only, not Fly (B3)`, () => {
      const key = line(timed); fileSans({ o: true, a: true })
      expect(slotBar(ID, key)).toBe('SANS — offered OFT and AMT only, not Fly')
    })
    it(`an OFT (${t}), "Fly only", front and rear: SANS — offered Fly only, not OFT (B1)`, () => {
      const row = sim('oft', timed); fileSans({ f: true })
      expect(slotBar(ID, `${row}.p`)).toBe('SANS — offered Fly only, not OFT')
      expect(slotBar(ID, `${row}.w`)).toBe('SANS — offered Fly only, not OFT')
    })
    it(`an AMT (${t}), "OFT only": SANS — offered OFT only, not AMT (B2 — OFT against AMT a miss too, D2572)`, () => {
      const row = sim('amt', timed); fileSans({ o: true })
      expect(slotBar(ID, `${row}.p`)).toBe('SANS — offered OFT only, not AMT')
    })
    it(`an AMT (${t}), "Fly and OFT": the events in the card's order, F then O`, () => {
      const row = sim('amt', timed); fileSans({ o: true, f: true })
      expect(slotBar(ID, `${row}.p`)).toBe('SANS — offered Fly and OFT only, not AMT')
    })
  }
  it('a record that ticks nothing keeps "SANS — not offering OFT" (nothing to name)', () => {
    const row = sim('oft', true); fileSans({})
    expect(slotBar(ID, `${row}.p`)).toBe('SANS — not offering OFT')
  })
  it('the event he offered stays plain; nothing filed keeps its own words', () => {
    const row = sim('oft', true)
    expect(slotBar(ID, `${row}.p`)).toBe('SANS — no availability filed for today')
    fileSans({ o: true })
    expect(slotBar(ID, `${row}.p`)).not.toMatch(/^SANS/)
  })
})
