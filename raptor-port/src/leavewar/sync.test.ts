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
import { balanceOf, figureParts, FIGURES } from './engine'
import { projectPeople } from './state/raptorRoster'
import {
  getState,
  getVersion,
  initStore as lwInitStore,
  setBidState,
  setCell,
  setPeople,
  setRole,
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

describe('medical crosses both ways (owner, 17 Aug 26)', () => {
  it('a spanned ATT C input lands per-day ATTC cells, approved and Raptor-owned', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 10', endDate: 'Feb 12', allday: true,
      type: 'ATT C', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    const { grid, states } = getState()
    for (const d of ['2026-02-10', '2026-02-11', '2026-02-12']) {
      expect(grid.ammo[d]).toBe('ATTC')
      expect(states.ammo[d]).toEqual({ state: 'approved', source: 'raptor' })
    }
  })

  it('AM and PM halves land the asterisk notation', () => {
    writeInputs(() => INPUTS.push(
      { person: 'ammo', date: 'Feb 10', allday: false, half: 'am', s: 0, e: 720, type: 'OML', remarks: '', mod: '2026-06-01' },
      { person: 'ammo', date: 'Feb 11', allday: false, half: 'pm', s: 721, e: 1439, type: 'HL', remarks: '', mod: '2026-06-01' },
    ))
    runInbound()
    expect(getState().grid.ammo['2026-02-10']).toBe('*OML')
    expect(getState().grid.ammo['2026-02-11']).toBe('HL*')
  })

  it('a custom window of six hours or less is a half day — the side of noon it sits on', () => {
    writeInputs(() => INPUTS.push(
      // 09:00–12:00, inside the morning.
      { person: 'ammo', date: 'Feb 10', allday: false, s: 540, e: 720, type: 'ATT C', remarks: '', mod: '2026-06-01' },
      // 13:00–16:00, inside the afternoon.
      { person: 'ammo', date: 'Feb 11', allday: false, s: 780, e: 960, type: 'ATT C', remarks: '', mod: '2026-06-01' },
      // 10:00–16:00 — exactly six hours ("6 hours 1 min or more" is wire 4's
      // rule; HERE exactly six is still a half). Straddles noon; midpoint
      // 13:00 puts it in the afternoon.
      { person: 'ammo', date: 'Feb 12', allday: false, s: 600, e: 960, type: 'ATT C', remarks: '', mod: '2026-06-01' },
    ))
    runInbound()
    expect(getState().grid.ammo['2026-02-10']).toBe('*ATTC')
    expect(getState().grid.ammo['2026-02-11']).toBe('ATTC*')
    expect(getState().grid.ammo['2026-02-12']).toBe('ATTC*')
  })

  it('a custom window past six hours is a full day — medical does not use leave\'s round-OUT rule', () => {
    writeInputs(() => INPUTS.push({
      // 08:00–15:00 — seven hours.
      person: 'ammo', date: 'Feb 10', allday: false, s: 480, e: 900, type: 'OML', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect(getState().grid.ammo['2026-02-10']).toBe('OML')
  })

  it('deleting the medical input reverse-clears its cells', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 10', allday: true, type: 'HL', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect(getState().grid.ammo['2026-02-10']).toBe('HL')
    writeInputs(() => {
      const ix = INPUTS.findIndex((r: any) => r.type === 'HL' && r.person === 'ammo')
      INPUTS.splice(ix, 1)
    })
    runInbound()
    expect(getState().grid.ammo?.['2026-02-10']).toBeUndefined()
  })

  it('a marker the admin writes on the grid lands as an lw-tagged input in Raptor\'s spelling — no approval step', () => {
    setRole('admin')
    setCell('ammo', '2026-02-02', 'ATTB')
    setCell('ammo', '2026-02-03', 'ATTB')
    runOutbound()
    const rows = lwInputs()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      person: 'ammo', type: 'ATT B', date: 'Feb 2', endDate: 'Feb 3', allday: true, lw: 'y2026',
    })
  })

  it('a half-day C on the grid lands as a half-day ATT C input', () => {
    setRole('admin')
    setCell('ammo', '2026-02-05', 'ATTC*')
    runOutbound()
    const rows = lwInputs()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      person: 'ammo', type: 'ATT C', date: 'Feb 5', allday: false, half: 'pm', s: 721, e: 1439,
    })
  })

  it('clearing the grid marker removes exactly its own input again', () => {
    setRole('admin')
    setCell('ammo', '2026-02-05', 'OML')
    runOutbound()
    expect(lwInputs()).toHaveLength(1)
    setCell('ammo', '2026-02-05', '')
    runOutbound()
    expect(lwInputs()).toHaveLength(0)
  })

  it('reaches a fixed point: each side skips what the other wrote', () => {
    // In from Raptor: the raptor-owned cell must NOT come back out.
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 10', allday: true, type: 'ATT C', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    runOutbound()
    expect(lwInputs()).toHaveLength(0)
    // Out from the grid: the lw-tagged input must NOT be re-ingested as a
    // fresh, differently-owned cell (it already IS the grid's own row).
    setRole('admin')
    setCell('ammo', '2026-02-20', 'HL')
    runOutbound()
    const before = JSON.stringify([getState().grid.ammo, getState().states.ammo])
    runInbound()
    runOutbound()
    runInbound()
    expect(JSON.stringify([getState().grid.ammo, getState().states.ammo])).toBe(before)
    expect(lwInputs()).toHaveLength(1)
  })

  it('a medical input against an existing bid raises the clash and overwrites nothing', () => {
    setCell('ammo', '2026-02-20', 'OL')
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 20', allday: true, type: 'ATT C', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect(getClashes()).toContainEqual({
      person: 'ammo', date: '2026-02-20', inputCode: 'ATTC', bidCode: 'OL',
    })
    expect(getState().grid.ammo['2026-02-20']).toBe('OL')
  })

  it('MED USED follows a synced-in ATT C for free, halves included', () => {
    const med = () => {
      const { openings, ledger, wars } = getState()
      return figureParts(FIGURES.find(f => f.id === 'med')!, { openings, ledger, sources: wars }, 'ammo')
    }
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 10', allday: false, half: 'am', s: 0, e: 720, type: 'ATT C', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect(med()).toEqual([
      { label: 'ATT C', value: 0.5 },
      { label: 'HL', value: 0 },
      { label: 'OML', value: 0 },
    ])
  })
})
