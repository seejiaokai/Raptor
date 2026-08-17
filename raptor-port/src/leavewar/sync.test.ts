// Wires 1 + 2 (and the free wire 3): the bidirectional leave sync between
// Leave War's wars and Raptor's INPUTS, tested over both real stores.
//
// The harness is the minimum that makes the epilogues real: Raptor's
// initStore() (wires HOOKS, seeds, mints iids, validates, takes the history
// baseline) plus the pristine-INPUTS restore idiom the Raptor suite uses —
// the snapshot is taken at import, before any initStore has pushed demo
// rows. Leave War boots on a memory backend with the wire-0 projection
// installed, exactly as main.tsx does.

import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { HIST, initStore as raptorInitStore, writeInputs } from '../state/store'
import { balanceOf } from './engine'
import { projectPeople } from './state/raptorRoster'
import {
  getState,
  getVersion,
  initStore as lwInitStore,
  setBidState,
  setCell,
  setPeople,
} from './state/store'
import { memoryBackend } from './state/storage'
import { getClashes, runInbound, runOutbound } from './sync'

const ISNAP = JSON.stringify(INPUTS)

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
})

/** Approve a run of LL days the way the app does: bid, then decide. */
function approve(person: string, dates: string[], code = 'LL') {
  for (const d of dates) {
    setCell(person, d, code)
    setBidState(person, d, 'approved')
  }
}

const lwInputs = () => INPUTS.filter((r: any) => r.lw)

describe('outbound: Leave War approvals become Raptor inputs', () => {
  it('an approved 3-consecutive-day LL run lands as ONE spanned input, lw-tagged', () => {
    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    runOutbound()
    const rows = lwInputs()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      person: 'ammo', type: 'LL', date: 'Feb 2', endDate: 'Feb 4',
      allday: true, remarks: 'Leave War', mod: 'now', lw: 'y2026',
    })
    // The iid is minted inside the write, so the history snapshot the row
    // first appears in already carries its address.
    expect(rows[0].iid).toBeTruthy()
  })

  it('an approved AM half lands with the AM minutes and half mark', () => {
    approve('ammo', ['2026-02-06'], '*LL')
    runOutbound()
    const rows = lwInputs()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      person: 'ammo', type: 'LL', date: 'Feb 6',
      allday: false, s: 0, e: 720, half: 'am',
    })
    expect(rows[0].endDate).toBeUndefined()
  })

  it('a PM half lands with the PM minutes', () => {
    approve('rocky', ['2026-02-06'], 'OIL*')
    runOutbound()
    expect(lwInputs()[0]).toMatchObject({
      person: 'rocky', type: 'OIL', allday: false, s: 721, e: 1439, half: 'pm',
    })
  })

  it('refusing a bid removes exactly its own input and leaves the rest alone', () => {
    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    approve('rocky', ['2026-02-10'])
    runOutbound()
    expect(lwInputs()).toHaveLength(2)
    const kept = lwInputs().find((r: any) => r.person === 'ammo')

    setBidState('rocky', '2026-02-10', 'refused')
    runOutbound()
    const rows = lwInputs()
    expect(rows).toHaveLength(1)
    // Not merely "an equal row": the SAME row, untouched — reconciliation
    // only writes the difference.
    expect(rows[0]).toBe(kept)
  })

  it('refusing a mid-span day splits the spanned input in two', () => {
    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    runOutbound()
    setBidState('ammo', '2026-02-03', 'refused')
    runOutbound()
    const spans = lwInputs().map((r: any) => [r.date, r.endDate])
    expect(spans).toEqual([['Feb 2', undefined], ['Feb 4', undefined]])
  })

  it('is idempotent — a second run writes nothing and takes no history step', () => {
    approve('ammo', ['2026-02-02', '2026-02-03'])
    runOutbound()
    const inputs = JSON.stringify(INPUTS)
    const hist = HIST.stack.length
    runOutbound()
    expect(JSON.stringify(INPUTS)).toBe(inputs)
    expect(HIST.stack.length).toBe(hist)
  })
})

describe('inbound: Raptor leave inputs become Leave War cells', () => {
  it('a spanned LL input lands per-day approved, Raptor-owned cells', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 10', endDate: 'Feb 12', allday: true,
      type: 'LL', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    const { grid, states } = getState()
    for (const d of ['2026-02-10', '2026-02-11', '2026-02-12']) {
      expect(grid.ammo[d]).toBe('LL')
      expect(states.ammo[d]).toEqual({ state: 'approved', source: 'raptor' })
    }
  })

  it('half PM lands the squadron\'s own notation, LL*', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 10', allday: false, half: 'pm', s: 721, e: 1439,
      type: 'LL', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect(getState().grid.ammo['2026-02-10']).toBe('LL*')
  })

  it('a custom 10:00–14:00 window rounds OUT to the full day', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 10', allday: false, s: 600, e: 840,
      type: 'LL', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect(getState().grid.ammo['2026-02-10']).toBe('LL')
  })

  it('a clash is raised and overwrites nothing', () => {
    setCell('ammo', '2026-02-20', 'OL')
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 20', allday: true, type: 'LL', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect(getClashes()).toContainEqual({
      person: 'ammo', date: '2026-02-20', inputCode: 'LL', bidCode: 'OL',
    })
    // Neither side moved: the bid stands, the input stands, a human decides.
    expect(getState().grid.ammo['2026-02-20']).toBe('OL')
    expect(getState().states.ammo['2026-02-20']).toEqual({ state: 'pending', source: 'bid' })
  })

  it('deleting the input clears the Raptor-owned cell it landed', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 10', endDate: 'Feb 11', allday: true,
      type: 'LL', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect(getState().grid.ammo['2026-02-10']).toBe('LL')

    writeInputs(() => {
      const ix = INPUTS.findIndex((r: any) => r.person === 'ammo' && r.date === 'Feb 10')
      INPUTS.splice(ix, 1)
    })
    runInbound()
    expect(getState().grid.ammo?.['2026-02-10']).toBeUndefined()
    expect(getState().grid.ammo?.['2026-02-11']).toBeUndefined()
    expect(getState().states.ammo?.['2026-02-10']).toBeUndefined()
  })

  it('lw-tagged inputs are skipped — the loop-breaker', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 25', allday: true, type: 'LL',
      remarks: 'Leave War', mod: 'now', lw: 'y2026',
    }))
    runInbound()
    expect(getState().grid.ammo?.['2026-02-25']).toBeUndefined()
  })

  it('dates no war holds, and people Leave War does not know, are skipped silently', () => {
    // Settle the seed's own leave inputs first, so the reading below is
    // about the two rows this test adds and nothing else.
    runInbound()
    writeInputs(() => INPUTS.push(
      // 2031: no war exists for that year.
      { person: 'ammo', date: 'Feb 10 2031', allday: true, type: 'LL', remarks: '', mod: '2026-06-01' },
      // j_lee: in the seed INPUTS' style — a person Raptor's roster does not hold.
      { person: 'j_lee', date: 'Feb 10', allday: true, type: 'LL', remarks: '', mod: '2026-06-01' },
    ))
    const before = getVersion()
    runInbound()
    expect(getState().grid.j_lee).toBeUndefined()
    // Nothing to write means nothing written: the store never notified.
    expect(getVersion()).toBe(before)
  })

  it('an input in another war\'s year lands in THAT war, not the one on screen', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'May 10 2027', allday: true, type: 'LL', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    const y27 = getState().wars.find(w => w.period.id === 'y2027')!
    expect(y27.grid.ammo['2027-05-10']).toBe('LL')
    // The current (2026) war took nothing.
    expect(getState().grid.ammo?.['2027-05-10']).toBeUndefined()
  })
})

describe('fixed point', () => {
  it('after a mixed setup, repeated runs of both reconcilers write nothing further', () => {
    // A bit of everything: an approved LW run (outbound), a Raptor input
    // (inbound), a pending bid (synced by neither), a clash.
    approve('ammo', ['2026-02-02', '2026-02-03'])
    setCell('rocky', '2026-02-10', 'OL')                      // pending — stays home
    setCell('pain', '2026-02-15', 'OL')                       // the bid half of a clash
    writeInputs(() => INPUTS.push(
      { person: 'divot', date: 'Feb 10', allday: true, type: 'LL', remarks: '', mod: '2026-06-01' },
      { person: 'pain', date: 'Feb 15', allday: true, type: 'LL', remarks: '', mod: '2026-06-01' },
    ))

    // First full pass reaches the fixed point...
    runInbound()
    runOutbound()
    const inputs = JSON.stringify(INPUTS)
    const wars = JSON.stringify(getState().wars)
    const hist = HIST.stack.length
    const lwVersion = getVersion()

    // ...and three more full passes change NOTHING on either side.
    for (let i = 0; i < 3; i++) {
      runInbound()
      runOutbound()
    }
    expect(JSON.stringify(INPUTS)).toBe(inputs)
    expect(JSON.stringify(getState().wars)).toBe(wars)
    expect(HIST.stack.length).toBe(hist)
    expect(getVersion()).toBe(lwVersion)
  })
})

describe('wire 3: counters follow the sync for free', () => {
  it('a synced-in approved cell draws the balance down, and deleting the input gives it back', () => {
    const balance = () =>
      balanceOf(getState().openings, getState().ledger, getState().wars, 'pain', 'annual')
    const before = balance()

    writeInputs(() => INPUTS.push({
      person: 'pain', date: 'Feb 10', allday: true, type: 'LL', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect(balance()).toBe(before - 1)

    writeInputs(() => {
      const ix = INPUTS.findIndex((r: any) => r.person === 'pain' && r.date === 'Feb 10')
      INPUTS.splice(ix, 1)
    })
    runInbound()
    expect(balance()).toBe(before)
  })
})
