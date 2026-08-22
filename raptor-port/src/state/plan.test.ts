import { describe, it, expect, beforeEach } from 'vitest'
import { setSession } from './auth'
import { PLANPUCKS, DAYRMK, setDayRemark, addPlanPuck, editPlanPuck, movePlanPuck, removePlanPuck, clearPlan } from './plan'
import { INPVIEW, CALMONTH, setInpView, setCalMonth } from './view'
import { undo, redo, histInit, HIST, histApply, resetSession, writeInputs } from './store'
import { histSnap } from './history'

/* The Inputs-calendar's planning layer (state/plan.ts) — a scratch pad, not
   schedule data, so these tests pin the same three things every other
   session-only view store in this app is checked against: the admin gate at
   the write path, an undo/redo round trip, and resetSession forgetting it. */
beforeEach(() => {
  setSession({ user: 'a', role: 'admin' })
  clearPlan()
  setInpView('table')
  setCalMonth(null)
})

describe('the write-path gate (canEditSched)', () => {
  it('a member session is refused by every mutator, and nothing changes', () => {
    addPlanPuck('2026-08-24', 'seed') // as admin, so there is something a member could wrongly touch
    setSession({ user: 'user', role: 'main' })
    const id = PLANPUCKS[0].id

    expect(setDayRemark('2026-08-24', 'x')).toBe(false)
    expect(addPlanPuck('2026-08-25', 'x')).toBe(false)
    expect(editPlanPuck(id, 'x')).toBe(false)
    expect(movePlanPuck(id, '2026-08-26')).toBe(false)
    expect(removePlanPuck(id)).toBe(false)

    expect(PLANPUCKS.length).toBe(1)
    expect(PLANPUCKS[0].text).toBe('seed')          // untouched
    expect(Object.keys(DAYRMK).length).toBe(0)
  })

  it('an admin session may use every mutator', () => {
    expect(addPlanPuck('2026-08-24', '  brief the new guy  ')).toBe(true)
    const id = PLANPUCKS[0].id
    expect(PLANPUCKS[0].text).toBe('brief the new guy')   // trimmed
    expect(editPlanPuck(id, 'brief the new guy at 0800')).toBe(true)
    expect(movePlanPuck(id, '2026-08-25')).toBe(true)
    expect(PLANPUCKS[0].date).toBe('2026-08-25')
    expect(setDayRemark('2026-08-25', 'short week')).toBe(true)
    expect(removePlanPuck(id)).toBe(true)
    expect(PLANPUCKS.length).toBe(0)
  })
})

describe('setDayRemark / addPlanPuck refuse blank text', () => {
  it('setDayRemark deletes the key rather than storing an empty string', () => {
    expect(setDayRemark('2026-08-24', '  hello  ')).toBe(true)
    expect(DAYRMK['2026-08-24']).toBe('hello')
    expect(setDayRemark('2026-08-24', '   ')).toBe(true)   // blanking it out is a real change
    expect(Object.prototype.hasOwnProperty.call(DAYRMK, '2026-08-24')).toBe(false)
    /* blanking a day that never had a remark is a no-op, not a change */
    expect(setDayRemark('2026-08-26', '   ')).toBe(false)
  })

  it('addPlanPuck refuses an empty/whitespace-only puck', () => {
    expect(addPlanPuck('2026-08-24', '   ')).toBe(false)
    expect(PLANPUCKS.length).toBe(0)
  })

  it('editPlanPuck refuses to empty out a puck — delete is removePlanPuck\'s job', () => {
    addPlanPuck('2026-08-24', 'brief')
    const id = PLANPUCKS[0].id
    expect(editPlanPuck(id, '   ')).toBe(false)
    expect(PLANPUCKS[0].text).toBe('brief')
  })
})

describe('undo / redo (state/history.ts riding the ordinary snapshot)', () => {
  it('undo walks back a puck add and a day remark, one step per writeInputs call', () => {
    histInit()   // baseline: PLANPUCKS/DAYRMK both empty (cleared in beforeEach)
    writeInputs(() => addPlanPuck('2026-08-24', 'brief the new guy'))
    writeInputs(() => setDayRemark('2026-08-24', 'short week'))

    expect(PLANPUCKS.length).toBe(1)
    expect(DAYRMK['2026-08-24']).toBe('short week')

    undo()   // back over the remark
    expect(DAYRMK['2026-08-24']).toBeUndefined()
    expect(PLANPUCKS.length).toBe(1)   // the puck add is its own, earlier step

    undo()   // back over the add
    expect(PLANPUCKS.length).toBe(0)

    redo()   // forward over the add
    expect(PLANPUCKS.length).toBe(1)
    expect(DAYRMK['2026-08-24']).toBeUndefined()

    redo()   // forward over the remark
    expect(DAYRMK['2026-08-24']).toBe('short week')
  })
})

describe('resetSession forgets the planning layer', () => {
  it('an admin plans a month, logs out — the next session opens on a clean calendar', () => {
    addPlanPuck('2026-08-24', 'brief the new guy')
    setDayRemark('2026-08-24', 'short week')
    setInpView('cal')
    setCalMonth({ y: 2026, m: 8 })

    resetSession(null)                              // logout
    resetSession({ user: 'user', role: 'main' })     // next login, same tab

    expect(PLANPUCKS.length).toBe(0)
    expect(Object.keys(DAYRMK).length).toBe(0)
    expect(INPVIEW).toBe('table')
    expect(CALMONTH).toBe(null)
  })
})

describe('an older snapshot without pp/dm (pre-dates this feature)', () => {
  it('restores both stores to empty rather than throwing', () => {
    histInit()                                  // fresh baseline, pp/dm both empty
    addPlanPuck('2026-08-24', 'brief')          // populate directly, not through history
    expect(PLANPUCKS.length).toBe(1)

    const raw = JSON.parse(histSnap())
    delete raw.pp
    delete raw.dm
    HIST.stack.push(JSON.stringify(raw))
    const i = HIST.stack.length - 1

    expect(() => histApply(i)).not.toThrow()
    expect(PLANPUCKS.length).toBe(0)
    expect(Object.keys(DAYRMK).length).toBe(0)
  })
})
