// Wire 0: the projection of Raptor's PEOPLE into Leave War people, and the
// boot-time demo re-key that dresses the seeded demo world in that crew.

import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { SANS_IDS } from '../../engine/people'
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
      callsign: 'Ranger', seat: 'pilot', band: 'instructor', sxo: true,
    })
  })

  it('projects an RCP non-instructor as an ops WSO', () => {
    // rocky: RCP, CAT C, no SXO.
    expect(byId.get('rocky')).toMatchObject({
      callsign: 'Hex', seat: 'wso', band: 'ops', sxo: false,
    })
  })

  it('excludes sentinel bodies but INCLUDES ground crew (owner, 18 Aug 26)', () => {
    // Sentinels (ALL AVAIL etc.) are slot fillers, not people — still out.
    expect(byId.has('allavail')).toBe(false)
    // Ground crew ride the roster now, marked `pers`, seat `gnd`, no CAT, and
    // labelled from Raptor's `flight` (torque's is 'Maint').
    for (const id of ['torque', 'spanner', 'gizmo']) expect(byId.has(id)).toBe(true)
    expect(byId.get('torque')).toMatchObject({ pers: true, seat: 'gnd', label: 'Maint' })
  })

  it('carries the CAT itself for aircrew, for the by-CAT display grouping', () => {
    expect(byId.get('slipway')!.q).toBe('A')
    expect(byId.get('dice')!.q).toBe('IR')
    expect(byId.get('bane')!.q).toBe('IP')
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

  /* SC currency rides the projection for the SC D / SC N team rows (owner,
     19 Aug 26). Raptor's own boot rule: non-OCU aircrew hold SC DAY, the
     instructor CATs and A/B hold SC NIGHT too, OCU hold neither. */
  it('carries SC DAY / SC NIGHT off the Quals flags', () => {
    expect(byId.get('bane')).toMatchObject({ scd: true, scn: true })      // IP
    expect(byId.get('rocky')).toMatchObject({ scd: true, scn: false })    // CAT C
    expect(byId.get('bapster')).toMatchObject({ scd: false, scn: false }) // OCU
  })

  /* SANS are off the roster BY DEFAULT (owner, 18 Aug 26 — "we will not show
     the SANS in the leave war however there is a function to still enable
     this"); the enable is projectPeople's includeSans, driven by the store's
     showSans switch. */
  it('excludes SANS aircrew by default, and includes them when asked', () => {
    for (const id of SANS_IDS) expect(byId.has(id)).toBe(false)
    const withSans = new Map(projectPeople(true).map(p => [p.id, p]))
    for (const id of SANS_IDS) expect(withSans.has(id)).toBe(true)
    // vinci rides in exactly the shape he had before the exclusion existed
    expect(withSans.get('vinci')).toMatchObject({ seat: 'pilot', band: 'ops', q: 'C' })
  })

  it('the demo re-key never targets a SANS member — a hidden body would render nowhere', () => {
    for (const target of Object.values(DEMO_MAP)) expect(SANS_IDS).not.toContain(target)
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

  it('lays the demo OIL story over the seed, re-keyed with it, and only on a fresh boot', () => {
    installDemoWorld(false)
    const { wars, ledger } = getState()
    // TATA's two March takes and two earned days ride his mapped person.
    const row = wars[0]!.grid[DEMO_MAP.tata]!
    expect(row['2026-03-02']).toBe('OIL')
    expect(row['2026-02-07']).toBe('FO')
    expect(wars[0]!.states[DEMO_MAP.tata]!['2026-02-07']).toMatchObject({ note: 'FLT' })
    expect(wars[1]!.grid[DEMO_MAP.reset]!['2027-02-15']).toBe('OIL')
    expect(ledger.find(e => e.id === 'dol-4')).toMatchObject({ personId: DEMO_MAP.reset, amount: 2, givenBy: 'OC Ops' })
    expect(wars[0]!.grid.tata).toBeUndefined()
  })

  it('leaves stored wars without the demo OIL story', () => {
    installDemoWorld(true)
    const { wars, ledger } = getState()
    expect(wars[0]!.grid.tata!['2026-03-02']).toBeUndefined()
    expect(ledger.some(e => e.id.startsWith('dol-'))).toBe(false)
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
