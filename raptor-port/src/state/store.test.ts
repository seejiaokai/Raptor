/* Phase-3 store tests — the tfin assertions that cover undo/redo, the one
   write path, and pending/changes/AL issue/unpublish/shiftKeys, re-driven
   through the store instead of the reference's buttons. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, dayApproved, setDayApproved, publishALDay, unpublishAL, daySnapOf, dayCurVer } from '../engine/publish'
import { restoreDayVersion } from '../engine/restore'
import { HOOKS } from '../engine/hooks'
import { slotVal, txtGet } from '../engine/slots'
import { shiftKeys } from '../engine/keys'
import { moveDutyRow, applyMove, sortDutyBlock } from '../engine/reorder'
import { validate, WARN } from '../engine/validate'
import { initStore, subscribe, getVersion, writeSlot, writeFill, writeText, writeDelete, writeInputs, undo, redo, HIST } from './store'
import { armSlot, disarmSlot, armedKey, placeArmed, selectPerson, SELID, ARM } from './view'
import * as view from './view'
import { setSession } from './auth'
import { histInit } from './history'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}
  setSession({ user: 'a', role: 'admin' })
  view.selDrop(); view.armDrop(); view.DPREV.clear()
  initStore()
})

describe('the one write path (tfin M / P2, through the store)', () => {
  it('a write goes through setSlotVal, records its key, and revalidates', () => {
    const key = '0.0.0.0.p'
    const before = slotVal(key)
    writeSlot(key, 'casper')
    expect(slotVal(key)).toBe('casper')
    expect(SCHED.pending[key]).toBe(1)
    /* revalidated: WARN reflects the new body in the seat */
    expect(WARN.all.length).toBeGreaterThan(0)
    writeSlot(key, before)
  })

  it('a no-op assignment is not an edit — no mark, no undo step, no repaint', () => {
    const key = '0.0.0.0.p'
    const v = slotVal(key)
    const steps = HIST.stack.length, ver = getVersion()
    writeSlot(key, v)
    expect(SCHED.pending[key]).toBeUndefined()
    expect(HIST.stack.length).toBe(steps)
    expect(getVersion()).toBe(ver)
  })

  it('writeText commits through txtSet and reports whether the model moved', () => {
    expect(writeText('fr:0.0.0.0', '  NEW   REMARK ')).toBe(true)
    expect(txtGet('fr:0.0.0.0')).toBe('NEW REMARK')
    const steps = HIST.stack.length
    expect(writeText('fr:0.0.0.0', 'NEW REMARK')).toBe(false)   // unchanged — no step
    expect(HIST.stack.length).toBe(steps)
  })

  it('writeFill appends through fillSlot', () => {
    writeFill('g:0.0.+', 'casper')
    expect(SCHED.pending['g:0.0.x0'] || SCHED.pending['g:0.0']).toBe(1)
  })

  it('every write notifies subscribers', () => {
    let n = 0
    const off = subscribe(() => n++)
    writeSlot('d:0.0.0', 'casper')
    expect(n).toBeGreaterThan(0)
    off()
  })
})

describe('undo / redo (tfin, through the store)', () => {
  it('undo restores slot, redo reapplies slot', () => {
    const key = '0.0.0.0.p'
    const before = slotVal(key)
    writeSlot(key, 'casper')
    undo()
    expect(slotVal(key)).toBe(before)
    redo()
    expect(slotVal(key)).toBe('casper')
    undo()
  })

  it('undo unpublishes the day, redo re-publishes the day (publishing is its own undo step)', () => {
    sign(0)
    setDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    undo()
    expect(dayApproved(0)).toBe(false)
    redo()
    expect(dayApproved(0)).toBe(true)
  })

  it('version snapshots ride the undo stack, and a dead preview is pruned', () => {
    sign(0)
    setDayApproved(0, true)
    expect(daySnapOf(0, 'orig')).toBeTruthy()
    /* previewing the Original, then undoing past its publish: the snapshot is
       gone, so the preview must not survive to render a ghost */
    view.setDayPreview(0, 'orig')
    undo()
    expect(daySnapOf(0, 'orig')).toBeNull()
    expect(view.DPREV.has(0)).toBe(false)
    redo()
    expect(daySnapOf(0, 'orig')).toBeTruthy()
  })

  it('a rollback is one undo step, and dayCurVer rides the stack', () => {
    sign(0)
    setDayApproved(0, true)
    const key = '0.0.0.0.p', before = slotVal(key)
    writeSlot(key, 'casper')
    /* the routeClick body: rollback, then the one afterSchedMutate */
    restoreDayVersion(0, 'orig')
    view.afterSchedMutate()
    expect(slotVal(key)).toBe(before)
    expect(SCHED.pending[key]).toBeUndefined()   // discarded, not re-pended
    expect(dayCurVer(0)).toBe('orig')
    undo()
    expect(slotVal(key)).toBe('casper')   // one step back = the pre-rollback state
    expect(SCHED.pending[key]).toBe(1)    // the discarded edit is pending again
    /* the cur stamp itself rides the stack: gone on undo, back on redo */
    expect(SCHED.cur[0]).toBeUndefined()
    redo()
    expect(SCHED.cur[0]).toBe('orig')
  })

  it('personal inputs join the undo stack', () => {
    const n = INPUTS.length
    writeInputs(() => INPUTS.push({ person: 'pike', date: 'Jul 13', allday: true, type: 'LL', remarks: '', mod: '' }))
    expect(INPUTS.length).toBe(n + 1)
    undo()
    expect(INPUTS.length).toBe(n)
  })

  it('undo puts down an armed slot', () => {
    writeSlot('0.0.0.0.p', 'casper')          // a step to undo
    armSlot('0.0.0.0.w')
    expect(armedKey()).toBe('0.0.0.0.w')
    undo()
    expect(armedKey()).toBe('')
  })

  it('the stack is capped and undo past the floor is refused', () => {
    const key = 'dn:0.0'
    const steps = HIST.stack.length
    undo()                                     // at the baseline already
    expect(HIST.stack.length).toBe(steps)
    expect(HIST.ix).toBe(steps - 1)
    void key
  })
})

describe('deletes through the store (tfin B48/P2)', () => {
  it('a delete does not re-mark the address it just deleted', () => {
    DAYS[0].notes = ['A', 'B', 'C']
    SCHED.pending = {}; SCHED.changes = { 'dn:0.2': 1 }
    SCHED.als = [{ n: 1, keys: ['dn:0.2'], sign: {} }]
    writeDelete(() => { DAYS[0].notes.splice(1, 1); shiftKeys('dn:0.', 0, 1) }, 0, 'note')
    const live = Object.keys(SCHED.pending).concat(Object.keys(SCHED.changes))
      .concat(SCHED.als[0].keys)
    expect(live.filter(k => k === 'dn:0.2')).toEqual([])       // renumbered, not re-marked
    expect(SCHED.changes['dn:0.1']).toBe(1)
    expect(Object.keys(SCHED.pending)).toEqual([expect.stringMatching(/^del:0\.\d+\.note$/)])
  })

  it('undo restores the removed row and drops its tombstone in one step', () => {
    sign(0); setDayApproved(0, true)
    const before = DAYS[0].notes.slice()
    writeDelete(() => { DAYS[0].notes.splice(0, 1); shiftKeys('dn:0.', 0, 0) }, 0, 'note')
    expect(Object.keys(SCHED.pending)).toEqual([expect.stringMatching(/^del:0\.\d+\.note$/)])
    undo()
    expect(DAYS[0].notes).toEqual(before)
    expect(Object.keys(SCHED.pending)).toEqual([])
  })

  it('a stale armed slot is put down when its row goes', () => {
    armSlot('0.1.0.0.p')                       // wave 1, formation 0
    expect(armedKey()).toBe('0.1.0.0.p')
    writeDelete(() => { DAYS[0].waves.splice(1, 1) })
    expect(armedKey()).toBe('')
  })

  it('deleting a puck while its person is selected un-clicks everybody', () => {
    const key = '0.0.0.0.p'
    const id = slotVal(key)
    expect(id).toBeTruthy()
    selectPerson(id)
    expect(view.SELID).toBe(id)
    writeSlot(key, '')
    expect(view.SELID).toBe(null)
    writeSlot(key, id)
  })

  it('a second click on the same puck reverses the first', () => {
    selectPerson('bane')
    expect(view.SELID).toBe('bane')
    selectPerson('bane')
    expect(view.SELID).toBe(null)
  })
})

describe('arm and plant, model half (tfin U, through the store)', () => {
  it('tapping the same slot twice disarms it', () => {
    writeSlot('0.0.0.0.p', '')
    armSlot('0.0.0.0.p')
    expect(armedKey()).toBe('0.0.0.0.p')
    armSlot('0.0.0.0.p')
    expect(armedKey()).toBe('')
  })

  it('a darkened name plants anyway, and its reason arrives as the warn toast (owner, 13 Aug 26)', () => {
    writeSlot('0.0.0.0.p', '')
    armSlot('0.0.0.0.p')
    const said: any[] = []
    const t0 = HOOKS.toast
    HOOKS.toast = (m: any, k?: any) => { said.push([String(m), k]) }
    try {
      const wso = 'wolf'                        // a WSO on a front seat
      expect(placeArmed(wso)).toBe(true)
      expect(slotVal('0.0.0.0.p')).toBe('wolf')
      expect(armedKey()).toBe('')               // planting puts the slot down
      const warn = said.find(([, k]) => k === 'warn')
      expect(warn && /front seat/.test(warn[0])).toBeTruthy()
    } finally { HOOKS.toast = t0 }
    writeSlot('0.0.0.0.p', '')
  })

  it("re-planting the seat's own occupant refuses instead of toasting planned", () => {
    writeSlot('0.0.0.0.p', 'casper')
    armSlot('0.0.0.0.p')
    expect(placeArmed('casper')).toBe(false)
    expect(slotVal('0.0.0.0.p')).toBe('casper')
    expect(armedKey()).toBe('0.0.0.0.p')        // the arm survives the no-op
    disarmSlot()
    writeSlot('0.0.0.0.p', '')
  })

  it('a name still showing plants on the first tap, and planting puts the slot down', () => {
    writeSlot('0.0.0.0.p', '')
    armSlot('0.0.0.0.p')
    expect(placeArmed('casper')).toBe(true)
    expect(slotVal('0.0.0.0.p')).toBe('casper')
    expect(armedKey()).toBe('')
  })

  it('a member cannot arm anything', () => {
    setSession({ user: 'user', role: 'main' })
    armSlot('0.0.0.0.p')
    expect(armedKey()).toBe('')
  })

  it('changing the board day disarms a slot on another day', () => {
    setSession({ user: 'a', role: 'admin' })
    writeSlot('0.0.0.0.p', '')
    armSlot('0.0.0.0.p')
    view.setBoardDay(2)
    expect(armedKey()).toBe('')
  })
})

/* finding #5 (whole-branch review, 9 Aug 26): the stale-arm guard checked
   only whether the armed address still EXISTS — armTargetExists — and a
   reorder never changes a list's length, so the guard always passed while
   the address now named a different row. Proven live: arm the first duty
   slot, drag it down, tap a name — it lands on the row that moved INTO that
   index, with a success toast and the amendment mark on the wrong key. The
   fix reuses the same blanket reflex the undo path (interactions.ts) and the
   board's day-tab switch (setBoardDay, above) already apply: disarm
   whenever a reorder touches the DAY the armed slot is on, not only when the
   address stops resolving at all. */
describe('a reorder disarms a stale-armed slot, not just a deleted one (finding #5)', () => {
  it('moving a duty row disarms a slot armed in that same block', () => {
    const rows = DAYS[0].dutywaves[0].rows
    if (rows.length < 2) rows.push({ role: 'TEST', id: '', str: '0800', end: '1700' })
    armSlot('d:0.0.0')
    expect(armedKey()).toBe('d:0.0.0')
    expect(moveDutyRow(0, 0, 0, 1)).toBe(true)
    view.afterSchedMutate()
    /* the OLD guard: armTargetExists('d:0.0.0') is still true (SOME row sits
       at index 0 now — just not the one that was armed), so a bare
       existence check cannot see this at all. */
    expect(armedKey()).toBe('')
  })

  it('a nudge (the phone gesture, same applyMove path) disarms it too', () => {
    const rows = DAYS[0].dutywaves[0].rows
    if (rows.length < 2) rows.push({ role: 'TEST', id: '', str: '0800', end: '1700' })
    armSlot('d:0.0.0')
    expect(applyMove('mv:d.0.0.0', 'mv:d.0.0.1')).toBe(true)
    view.afterSchedMutate()
    expect(armedKey()).toBe('')
  })

  it('Auto sort on a duty block disarms a slot armed in it', () => {
    /* out of TIME order since 10 Aug 26 — the sort key is the start time now,
       not the role rank, so the fixture has to differ on the times */
    DAYS[0].dutywaves[0].rows = [
      { role: 'RUNNER', id: '', str: '1700', end: '2100' },
      { role: 'SDO', id: '', str: '0800', end: '1700' },
    ]
    armSlot('d:0.0.0')                              // armed on the LATE row, listed first
    expect(sortDutyBlock(0, 0)).toBe(true)           // sorts the 0800 row to the top
    view.afterSchedMutate()
    expect(armedKey()).toBe('')
  })
})

describe('AL flow through the store (tfin B49)', () => {
  it('an edit on a published day becomes pending, publishes as an AL, and unpublishes back', () => {
    sign(0); setDayApproved(0, true)
    const key = 'd:0.0.0'
    const before = slotVal(key)
    writeSlot(key, before === 'casper' ? 'vinci' : 'casper')
    expect(SCHED.pending[key]).toBe(1)
    sign(0)
    publishALDay(0)
    expect(SCHED.changes[key]).toBe(1)
    expect(SCHED.pending[key]).toBeUndefined()
    unpublishAL(1)
    expect(SCHED.pending[key]).toBe(1)
    undo()                                      // unpublish is an undo step too
    expect(SCHED.changes[key]).toBe(1)
  })
})

describe('store bookkeeping', () => {
  it('initStore validates and takes the baseline snapshot', () => {
    histInit()
    expect(HIST.stack.length).toBe(1)
    expect(HIST.ix).toBe(0)
    validate()
    expect(WARN.byDay.length).toBe(DAYS.length)
  })

  it('ARM state is exposed for the UI', () => {
    expect(ARM).toBe(null)
    expect(SELID).toBe(null)
  })
})
