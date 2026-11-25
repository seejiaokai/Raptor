/* HIS D2584 (25 Nov 26, "The rest as recommended" — the SANS leftovers page), two of its answers:
   Q4 — SC MAIN, SC SPARE, BB and AVALON never strike a SANS man for SANS availability, flying or not, timed or not
        (D2576, D2578: they need no SANS availability): the crew list, the warning list and his bell's reminder all leave
        those lines alone. The "SANS — told on his bell" note is built with the SANS info line, nothing before.
   Q5 — an OFT or AMT seat with no times strikes a SANS man with nothing filed, as a flight with no times does (D2573).
   The halves left as they are: an ordinary flight still strikes and warns; a sim with no times still leaves a man who
   filed something plain (D2573's "unchanged"). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId } from './inputs'
import { PEOPLE } from './people'
import { validate } from './validate'
import { slotBar, daySansSeats } from './avail'
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

const NONE = 'SANS — no availability filed for today'
const ID = 'ipman'          // a SANS pilot of the seed, nothing filed for Mon 13 Jul
const fileSans = (sans: any) => {
  const r: any = { person: ID, date: 'Jul 13', endDate: undefined, allday: true, type: 'SANS Availability', sans, mod: 'now' }
  inpId(r); INPUTS.push(r); return r
}
const sansWarns = () => validate().all.filter((w: any) => (w.who || []).includes(ID) && w.code === 'SANS_AVAIL')
/* a standby wave of the kind, its first shift timed 07:00–13:00; `fly` ticks the row by hand (a row that flies) */
const standby = (kind: string, fly = false) => {
  const w: any = makeStandalone(kind)
  w.formations = [w.formations[0]]
  w.formations[0].to = '07:00'; w.formations[0].ld = '13:00'
  if (fly) w.formations[0].aircraft.forEach((a: any) => { a.fly = true })
  DAYS[0].waves.push(w); const gi = DAYS[0].waves.length - 1
  return { w, gi, rows: w.formations[0].aircraft.map((a: any, ai: number) => ({ a, key: `0.${gi}.0.${ai}.p` })) }
}

describe('D2584 Q4 — standby lines never ask a SANS man for availability', () => {
  for (const kind of ['sc', 'avalon', 'bb']) {
    for (const fly of [false, true]) {
      it(`${kind}${fly ? ', a row ticked Flies' : ''}: every MAIN and SPARE seat, timed — not struck, no warning, no reminder`, () => {
        const { rows } = standby(kind, fly)
        validate()
        rows.forEach(({ a, key }: any) => expect(slotBar(ID, key), `${kind} ${a.spare ? 'SPARE' : 'MAIN'}`).not.toMatch(/^SANS/))
        rows[0].a.p = ID
        expect(sansWarns(), 'the warning list').toEqual([])
        expect(daySansSeats(DAYS[0]).has(ID), 'his bell does not count the day').toBe(false)
      })
    }
  }

  it('filed something that misses (OFT only) on an SC MAIN: still nothing — the line needs no SANS availability', () => {
    fileSans({ o: true })
    const { rows } = standby('sc')
    validate()
    expect(slotBar(ID, rows[0].key)).not.toMatch(/^SANS/)
    rows[0].a.p = ID
    expect(sansWarns()).toEqual([])
  })

  it('left as it is: an ordinary timed flight still strikes, warns (filed OFT only) and counts for his bell', () => {
    const key = '0.0.0.0.p'
    expect(slotBar(ID, key), 'nothing filed — struck').toBe(NONE)
    fileSans({ o: true })
    DAYS[0].waves[0].formations[0].aircraft[0].p = ID
    expect(sansWarns().length, 'OFT only, planned to fly — warned').toBe(1)
    expect(daySansSeats(DAYS[0]).has(ID)).toBe(true)
  })
})

describe('D2584 Q5 — an OFT or AMT seat with no times strikes him as a flight with no times does', () => {
  const blankSim = (kind: 'oft' | 'amt') => {
    const rows = DAYS[0].sims[kind]
    rows.push({ label: 'EP-9', str: '', end: '', p: '', w: '' })
    return `s:0.${kind}.${rows.length - 1}`
  }
  for (const kind of ['oft', 'amt'] as const) {
    it(`${kind.toUpperCase()} with no times, nothing filed: front and rear seat struck in the timed words`, () => {
      const row = blankSim(kind)
      validate()
      expect(slotBar(ID, `${row}.p`)).toBe(NONE)
      expect(slotBar(ID, `${row}.w`)).toBe(NONE)
    })
    it(`${kind.toUpperCase()} with no times, something filed: left plain (nothing to hold his offer against yet)`, () => {
      const row = blankSim(kind)
      fileSans({ f: true })
      validate()
      expect(slotBar(ID, `${row}.p`)).not.toMatch(/^SANS/)
    })
  }
  it('a non-SANS man on an untimed sim is never asked', () => {
    const row = blankSim('oft')
    validate()
    const reg = Object.keys(PEOPLE).find(id => PEOPLE[id] && PEOPLE[id].seat === 'FCP' && !PEOPLE[id].san && !PEOPLE[id].special && !PEOPLE[id].pers)!
    expect(slotBar(reg, `${row}.p`)).not.toMatch(/^SANS/)
  })
})
