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
  setRole,
} from './state/store'
import { memoryBackend } from './state/storage'
import { getClashes, runInbound, runOilPass, runOutbound } from './sync'

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
  it('publishing the seed Saturday lands plasma an FS cell, raptor-owned', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FS')
    expect(ownedBy('plasma', SAT)).toMatchObject({ state: 'approved', source: 'raptor' })
  })

  it('an unpublished day earns nothing — a draft duty is not the squadron\'s word', () => {
    runOilPass()
    expect(cellOf('plasma', SAT)).toBeUndefined()
  })

  it('a published WEEKDAY earns nothing: Monday has duty rows but is a working day', () => {
    publish(0)
    runOilPass()
    // The seed grid carries hand-typed FS/HS demo cells of its own; the wire's
    // work is exactly the raptor-OWNED ones, and there must be none.
    const { grid, states } = getState().wars[0]
    const owned = Object.entries(grid).flatMap(([p, row]) =>
      Object.entries(row).filter(([d, c]) =>
        (c === 'FS' || c === 'HS') && states[p]?.[d]?.source === 'raptor'))
    expect(owned).toEqual([])
  })

  it('under six written hours the credit is HS, not FS', () => {
    DAYS[5].dutywaves[0].rows[0].str = '0800'
    DAYS[5].dutywaves[0].rows[0].end = '1200'
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('HS')
  })

  it('a weekday the war calls a holiday earns like a weekend — the owner\'s event input path', () => {
    setRole('admin')
    setDayEvent('2026-07-13', 0, 'PH') // the seeded 'off day' type, typed on Monday
    publish(0)
    runOilPass()
    // Monday's SDO earns exactly as Saturday's would; the seed staffs the
    // desk with a real person on every day, so somebody holds an FS/HS cell.
    const { grid } = getState().wars[0]
    const dutyCells = Object.entries(grid).filter(([, row]) =>
      Object.entries(row).some(([d, c]) => d === '2026-07-13' && (c === 'FS' || c === 'HS')))
    expect(dutyCells.length).toBeGreaterThan(0)
  })
})

describe('reverse-and-replace — the credit follows the issued document', () => {
  it('reopening the day takes the credit back', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FS')
    setDayApproved(5, false)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBeUndefined()
    expect(ownedBy('plasma', SAT)).toBeUndefined()
  })

  it('a reissue with shorter hours replaces FS with HS', () => {
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FS')
    setDayApproved(5, false)                      // reopen
    DAYS[5].dutywaves[0].rows[0].end = '1200'     // the duty shrank to 4h
    publish(5)                                    // re-publish reissues the snapshot
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('HS')
  })

  it('a draft edit AFTER publish moves nothing — the issued snapshot is the source', () => {
    publish(5)
    runOilPass()
    DAYS[5].dutywaves[0].rows[0].end = '1200'     // live edit, never issued
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FS')      // still the document's ten hours
  })
})

describe('the ownership partition against wires 1+2', () => {
  it('runInbound\'s reverse-clear leaves the credit alone — no input ever covers an FS cell', () => {
    publish(5)
    runOilPass()
    runInbound()
    runOutbound()
    expect(cellOf('plasma', SAT)).toBe('FS')
    // and the credit never becomes an lw-tagged input: FS is not biddable
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
      { person: 'plasma', date: SAT, inputCode: 'FS', bidCode: 'LL', kind: 'duty' })
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
    setCell('plasma', SAT, 'FS')                   // the squadron recorded it first
    publish(5)
    runOilPass()
    expect(cellOf('plasma', SAT)).toBe('FS')
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
