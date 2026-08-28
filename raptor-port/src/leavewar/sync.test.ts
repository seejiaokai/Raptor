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
import { histApply } from '../state/history'
import { balanceOf, figureParts, FIGURES } from './engine'
import { projectPeople } from './state/raptorRoster'
import {
  advanceStage,
  getState,
  getVersion,
  initStore as lwInitStore,
  setBidState,
  setCell,
  setPeople,
  setRole,
} from './state/store'
import { memoryBackend } from './state/storage'
import { getClashes, leaveInputAt, retractLwRow, runInbound, runOutbound } from './sync'
import { applyMedPlan, commitInputEdit, draftOf, removeInput } from '../ui/inputedit'
import { upchitTrimPlan } from '../engine/medical'

const ISNAP = JSON.stringify(INPUTS)

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
})

/** Approve a run of LL days the way the app does: bid, then close the war and
 *  decide. `setBidState` refuses a decision unless an ADMIN holds it once
 *  bidding is no longer open (canDecide, 27 Aug overnight pass), so the
 *  helper does the whole management half as the admin — including the writes,
 *  since an admin may write at any stage, which keeps a second call working
 *  after the first has closed the war. */
function approve(person: string, dates: string[], code = 'LL') {
  const wasRole = getState().role
  setRole('admin')
  for (const d of dates) setCell(person, d, code)
  if (getState().period.stage === 'open') advanceStage()
  for (const d of dates) setBidState(person, d, 'approved')
  setRole(wasRole)
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
      // A span's remark names its LAST day, no leave code — the type column
      // already carries LL (owner, 18 Aug 26).
      allday: true, remarks: 'till 4 Feb', mod: 'now', lw: 'y2026',
    })
    // The iid is minted inside the write, so the history snapshot the row
    // first appears in already carries its address.
    expect(rows[0].iid).toBeTruthy()
  })

  it('a single-day approval reads "on <day>" — a one-day leave still names its date', () => {
    approve('rocky', ['2026-02-09'])
    runOutbound()
    const row = lwInputs()[0]
    expect(row.endDate).toBeUndefined()
    expect(row.remarks).toBe('on 9 Feb')
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

    setRole('admin')   // refusing is management's, at the closed stage the helper left
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
    setRole('admin')
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

  it('two same-type halves on one day merge into a full day (not a lost half)', () => {
    // The bug-sweep case: an AM local-leave row + a PM local-leave row filed
    // for one day used to land only the first, drawing 0.5 instead of 1.0.
    writeInputs(() => {
      INPUTS.push({ person: 'ammo', date: 'Feb 10', allday: false, half: 'am', s: 0, e: 720, type: 'LL', remarks: '', mod: '2026-06-01' })
      INPUTS.push({ person: 'ammo', date: 'Feb 10', allday: false, half: 'pm', s: 721, e: 1439, type: 'LL', remarks: '', mod: '2026-06-01' })
    })
    runInbound()
    expect(getState().grid.ammo['2026-02-10']).toBe('LL')
  })

  it('two different half types on one day land the AM half and raise a clash for the PM', () => {
    writeInputs(() => {
      INPUTS.push({ person: 'ammo', date: 'Feb 10', allday: false, half: 'am', s: 0, e: 720, type: 'LL', remarks: '', mod: '2026-06-01' })
      INPUTS.push({ person: 'ammo', date: 'Feb 10', allday: false, half: 'pm', s: 721, e: 1439, type: 'OL', remarks: '', mod: '2026-06-01' })
    })
    runInbound()
    expect(getState().grid.ammo['2026-02-10']).toBe('*LL')   // AM half lands
    // ...and the PM half is not silently dropped — it surfaces as a clash.
    expect(getClashes()).toContainEqual({ person: 'ammo', date: '2026-02-10', inputCode: 'OL', bidCode: 'LL' })
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

  /* An upchit TRIM reaches the war as the shortened span (owner, 27 Aug 26 —
     "the att c on 13 jul will disappear ... and the leave war will update"):
     the trimmed row covers fewer days, and the inbound reverse pass clears
     the Raptor-owned cells no live input covers any more. */
  it('trimming a medical span frees its war days on the next reconcile', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 10', endDate: 'Feb 12', allday: true,
      type: 'ATT C', remarks: '', mod: '2026-06-01', yr: 2026,
    }))
    runInbound()
    expect(getState().grid.ammo['2026-02-12']).toBe('ATTC')
    const med = INPUTS.find((r: any) => r.person === 'ammo' && r.type === 'ATT C')!
    /* the upchit day is a FIT day (owner, 27 Aug 26): upchit 11 Feb ends the
       row on the 10th — start == end collapses to the single-day form */
    writeInputs(() => { applyMedPlan(upchitTrimPlan('ammo', 20260211)) })
    expect(med.endDate).toBeUndefined()
    expect(med.date).toBe('Feb 10')
    runInbound()
    expect(getState().grid.ammo['2026-02-12'], 'the freed days clear').toBeUndefined()
    expect(getState().grid.ammo['2026-02-11'], 'the upchit day clears too').toBeUndefined()
    expect(getState().grid.ammo['2026-02-10'], 'the kept day stays').toBe('ATTC')
  })

  /* An UPCHIT never crosses (owner, 27 Aug 26 — "the leave war will not show
     upchit, it is assumed"): the inbound filter carries leave + downchits
     only, and Upchit is neither. The war shows the trimmed medical span. */
  it('an Upchit input never lands a war cell', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 10', allday: true,
      type: 'Upchit', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect((getState().grid.ammo || {})['2026-02-10']).toBeUndefined()
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

/* Two-way edits and deletes (owner, 17 Aug 26 — "make sure both leave war
   and input, edits or deletes are sync"; full two-way, members included).
   The write paths are ui/inputedit.tsx's commitInputEdit/removeInput — the
   same functions the Inputs page and the schedule dialog call — so these
   tests drive the REAL entry points, not the retraction primitive alone. */
describe('two-way: edits and deletes on the Inputs page carry back into the war', () => {
  it('deleting a synced input withdraws the leave from the war for good', () => {
    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    runOutbound()
    const row = lwInputs()[0]
    expect(removeInput(row)).toBe(true)
    const { grid, states } = getState()
    for (const d of ['2026-02-02', '2026-02-03', '2026-02-04']) {
      expect(grid.ammo?.[d]).toBeUndefined()
      expect(states.ammo?.[d]).toBeUndefined()
    }
    // The reconcile re-mints nothing: the cells the row derived from are gone.
    runOutbound(); runInbound()
    expect(lwInputs()).toHaveLength(0)
    expect(getState().grid.ammo?.['2026-02-02']).toBeUndefined()
  })

  it('a half-day grant withdraws by its own notation', () => {
    approve('ammo', ['2026-02-06'], '*LL')
    runOutbound()
    expect(removeInput(lwInputs()[0])).toBe(true)
    expect(getState().grid.ammo?.['2026-02-06']).toBeUndefined()
  })

  it('a delete touches only its own cells — a sibling grant survives', () => {
    approve('ammo', ['2026-02-02', '2026-02-03'])
    approve('ammo', ['2026-02-10'], 'OL')
    runOutbound()
    const ll = lwInputs().find((r: any) => r.type === 'LL')!
    removeInput(ll)
    expect(getState().grid.ammo?.['2026-02-02']).toBeUndefined()
    expect(getState().grid.ammo['2026-02-10']).toBe('OL')
    expect(lwInputs()).toHaveLength(1)
    expect(lwInputs()[0].type).toBe('OL')
  })

  it('editing the dates moves the leave in the war, as Raptor-owned cells', () => {
    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    runOutbound()
    const row = lwInputs()[0]
    const draft = draftOf(row)
    draft.end = '2026-02-05'
    expect(commitInputEdit(row, draft)).toBe(true)
    // The tag is dropped: the edited row is an ordinary input now, and the
    // ordinary inbound pass lands its new shape as Raptor-owned cells.
    expect(row.lw).toBeUndefined()
    runInbound()
    const { grid, states } = getState()
    for (const d of ['2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05']) {
      expect(grid.ammo[d]).toBe('LL')
      expect(states.ammo[d]).toEqual({ state: 'approved', source: 'raptor' })
    }
    // Converged: another full round changes nothing and mints no second row.
    runOutbound(); runInbound()
    expect(INPUTS.filter((r: any) => r.person === 'ammo' && r.type === 'LL')).toHaveLength(1)
  })

  it('editing the type carries across — LL becomes OL on the grid', () => {
    approve('ammo', ['2026-02-02'])
    runOutbound()
    const row = lwInputs()[0]
    const draft = draftOf(row)
    draft.type = 'OL'
    expect(commitInputEdit(row, draft)).toBe(true)
    runInbound()
    expect(getState().grid.ammo['2026-02-02']).toBe('OL')
    expect(getState().states.ammo['2026-02-02']).toEqual({ state: 'approved', source: 'raptor' })
  })

  it('editing to a non-leave type withdraws the leave and grants nothing back', () => {
    approve('ammo', ['2026-02-02'])
    runOutbound()
    const row = lwInputs()[0]
    const draft = draftOf(row)
    draft.type = 'Meeting'
    expect(commitInputEdit(row, draft)).toBe(true)
    runInbound()
    expect(getState().grid.ammo?.['2026-02-02']).toBeUndefined()
    // The row lives on as an ordinary input — only the war half is gone.
    expect(INPUTS.some((r: any) => r.person === 'ammo' && r.type === 'Meeting')).toBe(true)
    expect(lwInputs()).toHaveLength(0)
  })

  it('editing ONLY the remarks keeps the leave Leave War\'s — the grid is untouched', () => {
    approve('ammo', ['2026-02-02', '2026-02-03'])
    runOutbound()
    const row = lwInputs()[0]
    expect(row.remarks).toBe('till 3 Feb')
    const draft = draftOf(row)
    draft.remarks = 'in Bali till 3 Feb'   // the member adds their own detail
    expect(commitInputEdit(row, draft)).toBe(true)
    // The tag survives, so the leave still belongs to Leave War — the cells
    // stay approved BIDS (not converted to raptor-owned), and nothing on the
    // grid changed, because Leave War does not show remarks at all.
    expect(row.lw).toBe('y2026')
    expect(row.remarks).toBe('in Bali till 3 Feb')
    for (const d of ['2026-02-02', '2026-02-03']) {
      expect(getState().grid.ammo[d]).toBe('LL')
      expect(getState().states.ammo[d]).toEqual({ state: 'approved', source: 'bid' })
    }
    // Reconcile MATCHES the row rather than re-minting it, so the refined
    // remark is preserved — remarks are not in the signature.
    runOutbound(); runInbound()
    expect(lwInputs()).toHaveLength(1)
    expect(lwInputs()[0].remarks).toBe('in Bali till 3 Feb')
  })

  it('extending a leave keeps the member\'s remark note, moving only the date', () => {
    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    runOutbound()
    const row = lwInputs()[0]
    expect(row.remarks).toBe('till 4 Feb')
    // the member adds detail after the tail — a remarks-only edit stays synced
    const draft = draftOf(row)
    draft.remarks = 'till 4 Feb Bangkok'
    expect(commitInputEdit(row, draft)).toBe(true)
    expect(row.lw).toBe('y2026')
    // now the war extends the leave by a day: the row is re-minted, but the
    // note rides across and only the date token moves.
    approve('ammo', ['2026-02-05'])
    runOutbound()
    const rows = lwInputs()
    expect(rows).toHaveLength(1)
    expect(rows[0].endDate).toBe('Feb 5')
    expect(rows[0].remarks).toBe('till 5 Feb Bangkok')
  })

  it('converting a full day to a half keeps the member\'s remark detail too (review fix, 19 Aug 26)', () => {
    approve('ammo', ['2026-02-02'])
    runOutbound()
    const row = lwInputs()[0]
    const draft = draftOf(row)
    draft.remarks = 'on 2 Feb Bangkok'
    expect(commitInputEdit(row, draft)).toBe(true)
    // the admin converts the approved cell to a MORNING half — same leave,
    // same date, new portion. The re-mint used to look the remark up under
    // the exact person|type|portion key, miss on the portion, and drop
    // "Bangkok" — the very loss the date-change carry above prevents.
    approve('ammo', ['2026-02-02'], '*LL')
    runOutbound()
    const rows = lwInputs()
    expect(rows).toHaveLength(1)
    expect(rows[0].half).toBe('am')
    expect(rows[0].remarks).toContain('Bangkok')
  })

  it('a Raptor-owned cell is never withdrawn — retraction is lw-ownership only', () => {
    writeInputs(() => INPUTS.push({
      person: 'ammo', date: 'Feb 2', allday: true, type: 'LL', remarks: '', mod: '2026-06-01',
    }))
    runInbound()
    expect(getState().states.ammo['2026-02-02']).toEqual({ state: 'approved', source: 'raptor' })
    // A fabricated lw row over the same date and code: the withdraw must
    // refuse the cell, because wire 2's input — not this row — is its record.
    retractLwRow({ lw: 'y2026', person: 'ammo', date: 'Feb 2', allday: true, type: 'LL' })
    expect(getState().grid.ammo['2026-02-02']).toBe('LL')
  })

  it('a cell the squadron has since rebid differently is left for the reconcile', () => {
    approve('ammo', ['2026-02-02'])
    runOutbound()
    const row = lwInputs()[0]
    // The cell is rewritten before the row is deleted — a newer ask. The
    // helper left the war closed, so it is the admin holding the pen.
    setRole('admin')
    setCell('ammo', '2026-02-02', 'OL')
    expect(getState().grid.ammo['2026-02-02']).toBe('OL')
    removeInput(row)
    // The withdraw matched nothing (notation differs), so the rebid stands.
    expect(getState().grid.ammo['2026-02-02']).toBe('OL')
  })
})

/* The medical marker rides the same retraction: an admin-marked grid cell
   lands as an lw-tagged input (wire 5), so deleting THAT input on the Inputs
   page must clear the grid mark too — same rule, medical's own notation. */
describe('two-way: a medical grid mark follows its input out', () => {
  it('deleting the lw medical input clears the admin\'s grid mark', () => {
    setRole('admin')
    setCell('ammo', '2026-02-11', 'ATTC')
    runOutbound()
    const row = lwInputs().find((r: any) => r.type === 'ATT C')
    expect(row).toBeTruthy()
    expect(removeInput(row)).toBe(true)
    expect(getState().grid.ammo?.['2026-02-11']).toBeUndefined()
    runOutbound(); runInbound()
    expect(lwInputs().filter((r: any) => r.type === 'ATT C')).toHaveLength(0)
  })
})

/* ---- The 27 Aug 26 overnight pass: the seam holes the adversarial sweep
   found, each pinned through the real reconcile. ---- */

describe('undo vs the war (27 Aug 26)', () => {
  it('undoing an edit of a synced leave brings the leave BACK — demoted to Raptor-owned, never re-spliced', () => {
    approve('ammo', ['2026-02-02', '2026-02-03'])
    runOutbound()
    const row = lwInputs()[0]
    // the member moves the leave on the Inputs page: retraction + re-land
    const d = draftOf(row); d.start = '2026-02-09'; d.end = '2026-02-10'
    expect(commitInputEdit(row, d)).toBe(true)
    runOutbound(); runInbound()
    // Undo. The snapshot restores the OLD row with its lw tag, but the war
    // (no history of its own) still lacks the cells — the reconcile used to
    // read that as "revoked in the war" and delete the row AGAIN, turning
    // Undo into a double delete on both sides.
    histApply(HIST.ix - 1)
    runOutbound()
    const back = INPUTS.find((r: any) => r.person === 'ammo' && r.type === 'LL' && r.date === 'Feb 2')
    expect(back, 'the leave survived the undo').toBeTruthy()
    expect(back.lw, 'demoted to an ordinary Raptor input').toBeUndefined()
    runInbound()
    expect(getState().grid.ammo['2026-02-02']).toBe('LL')
    expect(getState().states.ammo['2026-02-02'].source).toBe('raptor')
  })

  it('a WAR-side revocation still deletes the row — the demote is only for what Raptor itself retracted', () => {
    approve('ammo', ['2026-02-05'])
    runOutbound()
    expect(lwInputs()).toHaveLength(1)
    setRole('admin')
    setBidState('ammo', '2026-02-05', 'refused')
    runOutbound()
    expect(lwInputs()).toHaveLength(0)
    expect(INPUTS.some((r: any) => r.person === 'ammo' && r.date === 'Feb 5')).toBe(false)
  })
})

describe('what a re-mint carries (27 Aug 26)', () => {
  it('refuse then re-approve keeps the member\'s refined remark', () => {
    approve('ammo', ['2026-02-02', '2026-02-03'])
    runOutbound()
    const row = lwInputs()[0]
    const d = draftOf(row); d.remarks = 'in Bali till 3 Feb'
    expect(commitInputEdit(row, d), 'remarks-only edit keeps the row synced').toBe(true)
    setRole('admin')
    setBidState('ammo', '2026-02-02', 'refused')
    setBidState('ammo', '2026-02-03', 'refused')
    runOutbound()
    expect(lwInputs()).toHaveLength(0)          // revoked, row gone
    setBidState('ammo', '2026-02-02', 'approved')
    setBidState('ammo', '2026-02-03', 'approved')
    runOutbound()                                // a SECOND pass — the in-pass carry is empty
    const re = lwInputs()[0]
    expect(re, 'the leave re-minted').toBeTruthy()
    expect(re.remarks, 'the member\'s own words survive the flip-flop').toContain('Bali')
  })

  it('a war-side date change on a synced medical row carries the document id', () => {
    setRole('admin')
    setCell('ammo', '2026-02-11', 'ATTC')
    runOutbound()
    const row = lwInputs().find((r: any) => r.type === 'ATT C')
    const d = draftOf(row); d.docId = 'doc-cert'
    expect(commitInputEdit(row, d), 'attaching the certificate keeps the row synced').toBe(true)
    expect(row.lw, 'doc-only edit did not retract').toBeTruthy()
    setCell('ammo', '2026-02-12', 'ATTC')       // the admin extends the run on the grid
    runOutbound()                                // old row stale, longer run minted
    const re = lwInputs().find((r: any) => r.type === 'ATT C')
    expect(re.endDate).toBe('Feb 12')
    expect(re.docId, 'the certificate followed its record').toBe('doc-cert')
  })
})

describe('leaveInputAt answers for the CELL, not the first covering row (27 Aug 26)', () => {
  it('under a leave clash the cell\'s own code picks the record that derives it', () => {
    approve('ammo', ['2026-02-02'])
    runOutbound()
    // an OL filed on the Inputs page over the same day — inbound raises the
    // clash and the cell keeps the LL bid
    writeInputs(() => INPUTS.unshift({
      person: 'ammo', date: 'Feb 2', allday: true, type: 'OL', remarks: 'course make-up', mod: 'now', yr: 2026,
    }))
    runInbound()
    expect(getState().grid.ammo['2026-02-02']).toBe('LL')
    const hit = leaveInputAt('ammo', '2026-02-02', 'LL')
    expect(hit, 'the LL cell opens the LL record').toBeTruthy()
    expect(hit.type).toBe('LL')
    expect(hit.lw, 'the war-minted row outranks the plain one').toBeTruthy()
    // a code that is no leave at all opens nothing
    expect(leaveInputAt('ammo', '2026-02-02', 'FO')).toBeNull()
    // no code in hand keeps the old date-only answer
    expect(leaveInputAt('ammo', '2026-02-02')).toBeTruthy()
  })
})
