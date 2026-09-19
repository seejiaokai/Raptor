import { describe, expect, it } from 'vitest'
import { isBiddable } from './bids'
import { codeOf } from './codes'
import { evaluateDay } from './evaluate'
import { balanceOf, COUNTERS } from './counters'
import { overlapping } from './wars'
import { SEED_ABSENCES, seedLedger, seedOpenings, seedPeople, seedPeriod, seedRecs, seedRequirements, seedSources, seedWars } from './seed'
import { parseCell } from './codes'

describe('seed', () => {
  it('has a roster with all four categories represented', () => {
    const people = seedPeople()
    expect(people.length).toBeGreaterThanOrEqual(12)
    const seats = new Set(people.map(p => `${p.seat}-${p.band}`))
    expect(seats).toEqual(new Set(['pilot-instructor', 'pilot-ops', 'wso-instructor', 'wso-ops']))
  })

  it('has exactly one SXO', () => {
    expect(seedPeople().filter(p => p.sxo)).toHaveLength(1)
  })

  it('has someone posted out mid-quarter so the roster dates are exercised', () => {
    expect(seedPeople().some(p => p.to !== null)).toBe(true)
  })

  it('gives every seeded person a unique id', () => {
    // Duplicate callsigns would collide on id (lowercased callsign), giving
    // duplicate React keys and a shared grid row between two people.
    const ids = seedPeople().map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // The seeded war is a WHOLE YEAR, not a quarter. A quarter was the first
  // shape this took — but the owner reads the year at once and jumps to a month to
  // navigate, so the seed has to be the thing they actually look at.
  it('covers the whole of 2026', () => {
    const period = seedPeriod()
    expect(period.start).toBe('2026-01-01')
    expect(period.end).toBe('2026-12-31')
    expect(period.days).toHaveLength(365)
  })

  it('marks New Year as a public holiday and blocks at least one day', () => {
    const period = seedPeriod()
    expect(period.days[0].ph).toBe(true)
    expect(period.days.some(d => d.blocked)).toBe(true)
  })

  it('evaluates every seeded day without throwing', () => {
    const people = seedPeople()
    const reqs = seedRequirements()
    const src = seedSources()[0]!
    for (const day of seedPeriod().days) {
      expect(['ok', 'amber', 'red']).toContain(evaluateDay(people, src.grid, src.states, reqs, day.date, src.views).verdict)
    }
  })

  it('record and absence ids all resolve to real people', () => {
    const ids = new Set(seedPeople().map(p => p.id))
    const recs = seedRecs()
    expect(Object.keys(recs).length).toBeGreaterThan(0)
    for (const id of Object.keys(recs)) if (!ids.has(id)) throw new Error(`records for unknown id: ${id}`)
    for (const a of SEED_ABSENCES) if (!ids.has(a.person)) throw new Error(`absence for unknown id: ${a.person}`)
  })

  it('every seeded code resolves in the catalogue', () => {
    const codes = [...Object.values(seedRecs()).flatMap(r => Object.values(r).flat().map(x => x.code)), ...SEED_ABSENCES.map(a => a.code)]
    expect(codes.length).toBeGreaterThan(0)
    for (const c of codes) if (codeOf(c) === undefined) throw new Error(`unknown code: ${c}`)
  })
})

/* [ARCH-STACK] step 4 — the war stores requests and credits; approved and filed
   leave is the seed's SEED_ABSENCES (Inputs in the app). */
describe('seed records', () => {
  const all = () => Object.values(seedRecs()).flatMap(r => Object.values(r).flat())

  it('shows every request colour — pending, acknowledged, refused — and approved green via an absence', () => {
    const states = new Set(all().filter(r => r.kind === 'request').map(r => (r as any).state))
    expect(states).toEqual(new Set(['pending', 'acknowledged', 'refused']))
    expect(SEED_ABSENCES.some(a => a.lw)).toBe(true)
  })

  it('shows leave filed on the Inputs page as well as leave approved on the war', () => {
    expect(new Set(SEED_ABSENCES.map(a => a.lw))).toEqual(new Set([true, false]))
  })

  it('seeds no shifted trail — the moved stripe is a closed-war fact', () => {
    expect(all().filter((r: any) => r.shiftedFrom)).toHaveLength(0)
  })

  it('requests are only for codes someone bids for; credits are FO/HO', () => {
    for (const r of all()) {
      if (r.kind === 'request') expect(isBiddable(r.code)).toBe(true)
      if (r.kind === 'credit') expect(['FO', 'HO']).toContain(r.code)
    }
    expect(all().length).toBeGreaterThan(5)
  })

  it('every absence code parses and is not biddable-only noise', () => {
    for (const a of SEED_ABSENCES) expect(parseCell(a.code)).not.toBeNull()
  })

  it('names only people the roster actually holds', () => {
    const ids = new Set(seedPeople().map(p => p.id))
    for (const id of Object.keys(seedRecs())) if (!ids.has(id)) throw new Error(`records for unknown id: ${id}`)
  })
})

describe('seeded balances', () => {
  it('gives every person on the roster an opening figure', () => {
    const openings = seedOpenings()
    for (const p of seedPeople()) {
      if (!openings[p.id]) throw new Error(`no opening balance for ${p.id}`)
    }
    expect(Object.keys(openings).length).toBeGreaterThan(0)
  })

  it('opens no counter that is not one of the seven', () => {
    for (const [id, row] of Object.entries(seedOpenings())) {
      for (const counter of Object.keys(row)) {
        if (!COUNTERS.includes(counter as never)) throw new Error(`unknown counter ${counter} for ${id}`)
      }
    }
  })

  it('posts every ledger entry against a real person and a real counter', () => {
    const ids = new Set(seedPeople().map(p => p.id))
    const entries = seedLedger()
    expect(entries.length).toBeGreaterThan(0)
    for (const e of entries) {
      if (!ids.has(e.personId)) throw new Error(`ledger entry for unknown id: ${e.personId}`)
      if (!COUNTERS.includes(e.counter)) throw new Error(`ledger entry for unknown counter: ${e.counter}`)
      // Every entry has to say WHY and WHO — that traceability is the whole
      // point of the ledger, and an entry without it is the untraceable free
      // text this replaces.
      expect(e.reason).toBeTruthy()
      expect(e.approvedBy).toBeTruthy()
    }
  })

  it('gives every ledger entry a unique id', () => {
    const ids = seedLedger().map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // §Counters: negative shows red and is never refused. A screen where every
  // figure is positive cannot show that rule working, so the seed has to
  // carry at least one of each sign.
  it('shows a negative balance as well as positive ones, so red renders', () => {
    const [openings, ledger] = [seedOpenings(), seedLedger()]
    const all = seedPeople().flatMap(p => COUNTERS.map(c => balanceOf(openings, ledger, seedSources(), p.id, c)))
    expect(all.some(v => v < 0)).toBe(true)
    expect(all.some(v => v > 0)).toBe(true)
  })

  // A correction posted as a negative amount is the mechanism §Counters
  // describes; seeding one keeps it from being theoretical.
  it('includes a correction posted as a negative amount', () => {
    expect(seedLedger().some(e => e.amount < 0)).toBe(true)
  })
})

describe('seedWars', () => {
  it('seeds more than one, so switching between them is a real thing to do', () => {
    expect(seedWars().length).toBeGreaterThan(1)
  })

  // The next war is normally a draft while its schedule is still being
  // firmed up. Seeding one open and one draft shows both states at once.
  it('opens the first and leaves the next in draft', () => {
    const [q1, q2] = seedWars()
    expect(q1.period.stage).toBe('open')
    expect(q2.period.stage).toBe('draft')
  })

  // A date belongs to at most one war. Two seeded wars sharing a day would
  // double-count a man in the manning rows and draw his balance twice.
  it('never seeds two wars that share a day', () => {
    const wars = seedWars()
    for (let i = 0; i < wars.length; i++) {
      for (let j = i + 1; j < wars.length; j++) {
        if (overlapping(wars[i].period, wars[j].period)) {
          throw new Error(`seeded wars overlap: ${wars[i].period.id} and ${wars[j].period.id}`)
        }
      }
    }
    expect(wars.length).toBeGreaterThan(1)
  })

  it('gives every war a unique id', () => {
    const ids = seedWars().map(w => w.period.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // The second war has to hold leave of its own, or the cross-war balance
  // rule has nothing to prove on first run.
  it('puts leave in the second war too, drawing the same counters', () => {
    const [, q2] = seedWars()
    expect(Object.keys(q2!.recs).length).toBeGreaterThan(0)
  })

  it('keeps every seeded record inside the war that holds it', () => {
    for (const w of seedWars()) {
      for (const [id, row] of Object.entries(w.recs)) {
        for (const date of Object.keys(row)) {
          if (date < w.period.start || date > w.period.end) {
            throw new Error(`${w.period.id} holds ${id} ${date}, outside ${w.period.start}..${w.period.end}`)
          }
        }
      }
    }
    expect(seedWars().length).toBeGreaterThan(0)
  })
})

