import { describe, it, expect, beforeEach } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore } from '../state/store'
import { getState, initStore as lwInitStore } from './state/store'
import { memoryBackend } from './state/storage'
import { installDemoWorld } from './state/demoworld'
import { AM, FULL, PM } from './engine/dayview'
import { syncAbsences } from './sync'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  raptorInitStore()
  lwInitStore(memoryBackend())
})

describe('installDemoWorld and stored wars', () => {
  it('a fresh world (no stored wars) files the demo Raptor inputs', () => {
    const before = INPUTS.length
    installDemoWorld(false)
    expect(INPUTS.length).toBeGreaterThan(before)
  })
  it('a stored world (hadStoredWars) files NONE of them — persisted inputs must not be re-seeded', () => {
    const before = INPUTS.length
    installDemoWorld(true)
    expect(INPUTS.length).toBe(before)
  })
})

/* THE WALK'S OWN CASES (M2 — the bug-check order §7.1): a fresh demo shows the two-entry days look F draws, dressed onto
   the Raptor roster (demoworld.ts DEMO_WALK) — and on a stored world, nothing is laid. */
describe('the demo carries the walk\'s two-entry days', () => {
  const at = (p: string, d: string) => getState().views[p]?.[d]?.all ?? []

  it('CASPER, Thu 5 Feb 26: an approved MORNING leave and an HO award in the AFTERNOON, each in its own half (D1164)', () => {
    installDemoWorld(false)
    syncAbsences()
    const all = at('casper', '2026-02-05')
    const leave = all.find(c => c.kind === 'absence')!
    expect(leave).toMatchObject({ code: 'LL', win: AM, lw: expect.anything() })
    const award = all.find(c => c.kind === 'credit' && !c.auto)!
    expect(award.win).toEqual(PM)
    expect(getState().ledger.find(e => e.id === 'walk-2')).toMatchObject({ personId: 'casper', amount: 0.5, half: 'pm' })
    expect(all).toHaveLength(2)
  })

  it('SPACEMAN, Mon 23 Feb 26: a whole-day FO award beside a whole-day refused OL bid (r7-04)', () => {
    installDemoWorld(false)
    syncAbsences()
    const all = at('spaceman', '2026-02-23')
    expect(all).toHaveLength(2)
    expect(all.find(c => c.kind === 'request')).toMatchObject({ code: 'OL', state: 'refused', win: FULL })
    expect(all.find(c => c.kind === 'credit')!.win).toEqual(FULL)
    expect(getState().ledger.find(e => e.id === 'walk-3')).toMatchObject({ personId: 'spaceman', amount: 1 })
  })

  it('a stored world lays none of them', () => {
    installDemoWorld(true)
    syncAbsences()
    expect(getState().ledger.some(e => e.id.startsWith('walk-'))).toBe(false)
    expect(at('spaceman', '2026-02-23')).toHaveLength(0)
  })
})
