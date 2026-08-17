// Wire 0: the projection of Raptor's PEOPLE into Leave War people, and the
// boot-time demo re-key that dresses the seeded demo world in that crew.

import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { seedPeople } from '../engine'
import { DEMO_MAP, installDemoWorld } from './demoworld'
import { projectPeople } from './raptorRoster'
import { getState, initStore } from './store'
import { memoryBackend } from './storage'

describe('projectPeople', () => {
  const people = projectPeople()
  const byId = new Map(people.map(p => [p.id, p]))

  it('projects an FCP instructor as an instructor pilot', () => {
    // bane: FCP, CAT IP, SXO — the shape every seat/band/sxo fact rides on.
    expect(byId.get('bane')).toMatchObject({
      callsign: 'Bane', seat: 'pilot', band: 'instructor', sxo: true,
    })
  })

  it('projects an RCP non-instructor as an ops WSO', () => {
    // rocky: RCP, CAT C, no SXO.
    expect(byId.get('rocky')).toMatchObject({
      callsign: 'Rocky', seat: 'wso', band: 'ops', sxo: false,
    })
  })

  it('excludes ground crew and sentinel bodies', () => {
    for (const id of ['torque', 'spanner', 'gizmo', 'allavail']) {
      expect(byId.has(id)).toBe(false)
    }
  })

  it('carries the CAT ladder split exactly as Raptor draws it', () => {
    // IR and FI are instructor CATs too, and A/B/OCU are not.
    expect(byId.get('dice')!.band).toBe('instructor')   // IR
    expect(byId.get('slipway')!.band).toBe('ops')       // A
    expect(byId.get('bapster')!.band).toBe('ops')       // OCU
  })

  it('has no posting dates — Raptor holds none', () => {
    for (const p of people) {
      expect(p.from).toBeNull()
      expect(p.to).toBeNull()
    }
  })

  it('never projects two people onto one id', () => {
    expect(byId.size).toBe(people.length)
  })
})

describe('the demo re-key map', () => {
  const projection = new Map(projectPeople().map(p => [p.id, p]))
  const seeds = new Map(seedPeople().map(p => [p.id, p]))

  it('maps every seed person, each to a distinct Raptor person', () => {
    expect(Object.keys(DEMO_MAP).sort()).toEqual([...seeds.keys()].sort())
    expect(new Set(Object.values(DEMO_MAP)).size).toBe(seeds.size)
  })

  it('every mapped Raptor person has the SAME seat and band as the seed person they replace', () => {
    for (const [seedId, raptorId] of Object.entries(DEMO_MAP)) {
      const seed = seeds.get(seedId)!
      const real = projection.get(raptorId)
      expect(real, `${seedId} -> ${raptorId} is not in the projection`).toBeTruthy()
      expect(`${raptorId}:${real!.seat}/${real!.band}`)
        .toBe(`${raptorId}:${seed.seat}/${seed.band}`)
    }
  })
})

describe('installDemoWorld', () => {
  beforeEach(() => {
    initStore(memoryBackend())
  })

  it('re-keys grid, states, openings and ledger onto people the projection holds', () => {
    installDemoWorld(false)
    const { wars, openings, ledger, people } = getState()
    const ids = new Set(people.map(p => p.id))
    for (const war of wars) {
      for (const id of Object.keys(war.grid)) expect(ids.has(id), `grid key ${id}`).toBe(true)
      for (const id of Object.keys(war.states)) expect(ids.has(id), `states key ${id}`).toBe(true)
    }
    for (const id of Object.keys(openings)) expect(ids.has(id), `openings key ${id}`).toBe(true)
    for (const e of ledger) expect(ids.has(e.personId), `ledger ${e.id} -> ${e.personId}`).toBe(true)
    // The re-key moved the cells, not just the keys: TATA's Raptor-owned OIL
    // now sits on the mapped person, still Raptor's.
    const mapped = DEMO_MAP.tata
    expect(wars[0].grid[mapped]['2026-01-09']).toBe('OIL')
    expect(wars[0].states[mapped]['2026-01-09']).toEqual({ state: 'approved', source: 'raptor' })
  })

  it('applies the seed demo overlay — the posting-out date rides the mapped person', () => {
    installDemoWorld(false)
    const { people } = getState()
    expect(people.find(p => p.id === DEMO_MAP.switcher)!.to).toBe('2026-01-12')
    expect(people.find(p => p.id === DEMO_MAP.ramp)!.sxo).toBe(true)
  })

  it('with stored wars it projects the roster and re-keys NOTHING', () => {
    installDemoWorld(true)
    const { wars, people } = getState()
    expect(people.find(p => p.id === 'bane')).toBeTruthy()   // projection ran
    expect(wars[0].grid.tata['2026-01-09']).toBe('OIL')      // seed keys untouched
    expect(wars[0].grid[DEMO_MAP.tata]).toBeUndefined()
    // The overlay is demo dressing, so it stays home too.
    expect(people.find(p => p.id === DEMO_MAP.switcher)!.to).toBeNull()
  })

  it('backs the seed\'s Raptor-owned cells with live inputs, once', () => {
    installDemoWorld(false)
    installDemoWorld(false)
    const backing = INPUTS.filter(
      (x: any) => x.type === 'OIL' && (x.person === DEMO_MAP.tata || x.person === DEMO_MAP.dusk),
    )
    expect(backing).toHaveLength(2)
    for (const row of backing) expect(row.iid).toBeTruthy()
  })
})
