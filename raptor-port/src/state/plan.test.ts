import { describe, it, expect, beforeEach } from 'vitest'
import { setSession } from './auth'
import { PLANPUCKS, DAYRMK, setDayRemark, addPlanPuck, editPlanPuck, movePlanPuck, removePlanPuck, clearPlan, addPuckRow, addPuckPeople, togglePuckPerson, movePlanSection } from './plan'
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

describe('the pucks-row sections (owner, 22 Aug 26)', () => {
  it('addPuckRow appends an empty pucks section; togglePuckPerson adds, then removal leaves a GAP', () => {
    expect(addPuckRow('2026-08-24')).toBe(true)
    const sec = PLANPUCKS[PLANPUCKS.length - 1]
    expect(sec.kind).toBe('pucks')
    expect(sec.ids).toEqual([])

    expect(togglePuckPerson(sec.id, 'bane')).toBe(true)
    expect(sec.ids).toEqual(['bane'])
    expect(togglePuckPerson(sec.id, 'yeti')).toBe(true)
    expect(sec.ids).toEqual(['bane', 'yeti'])
    /* removing a NON-last person blanks its slot so the survivors keep their
       grid positions (owner, 24 Aug 26) — the gap stays, it does not close */
    expect(togglePuckPerson(sec.id, 'bane')).toBe(true)
    expect(sec.ids).toEqual(['', 'yeti'])
    /* removing the last real person trims the now-trailing blanks — row empties */
    expect(togglePuckPerson(sec.id, 'yeti')).toBe(true)
    expect(sec.ids).toEqual([])
  })

  it('togglePuckPerson keeps an internal gap but trims a trailing one', () => {
    addPuckRow('2026-08-24', ['bane', 'yeti', 'vinci'])
    const sec = PLANPUCKS[PLANPUCKS.length - 1]
    expect(togglePuckPerson(sec.id, 'yeti')).toBe(true)     // middle → gap kept
    expect(sec.ids).toEqual(['bane', '', 'vinci'])
    expect(togglePuckPerson(sec.id, 'vinci')).toBe(true)    // now-last → trailing blanks trimmed
    expect(sec.ids).toEqual(['bane'])
  })

  /* the multi-select picker (owner, 23 Aug 26) lands a whole batch at once —
     addPuckRow may carry an initial roster, and addPuckPeople tops up an
     existing row. Both dedupe: the picker's category buttons can pick the same
     person twice, and re-adding an already-seated person must be a no-op. */
  it('addPuckRow can seed a row from the picker, deduping the ids', () => {
    expect(addPuckRow('2026-08-24', ['bane', 'yeti', 'bane'])).toBe(true)
    const sec = PLANPUCKS[PLANPUCKS.length - 1]
    expect(sec.kind).toBe('pucks')
    expect(sec.ids).toEqual(['bane', 'yeti'])
  })

  it('addPuckPeople adds only the not-yet-seated, and reports whether anything landed', () => {
    addPuckRow('2026-08-24', ['bane'])
    const sec = PLANPUCKS[PLANPUCKS.length - 1]
    expect(addPuckPeople(sec.id, ['yeti', 'bane', 'vinci'])).toBe(true)  // bane already on → skipped
    expect(sec.ids).toEqual(['bane', 'yeti', 'vinci'])
    expect(addPuckPeople(sec.id, ['yeti', 'vinci'])).toBe(false)         // all present → no-op
    expect(sec.ids).toEqual(['bane', 'yeti', 'vinci'])
    expect(addPuckPeople('no-such-row', ['bane'])).toBe(false)
  })

  it('togglePuckPerson refuses a note section and an empty person', () => {
    addPlanPuck('2026-08-24', 'a note')
    const note = PLANPUCKS[0]
    expect(togglePuckPerson(note.id, 'bane')).toBe(false)
    addPuckRow('2026-08-24')
    const sec = PLANPUCKS[PLANPUCKS.length - 1]
    expect(togglePuckPerson(sec.id, '')).toBe(false)
  })

  it('a member is refused by all three new mutators', () => {
    addPuckRow('2026-08-24')
    const sec = PLANPUCKS[PLANPUCKS.length - 1]
    setSession({ user: 'user', role: 'main' })
    expect(addPuckRow('2026-08-25')).toBe(false)
    expect(addPuckPeople(sec.id, ['bane'])).toBe(false)
    expect(togglePuckPerson(sec.id, 'bane')).toBe(false)
    expect(movePlanSection(sec.id, null)).toBe(false)
  })

  it('movePlanSection reorders within one day and refuses a cross-day target', () => {
    /* three sections on one day (note, note, pucks), one on another */
    addPlanPuck('2026-08-24', 'first')   // unshifts
    addPlanPuck('2026-08-24', 'second')  // unshifts above it
    addPuckRow('2026-08-24')             // appends
    addPlanPuck('2026-08-25', 'other day')
    const day = () => PLANPUCKS.filter((p: any) => p.date === '2026-08-24').map((p: any) => p.text || p.kind)
    expect(day()).toEqual(['second', 'first', 'pucks'])

    const pucksSec = PLANPUCKS.find((p: any) => p.kind === 'pucks')
    const firstSec = PLANPUCKS.find((p: any) => p.text === 'first')
    const otherSec = PLANPUCKS.find((p: any) => p.text === 'other day')

    /* pucks row to the TOP (before 'second') */
    const secondSec = PLANPUCKS.find((p: any) => p.text === 'second')
    expect(movePlanSection(pucksSec.id, secondSec.id)).toBe(true)
    expect(day()).toEqual(['pucks', 'second', 'first'])

    /* 'second' to the END (beforeId null) */
    expect(movePlanSection(secondSec.id, null)).toBe(true)
    expect(day()).toEqual(['pucks', 'first', 'second'])

    /* a cross-day target is refused, and nothing moves */
    expect(movePlanSection(firstSec.id, otherSec.id)).toBe(false)
    expect(day()).toEqual(['pucks', 'first', 'second'])

    /* before itself / already-in-place are no-ops */
    expect(movePlanSection(firstSec.id, firstSec.id)).toBe(false)
    expect(movePlanSection(pucksSec.id, firstSec.id)).toBe(false) // already directly before it
    expect(day()).toEqual(['pucks', 'first', 'second'])

    /* the other day's own run was never disturbed */
    expect(PLANPUCKS.filter((p: any) => p.date === '2026-08-25').length).toBe(1)
  })

  it('a pucks row rides the undo snapshot like every other planning write', () => {
    histInit()
    writeInputs(() => addPuckRow('2026-08-24'))
    const sec = PLANPUCKS[PLANPUCKS.length - 1]
    writeInputs(() => togglePuckPerson(sec.id, 'bane'))
    expect(PLANPUCKS.find((p: any) => p.kind === 'pucks')!.ids).toEqual(['bane'])
    undo()
    expect(PLANPUCKS.find((p: any) => p.kind === 'pucks')!.ids).toEqual([])
    undo()
    expect(PLANPUCKS.find((p: any) => p.kind === 'pucks')).toBeUndefined()
    redo(); redo()
    expect(PLANPUCKS.find((p: any) => p.kind === 'pucks')!.ids).toEqual(['bane'])
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
