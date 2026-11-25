/* HIS D2585 (25 Nov 26, question A — "Ok an and B as recommended"): before a seat's times are typed, a SANS man whose
   filing does not cover that event — "OFT only" on a flight, "Fly only" or "AMT only" on an OFT, and the like — is struck
   on the crew list at once, "SANS — not offering Fly" (or OFT, AMT), as on a timed seat; a man who offered the event with
   hours stays plain until the times are typed (there is nothing yet to hold his hours against). Narrows D2573's "a man
   who has filed something is unchanged". Standby lines stay out of it (D2584 Q4); a sim's extra places strike as its
   seats (D2586). The crew list's strike, the drag hover, the drop's note and the green rings all read slotBar. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId } from './inputs'
import { PEOPLE } from './people'
import { validate } from './validate'
import { slotBar } from './avail'
import { SCHED } from './publish'
import { makeStandalone } from './waves'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const ID = 'ipman'          // a SANS pilot of the seed, nothing filed for Mon 13 Jul
/* his SANS availability for Monday: `sans` the events ticked, `hours` a window [s, e] in minutes, or all day */
const fileSans = (sans: any, hours?: [number, number]) => {
  const r: any = { person: ID, date: 'Jul 13', endDate: undefined, allday: !hours, type: 'SANS Availability', sans, mod: 'now',
    ...(hours ? { s: hours[0], e: hours[1] } : {}) }
  inpId(r); INPUTS.push(r); validate(); return r
}
/* a new flying line on Monday, nothing typed yet */
const blankLine = () => {
  const f: any = { cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] }
  DAYS[0].waves.push({ label: 'ZB', night: false, intimes: [], traffic: [], formations: [f] })
  return `0.${DAYS[0].waves.length - 1}.0.0.p`
}
/* a new OFT or AMT row on Monday with no times */
const blankSim = (kind: 'oft' | 'amt') => {
  const rows = DAYS[0].sims[kind]
  rows.push({ label: 'EP-9', str: '', end: '', p: '', w: '' })
  return `s:0.${kind}.${rows.length - 1}`
}

describe('D2585 — a flight with no times: struck at once where his filing does not offer Fly', () => {
  it('"OFT only": SANS — not offering Fly', () => {
    const key = blankLine(); fileSans({ o: true })
    expect(slotBar(ID, key)).toBe('SANS — not offering Fly')
  })
  it('"OFT and AMT": SANS — not offering Fly', () => {
    const key = blankLine(); fileSans({ o: true, a: true })
    expect(slotBar(ID, key)).toBe('SANS — not offering Fly')
  })
  it('Fly offered with hours: plain until the times are typed', () => {
    const key = blankLine(); fileSans({ f: true }, [480, 600])
    expect(slotBar(ID, key)).not.toMatch(/^SANS/)
  })
  it('Fly offered all day: plain', () => {
    const key = blankLine(); fileSans({ f: true })
    expect(slotBar(ID, key)).not.toMatch(/^SANS/)
  })
  it('the same words once the times are typed — one reason, before and after', () => {
    const key = blankLine(); fileSans({ o: true })
    const before = slotBar(ID, key)
    const f = DAYS[0].waves[DAYS[0].waves.length - 1].formations[0]; f.to = '13:00'; f.ld = '14:00'; validate()
    expect(slotBar(ID, key)).toBe('SANS — not offering Fly')
    expect(before).toBe('SANS — not offering Fly')
  })
})

describe('D2585 — an OFT or AMT with no times: struck at once where his filing does not offer that sim', () => {
  it('OFT, "Fly only": SANS — not offering OFT, front and rear', () => {
    const row = blankSim('oft'); fileSans({ f: true })
    expect(slotBar(ID, `${row}.p`)).toBe('SANS — not offering OFT')
    expect(slotBar(ID, `${row}.w`)).toBe('SANS — not offering OFT')
  })
  it('OFT, "AMT only": SANS — not offering OFT', () => {
    const row = blankSim('oft'); fileSans({ a: true })
    expect(slotBar(ID, `${row}.p`)).toBe('SANS — not offering OFT')
  })
  it('AMT, "Fly and OFT": SANS — not offering AMT', () => {
    const row = blankSim('amt'); fileSans({ f: true, o: true })
    expect(slotBar(ID, `${row}.p`)).toBe('SANS — not offering AMT')
  })
  it('OFT offered with hours: plain until the times are typed', () => {
    const row = blankSim('oft'); fileSans({ o: true }, [480, 600])
    expect(slotBar(ID, `${row}.p`)).not.toMatch(/^SANS/)
  })
  it("a sim's extra place strikes as its seats do (D2586): OFT, \"Fly only\"", () => {
    const row = blankSim('oft'); fileSans({ f: true })
    expect(slotBar(ID, `${row}.+`)).toBe('SANS — not offering OFT')
  })
})

/* THE WARNING LIST AGREES (the bug check's two blind reads, chat 182 — Astra and a fresh Opus, the same finding): once he is
   planned on an untimed OFT or AMT whose event his filing does not offer, the warning list raises the same amber line it
   raises for a timed sim ("SANS: not offering OFT today. Planned on …"), as it already does for an untimed flight — the
   crew list's strike and the warning list never drift apart. Nothing filed stays silent (D2579, not built); an offer of
   the sim with hours raises nothing while there are no times. */
describe('D2585 — the warning list agrees once he is planned on an untimed sim', () => {
  const sansWarns = (key: string) => validate().all.filter((w: any) => w.code === 'SANS_AVAIL' && (w.who || []).includes(ID) && w.key === key)
  for (const kind of ['oft', 'amt'] as const) {
    it(`${kind.toUpperCase()} with no times, "Fly only", in the front seat: one amber line, "not offering ${kind.toUpperCase()}"`, () => {
      const row = blankSim(kind); fileSans({ f: true })
      DAYS[0].sims[kind][DAYS[0].sims[kind].length - 1].p = ID
      const hits = sansWarns(row)
      expect(hits).toHaveLength(1)
      expect(hits[0].sev).toBe('adv')
      expect(hits[0].msg).toContain(`not offering ${kind.toUpperCase()} today`)
    })
  }
  it('an extra place on an untimed OFT, "Fly only": warned too (D2586)', () => {
    const row = blankSim('oft'); fileSans({ f: true })
    DAYS[0].sims.oft[DAYS[0].sims.oft.length - 1].more = [ID]
    expect(sansWarns(row)).toHaveLength(1)
  })
  it('an OFT with its end typed and no start, "Fly only": warned', () => {
    const row = blankSim('oft'); fileSans({ f: true })
    const r = DAYS[0].sims.oft[DAYS[0].sims.oft.length - 1]; r.end = '13:00'; r.p = ID
    expect(sansWarns(row)).toHaveLength(1)
  })
  it('left silent: nothing filed (D2579 not built), and OFT offered with hours while untimed', () => {
    const row = blankSim('oft')
    DAYS[0].sims.oft[DAYS[0].sims.oft.length - 1].p = ID
    expect(sansWarns(row), 'nothing filed').toHaveLength(0)
    fileSans({ o: true }, [480, 600])
    expect(sansWarns(row), 'OFT offered 08:00–10:00, no times to hold it against').toHaveLength(0)
  })
  it('left silent: a cancelled untimed OFT', () => {
    const row = blankSim('oft'); fileSans({ f: true })
    const r = DAYS[0].sims.oft[DAYS[0].sims.oft.length - 1]; r.p = ID; r.cx = 'WX'
    expect(sansWarns(row)).toHaveLength(0)
  })
})

describe('D2585 — left as they are', () => {
  it('a standby line never asks (D2584 Q4): an SC MAIN with no times, "OFT only" — plain', () => {
    const w: any = makeStandalone('sc'); w.formations = [w.formations[0]]
    w.formations[0].to = ''; w.formations[0].ld = ''
    DAYS[0].waves.push(w)
    fileSans({ o: true })
    expect(slotBar(ID, `0.${DAYS[0].waves.length - 1}.0.0.p`)).not.toMatch(/^SANS/)
  })
  it('a man who is not SANS is never asked', () => {
    const key = blankLine()
    const reg = Object.keys(PEOPLE).find(id => PEOPLE[id] && PEOPLE[id].seat === 'FCP' && !PEOPLE[id].san && !PEOPLE[id].special && !PEOPLE[id].pers)!
    expect(slotBar(reg, key)).not.toMatch(/^SANS/)
  })
  it('nothing filed still reads the nothing-filed words (D2573, D2584 Q5)', () => {
    expect(slotBar(ID, blankLine())).toBe('SANS — no availability filed for today')
    expect(slotBar(ID, `${blankSim('amt')}.p`)).toBe('SANS — no availability filed for today')
  })
})
