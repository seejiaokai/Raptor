// FULL BUG TEST of Leave War undo / redo (owner ask, 30 Aug 26 — "a full bug
// test of the undo and redo function added. And how it affects the rest").
//
// Wired over BOTH real stores (like sync.test.ts), so the cross-app half — an
// undo rippling back through the Raptor Inputs sync — is exercised for real,
// not mocked. Every `it` is an adversarial scenario; a failure here is a bug.
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { evaluatePeriod } from './engine'
import {
  addEventBand,
  addEventRow,
  advanceStage,
  autoSortRoster,
  clearBidWindow,
  clearCells,
  createWar,
  deleteManningRule,
  focusDay,
  getState,
  initStore as lwInitStore,
  lwCanRedo,
  lwCanUndo,
  lwRedo,
  lwUndo,
  moveCells,
  removeEventBand,
  removeEventRow,
  reopenStage,
  saveManningRule,
  selectWar,
  setBidState,
  setBidStates,
  setBidWindow,
  setCell,
  setCellRange,
  setDayEvent,
  setPeople,
  setPostOut,
  setRole,
  setRosterOrder,
  setShowSans,
  setViewer,
} from './state/store'
import { memoryBackend } from './state/storage'
import { runInbound, runOutbound } from './sync'

const ISNAP = JSON.stringify(INPUTS)

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
})

const lwInputs = () => INPUTS.filter((r: any) => r.lw)
const codeOf = (id: string, d: string) => getState().grid[id]?.[d]
const stateOf = (id: string, d: string) => getState().states[id]?.[d]

// approve one day the way the app does (admin, close, decide)
function approve(id: string, d: string, code = 'LL') {
  setRole('admin')
  setCell(id, d, code)
  if (getState().period.stage === 'open') advanceStage()
  setBidState(id, d, 'approved')
}

describe('undo/redo — baseline & mechanics', () => {
  it('a freshly booted war has nothing to undo (the seed is not an edit)', () => {
    expect(lwCanUndo()).toBe(false)
    expect(lwCanRedo()).toBe(false)
  })

  it('a whole drag-fill range is ONE step, restored atomically', () => {
    setCellRange('ramp', '2026-03-02', '2026-03-08', 'LL')
    lwUndo()
    for (let n = 2; n <= 8; n++) expect(codeOf('ramp', `2026-03-0${n}`)).toBeUndefined()
    expect(lwCanUndo()).toBe(false)
  })

  it('a batch decide is ONE step', () => {
    setRole('admin')
    setCell('ramp', '2026-03-02', 'LL'); setCell('ramp', '2026-03-03', 'LL')
    advanceStage()
    const undoAt = { canUndo: lwCanUndo() }
    setBidStates([{ personId: 'ramp', date: '2026-03-02' }, { personId: 'ramp', date: '2026-03-03' }], 'approved')
    expect(stateOf('ramp', '2026-03-02')!.state).toBe('approved')
    lwUndo()  // one step undoes BOTH decisions
    expect(stateOf('ramp', '2026-03-02')!.state).toBe('pending')
    expect(stateOf('ramp', '2026-03-03')!.state).toBe('pending')
    expect(undoAt.canUndo).toBe(true)
  })

  it('a batch clear is ONE step and restores every cleared cell', () => {
    setCellRange('ramp', '2026-03-02', '2026-03-05', 'LL')
    clearCells(['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05'].map(d => ({ personId: 'ramp', date: d })))
    expect(codeOf('ramp', '2026-03-03')).toBeUndefined()
    lwUndo()  // the clear comes back whole
    for (let n = 2; n <= 5; n++) expect(codeOf('ramp', `2026-03-0${n}`)).toBe('LL')
  })

  it('a new edit after an undo drops the redo tail', () => {
    setCell('ramp', '2026-03-02', 'LL')
    setCell('ramp', '2026-03-03', 'OL')
    lwUndo(); lwUndo()
    expect(lwCanRedo()).toBe(true)
    setCell('ramp', '2026-03-09', 'LL')   // fresh edit
    expect(lwCanRedo()).toBe(false)
    expect(codeOf('ramp', '2026-03-03')).toBeUndefined()
  })

  it('the stack is capped: beyond 60 edits the oldest fall off (cannot undo to the very start)', () => {
    setRole('admin')
    // 65 distinct day-event edits (admin config — not gated by the bidding
    // window, so every one is a real step), across enough dates to be distinct
    const dates: string[] = []
    for (let n = 0; n < 65; n++) {
      const d = `2026-${String(1 + Math.floor(n / 28)).padStart(2, '0')}-${String((n % 28) + 1).padStart(2, '0')}`
      dates.push(d)
      setDayEvent(d, 0, `E${n}`)
    }
    let steps = 0
    while (lwCanUndo()) { lwUndo(); steps++; if (steps > 200) break }
    // a 60-snapshot stack walks back 59 steps, not all 65 edits
    expect(steps).toBe(59)
    // the very first edit (E0) sits below the floor and is NOT undone — its
    // word is still on the day at the bottom of the stack
    const evAt = (d: string) => getState().period.days.find(x => x.date === d)?.events[0]
    expect(evAt(dates[0])).toBe('E0')
  })
})

describe('undo/redo — full state coverage (every editable surface)', () => {
  it('a day-event word', () => {
    setRole('admin')
    setDayEvent('2026-03-02', 0, 'RANGE WEEK')
    expect(getState().period.days.find(d => d.date === '2026-03-02')!.events[0]).toBe('RANGE WEEK')
    lwUndo()
    expect(getState().period.days.find(d => d.date === '2026-03-02')!.events[0]).toBe('')
  })

  it('an event band add and remove', () => {
    setRole('admin')
    addEventBand(0, '2026-03-02', '2026-03-06', 'DETACHMENT')
    expect(getState().period.bands.length).toBe(1)
    lwUndo()
    expect(getState().period.bands.length).toBe(0)
    lwRedo()
    expect(getState().period.bands.length).toBe(1)
    removeEventBand(0, '2026-03-03')
    expect(getState().period.bands.length).toBe(0)
    lwUndo()
    expect(getState().period.bands.length).toBe(1)
  })

  it('adding and removing an event row', () => {
    setRole('admin')
    const rows0 = getState().eventRows
    addEventRow()
    expect(getState().eventRows).toBe(rows0 + 1)
    lwUndo()
    expect(getState().eventRows).toBe(rows0)
  })

  it('the Show SANS switch', () => {
    setRole('admin')
    const s0 = getState().showSans
    setShowSans(!s0)
    expect(getState().showSans).toBe(!s0)
    lwUndo()
    expect(getState().showSans).toBe(s0)
  })

  it('a roster re-order (Auto-sort)', () => {
    setRole('admin')
    expect(getState().rosterOrder.length).toBe(0)
    autoSortRoster()
    expect(getState().rosterOrder.length).toBeGreaterThan(0)
    lwUndo()
    expect(getState().rosterOrder.length).toBe(0)
  })

  it('saving and deleting a manning counter', () => {
    setRole('admin')
    const rule = { id: 'nvg-pilots', label: 'NVG PILOTS', count: { kind: 'people' as const, filter: { seats: ['pilot' as const], quals: ['nvg'] } }, threshold: { amber: 2, red: 1 } }
    expect(saveManningRule(rule)).toBe(true)
    expect(getState().requirements.default.rules.some(r => r.id === 'nvg-pilots')).toBe(true)
    lwUndo()  // the new counter disappears
    expect(getState().requirements.default.rules.some(r => r.id === 'nvg-pilots')).toBe(false)
    lwRedo()  // and comes back
    expect(getState().requirements.default.rules.some(r => r.id === 'nvg-pilots')).toBe(true)
    deleteManningRule('nvg-pilots')
    expect(getState().requirements.default.rules.some(r => r.id === 'nvg-pilots')).toBe(false)
    lwUndo()  // undelete
    expect(getState().requirements.default.rules.some(r => r.id === 'nvg-pilots')).toBe(true)
  })

  it('the bidding window narrowed, then undone to exactly its prior value', () => {
    setRole('admin')
    const from0 = getState().period.bidFrom   // the seed opens the whole year
    expect(setBidWindow('2026-03-01', '2026-03-31')).toBe('set')
    expect(getState().period.bidFrom).toBe('2026-03-01')
    lwUndo()
    expect(getState().period.bidFrom).toBe(from0)   // restored, not blanked
  })

  it('a stage reopen', () => {
    setRole('admin')
    advanceStage()  // open -> closed
    expect(getState().period.stage).toBe('closed')
    reopenStage()   // closed -> open
    expect(getState().period.stage).toBe('open')
    lwUndo()        // back to closed
    expect(getState().period.stage).toBe('closed')
  })
})

describe('undo/redo — the deliberate exclusions (must NOT corrupt)', () => {
  it('a post-out is NOT undoable, and an undo near it does not disturb it', () => {
    setRole('admin')
    setPostOut('rocky', '2026-06-01')
    const to = getState().people.find(p => p.id === 'rocky')!.to
    expect(to).toBe('2026-05-31')
    // an ordinary edit either side of the post-out
    setCell('ramp', '2026-03-02', 'LL')
    lwUndo()  // reverts the cell only
    expect(codeOf('ramp', '2026-03-02')).toBeUndefined()
    // the post-out is untouched by the undo (people are not in the snapshot)
    expect(getState().people.find(p => p.id === 'rocky')!.to).toBe('2026-05-31')
  })

  it('changing role / viewer / focused day makes no undo step', () => {
    setCell('ramp', '2026-03-02', 'LL')       // one real step
    setRole('admin'); setViewer('rocky'); focusDay('2026-07-01'); setViewer(null)
    // still exactly one step to undo — the view churn added none
    lwUndo()
    expect(codeOf('ramp', '2026-03-02')).toBeUndefined()
    expect(lwCanUndo()).toBe(false)
  })

  it('a Raptor-driven ingest is not an undo step', () => {
    writeInputs(() => INPUTS.push({ person: 'ammo', date: 'Feb 10', endDate: 'Feb 12', allday: true, type: 'LL', remarks: '', mod: '2026-06-01' } as any))
    runInbound()
    expect(codeOf('ammo', '2026-02-10')).toBe('LL')
    expect(lwCanUndo()).toBe(false)   // no step for a change Raptor pushed
  })
})

describe('undo/redo — how it affects the rest (cross-app + engine)', () => {
  it('undoing an approval retracts its Raptor input; redo re-mints it', () => {
    approve('rocky', '2026-02-10')
    runOutbound()
    expect(lwInputs()).toHaveLength(1)
    lwUndo()               // approved -> pending
    runOutbound()
    expect(lwInputs()).toHaveLength(0)
    lwRedo()
    runOutbound()
    expect(lwInputs()).toHaveLength(1)
  })

  it('undoing a MOVE of an approved leave carries the input back to the original day', () => {
    setRole('admin')
    setCell('rocky', '2026-02-10', 'LL')
    advanceStage()                                  // closed
    setBidState('rocky', '2026-02-10', 'approved')
    runOutbound()
    // the approved leave has minted one Raptor input, dated the 10th
    expect(lwInputs()).toHaveLength(1)
    expect(lwInputs()[0].date).toBe('Feb 10')
    // move it 3 days on (a closed-stage management shift, lands pending →
    // outbound retracts the input since a pending bid is not approved leave)
    expect(moveCells([{ personId: 'rocky', date: '2026-02-10' }], 3)).toBe('moved')
    expect(codeOf('rocky', '2026-02-13')).toBe('LL')
    expect(codeOf('rocky', '2026-02-10')).toBeUndefined()
    runOutbound()
    expect(lwInputs()).toHaveLength(0)
    lwUndo()                                        // the move reverses whole
    expect(codeOf('rocky', '2026-02-10')).toBe('LL')
    expect(codeOf('rocky', '2026-02-13')).toBeUndefined()
    // the approval state comes back with it (not left pending)
    expect(stateOf('rocky', '2026-02-10')!.state).toBe('approved')
    // and the input reconverges to the original day
    runOutbound()
    expect(lwInputs()).toHaveLength(1)
    expect(lwInputs()[0].date).toBe('Feb 10')
  })

  it('a closed-stage move records the moved stripe; undo clears it, redo restores it', () => {
    setRole('admin')
    setCell('rocky', '2026-02-10', 'LL')
    advanceStage()
    moveCells([{ personId: 'rocky', date: '2026-02-10' }], 2)
    expect(stateOf('rocky', '2026-02-12')!.shiftedFrom).toBe('2026-02-10')
    lwUndo()
    expect(stateOf('rocky', '2026-02-10')!.shiftedFrom).toBeUndefined()
    lwRedo()
    expect(stateOf('rocky', '2026-02-12')!.shiftedFrom).toBe('2026-02-10')
  })

  it('a Raptor-owned cell survives an undo of an unrelated edit (the reconcile restores it)', () => {
    // Raptor files an input mid-session — inbound lands a raptor-owned cell
    writeInputs(() => INPUTS.push({ person: 'ammo', date: 'Feb 10', endDate: 'Feb 12', allday: true, type: 'LL', remarks: '', mod: '2026-06-01' } as any))
    runInbound()
    expect(stateOf('ammo', '2026-02-10')!.source).toBe('raptor')
    // an unrelated Leave War edit, then undo it
    setCell('ramp', '2026-03-02', 'LL')
    lwUndo()
    // the reconcile (which the live app runs on every notify) re-lands the cell
    runInbound()
    expect(codeOf('ammo', '2026-02-10'), 'the synced cell must not be stranded by an undo').toBe('LL')
    expect(stateOf('ammo', '2026-02-10')!.source).toBe('raptor')
  })

  it('the whole-period manning verdict is byte-identical before an edit and after its undo', () => {
    setRole('admin')
    const dates = getState().period.days.map(d => d.date)
    const verdicts = () => JSON.stringify(evaluatePeriod(getState().people, getState().grid, getState().states, getState().requirements, dates))
    const before = verdicts()
    // approve a spread of leave on one day — enough to move the manning maths
    for (const id of ['ramp', 'rocky', 'dusk', 'ammo']) setCell(id, '2026-02-10', 'LL')
    advanceStage()
    setBidStates(['ramp', 'rocky', 'dusk', 'ammo'].map(id => ({ personId: id, date: '2026-02-10' })), 'approved')
    expect(verdicts(), 'the edit actually moved the manning verdict').not.toBe(before)
    // walk every edit back; the verdict recomputes off the restored grid and matches
    while (lwCanUndo()) lwUndo()
    expect(verdicts()).toBe(before)
  })

  it('undo then repeated reconcile is a fixed point (no oscillation)', () => {
    approve('rocky', '2026-02-10')
    runOutbound()
    lwUndo()
    // run the passes several times — they must converge, not flip the cell
    for (let i = 0; i < 4; i++) { runOutbound(); runInbound() }
    expect(lwInputs()).toHaveLength(0)
    expect(stateOf('rocky', '2026-02-10')!.state).toBe('pending')
  })
})

describe('undo/redo — multiple wars', () => {
  it('switching wars re-baselines: an undo cannot reach back into the war just left', () => {
    setRole('admin')
    expect(createWar('2028', '2028-01-01', '2028-12-31')).toBe('created')
    setCell('ramp', '2026-02-10', 'LL')     // an edit in the 2026 war
    expect(lwCanUndo()).toBe(true)
    const other = getState().wars.find(w => w.period.name === '2028')!.period.id
    selectWar(other)
    expect(lwCanUndo()).toBe(false)          // fresh scope on the 2028 war
    // the 2026 edit is still there (undo never touched it)
    const home = getState().wars.find(w => w.period.name !== '2028')!
    expect(home.grid['ramp']?.['2026-02-10']).toBe('LL')
  })

  it('creating a war is undoable, and undo removes it cleanly (current war stays valid)', () => {
    setRole('admin')
    const n0 = getState().wars.length
    expect(createWar('2029', '2029-01-01', '2029-12-31')).toBe('created')
    expect(getState().wars.length).toBe(n0 + 1)
    lwUndo()
    expect(getState().wars.length).toBe(n0)
    // the store still has a coherent current war
    expect(getState().period).toBeTruthy()
    expect(getState().grid).toBeTruthy()
  })
})
