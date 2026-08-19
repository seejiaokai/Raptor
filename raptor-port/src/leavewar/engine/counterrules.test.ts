// The custom counters' maths (owner, 19 Aug 26): who a filter matches, what
// the two rule shapes count, and — the load-bearing pin — that the seeded
// rules, now data, read EXACTLY what the old hard-coded kinds read on the
// same world. A migration that moved any number would repaint days the
// squadron already judged.

import { describe, expect, it } from 'vitest'
import { countsFor, effectiveCat, matchesFilter, ruleHave, type Grid } from './availability'
import type { States } from './bids'
import type { Person } from './people'
import type { RuleCount } from './requirements'
import { seedPeople, seedRequirements, seedWars } from './seed'

const p = (id: string, seat: Person['seat'], band: Person['band'], over: Partial<Person> = {}): Person => ({
  id, callsign: id.toUpperCase(), seat, band, sxo: false, from: null, to: null, ...over,
})

describe('effectiveCat', () => {
  it('reads the Raptor CAT when the projection carries one', () => {
    expect(effectiveCat(p('a', 'pilot', 'ops', { q: 'b' }))).toBe('B')
  })
  it('falls back to the instructor band when the CAT is missing', () => {
    expect(effectiveCat(p('a', 'pilot', 'instructor'))).toBe('IP')
    expect(effectiveCat(p('a', 'wso', 'instructor'))).toBe('IW')
  })
  it('reads empty for an ops person with no CAT — the junior default', () => {
    expect(effectiveCat(p('a', 'pilot', 'ops'))).toBe('')
  })
})

describe('matchesFilter', () => {
  const nvgPilot = p('a', 'pilot', 'ops', { q: 'B', xq: ['nvg', 'imc'] })

  it('an empty filter matches any aircrew', () => {
    expect(matchesFilter(nvgPilot, {})).toBe(true)
  })
  it('filters by seat, CAT and qualification together', () => {
    expect(matchesFilter(nvgPilot, { seats: ['pilot'], cats: ['A', 'B'], quals: ['nvg'] })).toBe(true)
    expect(matchesFilter(nvgPilot, { seats: ['wso'] })).toBe(false)
    expect(matchesFilter(nvgPilot, { cats: ['A'] })).toBe(false)
    expect(matchesFilter(nvgPilot, { quals: ['nvg', 'tf'] })).toBe(false) // ALL required
  })
  it('speaks "everyone except" through notCats and notQuals', () => {
    expect(matchesFilter(nvgPilot, { notCats: ['OCU'] })).toBe(true)
    expect(matchesFilter(nvgPilot, { notCats: ['B'] })).toBe(false)
    expect(matchesFilter(nvgPilot, { notQuals: ['nvg'] })).toBe(false)
  })
  it('folds the seed flags into the held set, so a seed person answers like a projected one', () => {
    const sxoSeed = p('a', 'wso', 'ops', { sxo: true, scd: true })
    expect(matchesFilter(sxoSeed, { quals: ['sxo', 'scDay'] })).toBe(true)
    expect(matchesFilter(sxoSeed, { quals: ['scNight'] })).toBe(false)
  })
})

describe('ruleHave', () => {
  const crew = [
    p('p1', 'pilot', 'ops', { q: 'A' }),
    p('p2', 'pilot', 'ops', { q: 'C' }),
    p('w1', 'wso', 'ops'),
    p('g1', 'gnd', 'ops', { pers: true }),
  ]
  const D = '2026-01-05'

  it('a people rule sums availability over the filter, ground crew never counted', () => {
    const rc: RuleCount = { kind: 'people', filter: {} }
    expect(ruleHave(rc, crew, {}, {}, D)).toBe(3)
    const grid: Grid = { p1: { [D]: '*LL' } }
    expect(ruleHave(rc, crew, grid, {}, D)).toBe(2.5)
  })

  it('a team rule needs a different person per slot — one body cannot fill two', () => {
    // One SXO who is also the only SC-day hand: two slots want two bodies and
    // there is one, so the rule reads HALF a team — fractional, exactly the
    // SC rows' own idiom (their spec case "the only SXO is one of only two
    // SC-day pilots" reads 0.667, under one complete team). Never 1: a whole
    // team out of one person would be the double-count this maths exists to
    // prevent.
    const one = [p('x', 'pilot', 'ops', { sxo: true, scd: true })]
    const rc: RuleCount = {
      kind: 'team',
      slots: [{ count: 1, filter: { quals: ['scDay'] } }, { count: 1, filter: { quals: ['sxo'] } }],
    }
    expect(ruleHave(rc, one, {}, {}, D)).toBe(0.5)
    const two = [...one, p('y', 'wso', 'ops', { scd: true })]
    expect(ruleHave(rc, two, {}, {}, D)).toBe(1)
  })

  it('show: people reports the bodies inside complete teams, not the team count', () => {
    const rc: RuleCount = {
      kind: 'team',
      slots: [{ count: 1, filter: { seats: ['pilot'] } }, { count: 1, filter: { seats: ['wso'] } }],
      show: 'people',
    }
    expect(ruleHave(rc, crew, {}, {}, D)).toBe(2) // 1 set × 2 people
  })

  it('presence counts a man standing SC duty; availability does not', () => {
    const duo = [p('p1', 'pilot', 'ops', { scd: true }), p('w1', 'wso', 'ops', { scd: true })]
    const grid: Grid = { p1: { [D]: 'FS' } }
    const slots = [{ count: 1, filter: { seats: ['pilot' as const], quals: ['scDay'] } }, { count: 1, filter: { seats: ['wso' as const], quals: ['scDay'] } }]
    expect(ruleHave({ kind: 'team', slots, presence: true }, duo, grid, {}, D)).toBe(1)
    expect(ruleHave({ kind: 'team', slots }, duo, grid, {}, D)).toBe(0)
  })
})

// THE MIGRATION PIN. Every seeded rule, evaluated as data, must read exactly
// what the old hard-coded kind read — across the whole seeded demo war, every
// date, leave, halves, duty and posting-out windows included. `countsFor`
// still computes the old figures, which is precisely what makes it the
// reference here.
describe('the seeded rules read what the hard-coded kinds read', () => {
  const people = seedPeople()
  const war = seedWars()[0]
  const grid = war.grid as Grid
  const states = war.states as States
  const rules = seedRequirements().default.rules
  const dates: string[] = war.period.days.map(d => d.date)

  const OLD: Record<string, (c: ReturnType<typeof countsFor>) => number> = {
    sets: c => c.sets,
    ip: c => c.byCategory.IP,
    iwso: c => c.byCategory.IWSO,
    instr: c => c.byCategory.IP + c.byCategory.IWSO,
    opsp: c => c.byCategory.OPSP,
    opsw: c => c.byCategory.OPSW,
    flp: c => c.flp,
    wmp: c => c.wmp,
    sxo: c => c.sxo,
    scd: c => c.scd,
    scn: c => c.scn,
  }

  it('covers every seeded rule', () => {
    expect(rules.map(r => r.id).sort()).toEqual(Object.keys(OLD).sort())
  })

  for (const rule of seedRequirements().default.rules) {
    it(`${rule.id} agrees on every day of the seeded war`, () => {
      for (const date of dates) {
        const counts = countsFor(people, grid, states, date)
        const have = ruleHave(rule.count, people, grid, states, date)
        expect(have, `${rule.id} on ${date}`).toBeCloseTo(OLD[rule.id](counts), 6)
      }
    })
  }
})
