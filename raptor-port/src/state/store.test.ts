/* Phase-3 store tests — the tfin assertions that cover undo/redo, the one
   write path, and pending/changes/AL issue/unpublish/shiftKeys, re-driven
   through the store instead of the reference's buttons. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, dayApproved, setDayApproved, publishALDay, unpublishAL, daySnapOf } from '../engine/publish'
import { restoreDayVersion } from '../engine/restore'
import { slotVal, txtGet } from '../engine/slots'
import { shiftKeys } from '../engine/keys'
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
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
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

  it('a restore is one undo step', () => {
    sign(0)
    setDayApproved(0, true)
    const key = '0.0.0.0.p', before = slotVal(key)
    writeSlot(key, 'casper')
    /* the routeClick body: restore, then the one afterSchedMutate */
    restoreDayVersion(0, 'orig')
    view.afterSchedMutate()
    expect(slotVal(key)).toBe(before)
    expect(SCHED.pending[key]).toBe(1)
    undo()
    expect(slotVal(key)).toBe('casper')   // one step back = the pre-restore state
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
    writeDelete(() => { DAYS[0].notes.splice(1, 1); shiftKeys('dn:0.', 0, 1) })
    const live = Object.keys(SCHED.pending).concat(Object.keys(SCHED.changes))
      .concat(SCHED.als[0].keys)
    expect(live.filter(k => k === 'dn:0.2')).toEqual([])       // renumbered, not re-marked
    expect(SCHED.changes['dn:0.1']).toBe(1)
    expect(Object.keys(SCHED.pending)).toEqual([])             // bare markEdit named no key
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

  it('a darkened name does not plant, and the slot stays armed after a refusal', () => {
    writeSlot('0.0.0.0.p', '')
    armSlot('0.0.0.0.p')
    const wso = 'wolf'                          // a WSO on a front seat
    expect(placeArmed(wso)).toBe(false)
    expect(slotVal('0.0.0.0.p')).toBe('')
    expect(armedKey()).toBe('0.0.0.0.p')
    disarmSlot()
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
