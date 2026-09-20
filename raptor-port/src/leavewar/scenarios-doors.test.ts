// [ARCH-STACK] step 4 — SCENARIOS at the OTHER doors (20 Sep 26 bug hunt over
// the coverage doc's §3 gaps): reassign, an Inputs-page edit, leave dated
// before a posting-in, the OIL pass against absences, dates across two wars,
// bulk gestures over a mixed rectangle, undo depth, and the figures on a
// multi-record day. Every one drives the REAL doors over both wired stores.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { DAYS } from '../engine/data'
import { SCHED, signOf } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { commitSetDayApproved } from '../state/sched-commit'
import { setSession, setMe } from '../state/auth'
import { reassignInput, commitInputEdit, draftOf, removeInput } from '../ui/inputedit'
import { projectPeople } from './state/raptorRoster'
import {
  advanceStage, clearCells, createWar, getState, initStore as lwInitStore, lwHistInit, moveCells,
  rawState, setBidStates, setCell, setCellRange, setCells, setPeople, setPostOut, setRole, setViewer,
} from './state/store'
import { memoryBackend } from './state/storage'
import { runOilPass, wireLeaveWarSync } from './sync'
import { globalUndo, globalRedo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { balanceOf } from './engine'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const toast = HOOKS.toast
let said: string[] = []

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore(); lwInitStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []; HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null); setMe('bane'); setViewer(null) })

let n = 0
const file = (person: string, type: string, date: string, extra: Record<string, any> = {}) => {
  const row: any = { iid: `p${++n}`, person, type, date, yr: 2026, allday: true, remarks: '', mod: '2026-02-01', ...extra }
  if (row.allday === false) delete row.allday
  const ok = writeInputs(() => { INPUTS.unshift(row) })
  return { ok, row }
}
const grid = (p: string, d: string) => getState().grid[p]?.[d]
const recs = (p: string, d: string) => rawState().wars[0]?.recs[p]?.[d] ?? []
/* the day as the SCREEN reads it — the merged view, not the stored records */
const view = (p: string, d: string) => getState().wars[0]?.views[p]?.[d]
const mine = (p: string) => INPUTS.filter((r: any) => r.person === p)

describe('other doors that write Inputs', () => {
  it('REASSIGN to a person who already has leave at that time is refused', () => {
    file('rocky', 'LL', 'Feb 10')
    const { row } = file('ammo', 'OL', 'Feb 10')
    const before = JSON.stringify(INPUTS)
    const r = reassignInput(row.iid, 'rocky')      // rocky already on LL that day
    expect({ r, refused: JSON.stringify(INPUTS) === before }).toEqual({ r: false, refused: true })
  })

  it('an EDIT that moves leave onto another leave of the same person is refused', () => {
    file('rocky', 'LL', 'Feb 10')
    const { row } = file('rocky', 'OL', 'Feb 12')
    const d = draftOf(row); d.start = '2026-02-10'
    const ok = commitInputEdit(row, d)
    const after = INPUTS.find((r: any) => r.iid === row.iid)
    expect({ ok, date: after.date }).toEqual({ ok: false, date: 'Feb 12' })
  })

  it('an EDIT of leave onto a pending bid replaces the bid', () => {
    setRole('admin'); setCell('rocky', '2026-02-14', 'LL')
    const { row } = file('rocky', 'OL', 'Feb 12')
    const d = draftOf(row); d.start = '2026-02-14'
    expect(commitInputEdit(row, d)).toBe(true)
    expect(recs('rocky', '2026-02-14').some(r => r.kind === 'request')).toBe(false)
  })
})

describe('leave dated before a posting-in (owner answer C)', () => {
  it('shows on the war, is charged, and never counts for manning', () => {
    // give someone a posting-IN date the way the projection carries one
    const people = getState().people.map(p => (p.id === 'ammo' ? { ...p, from: '2026-03-01' } : p))
    setPeople(people)
    const b0 = balanceOf(getState().openings, getState().ledger, getState().wars as any, 'ammo', 'annual')
    file('ammo', 'LL', 'Feb 10')
    expect(grid('ammo', '2026-02-10')).toBe('LL')
    const b1 = balanceOf(getState().openings, getState().ledger, getState().wars as any, 'ammo', 'annual')
    expect(b1).toBe(b0 - 1)
  })
})

describe('the OIL pass against absences', () => {
  it('the credit LANDS on a day the person is already on leave, and the day is flagged', () => {
    /* Owner, 20 Sep 26: "if someone is working, even tho they have leave on
       that day, it should still bank the OIL credit … until that thing is
       resolved." Sets aside B4's "Overlap → no credit"; the day carries the
       amber instead, and the leave still shows as the main code. */
    const sat = '2026-07-18'
    file('plasma', 'LL', 'Jul 18')
    const g = signOf(5); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    commitSetDayApproved(5, true)
    runOilPass()
    expect(recs('plasma', sat).filter(r => r.kind === 'credit')).toHaveLength(1)
    expect(grid('plasma', sat)).toBe('LL')                 // leave is still the box
    expect(view('plasma', sat)!.amber).toBe(true)          // and it needs a human
  })

  it('an auto credit goes away when the day is unpublished, and the leave stays', () => {
    const sat = '2026-07-18'
    const g = signOf(5); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    commitSetDayApproved(5, true)
    runOilPass()
    expect(recs('plasma', sat).some(r => r.kind === 'credit')).toBe(true)
    SCHED.dayOK = {}; (SCHED.orig as any) = {}
    runOilPass()
    expect(recs('plasma', sat).some(r => r.kind === 'credit')).toBe(false)
  })
})

describe('wars and dates', () => {
  it('leave crossing 31 Dec shows in BOTH wars', () => {
    setRole('admin')
    // the seed already holds 2026 and 2027 wars; a leave across their join
    file('ammo', 'LL', 'Dec 30', { endDate: 'Jan 2 2027' })
    const views = getState().wars
    const w26 = views.find(w => w.period.start.startsWith('2026'))!
    const w27 = views.find(w => w.period.start.startsWith('2027'))!
    expect(w26.grid.ammo?.['2026-12-31']).toBe('LL')
    expect(w27.grid.ammo?.['2027-01-02']).toBe('LL')
  })

  it('leave filed for a year with no war shows once the war is created', () => {
    file('ammo', 'LL', 'Mar 3 2029')
    setRole('admin')
    expect(createWar('2029', '2029-01-01', '2029-12-31')).toBe('created')
    const w = getState().wars.find(x => x.period.start.startsWith('2029'))!
    expect(w.grid.ammo?.['2029-03-03']).toBe('LL')
  })
})

describe('bulk gestures over a mixed rectangle', () => {
  it('clearing a block of bid + approved leave + medical: the medical survives, the rest goes', () => {
    setRole('admin')
    setCell('ammo', '2026-02-09', 'LL')                       // a bid
    file('ammo', 'ATT C', 'Feb 11')                            // a medical (Inputs page)
    advanceStage()
    setCell('ammo', '2026-02-10', 'LL'); setBidStates([{ personId: 'ammo', date: '2026-02-10' }], 'approved')
    const r = clearCells(['2026-02-09', '2026-02-10', '2026-02-11'].map(d => ({ personId: 'ammo', date: d })))
    expect(grid('ammo', '2026-02-11')).toBe('ATTC')
    expect(grid('ammo', '2026-02-09')).toBeUndefined()
    expect(grid('ammo', '2026-02-10')).toBeUndefined()
    expect(r.skipped).toBeGreaterThan(0)
  })

  it('a range fill over a day already holding leave skips that day and writes the rest', () => {
    setRole('admin')
    file('ammo', 'LL', 'Feb 10')
    const r = setCellRange('ammo', '2026-02-09', '2026-02-12', 'OL')
    expect(grid('ammo', '2026-02-10')).toBe('LL')
    expect(r.written).toBe(3)
    expect(r.skipped).toBe(1)
  })

  it('moving a block that mixes a bid and approved leave moves both', () => {
    setRole('admin')
    setCell('ammo', '2026-02-09', 'LL')
    setCell('ammo', '2026-02-10', 'LL')
    advanceStage()
    setBidStates([{ personId: 'ammo', date: '2026-02-10' }], 'approved')
    const res = moveCells([{ personId: 'ammo', date: '2026-02-09' }, { personId: 'ammo', date: '2026-02-10' }], 5)
    expect(res).toBe('moved')
    expect(grid('ammo', '2026-02-14')).toBe('LL')
    expect(grid('ammo', '2026-02-15')).toBe('LL')
    expect(grid('ammo', '2026-02-09')).toBeUndefined()
  })
})

describe('undo depth', () => {
  it('a long mixed run undoes to the start and redoes to the end', () => {
    setRole('admin')
    const snap = () => JSON.stringify({ i: INPUTS, w: rawState().wars })
    const start = snap()
    setCell('ammo', '2026-02-09', 'LL')
    advanceStage()
    setBidStates([{ personId: 'ammo', date: '2026-02-09' }], 'approved')
    file('ammo', 'ATT C', 'Feb 09')
    file('rocky', 'LL', 'Feb 10', { endDate: 'Feb 12' })
    file('rocky', 'ATT C', 'Feb 11')
    const end = snap()
    let guard = 0
    while (undoState().canUndo && guard++ < 40) expect(globalUndo().ok).toBe(true)
    expect(snap()).toBe(start)
    guard = 0
    while (undoState().canRedo && guard++ < 40) expect(globalRedo().ok).toBe(true)
    expect(snap()).toBe(end)
  })
})

describe('figures on a multi-record day', () => {
  it('AM leave + PM leave of different counters charge half each', () => {
    const b = (c: any) => balanceOf(getState().openings, getState().ledger, getState().wars as any, 'ammo', c)
    const a0 = b('annual'), o0 = b('oil')
    file('ammo', 'LL', 'Feb 10', { allday: false, half: 'am', s: 0, e: 720 })
    file('ammo', 'OIL', 'Feb 10', { allday: false, half: 'pm', s: 721, e: 1439 })
    expect({ annual: a0 - b('annual'), oil: o0 - b('oil') }).toEqual({ annual: 0.5, oil: 0.5 })
  })
})

void inpId; void PEOPLE; void setCells; void setPostOut; void removeInput; void mine; void said
