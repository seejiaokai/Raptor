// [ARCH-STACK] step 4 — ONE absence record. The Leave War READS the Inputs
// (no copy either way) and changes approved leave only through the absence
// door, inside one command. Replaces the old two-wire sync suite (runInbound /
// runOutbound / retractLwRow are deleted); every owner behaviour the old suite
// pinned is kept here in its new form.
//
// The harness is the minimum that makes the epilogues real: Raptor's
// initStore() plus the pristine-INPUTS restore, Leave War on a memory backend
// with the roster projection installed, exactly as main.tsx does. A test that
// changes INPUTS through the Raptor side calls `syncAbsences()` — what a Raptor
// notify does in the app (sync.ts `wireLeaveWarSync`).

import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { commandStream } from '../command'
import { balanceOf, figureParts, FIGURES } from './engine'
import { projectPeople } from './state/raptorRoster'
import {
  advanceStage, clearCells, getState, initStore as lwInitStore, rawState, setBidState, setCell, setPeople, setRole, shiftBid,
} from './state/store'
import { memoryBackend } from './state/storage'
import { getClashes, leaveInputAt, syncAbsences } from './sync'
import { commitInputEdit, draftOf, removeInput } from '../ui/inputedit'

const ISNAP = JSON.stringify(INPUTS)

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  syncAbsences()
})

/** Approve a run of days the way the app does: bid, close the war, decide. */
function approve(person: string, dates: string[], code = 'LL') {
  const wasRole = getState().role
  setRole('admin')
  for (const d of dates) setCell(person, d, code)
  if (getState().period.stage === 'open') advanceStage()
  for (const d of dates) setBidState(person, d, 'approved')
  setRole(wasRole)
}
const lwInputs = () => INPUTS.filter((r: any) => r.lw)
const file = (row: any) => { writeInputs(() => INPUTS.push({ remarks: '', mod: '2026-06-01', yr: 2026, ...row })); syncAbsences() }
const raw = (p: string, d: string) => rawState().wars.flatMap(w => w.recs[p]?.[d] ?? [])

describe('approving turns the bids into the ONE Input', () => {
  it('a 3-day LL run becomes ONE spanned Input tagged with the war; the bids are gone', () => {
    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    const rows = lwInputs()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ person: 'ammo', type: 'LL', date: 'Feb 2', endDate: 'Feb 4', allday: true, lw: 'y2026' })
    expect(rows[0].remarks).toBe('till 4 Feb')
    for (const d of ['2026-02-02', '2026-02-03', '2026-02-04']) {
      expect(raw('ammo', d)).toEqual([])                       // nothing approved is stored on the war
      expect(getState().grid.ammo[d]).toBe('LL')                // the war reads the Input
      expect(getState().states.ammo[d]).toEqual({ state: 'approved', source: 'bid' })
    }
  })

  it('a single day reads "on <day>"; an AM half lands with the AM minutes', () => {
    approve('ammo', ['2026-02-02'])
    expect(lwInputs()[0].remarks).toBe('on 2 Feb')
    approve('rocky', ['2026-02-10'], '*LL')
    expect(INPUTS.find((r: any) => r.person === 'rocky' && r.lw)).toMatchObject({ allday: false, half: 'am', s: 0, e: 720 })
    expect(getState().grid.rocky['2026-02-10']).toBe('*LL')
  })

  it('one approval gesture is ONE envelope holding the Input and the bid deletions', () => {
    const wasRole = getState().role
    setRole('admin')
    setCell('ammo', '2026-02-02', 'LL'); setCell('ammo', '2026-02-03', 'LL')
    advanceStage()
    const before = commandStream().length
    setBidState('ammo', '2026-02-02', 'approved')
    setRole(wasRole)
    const envs = commandStream().slice(before)
    const withInput = envs.filter(e => e.changes.some(c => c.collection === 'inputs'))
    expect(withInput).toHaveLength(1)
    expect(withInput[0]!.changes.some(c => c.collection === 'lw.cell')).toBe(true)
  })

  it('does not approve over leave already filed at the same time — skipped, the bid kept', () => {
    setRole('admin')
    setCell('ammo', '2026-02-02', 'LL')
    advanceStage()
    // an OL filed on the Inputs page AFTER the bid (the Inputs-door rules would
    // replace the bid; here it is pushed raw to stage the approval preflight)
    INPUTS.push({ person: 'ammo', date: 'Feb 2', yr: 2026, allday: true, type: 'OL', remarks: '', mod: '2026-06-01', iid: 'olx' })
    syncAbsences()
    setBidState('ammo', '2026-02-02', 'approved')
    expect(INPUTS.filter((r: any) => r.person === 'ammo' && r.type === 'LL')).toHaveLength(0)
  })
})

describe('changing approved leave on the war (the absence door)', () => {
  it('refusing a mid-span day splits the Input in two — the first keeps its id — and leaves a refused bid there', () => {
    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    const iid = lwInputs()[0].iid
    setRole('admin')
    setBidState('ammo', '2026-02-03', 'refused')
    const spans = lwInputs().map((r: any) => [r.date, r.endDate])
    expect(spans).toEqual([['Feb 2', undefined], ['Feb 4', undefined]])
    expect(lwInputs()[0].iid).toBe(iid)
    expect(getState().states.ammo['2026-02-03']?.state).toBe('refused')
  })

  it('refuse then re-approve keeps the member’s own remark (design FB2-06)', () => {
    approve('ammo', ['2026-02-02', '2026-02-03'])
    const row = lwInputs()[0]
    const d = draftOf(row); d.remarks = 'in Bali till 3 Feb'
    expect(commitInputEdit(row, d)).toBe(true)
    syncAbsences()
    setRole('admin')
    setBidState('ammo', '2026-02-02', 'refused')
    setBidState('ammo', '2026-02-03', 'refused')
    expect(lwInputs()).toHaveLength(0)
    setBidState('ammo', '2026-02-02', 'approved')
    setBidState('ammo', '2026-02-03', 'approved')
    expect(lwInputs().some((r: any) => /Bali/.test(r.remarks))).toBe(true)
  })

  it('deleting approved days on the war shrinks the Input, and it sticks', () => {
    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    setRole('admin')
    clearCells([{ personId: 'ammo', date: '2026-02-04' }])
    expect(lwInputs().map((r: any) => [r.date, r.endDate])).toEqual([['Feb 2', 'Feb 3']])
    expect(getState().grid.ammo['2026-02-04']).toBeUndefined()
  })

  it('moving approved leave after bidding closes keeps it approved and marks where it came from', () => {
    approve('ammo', ['2026-02-02'])
    setRole('admin')
    expect(shiftBid('ammo', '2026-02-02', '2026-02-09')).toBe('shifted')
    expect(getState().grid.ammo?.['2026-02-02']).toBeUndefined()
    expect(getState().states.ammo['2026-02-09']).toEqual({ state: 'approved', source: 'bid', shiftedFrom: '2026-02-02' })
  })
})

describe('leave filed on the Inputs page shows on the war', () => {
  it('a spanned LL shows per day, approved, and read-only on the war (the blue edge)', () => {
    file({ person: 'ammo', date: 'Feb 10', endDate: 'Feb 12', allday: true, type: 'LL' })
    for (const d of ['2026-02-10', '2026-02-11', '2026-02-12']) {
      expect(getState().grid.ammo[d]).toBe('LL')
      expect(getState().states.ammo[d]).toEqual({ state: 'approved', source: 'raptor' })
    }
  })

  it('a PM half shows LL*; a custom 10:00–14:00 window rounds OUT to the full day', () => {
    file({ person: 'ammo', date: 'Feb 10', allday: false, half: 'pm', s: 721, e: 1439, type: 'LL' })
    expect(getState().grid.ammo['2026-02-10']).toBe('LL*')
    file({ person: 'rocky', date: 'Feb 10', allday: false, s: 600, e: 840, type: 'LL' })
    expect(getState().grid.rocky['2026-02-10']).toBe('LL')
  })

  it('deleting the Input empties the day — nothing to withdraw', () => {
    file({ person: 'ammo', date: 'Feb 10', allday: true, type: 'LL' })
    const row = INPUTS.find((r: any) => r.person === 'ammo' && r.date === 'Feb 10')
    removeInput(row)
    syncAbsences()
    expect(getState().grid.ammo?.['2026-02-10']).toBeUndefined()
  })

  it('an Input in another war’s year shows in THAT war, not the one on screen', () => {
    file({ person: 'ammo', date: 'Mar 3', yr: 2027, allday: true, type: 'LL' })
    const y27 = getState().wars.find(w => w.period.id === 'y2027')!
    expect(y27.grid.ammo['2027-03-03']).toBe('LL')
    expect(getState().grid.ammo?.['2027-03-03']).toBeUndefined()
  })

  it('a course and overseas duty show too (clash check B2), and leave during OD shows the leave with +1', () => {
    file({ person: 'ammo', date: 'Feb 10', endDate: 'Feb 12', allday: true, type: 'OD' })
    file({ person: 'ammo', date: 'Feb 11', allday: true, type: 'LL' })
    expect(getState().grid.ammo['2026-02-10']).toBe('OD')
    expect(getState().grid.ammo['2026-02-11']).toBe('LL')
    expect(getState().views.ammo['2026-02-11']!.mark).toBe('+1')
  })

  it('a filed LL draws the balance down, and deleting it gives it back', () => {
    const balance = () => balanceOf(getState().openings, getState().ledger, getState().wars, 'pain', 'annual')
    const before = balance()
    file({ person: 'pain', date: 'Feb 10', allday: true, type: 'LL' })
    expect(balance()).toBe(before - 1)
    removeInput(INPUTS.find((r: any) => r.person === 'pain' && r.date === 'Feb 10'))
    syncAbsences()
    expect(balance()).toBe(before)
  })
})

describe('medical is member-filed and shows on the war', () => {
  it('a spanned ATT C shows per-day ATTC, approved and read-only', () => {
    file({ person: 'ammo', date: 'Feb 10', endDate: 'Feb 12', allday: true, type: 'ATT C' })
    for (const d of ['2026-02-10', '2026-02-11', '2026-02-12']) {
      expect(getState().grid.ammo[d]).toBe('ATTC')
      expect(getState().states.ammo[d]).toEqual({ state: 'approved', source: 'raptor' })
    }
  })
  it('an Upchit never shows', () => {
    file({ person: 'ammo', date: 'Feb 10', allday: true, type: 'Upchit' })
    expect(getState().grid.ammo?.['2026-02-10']).toBeUndefined()
  })
  it('six hours or less is a half day on the side of noon it sits on; more is a full day', () => {
    file({ person: 'ammo', date: 'Feb 10', allday: false, s: 840, e: 960, type: 'ATT C' })
    expect(getState().grid.ammo['2026-02-10']).toBe('ATTC*')
    file({ person: 'rocky', date: 'Feb 10', allday: false, s: 480, e: 1020, type: 'ATT C' })
    expect(getState().grid.rocky['2026-02-10']).toBe('ATTC')
  })
  it('an admin cannot mark medical on the grid', () => {
    setRole('admin')
    expect(setCell('ammo', '2026-02-10', 'ATTC')).toBe(false)
    expect(getState().grid.ammo?.['2026-02-10']).toBeUndefined()
  })
  it('MED TOT follows a filed ATT C, halves included', () => {
    file({ person: 'ammo', date: 'Feb 10', allday: false, half: 'am', s: 0, e: 720, type: 'ATT C' })
    const { openings, ledger, wars } = getState()
    expect(figureParts(FIGURES.find(f => f.id === 'medtot')!, { openings, ledger, sources: wars }, 'ammo')).toEqual([
      { label: 'ATT C', value: 0.5 }, { label: 'HL', value: 0 }, { label: 'OML', value: 0 },
    ])
  })
})

describe('edits on the Inputs page (design §5.4, owner §13 Q1)', () => {
  it('a remarks-only edit keeps the leave war-approved; the grid is untouched', () => {
    approve('ammo', ['2026-02-02', '2026-02-03'])
    const row = lwInputs()[0]
    const draft = draftOf(row)
    draft.remarks = 'in Bali till 3 Feb'
    expect(commitInputEdit(row, draft)).toBe(true)
    syncAbsences()
    expect(row.lw).toBe('y2026')
    expect(getState().states.ammo['2026-02-02']).toEqual({ state: 'approved', source: 'bid' })
  })

  it('an ADMIN date edit moves the leave and keeps it war-approved', () => {
    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    const row = lwInputs()[0]
    const draft = draftOf(row)
    draft.end = '2026-02-05'
    expect(commitInputEdit(row, draft)).toBe(true)
    syncAbsences()
    expect(getState().grid.ammo['2026-02-05']).toBe('LL')
    expect(INPUTS.filter((r: any) => r.person === 'ammo' && r.type === 'LL')).toHaveLength(1)
  })

  it('editing the type carries across — LL becomes OL on the grid', () => {
    file({ person: 'ammo', date: 'Feb 10', allday: true, type: 'LL' })
    const row = INPUTS.find((r: any) => r.person === 'ammo' && r.date === 'Feb 10')
    const d = draftOf(row); d.type = 'OL'
    expect(commitInputEdit(row, d)).toBe(true)
    syncAbsences()
    expect(getState().grid.ammo['2026-02-10']).toBe('OL')
  })
})

describe('leaveInputAt answers for the cell', () => {
  it('a morning LL and an afternoon OL: each half opens its own record', () => {
    file({ person: 'ammo', date: 'Feb 2', allday: false, half: 'am', s: 0, e: 720, type: 'LL', remarks: 'dentist' })
    file({ person: 'ammo', date: 'Feb 2', allday: false, half: 'pm', s: 721, e: 1439, type: 'OL', remarks: 'flight' })
    expect(leaveInputAt('ammo', '2026-02-02', '*LL')?.type).toBe('LL')
    expect(leaveInputAt('ammo', '2026-02-02', 'OL*')?.type).toBe('OL')
    expect(leaveInputAt('ammo', '2026-02-02', 'FO')).toBeNull()
    expect(leaveInputAt('ammo', '2026-02-02')).toBeTruthy()
  })
})

describe('the clash strip is derived', () => {
  it('two leaves at overlapping times go on the strip; removing one clears it', () => {
    file({ person: 'ammo', date: 'Feb 2', allday: true, type: 'LL' })
    INPUTS.push({ person: 'ammo', date: 'Feb 2', yr: 2026, allday: true, type: 'OL', remarks: '', mod: '2026-06-01', iid: 'dup1' })
    syncAbsences()
    expect(getClashes().some(c => c.person === 'ammo' && c.date === '2026-02-02')).toBe(true)
    INPUTS.splice(INPUTS.findIndex((r: any) => r.iid === 'dup1'), 1)
    syncAbsences()
    expect(getClashes().some(c => c.person === 'ammo' && c.date === '2026-02-02')).toBe(false)
  })
})
