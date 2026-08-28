// Wire 4: a PUBLISHED weekend/public-holiday duty earns OIL in Leave War.
// The computation itself (who earns 0.5 vs 1 from a day blob) is pinned in
// src/engine/oil.test.ts; this file tests the wire — publish-state driving
// the grid, the issued snapshot as the source, reverse-and-replace, the
// ownership partition against wires 1+2, and the never-overwrite clash.
//
// Same harness as sync.test.ts (both real stores, headless), plus the
// publish machinery: SCHED reset to draft and DAYS restored pristine, since
// these tests publish days and edit duty rows.

import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import {
  getState,
  initStore as lwInitStore,
  setBidState,
  setCell,
  setDayEvent,
  setPeople,
  setPostOut,
  setRole,
} from './state/store'
import { memoryBackend } from './state/storage'
import { getClashes, oilPendingFor, runInbound, runOilPass, runOutbound } from './sync'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const SAT = '2026-07-18' // the seed Saturday: plasma stands SDO 0800–1800

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0
  JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
})

const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}
const publish = (di: number) => { sign(di); setDayApproved(di, true) }
const cellOf = (person: string, date: string) => getState().wars[0].grid[person]?.[date]
const ownedBy = (person: string, date: string) => getState().wars[0].states[person]?.[date]

describe('publish drives the credit', () => {
  it('publishing the seed Saturday lands plasma an FO cell, raptor-owned', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    expect(ownedBy('plasma', SAT)).toMatchObject({ state: 'approved', source: 'raptor' })
  })

  it('an unpublished day earns nothing — a draft duty is not the squadron\'s word', () => {
    runOilPass()
    expect(cellOf('plasma', SAT)).toBeUndefined()
  })

  it('a published WEEKDAY earns nothing: Monday has duty rows but is a working day', () => {
    publish(0)
    runOilPass()
    // The seed grid carries hand-typed FO/HO demo cells of its own; the wire's
    // work is exactly the raptor-OWNED ones, and there must be none.
    const { grid, states } = getState().wars[0]
    const owned = Object.entries(grid).flatMap(([p, row]) =>
      Object.entries(row).filter(([d, c]) =>
        (c === 'FO' || c === 'HO') && states[p]?.[d]?.source === 'raptor'))
    expect(owned).toEqual([])
  })

  it('under six written hours the credit is HO, not FO', () => {
    DAYS[5].dutywaves[0].rows[0].str = '0800'
    DAYS[5].dutywaves[0].rows[0].end = '1200'
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('HO')
  })

  it('a weekday the war calls a holiday earns like a weekend — the owner\'s event input path', () => {
    setRole('admin')
    setDayEvent('2026-07-13', 0, 'PH') // the seeded 'off day' type, typed on Monday
    publish(0)
    runOilPass()
    // Monday's SDO earns exactly as Saturday's would; the seed staffs the
    // desk with a real person on every day, so somebody holds an FO/HO cell.
    const { grid } = getState().wars[0]
    const dutyCells = Object.entries(grid).filter(([, row]) =>
      Object.entries(row).some(([d, c]) => d === '2026-07-13' && (c === 'FO' || c === 'HO')))
    expect(dutyCells.length).toBeGreaterThan(0)
  })
})

describe('reverse-and-replace — the credit follows the issued document', () => {
  it('reopening the day takes the credit back', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    setDayApproved(5, false)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBeUndefined()
    expect(ownedBy('plasma', SAT)).toBeUndefined()
  })

  it('a reissue with shorter hours replaces FO with HO', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    setDayApproved(5, false)                      // reopen
    DAYS[5].dutywaves[0].rows[0].end = '1200'     // the duty shrank to 4h
    publish(5)                                    // re-publish reissues the snapshot
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('HO')
  })

  it('a draft edit AFTER publish moves nothing — the issued snapshot is the source', () => {
    publish(5)
    runOilPass()
    DAYS[5].dutywaves[0].rows[0].end = '1200'     // live edit, never issued
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')      // still the document's ten hours
  })
})

describe('the ownership partition against wires 1+2', () => {
  it('runInbound\'s reverse-clear leaves the credit alone — no input ever covers an FO cell', () => {
    publish(5)
    runOilPass()
    runInbound()
    runOutbound()
    expect(cellOf('plasma', SAT)).toBe('FO')
    // and the credit never becomes an lw-tagged input: FO is not biddable
    expect(INPUTS.filter((r: any) => r.lw)).toEqual([])
  })

  it('a leave bid already on the date is never overwritten — it clashes for a human', () => {
    setRole('admin')                               // July sits outside the seed bid window
    setCell('plasma', SAT, 'LL')
    setBidState('plasma', SAT, 'approved')
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('LL')
    expect(getClashes()).toContainEqual(
      { person: 'plasma', date: SAT, inputCode: 'FO', bidCode: 'LL', kind: 'duty' })
  })

  it('leave WINS an owned cell and the passes stay stable — no flip-flop', () => {
    // The man files leave in Raptor for the Saturday he also stands duty.
    INPUTS.push({ person: 'plasma', type: 'LL', date: 'Jul 18', allday: true, remarks: '', mod: 'now' })
    runInbound()                                   // wire 2 lands LL, raptor-owned
    expect(cellOf('plasma', SAT)).toBe('LL')
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('LL')       // never overwritten
    expect(getClashes().some(c => c.kind === 'duty' && c.person === 'plasma')).toBe(true)
    runInbound(); runOilPass(); runInbound(); runOilPass()
    expect(cellOf('plasma', SAT)).toBe('LL')       // still stable
  })

  it('a hand-typed cell matching the verdict is taken over in place, not clashed', () => {
    setRole('admin')                               // July sits outside the seed bid window
    setCell('plasma', SAT, 'FO')                   // the squadron recorded it first
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')
    expect(ownedBy('plasma', SAT)).toMatchObject({ source: 'raptor' })
    expect(getClashes()).toEqual([])
  })

  it('both clash halves publish together — a leave clash and a duty clash coexist', () => {
    setRole('admin')                               // July sits outside the seed bid window
    // duty clash on Saturday
    setCell('plasma', SAT, 'LL')
    setBidState('plasma', SAT, 'approved')
    publish(5)
    // leave clash: a Raptor input against a different standing bid
    setCell('rocky', '2026-07-14', 'OIL')
    setBidState('rocky', '2026-07-14', 'approved')
    INPUTS.push({ person: 'rocky', type: 'LL', date: 'Jul 14', allday: true, remarks: '', mod: 'now' })
    runInbound()
    runOilPass()
    expect(getClashes().some(c => c.kind === 'duty')).toBe(true)
    expect(getClashes().some(c => !c.kind)).toBe(true)
  })
})

/* ---- the input ask-flow's credits (owner, 28 Aug 26) ---------------------
   An acknowledged duty-&-commitments input joins the SAME desired map the
   published schedule feeds, so the reverse sweep protects and collects both
   identically, and one pooled ≤6h/>6h test per person per day decides the
   cell (hours SUM across sources, overlaps counted once). */
describe('an acknowledged input credits — the ask-flow half of the wire', () => {
  const plant = (r: any) => {
    INPUTS.unshift({ allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, ...r })
    return INPUTS[0]
  }

  it('an answered yes mints the cell, raptor-owned, no publish needed', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 1 } })
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    expect(ownedBy('bane', SAT)).toMatchObject({ state: 'approved', source: 'raptor' })
  })

  it('unanswered and declined mint nothing — no acknowledgment, no credit', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18' })                 // never asked/answered
    plant({ person: 'stiff', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 0 } })  // explicit No
    runOilPass()
    expect(cellOf('bane', SAT)).toBeUndefined()
    expect(cellOf('stiff', SAT)).toBeUndefined()
  })

  it('a dormant (scheduler-removed) input mints nothing even when answered', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'r', oil: { [SAT]: 1 } })
    runOilPass()
    expect(cellOf('bane', SAT)).toBeUndefined()
  })

  it('deleting the input collects its cell on the next pass', () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 1 } })
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    INPUTS.splice(INPUTS.indexOf(r), 1)
    runOilPass()
    expect(cellOf('bane', SAT)).toBeUndefined()
  })

  it('a stale yes is inert once the dates move off the day — and the cell goes with it', () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 1 } })
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    r.date = 'Jul 20'                                   // moved; the answer's day is uncovered now
    runOilPass()
    expect(cellOf('bane', SAT)).toBeUndefined()
  })

  it('the owner\'s worked example: 4h published duty + 4h acknowledged input pool to FO', () => {
    DAYS[5].dutywaves[0].rows[0].str = '0800'
    DAYS[5].dutywaves[0].rows[0].end = '1200'           // plasma: 4h published — HO alone
    publish(5)
    plant({ person: 'plasma', type: 'Training', date: 'Jul 18', allday: false, s: 13 * 60, e: 17 * 60, oil: { [SAT]: 0.5 } })
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FO')            // 4h + 4h pooled = 8h
  })

  it('two answered inputs on one day pool as a UNION — overlap never pays twice', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', allday: false, s: 8 * 60, e: 12 * 60, oil: { [SAT]: 0.5 } })
    plant({ person: 'bane', type: 'Meeting', date: 'Jul 18', allday: false, s: 10 * 60, e: 14 * 60, oil: { [SAT]: 0.5 } })
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('HO')              // union 0800–1400 = 6h exactly — still a half
  })

  it('a PH revoked after the answer stops the credit — the yes stays, inert', () => {
    setRole('admin')
    setDayEvent('2026-07-15', 0, 'PH')
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 15', oil: { '2026-07-15': 1 } })
    runOilPass()
    expect(cellOf('bane', '2026-07-15')).toBe('FO')
    setDayEvent('2026-07-15', 0, '')                    // the holiday is un-typed
    runOilPass()
    expect(cellOf('bane', '2026-07-15')).toBeUndefined()
    expect(r.oil).toEqual({ '2026-07-15': 1 })          // the record keeps the answer; the day just is not a holiday
  })

  it('a raptor-owned credit survives a storage round-trip — reconcile keeps FO/HO ownership', () => {
    const be = memoryBackend()
    lwInitStore(be)
    setPeople(projectPeople())
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', oil: { [SAT]: 1 } })
    runOilPass()
    expect(ownedBy('bane', SAT)).toMatchObject({ source: 'raptor' })
    lwInitStore(be)                                      // reload from the SAME backend — the reconcile path
    expect(cellOf('bane', SAT)).toBe('FO')
    expect(ownedBy('bane', SAT), 'ownership survived the load — the reverse sweep can still collect it').toMatchObject({ source: 'raptor' })
  })
})

describe('the ALL / ALL AVAIL expansion on a published non-working day', () => {
  it('credits every available regular aircrew body; leave, SANS and ground crew are out', () => {
    DAYS[5].allhands = DAYS[5].allhands || []
    DAYS[5].allhands.push({ prog: 'SQN EVENT', str: '0800', end: '1500', who: 'ALL' })  // 7h → FO
    /* stiff is away — an all-day leave over the event window */
    INPUTS.unshift({ person: 'stiff', type: 'LL', date: 'Jul 18', allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026 })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')               // a present regular body earns
    expect(cellOf('stiff', SAT)).toBeUndefined()         // on leave — not available
    expect(cellOf('torque', SAT)).toBeUndefined()        // ground crew Personnel — excluded
    const sanId = Object.keys(PEOPLE).find((id: any) => (PEOPLE as any)[id].san && !(PEOPLE as any)[id].archived)
    expect(sanId, 'the roster holds a SANS body').toBeTruthy()
    expect(cellOf(sanId as string, SAT)).toBeUndefined() // SANS — excluded from ALL events
  })
})

describe('oilPendingFor — the bell\'s derived scan', () => {
  const plant = (r: any) => {
    const row: any = { allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, ...r }
    row.iid = row.iid || 'oiltest-' + Math.random().toString(36).slice(2)
    INPUTS.unshift(row)
    return row
  }

  it('a weekday input asks nothing — until Leave War marks the day a holiday after the fact', () => {
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 15' })
    expect(oilPendingFor('bane')).toEqual([])
    setRole('admin')
    setDayEvent('2026-07-15', 0, 'PH')                  // the retro case — the whole feature
    expect(oilPendingFor('bane')).toEqual([{ iid: r.iid, iso: '2026-07-15' }])
    r.oil = { '2026-07-15': 0 }                          // an explicit No IS an answer
    expect(oilPendingFor('bane')).toEqual([])
  })

  it('dormant rows and other people never ring', () => {
    plant({ person: 'bane', type: 'Duty', date: 'Jul 18', acc: 'r' })
    plant({ person: 'stiff', type: 'Duty', date: 'Jul 18' })
    expect(oilPendingFor('bane')).toEqual([])
    expect(oilPendingFor('stiff').length).toBe(1)
  })
})

describe('bug-pass hardening (28 Aug 26)', () => {
  it('a war stored with the LEGACY FS/HS letters loads renamed, ownership intact', () => {
    const be = memoryBackend()
    lwInitStore(be)
    setPeople(projectPeople())
    INPUTS.unshift({ person: 'bane', type: 'Duty', date: 'Jul 18', allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, iid: 'mig1', oil: { [SAT]: 1 } })
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    /* tamper the STORED blob back to the pre-rename letters, then reload */
    be.write('wars', (be.read('wars') as string).replace(/"FO"/g, '"FS"').replace(/"HO"/g, '"HS"'))
    lwInitStore(be)
    expect(cellOf('bane', SAT), 'renamed at the one load door').toBe('FO')
    expect(ownedBy('bane', SAT), 'the ownership record survived — the sweep can still collect it').toMatchObject({ source: 'raptor' })
  })

  it('a body posted out before the day never expands under ALL — even unarchived', () => {
    setRole('admin')
    expect(setPostOut('pump', '2026-07-01', false)).toBe(true)
    DAYS[5].allhands = DAYS[5].allhands || []
    DAYS[5].allhands.push({ prog: 'SQN EVENT', str: '0800', end: '1500', who: 'ALL' })
    publish(5)
    runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')                   // present bodies still earn
    expect(cellOf('pump', SAT), 'posted out — not in the squadron that day').toBeUndefined()
  })
})
